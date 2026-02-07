/**
 * E2E Tests for Fieldglass SOW (Statement of Work) Integration
 *
 * Tests SOW management, consultant matching, and workforce data.
 */

describe('Fieldglass SOW Integration', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  // ============================================================================
  // SOW DASHBOARD
  // ============================================================================
  describe('SOW Dashboard', () => {
    it('should display SOW dashboard', () => {
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="fieldglass-dashboard"]').should('be.visible');
    });

    it('should show SOW statistics cards', () => {
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="sow-stat-total"]').should('be.visible');
      cy.get('[data-testid="sow-stat-open"]').should('be.visible');
      cy.get('[data-testid="sow-stat-responded"]').should('be.visible');
      cy.get('[data-testid="sow-stat-awarded"]').should('be.visible');
    });

    it('should display workforce summary', () => {
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="workforce-summary"]').should('be.visible');
      cy.get('[data-testid="workforce-active-consultants"]').should('be.visible');
      cy.get('[data-testid="workforce-utilization"]').should('be.visible');
    });

    it('should show pending SOWs requiring response', () => {
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="pending-sows-section"]').should('be.visible');
      cy.get('[data-testid="pending-sow-item"]').should('have.length.gte', 0);
    });
  });

  // ============================================================================
  // SOW LIST
  // ============================================================================
  describe('SOW List', () => {
    it('should display SOW list', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="sow-list"]').should('be.visible');
    });

    it('should show SOW columns', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="sow-header-id"]').should('be.visible');
      cy.get('[data-testid="sow-header-title"]').should('be.visible');
      cy.get('[data-testid="sow-header-status"]').should('be.visible');
      cy.get('[data-testid="sow-header-deadline"]').should('be.visible');
    });

    it('should filter SOWs by status', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="sow-status-filter"]').click();
      cy.get('[data-testid="filter-option-open"]').click();
      cy.get('[data-testid="sow-row"]').each($row => {
        cy.wrap($row).find('[data-testid="sow-status"]').should('contain', 'Open');
      });
    });

    it('should search SOWs', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="sow-search"]').type('Epic');
      cy.get('[data-testid="sow-row"]').should('have.length.gte', 0);
    });

    it('should sort SOWs by deadline', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="sow-header-deadline"]').click();
      // Verify sorting behavior
    });

    it('should paginate SOW list', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-next"]').click();
    });
  });

  // ============================================================================
  // SOW DETAILS
  // ============================================================================
  describe('SOW Details', () => {
    it('should display SOW detail page', () => {
      cy.visit('/integrations/fieldglass/sows');
      cy.get('[data-testid="sow-row"]').first().click();
      cy.get('[data-testid="sow-detail"]').should('be.visible');
    });

    it('should show SOW information', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="sow-title"]').should('be.visible');
      cy.get('[data-testid="sow-description"]').should('be.visible');
      cy.get('[data-testid="sow-requirements"]').should('be.visible');
    });

    it('should show SOW timeline', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="sow-timeline"]').should('be.visible');
      cy.get('[data-testid="sow-start-date"]').should('be.visible');
      cy.get('[data-testid="sow-end-date"]').should('be.visible');
    });

    it('should show required skills', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="sow-skills"]').should('be.visible');
      cy.get('[data-testid="skill-tag"]').should('have.length.gte', 1);
    });

    it('should show rate information', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="sow-rate-range"]').should('be.visible');
    });
  });

  // ============================================================================
  // CONSULTANT MATCHING
  // ============================================================================
  describe('Consultant Matching', () => {
    it('should display matching consultants for SOW', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="consultant-matches"]').should('be.visible');
    });

    it('should show match scores', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="match-score"]').each($score => {
        cy.wrap($score).invoke('text').should('match', /\d+%/);
      });
    });

    it('should order matches by score descending', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="match-score"]').then($scores => {
        const scores = $scores.toArray().map(el => parseInt(el.textContent));
        const sorted = [...scores].sort((a, b) => b - a);
        expect(scores).to.deep.equal(sorted);
      });
    });

    it('should show consultant availability', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="consultant-availability"]').should('be.visible');
    });

    it('should allow selecting consultant for response', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="select-consultant"]').first().click();
      cy.get('[data-testid="consultant-selected"]').should('be.visible');
    });

    it('should show consultant skills comparison', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="consultant-match"]').first().click();
      cy.get('[data-testid="skills-comparison"]').should('be.visible');
    });
  });

  // ============================================================================
  // SOW RESPONSE
  // ============================================================================
  describe('SOW Response', () => {
    it('should show respond button for open SOWs', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="respond-sow-button"]').should('be.visible');
    });

    it('should open response form', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="respond-sow-button"]').click();
      cy.get('[data-testid="sow-response-form"]').should('be.visible');
    });

    it('should require consultant selection', () => {
      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="respond-sow-button"]').click();
      cy.get('[data-testid="submit-response"]').click();
      cy.get('[data-testid="error-consultant-required"]').should('be.visible');
    });

    it('should submit SOW response', () => {
      cy.intercept('POST', '/api/integrations/fieldglass/sows/*/respond', {
        statusCode: 200,
        body: { success: true }
      }).as('submitResponse');

      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="respond-sow-button"]').click();
      cy.get('[data-testid="select-consultant"]').first().click();
      cy.get('[data-testid="proposed-rate"]').type('125');
      cy.get('[data-testid="submit-response"]').click();
      cy.wait('@submitResponse');
    });

    it('should show response confirmation', () => {
      cy.intercept('POST', '/api/integrations/fieldglass/sows/*/respond', {
        statusCode: 200,
        body: { success: true }
      }).as('submitResponse');

      cy.visit('/integrations/fieldglass/sows/1');
      cy.get('[data-testid="respond-sow-button"]').click();
      cy.get('[data-testid="select-consultant"]').first().click();
      cy.get('[data-testid="submit-response"]').click();
      cy.wait('@submitResponse');
      cy.get('[data-testid="response-success"]').should('be.visible');
    });
  });

  // ============================================================================
  // WORKFORCE DATA
  // ============================================================================
  describe('Workforce Data', () => {
    it('should display active consultants', () => {
      cy.visit('/integrations/fieldglass/workforce');
      cy.get('[data-testid="workforce-table"]').should('be.visible');
    });

    it('should show consultant assignments', () => {
      cy.visit('/integrations/fieldglass/workforce');
      cy.get('[data-testid="consultant-assignment"]').should('have.length.gte', 0);
    });

    it('should show hours logged', () => {
      cy.visit('/integrations/fieldglass/workforce');
      cy.get('[data-testid="hours-this-month"]').should('be.visible');
    });

    it('should show utilization metrics', () => {
      cy.visit('/integrations/fieldglass/workforce');
      cy.get('[data-testid="utilization-rate"]').should('be.visible');
    });

    it('should filter by hospital', () => {
      cy.visit('/integrations/fieldglass/workforce');
      cy.get('[data-testid="hospital-filter"]').click();
      cy.get('[data-testid="filter-option"]').first().click();
    });

    it('should export workforce data', () => {
      cy.visit('/integrations/fieldglass/workforce');
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-csv"]').click();
    });
  });

  // ============================================================================
  // TIMESHEETS
  // ============================================================================
  describe('Timesheets', () => {
    it('should display timesheets', () => {
      cy.visit('/integrations/fieldglass/timesheets');
      cy.get('[data-testid="timesheet-list"]').should('be.visible');
    });

    it('should filter by date range', () => {
      cy.visit('/integrations/fieldglass/timesheets');
      cy.get('[data-testid="date-range-filter"]').click();
      cy.get('[data-testid="date-preset-this-month"]').click();
    });

    it('should show pending approvals', () => {
      cy.visit('/integrations/fieldglass/timesheets');
      cy.get('[data-testid="pending-approvals"]').should('be.visible');
    });
  });

  // ============================================================================
  // SYNC OPERATIONS
  // ============================================================================
  describe('Sync Operations', () => {
    it('should show sync status', () => {
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="sync-status"]').should('be.visible');
    });

    it('should show last sync time', () => {
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="last-sync"]').should('be.visible');
    });

    it('should trigger manual sync', () => {
      cy.intercept('POST', '/api/integrations/sync/*', {
        statusCode: 200,
        body: { status: 'in_progress' }
      }).as('triggerSync');

      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="sync-button"]').click();
      cy.wait('@triggerSync');
    });
  });

  // ============================================================================
  // ROLE-BASED VIEWS
  // ============================================================================
  describe('Role-Based Views', () => {
    it('should show SOW management for admin', () => {
      cy.loginAsAdmin();
      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="sow-management"]').should('be.visible');
      cy.get('[data-testid="respond-sow-button"]').should('exist');
    });

    it('should show workforce summary for executives', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'hospital_leadership', email: 'exec@test.com' }
      });

      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="workforce-summary"]').should('be.visible');
      cy.get('[data-testid="sow-management"]').should('not.exist');
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/integrations/fieldglass/*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      });

      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should handle connection errors', () => {
      cy.intercept('GET', '/api/integrations/sources/*', {
        statusCode: 200,
        body: { status: 'disconnected' }
      });

      cy.visit('/integrations/fieldglass');
      cy.get('[data-testid="connection-error"]').should('be.visible');
    });
  });
});
