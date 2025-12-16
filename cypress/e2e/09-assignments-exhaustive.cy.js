describe('Assignments System - Exhaustive Tests', () => {
  const testData = {
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    schedules: (projectId) => `/api/projects/${projectId}/schedules`,
    scheduleAssignments: (scheduleId) => `/api/schedules/${scheduleId}/assignments`,
    consultantSchedules: (consultantId) => `/api/consultants/${consultantId}/schedules`,
    assignment: (assignmentId) => `/api/assignments/${assignmentId}`,
    projectTeam: (projectId) => `/api/projects/${projectId}/team`,
    teamAssignments: (assignmentId) => `/api/team-assignments/${assignmentId}`,
    teamRoles: '/api/team-roles',
    rbacAssignments: '/api/admin/rbac/assignments',
    rbacRoles: '/api/admin/rbac/roles'
  };

  beforeEach(() => {
    // Login before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    cy.intercept('POST', apiEndpoints.login).as('login');
    cy.intercept('GET', apiEndpoints.user).as('getUser');

    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@login');
    cy.wait('@getUser');
  });

  describe('Schedule Assignments - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id)).as('getSchedules');
      cy.intercept('GET', apiEndpoints.scheduleAssignments('*')).as('getScheduleAssignments');
      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules', { timeout: 10000 });
    });

    it('should display schedule assignments page layout', () => {
      // Page header and navigation
      cy.get('[data-testid="page-header"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Schedules');

      // Schedules list or table
      cy.get('[data-testid="schedules-container"]', { timeout: 10000 })
        .should('be.visible');

      // Create new schedule button
      cy.get('[data-testid="button-create-schedule"]')
        .should('be.visible')
        .and('contain.text', /create|add|new/i);

      // Search and filters
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="schedule-search"]').length > 0) {
          cy.get('[data-testid="schedule-search"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
        if ($body.find('[data-testid="schedule-filters"]').length > 0) {
          cy.get('[data-testid="schedule-filters"]').should('be.visible');
        }
      });
    });

    it('should display schedule assignments within each schedule', () => {
      // Wait for schedules to load and check for assignment sections
      cy.get('[data-testid="schedules-container"]').within(() => {
        cy.get('[data-testid*="schedule-"]').first().within(() => {
          // Assignment section
          cy.get('[data-testid="assignments-section"]', { timeout: 5000 })
            .should('be.visible');

          // Add assignment button
          cy.get('[data-testid="button-add-assignment"]')
            .should('be.visible')
            .and('contain.text', /assign|add/i);
        });
      });
    });

    it('should handle empty schedules state properly', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        statusCode: 200,
        body: { data: [], count: 0 }
      }).as('getEmptySchedules');

      cy.reload();
      cy.wait('@getEmptySchedules');

      cy.get('[data-testid="empty-schedules-state"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', /no schedules/i);

      cy.get('[data-testid="button-create-first-schedule"]')
        .should('be.visible')
        .and('contain.text', /create|add/i);
    });
  });

  describe('Create Schedule Assignment - Form Validation & Functionality', () => {
    let scheduleId;

    beforeEach(() => {
      scheduleId = 'test-schedule-1';
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        statusCode: 200,
        body: {
          data: [{
            id: scheduleId,
            name: 'Test Schedule',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            status: 'active',
            projectId: testData.project.id
          }],
          count: 1
        }
      }).as('getSchedules');

      cy.intercept('GET', apiEndpoints.scheduleAssignments(scheduleId), {
        statusCode: 200,
        body: { data: [], count: 0 }
      }).as('getScheduleAssignments');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: {
          data: [{
            id: testData.consultant.id,
            name: testData.consultant.name,
            email: 'test@example.com',
            role: 'Implementation Specialist',
            status: 'active'
          }],
          count: 1
        }
      }).as('getConsultants');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
      cy.wait('@getScheduleAssignments');
    });

    it('should open create assignment dialog with proper form fields', () => {
      cy.intercept('POST', apiEndpoints.scheduleAssignments(scheduleId)).as('createAssignment');

      cy.get('[data-testid="button-add-assignment"]').first().click();

      // Assignment dialog
      cy.get('[data-testid="dialog-create-assignment"]', { timeout: 10000 })
        .should('be.visible');

      // Form fields
      cy.get('[data-testid="select-consultant"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');

      cy.get('[data-testid="select-role"]')
        .should('be.visible');

      cy.get('[data-testid="input-hours-per-day"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number')
        .and('have.attr', 'min', '0')
        .and('have.attr', 'max', '24');

      // Form buttons
      cy.get('[data-testid="button-cancel-assignment"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);

      cy.get('[data-testid="button-save-assignment"]')
        .should('be.visible')
        .and('contain.text', /save|create/i)
        .and('be.disabled');
    });

    it('should validate required fields and show error messages', () => {
      cy.get('[data-testid="button-add-assignment"]').first().click();
      cy.get('[data-testid="dialog-create-assignment"]').should('be.visible');

      // Try to submit without filling required fields
      cy.get('[data-testid="button-save-assignment"]').should('be.disabled');

      // Fill partial data and check validation
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="button-save-assignment"]').should('be.disabled');

      cy.get('[data-testid="input-end-date"]').type('2024-01-31');
      cy.get('[data-testid="button-save-assignment"]').should('be.disabled');

      // Select consultant to enable save button
      cy.get('[data-testid="select-consultant"]').click();
      cy.wait('@getConsultants');
      cy.get(`[data-testid="option-consultant-${testData.consultant.id}"]`)
        .should('be.visible')
        .click();

      cy.get('[data-testid="button-save-assignment"]').should('not.be.disabled');
    });

    it('should validate date range logic', () => {
      cy.get('[data-testid="button-add-assignment"]').first().click();
      cy.get('[data-testid="dialog-create-assignment"]').should('be.visible');

      // Set end date before start date
      cy.get('[data-testid="input-start-date"]').type('2024-01-31');
      cy.get('[data-testid="input-end-date"]').type('2024-01-01');

      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', /end date.*after.*start date/i);

      cy.get('[data-testid="button-save-assignment"]').should('be.disabled');

      // Fix date range
      cy.get('[data-testid="input-end-date"]').clear().type('2024-02-01');
      cy.get('[data-testid="error-date-range"]').should('not.exist');
    });

    it('should validate hours per day input', () => {
      cy.get('[data-testid="button-add-assignment"]').first().click();
      cy.get('[data-testid="dialog-create-assignment"]').should('be.visible');

      // Test negative hours
      cy.get('[data-testid="input-hours-per-day"]').type('-5');
      cy.get('[data-testid="error-hours-per-day"]')
        .should('be.visible')
        .and('contain.text', /hours.*positive/i);

      // Test excessive hours
      cy.get('[data-testid="input-hours-per-day"]').clear().type('25');
      cy.get('[data-testid="error-hours-per-day"]')
        .should('be.visible')
        .and('contain.text', /hours.*24/i);

      // Test valid hours
      cy.get('[data-testid="input-hours-per-day"]').clear().type('8');
      cy.get('[data-testid="error-hours-per-day"]').should('not.exist');
    });

    it('should successfully create assignment with valid data', () => {
      const assignmentData = {
        id: 'new-assignment-1',
        consultantId: testData.consultant.id,
        scheduleId: scheduleId,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        role: 'Implementation Specialist',
        hoursPerDay: 8,
        status: 'active'
      };

      cy.intercept('POST', apiEndpoints.scheduleAssignments(scheduleId), {
        statusCode: 201,
        body: { data: assignmentData }
      }).as('createAssignment');

      cy.intercept('GET', apiEndpoints.scheduleAssignments(scheduleId), {
        statusCode: 200,
        body: { data: [assignmentData], count: 1 }
      }).as('getUpdatedAssignments');

      cy.get('[data-testid="button-add-assignment"]').first().click();
      cy.get('[data-testid="dialog-create-assignment"]').should('be.visible');

      // Fill form
      cy.get('[data-testid="select-consultant"]').click();
      cy.wait('@getConsultants');
      cy.get(`[data-testid="option-consultant-${testData.consultant.id}"]`).click();

      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-01-31');
      cy.get('[data-testid="input-hours-per-day"]').type('8');

      // Submit form
      cy.get('[data-testid="button-save-assignment"]').click();
      cy.wait('@createAssignment');

      // Verify success
      cy.get('[data-testid="dialog-create-assignment"]').should('not.exist');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /assignment.*created/i);

      // Verify assignment appears in list
      cy.wait('@getUpdatedAssignments');
      cy.get(`[data-testid="assignment-${assignmentData.id}"]`)
        .should('be.visible')
        .and('contain.text', testData.consultant.name);
    });
  });

  describe('Schedule Assignment Management - View, Edit, Delete', () => {
    let scheduleId, assignmentId;
    let existingAssignment;

    beforeEach(() => {
      scheduleId = 'test-schedule-1';
      assignmentId = 'test-assignment-1';
      existingAssignment = {
        id: assignmentId,
        consultantId: testData.consultant.id,
        consultant: {
          id: testData.consultant.id,
          name: testData.consultant.name,
          email: 'test@example.com'
        },
        scheduleId: scheduleId,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        role: 'Implementation Specialist',
        hoursPerDay: 8,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      };

      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        statusCode: 200,
        body: {
          data: [{
            id: scheduleId,
            name: 'Test Schedule',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            status: 'active',
            projectId: testData.project.id
          }],
          count: 1
        }
      }).as('getSchedules');

      cy.intercept('GET', apiEndpoints.scheduleAssignments(scheduleId), {
        statusCode: 200,
        body: { data: [existingAssignment], count: 1 }
      }).as('getScheduleAssignments');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedules');
      cy.wait('@getScheduleAssignments');
    });

    it('should display assignment details with all information', () => {
      cy.get(`[data-testid="assignment-${assignmentId}"]`, { timeout: 10000 })
        .should('be.visible')
        .within(() => {
          // Consultant information
          cy.get('[data-testid="assignment-consultant"]')
            .should('contain.text', existingAssignment.consultant.name);

          cy.get('[data-testid="assignment-email"]')
            .should('contain.text', existingAssignment.consultant.email);

          // Assignment details
          cy.get('[data-testid="assignment-role"]')
            .should('contain.text', existingAssignment.role);

          cy.get('[data-testid="assignment-dates"]')
            .should('contain.text', '2024-01-01')
            .and('contain.text', '2024-01-31');

          cy.get('[data-testid="assignment-hours"]')
            .should('contain.text', '8');

          cy.get('[data-testid="assignment-status"]')
            .should('contain.text', existingAssignment.status);

          // Action buttons
          cy.get('[data-testid="button-edit-assignment"]')
            .should('be.visible')
            .and('contain.text', /edit/i);

          cy.get('[data-testid="button-delete-assignment"]')
            .should('be.visible')
            .and('contain.text', /delete|remove/i);
        });
    });

    it('should open edit assignment dialog with pre-filled data', () => {
      cy.intercept('GET', '/api/consultants').as('getConsultants');

      cy.get(`[data-testid="assignment-${assignmentId}"]`).within(() => {
        cy.get('[data-testid="button-edit-assignment"]').click();
      });

      cy.get('[data-testid="dialog-edit-assignment"]', { timeout: 10000 })
        .should('be.visible');

      // Verify pre-filled data
      cy.get('[data-testid="select-consultant"]')
        .should('have.value', existingAssignment.consultantId);

      cy.get('[data-testid="input-start-date"]')
        .should('have.value', existingAssignment.startDate);

      cy.get('[data-testid="input-end-date"]')
        .should('have.value', existingAssignment.endDate);

      cy.get('[data-testid="input-hours-per-day"]')
        .should('have.value', existingAssignment.hoursPerDay.toString());

      cy.get('[data-testid="select-role"]')
        .should('have.value', existingAssignment.role);
    });

    it('should successfully update assignment', () => {
      const updatedAssignment = {
        ...existingAssignment,
        role: 'Senior Implementation Specialist',
        hoursPerDay: 6,
        endDate: '2024-02-15'
      };

      cy.intercept('PATCH', `${apiEndpoints.assignment(assignmentId)}`, {
        statusCode: 200,
        body: { data: updatedAssignment }
      }).as('updateAssignment');

      cy.intercept('GET', apiEndpoints.scheduleAssignments(scheduleId), {
        statusCode: 200,
        body: { data: [updatedAssignment], count: 1 }
      }).as('getUpdatedAssignments');

      cy.get(`[data-testid="assignment-${assignmentId}"]`).within(() => {
        cy.get('[data-testid="button-edit-assignment"]').click();
      });

      cy.get('[data-testid="dialog-edit-assignment"]').should('be.visible');

      // Update fields
      cy.get('[data-testid="select-role"]').click();
      cy.get('[data-testid="option-role-senior"]').click();

      cy.get('[data-testid="input-hours-per-day"]').clear().type('6');
      cy.get('[data-testid="input-end-date"]').clear().type('2024-02-15');

      cy.get('[data-testid="button-save-assignment"]').click();
      cy.wait('@updateAssignment');

      // Verify success
      cy.get('[data-testid="dialog-edit-assignment"]').should('not.exist');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /assignment.*updated/i);

      // Verify updated data in list
      cy.wait('@getUpdatedAssignments');
      cy.get(`[data-testid="assignment-${assignmentId}"]`).within(() => {
        cy.get('[data-testid="assignment-role"]')
          .should('contain.text', 'Senior Implementation Specialist');
        cy.get('[data-testid="assignment-hours"]')
          .should('contain.text', '6');
      });
    });

    it('should handle assignment deletion with confirmation', () => {
      cy.intercept('DELETE', apiEndpoints.assignment(assignmentId), {
        statusCode: 200,
        body: { success: true }
      }).as('deleteAssignment');

      cy.intercept('GET', apiEndpoints.scheduleAssignments(scheduleId), {
        statusCode: 200,
        body: { data: [], count: 0 }
      }).as('getUpdatedAssignments');

      cy.get(`[data-testid="assignment-${assignmentId}"]`).within(() => {
        cy.get('[data-testid="button-delete-assignment"]').click();
      });

      // Confirmation dialog
      cy.get('[data-testid="dialog-confirm-delete"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', /delete.*assignment/i)
        .and('contain.text', existingAssignment.consultant.name);

      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);

      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete|remove/i)
        .click();

      cy.wait('@deleteAssignment');

      // Verify success
      cy.get('[data-testid="dialog-confirm-delete"]').should('not.exist');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /assignment.*deleted/i);

      // Verify assignment removed from list
      cy.wait('@getUpdatedAssignments');
      cy.get(`[data-testid="assignment-${assignmentId}"]`).should('not.exist');
      cy.get('[data-testid="empty-assignments-state"]')
        .should('be.visible')
        .and('contain.text', /no assignments/i);
    });

    it('should cancel assignment deletion when clicking cancel', () => {
      cy.get(`[data-testid="assignment-${assignmentId}"]`).within(() => {
        cy.get('[data-testid="button-delete-assignment"]').click();
      });

      cy.get('[data-testid="dialog-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="button-cancel-delete"]').click();

      // Dialog should close, assignment should remain
      cy.get('[data-testid="dialog-confirm-delete"]').should('not.exist');
      cy.get(`[data-testid="assignment-${assignmentId}"]`)
        .should('be.visible');
    });
  });

  describe('Consultant Schedule View - Individual Assignment Management', () => {
    beforeEach(() => {
      const consultantAssignments = [{
        id: 'assignment-1',
        consultantId: testData.consultant.id,
        scheduleId: 'schedule-1',
        schedule: {
          id: 'schedule-1',
          name: 'January Implementation',
          project: {
            id: testData.project.id,
            name: testData.project.name,
            hospital: {
              id: testData.hospital.id,
              name: testData.hospital.name
            }
          }
        },
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        role: 'Implementation Specialist',
        hoursPerDay: 8,
        status: 'active'
      }];

      cy.intercept('GET', apiEndpoints.consultantSchedules(testData.consultant.id), {
        statusCode: 200,
        body: { data: consultantAssignments, count: 1 }
      }).as('getConsultantSchedules');

      cy.visit(`/consultants/${testData.consultant.id}/schedules`);
      cy.wait('@getConsultantSchedules');
    });

    it('should display consultant assignment timeline view', () => {
      cy.get('[data-testid="consultant-schedules-container"]', { timeout: 10000 })
        .should('be.visible');

      cy.get('[data-testid="consultant-info"]')
        .should('be.visible')
        .and('contain.text', testData.consultant.name);

      // Timeline or calendar view
      cy.get('[data-testid="schedule-timeline"]').should('be.visible');

      // Assignment cards
      cy.get('[data-testid="assignment-card-assignment-1"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="assignment-project"]')
            .should('contain.text', testData.project.name);
          
          cy.get('[data-testid="assignment-hospital"]')
            .should('contain.text', testData.hospital.name);
          
          cy.get('[data-testid="assignment-schedule"]')
            .should('contain.text', 'January Implementation');
          
          cy.get('[data-testid="assignment-period"]')
            .should('contain.text', '2024-01-01')
            .and('contain.text', '2024-01-31');
        });
    });

    it('should provide filtering and view options', () => {
      // Date range filter
      cy.get('[data-testid="date-range-filter"]').should('be.visible');
      
      // Status filter
      cy.get('[data-testid="status-filter"]').should('be.visible');
      
      // View toggle (timeline/calendar/list)
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      
      // Test view switching
      cy.get('[data-testid="view-calendar"]').click();
      cy.get('[data-testid="calendar-view"]').should('be.visible');
      
      cy.get('[data-testid="view-list"]').click();
      cy.get('[data-testid="list-view"]').should('be.visible');
    });

    it('should handle empty consultant assignments state', () => {
      cy.intercept('GET', apiEndpoints.consultantSchedules(testData.consultant.id), {
        statusCode: 200,
        body: { data: [], count: 0 }
      }).as('getEmptySchedules');

      cy.reload();
      cy.wait('@getEmptySchedules');

      cy.get('[data-testid="empty-assignments-state"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', /no assignments/i);

      cy.get('[data-testid="consultant-info"]')
        .should('contain.text', testData.consultant.name);
    });
  });

  describe('Team Assignments - Project Team Management', () => {
    let teamAssignments;

    beforeEach(() => {
      teamAssignments = [{
        id: 'team-assignment-1',
        consultantId: testData.consultant.id,
        consultant: {
          id: testData.consultant.id,
          name: testData.consultant.name,
          email: 'test@example.com',
          role: 'Implementation Specialist'
        },
        projectId: testData.project.id,
        teamRoleId: 'role-1',
        teamRole: {
          id: 'role-1',
          name: 'Lead Implementer',
          description: 'Leads implementation activities',
          permissions: ['MANAGE_IMPLEMENTATION']
        },
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        status: 'active',
        isLead: true
      }];

      cy.intercept('GET', apiEndpoints.projectTeam(testData.project.id), {
        statusCode: 200,
        body: { data: teamAssignments, count: 1 }
      }).as('getProjectTeam');

      cy.intercept('GET', apiEndpoints.teamRoles, {
        statusCode: 200,
        body: {
          data: [{
            id: 'role-1',
            name: 'Lead Implementer',
            description: 'Leads implementation activities'
          }, {
            id: 'role-2',
            name: 'Technical Specialist',
            description: 'Provides technical expertise'
          }],
          count: 2
        }
      }).as('getTeamRoles');

      cy.visit(`/projects/${testData.project.id}/team`);
      cy.wait('@getProjectTeam');
    });

    it('should display project team management page', () => {
      cy.get('[data-testid="project-team-container"]', { timeout: 10000 })
        .should('be.visible');

      cy.get('[data-testid="page-header"]')
        .should('contain.text', /team/i);

      // Add team member button
      cy.get('[data-testid="button-add-team-member"]')
        .should('be.visible')
        .and('contain.text', /add.*member/i);

      // Team members list
      cy.get('[data-testid="team-members-list"]')
        .should('be.visible');

      // Team member cards
      cy.get('[data-testid="team-member-team-assignment-1"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="member-name"]')
            .should('contain.text', testData.consultant.name);
          
          cy.get('[data-testid="member-role"]')
            .should('contain.text', 'Lead Implementer');
          
          cy.get('[data-testid="member-lead-badge"]')
            .should('be.visible')
            .and('contain.text', /lead/i);
          
          cy.get('[data-testid="member-status"]')
            .should('contain.text', 'active');
        });
    });

    it('should open add team member dialog with role selection', () => {
      cy.intercept('GET', '/api/consultants').as('getConsultants');
      
      cy.get('[data-testid="button-add-team-member"]').click();

      cy.get('[data-testid="dialog-add-team-member"]', { timeout: 10000 })
        .should('be.visible');

      // Form fields
      cy.get('[data-testid="select-consultant"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="select-team-role"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.wait('@getTeamRoles');
      cy.get('[data-testid="select-team-role"]').click();
      cy.get('[data-testid="option-role-role-1"]')
        .should('be.visible')
        .and('contain.text', 'Lead Implementer');
      cy.get('[data-testid="option-role-role-2"]')
        .should('be.visible')
        .and('contain.text', 'Technical Specialist');

      // Additional fields
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-end-date"]')
        .should('be.visible');

      cy.get('[data-testid="checkbox-is-lead"]')
        .should('be.visible');
    });

    it('should validate team assignment form', () => {
      cy.get('[data-testid="button-add-team-member"]').click();
      cy.get('[data-testid="dialog-add-team-member"]').should('be.visible');

      // Submit without required fields
      cy.get('[data-testid="button-save-team-assignment"]')
        .should('be.disabled');

      // Fill required fields
      cy.get('[data-testid="select-consultant"]').click();
      cy.wait('@getConsultants');
      cy.get(`[data-testid="option-consultant-${testData.consultant.id}"]`)
        .click();

      cy.get('[data-testid="select-team-role"]').click();
      cy.get('[data-testid="option-role-role-2"]').click();

      cy.get('[data-testid="input-start-date"]').type('2024-02-01');

      cy.get('[data-testid="button-save-team-assignment"]')
        .should('not.be.disabled');

      // Test lead assignment validation
      cy.get('[data-testid="checkbox-is-lead"]').check();
      cy.get('[data-testid="warning-multiple-leads"]')
        .should('be.visible')
        .and('contain.text', /already.*lead/i);
    });

    it('should successfully add team member', () => {
      const newTeamAssignment = {
        id: 'team-assignment-2',
        consultantId: 'consultant-2',
        consultant: {
          id: 'consultant-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Technical Specialist'
        },
        projectId: testData.project.id,
        teamRoleId: 'role-2',
        teamRole: {
          id: 'role-2',
          name: 'Technical Specialist',
          description: 'Provides technical expertise'
        },
        startDate: '2024-02-01',
        status: 'active',
        isLead: false
      };

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: {
          data: [{
            id: 'consultant-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'active'
          }],
          count: 1
        }
      }).as('getConsultants');

      cy.intercept('POST', apiEndpoints.projectTeam(testData.project.id), {
        statusCode: 201,
        body: { data: newTeamAssignment }
      }).as('createTeamAssignment');

      cy.intercept('GET', apiEndpoints.projectTeam(testData.project.id), {
        statusCode: 200,
        body: { data: [...teamAssignments, newTeamAssignment], count: 2 }
      }).as('getUpdatedTeam');

      cy.get('[data-testid="button-add-team-member"]').click();
      cy.get('[data-testid="dialog-add-team-member"]').should('be.visible');

      // Fill form
      cy.get('[data-testid="select-consultant"]').click();
      cy.wait('@getConsultants');
      cy.get('[data-testid="option-consultant-consultant-2"]').click();

      cy.get('[data-testid="select-team-role"]').click();
      cy.get('[data-testid="option-role-role-2"]').click();

      cy.get('[data-testid="input-start-date"]').type('2024-02-01');

      cy.get('[data-testid="button-save-team-assignment"]').click();
      cy.wait('@createTeamAssignment');

      // Verify success
      cy.get('[data-testid="dialog-add-team-member"]').should('not.exist');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /team member.*added/i);

      // Verify new member in list
      cy.wait('@getUpdatedTeam');
      cy.get('[data-testid="team-member-team-assignment-2"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="member-name"]')
            .should('contain.text', 'Jane Smith');
          cy.get('[data-testid="member-role"]')
            .should('contain.text', 'Technical Specialist');
        });
    });

    it('should handle team member removal', () => {
      cy.intercept('DELETE', apiEndpoints.teamAssignments('team-assignment-1'), {
        statusCode: 200,
        body: { success: true }
      }).as('removeTeamMember');

      cy.intercept('GET', apiEndpoints.projectTeam(testData.project.id), {
        statusCode: 200,
        body: { data: [], count: 0 }
      }).as('getUpdatedTeam');

      cy.get('[data-testid="team-member-team-assignment-1"]').within(() => {
        cy.get('[data-testid="button-remove-member"]').click();
      });

      // Confirmation dialog
      cy.get('[data-testid="dialog-confirm-remove"]')
        .should('be.visible')
        .and('contain.text', /remove.*member/i)
        .and('contain.text', testData.consultant.name);

      cy.get('[data-testid="button-confirm-remove"]').click();
      cy.wait('@removeTeamMember');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /member.*removed/i);

      cy.wait('@getUpdatedTeam');
      cy.get('[data-testid="team-member-team-assignment-1"]').should('not.exist');
    });
  });

  describe('RBAC Role Assignments - Admin Functionality', () => {
    beforeEach(() => {
      const roleAssignments = [{
        id: 'rbac-assignment-1',
        userId: 'user-1',
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com'
        },
        roleId: 'role-admin',
        role: {
          id: 'role-admin',
          name: 'Administrator',
          description: 'Full system access'
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'admin-user'
      }];

      cy.intercept('GET', apiEndpoints.rbacRoles, {
        statusCode: 200,
        body: {
          data: [{
            id: 'role-admin',
            name: 'Administrator',
            description: 'Full system access'
          }, {
            id: 'role-manager',
            name: 'Manager',
            description: 'Management access'
          }],
          count: 2
        }
      }).as('getRbacRoles');

      cy.intercept('GET', apiEndpoints.rbacAssignments, {
        statusCode: 200,
        body: { data: roleAssignments, count: 1 }
      }).as('getRbacAssignments');

      cy.visit('/admin/rbac/assignments');
      cy.wait('@getRbacAssignments');
    });

    it('should display RBAC assignments management page', () => {
      cy.get('[data-testid="rbac-assignments-container"]', { timeout: 10000 })
        .should('be.visible');

      cy.get('[data-testid="page-header"]')
        .should('contain.text', /role.*assignment/i);

      // Add assignment button
      cy.get('[data-testid="button-add-rbac-assignment"]')
        .should('be.visible');

      // Assignments table
      cy.get('[data-testid="rbac-assignments-table"]')
        .should('be.visible');

      cy.get('[data-testid="rbac-assignment-rbac-assignment-1"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="assignment-user"]')
            .should('contain.text', 'John Doe');
          cy.get('[data-testid="assignment-role"]')
            .should('contain.text', 'Administrator');
          cy.get('[data-testid="assignment-created"]')
            .should('contain.text', '2024-01-01');
        });
    });

    it('should create new RBAC assignment', () => {
      const newAssignment = {
        id: 'rbac-assignment-2',
        userId: 'user-2',
        user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        roleId: 'role-manager',
        role: { id: 'role-manager', name: 'Manager', description: 'Management access' }
      };

      cy.intercept('GET', '/api/users', {
        statusCode: 200,
        body: {
          data: [{ id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' }],
          count: 1
        }
      }).as('getUsers');

      cy.intercept('POST', apiEndpoints.rbacAssignments, {
        statusCode: 201,
        body: { data: newAssignment }
      }).as('createRbacAssignment');

      cy.get('[data-testid="button-add-rbac-assignment"]').click();
      cy.get('[data-testid="dialog-add-rbac-assignment"]').should('be.visible');

      // Fill form
      cy.get('[data-testid="select-user"]').click();
      cy.wait('@getUsers');
      cy.get('[data-testid="option-user-user-2"]').click();

      cy.get('[data-testid="select-role"]').click();
      cy.wait('@getRbacRoles');
      cy.get('[data-testid="option-role-role-manager"]').click();

      cy.get('[data-testid="button-save-rbac-assignment"]').click();
      cy.wait('@createRbacAssignment');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /role.*assigned/i);
    });

    it('should handle RBAC assignment removal', () => {
      cy.intercept('DELETE', `${apiEndpoints.rbacAssignments}?userId=user-1&roleId=role-admin`, {
        statusCode: 200,
        body: { success: true }
      }).as('removeRbacAssignment');

      cy.get('[data-testid="rbac-assignment-rbac-assignment-1"]').within(() => {
        cy.get('[data-testid="button-remove-assignment"]').click();
      });

      cy.get('[data-testid="dialog-confirm-remove-rbac"]').should('be.visible');
      cy.get('[data-testid="button-confirm-remove-rbac"]').click();
      cy.wait('@removeRbacAssignment');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /role.*removed/i);
    });
  });

  describe('Assignment Analytics & Reporting', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/analytics/assignments', {
        statusCode: 200,
        body: {
          data: {
            totalAssignments: 150,
            activeAssignments: 120,
            completedAssignments: 30,
            utilizationRate: 85.2,
            averageAssignmentDuration: 45,
            topConsultants: [
              { id: testData.consultant.id, name: testData.consultant.name, assignmentCount: 12 }
            ],
            assignmentsByMonth: [
              { month: '2024-01', count: 25 },
              { month: '2024-02', count: 30 }
            ]
          }
        }
      }).as('getAssignmentAnalytics');

      cy.visit('/analytics/assignments');
      cy.wait('@getAssignmentAnalytics');
    });

    it('should display assignment analytics dashboard', () => {
      cy.get('[data-testid="analytics-dashboard"]', { timeout: 10000 })
        .should('be.visible');

      // Key metrics
      cy.get('[data-testid="metric-total-assignments"]')
        .should('contain.text', '150');

      cy.get('[data-testid="metric-active-assignments"]')
        .should('contain.text', '120');

      cy.get('[data-testid="metric-utilization-rate"]')
        .should('contain.text', '85.2%');

      // Charts
      cy.get('[data-testid="chart-assignments-timeline"]')
        .should('be.visible');

      cy.get('[data-testid="chart-consultant-utilization"]')
        .should('be.visible');

      // Top consultants list
      cy.get('[data-testid="top-consultants-list"]')
        .should('be.visible')
        .and('contain.text', testData.consultant.name);
    });

    it('should allow filtering analytics data', () => {
      // Date range filter
      cy.get('[data-testid="date-range-picker"]').should('be.visible');
      
      // Project filter
      cy.get('[data-testid="project-filter"]').should('be.visible');
      
      // Hospital filter
      cy.get('[data-testid="hospital-filter"]').should('be.visible');

      // Apply filters and verify API calls
      cy.intercept('GET', '/api/analytics/assignments?projectId=*').as('getFilteredAnalytics');
      
      cy.get('[data-testid="project-filter"]').click();
      cy.get(`[data-testid="option-project-${testData.project.id}"]`).click();
      
      cy.wait('@getFilteredAnalytics');
    });
  });

  describe('Assignment Error Handling & Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getSchedulesError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      cy.wait('@getSchedulesError');

      cy.get('[data-testid="error-message"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', /error.*loading/i);

      cy.get('[data-testid="button-retry"]')
        .should('be.visible')
        .and('contain.text', /retry/i);
    });

    it('should handle network timeouts', () => {
      cy.intercept('GET', apiEndpoints.schedules(testData.project.id), {
        delay: 30000
      }).as('getSchedulesTimeout');

      cy.visit(`/projects/${testData.project.id}/schedules`);

      cy.get('[data-testid="loading-spinner"]', { timeout: 10000 })
        .should('be.visible');

      // Should show timeout error after reasonable delay
      cy.get('[data-testid="error-timeout"]', { timeout: 35000 })
        .should('be.visible');
    });

    it('should handle assignment conflicts', () => {
      cy.intercept('POST', apiEndpoints.scheduleAssignments('*'), {
        statusCode: 409,
        body: { 
          error: 'Assignment conflict', 
          details: 'Consultant already assigned during this period' 
        }
      }).as('createConflictError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      
      // Attempt to create conflicting assignment
      cy.get('[data-testid="button-add-assignment"]').first().click();
      cy.get('[data-testid="dialog-create-assignment"]').should('be.visible');

      // Fill form and submit
      cy.get('[data-testid="select-consultant"]').click();
      cy.get(`[data-testid="option-consultant-${testData.consultant.id}"]`).click();
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-01-31');

      cy.get('[data-testid="button-save-assignment"]').click();
      cy.wait('@createConflictError');

      cy.get('[data-testid="error-conflict"]')
        .should('be.visible')
        .and('contain.text', /conflict.*already assigned/i);
    });

    it('should handle permission denied errors', () => {
      cy.intercept('POST', apiEndpoints.scheduleAssignments('*'), {
        statusCode: 403,
        body: { error: 'Permission denied' }
      }).as('createPermissionError');

      cy.visit(`/projects/${testData.project.id}/schedules`);
      
      cy.get('[data-testid="button-add-assignment"]').first().click();
      cy.get('[data-testid="dialog-create-assignment"]').should('be.visible');

      cy.get('[data-testid="select-consultant"]').click();
      cy.get(`[data-testid="option-consultant-${testData.consultant.id}"]`).click();
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-01-31');

      cy.get('[data-testid="button-save-assignment"]').click();
      cy.wait('@createPermissionError');

      cy.get('[data-testid="error-permission"]')
        .should('be.visible')
        .and('contain.text', /permission.*denied/i);
    });
  });

  describe('Mobile Responsiveness - Assignment Management', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should display assignments properly on mobile devices', () => {
      cy.visit(`/projects/${testData.project.id}/schedules`);

      // Mobile-optimized layout
      cy.get('[data-testid="mobile-assignments-container"]', { timeout: 10000 })
        .should('be.visible');

      // Responsive navigation
      cy.get('[data-testid="mobile-nav-toggle"]')
        .should('be.visible');

      // Touch-friendly buttons
      cy.get('[data-testid="button-add-assignment"]')
        .should('have.css', 'min-height')
        .and('match', /44px|2\.75rem/); // iOS touch target size
    });

    it('should handle mobile assignment forms', () => {
      cy.visit(`/projects/${testData.project.id}/schedules`);
      
      cy.get('[data-testid="button-add-assignment"]').first().click();

      // Mobile dialog should be full-screen or properly sized
      cy.get('[data-testid="dialog-create-assignment"]')
        .should('be.visible')
        .and('have.css', 'position', 'fixed');

      // Form inputs should be touch-friendly
      cy.get('[data-testid="select-consultant"]')
        .should('have.css', 'min-height')
        .and('match', /44px|2\.75rem/);
    });
  });
});
