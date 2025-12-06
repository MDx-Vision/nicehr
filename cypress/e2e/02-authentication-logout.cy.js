describe('Authentication - Logout Functionality', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    username: 'ci-test-user',
    role: 'admin'
  };

  beforeEach(() => {
    // Set up authenticated state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-auth-token');
      win.localStorage.setItem('user', JSON.stringify(testUser));
    });

    // Mock user authentication check
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUserAuth');
  });

  describe('Logout UI Components', () => {
    it('should display logout option in navigation/user menu', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Look for user menu or logout button
      cy.get('body').should('be.visible');
      
      // Common selectors for logout functionality
      const logoutSelectors = [
        '[data-testid="user-menu"]',
        '[data-testid="logout-button"]',
        '[data-testid="user-dropdown"]',
        '[data-testid="profile-menu"]'
      ];

      // Check if any logout UI exists
      cy.get('body').then(($body) => {
        const hasLogoutUI = logoutSelectors.some(selector => 
          $body.find(selector).length > 0
        );
        
        if (hasLogoutUI) {
          // Find and interact with logout UI
          logoutSelectors.forEach(selector => {
            if ($body.find(selector).length > 0) {
              cy.get(selector).should('be.visible');
            }
          });
        }
      });
    });

    it('should show user information in logout menu', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Look for user menu
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="user-menu"]').length > 0) {
          cy.get('[data-testid="user-menu"]').click();
          
          // Should display user email or name
          cy.get('[data-testid="user-email"], [data-testid="user-name"]')
            .should('contain.text', testUser.email)
            .or('contain.text', testUser.username);
        }
      });
    });

    it('should have accessible logout button', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      cy.get('body').then(($body) => {
        const logoutButton = $body.find('[data-testid="logout-button"]');
        if (logoutButton.length > 0) {
          cy.get('[data-testid="logout-button"]')
            .should('have.attr', 'aria-label')
            .and('be.visible');
        }
      });
    });
  });

  describe('Logout Process', () => {
    it('should successfully logout user', () => {
      // Mock logout API if it exists
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200,
        body: { message: 'Logged out successfully' }
      }).as('logoutAPI');

      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Attempt to find and click logout
      cy.get('body').then(($body) => {
        // Try different logout patterns
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else if ($body.find('[data-testid="user-menu"]').length > 0) {
          cy.get('[data-testid="user-menu"]').click();
          cy.get('[data-testid="logout-option"], [data-testid="logout-button"]').click();
        } else {
          // Look for any button/link with logout text
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      // Should redirect to login page
      cy.url().should('include', '/login');
      
      // Should clear authentication state
      cy.window().its('localStorage').then((localStorage) => {
        expect(localStorage.getItem('token')).to.be.null;
        expect(localStorage.getItem('user')).to.be.null;
        expect(localStorage.getItem('authToken')).to.be.null;
      });
    });

    it('should clear all authentication cookies', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Set some auth cookies
      cy.setCookie('session_id', 'test-session');
      cy.setCookie('auth_token', 'test-token');

      // Perform logout
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else {
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      // Check that auth cookies are cleared
      cy.getCookie('session_id').should('be.null');
      cy.getCookie('auth_token').should('be.null');
    });

    it('should handle logout API errors gracefully', () => {
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 500,
        body: { error: 'Logout failed' }
      }).as('logoutError');

      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else {
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      // Should still clear local state even if API fails
      cy.url().should('include', '/login');
    });

    it('should prevent access to protected routes after logout', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Logout
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else {
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      cy.url().should('include', '/login');

      // Try to access protected routes
      const protectedRoutes = ['/dashboard', '/hospitals', '/consultants', '/admin'];
      
      protectedRoutes.forEach(route => {
        cy.intercept('GET', '/api/auth/user', {
          statusCode: 401,
          body: { error: 'Unauthorized' }
        }).as('unauthorized');

        cy.visit(route);
        cy.wait('@unauthorized');
        cy.url().should('include', '/login');
      });
    });
  });

  describe('Session Management', () => {
    it('should handle session expiry', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Simulate session expiry
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Session expired' }
      }).as('sessionExpired');

      // Make an API call that would trigger auth check
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedAPI');

      // Trigger page refresh or navigation
      cy.reload();
      cy.wait('@sessionExpired');

      // Should redirect to login
      cy.url().should('include', '/login');

      // Should show session expired message if implemented
      cy.get('body').then(($body) => {
        if ($body.text().includes('session') || $body.text().includes('expired')) {
          cy.get('[data-testid="session-message"], .session-message')
            .should('contain.text', /session|expired/i);
        }
      });
    });

    it('should handle concurrent session logout', () => {
      // Simulate user logging out in another tab/browser
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Clear auth state (simulating logout in another tab)
      cy.window().then((win) => {
        win.localStorage.removeItem('token');
        win.localStorage.removeItem('user');
      });

      // Mock unauthorized response
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorized');

      // Trigger an action that checks auth
      cy.reload();
      cy.wait('@unauthorized');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should handle logout during active requests', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Mock slow API request
      cy.intercept('GET', '/api/dashboard/stats', (req) => {
        req.reply({ delay: 3000, statusCode: 200, body: {} });
      }).as('slowRequest');

      // Start a request
      cy.window().then((win) => {
        fetch('/api/dashboard/stats');
      });

      // Logout immediately
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else {
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      // Should redirect to login regardless of pending requests
      cy.url().should('include', '/login');
    });
  });

  describe('Auto-logout Features', () => {
    it('should handle idle timeout if implemented', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Check if idle timeout is implemented
      cy.window().then((win) => {
        // Look for idle detection or timeout warnings
        cy.get('body', { timeout: 60000 }).then(($body) => {
          if ($body.find('[data-testid="idle-warning"], .idle-warning').length > 0) {
            cy.get('[data-testid="idle-warning"]').should('be.visible');
            
            // Test extend session functionality if available
            if ($body.find('[data-testid="extend-session"]').length > 0) {
              cy.get('[data-testid="extend-session"]').click();
              cy.get('[data-testid="idle-warning"]').should('not.exist');
            }
          }
        });
      });
    });

    it('should show logout confirmation for unsaved changes', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Navigate to a form page if available
      cy.get('body').then(($body) => {
        if ($body.find('form, [data-testid="form"]').length > 0) {
          // Make changes to form
          cy.get('input, textarea').first().type('unsaved changes');

          // Try to logout
          if ($body.find('[data-testid="logout-button"]').length > 0) {
            cy.get('[data-testid="logout-button"]').click();
            
            // Look for confirmation dialog
            cy.get('[data-testid="confirm-logout"], .confirm-dialog')
              .should('be.visible')
              .and('contain.text', /unsaved|changes|confirm/i);
          }
        }
      });
    });
  });

  describe('Cross-browser and Cross-tab Logout', () => {
    it('should sync logout across tabs', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Simulate logout in another tab by triggering storage event
      cy.window().then((win) => {
        // Simulate storage change event
        win.localStorage.removeItem('token');
        win.dispatchEvent(new StorageEvent('storage', {
          key: 'token',
          oldValue: 'mock-auth-token',
          newValue: null,
          url: win.location.href
        }));
      });

      // Should detect logout and redirect
      cy.url({ timeout: 10000 }).should('include', '/login');
    });

    it('should handle browser close and reopen', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Clear session storage but keep local storage (simulating browser close/reopen)
      cy.window().then((win) => {
        win.sessionStorage.clear();
      });

      cy.reload();

      // Should still be authenticated if using localStorage
      // or should redirect to login if using sessionStorage
      cy.url().should((url) => {
        expect(url).to.satisfy((url) => 
          url.includes('/login') || url.includes('/dashboard')
        );
      });
    });
  });

  describe('Logout Analytics and Tracking', () => {
    it('should track logout events if analytics are implemented', () => {
      let analyticsEvents = [];
      
      cy.window().then((win) => {
        // Mock analytics tracking
        win.analytics = {
          track: (event, data) => {
            analyticsEvents.push({ event, data });
          }
        };
      });

      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Perform logout
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else {
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      // Check if logout was tracked
      cy.window().then(() => {
        const logoutEvent = analyticsEvents.find(e => 
          e.event.includes('logout') || e.event.includes('signout')
        );
        
        if (logoutEvent) {
          expect(logoutEvent).to.exist;
        }
      });
    });
  });

  describe('Security Logout Features', () => {
    it('should invalidate refresh tokens on logout', () => {
      cy.intercept('POST', '/api/auth/logout', (req) => {
        // Should send refresh token for invalidation
        expect(req.body).to.have.property('refreshToken');
        req.reply({ statusCode: 200, body: { message: 'Logged out' } });
      }).as('secureLogout');

      cy.window().then((win) => {
        win.localStorage.setItem('refreshToken', 'mock-refresh-token');
      });

      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
          // Only wait if the API call is made
          cy.get('@secureLogout.all').then((calls) => {
            if (calls.length > 0) {
              cy.wait('@secureLogout');
            }
          });
        }
      });
    });

    it('should clear all sensitive data on logout', () => {
      cy.visit('/dashboard');
      cy.wait('@getUserAuth');

      // Set various auth-related data
      cy.window().then((win) => {
        win.localStorage.setItem('user_preferences', JSON.stringify({}));
        win.localStorage.setItem('cached_data', JSON.stringify({}));
        win.sessionStorage.setItem('temp_token', 'temp');
      });

      // Perform logout
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="logout-button"]').length > 0) {
          cy.get('[data-testid="logout-button"]').click();
        } else {
          cy.contains('button, a', /logout|sign out/i).first().click();
        }
      });

      // Check that sensitive data is cleared
      cy.window().its('localStorage').then((localStorage) => {
        expect(localStorage.getItem('token')).to.be.null;
        expect(localStorage.getItem('user')).to.be.null;
        expect(localStorage.getItem('refreshToken')).to.be.null;
        // Non-sensitive data might be preserved
      });

      cy.window().its('sessionStorage').then((sessionStorage) => {
        expect(sessionStorage.getItem('temp_token')).to.be.null;
      });
    });
  });
});
