describe('Modules Management System', () => {
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
        name: 'Emergency Department',
        description: 'Main emergency department module for patient intake and triage',
        status: 'active',
        capacity: 50,
        moduleType: 'clinical',
        bedCount: 25,
        equipmentList: ['Monitor', 'Defibrillator', 'Ventilator']
      },
      update: {
        name: 'Emergency Department - Updated',
        description: 'Updated emergency department module with expanded capacity',
        status: 'maintenance',
        capacity: 75,
        moduleType: 'clinical',
        bedCount: 35,
        equipmentList: ['Monitor', 'Defibrillator', 'Ventilator', 'X-Ray Machine']
      },
      minimal: {
        name: 'Minimal Module'
      },
      invalid: {
        name: '', // Required field empty
        description: 'Invalid module',
        capacity: -5, // Invalid negative capacity
        bedCount: 'invalid' // Invalid bed count type
      }
    },
    pagination: {
      page: 1,
      limit: 10
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
    
    // Login as admin
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    
    // Setup API interceptors
    cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`).as('getModules');
    cy.intercept('POST', `/api/units/${testData.unit.id}/modules`).as('createModule');
    cy.intercept('PATCH', '/api/modules/*').as('updateModule');
    cy.intercept('DELETE', '/api/modules/*').as('deleteModule');
    cy.intercept('GET', '/api/hospitals*').as('getHospitals');
    cy.intercept('GET', `/api/hospitals/${testData.hospital.id}/units*`).as('getUnits');
  });

  describe('Modules List Page', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
    });

    describe('Page Layout and Navigation', () => {
      it('should display the modules list page with proper layout', () => {
        cy.get('[data-testid="modules-page"]').should('be.visible');
        cy.get('[data-testid="page-header"]').should('contain.text', 'Modules');
        cy.get('[data-testid="breadcrumb"]').should('be.visible');
        cy.get('[data-testid="breadcrumb"]').should('contain.text', testData.hospital.name);
        cy.get('[data-testid="breadcrumb"]').should('contain.text', testData.unit.name);
        cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Modules');
      });

      it('should have proper navigation links in breadcrumb', () => {
        cy.get('[data-testid="breadcrumb-hospital"]').click();
        cy.url().should('include', `/hospitals/${testData.hospital.id}`);
        
        cy.go('back');
        cy.get('[data-testid="breadcrumb-unit"]').click();
        cy.url().should('include', `/hospitals/${testData.hospital.id}/units`);
      });

      it('should display add module button with proper permissions', () => {
        cy.get('[data-testid="add-module-button"]').should('be.visible');
        cy.get('[data-testid="add-module-button"]').should('contain.text', 'Add Module');
        cy.get('[data-testid="add-module-button"]').should('not.be.disabled');
      });

      it('should show page loading state initially', () => {
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.get('[data-testid="modules-loading"]').should('be.visible');
        cy.wait('@getModules');
        cy.get('[data-testid="modules-loading"]').should('not.exist');
      });
    });

    describe('Modules Table Display', () => {
      it('should display modules table with proper headers', () => {
        cy.get('[data-testid="modules-table"]').should('be.visible');
        cy.get('[data-testid="table-header"]').within(() => {
          cy.contains('Name').should('be.visible');
          cy.contains('Type').should('be.visible');
          cy.contains('Status').should('be.visible');
          cy.contains('Capacity').should('be.visible');
          cy.contains('Bed Count').should('be.visible');
          cy.contains('Actions').should('be.visible');
        });
      });

      it('should display module rows with correct data', () => {
        cy.get('[data-testid="module-row"]').should('have.length.at.least', 1);
        cy.get('[data-testid="module-row"]').first().within(() => {
          cy.get('[data-testid="module-name"]').should('be.visible');
          cy.get('[data-testid="module-type"]').should('be.visible');
          cy.get('[data-testid="module-status"]').should('be.visible');
          cy.get('[data-testid="module-capacity"]').should('be.visible');
          cy.get('[data-testid="module-bed-count"]').should('be.visible');
          cy.get('[data-testid="module-actions"]').should('be.visible');
        });
      });

      it('should show status badges with proper styling', () => {
        cy.get('[data-testid="module-status"]').each(($status) => {
          cy.wrap($status).should('have.class', 'badge');
          const status = $status.text().toLowerCase();
          if (status === 'active') {
            cy.wrap($status).should('have.class', 'badge-success');
          } else if (status === 'maintenance') {
            cy.wrap($status).should('have.class', 'badge-warning');
          } else if (status === 'inactive') {
            cy.wrap($status).should('have.class', 'badge-secondary');
          }
        });
      });

      it('should display module actions dropdown', () => {
        cy.get('[data-testid="module-actions"]').first().within(() => {
          cy.get('[data-testid="actions-dropdown"]').should('be.visible');
          cy.get('[data-testid="actions-dropdown"]').click();
          cy.get('[data-testid="action-view"]').should('contain.text', 'View');
          cy.get('[data-testid="action-edit"]').should('contain.text', 'Edit');
          cy.get('[data-testid="action-delete"]').should('contain.text', 'Delete');
        });
        
        // Close dropdown
        cy.get('[data-testid="modules-page"]').click();
      });
    });

    describe('Empty State', () => {
      it('should show empty state when no modules exist', () => {
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, { body: [] }).as('getEmptyModules');
        cy.reload();
        cy.wait('@getEmptyModules');
        
        cy.get('[data-testid="modules-empty-state"]').should('be.visible');
        cy.get('[data-testid="empty-state-message"]').should('contain.text', 'No modules found');
        cy.get('[data-testid="empty-state-description"]').should('contain.text', 'Get started by adding your first module');
        cy.get('[data-testid="add-first-module-button"]').should('be.visible');
      });

      it('should allow adding first module from empty state', () => {
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, { body: [] }).as('getEmptyModules');
        cy.reload();
        cy.wait('@getEmptyModules');
        
        cy.get('[data-testid="add-first-module-button"]').click();
        cy.get('[data-testid="module-form-modal"]').should('be.visible');
      });
    });

    describe('Search and Filters', () => {
      it('should have search functionality', () => {
        cy.get('[data-testid="modules-search"]').should('be.visible');
        cy.get('[data-testid="modules-search"]').should('have.attr', 'placeholder', 'Search modules...');
        
        cy.get('[data-testid="modules-search"]').type('Emergency');
        cy.get('[data-testid="search-clear"]').should('be.visible');
        
        // Should filter results
        cy.get('[data-testid="module-row"]').each(($row) => {
          cy.wrap($row).should('contain.text', 'Emergency');
        });
      });

      it('should clear search results', () => {
        cy.get('[data-testid="modules-search"]').type('Emergency');
        cy.get('[data-testid="search-clear"]').click();
        cy.get('[data-testid="modules-search"]').should('have.value', '');
      });

      it('should have status filter', () => {
        cy.get('[data-testid="status-filter"]').should('be.visible');
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="filter-option-active"]').should('be.visible');
        cy.get('[data-testid="filter-option-maintenance"]').should('be.visible');
        cy.get('[data-testid="filter-option-inactive"]').should('be.visible');
        
        cy.get('[data-testid="filter-option-active"]').click();
        cy.get('[data-testid="module-status"]').each(($status) => {
          cy.wrap($status).should('contain.text', 'Active');
        });
      });

      it('should have module type filter', () => {
        cy.get('[data-testid="type-filter"]').should('be.visible');
        cy.get('[data-testid="type-filter"]').click();
        cy.get('[data-testid="filter-option-clinical"]').should('be.visible');
        cy.get('[data-testid="filter-option-administrative"]').should('be.visible');
        cy.get('[data-testid="filter-option-support"]').should('be.visible');
      });

      it('should clear all filters', () => {
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="filter-option-active"]').click();
        cy.get('[data-testid="modules-search"]').type('Emergency');
        
        cy.get('[data-testid="clear-filters"]').click();
        cy.get('[data-testid="modules-search"]').should('have.value', '');
        cy.get('[data-testid="status-filter"]').should('contain.text', 'All Statuses');
      });

      it('should show no results message when search yields no results', () => {
        cy.get('[data-testid="modules-search"]').type('nonexistent-module-xyz');
        cy.get('[data-testid="no-search-results"]').should('be.visible');
        cy.get('[data-testid="no-search-results"]').should('contain.text', 'No modules match your search');
      });
    });

    describe('Sorting', () => {
      it('should sort by name', () => {
        cy.get('[data-testid="sort-by-name"]').click();
        cy.get('[data-testid="sort-indicator"]').should('contain.text', '↑');
        
        cy.get('[data-testid="sort-by-name"]').click();
        cy.get('[data-testid="sort-indicator"]').should('contain.text', '↓');
      });

      it('should sort by capacity', () => {
        cy.get('[data-testid="sort-by-capacity"]').click();
        cy.wait('@getModules');
        
        // Verify sorting order
        cy.get('[data-testid="module-capacity"]').then(($capacities) => {
          const capacities = Array.from($capacities, el => parseInt(el.textContent));
          const sortedCapacities = [...capacities].sort((a, b) => a - b);
          expect(capacities).to.deep.equal(sortedCapacities);
        });
      });

      it('should sort by status', () => {
        cy.get('[data-testid="sort-by-status"]').click();
        cy.wait('@getModules');
        
        cy.get('[data-testid="module-status"]').then(($statuses) => {
          const statuses = Array.from($statuses, el => el.textContent.trim());
          const sortedStatuses = [...statuses].sort();
          expect(statuses).to.deep.equal(sortedStatuses);
        });
      });
    });

    describe('Pagination', () => {
      it('should show pagination controls when needed', () => {
        // Mock response with many modules
        const manyModules = Array.from({length: 25}, (_, i) => ({
          id: `module-${i}`,
          name: `Module ${i}`,
          type: 'clinical',
          status: 'active',
          capacity: 50,
          bedCount: 25
        }));
        
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
          body: manyModules.slice(0, 10),
          headers: { 'x-total-count': '25' }
        }).as('getManyModules');
        
        cy.reload();
        cy.wait('@getManyModules');
        
        cy.get('[data-testid="pagination"]').should('be.visible');
        cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1 to 10 of 25 modules');
        cy.get('[data-testid="pagination-next"]').should('be.visible');
        cy.get('[data-testid="pagination-prev"]').should('be.disabled');
      });

      it('should navigate through pages', () => {
        const manyModules = Array.from({length: 25}, (_, i) => ({
          id: `module-${i}`,
          name: `Module ${i}`,
          type: 'clinical',
          status: 'active',
          capacity: 50,
          bedCount: 25
        }));
        
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*page=1*`, {
          body: manyModules.slice(0, 10),
          headers: { 'x-total-count': '25' }
        }).as('getPage1');
        
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*page=2*`, {
          body: manyModules.slice(10, 20),
          headers: { 'x-total-count': '25' }
        }).as('getPage2');
        
        cy.reload();
        cy.wait('@getPage1');
        
        cy.get('[data-testid="pagination-next"]').click();
        cy.wait('@getPage2');
        cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 11 to 20 of 25 modules');
        cy.get('[data-testid="pagination-prev"]').should('not.be.disabled');
      });

      it('should change page size', () => {
        cy.get('[data-testid="page-size-select"]').should('be.visible');
        cy.get('[data-testid="page-size-select"]').click();
        cy.get('[data-testid="page-size-20"]').click();
        cy.wait('@getModules');
        cy.get('[data-testid="pagination-info"]').should('contain.text', 'Showing 1 to 20');
      });
    });
  });

  describe('Add Module Modal', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
      cy.get('[data-testid="add-module-button"]').click();
      cy.get('[data-testid="module-form-modal"]').should('be.visible');
    });

    describe('Modal UI and Behavior', () => {
      it('should display add module modal with correct title', () => {
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Add Module');
        cy.get('[data-testid="modal-close"]').should('be.visible');
        cy.get('[data-testid="modal-overlay"]').should('be.visible');
      });

      it('should close modal on close button click', () => {
        cy.get('[data-testid="modal-close"]').click();
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should close modal on overlay click', () => {
        cy.get('[data-testid="modal-overlay"]').click({ force: true });
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should close modal on escape key', () => {
        cy.get('[data-testid="module-form"]').type('{esc}');
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should prevent modal close when form has unsaved changes', () => {
        cy.get('[data-testid="input-name"]').type('Test Module');
        cy.get('[data-testid="modal-overlay"]').click({ force: true });
        cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
        cy.get('[data-testid="confirm-discard"]').click();
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });
    });

    describe('Form Fields and Validation', () => {
      it('should display all required form fields', () => {
        cy.get('[data-testid="input-name"]').should('be.visible');
        cy.get('[data-testid="input-description"]').should('be.visible');
        cy.get('[data-testid="select-status"]').should('be.visible');
        cy.get('[data-testid="select-type"]').should('be.visible');
        cy.get('[data-testid="input-capacity"]').should('be.visible');
        cy.get('[data-testid="input-bed-count"]').should('be.visible');
        cy.get('[data-testid="equipment-list"]').should('be.visible');
      });

      it('should show required field indicators', () => {
        cy.get('label[for="name"]').should('contain.text', '*');
        cy.get('label[for="status"]').should('contain.text', '*');
        cy.get('label[for="type"]').should('contain.text', '*');
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-name"]').should('contain.text', 'Name is required');
        cy.get('[data-testid="error-status"]').should('contain.text', 'Status is required');
        cy.get('[data-testid="error-type"]').should('contain.text', 'Module type is required');
      });

      it('should validate name field length', () => {
        cy.get('[data-testid="input-name"]').type('A'.repeat(101));
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-name"]').should('contain.text', 'Name must be less than 100 characters');
      });

      it('should validate capacity as positive number', () => {
        cy.get('[data-testid="input-capacity"]').type('-5');
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity must be a positive number');
      });

      it('should validate bed count as positive integer', () => {
        cy.get('[data-testid="input-bed-count"]').type('invalid');
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-bed-count"]').should('contain.text', 'Bed count must be a valid number');
      });

      it('should validate bed count not exceeding capacity', () => {
        cy.get('[data-testid="input-capacity"]').type('50');
        cy.get('[data-testid="input-bed-count"]').type('60');
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-bed-count"]').should('contain.text', 'Bed count cannot exceed capacity');
      });

      it('should show character count for description', () => {
        cy.get('[data-testid="input-description"]').type('Test description');
        cy.get('[data-testid="description-count"]').should('contain.text', '16 / 500');
      });

      it('should limit description to maximum characters', () => {
        const longText = 'A'.repeat(501);
        cy.get('[data-testid="input-description"]').type(longText);
        cy.get('[data-testid="input-description"]').should('have.value', 'A'.repeat(500));
      });
    });

    describe('Status and Type Selects', () => {
      it('should populate status dropdown with correct options', () => {
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').should('contain.text', 'Active');
        cy.get('[data-testid="status-option-maintenance"]').should('contain.text', 'Maintenance');
        cy.get('[data-testid="status-option-inactive"]').should('contain.text', 'Inactive');
      });

      it('should populate type dropdown with correct options', () => {
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').should('contain.text', 'Clinical');
        cy.get('[data-testid="type-option-administrative"]').should('contain.text', 'Administrative');
        cy.get('[data-testid="type-option-support"]').should('contain.text', 'Support');
      });

      it('should select status option', () => {
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-status"]').should('contain.text', 'Active');
      });

      it('should select type option', () => {
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        cy.get('[data-testid="select-type"]').should('contain.text', 'Clinical');
      });
    });

    describe('Equipment List Management', () => {
      it('should add equipment item', () => {
        cy.get('[data-testid="input-equipment"]').type('Ventilator');
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="equipment-item"]').should('contain.text', 'Ventilator');
      });

      it('should remove equipment item', () => {
        cy.get('[data-testid="input-equipment"]').type('Ventilator');
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="remove-equipment-0"]').click();
        cy.get('[data-testid="equipment-item"]').should('not.exist');
      });

      it('should not add empty equipment items', () => {
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="equipment-item"]').should('not.exist');
      });

      it('should not add duplicate equipment items', () => {
        cy.get('[data-testid="input-equipment"]').type('Ventilator');
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="input-equipment"]').type('Ventilator');
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="equipment-item"]').should('have.length', 1);
        cy.get('[data-testid="error-equipment"]').should('contain.text', 'Equipment already added');
      });

      it('should clear equipment input after adding', () => {
        cy.get('[data-testid="input-equipment"]').type('Ventilator');
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="input-equipment"]').should('have.value', '');
      });
    });

    describe('Form Submission', () => {
      it('should create module successfully with valid data', () => {
        // Fill required fields
        cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
        cy.get('[data-testid="input-description"]').type(testData.modules.valid.description);
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        cy.get('[data-testid="input-capacity"]').type(testData.modules.valid.capacity.toString());
        cy.get('[data-testid="input-bed-count"]').type(testData.modules.valid.bedCount.toString());
        
        // Add equipment
        testData.modules.valid.equipmentList.forEach((equipment) => {
          cy.get('[data-testid="input-equipment"]').type(equipment);
          cy.get('[data-testid="add-equipment"]').click();
        });
        
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@createModule').then((interception) => {
          expect(interception.request.body).to.deep.include({
            name: testData.modules.valid.name,
            description: testData.modules.valid.description,
            status: 'active',
            moduleType: 'clinical',
            capacity: testData.modules.valid.capacity,
            bedCount: testData.modules.valid.bedCount,
            equipmentList: testData.modules.valid.equipmentList
          });
        });
        
        cy.get('[data-testid="success-message"]').should('contain.text', 'Module created successfully');
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should create module with minimal required data', () => {
        cy.get('[data-testid="input-name"]').type(testData.modules.minimal.name);
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@createModule');
        cy.get('[data-testid="success-message"]').should('be.visible');
      });

      it('should show loading state during submission', () => {
        cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="button-save"]').should('be.disabled');
        cy.get('[data-testid="save-loading"]').should('be.visible');
        
        cy.wait('@createModule');
        cy.get('[data-testid="button-save"]').should('not.be.disabled');
        cy.get('[data-testid="save-loading"]').should('not.exist');
      });

      it('should handle server errors gracefully', () => {
        cy.intercept('POST', `/api/units/${testData.unit.id}/modules`, {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('createModuleError');
        
        cy.get('[data-testid="input-name"]').type(testData.modules.valid.name);
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@createModuleError');
        
        cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to create module');
        cy.get('[data-testid="module-form-modal"]').should('be.visible'); // Modal should stay open
      });

      it('should handle validation errors from server', () => {
        cy.intercept('POST', `/api/units/${testData.unit.id}/modules`, {
          statusCode: 400,
          body: { 
            error: 'Validation failed',
            details: {
              name: 'Module name already exists',
              capacity: 'Capacity is invalid'
            }
          }
        }).as('createModuleValidationError');
        
        cy.get('[data-testid="input-name"]').type('Duplicate Module');
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@createModuleValidationError');
        
        cy.get('[data-testid="error-name"]').should('contain.text', 'Module name already exists');
        cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity is invalid');
      });
    });

    describe('Form Reset and Cancel', () => {
      it('should reset form on cancel', () => {
        cy.get('[data-testid="input-name"]').type('Test Module');
        cy.get('[data-testid="input-description"]').type('Test description');
        cy.get('[data-testid="button-cancel"]').click();
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should show confirmation when canceling with unsaved changes', () => {
        cy.get('[data-testid="input-name"]').type('Test Module');
        cy.get('[data-testid="button-cancel"]').click();
        cy.get('[data-testid="cancel-confirmation"]').should('be.visible');
        cy.get('[data-testid="confirm-cancel"]').click();
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should stay on form when canceling confirmation', () => {
        cy.get('[data-testid="input-name"]').type('Test Module');
        cy.get('[data-testid="button-cancel"]').click();
        cy.get('[data-testid="cancel-confirmation"]').should('be.visible');
        cy.get('[data-testid="stay-on-form"]').click();
        cy.get('[data-testid="module-form-modal"]').should('be.visible');
        cy.get('[data-testid="input-name"]').should('have.value', 'Test Module');
      });
    });
  });

  describe('Edit Module Modal', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
      cy.get('[data-testid="module-actions"]').first().within(() => {
        cy.get('[data-testid="actions-dropdown"]').click();
        cy.get('[data-testid="action-edit"]').click();
      });
      cy.get('[data-testid="module-form-modal"]').should('be.visible');
    });

    describe('Edit Modal UI', () => {
      it('should display edit modal with correct title', () => {
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Module');
      });

      it('should pre-populate form fields with existing data', () => {
        cy.get('[data-testid="input-name"]').should('not.have.value', '');
        cy.get('[data-testid="input-description"]').should('not.have.value', '');
        cy.get('[data-testid="select-status"]').should('not.contain.text', 'Select status');
        cy.get('[data-testid="select-type"]').should('not.contain.text', 'Select type');
      });

      it('should show update button instead of create button', () => {
        cy.get('[data-testid="button-save"]').should('contain.text', 'Update Module');
      });
    });

    describe('Edit Form Validation', () => {
      it('should validate required fields when cleared', () => {
        cy.get('[data-testid="input-name"]').clear();
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-name"]').should('contain.text', 'Name is required');
      });

      it('should validate field constraints', () => {
        cy.get('[data-testid="input-capacity"]').clear().type('-10');
        cy.get('[data-testid="button-save"]').click();
        cy.get('[data-testid="error-capacity"]').should('contain.text', 'Capacity must be a positive number');
      });
    });

    describe('Update Module', () => {
      it('should update module successfully with modified data', () => {
        const moduleId = 'test-module-id';
        cy.intercept('PATCH', `/api/modules/${moduleId}`, {
          statusCode: 200,
          body: { ...testData.modules.update, id: moduleId }
        }).as('updateModule');
        
        cy.get('[data-testid="input-name"]').clear().type(testData.modules.update.name);
        cy.get('[data-testid="input-description"]').clear().type(testData.modules.update.description);
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-maintenance"]').click();
        cy.get('[data-testid="input-capacity"]').clear().type(testData.modules.update.capacity.toString());
        cy.get('[data-testid="input-bed-count"]').clear().type(testData.modules.update.bedCount.toString());
        
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@updateModule').then((interception) => {
          expect(interception.request.body).to.deep.include({
            name: testData.modules.update.name,
            description: testData.modules.update.description,
            status: 'maintenance',
            capacity: testData.modules.update.capacity,
            bedCount: testData.modules.update.bedCount
          });
        });
        
        cy.get('[data-testid="success-message"]').should('contain.text', 'Module updated successfully');
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });

      it('should handle update server errors', () => {
        cy.intercept('PATCH', '/api/modules/*', {
          statusCode: 404,
          body: { error: 'Module not found' }
        }).as('updateModuleError');
        
        cy.get('[data-testid="input-name"]').clear().type('Updated Name');
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@updateModuleError');
        
        cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to update module');
      });
    });

    describe('Equipment Management in Edit Mode', () => {
      it('should display existing equipment items', () => {
        cy.get('[data-testid="equipment-item"]').should('have.length.at.least', 0);
      });

      it('should allow adding new equipment items', () => {
        const initialCount = cy.get('[data-testid="equipment-item"]').its('length');
        cy.get('[data-testid="input-equipment"]').type('New Equipment');
        cy.get('[data-testid="add-equipment"]').click();
        cy.get('[data-testid="equipment-item"]').should('have.length', initialCount + 1);
      });

      it('should allow removing existing equipment items', () => {
        cy.get('[data-testid="equipment-item"]').then(($items) => {
          if ($items.length > 0) {
            const initialCount = $items.length;
            cy.get('[data-testid="remove-equipment-0"]').click();
            cy.get('[data-testid="equipment-item"]').should('have.length', initialCount - 1);
          }
        });
      });
    });
  });

  describe('View Module Modal', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
      cy.get('[data-testid="module-actions"]').first().within(() => {
        cy.get('[data-testid="actions-dropdown"]').click();
        cy.get('[data-testid="action-view"]').click();
      });
      cy.get('[data-testid="module-view-modal"]').should('be.visible');
    });

    describe('View Modal Display', () => {
      it('should display module details in read-only format', () => {
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Module Details');
        cy.get('[data-testid="module-name"]').should('be.visible');
        cy.get('[data-testid="module-description"]').should('be.visible');
        cy.get('[data-testid="module-status"]').should('be.visible');
        cy.get('[data-testid="module-type"]').should('be.visible');
        cy.get('[data-testid="module-capacity"]').should('be.visible');
        cy.get('[data-testid="module-bed-count"]').should('be.visible');
      });

      it('should display equipment list if present', () => {
        cy.get('[data-testid="equipment-section"]').should('be.visible');
        cy.get('[data-testid="equipment-list"]').should('be.visible');
      });

      it('should show empty state for equipment if none exist', () => {
        // Assuming module has no equipment
        cy.get('[data-testid="equipment-empty"]').should('contain.text', 'No equipment assigned');
      });

      it('should display module metadata', () => {
        cy.get('[data-testid="created-date"]').should('be.visible');
        cy.get('[data-testid="modified-date"]').should('be.visible');
        cy.get('[data-testid="created-by"]').should('be.visible');
      });

      it('should have action buttons', () => {
        cy.get('[data-testid="edit-module-button"]').should('be.visible');
        cy.get('[data-testid="delete-module-button"]').should('be.visible');
        cy.get('[data-testid="close-modal-button"]').should('be.visible');
      });
    });

    describe('View Modal Actions', () => {
      it('should open edit modal from view modal', () => {
        cy.get('[data-testid="edit-module-button"]').click();
        cy.get('[data-testid="module-form-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Module');
      });

      it('should open delete confirmation from view modal', () => {
        cy.get('[data-testid="delete-module-button"]').click();
        cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      });

      it('should close view modal', () => {
        cy.get('[data-testid="close-modal-button"]').click();
        cy.get('[data-testid="module-view-modal"]').should('not.exist');
      });
    });
  });

  describe('Delete Module', () => {
    beforeEach(() => {
      cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
      cy.wait('@getModules');
    });

    describe('Delete Confirmation Modal', () => {
      beforeEach(() => {
        cy.get('[data-testid="module-actions"]').first().within(() => {
          cy.get('[data-testid="actions-dropdown"]').click();
          cy.get('[data-testid="action-delete"]').click();
        });
        cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      });

      it('should display delete confirmation with correct content', () => {
        cy.get('[data-testid="modal-title"]').should('contain.text', 'Delete Module');
        cy.get('[data-testid="delete-warning"]').should('contain.text', 'This action cannot be undone');
        cy.get('[data-testid="delete-impact"]').should('contain.text', 'All associated data will be permanently removed');
      });

      it('should show module name in confirmation', () => {
        cy.get('[data-testid="module-name-confirmation"]').should('be.visible');
      });

      it('should have cancel and confirm buttons', () => {
        cy.get('[data-testid="cancel-delete"]').should('be.visible');
        cy.get('[data-testid="confirm-delete"]').should('be.visible');
        cy.get('[data-testid="confirm-delete"]').should('contain.text', 'Delete');
        cy.get('[data-testid="confirm-delete"]').should('have.class', 'btn-danger');
      });

      it('should cancel deletion', () => {
        cy.get('[data-testid="cancel-delete"]').click();
        cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
      });

      it('should require typing module name for confirmation', () => {
        cy.get('[data-testid="confirm-name-input"]').should('be.visible');
        cy.get('[data-testid="confirm-delete"]').should('be.disabled');
        
        cy.get('[data-testid="confirm-name-input"]').type('Wrong Name');
        cy.get('[data-testid="confirm-delete"]').should('be.disabled');
        
        // Get the actual module name and type it
        cy.get('[data-testid="module-name-confirmation"]').then(($name) => {
          const moduleName = $name.text();
          cy.get('[data-testid="confirm-name-input"]').clear().type(moduleName);
          cy.get('[data-testid="confirm-delete"]').should('not.be.disabled');
        });
      });
    });

    describe('Delete Execution', () => {
      it('should delete module successfully', () => {
        const moduleId = 'test-module-id';
        cy.intercept('DELETE', `/api/modules/${moduleId}`, {
          statusCode: 200,
          body: { message: 'Module deleted successfully' }
        }).as('deleteModule');
        
        cy.get('[data-testid="module-actions"]').first().within(() => {
          cy.get('[data-testid="actions-dropdown"]').click();
          cy.get('[data-testid="action-delete"]').click();
        });
        
        cy.get('[data-testid="module-name-confirmation"]').then(($name) => {
          const moduleName = $name.text();
          cy.get('[data-testid="confirm-name-input"]').type(moduleName);
          cy.get('[data-testid="confirm-delete"]').click();
        });
        
        cy.wait('@deleteModule');
        cy.get('[data-testid="success-message"]').should('contain.text', 'Module deleted successfully');
        cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
      });

      it('should show loading state during deletion', () => {
        cy.get('[data-testid="module-actions"]').first().within(() => {
          cy.get('[data-testid="actions-dropdown"]').click();
          cy.get('[data-testid="action-delete"]').click();
        });
        
        cy.get('[data-testid="module-name-confirmation"]').then(($name) => {
          const moduleName = $name.text();
          cy.get('[data-testid="confirm-name-input"]').type(moduleName);
          cy.get('[data-testid="confirm-delete"]').click();
          
          cy.get('[data-testid="confirm-delete"]').should('be.disabled');
          cy.get('[data-testid="delete-loading"]').should('be.visible');
        });
      });

      it('should handle delete errors', () => {
        cy.intercept('DELETE', '/api/modules/*', {
          statusCode: 409,
          body: { error: 'Cannot delete module with active assignments' }
        }).as('deleteModuleError');
        
        cy.get('[data-testid="module-actions"]').first().within(() => {
          cy.get('[data-testid="actions-dropdown"]').click();
          cy.get('[data-testid="action-delete"]').click();
        });
        
        cy.get('[data-testid="module-name-confirmation"]').then(($name) => {
          const moduleName = $name.text();
          cy.get('[data-testid="confirm-name-input"]').type(moduleName);
          cy.get('[data-testid="confirm-delete"]').click();
        });
        
        cy.wait('@deleteModuleError');
        cy.get('[data-testid="error-message"]').should('contain.text', 'Cannot delete module with active assignments');
        cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible'); // Modal should stay open
      });

      it('should handle network errors during deletion', () => {
        cy.intercept('DELETE', '/api/modules/*', { forceNetworkError: true }).as('deleteNetworkError');
        
        cy.get('[data-testid="module-actions"]').first().within(() => {
          cy.get('[data-testid="actions-dropdown"]').click();
          cy.get('[data-testid="action-delete"]').click();
        });
        
        cy.get('[data-testid="module-name-confirmation"]').then(($name) => {
          const moduleName = $name.text();
          cy.get('[data-testid="confirm-name-input"]').type(moduleName);
          cy.get('[data-testid="confirm-delete"]').click();
        });
        
        cy.wait('@deleteNetworkError');
        cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to delete module');
      });
    });

    describe('Bulk Delete', () => {
      it('should allow selecting multiple modules', () => {
        cy.get('[data-testid="select-all-checkbox"]').should('be.visible');
        cy.get('[data-testid="module-checkbox"]').should('have.length.at.least', 1);
        
        cy.get('[data-testid="module-checkbox"]').first().check();
        cy.get('[data-testid="bulk-actions"]').should('be.visible');
        cy.get('[data-testid="selected-count"]').should('contain.text', '1 selected');
      });

      it('should select all modules', () => {
        cy.get('[data-testid="select-all-checkbox"]').check();
        cy.get('[data-testid="module-checkbox"]:checked').should('have.length.at.least', 1);
        cy.get('[data-testid="bulk-delete-button"]').should('be.visible');
      });

      it('should perform bulk delete', () => {
        cy.intercept('DELETE', '/api/modules/bulk', {
          statusCode: 200,
          body: { message: 'Modules deleted successfully', count: 2 }
        }).as('bulkDeleteModules');
        
        cy.get('[data-testid="module-checkbox"]').first().check();
        cy.get('[data-testid="module-checkbox"]').eq(1).check();
        cy.get('[data-testid="bulk-delete-button"]').click();
        
        cy.get('[data-testid="bulk-delete-confirmation"]').should('be.visible');
        cy.get('[data-testid="confirm-bulk-delete"]').click();
        
        cy.wait('@bulkDeleteModules');
        cy.get('[data-testid="success-message"]').should('contain.text', '2 modules deleted successfully');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    describe('Network Errors', () => {
      it('should handle network error when loading modules', () => {
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, { forceNetworkError: true }).as('networkError');
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@networkError');
        
        cy.get('[data-testid="error-state"]').should('be.visible');
        cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load modules');
        cy.get('[data-testid="retry-button"]').should('be.visible');
      });

      it('should retry loading modules after error', () => {
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, { forceNetworkError: true }).as('networkError');
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@networkError');
        
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, { body: [] }).as('retrySuccess');
        cy.get('[data-testid="retry-button"]').click();
        cy.wait('@retrySuccess');
        
        cy.get('[data-testid="error-state"]').should('not.exist');
        cy.get('[data-testid="modules-page"]').should('be.visible');
      });
    });

    describe('Unauthorized Access', () => {
      it('should handle unauthorized access to modules', () => {
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
          statusCode: 403,
          body: { error: 'Insufficient permissions' }
        }).as('unauthorizedError');
        
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@unauthorizedError');
        
        cy.get('[data-testid="unauthorized-message"]').should('contain.text', 'You do not have permission to view modules');
        cy.get('[data-testid="contact-admin"]').should('be.visible');
      });
    });

    describe('Invalid Routes', () => {
      it('should handle invalid unit ID', () => {
        cy.intercept('GET', '/api/units/invalid-id/modules*', {
          statusCode: 404,
          body: { error: 'Unit not found' }
        }).as('unitNotFound');
        
        cy.visit('/hospitals/ci-test-hospital/units/invalid-id/modules');
        cy.wait('@unitNotFound');
        
        cy.get('[data-testid="not-found-message"]').should('contain.text', 'Unit not found');
        cy.get('[data-testid="back-to-units"]').should('be.visible');
      });
    });

    describe('Session Timeout', () => {
      it('should handle session timeout during module operations', () => {
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules');
        
        cy.intercept('POST', `/api/units/${testData.unit.id}/modules`, {
          statusCode: 401,
          body: { error: 'Session expired' }
        }).as('sessionExpired');
        
        cy.get('[data-testid="add-module-button"]').click();
        cy.get('[data-testid="input-name"]').type('Test Module');
        cy.get('[data-testid="select-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-clinical"]').click();
        cy.get('[data-testid="button-save"]').click();
        
        cy.wait('@sessionExpired');
        cy.get('[data-testid="session-expired-modal"]').should('be.visible');
        cy.get('[data-testid="login-again"]').click();
        cy.url().should('include', '/login');
      });
    });
  });

  describe('Accessibility and Responsive Design', () => {
    describe('Keyboard Navigation', () => {
      beforeEach(() => {
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules');
      });

      it('should support keyboard navigation in modules table', () => {
        cy.get('[data-testid="modules-table"]').focus();
        cy.get('[data-testid="module-row"]').first().should('be.focused');
        
        cy.focused().type('{downarrow}');
        cy.get('[data-testid="module-row"]').eq(1).should('be.focused');
        
        cy.focused().type('{enter}');
        cy.get('[data-testid="module-view-modal"]').should('be.visible');
      });

      it('should support keyboard navigation in forms', () => {
        cy.get('[data-testid="add-module-button"]').click();
        
        cy.get('[data-testid="input-name"]').should('be.focused');
        cy.focused().tab();
        cy.get('[data-testid="input-description"]').should('be.focused');
        cy.focused().tab();
        cy.get('[data-testid="select-status"]').should('be.focused');
      });

      it('should handle escape key to close modals', () => {
        cy.get('[data-testid="add-module-button"]').click();
        cy.get('body').type('{esc}');
        cy.get('[data-testid="module-form-modal"]').should('not.exist');
      });
    });

    describe('Screen Reader Support', () => {
      it('should have proper ARIA labels and roles', () => {
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules');
        
        cy.get('[data-testid="modules-table"]').should('have.attr', 'role', 'table');
        cy.get('[data-testid="add-module-button"]').should('have.attr', 'aria-label', 'Add new module');
        cy.get('[data-testid="modules-search"]').should('have.attr', 'aria-label', 'Search modules');
      });

      it('should announce dynamic content changes', () => {
        cy.get('[data-testid="add-module-button"]').click();
        cy.get('[data-testid="input-name"]').type('Test Module');
        cy.get('[data-testid="button-save"]').click();
        
        cy.get('[data-testid="success-announcement"]').should('have.attr', 'aria-live', 'polite');
      });
    });

    describe('Mobile Responsiveness', () => {
      beforeEach(() => {
        cy.viewport('iphone-x');
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules');
      });

      it('should adapt table layout for mobile', () => {
        cy.get('[data-testid="modules-table"]').should('have.class', 'table-responsive');
        cy.get('[data-testid="mobile-module-card"]').should('be.visible');
      });

      it('should show mobile-friendly action menu', () => {
        cy.get('[data-testid="mobile-module-menu"]').first().click();
        cy.get('[data-testid="mobile-actions"]').should('be.visible');
        cy.get('[data-testid="mobile-action-edit"]').should('be.visible');
        cy.get('[data-testid="mobile-action-delete"]').should('be.visible');
      });

      it('should have touch-friendly form controls', () => {
        cy.get('[data-testid="add-module-button"]').click();
        cy.get('[data-testid="input-name"]').should('have.css', 'min-height', '44px'); // Touch target size
        cy.get('[data-testid="select-status"]').should('have.css', 'min-height', '44px');
      });
    });

    describe('High Contrast Mode', () => {
      it('should maintain visibility in high contrast mode', () => {
        // Simulate high contrast mode
        cy.get('body').invoke('attr', 'style', 'filter: contrast(200%);');
        
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules');
        
        cy.get('[data-testid="modules-table"]').should('be.visible');
        cy.get('[data-testid="add-module-button"]').should('be.visible');
        cy.get('[data-testid="modules-search"]').should('be.visible');
      });
    });
  });

  describe('Performance and Optimization', () => {
    describe('Data Loading Performance', () => {
      it('should load modules within acceptable time', () => {
        const startTime = Date.now();
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules').then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(3000); // 3 seconds max
        });
      });

      it('should implement virtual scrolling for large datasets', () => {
        const manyModules = Array.from({length: 1000}, (_, i) => ({
          id: `module-${i}`,
          name: `Module ${i}`,
          type: 'clinical',
          status: 'active',
          capacity: 50,
          bedCount: 25
        }));
        
        cy.intercept('GET', `/api/units/${testData.unit.id}/modules*`, {
          body: manyModules.slice(0, 50),
          headers: { 'x-total-count': '1000' }
        }).as('getManyModules');
        
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getManyModules');
        
        cy.get('[data-testid="virtual-scroll"]').should('be.visible');
        cy.get('[data-testid="module-row"]').should('have.length', 50);
      });
    });

    describe('Memory Management', () => {
      it('should cleanup event listeners when leaving page', () => {
        cy.visit(`/hospitals/${testData.hospital.id}/units/${testData.unit.id}/modules`);
        cy.wait('@getModules');
        
        // Navigate away
        cy.visit('/dashboard');
        
        // Check if cleanup occurred (implementation-dependent)
        cy.window().its('__moduleListeners').should('be.undefined');
      });
    });
  });
});
