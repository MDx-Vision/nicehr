describe('Consultant Management', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.visit('/consultants');
    cy.url().should('include', '/consultants');
  });

  describe('Consultant List View', () => {
    it('should display consultants page', () => {
      cy.get('[data-testid="text-consultants-title"]').should('contain', 'Consultants');
    });

    it('should show search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should show filter controls', () => {
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-shift"]').should('be.visible');
    });

    it('should show table or empty state', () => {
      cy.get('[data-testid="consultants-table"], [data-testid="consultants-empty"]').should('exist');
    });

    it('should filter by availability', () => {
      cy.get('[data-testid="filter-availability"]').click();
      cy.get('[role="option"]').contains('Available').click();
      cy.get('[data-testid="text-consultants-title"]').should('be.visible');
    });

    it('should filter by shift preference', () => {
      cy.get('[data-testid="filter-shift"]').click();
      cy.get('[role="option"]').contains('Day').click();
      cy.get('[data-testid="text-consultants-title"]').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should allow typing in search field', () => {
      cy.get('[data-testid="input-search"]')
        .type('test')
        .should('have.value', 'test');
    });

    it('should clear search when text is deleted', () => {
      cy.get('[data-testid="input-search"]')
        .type('test')
        .clear()
        .should('have.value', '');
    });
  });

  describe('Advanced Search', () => {
    it('should open advanced search panel', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="advanced-search-panel"]').should('be.visible');
    });

    it('should show EMR filter in advanced search', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="filter-ehr"]').should('be.visible');
    });

    it('should show skills filter in advanced search', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="filter-skills"]').should('be.visible');
    });

    it('should have clear filters button', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="button-clear-filters"]').should('be.visible');
    });

    it('should have apply filters button', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="button-apply-filters"]').should('be.visible');
    });
  });

  describe('Create Consultant', () => {
    it('should show create consultant button', () => {
      cy.get('[data-testid="button-create-consultant"]').should('be.visible');
    });

    it('should open create consultant modal', () => {
      cy.get('[data-testid="button-create-consultant"]').click();
      cy.get('[data-testid="modal-consultant"]').should('be.visible');
    });

    it('should show form fields in modal', () => {
      cy.get('[data-testid="button-create-consultant"]').click();
      cy.get('[data-testid="input-tng-id"]').should('be.visible');
      cy.get('[data-testid="input-phone"]').should('be.visible');
      cy.get('[data-testid="input-city"]').should('be.visible');
      cy.get('[data-testid="input-state"]').should('be.visible');
    });

    it('should have submit button in modal', () => {
      cy.get('[data-testid="button-create-consultant"]').click();
      cy.get('[data-testid="button-submit-consultant"]').should('be.visible');
    });
  });

  describe('Summary Cards', () => {
    it('should show total consultants summary', () => {
      cy.get('[data-testid="summary-total"]').should('be.visible');
    });

    it('should show available consultants summary', () => {
      cy.get('[data-testid="summary-available"]').should('be.visible');
    });

    it('should show onboarded consultants summary', () => {
      cy.get('[data-testid="summary-onboarded"]').should('be.visible');
    });

    it('should show pending onboarding summary', () => {
      cy.get('[data-testid="summary-pending"]').should('be.visible');
    });
  });
});