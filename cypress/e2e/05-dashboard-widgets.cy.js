describe('Dashboard Widgets and Components', () => {
  const testUser = {
    id: 'ci-test-user',
    email: 'test@example.com',
    role: 'admin'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.visit('/dashboard');
    cy.wait('@getUser');
  });

  describe('Task Management Widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/tasks/assigned-to-me', {
        statusCode: 200,
        body: [
          {
            id: 'task-1',
            title: 'Review project requirements',
            priority: 'high',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            project: 'Mayo Clinic EHR',
            status: 'in_progress'
          },
          {
            id: 'task-2',
            title: 'Approve consultant timesheets',
            priority: 'medium',
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            project: 'Cleveland Clinic',
            status: 'pending'
          }
        ]
      }).as('getMyTasks');
      
      cy.reload();
      cy.wait('@getMyTasks');
    });

    it('should display my tasks widget', () => {
      cy.get('[data-testid="my-tasks-widget"]').should('be.visible');
      cy.get('[data-testid="widget-title-my-tasks"]').should('contain.text', 'My Tasks');
    });

    it('should show task items with priorities', () => {
      cy.get('[data-testid="task-item"]').should('have.length', 2);
      cy.get('[data-testid="task-priority-high"]').should('be.visible');
      cy.get('[data-testid="task-priority-medium"]').should('be.visible');
    });

    it('should display due dates with urgency indicators', () => {
      cy.get('[data-testid="task-due-date"]').first()
        .should('contain.text', 'Due tomorrow');
      cy.get('[data-testid="task-urgent-indicator"]').should('be.visible');
    });

    it('should allow marking tasks as complete', () => {
      cy.intercept('PATCH', '/api/tasks/task-1', {
        statusCode: 200,
        body: { id: 'task-1', status: 'completed' }
      }).as('completeTask');
      
      cy.get('[data-testid="task-complete-checkbox"]').first().check();
      cy.wait('@completeTask');
      
      cy.get('[data-testid="task-item"]').first()
        .should('have.class', 'line-through opacity-50');
    });

    it('should navigate to task details on click', () => {
      cy.get('[data-testid="task-item"]').first().click();
      cy.url().should('include', '/tasks/task-1');
    });

    it('should show "View All Tasks" link', () => {
      cy.get('[data-testid="view-all-tasks"]').should('be.visible');
      cy.get('[data-testid="view-all-tasks"]').click();
      cy.url().should('include', '/tasks');
    });
  });

  describe('Project Status Widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/projects/dashboard-summary', {
        statusCode: 200,
        body: [
          {
            id: 'proj-1',
            name: 'Mayo Clinic EHR Implementation',
            status: 'in_progress',
            progress: 65,
            dueDate: '2024-03-15',
            hospital: 'Mayo Clinic',
            phase: 'Development'
          },
          {
            id: 'proj-2',
            name: 'Cleveland Clinic Training',
            status: 'planning',
            progress: 25,
            dueDate: '2024-04-01',
            hospital: 'Cleveland Clinic',
            phase: 'Planning'
          }
        ]
      }).as('getProjectSummary');
      
      cy.reload();
      cy.wait('@getProjectSummary');
    });

    it('should display project status widget', () => {
      cy.get('[data-testid="project-status-widget"]').should('be.visible');
      cy.get('[data-testid="widget-title-projects"]')
        .should('contain.text', 'Active Projects');
    });

    it('should show project cards with progress bars', () => {
      cy.get('[data-testid="project-card"]').should('have.length', 2);
      cy.get('[data-testid="project-progress-bar"]').should('have.length', 2);
      
      cy.get('[data-testid="project-progress-value"]').first()
        .should('contain.text', '65%');
    });

    it('should display project phases and status', () => {
      cy.get('[data-testid="project-phase"]').first()
        .should('contain.text', 'Development');
      cy.get('[data-testid="project-status-badge"]').first()
        .should('contain.text', 'In Progress');
    });

    it('should show hospital names and due dates', () => {
      cy.get('[data-testid="project-hospital"]').first()
        .should('contain.text', 'Mayo Clinic');
      cy.get('[data-testid="project-due-date"]').first()
        .should('contain.text', 'Mar 15, 2024');
    });

    it('should navigate to project details on click', () => {
      cy.get('[data-testid="project-card"]').first().click();
      cy.url().should('include', '/projects/proj-1');
    });

    it('should show project status indicators', () => {
      cy.get('[data-testid="status-indicator-in_progress"]')
        .should('have.class', 'bg-blue-500');
      cy.get('[data-testid="status-indicator-planning"]')
        .should('have.class', 'bg-yellow-500');
    });
  });

  describe('Calendar Widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/calendar/events/today', {
        statusCode: 200,
        body: [
          {
            id: 'event-1',
            title: 'Project Kickoff Meeting',
            start: '2024-02-15T09:00:00Z',
            end: '2024-02-15T10:30:00Z',
            type: 'meeting',
            project: 'Mayo Clinic EHR',
            attendees: 5
          },
          {
            id: 'event-2',
            title: 'Training Session',
            start: '2024-02-15T14:00:00Z',
            end: '2024-02-15T16:00:00Z',
            type: 'training',
            location: 'Conference Room A'
          }
        ]
      }).as('getTodayEvents');
      
      cy.reload();
      cy.wait('@getTodayEvents');
    });

    it('should display calendar widget with today\'s events', () => {
      cy.get('[data-testid="calendar-widget"]').should('be.visible');
      cy.get('[data-testid="widget-title-calendar"]')
        .should('contain.text', 'Today\'s Schedule');
    });

    it('should show event items with times', () => {
      cy.get('[data-testid="calendar-event"]').should('have.length', 2);
      cy.get('[data-testid="event-time"]').first()
        .should('contain.text', '9:00 AM');
    });

    it('should display event types with icons', () => {
      cy.get('[data-testid="event-icon-meeting"]').should('be.visible');
      cy.get('[data-testid="event-icon-training"]').should('be.visible');
    });

    it('should show event details and attendees', () => {
      cy.get('[data-testid="event-project"]').first()
        .should('contain.text', 'Mayo Clinic EHR');
      cy.get('[data-testid="event-attendees"]').first()
        .should('contain.text', '5 attendees');
    });

    it('should navigate to full calendar on widget click', () => {
      cy.get('[data-testid="view-full-calendar"]').click();
      cy.url().should('include', '/calendar');
    });

    it('should show empty state when no events', () => {
      cy.intercept('GET', '/api/calendar/events/today', { body: [] }).as('getNoEvents');
      cy.reload();
      cy.wait('@getNoEvents');
      
      cy.get('[data-testid="calendar-empty-state"]').should('be.visible');
      cy.get('[data-testid="calendar-empty-message"]')
        .should('contain.text', 'No events scheduled for today');
    });
  });

  describe('Team Status Widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/consultants/team-status', {
        statusCode: 200,
        body: {
          online: 24,
          away: 8,
          busy: 12,
          offline: 6,
          recentActivity: [
            {
              id: 'cons-1',
              name: 'Sarah Johnson',
              status: 'online',
              lastSeen: new Date().toISOString(),
              currentProject: 'Mayo Clinic EHR'
            },
            {
              id: 'cons-2',
              name: 'Mike Davis',
              status: 'busy',
              lastSeen: new Date(Date.now() - 1800000).toISOString(),
              currentProject: 'Cleveland Clinic'
            }
          ]
        }
      }).as('getTeamStatus');
      
      cy.reload();
      cy.wait('@getTeamStatus');
    });

    it('should display team status widget', () => {
      cy.get('[data-testid="team-status-widget"]').should('be.visible');
      cy.get('[data-testid="widget-title-team"]')
        .should('contain.text', 'Team Status');
    });

    it('should show status distribution', () => {
      cy.get('[data-testid="status-online"]').should('contain.text', '24');
      cy.get('[data-testid="status-away"]').should('contain.text', '8');
      cy.get('[data-testid="status-busy"]').should('contain.text', '12');
      cy.get('[data-testid="status-offline"]').should('contain.text', '6');
    });

    it('should display status indicators with colors', () => {
      cy.get('[data-testid="status-indicator-online"]')
        .should('have.class', 'bg-green-500');
      cy.get('[data-testid="status-indicator-busy"]')
        .should('have.class', 'bg-red-500');
    });

    it('should show recent team activity', () => {
      cy.get('[data-testid="team-member"]').should('have.length', 2);
      cy.get('[data-testid="member-name"]').first()
        .should('contain.text', 'Sarah Johnson');
      cy.get('[data-testid="member-project"]').first()
        .should('contain.text', 'Mayo Clinic EHR');
    });

    it('should display last seen timestamps', () => {
      cy.get('[data-testid="member-last-seen"]').first()
        .should('contain.text', 'Active now');
      cy.get('[data-testid="member-last-seen"]').last()
        .should('contain.text', '30 minutes ago');
    });
  });

  describe('Financial Summary Widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/analytics/financial-summary', {
        statusCode: 200,
        body: {
          monthlyRevenue: 450000,
          quarterlyRevenue: 1250000,
          yearlyRevenue: 4800000,
          outstandingInvoices: 125000,
          pendingPayments: 85000,
          profitMargin: 22.5,
          topClients: [
            { name: 'Mayo Clinic', revenue: 180000 },
            { name: 'Cleveland Clinic', revenue: 150000 },
            { name: 'Johns Hopkins', revenue: 120000 }
          ]
        }
      }).as('getFinancialSummary');
      
      cy.reload();
      cy.wait('@getFinancialSummary');
    });

    it('should display financial summary widget', () => {
      cy.get('[data-testid="financial-summary-widget"]').should('be.visible');
      cy.get('[data-testid="widget-title-financial"]')
        .should('contain.text', 'Financial Summary');
    });

    it('should show revenue metrics', () => {
      cy.get('[data-testid="monthly-revenue"]')
        .should('contain.text', '$450,000');
      cy.get('[data-testid="quarterly-revenue"]')
        .should('contain.text', '$1,250,000');
      cy.get('[data-testid="yearly-revenue"]')
        .should('contain.text', '$4,800,000');
    });

    it('should display outstanding amounts', () => {
      cy.get('[data-testid="outstanding-invoices"]')
        .should('contain.text', '$125,000');
      cy.get('[data-testid="pending-payments"]')
        .should('contain.text', '$85,000');
    });

    it('should show profit margin with indicator', () => {
      cy.get('[data-testid="profit-margin"]').should('contain.text', '22.5%');
      cy.get('[data-testid="profit-margin-indicator"]')
        .should('have.class', 'text-green-600');
    });

    it('should display top clients list', () => {
      cy.get('[data-testid="top-client"]').should('have.length', 3);
      cy.get('[data-testid="client-name"]').first()
        .should('contain.text', 'Mayo Clinic');
      cy.get('[data-testid="client-revenue"]').first()
        .should('contain.text', '$180,000');
    });
  });

  describe('System Health Widget', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/system/health', {
        statusCode: 200,
        body: {
          overallStatus: 'healthy',
          uptime: 99.8,
          responseTime: 145,
          activeUsers: 247,
          systemLoad: 0.65,
          memoryUsage: 78,
          diskUsage: 45,
          recentIncidents: [
            {
              id: 'inc-1',
              type: 'warning',
              message: 'High memory usage detected',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              resolved: true
            }
          ]
        }
      }).as('getSystemHealth');
      
      cy.reload();
      cy.wait('@getSystemHealth');
    });

    it('should display system health widget', () => {
      cy.get('[data-testid="system-health-widget"]').should('be.visible');
      cy.get('[data-testid="widget-title-system"]')
        .should('contain.text', 'System Health');
    });

    it('should show overall status indicator', () => {
      cy.get('[data-testid="system-status-healthy"]').should('be.visible');
      cy.get('[data-testid="system-status-indicator"]')
        .should('have.class', 'bg-green-500');
    });

    it('should display key metrics', () => {
      cy.get('[data-testid="system-uptime"]').should('contain.text', '99.8%');
      cy.get('[data-testid="system-response-time"]')
        .should('contain.text', '145ms');
      cy.get('[data-testid="active-users"]').should('contain.text', '247');
    });

    it('should show resource usage with progress bars', () => {
      cy.get('[data-testid="memory-usage"]').should('contain.text', '78%');
      cy.get('[data-testid="disk-usage"]').should('contain.text', '45%');
      cy.get('[data-testid="memory-progress-bar"]').should('be.visible');
      cy.get('[data-testid="disk-progress-bar"]').should('be.visible');
    });

    it('should display recent incidents', () => {
      cy.get('[data-testid="recent-incident"]').should('have.length', 1);
      cy.get('[data-testid="incident-message"]')
        .should('contain.text', 'High memory usage detected');
      cy.get('[data-testid="incident-resolved"]').should('be.visible');
    });
  });

  describe('Widget Configuration and Customization', () => {
    it('should allow removing widgets', () => {
      cy.get('[data-testid="widget-menu-my-tasks"]').click();
      cy.get('[data-testid="remove-widget"]').click();
      cy.get('[data-testid="confirm-remove"]').click();
      
      cy.get('[data-testid="my-tasks-widget"]').should('not.exist');
    });

    it('should allow adding widgets', () => {
      cy.get('[data-testid="add-widget-button"]').click();
      cy.get('[data-testid="widget-gallery"]').should('be.visible');
      cy.get('[data-testid="add-weather-widget"]').click();
      
      cy.get('[data-testid="weather-widget"]').should('be.visible');
    });

    it('should save widget preferences', () => {
      cy.intercept('POST', '/api/dashboard/widget-preferences', {
        statusCode: 200,
        body: { success: true }
      }).as('saveWidgetPrefs');
      
      cy.get('[data-testid="save-layout"]').click();
      cy.wait('@saveWidgetPrefs');
    });

    it('should allow widget resizing', () => {
      cy.get('[data-testid="widget-resize-handle-my-tasks"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 200, clientY: 100 })
        .trigger('mouseup');
      
      cy.get('[data-testid="my-tasks-widget"]')
        .should('have.class', 'widget-large');
    });

    it('should support widget drag and drop', () => {
      cy.get('[data-testid="my-tasks-widget"]')
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: 300, clientY: 200 })
        .trigger('mouseup');
      
      // Verify widget moved to new position
      cy.get('[data-testid="widget-position-0"]')
        .should('contain', '[data-testid="my-tasks-widget"]');
    });
  });

  describe('Widget Data Refresh', () => {
    it('should refresh widget data on interval', () => {
      cy.clock();
      cy.intercept('GET', '/api/tasks/assigned-to-me').as('refreshTasks');
      
      cy.tick(120000); // 2 minutes
      cy.wait('@refreshTasks');
    });

    it('should allow manual widget refresh', () => {
      cy.intercept('GET', '/api/tasks/assigned-to-me').as('manualRefresh');
      
      cy.get('[data-testid="widget-refresh-my-tasks"]').click();
      cy.wait('@manualRefresh');
      
      cy.get('[data-testid="widget-refresh-icon"]')
        .should('have.class', 'animate-spin');
    });

    it('should show last updated timestamp on widgets', () => {
      cy.get('[data-testid="widget-last-updated"]')
        .should('contain.text', 'Updated');
    });
  });

  describe('Widget Error States', () => {
    it('should handle widget data loading errors', () => {
      cy.intercept('GET', '/api/tasks/assigned-to-me', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getTasksError');
      
      cy.reload();
      cy.wait('@getTasksError');
      
      cy.get('[data-testid="widget-error-my-tasks"]').should('be.visible');
      cy.get('[data-testid="widget-retry-button"]').should('be.visible');
    });

    it('should allow retrying failed widget loads', () => {
      cy.intercept('GET', '/api/tasks/assigned-to-me', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getTasksError');
      
      cy.reload();
      cy.wait('@getTasksError');
      
      // Mock successful retry
      cy.intercept('GET', '/api/tasks/assigned-to-me', {
        statusCode: 200,
        body: []
      }).as('retryTasks');
      
      cy.get('[data-testid="widget-retry-button"]').click();
      cy.wait('@retryTasks');
      cy.get('[data-testid="my-tasks-widget"]').should('be.visible');
    });

    it('should show network error states', () => {
      cy.intercept('GET', '/api/tasks/assigned-to-me', {
        forceNetworkError: true
      }).as('networkError');
      
      cy.reload();
      
      cy.get('[data-testid="widget-network-error"]').should('be.visible');
      cy.get('[data-testid="network-error-message"]')
        .should('contain.text', 'Unable to connect');
    });
  });
});
