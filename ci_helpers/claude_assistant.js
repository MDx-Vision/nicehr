const Anthropic = require("@anthropic-ai/sdk").default;
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

async function analyzeAndFix(errorInfo) {
  console.log("🤖 Claude analyzing test failure...\n");

  const context = gatherProjectContext();

  const prompt = "You are a Cypress E2E test expert. Analyze this test failure and provide fixes.\n\nPROJECT CONTEXT:\n" + context + "\n\nERROR INFO:\n" + errorInfo + "\n\nINSTRUCTIONS:\n1. Identify the root cause of the failure\n2. Provide the exact file changes needed\n3. Format each fix as:\n   FILE: path/to/file\n   ACTION: create|modify|replace\n   CONTENT:\n```\nexact code here\n```\n\nFocus on:\n- Missing test data in CI seed\n- Incorrect selectors (use data-testid)\n- Missing API routes or endpoints\n- Timing issues (add proper waits)\n- Authentication/session issues in CI\n\nProvide complete, working code - not snippets.";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const analysis = response.content[0].text;
  console.log("📋 Analysis:\n", analysis);

  applyFixes(analysis);

  return analysis;
}

async function generateExhaustiveTests(feature) {
  console.log("🧪 Generating exhaustive tests for: " + feature + "\n");

  const context = gatherProjectContext();
  const routes = getRoutes();
  const existingTests = getExistingTests();

  const prompt = "You are a Cypress E2E test expert. Generate EXHAUSTIVE tests for the " + feature + " feature.\n\nPROJECT CONTEXT:\n" + context + "\n\nAVAILABLE API ROUTES:\n" + routes + "\n\nEXISTING TEST PATTERNS:\n" + existingTests + "\n\nCI TEST DATA (always available):\n- User: ci-test-user / test@example.com (admin role)\n- Hospital: ci-test-hospital / \"CI Test Hospital\"\n- Consultant: ci-test-consultant\n- Project: ci-test-project\n\nREQUIREMENTS:\n1. Test EVERY user interaction on every page for " + feature + "\n2. Test all CRUD operations (Create, Read, Update, Delete)\n3. Test form validation (required fields, invalid inputs, edge cases)\n4. Test error states and empty states\n5. Test pagination, search, and filters if present\n6. Test responsive behavior\n7. Use data-testid selectors when possible\n8. Use cy.intercept() for API calls\n9. Add proper waits and assertions\n10. Group related tests in describe blocks\n\nGenerate complete, production-ready test file(s).\nFormat as:\nFILE: cypress/e2e/XX-feature.cy.js\nCONTENT:\n```javascript\n// complete test code\n```";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    messages: [{ role: "user", content: prompt }],
  });

  const tests = response.content[0].text;
  console.log("📝 Generated Tests:\n", tests);

  applyFixes(tests);

  return tests;
}

function gatherProjectContext() {
  let context = "";

  const configFiles = ["package.json", "cypress.config.js", "cypress.config.ts"];

  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, "utf8");
        context += "\n--- " + file + " ---\n" + content.slice(0, 2000) + "\n";
      } catch (e) {}
    }
  }

  if (fs.existsSync("server/routes.ts")) {
    const routes = fs.readFileSync("server/routes.ts", "utf8");
    const routeMatches = routes.match(/app\.(get|post|put|delete)\(['"](.*?)['"]/g);
    if (routeMatches) {
      context += "\n--- API Routes ---\n" + routeMatches.join("\n") + "\n";
    }
  }

  return context;
}

function getRoutes() {
  if (!fs.existsSync("server/routes.ts")) return "Routes file not found";

  const routes = fs.readFileSync("server/routes.ts", "utf8");
  const routeMatches = routes.match(/app\.(get|post|put|delete|patch)\(['"](.*?)['"]/g);
  return routeMatches ? routeMatches.slice(0, 100).join("\n") : "No routes found";
}

function getExistingTests() {
  const testDir = "cypress/e2e";
  if (!fs.existsSync(testDir)) return "No existing tests";

  const files = fs.readdirSync(testDir).filter((f) => f.endsWith(".cy.js"));
  if (files.length === 0) return "No existing tests";

  const firstTest = fs.readFileSync(path.join(testDir, files[0]), "utf8");
  return "Example from " + files[0] + ":\n" + firstTest.slice(0, 3000);
}

function applyFixes(analysis) {
  const filePattern = /FILE:\s*(.+?)\n(?:ACTION:\s*\w+\n)?CONTENT:\n```(?:\w*)\n([\s\S]*?)```/g;

  let match;
  while ((match = filePattern.exec(analysis)) !== null) {
    const filePath = match[1].trim();
    const content = match[2];

    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content);
      console.log("✅ Updated: " + filePath);
    } catch (e) {
      console.error("❌ Failed to update " + filePath + ":", e.message);
    }
  }
}

const command = process.argv[2];
const arg = process.argv.slice(3).join(" ");

if (command === "fix") {
  analyzeAndFix(arg).catch(console.error);
} else if (command === "generate") {
  generateExhaustiveTests(arg).catch(console.error);
} else {
  console.log("Usage:");
  console.log("  node claude_assistant.js fix <error_info>");
  console.log("  node claude_assistant.js generate <feature_name>");
}