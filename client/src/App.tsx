import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionsProvider } from "@/hooks/use-permissions";
import { ProjectContextProvider } from "@/hooks/use-project-context";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function SimpleSidebar() {
  return (
    <div className="w-64 h-full bg-slate-900 p-4 text-white">
      <h2 className="text-lg font-bold mb-4">NICEHR</h2>
      <nav className="space-y-2">
        <a href="/" className="block p-2 hover:bg-slate-800 rounded">Dashboard</a>
        <a href="/hospitals" className="block p-2 hover:bg-slate-800 rounded">Hospitals</a>
        <a href="/projects" className="block p-2 hover:bg-slate-800 rounded">Projects</a>
      </nav>
    </div>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <SimpleSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-3 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
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
}: { 
  component: React.ComponentType;
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider>
        <ProjectContextProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ProjectContextProvider>
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

export default App;
