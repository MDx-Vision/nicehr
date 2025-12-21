import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const DEV_ROLE_KEY = "nicehr_dev_role_override";

function getDevRoleOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(DEV_ROLE_KEY);
  } catch {
    return null;
  }
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const devRoleOverride = getDevRoleOverride();
  const effectiveRole = devRoleOverride || user?.role;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: effectiveRole === "admin",
    isHospitalStaff: effectiveRole === "hospital_staff",
    isConsultant: effectiveRole === "consultant",
    effectiveRole,
    actualRole: user?.role,
    isDevModeActive: !!devRoleOverride,
    error,
  };
}
