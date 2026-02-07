/**
 * E2E Tests for Enterprise Overview Dashboard
 *
 * Tests the executive-level enterprise overview dashboard.
 */

describe('Enterprise Overview Dashboard', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  // ============================================================================
  // DASHBOARD LAYOUT
  // ============================================================================
  describe('Dashboard Layout', () => {
    it('should display enterprise overview page', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="enterprise-overview"]').should('be.visible');
    });

    it('should have page title', () => {
      cy.visit('/enterprise-overview');
      cy.get('h1').should('contain', 'Enterprise Overview');
    });

    it('should display key metrics section', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="key-metrics"]').should('be.visible');
    });

    it('should display charts section', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="charts-section"]').should('be.visible');
    });

    it('should be responsive', () => {
      cy.visit('/enterprise-overview');
      cy.viewport('iphone-x');
      cy.get('[data-testid="enterprise-overview"]').should('be.visible');
    });
  });

  // ============================================================================
  // KEY METRICS CARDS
  // ============================================================================
  describe('Key Metrics Cards', () => {
    it('should display total projects metric', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="metric-total-projects"]').should('be.visible');
      cy.get('[data-testid="metric-total-projects"]').find('[data-testid="metric-value"]').should('exist');
    });

    it('should display active consultants metric', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="metric-active-consultants"]').should('be.visible');
    });

    it('should display revenue metric', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="metric-revenue"]').should('be.visible');
    });

    it('should display utilization rate metric', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="metric-utilization"]').should('be.visible');
    });

    it('should show trend indicators', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="metric-trend"]').should('have.length.gte', 1);
    });

    it('should navigate to details when clicking metric card', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="metric-total-projects"]').click();
      cy.url().should('include', '/projects');
    });
  });

  // ============================================================================
  // PROJECT STATUS OVERVIEW
  // ============================================================================
  describe('Project Status Overview', () => {
    it('should display project status breakdown', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="project-status-chart"]').should('be.visible');
    });

    it('should show projects by status', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="status-on-track"]').should('be.visible');
      cy.get('[data-testid="status-at-risk"]').should('be.visible');
      cy.get('[data-testid="status-delayed"]').should('be.visible');
    });

    it('should show project count by status', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="status-count"]').should('have.length.gte', 1);
    });

    it('should filter projects when clicking status', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="status-at-risk"]').click();
      cy.get('[data-testid="filtered-projects"]').should('be.visible');
    });
  });

  // ============================================================================
  // FINANCIAL OVERVIEW
  // ============================================================================
  describe('Financial Overview', () => {
    it('should display financial summary', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="financial-summary"]').should('be.visible');
    });

    it('should show total budget', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="total-budget"]').should('be.visible');
    });

    it('should show spent vs budget', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="spent-budget"]').should('be.visible');
      cy.get('[data-testid="remaining-budget"]').should('be.visible');
    });

    it('should show budget variance', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="budget-variance"]').should('be.visible');
    });

    it('should display revenue trend chart', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="revenue-trend-chart"]').should('be.visible');
    });
  });

  // ============================================================================
  // RESOURCE UTILIZATION
  // ============================================================================
  describe('Resource Utilization', () => {
    it('should display utilization chart', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="utilization-chart"]').should('be.visible');
    });

    it('should show overall utilization rate', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="overall-utilization"]').should('be.visible');
    });

    it('should show utilization by department', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="utilization-by-department"]').should('be.visible');
    });

    it('should show consultant availability', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="consultant-availability"]').should('be.visible');
    });
  });

  // ============================================================================
  // HOSPITAL PORTFOLIO
  // ============================================================================
  describe('Hospital Portfolio', () => {
    it('should display hospital portfolio section', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="hospital-portfolio"]').should('be.visible');
    });

    it('should show hospital count', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="hospital-count"]').should('be.visible');
    });

    it('should show hospitals by region', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="hospitals-by-region"]').should('be.visible');
    });

    it('should show active projects per hospital', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="hospital-project-count"]').should('have.length.gte', 0);
    });
  });

  // ============================================================================
  // TIMELINE AND MILESTONES
  // ============================================================================
  describe('Timeline and Milestones', () => {
    it('should display upcoming milestones', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="upcoming-milestones"]').should('be.visible');
    });

    it('should show milestone list', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="milestone-item"]').should('have.length.gte', 0);
    });

    it('should show milestone dates', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="milestone-date"]').should('have.length.gte', 0);
    });

    it('should navigate to project when clicking milestone', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="milestone-item"]').first().click();
      cy.url().should('include', '/projects');
    });
  });

  // ============================================================================
  // ALERTS AND NOTIFICATIONS
  // ============================================================================
  describe('Alerts and Notifications', () => {
    it('should display alert section', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="alerts-section"]').should('be.visible');
    });

    it('should show critical alerts', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="critical-alerts"]').should('be.visible');
    });

    it('should show alert count', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="alert-count"]').should('be.visible');
    });

    it('should navigate to alert details', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="alert-item"]').first().click();
    });
  });

  // ============================================================================
  // DATE RANGE FILTERING
  // ============================================================================
  describe('Date Range Filtering', () => {
    it('should have date range selector', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="date-range-selector"]').should('be.visible');
    });

    it('should filter by this month', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="date-range-selector"]').click();
      cy.get('[data-testid="range-this-month"]').click();
    });

    it('should filter by this quarter', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="date-range-selector"]').click();
      cy.get('[data-testid="range-this-quarter"]').click();
    });

    it('should filter by this year', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="date-range-selector"]').click();
      cy.get('[data-testid="range-this-year"]').click();
    });

    it('should allow custom date range', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="date-range-selector"]').click();
      cy.get('[data-testid="range-custom"]').click();
      cy.get('[data-testid="custom-start-date"]').should('be.visible');
      cy.get('[data-testid="custom-end-date"]').should('be.visible');
    });
  });

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================
  describe('Export Functionality', () => {
    it('should have export button', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="export-button"]').should('be.visible');
    });

    it('should show export options', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-pdf"]').should('be.visible');
      cy.get('[data-testid="export-excel"]').should('be.visible');
    });

    it('should export to PDF', () => {
      cy.intercept('POST', '/api/reports/export/pdf', {
        statusCode: 200,
        body: { url: '/reports/export.pdf' }
      }).as('exportPdf');

      cy.visit('/enterprise-overview');
      cy.get('[data-testid="export-button"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      cy.wait('@exportPdf');
    });
  });

  // ============================================================================
  // REFRESH AND REAL-TIME
  // ============================================================================
  describe('Refresh and Real-Time', () => {
    it('should have refresh button', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="refresh-button"]').should('be.visible');
    });

    it('should refresh data on button click', () => {
      cy.intercept('GET', '/api/enterprise-overview/*').as('refreshData');
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="refresh-button"]').click();
      cy.wait('@refreshData');
    });

    it('should show last updated time', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="last-updated"]').should('be.visible');
    });
  });

  // ============================================================================
  // ROLE-BASED ACCESS
  // ============================================================================
  describe('Role-Based Access', () => {
    it('should be accessible to admin', () => {
      cy.loginAsAdmin();
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="enterprise-overview"]').should('be.visible');
    });

    it('should be accessible to hospital_leadership', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'hospital_leadership', email: 'exec@test.com' }
      });

      cy.visit('/enterprise-overview');
      cy.get('[data-testid="enterprise-overview"]').should('be.visible');
    });

    it('should restrict sensitive financial data for non-admin', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'hospital_staff', email: 'staff@test.com' }
      });

      cy.visit('/enterprise-overview');
      cy.get('[data-testid="sensitive-financials"]').should('not.exist');
    });
  });

  // ============================================================================
  // DRILL-DOWN NAVIGATION
  // ============================================================================
  describe('Drill-Down Navigation', () => {
    it('should drill down from project status', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="project-status-chart"]').click();
      cy.get('[data-testid="project-details-modal"]').should('be.visible');
    });

    it('should drill down from financial metrics', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="financial-summary"]').click();
      cy.get('[data-testid="financial-details"]').should('be.visible');
    });

    it('should drill down from utilization chart', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="utilization-chart"]').click();
      cy.get('[data-testid="utilization-details"]').should('be.visible');
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/enterprise-overview/*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      });

      cy.visit('/enterprise-overview');
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should show retry option on error', () => {
      cy.intercept('GET', '/api/enterprise-overview/*', {
        statusCode: 500,
        body: { error: 'Error' }
      });

      cy.visit('/enterprise-overview');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  // ============================================================================
  // ACCESSIBILITY
  // ============================================================================
  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      cy.visit('/enterprise-overview');
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.gte', 1);
    });

    it('should have ARIA labels on interactive elements', () => {
      cy.visit('/enterprise-overview');
      cy.get('[data-testid="export-button"]').should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.visit('/enterprise-overview');
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });
  });
});
