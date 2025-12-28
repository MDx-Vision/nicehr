import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import SignatureCanvas from "react-signature-canvas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  PenTool,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Send,
  Users,
  Calendar,
  Building2,
  User,
  FileSignature,
  History,
  Eraser,
} from "lucide-react";
import type {
  ContractTemplate,
  Contract,
  ContractWithDetails,
  ContractSigner,
  ContractSignerWithDetails,
  ContractSignature,
  ContractAuditEvent,
  Project,
  Consultant,
} from "@shared/schema";

const TEMPLATE_TYPES = [
  { value: "ica", label: "Independent Contractor Agreement", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "nda", label: "NDA", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { value: "task_order", label: "Task Order", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "baa", label: "BAA", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "general", label: "General", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
];

const CONTRACT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  { value: "pending_signature", label: "Pending Signature", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "partially_signed", label: "Partially Signed", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "expired", label: "Expired", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200" },
];

const SIGNER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "signed", label: "Signed", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "declined", label: "Declined", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

function getTemplateTypeBadge(type: string) {
  const config = TEMPLATE_TYPES.find(t => t.value === type);
  return <Badge className={config?.color || ""}>{config?.label || type}</Badge>;
}

function getContractStatusBadge(status: string) {
  const config = CONTRACT_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

function getSignerStatusBadge(status: string) {
  const config = SIGNER_STATUSES.find(s => s.value === status);
  return <Badge className={config?.color || ""}>{config?.label || status}</Badge>;
}

interface ContractsAnalytics {
  totalContracts: number;
  pendingSignatures: number;
  completed: number;
  expired: number;
}

function DashboardTab() {
  const { user } = useAuth();
  
  const { data: contracts = [], isLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ['/api/contracts'],
  });

  const analytics: ContractsAnalytics = {
    totalContracts: contracts.length,
    pendingSignatures: contracts.filter(c => c.status === "pending_signature" || c.status === "partially_signed").length,
    completed: contracts.filter(c => c.status === "completed").length,
    expired: contracts.filter(c => c.status === "expired").length,
  };

  const recentContracts = contracts
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="stat-total-contracts">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContracts}</div>
            <p className="text-xs text-muted-foreground">All contracts</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-pending-signatures">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <PenTool className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.pendingSignatures}</div>
            <p className="text-xs text-muted-foreground">Awaiting signatures</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-completed">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.completed}</div>
            <p className="text-xs text-muted-foreground">Fully signed</p>
          </CardContent>
        </Card>

        <Card data-testid="stat-expired">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.expired}</div>
            <p className="text-xs text-muted-foreground">Past expiration</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-recent-contracts">
        <CardHeader>
          <CardTitle className="text-base">Recent Contracts</CardTitle>
          <CardDescription>Latest contract activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentContracts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No contracts yet</p>
          ) : (
            <div className="space-y-4">
              {recentContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                  data-testid={`recent-contract-${contract.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-background">
                      <FileSignature className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{contract.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {contract.contractNumber} • {contract.createdAt ? format(new Date(contract.createdAt), "MMM d, yyyy") : ""}
                      </p>
                    </div>
                  </div>
                  {getContractStatusBadge(contract.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateTemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ContractTemplate | null;
}) {
  const { toast } = useToast();
  const isEditing = !!template;
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    templateType: template?.templateType || "general",
    content: template?.content || "",
    placeholders: template?.placeholders ? JSON.stringify(template.placeholders, null, 2) : "[]",
    requiredSigners: template?.requiredSigners ? JSON.stringify(template.requiredSigners, null, 2) : '[{"role": "consultant", "order": 1}, {"role": "admin", "order": 2}]',
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (isEditing) {
        return apiRequest("PATCH", `/api/contract-templates/${template.id}`, data);
      }
      return apiRequest("POST", "/api/contract-templates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contract-templates'] });
      onOpenChange(false);
      resetForm();
      toast({ title: isEditing ? "Template updated successfully" : "Template created successfully" });
    },
    onError: () => {
      toast({ title: isEditing ? "Failed to update template" : "Failed to create template", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      templateType: "general",
      content: "",
      placeholders: "[]",
      requiredSigners: '[{"role": "consultant", "order": 1}, {"role": "admin", "order": 2}]',
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    let placeholders, requiredSigners;
    try {
      placeholders = JSON.parse(formData.placeholders);
      requiredSigners = JSON.parse(formData.requiredSigners);
    } catch {
      toast({ title: "Invalid JSON in placeholders or signers configuration", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      templateType: formData.templateType,
      content: formData.content,
      placeholders,
      requiredSigners,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Template" : "Create Contract Template"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the contract template details." : "Create a new contract template for generating contracts."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Template name"
                data-testid="input-template-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.templateType}
                onValueChange={(v) => setFormData({ ...formData, templateType: v })}
                data-testid="select-template-type"
              >
                <SelectTrigger data-testid="select-template-type-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} data-testid={`option-template-type-${type.value}`}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              data-testid="input-template-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Content (Markdown/HTML) *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Contract template content with {{placeholder}} variables..."
              className="font-mono text-sm min-h-[200px]"
              data-testid="input-template-content"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{placeholderName}}"} for dynamic values
            </p>
          </div>

          <div className="space-y-2">
            <Label>Placeholders (JSON)</Label>
            <Textarea
              value={formData.placeholders}
              onChange={(e) => setFormData({ ...formData, placeholders: e.target.value })}
              placeholder='[{"key": "consultantName", "label": "Consultant Name", "type": "text", "required": true}]'
              className="font-mono text-sm"
              rows={4}
              data-testid="input-template-placeholders"
            />
          </div>

          <div className="space-y-2">
            <Label>Required Signers (JSON)</Label>
            <Textarea
              value={formData.requiredSigners}
              onChange={(e) => setFormData({ ...formData, requiredSigners: e.target.value })}
              placeholder='[{"role": "consultant", "order": 1}]'
              className="font-mono text-sm"
              rows={3}
              data-testid="input-template-signers"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-template">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-save-template">
            {createMutation.isPending ? "Saving..." : isEditing ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplatesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: templates = [], isLoading } = useQuery<ContractTemplate[]>({
    queryKey: ['/api/contract-templates'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/contract-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contract-templates'] });
      toast({ title: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const filteredTemplates = templates.filter((template) => {
    if (typeFilter !== "all" && template.templateType !== typeFilter) return false;
    return true;
  });

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Admin Only</h3>
          <p className="text-muted-foreground text-center">
            Only administrators can manage contract templates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter} data-testid="filter-template-type">
            <SelectTrigger className="w-[180px]" data-testid="filter-template-type-trigger">
              <SelectValue placeholder="Template Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-template-type-all">All Types</SelectItem>
              {TEMPLATE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} data-testid={`filter-template-type-${type.value}`}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowCreateDialog(true)} data-testid="button-new-template">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first contract template to get started.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-template">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} data-testid={`card-template-${template.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  {getTemplateTypeBadge(template.templateType)}
                  <Badge variant="outline">v{template.version}</Badge>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTemplate(template)}
                    data-testid={`button-edit-template-${template.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this template?")) {
                        deleteMutation.mutate(template.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-template-${template.id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTemplateDialog
        open={showCreateDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }
        }}
        template={editingTemplate}
      />
    </div>
  );
}

function CreateContractDialog({
  open,
  onOpenChange,
  templates,
  consultants,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: ContractTemplate[];
  consultants: Consultant[];
  projects: Project[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    templateId: "",
    title: "",
    consultantId: "",
    projectId: "",
    effectiveDate: "",
    expirationDate: "",
    metadata: "{}",
  });

  const selectedTemplate = templates.find((t) => t.id === formData.templateId);

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return apiRequest("POST", "/api/contracts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      onOpenChange(false);
      resetForm();
      toast({ title: "Contract created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create contract", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      templateId: "",
      title: "",
      consultantId: "",
      projectId: "",
      effectiveDate: "",
      expirationDate: "",
      metadata: "{}",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.templateId) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    let metadata;
    try {
      metadata = JSON.parse(formData.metadata);
    } catch {
      toast({ title: "Invalid JSON in metadata", variant: "destructive" });
      return;
    }

    const content = selectedTemplate?.content || "";

    createMutation.mutate({
      templateId: formData.templateId,
      title: formData.title,
      content,
      consultantId: formData.consultantId || null,
      projectId: formData.projectId || null,
      effectiveDate: formData.effectiveDate || null,
      expirationDate: formData.expirationDate || null,
      metadata,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>Generate a new contract from a template.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template *</Label>
            <Select
              value={formData.templateId}
              onValueChange={(v) => setFormData({ ...formData, templateId: v })}
              data-testid="select-contract-template"
            >
              <SelectTrigger data-testid="select-contract-template-trigger">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter((t) => t.isActive).map((template) => (
                  <SelectItem key={template.id} value={template.id} data-testid={`option-contract-template-${template.id}`}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contract title"
              data-testid="input-contract-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Consultant</Label>
              <Select
                value={formData.consultantId}
                onValueChange={(v) => setFormData({ ...formData, consultantId: v })}
                data-testid="select-contract-consultant"
              >
                <SelectTrigger data-testid="select-contract-consultant-trigger">
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.map((c) => (
                    <SelectItem key={c.id} value={c.id} data-testid={`option-contract-consultant-${c.id}`}>
                      {(c as any).user?.firstName} {(c as any).user?.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(v) => setFormData({ ...formData, projectId: v })}
                data-testid="select-contract-project"
              >
                <SelectTrigger data-testid="select-contract-project-trigger">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} data-testid={`option-contract-project-${p.id}`}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                data-testid="input-contract-effective-date"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                data-testid="input-contract-expiration-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Metadata (JSON)</Label>
            <Textarea
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              placeholder='{"key": "value"}'
              className="font-mono text-sm"
              rows={3}
              data-testid="input-contract-metadata"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-contract">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-create-contract">
            {createMutation.isPending ? "Creating..." : "Create Contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContractDetailDialog({
  contract,
  open,
  onOpenChange,
}: {
  contract: ContractWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"content" | "signers" | "audit">("content");

  const { data: auditEvents = [] } = useQuery<ContractAuditEvent[]>({
    queryKey: ['/api/contracts', contract?.id, 'audit'],
    enabled: !!contract?.id && activeView === "audit",
  });

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-muted">
              <FileSignature className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>{contract.title}</DialogTitle>
              <DialogDescription>
                {contract.contractNumber} • {contract.template?.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getContractStatusBadge(contract.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Effective Date</span>
              <p className="font-medium">
                {contract.effectiveDate ? format(new Date(contract.effectiveDate), "MMM d, yyyy") : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Expiration Date</span>
              <p className="font-medium">
                {contract.expirationDate ? format(new Date(contract.expirationDate), "MMM d, yyyy") : "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeView === "content" ? "default" : "outline"}
              onClick={() => setActiveView("content")}
              data-testid="button-view-content"
            >
              <FileText className="h-3 w-3 mr-1" />
              Content
            </Button>
            <Button
              size="sm"
              variant={activeView === "signers" ? "default" : "outline"}
              onClick={() => setActiveView("signers")}
              data-testid="button-view-signers"
            >
              <Users className="h-3 w-3 mr-1" />
              Signers
            </Button>
            <Button
              size="sm"
              variant={activeView === "audit" ? "default" : "outline"}
              onClick={() => setActiveView("audit")}
              data-testid="button-view-audit"
            >
              <History className="h-3 w-3 mr-1" />
              Audit Trail
            </Button>
          </div>

          {activeView === "content" && (
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contract.content }} />
            </ScrollArea>
          )}

          {activeView === "signers" && (
            <div className="space-y-3">
              {contract.signers?.length > 0 ? (
                contract.signers.map((signer) => (
                  <div
                    key={signer.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    data-testid={`signer-${signer.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {signer.user?.firstName?.[0]}{signer.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {signer.user?.firstName} {signer.user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {signer.role} • Order: {signer.signingOrder}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSignerStatusBadge(signer.status)}
                      {signer.signedAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(signer.signedAt), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No signers assigned</p>
              )}
            </div>
          )}

          {activeView === "audit" && (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {auditEvents.length > 0 ? (
                  auditEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-md bg-muted/50"
                      data-testid={`audit-event-${event.id}`}
                    >
                      <div className="p-1.5 rounded-full bg-background">
                        <History className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.eventType}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.createdAt ? format(new Date(event.createdAt), "MMM d, yyyy h:mm a") : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No audit events</p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-contract-detail">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContractsTab({
  templates,
  consultants,
  projects,
}: {
  templates: ContractTemplate[];
  consultants: Consultant[];
  projects: Project[];
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);

  const { data: contracts = [], isLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ['/api/contracts'],
  });

  const filteredContracts = contracts.filter((contract) => {
    if (statusFilter !== "all" && contract.status !== statusFilter) return false;
    if (projectFilter !== "all" && contract.projectId !== projectFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-contract-status">
            <SelectTrigger className="w-[180px]" data-testid="filter-contract-status-trigger">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-contract-status-all">All Statuses</SelectItem>
              {CONTRACT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} data-testid={`filter-contract-status-${status.value}`}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter} data-testid="filter-contract-project">
            <SelectTrigger className="w-[180px]" data-testid="filter-contract-project-trigger">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="filter-contract-project-all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id} data-testid={`filter-contract-project-${p.id}`}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-new-contract">
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSignature className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contracts found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {isAdmin ? "Create your first contract to get started." : "No contracts match your filters."}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-contract">
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContracts.map((contract) => (
            <Card
              key={contract.id}
              className="cursor-pointer hover-elevate"
              onClick={() => setSelectedContract(contract)}
              data-testid={`card-contract-${contract.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      <FileSignature className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{contract.title}</CardTitle>
                      <CardDescription className="text-sm">{contract.contractNumber}</CardDescription>
                    </div>
                  </div>
                  {getContractStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contract.template && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{contract.template.name}</span>
                  </div>
                )}

                {contract.consultant && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {contract.consultant.user?.firstName} {contract.consultant.user?.lastName}
                    </span>
                  </div>
                )}

                {contract.project && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{contract.project.name}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {contract.createdAt ? format(new Date(contract.createdAt), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  {contract.signers && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {contract.signers.filter((s) => s.status === "signed").length}/{contract.signers.length}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateContractDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        templates={templates}
        consultants={consultants}
        projects={projects}
      />

      <ContractDetailDialog
        contract={selectedContract}
        open={!!selectedContract}
        onOpenChange={(open) => !open && setSelectedContract(null)}
      />
    </div>
  );
}

function SigningDialog({
  contract,
  open,
  onOpenChange,
}: {
  contract: ContractWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [agreed, setAgreed] = useState(false);

  const signMutation = useMutation({
    mutationFn: async (data: { signatureData: string }) => {
      return apiRequest("POST", `/api/contracts/${contract?.id}/sign`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      onOpenChange(false);
      setAgreed(false);
      toast({ title: "Contract signed successfully" });
    },
    onError: () => {
      toast({ title: "Failed to sign contract", variant: "destructive" });
    },
  });

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  const handleSign = () => {
    if (!agreed) {
      toast({ title: "Please agree to the terms", variant: "destructive" });
      return;
    }

    if (sigPadRef.current?.isEmpty()) {
      toast({ title: "Please provide your signature", variant: "destructive" });
      return;
    }

    const signatureData = sigPadRef.current?.toDataURL("image/png") || "";
    signMutation.mutate({ signatureData });
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sign Contract</DialogTitle>
          <DialogDescription>Review and sign: {contract.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contract Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] border rounded-md p-3 bg-muted/30">
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contract.content }} />
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Signature</CardTitle>
              <CardDescription>Draw your signature below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className="border-2 border-dashed rounded-md bg-white"
                style={{ touchAction: "none" }}
                data-testid="signature-canvas"
              >
                <SignatureCanvas
                  ref={sigPadRef}
                  canvasProps={{
                    className: "w-full h-[150px]",
                    style: { width: "100%", height: "150px" },
                  }}
                  penColor="black"
                  backgroundColor="white"
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleClear} data-testid="button-clear-signature">
                <Eraser className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              data-testid="checkbox-agree"
            />
            <Label htmlFor="agree" className="text-sm">
              I have read and agree to the terms and conditions of this contract
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-signing">
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={signMutation.isPending || !agreed} data-testid="button-sign-contract">
            {signMutation.isPending ? "Signing..." : "Sign Contract"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PendingSignaturesTab() {
  const { user } = useAuth();
  const [signingContract, setSigningContract] = useState<ContractWithDetails | null>(null);

  const { data: contracts = [], isLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ['/api/contracts'],
  });

  const pendingContracts = contracts.filter((contract) => {
    if (contract.status !== "pending_signature" && contract.status !== "partially_signed") {
      return false;
    }
    const userSigner = contract.signers?.find((s) => s.userId === user?.id);
    return userSigner && userSigner.status === "pending";
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingContracts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-muted-foreground text-center">
            You have no pending contracts to sign.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {pendingContracts.map((contract) => {
          const userSigner = contract.signers?.find((s) => s.userId === user?.id);
          const signedCount = contract.signers?.filter((s) => s.status === "signed").length || 0;
          const totalSigners = contract.signers?.length || 0;

          return (
            <Card key={contract.id} data-testid={`card-pending-contract-${contract.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{contract.title}</CardTitle>
                      <CardDescription className="text-sm">{contract.contractNumber}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Awaiting Your Signature
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Effective: {contract.effectiveDate ? format(new Date(contract.effectiveDate), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Expires: {contract.expirationDate ? format(new Date(contract.expirationDate), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{signedCount} of {totalSigners} signed</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Other Signers</p>
                  {contract.signers?.filter((s) => s.userId !== user?.id).map((signer) => (
                    <div key={signer.id} className="flex items-center justify-between text-sm">
                      <span>{signer.user?.firstName} {signer.user?.lastName}</span>
                      {getSignerStatusBadge(signer.status)}
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => setSigningContract(contract)}
                  data-testid={`button-sign-${contract.id}`}
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Sign Contract
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SigningDialog
        contract={signingContract}
        open={!!signingContract}
        onOpenChange={(open) => !open && setSigningContract(null)}
      />
    </div>
  );
}

export default function Contracts() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: templates = [] } = useQuery<ContractTemplate[]>({
    queryKey: ['/api/contract-templates'],
  });

  const { data: consultants = [] } = useQuery<Consultant[]>({
    queryKey: ['/api/consultants'],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Contracts</h1>
          <p className="text-muted-foreground">Manage contracts and digital signatures</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-contracts">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">
            <FileText className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="templates" data-testid="tab-templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          )}
          <TabsTrigger value="contracts" data-testid="tab-contracts">
            <FileSignature className="h-4 w-4 mr-2" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending-signatures">
            <PenTool className="h-4 w-4 mr-2" />
            My Pending Signatures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="templates" className="space-y-6">
            <TemplatesTab />
          </TabsContent>
        )}

        <TabsContent value="contracts" className="space-y-6">
          <ContractsTab
            templates={templates}
            consultants={consultants}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <PendingSignaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
