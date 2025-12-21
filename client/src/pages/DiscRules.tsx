import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Filter,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

interface DiscCompatibilityRule {
  id: string;
  name: string;
  description: string;
  ruleType: "composition" | "pairing" | "skill_gap";
  severity: "info" | "warning" | "critical" | "success";
  conditions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

const RULE_TYPES = [
  { value: "composition", label: "Team Composition", description: "Rules about overall team makeup" },
  { value: "pairing", label: "Style Pairing", description: "Rules about specific DiSC style combinations" },
  { value: "skill_gap", label: "Skill Gap", description: "Rules about missing skills or competencies" },
];

const SEVERITIES = [
  { value: "info", label: "Info", icon: Info, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  { value: "success", label: "Success", icon: CheckCircle2, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
  { value: "critical", label: "Critical", icon: AlertCircle, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
];

const DISC_STYLES = ["D", "i", "S", "C"];

function RuleFormDialog({
  rule,
  open,
  onOpenChange,
  onSuccess,
}: {
  rule?: DiscCompatibilityRule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!rule;

  const [formData, setFormData] = useState({
    name: rule?.name || "",
    description: rule?.description || "",
    ruleType: rule?.ruleType || "composition",
    severity: rule?.severity || "warning",
    isActive: rule?.isActive ?? true,
    // Condition fields based on rule type
    minStyles: rule?.conditions?.minStyles || 2,
    maxSameStyle: rule?.conditions?.maxSameStyle || 3,
    requiredStyle: rule?.conditions?.requiredStyle || "",
    style1: rule?.conditions?.style1 || "",
    style2: rule?.conditions?.style2 || "",
    minTeamSize: rule?.conditions?.minTeamSize || 3,
  });

  const buildConditions = () => {
    const conditions: Record<string, any> = {};

    switch (formData.ruleType) {
      case "composition":
        conditions.minStyles = formData.minStyles;
        conditions.maxSameStyle = formData.maxSameStyle;
        if (formData.requiredStyle) {
          conditions.requiredStyle = formData.requiredStyle;
        }
        conditions.minTeamSize = formData.minTeamSize;
        break;
      case "pairing":
        conditions.style1 = formData.style1;
        conditions.style2 = formData.style2;
        break;
      case "skill_gap":
        conditions.minTeamSize = formData.minTeamSize;
        break;
    }

    return conditions;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name: formData.name,
        description: formData.description,
        ruleType: formData.ruleType,
        severity: formData.severity,
        conditions: buildConditions(),
        isActive: formData.isActive,
      };
      const response = await apiRequest("POST", "/api/disc/rules", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disc/rules"] });
      toast({ title: "Rule Created", description: "The rule has been added successfully." });
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create rule.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name: formData.name,
        description: formData.description,
        ruleType: formData.ruleType,
        severity: formData.severity,
        conditions: buildConditions(),
        isActive: formData.isActive,
      };
      const response = await apiRequest("PUT", `/api/disc/rules/${rule?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disc/rules"] });
      toast({ title: "Rule Updated", description: "The rule has been updated successfully." });
      onSuccess();
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update rule.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Rule" : "Add New Rule"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the compatibility rule settings."
              : "Create a new team compatibility rule."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Balanced Team Composition"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this rule checks for..."
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rule Type *</Label>
                <Select
                  value={formData.ruleType}
                  onValueChange={(value) => setFormData({ ...formData, ruleType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div>{type.label}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((sev) => (
                      <SelectItem key={sev.value} value={sev.value}>
                        <div className="flex items-center gap-2">
                          <sev.icon className="h-4 w-4" />
                          {sev.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Condition Fields based on Rule Type */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-medium">Rule Conditions</h4>

              {formData.ruleType === "composition" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum DiSC Styles</Label>
                      <Select
                        value={formData.minStyles.toString()}
                        onValueChange={(value) => setFormData({ ...formData, minStyles: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n} style{n > 1 ? "s" : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Same Style</Label>
                      <Select
                        value={formData.maxSameStyle.toString()}
                        onValueChange={(value) => setFormData({ ...formData, maxSameStyle: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n} member{n > 1 ? "s" : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Required Style (optional)</Label>
                      <Select
                        value={formData.requiredStyle}
                        onValueChange={(value) => setFormData({ ...formData, requiredStyle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {DISC_STYLES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Team Size</Label>
                      <Select
                        value={formData.minTeamSize.toString()}
                        onValueChange={(value) => setFormData({ ...formData, minTeamSize: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n} members</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {formData.ruleType === "pairing" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Style *</Label>
                    <Select
                      value={formData.style1}
                      onValueChange={(value) => setFormData({ ...formData, style1: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISC_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Second Style *</Label>
                    <Select
                      value={formData.style2}
                      onValueChange={(value) => setFormData({ ...formData, style2: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISC_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.ruleType === "skill_gap" && (
                <div className="space-y-2">
                  <Label>Minimum Team Size for Check</Label>
                  <Select
                    value={formData.minTeamSize.toString()}
                    onValueChange={(value) => setFormData({ ...formData, minTeamSize: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n} members</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Rule will only trigger when team has at least this many members
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Rule Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.name || !formData.description}>
              {isPending ? "Saving..." : isEdit ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DiscRules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscCompatibilityRule | undefined>();

  const { data: rules, isLoading } = useQuery<DiscCompatibilityRule[]>({
    queryKey: ["/api/disc/rules"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/disc/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disc/rules"] });
      toast({ title: "Rule Deleted", description: "The rule has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete rule.", variant: "destructive" });
    },
  });

  const filteredRules = rules?.filter((r) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!r.name.toLowerCase().includes(query) && !r.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (typeFilter !== "all" && r.ruleType !== typeFilter) return false;
    if (severityFilter !== "all" && r.severity !== severityFilter) return false;
    return true;
  }) || [];

  const handleEdit = (rule: DiscCompatibilityRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRule(undefined);
    setDialogOpen(true);
  };

  const getSeverityBadge = (severity: string) => {
    const sev = SEVERITIES.find((s) => s.value === severity);
    if (!sev) return null;
    const Icon = sev.icon;
    return (
      <Badge className={sev.color}>
        <Icon className="h-3 w-3 mr-1" />
        {sev.label}
      </Badge>
    );
  };

  const getRuleTypeBadge = (type: string) => {
    const ruleType = RULE_TYPES.find((t) => t.value === type);
    return <Badge variant="outline">{ruleType?.label || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/disc">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Compatibility Rules</h1>
            <p className="text-muted-foreground">
              Configure team composition and compatibility rules
            </p>
          </div>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rules</p>
                <p className="text-2xl font-bold">{rules?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {rules?.filter((r) => r.isActive).length || 0}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">
                  {rules?.filter((r) => r.severity === "critical").length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold">
                  {rules?.filter((r) => r.severity === "warning").length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RULE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {SEVERITIES.map((sev) => (
                  <SelectItem key={sev.value} value={sev.value}>
                    {sev.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
          <CardDescription>
            {filteredRules.length} rule{filteredRules.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No rules found</p>
              <p className="text-sm">
                {rules?.length === 0
                  ? "Add your first compatibility rule"
                  : "Try adjusting your filters"}
              </p>
              {rules?.length === 0 && (
                <Button className="mt-4" onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Rule
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[400px]">
                          {rule.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRuleTypeBadge(rule.ruleType)}</TableCell>
                    <TableCell>{getSeverityBadge(rule.severity)}</TableCell>
                    <TableCell>
                      {rule.isActive ? (
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{rule.name}"? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(rule.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <RuleFormDialog
        rule={editingRule}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setEditingRule(undefined)}
      />
    </div>
  );
}
