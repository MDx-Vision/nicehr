import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Linkedin,
  MessageCircle,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Activity {
  id: string;
  type: "email" | "call" | "meeting" | "task" | "note" | "sms" | "linkedin" | "whatsapp";
  subtype?: string;
  subject?: string;
  description?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  ownerId?: string;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  durationMinutes?: number;
  outcome?: string;
  sentiment?: string;
  nextAction?: string;
  createdAt: string;
}

interface ActivityFeedProps {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  title?: string;
  description?: string;
  maxHeight?: string;
  limit?: number;
  showHeader?: boolean;
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  task: CheckCircle,
  note: FileText,
  sms: MessageSquare,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const ACTIVITY_COLORS: Record<string, string> = {
  email: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  call: "bg-green-500/20 text-green-400 border-green-500/30",
  meeting: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  task: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  note: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sms: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  linkedin: "bg-blue-600/20 text-blue-500 border-blue-600/30",
  whatsapp: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const OUTCOME_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  connected: { label: "Connected", variant: "default" },
  voicemail: { label: "Voicemail", variant: "secondary" },
  no_answer: { label: "No Answer", variant: "outline" },
  busy: { label: "Busy", variant: "outline" },
  meeting_held: { label: "Held", variant: "default" },
  meeting_cancelled: { label: "Cancelled", variant: "destructive" },
  email_sent: { label: "Sent", variant: "default" },
  email_bounced: { label: "Bounced", variant: "destructive" },
  completed: { label: "Completed", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
};

export default function ActivityFeed({
  contactId,
  companyId,
  dealId,
  title = "Activity Timeline",
  description = "Recent activities and interactions",
  maxHeight = "400px",
  limit = 20,
  showHeader = true,
}: ActivityFeedProps) {
  const queryParams = new URLSearchParams();
  if (contactId) queryParams.append("contactId", contactId);
  if (companyId) queryParams.append("companyId", companyId);
  if (dealId) queryParams.append("dealId", dealId);
  queryParams.append("limit", limit.toString());

  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/crm/activities", contactId, companyId, dealId, limit],
    queryFn: async () => {
      const res = await fetch(`/api/crm/activities?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
    enabled: !!(contactId || companyId || dealId),
  });

  const getActivityIcon = (type: string) => {
    const Icon = ACTIVITY_ICONS[type] || FileText;
    return Icon;
  };

  const formatActivityTime = (date: string) => {
    const activityDate = new Date(date);
    const now = new Date();
    const diffHours = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return formatDistanceToNow(activityDate, { addSuffix: true });
    }
    return format(activityDate, "MMM d, yyyy 'at' h:mm a");
  };

  const getActivityTitle = (activity: Activity) => {
    if (activity.subject) return activity.subject;

    const typeLabels: Record<string, string> = {
      email: "Email",
      call: "Phone Call",
      meeting: "Meeting",
      task: "Task",
      note: "Note",
      sms: "SMS",
      linkedin: "LinkedIn Message",
      whatsapp: "WhatsApp Message",
    };

    return typeLabels[activity.type] || "Activity";
  };

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="activity-feed">
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {activities && activities.length > 0 ? (
          <ScrollArea style={{ maxHeight }} className="pr-4">
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const isTask = activity.type === "task";
                const isCompleted = !!activity.completedAt;

                return (
                  <div
                    key={activity.id}
                    className="flex gap-4 relative"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    {/* Timeline connector */}
                    {index < activities.length - 1 && (
                      <div className="absolute left-4 top-10 w-0.5 h-full -ml-px bg-border" />
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.note}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">
                            {getActivityTitle(activity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatActivityTime(activity.createdAt)}
                            {activity.durationMinutes && (
                              <span className="ml-2">
                                <Clock className="inline w-3 h-3 mr-1" />
                                {activity.durationMinutes} min
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {activity.outcome && OUTCOME_BADGES[activity.outcome] && (
                            <Badge
                              variant={OUTCOME_BADGES[activity.outcome].variant}
                              className="text-xs"
                            >
                              {OUTCOME_BADGES[activity.outcome].label}
                            </Badge>
                          )}
                          {isTask && (
                            <Badge
                              variant={isCompleted ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isCompleted ? "Done" : "Pending"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {activity.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      )}

                      {activity.nextAction && (
                        <p className="mt-1 text-xs text-primary">
                          Next: {activity.nextAction}
                        </p>
                      )}

                      {isTask && activity.dueDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Due: {format(new Date(activity.dueDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No activities yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Log a call, email, or meeting to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
