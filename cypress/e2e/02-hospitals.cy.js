// ***********************************************
// NICEHR Platform - Hospital Management Tests
// ***********************************************

describe('Hospital Management', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.navigateTo('hospitals');
    cy.waitForPageLoad();
  });

  describe('Hospital List View', () => {
    it('should display hospitals list', () => {
      cy.get('[data-testid="hospitals-table"], [data-testid="hospitals-list"]').should('be.visible');
    });

    it('should show hospital details in table', () => {
      cy.get('table thead').should('contain', 'Name');
      cy.get('table thead').should('contain', 'Location');
    });

    it('should have search/filter functionality', () => {
      cy.get('[data-testid="input-search"], [data-testid="filter-hospitals"]').should('be.visible');
    });

    it('should filter hospitals by search term', () => {
      cy.get('[data-testid="input-search"]').type('General');
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  describe('Create Hospital', () => {
    it('should open create hospital modal', () => {
      cy.openModal('button-create-hospital');
      cy.get('[role="dialog"]').should('contain', 'Hospital');
    });

    it('should create a new hospital successfully', () => {
      const hospitalName = `Test Hospital ${Date.now()}`;
      
      cy.openModal('button-create-hospital');
      cy.get('[data-testid="input-hospital-name"]').type(hospitalName);
      cy.get('[data-testid="input-hospital-address"]').type('123 Medical Drive');
      cy.get('[data-testid="input-hospital-city"]').type('Boston');
      cy.get('[data-testid="input-hospital-state"]').type('MA');
      cy.get('[data-testid="input-hospital-zip"]').type('02101');
      cy.get('[data-testid="input-hospital-phone"]').type('617-555-0100');
      cy.get('[data-testid="input-hospital-email"]').type('admin@testhospital.com');
      
      cy.get('[data-testid="button-submit-hospital"]').click();
      
      cy.get('[role="dialog"]').should('not.exist');
      cy.tableRowExists(hospitalName);
    });

    it('should show validation errors for required fields', () => {
      cy.openModal('button-create-hospital');
      cy.get('[data-testid="button-submit-hospital"]').click();
      
      cy.get('[data-testid="error-hospital-name"], .text-red-500, .text-destructive')
        .should('be.visible');
    });
  });

  describe('View Hospital Details', () => {
    it('should navigate to hospital detail page', () => {
      cy.get('table tbody tr').first().click();
      cy.url().should('match', /\/hospitals\/\d+/);
    });

    it('should display hospital information', () => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="hospital-name"]').should('be.visible');
      cy.get('[data-testid="hospital-address"]').should('be.visible');
    });

    it('should show hospital units', () => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="hospital-units"], [data-testid="units-section"]').should('be.visible');
    });

    it('should show associated projects', () => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="hospital-projects"], [data-testid="projects-section"]').should('be.visible');
    });
  });

  describe('Edit Hospital', () => {
    it('should open edit hospital modal', () => {
      cy.get('table tbody tr').first().find('[data-testid="button-edit-hospital"]').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should update hospital information', () => {
      const updatedName = `Updated Hospital ${Date.now()}`;
      
      cy.get('table tbody tr').first().find('[data-testid="button-edit-hospital"]').click();
      cy.get('[data-testid="input-hospital-name"]').clear().type(updatedName);
      cy.get('[data-testid="button-submit-hospital"]').click();
      
      cy.get('[role="dialog"]').should('not.exist');
      cy.tableRowExists(updatedName);
    });
  });

  describe('Delete Hospital', () => {
    it('should show delete confirmation', () => {
      cy.get('table tbody tr').first().find('[data-testid="button-delete-hospital"]').click();
      cy.get('[role="alertdialog"], [data-testid="confirm-dialog"]').should('be.visible');
    });

    it('should cancel delete operation', () => {
      cy.get('table tbody tr').first().then(($row) => {
        const hospitalName = $row.find('td').first().text();
        
        cy.wrap($row).find('[data-testid="button-delete-hospital"]').click();
        cy.get('[data-testid="button-cancel-delete"]').click();
        
        cy.tableRowExists(hospitalName);
      });
    });
  });

  describe('Hospital Units Management', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
    });

    it('should add a new unit to hospital', () => {
      const unitName = `ICU ${Date.now()}`;
      
      cy.openModal('button-add-unit');
      cy.get('[data-testid="input-unit-name"]').type(unitName);
      cy.get('[data-testid="input-unit-floor"]').type('3');
      cy.get('[data-testid="input-unit-bed-count"]').type('20');
      cy.get('[data-testid="button-submit-unit"]').click();
      
      cy.get('[data-testid="units-list"]').should('contain', unitName);
    });

    it('should edit existing unit', () => {
      cy.get('[data-testid="units-list"] [data-testid="button-edit-unit"]').first().click();
      cy.get('[data-testid="input-unit-name"]').clear().type('Updated Unit Name');
      cy.get('[data-testid="button-submit-unit"]').click();
      
      cy.get('[data-testid="units-list"]').should('contain', 'Updated Unit Name');
    });

    it('should delete unit', () => {
      cy.get('[data-testid="units-list"] [data-testid="button-delete-unit"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();
    });
  });
});
