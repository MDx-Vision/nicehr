import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Server,
  Activity,
  Database,
  Zap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Briefcase,
  XCircle,
  AlertCircle,
  Building,
  Timer,
} from "lucide-react";
import { format, formatDistanceToNow, subDays } from "date-fns";

// Mock data for consolidated view - in production this comes from all integrated systems
const MOCK_SERVICENOW_INCIDENTS = [
  { id: "INC0012345", title: "Epic login issues affecting nursing staff", priority: "high", status: "in_progress", assignee: "John Smith", created: subDays(new Date(), 1), system: "ServiceNow" },
  { id: "INC0012346", title: "Cerner lab results not syncing", priority: "critical", status: "open", assignee: "Sarah Johnson", created: subDays(new Date(), 0), system: "ServiceNow" },
  { id: "INC0012347", title: "Printer queue delays in radiology", priority: "medium", status: "resolved", assignee: "Mike Chen", created: subDays(new Date(), 3), system: "ServiceNow" },
  { id: "INC0012348", title: "MEDITECH timeout errors", priority: "high", status: "in_progress", assignee: "Emily Rodriguez", created: subDays(new Date(), 2), system: "ServiceNow" },
];

const MOCK_JIRA_ISSUES = [
  { id: "EHR-1234", title: "Implement SSO for Epic MyChart", priority: "high", status: "in_progress", assignee: "Dev Team A", sprint: "Sprint 23", system: "Jira" },
  { id: "EHR-1235", title: "Data migration script optimization", priority: "medium", status: "review", assignee: "Dev Team B", sprint: "Sprint 23", system: "Jira" },
  { id: "EHR-1236", title: "HL7 interface testing", priority: "high", status: "todo", assignee: "Integration Team", sprint: "Sprint 24", system: "Jira" },
];

const MOCK_ASANA_TASKS = [
  { id: "asana-1", title: "Complete training materials for go-live", project: "Memorial Hospital Go-Live", status: "on_track", dueDate: subDays(new Date(), -5), system: "Asana" },
  { id: "asana-2", title: "Finalize cutover checklist", project: "Memorial Hospital Go-Live", status: "at_risk", dueDate: subDays(new Date(), -2), system: "Asana" },
  { id: "asana-3", title: "Schedule mock go-live drill", project: "Regional Medical Center", status: "on_track", dueDate: subDays(new Date(), -7), system: "Asana" },
];

const MOCK_FIELDGLASS_DATA = {
  activeWorkers: 24,
  pendingTimesheets: 8,
  approvedHours: 1840,
  totalSpend: 287500,
  workers: [
    { name: "Sarah Johnson", role: "Epic Analyst", hospital: "Memorial Healthcare", hoursThisWeek: 40, rate: 145 },
    { name: "Michael Chen", role: "Cerner Specialist", hospital: "Regional Medical", hoursThisWeek: 38, rate: 140 },
    { name: "Emily Rodriguez", role: "MEDITECH Consultant", hospital: "Community Hospital", hoursThisWeek: 42, rate: 150 },
  ],
};

const MOCK_CHANGE_REQUESTS = [
  { id: "CHG0001234", title: "Epic upgrade to v2024", status: "approved", scheduledDate: subDays(new Date(), -10), risk: "medium", system: "ServiceNow" },
  { id: "CHG0001235", title: "Network firewall update", status: "pending_approval", scheduledDate: subDays(new Date(), -5), risk: "low", system: "ServiceNow" },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500",
  in_progress: "bg-yellow-500",
  review: "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
  todo: "bg-gray-500",
  on_track: "bg-green-500",
  at_risk: "bg-orange-500",
  approved: "bg-green-500",
  pending_approval: "bg-yellow-500",
};

export default function EnterpriseOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");

  // Calculate summary stats
  const openIncidents = MOCK_SERVICENOW_INCIDENTS.filter(i => i.status !== "resolved").length;
  const criticalIncidents = MOCK_SERVICENOW_INCIDENTS.filter(i => i.priority === "critical").length;
  const activeJiraIssues = MOCK_JIRA_ISSUES.length;
  const asanaTasksAtRisk = MOCK_ASANA_TASKS.filter(t => t.status === "at_risk").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-enterprise-overview-title">
            Enterprise Overview
          </h1>
          <p className="text-muted-foreground">
            One View. Every System. Real-time status across all integrated platforms.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card data-testid="card-servicenow-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ServiceNow</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{openIncidents}</span>
              <span className="text-sm text-muted-foreground">open incidents</span>
            </div>
            {criticalIncidents > 0 && (
              <div className="flex items-center gap-1 mt-1 text-red-500">
                <AlertTriangle className="h-3 w-3" />
                <span className="text-xs">{criticalIncidents} critical</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-jira-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jira</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{activeJiraIssues}</span>
              <span className="text-sm text-muted-foreground">active issues</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <span className="text-xs">Sprint 23 in progress</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-asana-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asana</CardTitle>
            <Activity className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{MOCK_ASANA_TASKS.length}</span>
              <span className="text-sm text-muted-foreground">active tasks</span>
            </div>
            {asanaTasksAtRisk > 0 && (
              <div className="flex items-center gap-1 mt-1 text-orange-500">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">{asanaTasksAtRisk} at risk</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-fieldglass-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fieldglass</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{MOCK_FIELDGLASS_DATA.activeWorkers}</span>
              <span className="text-sm text-muted-foreground">active workers</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <Timer className="h-3 w-3" />
              <span className="text-xs">{MOCK_FIELDGLASS_DATA.pendingTimesheets} pending timesheets</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-changes-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changes</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{MOCK_CHANGE_REQUESTS.length}</span>
              <span className="text-sm text-muted-foreground">scheduled</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-green-500">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs">1 approved</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours (This Month)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_FIELDGLASS_DATA.approvedHours.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <TrendingUp className="h-3 w-3" />
              +12% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${MOCK_FIELDGLASS_DATA.totalSpend.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              On budget
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incident Resolution</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <TrendingUp className="h-3 w-3" />
              +3% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="incidents" data-testid="tab-incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">
            <Briefcase className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="workforce" data-testid="tab-workforce">
            <Users className="h-4 w-4 mr-2" />
            Workforce
          </TabsTrigger>
          <TabsTrigger value="changes" data-testid="tab-changes">
            <FileText className="h-4 w-4 mr-2" />
            Changes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recent Incidents */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Recent Incidents</CardTitle>
                  <Badge variant="outline">ServiceNow</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_SERVICENOW_INCIDENTS.slice(0, 3).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[incident.priority]}`} />
                        <div>
                          <p className="font-medium text-sm">{incident.id}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{incident.title}</p>
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[incident.status]}>
                        {incident.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Active Project Tasks</CardTitle>
                  <Badge variant="outline">Asana</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_ASANA_TASKS.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.project}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={STATUS_COLORS[task.status]}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due {format(task.dueDate, "MMM d")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Jira Sprint */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Sprint Progress</CardTitle>
                  <Badge variant="outline">Jira</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_JIRA_ISSUES.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[issue.priority]}`} />
                        <div>
                          <p className="font-medium text-sm">{issue.id}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{issue.title}</p>
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[issue.status]}>
                        {issue.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workforce Summary */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Workforce Summary</CardTitle>
                  <Badge variant="outline">Fieldglass</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_FIELDGLASS_DATA.workers.map((worker, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">{worker.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{worker.hoursThisWeek}h</p>
                        <p className="text-xs text-muted-foreground">{worker.hospital}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Incidents</CardTitle>
              <CardDescription>
                Consolidated view of incidents from ServiceNow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table data-testid="table-incidents">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SERVICENOW_INCIDENTS.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.id}</TableCell>
                      <TableCell>{incident.title}</TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_COLORS[incident.priority]}>
                          {incident.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[incident.status]}>
                          {incident.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{incident.assignee}</TableCell>
                      <TableCell>{formatDistanceToNow(incident.created, { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Asana Tasks</CardTitle>
                  <Activity className="h-4 w-4 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ASANA_TASKS.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.project}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[task.status]}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(task.dueDate, "MMM d")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Jira Issues</CardTitle>
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sprint</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_JIRA_ISSUES.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{issue.id}</TableCell>
                        <TableCell>{issue.title}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[issue.status]}>
                            {issue.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{issue.sprint}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contingent Workforce</CardTitle>
              <CardDescription>
                Active workers from SAP Fieldglass
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Workers</p>
                  <p className="text-2xl font-bold">{MOCK_FIELDGLASS_DATA.activeWorkers}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Hours This Month</p>
                  <p className="text-2xl font-bold">{MOCK_FIELDGLASS_DATA.approvedHours.toLocaleString()}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Pending Timesheets</p>
                  <p className="text-2xl font-bold">{MOCK_FIELDGLASS_DATA.pendingTimesheets}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold">${MOCK_FIELDGLASS_DATA.totalSpend.toLocaleString()}</p>
                </div>
              </div>
              <Table data-testid="table-workers">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Hours This Week</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_FIELDGLASS_DATA.workers.map((worker, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {worker.hospital}
                        </div>
                      </TableCell>
                      <TableCell>{worker.hoursThisWeek}h</TableCell>
                      <TableCell>${worker.rate}/hr</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Changes Tab */}
        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Requests</CardTitle>
              <CardDescription>
                Scheduled changes from ServiceNow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table data-testid="table-changes">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Scheduled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CHANGE_REQUESTS.map((change) => (
                    <TableRow key={change.id}>
                      <TableCell className="font-medium">{change.id}</TableCell>
                      <TableCell>{change.title}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[change.status]}>
                          {change.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={PRIORITY_COLORS[change.risk]}>
                          {change.risk}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(change.scheduledDate, "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
