import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ClipboardEdit,
  FileSignature,
  Upload
} from "lucide-react";

interface OnboardingTask {
  id: string;
  consultantId: string;
  taskType: string;
  title: string;
  description: string | null;
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected";
  phase: number;
  phaseName: string | null;
  submittedAt: string | null;
  formUrl: string | null;
  consultant?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500">Approved</Badge>;
    case "submitted":
      return <Badge className="bg-blue-500">Submitted</Badge>;
    case "under_review":
      return <Badge className="bg-amber-500">Under Review</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function TaskTypeIcon({ taskType }: { taskType: string }) {
  switch (taskType) {
    case "form_fill":
      return <ClipboardEdit className="w-4 h-4" />;
    case "e_sign":
      return <FileSignature className="w-4 h-4" />;
    default:
      return <Upload className="w-4 h-4" />;
  }
}

export default function OnboardingAdmin() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ task: OnboardingTask; action: "approve" | "reject" } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: tasks, isLoading } = useQuery<OnboardingTask[]>({
    queryKey: ["/api/onboarding/tasks"],
  });

  const { data: summary } = useQuery<{
    overall: {
      total: number;
      pending: number;
      submitted: number;
      under_review: number;
      approved: number;
      rejected: number;
    };
  }>({
    queryKey: ["/api/onboarding/summary"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ taskId, status, rejectionReason }: { taskId: string; status: string; rejectionReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/onboarding/tasks/${taskId}`, {
        status,
        rejectionReason,
        reviewedBy: "admin", // In real app, use actual user ID
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/summary"] });
      toast({
        title: reviewDialog?.action === "approve" ? "Task Approved" : "Task Rejected",
        description: "The onboarding task has been updated.",
      });
      setReviewDialog(null);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  const handleReview = () => {
    if (!reviewDialog) return;
    reviewMutation.mutate({
      taskId: reviewDialog.task.id,
      status: reviewDialog.action === "approve" ? "approved" : "rejected",
      rejectionReason: reviewDialog.action === "reject" ? rejectionReason : undefined,
    });
  };

  const submittedTasks = tasks?.filter(t => t.status === "submitted" || t.status === "under_review") || [];
  const approvedTasks = tasks?.filter(t => t.status === "approved") || [];
  const rejectedTasks = tasks?.filter(t => t.status === "rejected") || [];
  const pendingTasks = tasks?.filter(t => t.status === "pending") || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Onboarding Administration</h1>
        <p className="text-muted-foreground">Review and manage consultant onboarding submissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.overall?.submitted || 0}</p>
                <p className="text-xs text-muted-foreground">Awaiting Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.overall?.approved || 0}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.overall?.rejected || 0}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.overall?.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.overall?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="submitted">
        <TabsList>
          <TabsTrigger value="submitted" className="gap-2">
            <Clock className="w-4 h-4" />
            Needs Review ({submittedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Approved ({approvedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <FileText className="w-4 h-4" />
            Pending ({pendingTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submitted" className="mt-4">
          {submittedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No submissions awaiting review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submittedTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TaskTypeIcon taskType={task.taskType} />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Consultant ID: {task.consultantId}
                          </p>
                          {task.submittedAt && (
                            <p className="text-xs text-muted-foreground">
                              Submitted: {format(new Date(task.submittedAt), "MMM d, yyyy h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={task.status} />
                        {task.formUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setReviewDialog({ task, action: "approve" })}
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setReviewDialog({ task, action: "reject" })}
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approvedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No approved tasks yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {approvedTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TaskTypeIcon taskType={task.taskType} />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Consultant ID: {task.consultantId}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No rejected tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rejectedTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TaskTypeIcon taskType={task.taskType} />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Consultant ID: {task.consultantId}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">All tasks have been submitted</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <TaskTypeIcon taskType={task.taskType} />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Consultant ID: {task.consultantId}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Form Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Submitted form from consultant
            </DialogDescription>
          </DialogHeader>
          {selectedTask?.formUrl && (
            <div className="border rounded-lg overflow-hidden bg-white">
              <iframe
                src={selectedTask.formUrl}
                className="w-full h-[500px]"
                title={selectedTask.title}
                style={{ border: 'none' }}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog?.action === "approve" ? "Approve Task" : "Reject Task"}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog?.task.title}
            </DialogDescription>
          </DialogHeader>
          {reviewDialog?.action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          {reviewDialog?.action === "approve" && (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve this submission?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              className={reviewDialog?.action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={reviewDialog?.action === "reject" ? "destructive" : "default"}
              disabled={reviewDialog?.action === "reject" && !rejectionReason}
            >
              {reviewDialog?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
