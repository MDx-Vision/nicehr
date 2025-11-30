// ***********************************************
// NICEHR Platform - Analytics & Reporting Tests
// ***********************************************

describe('Analytics & Reporting', () => {
  beforeEach(() => {
    cy.loginViaApi();
  });

  describe('Executive Dashboard', () => {
    beforeEach(() => {
      cy.navigateTo('analytics');
      cy.waitForPageLoad();
    });

    it('should display executive dashboard', () => {
      cy.get('[data-testid="executive-dashboard"]').should('be.visible');
    });

    it('should show key metrics cards', () => {
      cy.get('[data-testid="metric-active-projects"]').should('be.visible');
      cy.get('[data-testid="metric-total-consultants"]').should('be.visible');
      cy.get('[data-testid="metric-utilization-rate"]').should('be.visible');
      cy.get('[data-testid="metric-revenue"]').should('be.visible');
    });

    it('should filter by date range', () => {
      cy.get('[data-testid="date-range-picker"]').click();
      cy.get('[data-testid="preset-last-30-days"]').click();
    });

    it('should filter by project', () => {
      cy.selectOption('[data-testid="filter-project"]', 'project');
    });

    it('should filter by hospital', () => {
      cy.selectOption('[data-testid="filter-hospital"]', 'hospital');
    });

    it('should refresh dashboard data', () => {
      cy.get('[data-testid="button-refresh"]').click();
      cy.get('[data-testid="loading-indicator"]').should('not.exist');
    });
  });

  describe('Go-Live Readiness Analytics', () => {
    beforeEach(() => {
      cy.visit('/analytics/go-live-readiness');
      cy.waitForPageLoad();
    });

    it('should display go-live readiness dashboard', () => {
      cy.get('[data-testid="go-live-dashboard"]').should('be.visible');
    });

    it('should show readiness score', () => {
      cy.get('[data-testid="readiness-score"]').should('be.visible');
    });

    it('should show readiness by category', () => {
      cy.get('[data-testid="readiness-categories"]').should('be.visible');
    });

    it('should show readiness trend', () => {
      cy.get('[data-testid="readiness-trend-chart"]').should('be.visible');
    });

    it('should show blockers and risks', () => {
      cy.get('[data-testid="blockers-list"]').should('be.visible');
    });

    it('should drill down into category', () => {
      cy.get('[data-testid="category-item"]').first().click();
      cy.get('[data-testid="category-details"]').should('be.visible');
    });

    it('should export readiness report', () => {
      cy.get('[data-testid="button-export-report"]').click();
    });
  });

  describe('Consultant Utilization Analytics', () => {
    beforeEach(() => {
      cy.visit('/analytics/utilization');
      cy.waitForPageLoad();
    });

    it('should display utilization dashboard', () => {
      cy.get('[data-testid="utilization-dashboard"]').should('be.visible');
    });

    it('should show overall utilization rate', () => {
      cy.get('[data-testid="utilization-rate"]').should('be.visible');
    });

    it('should show utilization by consultant', () => {
      cy.get('[data-testid="utilization-by-consultant"]').should('be.visible');
    });

    it('should show utilization trend', () => {
      cy.get('[data-testid="utilization-trend-chart"]').should('be.visible');
    });

    it('should show billable vs non-billable hours', () => {
      cy.get('[data-testid="billable-breakdown"]').should('be.visible');
    });

    it('should filter by consultant', () => {
      cy.selectOption('[data-testid="filter-consultant"]', 'consultant');
    });

    it('should filter by project', () => {
      cy.selectOption('[data-testid="filter-project"]', 'project');
    });

    it('should show underutilized consultants', () => {
      cy.get('[data-testid="underutilized-list"]').should('be.visible');
    });

    it('should export utilization report', () => {
      cy.get('[data-testid="button-export-utilization"]').click();
    });
  });

  describe('Timeline Forecast Analytics', () => {
    beforeEach(() => {
      cy.visit('/analytics/timeline-forecast');
      cy.waitForPageLoad();
    });

    it('should display timeline forecast dashboard', () => {
      cy.get('[data-testid="timeline-forecast-dashboard"]').should('be.visible');
    });

    it('should show projected completion dates', () => {
      cy.get('[data-testid="projected-completion"]').should('be.visible');
    });

    it('should show schedule variance', () => {
      cy.get('[data-testid="schedule-variance"]').should('be.visible');
    });

    it('should show critical path', () => {
      cy.get('[data-testid="critical-path"]').should('be.visible');
    });

    it('should show milestone timeline', () => {
      cy.get('[data-testid="milestone-timeline"]').should('be.visible');
    });

    it('should highlight at-risk milestones', () => {
      cy.get('[data-testid="at-risk-milestones"]').should('exist');
    });

    it('should adjust forecast parameters', () => {
      cy.get('[data-testid="button-adjust-forecast"]').click();
      cy.get('[data-testid="input-buffer-percentage"]').clear().type('15');
      cy.get('[data-testid="button-recalculate"]').click();
    });
  });

  describe('Cost Variance Analytics', () => {
    beforeEach(() => {
      cy.visit('/analytics/cost-variance');
      cy.waitForPageLoad();
    });

    it('should display cost variance dashboard', () => {
      cy.get('[data-testid="cost-variance-dashboard"]').should('be.visible');
    });

    it('should show budget vs actual', () => {
      cy.get('[data-testid="budget-vs-actual"]').should('be.visible');
    });

    it('should show cost variance by category', () => {
      cy.get('[data-testid="variance-by-category"]').should('be.visible');
    });

    it('should show cost trend', () => {
      cy.get('[data-testid="cost-trend-chart"]').should('be.visible');
    });

    it('should highlight over-budget items', () => {
      cy.get('[data-testid="over-budget-items"]').should('be.visible');
    });

    it('should show earned value metrics', () => {
      cy.get('[data-testid="earned-value-metrics"]').should('be.visible');
    });

    it('should filter by project', () => {
      cy.selectOption('[data-testid="filter-project"]', 'project');
    });

    it('should export cost report', () => {
      cy.get('[data-testid="button-export-cost-report"]').click();
    });
  });

  describe('Hospital ROI Analysis', () => {
    beforeEach(() => {
      cy.visit('/analytics/roi');
      cy.waitForPageLoad();
    });

    it('should display ROI dashboard', () => {
      cy.get('[data-testid="roi-dashboard"]').should('be.visible');
    });

    it('should show ROI by hospital', () => {
      cy.get('[data-testid="roi-by-hospital"]').should('be.visible');
    });

    it('should show ROI calculation breakdown', () => {
      cy.get('[data-testid="roi-breakdown"]').should('be.visible');
    });

    it('should show cost savings', () => {
      cy.get('[data-testid="cost-savings"]').should('be.visible');
    });

    it('should show efficiency gains', () => {
      cy.get('[data-testid="efficiency-gains"]').should('be.visible');
    });

    it('should compare ROI across projects', () => {
      cy.get('[data-testid="roi-comparison"]').should('be.visible');
    });

    it('should drill down into hospital ROI', () => {
      cy.get('[data-testid="hospital-roi-item"]').first().click();
      cy.get('[data-testid="hospital-roi-details"]').should('be.visible');
    });
  });

  describe('Consultant Performance Analytics', () => {
    beforeEach(() => {
      cy.visit('/analytics/consultant-performance');
      cy.waitForPageLoad();
    });

    it('should display performance dashboard', () => {
      cy.get('[data-testid="performance-dashboard"]').should('be.visible');
    });

    it('should show performance rankings', () => {
      cy.get('[data-testid="performance-rankings"]').should('be.visible');
    });

    it('should show performance metrics', () => {
      cy.get('[data-testid="performance-metrics"]').should('be.visible');
    });

    it('should show performance trends', () => {
      cy.get('[data-testid="performance-trend-chart"]').should('be.visible');
    });

    it('should filter by certification', () => {
      cy.selectOption('[data-testid="filter-certification"]', 'Epic');
    });

    it('should view consultant detail', () => {
      cy.get('[data-testid="consultant-row"]').first().click();
      cy.get('[data-testid="consultant-performance-detail"]').should('be.visible');
    });
  });

  describe('Report Builder', () => {
    beforeEach(() => {
      cy.navigateTo('reports');
      cy.waitForPageLoad();
    });

    describe('Report List', () => {
      it('should display saved reports', () => {
        cy.get('[data-testid="saved-reports-list"]').should('be.visible');
      });

      it('should show report templates', () => {
        cy.get('[data-testid="report-templates"]').should('be.visible');
      });

      it('should search reports', () => {
        cy.get('[data-testid="input-search-reports"]').type('utilization');
      });

      it('should filter by category', () => {
        cy.selectOption('[data-testid="filter-category"]', 'Financial');
      });
    });

    describe('Create Custom Report', () => {
      it('should open report builder', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.get('[data-testid="report-builder"]').should('be.visible');
      });

      it('should select data source', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.selectOption('[data-testid="select-data-source"]', 'Timesheets');
      });

      it('should add columns to report', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.get('[data-testid="available-columns"]').within(() => {
          cy.get('[data-testid="column-consultant"]').click();
          cy.get('[data-testid="column-hours"]').click();
          cy.get('[data-testid="column-project"]').click();
        });
      });

      it('should add filters', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.get('[data-testid="button-add-filter"]').click();
        cy.selectOption('[data-testid="select-filter-field"]', 'Date');
        cy.selectOption('[data-testid="select-filter-operator"]', 'Between');
        cy.get('[data-testid="input-filter-value-1"]').type('2024-01-01');
        cy.get('[data-testid="input-filter-value-2"]').type('2024-03-31');
      });

      it('should add grouping', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.get('[data-testid="button-add-grouping"]').click();
        cy.selectOption('[data-testid="select-group-by"]', 'Project');
      });

      it('should add sorting', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.get('[data-testid="button-add-sort"]').click();
        cy.selectOption('[data-testid="select-sort-field"]', 'Hours');
        cy.selectOption('[data-testid="select-sort-order"]', 'Descending');
      });

      it('should preview report', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.selectOption('[data-testid="select-data-source"]', 'Timesheets');
        cy.get('[data-testid="button-preview"]').click();
        cy.get('[data-testid="report-preview"]').should('be.visible');
      });

      it('should save report', () => {
        cy.get('[data-testid="button-create-report"]').click();
        cy.selectOption('[data-testid="select-data-source"]', 'Timesheets');
        cy.get('[data-testid="input-report-name"]').type('Custom Timesheet Report');
        cy.get('[data-testid="button-save-report"]').click();
      });
    });

    describe('Run Report', () => {
      it('should run saved report', () => {
        cy.get('[data-testid="report-item"]').first()
          .find('[data-testid="button-run-report"]').click();
        cy.get('[data-testid="report-results"]').should('be.visible');
      });

      it('should export report to CSV', () => {
        cy.get('[data-testid="report-item"]').first()
          .find('[data-testid="button-run-report"]').click();
        cy.get('[data-testid="button-export-csv"]').click();
      });

      it('should export report to Excel', () => {
        cy.get('[data-testid="report-item"]').first()
          .find('[data-testid="button-run-report"]').click();
        cy.get('[data-testid="button-export-excel"]').click();
      });

      it('should export report to PDF', () => {
        cy.get('[data-testid="report-item"]').first()
          .find('[data-testid="button-run-report"]').click();
        cy.get('[data-testid="button-export-pdf"]').click();
      });

      it('should schedule report', () => {
        cy.get('[data-testid="report-item"]').first()
          .find('[data-testid="button-schedule"]').click();
        cy.selectOption('[data-testid="select-frequency"]', 'Weekly');
        cy.get('[data-testid="input-recipients"]').type('manager@company.com');
        cy.get('[data-testid="button-save-schedule"]').click();
      });
    });

    describe('Report Templates', () => {
      it('should use template', () => {
        cy.get('[data-testid="template-item"]').first()
          .find('[data-testid="button-use-template"]').click();
        cy.get('[data-testid="report-builder"]').should('be.visible');
      });

      it('should preview template', () => {
        cy.get('[data-testid="template-item"]').first()
          .find('[data-testid="button-preview-template"]').click();
        cy.get('[data-testid="template-preview"]').should('be.visible');
      });
    });
  });

  describe('Dashboard Customization', () => {
    beforeEach(() => {
      cy.navigateTo('analytics');
      cy.get('[data-testid="button-customize-dashboard"]').click();
    });

    it('should show available widgets', () => {
      cy.get('[data-testid="available-widgets"]').should('be.visible');
    });

    it('should add widget to dashboard', () => {
      cy.get('[data-testid="widget-item"]').first()
        .find('[data-testid="button-add-widget"]').click();
    });

    it('should remove widget from dashboard', () => {
      cy.get('[data-testid="dashboard-widget"]').first()
        .find('[data-testid="button-remove-widget"]').click();
    });

    it('should resize widget', () => {
      cy.get('[data-testid="dashboard-widget"]').first()
        .find('[data-testid="resize-handle"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 500 })
        .trigger('mouseup');
    });

    it('should save dashboard layout', () => {
      cy.get('[data-testid="button-save-layout"]').click();
    });

    it('should reset to default layout', () => {
      cy.get('[data-testid="button-reset-layout"]').click();
      cy.get('[data-testid="button-confirm"]').click();
    });
  });
});
