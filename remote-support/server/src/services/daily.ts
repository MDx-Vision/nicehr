import { v4 as uuidv4 } from 'uuid';

const DAILY_API_URL = 'https://api.daily.co/v1';

function getApiKey() {
  return process.env.DAILY_API_KEY || '';
}

function getDomain() {
  return process.env.DAILY_DOMAIN || 'nicehr.daily.co';
}

function isConfigured(): boolean {
  return Boolean(getApiKey());
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
  enableRecording?: boolean;
  recordingType?: 'cloud' | 'local';
}

interface CreateTokenOptions {
  roomName: string;
  participantId: number;
  participantName: string;
  isOwner?: boolean;
  expiryMinutes?: number;
  canRecord?: boolean;
}

interface RecordingInfo {
  id: string;
  room_name: string;
  start_ts: number;
  status: string;
  duration?: number;
  share_link?: string;
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
    const enableRecording = options.enableRecording ?? true; // Enable by default
    const recordingType = options.recordingType || 'cloud';

    // Return mock room if Daily.co is not configured (for testing/development)
    if (!isConfigured()) {
      console.log('Daily.co not configured, returning mock room:', roomName);
      return {
        id: 'mock-' + uuidv4(),
        name: roomName,
        url: 'https://' + getDomain() + '/' + roomName,
        created_at: new Date().toISOString(),
      };
    }

    const properties: Record<string, unknown> = {
      max_participants: 10, // Allow more for dedicated support
      enable_screenshare: true,
      enable_chat: true,
      exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
    };

    // Enable recording if requested
    if (enableRecording) {
      properties.enable_recording = recordingType;
      properties.enable_advanced_chat = true;
    }

    const room = await this.request<DailyRoom>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: roomName, properties }),
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
    // Return mock token if Daily.co is not configured (for testing/development)
    if (!isConfigured()) {
      const mockToken = 'mock-token-' + options.participantId + '-' + uuidv4().slice(0, 8);
      console.log('Daily.co not configured, returning mock token for:', options.participantName);
      return mockToken;
    }

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
          enable_prejoin_ui: false,
          enable_recording: options.canRecord ? 'cloud' : undefined,
        },
      }),
    });
    return result.token;
  }

  // Recording control methods
  async startRecording(roomName: string): Promise<{ id: string }> {
    const result = await this.request<{ id: string }>('/rooms/' + roomName + '/recordings', {
      method: 'POST',
      body: JSON.stringify({
        type: 'cloud',
      }),
    });
    return result;
  }

  async stopRecording(roomName: string, recordingId: string): Promise<void> {
    await this.request('/rooms/' + roomName + '/recordings/' + recordingId, {
      method: 'DELETE',
    });
  }

  async getRecordings(roomName: string): Promise<RecordingInfo[]> {
    const result = await this.request<{ data: RecordingInfo[] }>('/rooms/' + roomName + '/recordings');
    return result.data || [];
  }

  async getRecordingLink(recordingId: string): Promise<string> {
    const result = await this.request<{ download_link: string }>('/recordings/' + recordingId + '/access-link');
    return result.download_link;
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
