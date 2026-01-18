import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  LogOut,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  Check,
  X,
  UserPlus,
  Send,
  Activity,
  Wifi,
  WifiOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserActivityWithUser } from "@shared/schema";
import { useActivityWebSocket } from "@/hooks/useActivityWebSocket";

const activityIcons: Record<string, typeof Activity> = {
  login: LogIn,
  logout: LogOut,
  page_view: Eye,
  create: Plus,
  update: Pencil,
  delete: Trash2,
  upload: Upload,
  download: Download,
  approve: Check,
  reject: X,
  assign: UserPlus,
  submit: Send,
};

const activityColors: Record<string, string> = {
  login: "text-green-500",
  logout: "text-gray-500",
  page_view: "text-blue-500",
  create: "text-cyan-500",
  update: "text-yellow-500",
  delete: "text-red-500",
  upload: "text-purple-500",
  download: "text-indigo-500",
  approve: "text-green-600",
  reject: "text-red-600",
  assign: "text-orange-500",
  submit: "text-teal-500",
};

const activityVerbs: Record<string, string> = {
  login: "logged in",
  logout: "logged out",
  page_view: "viewed",
  create: "created",
  update: "updated",
  delete: "deleted",
  upload: "uploaded",
  download: "downloaded",
  approve: "approved",
  reject: "rejected",
  assign: "assigned",
  submit: "submitted",
};

interface ActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
  realtime?: boolean;
}

export function ActivityFeed({ limit = 10, showTitle = true, className = "", realtime = true }: ActivityFeedProps) {
  const { isConnected } = useActivityWebSocket();

  const { data: activities = [], isLoading } = useQuery<UserActivityWithUser[]>({
    queryKey: ["/api/activities/recent"],
    refetchInterval: realtime ? 10000 : 60000, // Faster refresh when realtime is enabled
  });

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  const formatActivity = (activity: UserActivityWithUser) => {
    const verb = activityVerbs[activity.activityType] || activity.activityType;
    const resourceInfo = activity.resourceName 
      ? ` ${activity.resourceType || "item"}: ${activity.resourceName}`
      : activity.resourceType
        ? ` a ${activity.resourceType}`
        : "";
    return `${verb}${resourceInfo}`;
  };

  if (isLoading) {
    return (
      <Card className={className} data-testid="card-activity-feed">
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="card-activity-feed">
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            {realtime && (
              isConnected ? (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-600" data-testid="badge-activity-live">
                  <Wifi className="h-3 w-3" />
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-muted-foreground" data-testid="badge-activity-offline">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )
            )}
          </div>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-activities">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {activities.slice(0, limit).map((activity) => {
                const IconComponent = activityIcons[activity.activityType] || Activity;
                const iconColor = activityColors[activity.activityType] || "text-gray-500";
                const user = activity.user;
                const userName = user 
                  ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Unknown User")
                  : "Unknown User";

                return (
                  <div 
                    key={activity.id} 
                    className="flex gap-3"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage 
                        src={user?.profileImageUrl || undefined} 
                        alt={userName} 
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(user?.firstName || null, user?.lastName || null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`${iconColor} flex-shrink-0`}>
                          <IconComponent className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-sm truncate">
                          <span className="font-medium">{userName}</span>
                          {" "}
                          <span className="text-muted-foreground">
                            {formatActivity(activity)}
                          </span>
                        </p>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
