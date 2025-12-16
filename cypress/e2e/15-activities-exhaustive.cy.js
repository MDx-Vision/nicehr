describe('Activities System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    activities: {
      valid: {
        type: 'project_created',
        description: 'Created new project implementation',
        metadata: { projectId: 'ci-test-project', priority: 'high' }
      },
      updated: {
        type: 'project_updated',
        description: 'Updated project requirements',
        metadata: { projectId: 'ci-test-project', priority: 'medium' }
      },
      invalid: {
        empty: {},
        missingType: { description: 'Missing type field' },
        missingDescription: { type: 'test_activity' },
        invalidType: { type: '', description: 'Empty type' }
      }
    }
  };

  const apiEndpoints = {
    activities: '/api/activities',
    recent: '/api/activities/recent',
    stats: '/api/activities/stats',
    adminActivities: '/api/admin/activities',
    login: '/api/auth/login',
    user: '/api/auth/user'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.request('POST', apiEndpoints.login, {
      email: testData.ciUser.email,
      password: testData.ciUser.password
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('user');
    });
  });

  describe('Activities Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.activities).as('getActivities');
      cy.intercept('GET', apiEndpoints.recent).as('getRecentActivities');
      cy.intercept('GET', apiEndpoints.stats).as('getActivityStats');
      cy.visit('/activities');
    });

    it('should display complete activities page layout', () => {
      cy.wait('@getActivities');
      
      // Page header
      cy.get('[data-testid="activities-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('h1').should('contain.text', /activities/i);
      
      // Main content areas
      cy.get('[data-testid="activities-container"]').should('be.visible');
      cy.get('[data-testid="activities-list"]').should('be.visible');
      
      // Navigation elements
      cy.get('[data-testid="activities-nav"]').should('be.visible');
      cy.get('[data-testid="activities-tabs"]').should('be.visible');
    });

    it('should have proper navigation tabs and filters', () => {
      // Tab navigation
      cy.get('[data-testid="tab-all-activities"]')
        .should('be.visible')
        .and('contain.text', /all|activities/i);
      cy.get('[data-testid="tab-recent-activities"]')
        .should('be.visible')
        .and('contain.text', /recent/i);
      
      // Filter controls
      cy.get('[data-testid="activity-filters"]').should('be.visible');
      cy.get('[data-testid="filter-type"]').should('be.visible');
      cy.get('[data-testid="filter-date"]').should('be.visible');
      cy.get('[data-testid="search-activities"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
    });

    it('should display activity statistics cards', () => {
      cy.wait('@getActivityStats');
      
      // Stats cards
      cy.get('[data-testid="stats-cards"]').should('be.visible');
      cy.get('[data-testid="stat-total-activities"]')
        .should('be.visible')
        .find('[data-testid="stat-value"]')
        .should('contain.text', /\d+/);
      cy.get('[data-testid="stat-recent-activities"]')
        .should('be.visible')
        .find('[data-testid="stat-value"]')
        .should('contain.text', /\d+/);
      cy.get('[data-testid="stat-activity-types"]')
        .should('be.visible')
        .find('[data-testid="stat-value"]')
        .should('contain.text', /\d+/);
    });

    it('should handle responsive layout on different screen sizes', () => {
      // Desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="activities-container"]')
        .should('have.css', 'display')
        .and('not.equal', 'none');
      
      // Tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="activities-list"]').should('be.visible');
      
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="activities-header"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-trigger"]').should('be.visible');
    });
  });

  describe('Activities List - Display & Interaction', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.activities, {
        fixture: 'activities/activities-list.json'
      }).as('getActivities');
      cy.visit('/activities');
      cy.wait('@getActivities');
    });

    it('should display activities list with proper formatting', () => {
      // List container
      cy.get('[data-testid="activities-list"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
      
      // Activity item structure
      cy.get('[data-testid="activity-item"]').first().within(() => {
        cy.get('[data-testid="activity-type"]').should('be.visible');
        cy.get('[data-testid="activity-description"]').should('be.visible');
        cy.get('[data-testid="activity-timestamp"]').should('be.visible');
        cy.get('[data-testid="activity-user"]').should('be.visible');
        cy.get('[data-testid="activity-metadata"]').should('be.visible');
      });
    });

    it('should show activity details on item click', () => {
      cy.get('[data-testid="activity-item"]').first().click();
      
      // Details modal/panel should open
      cy.get('[data-testid="activity-details-modal"]')
        .should('be.visible');
      cy.get('[data-testid="activity-details-content"]')
        .should('be.visible');
      
      // Details content
      cy.get('[data-testid="detail-type"]').should('be.visible');
      cy.get('[data-testid="detail-description"]').should('be.visible');
      cy.get('[data-testid="detail-timestamp"]').should('be.visible');
      cy.get('[data-testid="detail-user"]').should('be.visible');
      cy.get('[data-testid="detail-metadata"]').should('be.visible');
      
      // Close button
      cy.get('[data-testid="close-details"]').should('be.visible').click();
      cy.get('[data-testid="activity-details-modal"]').should('not.exist');
    });

    it('should handle activity type filtering', () => {
      // Open type filter
      cy.get('[data-testid="filter-type"]').click();
      cy.get('[data-testid="filter-type-dropdown"]').should('be.visible');
      
      // Select specific type
      cy.get('[data-testid="filter-option-project"]').click();
      
      // Verify filtering request
      cy.intercept('GET', `${apiEndpoints.activities}?type=project*`).as('getFilteredActivities');
      cy.wait('@getFilteredActivities');
      
      // Verify filtered results
      cy.get('[data-testid="activity-item"]').each(($item) => {
        cy.wrap($item)
          .find('[data-testid="activity-type"]')
          .should('contain.text', /project/i);
      });
    });

    it('should handle date range filtering', () => {
      // Open date filter
      cy.get('[data-testid="filter-date"]').click();
      cy.get('[data-testid="date-range-picker"]').should('be.visible');
      
      // Select date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      
      cy.get('[data-testid="date-start"]').type(startDate.toISOString().split('T')[0]);
      cy.get('[data-testid="date-end"]').type(endDate.toISOString().split('T')[0]);
      cy.get('[data-testid="apply-date-filter"]').click();
      
      // Verify API call with date params
      cy.intercept('GET', `${apiEndpoints.activities}?startDate=*&endDate=*`).as('getDateFiltered');
      cy.wait('@getDateFiltered');
    });

    it('should implement search functionality', () => {
      const searchTerm = 'project';
      
      cy.get('[data-testid="search-activities"]')
        .type(searchTerm);
      
      // Debounced search request
      cy.intercept('GET', `${apiEndpoints.activities}?search=${searchTerm}*`).as('searchActivities');
      cy.wait('@searchActivities', { timeout: 1000 });
      
      // Verify search results
      cy.get('[data-testid="activity-item"]').each(($item) => {
        cy.wrap($item).should('contain.text', searchTerm);
      });
      
      // Clear search
      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid="search-activities"]').should('have.value', '');
    });

    it('should handle pagination correctly', () => {
      // Mock paginated response
      cy.intercept('GET', `${apiEndpoints.activities}?page=1*`, {
        body: {
          activities: Array(10).fill(null).map((_, i) => ({
            id: i + 1,
            type: 'test_activity',
            description: `Activity ${i + 1}`,
            createdAt: new Date().toISOString()
          })),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            pages: 3
          }
        }
      }).as('getPage1');
      
      cy.visit('/activities');
      cy.wait('@getPage1');
      
      // Pagination controls
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="page-info"]').should('contain.text', '1 of 3');
      
      // Next page
      cy.intercept('GET', `${apiEndpoints.activities}?page=2*`).as('getPage2');
      cy.get('[data-testid="next-page"]').click();
      cy.wait('@getPage2');
      cy.get('[data-testid="page-info"]').should('contain.text', '2 of 3');
      
      // Previous page
      cy.get('[data-testid="prev-page"]').click();
      cy.wait('@getPage1');
      cy.get('[data-testid="page-info"]').should('contain.text', '1 of 3');
    });
  });

  describe('Recent Activities - Special View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.recent, {
        fixture: 'activities/recent-activities.json'
      }).as('getRecentActivities');
      cy.visit('/activities');
    });

    it('should switch to recent activities view', () => {
      cy.get('[data-testid="tab-recent-activities"]').click();
      cy.wait('@getRecentActivities');
      
      // Recent activities content
      cy.get('[data-testid="recent-activities-list"]').should('be.visible');
      cy.get('[data-testid="recent-activity-item"]').should('have.length.at.least', 1);
    });

    it('should display recent activities with time indicators', () => {
      cy.get('[data-testid="tab-recent-activities"]').click();
      cy.wait('@getRecentActivities');
      
      cy.get('[data-testid="recent-activity-item"]').first().within(() => {
        cy.get('[data-testid="time-indicator"]')
          .should('be.visible')
          .and('contain.text', /ago|minutes|hours|days/i);
        cy.get('[data-testid="activity-badge"]').should('be.visible');
      });
    });

    it('should auto-refresh recent activities', () => {
      cy.get('[data-testid="tab-recent-activities"]').click();
      cy.wait('@getRecentActivities');
      
      // Setup auto-refresh intercept
      cy.intercept('GET', apiEndpoints.recent).as('autoRefresh');
      
      // Wait for auto-refresh (typically 30s-60s)
      cy.get('[data-testid="auto-refresh-indicator"]').should('be.visible');
      
      // Manual refresh button
      cy.get('[data-testid="refresh-activities"]').click();
      cy.wait('@autoRefresh');
    });
  });

  describe('Activity Statistics - Analytics View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.stats, {
        body: {
          totalActivities: 156,
          todayActivities: 23,
          weekActivities: 89,
          monthActivities: 145,
          topActivityTypes: [
            { type: 'project_created', count: 45 },
            { type: 'user_login', count: 89 },
            { type: 'document_uploaded', count: 34 }
          ],
          activityTrends: [
            { date: '2024-01-01', count: 12 },
            { date: '2024-01-02', count: 18 }
          ]
        }
      }).as('getActivityStats');
      cy.visit('/activities/stats');
    });

    it('should display comprehensive activity statistics', () => {
      cy.wait('@getActivityStats');
      
      // Main stats grid
      cy.get('[data-testid="stats-grid"]').should('be.visible');
      cy.get('[data-testid="stat-total"]').should('contain.text', '156');
      cy.get('[data-testid="stat-today"]').should('contain.text', '23');
      cy.get('[data-testid="stat-week"]').should('contain.text', '89');
      cy.get('[data-testid="stat-month"]').should('contain.text', '145');
    });

    it('should show activity type breakdown chart', () => {
      cy.wait('@getActivityStats');
      
      // Chart container
      cy.get('[data-testid="activity-types-chart"]').should('be.visible');
      cy.get('[data-testid="chart-legend"]').should('be.visible');
      
      // Chart data points
      cy.get('[data-testid="chart-item-project-created"]').should('be.visible');
      cy.get('[data-testid="chart-item-user-login"]').should('be.visible');
      cy.get('[data-testid="chart-item-document-uploaded"]').should('be.visible');
    });

    it('should display activity trends over time', () => {
      cy.wait('@getActivityStats');
      
      // Trends chart
      cy.get('[data-testid="activity-trends-chart"]').should('be.visible');
      cy.get('[data-testid="trends-timeline"]').should('be.visible');
      
      // Time period selector
      cy.get('[data-testid="time-period-selector"]').should('be.visible');
      cy.get('[data-testid="period-week"]').click();
      
      // Verify updated request
      cy.intercept('GET', `${apiEndpoints.stats}?period=week`).as('getWeeklyStats');
      cy.wait('@getWeeklyStats');
    });

    it('should export activity statistics', () => {
      cy.wait('@getActivityStats');
      
      // Export options
      cy.get('[data-testid="export-stats"]').should('be.visible').click();
      cy.get('[data-testid="export-dropdown"]').should('be.visible');
      
      // CSV export
      cy.get('[data-testid="export-csv"]').click();
      cy.get('[data-testid="export-progress"]').should('be.visible');
      
      // Verify download
      cy.readFile('cypress/downloads/activity-stats.csv', { timeout: 10000 })
        .should('exist');
    });
  });

  describe('Admin Activities - Administrative View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.adminActivities, {
        fixture: 'activities/admin-activities.json'
      }).as('getAdminActivities');
      cy.visit('/admin/activities');
    });

    it('should display admin activities with enhanced details', () => {
      cy.wait('@getAdminActivities');
      
      // Admin-specific layout
      cy.get('[data-testid="admin-activities-header"]').should('be.visible');
      cy.get('[data-testid="admin-activities-controls"]').should('be.visible');
      
      // Enhanced activity items
      cy.get('[data-testid="admin-activity-item"]').first().within(() => {
        cy.get('[data-testid="activity-severity"]').should('be.visible');
        cy.get('[data-testid="activity-source-ip"]').should('be.visible');
        cy.get('[data-testid="activity-user-agent"]').should('be.visible');
        cy.get('[data-testid="activity-session-id"]').should('be.visible');
      });
    });

    it('should provide advanced filtering for admin view', () => {
      cy.wait('@getAdminActivities');
      
      // Advanced filter panel
      cy.get('[data-testid="admin-filters"]').should('be.visible');
      cy.get('[data-testid="filter-severity"]').should('be.visible');
      cy.get('[data-testid="filter-user"]').should('be.visible');
      cy.get('[data-testid="filter-ip-address"]').should('be.visible');
      
      // Apply severity filter
      cy.get('[data-testid="filter-severity"]').select('high');
      cy.intercept('GET', `${apiEndpoints.adminActivities}?severity=high*`).as('getHighSeverity');
      cy.wait('@getHighSeverity');
    });

    it('should allow bulk actions on admin activities', () => {
      cy.wait('@getAdminActivities');
      
      // Select multiple activities
      cy.get('[data-testid="select-activity-1"]').check();
      cy.get('[data-testid="select-activity-2"]').check();
      
      // Bulk actions menu
      cy.get('[data-testid="bulk-actions"]').should('be.visible').click();
      cy.get('[data-testid="bulk-archive"]').should('be.visible');
      cy.get('[data-testid="bulk-export"]').should('be.visible');
      cy.get('[data-testid="bulk-delete"]').should('be.visible');
      
      // Archive selected
      cy.intercept('POST', `${apiEndpoints.adminActivities}/bulk-archive`).as('bulkArchive');
      cy.get('[data-testid="bulk-archive"]').click();
      cy.get('[data-testid="confirm-bulk-action"]').click();
      cy.wait('@bulkArchive');
    });
  });

  describe('Error States & Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      // Simulate server error
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getActivitiesError');
      
      cy.visit('/activities');
      cy.wait('@getActivitiesError');
      
      // Error state display
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', /error|failed|unable/i);
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Retry functionality
      cy.intercept('GET', apiEndpoints.activities, {
        fixture: 'activities/activities-list.json'
      }).as('getActivitiesRetry');
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getActivitiesRetry');
      cy.get('[data-testid="activities-list"]').should('be.visible');
    });

    it('should show empty state when no activities exist', () => {
      cy.intercept('GET', apiEndpoints.activities, {
        body: { activities: [], pagination: { total: 0 } }
      }).as('getEmptyActivities');
      
      cy.visit('/activities');
      cy.wait('@getEmptyActivities');
      
      // Empty state
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-message"]')
        .should('contain.text', /no activities|empty/i);
      cy.get('[data-testid="empty-state-illustration"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      // Simulate network failure
      cy.intercept('GET', apiEndpoints.activities, { forceNetworkError: true }).as('networkError');
      
      cy.visit('/activities');
      cy.wait('@networkError');
      
      // Network error state
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
      cy.get('[data-testid="reconnect-button"]').should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.activities, {
        body: { invalid: 'response format' }
      }).as('getMalformedResponse');
      
      cy.visit('/activities');
      cy.wait('@getMalformedResponse');
      
      // Malformed data handling
      cy.get('[data-testid="data-error"]').should('be.visible');
      cy.get('[data-testid="data-error-message"]')
        .should('contain.text', /invalid|unexpected/i);
    });

    it('should validate large datasets performance', () => {
      // Mock large dataset
      const largeActivities = Array(1000).fill(null).map((_, i) => ({
        id: i + 1,
        type: 'bulk_activity',
        description: `Bulk activity ${i + 1}`,
        createdAt: new Date().toISOString(),
        metadata: { index: i }
      }));
      
      cy.intercept('GET', apiEndpoints.activities, {
        body: { activities: largeActivities, pagination: { total: 1000 } }
      }).as('getLargeDataset');
      
      cy.visit('/activities');
      cy.wait('@getLargeDataset');
      
      // Performance considerations
      cy.get('[data-testid="activities-list"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length', 50); // Virtualized list
      cy.get('[data-testid="load-more"]').should('be.visible');
    });

    it('should handle concurrent user sessions', () => {
      // Simulate real-time updates
      cy.intercept('GET', apiEndpoints.activities, {
        fixture: 'activities/activities-list.json'
      }).as('getInitialActivities');
      
      cy.visit('/activities');
      cy.wait('@getInitialActivities');
      
      // Simulate new activity from another user
      cy.intercept('GET', apiEndpoints.recent, {
        body: {
          activities: [{
            id: 9999,
            type: 'concurrent_update',
            description: 'Activity from another session',
            createdAt: new Date().toISOString(),
            isNew: true
          }]
        }
      }).as('getConcurrentUpdate');
      
      // Trigger refresh
      cy.get('[data-testid="refresh-activities"]').click();
      cy.wait('@getConcurrentUpdate');
      
      // New activity indicator
      cy.get('[data-testid="new-activity-badge"]').should('be.visible');
      cy.get('[data-testid="activity-9999"]')
        .should('have.class', 'new-activity');
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.activities, {
        fixture: 'activities/activities-list.json'
      }).as('getActivities');
      cy.visit('/activities');
      cy.wait('@getActivities');
    });

    it('should support full keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-activities');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-type');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-date');
      
      // Navigate to activity items
      cy.get('[data-testid="activity-item"]').first()
        .focus()
        .type('{enter}');
      
      // Activity details should open
      cy.get('[data-testid="activity-details-modal"]').should('be.visible');
      
      // Escape to close
      cy.focused().type('{esc}');
      cy.get('[data-testid="activity-details-modal"]').should('not.exist');
    });

    it('should have proper ARIA labels and roles', () => {
      // Main landmarks
      cy.get('[role="main"]').should('exist');
      cy.get('[role="navigation"]').should('exist');
      
      // Interactive elements
      cy.get('[data-testid="search-activities"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');
      
      cy.get('[data-testid="filter-type"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'aria-expanded');
      
      // List semantics
      cy.get('[data-testid="activities-list"]')
        .should('have.attr', 'role', 'list');
      
      cy.get('[data-testid="activity-item"]')
        .should('have.attr', 'role', 'listitem')
        .and('have.attr', 'tabindex');
    });

    it('should announce dynamic content changes', () => {
      // Live region for updates
      cy.get('[aria-live="polite"]').should('exist');
      
      // Apply filter and check announcement
      cy.get('[data-testid="filter-type"]').select('project');
      
      // Aria-live region should update
      cy.get('[aria-live="polite"]')
        .should('contain.text', /filtered|updated|showing/i);
      
      // Search and check announcement
      cy.get('[data-testid="search-activities"]').type('test');
      cy.get('[aria-live="polite"]')
        .should('contain.text', /search|results/i);
    });

    it('should support screen reader navigation', () => {
      // Heading structure
      cy.get('h1').should('exist').and('be.visible');
      cy.get('h2').should('have.length.at.least', 1);
      
      // Skip links
      cy.get('[data-testid="skip-to-content"]')
        .should('exist')
        .and('have.attr', 'href', '#main-content');
      
      // Focus management
      cy.get('[data-testid="activity-item"]').first().click();
      cy.get('[data-testid="activity-details-modal"]').should('be.visible');
      cy.focused().should('be.within', '[data-testid="activity-details-modal"]');
    });

    it('should maintain focus order and trap', () => {
      // Open modal
      cy.get('[data-testid="activity-item"]').first().click();
      cy.get('[data-testid="activity-details-modal"]').should('be.visible');
      
      // Focus should be trapped in modal
      cy.get('[data-testid="activity-details-modal"] [tabindex="0"]').first().focus();
      
      // Tab through modal elements
      cy.focused().tab();
      cy.focused().should('be.within', '[data-testid="activity-details-modal"]');
      
      // Last element should loop back to first
      cy.get('[data-testid="activity-details-modal"] [tabindex="0"]').last().focus().tab();
      cy.focused().should('be.within', '[data-testid="activity-details-modal"]');
    });
  });

  describe('Performance & Load Testing', () => {
    it('should handle rapid successive API calls', () => {
      cy.intercept('GET', apiEndpoints.activities).as('getActivities');
      
      cy.visit('/activities');
      cy.wait('@getActivities');
      
      // Rapid filter changes
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="filter-type"]').select('project');
        cy.get('[data-testid="filter-type"]').select('user');
      }
      
      // Should debounce requests
      cy.get('@getActivities.all').should('have.length.lessThan', 15);
    });

    it('should implement efficient infinite scrolling', () => {
      // Mock paginated data
      cy.intercept('GET', `${apiEndpoints.activities}*`, (req) => {
        const page = new URL(req.url).searchParams.get('page') || '1';
        const activities = Array(20).fill(null).map((_, i) => ({
          id: (parseInt(page) - 1) * 20 + i + 1,
          type: 'scroll_test',
          description: `Activity ${(parseInt(page) - 1) * 20 + i + 1}`,
          createdAt: new Date().toISOString()
        }));
        
        req.reply({
          body: { activities, pagination: { page: parseInt(page), hasMore: true } }
        });
      }).as('getScrollData');
      
      cy.visit('/activities');
      cy.wait('@getScrollData');
      
      // Scroll to bottom
      cy.get('[data-testid="activities-list"]').scrollTo('bottom');
      cy.wait('@getScrollData');
      
      // More items should load
      cy.get('[data-testid="activity-item"]').should('have.length', 40);
    });

    it('should cache and reuse data appropriately', () => {
      cy.intercept('GET', apiEndpoints.activities).as('getActivities');
      
      cy.visit('/activities');
      cy.wait('@getActivities');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/activities');
      
      // Should use cached data initially
      cy.get('[data-testid="activities-list"]').should('be.visible');
      
      // Fresh data request after cache expiry
      cy.get('[data-testid="refresh-activities"]').click();
      cy.wait('@getActivities');
    });
  });
});
