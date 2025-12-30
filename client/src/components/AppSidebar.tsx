import { useState, useEffect } from "react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Building2,
  Users,
  UsersRound,
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
  Star,
  ChevronRight,
  Briefcase,
  HeadphonesIcon,
  PieChart,
  Command,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/use-permissions";
import { useNotificationCounts } from "@/hooks/useNotificationCounts";
import { cn } from "@/lib/utils";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, Users, UsersRound, FolderKanban, Calendar, Calculator,
  BarChart3, FileText, Settings, LogOut, Search, UserCog, Shield, Activity,
  LineChart, Layers, ClipboardCheck, Radio, Clock, CalendarDays, ArrowLeftRight,
  GraduationCap, Book, Monitor, Ticket, FileCheck, AlertTriangle, DollarSign,
  Receipt, Banknote, TrendingUp, Plane, Luggage, Bus, Target, Award, ShieldCheck,
  FileSignature, MessageCircle, UserCheck, FileBarChart, Gauge, KeyRound, Link2,
  Star, Briefcase, HeadphonesIcon, PieChart, Sparkles, Video,
};

// Simplified navigation structure
interface NavItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  roles: string[];
  badge?: number | string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
  roles: string[];
  defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "work",
    label: "Work",
    icon: "Briefcase",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: true,
    items: [
      { id: "dashboard", title: "Dashboard", url: "/", icon: "LayoutDashboard", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "projects", title: "Projects", url: "/projects", icon: "FolderKanban", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "project-phases", title: "Project Phases", url: "/project-phases", icon: "Layers", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "raci-matrix", title: "RACI Matrix", url: "/raci-matrix", icon: "ClipboardCheck", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "my-projects", title: "My Projects", url: "/my-projects", icon: "FolderKanban", roles: ["consultant"] },
      { id: "hospitals", title: "Hospitals", url: "/hospitals", icon: "Building2", roles: ["admin"] },
      { id: "consultants", title: "People", url: "/consultants", icon: "Users", roles: ["admin", "hospital_leadership"] },
    ],
  },
  {
    id: "dischedule",
    label: "DiSChedule",
    icon: "Sparkles",
    roles: ["admin", "hospital_leadership"],
    defaultOpen: false,
    items: [
      { id: "disc-dashboard", title: "Dashboard", url: "/disc", icon: "Target", roles: ["admin", "hospital_leadership"] },
      { id: "disc-teams", title: "Teams", url: "/disc/teams", icon: "UsersRound", roles: ["admin", "hospital_leadership"] },
      { id: "disc-build", title: "Build Team", url: "/disc/teams/new", icon: "UserPlus", roles: ["admin", "hospital_leadership"] },
    ],
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: "Calendar",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: true,
    items: [
      { id: "schedules", title: "Calendar", url: "/schedules", icon: "Calendar", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "my-schedule", title: "My Calendar", url: "/my-schedule", icon: "Calendar", roles: ["consultant"] },
      { id: "timesheets", title: "Timesheets", url: "/timesheets", icon: "Clock", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "availability", title: "Availability", url: "/availability", icon: "CalendarDays", roles: ["admin", "consultant"] },
      { id: "shift-swaps", title: "Shift Swaps", url: "/shift-swaps", icon: "ArrowLeftRight", roles: ["admin", "hospital_staff", "consultant"] },
      { id: "auto-scheduling", title: "Auto-Scheduling", url: "/auto-scheduling", icon: "Sparkles", roles: ["admin", "hospital_leadership"] },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    icon: "Plane",
    roles: ["admin", "hospital_leadership", "consultant"],
    defaultOpen: false,
    items: [
      { id: "travel-bookings", title: "Bookings", url: "/travel-bookings", icon: "Luggage", roles: ["admin", "hospital_leadership", "consultant"] },
      { id: "travel-preferences", title: "Preferences", url: "/travel-preferences", icon: "Plane", roles: ["admin", "consultant"] },
      { id: "transportation", title: "Transportation", url: "/transportation", icon: "Bus", roles: ["admin", "hospital_leadership", "consultant"] },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    icon: "MessageCircle",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: false,
    items: [
      { id: "chat", title: "Chat", url: "/chat", icon: "MessageCircle", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "contracts", title: "Contracts", url: "/contracts", icon: "FileSignature", roles: ["admin", "hospital_leadership", "consultant"] },
    ],
  },
  {
    id: "quality",
    label: "Quality",
    icon: "Target",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: false,
    items: [
      { id: "quality-assurance", title: "Quality Assurance", url: "/quality-assurance", icon: "Target", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "compliance-center", title: "Compliance", url: "/compliance-center", icon: "ShieldCheck", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "gamification", title: "Achievements", url: "/gamification", icon: "Award", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: "PieChart",
    roles: ["admin", "hospital_leadership"],
    defaultOpen: false,
    items: [
      { id: "analytics", title: "Analytics", url: "/analytics", icon: "LineChart", roles: ["admin", "hospital_leadership"] },
      { id: "executive", title: "Executive", url: "/executive-dashboard", icon: "Gauge", roles: ["admin", "hospital_leadership"] },
      { id: "roi", title: "ROI", url: "/roi", icon: "BarChart3", roles: ["admin", "hospital_leadership"] },
      { id: "builder", title: "Builder", url: "/report-builder", icon: "FileBarChart", roles: ["admin", "hospital_leadership"] },
      { id: "advanced", title: "Advanced", url: "/advanced-analytics", icon: "TrendingUp", roles: ["admin"] },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: "HeadphonesIcon",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: false,
    items: [
      { id: "command", title: "Command Center", url: "/command-center", icon: "Radio", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "remote-support", title: "Remote Support", url: "/remote-support", icon: "Video", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "tickets", title: "Tickets", url: "/support-tickets", icon: "Ticket", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "knowledge", title: "Knowledge Base", url: "/knowledge-base", icon: "Book", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "eod", title: "EOD Reports", url: "/eod-reports", icon: "FileCheck", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "escalations", title: "Escalations", url: "/escalation-management", icon: "AlertTriangle", roles: ["admin"] },
    ],
  },
  {
    id: "training",
    label: "Training",
    icon: "GraduationCap",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: false,
    items: [
      { id: "training", title: "Courses", url: "/training", icon: "GraduationCap", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "assessments", title: "Assessments", url: "/assessments", icon: "ClipboardCheck", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "labs", title: "Login Labs", url: "/login-labs", icon: "Monitor", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "onboarding", title: "Onboarding", url: "/onboarding", icon: "UserCheck", roles: ["admin", "consultant"] },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: "DollarSign",
    roles: ["admin", "hospital_leadership", "consultant"],
    defaultOpen: false,
    items: [
      { id: "expenses", title: "Expenses", url: "/expenses", icon: "DollarSign", roles: ["admin", "consultant"] },
      { id: "invoices", title: "Invoices", url: "/invoices", icon: "Receipt", roles: ["admin", "hospital_leadership"] },
      { id: "payroll", title: "Payroll", url: "/payroll", icon: "Banknote", roles: ["admin", "consultant"] },
      { id: "budget", title: "Budget", url: "/budget", icon: "Calculator", roles: ["admin", "hospital_leadership"] },
      { id: "budget-modeling", title: "Budget Modeling", url: "/budget-modeling", icon: "TrendingUp", roles: ["admin"] },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: "UserCog",
    roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"],
    defaultOpen: false,
    items: [
      { id: "profile", title: "My Profile", url: "/profile", icon: "UserCog", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "personal-info", title: "Personal Info", url: "/personal-information", icon: "FileText", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
      { id: "skills", title: "Skills", url: "/skills-questionnaire", icon: "Award", roles: ["consultant"] },
      { id: "my-documents", title: "My Documents", url: "/my-documents", icon: "FileText", roles: ["consultant"] },
      { id: "documents", title: "Documents", url: "/documents", icon: "FileText", roles: ["admin", "hospital_leadership", "hospital_staff"] },
      { id: "account", title: "Account Settings", url: "/account", icon: "Settings", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: "Settings",
    roles: ["admin"],
    defaultOpen: false,
    items: [
      { id: "settings", title: "Settings", url: "/settings", icon: "Settings", roles: ["admin"] },
      { id: "access", title: "Access Control", url: "/access-control", icon: "Shield", roles: ["admin"] },
      { id: "roles", title: "Roles", url: "/role-management", icon: "KeyRound", roles: ["admin"] },
      { id: "invitations", title: "Invitations", url: "/staff-invitations", icon: "UserPlus", roles: ["admin"] },
      { id: "activity", title: "Activity Log", url: "/activity-log", icon: "Activity", roles: ["admin"] },
      { id: "integrations", title: "Integrations", url: "/integrations", icon: "Link2", roles: ["admin"] },
      { id: "ehr-monitoring", title: "EHR Monitoring", url: "/ehr-monitoring", icon: "Monitor", roles: ["admin"] },
      { id: "skills-verification", title: "Skills Verify", url: "/skills-verification", icon: "UserCheck", roles: ["admin"] },
      { id: "identity", title: "Identity Verify", url: "/identity-verification", icon: "Shield", roles: ["admin"] },
    ],
  },
];

// Persistence keys
const FAVORITES_KEY = "nicehr-favorites";
const OPEN_GROUPS_KEY = "nicehr-open-groups";

function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function getStoredOpenGroups(): Record<string, boolean> | null {
  try {
    const stored = localStorage.getItem(OPEN_GROUPS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveOpenGroups(groups: Record<string, boolean>) {
  localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(groups));
}

function getRoleBadge(roleLevel: string) {
  switch (roleLevel) {
    case "admin":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-1.5">Admin</Badge>;
    case "hospital_leadership":
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1.5">Leadership</Badge>;
    case "hospital_staff":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5">Staff</Badge>;
    case "consultant":
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1.5">Consultant</Badge>;
    default:
      return null;
  }
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { roleLevel } = usePermissions();
  const { counts: notificationCounts } = useNotificationCounts();
  const [favorites, setFavorites] = useState<string[]>(getFavorites);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Initialize open groups from localStorage or defaults
  useEffect(() => {
    const stored = getStoredOpenGroups();
    if (stored) {
      setOpenGroups(stored);
    } else {
      const initial: Record<string, boolean> = {};
      NAV_GROUPS.forEach((group) => {
        initial[group.id] = group.defaultOpen ?? false;
      });
      setOpenGroups(initial);
    }
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        window.location.href = "/search";
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      saveFavorites(next);
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      saveOpenGroups(next);
      return next;
    });
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  // Get all items for favorites lookup
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const favoriteItems = favorites
    .map((id) => allItems.find((item) => item.id === id))
    .filter((item): item is NavItem => !!item && item.roles.includes(roleLevel));

  // Filter groups by role
  const visibleGroups = NAV_GROUPS.filter((group) =>
    group.roles.includes(roleLevel)
  ).map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(roleLevel)),
  }));

  const renderNavItem = (item: NavItem, showFavorite = true) => {
    const Icon = ICON_MAP[item.icon] || LayoutDashboard;
    const isActive = location === item.url;
    const isFavorite = favorites.includes(item.id);
    // Use API notification count, fall back to static badge if defined
    const badge = notificationCounts[item.id] ?? item.badge;

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            "group relative transition-all duration-150",
            isActive && "bg-muted text-foreground font-medium"
          )}
          data-testid={`nav-${item.id}`}
        >
          <Link href={item.url}>
            <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            <span className="flex-1">{item.title}</span>
            {badge !== undefined && badge !== 0 && (
              <Badge
                className={cn(
                  "ml-auto h-5 min-w-5 px-1.5 text-[10px] font-medium",
                  typeof badge === "number" && badge > 0
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {typeof badge === "number" && badge > 99 ? "99+" : badge}
              </Badge>
            )}
            {showFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted",
                  isFavorite && "opacity-100"
                )}
              >
                <Star
                  className={cn(
                    "w-3 h-3",
                    isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                  )}
                />
              </button>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="border-r border-border bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-foreground font-bold text-sm">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground tracking-tight">NICEHR</span>
            {getRoleBadge(roleLevel)}
          </div>
        </div>
      </SidebarHeader>

      {/* Search Button */}
      <div className="px-3 py-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 h-9 bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border"
          onClick={() => (window.location.href = "/search")}
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left text-sm">Search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] text-muted-foreground">
            <Command className="w-3 h-3" />K
          </kbd>
        </Button>
      </div>

      <SidebarContent className="px-2">
        {/* Favorites Section */}
        {favoriteItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-2">
              <Star className="w-3 h-3 mr-1.5 fill-amber-400 text-amber-400" />
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favoriteItems.map((item) => renderNavItem(item, false))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Navigation Groups */}
        {visibleGroups.map((group) => {
          if (group.items.length === 0) return null;
          const GroupIcon = ICON_MAP[group.icon] || Briefcase;
          const isOpen = openGroups[group.id] ?? group.defaultOpen;

          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-2 cursor-pointer hover:text-muted-foreground transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-1.5">
                      <GroupIcon className="w-3 h-3" />
                      {group.label}
                    </span>
                    <ChevronRight
                      className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => renderNavItem(item))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 mt-auto border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8 ring-2 ring-border">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-foreground text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {user?.email}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 text-muted-foreground hover:text-foreground hover:bg-muted mt-1"
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
