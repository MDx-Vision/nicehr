import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// Event types for real-time updates
export type WSEventType =
  | 'support_request_new'      // New support request in queue
  | 'support_request_accepted' // Consultant accepted request
  | 'support_session_started'  // Call connected
  | 'support_session_ended'    // Call ended
  | 'consultant_status_changed' // Consultant availability changed
  | 'queue_position_update'    // Queue position changed
  | 'scheduled_session_new'    // New scheduled session
  | 'scheduled_session_updated' // Scheduled session updated/cancelled
  | 'scheduled_session_reminder'; // Reminder for upcoming session

interface WSMessage {
  type: WSEventType;
  payload: unknown;
  timestamp: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId?: number;
  role?: string;
  hospitalId?: number;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ConnectedClient> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');

      // Store client with empty metadata initially
      this.clients.set(ws, { ws });

      // Handle incoming messages (for authentication/subscription)
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.send(ws, {
        type: 'consultant_status_changed',
        payload: { connected: true },
        timestamp: new Date().toISOString(),
      });
    });

    console.log('  WebSocket: ws://localhost:3002/ws');
  }

  private handleClientMessage(ws: WebSocket, message: { type: string; payload?: unknown }) {
    if (message.type === 'authenticate') {
      const { userId, role, hospitalId } = message.payload as {
        userId: number;
        role: string;
        hospitalId?: number;
      };

      const client = this.clients.get(ws);
      if (client) {
        client.userId = userId;
        client.role = role;
        client.hospitalId = hospitalId;
        console.log(`WebSocket authenticated: user ${userId} (${role})`);
      }
    }
  }

  private send(ws: WebSocket, message: WSMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast to all connected clients
  broadcast(type: WSEventType, payload: unknown) {
    const message: WSMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.clients.forEach((client) => {
      this.send(client.ws, message);
    });
  }

  // Broadcast to consultants only
  broadcastToConsultants(type: WSEventType, payload: unknown) {
    const message: WSMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.role === 'consultant' || client.role === 'admin') {
        this.send(client.ws, message);
        sentCount++;
        console.log(`[WS] Sent ${type} to consultant ${client.userId}`);
      }
    });
    console.log(`[WS] Broadcast ${type} to ${sentCount} consultants`);
  }

  // Send to specific user
  sendToUser(userId: number, type: WSEventType, payload: unknown) {
    const message: WSMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    let sent = false;
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        this.send(client.ws, message);
        sent = true;
        console.log(`[WS] Sent ${type} to user ${userId}`);
      }
    });
    if (!sent) {
      console.log(`[WS] User ${userId} not connected, could not send ${type}`);
    }
  }

  // Send to users in a specific session (requester + consultant)
  sendToSession(requesterId: number, consultantId: number | null, type: WSEventType, payload: unknown) {
    this.sendToUser(requesterId, type, payload);
    if (consultantId) {
      this.sendToUser(consultantId, type, payload);
    }
  }

  // Broadcast to hospital staff
  broadcastToHospital(hospitalId: number, type: WSEventType, payload: unknown) {
    const message: WSMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.clients.forEach((client) => {
      if (client.hospitalId === hospitalId) {
        this.send(client.ws, message);
      }
    });
  }

  getConnectedCount(): number {
    return this.clients.size;
  }
}

export default new WebSocketService();
