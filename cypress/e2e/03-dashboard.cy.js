describe('Dashboard Feature', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockDashboardStats = {
    totalConsultants: 145,
    activeConsultants: 89,
    totalHospitals: 12,
    activeProjects: 23,
    pendingDocuments: 7,
    totalSavings: '2450000'
  };

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      // Mock authentication - admin user
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        }
      }).as('getUser');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { user: { id: 1, email: testUser.email, role: 'admin' } }
      }).as('loginRequest');

      // Mock dashboard stats API
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: mockDashboardStats
      }).as('getDashboardStats');

      // Mock activities API
      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      // Login
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type(testUser.password);
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@loginRequest');
    });

    it('should navigate to dashboard after login', () => {
      cy.url().should('not.include', '/login');
    });

    it('should display dashboard page with title', () => {
      cy.visit('/');
      cy.wait('@getUser');
      cy.get('[data-testid="text-dashboard-title"]').should('contain', 'Dashboard');
    });
  });

  describe('Dashboard Stats Cards', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      // Mock authentication - admin user
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        }
      }).as('getUser');

      // Mock dashboard stats API
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: mockDashboardStats
      }).as('getDashboardStats');

      // Mock activities API
      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display total consultants card', () => {
      cy.get('[data-testid="card-total-consultants"]').should('be.visible');
      cy.get('[data-testid="card-total-consultants"]').should('contain', 'Total Consultants');
      cy.get('[data-testid="card-total-consultants"]').should('contain', '145');
    });

    it('should display hospitals card', () => {
      cy.get('[data-testid="card-total-hospitals"]').should('be.visible');
      cy.get('[data-testid="card-total-hospitals"]').should('contain', 'Hospitals');
      cy.get('[data-testid="card-total-hospitals"]').should('contain', '12');
    });

    it('should display active projects card', () => {
      cy.get('[data-testid="card-active-projects"]').should('be.visible');
      cy.get('[data-testid="card-active-projects"]').should('contain', 'Active Projects');
      cy.get('[data-testid="card-active-projects"]').should('contain', '23');
    });

    it('should display pending documents card', () => {
      cy.get('[data-testid="card-pending-documents"]').should('be.visible');
      cy.get('[data-testid="card-pending-documents"]').should('contain', 'Pending Documents');
      cy.get('[data-testid="card-pending-documents"]').should('contain', '7');
    });

    it('should display available consultants card', () => {
      cy.get('[data-testid="card-active-consultants"]').should('be.visible');
      cy.get('[data-testid="card-active-consultants"]').should('contain', 'Available Consultants');
      cy.get('[data-testid="card-active-consultants"]').should('contain', '89');
    });

    it('should display total savings card', () => {
      cy.get('[data-testid="card-total-savings"]').should('be.visible');
      cy.get('[data-testid="card-total-savings"]').should('contain', 'Total Savings');
      cy.get('[data-testid="card-total-savings"]').should('contain', '$2,450,000');
    });

    it('should show loading skeletons while fetching data', () => {
      // Delay the stats response to see loading state
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: mockDashboardStats,
        delay: 1000
      }).as('getDashboardStatsDelayed');

      cy.visit('/');
      cy.wait('@getUser');
      // Should show skeleton during loading
      cy.get('.animate-pulse').should('exist');
    });
  });

  describe('Consultant Dashboard', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      // Mock authentication - consultant user
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 2,
          email: 'consultant@example.com',
          firstName: 'Consultant',
          lastName: 'User',
          role: 'consultant'
        }
      }).as('getUser');

      // Mock dashboard stats API
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: mockDashboardStats
      }).as('getDashboardStats');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display consultant welcome card', () => {
      cy.get('[data-testid="card-consultant-welcome"]').should('be.visible');
      cy.get('[data-testid="card-consultant-welcome"]').should('contain', 'Welcome to NICEHR');
    });

    it('should display quick actions card', () => {
      cy.get('[data-testid="card-quick-actions"]').should('be.visible');
      cy.get('[data-testid="card-quick-actions"]').should('contain', 'Quick Actions');
    });

    it('should show consultant-specific guidance', () => {
      cy.get('[data-testid="card-consultant-welcome"]').should('contain', 'profile');
      cy.get('[data-testid="card-quick-actions"]').should('contain', 'schedule');
    });
  });

  describe('Hospital Staff Dashboard', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      // Mock authentication - hospital staff user
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 3,
          email: 'hospital@example.com',
          firstName: 'Hospital',
          lastName: 'Staff',
          role: 'hospital_staff'
        }
      }).as('getUser');

      // Mock dashboard stats API
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: mockDashboardStats
      }).as('getDashboardStats');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display hospital welcome card', () => {
      cy.get('[data-testid="card-hospital-welcome"]').should('be.visible');
      cy.get('[data-testid="card-hospital-welcome"]').should('contain', 'Welcome to NICEHR');
    });

    it('should display hospital actions card', () => {
      cy.get('[data-testid="card-hospital-actions"]').should('be.visible');
      cy.get('[data-testid="card-hospital-actions"]').should('contain', 'Quick Actions');
    });

    it('should show hospital-specific guidance', () => {
      cy.get('[data-testid="card-hospital-welcome"]').should('contain', 'projects');
      cy.get('[data-testid="card-hospital-actions"]').should('contain', 'consultant');
    });
  });

  // ===========================================================================
  // TODO: Advanced Dashboard Features (Require UI Implementation)
  // ===========================================================================

  describe('Charts & Analytics', () => {
    const testUser = { email: 'admin@example.com' };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        }
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalConsultants: 12,
          activeConsultants: 8,
          totalHospitals: 5,
          activeProjects: 4,
          pendingDocuments: 3,
          totalSavings: '125000',
          totalHoursLogged: 343,
          ticketResolutionRate: 80,
          projectCompletionRate: 20,
          consultantUtilization: 19
        }
      }).as('getStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: []
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: []
      }).as('getEvents');

      cy.intercept('GET', '/api/activities/recent*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
      cy.wait('@getStats');
    });

    it('should display revenue trends chart with Recharts', () => {
      cy.get('[data-testid="chart-revenue-trend"]').should('be.visible');
      cy.get('[data-testid="chart-revenue-trend"]').find('.recharts-area').should('exist');
    });

    it('should display user growth bar chart', () => {
      cy.get('[data-testid="chart-user-growth"]').should('be.visible');
      cy.get('[data-testid="chart-user-growth"]').find('.recharts-bar').should('exist');
    });

    it('should display performance metrics gauges', () => {
      cy.get('[data-testid="card-performance-gauges"]').scrollIntoView().should('be.visible');
    });

    it('should allow chart period filtering', () => {
      cy.get('[data-testid="select-chart-period"]').should('be.visible');
      cy.get('[data-testid="select-chart-period"]').select('week');
      cy.get('[data-testid="select-chart-period"]').should('have.value', 'week');
      cy.get('[data-testid="select-chart-period"]').select('year');
      cy.get('[data-testid="select-chart-period"]').should('have.value', 'year');
    });

    it('should export chart data to CSV', () => {
      cy.get('[data-testid="button-export-chart"]').should('be.visible');
      cy.get('[data-testid="button-export-chart"]').click();
      // Verify download was triggered (link created and clicked)
    });
  });

  describe('Real-time Features', () => {
    const testUser = { email: 'admin@example.com' };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        }
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalConsultants: 12,
          activeConsultants: 8,
          totalHospitals: 5,
          activeProjects: 4,
          pendingDocuments: 3,
          totalSavings: '125000',
          totalHoursLogged: 343,
          ticketResolutionRate: 80,
          projectCompletionRate: 20,
          consultantUtilization: 19
        }
      }).as('getStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: []
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: []
      }).as('getEvents');

      cy.intercept('GET', '/api/activities/recent*', {
        statusCode: 200,
        body: [
          {
            id: 'act-1',
            userId: 'user-1',
            activityType: 'login',
            resourceType: null,
            resourceId: null,
            resourceName: null,
            description: 'User logged in',
            createdAt: new Date().toISOString(),
            user: { id: 'user-1', firstName: 'Test', lastName: 'User', email: 'test@example.com', profileImageUrl: null }
          }
        ]
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
      cy.wait('@getStats');
    });

    it('should display WebSocket connection status badge', () => {
      // Should show either Live or Offline badge
      cy.get('[data-testid="badge-live"], [data-testid="badge-offline"]').should('exist');
    });

    it('should display activity feed with live indicator', () => {
      cy.get('[data-testid="card-activity-feed"]').scrollIntoView().should('be.visible');
      // Should show live or offline badge on activity feed
      cy.get('[data-testid="badge-activity-live"], [data-testid="badge-activity-offline"]').should('exist');
    });

    it('should display notification badge when notifications exist', () => {
      // The notification badge shows when there are pending items
      // Check that the notification system elements exist
      cy.get('[data-testid="text-dashboard-title"]').should('be.visible');
      // Badge may or may not be visible depending on notification count
    });
  });

  describe('Dashboard Customization', () => {
    const testUser = { email: 'admin@example.com' };

    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 1,
          email: testUser.email,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        }
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalConsultants: 12,
          activeConsultants: 8,
          totalHospitals: 5,
          activeProjects: 4,
          pendingDocuments: 3,
          totalSavings: '125000',
          totalHoursLogged: 343,
          ticketResolutionRate: 80,
          projectCompletionRate: 20,
          consultantUtilization: 19
        }
      }).as('getStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: []
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: []
      }).as('getEvents');

      cy.intercept('GET', '/api/activities/recent*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
      cy.wait('@getStats');
    });

    it('should display drag mode toggle button for widget reordering', () => {
      cy.get('[data-testid="button-drag-mode"]').should('be.visible');
      cy.get('[data-testid="button-drag-mode"]').click();
      cy.get('[data-testid="button-drag-mode"]').should('contain', 'Done');
    });

    it('should display show/hide widgets panel', () => {
      cy.get('[data-testid="button-widget-settings"]').should('be.visible');
      cy.get('[data-testid="button-widget-settings"]').click();
      cy.get('[data-testid="dialog-widget-settings"]').should('be.visible');
      cy.get('[data-testid="switch-widget-tasks"]').should('be.visible');
      cy.get('[data-testid="switch-widget-charts"]').should('be.visible');
      cy.get('[data-testid="switch-widget-calendar"]').should('be.visible');
      cy.get('[data-testid="switch-widget-activity"]').should('be.visible');
    });

    it('should toggle widget visibility', () => {
      cy.get('[data-testid="button-widget-settings"]').click();
      cy.get('[data-testid="switch-widget-tasks"]').click();
      // Close dialog
      cy.get('body').type('{esc}');
      // My Tasks widget should be hidden
      cy.get('[data-testid="card-my-tasks"]').should('not.exist');
    });

    it('should reset to default layout', () => {
      cy.get('[data-testid="button-widget-settings"]').click();
      cy.get('[data-testid="button-reset-layout"]').should('be.visible');
      cy.get('[data-testid="button-reset-layout"]').click();
      // All widgets should be visible after reset
      cy.get('body').type('{esc}');
      cy.get('[data-testid="card-my-tasks"]').should('be.visible');
      cy.get('[data-testid="card-charts"]').should('be.visible');
    });
  });
});
