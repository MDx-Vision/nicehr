// Remote Support E2E Test Support File

// Import commands
import './commands';

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore Daily.co and WebSocket errors in tests
  if (err.message.includes('Daily') || err.message.includes('WebSocket')) {
    return false;
  }
  return true;
});

// Add custom assertions
beforeEach(() => {
  // Reset database state before each test if needed
});
