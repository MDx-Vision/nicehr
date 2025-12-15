describe('Modules Management System', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    unit: {
      name: 'Cardiology Unit',
      description: 'Cardiac care unit for testing',
      capacity: 50
    },
    modules: {
      valid: {
        name: 'Patient Monitoring Module',
        description: 'Advanced patient monitoring system',
        type: 'monitoring',
        version: '2.1.0',
        isActive: true
      },
      update: {
        name: 'Updated Patient Monitoring Module',
        description: 'Updated advanced patient monitoring system',
        type: 'analytics',
        version: '2.2.0',
        isActive: false
      },
      invalid: {
        name: '',
        description: '',
        type: '',
        version: ''
      },
      bulk: [
        {
          name: 'EHR Integration Module',
          description: 'Electronic health records integration',
          type: 'integration',
          version: '1.0.0',
          isActive: true
        },
        {
          name: 'Pharmacy Module',
          description: 'Pharmacy management system',
          type: 'pharmacy',
          version: '3.1.2',
          isActive: true
        },
        {
          name: 'Lab Results Module',
          description: 'Laboratory results management',
          type: 'laboratory',
          version: '1.5.0',
          isActive: false
        }
      ]
    }
  };

  let createdUnitId;

  before(() => {
    // Login as admin user
    cy.login('test@example.com', 'password123');
    
    // Create a test unit first (modules belong to units)
    cy.request({
      method: 'POST',
      url: `/api/hospitals/${testData.hospital.id}/units`,
      body: testData.unit,
      headers: {
        'Authorization': 'Bearer token'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      createdUnitId = response.body.id;
    });
  });

  after(() => {
    // Cleanup: Delete created unit (which will cascade delete modules)
    if (createdUnitId) {
      cy.request({
        method: 'DELETE',
        url: `/api/units/${createdUnitId}`,
        failOnStatusCode: false
      });
    }
  });

  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.intercept('GET', `/api/units/${createdUnitId}/modules`).as('getModules');
    cy.intercept('POST', `/api/units/${createdUnitId}/modules`).as('createModule');
    cy.intercept('PATCH', '/api/modules/*').as('updateModule');
    cy.intercept('DELETE', '/api/modules/*').as('deleteModule');
  });

  describe('Modules List Page', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should display modules list page correctly', () => {
      cy.get('[data-testid="modules-page"]').should('be.visible');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Modules');
      cy.get('[data-testid="add-module-button"]').should('be.visible');
      cy.get('[data-testid="modules-list"]').should('be.visible');
    });

    it('should show empty state when no modules exist', () => {
      cy.get('[data-testid="modules-list"]').within(() => {
        cy.get('[data-testid="empty-state"]').should('be.visible');
        cy.get('[data-testid="empty-state-title"]').should('contain.text', 'No modules found');
        cy.get('[data-testid="empty-state-description"]').should('contain.text', 'Get started by adding your first module');
        cy.get('[data-testid="empty-state-add-button"]').should('be.visible');
      });
    });

    it('should have proper breadcrumb navigation', () => {
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb-hospitals"]').should('contain.text', 'Hospitals');
      cy.get('[data-testid="breadcrumb-hospital"]').should('contain.text', testData.hospital.name);
      cy.get('[data-testid="breadcrumb-units"]').should('contain.text', 'Units');
      cy.get('[data-testid="breadcrumb-unit"]').should('contain.text', testData.unit.name);
      cy.get('[data-testid="breadcrumb-modules"]').should('contain.text', 'Modules');
    });

    it('should display search and filter options', () => {
      cy.get('[data-testid="search-modules"]').should('be.visible');
      cy.get('[data-testid="filter-modules-type"]').should('be.visible');
      cy.get('[data-testid="filter-modules-status"]').should('be.visible');
      cy.get('[data-testid="sort-modules"]').should('be.visible');
    });

    it('should handle responsive layout', () => {
      cy.viewport(768, 1024);
      cy.get('[data-testid="modules-page"]').should('be.visible');
      cy.get('[data-testid="add-module-button"]').should('be.visible');
      
      cy.viewport(375, 667);
      cy.get('[data-testid="modules-page"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-trigger"]').should('be.visible');
    });
  });

  describe('Create Module', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should open create module dialog', () => {
      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="create-module-dialog"]').should('be.visible');
      cy.get('[data-testid="dialog-title"]').should('contain.text', 'Add New Module');
    });

    it('should display all form fields correctly', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="create-module-form"]').within(() => {
        cy.get('[data-testid="input-name"]').should('be.visible');
        cy.get('[data-testid="textarea-description"]').should('be.visible');
        cy.get('[data-testid="select-type"]').should('be.visible');
        cy.get('[data-testid="input-version"]').should('be.visible');
        cy.get('[data-testid="switch-active"]').should('be.visible');
        cy.get('[data-testid="button-cancel"]').should('be.visible');
        cy.get('[data-testid="button-create"]').should('be.visible');
      });
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="button-create"]').click();

      cy.get('[data-testid="error-name"]').should('contain.text', 'Module name is required');
      cy.get('[data-testid="error-type"]').should('contain.text', 'Module type is required');
      cy.get('[data-testid="error-version"]').should('contain.text', 'Version is required');
    });

    it('should validate field formats and constraints', () => {
      cy.get('[data-testid="add-module-button"]').click();

      // Test name length validation
      cy.get('[data-testid="input-name"]').type('a'.repeat(256));
      cy.get('[data-testid="button-create"]').click();
      cy.get('[data-testid="error-name"]').should('contain.text', 'Module name must be less than 255 characters');

      // Test version format validation
      cy.get('[data-testid="input-name"]').clear().type('Valid Name');
      cy.get('[data-testid="input-version"]').type('invalid-version');
      cy.get('[data-testid="button-create"]').click();
      cy.get('[data-testid="error-version"]').should('contain.text', 'Please enter a valid version format (e.g., 1.0.0)');

      // Test description length validation
      cy.get('[data-testid="textarea-description"]').type('a'.repeat(1001));
      cy.get('[data-testid="button-create"]').click();
      cy.get('[data-testid="error-description"]').should('contain.text', 'Description must be less than 1000 characters');
    });

    it('should create module successfully', () => {
      cy.get('[data-testid="add-module-button"]').click();

      cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="textarea-description"]').type(testData.modules.valid.description);
      cy.get('[data-testid="select-type"]').click();
      cy.get(`[data-testid="option-${testData.modules.valid.type}"]`).click();
      cy.get('[data-testid="input-version"]').type(testData.modules.valid.version);
      
      if (testData.modules.valid.isActive) {
        cy.get('[data-testid="switch-active"]').check();
      }

      cy.get('[data-testid="button-create"]').click();

      cy.wait('@createModule').then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
        expect(interception.request.body.name).to.eq(testData.modules.valid.name);
        expect(interception.request.body.description).to.eq(testData.modules.valid.description);
        expect(interception.request.body.type).to.eq(testData.modules.valid.type);
        expect(interception.request.body.version).to.eq(testData.modules.valid.version);
        expect(interception.request.body.isActive).to.eq(testData.modules.valid.isActive);
      });

      cy.get('[data-testid="success-message"]').should('contain.text', 'Module created successfully');
      cy.get('[data-testid="create-module-dialog"]').should('not.exist');
    });

    it('should handle create module API errors', () => {
      cy.intercept('POST', `/api/units/${createdUnitId}/modules`, {
        statusCode: 400,
        body: { error: 'Module name already exists' }
      }).as('createModuleError');

      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="select-type"]').click();
      cy.get(`[data-testid="option-${testData.modules.valid.type}"]`).click();
      cy.get('[data-testid="input-version"]').type(testData.modules.valid.version);
      cy.get('[data-testid="button-create"]').click();

      cy.wait('@createModuleError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Module name already exists');
    });

    it('should cancel module creation', () => {
      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="input-name"]').type('Test Module');
      cy.get('[data-testid="button-cancel"]').click();
      cy.get('[data-testid="create-module-dialog"]').should('not.exist');
    });

    it('should close dialog on escape key', () => {
      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="create-module-dialog"]').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="create-module-dialog"]').should('not.exist');
    });

    it('should handle form submission with Enter key', () => {
      cy.get('[data-testid="add-module-button"]').click();
      
      cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="textarea-description"]').type(testData.modules.valid.description);
      cy.get('[data-testid="select-type"]').click();
      cy.get(`[data-testid="option-${testData.modules.valid.type}"]`).click();
      cy.get('[data-testid="input-version"]').type(testData.modules.valid.version);
      cy.get('[data-testid="input-version"]').type('{enter}');

      cy.wait('@createModule');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Module created successfully');
    });
  });

  describe('Modules List with Data', () => {
    beforeEach(() => {
      // Create test modules
      testData.modules.bulk.forEach((module, index) => {
        cy.request({
          method: 'POST',
          url: `/api/units/${createdUnitId}/modules`,
          body: { ...module, unitId: createdUnitId }
        });
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should display modules in cards/table format', () => {
      cy.get('[data-testid="modules-grid"]').should('be.visible');
      cy.get('[data-testid="module-card"]').should('have.length.greaterThan', 0);

      // Check first module card content
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('be.visible');
        cy.get('[data-testid="module-description"]').should('be.visible');
        cy.get('[data-testid="module-type"]').should('be.visible');
        cy.get('[data-testid="module-version"]').should('be.visible');
        cy.get('[data-testid="module-status"]').should('be.visible');
        cy.get('[data-testid="module-actions"]').should('be.visible');
      });
    });

    it('should display correct module information', () => {
      const testModule = testData.modules.bulk[0];
      
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', testModule.name);
        cy.get('[data-testid="module-description"]').should('contain.text', testModule.description);
        cy.get('[data-testid="module-type"]').should('contain.text', testModule.type);
        cy.get('[data-testid="module-version"]').should('contain.text', testModule.version);
        
        if (testModule.isActive) {
          cy.get('[data-testid="status-active"]').should('be.visible');
        } else {
          cy.get('[data-testid="status-inactive"]').should('be.visible');
        }
      });
    });

    it('should search modules by name', () => {
      const searchTerm = 'EHR';
      cy.get('[data-testid="search-modules"]').type(searchTerm);
      cy.get('[data-testid="search-modules"]').type('{enter}');

      cy.get('[data-testid="module-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="module-name"]').should('contain.text', searchTerm);
      });
    });

    it('should filter modules by type', () => {
      const filterType = 'integration';
      cy.get('[data-testid="filter-modules-type"]').click();
      cy.get(`[data-testid="filter-option-${filterType}"]`).click();

      cy.get('[data-testid="module-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="module-type"]').should('contain.text', filterType);
      });
    });

    it('should filter modules by status', () => {
      cy.get('[data-testid="filter-modules-status"]').click();
      cy.get('[data-testid="filter-option-active"]').click();

      cy.get('[data-testid="module-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="status-active"]').should('be.visible');
      });
    });

    it('should sort modules', () => {
      cy.get('[data-testid="sort-modules"]').click();
      cy.get('[data-testid="sort-option-name-asc"]').click();

      let previousName = '';
      cy.get('[data-testid="module-card"] [data-testid="module-name"]').each(($name) => {
        const currentName = $name.text();
        if (previousName) {
          expect(currentName.localeCompare(previousName)).to.be.greaterThan(-1);
        }
        previousName = currentName;
      });
    });

    it('should clear all filters', () => {
      cy.get('[data-testid="search-modules"]').type('test search');
      cy.get('[data-testid="filter-modules-type"]').click();
      cy.get('[data-testid="filter-option-integration"]').click();

      cy.get('[data-testid="clear-filters"]').click();

      cy.get('[data-testid="search-modules"]').should('have.value', '');
      cy.get('[data-testid="filter-modules-type"]').should('contain.text', 'All Types');
    });

    it('should handle empty search results', () => {
      cy.get('[data-testid="search-modules"]').type('nonexistentmodule123');
      cy.get('[data-testid="search-modules"]').type('{enter}');

      cy.get('[data-testid="empty-search-results"]').should('be.visible');
      cy.get('[data-testid="empty-search-message"]').should('contain.text', 'No modules found matching your search');
    });
  });

  describe('View Module Details', () => {
    let createdModuleId;

    beforeEach(() => {
      // Create a test module
      cy.request({
        method: 'POST',
        url: `/api/units/${createdUnitId}/modules`,
        body: { ...testData.modules.valid, unitId: createdUnitId }
      }).then((response) => {
        createdModuleId = response.body.id;
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should open module details modal', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="view-module-button"]').click();
      });

      cy.get('[data-testid="module-details-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Module Details');
    });

    it('should display complete module information', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="view-module-button"]').click();
      });

      cy.get('[data-testid="module-details-modal"]').within(() => {
        cy.get('[data-testid="detail-name"]').should('contain.text', testData.modules.valid.name);
        cy.get('[data-testid="detail-description"]').should('contain.text', testData.modules.valid.description);
        cy.get('[data-testid="detail-type"]').should('contain.text', testData.modules.valid.type);
        cy.get('[data-testid="detail-version"]').should('contain.text', testData.modules.valid.version);
        cy.get('[data-testid="detail-status"]').should('be.visible');
        cy.get('[data-testid="detail-created-at"]').should('be.visible');
        cy.get('[data-testid="detail-updated-at"]').should('be.visible');
      });
    });

    it('should close details modal', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="view-module-button"]').click();
      });

      cy.get('[data-testid="close-modal-button"]').click();
      cy.get('[data-testid="module-details-modal"]').should('not.exist');
    });

    it('should close details modal with escape key', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="view-module-button"]').click();
      });

      cy.get('body').type('{esc}');
      cy.get('[data-testid="module-details-modal"]').should('not.exist');
    });
  });

  describe('Edit Module', () => {
    let createdModuleId;

    beforeEach(() => {
      // Create a test module
      cy.request({
        method: 'POST',
        url: `/api/units/${createdUnitId}/modules`,
        body: { ...testData.modules.valid, unitId: createdUnitId }
      }).then((response) => {
        createdModuleId = response.body.id;
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should open edit module dialog', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="edit-module-dialog"]').should('be.visible');
      cy.get('[data-testid="dialog-title"]').should('contain.text', 'Edit Module');
    });

    it('should pre-populate form with existing data', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="edit-module-form"]').within(() => {
        cy.get('[data-testid="input-name"]').should('have.value', testData.modules.valid.name);
        cy.get('[data-testid="textarea-description"]').should('have.value', testData.modules.valid.description);
        cy.get('[data-testid="input-version"]').should('have.value', testData.modules.valid.version);
        
        if (testData.modules.valid.isActive) {
          cy.get('[data-testid="switch-active"]').should('be.checked');
        }
      });
    });

    it('should validate required fields during edit', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="input-version"]').clear();
      cy.get('[data-testid="button-save"]').click();

      cy.get('[data-testid="error-name"]').should('contain.text', 'Module name is required');
      cy.get('[data-testid="error-version"]').should('contain.text', 'Version is required');
    });

    it('should update module successfully', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="input-name"]').clear().type(testData.modules.update.name);
      cy.get('[data-testid="textarea-description"]').clear().type(testData.modules.update.description);
      cy.get('[data-testid="select-type"]').click();
      cy.get(`[data-testid="option-${testData.modules.update.type}"]`).click();
      cy.get('[data-testid="input-version"]').clear().type(testData.modules.update.version);
      
      if (!testData.modules.update.isActive) {
        cy.get('[data-testid="switch-active"]').uncheck();
      }

      cy.get('[data-testid="button-save"]').click();

      cy.wait('@updateModule').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.request.body.name).to.eq(testData.modules.update.name);
        expect(interception.request.body.description).to.eq(testData.modules.update.description);
      });

      cy.get('[data-testid="success-message"]').should('contain.text', 'Module updated successfully');
      cy.get('[data-testid="edit-module-dialog"]').should('not.exist');
    });

    it('should handle edit module API errors', () => {
      cy.intercept('PATCH', `/api/modules/${createdModuleId}`, {
        statusCode: 409,
        body: { error: 'Module name already exists in this unit' }
      }).as('updateModuleError');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="input-name"]').clear().type('Duplicate Name');
      cy.get('[data-testid="button-save"]').click();

      cy.wait('@updateModuleError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Module name already exists in this unit');
    });

    it('should cancel module edit', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="input-name"]').clear().type('Changed Name');
      cy.get('[data-testid="button-cancel"]').click();
      cy.get('[data-testid="edit-module-dialog"]').should('not.exist');

      // Verify changes were not saved
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', testData.modules.valid.name);
      });
    });

    it('should handle unsaved changes warning', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="edit-module-button"]').click();
      });

      cy.get('[data-testid="input-name"]').clear().type('Changed Name');
      cy.get('[data-testid="close-dialog-button"]').click();

      cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
      cy.get('[data-testid="discard-changes-button"]').click();
      cy.get('[data-testid="edit-module-dialog"]').should('not.exist');
    });
  });

  describe('Delete Module', () => {
    let createdModuleId;

    beforeEach(() => {
      // Create a test module
      cy.request({
        method: 'POST',
        url: `/api/units/${createdUnitId}/modules`,
        body: { ...testData.modules.valid, unitId: createdUnitId }
      }).then((response) => {
        createdModuleId = response.body.id;
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should open delete confirmation dialog', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="delete-module-button"]').click();
      });

      cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
      cy.get('[data-testid="dialog-title"]').should('contain.text', 'Delete Module');
      cy.get('[data-testid="confirmation-message"]').should('contain.text', 'Are you sure you want to delete this module?');
    });

    it('should display module name in confirmation dialog', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="delete-module-button"]').click();
      });

      cy.get('[data-testid="delete-confirmation-dialog"]').within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', testData.modules.valid.name);
      });
    });

    it('should cancel module deletion', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="delete-module-button"]').click();
      });

      cy.get('[data-testid="button-cancel"]').click();
      cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');

      // Verify module still exists
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', testData.modules.valid.name);
      });
    });

    it('should delete module successfully', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="delete-module-button"]').click();
      });

      cy.get('[data-testid="button-confirm"]').click();

      cy.wait('@deleteModule').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.get('[data-testid="success-message"]').should('contain.text', 'Module deleted successfully');
      cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
    });

    it('should handle delete module API errors', () => {
      cy.intercept('DELETE', `/api/modules/${createdModuleId}`, {
        statusCode: 409,
        body: { error: 'Cannot delete module with active dependencies' }
      }).as('deleteModuleError');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="delete-module-button"]').click();
      });

      cy.get('[data-testid="button-confirm"]').click();

      cy.wait('@deleteModuleError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Cannot delete module with active dependencies');
    });

    it('should require confirmation text for critical modules', () => {
      // Simulate a critical/system module
      cy.intercept('GET', `/api/units/${createdUnitId}/modules`, {
        statusCode: 200,
        body: [{
          ...testData.modules.valid,
          id: createdModuleId,
          isCritical: true
        }]
      }).as('getCriticalModule');

      cy.reload();
      cy.wait('@getCriticalModule');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="delete-module-button"]').click();
      });

      cy.get('[data-testid="delete-confirmation-dialog"]').within(() => {
        cy.get('[data-testid="confirmation-input"]').should('be.visible');
        cy.get('[data-testid="confirmation-text"]').should('contain.text', 'DELETE');
        cy.get('[data-testid="button-confirm"]').should('be.disabled');
      });

      cy.get('[data-testid="confirmation-input"]').type('DELETE');
      cy.get('[data-testid="button-confirm"]').should('not.be.disabled');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      // Create multiple test modules
      testData.modules.bulk.forEach((module) => {
        cy.request({
          method: 'POST',
          url: `/api/units/${createdUnitId}/modules`,
          body: { ...module, unitId: createdUnitId }
        });
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should select multiple modules', () => {
      cy.get('[data-testid="select-all-checkbox"]').should('be.visible');
      
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-checkbox"]').check();
      });

      cy.get('[data-testid="module-card"]').eq(1).within(() => {
        cy.get('[data-testid="module-checkbox"]').check();
      });

      cy.get('[data-testid="selected-count"]').should('contain.text', '2 modules selected');
      cy.get('[data-testid="bulk-actions-bar"]').should('be.visible');
    });

    it('should select all modules', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      cy.get('[data-testid="module-checkbox"]').each(($checkbox) => {
        cy.wrap($checkbox).should('be.checked');
      });

      cy.get('[data-testid="bulk-actions-bar"]').should('be.visible');
    });

    it('should deselect all modules', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      cy.get('[data-testid="select-all-checkbox"]').uncheck();
      
      cy.get('[data-testid="module-checkbox"]').each(($checkbox) => {
        cy.wrap($checkbox).should('not.be.checked');
      });

      cy.get('[data-testid="bulk-actions-bar"]').should('not.exist');
    });

    it('should perform bulk status update', () => {
      cy.intercept('PATCH', '/api/modules/bulk-update').as('bulkUpdate');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-checkbox"]').check();
      });

      cy.get('[data-testid="module-card"]').eq(1).within(() => {
        cy.get('[data-testid="module-checkbox"]').check();
      });

      cy.get('[data-testid="bulk-actions-bar"]').within(() => {
        cy.get('[data-testid="bulk-status-update"]').click();
      });

      cy.get('[data-testid="bulk-update-dialog"]').should('be.visible');
      cy.get('[data-testid="status-toggle"]').click();
      cy.get('[data-testid="button-apply"]').click();

      cy.wait('@bulkUpdate');
      cy.get('[data-testid="success-message"]').should('contain.text', '2 modules updated successfully');
    });

    it('should perform bulk delete', () => {
      cy.intercept('DELETE', '/api/modules/bulk-delete').as('bulkDelete');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="module-checkbox"]').check();
      });

      cy.get('[data-testid="bulk-actions-bar"]').within(() => {
        cy.get('[data-testid="bulk-delete-button"]').click();
      });

      cy.get('[data-testid="bulk-delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="confirmation-message"]').should('contain.text', 'Are you sure you want to delete 1 module?');
      cy.get('[data-testid="button-confirm"]').click();

      cy.wait('@bulkDelete');
      cy.get('[data-testid="success-message"]').should('contain.text', '1 module deleted successfully');
    });
  });

  describe('Module Status Management', () => {
    let createdModuleId;

    beforeEach(() => {
      // Create a test module
      cy.request({
        method: 'POST',
        url: `/api/units/${createdUnitId}/modules`,
        body: { ...testData.modules.valid, unitId: createdUnitId }
      }).then((response) => {
        createdModuleId = response.body.id;
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should toggle module status from card', () => {
      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="status-toggle"]').should('be.visible');
        
        if (testData.modules.valid.isActive) {
          cy.get('[data-testid="status-active"]').should('be.visible');
          cy.get('[data-testid="status-toggle"]').click();
          cy.get('[data-testid="status-inactive"]').should('be.visible');
        }
      });

      cy.wait('@updateModule');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Module status updated');
    });

    it('should show status confirmation for critical modules', () => {
      // Mock critical module
      cy.intercept('GET', `/api/units/${createdUnitId}/modules`, {
        statusCode: 200,
        body: [{
          ...testData.modules.valid,
          id: createdModuleId,
          isCritical: true
        }]
      }).as('getCriticalModule');

      cy.reload();
      cy.wait('@getCriticalModule');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="status-toggle"]').click();
      });

      cy.get('[data-testid="status-change-confirmation"]').should('be.visible');
      cy.get('[data-testid="warning-message"]').should('contain.text', 'This is a critical module');
      cy.get('[data-testid="button-confirm"]').click();

      cy.wait('@updateModule');
    });

    it('should handle status update API errors', () => {
      cy.intercept('PATCH', `/api/modules/${createdModuleId}`, {
        statusCode: 409,
        body: { error: 'Module has active dependencies and cannot be deactivated' }
      }).as('statusUpdateError');

      cy.get('[data-testid="module-card"]').first().within(() => {
        cy.get('[data-testid="status-toggle"]').click();
      });

      cy.wait('@statusUpdateError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Module has active dependencies and cannot be deactivated');
    });
  });

  describe('Module Import/Export', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should show import modules button', () => {
      cy.get('[data-testid="import-modules-button"]').should('be.visible');
    });

    it('should open import dialog', () => {
      cy.get('[data-testid="import-modules-button"]').click();
      cy.get('[data-testid="import-modules-dialog"]').should('be.visible');
      cy.get('[data-testid="file-upload-area"]').should('be.visible');
      cy.get('[data-testid="upload-instructions"]').should('contain.text', 'Upload a CSV file with module data');
    });

    it('should validate import file format', () => {
      cy.get('[data-testid="import-modules-button"]').click();
      
      // Create invalid file
      const invalidContent = 'invalid,csv,content';
      const invalidFile = new File([invalidContent], 'invalid.txt', { type: 'text/plain' });
      
      cy.get('[data-testid="file-input"]').selectFile(invalidFile, { force: true });
      cy.get('[data-testid="error-message"]').should('contain.text', 'Please upload a valid CSV file');
    });

    it('should process valid import file', () => {
      cy.intercept('POST', `/api/units/${createdUnitId}/modules/import`).as('importModules');
      
      cy.get('[data-testid="import-modules-button"]').click();
      
      // Create valid CSV content
      const csvContent = 'name,description,type,version,isActive\n"Test Module","Test Description","monitoring","1.0.0",true';
      const csvFile = new File([csvContent], 'modules.csv', { type: 'text/csv' });
      
      cy.get('[data-testid="file-input"]').selectFile(csvFile, { force: true });
      cy.get('[data-testid="button-import"]').click();

      cy.wait('@importModules');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Modules imported successfully');
    });

    it('should export modules', () => {
      cy.intercept('GET', `/api/units/${createdUnitId}/modules/export`).as('exportModules');
      
      cy.get('[data-testid="export-modules-button"]').click();
      cy.get('[data-testid="export-format-csv"]').click();

      cy.wait('@exportModules');
      
      // Verify download was triggered
      cy.readFile('cypress/downloads/modules.csv').should('exist');
    });
  });

  describe('Module Analytics and Reporting', () => {
    beforeEach(() => {
      // Create test modules with analytics data
      testData.modules.bulk.forEach((module) => {
        cy.request({
          method: 'POST',
          url: `/api/units/${createdUnitId}/modules`,
          body: { ...module, unitId: createdUnitId }
        });
      });

      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules/analytics`);
    });

    it('should display module analytics dashboard', () => {
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      cy.get('[data-testid="total-modules-stat"]').should('be.visible');
      cy.get('[data-testid="active-modules-stat"]').should('be.visible');
      cy.get('[data-testid="modules-by-type-chart"]').should('be.visible');
      cy.get('[data-testid="module-status-chart"]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      cy.get('[data-testid="date-range-picker"]').click();
      cy.get('[data-testid="last-30-days"]').click();
      
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      cy.get('[data-testid="date-range-display"]').should('contain.text', 'Last 30 days');
    });

    it('should export analytics report', () => {
      cy.intercept('GET', `/api/units/${createdUnitId}/modules/analytics/export`).as('exportAnalytics');
      
      cy.get('[data-testid="export-report-button"]').click();
      cy.wait('@exportAnalytics');
      
      cy.readFile('cypress/downloads/module-analytics.pdf').should('exist');
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
      cy.wait('@getModules');
    });

    it('should be navigable with keyboard', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'add-module-button');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-modules');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-modules-type');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="add-module-button"]').should('have.attr', 'aria-label', 'Add new module');
      cy.get('[data-testid="search-modules"]').should('have.attr', 'aria-label', 'Search modules');
      cy.get('[data-testid="modules-list"]').should('have.attr', 'role', 'list');
    });

    it('should announce changes to screen readers', () => {
      cy.get('[data-testid="search-modules"]').type('test');
      cy.get('[data-testid="search-results-announcement"]')
        .should('have.attr', 'aria-live', 'polite')
        .and('not.be.empty');
    });

    it('should support high contrast mode', () => {
      cy.get('body').should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
      
      // Simulate high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast');
      cy.get('[data-testid="module-card"]').should('have.css', 'border-width', '2px');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${createdUnitId}/modules`);
    });

    it('should handle API timeouts gracefully', () => {
      cy.intercept('GET', `/api/units/${createdUnitId}/modules`, { 
        delay: 30000 
      }).as('slowModules');

      cy.reload();
      cy.get('[data-testid="loading-indicator"]').should('be.visible');
      cy.get('[data-testid="timeout-message"]', { timeout: 35000 }).should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', `/api/units/${createdUnitId}/modules`, { 
        forceNetworkError: true 
      }).as('networkError');

      cy.reload();
      cy.get('[data-testid="network-error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle server errors', () => {
      cy.intercept('GET', `/api/units/${createdUnitId}/modules`, { 
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');

      cy.reload();
      cy.get('[data-testid="server-error-message"]').should('be.visible');
      cy.get('[data-testid="contact-support-link"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      let requestCount = 0;
      cy.intercept('GET', `/api/units/${createdUnitId}/modules`, (req) => {
        requestCount++;
        if (requestCount === 1) {
          req.reply({ statusCode: 500 });
        } else {
          req.reply({ statusCode: 200, body: [] });
        }
      }).as('retryRequest');

      cy.reload();
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@retryRequest');
      cy.get('[data-testid="modules-list"]').should('be.visible');
    });

    it('should handle concurrent modifications', () => {
      // Simulate another user modifying the same module
      cy.intercept('PATCH', '/api/modules/*', { 
        statusCode: 409,
        body: { error: 'Module was modified by another user' }
      }).as('concurrentModification');

      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
      cy.get('[data-testid="select-type"]').click();
      cy.get(`[data-testid="option-${testData.modules.valid.type}"]`).click();
      cy.get('[data-testid="input-version"]').type(testData.modules.valid.version);
      cy.get('[data-testid="button-create"]').click();

      cy.get('[data-testid="conflict-resolution-dialog"]').should('be.visible');
      cy.get('[data-testid="reload-and-retry-button"]').should('be.visible');
    });
  });
});
