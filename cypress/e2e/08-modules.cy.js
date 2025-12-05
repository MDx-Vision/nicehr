describe('Modules Management System', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    unit: {
      name: 'Test ICU Unit',
      description: 'Intensive Care Unit for testing',
      capacity: 20
    },
    modules: {
      valid: {
        name: 'Epic MyChart Training',
        description: 'Comprehensive training module for Epic MyChart system',
        type: 'training',
        duration: 120,
        difficulty: 'intermediate',
        prerequisites: 'Basic computer skills'
      },
      updated: {
        name: 'Epic MyChart Advanced Training',
        description: 'Advanced training module for Epic MyChart system with analytics',
        type: 'training',
        duration: 180,
        difficulty: 'advanced',
        prerequisites: 'Completion of basic Epic training'
      },
      minimal: {
        name: 'Quick Start Guide',
        description: 'Basic orientation module'
      },
      long: {
        name: 'A'.repeat(200),
        description: 'B'.repeat(1000),
        type: 'certification',
        duration: 480,
        difficulty: 'expert'
      }
    },
    user: {
      email: 'test@example.com',
      password: 'password123'
    }
  };

  let hospitalId, unitId;

  before(() => {
    // Setup test data
    cy.task('db:seed', { type: 'modules-test' });
  });

  beforeEach(() => {
    // Login as admin
    cy.login(testData.user.email, testData.user.password);
    
    // Create hospital and unit for testing
    cy.request('POST', '/api/hospitals', {
      name: testData.hospital.name,
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    }).then((response) => {
      hospitalId = response.body.id;
      
      return cy.request('POST', `/api/hospitals/${hospitalId}/units`, testData.unit);
    }).then((response) => {
      unitId = response.body.id;
    });
  });

  afterEach(() => {
    // Cleanup
    if (hospitalId) {
      cy.request('DELETE', `/api/hospitals/${hospitalId}`);
    }
  });

  describe('Modules Page Access and Navigation', () => {
    it('should navigate to modules page from units list', () => {
      cy.visit('/admin/hospitals');
      cy.get(`[data-testid="hospital-${hospitalId}"]`).click();
      cy.get(`[data-testid="unit-${unitId}"]`).should('be.visible');
      cy.get(`[data-testid="unit-${unitId}-modules-link"]`).click();
      
      cy.url().should('include', `/units/${unitId}/modules`);
      cy.get('[data-testid="modules-page-title"]').should('contain.text', 'Modules');
      cy.get('[data-testid="unit-breadcrumb"]').should('contain.text', testData.unit.name);
    });

    it('should display proper page structure and navigation elements', () => {
      cy.visit(`/admin/units/${unitId}/modules`);
      
      cy.get('[data-testid="modules-header"]').should('be.visible');
      cy.get('[data-testid="add-module-button"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="modules-search"]').should('be.visible');
      cy.get('[data-testid="modules-filter"]').should('be.visible');
      cy.get('[data-testid="modules-list"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
    });

    it('should show empty state when no modules exist', () => {
      cy.visit(`/admin/units/${unitId}/modules`);
      
      cy.get('[data-testid="modules-empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]').should('contain.text', 'No modules found');
      cy.get('[data-testid="empty-state-description"]').should('be.visible');
      cy.get('[data-testid="empty-state-add-button"]').should('be.visible');
    });

    it('should handle unauthorized access properly', () => {
      cy.logout();
      cy.visit(`/admin/units/${unitId}/modules`, { failOnStatusCode: false });
      
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should handle non-existent unit gracefully', () => {
      cy.visit('/admin/units/non-existent-id/modules', { failOnStatusCode: false });
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unit not found');
    });
  });

  describe('Create Module Functionality', () => {
    beforeEach(() => {
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should open create module modal with all form fields', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="create-module-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Create New Module');
      
      // Check form fields
      cy.get('[data-testid="input-module-name"]').should('be.visible').and('be.focused');
      cy.get('[data-testid="input-module-description"]').should('be.visible');
      cy.get('[data-testid="select-module-type"]').should('be.visible');
      cy.get('[data-testid="input-module-duration"]').should('be.visible');
      cy.get('[data-testid="select-module-difficulty"]').should('be.visible');
      cy.get('[data-testid="input-module-prerequisites"]').should('be.visible');
      
      // Check buttons
      cy.get('[data-testid="button-create-module"]').should('be.visible').and('be.disabled');
      cy.get('[data-testid="button-cancel-create"]').should('be.visible').and('not.be.disabled');
    });

    it('should create module with valid data successfully', () => {
      cy.intercept('POST', `/api/units/${unitId}/modules`).as('createModule');
      cy.intercept('GET', `/api/units/${unitId}/modules`).as('getModules');
      
      cy.get('[data-testid="add-module-button"]').click();
      
      // Fill form
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').type(testData.modules.valid.description);
      cy.get('[data-testid="select-module-type"]').select(testData.modules.valid.type);
      cy.get('[data-testid="input-module-duration"]').type(testData.modules.valid.duration.toString());
      cy.get('[data-testid="select-module-difficulty"]').select(testData.modules.valid.difficulty);
      cy.get('[data-testid="input-module-prerequisites"]').type(testData.modules.valid.prerequisites);
      
      // Submit form
      cy.get('[data-testid="button-create-module"]').should('not.be.disabled').click();
      
      cy.wait('@createModule').its('response.statusCode').should('eq', 201);
      cy.get('[data-testid="create-module-modal"]').should('not.exist');
      
      // Verify success message and module appears in list
      cy.get('[data-testid="success-toast"]').should('be.visible');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Module created successfully');
      
      cy.wait('@getModules');
      cy.get('[data-testid^="module-card-"]').should('have.length', 1);
      cy.get('[data-testid^="module-card-"]').should('contain.text', testData.modules.valid.name);
    });

    it('should create module with minimal required data', () => {
      cy.intercept('POST', `/api/units/${unitId}/modules`).as('createModule');
      
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').type(testData.modules.minimal.name);
      cy.get('[data-testid="input-module-description"]').type(testData.modules.minimal.description);
      
      cy.get('[data-testid="button-create-module"]').should('not.be.disabled').click();
      
      cy.wait('@createModule').its('response.statusCode').should('eq', 201);
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      // Try to submit empty form
      cy.get('[data-testid="button-create-module"]').should('be.disabled');
      
      // Test individual field validation
      cy.get('[data-testid="input-module-name"]').focus().blur();
      cy.get('[data-testid="error-module-name"]').should('be.visible');
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Module name is required');
      
      cy.get('[data-testid="input-module-description"]').focus().blur();
      cy.get('[data-testid="error-module-description"]').should('be.visible');
      cy.get('[data-testid="error-module-description"]').should('contain.text', 'Description is required');
    });

    it('should validate field length limits', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      // Test name length limit
      cy.get('[data-testid="input-module-name"]').type('a'.repeat(256));
      cy.get('[data-testid="input-module-name"]').blur();
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Module name must be less than 255 characters');
      
      // Test description length limit
      cy.get('[data-testid="input-module-description"]').clear().type('a'.repeat(2001));
      cy.get('[data-testid="input-module-description"]').blur();
      cy.get('[data-testid="error-module-description"]').should('contain.text', 'Description must be less than 2000 characters');
    });

    it('should validate numeric fields', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      // Test duration validation
      cy.get('[data-testid="input-module-duration"]').type('-10');
      cy.get('[data-testid="input-module-duration"]').blur();
      cy.get('[data-testid="error-module-duration"]').should('contain.text', 'Duration must be a positive number');
      
      cy.get('[data-testid="input-module-duration"]').clear().type('0');
      cy.get('[data-testid="input-module-duration"]').blur();
      cy.get('[data-testid="error-module-duration"]').should('contain.text', 'Duration must be greater than 0');
      
      cy.get('[data-testid="input-module-duration"]').clear().type('abc');
      cy.get('[data-testid="input-module-duration"]').blur();
      cy.get('[data-testid="error-module-duration"]').should('contain.text', 'Duration must be a valid number');
    });

    it('should prevent duplicate module names', () => {
      // Create first module
      cy.request('POST', `/api/units/${unitId}/modules`, testData.modules.valid);
      
      cy.intercept('POST', `/api/units/${unitId}/modules`, { 
        statusCode: 409, 
        body: { error: 'Module name already exists' }
      }).as('createModuleDuplicate');
      
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').type('Different description');
      cy.get('[data-testid="button-create-module"]').click();
      
      cy.wait('@createModuleDuplicate');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Module name already exists');
      cy.get('[data-testid="create-module-modal"]').should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', `/api/units/${unitId}/modules`, { 
        statusCode: 500, 
        body: { error: 'Internal server error' }
      }).as('createModuleError');
      
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').type(testData.modules.valid.description);
      cy.get('[data-testid="button-create-module"]').click();
      
      cy.wait('@createModuleError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to create module');
      cy.get('[data-testid="create-module-modal"]').should('be.visible');
    });

    it('should close modal on cancel', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').type('Test Module');
      cy.get('[data-testid="button-cancel-create"]').click();
      
      cy.get('[data-testid="create-module-modal"]').should('not.exist');
    });

    it('should close modal on escape key', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="create-module-modal"]').should('be.visible');
      cy.get('body').type('{esc}');
      
      cy.get('[data-testid="create-module-modal"]').should('not.exist');
    });

    it('should handle form submission with keyboard', () => {
      cy.intercept('POST', `/api/units/${unitId}/modules`).as('createModule');
      
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').type(testData.modules.valid.description);
      cy.get('[data-testid="input-module-description"]').type('{ctrl+enter}');
      
      cy.wait('@createModule').its('response.statusCode').should('eq', 201);
    });
  });

  describe('Read/Display Modules Functionality', () => {
    let moduleIds = [];

    beforeEach(() => {
      // Create test modules
      const modules = [
        { ...testData.modules.valid, name: 'Module A' },
        { ...testData.modules.valid, name: 'Module B', type: 'assessment' },
        { ...testData.modules.valid, name: 'Module C', difficulty: 'beginner' }
      ];

      cy.wrap(modules).each((module) => {
        cy.request('POST', `/api/units/${unitId}/modules`, module).then((response) => {
          moduleIds.push(response.body.id);
        });
      });
      
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should display all modules in list format', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules`).as('getModules');
      
      cy.wait('@getModules');
      cy.get('[data-testid^="module-card-"]').should('have.length', 3);
      
      // Check module card structure
      cy.get('[data-testid^="module-card-"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('be.visible');
        cy.get('[data-testid="module-description"]').should('be.visible');
        cy.get('[data-testid="module-type"]').should('be.visible');
        cy.get('[data-testid="module-duration"]').should('be.visible');
        cy.get('[data-testid="module-difficulty"]').should('be.visible');
        cy.get('[data-testid="module-actions"]').should('be.visible');
      });
    });

    it('should display modules in table format when toggled', () => {
      cy.get('[data-testid="view-toggle-table"]').click();
      
      cy.get('[data-testid="modules-table"]').should('be.visible');
      cy.get('[data-testid="table-header"]').should('be.visible');
      cy.get('[data-testid="table-header"]').within(() => {
        cy.get('th').should('contain.text', 'Name');
        cy.get('th').should('contain.text', 'Type');
        cy.get('th').should('contain.text', 'Duration');
        cy.get('th').should('contain.text', 'Difficulty');
        cy.get('th').should('contain.text', 'Actions');
      });
      
      cy.get('[data-testid="modules-table"] tbody tr').should('have.length', 3);
    });

    it('should show module details on click', () => {
      cy.get('[data-testid^="module-card-"]').first().click();
      
      cy.get('[data-testid="module-details-modal"]').should('be.visible');
      cy.get('[data-testid="module-details-name"]').should('be.visible');
      cy.get('[data-testid="module-details-description"]').should('be.visible');
      cy.get('[data-testid="module-details-metadata"]').should('be.visible');
      cy.get('[data-testid="module-details-prerequisites"]').should('be.visible');
    });

    it('should display correct module metadata', () => {
      cy.get('[data-testid^="module-card-"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', 'Module A');
        cy.get('[data-testid="module-type"]').should('contain.text', 'training');
        cy.get('[data-testid="module-duration"]').should('contain.text', '120 min');
        cy.get('[data-testid="module-difficulty"]').should('contain.text', 'intermediate');
      });
    });

    it('should handle loading states', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules`, { delay: 1000 }).as('getModulesDelay');
      
      cy.visit(`/admin/units/${unitId}/modules`);
      
      cy.get('[data-testid="modules-loading"]').should('be.visible');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      cy.wait('@getModulesDelay');
      cy.get('[data-testid="modules-loading"]').should('not.exist');
      cy.get('[data-testid^="module-card-"]').should('be.visible');
    });

    it('should handle API errors when loading modules', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules`, { 
        statusCode: 500, 
        body: { error: 'Internal server error' }
      }).as('getModulesError');
      
      cy.visit(`/admin/units/${unitId}/modules`);
      
      cy.wait('@getModulesError');
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load modules');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should retry loading on error', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules`, { 
        statusCode: 500, 
        body: { error: 'Internal server error' }
      }).as('getModulesError');
      
      cy.visit(`/admin/units/${unitId}/modules`);
      cy.wait('@getModulesError');
      
      cy.intercept('GET', `/api/units/${unitId}/modules`).as('getModulesRetry');
      cy.get('[data-testid="retry-button"]').click();
      
      cy.wait('@getModulesRetry');
      cy.get('[data-testid^="module-card-"]').should('be.visible');
    });
  });

  describe('Update Module Functionality', () => {
    let moduleId;

    beforeEach(() => {
      // Create a test module
      cy.request('POST', `/api/units/${unitId}/modules`, testData.modules.valid).then((response) => {
        moduleId = response.body.id;
      });
      
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should open edit modal with pre-filled data', () => {
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      cy.get('[data-testid="edit-module-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Module');
      
      // Check pre-filled values
      cy.get('[data-testid="input-module-name"]').should('have.value', testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').should('have.value', testData.modules.valid.description);
      cy.get('[data-testid="select-module-type"]').should('have.value', testData.modules.valid.type);
      cy.get('[data-testid="input-module-duration"]').should('have.value', testData.modules.valid.duration.toString());
      cy.get('[data-testid="select-module-difficulty"]').should('have.value', testData.modules.valid.difficulty);
      cy.get('[data-testid="input-module-prerequisites"]').should('have.value', testData.modules.valid.prerequisites);
    });

    it('should update module with valid data successfully', () => {
      cy.intercept('PATCH', `/api/modules/${moduleId}`).as('updateModule');
      cy.intercept('GET', `/api/units/${unitId}/modules`).as('getModules');
      
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      // Update form data
      cy.get('[data-testid="input-module-name"]').clear().type(testData.modules.updated.name);
      cy.get('[data-testid="input-module-description"]').clear().type(testData.modules.updated.description);
      cy.get('[data-testid="input-module-duration"]').clear().type(testData.modules.updated.duration.toString());
      cy.get('[data-testid="select-module-difficulty"]').select(testData.modules.updated.difficulty);
      cy.get('[data-testid="input-module-prerequisites"]').clear().type(testData.modules.updated.prerequisites);
      
      cy.get('[data-testid="button-update-module"]').click();
      
      cy.wait('@updateModule').its('response.statusCode').should('eq', 200);
      cy.get('[data-testid="edit-module-modal"]').should('not.exist');
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Module updated successfully');
      
      // Verify changes appear in list
      cy.wait('@getModules');
      cy.get(`[data-testid="module-card-${moduleId}"]`).should('contain.text', testData.modules.updated.name);
    });

    it('should validate form fields during edit', () => {
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      cy.get('[data-testid="input-module-name"]').clear();
      cy.get('[data-testid="input-module-name"]').blur();
      cy.get('[data-testid="error-module-name"]').should('be.visible');
      cy.get('[data-testid="button-update-module"]').should('be.disabled');
    });

    it('should handle update API errors', () => {
      cy.intercept('PATCH', `/api/modules/${moduleId}`, { 
        statusCode: 500, 
        body: { error: 'Update failed' }
      }).as('updateModuleError');
      
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      cy.get('[data-testid="input-module-name"]').clear().type('Updated Name');
      cy.get('[data-testid="button-update-module"]').click();
      
      cy.wait('@updateModuleError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to update module');
      cy.get('[data-testid="edit-module-modal"]').should('be.visible');
    });

    it('should cancel edit without saving changes', () => {
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      cy.get('[data-testid="input-module-name"]').clear().type('Changed Name');
      cy.get('[data-testid="button-cancel-edit"]').click();
      
      cy.get('[data-testid="edit-module-modal"]').should('not.exist');
      cy.get(`[data-testid="module-card-${moduleId}"]`).should('contain.text', testData.modules.valid.name);
    });

    it('should show unsaved changes warning', () => {
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      cy.get('[data-testid="input-module-name"]').clear().type('Changed Name');
      cy.get('[data-testid="button-cancel-edit"]').click();
      
      cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
      cy.get('[data-testid="unsaved-changes-message"]').should('contain.text', 'You have unsaved changes');
      cy.get('[data-testid="discard-changes-button"]').should('be.visible');
      cy.get('[data-testid="continue-editing-button"]').should('be.visible');
    });

    it('should handle concurrent modifications', () => {
      cy.intercept('PATCH', `/api/modules/${moduleId}`, { 
        statusCode: 409, 
        body: { error: 'Module was modified by another user' }
      }).as('updateModuleConflict');
      
      cy.get(`[data-testid="module-${moduleId}-edit"]`).click();
      
      cy.get('[data-testid="input-module-name"]').clear().type('Updated Name');
      cy.get('[data-testid="button-update-module"]').click();
      
      cy.wait('@updateModuleConflict');
      cy.get('[data-testid="conflict-dialog"]').should('be.visible');
      cy.get('[data-testid="conflict-message"]').should('contain.text', 'modified by another user');
      cy.get('[data-testid="reload-data-button"]').should('be.visible');
    });
  });

  describe('Delete Module Functionality', () => {
    let moduleId;

    beforeEach(() => {
      // Create a test module
      cy.request('POST', `/api/units/${unitId}/modules`, testData.modules.valid).then((response) => {
        moduleId = response.body.id;
      });
      
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should open delete confirmation dialog', () => {
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      
      cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-title"]').should('contain.text', 'Delete Module');
      cy.get('[data-testid="delete-confirmation-message"]').should('contain.text', 'This action cannot be undone');
      cy.get('[data-testid="delete-confirmation-module-name"]').should('contain.text', testData.modules.valid.name);
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible').and('not.be.disabled');
    });

    it('should delete module successfully', () => {
      cy.intercept('DELETE', `/api/modules/${moduleId}`).as('deleteModule');
      cy.intercept('GET', `/api/units/${unitId}/modules`).as('getModules');
      
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteModule').its('response.statusCode').should('eq', 204);
      
      cy.get('[data-testid="success-toast"]').should('be.visible');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Module deleted successfully');
      
      // Verify module is removed from list
      cy.wait('@getModules');
      cy.get(`[data-testid="module-card-${moduleId}"]`).should('not.exist');
    });

    it('should cancel delete operation', () => {
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
      cy.get(`[data-testid="module-card-${moduleId}"]`).should('exist');
    });

    it('should handle delete API errors', () => {
      cy.intercept('DELETE', `/api/modules/${moduleId}`, { 
        statusCode: 500, 
        body: { error: 'Delete failed' }
      }).as('deleteModuleError');
      
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteModuleError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to delete module');
      cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
      cy.get(`[data-testid="module-card-${moduleId}"]`).should('exist');
    });

    it('should prevent deletion of modules with dependencies', () => {
      cy.intercept('DELETE', `/api/modules/${moduleId}`, { 
        statusCode: 409, 
        body: { 
          error: 'Cannot delete module with active assignments',
          dependencies: ['3 active assignments', '2 user enrollments']
        }
      }).as('deleteModuleDependencies');
      
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteModuleDependencies');
      cy.get('[data-testid="dependencies-dialog"]').should('be.visible');
      cy.get('[data-testid="dependencies-message"]').should('contain.text', 'Cannot delete module');
      cy.get('[data-testid="dependencies-list"]').should('contain.text', '3 active assignments');
      cy.get('[data-testid="dependencies-list"]').should('contain.text', '2 user enrollments');
    });

    it('should require confirmation by typing module name', () => {
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      
      cy.get('[data-testid="delete-confirmation-input"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-input"]').should('have.attr', 'placeholder').and('contain', testData.modules.valid.name);
      cy.get('[data-testid="button-confirm-delete"]').should('be.disabled');
      
      cy.get('[data-testid="delete-confirmation-input"]').type('wrong name');
      cy.get('[data-testid="button-confirm-delete"]').should('be.disabled');
      
      cy.get('[data-testid="delete-confirmation-input"]').clear().type(testData.modules.valid.name);
      cy.get('[data-testid="button-confirm-delete"]').should('not.be.disabled');
    });

    it('should handle keyboard navigation in delete dialog', () => {
      cy.get(`[data-testid="module-${moduleId}-delete"]`).click();
      
      cy.get('[data-testid="delete-confirmation-input"]').should('be.focused');
      cy.get('[data-testid="delete-confirmation-input"]').type(testData.modules.valid.name);
      cy.get('[data-testid="delete-confirmation-input"]').type('{enter}');
      
      cy.intercept('DELETE', `/api/modules/${moduleId}`).as('deleteModule');
      cy.wait('@deleteModule');
    });
  });

  describe('Search and Filter Functionality', () => {
    let moduleIds = [];

    beforeEach(() => {
      // Create diverse test modules
      const modules = [
        { ...testData.modules.valid, name: 'Epic Training Module', type: 'training', difficulty: 'beginner' },
        { ...testData.modules.valid, name: 'Cerner Assessment', type: 'assessment', difficulty: 'intermediate' },
        { ...testData.modules.valid, name: 'Advanced Analytics Certification', type: 'certification', difficulty: 'advanced' },
        { ...testData.modules.valid, name: 'Quick Start Guide', type: 'documentation', difficulty: 'beginner' }
      ];

      cy.wrap(modules).each((module) => {
        cy.request('POST', `/api/units/${unitId}/modules`, module).then((response) => {
          moduleIds.push(response.body.id);
        });
      });
      
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should search modules by name', () => {
      cy.get('[data-testid="modules-search"]').type('Epic');
      cy.get('[data-testid="search-button"]').click();
      
      cy.get('[data-testid^="module-card-"]').should('have.length', 1);
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'Epic Training Module');
    });

    it('should search modules with debounced input', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules*`).as('searchModules');
      
      cy.get('[data-testid="modules-search"]').type('Cerner');
      
      // Wait for debounced search
      cy.wait('@searchModules');
      cy.get('[data-testid^="module-card-"]').should('have.length', 1);
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'Cerner Assessment');
    });

    it('should filter modules by type', () => {
      cy.get('[data-testid="filter-type"]').select('training');
      
      cy.get('[data-testid^="module-card-"]').should('have.length', 1);
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'Epic Training Module');
    });

    it('should filter modules by difficulty', () => {
      cy.get('[data-testid="filter-difficulty"]').select('beginner');
      
      cy.get('[data-testid^="module-card-"]').should('have.length', 2);
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'Epic Training Module');
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'Quick Start Guide');
    });

    it('should combine search and filters', () => {
      cy.get('[data-testid="modules-search"]').type('training');
      cy.get('[data-testid="filter-difficulty"]').select('beginner');
      
      cy.get('[data-testid^="module-card-"]').should('have.length', 1);
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'Epic Training Module');
    });

    it('should clear search and filters', () => {
      cy.get('[data-testid="modules-search"]').type('Epic');
      cy.get('[data-testid="filter-type"]').select('training');
      
      cy.get('[data-testid^="module-card-"]').should('have.length', 1);
      
      cy.get('[data-testid="clear-filters"]').click();
      
      cy.get('[data-testid="modules-search"]').should('have.value', '');
      cy.get('[data-testid="filter-type"]').should('have.value', '');
      cy.get('[data-testid^="module-card-"]').should('have.length', 4);
    });

    it('should show no results message for empty search', () => {
      cy.get('[data-testid="modules-search"]').type('nonexistent module');
      
      cy.get('[data-testid="no-results-message"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]').should('contain.text', 'No modules found matching your criteria');
      cy.get('[data-testid="clear-search-button"]').should('be.visible');
    });

    it('should preserve filters when navigating', () => {
      cy.get('[data-testid="modules-search"]').type('Epic');
      cy.get('[data-testid="filter-type"]').select('training');
      
      cy.get(`[data-testid="module-${moduleIds[0]}"]`).click();
      cy.get('[data-testid="module-details-modal"]').should('be.visible');
      cy.get('[data-testid="close-modal"]').click();
      
      cy.get('[data-testid="modules-search"]').should('have.value', 'Epic');
      cy.get('[data-testid="filter-type"]').should('have.value', 'training');
    });

    it('should handle special characters in search', () => {
      cy.get('[data-testid="modules-search"]').type('C++ & Advanced Analytics');
      
      cy.get('[data-testid="no-results-message"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('not.exist');
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      // Create many modules for pagination testing
      const modules = Array.from({ length: 25 }, (_, i) => ({
        name: `Module ${String(i + 1).padStart(2, '0')}`,
        description: `Description for module ${i + 1}`,
        type: ['training', 'assessment', 'certification'][i % 3],
        duration: (i + 1) * 30,
        difficulty: ['beginner', 'intermediate', 'advanced'][i % 3]
      }));

      cy.wrap(modules).each((module) => {
        cy.request('POST', `/api/units/${unitId}/modules`, module);
      });
      
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should paginate modules correctly', () => {
      cy.get('[data-testid^="module-card-"]').should('have.length', 10);
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-10 of 25');
      
      cy.get('[data-testid="next-page"]').click();
      cy.get('[data-testid^="module-card-"]').should('have.length', 10);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 11-20 of 25');
      
      cy.get('[data-testid="next-page"]').click();
      cy.get('[data-testid^="module-card-"]').should('have.length', 5);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 21-25 of 25');
    });

    it('should sort modules by name', () => {
      cy.get('[data-testid="sort-by"]').select('name');
      cy.get('[data-testid="sort-direction"]').select('asc');
      
      cy.get('[data-testid^="module-card-"]').first().should('contain.text', 'Module 01');
      cy.get('[data-testid^="module-card-"]').eq(1).should('contain.text', 'Module 02');
    });

    it('should sort modules by duration', () => {
      cy.get('[data-testid="sort-by"]').select('duration');
      cy.get('[data-testid="sort-direction"]').select('desc');
      
      cy.get('[data-testid^="module-card-"]').first().within(() => {
        cy.get('[data-testid="module-duration"]').should('contain.text', '750 min');
      });
    });

    it('should change page size', () => {
      cy.get('[data-testid="page-size-select"]').select('20');
      
      cy.get('[data-testid^="module-card-"]').should('have.length', 20);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-20 of 25');
    });

    it('should maintain sorting across pages', () => {
      cy.get('[data-testid="sort-by"]').select('name');
      cy.get('[data-testid="sort-direction"]').select('asc');
      
      cy.get('[data-testid="next-page"]').click();
      cy.get('[data-testid^="module-card-"]').first().should('contain.text', 'Module 11');
    });

    it('should handle pagination with filters', () => {
      cy.get('[data-testid="filter-type"]').select('training');
      
      // Should show only training modules (every 3rd module)
      cy.get('[data-testid^="module-card-"]').should('have.length', 8);
      cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-8 of 8');
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.request('POST', `/api/units/${unitId}/modules`, testData.modules.valid);
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="modules-header"]').should('be.visible');
      cy.get('[data-testid="add-module-button"]').should('be.visible');
      cy.get('[data-testid="modules-search"]').should('be.visible');
      
      // Should stack elements vertically
      cy.get('[data-testid="modules-controls"]').should('have.css', 'flex-direction', 'column');
      
      // Module cards should be full width
      cy.get('[data-testid^="module-card-"]').should('have.css', 'width').and('match', /100%|full/);
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="modules-grid"]').should('be.visible');
      cy.get('[data-testid^="module-card-"]').should('be.visible');
      
      // Should show 2 columns on tablet
      cy.get('[data-testid="modules-grid"]').should('have.css', 'grid-template-columns').and('contain', '2');
    });

    it('should have proper keyboard navigation', () => {
      cy.get('[data-testid="add-module-button"]').focus();
      cy.get('[data-testid="add-module-button"]').should('be.focused');
      
      cy.get('[data-testid="add-module-button"]').tab();
      cy.get('[data-testid="modules-search"]').should('be.focused');
      
      cy.get('[data-testid="modules-search"]').tab();
      cy.get('[data-testid="filter-type"]').should('be.focused');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="modules-search"]').should('have.attr', 'aria-label', 'Search modules');
      cy.get('[data-testid="add-module-button"]').should('have.attr', 'aria-label', 'Add new module');
      cy.get('[data-testid="modules-list"]').should('have.attr', 'role', 'list');
      cy.get('[data-testid^="module-card-"]').should('have.attr', 'role', 'listitem');
    });

    it('should support screen readers', () => {
      cy.get('[data-testid^="module-card-"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('have.attr', 'id');
        cy.get('[data-testid="module-description"]').should('have.attr', 'aria-describedby');
      });
      
      // Check for screen reader announcements
      cy.get('[data-testid="sr-only-count"]').should('contain.text', 'modules found');
    });

    it('should have sufficient color contrast', () => {
      cy.get('[data-testid^="module-card-"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('have.css', 'color').and('not.eq', 'rgb(255, 255, 255)');
        cy.get('[data-testid="module-description"]').should('have.css', 'color');
      });
    });

    it('should handle focus management in modals', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').should('be.focused');
      
      cy.get('body').type('{esc}');
      cy.get('[data-testid="add-module-button"]').should('be.focused');
    });
  });

  describe('Performance and Loading States', () => {
    beforeEach(() => {
      cy.visit(`/admin/units/${unitId}/modules`);
    });

    it('should show loading skeleton while fetching modules', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules`, { delay: 1000 }).as('getModulesDelay');
      
      cy.reload();
      
      cy.get('[data-testid="modules-skeleton"]').should('be.visible');
      cy.get('[data-testid="skeleton-card"]').should('have.length.at.least', 3);
      
      cy.wait('@getModulesDelay');
      cy.get('[data-testid="modules-skeleton"]').should('not.exist');
    });

    it('should handle slow API responses gracefully', () => {
      cy.intercept('POST', `/api/units/${unitId}/modules`, { delay: 3000 }).as('createModuleSlow');
      
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-module-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="input-module-description"]').type(testData.modules.valid.description);
      cy.get('[data-testid="button-create-module"]').click();
      
      cy.get('[data-testid="button-create-module"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="button-create-module"]').should('contain.text', 'Creating...');
      
      cy.wait('@createModuleSlow');
      cy.get('[data-testid="create-module-modal"]').should('not.exist');
    });

    it('should implement optimistic updates', () => {
      cy.request('POST', `/api/units/${unitId}/modules`, testData.modules.valid);
      cy.reload();
      
      cy.intercept('POST', `/api/units/${unitId}/modules`, { delay: 2000 }).as('createModuleSlow');
      
      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="input-module-name"]').type('New Module');
      cy.get('[data-testid="input-module-description"]').type('New Description');
      cy.get('[data-testid="button-create-module"]').click();
      
      // Should immediately show the new module in list (optimistic update)
      cy.get('[data-testid="create-module-modal"]').should('not.exist');
      cy.get('[data-testid^="module-card-"]').should('contain.text', 'New Module');
      
      cy.wait('@createModuleSlow');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', `/api/units/${unitId}/modules`, { forceNetworkError: true }).as('networkError');
      
      cy.reload();
      
      cy.wait('@networkError');
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="network-error-message"]').should('contain.text', 'Network connection failed');
      cy.get('[data-testid="retry-connection"]').should('be.visible');
    });

    it('should implement infinite scroll for large datasets', () => {
      // Create many modules
      const modules = Array.from({ length: 50 }, (_, i) => ({
        name: `Module ${i + 1}`,
        description: `Description ${i + 1}`
      }));

      cy.wrap(modules).each((module) => {
        cy.request('POST', `/api/units/${unitId}/modules`, module);
      });
      
      cy.reload();
      
      // Initial load
      cy.get('[data-testid^="module-card-"]').should('have.length', 20);
      
      // Scroll to bottom
      cy.get('[data-testid="modules-container"]').scrollTo('bottom');
      
      // Should load more modules
      cy.get('[data-testid^="module-card-"]').should('have.length', 40);
      
      cy.get('[data-testid="modules-container"]').scrollTo('bottom');
      cy.get('[data-testid^="module-card-"]').should('have.length', 50);
    });
  });
});
