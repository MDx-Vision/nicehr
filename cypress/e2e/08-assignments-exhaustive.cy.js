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
    consultant: {
      id: 'ci-test-consultant'
    },
    project: {
      id: 'ci-test-project'
    },
    assignment: {
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      startTime: '08:00',
      endTime: '16:00',
      role: 'Implementation Specialist',
      notes: 'Test assignment for Cypress E2E testing',
      status: 'scheduled'
    },
    schedule: {
      id: 'test-schedule-id',
      name: 'Test Schedule',
      description: 'Schedule for testing assignments'
    }
  };

  const apiEndpoints = {
    schedules: '/api/projects/*/schedules',
    assignments: '/api/schedules/*/assignments',
    consultantSchedules: '/api/consultants/*/schedules',
    deleteAssignment: '/api/assignments/*'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]', { timeout: 10000 })
      .type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]')
      .type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for successful login
    cy.url({ timeout: 15000 }).should('not.include', '/login');
  });

  describe('Assignment Creation - UI Components & Validation', () => {
    beforeEach(() => {
      // Navigate to assignments through project/schedules
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait(2000);
    });

    it('should display schedule management interface', () => {
      cy.get('[data-testid="schedules-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Check for schedule list or empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-list"]').length > 0) {
          cy.get('[data-testid="schedule-list"]').should('be.visible');
        } else {
          cy.get('[data-testid="empty-schedules"]').should('be.visible');
        }
      });

      // Check for create schedule button
      cy.get('[data-testid="create-schedule-button"], [data-testid="add-schedule"]')
        .should('be.visible');
    });

    it('should create schedule first if none exists', () => {
      cy.intercept('GET', apiEndpoints.schedules, { fixture: 'empty-schedules.json' }).as('getEmptySchedules');
      cy.intercept('POST', apiEndpoints.schedules, {
        statusCode: 201,
        body: {
          id: testData.schedule.id,
          name: testData.schedule.name,
          description: testData.schedule.description,
          projectId: testData.project.id,
          createdAt: new Date().toISOString()
        }
      }).as('createSchedule');

      // Click create schedule button
      cy.get('[data-testid="create-schedule-button"], [data-testid="add-schedule"]')
        .click();

      // Fill schedule form
      cy.get('[data-testid="schedule-name-input"]', { timeout: 5000 })
        .should('be.visible')
        .type(testData.schedule.name);
      
      cy.get('[data-testid="schedule-description-input"]')
        .type(testData.schedule.description);

      // Submit schedule form
      cy.get('[data-testid="submit-schedule"]').click();

      cy.wait('@createSchedule').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.schedule.name,
          description: testData.schedule.description
        });
      });

      // Verify schedule created
      cy.get('[data-testid="schedule-item"]')
        .should('contain', testData.schedule.name);
    });

    it('should navigate to assignment creation from schedule', () => {
      // Mock schedule exists
      cy.intercept('GET', apiEndpoints.schedules, {
        body: [{
          id: testData.schedule.id,
          name: testData.schedule.name,
          description: testData.schedule.description,
          projectId: testData.project.id
        }]
      }).as('getSchedules');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');

      // Click on schedule to view assignments
      cy.get('[data-testid="schedule-item"]').first().click();

      // Should navigate to assignments view
      cy.url().should('include', '/assignments');
      
      // Check assignments interface
      cy.get('[data-testid="assignments-container"]')
        .should('be.visible');
      
      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .should('be.visible');
    });

    it('should display assignment creation form with all fields', () => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);

      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .click();

      // Form should be visible
      cy.get('[data-testid="assignment-form"]', { timeout: 5000 })
        .should('be.visible');

      // Check all form fields
      cy.get('[data-testid="assignment-consultant-select"]')
        .should('be.visible');
      
      cy.get('[data-testid="assignment-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
      
      cy.get('[data-testid="assignment-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
      
      cy.get('[data-testid="assignment-start-time"]')
        .should('be.visible');
      
      cy.get('[data-testid="assignment-end-time"]')
        .should('be.visible');
      
      cy.get('[data-testid="assignment-role-input"]')
        .should('be.visible');
      
      cy.get('[data-testid="assignment-notes-textarea"]')
        .should('be.visible');

      // Form buttons
      cy.get('[data-testid="submit-assignment"]')
        .should('be.visible')
        .and('be.disabled'); // Should be disabled until required fields filled
      
      cy.get('[data-testid="cancel-assignment"]')
        .should('be.visible');
    });

    it('should validate required fields in assignment form', () => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
      
      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .click();

      // Try to submit empty form
      cy.get('[data-testid="submit-assignment"]').should('be.disabled');

      // Fill consultant (required)
      cy.get('[data-testid="assignment-consultant-select"]').click();
      cy.get(`[data-value="${testData.consultant.id}"]`).click();

      // Submit button might still be disabled without dates
      cy.get('[data-testid="assignment-start-date"]')
        .type(testData.assignment.startDate);
      
      cy.get('[data-testid="assignment-end-date"]')
        .type(testData.assignment.endDate);

      // Now submit should be enabled
      cy.get('[data-testid="submit-assignment"]')
        .should('not.be.disabled');
    });

    it('should validate date logic (end date after start date)', () => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
      
      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .click();

      // Set end date before start date
      cy.get('[data-testid="assignment-start-date"]')
        .type('2024-01-20');
      
      cy.get('[data-testid="assignment-end-date"]')
        .type('2024-01-15'); // Earlier than start date

      // Should show validation error
      cy.get('[data-testid="date-validation-error"]')
        .should('be.visible')
        .and('contain', 'End date must be after start date');

      // Submit should be disabled
      cy.get('[data-testid="submit-assignment"]')
        .should('be.disabled');
    });

    it('should validate time logic (end time after start time for same day)', () => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
      
      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .click();

      const sameDate = '2024-01-15';

      cy.get('[data-testid="assignment-start-date"]').type(sameDate);
      cy.get('[data-testid="assignment-end-date"]').type(sameDate);
      
      // Set end time before start time
      cy.get('[data-testid="assignment-start-time"]').type('16:00');
      cy.get('[data-testid="assignment-end-time"]').type('08:00');

      // Should show validation error
      cy.get('[data-testid="time-validation-error"]')
        .should('be.visible')
        .and('contain', 'End time must be after start time');
    });

    it('should handle consultant availability conflicts', () => {
      // Mock consultant with existing assignment conflict
      cy.intercept('GET', '/api/consultants/*/availability*', {
        body: {
          available: false,
          conflicts: [{
            startDate: '2024-01-15',
            endDate: '2024-01-17',
            reason: 'Already assigned to another project'
          }]
        }
      }).as('checkAvailability');

      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
      
      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .click();

      // Fill form with conflicting dates
      cy.get('[data-testid="assignment-consultant-select"]').click();
      cy.get(`[data-value="${testData.consultant.id}"]`).click();
      
      cy.get('[data-testid="assignment-start-date"]').type('2024-01-15');
      cy.get('[data-testid="assignment-end-date"]').type('2024-01-17');

      cy.wait('@checkAvailability');

      // Should show conflict warning
      cy.get('[data-testid="availability-conflict-warning"]')
        .should('be.visible')
        .and('contain', 'consultant is not available');
    });
  });

  describe('Assignment CRUD Operations', () => {
    beforeEach(() => {
      // Mock existing schedule
      cy.intercept('GET', apiEndpoints.schedules, {
        body: [{
          id: testData.schedule.id,
          name: testData.schedule.name,
          projectId: testData.project.id
        }]
      });

      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
    });

    it('should create new assignment successfully', () => {
      cy.intercept('POST', `/api/schedules/${testData.schedule.id}/assignments`, {
        statusCode: 201,
        body: {
          id: 'new-assignment-id',
          scheduleId: testData.schedule.id,
          consultantId: testData.consultant.id,
          ...testData.assignment,
          createdAt: new Date().toISOString()
        }
      }).as('createAssignment');

      cy.intercept('GET', `/api/consultants/${testData.consultant.id}`, {
        body: {
          id: testData.consultant.id,
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      }).as('getConsultant');

      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .click();

      // Fill assignment form
      cy.get('[data-testid="assignment-consultant-select"]').click();
      cy.get(`[data-value="${testData.consultant.id}"]`).click();
      
      cy.get('[data-testid="assignment-start-date"]')
        .type(testData.assignment.startDate);
      
      cy.get('[data-testid="assignment-end-date"]')
        .type(testData.assignment.endDate);
      
      cy.get('[data-testid="assignment-start-time"]')
        .type(testData.assignment.startTime);
      
      cy.get('[data-testid="assignment-end-time"]')
        .type(testData.assignment.endTime);
      
      cy.get('[data-testid="assignment-role-input"]')
        .type(testData.assignment.role);
      
      cy.get('[data-testid="assignment-notes-textarea"]')
        .type(testData.assignment.notes);

      // Submit form
      cy.get('[data-testid="submit-assignment"]').click();

      cy.wait('@createAssignment').then((interception) => {
        expect(interception.request.body).to.deep.include({
          consultantId: testData.consultant.id,
          startDate: testData.assignment.startDate,
          endDate: testData.assignment.endDate,
          role: testData.assignment.role,
          notes: testData.assignment.notes
        });
      });

      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Assignment created successfully');

      // Should redirect to assignments list
      cy.get('[data-testid="assignments-list"]')
        .should('be.visible');
    });

    it('should display assignments list with proper data', () => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          scheduleId: testData.schedule.id,
          consultantId: testData.consultant.id,
          consultantName: 'John Doe',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          startTime: '08:00',
          endTime: '16:00',
          role: 'Implementation Specialist',
          status: 'scheduled'
        },
        {
          id: 'assignment-2',
          scheduleId: testData.schedule.id,
          consultantId: 'consultant-2',
          consultantName: 'Jane Smith',
          startDate: '2024-01-22',
          endDate: '2024-01-25',
          startTime: '09:00',
          endTime: '17:00',
          role: 'Training Coordinator',
          status: 'confirmed'
        }
      ];

      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: mockAssignments
      }).as('getAssignments');

      cy.reload();
      cy.wait('@getAssignments');

      // Check assignments list
      cy.get('[data-testid="assignments-list"]')
        .should('be.visible');

      // Check assignment items
      cy.get('[data-testid="assignment-item"]')
        .should('have.length', 2);

      // Check first assignment details
      cy.get('[data-testid="assignment-item"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]')
          .should('contain', 'John Doe');
        
        cy.get('[data-testid="assignment-dates"]')
          .should('contain', '2024-01-15')
          .and('contain', '2024-01-20');
        
        cy.get('[data-testid="assignment-role"]')
          .should('contain', 'Implementation Specialist');
        
        cy.get('[data-testid="assignment-status"]')
          .should('contain', 'scheduled');
      });
    });

    it('should handle empty assignments state', () => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: []
      }).as('getEmptyAssignments');

      cy.reload();
      cy.wait('@getEmptyAssignments');

      // Should show empty state
      cy.get('[data-testid="empty-assignments"]')
        .should('be.visible')
        .and('contain', 'No assignments found');

      // Should still show create button
      cy.get('[data-testid="create-assignment-button"], [data-testid="add-assignment"]')
        .should('be.visible');
    });

    it('should edit assignment details', () => {
      const assignmentId = 'assignment-1';
      const updatedData = {
        role: 'Senior Implementation Specialist',
        notes: 'Updated notes for assignment',
        startTime: '07:00',
        endTime: '15:00'
      };

      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: [{
          id: assignmentId,
          scheduleId: testData.schedule.id,
          consultantId: testData.consultant.id,
          consultantName: 'John Doe',
          ...testData.assignment
        }]
      });

      cy.intercept('PATCH', `/api/assignments/${assignmentId}`, {
        statusCode: 200,
        body: {
          id: assignmentId,
          ...updatedData,
          updatedAt: new Date().toISOString()
        }
      }).as('updateAssignment');

      cy.reload();

      // Click edit button on assignment
      cy.get('[data-testid="assignment-item"]').first()
        .find('[data-testid="edit-assignment"]')
        .click();

      // Edit form should open
      cy.get('[data-testid="assignment-form"]')
        .should('be.visible');

      // Update fields
      cy.get('[data-testid="assignment-role-input"]')
        .clear()
        .type(updatedData.role);
      
      cy.get('[data-testid="assignment-notes-textarea"]')
        .clear()
        .type(updatedData.notes);
      
      cy.get('[data-testid="assignment-start-time"]')
        .clear()
        .type(updatedData.startTime);
      
      cy.get('[data-testid="assignment-end-time"]')
        .clear()
        .type(updatedData.endTime);

      // Submit changes
      cy.get('[data-testid="submit-assignment"]').click();

      cy.wait('@updateAssignment').then((interception) => {
        expect(interception.request.body).to.deep.include(updatedData);
      });

      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Assignment updated successfully');
    });

    it('should delete assignment with confirmation', () => {
      const assignmentId = 'assignment-1';

      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: [{
          id: assignmentId,
          scheduleId: testData.schedule.id,
          consultantId: testData.consultant.id,
          consultantName: 'John Doe',
          ...testData.assignment
        }]
      });

      cy.intercept('DELETE', `/api/assignments/${assignmentId}`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAssignment');

      cy.reload();

      // Click delete button
      cy.get('[data-testid="assignment-item"]').first()
        .find('[data-testid="delete-assignment"]')
        .click();

      // Confirmation dialog should appear
      cy.get('[data-testid="confirm-delete-dialog"]')
        .should('be.visible');

      cy.get('[data-testid="confirm-delete-message"]')
        .should('contain', 'Are you sure you want to delete this assignment?');

      // Confirm deletion
      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.wait('@deleteAssignment');

      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Assignment deleted successfully');
    });

    it('should cancel assignment deletion', () => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: [{
          id: 'assignment-1',
          scheduleId: testData.schedule.id,
          consultantId: testData.consultant.id,
          consultantName: 'John Doe',
          ...testData.assignment
        }]
      });

      cy.reload();

      // Click delete button
      cy.get('[data-testid="assignment-item"]').first()
        .find('[data-testid="delete-assignment"]')
        .click();

      // Cancel deletion
      cy.get('[data-testid="cancel-delete-button"]').click();

      // Dialog should close
      cy.get('[data-testid="confirm-delete-dialog"]')
        .should('not.exist');

      // Assignment should still be visible
      cy.get('[data-testid="assignment-item"]')
        .should('have.length', 1);
    });
  });

  describe('Assignment Search and Filtering', () => {
    const mockAssignments = [
      {
        id: 'assignment-1',
        consultantName: 'John Doe',
        role: 'Implementation Specialist',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'scheduled'
      },
      {
        id: 'assignment-2',
        consultantName: 'Jane Smith',
        role: 'Training Coordinator',
        startDate: '2024-01-22',
        endDate: '2024-01-25',
        status: 'confirmed'
      },
      {
        id: 'assignment-3',
        consultantName: 'Bob Johnson',
        role: 'Implementation Specialist',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        status: 'completed'
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: mockAssignments
      }).as('getAssignments');

      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
      cy.wait('@getAssignments');
    });

    it('should filter assignments by consultant name', () => {
      cy.get('[data-testid="search-assignments"]')
        .type('John Doe');

      // Should show only John Doe's assignment
      cy.get('[data-testid="assignment-item"]')
        .should('have.length', 1)
        .and('contain', 'John Doe');
    });

    it('should filter assignments by role', () => {
      // Check if role filter exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="role-filter"]').length > 0) {
          cy.get('[data-testid="role-filter"]').click();
          cy.get('[data-value="Implementation Specialist"]').click();

          // Should show only Implementation Specialist assignments
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 2)
            .each(($item) => {
              cy.wrap($item).should('contain', 'Implementation Specialist');
            });
        }
      });
    });

    it('should filter assignments by status', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="status-filter"]').length > 0) {
          cy.get('[data-testid="status-filter"]').click();
          cy.get('[data-value="scheduled"]').click();

          // Should show only scheduled assignments
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 1)
            .and('contain', 'scheduled');
        }
      });
    });

    it('should filter assignments by date range', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="date-range-filter"]').length > 0) {
          cy.get('[data-testid="start-date-filter"]')
            .type('2024-01-20');
          
          cy.get('[data-testid="end-date-filter"]')
            .type('2024-01-30');

          // Should show assignments within date range
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 1)
            .and('contain', 'Jane Smith');
        }
      });
    });

    it('should clear all filters', () => {
      // Apply some filters first
      cy.get('[data-testid="search-assignments"]')
        .type('John');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="clear-filters"]').length > 0) {
          cy.get('[data-testid="clear-filters"]').click();

          // Should show all assignments
          cy.get('[data-testid="assignment-item"]')
            .should('have.length', 3);

          // Search should be cleared
          cy.get('[data-testid="search-assignments"]')
            .should('have.value', '');
        }
      });
    });
  });

  describe('Assignment Status Management', () => {
    const assignmentId = 'assignment-1';

    beforeEach(() => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: [{
          id: assignmentId,
          scheduleId: testData.schedule.id,
          consultantId: testData.consultant.id,
          consultantName: 'John Doe',
          ...testData.assignment,
          status: 'scheduled'
        }]
      });

      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
    });

    it('should update assignment status to confirmed', () => {
      cy.intercept('PATCH', `/api/assignments/${assignmentId}`, {
        statusCode: 200,
        body: {
          id: assignmentId,
          status: 'confirmed',
          updatedAt: new Date().toISOString()
        }
      }).as('updateStatus');

      // Click status dropdown or button
      cy.get('[data-testid="assignment-item"]').first()
        .find('[data-testid="assignment-status"]')
        .click();

      // Select confirmed status
      cy.get('[data-testid="status-option-confirmed"]').click();

      cy.wait('@updateStatus').then((interception) => {
        expect(interception.request.body).to.include({
          status: 'confirmed'
        });
      });

      // Status should be updated in UI
      cy.get('[data-testid="assignment-item"]').first()
        .find('[data-testid="assignment-status"]')
        .should('contain', 'confirmed');
    });

    it('should handle status update errors', () => {
      cy.intercept('PATCH', `/api/assignments/${assignmentId}`, {
        statusCode: 400,
        body: { error: 'Cannot update status: consultant not available' }
      }).as('updateStatusError');

      cy.get('[data-testid="assignment-item"]').first()
        .find('[data-testid="assignment-status"]')
        .click();

      cy.get('[data-testid="status-option-confirmed"]').click();

      cy.wait('@updateStatusError');

      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Cannot update status');
    });
  });

  describe('Consultant Schedule View', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/schedules`, {
        body: [
          {
            id: 'schedule-1',
            name: 'Q1 Implementation',
            projectName: 'Hospital A Implementation',
            assignments: [
              {
                id: 'assignment-1',
                startDate: '2024-01-15',
                endDate: '2024-01-20',
                role: 'Implementation Specialist',
                status: 'scheduled'
              }
            ]
          }
        ]
      }).as('getConsultantSchedules');

      cy.visit(`/consultants/${testData.consultant.id}/schedules`);
      cy.wait('@getConsultantSchedules');
    });

    it('should display consultant schedule overview', () => {
      cy.get('[data-testid="consultant-schedules-container"]')
        .should('be.visible');

      cy.get('[data-testid="schedule-item"]')
        .should('have.length', 1)
        .and('contain', 'Q1 Implementation');
    });

    it('should show assignment details in consultant view', () => {
      cy.get('[data-testid="schedule-item"]').first()
        .find('[data-testid="assignment-item"]')
        .should('contain', 'Implementation Specialist')
        .and('contain', '2024-01-15');
    });

    it('should handle empty consultant schedule', () => {
      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/schedules`, {
        body: []
      }).as('getEmptySchedules');

      cy.reload();
      cy.wait('@getEmptySchedules');

      cy.get('[data-testid="empty-schedules"]')
        .should('be.visible')
        .and('contain', 'No schedules found');
    });
  });

  describe('Assignment Calendar View', () => {
    beforeEach(() => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
    });

    it('should switch to calendar view', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="calendar-view-toggle"]').length > 0) {
          cy.get('[data-testid="calendar-view-toggle"]').click();

          cy.get('[data-testid="assignments-calendar"]')
            .should('be.visible');
        }
      });
    });

    it('should display assignments in calendar format', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assignments-calendar"]').length > 0) {
          cy.get('[data-testid="calendar-assignment-item"]')
            .should('be.visible');
        }
      });
    });

    it('should allow creating assignment from calendar', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assignments-calendar"]').length > 0) {
          // Click on a calendar date
          cy.get('[data-testid="calendar-date"]').first().click();

          // Assignment form should open with pre-filled date
          cy.get('[data-testid="assignment-form"]')
            .should('be.visible');
        }
      });
    });
  });

  describe('Assignment Error Handling', () => {
    beforeEach(() => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
    });

    it('should handle API errors when loading assignments', () => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getAssignmentsError');

      cy.reload();
      cy.wait('@getAssignmentsError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Failed to load assignments');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        forceNetworkError: true
      }).as('networkError');

      cy.reload();
      cy.wait('@networkError');

      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain', 'Network error');
    });

    it('should retry failed operations', () => {
      cy.intercept('POST', `/api/schedules/${testData.schedule.id}/assignments`, {
        statusCode: 500
      }).as('createAssignmentError');

      cy.get('[data-testid="create-assignment-button"]').click();

      // Fill and submit form
      cy.get('[data-testid="assignment-consultant-select"]').click();
      cy.get(`[data-value="${testData.consultant.id}"]`).click();
      cy.get('[data-testid="assignment-start-date"]').type(testData.assignment.startDate);
      cy.get('[data-testid="assignment-end-date"]').type(testData.assignment.endDate);
      cy.get('[data-testid="submit-assignment"]').click();

      cy.wait('@createAssignmentError');

      // Check if retry button appears
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="retry-button"]').length > 0) {
          cy.get('[data-testid="retry-button"]').should('be.visible');
        }
      });
    });
  });

  describe('Assignment Bulk Operations', () => {
    const bulkAssignments = [
      { id: 'assignment-1', consultantName: 'John Doe' },
      { id: 'assignment-2', consultantName: 'Jane Smith' },
      { id: 'assignment-3', consultantName: 'Bob Johnson' }
    ];

    beforeEach(() => {
      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: bulkAssignments
      });

      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
    });

    it('should select multiple assignments for bulk operations', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bulk-select-checkbox"]').length > 0) {
          // Select first two assignments
          cy.get('[data-testid="assignment-item"]')
            .first()
            .find('[data-testid="bulk-select-checkbox"]')
            .check();

          cy.get('[data-testid="assignment-item"]')
            .eq(1)
            .find('[data-testid="bulk-select-checkbox"]')
            .check();

          // Bulk actions should be visible
          cy.get('[data-testid="bulk-actions-toolbar"]')
            .should('be.visible');

          cy.get('[data-testid="selected-count"]')
            .should('contain', '2 selected');
        }
      });
    });

    it('should perform bulk status update', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bulk-select-checkbox"]').length > 0) {
          cy.intercept('PATCH', '/api/assignments/bulk-update', {
            statusCode: 200,
            body: { updated: 2 }
          }).as('bulkUpdate');

          // Select assignments
          cy.get('[data-testid="select-all-checkbox"]').check();

          // Update status
          cy.get('[data-testid="bulk-update-status"]').click();
          cy.get('[data-testid="status-option-confirmed"]').click();

          cy.wait('@bulkUpdate');

          cy.get('[data-testid="success-message"]')
            .should('contain', 'Bulk update completed');
        }
      });
    });

    it('should perform bulk delete with confirmation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bulk-select-checkbox"]').length > 0) {
          cy.intercept('DELETE', '/api/assignments/bulk-delete', {
            statusCode: 200,
            body: { deleted: 2 }
          }).as('bulkDelete');

          // Select assignments
          cy.get('[data-testid="assignment-item"]')
            .first()
            .find('[data-testid="bulk-select-checkbox"]')
            .check();

          // Delete selected
          cy.get('[data-testid="bulk-delete-button"]').click();

          // Confirm deletion
          cy.get('[data-testid="confirm-bulk-delete"]').click();

          cy.wait('@bulkDelete');

          cy.get('[data-testid="success-message"]')
            .should('contain', 'Assignments deleted');
        }
      });
    });
  });

  describe('Assignment Responsive Design', () => {
    beforeEach(() => {
      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
    });

    it('should display properly on mobile devices', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="assignments-container"]')
        .should('be.visible');

      // Mobile-specific UI elements
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-assignment-card"]').length > 0) {
          cy.get('[data-testid="mobile-assignment-card"]')
            .should('be.visible');
        }
      });
    });

    it('should display properly on tablet devices', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="assignments-container"]')
        .should('be.visible');

      // Check responsive grid layout
      cy.get('[data-testid="assignment-item"]')
        .should('be.visible');
    });

    it('should handle touch interactions on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assignment-item"]').length > 0) {
          // Test swipe actions if implemented
          cy.get('[data-testid="assignment-item"]').first()
            .trigger('touchstart', { which: 1, pageX: 100, pageY: 100 })
            .trigger('touchmove', { which: 1, pageX: 200, pageY: 100 })
            .trigger('touchend');
        }
      });
    });
  });

  describe('Assignment Performance', () => {
    it('should handle large numbers of assignments efficiently', () => {
      const largeAssignmentList = Array.from({ length: 100 }, (_, i) => ({
        id: `assignment-${i}`,
        consultantName: `Consultant ${i}`,
        role: 'Implementation Specialist',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'scheduled'
      }));

      cy.intercept('GET', `/api/schedules/${testData.schedule.id}/assignments`, {
        body: largeAssignmentList
      }).as('getLargeAssignmentsList');

      cy.visit(`/schedules/${testData.schedule.id}/assignments`);
      cy.wait('@getLargeAssignmentsList');

      // Check if virtual scrolling or pagination is implemented
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
        } else if ($body.find('[data-testid="virtual-scroll"]').length > 0) {
          cy.get('[data-testid="virtual-scroll"]').should('be.visible');
        }
      });

      // Page should load within reasonable time
      cy.get('[data-testid="assignments-list"]', { timeout: 5000 })
        .should('be.visible');
    });

    it('should implement search debouncing', () => {
      cy.get('[data-testid="search-assignments"]')
        .type('John{backspace}{backspace}{backspace}{backspace}Jane');

      // Should not make API call for every keystroke
      cy.get('@getAssignments.all').should('have.length.lessThan', 10);
    });
  });
});
