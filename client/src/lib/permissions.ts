export type UserRoleLevel = 
  | 'admin' 
  | 'hospital_leadership' 
  | 'hospital_staff' 
  | 'consultant';

export interface NavigationItem {
  title: string;
  url: string;
  icon: string;
  category: 'overview' | 'operations' | 'support' | 'scheduling' | 'training' | 'travel' | 'finance' | 'quality' | 'communication' | 'admin';
  roles: UserRoleLevel[];
  requiresProjectContext?: boolean;
  requiredPermission?: string;
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
  { title: "Dashboard", url: "/", icon: "LayoutDashboard", category: "overview", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiredPermission: "dashboard:view" },
  { title: "Analytics", url: "/analytics", icon: "LineChart", category: "overview", roles: ["admin", "hospital_leadership"], requiredPermission: "reports:view" },
  { title: "Executive Dashboard", url: "/executive-dashboard", icon: "Gauge", category: "overview", roles: ["admin", "hospital_leadership"], requiredPermission: "reports:view" },
  { title: "Report Builder", url: "/report-builder", icon: "FileBarChart", category: "overview", roles: ["admin", "hospital_leadership"], requiredPermission: "reports:create" },
  { title: "ROI Dashboard", url: "/roi", icon: "BarChart3", category: "overview", roles: ["admin", "hospital_leadership"], requiredPermission: "financials:view" },
  
  { title: "Projects", url: "/projects", icon: "FolderKanban", category: "operations", roles: ["admin", "hospital_leadership", "hospital_staff"], requiresProjectContext: true, requiredPermission: "projects:view" },
  { title: "My Projects", url: "/my-projects", icon: "FolderKanban", category: "operations", roles: ["consultant"], requiresProjectContext: true, requiredPermission: "projects:view" },
  { title: "Hospitals", url: "/hospitals", icon: "Building2", category: "operations", roles: ["admin"], requiredPermission: "hospitals:view" },
  { title: "Consultants", url: "/consultants", icon: "Users", category: "operations", roles: ["admin", "hospital_leadership"], requiredPermission: "consultants:view" },
  { title: "Project Phases", url: "/project-phases", icon: "Layers", category: "operations", roles: ["admin", "hospital_leadership", "hospital_staff"], requiresProjectContext: true, requiredPermission: "projects:view" },
  { title: "Onboarding", url: "/onboarding", icon: "ClipboardCheck", category: "operations", roles: ["admin", "hospital_leadership"], requiredPermission: "consultants:manage" },
  { title: "My Onboarding", url: "/onboarding", icon: "ClipboardCheck", category: "operations", roles: ["consultant"] },
  
  { title: "Command Center", url: "/command-center", icon: "Radio", category: "support", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiresProjectContext: true, requiredPermission: "support_tickets:view_own" },
  { title: "Support Tickets", url: "/support-tickets", icon: "Ticket", category: "support", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiresProjectContext: true, requiredPermission: "support_tickets:view_own" },
  { title: "EOD Reports", url: "/eod-reports", icon: "FileCheck", category: "support", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiresProjectContext: true, requiredPermission: "eod_reports:view_own" },
  { title: "Escalation", url: "/escalation-management", icon: "AlertTriangle", category: "support", roles: ["admin", "hospital_leadership"], requiredPermission: "support_tickets:manage" },
  { title: "Knowledge Base", url: "/knowledge-base", icon: "Book", category: "support", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
  
  { title: "Schedules", url: "/schedules", icon: "Calendar", category: "scheduling", roles: ["admin", "hospital_leadership", "hospital_staff"], requiresProjectContext: true },
  { title: "My Schedule", url: "/my-schedule", icon: "Calendar", category: "scheduling", roles: ["consultant"] },
  { title: "Timesheets", url: "/timesheets", icon: "Clock", category: "scheduling", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiredPermission: "timesheets:view_own" },
  { title: "Availability", url: "/availability", icon: "CalendarDays", category: "scheduling", roles: ["admin", "consultant"] },
  { title: "Shift Swaps", url: "/shift-swaps", icon: "ArrowLeftRight", category: "scheduling", roles: ["admin", "hospital_staff", "consultant"] },
  
  { title: "Training", url: "/training", icon: "GraduationCap", category: "training", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiredPermission: "training:view" },
  { title: "Assessments", url: "/assessments", icon: "ClipboardCheck", category: "training", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiredPermission: "training:view" },
  { title: "Skills Questionnaire", url: "/skills-questionnaire", icon: "ClipboardCheck", category: "training", roles: ["admin", "consultant"] },
  { title: "Login Labs", url: "/login-labs", icon: "Monitor", category: "training", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiredPermission: "training:view" },
  
  { title: "Travel Preferences", url: "/travel-preferences", icon: "Plane", category: "travel", roles: ["admin", "consultant"], requiredPermission: "travel:view_own" },
  { title: "Travel Bookings", url: "/travel-bookings", icon: "Luggage", category: "travel", roles: ["admin", "consultant"], requiredPermission: "travel:view_own" },
  { title: "Transportation", url: "/transportation", icon: "Bus", category: "travel", roles: ["admin", "hospital_staff", "consultant"], requiredPermission: "travel:view_own" },
  
  { title: "Expenses", url: "/expenses", icon: "DollarSign", category: "finance", roles: ["admin", "consultant"], requiredPermission: "financials:view" },
  { title: "Invoices", url: "/invoices", icon: "Receipt", category: "finance", roles: ["admin", "hospital_leadership"], requiredPermission: "financials:view" },
  { title: "Payroll", url: "/payroll", icon: "Banknote", category: "finance", roles: ["admin", "consultant"], requiredPermission: "financials:view" },
  { title: "Budget Calculator", url: "/budget", icon: "Calculator", category: "finance", roles: ["admin", "hospital_leadership"], requiredPermission: "financials:view" },
  
  { title: "Quality Assurance", url: "/quality-assurance", icon: "Target", category: "quality", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"], requiresProjectContext: true, requiredPermission: "quality:view" },
  { title: "Gamification", url: "/gamification", icon: "Award", category: "quality", roles: ["admin", "consultant"] },
  { title: "Compliance Center", url: "/compliance-center", icon: "ShieldCheck", category: "quality", roles: ["admin", "hospital_leadership"], requiredPermission: "compliance:view" },
  
  { title: "Chat", url: "/chat", icon: "MessageCircle", category: "communication", roles: ["admin", "hospital_leadership", "hospital_staff", "consultant"] },
  { title: "Contracts", url: "/contracts", icon: "FileSignature", category: "communication", roles: ["admin", "hospital_leadership", "consultant"] },
  { title: "Identity Verification", url: "/identity-verification", icon: "UserCheck", category: "communication", roles: ["admin", "consultant"] },
  { title: "Documents", url: "/documents", icon: "FileText", category: "communication", roles: ["admin", "hospital_leadership"] },
  { title: "My Documents", url: "/my-documents", icon: "FileText", category: "communication", roles: ["consultant"] },
  { title: "Search", url: "/search", icon: "Search", category: "communication", roles: ["admin", "hospital_leadership"] },
  
  { title: "Role Management", url: "/role-management", icon: "KeyRound", category: "admin", roles: ["admin"], requiredPermission: "rbac:manage" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  overview: "Overview",
  operations: "Operations", 
  support: "Support & Go-Live",
  scheduling: "Scheduling",
  training: "Training & Competency",
  travel: "Travel",
  finance: "Finance",
  quality: "Quality & Compliance",
  communication: "Communication",
  admin: "Administration",
};

export const CATEGORY_ORDER = [
  "overview",
  "operations",
  "support",
  "scheduling", 
  "training",
  "travel",
  "finance",
  "quality",
  "communication",
  "admin",
];

export function getNavigationForRole(roleLevel: UserRoleLevel): NavigationItem[] {
  return NAVIGATION_CONFIG.filter(item => item.roles.includes(roleLevel));
}

export function getGroupedNavigation(roleLevel: UserRoleLevel): Record<string, NavigationItem[]> {
  const items = getNavigationForRole(roleLevel);
  const grouped: Record<string, NavigationItem[]> = {};
  
  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  }
  
  return grouped;
}

export function determineRoleLevel(
  role: string | null | undefined,
  isLeadership?: boolean
): UserRoleLevel {
  if (role === 'admin') return 'admin';
  if (role === 'hospital_staff') {
    return isLeadership ? 'hospital_leadership' : 'hospital_staff';
  }
  if (role === 'consultant') return 'consultant';
  return 'consultant';
}
