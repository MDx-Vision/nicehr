import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  FileText,
  Award,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSummary,
  fetchMetrics,
  createMetric,
  updateMetric,
  deleteMetric,
  updateMetricValue,
  seedMetrics,
  fetchEndorsements,
  createEndorsement,
  updateEndorsement,
  deleteEndorsement,
  fetchSowCriteria,
  createSowCriterion,
  verifySowCriterion,
  deleteSowCriterion,
  fetchReports,
  generateReport,
  EXECUTIVE_ROLES,
  METRIC_CATEGORIES,
  METRIC_STATUSES,
  type ExecutiveMetric,
  type ExecutiveSummary,
  type SuccessEndorsement,
  type SowCriterion,
  type ExecutiveReport,
} from "@/lib/executiveMetricsApi";

export default function ExecutiveMetricsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [updateValueDialog, setUpdateValueDialog] = useState<{
    open: boolean;
    metric: ExecutiveMetric | null;
  }>({ open: false, metric: null });
  const [newValue, setNewValue] = useState("");
  const [newValueNotes, setNewValueNotes] = useState("");
  const [endorsementDialog, setEndorsementDialog] = useState<{
    open: boolean;
    endorsement: SuccessEndorsement | null;
  }>({ open: false, endorsement: null });
  const [sowDialog, setSowDialog] = useState<{
    open: boolean;
    criterion: SowCriterion | null;
  }>({ open: false, criterion: null });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      return res.json();
    },
  });

  // Fetch summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["executive-summary", selectedProjectId, selectedRole],
    queryFn: () =>
      fetchSummary(
        selectedProjectId,
        selectedRole !== "all" ? selectedRole : undefined
      ),
    enabled: !!selectedProjectId,
  });

  // Fetch endorsements
  const { data: endorsements = [] } = useQuery({
    queryKey: ["endorsements", selectedProjectId],
    queryFn: () => fetchEndorsements(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Fetch SOW criteria
  const { data: sowCriteria = [] } = useQuery({
    queryKey: ["sow-criteria", selectedProjectId],
    queryFn: () => fetchSowCriteria(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Fetch reports
  const { data: reports = [] } = useQuery({
    queryKey: ["executive-reports", selectedProjectId],
    queryFn: () => fetchReports(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  // Mutations
  const seedMetricsMutation = useMutation({
    mutationFn: ({ role }: { role: string }) =>
      seedMetrics(selectedProjectId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      toast({ title: "Metrics seeded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to seed metrics", variant: "destructive" });
    },
  });

  const updateValueMutation = useMutation({
    mutationFn: ({
      id,
      value,
      notes,
    }: {
      id: string;
      value: string;
      notes?: string;
    }) => updateMetricValue(id, value, undefined, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      setUpdateValueDialog({ open: false, metric: null });
      setNewValue("");
      setNewValueNotes("");
      toast({ title: "Value updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update value", variant: "destructive" });
    },
  });

  const createEndorsementMutation = useMutation({
    mutationFn: (data: Partial<SuccessEndorsement>) =>
      createEndorsement(selectedProjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endorsements"] });
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      setEndorsementDialog({ open: false, endorsement: null });
      toast({ title: "Endorsement created" });
    },
    onError: () => {
      toast({ title: "Failed to create endorsement", variant: "destructive" });
    },
  });

  const updateEndorsementMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SuccessEndorsement>;
    }) => updateEndorsement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endorsements"] });
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      toast({ title: "Endorsement updated" });
    },
    onError: () => {
      toast({ title: "Failed to update endorsement", variant: "destructive" });
    },
  });

  const deleteEndorsementMutation = useMutation({
    mutationFn: (id: string) => deleteEndorsement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endorsements"] });
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      toast({ title: "Endorsement deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete endorsement", variant: "destructive" });
    },
  });

  const createSowMutation = useMutation({
    mutationFn: (data: Partial<SowCriterion>) =>
      createSowCriterion(selectedProjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sow-criteria"] });
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      setSowDialog({ open: false, criterion: null });
      toast({ title: "SOW criterion created" });
    },
    onError: () => {
      toast({ title: "Failed to create SOW criterion", variant: "destructive" });
    },
  });

  const verifySowMutation = useMutation({
    mutationFn: ({
      id,
      value,
      evidence,
    }: {
      id: string;
      value: string;
      evidence?: string;
    }) => verifySowCriterion(id, value, evidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sow-criteria"] });
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      toast({ title: "SOW criterion verified" });
    },
    onError: () => {
      toast({ title: "Failed to verify SOW criterion", variant: "destructive" });
    },
  });

  const deleteSowMutation = useMutation({
    mutationFn: (id: string) => deleteSowCriterion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sow-criteria"] });
      queryClient.invalidateQueries({ queryKey: ["executive-summary"] });
      toast({ title: "SOW criterion deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete SOW criterion", variant: "destructive" });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: (data: { executiveRole?: string; reportType?: string; title?: string }) =>
      generateReport(selectedProjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executive-reports"] });
      toast({ title: "Report generated" });
    },
    onError: () => {
      toast({ title: "Failed to generate report", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const config = METRIC_STATUSES.find((s) => s.value === status);
    if (!config)
      return <Badge variant="outline">{status}</Badge>;

    const colors: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800",
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      emerald: "bg-emerald-100 text-emerald-800",
      red: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[config.color] || ""}>{config.label}</Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const config = METRIC_CATEGORIES.find((c) => c.value === category);
    if (!config)
      return <Badge variant="outline">{category}</Badge>;

    const colors: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800",
      orange: "bg-orange-100 text-orange-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={colors[config.color] || ""}>{config.label}</Badge>
    );
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Executive Success Metrics
            </CardTitle>
            <CardDescription>
              Select a project to manage its executive success metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Executive Success Metrics
          </h1>
          <p className="text-muted-foreground">
            Track and manage success criteria for C-suite executives
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project: any) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {EXECUTIVE_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
          <TabsTrigger value="sow">SOW Criteria</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {summaryLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : summary ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Total</span>
                    </div>
                    <p className="text-2xl font-bold">{summary.summary.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-muted-foreground">Achieved</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {summary.summary.achieved}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">On Track</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.summary.onTrack}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">At Risk</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {summary.summary.atRisk}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">Missed</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {summary.summary.missed}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-muted-foreground">Not Started</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">
                      {summary.summary.notStarted}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Achievement Rate</span>
                      <span className="text-sm font-medium">
                        {summary.achievementRate}%
                      </span>
                    </div>
                    <Progress value={summary.achievementRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Progress Rate (Achieved + On Track)</span>
                      <span className="text-sm font-medium">
                        {summary.progressRate}%
                      </span>
                    </div>
                    <Progress value={summary.progressRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Endorsements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-medium">{summary.endorsements.total}</span>
                      </div>
                      <div className="flex justify-between text-yellow-600">
                        <span>Pending</span>
                        <span className="font-medium">{summary.endorsements.pending}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Received</span>
                        <span className="font-medium">{summary.endorsements.received}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>Published</span>
                        <span className="font-medium">{summary.endorsements.published}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      SOW Success Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-medium">{summary.sowCriteria.total}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Achieved</span>
                        <span className="font-medium">{summary.sowCriteria.achieved}</span>
                      </div>
                      <div className="flex justify-between text-yellow-600">
                        <span>Pending</span>
                        <span className="font-medium">{summary.sowCriteria.pending}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metrics by Role */}
              <Card>
                <CardHeader>
                  <CardTitle>Metrics by Executive Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {EXECUTIVE_ROLES.map((role) => {
                      const roleMetrics = summary.byRole[role.value] || [];
                      const achieved = roleMetrics.filter(
                        (m) => m.status === "achieved"
                      ).length;
                      return (
                        <div
                          key={role.value}
                          className="p-4 border rounded-lg text-center"
                        >
                          <p className="font-bold text-lg">{role.label}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {role.title}
                          </p>
                          <p className="text-2xl font-bold">
                            {roleMetrics.length}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {achieved} achieved
                          </p>
                          {roleMetrics.length === 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() =>
                                seedMetricsMutation.mutate({ role: role.value })
                              }
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Seed
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          )}
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Success Metrics</h2>
            <div className="flex gap-2">
              {EXECUTIVE_ROLES.map((role) => (
                <Button
                  key={role.value}
                  size="sm"
                  variant="outline"
                  onClick={() => seedMetricsMutation.mutate({ role: role.value })}
                  disabled={seedMetricsMutation.isPending}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Seed {role.label}
                </Button>
              ))}
            </div>
          </div>

          {summary?.metrics && summary.metrics.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {metric.executiveRole.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{getCategoryBadge(metric.category)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{metric.metricName}</p>
                          {metric.description && (
                            <p className="text-xs text-muted-foreground">
                              {metric.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {metric.targetValue} {metric.targetUnit}
                      </TableCell>
                      <TableCell>
                        {metric.currentValue || "-"} {metric.currentValue && metric.targetUnit}
                      </TableCell>
                      <TableCell>{getStatusBadge(metric.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid="update-metric-value"
                          onClick={() => {
                            setUpdateValueDialog({ open: true, metric });
                            setNewValue(metric.currentValue || "");
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No metrics defined yet. Use the "Seed" buttons above to add default
                metrics for each executive role.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Endorsements Tab */}
        <TabsContent value="endorsements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Success Endorsements</h2>
            <Button
              onClick={() => setEndorsementDialog({ open: true, endorsement: null })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Endorsement
            </Button>
          </div>

          {endorsements.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Executive</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endorsements.map((endorsement) => (
                    <TableRow key={endorsement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{endorsement.executiveName}</p>
                          {endorsement.executiveTitle && (
                            <p className="text-xs text-muted-foreground">
                              {endorsement.executiveTitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {endorsement.executiveRole.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{endorsement.endorsementType || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            endorsement.status === "received"
                              ? "bg-green-100 text-green-800"
                              : endorsement.status === "published"
                              ? "bg-blue-100 text-blue-800"
                              : endorsement.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : ""
                          }
                        >
                          {endorsement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {endorsement.requestedAt
                          ? new Date(endorsement.requestedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {endorsement.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateEndorsementMutation.mutate({
                                  id: endorsement.id,
                                  data: { status: "received" },
                                })
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteEndorsementMutation.mutate(endorsement.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No endorsements requested yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SOW Criteria Tab */}
        <TabsContent value="sow" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">SOW Success Criteria</h2>
            <Button onClick={() => setSowDialog({ open: true, criterion: null })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </div>

          {sowCriteria.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Achieved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sowCriteria.map((criterion) => (
                    <TableRow key={criterion.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {criterion.executiveRole.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">{criterion.criteriaText}</p>
                      </TableCell>
                      <TableCell>{criterion.targetValue || "-"}</TableCell>
                      <TableCell>{criterion.achievedValue || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            criterion.status === "achieved"
                              ? "bg-green-100 text-green-800"
                              : criterion.status === "not_achieved"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {criterion.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {criterion.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const value = prompt("Enter achieved value:");
                                if (value) {
                                  verifySowMutation.mutate({
                                    id: criterion.id,
                                    value,
                                  });
                                }
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSowMutation.mutate(criterion.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No SOW success criteria defined yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Executive Reports</h2>
            <Button
              onClick={() =>
                generateReportMutation.mutate({
                  reportType: "monthly",
                  title: `Executive Report - ${new Date().toLocaleDateString()}`,
                })
              }
              disabled={generateReportMutation.isPending}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          {reports.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.reportType}</Badge>
                      </TableCell>
                      <TableCell>
                        {report.executiveRole?.toUpperCase() || "All"}
                      </TableCell>
                      <TableCell>
                        {new Date(report.generatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No reports generated yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Update Value Dialog */}
      <Dialog
        open={updateValueDialog.open}
        onOpenChange={(open) =>
          setUpdateValueDialog({ open, metric: open ? updateValueDialog.metric : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Metric Value</DialogTitle>
            <DialogDescription>
              {updateValueDialog.metric?.metricName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target: {updateValueDialog.metric?.targetValue} {updateValueDialog.metric?.targetUnit}</Label>
            </div>
            <div>
              <Label htmlFor="newValue">New Value</Label>
              <Input
                id="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter current value"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={newValueNotes}
                onChange={(e) => setNewValueNotes(e.target.value)}
                placeholder="Add any notes about this update"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateValueDialog({ open: false, metric: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (updateValueDialog.metric && newValue) {
                  updateValueMutation.mutate({
                    id: updateValueDialog.metric.id,
                    value: newValue,
                    notes: newValueNotes,
                  });
                }
              }}
              disabled={!newValue || updateValueMutation.isPending}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Endorsement Dialog */}
      <Dialog
        open={endorsementDialog.open}
        onOpenChange={(open) =>
          setEndorsementDialog({ open, endorsement: open ? endorsementDialog.endorsement : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Endorsement</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createEndorsementMutation.mutate({
                executiveName: formData.get("executiveName") as string,
                executiveTitle: formData.get("executiveTitle") as string,
                executiveRole: formData.get("executiveRole") as string,
                endorsementType: formData.get("endorsementType") as string,
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="executiveName">Executive Name</Label>
                <Input id="executiveName" name="executiveName" required />
              </div>
              <div>
                <Label htmlFor="executiveTitle">Title</Label>
                <Input id="executiveTitle" name="executiveTitle" />
              </div>
              <div>
                <Label htmlFor="executiveRole">Role</Label>
                <Select name="executiveRole" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXECUTIVE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label} - {role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endorsementType">Type</Label>
                <Select name="endorsementType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="testimonial">Testimonial</SelectItem>
                    <SelectItem value="reference">Reference</SelectItem>
                    <SelectItem value="case_study">Case Study</SelectItem>
                    <SelectItem value="speaking">Speaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEndorsementDialog({ open: false, endorsement: null })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createEndorsementMutation.isPending}>
                Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SOW Criterion Dialog */}
      <Dialog
        open={sowDialog.open}
        onOpenChange={(open) =>
          setSowDialog({ open, criterion: open ? sowDialog.criterion : null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SOW Success Criterion</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createSowMutation.mutate({
                executiveRole: formData.get("executiveRole") as string,
                criteriaText: formData.get("criteriaText") as string,
                targetValue: formData.get("targetValue") as string,
              });
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="sowRole">Executive Role</Label>
                <Select name="executiveRole" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXECUTIVE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="criteriaText">Success Criteria</Label>
                <Textarea
                  id="criteriaText"
                  name="criteriaText"
                  required
                  placeholder="Describe the success criteria from the SOW"
                />
              </div>
              <div>
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  name="targetValue"
                  placeholder="e.g., 95% or $1M"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSowDialog({ open: false, criterion: null })}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSowMutation.isPending}>
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
