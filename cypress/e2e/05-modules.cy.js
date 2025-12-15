describe('Modules Management', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    unit: {
      id: 'ci-test-unit',
      name: 'CI Test Unit'
    },
    modules: {
      valid: {
        name: 'Emergency Department Module',
        description: 'Critical care emergency department module',
        type: 'clinical',
        capacity: 50,
        location: 'Building A, Floor 1'
      },
      update: {
        name: 'Updated Emergency Department Module',
        description: 'Updated critical care emergency department module',
        type: 'administrative',
        capacity: 75,
        location: 'Building B, Floor 2'
      },
      minimal: {
        name: 'Minimal Module'
      },
      invalid: {
        name: '',
        description: 'A'.repeat(1001), // Too long
        capacity: -5
      }
    },
    user: {
      email: 'test@example.com',
      password: 'password123'
    }
  };

  beforeEach(() => {
    // Clear state and login
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');

    // Set up API intercepts
    cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`).as('getModules');
    cy.intercept('POST', `/api/units/${testData.unit.id}/modules`).as('createModule');
    cy.intercept('PATCH', '/api/modules/*').as('updateModule');
    cy.intercept('DELETE', '/api/modules/*').as('deleteModule');
    cy.intercept('GET', '/api/hospitals*').as('getHospitals');
    cy.intercept('GET', `/api/hospitals/*/units*`).as('getUnits');
  });

  describe('Modules List Page', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
    });

    it('should display the modules list page correctly', () => {
      // Page header
      cy.get('[data-testid="modules-page-header"]').should('be.visible');
      cy.get('[data-testid="modules-page-title"]').should('contain.text', 'Modules');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      
      // Navigation breadcrumb
      cy.get('[data-testid="breadcrumb-hospitals"]').should('contain.text', 'Hospitals');
      cy.get('[data-testid="breadcrumb-hospital"]').should('contain.text', testData.hospital.name);
      cy.get('[data-testid="breadcrumb-units"]').should('contain.text', 'Units');
      cy.get('[data-testid="breadcrumb-unit"]').should('contain.text', testData.unit.name);
      cy.get('[data-testid="breadcrumb-modules"]').should('contain.text', 'Modules');

      // Action buttons
      cy.get('[data-testid="button-create-module"]').should('be.visible').and('contain.text', 'Add Module');
      
      // Table or grid view
      cy.get('[data-testid="modules-list"]').should('be.visible');
    });

    it('should display empty state when no modules exist', () => {
      // Mock empty response
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
        statusCode: 200,
        body: { modules: [], total: 0 }
      }).as('getEmptyModules');

      cy.reload();
      cy.wait('@getEmptyModules');

      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]').should('contain.text', 'No modules found');
      cy.get('[data-testid="empty-state-description"]').should('be.visible');
      cy.get('[data-testid="button-create-first-module"]').should('be.visible');
    });

    it('should display modules list when modules exist', () => {
      const mockModules = [
        { id: 1, name: 'Module 1', description: 'Description 1', type: 'clinical', capacity: 30 },
        { id: 2, name: 'Module 2', description: 'Description 2', type: 'administrative', capacity: 45 }
      ];

      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
        statusCode: 200,
        body: { modules: mockModules, total: 2 }
      }).as('getModulesWithData');

      cy.reload();
      cy.wait('@getModulesWithData');

      // Table headers
      cy.get('[data-testid="modules-table-header-name"]').should('contain.text', 'Name');
      cy.get('[data-testid="modules-table-header-description"]').should('contain.text', 'Description');
      cy.get('[data-testid="modules-table-header-type"]').should('contain.text', 'Type');
      cy.get('[data-testid="modules-table-header-capacity"]').should('contain.text', 'Capacity');
      cy.get('[data-testid="modules-table-header-actions"]').should('contain.text', 'Actions');

      // Table rows
      cy.get('[data-testid="module-row-1"]').should('be.visible');
      cy.get('[data-testid="module-row-2"]').should('be.visible');

      // Module data
      cy.get('[data-testid="module-1-name"]').should('contain.text', 'Module 1');
      cy.get('[data-testid="module-1-description"]').should('contain.text', 'Description 1');
      cy.get('[data-testid="module-1-type"]').should('contain.text', 'clinical');
      cy.get('[data-testid="module-1-capacity"]').should('contain.text', '30');

      // Action buttons
      cy.get('[data-testid="module-1-actions"]').should('be.visible');
      cy.get('[data-testid="button-edit-module-1"]').should('be.visible');
      cy.get('[data-testid="button-delete-module-1"]').should('be.visible');
    });

    it('should handle search functionality', () => {
      cy.get('[data-testid="modules-search-input"]').should('be.visible');
      
      const searchTerm = 'Emergency';
      cy.get('[data-testid="modules-search-input"]').type(searchTerm);
      
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*search=${searchTerm}*`).as('searchModules');
      cy.get('[data-testid="button-search-modules"]').click();
      cy.wait('@searchModules');

      cy.url().should('include', `search=${searchTerm}`);
    });

    it('should handle filter functionality', () => {
      // Type filter
      cy.get('[data-testid="filter-module-type"]').should('be.visible');
      cy.get('[data-testid="filter-module-type"]').click();
      cy.get('[data-testid="filter-option-clinical"]').click();

      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*type=clinical*`).as('filterByClinical');
      cy.wait('@filterByClinical');

      // Capacity filter
      cy.get('[data-testid="filter-capacity-min"]').type('20');
      cy.get('[data-testid="filter-capacity-max"]').type('60');
      cy.get('[data-testid="button-apply-filters"]').click();

      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*capacityMin=20&capacityMax=60*`).as('filterByCapacity');
      cy.wait('@filterByCapacity');

      // Clear filters
      cy.get('[data-testid="button-clear-filters"]').click();
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules`).as('clearFilters');
      cy.wait('@clearFilters');
    });

    it('should handle pagination', () => {
      const mockModules = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Module ${i + 1}`,
        description: `Description ${i + 1}`,
        type: i % 2 === 0 ? 'clinical' : 'administrative',
        capacity: 25 + i
      }));

      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
        statusCode: 200,
        body: { modules: mockModules.slice(0, 10), total: 15, page: 1, limit: 10 }
      }).as('getModulesPage1');

      cy.reload();
      cy.wait('@getModulesPage1');

      // Pagination controls
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', '1-10 of 15');
      cy.get('[data-testid="button-next-page"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="button-prev-page"]').should('be.disabled');

      // Go to next page
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*page=2*`, {
        statusCode: 200,
        body: { modules: mockModules.slice(10, 15), total: 15, page: 2, limit: 10 }
      }).as('getModulesPage2');

      cy.get('[data-testid="button-next-page"]').click();
      cy.wait('@getModulesPage2');
      cy.get('[data-testid="pagination-info"]').should('contain.text', '11-15 of 15');
    });

    it('should handle sorting', () => {
      // Sort by name
      cy.get('[data-testid="sort-header-name"]').click();
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*sort=name&order=asc*`).as('sortByNameAsc');
      cy.wait('@sortByNameAsc');

      cy.get('[data-testid="sort-header-name"]').should('have.class', 'sorted-asc');

      // Sort by name descending
      cy.get('[data-testid="sort-header-name"]').click();
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*sort=name&order=desc*`).as('sortByNameDesc');
      cy.wait('@sortByNameDesc');

      cy.get('[data-testid="sort-header-name"]').should('have.class', 'sorted-desc');

      // Sort by capacity
      cy.get('[data-testid="sort-header-capacity"]').click();
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*sort=capacity&order=asc*`).as('sortByCapacity');
      cy.wait('@sortByCapacity');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getModulesError');

      cy.reload();
      cy.wait('@getModulesError');

      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load modules');
      cy.get('[data-testid="button-retry"]').should('be.visible');

      // Test retry functionality
      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
        statusCode: 200,
        body: { modules: [], total: 0 }
      }).as('getModulesRetry');

      cy.get('[data-testid="button-retry"]').click();
      cy.wait('@getModulesRetry');
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });

  describe('Create Module', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
      cy.get('[data-testid="button-create-module"]').click();
    });

    it('should display the create module form correctly', () => {
      cy.get('[data-testid="create-module-form"]').should('be.visible');
      cy.get('[data-testid="form-title"]').should('contain.text', 'Create Module');

      // Form fields
      cy.get('[data-testid="input-module-name"]').should('be.visible');
      cy.get('[data-testid="input-module-description"]').should('be.visible');
      cy.get('[data-testid="select-module-type"]').should('be.visible');
      cy.get('[data-testid="input-module-capacity"]').should('be.visible');
      cy.get('[data-testid="input-module-location"]').should('be.visible');

      // Form labels
      cy.get('label[for="module-name"]').should('contain.text', 'Name');
      cy.get('label[for="module-description"]').should('contain.text', 'Description');
      cy.get('label[for="module-type"]').should('contain.text', 'Type');
      cy.get('label[for="module-capacity"]').should('contain.text', 'Capacity');
      cy.get('label[for="module-location"]').should('contain.text', 'Location');

      // Action buttons
      cy.get('[data-testid="button-save-module"]').should('be.visible').and('be.disabled');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit without required fields
      cy.get('[data-testid="button-save-module"]').should('be.disabled');

      // Name is required
      cy.get('[data-testid="input-module-name"]').focus().blur();
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Name is required');

      // Fill name to enable save button
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="button-save-module"]').should('not.be.disabled');
      cy.get('[data-testid="error-module-name"]').should('not.exist');
    });

    it('should validate field formats and constraints', () => {
      // Name validation - minimum length
      cy.get('[data-testid="input-module-name"]').type('A');
      cy.get('[data-testid="input-module-name"]').blur();
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Name must be at least 3 characters');

      // Name validation - maximum length
      cy.get('[data-testid="input-module-name"]').clear().type('A'.repeat(101));
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Name must be less than 100 characters');

      // Description validation - maximum length
      cy.get('[data-testid="input-module-description"]').type('A'.repeat(1001));
      cy.get('[data-testid="input-module-description"]').blur();
      cy.get('[data-testid="error-module-description"]').should('contain.text', 'Description must be less than 1000 characters');

      // Capacity validation - must be positive
      cy.get('[data-testid="input-module-capacity"]').type('-5');
      cy.get('[data-testid="input-module-capacity"]').blur();
      cy.get('[data-testid="error-module-capacity"]').should('contain.text', 'Capacity must be a positive number');

      // Capacity validation - must be a number
      cy.get('[data-testid="input-module-capacity"]').clear().type('abc');
      cy.get('[data-testid="error-module-capacity"]').should('contain.text', 'Capacity must be a valid number');
    });

    it('should validate module type selection', () => {
      cy.get('[data-testid="select-module-type"]').click();
      
      // Check available options
      cy.get('[data-testid="option-clinical"]').should('be.visible');
      cy.get('[data-testid="option-administrative"]').should('be.visible');
      cy.get('[data-testid="option-support"]').should('be.visible');
      cy.get('[data-testid="option-research"]').should('be.visible');

      // Select an option
      cy.get('[data-testid="option-clinical"]').click();
      cy.get('[data-testid="select-module-type"]').should('contain.text', 'Clinical');
    });

    it('should create module successfully with valid data', () => {
      // Fill form with valid data
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').type(testData.modules.valid.description);
      
      cy.get('[data-testid="select-module-type"]').click();
      cy.get('[data-testid="option-clinical"]').click();
      
      cy.get('[data-testid="input-module-capacity"]').type(testData.modules.valid.capacity.toString());
      cy.get('[data-testid="input-module-location"]').type(testData.modules.valid.location);

      // Submit form
      cy.get('[data-testid="button-save-module"]').click();
      cy.wait('@createModule').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.modules.valid.name,
          description: testData.modules.valid.description,
          type: 'clinical',
          capacity: testData.modules.valid.capacity,
          location: testData.modules.valid.location
        });
      });

      // Should redirect to modules list
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.get('[data-testid="success-message"]').should('contain.text', 'Module created successfully');
    });

    it('should create module with minimal data', () => {
      cy.get('[data-testid="input-module-name"]').type(testData.modules.minimal.name);
      
      cy.get('[data-testid="button-save-module"]').click();
      cy.wait('@createModule');

      cy.url().should('include', `/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.get('[data-testid="success-message"]').should('contain.text', 'Module created successfully');
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', `/api/units/${testData.unit.id}/modules`, {
        statusCode: 400,
        body: { error: 'Module name already exists' }
      }).as('createModuleError');

      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="button-save-module"]').click();
      
      cy.wait('@createModuleError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Module name already exists');
    });

    it('should handle network errors', () => {
      cy.intercept('POST', `/api/units/${testData.unit.id}/modules`, {
        forceNetworkError: true
      }).as('createModuleNetworkError');

      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="button-save-module"]').click();
      
      cy.wait('@createModuleNetworkError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Network error occurred');
    });

    it('should cancel creation and return to list', () => {
      // Fill some data
      cy.get('[data-testid="input-module-name"]').type('Test Module');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should confirm if there are unsaved changes
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-dialog-title"]').should('contain.text', 'Discard changes?');
      cy.get('[data-testid="button-confirm-discard"]').click();
      
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
    });

    it('should handle keyboard navigation', () => {
      // Tab through form fields
      cy.get('[data-testid="input-module-name"]').should('be.focused');
      
      cy.get('[data-testid="input-module-name"]').tab();
      cy.get('[data-testid="input-module-description"]').should('be.focused');
      
      cy.get('[data-testid="input-module-description"]').tab();
      cy.get('[data-testid="select-module-type"]').should('be.focused');
      
      cy.get('[data-testid="select-module-type"]').tab();
      cy.get('[data-testid="input-module-capacity"]').should('be.focused');
      
      cy.get('[data-testid="input-module-capacity"]').tab();
      cy.get('[data-testid="input-module-location"]').should('be.focused');

      // Test form submission with Enter key
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-name"]').type('{enter}');
      // Should not submit if form is invalid
    });

    it('should show loading state during submission', () => {
      cy.intercept('POST', `/api/units/${testData.unit.id}/modules`, {
        delay: 2000,
        statusCode: 201,
        body: { id: 1, ...testData.modules.valid }
      }).as('createModuleDelay');

      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="button-save-module"]').click();

      // Should show loading state
      cy.get('[data-testid="button-save-module"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.disabled');

      cy.wait('@createModuleDelay');
      
      // Loading state should be cleared
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });
  });

  describe('Edit Module', () => {
    const moduleId = 1;
    const mockModule = {
      id: moduleId,
      ...testData.modules.valid
    };

    beforeEach(() => {
      // Mock getting existing module
      cy.intercept('GET', `/api/modules/${moduleId}`, {
        statusCode: 200,
        body: mockModule
      }).as('getModule');

      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
      
      // Click edit button for first module
      cy.get('[data-testid="button-edit-module-1"]').click();
      cy.wait('@getModule');
    });

    it('should display the edit module form with existing data', () => {
      cy.get('[data-testid="edit-module-form"]').should('be.visible');
      cy.get('[data-testid="form-title"]').should('contain.text', 'Edit Module');

      // Form should be pre-populated
      cy.get('[data-testid="input-module-name"]').should('have.value', mockModule.name);
      cy.get('[data-testid="input-module-description"]').should('have.value', mockModule.description);
      cy.get('[data-testid="select-module-type"]').should('contain.text', mockModule.type);
      cy.get('[data-testid="input-module-capacity"]').should('have.value', mockModule.capacity.toString());
      cy.get('[data-testid="input-module-location"]').should('have.value', mockModule.location);

      // Buttons should be enabled
      cy.get('[data-testid="button-save-module"]').should('not.be.disabled');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should update module successfully', () => {
      // Update fields
      cy.get('[data-testid="input-module-name"]').clear().type(testData.modules.update.name);
      cy.get('[data-testid="input-module-description"]').clear().type(testData.modules.update.description);
      
      cy.get('[data-testid="select-module-type"]').click();
      cy.get('[data-testid="option-administrative"]').click();
      
      cy.get('[data-testid="input-module-capacity"]').clear().type(testData.modules.update.capacity.toString());
      cy.get('[data-testid="input-module-location"]').clear().type(testData.modules.update.location);

      // Submit form
      cy.get('[data-testid="button-save-module"]').click();
      cy.wait('@updateModule').then((interception) => {
        expect(interception.request.body).to.deep.include(testData.modules.update);
      });

      // Should redirect to modules list
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.get('[data-testid="success-message"]').should('contain.text', 'Module updated successfully');
    });

    it('should validate fields on update', () => {
      // Clear required field
      cy.get('[data-testid="input-module-name"]').clear();
      cy.get('[data-testid="input-module-name"]').blur();
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Name is required');
      cy.get('[data-testid="button-save-module"]').should('be.disabled');
    });

    it('should handle update errors', () => {
      cy.intercept('PATCH', `/api/modules/${moduleId}`, {
        statusCode: 409,
        body: { error: 'Module name conflicts with existing module' }
      }).as('updateModuleError');

      cy.get('[data-testid="input-module-name"]').clear().type('Conflicting Name');
      cy.get('[data-testid="button-save-module"]').click();
      
      cy.wait('@updateModuleError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Module name conflicts with existing module');
    });

    it('should detect and warn about unsaved changes', () => {
      // Make changes
      cy.get('[data-testid="input-module-name"]').clear().type('Changed Name');
      
      // Try to navigate away
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-dialog-message"]').should('contain.text', 'You have unsaved changes');
      
      // Stay on page
      cy.get('[data-testid="button-stay"]').click();
      cy.get('[data-testid="edit-module-form"]').should('be.visible');
      
      // Try again and discard changes
      cy.get('[data-testid="button-cancel"]').click();
      cy.get('[data-testid="button-discard-changes"]').click();
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
    });
  });

  describe('Delete Module', () => {
    const moduleId = 1;

    beforeEach(() => {
      const mockModules = [
        { id: 1, name: 'Test Module 1', description: 'Description 1', type: 'clinical' },
        { id: 2, name: 'Test Module 2', description: 'Description 2', type: 'administrative' }
      ];

      cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
        statusCode: 200,
        body: { modules: mockModules, total: 2 }
      }).as('getModulesWithData');

      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModulesWithData');
    });

    it('should show confirmation dialog when deleting module', () => {
      cy.get('[data-testid="button-delete-module-1"]').click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
      cy.get('[data-testid="delete-dialog-title"]').should('contain.text', 'Delete Module');
      cy.get('[data-testid="delete-dialog-message"]').should('contain.text', 'Are you sure you want to delete "Test Module 1"?');
      cy.get('[data-testid="delete-dialog-warning"]').should('contain.text', 'This action cannot be undone');
      
      // Dialog buttons
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible').and('contain.text', 'Delete');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="button-delete-module-1"]').click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
      
      // Module should still exist
      cy.get('[data-testid="module-row-1"]').should('be.visible');
    });

    it('should delete module successfully', () => {
      cy.intercept('DELETE', `/api/modules/${moduleId}`, {
        statusCode: 204
      }).as('deleteModuleSuccess');

      cy.get('[data-testid="button-delete-module-1"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteModuleSuccess');
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain.text', 'Module deleted successfully');
      
      // Module should be removed from list
      cy.get('[data-testid="module-row-1"]').should('not.exist');
    });

    it('should handle delete errors', () => {
      cy.intercept('DELETE', `/api/modules/${moduleId}`, {
        statusCode: 409,
        body: { error: 'Cannot delete module with active assignments' }
      }).as('deleteModuleError');

      cy.get('[data-testid="button-delete-module-1"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteModuleError');
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('contain.text', 'Cannot delete module with active assignments');
      
      // Module should still exist
      cy.get('[data-testid="module-row-1"]').should('be.visible');
    });

    it('should show loading state during deletion', () => {
      cy.intercept('DELETE', `/api/modules/${moduleId}`, {
        delay: 1000,
        statusCode: 204
      }).as('deleteModuleDelay');

      cy.get('[data-testid="button-delete-module-1"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      // Should show loading state
      cy.get('[data-testid="button-confirm-delete"]').should('be.disabled');
      cy.get('[data-testid="delete-loading-spinner"]').should('be.visible');
      
      cy.wait('@deleteModuleDelay');
    });

    it('should handle bulk delete operations', () => {
      // Select multiple modules
      cy.get('[data-testid="checkbox-select-module-1"]').click();
      cy.get('[data-testid="checkbox-select-module-2"]').click();
      
      // Bulk delete button should appear
      cy.get('[data-testid="button-bulk-delete"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="bulk-actions-info"]').should('contain.text', '2 modules selected');
      
      cy.get('[data-testid="button-bulk-delete"]').click();
      
      // Bulk delete confirmation
      cy.get('[data-testid="bulk-delete-dialog"]').should('be.visible');
      cy.get('[data-testid="bulk-delete-message"]').should('contain.text', 'Delete 2 selected modules?');
      
      cy.intercept('DELETE', '/api/modules/bulk', {
        statusCode: 200,
        body: { deleted: 2 }
      }).as('bulkDeleteModules');
      
      cy.get('[data-testid="button-confirm-bulk-delete"]').click();
      cy.wait('@bulkDeleteModules');
      
      cy.get('[data-testid="success-message"]').should('contain.text', '2 modules deleted successfully');
    });
  });

  describe('Module Details View', () => {
    const moduleId = 1;
    const mockModule = {
      id: moduleId,
      name: 'Detailed Test Module',
      description: 'A comprehensive module for testing',
      type: 'clinical',
      capacity: 50,
      location: 'Building A, Floor 2',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      stats: {
        activeAssignments: 15,
        totalCapacity: 50,
        utilizationRate: 0.3
      }
    };

    beforeEach(() => {
      cy.intercept('GET', `/api/modules/${moduleId}`, {
        statusCode: 200,
        body: mockModule
      }).as('getModuleDetails');

      // Navigate to module details
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules/${moduleId}`);
      cy.wait('@getModuleDetails');
    });

    it('should display module details correctly', () => {
      // Header information
      cy.get('[data-testid="module-details-header"]').should('be.visible');
      cy.get('[data-testid="module-name"]').should('contain.text', mockModule.name);
      cy.get('[data-testid="module-type-badge"]').should('contain.text', mockModule.type);
      
      // Basic information
      cy.get('[data-testid="module-description"]').should('contain.text', mockModule.description);
      cy.get('[data-testid="module-capacity"]').should('contain.text', mockModule.capacity);
      cy.get('[data-testid="module-location"]').should('contain.text', mockModule.location);
      
      // Timestamps
      cy.get('[data-testid="module-created-at"]').should('be.visible');
      cy.get('[data-testid="module-updated-at"]').should('be.visible');
      
      // Statistics
      cy.get('[data-testid="stat-active-assignments"]').should('contain.text', '15');
      cy.get('[data-testid="stat-utilization-rate"]').should('contain.text', '30%');
      
      // Action buttons
      cy.get('[data-testid="button-edit-module"]').should('be.visible');
      cy.get('[data-testid="button-delete-module"]').should('be.visible');
    });

    it('should navigate to edit mode from details view', () => {
      cy.get('[data-testid="button-edit-module"]').click();
      cy.url().should('include', `/modules/${moduleId}/edit`);
    });

    it('should handle module not found', () => {
      const nonExistentId = 999;
      cy.intercept('GET', `/api/modules/${nonExistentId}`, {
        statusCode: 404,
        body: { error: 'Module not found' }
      }).as('getModuleNotFound');

      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules/${nonExistentId}`);
      cy.wait('@getModuleNotFound');

      cy.get('[data-testid="not-found-message"]').should('contain.text', 'Module not found');
      cy.get('[data-testid="button-back-to-modules"]').should('be.visible');
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
    });

    it('should work correctly on mobile devices', () => {
      cy.viewport('iphone-6');
      
      // Mobile-specific elements should be visible
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="modules-mobile-list"]').should('be.visible');
      
      // Desktop table should be hidden
      cy.get('[data-testid="modules-desktop-table"]').should('not.be.visible');
      
      // Create button should be accessible
      cy.get('[data-testid="mobile-create-button"]').should('be.visible');
    });

    it('should work correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // Table should adapt to tablet layout
      cy.get('[data-testid="modules-table"]').should('be.visible');
      
      // Some columns might be hidden on tablet
      cy.get('[data-testid="modules-table-header-description"]').should('not.be.visible');
      
      // Action buttons should be accessible
      cy.get('[data-testid="tablet-actions-menu"]').should('be.visible');
    });

    it('should work correctly on desktop', () => {
      cy.viewport('macbook-15');
      
      // Full table should be visible
      cy.get('[data-testid="modules-desktop-table"]').should('be.visible');
      cy.get('[data-testid="modules-table-header-description"]').should('be.visible');
      
      // All action buttons should be visible
      cy.get('[data-testid="button-edit-module-1"]').should('be.visible');
      cy.get('[data-testid="button-delete-module-1"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
    });

    it('should have proper ARIA labels and roles', () => {
      // Main content area
      cy.get('[role="main"]').should('exist');
      
      // Table accessibility
      cy.get('[data-testid="modules-table"]').should('have.attr', 'role', 'table');
      cy.get('[data-testid="modules-table"] thead').should('have.attr', 'role', 'rowgroup');
      cy.get('[data-testid="modules-table"] tbody').should('have.attr', 'role', 'rowgroup');
      
      // Button accessibility
      cy.get('[data-testid="button-create-module"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="button-edit-module-1"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="button-delete-module-1"]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.get('[data-testid="modules-search-input"]').should('be.focused');
      
      cy.focused().tab();
      cy.get('[data-testid="button-create-module"]').should('be.focused');
      
      // Enter key should activate buttons
      cy.get('[data-testid="button-create-module"]').type('{enter}');
      cy.url().should('include', '/create');
    });

    it('should announce screen reader messages', () => {
      // Status messages should have proper ARIA live regions
      cy.get('[data-testid="status-message"]').should('have.attr', 'aria-live', 'polite');
      cy.get('[data-testid="error-message"]').should('have.attr', 'aria-live', 'assertive');
    });
  });

  describe('Integration with Parent Resources', () => {
    it('should validate that unit exists before showing modules', () => {
      const invalidUnitId = 'invalid-unit';
      
      cy.intercept('GET', `/api/units/${invalidUnitId}/modules*`, {
        statusCode: 404,
        body: { error: 'Unit not found' }
      }).as('getModulesUnitNotFound');

      cy.visit(`/hospitals/${testData.hospital.id}/units/${invalidUnitId}/modules`);
      cy.wait('@getModulesUnitNotFound');

      cy.get('[data-testid="error-message"]').should('contain.text', 'Unit not found');
      cy.get('[data-testid="button-back-to-units"]').should('be.visible');
    });

    it('should maintain proper breadcrumb navigation', () => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      
      // Test breadcrumb navigation
      cy.get('[data-testid="breadcrumb-hospitals"]').click();
      cy.url().should('include', '/hospitals');
      
      cy.go('back');
      cy.get('[data-testid="breadcrumb-hospital"]').click();
      cy.url().should('include', `/hospitals/${testData.hospital.id}`);
      
      cy.go('back');
      cy.get('[data-testid="breadcrumb-units"]').click();
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
    });

    it('should handle hospital context switching', () => {
      const otherHospitalId = 'other-hospital';
      const otherUnitId = 'other-unit';
      
      // Switch to different hospital/unit context
      cy.visit(`/hospitals/${otherHospitalId}/units/${otherUnitId}/modules`);
      
      cy.intercept('GET', `/api/units/${otherUnitId}/modules*`).as('getOtherModules');
      cy.wait('@getOtherModules');
      
      // Breadcrumbs should update
      cy.get('[data-testid="breadcrumb-hospital"]').should('not.contain.text', testData.hospital.name);
      cy.get('[data-testid="breadcrumb-unit"]').should('not.contain.text', testData.unit.name);
    });
  });
});
