import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Consultant, ScheduleAssignment } from "@shared/schema";
import { format } from "date-fns";

export default function MySchedule() {
  const { user } = useAuth();

  const { data: consultant, isLoading: consultantLoading } = useQuery<Consultant>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery<ScheduleAssignment[]>({
    queryKey: ["/api/consultants", consultant?.id, "schedules"],
    enabled: !!consultant?.id,
  });



  const isLoading = consultantLoading || schedulesLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-my-schedule-title">My Schedule</h1>
        <p className="text-muted-foreground">
          View your assigned shifts and upcoming projects
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !consultant ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
            <p className="text-muted-foreground">
              Please complete your consultant profile first.
            </p>
          </CardContent>
        </Card>
      ) : schedules && schedules.length > 0 ? (
        <div className="space-y-4">
          {schedules.map((assignment) => (
            <Card key={assignment.id} className="hover-elevate" data-testid={`card-assignment-${assignment.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Schedule Assignment</CardTitle>
                    <CardDescription>
                      Assignment ID: {assignment.id.slice(0, 8)}
                    </CardDescription>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Assigned
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignment.startTime && assignment.endTime && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Start:</span>
                      <span>{format(new Date(assignment.startTime), "MMM d, yyyy HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">End:</span>
                      <span>{format(new Date(assignment.endTime), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  </div>
                )}

                {assignment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm">{assignment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scheduled Assignments</h3>
            <p className="text-muted-foreground">
              You don't have any scheduled assignments at this time.
              Check back later for new project opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
