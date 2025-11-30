describe('Error Handling', () => {
  describe('Login Error Handling', () => {
    it('should display error message for invalid credentials', () => {
      // Step 1: Visit /login
      cy.visit('/login');
      
      // Verify we're on the login page
      cy.get('[data-testid="text-login-title"]').should('contain', 'Sign In');
      cy.url().should('include', '/login');
      
      // Step 2: Enter valid email but incorrect password
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('wrongpassword');
      
      // Step 3: Click the login button
      cy.get('[data-testid="button-login"]').click();
      
      // Step 4: Assert that the error message is visible
      // The toast notification should appear with the error message
      cy.contains('Login failed').should('be.visible');
      cy.contains('Invalid email or password').should('be.visible');
      
      // Assert that the URL does not change (still on /login)
      cy.url().should('include', '/login');
      
      // Verify we're still on the login page
      cy.get('[data-testid="text-login-title"]').should('contain', 'Sign In');
    });

    it('should display error message for non-existent user', () => {
      // Visit /login
      cy.visit('/login');
      
      // Enter a non-existent email with any password
      cy.get('[data-testid="input-email"]').type('nonexistent@example.com');
      cy.get('[data-testid="input-password"]').type('somepassword');
      
      // Click the login button
      cy.get('[data-testid="button-login"]').click();
      
      // Assert that the error message is visible
      cy.contains('Login failed').should('be.visible');
      cy.contains('Invalid email or password').should('be.visible');
      
      // Assert that the URL does not change
      cy.url().should('include', '/login');
    });

    it('should not submit form with empty fields', () => {
      // Visit /login
      cy.visit('/login');
      
      // Try to click login without entering any credentials
      // The form uses HTML5 required validation, so the form won't submit
      cy.get('[data-testid="button-login"]').click();
      
      // URL should still be /login
      cy.url().should('include', '/login');
      
      // The login title should still be visible
      cy.get('[data-testid="text-login-title"]').should('contain', 'Sign In');
    });
  });
});
