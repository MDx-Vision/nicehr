describe('Login', () => {
  it('should login with valid credentials', () => {
    cy.visit('/login', { failOnStatusCode: false });
    
    cy.get('[data-testid="input-email"]')
      .type('test@example.com');
    
    cy.get('[data-testid="input-password"]')
      .type('password123');
    
    cy.get('[data-testid="button-login"]')
      .click();
    
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });
});
