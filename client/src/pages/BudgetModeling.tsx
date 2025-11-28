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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import { 
  TrendingUp,
  Calculator,
  Target,
  BarChart3,
  Copy,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  FileText,
  Building2,
  ChevronRight,
  Settings,
  Eye,
  X,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Edit,
  GitCompare,
  Layers
} from "lucide-react";
import type { BudgetScenario, ScenarioMetric, Project } from "@shared/schema";

const SCENARIO_TYPES = [
  { value: "baseline", label: "Baseline", icon: Target, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "optimistic", label: "Optimistic", icon: TrendingUp, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "pessimistic", label: "Pessimistic", icon: ArrowDownRight, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "what_if", label: "What-If", icon: GitCompare, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
];

interface BudgetScenarioWithDetails extends BudgetScenario {
  project: { id: string; name: string } | null;
  creator: { id: string; firstName: string | null; lastName: string | null } | null;
  metrics?: ScenarioMetric[];
}

function getScenarioTypeBadge(type: string) {
  const config = SCENARIO_TYPES.find(t => t.value === type);
  return <Badge className={config?.color || ""}>{config?.label || type}</Badge>;
}

function getScenarioTypeIcon(type: string) {
  const config = SCENARIO_TYPES.find(t => t.value === type);
  const Icon = config?.icon || Target;
  return <Icon className="h-4 w-4" />;
}

function formatCurrency(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatNumber(num: string | number | null | undefined) {
  if (num === null || num === undefined) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  return new Intl.NumberFormat("en-US").format(n);
}

function getVarianceColor(variance: number): string {
  if (variance > 0) return "text-red-600 dark:text-red-400";
  if (variance < 0) return "text-green-600 dark:text-green-400";
  return "text-muted-foreground";
}

function getVarianceIcon(variance: number) {
  if (variance > 0) return <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />;
  if (variance < 0) return <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function ScenarioStats({ scenarios }: { scenarios: BudgetScenarioWithDetails[] }) {
  const totalCount = scenarios.length;
  const baselineCount = scenarios.filter(s => s.scenarioType === "baseline" || s.isBaseline).length;
  const whatIfCount = scenarios.filter(s => s.scenarioType === "what_if").length;
  const activeCount = scenarios.filter(s => s.isActive).length;
  
  const totalBudget = scenarios.reduce((sum, s) => sum + parseFloat(s.totalBudget || "0"), 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card data-testid="stat-total-scenarios">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
          <Layers className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">All budget scenarios</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-baseline-scenarios">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Baseline Scenarios</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{baselineCount}</div>
          <p className="text-xs text-muted-foreground">Reference budgets</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-whatif-scenarios">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">What-If Scenarios</CardTitle>
          <GitCompare className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{whatIfCount}</div>
          <p className="text-xs text-muted-foreground">Analysis scenarios</p>
        </CardContent>
      </Card>
      <Card data-testid="stat-active-scenarios">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Scenarios</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(totalBudget)} total budget</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ScenarioRow({ 
  scenario,
  onClick 
}: { 
  scenario: BudgetScenarioWithDetails;
  onClick: () => void;
}) {
  const variance = parseFloat(scenario.budgetVariance || "0");
  const variancePercent = parseFloat(scenario.variancePercentage || "0");
  
  return (
    <TableRow 
      className="cursor-pointer hover-elevate" 
      onClick={onClick}
      data-testid={`scenario-row-${scenario.id}`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {getScenarioTypeIcon(scenario.scenarioType)}
          <div>
            <div className="font-medium">{scenario.name}</div>
            {scenario.description && (
              <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                {scenario.description}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{getScenarioTypeBadge(scenario.scenarioType)}</TableCell>
      <TableCell>
        <div className="text-sm">
          {scenario.project?.name || "No project"}
        </div>
      </TableCell>
      <TableCell className="font-medium">{formatCurrency(scenario.totalBudget)}</TableCell>
      <TableCell>
        {scenario.actualTotalCost ? (
          <div className="flex items-center gap-1">
            {getVarianceIcon(variance)}
            <span className={getVarianceColor(variance)}>
              {formatCurrency(Math.abs(variance))} ({variancePercent.toFixed(1)}%)
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No actuals</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={scenario.isActive ? "default" : "secondary"}>
          {scenario.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {scenario.createdAt ? formatDistanceToNow(new Date(scenario.createdAt), { addSuffix: true }) : "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}

function ScenarioDetailPanel({
  scenarioId,
  onClose,
  onClone,
  onDelete,
  isAdmin
}: {
  scenarioId: string;
  onClose: () => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [editingMetric, setEditingMetric] = useState<ScenarioMetric | null>(null);
  const { toast } = useToast();

  const { data: scenario, isLoading } = useQuery<BudgetScenarioWithDetails>({
    queryKey: ['/api/budget-scenarios', scenarioId],
    enabled: !!scenarioId,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<ScenarioMetric[]>({
    queryKey: ['/api/scenario-metrics', { scenarioId }],
    enabled: !!scenarioId,
  });

  if (isLoading || metricsLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!scenario) return null;

  const totalBudget = parseFloat(scenario.totalBudget || "0");
  const actualCost = parseFloat(scenario.actualTotalCost || "0");
  const variance = parseFloat(scenario.budgetVariance || "0");
  const variancePercent = parseFloat(scenario.variancePercentage || "0");
  const budgetUsed = totalBudget > 0 ? (actualCost / totalBudget) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {getScenarioTypeIcon(scenario.scenarioType)}
              <span>{SCENARIO_TYPES.find(t => t.value === scenario.scenarioType)?.label || scenario.scenarioType}</span>
              {scenario.isBaseline && <Badge variant="outline">Baseline</Badge>}
            </div>
            <h2 className="text-xl font-semibold" data-testid="text-scenario-name">{scenario.name}</h2>
            {scenario.description && (
              <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={scenario.isActive ? "default" : "secondary"}>
              {scenario.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Project</div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{scenario.project?.name || "No project"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Created By</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {scenario.creator 
                  ? `${scenario.creator.firstName || ""} ${scenario.creator.lastName || ""}`.trim() || "Unknown"
                  : "Unknown"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Consultants</div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{scenario.consultantCount || 0} FTEs</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{scenario.durationWeeks || 0} weeks</span>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
                <div className="text-2xl font-bold" data-testid="text-total-budget">
                  {formatCurrency(scenario.totalBudget)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Actual Cost</div>
                <div className="text-2xl font-bold" data-testid="text-actual-cost">
                  {scenario.actualTotalCost ? formatCurrency(scenario.actualTotalCost) : "N/A"}
                </div>
              </div>
            </div>
            
            {scenario.actualTotalCost && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span>{budgetUsed.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(budgetUsed, 100)} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm">Variance</span>
                  <div className="flex items-center gap-1">
                    {getVarianceIcon(variance)}
                    <span className={`font-medium ${getVarianceColor(variance)}`}>
                      {formatCurrency(Math.abs(variance))} ({variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budgeted</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Labor</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.laborCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.actualLaborCost)}</TableCell>
                  <TableCell className="text-right">
                    {scenario.actualLaborCost ? (
                      <span className={getVarianceColor(parseFloat(scenario.actualLaborCost || "0") - parseFloat(scenario.laborCost || "0"))}>
                        {formatCurrency(parseFloat(scenario.actualLaborCost || "0") - parseFloat(scenario.laborCost || "0"))}
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Travel</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.travelCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.actualTravelCost)}</TableCell>
                  <TableCell className="text-right">
                    {scenario.actualTravelCost ? (
                      <span className={getVarianceColor(parseFloat(scenario.actualTravelCost || "0") - parseFloat(scenario.travelCost || "0"))}>
                        {formatCurrency(parseFloat(scenario.actualTravelCost || "0") - parseFloat(scenario.travelCost || "0"))}
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Expenses</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.expenseCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.actualExpenseCost)}</TableCell>
                  <TableCell className="text-right">
                    {scenario.actualExpenseCost ? (
                      <span className={getVarianceColor(parseFloat(scenario.actualExpenseCost || "0") - parseFloat(scenario.expenseCost || "0"))}>
                        {formatCurrency(parseFloat(scenario.actualExpenseCost || "0") - parseFloat(scenario.expenseCost || "0"))}
                      </span>
                    ) : "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Overhead</TableCell>
                  <TableCell className="text-right">{formatCurrency(scenario.overheadCost)}</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">—</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Scenario Metrics
            </CardTitle>
            {isAdmin && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowAddMetric(true)}
                data-testid="button-add-metric"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Metric
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No metrics defined for this scenario</p>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowAddMetric(true)}
                    data-testid="button-add-first-metric"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Metric
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Forecast</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    {isAdmin && <TableHead className="w-[50px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const variance = parseFloat(metric.variance || "0");
                    return (
                      <TableRow key={metric.id} data-testid={`metric-row-${metric.id}`}>
                        <TableCell>
                          <div className="font-medium">{metric.metricName}</div>
                          <div className="text-xs text-muted-foreground">{metric.metricType}</div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(metric.plannedValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(metric.forecastValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(metric.actualValue)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {getVarianceIcon(variance)}
                            <span className={getVarianceColor(variance)}>
                              {formatCurrency(Math.abs(variance))}
                            </span>
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => setEditingMetric(metric)}
                              data-testid={`button-edit-metric-${metric.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {scenario.assumptions && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap">
                {JSON.stringify(scenario.assumptions, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </ScrollArea>

      <div className="p-4 border-t flex justify-between gap-2">
        <Button variant="outline" onClick={onClose} data-testid="button-close-detail">
          Close
        </Button>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button 
                variant="outline"
                onClick={() => onClone(scenarioId)}
                data-testid="button-clone-scenario"
              >
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </Button>
              <Button 
                variant="destructive"
                onClick={() => onDelete(scenarioId)}
                data-testid="button-delete-scenario"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <AddMetricDialog
        open={showAddMetric}
        onOpenChange={setShowAddMetric}
        scenarioId={scenarioId}
      />

      {editingMetric && (
        <EditMetricDialog
          open={!!editingMetric}
          onOpenChange={(open) => !open && setEditingMetric(null)}
          metric={editingMetric}
        />
      )}
    </div>
  );
}

function AddMetricDialog({
  open,
  onOpenChange,
  scenarioId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioId: string;
}) {
  const [formData, setFormData] = useState({
    metricName: "",
    metricType: "cost",
    metricDate: format(new Date(), "yyyy-MM-dd"),
    plannedValue: "",
    forecastValue: "",
    actualValue: "",
    notes: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/scenario-metrics", {
        ...data,
        scenarioId,
        plannedValue: data.plannedValue || null,
        forecastValue: data.forecastValue || null,
        actualValue: data.actualValue || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scenario-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget-scenarios'] });
      onOpenChange(false);
      setFormData({
        metricName: "",
        metricType: "cost",
        metricDate: format(new Date(), "yyyy-MM-dd"),
        plannedValue: "",
        forecastValue: "",
        actualValue: "",
        notes: "",
      });
      toast({ title: "Metric added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add metric", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!formData.metricName.trim()) {
      toast({ title: "Metric name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Metric</DialogTitle>
          <DialogDescription>
            Add a new metric to track for this scenario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metricName">Metric Name</Label>
            <Input
              id="metricName"
              placeholder="e.g., Monthly Labor Cost"
              value={formData.metricName}
              onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
              data-testid="input-metric-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metricType">Type</Label>
              <Select 
                value={formData.metricType} 
                onValueChange={(value) => setFormData({ ...formData, metricType: value })}
              >
                <SelectTrigger data-testid="select-metric-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="fte">FTE</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metricDate">Date</Label>
              <Input
                id="metricDate"
                type="date"
                value={formData.metricDate}
                onChange={(e) => setFormData({ ...formData, metricDate: e.target.value })}
                data-testid="input-metric-date"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedValue">Planned</Label>
              <Input
                id="plannedValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.plannedValue}
                onChange={(e) => setFormData({ ...formData, plannedValue: e.target.value })}
                data-testid="input-planned-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forecastValue">Forecast</Label>
              <Input
                id="forecastValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.forecastValue}
                onChange={(e) => setFormData({ ...formData, forecastValue: e.target.value })}
                data-testid="input-forecast-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualValue">Actual</Label>
              <Input
                id="actualValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.actualValue}
                onChange={(e) => setFormData({ ...formData, actualValue: e.target.value })}
                data-testid="input-actual-value"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="input-metric-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            data-testid="button-submit-metric"
          >
            Add Metric
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditMetricDialog({
  open,
  onOpenChange,
  metric
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: ScenarioMetric;
}) {
  const [formData, setFormData] = useState({
    metricName: metric.metricName,
    metricType: metric.metricType,
    metricDate: metric.metricDate,
    plannedValue: metric.plannedValue || "",
    forecastValue: metric.forecastValue || "",
    actualValue: metric.actualValue || "",
    notes: metric.notes || "",
  });
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PATCH", `/api/scenario-metrics/${metric.id}`, {
        ...data,
        plannedValue: data.plannedValue || null,
        forecastValue: data.forecastValue || null,
        actualValue: data.actualValue || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scenario-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/budget-scenarios'] });
      onOpenChange(false);
      toast({ title: "Metric updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update metric", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!formData.metricName.trim()) {
      toast({ title: "Metric name is required", variant: "destructive" });
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Metric</DialogTitle>
          <DialogDescription>
            Update the metric values.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editMetricName">Metric Name</Label>
            <Input
              id="editMetricName"
              value={formData.metricName}
              onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
              data-testid="input-edit-metric-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editMetricType">Type</Label>
              <Select 
                value={formData.metricType} 
                onValueChange={(value) => setFormData({ ...formData, metricType: value })}
              >
                <SelectTrigger data-testid="select-edit-metric-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="fte">FTE</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMetricDate">Date</Label>
              <Input
                id="editMetricDate"
                type="date"
                value={formData.metricDate}
                onChange={(e) => setFormData({ ...formData, metricDate: e.target.value })}
                data-testid="input-edit-metric-date"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editPlannedValue">Planned</Label>
              <Input
                id="editPlannedValue"
                type="number"
                step="0.01"
                value={formData.plannedValue}
                onChange={(e) => setFormData({ ...formData, plannedValue: e.target.value })}
                data-testid="input-edit-planned-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editForecastValue">Forecast</Label>
              <Input
                id="editForecastValue"
                type="number"
                step="0.01"
                value={formData.forecastValue}
                onChange={(e) => setFormData({ ...formData, forecastValue: e.target.value })}
                data-testid="input-edit-forecast-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editActualValue">Actual</Label>
              <Input
                id="editActualValue"
                type="number"
                step="0.01"
                value={formData.actualValue}
                onChange={(e) => setFormData({ ...formData, actualValue: e.target.value })}
                data-testid="input-edit-actual-value"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editNotes">Notes</Label>
            <Textarea
              id="editNotes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="input-edit-metric-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={updateMutation.isPending}
            data-testid="button-update-metric"
          >
            Update Metric
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateScenarioDialog({
  open,
  onOpenChange,
  projects
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectId: "",
    scenarioType: "what_if",
    isBaseline: false,
    estimatedHours: "",
    hourlyRate: "",
    consultantCount: "",
    durationWeeks: "",
    laborCost: "",
    travelCost: "",
    expenseCost: "",
    overheadCost: "",
    assumptions: "",
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const laborCost = parseFloat(data.laborCost) || 0;
      const travelCost = parseFloat(data.travelCost) || 0;
      const expenseCost = parseFloat(data.expenseCost) || 0;
      const overheadCost = parseFloat(data.overheadCost) || 0;
      const totalBudget = laborCost + travelCost + expenseCost + overheadCost;

      let assumptions = null;
      if (data.assumptions.trim()) {
        try {
          assumptions = JSON.parse(data.assumptions);
        } catch (e) {
          throw new Error("Invalid JSON in assumptions");
        }
      }

      return apiRequest("POST", "/api/budget-scenarios", {
        name: data.name,
        description: data.description || null,
        projectId: data.projectId || null,
        scenarioType: data.scenarioType,
        isBaseline: data.isBaseline,
        estimatedHours: data.estimatedHours || null,
        hourlyRate: data.hourlyRate || null,
        consultantCount: data.consultantCount ? parseInt(data.consultantCount) : null,
        durationWeeks: data.durationWeeks ? parseInt(data.durationWeeks) : null,
        laborCost: data.laborCost || null,
        travelCost: data.travelCost || null,
        expenseCost: data.expenseCost || null,
        overheadCost: data.overheadCost || null,
        totalBudget: totalBudget > 0 ? totalBudget.toString() : null,
        assumptions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-scenarios'] });
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        projectId: "",
        scenarioType: "what_if",
        isBaseline: false,
        estimatedHours: "",
        hourlyRate: "",
        consultantCount: "",
        durationWeeks: "",
        laborCost: "",
        travelCost: "",
        expenseCost: "",
        overheadCost: "",
        assumptions: "",
      });
      toast({ title: "Scenario created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to create scenario", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Scenario name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Budget Scenario</DialogTitle>
          <DialogDescription>
            Create a new budget scenario for planning and analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Scenario Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Q1 2025 Optimistic"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-scenario-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenarioType">Scenario Type</Label>
              <Select 
                value={formData.scenarioType} 
                onValueChange={(value) => setFormData({ ...formData, scenarioType: value })}
              >
                <SelectTrigger data-testid="select-scenario-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIO_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the scenario assumptions and purpose..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="input-scenario-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBaseline}
                  onChange={(e) => setFormData({ ...formData, isBaseline: e.target.checked })}
                  className="rounded border-gray-300"
                  data-testid="checkbox-is-baseline"
                />
                <span className="text-sm">Mark as baseline</span>
              </label>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Parameters</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Est. Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  data-testid="input-estimated-hours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  data-testid="input-hourly-rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultantCount">FTE Count</Label>
                <Input
                  id="consultantCount"
                  type="number"
                  placeholder="0"
                  value={formData.consultantCount}
                  onChange={(e) => setFormData({ ...formData, consultantCount: e.target.value })}
                  data-testid="input-consultant-count"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  placeholder="0"
                  value={formData.durationWeeks}
                  onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                  data-testid="input-duration-weeks"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Cost Estimates</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.laborCost}
                  onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                  data-testid="input-labor-cost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelCost">Travel Cost</Label>
                <Input
                  id="travelCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.travelCost}
                  onChange={(e) => setFormData({ ...formData, travelCost: e.target.value })}
                  data-testid="input-travel-cost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseCost">Expense Cost</Label>
                <Input
                  id="expenseCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.expenseCost}
                  onChange={(e) => setFormData({ ...formData, expenseCost: e.target.value })}
                  data-testid="input-expense-cost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overheadCost">Overhead Cost</Label>
                <Input
                  id="overheadCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.overheadCost}
                  onChange={(e) => setFormData({ ...formData, overheadCost: e.target.value })}
                  data-testid="input-overhead-cost"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="assumptions">Assumptions (JSON)</Label>
            <Textarea
              id="assumptions"
              placeholder='{"inflation_rate": 0.03, "utilization": 0.85}'
              value={formData.assumptions}
              onChange={(e) => setFormData({ ...formData, assumptions: e.target.value })}
              className="font-mono text-sm"
              data-testid="input-assumptions"
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON object for storing custom assumptions
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending}
            data-testid="button-create-scenario"
          >
            Create Scenario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompareScenarioDialog({
  open,
  onOpenChange,
  scenarios
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarios: BudgetScenarioWithDetails[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const selectedScenarios = scenarios.filter(s => selectedIds.includes(s.id));
  
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Scenarios</DialogTitle>
          <DialogDescription>
            Select up to 4 scenarios to compare side by side.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario) => (
              <Badge
                key={scenario.id}
                variant={selectedIds.includes(scenario.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSelection(scenario.id)}
                data-testid={`badge-compare-${scenario.id}`}
              >
                {scenario.name}
                {selectedIds.includes(scenario.id) && " ✓"}
              </Badge>
            ))}
          </div>

          {selectedScenarios.length >= 2 && (
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Metric</TableHead>
                    {selectedScenarios.map((s) => (
                      <TableHead key={s.id} className="min-w-[150px]">
                        <div className="flex items-center gap-2">
                          {getScenarioTypeIcon(s.scenarioType)}
                          <span className="truncate">{s.name}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Type</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{getScenarioTypeBadge(s.scenarioType)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Total Budget</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id} className="font-medium">{formatCurrency(s.totalBudget)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Labor Cost</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{formatCurrency(s.laborCost)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Travel Cost</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{formatCurrency(s.travelCost)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Expense Cost</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{formatCurrency(s.expenseCost)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Overhead Cost</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{formatCurrency(s.overheadCost)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">FTE Count</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{s.consultantCount || "—"}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Duration (weeks)</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{s.durationWeeks || "—"}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Actual Cost</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>{s.actualTotalCost ? formatCurrency(s.actualTotalCost) : "—"}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background">Variance</TableCell>
                    {selectedScenarios.map((s) => (
                      <TableCell key={s.id}>
                        {s.budgetVariance ? (
                          <span className={getVarianceColor(parseFloat(s.budgetVariance || "0"))}>
                            {formatCurrency(s.budgetVariance)} ({s.variancePercentage}%)
                          </span>
                        ) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {selectedScenarios.length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select at least 2 scenarios to compare</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BudgetModeling() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery<BudgetScenarioWithDetails[]>({
    queryKey: ['/api/budget-scenarios', { projectId: projectFilter, scenarioType: typeFilter }],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const cloneMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/budget-scenarios/${id}/clone`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-scenarios'] });
      toast({ title: "Scenario cloned successfully" });
    },
    onError: () => {
      toast({ title: "Failed to clone scenario", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/budget-scenarios/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/budget-scenarios'] });
      setShowDeleteDialog(null);
      setSelectedScenarioId(null);
      toast({ title: "Scenario deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete scenario", variant: "destructive" });
    }
  });

  const filteredScenarios = scenarios.filter(scenario => {
    if (activeTab === "baseline" && scenario.scenarioType !== "baseline" && !scenario.isBaseline) return false;
    if (activeTab === "what_if" && scenario.scenarioType !== "what_if") return false;
    if (activeTab === "optimistic" && scenario.scenarioType !== "optimistic") return false;
    if (activeTab === "pessimistic" && scenario.scenarioType !== "pessimistic") return false;
    if (projectFilter && scenario.projectId !== projectFilter) return false;
    if (typeFilter && scenario.scenarioType !== typeFilter) return false;
    return true;
  });

  if (scenariosLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
            Budget Modeling
          </h1>
          <p className="text-muted-foreground">
            Create and analyze budget scenarios for projects
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline"
            onClick={() => setShowCompareDialog(true)}
            disabled={scenarios.length < 2}
            data-testid="button-compare-scenarios"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare
          </Button>
          {isAdmin && (
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-scenario">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          )}
        </div>
      </div>

      <ScenarioStats scenarios={scenarios} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`flex-1 space-y-4 ${selectedScenarioId ? 'lg:max-w-[60%]' : ''}`}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Scenarios</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="filter-project">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="filter-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {SCENARIO_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                  <TabsTrigger value="baseline" data-testid="tab-baseline">Baseline</TabsTrigger>
                  <TabsTrigger value="what_if" data-testid="tab-whatif">What-If</TabsTrigger>
                  <TabsTrigger value="optimistic" data-testid="tab-optimistic">Optimistic</TabsTrigger>
                  <TabsTrigger value="pessimistic" data-testid="tab-pessimistic">Pessimistic</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {filteredScenarios.length === 0 ? (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No scenarios found</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeTab === "all" 
                          ? "Create your first budget scenario to get started."
                          : `No ${activeTab.replace("_", "-")} scenarios found.`}
                      </p>
                      {isAdmin && activeTab === "all" && (
                        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-scenario">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Scenario
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Scenario</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Variance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredScenarios.map((scenario) => (
                            <ScenarioRow
                              key={scenario.id}
                              scenario={scenario}
                              onClick={() => setSelectedScenarioId(scenario.id)}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {selectedScenarioId && (
          <div className="lg:w-[40%] border rounded-lg bg-card">
            <ScenarioDetailPanel
              scenarioId={selectedScenarioId}
              onClose={() => setSelectedScenarioId(null)}
              onClone={(id) => cloneMutation.mutate(id)}
              onDelete={(id) => setShowDeleteDialog(id)}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>

      <CreateScenarioDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projects={projects}
      />

      <CompareScenarioDialog
        open={showCompareDialog}
        onOpenChange={setShowCompareDialog}
        scenarios={scenarios}
      />

      <Dialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scenario</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scenario? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => showDeleteDialog && deleteMutation.mutate(showDeleteDialog)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              Delete Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
