import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionsProvider } from "@/hooks/use-permissions";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Hospitals from "@/pages/Hospitals";
import Consultants from "@/pages/Consultants";
import Projects from "@/pages/Projects";
import Schedules from "@/pages/Schedules";
import BudgetCalculator from "@/pages/BudgetCalculator";
import RoiDashboard from "@/pages/RoiDashboard";
import Documents from "@/pages/Documents";
import Search from "@/pages/Search";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import MySchedule from "@/pages/MySchedule";
import MyDocuments from "@/pages/MyDocuments";
import RoiSurvey from "@/pages/RoiSurvey";
import AccountSettings from "@/pages/AccountSettings";
import AccessControl from "@/pages/AccessControl";
import ActivityLog from "@/pages/ActivityLog";
import Analytics from "@/pages/Analytics";
import ProjectPhases from "@/pages/ProjectPhases";
import ConsultantOnboarding from "@/pages/ConsultantOnboarding";
import CommandCenter from "@/pages/CommandCenter";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-3 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ 
  component: Component, 
  requiredRoles,
  pageKey,
}: { 
  component: React.ComponentType;
  requiredRoles?: string[];
  pageKey?: string;
}) {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error && isUnauthorizedError(error)) {
    return <Landing />;
  }

  if (!user) {
    return <Landing />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <AuthenticatedLayout>
          <AccessDeniedPage 
            title="Access Denied" 
            description={`This page requires one of the following roles: ${requiredRoles.join(", ")}`} 
          />
        </AuthenticatedLayout>
      );
    }
  }

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function AccessDeniedPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2" data-testid="text-access-denied-title">{title}</h2>
        <p className="text-muted-foreground mb-4" data-testid="text-access-denied-description">{description}</p>
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover-elevate h-10 px-4 py-2"
          data-testid="button-go-back"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/hospitals" component={() => <ProtectedRoute component={Hospitals} />} />
      <Route path="/consultants" component={() => <ProtectedRoute component={Consultants} />} />
      <Route path="/projects" component={() => <ProtectedRoute component={Projects} />} />
      <Route path="/schedules" component={() => <ProtectedRoute component={Schedules} />} />
      <Route path="/budget" component={() => <ProtectedRoute component={BudgetCalculator} />} />
      <Route path="/roi" component={() => <ProtectedRoute component={RoiDashboard} />} />
      <Route path="/documents" component={() => <ProtectedRoute component={Documents} />} />
      <Route path="/search" component={() => <ProtectedRoute component={Search} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} requiredRoles={["admin"]} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/my-schedule" component={() => <ProtectedRoute component={MySchedule} />} />
      <Route path="/my-documents" component={() => <ProtectedRoute component={MyDocuments} />} />
      <Route path="/roi-survey" component={() => <ProtectedRoute component={RoiSurvey} />} />
      <Route path="/account" component={() => <ProtectedRoute component={AccountSettings} />} />
      <Route path="/access-control" component={() => <ProtectedRoute component={AccessControl} requiredRoles={["admin"]} />} />
      <Route path="/activity-log" component={() => <ProtectedRoute component={ActivityLog} requiredRoles={["admin"]} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/project-phases" component={() => <ProtectedRoute component={ProjectPhases} />} />
      <Route path="/onboarding" component={() => <ProtectedRoute component={ConsultantOnboarding} />} />
      <Route path="/command-center" component={() => <ProtectedRoute component={CommandCenter} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

export default App;
