import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bug, User, Shield, Building2, X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const DEV_ROLE_KEY = "nicehr_dev_role_override";

const ROLES = [
  { value: "admin", label: "Admin", icon: Shield, description: "Full system access" },
  { value: "consultant", label: "Consultant", icon: User, description: "Consultant view" },
  { value: "hospital_staff", label: "Hospital Staff", icon: Building2, description: "Hospital staff view" },
] as const;

export function getDevRoleOverride(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEV_ROLE_KEY);
}

export function DevRoleSwitcher() {
  const [overrideRole, setOverrideRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setOverrideRole(getDevRoleOverride());
  }, []);

  const handleSelectRole = (role: string) => {
    localStorage.setItem(DEV_ROLE_KEY, role);
    setOverrideRole(role);
    setIsOpen(false);
    // Invalidate all auth and permissions queries
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ predicate: (query) => {
      const key = query.queryKey[0]?.toString() ?? '';
      return key.includes('/api/permissions') ||
        key.includes('/api/rbac/effective-permissions') ||
        key.includes('/api/dev/');
    }});
    window.location.reload();
  };

  const handleClearOverride = () => {
    localStorage.removeItem(DEV_ROLE_KEY);
    setOverrideRole(null);
    setIsOpen(false);
    // Invalidate all auth and permissions queries
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ predicate: (query) => {
      const key = query.queryKey[0]?.toString() ?? '';
      return key.includes('/api/permissions') ||
        key.includes('/api/rbac/effective-permissions') ||
        key.includes('/api/dev/');
    }});
    window.location.reload();
  };

  const activeRole = ROLES.find(r => r.value === overrideRole);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={overrideRole ? "default" : "outline"} 
          size="sm" 
          className="gap-2"
          data-testid="button-dev-role-switcher"
        >
          <Bug className="h-4 w-4" />
          {overrideRole ? (
            <>
              Testing: {activeRole?.label}
            </>
          ) : (
            "Dev Mode"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Test Different Roles
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = overrideRole === role.value;
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => handleSelectRole(role.value)}
              className="cursor-pointer"
              data-testid={`menu-item-role-${role.value}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              <div className="flex-1">
                <div className="font-medium">{role.label}</div>
                <div className="text-xs text-muted-foreground">{role.description}</div>
              </div>
              {isActive && (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              )}
            </DropdownMenuItem>
          );
        })}
        {overrideRole && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleClearOverride}
              className="cursor-pointer text-destructive"
              data-testid="menu-item-clear-override"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Override (Use Real Role)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
