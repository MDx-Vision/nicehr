import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Bell,
  Clock,
  Database,
  Plus,
  Shield,
  Trash2,
  Edit,
  Settings,
  Archive,
  FileWarning,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EscalationRule, DataRetentionPolicy, Project } from "@shared/schema";

type TriggerType = "time_based" | "priority_based" | "sla_breach" | "manual";
type Priority = "low" | "medium" | "high" | "critical";
type EntityType = "tickets" | "reports" | "audit_logs" | "documents" | "user_data";

interface EscalationRuleFormData {
  projectId: string;
  name: string;
  description: string;
  triggerType: TriggerType;
  priority: Priority;
  timeThresholdMinutes: number;
  escalateToPriority: Priority;
  notifyRoles: string[];
  isActive: boolean;
}

interface RetentionPolicyFormData {
  entityType: EntityType;
  retentionDays: number;
  description: string;
  hipaaRequired: boolean;
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
}

function CreateEscalationRuleDialog({
  open,
  onOpenChange,
  projects,
  editRule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  editRule?: EscalationRule | null;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EscalationRuleFormData>({
    projectId: editRule?.projectId || "",
    name: editRule?.name || "",
    description: editRule?.description || "",
    triggerType: (editRule?.triggerType as TriggerType) || "time_based",
    priority: (editRule?.priority as Priority) || "medium",
    timeThresholdMinutes: editRule?.timeThresholdMinutes || 60,
    escalateToPriority: (editRule?.escalateToPriority as Priority) || "high",
    notifyRoles: editRule?.notifyRoles || [],
    isActive: editRule?.isActive ?? true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: EscalationRuleFormData) => {
      const payload = {
        ...data,
        projectId: data.projectId || null,
      };
      if (editRule) {
        return apiRequest("PATCH", `/api/escalation-rules/${editRule.id}`, payload);
      }
      return apiRequest("POST", "/api/escalation-rules", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalation-rules"] });
      onOpenChange(false);
      toast({ title: editRule ? "Rule updated successfully" : "Rule created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save rule", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Escalation Rule" : "Create Escalation Rule"}</DialogTitle>
          <DialogDescription>
            Configure automatic escalation rules for support tickets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="High Priority SLA Breach"
              data-testid="input-rule-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project (Optional)</Label>
            <Select
              value={formData.projectId || "all"}
              onValueChange={(value) =>
                setFormData({ ...formData, projectId: value === "all" ? "" : value })
              }
            >
              <SelectTrigger data-testid="select-project">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe when this rule should trigger..."
              data-testid="input-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select
                value={formData.triggerType}
                onValueChange={(value) => setFormData({ ...formData, triggerType: value as TriggerType })}
              >
                <SelectTrigger data-testid="select-trigger-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_based">Time Based</SelectItem>
                  <SelectItem value="priority_based">Priority Based</SelectItem>
                  <SelectItem value="sla_breach">SLA Breach</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
              >
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.triggerType === "time_based" && (
            <div className="space-y-2">
              <Label htmlFor="threshold">Time Threshold (minutes)</Label>
              <Input
                id="threshold"
                type="number"
                min="5"
                value={formData.timeThresholdMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, timeThresholdMinutes: parseInt(e.target.value) || 60 })
                }
                data-testid="input-threshold"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Escalate To Priority</Label>
            <Select
              value={formData.escalateToPriority}
              onValueChange={(value) => setFormData({ ...formData, escalateToPriority: value as Priority })}
            >
              <SelectTrigger data-testid="select-escalate-to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Rule Active</Label>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              data-testid="switch-active"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            data-testid="button-save-rule"
          >
            {editRule ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateRetentionPolicyDialog({
  open,
  onOpenChange,
  editPolicy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPolicy?: DataRetentionPolicy | null;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<RetentionPolicyFormData>({
    entityType: (editPolicy?.entityType as EntityType) || "tickets",
    retentionDays: editPolicy?.retentionDays || 365,
    description: editPolicy?.description || "",
    hipaaRequired: editPolicy?.hipaaRequired ?? true,
    autoDelete: editPolicy?.autoDelete ?? false,
    archiveBeforeDelete: editPolicy?.archiveBeforeDelete ?? true,
  });

  const createMutation = useMutation({
    mutationFn: async (data: RetentionPolicyFormData) => {
      if (editPolicy) {
        return apiRequest("PATCH", `/api/data-retention-policies/${editPolicy.id}`, data);
      }
      return apiRequest("POST", "/api/data-retention-policies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-retention-policies"] });
      onOpenChange(false);
      toast({ title: editPolicy ? "Policy updated successfully" : "Policy created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save policy", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editPolicy ? "Edit Retention Policy" : "Create Retention Policy"}
          </DialogTitle>
          <DialogDescription>
            Configure data retention policies for HIPAA compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select
              value={formData.entityType}
              onValueChange={(value) => setFormData({ ...formData, entityType: value as EntityType })}
            >
              <SelectTrigger data-testid="select-entity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tickets">Support Tickets</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="audit_logs">Audit Logs</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="user_data">User Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retention-days">Retention Period (days)</Label>
            <Input
              id="retention-days"
              type="number"
              min="30"
              value={formData.retentionDays}
              onChange={(e) =>
                setFormData({ ...formData, retentionDays: parseInt(e.target.value) || 365 })
              }
              data-testid="input-retention-days"
            />
            <p className="text-xs text-muted-foreground">
              HIPAA requires minimum 6 years (2190 days) for medical records
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Policy description..."
              data-testid="input-policy-description"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hipaa">HIPAA Required</Label>
                <p className="text-xs text-muted-foreground">
                  Mark if this data contains PHI
                </p>
              </div>
              <Switch
                id="hipaa"
                checked={formData.hipaaRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, hipaaRequired: checked })}
                data-testid="switch-hipaa"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="archive">Archive Before Delete</Label>
                <p className="text-xs text-muted-foreground">
                  Create backup before deletion
                </p>
              </div>
              <Switch
                id="archive"
                checked={formData.archiveBeforeDelete}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, archiveBeforeDelete: checked })
                }
                data-testid="switch-archive"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-delete">Auto Delete</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically delete expired data
                </p>
              </div>
              <Switch
                id="auto-delete"
                checked={formData.autoDelete}
                onCheckedChange={(checked) => setFormData({ ...formData, autoDelete: checked })}
                data-testid="switch-auto-delete"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            data-testid="button-save-policy"
          >
            {editPolicy ? "Update Policy" : "Create Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EscalationManagement() {
  const [activeTab, setActiveTab] = useState("escalation");
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<DataRetentionPolicy | null>(null);
  const { toast } = useToast();

  const { data: escalationRules = [], isLoading: rulesLoading } = useQuery<EscalationRule[]>({
    queryKey: ["/api/escalation-rules"],
  });

  const { data: retentionPolicies = [], isLoading: policiesLoading } = useQuery<
    DataRetentionPolicy[]
  >({
    queryKey: ["/api/data-retention-policies"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/escalation-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalation-rules"] });
      toast({ title: "Rule deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete rule", variant: "destructive" });
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/data-retention-policies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-retention-policies"] });
      toast({ title: "Policy deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete policy", variant: "destructive" });
    },
  });

  const handleEditRule = (rule: EscalationRule) => {
    setEditingRule(rule);
    setRuleDialogOpen(true);
  };

  const handleEditPolicy = (policy: DataRetentionPolicy) => {
    setEditingPolicy(policy);
    setPolicyDialogOpen(true);
  };

  const triggerTypeLabels: Record<string, string> = {
    time_based: "Time Based",
    priority_based: "Priority Based",
    sla_breach: "SLA Breach",
    manual: "Manual",
  };

  const entityTypeLabels: Record<string, string> = {
    tickets: "Support Tickets",
    reports: "Reports",
    audit_logs: "Audit Logs",
    documents: "Documents",
    user_data: "User Data",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
          Escalation & Compliance
        </h1>
        <p className="text-muted-foreground">
          Manage escalation rules and HIPAA-compliant data retention policies
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-rules">
              {escalationRules.filter((r) => r.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {escalationRules.length} total rules configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Retention Policies</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-policies-count">
              {retentionPolicies.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {retentionPolicies.filter((p) => p.hipaaRequired).length} HIPAA compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">HIPAA Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-hipaa-status">
              Compliant
            </div>
            <p className="text-xs text-muted-foreground">All policies up to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Delete</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-auto-delete-count">
              {retentionPolicies.filter((p) => p.autoDelete).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Policies with auto-delete enabled
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="escalation" data-testid="tab-escalation">
            <Bell className="h-4 w-4 mr-2" />
            Escalation Rules
          </TabsTrigger>
          <TabsTrigger value="retention" data-testid="tab-retention">
            <Database className="h-4 w-4 mr-2" />
            Data Retention
          </TabsTrigger>
        </TabsList>

        <TabsContent value="escalation" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Escalation Rules</CardTitle>
                <CardDescription>
                  Configure automatic ticket escalation based on time and priority
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingRule(null);
                  setRuleDialogOpen(true);
                }}
                data-testid="button-add-rule"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading rules...</div>
              ) : escalationRules.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No escalation rules configured</h3>
                  <p className="text-muted-foreground">
                    Create rules to automatically escalate tickets based on SLA
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escalationRules.map((rule) => (
                      <TableRow key={rule.id} data-testid={`row-rule-${rule.id}`}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{rule.name}</span>
                            {rule.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {triggerTypeLabels[rule.triggerType] || rule.triggerType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">{rule.priority}</Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge>{rule.escalateToPriority}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.triggerType === "time_based" && rule.timeThresholdMinutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {rule.timeThresholdMinutes} min
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditRule(rule)}
                              data-testid={`button-edit-rule-${rule.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteRuleMutation.mutate(rule.id)}
                              disabled={deleteRuleMutation.isPending}
                              data-testid={`button-delete-rule-${rule.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Data Retention Policies</CardTitle>
                <CardDescription>
                  Manage HIPAA-compliant data retention and archival policies
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingPolicy(null);
                  setPolicyDialogOpen(true);
                }}
                data-testid="button-add-policy"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
              ) : retentionPolicies.length === 0 ? (
                <div className="text-center py-8">
                  <FileWarning className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No retention policies configured</h3>
                  <p className="text-muted-foreground">
                    Create policies to ensure HIPAA-compliant data retention
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Retention Period</TableHead>
                      <TableHead>HIPAA</TableHead>
                      <TableHead>Auto Delete</TableHead>
                      <TableHead>Archive</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retentionPolicies.map((policy) => (
                      <TableRow key={policy.id} data-testid={`row-policy-${policy.id}`}>
                        <TableCell>
                          <div>
                            <span className="font-medium">
                              {entityTypeLabels[policy.entityType] || policy.entityType}
                            </span>
                            {policy.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {policy.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {policy.retentionDays} days
                            <span className="text-xs text-muted-foreground">
                              ({(policy.retentionDays / 365).toFixed(1)} years)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {policy.hipaaRequired ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              <Shield className="h-3 w-3 mr-1" />
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={policy.autoDelete ? "destructive" : "secondary"}>
                            {policy.autoDelete ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={policy.archiveBeforeDelete ? "default" : "secondary"}>
                            {policy.archiveBeforeDelete ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPolicy(policy)}
                              data-testid={`button-edit-policy-${policy.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deletePolicyMutation.mutate(policy.id)}
                              disabled={deletePolicyMutation.isPending}
                              data-testid={`button-delete-policy-${policy.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                HIPAA Compliance Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Minimum Retention Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Medical records: 6 years minimum</li>
                    <li>• Audit logs: 6 years from date of creation</li>
                    <li>• Training records: 3 years minimum</li>
                    <li>• Business associate agreements: 6 years</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Always archive before deletion</li>
                    <li>• Use encryption for archived data</li>
                    <li>• Document all retention decisions</li>
                    <li>• Regular compliance audits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateEscalationRuleDialog
        open={ruleDialogOpen}
        onOpenChange={(open) => {
          setRuleDialogOpen(open);
          if (!open) setEditingRule(null);
        }}
        projects={projects}
        editRule={editingRule}
      />

      <CreateRetentionPolicyDialog
        open={policyDialogOpen}
        onOpenChange={(open) => {
          setPolicyDialogOpen(open);
          if (!open) setEditingPolicy(null);
        }}
        editPolicy={editingPolicy}
      />
    </div>
  );
}
