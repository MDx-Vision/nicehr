// Navigation functionality is tested in authenticated page tests (hospitals, consultants, etc)
describe.skip('Navigation', () => {
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

  it('should navigate to Hospitals and back to dashboard using browser back button', () => {
    // Mock APIs
    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: { totalConsultants: 10, activeConsultants: 5, totalHospitals: 3, activeProjects: 2 }
    }).as('dashboardStats');

    cy.intercept('GET', '/api/hospitals*', {
      statusCode: 200,
      body: []
    }).as('getHospitals');

    // Wait for dashboard to load
    cy.visit('/');
    cy.wait('@getUser');

    // Wait for sidebar to render and click the 'Hospitals' link
    cy.get('[data-testid="nav-hospitals"]', { timeout: 15000 }).scrollIntoView().click();

    // Assert the URL includes /hospitals
    cy.url().should('include', '/hospitals');

    // Click the browser's back button
    cy.go('back');

    // Assert the user returns to the dashboard
    cy.url().should('not.include', '/hospitals');
  });
});
