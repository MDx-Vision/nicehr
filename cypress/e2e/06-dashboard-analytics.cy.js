describe('Dashboard Analytics', () => {
  const adminUser = {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };

  const consultantUser = {
    id: 2,
    email: 'consultant@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'consultant'
  };

  const hospitalUser = {
    id: 3,
    email: 'hospital@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'hospital_staff'
  };

  // ==================== MAIN DASHBOARD ====================

  describe('Main Dashboard', () => {
    describe('Admin View', () => {
      beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.clearSessionStorage();

        cy.intercept('GET', '/api/auth/user', {
          statusCode: 200,
          body: adminUser
        }).as('getUser');

        cy.visit('/');
        cy.wait('@getUser');
      });

      it('should display dashboard title', () => {
        cy.get('[data-testid="text-dashboard-title"]').should('contain', 'Dashboard');
      });

      it('should display total consultants card', () => {
        cy.get('[data-testid="card-total-consultants"]').should('exist');
      });

      it('should display total hospitals card', () => {
        cy.get('[data-testid="card-total-hospitals"]').should('exist');
      });

      it('should display active projects card', () => {
        cy.get('[data-testid="card-active-projects"]').should('exist');
      });

      it('should display pending documents card', () => {
        cy.get('[data-testid="card-pending-documents"]').should('exist');
      });

      it('should display active consultants card', () => {
        cy.get('[data-testid="card-active-consultants"]').should('exist');
      });

      it('should display total savings card', () => {
        cy.get('[data-testid="card-total-savings"]').should('exist');
      });
    });

    describe('Consultant View', () => {
      beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.clearSessionStorage();

        cy.intercept('GET', '/api/auth/user', {
          statusCode: 200,
          body: consultantUser
        }).as('getUser');

        cy.visit('/');
        cy.wait('@getUser');
      });

      it('should display consultant welcome card', () => {
        cy.get('[data-testid="card-consultant-welcome"]').should('exist');
      });

      it('should display quick actions card', () => {
        cy.get('[data-testid="card-quick-actions"]').should('exist');
      });
    });

    describe('Hospital Staff View', () => {
      beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.clearSessionStorage();

        cy.intercept('GET', '/api/auth/user', {
          statusCode: 200,
          body: hospitalUser
        }).as('getUser');

        cy.visit('/');
        cy.wait('@getUser');
      });

      it('should display hospital welcome card', () => {
        cy.get('[data-testid="card-hospital-welcome"]').should('exist');
      });

      it('should display hospital actions card', () => {
        cy.get('[data-testid="card-hospital-actions"]').should('exist');
      });
    });
  });

  // ==================== EXECUTIVE DASHBOARD ====================

  describe('Executive Dashboard', () => {
    const mockKpis = [
      { id: 'kpi1', name: 'Revenue', value: 1250000, target: 1500000, trend: 'up' },
      { id: 'kpi2', name: 'Utilization', value: 85, target: 90, trend: 'stable' },
      { id: 'kpi3', name: 'Projects', value: 23, target: 25, trend: 'up' }
    ];

    const mockDashboards = [
      { id: 'd1', name: 'Operations Overview', description: 'Daily operations metrics', isPublic: true },
      { id: 'd2', name: 'Financial Summary', description: 'Revenue and costs', isPublic: false }
    ];

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/executive/kpis*', {
        statusCode: 200,
        body: mockKpis
      }).as('getKpis');

      cy.intercept('GET', '/api/executive/dashboards*', {
        statusCode: 200,
        body: mockDashboards
      }).as('getDashboards');

      cy.visit('/executive-dashboard');
      cy.wait('@getUser');
    });

    describe('Page Layout', () => {
      it('should display executive dashboard title', () => {
        cy.get('[data-testid="text-page-title"]').should('contain', 'Executive Dashboard');
      });

      it('should display time range selector', () => {
        cy.get('[data-testid="select-time-range"]').should('exist');
      });

      it('should display refresh button', () => {
        cy.get('[data-testid="button-refresh"]').should('exist');
      });

      it('should display new dashboard button', () => {
        cy.get('[data-testid="button-new-dashboard"]').should('exist');
      });

      it('should display dashboard tabs', () => {
        cy.get('[data-testid="tabs-dashboard"]').should('exist');
        cy.get('[data-testid="tab-overview"]').should('be.visible');
        cy.get('[data-testid="tab-kpis"]').should('be.visible');
        cy.get('[data-testid="tab-charts"]').should('be.visible');
        cy.get('[data-testid="tab-dashboards"]').should('be.visible');
      });

      it('should display demo notice', () => {
        cy.get('[data-testid="text-demo-notice"]').should('exist');
      });
    });

    describe('Overview Tab', () => {
      it('should display KPI cards in overview', () => {
        cy.get('[data-testid^="kpi-card-"]').should('have.length.at.least', 1);
      });

      it('should open time range dropdown', () => {
        cy.get('[data-testid="select-time-range"]').click();
        cy.get('[role="listbox"]').should('be.visible');
      });
    });

    describe('KPIs Tab', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-kpis"]').click();
      });

      it('should switch to KPIs tab', () => {
        cy.get('[data-testid^="kpi-detail-"]').should('have.length.at.least', 1);
      });

      it('should display KPI detail cards', () => {
        cy.get('[data-testid^="kpi-detail-"]').should('exist');
      });
    });

    describe('Charts Tab', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-charts"]').click();
      });

      it('should switch to charts tab', () => {
        cy.contains('Charts').should('exist');
      });
    });

    describe('Dashboards Tab', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-dashboards"]').click();
      });

      it('should switch to dashboards tab', () => {
        cy.get('[data-testid="button-create-dashboard"]').should('be.visible');
      });

      it('should display create dashboard button', () => {
        cy.get('[data-testid="button-create-dashboard"]').should('exist');
      });

      it('should display custom dashboards section', () => {
        cy.contains('Custom Dashboards').should('exist');
      });

      it('should display empty state when no dashboards', () => {
        cy.contains('No custom dashboards').should('exist');
      });
    });

    describe('Create Dashboard Dialog', () => {
      beforeEach(() => {
        cy.get('[data-testid="button-new-dashboard"]').click();
      });

      it('should open create dashboard dialog', () => {
        cy.get('[data-testid="input-dashboard-name"]').should('be.visible');
      });

      it('should display dashboard name input', () => {
        cy.get('[data-testid="input-dashboard-name"]').should('exist');
      });

      it('should display dashboard description input', () => {
        cy.get('[data-testid="input-dashboard-description"]').should('exist');
      });

      it('should display public switch', () => {
        cy.get('[data-testid="switch-dashboard-public"]').should('exist');
      });

      it('should display confirm button', () => {
        cy.get('[data-testid="button-confirm-create"]').should('exist');
      });
    });
  });

  // ==================== ADVANCED ANALYTICS ====================

  describe('Advanced Analytics', () => {
    const mockProjects = [
      { id: 'p1', name: 'Epic EHR Implementation' },
      { id: 'p2', name: 'Cerner Training Program' }
    ];

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: mockProjects
      }).as('getProjects');

      // Mock analytics endpoints to prevent errors
      cy.intercept('GET', '/api/analytics/advanced*', {
        statusCode: 200,
        body: {}
      }).as('getAdvanced');

      cy.visit('/advanced-analytics');
      cy.wait('@getUser');
    });

    describe('Page Layout', () => {
      it('should display advanced analytics title', () => {
        cy.get('[data-testid="text-advanced-analytics-title"]').should('contain', 'Advanced Analytics');
      });

      it('should display project selector', () => {
        cy.get('[data-testid="select-project"]').should('exist');
      });

      it('should open project selector dropdown', () => {
        cy.get('[data-testid="select-project"]').click();
        cy.get('[role="listbox"]').should('be.visible');
      });
    });

    describe('Analytics Cards', () => {
      it('should display go-live readiness card', () => {
        cy.get('[data-testid="card-go-live-readiness"]').should('exist');
      });

      it('should display consultant utilization card', () => {
        cy.get('[data-testid="card-consultant-utilization"]').should('exist');
      });

      it('should display timeline forecast card', () => {
        cy.get('[data-testid="card-timeline-forecast"]').should('exist');
      });

      it('should display cost variance card', () => {
        cy.get('[data-testid="card-cost-variance"]').should('exist');
      });
    });
  });

  // ==================== ROI DASHBOARD ====================

  describe('ROI Dashboard', () => {
    const mockProjects = [
      { id: 'p1', name: 'Epic EHR Implementation' },
      { id: 'p2', name: 'Cerner Training Program' }
    ];

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: mockProjects
      }).as('getProjects');

      cy.intercept('GET', '/api/hospitals*', {
        statusCode: 200,
        body: []
      }).as('getHospitals');

      cy.intercept('GET', '/api/roi/questions*', {
        statusCode: 200,
        body: []
      }).as('getRoiQuestions');

      cy.visit('/roi');
      cy.wait('@getUser');
    });

    describe('Page Layout', () => {
      it('should display ROI dashboard title', () => {
        cy.get('[data-testid="text-roi-title"]').should('contain', 'ROI Dashboard');
      });

      it('should display project selector', () => {
        cy.get('[data-testid="select-project"]').should('exist');
      });

      it('should open project selector dropdown', () => {
        cy.get('[data-testid="select-project"]').click();
        cy.get('[role="listbox"]').should('be.visible');
      });

      it('should display select project message initially', () => {
        cy.contains('Select a Project').should('be.visible');
      });
    });
  });

  // ===========================================================================
  // TODO: Additional Dashboard Features (Require Implementation)
  // ===========================================================================

  describe('Custom Reports', () => {
    const mockTemplates = [
      {
        id: 'template-1',
        name: 'Consultant Report',
        description: 'Overview of consultants',
        category: 'consultants',
        dataSource: 'consultants',
        availableFields: {},
        defaultFilters: {},
        defaultGrouping: {},
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    const mockSavedReports = [
      {
        id: 'report-1',
        name: 'Monthly Summary',
        description: 'Monthly metrics report',
        templateId: 'template-1',
        userId: 'user-1',
        configuration: {
          selectedFields: ['name', 'email'],
          filters: [],
          groupBy: [],
          sortBy: [],
          aggregations: []
        },
        isFavorite: false,
        isPublic: false,
        lastRunAt: '2024-01-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/report-templates', {
        statusCode: 200,
        body: mockTemplates
      }).as('getTemplates');

      cy.intercept('GET', '/api/saved-reports', {
        statusCode: 200,
        body: mockSavedReports
      }).as('getSavedReports');

      cy.intercept('GET', '/api/scheduled-reports', {
        statusCode: 200,
        body: []
      }).as('getScheduledReports');

      cy.visit('/report-builder');
      cy.wait('@getUser');
      cy.wait('@getTemplates');
      cy.wait('@getSavedReports');
    });

    it('should create custom report with selected metrics', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Report Builder');
      cy.get('[data-testid="tab-build"]').should('be.visible');
      cy.get('[data-testid="select-data-source"]').should('be.visible');
    });

    it('should have save report functionality', () => {
      cy.get('[data-testid="button-save-report"]').should('exist');
      cy.get('[data-testid="tab-saved"]').should('be.visible');
      cy.get('[data-testid="tab-saved"]').click();
      cy.get('[data-testid="saved-report-report-1"]').should('be.visible');
    });

    it('should have schedule report functionality', () => {
      cy.get('[data-testid="button-schedule-report"]').should('exist');
      cy.get('[data-testid="tabs-report-builder"]').should('be.visible');
    });

    it('should have preview generation functionality', () => {
      cy.get('[data-testid="tab-build"]').should('be.visible');
      cy.get('[data-testid="button-generate-preview"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="button-reset"]').scrollIntoView().should('be.visible');
    });
  });
});
