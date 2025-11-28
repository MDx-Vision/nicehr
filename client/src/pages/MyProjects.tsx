import { useQuery } from "@tanstack/react-query";
import { useProjectContext } from "@/hooks/use-project-context";
import { ProjectSelector } from "@/components/ProjectSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, Users, DollarSign, FolderKanban } from "lucide-react";
import { format } from "date-fns";
import type { Project, Hospital } from "@shared/schema";

export default function MyProjects() {
  const { 
    assignedProjectIds, 
    selectedProjectId, 
    filterByProject, 
    isAdmin, 
    hasMultipleProjects 
  } = useProjectContext();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: hospitals = [] } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  const hospitalMap = hospitals.reduce((acc, h) => {
    acc[h.id] = h;
    return acc;
  }, {} as Record<string, Hospital>);

  const accessibleProjects = isAdmin 
    ? projects 
    : projects.filter(p => assignedProjectIds.includes(p.id));

  const displayedProjects = selectedProjectId 
    ? accessibleProjects.filter(p => p.id === selectedProjectId)
    : accessibleProjects;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'on_hold': return 'outline';
      case 'draft': return 'outline';
      case 'planning': return 'outline';
      default: return 'secondary';
    }
  };

  if (projectsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-[220px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-my-projects-title">
            <FolderKanban className="h-6 w-6" />
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? "View and manage all projects" 
              : `You have access to ${assignedProjectIds.length} project${assignedProjectIds.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        {(isAdmin || hasMultipleProjects) && (
          <ProjectSelector showAllOption={isAdmin} />
        )}
      </div>

      {displayedProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground" data-testid="text-no-projects">
              No projects assigned
            </p>
            <p className="text-sm text-muted-foreground">
              You will see your projects here once assigned by an administrator
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project) => {
            const hospital = hospitalMap[project.hospitalId];
            return (
              <Card 
                key={project.id} 
                className="hover-elevate cursor-pointer"
                data-testid={`card-project-${project.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2" data-testid={`text-project-name-${project.id}`}>
                      {project.name}
                    </CardTitle>
                    <Badge variant={getStatusColor(project.status)} data-testid={`badge-project-status-${project.id}`}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {hospital && (
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {hospital.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm pt-2 border-t">
                    {project.estimatedConsultants !== null && project.estimatedConsultants > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{project.actualConsultants || 0} / {project.estimatedConsultants} consultants</span>
                      </div>
                    )}
                    {project.estimatedBudget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${Number(project.estimatedBudget).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
