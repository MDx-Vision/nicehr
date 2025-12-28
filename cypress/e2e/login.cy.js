describe('Login', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  it('should display login page elements', () => {
    cy.visit('/login', { failOnStatusCode: false });

    cy.get('[data-testid="text-login-title"]').should('contain', 'Sign In');
    cy.get('[data-testid="input-email"]').should('be.visible');
    cy.get('[data-testid="input-password"]').should('be.visible');
    cy.get('[data-testid="button-login"]').should('be.visible');
  });

  it('should login with valid credentials and redirect to dashboard', () => {
    // Mock the login API
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: { id: 1, email: 'test@example.com', role: 'admin' }
      }
    }).as('loginRequest');

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        role: 'admin',
        firstName: 'Test',
        lastName: 'User'
      }
    }).as('getUser');

    cy.visit('/login', { failOnStatusCode: false });

    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();

    cy.wait('@loginRequest');

    // Should redirect away from login
    cy.url().should('not.include', '/login');
  });

  it('should show password visibility toggle', () => {
    cy.visit('/login', { failOnStatusCode: false });

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
