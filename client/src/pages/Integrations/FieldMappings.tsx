import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Wand2,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Copy,
  Search,
  Filter,
  Settings,
  Sparkles,
  Link2,
  Database,
  FileSpreadsheet,
} from "lucide-react";

interface FieldMapping {
  id: string;
  integrationSourceId: string;
  sourceField: string;
  targetField: string;
  targetTable: string;
  transformationType: string | null;
  transformationConfig: Record<string, unknown> | null;
  isAutoMapped: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationSource {
  id: string;
  name: string;
  systemType: string;
}

// Common target tables in NiceHR
const TARGET_TABLES = [
  { value: "consultants", label: "Consultants" },
  { value: "projects", label: "Projects" },
  { value: "hospitals", label: "Hospitals" },
  { value: "support_tickets", label: "Support Tickets" },
  { value: "timesheets", label: "Timesheets" },
  { value: "schedules", label: "Schedules" },
  { value: "training_modules", label: "Training Modules" },
  { value: "travel_bookings", label: "Travel Bookings" },
  { value: "invoices", label: "Invoices" },
  { value: "contracts", label: "Contracts" },
];

// Field suggestions per target table
const TABLE_FIELDS: Record<string, string[]> = {
  consultants: ["firstName", "lastName", "email", "phone", "skills", "availability", "hourlyRate"],
  projects: ["name", "description", "status", "startDate", "endDate", "budget", "hospitalId"],
  hospitals: ["name", "address", "city", "state", "contactEmail", "phone", "ehrSystem"],
  support_tickets: ["title", "description", "status", "priority", "assigneeId", "category"],
  timesheets: ["consultantId", "projectId", "date", "hours", "description", "status"],
  schedules: ["consultantId", "projectId", "shiftType", "startTime", "endTime", "date"],
  training_modules: ["title", "description", "category", "duration", "requiredFor"],
  travel_bookings: ["consultantId", "destination", "departureDate", "returnDate", "status"],
  invoices: ["projectId", "amount", "status", "dueDate", "description"],
  contracts: ["name", "hospitalId", "startDate", "endDate", "value", "status"],
};

// Transformation types
const TRANSFORMATION_TYPES = [
  { value: "none", label: "No transformation" },
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "date_format", label: "Date format conversion" },
  { value: "number_format", label: "Number format" },
  { value: "boolean_convert", label: "Boolean conversion" },
  { value: "lookup", label: "Lookup mapping" },
  { value: "concat", label: "Concatenate fields" },
  { value: "split", label: "Split field" },
  { value: "custom", label: "Custom expression" },
];

// Common source fields by system type
const SYSTEM_SOURCE_FIELDS: Record<string, string[]> = {
  servicenow: ["number", "short_description", "description", "state", "priority", "assigned_to", "caller_id", "opened_at", "closed_at", "category", "subcategory", "cmdb_ci"],
  asana: ["gid", "name", "notes", "completed", "due_on", "assignee", "projects", "tags", "created_at", "modified_at", "custom_fields"],
  sap: ["BUKRS", "WERKS", "MATNR", "MAKTX", "MEINS", "LGORT", "KOSTL", "AUFNR", "PRCTR", "ANLKL", "ANLN1"],
  jira: ["key", "summary", "description", "status", "priority", "assignee", "reporter", "created", "updated", "duedate", "labels", "components"],
  other: ["id", "name", "description", "status", "created_at", "updated_at"],
};

export default function FieldMappings() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const integrationId = params.id;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTable, setFilterTable] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    sourceField: "",
    targetField: "",
    targetTable: "",
    transformationType: "none",
    transformationConfig: {},
  });

  // Fetch integration source details
  const { data: source, isLoading: sourceLoading } = useQuery<IntegrationSource>({
    queryKey: [`/api/integrations/${integrationId}`],
    enabled: !!integrationId,
  });

  // Fetch mappings for this integration
  const { data: mappings, isLoading: mappingsLoading } = useQuery<FieldMapping[]>({
    queryKey: [`/api/integrations/${integrationId}/mappings`],
    enabled: !!integrationId,
  });

  // Create mapping mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/integrations/${integrationId}/mappings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create mapping");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integrationId}/mappings`] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Mapping created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create mapping", variant: "destructive" });
    },
  });

  // Update mapping mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/integrations/${integrationId}/mappings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update mapping");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integrationId}/mappings`] });
      setShowEditDialog(false);
      setSelectedMapping(null);
      resetForm();
      toast({ title: "Mapping updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update mapping", variant: "destructive" });
    },
  });

  // Delete mapping mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/integrations/${integrationId}/mappings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete mapping");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integrationId}/mappings`] });
      toast({ title: "Mapping deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete mapping", variant: "destructive" });
    },
  });

  // Auto-map mutation
  const autoMapMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/integrations/${integrationId}/mappings/auto-map`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to auto-map fields");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integrationId}/mappings`] });
      toast({ title: `Auto-mapped ${data.created} fields` });
    },
    onError: () => {
      toast({ title: "Failed to auto-map fields", variant: "destructive" });
    },
  });

  // Validate mappings mutation
  const validateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/integrations/${integrationId}/mappings/validate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to validate mappings");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/integrations/${integrationId}/mappings`] });
      toast({ title: `Validated ${data.validated} mappings, ${data.errors} errors` });
    },
    onError: () => {
      toast({ title: "Failed to validate mappings", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      sourceField: "",
      targetField: "",
      targetTable: "",
      transformationType: "none",
      transformationConfig: {},
    });
  };

  const handleEdit = (mapping: FieldMapping) => {
    setSelectedMapping(mapping);
    setFormData({
      sourceField: mapping.sourceField,
      targetField: mapping.targetField,
      targetTable: mapping.targetTable,
      transformationType: mapping.transformationType || "none",
      transformationConfig: mapping.transformationConfig || {},
    });
    setShowEditDialog(true);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedMapping) {
      updateMutation.mutate({ id: selectedMapping.id, data: formData });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Validated</Badge>;
      case "pending":
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case "error":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter mappings
  const filteredMappings = mappings?.filter((m) => {
    const matchesSearch =
      m.sourceField.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.targetField.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    const matchesTable = filterTable === "all" || m.targetTable === filterTable;
    return matchesSearch && matchesStatus && matchesTable;
  }) || [];

  // Stats
  const stats = {
    total: mappings?.length || 0,
    validated: mappings?.filter((m) => m.status === "validated").length || 0,
    pending: mappings?.filter((m) => m.status === "pending").length || 0,
    autoMapped: mappings?.filter((m) => m.isAutoMapped).length || 0,
  };

  const sourceFields = source ? SYSTEM_SOURCE_FIELDS[source.systemType] || SYSTEM_SOURCE_FIELDS.other : [];

  if (sourceLoading || mappingsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/integrations`)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold" data-testid="text-field-mappings-title">
            Field Mappings
          </h1>
          <p className="text-muted-foreground">
            {source?.name} - Map source fields to NiceHR fields
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            data-testid="button-validate-mappings"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Validate All
          </Button>
          <Button
            variant="outline"
            onClick={() => autoMapMutation.mutate()}
            disabled={autoMapMutation.isPending}
            data-testid="button-auto-map"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Map
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-add-mapping">
            <Plus className="w-4 h-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-mappings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Field mappings configured</p>
          </CardContent>
        </Card>

        <Card data-testid="card-validated-mappings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Validated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            <p className="text-xs text-muted-foreground">Ready for sync</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-mappings">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Need validation</p>
          </CardContent>
        </Card>

        <Card data-testid="card-auto-mapped">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Auto-Mapped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.autoMapped}</div>
            <p className="text-xs text-muted-foreground">AI suggestions applied</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-mappings"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="validated">Validated</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTable} onValueChange={setFilterTable}>
          <SelectTrigger className="w-40" data-testid="select-filter-table">
            <SelectValue placeholder="Target Table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            {TARGET_TABLES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Field Mappings</CardTitle>
          <CardDescription>
            Configure how source fields map to NiceHR fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMappings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No field mappings configured yet.</p>
              <p className="text-sm">Click "Add Mapping" or "Auto-Map" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Field</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Target Field</TableHead>
                  <TableHead>Target Table</TableHead>
                  <TableHead>Transform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping) => (
                  <TableRow key={mapping.id} data-testid={`row-mapping-${mapping.id}`}>
                    <TableCell className="font-mono text-sm">
                      {mapping.sourceField}
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {mapping.targetField}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mapping.targetTable}</Badge>
                    </TableCell>
                    <TableCell>
                      {mapping.transformationType && mapping.transformationType !== "none" ? (
                        <Badge variant="secondary">{mapping.transformationType}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(mapping.status)}</TableCell>
                    <TableCell>
                      {mapping.isAutoMapped ? (
                        <Badge variant="outline" className="text-blue-600">
                          <Sparkles className="w-3 h-3 mr-1" />Auto
                        </Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(mapping)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(mapping.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Mapping Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Field Mapping</DialogTitle>
            <DialogDescription>
              Map a source field from {source?.name} to a NiceHR field
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Field</Label>
              <Select
                value={formData.sourceField}
                onValueChange={(v) => setFormData({ ...formData, sourceField: v })}
              >
                <SelectTrigger data-testid="select-source-field">
                  <SelectValue placeholder="Select source field" />
                </SelectTrigger>
                <SelectContent>
                  {sourceFields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Or type custom:</p>
              <Input
                value={formData.sourceField}
                onChange={(e) => setFormData({ ...formData, sourceField: e.target.value })}
                placeholder="custom_field_name"
                data-testid="input-source-field"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Table</Label>
              <Select
                value={formData.targetTable}
                onValueChange={(v) => setFormData({ ...formData, targetTable: v, targetField: "" })}
              >
                <SelectTrigger data-testid="select-target-table">
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TABLES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Field</Label>
              <Select
                value={formData.targetField}
                onValueChange={(v) => setFormData({ ...formData, targetField: v })}
                disabled={!formData.targetTable}
              >
                <SelectTrigger data-testid="select-target-field">
                  <SelectValue placeholder="Select target field" />
                </SelectTrigger>
                <SelectContent>
                  {(TABLE_FIELDS[formData.targetTable] || []).map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transformation</Label>
              <Select
                value={formData.transformationType}
                onValueChange={(v) => setFormData({ ...formData, transformationType: v })}
              >
                <SelectTrigger data-testid="select-transformation">
                  <SelectValue placeholder="Select transformation" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFORMATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.sourceField || !formData.targetField || !formData.targetTable || createMutation.isPending}
              data-testid="button-save-mapping"
            >
              Create Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mapping Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Field Mapping</DialogTitle>
            <DialogDescription>
              Update the field mapping configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Field</Label>
              <Input
                value={formData.sourceField}
                onChange={(e) => setFormData({ ...formData, sourceField: e.target.value })}
                data-testid="input-edit-source-field"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Table</Label>
              <Select
                value={formData.targetTable}
                onValueChange={(v) => setFormData({ ...formData, targetTable: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TABLES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Field</Label>
              <Select
                value={formData.targetField}
                onValueChange={(v) => setFormData({ ...formData, targetField: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(TABLE_FIELDS[formData.targetTable] || []).map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transformation</Label>
              <Select
                value={formData.transformationType}
                onValueChange={(v) => setFormData({ ...formData, transformationType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFORMATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-testid="button-update-mapping"
            >
              Update Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
