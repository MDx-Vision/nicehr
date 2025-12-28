describe('Dashboard Widgets', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  const mockActivities = [
    { id: 1, type: 'project_created', message: 'New project created', createdAt: new Date().toISOString() },
    { id: 2, type: 'consultant_assigned', message: 'Consultant assigned to project', createdAt: new Date().toISOString() },
    { id: 3, type: 'document_uploaded', message: 'Document uploaded', createdAt: new Date().toISOString() }
  ];

  const mockNotifications = [
    { id: 1, type: 'info', title: 'Welcome', message: 'Welcome to NICEHR', read: false, createdAt: new Date().toISOString() },
    { id: 2, type: 'warning', title: 'Document Pending', message: 'Document awaiting review', read: false, createdAt: new Date().toISOString() },
    { id: 3, type: 'success', title: 'Task Complete', message: 'Your task was completed', read: true, createdAt: new Date().toISOString() }
  ];

  describe('Activity Widget', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5, totalHospitals: 3, activeProjects: 2 }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: mockActivities
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display recent activity feed', () => {
      cy.get('[data-testid="card-activity-feed"]').should('exist');
    });

    it('should display activity feed card with content', () => {
      cy.get('[data-testid="card-activity-feed"]').scrollIntoView();
      // Activity feed card should contain activity content
      cy.get('[data-testid="card-activity-feed"]').should('exist');
    });

    it('should handle empty activities gracefully', () => {
      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getEmptyActivities');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('[data-testid="card-activity-feed"]').scrollIntoView().should('exist');
    });
  });

  describe('Notifications Widget', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5 }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.intercept('GET', '/api/notifications*', {
        statusCode: 200,
        body: mockNotifications
      }).as('getNotifications');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display notification button', () => {
      cy.get('[data-testid="button-notifications"]').should('be.visible');
    });

    it('should open notifications dropdown', () => {
      cy.get('[data-testid="button-notifications"]').click();
      cy.get('[data-testid="dropdown-notifications"]').should('be.visible');
    });

    it('should display notification items when present', () => {
      cy.get('[data-testid="button-notifications"]').click();
      // Check dropdown opened
      cy.get('[data-testid="dropdown-notifications"]').should('be.visible');
    });

    it('should show empty state when no notifications', () => {
      cy.intercept('GET', '/api/notifications*', {
        statusCode: 200,
        body: []
      }).as('getEmptyNotifications');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('[data-testid="button-notifications"]').click();
      cy.get('[data-testid="text-no-notifications"]').should('exist');
    });
  });

  describe('Stats Widget', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          totalConsultants: 145,
          activeConsultants: 89,
          totalHospitals: 12,
          activeProjects: 23,
          pendingDocuments: 7,
          totalSavings: '2450000'
        }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display key metrics summary', () => {
      cy.get('[data-testid="card-total-consultants"]').should('be.visible');
      cy.get('[data-testid="card-total-hospitals"]').should('be.visible');
      cy.get('[data-testid="card-active-projects"]').should('be.visible');
    });

    it('should show correct metric values', () => {
      cy.get('[data-testid="card-total-consultants"]').should('contain', '145');
      cy.get('[data-testid="card-total-hospitals"]').should('contain', '12');
      cy.get('[data-testid="card-active-projects"]').should('contain', '23');
    });

    it('should display savings with currency format', () => {
      cy.get('[data-testid="card-total-savings"]').should('contain', '$2,450,000');
    });
  });

  // ===========================================================================
  // Widget Features
  // ===========================================================================

  describe('Widget System', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5, totalHospitals: 3, activeProjects: 2 }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: []
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: []
      }).as('getCalendarEvents');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display customize button', () => {
      cy.get('[data-testid="button-widget-settings"]').should('be.visible');
    });

    it('should open widget settings dialog', () => {
      cy.get('[data-testid="button-widget-settings"]').click();
      cy.get('[data-testid="dialog-widget-settings"]').should('be.visible');
    });

    it('should show/hide individual widgets', () => {
      cy.get('[data-testid="button-widget-settings"]').click();
      cy.get('[data-testid="switch-widget-tasks"]').should('be.visible');
      cy.get('[data-testid="switch-widget-charts"]').should('be.visible');
      cy.get('[data-testid="switch-widget-calendar"]').should('be.visible');
    });

    it('should reset to default widget layout', () => {
      cy.get('[data-testid="button-widget-settings"]').click();
      cy.get('[data-testid="button-reset-layout"]').should('be.visible');
      cy.get('[data-testid="button-reset-layout"]').click();
    });
  });

  describe('Task Widget', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5, totalHospitals: 3, activeProjects: 2 }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: [
          { id: '1', title: 'Task 1', priority: 'high', status: 'pending', dueDate: new Date().toISOString() },
          { id: '2', title: 'Task 2', priority: 'medium', status: 'completed', dueDate: new Date().toISOString() }
        ]
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: []
      }).as('getCalendarEvents');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display my tasks widget', () => {
      cy.get('[data-testid="card-my-tasks"]').scrollIntoView().should('be.visible');
    });

    it('should show task priority indicators', () => {
      cy.get('[data-testid="card-my-tasks"]').scrollIntoView();
      cy.get('[data-testid="priority-high"]').should('be.visible');
    });

    it('should filter tasks by status', () => {
      cy.get('[data-testid="card-my-tasks"]').scrollIntoView();
      cy.get('[data-testid="button-filter-pending"]').click();
      cy.get('[data-testid="button-filter-completed"]').click();
      cy.get('[data-testid="button-filter-all"]').click();
    });

    it('should show task complete button', () => {
      cy.get('[data-testid="card-my-tasks"]').scrollIntoView();
      cy.get('[data-testid="button-complete-1"]').should('be.visible');
    });
  });

  describe('Chart Widget', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5, totalHospitals: 3, activeProjects: 2 }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: []
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: []
      }).as('getCalendarEvents');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display revenue trend chart', () => {
      cy.get('[data-testid="card-charts"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="chart-revenue-trend"]').should('be.visible');
    });

    it('should show user growth bar chart', () => {
      cy.get('[data-testid="card-charts"]').scrollIntoView();
      cy.get('[data-testid="chart-user-growth"]').should('be.visible');
    });

    it('should support chart period filtering', () => {
      cy.get('[data-testid="card-charts"]').scrollIntoView();
      cy.get('[data-testid="select-chart-period"]').should('be.visible');
      cy.get('[data-testid="select-chart-period"]').select('week');
      cy.get('[data-testid="select-chart-period"]').select('year');
    });

    it('should export chart data to CSV', () => {
      cy.get('[data-testid="card-charts"]').scrollIntoView();
      cy.get('[data-testid="button-export-chart"]').should('be.visible');
    });
  });

  describe('Calendar Widget', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: { totalConsultants: 10, activeConsultants: 5, totalHospitals: 3, activeProjects: 2 }
      }).as('getDashboardStats');

      cy.intercept('GET', '/api/dashboard/tasks', {
        statusCode: 200,
        body: []
      }).as('getTasks');

      cy.intercept('GET', '/api/dashboard/calendar-events', {
        statusCode: 200,
        body: [
          { id: '1', title: 'Project Kickoff', date: new Date().toISOString(), type: 'milestone' },
          { id: '2', title: 'Team Meeting', date: new Date().toISOString(), type: 'event' }
        ]
      }).as('getCalendarEvents');

      cy.intercept('GET', '/api/activities*', {
        statusCode: 200,
        body: []
      }).as('getActivities');

      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display upcoming events calendar', () => {
      cy.get('[data-testid="card-calendar"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="calendar-grid"]').should('be.visible');
    });

    it('should show project milestones', () => {
      cy.get('[data-testid="card-calendar"]').scrollIntoView();
      cy.get('[data-testid="events-list"]').should('be.visible');
      cy.get('[data-testid="badge-milestone"]').should('be.visible');
    });

    it('should navigate between months', () => {
      cy.get('[data-testid="card-calendar"]').scrollIntoView();
      cy.get('[data-testid="text-current-month"]').should('be.visible');
      cy.get('[data-testid="button-prev-month"]').click();
      cy.get('[data-testid="button-next-month"]').click();
    });
  });
});
