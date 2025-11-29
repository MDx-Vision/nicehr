import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  Calendar,
  Calculator,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Search,
  UserCog,
  Shield,
  Activity,
  LineChart,
  Layers,
  ClipboardCheck,
  Radio,
  Clock,
  CalendarDays,
  ArrowLeftRight,
  GraduationCap,
  Book,
  Monitor,
  Ticket,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Receipt,
  Banknote,
  TrendingUp,
  Plane,
  Luggage,
  Bus,
  Target,
  Award,
  ShieldCheck,
  FileSignature,
  MessageCircle,
  UserCheck,
  FileBarChart,
  Gauge,
  KeyRound,
  UserPlus,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/use-permissions";
import { 
  getGroupedNavigation, 
  CATEGORY_LABELS, 
  CATEGORY_ORDER,
  type NavigationItem 
} from "@/lib/permissions";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  Calendar,
  Calculator,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Search,
  UserCog,
  Shield,
  Activity,
  LineChart,
  Layers,
  ClipboardCheck,
  Radio,
  Clock,
  CalendarDays,
  ArrowLeftRight,
  GraduationCap,
  Book,
  Monitor,
  Ticket,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Receipt,
  Banknote,
  TrendingUp,
  Plane,
  Luggage,
  Bus,
  Target,
  Award,
  ShieldCheck,
  FileSignature,
  MessageCircle,
  UserCheck,
  FileBarChart,
  Gauge,
  KeyRound,
  Link2,
};

function getRoleBadge(roleLevel: string, isLeadership: boolean) {
  switch (roleLevel) {
    case 'admin':
      return <Badge variant="default" className="text-xs">Admin</Badge>;
    case 'hospital_leadership':
      return <Badge variant="secondary" className="text-xs">Leadership</Badge>;
    case 'hospital_staff':
      return <Badge variant="outline" className="text-xs">Hospital Staff</Badge>;
    case 'consultant':
      return <Badge variant="outline" className="text-xs">Consultant</Badge>;
    default:
      return null;
  }
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAdmin } = useAuth();
  const { roleLevel, hasNavAccess, isLeadership, assignedProjectIds } = usePermissions();

  const groupedNavigation = getGroupedNavigation(roleLevel);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const renderNavItem = (item: NavigationItem) => {
    const Icon = ICON_MAP[item.icon] || LayoutDashboard;
    
    if (!hasNavAccess(item)) {
      return null;
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={location === item.url}
          data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <Link href={item.url}>
            <Icon className="w-4 h-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">NICEHR Group</span>
            <div className="flex items-center gap-1">
              {getRoleBadge(roleLevel, isLeadership)}
            </div>
          </div>
        </div>
        {assignedProjectIds.length > 0 && roleLevel !== 'admin' && (
          <div className="mt-2 text-xs text-muted-foreground">
            {assignedProjectIds.length} project{assignedProjectIds.length !== 1 ? 's' : ''} assigned
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {CATEGORY_ORDER.map((category) => {
          const items = groupedNavigation[category];
          if (!items || items.length === 0) return null;

          const filteredItems = items.filter(item => hasNavAccess(item));
          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{CATEGORY_LABELS[category]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map(renderNavItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/account"}
                  data-testid="nav-account"
                >
                  <Link href="/account">
                    <UserCog className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/profile"}
                  data-testid="nav-profile"
                >
                  <Link href="/profile">
                    <Users className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/settings"}
                    data-testid="nav-settings"
                  >
                    <Link href="/settings">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/access-control"}
                    data-testid="nav-access-control"
                  >
                    <Link href="/access-control">
                      <Shield className="w-4 h-4" />
                      <span>Access Control</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/staff-invitations"}
                    data-testid="nav-staff-invitations"
                  >
                    <Link href="/staff-invitations">
                      <UserPlus className="w-4 h-4" />
                      <span>Staff Invitations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/activity-log"}
                    data-testid="nav-activity-log"
                  >
                    <Link href="/activity-log">
                      <Activity className="w-4 h-4" />
                      <span>Activity Log</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/budget-modeling"}
                    data-testid="nav-budget-modeling"
                  >
                    <Link href="/budget-modeling">
                      <TrendingUp className="w-4 h-4" />
                      <span>Budget Modeling</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          asChild
          data-testid="button-logout"
        >
          <a href="/api/logout">
            <LogOut className="w-4 h-4" />
            Sign Out
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
