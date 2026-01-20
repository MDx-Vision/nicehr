import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Zap,
  ArrowLeft,
  Plus,
  RefreshCw,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  FileJson,
  Bug,
  Lightbulb,
  CheckSquare,
  GitBranch,
  Settings,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface IntegrationRecord {
  id: string;
  integrationSourceId: string;
  externalId: string;
  externalEntity: string;
  externalData: any;
  mappedData: any;
  syncStatus: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

interface IntegrationSource {
  id: string;
  name: string;
  description: string;
  systemType: string;
  status: string;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  stats: {
    total: number;
    synced: number;
    failed: number;
  };
}

const SYNC_STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  running: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  partial: <AlertCircle className="h-4 w-4 text-orange-500" />,
};

export default function IntegrationsJira() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<IntegrationRecord | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    issueKey: "",
    summary: "",
    issueType: "",
    status: "",
    priority: "",
    assignee: "",
    description: "",
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery<IntegrationSource[]>({
    queryKey: ["/api/integrations", { systemType: "jira" }],
    queryFn: async () => {
      const res = await fetch("/api/integrations?systemType=jira");
      if (!res.ok) throw new Error("Failed to fetch Jira integrations");
      return res.json();
    },
  });

  const activeSource = sources?.[0];
  const { data: recordsData, isLoading: recordsLoading } = useQuery<{ records: IntegrationRecord[]; total: number }>({
    queryKey: ["/api/integrations", activeSource?.id, "records", searchTerm],
    queryFn: async () => {
      if (!activeSource) return { records: [], total: 0 };
      const params = new URLSearchParams({ limit: "50" });
      if (searchTerm) params.set("search", searchTerm);
      const res = await fetch(`/api/integrations/${activeSource.id}/records?${params}`);
      if (!res.ok) throw new Error("Failed to fetch records");
      return res.json();
    },
    enabled: !!activeSource,
  });

  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!activeSource) throw new Error("No active source");
      const res = await fetch(`/api/integrations/${activeSource.id}/import/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: [data] }),
      });
      if (!res.ok) throw new Error("Failed to import record");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setShowManualEntry(false);
      setManualData({
        issueKey: "",
        summary: "",
        issueType: "",
        status: "",
        priority: "",
        assignee: "",
        description: "",
      });
    },
  });

  const handleManualImport = () => {
    importMutation.mutate({
      externalId: manualData.issueKey || `JIRA-${Date.now()}`,
      externalEntity: manualData.issueType?.toLowerCase() || "issue",
      data: {
        key: manualData.issueKey,
        summary: manualData.summary,
        issuetype: { name: manualData.issueType },
        status: { name: manualData.status },
        priority: { name: manualData.priority },
        assignee: { displayName: manualData.assignee },
        description: manualData.description,
      },
    });
  };

  if (sourcesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/integrations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-jira-title">Jira</h1>
            <p className="text-muted-foreground">Issue Tracking data</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const totalRecords = recordsData?.total || 0;
  const records = recordsData?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/integrations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-jira-title">
              <Zap className="h-8 w-8 text-blue-500" />
              Jira
            </h1>
            <p className="text-muted-foreground">Issue Tracking data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowManualEntry(true)} data-testid="button-manual-entry">
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
          <Button variant="outline" data-testid="button-import-csv">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          {activeSource && (
            <Button variant="outline" onClick={() => navigate(`/integrations/${activeSource.id}/mappings`)} data-testid="button-manage-mappings">
              <Settings className="h-4 w-4 mr-2" />
              Mappings
            </Button>
          )}
          {activeSource && (
            <Button data-testid="button-sync">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-bugs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter((r) => r.externalEntity === "bug").length}
            </div>
            <p className="text-xs text-muted-foreground">From Jira</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stories">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter((r) => r.externalEntity === "story").length}
            </div>
            <p className="text-xs text-muted-foreground">User stories</p>
          </CardContent>
        </Card>

        <Card data-testid="card-tasks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter((r) => r.externalEntity === "task").length}
            </div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-records">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileJson className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              {activeSource?.stats?.synced || 0} synced
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      {sources && sources.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Active Connections</CardTitle>
            <CardDescription>Jira projects connected to NiceHR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${source.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {source.lastSyncAt && (
                      <div className="text-sm text-muted-foreground">
                        Last sync: {formatDistanceToNow(new Date(source.lastSyncAt), { addSuffix: true })}
                      </div>
                    )}
                    <Badge variant={source.status === "active" ? "default" : "secondary"}>
                      {source.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Jira connections</h3>
              <p className="text-muted-foreground mb-4">
                Add a Jira integration to start syncing data.
              </p>
              <Button onClick={() => navigate("/integrations")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      {activeSource && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Imported Records</CardTitle>
                <CardDescription>Data synchronized from Jira</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : records.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue Key</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Synced</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRecord(record)}
                      data-testid={`row-record-${record.id}`}
                    >
                      <TableCell className="font-mono text-sm font-medium">
                        {record.externalData?.key || record.externalId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.externalEntity}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.externalData?.summary || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {SYNC_STATUS_ICONS[record.syncStatus]}
                          <span className="capitalize">{record.syncStatus}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.lastSyncedAt
                          ? formatDistanceToNow(new Date(record.lastSyncedAt), { addSuffix: true })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No records imported</h3>
                <p className="text-muted-foreground">
                  Import data manually or via CSV to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Record Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>
              {selectedRecord?.externalData?.key || selectedRecord?.externalId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Issue Type</Label>
                <p className="font-medium">{selectedRecord?.externalEntity}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sync Status</Label>
                <div className="flex items-center gap-2">
                  {selectedRecord?.syncStatus && SYNC_STATUS_ICONS[selectedRecord.syncStatus]}
                  <span className="capitalize">{selectedRecord?.syncStatus}</span>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Summary</Label>
              <p className="font-medium">{selectedRecord?.externalData?.summary || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">External Data</Label>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto max-h-64">
                {JSON.stringify(selectedRecord?.externalData, null, 2)}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRecord(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Jira Entry</DialogTitle>
            <DialogDescription>
              Enter Jira issue data manually
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="issueKey">Issue Key</Label>
              <Input
                id="issueKey"
                placeholder="PROJ-123"
                value={manualData.issueKey}
                onChange={(e) => setManualData({ ...manualData, issueKey: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                placeholder="Issue summary"
                value={manualData.summary}
                onChange={(e) => setManualData({ ...manualData, summary: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issueType">Issue Type</Label>
                <Input
                  id="issueType"
                  placeholder="Bug, Story, Task"
                  value={manualData.issueType}
                  onChange={(e) => setManualData({ ...manualData, issueType: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  placeholder="Open, In Progress, Done"
                  value={manualData.status}
                  onChange={(e) => setManualData({ ...manualData, status: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  placeholder="Low, Medium, High"
                  value={manualData.priority}
                  onChange={(e) => setManualData({ ...manualData, priority: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  placeholder="Assignee name"
                  value={manualData.assignee}
                  onChange={(e) => setManualData({ ...manualData, assignee: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Issue description..."
                value={manualData.description}
                onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualImport}
              disabled={!manualData.summary || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
