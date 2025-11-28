import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';

interface ChatMessage {
  type: 'message' | 'join' | 'leave' | 'typing' | 'read' | 'auth';
  channelId?: string;
  userId?: string;
  content?: string;
  messageId?: string;
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  channels: Set<string>;
  isAlive: boolean;
}

const clients = new Map<string, Set<AuthenticatedWebSocket>>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Heartbeat to detect stale connections
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

  wss.on('connection', (ws: WebSocket) => {
    const client = ws as AuthenticatedWebSocket;
    client.channels = new Set();
    client.isAlive = true;

    client.on('pong', () => {
      client.isAlive = true;
    });

    client.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as ChatMessage & { token?: string };

        // Handle authentication
        if (message.type === 'auth' && message.userId) {
          client.userId = message.userId;
          client.send(JSON.stringify({ type: 'authenticated', userId: message.userId }));
          return;
        }

        if (!client.userId) {
          client.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
          return;
        }

        switch (message.type) {
          case 'join':
            if (message.channelId) {
              // Verify user is a member of the channel
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

              // Notify others
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
              // Check quiet hours
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

              // Save message to database
              const savedMessage = await storage.createChatMessage({
                channelId: message.channelId,
                senderId: client.userId,
                content: message.content,
                messageType: 'text',
              });

              // Get sender info
              const sender = await storage.getUser(client.userId);

              // Broadcast to all channel members
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
              
              // Update last read timestamp for member
              const members = await storage.getChannelMembers(message.channelId);
              const member = members.find(m => m.userId === client.userId);
              if (member) {
                await storage.updateChannelMember(member.id, {
                  lastReadAt: new Date(),
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        client.send(JSON.stringify({ type: 'error', message: 'Failed to process message' }));
      }
    });

    client.on('close', () => {
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
  return [...new Set(onlineUsers)];
}
