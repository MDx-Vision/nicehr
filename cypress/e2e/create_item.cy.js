describe('Create Item', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('should create a new hospital', () => {
    // Navigate to Hospitals page
    cy.visit('/hospitals');
    cy.get('[data-testid="text-hospitals-title"]').should('be.visible');
    
    // Click 'New Hospital' button (or 'Add First Hospital' if empty)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="button-add-hospital"]').length > 0) {
        cy.get('[data-testid="button-add-hospital"]').click();
      } else {
        cy.get('[data-testid="button-add-first-hospital"]').click();
      }
    });
    
    // Fill out the hospital form
    cy.get('[data-testid="input-hospital-name"]').type('Test Hospital A');
    cy.get('[data-testid="input-hospital-city"]').type('Test City');
    cy.get('[data-testid="input-hospital-state"]').type('TX');
    
    // Click Save/Create button
    cy.get('[data-testid="button-submit-hospital"]').click();
    
    // Assert that the new hospital is visible in the list
    cy.contains('Test Hospital A').should('be.visible');
  });

  it('should create a new project after creating a hospital', () => {
    // First create a hospital (projects require a hospital)
    cy.visit('/hospitals');
    cy.get('[data-testid="text-hospitals-title"]').should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="button-add-hospital"]').length > 0) {
        cy.get('[data-testid="button-add-hospital"]').click();
      } else {
        cy.get('[data-testid="button-add-first-hospital"]').click();
      }
    });
    
    const hospitalName = `Hospital ${Date.now()}`;
    cy.get('[data-testid="input-hospital-name"]').type(hospitalName);
    cy.get('[data-testid="input-hospital-city"]').type('Project City');
    cy.get('[data-testid="input-hospital-state"]').type('CA');
    cy.get('[data-testid="button-submit-hospital"]').click();
    
    // Wait for hospital to be created
    cy.contains(hospitalName).should('be.visible');
    
    // Navigate to Projects page
    cy.visit('/projects');
    cy.get('[data-testid="text-projects-title"]').should('be.visible');
    
    // Click 'New Project' button
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="button-add-project"]').length > 0) {
        cy.get('[data-testid="button-add-project"]').click();
      } else {
        cy.get('[data-testid="button-add-first-project"]').click();
      }
    });
    
    // Fill out the project form
    cy.get('[data-testid="input-project-name"]').type('Test Product A');
    
    // Select the hospital from dropdown (Radix Select uses portals)
    cy.get('[data-testid="select-hospital"]').click();
    // Wait for the select content to appear and click the option
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').contains(hospitalName).click({ force: true });
    
    // Set dates
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const endDate = futureDate.toISOString().split('T')[0];
    
    cy.get('[data-testid="input-start-date"]').type(startDate);
    cy.get('[data-testid="input-end-date"]').type(endDate);
    
    // Fill in optional numeric fields to avoid empty string validation issues
    cy.get('[data-testid="input-est-consultants"]').clear().type('5');
    cy.get('[data-testid="input-est-budget"]').clear().type('100000');
    
    // Click Save/Create button
    cy.get('[data-testid="button-submit-project"]').click();
    
    // Assert that the new project is visible in the list
    cy.contains('Test Product A').should('be.visible');
  });
});
