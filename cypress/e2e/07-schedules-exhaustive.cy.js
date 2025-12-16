describe('Schedules Feature - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123',
      id: 'ci-test-user'
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
      name: 'Test Schedule',
      description: 'Test schedule description',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      shiftType: 'day',
      hoursPerDay: 8,
      status: 'draft'
    },
    assignment: {
      role: 'Implementation Specialist',
      hourlyRate: 75,
      notes: 'Test assignment notes'
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    projects: '/api/projects',
    schedules: (projectId) => `/api/projects/${projectId}/schedules`,
    schedule: (scheduleId) => `/api/schedules/${scheduleId}`,
    scheduleStatus: (scheduleId) => `/api/schedules/${scheduleId}/status`,
    assignments: (scheduleId) => `/api/schedules/${scheduleId}/assignments`,
    assignment: (assignmentId) => `/api/assignments/${assignmentId}`,
    consultantSchedules: (consultantId) => `/api/consultants/${consultantId}/schedules`,
    consultants: '/api/consultants'
  };

  beforeEach(() => {
    // Reset state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });

  describe('Schedules List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projects, { fixture: 'projects.json' }).as('getProjects');
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { fixture: 'schedules.json' }).as('getSchedules');
      
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getProjects');
      cy.wait('@getSchedules');
    });

    it('should display schedules list page layout correctly', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', 'Schedules');

      // Action buttons
      cy.get('[data-testid="button-create-schedule"]')
        .should('be.visible')
        .and('contain.text', 'Create Schedule');

      // Filters and search
      cy.get('[data-testid="schedules-filters"]').should('be.visible');
      cy.get('[data-testid="search-schedules"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');

      // Status filter dropdown
      cy.get('[data-testid="filter-status"]').should('be.visible');
      cy.get('[data-testid="filter-date-range"]').should('be.visible');

      // Schedules table/grid
      cy.get('[data-testid="schedules-table"]').should('be.visible');
      
      // Verify table headers
      const expectedHeaders = ['Name', 'Date Range', 'Status', 'Assignments', 'Actions'];
      expectedHeaders.forEach(header => {
        cy.get('[data-testid="schedules-table"]')
          .find('thead th')
          .should('contain.text', header);
      });

      // Pagination (if present)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
        }
      });
    });

    it('should handle empty state correctly', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { body: [] }).as('getEmptySchedules');
      cy.reload();
      cy.wait('@getEmptySchedules');

      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]')
        .should('contain.text', 'No schedules found');
      cy.get('[data-testid="empty-state-description"]').should('be.visible');
      cy.get('[data-testid="button-create-first-schedule"]')
        .should('be.visible')
        .and('contain.text', 'Create Schedule');
    });

    it('should display schedules data correctly in table', () => {
      cy.get('[data-testid="schedule-row"]').should('have.length.at.least', 1);
      
      // Check first schedule row
      cy.get('[data-testid="schedule-row"]').first().within(() => {
        cy.get('[data-testid="schedule-name"]').should('be.visible');
        cy.get('[data-testid="schedule-date-range"]').should('be.visible');
        cy.get('[data-testid="schedule-status"]').should('be.visible');
        cy.get('[data-testid="schedule-assignments-count"]').should('be.visible');
        cy.get('[data-testid="schedule-actions"]').should('be.visible');
      });
    });

    it('should handle schedule status badges correctly', () => {
      const statusColors = {
        draft: 'gray',
        active: 'green',
        completed: 'blue',
        cancelled: 'red'
      };

      Object.keys(statusColors).forEach(status => {
        cy.get('[data-testid="schedule-status"]').then(($elements) => {
          const statusElement = Array.from($elements).find(el => 
            el.textContent.toLowerCase().includes(status)
          );
          if (statusElement) {
            cy.wrap(statusElement)
              .should('have.class', `bg-${statusColors[status]}-100`)
              .or('have.class', `text-${statusColors[status]}-800`);
          }
        });
      });
    });
  });

  describe('Schedules Search and Filtering', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { fixture: 'schedules.json' }).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should search schedules by name', () => {
      const searchTerm = 'Implementation';
      
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        query: { search: searchTerm }
      }, { fixture: 'schedules-filtered.json' }).as('searchSchedules');

      cy.get('[data-testid="search-schedules"]').type(searchTerm);
      cy.get('[data-testid="button-search"]').click();
      
      cy.wait('@searchSchedules');
      cy.get('[data-testid="schedule-row"]').should('have.length.at.least', 1);
      cy.get('[data-testid="schedule-name"]').first()
        .should('contain.text', searchTerm);
    });

    it('should filter schedules by status', () => {
      const statuses = ['draft', 'active', 'completed', 'cancelled'];
      
      statuses.forEach(status => {
        cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
          query: { status }
        }, { fixture: `schedules-${status}.json` }).as(`filterBy${status}`);

        cy.get('[data-testid="filter-status"]').click();
        cy.get(`[data-testid="status-option-${status}"]`).click();
        
        cy.wait(`@filterBy${status}`);
        
        if (status !== 'all') {
          cy.get('[data-testid="schedule-status"]').each(($status) => {
            cy.wrap($status).should('contain.text', status);
          });
        }
      });
    });

    it('should filter schedules by date range', () => {
      const dateRange = {
        start: '2024-01-01',
        end: '2024-12-31'
      };

      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        query: { startDate: dateRange.start, endDate: dateRange.end }
      }, { fixture: 'schedules-date-filtered.json' }).as('filterByDate');

      cy.get('[data-testid="filter-date-range"]').click();
      cy.get('[data-testid="date-range-start"]').type(dateRange.start);
      cy.get('[data-testid="date-range-end"]').type(dateRange.end);
      cy.get('[data-testid="button-apply-date-filter"]').click();

      cy.wait('@filterByDate');
      cy.get('[data-testid="schedule-row"]').should('have.length.at.least', 1);
    });

    it('should clear all filters', () => {
      // Apply some filters first
      cy.get('[data-testid="search-schedules"]').type('test');
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="status-option-active"]').click();

      // Clear filters
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { fixture: 'schedules.json' }).as('clearFilters');
      
      cy.get('[data-testid="button-clear-filters"]').click();
      cy.wait('@clearFilters');

      // Verify filters are cleared
      cy.get('[data-testid="search-schedules"]').should('have.value', '');
      cy.get('[data-testid="filter-status"]').should('contain.text', 'All Statuses');
    });

    it('should handle no search results', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        query: { search: 'nonexistentschedule' }
      }, { body: [] }).as('noResults');

      cy.get('[data-testid="search-schedules"]').type('nonexistentschedule');
      cy.get('[data-testid="button-search"]').click();
      
      cy.wait('@noResults');
      cy.get('[data-testid="no-results"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]')
        .should('contain.text', 'No schedules found');
    });
  });

  describe('Create Schedule - Form and Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { fixture: 'schedules.json' }).as('getSchedules');
      cy.intercept('GET', apiEndpoints.consultants, { fixture: 'consultants.json' }).as('getConsultants');
      
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
      cy.get('[data-testid="button-create-schedule"]').click();
    });

    it('should display create schedule form correctly', () => {
      cy.get('[data-testid="create-schedule-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Create Schedule');

      // Form fields
      cy.get('[data-testid="input-schedule-name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="textarea-description"]').should('be.visible');
      
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');

      cy.get('[data-testid="select-shift-type"]').should('be.visible');
      cy.get('[data-testid="input-hours-per-day"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');

      // Action buttons
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('contain.text', 'Cancel');
      cy.get('[data-testid="button-create"]')
        .should('be.visible')
        .and('contain.text', 'Create Schedule');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="button-create"]').click();

      // Check for validation errors
      cy.get('[data-testid="error-schedule-name"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', 'required');

      // Modal should remain open
      cy.get('[data-testid="create-schedule-modal"]').should('be.visible');
    });

    it('should validate date range logic', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const today = new Date();

      // End date before start date
      cy.get('[data-testid="input-start-date"]')
        .type(tomorrow.toISOString().split('T')[0]);
      cy.get('[data-testid="input-end-date"]')
        .type(today.toISOString().split('T')[0]);

      cy.get('[data-testid="button-create"]').click();

      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', 'End date must be after start date');
    });

    it('should validate hours per day', () => {
      // Test negative hours
      cy.get('[data-testid="input-hours-per-day"]').clear().type('-5');
      cy.get('[data-testid="button-create"]').click();
      
      cy.get('[data-testid="error-hours-per-day"]')
        .should('be.visible')
        .and('contain.text', 'must be positive');

      // Test excessive hours
      cy.get('[data-testid="input-hours-per-day"]').clear().type('25');
      cy.get('[data-testid="button-create"]').click();
      
      cy.get('[data-testid="error-hours-per-day"]')
        .should('contain.text', 'maximum of 24 hours');
    });

    it('should create schedule successfully', () => {
      const newSchedule = {
        id: 'new-schedule-id',
        ...testData.schedule
      };

      cy.intercept('POST', apiEndpoints.schedules(testData.project.id), {
        statusCode: 201,
        body: newSchedule
      }).as('createSchedule');

      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { 
        fixture: 'schedules-with-new.json' 
      }).as('getUpdatedSchedules');

      // Fill form
      cy.get('[data-testid="input-schedule-name"]').type(testData.schedule.name);
      cy.get('[data-testid="textarea-description"]').type(testData.schedule.description);
      cy.get('[data-testid="input-start-date"]').type(testData.schedule.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.schedule.endDate);
      cy.get('[data-testid="select-shift-type"]').select(testData.schedule.shiftType);
      cy.get('[data-testid="input-hours-per-day"]').type(testData.schedule.hoursPerDay.toString());

      cy.get('[data-testid="button-create"]').click();

      cy.wait('@createSchedule').then((interception) => {
        expect(interception.request.body).to.include({
          name: testData.schedule.name,
          description: testData.schedule.description,
          startDate: testData.schedule.startDate,
          endDate: testData.schedule.endDate
        });
      });

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Schedule created successfully');
      
      cy.get('[data-testid="create-schedule-modal"]').should('not.exist');
      cy.wait('@getUpdatedSchedules');
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', apiEndpoints.schedules(testData.project.id), {
        statusCode: 400,
        body: { error: 'Schedule name already exists' }
      }).as('createScheduleError');

      // Fill form
      cy.get('[data-testid="input-schedule-name"]').type(testData.schedule.name);
      cy.get('[data-testid="input-start-date"]').type(testData.schedule.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.schedule.endDate);

      cy.get('[data-testid="button-create"]').click();

      cy.wait('@createScheduleError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Schedule name already exists');
      
      // Modal should remain open
      cy.get('[data-testid="create-schedule-modal"]').should('be.visible');
    });

    it('should cancel schedule creation', () => {
      // Fill some data
      cy.get('[data-testid="input-schedule-name"]').type('Test Schedule');
      
      cy.get('[data-testid="button-cancel"]').click();
      cy.get('[data-testid="create-schedule-modal"]').should('not.exist');
      
      // Verify no API call was made
      cy.get('@createSchedule.all').should('have.length', 0);
    });
  });

  describe('Schedule Detail View', () => {
    const scheduleId = 'test-schedule-id';

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedule(scheduleId), { fixture: 'schedule-detail.json' }).as('getScheduleDetail');
      cy.intercept('GET', apiEndpoints.assignments(scheduleId), { fixture: 'schedule-assignments.json' }).as('getAssignments');
      
      cy.visit(`/schedules/${scheduleId}`);
      cy.wait('@getScheduleDetail');
      cy.wait('@getAssignments');
    });

    it('should display schedule details correctly', () => {
      // Header section
      cy.get('[data-testid="schedule-header"]').should('be.visible');
      cy.get('[data-testid="schedule-name"]')
        .should('be.visible')
        .and('contain.text', testData.schedule.name);
      
      cy.get('[data-testid="schedule-status-badge"]').should('be.visible');
      cy.get('[data-testid="schedule-actions"]').should('be.visible');

      // Details section
      cy.get('[data-testid="schedule-details"]').should('be.visible');
      cy.get('[data-testid="schedule-description"]').should('be.visible');
      cy.get('[data-testid="schedule-date-range"]').should('be.visible');
      cy.get('[data-testid="schedule-shift-type"]').should('be.visible');
      cy.get('[data-testid="schedule-hours-per-day"]').should('be.visible');

      // Assignments section
      cy.get('[data-testid="assignments-section"]').should('be.visible');
      cy.get('[data-testid="assignments-title"]')
        .should('contain.text', 'Assignments');
      
      cy.get('[data-testid="button-add-assignment"]')
        .should('be.visible')
        .and('contain.text', 'Add Assignment');
    });

    it('should display assignments table', () => {
      cy.get('[data-testid="assignments-table"]').should('be.visible');
      
      // Check table headers
      const expectedHeaders = ['Consultant', 'Role', 'Rate', 'Status', 'Actions'];
      expectedHeaders.forEach(header => {
        cy.get('[data-testid="assignments-table"]')
          .find('thead th')
          .should('contain.text', header);
      });

      // Check assignment rows
      cy.get('[data-testid="assignment-row"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="assignment-row"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('be.visible');
        cy.get('[data-testid="assignment-role"]').should('be.visible');
        cy.get('[data-testid="hourly-rate"]').should('be.visible');
        cy.get('[data-testid="assignment-status"]').should('be.visible');
        cy.get('[data-testid="assignment-actions"]').should('be.visible');
      });
    });

    it('should handle empty assignments state', () => {
      cy.intercept('GET', apiEndpoints.assignments(scheduleId), { body: [] }).as('getEmptyAssignments');
      cy.reload();
      cy.wait('@getEmptyAssignments');

      cy.get('[data-testid="empty-assignments"]').should('be.visible');
      cy.get('[data-testid="empty-assignments-message"]')
        .should('contain.text', 'No assignments');
      cy.get('[data-testid="button-add-first-assignment"]')
        .should('be.visible');
    });
  });

  describe('Schedule Status Management', () => {
    const scheduleId = 'test-schedule-id';

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedule(scheduleId), { fixture: 'schedule-detail.json' }).as('getScheduleDetail');
      cy.visit(`/schedules/${scheduleId}`);
      cy.wait('@getScheduleDetail');
    });

    it('should update schedule status', () => {
      const statuses = ['draft', 'active', 'completed', 'cancelled'];
      
      statuses.forEach(status => {
        cy.intercept('PATCH', apiEndpoints.scheduleStatus(scheduleId), {
          statusCode: 200,
          body: { status }
        }).as(`updateStatus${status}`);

        cy.get('[data-testid="schedule-status-dropdown"]').click();
        cy.get(`[data-testid="status-option-${status}"]`).click();

        cy.wait(`@updateStatus${status}`).then((interception) => {
          expect(interception.request.body).to.include({ status });
        });

        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', 'Status updated');

        cy.get('[data-testid="schedule-status-badge"]')
          .should('contain.text', status);
      });
    });

    it('should handle status update errors', () => {
      cy.intercept('PATCH', apiEndpoints.scheduleStatus(scheduleId), {
        statusCode: 400,
        body: { error: 'Cannot change status with active assignments' }
      }).as('updateStatusError');

      cy.get('[data-testid="schedule-status-dropdown"]').click();
      cy.get('[data-testid="status-option-cancelled"]').click();

      cy.wait('@updateStatusError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Cannot change status');
    });

    it('should show confirmation dialog for destructive status changes', () => {
      cy.get('[data-testid="schedule-status-dropdown"]').click();
      cy.get('[data-testid="status-option-cancelled"]').click();

      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-title"]')
        .should('contain.text', 'Cancel Schedule');
      cy.get('[data-testid="confirm-message"]')
        .should('contain.text', 'This action cannot be undone');

      // Cancel confirmation
      cy.get('[data-testid="button-confirm-cancel"]').click();
      cy.get('[data-testid="confirm-dialog"]').should('not.exist');
    });
  });

  describe('Assignment Management', () => {
    const scheduleId = 'test-schedule-id';

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedule(scheduleId), { fixture: 'schedule-detail.json' }).as('getScheduleDetail');
      cy.intercept('GET', apiEndpoints.assignments(scheduleId), { fixture: 'schedule-assignments.json' }).as('getAssignments');
      cy.intercept('GET', apiEndpoints.consultants, { fixture: 'consultants.json' }).as('getConsultants');
      
      cy.visit(`/schedules/${scheduleId}`);
      cy.wait('@getScheduleDetail');
      cy.wait('@getAssignments');
    });

    it('should display add assignment form', () => {
      cy.get('[data-testid="button-add-assignment"]').click();
      
      cy.get('[data-testid="add-assignment-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Add Assignment');

      // Form fields
      cy.get('[data-testid="select-consultant"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-role"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-hourly-rate"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number')
        .and('have.attr', 'required');

      cy.get('[data-testid="textarea-notes"]').should('be.visible');

      // Action buttons
      cy.get('[data-testid="button-cancel-assignment"]')
        .should('be.visible');
      cy.get('[data-testid="button-create-assignment"]')
        .should('be.visible');
    });

    it('should validate assignment form', () => {
      cy.get('[data-testid="button-add-assignment"]').click();
      cy.get('[data-testid="button-create-assignment"]').click();

      // Check validation errors
      cy.get('[data-testid="error-consultant"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-role"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-hourly-rate"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });

    it('should create assignment successfully', () => {
      const newAssignment = {
        id: 'new-assignment-id',
        scheduleId,
        consultantId: testData.consultant.id,
        ...testData.assignment
      };

      cy.intercept('POST', apiEndpoints.assignments(scheduleId), {
        statusCode: 201,
        body: newAssignment
      }).as('createAssignment');

      cy.intercept('GET', apiEndpoints.assignments(scheduleId), { 
        fixture: 'assignments-with-new.json' 
      }).as('getUpdatedAssignments');

      cy.get('[data-testid="button-add-assignment"]').click();

      // Fill form
      cy.get('[data-testid="select-consultant"]').select(testData.consultant.id);
      cy.get('[data-testid="input-role"]').type(testData.assignment.role);
      cy.get('[data-testid="input-hourly-rate"]').type(testData.assignment.hourlyRate.toString());
      cy.get('[data-testid="textarea-notes"]').type(testData.assignment.notes);

      cy.get('[data-testid="button-create-assignment"]').click();

      cy.wait('@createAssignment').then((interception) => {
        expect(interception.request.body).to.include({
          consultantId: testData.consultant.id,
          role: testData.assignment.role,
          hourlyRate: testData.assignment.hourlyRate
        });
      });

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Assignment created');
      
      cy.get('[data-testid="add-assignment-modal"]').should('not.exist');
      cy.wait('@getUpdatedAssignments');
    });

    it('should handle duplicate consultant assignment', () => {
      cy.intercept('POST', apiEndpoints.assignments(scheduleId), {
        statusCode: 400,
        body: { error: 'Consultant already assigned to this schedule' }
      }).as('createDuplicateAssignment');

      cy.get('[data-testid="button-add-assignment"]').click();
      
      cy.get('[data-testid="select-consultant"]').select(testData.consultant.id);
      cy.get('[data-testid="input-role"]').type(testData.assignment.role);
      cy.get('[data-testid="input-hourly-rate"]').type(testData.assignment.hourlyRate.toString());

      cy.get('[data-testid="button-create-assignment"]').click();

      cy.wait('@createDuplicateAssignment');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'already assigned');
    });

    it('should delete assignment', () => {
      const assignmentId = 'assignment-to-delete';

      cy.intercept('DELETE', apiEndpoints.assignment(assignmentId), {
        statusCode: 200
      }).as('deleteAssignment');

      cy.intercept('GET', apiEndpoints.assignments(scheduleId), { 
        fixture: 'assignments-after-delete.json' 
      }).as('getAssignmentsAfterDelete');

      cy.get('[data-testid="assignment-row"]').first().within(() => {
        cy.get('[data-testid="button-delete-assignment"]').click();
      });

      // Confirm deletion
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteAssignment');
      cy.wait('@getAssignmentsAfterDelete');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Assignment deleted');
    });
  });

  describe('Consultant Schedules View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantSchedules(testData.consultant.id), { 
        fixture: 'consultant-schedules.json' 
      }).as('getConsultantSchedules');
      
      cy.visit(`/consultants/${testData.consultant.id}/schedules`);
      cy.wait('@getConsultantSchedules');
    });

    it('should display consultant schedules page', () => {
      cy.get('[data-testid="consultant-schedules-header"]').should('be.visible');
      cy.get('[data-testid="consultant-name"]')
        .should('contain.text', testData.consultant.name);

      cy.get('[data-testid="schedules-calendar"]').should('be.visible');
      cy.get('[data-testid="schedules-list"]').should('be.visible');
    });

    it('should switch between calendar and list view', () => {
      // Calendar view (default)
      cy.get('[data-testid="view-calendar"]').should('have.class', 'active');
      cy.get('[data-testid="schedules-calendar"]').should('be.visible');

      // Switch to list view
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="view-list"]').should('have.class', 'active');
      cy.get('[data-testid="schedules-list"]').should('be.visible');
      cy.get('[data-testid="schedules-calendar"]').should('not.be.visible');
    });

    it('should filter schedules by date range', () => {
      const dateRange = {
        start: '2024-01-01',
        end: '2024-01-31'
      };

      cy.intercept('GET', apiEndpoints.consultantSchedules(testData.consultant.id), {
        query: { startDate: dateRange.start, endDate: dateRange.end }
      }, { fixture: 'consultant-schedules-filtered.json' }).as('filterConsultantSchedules');

      cy.get('[data-testid="date-range-picker"]').click();
      cy.get('[data-testid="start-date"]').type(dateRange.start);
      cy.get('[data-testid="end-date"]').type(dateRange.end);
      cy.get('[data-testid="apply-date-filter"]').click();

      cy.wait('@filterConsultantSchedules');
    });
  });

  describe('Schedules Pagination', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { 
        fixture: 'schedules-paginated.json' 
      }).as('getSchedulesPaginated');
      
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedulesPaginated');
    });

    it('should handle pagination controls', () => {
      // Check pagination exists
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Showing 1 to 10 of 25 schedules');

      // Next page
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        query: { page: '2' }
      }, { fixture: 'schedules-page-2.json' }).as('getPage2');

      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPage2');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Showing 11 to 20 of 25 schedules');

      // Previous page
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        query: { page: '1' }
      }, { fixture: 'schedules-paginated.json' }).as('getPage1');

      cy.get('[data-testid="pagination-previous"]').click();
      cy.wait('@getPage1');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Showing 1 to 10 of 25 schedules');
    });

    it('should change page size', () => {
      const pageSizes = [10, 25, 50, 100];

      pageSizes.forEach(pageSize => {
        cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
          query: { limit: pageSize.toString() }
        }, { fixture: `schedules-limit-${pageSize}.json` }).as(`getLimit${pageSize}`);

        cy.get('[data-testid="page-size-select"]').select(pageSize.toString());
        cy.wait(`@getLimit${pageSize}`);

        cy.get('[data-testid="pagination-info"]')
          .should('contain.text', `Showing 1 to ${Math.min(pageSize, 25)} of`);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getSchedulesError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedulesError');

      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'Failed to load schedules');
      
      cy.get('[data-testid="button-retry"]')
        .should('be.visible')
        .and('contain.text', 'Retry');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        forceNetworkError: true
      }).as('networkError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@networkError');

      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'Network error');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('unauthorizedError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@unauthorizedError');

      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'You do not have permission');
    });

    it('should handle loading states', () => {
      // Delay the API response to test loading states
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        fixture: 'schedules.json',
        delay: 2000
      }).as('getSchedulesDelay');

      cy.visit(`/projects/${testData.project.id}/schedules`);

      // Check loading state
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-text"]')
        .should('contain.text', 'Loading schedules...');

      cy.wait('@getSchedulesDelay');

      // Loading should disappear
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      cy.get('[data-testid="schedules-table"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];

    viewports.forEach(viewport => {
      it(`should display correctly on ${viewport.name}`, () => {
        cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { fixture: 'schedules.json' }).as('getSchedules');
        
        cy.viewport(viewport.width, viewport.height);
        cy.visit(`/projects/${testData.project.id}/schedules`);
        cy.wait('@getSchedules');

        // Check responsive elements
        cy.get('[data-testid="page-header"]').should('be.visible');
        cy.get('[data-testid="schedules-table"]').should('be.visible');

        if (viewport.name === 'mobile') {
          // Mobile-specific checks
          cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
          cy.get('[data-testid="schedules-table"]').scrollTo('right');
        } else {
          // Desktop/tablet checks
          cy.get('[data-testid="desktop-navigation"]').should('be.visible');
        }
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), { fixture: 'schedules.json' }).as('getSchedules');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should have proper ARIA attributes', () => {
      // Check table accessibility
      cy.get('[data-testid="schedules-table"]')
        .should('have.attr', 'role', 'table')
        .and('have.attr', 'aria-label');

      // Check form accessibility
      cy.get('[data-testid="button-create-schedule"]').click();
      
      cy.get('[data-testid="input-schedule-name"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'id');
      
      cy.get('label[for]').should('exist');
    });

    it('should support keyboard navigation', () => {
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');

      // Test enter key on buttons
      cy.get('[data-testid="button-create-schedule"]')
        .focus()
        .type('{enter}');
      
      cy.get('[data-testid="create-schedule-modal"]').should('be.visible');

      // Test escape key to close modal
      cy.focused().type('{esc}');
      cy.get('[data-testid="create-schedule-modal"]').should('not.exist');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h1, h2, h3, h4, h5, h6').each(($heading, index) => {
        if (index > 0) {
          cy.wrap($heading).should('be.visible');
        }
      });
    });
  });
});
