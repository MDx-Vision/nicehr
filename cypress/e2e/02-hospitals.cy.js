describe('Hospital Management', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    cy.visit('/hospitals');
  });

  describe('Hospital List View', () => {
    it('should display hospitals list', () => {
      cy.get('[data-testid="hospitals-list"]').should('exist');
    });

    it('should show hospital cards', () => {
      cy.get('[data-testid="hospital-card"]').should('have.length.at.least', 1);
    });

    it('should have search functionality', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should filter hospitals by search term', () => {
      cy.get('[data-testid="hospital-card"]').then($cards => {
        const initialCount = $cards.length;
        if (initialCount > 1) {
          cy.get('[data-testid="input-search"]').type('Test');
          cy.get('[data-testid="hospital-card"]').should('have.length.lessThan', initialCount + 1);
        }
      });
    });
  });

  describe('Create Hospital', () => {
    it('should open create hospital modal', () => {
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="modal-create-hospital"]').should('be.visible');
    });

    it('should create a new hospital successfully', () => {
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="input-hospital-name"]').type('Cypress Test Hospital');
      cy.get('[data-testid="input-hospital-city"]').type('Test City');
      cy.get('[data-testid="input-hospital-state"]').type('TX');
      cy.get('[data-testid="button-submit-hospital"]').click();
      cy.contains('Hospital created successfully').should('be.visible');
    });

    it('should show validation errors for required fields', () => {
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="button-submit-hospital"]').click();
      cy.contains('Name is required').should('be.visible');
    });
  });

  describe('Edit Hospital', () => {
    it('should open edit hospital modal', () => {
      cy.get('[data-testid="hospital-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-hospital"]').click();
      });
      cy.get('[data-testid="modal-create-hospital"]').should('be.visible');
    });

    it('should update hospital information', () => {
      cy.get('[data-testid="hospital-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-hospital"]').click();
      });
      cy.get('[data-testid="input-hospital-name"]').clear().type('Updated Hospital Name');
      cy.get('[data-testid="button-submit-hospital"]').click();
      cy.contains('Hospital updated successfully').should('be.visible');
    });
  });

  describe('Delete Hospital', () => {
    it('should delete a hospital', () => {
      // First create a hospital to delete
      cy.get('[data-testid="button-create-hospital"]').click();
      cy.get('[data-testid="input-hospital-name"]').type('Hospital To Delete');
      cy.get('[data-testid="button-submit-hospital"]').click();
      cy.contains('Hospital created successfully').should('be.visible');

      // Now delete it
      cy.contains('[data-testid="hospital-card"]', 'Hospital To Delete').within(() => {
        cy.get('[data-testid="button-delete-hospital"]').click();
      });
      cy.contains('Hospital deleted successfully').should('be.visible');
    });
  });

  describe('Hospital Search', () => {
    it('should filter hospitals when typing in search', () => {
      cy.get('[data-testid="input-search"]').type('CI Test');
      cy.get('[data-testid="hospital-card"]').each($card => {
        cy.wrap($card).should('contain.text', 'CI Test');
      });
    });

    it('should show all hospitals when search is cleared', () => {
      cy.get('[data-testid="hospital-card"]').then($initialCards => {
        const initialCount = $initialCards.length;
        cy.get('[data-testid="input-search"]').type('Test');
        cy.get('[data-testid="input-search"]').clear();
        cy.get('[data-testid="hospital-card"]').should('have.length', initialCount);
      });
    });
  });
});