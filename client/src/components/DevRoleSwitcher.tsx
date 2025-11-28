import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, User, Shield, Building2, X, Users, Wrench, GraduationCap, Headphones, CheckCircle, Sparkles, ArrowRightLeft } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const DEV_ROLE_KEY = "nicehr_dev_role_override";

interface DevRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  roleType: 'base' | 'implementation' | 'custom';
}

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  hospital_leadership: Building2,
  hospital_staff: Building2,
  consultant: User,
  implementation_project_manager: Users,
  go_live_coordinator: Sparkles,
  training_lead: GraduationCap,
  command_center_manager: Headphones,
  application_analyst: Wrench,
  support_desk_lead: Headphones,
  quality_assurance_lead: CheckCircle,
  at_the_elbow_support: User,
  super_user: User,
  optimization_analyst: Wrench,
  stabilization_lead: CheckCircle,
  transition_coordinator: ArrowRightLeft,
};

export function getDevRoleOverride(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEV_ROLE_KEY);
}

export function DevRoleSwitcher() {
  const [overrideRole, setOverrideRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: roles = [] } = useQuery<DevRole[]>({
    queryKey: ['/api/dev/roles'],
    staleTime: 300000,
    enabled: isOpen,
  });

  useEffect(() => {
    setOverrideRole(getDevRoleOverride());
  }, []);

  const handleSelectRole = (role: string) => {
    localStorage.setItem(DEV_ROLE_KEY, role);
    setOverrideRole(role);
    setIsOpen(false);
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
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ predicate: (query) => {
      const key = query.queryKey[0]?.toString() ?? '';
      return key.includes('/api/permissions') ||
        key.includes('/api/rbac/effective-permissions') ||
        key.includes('/api/dev/');
    }});
    window.location.reload();
  };

  const activeRole = roles.find(r => r.name === overrideRole);
  
  const baseRoles = roles.filter(r => r.roleType === 'base');
  const implementationRoles = roles.filter(r => r.roleType === 'implementation');
  const customRoles = roles.filter(r => r.roleType === 'custom');

  const getIcon = (roleName: string) => {
    return ROLE_ICONS[roleName] || User;
  };

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
              Testing: {activeRole?.displayName || overrideRole}
            </>
          ) : (
            "Dev Mode"
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Test Different Roles
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {baseRoles.length > 0 && (
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                Base Roles
              </DropdownMenuLabel>
              {baseRoles.map((role) => {
                const Icon = getIcon(role.name);
                const isActive = overrideRole === role.name;
                return (
                  <DropdownMenuItem
                    key={role.name}
                    onClick={() => handleSelectRole(role.name)}
                    className="cursor-pointer"
                    data-testid={`menu-item-role-${role.name}`}
                  >
                    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{role.displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">{role.description}</div>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">Active</Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          )}
          
          {implementationRoles.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                  Implementation Roles
                </DropdownMenuLabel>
                {implementationRoles.map((role) => {
                  const Icon = getIcon(role.name);
                  const isActive = overrideRole === role.name;
                  return (
                    <DropdownMenuItem
                      key={role.name}
                      onClick={() => handleSelectRole(role.name)}
                      className="cursor-pointer"
                      data-testid={`menu-item-role-${role.name}`}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{role.displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">{role.description}</div>
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">Active</Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </>
          )}
          
          {customRoles.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                  Custom Roles
                </DropdownMenuLabel>
                {customRoles.map((role) => {
                  const Icon = getIcon(role.name);
                  const isActive = overrideRole === role.name;
                  return (
                    <DropdownMenuItem
                      key={role.name}
                      onClick={() => handleSelectRole(role.name)}
                      className="cursor-pointer"
                      data-testid={`menu-item-role-${role.name}`}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{role.displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">{role.description}</div>
                      </div>
                      {isActive && (
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">Active</Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </>
          )}
        </ScrollArea>
        
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
