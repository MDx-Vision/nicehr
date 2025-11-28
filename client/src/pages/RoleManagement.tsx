import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  KeyRound, 
  Plus, 
  Pencil, 
  Trash2, 
  Shield, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Search,
  X,
  Check,
  Lock,
} from "lucide-react";
import type { 
  Role, 
  Permission, 
  RoleWithPermissions, 
  UserRoleAssignment,
  User,
  Hospital,
  Project
} from "@shared/schema";

interface CreateRoleFormData {
  name: string;
  displayName: string;
  description: string;
  baseRoleId: string | null;
  hospitalId: string | null;
}

interface PermissionsByDomain {
  [domain: string]: Permission[];
}

interface UserWithAssignments extends User {
  assignments?: (UserRoleAssignment & { 
    role?: Role;
    project?: Project;
    hospital?: Hospital;
  })[];
}

const DOMAIN_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  consultants: "Consultants",
  hospitals: "Hospitals",
  timesheets: "Timesheets",
  support_tickets: "Support Tickets",
  eod_reports: "EOD Reports",
  training: "Training",
  travel: "Travel",
  financials: "Financials",
  quality: "Quality",
  compliance: "Compliance",
  reports: "Reports",
  admin: "Administration",
  rbac: "Role Management",
};

export default function RoleManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("roles");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [removeAssignmentDialogOpen, setRemoveAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<UserRoleAssignment | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<CreateRoleFormData>({
    name: "",
    displayName: "",
    description: "",
    baseRoleId: null,
    hospitalId: null,
  });

  const [assignmentFormData, setAssignmentFormData] = useState({
    roleId: "",
    projectId: "",
    hospitalId: "",
  });

  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/admin/rbac/roles"],
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["/api/admin/rbac/permissions"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: selectedRoleDetails } = useQuery<RoleWithPermissions>({
    queryKey: ["/api/admin/rbac/roles", selectedRole?.id],
    enabled: !!selectedRole?.id && permissionDialogOpen,
  });

  const { data: userAssignments, isLoading: assignmentsLoading } = useQuery<UserRoleAssignment[]>({
    queryKey: ["/api/admin/rbac/assignments", { userId: selectedUserId }],
    enabled: !!selectedUserId,
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      const res = await apiRequest("POST", "/api/admin/rbac/roles", {
        name: data.name,
        displayName: data.displayName || data.name,
        description: data.description,
        baseRoleId: data.baseRoleId || undefined,
        hospitalId: data.hospitalId || undefined,
        roleType: "custom",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rbac/roles"] });
      setCreateDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Role created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { id: string } & Partial<CreateRoleFormData>) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/admin/rbac/roles/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rbac/roles"] });
      setEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      toast({ title: "Success", description: "Role updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/rbac/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rbac/roles"] });
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      toast({ title: "Success", description: "Role deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      const res = await apiRequest("PUT", `/api/admin/rbac/roles/${roleId}/permissions`, {
        permissionIds,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rbac/roles"] });
      setPermissionDialogOpen(false);
      setSelectedRole(null);
      setSelectedPermissions(new Set());
      toast({ title: "Success", description: "Permissions updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; roleId: string; projectId?: string; hospitalId?: string }) => {
      const res = await apiRequest("POST", "/api/admin/rbac/assignments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rbac/assignments"] });
      setAssignRoleDialogOpen(false);
      setAssignmentFormData({ roleId: "", projectId: "", hospitalId: "" });
      toast({ title: "Success", description: "Role assigned successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (data: { userId: string; roleId: string; projectId?: string; hospitalId?: string }) => {
      await apiRequest("DELETE", "/api/admin/rbac/assignments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rbac/assignments"] });
      setRemoveAssignmentDialogOpen(false);
      setSelectedAssignment(null);
      toast({ title: "Success", description: "Assignment removed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      baseRoleId: null,
      hospitalId: null,
    });
  };

  const handleCreateRole = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    createRoleMutation.mutate(formData);
  };

  const handleUpdateRole = () => {
    if (!selectedRole || !formData.name.trim()) return;
    updateRoleMutation.mutate({
      id: selectedRole.id,
      ...formData,
    });
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      baseRoleId: role.baseRoleId,
      hospitalId: role.hospitalId,
    });
    setEditDialogOpen(true);
  };

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const toggleDomain = (domain: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const toggleDomainPermissions = (domainPermissions: Permission[]) => {
    const newSelected = new Set(selectedPermissions);
    const allSelected = domainPermissions.every(p => newSelected.has(p.id));
    
    if (allSelected) {
      domainPermissions.forEach(p => newSelected.delete(p.id));
    } else {
      domainPermissions.forEach(p => newSelected.add(p.id));
    }
    setSelectedPermissions(newSelected);
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    updatePermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissionIds: Array.from(selectedPermissions),
    });
  };

  const groupPermissionsByDomain = (perms: Permission[]): PermissionsByDomain => {
    return perms.reduce((acc, perm) => {
      const domain = perm.domain;
      if (!acc[domain]) {
        acc[domain] = [];
      }
      acc[domain].push(perm);
      return acc;
    }, {} as PermissionsByDomain);
  };

  const filteredUsers = users?.filter(user => {
    if (!userSearchQuery) return true;
    const query = userSearchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    );
  });

  const baseRoles = roles?.filter(r => r.roleType === "base") || [];
  const permissionsByDomain = permissions ? groupPermissionsByDomain(permissions) : {};

  if (selectedRoleDetails && permissionDialogOpen && selectedPermissions.size === 0) {
    const existingPermIds = new Set(
      selectedRoleDetails.permissions?.map(rp => rp.permissionId) || []
    );
    if (existingPermIds.size > 0 && selectedPermissions.size === 0) {
      setSelectedPermissions(existingPermIds);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <KeyRound className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Role & Permission Management
          </h1>
          <p className="text-muted-foreground">
            Manage roles, permissions, and user assignments
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="roles" data-testid="tab-roles">
            <Shield className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">
            <Lock className="w-4 h-4 mr-2" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">
            <Users className="w-4 h-4 mr-2" />
            User Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Roles</CardTitle>
                <CardDescription>
                  Manage base and custom roles for your organization
                </CardDescription>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                data-testid="button-create-role"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Role
              </Button>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles?.map((role) => (
                      <TableRow
                        key={role.id}
                        className="cursor-pointer hover-elevate"
                        onClick={() => handleOpenPermissions(role)}
                        data-testid={`row-role-${role.id}`}
                      >
                        <TableCell className="font-medium">
                          {role.displayName}
                        </TableCell>
                        <TableCell>
                          {role.roleType === "base" ? (
                            <Badge variant="secondary" data-testid={`badge-base-role-${role.id}`}>
                              Base Role
                            </Badge>
                          ) : (
                            <Badge variant="outline" data-testid={`badge-custom-role-${role.id}`}>
                              Custom
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {role.description || "—"}
                        </TableCell>
                        <TableCell>
                          {role.hospitalId ? (
                            <Badge variant="outline" className="text-xs">
                              Hospital Scoped
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Global</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPermissions(role);
                              }}
                              data-testid={`button-permissions-${role.id}`}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            {role.roleType === "custom" && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(role);
                                  }}
                                  data-testid={`button-edit-role-${role.id}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRole(role);
                                  }}
                                  data-testid={`button-delete-role-${role.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!roles || roles.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No roles found. Create your first custom role to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                View all available permissions grouped by domain (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(permissionsByDomain).map(([domain, domainPerms]) => (
                    <Collapsible
                      key={domain}
                      open={expandedDomains.has(domain)}
                      onOpenChange={() => toggleDomain(domain)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-4 h-auto"
                          data-testid={`collapsible-domain-${domain}`}
                        >
                          <div className="flex items-center gap-2">
                            {expandedDomains.has(domain) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="font-medium">
                              {DOMAIN_LABELS[domain] || domain}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {domainPerms.length}
                            </Badge>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-6 border-l pl-4 py-2 space-y-2">
                          {domainPerms.map((perm) => (
                            <div
                              key={perm.id}
                              className="p-3 rounded-md bg-muted/50"
                              data-testid={`permission-item-${perm.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {perm.name}
                                </code>
                                <span className="font-medium text-sm">
                                  {perm.displayName}
                                </span>
                              </div>
                              {perm.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  {Object.keys(permissionsByDomain).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No permissions found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <div className="grid gap-6 md:grid-cols-[350px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Search and select a user to manage their role assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-user-search"
                  />
                  {userSearchQuery && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setUserSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {usersLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    filteredUsers?.map((user) => (
                      <Button
                        key={user.id}
                        variant={selectedUserId === user.id ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto py-2"
                        onClick={() => setSelectedUserId(user.id)}
                        data-testid={`button-select-user-${user.id}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </Button>
                    ))
                  )}
                  {filteredUsers?.length === 0 && (
                    <div className="text-center text-muted-foreground py-4 text-sm">
                      No users found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>Role Assignments</CardTitle>
                  <CardDescription>
                    {selectedUserId
                      ? "Manage role assignments for the selected user"
                      : "Select a user to view their role assignments"}
                  </CardDescription>
                </div>
                {selectedUserId && (
                  <Button
                    onClick={() => setAssignRoleDialogOpen(true)}
                    data-testid="button-assign-role"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Role
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!selectedUserId ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Select a user from the list to manage their role assignments</p>
                  </div>
                ) : assignmentsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Project Scope</TableHead>
                        <TableHead>Hospital Scope</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userAssignments?.map((assignment) => {
                        const role = roles?.find(r => r.id === assignment.roleId);
                        const project = projects?.find(p => p.id === assignment.projectId);
                        const hospital = hospitals?.find(h => h.id === assignment.hospitalId);
                        
                        return (
                          <TableRow key={assignment.id} data-testid={`row-assignment-${assignment.id}`}>
                            <TableCell className="font-medium">
                              {role?.displayName || "Unknown Role"}
                            </TableCell>
                            <TableCell>
                              {project?.name || "—"}
                            </TableCell>
                            <TableCell>
                              {hospital?.name || "—"}
                            </TableCell>
                            <TableCell>
                              {assignment.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setRemoveAssignmentDialogOpen(true);
                                }}
                                data-testid={`button-remove-assignment-${assignment.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!userAssignments || userAssignments.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No role assignments for this user
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Create a new custom role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (required)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., project_manager"
                data-testid="input-role-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Project Manager"
                data-testid="input-role-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role's responsibilities..."
                data-testid="input-role-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseRole">Inherit from Base Role (optional)</Label>
              <Select
                value={formData.baseRoleId || "none"}
                onValueChange={(v) => setFormData({ ...formData, baseRoleId: v === "none" ? null : v })}
              >
                <SelectTrigger data-testid="select-base-role">
                  <SelectValue placeholder="Select a base role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {baseRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital Scope (optional)</Label>
              <Select
                value={formData.hospitalId || "none"}
                onValueChange={(v) => setFormData({ ...formData, hospitalId: v === "none" ? null : v })}
              >
                <SelectTrigger data-testid="select-hospital-scope">
                  <SelectValue placeholder="Select a hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Global (All Hospitals)</SelectItem>
                  {hospitals?.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRole}
              disabled={createRoleMutation.isPending}
              data-testid="button-submit-create-role"
            >
              {createRoleMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name (required)</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-edit-role-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                data-testid="input-edit-role-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-edit-role-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedRole(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
              data-testid="button-submit-edit-role"
            >
              {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={permissionDialogOpen} onOpenChange={(open) => {
        setPermissionDialogOpen(open);
        if (!open) {
          setSelectedRole(null);
          setSelectedPermissions(new Set());
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedRole?.displayName} - Permissions
            </DialogTitle>
            <DialogDescription>
              {selectedRole?.roleType === "base"
                ? "View permissions for this base role"
                : "Manage permissions for this custom role"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-2">
            {Object.entries(permissionsByDomain).map(([domain, domainPerms]) => {
              const allSelected = domainPerms.every(p => selectedPermissions.has(p.id));
              const someSelected = domainPerms.some(p => selectedPermissions.has(p.id));
              
              return (
                <div key={domain} className="border rounded-md">
                  <div className="flex items-center justify-between p-3 bg-muted/50">
                    <span className="font-medium">
                      {DOMAIN_LABELS[domain] || domain}
                    </span>
                    {selectedRole?.roleType === "custom" && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleDomainPermissions(domainPerms)}
                          data-testid={`checkbox-domain-${domain}`}
                        />
                        <span className="text-xs text-muted-foreground">Select All</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    {domainPerms.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-start gap-3"
                        data-testid={`permission-checkbox-${perm.id}`}
                      >
                        {selectedRole?.roleType === "custom" ? (
                          <Checkbox
                            checked={selectedPermissions.has(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                        ) : (
                          <Check
                            className={`w-4 h-4 mt-0.5 ${
                              selectedRoleDetails?.permissions?.some(rp => rp.permissionId === perm.id)
                                ? "text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {perm.displayName}
                            </span>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {perm.action}
                            </code>
                          </div>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPermissionDialogOpen(false);
                setSelectedRole(null);
                setSelectedPermissions(new Set());
              }}
            >
              {selectedRole?.roleType === "base" ? "Close" : "Cancel"}
            </Button>
            {selectedRole?.roleType === "custom" && (
              <Button
                onClick={handleSavePermissions}
                disabled={updatePermissionsMutation.isPending}
                data-testid="button-save-permissions"
              >
                {updatePermissionsMutation.isPending ? "Saving..." : "Save Permissions"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{selectedRole?.displayName}"? 
              This action cannot be undone and will remove all user assignments for this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRole && deleteRoleMutation.mutate(selectedRole.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-role"
            >
              {deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Assign a role to the selected user with optional scope
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-role">Role (required)</Label>
              <Select
                value={assignmentFormData.roleId}
                onValueChange={(v) => setAssignmentFormData({ ...assignmentFormData, roleId: v })}
              >
                <SelectTrigger data-testid="select-assign-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-project">Project Scope (optional)</Label>
              <Select
                value={assignmentFormData.projectId || "none"}
                onValueChange={(v) => setAssignmentFormData({ ...assignmentFormData, projectId: v === "none" ? "" : v })}
              >
                <SelectTrigger data-testid="select-assign-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project scope</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-hospital">Hospital Scope (optional)</Label>
              <Select
                value={assignmentFormData.hospitalId || "none"}
                onValueChange={(v) => setAssignmentFormData({ ...assignmentFormData, hospitalId: v === "none" ? "" : v })}
              >
                <SelectTrigger data-testid="select-assign-hospital">
                  <SelectValue placeholder="Select a hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No hospital scope</SelectItem>
                  {hospitals?.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignRoleDialogOpen(false);
                setAssignmentFormData({ roleId: "", projectId: "", hospitalId: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedUserId || !assignmentFormData.roleId) return;
                assignRoleMutation.mutate({
                  userId: selectedUserId,
                  roleId: assignmentFormData.roleId,
                  projectId: assignmentFormData.projectId || undefined,
                  hospitalId: assignmentFormData.hospitalId || undefined,
                });
              }}
              disabled={!assignmentFormData.roleId || assignRoleMutation.isPending}
              data-testid="button-submit-assign-role"
            >
              {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeAssignmentDialogOpen} onOpenChange={setRemoveAssignmentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this role assignment? 
              The user will lose all permissions associated with this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedAssignment || !selectedUserId) return;
                removeAssignmentMutation.mutate({
                  userId: selectedUserId,
                  roleId: selectedAssignment.roleId,
                  projectId: selectedAssignment.projectId || undefined,
                  hospitalId: selectedAssignment.hospitalId || undefined,
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-remove-assignment"
            >
              {removeAssignmentMutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
