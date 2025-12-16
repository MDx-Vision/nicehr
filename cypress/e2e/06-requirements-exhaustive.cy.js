describe('Requirements Management - Exhaustive Tests', () => {
  const testData = {
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    requirement: {
      title: 'Test Requirement',
      description: 'This is a test requirement description',
      priority: 'high',
      category: 'functional',
      status: 'draft',
      estimatedHours: 40,
      skillRequired: 'Epic',
      urgency: 'critical'
    },
    invalidRequirement: {
      title: '', // Invalid - empty title
      description: 'A'.repeat(2001), // Invalid - too long description
      priority: 'invalid-priority',
      estimatedHours: -5, // Invalid - negative hours
      skillRequired: ''
    },
    updateRequirement: {
      title: 'Updated Test Requirement',
      description: 'Updated requirement description',
      priority: 'medium',
      status: 'approved',
      estimatedHours: 60
    }
  };

  const apiEndpoints = {
    requirements: '/api/projects/*/requirements',
    specificRequirement: '/api/requirements/*',
    projects: '/api/projects/*'
  };

  const selectors = {
    // Navigation and layout
    requirementsTab: '[data-testid="tab-requirements"]',
    requirementsContainer: '[data-testid="requirements-container"]',
    
    // Create requirement
    createButton: '[data-testid="create-requirement-button"]',
    createModal: '[data-testid="create-requirement-modal"]',
    createForm: '[data-testid="create-requirement-form"]',
    
    // Form fields
    titleInput: '[data-testid="input-title"]',
    descriptionInput: '[data-testid="input-description"]',
    prioritySelect: '[data-testid="select-priority"]',
    categorySelect: '[data-testid="select-category"]',
    statusSelect: '[data-testid="select-status"]',
    estimatedHoursInput: '[data-testid="input-estimated-hours"]',
    skillRequiredSelect: '[data-testid="select-skill-required"]',
    urgencySelect: '[data-testid="select-urgency"]',
    
    // Actions
    submitButton: '[data-testid="button-submit"]',
    cancelButton: '[data-testid="button-cancel"]',
    saveButton: '[data-testid="button-save"]',
    deleteButton: '[data-testid="button-delete"]',
    
    // Lists and items
    requirementsList: '[data-testid="requirements-list"]',
    requirementItem: '[data-testid^="requirement-item-"]',
    requirementCard: '[data-testid^="requirement-card-"]',
    
    // View/Edit
    viewButton: '[data-testid^="view-requirement-"]',
    editButton: '[data-testid^="edit-requirement-"]',
    deleteConfirmButton: '[data-testid="confirm-delete-requirement"]',
    
    // Search and filters
    searchInput: '[data-testid="search-requirements"]',
    priorityFilter: '[data-testid="filter-priority"]',
    statusFilter: '[data-testid="filter-status"]',
    categoryFilter: '[data-testid="filter-category"]',
    clearFiltersButton: '[data-testid="clear-filters"]',
    
    // Pagination
    pagination: '[data-testid="requirements-pagination"]',
    nextPageButton: '[data-testid="pagination-next"]',
    prevPageButton: '[data-testid="pagination-prev"]',
    pageInfo: '[data-testid="pagination-info"]',
    
    // States
    emptyState: '[data-testid="requirements-empty-state"]',
    loadingState: '[data-testid="requirements-loading"]',
    errorState: '[data-testid="requirements-error"]',
    
    // Validation
    errorMessage: '[data-testid="error-message"]',
    fieldError: '[data-testid^="field-error-"]',
    
    // Modals and dialogs
    modal: '[data-testid="modal"]',
    confirmDialog: '[data-testid="confirm-dialog"]',
    alertDialog: '[data-testid="alert-dialog"]'
  };

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.intercept('GET', apiEndpoints.requirements, { fixture: 'requirements/list.json' }).as('getRequirements');
    cy.intercept('POST', apiEndpoints.requirements, { statusCode: 201, body: { id: 'new-req-id', ...testData.requirement } }).as('createRequirement');
    cy.intercept('DELETE', apiEndpoints.specificRequirement, { statusCode: 204 }).as('deleteRequirement');
    cy.intercept('GET', apiEndpoints.projects, { fixture: 'projects/detail.json' }).as('getProject');
  });

  describe('Requirements Page - Layout and Navigation', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.wait('@getProject');
    });

    it('should display requirements section with all components', () => {
      // Navigate to requirements tab
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
      
      // Main container
      cy.get(selectors.requirementsContainer)
        .should('be.visible')
        .within(() => {
          // Header with create button
          cy.get(selectors.createButton).should('be.visible');
          
          // Search and filters
          cy.get(selectors.searchInput).should('be.visible');
          cy.get(selectors.priorityFilter).should('be.visible');
          cy.get(selectors.statusFilter).should('be.visible');
          cy.get(selectors.categoryFilter).should('be.visible');
          
          // Requirements list
          cy.get(selectors.requirementsList).should('be.visible');
        });
    });

    it('should have proper page title and breadcrumbs', () => {
      cy.get(selectors.requirementsTab).click();
      
      cy.title().should('include', 'Requirements');
      cy.get('[data-testid="breadcrumb"]')
        .should('contain', 'Projects')
        .and('contain', testData.project.name)
        .and('contain', 'Requirements');
    });

    it('should display requirements list with proper structure', () => {
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
      
      cy.get(selectors.requirementsList).within(() => {
        cy.get(selectors.requirementItem).should('have.length.at.least', 1);
        
        cy.get(selectors.requirementItem).first().within(() => {
          cy.get('[data-testid="requirement-title"]').should('be.visible');
          cy.get('[data-testid="requirement-priority"]').should('be.visible');
          cy.get('[data-testid="requirement-status"]').should('be.visible');
          cy.get('[data-testid="requirement-category"]').should('be.visible');
          cy.get('[data-testid="requirement-estimated-hours"]').should('be.visible');
          cy.get(selectors.editButton).should('be.visible');
          cy.get(selectors.deleteButton).should('be.visible');
        });
      });
    });
  });

  describe('Create Requirement - Form and Validation', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
    });

    it('should open create requirement modal with all form fields', () => {
      cy.get(selectors.createButton).click();
      
      cy.get(selectors.createModal)
        .should('be.visible')
        .within(() => {
          // Modal header
          cy.get('h2, h3').should('contain', /create|add.*requirement/i);
          
          // Form fields
          cy.get(selectors.titleInput)
            .should('be.visible')
            .and('have.attr', 'required');
          
          cy.get(selectors.descriptionInput)
            .should('be.visible')
            .and('have.attr', 'required');
          
          cy.get(selectors.prioritySelect).should('be.visible');
          cy.get(selectors.categorySelect).should('be.visible');
          cy.get(selectors.statusSelect).should('be.visible');
          cy.get(selectors.estimatedHoursInput).should('be.visible');
          cy.get(selectors.skillRequiredSelect).should('be.visible');
          
          // Action buttons
          cy.get(selectors.submitButton).should('be.visible');
          cy.get(selectors.cancelButton).should('be.visible');
        });
    });

    it('should validate required fields', () => {
      cy.get(selectors.createButton).click();
      
      // Try to submit empty form
      cy.get(selectors.submitButton).click();
      
      // Check for validation errors
      cy.get(selectors.fieldError + 'title')
        .should('be.visible')
        .and('contain', /required|cannot be empty/i);
      
      cy.get(selectors.fieldError + 'description')
        .should('be.visible')
        .and('contain', /required|cannot be empty/i);
    });

    it('should validate field formats and constraints', () => {
      cy.get(selectors.createButton).click();
      
      // Test invalid estimated hours
      cy.get(selectors.estimatedHoursInput).type('-5');
      cy.get(selectors.submitButton).click();
      
      cy.get(selectors.fieldError + 'estimated-hours')
        .should('be.visible')
        .and('contain', /must be positive|greater than 0/i);
      
      // Test description length limit
      cy.get(selectors.descriptionInput).type('A'.repeat(2001));
      cy.get(selectors.submitButton).click();
      
      cy.get(selectors.fieldError + 'description')
        .should('be.visible')
        .and('contain', /too long|maximum/i);
    });

    it('should successfully create a requirement with valid data', () => {
      cy.get(selectors.createButton).click();
      
      // Fill form with valid data
      cy.get(selectors.titleInput).type(testData.requirement.title);
      cy.get(selectors.descriptionInput).type(testData.requirement.description);
      cy.get(selectors.prioritySelect).select(testData.requirement.priority);
      cy.get(selectors.categorySelect).select(testData.requirement.category);
      cy.get(selectors.statusSelect).select(testData.requirement.status);
      cy.get(selectors.estimatedHoursInput).type(testData.requirement.estimatedHours.toString());
      cy.get(selectors.skillRequiredSelect).select(testData.requirement.skillRequired);
      
      // Submit form
      cy.get(selectors.submitButton).click();
      
      // Verify API call
      cy.wait('@createRequirement').then((interception) => {
        expect(interception.request.body).to.include({
          title: testData.requirement.title,
          description: testData.requirement.description,
          priority: testData.requirement.priority
        });
      });
      
      // Modal should close
      cy.get(selectors.createModal).should('not.exist');
      
      // Success notification
      cy.get('[data-testid="notification"], [data-testid="toast"]')
        .should('be.visible')
        .and('contain', /created|added|success/i);
    });

    it('should handle create requirement API errors', () => {
      cy.intercept('POST', apiEndpoints.requirements, {
        statusCode: 400,
        body: { error: 'Invalid requirement data' }
      }).as('createRequirementError');
      
      cy.get(selectors.createButton).click();
      
      // Fill and submit form
      cy.get(selectors.titleInput).type(testData.requirement.title);
      cy.get(selectors.descriptionInput).type(testData.requirement.description);
      cy.get(selectors.submitButton).click();
      
      cy.wait('@createRequirementError');
      
      // Error message should appear
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain', /error|failed|invalid/i);
      
      // Modal should remain open
      cy.get(selectors.createModal).should('be.visible');
    });

    it('should cancel requirement creation', () => {
      cy.get(selectors.createButton).click();
      
      // Fill some data
      cy.get(selectors.titleInput).type('Some title');
      
      // Cancel
      cy.get(selectors.cancelButton).click();
      
      // Modal should close
      cy.get(selectors.createModal).should('not.exist');
      
      // No API call should be made
      cy.get('@createRequirement.all').should('have.length', 0);
    });
  });

  describe('Requirements List - Display and Interaction', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
    });

    it('should display requirements with all relevant information', () => {
      cy.get(selectors.requirementItem).first().within(() => {
        cy.get('[data-testid="requirement-title"]')
          .should('be.visible')
          .and('not.be.empty');
        
        cy.get('[data-testid="requirement-description"]')
          .should('be.visible');
        
        cy.get('[data-testid="requirement-priority"]')
          .should('be.visible')
          .and('contain.oneOf', ['low', 'medium', 'high', 'critical']);
        
        cy.get('[data-testid="requirement-status"]')
          .should('be.visible')
          .and('contain.oneOf', ['draft', 'approved', 'in-progress', 'completed']);
        
        cy.get('[data-testid="requirement-category"]')
          .should('be.visible');
        
        cy.get('[data-testid="requirement-estimated-hours"]')
          .should('be.visible')
          .and('match', /\d+/);
      });
    });

    it('should show priority badges with appropriate styling', () => {
      cy.get('[data-testid="requirement-priority"]').each(($priority) => {
        const priorityText = $priority.text().toLowerCase();
        
        if (priorityText.includes('high') || priorityText.includes('critical')) {
          cy.wrap($priority).should('have.class', /red|danger|high|critical/);
        } else if (priorityText.includes('medium')) {
          cy.wrap($priority).should('have.class', /yellow|warning|medium/);
        } else if (priorityText.includes('low')) {
          cy.wrap($priority).should('have.class', /green|success|low/);
        }
      });
    });

    it('should show status badges with appropriate styling', () => {
      cy.get('[data-testid="requirement-status"]').each(($status) => {
        const statusText = $status.text().toLowerCase();
        
        if (statusText.includes('completed')) {
          cy.wrap($status).should('have.class', /green|success|completed/);
        } else if (statusText.includes('in-progress')) {
          cy.wrap($status).should('have.class', /blue|info|progress/);
        } else if (statusText.includes('draft')) {
          cy.wrap($status).should('have.class', /gray|muted|draft/);
        }
      });
    });

    it('should handle empty requirements state', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 200,
        body: []
      }).as('getEmptyRequirements');
      
      cy.reload();
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getEmptyRequirements');
      
      cy.get(selectors.emptyState)
        .should('be.visible')
        .within(() => {
          cy.contains(/no requirements|empty|nothing here/i);
          cy.get(selectors.createButton).should('be.visible');
        });
    });

    it('should handle loading state', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        delay: 2000,
        statusCode: 200,
        body: []
      }).as('getSlowRequirements');
      
      cy.reload();
      cy.get(selectors.requirementsTab).click();
      
      cy.get(selectors.loadingState).should('be.visible');
      
      cy.wait('@getSlowRequirements');
      cy.get(selectors.loadingState).should('not.exist');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getRequirementsError');
      
      cy.reload();
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirementsError');
      
      cy.get(selectors.errorState)
        .should('be.visible')
        .and('contain', /error|failed|try again/i);
    });
  });

  describe('Edit Requirement - Functionality', () => {
    let requirementId;

    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
      
      requirementId = 'test-req-id';
      cy.intercept('GET', `/api/requirements/${requirementId}`, {
        statusCode: 200,
        body: { id: requirementId, ...testData.requirement }
      }).as('getRequirement');
      
      cy.intercept('PATCH', `/api/requirements/${requirementId}`, {
        statusCode: 200,
        body: { id: requirementId, ...testData.updateRequirement }
      }).as('updateRequirement');
    });

    it('should open edit modal with pre-filled data', () => {
      cy.get(selectors.editButton).first().click();
      cy.wait('@getRequirement');
      
      cy.get('[data-testid="edit-requirement-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get(selectors.titleInput).should('have.value', testData.requirement.title);
          cy.get(selectors.descriptionInput).should('have.value', testData.requirement.description);
          cy.get(selectors.prioritySelect).should('have.value', testData.requirement.priority);
          cy.get(selectors.statusSelect).should('have.value', testData.requirement.status);
          cy.get(selectors.estimatedHoursInput).should('have.value', testData.requirement.estimatedHours.toString());
        });
    });

    it('should successfully update requirement', () => {
      cy.get(selectors.editButton).first().click();
      cy.wait('@getRequirement');
      
      // Update fields
      cy.get(selectors.titleInput).clear().type(testData.updateRequirement.title);
      cy.get(selectors.descriptionInput).clear().type(testData.updateRequirement.description);
      cy.get(selectors.prioritySelect).select(testData.updateRequirement.priority);
      cy.get(selectors.statusSelect).select(testData.updateRequirement.status);
      cy.get(selectors.estimatedHoursInput).clear().type(testData.updateRequirement.estimatedHours.toString());
      
      // Submit changes
      cy.get(selectors.saveButton).click();
      
      cy.wait('@updateRequirement').then((interception) => {
        expect(interception.request.body).to.include({
          title: testData.updateRequirement.title,
          description: testData.updateRequirement.description,
          priority: testData.updateRequirement.priority
        });
      });
      
      // Modal should close
      cy.get('[data-testid="edit-requirement-modal"]').should('not.exist');
      
      // Success notification
      cy.get('[data-testid="notification"], [data-testid="toast"]')
        .should('be.visible')
        .and('contain', /updated|saved|success/i);
    });

    it('should validate edit form fields', () => {
      cy.get(selectors.editButton).first().click();
      cy.wait('@getRequirement');
      
      // Clear required field
      cy.get(selectors.titleInput).clear();
      cy.get(selectors.saveButton).click();
      
      cy.get(selectors.fieldError + 'title')
        .should('be.visible')
        .and('contain', /required/i);
    });

    it('should handle edit requirement API errors', () => {
      cy.intercept('PATCH', `/api/requirements/${requirementId}`, {
        statusCode: 400,
        body: { error: 'Invalid requirement data' }
      }).as('updateRequirementError');
      
      cy.get(selectors.editButton).first().click();
      cy.wait('@getRequirement');
      
      cy.get(selectors.titleInput).clear().type('New Title');
      cy.get(selectors.saveButton).click();
      
      cy.wait('@updateRequirementError');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain', /error|failed/i);
    });

    it('should cancel requirement editing', () => {
      cy.get(selectors.editButton).first().click();
      cy.wait('@getRequirement');
      
      // Make changes
      cy.get(selectors.titleInput).clear().type('Changed Title');
      
      // Cancel
      cy.get(selectors.cancelButton).click();
      
      // Modal should close
      cy.get('[data-testid="edit-requirement-modal"]').should('not.exist');
      
      // No API call should be made
      cy.get('@updateRequirement.all').should('have.length', 0);
    });
  });

  describe('Delete Requirement - Functionality', () => {
    let requirementId;

    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
      
      requirementId = 'test-req-id';
    });

    it('should show confirmation dialog before deleting', () => {
      cy.get(selectors.deleteButton).first().click();
      
      cy.get(selectors.confirmDialog)
        .should('be.visible')
        .within(() => {
          cy.contains(/delete|remove|confirm/i);
          cy.get(selectors.deleteConfirmButton).should('be.visible');
          cy.get(selectors.cancelButton).should('be.visible');
        });
    });

    it('should successfully delete requirement', () => {
      cy.intercept('DELETE', `/api/requirements/${requirementId}`, {
        statusCode: 204
      }).as('deleteRequirementSuccess');
      
      cy.get(selectors.deleteButton).first().click();
      cy.get(selectors.deleteConfirmButton).click();
      
      cy.wait('@deleteRequirementSuccess');
      
      // Success notification
      cy.get('[data-testid="notification"], [data-testid="toast"]')
        .should('be.visible')
        .and('contain', /deleted|removed|success/i);
      
      // Confirmation dialog should close
      cy.get(selectors.confirmDialog).should('not.exist');
    });

    it('should handle delete requirement API errors', () => {
      cy.intercept('DELETE', `/api/requirements/${requirementId}`, {
        statusCode: 400,
        body: { error: 'Cannot delete requirement' }
      }).as('deleteRequirementError');
      
      cy.get(selectors.deleteButton).first().click();
      cy.get(selectors.deleteConfirmButton).click();
      
      cy.wait('@deleteRequirementError');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain', /error|failed|cannot delete/i);
    });

    it('should cancel requirement deletion', () => {
      cy.get(selectors.deleteButton).first().click();
      cy.get(selectors.cancelButton).click();
      
      // Dialog should close
      cy.get(selectors.confirmDialog).should('not.exist');
      
      // No API call should be made
      cy.get('@deleteRequirement.all').should('have.length', 0);
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
    });

    it('should search requirements by title', () => {
      const searchTerm = 'Epic';
      
      cy.intercept('GET', apiEndpoints.requirements + `?search=${searchTerm}`, {
        fixture: 'requirements/search-results.json'
      }).as('searchRequirements');
      
      cy.get(selectors.searchInput).type(searchTerm);
      
      cy.wait('@searchRequirements');
      
      cy.get(selectors.requirementItem).each(($item) => {
        cy.wrap($item)
          .find('[data-testid="requirement-title"]')
          .should('contain', searchTerm);
      });
    });

    it('should filter requirements by priority', () => {
      cy.intercept('GET', apiEndpoints.requirements + '?priority=high', {
        fixture: 'requirements/high-priority-results.json'
      }).as('filterByPriority');
      
      cy.get(selectors.priorityFilter).select('high');
      
      cy.wait('@filterByPriority');
      
      cy.get('[data-testid="requirement-priority"]').each(($priority) => {
        cy.wrap($priority).should('contain', 'high');
      });
    });

    it('should filter requirements by status', () => {
      cy.intercept('GET', apiEndpoints.requirements + '?status=approved', {
        fixture: 'requirements/approved-results.json'
      }).as('filterByStatus');
      
      cy.get(selectors.statusFilter).select('approved');
      
      cy.wait('@filterByStatus');
      
      cy.get('[data-testid="requirement-status"]').each(($status) => {
        cy.wrap($status).should('contain', 'approved');
      });
    });

    it('should filter requirements by category', () => {
      cy.intercept('GET', apiEndpoints.requirements + '?category=functional', {
        fixture: 'requirements/functional-results.json'
      }).as('filterByCategory');
      
      cy.get(selectors.categoryFilter).select('functional');
      
      cy.wait('@filterByCategory');
      
      cy.get('[data-testid="requirement-category"]').each(($category) => {
        cy.wrap($category).should('contain', 'functional');
      });
    });

    it('should combine search and filters', () => {
      const searchTerm = 'Epic';
      
      cy.intercept('GET', apiEndpoints.requirements + `?search=${searchTerm}&priority=high&status=approved`, {
        fixture: 'requirements/combined-filter-results.json'
      }).as('combinedFilter');
      
      cy.get(selectors.searchInput).type(searchTerm);
      cy.get(selectors.priorityFilter).select('high');
      cy.get(selectors.statusFilter).select('approved');
      
      cy.wait('@combinedFilter');
      
      cy.get(selectors.requirementItem).should('have.length.at.least', 0);
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get(selectors.searchInput).type('test');
      cy.get(selectors.priorityFilter).select('high');
      cy.get(selectors.statusFilter).select('approved');
      
      // Clear filters
      cy.get(selectors.clearFiltersButton).click();
      
      // Verify filters are cleared
      cy.get(selectors.searchInput).should('have.value', '');
      cy.get(selectors.priorityFilter).should('have.value', '');
      cy.get(selectors.statusFilter).should('have.value', '');
      
      // Should reload all requirements
      cy.wait('@getRequirements');
    });

    it('should show no results state', () => {
      cy.intercept('GET', apiEndpoints.requirements + '?search=nonexistent', {
        statusCode: 200,
        body: []
      }).as('noResults');
      
      cy.get(selectors.searchInput).type('nonexistent');
      
      cy.wait('@noResults');
      
      cy.get('[data-testid="no-results-state"]')
        .should('be.visible')
        .and('contain', /no results|not found/i);
    });
  });

  describe('Pagination - Navigation and Display', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirements + '?page=1&limit=10', {
        fixture: 'requirements/paginated-page-1.json'
      }).as('getPage1');
      
      cy.intercept('GET', apiEndpoints.requirements + '?page=2&limit=10', {
        fixture: 'requirements/paginated-page-2.json'
      }).as('getPage2');
      
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getPage1');
    });

    it('should display pagination controls with correct info', () => {
      cy.get(selectors.pagination)
        .should('be.visible')
        .within(() => {
          cy.get(selectors.pageInfo)
            .should('be.visible')
            .and('contain', /page \d+ of \d+/i);
          
          cy.get(selectors.nextPageButton).should('be.visible');
          cy.get(selectors.prevPageButton).should('be.visible');
        });
    });

    it('should navigate to next page', () => {
      cy.get(selectors.nextPageButton).click();
      
      cy.wait('@getPage2');
      
      cy.get(selectors.pageInfo).should('contain', 'Page 2');
    });

    it('should navigate to previous page', () => {
      // Go to page 2 first
      cy.get(selectors.nextPageButton).click();
      cy.wait('@getPage2');
      
      // Go back to page 1
      cy.get(selectors.prevPageButton).click();
      cy.wait('@getPage1');
      
      cy.get(selectors.pageInfo).should('contain', 'Page 1');
    });

    it('should disable navigation buttons appropriately', () => {
      // On first page, previous should be disabled
      cy.get(selectors.prevPageButton).should('be.disabled');
      
      // Navigate to last page simulation
      cy.intercept('GET', apiEndpoints.requirements + '?page=5&limit=10', {
        body: {
          data: [],
          meta: { page: 5, totalPages: 5, hasNext: false, hasPrev: true }
        }
      }).as('getLastPage');
      
      // Simulate being on last page
      cy.window().then((win) => {
        win.history.pushState({}, '', `?page=5`);
      });
      
      cy.reload();
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getLastPage');
      
      cy.get(selectors.nextPageButton).should('be.disabled');
    });
  });

  describe('Responsive Design and Mobile View', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
    });

    it('should display properly on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Main container should be responsive
      cy.get(selectors.requirementsContainer)
        .should('be.visible')
        .and('have.css', 'width');
      
      // Cards should stack vertically
      cy.get(selectors.requirementItem)
        .should('have.length.at.least', 1)
        .each(($item) => {
          cy.wrap($item).should('be.visible');
        });
      
      // Buttons should be accessible
      cy.get(selectors.createButton).should('be.visible');
    });

    it('should display properly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get(selectors.requirementsContainer).should('be.visible');
      cy.get(selectors.requirementsList).should('be.visible');
      
      // Search and filters should be visible
      cy.get(selectors.searchInput).should('be.visible');
      cy.get(selectors.priorityFilter).should('be.visible');
    });

    it('should maintain functionality on smaller screens', () => {
      cy.viewport(768, 1024);
      
      // Create requirement should work
      cy.get(selectors.createButton).click();
      cy.get(selectors.createModal).should('be.visible');
      cy.get(selectors.cancelButton).click();
      
      // Edit should work
      cy.get(selectors.editButton).first().should('be.visible');
      
      // Search should work
      cy.get(selectors.searchInput).should('be.visible').type('test');
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
    });

    it('should have proper ARIA attributes', () => {
      // Main regions
      cy.get(selectors.requirementsContainer)
        .should('have.attr', 'role')
        .or('have.attr', 'aria-label');
      
      // Search input
      cy.get(selectors.searchInput)
        .should('have.attr', 'aria-label')
        .and('have.attr', 'placeholder');
      
      // Buttons
      cy.get(selectors.createButton)
        .should('have.attr', 'aria-label')
        .or('have.accessible.name');
      
      // List items
      cy.get(selectors.requirementItem).first()
        .should('have.attr', 'role')
        .or('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      // Focus management
      cy.get(selectors.createButton).focus().should('be.focused');
      
      // Tab navigation
      cy.get(selectors.createButton).tab();
      cy.focused().should('match', selectors.searchInput);
      
      // Enter key activation
      cy.get(selectors.createButton).focus().type('{enter}');
      cy.get(selectors.createModal).should('be.visible');
      
      // Escape key to close modal
      cy.focused().type('{esc}');
      cy.get(selectors.createModal).should('not.exist');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
        const headings = Array.from($headings).map(h => parseInt(h.tagName.charAt(1)));
        
        // Check that heading levels don't skip levels
        for (let i = 1; i < headings.length; i++) {
          expect(headings[i] - headings[i-1]).to.be.lte(1);
        }
      });
    });

    it('should have sufficient color contrast', () => {
      // Test high contrast mode compatibility
      cy.get(selectors.requirementItem).first()
        .should('have.css', 'color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');
      
      // Priority badges should have good contrast
      cy.get('[data-testid="requirement-priority"]').first()
        .should('have.css', 'background-color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');
    });
  });

  describe('Performance and Data Loading', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `req-${i}`,
        title: `Requirement ${i}`,
        description: `Description for requirement ${i}`,
        priority: ['low', 'medium', 'high'][i % 3],
        status: ['draft', 'approved', 'completed'][i % 3]
      }));
      
      cy.intercept('GET', apiEndpoints.requirements, {
        statusCode: 200,
        body: largeDataset
      }).as('getLargeDataset');
      
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getLargeDataset');
      
      // Page should load without performance issues
      cy.get(selectors.requirementsList).should('be.visible');
      cy.get(selectors.requirementItem).should('have.length.at.least', 10);
    });

    it('should implement proper caching', () => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
      
      // Navigate away and back
      cy.get('[data-testid="tab-overview"]').click();
      cy.get(selectors.requirementsTab).click();
      
      // Should use cached data (no additional API call)
      cy.get('@getRequirements.all').should('have.length', 1);
    });

    it('should handle concurrent operations', () => {
      cy.visit(`/projects/${testData.project.id}`);
      cy.get(selectors.requirementsTab).click();
      cy.wait('@getRequirements');
      
      // Start multiple operations
      cy.get(selectors.createButton).click();
      cy.get(selectors.editButton).first().click();
      
      // Both modals should handle concurrent state properly
      cy.get(selectors.createModal).should('be.visible');
      cy.get('[data-testid="edit-requirement-modal"]').should('be.visible');
    });
  });
});
