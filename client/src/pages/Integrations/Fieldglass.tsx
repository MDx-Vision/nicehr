import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
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
  FileText,
  Briefcase,
  DollarSign,
  Settings,
  Zap,
  Bot,
  Send,
  UserCheck,
  Building,
  Calendar,
  Star,
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
  apiUrl: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  configurationJson: any;
  stats: {
    total: number;
    synced: number;
    failed: number;
  };
}

interface SOWOpportunity {
  id: string;
  title: string;
  client: string;
  startDate: string;
  endDate: string;
  rate: number;
  skills: string[];
  status: "new" | "matched" | "responded" | "awarded" | "rejected";
  matchedConsultants: MatchedConsultant[];
  autoResponseEnabled: boolean;
  respondedAt?: string;
}

interface MatchedConsultant {
  id: string;
  name: string;
  matchScore: number;
  skills: string[];
  availability: string;
  rate: number;
  previousProjects: number;
}

const SYNC_STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  running: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  partial: <AlertCircle className="h-4 w-4 text-orange-500" />,
};

const SOW_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  matched: "bg-yellow-500",
  responded: "bg-purple-500",
  awarded: "bg-green-500",
  rejected: "bg-red-500",
};

// Mock SOW data for demonstration
const MOCK_SOWS: SOWOpportunity[] = [
  {
    id: "sow-1",
    title: "Epic EHR Implementation Specialist",
    client: "Memorial Healthcare System",
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    rate: 175,
    skills: ["Epic", "EHR Implementation", "Clinical Workflows", "Training"],
    status: "new",
    matchedConsultants: [],
    autoResponseEnabled: true,
  },
  {
    id: "sow-2",
    title: "Cerner Integration Analyst",
    client: "Regional Medical Center",
    startDate: "2026-02-15",
    endDate: "2026-06-15",
    rate: 150,
    skills: ["Cerner", "HL7", "Integration", "Data Migration"],
    status: "matched",
    matchedConsultants: [
      { id: "c1", name: "Sarah Johnson", matchScore: 95, skills: ["Cerner", "HL7", "Integration"], availability: "Available", rate: 145, previousProjects: 8 },
      { id: "c2", name: "Michael Chen", matchScore: 87, skills: ["Cerner", "Data Migration"], availability: "Available Mar 1", rate: 140, previousProjects: 5 },
    ],
    autoResponseEnabled: true,
  },
  {
    id: "sow-3",
    title: "MEDITECH Go-Live Support",
    client: "Community Hospital Network",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    rate: 200,
    skills: ["MEDITECH", "Go-Live Support", "Training", "Troubleshooting"],
    status: "responded",
    matchedConsultants: [
      { id: "c3", name: "Emily Rodriguez", matchScore: 92, skills: ["MEDITECH", "Go-Live Support", "Training"], availability: "Available", rate: 190, previousProjects: 12 },
    ],
    autoResponseEnabled: true,
    respondedAt: "2026-02-03T14:30:00Z",
  },
];

export default function IntegrationsFieldglass() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("sow");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSOW, setSelectedSOW] = useState<SOWOpportunity | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [autoResponseGlobal, setAutoResponseGlobal] = useState(true);
  const [matchThreshold, setMatchThreshold] = useState(80);
  const [sows, setSows] = useState<SOWOpportunity[]>(MOCK_SOWS);

  // Config state
  const [config, setConfig] = useState({
    environmentUrl: "",
    clientId: "",
    clientSecret: "",
    apiKey: "",
    webhookUrl: "",
    autoSync: true,
    syncFrequency: "hourly",
  });

  const { data: sources, isLoading: sourcesLoading } = useQuery<IntegrationSource[]>({
    queryKey: ["/api/integrations", { systemType: "fieldglass" }],
    queryFn: async () => {
      const res = await fetch("/api/integrations?systemType=fieldglass");
      if (!res.ok) throw new Error("Failed to fetch Fieldglass integrations");
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

  const createSourceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "SAP Fieldglass",
          description: "SAP Fieldglass VMS integration for SOW and contingent worker management",
          systemType: "fieldglass",
          apiUrl: config.environmentUrl,
          configurationJson: {
            clientId: config.clientId,
            webhookUrl: config.webhookUrl,
            autoSync: config.autoSync,
            syncFrequency: config.syncFrequency,
            autoResponseEnabled: autoResponseGlobal,
            matchThreshold: matchThreshold,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create integration");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setShowConfigDialog(false);
    },
  });

  const handleMatchConsultants = (sowId: string) => {
    // Simulate matching consultants
    setSows(prev => prev.map(sow => {
      if (sow.id === sowId) {
        return {
          ...sow,
          status: "matched" as const,
          matchedConsultants: [
            { id: "c1", name: "Sarah Johnson", matchScore: 95, skills: sow.skills.slice(0, 3), availability: "Available", rate: sow.rate - 10, previousProjects: 8 },
            { id: "c2", name: "Michael Chen", matchScore: 87, skills: sow.skills.slice(0, 2), availability: "Available Mar 1", rate: sow.rate - 15, previousProjects: 5 },
            { id: "c3", name: "Emily Rodriguez", matchScore: 82, skills: sow.skills.slice(1, 3), availability: "Available", rate: sow.rate - 5, previousProjects: 12 },
          ],
        };
      }
      return sow;
    }));
  };

  const handleAutoRespond = (sowId: string) => {
    setSows(prev => prev.map(sow => {
      if (sow.id === sowId && sow.matchedConsultants.length > 0) {
        return {
          ...sow,
          status: "responded" as const,
          respondedAt: new Date().toISOString(),
        };
      }
      return sow;
    }));
  };

  const filteredSows = sows.filter(sow =>
    sow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sow.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sow.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const newSowCount = sows.filter(s => s.status === "new").length;
  const matchedCount = sows.filter(s => s.status === "matched").length;
  const respondedCount = sows.filter(s => s.status === "responded").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/integrations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-fieldglass-title">
              <Users className="h-8 w-8 text-orange-500" />
              SAP Fieldglass
            </h1>
            <p className="text-muted-foreground">
              Vendor Management System - SOW & Contingent Worker Integration
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConfigDialog(true)} data-testid="button-configure">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          {activeSource && (
            <Button variant="outline" data-testid="button-sync">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Now
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card data-testid="card-new-sows">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New SOWs</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newSowCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting consultant match</p>
          </CardContent>
        </Card>

        <Card data-testid="card-matched">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched</CardTitle>
            <UserCheck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchedCount}</div>
            <p className="text-xs text-muted-foreground">Ready to respond</p>
          </CardContent>
        </Card>

        <Card data-testid="card-responded">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <Send className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respondedCount}</div>
            <p className="text-xs text-muted-foreground">Proposals submitted</p>
          </CardContent>
        </Card>

        <Card data-testid="card-auto-response">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Response</CardTitle>
            <Bot className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoResponseGlobal}
                onCheckedChange={setAutoResponseGlobal}
                data-testid="switch-auto-response"
              />
              <span className="text-sm">{autoResponseGlobal ? "Enabled" : "Disabled"}</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-match-threshold">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Threshold</CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchThreshold}%</div>
            <p className="text-xs text-muted-foreground">Minimum score to respond</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sow" data-testid="tab-sow">
            <Briefcase className="h-4 w-4 mr-2" />
            SOW Opportunities
          </TabsTrigger>
          <TabsTrigger value="workers" data-testid="tab-workers">
            <Users className="h-4 w-4 mr-2" />
            Contingent Workers
          </TabsTrigger>
          <TabsTrigger value="timesheets" data-testid="tab-timesheets">
            <Clock className="h-4 w-4 mr-2" />
            Timesheets
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync History
          </TabsTrigger>
        </TabsList>

        {/* SOW Opportunities Tab */}
        <TabsContent value="sow" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Statement of Work Opportunities</CardTitle>
                  <CardDescription>
                    Auto-detect SOWs from Fieldglass and match with your consultant network
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search SOWs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                      data-testid="input-search-sow"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table data-testid="table-sows">
                <TableHeader>
                  <TableRow>
                    <TableHead>SOW Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSows.map((sow) => (
                    <TableRow key={sow.id} data-testid={`row-sow-${sow.id}`}>
                      <TableCell>
                        <div className="font-medium">{sow.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {sow.client}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(sow.startDate), "MMM d")} - {format(new Date(sow.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-medium">${sow.rate}/hr</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sow.skills.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {sow.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{sow.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={SOW_STATUS_COLORS[sow.status]}>
                          {sow.status.charAt(0).toUpperCase() + sow.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sow.matchedConsultants.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span>{sow.matchedConsultants.length}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {sow.status === "new" && (
                            <Button
                              size="sm"
                              onClick={() => handleMatchConsultants(sow.id)}
                              data-testid={`button-match-${sow.id}`}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Match
                            </Button>
                          )}
                          {sow.status === "matched" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedSOW(sow)}
                                data-testid={`button-view-${sow.id}`}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAutoRespond(sow.id)}
                                data-testid={`button-respond-${sow.id}`}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Respond
                              </Button>
                            </>
                          )}
                          {sow.status === "responded" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedSOW(sow)}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contingent Workers</CardTitle>
              <CardDescription>
                Active workers synced from SAP Fieldglass
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contingent workers synced yet.</p>
                <p className="text-sm">Configure Fieldglass connection to sync worker data.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timesheets Tab */}
        <TabsContent value="timesheets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timesheets</CardTitle>
              <CardDescription>
                Timesheet data from Fieldglass workers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No timesheets synced yet.</p>
                <p className="text-sm">Timesheets will appear after worker data is synced.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent synchronization operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sync history available.</p>
                <p className="text-sm">History will appear after first sync.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SOW Detail Dialog */}
      <Dialog open={!!selectedSOW} onOpenChange={() => setSelectedSOW(null)}>
        <DialogContent className="max-w-3xl" data-testid="dialog-sow-detail">
          <DialogHeader>
            <DialogTitle>{selectedSOW?.title}</DialogTitle>
            <DialogDescription>
              {selectedSOW?.client} | ${selectedSOW?.rate}/hr
            </DialogDescription>
          </DialogHeader>
          {selectedSOW && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p>{format(new Date(selectedSOW.startDate), "MMM d, yyyy")} - {format(new Date(selectedSOW.endDate), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={SOW_STATUS_COLORS[selectedSOW.status]}>
                    {selectedSOW.status.charAt(0).toUpperCase() + selectedSOW.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSOW.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {selectedSOW.matchedConsultants.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Matched Consultants</Label>
                  <div className="mt-2 space-y-2">
                    {selectedSOW.matchedConsultants.map((consultant) => (
                      <div key={consultant.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{consultant.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {consultant.previousProjects} previous projects | ${consultant.rate}/hr
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-bold">{consultant.matchScore}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{consultant.availability}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSOW.respondedAt && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Response Submitted</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Responded {formatDistanceToNow(new Date(selectedSOW.respondedAt), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSOW(null)}>Close</Button>
            {selectedSOW?.status === "matched" && (
              <Button onClick={() => {
                handleAutoRespond(selectedSOW.id);
                setSelectedSOW(null);
              }}>
                <Send className="h-4 w-4 mr-2" />
                Submit Response
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-config">
          <DialogHeader>
            <DialogTitle>Configure SAP Fieldglass Integration</DialogTitle>
            <DialogDescription>
              Connect to your SAP Fieldglass instance using OAuth 2.0
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="environmentUrl">Environment URL</Label>
                <Input
                  id="environmentUrl"
                  placeholder="https://your-instance.fieldglass.net"
                  value={config.environmentUrl}
                  onChange={(e) => setConfig({ ...config, environmentUrl: e.target.value })}
                  data-testid="input-environment-url"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">OAuth Client ID</Label>
                  <Input
                    id="clientId"
                    placeholder="Your client ID"
                    value={config.clientId}
                    onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                    data-testid="input-client-id"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientSecret">OAuth Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Your client secret"
                    value={config.clientSecret}
                    onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                    data-testid="input-client-secret"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  placeholder="Generated from Fieldglass Integration Tools"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  data-testid="input-api-key"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Auto-Response Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Auto-Response</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically respond to SOWs when matching consultants are found
                    </p>
                  </div>
                  <Switch
                    checked={autoResponseGlobal}
                    onCheckedChange={setAutoResponseGlobal}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Minimum Match Score: {matchThreshold}%</Label>
                  <Input
                    type="range"
                    min="50"
                    max="100"
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Only respond with consultants scoring above this threshold
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Sync Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-Sync</Label>
                  <Switch
                    checked={config.autoSync}
                    onCheckedChange={(checked) => setConfig({ ...config, autoSync: checked })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Sync Frequency</Label>
                  <Select
                    value={config.syncFrequency}
                    onValueChange={(value) => setConfig({ ...config, syncFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (Webhook)</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Cancel</Button>
            <Button
              onClick={() => createSourceMutation.mutate()}
              disabled={!config.environmentUrl || createSourceMutation.isPending}
            >
              {createSourceMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
