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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/use-permissions";

const adminItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Hospitals", url: "/hospitals", icon: Building2 },
  { title: "Consultants", url: "/consultants", icon: Users },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Project Phases", url: "/project-phases", icon: Layers },
  { title: "Command Center", url: "/command-center", icon: Radio },
  { title: "Onboarding", url: "/onboarding", icon: ClipboardCheck },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Login Labs", url: "/login-labs", icon: Monitor },
  { title: "Knowledge Base", url: "/knowledge-base", icon: Book },
  { title: "Support Tickets", url: "/support-tickets", icon: Ticket },
  { title: "EOD Reports", url: "/eod-reports", icon: FileCheck },
  { title: "Escalation", url: "/escalation-management", icon: AlertTriangle },
  { title: "Schedules", url: "/schedules", icon: Calendar },
  { title: "Timesheets", url: "/timesheets", icon: Clock },
  { title: "Availability", url: "/availability", icon: CalendarDays },
  { title: "Shift Swaps", url: "/shift-swaps", icon: ArrowLeftRight },
  { title: "Travel Preferences", url: "/travel-preferences", icon: Plane },
  { title: "Travel Bookings", url: "/travel-bookings", icon: Luggage },
  { title: "Transportation", url: "/transportation", icon: Bus },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Payroll", url: "/payroll", icon: Banknote },
  { title: "Budget Calculator", url: "/budget", icon: Calculator },
  { title: "ROI Dashboard", url: "/roi", icon: BarChart3 },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Search", url: "/search", icon: Search },
];

const consultantItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "My Profile", url: "/profile", icon: Users },
  { title: "My Onboarding", url: "/onboarding", icon: ClipboardCheck },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Login Labs", url: "/login-labs", icon: Monitor },
  { title: "Knowledge Base", url: "/knowledge-base", icon: Book },
  { title: "Support Tickets", url: "/support-tickets", icon: Ticket },
  { title: "EOD Reports", url: "/eod-reports", icon: FileCheck },
  { title: "Command Center", url: "/command-center", icon: Radio },
  { title: "My Schedule", url: "/my-schedule", icon: Calendar },
  { title: "Timesheets", url: "/timesheets", icon: Clock },
  { title: "Availability", url: "/availability", icon: CalendarDays },
  { title: "Shift Swaps", url: "/shift-swaps", icon: ArrowLeftRight },
  { title: "Travel Preferences", url: "/travel-preferences", icon: Plane },
  { title: "Travel Bookings", url: "/travel-bookings", icon: Luggage },
  { title: "Transportation", url: "/transportation", icon: Bus },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Payroll", url: "/payroll", icon: Banknote },
  { title: "Documents", url: "/my-documents", icon: FileText },
];

const hospitalStaffItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Login Labs", url: "/login-labs", icon: Monitor },
  { title: "Knowledge Base", url: "/knowledge-base", icon: Book },
  { title: "Support Tickets", url: "/support-tickets", icon: Ticket },
  { title: "Command Center", url: "/command-center", icon: Radio },
  { title: "Schedules", url: "/schedules", icon: Calendar },
  { title: "Timesheets", url: "/timesheets", icon: Clock },
  { title: "Shift Swaps", url: "/shift-swaps", icon: ArrowLeftRight },
  { title: "Transportation", url: "/transportation", icon: Bus },
  { title: "Invoices", url: "/invoices", icon: Receipt },
  { title: "Consultants", url: "/consultants", icon: Users },
  { title: "ROI Survey", url: "/roi-survey", icon: BarChart3 },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, isAdmin, isConsultant, isHospitalStaff } = useAuth();
  const { hasPageAccess } = usePermissions();

  const getMenuItems = () => {
    if (isAdmin) return adminItems;
    if (isConsultant) return consultantItems;
    if (isHospitalStaff) return hospitalStaffItems;
    return adminItems;
  };

  const allMenuItems = getMenuItems();
  const menuItems = allMenuItems.filter(item => hasPageAccess(item.url));

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
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
            <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ") || "User"}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
