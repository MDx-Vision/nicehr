import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading, error } = useQuery<NotificationCounts>({
    queryKey: ["/api/notifications/counts"],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });

  return {
    counts: data ?? {},
    isLoading,
    error,
  };
}
