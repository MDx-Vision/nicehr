describe('Dashboard Feature', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    adminEmail: 'admin@test.com'
  };

  const mockDashboardStats = {
    totalConsultants: 145,
    activeProjects: 23,
    totalHospitals: 12,
    totalRevenue: 2450000,
    consultantsAvailable: 89,
    projectsInProgress: 18,
    projectsCompleted: 5,
    upcomingDeadlines: 7,
    recentActivities: [
      {
        id: 1,
        type: 'project_created',
        description: 'New project created at General Hospital',
        timestamp: new Date().toISOString(),
        user: 'John Doe'
      }
    ],
    performanceMetrics: {
      consultantUtilization: 78.5,
      projectSuccessRate: 94.2,
      averageProjectDuration: 120,
      clientSatisfaction: 4.7
    }
  };

  const mockAnalytics = {
    platform: {
      userGrowth: [
        { month: 'Jan', users: 120, projects: 15 },
        { month: 'Feb', users: 135, projects: 18 },
        { month: 'Mar', users: 145, projects: 23 }
      ],
      revenue: [
        { month: 'Jan', revenue: 180000 },
        { month: 'Feb', revenue: 220000 },
        { month: 'Mar', revenue: 245000 }
      ]
    }
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: { 
        id: 1, 
        email: testUser.email, 
        name: 'Test User',
        role: 'admin'
      }
    }).as('getUser');

    // Mock dashboard stats API
    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: mockDashboardStats
    }).as('getDashboardStats');

    // Mock analytics APIs
    cy.intercept('GET', '/api/analytics/platform', {
      statusCode: 200,
      body: mockAnalytics.platform
    }).as('getPlatformAnalytics');

    cy.intercept('GET', '/api/activities/recent', {
      statusCode: 200,
      body: mockDashboardStats.recentActivities
    }).as('getRecentActivities');

    // Login first
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testUser.email);
    cy.get('[data-testid="input-password"]').type(testUser.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Navigate to dashboard
    cy.url().should('not.include', '/login');
    cy.visit('/dashboard');
  });

  describe('Dashboard Page Load and Initial State', () => {
    it('should load dashboard and display all main sections', () => {
      cy.wait('@getDashboardStats');
      
      // Check main dashboard container
      cy.get('[data-testid="dashboard-container"]').should('be.visible');
      
      // Check header section
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
      cy.get('[data-testid="dashboard-title"]')
        .should('be.visible')
        .and('contain.text', 'Dashboard');
      
      // Check stats cards section
      cy.get('[data-testid="stats-section"]').should('be.visible');
      
      // Check charts section
      cy.get('[data-testid="charts-section"]').should('be.visible');
      
      // Check recent activities section
      cy.get('[data-testid="activities-section"]').should('be.visible');
    });

    it('should show loading state initially', () => {
      // Intercept with delay to test loading state
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: mockDashboardStats,
        delay: 2000
      }).as('getSlowStats');
      
      cy.visit('/dashboard');
      
      // Should show loading indicators
      cy.get('[data-testid="stats-loading"]').should('be.visible');
      cy.get('[data-testid="charts-loading"]').should('be.visible');
      
      cy.wait('@getSlowStats');
      
      // Loading should disappear
      cy.get('[data-testid="stats-loading"]').should('not.exist');
      cy.get('[data-testid="charts-loading"]').should('not.exist');
    });

    it('should handle dashboard stats API error gracefully', () => {
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getStatsError');
      
      cy.visit('/dashboard');
      cy.wait('@getStatsError');
      
      // Should show error state
      cy.get('[data-testid="dashboard-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'Unable to load dashboard data');
      
      // Should show retry button
      cy.get('[data-testid="retry-button"]').should('be.visible').click();
      cy.wait('@getStatsError');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.wait('@getDashboardStats');
      
      // Check mobile layout
      cy.get('[data-testid="dashboard-container"]').should('be.visible');
      cy.get('[data-testid="stats-section"]')
        .should('have.class', 'grid-cols-1')
        .or('have.class', 'grid-cols-2');
      
      // Check that charts are responsive
      cy.get('[data-testid="chart-container"]').each(($chart) => {
        cy.wrap($chart).should('have.css', 'width').and('not.eq', '0px');
      });
    });
  });

  describe('Statistics Cards', () => {
    beforeEach(() => {
      cy.wait('@getDashboardStats');
    });

    it('should display all key statistics correctly', () => {
      // Total consultants card
      cy.get('[data-testid="stat-total-consultants"]').should('be.visible');
      cy.get('[data-testid="stat-total-consultants"] [data-testid="stat-value"]')
        .should('contain.text', '145');
      cy.get('[data-testid="stat-total-consultants"] [data-testid="stat-label"]')
        .should('contain.text', 'Total Consultants');
      
      // Active projects card
      cy.get('[data-testid="stat-active-projects"]').should('be.visible');
      cy.get('[data-testid="stat-active-projects"] [data-testid="stat-value"]')
        .should('contain.text', '23');
      cy.get('[data-testid="stat-active-projects"] [data-testid="stat-label"]')
        .should('contain.text', 'Active Projects');
      
      // Total hospitals card
      cy.get('[data-testid="stat-total-hospitals"]').should('be.visible');
      cy.get('[data-testid="stat-total-hospitals"] [data-testid="stat-value"]')
        .should('contain.text', '12');
      
      // Total revenue card
      cy.get('[data-testid="stat-total-revenue"]').should('be.visible');
      cy.get('[data-testid="stat-total-revenue"] [data-testid="stat-value"]')
        .should('contain.text', '$2,450,000');
    });

    it('should show percentage changes and trends', () => {
      const statsWithTrends = {
        ...mockDashboardStats,
        totalConsultants: 145,
        totalConsultantsChange: 12.5,
        activeProjects: 23,
        activeProjectsChange: -5.2
      };
      
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: statsWithTrends
      }).as('getStatsWithTrends');
      
      cy.reload();
      cy.wait('@getStatsWithTrends');
      
      // Positive trend
      cy.get('[data-testid="stat-total-consultants"] [data-testid="trend-positive"]')
        .should('be.visible')
        .and('contain.text', '+12.5%');
      
      // Negative trend
      cy.get('[data-testid="stat-active-projects"] [data-testid="trend-negative"]')
        .should('be.visible')
        .and('contain.text', '-5.2%');
    });

    it('should be clickable and navigate to detailed views', () => {
      // Mock navigation intercepts
      cy.intercept('GET', '/api/consultants*', { body: [] }).as('getConsultants');
      cy.intercept('GET', '/api/projects*', { body: [] }).as('getProjects');
      
      // Click on consultants stat
      cy.get('[data-testid="stat-total-consultants"]').click();
      cy.url().should('include', '/consultants');
      
      cy.go('back');
      
      // Click on projects stat
      cy.get('[data-testid="stat-active-projects"]').click();
      cy.url().should('include', '/projects');
    });

    it('should show tooltips on hover', () => {
      cy.get('[data-testid="stat-total-consultants"]').trigger('mouseover');
      cy.get('[data-testid="tooltip"]')
        .should('be.visible')
        .and('contain.text', 'Total number of registered consultants');
      
      cy.get('[data-testid="stat-total-consultants"]').trigger('mouseleave');
      cy.get('[data-testid="tooltip"]').should('not.exist');
    });

    it('should handle large numbers formatting', () => {
      const largeStats = {
        ...mockDashboardStats,
        totalRevenue: 1234567890,
        totalConsultants: 10000
      };
      
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: largeStats
      }).as('getLargeStats');
      
      cy.reload();
      cy.wait('@getLargeStats');
      
      // Should format large numbers properly
      cy.get('[data-testid="stat-total-revenue"] [data-testid="stat-value"]')
        .should('contain.text', '$1.23B');
      cy.get('[data-testid="stat-total-consultants"] [data-testid="stat-value"]')
        .should('contain.text', '10.0K');
    });
  });

  describe('Charts and Analytics', () => {
    beforeEach(() => {
      cy.wait('@getDashboardStats');
      cy.wait('@getPlatformAnalytics');
    });

    it('should display revenue chart with correct data', () => {
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
      cy.get('[data-testid="chart-title"]').should('contain.text', 'Revenue Trends');
      
      // Check chart data points
      cy.get('[data-testid="revenue-chart"] .recharts-line').should('exist');
      cy.get('[data-testid="revenue-chart"] .recharts-dot').should('have.length', 3);
    });

    it('should display user growth chart', () => {
      cy.get('[data-testid="growth-chart"]').should('be.visible');
      cy.get('[data-testid="growth-chart"] .recharts-bar').should('exist');
      
      // Test chart interactions
      cy.get('[data-testid="growth-chart"] .recharts-bar').first().trigger('mouseover');
      cy.get('.recharts-tooltip').should('be.visible');
    });

    it('should allow chart time period filtering', () => {
      // Chart period selector
      cy.get('[data-testid="chart-period-selector"]').should('be.visible');
      cy.get('[data-testid="period-7d"]').should('have.class', 'active');
      
      // Switch to 30 days
      cy.intercept('GET', '/api/analytics/platform?period=30d', {
        statusCode: 200,
        body: { /* 30-day data */ }
      }).as('get30DayAnalytics');
      
      cy.get('[data-testid="period-30d"]').click();
      cy.wait('@get30DayAnalytics');
      cy.get('[data-testid="period-30d"]').should('have.class', 'active');
    });

    it('should show performance metrics gauge charts', () => {
      cy.get('[data-testid="performance-metrics"]').should('be.visible');
      
      // Utilization gauge
      cy.get('[data-testid="utilization-gauge"]')
        .should('be.visible')
        .and('contain.text', '78.5%');
      
      // Success rate gauge
      cy.get('[data-testid="success-rate-gauge"]')
        .should('be.visible')
        .and('contain.text', '94.2%');
      
      // Satisfaction gauge
      cy.get('[data-testid="satisfaction-gauge"]')
        .should('be.visible')
        .and('contain.text', '4.7');
    });

    it('should export chart data', () => {
      cy.get('[data-testid="revenue-chart"]').within(() => {
        cy.get('[data-testid="chart-export-button"]').click();
      });
      
      cy.get('[data-testid="export-menu"]').should('be.visible');
      cy.get('[data-testid="export-csv"]').click();
      
      // Should trigger download
      cy.readFile('cypress/downloads/revenue-chart.csv').should('exist');
    });

    it('should handle chart data loading errors', () => {
      cy.intercept('GET', '/api/analytics/platform', {
        statusCode: 500
      }).as('getAnalyticsError');
      
      cy.reload();
      cy.wait('@getAnalyticsError');
      
      cy.get('[data-testid="chart-error"]').should('be.visible');
      cy.get('[data-testid="chart-error-message"]')
        .should('contain.text', 'Unable to load chart data');
    });
  });

  describe('Recent Activities Feed', () => {
    beforeEach(() => {
      cy.wait('@getRecentActivities');
    });

    it('should display recent activities list', () => {
      cy.get('[data-testid="recent-activities"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
      
      // Check activity item structure
      cy.get('[data-testid="activity-item"]').first().within(() => {
        cy.get('[data-testid="activity-icon"]').should('be.visible');
        cy.get('[data-testid="activity-description"]')
          .should('be.visible')
          .and('contain.text', 'New project created');
        cy.get('[data-testid="activity-timestamp"]').should('be.visible');
        cy.get('[data-testid="activity-user"]')
          .should('be.visible')
          .and('contain.text', 'John Doe');
      });
    });

    it('should show different activity types with appropriate icons', () => {
      const mixedActivities = [
        {
          id: 1,
          type: 'project_created',
          description: 'New project created',
          timestamp: new Date().toISOString(),
          user: 'John Doe'
        },
        {
          id: 2,
          type: 'consultant_assigned',
          description: 'Consultant assigned to project',
          timestamp: new Date().toISOString(),
          user: 'Jane Smith'
        },
        {
          id: 3,
          type: 'project_completed',
          description: 'Project marked as completed',
          timestamp: new Date().toISOString(),
          user: 'Bob Johnson'
        }
      ];
      
      cy.intercept('GET', '/api/activities/recent', {
        statusCode: 200,
        body: mixedActivities
      }).as('getMixedActivities');
      
      cy.reload();
      cy.wait('@getMixedActivities');
      
      cy.get('[data-testid="activity-item"]').should('have.length', 3);
      
      // Check different icons for different activity types
      cy.get('[data-testid="activity-item"]').eq(0)
        .find('[data-testid="activity-icon"]')
        .should('have.attr', 'data-type', 'project_created');
      
      cy.get('[data-testid="activity-item"]').eq(1)
        .find('[data-testid="activity-icon"]')
        .should('have.attr', 'data-type', 'consultant_assigned');
    });

    it('should show relative timestamps', () => {
      const recentActivity = {
        id: 1,
        type: 'project_created',
        description: 'New project created',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        user: 'John Doe'
      };
      
      cy.intercept('GET', '/api/activities/recent', {
        statusCode: 200,
        body: [recentActivity]
      }).as('getRecentActivity');
      
      cy.reload();
      cy.wait('@getRecentActivity');
      
      cy.get('[data-testid="activity-timestamp"]')
        .should('contain.text', '5 minutes ago');
    });

    it('should paginate through activities', () => {
      // Mock paginated response
      cy.intercept('GET', '/api/activities/recent?page=2', {
        statusCode: 200,
        body: [
          {
            id: 11,
            type: 'project_updated',
            description: 'Project details updated',
            timestamp: new Date().toISOString(),
            user: 'Alice Wilson'
          }
        ]
      }).as('getActivitiesPage2');
      
      cy.get('[data-testid="activities-load-more"]').click();
      cy.wait('@getActivitiesPage2');
      
      cy.get('[data-testid="activity-item"]')
        .should('have.length.greaterThan', 1);
    });

    it('should filter activities by type', () => {
      cy.get('[data-testid="activity-filter"]').should('be.visible');
      cy.get('[data-testid="activity-filter"]').select('project_created');
      
      cy.intercept('GET', '/api/activities/recent?type=project_created', {
        statusCode: 200,
        body: [mockDashboardStats.recentActivities[0]]
      }).as('getFilteredActivities');
      
      cy.wait('@getFilteredActivities');
      
      cy.get('[data-testid="activity-item"]').should('have.length', 1);
      cy.get('[data-testid="activity-item"]')
        .should('contain.text', 'New project created');
    });

    it('should handle empty activities state', () => {
      cy.intercept('GET', '/api/activities/recent', {
        statusCode: 200,
        body: []
      }).as('getEmptyActivities');
      
      cy.reload();
      cy.wait('@getEmptyActivities');
      
      cy.get('[data-testid="empty-activities"]').should('be.visible');
      cy.get('[data-testid="empty-activities-message"]')
        .should('contain.text', 'No recent activities');
    });

    it('should link to detailed activity views', () => {
      cy.intercept('GET', '/api/projects/1', { body: { id: 1, name: 'Test Project' } });
      
      cy.get('[data-testid="activity-item"]').first().click();
      
      // Should navigate to related resource
      cy.url().should('match', /\/(projects|consultants|hospitals)\/\d+/);
    });
  });

  describe('Dashboard Customization', () => {
    it('should allow reordering dashboard widgets', () => {
      cy.get('[data-testid="dashboard-customize-button"]').click();
      cy.get('[data-testid="customize-mode"]').should('be.visible');
      
      // Drag and drop widgets (using simulate drag)
      cy.get('[data-testid="widget-stats"]')
        .trigger('mousedown', { button: 0 });
      cy.get('[data-testid="widget-charts"]')
        .trigger('mousemove')
        .trigger('mouseup');
      
      // Should update layout
      cy.get('[data-testid="save-layout-button"]').click();
      
      cy.intercept('POST', '/api/dashboard/layout', {
        statusCode: 200
      }).as('saveLayout');
      
      cy.wait('@saveLayout');
    });

    it('should allow hiding/showing widgets', () => {
      cy.get('[data-testid="dashboard-settings"]').click();
      cy.get('[data-testid="widget-visibility-panel"]').should('be.visible');
      
      // Toggle widget visibility
      cy.get('[data-testid="toggle-activities-widget"]').click();
      cy.get('[data-testid="activities-section"]').should('not.be.visible');
      
      // Save settings
      cy.get('[data-testid="save-dashboard-settings"]').click();
      cy.get('[data-testid="settings-saved-message"]').should('be.visible');
    });

    it('should remember user preferences on reload', () => {
      // Set preferences
      cy.get('[data-testid="dashboard-settings"]').click();
      cy.get('[data-testid="toggle-charts-widget"]').click();
      cy.get('[data-testid="save-dashboard-settings"]').click();
      
      // Reload page
      cy.reload();
      cy.wait('@getDashboardStats');
      
      // Preferences should be maintained
      cy.get('[data-testid="charts-section"]').should('not.be.visible');
    });
  });

  describe('Dashboard Search and Quick Actions', () => {
    it('should provide global search functionality', () => {
      cy.get('[data-testid="dashboard-search"]').should('be.visible');
      cy.get('[data-testid="dashboard-search"]').type('General Hospital');
      
      cy.intercept('GET', '/api/search?q=General+Hospital', {
        statusCode: 200,
        body: {
          hospitals: [{ id: 1, name: 'General Hospital' }],
          projects: [],
          consultants: []
        }
      }).as('searchResults');
      
      cy.wait('@searchResults');
      
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-result-item"]').should('have.length.at.least', 1);
      
      // Click on search result
      cy.get('[data-testid="search-result-item"]').first().click();
      cy.url().should('include', '/hospitals/1');
    });

    it('should show quick action buttons', () => {
      cy.get('[data-testid="quick-actions"]').should('be.visible');
      
      // New project action
      cy.get('[data-testid="quick-action-new-project"]')
        .should('be.visible')
        .and('contain.text', 'New Project');
      
      // New consultant action
      cy.get('[data-testid="quick-action-new-consultant"]')
        .should('be.visible')
        .and('contain.text', 'New Consultant');
      
      // View reports action
      cy.get('[data-testid="quick-action-reports"]')
        .should('be.visible')
        .and('contain.text', 'Reports');
    });

    it('should execute quick actions correctly', () => {
      cy.intercept('GET', '/projects/new', { body: '' }).as('newProject');
      
      cy.get('[data-testid="quick-action-new-project"]').click();
      cy.url().should('include', '/projects/new');
    });
  });

  describe('Dashboard Notifications', () => {
    it('should display notification badge', () => {
      cy.intercept('GET', '/api/notifications/unread-count', {
        statusCode: 200,
        body: { count: 5 }
      }).as('getNotificationCount');
      
      cy.reload();
      cy.wait('@getNotificationCount');
      
      cy.get('[data-testid="notification-badge"]')
        .should('be.visible')
        .and('contain.text', '5');
    });

    it('should show notifications panel', () => {
      cy.intercept('GET', '/api/notifications', {
        statusCode: 200,
        body: [
          {
            id: 1,
            title: 'New project assignment',
            message: 'You have been assigned to a new project',
            timestamp: new Date().toISOString(),
            read: false
          }
        ]
      }).as('getNotifications');
      
      cy.get('[data-testid="notifications-button"]').click();
      cy.wait('@getNotifications');
      
      cy.get('[data-testid="notifications-panel"]').should('be.visible');
      cy.get('[data-testid="notification-item"]').should('have.length', 1);
    });

    it('should mark notifications as read', () => {
      cy.intercept('POST', '/api/notifications/mark-all-read', {
        statusCode: 200
      }).as('markAllRead');
      
      cy.get('[data-testid="notifications-button"]').click();
      cy.get('[data-testid="mark-all-read-button"]').click();
      
      cy.wait('@markAllRead');
      cy.get('[data-testid="notification-badge"]').should('not.exist');
    });
  });

  describe('Dashboard Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'dashboard-search');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'notifications-button');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'quick-action-new-project');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="stat-total-consultants"]')
        .should('have.attr', 'aria-label')
        .and('contain', 'Total consultants: 145');
      
      cy.get('[data-testid="revenue-chart"]')
        .should('have.attr', 'aria-label', 'Revenue trends chart');
    });

    it('should support screen reader navigation', () => {
      cy.get('[data-testid="dashboard-container"]')
        .should('have.attr', 'role', 'main');
      
      cy.get('[data-testid="stats-section"]')
        .should('have.attr', 'aria-label', 'Key statistics');
      
      cy.get('[data-testid="charts-section"]')
        .should('have.attr', 'aria-label', 'Analytics charts');
    });

    it('should have sufficient color contrast', () => {
      // Test high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast');
      
      cy.get('[data-testid="stat-value"]').each(($el) => {
        cy.wrap($el).should('be.visible');
      });
    });
  });

  describe('Dashboard Performance', () => {
    it('should load within performance budget', () => {
      const startTime = Date.now();
      
      cy.visit('/dashboard');
      cy.wait('@getDashboardStats');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 second budget
      });
    });

    it('should lazy load chart components', () => {
      // Charts should not be in DOM initially if below fold
      cy.get('[data-testid="revenue-chart"]').should('not.exist');
      
      // Scroll to charts section
      cy.get('[data-testid="charts-section"]').scrollIntoView();
      
      // Charts should now be loaded
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
    });

    it('should cache dashboard data', () => {
      cy.wait('@getDashboardStats');
      
      // Navigate away and back
      cy.visit('/projects');
      cy.visit('/dashboard');
      
      // Should not make another API call (cached)
      cy.get('@getDashboardStats.all').should('have.length', 1);
    });
  });

  describe('Real-time Updates', () => {
    it('should update stats in real-time', () => {
      // Simulate WebSocket connection
      cy.window().then((win) => {
        // Mock WebSocket message
        win.postMessage({
          type: 'STATS_UPDATE',
          data: {
            totalConsultants: 146 // Updated value
          }
        }, '*');
      });
      
      cy.get('[data-testid="stat-total-consultants"] [data-testid="stat-value"]')
        .should('contain.text', '146');
    });

    it('should show live activity feed updates', () => {
      const initialCount = 1;
      
      cy.get('[data-testid="activity-item"]').should('have.length', initialCount);
      
      // Simulate new activity
      cy.window().then((win) => {
        win.postMessage({
          type: 'NEW_ACTIVITY',
          data: {
            id: 2,
            type: 'consultant_created',
            description: 'New consultant registered',
            timestamp: new Date().toISOString(),
            user: 'System'
          }
        }, '*');
      });
      
      cy.get('[data-testid="activity-item"]')
        .should('have.length', initialCount + 1);
    });
  });
});
