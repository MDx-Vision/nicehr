describe('Availability Management - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    availability: {
      valid: {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        availabilityType: 'available',
        notes: 'Available for standard hours'
      },
      recurring: {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        dayOfWeek: 'tuesday',
        startTime: '08:00',
        endTime: '16:00',
        availabilityType: 'available',
        notes: 'Weekly recurring availability',
        isRecurring: true,
        recurringPattern: 'weekly'
      },
      unavailable: {
        startDate: '2024-12-15',
        endDate: '2024-12-16',
        availabilityType: 'unavailable',
        notes: 'Personal time off'
      },
      conflicting: {
        startDate: '2024-12-01',
        endDate: '2024-12-02',
        dayOfWeek: 'monday',
        startTime: '10:00',
        endTime: '18:00',
        availabilityType: 'available',
        notes: 'Conflicting time slot'
      }
    },
    apiEndpoints: {
      availability: '/api/availability',
      consultantAvailability: '/api/consultants/*/availability',
      createAvailability: '/api/availability',
      deleteAvailability: '/api/availability/*'
    }
  };

  beforeEach(() => {
    // Login as test user
    cy.login('test@example.com', 'test123');
    
    // Setup API intercepts
    cy.intercept('GET', testData.apiEndpoints.availability).as('getAvailability');
    cy.intercept('GET', testData.apiEndpoints.consultantAvailability).as('getConsultantAvailability');
    cy.intercept('POST', testData.apiEndpoints.createAvailability).as('createAvailability');
    cy.intercept('DELETE', testData.apiEndpoints.deleteAvailability).as('deleteAvailability');
  });

  describe('Availability Calendar View', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should display complete availability calendar interface', () => {
      // Page header
      cy.get('[data-testid="availability-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('h1').should('contain.text', /availability/i);

      // Calendar controls
      cy.get('[data-testid="calendar-controls"]').should('be.visible');
      cy.get('[data-testid="calendar-prev-button"]')
        .should('be.visible')
        .and('not.be.disabled');
      cy.get('[data-testid="calendar-next-button"]')
        .should('be.visible')
        .and('not.be.disabled');
      cy.get('[data-testid="calendar-today-button"]')
        .should('be.visible')
        .and('contain.text', /today|current/i);

      // View options
      cy.get('[data-testid="calendar-view-selector"]').should('be.visible');
      cy.get('[data-testid="view-week"]').should('be.visible');
      cy.get('[data-testid="view-month"]').should('be.visible');
      cy.get('[data-testid="view-day"]').should('be.visible');

      // Calendar grid
      cy.get('[data-testid="calendar-grid"]').should('be.visible');
      cy.get('[data-testid="calendar-day-header"]').should('have.length.at.least', 7);

      // Action buttons
      cy.get('[data-testid="add-availability-button"]')
        .should('be.visible')
        .and('contain.text', /add|create/i);
    });

    it('should navigate calendar views correctly', () => {
      // Test month navigation
      cy.get('[data-testid="calendar-next-button"]').click();
      cy.get('[data-testid="current-month-year"]')
        .should('be.visible');

      cy.get('[data-testid="calendar-prev-button"]').click();
      cy.get('[data-testid="current-month-year"]')
        .should('be.visible');

      // Test view switching
      cy.get('[data-testid="view-week"]').click();
      cy.get('[data-testid="calendar-grid"]')
        .should('have.class', /week|weekly/);

      cy.get('[data-testid="view-day"]').click();
      cy.get('[data-testid="calendar-grid"]')
        .should('have.class', /day|daily/);

      cy.get('[data-testid="view-month"]').click();
      cy.get('[data-testid="calendar-grid"]')
        .should('have.class', /month|monthly/);

      // Test today button
      cy.get('[data-testid="calendar-today-button"]').click();
      cy.get('[data-testid="current-date"]')
        .should('contain.text', new Date().getDate().toString());
    });

    it('should display existing availability entries', () => {
      // Check for availability entries
      cy.get('[data-testid^="availability-entry-"]').then(($entries) => {
        if ($entries.length > 0) {
          // Test first entry
          cy.get('[data-testid^="availability-entry-"]:first')
            .should('be.visible')
            .within(() => {
              cy.get('[data-testid="entry-time"]').should('be.visible');
              cy.get('[data-testid="entry-type"]').should('be.visible');
              cy.get('[data-testid="entry-actions"]').should('be.visible');
            });
        }
      });
    });

    it('should handle empty availability state', () => {
      // Mock empty response
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: { availability: [] }
      }).as('getEmptyAvailability');

      cy.reload();
      cy.wait('@getEmptyAvailability');

      cy.get('[data-testid="empty-availability-state"]')
        .should('be.visible')
        .and('contain.text', /no availability|empty/i);
      cy.get('[data-testid="add-first-availability"]')
        .should('be.visible')
        .and('contain.text', /add|create/i);
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="calendar-grid"]').focus();
      
      // Arrow key navigation
      cy.get('body').type('{rightarrow}');
      cy.get('.calendar-day.focused').should('exist');
      
      cy.get('body').type('{leftarrow}');
      cy.get('.calendar-day.focused').should('exist');
      
      cy.get('body').type('{downarrow}');
      cy.get('.calendar-day.focused').should('exist');
      
      cy.get('body').type('{uparrow}');
      cy.get('.calendar-day.focused').should('exist');
    });
  });

  describe('Create Availability Modal', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAvailability');
      cy.get('[data-testid="add-availability-button"]').click();
    });

    it('should display complete create availability form', () => {
      // Modal container
      cy.get('[data-testid="create-availability-modal"]')
        .should('be.visible');
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', /add|create.*availability/i);

      // Form fields
      cy.get('[data-testid="availability-form"]').within(() => {
        // Date fields
        cy.get('[data-testid="input-start-date"]')
          .should('be.visible')
          .and('have.attr', 'type', 'date')
          .and('have.attr', 'required');
        cy.get('[data-testid="input-end-date"]')
          .should('be.visible')
          .and('have.attr', 'type', 'date')
          .and('have.attr', 'required');

        // Availability type
        cy.get('[data-testid="select-availability-type"]')
          .should('be.visible');

        // Time fields (conditional)
        cy.get('[data-testid="input-start-time"]').should('exist');
        cy.get('[data-testid="input-end-time"]').should('exist');

        // Day of week selector
        cy.get('[data-testid="select-day-of-week"]').should('exist');

        // Recurring options
        cy.get('[data-testid="checkbox-is-recurring"]').should('be.visible');

        // Notes
        cy.get('[data-testid="textarea-notes"]')
          .should('be.visible')
          .and('have.attr', 'maxlength');
      });

      // Action buttons
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
      cy.get('[data-testid="button-save"]')
        .should('be.visible')
        .and('contain.text', /save|add/i);
    });

    it('should validate required fields', () => {
      // Try to save without required fields
      cy.get('[data-testid="button-save"]').click();

      // Check for validation messages
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      cy.get('[data-testid="error-availability-type"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      // Modal should remain open
      cy.get('[data-testid="create-availability-modal"]')
        .should('be.visible');
    });

    it('should validate date range logic', () => {
      // Set end date before start date
      cy.get('[data-testid="input-start-date"]').type('2024-12-15');
      cy.get('[data-testid="input-end-date"]').type('2024-12-10');
      cy.get('[data-testid="select-availability-type"]').select('available');

      cy.get('[data-testid="button-save"]').click();

      // Check for date validation error
      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', /end date.*after.*start date/i);
    });

    it('should validate time range for available slots', () => {
      const { valid } = testData.availability;

      // Fill form with available type
      cy.get('[data-testid="input-start-date"]').type(valid.startDate);
      cy.get('[data-testid="input-end-date"]').type(valid.endDate);
      cy.get('[data-testid="select-availability-type"]').select('available');
      cy.get('[data-testid="select-day-of-week"]').select(valid.dayOfWeek);

      // Set end time before start time
      cy.get('[data-testid="input-start-time"]').type('17:00');
      cy.get('[data-testid="input-end-time"]').type('09:00');

      cy.get('[data-testid="button-save"]').click();

      // Check for time validation error
      cy.get('[data-testid="error-time-range"]')
        .should('be.visible')
        .and('contain.text', /end time.*after.*start time/i);
    });

    it('should handle availability type changes', () => {
      // Select 'available' type
      cy.get('[data-testid="select-availability-type"]').select('available');

      // Time fields should be visible and required
      cy.get('[data-testid="input-start-time"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-end-time"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('[data-testid="select-day-of-week"]')
        .should('be.visible')
        .and('have.attr', 'required');

      // Select 'unavailable' type
      cy.get('[data-testid="select-availability-type"]').select('unavailable');

      // Time fields should be hidden or optional
      cy.get('[data-testid="input-start-time"]')
        .should('not.have.attr', 'required');
      cy.get('[data-testid="input-end-time"]')
        .should('not.have.attr', 'required');
    });

    it('should handle recurring availability options', () => {
      // Enable recurring
      cy.get('[data-testid="checkbox-is-recurring"]').check();

      // Recurring options should appear
      cy.get('[data-testid="select-recurring-pattern"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-recurring-end-date"]')
        .should('be.visible');

      // Test different patterns
      cy.get('[data-testid="select-recurring-pattern"]').select('weekly');
      cy.get('[data-testid="recurring-weekly-options"]').should('be.visible');

      cy.get('[data-testid="select-recurring-pattern"]').select('monthly');
      cy.get('[data-testid="recurring-monthly-options"]').should('be.visible');

      // Disable recurring
      cy.get('[data-testid="checkbox-is-recurring"]').uncheck();
      cy.get('[data-testid="select-recurring-pattern"]')
        .should('not.be.visible');
    });

    it('should successfully create basic availability', () => {
      const { valid } = testData.availability;

      // Fill form with valid data
      cy.get('[data-testid="input-start-date"]').type(valid.startDate);
      cy.get('[data-testid="input-end-date"]').type(valid.endDate);
      cy.get('[data-testid="select-availability-type"]').select(valid.availabilityType);
      cy.get('[data-testid="select-day-of-week"]').select(valid.dayOfWeek);
      cy.get('[data-testid="input-start-time"]').type(valid.startTime);
      cy.get('[data-testid="input-end-time"]').type(valid.endTime);
      cy.get('[data-testid="textarea-notes"]').type(valid.notes);

      // Mock successful creation
      cy.intercept('POST', testData.apiEndpoints.createAvailability, {
        statusCode: 201,
        body: {
          id: 'new-availability-id',
          ...valid,
          consultantId: testData.consultant.id
        }
      }).as('createAvailabilitySuccess');

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createAvailabilitySuccess');

      // Modal should close
      cy.get('[data-testid="create-availability-modal"]')
        .should('not.exist');

      // Success message should appear
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /availability.*created/i);
    });

    it('should successfully create recurring availability', () => {
      const { recurring } = testData.availability;

      // Fill form with recurring data
      cy.get('[data-testid="input-start-date"]').type(recurring.startDate);
      cy.get('[data-testid="input-end-date"]').type(recurring.endDate);
      cy.get('[data-testid="select-availability-type"]').select(recurring.availabilityType);
      cy.get('[data-testid="select-day-of-week"]').select(recurring.dayOfWeek);
      cy.get('[data-testid="input-start-time"]').type(recurring.startTime);
      cy.get('[data-testid="input-end-time"]').type(recurring.endTime);
      cy.get('[data-testid="checkbox-is-recurring"]').check();
      cy.get('[data-testid="select-recurring-pattern"]').select(recurring.recurringPattern);
      cy.get('[data-testid="textarea-notes"]').type(recurring.notes);

      // Mock successful creation
      cy.intercept('POST', testData.apiEndpoints.createAvailability, {
        statusCode: 201,
        body: {
          id: 'new-recurring-availability-id',
          ...recurring,
          consultantId: testData.consultant.id
        }
      }).as('createRecurringSuccess');

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createRecurringSuccess');

      // Success confirmation with recurring details
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /recurring.*availability.*created/i);
    });

    it('should handle API creation errors', () => {
      const { valid } = testData.availability;

      // Fill form with valid data
      cy.get('[data-testid="input-start-date"]').type(valid.startDate);
      cy.get('[data-testid="input-end-date"]').type(valid.endDate);
      cy.get('[data-testid="select-availability-type"]').select(valid.availabilityType);
      cy.get('[data-testid="select-day-of-week"]').select(valid.dayOfWeek);
      cy.get('[data-testid="input-start-time"]').type(valid.startTime);
      cy.get('[data-testid="input-end-time"]').type(valid.endTime);

      // Mock API error
      cy.intercept('POST', testData.apiEndpoints.createAvailability, {
        statusCode: 409,
        body: { error: 'Availability conflict detected' }
      }).as('createAvailabilityError');

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createAvailabilityError');

      // Error message should appear
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /conflict/i);

      // Modal should remain open
      cy.get('[data-testid="create-availability-modal"]')
        .should('be.visible');
    });

    it('should cancel creation correctly', () => {
      // Fill some data
      cy.get('[data-testid="input-start-date"]').type('2024-12-01');
      cy.get('[data-testid="textarea-notes"]').type('Some notes');

      // Cancel
      cy.get('[data-testid="button-cancel"]').click();

      // Modal should close
      cy.get('[data-testid="create-availability-modal"]')
        .should('not.exist');

      // No API call should be made
      cy.get('@createAvailability.all').should('have.length', 0);
    });

    it('should handle modal close on escape key', () => {
      cy.get('[data-testid="create-availability-modal"]').type('{esc}');
      cy.get('[data-testid="create-availability-modal"]')
        .should('not.exist');
    });

    it('should handle modal close on overlay click', () => {
      cy.get('[data-testid="modal-overlay"]').click({ force: true });
      cy.get('[data-testid="create-availability-modal"]')
        .should('not.exist');
    });
  });

  describe('Edit Availability Functionality', () => {
    beforeEach(() => {
      // Mock existing availability
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'existing-availability-1',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00',
            availabilityType: 'available',
            notes: 'Regular Monday hours',
            consultantId: testData.consultant.id
          }]
        }
      }).as('getExistingAvailability');

      cy.visit('/availability');
      cy.wait('@getExistingAvailability');
    });

    it('should open edit modal with pre-filled data', () => {
      cy.get('[data-testid="availability-entry-existing-availability-1"]')
        .within(() => {
          cy.get('[data-testid="edit-button"]').click();
        });

      // Modal should open with data
      cy.get('[data-testid="edit-availability-modal"]')
        .should('be.visible');
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', /edit.*availability/i);

      // Fields should be pre-filled
      cy.get('[data-testid="input-start-date"]')
        .should('have.value', '2024-12-01');
      cy.get('[data-testid="input-end-date"]')
        .should('have.value', '2024-12-31');
      cy.get('[data-testid="select-availability-type"]')
        .should('have.value', 'available');
      cy.get('[data-testid="select-day-of-week"]')
        .should('have.value', 'monday');
      cy.get('[data-testid="input-start-time"]')
        .should('have.value', '09:00');
      cy.get('[data-testid="input-end-time"]')
        .should('have.value', '17:00');
      cy.get('[data-testid="textarea-notes"]')
        .should('have.value', 'Regular Monday hours');
    });

    it('should successfully update availability', () => {
      cy.get('[data-testid="availability-entry-existing-availability-1"]')
        .within(() => {
          cy.get('[data-testid="edit-button"]').click();
        });

      // Modify some fields
      cy.get('[data-testid="input-start-time"]').clear().type('08:00');
      cy.get('[data-testid="input-end-time"]').clear().type('16:00');
      cy.get('[data-testid="textarea-notes"]')
        .clear()
        .type('Updated Monday hours');

      // Mock successful update
      cy.intercept('PATCH', '/api/availability/existing-availability-1', {
        statusCode: 200,
        body: {
          id: 'existing-availability-1',
          startTime: '08:00',
          endTime: '16:00',
          notes: 'Updated Monday hours'
        }
      }).as('updateAvailability');

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@updateAvailability');

      // Modal should close
      cy.get('[data-testid="edit-availability-modal"]')
        .should('not.exist');

      // Success message
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /availability.*updated/i);
    });

    it('should handle update validation errors', () => {
      cy.get('[data-testid="availability-entry-existing-availability-1"]')
        .within(() => {
          cy.get('[data-testid="edit-button"]').click();
        });

      // Set invalid time range
      cy.get('[data-testid="input-start-time"]').clear().type('18:00');
      cy.get('[data-testid="input-end-time"]').clear().type('09:00');

      cy.get('[data-testid="button-save"]').click();

      // Validation error should appear
      cy.get('[data-testid="error-time-range"]')
        .should('be.visible')
        .and('contain.text', /end time.*after.*start time/i);
    });

    it('should handle update API errors', () => {
      cy.get('[data-testid="availability-entry-existing-availability-1"]')
        .within(() => {
          cy.get('[data-testid="edit-button"]').click();
        });

      cy.get('[data-testid="textarea-notes"]')
        .clear()
        .type('Updated notes');

      // Mock API error
      cy.intercept('PATCH', '/api/availability/existing-availability-1', {
        statusCode: 409,
        body: { error: 'Schedule conflict detected' }
      }).as('updateError');

      cy.get('[data-testid="button-save"]').click();
      cy.wait('@updateError');

      // Error message should appear
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /conflict/i);
    });
  });

  describe('Delete Availability Functionality', () => {
    beforeEach(() => {
      // Mock existing availability
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'deletable-availability',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            availabilityType: 'available',
            notes: 'To be deleted',
            consultantId: testData.consultant.id
          }]
        }
      }).as('getAvailabilityForDelete');

      cy.visit('/availability');
      cy.wait('@getAvailabilityForDelete');
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .within(() => {
          cy.get('[data-testid="delete-button"]').click();
        });

      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');
      cy.get('[data-testid="confirmation-message"]')
        .should('contain.text', /delete.*availability/i);
      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete/i);
    });

    it('should cancel deletion correctly', () => {
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .within(() => {
          cy.get('[data-testid="delete-button"]').click();
        });

      cy.get('[data-testid="button-cancel-delete"]').click();

      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');

      // Entry should still exist
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .should('exist');
    });

    it('should successfully delete availability', () => {
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .within(() => {
          cy.get('[data-testid="delete-button"]').click();
        });

      // Mock successful deletion
      cy.intercept('DELETE', '/api/availability/deletable-availability', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAvailabilitySuccess');

      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteAvailabilitySuccess');

      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');

      // Success message
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /availability.*deleted/i);

      // Entry should be removed from list
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .should('not.exist');
    });

    it('should handle deletion API errors', () => {
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .within(() => {
          cy.get('[data-testid="delete-button"]').click();
        });

      // Mock API error
      cy.intercept('DELETE', '/api/availability/deletable-availability', {
        statusCode: 409,
        body: { error: 'Cannot delete availability with existing assignments' }
      }).as('deleteError');

      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteError');

      // Error message should appear
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /cannot delete/i);

      // Entry should still exist
      cy.get('[data-testid="availability-entry-deletable-availability"]')
        .should('exist');
    });

    it('should handle bulk deletion', () => {
      // Mock multiple availability entries
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [
            { id: 'bulk-1', availabilityType: 'available', notes: 'Bulk 1' },
            { id: 'bulk-2', availabilityType: 'available', notes: 'Bulk 2' },
            { id: 'bulk-3', availabilityType: 'available', notes: 'Bulk 3' }
          ]
        }
      }).as('getBulkAvailability');

      cy.reload();
      cy.wait('@getBulkAvailability');

      // Select multiple entries
      cy.get('[data-testid="select-bulk-1"]').check();
      cy.get('[data-testid="select-bulk-2"]').check();

      // Bulk delete button should appear
      cy.get('[data-testid="bulk-delete-button"]')
        .should('be.visible')
        .and('contain.text', /delete selected/i)
        .click();

      // Bulk confirmation dialog
      cy.get('[data-testid="bulk-delete-confirmation"]')
        .should('be.visible')
        .and('contain.text', /delete.*2.*availability/i);

      // Mock successful bulk deletion
      cy.intercept('DELETE', '/api/availability/bulk', {
        statusCode: 200,
        body: { deletedCount: 2 }
      }).as('bulkDelete');

      cy.get('[data-testid="button-confirm-bulk-delete"]').click();
      cy.wait('@bulkDelete');

      // Success message
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /2.*availability.*deleted/i);
    });
  });

  describe('Availability Filters and Search', () => {
    beforeEach(() => {
      // Mock availability data with various types
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [
            {
              id: 'available-1',
              availabilityType: 'available',
              dayOfWeek: 'monday',
              startTime: '09:00',
              endTime: '17:00',
              notes: 'Regular Monday hours'
            },
            {
              id: 'unavailable-1',
              availabilityType: 'unavailable',
              startDate: '2024-12-15',
              endDate: '2024-12-16',
              notes: 'Personal time off'
            },
            {
              id: 'tentative-1',
              availabilityType: 'tentative',
              dayOfWeek: 'friday',
              startTime: '10:00',
              endTime: '14:00',
              notes: 'Flexible Friday'
            }
          ]
        }
      }).as('getFilterableAvailability');

      cy.visit('/availability');
      cy.wait('@getFilterableAvailability');
    });

    it('should display and use availability type filter', () => {
      // Filter controls should be visible
      cy.get('[data-testid="availability-filters"]').should('be.visible');
      cy.get('[data-testid="filter-availability-type"]')
        .should('be.visible');

      // Test filtering by available
      cy.get('[data-testid="filter-availability-type"]').select('available');
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('not.exist');
      cy.get('[data-testid="availability-entry-tentative-1"]')
        .should('not.exist');

      // Test filtering by unavailable
      cy.get('[data-testid="filter-availability-type"]').select('unavailable');
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('not.exist');
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-tentative-1"]')
        .should('not.exist');

      // Test show all
      cy.get('[data-testid="filter-availability-type"]').select('all');
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-tentative-1"]')
        .should('be.visible');
    });

    it('should support date range filtering', () => {
      cy.get('[data-testid="filter-date-range-start"]')
        .should('be.visible')
        .type('2024-12-01');
      cy.get('[data-testid="filter-date-range-end"]')
        .should('be.visible')
        .type('2024-12-14');

      cy.get('[data-testid="button-apply-date-filter"]').click();

      // Only availability within date range should show
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('not.exist'); // This is on 12-15, outside range
    });

    it('should support day of week filtering', () => {
      cy.get('[data-testid="filter-day-of-week"]')
        .should('be.visible')
        .select('monday');

      // Only Monday availability should show
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-tentative-1"]')
        .should('not.exist'); // This is Friday
    });

    it('should support search functionality', () => {
      cy.get('[data-testid="availability-search"]')
        .should('be.visible')
        .type('Regular Monday');

      // Only matching entries should show
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('not.exist');
      cy.get('[data-testid="availability-entry-tentative-1"]')
        .should('not.exist');

      // Test search clear
      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('be.visible');
    });

    it('should combine multiple filters', () => {
      // Apply multiple filters
      cy.get('[data-testid="filter-availability-type"]').select('available');
      cy.get('[data-testid="filter-day-of-week"]').select('monday');
      cy.get('[data-testid="availability-search"]').type('Regular');

      // Only entries matching all criteria should show
      cy.get('[data-testid="availability-entry-available-1"]')
        .should('be.visible');
      cy.get('[data-testid="availability-entry-unavailable-1"]')
        .should('not.exist');
      cy.get('[data-testid="availability-entry-tentative-1"]')
        .should('not.exist');
    });

    it('should show no results state when filters match nothing', () => {
      cy.get('[data-testid="availability-search"]').type('NonexistentText');

      cy.get('[data-testid="no-results-state"]')
        .should('be.visible')
        .and('contain.text', /no availability.*found/i);
      cy.get('[data-testid="clear-filters-button"]')
        .should('be.visible')
        .and('contain.text', /clear.*filters/i);
    });

    it('should clear all filters correctly', () => {
      // Apply filters
      cy.get('[data-testid="filter-availability-type"]').select('available');
      cy.get('[data-testid="filter-day-of-week"]').select('monday');
      cy.get('[data-testid="availability-search"]').type('test');

      // Clear all filters
      cy.get('[data-testid="clear-all-filters"]').click();

      // All filter inputs should be reset
      cy.get('[data-testid="filter-availability-type"]')
        .should('have.value', 'all');
      cy.get('[data-testid="filter-day-of-week"]')
        .should('have.value', '');
      cy.get('[data-testid="availability-search"]')
        .should('have.value', '');

      // All entries should be visible
      cy.get('[data-testid^="availability-entry-"]')
        .should('have.length', 3);
    });
  });

  describe('Consultant-Specific Availability View', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/availability`).as('getConsultantAvailability');
      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getConsultantAvailability');
    });

    it('should display consultant-specific availability page', () => {
      // Page should show consultant context
      cy.get('[data-testid="consultant-availability-header"]')
        .should('be.visible');
      cy.get('[data-testid="consultant-name"]')
        .should('contain.text', testData.consultant.name);

      // Should have same calendar functionality
      cy.get('[data-testid="calendar-grid"]').should('be.visible');
      cy.get('[data-testid="add-availability-button"]').should('be.visible');
    });

    it('should restrict edit/delete based on permissions', () => {
      // Mock consultant availability data
      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/availability`, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'consultant-availability-1',
            consultantId: testData.consultant.id,
            availabilityType: 'available',
            notes: 'Consultant availability'
          }]
        }
      }).as('getConsultantAvailabilityData');

      cy.reload();
      cy.wait('@getConsultantAvailabilityData');

      cy.get('[data-testid="availability-entry-consultant-availability-1"]')
        .within(() => {
          // Check if edit/delete buttons are visible based on user permissions
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="edit-button"]').length > 0) {
              cy.get('[data-testid="edit-button"]').should('be.visible');
            }
            if ($body.find('[data-testid="delete-button"]').length > 0) {
              cy.get('[data-testid="delete-button"]').should('be.visible');
            }
          });
        });
    });
  });

  describe('Availability Integration with Scheduling', () => {
    it('should show schedule conflicts in availability view', () => {
      // Mock availability with schedule conflicts
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'conflicted-availability',
            availabilityType: 'available',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00',
            hasScheduleConflict: true,
            conflictDetails: 'Overlaps with Project Alpha schedule'
          }]
        }
      }).as('getConflictedAvailability');

      cy.visit('/availability');
      cy.wait('@getConflictedAvailability');

      // Conflict indicator should be visible
      cy.get('[data-testid="availability-entry-conflicted-availability"]')
        .within(() => {
          cy.get('[data-testid="conflict-indicator"]')
            .should('be.visible')
            .and('have.class', 'warning');
          cy.get('[data-testid="conflict-tooltip"]')
            .should('contain.text', 'Project Alpha');
        });
    });

    it('should prevent deletion of availability with active assignments', () => {
      // Mock availability with active assignments
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'assigned-availability',
            availabilityType: 'available',
            hasActiveAssignments: true,
            assignmentCount: 3
          }]
        }
      }).as('getAssignedAvailability');

      cy.visit('/availability');
      cy.wait('@getAssignedAvailability');

      cy.get('[data-testid="availability-entry-assigned-availability"]')
        .within(() => {
          cy.get('[data-testid="delete-button"]').click();
        });

      // Should show warning about active assignments
      cy.get('[data-testid="delete-warning-dialog"]')
        .should('be.visible')
        .and('contain.text', /active assignments/i)
        .and('contain.text', '3');

      // Should provide options to handle assignments
      cy.get('[data-testid="handle-assignments-option"]')
        .should('be.visible');
    });

    it('should show utilization metrics for availability periods', () => {
      // Mock availability with utilization data
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'utilized-availability',
            availabilityType: 'available',
            utilizationRate: 0.75,
            totalHours: 40,
            scheduledHours: 30,
            availableHours: 10
          }]
        }
      }).as('getUtilizedAvailability');

      cy.visit('/availability');
      cy.wait('@getUtilizedAvailability');

      cy.get('[data-testid="availability-entry-utilized-availability"]')
        .within(() => {
          cy.get('[data-testid="utilization-meter"]')
            .should('be.visible')
            .and('have.attr', 'data-utilization', '75');
          cy.get('[data-testid="utilization-details"]')
            .should('contain.text', '30/40 hours scheduled');
        });
    });
  });

  describe('Availability Notifications and Alerts', () => {
    it('should show notifications for availability gaps', () => {
      // Mock availability with gaps
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [],
          notifications: [{
            type: 'warning',
            message: 'No availability set for next week',
            actionUrl: '/availability/add'
          }]
        }
      }).as('getAvailabilityWithGaps');

      cy.visit('/availability');
      cy.wait('@getAvailabilityWithGaps');

      // Notification should be visible
      cy.get('[data-testid="availability-notification"]')
        .should('be.visible')
        .and('contain.text', /no availability.*next week/i);
      cy.get('[data-testid="notification-action"]')
        .should('be.visible')
        .and('contain.text', /add availability/i);
    });

    it('should show alerts for conflicting availability', () => {
      // Mock conflicting availability
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [],
          alerts: [{
            type: 'error',
            message: 'Conflicting availability detected for Dec 15-16',
            severity: 'high'
          }]
        }
      }).as('getConflictingAvailability');

      cy.visit('/availability');
      cy.wait('@getConflictingAvailability');

      // Alert should be visible
      cy.get('[data-testid="availability-alert"]')
        .should('be.visible')
        .and('have.class', 'error')
        .and('contain.text', /conflicting.*Dec 15-16/i);
    });
  });

  describe('Responsive Design and Mobile Support', () => {
    it('should adapt calendar view for mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/availability');
      cy.wait('@getAvailability');

      // Mobile-specific calendar view
      cy.get('[data-testid="mobile-calendar"]').should('be.visible');
      cy.get('[data-testid="calendar-grid"]')
        .should('have.class', 'mobile-view');

      // Mobile navigation controls
      cy.get('[data-testid="mobile-date-picker"]').should('be.visible');
      cy.get('[data-testid="mobile-view-toggle"]').should('be.visible');
    });

    it('should provide mobile-optimized form interface', () => {
      cy.viewport('iphone-x');
      cy.visit('/availability');
      cy.get('[data-testid="add-availability-button"]').click();

      // Mobile form layout
      cy.get('[data-testid="mobile-form-container"]')
        .should('be.visible');
      cy.get('[data-testid="form-step-indicator"]')
        .should('be.visible');

      // Touch-friendly inputs
      cy.get('[data-testid="input-start-date"]')
        .should('have.css', 'min-height', '44px'); // Touch target size
    });

    it('should support swipe gestures for calendar navigation', () => {
      cy.viewport('iphone-x');
      cy.visit('/availability');
      cy.wait('@getAvailability');

      // Swipe left for next month
      cy.get('[data-testid="calendar-grid"]')
        .trigger('touchstart', { touches: [{ clientX: 200, clientY: 200 }] })
        .trigger('touchmove', { touches: [{ clientX: 50, clientY: 200 }] })
        .trigger('touchend');

      // Calendar should navigate
      cy.get('[data-testid="current-month-year"]')
        .should('be.visible');
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should support keyboard navigation', () => {
      // Tab through calendar controls
      cy.get('[data-testid="calendar-prev-button"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'calendar-prev-button');
      
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'calendar-next-button');
      
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'calendar-today-button');

      // Enter key should activate buttons
      cy.get('[data-testid="add-availability-button"]').focus();
      cy.focused().type('{enter}');
      cy.get('[data-testid="create-availability-modal"]')
        .should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      // Calendar accessibility
      cy.get('[data-testid="calendar-grid"]')
        .should('have.attr', 'role', 'grid')
        .and('have.attr', 'aria-label');

      // Buttons accessibility
      cy.get('[data-testid="add-availability-button"]')
        .should('have.attr', 'aria-label')
        .and('not.have.attr', 'aria-disabled');

      // Navigation controls
      cy.get('[data-testid="calendar-prev-button"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'button');
    });

    it('should support screen reader announcements', () => {
      // Mock availability entry
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: {
          availability: [{
            id: 'accessible-availability',
            availabilityType: 'available',
            startDate: '2024-12-01',
            dayOfWeek: 'monday',
            startTime: '09:00',
            endTime: '17:00'
          }]
        }
      }).as('getAccessibleAvailability');

      cy.reload();
      cy.wait('@getAccessibleAvailability');

      // Availability entry should have proper ARIA description
      cy.get('[data-testid="availability-entry-accessible-availability"]')
        .should('have.attr', 'aria-describedby')
        .and('have.attr', 'role', 'listitem');

      // Description should include relevant details
      cy.get('[data-testid="availability-description"]')
        .should('contain.text', /monday.*9.*am.*5.*pm/i);
    });

    it('should support high contrast mode', () => {
      // Apply high contrast styles
      cy.get('body').invoke('addClass', 'high-contrast');

      // Elements should maintain visibility
      cy.get('[data-testid="calendar-grid"]')
        .should('be.visible')
        .and('have.css', 'border-width')
        .and('not.equal', '0px');

      // Interactive elements should have clear focus indicators
      cy.get('[data-testid="add-availability-button"]')
        .focus()
        .should('have.css', 'outline-width')
        .and('not.equal', '0px');
    });

    it('should announce changes to screen readers', () => {
      // Create new availability
      cy.get('[data-testid="add-availability-button"]').click();
      
      // Live region should announce modal opening
      cy.get('[data-testid="sr-live-region"]')
        .should('contain.text', /availability.*form.*opened/i);

      // Form validation should be announced
      cy.get('[data-testid="button-save"]').click();
      cy.get('[data-testid="sr-live-region"]')
        .should('contain.text', /validation.*errors/i);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle large availability datasets efficiently', () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `availability-${i}`,
        availabilityType: 'available',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        notes: `Availability entry ${i}`
      }));

      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 200,
        body: { availability: largeDataset }
      }).as('getLargeDataset');

      cy.visit('/availability');
      cy.wait('@getLargeDataset');

      // Should implement pagination or virtual scrolling
      cy.get('[data-testid="pagination-controls"]')
        .should('be.visible');
      cy.get('[data-testid="page-size-selector"]')
        .should('be.visible');

      // Performance should be reasonable
      cy.get('[data-testid^="availability-entry-"]')
        .should('have.length.lessThan', 51); // Not all items rendered at once
    });

    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('GET', testData.apiEndpoints.availability, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getAvailabilityError');

      cy.visit('/availability');
      cy.wait('@getAvailabilityError');

      // Error state should be displayed
      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', /unable to load/i);
      cy.get('[data-testid="retry-button"]')
        .should('be.visible')
        .and('contain.text', /retry/i);
    });

    it('should handle offline scenarios', () => {
      // Simulate offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        win.dispatchEvent(new Event('offline'));
      });

      cy.visit('/availability');

      // Offline state should be displayed
      cy.get('[data-testid="offline-indicator"]')
        .should('be.visible')
        .and('contain.text', /offline/i);
      cy.get('[data-testid="offline-message"]')
        .should('contain.text', /check.*connection/i);
    });

    it('should recover from temporary API failures', () => {
      let callCount = 0;
      
      // Mock intermittent failures
      cy.intercept('GET', testData.apiEndpoints.availability, (req) => {
        callCount++;
        if (callCount <= 2) {
          req.reply({ statusCode: 503, body: { error: 'Service unavailable' } });
        } else {
          req.reply({
            statusCode: 200,
            body: { availability: [] }
          });
        }
      }).as('getIntermittentFailure');

      cy.visit('/availability');
      cy.wait('@getIntermittentFailure');

      // Should show error initially
      cy.get('[data-testid="error-state"]').should('be.visible');

      // Retry should work
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getIntermittentFailure');

      // Should still show error after first retry
      cy.get('[data-testid="error-state"]').should('be.visible');

      // Second retry should succeed
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getIntermittentFailure');

      // Should show successful state
      cy.get('[data-testid="availability-calendar"]').should('be.visible');
    });
  });
});
