import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { type UserRoleLevel } from "@/lib/permissions";

interface PermissionsData {
  role: string | null;
  roleLevel: UserRoleLevel;
  isLeadership: boolean;
  hospitalId: string | null;
  assignedProjectIds: string[];
  restrictedPages: string[];
  restrictedFeatures: string[];
}

interface PermissionsContextValue {
  permissions: PermissionsData | null;
  isLoading: boolean;
  error: Error | null;
  roleLevel: UserRoleLevel;
  isLeadership: boolean;
  assignedProjectIds: string[];
  hospitalId: string | null;
  hasPageAccess: (pageKey: string) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  canAccessRole: (requiredRoles: string[]) => boolean;
  canAccessProject: (projectId: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { data: permissions, isLoading, error } = useQuery<PermissionsData>({
    queryKey: ['/api/permissions'],
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  // Use roleLevel from API, default to consultant
  const roleLevel: UserRoleLevel = permissions?.roleLevel || 'consultant';
  
  const isLeadership = permissions?.isLeadership || false;
  const assignedProjectIds = permissions?.assignedProjectIds || [];
  const hospitalId = permissions?.hospitalId || null;

  const hasPageAccess = (pageKey: string): boolean => {
    if (!permissions) return true;
    return !permissions.restrictedPages.includes(pageKey);
  };

  const hasFeatureAccess = (featureKey: string): boolean => {
    if (!permissions) return true;
    return !permissions.restrictedFeatures.includes(featureKey);
  };

  const canAccessRole = (requiredRoles: string[]): boolean => {
    if (!permissions || !permissions.role) return false;
    return requiredRoles.includes(permissions.role);
  };
  
  const canAccessProject = (projectId: string): boolean => {
    if (!permissions) return true;
    if (permissions.role === 'admin') return true;
    return assignedProjectIds.includes(projectId);
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions: permissions || null,
        isLoading,
        error: error as Error | null,
        roleLevel,
        isLeadership,
        assignedProjectIds,
        hospitalId,
        hasPageAccess,
        hasFeatureAccess,
        canAccessRole,
        canAccessProject,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
