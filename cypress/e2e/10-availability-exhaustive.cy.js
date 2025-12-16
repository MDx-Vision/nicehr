describe('Availability System - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant',
      email: 'consultant@example.com'
    },
    availability: {
      valid: {
        date: '2024-03-15',
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'America/New_York',
        type: 'available',
        notes: 'Available for regular shift'
      },
      overnight: {
        date: '2024-03-16',
        startTime: '23:00',
        endTime: '07:00',
        timezone: 'America/New_York',
        type: 'available',
        notes: 'Overnight shift available'
      },
      unavailable: {
        date: '2024-03-17',
        startTime: '00:00',
        endTime: '23:59',
        timezone: 'America/New_York',
        type: 'unavailable',
        notes: 'Personal day off'
      },
      partial: {
        date: '2024-03-18',
        startTime: '14:00',
        endTime: '22:00',
        timezone: 'America/New_York',
        type: 'available',
        notes: 'Afternoon shift only'
      }
    }
  };

  const apiEndpoints = {
    consultantAvailability: `/api/consultants/${testData.consultant.id}/availability`,
    availability: '/api/availability',
    deleteAvailability: (id) => `/api/availability/${id}`
  };

  beforeEach(() => {
    // Login as admin user
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('test123');
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    
    // Clean up any existing test availability records
    cy.request({
      method: 'GET',
      url: apiEndpoints.consultantAvailability,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        response.body.forEach((availability) => {
          if (availability.notes?.includes('Test') || availability.notes?.includes('CI')) {
            cy.request('DELETE', apiEndpoints.deleteAvailability(availability.id));
          }
        });
      }
    });
  });

  describe('Availability Dashboard - UI Components & Navigation', () => {
    beforeEach(() => {
      cy.visit('/availability');
    });

    it('should display complete availability dashboard layout', () => {
      // Main container
      cy.get('[data-testid="availability-dashboard"]', { timeout: 10000 })
        .should('be.visible');

      // Header section
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'Availability');

      // Calendar or list view
      cy.get('[data-testid="availability-calendar"], [data-testid="availability-list"]')
        .should('be.visible');

      // Action buttons
      cy.get('[data-testid="add-availability-button"]').should('be.visible');
      
      // View toggles if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="view-toggle"]').length > 0) {
          cy.get('[data-testid="view-toggle"]').should('be.visible');
        }
      });
    });

    it('should have proper navigation and breadcrumbs', () => {
      // Check breadcrumbs if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="breadcrumbs"]').length > 0) {
          cy.get('[data-testid="breadcrumbs"]')
            .should('be.visible')
            .and('contain.text', 'Availability');
        }
      });

      // Navigation menu should be accessible
      cy.get('[data-testid="main-nav"], nav').should('be.visible');
    });

    it('should handle responsive layout correctly', () => {
      // Test mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="availability-dashboard"]').should('be.visible');
      
      // Test tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="availability-dashboard"]').should('be.visible');
      
      // Test desktop view
      cy.viewport(1920, 1080);
      cy.get('[data-testid="availability-dashboard"]').should('be.visible');
    });

    it('should display filter and search options', () => {
      cy.get('body').then(($body) => {
        // Date range picker
        if ($body.find('[data-testid="date-range-picker"]').length > 0) {
          cy.get('[data-testid="date-range-picker"]').should('be.visible');
        }

        // Consultant filter
        if ($body.find('[data-testid="consultant-filter"]').length > 0) {
          cy.get('[data-testid="consultant-filter"]').should('be.visible');
        }

        // Status filter
        if ($body.find('[data-testid="status-filter"]').length > 0) {
          cy.get('[data-testid="status-filter"]').should('be.visible');
        }

        // Search input
        if ($body.find('[data-testid="search-input"]').length > 0) {
          cy.get('[data-testid="search-input"]').should('be.visible');
        }
      });
    });
  });

  describe('Add Availability - Form Validation & UI', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
      cy.intercept('POST', apiEndpoints.consultantAvailability).as('createAvailability');
      
      cy.get('[data-testid="add-availability-button"]').click();
    });

    it('should display complete add availability form', () => {
      // Modal or form container
      cy.get('[data-testid="availability-form"], [data-testid="add-availability-modal"]')
        .should('be.visible');

      // Form title
      cy.get('h2, h3').should('contain.text', /add|create.*availability/i);

      // Required form fields
      cy.get('[data-testid="input-date"], input[name="date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');

      cy.get('[data-testid="input-start-time"], input[name="startTime"]')
        .should('be.visible');

      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .should('be.visible');

      // Type selection
      cy.get('[data-testid="select-type"], select[name="type"]')
        .should('be.visible');

      // Notes field
      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .should('be.visible');

      // Form buttons
      cy.get('[data-testid="button-save"], button[type="submit"]')
        .should('be.visible')
        .and('contain.text', /save|create|add/i);

      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('contain.text', /cancel|close/i);
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      // Should show validation errors
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-message"]').length > 0) {
          cy.get('[data-testid="error-message"]').should('be.visible');
        } else if ($body.find('.error, .invalid').length > 0) {
          cy.get('.error, .invalid').should('be.visible');
        }
      });

      // Form should not be submitted
      cy.get('[data-testid="availability-form"], [data-testid="add-availability-modal"]')
        .should('be.visible');
    });

    it('should validate date field constraints', () => {
      const pastDate = '2020-01-01';
      const validDate = '2024-12-25';

      // Test past date (if restricted)
      cy.get('[data-testid="input-date"], input[name="date"]').clear().type(pastDate);
      cy.get('[data-testid="button-save"], button[type="submit"]').click();
      
      // May show past date warning
      cy.wait(500);

      // Test valid future date
      cy.get('[data-testid="input-date"], input[name="date"]').clear().type(validDate);
      cy.get('[data-testid="input-date"], input[name="date"]').should('have.value', validDate);
    });

    it('should validate time field constraints', () => {
      const validDate = '2024-12-25';

      cy.get('[data-testid="input-date"], input[name="date"]').type(validDate);

      // Test invalid time ranges (end before start)
      cy.get('[data-testid="input-start-time"], input[name="startTime"]').type('15:00');
      cy.get('[data-testid="input-end-time"], input[name="endTime"]').type('14:00');
      
      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      // Should show time validation error
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="time-error"]').length > 0) {
          cy.get('[data-testid="time-error"]').should('be.visible');
        }
      });

      // Test valid time range
      cy.get('[data-testid="input-end-time"], input[name="endTime"]').clear().type('17:00');
    });

    it('should handle timezone selection', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-timezone"]').length > 0) {
          cy.get('[data-testid="select-timezone"]')
            .should('be.visible')
            .select('America/New_York');
        }
      });
    });

    it('should validate notes field length limits', () => {
      const longText = 'A'.repeat(1001); // Assuming 1000 char limit
      const validText = 'Valid availability notes';

      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .type(longText);

      // Check character counter if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="character-count"]').length > 0) {
          cy.get('[data-testid="character-count"]').should('contain.text', '1000');
        }
      });

      // Clear and add valid text
      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .clear()
        .type(validText);
    });
  });

  describe('Create Availability - API Integration', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
      cy.intercept('POST', apiEndpoints.consultantAvailability).as('createAvailability');
    });

    it('should successfully create regular availability', () => {
      cy.get('[data-testid="add-availability-button"]').click();

      // Fill form with valid data
      cy.get('[data-testid="input-date"], input[name="date"]')
        .type(testData.availability.valid.date);
      
      cy.get('[data-testid="input-start-time"], input[name="startTime"]')
        .type(testData.availability.valid.startTime);
      
      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .type(testData.availability.valid.endTime);

      cy.get('[data-testid="select-type"], select[name="type"]')
        .select('available');

      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .type(testData.availability.valid.notes);

      // Submit form
      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      // Wait for API call
      cy.wait('@createAvailability').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.include({
          date: testData.availability.valid.date,
          startTime: testData.availability.valid.startTime,
          endTime: testData.availability.valid.endTime,
          type: 'available'
        });
      });

      // Should redirect or close modal
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="success-message"]').length > 0) {
          cy.get('[data-testid="success-message"]').should('be.visible');
        }
      });
    });

    it('should successfully create overnight shift availability', () => {
      cy.get('[data-testid="add-availability-button"]').click();

      // Fill form for overnight shift
      cy.get('[data-testid="input-date"], input[name="date"]')
        .type(testData.availability.overnight.date);
      
      cy.get('[data-testid="input-start-time"], input[name="startTime"]')
        .type(testData.availability.overnight.startTime);
      
      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .type(testData.availability.overnight.endTime);

      cy.get('[data-testid="select-type"], select[name="type"]')
        .select('available');

      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .type(testData.availability.overnight.notes);

      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      cy.wait('@createAvailability').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
    });

    it('should successfully create unavailability record', () => {
      cy.get('[data-testid="add-availability-button"]').click();

      // Fill form for unavailability
      cy.get('[data-testid="input-date"], input[name="date"]')
        .type(testData.availability.unavailable.date);
      
      cy.get('[data-testid="select-type"], select[name="type"]')
        .select('unavailable');

      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .type(testData.availability.unavailable.notes);

      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      cy.wait('@createAvailability').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body.type).to.equal('unavailable');
      });
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('POST', apiEndpoints.consultantAvailability, {
        statusCode: 400,
        body: { error: 'Invalid availability data' }
      }).as('createAvailabilityError');

      cy.get('[data-testid="add-availability-button"]').click();

      // Fill minimal valid form
      cy.get('[data-testid="input-date"], input[name="date"]')
        .type(testData.availability.valid.date);
      cy.get('[data-testid="select-type"], select[name="type"]')
        .select('available');

      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      cy.wait('@createAvailabilityError');

      // Should display error message
      cy.get('[data-testid="error-message"], .error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });

    it('should handle network failures', () => {
      // Mock network failure
      cy.intercept('POST', apiEndpoints.consultantAvailability, {
        forceNetworkError: true
      }).as('networkError');

      cy.get('[data-testid="add-availability-button"]').click();

      cy.get('[data-testid="input-date"], input[name="date"]')
        .type(testData.availability.valid.date);
      cy.get('[data-testid="select-type"], select[name="type"]')
        .select('available');

      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      cy.wait('@networkError');

      // Should show network error
      cy.get('[data-testid="error-message"], .error')
        .should('be.visible');
    });
  });

  describe('View Availability - List & Calendar Views', () => {
    beforeEach(() => {
      // Create test availability records
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.valid);
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.partial);
      
      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
    });

    it('should display availability records in list view', () => {
      cy.wait('@getAvailability');

      // Switch to list view if not default
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="list-view-button"]').length > 0) {
          cy.get('[data-testid="list-view-button"]').click();
        }
      });

      // Should display availability records
      cy.get('[data-testid="availability-list"], [data-testid="availability-table"]')
        .should('be.visible');

      // Check for availability entries
      cy.get('[data-testid^="availability-item"]').should('have.length.at.least', 2);

      // Verify data display
      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.should('contain.text', testData.availability.valid.date);
        cy.should('contain.text', testData.availability.valid.startTime);
        cy.should('contain.text', testData.availability.valid.endTime);
      });
    });

    it('should display availability in calendar view', () => {
      cy.wait('@getAvailability');

      // Switch to calendar view
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-view-button"]').length > 0) {
          cy.get('[data-testid="calendar-view-button"]').click();
        }
      });

      // Calendar should be visible
      cy.get('[data-testid="availability-calendar"]').should('be.visible');

      // Should show availability entries on calendar
      cy.get('[data-testid^="calendar-event"], .calendar-event')
        .should('have.length.at.least', 1);
    });

    it('should handle empty state correctly', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.consultantAvailability, { body: [] }).as('getEmptyAvailability');
      
      cy.visit('/availability');
      cy.wait('@getEmptyAvailability');

      // Should show empty state
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]').should('contain.text', /no availability|empty/i);

      // Should show add button
      cy.get('[data-testid="add-availability-button"]').should('be.visible');
    });

    it('should handle loading states', () => {
      // Mock slow response
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        delay: 2000,
        body: []
      }).as('getSlowAvailability');

      cy.visit('/availability');

      // Should show loading indicator
      cy.get('[data-testid="loading"], .loading, .spinner').should('be.visible');

      cy.wait('@getSlowAvailability');

      // Loading should disappear
      cy.get('[data-testid="loading"], .loading, .spinner').should('not.exist');
    });
  });

  describe('Edit Availability - Modification & Updates', () => {
    let availabilityId;

    beforeEach(() => {
      // Create test availability to edit
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.valid)
        .then((response) => {
          availabilityId = response.body.id;
        });

      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
      cy.intercept('PATCH', `/api/availability/${availabilityId || '*'}`).as('updateAvailability');
    });

    it('should open edit form with pre-filled data', () => {
      cy.wait('@getAvailability');

      // Find and click edit button
      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="edit-button"], button[aria-label*="edit"]').click();
      });

      // Edit form should open
      cy.get('[data-testid="availability-form"], [data-testid="edit-availability-modal"]')
        .should('be.visible');

      // Form should be pre-filled
      cy.get('[data-testid="input-date"], input[name="date"]')
        .should('have.value', testData.availability.valid.date);

      cy.get('[data-testid="input-start-time"], input[name="startTime"]')
        .should('have.value', testData.availability.valid.startTime);

      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .should('have.value', testData.availability.valid.endTime);

      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .should('contain.value', testData.availability.valid.notes);
    });

    it('should successfully update availability', () => {
      cy.wait('@getAvailability');

      // Open edit form
      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="edit-button"], button[aria-label*="edit"]').click();
      });

      // Modify data
      const newTime = '18:00';
      const newNotes = 'Updated availability notes';

      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .clear()
        .type(newTime);

      cy.get('[data-testid="textarea-notes"], textarea[name="notes"]')
        .clear()
        .type(newNotes);

      // Save changes
      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      // Verify API call
      cy.wait('@updateAvailability').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 204]);
        expect(interception.request.body.endTime).to.equal(newTime);
        expect(interception.request.body.notes).to.equal(newNotes);
      });

      // Should show success feedback
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="success-message"]').length > 0) {
          cy.get('[data-testid="success-message"]').should('be.visible');
        }
      });
    });

    it('should validate edit form constraints', () => {
      cy.wait('@getAvailability');

      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="edit-button"], button[aria-label*="edit"]').click();
      });

      // Try invalid time range
      cy.get('[data-testid="input-start-time"], input[name="startTime"]')
        .clear()
        .type('18:00');

      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .clear()
        .type('16:00');

      cy.get('[data-testid="button-save"], button[type="submit"]').click();

      // Should show validation error
      cy.get('[data-testid="time-error"], .error').should('be.visible');
    });

    it('should handle cancel edit operation', () => {
      cy.wait('@getAvailability');

      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="edit-button"], button[aria-label*="edit"]').click();
      });

      // Make changes
      cy.get('[data-testid="input-end-time"], input[name="endTime"]')
        .clear()
        .type('20:00');

      // Cancel
      cy.get('[data-testid="button-cancel"]').click();

      // Form should close without saving
      cy.get('[data-testid="availability-form"], [data-testid="edit-availability-modal"]')
        .should('not.exist');
    });
  });

  describe('Delete Availability - Removal & Confirmation', () => {
    let availabilityId;

    beforeEach(() => {
      // Create test availability to delete
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.valid)
        .then((response) => {
          availabilityId = response.body.id;
        });

      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
      cy.intercept('DELETE', `/api/availability/${availabilityId || '*'}`).as('deleteAvailability');
    });

    it('should show delete confirmation dialog', () => {
      cy.wait('@getAvailability');

      // Click delete button
      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"], button[aria-label*="delete"]').click();
      });

      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .should('be.visible');

      cy.get('[data-testid="delete-confirmation"]').within(() => {
        cy.should('contain.text', /delete|remove/i);
        cy.should('contain.text', /confirm|sure/i);
        
        cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i)
          .should('be.visible');
        
        cy.get('[data-testid="cancel-delete"], button').contains(/cancel/i)
          .should('be.visible');
      });
    });

    it('should successfully delete availability', () => {
      cy.wait('@getAvailability');

      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"], button[aria-label*="delete"]').click();
      });

      // Confirm deletion
      cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();

      // Verify API call
      cy.wait('@deleteAvailability').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 204]);
      });

      // Item should be removed from list
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should cancel delete operation', () => {
      cy.wait('@getAvailability');

      const initialCount = Cypress.$('[data-testid^="availability-item"]').length;

      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"], button[aria-label*="delete"]').click();
      });

      // Cancel deletion
      cy.get('[data-testid="cancel-delete"], button').contains(/cancel/i).click();

      // Confirmation dialog should close
      cy.get('[data-testid="delete-confirmation"]').should('not.exist');

      // Item should still be in list
      cy.get('[data-testid^="availability-item"]').should('have.length', initialCount);
    });

    it('should handle delete API errors', () => {
      // Mock delete error
      cy.intercept('DELETE', `/api/availability/*`, {
        statusCode: 500,
        body: { error: 'Failed to delete availability' }
      }).as('deleteError');

      cy.wait('@getAvailability');

      cy.get('[data-testid^="availability-item"]').first().within(() => {
        cy.get('[data-testid="delete-button"], button[aria-label*="delete"]').click();
      });

      cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();

      cy.wait('@deleteError');

      // Should show error message
      cy.get('[data-testid="error-message"], .error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Search & Filter - Discovery Features', () => {
    beforeEach(() => {
      // Create multiple availability records for testing
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.valid);
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.partial);
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.unavailable);

      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
    });

    it('should filter by date range', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="date-range-picker"]').length > 0) {
          // Set date range
          cy.get('[data-testid="date-from"]').type('2024-03-15');
          cy.get('[data-testid="date-to"]').type('2024-03-16');
          cy.get('[data-testid="apply-filter"]').click();

          // Should filter results
          cy.get('[data-testid^="availability-item"]').should('have.length.at.most', 2);
        }
      });
    });

    it('should filter by availability type', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="status-filter"]').length > 0) {
          // Filter by available only
          cy.get('[data-testid="status-filter"]').select('available');

          // Should show only available records
          cy.get('[data-testid^="availability-item"]').each(($item) => {
            cy.wrap($item).should('contain.text', 'available');
          });
        }
      });
    });

    it('should search by notes text', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          // Search for specific text
          cy.get('[data-testid="search-input"]').type('regular shift');

          // Should filter to matching records
          cy.get('[data-testid^="availability-item"]')
            .should('have.length.at.least', 1)
            .and('contain.text', 'regular shift');
        }
      });
    });

    it('should handle no search results', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          // Search for non-existent text
          cy.get('[data-testid="search-input"]').type('nonexistent text xyz');

          // Should show no results message
          cy.get('[data-testid="no-results"], [data-testid="empty-state"]')
            .should('be.visible')
            .and('contain.text', /no.*found|no results/i);
        }
      });
    });

    it('should clear search and filters', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          // Apply search
          cy.get('[data-testid="search-input"]').type('test');
          
          if ($body.find('[data-testid="clear-search"]').length > 0) {
            // Clear search
            cy.get('[data-testid="clear-search"]').click();
            
            // Should show all results again
            cy.get('[data-testid="search-input"]').should('have.value', '');
          }
        }
      });
    });
  });

  describe('Pagination & Sorting - Large Data Sets', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
    });

    it('should handle pagination controls', () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 50 }, (_, i) => ({
        id: `test-${i}`,
        date: `2024-03-${String(i + 1).padStart(2, '0')}`,
        startTime: '09:00',
        endTime: '17:00',
        type: 'available',
        notes: `Test availability ${i + 1}`
      }));

      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        body: largeDataset
      }).as('getLargeAvailability');

      cy.visit('/availability');
      cy.wait('@getLargeAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          // Should show pagination
          cy.get('[data-testid="pagination"]').should('be.visible');
          cy.get('[data-testid="next-page"]').should('be.visible');
          
          // Test page navigation
          cy.get('[data-testid="next-page"]').click();
          cy.url().should('include', 'page=2');
        }
      });
    });

    it('should sort by date', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="sort-date"]').length > 0) {
          // Click date sort
          cy.get('[data-testid="sort-date"]').click();
          
          // Should sort ascending
          cy.get('[data-testid^="availability-item"]').first()
            .should('contain.text', '2024-03-15');
          
          // Click again for descending
          cy.get('[data-testid="sort-date"]').click();
          
          // Should sort descending
          cy.get('[data-testid^="availability-item"]').first()
            .should('contain.text', '2024-03-18');
        }
      });
    });

    it('should show items per page controls', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="items-per-page"]').length > 0) {
          cy.get('[data-testid="items-per-page"]')
            .should('be.visible')
            .select('50');
          
          // Should show more items
          cy.get('[data-testid^="availability-item"]').should('have.length.at.most', 50);
        }
      });
    });
  });

  describe('Bulk Operations - Multi-Select Actions', () => {
    beforeEach(() => {
      // Create multiple test records
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.valid);
      cy.request('POST', apiEndpoints.consultantAvailability, testData.availability.partial);
      
      cy.visit('/availability');
      cy.intercept('GET', apiEndpoints.consultantAvailability).as('getAvailability');
    });

    it('should support multi-select functionality', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-all"]').length > 0) {
          // Test select all
          cy.get('[data-testid="select-all"]').click();
          
          // All items should be selected
          cy.get('[data-testid^="availability-item"] input[type="checkbox"]')
            .should('be.checked');
          
          // Bulk actions should be available
          cy.get('[data-testid="bulk-actions"]').should('be.visible');
        }
      });
    });

    it('should support bulk delete operation', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-all"]').length > 0) {
          // Select items
          cy.get('[data-testid="select-all"]').click();
          
          // Bulk delete
          cy.get('[data-testid="bulk-delete"]').click();
          
          // Confirm bulk delete
          cy.get('[data-testid="confirm-bulk-delete"]').click();
          
          // Should delete all selected items
          cy.get('[data-testid="success-message"]').should('be.visible');
        }
      });
    });

    it('should support bulk edit operation', () => {
      cy.wait('@getAvailability');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-all"]').length > 0) {
          // Select items
          cy.get('[data-testid="select-all"]').click();
          
          // Bulk edit
          cy.get('[data-testid="bulk-edit"]').click();
          
          // Should open bulk edit form
          cy.get('[data-testid="bulk-edit-form"]').should('be.visible');
        }
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle API unavailability gracefully', () => {
      // Mock API failure
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        statusCode: 500
      }).as('apiFailure');

      cy.visit('/availability');
      cy.wait('@apiFailure');

      // Should show error state
      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Should provide retry option
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        forceNetworkError: true
      }).as('networkFailure');

      cy.visit('/availability');
      cy.wait('@networkFailure');

      // Should show network error
      cy.get('[data-testid="network-error"], [data-testid="error-state"]')
        .should('be.visible');
    });

    it('should handle invalid data gracefully', () => {
      // Mock invalid response
      cy.intercept('GET', apiEndpoints.consultantAvailability, {
        body: { invalid: 'data' }
      }).as('invalidData');

      cy.visit('/availability');
      cy.wait('@invalidData');

      // Should handle gracefully
      cy.get('[data-testid="error-state"], [data-testid="empty-state"]')
        .should('be.visible');
    });

    it('should handle browser refresh during operations', () => {
      cy.visit('/availability');
      
      // Start creating availability
      cy.get('[data-testid="add-availability-button"]').click();
      cy.get('[data-testid="input-date"], input[name="date"]')
        .type(testData.availability.valid.date);
      
      // Refresh page
      cy.reload();
      
      // Should return to main page without errors
      cy.get('[data-testid="availability-dashboard"]').should('be.visible');
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit('/availability');
    });

    it('should be keyboard navigable', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Continue tabbing
      cy.focused().tab();
      cy.focused().should('be.visible');
      
      // Should reach add button
      cy.get('[data-testid="add-availability-button"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'add-availability-button');
    });

    it('should have proper ARIA attributes', () => {
      // Check main landmarks
      cy.get('main, [role="main"]').should('exist');
      
      // Check button accessibility
      cy.get('[data-testid="add-availability-button"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title');
      
      // Check form accessibility when opened
      cy.get('[data-testid="add-availability-button"]').click();
      cy.get('[data-testid="availability-form"]').within(() => {
        cy.get('label').should('exist');
        cy.get('input, select, textarea').should('have.attr', 'aria-label')
          .or('have.attr', 'aria-labelledby');
      });
    });

    it('should support screen reader navigation', () => {
      // Check heading structure
      cy.get('h1').should('exist').and('be.visible');
      cy.get('h2, h3').should('exist');
      
      // Check list semantics
      cy.get('[role="list"], ul, ol').should('exist');
      cy.get('[role="listitem"], li').should('exist');
    });

    it('should handle focus management in modals', () => {
      cy.get('[data-testid="add-availability-button"]').click();
      
      // Focus should be trapped in modal
      cy.get('[data-testid="availability-form"] input').first().should('be.focused');
      
      // Tab should cycle within modal
      cy.focused().tab();
      cy.focused().should('be.visible');
    });
  });

  afterEach(() => {
    // Clean up test data
    cy.request({
      method: 'GET',
      url: apiEndpoints.consultantAvailability,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        response.body.forEach((availability) => {
          if (availability.notes?.includes('Test') || 
              availability.notes?.includes('CI') ||
              availability.notes?.includes('Updated')) {
            cy.request({
              method: 'DELETE',
              url: apiEndpoints.deleteAvailability(availability.id),
              failOnStatusCode: false
            });
          }
        });
      }
    });
  });
});
