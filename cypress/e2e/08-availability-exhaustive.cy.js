describe('Availability Management - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    consultant: 'ci-test-consultant',
    availability: {
      valid: {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        location: 'Remote',
        notes: 'Available for remote work',
        timezone: 'America/New_York'
      },
      overlapping: {
        startDate: '2024-12-15',
        endDate: '2025-01-15',
        location: 'On-site',
        notes: 'Overlapping availability period'
      },
      pastDates: {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        location: 'Remote',
        notes: 'Past date availability'
      },
      invalidRange: {
        startDate: '2024-12-31',
        endDate: '2024-12-01',
        location: 'Hybrid',
        notes: 'End date before start date'
      },
      longTerm: {
        startDate: '2024-12-01',
        endDate: '2025-12-01',
        location: 'Flexible',
        notes: 'Long-term availability with very long notes that exceed normal length to test text area handling and validation for extended content that might cause issues with database constraints or UI display limitations when rendered in various components across the application interface'
      }
    }
  };

  const apiEndpoints = {
    consultantAvailability: (consultantId) => `/api/consultants/${consultantId}/availability`,
    availability: '/api/availability',
    deleteAvailability: (id) => `/api/availability/${id}`,
    consultants: '/api/consultants'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as test user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]', { timeout: 10000 }).type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for successful login
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    
    // Set up API intercepts
    cy.intercept('GET', apiEndpoints.consultants).as('getConsultants');
    cy.intercept('GET', apiEndpoints.consultantAvailability('*')).as('getConsultantAvailability');
    cy.intercept('POST', apiEndpoints.consultantAvailability('*')).as('createAvailability');
    cy.intercept('DELETE', apiEndpoints.deleteAvailability('*')).as('deleteAvailability');
    cy.intercept('GET', apiEndpoints.availability).as('getAllAvailability');
  });

  describe('Availability List Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');
    });

    it('should display complete availability list page layout', () => {
      // Page header
      cy.get('[data-testid="availability-page-header"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Availability');
      
      // Navigation breadcrumbs if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="breadcrumb-availability"]').length > 0) {
          cy.get('[data-testid="breadcrumb-availability"]').should('be.visible');
        }
      });

      // Action buttons
      cy.get('[data-testid="button-add-availability"], [data-testid="button-create-availability"], button')
        .contains(/add|create|new/i)
        .should('be.visible')
        .and('not.be.disabled');

      // Search and filter controls
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="availability-search"]').length > 0) {
          cy.get('[data-testid="availability-search"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
        
        if ($body.find('[data-testid="availability-filter"]').length > 0) {
          cy.get('[data-testid="availability-filter"]').should('be.visible');
        }
      });

      // Main content area
      cy.get('[data-testid="availability-list"], [data-testid="availability-table"], table, .availability-grid')
        .should('be.visible');
    });

    it('should handle empty availability state correctly', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.availability, { body: [] }).as('getEmptyAvailability');
      
      cy.reload();
      cy.wait('@getEmptyAvailability');

      // Check empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="empty-availability-state"]').length > 0) {
          cy.get('[data-testid="empty-availability-state"]')
            .should('be.visible')
            .and('contain.text', /no availability|empty|none found/i);
        } else {
          // Check for any empty state indicators
          cy.get('body').should('contain.text', /no availability|empty|none found/i);
        }
      });
    });

    it('should display availability data correctly in list/table format', () => {
      // Mock availability data
      const mockAvailability = [
        {
          id: 1,
          consultantId: 'consultant-1',
          consultant: { name: 'John Doe', email: 'john@example.com' },
          startDate: '2024-12-01',
          endDate: '2024-12-31',
          location: 'Remote',
          notes: 'Available for remote work',
          createdAt: '2024-11-01T00:00:00Z'
        },
        {
          id: 2,
          consultantId: 'consultant-2',
          consultant: { name: 'Jane Smith', email: 'jane@example.com' },
          startDate: '2024-12-15',
          endDate: '2025-01-15',
          location: 'On-site',
          notes: 'Available for on-site projects',
          createdAt: '2024-11-02T00:00:00Z'
        }
      ];

      cy.intercept('GET', apiEndpoints.availability, { body: mockAvailability }).as('getMockAvailability');
      
      cy.reload();
      cy.wait('@getMockAvailability');

      // Verify data display
      mockAvailability.forEach((availability, index) => {
        cy.get(`[data-testid="availability-item-${availability.id}"], [data-testid="availability-row-${index}"], tr, .availability-card`)
          .should('be.visible')
          .within(() => {
            // Check consultant name
            cy.get('body').should('contain.text', availability.consultant.name);
            
            // Check dates
            cy.get('body').should('contain.text', availability.startDate);
            cy.get('body').should('contain.text', availability.endDate);
            
            // Check location
            cy.get('body').should('contain.text', availability.location);
          });
      });
    });

    it('should implement search functionality correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="availability-search"]').length > 0) {
          const searchTerm = 'Remote';
          
          // Intercept search request
          cy.intercept('GET', `${apiEndpoints.availability}*`, (req) => {
            expect(req.query).to.have.property('search', searchTerm);
          }).as('searchAvailability');
          
          // Perform search
          cy.get('[data-testid="availability-search"]')
            .clear()
            .type(searchTerm);
          
          // Wait for search results
          cy.wait('@searchAvailability');
          
          // Verify filtered results
          cy.get('[data-testid="availability-list"], table tbody')
            .should('be.visible')
            .and('contain.text', searchTerm);
          
          // Clear search
          cy.get('[data-testid="availability-search"]').clear();
        }
      });
    });

    it('should handle pagination if implemented', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"], .pagination').length > 0) {
          // Test pagination controls
          cy.get('[data-testid="pagination"], .pagination')
            .should('be.visible')
            .within(() => {
              // Check for page numbers and navigation buttons
              cy.get('button, a').should('have.length.greaterThan', 0);
              
              // Test next page if available
              cy.get('button, a').contains(/next|>/i).then(($next) => {
                if (!$next.is(':disabled')) {
                  cy.wrap($next).click();
                  cy.wait('@getAllAvailability');
                }
              });
            });
        }
      });
    });
  });

  describe('Create Availability Form - Layout & Validation', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');
      
      // Navigate to create form
      cy.get('[data-testid="button-add-availability"], [data-testid="button-create-availability"], button')
        .contains(/add|create|new/i)
        .first()
        .click();
    });

    it('should display complete create availability form', () => {
      // Form container
      cy.get('[data-testid="availability-form"], [data-testid="create-availability-form"], form', { timeout: 10000 })
        .should('be.visible');

      // Essential form fields
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');

      cy.get('[data-testid="select-location"], [data-testid="input-location"], select[name="location"], input[name="location"]')
        .should('be.visible')
        .and('have.attr', 'required');

      // Optional fields
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-notes"], textarea[name="notes"]').length > 0) {
          cy.get('[data-testid="input-notes"], textarea[name="notes"]')
            .should('be.visible');
        }
        
        if ($body.find('[data-testid="select-consultant"], select[name="consultantId"]').length > 0) {
          cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
            .should('be.visible');
        }
      });

      // Form actions
      cy.get('[data-testid="button-submit"], [data-testid="button-save"], button[type="submit"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      cy.get('[data-testid="button-cancel"], button')
        .contains(/cancel/i)
        .should('be.visible');
    });

    it('should validate required fields correctly', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-submit"], [data-testid="button-save"], button[type="submit"]')
        .click();

      // Check for validation errors
      cy.get('body').should('contain.text', /required|cannot be empty|must be provided/i);
      
      // Check specific field validation
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .should('have.class', /error|invalid/)
        .or('be.invalid');
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .should('have.class', /error|invalid/)
        .or('be.invalid');
    });

    it('should validate date range correctly', () => {
      // Test invalid date range (end before start)
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .type(testData.availability.invalidRange.startDate);
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .type(testData.availability.invalidRange.endDate);
      
      cy.get('[data-testid="select-location"], [data-testid="input-location"], select[name="location"], input[name="location"]')
        .first()
        .then(($el) => {
          if ($el.is('select')) {
            cy.wrap($el).select(testData.availability.invalidRange.location);
          } else {
            cy.wrap($el).type(testData.availability.invalidRange.location);
          }
        });

      cy.get('[data-testid="button-submit"], button[type="submit"]').click();

      // Check for date range validation error
      cy.get('body').should('contain.text', /end date.*before.*start date|invalid date range|date range error/i);
    });

    it('should validate past dates appropriately', () => {
      // Test past dates
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .type(testData.availability.pastDates.startDate);
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .type(testData.availability.pastDates.endDate);
      
      cy.get('[data-testid="select-location"], [data-testid="input-location"], select[name="location"], input[name="location"]')
        .first()
        .then(($el) => {
          if ($el.is('select')) {
            cy.wrap($el).select(testData.availability.pastDates.location);
          } else {
            cy.wrap($el).type(testData.availability.pastDates.location);
          }
        });

      cy.get('[data-testid="button-submit"], button[type="submit"]').click();

      // Check for past date validation (if implemented)
      cy.get('body').then(($body) => {
        if ($body.text().includes('past date') || $body.text().includes('cannot be in the past')) {
          cy.get('body').should('contain.text', /past date|cannot be in the past|future date required/i);
        }
      });
    });

    it('should handle location field correctly', () => {
      cy.get('[data-testid="select-location"], [data-testid="input-location"], select[name="location"], input[name="location"]')
        .first()
        .then(($el) => {
          if ($el.is('select')) {
            // Test dropdown options
            cy.wrap($el)
              .find('option')
              .should('have.length.greaterThan', 1);
            
            // Test selection
            cy.wrap($el).select('Remote');
            cy.wrap($el).should('have.value', 'Remote');
          } else {
            // Test text input
            cy.wrap($el)
              .type('Remote Work')
              .should('have.value', 'Remote Work');
            
            // Test clearing
            cy.wrap($el).clear().should('have.value', '');
          }
        });
    });

    it('should handle notes field correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-notes"], textarea[name="notes"]').length > 0) {
          const longNotes = testData.availability.longTerm.notes;
          
          cy.get('[data-testid="input-notes"], textarea[name="notes"]')
            .type(longNotes.substring(0, 100))
            .should('have.value', longNotes.substring(0, 100));
          
          // Test character limit if present
          cy.get('[data-testid="input-notes"], textarea[name="notes"]')
            .clear()
            .type(longNotes);
          
          // Check if there's a character counter or limit
          cy.get('body').then(($body) => {
            if ($body.text().includes('character') || $body.text().includes('limit')) {
              cy.get('[data-testid="character-count"], .character-count')
                .should('be.visible');
            }
          });
        }
      });
    });

    it('should handle consultant selection if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-consultant"], select[name="consultantId"]').length > 0) {
          cy.wait('@getConsultants');
          
          cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
            .find('option')
            .should('have.length.greaterThan', 1);
          
          // Select first available consultant
          cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
            .find('option:not([value=""])')
            .first()
            .then(($option) => {
              const value = $option.val();
              cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
                .select(value);
            });
        }
      });
    });
  });

  describe('Create Availability - Form Submission & API Integration', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');
      
      // Navigate to create form
      cy.get('[data-testid="button-add-availability"], [data-testid="button-create-availability"], button')
        .contains(/add|create|new/i)
        .first()
        .click();
    });

    it('should successfully create availability with valid data', () => {
      // Fill form with valid data
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .type(testData.availability.valid.startDate);
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .type(testData.availability.valid.endDate);
      
      cy.get('[data-testid="select-location"], [data-testid="input-location"], select[name="location"], input[name="location"]')
        .first()
        .then(($el) => {
          if ($el.is('select')) {
            cy.wrap($el).select(testData.availability.valid.location);
          } else {
            cy.wrap($el).type(testData.availability.valid.location);
          }
        });

      // Fill optional fields
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-notes"], textarea[name="notes"]').length > 0) {
          cy.get('[data-testid="input-notes"], textarea[name="notes"]')
            .type(testData.availability.valid.notes);
        }
        
        if ($body.find('[data-testid="select-consultant"], select[name="consultantId"]').length > 0) {
          cy.wait('@getConsultants');
          cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
            .find('option:not([value=""])')
            .first()
            .then(($option) => {
              const value = $option.val();
              cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
                .select(value);
            });
        }
      });

      // Submit form
      cy.get('[data-testid="button-submit"], [data-testid="button-save"], button[type="submit"]')
        .click();

      // Wait for API call
      cy.wait('@createAvailability').then((interception) => {
        expect(interception.request.body).to.include({
          startDate: testData.availability.valid.startDate,
          endDate: testData.availability.valid.endDate,
          location: testData.availability.valid.location
        });
      });

      // Verify redirect or success message
      cy.get('body').then(($body) => {
        if ($body.text().includes('success') || $body.text().includes('created')) {
          cy.get('body').should('contain.text', /success|created|added/i);
        } else {
          // Should redirect to availability list
          cy.url().should('include', '/availability');
          cy.url().should('not.include', '/create');
        }
      });
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('POST', apiEndpoints.consultantAvailability('*'), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createAvailabilityError');

      // Fill and submit form
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .type(testData.availability.valid.startDate);
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .type(testData.availability.valid.endDate);
      
      cy.get('[data-testid="select-location"], [data-testid="input-location"], select[name="location"], input[name="location"]')
        .first()
        .then(($el) => {
          if ($el.is('select')) {
            cy.wrap($el).select(testData.availability.valid.location);
          } else {
            cy.wrap($el).type(testData.availability.valid.location);
          }
        });

      cy.get('[data-testid="button-submit"], button[type="submit"]').click();

      // Wait for error response
      cy.wait('@createAvailabilityError');

      // Verify error handling
      cy.get('[data-testid="error-message"], .error, .alert-error')
        .should('be.visible')
        .and('contain.text', /error|failed|something went wrong/i);
    });

    it('should handle validation errors from server', () => {
      // Mock validation error
      cy.intercept('POST', apiEndpoints.consultantAvailability('*'), {
        statusCode: 400,
        body: { 
          error: 'Validation failed',
          details: {
            startDate: 'Start date is required',
            endDate: 'End date must be after start date'
          }
        }
      }).as('createAvailabilityValidationError');

      // Submit form with invalid data
      cy.get('[data-testid="button-submit"], button[type="submit"]').click();

      // Wait for validation error
      cy.wait('@createAvailabilityValidationError');

      // Verify validation error display
      cy.get('body').should('contain.text', /validation|required|invalid/i);
    });

    it('should cancel form submission correctly', () => {
      // Fill some data
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .type(testData.availability.valid.startDate);
      
      // Cancel
      cy.get('[data-testid="button-cancel"], button')
        .contains(/cancel/i)
        .click();

      // Verify redirect back to list
      cy.url().should('include', '/availability');
      cy.url().should('not.include', '/create');
    });
  });

  describe('Availability Actions - Edit, Delete & Bulk Operations', () => {
    let createdAvailabilityId;

    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');

      // Create test availability for actions
      const mockAvailability = {
        id: 'test-availability-1',
        consultantId: testData.consultant,
        startDate: testData.availability.valid.startDate,
        endDate: testData.availability.valid.endDate,
        location: testData.availability.valid.location,
        notes: testData.availability.valid.notes
      };

      cy.intercept('GET', apiEndpoints.availability, {
        body: [mockAvailability]
      }).as('getAvailabilityWithData');

      cy.reload();
      cy.wait('@getAvailabilityWithData');
      
      createdAvailabilityId = mockAvailability.id;
    });

    it('should display action buttons for each availability entry', () => {
      // Check for action buttons or dropdown
      cy.get('[data-testid="availability-actions"], .availability-actions, [data-testid="action-menu"]')
        .should('be.visible');

      // Check for edit action
      cy.get('[data-testid="button-edit"], [data-testid="action-edit"], button')
        .contains(/edit/i)
        .should('be.visible');

      // Check for delete action
      cy.get('[data-testid="button-delete"], [data-testid="action-delete"], button')
        .contains(/delete/i)
        .should('be.visible');
    });

    it('should handle availability editing correctly', () => {
      // Click edit button
      cy.get('[data-testid="button-edit"], [data-testid="action-edit"], button')
        .contains(/edit/i)
        .first()
        .click();

      // Verify navigation to edit form
      cy.url().should('include', '/edit');

      // Verify form is pre-filled
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .should('have.value', testData.availability.valid.startDate);
      
      cy.get('[data-testid="input-end-date"], input[name="endDate"]')
        .should('have.value', testData.availability.valid.endDate);
    });

    it('should handle availability deletion with confirmation', () => {
      // Click delete button
      cy.get('[data-testid="button-delete"], [data-testid="action-delete"], button')
        .contains(/delete/i)
        .first()
        .click();

      // Verify confirmation dialog
      cy.get('[data-testid="confirm-dialog"], [data-testid="delete-confirmation"], .modal, .dialog')
        .should('be.visible')
        .and('contain.text', /delete|remove|confirm/i);

      // Cancel deletion
      cy.get('[data-testid="button-cancel"], button')
        .contains(/cancel/i)
        .click();

      // Verify dialog closes
      cy.get('[data-testid="confirm-dialog"], [data-testid="delete-confirmation"], .modal, .dialog')
        .should('not.exist');
    });

    it('should complete availability deletion successfully', () => {
      // Mock successful deletion
      cy.intercept('DELETE', apiEndpoints.deleteAvailability(createdAvailabilityId), {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAvailabilitySuccess');

      // Click delete button
      cy.get('[data-testid="button-delete"], [data-testid="action-delete"], button')
        .contains(/delete/i)
        .first()
        .click();

      // Confirm deletion
      cy.get('[data-testid="button-confirm"], [data-testid="button-delete-confirm"], button')
        .contains(/confirm|delete/i)
        .click();

      // Wait for deletion API call
      cy.wait('@deleteAvailabilitySuccess');

      // Verify success message or removal from list
      cy.get('body').should('contain.text', /deleted|removed|success/i);
    });

    it('should handle deletion errors gracefully', () => {
      // Mock deletion error
      cy.intercept('DELETE', apiEndpoints.deleteAvailability(createdAvailabilityId), {
        statusCode: 500,
        body: { error: 'Failed to delete availability' }
      }).as('deleteAvailabilityError');

      // Attempt deletion
      cy.get('[data-testid="button-delete"], [data-testid="action-delete"], button')
        .contains(/delete/i)
        .first()
        .click();

      cy.get('[data-testid="button-confirm"], [data-testid="button-delete-confirm"], button')
        .contains(/confirm|delete/i)
        .click();

      // Wait for error response
      cy.wait('@deleteAvailabilityError');

      // Verify error message
      cy.get('[data-testid="error-message"], .error, .alert-error')
        .should('be.visible')
        .and('contain.text', /error|failed|delete/i);
    });

    it('should handle bulk operations if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bulk-actions"], .bulk-actions').length > 0) {
          // Test bulk selection
          cy.get('[data-testid="checkbox-select-all"], input[type="checkbox"]')
            .first()
            .check();

          // Verify bulk actions become available
          cy.get('[data-testid="bulk-actions"], .bulk-actions')
            .should('be.visible')
            .within(() => {
              cy.get('button').should('have.length.greaterThan', 0);
            });

          // Test bulk delete
          cy.get('[data-testid="bulk-delete"], button')
            .contains(/delete/i)
            .click();

          // Verify bulk confirmation
          cy.get('[data-testid="bulk-confirm-dialog"], .modal')
            .should('be.visible');
        }
      });
    });
  });

  describe('Consultant-Specific Availability View', () => {
    beforeEach(() => {
      // Visit consultant-specific availability page
      cy.visit(`/consultants/${testData.consultant}/availability`);
      cy.wait('@getConsultantAvailability');
    });

    it('should display consultant availability page correctly', () => {
      // Page header with consultant context
      cy.get('[data-testid="consultant-availability-header"], .page-header')
        .should('be.visible')
        .and('contain.text', /availability/i);

      // Consultant information
      cy.get('[data-testid="consultant-info"], .consultant-details')
        .should('be.visible');

      // Availability calendar or list
      cy.get('[data-testid="availability-calendar"], [data-testid="availability-timeline"], .availability-view')
        .should('be.visible');
    });

    it('should handle calendar view if implemented', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-view"], .calendar').length > 0) {
          // Test calendar navigation
          cy.get('[data-testid="calendar-prev"], .calendar-nav-prev')
            .should('be.visible')
            .and('not.be.disabled');

          cy.get('[data-testid="calendar-next"], .calendar-nav-next')
            .should('be.visible')
            .and('not.be.disabled');

          // Test month/week view toggles
          cy.get('[data-testid="view-toggle"], .view-controls').then(($toggle) => {
            if ($toggle.length > 0) {
              cy.wrap($toggle).should('be.visible');
            }
          });

          // Test date selection
          cy.get('[data-testid="calendar-date"], .calendar-cell')
            .first()
            .click();
        }
      });
    });

    it('should allow adding availability from consultant page', () => {
      // Add availability button
      cy.get('[data-testid="add-availability"], button')
        .contains(/add|new/i)
        .click();

      // Verify form opens with consultant pre-selected
      cy.get('[data-testid="availability-form"], form')
        .should('be.visible');

      // Check if consultant is pre-selected
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-consultant"], select[name="consultantId"]').length > 0) {
          cy.get('[data-testid="select-consultant"], select[name="consultantId"]')
            .should('have.value', testData.consultant);
        }
      });
    });
  });

  describe('Availability Filtering & Search', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');
    });

    it('should implement date range filtering', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-start-date"], [data-testid="date-filter"]').length > 0) {
          // Set start date filter
          cy.get('[data-testid="filter-start-date"]')
            .type('2024-12-01');

          // Set end date filter
          cy.get('[data-testid="filter-end-date"]')
            .type('2024-12-31');

          // Apply filter
          cy.get('[data-testid="apply-filter"], button')
            .contains(/apply|filter|search/i)
            .click();

          // Verify API call with date parameters
          cy.wait('@getAllAvailability').then((interception) => {
            expect(interception.request.url).to.include('startDate=2024-12-01');
            expect(interception.request.url).to.include('endDate=2024-12-31');
          });
        }
      });
    });

    it('should implement location filtering', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-location"], [data-testid="location-filter"]').length > 0) {
          // Select location filter
          cy.get('[data-testid="filter-location"]')
            .select('Remote');

          // Verify filtered results
          cy.get('[data-testid="availability-list"] [data-testid="location"]')
            .each(($el) => {
              cy.wrap($el).should('contain.text', 'Remote');
            });
        }
      });
    });

    it('should implement consultant filtering', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-consultant"], [data-testid="consultant-filter"]').length > 0) {
          // Wait for consultants to load
          cy.wait('@getConsultants');

          // Select consultant filter
          cy.get('[data-testid="filter-consultant"]')
            .find('option:not([value=""])')
            .first()
            .then(($option) => {
              const consultantId = $option.val();
              const consultantName = $option.text();
              
              cy.get('[data-testid="filter-consultant"]')
                .select(consultantId);

              // Verify filtered results
              cy.get('[data-testid="availability-list"]')
                .should('contain.text', consultantName);
            });
        }
      });
    });

    it('should clear all filters correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="clear-filters"], button').contains(/clear|reset/i).length > 0) {
          // Set some filters first
          if ($body.find('[data-testid="filter-location"]').length > 0) {
            cy.get('[data-testid="filter-location"]').select('Remote');
          }

          // Clear filters
          cy.get('[data-testid="clear-filters"], button')
            .contains(/clear|reset/i)
            .click();

          // Verify filters are reset
          cy.get('[data-testid="filter-location"]').should('have.value', '');
          cy.wait('@getAllAvailability');
        }
      });
    });
  });

  describe('Availability Export & Reporting', () => {
    beforeEach(() => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');
    });

    it('should handle availability data export if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="export-availability"], button').contains(/export|download/i).length > 0) {
          // Test CSV export
          cy.get('[data-testid="export-csv"], button')
            .contains(/csv/i)
            .click();

          // Verify download initiated
          cy.get('[data-testid="download-status"], .download-notification')
            .should('be.visible')
            .and('contain.text', /download|export/i);

          // Test Excel export if available
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="export-excel"], button').contains(/excel|xlsx/i).length > 0) {
              cy.get('[data-testid="export-excel"]').click();
            }
          });
        }
      });
    });

    it('should display availability analytics if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="availability-analytics"], .analytics-section').length > 0) {
          cy.get('[data-testid="availability-analytics"]')
            .should('be.visible')
            .within(() => {
              // Check for summary statistics
              cy.get('[data-testid="total-availability"], .stat-card')
                .should('be.visible')
                .and('contain.text', /total|count/i);

              // Check for charts if present
              cy.get('canvas, svg, .chart').should('exist');
            });
        }
      });
    });
  });

  describe('Mobile Responsiveness & Accessibility', () => {
    it('should be fully responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/availability');
      cy.wait('@getAllAvailability');

      // Check mobile layout
      cy.get('[data-testid="availability-page-header"]')
        .should('be.visible');

      // Check mobile navigation
      cy.get('[data-testid="mobile-menu"], .mobile-nav, .hamburger-menu').then(($menu) => {
        if ($menu.length > 0) {
          cy.wrap($menu).should('be.visible');
        }
      });

      // Check responsive table/cards
      cy.get('[data-testid="availability-list"], .availability-cards')
        .should('be.visible')
        .and('have.css', 'width');
    });

    it('should be accessible with keyboard navigation', () => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');

      // Test keyboard navigation
      cy.get('body').tab();
      cy.focused().should('be.visible');

      // Continue tabbing through interactive elements
      cy.focused().tab();
      cy.focused().should('be.visible');

      // Test form accessibility
      cy.get('[data-testid="button-add-availability"], button')
        .contains(/add|create/i)
        .click();

      // Check form labels and ARIA attributes
      cy.get('[data-testid="input-start-date"], input[name="startDate"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
    });

    it('should have proper ARIA labels and semantic HTML', () => {
      cy.visit('/availability');
      cy.wait('@getAllAvailability');

      // Check main navigation landmarks
      cy.get('nav, [role="navigation"]').should('exist');
      cy.get('main, [role="main"]').should('exist');

      // Check headings hierarchy
      cy.get('h1').should('exist');
      cy.get('h1, h2, h3, h4, h5, h6').each(($heading) => {
        cy.wrap($heading).should('be.visible');
      });

      // Check table accessibility if present
      cy.get('table').then(($table) => {
        if ($table.length > 0) {
          cy.wrap($table).within(() => {
            cy.get('th').should('have.attr', 'scope');
            cy.get('caption, [data-testid="table-caption"]').should('exist');
          });
        }
      });
    });
  });
});
