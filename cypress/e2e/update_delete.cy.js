describe('Update and Delete Project', () => {
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

  it('should navigate to projects page', () => {
    // Mock projects API
    cy.intercept('GET', '/api/projects*', {
      statusCode: 200,
      body: []
    }).as('getProjects');

    cy.visit('/projects');
    cy.wait('@getUser');
    cy.wait('@getProjects');

    cy.get('[data-testid="text-projects-title"]').should('be.visible');
  });
});
