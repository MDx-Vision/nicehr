import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Grid3X3, Users, Layers, X, Info } from "lucide-react";
import type {
  Project,
  ProjectPhase,
  RaciAssignment,
  ProjectTeamAssignmentWithUser,
} from "@shared/schema";

type RaciRole = "responsible" | "accountable" | "consulted" | "informed";

const RACI_CONFIG: Record<RaciRole, { label: string; short: string; color: string; description: string }> = {
  responsible: {
    label: "Responsible",
    short: "R",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
    description: "Does the work to complete the task",
  },
  accountable: {
    label: "Accountable",
    short: "A",
    color: "bg-green-500 hover:bg-green-600 text-white",
    description: "Ultimately accountable for the task completion",
  },
  consulted: {
    label: "Consulted",
    short: "C",
    color: "bg-amber-500 hover:bg-amber-600 text-white",
    description: "Provides input and expertise",
  },
  informed: {
    label: "Informed",
    short: "I",
    color: "bg-gray-500 hover:bg-gray-600 text-white",
    description: "Kept informed of progress",
  },
};

function RaciBadge({ role, onClick }: { role: RaciRole; onClick?: () => void }) {
  const config = RACI_CONFIG[role];
  return (
    <Badge
      className={`${config.color} cursor-pointer font-bold text-sm min-w-[28px] justify-center`}
      onClick={onClick}
      data-testid={`badge-raci-${role}`}
    >
      {config.short}
    </Badge>
  );
}

function EmptyCell({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-full min-h-[40px] flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-colors"
      data-testid="button-add-raci"
    >
      <span className="text-muted-foreground/50 text-xs">+</span>
    </button>
  );
}

interface RaciCellPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: RaciRole | null;
  onSelect: (role: RaciRole | null) => void;
  isLoading: boolean;
  phaseName: string;
  userName: string;
}

function RaciCellPopover({
  open,
  onOpenChange,
  currentRole,
  onSelect,
  isLoading,
  phaseName,
  userName,
}: RaciCellPopoverProps) {
  return (
    <PopoverContent className="w-72" align="center" data-testid="popover-raci-edit">
      <div className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">Edit RACI Assignment</h4>
          <p className="text-xs text-muted-foreground">
            {phaseName} - {userName}
          </p>
        </div>

        <RadioGroup
          value={currentRole || ""}
          onValueChange={(value) => onSelect(value as RaciRole)}
          className="space-y-2"
          disabled={isLoading}
          data-testid="radio-group-raci"
        >
          {(Object.entries(RACI_CONFIG) as [RaciRole, typeof RACI_CONFIG[RaciRole]][]).map(
            ([role, config]) => (
              <div
                key={role}
                className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={role}
                  id={`raci-${role}`}
                  data-testid={`radio-raci-${role}`}
                />
                <Label
                  htmlFor={`raci-${role}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={`${config.color} font-bold`}>
                      {config.short}
                    </Badge>
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </Label>
              </div>
            )
          )}
        </RadioGroup>

        {currentRole && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onSelect(null)}
            disabled={isLoading}
            data-testid="button-remove-raci"
          >
            <X className="w-4 h-4 mr-2" />
            Remove Assignment
          </Button>
        )}
      </div>
    </PopoverContent>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-[300px]" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ type }: { type: "no-project" | "no-data" }) {
  if (type === "no-project") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Grid3X3 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Select a Project
          </h3>
          <p className="text-sm text-muted-foreground/70 text-center max-w-md">
            Choose a project from the dropdown above to view and manage its RACI matrix assignments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No Team Members or Phases
        </h3>
        <p className="text-sm text-muted-foreground/70 text-center max-w-md">
          This project needs team members and phases configured before you can create RACI assignments.
        </p>
      </CardContent>
    </Card>
  );
}

function RaciLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="text-muted-foreground flex items-center gap-1">
        <Info className="w-4 h-4" />
        Legend:
      </span>
      {(Object.entries(RACI_CONFIG) as [RaciRole, typeof RACI_CONFIG[RaciRole]][]).map(
        ([role, config]) => (
          <div key={role} className="flex items-center gap-2">
            <Badge className={`${config.color} font-bold`}>{config.short}</Badge>
            <span className="text-muted-foreground">{config.label}</span>
          </div>
        )
      )}
    </div>
  );
}

interface RaciCellProps {
  phaseId: string;
  phaseName: string;
  userId: string;
  userName: string;
  assignment: RaciAssignment | undefined;
  projectId: string;
}

function RaciCell({
  phaseId,
  phaseName,
  userId,
  userName,
  assignment,
  projectId,
}: RaciCellProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (role: RaciRole) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/raci`, {
        phaseId,
        userId,
        role,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "raci"] });
      toast({ title: "RACI assignment created" });
      setOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create assignment", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (role: RaciRole) => {
      if (!assignment) return;
      const response = await apiRequest("PUT", `/api/raci/${assignment.id}`, { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "raci"] });
      toast({ title: "RACI assignment updated" });
      setOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update assignment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!assignment) return;
      await apiRequest("DELETE", `/api/raci/${assignment.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "raci"] });
      toast({ title: "RACI assignment removed" });
      setOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to remove assignment", variant: "destructive" });
    },
  });

  const handleSelect = (role: RaciRole | null) => {
    if (role === null) {
      deleteMutation.mutate();
    } else if (assignment) {
      updateMutation.mutate(role);
    } else {
      createMutation.mutate(role);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-center p-1">
          {assignment ? (
            <RaciBadge role={assignment.role as RaciRole} onClick={() => setOpen(true)} />
          ) : (
            <EmptyCell onClick={() => setOpen(true)} />
          )}
        </div>
      </PopoverTrigger>
      <RaciCellPopover
        open={open}
        onOpenChange={setOpen}
        currentRole={assignment?.role as RaciRole | null}
        onSelect={handleSelect}
        isLoading={isLoading}
        phaseName={phaseName}
        userName={userName}
      />
    </Popover>
  );
}

export default function RaciMatrix() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: phases, isLoading: phasesLoading } = useQuery<ProjectPhase[]>({
    queryKey: ["/api/projects", selectedProjectId, "phases"],
    enabled: !!selectedProjectId,
  });

  const { data: teamMembers, isLoading: teamLoading } = useQuery<ProjectTeamAssignmentWithUser[]>({
    queryKey: ["/api/projects", selectedProjectId, "team"],
    enabled: !!selectedProjectId,
  });

  const { data: raciAssignments, isLoading: raciLoading, error: raciError } = useQuery<RaciAssignment[]>({
    queryKey: ["/api/projects", selectedProjectId, "raci"],
    enabled: !!selectedProjectId,
  });

  if (raciError) {
    toast({
      title: "Error",
      description: "Failed to load RACI assignments. You may not have permission to view this data.",
      variant: "destructive",
    });
  }

  const isLoading = projectsLoading || (selectedProjectId && (phasesLoading || teamLoading || raciLoading));

  const getAssignment = (phaseId: string, userId: string): RaciAssignment | undefined => {
    return raciAssignments?.find(
      (a) => a.phaseId === phaseId && a.userId === userId
    );
  };

  const getTeamMemberName = (member: ProjectTeamAssignmentWithUser): string => {
    if (member.user.firstName || member.user.lastName) {
      return `${member.user.firstName || ""} ${member.user.lastName || ""}`.trim();
    }
    return member.user.email || "Unknown";
  };

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);
  const hasData = phases && phases.length > 0 && teamMembers && teamMembers.length > 0;

  if (projectsLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-raci-matrix-title">
            RACI Matrix
          </h1>
          <p className="text-muted-foreground">
            Define roles and responsibilities for project phases
          </p>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-[300px]" data-testid="select-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id} data-testid={`select-option-project-${project.id}`}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProjectId && <EmptyState type="no-project" />}

      {selectedProjectId && isLoading && <LoadingSkeleton />}

      {selectedProjectId && !isLoading && !hasData && <EmptyState type="no-data" />}

      {selectedProjectId && !isLoading && hasData && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  {selectedProject?.name} - RACI Matrix
                </CardTitle>
                <CardDescription>
                  Click on any cell to assign or edit RACI roles for team members
                </CardDescription>
              </div>
              <RaciLegend />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table data-testid="table-raci-matrix">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          Phase / Task
                        </div>
                      </TableHead>
                      {teamMembers.map((member) => (
                        <TableHead
                          key={member.id}
                          className="min-w-[100px] text-center"
                          data-testid={`table-head-member-${member.user.id}`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-medium truncate max-w-[90px]">
                              {getTeamMemberName(member)}
                            </span>
                            {member.roleTemplate?.name && (
                              <Badge variant="outline" className="text-xs">
                                {member.roleTemplate.name}
                              </Badge>
                            )}
                            {member.customRoleName && !member.roleTemplate && (
                              <Badge variant="outline" className="text-xs">
                                {member.customRoleName}
                              </Badge>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phases.map((phase) => (
                      <TableRow key={phase.id} data-testid={`table-row-phase-${phase.id}`}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                ${phase.status === "completed"
                                  ? "bg-green-500 text-white"
                                  : phase.status === "in_progress"
                                  ? "bg-blue-500 text-white"
                                  : "bg-muted text-muted-foreground"
                                }`}
                            >
                              {phase.phaseNumber}
                            </div>
                            <span className="truncate max-w-[160px]" title={phase.phaseName}>
                              {phase.phaseName}
                            </span>
                          </div>
                        </TableCell>
                        {teamMembers.map((member) => (
                          <TableCell
                            key={`${phase.id}-${member.user.id}`}
                            className="text-center"
                            data-testid={`table-cell-${phase.id}-${member.user.id}`}
                          >
                            <RaciCell
                              phaseId={phase.id}
                              phaseName={phase.phaseName}
                              userId={member.user.id}
                              userName={getTeamMemberName(member)}
                              assignment={getAssignment(phase.id, member.user.id)}
                              projectId={selectedProjectId}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary Statistics</CardTitle>
              <CardDescription>
                Overview of RACI assignments for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.entries(RACI_CONFIG) as [RaciRole, typeof RACI_CONFIG[RaciRole]][]).map(
                  ([role, config]) => {
                    const count = raciAssignments?.filter((a) => a.role === role).length || 0;
                    return (
                      <div
                        key={role}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                        data-testid={`summary-${role}`}
                      >
                        <Badge className={`${config.color} font-bold text-lg min-w-[36px] justify-center`}>
                          {config.short}
                        </Badge>
                        <div>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
