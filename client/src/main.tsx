import { createRoot } from "react-dom/client";

// Simple test to see if React is working at all
const TestApp = () => {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "green" }}>React is Working!</h1>
      <p>If you see this, the basic React setup works.</p>
    </div>
  );
};

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<TestApp />);
} else {
  console.error("Root element not found!");
}
