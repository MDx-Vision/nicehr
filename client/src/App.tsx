import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
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

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
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
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/my-schedule" component={() => <ProtectedRoute component={MySchedule} />} />
      <Route path="/my-documents" component={() => <ProtectedRoute component={MyDocuments} />} />
      <Route path="/roi-survey" component={() => <ProtectedRoute component={RoiSurvey} />} />
      <Route path="/account" component={() => <ProtectedRoute component={AccountSettings} />} />
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
