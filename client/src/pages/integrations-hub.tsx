import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  Building2, 
  FileText, 
  Cloud, 
  Link2, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Clock, 
  Settings,
  Plus,
  PlayCircle,
  Loader2,
  Shield,
  Zap,
  ArrowUpDown
} from "lucide-react";
import { format } from "date-fns";

interface IntegrationConnection {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  syncFrequency: string;
  connectedAt: string;
  errorMessage: string | null;
}

interface SyncJob {
  id: string;
  connectionId: string;
  direction: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  createdAt: string;
}

export default function IntegrationsHub() {
  const { toast } = useToast();
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newConnection, setNewConnection] = useState({
    name: "",
    provider: "",
    category: "calendar",
    syncFrequency: "manual"
  });

  const { data: connections = [], isLoading: connectionsLoading } = useQuery<IntegrationConnection[]>({
    queryKey: ['/api/integrations/connections'],
  });

  const { data: syncJobs = [], isLoading: jobsLoading } = useQuery<SyncJob[]>({
    queryKey: ['/api/integrations/sync-jobs'],
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/integrations/connections', {
        ...data,
        connectedByUserId: 'demo-admin',
        status: 'connected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/connections'] });
      setShowNewConnectionDialog(false);
      setNewConnection({ name: "", provider: "", category: "calendar", syncFrequency: "manual" });
      toast({
        title: "Connection created",
        description: "The integration has been connected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create connection.",
        variant: "destructive",
      });
    }
  });

  const triggerSyncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      return apiRequest('POST', '/api/integrations/sync-jobs', {
        connectionId,
        direction: 'bidirectional'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/sync-jobs'] });
      toast({
        title: "Sync started",
        description: "The synchronization job has been started.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start sync.",
        variant: "destructive",
      });
    }
  });

  const toggleConnectionMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/integrations/connections/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/connections'] });
      toast({
        title: "Connection updated",
        description: "The integration status has been updated.",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      connected: { variant: "default", icon: Check },
      pending: { variant: "secondary", icon: Clock },
      disconnected: { variant: "outline", icon: AlertTriangle },
      error: { variant: "destructive", icon: AlertTriangle }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-status-${status}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSyncStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { variant: "default" },
      pending: { variant: "secondary" },
      in_progress: { variant: "secondary" },
      failed: { variant: "destructive" },
      partial: { variant: "outline" }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} data-testid={`badge-sync-${status}`}>
        {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'payroll': return <FileText className="h-5 w-5" />;
      case 'ehr': return <Building2 className="h-5 w-5" />;
      case 'storage': return <Cloud className="h-5 w-5" />;
      default: return <Link2 className="h-5 w-5" />;
    }
  };

  const getProviderConfig = (provider: string) => {
    const configs: Record<string, { name: string; color: string }> = {
      google_calendar: { name: "Google Calendar", color: "bg-blue-500" },
      microsoft_outlook: { name: "Microsoft Outlook", color: "bg-cyan-500" },
      adp: { name: "ADP Workforce", color: "bg-red-500" },
      workday: { name: "Workday", color: "bg-orange-500" },
      epic: { name: "Epic Systems", color: "bg-purple-500" },
      cerner: { name: "Cerner", color: "bg-teal-500" },
    };
    return configs[provider] || { name: provider, color: "bg-gray-500" };
  };

  const filteredConnections = selectedCategory === 'all' 
    ? connections 
    : connections.filter(c => c.category === selectedCategory);

  const connectionsByCategory = {
    calendar: connections.filter(c => c.category === 'calendar'),
    payroll: connections.filter(c => c.category === 'payroll'),
    ehr: connections.filter(c => c.category === 'ehr'),
  };

  const recentJobs = [...syncJobs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);

  // Integration templates for quick setup
  const integrationTemplates = [
    { provider: 'google_calendar', name: 'Google Calendar', category: 'calendar', icon: Calendar, color: 'bg-blue-500' },
    { provider: 'microsoft_outlook', name: 'Microsoft Outlook', category: 'calendar', icon: Calendar, color: 'bg-cyan-500' },
    { provider: 'adp', name: 'ADP Workforce Now', category: 'payroll', icon: FileText, color: 'bg-red-500' },
    { provider: 'workday', name: 'Workday', category: 'payroll', icon: FileText, color: 'bg-orange-500' },
    { provider: 'epic', name: 'Epic Systems', category: 'ehr', icon: Building2, color: 'bg-purple-500' },
    { provider: 'cerner', name: 'Cerner', category: 'ehr', icon: Building2, color: 'bg-teal-500' },
  ];

  if (connectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="page-integrations-hub">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Integrations Hub</h1>
          <p className="text-muted-foreground">
            Connect and manage external services, calendars, and HR systems
          </p>
        </div>
        <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-connection">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect a new external service to sync data automatically
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Select Integration</Label>
                <div className="grid grid-cols-2 gap-2">
                  {integrationTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.provider}
                        type="button"
                        className={`p-3 rounded-lg border text-left transition-colors hover-elevate ${
                          newConnection.provider === template.provider 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                        onClick={() => setNewConnection({
                          ...newConnection,
                          provider: template.provider,
                          name: template.name,
                          category: template.category
                        })}
                        data-testid={`button-select-${template.provider}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${template.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {newConnection.provider && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="connection-name">Connection Name</Label>
                    <Input
                      id="connection-name"
                      value={newConnection.name}
                      onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                      placeholder="e.g., Main Google Calendar"
                      data-testid="input-connection-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sync-frequency">Sync Frequency</Label>
                    <Select 
                      value={newConnection.syncFrequency} 
                      onValueChange={(v) => setNewConnection({ ...newConnection, syncFrequency: v })}
                    >
                      <SelectTrigger id="sync-frequency" data-testid="select-sync-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewConnectionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createConnectionMutation.mutate(newConnection)}
                disabled={!newConnection.provider || !newConnection.name || createConnectionMutation.isPending}
                data-testid="button-create-connection"
              >
                {createConnectionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold" data-testid="text-total-connections">{connections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold" data-testid="text-active-connections">
                  {connections.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Syncs Today</p>
                <p className="text-2xl font-bold" data-testid="text-syncs-today">
                  {syncJobs.filter(j => {
                    const today = new Date().toDateString();
                    return new Date(j.createdAt).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold" data-testid="text-needs-attention">
                  {connections.filter(c => c.status === 'error' || c.lastSyncStatus === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections" data-testid="tab-connections">
            <Link2 className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="sync-history" data-testid="tab-sync-history">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync History
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              data-testid="button-filter-all"
            >
              All ({connections.length})
            </Button>
            <Button
              variant={selectedCategory === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('calendar')}
              data-testid="button-filter-calendar"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar ({connectionsByCategory.calendar.length})
            </Button>
            <Button
              variant={selectedCategory === 'payroll' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('payroll')}
              data-testid="button-filter-payroll"
            >
              <FileText className="h-4 w-4 mr-1" />
              Payroll ({connectionsByCategory.payroll.length})
            </Button>
            <Button
              variant={selectedCategory === 'ehr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('ehr')}
              data-testid="button-filter-ehr"
            >
              <Building2 className="h-4 w-4 mr-1" />
              EHR ({connectionsByCategory.ehr.length})
            </Button>
          </div>

          {/* Connections Grid */}
          {filteredConnections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Connections Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your first integration to start syncing data
                </p>
                <Button onClick={() => setShowNewConnectionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((connection) => {
                const providerConfig = getProviderConfig(connection.provider);
                return (
                  <Card key={connection.id} className="hover-elevate" data-testid={`card-connection-${connection.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${providerConfig.color} text-white`}>
                            {getCategoryIcon(connection.category)}
                          </div>
                          <div>
                            <CardTitle className="text-base">{connection.name}</CardTitle>
                            <CardDescription>{providerConfig.name}</CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={connection.isActive}
                          onCheckedChange={(checked) => 
                            toggleConnectionMutation.mutate({ id: connection.id, isActive: checked })
                          }
                          data-testid={`switch-active-${connection.id}`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        {getStatusBadge(connection.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sync</span>
                        <span className="text-sm capitalize">{connection.syncFrequency}</span>
                      </div>
                      {connection.lastSyncAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Sync</span>
                          <span className="text-sm">
                            {format(new Date(connection.lastSyncAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      )}
                      {connection.errorMessage && (
                        <div className="p-2 bg-destructive/10 rounded text-sm text-destructive">
                          {connection.errorMessage}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => triggerSyncMutation.mutate(connection.id)}
                          disabled={!connection.isActive || triggerSyncMutation.isPending}
                          data-testid={`button-sync-${connection.id}`}
                        >
                          {triggerSyncMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-settings-${connection.id}`}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sync-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent synchronization jobs and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No sync jobs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => {
                    const connection = connections.find(c => c.id === job.connectionId);
                    return (
                      <div 
                        key={job.id} 
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        data-testid={`row-sync-job-${job.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${job.status === 'completed' ? 'bg-green-500/10 text-green-600' : job.status === 'failed' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'}`}>
                            {job.status === 'completed' ? <Check className="h-4 w-4" /> : 
                             job.status === 'failed' ? <AlertTriangle className="h-4 w-4" /> : 
                             <Loader2 className="h-4 w-4 animate-spin" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{connection?.name || 'Unknown Connection'}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(job.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{job.recordsProcessed} records</p>
                            <p className="text-xs text-muted-foreground">
                              <span className="text-green-600">{job.recordsSucceeded} ok</span>
                              {job.recordsFailed > 0 && (
                                <span className="text-red-600 ml-2">{job.recordsFailed} failed</span>
                              )}
                            </p>
                          </div>
                          {getSyncStatusBadge(job.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Integration Settings</CardTitle>
              <CardDescription>
                Configure default behavior for all integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Retry Failed Syncs</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically retry failed sync jobs up to 3 times
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-auto-retry" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sync Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for sync completions and failures
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-sync-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Conflict Resolution</Label>
                  <p className="text-sm text-muted-foreground">
                    How to handle data conflicts during sync
                  </p>
                </div>
                <Select defaultValue="newer">
                  <SelectTrigger className="w-40" data-testid="select-conflict-resolution">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newer">Keep Newer</SelectItem>
                    <SelectItem value="local">Keep Local</SelectItem>
                    <SelectItem value="remote">Keep Remote</SelectItem>
                    <SelectItem value="manual">Ask Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>
                Integration security settings and audit controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">All Connections Secure</p>
                  <p className="text-sm text-muted-foreground">
                    Using encrypted OAuth tokens and secure API connections
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Zap className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Audit Logging Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    All sync activities are logged for compliance review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
