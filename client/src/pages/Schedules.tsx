import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Project, ProjectSchedule, Hospital } from "@shared/schema";
import { format } from "date-fns";

export default function Schedules() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: schedules, isLoading } = useQuery<ProjectSchedule[]>({
    queryKey: ["/api/projects", selectedProject, "schedules"],
    enabled: !!selectedProject,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/schedules/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "schedules"] });
      toast({ title: "Schedule status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getHospitalName = (hospitalId: string) => {
    return hospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  const filteredSchedules = schedules?.filter(
    (schedule) => !statusFilter || schedule.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-schedules-title">Schedules</h1>
        <p className="text-muted-foreground">Manage project schedules and consultant assignments</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[300px]" data-testid="select-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} - {getHospitalName(project.hospitalId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!selectedProject ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project to view and manage its schedules.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ) : filteredSchedules && filteredSchedules.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Project Schedules</CardTitle>
            <CardDescription>
              Review and approve shift schedules for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Shift Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Approved At</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id} data-testid={`row-schedule-${schedule.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(schedule.scheduleDate), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <Clock className="w-3 h-3 mr-1" />
                        {schedule.shiftType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(schedule.status) as any} className="capitalize">
                        {getStatusIcon(schedule.status)}
                        <span className="ml-1">{schedule.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {schedule.approvedBy || "-"}
                    </TableCell>
                    <TableCell>
                      {schedule.approvedAt
                        ? format(new Date(schedule.approvedAt), "MMM d, yyyy HH:mm")
                        : "-"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {schedule.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: schedule.id, status: "approved" })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-approve-${schedule.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: schedule.id, status: "rejected" })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-reject-${schedule.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schedules found</h3>
            <p className="text-muted-foreground">
              {statusFilter ? "Try adjusting your filter" : "No schedules have been created for this project yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
