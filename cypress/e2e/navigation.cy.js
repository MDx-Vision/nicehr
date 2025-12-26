describe('Navigation', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
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

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: { id: 1, email: 'test@example.com', role: 'admin' }
      }
    }).as('loginRequest');

    // Login
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();

    cy.wait('@loginRequest');
  });

  it('should navigate to Settings and back to dashboard using browser back button', () => {
    // Mock dashboard stats
    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: {
        totalConsultants: 10,
        activeConsultants: 5,
        totalHospitals: 3,
        activeProjects: 2,
        pendingDocuments: 1,
        totalSavings: '50000'
      }
    }).as('dashboardStats');

    // Wait for dashboard to load
    cy.visit('/');
    cy.wait('@getUser');

    // Click the link for 'Settings'
    cy.get('[data-testid="nav-settings"]').click();

    // Assert the URL includes /settings
    cy.url().should('include', '/settings');

    // Click the browser's back button
    cy.go('back');

    // Assert the user returns to the dashboard
    cy.url().should('not.include', '/settings');
  });
});
