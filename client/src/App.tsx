import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PermissionsProvider } from "@/hooks/use-permissions";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

const Hospitals = lazy(() => import("@/pages/Hospitals"));
const Consultants = lazy(() => import("@/pages/Consultants"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectPhases = lazy(() => import("@/pages/ProjectPhases"));
const RaciMatrix = lazy(() => import("@/pages/RaciMatrix"));
const Schedules = lazy(() => import("@/pages/Schedules"));
const AutoScheduling = lazy(() => import("@/pages/AutoScheduling"));
const ShiftSwaps = lazy(() => import("@/pages/ShiftSwaps"));
const Timesheets = lazy(() => import("@/pages/Timesheets"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Documents = lazy(() => import("@/pages/Documents"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const AccountSettings = lazy(() => import("@/pages/AccountSettings"));
const AccessControl = lazy(() => import("@/pages/AccessControl"));
const ActivityLog = lazy(() => import("@/pages/ActivityLog"));
const RoleManagement = lazy(() => import("@/pages/RoleManagement"));
const StaffInvitations = lazy(() => import("@/pages/StaffInvitations"));
const Search = lazy(() => import("@/pages/Search"));
const CommandCenter = lazy(() => import("@/pages/CommandCenter"));
const SupportTickets = lazy(() => import("@/pages/SupportTickets"));
const Training = lazy(() => import("@/pages/Training"));
const ReportBuilder = lazy(() => import("@/pages/ReportBuilder"));
const EodReports = lazy(() => import("@/pages/EodReports"));
const BudgetModeling = lazy(() => import("@/pages/BudgetModeling"));
const Expenses = lazy(() => import("@/pages/Expenses"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Payroll = lazy(() => import("@/pages/Payroll"));
const TravelBookings = lazy(() => import("@/pages/TravelBookings"));
const TravelPreferences = lazy(() => import("@/pages/TravelPreferences"));
const Transportation = lazy(() => import("@/pages/Transportation"));
const Gamification = lazy(() => import("@/pages/Gamification"));
const IdentityVerification = lazy(() => import("@/pages/IdentityVerification"));
const Contracts = lazy(() => import("@/pages/Contracts"));
const Chat = lazy(() => import("@/pages/Chat"));
const SkillsQuestionnaire = lazy(() => import("@/pages/SkillsQuestionnaire"));
const SkillsVerification = lazy(() => import("@/pages/SkillsVerification"));
const PersonalInformation = lazy(() => import("@/pages/PersonalInformation"));
const BudgetCalculator = lazy(() => import("@/pages/BudgetCalculator"));
const RoiDashboard = lazy(() => import("@/pages/RoiDashboard"));
const RoiSurvey = lazy(() => import("@/pages/RoiSurvey"));
const Availability = lazy(() => import("@/pages/Availability"));
const Assessments = lazy(() => import("@/pages/Assessments"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const EscalationManagement = lazy(() => import("@/pages/EscalationManagement"));
const ComplianceCenter = lazy(() => import("@/pages/ComplianceCenter"));
const QualityAssurance = lazy(() => import("@/pages/QualityAssurance"));
const LoginLabs = lazy(() => import("@/pages/LoginLabs"));
const Login = lazy(() => import("@/pages/Login"));
const AdvancedAnalytics = lazy(() => import("@/pages/AdvancedAnalytics"));
const ExecutiveDashboard = lazy(() => import("@/pages/ExecutiveDashboard"));
const EhrMonitoring = lazy(() => import("@/pages/ehr-monitoring"));
const IntegrationsHub = lazy(() => import("@/pages/integrations-hub"));
const ConsultantOnboarding = lazy(() => import("@/pages/ConsultantOnboarding"));
const MySchedule = lazy(() => import("@/pages/MySchedule"));
const MyDocuments = lazy(() => import("@/pages/MyDocuments"));
const MyProjects = lazy(() => import("@/pages/MyProjects"));
const AccessDenied = lazy(() => import("@/pages/AccessDenied"));
const DiscDashboard = lazy(() => import("@/pages/DiscDashboard"));
const DiscTeams = lazy(() => import("@/pages/DiscTeams"));
const DiscTeamBuilder = lazy(() => import("@/pages/DiscTeamBuilder"));
const DiscTeamDetail = lazy(() => import("@/pages/DiscTeamDetail"));

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-2 border-b bg-background shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/hospitals" component={() => <ProtectedRoute component={Hospitals} />} />
      <Route path="/consultants" component={() => <ProtectedRoute component={Consultants} />} />
      <Route path="/projects" component={() => <ProtectedRoute component={Projects} />} />
      <Route path="/project-phases" component={() => <ProtectedRoute component={ProjectPhases} />} />
      <Route path="/raci-matrix" component={() => <ProtectedRoute component={RaciMatrix} />} />
      <Route path="/schedules" component={() => <ProtectedRoute component={Schedules} />} />
      <Route path="/auto-scheduling" component={() => <ProtectedRoute component={AutoScheduling} />} />
      <Route path="/shift-swaps" component={() => <ProtectedRoute component={ShiftSwaps} />} />
      <Route path="/timesheets" component={() => <ProtectedRoute component={Timesheets} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/documents" component={() => <ProtectedRoute component={Documents} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/account-settings" component={() => <ProtectedRoute component={AccountSettings} />} />
      <Route path="/access-control" component={() => <ProtectedRoute component={AccessControl} />} />
      <Route path="/activity-log" component={() => <ProtectedRoute component={ActivityLog} />} />
      <Route path="/role-management" component={() => <ProtectedRoute component={RoleManagement} />} />
      <Route path="/staff-invitations" component={() => <ProtectedRoute component={StaffInvitations} />} />
      <Route path="/search" component={() => <ProtectedRoute component={Search} />} />
      <Route path="/command-center" component={() => <ProtectedRoute component={CommandCenter} />} />
      <Route path="/support-tickets" component={() => <ProtectedRoute component={SupportTickets} />} />
      <Route path="/training" component={() => <ProtectedRoute component={Training} />} />
      <Route path="/report-builder" component={() => <ProtectedRoute component={ReportBuilder} />} />
      <Route path="/eod-reports" component={() => <ProtectedRoute component={EodReports} />} />
      <Route path="/budget-modeling" component={() => <ProtectedRoute component={BudgetModeling} />} />
      <Route path="/expenses" component={() => <ProtectedRoute component={Expenses} />} />
      <Route path="/invoices" component={() => <ProtectedRoute component={Invoices} />} />
      <Route path="/payroll" component={() => <ProtectedRoute component={Payroll} />} />
      <Route path="/travel-bookings" component={() => <ProtectedRoute component={TravelBookings} />} />
      <Route path="/travel-preferences" component={() => <ProtectedRoute component={TravelPreferences} />} />
      <Route path="/transportation" component={() => <ProtectedRoute component={Transportation} />} />
      <Route path="/gamification" component={() => <ProtectedRoute component={Gamification} />} />
      <Route path="/identity-verification" component={() => <ProtectedRoute component={IdentityVerification} />} />
      <Route path="/contracts" component={() => <ProtectedRoute component={Contracts} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
      <Route path="/skills-questionnaire" component={() => <ProtectedRoute component={SkillsQuestionnaire} />} />
      <Route path="/skills-verification" component={() => <ProtectedRoute component={SkillsVerification} />} />
      <Route path="/personal-information" component={() => <ProtectedRoute component={PersonalInformation} />} />
      <Route path="/budget-calculator" component={() => <ProtectedRoute component={BudgetCalculator} />} />
      <Route path="/roi-dashboard" component={() => <ProtectedRoute component={RoiDashboard} />} />
      <Route path="/roi-survey" component={() => <ProtectedRoute component={RoiSurvey} />} />
      <Route path="/availability" component={() => <ProtectedRoute component={Availability} />} />
      <Route path="/assessments" component={() => <ProtectedRoute component={Assessments} />} />
      <Route path="/knowledge-base" component={() => <ProtectedRoute component={KnowledgeBase} />} />
      <Route path="/escalation-management" component={() => <ProtectedRoute component={EscalationManagement} />} />
      <Route path="/compliance-center" component={() => <ProtectedRoute component={ComplianceCenter} />} />
      <Route path="/quality-assurance" component={() => <ProtectedRoute component={QualityAssurance} />} />
      <Route path="/login-labs" component={() => <ProtectedRoute component={LoginLabs} />} />
      <Route path="/login" component={() => <Suspense fallback={<PageLoader />}><Login /></Suspense>} />
      <Route path="/advanced-analytics" component={() => <ProtectedRoute component={AdvancedAnalytics} />} />
      <Route path="/executive-dashboard" component={() => <ProtectedRoute component={ExecutiveDashboard} />} />
      <Route path="/ehr-monitoring" component={() => <ProtectedRoute component={EhrMonitoring} />} />
      <Route path="/integrations-hub" component={() => <ProtectedRoute component={IntegrationsHub} />} />
      <Route path="/consultant-onboarding" component={() => <ProtectedRoute component={ConsultantOnboarding} />} />
      <Route path="/my-schedule" component={() => <ProtectedRoute component={MySchedule} />} />
      <Route path="/my-documents" component={() => <ProtectedRoute component={MyDocuments} />} />
      <Route path="/my-projects" component={() => <ProtectedRoute component={MyProjects} />} />
      <Route path="/access-denied" component={() => <Suspense fallback={<PageLoader />}><AccessDenied /></Suspense>} />
      <Route path="/disc" component={() => <ProtectedRoute component={DiscDashboard} />} />
      <Route path="/disc/teams" component={() => <ProtectedRoute component={DiscTeams} />} />
      <Route path="/disc/team-builder" component={() => <ProtectedRoute component={DiscTeamBuilder} />} />
      <Route path="/disc/teams/:teamId" component={() => <ProtectedRoute component={DiscTeamDetail} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <AppLayout>
      <Router />
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PermissionsProvider>
          <AuthenticatedApp />
        </PermissionsProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
