describe('Update and Delete Project', () => {
  beforeEach(() => {
    // Clear cookies to ensure fresh session
    cy.clearCookies();
    
    // Visit login page
    cy.visit('/login', { failOnStatusCode: false });
    
    // Check if already logged in (redirected to dashboard)
    cy.url().then((url) => {
      if (url === Cypress.config('baseUrl') + '/') {
        // Already logged in, continue
        return;
      }
      
      // Need to login
      cy.get('[data-testid="input-email"]').type('test@example.com');
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      
      // Wait for redirect to dashboard
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });
  });

  it('should update a project name and then delete it', () => {
    // Use unique names to avoid conflicts with existing data
    const timestamp = Date.now();
    const originalProjectName = `Test Product A ${timestamp}`;
    const updatedProjectName = `Updated Product B ${timestamp}`;
    const hospitalName = `Test Hospital ${timestamp}`;
    
    // First, create a project to update/delete
    // Step 1: Create a hospital first (projects require a hospital)
    cy.visit('/hospitals');
    cy.get('[data-testid="text-hospitals-title"]').should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="button-add-hospital"]').length > 0) {
        cy.get('[data-testid="button-add-hospital"]').click();
      } else {
        cy.get('[data-testid="button-add-first-hospital"]').click();
      }
    });
    
    cy.get('[data-testid="input-hospital-name"]').type(hospitalName);
    cy.get('[data-testid="input-hospital-city"]').type('Test City');
    cy.get('[data-testid="input-hospital-state"]').type('TX');
    cy.get('[data-testid="button-submit-hospital"]').click();
    
    // Wait for hospital to be created
    cy.contains(hospitalName).should('be.visible');
    
    // Step 2: Create a project
    cy.visit('/projects');
    cy.get('[data-testid="text-projects-title"]').should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="button-add-project"]').length > 0) {
        cy.get('[data-testid="button-add-project"]').click();
      } else {
        cy.get('[data-testid="button-add-first-project"]').click();
      }
    });
    
    // Fill out the project form
    cy.get('[data-testid="input-project-name"]').type(originalProjectName);
    
    // Select the hospital from dropdown
    cy.get('[data-testid="select-hospital"]').click();
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
    cy.get('[data-testid="input-est-consultants"]').clear().type('5');
    cy.get('[data-testid="input-est-budget"]').clear().type('100000');
    
    cy.get('[data-testid="button-submit-project"]').click();
    
    // Assert that the project was created
    cy.contains(originalProjectName).should('be.visible');
    
    // Step 3: Find the project card and click Edit
    // Find the card containing the project name and click its Edit button
    cy.contains('[data-testid^="card-project-"]', originalProjectName)
      .find('button')
      .contains('Edit')
      .click();
    
    // Step 4: Update the project name
    cy.get('[data-testid="input-project-name"]').should('be.visible');
    cy.get('[data-testid="input-project-name"]').clear().type(updatedProjectName);
    
    // Submit the update
    cy.get('[data-testid="button-submit-project"]').click();
    
    // Step 5: Assert the change is saved
    cy.contains(updatedProjectName).should('be.visible');
    cy.contains(originalProjectName).should('not.exist');
    
    // Step 6: Find the updated project and click Delete
    cy.contains('[data-testid^="card-project-"]', updatedProjectName)
      .find('button')
      .contains('Delete')
      .click();
    
    // Step 7: Assert that the item is no longer visible
    cy.contains(updatedProjectName).should('not.exist');
  });
});
