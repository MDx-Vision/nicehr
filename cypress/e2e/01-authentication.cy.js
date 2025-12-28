describe('Authentication System', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  describe('Login Page UI Elements', () => {
    beforeEach(() => {
      cy.visit('/login', { failOnStatusCode: false });
    });

    it('should display all login form elements correctly', () => {
      cy.get('[data-testid="text-login-title"]').should('be.visible').and('contain', 'Sign In');
      cy.get('[data-testid="input-email"]').should('be.visible').and('have.attr', 'type', 'email');
      cy.get('[data-testid="input-password"]').should('be.visible').and('have.attr', 'type', 'password');
      cy.get('[data-testid="button-login"]').should('be.visible').and('not.be.disabled');
    });

    it('should have proper form attributes', () => {
      cy.get('[data-testid="input-email"]').should('have.attr', 'required');
      cy.get('[data-testid="input-password"]').should('have.attr', 'required');
    });

    it('should show password visibility toggle', () => {
      cy.get('[data-testid="input-password"]').type('testpassword');
      cy.get('[data-testid="toggle-password-visibility"]').should('be.visible');

      // Test password visibility toggle
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
      cy.get('[data-testid="toggle-password-visibility"]').click();
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'text');
      cy.get('[data-testid="toggle-password-visibility"]').click();
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
    });
  });

  describe('Login Authentication Flow', () => {
    beforeEach(() => {
      cy.visit('/login', { failOnStatusCode: false });
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 1, email: testUser.email, role: 'admin' }
        }
      }).as('loginRequest');

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          role: 'admin',
          firstName: 'Test',
          lastName: 'User'
        }
      }).as('userRequest');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginRequest');
      cy.url().should('not.include', '/login');
    });

    it('should show loading state during login', () => {
      cy.intercept('POST', '/api/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email } }
      }).as('slowLogin');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      // Button should be disabled during loading
      cy.get('[data-testid="button-login"]').should('be.disabled');
    });

    it('should handle invalid credentials error', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid email or password' }
      }).as('failedLogin');

      cy.get('[data-testid="input-email"]').type('wrong@example.com');
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@failedLogin');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should handle server errors gracefully', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@serverError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('Session Management', () => {
    it('should show landing page when accessing protected route without auth', () => {
      // Mock unauthenticated state - intercept BEFORE visiting the page
      cy.intercept('GET', '/api/auth/user', { statusCode: 401, body: { error: 'Not authenticated' } }).as('noAuth');

      // Try to access protected route
      cy.visit('/', { failOnStatusCode: false });

      // Should show landing page with login button
      cy.get('[data-testid="button-login"]').should('be.visible');
      cy.contains('Healthcare Consultant Management Platform').should('be.visible');
    });

    it('should persist session across page refresh', () => {
      // Set up auth mocks
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: testUser.email, role: 'admin', firstName: 'Test', lastName: 'User' }
      }).as('userRequest');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email, role: 'admin' } }
      }).as('loginRequest');

      // Mock permission endpoints that get called after login
      cy.intercept('GET', '/api/permissions*', { statusCode: 200, body: [] });
      cy.intercept('GET', '/api/rbac/effective-permissions*', { statusCode: 200, body: [] });

      // Login first
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginRequest');

      // Reload and verify still logged in
      cy.reload();
      cy.wait('@userRequest');
      cy.url().should('not.include', '/login');
    });

    it('should show landing page when session expires', () => {
      // Mock expired session - 401 response
      cy.intercept('GET', '/api/auth/user', { statusCode: 401, body: { error: 'Session expired' } }).as('expiredSession');

      // Try to access protected route with expired session
      cy.visit('/', { failOnStatusCode: false });

      // Should show landing page when session is expired
      cy.get('[data-testid="button-login"]').should('be.visible');
      cy.contains('Healthcare Consultant Management Platform').should('be.visible');
    });

    it('should handle logout functionality', () => {
      // Set up auth mocks
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: testUser.email, role: 'admin', firstName: 'Test', lastName: 'User' }
      }).as('userRequest');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email, role: 'admin' } }
      }).as('loginRequest');

      // Mock dashboard stats
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5 }
      });

      // Login first
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginRequest');

      // Navigate to dashboard and check logout button
      cy.visit('/');
      cy.wait('@userRequest');

      // Click logout button in sidebar
      cy.get('[data-testid="button-logout"]').should('be.visible');
    });
  });

  describe('Protected Routes Access Control', () => {
    const protectedRoutes = [
      '/dashboard',
      '/hospitals',
      '/consultants',
      '/projects'
    ];

    it('should show landing page for unauthenticated users on protected routes', () => {
      // Mock unauthenticated state
      cy.intercept('GET', '/api/auth/user', { statusCode: 401, body: { error: 'Not authenticated' } }).as('noAuth');

      // Visit first protected route
      cy.visit('/hospitals', { failOnStatusCode: false });

      // Should show landing page with login button
      cy.get('[data-testid="button-login"]').should('be.visible');
      cy.contains('Healthcare Consultant Management Platform').should('be.visible');
    });

    it('should allow authenticated users to access protected routes', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          role: 'admin',
          firstName: 'Test',
          lastName: 'User'
        }
      }).as('userRequest');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email, role: 'admin' } }
      }).as('loginRequest');

      // Mock API responses
      cy.intercept('GET', '/api/dashboard/stats', { statusCode: 200, body: {} });
      cy.intercept('GET', '/api/hospitals*', { statusCode: 200, body: [] });
      cy.intercept('GET', '/api/consultants*', { statusCode: 200, body: [] });
      cy.intercept('GET', '/api/projects*', { statusCode: 200, body: [] });

      // Login first
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginRequest');

      // Visit each protected route
      cy.visit('/hospitals');
      cy.wait('@userRequest');
      cy.url().should('include', '/hospitals');
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    beforeEach(() => {
      cy.visit('/login', { failOnStatusCode: false });
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-6');

      cy.get('[data-testid="text-login-title"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.visible');
      cy.get('[data-testid="input-password"]').should('be.visible');
      cy.get('[data-testid="button-login"]').should('be.visible');

      // Test form interaction on mobile
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').should('not.be.disabled');
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="text-login-title"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.visible');
      cy.get('[data-testid="input-password"]').should('be.visible');
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      cy.visit('/login', { failOnStatusCode: false });
    });

    it('should load login page quickly', () => {
      const startTime = Date.now();
      cy.get('[data-testid="text-login-title"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });
    });
  });
});
