describe('Units Management System', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    validUnit: {
      name: 'Emergency Department',
      type: 'Emergency',
      capacity: 25,
      location: 'Floor 1, Wing A',
      description: 'Main emergency department handling critical care',
      status: 'active',
      contactPhone: '555-0101',
      contactEmail: 'ed@hospital.com',
      operatingHours: '24/7',
      specializations: ['Trauma', 'Cardiac', 'Pediatric']
    },
    updateUnit: {
      name: 'Emergency Department - Updated',
      type: 'Critical Care',
      capacity: 30,
      location: 'Floor 1, Wing B',
      description: 'Updated emergency department with expanded capacity',
      status: 'active',
      contactPhone: '555-0102',
      contactEmail: 'ed-updated@hospital.com',
      operatingHours: '24/7',
      specializations: ['Trauma', 'Cardiac', 'Neurological']
    },
    invalidUnit: {
      name: '',
      type: '',
      capacity: -5,
      location: '',
      contactEmail: 'invalid-email',
      contactPhone: 'invalid-phone'
    },
    longTextUnit: {
      name: 'A'.repeat(256),
      description: 'B'.repeat(1001),
      location: 'C'.repeat(256)
    },
    searchTerm: 'Emergency',
    filterType: 'Emergency'
  };

  beforeEach(() => {
    // Login as admin user
    cy.login('test@example.com', 'password123');
    
    // Intercept API calls
    cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`).as('getUnits');
    cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`).as('createUnit');
    cy.intercept('PATCH', '/api/units/*').as('updateUnit');
    cy.intercept('DELETE', '/api/units/*').as('deleteUnit');
    cy.intercept('GET', '/api/hospitals').as('getHospitals');
    cy.intercept('GET', `/api/hospitals/${testData.hospital.id}`).as('getHospital');
    cy.intercept('GET', '/api/units/*/modules').as('getUnitModules');
    
    // Navigate to units page
    cy.visit(`/hospitals/${testData.hospital.id}/units`);
    cy.wait('@getUnits');
  });

  describe('Units List Page UI Elements', () => {
    it('should display all page elements correctly', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="page-title"]').should('contain.text', 'Units');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-create-unit"]').should('be.visible').and('contain.text', 'Add Unit');
      cy.get('[data-testid="button-bulk-actions"]').should('be.visible');
      cy.get('[data-testid="button-export"]').should('be.visible');
      
      // Search and filters
      cy.get('[data-testid="search-units"]').should('be.visible');
      cy.get('[data-testid="filter-type"]').should('be.visible');
      cy.get('[data-testid="filter-status"]').should('be.visible');
      cy.get('[data-testid="filter-capacity"]').should('be.visible');
      
      // Units table
      cy.get('[data-testid="units-table"]').should('be.visible');
      cy.get('[data-testid="table-header"]').should('be.visible');
    });

    it('should display correct table headers', () => {
      const expectedHeaders = [
        'Select',
        'Name',
        'Type',
        'Capacity',
        'Location',
        'Status',
        'Contact',
        'Modules',
        'Actions'
      ];
      
      expectedHeaders.forEach((header, index) => {
        cy.get('[data-testid="table-header"]').within(() => {
          cy.get('th').eq(index).should('contain.text', header);
        });
      });
    });

    it('should show empty state when no units exist', () => {
      // Mock empty response
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        statusCode: 200,
        body: { units: [], total: 0, page: 1, limit: 10 }
      }).as('getEmptyUnits');
      
      cy.reload();
      cy.wait('@getEmptyUnits');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]').should('contain.text', 'No units found');
      cy.get('[data-testid="empty-state-description"]').should('contain.text', 'Get started by creating your first unit');
      cy.get('[data-testid="empty-state-action"]').should('contain.text', 'Add Unit');
    });

    it('should display loading state correctly', () => {
      // Mock slow response
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        delay: 2000,
        statusCode: 200,
        body: { units: [], total: 0 }
      }).as('getSlowUnits');
      
      cy.reload();
      
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-text"]').should('contain.text', 'Loading units...');
      
      cy.wait('@getSlowUnits');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle error state gracefully', () => {
      // Mock error response
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getUnitsError');
      
      cy.reload();
      cy.wait('@getUnitsError');
      
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load units');
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should show hospital context correctly', () => {
      cy.get('[data-testid="hospital-context"]').should('be.visible');
      cy.get('[data-testid="hospital-name"]').should('contain.text', testData.hospital.name);
      cy.get('[data-testid="hospital-breadcrumb"]').should('contain.text', 'Hospitals');
    });
  });

  describe('Units Search and Filtering', () => {
    beforeEach(() => {
      // Mock units data for filtering tests
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        fixture: 'units-list.json'
      }).as('getUnitsWithData');
      cy.reload();
      cy.wait('@getUnitsWithData');
    });

    it('should filter units by search term', () => {
      cy.get('[data-testid="search-units"]').type(testData.searchTerm);
      
      cy.wait('@getUnits');
      
      cy.get('[data-testid="unit-row"]').each(($row) => {
        cy.wrap($row).should('contain.text', testData.searchTerm);
      });
      
      // Clear search
      cy.get('[data-testid="search-units"]').clear();
      cy.wait('@getUnits');
    });

    it('should filter units by type', () => {
      cy.get('[data-testid="filter-type"]').click();
      cy.get('[data-testid="filter-option-emergency"]').click();
      
      cy.wait('@getUnits');
      
      cy.get('[data-testid="unit-type"]').each(($type) => {
        cy.wrap($type).should('contain.text', 'Emergency');
      });
    });

    it('should filter units by status', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-active"]').click();
      
      cy.wait('@getUnits');
      
      cy.get('[data-testid="unit-status"]').each(($status) => {
        cy.wrap($status).should('contain.text', 'Active');
      });
    });

    it('should filter units by capacity range', () => {
      cy.get('[data-testid="filter-capacity"]').click();
      cy.get('[data-testid="capacity-min"]').type('10');
      cy.get('[data-testid="capacity-max"]').type('50');
      cy.get('[data-testid="apply-capacity-filter"]').click();
      
      cy.wait('@getUnits');
      
      cy.get('[data-testid="unit-capacity"]').each(($capacity) => {
        const capacity = parseInt($capacity.text());
        expect(capacity).to.be.at.least(10);
        expect(capacity).to.be.at.most(50);
      });
    });

    it('should combine multiple filters', () => {
      cy.get('[data-testid="search-units"]').type('Emergency');
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-active"]').click();
      
      cy.wait('@getUnits');
      
      cy.get('[data-testid="unit-row"]').each(($row) => {
        cy.wrap($row).should('contain.text', 'Emergency');
        cy.wrap($row).find('[data-testid="unit-status"]').should('contain.text', 'Active');
      });
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get('[data-testid="search-units"]').type('Emergency');
      cy.get('[data-testid="filter-type"]').click();
      cy.get('[data-testid="filter-option-emergency"]').click();
      
      // Clear all
      cy.get('[data-testid="clear-all-filters"]').click();
      
      cy.get('[data-testid="search-units"]').should('have.value', '');
      cy.get('[data-testid="filter-type"]').should('contain.text', 'All Types');
      cy.wait('@getUnits');
    });

    it('should show filter badges when active', () => {
      cy.get('[data-testid="filter-type"]').click();
      cy.get('[data-testid="filter-option-emergency"]').click();
      
      cy.get('[data-testid="active-filter-badge"]').should('be.visible').and('contain.text', 'Type: Emergency');
      
      // Remove filter via badge
      cy.get('[data-testid="remove-filter-badge"]').click();
      cy.get('[data-testid="active-filter-badge"]').should('not.exist');
    });

    it('should handle no results found', () => {
      // Mock empty search results
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        statusCode: 200,
        body: { units: [], total: 0, page: 1, limit: 10 }
      }).as('getEmptyResults');
      
      cy.get('[data-testid="search-units"]').type('NonexistentUnit');
      cy.wait('@getEmptyResults');
      
      cy.get('[data-testid="no-results-state"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]').should('contain.text', 'No units found matching your criteria');
      cy.get('[data-testid="clear-search-button"]').should('be.visible');
    });
  });

  describe('Unit Creation', () => {
    beforeEach(() => {
      cy.get('[data-testid="button-create-unit"]').click();
      cy.get('[data-testid="create-unit-modal"]').should('be.visible');
    });

    it('should display create unit modal with all fields', () => {
      // Modal header
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Create Unit');
      cy.get('[data-testid="modal-close"]').should('be.visible');
      
      // Required fields
      cy.get('[data-testid="input-name"]').should('be.visible').and('have.attr', 'required');
      cy.get('[data-testid="select-type"]').should('be.visible');
      cy.get('[data-testid="input-capacity"]').should('be.visible').and('have.attr', 'type', 'number');
      cy.get('[data-testid="input-location"]').should('be.visible');
      
      // Optional fields
      cy.get('[data-testid="textarea-description"]').should('be.visible');
      cy.get('[data-testid="select-status"]').should('be.visible');
      cy.get('[data-testid="input-contact-phone"]').should('be.visible');
      cy.get('[data-testid="input-contact-email"]').should('be.visible');
      cy.get('[data-testid="input-operating-hours"]').should('be.visible');
      cy.get('[data-testid="input-specializations"]').should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-cancel"]').should('be.visible');
      cy.get('[data-testid="button-create"]').should('be.visible').and('be.disabled');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="button-create"]').click();
      
      cy.get('[data-testid="error-name"]').should('be.visible').and('contain.text', 'Name is required');
      cy.get('[data-testid="error-type"]').should('be.visible').and('contain.text', 'Type is required');
      cy.get('[data-testid="error-capacity"]').should('be.visible').and('contain.text', 'Capacity is required');
      cy.get('[data-testid="error-location"]').should('be.visible').and('contain.text', 'Location is required');
    });

    it('should validate field constraints', () => {
      // Test invalid capacity
      cy.get('[data-testid="input-capacity"]').type('-5');
      cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity must be a positive number');
      
      // Test invalid email
      cy.get('[data-testid="input-contact-email"]').type('invalid-email');
      cy.get('[data-testid="error-contact-email"]').should('contain.text', 'Invalid email format');
      
      // Test field length limits
      cy.get('[data-testid="input-name"]').type(testData.longTextUnit.name);
      cy.get('[data-testid="error-name"]').should('contain.text', 'Name must be less than 255 characters');
      
      cy.get('[data-testid="textarea-description"]').type(testData.longTextUnit.description);
      cy.get('[data-testid="error-description"]').should('contain.text', 'Description must be less than 1000 characters');
    });

    it('should create unit with valid data', () => {
      // Fill out form
      cy.get('[data-testid="input-name"]').type(testData.validUnit.name);
      cy.get('[data-testid="select-type"]').click();
      cy.get('[data-testid="type-option-emergency"]').click();
      cy.get('[data-testid="input-capacity"]').type(testData.validUnit.capacity.toString());
      cy.get('[data-testid="input-location"]').type(testData.validUnit.location);
      cy.get('[data-testid="textarea-description"]').type(testData.validUnit.description);
      cy.get('[data-testid="input-contact-phone"]').type(testData.validUnit.contactPhone);
      cy.get('[data-testid="input-contact-email"]').type(testData.validUnit.contactEmail);
      cy.get('[data-testid="input-operating-hours"]').type(testData.validUnit.operatingHours);
      
      // Add specializations
      testData.validUnit.specializations.forEach(spec => {
        cy.get('[data-testid="input-specializations"]').type(`${spec}{enter}`);
      });
      
      // Enable create button
      cy.get('[data-testid="button-create"]').should('not.be.disabled');
      
      // Submit form
      cy.get('[data-testid="button-create"]').click();
      
      cy.wait('@createUnit').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.validUnit.name,
          type: testData.validUnit.type,
          capacity: testData.validUnit.capacity,
          location: testData.validUnit.location,
          description: testData.validUnit.description,
          contactPhone: testData.validUnit.contactPhone,
          contactEmail: testData.validUnit.contactEmail,
          operatingHours: testData.validUnit.operatingHours,
          specializations: testData.validUnit.specializations
        });
      });
      
      // Should close modal and show success message
      cy.get('[data-testid="create-unit-modal"]').should('not.exist');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Unit created successfully');
      
      // Should refresh units list
      cy.wait('@getUnits');
    });

    it('should handle server errors during creation', () => {
      cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
        statusCode: 400,
        body: { error: 'Unit name already exists' }
      }).as('createUnitError');
      
      // Fill required fields
      cy.get('[data-testid="input-name"]').type(testData.validUnit.name);
      cy.get('[data-testid="select-type"]').click();
      cy.get('[data-testid="type-option-emergency"]').click();
      cy.get('[data-testid="input-capacity"]').type(testData.validUnit.capacity.toString());
      cy.get('[data-testid="input-location"]').type(testData.validUnit.location);
      
      cy.get('[data-testid="button-create"]').click();
      
      cy.wait('@createUnitError');
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unit name already exists');
      cy.get('[data-testid="create-unit-modal"]').should('be.visible');
    });

    it('should cancel unit creation', () => {
      // Fill some data
      cy.get('[data-testid="input-name"]').type('Test Unit');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="create-unit-modal"]').should('not.exist');
    });

    it('should close modal with escape key', () => {
      cy.get('[data-testid="create-unit-modal"]').type('{esc}');
      cy.get('[data-testid="create-unit-modal"]').should('not.exist');
    });

    it('should close modal with X button', () => {
      cy.get('[data-testid="modal-close"]').click();
      cy.get('[data-testid="create-unit-modal"]').should('not.exist');
    });
  });

  describe('Unit Details and Viewing', () => {
    beforeEach(() => {
      // Mock unit data
      cy.fixture('unit-detail.json').as('unitDetail');
      cy.intercept('GET', '/api/units/*', { fixture: 'unit-detail.json' }).as('getUnitDetail');
    });

    it('should view unit details', () => {
      cy.get('[data-testid="unit-row"]').first().click();
      
      cy.wait('@getUnitDetail');
      
      cy.get('[data-testid="unit-detail-modal"]').should('be.visible');
      cy.get('[data-testid="unit-name"]').should('be.visible');
      cy.get('[data-testid="unit-type"]').should('be.visible');
      cy.get('[data-testid="unit-capacity"]').should('be.visible');
      cy.get('[data-testid="unit-location"]').should('be.visible');
      cy.get('[data-testid="unit-description"]').should('be.visible');
      cy.get('[data-testid="unit-status"]').should('be.visible');
      cy.get('[data-testid="unit-contact-info"]').should('be.visible');
      cy.get('[data-testid="unit-operating-hours"]').should('be.visible');
      cy.get('[data-testid="unit-specializations"]').should('be.visible');
    });

    it('should display unit statistics', () => {
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="view-stats"]').click();
      
      cy.get('[data-testid="unit-stats-modal"]').should('be.visible');
      cy.get('[data-testid="current-occupancy"]').should('be.visible');
      cy.get('[data-testid="capacity-utilization"]').should('be.visible');
      cy.get('[data-testid="staff-count"]').should('be.visible');
      cy.get('[data-testid="monthly-admissions"]').should('be.visible');
      cy.get('[data-testid="average-stay"]').should('be.visible');
    });

    it('should show unit modules', () => {
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="view-modules"]').click();
      
      cy.wait('@getUnitModules');
      
      cy.get('[data-testid="unit-modules-modal"]').should('be.visible');
      cy.get('[data-testid="modules-list"]').should('be.visible');
      cy.get('[data-testid="button-add-module"]').should('be.visible');
    });

    it('should navigate to unit management page', () => {
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="manage-unit"]').click();
      
      cy.url().should('include', '/units/');
      cy.get('[data-testid="unit-management-page"]').should('be.visible');
    });
  });

  describe('Unit Updates', () => {
    let unitId;

    beforeEach(() => {
      // Mock existing unit data
      cy.fixture('unit-detail.json').then((unit) => {
        unitId = unit.id;
        cy.intercept('GET', `/api/units/${unitId}`, { body: unit }).as('getUnitForEdit');
      });
      
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="edit-unit"]').click();
      cy.wait('@getUnitForEdit');
      cy.get('[data-testid="edit-unit-modal"]').should('be.visible');
    });

    it('should display edit form with existing data', () => {
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Unit');
      
      // Fields should be pre-populated
      cy.get('[data-testid="input-name"]').should('not.have.value', '');
      cy.get('[data-testid="input-capacity"]').should('not.have.value', '');
      cy.get('[data-testid="input-location"]').should('not.have.value', '');
      
      cy.get('[data-testid="button-update"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should update unit with valid data', () => {
      // Clear and update fields
      cy.get('[data-testid="input-name"]').clear().type(testData.updateUnit.name);
      cy.get('[data-testid="select-type"]').click();
      cy.get('[data-testid="type-option-critical-care"]').click();
      cy.get('[data-testid="input-capacity"]').clear().type(testData.updateUnit.capacity.toString());
      cy.get('[data-testid="input-location"]').clear().type(testData.updateUnit.location);
      cy.get('[data-testid="textarea-description"]').clear().type(testData.updateUnit.description);
      
      cy.get('[data-testid="button-update"]').click();
      
      cy.wait('@updateUnit').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.updateUnit.name,
          type: testData.updateUnit.type,
          capacity: testData.updateUnit.capacity,
          location: testData.updateUnit.location,
          description: testData.updateUnit.description
        });
      });
      
      cy.get('[data-testid="edit-unit-modal"]').should('not.exist');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Unit updated successfully');
      cy.wait('@getUnits');
    });

    it('should validate updated fields', () => {
      // Clear required field
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-update"]').click();
      
      cy.get('[data-testid="error-name"]').should('contain.text', 'Name is required');
      
      // Test invalid capacity
      cy.get('[data-testid="input-capacity"]').clear().type('0');
      cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity must be greater than 0');
    });

    it('should handle update errors', () => {
      cy.intercept('PATCH', `/api/units/${unitId}`, {
        statusCode: 409,
        body: { error: 'Unit name conflicts with existing unit' }
      }).as('updateUnitError');
      
      cy.get('[data-testid="input-name"]').clear().type('Conflicting Name');
      cy.get('[data-testid="button-update"]').click();
      
      cy.wait('@updateUnitError');
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Unit name conflicts with existing unit');
      cy.get('[data-testid="edit-unit-modal"]').should('be.visible');
    });

    it('should cancel unit update', () => {
      cy.get('[data-testid="input-name"]').clear().type('Changed Name');
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="edit-unit-modal"]').should('not.exist');
    });
  });

  describe('Unit Deletion', () => {
    let unitId;

    beforeEach(() => {
      cy.fixture('unit-detail.json').then((unit) => {
        unitId = unit.id;
      });
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="delete-unit"]').click();
      
      cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="delete-message"]').should('contain.text', 'Are you sure you want to delete this unit?');
      cy.get('[data-testid="delete-warning"]').should('contain.text', 'This action cannot be undone');
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible').and('have.class', 'destructive');
    });

    it('should delete unit when confirmed', () => {
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="delete-unit"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteUnit').then((interception) => {
        expect(interception.request.url).to.include('/api/units/');
      });
      
      cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Unit deleted successfully');
      cy.wait('@getUnits');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="delete-unit"]').click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
      cy.get('@deleteUnit').should('not.have.been.called');
    });

    it('should handle deletion errors', () => {
      cy.intercept('DELETE', `/api/units/*`, {
        statusCode: 400,
        body: { error: 'Cannot delete unit with active patients' }
      }).as('deleteUnitError');
      
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="delete-unit"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteUnitError');
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Cannot delete unit with active patients');
      cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
    });

    it('should prevent deletion of unit with dependencies', () => {
      // Mock unit with dependencies
      cy.intercept('GET', `/api/units/*/dependencies`, {
        body: { 
          hasPatients: true, 
          hasStaff: true,
          hasModules: true,
          patientCount: 5,
          staffCount: 10,
          moduleCount: 3
        }
      }).as('getUnitDependencies');
      
      cy.get('[data-testid="unit-row"]').first().find('[data-testid="delete-unit"]').click();
      
      cy.wait('@getUnitDependencies');
      
      cy.get('[data-testid="delete-warning"]').should('contain.text', 'This unit has active dependencies');
      cy.get('[data-testid="dependency-details"]').should('contain.text', '5 patients, 10 staff members, 3 modules');
      cy.get('[data-testid="button-confirm-delete"]').should('be.disabled');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      // Mock units with selection capabilities
      cy.fixture('units-list.json').as('unitsList');
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, { fixture: 'units-list.json' }).as('getUnitsForBulk');
      cy.reload();
      cy.wait('@getUnitsForBulk');
    });

    it('should select multiple units', () => {
      // Select individual units
      cy.get('[data-testid="unit-checkbox"]').first().check();
      cy.get('[data-testid="unit-checkbox"]').eq(1).check();
      
      cy.get('[data-testid="selected-count"]').should('contain.text', '2 units selected');
      cy.get('[data-testid="bulk-actions-toolbar"]').should('be.visible');
    });

    it('should select all units', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      
      cy.get('[data-testid="unit-checkbox"]').should('be.checked');
      cy.get('[data-testid="selected-count"]').should('contain.text', 'All units selected');
    });

    it('should deselect all units', () => {
      cy.get('[data-testid="select-all-checkbox"]').check();
      cy.get('[data-testid="select-all-checkbox"]').uncheck();
      
      cy.get('[data-testid="unit-checkbox"]').should('not.be.checked');
      cy.get('[data-testid="bulk-actions-toolbar"]').should('not.be.visible');
    });

    it('should perform bulk status update', () => {
      cy.intercept('PATCH', `/api/units/bulk-update`, { statusCode: 200 }).as('bulkUpdateUnits');
      
      cy.get('[data-testid="unit-checkbox"]').first().check();
      cy.get('[data-testid="unit-checkbox"]').eq(1).check();
      
      cy.get('[data-testid="bulk-action-status"]').click();
      cy.get('[data-testid="bulk-status-inactive"]').click();
      cy.get('[data-testid="confirm-bulk-update"]').click();
      
      cy.wait('@bulkUpdateUnits');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Units updated successfully');
    });

    it('should perform bulk deletion', () => {
      cy.intercept('DELETE', `/api/units/bulk-delete`, { statusCode: 200 }).as('bulkDeleteUnits');
      
      cy.get('[data-testid="unit-checkbox"]').first().check();
      cy.get('[data-testid="unit-checkbox"]').eq(1).check();
      
      cy.get('[data-testid="bulk-action-delete"]').click();
      cy.get('[data-testid="confirm-bulk-delete"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-input"]').type('DELETE');
      cy.get('[data-testid="button-confirm-bulk-delete"]').click();
      
      cy.wait('@bulkDeleteUnits');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Units deleted successfully');
    });

    it('should export selected units', () => {
      cy.get('[data-testid="unit-checkbox"]').first().check();
      cy.get('[data-testid="unit-checkbox"]').eq(1).check();
      
      cy.get('[data-testid="bulk-action-export"]').click();
      
      // Should trigger download
      cy.readFile('cypress/downloads/units-export.csv').should('exist');
    });
  });

  describe('Pagination and Navigation', () => {
    beforeEach(() => {
      // Mock paginated data
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        body: {
          units: Array(10).fill().map((_, i) => ({
            id: `unit-${i}`,
            name: `Unit ${i + 1}`,
            type: 'General',
            capacity: 20,
            status: 'active'
          })),
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5
        }
      }).as('getPaginatedUnits');
      cy.reload();
      cy.wait('@getPaginatedUnits');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 1-10 of 50 units');
      cy.get('[data-testid="page-size-select"]').should('be.visible');
      cy.get('[data-testid="first-page"]').should('be.visible');
      cy.get('[data-testid="prev-page"]').should('be.visible');
      cy.get('[data-testid="next-page"]').should('be.visible');
      cy.get('[data-testid="last-page"]').should('be.visible');
    });

    it('should navigate to next page', () => {
      cy.get('[data-testid="next-page"]').click();
      
      cy.wait('@getPaginatedUnits');
      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 11-20 of 50 units');
    });

    it('should navigate to specific page', () => {
      cy.get('[data-testid="page-3"]').click();
      
      cy.wait('@getPaginatedUnits');
      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 21-30 of 50 units');
    });

    it('should change page size', () => {
      cy.get('[data-testid="page-size-select"]').click();
      cy.get('[data-testid="page-size-25"]').click();
      
      cy.wait('@getPaginatedUnits');
      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 1-25 of 50 units');
    });

    it('should maintain selections across pages', () => {
      cy.get('[data-testid="unit-checkbox"]').first().check();
      cy.get('[data-testid="next-page"]').click();
      cy.wait('@getPaginatedUnits');
      cy.get('[data-testid="prev-page"]').click();
      cy.wait('@getPaginatedUnits');
      
      cy.get('[data-testid="unit-checkbox"]').first().should('be.checked');
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      cy.fixture('units-list.json').as('unitsList');
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, { fixture: 'units-list.json' }).as('getSortedUnits');
      cy.reload();
      cy.wait('@getSortedUnits');
    });

    it('should sort by name ascending', () => {
      cy.get('[data-testid="sort-name"]').click();
      
      cy.wait('@getSortedUnits');
      cy.get('[data-testid="sort-name"]').should('have.attr', 'aria-sort', 'ascending');
    });

    it('should sort by name descending', () => {
      cy.get('[data-testid="sort-name"]').click();
      cy.get('[data-testid="sort-name"]').click();
      
      cy.wait('@getSortedUnits');
      cy.get('[data-testid="sort-name"]').should('have.attr', 'aria-sort', 'descending');
    });

    it('should sort by capacity', () => {
      cy.get('[data-testid="sort-capacity"]').click();
      
      cy.wait('@getSortedUnits');
      cy.get('[data-testid="sort-capacity"]').should('have.attr', 'aria-sort', 'ascending');
    });

    it('should sort by type', () => {
      cy.get('[data-testid="sort-type"]').click();
      
      cy.wait('@getSortedUnits');
      cy.get('[data-testid="sort-type"]').should('have.attr', 'aria-sort', 'ascending');
    });

    it('should clear sorting', () => {
      cy.get('[data-testid="sort-name"]').click();
      cy.get('[data-testid="clear-sort"]').click();
      
      cy.wait('@getSortedUnits');
      cy.get('[data-testid="sort-name"]').should('have.attr', 'aria-sort', 'none');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile view', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="mobile-unit-card"]').should('be.visible');
      cy.get('[data-testid="units-table"]').should('not.be.visible');
      cy.get('[data-testid="mobile-search"]').should('be.visible');
      cy.get('[data-testid="mobile-filter-button"]').should('be.visible');
    });

    it('should show mobile filters', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="mobile-filter-button"]').click();
      cy.get('[data-testid="mobile-filter-drawer"]').should('be.visible');
      
      cy.get('[data-testid="mobile-filter-type"]').should('be.visible');
      cy.get('[data-testid="mobile-filter-status"]').should('be.visible');
      cy.get('[data-testid="mobile-apply-filters"]').should('be.visible');
    });

    it('should handle mobile unit actions', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="mobile-unit-card"]').first().find('[data-testid="mobile-actions"]').click();
      cy.get('[data-testid="mobile-action-menu"]').should('be.visible');
      
      cy.get('[data-testid="mobile-view"]').should('be.visible');
      cy.get('[data-testid="mobile-edit"]').should('be.visible');
      cy.get('[data-testid="mobile-delete"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="units-table"]').should('have.attr', 'role', 'table');
      cy.get('[data-testid="table-header"]').should('have.attr', 'role', 'rowgroup');
      cy.get('[data-testid="search-units"]').should('have.attr', 'aria-label', 'Search units');
      cy.get('[data-testid="button-create-unit"]').should('have.attr', 'aria-label', 'Create new unit');
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="search-units"]').focus().should('be.focused');
      cy.get('[data-testid="search-units"]').tab();
      cy.get('[data-testid="filter-type"]').should('be.focused');
      
      // Navigate through table with arrow keys
      cy.get('[data-testid="unit-row"]').first().focus();
      cy.get('[data-testid="unit-row"]').first().type('{downarrow}');
      cy.get('[data-testid="unit-row"]').eq(1).should('be.focused');
    });

    it('should announce screen reader messages', () => {
      cy.get('[data-testid="sr-only-status"]').should('exist');
      
      // Create unit
      cy.get('[data-testid="button-create-unit"]').click();
      cy.get('[data-testid="input-name"]').type(testData.validUnit.name);
      cy.get('[data-testid="sr-announcement"]').should('contain.text', 'Unit name entered');
    });

    it('should have proper focus management in modals', () => {
      cy.get('[data-testid="button-create-unit"]').click();
      cy.get('[data-testid="input-name"]').should('be.focused');
      
      cy.get('[data-testid="modal-close"]').click();
      cy.get('[data-testid="button-create-unit"]').should('be.focused');
    });
  });

  describe('Performance and Loading States', () => {
    it('should show skeleton loading for units table', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        delay: 2000,
        fixture: 'units-list.json'
      }).as('getSlowUnits');
      
      cy.reload();
      
      cy.get('[data-testid="units-skeleton"]').should('be.visible');
      cy.get('[data-testid="skeleton-row"]').should('have.length.at.least', 5);
      
      cy.wait('@getSlowUnits');
      cy.get('[data-testid="units-skeleton"]').should('not.exist');
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        body: {
          units: Array(1000).fill().map((_, i) => ({
            id: `unit-${i}`,
            name: `Unit ${i + 1}`,
            type: 'General',
            capacity: 20 + (i % 30),
            status: i % 2 === 0 ? 'active' : 'inactive'
          })),
          total: 1000,
          page: 1,
          limit: 25
        }
      }).as('getLargeDataset');
      
      cy.reload();
      cy.wait('@getLargeDataset');
      
      // Should render without performance issues
      cy.get('[data-testid="unit-row"]').should('have.length', 25);
      cy.get('[data-testid="page-info"]').should('contain.text', '1000 units');
    });

    it('should debounce search input', () => {
      let callCount = 0;
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, (req) => {
        callCount++;
        req.reply({ fixture: 'units-list.json' });
      }).as('getSearchResults');
      
      cy.get('[data-testid="search-units"]').type('Emergency Department', { delay: 50 });
      
      // Should debounce and not call API for each keystroke
      cy.wait(1000).then(() => {
        expect(callCount).to.be.lessThan(5);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed requests', () => {
      let attemptCount = 0;
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, (req) => {
        attemptCount++;
        if (attemptCount === 1) {
          req.reply({ statusCode: 500, body: { error: 'Server error' } });
        } else {
          req.reply({ fixture: 'units-list.json' });
        }
      }).as('getUnitsWithRetry');
      
      cy.reload();
      cy.wait('@getUnitsWithRetry');
      
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="button-retry"]').click();
      
      cy.wait('@getUnitsWithRetry');
      cy.get('[data-testid="units-table"]').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, { forceNetworkError: true }).as('getNetworkError');
      
      cy.reload();
      cy.wait('@getNetworkError');
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="offline-message"]').should('contain.text', 'Check your internet connection');
    });
  });
});
