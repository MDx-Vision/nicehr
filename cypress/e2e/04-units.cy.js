describe('Units Management', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    unit: {
      name: 'Cardiology Unit',
      description: 'Cardiac care and procedures',
      location: 'Building A, Floor 3',
      capacity: 25,
      phone: '+1 555-0123',
      email: 'cardiology@hospital.com',
      status: 'active'
    },
    unitUpdate: {
      name: 'Updated Cardiology Unit',
      description: 'Updated cardiac care and procedures',
      location: 'Building B, Floor 4',
      capacity: 30,
      phone: '+1 555-0124',
      email: 'cardiology-updated@hospital.com',
      status: 'inactive'
    },
    invalidUnit: {
      name: '', // Empty name should fail validation
      description: 'A'.repeat(1001), // Too long description
      capacity: -5, // Negative capacity
      email: 'invalid-email-format',
      phone: '123' // Invalid phone format
    },
    module: {
      name: 'EPIC Cardiology',
      description: 'EPIC system module for cardiology',
      version: '2023.1',
      vendor: 'EPIC Systems',
      status: 'active'
    }
  };

  beforeEach(() => {
    cy.login('admin');
    
    // Set up API intercepts
    cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`).as('getUnits');
    cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`).as('createUnit');
    cy.intercept('PATCH', '/api/units/*').as('updateUnit');
    cy.intercept('DELETE', '/api/units/*').as('deleteUnit');
    cy.intercept('GET', '/api/units/*/modules').as('getModules');
    cy.intercept('POST', '/api/units/*/modules').as('createModule');
    cy.intercept('PATCH', '/api/modules/*').as('updateModule');
    cy.intercept('DELETE', '/api/modules/*').as('deleteModule');
  });

  describe('Units List Page', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
    });

    describe('Page Layout and Navigation', () => {
      it('should display the units page with proper layout', () => {
        cy.get('[data-testid="page-header"]').should('contain.text', 'Hospital Units');
        cy.get('[data-testid="breadcrumb"]').should('be.visible');
        cy.get('[data-testid="breadcrumb"]').should('contain.text', testData.hospital.name);
        cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Units');
        
        cy.get('[data-testid="units-list-container"]').should('be.visible');
        cy.get('[data-testid="create-unit-button"]').should('be.visible');
      });

      it('should navigate back to hospital details', () => {
        cy.get('[data-testid="breadcrumb-hospital"]').click();
        cy.url().should('include', `/hospitals/${testData.hospital.id}`);
      });

      it('should have proper page title', () => {
        cy.title().should('contain', 'Units');
      });
    });

    describe('Units List Display', () => {
      it('should display units list with proper columns', () => {
        cy.get('[data-testid="units-table"]').should('be.visible');
        cy.get('[data-testid="units-table-header"]').within(() => {
          cy.contains('Name').should('be.visible');
          cy.contains('Location').should('be.visible');
          cy.contains('Capacity').should('be.visible');
          cy.contains('Status').should('be.visible');
          cy.contains('Actions').should('be.visible');
        });
      });

      it('should display empty state when no units exist', () => {
        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 200,
          body: { data: [], total: 0 }
        }).as('getEmptyUnits');
        
        cy.reload();
        cy.wait('@getEmptyUnits');
        
        cy.get('[data-testid="empty-state"]').should('be.visible');
        cy.get('[data-testid="empty-state-message"]').should('contain.text', 'No units found');
        cy.get('[data-testid="create-first-unit-button"]').should('be.visible');
      });

      it('should display units data correctly', () => {
        const mockUnits = [
          { 
            id: 'unit-1', 
            name: 'ICU', 
            location: 'Building A, Floor 2', 
            capacity: 20, 
            status: 'active',
            moduleCount: 3
          },
          { 
            id: 'unit-2', 
            name: 'Emergency', 
            location: 'Building B, Floor 1', 
            capacity: 15, 
            status: 'inactive',
            moduleCount: 2
          }
        ];

        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 200,
          body: { data: mockUnits, total: 2 }
        }).as('getMockUnits');
        
        cy.reload();
        cy.wait('@getMockUnits');

        mockUnits.forEach((unit, index) => {
          cy.get(`[data-testid="unit-row-${unit.id}"]`).within(() => {
            cy.get('[data-testid="unit-name"]').should('contain.text', unit.name);
            cy.get('[data-testid="unit-location"]').should('contain.text', unit.location);
            cy.get('[data-testid="unit-capacity"]').should('contain.text', unit.capacity.toString());
            cy.get('[data-testid="unit-status"]').should('contain.text', unit.status);
            cy.get('[data-testid="unit-module-count"]').should('contain.text', `${unit.moduleCount} modules`);
          });
        });
      });

      it('should handle loading state', () => {
        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, {
          delay: 2000,
          statusCode: 200,
          body: { data: [], total: 0 }
        }).as('getSlowUnits');
        
        cy.reload();
        cy.get('[data-testid="loading-spinner"]').should('be.visible');
        cy.wait('@getSlowUnits');
        cy.get('[data-testid="loading-spinner"]').should('not.exist');
      });

      it('should handle error state', () => {
        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('getUnitsError');
        
        cy.reload();
        cy.wait('@getUnitsError');
        
        cy.get('[data-testid="error-state"]').should('be.visible');
        cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load units');
        cy.get('[data-testid="retry-button"]').should('be.visible');
      });
    });

    describe('Search and Filters', () => {
      it('should have search functionality', () => {
        cy.get('[data-testid="search-input"]').should('be.visible');
        cy.get('[data-testid="search-input"]').should('have.attr', 'placeholder', 'Search units...');
      });

      it('should search units by name', () => {
        cy.get('[data-testid="search-input"]').type('ICU');
        cy.wait(500); // Debounce wait
        
        cy.url().should('include', 'search=ICU');
        cy.wait('@getUnits');
      });

      it('should filter by status', () => {
        cy.get('[data-testid="status-filter"]').should('be.visible');
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        
        cy.url().should('include', 'status=active');
        cy.wait('@getUnits');
      });

      it('should clear all filters', () => {
        cy.get('[data-testid="search-input"]').type('test');
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        
        cy.get('[data-testid="clear-filters-button"]').click();
        cy.get('[data-testid="search-input"]').should('have.value', '');
        cy.url().should('not.include', 'search=');
        cy.url().should('not.include', 'status=');
      });
    });

    describe('Pagination', () => {
      it('should display pagination when there are multiple pages', () => {
        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 200,
          body: { 
            data: Array(10).fill(null).map((_, i) => ({ id: `unit-${i}`, name: `Unit ${i}` })),
            total: 25,
            page: 1,
            pageSize: 10,
            totalPages: 3
          }
        }).as('getPaginatedUnits');
        
        cy.reload();
        cy.wait('@getPaginatedUnits');
        
        cy.get('[data-testid="pagination"]').should('be.visible');
        cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1-10 of 25');
      });

      it('should navigate to next page', () => {
        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*page=2*`, {
          statusCode: 200,
          body: { 
            data: Array(10).fill(null).map((_, i) => ({ id: `unit-${i+10}`, name: `Unit ${i+10}` })),
            total: 25,
            page: 2,
            pageSize: 10,
            totalPages: 3
          }
        }).as('getPage2Units');
        
        cy.get('[data-testid="pagination-next"]').click();
        cy.wait('@getPage2Units');
        cy.url().should('include', 'page=2');
      });
    });

    describe('Unit Actions', () => {
      it('should show action buttons for each unit', () => {
        const mockUnit = { id: 'unit-1', name: 'Test Unit' };
        
        cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 200,
          body: { data: [mockUnit], total: 1 }
        }).as('getSingleUnit');
        
        cy.reload();
        cy.wait('@getSingleUnit');
        
        cy.get(`[data-testid="unit-row-${mockUnit.id}"]`).within(() => {
          cy.get('[data-testid="view-unit-button"]').should('be.visible');
          cy.get('[data-testid="edit-unit-button"]').should('be.visible');
          cy.get('[data-testid="delete-unit-button"]').should('be.visible');
          cy.get('[data-testid="unit-actions-menu"]').should('be.visible');
        });
      });

      it('should open unit actions menu', () => {
        const mockUnit = { id: 'unit-1', name: 'Test Unit' };
        
        cy.get(`[data-testid="unit-actions-menu-${mockUnit.id}"]`).click();
        cy.get('[data-testid="action-view-modules"]').should('be.visible');
        cy.get('[data-testid="action-duplicate-unit"]').should('be.visible');
        cy.get('[data-testid="action-archive-unit"]').should('be.visible');
      });
    });
  });

  describe('Create Unit', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
    });

    describe('Create Unit Modal/Form', () => {
      it('should open create unit modal', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        cy.get('[data-testid="create-unit-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Create New Unit');
      });

      it('should display all form fields', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        
        cy.get('[data-testid="unit-name-input"]').should('be.visible');
        cy.get('[data-testid="unit-description-textarea"]').should('be.visible');
        cy.get('[data-testid="unit-location-input"]').should('be.visible');
        cy.get('[data-testid="unit-capacity-input"]').should('be.visible');
        cy.get('[data-testid="unit-phone-input"]').should('be.visible');
        cy.get('[data-testid="unit-email-input"]').should('be.visible');
        cy.get('[data-testid="unit-status-select"]').should('be.visible');
      });

      it('should have proper form validation attributes', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        
        cy.get('[data-testid="unit-name-input"]')
          .should('have.attr', 'required')
          .and('have.attr', 'maxlength', '100');
        
        cy.get('[data-testid="unit-email-input"]')
          .should('have.attr', 'type', 'email');
        
        cy.get('[data-testid="unit-capacity-input"]')
          .should('have.attr', 'type', 'number')
          .and('have.attr', 'min', '1');
      });

      it('should focus on name field when opened', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        cy.get('[data-testid="unit-name-input"]').should('be.focused');
      });
    });

    describe('Form Validation', () => {
      beforeEach(() => {
        cy.get('[data-testid="create-unit-button"]').click();
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.get('[data-testid="name-error"]').should('contain.text', 'Name is required');
        cy.get('[data-testid="location-error"]').should('contain.text', 'Location is required');
        cy.get('[data-testid="capacity-error"]').should('contain.text', 'Capacity is required');
      });

      it('should validate email format', () => {
        cy.get('[data-testid="unit-email-input"]').type(testData.invalidUnit.email);
        cy.get('[data-testid="unit-name-input"]').click(); // Trigger validation
        
        cy.get('[data-testid="email-error"]').should('contain.text', 'Please enter a valid email address');
      });

      it('should validate capacity is positive', () => {
        cy.get('[data-testid="unit-capacity-input"]').clear().type('-5');
        cy.get('[data-testid="unit-name-input"]').click();
        
        cy.get('[data-testid="capacity-error"]').should('contain.text', 'Capacity must be greater than 0');
      });

      it('should validate phone format', () => {
        cy.get('[data-testid="unit-phone-input"]').type('123');
        cy.get('[data-testid="unit-name-input"]').click();
        
        cy.get('[data-testid="phone-error"]').should('contain.text', 'Please enter a valid phone number');
      });

      it('should validate description length', () => {
        cy.get('[data-testid="unit-description-textarea"]').type(testData.invalidUnit.description);
        cy.get('[data-testid="unit-name-input"]').click();
        
        cy.get('[data-testid="description-error"]').should('contain.text', 'Description must be less than 1000 characters');
      });

      it('should validate name uniqueness', () => {
        cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 409,
          body: { error: 'A unit with this name already exists' }
        }).as('createDuplicateUnit');
        
        cy.fillUnitForm(testData.unit);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@createDuplicateUnit');
        cy.get('[data-testid="name-error"]').should('contain.text', 'A unit with this name already exists');
      });
    });

    describe('Successful Unit Creation', () => {
      beforeEach(() => {
        cy.get('[data-testid="create-unit-button"]').click();
      });

      it('should create unit with valid data', () => {
        const newUnit = { ...testData.unit, id: 'new-unit-id' };
        
        cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 201,
          body: { data: newUnit }
        }).as('createNewUnit');
        
        cy.fillUnitForm(testData.unit);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@createNewUnit');
        cy.get('[data-testid="create-unit-modal"]').should('not.exist');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Unit created successfully');
        
        // Should refresh the list
        cy.wait('@getUnits');
      });

      it('should handle creation with minimal required fields', () => {
        const minimalUnit = {
          name: testData.unit.name,
          location: testData.unit.location,
          capacity: testData.unit.capacity
        };
        
        cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 201,
          body: { data: { ...minimalUnit, id: 'minimal-unit-id' } }
        }).as('createMinimalUnit');
        
        cy.get('[data-testid="unit-name-input"]').type(minimalUnit.name);
        cy.get('[data-testid="unit-location-input"]').type(minimalUnit.location);
        cy.get('[data-testid="unit-capacity-input"]').type(minimalUnit.capacity.toString());
        
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@createMinimalUnit');
        cy.get('[data-testid="success-toast"]').should('be.visible');
      });

      it('should reset form after successful creation', () => {
        cy.fillUnitForm(testData.unit);
        cy.get('[data-testid="submit-unit-button"]').click();
        cy.wait('@createNewUnit');
        
        // Open modal again
        cy.get('[data-testid="create-unit-button"]').click();
        
        cy.get('[data-testid="unit-name-input"]').should('have.value', '');
        cy.get('[data-testid="unit-description-textarea"]').should('have.value', '');
        cy.get('[data-testid="unit-location-input"]').should('have.value', '');
      });
    });

    describe('Modal Interactions', () => {
      it('should close modal on cancel', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        cy.get('[data-testid="cancel-button"]').click();
        
        cy.get('[data-testid="create-unit-modal"]').should('not.exist');
      });

      it('should close modal on escape key', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        cy.get('[data-testid="create-unit-modal"]').type('{esc}');
        
        cy.get('[data-testid="create-unit-modal"]').should('not.exist');
      });

      it('should close modal on backdrop click', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        cy.get('[data-testid="modal-backdrop"]').click({ force: true });
        
        cy.get('[data-testid="create-unit-modal"]').should('not.exist');
      });

      it('should show confirmation when closing with unsaved changes', () => {
        cy.get('[data-testid="create-unit-button"]').click();
        cy.get('[data-testid="unit-name-input"]').type('Some text');
        cy.get('[data-testid="cancel-button"]').click();
        
        cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
        cy.get('[data-testid="discard-changes-button"]').click();
        cy.get('[data-testid="create-unit-modal"]').should('not.exist');
      });
    });

    describe('Error Handling', () => {
      beforeEach(() => {
        cy.get('[data-testid="create-unit-button"]').click();
      });

      it('should handle server errors', () => {
        cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('createUnitError');
        
        cy.fillUnitForm(testData.unit);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@createUnitError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to create unit');
        cy.get('[data-testid="create-unit-modal"]').should('be.visible'); // Modal should stay open
      });

      it('should handle network errors', () => {
        cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, { forceNetworkError: true }).as('networkError');
        
        cy.fillUnitForm(testData.unit);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@networkError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Network error');
      });

      it('should show loading state during submission', () => {
        cy.intercept('POST', `/api/hospitals/${testData.hospital.id}/units`, {
          delay: 2000,
          statusCode: 201,
          body: { data: testData.unit }
        }).as('slowCreateUnit');
        
        cy.fillUnitForm(testData.unit);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.get('[data-testid="submit-unit-button"]').should('be.disabled');
        cy.get('[data-testid="submit-loading-spinner"]').should('be.visible');
        cy.get('[data-testid="submit-unit-button"]').should('contain.text', 'Creating...');
        
        cy.wait('@slowCreateUnit');
        cy.get('[data-testid="submit-unit-button"]').should('not.be.disabled');
      });
    });
  });

  describe('Edit Unit', () => {
    let testUnitId;
    
    beforeEach(() => {
      testUnitId = 'test-unit-id';
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
      
      cy.intercept('GET', `/api/units/${testUnitId}`, {
        statusCode: 200,
        body: { data: { ...testData.unit, id: testUnitId } }
      }).as('getUnit');
    });

    describe('Edit Unit Modal', () => {
      it('should open edit modal with existing data', () => {
        cy.get(`[data-testid="edit-unit-button-${testUnitId}"]`).click();
        cy.wait('@getUnit');
        
        cy.get('[data-testid="edit-unit-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Unit');
        
        // Should populate existing data
        cy.get('[data-testid="unit-name-input"]').should('have.value', testData.unit.name);
        cy.get('[data-testid="unit-description-textarea"]').should('have.value', testData.unit.description);
        cy.get('[data-testid="unit-location-input"]').should('have.value', testData.unit.location);
        cy.get('[data-testid="unit-capacity-input"]').should('have.value', testData.unit.capacity.toString());
      });

      it('should update unit with modified data', () => {
        cy.intercept('PATCH', `/api/units/${testUnitId}`, {
          statusCode: 200,
          body: { data: { ...testData.unitUpdate, id: testUnitId } }
        }).as('updateTestUnit');
        
        cy.get(`[data-testid="edit-unit-button-${testUnitId}"]`).click();
        cy.wait('@getUnit');
        
        // Modify fields
        cy.get('[data-testid="unit-name-input"]').clear().type(testData.unitUpdate.name);
        cy.get('[data-testid="unit-location-input"]').clear().type(testData.unitUpdate.location);
        cy.get('[data-testid="unit-capacity-input"]').clear().type(testData.unitUpdate.capacity.toString());
        
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@updateTestUnit');
        cy.get('[data-testid="edit-unit-modal"]').should('not.exist');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Unit updated successfully');
        cy.wait('@getUnits');
      });

      it('should validate updated data', () => {
        cy.get(`[data-testid="edit-unit-button-${testUnitId}"]`).click();
        cy.wait('@getUnit');
        
        cy.get('[data-testid="unit-name-input"]').clear();
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.get('[data-testid="name-error"]').should('contain.text', 'Name is required');
      });
    });

    describe('Optimistic Updates', () => {
      it('should show optimistic updates in the list', () => {
        cy.intercept('PATCH', `/api/units/${testUnitId}`, {
          delay: 1000,
          statusCode: 200,
          body: { data: { ...testData.unitUpdate, id: testUnitId } }
        }).as('slowUpdateUnit');
        
        cy.get(`[data-testid="edit-unit-button-${testUnitId}"]`).click();
        cy.wait('@getUnit');
        
        cy.get('[data-testid="unit-name-input"]').clear().type(testData.unitUpdate.name);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        // Should show optimistic update
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).within(() => {
          cy.get('[data-testid="unit-name"]').should('contain.text', testData.unitUpdate.name);
        });
        
        cy.wait('@slowUpdateUnit');
      });

      it('should revert optimistic updates on error', () => {
        cy.intercept('PATCH', `/api/units/${testUnitId}`, {
          statusCode: 500,
          body: { error: 'Update failed' }
        }).as('updateUnitError');
        
        cy.get(`[data-testid="edit-unit-button-${testUnitId}"]`).click();
        cy.wait('@getUnit');
        
        cy.get('[data-testid="unit-name-input"]').clear().type(testData.unitUpdate.name);
        cy.get('[data-testid="submit-unit-button"]').click();
        
        cy.wait('@updateUnitError');
        
        // Should revert to original name
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).within(() => {
          cy.get('[data-testid="unit-name"]').should('contain.text', testData.unit.name);
        });
        
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to update unit');
      });
    });
  });

  describe('Delete Unit', () => {
    let testUnitId;
    
    beforeEach(() => {
      testUnitId = 'test-unit-id';
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
    });

    describe('Delete Confirmation', () => {
      it('should show delete confirmation dialog', () => {
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        
        cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
        cy.get('[data-testid="dialog-title"]').should('contain.text', 'Delete Unit');
        cy.get('[data-testid="dialog-description"]').should('contain.text', 'This action cannot be undone');
        cy.get('[data-testid="confirm-delete-button"]').should('be.visible');
        cy.get('[data-testid="cancel-delete-button"]').should('be.visible');
      });

      it('should cancel delete operation', () => {
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        cy.get('[data-testid="cancel-delete-button"]').click();
        
        cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
        // Unit should still exist in the list
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).should('exist');
      });

      it('should require confirmation text for destructive delete', () => {
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        
        cy.get('[data-testid="confirmation-input"]').should('be.visible');
        cy.get('[data-testid="confirmation-help-text"]').should('contain.text', 'Type "DELETE" to confirm');
        cy.get('[data-testid="confirm-delete-button"]').should('be.disabled');
        
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').should('not.be.disabled');
      });
    });

    describe('Successful Deletion', () => {
      it('should delete unit successfully', () => {
        cy.intercept('DELETE', `/api/units/${testUnitId}`, {
          statusCode: 200,
          body: { success: true }
        }).as('deleteTestUnit');
        
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteTestUnit');
        cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Unit deleted successfully');
        
        // Should refresh the list
        cy.wait('@getUnits');
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).should('not.exist');
      });

      it('should show optimistic delete with undo option', () => {
        cy.intercept('DELETE', `/api/units/${testUnitId}`, {
          delay: 2000,
          statusCode: 200,
          body: { success: true }
        }).as('slowDeleteUnit');
        
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        // Should immediately remove from list with undo option
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).should('not.exist');
        cy.get('[data-testid="undo-toast"]').should('be.visible');
        cy.get('[data-testid="undo-delete-button"]').should('be.visible');
        
        cy.wait('@slowDeleteUnit');
        cy.get('[data-testid="undo-toast"]').should('not.exist');
      });

      it('should handle undo delete action', () => {
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.get('[data-testid="undo-delete-button"]').click();
        
        // Should restore the unit in the list
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).should('exist');
        cy.get('[data-testid="undo-toast"]').should('not.exist');
      });
    });

    describe('Delete Error Handling', () => {
      it('should handle delete failure', () => {
        cy.intercept('DELETE', `/api/units/${testUnitId}`, {
          statusCode: 500,
          body: { error: 'Cannot delete unit' }
        }).as('deleteUnitError');
        
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteUnitError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to delete unit');
        cy.get(`[data-testid="unit-row-${testUnitId}"]`).should('exist'); // Should still exist
      });

      it('should handle constraint violation errors', () => {
        cy.intercept('DELETE', `/api/units/${testUnitId}`, {
          statusCode: 409,
          body: { error: 'Cannot delete unit with associated modules' }
        }).as('deleteConstraintError');
        
        cy.get(`[data-testid="delete-unit-button-${testUnitId}"]`).click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteConstraintError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Cannot delete unit with associated modules');
      });
    });

    describe('Bulk Delete Operations', () => {
      it('should select multiple units for bulk delete', () => {
        cy.get('[data-testid="select-all-checkbox"]').check();
        cy.get('[data-testid="bulk-actions-bar"]').should('be.visible');
        cy.get('[data-testid="selected-count"]').should('contain.text', 'selected');
        cy.get('[data-testid="bulk-delete-button"]').should('be.visible');
      });

      it('should perform bulk delete operation', () => {
        const unitIds = ['unit-1', 'unit-2'];
        
        cy.intercept('DELETE', '/api/units/bulk', {
          statusCode: 200,
          body: { deleted: unitIds.length }
        }).as('bulkDeleteUnits');
        
        unitIds.forEach(id => {
          cy.get(`[data-testid="select-unit-${id}"]`).check();
        });
        
        cy.get('[data-testid="bulk-delete-button"]').click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-bulk-delete-button"]').click();
        
        cy.wait('@bulkDeleteUnits');
        cy.get('[data-testid="success-toast"]').should('contain.text', `${unitIds.length} units deleted successfully`);
      });
    });
  });

  describe('Unit Modules Management', () => {
    let testUnitId;
    
    beforeEach(() => {
      testUnitId = 'test-unit-id';
      cy.visit(`/units/${testUnitId}/modules`);
      cy.wait('@getModules');
    });

    describe('Modules List', () => {
      it('should display modules list page', () => {
        cy.get('[data-testid="page-header"]').should('contain.text', 'Unit Modules');
        cy.get('[data-testid="modules-list-container"]').should('be.visible');
        cy.get('[data-testid="create-module-button"]').should('be.visible');
      });

      it('should display modules with proper information', () => {
        const mockModules = [
          { 
            id: 'module-1', 
            name: 'EPIC Cardiology', 
            version: '2023.1', 
            vendor: 'EPIC Systems',
            status: 'active'
          }
        ];
        
        cy.intercept('GET', `/api/units/${testUnitId}/modules`, {
          statusCode: 200,
          body: { data: mockModules, total: 1 }
        }).as('getMockModules');
        
        cy.reload();
        cy.wait('@getMockModules');
        
        cy.get(`[data-testid="module-row-${mockModules[0].id}"]`).within(() => {
          cy.get('[data-testid="module-name"]').should('contain.text', mockModules[0].name);
          cy.get('[data-testid="module-version"]').should('contain.text', mockModules[0].version);
          cy.get('[data-testid="module-vendor"]').should('contain.text', mockModules[0].vendor);
          cy.get('[data-testid="module-status"]').should('contain.text', mockModules[0].status);
        });
      });
    });

    describe('Create Module', () => {
      it('should open create module modal', () => {
        cy.get('[data-testid="create-module-button"]').click();
        cy.get('[data-testid="create-module-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Add Module');
      });

      it('should create module successfully', () => {
        cy.intercept('POST', `/api/units/${testUnitId}/modules`, {
          statusCode: 201,
          body: { data: { ...testData.module, id: 'new-module-id' } }
        }).as('createNewModule');
        
        cy.get('[data-testid="create-module-button"]').click();
        
        cy.get('[data-testid="module-name-input"]').type(testData.module.name);
        cy.get('[data-testid="module-description-textarea"]').type(testData.module.description);
        cy.get('[data-testid="module-version-input"]').type(testData.module.version);
        cy.get('[data-testid="module-vendor-input"]').type(testData.module.vendor);
        
        cy.get('[data-testid="submit-module-button"]').click();
        
        cy.wait('@createNewModule');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Module added successfully');
        cy.wait('@getModules');
      });

      it('should validate module form fields', () => {
        cy.get('[data-testid="create-module-button"]').click();
        cy.get('[data-testid="submit-module-button"]').click();
        
        cy.get('[data-testid="module-name-error"]').should('contain.text', 'Name is required');
        cy.get('[data-testid="module-version-error"]').should('contain.text', 'Version is required');
      });
    });

    describe('Module Actions', () => {
      it('should edit module', () => {
        const moduleId = 'module-1';
        
        cy.intercept('GET', `/api/modules/${moduleId}`, {
          statusCode: 200,
          body: { data: { ...testData.module, id: moduleId } }
        }).as('getModule');
        
        cy.intercept('PATCH', `/api/modules/${moduleId}`, {
          statusCode: 200,
          body: { data: { ...testData.module, name: 'Updated Module', id: moduleId } }
        }).as('updateModule');
        
        cy.get(`[data-testid="edit-module-button-${moduleId}"]`).click();
        cy.wait('@getModule');
        
        cy.get('[data-testid="module-name-input"]').clear().type('Updated Module');
        cy.get('[data-testid="submit-module-button"]').click();
        
        cy.wait('@updateModule');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Module updated successfully');
      });

      it('should delete module', () => {
        const moduleId = 'module-1';
        
        cy.intercept('DELETE', `/api/modules/${moduleId}`, {
          statusCode: 200,
          body: { success: true }
        }).as('deleteModule');
        
        cy.get(`[data-testid="delete-module-button-${moduleId}"]`).click();
        cy.get('[data-testid="confirmation-input"]').type('DELETE');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteModule');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Module deleted successfully');
        cy.wait('@getModules');
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
    });

    it('should adapt layout for mobile devices', () => {
      cy.viewport('iphone-6');
      
      // Should show mobile-friendly layout
      cy.get('[data-testid="mobile-units-list"]').should('be.visible');
      cy.get('[data-testid="desktop-units-table"]').should('not.be.visible');
      
      // Mobile action menu
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    });

    it('should adapt layout for tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="tablet-layout"]').should('be.visible');
      cy.get('[data-testid="units-grid"]').should('have.class', 'tablet-grid');
    });

    it('should maintain functionality on mobile', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="mobile-create-unit-fab"]').click();
      cy.get('[data-testid="create-unit-modal"]').should('be.visible');
      
      // Mobile form should be full screen
      cy.get('[data-testid="create-unit-modal"]').should('have.class', 'mobile-fullscreen');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getUnits');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="units-table"]').should('have.attr', 'role', 'table');
      cy.get('[data-testid="create-unit-button"]').should('have.attr', 'aria-label', 'Create new unit');
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label', 'Search units');
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'status-filter');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'create-unit-button');
    });

    it('should announce changes to screen readers', () => {
      cy.get('[data-testid="create-unit-button"]').click();
      cy.get('[data-testid="modal-announcement"]')
        .should('have.attr', 'aria-live', 'polite')
        .should('contain.text', 'Create unit dialog opened');
    });

    it('should have proper focus management in modals', () => {
      cy.get('[data-testid="create-unit-button"]').click();
      cy.get('[data-testid="unit-name-input"]').should('be.focused');
      
      cy.get('[data-testid="create-unit-modal"]').type('{esc}');
      cy.get('[data-testid="create-unit-button"]').should('be.focused');
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        id: `unit-${i}`,
        name: `Unit ${i}`,
        location: `Location ${i}`,
        capacity: 10 + (i % 50),
        status: i % 2 === 0 ? 'active' : 'inactive'
      }));
      
      cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`, {
        statusCode: 200,
        body: { 
          data: largeDataset.slice(0, 25),
          total: largeDataset.length,
          page: 1,
          pageSize: 25 
        }
      }).as('getLargeDataset');
      
      cy.visit(`/hospitals/${testData.hospital.id}/units`);
      cy.wait('@getLargeDataset');
      
      // Should render efficiently
      cy.get('[data-testid="units-table-body"] tr').should('have.length', 25);
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should implement virtual scrolling for large lists', () => {
      cy.viewport(1200, 600);
      
      // Should only render visible items
      cy.get('[data-testid="virtual-list-container"]').should('be.visible');
      cy.get('[data-testid="units-table-body"] tr').should('have.length.at.most', 20);
    });
  });

  // Helper command for filling unit form
  Cypress.Commands.add('fillUnitForm', (unitData) => {
    cy.get('[data-testid="unit-name-input"]').clear().type(unitData.name);
    if (unitData.description) {
      cy.get('[data-testid="unit-description-textarea"]').clear().type(unitData.description);
    }
    cy.get('[data-testid="unit-location-input"]').clear().type(unitData.location);
    cy.get('[data-testid="unit-capacity-input"]').clear().type(unitData.capacity.toString());
    if (unitData.phone) {
      cy.get('[data-testid="unit-phone-input"]').clear().type(unitData.phone);
    }
    if (unitData.email) {
      cy.get('[data-testid="unit-email-input"]').clear().type(unitData.email);
    }
    if (unitData.status) {
      cy.get('[data-testid="unit-status-select"]').select(unitData.status);
    }
  });
});
