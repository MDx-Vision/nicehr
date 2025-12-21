import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">NICEHR Dashboard</h1>
        <Dashboard />
      </div>
    </QueryClientProvider>
  );
}

export default App;
