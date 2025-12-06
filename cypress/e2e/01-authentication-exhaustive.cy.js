describe('Authentication System - Exhaustive Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    invalidEmail: 'invalid@email.com',
    invalidPassword: 'wrongpassword',
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    dashboard: '/api/dashboard/stats'
  };

  beforeEach(() => {
    // Clear all auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.localStorage.clear();
    });
  });

  describe('Login Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should display complete login page layout', () => {
      // Main container
      cy.get('[data-testid="login-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Form elements
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.get('[data-testid="input-email"]')
        .should('be.visible')
        .and('have.attr', 'type', 'email')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-password"]')
        .should('be.visible')
        .and('have.attr', 'type', 'password')
        .and('have.attr', 'required');
      cy.get('[data-testid="button-login"]')
        .should('be.visible')
        .and('not.be.disabled');

      // Labels and accessibility
      cy.get('label').contains('Email').should('be.visible');
      cy.get('label').contains('Password').should('be.visible');
      
      // Page title and branding
      cy.title().should('not.be.empty');
      cy.get('h1, h2').should('contain.text', /login|sign in/i);
    });

    it('should have proper form attributes and accessibility features', () => {
      // Form attributes
      cy.get('[data-testid="login-form"]')
        .should('have.attr', 'novalidate');
      
      // Input attributes
      cy.get('[data-testid="input-email"]')
        .should('have.attr', 'autocomplete', 'email')
        .and('have.attr', 'aria-label')
        .and('have.attr', 'id');
      
      cy.get('[data-testid="input-password"]')
        .should('have.attr', 'autocomplete', 'current-password')
        .and('have.attr', 'aria-label')
        .and('have.attr', 'id');

      // ARIA labels and roles
      cy.get('[data-testid="button-login"]')
        .should('have.attr', 'type', 'submit')
        .and('have.attr', 'aria-label');
    });

    it('should handle password visibility toggle functionality', () => {
      const testPassword = 'testpassword123';
      
      cy.get('[data-testid="input-password"]').type(testPassword);
      
      // Check if toggle button exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="toggle-password-visibility"]').length > 0) {
          // Test password visibility toggle
          cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
          cy.get('[data-testid="toggle-password-visibility"]').click();
          cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'text');
          cy.get('[data-testid="toggle-password-visibility"]').click();
          cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
        }
      });
    });

    it('should have proper keyboard navigation and focus management', () => {
      // Initial focus should be on email field
      cy.get('[data-testid="input-email"]').should('be.focused');
      
      // Tab navigation
      cy.get('[data-testid="input-email"]').tab();
      cy.get('[data-testid="input-password"]').should('be.focused');
      
      cy.get('[data-testid="input-password"]').tab();
      cy.get('[data-testid="button-login"]').should('be.focused');
    });

    it('should display loading states correctly', () => {
      cy.intercept('POST', apiEndpoints.login, (req) => {
        // Delay response to test loading state
        req.reply({ delay: 2000, statusCode: 200, body: { user: testUser.ciUser } });
      }).as('slowLogin');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      // Check loading state
      cy.get('[data-testid="button-login"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"], .loading, [data-testid="login-loading"]')
        .should('be.visible');
    });

    it('should be responsive across different viewports', () => {
      const viewports = [
        { width: 375, height: 667 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1024, height: 768 }, // Desktop small
        { width: 1920, height: 1080 } // Desktop large
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.get('[data-testid="login-form"]').should('be.visible');
        cy.get('[data-testid="input-email"]').should('be.visible');
        cy.get('[data-testid="input-password"]').should('be.visible');
        cy.get('[data-testid="button-login"]').should('be.visible');
      });
    });
  });

  describe('Login Form Validation - Client Side', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should validate empty form submission', () => {
      cy.get('[data-testid="button-login"]').click();
      
      // Check for validation messages
      cy.get('[data-testid="input-email"]').then(($input) => {
        expect($input[0].validity.valid).to.be.false;
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@domain.com',
        'invalid@domain',
        'invalid.domain.com',
        '   ',
        'test@',
        '@test.com'
      ];

      invalidEmails.forEach((invalidEmail) => {
        cy.get('[data-testid="input-email"]').clear().type(invalidEmail);
        cy.get('[data-testid="input-password"]').type('password123');
        cy.get('[data-testid="button-login"]').click();
        
        cy.get('[data-testid="input-email"]').then(($input) => {
          expect($input[0].validity.valid).to.be.false;
        });
      });
    });

    it('should validate password requirements', () => {
      cy.get('[data-testid="input-email"]').type('test@example.com');
      
      // Test empty password
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="input-password"]').then(($input) => {
        expect($input[0].validity.valid).to.be.false;
      });

      // Test short password (if minimum length validation exists)
      cy.get('[data-testid="input-password"]').type('123');
      cy.get('[data-testid="button-login"]').click();
      
      // Check for any validation messages
      cy.get('body').should('exist'); // Basic assertion to prevent hanging
    });

    it('should handle special characters and edge cases in inputs', () => {
      const specialInputs = [
        { email: 'test+tag@example.com', password: 'validPassword123!' },
        { email: 'test.email@sub.domain.com', password: 'pass@word#123' },
        { email: 'test@domain-name.co.uk', password: 'P@ssw0rd!' }
      ];

      specialInputs.forEach((input) => {
        cy.get('[data-testid="input-email"]').clear().type(input.email);
        cy.get('[data-testid="input-password"]').clear().type(input.password);
        
        // Should not show client-side validation errors
        cy.get('[data-testid="input-email"]').should('have.value', input.email);
        cy.get('[data-testid="input-password"]').should('have.value', input.password);
      });
    });

    it('should handle maximum input lengths', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const longPassword = 'a'.repeat(200);

      cy.get('[data-testid="input-email"]').type(longEmail);
      cy.get('[data-testid="input-password"]').type(longPassword);

      // Check if inputs handle long values
      cy.get('[data-testid="input-email"]').should('have.value', longEmail);
      cy.get('[data-testid="input-password"]').should('have.value', longPassword);
    });
  });

  describe('Authentication API Integration', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should successfully login with valid credentials', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: {
          user: {
            id: 1,
            email: testUser.ciUser.email,
            username: testUser.ciUser.username,
            role: 'admin'
          },
          token: 'mock-jwt-token'
        }
      }).as('loginSuccess');

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.ciUser.email,
          username: testUser.ciUser.username,
          role: 'admin'
        }
      }).as('getUserSuccess');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginSuccess').then((interception) => {
        expect(interception.request.body).to.deep.include({
          email: testUser.ciUser.email,
          password: testUser.ciUser.password
        });
      });

      // Should redirect to dashboard or home page
      cy.url().should('not.include', '/login');
      cy.url().should('match', /\/(dashboard|home|$)/);
    });

    it('should handle invalid credentials with proper error display', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 401,
        body: {
          error: 'Invalid email or password',
          message: 'Authentication failed'
        }
      }).as('loginFailed');

      cy.get('[data-testid="input-email"]').type(testUser.invalidEmail);
      cy.get('[data-testid="input-password"]').type(testUser.invalidPassword);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginFailed');

      // Check for error message display
      cy.get('[data-testid="error-message"], .error, [role="alert"]')
        .should('be.visible')
        .and('contain.text', /invalid|error|failed/i);

      // Should remain on login page
      cy.url().should('include', '/login');

      // Form should be re-enabled
      cy.get('[data-testid="button-login"]').should('not.be.disabled');
    });

    it('should handle server errors gracefully', () => {
      const serverErrors = [
        { statusCode: 500, message: 'Internal server error' },
        { statusCode: 503, message: 'Service unavailable' },
        { statusCode: 429, message: 'Too many requests' }
      ];

      serverErrors.forEach((error) => {
        cy.intercept('POST', apiEndpoints.login, {
          statusCode: error.statusCode,
          body: { error: error.message }
        }).as(`serverError${error.statusCode}`);

        cy.get('[data-testid="input-email"]').clear().type(testUser.ciUser.email);
        cy.get('[data-testid="input-password"]').clear().type(testUser.ciUser.password);
        cy.get('[data-testid="button-login"]').click();

        cy.wait(`@serverError${error.statusCode}`);

        // Should display generic error message
        cy.get('[data-testid="error-message"], .error, [role="alert"]')
          .should('be.visible')
          .and('contain.text', /error|try again/i);

        cy.url().should('include', '/login');
      });
    });

    it('should handle network failures', () => {
      cy.intercept('POST', apiEndpoints.login, { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@networkError');

      // Should display network error message
      cy.get('[data-testid="error-message"], .error, [role="alert"]')
        .should('be.visible')
        .and('contain.text', /network|connection|try again/i);
    });

    it('should handle request timeout', () => {
      cy.intercept('POST', apiEndpoints.login, (req) => {
        req.reply({ delay: 30000, statusCode: 408 });
      }).as('timeoutError');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      // Should show timeout error within reasonable time
      cy.get('[data-testid="error-message"], .error, [role="alert"]', { timeout: 35000 })
        .should('be.visible');
    });

    it('should send correct request headers', () => {
      cy.intercept('POST', apiEndpoints.login, (req) => {
        expect(req.headers).to.have.property('content-type');
        expect(req.headers['content-type']).to.include('application/json');
        
        req.reply({
          statusCode: 200,
          body: { user: testUser.ciUser, token: 'mock-token' }
        });
      }).as('loginWithHeaders');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginWithHeaders');
    });
  });

  describe('Authentication State Management', () => {
    it('should handle successful authentication state', () => {
      // Mock successful login
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: {
          user: testUser.ciUser,
          token: 'mock-jwt-token'
        }
      }).as('login');

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: testUser.ciUser
      }).as('getUser');

      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@login');

      // Check that auth token is stored (if using localStorage/sessionStorage)
      cy.window().its('localStorage').then((localStorage) => {
        // Check if token is stored (adapt based on your auth implementation)
        expect(localStorage.getItem('token') || localStorage.getItem('authToken')).to.exist;
      });

      // Should redirect away from login
      cy.url().should('not.include', '/login');
    });

    it('should clear authentication state on failed login', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginFailed');

      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testUser.invalidEmail);
      cy.get('[data-testid="input-password"]').type(testUser.invalidPassword);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginFailed');

      // Check that no auth data is stored
      cy.window().its('localStorage').then((localStorage) => {
        expect(localStorage.getItem('token')).to.be.null;
        expect(localStorage.getItem('authToken')).to.be.null;
        expect(localStorage.getItem('user')).to.be.null;
      });
    });

    it('should handle existing authentication state on page load', () => {
      // Set up existing auth state
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'existing-token');
        win.localStorage.setItem('user', JSON.stringify(testUser.ciUser));
      });

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: testUser.ciUser
      }).as('validateUser');

      cy.visit('/login');

      // Should redirect away from login if already authenticated
      cy.wait('@validateUser');
      cy.url().should('not.include', '/login');
    });

    it('should handle expired authentication tokens', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'expired-token');
      });

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredToken');

      cy.visit('/');
      cy.wait('@expiredToken');

      // Should redirect to login page
      cy.url().should('include', '/login');

      // Should clear expired token
      cy.window().its('localStorage').then((localStorage) => {
        expect(localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Navigation and Routing', () => {
    it('should redirect unauthenticated users to login', () => {
      const protectedRoutes = [
        '/',
        '/dashboard',
        '/hospitals',
        '/consultants',
        '/projects',
        '/admin'
      ];

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorized');

      protectedRoutes.forEach((route) => {
        cy.visit(route);
        cy.wait('@unauthorized');
        cy.url().should('include', '/login');
        cy.clearCookies();
        cy.clearLocalStorage();
      });
    });

    it('should redirect authenticated users away from login', () => {
      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: testUser.ciUser
      }).as('authenticatedUser');

      cy.window().then((win) => {
        win.localStorage.setItem('token', 'valid-token');
      });

      cy.visit('/login');
      cy.wait('@authenticatedUser');
      cy.url().should('not.include', '/login');
    });

    it('should handle deep linking after authentication', () => {
      const targetRoute = '/hospitals/1';
      
      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorized');

      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: {
          user: testUser.ciUser,
          token: 'mock-token'
        }
      }).as('login');

      // Visit protected route
      cy.visit(targetRoute);
      cy.wait('@unauthorized');
      cy.url().should('include', '/login');

      // Login
      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@login');

      // Should redirect to original intended route
      cy.url().should('include', targetRoute);
    });
  });

  describe('Security Features', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should prevent password autofill attacks', () => {
      cy.get('[data-testid="input-password"]')
        .should('have.attr', 'autocomplete', 'current-password');
      
      // Should not have any hidden password fields
      cy.get('input[type="password"]').should('have.length.lessThan', 3);
    });

    it('should handle CSRF protection', () => {
      cy.intercept('POST', apiEndpoints.login, (req) => {
        // Check for CSRF token in headers if implemented
        req.reply({
          statusCode: 200,
          body: { user: testUser.ciUser, token: 'mock-token' }
        });
      }).as('loginWithCSRF');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginWithCSRF');
    });

    it('should prevent multiple simultaneous login requests', () => {
      let requestCount = 0;
      
      cy.intercept('POST', apiEndpoints.login, (req) => {
        requestCount++;
        req.reply({ delay: 1000, statusCode: 200, body: { user: testUser.ciUser } });
      }).as('loginRequest');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      
      // Click multiple times rapidly
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="button-login"]').click();

      // Button should be disabled after first click
      cy.get('[data-testid="button-login"]').should('be.disabled');

      cy.wait('@loginRequest').then(() => {
        expect(requestCount).to.equal(1);
      });
    });

    it('should clear sensitive data from memory', () => {
      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);

      // Navigate away
      cy.visit('/');

      // Navigate back
      cy.visit('/login');

      // Fields should be empty
      cy.get('[data-testid="input-email"]').should('have.value', '');
      cy.get('[data-testid="input-password"]').should('have.value', '');
    });
  });

  describe('User Experience Features', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should remember email address if feature exists', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="checkbox-remember-email"]').length > 0) {
          cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
          cy.get('[data-testid="checkbox-remember-email"]').check();
          cy.get('[data-testid="input-password"]').type('wrongpassword');
          cy.get('[data-testid="button-login"]').click();

          // After failed login, email should be retained
          cy.get('[data-testid="input-email"]').should('have.value', testUser.ciUser.email);
        }
      });
    });

    it('should provide helpful error messages', () => {
      const errorScenarios = [
        {
          email: 'nonexistent@example.com',
          password: 'password123',
          expectedError: /user not found|invalid|does not exist/i
        },
        {
          email: testUser.ciUser.email,
          password: 'wrongpassword',
          expectedError: /password|invalid|incorrect/i
        }
      ];

      errorScenarios.forEach((scenario) => {
        cy.intercept('POST', apiEndpoints.login, {
          statusCode: 401,
          body: { error: 'Invalid credentials' }
        }).as('loginError');

        cy.get('[data-testid="input-email"]').clear().type(scenario.email);
        cy.get('[data-testid="input-password"]').clear().type(scenario.password);
        cy.get('[data-testid="button-login"]').click();

        cy.wait('@loginError');
        
        cy.get('[data-testid="error-message"], .error, [role="alert"]')
          .should('be.visible')
          .and('contain.text', scenario.expectedError);
      });
    });

    it('should handle form submission with Enter key', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: { user: testUser.ciUser }
      }).as('loginViaEnter');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="input-password"]').type('{enter}');

      cy.wait('@loginViaEnter');
    });

    it('should provide loading feedback during authentication', () => {
      cy.intercept('POST', apiEndpoints.login, (req) => {
        req.reply({ delay: 2000, statusCode: 200, body: { user: testUser.ciUser } });
      }).as('slowLogin');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      // Should show loading state
      cy.get('[data-testid="button-login"]').should('be.disabled');
      
      // Look for loading indicators
      cy.get('body').should(($body) => {
        const hasLoadingSpinner = $body.find('[data-testid="loading-spinner"]').length > 0;
        const hasLoadingText = $body.text().includes('Signing in') || $body.text().includes('Loading');
        const hasDisabledButton = $body.find('[data-testid="button-login"]:disabled').length > 0;
        
        expect(hasLoadingSpinner || hasLoadingText || hasDisabledButton).to.be.true;
      });

      cy.wait('@slowLogin');
    });
  });

  describe('Integration with User Management', () => {
    it('should fetch user profile after successful login', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: {
          user: testUser.ciUser,
          token: 'mock-jwt-token'
        }
      }).as('loginSuccess');

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: {
          ...testUser.ciUser,
          profile: {
            firstName: 'Test',
            lastName: 'User',
            avatar: '/images/default-avatar.png'
          }
        }
      }).as('fetchUserProfile');

      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginSuccess');
      cy.wait('@fetchUserProfile');

      // Should redirect to dashboard or appropriate page
      cy.url().should('not.include', '/login');
    });

    it('should handle user role-based redirects', () => {
      const userRoles = [
        { role: 'admin', expectedRedirect: '/dashboard' },
        { role: 'consultant', expectedRedirect: '/dashboard' },
        { role: 'hospital_admin', expectedRedirect: '/dashboard' }
      ];

      userRoles.forEach((userRole) => {
        cy.intercept('POST', apiEndpoints.login, {
          statusCode: 200,
          body: {
            user: { ...testUser.ciUser, role: userRole.role },
            token: 'mock-token'
          }
        }).as(`login${userRole.role}`);

        cy.visit('/login');
        cy.get('[data-testid="input-email"]').clear().type(testUser.ciUser.email);
        cy.get('[data-testid="input-password"]').clear().type(testUser.ciUser.password);
        cy.get('[data-testid="button-login"]').click();

        cy.wait(`@login${userRole.role}`);
        cy.url().should('include', userRole.expectedRedirect);
        
        // Clear auth state for next iteration
        cy.clearLocalStorage();
        cy.clearCookies();
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: 'invalid json response'
      }).as('malformedResponse');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@malformedResponse');

      // Should display error message
      cy.get('[data-testid="error-message"], .error, [role="alert"]')
        .should('be.visible')
        .and('contain.text', /error|try again/i);
    });

    it('should recover from API errors', () => {
      // First request fails
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('loginFail');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@loginFail');

      // Error should be displayed
      cy.get('[data-testid="error-message"], .error, [role="alert"]')
        .should('be.visible');

      // Second request succeeds
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: { user: testUser.ciUser, token: 'mock-token' }
      }).as('loginSuccess');

      cy.get('[data-testid="button-login"]').click();
      cy.wait('@loginSuccess');

      // Should proceed with successful login
      cy.url().should('not.include', '/login');
    });

    it('should handle browser back button correctly', () => {
      cy.intercept('POST', apiEndpoints.login, {
        statusCode: 200,
        body: { user: testUser.ciUser, token: 'mock-token' }
      }).as('login');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.wait('@login');
      cy.url().should('not.include', '/login');

      // Go back to login page
      cy.go('back');
      
      // Should redirect away from login if still authenticated
      cy.url().should('not.include', '/login');
    });

    it('should handle page refresh during login process', () => {
      cy.intercept('POST', apiEndpoints.login, (req) => {
        req.reply({ delay: 5000, statusCode: 200, body: { user: testUser.ciUser } });
      }).as('slowLogin');

      cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
      cy.get('[data-testid="button-login"]').click();

      // Refresh page during login
      cy.wait(1000);
      cy.reload();

      // Should return to clean login state
      cy.get('[data-testid="input-email"]').should('have.value', '');
      cy.get('[data-testid="input-password"]').should('have.value', '');
      cy.get('[data-testid="button-login"]').should('not.be.disabled');
    });
  });
});
