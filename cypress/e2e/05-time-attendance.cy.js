// ***********************************************
// NICEHR Platform - Time & Attendance Tests
// ***********************************************

describe('Time & Attendance', () => {
  beforeEach(() => {
    cy.loginViaApi();
  });

  describe('Timesheets', () => {
    beforeEach(() => {
      cy.navigateTo('timesheets');
      cy.waitForPageLoad();
    });

    describe('Timesheet List', () => {
      it('should display timesheets list', () => {
        cy.get('[data-testid="timesheets-table"], [data-testid="timesheets-list"]').should('be.visible');
      });

      it('should filter by date range', () => {
        cy.get('[data-testid="input-start-date"]').type('2024-01-01');
        cy.get('[data-testid="input-end-date"]').type('2024-01-31');
        cy.get('[data-testid="button-apply-filter"]').click();
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
      });

      it('should filter by consultant', () => {
        cy.get('[data-testid="filter-consultant"]').should('be.visible');
      });
    });

    describe('Create Timesheet Entry', () => {
      it('should open timesheet entry modal', () => {
        cy.openModal('button-create-timesheet');
        cy.get('[role="dialog"]').should('contain', 'Time');
      });

      it('should create a new timesheet entry', () => {
        cy.openModal('button-create-timesheet');
        cy.get('[data-testid="input-date"]').type('2024-01-15');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-hours"]').type('8');
        cy.get('[data-testid="input-description"]').type('Project implementation work');
        cy.selectOption('[data-testid="select-task-type"]', 'Implementation');
        
        cy.get('[data-testid="button-submit-timesheet"]').click();
        
        cy.get('[role="dialog"]').should('not.exist');
      });

      it('should validate hours field', () => {
        cy.openModal('button-create-timesheet');
        cy.get('[data-testid="input-hours"]').type('25');
        cy.get('[data-testid="button-submit-timesheet"]').click();
        
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });

      it('should require project selection', () => {
        cy.openModal('button-create-timesheet');
        cy.get('[data-testid="input-date"]').type('2024-01-15');
        cy.get('[data-testid="input-hours"]').type('8');
        cy.get('[data-testid="button-submit-timesheet"]').click();
        
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });
    });

    describe('Timesheet Approval Workflow', () => {
      it('should submit timesheet for approval', () => {
        cy.get('[data-testid="timesheet-row"]').first()
          .find('[data-testid="button-submit-approval"]').click();
        cy.get('[data-testid="timesheet-status"]').first().should('contain', 'Pending');
      });

      it('should approve timesheet', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
        cy.get('[data-testid="timesheet-row"]').first()
          .find('[data-testid="button-approve"]').click();
        cy.get('[data-testid="timesheet-status"]').first().should('contain', 'Approved');
      });

      it('should reject timesheet with reason', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
        cy.get('[data-testid="timesheet-row"]').first()
          .find('[data-testid="button-reject"]').click();
        
        cy.get('[data-testid="input-rejection-reason"]').type('Incorrect hours logged');
        cy.get('[data-testid="button-confirm-reject"]').click();
        
        cy.get('[data-testid="timesheet-status"]').first().should('contain', 'Rejected');
      });

      it('should bulk approve timesheets', () => {
        cy.get('[data-testid="checkbox-select-all"]').click();
        cy.get('[data-testid="button-bulk-approve"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });
    });

    describe('Edit & Delete Timesheet', () => {
      it('should edit timesheet entry', () => {
        cy.get('[data-testid="timesheet-row"]').first()
          .find('[data-testid="button-edit-timesheet"]').click();
        cy.get('[data-testid="input-hours"]').clear().type('7');
        cy.get('[data-testid="button-submit-timesheet"]').click();
      });

      it('should delete timesheet entry', () => {
        cy.get('[data-testid="timesheet-row"]').first()
          .find('[data-testid="button-delete-timesheet"]').click();
        cy.get('[data-testid="button-confirm-delete"]').click();
      });

      it('should not allow editing approved timesheets', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Approved');
        cy.get('[data-testid="timesheet-row"]').first()
          .find('[data-testid="button-edit-timesheet"]').should('be.disabled');
      });
    });

    describe('Timesheet Summary', () => {
      it('should show weekly summary', () => {
        cy.get('[data-testid="tab-weekly-summary"]').click();
        cy.get('[data-testid="weekly-hours-total"]').should('be.visible');
      });

      it('should show project breakdown', () => {
        cy.get('[data-testid="project-hours-breakdown"]').should('be.visible');
      });

      it('should export timesheet data', () => {
        cy.get('[data-testid="button-export-timesheets"]').click();
        cy.selectOption('[data-testid="select-export-format"]', 'CSV');
        cy.get('[data-testid="button-download"]').click();
      });
    });
  });

  describe('Schedules', () => {
    beforeEach(() => {
      cy.navigateTo('schedules');
      cy.waitForPageLoad();
    });

    describe('Schedule View', () => {
      it('should display schedule calendar', () => {
        cy.get('[data-testid="schedule-calendar"]').should('be.visible');
      });

      it('should switch between views', () => {
        cy.get('[data-testid="button-view-week"]').click();
        cy.get('[data-testid="schedule-week-view"]').should('be.visible');
        
        cy.get('[data-testid="button-view-month"]').click();
        cy.get('[data-testid="schedule-month-view"]').should('be.visible');
      });

      it('should navigate between dates', () => {
        cy.get('[data-testid="button-next-week"]').click();
        cy.get('[data-testid="button-prev-week"]').click();
      });

      it('should filter by consultant', () => {
        cy.selectOption('[data-testid="filter-consultant"]', 'consultant');
      });

      it('should filter by project', () => {
        cy.selectOption('[data-testid="filter-project"]', 'project');
      });
    });

    describe('Create Shift', () => {
      it('should open create shift modal', () => {
        cy.openModal('button-create-shift');
        cy.get('[role="dialog"]').should('contain', 'Shift');
      });

      it('should create a new shift', () => {
        cy.openModal('button-create-shift');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-shift-date"]').type('2024-01-20');
        cy.get('[data-testid="input-start-time"]').type('08:00');
        cy.get('[data-testid="input-end-time"]').type('16:00');
        cy.selectOption('[data-testid="select-shift-type"]', 'Day');
        
        cy.get('[data-testid="button-submit-shift"]').click();
        
        cy.get('[role="dialog"]').should('not.exist');
      });

      it('should create recurring shift', () => {
        cy.openModal('button-create-shift');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-shift-date"]').type('2024-01-20');
        cy.get('[data-testid="input-start-time"]').type('08:00');
        cy.get('[data-testid="input-end-time"]').type('16:00');
        
        cy.get('[data-testid="checkbox-recurring"]').click();
        cy.selectOption('[data-testid="select-recurrence"]', 'Weekly');
        cy.get('[data-testid="input-recurrence-end"]').type('2024-03-20');
        
        cy.get('[data-testid="button-submit-shift"]').click();
      });
    });

    describe('Edit & Delete Shift', () => {
      it('should edit shift', () => {
        cy.get('[data-testid="shift-item"]').first().click();
        cy.get('[data-testid="input-end-time"]').clear().type('17:00');
        cy.get('[data-testid="button-submit-shift"]').click();
      });

      it('should delete shift', () => {
        cy.get('[data-testid="shift-item"]').first().click();
        cy.get('[data-testid="button-delete-shift"]').click();
        cy.get('[data-testid="button-confirm-delete"]').click();
      });
    });

    describe('Consultant Availability', () => {
      it('should view consultant availability', () => {
        cy.get('[data-testid="tab-availability"]').click();
        cy.get('[data-testid="availability-grid"]').should('be.visible');
      });

      it('should set availability', () => {
        cy.get('[data-testid="tab-availability"]').click();
        cy.get('[data-testid="availability-slot"]').first().click();
        cy.selectOption('[data-testid="select-availability-status"]', 'Available');
        cy.get('[data-testid="button-save-availability"]').click();
      });

      it('should set time-off request', () => {
        cy.get('[data-testid="tab-availability"]').click();
        cy.openModal('button-request-time-off');
        cy.get('[data-testid="input-start-date"]').type('2024-02-01');
        cy.get('[data-testid="input-end-date"]').type('2024-02-05');
        cy.get('[data-testid="input-reason"]').type('Vacation');
        cy.get('[data-testid="button-submit-request"]').click();
      });
    });
  });

  describe('Digital Sign-In/Out', () => {
    beforeEach(() => {
      cy.navigateTo('schedules');
      cy.waitForPageLoad();
    });

    it('should sign in for shift', () => {
      cy.get('[data-testid="button-sign-in"]').click();
      cy.get('[data-testid="sign-in-time"]').should('be.visible');
    });

    it('should sign out from shift', () => {
      cy.get('[data-testid="button-sign-out"]').click();
      cy.get('[data-testid="sign-out-time"]').should('be.visible');
    });

    it('should show sign-in history', () => {
      cy.get('[data-testid="tab-sign-in-history"]').click();
      cy.get('[data-testid="sign-in-records"]').should('be.visible');
    });
  });

  describe('EOD Reports', () => {
    beforeEach(() => {
      cy.navigateTo('schedules');
      cy.get('[data-testid="tab-eod-reports"]').click();
      cy.waitForPageLoad();
    });

    it('should display EOD reports list', () => {
      cy.get('[data-testid="eod-reports-list"]').should('be.visible');
    });

    it('should create EOD report', () => {
      cy.openModal('button-create-eod-report');
      cy.get('[data-testid="input-accomplishments"]').type('Completed training session');
      cy.get('[data-testid="input-challenges"]').type('Network connectivity issues');
      cy.get('[data-testid="input-tomorrow-plan"]').type('Continue user training');
      cy.get('[data-testid="button-submit-eod"]').click();
    });

    it('should view EOD report details', () => {
      cy.get('[data-testid="eod-report-item"]').first().click();
      cy.get('[data-testid="eod-report-details"]').should('be.visible');
    });
  });

  describe('Shift Handoff Notes', () => {
    beforeEach(() => {
      cy.navigateTo('schedules');
      cy.get('[data-testid="tab-handoff-notes"]').click();
      cy.waitForPageLoad();
    });

    it('should display handoff notes', () => {
      cy.get('[data-testid="handoff-notes-list"]').should('be.visible');
    });

    it('should create handoff note', () => {
      cy.openModal('button-create-handoff');
      cy.get('[data-testid="input-handoff-summary"]').type('Patient X needs follow-up');
      cy.get('[data-testid="input-outstanding-items"]').type('Complete documentation');
      cy.selectOption('[data-testid="select-priority"]', 'High');
      cy.get('[data-testid="button-submit-handoff"]').click();
    });

    it('should acknowledge handoff note', () => {
      cy.get('[data-testid="handoff-note-item"]').first()
        .find('[data-testid="button-acknowledge"]').click();
    });
  });
});
