describe('Analytics & Reporting', () => {
  const adminUser = {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };

  const mockPlatformAnalytics = {
    type: 'platform',
    data: {
      overview: {
        totalConsultants: 145,
        activeConsultants: 89,
        totalHospitals: 12,
        activeHospitals: 10,
        activeProjects: 23,
        totalProjects: 30,
        totalSavings: '2450000'
      },
      activityTrend: [
        { date: '2024-01', count: 45 },
        { date: '2024-02', count: 52 },
        { date: '2024-03', count: 61 }
      ],
      projectsByStatus: {
        active: 15,
        draft: 5,
        completed: 8,
        cancelled: 2
      },
      consultantsByStatus: {
        onboarded: 89,
        pending: 20,
        available: 60,
        unavailable: 29
      },
      documentCompliance: {
        approved: 120,
        pending: 15,
        rejected: 5,
        expired: 10
      },
      usersByRole: {
        admin: 5,
        hospital_staff: 25,
        consultant: 145
      },
      complianceRate: 85
    }
  };

  describe('Platform Analytics (Admin View)', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: mockPlatformAnalytics
      }).as('getAnalytics');

      cy.visit('/analytics');
      cy.wait('@getUser');
      cy.wait('@getAnalytics');
    });

    it('should display analytics page title', () => {
      cy.get('[data-testid="text-analytics-title"]').should('contain', 'Analytics');
    });

    it('should display total consultants KPI card', () => {
      cy.get('[data-testid="kpi-total-consultants"]').should('exist');
    });

    it('should display hospitals KPI card', () => {
      cy.get('[data-testid="kpi-hospitals"]').should('exist');
    });

    it('should display active projects KPI card', () => {
      cy.get('[data-testid="kpi-active-projects"]').should('exist');
    });

    it('should display total savings KPI card', () => {
      cy.get('[data-testid="kpi-total-savings"]').should('exist');
    });

    it('should display activity trend chart', () => {
      cy.get('[data-testid="chart-activity-trend"]').should('exist');
    });

    it('should display project status distribution chart', () => {
      cy.get('[data-testid="chart-project-status"]').should('exist');
    });

    it('should display consultant status distribution chart', () => {
      cy.get('[data-testid="chart-consultant-status"]').should('exist');
    });

    it('should display document compliance chart', () => {
      cy.get('[data-testid="chart-document-compliance"]').should('exist');
    });

    it('should display users by role pie chart', () => {
      cy.get('[data-testid="chart-users-by-role"]').should('exist');
    });

    it('should display compliance rate card', () => {
      cy.get('[data-testid="card-compliance-rate"]').should('exist');
    });

    it('should show KPI values correctly', () => {
      cy.get('[data-testid="kpi-total-consultants"]').should('contain', '145');
      cy.get('[data-testid="kpi-hospitals"]').should('contain', '12');
      cy.get('[data-testid="kpi-active-projects"]').should('contain', '23');
    });
  });

  describe('Analytics Loading States', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');
    });

    it('should show loading skeletons while fetching data', () => {
      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: mockPlatformAnalytics,
        delay: 1000
      }).as('getAnalyticsDelayed');

      cy.visit('/analytics');
      cy.wait('@getUser');
      cy.get('.animate-pulse').should('exist');
    });

    it('should handle empty analytics gracefully', () => {
      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: { type: 'platform', data: null }
      }).as('getEmptyAnalytics');

      cy.visit('/analytics');
      cy.wait('@getUser');
      cy.contains('No analytics data available').should('be.visible');
    });
  });

  describe('Chart Interactions', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: mockPlatformAnalytics
      }).as('getAnalytics');

      cy.visit('/analytics');
      cy.wait('@getUser');
      cy.wait('@getAnalytics');
    });

    it('should render recharts components', () => {
      // Check that recharts SVG elements are present
      cy.get('.recharts-responsive-container').should('have.length.at.least', 1);
    });

    it('should display chart legend or labels', () => {
      cy.get('[data-testid="chart-activity-trend"]').within(() => {
        cy.get('svg').should('exist');
      });
    });
  });

  // ===========================================================================
  // Role-Specific Analytics Views
  // ===========================================================================

  describe('Hospital Staff Analytics', () => {
    const hospitalStaffUser = {
      id: 2,
      email: 'staff@hospital.com',
      firstName: 'Hospital',
      lastName: 'Staff',
      role: 'hospital_staff'
    };

    const mockHospitalAnalytics = {
      type: 'hospital',
      data: {
        hospitalName: 'Test Hospital',
        overview: {
          totalProjects: 5,
          activeProjects: 3,
          totalBudget: '500000',
          totalSavings: '125000',
          averageRoi: 25
        },
        savingsBreakdown: {
          laborSavings: '75000',
          benefitsSavings: '30000',
          overheadSavings: '20000',
          totalSavings: '125000'
        },
        projectBreakdown: [
          { id: 'p1', name: 'EMR Implementation', status: 'active', budget: '200000', consultantsAssigned: 4 },
          { id: 'p2', name: 'Training Program', status: 'completed', budget: '100000', consultantsAssigned: 2 }
        ],
        consultantPerformance: [
          { consultantId: 'c1', name: 'John Doe', shiftsCompleted: 45, averageRating: 4.8 },
          { consultantId: 'c2', name: 'Jane Smith', shiftsCompleted: 38, averageRating: 4.5 }
        ]
      }
    };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: hospitalStaffUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: mockHospitalAnalytics
      }).as('getHospitalAnalytics');

      cy.visit('/analytics');
      cy.wait('@getUser');
      cy.wait('@getHospitalAnalytics');
    });

    it('should display hospital analytics for hospital_staff role', () => {
      cy.get('[data-testid="text-analytics-title"]').should('contain', 'Test Hospital Analytics');
    });

    it('should show hospital-specific KPIs', () => {
      cy.get('[data-testid="kpi-total-projects"]').should('exist');
      cy.get('[data-testid="kpi-total-budget"]').should('exist');
      cy.get('[data-testid="kpi-total-savings"]').should('exist');
      cy.get('[data-testid="kpi-average-roi"]').should('exist');
    });

    it('should display project breakdown', () => {
      cy.get('[data-testid="card-project-breakdown"]').should('exist');
      cy.get('[data-testid="card-savings-breakdown"]').should('exist');
    });
  });

  describe('Consultant Analytics', () => {
    const consultantUser = {
      id: 3,
      email: 'consultant@example.com',
      firstName: 'Test',
      lastName: 'Consultant',
      role: 'consultant'
    };

    const mockConsultantAnalytics = {
      type: 'consultant',
      data: {
        overview: {
          completedShifts: 52,
          upcomingShifts: 3,
          averageRating: 4.7,
          utilizationRate: 85
        },
        documentStatus: {
          approved: 8,
          pending: 1,
          rejected: 0,
          expired: 1,
          complianceRate: 80
        },
        skillsUtilization: [
          { skill: 'Epic EMR', projectsUsed: 5 },
          { skill: 'Cerner', projectsUsed: 3 }
        ],
        expiringDocuments: [
          { id: 'd1', name: 'HIPAA Certification', typeName: 'Certification', daysUntilExpiry: 15, expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        shiftHistory: [
          { id: 's1', projectName: 'EMR Go-Live', hospitalName: 'Test Hospital', date: new Date().toISOString(), status: 'completed' },
          { id: 's2', projectName: 'Training', hospitalName: 'Test Hospital', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' }
        ]
      }
    };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: consultantUser
      }).as('getUser');

      cy.intercept('GET', '/api/analytics/me', {
        statusCode: 200,
        body: mockConsultantAnalytics
      }).as('getConsultantAnalytics');

      cy.visit('/analytics');
      cy.wait('@getUser');
      cy.wait('@getConsultantAnalytics');
    });

    it('should display consultant analytics for consultant role', () => {
      cy.get('[data-testid="text-analytics-title"]').should('contain', 'My Analytics');
    });

    it('should show personal performance metrics', () => {
      cy.get('[data-testid="kpi-completed-shifts"]').should('exist');
      cy.get('[data-testid="kpi-average-rating"]').should('exist');
      cy.get('[data-testid="kpi-utilization-rate"]').should('exist');
      cy.get('[data-testid="kpi-compliance-rate"]').should('exist');
    });

    it('should display shift history', () => {
      cy.get('[data-testid="card-shift-history"]').should('exist');
      cy.get('[data-testid="card-skills-utilization"]').should('exist');
    });
  });

  // ===========================================================================
  // TODO: Advanced Analytics Features (Require Additional Implementation)
  // ===========================================================================

  describe('Report Builder', () => {
    it.skip('TODO: Display saved reports list', () => {});
    it.skip('TODO: Build custom report', () => {});
    it.skip('TODO: Export to CSV/Excel/PDF', () => {});
    it.skip('TODO: Schedule automated reports', () => {});
  });

  describe('Advanced Visualizations', () => {
    it.skip('TODO: Timeline & forecasting view', () => {});
    it.skip('TODO: Cost variance analytics', () => {});
    it.skip('TODO: Go-live readiness dashboard', () => {});
  });
});
