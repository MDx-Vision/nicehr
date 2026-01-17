import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ClipboardCheck, Calendar, ListChecks, TestTube2, AlertTriangle,
  Network, Clock, Gauge, Plus, Search, Filter, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Play, Pause, ChevronRight,
  BarChart3, Settings, Download, Users, Shield, Database, Trash2, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  createTdrEvent, updateTdrEvent,
  createChecklistItem, completeChecklistItem, uncompleteChecklistItem, seedChecklist, deleteChecklistItem,
  createTestScenario, executeTestScenario, deleteTestScenario,
  createIssue, updateIssue, resolveIssue, createTicketFromIssue, deleteIssue,
  createIntegrationTest, updateIntegrationTest, deleteIntegrationTest,
  createDowntimeTest, updateDowntimeTest, deleteDowntimeTest,
  calculateReadinessScore, approveReadinessScore,
  type TdrSummary,
} from "@/lib/tdrApi";
import type {
  TdrEvent, TdrChecklistItem, TdrTestScenario, TdrIssue,
  TdrIntegrationTest, TdrDowntimeTest, TdrReadinessScore, Project
} from "@shared/schema";

export default function TDRManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Modal states
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createChecklistOpen, setCreateChecklistOpen] = useState(false);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [createIssueOpen, setCreateIssueOpen] = useState(false);
  const [createIntegrationOpen, setCreateIntegrationOpen] = useState(false);
  const [createDowntimeOpen, setCreateDowntimeOpen] = useState(false);

  // Form states
  const [eventForm, setEventForm] = useState({ name: "", description: "", scheduledDate: "", type: "full" });
  const [checklistForm, setChecklistForm] = useState({ category: "infrastructure", title: "", description: "", priority: "medium" });
  const [testForm, setTestForm] = useState({ category: "workflow", title: "", description: "", expectedResult: "", priority: "medium" });
  const [issueForm, setIssueForm] = useState({ title: "", description: "", category: "technical", severity: "medium", blocksGoLive: false });
  const [integrationForm, setIntegrationForm] = useState({ interfaceName: "", interfaceType: "HL7", sourceSystem: "", targetSystem: "", direction: "bidirectional" });
  const [downtimeForm, setDowntimeForm] = useState({ procedureName: "", procedureType: "planned_downtime", description: "", expectedDurationMinutes: 30 });

  // Fetch projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch TDR summary for selected project
  const { data: summary, isLoading: summaryLoading } = useQuery<TdrSummary>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`],
    enabled: !!selectedProjectId,
  });

  // Fetch TDR data
  const { data: events = [] } = useQuery<TdrEvent[]>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/events`],
    enabled: !!selectedProjectId,
  });

  const { data: checklist = [] } = useQuery<TdrChecklistItem[]>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/checklist`],
    enabled: !!selectedProjectId,
  });

  const { data: testScenarios = [] } = useQuery<TdrTestScenario[]>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/test-scenarios`],
    enabled: !!selectedProjectId,
  });

  const { data: issues = [] } = useQuery<TdrIssue[]>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/issues`],
    enabled: !!selectedProjectId,
  });

  const { data: integrationTests = [] } = useQuery<TdrIntegrationTest[]>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/integration-tests`],
    enabled: !!selectedProjectId,
  });

  const { data: downtimeTests = [] } = useQuery<TdrDowntimeTest[]>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/downtime-tests`],
    enabled: !!selectedProjectId,
  });

  const { data: readinessScore } = useQuery<TdrReadinessScore>({
    queryKey: [`/api/projects/${selectedProjectId}/tdr/readiness-score`],
    enabled: !!selectedProjectId,
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: () => createTdrEvent(selectedProjectId, { ...eventForm, scheduledDate: new Date(eventForm.scheduledDate) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/events`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      setCreateEventOpen(false);
      setEventForm({ name: "", description: "", scheduledDate: "", type: "full" });
      toast({ title: "TDR event scheduled" });
    },
  });

  const seedChecklistMutation = useMutation({
    mutationFn: () => seedChecklist(selectedProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/checklist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Default checklist items created" });
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: async (item: TdrChecklistItem) => {
      if (item.isCompleted) {
        return uncompleteChecklistItem(item.id);
      } else {
        return completeChecklistItem(item.id, user?.id || "dev-user-local");
      }
    },
    onSuccess: (data, item) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/checklist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({
        title: item.isCompleted ? "Item unchecked" : "Item completed",
        description: item.isCompleted ? "Checklist item marked as incomplete" : "Checklist item marked as complete",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating checklist",
        description: error.message || "Failed to update checklist item",
        variant: "destructive",
      });
    },
  });

  const createChecklistMutation = useMutation({
    mutationFn: () => createChecklistItem(selectedProjectId, checklistForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/checklist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      setCreateChecklistOpen(false);
      setChecklistForm({ category: "infrastructure", title: "", description: "", priority: "medium" });
      toast({ title: "Checklist item added" });
    },
  });

  const createTestMutation = useMutation({
    mutationFn: () => createTestScenario(selectedProjectId, testForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/test-scenarios`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      setCreateTestOpen(false);
      setTestForm({ category: "workflow", title: "", description: "", expectedResult: "", priority: "medium" });
      toast({ title: "Test scenario created" });
    },
  });

  const executeTestMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      executeTestScenario(id, { status, userId: user?.id || "dev-user-local" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/test-scenarios`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: () => createIssue(selectedProjectId, issueForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/issues`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      setCreateIssueOpen(false);
      setIssueForm({ title: "", description: "", category: "technical", severity: "medium", blocksGoLive: false });
      toast({ title: "Issue created" });
    },
  });

  const resolveIssueMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) => resolveIssue(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/issues`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Issue resolved" });
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: (issueId: string) => createTicketFromIssue(issueId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/issues`] });
      queryClient.invalidateQueries({ queryKey: [`/api/support-tickets`] });
      toast({
        title: "Support ticket created",
        description: `Ticket ${data.ticket?.ticketNumber || data.ticket?.id} created from TDR issue`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create ticket",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    },
  });

  const createIntegrationMutation = useMutation({
    mutationFn: () => createIntegrationTest(selectedProjectId, integrationForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/integration-tests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      setCreateIntegrationOpen(false);
      setIntegrationForm({ interfaceName: "", interfaceType: "HL7", sourceSystem: "", targetSystem: "", direction: "bidirectional" });
      toast({ title: "Integration test created" });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateIntegrationTest(id, { status, testedAt: new Date() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/integration-tests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
    },
  });

  const createDowntimeMutation = useMutation({
    mutationFn: () => createDowntimeTest(selectedProjectId, downtimeForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/downtime-tests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      setCreateDowntimeOpen(false);
      setDowntimeForm({ procedureName: "", procedureType: "planned_downtime", description: "", expectedDurationMinutes: 30 });
      toast({ title: "Downtime test created" });
    },
  });

  const updateDowntimeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateDowntimeTest(id, { status, testedAt: new Date() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/downtime-tests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
    },
  });

  const calculateScoreMutation = useMutation({
    mutationFn: () => calculateReadinessScore(selectedProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/readiness-score`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Readiness score calculated" });
    },
  });

  // Delete mutations
  const deleteChecklistMutation = useMutation({
    mutationFn: (id: string) => deleteChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/checklist`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Checklist item deleted" });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id: string) => deleteTestScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/test-scenarios`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Test scenario deleted" });
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: (id: string) => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/issues`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Issue deleted" });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: string) => deleteIntegrationTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/integration-tests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Integration test deleted" });
    },
  });

  const deleteDowntimeMutation = useMutation({
    mutationFn: (id: string) => deleteDowntimeTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/downtime-tests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${selectedProjectId}/tdr/summary`] });
      toast({ title: "Downtime test deleted" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      passed: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
      blocked: { variant: "outline", icon: AlertCircle },
      skipped: { variant: "outline", icon: Pause },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return <Badge variant={config.variant}><Icon className="h-3 w-3 mr-1" />{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      medium: "outline",
      high: "default",
      critical: "destructive",
    };
    return <Badge variant={variants[severity] || "secondary"}>{severity}</Badge>;
  };

  const getRecommendationBadge = (recommendation: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      go: { variant: "default", label: "GO" },
      conditional_go: { variant: "secondary", label: "CONDITIONAL GO" },
      no_go: { variant: "destructive", label: "NO GO" },
    };
    const config = configs[recommendation] || configs.no_go;
    return <Badge variant={config.variant} className="text-lg px-4 py-1">{config.label}</Badge>;
  };

  // Group checklist by category
  const checklistByCategory = checklist.reduce((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, TdrChecklistItem[]>);

  const categoryLabels: Record<string, string> = {
    infrastructure: "Infrastructure",
    integrations: "Integrations",
    data_migration: "Data Migration",
    workflows: "Workflows",
    support: "Support Readiness",
  };

  const categoryIcons: Record<string, any> = {
    infrastructure: Settings,
    integrations: Network,
    data_migration: Database,
    workflows: ClipboardCheck,
    support: Users,
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Technical Dress Rehearsal (TDR)
            </CardTitle>
            <CardDescription>Select a project to manage its TDR activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            TDR Management
          </h1>
          <p className="text-muted-foreground">
            Technical Dress Rehearsal for {selectedProject?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setCreateEventOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule TDR
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full max-w-4xl">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Checklist Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.checklist.percentage || 0}%</div>
                <Progress value={summary?.checklist.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.checklist.completed || 0} / {summary?.checklist.total || 0} items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Test Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.testScenarios.percentage || 0}%</div>
                <Progress value={summary?.testScenarios.percentage || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.testScenarios.passed || 0} passed, {summary?.testScenarios.failed || 0} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.issues.open || 0}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive">{summary?.issues.critical || 0} critical</Badge>
                  <Badge variant="outline">{summary?.issues.blockers || 0} blockers</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.latestScore?.overallScore || 0}%</div>
                <div className="mt-2">
                  {summary?.latestScore?.recommendation && getRecommendationBadge(summary.latestScore.recommendation)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming TDR Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-muted-foreground">No TDR events scheduled</p>
              ) : (
                <div className="space-y-2">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.scheduledDate && format(new Date(event.scheduledDate), "PPP")}
                        </div>
                      </div>
                      <Badge>{event.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">TDR Checklist</h2>
            <div className="flex gap-2">
              {checklist.length === 0 && (
                <Button variant="outline" onClick={() => seedChecklistMutation.mutate()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Default Checklist
                </Button>
              )}
              <Button onClick={() => setCreateChecklistOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {Object.entries(checklistByCategory).map(([category, items]) => {
              const Icon = categoryIcons[category] || ClipboardCheck;
              const completed = items.filter(i => i.isCompleted).length;
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {categoryLabels[category] || category}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {completed} / {items.length} complete
                      </span>
                    </CardTitle>
                    <Progress value={(completed / items.length) * 100} className="h-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                          onClick={() => toggleChecklistMutation.mutate(item)}
                        >
                          <Checkbox
                            checked={item.isCompleted || false}
                            onCheckedChange={() => toggleChecklistMutation.mutate(item)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className={item.isCompleted ? "line-through text-muted-foreground" : ""}>
                            {item.title}
                          </span>
                          <Badge variant="outline" className="ml-auto">{item.priority}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-testid="delete-checklist-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChecklistMutation.mutate(item.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Test Scenarios</h2>
            <Button onClick={() => setCreateTestOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Test
            </Button>
          </div>

          <div className="grid gap-4">
            {testScenarios.map((test) => (
              <Card key={test.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{test.title}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{test.category}</Badge>
                        {test.department && <Badge variant="secondary">{test.department}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status || "pending")}
                      {test.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" onClick={() => executeTestMutation.mutate({ id: test.id, status: "passed" })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => executeTestMutation.mutate({ id: test.id, status: "failed" })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid="delete-test-scenario"
                        onClick={() => deleteTestMutation.mutate(test.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {test.expectedResult && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Expected:</span> {test.expectedResult}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {testScenarios.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No test scenarios defined. Click "Add Test" to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">TDR Issues</h2>
            <Button onClick={() => setCreateIssueOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>

          <div className="grid gap-4">
            {issues.map((issue) => (
              <Card key={issue.id} className={issue.blocksGoLive ? "border-destructive" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">{issue.issueNumber}</span>
                        <span className="font-medium">{issue.title}</span>
                        {issue.blocksGoLive && <Badge variant="destructive">Blocks Go-Live</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{issue.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{issue.category}</Badge>
                        {getSeverityBadge(issue.severity || "medium")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={issue.status === "resolved" ? "default" : "secondary"}>{issue.status}</Badge>
                      {issue.supportTicketId && (
                        <a href="/support-tickets" className="text-sm text-blue-600 hover:underline">
                          <Badge variant="outline" className="cursor-pointer">
                            View Ticket
                          </Badge>
                        </a>
                      )}
                      {!issue.supportTicketId && issue.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => createTicketMutation.mutate(issue.id)}
                          disabled={createTicketMutation.isPending}
                        >
                          Create Ticket
                        </Button>
                      )}
                      {issue.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveIssueMutation.mutate({ id: issue.id, resolution: "Resolved" })}
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid="edit-issue"
                        onClick={() => {
                          setIssueForm({
                            title: issue.title,
                            description: issue.description || "",
                            category: issue.category || "technical",
                            severity: issue.severity || "medium",
                            blocksGoLive: issue.blocksGoLive || false,
                          });
                          setCreateIssueOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid="delete-issue"
                        onClick={() => deleteIssueMutation.mutate(issue.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {issues.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No issues reported. Click "Report Issue" to log one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Integration Tests</h2>
            <Button onClick={() => setCreateIntegrationOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Interface
            </Button>
          </div>

          <div className="grid gap-4">
            {integrationTests.map((test) => (
              <Card key={test.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{test.interfaceName}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.sourceSystem} → {test.targetSystem}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{test.interfaceType}</Badge>
                        <Badge variant="secondary">{test.direction}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status || "pending")}
                      {test.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" data-testid="mark-integration-passed" onClick={() => updateIntegrationMutation.mutate({ id: test.id, status: "passed" })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" data-testid="mark-integration-failed" onClick={() => updateIntegrationMutation.mutate({ id: test.id, status: "failed" })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid="delete-integration-test"
                        onClick={() => deleteIntegrationMutation.mutate(test.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {integrationTests.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No integration tests defined. Click "Add Interface" to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Downtime Tab */}
        <TabsContent value="downtime" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Downtime Procedure Tests</h2>
            <Button onClick={() => setCreateDowntimeOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Procedure
            </Button>
          </div>

          <div className="grid gap-4">
            {downtimeTests.map((test) => (
              <Card key={test.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{test.procedureName}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{test.procedureType}</Badge>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {test.expectedDurationMinutes} min expected
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status || "pending")}
                      {test.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" data-testid="mark-downtime-passed" onClick={() => updateDowntimeMutation.mutate({ id: test.id, status: "passed" })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" data-testid="mark-downtime-failed" onClick={() => updateDowntimeMutation.mutate({ id: test.id, status: "failed" })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid="delete-downtime-test"
                        onClick={() => deleteDowntimeMutation.mutate(test.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {downtimeTests.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No downtime procedures defined. Click "Add Procedure" to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Scorecard Tab */}
        <TabsContent value="scorecard" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Go-Live Readiness Scorecard</h2>
            <Button onClick={() => calculateScoreMutation.mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Calculate Score
            </Button>
          </div>

          {readinessScore ? (
            <div className="grid gap-6">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Overall Readiness</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl font-bold mb-4">{readinessScore.overallScore}%</div>
                  {readinessScore.recommendation && getRecommendationBadge(readinessScore.recommendation)}
                  <div className="flex justify-center gap-4 mt-4">
                    <div>
                      <Badge variant="destructive">{readinessScore.criticalIssuesCount} critical</Badge>
                    </div>
                    <div>
                      <Badge variant="outline">{readinessScore.highIssuesCount} high</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { label: "Technical", score: readinessScore.technicalScore, icon: Settings },
                  { label: "Data", score: readinessScore.dataScore, icon: Database },
                  { label: "Staff", score: readinessScore.staffScore, icon: Users },
                  { label: "Support", score: readinessScore.supportScore, icon: Shield },
                  { label: "Process", score: readinessScore.processScore, icon: ClipboardCheck },
                ].map(({ label, score, icon: Icon }) => (
                  <Card key={label}>
                    <CardContent className="pt-6 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <div className="text-2xl font-bold">{score || 0}%</div>
                      <div className="text-sm text-muted-foreground">{label}</div>
                      <Progress value={score || 0} className="mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  <p>Last calculated: {readinessScore.calculatedAt && format(new Date(readinessScore.calculatedAt), "PPpp")}</p>
                  {readinessScore.approvedAt && (
                    <p>Approved: {format(new Date(readinessScore.approvedAt), "PPpp")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No readiness score calculated yet. Click "Calculate Score" to generate one.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule TDR Event</DialogTitle>
            <DialogDescription>Create a new technical dress rehearsal event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Event Name</Label>
              <Input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input type="datetime-local" value={eventForm.scheduledDate} onChange={(e) => setEventForm({ ...eventForm, scheduledDate: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full TDR</SelectItem>
                  <SelectItem value="partial">Partial TDR</SelectItem>
                  <SelectItem value="integration_only">Integration Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEventOpen(false)}>Cancel</Button>
            <Button onClick={() => createEventMutation.mutate()}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Checklist Dialog */}
      <Dialog open={createChecklistOpen} onOpenChange={setCreateChecklistOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Checklist Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={checklistForm.category} onValueChange={(v) => setChecklistForm({ ...checklistForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="integrations">Integrations</SelectItem>
                  <SelectItem value="data_migration">Data Migration</SelectItem>
                  <SelectItem value="workflows">Workflows</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={checklistForm.title} onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={checklistForm.priority} onValueChange={(v) => setChecklistForm({ ...checklistForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateChecklistOpen(false)}>Cancel</Button>
            <Button onClick={() => createChecklistMutation.mutate()}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Test Dialog */}
      <Dialog open={createTestOpen} onOpenChange={setCreateTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Scenario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select value={testForm.category} onValueChange={(v) => setTestForm({ ...testForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="downtime">Downtime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={testForm.title} onChange={(e) => setTestForm({ ...testForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={testForm.description} onChange={(e) => setTestForm({ ...testForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Expected Result</Label>
              <Textarea value={testForm.expectedResult} onChange={(e) => setTestForm({ ...testForm, expectedResult: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTestOpen(false)}>Cancel</Button>
            <Button onClick={() => createTestMutation.mutate()}>Add Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Issue Dialog */}
      <Dialog open={createIssueOpen} onOpenChange={setCreateIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={issueForm.category} onValueChange={(v) => setIssueForm({ ...issueForm, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={issueForm.severity} onValueChange={(v) => setIssueForm({ ...issueForm, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={issueForm.blocksGoLive}
                onCheckedChange={(c) => setIssueForm({ ...issueForm, blocksGoLive: c === true })}
              />
              <Label>Blocks Go-Live</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateIssueOpen(false)}>Cancel</Button>
            <Button onClick={() => createIssueMutation.mutate()}>Report Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Integration Dialog */}
      <Dialog open={createIntegrationOpen} onOpenChange={setCreateIntegrationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Integration Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Interface Name</Label>
              <Input value={integrationForm.interfaceName} onChange={(e) => setIntegrationForm({ ...integrationForm, interfaceName: e.target.value })} placeholder="e.g., ADT, Lab, Pharmacy" />
            </div>
            <div>
              <Label>Interface Type</Label>
              <Select value={integrationForm.interfaceType} onValueChange={(v) => setIntegrationForm({ ...integrationForm, interfaceType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HL7">HL7</SelectItem>
                  <SelectItem value="FHIR">FHIR</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="File">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Source System</Label>
              <Input value={integrationForm.sourceSystem} onChange={(e) => setIntegrationForm({ ...integrationForm, sourceSystem: e.target.value })} />
            </div>
            <div>
              <Label>Target System</Label>
              <Input value={integrationForm.targetSystem} onChange={(e) => setIntegrationForm({ ...integrationForm, targetSystem: e.target.value })} />
            </div>
            <div>
              <Label>Direction</Label>
              <Select value={integrationForm.direction} onValueChange={(v) => setIntegrationForm({ ...integrationForm, direction: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="bidirectional">Bidirectional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateIntegrationOpen(false)}>Cancel</Button>
            <Button onClick={() => createIntegrationMutation.mutate()}>Add Interface</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Downtime Dialog */}
      <Dialog open={createDowntimeOpen} onOpenChange={setCreateDowntimeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Downtime Procedure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Procedure Name</Label>
              <Input value={downtimeForm.procedureName} onChange={(e) => setDowntimeForm({ ...downtimeForm, procedureName: e.target.value })} />
            </div>
            <div>
              <Label>Procedure Type</Label>
              <Select value={downtimeForm.procedureType} onValueChange={(v) => setDowntimeForm({ ...downtimeForm, procedureType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned_downtime">Planned Downtime</SelectItem>
                  <SelectItem value="unplanned_downtime">Unplanned Downtime</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                  <SelectItem value="restore">Restore</SelectItem>
                  <SelectItem value="failover">Failover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={downtimeForm.description} onChange={(e) => setDowntimeForm({ ...downtimeForm, description: e.target.value })} />
            </div>
            <div>
              <Label>Expected Duration (minutes)</Label>
              <Input type="number" value={downtimeForm.expectedDurationMinutes} onChange={(e) => setDowntimeForm({ ...downtimeForm, expectedDurationMinutes: parseInt(e.target.value) || 30 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDowntimeOpen(false)}>Cancel</Button>
            <Button onClick={() => createDowntimeMutation.mutate()}>Add Procedure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
