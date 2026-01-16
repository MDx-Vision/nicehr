import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface NotificationCounts {
  tickets?: number;
  "shift-swaps"?: number;
  timesheets?: number;
  invitations?: number;
  assessments?: number;
  expenses?: number;
  [key: string]: number | undefined;
}

export function useNotificationCounts() {
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);

  // Keep queryClient ref up to date
  queryClientRef.current = queryClient;

  // Initial fetch via REST API
  const { data, isLoading, error } = useQuery<NotificationCounts>({
    queryKey: ["/api/notifications/counts"],
    staleTime: 60000,
    refetchInterval: false,
  });

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      if (!mountedRef.current) return;
      if (wsRef.current?.readyState === WebSocket.OPEN ||
          wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mountedRef.current) return;
          setIsConnected(true);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "subscribe_notifications" }));
          }
        };

        ws.onmessage = (event) => {
          if (!mountedRef.current) return;
          try {
            const message = JSON.parse(event.data);
            if (message.type === "notification_counts" && message.counts) {
              queryClientRef.current.setQueryData<NotificationCounts>(
                ["/api/notifications/counts"],
                message.counts
              );
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
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
      } catch (err) {
        console.error("Failed to connect to WebSocket:", err);
        if (mountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array

  return {
    counts: data ?? {},
    isLoading,
    error,
    isConnected,
  };
}
