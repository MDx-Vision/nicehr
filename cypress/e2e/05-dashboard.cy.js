describe('Dashboard Feature', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    // Clear state and login
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Mock dashboard stats API
    cy.intercept('GET', '/api/dashboard/stats', {
      fixture: 'dashboard/stats.json'
    }).as('getDashboardStats');
    
    // Mock user auth
    cy.intercept('GET', '/api/auth/user', {
      fixture: 'auth/user.json'
    }).as('getUser');
    
    // Login and navigate to dashboard
    cy.login(testUser.email, testUser.password);
    cy.visit('/dashboard');
    cy.wait('@getDashboardStats');
    cy.wait('@getUser');
  });

  describe('Dashboard Layout and Navigation', () => {
    it('should display main dashboard layout correctly', () => {
      cy.get('[data-testid="dashboard-container"]').should('be.visible');
      cy.get('[data-testid="dashboard-header"]').should('be.visible');
      cy.get('[data-testid="dashboard-main-content"]').should('be.visible');
      cy.get('[data-testid="dashboard-sidebar"]').should('be.visible');
    });

    it('should display page title and breadcrumbs', () => {
      cy.get('[data-testid="page-title"]').should('contain.text', 'Dashboard');
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb-item-dashboard"]').should('contain.text', 'Dashboard');
    });

    it('should show user welcome message', () => {
      cy.get('[data-testid="welcome-message"]').should('be.visible');
      cy.get('[data-testid="welcome-user-name"]').should('not.be.empty');
    });

    it('should display navigation menu items', () => {
      cy.get('[data-testid="nav-menu"]').should('be.visible');
      cy.get('[data-testid="nav-item-projects"]').should('be.visible');
      cy.get('[data-testid="nav-item-consultants"]').should('be.visible');
      cy.get('[data-testid="nav-item-hospitals"]').should('be.visible');
      cy.get('[data-testid="nav-item-reports"]').should('be.visible');
    });

    it('should handle mobile menu toggle', () => {
      cy.viewport('iphone-6');
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      cy.get('[data-testid="dashboard-sidebar"]').should('not.be.visible');
      
      cy.get('[data-testid="mobile-menu-toggle"]').click();
      cy.get('[data-testid="dashboard-sidebar"]').should('be.visible');
      
      cy.get('[data-testid="mobile-menu-close"]').click();
      cy.get('[data-testid="dashboard-sidebar"]').should('not.be.visible');
    });
  });

  describe('Dashboard Statistics Cards', () => {
    it('should display all statistics cards', () => {
      cy.get('[data-testid="stats-container"]').should('be.visible');
      cy.get('[data-testid="stat-card-total-projects"]').should('be.visible');
      cy.get('[data-testid="stat-card-active-consultants"]').should('be.visible');
      cy.get('[data-testid="stat-card-total-hospitals"]').should('be.visible');
      cy.get('[data-testid="stat-card-revenue"]').should('be.visible');
    });

    it('should display correct statistics values', () => {
      cy.get('[data-testid="stat-value-total-projects"]').should('contain.text', '24');
      cy.get('[data-testid="stat-value-active-consultants"]').should('contain.text', '156');
      cy.get('[data-testid="stat-value-total-hospitals"]').should('contain.text', '8');
      cy.get('[data-testid="stat-value-revenue"]').should('contain.text', '$2.4M');
    });

    it('should display statistics labels', () => {
      cy.get('[data-testid="stat-label-total-projects"]').should('contain.text', 'Total Projects');
      cy.get('[data-testid="stat-label-active-consultants"]').should('contain.text', 'Active Consultants');
      cy.get('[data-testid="stat-label-total-hospitals"]').should('contain.text', 'Total Hospitals');
      cy.get('[data-testid="stat-label-revenue"]').should('contain.text', 'Total Revenue');
    });

    it('should display percentage changes with proper styling', () => {
      cy.get('[data-testid="stat-change-total-projects"]')
        .should('contain.text', '+12%')
        .and('have.class', 'text-green-600');
      
      cy.get('[data-testid="stat-change-active-consultants"]')
        .should('contain.text', '+8%')
        .and('have.class', 'text-green-600');
      
      cy.get('[data-testid="stat-change-total-hospitals"]')
        .should('contain.text', '+2%')
        .and('have.class', 'text-green-600');
      
      cy.get('[data-testid="stat-change-revenue"]')
        .should('contain.text', '-3%')
        .and('have.class', 'text-red-600');
    });

    it('should show loading state for statistics', () => {
      cy.intercept('GET', '/api/dashboard/stats', { delay: 2000 }).as('getStatsDelayed');
      cy.visit('/dashboard');
      
      cy.get('[data-testid="stats-loading"]').should('be.visible');
      cy.get('[data-testid="stat-card-skeleton"]').should('have.length', 4);
    });

    it('should handle statistics API error', () => {
      cy.intercept('GET', '/api/dashboard/stats', { statusCode: 500 }).as('getStatsError');
      cy.visit('/dashboard');
      cy.wait('@getStatsError');
      
      cy.get('[data-testid="stats-error"]').should('be.visible');
      cy.get('[data-testid="stats-error-message"]').should('contain.text', 'Failed to load statistics');
      cy.get('[data-testid="stats-retry-button"]').should('be.visible');
    });

    it('should retry loading statistics on error', () => {
      cy.intercept('GET', '/api/dashboard/stats', { statusCode: 500 }).as('getStatsError');
      cy.visit('/dashboard');
      cy.wait('@getStatsError');
      
      cy.intercept('GET', '/api/dashboard/stats', { fixture: 'dashboard/stats.json' }).as('getStatsRetry');
      cy.get('[data-testid="stats-retry-button"]').click();
      cy.wait('@getStatsRetry');
      
      cy.get('[data-testid="stats-container"]').should('be.visible');
      cy.get('[data-testid="stats-error"]').should('not.exist');
    });
  });

  describe('Recent Activity Feed', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/activities/recent', {
        fixture: 'dashboard/recent-activities.json'
      }).as('getRecentActivities');
    });

    it('should display recent activity section', () => {
      cy.get('[data-testid="recent-activity-section"]').should('be.visible');
      cy.get('[data-testid="recent-activity-title"]').should('contain.text', 'Recent Activity');
      cy.get('[data-testid="recent-activity-list"]').should('be.visible');
    });

    it('should display activity items', () => {
      cy.wait('@getRecentActivities');
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="activity-item"]').first().within(() => {
        cy.get('[data-testid="activity-icon"]').should('be.visible');
        cy.get('[data-testid="activity-description"]').should('not.be.empty');
        cy.get('[data-testid="activity-timestamp"]').should('not.be.empty');
        cy.get('[data-testid="activity-user"]').should('not.be.empty');
      });
    });

    it('should show different activity types with proper icons', () => {
      cy.wait('@getRecentActivities');
      
      cy.get('[data-testid="activity-item-project-created"]').within(() => {
        cy.get('[data-testid="activity-icon-project"]').should('be.visible');
      });
      
      cy.get('[data-testid="activity-item-consultant-added"]').within(() => {
        cy.get('[data-testid="activity-icon-consultant"]').should('be.visible');
      });
    });

    it('should handle empty activity state', () => {
      cy.intercept('GET', '/api/activities/recent', { body: [] }).as('getEmptyActivities');
      cy.visit('/dashboard');
      cy.wait('@getEmptyActivities');
      
      cy.get('[data-testid="activities-empty-state"]').should('be.visible');
      cy.get('[data-testid="activities-empty-message"]').should('contain.text', 'No recent activity');
    });

    it('should navigate to activity details on click', () => {
      cy.wait('@getRecentActivities');
      cy.get('[data-testid="activity-item"]').first().click();
      cy.url().should('include', '/activities');
    });

    it('should show view all activities link', () => {
      cy.get('[data-testid="view-all-activities"]').should('be.visible');
      cy.get('[data-testid="view-all-activities"]').click();
      cy.url().should('include', '/activities');
    });
  });

  describe('Quick Actions Panel', () => {
    it('should display quick actions section', () => {
      cy.get('[data-testid="quick-actions-section"]').should('be.visible');
      cy.get('[data-testid="quick-actions-title"]').should('contain.text', 'Quick Actions');
      cy.get('[data-testid="quick-actions-grid"]').should('be.visible');
    });

    it('should display all quick action buttons', () => {
      cy.get('[data-testid="quick-action-new-project"]').should('be.visible');
      cy.get('[data-testid="quick-action-add-consultant"]').should('be.visible');
      cy.get('[data-testid="quick-action-create-hospital"]').should('be.visible');
      cy.get('[data-testid="quick-action-generate-report"]').should('be.visible');
    });

    it('should navigate to correct pages on quick action clicks', () => {
      cy.get('[data-testid="quick-action-new-project"]').click();
      cy.url().should('include', '/projects/new');
      
      cy.go('back');
      
      cy.get('[data-testid="quick-action-add-consultant"]').click();
      cy.url().should('include', '/consultants/new');
      
      cy.go('back');
      
      cy.get('[data-testid="quick-action-create-hospital"]').click();
      cy.url().should('include', '/hospitals/new');
      
      cy.go('back');
      
      cy.get('[data-testid="quick-action-generate-report"]').click();
      cy.url().should('include', '/reports/new');
    });

    it('should show tooltips on quick action hover', () => {
      cy.get('[data-testid="quick-action-new-project"]').trigger('mouseover');
      cy.get('[data-testid="tooltip"]').should('contain.text', 'Create New Project');
      
      cy.get('[data-testid="quick-action-add-consultant"]').trigger('mouseover');
      cy.get('[data-testid="tooltip"]').should('contain.text', 'Add New Consultant');
    });

    it('should handle keyboard navigation for quick actions', () => {
      cy.get('[data-testid="quick-action-new-project"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'quick-action-new-project');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'quick-action-add-consultant');
      
      cy.focused().type('{enter}');
      cy.url().should('include', '/consultants/new');
    });
  });

  describe('Charts and Analytics', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/analytics/platform', {
        fixture: 'dashboard/analytics.json'
      }).as('getPlatformAnalytics');
    });

    it('should display charts section', () => {
      cy.get('[data-testid="charts-section"]').should('be.visible');
      cy.get('[data-testid="charts-title"]').should('contain.text', 'Analytics');
    });

    it('should display revenue chart', () => {
      cy.wait('@getPlatformAnalytics');
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
      cy.get('[data-testid="revenue-chart-title"]').should('contain.text', 'Revenue Trend');
      cy.get('[data-testid="revenue-chart-canvas"]').should('be.visible');
    });

    it('should display projects chart', () => {
      cy.wait('@getPlatformAnalytics');
      cy.get('[data-testid="projects-chart"]').should('be.visible');
      cy.get('[data-testid="projects-chart-title"]').should('contain.text', 'Project Status');
      cy.get('[data-testid="projects-chart-canvas"]').should('be.visible');
    });

    it('should handle chart time period selection', () => {
      cy.get('[data-testid="chart-period-selector"]').should('be.visible');
      cy.get('[data-testid="chart-period-7days"]').should('be.visible');
      cy.get('[data-testid="chart-period-30days"]').should('be.visible');
      cy.get('[data-testid="chart-period-90days"]').should('be.visible');
      
      cy.get('[data-testid="chart-period-30days"]').click();
      cy.intercept('GET', '/api/analytics/platform?period=30days').as('get30DaysAnalytics');
      cy.wait('@get30DaysAnalytics');
    });

    it('should show chart loading state', () => {
      cy.intercept('GET', '/api/analytics/platform', { delay: 2000 }).as('getAnalyticsDelayed');
      cy.visit('/dashboard');
      
      cy.get('[data-testid="charts-loading"]').should('be.visible');
      cy.get('[data-testid="chart-skeleton"]').should('have.length.at.least', 2);
    });

    it('should handle chart export functionality', () => {
      cy.wait('@getPlatformAnalytics');
      cy.get('[data-testid="chart-export-button"]').should('be.visible');
      cy.get('[data-testid="chart-export-button"]').click();
      
      cy.get('[data-testid="export-dropdown"]').should('be.visible');
      cy.get('[data-testid="export-png"]').should('be.visible');
      cy.get('[data-testid="export-csv"]').should('be.visible');
      cy.get('[data-testid="export-pdf"]').should('be.visible');
    });
  });

  describe('Notifications and Alerts', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/notifications', {
        fixture: 'dashboard/notifications.json'
      }).as('getNotifications');
      
      cy.intercept('GET', '/api/notifications/unread-count', {
        body: { count: 3 }
      }).as('getUnreadCount');
    });

    it('should display notifications bell with count', () => {
      cy.wait('@getUnreadCount');
      cy.get('[data-testid="notifications-bell"]').should('be.visible');
      cy.get('[data-testid="notifications-count"]').should('contain.text', '3');
    });

    it('should open notifications dropdown on click', () => {
      cy.get('[data-testid="notifications-bell"]').click();
      cy.get('[data-testid="notifications-dropdown"]').should('be.visible');
      cy.wait('@getNotifications');
    });

    it('should display notification items', () => {
      cy.get('[data-testid="notifications-bell"]').click();
      cy.wait('@getNotifications');
      
      cy.get('[data-testid="notification-item"]').should('have.length.at.least', 1);
      cy.get('[data-testid="notification-item"]').first().within(() => {
        cy.get('[data-testid="notification-title"]').should('not.be.empty');
        cy.get('[data-testid="notification-message"]').should('not.be.empty');
        cy.get('[data-testid="notification-time"]').should('not.be.empty');
      });
    });

    it('should mark notifications as read', () => {
      cy.get('[data-testid="notifications-bell"]').click();
      cy.wait('@getNotifications');
      
      cy.intercept('POST', '/api/notifications/mark-all-read').as('markAllRead');
      cy.get('[data-testid="mark-all-read"]').click();
      cy.wait('@markAllRead');
      
      cy.get('[data-testid="notifications-count"]').should('not.exist');
    });

    it('should delete individual notifications', () => {
      cy.get('[data-testid="notifications-bell"]').click();
      cy.wait('@getNotifications');
      
      cy.intercept('DELETE', '/api/notifications/*').as('deleteNotification');
      cy.get('[data-testid="notification-delete"]').first().click();
      cy.wait('@deleteNotification');
    });

    it('should navigate to notification source on click', () => {
      cy.get('[data-testid="notifications-bell"]').click();
      cy.wait('@getNotifications');
      
      cy.get('[data-testid="notification-item"]').first().click();
      cy.url().should('include', '/projects/');
    });
  });

  describe('Dashboard Customization', () => {
    it('should allow dashboard layout customization', () => {
      cy.get('[data-testid="customize-dashboard"]').should('be.visible');
      cy.get('[data-testid="customize-dashboard"]').click();
      
      cy.get('[data-testid="customization-panel"]').should('be.visible');
      cy.get('[data-testid="widget-settings"]').should('be.visible');
    });

    it('should save dashboard preferences', () => {
      cy.get('[data-testid="customize-dashboard"]').click();
      cy.get('[data-testid="hide-revenue-chart"]').click();
      
      cy.intercept('PATCH', '/api/account/settings').as('saveSettings');
      cy.get('[data-testid="save-preferences"]').click();
      cy.wait('@saveSettings');
      
      cy.get('[data-testid="revenue-chart"]').should('not.exist');
    });

    it('should reset dashboard to defaults', () => {
      cy.get('[data-testid="customize-dashboard"]').click();
      cy.get('[data-testid="reset-to-defaults"]').click();
      
      cy.get('[data-testid="confirm-reset"]').click();
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
      cy.get('[data-testid="projects-chart"]').should('be.visible');
    });
  });

  describe('Dashboard Search', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/search?q=*', {
        fixture: 'dashboard/search-results.json'
      }).as('searchGlobal');
    });

    it('should display global search bar', () => {
      cy.get('[data-testid="global-search"]').should('be.visible');
      cy.get('[data-testid="search-input"]').should('have.attr', 'placeholder', 'Search projects, consultants, hospitals...');
    });

    it('should perform search and show results', () => {
      cy.get('[data-testid="search-input"]').type('test project');
      cy.wait('@searchGlobal');
      
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-result-item"]').should('have.length.at.least', 1);
    });

    it('should navigate to search result on click', () => {
      cy.get('[data-testid="search-input"]').type('test project');
      cy.wait('@searchGlobal');
      
      cy.get('[data-testid="search-result-item"]').first().click();
      cy.url().should('include', '/projects/');
    });

    it('should show search categories', () => {
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait('@searchGlobal');
      
      cy.get('[data-testid="search-category-projects"]').should('be.visible');
      cy.get('[data-testid="search-category-consultants"]').should('be.visible');
      cy.get('[data-testid="search-category-hospitals"]').should('be.visible');
    });

    it('should handle empty search results', () => {
      cy.intercept('GET', '/api/search?q=*', { body: [] }).as('searchEmpty');
      cy.get('[data-testid="search-input"]').type('nonexistent');
      cy.wait('@searchEmpty');
      
      cy.get('[data-testid="search-empty-state"]').should('be.visible');
      cy.get('[data-testid="search-empty-message"]').should('contain.text', 'No results found');
    });

    it('should handle keyboard navigation in search results', () => {
      cy.get('[data-testid="search-input"]').type('test');
      cy.wait('@searchGlobal');
      
      cy.get('[data-testid="search-input"]').type('{downarrow}');
      cy.get('[data-testid="search-result-item"]').first().should('have.class', 'highlighted');
      
      cy.get('[data-testid="search-input"]').type('{downarrow}');
      cy.get('[data-testid="search-result-item"]').eq(1).should('have.class', 'highlighted');
      
      cy.get('[data-testid="search-input"]').type('{enter}');
      cy.url().should('include', '/projects/');
    });
  });

  describe('Dashboard Responsive Behavior', () => {
    it('should adapt layout for tablet view', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="stats-container"]').should('be.visible');
      cy.get('[data-testid="stat-card"]').should('have.class', 'col-span-6');
    });

    it('should adapt layout for mobile view', () => {
      cy.viewport('iphone-6');
      cy.get('[data-testid="stats-container"]').should('be.visible');
      cy.get('[data-testid="stat-card"]').should('have.class', 'col-span-12');
      cy.get('[data-testid="charts-section"]').should('have.class', 'col-span-12');
    });

    it('should hide/show elements based on screen size', () => {
      cy.viewport('iphone-6');
      cy.get('[data-testid="dashboard-sidebar"]').should('not.be.visible');
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      
      cy.viewport('macbook-13');
      cy.get('[data-testid="dashboard-sidebar"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-toggle"]').should('not.be.visible');
    });
  });

  describe('Dashboard Performance', () => {
    it('should lazy load chart components', () => {
      cy.get('[data-testid="charts-section"]').should('not.be.visible');
      cy.scrollTo('bottom');
      cy.get('[data-testid="charts-section"]').should('be.visible');
      cy.wait('@getPlatformAnalytics');
    });

    it('should implement virtual scrolling for large activity lists', () => {
      cy.intercept('GET', '/api/activities/recent', {
        fixture: 'dashboard/large-activity-list.json'
      }).as('getLargeActivityList');
      
      cy.visit('/dashboard');
      cy.wait('@getLargeActivityList');
      
      cy.get('[data-testid="activity-virtual-list"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length', 10); // Only render visible items
    });

    it('should cache dashboard data', () => {
      cy.visit('/dashboard');
      cy.wait('@getDashboardStats');
      
      cy.visit('/projects');
      cy.visit('/dashboard');
      
      // Should not make another API call due to caching
      cy.get('@getDashboardStats').should('have.been.calledOnce');
    });
  });

  describe('Dashboard Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/dashboard/stats', { forceNetworkError: true }).as('networkError');
      cy.visit('/dashboard');
      
      cy.get('[data-testid="dashboard-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Network error');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle partial data loading failures', () => {
      cy.intercept('GET', '/api/dashboard/stats', { fixture: 'dashboard/stats.json' }).as('getStats');
      cy.intercept('GET', '/api/activities/recent', { statusCode: 500 }).as('getActivitiesError');
      
      cy.visit('/dashboard');
      cy.wait('@getStats');
      cy.wait('@getActivitiesError');
      
      cy.get('[data-testid="stats-container"]').should('be.visible');
      cy.get('[data-testid="activities-error"]').should('be.visible');
      cy.get('[data-testid="activities-retry"]').should('be.visible');
    });

    it('should implement offline mode', () => {
      cy.intercept('GET', '/api/dashboard/stats', { fixture: 'dashboard/stats.json' }).as('getStats');
      cy.visit('/dashboard');
      cy.wait('@getStats');
      
      // Simulate going offline
      cy.window().then((win) => {
        win.navigator.onLine = false;
        win.dispatchEvent(new Event('offline'));
      });
      
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
      cy.get('[data-testid="offline-message"]').should('contain.text', 'You are currently offline');
    });
  });
});
