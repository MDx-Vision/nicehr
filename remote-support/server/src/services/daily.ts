import { v4 as uuidv4 } from 'uuid';

const DAILY_API_URL = 'https://api.daily.co/v1';

function getApiKey() {
  return process.env.DAILY_API_KEY || '';
}

function getDomain() {
  return process.env.DAILY_DOMAIN || '';
}

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface CreateRoomOptions {
  sessionId: number;
  expiryMinutes?: number;
}

interface CreateTokenOptions {
  roomName: string;
  participantId: number;
  participantName: string;
  isOwner?: boolean;
  expiryMinutes?: number;
}

class DailyService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(DAILY_API_URL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getApiKey(),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error('Daily.co API error: ' + response.status + ' - ' + error);
    }
    return response.json();
  }

  async createRoom(options: CreateRoomOptions): Promise<DailyRoom> {
    const roomName = 'session-' + options.sessionId + '-' + uuidv4().slice(0, 8);
    const expiryMinutes = options.expiryMinutes || 120;
    const room = await this.request<DailyRoom>('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 2,
          enable_screenshare: true,
          enable_chat: true,
          exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
        },
      }),
    });
    return { ...room, url: 'https://' + getDomain() + '/' + room.name };
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.request('/rooms/' + roomName, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete room:', err);
    }
  }

  async createToken(options: CreateTokenOptions): Promise<string> {
    const expiryMinutes = options.expiryMinutes || 60;
    const result = await this.request<{token: string}>('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          room_name: options.roomName,
          user_id: String(options.participantId),
          user_name: options.participantName,
          is_owner: options.isOwner || false,
          exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
          enable_prejoin_ui: false, // Skip Daily's prejoin screen - app has its own Join button
        },
      }),
    });
    return result.token;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/rooms?limit=1');
      return true;
    } catch {
      return false;
    }
  }
}

export default new DailyService();
