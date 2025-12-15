describe('Navigation', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('should navigate to Settings and back to dashboard using browser back button', () => {
    // Step 1: Assert the user is logged in (on the dashboard)
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    
    // Step 2: Click the link for 'Settings'
    cy.get('[data-testid="nav-settings"]').click();
    
    // Step 3: Assert the URL includes /settings
    cy.url().should('include', '/settings');
    
    // Step 4: Click the browser's back button
    cy.go('back');
    
    // Assert the user returns to the dashboard (root path)
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });
});
