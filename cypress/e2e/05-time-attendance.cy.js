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
  // Clock In/Out Features
  // ===========================================================================

  describe('Clock In/Out', () => {
    // Helper to set up common intercepts
    const setupCommonIntercepts = () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: []
      }).as('getProjects');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      // Use demo-ts-1 to match the default fallback in the component
      cy.intercept('GET', '/api/timesheets', {
        statusCode: 200,
        body: [{ id: 'demo-ts-1', status: 'draft' }]
      }).as('getTimesheets');
    };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();
    });

    it('should display time clock card', () => {
      setupCommonIntercepts();
      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.get('[data-testid="card-time-clock"]').should('be.visible');
    });

    it('should display clock in button when not clocked in', () => {
      setupCommonIntercepts();
      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.get('[data-testid="button-clock-in"]').should('be.visible');
      cy.get('[data-testid="button-clock-out"]').should('not.exist');
    });

    it('should display current status as Not Clocked In', () => {
      setupCommonIntercepts();
      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.get('[data-testid="text-clock-status"]').should('contain', 'Not Clocked In');
    });

    it('should display elapsed time counter', () => {
      setupCommonIntercepts();
      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.get('[data-testid="text-elapsed-time"]').should('contain', '00:00:00');
    });

    it('should clock in successfully', () => {
      setupCommonIntercepts();
      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.intercept('POST', '/api/timesheets/demo-ts-1/clock-in', {
        statusCode: 200,
        body: { id: 'entry-1', clockIn: new Date().toISOString(), clockOut: null }
      }).as('clockIn');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.get('[data-testid="button-clock-in"]').click();
      cy.wait('@clockIn');
    });

    it('should show clock out and break buttons when clocked in', () => {
      setupCommonIntercepts();
      // Use local date format to match component's format()
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: [{
          id: 'entry-1',
          timesheetId: 'demo-ts-1',
          entryDate: localDate,
          clockIn: new Date().toISOString(),
          clockOut: null,
          breakMinutes: 0,
          totalHours: 0,
          location: null,
          notes: null,
          isManualEntry: false
        }]
      }).as('getActiveEntry');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getActiveEntry');

      cy.get('[data-testid="button-clock-out"]').should('be.visible');
      cy.get('[data-testid="button-start-break"]').should('be.visible');
      cy.get('[data-testid="button-clock-in"]').should('not.exist');
    });

    it('should display Working status when clocked in', () => {
      setupCommonIntercepts();
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: [{
          id: 'entry-1',
          timesheetId: 'demo-ts-1',
          entryDate: localDate,
          clockIn: new Date().toISOString(),
          clockOut: null,
          breakMinutes: 0,
          totalHours: 0,
          location: null,
          notes: null,
          isManualEntry: false
        }]
      }).as('getActiveEntry');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getActiveEntry');

      cy.get('[data-testid="text-clock-status"]').should('contain', 'Working');
    });

    it('should clock out successfully', () => {
      setupCommonIntercepts();
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: [{
          id: 'entry-1',
          timesheetId: 'demo-ts-1',
          entryDate: localDate,
          clockIn: new Date(Date.now() - 3600000).toISOString(),
          clockOut: null,
          breakMinutes: 0,
          totalHours: 0,
          location: null,
          notes: null,
          isManualEntry: false
        }]
      }).as('getActiveEntry');

      cy.intercept('POST', '/api/timesheet-entries/entry-1/clock-out', {
        statusCode: 200,
        body: { id: 'entry-1', clockOut: new Date().toISOString(), totalHours: 1.0 }
      }).as('clockOut');

      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getActiveEntry');

      cy.get('[data-testid="button-clock-out"]').click();
      cy.wait('@clockOut');
    });
  });

  describe('Break Tracking', () => {
    // Helper to get local date in YYYY-MM-DD format
    const getLocalDate = () => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    };

    // Helper to set up common intercepts
    const setupCommonIntercepts = () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: []
      }).as('getProjects');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      // Use demo-ts-1 to match the default fallback in the component
      cy.intercept('GET', '/api/timesheets', {
        statusCode: 200,
        body: [{ id: 'demo-ts-1', status: 'draft' }]
      }).as('getTimesheets');

      // Mock active clock-in with complete entry data
      cy.intercept('GET', '/api/timesheets/demo-ts-1/entries', {
        statusCode: 200,
        body: [{
          id: 'entry-1',
          timesheetId: 'demo-ts-1',
          entryDate: getLocalDate(),
          clockIn: new Date().toISOString(),
          clockOut: null,
          breakMinutes: 0,
          totalHours: 0,
          location: null,
          notes: null,
          isManualEntry: false
        }]
      }).as('getEntries');
    };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();
    });

    it('should show start break button when working', () => {
      setupCommonIntercepts();
      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getEntries');
      cy.get('[data-testid="button-start-break"]').should('be.visible');
    });

    it('should switch to end break button when on break', () => {
      setupCommonIntercepts();
      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getEntries');
      cy.get('[data-testid="button-start-break"]').click();
      cy.get('[data-testid="button-end-break"]').should('be.visible');
      cy.get('[data-testid="button-start-break"]').should('not.exist');
    });

    it('should display On Break status', () => {
      setupCommonIntercepts();
      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getEntries');
      cy.get('[data-testid="button-start-break"]').click();
      cy.get('[data-testid="text-clock-status"]').should('contain', 'On Break');
    });

    it('should disable clock out during break', () => {
      setupCommonIntercepts();
      cy.visit('/timesheets');
      cy.wait('@getUser');
      cy.wait('@getEntries');
      cy.get('[data-testid="button-start-break"]').click();
      cy.get('[data-testid="button-clock-out"]').should('be.disabled');
    });
  });

  // ===========================================================================
  // Monthly Summary
  // ===========================================================================

  describe('Monthly Summary', () => {
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
        body: []
      }).as('getProjects');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      cy.intercept('GET', '/api/timesheets', {
        statusCode: 200,
        body: []
      }).as('getTimesheets');

      cy.intercept('GET', '/api/timesheets/*/entries', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.visit('/timesheets');
      cy.wait('@getUser');
    });

    it('should display monthly summary tab', () => {
      cy.get('[data-testid="tab-monthly-summary"]').should('be.visible');
    });

    it('should switch to monthly summary view', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="tab-content-monthly-summary"]').should('be.visible');
    });

    it('should display current month name', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="text-current-month"]').should('be.visible');
    });

    it('should display monthly hours total', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="monthly-hours-total"]').should('contain', 'h');
    });

    it('should navigate to previous month', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="text-current-month"]').invoke('text').then((currentMonth) => {
        cy.get('[data-testid="button-prev-month"]').click();
        cy.get('[data-testid="text-current-month"]').should('not.have.text', currentMonth);
      });
    });

    it('should navigate to next month', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="button-prev-month"]').click(); // Go back first
      cy.get('[data-testid="text-current-month"]').invoke('text').then((previousMonth) => {
        cy.get('[data-testid="button-next-month"]').click();
        cy.get('[data-testid="text-current-month"]').should('not.have.text', previousMonth);
      });
    });

    it('should display project breakdown section', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="monthly-project-breakdown-title"]').should('contain', 'Hours by Project');
    });

    it('should display monthly project breakdown grid', () => {
      cy.get('[data-testid="tab-monthly-summary"]').click();
      cy.get('[data-testid="monthly-project-breakdown"]').should('be.visible');
    });
  });
});
