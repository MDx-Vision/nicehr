describe('Authentication System', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    invalidEmail: 'invalid@email.com',
    invalidPassword: 'wrongpassword'
  };

  beforeEach(() => {
    // Clear any existing auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  describe('Login Page UI Elements', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display all login form elements correctly', () => {
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.visible').and('have.attr', 'type', 'email');
      cy.get('[data-testid="input-password"]').should('be.visible').and('have.attr', 'type', 'password');
      cy.get('[data-testid="button-login"]').should('be.visible').and('not.be.disabled');
      cy.get('label[for="email"]').should('contain.text', 'Email');
      cy.get('label[for="password"]').should('contain.text', 'Password');
    });

    it('should have proper form attributes and accessibility', () => {
      cy.get('[data-testid="input-email"]')
        .should('have.attr', 'required')
        .and('have.attr', 'autocomplete', 'email');
      cy.get('[data-testid="input-password"]')
        .should('have.attr', 'required')
        .and('have.attr', 'autocomplete', 'current-password');
      cy.get('[data-testid="login-form"]').should('have.attr', 'novalidate');
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

    it('should have proper focus management', () => {
      cy.get('[data-testid="input-email"]').should('be.focused');
      cy.get('[data-testid="input-email"]').tab();
      cy.get('[data-testid="input-password"]').should('be.focused');
      cy.get('[data-testid="input-password"]').tab();
      cy.get('[data-testid="button-login"]').should('be.focused');
    });

    it('should handle keyboard navigation', () => {
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="input-password"]').type('{enter}');
      // Should attempt login on Enter key
      cy.intercept('POST', '/api/auth/login').as('loginAttempt');
      cy.wait('@loginAttempt');
    });
  });

  describe('Login Form Validation', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]').should('be.visible').and('contain.text', 'Email is required');
      cy.get('[data-testid="error-password"]').should('be.visible').and('contain.text', 'Password is required');
      cy.url().should('include', '/login');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]').type('invalid-email');
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]').should('be.visible').and('contain.text', 'Please enter a valid email');
    });

    it('should validate minimum password length', () => {
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type('123');
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-password"]').should('be.visible').and('contain.text', 'Password must be at least');
    });

    it('should clear validation errors when correcting input', () => {
      // Trigger validation errors
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]').should('be.visible');
      
      // Fix email input
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="error-email"]').should('not.exist');
      
      // Fix password input
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="error-password"]').should('not.exist');
    });

    it('should validate special characters in email', () => {
      const specialEmails = [
        'test+label@example.com',
        'test.name@example.com',
        'test_name@example-domain.com',
        'test123@sub.example.co.uk'
      ];

      specialEmails.forEach(email => {
        cy.get('[data-testid="input-email"]').clear().type(email);
        cy.get('[data-testid="input-password"]').clear().type(testUser.password);
        cy.get('[data-testid="error-email"]').should('not.exist');
      });
    });
  });

  describe('Login Authentication Flow', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '/api/auth/login', { 
        statusCode: 200, 
        body: { 
          user: { id: 1, email: testUser.email, role: 'admin' },
          token: 'mock-jwt-token'
        }
      }).as('loginRequest');

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { 
          id: 1, 
          email: testUser.email, 
          role: 'admin',
          name: 'Test User'
        }
      }).as('userRequest');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginRequest').its('request.body').should('deep.equal', {
        email: testUser.email,
        password: testUser.password
      });

      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.get('[data-testid="button-logout"]').should('be.visible');
    });

    it('should show loading state during login', () => {
      cy.intercept('POST', '/api/auth/login', { delay: 1000, statusCode: 200, body: {} }).as('slowLogin');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.get('[data-testid="button-login"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.disabled');
      cy.get('[data-testid="input-password"]').should('be.disabled');
    });

    it('should handle invalid credentials error', () => {
      cy.intercept('POST', '/api/auth/login', { 
        statusCode: 401, 
        body: { error: 'Invalid email or password' }
      }).as('failedLogin');

      cy.get('[data-testid="input-email"]').type(testUser.invalidEmail);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@failedLogin');
      cy.get('[data-testid="error-message"]').should('be.visible').and('contain.text', 'Invalid email or password');
      cy.url().should('include', '/login');
      cy.get('[data-testid="button-login"]').should('not.be.disabled');
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
      cy.get('[data-testid="error-message"]').should('be.visible').and('contain.text', 'Something went wrong');
      cy.url().should('include', '/login');
    });

    it('should handle network errors', () => {
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@networkError');
      cy.get('[data-testid="error-message"]').should('be.visible').and('contain.text', 'Network error');
    });

    it('should clear error messages on new login attempt', () => {
      // First failed attempt
      cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { error: 'Invalid credentials' } }).as('failedLogin');
      
      cy.get('[data-testid="input-email"]').type(testUser.invalidEmail);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@failedLogin');
      cy.get('[data-testid="error-message"]').should('be.visible');

      // Second attempt should clear error
      cy.get('[data-testid="input-email"]').clear().type(testUser.email);
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { 
          id: 1, 
          email: testUser.email, 
          role: 'admin',
          name: 'Test User'
        }
      }).as('userRequest');
    });

    it('should persist session across page refresh', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit('/dashboard');
      
      cy.reload();
      cy.wait('@userRequest');
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should redirect to login when session expires', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit('/dashboard');

      // Simulate expired session
      cy.intercept('GET', '/api/auth/user', { statusCode: 401 }).as('expiredSession');
      cy.reload();
      
      cy.wait('@expiredSession');
      cy.url().should('include', '/login');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Session expired');
    });

    it('should handle logout functionality', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit('/dashboard');

      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="button-logout"]').click();

      cy.url().should('include', '/login');
      cy.get('[data-testid="input-email"]').should('be.visible');
      
      // Verify cookies/storage cleared
      cy.getCookies().should('be.empty');
    });

    it('should redirect to original destination after login', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.url().should('include', '/dashboard');
    });

    it('should handle concurrent sessions', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit('/dashboard');

      // Simulate logout in another tab
      cy.clearCookies();
      cy.intercept('GET', '/api/auth/user', { statusCode: 401 }).as('invalidSession');
      
      cy.get('[data-testid="nav-projects"]').click();
      cy.wait('@invalidSession');
      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes Access Control', () => {
    const protectedRoutes = [
      '/dashboard',
      '/hospitals',
      '/consultants', 
      '/projects',
      '/admin',
      '/settings'
    ];

    it('should redirect unauthenticated users to login', () => {
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/login');
        cy.get('[data-testid="input-email"]').should('be.visible');
      });
    });

    it('should allow authenticated users to access protected routes', () => {
      cy.login(testUser.email, testUser.password);
      
      const accessibleRoutes = ['/dashboard', '/hospitals', '/consultants', '/projects'];
      accessibleRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', route);
        cy.get('[data-testid="user-menu"]').should('be.visible');
      });
    });

    it('should handle admin-only routes', () => {
      // Login as non-admin user
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 2, email: 'user@example.com', role: 'user' }
      }).as('userRequest');
      
      cy.login('user@example.com', testUser.password);
      cy.visit('/admin');
      
      cy.url().should('not.include', '/admin');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Access denied');
    });
  });

  describe('User Profile and Settings', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password);
    });

    it('should display user information in header', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      cy.get('[data-testid="user-menu"]').click();
      cy.get('[data-testid="user-name"]').should('contain.text', 'Test User');
      cy.get('[data-testid="user-email"]').should('contain.text', testUser.email);
      cy.get('[data-testid="user-role"]').should('contain.text', 'admin');
    });

    it('should allow updating user profile', () => {
      cy.intercept('PUT', '/api/users/1', { statusCode: 200, body: { success: true } }).as('updateProfile');
      
      cy.visit('/settings');
      cy.get('[data-testid="input-name"]').clear().type('Updated Name');
      cy.get('[data-testid="input-email"]').should('have.value', testUser.email);
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateProfile');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile updated');
    });

    it('should handle account settings retrieval', () => {
      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Test User',
          email: testUser.email,
          preferences: {
            notifications: true,
            theme: 'light'
          }
        }
      }).as('getSettings');

      cy.visit('/settings');
      cy.wait('@getSettings');
      cy.get('[data-testid="input-name"]').should('have.value', 'Test User');
      cy.get('[data-testid="checkbox-notifications"]').should('be.checked');
    });

    it('should handle account deletion request', () => {
      cy.intercept('POST', '/api/account/delete-request', { statusCode: 200, body: { success: true } }).as('deleteRequest');
      
      cy.visit('/settings');
      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="confirm-delete-account"]').click();
      
      cy.wait('@deleteRequest');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Delete request submitted');
    });
  });

  describe('Role-Based UI Elements', () => {
    it('should show admin navigation for admin users', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: testUser.email, role: 'admin' }
      }).as('adminUser');

      cy.login(testUser.email, testUser.password);
      cy.wait('@adminUser');
      cy.visit('/dashboard');

      cy.get('[data-testid="nav-admin"]').should('be.visible');
      cy.get('[data-testid="nav-settings"]').should('be.visible');
      cy.get('[data-testid="nav-access-control"]').should('be.visible');
    });

    it('should hide admin navigation for regular users', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 2, email: 'user@example.com', role: 'user' }
      }).as('regularUser');

      cy.login('user@example.com', testUser.password);
      cy.wait('@regularUser');
      cy.visit('/dashboard');

      cy.get('[data-testid="nav-admin"]').should('not.exist');
      cy.get('[data-testid="nav-access-control"]').should('not.exist');
    });

    it('should show role-specific dashboard stats', () => {
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalHospitals: 10,
          totalConsultants: 50,
          activeProjects: 15,
          adminOnlyStats: true
        }
      }).as('dashboardStats');

      cy.login(testUser.email, testUser.password);
      cy.visit('/dashboard');
      cy.wait('@dashboardStats');

      cy.get('[data-testid="stat-hospitals"]').should('contain.text', '10');
      cy.get('[data-testid="stat-consultants"]').should('contain.text', '50');
      cy.get('[data-testid="stat-projects"]').should('contain.text', '15');
      cy.get('[data-testid="admin-stats"]').should('be.visible');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      cy.get('[data-testid="input-email"]').type(longEmail);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();
      
      // Should either handle gracefully or show appropriate error
      cy.get('[data-testid="error-message"], [data-testid="error-email"]').should('be.visible');
    });

    it('should handle special characters in password', () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(specialPassword);
      cy.get('[data-testid="button-login"]').click();
      
      // Should make login attempt with special characters
      cy.intercept('POST', '/api/auth/login').as('loginAttempt');
      cy.wait('@loginAttempt').its('request.body.password').should('equal', specialPassword);
    });

    it('should handle SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      cy.get('[data-testid="input-email"]').type(sqlInjection);
      cy.get('[data-testid="input-password"]').type(sqlInjection);
      cy.get('[data-testid="button-login"]').click();
      
      cy.get('[data-testid="error-email"]').should('be.visible');
    });

    it('should handle XSS attempts in form inputs', () => {
      const xssAttempt = '<script>alert("xss")</script>';
      cy.get('[data-testid="input-email"]').type(xssAttempt);
      cy.get('[data-testid="input-password"]').type(xssAttempt);
      
      // Values should be escaped/sanitized
      cy.get('[data-testid="input-email"]').should('not.contain.html', '<script>');
    });

    it('should handle rapid form submissions', () => {
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      
      // Rapidly click login button
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="button-login"]').click();
      }
      
      // Should prevent multiple simultaneous requests
      cy.get('[data-testid="button-login"]').should('be.disabled');
    });

    it('should handle browser back/forward after login', () => {
      cy.login(testUser.email, testUser.password);
      cy.visit('/dashboard');
      cy.visit('/hospitals');
      
      cy.go('back');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="user-menu"]').should('be.visible');
      
      cy.go('forward');
      cy.url().should('include', '/hospitals');
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="login-form"]').should('be.visible');
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
      
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.visible');
      cy.get('[data-testid="input-password"]').should('be.visible');
    });

    it('should handle touch interactions', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="input-email"]').click();
      cy.get('[data-testid="input-email"]').should('be.focused');
      
      cy.get('[data-testid="toggle-password-visibility"]').click();
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'text');
    });
  });

  describe('Performance and Accessibility', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should load login page quickly', () => {
      const startTime = Date.now();
      cy.get('[data-testid="login-form"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it('should be accessible via keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'input-email');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'input-password');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'button-login');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="login-form"]').should('have.attr', 'role');
      cy.get('[data-testid="input-email"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="input-password"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="error-message"]').should('have.attr', 'role', 'alert');
    });

    it('should work with screen readers', () => {
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-email"]')
        .should('have.attr', 'aria-live', 'polite')
        .and('be.visible');
    });
  });
});
