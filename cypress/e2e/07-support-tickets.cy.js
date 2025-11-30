// ***********************************************
// NICEHR Platform - Support Ticket System Tests
// ***********************************************

describe('Support Ticket System', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.navigateTo('tickets');
    cy.waitForPageLoad();
  });

  describe('Ticket List View', () => {
    it('should display tickets list', () => {
      cy.get('[data-testid="tickets-table"], [data-testid="tickets-list"]').should('be.visible');
    });

    it('should show ticket details in table', () => {
      cy.get('table thead').should('contain', 'Subject');
      cy.get('table thead').should('contain', 'Status');
      cy.get('table thead').should('contain', 'Priority');
    });

    it('should filter by status', () => {
      cy.selectOption('[data-testid="filter-status"]', 'Open');
      cy.get('[data-testid="ticket-status"]').each(($el) => {
        cy.wrap($el).should('contain', 'Open');
      });
    });

    it('should filter by priority', () => {
      cy.selectOption('[data-testid="filter-priority"]', 'High');
    });

    it('should filter by category', () => {
      cy.selectOption('[data-testid="filter-category"]', 'Technical');
    });

    it('should filter by assigned to', () => {
      cy.get('[data-testid="filter-assignee"]').should('be.visible');
    });

    it('should search tickets', () => {
      cy.get('[data-testid="input-search"]').type('login issue');
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('should sort tickets', () => {
      cy.get('[data-testid="sort-created"]').click();
      cy.get('[data-testid="sort-priority"]').click();
    });
  });

  describe('Create Ticket', () => {
    it('should open create ticket modal', () => {
      cy.openModal('button-create-ticket');
      cy.get('[role="dialog"]').should('contain', 'Ticket');
    });

    it('should create a new ticket', () => {
      const ticketSubject = `Test Ticket ${Date.now()}`;
      
      cy.openModal('button-create-ticket');
      cy.get('[data-testid="input-subject"]').type(ticketSubject);
      cy.get('[data-testid="input-description"]').type('Detailed description of the issue');
      cy.selectOption('[data-testid="select-category"]', 'Technical');
      cy.selectOption('[data-testid="select-priority"]', 'Medium');
      cy.selectOption('[data-testid="select-project"]', 'project');
      
      cy.get('[data-testid="button-submit-ticket"]').click();
      
      cy.get('[role="dialog"]').should('not.exist');
      cy.tableRowExists(ticketSubject);
    });

    it('should validate required fields', () => {
      cy.openModal('button-create-ticket');
      cy.get('[data-testid="button-submit-ticket"]').click();
      
      cy.get('.text-red-500, .text-destructive').should('be.visible');
    });

    it('should attach file to ticket', () => {
      cy.openModal('button-create-ticket');
      cy.get('[data-testid="input-subject"]').type('Ticket with attachment');
      cy.get('[data-testid="input-description"]').type('Issue description');
      cy.selectOption('[data-testid="select-category"]', 'Technical');
      cy.selectOption('[data-testid="select-priority"]', 'Low');
      
      // File attachment would go here
      cy.get('[data-testid="file-upload-area"]').should('be.visible');
    });

    it('should set ticket urgency', () => {
      cy.openModal('button-create-ticket');
      cy.get('[data-testid="input-subject"]').type('Urgent ticket');
      cy.selectOption('[data-testid="select-priority"]', 'Critical');
      cy.get('[data-testid="checkbox-urgent"]').click();
    });
  });

  describe('Ticket Details', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should display ticket details', () => {
      cy.get('[data-testid="ticket-details"]').should('be.visible');
      cy.get('[data-testid="ticket-subject"]').should('be.visible');
      cy.get('[data-testid="ticket-description"]').should('be.visible');
    });

    it('should show ticket metadata', () => {
      cy.get('[data-testid="ticket-status"]').should('be.visible');
      cy.get('[data-testid="ticket-priority"]').should('be.visible');
      cy.get('[data-testid="ticket-created-by"]').should('be.visible');
      cy.get('[data-testid="ticket-created-at"]').should('be.visible');
    });

    it('should show ticket activity timeline', () => {
      cy.get('[data-testid="ticket-activity"]').should('be.visible');
    });

    it('should show attachments', () => {
      cy.get('[data-testid="ticket-attachments"]').should('be.visible');
    });
  });

  describe('Ticket Comments', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should add comment to ticket', () => {
      const comment = `Test comment ${Date.now()}`;
      
      cy.get('[data-testid="input-comment"]').type(comment);
      cy.get('[data-testid="button-add-comment"]').click();
      
      cy.get('[data-testid="comments-list"]').should('contain', comment);
    });

    it('should add internal note (staff only)', () => {
      const note = `Internal note ${Date.now()}`;
      
      cy.get('[data-testid="checkbox-internal-note"]').click();
      cy.get('[data-testid="input-comment"]').type(note);
      cy.get('[data-testid="button-add-comment"]').click();
      
      cy.get('[data-testid="internal-note"]').should('contain', note);
    });

    it('should edit comment', () => {
      cy.get('[data-testid="comment-item"]').first()
        .find('[data-testid="button-edit-comment"]').click();
      cy.get('[data-testid="input-edit-comment"]').clear().type('Updated comment');
      cy.get('[data-testid="button-save-comment"]').click();
    });

    it('should delete comment', () => {
      cy.get('[data-testid="comment-item"]').first()
        .find('[data-testid="button-delete-comment"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
    });

    it('should mention user in comment', () => {
      cy.get('[data-testid="input-comment"]').type('@');
      cy.get('[data-testid="mention-suggestions"]').should('be.visible');
      cy.get('[data-testid="mention-option"]').first().click();
    });
  });

  describe('Ticket Status Management', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should change ticket status', () => {
      cy.selectOption('[data-testid="select-status"]', 'In Progress');
      cy.get('[data-testid="ticket-status"]').should('contain', 'In Progress');
    });

    it('should assign ticket to user', () => {
      cy.selectOption('[data-testid="select-assignee"]', 'user');
    });

    it('should change priority', () => {
      cy.selectOption('[data-testid="select-priority"]', 'High');
      cy.get('[data-testid="ticket-priority"]').should('contain', 'High');
    });

    it('should close ticket', () => {
      cy.get('[data-testid="button-close-ticket"]').click();
      cy.get('[data-testid="input-resolution"]').type('Issue resolved');
      cy.get('[data-testid="button-confirm-close"]').click();
      
      cy.get('[data-testid="ticket-status"]').should('contain', 'Closed');
    });

    it('should reopen closed ticket', () => {
      cy.selectOption('[data-testid="filter-status"]', 'Closed');
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="button-reopen-ticket"]').click();
      cy.get('[data-testid="ticket-status"]').should('contain', 'Open');
    });
  });

  describe('Ticket Assignment', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should assign ticket to self', () => {
      cy.get('[data-testid="button-assign-to-me"]').click();
    });

    it('should assign ticket to team member', () => {
      cy.selectOption('[data-testid="select-assignee"]', 'team member');
    });

    it('should unassign ticket', () => {
      cy.get('[data-testid="button-unassign"]').click();
    });

    it('should escalate ticket', () => {
      cy.get('[data-testid="button-escalate"]').click();
      cy.get('[data-testid="input-escalation-reason"]').type('Needs manager attention');
      cy.get('[data-testid="button-confirm-escalate"]').click();
    });
  });

  describe('Ticket Tags & Categories', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should add tag to ticket', () => {
      cy.get('[data-testid="button-add-tag"]').click();
      cy.get('[data-testid="input-tag"]').type('urgent');
      cy.get('[data-testid="button-save-tag"]').click();
      
      cy.get('[data-testid="ticket-tags"]').should('contain', 'urgent');
    });

    it('should remove tag from ticket', () => {
      cy.get('[data-testid="ticket-tag"]').first()
        .find('[data-testid="button-remove-tag"]').click();
    });

    it('should change category', () => {
      cy.selectOption('[data-testid="select-category"]', 'Training');
    });
  });

  describe('Bulk Operations', () => {
    it('should select multiple tickets', () => {
      cy.get('[data-testid="checkbox-ticket"]').first().click();
      cy.get('[data-testid="checkbox-ticket"]').eq(1).click();
      cy.get('[data-testid="selected-count"]').should('contain', '2');
    });

    it('should bulk assign tickets', () => {
      cy.get('[data-testid="checkbox-select-all"]').click();
      cy.get('[data-testid="button-bulk-assign"]').click();
      cy.selectOption('[data-testid="select-bulk-assignee"]', 'user');
      cy.get('[data-testid="button-confirm-bulk"]').click();
    });

    it('should bulk change status', () => {
      cy.get('[data-testid="checkbox-select-all"]').click();
      cy.get('[data-testid="button-bulk-status"]').click();
      cy.selectOption('[data-testid="select-bulk-status"]', 'In Progress');
      cy.get('[data-testid="button-confirm-bulk"]').click();
    });

    it('should bulk close tickets', () => {
      cy.get('[data-testid="checkbox-select-all"]').click();
      cy.get('[data-testid="button-bulk-close"]').click();
      cy.get('[data-testid="button-confirm-bulk"]').click();
    });
  });

  describe('Ticket SLA', () => {
    it('should show SLA status', () => {
      cy.get('[data-testid="ticket-sla"]').should('exist');
    });

    it('should highlight overdue tickets', () => {
      cy.get('[data-testid="sla-breached"]').should('exist');
    });

    it('should show time to resolution', () => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="time-to-resolution"]').should('be.visible');
    });
  });

  describe('Ticket Export', () => {
    it('should export tickets to CSV', () => {
      cy.get('[data-testid="button-export"]').click();
      cy.selectOption('[data-testid="select-export-format"]', 'CSV');
      cy.get('[data-testid="button-download"]').click();
    });

    it('should export filtered tickets', () => {
      cy.selectOption('[data-testid="filter-status"]', 'Open');
      cy.get('[data-testid="button-export"]').click();
      cy.get('[data-testid="button-download"]').click();
    });
  });

  describe('Ticket Reports', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-reports"]').click();
    });

    it('should show ticket volume report', () => {
      cy.get('[data-testid="ticket-volume-chart"]').should('be.visible');
    });

    it('should show resolution time report', () => {
      cy.get('[data-testid="resolution-time-chart"]').should('be.visible');
    });

    it('should show tickets by category', () => {
      cy.get('[data-testid="category-breakdown"]').should('be.visible');
    });

    it('should filter report by date range', () => {
      cy.get('[data-testid="input-report-start"]').type('2024-01-01');
      cy.get('[data-testid="input-report-end"]').type('2024-01-31');
      cy.get('[data-testid="button-apply-filter"]').click();
    });
  });
});
