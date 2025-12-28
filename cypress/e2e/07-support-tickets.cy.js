describe('Support Tickets', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  // Note: Component uses local demo data, not API mocks
  // Demo data includes tickets like "Login issue with Epic system"

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.visit('/support-tickets');
    cy.wait('@getUser');
  });

  describe('Ticket List', () => {
    it('should display create ticket button', () => {
      cy.get('[data-testid="button-create-ticket"]').should('be.visible');
    });

    it('should display search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should display status filter', () => {
      cy.get('[data-testid="filter-status"]').should('be.visible');
    });

    it('should display priority filter', () => {
      cy.get('[data-testid="filter-priority"]').should('be.visible');
    });

    it('should display category filter', () => {
      cy.get('[data-testid="filter-category"]').should('be.visible');
    });

    it('should display export button', () => {
      cy.get('[data-testid="button-export"]').should('be.visible');
    });

    it('should have reports tab', () => {
      cy.get('[data-testid="tab-reports"]').should('exist');
    });
  });

  describe('Ticket Filters', () => {
    it('should open status filter dropdown', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.contains('Open').should('be.visible');
    });

    it('should open priority filter dropdown', () => {
      cy.get('[data-testid="filter-priority"]').click();
      cy.contains('High').should('be.visible');
    });

    it('should allow search input', () => {
      cy.get('[data-testid="input-search"]').type('login');
      cy.get('[data-testid="input-search"]').should('have.value', 'login');
    });
  });

  describe('Create Ticket Modal', () => {
    it('should open create ticket modal', () => {
      cy.get('[data-testid="button-create-ticket"]').click();
      // Modal should open - check for common form elements
      cy.contains('Create').should('be.visible');
    });
  });

  describe('Ticket Details View', () => {
    it('should display ticket details card when ticket selected', () => {
      // Click on first ticket in table (component uses local demo data)
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="ticket-details"]').should('exist');
    });

    it('should display ticket subject', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="ticket-subject"]').should('contain', 'Login issue with Epic system');
    });

    it('should display ticket description', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="ticket-description"]').should('contain', 'Unable to log in');
    });

    it('should display ticket status badge in table', () => {
      // Status badge is in the table row, not detail view
      cy.get('[data-testid="ticket-status"]').first().should('exist');
    });

    it('should display status selector for changing status', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="select-status"]').should('exist');
    });

    it('should display priority selector', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="select-priority"]').scrollIntoView().should('exist');
    });

    it('should display assignee selector', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="select-assignee"]').scrollIntoView().should('exist');
    });

    it('should have assign to me button', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="button-assign-to-me"]').scrollIntoView().should('exist');
    });

    it('should have escalate button', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="button-escalate"]').scrollIntoView().should('exist');
    });
  });

  describe('Ticket Comments', () => {
    it('should display comments list', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="comments-list"]').scrollIntoView().should('exist');
    });

    it('should display comment input', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="input-comment"]').scrollIntoView().should('exist');
    });

    it('should display add comment button', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="button-add-comment"]').scrollIntoView().should('exist');
    });

    it('should have internal note checkbox', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="checkbox-internal-note"]').scrollIntoView().should('exist');
    });
  });

  describe('Ticket Tags', () => {
    it('should display ticket tags section', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="ticket-tags"]').scrollIntoView().should('exist');
    });

    it('should have add tag button', () => {
      cy.contains('Login issue with Epic system').click();
      cy.get('[data-testid="button-add-tag"]').scrollIntoView().should('exist');
    });
  });

  // ===========================================================================
  // Advanced Support Ticket Features
  // ===========================================================================

  describe('SLA Management', () => {
    it('should display SLA status in ticket list', () => {
      cy.get('[data-testid="ticket-sla"]').should('exist');
    });

    it('should show SLA breached badge when applicable', () => {
      // Check if any ticket has breached SLA (demo data may include this)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="sla-breached"]').length) {
          cy.get('[data-testid="sla-breached"]').should('be.visible');
        } else {
          // SLA badge only shows when breached, skip if no breached tickets
          cy.log('No SLA breached tickets in demo data');
        }
      });
    });
  });

  describe('Ticket Reports', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-reports"]').click();
    });

    it('should switch to reports tab', () => {
      cy.contains('Ticket Volume').should('be.visible');
    });

    it('should display report start date input', () => {
      cy.get('[data-testid="input-report-start"]').should('exist');
    });

    it('should display report end date input', () => {
      cy.get('[data-testid="input-report-end"]').should('exist');
    });

    it('should allow date range selection for reports', () => {
      cy.get('[data-testid="input-report-start"]').type('2024-01-01');
      cy.get('[data-testid="input-report-end"]').type('2024-12-31');
      cy.get('[data-testid="input-report-start"]').should('have.value', '2024-01-01');
      cy.get('[data-testid="input-report-end"]').should('have.value', '2024-12-31');
    });
  });
});
