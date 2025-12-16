describe('Schedules Feature - Exhaustive Tests', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    schedule: {
      title: 'Test Schedule',
      description: 'Test schedule description',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      shiftType: 'day',
      hours: 8
    },
    assignment: {
      consultantId: 'ci-test-consultant',
      role: 'Senior Consultant',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      dailyHours: 8,
      notes: 'Test assignment notes'
    }
  };

  const apiEndpoints = {
    projects: '/api/projects',
    projectSchedules: `/api/projects/${testData.project.id}/schedules`,
    schedules: '/api/schedules',
    scheduleAssignments: '/api/schedules/*/assignments',
    consultantSchedules: `/api/consultants/${testData.consultant.id}/schedules`,
    assignments: '/api/assignments',
    consultants: '/api/consultants'
  };

  beforeEach(() => {
    // Login as admin
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    cy.request('POST', '/api/auth/login', {
      email: testData.admin.email,
      password: testData.admin.password
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  describe('Project Schedules - List View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getProjectSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getProjectSchedules');
    });

    it('should display schedules page layout and components', () => {
      // Page header
      cy.get('[data-testid="schedules-page-header"]')
        .should('be.visible')
        .and('contain.text', 'Schedules');
      
      // Action buttons
      cy.get('[data-testid="button-create-schedule"]')
        .should('be.visible')
        .and('contain.text', /create|add|new/i);
      
      // Schedules list or empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedules-list"]').length > 0) {
          cy.get('[data-testid="schedules-list"]').should('be.visible');
        } else {
          cy.get('[data-testid="empty-state-schedules"]').should('be.visible');
        }
      });
    });

    it('should display proper schedule cards with all information', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-card"]').length > 0) {
          cy.get('[data-testid="schedule-card"]').first().within(() => {
            // Schedule title
            cy.get('[data-testid="schedule-title"]')
              .should('be.visible')
              .and('not.be.empty');
            
            // Schedule dates
            cy.get('[data-testid="schedule-dates"]')
              .should('be.visible')
              .and('not.be.empty');
            
            // Status indicator
            cy.get('[data-testid="schedule-status"]')
              .should('be.visible');
            
            // Action buttons
            cy.get('[data-testid="button-view-schedule"]')
              .should('be.visible');
            cy.get('[data-testid="button-edit-schedule"]')
              .should('be.visible');
            cy.get('[data-testid="button-delete-schedule"]')
              .should('be.visible');
          });
        }
      });
    });

    it('should handle search functionality', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-schedule-search"]').length > 0) {
          cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('searchSchedules');
          
          cy.get('[data-testid="input-schedule-search"]')
            .should('be.visible')
            .type('test schedule');
          
          cy.wait('@searchSchedules');
          
          // Clear search
          cy.get('[data-testid="input-schedule-search"]').clear();
          cy.wait('@searchSchedules');
        }
      });
    });

    it('should handle filter functionality', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-schedule-status"]').length > 0) {
          cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('filterSchedules');
          
          cy.get('[data-testid="filter-schedule-status"]').click();
          cy.get('[data-testid="option-active"]').click();
          
          cy.wait('@filterSchedules');
        }
      });
    });

    it('should handle pagination if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').within(() => {
            cy.get('[data-testid="pagination-info"]')
              .should('be.visible')
              .and('contain.text', /page|of|total/i);
            
            if ($body.find('[data-testid="button-next-page"]').length > 0) {
              cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('nextPage');
              cy.get('[data-testid="button-next-page"]').click();
              cy.wait('@nextPage');
            }
          });
        }
      });
    });
  });

  describe('Create Schedule Modal/Form', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getProjectSchedules');
      cy.intercept('POST', apiEndpoints.projectSchedules).as('createSchedule');
      cy.intercept('GET', apiEndpoints.consultants).as('getConsultants');
      
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getProjectSchedules');
      
      cy.get('[data-testid="button-create-schedule"]').click();
      cy.wait('@getConsultants');
    });

    it('should display create schedule form with all fields', () => {
      cy.get('[data-testid="modal-create-schedule"]')
        .should('be.visible');
      
      // Form fields
      cy.get('[data-testid="input-schedule-title"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="textarea-schedule-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="select-shift-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-daily-hours"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      
      // Action buttons
      cy.get('[data-testid="button-cancel-schedule"]')
        .should('be.visible');
      cy.get('[data-testid="button-save-schedule"]')
        .should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-save-schedule"]').click();
      
      // Check validation messages
      cy.get('[data-testid="error-schedule-title"]')
        .should('be.visible')
        .and('contain.text', /required|field is required/i);
      
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', /required|field is required/i);
      
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /required|field is required/i);
    });

    it('should validate date logic (end date after start date)', () => {
      cy.get('[data-testid="input-schedule-title"]')
        .type(testData.schedule.title);
      
      // Set end date before start date
      cy.get('[data-testid="input-start-date"]')
        .type('2024-02-15');
      cy.get('[data-testid="input-end-date"]')
        .type('2024-02-01');
      
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /after|greater|later/i);
    });

    it('should validate hours input', () => {
      cy.get('[data-testid="input-daily-hours"]').clear().type('-5');
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.get('[data-testid="error-daily-hours"]')
        .should('be.visible')
        .and('contain.text', /positive|greater than 0/i);
      
      // Test maximum hours
      cy.get('[data-testid="input-daily-hours"]').clear().type('25');
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.get('[data-testid="error-daily-hours"]')
        .should('be.visible')
        .and('contain.text', /maximum|24 hours/i);
    });

    it('should successfully create a new schedule', () => {
      // Fill form
      cy.get('[data-testid="input-schedule-title"]')
        .type(testData.schedule.title);
      
      cy.get('[data-testid="textarea-schedule-description"]')
        .type(testData.schedule.description);
      
      cy.get('[data-testid="input-start-date"]')
        .type(testData.schedule.startDate);
      
      cy.get('[data-testid="input-end-date"]')
        .type(testData.schedule.endDate);
      
      cy.get('[data-testid="select-shift-type"]').click();
      cy.get('[data-testid="option-day"]').click();
      
      cy.get('[data-testid="input-daily-hours"]')
        .clear()
        .type(testData.schedule.hours.toString());
      
      // Submit form
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.wait('@createSchedule').then((interception) => {
        expect(interception.request.body).to.include({
          title: testData.schedule.title,
          description: testData.schedule.description,
          startDate: testData.schedule.startDate,
          endDate: testData.schedule.endDate
        });
      });
      
      // Modal should close
      cy.get('[data-testid="modal-create-schedule"]')
        .should('not.exist');
      
      // Success message
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /created|success/i);
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.projectSchedules, {
        statusCode: 400,
        body: { error: 'Schedule title already exists' }
      }).as('createScheduleError');
      
      // Fill and submit form
      cy.get('[data-testid="input-schedule-title"]')
        .type(testData.schedule.title);
      cy.get('[data-testid="input-start-date"]')
        .type(testData.schedule.startDate);
      cy.get('[data-testid="input-end-date"]')
        .type(testData.schedule.endDate);
      
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.wait('@createScheduleError');
      
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });

    it('should cancel form creation', () => {
      // Fill some data
      cy.get('[data-testid="input-schedule-title"]')
        .type('Some title');
      
      cy.get('[data-testid="button-cancel-schedule"]').click();
      
      cy.get('[data-testid="modal-create-schedule"]')
        .should('not.exist');
    });
  });

  describe('Schedule Details View', () => {
    const scheduleId = 'test-schedule-id';
    
    beforeEach(() => {
      cy.intercept('GET', `/api/schedules/${scheduleId}/assignments`).as('getAssignments');
      cy.intercept('GET', apiEndpoints.consultants).as('getConsultants');
      
      cy.visit(`/schedules/${scheduleId}`);
      cy.wait('@getAssignments');
    });

    it('should display schedule details and information', () => {
      // Schedule header
      cy.get('[data-testid="schedule-details-header"]')
        .should('be.visible');
      
      cy.get('[data-testid="schedule-title"]')
        .should('be.visible')
        .and('not.be.empty');
      
      cy.get('[data-testid="schedule-dates"]')
        .should('be.visible')
        .and('contain.text', /to|-/);
      
      cy.get('[data-testid="schedule-status"]')
        .should('be.visible');
      
      // Schedule description
      cy.get('[data-testid="schedule-description"]')
        .should('be.visible');
      
      // Assignments section
      cy.get('[data-testid="assignments-section"]')
        .should('be.visible');
      
      cy.get('[data-testid="button-add-assignment"]')
        .should('be.visible');
    });

    it('should display assignments list or empty state', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assignments-list"]').length > 0) {
          cy.get('[data-testid="assignments-list"]').should('be.visible');
          
          cy.get('[data-testid="assignment-card"]').first().within(() => {
            cy.get('[data-testid="consultant-name"]')
              .should('be.visible')
              .and('not.be.empty');
            
            cy.get('[data-testid="assignment-role"]')
              .should('be.visible')
              .and('not.be.empty');
            
            cy.get('[data-testid="assignment-dates"]')
              .should('be.visible');
            
            cy.get('[data-testid="assignment-hours"]')
              .should('be.visible');
            
            cy.get('[data-testid="button-edit-assignment"]')
              .should('be.visible');
            cy.get('[data-testid="button-delete-assignment"]')
              .should('be.visible');
          });
        } else {
          cy.get('[data-testid="empty-state-assignments"]')
            .should('be.visible')
            .and('contain.text', /no assignments|empty/i);
        }
      });
    });

    it('should handle schedule status updates', () => {
      cy.intercept('PATCH', `/api/schedules/${scheduleId}/status`).as('updateScheduleStatus');
      
      cy.get('[data-testid="dropdown-schedule-status"]').click();
      cy.get('[data-testid="status-active"]').click();
      
      cy.wait('@updateScheduleStatus');
      
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /updated|success/i);
    });
  });

  describe('Assignment Management', () => {
    const scheduleId = 'test-schedule-id';
    
    beforeEach(() => {
      cy.intercept('GET', `/api/schedules/${scheduleId}/assignments`).as('getAssignments');
      cy.intercept('POST', `/api/schedules/${scheduleId}/assignments`).as('createAssignment');
      cy.intercept('GET', apiEndpoints.consultants).as('getConsultants');
      
      cy.visit(`/schedules/${scheduleId}`);
      cy.wait('@getAssignments');
      
      cy.get('[data-testid="button-add-assignment"]').click();
      cy.wait('@getConsultants');
    });

    it('should display add assignment form with all fields', () => {
      cy.get('[data-testid="modal-add-assignment"]')
        .should('be.visible');
      
      // Form fields
      cy.get('[data-testid="select-consultant"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-assignment-role"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-assignment-start-date"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-assignment-end-date"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-daily-hours"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      
      cy.get('[data-testid="textarea-assignment-notes"]')
        .should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-cancel-assignment"]')
        .should('be.visible');
      cy.get('[data-testid="button-save-assignment"]')
        .should('be.visible');
    });

    it('should validate assignment form fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Check validation messages
      cy.get('[data-testid="error-consultant"]')
        .should('be.visible')
        .and('contain.text', /required|select/i);
      
      cy.get('[data-testid="error-assignment-role"]')
        .should('be.visible')
        .and('contain.text', /required|field is required/i);
      
      cy.get('[data-testid="error-assignment-start-date"]')
        .should('be.visible')
        .and('contain.text', /required|field is required/i);
      
      cy.get('[data-testid="error-assignment-end-date"]')
        .should('be.visible')
        .and('contain.text', /required|field is required/i);
    });

    it('should validate assignment dates within schedule dates', () => {
      // Select consultant
      cy.get('[data-testid="select-consultant"]').click();
      cy.get('[data-testid="option-consultant"]').first().click();
      
      cy.get('[data-testid="input-assignment-role"]')
        .type(testData.assignment.role);
      
      // Set dates outside schedule range
      cy.get('[data-testid="input-assignment-start-date"]')
        .type('2024-01-01'); // Before schedule start
      cy.get('[data-testid="input-assignment-end-date"]')
        .type('2024-03-01'); // After schedule end
      
      cy.get('[data-testid="button-save-assignment"]').click();
      
      cy.get('[data-testid="error-assignment-dates"]')
        .should('be.visible')
        .and('contain.text', /within schedule|date range/i);
    });

    it('should check for consultant availability conflicts', () => {
      cy.intercept('GET', '/api/consultants/*/availability*').as('checkAvailability');
      
      // Select consultant
      cy.get('[data-testid="select-consultant"]').click();
      cy.get('[data-testid="option-consultant"]').first().click();
      
      cy.wait('@checkAvailability');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="availability-conflict-warning"]').length > 0) {
          cy.get('[data-testid="availability-conflict-warning"]')
            .should('be.visible')
            .and('contain.text', /conflict|overlap|unavailable/i);
        }
      });
    });

    it('should successfully create assignment', () => {
      // Fill form
      cy.get('[data-testid="select-consultant"]').click();
      cy.get('[data-testid="option-consultant"]').first().click();
      
      cy.get('[data-testid="input-assignment-role"]')
        .type(testData.assignment.role);
      
      cy.get('[data-testid="input-assignment-start-date"]')
        .type(testData.assignment.startDate);
      
      cy.get('[data-testid="input-assignment-end-date"]')
        .type(testData.assignment.endDate);
      
      cy.get('[data-testid="input-daily-hours"]')
        .clear()
        .type(testData.assignment.dailyHours.toString());
      
      cy.get('[data-testid="textarea-assignment-notes"]')
        .type(testData.assignment.notes);
      
      // Submit form
      cy.get('[data-testid="button-save-assignment"]').click();
      
      cy.wait('@createAssignment').then((interception) => {
        expect(interception.request.body).to.include({
          role: testData.assignment.role,
          startDate: testData.assignment.startDate,
          endDate: testData.assignment.endDate,
          dailyHours: testData.assignment.dailyHours,
          notes: testData.assignment.notes
        });
      });
      
      // Modal should close
      cy.get('[data-testid="modal-add-assignment"]')
        .should('not.exist');
      
      // Success message
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /assigned|success/i);
    });

    it('should handle assignment deletion', () => {
      const assignmentId = 'test-assignment-id';
      cy.intercept('DELETE', `/api/assignments/${assignmentId}`).as('deleteAssignment');
      
      // Go back to schedule view and delete assignment
      cy.get('[data-testid="button-cancel-assignment"]').click();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="assignment-card"]').length > 0) {
          cy.get('[data-testid="assignment-card"]').first().within(() => {
            cy.get('[data-testid="button-delete-assignment"]').click();
          });
          
          // Confirm deletion
          cy.get('[data-testid="modal-confirm-delete"]')
            .should('be.visible');
          cy.get('[data-testid="button-confirm-delete"]').click();
          
          cy.wait('@deleteAssignment');
          
          cy.get('[data-testid="toast-success"]')
            .should('be.visible')
            .and('contain.text', /deleted|removed/i);
        }
      });
    });
  });

  describe('Consultant Schedules View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantSchedules).as('getConsultantSchedules');
      cy.visit(`/consultants/${testData.consultant.id}/schedules`);
      cy.wait('@getConsultantSchedules');
    });

    it('should display consultant schedule overview', () => {
      // Page header
      cy.get('[data-testid="consultant-schedules-header"]')
        .should('be.visible')
        .and('contain.text', 'Schedule');
      
      // Consultant info
      cy.get('[data-testid="consultant-info"]')
        .should('be.visible');
      
      // Calendar or schedule view
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-calendar"]').length > 0) {
          cy.get('[data-testid="schedule-calendar"]').should('be.visible');
        } else if ($body.find('[data-testid="schedule-list-view"]').length > 0) {
          cy.get('[data-testid="schedule-list-view"]').should('be.visible');
        } else {
          cy.get('[data-testid="empty-state-schedule"]')
            .should('be.visible')
            .and('contain.text', /no schedule|empty/i);
        }
      });
    });

    it('should handle view toggle between calendar and list', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="toggle-schedule-view"]').length > 0) {
          cy.get('[data-testid="toggle-schedule-view"]').click();
          
          // Check if view changed
          cy.get('[data-testid="schedule-view-container"]')
            .should('be.visible');
        }
      });
    });

    it('should display schedule entries with proper information', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-entry"]').length > 0) {
          cy.get('[data-testid="schedule-entry"]').first().within(() => {
            cy.get('[data-testid="project-name"]')
              .should('be.visible')
              .and('not.be.empty');
            
            cy.get('[data-testid="schedule-date"]')
              .should('be.visible')
              .and('not.be.empty');
            
            cy.get('[data-testid="schedule-hours"]')
              .should('be.visible')
              .and('match', /\d+/); // Contains numbers
            
            cy.get('[data-testid="schedule-role"]')
              .should('be.visible')
              .and('not.be.empty');
          });
        }
      });
    });

    it('should filter schedule by date range', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-date-range"]').length > 0) {
          cy.intercept('GET', apiEndpoints.consultantSchedules + '*').as('filterByDate');
          
          cy.get('[data-testid="input-filter-start-date"]')
            .type('2024-02-01');
          cy.get('[data-testid="input-filter-end-date"]')
            .type('2024-02-28');
          
          cy.get('[data-testid="button-apply-filter"]').click();
          
          cy.wait('@filterByDate');
        }
      });
    });
  });

  describe('Schedule Search and Filters', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should search schedules by title', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-search-schedules"]').length > 0) {
          cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('searchSchedules');
          
          cy.get('[data-testid="input-search-schedules"]')
            .type('Test Schedule');
          
          // Debounced search
          cy.wait(1000);
          cy.wait('@searchSchedules');
          
          // Clear search
          cy.get('[data-testid="button-clear-search"]').click();
          cy.wait('@searchSchedules');
        }
      });
    });

    it('should filter by schedule status', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-status"]').length > 0) {
          cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('filterStatus');
          
          cy.get('[data-testid="filter-status"]').click();
          cy.get('[data-testid="status-option-active"]').click();
          
          cy.wait('@filterStatus');
          
          // Reset filter
          cy.get('[data-testid="button-reset-filters"]').click();
          cy.wait('@filterStatus');
        }
      });
    });

    it('should filter by date range', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-date-range"]').length > 0) {
          cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('filterDate');
          
          cy.get('[data-testid="input-filter-start"]')
            .type('2024-02-01');
          cy.get('[data-testid="input-filter-end"]')
            .type('2024-02-28');
          
          cy.get('[data-testid="button-apply-date-filter"]').click();
          
          cy.wait('@filterDate');
        }
      });
    });

    it('should sort schedules by different criteria', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="sort-schedules"]').length > 0) {
          cy.intercept('GET', apiEndpoints.projectSchedules + '*').as('sortSchedules');
          
          cy.get('[data-testid="sort-schedules"]').click();
          cy.get('[data-testid="sort-by-date"]').click();
          
          cy.wait('@sortSchedules');
          
          // Test reverse sort
          cy.get('[data-testid="toggle-sort-direction"]').click();
          cy.wait('@sortSchedules');
        }
      });
    });
  });

  describe('Schedule Bulk Operations', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should select multiple schedules for bulk operations', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-checkbox"]').length > 1) {
          // Select multiple schedules
          cy.get('[data-testid="schedule-checkbox"]')
            .first()
            .check();
          cy.get('[data-testid="schedule-checkbox"]')
            .eq(1)
            .check();
          
          // Bulk actions should appear
          cy.get('[data-testid="bulk-actions-bar"]')
            .should('be.visible');
          
          cy.get('[data-testid="selected-count"]')
            .should('contain.text', '2');
        }
      });
    });

    it('should perform bulk status update', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-checkbox"]').length > 0) {
          cy.intercept('PATCH', '/api/schedules/bulk/status').as('bulkStatusUpdate');
          
          cy.get('[data-testid="select-all-schedules"]').check();
          
          cy.get('[data-testid="bulk-action-status"]').click();
          cy.get('[data-testid="status-option-active"]').click();
          
          cy.get('[data-testid="button-confirm-bulk-action"]').click();
          
          cy.wait('@bulkStatusUpdate');
          
          cy.get('[data-testid="toast-success"]')
            .should('be.visible')
            .and('contain.text', /updated|success/i);
        }
      });
    });

    it('should perform bulk delete with confirmation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-checkbox"]').length > 0) {
          cy.intercept('DELETE', '/api/schedules/bulk').as('bulkDelete');
          
          cy.get('[data-testid="schedule-checkbox"]')
            .first()
            .check();
          
          cy.get('[data-testid="bulk-action-delete"]').click();
          
          // Confirmation dialog
          cy.get('[data-testid="modal-confirm-bulk-delete"]')
            .should('be.visible')
            .and('contain.text', /permanently delete|cannot be undone/i);
          
          cy.get('[data-testid="button-confirm-bulk-delete"]').click();
          
          cy.wait('@bulkDelete');
          
          cy.get('[data-testid="toast-success"]')
            .should('be.visible')
            .and('contain.text', /deleted|removed/i);
        }
      });
    });
  });

  describe('Schedule Export and Reporting', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should export schedules to CSV', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-export-schedules"]').length > 0) {
          cy.intercept('GET', '/api/schedules/export*').as('exportSchedules');
          
          cy.get('[data-testid="button-export-schedules"]').click();
          cy.get('[data-testid="export-format-csv"]').click();
          
          cy.wait('@exportSchedules');
          
          cy.get('[data-testid="toast-success"]')
            .should('be.visible')
            .and('contain.text', /export|download/i);
        }
      });
    });

    it('should generate schedule reports', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-generate-report"]').length > 0) {
          cy.intercept('POST', '/api/schedules/reports').as('generateReport');
          
          cy.get('[data-testid="button-generate-report"]').click();
          
          // Report options modal
          cy.get('[data-testid="modal-report-options"]')
            .should('be.visible');
          
          cy.get('[data-testid="input-report-start-date"]')
            .type('2024-02-01');
          cy.get('[data-testid="input-report-end-date"]')
            .type('2024-02-28');
          
          cy.get('[data-testid="checkbox-include-assignments"]')
            .check();
          
          cy.get('[data-testid="button-generate"]').click();
          
          cy.wait('@generateReport');
          
          cy.get('[data-testid="toast-success"]')
            .should('be.visible')
            .and('contain.text', /report generated|success/i);
        }
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should display mobile-friendly schedule view', () => {
      cy.viewport(375, 667); // iPhone SE
      
      // Mobile navigation
      cy.get('[data-testid="mobile-schedule-header"]')
        .should('be.visible');
      
      // Compact schedule cards
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-card"]').length > 0) {
          cy.get('[data-testid="schedule-card"]')
            .should('have.css', 'flex-direction', 'column');
        }
      });
      
      // Mobile action menu
      cy.get('[data-testid="mobile-actions-menu"]')
        .should('be.visible');
    });

    it('should handle mobile create schedule form', () => {
      cy.viewport(375, 667);
      
      cy.get('[data-testid="button-create-schedule"]').click();
      
      // Full-screen modal on mobile
      cy.get('[data-testid="modal-create-schedule"]')
        .should('be.visible')
        .and('have.css', 'width')
        .and('match', /100%|100vw/);
    });
  });

  describe('Error States and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getSchedulesError');
      
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedulesError');
      
      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', /error|failed to load/i);
      
      cy.get('[data-testid="button-retry"]')
        .should('be.visible');
    });

    it('should handle empty state properly', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 200,
        body: { schedules: [], total: 0 }
      }).as('getEmptySchedules');
      
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getEmptySchedules');
      
      cy.get('[data-testid="empty-state-schedules"]')
        .should('be.visible')
        .and('contain.text', /no schedules|create your first/i);
      
      cy.get('[data-testid="button-create-first-schedule"]')
        .should('be.visible');
    });

    it('should handle concurrent modification conflicts', () => {
      const scheduleId = 'test-schedule-id';
      
      cy.intercept('PATCH', `/api/schedules/${scheduleId}/status`, {
        statusCode: 409,
        body: { error: 'Schedule was modified by another user' }
      }).as('conflictError');
      
      cy.visit(`/schedules/${scheduleId}`);
      
      cy.get('[data-testid="dropdown-schedule-status"]').click();
      cy.get('[data-testid="status-active"]').click();
      
      cy.wait('@conflictError');
      
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', /conflict|modified by another user/i);
    });

    it('should handle very long schedule titles gracefully', () => {
      const longTitle = 'A'.repeat(500);
      
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
      
      cy.get('[data-testid="button-create-schedule"]').click();
      
      cy.get('[data-testid="input-schedule-title"]')
        .type(longTitle);
      
      // Should truncate or show validation error
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-schedule-title"]').length > 0) {
          cy.get('[data-testid="error-schedule-title"]')
            .should('be.visible')
            .and('contain.text', /too long|maximum length/i);
        } else {
          cy.get('[data-testid="input-schedule-title"]')
            .should('have.attr', 'maxlength');
        }
      });
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should support keyboard navigation', () => {
      // Tab through elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'button-create-schedule');
      
      // Enter to activate
      cy.focused().type('{enter}');
      
      cy.get('[data-testid="modal-create-schedule"]')
        .should('be.visible');
      
      // Tab through form fields
      cy.get('[data-testid="input-schedule-title"]').tab();
      cy.focused().should('have.attr', 'data-testid', 'textarea-schedule-description');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="button-create-schedule"]')
        .should('have.attr', 'aria-label')
        .and('not.be.empty');
      
      cy.get('[data-testid="schedules-list"]')
        .should('have.attr', 'role', 'list');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-card"]').length > 0) {
          cy.get('[data-testid="schedule-card"]')
            .should('have.attr', 'role', 'listitem');
        }
      });
    });

    it('should support screen reader announcements', () => {
      cy.get('[data-testid="button-create-schedule"]').click();
      
      // Live region for form validation
      cy.get('[aria-live="polite"]')
        .should('exist');
      
      // Status announcements
      cy.get('[aria-live="assertive"]')
        .should('exist');
    });
  });
});
