import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface PermissionsData {
  role: string | null;
  restrictedPages: string[];
  restrictedFeatures: string[];
}

interface PermissionsContextValue {
  permissions: PermissionsData | null;
  isLoading: boolean;
  error: Error | null;
  hasPageAccess: (pageKey: string) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  canAccessRole: (requiredRoles: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { data: permissions, isLoading, error } = useQuery<PermissionsData>({
    queryKey: ['/api/permissions'],
    staleTime: 60000,
    refetchOnWindowFocus: true,
  });

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

  return (
    <PermissionsContext.Provider
      value={{
        permissions: permissions || null,
        isLoading,
        error: error as Error | null,
        hasPageAccess,
        hasFeatureAccess,
        canAccessRole,
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
