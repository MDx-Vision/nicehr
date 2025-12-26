describe('Error Handling', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  describe('Login Error Handling', () => {
    it('should display error message for invalid credentials', () => {
      // Mock failed login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid email or password' }
      }).as('failedLogin');

      cy.visit('/login', { failOnStatusCode: false });

      // Verify we're on the login page
      cy.get('[data-testid="text-login-title"]').should('contain', 'Sign In');
      cy.url().should('include', '/login');

      // Enter credentials
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('wrongpassword');

      // Click the login button
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@failedLogin');

      // Assert that the error message is visible (via toast or error div)
      cy.get('[data-testid="error-message"]').should('be.visible');

      // Assert that the URL does not change (still on /login)
      cy.url().should('include', '/login');
    });

    it('should display error message for non-existent user', () => {
      // Mock failed login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid email or password' }
      }).as('failedLogin');

      cy.visit('/login', { failOnStatusCode: false });

      // Enter a non-existent email with any password
      cy.get('[data-testid="input-email"]').type('nonexistent@example.com');
      cy.get('[data-testid="input-password"]').type('somepassword');

      // Click the login button
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@failedLogin');

      // Assert that the error message is visible
      cy.get('[data-testid="error-message"]').should('be.visible');

      // Assert that the URL does not change
      cy.url().should('include', '/login');
    });

    it('should require email and password fields', () => {
      cy.visit('/login', { failOnStatusCode: false });

      // The form uses HTML5 required validation
      cy.get('[data-testid="input-email"]').should('have.attr', 'required');
      cy.get('[data-testid="input-password"]').should('have.attr', 'required');

      // URL should still be /login
      cy.url().should('include', '/login');

      // The login title should still be visible
      cy.get('[data-testid="text-login-title"]').should('contain', 'Sign In');
    });
  });
});
