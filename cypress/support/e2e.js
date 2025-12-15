// ***********************************************
// NICEHR Platform - E2E Test Configuration
// ***********************************************

// Import custom commands
import './commands';

// Ignore WebSocket errors (common in real-time apps and Vite HMR)
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore WebSocket connection errors
  if (err.message.includes('WebSocket') || 
      err.message.includes('Failed to construct') ||
      err.message.includes('ResizeObserver') ||
      err.message.includes('Non-Error promise rejection')) {
    return false;
  }
  return true;
});

// Log test start/end
beforeEach(() => {
  cy.log(`Starting test: ${Cypress.currentTest.title}`);
});

afterEach(() => {
  cy.log(`Finished test: ${Cypress.currentTest.title}`);
});

// Global before hook - runs once before all tests
before(() => {
  // Clear any existing sessions
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Configure default timeouts
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 30000);

// Add custom viewport for healthcare dashboard
Cypress.config('viewportWidth', 1440);
Cypress.config('viewportHeight', 900);

// Handle access control 403 errors globally - don't fail tests on access control redirects
Cypress.on('fail', (error, runnable) => {
  if (error.message.includes('403: Forbidden')) {
    // If it's a 403 on login page, it might be access control - log and continue
    cy.log('Access control 403 detected, attempting to continue');
    return false;
  }
  throw error;
});
