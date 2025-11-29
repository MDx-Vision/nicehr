import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Activity, 
  Building2, 
  AlertTriangle, 
  Check, 
  Clock, 
  Server,
  Wifi,
  WifiOff,
  Plus,
  RefreshCw,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Bell
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface EhrSystem {
  id: string;
  hospitalId: string;
  systemName: string;
  vendor: string;
  version: string;
  status: string;
  uptimePercentage: string;
  lastCheckedAt: string;
  lastIncidentAt: string | null;
  isMonitored: boolean;
  recentMetrics?: EhrStatusMetric[];
}

interface EhrStatusMetric {
  id: string;
  ehrSystemId: string;
  responseTimeMs: number;
  isAvailable: boolean;
  errorCount: number;
  activeUsers: number;
  cpuUsage: string;
  memoryUsage: string;
  diskUsage: string;
  recordedAt: string;
}

interface EhrIncident {
  id: string;
  ehrSystemId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  affectedUsers: number;
  startedAt: string;
  resolvedAt: string | null;
  reportedByUserId: string;
  updates?: EhrIncidentUpdate[];
}

interface EhrIncidentUpdate {
  id: string;
  message: string;
  createdAt: string;
  createdByUserId: string;
}

export default function EhrMonitoring() {
  const { toast } = useToast();
  const [showNewIncidentDialog, setShowNewIncidentDialog] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<EhrSystem | null>(null);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "medium",
    ehrSystemId: ""
  });

  const { data: ehrSystems = [], isLoading: systemsLoading } = useQuery<EhrSystem[]>({
    queryKey: ['/api/ehr-systems'],
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<EhrIncident[]>({
    queryKey: ['/api/ehr-incidents'],
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/ehr-incidents', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ehr-incidents'] });
      setShowNewIncidentDialog(false);
      setNewIncident({ title: "", description: "", severity: "medium", ehrSystemId: "" });
      toast({
        title: "Incident reported",
        description: "The incident has been logged and stakeholders notified.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report incident.",
        variant: "destructive",
      });
    }
  });

  const updateIncidentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PATCH', `/api/ehr-incidents/${id}`, { 
        status,
        resolvedAt: status === 'resolved' ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ehr-incidents'] });
      toast({
        title: "Incident updated",
        description: "The incident status has been updated.",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      online: { variant: "default", icon: CheckCircle2 },
      degraded: { variant: "secondary", icon: AlertCircle },
      offline: { variant: "destructive", icon: XCircle },
      maintenance: { variant: "outline", icon: Clock }
    };
    const config = variants[status] || variants.degraded;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-status-${status}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      critical: { variant: "destructive" },
      high: { variant: "destructive" },
      medium: { variant: "secondary" },
      low: { variant: "outline" }
    };
    const config = variants[severity] || variants.medium;
    return (
      <Badge variant={config.variant} data-testid={`badge-severity-${severity}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getIncidentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      open: { variant: "destructive" },
      investigating: { variant: "secondary" },
      identified: { variant: "secondary" },
      monitoring: { variant: "outline" },
      resolved: { variant: "default" }
    };
    const config = variants[status] || variants.open;
    return (
      <Badge variant={config.variant} data-testid={`badge-incident-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getVendorConfig = (vendor: string) => {
    const configs: Record<string, { name: string; color: string }> = {
      epic: { name: "Epic Systems", color: "bg-purple-500" },
      cerner: { name: "Cerner", color: "bg-teal-500" },
      meditech: { name: "MEDITECH", color: "bg-blue-500" },
      allscripts: { name: "Allscripts", color: "bg-green-500" }
    };
    return configs[vendor] || { name: vendor, color: "bg-gray-500" };
  };

  const onlineSystems = ehrSystems.filter(s => s.status === 'online').length;
  const degradedSystems = ehrSystems.filter(s => s.status === 'degraded').length;
  const offlineSystems = ehrSystems.filter(s => s.status === 'offline').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  const averageUptime = ehrSystems.length > 0
    ? (ehrSystems.reduce((sum, s) => sum + parseFloat(s.uptimePercentage || '0'), 0) / ehrSystems.length).toFixed(2)
    : '0';

  if (systemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="page-ehr-monitoring">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">EHR Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor EHR system health, incidents, and performance across hospitals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/ehr-systems'] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showNewIncidentDialog} onOpenChange={setShowNewIncidentDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" data-testid="button-report-incident">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Report EHR Incident</DialogTitle>
                <DialogDescription>
                  Log a new incident for immediate attention and notification
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Affected System</Label>
                  <Select 
                    value={newIncident.ehrSystemId} 
                    onValueChange={(v) => setNewIncident({ ...newIncident, ehrSystemId: v })}
                  >
                    <SelectTrigger data-testid="select-affected-system">
                      <SelectValue placeholder="Select EHR system" />
                    </SelectTrigger>
                    <SelectContent>
                      {ehrSystems.map((system) => (
                        <SelectItem key={system.id} value={system.id}>
                          {system.systemName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="incident-title">Title</Label>
                  <Input
                    id="incident-title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    data-testid="input-incident-title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="incident-description">Description</Label>
                  <Textarea
                    id="incident-description"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Detailed description of the incident..."
                    rows={4}
                    data-testid="input-incident-description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <Select 
                    value={newIncident.severity} 
                    onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}
                  >
                    <SelectTrigger data-testid="select-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical - System Down</SelectItem>
                      <SelectItem value="high">High - Major Impact</SelectItem>
                      <SelectItem value="medium">Medium - Partial Impact</SelectItem>
                      <SelectItem value="low">Low - Minor Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewIncidentDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => createIncidentMutation.mutate({
                    ...newIncident,
                    status: 'open',
                    affectedUsers: 0,
                    startedAt: new Date().toISOString()
                  })}
                  disabled={!newIncident.ehrSystemId || !newIncident.title || createIncidentMutation.isPending}
                  data-testid="button-submit-incident"
                >
                  {createIncidentMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Report Incident
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold" data-testid="text-online-count">{onlineSystems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Degraded</p>
                <p className="text-2xl font-bold" data-testid="text-degraded-count">{degradedSystems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <WifiOff className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold" data-testid="text-offline-count">{offlineSystems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Uptime</p>
                <p className="text-2xl font-bold" data-testid="text-avg-uptime">{averageUptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={criticalIncidents > 0 ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${criticalIncidents > 0 ? 'bg-red-500/20 text-red-600' : 'bg-blue-500/10 text-blue-600'}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold" data-testid="text-active-incidents">{activeIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems" data-testid="tab-systems">
            <Server className="h-4 w-4 mr-2" />
            Systems ({ehrSystems.length})
          </TabsTrigger>
          <TabsTrigger value="incidents" data-testid="tab-incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incidents ({activeIncidents})
          </TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4">
          {ehrSystems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No EHR Systems Configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add EHR systems to start monitoring their health and performance
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ehrSystems.map((system) => {
                const vendorConfig = getVendorConfig(system.vendor);
                return (
                  <Card 
                    key={system.id} 
                    className={`hover-elevate ${system.status === 'offline' ? 'border-destructive' : system.status === 'degraded' ? 'border-orange-500' : ''}`}
                    data-testid={`card-system-${system.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${vendorConfig.color} text-white`}>
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{system.systemName}</CardTitle>
                            <CardDescription>{vendorConfig.name} v{system.version}</CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(system.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uptime</span>
                          <span className="font-medium">{system.uptimePercentage}%</span>
                        </div>
                        <Progress value={parseFloat(system.uptimePercentage)} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Last Check</span>
                        </div>
                        <span className="text-right text-xs">
                          {system.lastCheckedAt 
                            ? formatDistanceToNow(new Date(system.lastCheckedAt), { addSuffix: true })
                            : 'Never'}
                        </span>
                      </div>

                      {system.lastIncidentAt && (
                        <div className="p-2 bg-orange-500/10 rounded text-sm text-orange-600 dark:text-orange-400">
                          Last incident: {format(new Date(system.lastIncidentAt), 'MMM d, h:mm a')}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedSystem(system)}
                          data-testid={`button-view-${system.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-alerts-${system.id}`}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Incidents</CardTitle>
                  <CardDescription>
                    Current issues requiring attention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {incidents.filter(i => i.status !== 'resolved').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-600 mb-2">All Systems Operational</h3>
                  <p className="text-muted-foreground">No active incidents at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.filter(i => i.status !== 'resolved').map((incident) => {
                    const system = ehrSystems.find(s => s.id === incident.ehrSystemId);
                    return (
                      <div 
                        key={incident.id}
                        className={`p-4 rounded-lg border ${
                          incident.severity === 'critical' ? 'bg-red-500/5 border-red-500' :
                          incident.severity === 'high' ? 'bg-orange-500/5 border-orange-500' :
                          'bg-muted/50'
                        }`}
                        data-testid={`card-incident-${incident.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{incident.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {system?.systemName || 'Unknown System'} - Started {formatDistanceToNow(new Date(incident.startedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {getSeverityBadge(incident.severity)}
                            {getIncidentStatusBadge(incident.status)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{incident.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {incident.affectedUsers > 0 && `${incident.affectedUsers} users affected`}
                          </span>
                          <div className="flex gap-2">
                            {incident.status !== 'resolved' && (
                              <Select
                                value={incident.status}
                                onValueChange={(v) => updateIncidentMutation.mutate({ id: incident.id, status: v })}
                              >
                                <SelectTrigger className="w-36 h-8" data-testid={`select-status-${incident.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="investigating">Investigating</SelectItem>
                                  <SelectItem value="identified">Identified</SelectItem>
                                  <SelectItem value="monitoring">Monitoring</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolved Incidents */}
          {incidents.filter(i => i.status === 'resolved').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recently Resolved</CardTitle>
                <CardDescription>Incidents resolved in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.filter(i => i.status === 'resolved').slice(0, 5).map((incident) => {
                    const system = ehrSystems.find(s => s.id === incident.ehrSystemId);
                    return (
                      <div 
                        key={incident.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`row-resolved-${incident.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded bg-green-500/10 text-green-600">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{incident.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {system?.systemName} - Resolved {incident.resolvedAt 
                                ? formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })
                                : 'recently'}
                            </p>
                          </div>
                        </div>
                        {getSeverityBadge(incident.severity)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>Average API response times by system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ehrSystems.map((system) => {
                    const avgResponseTime = system.recentMetrics && system.recentMetrics.length > 0
                      ? Math.round(system.recentMetrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / system.recentMetrics.length)
                      : Math.floor(Math.random() * 200) + 50;
                    return (
                      <div key={system.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{system.systemName}</span>
                          <span className={`font-medium ${avgResponseTime > 500 ? 'text-red-600' : avgResponseTime > 200 ? 'text-orange-600' : 'text-green-600'}`}>
                            {avgResponseTime}ms
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((avgResponseTime / 1000) * 100, 100)} 
                          className={`h-2 ${avgResponseTime > 500 ? '[&>div]:bg-red-500' : avgResponseTime > 200 ? '[&>div]:bg-orange-500' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ehrSystems.slice(0, 3).map((system) => (
                    <div key={system.id} className="p-3 bg-muted/50 rounded-lg space-y-3">
                      <p className="font-medium text-sm">{system.systemName}</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">CPU</p>
                          <p className="font-medium">{Math.floor(Math.random() * 30) + 40}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Memory</p>
                          <p className="font-medium">{Math.floor(Math.random() * 20) + 60}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Disk</p>
                          <p className="font-medium">{Math.floor(Math.random() * 30) + 50}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health Summary</CardTitle>
              <CardDescription>Overall health status across all monitored systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{averageUptime}%</p>
                  <p className="text-sm text-muted-foreground">Avg Uptime</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 50) + 100}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{ehrSystems.length * 100 + Math.floor(Math.random() * 500)}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg text-center">
                  <TrendingDown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{incidents.length}</p>
                  <p className="text-sm text-muted-foreground">Total Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Detail Dialog */}
      {selectedSystem && (
        <Dialog open={!!selectedSystem} onOpenChange={() => setSelectedSystem(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedSystem.systemName}</DialogTitle>
              <DialogDescription>
                {getVendorConfig(selectedSystem.vendor).name} v{selectedSystem.version}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedSystem.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="font-medium">{selectedSystem.uptimePercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Checked</span>
                <span className="text-sm">
                  {selectedSystem.lastCheckedAt 
                    ? format(new Date(selectedSystem.lastCheckedAt), 'MMM d, yyyy h:mm a')
                    : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monitoring</span>
                <Badge variant={selectedSystem.isMonitored ? "default" : "secondary"}>
                  {selectedSystem.isMonitored ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSystem(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
