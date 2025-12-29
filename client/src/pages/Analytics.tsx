import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  KpiCard,
  TrendChart,
  StatusDistributionCard,
  PieChartCard
} from "@/components/analytics";
import {
  Users,
  Building2,
  FolderKanban,
  DollarSign,
  FileCheck,
  TrendingUp,
  Calendar,
  Star,
  Activity,
  Target,
  FileText,
  Plus,
  Download,
  Clock,
  Play,
  Trash2,
  BarChart3,
  Table,
  Filter,
  Settings,
  Send
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { PlatformAnalytics, HospitalAnalytics, ConsultantAnalytics, SavedReport, ReportTemplate, ScheduledReport } from "@shared/schema";

interface AnalyticsResponse {
  type: 'platform' | 'hospital' | 'consultant';
  data: PlatformAnalytics | HospitalAnalytics | ConsultantAnalytics | null;
}

interface SavedReportWithDetails extends SavedReport {
  template?: ReportTemplate | null;
  user?: { firstName: string; lastName: string } | null;
  scheduledReports?: ScheduledReport[];
  lastRun?: { status: string; completedAt: string } | null;
}

const DATA_SOURCES = [
  { value: "consultants", label: "Consultants" },
  { value: "projects", label: "Projects" },
  { value: "hospitals", label: "Hospitals" },
  { value: "timesheets", label: "Timesheets" },
  { value: "support_tickets", label: "Support Tickets" },
  { value: "documents", label: "Documents" },
];

const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: Table },
  { value: "excel", label: "Excel", icon: FileText },
  { value: "pdf", label: "PDF", icon: FileText },
];

const SCHEDULE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function Analytics() {
  const { isAdmin, isHospitalStaff, isConsultant } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: analytics, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["/api/analytics/me"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics?.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="analytics-tabs">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {isAdmin && analytics.type === 'platform' && (
            <PlatformDashboard data={analytics.data as PlatformAnalytics} />
          )}
          {isHospitalStaff && analytics.type === 'hospital' && (
            <HospitalDashboard data={analytics.data as HospitalAnalytics} />
          )}
          {isConsultant && analytics.type === 'consultant' && (
            <ConsultantDashboard data={analytics.data as ConsultantAnalytics} />
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportBuilder() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedReportWithDetails | null>(null);
  const [exportFormat, setExportFormat] = useState("csv");

  const { data: savedReports = [], isLoading: reportsLoading } = useQuery<SavedReportWithDetails[]>({
    queryKey: ["/api/saved-reports"],
  });

  const { data: templates = [] } = useQuery<ReportTemplate[]>({
    queryKey: ["/api/report-templates"],
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/saved-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-reports"] });
      toast({ title: "Report deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete report", variant: "destructive" });
    },
  });

  const runReportMutation = useMutation({
    mutationFn: async (report: SavedReportWithDetails) => {
      const config = report.config as Record<string, unknown> || {};
      return apiRequest("POST", "/api/reports/preview", {
        dataSource: config.dataSource || "consultants",
        selectedFields: config.selectedFields || ["id", "name"],
        filters: config.filters || {},
        limit: 100,
      });
    },
    onSuccess: (data) => {
      toast({ title: "Report generated successfully" });
      // Handle export based on format
      handleExport(data, exportFormat);
    },
    onError: () => {
      toast({ title: "Failed to generate report", variant: "destructive" });
    },
  });

  const handleExport = (data: unknown, format: string) => {
    const reportData = data as { data: Record<string, unknown>[]; columns: string[] };

    if (format === "csv") {
      const csv = [
        reportData.columns.join(","),
        ...reportData.data.map((row: Record<string, unknown>) =>
          reportData.columns.map(col => JSON.stringify(row[col] ?? "")).join(",")
        )
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "excel" || format === "pdf") {
      toast({ title: `${format.toUpperCase()} export prepared`, description: "Download starting..." });
      // For demo purposes, export as CSV
      handleExport(data, "csv");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-reports-title">Report Builder</h2>
          <p className="text-muted-foreground">Create, manage, and schedule custom reports</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-report">
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {reportsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : savedReports.length === 0 ? (
        <Card data-testid="empty-reports">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved reports</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first custom report to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-report">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="saved-reports-list">
          {savedReports.map((report) => (
            <Card key={report.id} data-testid={`report-card-${report.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  {report.isPublic && (
                    <Badge variant="secondary">Public</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {report.createdAt ? format(new Date(report.createdAt), "MMM d, yyyy") : "N/A"}</span>
                </div>

                {report.lastRun && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last run: {format(new Date(report.lastRun.completedAt), "MMM d, yyyy")}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-24" data-testid={`select-export-${report.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_FORMATS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    onClick={() => runReportMutation.mutate(report)}
                    disabled={runReportMutation.isPending}
                    data-testid={`button-run-${report.id}`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowScheduleDialog(true);
                    }}
                    data-testid={`button-schedule-${report.id}`}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this report?")) {
                        deleteReportMutation.mutate(report.id);
                      }
                    }}
                    data-testid={`button-delete-${report.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateReportDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        templates={templates}
      />

      <ScheduleReportDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        report={selectedReport}
      />
    </>
  );
}

function CreateReportDialog({
  open,
  onOpenChange,
  templates,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ReportTemplate[];
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dataSource, setDataSource] = useState("consultants");
  const [templateId, setTemplateId] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const fieldsBySource: Record<string, string[]> = {
    consultants: ["id", "firstName", "lastName", "email", "status", "specialty", "hourlyRate"],
    projects: ["id", "name", "status", "budget", "startDate", "endDate", "hospitalName"],
    hospitals: ["id", "name", "location", "bedCount", "activeProjects"],
    timesheets: ["id", "consultantName", "projectName", "hoursWorked", "date", "status"],
    support_tickets: ["id", "title", "status", "priority", "createdAt", "resolvedAt"],
    documents: ["id", "name", "type", "status", "uploadedAt", "expirationDate"],
  };

  const createReportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/saved-reports", {
        name,
        description,
        templateId: templateId || null,
        isPublic,
        config: {
          dataSource,
          selectedFields,
          filters: {},
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-reports"] });
      toast({ title: "Report created successfully" });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create report", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setDataSource("consultants");
    setTemplateId("");
    setIsPublic(false);
    setSelectedFields([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Custom Report</DialogTitle>
          <DialogDescription>
            Build a new report by selecting data source and fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly Consultant Summary"
              data-testid="input-report-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this report contains..."
              data-testid="input-report-description"
            />
          </div>

          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger data-testid="select-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Data Source</Label>
            <Select value={dataSource} onValueChange={(v) => {
              setDataSource(v);
              setSelectedFields([]);
            }}>
              <SelectTrigger data-testid="select-data-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATA_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Fields</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto" data-testid="fields-list">
              {fieldsBySource[dataSource]?.map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={`field-${field}`}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields([...selectedFields, field]);
                      } else {
                        setSelectedFields(selectedFields.filter((f) => f !== field));
                      }
                    }}
                  />
                  <Label htmlFor={`field-${field}`} className="text-sm font-normal">
                    {field}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is-public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
              data-testid="checkbox-public"
            />
            <Label htmlFor="is-public" className="text-sm font-normal">
              Make this report public (visible to all users)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createReportMutation.mutate()}
            disabled={!name || selectedFields.length === 0 || createReportMutation.isPending}
            data-testid="button-submit-report"
          >
            Create Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleReportDialog({
  open,
  onOpenChange,
  report,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: SavedReportWithDetails | null;
}) {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState("weekly");
  const [exportFormat, setExportFormat] = useState("csv");
  const [recipients, setRecipients] = useState("");

  const scheduleReportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reports/schedule", {
        savedReportId: report?.id,
        schedule,
        exportFormat,
        recipients: recipients.split(",").map((r) => r.trim()).filter(Boolean),
        name: `Scheduled: ${report?.name}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-reports"] });
      toast({ title: "Report scheduled successfully" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to schedule report", variant: "destructive" });
    },
  });

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogDescription>
            Set up automatic delivery for "{report.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={schedule} onValueChange={setSchedule}>
              <SelectTrigger data-testid="select-schedule">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger data-testid="select-schedule-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="user@example.com, team@example.com"
              data-testid="input-recipients"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => scheduleReportMutation.mutate()}
            disabled={scheduleReportMutation.isPending}
            data-testid="button-submit-schedule"
          >
            <Send className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function PlatformDashboard({ data }: { data: PlatformAnalytics }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of platform performance and key metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Consultants"
          value={data.overview.totalConsultants}
          subtitle={`${data.overview.activeConsultants} active`}
          icon={Users}
          data-testid="kpi-total-consultants"
        />
        <KpiCard
          title="Hospitals"
          value={data.overview.totalHospitals}
          subtitle={`${data.overview.activeHospitals} active`}
          icon={Building2}
          data-testid="kpi-hospitals"
        />
        <KpiCard
          title="Active Projects"
          value={data.overview.activeProjects}
          subtitle={`${data.overview.totalProjects} total`}
          icon={FolderKanban}
          data-testid="kpi-active-projects"
        />
        <KpiCard
          title="Total Savings"
          value={formatCurrency(data.overview.totalSavings)}
          icon={DollarSign}
          data-testid="kpi-total-savings"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TrendChart
          title="Activity Trend (30 Days)"
          data={data.activityTrend}
          dataKey="count"
          data-testid="chart-activity-trend"
        />
        <StatusDistributionCard
          title="Project Status"
          items={[
            { label: "Active", value: data.projectsByStatus.active },
            { label: "Draft", value: data.projectsByStatus.draft },
            { label: "Completed", value: data.projectsByStatus.completed },
            { label: "Cancelled", value: data.projectsByStatus.cancelled },
          ]}
          data-testid="chart-project-status"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusDistributionCard
          title="Consultant Status"
          items={[
            { label: "Onboarded", value: data.consultantsByStatus.onboarded },
            { label: "Pending", value: data.consultantsByStatus.pending },
            { label: "Available", value: data.consultantsByStatus.available },
            { label: "Unavailable", value: data.consultantsByStatus.unavailable },
          ]}
          data-testid="chart-consultant-status"
        />
        <StatusDistributionCard
          title="Document Compliance"
          items={[
            { label: "Approved", value: data.documentCompliance.approved },
            { label: "Pending", value: data.documentCompliance.pending },
            { label: "Rejected", value: data.documentCompliance.rejected },
            { label: "Expired", value: data.documentCompliance.expired },
          ]}
          data-testid="chart-document-compliance"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PieChartCard
          title="Users by Role"
          data={[
            { name: "Admin", value: data.usersByRole.admin },
            { name: "Hospital Staff", value: data.usersByRole.hospital_staff },
            { name: "Consultant", value: data.usersByRole.consultant },
          ]}
          data-testid="chart-users-by-role"
        />
        <Card data-testid="card-compliance-rate">
          <CardHeader>
            <CardTitle className="text-base">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted"
                    fill="none"
                    strokeWidth="10"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="stroke-primary"
                    fill="none"
                    strokeWidth="10"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${data.documentCompliance.complianceRate * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{data.documentCompliance.complianceRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {data.documentCompliance.approved} of {data.documentCompliance.total} documents approved
                </p>
                <p className="text-sm font-medium">
                  {data.overview.totalUsers} total users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function HospitalDashboard({ data }: { data: HospitalAnalytics }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
          {data.hospitalName} Analytics
        </h1>
        <p className="text-muted-foreground">
          ROI metrics, budget tracking, and consultant performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Projects"
          value={data.overview.totalProjects}
          subtitle={`${data.overview.activeProjects} active`}
          icon={FolderKanban}
          data-testid="kpi-total-projects"
        />
        <KpiCard
          title="Total Budget"
          value={formatCurrency(data.overview.totalBudget)}
          icon={Target}
          data-testid="kpi-total-budget"
        />
        <KpiCard
          title="Total Savings"
          value={formatCurrency(data.overview.totalSavings)}
          icon={DollarSign}
          data-testid="kpi-total-savings"
        />
        <KpiCard
          title="Average ROI"
          value={`${data.overview.averageRoi}%`}
          icon={TrendingUp}
          data-testid="kpi-average-roi"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-savings-breakdown">
          <CardHeader>
            <CardTitle className="text-base">Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Labor Savings</span>
              <span className="font-medium">{formatCurrency(data.savingsBreakdown.laborSavings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Benefits Savings</span>
              <span className="font-medium">{formatCurrency(data.savingsBreakdown.benefitsSavings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overhead Savings</span>
              <span className="font-medium">{formatCurrency(data.savingsBreakdown.overheadSavings)}</span>
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-medium">Total Savings</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(data.savingsBreakdown.totalSavings)}</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-project-breakdown">
          <CardHeader>
            <CardTitle className="text-base">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.projectBreakdown.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No projects yet</p>
            ) : (
              data.projectBreakdown.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.consultantsAssigned} consultants
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {data.consultantPerformance.length > 0 && (
        <Card data-testid="card-consultant-performance">
          <CardHeader>
            <CardTitle className="text-base">Consultant Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.consultantPerformance.map((consultant) => (
                <div key={consultant.consultantId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{consultant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {consultant.shiftsCompleted} shifts completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{consultant.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function ConsultantDashboard({ data }: { data: ConsultantAnalytics }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">My Analytics</h1>
        <p className="text-muted-foreground">
          Your performance metrics, earnings, and compliance status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Completed Shifts"
          value={data.overview.completedShifts}
          subtitle={`${data.overview.upcomingShifts} upcoming`}
          icon={Calendar}
          data-testid="kpi-completed-shifts"
        />
        <KpiCard
          title="Average Rating"
          value={data.overview.averageRating.toFixed(1)}
          icon={Star}
          data-testid="kpi-average-rating"
        />
        <KpiCard
          title="Utilization Rate"
          value={`${data.overview.utilizationRate}%`}
          icon={Activity}
          data-testid="kpi-utilization-rate"
        />
        <KpiCard
          title="Compliance Rate"
          value={`${data.documentStatus.complianceRate}%`}
          icon={FileCheck}
          data-testid="kpi-compliance-rate"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatusDistributionCard
          title="Document Status"
          items={[
            { label: "Approved", value: data.documentStatus.approved },
            { label: "Pending", value: data.documentStatus.pending },
            { label: "Rejected", value: data.documentStatus.rejected },
            { label: "Expired", value: data.documentStatus.expired },
          ]}
          data-testid="chart-document-status"
        />

        <Card data-testid="card-skills-utilization">
          <CardHeader>
            <CardTitle className="text-base">Skills Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.skillsUtilization.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No skills data available</p>
            ) : (
              data.skillsUtilization.map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.skill}</span>
                  <span className="text-xs text-muted-foreground">{skill.projectsUsed} projects</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {data.expiringDocuments.length > 0 && (
        <Card data-testid="card-expiring-documents">
          <CardHeader>
            <CardTitle className="text-base text-amber-600">Expiring Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.expiringDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.typeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">
                      {doc.daysUntilExpiry} days left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {doc.expirationDate ? new Date(doc.expirationDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.shiftHistory.length > 0 && (
        <Card data-testid="card-shift-history">
          <CardHeader>
            <CardTitle className="text-base">Recent Shift History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.shiftHistory.slice(0, 5).map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{shift.projectName}</p>
                    <p className="text-xs text-muted-foreground">{shift.hospitalName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {shift.date ? new Date(shift.date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{shift.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
