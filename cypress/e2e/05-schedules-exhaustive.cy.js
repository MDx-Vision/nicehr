describe('Schedules System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
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
      status: 'draft',
      shiftType: 'day',
      hoursPerWeek: 40
    },
    assignment: {
      consultantId: 'ci-test-consultant',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      role: 'Lead Consultant',
      hoursPerDay: 8,
      notes: 'Test assignment notes'
    }
  };

  const apiEndpoints = {
    projectSchedules: '/api/projects/*/schedules',
    schedules: '/api/schedules/*',
    scheduleAssignments: '/api/schedules/*/assignments',
    consultantSchedules: '/api/consultants/*/schedules',
    assignments: '/api/assignments/*'
  };

  beforeEach(() => {
    // Login as admin user
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]').type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for login to complete
    cy.url().should('not.include', '/login');
    cy.get('[data-testid="user-menu"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Schedules List Page - UI Components & Layout', () => {
    beforeEach(() => {
      // Mock API responses
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'schedule-1',
              title: 'Main Schedule',
              description: 'Primary project schedule',
              startDate: '2024-02-01',
              endDate: '2024-02-28',
              status: 'active',
              assignmentCount: 5,
              createdAt: '2024-01-15T10:00:00Z',
              updatedAt: '2024-01-15T10:00:00Z'
            },
            {
              id: 'schedule-2',
              title: 'Backup Schedule',
              description: 'Contingency schedule',
              startDate: '2024-03-01',
              endDate: '2024-03-31',
              status: 'draft',
              assignmentCount: 2,
              createdAt: '2024-01-16T10:00:00Z',
              updatedAt: '2024-01-16T10:00:00Z'
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        }
      }).as('getSchedules');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
    });

    it('should display complete schedules list layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'Schedules');
      
      // Action buttons
      cy.get('[data-testid="button-create-schedule"]')
        .should('be.visible')
        .and('contain.text', /create|new|add/i);
      
      // Search and filters
      cy.get('[data-testid="search-schedules"]').should('be.visible');
      cy.get('[data-testid="filter-status"]').should('be.visible');
      cy.get('[data-testid="filter-date-range"]').should('be.visible');
      
      // Schedules table/list
      cy.get('[data-testid="schedules-table"]').should('be.visible');
      cy.get('[data-testid="schedule-item"]').should('have.length', 2);
      
      // Table headers
      const expectedHeaders = ['Title', 'Description', 'Date Range', 'Status', 'Assignments', 'Actions'];
      expectedHeaders.forEach(header => {
        cy.get('th').should('contain.text', header);
      });
    });

    it('should display schedule items with correct data', () => {
      cy.get('[data-testid="schedule-item"]').first().within(() => {
        cy.get('[data-testid="schedule-title"]').should('contain.text', 'Main Schedule');
        cy.get('[data-testid="schedule-description"]').should('contain.text', 'Primary project schedule');
        cy.get('[data-testid="schedule-date-range"]').should('contain.text', '2024-02-01');
        cy.get('[data-testid="schedule-status"]').should('contain.text', 'active');
        cy.get('[data-testid="schedule-assignments"]').should('contain.text', '5');
        cy.get('[data-testid="button-view-schedule"]').should('be.visible');
        cy.get('[data-testid="button-edit-schedule"]').should('be.visible');
        cy.get('[data-testid="button-delete-schedule"]').should('be.visible');
      });
    });

    it('should handle search functionality', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, (req) => {
        expect(req.query).to.have.property('search', 'Main');
        req.reply({
          statusCode: 200,
          body: {
            data: [
              {
                id: 'schedule-1',
                title: 'Main Schedule',
                description: 'Primary project schedule',
                startDate: '2024-02-01',
                endDate: '2024-02-28',
                status: 'active',
                assignmentCount: 5
              }
            ],
            total: 1,
            page: 1,
            limit: 10
          }
        });
      }).as('searchSchedules');

      cy.get('[data-testid="search-schedules"]').type('Main');
      cy.get('[data-testid="button-search"]').click();
      
      cy.wait('@searchSchedules');
      cy.get('[data-testid="schedule-item"]').should('have.length', 1);
      cy.get('[data-testid="schedule-title"]').should('contain.text', 'Main Schedule');
    });

    it('should handle status filter', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, (req) => {
        expect(req.query).to.have.property('status', 'active');
        req.reply({
          statusCode: 200,
          body: {
            data: [
              {
                id: 'schedule-1',
                title: 'Main Schedule',
                description: 'Primary project schedule',
                startDate: '2024-02-01',
                endDate: '2024-02-28',
                status: 'active',
                assignmentCount: 5
              }
            ],
            total: 1,
            page: 1,
            limit: 10
          }
        });
      }).as('filterSchedules');

      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-active"]').click();
      
      cy.wait('@filterSchedules');
      cy.get('[data-testid="schedule-item"]').should('have.length', 1);
    });

    it('should handle empty state', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 200,
        body: {
          data: [],
          total: 0,
          page: 1,
          limit: 10
        }
      }).as('getEmptySchedules');

      cy.reload();
      cy.wait('@getEmptySchedules');

      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]').should('contain.text', /no schedules/i);
      cy.get('[data-testid="empty-state-description"]').should('be.visible');
      cy.get('[data-testid="button-create-first-schedule"]').should('be.visible');
    });

    it('should handle loading state', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, (req) => {
        req.reply(new Promise(resolve => {
          setTimeout(() => {
            resolve({
              statusCode: 200,
              body: { data: [], total: 0, page: 1, limit: 10 }
            });
          }, 2000);
        }));
      }).as('getSlowSchedules');

      cy.reload();
      cy.get('[data-testid="loading-schedules"]').should('be.visible');
      cy.get('[data-testid="skeleton-schedule-item"]').should('be.visible');
    });
  });

  describe('Create Schedule Form - UI Components & Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 200,
        body: { data: [], total: 0, page: 1, limit: 10 }
      });

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.get('[data-testid="button-create-schedule"]').click();
    });

    it('should display complete create schedule form', () => {
      // Form container
      cy.get('[data-testid="create-schedule-form"]').should('be.visible');
      
      // Form fields
      cy.get('[data-testid="input-title"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-description"]').should('be.visible');
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');
      cy.get('[data-testid="select-status"]').should('be.visible');
      cy.get('[data-testid="select-shift-type"]').should('be.visible');
      cy.get('[data-testid="input-hours-per-week"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number')
        .and('have.attr', 'min', '1')
        .and('have.attr', 'max', '168');
      
      // Action buttons
      cy.get('[data-testid="button-save-schedule"]')
        .should('be.visible')
        .and('contain.text', /save|create/i);
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should validate required fields', () => {
      // Try to submit without filling required fields
      cy.get('[data-testid="button-save-schedule"]').click();
      
      // Check for validation errors
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should validate date range', () => {
      // Fill form with invalid date range (end before start)
      cy.get('[data-testid="input-title"]').type(testData.schedule.title);
      cy.get('[data-testid="input-start-date"]').type('2024-02-28');
      cy.get('[data-testid="input-end-date"]').type('2024-02-01');
      
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', /end date must be after start date/i);
    });

    it('should validate hours per week range', () => {
      cy.get('[data-testid="input-hours-per-week"]').clear().type('200');
      cy.get('[data-testid="input-title"]').click(); // Trigger validation
      
      cy.get('[data-testid="error-hours-per-week"]')
        .should('be.visible')
        .and('contain.text', /maximum 168 hours/i);
      
      cy.get('[data-testid="input-hours-per-week"]').clear().type('-5');
      cy.get('[data-testid="input-title"]').click();
      
      cy.get('[data-testid="error-hours-per-week"]')
        .should('be.visible')
        .and('contain.text', /must be greater than 0/i);
    });

    it('should successfully create a schedule', () => {
      const newSchedule = {
        id: 'new-schedule-id',
        ...testData.schedule,
        projectId: testData.project.id
      };

      cy.intercept('POST', apiEndpoints.projectSchedules, {
        statusCode: 201,
        body: { data: newSchedule }
      }).as('createSchedule');

      // Fill form with valid data
      cy.get('[data-testid="input-title"]').type(testData.schedule.title);
      cy.get('[data-testid="input-description"]').type(testData.schedule.description);
      cy.get('[data-testid="input-start-date"]').type(testData.schedule.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.schedule.endDate);
      cy.get('[data-testid="select-status"]').click();
      cy.get('[data-testid="option-draft"]').click();
      cy.get('[data-testid="select-shift-type"]').click();
      cy.get('[data-testid="option-day"]').click();
      cy.get('[data-testid="input-hours-per-week"]').clear().type(testData.schedule.hoursPerWeek.toString());
      
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.wait('@createSchedule').then((interception) => {
        expect(interception.request.body).to.deep.include({
          title: testData.schedule.title,
          description: testData.schedule.description,
          startDate: testData.schedule.startDate,
          endDate: testData.schedule.endDate,
          status: testData.schedule.status,
          shiftType: testData.schedule.shiftType,
          hoursPerWeek: testData.schedule.hoursPerWeek
        });
      });
      
      // Should redirect to schedules list
      cy.url().should('include', '/schedules');
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /schedule created successfully/i);
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', apiEndpoints.projectSchedules, {
        statusCode: 400,
        body: { error: 'Schedule title already exists' }
      }).as('createScheduleError');

      // Fill and submit form
      cy.get('[data-testid="input-title"]').type(testData.schedule.title);
      cy.get('[data-testid="input-start-date"]').type(testData.schedule.startDate);
      cy.get('[data-testid="input-end-date"]').type(testData.schedule.endDate);
      cy.get('[data-testid="button-save-schedule"]').click();
      
      cy.wait('@createScheduleError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Schedule title already exists');
    });

    it('should handle cancel action', () => {
      // Fill some data
      cy.get('[data-testid="input-title"]').type('Some title');
      
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should return to schedules list without saving
      cy.url().should('include', '/schedules');
      cy.url().should('not.include', '/create');
    });
  });

  describe('Schedule Detail View - UI Components & Data Display', () => {
    beforeEach(() => {
      const scheduleDetail = {
        id: 'schedule-1',
        title: 'Main Schedule',
        description: 'Primary project schedule',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        status: 'active',
        shiftType: 'day',
        hoursPerWeek: 40,
        assignmentCount: 3,
        totalHours: 480,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        project: {
          id: testData.project.id,
          name: testData.project.name
        }
      };

      const assignments = [
        {
          id: 'assignment-1',
          consultantId: 'consultant-1',
          consultant: {
            id: 'consultant-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          },
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          role: 'Lead Consultant',
          hoursPerDay: 8,
          status: 'confirmed',
          notes: 'Team lead responsibilities'
        },
        {
          id: 'assignment-2',
          consultantId: 'consultant-2',
          consultant: {
            id: 'consultant-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com'
          },
          startDate: '2024-02-05',
          endDate: '2024-02-20',
          role: 'Senior Consultant',
          hoursPerDay: 8,
          status: 'pending',
          notes: 'Technical expertise'
        }
      ];

      cy.intercept('GET', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { data: scheduleDetail }
      }).as('getSchedule');

      cy.intercept('GET', '/api/schedules/schedule-1/assignments', {
        statusCode: 200,
        body: {
          data: assignments,
          total: 2,
          page: 1,
          limit: 10
        }
      }).as('getAssignments');

      cy.visit(`/projects/${testData.project.id}/schedules/schedule-1`);
      cy.wait(['@getSchedule', '@getAssignments']);
    });

    it('should display complete schedule detail layout', () => {
      // Page header
      cy.get('[data-testid="schedule-header"]').should('be.visible');
      cy.get('[data-testid="schedule-title"]').should('contain.text', 'Main Schedule');
      cy.get('[data-testid="schedule-status-badge"]').should('contain.text', 'active');
      
      // Action buttons
      cy.get('[data-testid="button-edit-schedule"]').should('be.visible');
      cy.get('[data-testid="button-delete-schedule"]').should('be.visible');
      cy.get('[data-testid="button-add-assignment"]').should('be.visible');
      
      // Schedule details section
      cy.get('[data-testid="schedule-details"]').should('be.visible');
      cy.get('[data-testid="schedule-description"]').should('contain.text', 'Primary project schedule');
      cy.get('[data-testid="schedule-date-range"]').should('contain.text', '2024-02-01');
      cy.get('[data-testid="schedule-shift-type"]').should('contain.text', 'day');
      cy.get('[data-testid="schedule-hours-per-week"]').should('contain.text', '40');
      cy.get('[data-testid="schedule-total-hours"]').should('contain.text', '480');
      
      // Assignments section
      cy.get('[data-testid="assignments-section"]').should('be.visible');
      cy.get('[data-testid="assignments-title"]').should('contain.text', 'Assignments');
      cy.get('[data-testid="assignment-item"]').should('have.length', 2);
    });

    it('should display assignment items with correct data', () => {
      cy.get('[data-testid="assignment-item"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="consultant-email"]').should('contain.text', 'john@example.com');
        cy.get('[data-testid="assignment-role"]').should('contain.text', 'Lead Consultant');
        cy.get('[data-testid="assignment-date-range"]').should('contain.text', '2024-02-01');
        cy.get('[data-testid="assignment-hours"]').should('contain.text', '8');
        cy.get('[data-testid="assignment-status"]').should('contain.text', 'confirmed');
        cy.get('[data-testid="assignment-notes"]').should('contain.text', 'Team lead responsibilities');
        cy.get('[data-testid="button-edit-assignment"]').should('be.visible');
        cy.get('[data-testid="button-delete-assignment"]').should('be.visible');
      });
    });

    it('should display schedule statistics', () => {
      cy.get('[data-testid="schedule-stats"]').should('be.visible');
      cy.get('[data-testid="stat-total-assignments"]').should('contain.text', '3');
      cy.get('[data-testid="stat-confirmed-assignments"]').should('contain.text', '1');
      cy.get('[data-testid="stat-pending-assignments"]').should('contain.text', '1');
      cy.get('[data-testid="stat-total-hours"]').should('contain.text', '480');
    });

    it('should handle schedule not found', () => {
      cy.intercept('GET', '/api/schedules/nonexistent', {
        statusCode: 404,
        body: { error: 'Schedule not found' }
      }).as('getScheduleNotFound');

      cy.visit(`/projects/${testData.project.id}/schedules/nonexistent`);
      cy.wait('@getScheduleNotFound');

      cy.get('[data-testid="error-not-found"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Schedule not found');
      cy.get('[data-testid="button-back-to-schedules"]').should('be.visible');
    });
  });

  describe('Edit Schedule Form - UI Components & Updates', () => {
    beforeEach(() => {
      const existingSchedule = {
        id: 'schedule-1',
        title: 'Main Schedule',
        description: 'Primary project schedule',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        status: 'active',
        shiftType: 'day',
        hoursPerWeek: 40,
        projectId: testData.project.id
      };

      cy.intercept('GET', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { data: existingSchedule }
      }).as('getSchedule');

      cy.visit(`/projects/${testData.project.id}/schedules/schedule-1/edit`);
      cy.wait('@getSchedule');
    });

    it('should display edit form with pre-filled data', () => {
      // Form should be populated with existing data
      cy.get('[data-testid="edit-schedule-form"]').should('be.visible');
      cy.get('[data-testid="input-title"]').should('have.value', 'Main Schedule');
      cy.get('[data-testid="input-description"]').should('have.value', 'Primary project schedule');
      cy.get('[data-testid="input-start-date"]').should('have.value', '2024-02-01');
      cy.get('[data-testid="input-end-date"]').should('have.value', '2024-02-28');
      cy.get('[data-testid="input-hours-per-week"]').should('have.value', '40');
      
      // Action buttons
      cy.get('[data-testid="button-update-schedule"]')
        .should('be.visible')
        .and('contain.text', /update|save/i);
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should successfully update a schedule', () => {
      const updatedSchedule = {
        id: 'schedule-1',
        title: 'Updated Schedule',
        description: 'Updated description',
        startDate: '2024-02-01',
        endDate: '2024-03-31',
        status: 'active',
        shiftType: 'day',
        hoursPerWeek: 35,
        projectId: testData.project.id
      };

      cy.intercept('PATCH', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { data: updatedSchedule }
      }).as('updateSchedule');

      // Update form fields
      cy.get('[data-testid="input-title"]').clear().type('Updated Schedule');
      cy.get('[data-testid="input-description"]').clear().type('Updated description');
      cy.get('[data-testid="input-end-date"]').clear().type('2024-03-31');
      cy.get('[data-testid="input-hours-per-week"]').clear().type('35');
      
      cy.get('[data-testid="button-update-schedule"]').click();
      
      cy.wait('@updateSchedule').then((interception) => {
        expect(interception.request.body).to.deep.include({
          title: 'Updated Schedule',
          description: 'Updated description',
          endDate: '2024-03-31',
          hoursPerWeek: 35
        });
      });
      
      // Should redirect to schedule detail
      cy.url().should('include', '/schedules/schedule-1');
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /schedule updated successfully/i);
    });

    it('should validate changes before update', () => {
      // Clear required field
      cy.get('[data-testid="input-title"]').clear();
      cy.get('[data-testid="button-update-schedule"]').click();
      
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should handle API errors during update', () => {
      cy.intercept('PATCH', '/api/schedules/schedule-1', {
        statusCode: 409,
        body: { error: 'Schedule title conflicts with existing schedule' }
      }).as('updateScheduleError');

      cy.get('[data-testid="input-title"]').clear().type('Conflicting Title');
      cy.get('[data-testid="button-update-schedule"]').click();
      
      cy.wait('@updateScheduleError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Schedule title conflicts with existing schedule');
    });
  });

  describe('Schedule Status Management', () => {
    beforeEach(() => {
      const schedule = {
        id: 'schedule-1',
        title: 'Main Schedule',
        status: 'draft',
        projectId: testData.project.id
      };

      cy.intercept('GET', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { data: schedule }
      }).as('getSchedule');

      cy.visit(`/projects/${testData.project.id}/schedules/schedule-1`);
      cy.wait('@getSchedule');
    });

    it('should update schedule status', () => {
      cy.intercept('PATCH', '/api/schedules/schedule-1/status', {
        statusCode: 200,
        body: { data: { status: 'active' } }
      }).as('updateStatus');

      cy.get('[data-testid="schedule-status-badge"]').click();
      cy.get('[data-testid="status-option-active"]').click();
      cy.get('[data-testid="button-confirm-status"]').click();
      
      cy.wait('@updateStatus').then((interception) => {
        expect(interception.request.body).to.deep.include({
          status: 'active'
        });
      });
      
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /status updated/i);
    });

    it('should show confirmation for status changes', () => {
      cy.get('[data-testid="schedule-status-badge"]').click();
      cy.get('[data-testid="status-option-completed"]').click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="confirm-status-change"]').should('be.visible');
      cy.get('[data-testid="confirm-message"]')
        .should('contain.text', /changing status to completed/i);
      cy.get('[data-testid="button-confirm-status"]').should('be.visible');
      cy.get('[data-testid="button-cancel-status"]').should('be.visible');
    });
  });

  describe('Assignment Management', () => {
    beforeEach(() => {
      const schedule = {
        id: 'schedule-1',
        title: 'Main Schedule',
        status: 'active',
        projectId: testData.project.id
      };

      const consultants = [
        {
          id: 'consultant-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          availability: 'available'
        },
        {
          id: 'consultant-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          availability: 'available'
        }
      ];

      cy.intercept('GET', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { data: schedule }
      });

      cy.intercept('GET', '/api/schedules/schedule-1/assignments', {
        statusCode: 200,
        body: { data: [], total: 0, page: 1, limit: 10 }
      });

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: { data: consultants }
      }).as('getConsultants');

      cy.visit(`/projects/${testData.project.id}/schedules/schedule-1`);
    });

    it('should display add assignment form', () => {
      cy.get('[data-testid="button-add-assignment"]').click();
      
      cy.get('[data-testid="add-assignment-modal"]').should('be.visible');
      cy.get('[data-testid="select-consultant"]').should('be.visible');
      cy.get('[data-testid="input-assignment-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
      cy.get('[data-testid="input-assignment-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
      cy.get('[data-testid="input-role"]').should('be.visible');
      cy.get('[data-testid="input-hours-per-day"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      cy.get('[data-testid="textarea-notes"]').should('be.visible');
      
      cy.get('[data-testid="button-save-assignment"]').should('be.visible');
      cy.get('[data-testid="button-cancel-assignment"]').should('be.visible');
    });

    it('should validate assignment form', () => {
      cy.get('[data-testid="button-add-assignment"]').click();
      cy.get('[data-testid="button-save-assignment"]').click();
      
      // Required field validations
      cy.get('[data-testid="error-consultant"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should successfully create an assignment', () => {
      const newAssignment = {
        id: 'new-assignment-id',
        scheduleId: 'schedule-1',
        consultantId: testData.assignment.consultantId,
        startDate: testData.assignment.startDate,
        endDate: testData.assignment.endDate,
        role: testData.assignment.role,
        hoursPerDay: testData.assignment.hoursPerDay,
        notes: testData.assignment.notes,
        status: 'pending'
      };

      cy.intercept('POST', '/api/schedules/schedule-1/assignments', {
        statusCode: 201,
        body: { data: newAssignment }
      }).as('createAssignment');

      cy.get('[data-testid="button-add-assignment"]').click();
      cy.wait('@getConsultants');
      
      // Fill assignment form
      cy.get('[data-testid="select-consultant"]').click();
      cy.get('[data-testid="option-consultant-1"]').click();
      cy.get('[data-testid="input-assignment-start-date"]').type(testData.assignment.startDate);
      cy.get('[data-testid="input-assignment-end-date"]').type(testData.assignment.endDate);
      cy.get('[data-testid="input-role"]').type(testData.assignment.role);
      cy.get('[data-testid="input-hours-per-day"]').type(testData.assignment.hoursPerDay.toString());
      cy.get('[data-testid="textarea-notes"]').type(testData.assignment.notes);
      
      cy.get('[data-testid="button-save-assignment"]').click();
      
      cy.wait('@createAssignment').then((interception) => {
        expect(interception.request.body).to.deep.include({
          consultantId: 'consultant-1',
          startDate: testData.assignment.startDate,
          endDate: testData.assignment.endDate,
          role: testData.assignment.role,
          hoursPerDay: testData.assignment.hoursPerDay,
          notes: testData.assignment.notes
        });
      });
      
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /assignment created/i);
      cy.get('[data-testid="add-assignment-modal"]').should('not.exist');
    });

    it('should delete an assignment', () => {
      // First, mock an existing assignment
      const assignments = [
        {
          id: 'assignment-1',
          consultant: {
            id: 'consultant-1',
            firstName: 'John',
            lastName: 'Doe'
          },
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          role: 'Lead Consultant',
          status: 'confirmed'
        }
      ];

      cy.intercept('GET', '/api/schedules/schedule-1/assignments', {
        statusCode: 200,
        body: { data: assignments, total: 1, page: 1, limit: 10 }
      });

      cy.intercept('DELETE', '/api/assignments/assignment-1', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAssignment');

      cy.reload();
      
      cy.get('[data-testid="button-delete-assignment"]').first().click();
      cy.get('[data-testid="confirm-delete-assignment"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteAssignment');
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /assignment deleted/i);
    });
  });

  describe('Consultant Schedules View', () => {
    beforeEach(() => {
      const consultantSchedules = [
        {
          id: 'schedule-1',
          title: 'Hospital A Project',
          project: {
            id: 'project-1',
            name: 'Hospital A Implementation',
            hospital: {
              name: 'Hospital A'
            }
          },
          assignment: {
            id: 'assignment-1',
            startDate: '2024-02-01',
            endDate: '2024-02-28',
            role: 'Lead Consultant',
            hoursPerDay: 8,
            status: 'confirmed'
          }
        },
        {
          id: 'schedule-2',
          title: 'Hospital B Training',
          project: {
            id: 'project-2',
            name: 'Hospital B Training Program',
            hospital: {
              name: 'Hospital B'
            }
          },
          assignment: {
            id: 'assignment-2',
            startDate: '2024-03-01',
            endDate: '2024-03-31',
            role: 'Training Specialist',
            hoursPerDay: 6,
            status: 'pending'
          }
        }
      ];

      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/schedules`, {
        statusCode: 200,
        body: {
          data: consultantSchedules,
          total: 2,
          page: 1,
          limit: 10
        }
      }).as('getConsultantSchedules');

      cy.visit(`/consultants/${testData.consultant.id}/schedules`);
      cy.wait('@getConsultantSchedules');
    });

    it('should display consultant schedules overview', () => {
      // Page header
      cy.get('[data-testid="consultant-schedules-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'My Schedules');
      
      // Schedule items
      cy.get('[data-testid="consultant-schedule-item"]').should('have.length', 2);
      
      // Calendar view toggle
      cy.get('[data-testid="toggle-calendar-view"]').should('be.visible');
      cy.get('[data-testid="toggle-list-view"]').should('be.visible');
    });

    it('should display schedule details for consultant', () => {
      cy.get('[data-testid="consultant-schedule-item"]').first().within(() => {
        cy.get('[data-testid="schedule-title"]').should('contain.text', 'Hospital A Project');
        cy.get('[data-testid="project-name"]').should('contain.text', 'Hospital A Implementation');
        cy.get('[data-testid="hospital-name"]').should('contain.text', 'Hospital A');
        cy.get('[data-testid="assignment-role"]').should('contain.text', 'Lead Consultant');
        cy.get('[data-testid="assignment-dates"]').should('contain.text', '2024-02-01');
        cy.get('[data-testid="assignment-hours"]').should('contain.text', '8');
        cy.get('[data-testid="assignment-status"]').should('contain.text', 'confirmed');
      });
    });

    it('should switch to calendar view', () => {
      cy.get('[data-testid="toggle-calendar-view"]').click();
      
      cy.get('[data-testid="calendar-container"]').should('be.visible');
      cy.get('[data-testid="calendar-month-view"]').should('be.visible');
      cy.get('[data-testid="calendar-event"]').should('exist');
    });

    it('should filter schedules by status', () => {
      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/schedules*`, (req) => {
        expect(req.query).to.have.property('status', 'confirmed');
        req.reply({
          statusCode: 200,
          body: {
            data: [
              {
                id: 'schedule-1',
                title: 'Hospital A Project',
                assignment: { status: 'confirmed' }
              }
            ],
            total: 1
          }
        });
      }).as('filterConsultantSchedules');

      cy.get('[data-testid="filter-assignment-status"]').click();
      cy.get('[data-testid="option-confirmed"]').click();
      
      cy.wait('@filterConsultantSchedules');
      cy.get('[data-testid="consultant-schedule-item"]').should('have.length', 1);
    });
  });

  describe('Schedule Deletion', () => {
    beforeEach(() => {
      const scheduleWithAssignments = {
        id: 'schedule-1',
        title: 'Schedule to Delete',
        assignmentCount: 3,
        status: 'active'
      };

      cy.intercept('GET', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { data: scheduleWithAssignments }
      });

      cy.visit(`/projects/${testData.project.id}/schedules/schedule-1`);
    });

    it('should show confirmation dialog for schedule deletion', () => {
      cy.get('[data-testid="button-delete-schedule"]').click();
      
      cy.get('[data-testid="confirm-delete-schedule"]').should('be.visible');
      cy.get('[data-testid="delete-warning"]')
        .should('contain.text', /this will delete 3 assignments/i);
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
    });

    it('should successfully delete a schedule', () => {
      cy.intercept('DELETE', '/api/schedules/schedule-1', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteSchedule');

      cy.get('[data-testid="button-delete-schedule"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteSchedule');
      
      // Should redirect to schedules list
      cy.url().should('include', '/schedules');
      cy.url().should('not.include', '/schedule-1');
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /schedule deleted/i);
    });

    it('should handle deletion errors', () => {
      cy.intercept('DELETE', '/api/schedules/schedule-1', {
        statusCode: 400,
        body: { error: 'Cannot delete schedule with confirmed assignments' }
      }).as('deleteScheduleError');

      cy.get('[data-testid="button-delete-schedule"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteScheduleError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Cannot delete schedule with confirmed assignments');
    });
  });

  describe('Responsive Design & Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'schedule-1',
              title: 'Mobile Test Schedule',
              status: 'active',
              assignmentCount: 2
            }
          ],
          total: 1
        }
      });

      cy.visit(`/projects/${testData.project.id}/schedules`);
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Mobile layout adjustments
      cy.get('[data-testid="mobile-schedule-card"]').should('be.visible');
      cy.get('[data-testid="mobile-action-menu"]').should('be.visible');
      
      // Hamburger menu for actions
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu-items"]').should('be.visible');
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // Tablet should show table view but with adjusted spacing
      cy.get('[data-testid="schedules-table"]').should('be.visible');
      cy.get('[data-testid="schedule-item"]').should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('[data-testid="search-schedules"]').focus().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-status');
      
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'button-create-schedule');
      
      // Enter should activate buttons
      cy.focused().type('{enter}');
      cy.get('[data-testid="create-schedule-form"]').should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="schedules-table"]')
        .should('have.attr', 'role', 'table');
      
      cy.get('[data-testid="search-schedules"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');
      
      cy.get('[data-testid="button-create-schedule"]')
        .should('have.attr', 'aria-label');
      
      // Status badges should have proper roles
      cy.get('[data-testid="schedule-status"]')
        .should('have.attr', 'role', 'status');
    });

    it('should support screen readers', () => {
      // Check for screen reader announcements
      cy.get('[data-testid="sr-only-schedule-count"]')
        .should('exist')
        .and('contain.text', /1 schedule found/i);
      
      // Loading states should be announced
      cy.intercept('GET', apiEndpoints.projectSchedules, (req) => {
        req.reply(new Promise(resolve => {
          setTimeout(() => resolve({
            statusCode: 200,
            body: { data: [], total: 0 }
          }), 1000);
        }));
      });
      
      cy.reload();
      cy.get('[aria-live="polite"]')
        .should('contain.text', /loading schedules/i);
    });
  });

  describe('Performance & Error Handling', () => {
    it('should handle slow API responses gracefully', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, (req) => {
        req.reply(new Promise(resolve => {
          setTimeout(() => {
            resolve({
              statusCode: 200,
              body: { data: [], total: 0, page: 1, limit: 10 }
            });
          }, 3000);
        }));
      }).as('getSlowSchedules');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      
      // Should show loading state
      cy.get('[data-testid="loading-schedules"]').should('be.visible');
      cy.get('[data-testid="skeleton-schedule-item"]').should('be.visible');
      
      // Should eventually load content
      cy.wait('@getSlowSchedules', { timeout: 5000 });
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, { forceNetworkError: true })
        .as('networkError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@networkError');

      cy.get('[data-testid="error-network"]').should('be.visible');
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, { forceNetworkError: true })
        .as('networkErrorFirst');
      
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 200,
        body: { data: [], total: 0, page: 1, limit: 10 }
      }).as('networkSuccessRetry');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@networkErrorFirst');
      
      cy.get('[data-testid="button-retry"]').click();
      cy.wait('@networkSuccessRetry');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });

    it('should handle server errors (500)', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@serverError');

      cy.get('[data-testid="error-server"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', /something went wrong/i);
    });

    it('should handle unauthorized access (403)', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('forbiddenError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@forbiddenError');

      cy.get('[data-testid="error-forbidden"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', /not authorized/i);
    });
  });
});
