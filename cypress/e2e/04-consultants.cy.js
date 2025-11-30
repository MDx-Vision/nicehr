// ***********************************************
// NICEHR Platform - Consultant Management Tests
// ***********************************************

describe('Consultant Management', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.navigateTo('consultants');
    cy.waitForPageLoad();
  });

  describe('Consultant List View', () => {
    it('should display consultants list', () => {
      cy.get('[data-testid="consultants-table"], [data-testid="consultants-list"]').should('be.visible');
    });

    it('should show consultant details in table', () => {
      cy.get('table thead').should('contain', 'Name');
      cy.get('table thead').should('contain', 'Status');
    });

    it('should search consultants', () => {
      cy.get('[data-testid="input-search"]').type('consultant');
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should filter by EMR certification', () => {
      cy.selectOption('[data-testid="filter-ehr"]', 'Epic');
      cy.get('[data-testid="consultant-certifications"]').each(($el) => {
        cy.wrap($el).should('contain', 'Epic');
      });
    });

    it('should filter by availability', () => {
      cy.selectOption('[data-testid="filter-availability"]', 'Available');
    });

    it('should filter by skills', () => {
      cy.get('[data-testid="filter-skills"]').should('be.visible');
    });
  });

  describe('Create Consultant', () => {
    it('should open create consultant modal', () => {
      cy.openModal('button-create-consultant');
      cy.get('[role="dialog"]').should('contain', 'Consultant');
    });

    it('should create a new consultant', () => {
      const firstName = `Test`;
      const lastName = `Consultant${Date.now()}`;
      
      cy.openModal('button-create-consultant');
      cy.get('[data-testid="input-first-name"]').type(firstName);
      cy.get('[data-testid="input-last-name"]').type(lastName);
      cy.get('[data-testid="input-email"]').type(`${lastName.toLowerCase()}@test.com`);
      cy.get('[data-testid="input-phone"]').type('555-123-4567');
      cy.get('[data-testid="input-address"]').type('123 Test Street');
      cy.get('[data-testid="input-city"]').type('Boston');
      cy.get('[data-testid="input-state"]').type('MA');
      cy.get('[data-testid="input-zip"]').type('02101');
      
      cy.get('[data-testid="button-submit-consultant"]').click();
      
      cy.get('[role="dialog"]').should('not.exist');
      cy.tableRowExists(`${firstName} ${lastName}`);
    });

    it('should validate required fields', () => {
      cy.openModal('button-create-consultant');
      cy.get('[data-testid="button-submit-consultant"]').click();
      
      cy.get('.text-red-500, .text-destructive').should('be.visible');
    });

    it('should validate email format', () => {
      cy.openModal('button-create-consultant');
      cy.get('[data-testid="input-email"]').type('invalid-email');
      cy.get('[data-testid="button-submit-consultant"]').click();
      
      cy.get('.text-red-500, .text-destructive').should('be.visible');
    });
  });

  describe('Consultant Profile', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should display consultant profile', () => {
      cy.get('[data-testid="consultant-profile"]').should('be.visible');
      cy.get('[data-testid="consultant-name"]').should('be.visible');
    });

    it('should show contact information', () => {
      cy.get('[data-testid="consultant-email"]').should('be.visible');
      cy.get('[data-testid="consultant-phone"]').should('be.visible');
    });

    it('should display certifications/badges', () => {
      cy.get('[data-testid="consultant-certifications"], [data-testid="ehr-badges"]').should('be.visible');
    });

    it('should show skills section', () => {
      cy.get('[data-testid="consultant-skills"]').should('be.visible');
    });

    it('should show project history', () => {
      cy.get('[data-testid="consultant-projects"], [data-testid="project-history"]').should('be.visible');
    });
  });

  describe('EMR Certifications', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-certifications"]').click();
    });

    it('should display certifications list', () => {
      cy.get('[data-testid="certifications-list"]').should('be.visible');
    });

    it('should add a new certification', () => {
      cy.openModal('button-add-certification');
      cy.selectOption('[data-testid="select-ehr-system"]', 'Epic');
      cy.get('[data-testid="input-certification-date"]').type('2024-01-15');
      cy.get('[data-testid="input-expiration-date"]').type('2026-01-15');
      cy.get('[data-testid="input-certification-id"]').type('CERT-12345');
      cy.get('[data-testid="button-submit-certification"]').click();
      
      cy.get('[data-testid="certifications-list"]').should('contain', 'Epic');
    });

    it('should show certification expiration warning', () => {
      cy.get('[data-testid="certification-expiring"]').should('exist');
    });

    it('should verify certification', () => {
      cy.get('[data-testid="certification-item"]').first()
        .find('[data-testid="button-verify-certification"]').click();
    });
  });

  describe('Skills Management', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-skills"]').click();
    });

    it('should display skills by category', () => {
      cy.get('[data-testid="skill-categories"]').should('be.visible');
    });

    it('should add a new skill', () => {
      cy.openModal('button-add-skill');
      cy.selectOption('[data-testid="select-skill-category"]', 'Technical');
      cy.selectOption('[data-testid="select-skill"]', 'skill');
      cy.selectOption('[data-testid="select-proficiency"]', 'Expert');
      cy.get('[data-testid="input-years-experience"]').type('5');
      cy.get('[data-testid="button-submit-skill"]').click();
    });

    it('should update skill proficiency', () => {
      cy.get('[data-testid="skill-item"]').first().within(() => {
        cy.selectOption('[data-testid="select-proficiency"]', 'Advanced');
      });
    });

    it('should verify skill', () => {
      cy.get('[data-testid="skill-item"]').first()
        .find('[data-testid="button-verify-skill"]').click();
    });
  });

  describe('EHR Experience', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-ehr-experience"]').click();
    });

    it('should display EHR experience', () => {
      cy.get('[data-testid="ehr-experience-list"]').should('be.visible');
    });

    it('should add EHR experience', () => {
      cy.openModal('button-add-ehr-experience');
      cy.selectOption('[data-testid="select-ehr-system"]', 'Epic');
      cy.get('[data-testid="input-years-experience"]').type('3');
      cy.get('[data-testid="input-modules"]').type('Ambulatory, Orders');
      cy.get('[data-testid="button-submit-experience"]').click();
    });
  });

  describe('Consultant Questionnaire', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-questionnaire"]').click();
    });

    it('should display questionnaire', () => {
      cy.get('[data-testid="questionnaire-form"]').should('be.visible');
    });

    it('should save questionnaire responses', () => {
      cy.get('[data-testid="questionnaire-field"]').first().type('Test response');
      cy.get('[data-testid="button-save-questionnaire"]').click();
    });
  });

  describe('Document Management', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-documents"]').click();
    });

    it('should display documents list', () => {
      cy.get('[data-testid="documents-list"]').should('be.visible');
    });

    it('should show document categories', () => {
      cy.get('[data-testid="document-category"]').should('exist');
    });

    it('should view document', () => {
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="button-view-document"]').click();
    });

    it('should delete document', () => {
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="button-delete-document"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
    });
  });

  describe('Onboarding Workflow', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-onboarding"]').click();
    });

    it('should display onboarding checklist', () => {
      cy.get('[data-testid="onboarding-checklist"]').should('be.visible');
    });

    it('should show onboarding progress', () => {
      cy.get('[data-testid="onboarding-progress"]').should('be.visible');
    });

    it('should complete onboarding step', () => {
      cy.get('[data-testid="onboarding-step"]').first()
        .find('[data-testid="checkbox-complete"]').click();
    });

    it('should upload required documents', () => {
      cy.get('[data-testid="onboarding-document-upload"]').should('be.visible');
    });
  });

  describe('Edit & Delete Consultant', () => {
    it('should edit consultant details', () => {
      const updatedLastName = `UpdatedName${Date.now()}`;
      
      cy.get('table tbody tr').first().find('[data-testid="button-edit-consultant"]').click();
      cy.get('[data-testid="input-last-name"]').clear().type(updatedLastName);
      cy.get('[data-testid="button-submit-consultant"]').click();
      
      cy.tableRowExists(updatedLastName);
    });

    it('should show delete confirmation', () => {
      cy.get('table tbody tr').first().find('[data-testid="button-delete-consultant"]').click();
      cy.get('[role="alertdialog"]').should('be.visible');
    });
  });

  describe('Advanced Search', () => {
    it('should open advanced search', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="advanced-search-panel"]').should('be.visible');
    });

    it('should search by multiple criteria', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.selectOption('[data-testid="filter-ehr"]', 'Epic');
      cy.selectOption('[data-testid="filter-availability"]', 'Available');
      cy.get('[data-testid="input-min-experience"]').type('2');
      cy.get('[data-testid="button-apply-filters"]').click();
      
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should clear filters', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="button-clear-filters"]').click();
    });
  });
});
