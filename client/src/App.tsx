import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SimpleTestDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">NICEHR Dashboard</h1>
      <p className="text-muted-foreground">This is a test dashboard without any hooks.</p>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Test Card 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">123</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Test Card 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Test Card 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">789</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleTestDashboard />
    </QueryClientProvider>
  );
}

export default App;
