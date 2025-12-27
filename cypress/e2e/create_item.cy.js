describe('Create Item', () => {
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

  it('should navigate to hospitals page', () => {
    // Mock hospitals API
    cy.intercept('GET', '/api/hospitals*', {
      statusCode: 200,
      body: []
    }).as('getHospitals');

    cy.visit('/hospitals');
    cy.wait('@getUser');
    cy.wait('@getHospitals');

    cy.get('[data-testid="text-hospitals-title"]').should('be.visible');
  });

  it('should display create hospital button', () => {
    // Mock hospitals API
    cy.intercept('GET', '/api/hospitals*', {
      statusCode: 200,
      body: []
    }).as('getHospitals');

    cy.visit('/hospitals');
    cy.wait('@getUser');
    cy.wait('@getHospitals');

    // Should show create hospital button
    cy.get('[data-testid="button-create-hospital"]').should('be.visible');
  });
});
