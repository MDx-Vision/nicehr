import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Server,
  Database,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Settings,
  FileSpreadsheet,
  Link2,
  Activity,
  Zap,
  TrendingUp,
  Cloud,
  Upload,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface IntegrationDashboard {
  systemCounts: Array<{
    systemType: string;
    count: number;
    activeCount: number;
  }>;
  records: {
    total: number;
    synced: number;
    pending: number;
    failed: number;
  };
  mappings: {
    total: number;
    validated: number;
    pending: number;
  };
  recentSyncs: Array<{
    id: string;
    integrationSourceId: string;
    syncType: string;
    status: string;
    recordsProcessed: number;
    recordsSucceeded: number;
    recordsFailed: number;
    syncStartedAt: string;
    syncCompletedAt: string | null;
  }>;
  dataFreshness: {
    avgHoursSinceSync: number | null;
  };
}

interface IntegrationSource {
  id: string;
  name: string;
  description: string;
  systemType: string;
  status: string;
  apiUrl: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  createdAt: string;
}

const SYSTEM_TYPES = [
  { value: "servicenow", label: "ServiceNow", icon: Server, color: "bg-green-500" },
  { value: "asana", label: "Asana", icon: Activity, color: "bg-pink-500" },
  { value: "sap", label: "SAP", icon: Database, color: "bg-yellow-500" },
  { value: "jira", label: "Jira", icon: Zap, color: "bg-blue-500" },
  { value: "bmc_helix", label: "BMC Helix", icon: Cloud, color: "bg-purple-500" },
  { value: "freshservice", label: "Freshservice", icon: Settings, color: "bg-teal-500" },
  { value: "monday", label: "Monday.com", icon: Activity, color: "bg-red-500" },
  { value: "smartsheet", label: "Smartsheet", icon: FileSpreadsheet, color: "bg-indigo-500" },
  { value: "other", label: "Other", icon: Link2, color: "bg-gray-500" },
];

const STATUS_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "outline" },
  configured: { label: "Configured", variant: "secondary" },
  testing: { label: "Testing", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  paused: { label: "Paused", variant: "outline" },
  inactive: { label: "Inactive", variant: "destructive" },
};

const SYNC_STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  running: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  partial: <AlertCircle className="h-4 w-4 text-orange-500" />,
};

export default function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    description: "",
    systemType: "",
  });
  const [, navigate] = useLocation();

  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery<IntegrationDashboard>({
    queryKey: ["/api/integrations/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/integrations/dashboard");
      if (!res.ok) throw new Error("Failed to fetch integration dashboard");
      return res.json();
    },
  });

  const { data: sources, isLoading: sourcesLoading, refetch: refetchSources } = useQuery<IntegrationSource[]>({
    queryKey: ["/api/integrations"],
    queryFn: async () => {
      const res = await fetch("/api/integrations");
      if (!res.ok) throw new Error("Failed to fetch integration sources");
      return res.json();
    },
  });

  const handleCreateIntegration = async () => {
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIntegration),
      });
      if (!res.ok) throw new Error("Failed to create integration");
      setShowAddDialog(false);
      setNewIntegration({ name: "", description: "", systemType: "" });
      refetchSources();
      refetchDashboard();
    } catch (error) {
      console.error("Error creating integration:", error);
    }
  };

  const getSystemInfo = (type: string) => {
    return SYSTEM_TYPES.find((s) => s.value === type) || SYSTEM_TYPES[SYSTEM_TYPES.length - 1];
  };

  const getSystemCount = (systemType: string) => {
    const count = dashboard?.systemCounts.find((s) => s.systemType === systemType);
    return count?.count || 0;
  };

  const getActiveCount = (systemType: string) => {
    const count = dashboard?.systemCounts.find((s) => s.systemType === systemType);
    return count?.activeCount || 0;
  };

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-integration-hub-title">Integration Hub</h1>
          <p className="text-muted-foreground">One View. Every System. Zero Logins.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalSources = sources?.length || 0;
  const activeSources = sources?.filter((s) => s.status === "active").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-integration-hub-title">Integration Hub</h1>
          <p className="text-muted-foreground">
            One View. Every System. Zero Logins.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-sync-all">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button variant="outline" data-testid="button-import-csv" onClick={() => navigate("/integrations/import")}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-integration">
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-integration">
              <DialogHeader>
                <DialogTitle>Add Integration Source</DialogTitle>
                <DialogDescription>
                  Connect to an external system to import and sync data.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    data-testid="input-integration-name"
                    placeholder="e.g., Hospital A ServiceNow"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="systemType">System Type</Label>
                  <Select
                    value={newIntegration.systemType}
                    onValueChange={(value) => setNewIntegration({ ...newIntegration, systemType: value })}
                  >
                    <SelectTrigger data-testid="select-system-type">
                      <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description..."
                    value={newIntegration.description}
                    onChange={(e) => setNewIntegration({ ...newIntegration, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateIntegration} disabled={!newIntegration.name || !newIntegration.systemType}>
                  Create Integration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* System Cards with Drill-Down */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/integrations/servicenow" className="block">
          <Card
            data-testid="card-servicenow"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ServiceNow</CardTitle>
              <Server className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getSystemCount("servicenow")}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {getActiveCount("servicenow")} active connections
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/integrations/asana" className="block">
          <Card
            data-testid="card-asana"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asana</CardTitle>
              <Activity className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getSystemCount("asana")}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {getActiveCount("asana")} active connections
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/integrations/sap" className="block">
          <Card
            data-testid="card-sap"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SAP</CardTitle>
              <Database className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getSystemCount("sap")}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {getActiveCount("sap")} active connections
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/integrations/jira" className="block">
          <Card
            data-testid="card-jira"
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all h-full"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jira</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getSystemCount("jira")}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {getActiveCount("jira")} active connections
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-records">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.records.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.records.synced || 0} synced, {dashboard?.records.pending || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-mapping-status">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Field Mappings</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.mappings.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.mappings.validated || 0} validated, {dashboard?.mappings.pending || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-data-freshness">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.dataFreshness.avgHoursSinceSync
                ? `${Math.round(dashboard.dataFreshness.avgHoursSinceSync)}h`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average time since last sync
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-sync-health">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard?.records.total
                ? `${Math.round((dashboard.records.synced / dashboard.records.total) * 100)}%`
                : "100%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.records.failed || 0} failed records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Connections, Mappings, History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="connections" data-testid="tab-connections">Connections</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Sync History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>
                Overview of your integration ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Integrations</p>
                  <p className="text-3xl font-bold">{totalSources}</p>
                  <p className="text-sm text-green-600">{activeSources} active</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Records Imported</p>
                  <p className="text-3xl font-bold">{dashboard?.records.total || 0}</p>
                  <p className="text-sm text-muted-foreground">
                    From {dashboard?.systemCounts.length || 0} system types
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recent Syncs</p>
                  <p className="text-3xl font-bold">{dashboard?.recentSyncs.length || 0}</p>
                  <p className="text-sm text-muted-foreground">In the last 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Connections</CardTitle>
              <CardDescription>
                All configured integration sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sourcesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : sources && sources.length > 0 ? (
                <Table data-testid="table-sources">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map((source) => {
                      const systemInfo = getSystemInfo(source.systemType);
                      const statusInfo = STATUS_BADGES[source.status] || STATUS_BADGES.draft;
                      return (
                        <TableRow key={source.id} data-testid={`row-source-${source.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{source.name}</p>
                              {source.description && (
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  {source.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${systemInfo.color}`} />
                              {systemInfo.label}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {source.lastSyncAt ? (
                              <div className="flex items-center gap-2">
                                {source.lastSyncStatus && SYNC_STATUS_ICONS[source.lastSyncStatus]}
                                <span className="text-sm">
                                  {formatDistanceToNow(new Date(source.lastSyncAt), { addSuffix: true })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/integrations/${source.systemType}/${source.id}`)}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Configure
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No integrations configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first integration to start importing data from external systems.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync History</CardTitle>
              <CardDescription>
                Track all data synchronization operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.recentSyncs && dashboard.recentSyncs.length > 0 ? (
                <Table data-testid="table-recent-syncs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentSyncs.map((sync) => (
                      <TableRow key={sync.id} data-testid={`row-sync-${sync.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {SYNC_STATUS_ICONS[sync.status]}
                            <span className="capitalize">{sync.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{sync.syncType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">{sync.recordsSucceeded}</span>
                            {sync.recordsFailed > 0 && (
                              <span className="text-red-600 ml-2">/ {sync.recordsFailed} failed</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(sync.syncStartedAt), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>
                          {sync.syncCompletedAt ? (
                            formatDistanceToNow(new Date(sync.syncStartedAt), { addSuffix: false })
                          ) : (
                            <span className="text-muted-foreground">In progress...</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No sync history</h3>
                  <p className="text-muted-foreground">
                    Sync history will appear here once you import data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
