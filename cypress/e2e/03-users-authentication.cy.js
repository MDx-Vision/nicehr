describe('User Authentication & Session Management', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    invalidEmail: 'invalid@email.com',
    invalidPassword: 'wrongpassword',
    name: 'Test User'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  describe('Login Flow', () => {
    beforeEach(() => {
      cy.visit('/login', { failOnStatusCode: false });
    });

    it('should display login page correctly', () => {
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="input-email"]')
        .should('be.visible')
        .and('have.attr', 'type', 'email')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-password"]')
        .should('be.visible')
        .and('have.attr', 'type', 'password')
        .and('have.attr', 'required');
      cy.get('[data-testid="button-login"]').should('be.visible').and('not.be.disabled');
      cy.title().should('contain', 'Login');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]').should('be.visible').and('contain', 'Email is required');
      cy.get('[data-testid="error-password"]').should('be.visible').and('contain', 'Password is required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]').type('invalid-email');
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]').should('be.visible').and('contain', 'Invalid email format');
    });

    it('should handle invalid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginFailed');

      cy.get('[data-testid="input-email"]').type(testUser.invalidEmail);
      cy.get('[data-testid="input-password"]').type(testUser.invalidPassword);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginFailed');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid credentials');
      cy.url().should('include', '/login');
    });

    it('should handle server errors', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('loginError');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'An error occurred. Please try again.');
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 1,
            email: testUser.email,
            name: testUser.name,
            role: 'admin'
          },
          token: 'mock-jwt-token'
        }
      }).as('loginSuccess');

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          name: testUser.name,
          role: 'admin'
        }
      }).as('getUser');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginSuccess');
      cy.wait('@getUser');
      cy.url().should('not.include', '/login');
      cy.url().should('include', '/dashboard');
    });

    it('should show loading state during login', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email, name: testUser.name, role: 'admin' } },
        delay: 1000
      }).as('loginDelay');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.get('[data-testid="button-login"]')
        .should('be.disabled')
        .and('contain', 'Signing in...');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');

      cy.wait('@loginDelay');
    });

    it('should handle password visibility toggle', () => {
      cy.get('[data-testid="input-password"]').type('testpassword');
      cy.get('[data-testid="toggle-password-visibility"]').should('be.visible');
      
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
      cy.get('[data-testid="toggle-password-visibility"]').click();
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'text');
      cy.get('[data-testid="toggle-password-visibility"]').click();
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="input-email"]').should('be.focused');
      cy.get('[data-testid="input-email"]').type(testUser.email).tab();
      cy.get('[data-testid="input-password"]').should('be.focused');
      cy.get('[data-testid="input-password"]').type(testUser.password).tab();
      cy.get('[data-testid="button-login"]').should('be.focused');
    });

    it('should submit form on Enter key', () => {
      cy.intercept('POST', '/api/auth/login').as('loginAttempt');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password).type('{enter}');

      cy.wait('@loginAttempt');
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      // Mock successful login
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          name: testUser.name,
          role: 'admin'
        }
      }).as('getUser');
    });

    it('should maintain session across page refreshes', () => {
      cy.visit('/dashboard');
      cy.wait('@getUser');
      
      cy.reload();
      cy.wait('@getUser');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should handle expired sessions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedUser');

      cy.visit('/dashboard');
      cy.wait('@unauthorizedUser');
      cy.url().should('include', '/login');
      cy.get('[data-testid="error-message"]').should('contain', 'Session expired');
    });

    it('should logout successfully', () => {
      cy.visit('/dashboard');
      cy.wait('@getUser');

      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="logout-button"]').click();

      cy.url().should('include', '/login');
      cy.get('[data-testid="success-message"]').should('contain', 'Logged out successfully');
    });

    it('should redirect unauthenticated users to login', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedAccess');

      cy.visit('/dashboard');
      cy.wait('@unauthorizedAccess');
      cy.url().should('include', '/login');
    });

    it('should preserve redirect URL after login', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedAccess');

      cy.visit('/projects/123');
      cy.wait('@unauthorizedAccess');
      cy.url().should('include', '/login');
      cy.url().should('include', 'redirect=%2Fprojects%2F123');

      // Complete login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email, name: testUser.name, role: 'admin' } }
      }).as('loginSuccess');

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: testUser.email, name: testUser.name, role: 'admin' }
      }).as('getUser');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginSuccess');
      cy.wait('@getUser');
      cy.url().should('include', '/projects/123');
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.visit('/login', { failOnStatusCode: false });
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@networkError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Network error. Please check your connection.');
    });

    it('should handle rate limiting', () => {
      cy.visit('/login', { failOnStatusCode: false });
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 429,
        body: { error: 'Too many attempts. Please try again later.' }
      }).as('rateLimited');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@rateLimited');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Too many attempts');
      cy.get('[data-testid="button-login"]').should('be.disabled');
    });

    it('should clear errors on input change', () => {
      cy.visit('/login', { failOnStatusCode: false });
      
      // Trigger validation error
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]').should('be.visible');

      // Error should clear when user starts typing
      cy.get('[data-testid="input-email"]').type('t');
      cy.get('[data-testid="error-email"]').should('not.exist');
    });
  });

  describe('Accessibility & UX', () => {
    beforeEach(() => {
      cy.visit('/login', { failOnStatusCode: false });
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="login-form"]').should('have.attr', 'role', 'form');
      cy.get('[data-testid="input-email"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="input-password"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="button-login"]').should('have.attr', 'type', 'submit');
    });

    it('should support high contrast mode', () => {
      cy.get('[data-testid="login-form"]').should('have.css', 'background-color');
      cy.get('[data-testid="input-email"]').should('have.css', 'border');
      cy.get('[data-testid="button-login"]').should('have.css', 'background-color');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('have.css', 'width');
      cy.get('[data-testid="input-password"]').should('have.css', 'width');
      cy.get('[data-testid="button-login"]').should('have.css', 'width');
    });

    it('should handle focus trapping', () => {
      cy.get('[data-testid="input-email"]').focus().tab();
      cy.get('[data-testid="input-password"]').should('be.focused').tab();
      cy.get('[data-testid="button-login"]').should('be.focused').tab();
      // Should cycle back to first focusable element
      cy.get('[data-testid="input-email"]').should('be.focused');
    });
  });
});
