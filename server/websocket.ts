import { WebSocketServer, WebSocket } from 'ws';
import type { Server, IncomingMessage } from 'http';
import { storage } from './storage';
import { sessionStore } from './replitAuth';
import cookie from 'cookie';
import cookieSignature from 'cookie-signature';

interface WebSocketMessage {
  type: 'message' | 'join' | 'leave' | 'typing' | 'read' | 'subscribe_notifications' | 'unsubscribe_notifications';
  channelId?: string;
  content?: string;
  messageId?: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  userRole?: string;
  channels: Set<string>;
  subscribedToNotifications: boolean;
  isAlive: boolean;
}

// Channel-based clients for chat
const clients = new Map<string, Set<AuthenticatedWebSocket>>();

// Global user clients for notifications (userId -> Set of connections)
const userClients = new Map<string, Set<AuthenticatedWebSocket>>();

// All connected clients for broadcast
const allClients = new Set<AuthenticatedWebSocket>();

interface SessionInfo {
  userId: string | null;
  userRole: string | null;
}

async function getSessionInfo(req: IncomingMessage): Promise<SessionInfo> {
  return new Promise((resolve) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || '');
      const sessionCookie = cookies['connect.sid'];

      if (!sessionCookie) {
        resolve({ userId: null, userRole: null });
        return;
      }

      const secret = process.env.SESSION_SECRET;
      if (!secret) {
        console.error('SESSION_SECRET not configured');
        resolve({ userId: null, userRole: null });
        return;
      }

      if (!sessionCookie.startsWith('s:')) {
        resolve({ userId: null, userRole: null });
        return;
      }

      const signedValue = sessionCookie.slice(2);
      const sessionId = cookieSignature.unsign(signedValue, secret);

      if (sessionId === false) {
        console.error('Invalid session signature');
        resolve({ userId: null, userRole: null });
        return;
      }

      sessionStore.get(sessionId, (err, sessionData: any) => {
        if (err) {
          console.error('Session lookup error:', err);
          resolve({ userId: null, userRole: null });
          return;
        }

        if (!sessionData) {
          resolve({ userId: null, userRole: null });
          return;
        }

        const userId = sessionData?.passport?.user?.claims?.sub;
        const userRole = sessionData?.passport?.user?.claims?.metadata?.role || 'consultant';
        resolve({ userId: userId || null, userRole });
      });
    } catch (error) {
      console.error('Session validation error:', error);
      resolve({ userId: null, userRole: null });
    }
  });
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    verifyClient: async (info, callback) => {
      const sessionInfo = await getSessionInfo(info.req);
      if (!sessionInfo.userId) {
        callback(false, 401, 'Unauthorized');
        return;
      }
      (info.req as any).userId = sessionInfo.userId;
      (info.req as any).userRole = sessionInfo.userRole;
      callback(true);
    }
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = ws as AuthenticatedWebSocket;
      if (!client.isAlive) {
        client.channels.forEach(channelId => {
          const channelClients = clients.get(channelId);
          if (channelClients) {
            channelClients.delete(client);
          }
        });
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const client = ws as AuthenticatedWebSocket;
    client.channels = new Set();
    client.isAlive = true;
    client.subscribedToNotifications = false;
    client.userId = (req as any).userId;
    client.userRole = (req as any).userRole;

    // Track client globally
    allClients.add(client);
    if (client.userId) {
      if (!userClients.has(client.userId)) {
        userClients.set(client.userId, new Set());
      }
      userClients.get(client.userId)!.add(client);
    }

    client.send(JSON.stringify({
      type: 'authenticated',
      userId: client.userId
    }));

    client.on('pong', () => {
      client.isAlive = true;
    });

    client.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;

        if (!client.userId) {
          client.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
          return;
        }

        switch (message.type) {
          case 'join':
            if (message.channelId) {
              const isMember = await storage.isChannelMember(message.channelId, client.userId);
              if (!isMember) {
                client.send(JSON.stringify({ type: 'error', message: 'Not a channel member' }));
                return;
              }

              client.channels.add(message.channelId);
              if (!clients.has(message.channelId)) {
                clients.set(message.channelId, new Set());
              }
              clients.get(message.channelId)!.add(client);

              broadcastToChannel(message.channelId, {
                type: 'user_joined',
                channelId: message.channelId,
                userId: client.userId,
              }, client);
            }
            break;

          case 'leave':
            if (message.channelId) {
              client.channels.delete(message.channelId);
              const channelClients = clients.get(message.channelId);
              if (channelClients) {
                channelClients.delete(client);
              }
              
              broadcastToChannel(message.channelId, {
                type: 'user_left',
                channelId: message.channelId,
                userId: client.userId,
              }, client);
            }
            break;

          case 'message':
            if (message.channelId && message.content) {
              const channel = await storage.getChatChannel(message.channelId);
              if (channel?.quietHoursEnabled) {
                const now = new Date();
                const hours = now.getHours();
                const startHour = parseInt(channel.quietHoursStart?.split(':')[0] || '19');
                const endHour = parseInt(channel.quietHoursEnd?.split(':')[0] || '7');
                
                const isQuietHours = startHour > endHour 
                  ? (hours >= startHour || hours < endHour)
                  : (hours >= startHour && hours < endHour);
                
                if (isQuietHours) {
                  client.send(JSON.stringify({ 
                    type: 'warning', 
                    message: 'Quiet hours are active. Your message was still sent but notifications are muted.' 
                  }));
                }
              }

              const savedMessage = await storage.createChatMessage({
                channelId: message.channelId,
                senderId: client.userId,
                content: message.content,
                messageType: 'text',
              });

              const sender = await storage.getUser(client.userId);

              broadcastToChannel(message.channelId, {
                type: 'new_message',
                channelId: message.channelId,
                message: {
                  ...savedMessage,
                  sender: {
                    id: sender?.id || client.userId,
                    firstName: sender?.firstName || null,
                    lastName: sender?.lastName || null,
                    profileImageUrl: sender?.profileImageUrl || null,
                  },
                },
              });
            }
            break;

          case 'typing':
            if (message.channelId) {
              broadcastToChannel(message.channelId, {
                type: 'user_typing',
                channelId: message.channelId,
                userId: client.userId,
              }, client);
            }
            break;

          case 'read':
            if (message.channelId && message.messageId) {
              await storage.markMessageRead({
                messageId: message.messageId,
                userId: client.userId,
              });

              const members = await storage.getChannelMembers(message.channelId);
              const member = members.find(m => m.userId === client.userId);
              if (member) {
                await storage.updateChannelMember(member.id, {
                  lastReadAt: new Date(),
                });
              }
            }
            break;

          case 'subscribe_notifications':
            client.subscribedToNotifications = true;
            // Send initial notification counts
            const counts = await getNotificationCountsForUser(client.userId, client.userRole || 'consultant');
            client.send(JSON.stringify({
              type: 'notification_counts',
              counts
            }));
            break;

          case 'unsubscribe_notifications':
            client.subscribedToNotifications = false;
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        client.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
      }
    });

    client.on('close', () => {
      // Remove from global tracking
      allClients.delete(client);
      if (client.userId) {
        const userClientSet = userClients.get(client.userId);
        if (userClientSet) {
          userClientSet.delete(client);
          if (userClientSet.size === 0) {
            userClients.delete(client.userId);
          }
        }
      }

      // Remove from channel tracking
      client.channels.forEach(channelId => {
        const channelClients = clients.get(channelId);
        if (channelClients) {
          channelClients.delete(client);

          broadcastToChannel(channelId, {
            type: 'user_left',
            channelId,
            userId: client.userId,
          });
        }
      });
    });

    client.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log('WebSocket server initialized on /ws');
  return wss;
}

function broadcastToChannel(channelId: string, message: object, exclude?: AuthenticatedWebSocket) {
  const channelClients = clients.get(channelId);
  if (!channelClients) return;

  const payload = JSON.stringify(message);
  channelClients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

export function getOnlineUsers(channelId: string): string[] {
  const channelClients = clients.get(channelId);
  if (!channelClients) return [];

  const onlineUsers: string[] = [];
  channelClients.forEach(client => {
    if (client.userId && client.readyState === WebSocket.OPEN) {
      onlineUsers.push(client.userId);
    }
  });
  return Array.from(new Set(onlineUsers));
}

// Get notification counts for a specific user based on their role
async function getNotificationCountsForUser(userId: string, userRole: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  try {
    // Get pending shift swap requests
    if (userRole === 'admin' || userRole === 'consultant') {
      const pendingSwaps = await storage.getPendingSwapRequests();
      if (userRole === 'admin') {
        counts['shift-swaps'] = pendingSwaps.length;
      } else {
        const consultant = await storage.getConsultantByUserId(userId);
        if (consultant) {
          counts['shift-swaps'] = pendingSwaps.filter(
            s => s.requesterId === consultant.id || s.targetConsultantId === consultant.id
          ).length;
        }
      }
    }

    // Get open support tickets
    const allTickets = await storage.getAllSupportTickets();
    const openTickets = allTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
    if (userRole === 'admin') {
      counts['tickets'] = openTickets.length;
    } else {
      counts['tickets'] = openTickets.filter(
        t => t.reportedById === userId || t.assignedToId === userId
      ).length;
    }

    // Get pending invitations (admin only)
    if (userRole === 'admin') {
      const pendingInvitations = await storage.getInvitationsByStatus('pending');
      counts['invitations'] = pendingInvitations.length;
    }

    // Get pending timesheets (admin/leadership)
    if (userRole === 'admin' || userRole === 'hospital_leadership') {
      const timesheets = await storage.getAllTimesheets();
      counts['timesheets'] = timesheets.filter(t => t.status === 'submitted').length;
    }
  } catch (error) {
    console.error('Error getting notification counts:', error);
  }

  return counts;
}

// Broadcast notification count updates to all subscribed clients
export async function broadcastNotificationUpdate(affectedTypes?: string[]) {
  const updatePromises: Promise<void>[] = [];

  allClients.forEach(client => {
    if (client.subscribedToNotifications && client.userId && client.readyState === WebSocket.OPEN) {
      const promise = (async () => {
        try {
          const counts = await getNotificationCountsForUser(client.userId!, client.userRole || 'consultant');
          client.send(JSON.stringify({
            type: 'notification_counts',
            counts,
            affectedTypes
          }));
        } catch (error) {
          console.error('Error broadcasting notification update:', error);
        }
      })();
      updatePromises.push(promise);
    }
  });

  await Promise.all(updatePromises);
}

// Broadcast to specific user(s)
export async function broadcastNotificationUpdateToUsers(userIds: string[], affectedTypes?: string[]) {
  const updatePromises: Promise<void>[] = [];

  userIds.forEach(userId => {
    const userClientSet = userClients.get(userId);
    if (userClientSet) {
      userClientSet.forEach(client => {
        if (client.subscribedToNotifications && client.readyState === WebSocket.OPEN) {
          const promise = (async () => {
            try {
              const counts = await getNotificationCountsForUser(userId, client.userRole || 'consultant');
              client.send(JSON.stringify({
                type: 'notification_counts',
                counts,
                affectedTypes
              }));
            } catch (error) {
              console.error('Error broadcasting notification update to user:', error);
            }
          })();
          updatePromises.push(promise);
        }
      });
    }
  });

  await Promise.all(updatePromises);
}
