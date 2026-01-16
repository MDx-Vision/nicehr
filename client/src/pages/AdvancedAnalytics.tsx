import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  RefreshCw,
  Calendar,
  BarChart3,
  Activity,
} from "lucide-react";
import type {
  Project,
  AdvancedAnalyticsSummary,
} from "@shared/schema";

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "$0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

function asRecord(value: unknown): Record<string, string | number> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, string | number>;
  }
  return {};
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBackground(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-yellow-500";
  if (score >= 40) return "stroke-orange-500";
  return "stroke-red-500";
}

function getVarianceStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    on_track: { variant: "default", label: "On Track" },
    at_risk: { variant: "secondary", label: "At Risk" },
    over_budget: { variant: "destructive", label: "Over Budget" },
    under_budget: { variant: "outline", label: "Under Budget" },
  };
  const config = variants[status] || { variant: "secondary" as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function CircularGauge({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="stroke-muted"
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={getScoreBackground(value)}
          fill="none"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(value)}`}>
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-[300px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[400px]" />
        ))}
      </div>
    </div>
  );
}

export default function AdvancedAnalytics() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const { toast } = useToast();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const projectIdParam = selectedProjectId !== "all" ? selectedProjectId : null;
  
  const { data: analytics, isLoading, error } = useQuery<AdvancedAnalyticsSummary>({
    queryKey: projectIdParam 
      ? ["/api/analytics/advanced", { projectId: projectIdParam }]
      : ["/api/analytics/advanced"],
  });

  const computeReadinessMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/analytics/advanced/readiness/${projectId}/compute`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectIdParam 
        ? ["/api/analytics/advanced", { projectId: projectIdParam }]
        : ["/api/analytics/advanced"] });
      toast({
        title: "Success",
        description: "Go-live readiness score computed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to compute readiness score.",
        variant: "destructive",
      });
    },
  });

  const computeUtilizationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analytics/advanced/utilization/compute", {
        projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectIdParam 
        ? ["/api/analytics/advanced", { projectId: projectIdParam }]
        : ["/api/analytics/advanced"] });
      toast({
        title: "Success",
        description: "Utilization metrics calculated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate utilization.",
        variant: "destructive",
      });
    },
  });

  const computeForecastMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/analytics/advanced/forecasts/${projectId}/compute`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectIdParam 
        ? ["/api/analytics/advanced", { projectId: projectIdParam }]
        : ["/api/analytics/advanced"] });
      toast({
        title: "Success",
        description: "Timeline forecast computed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to compute forecast.",
        variant: "destructive",
      });
    },
  });

  const computeCostVarianceMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/analytics/advanced/cost-variance/${projectId}/compute`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectIdParam 
        ? ["/api/analytics/advanced", { projectId: projectIdParam }]
        : ["/api/analytics/advanced"] });
      toast({
        title: "Success",
        description: "Cost variance computed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to compute cost variance.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const goLiveReadiness = analytics?.goLiveReadiness;
  const consultantUtilization = analytics?.consultantUtilization;
  const timelineForecast = analytics?.timelineForecast;
  const costVariance = analytics?.costVariance;

  const selectedProject = projects?.find(p => p.id === selectedProjectId);
  const hasProjectSelected = selectedProjectId !== "all" && selectedProject;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-advanced-analytics-title">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into project readiness, utilization, timelines, and costs.
          </p>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-[300px]" data-testid="select-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects (Summary)</SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-go-live-readiness">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Go-Live Readiness
              </CardTitle>
              <CardDescription>
                Overall readiness assessment for go-live
              </CardDescription>
            </div>
            {hasProjectSelected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => computeReadinessMutation.mutate(selectedProjectId)}
                disabled={computeReadinessMutation.isPending}
                data-testid="button-recompute-readiness"
              >
                {computeReadinessMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Recompute</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <CircularGauge
                value={goLiveReadiness?.latestSnapshot?.overallScore
                  ? parseFloat(goLiveReadiness.latestSnapshot.overallScore)
                  : goLiveReadiness?.averageScore || 0}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confidence Level:</span>
                  <span className="font-medium" data-testid="text-confidence-level">
                    {goLiveReadiness?.latestSnapshot?.confidenceLevel
                      ? `${parseFloat(goLiveReadiness.latestSnapshot.confidenceLevel)}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Projects:</span>
                  <span className="font-medium" data-testid="text-project-count">
                    {goLiveReadiness?.projectCount || 0}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="bg-green-600">
                    {goLiveReadiness?.onTrackCount || 0} On Track
                  </Badge>
                  <Badge variant="destructive">
                    {goLiveReadiness?.atRiskCount || 0} At Risk
                  </Badge>
                </div>
              </div>
            </div>

            {goLiveReadiness?.latestSnapshot?.riskFactors && asStringArray(goLiveReadiness.latestSnapshot.riskFactors).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {asStringArray(goLiveReadiness.latestSnapshot.riskFactors).slice(0, 3).map((factor: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {goLiveReadiness?.latestSnapshot?.recommendations && asStringArray(goLiveReadiness.latestSnapshot.recommendations).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {asStringArray(goLiveReadiness.latestSnapshot.recommendations).slice(0, 3).map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-consultant-utilization">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Consultant Utilization
              </CardTitle>
              <CardDescription>
                Resource utilization and capacity metrics
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => computeUtilizationMutation.mutate()}
              disabled={computeUtilizationMutation.isPending}
              data-testid="button-calculate-utilization"
            >
              {computeUtilizationMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
              <span className="ml-2">Calculate</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Utilization</p>
                <p className="text-3xl font-bold" data-testid="text-average-utilization">
                  {consultantUtilization?.averageUtilization?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                {consultantUtilization?.utilizationTrend === "improving" && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Improving
                  </Badge>
                )}
                {consultantUtilization?.utilizationTrend === "declining" && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Declining
                  </Badge>
                )}
                {consultantUtilization?.utilizationTrend === "stable" && (
                  <Badge variant="outline">
                    <Activity className="h-3 w-3 mr-1" />
                    Stable
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scheduled Hours</span>
                  <span className="font-medium" data-testid="text-scheduled-hours">
                    {consultantUtilization?.totalScheduledHours?.toFixed(0) || 0}h
                  </span>
                </div>
                <Progress
                  value={100}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Actual Hours</span>
                  <span className="font-medium" data-testid="text-actual-hours">
                    {consultantUtilization?.totalActualHours?.toFixed(0) || 0}h
                  </span>
                </div>
                <Progress
                  value={
                    consultantUtilization?.totalScheduledHours
                      ? (consultantUtilization.totalActualHours / consultantUtilization.totalScheduledHours) * 100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Billable Hours</p>
                <p className="text-xl font-semibold" data-testid="text-billable-hours">
                  {consultantUtilization?.latestSnapshot?.billableHours
                    ? parseFloat(consultantUtilization.latestSnapshot.billableHours).toFixed(0)
                    : "N/A"}h
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Consultants</p>
                <p className="text-xl font-semibold" data-testid="text-total-consultants">
                  {consultantUtilization?.latestSnapshot?.totalConsultants || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-timeline-forecast">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline Forecast
              </CardTitle>
              <CardDescription>
                Project timeline predictions and variance
              </CardDescription>
            </div>
            {hasProjectSelected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => computeForecastMutation.mutate(selectedProjectId)}
                disabled={computeForecastMutation.isPending}
                data-testid="button-recompute-forecast"
              >
                {computeForecastMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Recompute</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Original End Date</p>
                <p className="text-lg font-semibold" data-testid="text-original-end-date">
                  {formatDate(timelineForecast?.latestSnapshot?.originalEndDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted End Date</p>
                <p className="text-lg font-semibold" data-testid="text-predicted-end-date">
                  {formatDate(timelineForecast?.latestSnapshot?.predictedEndDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Variance</p>
                <p
                  className={`text-2xl font-bold ${
                    (timelineForecast?.latestSnapshot?.varianceDays || 0) > 0
                      ? "text-red-600 dark:text-red-400"
                      : (timelineForecast?.latestSnapshot?.varianceDays || 0) < 0
                      ? "text-green-600 dark:text-green-400"
                      : ""
                  }`}
                  data-testid="text-variance-days"
                >
                  {timelineForecast?.latestSnapshot?.varianceDays || 0} days
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold" data-testid="text-forecast-confidence">
                  {timelineForecast?.latestSnapshot?.confidenceLevel
                    ? `${parseFloat(timelineForecast.latestSnapshot.confidenceLevel)}%`
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">On Schedule</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400" data-testid="text-projects-on-schedule">
                  {timelineForecast?.projectsOnSchedule || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Delayed</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400" data-testid="text-projects-delayed">
                  {timelineForecast?.projectsDelayed || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg. Variance</p>
                <p className="text-xl font-bold" data-testid="text-avg-variance">
                  {timelineForecast?.averageVarianceDays?.toFixed(0) || 0}d
                </p>
              </div>
            </div>

            {timelineForecast?.latestSnapshot?.scenarioAnalysis && Object.keys(asRecord(timelineForecast.latestSnapshot.scenarioAnalysis)).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Scenario Analysis</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {Object.entries(asRecord(timelineForecast.latestSnapshot.scenarioAnalysis)).map(([key, value]: [string, string | number]) => (
                    <div key={key} className="p-2 rounded bg-muted/30 text-center">
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {timelineForecast?.latestSnapshot?.riskDrivers && asStringArray(timelineForecast.latestSnapshot.riskDrivers).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Risk Drivers
                </h4>
                <ul className="space-y-1">
                  {asStringArray(timelineForecast.latestSnapshot.riskDrivers).slice(0, 3).map((driver: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-cost-variance">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Variance
              </CardTitle>
              <CardDescription>
                Budget vs actual cost analysis
              </CardDescription>
            </div>
            {hasProjectSelected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => computeCostVarianceMutation.mutate(selectedProjectId)}
                disabled={computeCostVarianceMutation.isPending}
                data-testid="button-recompute-cost-variance"
              >
                {computeCostVarianceMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Recompute</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1" data-testid="badge-cost-status">
                  {costVariance?.latestSnapshot?.status
                    ? getVarianceStatusBadge(costVariance.latestSnapshot.status)
                    : <Badge variant="secondary">No Data</Badge>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Variance</p>
                <p
                  className={`text-2xl font-bold ${
                    (costVariance?.overallVariancePercentage || 0) > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                  data-testid="text-variance-percentage"
                >
                  {costVariance?.overallVariancePercentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Budgeted</p>
                <p className="text-xl font-bold" data-testid="text-budgeted-amount">
                  {formatCurrency(costVariance?.totalBudgeted)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Actual</p>
                <p className="text-xl font-bold" data-testid="text-actual-amount">
                  {formatCurrency(costVariance?.totalActual)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground">Variance Amount</p>
                <p
                  className={`text-lg font-semibold ${
                    (parseFloat(costVariance?.latestSnapshot?.varianceAmount || "0")) > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                  data-testid="text-variance-amount"
                >
                  {formatCurrency(costVariance?.latestSnapshot?.varianceAmount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {costVariance?.projectsOverBudget || 0} Over
                </Badge>
                <Badge variant="outline">
                  {costVariance?.projectsUnderBudget || 0} Under
                </Badge>
              </div>
            </div>

            {costVariance?.latestSnapshot?.categoryBreakdown && Object.keys(asRecord(costVariance.latestSnapshot.categoryBreakdown)).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Category Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(asRecord(costVariance.latestSnapshot.categoryBreakdown)).map(([category, amount]: [string, string | number]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{category}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Forecast to Complete</p>
                <p className="text-lg font-semibold" data-testid="text-forecast-to-complete">
                  {formatCurrency(costVariance?.latestSnapshot?.forecastToComplete)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimate at Completion</p>
                <p className="text-lg font-semibold" data-testid="text-estimate-at-completion">
                  {formatCurrency(costVariance?.latestSnapshot?.estimateAtCompletion)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
