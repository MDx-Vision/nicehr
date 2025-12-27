describe('Authentication - Logout Functionality', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { user: testUser }
    }).as('loginRequest');

    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: { success: true }
    }).as('logoutRequest');

    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: { totalConsultants: 10, activeProjects: 5 }
    }).as('getDashboardStats');

    // Login
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type(testUser.email);
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@loginRequest');
  });

  describe('Logout Button', () => {
    it('should display logout button in sidebar', () => {
      cy.visit('/');
      cy.wait('@getUser');
      cy.get('[data-testid="button-logout"]').should('be.visible');
    });

    it('should show logout button is clickable', () => {
      cy.visit('/');
      cy.wait('@getUser');
      cy.get('[data-testid="button-logout"]').should('not.be.disabled');
    });

    it('should have correct logout href', () => {
      cy.visit('/');
      cy.wait('@getUser');
      // The button-logout testid is on the anchor element due to asChild
      cy.get('[data-testid="button-logout"]').should('have.attr', 'href', '/api/logout');
    });

    it('should show sign out text on logout button', () => {
      cy.visit('/');
      cy.wait('@getUser');
      cy.get('[data-testid="button-logout"]').should('contain', 'Sign Out');
    });
  });

  describe('Session State', () => {
    it('should show user info in sidebar before logout', () => {
      cy.visit('/');
      cy.wait('@getUser');
      // User's email should be visible in sidebar
      cy.contains(testUser.email).should('exist');
    });

    it('should display user name in sidebar', () => {
      cy.visit('/');
      cy.wait('@getUser');
      // User name should be visible
      cy.contains(`${testUser.firstName} ${testUser.lastName}`).should('exist');
    });
  });
});
