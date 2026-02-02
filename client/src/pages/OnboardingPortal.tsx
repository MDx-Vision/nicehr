import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  ChevronDown,
  ChevronRight,
  User,
  FileSignature,
  Shield,
  Award,
  Syringe,
  Calendar,
  XCircle,
  Eye,
  Loader2,
  PartyPopper,
  ClipboardEdit,
  ExternalLink,
  Download,
  Printer
} from "lucide-react";

interface OnboardingTask {
  id: string;
  taskType: string;
  title: string;
  description: string | null;
  documentTypeId: string | null;
  isRequired: boolean;
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected";
  phase: number;
  phaseName: string | null;
  dueDate: string | null;
  dueDays: number | null;
  submittedAt: string | null;
  submittedDocumentId: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  instructions: string | null;
  orderIndex: number;
  formUrl: string | null;
  documentType: {
    id: string;
    name: string;
    category: string;
  } | null;
}

interface PhaseData {
  phase: number;
  name: string;
  description: string;
  dueDays: number;
  tasks: OnboardingTask[];
  progress: number;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

interface PortalData {
  consultant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    startDate: string | null;
  };
  phases: PhaseData[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overallProgress: number;
  };
}

const phaseIcons = {
  1: User,
  2: FileSignature,
  3: Shield,
  4: Award,
  5: Syringe,
};

const phaseColors = {
  1: "bg-blue-500",
  2: "bg-purple-500",
  3: "bg-amber-500",
  4: "bg-emerald-500",
  5: "bg-rose-500",
};

function TaskStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
    case "submitted":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Submitted</Badge>;
    case "under_review":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Under Review</Badge>;
    case "rejected":
      return <Badge variant="destructive">Needs Revision</Badge>;
    default:
      return <Badge variant="outline">Not Started</Badge>;
  }
}

function TaskRow({
  task,
  onUpload,
  onSign,
  onFillForm
}: {
  task: OnboardingTask;
  onUpload: (task: OnboardingTask) => void;
  onSign: (task: OnboardingTask) => void;
  onFillForm: (task: OnboardingTask) => void;
}) {
  const isComplete = task.status === "approved";
  const isSubmitted = task.status === "submitted" || task.status === "under_review";
  const isRejected = task.status === "rejected";
  const canSubmit = task.status === "pending" || task.status === "rejected";
  const isESign = task.taskType === "e_sign";
  const isFormFill = task.taskType === "form_fill";
  const isUpload = task.taskType === "document_upload";

  // Get the right icon for the task type
  const getTaskIcon = () => {
    if (isComplete) return <CheckCircle2 className="w-5 h-5" />;
    if (isSubmitted) return <Clock className="w-5 h-5" />;
    if (isRejected) return <XCircle className="w-5 h-5" />;
    if (isFormFill) return <ClipboardEdit className="w-5 h-5" />;
    if (isESign) return <FileSignature className="w-5 h-5" />;
    return <Upload className="w-5 h-5" />;
  };

  // Get the right action button
  const getActionButton = () => {
    if (!canSubmit) return null;

    if (isFormFill) {
      return (
        <Button
          size="sm"
          onClick={() => onFillForm(task)}
          data-testid={`fill-form-${task.id}`}
        >
          <ClipboardEdit className="w-4 h-4 mr-2" />
          Fill Out
        </Button>
      );
    }

    if (isESign) {
      return (
        <Button
          size="sm"
          onClick={() => onSign(task)}
          data-testid={`sign-task-${task.id}`}
        >
          <FileSignature className="w-4 h-4 mr-2" />
          Sign
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => onUpload(task)}
        data-testid={`upload-task-${task.id}`}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload
      </Button>
    );
  };

  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
        isComplete ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800" :
        isSubmitted ? "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800" :
        isRejected ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800" :
        "bg-white dark:bg-gray-900"
      }`}
      data-testid={`onboarding-task-${task.id}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isComplete ? "bg-green-100 text-green-600" :
          isSubmitted ? "bg-blue-100 text-blue-600" :
          isRejected ? "bg-red-100 text-red-600" :
          isFormFill ? "bg-indigo-100 text-indigo-600" :
          isESign ? "bg-purple-100 text-purple-600" :
          "bg-gray-100 text-gray-600"
        }`}>
          {getTaskIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{task.title}</span>
            {task.isRequired && (
              <Badge variant="outline" className="text-xs">Required</Badge>
            )}
            {isFormFill && (
              <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">Online Form</Badge>
            )}
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          {task.dueDate && (
            <p className="text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
            </p>
          )}
          {task.rejectionReason && isRejected && (
            <p className="text-xs text-red-600 mt-1">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {task.rejectionReason}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TaskStatusBadge status={task.status} />
        {getActionButton()}
        {isSubmitted && (
          <Button variant="outline" size="sm" disabled>
            <Eye className="w-4 h-4 mr-2" />
            Under Review
          </Button>
        )}
      </div>
    </div>
  );
}

function PhaseSection({ phase, isOpen, onToggle, onUpload, onSign, onFillForm }: {
  phase: PhaseData;
  isOpen: boolean;
  onToggle: () => void;
  onUpload: (task: OnboardingTask) => void;
  onSign: (task: OnboardingTask) => void;
  onFillForm: (task: OnboardingTask) => void;
}) {
  const PhaseIcon = phaseIcons[phase.phase as keyof typeof phaseIcons] || FileText;
  const phaseColor = phaseColors[phase.phase as keyof typeof phaseColors] || "bg-gray-500";

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className={`transition-all ${phase.isComplete ? "border-green-300 dark:border-green-800" : ""}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${phaseColor}`}>
                  {phase.isComplete ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <PhaseIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Phase {phase.phase}: {phase.name}
                    {phase.isComplete && (
                      <Badge className="bg-green-500">Complete</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {phase.completedCount} / {phase.totalCount} tasks
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due within {phase.dueDays} day{phase.dueDays !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={phase.progress} className="h-2" />
                </div>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {phase.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks in this phase.
              </p>
            ) : (
              phase.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onUpload={onUpload}
                  onSign={onSign}
                  onFillForm={onFillForm}
                />
              ))
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function OnboardingPortal() {
  const { toast } = useToast();
  const [openPhases, setOpenPhases] = useState<number[]>([1]);
  const [uploadDialog, setUploadDialog] = useState<OnboardingTask | null>(null);
  const [signDialog, setSignDialog] = useState<OnboardingTask | null>(null);
  const [formDialog, setFormDialog] = useState<OnboardingTask | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { data: portalData, isLoading, error } = useQuery<PortalData>({
    queryKey: ["/api/onboarding/my-portal"],
    queryFn: async () => {
      const response = await fetch("/api/onboarding/my-portal");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load onboarding portal");
      }
      return response.json();
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: async ({ taskId, documentId }: { taskId: string; documentId: string }) => {
      const response = await apiRequest("POST", `/api/onboarding/tasks/${taskId}/submit`, { documentId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/my-portal"] });
      toast({
        title: "Document Submitted",
        description: "Your document has been submitted for review.",
      });
      setUploadDialog(null);
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      console.error("[Onboarding] Submit error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const togglePhase = (phase: number) => {
    setOpenPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const handleUpload = (task: OnboardingTask) => {
    setUploadDialog(task);
  };

  const handleSign = (task: OnboardingTask) => {
    setSignDialog(task);
  };

  const handleFillForm = (task: OnboardingTask) => {
    setFormDialog(task);
  };

  const handleFormSubmit = async () => {
    if (!formDialog) return;

    setIsSubmittingForm(true);
    try {
      // In a real implementation, this would capture form data from the iframe
      // For now, we mark it as submitted
      const documentId = `form-${Date.now()}`;

      await submitTaskMutation.mutateAsync({
        taskId: formDialog.id,
        documentId,
      });
      setFormDialog(null);
      toast({
        title: "Form Submitted",
        description: "Your form has been submitted successfully.",
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const openFormInNewTab = (formUrl: string) => {
    window.open(formUrl, "_blank");
  };

  const handlePrintForm = () => {
    if (!formDialog?.formUrl) return;
    const printWindow = window.open(formDialog.formUrl, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  const handleDownloadForm = () => {
    if (!formDialog?.formUrl) return;
    // Open in new tab for download/save - user can print to PDF or save
    const downloadWindow = window.open(formDialog.formUrl, "_blank");
    if (downloadWindow) {
      toast({
        title: "Form Opened",
        description: "Use your browser's Save or Print to PDF to download a copy.",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadDialog) return;

    setIsUploading(true);
    try {
      // In a real app, you would upload the file to your storage service here
      // For now, we'll simulate the upload and create a document reference
      const documentId = `doc-${Date.now()}`;

      await submitTaskMutation.mutateAsync({
        taskId: uploadDialog.id,
        documentId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignSubmit = async () => {
    if (!signDialog) return;

    setIsUploading(true);
    try {
      // For e-signature, we'd normally redirect to the contract signing page
      // For now, we'll just mark it as submitted
      const documentId = `signed-${Date.now()}`;

      await submitTaskMutation.mutateAsync({
        taskId: signDialog.id,
        documentId,
      });
      setSignDialog(null);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !portalData) {
    const isNoConsultant = error?.message?.includes("No consultant profile");
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isNoConsultant ? "Consultant Profile Required" : "Unable to Load Onboarding Portal"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isNoConsultant
                ? "You need a consultant profile to access the onboarding portal. Please contact your administrator to set up your profile."
                : error?.message || "No onboarding tasks have been assigned yet."}
            </p>
            {!isNoConsultant && (
              <Button
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/onboarding/my-portal"] })}
              >
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { consultant, phases, summary } = portalData;
  const isOnboardingComplete = summary.overallProgress === 100;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {consultant.firstName}!</h1>
          <p className="text-muted-foreground">
            Complete your onboarding tasks to get started with TNG.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {consultant.startDate && (
            <Badge variant="outline" className="text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              Start Date: {format(new Date(consultant.startDate), "MMM d, yyyy")}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Summary Card */}
      <Card className={isOnboardingComplete ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isOnboardingComplete ? (
                  <>
                    <PartyPopper className="w-6 h-6 text-green-500" />
                    Onboarding Complete!
                  </>
                ) : (
                  "Onboarding Progress"
                )}
              </CardTitle>
              <CardDescription>
                {isOnboardingComplete
                  ? "Congratulations! You've completed all onboarding tasks."
                  : `${summary.completedTasks} of ${summary.totalTasks} tasks completed`}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{summary.overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={summary.overallProgress} className="h-3" />
          <div className="flex justify-between mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Completed: {summary.completedTasks}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Pending: {summary.pendingTasks}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Sections */}
      <div className="space-y-4">
        {phases.map((phase) => (
          <PhaseSection
            key={phase.phase}
            phase={phase}
            isOpen={openPhases.includes(phase.phase)}
            onToggle={() => togglePhase(phase.phase)}
            onUpload={handleUpload}
            onSign={handleSign}
            onFillForm={handleFillForm}
          />
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={!!uploadDialog} onOpenChange={() => setUploadDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              {uploadDialog?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {uploadDialog?.instructions && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium mb-1">Instructions:</p>
                <p className="text-muted-foreground">{uploadDialog.instructions}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* E-Sign Dialog */}
      <Dialog open={!!signDialog} onOpenChange={() => setSignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
            <DialogDescription>
              {signDialog?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {signDialog?.instructions && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="font-medium mb-1">Instructions:</p>
                <p className="text-muted-foreground">{signDialog.instructions}</p>
              </div>
            )}
            <div className="p-4 border rounded-lg text-center">
              <FileSignature className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Click "Sign Document" to review and electronically sign this document.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleSignSubmit} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Sign Document
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Fill Dialog */}
      <Dialog open={!!formDialog} onOpenChange={() => setFormDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardEdit className="w-5 h-5 text-indigo-600" />
              {formDialog?.title}
            </DialogTitle>
            <DialogDescription>
              Please fill out the form below and submit when complete.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {formDialog?.instructions && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm">
                <p className="font-medium mb-1">Instructions:</p>
                <p className="text-muted-foreground">{formDialog.instructions}</p>
              </div>
            )}
            {formDialog?.formUrl ? (
              <div className="border rounded-lg overflow-hidden bg-white">
                <iframe
                  src={formDialog.formUrl}
                  className="w-full h-[500px]"
                  title={formDialog.title}
                  style={{ border: 'none' }}
                />
              </div>
            ) : (
              <div className="p-8 border rounded-lg text-center bg-gray-50">
                <ClipboardEdit className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Form not available. Please contact support.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {formDialog?.formUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadForm}
                    title="Download a copy"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintForm}
                    title="Print form"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
              <Button variant="outline" onClick={() => setFormDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleFormSubmit}
                disabled={isSubmittingForm}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmittingForm ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Form
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
