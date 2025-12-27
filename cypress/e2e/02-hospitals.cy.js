describe('Hospital Management', () => {
  const mockHospitals = [
    { id: 1, name: 'General Hospital', city: 'Austin', state: 'TX', address: '123 Main St', phone: '555-1234' },
    { id: 2, name: 'City Medical Center', city: 'Houston', state: 'TX', address: '456 Oak Ave', phone: '555-5678' }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'admin' }
    }).as('getUser');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { user: { id: 1, email: 'test@example.com', role: 'admin' } }
    }).as('loginRequest');

    // Mock hospitals API
    cy.intercept('GET', '/api/hospitals*', {
      statusCode: 200,
      body: mockHospitals
    }).as('getHospitals');

    cy.intercept('POST', '/api/hospitals', {
      statusCode: 201,
      body: { id: 3, name: 'New Hospital', city: 'Dallas', state: 'TX' }
    }).as('createHospital');

    cy.intercept('PUT', '/api/hospitals/*', {
      statusCode: 200,
      body: { id: 1, name: 'Updated Hospital', city: 'Austin', state: 'TX' }
    }).as('updateHospital');

    cy.intercept('DELETE', '/api/hospitals/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteHospital');

    // Login
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@loginRequest');

    // Navigate to hospitals
    cy.visit('/hospitals');
    cy.wait('@getUser');
    cy.wait('@getHospitals');
  });

  describe('Hospital List View', () => {
    it('should display hospitals page title', () => {
      cy.get('[data-testid="text-hospitals-title"]').should('be.visible').and('contain', 'Hospitals');
    });

    it('should display hospitals list', () => {
      cy.get('[data-testid="hospitals-list"]').should('exist');
    });

    it('should show hospital cards', () => {
      cy.get('[data-testid="hospital-card"]').should('have.length', 2);
    });

    it('should have search functionality', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should display hospital names', () => {
      cy.get('[data-testid="hospital-name"]').first().should('contain', 'General Hospital');
    });
  });

  describe('Create Hospital', () => {
    it('should show create hospital button', () => {
      cy.get('[data-testid="button-create-hospital"]').should('be.visible');
    });

    it('should open create hospital modal', () => {
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="modal-create-hospital"]').should('be.visible');
    });

    it('should display form fields in modal', () => {
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="input-hospital-name"]').should('be.visible');
      cy.get('[data-testid="input-hospital-city"]').should('be.visible');
      cy.get('[data-testid="input-hospital-state"]').should('be.visible');
    });

    it('should have submit button', () => {
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="button-submit-hospital"]').should('be.visible');
    });
  });

  describe('Edit Hospital', () => {
    it('should show edit button on hospital card', () => {
      cy.get('[data-testid="hospital-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-hospital"]').should('be.visible');
      });
    });

    it('should open edit modal when edit button clicked', () => {
      cy.get('[data-testid="hospital-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-hospital"]').click();
      });
      cy.get('[data-testid="modal-create-hospital"]').should('be.visible');
    });
  });

  describe('Delete Hospital', () => {
    it('should show delete button on hospital card', () => {
      cy.get('[data-testid="hospital-card"]').first().within(() => {
        cy.get('[data-testid="button-delete-hospital"]').should('be.visible');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should allow typing in search field', () => {
      cy.get('[data-testid="input-search"]')
        .type('General')
        .should('have.value', 'General');
    });

    it('should clear search when text is deleted', () => {
      cy.get('[data-testid="input-search"]')
        .type('test')
        .clear()
        .should('have.value', '');
    });
  });
});
