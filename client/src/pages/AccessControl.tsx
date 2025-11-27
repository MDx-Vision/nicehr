import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Shield, Eye, Clock, FileText, Layers, Activity } from "lucide-react";
import { format } from "date-fns";

interface AccessRule {
  id: string;
  name: string;
  resourceType: "page" | "api" | "feature";
  resourceKey: string;
  allowedRoles: string[];
  deniedRoles: string[];
  restrictionMessage: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  userId: string | null;
  ruleId: string | null;
  resourceType: string;
  resourceKey: string;
  action: string;
  allowed: boolean;
  userRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const AVAILABLE_ROLES = ["admin", "hospital_staff", "consultant"];

const RESOURCE_TYPES = [
  { value: "page", label: "Page", icon: FileText },
  { value: "api", label: "API Endpoint", icon: Layers },
  { value: "feature", label: "Feature", icon: Activity },
];

function RuleForm({
  rule,
  onSubmit,
  onCancel,
  isLoading,
}: {
  rule?: AccessRule;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(rule?.name || "");
  const [resourceType, setResourceType] = useState<"page" | "api" | "feature">(
    rule?.resourceType || "page"
  );
  const [resourceKey, setResourceKey] = useState(rule?.resourceKey || "");
  const [allowedRoles, setAllowedRoles] = useState<string[]>(
    (rule?.allowedRoles as string[]) || []
  );
  const [deniedRoles, setDeniedRoles] = useState<string[]>(
    (rule?.deniedRoles as string[]) || []
  );
  const [restrictionMessage, setRestrictionMessage] = useState(
    rule?.restrictionMessage || ""
  );
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      resourceType,
      resourceKey,
      allowedRoles,
      deniedRoles,
      restrictionMessage: restrictionMessage || null,
      isActive,
    });
  };

  const toggleRole = (role: string, type: "allowed" | "denied") => {
    if (type === "allowed") {
      if (allowedRoles.includes(role)) {
        setAllowedRoles(allowedRoles.filter((r) => r !== role));
      } else {
        setAllowedRoles([...allowedRoles, role]);
        setDeniedRoles(deniedRoles.filter((r) => r !== role));
      }
    } else {
      if (deniedRoles.includes(role)) {
        setDeniedRoles(deniedRoles.filter((r) => r !== role));
      } else {
        setDeniedRoles([...deniedRoles, role]);
        setAllowedRoles(allowedRoles.filter((r) => r !== role));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Admin Dashboard Access"
          required
          data-testid="input-rule-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="resourceType">Resource Type</Label>
          <Select
            value={resourceType}
            onValueChange={(v: "page" | "api" | "feature") => setResourceType(v)}
          >
            <SelectTrigger data-testid="select-resource-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resourceKey">Resource Key</Label>
          <Input
            id="resourceKey"
            value={resourceKey}
            onChange={(e) => setResourceKey(e.target.value)}
            placeholder={
              resourceType === "page"
                ? "/dashboard"
                : resourceType === "api"
                  ? "/api/users"
                  : "feature_name"
            }
            required
            data-testid="input-resource-key"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Allowed Roles (only these roles can access)</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ROLES.map((role) => (
            <Badge
              key={role}
              variant={allowedRoles.includes(role) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleRole(role, "allowed")}
              data-testid={`badge-allowed-${role}`}
            >
              {role.replace("_", " ")}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Leave empty to allow all roles (unless denied)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Denied Roles (these roles cannot access)</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ROLES.map((role) => (
            <Badge
              key={role}
              variant={deniedRoles.includes(role) ? "destructive" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleRole(role, "denied")}
              data-testid={`badge-denied-${role}`}
            >
              {role.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="restrictionMessage">Restriction Message (optional)</Label>
        <Textarea
          id="restrictionMessage"
          value={restrictionMessage}
          onChange={(e) => setRestrictionMessage(e.target.value)}
          placeholder="Custom message shown when access is denied..."
          data-testid="input-restriction-message"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            data-testid="switch-is-active"
          />
          <Label htmlFor="isActive">Rule is Active</Label>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid="button-save">
          {isLoading ? "Saving..." : "Save Rule"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AccessControl() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);

  const { data: rules, isLoading: rulesLoading } = useQuery<AccessRule[]>({
    queryKey: ["/api/admin/access-rules"],
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/access-audit"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/access-rules", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      setIsDialogOpen(false);
      toast({ title: "Rule created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create rule", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/admin/access-rules/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      setIsDialogOpen(false);
      setEditingRule(null);
      toast({ title: "Rule updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update rule", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/access-rules/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({ title: "Rule deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete rule", variant: "destructive" });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (rule: AccessRule) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRule(null);
    setIsDialogOpen(true);
  };

  const getResourceTypeIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find((t) => t.value === type);
    if (resourceType) {
      const Icon = resourceType.icon;
      return <Icon className="h-4 w-4" />;
    }
    return null;
  };

  if (rulesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Access Control
          </h1>
          <p className="text-muted-foreground">
            Manage content restrictions and role-based access rules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} data-testid="button-create-rule">
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Edit Access Rule" : "Create Access Rule"}
              </DialogTitle>
              <DialogDescription>
                Define who can access specific resources in the application.
              </DialogDescription>
            </DialogHeader>
            <RuleForm
              rule={editingRule || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingRule(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules" data-testid="tab-rules">
            <Shield className="h-4 w-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Eye className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Rules</CardTitle>
              <CardDescription>
                Configure which roles can access specific pages, APIs, or features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rules && rules.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Allowed</TableHead>
                      <TableHead>Denied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id} data-testid={`row-rule-${rule.id}`}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getResourceTypeIcon(rule.resourceType)}
                            <span className="text-sm">{rule.resourceKey}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(rule.allowedRoles as string[]).length > 0 ? (
                              (rule.allowedRoles as string[]).map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {role.replace("_", " ")}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">All</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(rule.deniedRoles as string[]).length > 0 ? (
                              (rule.deniedRoles as string[]).map((role) => (
                                <Badge
                                  key={role}
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {role.replace("_", " ")}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.isActive ? "default" : "secondary"}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(rule)}
                              data-testid={`button-edit-${rule.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-testid={`button-delete-${rule.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Access Rule</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{rule.name}"? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(rule.id)}
                                    className="bg-destructive text-destructive-foreground hover-elevate"
                                    data-testid="button-confirm-delete"
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No access rules configured</p>
                  <p className="text-sm">
                    Create your first rule to start restricting content
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Audit Log</CardTitle>
              <CardDescription>
                View history of access attempts and denials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(log.createdAt), "MMM d, h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getResourceTypeIcon(log.resourceType)}
                            <span className="text-sm">{log.resourceKey}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.userRole ? (
                            <Badge variant="secondary" className="text-xs">
                              {log.userRole.replace("_", " ")}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Guest</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.allowed ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {log.allowed ? "Allowed" : "Denied"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs yet</p>
                  <p className="text-sm">
                    Access attempts will be logged here
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
