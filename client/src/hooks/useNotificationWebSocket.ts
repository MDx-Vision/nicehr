import { useEffect, useRef, useCallback, useState } from 'react';

interface NotificationCounts {
  'shift-swaps'?: number;
  tickets?: number;
  invitations?: number;
  timesheets?: number;
  [key: string]: number | undefined;
}

interface WebSocketMessage {
  type: string;
  counts?: NotificationCounts;
  affectedTypes?: string[];
}

export function useNotificationWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({});
  const [totalCount, setTotalCount] = useState(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      // Subscribe to notification updates
      ws.send(JSON.stringify({ type: 'subscribe_notifications' }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'notification_counts' && message.counts) {
          setNotificationCounts(message.counts);
          const total = Object.values(message.counts).reduce((sum: number, count) => sum + (count || 0), 0);
          setTotalCount(total);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe_notifications' }));
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    notificationCounts,
    totalCount,
  };
}
