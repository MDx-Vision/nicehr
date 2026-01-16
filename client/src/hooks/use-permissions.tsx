import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { type UserRoleLevel, type NavigationItem } from "@/lib/permissions";

const DEV_ROLE_KEY = "nicehr_dev_role_override";

function getDevRoleOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DEV_ROLE_KEY);
  } catch {
    return null;
  }
}

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

const EMPTY_ARRAY: string[] = [];

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const devRoleOverride = getDevRoleOverride();

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

  const { data: effectivePermissionsData = EMPTY_ARRAY as unknown as EffectivePermission[] } = useQuery<EffectivePermission[]>({
    queryKey: [effectivePermissionsEndpoint],
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

  // Use dev role override as initial fallback to prevent flickering
  const initialRoleLevel: UserRoleLevel = (devRoleOverride as UserRoleLevel) || 'admin';
  const roleLevel: UserRoleLevel = permissions?.roleLevel || initialRoleLevel;

  const isLeadership = permissions?.isLeadership || false;
  const assignedProjectIds = permissions?.assignedProjectIds || EMPTY_ARRAY;
  const hospitalId = permissions?.hospitalId || null;

  const permissionSet = useMemo(() => {
    return new Set(effectivePermissionsData.map(p => p.permissionName));
  }, [effectivePermissionsData]);

  const hasPageAccess = useCallback((pageKey: string): boolean => {
    if (!permissions) return true;
    return !permissions.restrictedPages.includes(pageKey);
  }, [permissions]);

  const hasFeatureAccess = useCallback((featureKey: string): boolean => {
    if (!permissions) return true;
    return !permissions.restrictedFeatures.includes(featureKey);
  }, [permissions]);

  const canAccessRole = useCallback((requiredRoles: string[]): boolean => {
    if (!permissions || !permissions.role) return false;
    return requiredRoles.includes(permissions.role);
  }, [permissions]);

  const canAccessProject = useCallback((projectId: string): boolean => {
    if (!permissions) return true;
    if (permissions.role === 'admin') return true;
    return assignedProjectIds.includes(projectId);
  }, [permissions, assignedProjectIds]);

  const hasPermission = useCallback((permissionName: string): boolean => {
    if (roleLevel === 'admin') return true;
    return permissionSet.has(permissionName);
  }, [roleLevel, permissionSet]);

  const hasNavAccess = useCallback((item: NavigationItem): boolean => {
    if (!item.roles.includes(roleLevel)) return false;
    if (!hasPageAccess(item.url)) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    return true;
  }, [roleLevel, hasPageAccess, hasPermission]);

  const contextValue = useMemo(() => ({
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
  }), [
    permissions,
    effectivePermissionsData,
    isLoading,
    error,
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
  ]);

  return (
    <PermissionsContext.Provider value={contextValue}>
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
