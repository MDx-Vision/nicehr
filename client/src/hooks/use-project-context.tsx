import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usePermissions } from "./use-permissions";

interface ProjectContextValue {
  assignedProjectIds: string[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isProjectAccessible: (projectId: string) => boolean;
  filterByProject: <T extends { projectId?: string | null }>(items: T[]) => T[];
  hasMultipleProjects: boolean;
  isAdmin: boolean;
  isConsultant: boolean;
  isHospitalStaff: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = "nicehr_selected_project";

export function ProjectContextProvider({ children }: { children: ReactNode }) {
  const { roleLevel, assignedProjectIds, hospitalId } = usePermissions();
  
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  const isAdmin = roleLevel === "admin";
  const isConsultant = roleLevel === "consultant";
  const isHospitalStaff = roleLevel === "hospital_staff" || roleLevel === "hospital_leadership";

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem(STORAGE_KEY, selectedProjectId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (!isAdmin && assignedProjectIds.length > 0 && !selectedProjectId) {
      setSelectedProjectIdState(assignedProjectIds[0]);
    }
    if (!isAdmin && selectedProjectId && assignedProjectIds.length > 0) {
      if (!assignedProjectIds.includes(selectedProjectId)) {
        setSelectedProjectIdState(assignedProjectIds[0]);
      }
    }
  }, [assignedProjectIds, isAdmin, selectedProjectId]);

  const setSelectedProjectId = (id: string | null) => {
    setSelectedProjectIdState(id);
  };

  const isProjectAccessible = (projectId: string): boolean => {
    if (isAdmin) return true;
    return assignedProjectIds.includes(projectId);
  };

  const filterByProject = <T extends { projectId?: string | null }>(items: T[]): T[] => {
    if (isAdmin) return items;
    
    if (selectedProjectId) {
      return items.filter(item => item.projectId === selectedProjectId);
    }
    
    return items.filter(item => 
      item.projectId && assignedProjectIds.includes(item.projectId)
    );
  };

  const hasMultipleProjects = assignedProjectIds.length > 1;

  return (
    <ProjectContext.Provider
      value={{
        assignedProjectIds,
        selectedProjectId,
        setSelectedProjectId,
        isProjectAccessible,
        filterByProject,
        hasMultipleProjects,
        isAdmin,
        isConsultant,
        isHospitalStaff,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectContextProvider");
  }
  return context;
}
