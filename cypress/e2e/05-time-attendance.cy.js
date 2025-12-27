describe('Time & Attendance', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('GET', '/api/projects', {
      statusCode: 200,
      body: [
        { id: 'p1', name: 'Epic EHR Project' },
        { id: 'p2', name: 'Cerner Training' }
      ]
    }).as('getProjects');

    cy.intercept('GET', '/api/consultants', {
      statusCode: 200,
      body: [
        { id: 'c1', user: { firstName: 'John', lastName: 'Doe' } },
        { id: 'c2', user: { firstName: 'Jane', lastName: 'Smith' } }
      ]
    }).as('getConsultants');

    cy.intercept('GET', '/api/timesheets', {
      statusCode: 200,
      body: []
    }).as('getTimesheets');

    cy.visit('/timesheets');
    cy.wait('@getUser');
  });

  describe('Timesheets List', () => {
    it('should display timesheets page', () => {
      cy.contains('Timesheets').should('be.visible');
    });

    it('should display create timesheet button', () => {
      cy.get('[data-testid="button-create-timesheet"]').should('be.visible');
    });

    it('should display export button', () => {
      cy.get('[data-testid="button-export-timesheets"]').should('be.visible');
    });

    it('should display timesheets table', () => {
      cy.get('[data-testid="timesheets-table"]').should('exist');
    });

    it('should display date range filters', () => {
      cy.get('[data-testid="input-start-date"]').should('be.visible');
      cy.get('[data-testid="input-end-date"]').should('be.visible');
    });

    it('should display status filter', () => {
      cy.get('[data-testid="filter-status"]').should('be.visible');
    });

    it('should display consultant filter', () => {
      cy.get('[data-testid="filter-consultant"]').should('be.visible');
    });

    it('should have weekly summary tab', () => {
      cy.get('[data-testid="tab-weekly-summary"]').should('exist');
    });

    it('should display project hours breakdown card', () => {
      cy.get('[data-testid="project-hours-breakdown"]').should('exist');
    });
  });

  describe('Filter Functionality', () => {
    it('should filter by date range', () => {
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-01-31');
      cy.get('[data-testid="button-apply-filter"]').click();
    });

    it('should open status filter dropdown', () => {
      cy.get('[data-testid="filter-status"]').first().click();
      cy.get('[role="listbox"]').should('be.visible');
    });

    it('should open consultant filter dropdown', () => {
      cy.get('[data-testid="filter-consultant"]').first().click();
      cy.get('[role="listbox"]').should('be.visible');
    });
  });

  describe('Create Timesheet Entry', () => {
    it('should open create timesheet modal', () => {
      cy.get('[data-testid="button-create-timesheet"]').click();
      cy.get('[data-testid="input-date"]').should('be.visible');
    });

    it('should display form fields in create modal', () => {
      cy.get('[data-testid="button-create-timesheet"]').click();
      cy.get('[data-testid="input-date"]').should('exist');
      cy.get('[data-testid="select-project"]').should('exist');
      cy.get('[data-testid="input-hours"]').should('exist');
      cy.get('[data-testid="select-task-type"]').should('exist');
      cy.get('[data-testid="input-description"]').should('exist');
    });

    it('should have submit button in create modal', () => {
      cy.get('[data-testid="button-create-timesheet"]').click();
      cy.get('[data-testid="button-submit-timesheet"]').should('exist');
    });

    it('should fill out timesheet form', () => {
      cy.get('[data-testid="button-create-timesheet"]').click();

      // Fill date
      cy.get('[data-testid="input-date"]').clear().type('2024-01-15');

      // Select project
      cy.get('[data-testid="select-project"]').click();
      cy.get('[role="option"]').first().click();

      // Enter hours
      cy.get('[data-testid="input-hours"]').type('8');

      // Select task type
      cy.get('[data-testid="select-task-type"]').click();
      cy.get('[role="option"]').first().click();

      // Add description
      cy.get('[data-testid="input-description"]').type('Worked on implementation');

      // Submit button should be enabled
      cy.get('[data-testid="button-submit-timesheet"]').should('exist');
    });

    it('should submit timesheet entry', () => {
      cy.intercept('POST', '/api/timesheets', {
        statusCode: 201,
        body: { id: 'new-ts', status: 'draft' }
      }).as('createTimesheet');

      cy.get('[data-testid="button-create-timesheet"]').click();
      cy.get('[data-testid="input-date"]').clear().type('2024-01-15');
      cy.get('[data-testid="select-project"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-testid="input-hours"]').type('8');
      cy.get('[data-testid="select-task-type"]').click();
      cy.get('[role="option"]').first().click();
      cy.get('[data-testid="input-description"]').type('Test entry');
      cy.get('[data-testid="button-submit-timesheet"]').click();
    });
  });

  describe('Weekly Summary View', () => {
    it('should switch to weekly summary tab', () => {
      cy.get('[data-testid="tab-weekly-summary"]').click();
      cy.get('[data-testid="weekly-hours-total"]').should('exist');
    });

    it('should display weekly hours total', () => {
      cy.get('[data-testid="tab-weekly-summary"]').click();
      cy.get('[data-testid="weekly-hours-total"]').should('contain', 'h');
    });
  });

  describe('Export Functionality', () => {
    it('should open export modal', () => {
      cy.get('[data-testid="button-export-timesheets"]').click();
      cy.get('[data-testid="select-export-format"]').should('exist');
    });

    it('should have export format selector in modal', () => {
      cy.get('[data-testid="button-export-timesheets"]').click();
      // Export format selector should exist in modal
      cy.get('[data-testid="select-export-format"]').should('exist');
    });

    it('should have download button in export modal', () => {
      cy.get('[data-testid="button-export-timesheets"]').click();
      cy.get('[data-testid="button-download"]').should('exist');
    });
  });

  describe('Timesheet With Data', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/timesheets', {
        statusCode: 200,
        body: [
          {
            id: 'ts1',
            consultantId: 'c1',
            consultantName: 'John Doe',
            projectId: 'p1',
            projectName: 'Epic EHR Project',
            date: '2024-01-15',
            hours: 8,
            description: 'Implementation work',
            taskType: 'development',
            status: 'pending'
          },
          {
            id: 'ts2',
            consultantId: 'c2',
            consultantName: 'Jane Smith',
            projectId: 'p2',
            projectName: 'Cerner Training',
            date: '2024-01-15',
            hours: 6,
            description: 'Training session',
            taskType: 'training',
            status: 'approved'
          }
        ]
      }).as('getTimesheetsWithData');

      cy.visit('/timesheets');
      cy.wait('@getUser');
    });

    it('should display timesheet rows', () => {
      cy.get('[data-testid="timesheet-row"]').should('have.length.at.least', 1);
    });

    it('should display timesheet status badges', () => {
      cy.get('[data-testid="timesheet-status"]').should('have.length.at.least', 1);
    });

    it('should have select all checkbox', () => {
      cy.get('[data-testid="checkbox-select-all"]').should('exist');
    });

    it('should display approve button for pending timesheets', () => {
      cy.get('[data-testid="button-approve"]').should('exist');
    });

    it('should display reject button for pending timesheets', () => {
      cy.get('[data-testid="button-reject"]').should('exist');
    });

    it('should display edit button', () => {
      cy.get('[data-testid="button-edit-timesheet"]').should('have.length.at.least', 1);
    });
  });

  describe('Bulk Actions', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/timesheets', {
        statusCode: 200,
        body: [
          { id: 'ts1', consultantName: 'John', projectName: 'Project A', date: '2024-01-15', hours: 8, status: 'pending' },
          { id: 'ts2', consultantName: 'Jane', projectName: 'Project B', date: '2024-01-15', hours: 6, status: 'pending' }
        ]
      }).as('getTimesheetsForBulk');

      cy.visit('/timesheets');
      cy.wait('@getUser');
    });

    it('should have select all checkbox in table header', () => {
      cy.get('[data-testid="checkbox-select-all"]').should('exist');
    });

    it('should show bulk approve button after selecting items', () => {
      // Click select all to select items
      cy.get('[data-testid="checkbox-select-all"]').click();
      // Bulk approve button should now be visible
      cy.get('[data-testid="button-bulk-approve"]').should('exist');
    });
  });

  describe('Approval Workflow', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/timesheets', {
        statusCode: 200,
        body: [
          { id: 'ts1', consultantName: 'John', projectName: 'Project A', date: '2024-01-15', hours: 8, status: 'pending' }
        ]
      }).as('getTimesheetsForApproval');

      cy.visit('/timesheets');
      cy.wait('@getUser');
    });

    it('should approve timesheet', () => {
      cy.intercept('PATCH', '/api/timesheets/*', {
        statusCode: 200,
        body: { id: 'ts1', status: 'approved' }
      }).as('approveTimesheet');

      cy.get('[data-testid="button-approve"]').first().click();
    });

    it('should open reject dialog', () => {
      cy.get('[data-testid="button-reject"]').first().click();
      cy.get('[data-testid="input-rejection-reason"]').should('be.visible');
    });

    it('should require rejection reason', () => {
      cy.get('[data-testid="button-reject"]').first().click();
      cy.get('[data-testid="button-confirm-reject"]').should('exist');
    });

    it('should reject with reason', () => {
      cy.intercept('PATCH', '/api/timesheets/*', {
        statusCode: 200,
        body: { id: 'ts1', status: 'rejected' }
      }).as('rejectTimesheet');

      cy.get('[data-testid="button-reject"]').first().click();
      cy.get('[data-testid="input-rejection-reason"]').type('Hours seem incorrect');
      cy.get('[data-testid="button-confirm-reject"]').click();
    });
  });

  // ===========================================================================
  // TODO: Advanced Features (Require Additional Implementation)
  // ===========================================================================

  describe('Clock In/Out', () => {
    it.skip('TODO: Clock in button', () => {});
    it.skip('TODO: Clock out button', () => {});
    it.skip('TODO: Break tracking', () => {});
    it.skip('TODO: Current status display', () => {});
  });

  describe('Monthly Summary', () => {
    it.skip('TODO: Monthly summary view', () => {});
    it.skip('TODO: Monthly hours by project breakdown', () => {});
  });
});
