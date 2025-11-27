import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Shield,
  GraduationCap,
  Briefcase,
  User,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ClipboardCheck,
  Award
} from "lucide-react";
import type { OnboardingTask, Consultant } from "@shared/schema";

interface OnboardingProgress {
  total: number;
  completed: number;
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
  percentage: number;
}

const ONBOARDING_CATEGORIES = [
  { id: "documentation", name: "Documentation", icon: FileText, description: "Required forms and agreements" },
  { id: "credentials", name: "Credentials", icon: Award, description: "Professional certifications" },
  { id: "compliance", name: "Compliance", icon: Shield, description: "Background checks and verifications" },
  { id: "training", name: "Training", icon: GraduationCap, description: "Required training modules" },
  { id: "orientation", name: "Orientation", icon: Briefcase, description: "Company orientation materials" },
];

function TaskStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500">Approved</Badge>;
    case "submitted":
    case "under_review":
      return <Badge variant="secondary">Pending Review</Badge>;
    case "rejected":
      return <Badge variant="destructive">Needs Revision</Badge>;
    default:
      return <Badge variant="outline">Not Started</Badge>;
  }
}

function TaskCard({ 
  task, 
  onSubmit, 
  onReview 
}: { 
  task: OnboardingTask; 
  onSubmit: (task: OnboardingTask) => void;
  onReview?: (task: OnboardingTask, action: "approve" | "reject") => void;
}) {
  const getCategoryIcon = () => {
    const category = ONBOARDING_CATEGORIES.find(c => c.id === task.taskType);
    if (category) {
      const Icon = category.icon;
      return <Icon className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  const canSubmit = task.status === "pending" || task.status === "rejected";
  const isSubmitted = task.status === "submitted" || task.status === "under_review";
  const isApproved = task.status === "approved";

  return (
    <Card 
      className={`transition-all ${isApproved ? "border-green-500/50" : ""}`}
      data-testid={`onboarding-task-${task.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isApproved ? "bg-green-100 text-green-600 dark:bg-green-900/30" : 
                isSubmitted ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : 
                "bg-muted text-muted-foreground"}`}
            >
              {isApproved ? <CheckCircle2 className="w-5 h-5" /> : getCategoryIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{task.title}</CardTitle>
              <CardDescription className="text-xs capitalize">{task.taskType}</CardDescription>
            </div>
          </div>
          <TaskStatusBadge status={task.status || "pending"} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        
        {task.dueDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
          </div>
        )}

        {task.status === "rejected" && task.rejectionReason && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Revision Required:</p>
            <p className="text-sm text-muted-foreground mt-1">{task.rejectionReason}</p>
          </div>
        )}

        {(task.status === "submitted" || task.status === "under_review") && task.submittedAt && (
          <p className="text-xs text-muted-foreground">
            Submitted on {format(new Date(task.submittedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        )}

        {isApproved && task.reviewedAt && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Approved on {format(new Date(task.reviewedAt), "MMM d, yyyy")}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {canSubmit && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onSubmit(task)}
            data-testid={`button-submit-task-${task.id}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {task.status === "rejected" ? "Resubmit" : "Submit"}
          </Button>
        )}
        
        {onReview && isSubmitted && (
          <>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onReview(task, "approve")}
              data-testid={`button-approve-task-${task.id}`}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onReview(task, "reject")}
              data-testid={`button-reject-task-${task.id}`}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </>
        )}
        
        {isApproved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function ConsultantOnboardingView({ consultantId }: { consultantId: string }) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery<OnboardingTask[]>({
    queryKey: ["/api/consultants", consultantId, "onboarding"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<OnboardingProgress>({
    queryKey: ["/api/consultants", consultantId, "onboarding", "progress"],
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/consultants/${consultantId}/onboarding/initialize`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants", consultantId, "onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consultants", consultantId, "onboarding", "progress"] });
      toast({ title: "Onboarding tasks initialized" });
    },
    onError: () => {
      toast({ title: "Failed to initialize tasks", variant: "destructive" });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ taskId, notes }: { taskId: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/onboarding-tasks/${taskId}`, { 
        status: "submitted",
        notes: notes || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultants", consultantId, "onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consultants", consultantId, "onboarding", "progress"] });
      toast({ title: "Task submitted for review" });
      setIsSubmitDialogOpen(false);
      setSelectedTask(null);
    },
    onError: () => {
      toast({ title: "Failed to submit task", variant: "destructive" });
    },
  });

  const handleSubmit = (task: OnboardingTask) => {
    setSelectedTask(task);
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTask) return;
    const formData = new FormData(e.currentTarget);
    submitMutation.mutate({ 
      taskId: selectedTask.id, 
      notes: formData.get("notes") as string 
    });
  };

  const filteredTasks = tasks?.filter(task => 
    selectedCategory === "all" || task.taskType === selectedCategory
  );

  if (tasksLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Onboarding Tasks</h3>
          <p className="text-muted-foreground mb-4">
            Onboarding tasks haven't been set up yet.
          </p>
          <Button onClick={() => initializeMutation.mutate()} disabled={initializeMutation.isPending} data-testid="button-initialize-onboarding">
            <RefreshCw className={`w-4 h-4 mr-2 ${initializeMutation.isPending ? "animate-spin" : ""}`} />
            Initialize Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Onboarding Progress
          </CardTitle>
          <CardDescription>
            Complete all tasks to finish your onboarding process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="font-medium">{progress?.percentage || 0}%</span>
          </div>
          <Progress value={progress?.percentage || 0} className="h-3" />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{progress?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <p className="text-2xl font-bold text-green-600">{progress?.approved || 0}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <p className="text-2xl font-bold text-blue-600">{progress?.submitted || 0}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <p className="text-2xl font-bold text-yellow-600">{progress?.pending || 0}</p>
              <p className="text-xs text-muted-foreground">To Do</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <p className="text-2xl font-bold text-red-600">{progress?.rejected || 0}</p>
              <p className="text-xs text-muted-foreground">Needs Revision</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={selectedCategory === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectedCategory("all")}
          data-testid="filter-all"
        >
          All Tasks
        </Button>
        {ONBOARDING_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            data-testid={`filter-${cat.id}`}
          >
            <cat.icon className="w-4 h-4 mr-1" />
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks?.map((task) => (
          <TaskCard key={task.id} task={task} onSubmit={handleSubmit} />
        ))}
      </div>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
            <DialogDescription>
              Submit "{selectedTask?.title}" for review
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitConfirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Add any notes or comments for the reviewer..."
                data-testid="input-submit-notes"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitMutation.isPending} data-testid="button-confirm-submit">
                Submit for Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminOnboardingDashboard() {
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");

  const { data: pendingTasks, isLoading } = useQuery<OnboardingTask[]>({
    queryKey: ["/api/admin/onboarding/pending"],
  });

  const { data: consultants } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ taskId, status, notes }: { taskId: string; status: string; notes?: string }) => {
      return await apiRequest("PATCH", `/api/onboarding-tasks/${taskId}`, { 
        status,
        rejectionReason: notes || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding/pending"] });
      toast({ title: reviewAction === "approve" ? "Task approved" : "Task returned for revision" });
      setIsReviewDialogOpen(false);
      setSelectedTask(null);
    },
    onError: () => {
      toast({ title: "Failed to process review", variant: "destructive" });
    },
  });

  const handleReview = (task: OnboardingTask, action: "approve" | "reject") => {
    setSelectedTask(task);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const handleReviewConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTask) return;
    const formData = new FormData(e.currentTarget);
    reviewMutation.mutate({ 
      taskId: selectedTask.id, 
      status: reviewAction === "approve" ? "approved" : "rejected",
      notes: formData.get("notes") as string 
    });
  };

  const getConsultantName = (consultantId: string) => {
    const consultant = consultants?.find(c => c.id === consultantId);
    return consultant?.tngId || "Unknown Consultant";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Pending Reviews
          </CardTitle>
          <CardDescription>
            {pendingTasks?.length || 0} tasks awaiting your review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTasks && pendingTasks.length > 0 ? (
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 rounded-lg border"
                  data-testid={`pending-review-${task.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {getConsultantName(task.consultantId)} - {task.taskType}
                      </p>
                      {task.submittedAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted {format(new Date(task.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleReview(task, "approve")}
                      data-testid={`button-approve-${task.id}`}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReview(task, "reject")}
                      data-testid={`button-reject-${task.id}`}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No tasks pending review. All caught up!
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve Task" : "Request Revision"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve" 
                ? `Approve "${selectedTask?.title}"` 
                : `Return "${selectedTask?.title}" for revision`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewConfirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">
                {reviewAction === "approve" ? "Comments (optional)" : "Revision Notes *"}
              </Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder={reviewAction === "approve" 
                  ? "Add any comments..." 
                  : "Explain what needs to be corrected..."}
                required={reviewAction === "reject"}
                data-testid="input-review-notes"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={reviewMutation.isPending}
                variant={reviewAction === "approve" ? "default" : "destructive"}
                data-testid="button-confirm-review"
              >
                {reviewAction === "approve" ? "Approve" : "Request Revision"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ConsultantOnboarding() {
  const { user, isAdmin } = useAuth();
  const [selectedConsultant, setSelectedConsultant] = useState<string>("");

  const { data: consultants } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
    enabled: isAdmin,
  });

  const { data: myConsultant } = useQuery<Consultant>({
    queryKey: ["/api/consultants/me"],
    enabled: !isAdmin && user?.role === "consultant",
  });

  useEffect(() => {
    if (!isAdmin && myConsultant?.id) {
      setSelectedConsultant(myConsultant.id);
    }
  }, [isAdmin, myConsultant]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-onboarding-title">
          {isAdmin ? "Onboarding Management" : "My Onboarding"}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Manage consultant onboarding tasks and approvals" 
            : "Complete your onboarding tasks to get started"}
        </p>
      </div>

      {isAdmin && (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending-reviews">
              <Eye className="w-4 h-4 mr-2" />
              Pending Reviews
            </TabsTrigger>
            <TabsTrigger value="consultants" data-testid="tab-consultants">
              <User className="w-4 h-4 mr-2" />
              By Consultant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <AdminOnboardingDashboard />
          </TabsContent>

          <TabsContent value="consultants" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Consultant</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                  <SelectTrigger className="max-w-md" data-testid="select-consultant">
                    <SelectValue placeholder="Choose a consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {consultants?.map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        {consultant.tngId} - {consultant.location || "No Location"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedConsultant && (
              <ConsultantOnboardingView consultantId={selectedConsultant} />
            )}
          </TabsContent>
        </Tabs>
      )}

      {!isAdmin && selectedConsultant && (
        <ConsultantOnboardingView consultantId={selectedConsultant} />
      )}

      {!isAdmin && !selectedConsultant && !myConsultant && (
        <Card>
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Consultant Profile</h3>
            <p className="text-muted-foreground">
              You don't have a consultant profile yet. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
