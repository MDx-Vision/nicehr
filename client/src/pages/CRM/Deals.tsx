import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Handshake,
  Plus,
  Search,
  DollarSign,
  Building2,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  ArrowRight,
  LayoutGrid,
  List,
  Eye,
  Activity,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ActivityFeed, ActivityForm, TasksPanel } from "@/components/crm";

interface Deal {
  id: string;
  name: string;
  amount?: string;
  probability?: number;
  expectedCloseDate?: string;
  pipelineId: string;
  stageId: string;
  stageName?: string;
  companyId?: string;
  companyName?: string;
  primaryContactId?: string;
  contactName?: string;
  dealType: string;
  status: string;
  description?: string;
  createdAt: string;
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  stageType: string;
}

interface Pipeline {
  id: string;
  name: string;
  type: string;
  stages: PipelineStage[];
}

const DEAL_TYPES = ["new_business", "expansion", "renewal", "upsell"];
const DEAL_STATUSES = ["open", "won", "lost", "abandoned"];

export default function CRMDeals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  const { data: pipelines, isLoading: loadingPipelines } = useQuery<Pipeline[]>({
    queryKey: ["/api/crm/pipelines"],
    queryFn: async () => {
      const res = await fetch("/api/crm/pipelines");
      if (!res.ok) throw new Error("Failed to fetch pipelines");
      return res.json();
    },
  });

  const { data: deals, isLoading: loadingDeals } = useQuery<Deal[]>({
    queryKey: ["/api/crm/deals", searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      const res = await fetch(`/api/crm/deals?${params}`);
      if (!res.ok) throw new Error("Failed to fetch deals");
      return res.json();
    },
  });

  const createDeal = useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create deal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Deal created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create deal", variant: "destructive" });
    },
  });

  const updateDeal = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Deal> }) => {
      const res = await fetch(`/api/crm/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update deal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      setIsEditDialogOpen(false);
      setSelectedDeal(null);
      toast({ title: "Deal updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update deal", variant: "destructive" });
    },
  });

  const deleteDeal = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/crm/deals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete deal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crm/dashboard"] });
      toast({ title: "Deal deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete deal", variant: "destructive" });
    },
  });

  const seedDefaultPipeline = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/crm/pipelines/seed-default", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create default pipeline");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/pipelines"] });
      toast({ title: "Default pipeline created" });
    },
    onError: () => {
      toast({ title: "Failed to create default pipeline", variant: "destructive" });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedPipeline = pipelines?.[0];
    const firstStage = selectedPipeline?.stages?.[0];

    createDeal.mutate({
      name: formData.get("name") as string,
      amount: formData.get("amount") as string,
      probability: parseInt(formData.get("probability") as string) || undefined,
      pipelineId: selectedPipeline?.id || "",
      stageId: firstStage?.id || "",
      dealType: formData.get("dealType") as string,
      status: "open",
      description: formData.get("description") as string || undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDeal) return;
    const formData = new FormData(e.currentTarget);
    updateDeal.mutate({
      id: selectedDeal.id,
      data: {
        name: formData.get("name") as string,
        amount: formData.get("amount") as string,
        probability: parseInt(formData.get("probability") as string) || undefined,
        dealType: formData.get("dealType") as string,
        status: formData.get("status") as string,
        description: formData.get("description") as string || undefined,
      },
    });
  };

  const moveDealToStage = (dealId: string, stageId: string) => {
    updateDeal.mutate({ id: dealId, data: { stageId } });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      won: "bg-green-500/20 text-green-400 border-green-500/30",
      lost: "bg-red-500/20 text-red-400 border-red-500/30",
      abandoned: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const isLoading = loadingPipelines || loadingDeals;
  const defaultPipeline = pipelines?.[0];
  const stages = defaultPipeline?.stages || [];

  // Group deals by stage for Kanban view
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals?.filter((d) => d.stageId === stage.id) || [];
    return acc;
  }, {} as Record<string, Deal[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-deals-title">Deals</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and deals</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              data-testid="button-view-kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-deal">
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>Add a new deal to your pipeline</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Deal Name *</Label>
                  <Input id="name" name="name" required data-testid="input-deal-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required data-testid="input-amount" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input id="probability" name="probability" type="number" min="0" max="100" data-testid="input-probability" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                  <Input id="expectedCloseDate" name="expectedCloseDate" type="date" data-testid="input-close-date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealType">Deal Type *</Label>
                  <Select name="dealType" defaultValue="new_business">
                    <SelectTrigger data-testid="select-deal-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} data-testid="input-description" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDeal.isPending} data-testid="button-create-deal">
                    {createDeal.isPending ? "Creating..." : "Create Deal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-deals"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {DEAL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* No Pipeline State */}
      {!loadingPipelines && (!pipelines || pipelines.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pipeline Configured</h3>
            <p className="text-muted-foreground mb-4">
              Create a sales pipeline to start tracking your deals
            </p>
            <Button onClick={() => seedDefaultPipeline.mutate()} disabled={seedDefaultPipeline.isPending}>
              {seedDefaultPipeline.isPending ? "Creating..." : "Create Default Pipeline"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && defaultPipeline && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(250px, 1fr))` }}>
          {stages.map((stage) => (
            <Card key={stage.id} className="min-h-[400px]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {dealsByStage[stage.id]?.length || 0}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  ${(dealsByStage[stage.id]?.reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0) || 0).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : dealsByStage[stage.id]?.length > 0 ? (
                  dealsByStage[stage.id].map((deal) => (
                    <Card key={deal.id} className="p-3 cursor-pointer hover:bg-muted/50" data-testid={`deal-card-${deal.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{deal.name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedDeal(deal);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDeal(deal);
                              setIsActivityFormOpen(true);
                            }}>
                              <Activity className="w-4 h-4 mr-2" />
                              Log Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDeal(deal);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {stages.filter(s => s.id !== stage.id).map(s => (
                              <DropdownMenuItem key={s.id} onClick={() => moveDealToStage(deal.id, s.id)}>
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Move to {s.name}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteDeal.mutate(deal.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="text-lg font-bold text-green-500 mb-2">
                        ${parseFloat(deal.amount || "0").toLocaleString()}
                      </div>
                      {deal.companyName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {deal.companyName}
                        </div>
                      )}
                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No deals in this stage
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && defaultPipeline && (
        <Card>
          <CardHeader>
            <CardTitle>All Deals</CardTitle>
            <CardDescription>
              {deals?.length || 0} deal{(deals?.length || 0) !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : deals && deals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Close Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id} data-testid={`deal-row-${deal.id}`}>
                      <TableCell className="font-medium">{deal.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-green-500">
                          <DollarSign className="w-4 h-4" />
                          {parseFloat(deal.amount || "0").toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{deal.stageName || "-"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(deal.status)}</TableCell>
                      <TableCell>
                        {deal.companyName ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {deal.companyName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.expectedCloseDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-deal-actions-${deal.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedDeal(deal);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDeal(deal);
                              setIsActivityFormOpen(true);
                            }}>
                              <Activity className="w-4 h-4 mr-2" />
                              Log Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDeal(deal);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteDeal.mutate(deal.id)}
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
            ) : (
              <div className="text-center py-12">
                <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No deals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first deal
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>Update deal information</DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Deal Name *</Label>
                <Input id="edit-name" name="name" defaultValue={selectedDeal.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount ($) *</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={selectedDeal.amount || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-probability">Probability (%)</Label>
                  <Input
                    id="edit-probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={selectedDeal.probability || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="edit-expectedCloseDate"
                  name="expectedCloseDate"
                  type="date"
                  defaultValue={selectedDeal.expectedCloseDate?.split("T")[0] || ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dealType">Deal Type *</Label>
                  <Select name="dealType" defaultValue={selectedDeal.dealType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ").charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select name="status" defaultValue={selectedDeal.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  defaultValue={selectedDeal.description || ""}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateDeal.isPending}>
                  {updateDeal.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Deal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              {selectedDeal?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDeal?.companyName && `${selectedDeal.companyName} • `}
              ${parseFloat(selectedDeal?.amount || "0").toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedDeal && (
            <Tabs defaultValue="activities" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activities" data-testid="tab-deal-activities">
                  <Activity className="w-4 h-4 mr-2" />
                  Activities
                </TabsTrigger>
                <TabsTrigger value="tasks" data-testid="tab-deal-tasks">
                  <FileText className="w-4 h-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="details" data-testid="tab-deal-details">
                  <Handshake className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activities" className="space-y-4 mt-4">
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setIsActivityFormOpen(true)}
                    data-testid="button-log-activity-from-deal-view"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
                <ActivityFeed
                  dealId={String(selectedDeal.id)}
                  title="Activity Timeline"
                  description="Recent activities on this deal"
                  maxHeight="350px"
                  showHeader={false}
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <TasksPanel
                  dealId={String(selectedDeal.id)}
                  title="Tasks"
                  description="Tasks related to this deal"
                  maxHeight="350px"
                />
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium text-lg text-green-500">
                      ${parseFloat(selectedDeal.amount || "0").toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Probability</p>
                    <p className="font-medium">{selectedDeal.probability || 0}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <Badge variant="outline">{selectedDeal.stageName || "Unknown"}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expected Close</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedDeal.expectedCloseDate
                        ? new Date(selectedDeal.expectedCloseDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedDeal.companyName || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {selectedDeal.contactName || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Deal Type</p>
                    <p className="font-medium">{selectedDeal.dealType?.replace(/_/g, " ") || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={selectedDeal.status === "won" ? "default" : selectedDeal.status === "lost" ? "destructive" : "secondary"}>
                      {selectedDeal.status}
                    </Badge>
                  </div>
                  {selectedDeal.description && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{selectedDeal.description}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              setIsEditDialogOpen(true);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Form Dialog */}
      {selectedDeal && (
        <ActivityForm
          open={isActivityFormOpen}
          onOpenChange={setIsActivityFormOpen}
          dealId={String(selectedDeal.id)}
          dealName={selectedDeal.name}
          companyId={selectedDeal.companyId ? String(selectedDeal.companyId) : undefined}
          contactId={selectedDeal.contactId ? String(selectedDeal.contactId) : undefined}
        />
      )}
    </div>
  );
}
