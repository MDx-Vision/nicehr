import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UserActivityWithUser } from '@shared/schema';

export function useActivityWebSocket() {
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastActivity, setLastActivity] = useState<UserActivityWithUser | null>(null);
  const mountedRef = useRef(true);

  // Keep queryClient ref up to date
  queryClientRef.current = queryClient;

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
          ws.send(JSON.stringify({ type: 'subscribe_activities' }));
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'new_activity' && message.activity) {
            setLastActivity(message.activity);
            queryClientRef.current.invalidateQueries({ queryKey: ['/api/activities/recent'] });
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
          wsRef.current.send(JSON.stringify({ type: 'unsubscribe_activities' }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array

  return {
    isConnected,
    lastActivity,
  };
}
