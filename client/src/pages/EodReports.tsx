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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useProjectContext } from "@/hooks/use-project-context";
import { ProjectSelector } from "@/components/ProjectSelector";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import { 
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Send,
  Download,
  Calendar,
  Building2,
  User,
  ChevronRight,
  TrendingUp,
  BarChart3
} from "lucide-react";
import type { Project, EodReportWithDetails, EodReportAnalytics } from "@shared/schema";

const REPORT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "approved", label: "Approved", color: "bg-green-500 text-white" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

function getStatusBadge(status: string) {
  const config = REPORT_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function AnalyticsCards({ analytics }: { analytics?: EodReportAnalytics }) {
  if (!analytics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card data-testid="stat-total-reports">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalReports}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-submitted-today">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Submitted Today</CardTitle>
          <Send className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.submittedToday}</div>
          <p className="text-xs text-muted-foreground">Daily reports</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-pending-approval">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.pendingApproval}</div>
          <p className="text-xs text-muted-foreground">Awaiting review</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-avg-resolved">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Issues Resolved</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageIssuesResolved}</div>
          <p className="text-xs text-muted-foreground">Per report</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-avg-pending">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Issues Pending</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageIssuesPending}</div>
          <p className="text-xs text-muted-foreground">Per report</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportRow({ 
  report, 
  onClick 
}: { 
  report: EodReportWithDetails; 
  onClick: () => void;
}) {
  return (
    <TableRow 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`report-row-${report.id}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{report.reportDate}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{report.project?.name || "N/A"}</span>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(report.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {report.submittedBy?.firstName || ""} {report.submittedBy?.lastName || ""}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{report.issuesResolved || 0}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-600">{report.issuesPending || 0}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">{report.issuesEscalated || 0}</div>
            <div className="text-xs text-muted-foreground">Escalated</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {report.submittedAt ? formatDistanceToNow(new Date(report.submittedAt), { addSuffix: true }) : "Not submitted"}
        </div>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}

function ReportDetailDialog({
  report,
  open,
  onOpenChange,
  onApprove,
  onReject
}: {
  report: EodReportWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            EOD Report - {report.reportDate}
          </DialogTitle>
          <DialogDescription>
            {report.project?.name} | Submitted by {report.submittedBy?.firstName} {report.submittedBy?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(report.status)}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold text-green-600">{report.issuesResolved || 0}</div>
                <p className="text-sm text-muted-foreground">Issues Resolved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{report.issuesPending || 0}</div>
                <p className="text-sm text-muted-foreground">Issues Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-3xl font-bold text-red-600">{report.issuesEscalated || 0}</div>
                <p className="text-sm text-muted-foreground">Issues Escalated</p>
              </CardContent>
            </Card>
          </div>

          {report.resolvedSummary && (
            <div className="space-y-2">
              <Label>Summary</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="whitespace-pre-wrap text-sm">{report.resolvedSummary}</p>
              </div>
            </div>
          )}

          {report.highlights && (
            <div className="space-y-2">
              <Label>Key Accomplishments</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="whitespace-pre-wrap text-sm">{report.highlights}</p>
              </div>
            </div>
          )}

          {report.challenges && (
            <div className="space-y-2">
              <Label>Challenges</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="whitespace-pre-wrap text-sm">{report.challenges}</p>
              </div>
            </div>
          )}

          {report.tomorrowPlan && (
            <div className="space-y-2">
              <Label>Planned for Tomorrow</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="whitespace-pre-wrap text-sm">{report.tomorrowPlan}</p>
              </div>
            </div>
          )}

          {report.approvedBy && (
            <div className="text-sm text-muted-foreground">
              Approved by {report.approvedBy.firstName} {report.approvedBy.lastName}
              {report.approvedAt && ` on ${format(new Date(report.approvedAt), "MMM d, yyyy h:mm a")}`}
            </div>
          )}
        </div>

        {report.status === "submitted" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onReject(report.id)} data-testid="button-reject">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => onApprove(report.id)} data-testid="button-approve">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateReportDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    projectId: "",
    reportDate: today,
    resolvedSummary: "",
    highlights: "",
    challenges: "",
    tomorrowPlan: "",
    issuesResolved: 0,
    issuesPending: 0,
    issuesEscalated: 0,
  });
  const [autoPopulating, setAutoPopulating] = useState(false);
  const { toast } = useToast();

  const autoPopulateMutation = useMutation({
    mutationFn: async ({ projectId, date }: { projectId: string; date: string }) => {
      const res = await fetch(`/api/projects/${projectId}/eod-reports/auto-populate?date=${date}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to auto-populate");
      return res.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        issuesResolved: data.issuesResolved || 0,
        issuesPending: data.issuesPending || 0,
        issuesEscalated: data.issuesEscalated || 0,
      }));
      toast({ title: "Issues auto-populated from tickets" });
    },
    onError: () => {
      toast({ title: "Failed to auto-populate", variant: "destructive" });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/eod-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eod-reports'] });
      onOpenChange(false);
      setFormData({
        projectId: "",
        reportDate: today,
        resolvedSummary: "",
        highlights: "",
        challenges: "",
        tomorrowPlan: "",
        issuesResolved: 0,
        issuesPending: 0,
        issuesEscalated: 0,
      });
      toast({ title: "EOD report created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create EOD report", variant: "destructive" });
    }
  });

  const handleAutoPopulate = () => {
    if (formData.projectId) {
      autoPopulateMutation.mutate({ projectId: formData.projectId, date: formData.reportDate });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create EOD Report</DialogTitle>
          <DialogDescription>
            Submit your end-of-day report summarizing today&apos;s work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Report Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                data-testid="input-date"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <span className="text-sm text-muted-foreground">Auto-populate issue counts from tickets</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoPopulate}
              disabled={!formData.projectId || autoPopulateMutation.isPending}
              data-testid="button-auto-populate"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Auto-populate
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resolved">Issues Resolved</Label>
              <Input
                id="resolved"
                type="number"
                min="0"
                value={formData.issuesResolved}
                onChange={(e) => setFormData({ ...formData, issuesResolved: parseInt(e.target.value) || 0 })}
                data-testid="input-resolved"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pending">Issues Pending</Label>
              <Input
                id="pending"
                type="number"
                min="0"
                value={formData.issuesPending}
                onChange={(e) => setFormData({ ...formData, issuesPending: parseInt(e.target.value) || 0 })}
                data-testid="input-pending"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalated">Issues Escalated</Label>
              <Input
                id="escalated"
                type="number"
                min="0"
                value={formData.issuesEscalated}
                onChange={(e) => setFormData({ ...formData, issuesEscalated: parseInt(e.target.value) || 0 })}
                data-testid="input-escalated"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.resolvedSummary}
              onChange={(e) => setFormData({ ...formData, resolvedSummary: e.target.value })}
              placeholder="Brief summary of today's work..."
              className="min-h-[80px]"
              data-testid="input-summary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accomplishments">Key Accomplishments</Label>
            <Textarea
              id="accomplishments"
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              placeholder="Major milestones or achievements..."
              className="min-h-[80px]"
              data-testid="input-accomplishments"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges</Label>
            <Textarea
              id="challenges"
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="Any blockers or issues encountered..."
              className="min-h-[80px]"
              data-testid="input-challenges"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tomorrow">Planned for Tomorrow</Label>
            <Textarea
              id="tomorrow"
              value={formData.tomorrowPlan}
              onChange={(e) => setFormData({ ...formData, tomorrowPlan: e.target.value })}
              placeholder="Tasks planned for the next day..."
              className="min-h-[80px]"
              data-testid="input-tomorrow"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.projectId || !formData.reportDate || createMutation.isPending}
            data-testid="button-create-report"
          >
            Create Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EodReports() {
  const [selectedReport, setSelectedReport] = useState<EodReportWithDetails | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { filterByProject, isAdmin } = useProjectContext();

  const { data: reportsRaw = [], isLoading: reportsLoading } = useQuery<EodReportWithDetails[]>({
    queryKey: ['/api/eod-reports'],
  });

  const { data: analytics } = useQuery<EodReportAnalytics>({
    queryKey: ['/api/eod-reports/analytics'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const reports = filterByProject(reportsRaw);

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/eod-reports/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eod-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/eod-reports/analytics'] });
      setSelectedReport(null);
      toast({ title: "Report approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve report", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/eod-reports/${id}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eod-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/eod-reports/analytics'] });
      setSelectedReport(null);
      toast({ title: "Report rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject report", variant: "destructive" });
    }
  });

  const filteredReports = reports.filter(report => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EOD Reports</h1>
          <p className="text-muted-foreground">
            End-of-day reports for daily work summaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <ProjectSelector className="mr-2" showAllOption />}
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-new-report">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <AnalyticsCards analytics={analytics} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>
                {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="filter-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {REPORT_STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first EOD report to get started"}
              </p>
              {statusFilter === "all" && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map(report => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    onClick={() => setSelectedReport(report)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReportDetailDialog
        report={selectedReport}
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id) => rejectMutation.mutate(id)}
      />

      <CreateReportDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projects={projects}
      />
    </div>
  );
}
