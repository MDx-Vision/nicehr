import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Users, FolderKanban, FileText, DollarSign, UserCheck, Settings2, CheckCircle2, Circle, ChevronLeft, ChevronRight, Calendar, TrendingUp, BarChart3, Download, RotateCcw, Loader2, GripVertical, Wifi, WifiOff, ArrowRight, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ActivityFeed } from "@/components/ActivityFeed";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useDashboardWebSocket } from "@/hooks/useDashboardWebSocket";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";
import { DraggableWidgets, useWidgetOrder } from "@/components/DraggableWidgets";
import { GaugeGrid } from "@/components/PerformanceGauge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalConsultants: number;
  activeConsultants: number;
  totalHospitals: number;
  activeProjects: number;
  pendingDocuments: number;
  totalSavings: string;
  totalHoursLogged?: number;
  ticketResolutionRate?: number;
  projectCompletionRate?: number;
  consultantUtilization?: number;
}

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low" | "critical";
  status: "pending" | "in_progress" | "completed" | "blocked";
  dueDate: string | null;
  projectId: string;
  projectName?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "event" | "milestone";
  projectId?: string;
  projectName?: string;
}

interface WidgetSettings {
  tasks: boolean;
  charts: boolean;
  calendar: boolean;
  activity: boolean;
  gauges: boolean;
}

const DEFAULT_WIDGET_ORDER = ["tasks", "charts", "calendar", "activity", "gauges"];

export default function Dashboard() {
  const { user, isAdmin, isConsultant, isHospitalStaff } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>({
    tasks: true,
    charts: true,
    calendar: true,
    activity: true,
    gauges: true,
  });
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "completed">("all");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [chartPeriod, setChartPeriod] = useState<"week" | "month" | "year">("month");
  const [isDragMode, setIsDragMode] = useState(false);

  // WebSocket for live stats
  const { isConnected, liveStats } = useDashboardWebSocket();

  // WebSocket for real-time notifications
  const { notificationCounts, totalCount: totalNotifications } = useNotificationWebSocket();

  // Widget order with persistence
  const { order: widgetOrder, updateOrder, resetOrder: resetWidgetOrder } = useWidgetOrder(DEFAULT_WIDGET_ORDER);

  const { data: fetchedStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Merge live stats with fetched stats (live takes precedence)
  const stats = useMemo(() => {
    if (liveStats) return liveStats;
    return fetchedStats;
  }, [liveStats, fetchedStats]);

  // Chart data based on period
  const chartData = useMemo(() => {
    const generateData = (period: "week" | "month" | "year") => {
      if (period === "week") {
        return [
          { name: "Mon", revenue: 12000, users: 45 },
          { name: "Tue", revenue: 15000, users: 52 },
          { name: "Wed", revenue: 18000, users: 61 },
          { name: "Thu", revenue: 14000, users: 48 },
          { name: "Fri", revenue: 21000, users: 72 },
          { name: "Sat", revenue: 16000, users: 55 },
          { name: "Sun", revenue: 13000, users: 42 },
        ];
      } else if (period === "month") {
        return [
          { name: "Week 1", revenue: 45000, users: 180 },
          { name: "Week 2", revenue: 52000, users: 210 },
          { name: "Week 3", revenue: 48000, users: 195 },
          { name: "Week 4", revenue: 61000, users: 245 },
        ];
      } else {
        return [
          { name: "Jan", revenue: 150000, users: 520 },
          { name: "Feb", revenue: 165000, users: 580 },
          { name: "Mar", revenue: 180000, users: 640 },
          { name: "Apr", revenue: 175000, users: 620 },
          { name: "May", revenue: 195000, users: 710 },
          { name: "Jun", revenue: 210000, users: 780 },
          { name: "Jul", revenue: 225000, users: 850 },
          { name: "Aug", revenue: 240000, users: 920 },
          { name: "Sep", revenue: 235000, users: 890 },
          { name: "Oct", revenue: 255000, users: 980 },
          { name: "Nov", revenue: 270000, users: 1050 },
          { name: "Dec", revenue: 290000, users: 1120 },
        ];
      }
    };
    return generateData(chartPeriod);
  }, [chartPeriod]);

  // Performance gauges data
  const performanceGauges = useMemo(() => [
    {
      value: stats?.ticketResolutionRate || 0,
      label: "Ticket Resolution",
      description: "Support tickets resolved",
    },
    {
      value: stats?.projectCompletionRate || 0,
      label: "Project Completion",
      description: "Projects delivered",
    },
    {
      value: stats?.consultantUtilization || 0,
      label: "Utilization",
      description: "Consultant capacity used",
    },
    {
      value: Math.min(100, (stats?.totalHoursLogged || 0) / 10),
      max: 100,
      label: "Hours Logged",
      description: `${stats?.totalHoursLogged || 0} total hours`,
    },
  ], [stats]);

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["/api/dashboard/tasks"],
  });

  const { data: calendarEvents = [], isLoading: isLoadingEvents } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/dashboard/calendar-events"],
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/dashboard/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/tasks"] });
    },
  });

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === "all") return true;
    if (taskFilter === "pending") return task.status !== "completed";
    return task.status === "completed";
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-purple-500";
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const resetWidgetLayout = () => {
    setWidgetSettings({ tasks: true, charts: true, calendar: true, activity: true, gauges: true });
    resetWidgetOrder();
    setIsDragMode(false);
  };

  const exportChartData = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Revenue,Users\n2024-01,50000,100\n2024-02,55000,120";
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "chart_data.csv";
    link.click();
  };

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  });

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
            {isConnected ? (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600" data-testid="badge-live">
                <Wifi className="h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground" data-testid="badge-offline">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
            {totalNotifications > 0 && (
              <Badge variant="destructive" className="gap-1" data-testid="badge-notifications">
                <Bell className="h-3 w-3" />
                {totalNotifications}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "User"}! Here's an overview of your platform.
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant={isDragMode ? "secondary" : "outline"}
              onClick={() => setIsDragMode(!isDragMode)}
              data-testid="button-drag-mode"
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {isDragMode ? "Done" : "Reorder"}
            </Button>
            <Dialog open={showWidgetSettings} onOpenChange={setShowWidgetSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-widget-settings">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
            <DialogContent data-testid="dialog-widget-settings">
              <DialogHeader>
                <DialogTitle>Dashboard Widgets</DialogTitle>
                <DialogDescription>
                  Choose which widgets to display on your dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span>My Tasks</span>
                  <Switch
                    checked={widgetSettings.tasks}
                    onCheckedChange={(checked) => setWidgetSettings({ ...widgetSettings, tasks: checked })}
                    data-testid="switch-widget-tasks"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Charts</span>
                  <Switch
                    checked={widgetSettings.charts}
                    onCheckedChange={(checked) => setWidgetSettings({ ...widgetSettings, charts: checked })}
                    data-testid="switch-widget-charts"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Calendar</span>
                  <Switch
                    checked={widgetSettings.calendar}
                    onCheckedChange={(checked) => setWidgetSettings({ ...widgetSettings, calendar: checked })}
                    data-testid="switch-widget-calendar"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Activity Feed</span>
                  <Switch
                    checked={widgetSettings.activity}
                    onCheckedChange={(checked) => setWidgetSettings({ ...widgetSettings, activity: checked })}
                    data-testid="switch-widget-activity"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Performance Gauges</span>
                  <Switch
                    checked={widgetSettings.gauges}
                    onCheckedChange={(checked) => setWidgetSettings({ ...widgetSettings, gauges: checked })}
                    data-testid="switch-widget-gauges"
                  />
                </div>
                <Button variant="outline" className="w-full" onClick={resetWidgetLayout} data-testid="button-reset-layout">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>

      {isAdmin && (
        <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/consultants" className="block">
            <Card
              data-testid="card-total-consultants"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.totalConsultants || 0}</div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeConsultants || 0} currently available
                  </p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hospitals" className="block">
            <Card
              data-testid="card-total-hospitals"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.totalHospitals || 0}</div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Registered hospitals</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects" className="block">
            <Card
              data-testid="card-active-projects"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/documents" className="block">
            <Card
              data-testid="card-pending-documents"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.pendingDocuments || 0}</div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/consultants" className="block">
            <Card
              data-testid="card-active-consultants"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Available Consultants</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.activeConsultants || 0}</div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Ready for assignments</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics" className="block">
            <Card
              data-testid="card-total-savings"
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(stats?.totalSavings || "0")}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Widgets Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* My Tasks Widget */}
          {widgetSettings.tasks && (
            <Card data-testid="card-my-tasks">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">My Tasks</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={taskFilter === "all" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTaskFilter("all")}
                      data-testid="button-filter-all"
                    >
                      All
                    </Button>
                    <Button
                      variant={taskFilter === "pending" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTaskFilter("pending")}
                      data-testid="button-filter-pending"
                    >
                      Pending
                    </Button>
                    <Button
                      variant={taskFilter === "completed" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setTaskFilter("completed")}
                      data-testid="button-filter-completed"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingTasks ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground" data-testid="empty-tasks">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks to display</p>
                  </div>
                ) : (
                  <div className="space-y-2" data-testid="tasks-list">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                        data-testid={`task-item-${task.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          disabled={task.status === "completed" || completeTaskMutation.isPending}
                          onClick={() => task.status !== "completed" && completeTaskMutation.mutate(task.id)}
                          data-testid={`button-complete-${task.id}`}
                        >
                          {completeTaskMutation.isPending && completeTaskMutation.variables === task.id ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          ) : task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          {task.projectName && (
                            <p className="text-xs text-muted-foreground truncate">{task.projectName}</p>
                          )}
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} data-testid={`priority-${task.priority}`} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Charts Widget */}
          {widgetSettings.charts && (
            <Card data-testid="card-charts">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="text-base cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                    onClick={() => navigate("/analytics")}
                  >
                    Analytics
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                  <div className="flex gap-2">
                    <select
                      className="text-xs border rounded px-2 py-1"
                      value={chartPeriod}
                      onChange={(e) => setChartPeriod(e.target.value as "week" | "month" | "year")}
                      data-testid="select-chart-period"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={exportChartData} data-testid="button-export-chart">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div data-testid="chart-revenue-trend">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Revenue Trend</span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" tickFormatter={(v) => `$${v / 1000}k`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div data-testid="chart-user-growth">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">User Growth</span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [value, 'Users']}
                          />
                          <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Calendar and Activity Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Calendar Widget */}
          {widgetSettings.calendar && (
            <Card data-testid="card-calendar">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Events
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-24 text-center" data-testid="text-current-month">
                      {format(calendarMonth, "MMM yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-muted-foreground font-medium py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
                  {calendarDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`p-1 text-center text-xs rounded ${
                        isToday(day) ? "bg-primary text-primary-foreground" : ""
                      } ${!isSameMonth(day, calendarMonth) ? "text-muted-foreground/50" : ""}`}
                    >
                      {format(day, "d")}
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2" data-testid="events-list">
                  {isLoadingEvents ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : calendarEvents.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground" data-testid="empty-events">
                      <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    calendarEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                        data-testid={`event-${event.id}`}
                      >
                        <Badge variant={event.type === "milestone" ? "default" : "secondary"} data-testid={`badge-${event.type}`}>
                          {event.type === "milestone" ? "Milestone" : "Event"}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm truncate block">{event.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Feed */}
          {widgetSettings.activity && <ActivityFeed limit={10} />}
        </div>

        {/* Performance Gauges */}
        {widgetSettings.gauges && (
          <Card data-testid="card-performance-gauges">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Real-time performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <GaugeGrid gauges={performanceGauges} size="sm" />
            </CardContent>
          </Card>
        )}
        </>
      )}

      {isConsultant && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-consultant-welcome">
            <CardHeader>
              <CardTitle>Welcome to NICEHR</CardTitle>
              <CardDescription>
                Manage your profile, view assignments, and track your documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Complete your profile and upload required documents to be eligible for project assignments.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for consultants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">View your upcoming schedule</p>
              <p className="text-sm">Update your availability</p>
              <p className="text-sm">Upload pending documents</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isHospitalStaff && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card data-testid="card-hospital-welcome">
            <CardHeader>
              <CardTitle>Welcome to NICEHR</CardTitle>
              <CardDescription>
                View your hospital's projects and consultant assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track project progress, view assigned consultants, and provide feedback.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-hospital-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for hospital staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">View current projects</p>
              <p className="text-sm">See consultant schedules</p>
              <p className="text-sm">Submit ROI feedback</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
