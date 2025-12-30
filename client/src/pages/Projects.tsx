import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderKanban, Calendar, Users, Building2, DollarSign, Pencil, Trash2, Search, Eye, TrendingUp, TrendingDown, Clock, FileText, PiggyBank, Receipt, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Project, Hospital } from "@shared/schema";
import { format } from "date-fns";

const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  hospitalId: z.string().min(1, "Hospital is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  estimatedConsultants: z.coerce.number().min(0).optional(),
  estimatedBudget: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function Projects() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      hospitalId: "",
      startDate: "",
      endDate: "",
      estimatedConsultants: 0,
      estimatedBudget: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      return await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectFormValues> }) => {
      return await apiRequest("PATCH", `/api/projects/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project updated successfully" });
      setIsDialogOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      description: project.description || "",
      hospitalId: project.hospitalId,
      startDate: project.startDate,
      endDate: project.endDate,
      estimatedConsultants: project.estimatedConsultants || 0,
      estimatedBudget: project.estimatedBudget || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ProjectFormValues) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingProject(null);
      form.reset();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getHospitalName = (hospitalId: string) => {
    return hospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  // Filter projects based on status and search term
  const filteredProjects = projects?.filter((project) => {
    const matchesStatus = !statusFilter || statusFilter === "all" || project.status === statusFilter;
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getHospitalName(project.hospitalId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-projects-title">Projects</h1>
          <p className="text-muted-foreground">Manage hospital go-live projects</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-status">
            <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-project">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" data-testid="modal-create-project">
                <DialogHeader>
                  <DialogTitle>{editingProject ? "Edit Project" : "Create Project"}</DialogTitle>
                  <DialogDescription>
                    {editingProject ? "Update project details" : "Enter the project details below"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter project name" data-testid="input-project-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hospitalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-hospital">
                                <SelectValue placeholder="Select a hospital" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hospitals?.map((hospital) => (
                                <SelectItem key={hospital.id} value={hospital.id}>
                                  {hospital.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Project description" data-testid="input-project-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-start-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-end-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estimatedConsultants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Consultants</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" data-testid="input-est-consultants" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="estimatedBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Est. Budget ($)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0" data-testid="input-est-budget" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-project">
                        {editingProject ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="projects-list">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="projects-list">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover-elevate" data-testid="project-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg" data-testid="project-name">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {getHospitalName(project.hospitalId)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(project.status) as any} className="capitalize" data-testid="project-status">
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(new Date(project.startDate), "MMM d, yyyy")} - {format(new Date(project.endDate), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {project.actualConsultants || 0} / {project.estimatedConsultants || 0}
                    </span>
                  </div>
                  {project.estimatedBudget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{formatCurrency(project.estimatedBudget)}</span>
                    </div>
                  )}
                </div>

                {project.savings && parseFloat(project.savings) > 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Savings: {formatCurrency(project.savings)}
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingProject(project)}
                  data-testid="button-view-project"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(project)}
                      data-testid="button-edit-project"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(project.id)}
                      disabled={deleteMutation.isPending}
                      data-testid="button-delete-project"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card data-testid="projects-empty">
          <CardContent className="py-10 text-center">
            <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
            {isAdmin && (
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-project">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Project Details Modal */}
      <Dialog open={!!viewingProject} onOpenChange={(open) => !open && setViewingProject(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {viewingProject && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <FolderKanban className="w-6 h-6" />
                      {viewingProject.name}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {getHospitalName(viewingProject.hospitalId)}
                      </span>
                      <Badge variant={getStatusColor(viewingProject.status) as any} className="capitalize">
                        {viewingProject.status}
                      </Badge>
                      {viewingProject.contractType && (
                        <Badge variant="outline">{viewingProject.contractType}</Badge>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Contract Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-blue-500" />
                      <span className="text-xl font-bold">{viewingProject.contractValue ? formatCurrency(viewingProject.contractValue) : "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Actual Spend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-orange-500" />
                      <span className="text-xl font-bold">{viewingProject.actualBudget ? formatCurrency(viewingProject.actualBudget) : "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Actual Savings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-green-500" />
                      <span className="text-xl font-bold text-green-600">{viewingProject.actualSavings ? formatCurrency(viewingProject.actualSavings) : "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      <span className="text-xl font-bold">{viewingProject.roiPercentage ? `${viewingProject.roiPercentage}%` : "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="savings">Savings & ROI</TabsTrigger>
                  <TabsTrigger value="financial">Financial Status</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Project Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {viewingProject.description && (
                          <p className="text-sm text-muted-foreground">{viewingProject.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                          <span className="text-muted-foreground">Start Date:</span>
                          <span>{format(new Date(viewingProject.startDate), "MMM d, yyyy")}</span>

                          <span className="text-muted-foreground">End Date:</span>
                          <span>{format(new Date(viewingProject.endDate), "MMM d, yyyy")}</span>

                          {viewingProject.originalEndDate && viewingProject.originalEndDate !== viewingProject.endDate && (
                            <>
                              <span className="text-muted-foreground">Original End Date:</span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="w-3 h-3" />
                                {format(new Date(viewingProject.originalEndDate), "MMM d, yyyy")}
                              </span>
                            </>
                          )}

                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={getStatusColor(viewingProject.status) as any} className="capitalize w-fit">
                            {viewingProject.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          Contract Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Contract Type:</span>
                          <span>{viewingProject.contractType || "Not set"}</span>

                          <span className="text-muted-foreground">Contract Value:</span>
                          <span className="font-semibold">{viewingProject.contractValue ? formatCurrency(viewingProject.contractValue) : "Not set"}</span>

                          <span className="text-muted-foreground">Billing Rate:</span>
                          <span>{viewingProject.billingRate ? `${formatCurrency(viewingProject.billingRate)}/hr` : "N/A"}</span>

                          <span className="text-muted-foreground">Payment Terms:</span>
                          <span>{viewingProject.paymentTerms || "Not set"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Staffing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Consultants</span>
                            <span className="font-semibold">{viewingProject.actualConsultants || 0} / {viewingProject.estimatedConsultants || 0}</span>
                          </div>
                          <Progress
                            value={viewingProject.estimatedConsultants ? ((viewingProject.actualConsultants || 0) / viewingProject.estimatedConsultants) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Payback Period
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <span className="text-3xl font-bold">{viewingProject.paybackPeriodMonths || "—"}</span>
                          <span className="text-muted-foreground ml-2">months</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">Estimated time to recover investment</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="budget" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Budget Breakdown</CardTitle>
                        <CardDescription>Planned costs by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { label: "Labor", budget: viewingProject.laborBudget, actual: viewingProject.laborActual, color: "bg-blue-500" },
                            { label: "Travel", budget: viewingProject.travelBudget, actual: viewingProject.travelActual, color: "bg-green-500" },
                            { label: "Software", budget: viewingProject.softwareBudget, actual: viewingProject.softwareActual, color: "bg-purple-500" },
                            { label: "Training", budget: viewingProject.trainingBudget, actual: viewingProject.trainingActual, color: "bg-orange-500" },
                            { label: "Infrastructure", budget: viewingProject.infrastructureBudget, actual: viewingProject.infrastructureActual, color: "bg-cyan-500" },
                            { label: "Contingency", budget: viewingProject.contingencyBudget, actual: viewingProject.contingencyActual, color: "bg-gray-500" },
                          ].map((item) => (
                            <div key={item.label} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{item.label}</span>
                                <span className="font-medium">{item.budget ? formatCurrency(item.budget) : "$0"}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${item.color} transition-all`}
                                  style={{ width: `${item.budget && item.actual ? Math.min((parseFloat(item.actual) / parseFloat(item.budget)) * 100, 100) : 0}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-4 pt-4">
                          <div className="flex justify-between font-semibold">
                            <span>Total Budget</span>
                            <span>{viewingProject.estimatedBudget ? formatCurrency(viewingProject.estimatedBudget) : "$0"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Actual Spend</CardTitle>
                        <CardDescription>Costs incurred to date</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { label: "Labor", value: viewingProject.laborActual },
                            { label: "Travel", value: viewingProject.travelActual },
                            { label: "Software", value: viewingProject.softwareActual },
                            { label: "Training", value: viewingProject.trainingActual },
                            { label: "Infrastructure", value: viewingProject.infrastructureActual },
                            { label: "Contingency", value: viewingProject.contingencyActual },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span>{item.value ? formatCurrency(item.value) : "$0"}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-4 pt-4">
                          <div className="flex justify-between font-semibold">
                            <span>Total Actual</span>
                            <span>{viewingProject.actualBudget ? formatCurrency(viewingProject.actualBudget) : "$0"}</span>
                          </div>
                          {viewingProject.estimatedBudget && viewingProject.actualBudget && (
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-muted-foreground">Variance</span>
                              <span className={parseFloat(viewingProject.actualBudget) <= parseFloat(viewingProject.estimatedBudget) ? "text-green-600" : "text-red-600"}>
                                {parseFloat(viewingProject.actualBudget) <= parseFloat(viewingProject.estimatedBudget) ? (
                                  <span className="flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    {formatCurrency(String(parseFloat(viewingProject.estimatedBudget) - parseFloat(viewingProject.actualBudget)))} under
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {formatCurrency(String(parseFloat(viewingProject.actualBudget) - parseFloat(viewingProject.estimatedBudget)))} over
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Savings & ROI Tab */}
                <TabsContent value="savings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <PiggyBank className="w-4 h-4" />
                          Savings Breakdown
                        </CardTitle>
                        <CardDescription>Where the savings come from</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { label: "Labor Efficiency", value: viewingProject.savingsLaborEfficiency, desc: "FTE reduction/reallocation", icon: Users },
                            { label: "Error Reduction", value: viewingProject.savingsErrorReduction, desc: "Fewer mistakes, less rework", icon: AlertTriangle },
                            { label: "Revenue Cycle", value: viewingProject.savingsRevenueCycle, desc: "Faster billing, fewer denials", icon: DollarSign },
                            { label: "Patient Throughput", value: viewingProject.savingsPatientThroughput, desc: "More patients served", icon: TrendingUp },
                            { label: "Compliance", value: viewingProject.savingsCompliance, desc: "Avoided penalties", icon: CheckCircle },
                            { label: "Other", value: viewingProject.savingsOther, desc: "Miscellaneous savings", icon: Target },
                          ].filter(item => item.value && parseFloat(item.value) > 0).map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{item.label}</p>
                                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                              </div>
                              <span className="font-semibold text-green-600">{formatCurrency(item.value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-4 pt-4">
                          <div className="flex justify-between">
                            <span className="font-semibold">Total Actual Savings</span>
                            <span className="font-bold text-green-600 text-lg">{viewingProject.actualSavings ? formatCurrency(viewingProject.actualSavings) : "$0"}</span>
                          </div>
                          {viewingProject.projectedSavings && (
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-muted-foreground">Projected Savings</span>
                              <span>{formatCurrency(viewingProject.projectedSavings)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          ROI Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Return on Investment</p>
                          <p className="text-4xl font-bold text-green-600">{viewingProject.roiPercentage ? `${viewingProject.roiPercentage}%` : "—"}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 border rounded">
                            <p className="text-muted-foreground">Baseline Cost</p>
                            <p className="font-semibold">{viewingProject.baselineCost ? formatCurrency(viewingProject.baselineCost) : "Not set"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Cost without this project</p>
                          </div>
                          <div className="p-3 border rounded">
                            <p className="text-muted-foreground">Payback Period</p>
                            <p className="font-semibold">{viewingProject.paybackPeriodMonths ? `${viewingProject.paybackPeriodMonths} months` : "Not set"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Time to recover investment</p>
                          </div>
                        </div>

                        {viewingProject.savingsNotes && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Savings Methodology</p>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{viewingProject.savingsNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Financial Status Tab */}
                <TabsContent value="financial" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Invoicing Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Invoiced</span>
                              <span className="font-medium">{viewingProject.invoicedAmount ? formatCurrency(viewingProject.invoicedAmount) : "$0"} / {viewingProject.contractValue ? formatCurrency(viewingProject.contractValue) : "$0"}</span>
                            </div>
                            <Progress
                              value={viewingProject.contractValue && viewingProject.invoicedAmount ? (parseFloat(viewingProject.invoicedAmount) / parseFloat(viewingProject.contractValue)) * 100 : 0}
                              className="h-3"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Collected</span>
                              <span className="font-medium">{viewingProject.paidAmount ? formatCurrency(viewingProject.paidAmount) : "$0"} / {viewingProject.invoicedAmount ? formatCurrency(viewingProject.invoicedAmount) : "$0"}</span>
                            </div>
                            <Progress
                              value={viewingProject.invoicedAmount && viewingProject.paidAmount ? (parseFloat(viewingProject.paidAmount) / parseFloat(viewingProject.invoicedAmount)) * 100 : 0}
                              className="h-3 bg-muted [&>div]:bg-green-500"
                            />
                          </div>
                        </div>

                        <div className="border-t mt-4 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Outstanding Invoices</span>
                            <span className="font-medium">
                              {viewingProject.invoicedAmount && viewingProject.paidAmount
                                ? formatCurrency(String(parseFloat(viewingProject.invoicedAmount) - parseFloat(viewingProject.paidAmount)))
                                : "$0"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining to Invoice</span>
                            <span className="font-medium">
                              {viewingProject.contractValue && viewingProject.invoicedAmount
                                ? formatCurrency(String(parseFloat(viewingProject.contractValue) - parseFloat(viewingProject.invoicedAmount)))
                                : "$0"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Profitability Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Contract Value</span>
                            <span className="font-medium">{viewingProject.contractValue ? formatCurrency(viewingProject.contractValue) : "$0"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Actual Cost</span>
                            <span className="font-medium">{viewingProject.actualBudget ? formatCurrency(viewingProject.actualBudget) : "$0"}</span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between">
                              <span className="font-semibold">Gross Margin</span>
                              <span className={`font-bold ${viewingProject.contractValue && viewingProject.actualBudget && parseFloat(viewingProject.contractValue) > parseFloat(viewingProject.actualBudget) ? 'text-green-600' : 'text-red-600'}`}>
                                {viewingProject.contractValue && viewingProject.actualBudget
                                  ? formatCurrency(String(parseFloat(viewingProject.contractValue) - parseFloat(viewingProject.actualBudget)))
                                  : "$0"}
                              </span>
                            </div>
                            {viewingProject.contractValue && viewingProject.actualBudget && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {(((parseFloat(viewingProject.contractValue) - parseFloat(viewingProject.actualBudget)) / parseFloat(viewingProject.contractValue)) * 100).toFixed(1)}% margin
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setViewingProject(null)}>
                  Close
                </Button>
                {isAdmin && (
                  <Button onClick={() => { handleEdit(viewingProject); setViewingProject(null); }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Project
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}