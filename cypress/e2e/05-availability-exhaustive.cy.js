describe('Availability Management - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    availability: {
      valid: {
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        startTime: '09:00',
        endTime: '17:00',
        recurring: false,
        notes: 'Available for consultation'
      },
      recurring: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        startTime: '08:00',
        endTime: '16:00',
        recurring: true,
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        notes: 'Regular business hours'
      },
      invalid: {
        pastDate: '2023-01-01',
        invalidTime: '25:00',
        endBeforeStart: {
          startDate: '2024-01-20',
          endDate: '2024-01-15'
        }
      }
    }
  };

  const apiEndpoints = {
    consultantAvailability: `/api/consultants/${testData.consultant.id}/availability`,
    availability: '/api/availability',
    deleteAvailability: (id) => `/api/availability/${id}`
  };

  beforeEach(() => {
    cy.login();
  });

  describe('Availability List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/consultant-availability.json'
      }).as('getConsultantAvailability');
      
      cy.intercept('GET', apiEndpoints.availability, {
        fixture: 'availability/all-availability.json'
      }).as('getAllAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
    });

    it('should display complete availability page layout', () => {
      cy.wait('@getConsultantAvailability');

      // Main container
      cy.get('[data-testid="availability-container"]', { timeout: 10000 })
        .should('be.visible');

      // Header section
      cy.get('[data-testid="availability-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('h1').should('contain.text', 'Availability');
          cy.get('[data-testid="add-availability-btn"]')
            .should('be.visible')
            .and('contain.text', /add|new/i);
        });

      // Calendar/List view toggle
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="calendar-view"]').should('be.visible');
      cy.get('[data-testid="list-view"]').should('be.visible');

      // Filters section
      cy.get('[data-testid="availability-filters"]').should('be.visible');
    });

    it('should display availability items with all required information', () => {
      cy.wait('@getConsultantAvailability');

      cy.get('[data-testid="availability-list"]').should('be.visible');
      
      cy.get('[data-testid="availability-item"]').first().within(() => {
        // Date information
        cy.get('[data-testid="availability-date"]').should('be.visible');
        cy.get('[data-testid="availability-time"]').should('be.visible');
        
        // Status indicator
        cy.get('[data-testid="availability-status"]').should('be.visible');
        
        // Actions menu
        cy.get('[data-testid="availability-actions"]').should('be.visible');
      });
    });

    it('should handle empty state when no availability exists', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, []).as('getEmptyAvailability');
      cy.reload();
      cy.wait('@getEmptyAvailability');

      cy.get('[data-testid="empty-availability"]').should('be.visible');
      cy.get('[data-testid="empty-state-message"]')
        .should('contain.text', /no availability/i);
      cy.get('[data-testid="add-first-availability-btn"]')
        .should('be.visible');
    });

    it('should display loading state properly', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, { delay: 2000 }, []).as('getSlowAvailability');
      cy.reload();

      cy.get('[data-testid="availability-loading"]').should('be.visible');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });
  });

  describe('Calendar View - Interactive Features', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/consultant-availability.json'
      }).as('getConsultantAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getConsultantAvailability');
      cy.get('[data-testid="calendar-view"]').click();
    });

    it('should display calendar with navigation controls', () => {
      cy.get('[data-testid="availability-calendar"]').should('be.visible');
      
      // Navigation controls
      cy.get('[data-testid="calendar-prev"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="calendar-next"]').should('be.visible').and('not.be.disabled');
      cy.get('[data-testid="calendar-today"]').should('be.visible');
      
      // Month/week/day view toggles
      cy.get('[data-testid="calendar-month-view"]').should('be.visible');
      cy.get('[data-testid="calendar-week-view"]').should('be.visible');
      cy.get('[data-testid="calendar-day-view"]').should('be.visible');
      
      // Current month/year display
      cy.get('[data-testid="calendar-title"]').should('be.visible');
    });

    it('should allow navigation between months', () => {
      cy.get('[data-testid="calendar-title"]').then(($title) => {
        const initialTitle = $title.text();
        
        cy.get('[data-testid="calendar-next"]').click();
        cy.get('[data-testid="calendar-title"]').should('not.contain.text', initialTitle);
        
        cy.get('[data-testid="calendar-prev"]').click();
        cy.get('[data-testid="calendar-title"]').should('contain.text', initialTitle);
      });
    });

    it('should show availability blocks on calendar', () => {
      cy.get('[data-testid="calendar-availability-block"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="calendar-availability-block"]').first().within(() => {
        cy.get('[data-testid="availability-time-range"]').should('be.visible');
        cy.get('[data-testid="availability-status-indicator"]').should('be.visible');
      });
    });

    it('should allow clicking on availability blocks for details', () => {
      cy.get('[data-testid="calendar-availability-block"]').first().click();
      
      cy.get('[data-testid="availability-detail-modal"]').should('be.visible');
      cy.get('[data-testid="availability-detail-close"]').should('be.visible');
    });

    it('should switch between calendar view modes', () => {
      // Test month view
      cy.get('[data-testid="calendar-month-view"]').click();
      cy.get('[data-testid="calendar-month-grid"]').should('be.visible');
      
      // Test week view
      cy.get('[data-testid="calendar-week-view"]').click();
      cy.get('[data-testid="calendar-week-grid"]').should('be.visible');
      
      // Test day view
      cy.get('[data-testid="calendar-day-view"]').click();
      cy.get('[data-testid="calendar-day-grid"]').should('be.visible');
    });
  });

  describe('Add Availability Form - Complete Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, []).as('getAvailability');
      cy.intercept('POST', apiEndpoints.consultantAvailability, {
        statusCode: 201,
        body: { id: 'new-availability-id', ...testData.availability.valid }
      }).as('createAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
      cy.get('[data-testid="add-availability-btn"]').click();
    });

    it('should display complete add availability form', () => {
      cy.get('[data-testid="availability-form-modal"]').should('be.visible');
      
      cy.get('[data-testid="availability-form"]').within(() => {
        // Date fields
        cy.get('[data-testid="input-start-date"]')
          .should('be.visible')
          .and('have.attr', 'type', 'date');
        cy.get('[data-testid="input-end-date"]')
          .should('be.visible')
          .and('have.attr', 'type', 'date');
        
        // Time fields
        cy.get('[data-testid="input-start-time"]')
          .should('be.visible')
          .and('have.attr', 'type', 'time');
        cy.get('[data-testid="input-end-time"]')
          .should('be.visible')
          .and('have.attr', 'type', 'time');
        
        // Recurring checkbox
        cy.get('[data-testid="input-recurring"]')
          .should('be.visible')
          .and('have.attr', 'type', 'checkbox');
        
        // Notes field
        cy.get('[data-testid="input-notes"]')
          .should('be.visible')
          .and('have.attr', 'placeholder');
        
        // Form buttons
        cy.get('[data-testid="btn-save-availability"]')
          .should('be.visible')
          .and('contain.text', /save|create/i);
        cy.get('[data-testid="btn-cancel-availability"]')
          .should('be.visible')
          .and('contain.text', /cancel/i);
      });
    });

    it('should create new availability with valid data', () => {
      cy.get('[data-testid="input-start-date"]').type(testData.availability.valid.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.availability.valid.endDate);
      cy.get('[data-testid="input-start-time"]').type(testData.availability.valid.startTime);
      cy.get('[data-testid="input-end-time"]').type(testData.availability.valid.endTime);
      cy.get('[data-testid="input-notes"]').type(testData.availability.valid.notes);
      
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.wait('@createAvailability').then((interception) => {
        expect(interception.request.body).to.include({
          startDate: testData.availability.valid.startDate,
          endDate: testData.availability.valid.endDate,
          notes: testData.availability.valid.notes
        });
      });
      
      cy.get('[data-testid="availability-form-modal"]').should('not.exist');
      cy.get('[data-testid="success-toast"]').should('contain.text', /availability created/i);
    });

    it('should handle recurring availability creation', () => {
      cy.get('[data-testid="input-start-date"]').type(testData.availability.recurring.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.availability.recurring.endDate);
      cy.get('[data-testid="input-start-time"]').type(testData.availability.recurring.startTime);
      cy.get('[data-testid="input-end-time"]').type(testData.availability.recurring.endTime);
      cy.get('[data-testid="input-recurring"]').check();
      
      // Days of week should appear when recurring is checked
      cy.get('[data-testid="days-of-week-section"]').should('be.visible');
      
      testData.availability.recurring.daysOfWeek.forEach(day => {
        cy.get(`[data-testid="day-${day}"]`).check();
      });
      
      cy.get('[data-testid="input-notes"]').type(testData.availability.recurring.notes);
      
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.wait('@createAvailability');
      cy.get('[data-testid="success-toast"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="btn-save-availability"]').click();
      
      // Check for validation errors
      cy.get('[data-testid="error-start-date"]').should('be.visible');
      cy.get('[data-testid="error-end-date"]').should('be.visible');
      cy.get('[data-testid="error-start-time"]').should('be.visible');
      cy.get('[data-testid="error-end-time"]').should('be.visible');
      
      cy.get('[data-testid="availability-form-modal"]').should('be.visible');
    });

    it('should validate date range logic', () => {
      cy.get('[data-testid="input-start-date"]').type(testData.availability.invalid.endBeforeStart.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.availability.invalid.endBeforeStart.endDate);
      cy.get('[data-testid="input-start-time"]').type('09:00');
      cy.get('[data-testid="input-end-time"]').type('17:00');
      
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', /end date.*start date/i);
    });

    it('should validate time range logic', () => {
      cy.get('[data-testid="input-start-date"]').type(testData.availability.valid.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.availability.valid.startDate);
      cy.get('[data-testid="input-start-time"]').type('17:00');
      cy.get('[data-testid="input-end-time"]').type('09:00');
      
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.get('[data-testid="error-time-range"]')
        .should('be.visible')
        .and('contain.text', /end time.*start time/i);
    });

    it('should prevent past date selection', () => {
      cy.get('[data-testid="input-start-date"]').type(testData.availability.invalid.pastDate);
      cy.get('[data-testid="input-end-date"]').type(testData.availability.invalid.pastDate);
      cy.get('[data-testid="input-start-time"]').type('09:00');
      cy.get('[data-testid="input-end-time"]').type('17:00');
      
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.get('[data-testid="error-past-date"]')
        .should('be.visible')
        .and('contain.text', /past date/i);
    });

    it('should handle form cancellation', () => {
      cy.get('[data-testid="input-notes"]').type('Some notes');
      cy.get('[data-testid="btn-cancel-availability"]').click();
      
      cy.get('[data-testid="availability-form-modal"]').should('not.exist');
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', apiEndpoints.consultantAvailability, {
        statusCode: 400,
        body: { error: 'Availability conflict detected' }
      }).as('createAvailabilityError');
      
      cy.get('[data-testid="input-start-date"]').type(testData.availability.valid.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.availability.valid.endDate);
      cy.get('[data-testid="input-start-time"]').type(testData.availability.valid.startTime);
      cy.get('[data-testid="input-end-time"]').type(testData.availability.valid.endTime);
      
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.wait('@createAvailabilityError');
      cy.get('[data-testid="error-toast"]')
        .should('be.visible')
        .and('contain.text', /availability conflict/i);
    });
  });

  describe('Edit Availability - Complete CRUD Operations', () => {
    const existingAvailability = {
      id: 'existing-availability-id',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      startTime: '08:00',
      endTime: '16:00',
      notes: 'Original notes'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, [existingAvailability]).as('getAvailability');
      cy.intercept('PATCH', `/api/availability/${existingAvailability.id}`, {
        statusCode: 200,
        body: { ...existingAvailability, notes: 'Updated notes' }
      }).as('updateAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
    });

    it('should open edit form with pre-filled data', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="edit-availability"]').click();
      });
      
      cy.get('[data-testid="availability-form-modal"]').should('be.visible');
      
      // Check pre-filled values
      cy.get('[data-testid="input-start-date"]').should('have.value', existingAvailability.startDate);
      cy.get('[data-testid="input-end-date"]').should('have.value', existingAvailability.endDate);
      cy.get('[data-testid="input-start-time"]').should('have.value', existingAvailability.startTime);
      cy.get('[data-testid="input-end-time"]').should('have.value', existingAvailability.endTime);
      cy.get('[data-testid="input-notes"]').should('have.value', existingAvailability.notes);
    });

    it('should update availability successfully', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="edit-availability"]').click();
      });
      
      cy.get('[data-testid="input-notes"]').clear().type('Updated notes');
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.wait('@updateAvailability');
      cy.get('[data-testid="success-toast"]').should('contain.text', /availability updated/i);
    });

    it('should handle update validation errors', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="edit-availability"]').click();
      });
      
      cy.get('[data-testid="input-start-date"]').clear();
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.get('[data-testid="error-start-date"]').should('be.visible');
    });
  });

  describe('Delete Availability - Confirmation & Error Handling', () => {
    const availabilityToDelete = {
      id: 'availability-to-delete',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      startTime: '09:00',
      endTime: '17:00'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, [availabilityToDelete]).as('getAvailability');
      cy.intercept('DELETE', apiEndpoints.deleteAvailability(availabilityToDelete.id), {
        statusCode: 200
      }).as('deleteAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="delete-availability"]').click();
      });
      
      cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-message"]')
        .should('contain.text', /delete.*availability/i);
      cy.get('[data-testid="btn-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="btn-cancel-delete"]').should('be.visible');
    });

    it('should delete availability when confirmed', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="delete-availability"]').click();
      });
      
      cy.get('[data-testid="btn-confirm-delete"]').click();
      
      cy.wait('@deleteAvailability');
      cy.get('[data-testid="success-toast"]').should('contain.text', /availability deleted/i);
    });

    it('should cancel delete operation', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="delete-availability"]').click();
      });
      
      cy.get('[data-testid="btn-cancel-delete"]').click();
      
      cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
      cy.get('[data-testid="availability-item"]').should('be.visible');
    });

    it('should handle delete API errors', () => {
      cy.intercept('DELETE', apiEndpoints.deleteAvailability(availabilityToDelete.id), {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('deleteAvailabilityError');
      
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="delete-availability"]').click();
      });
      
      cy.get('[data-testid="btn-confirm-delete"]').click();
      
      cy.wait('@deleteAvailabilityError');
      cy.get('[data-testid="error-toast"]').should('be.visible');
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/multiple-availability.json'
      }).as('getAvailability');
      cy.intercept('GET', `${apiEndpoints.consultantAvailability}?*`, {
        fixture: 'availability/filtered-availability.json'
      }).as('getFilteredAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
    });

    it('should filter by date range', () => {
      cy.get('[data-testid="filter-start-date"]').type('2024-01-01');
      cy.get('[data-testid="filter-end-date"]').type('2024-01-31');
      cy.get('[data-testid="apply-filters"]').click();
      
      cy.wait('@getFilteredAvailability');
      cy.get('[data-testid="availability-item"]').should('have.length.at.least', 1);
    });

    it('should filter by availability status', () => {
      cy.get('[data-testid="filter-status"]').select('available');
      cy.get('[data-testid="apply-filters"]').click();
      
      cy.wait('@getFilteredAvailability');
    });

    it('should search by notes/description', () => {
      cy.get('[data-testid="search-availability"]').type('consultation');
      
      cy.wait('@getFilteredAvailability');
      cy.get('[data-testid="availability-item"]').should('contain.text', /consultation/i);
    });

    it('should clear all filters', () => {
      cy.get('[data-testid="filter-start-date"]').type('2024-01-01');
      cy.get('[data-testid="filter-status"]').select('available');
      cy.get('[data-testid="search-availability"]').type('test');
      
      cy.get('[data-testid="clear-filters"]').click();
      
      cy.get('[data-testid="filter-start-date"]').should('have.value', '');
      cy.get('[data-testid="filter-status"]').should('have.value', '');
      cy.get('[data-testid="search-availability"]').should('have.value', '');
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      cy.intercept('GET', `${apiEndpoints.consultantAvailability}*`, {
        fixture: 'availability/paginated-availability.json'
      }).as('getPaginatedAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getPaginatedAvailability');
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="page-info"]').should('contain.text', /page.*of/i);
      cy.get('[data-testid="prev-page"]').should('be.visible');
      cy.get('[data-testid="next-page"]').should('be.visible');
    });

    it('should navigate between pages', () => {
      cy.get('[data-testid="next-page"]').click();
      cy.wait('@getPaginatedAvailability');
      cy.url().should('include', 'page=2');
      
      cy.get('[data-testid="prev-page"]').click();
      cy.wait('@getPaginatedAvailability');
      cy.url().should('include', 'page=1');
    });

    it('should handle page size changes', () => {
      cy.get('[data-testid="page-size-select"]').select('50');
      cy.wait('@getPaginatedAvailability');
      cy.url().should('include', 'pageSize=50');
    });

    it('should sort by different columns', () => {
      cy.get('[data-testid="sort-date"]').click();
      cy.wait('@getPaginatedAvailability');
      cy.url().should('include', 'sortBy=date');
      
      cy.get('[data-testid="sort-date"]').click();
      cy.wait('@getPaginatedAvailability');
      cy.url().should('include', 'sortOrder=desc');
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/multiple-availability.json'
      }).as('getAvailability');
      cy.intercept('DELETE', '/api/availability/bulk', { statusCode: 200 }).as('bulkDelete');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
    });

    it('should enable bulk operations when items are selected', () => {
      cy.get('[data-testid="select-all-availability"]').check();
      
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      cy.get('[data-testid="bulk-delete"]').should('be.visible');
      cy.get('[data-testid="selected-count"]').should('contain.text', /selected/i);
    });

    it('should select individual items', () => {
      cy.get('[data-testid="select-availability"]').first().check();
      cy.get('[data-testid="select-availability"]').eq(1).check();
      
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      cy.get('[data-testid="selected-count"]').should('contain.text', '2');
    });

    it('should perform bulk delete operation', () => {
      cy.get('[data-testid="select-availability"]').first().check();
      cy.get('[data-testid="select-availability"]').eq(1).check();
      
      cy.get('[data-testid="bulk-delete"]').click();
      
      cy.get('[data-testid="bulk-delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="confirm-bulk-delete"]').click();
      
      cy.wait('@bulkDelete');
      cy.get('[data-testid="success-toast"]').should('contain.text', /deleted/i);
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/consultant-availability.json'
      }).as('getAvailability');
    });

    it('should adapt layout for mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
      
      // Mobile-specific elements
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      cy.get('[data-testid="mobile-availability-list"]').should('be.visible');
      
      // Desktop elements should be hidden
      cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
    });

    it('should show mobile-optimized calendar', () => {
      cy.viewport('iphone-x');
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
      
      cy.get('[data-testid="calendar-view"]').click();
      cy.get('[data-testid="mobile-calendar"]').should('be.visible');
    });

    it('should handle touch gestures on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
      
      // Test swipe gestures for navigation
      cy.get('[data-testid="availability-list"]').swipe('left');
      cy.get('[data-testid="next-page"]').should('be.visible');
    });
  });

  describe('Error States and Edge Cases', () => {
    it('should handle network failures gracefully', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, { forceNetworkError: true }).as('networkError');
      
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle 404 consultant not found', () => {
      cy.intercept('GET', '/api/consultants/non-existent/availability', {
        statusCode: 404,
        body: { error: 'Consultant not found' }
      }).as('consultantNotFound');
      
      cy.visit('/consultants/non-existent/availability');
      
      cy.get('[data-testid="not-found-error"]').should('be.visible');
      cy.get('[data-testid="back-to-consultants"]').should('be.visible');
    });

    it('should handle server errors during operations', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      
      cy.get('[data-testid="server-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', /server error/i);
    });

    it('should handle concurrent modification conflicts', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, [{
        id: 'conflict-availability',
        startDate: '2024-02-01',
        endDate: '2024-02-01',
        startTime: '09:00',
        endTime: '17:00',
        version: 1
      }]).as('getAvailability');
      
      cy.intercept('PATCH', '/api/availability/conflict-availability', {
        statusCode: 409,
        body: { error: 'Availability has been modified by another user' }
      }).as('conflictError');
      
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
      
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[data-testid="availability-actions"]').click();
        cy.get('[data-testid="edit-availability"]').click();
      });
      
      cy.get('[data-testid="input-notes"]').clear().type('Updated notes');
      cy.get('[data-testid="btn-save-availability"]').click();
      
      cy.wait('@conflictError');
      cy.get('[data-testid="conflict-error-modal"]').should('be.visible');
      cy.get('[data-testid="reload-and-retry"]').should('be.visible');
    });
  });

  describe('Accessibility Compliance', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/consultant-availability.json'
      }).as('getAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="availability-list"]')
        .should('have.attr', 'role', 'list');
      
      cy.get('[data-testid="availability-item"]')
        .should('have.attr', 'role', 'listitem');
      
      cy.get('[data-testid="add-availability-btn"]')
        .should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'add-availability-btn');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid').and('match', /filter|search/);
    });

    it('should support screen readers', () => {
      cy.get('[data-testid="availability-item"]').first().within(() => {
        cy.get('[aria-describedby]').should('exist');
        cy.get('[aria-label]').should('exist');
      });
    });

    it('should have sufficient color contrast', () => {
      cy.get('[data-testid="availability-status"]').should('be.visible');
      // Color contrast would be tested with axe-core in a real scenario
    });
  });

  describe('Performance and Loading', () => {
    it('should handle large datasets efficiently', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/large-dataset-availability.json'
      }).as('getLargeDataset');
      
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getLargeDataset');
      
      // Should implement virtual scrolling or pagination for large datasets
      cy.get('[data-testid="availability-item"]').should('have.length.lessThan', 101);
      cy.get('[data-testid="pagination"]').should('be.visible');
    });

    it('should implement proper loading states', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, { delay: 1000 }, []).as('getSlowAvailability');
      
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      
      cy.get('[data-testid="availability-loading"]').should('be.visible');
      cy.wait('@getSlowAvailability');
      cy.get('[data-testid="availability-loading"]').should('not.exist');
    });

    it('should cache availability data appropriately', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        fixture: 'availability/consultant-availability.json'
      }).as('getAvailability');
      
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getAvailability');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      
      // Should not make another API call if data is cached
      cy.get('[data-testid="availability-item"]').should('be.visible');
    });
  });
});
