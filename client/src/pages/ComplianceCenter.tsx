import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  ClipboardCheck,
  Calendar,
  User,
  Building2,
  Eye,
  AlertCircle
} from "lucide-react";
import type { 
  Project, 
  Consultant,
  ComplianceCheckWithDetails,
  ComplianceAuditWithDetails,
  ComplianceAnalytics,
  Hospital,
} from "@shared/schema";

const CHECK_TYPES = [
  { value: "hipaa", label: "HIPAA", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "oig", label: "OIG", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "sam", label: "SAM", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  { value: "insurance", label: "Insurance", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  { value: "credential", label: "Credential", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
  { value: "background", label: "Background", color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200" },
];

const CHECK_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "passed", label: "Passed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "expired", label: "Expired", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "waived", label: "Waived", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
];

const AUDIT_TYPES = [
  { value: "hipaa", label: "HIPAA" },
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
];

const AUDIT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "reviewed", label: "Reviewed", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
];

function getCheckTypeBadge(type: string) {
  const config = CHECK_TYPES.find(t => t.value === type);
  return <Badge className={config?.color || ""}>{config?.label || type}</Badge>;
}

function getCheckStatusBadge(status: string) {
  const config = CHECK_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function getAuditStatusBadge(status: string) {
  const config = AUDIT_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function ComplianceRateRing({ rate }: { rate: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (rate / 100) * circumference;
  const rateColor = rate >= 80 ? "text-green-500" : rate >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={rateColor}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold">{rate.toFixed(0)}%</span>
        <span className="text-xs text-muted-foreground">Compliance</span>
      </div>
    </div>
  );
}

function DashboardTab({ analytics }: { analytics: ComplianceAnalytics | null }) {
  const { data: expiringChecks = [] } = useQuery<ComplianceCheckWithDetails[]>({
    queryKey: ['/api/compliance-checks/expiring?days=30'],
  });

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card data-testid="card-compliance-rate">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance Rate</CardTitle>
            <CardDescription>Based on all compliance checks</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <ComplianceRateRing rate={analytics.complianceRate} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="stat-total-checks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalChecks}</div>
              <p className="text-xs text-muted-foreground">All compliance checks</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-passed-checks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.passedChecks}</div>
              <p className="text-xs text-muted-foreground">Successfully passed</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-failed-checks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.failedChecks}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-checks">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{analytics.pendingChecks}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-checks-by-type">
          <CardHeader>
            <CardTitle className="text-base">Compliance by Type</CardTitle>
            <CardDescription>Breakdown of checks by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.checksByType?.map((item) => {
                const passRate = item.total > 0 ? (item.passed / item.total) * 100 : 0;
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCheckTypeBadge(item.type)}
                        <span className="text-sm text-muted-foreground">
                          {item.passed}/{item.total} passed
                        </span>
                      </div>
                      <span className="text-sm font-medium">{passRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={passRate} className="h-2" />
                  </div>
                );
              })}
              {(!analytics.checksByType || analytics.checksByType.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No compliance data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-expiring-credentials">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Expiring Credentials
            </CardTitle>
            <CardDescription>Items expiring within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {expiringChecks.length > 0 ? (
                  expiringChecks.map((check) => (
                    <Alert key={check.id} data-testid={`alert-expiring-${check.id}`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        {check.consultant?.user?.firstName} {check.consultant?.user?.lastName}
                        {getCheckTypeBadge(check.checkType)}
                      </AlertTitle>
                      <AlertDescription>
                        Expires {check.expirationDate ? format(new Date(check.expirationDate), "MMM d, yyyy") : "N/A"}
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No credentials expiring in the next 30 days
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateCheckDialog({
  open,
  onOpenChange,
  consultants
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultants: Consultant[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    consultantId: "",
    checkType: "hipaa",
    checkDate: "",
    expirationDate: "",
    verificationSource: "",
    verificationId: "",
    notes: "",
    status: "pending",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/compliance-checks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/compliance'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Compliance check created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create compliance check", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      consultantId: "",
      checkType: "hipaa",
      checkDate: "",
      expirationDate: "",
      verificationSource: "",
      verificationId: "",
      notes: "",
      status: "pending",
    });
  };

  const handleSubmit = () => {
    if (!formData.consultantId || !formData.checkDate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      consultantId: formData.consultantId,
      checkType: formData.checkType,
      checkDate: formData.checkDate,
      expirationDate: formData.expirationDate || null,
      verificationSource: formData.verificationSource || null,
      verificationId: formData.verificationId || null,
      notes: formData.notes || null,
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Compliance Check</DialogTitle>
          <DialogDescription>
            Add a new compliance check for a consultant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Consultant *</Label>
            <Select 
              value={formData.consultantId} 
              onValueChange={(v) => setFormData({ ...formData, consultantId: v })}
              data-testid="select-check-consultant"
            >
              <SelectTrigger data-testid="select-check-consultant-trigger">
                <SelectValue placeholder="Select consultant" />
              </SelectTrigger>
              <SelectContent>
                {consultants.map(c => (
                  <SelectItem key={c.id} value={c.id} data-testid={`option-check-consultant-${c.id}`}>
                    {(c as any).user?.firstName} {(c as any).user?.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check Type *</Label>
              <Select 
                value={formData.checkType} 
                onValueChange={(v) => setFormData({ ...formData, checkType: v })}
                data-testid="select-check-type"
              >
                <SelectTrigger data-testid="select-check-type-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHECK_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} data-testid={`option-check-type-${type.value}`}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v })}
                data-testid="select-check-status"
              >
                <SelectTrigger data-testid="select-check-status-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHECK_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value} data-testid={`option-check-status-${status.value}`}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check Date *</Label>
              <Input
                type="date"
                value={formData.checkDate}
                onChange={(e) => setFormData({ ...formData, checkDate: e.target.value })}
                data-testid="input-check-date"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                data-testid="input-expiration-date"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Verification Source</Label>
              <Input
                value={formData.verificationSource}
                onChange={(e) => setFormData({ ...formData, verificationSource: e.target.value })}
                placeholder="e.g., HHS OIG, SAM.gov"
                data-testid="input-verification-source"
              />
            </div>
            <div className="space-y-2">
              <Label>Verification ID</Label>
              <Input
                value={formData.verificationId}
                onChange={(e) => setFormData({ ...formData, verificationId: e.target.value })}
                placeholder="Reference number"
                data-testid="input-verification-id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              data-testid="input-check-notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-check">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            data-testid="button-create-check"
          >
            {createMutation.isPending ? "Creating..." : "Create Check"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckDetailDialog({
  check,
  open,
  onOpenChange
}: {
  check: ComplianceCheckWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      return apiRequest("PATCH", `/api/compliance-checks/${check?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/compliance'] });
      toast({ title: "Check updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update check", variant: "destructive" });
    }
  });

  if (!check) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Compliance Check Details</DialogTitle>
              <DialogDescription>
                View and manage check information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getCheckStatusBadge(check.status)}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Check Type</span>
            {getCheckTypeBadge(check.checkType)}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Consultant</span>
              <p className="font-medium">
                {check.consultant?.user?.firstName} {check.consultant?.user?.lastName}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Check Date</span>
              <p className="font-medium">
                {check.checkDate ? format(new Date(check.checkDate), "MMM d, yyyy") : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Expiration Date</span>
              <p className="font-medium">
                {check.expirationDate ? format(new Date(check.expirationDate), "MMM d, yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Verified By</span>
              <p className="font-medium">
                {check.checkedBy ? `${check.checkedBy.firstName} ${check.checkedBy.lastName}` : "N/A"}
              </p>
            </div>
          </div>

          {(check.verificationSource || check.verificationId) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Verification Source</span>
                <p className="font-medium">{check.verificationSource || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Verification ID</span>
                <p className="font-medium font-mono">{check.verificationId || "N/A"}</p>
              </div>
            </div>
          )}

          {check.notes && (
            <div>
              <span className="text-sm text-muted-foreground">Notes</span>
              <p className="text-sm mt-1">{check.notes}</p>
            </div>
          )}

          {isAdmin && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select 
                  value={check.status} 
                  onValueChange={(v) => updateMutation.mutate({ status: v })}
                  data-testid="select-update-check-status"
                >
                  <SelectTrigger data-testid="select-update-check-status-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHECK_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value} data-testid={`option-update-status-${s.value}`}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-check-detail">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChecksTab({ 
  checks, 
  isLoading,
  consultants 
}: { 
  checks: ComplianceCheckWithDetails[];
  isLoading: boolean;
  consultants: Consultant[];
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheckWithDetails | null>(null);

  const filteredChecks = checks.filter(check => {
    if (typeFilter !== "all" && check.checkType !== typeFilter) return false;
    if (statusFilter !== "all" && check.status !== statusFilter) return false;
    if (consultantFilter !== "all" && check.consultantId !== consultantFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter} data-testid="filter-check-type">
            <SelectTrigger className="w-[140px]" data-testid="filter-check-type-trigger">
              <SelectValue placeholder="Check Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-type-all">All Types</SelectItem>
              {CHECK_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value} data-testid={`filter-type-${type.value}`}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-check-status">
            <SelectTrigger className="w-[140px]" data-testid="filter-check-status-trigger">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-status-all">All Statuses</SelectItem>
              {CHECK_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value} data-testid={`filter-status-${status.value}`}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={consultantFilter} onValueChange={setConsultantFilter} data-testid="filter-check-consultant">
            <SelectTrigger className="w-[180px]" data-testid="filter-check-consultant-trigger">
              <SelectValue placeholder="Consultant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-consultant-all">All Consultants</SelectItem>
              {consultants.map(c => (
                <SelectItem key={c.id} value={c.id} data-testid={`filter-consultant-${c.id}`}>
                  {(c as any).user?.firstName} {(c as any).user?.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-new-check">
            <Plus className="h-4 w-4 mr-2" />
            New Check
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredChecks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No compliance checks found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {isAdmin ? "Create your first compliance check to get started." : "No checks match your filters."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-check">
                <Plus className="h-4 w-4 mr-2" />
                Create Check
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Consultant</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check Date</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecks.map((check) => (
                <TableRow key={check.id} data-testid={`row-check-${check.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(check.consultant?.user?.firstName?.[0] || "") + (check.consultant?.user?.lastName?.[0] || "")}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {check.consultant?.user?.firstName} {check.consultant?.user?.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getCheckTypeBadge(check.checkType)}</TableCell>
                  <TableCell>{getCheckStatusBadge(check.status)}</TableCell>
                  <TableCell>
                    {check.checkDate ? format(new Date(check.checkDate), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {check.expirationDate ? format(new Date(check.expirationDate), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setSelectedCheck(check)}
                      data-testid={`button-view-check-${check.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CreateCheckDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        consultants={consultants}
      />

      <CheckDetailDialog
        check={selectedCheck}
        open={!!selectedCheck}
        onOpenChange={(open) => !open && setSelectedCheck(null)}
      />
    </div>
  );
}

function CreateAuditDialog({
  open,
  onOpenChange,
  projects,
  hospitals
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  hospitals: Hospital[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    auditType: "internal",
    projectId: "",
    hospitalId: "",
    auditDate: "",
    status: "draft",
    findings: "[]",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/compliance-audits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance-audits'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Audit created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create audit", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      auditType: "internal",
      projectId: "",
      hospitalId: "",
      auditDate: "",
      status: "draft",
      findings: "[]",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.auditDate) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    let parsedFindings;
    try {
      parsedFindings = JSON.parse(formData.findings);
    } catch {
      toast({ title: "Invalid JSON in findings field", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      title: formData.title,
      description: formData.description || null,
      auditType: formData.auditType,
      projectId: formData.projectId || null,
      hospitalId: formData.hospitalId || null,
      auditDate: formData.auditDate,
      status: formData.status,
      findings: parsedFindings,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Compliance Audit</DialogTitle>
          <DialogDescription>
            Start a new compliance audit for a project or hospital.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Q4 2024 HIPAA Compliance Audit"
              data-testid="input-audit-title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Audit description and scope..."
              data-testid="input-audit-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Audit Type *</Label>
              <Select 
                value={formData.auditType} 
                onValueChange={(v) => setFormData({ ...formData, auditType: v })}
                data-testid="select-audit-type"
              >
                <SelectTrigger data-testid="select-audit-type-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} data-testid={`option-audit-type-${type.value}`}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v })}
                data-testid="select-audit-status"
              >
                <SelectTrigger data-testid="select-audit-status-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value} data-testid={`option-audit-status-${status.value}`}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(v) => setFormData({ ...formData, projectId: v })}
                data-testid="select-audit-project"
              >
                <SelectTrigger data-testid="select-audit-project-trigger">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} data-testid={`option-audit-project-${p.id}`}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hospital</Label>
              <Select 
                value={formData.hospitalId} 
                onValueChange={(v) => setFormData({ ...formData, hospitalId: v })}
                data-testid="select-audit-hospital"
              >
                <SelectTrigger data-testid="select-audit-hospital-trigger">
                  <SelectValue placeholder="Select hospital (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => (
                    <SelectItem key={h.id} value={h.id} data-testid={`option-audit-hospital-${h.id}`}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Audit Date *</Label>
            <Input
              type="date"
              value={formData.auditDate}
              onChange={(e) => setFormData({ ...formData, auditDate: e.target.value })}
              data-testid="input-audit-date"
            />
          </div>

          <div className="space-y-2">
            <Label>Findings (JSON)</Label>
            <Textarea
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              placeholder='[{"category": "Privacy", "finding": "...", "severity": "high", "status": "open"}]'
              className="font-mono text-sm"
              rows={5}
              data-testid="input-audit-findings"
            />
            <p className="text-xs text-muted-foreground">
              JSON array with category, finding, severity, and status fields
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-audit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            data-testid="button-create-audit"
          >
            {createMutation.isPending ? "Creating..." : "Create Audit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditDetailDialog({
  audit,
  open,
  onOpenChange
}: {
  audit: ComplianceAuditWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      return apiRequest("PATCH", `/api/compliance-audits/${audit?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compliance-audits'] });
      toast({ title: "Audit updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update audit", variant: "destructive" });
    }
  });

  if (!audit) return null;

  const findings = Array.isArray(audit.findings) ? audit.findings : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>{audit.title}</DialogTitle>
              <DialogDescription>
                {audit.auditType.charAt(0).toUpperCase() + audit.auditType.slice(1)} Audit
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getAuditStatusBadge(audit.status || "draft")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Audit Date</span>
              <p className="font-medium">
                {audit.auditDate ? format(new Date(audit.auditDate), "MMM d, yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Auditor</span>
              <p className="font-medium">
                {audit.auditor ? `${audit.auditor.firstName} ${audit.auditor.lastName}` : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {audit.project && (
              <div>
                <span className="text-sm text-muted-foreground">Project</span>
                <p className="font-medium">{audit.project.name}</p>
              </div>
            )}
            {audit.hospital && (
              <div>
                <span className="text-sm text-muted-foreground">Hospital</span>
                <p className="font-medium">{audit.hospital.name}</p>
              </div>
            )}
          </div>

          {audit.description && (
            <div>
              <span className="text-sm text-muted-foreground">Description</span>
              <p className="text-sm mt-1">{audit.description}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-muted-foreground">Overall Score</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold">
                  {audit.overallScore ? `${parseFloat(audit.overallScore).toFixed(0)}%` : "N/A"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-muted-foreground">Passed Checks</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold text-green-600">{audit.passedChecks || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs text-muted-foreground">Failed Checks</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-2xl font-bold text-red-600">{audit.failedChecks || 0}</p>
              </CardContent>
            </Card>
          </div>

          {findings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Findings ({findings.length})</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {findings.map((finding: any, index: number) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{finding.category || "General"}</Badge>
                            <Badge className={
                              finding.severity === "high" ? "bg-red-100 text-red-800" :
                              finding.severity === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }>
                              {finding.severity || "low"}
                            </Badge>
                          </div>
                          <p className="text-sm">{finding.finding}</p>
                        </div>
                        <Badge variant="outline" className={
                          finding.status === "resolved" ? "bg-green-100 text-green-800" : ""
                        }>
                          {finding.status || "open"}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {isAdmin && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select 
                  value={audit.status || "draft"} 
                  onValueChange={(v) => updateMutation.mutate({ status: v })}
                  data-testid="select-update-audit-status"
                >
                  <SelectTrigger data-testid="select-update-audit-status-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIT_STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value} data-testid={`option-update-audit-status-${s.value}`}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-audit-detail">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditsTab({ 
  audits, 
  isLoading,
  projects,
  hospitals
}: { 
  audits: ComplianceAuditWithDetails[];
  isLoading: boolean;
  projects: Project[];
  hospitals: Hospital[];
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAuditWithDetails | null>(null);

  const filteredAudits = audits.filter(audit => {
    if (typeFilter !== "all" && audit.auditType !== typeFilter) return false;
    if (statusFilter !== "all" && audit.status !== statusFilter) return false;
    if (projectFilter !== "all" && audit.projectId !== projectFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter} data-testid="filter-audit-type">
            <SelectTrigger className="w-[140px]" data-testid="filter-audit-type-trigger">
              <SelectValue placeholder="Audit Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-audit-type-all">All Types</SelectItem>
              {AUDIT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value} data-testid={`filter-audit-type-${type.value}`}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-audit-status">
            <SelectTrigger className="w-[140px]" data-testid="filter-audit-status-trigger">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-audit-status-all">All Statuses</SelectItem>
              {AUDIT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value} data-testid={`filter-audit-status-${status.value}`}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter} data-testid="filter-audit-project">
            <SelectTrigger className="w-[180px]" data-testid="filter-audit-project-trigger">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-audit-project-all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id} data-testid={`filter-audit-project-${p.id}`}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-new-audit">
            <Plus className="h-4 w-4 mr-2" />
            New Audit
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAudits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No audits found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {isAdmin ? "Create your first audit to get started." : "No audits match your filters."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-audit">
                <Plus className="h-4 w-4 mr-2" />
                Create Audit
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAudits.map(audit => (
            <Card 
              key={audit.id} 
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedAudit(audit)}
              data-testid={`card-audit-${audit.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      <FileCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{audit.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {audit.auditType.charAt(0).toUpperCase() + audit.auditType.slice(1)} Audit
                      </CardDescription>
                    </div>
                  </div>
                  {getAuditStatusBadge(audit.status || "draft")}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {audit.auditDate ? format(new Date(audit.auditDate), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>

                {audit.project && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{audit.project.name}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>{audit.passedChecks || 0} passed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span>{audit.failedChecks || 0} failed</span>
                  </div>
                  <div className="font-medium">
                    {audit.overallScore ? `${parseFloat(audit.overallScore).toFixed(0)}%` : "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAuditDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projects={projects}
        hospitals={hospitals}
      />

      <AuditDetailDialog
        audit={selectedAudit}
        open={!!selectedAudit}
        onOpenChange={(open) => !open && setSelectedAudit(null)}
      />
    </div>
  );
}

export default function ComplianceCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: analytics, isLoading: analyticsLoading } = useQuery<ComplianceAnalytics>({
    queryKey: ['/api/analytics/compliance'],
  });

  const { data: checks = [], isLoading: checksLoading } = useQuery<ComplianceCheckWithDetails[]>({
    queryKey: ['/api/compliance-checks'],
  });

  const { data: audits = [], isLoading: auditsLoading } = useQuery<ComplianceAuditWithDetails[]>({
    queryKey: ['/api/compliance-audits'],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: hospitals = [] } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Compliance Center</h1>
          <p className="text-muted-foreground">HIPAA compliance management and monitoring</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-compliance">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <Shield className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="checks" data-testid="tab-checks">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Checks
          </TabsTrigger>
          <TabsTrigger value="audits" data-testid="tab-audits">
            <FileCheck className="h-4 w-4 mr-2" />
            Audits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab analytics={analyticsLoading ? null : (analytics || null)} />
        </TabsContent>

        <TabsContent value="checks" className="space-y-6">
          <ChecksTab 
            checks={checks} 
            isLoading={checksLoading}
            consultants={consultants}
          />
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <AuditsTab 
            audits={audits} 
            isLoading={auditsLoading}
            projects={projects}
            hospitals={hospitals}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
