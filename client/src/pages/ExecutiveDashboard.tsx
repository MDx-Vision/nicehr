import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { 
  LayoutGrid,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Activity,
  Layers,
  Eye,
  Share2,
  Maximize2,
  Download,
  RefreshCw,
  Gauge
} from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  layout: DashboardLayout;
  settings: Record<string, unknown>;
  isPublic: boolean;
  createdAt: string | null;
}

interface DashboardLayout {
  columns: number;
  widgets: WidgetPosition[];
}

interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DashboardWidget {
  id: string;
  dashboardId: string;
  name: string;
  widgetType: string;
  configuration: WidgetConfiguration;
  position: { x: number; y: number; width: number; height: number };
  createdAt: string | null;
}

interface WidgetConfiguration {
  dataSource: string;
  metric?: string;
  chartType?: string;
  filters?: Record<string, unknown>;
  colorScheme?: string[];
  thresholds?: { warning: number; critical: number };
}

interface KpiDefinition {
  id: string;
  name: string;
  description: string | null;
  category: string;
  formula: string;
  unit: string;
  targetValue: string | null;
  warningThreshold: string | null;
  criticalThreshold: string | null;
  isActive: boolean;
  createdAt: string | null;
  currentValue?: number | string | null;
  trendDirection?: string | null;
}

interface KpiSnapshot {
  id: string;
  kpiId: string;
  value: string;
  periodStart: string;
  periodEnd: string;
  metadata: Record<string, unknown>;
  createdAt: string | null;
}

interface ReportAnalytics {
  totalReports: number;
  totalScheduledReports: number;
  totalExports: number;
  reportsThisWeek: number;
  exportsThisWeek: number;
  reportsByCategory: Record<string, number>;
  exportsByFormat: Record<string, number>;
  topReports: { name: string; runCount: number }[];
}

interface DashboardAnalytics {
  totalDashboards: number;
  totalWidgets: number;
  totalKpis: number;
  kpisByCategory: Record<string, number>;
  kpiHealthStatus: { healthy: number; warning: number; critical: number };
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

interface KpiWithDetails extends KpiDefinition {
  latestSnapshot?: KpiSnapshot;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

const EXAMPLE_KPI_DATA = [
  { id: "example-1", name: "Active Projects", value: 24, target: 30, trend: "up", change: 8.5, category: "operations" },
  { id: "example-2", name: "Consultant Utilization", value: 87, target: 90, trend: "stable", change: 0.5, category: "operations", unit: "%" },
  { id: "example-3", name: "Revenue This Quarter", value: 2450000, target: 3000000, trend: "up", change: 12.3, category: "financial", unit: "$" },
  { id: "example-4", name: "Open Support Tickets", value: 45, target: 30, trend: "down", change: -15.2, category: "support" },
  { id: "example-5", name: "Training Completion", value: 92, target: 95, trend: "up", change: 5.1, category: "training", unit: "%" },
  { id: "example-6", name: "Customer Satisfaction", value: 4.7, target: 4.5, trend: "stable", change: 0.1, category: "quality" },
];

const MOCK_CHART_DATA = {
  projectTimeline: [
    { month: "Jan", active: 18, completed: 5 },
    { month: "Feb", active: 20, completed: 7 },
    { month: "Mar", active: 22, completed: 8 },
    { month: "Apr", active: 24, completed: 10 },
    { month: "May", active: 26, completed: 12 },
    { month: "Jun", active: 24, completed: 15 },
  ],
  revenueByCategory: [
    { name: "Implementation", value: 1200000, color: "#3b82f6" },
    { name: "Training", value: 450000, color: "#10b981" },
    { name: "Support", value: 350000, color: "#f59e0b" },
    { name: "Consulting", value: 450000, color: "#8b5cf6" },
  ],
  consultantUtilization: [
    { week: "W1", utilization: 85, target: 90 },
    { week: "W2", utilization: 88, target: 90 },
    { week: "W3", utilization: 82, target: 90 },
    { week: "W4", utilization: 91, target: 90 },
    { week: "W5", utilization: 87, target: 90 },
    { week: "W6", utilization: 89, target: 90 },
  ],
  ticketVolume: [
    { day: "Mon", opened: 12, closed: 8 },
    { day: "Tue", opened: 15, closed: 12 },
    { day: "Wed", opened: 18, closed: 20 },
    { day: "Thu", opened: 10, closed: 14 },
    { day: "Fri", opened: 8, closed: 11 },
  ],
};

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [showNewDashboardDialog, setShowNewDashboardDialog] = useState(false);
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [dashboardName, setDashboardName] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");

  const { data: dashboards = [], isLoading: isLoadingDashboards } = useQuery<Dashboard[]>({
    queryKey: ["/api/executive-dashboards"],
  });

  const { data: kpiDefinitions = [], isLoading: isLoadingKpis } = useQuery<KpiDefinition[]>({
    queryKey: ["/api/kpi-definitions"],
  });

  const { data: reportAnalytics } = useQuery<ReportAnalytics>({
    queryKey: ["/api/analytics/reports"],
  });

  const { data: dashboardAnalytics } = useQuery<DashboardAnalytics>({
    queryKey: ["/api/analytics/dashboards"],
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPublic: boolean }) => {
      return apiRequest("POST", "/api/executive-dashboards", {
        name: data.name,
        description: data.description,
        layout: { columns: 4, widgets: [] },
        settings: {},
        isPublic: data.isPublic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executive-dashboards"] });
      toast({ title: "Dashboard created successfully" });
      setShowNewDashboardDialog(false);
      setDashboardName("");
      setDashboardDescription("");
    },
    onError: () => {
      toast({ title: "Failed to create dashboard", variant: "destructive" });
    },
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/executive-dashboards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/executive-dashboards"] });
      toast({ title: "Dashboard deleted" });
    },
  });

  const getKpiStatus = (value: number, target: number, warningPercent: number = 90) => {
    const percent = (value / target) * 100;
    if (percent >= 100) return "healthy";
    if (percent >= warningPercent) return "warning";
    return "critical";
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === "$") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(value);
    }
    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const displayKpis = kpiDefinitions.length > 0
    ? kpiDefinitions.map(kpi => ({
        id: kpi.id,
        name: kpi.name,
        value: Number(kpi.currentValue) || 0,
        target: Number(kpi.targetValue) || 100,
        trend: kpi.trendDirection || "stable",
        change: 0,
        category: kpi.category,
        unit: kpi.unit || undefined,
      }))
    : EXAMPLE_KPI_DATA;

  const hasRealData = kpiDefinitions.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Executive Dashboard</h1>
          <p className="text-muted-foreground">Real-time business intelligence and KPI monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[140px]" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button onClick={() => setShowNewDashboardDialog(true)} data-testid="button-new-dashboard">
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-dashboard">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kpis" data-testid="tab-kpis">
            <Gauge className="h-4 w-4 mr-2" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="charts" data-testid="tab-charts">
            <BarChart3 className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="dashboards" data-testid="tab-dashboards">
            <Layers className="h-4 w-4 mr-2" />
            My Dashboards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {!hasRealData && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mb-4" data-testid="text-demo-notice">
              Showing example data. Create KPIs to see real metrics.
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {displayKpis.slice(0, 4).map((kpi) => {
              const status = getKpiStatus(kpi.value, kpi.target);
              return (
                <Card key={kpi.id} className="hover-elevate" data-testid={`kpi-card-${kpi.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.name}</CardTitle>
                    <Badge 
                      variant={status === "healthy" ? "default" : status === "warning" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {status === "healthy" ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                       status === "warning" ? <AlertTriangle className="h-3 w-3 mr-1" /> : 
                       <AlertTriangle className="h-3 w-3 mr-1" />}
                      {status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-3xl font-bold">{formatValue(kpi.value, kpi.unit)}</div>
                      <div className={`flex items-center text-sm ${kpi.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {getTrendIcon(kpi.trend)}
                        <span className="ml-1">{Math.abs(kpi.change)}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Target: {formatValue(kpi.target, kpi.unit)}</span>
                        <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                      </div>
                      <Progress 
                        value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Project Activity
                </CardTitle>
                <CardDescription>Active and completed projects over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA.projectTimeline}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="active" 
                        stackId="1" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                        name="Active"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stackId="2" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6}
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Revenue by Category
                </CardTitle>
                <CardDescription>Revenue distribution across service categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_CHART_DATA.revenueByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {MOCK_CHART_DATA.revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatValue(value, "$")}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Consultant Utilization
                </CardTitle>
                <CardDescription>Weekly utilization vs target</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_CHART_DATA.consultantUtilization}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
                      <YAxis domain={[70, 100]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="utilization" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 4 }}
                        name="Utilization %"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#f59e0b" 
                        strokeDasharray="5 5" 
                        dot={false}
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Support Ticket Volume
                </CardTitle>
                <CardDescription>Daily ticket opened vs closed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHART_DATA.ticketVolume}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="opened" fill="#ef4444" name="Opened" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="closed" fill="#10b981" name="Closed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reports Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportAnalytics?.totalReports || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{reportAnalytics?.reportsThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Scheduled Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportAnalytics?.totalScheduledReports || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active schedules
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportAnalytics?.totalExports || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{reportAnalytics?.exportsThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Key Performance Indicators</h2>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage KPIs
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayKpis.map((kpi) => {
              const status = getKpiStatus(kpi.value, kpi.target);
              const progressPercent = Math.min((kpi.value / kpi.target) * 100, 100);
              
              return (
                <Card key={kpi.id} data-testid={`kpi-detail-${kpi.id}`} className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="capitalize">{kpi.category}</Badge>
                      <Badge 
                        variant={status === "healthy" ? "default" : status === "warning" ? "secondary" : "destructive"}
                      >
                        {status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{kpi.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="text-4xl font-bold">{formatValue(kpi.value, kpi.unit)}</div>
                      <div className={`flex items-center gap-1 ${kpi.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {kpi.change >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        <span className="text-lg font-medium">{Math.abs(kpi.change)}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress to target</span>
                        <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={progressPercent} 
                        className={`h-3 ${status === "critical" ? "[&>div]:bg-red-500" : status === "warning" ? "[&>div]:bg-yellow-500" : ""}`}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                      <span>Target: {formatValue(kpi.target, kpi.unit)}</span>
                      <span className="flex items-center gap-1">
                        {getTrendIcon(kpi.trend)}
                        {kpi.trend === "up" ? "Increasing" : kpi.trend === "down" ? "Decreasing" : "Stable"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>KPI Health Summary</CardTitle>
              <CardDescription>Overview of all KPI statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                  <div>
                    <div className="text-3xl font-bold text-green-600">{dashboardAnalytics?.kpiHealthStatus?.healthy || 4}</div>
                    <p className="text-sm text-muted-foreground">Healthy KPIs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-10 w-10 text-yellow-500" />
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">{dashboardAnalytics?.kpiHealthStatus?.warning || 1}</div>
                    <p className="text-sm text-muted-foreground">Warning</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                  <div>
                    <div className="text-3xl font-bold text-red-600">{dashboardAnalytics?.kpiHealthStatus?.critical || 1}</div>
                    <p className="text-sm text-muted-foreground">Critical</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Analytics Charts</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Business Overview</CardTitle>
                <CardDescription>Multi-metric performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA.projectTimeline}>
                      <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)"
                        }} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="active" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorActive)" 
                        name="Active Projects"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorCompleted)" 
                        name="Completed Projects"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_CHART_DATA.revenueByCategory}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label
                        >
                          {MOCK_CHART_DATA.revenueByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatValue(value, "$")}
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)"
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_CHART_DATA.ticketVolume}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)"
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="opened" fill="#ef4444" name="Tickets Opened" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="closed" fill="#10b981" name="Tickets Closed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Custom Dashboards</h2>
            <Button onClick={() => setShowNewDashboardDialog(true)} data-testid="button-create-dashboard">
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </div>

          {isLoadingDashboards ? (
            <div className="text-center py-12 text-muted-foreground">Loading dashboards...</div>
          ) : dashboards.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No custom dashboards</h3>
                <p className="text-muted-foreground mb-4">Create your first dashboard to track the metrics that matter most to you.</p>
                <Button onClick={() => setShowNewDashboardDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboards.map((dashboard) => (
                <Card key={dashboard.id} className="hover-elevate" data-testid={`dashboard-card-${dashboard.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      {dashboard.isPublic && (
                        <Badge variant="outline">
                          <Share2 className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    {dashboard.description && (
                      <CardDescription>{dashboard.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Layers className="h-4 w-4" />
                      <span>{dashboard.layout?.widgets?.length || 0} widgets</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteDashboardMutation.mutate(dashboard.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showNewDashboardDialog} onOpenChange={setShowNewDashboardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>Create a custom dashboard to track your key metrics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input 
                id="dashboard-name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="My Executive Dashboard"
                data-testid="input-dashboard-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description (optional)</Label>
              <Textarea 
                id="dashboard-description"
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                placeholder="What metrics will this dashboard track?"
                data-testid="input-dashboard-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Make Public</Label>
                <p className="text-sm text-muted-foreground">Allow others to view this dashboard</p>
              </div>
              <Switch data-testid="switch-dashboard-public" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDashboardDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => createDashboardMutation.mutate({
                name: dashboardName,
                description: dashboardDescription,
                isPublic: false,
              })}
              disabled={createDashboardMutation.isPending || !dashboardName.trim()}
              data-testid="button-confirm-create"
            >
              {createDashboardMutation.isPending ? "Creating..." : "Create Dashboard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
