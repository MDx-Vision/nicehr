import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

function SimpleDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-600">VERSION 3 - WITH useAuth</h1>
      <p className="text-muted-foreground">
        Welcome, {user?.firstName || "Guest"}!
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Card 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Card 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">200</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Card 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">300</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SimpleNotFound() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleDashboard} />
      <Route component={SimpleNotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
