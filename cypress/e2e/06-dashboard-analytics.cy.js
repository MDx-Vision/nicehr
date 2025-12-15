describe('Dashboard Analytics and Reporting', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockAnalyticsData = {
    platformStats: {
      totalUsers: 156,
      activeUsers: 142,
      totalProjects: 45,
      completedProjects: 38,
      revenue: {
        thisMonth: 1250000,
        lastMonth: 1180000,
        growth: 5.93
      },
      consultantMetrics: {
        totalConsultants: 89,
        availableConsultants: 34,
        utilizationRate: 87.5,
        averageRating: 4.7
      }
    },
    projectAnalytics: {
      byStatus: [
        { status: 'Planning', count: 12, percentage: 26.7 },
        { status: 'In Progress', count: 18, percentage: 40.0 },
        { status: 'Testing', count: 8, percentage: 17.8 },
        { status: 'Completed', count: 7, percentage: 15.5 }
      ],
      byHospital: [
        { hospital: 'General Hospital', projects: 15, revenue: 450000 },
        { hospital: 'City Medical Center', projects: 12, revenue: 380000 },
        { hospital: 'Regional Health', projects: 18, revenue: 520000 }
      ],
      timeline: [
        { month: 'Jan', planned: 8, completed: 6, revenue: 180000 },
        { month: 'Feb', planned: 10, completed: 8, revenue: 240000 },
        { month: 'Mar', planned: 12, completed: 9, revenue: 270000 },
        { month: 'Apr', planned: 15, completed: 12, revenue: 360000 }
      ]
    },
    consultantAnalytics: {
      performance: [
        { consultant: 'Sarah Wilson', projects: 8, rating: 4.9, utilization: 95 },
        { consultant: 'Mike Johnson', projects: 6, rating: 4.7, utilization: 88 },
        { consultant: 'Lisa Chen', projects: 10, rating: 4.8, utilization: 92 }
      ],
      skills: [
        { skill: 'Epic', consultants: 24, demand: 'High' },
        { skill: 'Cerner', consultants: 18, demand: 'Medium' },
        { skill: 'Allscripts', consultants: 12, demand: 'Low' }
      ],
      availability: {
        available: 34,
        onProject: 45,
        unavailable: 10
      }
    }
  };

  beforeEach(() => {
    // Setup authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        id: 1,
        email: testUser.email,
        name: 'CI Test User',
        role: 'admin',
        permissions: ['analytics.view', 'reports.view', 'dashboard.view']
      }
    }).as('getUser');

    // Setup analytics API interceptors
    cy.intercept('GET', '/api/analytics/platform', {
      statusCode: 200,
      body: mockAnalyticsData.platformStats
    }).as('getPlatformAnalytics');

    cy.intercept('GET', '/api/analytics/projects', {
      statusCode: 200,
      body: mockAnalyticsData.projectAnalytics
    }).as('getProjectAnalytics');

    cy.intercept('GET', '/api/analytics/consultants', {
      statusCode: 200,
      body: mockAnalyticsData.consultantAnalytics
    }).as('getConsultantAnalytics');

    cy.intercept('GET', '/api/analytics/hospital/*', {
      statusCode: 200,
      body: {
        hospitalId: 1,
        hospitalName: 'General Hospital',
        projects: 15,
        consultants: 25,
        revenue: 450000,
        satisfaction: 4.6
      }
    }).as('getHospitalAnalytics');

    // Login
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type(testUser.email);
    cy.get('[data-testid="input-password"]').type(testUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@getUser');
  });

  describe('Analytics Dashboard Overview', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getPlatformAnalytics');
    });

    it('should load analytics dashboard with all sections', () => {
      cy.get('[data-testid="analytics-dashboard"]').should('be.visible');
      cy.get('[data-testid="platform-overview"]').should('be.visible');
      cy.get('[data-testid="revenue-analytics"]').should('be.visible');
      cy.get('[data-testid="project-analytics"]').should('be.visible');
      cy.get('[data-testid="consultant-analytics"]').should('be.visible');
    });

    it('should display key performance indicators', () => {
      cy.get('[data-testid="kpi-total-users"]').should('contain.text', '156');
      cy.get('[data-testid="kpi-active-users"]').should('contain.text', '142');
      cy.get('[data-testid="kpi-total-projects"]').should('contain.text', '45');
      cy.get('[data-testid="kpi-monthly-revenue"]').should('contain.text', '$1,250,000');
    });

    it('should show growth indicators', () => {
      cy.get('[data-testid="revenue-growth"]')
        .should('contain.text', '5.93%')
        .and('have.class', 'text-green-600'); // Positive growth
      
      cy.get('[data-testid="growth-indicator-icon"]').should('have.class', 'arrow-up');
    });

    it('should display utilization metrics', () => {
      cy.get('[data-testid="utilization-rate"]').should('contain.text', '87.5%');
      cy.get('[data-testid="utilization-progress"]')
        .should('have.attr', 'value', '87.5')
        .and('have.attr', 'max', '100');
    });

    it('should show average ratings', () => {
      cy.get('[data-testid="average-rating"]').should('contain.text', '4.7');
      cy.get('[data-testid="rating-stars"]').within(() => {
        cy.get('[data-testid="filled-star"]').should('have.length', 4);
        cy.get('[data-testid="half-star"]').should('have.length', 1);
      });
    });
  });

  describe('Revenue Analytics Charts', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getPlatformAnalytics');
    });

    it('should display revenue trend chart', () => {
      cy.get('[data-testid="revenue-trend-chart"]').should('be.visible');
      cy.get('[data-testid="chart-canvas"]').should('be.visible');
    });

    it('should handle time period selection for revenue charts', () => {
      cy.get('[data-testid="revenue-period-selector"]').click();
      cy.get('[data-testid="period-option-7days"]').click();
      
      cy.intercept('GET', '/api/analytics/platform?period=7days', {
        statusCode: 200,
        body: { ...mockAnalyticsData.platformStats, revenue: { thisMonth: 890000 } }
      }).as('getWeeklyAnalytics');
      
      cy.wait('@getWeeklyAnalytics');
      cy.get('[data-testid="kpi-monthly-revenue"]').should('contain.text', '$890,000');
    });

    it('should show revenue breakdown by hospital', () => {
      cy.get('[data-testid="revenue-by-hospital-chart"]').should('be.visible');
      cy.get('[data-testid="hospital-revenue-item"]').should('have.length.at.least', 3);
      
      cy.get('[data-testid="hospital-revenue-item"]').first().within(() => {
        cy.get('[data-testid="hospital-name"]').should('be.visible');
        cy.get('[data-testid="hospital-revenue"]').should('be.visible');
        cy.get('[data-testid="hospital-percentage"]').should('be.visible');
      });
    });

    it('should display revenue forecasting', () => {
      cy.get('[data-testid="revenue-forecast"]').should('be.visible');
      cy.get('[data-testid="forecast-chart"]').should('be.visible');
      cy.get('[data-testid="forecast-confidence"]').should('contain.text', '%');
    });
  });

  describe('Project Analytics Section', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getProjectAnalytics');
    });

    it('should display project status distribution', () => {
      cy.get('[data-testid="project-status-chart"]').should('be.visible');
      cy.get('[data-testid="status-planning"]').should('contain.text', '12');
      cy.get('[data-testid="status-in-progress"]').should('contain.text', '18');
      cy.get('[data-testid="status-testing"]').should('contain.text', '8');
      cy.get('[data-testid="status-completed"]').should('contain.text', '7');
    });

    it('should show project timeline analytics', () => {
      cy.get('[data-testid="project-timeline-chart"]').should('be.visible');
      cy.get('[data-testid="timeline-data-points"]').should('have.length', 4);
    });

    it('should display project performance metrics', () => {
      cy.get('[data-testid="project-performance"]').should('be.visible');
      cy.get('[data-testid="on-time-delivery"]').should('be.visible');
      cy.get('[data-testid="budget-variance"]').should('be.visible');
      cy.get('[data-testid="client-satisfaction"]').should('be.visible');
    });

    it('should handle project filtering', () => {
      cy.get('[data-testid="project-filter-hospital"]').click();
      cy.get('[data-testid="hospital-filter-option"]').first().click();
      
      cy.intercept('GET', '/api/analytics/projects*', {
        statusCode: 200,
        body: {
          ...mockAnalyticsData.projectAnalytics,
          byStatus: [{ status: 'In Progress', count: 5, percentage: 100 }]
        }
      }).as('getFilteredProjects');
      
      cy.wait('@getFilteredProjects');
      cy.get('[data-testid="status-in-progress"]').should('contain.text', '5');
    });

    it('should show project risk analysis', () => {
      cy.get('[data-testid="project-risk-analysis"]').should('be.visible');
      cy.get('[data-testid="high-risk-projects"]').should('be.visible');
      cy.get('[data-testid="medium-risk-projects"]').should('be.visible');
      cy.get('[data-testid="low-risk-projects"]').should('be.visible');
    });
  });

  describe('Consultant Analytics Section', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getConsultantAnalytics');
    });

    it('should display consultant performance metrics', () => {
      cy.get('[data-testid="consultant-performance"]').should('be.visible');
      cy.get('[data-testid="performance-table"]').should('be.visible');
      
      cy.get('[data-testid="consultant-row"]').should('have.length', 3);
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="consultant-name"]').should('contain.text', 'Sarah Wilson');
        cy.get('[data-testid="consultant-projects"]').should('contain.text', '8');
        cy.get('[data-testid="consultant-rating"]').should('contain.text', '4.9');
        cy.get('[data-testid="consultant-utilization"]').should('contain.text', '95');
      });
    });

    it('should show skills distribution chart', () => {
      cy.get('[data-testid="skills-distribution-chart"]').should('be.visible');
      cy.get('[data-testid="skill-item"]').should('have.length', 3);
      
      cy.get('[data-testid="skill-item"]').each(($skill) => {
        cy.wrap($skill).within(() => {
          cy.get('[data-testid="skill-name"]').should('be.visible');
          cy.get('[data-testid="skill-count"]').should('be.visible');
          cy.get('[data-testid="skill-demand"]').should('be.visible');
        });
      });
    });

    it('should display availability status', () => {
      cy.get('[data-testid="consultant-availability"]').should('be.visible');
      cy.get('[data-testid="available-count"]').should('contain.text', '34');
      cy.get('[data-testid="on-project-count"]').should('contain.text', '45');
      cy.get('[data-testid="unavailable-count"]').should('contain.text', '10');
    });

    it('should handle consultant performance sorting', () => {
      cy.get('[data-testid="sort-by-rating"]').click();
      cy.get('[data-testid="consultant-row"]').first()
        .find('[data-testid="consultant-rating"]')
        .should('contain.text', '4.9');
      
      cy.get('[data-testid="sort-by-utilization"]').click();
      cy.get('[data-testid="consultant-row"]').first()
        .find('[data-testid="consultant-utilization"]')
        .should('contain.text', '95');
    });

    it('should show consultant growth trends', () => {
      cy.get('[data-testid="consultant-growth-chart"]').should('be.visible');
      cy.get('[data-testid="onboarding-trend"]').should('be.visible');
      cy.get('[data-testid="retention-rate"]').should('be.visible');
    });
  });

  describe('Hospital-Specific Analytics', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics/hospital/1');
      cy.wait('@getHospitalAnalytics');
    });

    it('should display hospital-specific metrics', () => {
      cy.get('[data-testid="hospital-analytics"]').should('be.visible');
      cy.get('[data-testid="hospital-name"]').should('contain.text', 'General Hospital');
      cy.get('[data-testid="hospital-projects"]').should('contain.text', '15');
      cy.get('[data-testid="hospital-consultants"]').should('contain.text', '25');
      cy.get('[data-testid="hospital-revenue"]').should('contain.text', '$450,000');
    });

    it('should show hospital satisfaction scores', () => {
      cy.get('[data-testid="hospital-satisfaction"]').should('contain.text', '4.6');
      cy.get('[data-testid="satisfaction-breakdown"]').should('be.visible');
    });

    it('should display project progress for hospital', () => {
      cy.get('[data-testid="hospital-project-progress"]').should('be.visible');
      cy.get('[data-testid="project-progress-chart"]').should('be.visible');
    });

    it('should show resource allocation', () => {
      cy.get('[data-testid="resource-allocation"]').should('be.visible');
      cy.get('[data-testid="consultant-allocation-chart"]').should('be.visible');
    });
  });

  describe('Analytics Filtering and Customization', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getPlatformAnalytics');
    });

    it('should handle date range filtering', () => {
      cy.get('[data-testid="analytics-date-filter"]').click();
      cy.get('[data-testid="date-range-picker"]').should('be.visible');
      
      cy.get('[data-testid="start-date"]').clear().type('2024-01-01');
      cy.get('[data-testid="end-date"]').clear().type('2024-03-31');
      cy.get('[data-testid="apply-date-filter"]').click();
      
      cy.intercept('GET', '/api/analytics/platform*', {
        statusCode: 200,
        body: { ...mockAnalyticsData.platformStats, totalProjects: 35 }
      }).as('getDateFilteredAnalytics');
      
      cy.wait('@getDateFilteredAnalytics');
      cy.get('[data-testid="kpi-total-projects"]').should('contain.text', '35');
    });

    it('should allow metric selection', () => {
      cy.get('[data-testid="customize-metrics"]').click();
      cy.get('[data-testid="metric-selector-modal"]').should('be.visible');
      
      cy.get('[data-testid="metric-revenue"]').should('be.checked');
      cy.get('[data-testid="metric-projects"]').should('be.checked');
      cy.get('[data-testid="metric-consultants"]').click(); // Uncheck
      
      cy.get('[data-testid="save-metric-preferences"]').click();
      cy.get('[data-testid="consultant-analytics"]').should('not.be.visible');
    });

    it('should handle comparison periods', () => {
      cy.get('[data-testid="comparison-toggle"]').click();
      cy.get('[data-testid="comparison-period"]').select('Previous Quarter');
      
      cy.get('[data-testid="comparison-data"]').should('be.visible');
      cy.get('[data-testid="period-comparison-chart"]').should('be.visible');
    });

    it('should save analytics preferences', () => {
      cy.get('[data-testid="save-dashboard-layout"]').click();
      
      cy.intercept('POST', '/api/user/preferences', { statusCode: 200 }).as('savePreferences');
      cy.wait('@savePreferences');
      
      cy.get('[data-testid="preferences-saved-toast"]').should('be.visible');
    });
  });

  describe('Analytics Export and Reporting', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getPlatformAnalytics');
    });

    it('should export analytics data to PDF', () => {
      cy.get('[data-testid="export-analytics"]').click();
      cy.get('[data-testid="export-format-pdf"]').click();
      
      cy.intercept('POST', '/api/analytics/export/pdf', {
        statusCode: 200,
        body: { downloadUrl: '/downloads/analytics-report.pdf' }
      }).as('exportPDF');
      
      cy.get('[data-testid="export-confirm"]').click();
      cy.wait('@exportPDF');
      
      cy.get('[data-testid="download-ready"]').should('be.visible');
    });

    it('should export analytics data to Excel', () => {
      cy.get('[data-testid="export-analytics"]').click();
      cy.get('[data-testid="export-format-excel"]').click();
      
      cy.intercept('POST', '/api/analytics/export/excel', {
        statusCode: 200,
        body: { downloadUrl: '/downloads/analytics-data.xlsx' }
      }).as('exportExcel');
      
      cy.get('[data-testid="export-confirm"]').click();
      cy.wait('@exportExcel');
      
      cy.get('[data-testid="download-link"]').should('be.visible');
    });

    it('should schedule automated reports', () => {
      cy.get('[data-testid="schedule-report"]').click();
      cy.get('[data-testid="schedule-modal"]').should('be.visible');
      
      cy.get('[data-testid="report-frequency"]').select('Weekly');
      cy.get('[data-testid="report-recipients"]').type('manager@example.com');
      cy.get('[data-testid="report-format"]').select('PDF');
      
      cy.intercept('POST', '/api/scheduled-reports', { statusCode: 200 }).as('scheduleReport');
      cy.get('[data-testid="save-schedule"]').click();
      cy.wait('@scheduleReport');
      
      cy.get('[data-testid="schedule-success"]').should('be.visible');
    });

    it('should generate custom reports', () => {
      cy.get('[data-testid="custom-report"]').click();
      cy.get('[data-testid="report-builder"]').should('be.visible');
      
      cy.get('[data-testid="add-metric-revenue"]').click();
      cy.get('[data-testid="add-metric-projects"]').click();
      cy.get('[data-testid="add-chart-timeline"]').click();
      
      cy.get('[data-testid="preview-report"]').click();
      cy.get('[data-testid="report-preview"]').should('be.visible');
      
      cy.get('[data-testid="save-report-template"]').click();
      cy.get('[data-testid="template-name"]').type('Monthly Executive Summary');
      cy.get('[data-testid="save-template"]').click();
    });
  });

  describe('Real-time Analytics Updates', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getPlatformAnalytics');
    });

    it('should display real-time data updates', () => {
      cy.get('[data-testid="real-time-indicator"]').should('be.visible');
      cy.get('[data-testid="last-updated"]').should('contain.text', 'Updated');
      
      // Simulate real-time update
      cy.intercept('GET', '/api/analytics/platform', {
        statusCode: 200,
        body: { ...mockAnalyticsData.platformStats, totalUsers: 157 }
      }).as('getRealTimeUpdate');
      
      cy.wait('@getRealTimeUpdate');
      cy.get('[data-testid="kpi-total-users"]').should('contain.text', '157');
    });

    it('should handle websocket connections for live updates', () => {
      cy.get('[data-testid="live-updates-toggle"]').click();
      cy.get('[data-testid="live-indicator"]').should('have.class', 'bg-green-500');
      
      // Simulate websocket message
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('analytics-update', {
          detail: { totalProjects: 46 }
        }));
      });
      
      cy.get('[data-testid="kpi-total-projects"]').should('contain.text', '46');
    });

    it('should show data refresh timestamps', () => {
      cy.get('[data-testid="refresh-timestamp"]').should('be.visible');
      cy.get('[data-testid="auto-refresh-settings"]').click();
      cy.get('[data-testid="refresh-interval"]').select('30 seconds');
      cy.get('[data-testid="save-refresh-settings"]').click();
    });
  });

  describe('Analytics Error Handling', () => {
    it('should handle analytics API failures', () => {
      cy.intercept('GET', '/api/analytics/platform', {
        statusCode: 500,
        body: { error: 'Analytics service unavailable' }
      }).as('getAnalyticsError');

      cy.visit('/dashboard/analytics');
      cy.wait('@getAnalyticsError');

      cy.get('[data-testid="analytics-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'Unable to load analytics data');
      
      cy.get('[data-testid="retry-analytics"]').click();
      cy.wait('@getAnalyticsError');
    });

    it('should handle partial data loading gracefully', () => {
      cy.intercept('GET', '/api/analytics/platform', {
        statusCode: 200,
        body: { totalUsers: 156 } // Partial data
      }).as('getPartialAnalytics');

      cy.intercept('GET', '/api/analytics/projects', {
        statusCode: 500
      }).as('getProjectsError');

      cy.visit('/dashboard/analytics');
      cy.wait('@getPartialAnalytics');
      cy.wait('@getProjectsError');

      cy.get('[data-testid="kpi-total-users"]').should('contain.text', '156');
      cy.get('[data-testid="project-analytics-error"]').should('be.visible');
    });

    it('should show loading states for slow responses', () => {
      cy.intercept('GET', '/api/analytics/platform', {
        delay: 2000,
        statusCode: 200,
        body: mockAnalyticsData.platformStats
      }).as('getSlowAnalytics');

      cy.visit('/dashboard/analytics');
      cy.get('[data-testid="analytics-skeleton"]').should('be.visible');
      cy.wait('@getSlowAnalytics');
      cy.get('[data-testid="analytics-skeleton"]').should('not.exist');
    });
  });

  describe('Analytics Accessibility', () => {
    beforeEach(() => {
      cy.visit('/dashboard/analytics');
      cy.wait('@getPlatformAnalytics');
    });

    it('should have proper chart accessibility', () => {
      cy.get('[data-testid="revenue-trend-chart"]')
        .should('have.attr', 'role', 'img')
        .and('have.attr', 'aria-label')
        .and('contain', 'Revenue trend chart');
    });

    it('should provide data tables for chart accessibility', () => {
      cy.get('[data-testid="chart-data-table-toggle"]').click();
      cy.get('[data-testid="revenue-data-table"]').should('be.visible');
      
      cy.get('[data-testid="revenue-data-table"]').within(() => {
        cy.get('th').should('contain.text', 'Period');
        cy.get('th').should('contain.text', 'Revenue');
        cy.get('td').should('have.length.at.least', 2);
      });
    });

    it('should support keyboard navigation for interactive elements', () => {
      cy.get('[data-testid="revenue-period-selector"]').focus();
      cy.focused().type('{downArrow}');
      cy.focused().type('{enter}');
    });

    it('should have high contrast mode support', () => {
      cy.get('[data-testid="high-contrast-toggle"]').click();
      cy.get('[data-testid="analytics-dashboard"]')
        .should('have.class', 'high-contrast-mode');
    });
  });
});
