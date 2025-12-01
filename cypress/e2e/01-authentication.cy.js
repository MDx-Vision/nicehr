describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Login Flow', () => {
    it('should display login page with all elements', () => {
      cy.get('[data-testid="input-email"]').should('be.visible');
      cy.get('[data-testid="input-password"]').should('be.visible');
      cy.get('[data-testid="button-login"]').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="button-logout"]').should('be.visible');
    });

    it('should show error for invalid email', () => {
      cy.get('[data-testid="input-email"]').type('invalid@email.com');
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-message"], [role="alert"]').should('be.visible');
    });

    it('should show error for invalid password', () => {
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('wrongpassword');
      cy.get('[data-testid="button-login"]').click();
      cy.get('[data-testid="error-message"], [role="alert"]').should('be.visible');
    });

    it('should show validation error for empty fields', () => {
      cy.get('[data-testid="button-login"]').click();
      cy.url().should('include', '/login');
    });

    it('should show/hide password toggle', () => {
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'password');
      cy.get('[data-testid="toggle-password-visibility"]').click();
      cy.get('[data-testid="input-password"]').should('have.attr', 'type', 'text');
    });
  });

  describe('Session Management', () => {
    it('should persist session across page refresh', () => {
      cy.login();
      cy.reload();
      cy.url().should('not.include', '/login');
    });

    it('should logout button exist and be clickable', () => {
      cy.login();
      cy.get('[data-testid="button-logout"]').should('be.visible');
      cy.get('[data-testid="button-logout"]').should('have.attr', 'href').and('include', 'logout');
    });

    it('should show login page when visiting /login', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').should('be.visible');
    });
  });

  describe('Role-Based Access', () => {
    it('should show admin navigation items for admin user', () => {
      cy.login('test@example.com', 'password123');
      cy.get('[data-testid="nav-settings"]').scrollIntoView().should('exist');
      cy.get('[data-testid="nav-access-control"]').scrollIntoView().should('exist');
    });
  });
});