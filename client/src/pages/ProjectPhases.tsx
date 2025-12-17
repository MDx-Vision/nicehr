import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Target,
  Calendar,
  ListTodo,
  Flag,
  Plus,
  Pencil,
  ArrowLeft,
  ClipboardList,
  Milestone,
  ListChecks,
  FileText,
  Activity
} from "lucide-react";
import type { Project, ProjectPhase, ProjectTask, ProjectMilestone, ProjectRisk, PhaseStep } from "@shared/schema";

const EHR_PHASES = [
  { phase: 1, name: "Assessment", description: "Current state analysis and gap identification" },
  { phase: 2, name: "Planning", description: "Project planning and resource allocation" },
  { phase: 3, name: "Design", description: "System design and workflow mapping" },
  { phase: 4, name: "Build", description: "Configuration and customization" },
  { phase: 5, name: "Testing", description: "System and integration testing" },
  { phase: 6, name: "Training", description: "End-user and super-user training" },
  { phase: 7, name: "Data Migration", description: "Legacy data conversion and validation" },
  { phase: 8, name: "Go-Live Prep", description: "Cutover planning and readiness assessment" },
  { phase: 9, name: "Go-Live", description: "System activation and command center" },
  { phase: 10, name: "Stabilization", description: "Post go-live support and issue resolution" },
  { phase: 11, name: "Optimization", description: "Continuous improvement and optimization" },
];

function PhaseProgressTracker({ phases, projectId }: { phases: ProjectPhase[]; projectId: string }) {
  const getPhaseStatus = (phaseNumber: number) => {
    const phase = phases.find(p => p.phaseNumber === phaseNumber);
    return phase?.status || "not_started";
  };

  const getPhaseProgress = (phaseNumber: number) => {
    const phase = phases.find(p => p.phaseNumber === phaseNumber);
    return phase?.completionPercentage || 0;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center min-w-max gap-1">
        {EHR_PHASES.map((phase, index) => {
          const status = getPhaseStatus(phase.phase);
          const progress = getPhaseProgress(phase.phase);
          const isCompleted = status === "completed";
          const isActive = status === "in_progress";
          
          return (
            <div key={phase.phase} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors
                    ${isCompleted ? "bg-green-500 border-green-500 text-white" : 
                      isActive ? "bg-blue-500 border-blue-500 text-white" : 
                      "bg-background border-muted-foreground/30 text-muted-foreground"}`}
                  data-testid={`phase-indicator-${phase.phase}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : phase.phase}
                </div>
                <div className="mt-2 text-center max-w-[80px]">
                  <p className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {phase.name}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground">{progress}%</p>
                  )}
                </div>
              </div>
              {index < EHR_PHASES.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseCard({ 
  phase, 
  phaseData, 
  onEdit 
}: { 
  phase: typeof EHR_PHASES[0]; 
  phaseData?: ProjectPhase;
  onEdit: () => void;
}) {
  const status = phaseData?.status || "not_started";
  const progress = phaseData?.completionPercentage || 0;

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-phase-${phase.phase}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
              ${status === "completed" ? "bg-green-500 text-white" : 
                status === "in_progress" ? "bg-blue-500 text-white" : 
                "bg-muted text-muted-foreground"}`}>
              {phase.phase}
            </div>
            <div>
              <CardTitle className="text-lg">{phase.name}</CardTitle>
              <CardDescription className="text-xs">{phase.description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {phaseData?.plannedStartDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(phaseData.plannedStartDate), "MMM d, yyyy")}
              {phaseData.plannedEndDate && ` - ${format(new Date(phaseData.plannedEndDate), "MMM d, yyyy")}`}
            </span>
          </div>
        )}
        
        {phaseData?.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{phaseData.notes}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" onClick={onEdit} data-testid={`button-edit-phase-${phase.phase}`}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}

function TaskList({ 
  tasks, 
  phaseId, 
  onAddTask 
}: { 
  tasks: ProjectTask[]; 
  phaseId: string;
  onAddTask: () => void;
}) {
  const { toast } = useToast();
  
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases", phaseId, "tasks"] });
      toast({ title: "Task updated" });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <ListTodo className="w-4 h-4" />
          Tasks ({tasks.length})
        </h4>
        <Button size="sm" variant="outline" onClick={onAddTask} data-testid="button-add-task">
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No tasks added yet</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
              data-testid={`task-item-${task.id}`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateTaskMutation.mutate({ 
                    id: task.id, 
                    status: task.status === "completed" ? "pending" : "completed" 
                  })}
                  className="flex-shrink-0"
                  data-testid={`button-toggle-task-${task.id}`}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </button>
                <div>
                  <p className={`text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={getPriorityColor(task.priority || "medium") as any}>
                {task.priority || "medium"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectPhases() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: phases, isLoading: phasesLoading } = useQuery<ProjectPhase[]>({
    queryKey: ["/api/projects", selectedProject, "phases"],
    enabled: !!selectedProject,
  });

  const { data: tasks } = useQuery<ProjectTask[]>({
    queryKey: ["/api/phases", editingPhase?.id, "tasks"],
    enabled: !!editingPhase?.id,
  });

  const createPhaseMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/projects/${selectedProject}/phases`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "phases"] });
      toast({ title: "Phase created successfully" });
      setIsPhaseDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create phase", variant: "destructive" });
    },
  });

  const updatePhaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/phases/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "phases"] });
      toast({ title: "Phase updated successfully" });
      setIsPhaseDialogOpen(false);
      setEditingPhase(null);
    },
    onError: () => {
      toast({ title: "Failed to update phase", variant: "destructive" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/phases/${editingPhase?.id}/tasks`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases", editingPhase?.id, "tasks"] });
      toast({ title: "Task created successfully" });
      setIsTaskDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  const initializePhasesForProject = async () => {
    if (!selectedProject) return;
    
    for (const phase of EHR_PHASES) {
      await createPhaseMutation.mutateAsync({
        phaseName: phase.name,
        phaseNumber: phase.phase,
        status: "not_started",
        completionPercentage: 0,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "phases"] });
  };

  const overallProgress = phases?.length 
    ? Math.round(phases.reduce((sum, p) => sum + (p.completionPercentage || 0), 0) / 11)
    : 0;

  const handleEditPhase = (phaseNumber: number) => {
    const phase = phases?.find(p => p.phaseNumber === phaseNumber);
    if (phase) {
      setEditingPhase(phase);
      setIsPhaseDialogOpen(true);
    } else {
      const ehrPhase = EHR_PHASES.find(p => p.phase === phaseNumber);
      if (ehrPhase) {
        setEditingPhase({
          id: "",
          projectId: selectedProject,
          phaseName: ehrPhase.name,
          phaseNumber: ehrPhase.phase,
          status: "not_started",
          completionPercentage: 0,
          description: null,
          notes: null,
          plannedStartDate: null,
          plannedEndDate: null,
          actualStartDate: null,
          actualEndDate: null,
          createdAt: null,
          updatedAt: null,
        } as ProjectPhase);
        setIsPhaseDialogOpen(true);
      }
    }
  };

  const handlePhaseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      phaseName: formData.get("phaseName"),
      phaseNumber: editingPhase?.phaseNumber,
      status: formData.get("status"),
      completionPercentage: parseInt(formData.get("completionPercentage") as string) || 0,
      plannedStartDate: formData.get("plannedStartDate") || null,
      plannedEndDate: formData.get("plannedEndDate") || null,
      notes: formData.get("notes") || null,
    };

    if (editingPhase?.id) {
      updatePhaseMutation.mutate({ id: editingPhase.id, data });
    } else {
      createPhaseMutation.mutate(data);
    }
  };

  const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description") || null,
      priority: formData.get("priority"),
      dueDate: formData.get("dueDate") || null,
      status: "pending",
    };
    createTaskMutation.mutate(data);
  };

  if (projectsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/projects")} data-testid="button-back-to-projects">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" data-testid="text-project-phases-title">Project Phases</h1>
          <p className="text-muted-foreground">Track and manage EHR implementation phases</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          {projects && projects.length > 0 ? (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="max-w-md" data-testid="select-project">
                <SelectValue placeholder="Choose a project to view phases" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No Projects Found</p>
                <p className="text-sm">Create a project first to start tracking implementation phases.</p>
              </div>
              <Button onClick={() => setLocation("/projects")} data-testid="button-go-to-projects">
                <Plus className="w-4 h-4 mr-2" />
                Go to Projects
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Implementation Progress
                  </CardTitle>
                  <CardDescription>
                    Overall completion: {overallProgress}% across all phases
                  </CardDescription>
                </div>
                {isAdmin && (!phases || phases.length === 0) && (
                  <Button onClick={initializePhasesForProject} data-testid="button-initialize-phases">
                    <Plus className="w-4 h-4 mr-2" />
                    Initialize Phases
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={overallProgress} className="h-3" />
                {phases && phases.length > 0 && (
                  <PhaseProgressTracker phases={phases} projectId={selectedProject} />
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="phases">
            <TabsList>
              <TabsTrigger value="phases" data-testid="tab-phases">
                <ClipboardList className="w-4 h-4 mr-2" />
                All Phases
              </TabsTrigger>
              <TabsTrigger value="steps" data-testid="tab-steps">
                <ListChecks className="w-4 h-4 mr-2" />
                Steps
              </TabsTrigger>
              <TabsTrigger value="milestones" data-testid="tab-milestones">
                <Milestone className="w-4 h-4 mr-2" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="risks" data-testid="tab-risks">
                <AlertCircle className="w-4 h-4 mr-2" />
                Risks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phases" className="mt-4">
              {phasesLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {EHR_PHASES.map((phase) => (
                    <PhaseCard
                      key={phase.phase}
                      phase={phase}
                      phaseData={phases?.find(p => p.phaseNumber === phase.phase)}
                      onEdit={() => handleEditPhase(phase.phase)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="steps" className="mt-4">
              <StepsTab projectId={selectedProject} phases={phases || []} />
            </TabsContent>

            <TabsContent value="milestones" className="mt-4">
              <MilestonesTab projectId={selectedProject} />
            </TabsContent>

            <TabsContent value="risks" className="mt-4">
              <RisksTab projectId={selectedProject} />
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={isPhaseDialogOpen} onOpenChange={setIsPhaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPhase?.id ? "Edit Phase" : "Initialize Phase"}
            </DialogTitle>
            <DialogDescription>
              Update the status and progress for this phase
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePhaseSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phaseName">Phase Name</Label>
              <Input 
                id="phaseName" 
                name="phaseName" 
                defaultValue={editingPhase?.phaseName} 
                readOnly
                data-testid="input-phase-name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingPhase?.status || "not_started"}>
                  <SelectTrigger data-testid="select-phase-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="completionPercentage">Progress (%)</Label>
                <Input 
                  id="completionPercentage" 
                  name="completionPercentage" 
                  type="number" 
                  min="0" 
                  max="100" 
                  defaultValue={editingPhase?.completionPercentage || 0}
                  data-testid="input-phase-progress"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedStartDate">Planned Start Date</Label>
                <Input 
                  id="plannedStartDate" 
                  name="plannedStartDate" 
                  type="date" 
                  defaultValue={editingPhase?.plannedStartDate || ""}
                  data-testid="input-phase-start-date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plannedEndDate">Planned End Date</Label>
                <Input 
                  id="plannedEndDate" 
                  name="plannedEndDate" 
                  type="date" 
                  defaultValue={editingPhase?.plannedEndDate || ""}
                  data-testid="input-phase-end-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                defaultValue={editingPhase?.notes || ""}
                placeholder="Add any notes about this phase..."
                data-testid="input-phase-notes"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPhaseDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPhaseMutation.isPending || updatePhaseMutation.isPending}
                data-testid="button-submit-phase"
              >
                {editingPhase?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Create a new task for this phase</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input id="title" name="title" required data-testid="input-task-title" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" data-testid="input-task-description" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger data-testid="select-task-priority">
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
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" data-testid="input-task-due-date" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MilestonesTab({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: milestones, isLoading } = useQuery<ProjectMilestone[]>({
    queryKey: ["/api/projects", projectId, "milestones"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/projects/${projectId}/milestones`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "milestones"] });
      toast({ title: "Milestone created" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create milestone", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      title: formData.get("title"),
      description: formData.get("description") || null,
      dueDate: formData.get("dueDate"),
      isCompleted: false,
    });
  };

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Project Milestones
            </CardTitle>
            <CardDescription>Key deliverables and checkpoints</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-milestone">
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {milestones && milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className="flex items-center justify-between p-4 rounded-lg border"
                data-testid={`milestone-item-${milestone.id}`}
              >
                <div className="flex items-center gap-3">
                  {milestone.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Flag className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {milestone.dueDate && (
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                    </span>
                  )}
                  <Badge variant={milestone.isCompleted ? "default" : "secondary"}>
                    {milestone.isCompleted ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No milestones added yet. Create your first milestone to track key deliverables.
          </p>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Create a new project milestone</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required data-testid="input-milestone-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" data-testid="input-milestone-description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" name="dueDate" type="date" required data-testid="input-milestone-due-date" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Go Back</Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-milestone">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function RisksTab({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: risks, isLoading } = useQuery<ProjectRisk[]>({
    queryKey: ["/api/projects", projectId, "risks"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/projects/${projectId}/risks`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "risks"] });
      toast({ title: "Risk added to register" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to add risk", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      title: formData.get("title"),
      description: formData.get("description") || null,
      probability: formData.get("probability"),
      impact: formData.get("impact"),
      mitigation: formData.get("mitigation") || null,
      status: "identified",
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Risk Register
            </CardTitle>
            <CardDescription>Track and mitigate project risks</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-risk">
            <Plus className="w-4 h-4 mr-2" />
            Add Risk
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {risks && risks.length > 0 ? (
          <div className="space-y-3">
            {risks.map((risk) => (
              <div 
                key={risk.id} 
                className="p-4 rounded-lg border space-y-2"
                data-testid={`risk-item-${risk.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{risk.title}</p>
                    {risk.description && (
                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                    )}
                  </div>
                  <Badge variant={getImpactColor(risk.impact || "medium") as any}>
                    {risk.impact || "medium"} impact
                  </Badge>
                </div>
                {risk.mitigation && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Mitigation: </span>
                    {risk.mitigation}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Probability: {risk.probability || "medium"}</span>
                  <span>Status: {risk.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No risks identified yet. Add risks to track and mitigate potential issues.
          </p>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Risk</DialogTitle>
            <DialogDescription>Identify and document a new project risk</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Risk Title *</Label>
              <Input id="title" name="title" required data-testid="input-risk-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" data-testid="input-risk-description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probability">Probability</Label>
                <Select name="probability" defaultValue="medium">
                  <SelectTrigger data-testid="select-risk-probability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="impact">Impact</Label>
                <Select name="impact" defaultValue="medium">
                  <SelectTrigger data-testid="select-risk-impact">
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
            <div className="space-y-2">
              <Label htmlFor="mitigation">Mitigation Strategy</Label>
              <Textarea id="mitigation" name="mitigation" placeholder="How will this risk be mitigated?" data-testid="input-risk-mitigation" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Go Back</Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-risk">
                Add Risk
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StepsTab({ projectId, phases }: { projectId: string; phases: ProjectPhase[] }) {
  const { toast } = useToast();
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: steps, isLoading } = useQuery<PhaseStep[]>({
    queryKey: ["/api/phases", selectedPhase, "steps"],
    enabled: !!selectedPhase,
  });

  const { data: calculatedProgress } = useQuery<{ phaseId: string; calculatedProgress: number }>({
    queryKey: ["/api/phases", selectedPhase, "progress"],
    enabled: !!selectedPhase,
  });

  const createStepMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/phases/${selectedPhase}/steps`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases", selectedPhase, "steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/phases", selectedPhase, "progress"] });
      toast({ title: "Step created successfully" });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create step", variant: "destructive" });
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/steps/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phases", selectedPhase, "steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/phases", selectedPhase, "progress"] });
      toast({ title: "Step updated" });
    },
    onError: () => {
      toast({ title: "Failed to update step", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const stepNumber = steps?.length ? Math.max(...steps.map(s => s.stepNumber)) + 1 : 1;
    createStepMutation.mutate({
      title: formData.get("title"),
      description: formData.get("description") || null,
      stepNumber,
      timelineWeeks: formData.get("timelineWeeks") || null,
      status: "not_started",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>;
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Phase Steps
          </CardTitle>
          <CardDescription>View and manage implementation steps for each phase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="max-w-md" data-testid="select-phase-for-steps">
                <SelectValue placeholder="Select a phase to view steps" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    Phase {phase.phaseNumber}: {phase.phaseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPhase && (
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-step">
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            )}
          </div>

          {selectedPhase && calculatedProgress && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Calculated Progress
                </span>
                <span className="text-lg font-bold">{calculatedProgress.calculatedProgress}%</span>
              </div>
              <Progress value={calculatedProgress.calculatedProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Based on completed steps (60%) and approved deliverables (40%)
              </p>
            </div>
          )}

          {selectedPhase && isLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          )}

          {selectedPhase && steps && steps.length > 0 && (
            <div className="space-y-3">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="p-4 rounded-lg border space-y-3"
                  data-testid={`step-item-${step.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${step.status === "completed" ? "bg-green-500 text-white" : 
                          step.status === "in_progress" ? "bg-blue-500 text-white" : 
                          "bg-muted text-muted-foreground"}`}>
                        {step.stepNumber}
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        {step.description && (
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        )}
                        {step.timelineWeeks && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Timeline: {step.timelineWeeks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(step.status)}
                      <Select 
                        value={step.status}
                        onValueChange={(value) => updateStepMutation.mutate({ id: step.id, data: { status: value } })}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-step-status-${step.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="skipped">Skipped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {step.keyActivities && step.keyActivities.length > 0 && (
                    <div className="ml-11 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Key Activities:</p>
                        <span className="text-xs text-muted-foreground">
                          {step.completedActivities?.length || 0} of {step.keyActivities.length} completed
                        </span>
                      </div>
                      <div className="space-y-1">
                        {step.keyActivities.map((activity, idx) => {
                          const isCompleted = step.completedActivities?.includes(idx) || false;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                const currentCompleted = step.completedActivities || [];
                                const newCompleted = isCompleted
                                  ? currentCompleted.filter((i: number) => i !== idx)
                                  : [...currentCompleted, idx];
                                updateStepMutation.mutate({ 
                                  id: step.id, 
                                  data: { completedActivities: newCompleted } 
                                });
                              }}
                              className="flex items-center gap-2 w-full text-left group hover-elevate p-1 rounded"
                              data-testid={`checkbox-activity-${step.id}-${idx}`}
                            >
                              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors
                                ${isCompleted 
                                  ? "bg-green-500 border-green-500" 
                                  : "border-muted-foreground/50 group-hover:border-primary"}`}
                              >
                                {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {activity}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <Progress 
                        value={((step.completedActivities?.length || 0) / step.keyActivities.length) * 100} 
                        className="h-1" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedPhase && steps && steps.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-8">
              No steps defined for this phase yet. Add steps to track implementation progress.
            </p>
          )}

          {!selectedPhase && phases.length > 0 && (
            <p className="text-center text-muted-foreground py-8">
              Select a phase above to view and manage its implementation steps.
            </p>
          )}

          {phases.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No phases found. Initialize phases for this project first.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
            <DialogDescription>Create a new implementation step for this phase</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Step Title *</Label>
              <Input id="title" name="title" required data-testid="input-step-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" data-testid="input-step-description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timelineWeeks">Timeline (weeks)</Label>
              <Input 
                id="timelineWeeks" 
                name="timelineWeeks" 
                placeholder="e.g., 2-3 weeks"
                data-testid="input-step-timeline" 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Go Back</Button>
              <Button type="submit" disabled={createStepMutation.isPending} data-testid="button-submit-step">
                Create Step
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
