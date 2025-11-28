import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { type UserRoleLevel, type NavigationItem } from "@/lib/permissions";
import { getDevRoleOverride } from "@/components/DevRoleSwitcher";

interface PermissionsData {
  role: string | null;
  roleLevel: UserRoleLevel;
  isLeadership: boolean;
  hospitalId: string | null;
  assignedProjectIds: string[];
  restrictedPages: string[];
  restrictedFeatures: string[];
}

interface EffectivePermission {
  permissionId: string;
  permissionName: string;
  domain: string;
  action: string;
}

interface PermissionsContextValue {
  permissions: PermissionsData | null;
  effectivePermissions: EffectivePermission[];
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
  hasPermission: (permissionName: string) => boolean;
  hasNavAccess: (item: NavigationItem) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const devRoleOverride = getDevRoleOverride();
  
  // Use dev endpoints when dev mode is active
  const permissionsEndpoint = devRoleOverride 
    ? `/api/dev/permissions/${devRoleOverride}` 
    : '/api/permissions';
    
  const effectivePermissionsEndpoint = devRoleOverride 
    ? `/api/dev/effective-permissions/${devRoleOverride}` 
    : '/api/rbac/effective-permissions';

  const { data: permissions, isLoading, error } = useQuery<PermissionsData>({
    queryKey: [permissionsEndpoint],
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  const { data: effectivePermissionsData = [] } = useQuery<EffectivePermission[]>({
    queryKey: [effectivePermissionsEndpoint],
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  const roleLevel: UserRoleLevel = permissions?.roleLevel || 'consultant';
  
  const isLeadership = permissions?.isLeadership || false;
  const assignedProjectIds = permissions?.assignedProjectIds || [];
  const hospitalId = permissions?.hospitalId || null;

  const permissionSet = useMemo(() => {
    return new Set(effectivePermissionsData.map(p => p.permissionName));
  }, [effectivePermissionsData]);

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

  const hasPermission = (permissionName: string): boolean => {
    if (roleLevel === 'admin') return true;
    return permissionSet.has(permissionName);
  };

  const hasNavAccess = (item: NavigationItem): boolean => {
    if (!item.roles.includes(roleLevel)) return false;
    if (!hasPageAccess(item.url)) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    return true;
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions: permissions || null,
        effectivePermissions: effectivePermissionsData,
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
        hasPermission,
        hasNavAccess,
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
