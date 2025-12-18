import { useEffect, useState, useRef, useCallback } from "react";
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

interface WebSocketMessage {
  type: string;
  counts?: NotificationCounts;
  affectedTypes?: string[];
  userId?: string;
}

export function useNotificationCounts() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initial fetch via REST API
  const { data, isLoading, error } = useQuery<NotificationCounts>({
    queryKey: ["/api/notifications/counts"],
    staleTime: 60000, // Consider stale after 1 minute (WebSocket will update)
    refetchInterval: false, // Disable polling - WebSocket handles updates
  });

  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
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
        setIsConnected(true);
        // Subscribe to notifications
        ws.send(JSON.stringify({ type: "subscribe_notifications" }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "notification_counts" && message.counts) {
            // Update the query cache with new counts
            queryClient.setQueryData<NotificationCounts>(
              ["/api/notifications/counts"],
              message.counts
            );
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
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
        console.error("WebSocket error:", error);
      };
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [queryClient]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    counts: data ?? {},
    isLoading,
    error,
    isConnected,
  };
}
