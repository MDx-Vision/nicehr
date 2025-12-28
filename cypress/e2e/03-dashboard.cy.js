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
    it.skip('TODO: Revenue trends chart with Recharts', () => {});
    it.skip('TODO: User growth bar chart', () => {});
    it.skip('TODO: Performance metrics gauges', () => {});
    it.skip('TODO: Chart period filtering (7d, 30d, custom)', () => {});
    it.skip('TODO: Export chart data to CSV', () => {});
  });

  describe('Real-time Features', () => {
    it.skip('TODO: WebSocket integration for live stats', () => {});
    it.skip('TODO: Live activity feed updates', () => {});
    it.skip('TODO: Real-time notification badges', () => {});
  });

  describe('Dashboard Customization', () => {
    it.skip('TODO: Widget reordering with drag and drop', () => {});
    it.skip('TODO: Show/hide widgets panel', () => {});
    it.skip('TODO: Save layout preferences', () => {});
    it.skip('TODO: Reset to default layout', () => {});
  });
});
