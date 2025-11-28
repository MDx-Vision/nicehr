import { useQuery } from "@tanstack/react-query";
import { useProjectContext } from "@/hooks/use-project-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import type { Project } from "@shared/schema";

interface ProjectSelectorProps {
  className?: string;
  showAllOption?: boolean;
}

export function ProjectSelector({ className, showAllOption = false }: ProjectSelectorProps) {
  const { 
    assignedProjectIds, 
    selectedProjectId, 
    setSelectedProjectId, 
    isAdmin,
    hasMultipleProjects 
  } = useProjectContext();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const accessibleProjects = isAdmin 
    ? projects 
    : projects.filter(p => assignedProjectIds.includes(p.id));

  if (accessibleProjects.length === 0) {
    return null;
  }

  if (!isAdmin && !hasMultipleProjects && !showAllOption) {
    return null;
  }

  return (
    <div className={className}>
      <Select
        value={selectedProjectId || "all"}
        onValueChange={(value) => setSelectedProjectId(value === "all" ? null : value)}
      >
        <SelectTrigger 
          className="w-[220px]" 
          data-testid="select-project"
        >
          <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {(isAdmin || showAllOption) && (
            <SelectItem value="all" data-testid="select-project-all">
              All Projects
            </SelectItem>
          )}
          {accessibleProjects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id}
              data-testid={`select-project-${project.id}`}
            >
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
