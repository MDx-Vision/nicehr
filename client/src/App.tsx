import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PermissionsProvider } from "@/hooks/use-permissions";
import { ProjectContextProvider } from "@/hooks/use-project-context";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionsProvider>
        <ProjectContextProvider>
          <TooltipProvider>
            <Toaster />
            <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
              <h1 style={{ color: "blue" }}>All Providers Working!</h1>
              <p>Providers are set up correctly.</p>
            </div>
          </TooltipProvider>
        </ProjectContextProvider>
      </PermissionsProvider>
    </QueryClientProvider>
  );
}

export default App;
