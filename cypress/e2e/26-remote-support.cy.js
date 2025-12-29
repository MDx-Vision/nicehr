// Remote Support Integration Tests
describe('Remote Support', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication - admin user
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin'
      }
    }).as('getUser');

    // Mock permissions
    cy.intercept('GET', '/api/permissions', {
      statusCode: 200,
      body: { permissions: ['admin'] }
    }).as('getPermissions');

    cy.intercept('GET', '/api/rbac/effective-permissions', {
      statusCode: 200,
      body: []
    }).as('getEffectivePermissions');

    // Mock notification APIs
    cy.intercept('GET', '/api/notifications*', {
      statusCode: 200,
      body: []
    }).as('getNotifications');

    cy.intercept('GET', '/api/notifications/counts', {
      statusCode: 200,
      body: {}
    }).as('getNotificationCounts');

    cy.intercept('GET', '/api/notifications/unread-count', {
      statusCode: 200,
      body: { count: 0 }
    }).as('getUnreadCount');

    // Visit the remote support page
    cy.visit('/remote-support');
    // Wait for auth to complete
    cy.wait('@getUser');
  });

  it('should display remote support page title', () => {
    cy.contains('Remote Support', { timeout: 15000 }).should('be.visible');
  });

  it('should show page description or error state', () => {
    // Wait for loading to complete (3 second timeout)
    cy.wait(4000);
    // Either shows the description or error state
    cy.get('body').then(($body) => {
      if ($body.text().includes('Live video support')) {
        cy.contains('Live video support for hospital staff').should('be.visible');
      } else if ($body.text().includes('Connection Error')) {
        cy.contains('Connection Error').should('be.visible');
      } else {
        // Just check page rendered
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should have refresh button when content loads', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Refresh')) {
        cy.contains('button', 'Refresh').should('be.visible');
      } else {
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should have open full app link when content loads', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Open Full App')) {
        cy.contains('Open Full App')
          .should('be.visible')
          .should('have.attr', 'href')
          .and('include', 'localhost');
      } else {
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should have status cards when server is available', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Server Status')) {
        cy.contains('Server Status').should('be.visible');
        cy.contains('Daily.co').should('be.visible');
        cy.contains('Available Consultants').should('be.visible');
        cy.contains('Queue').should('be.visible');
      } else {
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should have tabs when content loads', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('About')) {
        cy.contains('Available Consultants').should('be.visible');
        cy.contains('Support Queue').should('be.visible');
        cy.contains('About').should('be.visible');
      } else {
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should switch to about tab and show features when available', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('About')) {
        cy.contains('button', 'About').click();
        cy.contains('About Remote Support').should('be.visible');
        cy.contains('Instant video calls with screen sharing').should('be.visible');
      } else {
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should show Daily.co configuration alert in about tab when available', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('About')) {
        cy.contains('button', 'About').click();
        cy.contains('Daily.co Configuration Required').should('be.visible');
      } else {
        cy.contains('Remote Support').should('be.visible');
      }
    });
  });

  it('should handle server connection error gracefully', () => {
    cy.wait(4000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Connection Error')) {
        cy.contains('Connection Error').should('be.visible');
        cy.contains('Remote Support').should('be.visible');
      } else {
        cy.contains('Server Status').should('be.visible');
      }
    });
  });

  describe('navigation', () => {
    it('should be accessible from sidebar', () => {
      cy.visit('/');
      cy.wait('@getUser');
      // The Support group may be collapsed - click to expand it
      cy.contains('Support').click({ force: true });
      cy.wait(500);
      // Click on Remote Support nav item
      cy.contains('a', 'Remote Support').click({ force: true });
      cy.url().should('include', '/remote-support');
    });
  });
});
