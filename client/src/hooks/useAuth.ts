import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { getDevRoleOverride } from "@/components/DevRoleSwitcher";

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
