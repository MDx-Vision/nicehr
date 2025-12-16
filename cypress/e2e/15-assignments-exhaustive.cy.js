describe('Assignments System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    schedule: {
      title: 'Test Schedule',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      shiftType: 'day',
      hours: 8
    },
    assignment: {
      consultantId: 'ci-test-consultant',
      startDate: '2024-01-15T09:00:00Z',
      endDate: '2024-01-15T17:00:00Z',
      role: 'Implementation Specialist',
      hourlyRate: 75,
      status: 'confirmed',
      notes: 'Test assignment notes'
    },
    invalidAssignment: {
      consultantId: '',
      startDate: 'invalid-date',
      endDate: '2024-01-14T17:00:00Z', // Before start date
      role: '',
      hourlyRate: -10, // Negative rate
      status: 'invalid-status'
    }
  };

  const apiEndpoints = {
    projects: '/api/projects',
    schedules: (projectId) => `/api/projects/${projectId}/schedules`,
    assignments: (scheduleId) => `/api/schedules/${scheduleId}/assignments`,
    consultantSchedules: (consultantId) => `/api/consultants/${consultantId}/schedules`,
    deleteAssignment: (id) => `/api/assignments/${id}`,
    consultants: '/api/consultants'
  };

  beforeEach(() => {
    // Clear all application state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]').type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Schedule Assignments Page - Navigation & Access', () => {
    it('should navigate to assignments through project schedules', () => {
      // Navigate to projects
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Navigate to schedules
      cy.get('[data-testid="tab-schedules"], [data-testid="nav-schedules"]', { timeout: 10000 })
        .should('be.visible')
        .click();
      
      // Navigate to assignments
      cy.get('[data-testid="schedule-item"]').first().within(() => {
        cy.get('[data-testid="view-assignments-button"]', { timeout: 5000 })
          .should('be.visible')
          .click();
      });
      
      cy.url().should('include', '/assignments');
    });

    it('should handle direct URL access to assignments page', () => {
      // Intercept API calls
      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: [], total: 0 }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
      
      cy.get('[data-testid="assignments-container"]', { timeout: 10000 })
        .should('be.visible');
    });

    it('should show unauthorized message for restricted users', () => {
      // Mock unauthorized response
      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 403,
        body: { error: 'Unauthorized' }
      }).as('getAssignmentsUnauthorized');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignmentsUnauthorized');
      
      cy.get('[data-testid="unauthorized-message"]', { timeout: 5000 })
        .should('be.visible')
        .and('contain.text', 'unauthorized');
    });
  });

  describe('Assignments List - UI Components & Layout', () => {
    beforeEach(() => {
      // Mock assignments data
      const mockAssignments = [
        {
          id: 'assignment-1',
          consultantId: 'consultant-1',
          consultantName: 'John Doe',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T17:00:00Z',
          role: 'Implementation Specialist',
          hourlyRate: 75,
          status: 'confirmed',
          notes: 'Primary implementation lead'
        },
        {
          id: 'assignment-2',
          consultantId: 'consultant-2',
          consultantName: 'Jane Smith',
          startDate: '2024-01-16T08:00:00Z',
          endDate: '2024-01-16T16:00:00Z',
          role: 'Training Specialist',
          hourlyRate: 65,
          status: 'pending',
          notes: 'User training and support'
        }
      ];

      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: mockAssignments, total: mockAssignments.length }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
    });

    it('should display complete assignments list layout', () => {
      // Main container
      cy.get('[data-testid="assignments-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Header section
      cy.get('[data-testid="assignments-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('h1, h2').should('contain.text', /assignments/i);
          cy.get('[data-testid="add-assignment-button"]')
            .should('be.visible')
            .and('not.be.disabled');
        });
      
      // Assignments table/list
      cy.get('[data-testid="assignments-table"], [data-testid="assignments-list"]')
        .should('be.visible');
      
      // Assignment items
      cy.get('[data-testid="assignment-item"]')
        .should('have.length.at.least', 1)
        .each(($item) => {
          cy.wrap($item).within(() => {
            cy.get('[data-testid="consultant-name"]').should('be.visible');
            cy.get('[data-testid="assignment-role"]').should('be.visible');
            cy.get('[data-testid="assignment-dates"]').should('be.visible');
            cy.get('[data-testid="assignment-status"]').should('be.visible');
            cy.get('[data-testid="hourly-rate"]').should('be.visible');
          });
        });
    });

    it('should display assignment details correctly', () => {
      cy.get('[data-testid="assignment-item"]').first().within(() => {
        // Consultant information
        cy.get('[data-testid="consultant-name"]')
          .should('contain.text', 'John Doe');
        
        // Assignment role
        cy.get('[data-testid="assignment-role"]')
          .should('contain.text', 'Implementation Specialist');
        
        // Date range
        cy.get('[data-testid="assignment-dates"]')
          .should('contain.text', '2024-01-15');
        
        // Status badge
        cy.get('[data-testid="assignment-status"]')
          .should('contain.text', 'confirmed')
          .and('have.class', /confirmed|success/);
        
        // Hourly rate
        cy.get('[data-testid="hourly-rate"]')
          .should('contain.text', '$75');
        
        // Action buttons
        cy.get('[data-testid="edit-assignment-button"]')
          .should('be.visible');
        cy.get('[data-testid="delete-assignment-button"]')
          .should('be.visible');
      });
    });

    it('should show status badges with correct styling', () => {
      cy.get('[data-testid="assignment-status"]').each(($badge, index) => {
        const expectedStatuses = ['confirmed', 'pending'];
        const status = expectedStatuses[index];
        
        cy.wrap($badge)
          .should('contain.text', status)
          .and('have.class', /badge|status/)
          .and('be.visible');
      });
    });

    it('should handle action buttons correctly', () => {
      cy.get('[data-testid="assignment-item"]').first().within(() => {
        // Edit button
        cy.get('[data-testid="edit-assignment-button"]')
          .should('be.visible')
          .and('not.be.disabled')
          .and('have.attr', 'type', 'button');
        
        // Delete button
        cy.get('[data-testid="delete-assignment-button"]')
          .should('be.visible')
          .and('not.be.disabled')
          .and('have.attr', 'type', 'button');
        
        // View details button if exists
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="view-assignment-details-button"]').length > 0) {
            cy.get('[data-testid="view-assignment-details-button"]')
              .should('be.visible')
              .and('not.be.disabled');
          }
        });
      });
    });
  });

  describe('Add Assignment - Form & Validation', () => {
    beforeEach(() => {
      // Mock consultants for selection
      const mockConsultants = [
        { id: 'consultant-1', name: 'John Doe', skills: ['Epic', 'Training'] },
        { id: 'consultant-2', name: 'Jane Smith', skills: ['Cerner', 'Implementation'] }
      ];

      cy.intercept('GET', '**/consultants', {
        statusCode: 200,
        body: { consultants: mockConsultants }
      }).as('getConsultants');

      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: [], total: 0 }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
      
      cy.get('[data-testid="add-assignment-button"]').click();
    });

    it('should display add assignment modal with all form fields', () => {
      // Modal container
      cy.get('[data-testid="add-assignment-modal"]', { timeout: 10000 })
        .should('be.visible');
      
      // Modal header
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', /add.*assignment/i);
      
      // Form fields
      cy.get('[data-testid="consultant-select"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'datetime-local');
      
      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'datetime-local');
      
      cy.get('[data-testid="input-role"]')
        .should('be.visible')
        .and('have.attr', 'type', 'text');
      
      cy.get('[data-testid="input-hourly-rate"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      
      cy.get('[data-testid="status-select"]')
        .should('be.visible');
      
      cy.get('[data-testid="textarea-notes"]')
        .should('be.visible');
      
      // Form buttons
      cy.get('[data-testid="button-save-assignment"]')
        .should('be.visible')
        .and('be.disabled'); // Should be disabled initially
      
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should validate required fields', () => {
      // Try to save without filling required fields
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Check for validation messages
      cy.get('[data-testid="consultant-select-error"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="start-date-error"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="end-date-error"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="role-error"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="hourly-rate-error"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });

    it('should validate date range logic', () => {
      // Fill required fields with invalid date range
      cy.get('[data-testid="consultant-select"]').click();
      cy.get('[data-testid="consultant-option-consultant-1"]').click();
      
      cy.get('[data-testid="input-start-date"]').type('2024-01-15T09:00');
      cy.get('[data-testid="input-end-date"]').type('2024-01-14T17:00'); // Before start date
      
      cy.get('[data-testid="input-role"]').type('Test Role');
      cy.get('[data-testid="input-hourly-rate"]').type('75');
      
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Check for date validation error
      cy.get('[data-testid="date-range-error"], [data-testid="end-date-error"]')
        .should('be.visible')
        .and('contain.text', /end date.*after.*start date/i);
    });

    it('should validate hourly rate constraints', () => {
      // Test negative hourly rate
      cy.get('[data-testid="input-hourly-rate"]').clear().type('-10');
      cy.get('[data-testid="input-role"]').click(); // Trigger validation
      
      cy.get('[data-testid="hourly-rate-error"]')
        .should('be.visible')
        .and('contain.text', /positive|greater than 0/i);
      
      // Test zero hourly rate
      cy.get('[data-testid="input-hourly-rate"]').clear().type('0');
      cy.get('[data-testid="input-role"]').click();
      
      cy.get('[data-testid="hourly-rate-error"]')
        .should('be.visible')
        .and('contain.text', /positive|greater than 0/i);
      
      // Test valid hourly rate
      cy.get('[data-testid="input-hourly-rate"]').clear().type('75');
      cy.get('[data-testid="input-role"]').click();
      
      cy.get('[data-testid="hourly-rate-error"]')
        .should('not.exist');
    });

    it('should successfully create assignment with valid data', () => {
      // Mock successful creation
      cy.intercept('POST', '**/schedules/*/assignments', {
        statusCode: 201,
        body: {
          id: 'new-assignment-id',
          consultantId: 'consultant-1',
          ...testData.assignment
        }
      }).as('createAssignment');

      // Fill form with valid data
      cy.get('[data-testid="consultant-select"]').click();
      cy.wait('@getConsultants');
      cy.get('[data-testid="consultant-option-consultant-1"]').click();
      
      cy.get('[data-testid="input-start-date"]')
        .type('2024-01-15T09:00');
      
      cy.get('[data-testid="input-end-date"]')
        .type('2024-01-15T17:00');
      
      cy.get('[data-testid="input-role"]')
        .type(testData.assignment.role);
      
      cy.get('[data-testid="input-hourly-rate"]')
        .type(testData.assignment.hourlyRate.toString());
      
      cy.get('[data-testid="status-select"]').click();
      cy.get('[data-testid="status-option-confirmed"]').click();
      
      cy.get('[data-testid="textarea-notes"]')
        .type(testData.assignment.notes);
      
      // Submit form
      cy.get('[data-testid="button-save-assignment"]')
        .should('not.be.disabled')
        .click();
      
      // Verify API call
      cy.wait('@createAssignment').then((interception) => {
        expect(interception.request.body).to.include({
          consultantId: 'consultant-1',
          role: testData.assignment.role,
          hourlyRate: testData.assignment.hourlyRate,
          status: 'confirmed'
        });
      });
      
      // Verify success feedback
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /assignment.*created|success/i);
      
      // Modal should close
      cy.get('[data-testid="add-assignment-modal"]')
        .should('not.exist');
    });
  });

  describe('Edit Assignment - Form & Updates', () => {
    beforeEach(() => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          consultantId: 'consultant-1',
          consultantName: 'John Doe',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T17:00:00Z',
          role: 'Implementation Specialist',
          hourlyRate: 75,
          status: 'confirmed',
          notes: 'Primary implementation lead'
        }
      ];

      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: mockAssignments, total: 1 }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
      
      cy.get('[data-testid="edit-assignment-button"]').first().click();
    });

    it('should display edit assignment modal with pre-filled data', () => {
      // Modal should be visible
      cy.get('[data-testid="edit-assignment-modal"]', { timeout: 10000 })
        .should('be.visible');
      
      // Title should indicate edit mode
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', /edit.*assignment/i);
      
      // Form fields should be pre-filled
      cy.get('[data-testid="consultant-select"]')
        .should('contain.text', 'John Doe');
      
      cy.get('[data-testid="input-role"]')
        .should('have.value', 'Implementation Specialist');
      
      cy.get('[data-testid="input-hourly-rate"]')
        .should('have.value', '75');
      
      cy.get('[data-testid="textarea-notes"]')
        .should('contain.text', 'Primary implementation lead');
    });

    it('should successfully update assignment', () => {
      // Mock successful update
      cy.intercept('PATCH', '**/assignments/*', {
        statusCode: 200,
        body: { success: true }
      }).as('updateAssignment');

      // Make changes
      cy.get('[data-testid="input-role"]')
        .clear()
        .type('Senior Implementation Specialist');
      
      cy.get('[data-testid="input-hourly-rate"]')
        .clear()
        .type('85');
      
      // Save changes
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Verify API call
      cy.wait('@updateAssignment').then((interception) => {
        expect(interception.request.body).to.include({
          role: 'Senior Implementation Specialist',
          hourlyRate: 85
        });
      });
      
      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /assignment.*updated|success/i);
    });

    it('should handle update validation errors', () => {
      // Clear required field
      cy.get('[data-testid="input-role"]').clear();
      
      // Try to save
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Should show validation error
      cy.get('[data-testid="role-error"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });
  });

  describe('Delete Assignment - Confirmation & Success', () => {
    beforeEach(() => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          consultantId: 'consultant-1',
          consultantName: 'John Doe',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T17:00:00Z',
          role: 'Implementation Specialist',
          hourlyRate: 75,
          status: 'confirmed',
          notes: 'Primary implementation lead'
        }
      ];

      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: mockAssignments, total: 1 }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
    });

    it('should show confirmation dialog when deleting assignment', () => {
      cy.get('[data-testid="delete-assignment-button"]').first().click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 10000 })
        .should('be.visible');
      
      // Dialog content
      cy.get('[data-testid="dialog-title"]')
        .should('contain.text', /delete.*assignment/i);
      
      cy.get('[data-testid="dialog-description"]')
        .should('contain.text', /are you sure/i)
        .and('contain.text', /cannot be undone/i);
      
      // Dialog buttons
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should cancel deletion when cancel button is clicked', () => {
      cy.get('[data-testid="delete-assignment-button"]').first().click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');
      
      // Assignment should still be visible
      cy.get('[data-testid="assignment-item"]')
        .should('have.length', 1);
    });

    it('should successfully delete assignment when confirmed', () => {
      // Mock successful deletion
      cy.intercept('DELETE', '**/assignments/assignment-1', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAssignment');

      cy.get('[data-testid="delete-assignment-button"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      // Verify API call
      cy.wait('@deleteAssignment');
      
      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /assignment.*deleted|success/i);
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');
    });

    it('should handle deletion errors gracefully', () => {
      // Mock error response
      cy.intercept('DELETE', '**/assignments/assignment-1', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('deleteAssignmentError');

      cy.get('[data-testid="delete-assignment-button"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteAssignmentError');
      
      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error.*deleting|failed/i);
    });
  });

  describe('Consultant Schedules View', () => {
    it('should navigate to consultant schedules view', () => {
      // Mock consultant schedules
      const mockSchedules = [
        {
          id: 'schedule-1',
          projectName: 'Hospital A Implementation',
          title: 'Week 1 Training',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T17:00:00Z',
          status: 'confirmed'
        }
      ];

      cy.intercept('GET', '**/consultants/*/schedules', {
        statusCode: 200,
        body: { schedules: mockSchedules }
      }).as('getConsultantSchedules');

      cy.visit('/consultants/ci-test-consultant/schedules');
      cy.wait('@getConsultantSchedules');
      
      // Should display consultant schedules
      cy.get('[data-testid="consultant-schedules-container"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="schedule-item"]')
        .should('have.length', 1)
        .within(() => {
          cy.get('[data-testid="project-name"]')
            .should('contain.text', 'Hospital A Implementation');
          cy.get('[data-testid="schedule-title"]')
            .should('contain.text', 'Week 1 Training');
          cy.get('[data-testid="schedule-dates"]')
            .should('contain.text', '2024-01-15');
          cy.get('[data-testid="schedule-status"]')
            .should('contain.text', 'confirmed');
        });
    });
  });

  describe('Empty States & Error Handling', () => {
    it('should display empty state when no assignments exist', () => {
      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: [], total: 0 }
      }).as('getEmptyAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getEmptyAssignments');
      
      // Empty state should be visible
      cy.get('[data-testid="empty-assignments-state"]', { timeout: 10000 })
        .should('be.visible');
      
      // Empty state content
      cy.get('[data-testid="empty-state-title"]')
        .should('contain.text', /no assignments/i);
      
      cy.get('[data-testid="empty-state-description"]')
        .should('be.visible')
        .and('contain.text', /create.*assignment|get started/i);
      
      // Should still show add assignment button
      cy.get('[data-testid="add-assignment-button"]')
        .should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getAssignmentsError');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignmentsError');
      
      // Error state should be visible
      cy.get('[data-testid="error-state"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="error-message"]')
        .should('contain.text', /error.*loading|something went wrong/i);
      
      // Retry button should be available
      cy.get('[data-testid="retry-button"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should handle network errors during assignment creation', () => {
      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: [], total: 0 }
      }).as('getAssignments');

      cy.intercept('POST', '**/schedules/*/assignments', {
        forceNetworkError: true
      }).as('createAssignmentNetworkError');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
      
      cy.get('[data-testid="add-assignment-button"]').click();
      
      // Fill form with minimal required data
      cy.get('[data-testid="consultant-select"]').click();
      cy.get('[data-testid="consultant-option-consultant-1"]').first().click();
      
      cy.get('[data-testid="input-start-date"]').type('2024-01-15T09:00');
      cy.get('[data-testid="input-end-date"]').type('2024-01-15T17:00');
      cy.get('[data-testid="input-role"]').type('Test Role');
      cy.get('[data-testid="input-hourly-rate"]').type('75');
      
      cy.get('[data-testid="button-save-assignment"]').click();
      
      cy.wait('@createAssignmentNetworkError');
      
      // Should show network error
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /network.*error|connection/i);
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          consultantId: 'consultant-1',
          consultantName: 'John Doe',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T17:00:00Z',
          role: 'Implementation Specialist',
          hourlyRate: 75,
          status: 'confirmed',
          notes: 'Primary implementation lead'
        },
        {
          id: 'assignment-2',
          consultantId: 'consultant-2',
          consultantName: 'Jane Smith',
          startDate: '2024-01-16T08:00:00Z',
          endDate: '2024-01-16T16:00:00Z',
          role: 'Training Specialist',
          hourlyRate: 65,
          status: 'pending',
          notes: 'User training and support'
        },
        {
          id: 'assignment-3',
          consultantId: 'consultant-3',
          consultantName: 'Mike Johnson',
          startDate: '2024-01-17T10:00:00Z',
          endDate: '2024-01-17T18:00:00Z',
          role: 'Implementation Specialist',
          hourlyRate: 80,
          status: 'completed',
          notes: 'Technical implementation'
        }
      ];

      cy.intercept('GET', '**/schedules/*/assignments*', {
        statusCode: 200,
        body: { assignments: mockAssignments, total: mockAssignments.length }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
    });

    it('should search assignments by consultant name', () => {
      // Check if search functionality exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-assignments"]').length > 0) {
          cy.get('[data-testid="search-assignments"]').type('John');
          
          // Should filter results
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 1)
            .within(() => {
              cy.get('[data-testid="consultant-name"]')
                .should('contain.text', 'John Doe');
            });
          
          // Clear search
          cy.get('[data-testid="search-assignments"]').clear();
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 3);
        }
      });
    });

    it('should filter assignments by status', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="status-filter"]').length > 0) {
          // Filter by confirmed status
          cy.get('[data-testid="status-filter"]').click();
          cy.get('[data-testid="status-option-confirmed"]').click();
          
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 1)
            .within(() => {
              cy.get('[data-testid="assignment-status"]')
                .should('contain.text', 'confirmed');
            });
          
          // Clear filter
          cy.get('[data-testid="clear-filters-button"]').click();
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 3);
        }
      });
    });

    it('should filter assignments by role', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="role-filter"]').length > 0) {
          cy.get('[data-testid="role-filter"]').click();
          cy.get('[data-testid="role-option-implementation-specialist"]').click();
          
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 2)
            .each(($item) => {
              cy.wrap($item).within(() => {
                cy.get('[data-testid="assignment-role"]')
                  .should('contain.text', 'Implementation Specialist');
              });
            });
        }
      });
    });
  });

  describe('Responsive Design & Accessibility', () => {
    beforeEach(() => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          consultantId: 'consultant-1',
          consultantName: 'John Doe',
          startDate: '2024-01-15T09:00:00Z',
          endDate: '2024-01-15T17:00:00Z',
          role: 'Implementation Specialist',
          hourlyRate: 75,
          status: 'confirmed',
          notes: 'Primary implementation lead'
        }
      ];

      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: mockAssignments, total: 1 }
      }).as('getAssignments');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
    });

    it('should be responsive on mobile devices', () => {
      // Test mobile viewport
      cy.viewport(375, 667);
      
      cy.get('[data-testid="assignments-container"]')
        .should('be.visible');
      
      // Check if layout adapts to mobile
      cy.get('[data-testid="assignments-table"]').then(($table) => {
        if ($table.length > 0) {
          // Should be scrollable or stacked on mobile
          cy.wrap($table).should('have.css', 'overflow-x', 'auto');
        }
      });
      
      // Mobile-specific elements
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-assignment-card"]').length > 0) {
          cy.get('[data-testid="mobile-assignment-card"]')
            .should('be.visible');
        }
      });
    });

    it('should be responsive on tablet devices', () => {
      // Test tablet viewport
      cy.viewport(768, 1024);
      
      cy.get('[data-testid="assignments-container"]')
        .should('be.visible');
      
      // Layout should work well on tablet
      cy.get('[data-testid="assignment-item"]')
        .should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');
      
      // Should be able to navigate to add button
      cy.get('[data-testid="add-assignment-button"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'add-assignment-button');
      
      // Should be able to activate with Enter/Space
      cy.focused().type('{enter}');
      cy.get('[data-testid="add-assignment-modal"]')
        .should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      // Check main container
      cy.get('[data-testid="assignments-container"]')
        .should('have.attr', 'role', 'main')
        .or('have.attr', 'aria-label');
      
      // Check table/list accessibility
      cy.get('[data-testid="assignments-table"]').then(($table) => {
        if ($table.length > 0) {
          cy.wrap($table)
            .should('have.attr', 'role', 'table')
            .or('have.attr', 'aria-label');
        }
      });
      
      // Check buttons have labels
      cy.get('[data-testid="add-assignment-button"]')
        .should('have.attr', 'aria-label')
        .or('contain.text');
      
      cy.get('[data-testid="edit-assignment-button"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title');
      
      cy.get('[data-testid="delete-assignment-button"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title');
    });

    it('should work with screen readers', () => {
      // Check for screen reader text
      cy.get('[data-testid="assignment-item"]').first().within(() => {
        // Should have descriptive text for screen readers
        cy.get('.sr-only, [aria-label], [aria-describedby]')
          .should('exist');
      });
      
      // Status should be announced properly
      cy.get('[data-testid="assignment-status"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title');
    });
  });

  describe('Performance & Loading States', () => {
    it('should show loading state while fetching assignments', () => {
      // Mock slow API response
      cy.intercept('GET', '**/schedules/*/assignments', (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send({
            statusCode: 200,
            body: { assignments: [], total: 0 }
          });
        });
      }).as('getAssignmentsSlow');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      
      // Should show loading state
      cy.get('[data-testid="assignments-loading"]', { timeout: 1000 })
        .should('be.visible');
      
      cy.wait('@getAssignmentsSlow');
      
      // Loading should disappear
      cy.get('[data-testid="assignments-loading"]')
        .should('not.exist');
      
      cy.get('[data-testid="assignments-container"]')
        .should('be.visible');
    });

    it('should show loading state during assignment creation', () => {
      cy.intercept('GET', '**/schedules/*/assignments', {
        statusCode: 200,
        body: { assignments: [], total: 0 }
      }).as('getAssignments');

      cy.intercept('POST', '**/schedules/*/assignments', (req) => {
        req.reply((res) => {
          res.delay(1500);
          res.send({
            statusCode: 201,
            body: { id: 'new-assignment', ...req.body }
          });
        });
      }).as('createAssignmentSlow');

      cy.visit('/projects/ci-test-project/schedules/test-schedule-id/assignments');
      cy.wait('@getAssignments');
      
      cy.get('[data-testid="add-assignment-button"]').click();
      
      // Fill form quickly
      cy.get('[data-testid="consultant-select"]').click();
      cy.get('[data-testid="consultant-option-consultant-1"]').first().click();
      cy.get('[data-testid="input-start-date"]').type('2024-01-15T09:00');
      cy.get('[data-testid="input-end-date"]').type('2024-01-15T17:00');
      cy.get('[data-testid="input-role"]').type('Test Role');
      cy.get('[data-testid="input-hourly-rate"]').type('75');
      
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Should show loading state on button
      cy.get('[data-testid="button-save-assignment"]')
        .should('be.disabled')
        .and('contain.text', /saving|creating/i);
      
      cy.wait('@createAssignmentSlow');
      
      // Button should return to normal
      cy.get('[data-testid="add-assignment-modal"]')
        .should('not.exist');
    });
  });
});
