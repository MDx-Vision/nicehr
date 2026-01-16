import { useEffect, useRef, useState } from 'react';

interface NotificationCounts {
  'shift-swaps'?: number;
  tickets?: number;
  invitations?: number;
  timesheets?: number;
  [key: string]: number | undefined;
}

export function useNotificationWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({});
  const [totalCount, setTotalCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      if (!mountedRef.current) return;
      if (wsRef.current?.readyState === WebSocket.OPEN ||
          wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'subscribe_notifications' }));
          } catch (e) {
            console.error('Error subscribing to notifications:', e);
          }
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'notification_counts' && message.counts) {
            setNotificationCounts(message.counts);
            const total = Object.values(message.counts as NotificationCounts).reduce(
              (sum: number, count) => sum + (count || 0),
              0
            );
            setTotalCount(total);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        // Error handling - will trigger onclose
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ type: 'unsubscribe_notifications' }));
          } catch (e) {
            // Ignore
          }
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array

  return {
    isConnected,
    notificationCounts,
    totalCount,
  };
}
