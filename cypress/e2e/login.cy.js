describe('Login', () => {
  it('should login with valid credentials', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"], input[type="email"], [data-testid="input-email"]')
      .type('test@example.com');
    
    cy.get('input[name="password"], input[type="password"], [data-testid="input-password"]')
      .type('password123');
    
    cy.get('button[type="submit"], [data-testid="button-login"], [data-testid="button-submit"]')
      .click();
    
    cy.url().should('include', '/dashboard')
      .or('contain', 'Welcome, test@example.com');
  });
});
