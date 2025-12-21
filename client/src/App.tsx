import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <h1 style={{ color: "blue" }}>App Component Working!</h1>
        <p>QueryClientProvider is working.</p>
      </div>
    </QueryClientProvider>
  );
}

export default App;
