describe('Units Management System', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    unit: {
      name: 'Emergency Department',
      description: 'Main emergency department unit',
      code: 'ED001',
      capacity: 50,
      status: 'active'
    },
    updatedUnit: {
      name: 'Emergency Department - Updated',
      description: 'Updated emergency department unit',
      code: 'ED001-UPD',
      capacity: 75,
      status: 'inactive'
    },
    module: {
      name: 'Patient Management',
      description: 'Core patient management module',
      type: 'core',
      isRequired: true
    },
    invalidData: {
      emptyName: '',
      longName: 'A'.repeat(256),
      invalidCapacity: -1,
      invalidCode: 'INVALID CODE WITH SPACES AND SPECIAL CHARS!@#'
    }
  };

  let createdUnitId;
  let createdModuleId;

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });

  afterEach(() => {
    // Cleanup created resources
    if (createdModuleId) {
      cy.request({
        method: 'DELETE',
        url: `/api/modules/${createdModuleId}`,
        failOnStatusCode: false
      });
    }
    if (createdUnitId) {
      cy.request({
        method: 'DELETE',
        url: `/api/units/${createdUnitId}`,
        failOnStatusCode: false
      });
    }
  });

  describe('Units List Page', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
    });

    it('should display units list page correctly', () => {
      cy.get('[data-testid="page-title"]').should('contain.text', 'Units');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]').should('contain.text', testData.hospital.name);
      cy.get('[data-testid="units-container"]').should('be.visible');
    });

    it('should show create unit button for authorized users', () => {
      cy.get('[data-testid="button-create-unit"]').should('be.visible');
      cy.get('[data-testid="button-create-unit"]').should('contain.text', 'Add Unit');
      cy.get('[data-testid="button-create-unit"]').should('not.be.disabled');
    });

    it('should display empty state when no units exist', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { body: [] }).as('getEmptyUnits');
      cy.reload();
      cy.wait('@getEmptyUnits');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]').should('contain.text', 'No units found');
      cy.get('[data-testid="empty-state-description"]').should('be.visible');
      cy.get('[data-testid="button-create-unit"]').should('be.visible');
    });

    it('should display units grid when units exist', () => {
      const mockUnits = [
        { id: '1', name: 'ICU', description: 'Intensive Care Unit', code: 'ICU001', capacity: 20, status: 'active' },
        { id: '2', name: 'ER', description: 'Emergency Room', code: 'ER001', capacity: 30, status: 'active' }
      ];
      
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { body: mockUnits }).as('getUnits');
      cy.reload();
      cy.wait('@getUnits');

      cy.get('[data-testid="units-grid"]').should('be.visible');
      cy.get('[data-testid="unit-card"]').should('have.length', 2);
      
      // Check first unit card
      cy.get('[data-testid="unit-card"]').first().within(() => {
        cy.get('[data-testid="unit-name"]').should('contain.text', 'ICU');
        cy.get('[data-testid="unit-description"]').should('contain.text', 'Intensive Care Unit');
        cy.get('[data-testid="unit-code"]').should('contain.text', 'ICU001');
        cy.get('[data-testid="unit-capacity"]').should('contain.text', '20');
        cy.get('[data-testid="unit-status"]').should('contain.text', 'Active');
        cy.get('[data-testid="button-view-unit"]').should('be.visible');
        cy.get('[data-testid="button-edit-unit"]').should('be.visible');
        cy.get('[data-testid="button-delete-unit"]').should('be.visible');
      });
    });

    it('should handle search functionality', () => {
      cy.get('[data-testid="search-units"]').should('be.visible');
      
      const searchTerm = 'Emergency';
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units?search=${searchTerm}*`, { 
        body: [{ id: '1', name: 'Emergency Department', description: 'ED', code: 'ED001', capacity: 25, status: 'active' }] 
      }).as('searchUnits');
      
      cy.get('[data-testid="search-units"]').type(searchTerm);
      cy.wait('@searchUnits');
      
      cy.get('[data-testid="unit-card"]').should('have.length', 1);
      cy.get('[data-testid="unit-name"]').should('contain.text', 'Emergency Department');
    });

    it('should handle filter by status', () => {
      cy.get('[data-testid="filter-status"]').should('be.visible');
      
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units?status=active`, { 
        body: [{ id: '1', name: 'Active Unit', description: 'Active', code: 'AU001', capacity: 15, status: 'active' }] 
      }).as('filterUnits');
      
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-active"]').click();
      cy.wait('@filterUnits');
      
      cy.get('[data-testid="unit-card"]').should('have.length', 1);
      cy.get('[data-testid="unit-status"]').should('contain.text', 'Active');
    });

    it('should handle pagination when there are many units', () => {
      const mockUnits = Array.from({ length: 25 }, (_, i) => ({
        id: `unit-${i}`,
        name: `Unit ${i + 1}`,
        description: `Description ${i + 1}`,
        code: `UNIT${String(i + 1).padStart(3, '0')}`,
        capacity: 10 + i,
        status: i % 2 === 0 ? 'active' : 'inactive'
      }));

      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units?page=1&limit=20`, { 
        body: mockUnits.slice(0, 20),
        headers: { 'x-total-count': '25', 'x-total-pages': '2' }
      }).as('getUnitsPage1');
      
      cy.reload();
      cy.wait('@getUnitsPage1');

      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', '1-20 of 25');
      cy.get('[data-testid="button-next-page"]').should('be.visible');
      
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units?page=2&limit=20`, { 
        body: mockUnits.slice(20),
        headers: { 'x-total-count': '25', 'x-total-pages': '2' }
      }).as('getUnitsPage2');
      
      cy.get('[data-testid="button-next-page"]').click();
      cy.wait('@getUnitsPage2');
      
      cy.get('[data-testid="unit-card"]').should('have.length', 5);
      cy.get('[data-testid="pagination-info"]').should('contain.text', '21-25 of 25');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { statusCode: 500 }).as('getUnitsError');
      cy.reload();
      cy.wait('@getUnitsError');

      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load units');
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should refresh data when retry button is clicked', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { statusCode: 500 }).as('getUnitsError');
      cy.reload();
      cy.wait('@getUnitsError');

      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { body: [] }).as('getUnitsRetry');
      cy.get('[data-testid="button-retry"]').click();
      cy.wait('@getUnitsRetry');

      cy.get('[data-testid="error-message"]').should('not.exist');
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });
  });

  describe('Create Unit Flow', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.get('[data-testid="button-create-unit"]').click();
    });

    it('should display create unit form correctly', () => {
      cy.url().should('include', '/units/new');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Create Unit');
      cy.get('[data-testid="unit-form"]').should('be.visible');
      
      // Check all form fields
      cy.get('[data-testid="input-name"]').should('be.visible');
      cy.get('[data-testid="input-description"]').should('be.visible');
      cy.get('[data-testid="input-code"]').should('be.visible');
      cy.get('[data-testid="input-capacity"]').should('be.visible');
      cy.get('[data-testid="select-status"]').should('be.visible');
      
      // Check form buttons
      cy.get('[data-testid="button-save"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="button-save"]').click();
      
      cy.get('[data-testid="error-name"]').should('be.visible');
      cy.get('[data-testid="error-name"]').should('contain.text', 'Name is required');
      cy.get('[data-testid="error-code"]').should('be.visible');
      cy.get('[data-testid="error-code"]').should('contain.text', 'Code is required');
      cy.get('[data-testid="error-capacity"]').should('be.visible');
      cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity is required');
    });

    it('should validate field formats and constraints', () => {
      // Test name length validation
      cy.get('[data-testid="input-name"]').type(testData.invalidData.longName);
      cy.get('[data-testid="input-name"]').blur();
      cy.get('[data-testid="error-name"]').should('contain.text', 'Name must be less than 255 characters');

      // Test capacity validation
      cy.get('[data-testid="input-capacity"]').type(testData.invalidData.invalidCapacity);
      cy.get('[data-testid="input-capacity"]').blur();
      cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity must be a positive number');

      // Test code format validation
      cy.get('[data-testid="input-code"]').type(testData.invalidData.invalidCode);
      cy.get('[data-testid="input-code"]').blur();
      cy.get('[data-testid="error-code"]').should('contain.text', 'Code must contain only letters, numbers, and hyphens');
    });

    it('should successfully create a new unit with valid data', () => {
      const newUnit = { ...testData.unit, id: 'new-unit-id' };
      
      cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
        statusCode: 201,
        body: newUnit
      }).as('createUnit');

      // Fill form with valid data
      cy.get('[data-testid="input-name"]').type(testData.unit.name);
      cy.get('[data-testid="input-description"]').type(testData.unit.description);
      cy.get('[data-testid="input-code"]').type(testData.unit.code);
      cy.get('[data-testid="input-capacity"]').type(testData.unit.capacity.toString());
      cy.get('[data-testid="select-status"]').click();
      cy.get('[data-testid="option-active"]').click();

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createUnit');

      // Should redirect to units list
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
      cy.get('[data-testid="success-toast"]').should('be.visible');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Unit created successfully');

      createdUnitId = 'new-unit-id';
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
        statusCode: 400,
        body: { message: 'Unit code already exists' }
      }).as('createUnitError');

      cy.get('[data-testid="input-name"]').type(testData.unit.name);
      cy.get('[data-testid="input-code"]').type('EXISTING_CODE');
      cy.get('[data-testid="input-capacity"]').type('50');

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createUnitError');

      cy.get('[data-testid="error-toast"]').should('be.visible');
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Unit code already exists');
      cy.url().should('include', '/units/new'); // Should stay on form
    });

    it('should handle cancel action correctly', () => {
      // Fill some data first
      cy.get('[data-testid="input-name"]').type('Some Unit Name');
      
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should redirect back to units list
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
      cy.url().should('not.include', '/new');
    });

    it('should show unsaved changes warning', () => {
      cy.get('[data-testid="input-name"]').type('Some changes');
      
      // Try to navigate away
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false).as('confirmDialog');
      });
      
      cy.get('[data-testid="breadcrumb-hospitals"]').click();
      cy.get('@confirmDialog').should('have.been.called');
      cy.url().should('include', '/units/new'); // Should stay on form
    });

    it('should auto-generate code suggestion based on name', () => {
      cy.get('[data-testid="input-name"]').type('Emergency Department');
      cy.get('[data-testid="input-name"]').blur();
      
      cy.get('[data-testid="input-code"]').should('have.value', 'ED');
      
      // Should allow manual override
      cy.get('[data-testid="input-code"]').clear().type('CUSTOM_CODE');
      cy.get('[data-testid="input-code"]').should('have.value', 'CUSTOM_CODE');
    });
  });

  describe('Unit Details and Edit Flow', () => {
    let unitId = 'test-unit-id';

    beforeEach(() => {
      const mockUnit = {
        id: unitId,
        ...testData.unit,
        hospitalId: testData.hospital.id,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      cy.intercept('GET', `/api/units/${unitId}`, { body: mockUnit }).as('getUnit');
      cy.visit(`/hospitals/${testData.hospital.id}/units/${unitId}`);
    });

    it('should display unit details page correctly', () => {
      cy.wait('@getUnit');
      
      cy.get('[data-testid="page-title"]').should('contain.text', testData.unit.name);
      cy.get('[data-testid="unit-details"]').should('be.visible');
      
      // Check unit information
      cy.get('[data-testid="unit-name"]').should('contain.text', testData.unit.name);
      cy.get('[data-testid="unit-description"]').should('contain.text', testData.unit.description);
      cy.get('[data-testid="unit-code"]').should('contain.text', testData.unit.code);
      cy.get('[data-testid="unit-capacity"]').should('contain.text', testData.unit.capacity);
      cy.get('[data-testid="unit-status"]').should('contain.text', 'Active');
      
      // Check action buttons
      cy.get('[data-testid="button-edit-unit"]').should('be.visible');
      cy.get('[data-testid="button-delete-unit"]').should('be.visible');
      cy.get('[data-testid="button-back"]').should('be.visible');
    });

    it('should navigate to edit mode when edit button is clicked', () => {
      cy.wait('@getUnit');
      
      cy.get('[data-testid="button-edit-unit"]').click();
      cy.url().should('include', `/units/${unitId}/edit`);
    });

    it('should display edit form with pre-filled data', () => {
      cy.wait('@getUnit');
      cy.visit(`/hospitals/${testData.hospital.id}/units/${unitId}/edit`);

      cy.get('[data-testid="page-title"]').should('contain.text', 'Edit Unit');
      cy.get('[data-testid="unit-form"]').should('be.visible');
      
      // Check pre-filled values
      cy.get('[data-testid="input-name"]').should('have.value', testData.unit.name);
      cy.get('[data-testid="input-description"]').should('have.value', testData.unit.description);
      cy.get('[data-testid="input-code"]').should('have.value', testData.unit.code);
      cy.get('[data-testid="input-capacity"]').should('have.value', testData.unit.capacity.toString());
    });

    it('should successfully update unit with valid changes', () => {
      cy.wait('@getUnit');
      cy.visit(`/hospitals/${testData.hospital.id}/units/${unitId}/edit`);

      const updatedUnit = { id: unitId, ...testData.updatedUnit };
      cy.intercept('PATCH', `/api/units/${unitId}`, {
        statusCode: 200,
        body: updatedUnit
      }).as('updateUnit');

      // Update form fields
      cy.get('[data-testid="input-name"]').clear().type(testData.updatedUnit.name);
      cy.get('[data-testid="input-description"]').clear().type(testData.updatedUnit.description);
      cy.get('[data-testid="input-code"]').clear().type(testData.updatedUnit.code);
      cy.get('[data-testid="input-capacity"]').clear().type(testData.updatedUnit.capacity.toString());
      cy.get('[data-testid="select-status"]').click();
      cy.get('[data-testid="option-inactive"]').click();

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@updateUnit');

      // Should redirect to unit details
      cy.url().should('include', `/units/${unitId}`);
      cy.url().should('not.include', '/edit');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Unit updated successfully');
    });

    it('should handle validation errors during update', () => {
      cy.wait('@getUnit');
      cy.visit(`/hospitals/${testData.hospital.id}/units/${unitId}/edit`);

      cy.intercept('PATCH', `/api/units/${unitId}`, {
        statusCode: 400,
        body: { message: 'Validation failed', errors: { name: 'Name is required' } }
      }).as('updateUnitError');

      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-save"]').click();
      cy.wait('@updateUnitError');

      cy.get('[data-testid="error-name"]').should('contain.text', 'Name is required');
      cy.url().should('include', '/edit'); // Should stay on edit form
    });

    it('should handle 404 error for non-existent unit', () => {
      cy.intercept('GET', '/api/units/non-existent', { statusCode: 404 }).as('getUnitNotFound');
      cy.visit(`/hospitals/${testData.hospital.id}/units/non-existent`);
      cy.wait('@getUnitNotFound');

      cy.get('[data-testid="not-found"]').should('be.visible');
      cy.get('[data-testid="not-found-title"]').should('contain.text', 'Unit not found');
      cy.get('[data-testid="button-back-to-units"]').should('be.visible');
    });

    it('should navigate back to units list correctly', () => {
      cy.wait('@getUnit');
      
      cy.get('[data-testid="button-back"]').click();
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
      cy.url().should('not.include', unitId);
    });
  });

  describe('Delete Unit Flow', () => {
    let unitId = 'test-unit-to-delete';

    beforeEach(() => {
      const mockUnit = {
        id: unitId,
        name: 'Unit to Delete',
        description: 'This unit will be deleted',
        code: 'DEL001',
        capacity: 25,
        status: 'active',
        hospitalId: testData.hospital.id
      };

      cy.intercept('GET', `/api/units/${unitId}`, { body: mockUnit }).as('getUnit');
      cy.visit(`/hospitals/${testData.hospital.id}/units/${unitId}`);
    });

    it('should show delete confirmation dialog', () => {
      cy.wait('@getUnit');
      
      cy.get('[data-testid="button-delete-unit"]').click();
      
      cy.get('[data-testid="delete-dialog"]').should('be.visible');
      cy.get('[data-testid="delete-dialog-title"]').should('contain.text', 'Delete Unit');
      cy.get('[data-testid="delete-dialog-message"]').should('contain.text', 'Are you sure you want to delete');
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
    });

    it('should cancel delete when cancel button is clicked', () => {
      cy.wait('@getUnit');
      
      cy.get('[data-testid="button-delete-unit"]').click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      cy.get('[data-testid="delete-dialog"]').should('not.exist');
      cy.url().should('include', unitId); // Should stay on unit details page
    });

    it('should successfully delete unit when confirmed', () => {
      cy.wait('@getUnit');
      
      cy.intercept('DELETE', `/api/units/${unitId}`, { statusCode: 204 }).as('deleteUnit');
      
      cy.get('[data-testid="button-delete-unit"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteUnit');

      // Should redirect to units list
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
      cy.url().should('not.include', unitId);
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Unit deleted successfully');
    });

    it('should handle delete error gracefully', () => {
      cy.wait('@getUnit');
      
      cy.intercept('DELETE', `/api/units/${unitId}`, {
        statusCode: 400,
        body: { message: 'Cannot delete unit with active modules' }
      }).as('deleteUnitError');
      
      cy.get('[data-testid="button-delete-unit"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteUnitError');

      cy.get('[data-testid="delete-dialog"]').should('not.exist');
      cy.get('[data-testid="error-toast"]').should('contain.text', 'Cannot delete unit with active modules');
      cy.url().should('include', unitId); // Should stay on unit details page
    });

    it('should show warning when unit has associated modules', () => {
      cy.wait('@getUnit');
      
      const mockModules = [
        { id: 'mod1', name: 'Module 1', type: 'core' },
        { id: 'mod2', name: 'Module 2', type: 'optional' }
      ];
      
      cy.intercept('GET', `/api/units/${unitId}/modules`, { body: mockModules }).as('getModules');
      
      cy.get('[data-testid="button-delete-unit"]').click();
      cy.wait('@getModules');
      
      cy.get('[data-testid="delete-dialog"]').within(() => {
        cy.get('[data-testid="warning-message"]').should('be.visible');
        cy.get('[data-testid="warning-message"]').should('contain.text', 'This unit has 2 associated modules');
        cy.get('[data-testid="associated-modules-list"]').should('be.visible');
        cy.get('[data-testid="module-item"]').should('have.length', 2);
      });
    });
  });

  describe('Unit Modules Management', () => {
    let unitId = 'test-unit-with-modules';

    beforeEach(() => {
      const mockUnit = {
        id: unitId,
        name: 'Unit with Modules',
        description: 'This unit has modules',
        code: 'UWM001',
        capacity: 30,
        status: 'active',
        hospitalId: testData.hospital.id
      };

      cy.intercept('GET', `/api/units/${unitId}`, { body: mockUnit }).as('getUnit');
      cy.intercept('GET', `/api/units/${unitId}/modules`, { body: [] }).as('getModules');
      
      cy.visit(`/hospitals/${testData.hospital.id}/units/${unitId}`);
    });

    it('should display modules section in unit details', () => {
      cy.wait(['@getUnit', '@getModules']);
      
      cy.get('[data-testid="modules-section"]').should('be.visible');
      cy.get('[data-testid="modules-title"]').should('contain.text', 'Modules');
      cy.get('[data-testid="button-add-module"]').should('be.visible');
    });

    it('should show empty state when no modules exist', () => {
      cy.wait(['@getUnit', '@getModules']);
      
      cy.get('[data-testid="modules-empty-state"]').should('be.visible');
      cy.get('[data-testid="modules-empty-state"]').should('contain.text', 'No modules configured');
      cy.get('[data-testid="button-add-module"]').should('be.visible');
    });

    it('should display modules list when modules exist', () => {
      const mockModules = [
        { 
          id: 'mod1', 
          name: 'Patient Management', 
          description: 'Core patient management module',
          type: 'core', 
          isRequired: true,
          status: 'active'
        },
        { 
          id: 'mod2', 
          name: 'Inventory Tracking', 
          description: 'Optional inventory module',
          type: 'optional', 
          isRequired: false,
          status: 'inactive'
        }
      ];
      
      cy.intercept('GET', `/api/units/${unitId}/modules`, { body: mockModules }).as('getModulesWithData');
      cy.reload();
      cy.wait(['@getUnit', '@getModulesWithData']);

      cy.get('[data-testid="modules-list"]').should('be.visible');
      cy.get('[data-testid="module-item"]').should('have.length', 2);

      // Check first module
      cy.get('[data-testid="module-item"]').first().within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', 'Patient Management');
        cy.get('[data-testid="module-description"]').should('contain.text', 'Core patient management module');
        cy.get('[data-testid="module-type"]').should('contain.text', 'Core');
        cy.get('[data-testid="module-required-badge"]').should('be.visible');
        cy.get('[data-testid="module-status"]').should('contain.text', 'Active');
        cy.get('[data-testid="button-edit-module"]').should('be.visible');
        cy.get('[data-testid="button-delete-module"]').should('be.visible');
      });

      // Check second module
      cy.get('[data-testid="module-item"]').last().within(() => {
        cy.get('[data-testid="module-name"]').should('contain.text', 'Inventory Tracking');
        cy.get('[data-testid="module-type"]').should('contain.text', 'Optional');
        cy.get('[data-testid="module-required-badge"]').should('not.exist');
        cy.get('[data-testid="module-status"]').should('contain.text', 'Inactive');
      });
    });

    it('should open add module dialog', () => {
      cy.wait(['@getUnit', '@getModules']);
      
      cy.get('[data-testid="button-add-module"]').click();
      
      cy.get('[data-testid="add-module-dialog"]').should('be.visible');
      cy.get('[data-testid="module-form"]').should('be.visible');
      cy.get('[data-testid="input-module-name"]').should('be.visible');
      cy.get('[data-testid="input-module-description"]').should('be.visible');
      cy.get('[data-testid="select-module-type"]').should('be.visible');
      cy.get('[data-testid="checkbox-is-required"]').should('be.visible');
      cy.get('[data-testid="button-save-module"]').should('be.visible');
      cy.get('[data-testid="button-cancel-module"]').should('be.visible');
    });

    it('should validate module form fields', () => {
      cy.wait(['@getUnit', '@getModules']);
      cy.get('[data-testid="button-add-module"]').click();
      
      cy.get('[data-testid="button-save-module"]').click();
      
      cy.get('[data-testid="error-module-name"]').should('contain.text', 'Module name is required');
      cy.get('[data-testid="error-module-type"]').should('contain.text', 'Module type is required');
    });

    it('should successfully create a new module', () => {
      const newModule = {
        id: 'new-module-id',
        name: testData.module.name,
        description: testData.module.description,
        type: testData.module.type,
        isRequired: testData.module.isRequired,
        status: 'active',
        unitId: unitId
      };

      cy.intercept('POST', `/api/units/${unitId}/modules`, {
        statusCode: 201,
        body: newModule
      }).as('createModule');

      cy.wait(['@getUnit', '@getModules']);
      cy.get('[data-testid="button-add-module"]').click();

      // Fill module form
      cy.get('[data-testid="input-module-name"]').type(testData.module.name);
      cy.get('[data-testid="input-module-description"]').type(testData.module.description);
      cy.get('[data-testid="select-module-type"]').click();
      cy.get('[data-testid="option-core"]').click();
      cy.get('[data-testid="checkbox-is-required"]').check();

      cy.get('[data-testid="button-save-module"]').click();
      cy.wait('@createModule');

      cy.get('[data-testid="add-module-dialog"]').should('not.exist');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Module added successfully');

      createdModuleId = 'new-module-id';
    });

    it('should handle module creation errors', () => {
      cy.intercept('POST', `/api/units/${unitId}/modules`, {
        statusCode: 400,
        body: { message: 'Module name already exists in this unit' }
      }).as('createModuleError');

      cy.wait(['@getUnit', '@getModules']);
      cy.get('[data-testid="button-add-module"]').click();

      cy.get('[data-testid="input-module-name"]').type('Existing Module');
      cy.get('[data-testid="select-module-type"]').click();
      cy.get('[data-testid="option-core"]').click();

      cy.get('[data-testid="button-save-module"]').click();
      cy.wait('@createModuleError');

      cy.get('[data-testid="error-toast"]').should('contain.text', 'Module name already exists in this unit');
      cy.get('[data-testid="add-module-dialog"]').should('be.visible'); // Should stay open
    });

    it('should edit existing module', () => {
      const existingModule = {
        id: 'existing-module',
        name: 'Existing Module',
        description: 'Existing description',
        type: 'optional',
        isRequired: false,
        status: 'active'
      };

      const updatedModule = {
        ...existingModule,
        name: 'Updated Module Name',
        description: 'Updated description',
        type: 'core',
        isRequired: true
      };

      cy.intercept('GET', `/api/units/${unitId}/modules`, { body: [existingModule] }).as('getModulesWithExisting');
      cy.intercept('PATCH', `/api/modules/${existingModule.id}`, {
        statusCode: 200,
        body: updatedModule
      }).as('updateModule');

      cy.reload();
      cy.wait(['@getUnit', '@getModulesWithExisting']);

      cy.get('[data-testid="button-edit-module"]').click();

      cy.get('[data-testid="edit-module-dialog"]').should('be.visible');
      
      // Check pre-filled values
      cy.get('[data-testid="input-module-name"]').should('have.value', existingModule.name);
      cy.get('[data-testid="input-module-description"]').should('have.value', existingModule.description);

      // Update values
      cy.get('[data-testid="input-module-name"]').clear().type(updatedModule.name);
      cy.get('[data-testid="input-module-description"]').clear().type(updatedModule.description);
      cy.get('[data-testid="select-module-type"]').click();
      cy.get('[data-testid="option-core"]').click();
      cy.get('[data-testid="checkbox-is-required"]').check();

      cy.get('[data-testid="button-save-module"]').click();
      cy.wait('@updateModule');

      cy.get('[data-testid="edit-module-dialog"]').should('not.exist');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Module updated successfully');
    });

    it('should delete module with confirmation', () => {
      const moduleToDelete = {
        id: 'module-to-delete',
        name: 'Module to Delete',
        description: 'This will be deleted',
        type: 'optional',
        isRequired: false,
        status: 'active'
      };

      cy.intercept('GET', `/api/units/${unitId}/modules`, { body: [moduleToDelete] }).as('getModulesWithDelete');
      cy.intercept('DELETE', `/api/modules/${moduleToDelete.id}`, { statusCode: 204 }).as('deleteModule');

      cy.reload();
      cy.wait(['@getUnit', '@getModulesWithDelete']);

      cy.get('[data-testid="button-delete-module"]').click();

      cy.get('[data-testid="delete-module-dialog"]').should('be.visible');
      cy.get('[data-testid="delete-module-message"]').should('contain.text', 'Are you sure you want to delete');
      cy.get('[data-testid="button-confirm-delete-module"]').should('be.visible');
      cy.get('[data-testid="button-cancel-delete-module"]').should('be.visible');

      cy.get('[data-testid="button-confirm-delete-module"]').click();
      cy.wait('@deleteModule');

      cy.get('[data-testid="delete-module-dialog"]').should('not.exist');
      cy.get('[data-testid="success-toast"]').should('contain.text', 'Module deleted successfully');
    });

    it('should prevent deletion of required modules', () => {
      const requiredModule = {
        id: 'required-module',
        name: 'Required Module',
        description: 'This is required',
        type: 'core',
        isRequired: true,
        status: 'active'
      };

      cy.intercept('GET', `/api/units/${unitId}/modules`, { body: [requiredModule] }).as('getModulesWithRequired');

      cy.reload();
      cy.wait(['@getUnit', '@getModulesWithRequired']);

      cy.get('[data-testid="button-delete-module"]').should('be.disabled');
      
      // Hover should show tooltip
      cy.get('[data-testid="button-delete-module"]').trigger('mouseover');
      cy.get('[data-testid="tooltip"]').should('contain.text', 'Cannot delete required modules');
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="units-container"]').should('be.visible');
      cy.get('[data-testid="button-create-unit"]').should('be.visible');
      
      // Mobile-specific elements
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      cy.get('[data-testid="mobile-search-toggle"]').should('be.visible');
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="units-container"]').should('be.visible');
      cy.get('[data-testid="search-units"]').should('be.visible');
      cy.get('[data-testid="filter-status"]').should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-units');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-status');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'button-create-unit');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="search-units"]').should('have.attr', 'aria-label', 'Search units');
      cy.get('[data-testid="filter-status"]').should('have.attr', 'aria-label', 'Filter by status');
      cy.get('[data-testid="button-create-unit"]').should('have.attr', 'aria-label', 'Create new unit');
      
      // Check for proper heading hierarchy
      cy.get('h1').should('contain.text', 'Units');
      cy.get('[data-testid="units-grid"]').should('have.attr', 'role', 'grid');
    });

    it('should support screen reader navigation', () => {
      const mockUnits = [
        { id: '1', name: 'ICU', description: 'Intensive Care', code: 'ICU001', capacity: 20, status: 'active' }
      ];
      
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { body: mockUnits }).as('getUnits');
      cy.reload();
      cy.wait('@getUnits');

      cy.get('[data-testid="unit-card"]').should('have.attr', 'role', 'article');
      cy.get('[data-testid="unit-name"]').should('have.attr', 'role', 'heading');
      cy.get('[data-testid="unit-card"]').should('have.attr', 'aria-labelledby');
    });

    it('should have proper focus management in dialogs', () => {
      cy.get('[data-testid="button-create-unit"]').click();
      
      // First focusable element should be focused
      cy.focused().should('have.attr', 'data-testid', 'input-name');
      
      // Escape should close dialog
      cy.get('body').type('{esc}');
      cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
      cy.focused().should('have.attr', 'data-testid', 'button-create-unit');
    });

    it('should handle high contrast mode', () => {
      // Simulate high contrast mode
      cy.get('body').then($body => {
        $body.addClass('high-contrast');
      });

      cy.get('[data-testid="unit-card"]').should('have.css', 'border-width').and('not.eq', '0px');
      cy.get('[data-testid="button-create-unit"]').should('have.css', 'border-width').and('not.eq', '0px');
    });

    it('should support reduced motion preferences', () => {
      cy.window().then(win => {
        Object.defineProperty(win, 'matchMedia', {
          writable: true,
          value: cy.stub().returns({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
            onchange: null,
            addListener: cy.stub(),
            removeListener: cy.stub(),
          }),
        });
      });

      cy.reload();
      
      // Animations should be disabled
      cy.get('[data-testid="unit-card"]').should('have.css', 'animation-duration', '0s');
    });
  });

  describe('Performance and Loading States', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
    });

    it('should show loading state while fetching units', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { 
        delay: 2000,
        body: []
      }).as('getUnitsSlowly');
      
      cy.reload();
      
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-message"]').should('contain.text', 'Loading units');
      
      cy.wait('@getUnitsSlowly');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should show skeleton loading for unit cards', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { 
        delay: 1000,
        body: Array.from({ length: 6 }, (_, i) => ({ id: i, name: `Unit ${i}` }))
      }).as('getUnitsSkeleton');
      
      cy.reload();
      
      cy.get('[data-testid="skeleton-card"]').should('have.length.at.least', 3);
      cy.get('[data-testid="skeleton-card"]').should('have.class', 'animate-pulse');
      
      cy.wait('@getUnitsSkeleton');
      cy.get('[data-testid="skeleton-card"]').should('not.exist');
      cy.get('[data-testid="unit-card"]').should('have.length', 6);
    });

    it('should handle slow API responses gracefully', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { 
        delay: 10000,
        body: []
      }).as('getUnitsVerySlowly');
      
      cy.reload();
      
      // Should show timeout message after reasonable time
      cy.get('[data-testid="timeout-message"]', { timeout: 12000 }).should('be.visible');
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should show progress indicator during unit creation', () => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/new`);
      
      cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
        delay: 3000,
        statusCode: 201,
        body: { id: 'new-unit', name: 'New Unit' }
      }).as('createUnitSlowly');

      cy.get('[data-testid="input-name"]').type('Test Unit');
      cy.get('[data-testid="input-code"]').type('TEST001');
      cy.get('[data-testid="input-capacity"]').type('25');

      cy.get('[data-testid="button-save"]').click();
      
      cy.get('[data-testid="button-save"]').should('be.disabled');
      cy.get('[data-testid="save-progress"]').should('be.visible');
      cy.get('[data-testid="save-progress"]').should('contain.text', 'Creating unit');
      
      cy.wait('@createUnitSlowly');
      cy.get('[data-testid="save-progress"]').should('not.exist');
    });

    it('should implement optimistic updates for quick actions', () => {
      const mockUnit = {
        id: 'test-unit',
        name: 'Test Unit',
        status: 'active',
        code: 'TEST001',
        capacity: 25,
        description: 'Test'
      };

      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { body: [mockUnit] }).as('getUnits');
      cy.reload();
      cy.wait('@getUnits');

      // Mock slow status update
      cy.intercept('PATCH', `/api/units/${mockUnit.id}`, {
        delay: 2000,
        statusCode: 200,
        body: { ...mockUnit, status: 'inactive' }
      }).as('updateUnitStatus');

      // Toggle status
      cy.get('[data-testid="unit-status-toggle"]').click();
      
      // Should immediately show updated status (optimistic)
      cy.get('[data-testid="unit-status"]').should('contain.text', 'Inactive');
      
      cy.wait('@updateUnitStatus');
      
      // Status should remain updated after API call
      cy.get('[data-testid="unit-status"]').should('contain.text', 'Inactive');
    });
  });

  describe('Integration with Hospital Context', () => {
    it('should display correct hospital information in breadcrumbs', () => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      
      cy.get('[data-testid="breadcrumb"]').within(() => {
        cy.get('[data-testid="breadcrumb-home"]').should('contain.text', 'Dashboard');
        cy.get('[data-testid="breadcrumb-hospitals"]').should('contain.text', 'Hospitals');
        cy.get('[data-testid="breadcrumb-hospital"]').should('contain.text', testData.hospital.name);
        cy.get('[data-testid="breadcrumb-units"]').should('contain.text', 'Units');
      });
    });

    it('should maintain hospital context across navigation', () => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      
      // Navigate to create unit
      cy.get('[data-testid="button-create-unit"]').click();
      cy.url().should('include', testData.hospital.id);
      
      // Check that hospital info is preserved
      cy.get('[data-testid="hospital-context"]').should('contain.text', testData.hospital.name);
    });

    it('should validate hospital permissions for unit operations', () => {
      // Mock unauthorized access
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { 
        statusCode: 403,
        body: { message: 'Insufficient permissions' }
      }).as('getUnitsUnauthorized');
      
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnitsUnauthorized');

      cy.get('[data-testid="access-denied"]').should('be.visible');
      cy.get('[data-testid="access-denied-message"]').should('contain.text', 'You do not have permission');
      cy.get('[data-testid="button-request-access"]').should('be.visible');
    });

    it('should handle hospital not found error', () => {
      cy.intercept('GET', '/api/hospitals/non-existent/units', { 
        statusCode: 404,
        body: { message: 'Hospital not found' }
      }).as('getHospitalNotFound');
      
      cy.visit('/hospitals/non-existent/units');
      cy.wait('@getHospitalNotFound');

      cy.get('[data-testid="hospital-not-found"]').should('be.visible');
      cy.get('[data-testid="button-back-to-hospitals"]').should('be.visible');
    });
  });

  describe('Search and Filter Advanced Features', () => {
    beforeEach(() => {
      const mockUnits = [
        { id: '1', name: 'Emergency Department', code: 'ED001', capacity: 50, status: 'active', type: 'emergency' },
        { id: '2', name: 'Intensive Care Unit', code: 'ICU001', capacity: 20, status: 'active', type: 'critical' },
        { id: '3', name: 'General Ward', code: 'GW001', capacity: 100, status: 'inactive', type: 'general' },
        { id: '4', name: 'Pediatric Unit', code: 'PED001', capacity: 30, status: 'active', type: 'specialty' }
      ];

      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, { body: mockUnits }).as('getUnits');
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
    });

    it('should support advanced search with multiple criteria', () => {
      cy.get('[data-testid="advanced-search-toggle"]').click();
      cy.get('[data-testid="advanced-search-panel"]').should('be.visible');

      // Search by name and capacity range
      cy.get('[data-testid="search-name"]').type('Unit');
      cy.get('[data-testid="search-capacity-min"]').type('20');
      cy.get('[data-testid="search-capacity-max"]').type('50');

      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units?name=Unit&capacityMin=20&capacityMax=50`, { 
        body: [
          { id: '2', name: 'Intensive Care Unit', code: 'ICU001', capacity: 20, status: 'active' },
          { id: '4', name: 'Pediatric Unit', code: 'PED001', capacity: 30, status: 'active' }
        ]
      }).as('advancedSearch');

      cy.get('[data-testid="button-apply-search"]').click();
      cy.wait('@advancedSearch');

      cy.get('[data-testid="unit-card"]').should('have.length', 2);
    });

    it('should save and load search filters', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-active"]').click();
      
      cy.get('[data-testid="button-save-filter"]').click();
      cy.get('[data-testid="input-filter-name"]').type('Active Units');
      cy.get('[data-testid="button-confirm-save-filter"]').click();

      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit(`/hospitals/${testData.hospital.id}/units`);

      cy.get('[data-testid="saved-filters-dropdown"]').click();
      cy.get('[data-testid="saved-filter-active-units"]').click();

      cy.get('[data-testid="filter-status"]').should('contain.text', 'Active');
    });

    it('should support bulk operations on filtered results', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-active"]').click();

      cy.get('[data-testid="select-all-checkbox"]').check();
      cy.get('[data-testid="unit-checkbox"]').should('be.checked');

      cy.get('[data-testid="bulk-actions-dropdown"]').click();
      cy.get('[data-testid="bulk-action-export"]').should('be.visible');
      cy.get('[data-testid="bulk-action-deactivate"]').should('be.visible');
    });

    it('should show search suggestions as user types', () => {
      cy.get('[data-testid="search-units"]').type('Em');
      
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="suggestion-item"]').should('contain.text', 'Emergency');
      
      cy.get('[data-testid="suggestion-item"]').first().click();
      cy.get('[data-testid="search-units"]').should('have.value', 'Emergency Department');
    });

    it('should highlight search terms in results', () => {
      cy.get('[data-testid="search-units"]').type('Emergency');
      cy.get('[data-testid="button-search"]').click();

      cy.get('[data-testid="unit-name"] mark').should('contain.text', 'Emergency');
    });
  });
});
