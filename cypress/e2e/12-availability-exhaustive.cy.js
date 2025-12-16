describe('Availability System - Exhaustive Tests', () => {
  const testData = {
    availability: {
      valid: {
        date: '2024-12-30',
        startTime: '08:00',
        endTime: '17:00',
        status: 'available',
        notes: 'Available for regular shift',
        location: 'Remote',
        timezone: 'America/New_York'
      },
      invalid: {
        invalidDate: '2023-01-01', // Past date
        invalidTimeRange: {
          startTime: '17:00',
          endTime: '08:00' // End before start
        },
        missingRequired: {
          date: '',
          startTime: '',
          endTime: ''
        }
      },
      bulk: [
        {
          date: '2024-12-31',
          startTime: '09:00',
          endTime: '18:00',
          status: 'available',
          notes: 'New Year Eve availability'
        },
        {
          date: '2025-01-01',
          startTime: '10:00',
          endTime: '16:00',
          status: 'limited',
          notes: 'New Year Day - limited hours'
        }
      ]
    },
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    timeRanges: {
      morning: { start: '06:00', end: '12:00' },
      afternoon: { start: '12:00', end: '18:00' },
      evening: { start: '18:00', end: '23:59' },
      overnight: { start: '00:00', end: '06:00' }
    },
    statuses: ['available', 'limited', 'unavailable', 'tentative'],
    locations: ['On-site', 'Remote', 'Hybrid', 'Travel Required']
  };

  const apiEndpoints = {
    availability: '/api/availability',
    consultantAvailability: (consultantId) => `/api/consultants/${consultantId}/availability`,
    deleteAvailability: (id) => `/api/availability/${id}`,
    consultants: '/api/consultants'
  };

  beforeEach(() => {
    cy.loginAsTestUser();
  });

  describe('Availability Management Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.visit('/availability');
    });

    it('should display complete availability page layout', () => {
      // Page header and title
      cy.get('[data-testid="availability-page"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', /availability/i);

      // Main components
      cy.get('[data-testid="availability-calendar"]', { timeout: 5000 })
        .should('be.visible');
      
      cy.get('[data-testid="availability-list"]')
        .should('be.visible');

      // Action buttons
      cy.get('[data-testid="add-availability-button"]')
        .should('be.visible')
        .and('not.be.disabled');

      // Filter and search components
      cy.get('[data-testid="availability-filters"]')
        .should('be.visible');
    });

    it('should display calendar with proper navigation controls', () => {
      // Calendar navigation
      cy.get('[data-testid="calendar-prev-button"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      cy.get('[data-testid="calendar-next-button"]')
        .should('be.visible')
        .and('not.be.disabled');

      cy.get('[data-testid="calendar-today-button"]')
        .should('be.visible');

      // Month/year display
      cy.get('[data-testid="calendar-month-year"]')
        .should('be.visible')
        .and('not.be.empty');

      // View toggle buttons
      cy.get('[data-testid="calendar-view-month"]')
        .should('be.visible');
      
      cy.get('[data-testid="calendar-view-week"]')
        .should('be.visible');

      cy.get('[data-testid="calendar-view-day"]')
        .should('be.visible');
    });

    it('should display availability list with proper columns', () => {
      // Table headers
      const expectedColumns = ['Date', 'Time', 'Status', 'Location', 'Notes', 'Actions'];
      
      expectedColumns.forEach(column => {
        cy.get('[data-testid="availability-table"]')
          .should('contain.text', column);
      });

      // Sort functionality
      cy.get('[data-testid="sort-date"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-testid="sort-date"]')
        .should('have.class', /sorted|active/);
    });

    it('should have proper filter controls', () => {
      // Status filter
      cy.get('[data-testid="filter-status"]')
        .should('be.visible')
        .click();
      
      testData.statuses.forEach(status => {
        cy.get(`[data-testid="status-option-${status}"]`)
          .should('be.visible');
      });

      // Date range filter
      cy.get('[data-testid="filter-date-range"]')
        .should('be.visible');

      // Location filter
      cy.get('[data-testid="filter-location"]')
        .should('be.visible');

      // Search input
      cy.get('[data-testid="search-availability"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
    });
  });

  describe('Add Availability - Form Functionality', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.get('[data-testid="add-availability-button"]').click();
    });

    it('should display complete add availability form', () => {
      cy.get('[data-testid="availability-form"]', { timeout: 5000 })
        .should('be.visible');

      // Required fields
      cy.get('[data-testid="input-date"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-start-time"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-end-time"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="select-status"]')
        .should('be.visible')
        .and('have.attr', 'required');

      // Optional fields
      cy.get('[data-testid="select-location"]')
        .should('be.visible');

      cy.get('[data-testid="textarea-notes"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');

      // Form buttons
      cy.get('[data-testid="button-save-availability"]')
        .should('be.visible')
        .and('be.disabled');

      cy.get('[data-testid="button-cancel-availability"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should successfully create availability with valid data', () => {
      // Mock API call
      cy.intercept('POST', apiEndpoints.consultantAvailability('*'), {
        statusCode: 201,
        body: {
          id: 'availability-1',
          ...testData.availability.valid,
          createdAt: new Date().toISOString()
        }
      }).as('createAvailability');

      // Fill form
      cy.get('[data-testid="input-date"]')
        .type(testData.availability.valid.date);

      cy.get('[data-testid="input-start-time"]')
        .type(testData.availability.valid.startTime);

      cy.get('[data-testid="input-end-time"]')
        .type(testData.availability.valid.endTime);

      cy.get('[data-testid="select-status"]')
        .click();
      cy.get(`[data-testid="status-option-${testData.availability.valid.status}"]`)
        .click();

      cy.get('[data-testid="select-location"]')
        .click();
      cy.get(`[data-testid="location-option-remote"]`)
        .click();

      cy.get('[data-testid="textarea-notes"]')
        .type(testData.availability.valid.notes);

      // Submit form
      cy.get('[data-testid="button-save-availability"]')
        .should('not.be.disabled')
        .click();

      // Verify API call
      cy.wait('@createAvailability').then((interception) => {
        expect(interception.request.body).to.deep.include({
          date: testData.availability.valid.date,
          startTime: testData.availability.valid.startTime,
          endTime: testData.availability.valid.endTime,
          status: testData.availability.valid.status
        });
      });

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /availability.*added|created/i);

      // Verify form closes
      cy.get('[data-testid="availability-form"]')
        .should('not.exist');
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-save-availability"]')
        .should('be.disabled');

      // Fill date only
      cy.get('[data-testid="input-date"]')
        .type(testData.availability.valid.date);
      
      cy.get('[data-testid="button-save-availability"]')
        .should('be.disabled');

      // Add start time
      cy.get('[data-testid="input-start-time"]')
        .type(testData.availability.valid.startTime);
      
      cy.get('[data-testid="button-save-availability"]')
        .should('be.disabled');

      // Add end time
      cy.get('[data-testid="input-end-time"]')
        .type(testData.availability.valid.endTime);
      
      cy.get('[data-testid="button-save-availability"]')
        .should('be.disabled');

      // Add status - now should be enabled
      cy.get('[data-testid="select-status"]')
        .click();
      cy.get(`[data-testid="status-option-available"]`)
        .click();

      cy.get('[data-testid="button-save-availability"]')
        .should('not.be.disabled');
    });

    it('should validate date and time constraints', () => {
      // Test past date
      cy.get('[data-testid="input-date"]')
        .type(testData.availability.invalid.invalidDate);

      cy.get('[data-testid="input-start-time"]')
        .type(testData.availability.valid.startTime);

      cy.get('[data-testid="input-end-time"]')
        .type(testData.availability.valid.endTime);

      cy.get('[data-testid="select-status"]')
        .click();
      cy.get('[data-testid="status-option-available"]')
        .click();

      cy.get('[data-testid="button-save-availability"]')
        .click();

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /date.*future|past/i);

      // Test invalid time range
      cy.get('[data-testid="input-date"]')
        .clear()
        .type(testData.availability.valid.date);

      cy.get('[data-testid="input-start-time"]')
        .clear()
        .type(testData.availability.invalid.invalidTimeRange.startTime);

      cy.get('[data-testid="input-end-time"]')
        .clear()
        .type(testData.availability.invalid.invalidTimeRange.endTime);

      cy.get('[data-testid="button-save-availability"]')
        .click();

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /end time.*start time/i);
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('POST', apiEndpoints.consultantAvailability('*'), {
        statusCode: 400,
        body: {
          error: 'Availability conflicts with existing schedule'
        }
      }).as('createAvailabilityError');

      // Fill valid form
      cy.get('[data-testid="input-date"]')
        .type(testData.availability.valid.date);

      cy.get('[data-testid="input-start-time"]')
        .type(testData.availability.valid.startTime);

      cy.get('[data-testid="input-end-time"]')
        .type(testData.availability.valid.endTime);

      cy.get('[data-testid="select-status"]')
        .click();
      cy.get('[data-testid="status-option-available"]')
        .click();

      cy.get('[data-testid="button-save-availability"]')
        .click();

      cy.wait('@createAvailabilityError');

      // Verify error display
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /conflicts|error/i);

      // Form should remain open
      cy.get('[data-testid="availability-form"]')
        .should('be.visible');
    });

    it('should support bulk availability creation', () => {
      // Check if bulk option exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bulk-availability-toggle"]').length > 0) {
          cy.get('[data-testid="bulk-availability-toggle"]')
            .click();

          cy.get('[data-testid="bulk-date-range"]')
            .should('be.visible');

          cy.get('[data-testid="bulk-days-selector"]')
            .should('be.visible');

          // Select multiple days
          ['monday', 'tuesday', 'wednesday'].forEach(day => {
            cy.get(`[data-testid="day-${day}"]`)
              .click();
          });

          // Set common time and status
          cy.get('[data-testid="input-start-time"]')
            .type(testData.availability.valid.startTime);

          cy.get('[data-testid="input-end-time"]')
            .type(testData.availability.valid.endTime);

          cy.get('[data-testid="select-status"]')
            .click();
          cy.get('[data-testid="status-option-available"]')
            .click();

          cy.intercept('POST', apiEndpoints.consultantAvailability('*'), {
            statusCode: 201,
            body: { success: true, created: 3 }
          }).as('createBulkAvailability');

          cy.get('[data-testid="button-save-availability"]')
            .click();

          cy.wait('@createBulkAvailability');

          cy.get('[data-testid="success-message"]')
            .should('contain.text', /3.*created/i);
        }
      });
    });
  });

  describe('Availability List - Display and Interaction', () => {
    beforeEach(() => {
      // Mock availability data
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'avail-1',
              date: '2024-12-30',
              startTime: '08:00',
              endTime: '17:00',
              status: 'available',
              location: 'Remote',
              notes: 'Available for regular shift',
              createdAt: '2024-12-20T10:00:00Z'
            },
            {
              id: 'avail-2',
              date: '2024-12-31',
              startTime: '09:00',
              endTime: '18:00',
              status: 'limited',
              location: 'On-site',
              notes: 'Limited availability',
              createdAt: '2024-12-20T11:00:00Z'
            }
          ],
          meta: {
            total: 2,
            page: 1,
            limit: 10
          }
        }
      }).as('getAvailability');

      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should display availability entries correctly', () => {
      // Check table rows
      cy.get('[data-testid="availability-row-avail-1"]')
        .should('be.visible');

      cy.get('[data-testid="availability-row-avail-2"]')
        .should('be.visible');

      // Check data display
      cy.get('[data-testid="availability-row-avail-1"]')
        .within(() => {
          cy.get('[data-testid="date-cell"]')
            .should('contain.text', '2024-12-30');
          
          cy.get('[data-testid="time-cell"]')
            .should('contain.text', '08:00 - 17:00');
          
          cy.get('[data-testid="status-cell"]')
            .should('contain.text', 'available');
          
          cy.get('[data-testid="location-cell"]')
            .should('contain.text', 'Remote');
          
          cy.get('[data-testid="notes-cell"]')
            .should('contain.text', 'Available for regular shift');
        });
    });

    it('should support status filtering', () => {
      // Open status filter
      cy.get('[data-testid="filter-status"]')
        .click();

      // Select 'available' status
      cy.get('[data-testid="status-option-available"]')
        .click();

      // Mock filtered results
      cy.intercept('GET', apiEndpoints.availability + '?status=available', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'avail-1',
              date: '2024-12-30',
              startTime: '08:00',
              endTime: '17:00',
              status: 'available',
              location: 'Remote',
              notes: 'Available for regular shift'
            }
          ],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getFilteredAvailability');

      cy.wait('@getFilteredAvailability');

      // Should only show available entries
      cy.get('[data-testid="availability-row-avail-1"]')
        .should('be.visible');
      
      cy.get('[data-testid="availability-row-avail-2"]')
        .should('not.exist');
    });

    it('should support date range filtering', () => {
      cy.get('[data-testid="filter-date-range"]')
        .click();

      // Set date range
      cy.get('[data-testid="date-range-start"]')
        .type('2024-12-30');

      cy.get('[data-testid="date-range-end"]')
        .type('2024-12-30');

      cy.get('[data-testid="apply-date-filter"]')
        .click();

      // Mock filtered results
      cy.intercept('GET', apiEndpoints.availability + '?startDate=2024-12-30&endDate=2024-12-30', {
        statusCode: 200,
        body: {
          data: [{
            id: 'avail-1',
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available',
            location: 'Remote',
            notes: 'Available for regular shift'
          }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getDateFilteredAvailability');

      cy.wait('@getDateFilteredAvailability');

      cy.get('[data-testid="availability-row-avail-1"]')
        .should('be.visible');
    });

    it('should support search functionality', () => {
      cy.get('[data-testid="search-availability"]')
        .type('Remote');

      // Mock search results
      cy.intercept('GET', apiEndpoints.availability + '?search=Remote', {
        statusCode: 200,
        body: {
          data: [{
            id: 'avail-1',
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available',
            location: 'Remote',
            notes: 'Available for regular shift'
          }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('searchAvailability');

      cy.wait('@searchAvailability');

      cy.get('[data-testid="availability-row-avail-1"]')
        .should('be.visible');
    });

    it('should handle sorting functionality', () => {
      // Sort by date descending
      cy.get('[data-testid="sort-date"]')
        .click();

      cy.intercept('GET', apiEndpoints.availability + '?sortBy=date&sortOrder=desc', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'avail-2',
              date: '2024-12-31',
              startTime: '09:00',
              endTime: '18:00',
              status: 'limited',
              location: 'On-site',
              notes: 'Limited availability'
            },
            {
              id: 'avail-1',
              date: '2024-12-30',
              startTime: '08:00',
              endTime: '17:00',
              status: 'available',
              location: 'Remote',
              notes: 'Available for regular shift'
            }
          ],
          meta: { total: 2, page: 1, limit: 10 }
        }
      }).as('getSortedAvailability');

      cy.wait('@getSortedAvailability');

      // Check order
      cy.get('[data-testid="availability-table"] tbody tr:first-child')
        .should('contain.text', '2024-12-31');
    });
  });

  describe('Edit Availability Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [{
            id: 'avail-1',
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available',
            location: 'Remote',
            notes: 'Available for regular shift'
          }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getAvailability');

      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should open edit form with pre-filled data', () => {
      cy.get('[data-testid="edit-availability-avail-1"]')
        .click();

      cy.get('[data-testid="availability-form"]')
        .should('be.visible');

      // Check pre-filled values
      cy.get('[data-testid="input-date"]')
        .should('have.value', '2024-12-30');

      cy.get('[data-testid="input-start-time"]')
        .should('have.value', '08:00');

      cy.get('[data-testid="input-end-time"]')
        .should('have.value', '17:00');

      cy.get('[data-testid="select-status"]')
        .should('contain.text', 'available');

      cy.get('[data-testid="textarea-notes"]')
        .should('have.value', 'Available for regular shift');
    });

    it('should successfully update availability', () => {
      cy.intercept('PATCH', '/api/availability/avail-1', {
        statusCode: 200,
        body: {
          id: 'avail-1',
          date: '2024-12-30',
          startTime: '09:00',
          endTime: '18:00',
          status: 'limited',
          location: 'On-site',
          notes: 'Updated availability'
        }
      }).as('updateAvailability');

      cy.get('[data-testid="edit-availability-avail-1"]')
        .click();

      // Update fields
      cy.get('[data-testid="input-start-time"]')
        .clear()
        .type('09:00');

      cy.get('[data-testid="input-end-time"]')
        .clear()
        .type('18:00');

      cy.get('[data-testid="select-status"]')
        .click();
      cy.get('[data-testid="status-option-limited"]')
        .click();

      cy.get('[data-testid="select-location"]')
        .click();
      cy.get('[data-testid="location-option-on-site"]')
        .click();

      cy.get('[data-testid="textarea-notes"]')
        .clear()
        .type('Updated availability');

      cy.get('[data-testid="button-save-availability"]')
        .click();

      cy.wait('@updateAvailability').then((interception) => {
        expect(interception.request.body).to.include({
          startTime: '09:00',
          endTime: '18:00',
          status: 'limited',
          notes: 'Updated availability'
        });
      });

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated/i);
    });
  });

  describe('Delete Availability Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [{
            id: 'avail-1',
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available',
            location: 'Remote',
            notes: 'Available for regular shift'
          }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getAvailability');

      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should show confirmation dialog before deletion', () => {
      cy.get('[data-testid="delete-availability-avail-1"]')
        .click();

      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');

      cy.get('[data-testid="confirm-delete-message"]')
        .should('contain.text', /delete.*availability/i);

      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible');

      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible');
    });

    it('should successfully delete availability', () => {
      cy.intercept('DELETE', apiEndpoints.deleteAvailability('avail-1'), {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAvailability');

      cy.get('[data-testid="delete-availability-avail-1"]')
        .click();

      cy.get('[data-testid="button-confirm-delete"]')
        .click();

      cy.wait('@deleteAvailability');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted/i);

      // Row should be removed
      cy.get('[data-testid="availability-row-avail-1"]')
        .should('not.exist');
    });

    it('should handle delete cancellation', () => {
      cy.get('[data-testid="delete-availability-avail-1"]')
        .click();

      cy.get('[data-testid="button-cancel-delete"]')
        .click();

      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');

      // Row should still exist
      cy.get('[data-testid="availability-row-avail-1"]')
        .should('be.visible');
    });
  });

  describe('Calendar View Integration', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'avail-1',
              date: '2024-12-30',
              startTime: '08:00',
              endTime: '17:00',
              status: 'available',
              location: 'Remote',
              notes: 'Available for regular shift'
            },
            {
              id: 'avail-2',
              date: '2024-12-31',
              startTime: '09:00',
              endTime: '18:00',
              status: 'limited',
              location: 'On-site',
              notes: 'Limited availability'
            }
          ],
          meta: { total: 2, page: 1, limit: 10 }
        }
      }).as('getAvailability');

      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should display availability on calendar', () => {
      // Check if calendar events exist
      cy.get('[data-testid="calendar-event-avail-1"]')
        .should('be.visible')
        .and('contain.text', /08:00|available/i);

      cy.get('[data-testid="calendar-event-avail-2"]')
        .should('be.visible')
        .and('contain.text', /09:00|limited/i);
    });

    it('should allow quick availability creation by clicking calendar date', () => {
      // Click on empty date
      cy.get('[data-testid="calendar-date-2025-01-01"]')
        .click();

      cy.get('[data-testid="availability-form"]')
        .should('be.visible');

      // Date should be pre-filled
      cy.get('[data-testid="input-date"]')
        .should('have.value', '2025-01-01');
    });

    it('should show availability details on calendar event hover', () => {
      cy.get('[data-testid="calendar-event-avail-1"]')
        .trigger('mouseover');

      cy.get('[data-testid="availability-tooltip"]')
        .should('be.visible')
        .and('contain.text', '08:00 - 17:00')
        .and('contain.text', 'Available')
        .and('contain.text', 'Remote');
    });

    it('should navigate calendar months and update data', () => {
      // Mock next month data
      cy.intercept('GET', apiEndpoints.availability + '?month=1&year=2025', {
        statusCode: 200,
        body: {
          data: [],
          meta: { total: 0, page: 1, limit: 10 }
        }
      }).as('getNextMonthAvailability');

      cy.get('[data-testid="calendar-next-button"]')
        .click();

      cy.wait('@getNextMonthAvailability');

      // Should show January 2025
      cy.get('[data-testid="calendar-month-year"]')
        .should('contain.text', 'January 2025');
    });
  });

  describe('Consultant Availability Profile', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantAvailability(testData.consultant.id), {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'avail-1',
              date: '2024-12-30',
              startTime: '08:00',
              endTime: '17:00',
              status: 'available',
              location: 'Remote',
              notes: 'Available for regular shift'
            }
          ],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getConsultantAvailability');

      cy.visit(`/consultants/${testData.consultant.id}/availability`);
      cy.wait('@getConsultantAvailability');
    });

    it('should display consultant-specific availability page', () => {
      cy.get('[data-testid="consultant-availability-page"]')
        .should('be.visible');

      cy.get('[data-testid="consultant-name"]')
        .should('contain.text', testData.consultant.name);

      cy.get('[data-testid="availability-summary"]')
        .should('be.visible');
    });

    it('should show availability statistics', () => {
      cy.get('[data-testid="availability-stats"]')
        .should('be.visible');

      // Check stats cards
      cy.get('[data-testid="stat-total-hours"]')
        .should('be.visible')
        .and('contain.text', /hours/i);

      cy.get('[data-testid="stat-available-days"]')
        .should('be.visible')
        .and('contain.text', /available/i);

      cy.get('[data-testid="stat-response-rate"]')
        .should('be.visible')
        .and('contain.text', /%/);
    });

    it('should allow filtering by time period', () => {
      // Weekly view
      cy.get('[data-testid="period-week"]')
        .click();

      cy.intercept('GET', apiEndpoints.consultantAvailability(testData.consultant.id) + '?period=week', {
        statusCode: 200,
        body: {
          data: [/* week data */],
          meta: { total: 0, page: 1, limit: 10 }
        }
      }).as('getWeeklyAvailability');

      cy.wait('@getWeeklyAvailability');

      // Monthly view
      cy.get('[data-testid="period-month"]')
        .click();

      cy.intercept('GET', apiEndpoints.consultantAvailability(testData.consultant.id) + '?period=month', {
        statusCode: 200,
        body: {
          data: [/* month data */],
          meta: { total: 0, page: 1, limit: 10 }
        }
      }).as('getMonthlyAvailability');

      cy.wait('@getMonthlyAvailability');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [{
            id: 'avail-1',
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available',
            location: 'Remote',
            notes: 'Available for regular shift'
          }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getAvailability');
    });

    it('should display properly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/availability');
      cy.wait('@getAvailability');

      // Mobile navigation should be visible
      cy.get('[data-testid="mobile-nav"]')
        .should('be.visible');

      // Calendar should adapt to mobile
      cy.get('[data-testid="availability-calendar"]')
        .should('be.visible')
        .and('have.css', 'width')
        .and('match', /\d+px/);

      // List should be scrollable
      cy.get('[data-testid="availability-list"]')
        .should('be.visible');
    });

    it('should handle mobile form interactions', () => {
      cy.viewport('iphone-x');
      cy.visit('/availability');
      cy.wait('@getAvailability');

      cy.get('[data-testid="add-availability-button"]')
        .click();

      cy.get('[data-testid="availability-form"]')
        .should('be.visible');

      // Form should be properly sized for mobile
      cy.get('[data-testid="input-date"]')
        .should('be.visible')
        .click();

      // Mobile date picker should work
      cy.get('body').should('not.contain', 'error');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getAvailabilityError');

      cy.visit('/availability');
      cy.wait('@getAvailabilityError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error.*loading/i);

      // Retry button should be available
      cy.get('[data-testid="retry-button"]')
        .should('be.visible')
        .click();
    });

    it('should handle empty availability list', () => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [],
          meta: { total: 0, page: 1, limit: 10 }
        }
      }).as('getEmptyAvailability');

      cy.visit('/availability');
      cy.wait('@getEmptyAvailability');

      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', /no availability/i);

      cy.get('[data-testid="empty-state-action"]')
        .should('be.visible')
        .and('contain.text', /add availability/i);
    });

    it('should handle network timeouts', () => {
      cy.intercept('GET', apiEndpoints.availability, {
        forceNetworkError: true
      }).as('getAvailabilityNetworkError');

      cy.visit('/availability');
      cy.wait('@getAvailabilityNetworkError');

      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /network.*error/i);
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [{
            id: 'avail-1',
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available',
            location: 'Remote',
            notes: 'Available for regular shift'
          }],
          meta: { total: 1, page: 1, limit: 10 }
        }
      }).as('getAvailability');

      cy.visit('/availability');
      cy.wait('@getAvailability');
    });

    it('should be keyboard navigable', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'add-availability-button');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-status');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-availability');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="availability-table"]')
        .should('have.attr', 'role', 'table');

      cy.get('[data-testid="add-availability-button"]')
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="search-availability"]')
        .should('have.attr', 'aria-label');
    });

    it('should support screen reader navigation', () => {
      // Check heading structure
      cy.get('h1, h2, h3').each(($heading) => {
        cy.wrap($heading).should('not.be.empty');
      });

      // Check table headers
      cy.get('[data-testid="availability-table"] th').each(($th) => {
        cy.wrap($th).should('have.attr', 'scope', 'col');
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during data fetch', () => {
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: [],
          meta: { total: 0, page: 1, limit: 10 }
        },
        delay: 2000
      }).as('getSlowAvailability');

      cy.visit('/availability');

      // Loading state should be visible
      cy.get('[data-testid="loading-availability"]')
        .should('be.visible');

      cy.get('[data-testid="loading-spinner"]')
        .should('be.visible');

      cy.wait('@getSlowAvailability');

      // Loading state should disappear
      cy.get('[data-testid="loading-availability"]')
        .should('not.exist');
    });

    it('should handle pagination efficiently', () => {
      // Mock paginated data
      cy.intercept('GET', apiEndpoints.availability, {
        statusCode: 200,
        body: {
          data: Array.from({ length: 10 }, (_, i) => ({
            id: `avail-${i + 1}`,
            date: '2024-12-30',
            startTime: '08:00',
            endTime: '17:00',
            status: 'available'
          })),
          meta: { total: 100, page: 1, limit: 10, totalPages: 10 }
        }
      }).as('getPaginatedAvailability');

      cy.visit('/availability');
      cy.wait('@getPaginatedAvailability');

      // Pagination controls should be visible
      cy.get('[data-testid="pagination"]')
        .should('be.visible');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', '1-10 of 100');

      // Test page navigation
      cy.intercept('GET', apiEndpoints.availability + '?page=2', {
        statusCode: 200,
        body: {
          data: Array.from({ length: 10 }, (_, i) => ({
            id: `avail-${i + 11}`,
            date: '2024-12-31',
            startTime: '09:00',
            endTime: '18:00',
            status: 'limited'
          })),
          meta: { total: 100, page: 2, limit: 10, totalPages: 10 }
        }
      }).as('getPage2Availability');

      cy.get('[data-testid="pagination-next"]')
        .click();

      cy.wait('@getPage2Availability');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', '11-20 of 100');
    });
  });
});
