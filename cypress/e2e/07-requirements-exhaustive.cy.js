describe('Requirements Management - Exhaustive Tests', () => {
  const testData = {
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    user: {
      email: 'test@example.com',
      password: 'test123'
    },
    requirements: {
      valid: {
        title: 'Test Requirement Title',
        description: 'This is a test requirement description with sufficient detail to validate the system functionality.',
        category: 'Functional',
        priority: 'High',
        type: 'Business',
        status: 'Draft',
        acceptanceCriteria: 'System must handle user inputs correctly and provide appropriate feedback.'
      },
      invalid: {
        title: '',
        description: '',
        longTitle: 'A'.repeat(256),
        longDescription: 'A'.repeat(5001)
      },
      update: {
        title: 'Updated Requirement Title',
        description: 'Updated requirement description with modified content.',
        category: 'Non-Functional',
        priority: 'Medium',
        status: 'In Review'
      }
    }
  };

  const apiEndpoints = {
    requirements: `/api/projects/${testData.project.id}/requirements`,
    projects: '/api/projects',
    login: '/api/auth/login',
    user: '/api/auth/user'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Requirements List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should display complete requirements list layout', () => {
      // Main container
      cy.get('[data-testid="requirements-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Header section
      cy.get('[data-testid="requirements-header"]').should('be.visible');
      cy.get('[data-testid="requirements-title"]')
        .should('be.visible')
        .and('contain.text', 'Requirements');
      
      // Action buttons
      cy.get('[data-testid="button-add-requirement"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      // Search and filters
      cy.get('[data-testid="requirements-search"]').should('be.visible');
      cy.get('[data-testid="requirements-filters"]').should('be.visible');
      
      // Requirements table/list
      cy.get('[data-testid="requirements-table"]').should('be.visible');
      
      // Pagination if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirements-pagination"]').length > 0) {
          cy.get('[data-testid="requirements-pagination"]').should('be.visible');
        }
      });
    });

    it('should display proper table headers and columns', () => {
      cy.get('[data-testid="requirements-table"]').within(() => {
        // Table headers
        cy.get('thead').should('be.visible');
        cy.get('th').should('have.length.at.least', 5);
        
        // Essential columns
        cy.get('th').contains(/title/i).should('be.visible');
        cy.get('th').contains(/category/i).should('be.visible');
        cy.get('th').contains(/priority/i).should('be.visible');
        cy.get('th').contains(/status/i).should('be.visible');
        cy.get('th').contains(/actions/i).should('be.visible');
      });
    });

    it('should handle empty state properly', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getEmptyRequirements');
      
      cy.reload();
      cy.wait('@getEmptyRequirements');
      
      cy.get('[data-testid="requirements-empty-state"]')
        .should('be.visible')
        .and('contain.text', /no requirements/i);
      
      cy.get('[data-testid="button-add-first-requirement"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should handle loading states', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        delay: 2000,
        fixture: 'requirements/requirements-list.json'
      }).as('getSlowRequirements');
      
      cy.reload();
      
      // Should show loading indicator
      cy.get('[data-testid="requirements-loading"]', { timeout: 1000 })
        .should('be.visible');
      
      cy.wait('@getSlowRequirements');
      
      // Loading should disappear
      cy.get('[data-testid="requirements-loading"]')
        .should('not.exist');
    });

    it('should handle error states', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getRequirementsError');
      
      cy.reload();
      cy.wait('@getRequirementsError');
      
      cy.get('[data-testid="requirements-error"]')
        .should('be.visible')
        .and('contain.text', /error/i);
      
      cy.get('[data-testid="button-retry-requirements"]')
        .should('be.visible')
        .and('not.be.disabled');
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should search requirements by title', () => {
      const searchTerm = 'user authentication';
      
      cy.intercept('GET', `${apiEndpoints.requirements}*`, {
        fixture: 'requirements/search-results.json'
      }).as('searchRequirements');
      
      cy.get('[data-testid="requirements-search"]')
        .type(searchTerm);
      
      cy.wait('@searchRequirements');
      
      // Verify search results
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('have.length.at.least', 1);
      
      // Clear search
      cy.get('[data-testid="requirements-search"]').clear();
      cy.wait('@getRequirements');
    });

    it('should filter by category', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*`, {
        fixture: 'requirements/filtered-results.json'
      }).as('filterRequirements');
      
      cy.get('[data-testid="filter-category"]').click();
      cy.get('[data-testid="filter-option-functional"]').click();
      
      cy.wait('@filterRequirements');
      
      // Verify filtered results
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('contain.text', 'Functional');
    });

    it('should filter by priority', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*`, {
        fixture: 'requirements/priority-filtered.json'
      }).as('filterByPriority');
      
      cy.get('[data-testid="filter-priority"]').click();
      cy.get('[data-testid="filter-option-high"]').click();
      
      cy.wait('@filterByPriority');
      
      // Verify priority filter
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('contain.text', 'High');
    });

    it('should filter by status', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*`, {
        fixture: 'requirements/status-filtered.json'
      }).as('filterByStatus');
      
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-approved"]').click();
      
      cy.wait('@filterByStatus');
      
      // Verify status filter
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('contain.text', 'Approved');
    });

    it('should combine multiple filters', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*`, {
        fixture: 'requirements/multi-filtered.json'
      }).as('multiFilter');
      
      // Apply category filter
      cy.get('[data-testid="filter-category"]').click();
      cy.get('[data-testid="filter-option-functional"]').click();
      
      // Apply priority filter
      cy.get('[data-testid="filter-priority"]').click();
      cy.get('[data-testid="filter-option-high"]').click();
      
      cy.wait('@multiFilter');
      
      // Verify combined filters
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('contain.text', 'Functional')
        .and('contain.text', 'High');
    });

    it('should clear all filters', () => {
      // Apply filters first
      cy.get('[data-testid="filter-category"]').click();
      cy.get('[data-testid="filter-option-functional"]').click();
      
      // Clear filters
      cy.get('[data-testid="button-clear-filters"]').click();
      
      cy.wait('@getRequirements');
      
      // Verify filters are cleared
      cy.get('[data-testid="filter-category"]')
        .should('contain.text', 'All Categories');
    });
  });

  describe('Create Requirement - Form Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      cy.get('[data-testid="button-add-requirement"]').click();
    });

    it('should display complete create requirement form', () => {
      // Form container
      cy.get('[data-testid="requirement-form"]', { timeout: 5000 })
        .should('be.visible');
      
      // Form title
      cy.get('[data-testid="form-title"]')
        .should('contain.text', /create|add.*requirement/i);
      
      // Required fields
      cy.get('[data-testid="input-title"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="textarea-description"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      // Dropdowns
      cy.get('[data-testid="select-category"]').should('be.visible');
      cy.get('[data-testid="select-priority"]').should('be.visible');
      cy.get('[data-testid="select-type"]').should('be.visible');
      cy.get('[data-testid="select-status"]').should('be.visible');
      
      // Optional fields
      cy.get('[data-testid="textarea-acceptance-criteria"]')
        .should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-save-requirement"]')
        .should('be.visible')
        .and('be.disabled'); // Should be disabled initially
      
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should validate required fields', () => {
      // Try to submit without filling required fields
      cy.get('[data-testid="button-save-requirement"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      
      // Form should not be submitted
      cy.url().should('include', '/requirements');
    });

    it('should validate field lengths', () => {
      // Test title max length
      cy.get('[data-testid="input-title"]')
        .type(testData.requirements.invalid.longTitle);
      
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', /maximum.*characters/i);
      
      // Test description max length
      cy.get('[data-testid="textarea-description"]')
        .type(testData.requirements.invalid.longDescription);
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', /maximum.*characters/i);
    });

    it('should show character counters', () => {
      const title = 'Test Title';
      const description = 'Test Description';
      
      cy.get('[data-testid="input-title"]').type(title);
      cy.get('[data-testid="title-counter"]')
        .should('contain.text', `${title.length}`);
      
      cy.get('[data-testid="textarea-description"]').type(description);
      cy.get('[data-testid="description-counter"]')
        .should('contain.text', `${description.length}`);
    });

    it('should enable save button when form is valid', () => {
      // Fill required fields
      cy.get('[data-testid="input-title"]')
        .type(testData.requirements.valid.title);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.requirements.valid.description);
      
      // Select required dropdowns
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-functional"]').click();
      
      cy.get('[data-testid="select-priority"]').click();
      cy.get('[data-testid="option-high"]').click();
      
      // Save button should be enabled
      cy.get('[data-testid="button-save-requirement"]')
        .should('not.be.disabled');
    });

    it('should cancel form and return to list', () => {
      // Fill some data
      cy.get('[data-testid="input-title"]')
        .type('Some title');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should return to requirements list
      cy.url().should('not.include', '/create');
      cy.get('[data-testid="requirements-table"]').should('be.visible');
    });

    it('should show confirmation dialog when canceling with unsaved changes', () => {
      // Fill some data
      cy.get('[data-testid="input-title"]')
        .type('Unsaved changes');
      
      cy.get('[data-testid="textarea-description"]')
        .type('Some description');
      
      // Try to cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="cancel-confirmation-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-cancel"]').click();
      
      // Should return to list
      cy.url().should('not.include', '/create');
    });
  });

  describe('Create Requirement - CRUD Operations', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      cy.get('[data-testid="button-add-requirement"]').click();
    });

    it('should successfully create a new requirement', () => {
      const newRequirement = {
        id: 'req-123',
        ...testData.requirements.valid,
        createdAt: new Date().toISOString()
      };
      
      cy.intercept('POST', apiEndpoints.requirements, {
        statusCode: 201,
        body: { data: newRequirement }
      }).as('createRequirement');
      
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-with-new.json'
      }).as('getUpdatedRequirements');
      
      // Fill form
      cy.get('[data-testid="input-title"]')
        .type(testData.requirements.valid.title);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.requirements.valid.description);
      
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-functional"]').click();
      
      cy.get('[data-testid="select-priority"]').click();
      cy.get('[data-testid="option-high"]').click();
      
      cy.get('[data-testid="select-type"]').click();
      cy.get('[data-testid="option-business"]').click();
      
      cy.get('[data-testid="textarea-acceptance-criteria"]')
        .type(testData.requirements.valid.acceptanceCriteria);
      
      // Submit form
      cy.get('[data-testid="button-save-requirement"]').click();
      
      cy.wait('@createRequirement');
      
      // Should show success message
      cy.get('[data-testid="success-toast"]')
        .should('be.visible')
        .and('contain.text', /requirement.*created/i);
      
      // Should redirect to requirements list
      cy.url().should('not.include', '/create');
      
      cy.wait('@getUpdatedRequirements');
      
      // New requirement should appear in list
      cy.get('[data-testid="requirements-table"]')
        .should('contain.text', testData.requirements.valid.title);
    });

    it('should handle server errors during creation', () => {
      cy.intercept('POST', apiEndpoints.requirements, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('createRequirementError');
      
      // Fill valid form
      cy.get('[data-testid="input-title"]')
        .type(testData.requirements.valid.title);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.requirements.valid.description);
      
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-functional"]').click();
      
      cy.get('[data-testid="select-priority"]').click();
      cy.get('[data-testid="option-high"]').click();
      
      // Submit form
      cy.get('[data-testid="button-save-requirement"]').click();
      
      cy.wait('@createRequirementError');
      
      // Should show error message
      cy.get('[data-testid="error-toast"]')
        .should('be.visible')
        .and('contain.text', /error.*creating/i);
      
      // Should remain on form
      cy.get('[data-testid="requirement-form"]').should('be.visible');
    });

    it('should handle validation errors from server', () => {
      cy.intercept('POST', apiEndpoints.requirements, {
        statusCode: 400,
        body: {
          error: 'Validation failed',
          details: {
            title: 'Title must be unique',
            description: 'Description is too short'
          }
        }
      }).as('createValidationError');
      
      // Fill form
      cy.get('[data-testid="input-title"]')
        .type('Duplicate Title');
      
      cy.get('[data-testid="textarea-description"]')
        .type('Short');
      
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-functional"]').click();
      
      // Submit form
      cy.get('[data-testid="button-save-requirement"]').click();
      
      cy.wait('@createValidationError');
      
      // Should show field-specific errors
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', /unique/i);
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', /too short/i);
    });

    it('should save requirement as draft', () => {
      cy.intercept('POST', apiEndpoints.requirements, {
        statusCode: 201,
        body: {
          data: {
            id: 'req-draft-123',
            ...testData.requirements.valid,
            status: 'Draft'
          }
        }
      }).as('createDraftRequirement');
      
      // Fill minimal form
      cy.get('[data-testid="input-title"]')
        .type('Draft Requirement');
      
      cy.get('[data-testid="textarea-description"]')
        .type('Draft description');
      
      // Save as draft
      cy.get('[data-testid="button-save-draft"]').click();
      
      cy.wait('@createDraftRequirement');
      
      cy.get('[data-testid="success-toast"]')
        .should('contain.text', /draft.*saved/i);
    });
  });

  describe('View Requirement Details', () => {
    const requirementId = 'req-123';
    
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.intercept('GET', `${apiEndpoints.requirements}/${requirementId}`, {
        fixture: 'requirements/requirement-detail.json'
      }).as('getRequirementDetail');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should display requirement details when clicking on a requirement', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      
      cy.wait('@getRequirementDetail');
      
      // Should show details modal/page
      cy.get('[data-testid="requirement-details"]')
        .should('be.visible');
      
      // Verify all sections are present
      cy.get('[data-testid="requirement-title"]')
        .should('be.visible')
        .and('not.be.empty');
      
      cy.get('[data-testid="requirement-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="requirement-metadata"]')
        .should('be.visible');
      
      cy.get('[data-testid="requirement-acceptance-criteria"]')
        .should('be.visible');
      
      cy.get('[data-testid="requirement-audit-trail"]')
        .should('be.visible');
    });

    it('should display all requirement metadata correctly', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="requirement-details"]').within(() => {
        // Basic info
        cy.get('[data-testid="requirement-id"]')
          .should('contain.text', 'req-123');
        
        cy.get('[data-testid="requirement-category"]')
          .should('be.visible');
        
        cy.get('[data-testid="requirement-priority"]')
          .should('be.visible');
        
        cy.get('[data-testid="requirement-status"]')
          .should('be.visible');
        
        cy.get('[data-testid="requirement-type"]')
          .should('be.visible');
        
        // Dates
        cy.get('[data-testid="requirement-created-date"]')
          .should('be.visible');
        
        cy.get('[data-testid="requirement-updated-date"]')
          .should('be.visible');
        
        // Creator info
        cy.get('[data-testid="requirement-creator"]')
          .should('be.visible');
      });
    });

    it('should show edit and delete buttons for authorized users', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-edit-requirement"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      cy.get('[data-testid="button-delete-requirement"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should display audit trail with proper chronological order', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="requirement-audit-trail"]').within(() => {
        // Should have timeline entries
        cy.get('[data-testid="audit-entry"]')
          .should('have.length.at.least', 1);
        
        // Entries should have timestamps
        cy.get('[data-testid="audit-timestamp"]')
          .should('be.visible');
        
        // Entries should have user info
        cy.get('[data-testid="audit-user"]')
          .should('be.visible');
        
        // Entries should have action description
        cy.get('[data-testid="audit-action"]')
          .should('be.visible');
      });
    });

    it('should close details modal when clicking close button', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-close-details"]').click();
      
      cy.get('[data-testid="requirement-details"]')
        .should('not.exist');
      
      // Should return to requirements list
      cy.get('[data-testid="requirements-table"]')
        .should('be.visible');
    });

    it('should handle requirement not found error', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}/invalid-id`, {
        statusCode: 404,
        body: { error: 'Requirement not found' }
      }).as('getRequirementNotFound');
      
      cy.visit(`/projects/${testData.project.id}/requirements/invalid-id`);
      
      cy.wait('@getRequirementNotFound');
      
      cy.get('[data-testid="error-not-found"]')
        .should('be.visible')
        .and('contain.text', /not found/i);
      
      cy.get('[data-testid="button-back-to-requirements"]')
        .should('be.visible');
    });
  });

  describe('Edit Requirement', () => {
    const requirementId = 'req-123';
    
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.intercept('GET', `${apiEndpoints.requirements}/${requirementId}`, {
        fixture: 'requirements/requirement-detail.json'
      }).as('getRequirementDetail');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      // Click on requirement to view details
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      // Click edit button
      cy.get('[data-testid="button-edit-requirement"]').click();
    });

    it('should display edit form with pre-populated values', () => {
      // Form should be visible
      cy.get('[data-testid="requirement-form"]')
        .should('be.visible');
      
      cy.get('[data-testid="form-title"]')
        .should('contain.text', /edit.*requirement/i);
      
      // Fields should be pre-populated
      cy.get('[data-testid="input-title"]')
        .should('have.value')
        .and('not.be.empty');
      
      cy.get('[data-testid="textarea-description"]')
        .should('have.value')
        .and('not.be.empty');
      
      cy.get('[data-testid="select-category"]')
        .should('not.contain.text', 'Select Category');
      
      cy.get('[data-testid="select-priority"]')
        .should('not.contain.text', 'Select Priority');
      
      // Save button should be enabled
      cy.get('[data-testid="button-save-requirement"]')
        .should('not.be.disabled');
    });

    it('should successfully update requirement', () => {
      cy.intercept('PATCH', `${apiEndpoints.requirements}/${requirementId}`, {
        statusCode: 200,
        body: {
          data: {
            id: requirementId,
            ...testData.requirements.update
          }
        }
      }).as('updateRequirement');
      
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-updated.json'
      }).as('getUpdatedRequirements');
      
      // Update fields
      cy.get('[data-testid="input-title"]')
        .clear()
        .type(testData.requirements.update.title);
      
      cy.get('[data-testid="textarea-description"]')
        .clear()
        .type(testData.requirements.update.description);
      
      cy.get('[data-testid="select-priority"]').click();
      cy.get('[data-testid="option-medium"]').click();
      
      // Save changes
      cy.get('[data-testid="button-save-requirement"]').click();
      
      cy.wait('@updateRequirement');
      
      // Should show success message
      cy.get('[data-testid="success-toast"]')
        .should('be.visible')
        .and('contain.text', /requirement.*updated/i);
      
      // Should return to details view
      cy.get('[data-testid="requirement-details"]')
        .should('be.visible');
      
      // Updated values should be displayed
      cy.get('[data-testid="requirement-title"]')
        .should('contain.text', testData.requirements.update.title);
    });

    it('should validate required fields during edit', () => {
      // Clear required field
      cy.get('[data-testid="input-title"]').clear();
      
      // Try to save
      cy.get('[data-testid="button-save-requirement"]').click();
      
      // Should show validation error
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      
      // Should not submit
      cy.get('[data-testid="requirement-form"]')
        .should('be.visible');
    });

    it('should handle concurrent edit conflicts', () => {
      cy.intercept('PATCH', `${apiEndpoints.requirements}/${requirementId}`, {
        statusCode: 409,
        body: {
          error: 'Conflict: Requirement was modified by another user'
        }
      }).as('updateConflict');
      
      // Make changes
      cy.get('[data-testid="input-title"]')
        .clear()
        .type('Updated Title');
      
      // Try to save
      cy.get('[data-testid="button-save-requirement"]').click();
      
      cy.wait('@updateConflict');
      
      // Should show conflict dialog
      cy.get('[data-testid="conflict-dialog"]')
        .should('be.visible')
        .and('contain.text', /modified.*another user/i);
      
      // Options to resolve conflict
      cy.get('[data-testid="button-reload-and-retry"]')
        .should('be.visible');
      
      cy.get('[data-testid="button-force-save"]')
        .should('be.visible');
    });

    it('should discard changes when canceling', () => {
      // Make changes
      cy.get('[data-testid="input-title"]')
        .clear()
        .type('Changed Title');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should show confirmation for unsaved changes
      cy.get('[data-testid="cancel-confirmation-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-discard"]').click();
      
      // Should return to details view
      cy.get('[data-testid="requirement-details"]')
        .should('be.visible');
      
      // Original title should be displayed
      cy.get('[data-testid="requirement-title"]')
        .should('not.contain.text', 'Changed Title');
    });

    it('should track field-level changes', () => {
      // Make changes to multiple fields
      cy.get('[data-testid="input-title"]')
        .clear()
        .type('New Title');
      
      cy.get('[data-testid="select-priority"]').click();
      cy.get('[data-testid="option-low"]').click();
      
      // Should show change indicators
      cy.get('[data-testid="field-changed-title"]')
        .should('be.visible');
      
      cy.get('[data-testid="field-changed-priority"]')
        .should('be.visible');
      
      // Should show summary of changes
      cy.get('[data-testid="changes-summary"]')
        .should('be.visible')
        .and('contain.text', '2 fields changed');
    });
  });

  describe('Delete Requirement', () => {
    const requirementId = 'req-123';
    
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.intercept('GET', `${apiEndpoints.requirements}/${requirementId}`, {
        fixture: 'requirements/requirement-detail.json'
      }).as('getRequirementDetail');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-delete-requirement"]').click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="delete-confirmation-message"]')
        .should('contain.text', /permanently delete/i)
        .and('contain.text', /cannot be undone/i);
      
      // Should show requirement title in confirmation
      cy.get('[data-testid="delete-requirement-title"]')
        .should('be.visible')
        .and('not.be.empty');
      
      // Action buttons
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete/i);
      
      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should successfully delete requirement', () => {
      cy.intercept('DELETE', `${apiEndpoints.requirements}/${requirementId}`, {
        statusCode: 204
      }).as('deleteRequirement');
      
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-after-delete.json'
      }).as('getRequirementsAfterDelete');
      
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-delete-requirement"]').click();
      
      // Confirm deletion
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteRequirement');
      
      // Should show success message
      cy.get('[data-testid="success-toast"]')
        .should('be.visible')
        .and('contain.text', /requirement.*deleted/i);
      
      // Should return to requirements list
      cy.url().should('not.include', requirementId);
      
      cy.wait('@getRequirementsAfterDelete');
      
      // Deleted requirement should not appear in list
      cy.get('[data-testid="requirements-table"]')
        .should('not.contain.text', 'req-123');
    });

    it('should cancel delete operation', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-delete-requirement"]').click();
      
      // Cancel deletion
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');
      
      // Should remain on details page
      cy.get('[data-testid="requirement-details"]')
        .should('be.visible');
    });

    it('should handle delete errors', () => {
      cy.intercept('DELETE', `${apiEndpoints.requirements}/${requirementId}`, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('deleteRequirementError');
      
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-delete-requirement"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteRequirementError');
      
      // Should show error message
      cy.get('[data-testid="error-toast"]')
        .should('be.visible')
        .and('contain.text', /error.*deleting/i);
      
      // Should remain on details page
      cy.get('[data-testid="requirement-details"]')
        .should('be.visible');
    });

    it('should prevent deletion of requirements with dependencies', () => {
      cy.intercept('DELETE', `${apiEndpoints.requirements}/${requirementId}`, {
        statusCode: 400,
        body: {
          error: 'Cannot delete requirement with dependencies',
          details: {
            dependencies: ['task-1', 'task-2']
          }
        }
      }).as('deleteWithDependencies');
      
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetail');
      
      cy.get('[data-testid="button-delete-requirement"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteWithDependencies');
      
      // Should show dependency error
      cy.get('[data-testid="error-dialog"]')
        .should('be.visible')
        .and('contain.text', /dependencies/i);
      
      cy.get('[data-testid="dependency-list"]')
        .should('be.visible');
    });

    it('should support bulk delete operation', () => {
      cy.intercept('DELETE', `${apiEndpoints.requirements}/bulk`, {
        statusCode: 204
      }).as('bulkDeleteRequirements');
      
      // Select multiple requirements
      cy.get('[data-testid="checkbox-req-123"]').check();
      cy.get('[data-testid="checkbox-req-124"]').check();
      
      // Bulk actions should be visible
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      
      cy.get('[data-testid="button-bulk-delete"]').click();
      
      // Bulk delete confirmation
      cy.get('[data-testid="bulk-delete-confirmation"]')
        .should('be.visible')
        .and('contain.text', '2 requirements');
      
      cy.get('[data-testid="button-confirm-bulk-delete"]').click();
      
      cy.wait('@bulkDeleteRequirements');
      
      cy.get('[data-testid="success-toast"]')
        .should('contain.text', /2 requirements deleted/i);
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      cy.intercept('GET', `${apiEndpoints.requirements}*`, {
        fixture: 'requirements/requirements-paginated.json'
      }).as('getRequirements');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      
      cy.get('[data-testid="pagination-info"]')
        .should('be.visible')
        .and('contain.text', /showing.*of.*requirements/i);
      
      cy.get('[data-testid="pagination-previous"]')
        .should('be.visible');
      
      cy.get('[data-testid="pagination-next"]')
        .should('be.visible');
      
      cy.get('[data-testid="pagination-pages"]')
        .should('be.visible');
    });

    it('should navigate through pages', () => {
      // Go to next page
      cy.get('[data-testid="pagination-next"]').click();
      
      cy.wait('@getRequirements');
      
      // URL should include page parameter
      cy.url().should('include', 'page=2');
      
      // Previous button should be enabled
      cy.get('[data-testid="pagination-previous"]')
        .should('not.be.disabled');
      
      // Go back to previous page
      cy.get('[data-testid="pagination-previous"]').click();
      
      cy.wait('@getRequirements');
      
      cy.url().should('not.include', 'page=2');
    });

    it('should change page size', () => {
      cy.get('[data-testid="page-size-selector"]').click();
      cy.get('[data-testid="page-size-50"]').click();
      
      cy.wait('@getRequirements');
      
      // Should show more items
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', '50');
    });

    it('should sort by title', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*sort=title*`, {
        fixture: 'requirements/requirements-sorted-title.json'
      }).as('getSortedRequirements');
      
      cy.get('[data-testid="sort-header-title"]').click();
      
      cy.wait('@getSortedRequirements');
      
      // Should show sort indicator
      cy.get('[data-testid="sort-indicator-title"]')
        .should('be.visible');
      
      // Click again for descending
      cy.get('[data-testid="sort-header-title"]').click();
      
      cy.wait('@getSortedRequirements');
      
      cy.get('[data-testid="sort-indicator-title"]')
        .should('have.class', 'desc');
    });

    it('should sort by priority', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*sort=priority*`, {
        fixture: 'requirements/requirements-sorted-priority.json'
      }).as('getSortedByPriority');
      
      cy.get('[data-testid="sort-header-priority"]').click();
      
      cy.wait('@getSortedByPriority');
      
      // High priority items should appear first
      cy.get('[data-testid="requirements-table"] tbody tr:first-child')
        .should('contain.text', 'High');
    });

    it('should sort by creation date', () => {
      cy.intercept('GET', `${apiEndpoints.requirements}*sort=createdAt*`, {
        fixture: 'requirements/requirements-sorted-date.json'
      }).as('getSortedByDate');
      
      cy.get('[data-testid="sort-header-created"]').click();
      
      cy.wait('@getSortedByDate');
      
      cy.get('[data-testid="sort-indicator-created"]')
        .should('be.visible');
    });

    it('should maintain sort and filters across pages', () => {
      // Apply filter
      cy.get('[data-testid="filter-priority"]').click();
      cy.get('[data-testid="filter-option-high"]').click();
      
      // Apply sort
      cy.get('[data-testid="sort-header-title"]').click();
      
      // Navigate to next page
      cy.get('[data-testid="pagination-next"]').click();
      
      cy.wait('@getRequirements');
      
      // Sort and filter should persist
      cy.get('[data-testid="sort-indicator-title"]')
        .should('be.visible');
      
      cy.get('[data-testid="filter-priority"]')
        .should('contain.text', 'High');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
    });

    it('should display mobile-friendly layout on small screens', () => {
      cy.viewport('iphone-x');
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      // Mobile layout should be visible
      cy.get('[data-testid="requirements-mobile-layout"]')
        .should('be.visible');
      
      // Desktop table should be hidden
      cy.get('[data-testid="requirements-table"]')
        .should('not.be.visible');
      
      // Mobile cards should be visible
      cy.get('[data-testid="requirement-card"]')
        .should('be.visible')
        .and('have.length.at.least', 1);
    });

    it('should have working mobile navigation', () => {
      cy.viewport('iphone-x');
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      // Mobile menu button
      cy.get('[data-testid="mobile-menu-button"]').click();
      
      cy.get('[data-testid="mobile-menu"]')
        .should('be.visible');
      
      // Add requirement button should be accessible
      cy.get('[data-testid="mobile-add-requirement"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should show collapsible filters on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      // Filters should be collapsed by default
      cy.get('[data-testid="mobile-filters"]')
        .should('not.be.visible');
      
      // Toggle filters
      cy.get('[data-testid="toggle-filters"]').click();
      
      cy.get('[data-filters="mobile-filters"]')
        .should('be.visible');
    });

    it('should have touch-friendly buttons and interactions', () => {
      cy.viewport('iphone-x');
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      // Touch targets should be large enough
      cy.get('[data-testid="requirement-card"]').first().within(() => {
        cy.get('[data-testid="card-actions"]')
          .should('be.visible');
        
        // Action buttons should be touch-friendly
        cy.get('[data-testid="button-view"]')
          .should('have.css', 'min-height')
          .and('match', /4[4-8]px/);
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should have proper ARIA labels and roles', () => {
      // Main content area
      cy.get('[data-testid="requirements-container"]')
        .should('have.attr', 'role', 'main');
      
      // Table accessibility
      cy.get('[data-testid="requirements-table"]')
        .should('have.attr', 'role', 'table')
        .and('have.attr', 'aria-label');
      
      // Column headers
      cy.get('[data-testid="requirements-table"] th')
        .should('have.attr', 'role', 'columnheader');
      
      // Action buttons
      cy.get('[data-testid="button-add-requirement"]')
        .should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');
      
      // Table should be navigable
      cy.get('[data-testid="requirements-table"] tbody tr:first-child')
        .focus()
        .type('{enter}');
      
      // Should open requirement details
      cy.get('[data-testid="requirement-details"]')
        .should('be.visible');
    });

    it('should announce dynamic content changes', () => {
      // Create new requirement
      cy.get('[data-testid="button-add-requirement"]').click();
      
      // Form should have proper focus management
      cy.get('[data-testid="input-title"]')
        .should('be.focused');
      
      // Live region for announcements
      cy.get('[data-testid="live-announcements"]')
        .should('have.attr', 'aria-live', 'polite');
    });

    it('should have proper color contrast and visual indicators', () => {
      // Priority indicators should be accessible
      cy.get('[data-testid="priority-indicator-high"]')
        .should('have.attr', 'aria-label')
        .and('not.rely.on', 'color');
      
      // Status indicators
      cy.get('[data-testid="status-indicator"]')
        .should('have.attr', 'aria-label');
    });

    it('should support screen reader navigation', () => {
      // Skip links
      cy.get('[data-testid="skip-to-content"]')
        .should('exist');
      
      // Heading hierarchy
      cy.get('h1').should('have.length', 1);
      cy.get('h2, h3, h4').should('exist');
      
      // Landmark regions
      cy.get('[role="navigation"]').should('exist');
      cy.get('[role="main"]').should('exist');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
    });

    it('should handle network timeouts gracefully', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        delay: 30000,
        forceNetworkError: true
      }).as('getRequirementsTimeout');
      
      cy.reload();
      
      // Should show timeout error
      cy.get('[data-testid="error-timeout"]', { timeout: 35000 })
        .should('be.visible');
      
      cy.get('[data-testid="button-retry"]')
        .should('be.visible');
    });

    it('should handle server errors', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getRequirementsError');
      
      cy.reload();
      cy.wait('@getRequirementsError');
      
      cy.get('[data-testid="error-server"]')
        .should('be.visible')
        .and('contain.text', /server error/i);
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('getRequirementsUnauthorized');
      
      cy.reload();
      cy.wait('@getRequirementsUnauthorized');
      
      cy.get('[data-testid="error-unauthorized"]')
        .should('be.visible');
    });

    it('should handle malformed data gracefully', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 200,
        body: { data: 'invalid-data' }
      }).as('getMalformedData');
      
      cy.reload();
      cy.wait('@getMalformedData');
      
      // Should show error or empty state
      cy.get('[data-testid="error-data"], [data-testid="requirements-empty-state"]')
        .should('be.visible');
    });

    it('should recover from transient errors', () => {
      // First request fails
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getRequirementsError');
      
      cy.reload();
      cy.wait('@getRequirementsError');
      
      // Retry succeeds
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirementsSuccess');
      
      cy.get('[data-testid="button-retry"]').click();
      cy.wait('@getRequirementsSuccess');
      
      cy.get('[data-testid="requirements-table"]')
        .should('be.visible');
    });

    it('should handle concurrent user actions', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.reload();
      cy.wait('@getRequirements');
      
      // Simulate rapid clicks
      cy.get('[data-testid="button-add-requirement"]')
        .click()
        .click()
        .click();
      
      // Should only open one form
      cy.get('[data-testid="requirement-form"]')
        .should('have.length', 1);
    });

    it('should preserve user work during errors', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        fixture: 'requirements/requirements-list.json'
      }).as('getRequirements');
      
      cy.reload();
      cy.wait('@getRequirements');
      
      // Start creating requirement
      cy.get('[data-testid="button-add-requirement"]').click();
      
      cy.get('[data-testid="input-title"]')
        .type('Draft Title');
      
      cy.get('[data-testid="textarea-description"]')
        .type('Draft Description');
      
      // Simulate network error during save
      cy.intercept('POST', apiEndpoints.requirements, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('createRequirementError');
      
      cy.get('[data-testid="button-save-requirement"]').click();
      cy.wait('@createRequirementError');
      
      // User's work should be preserved
      cy.get('[data-testid="input-title"]')
        .should('have.value', 'Draft Title');
      
      cy.get('[data-testid="textarea-description"]')
        .should('have.value', 'Draft Description');
    });
  });
});
