// ***********************************************
// NICEHR Platform - Custom Cypress Commands
// ***********************************************

// Login command for reuse across all tests
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-testid="input-email"]').type(email);
  cy.get('[data-testid="input-password"]').type(password);
  cy.get('[data-testid="button-login"]').click();
  cy.url().should('not.include', '/login');
});

// Login via API (faster for tests that don't test login itself)
Cypress.Commands.add('loginViaApi', (email = 'test@example.com', password = 'password123') => {
  cy.request('POST', '/api/auth/login', { email, password }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

// Navigate to a specific module
Cypress.Commands.add('navigateTo', (moduleName) => {
  const routes = {
    dashboard: '/',
    hospitals: '/hospitals',
    projects: '/projects',
    consultants: '/consultants',
    timesheets: '/timesheets',
    schedules: '/schedules',
    training: '/training',
    tickets: '/support-tickets',
    expenses: '/expenses',
    invoices: '/invoices',
    travel: '/travel',
    chat: '/chat',
    reports: '/reports',
    analytics: '/analytics',
    compliance: '/compliance',
    integrations: '/integrations',
    users: '/users',
    roles: '/roles',
  };
  cy.visit(routes[moduleName] || moduleName);
});

// Select from Radix UI Select component
Cypress.Commands.add('selectOption', (triggerSelector, optionText) => {
  cy.get(triggerSelector).click();
  cy.get('[role="listbox"]').should('be.visible');
  cy.get('[role="option"]').contains(optionText).click({ force: true });
});

// Wait for API response
Cypress.Commands.add('waitForApi', (method, urlPattern) => {
  cy.intercept(method, urlPattern).as('apiCall');
  cy.wait('@apiCall');
});

// Fill form field by test ID
Cypress.Commands.add('fillField', (testId, value) => {
  cy.get(`[data-testid="${testId}"]`).clear().type(value);
});

// Click button by test ID
Cypress.Commands.add('clickButton', (testId) => {
  cy.get(`[data-testid="${testId}"]`).click();
});

// Assert toast/notification message
Cypress.Commands.add('assertToast', (message) => {
  cy.get('[role="alert"], [data-testid="toast"], .toast').should('contain', message);
});

// Check table row exists
Cypress.Commands.add('tableRowExists', (text) => {
  cy.get('table tbody tr').should('contain', text);
});

// Check table row does not exist
Cypress.Commands.add('tableRowNotExists', (text) => {
  cy.get('table tbody tr').should('not.contain', text);
});

// Open modal/dialog
Cypress.Commands.add('openModal', (buttonTestId) => {
  cy.get(`[data-testid="${buttonTestId}"]`).click();
  cy.get('[role="dialog"]').should('be.visible');
});

// Close modal/dialog
Cypress.Commands.add('closeModal', () => {
  cy.get('[role="dialog"] button[aria-label="Close"], [data-testid="button-close"]').click({ force: true });
  cy.get('[role="dialog"]').should('not.exist');
});

// Upload file
Cypress.Commands.add('uploadFile', (selector, fileName, mimeType) => {
  cy.fixture(fileName, 'base64').then((fileContent) => {
    cy.get(selector).attachFile({
      fileContent,
      fileName,
      mimeType,
      encoding: 'base64',
    });
  });
});

// Check element has specific status/badge
Cypress.Commands.add('hasStatus', (selector, status) => {
  cy.get(selector).should('contain', status);
});

// Wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="loading"], .loading-spinner').should('not.exist');
});
