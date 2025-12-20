import { useEffect, useRef, useCallback, useState } from 'react';

export type WSEventType =
  | 'support_request_new'
  | 'support_request_accepted'
  | 'support_session_started'
  | 'support_session_ended'
  | 'consultant_status_changed'
  | 'queue_position_update'
  | 'scheduled_session_new'
  | 'scheduled_session_updated'
  | 'scheduled_session_reminder';

interface WSMessage {
  type: WSEventType;
  payload: unknown;
  timestamp: string;
}

type EventHandler = (payload: unknown) => void;

interface UseWebSocketOptions {
  userId?: number;
  role?: string;
  hospitalId?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { userId, role, hospitalId, onConnect, onDisconnect } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<WSEventType, Set<EventHandler>>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    console.log('WebSocket connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      onConnect?.();

      // Authenticate if we have user info
      if (userId && role) {
        ws.send(JSON.stringify({
          type: 'authenticate',
          payload: { userId, role, hospitalId },
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        const handlers = handlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach((handler) => handler(message.payload));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      onDisconnect?.();

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    wsRef.current = ws;
  }, [userId, role, hospitalId, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const subscribe = useCallback((eventType: WSEventType, handler: EventHandler) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    handlersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      handlersRef.current.get(eventType)?.delete(handler);
    };
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Re-authenticate when user info changes
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && userId && role) {
      wsRef.current.send(JSON.stringify({
        type: 'authenticate',
        payload: { userId, role, hospitalId },
      }));
    }
  }, [userId, role, hospitalId]);

  return {
    isConnected,
    subscribe,
    connect,
    disconnect,
  };
}

// Singleton WebSocket context for app-wide use
let globalWs: WebSocket | null = null;
let globalUserId: number | null = null;
let globalRole: string | null = null;
let globalHospitalId: number | undefined = undefined;
const globalHandlers = new Map<WSEventType, Set<EventHandler>>();
let reconnectTimeout: NodeJS.Timeout | null = null;

export function initGlobalWebSocket(userId: number, role: string, hospitalId?: number) {
  // Store credentials for reconnection
  globalUserId = userId;
  globalRole = role;
  globalHospitalId = hospitalId;

  // Don't create duplicate connections
  if (globalWs && (globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws`;

  console.log('[WS] Connecting to:', wsUrl);
  globalWs = new WebSocket(wsUrl);

  globalWs.onopen = () => {
    console.log('[WS] Connected, authenticating as', role);
    globalWs?.send(JSON.stringify({
      type: 'authenticate',
      payload: { userId, role, hospitalId },
    }));
  };

  globalWs.onmessage = (event) => {
    try {
      const message: WSMessage = JSON.parse(event.data);
      console.log('[WS] Received:', message.type);
      const handlers = globalHandlers.get(message.type);
      if (handlers && handlers.size > 0) {
        console.log('[WS] Dispatching to', handlers.size, 'handlers');
        handlers.forEach((handler) => handler(message.payload));
      }
    } catch (err) {
      console.error('[WS] Failed to parse message:', err);
    }
  };

  globalWs.onclose = () => {
    console.log('[WS] Disconnected, will reconnect in 3s');
    globalWs = null;
    // Clear any pending reconnect
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    // Reconnect with stored credentials
    if (globalUserId && globalRole) {
      reconnectTimeout = setTimeout(() => {
        initGlobalWebSocket(globalUserId!, globalRole!, globalHospitalId);
      }, 3000);
    }
  };

  globalWs.onerror = (err) => {
    console.error('[WS] Error:', err);
  };
}

export function subscribeGlobal(eventType: WSEventType, handler: EventHandler) {
  if (!globalHandlers.has(eventType)) {
    globalHandlers.set(eventType, new Set());
  }
  globalHandlers.get(eventType)!.add(handler);
  console.log('[WS] Subscribed to', eventType, '- total handlers:', globalHandlers.get(eventType)!.size);

  return () => {
    globalHandlers.get(eventType)?.delete(handler);
    console.log('[WS] Unsubscribed from', eventType);
  };
}

export function closeGlobalWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  globalWs?.close();
  globalWs = null;
  globalUserId = null;
  globalRole = null;
}
