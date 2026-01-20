/**
 * Phase 2 Drill-Down Tests
 * Tests for drill-down functionality across dashboards
 */

describe('Phase 2 Drill-Down Tests', () => {
  const mockUser = {
    id: 1,
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  describe('Main Dashboard - Performance Gauges', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalConsultants: 15,
          activeProjects: 8,
          pendingDocuments: 3,
          totalHospitals: 5,
          availableConsultants: 10,
          totalSavings: 125000,
          ticketResolutionRate: 85,
          projectCompletionRate: 72,
          consultantUtilization: 78,
          totalHoursLogged: 450
        }
      }).as('getStats');

      cy.intercept('GET', '/api/dashboard/tasks*', {
        statusCode: 200,
        body: [
          { id: '1', title: 'Complete training', status: 'pending', priority: 'high', projectId: 'p1', projectName: 'Epic Go-Live', dueDate: '2026-01-25' }
        ]
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events*', {
        statusCode: 200,
        body: [
          { id: 'e1', title: 'Project Kickoff', type: 'milestone', date: '2026-01-25', projectId: 'p1', projectName: 'Epic Go-Live' }
        ]
      }).as('getEvents');

      cy.intercept('GET', '/api/activities/recent*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
      cy.wait('@getStats');
    });

    it('should click Ticket Resolution gauge and navigate to support tickets', () => {
      cy.intercept('GET', '/api/support-tickets*', {
        statusCode: 200,
        body: []
      }).as('getTickets');

      cy.get('[data-testid="gauge-ticket-resolution"]').click();
      cy.url().should('include', '/support-tickets');
      cy.url().should('include', 'status=resolved');
    });

    it('should click Project Completion gauge and navigate to projects', () => {
      cy.intercept('GET', '/api/projects*', {
        statusCode: 200,
        body: []
      }).as('getProjects');

      cy.get('[data-testid="gauge-project-completion"]').click();
      cy.url().should('include', '/projects');
      cy.url().should('include', 'status=completed');
    });

    it('should click Utilization gauge and navigate to consultants', () => {
      cy.intercept('GET', '/api/consultants*', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      cy.get('[data-testid="gauge-utilization"]').click();
      cy.url().should('include', '/consultants');
      cy.url().should('include', 'sort=utilization');
    });

    it('should click Hours Logged gauge and navigate to timesheets', () => {
      cy.intercept('GET', '/api/timesheets*', {
        statusCode: 200,
        body: []
      }).as('getTimesheets');

      cy.get('[data-testid="gauge-hours-logged"]').click();
      cy.url().should('include', '/timesheets');
    });
  });

  describe('Main Dashboard - Task and Event Drill-Downs', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalConsultants: 15,
          activeProjects: 8,
          pendingDocuments: 3,
          totalHospitals: 5,
          availableConsultants: 10,
          totalSavings: 125000,
          ticketResolutionRate: 85,
          projectCompletionRate: 72,
          consultantUtilization: 78,
          totalHoursLogged: 450
        }
      }).as('getStats');

      cy.intercept('GET', '/api/dashboard/tasks*', {
        statusCode: 200,
        body: [
          { id: '1', title: 'Complete training documentation', status: 'pending', priority: 'high', projectId: 'p1', projectName: 'Epic Go-Live', dueDate: '2026-01-25' }
        ]
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events*', {
        statusCode: 200,
        body: [
          { id: 'e1', title: 'Project Kickoff Meeting', type: 'milestone', date: '2026-01-25', projectId: 'p1', projectName: 'Epic Go-Live' }
        ]
      }).as('getEvents');

      cy.intercept('GET', '/api/activities/recent*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
      cy.wait('@getStats');
      cy.get('[data-testid="tasks-list"]', { timeout: 10000 }).should('be.visible');
    });

    it('should click on task item and show task detail modal', () => {
      cy.get('[data-testid="task-item-1"]').click();
      cy.get('[data-testid="dialog-task-detail"]').should('be.visible');
      cy.get('[data-testid="task-detail-title"]').should('contain', 'Complete training documentation');
      cy.get('[data-testid="task-detail-priority"]').should('contain', 'High');
    });

    it('should click on event item and show event detail modal', () => {
      cy.get('[data-testid="event-e1"]').click();
      cy.get('[data-testid="dialog-event-detail"]').should('be.visible');
      cy.get('[data-testid="event-detail-title"]').should('contain', 'Project Kickoff Meeting');
      cy.get('[data-testid="event-detail-type"]').should('contain', 'Milestone');
    });
  });

  describe('Executive Dashboard - KPI Cards', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/executive-dashboards', {
        statusCode: 200,
        body: []
      }).as('getDashboards');

      cy.intercept('GET', '/api/kpi-definitions', {
        statusCode: 200,
        body: []
      }).as('getKpis');

      cy.intercept('GET', '/api/analytics/reports', {
        statusCode: 200,
        body: { totalReports: 5, reportsThisWeek: 2 }
      }).as('getReportAnalytics');

      cy.intercept('GET', '/api/analytics/dashboards', {
        statusCode: 200,
        body: { totalDashboards: 3 }
      }).as('getDashboardAnalytics');

      cy.visit('/executive-dashboard');
      cy.wait('@getUser');
    });

    it('should click on KPI card and show detail dialog', () => {
      cy.get('[data-testid="kpi-card-example-1"]').click();
      cy.get('[data-testid="dialog-kpi-detail"]').should('be.visible');
      cy.get('[data-testid="kpi-detail-name"]').should('contain', 'Active Projects');
    });

    it('should show drill-down button based on KPI category', () => {
      cy.get('[data-testid="kpi-card-example-1"]').click();
      cy.get('[data-testid="dialog-kpi-detail"]').should('be.visible');
      cy.get('[data-testid="button-drill-projects"]').should('be.visible');
    });
  });

  describe('Analytics Dashboard - KPI Cards', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: {
          type: 'platform',
          data: {
            overview: {
              totalConsultants: 25,
              activeConsultants: 20,
              totalHospitals: 10,
              activeHospitals: 8,
              activeProjects: 15,
              totalProjects: 25,
              totalUsers: 100,
              totalSavings: 500000
            },
            activityTrend: [
              { date: '2026-01-01', count: 10 },
              { date: '2026-01-02', count: 15 }
            ],
            projectsByStatus: { active: 15, draft: 3, completed: 5, cancelled: 2 },
            consultantsByStatus: { onboarded: 20, pending: 5, available: 15, unavailable: 5 },
            documentCompliance: { approved: 80, pending: 10, rejected: 5, expired: 5, total: 100, complianceRate: 80 },
            usersByRole: { admin: 5, hospital_staff: 30, consultant: 65 }
          }
        }
      }).as('getAnalytics');

      cy.visit('/analytics');
      cy.wait(['@getUser', '@getAnalytics']);
    });

    it('should click on Total Consultants KPI and navigate', () => {
      cy.intercept('GET', '/api/consultants*', { body: [] }).as('getConsultants');
      cy.get('[data-testid="kpi-total-consultants"]').click();
      cy.url().should('include', '/consultants');
    });

    it('should click on Hospitals KPI and navigate', () => {
      cy.intercept('GET', '/api/hospitals*', { body: [] }).as('getHospitals');
      cy.get('[data-testid="kpi-hospitals"]').click();
      cy.url().should('include', '/hospitals');
    });

    it('should click on Active Projects KPI and navigate with filter', () => {
      cy.intercept('GET', '/api/projects*', { body: [] }).as('getProjects');
      cy.get('[data-testid="kpi-active-projects"]').click();
      cy.url().should('include', '/projects');
      cy.url().should('include', 'status=active');
    });

    it('should click on Compliance card and navigate to documents', () => {
      cy.intercept('GET', '/api/consultants*', { body: [] }).as('getConsultants');
      cy.get('[data-testid="card-compliance-rate"]').click();
      cy.url().should('include', '/documents');
    });
  });

  describe('Analytics Dashboard - Status Distribution Cards', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: {
          type: 'platform',
          data: {
            overview: {
              totalConsultants: 25,
              activeConsultants: 20,
              totalHospitals: 10,
              activeHospitals: 8,
              activeProjects: 15,
              totalProjects: 25,
              totalUsers: 100,
              totalSavings: 500000
            },
            activityTrend: [
              { date: '2026-01-01', count: 10 },
              { date: '2026-01-02', count: 15 }
            ],
            projectsByStatus: { active: 15, draft: 3, completed: 5, cancelled: 2 },
            consultantsByStatus: { onboarded: 20, pending: 5, available: 15, unavailable: 5 },
            documentCompliance: { approved: 80, pending: 10, rejected: 5, expired: 5, total: 100, complianceRate: 80 },
            usersByRole: { admin: 5, hospital_staff: 30, consultant: 65 }
          }
        }
      }).as('getAnalytics');

      cy.visit('/analytics');
      cy.wait(['@getUser', '@getAnalytics']);
    });

    it('should click on project status item and navigate with filter', () => {
      cy.intercept('GET', '/api/projects*', { body: [] }).as('getProjects');
      // Click on the Active status item within the Project Status card
      cy.get('[data-testid="chart-project-status"]').contains('Active').click();
      cy.url().should('include', '/projects');
      cy.url().should('include', 'status=active');
    });

    it('should click on document compliance item and navigate with filter', () => {
      cy.intercept('GET', '/api/consultants*', { body: [] }).as('getConsultants');
      // Click on the Pending status item within the Document Compliance card
      cy.get('[data-testid="chart-document-compliance"]').contains('Pending').click();
      cy.url().should('include', '/documents');
      cy.url().should('include', 'status=pending');
    });
  });

  describe('Advanced Analytics - Card Drill-Downs', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: {
          type: 'platform',
          data: {
            overview: { totalConsultants: 25, activeConsultants: 20, totalHospitals: 10, activeHospitals: 8, activeProjects: 15, totalProjects: 25, totalUsers: 100, totalSavings: 500000 },
            activityTrend: [],
            projectsByStatus: { active: 15, draft: 3, completed: 5, cancelled: 2 },
            consultantsByStatus: { onboarded: 20, pending: 5, available: 15, unavailable: 5 },
            documentCompliance: { approved: 80, pending: 10, rejected: 5, expired: 5, total: 100, complianceRate: 80 },
            usersByRole: { admin: 5, hospital_staff: 30, consultant: 65 }
          }
        }
      }).as('getAnalytics');

      cy.visit('/analytics');
      cy.wait(['@getUser', '@getAnalytics']);
      cy.get('[data-testid="tab-advanced"]').click();
    });

    it('should click Timeline & Forecasting card and navigate to projects', () => {
      cy.intercept('GET', '/api/projects*', { body: [] }).as('getProjects');
      cy.get('[data-testid="card-timeline-forecasting"]').click();
      cy.url().should('include', '/projects');
    });

    it('should click Cost Variance card and navigate to invoices', () => {
      cy.intercept('GET', '/api/invoices*', { body: [] }).as('getInvoices');
      cy.get('[data-testid="card-cost-variance"]').click();
      cy.url().should('include', '/invoices');
    });

    it('should click Go-Live Readiness card and navigate to TDR', () => {
      cy.get('[data-testid="card-golive-readiness"]').click();
      cy.url().should('include', '/tdr');
    });
  });
});
