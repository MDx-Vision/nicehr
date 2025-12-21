import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PermissionsProvider } from "@/hooks/use-permissions";
import { ProjectContextProvider } from "@/hooks/use-project-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

function TestDashboardWithAuth() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">NICEHR Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {user?.firstName || "Guest"}!
      </p>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user ? "Logged In" : "Not Logged In"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.role || "N/A"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{user?.email || "N/A"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider>
        <ProjectContextProvider>
          <TooltipProvider>
            <Toaster />
            <TestDashboardWithAuth />
          </TooltipProvider>
        </ProjectContextProvider>
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

export default App;
