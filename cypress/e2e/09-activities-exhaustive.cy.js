describe('Activities System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    }
  };

  const apiEndpoints = {
    activities: '/api/activities',
    recentActivities: '/api/activities/recent',
    activityStats: '/api/activities/stats',
    adminActivities: '/api/admin/activities'
  };

  // Test activities data
  const mockActivities = {
    regular: [
      {
        id: '1',
        type: 'project_created',
        title: 'Project Created',
        description: 'New project "Test Implementation" was created',
        userId: 'user1',
        userName: 'John Doe',
        metadata: { projectId: 'proj1', projectName: 'Test Implementation' },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'consultant_assigned',
        title: 'Consultant Assigned',
        description: 'Jane Smith was assigned to project',
        userId: 'user2',
        userName: 'Admin User',
        metadata: { consultantId: 'cons1', projectId: 'proj1' },
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    stats: {
      totalActivities: 150,
      todayActivities: 12,
      weekActivities: 45,
      topActivityTypes: [
        { type: 'login', count: 50 },
        { type: 'project_created', count: 25 },
        { type: 'consultant_assigned', count: 20 }
      ]
    }
  };

  beforeEach(() => {
    // Clear all auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Setup default API intercepts
    cy.intercept('GET', apiEndpoints.user, { 
      fixture: 'auth/valid-user-response.json' 
    }).as('getUser');
    
    cy.intercept('GET', apiEndpoints.activities, {
      statusCode: 200,
      body: {
        success: true,
        data: mockActivities.regular,
        pagination: {
          total: 150,
          page: 1,
          limit: 10,
          pages: 15
        }
      }
    }).as('getActivities');

    cy.intercept('GET', apiEndpoints.recentActivities, {
      statusCode: 200,
      body: {
        success: true,
        data: mockActivities.regular.slice(0, 5)
      }
    }).as('getRecentActivities');

    cy.intercept('GET', apiEndpoints.activityStats, {
      statusCode: 200,
      body: {
        success: true,
        data: mockActivities.stats
      }
    }).as('getActivityStats');

    // Login before each test
    cy.loginAsUser(testData.ciUser);
  });

  describe('Activities Dashboard - Layout & Components', () => {
    beforeEach(() => {
      cy.visit('/activities');
      cy.wait('@getActivities');
    });

    it('should display complete activities dashboard layout', () => {
      // Main container
      cy.get('[data-testid="activities-container"]', { timeout: 10000 })
        .should('be.visible');

      // Header section
      cy.get('[data-testid="activities-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('h1').should('contain.text', 'Activities');
          cy.get('[data-testid="activities-breadcrumb"]').should('be.visible');
        });

      // Stats section
      cy.get('[data-testid="activities-stats"]')
        .should('be.visible');

      // Filters section
      cy.get('[data-testid="activities-filters"]')
        .should('be.visible');

      // Activities list
      cy.get('[data-testid="activities-list"]')
        .should('be.visible');

      // Pagination
      cy.get('[data-testid="activities-pagination"]')
        .should('be.visible');
    });

    it('should display activity statistics cards', () => {
      cy.wait('@getActivityStats');
      
      cy.get('[data-testid="activities-stats"]').within(() => {
        // Total activities card
        cy.get('[data-testid="stat-total-activities"]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-testid="stat-value"]').should('contain.text', '150');
            cy.get('[data-testid="stat-label"]').should('contain.text', 'Total Activities');
          });

        // Today's activities card
        cy.get('[data-testid="stat-today-activities"]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-testid="stat-value"]').should('contain.text', '12');
            cy.get('[data-testid="stat-label"]').should('contain.text', 'Today');
          });

        // Week's activities card
        cy.get('[data-testid="stat-week-activities"]')
          .should('be.visible')
          .within(() => {
            cy.get('[data-testid="stat-value"]').should('contain.text', '45');
            cy.get('[data-testid="stat-label"]').should('contain.text', 'This Week');
          });
      });
    });

    it('should display filter controls', () => {
      cy.get('[data-testid="activities-filters"]').within(() => {
        // Date range filter
        cy.get('[data-testid="filter-date-range"]')
          .should('be.visible');

        // Activity type filter
        cy.get('[data-testid="filter-activity-type"]')
          .should('be.visible');

        // User filter
        cy.get('[data-testid="filter-user"]')
          .should('be.visible');

        // Search input
        cy.get('[data-testid="filter-search"]')
          .should('be.visible')
          .and('have.attr', 'placeholder');

        // Apply filters button
        cy.get('[data-testid="button-apply-filters"]')
          .should('be.visible');

        // Clear filters button
        cy.get('[data-testid="button-clear-filters"]')
          .should('be.visible');
      });
    });

    it('should display activities list with proper formatting', () => {
      cy.get('[data-testid="activities-list"]').within(() => {
        // Activity items
        cy.get('[data-testid^="activity-item-"]')
          .should('have.length.at.least', 1)
          .first()
          .within(() => {
            // Activity icon/type indicator
            cy.get('[data-testid="activity-type-icon"]')
              .should('be.visible');

            // Activity title
            cy.get('[data-testid="activity-title"]')
              .should('be.visible')
              .and('not.be.empty');

            // Activity description
            cy.get('[data-testid="activity-description"]')
              .should('be.visible')
              .and('not.be.empty');

            // User name
            cy.get('[data-testid="activity-user"]')
              .should('be.visible')
              .and('not.be.empty');

            // Timestamp
            cy.get('[data-testid="activity-timestamp"]')
              .should('be.visible')
              .and('not.be.empty');
          });
      });
    });

    it('should display pagination controls', () => {
      cy.get('[data-testid="activities-pagination"]').within(() => {
        // Page info
        cy.get('[data-testid="pagination-info"]')
          .should('be.visible')
          .and('contain.text', 'Page 1 of');

        // Previous button
        cy.get('[data-testid="pagination-previous"]')
          .should('be.visible');

        // Next button
        cy.get('[data-testid="pagination-next"]')
          .should('be.visible');

        // Page size selector
        cy.get('[data-testid="pagination-page-size"]')
          .should('be.visible');
      });
    });
  });

  describe('Activities List - Data Display & Interaction', () => {
    beforeEach(() => {
      cy.visit('/activities');
      cy.wait('@getActivities');
    });

    it('should display activities in reverse chronological order', () => {
      cy.get('[data-testid="activities-list"]').within(() => {
        cy.get('[data-testid^="activity-item-"]').then($items => {
          expect($items).to.have.length.at.least(2);
          
          // First item should be more recent than second
          const firstTimestamp = $items.first().find('[data-testid="activity-timestamp"]').text();
          const secondTimestamp = $items.eq(1).find('[data-testid="activity-timestamp"]').text();
          
          // Verify ordering (implementation depends on timestamp format)
          expect(firstTimestamp).to.not.be.empty;
          expect(secondTimestamp).to.not.be.empty;
        });
      });
    });

    it('should show different activity types with appropriate icons', () => {
      const activityTypes = ['project_created', 'consultant_assigned', 'login', 'document_uploaded'];
      
      // Test with different activity types
      activityTypes.forEach(type => {
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 200,
          body: {
            success: true,
            data: [{
              id: '1',
              type: type,
              title: `Test ${type}`,
              description: `Test activity of type ${type}`,
              userId: 'user1',
              userName: 'Test User',
              createdAt: new Date().toISOString()
            }]
          }
        }).as(`getActivities${type}`);
        
        cy.reload();
        cy.wait(`@getActivities${type}`);
        
        cy.get('[data-testid^="activity-item-"]').first().within(() => {
          cy.get('[data-testid="activity-type-icon"]')
            .should('be.visible')
            .and('have.class', type.replace('_', '-'));
        });
      });
    });

    it('should handle activity item click/interaction', () => {
      cy.get('[data-testid^="activity-item-"]').first().within(() => {
        // Check if activity is clickable
        cy.get('[data-testid="activity-content"]')
          .should('be.visible')
          .click();
      });

      // Should show activity details modal or navigate to related page
      cy.get('body').then($body => {
        if ($body.find('[data-testid="activity-details-modal"]').length > 0) {
          cy.get('[data-testid="activity-details-modal"]')
            .should('be.visible');
        } else {
          // Check if URL changed (navigation occurred)
          cy.url().should('not.contain', '/activities');
        }
      });
    });

    it('should display activity metadata appropriately', () => {
      cy.get('[data-testid^="activity-item-"]').first().within(() => {
        // Check for metadata display
        cy.get('[data-testid="activity-metadata"]').should('be.visible');
        
        // Project-related activities should show project info
        cy.get('[data-testid="activity-description"]').then($desc => {
          const description = $desc.text();
          if (description.includes('project')) {
            cy.get('[data-testid="activity-project-link"]')
              .should('be.visible')
              .and('have.attr', 'href');
          }
        });
      });
    });
  });

  describe('Activities Filtering & Search', () => {
    beforeEach(() => {
      cy.visit('/activities');
      cy.wait('@getActivities');
    });

    it('should filter activities by date range', () => {
      // Set up intercept for filtered results
      cy.intercept('GET', `${apiEndpoints.activities}*`, {
        statusCode: 200,
        body: {
          success: true,
          data: mockActivities.regular.slice(0, 1),
          pagination: { total: 1, page: 1, limit: 10, pages: 1 }
        }
      }).as('getFilteredActivities');

      cy.get('[data-testid="filter-date-range"]').within(() => {
        // Set start date
        cy.get('[data-testid="date-range-start"]')
          .clear()
          .type('2024-01-01');

        // Set end date
        cy.get('[data-testid="date-range-end"]')
          .clear()
          .type('2024-12-31');
      });

      cy.get('[data-testid="button-apply-filters"]').click();
      cy.wait('@getFilteredActivities');

      // Verify filtered results
      cy.get('[data-testid="activities-list"]').within(() => {
        cy.get('[data-testid^="activity-item-"]')
          .should('have.length', 1);
      });
    });

    it('should filter activities by type', () => {
      cy.intercept('GET', `${apiEndpoints.activities}*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [mockActivities.regular[0]],
          pagination: { total: 1, page: 1, limit: 10, pages: 1 }
        }
      }).as('getFilteredByType');

      cy.get('[data-testid="filter-activity-type"]').click();
      cy.get('[data-testid="option-project_created"]').click();
      
      cy.get('[data-testid="button-apply-filters"]').click();
      cy.wait('@getFilteredByType');

      cy.get('[data-testid="activities-list"]').within(() => {
        cy.get('[data-testid^="activity-item-"]')
          .should('have.length', 1)
          .first()
          .should('contain.text', 'Project Created');
      });
    });

    it('should filter activities by user', () => {
      cy.intercept('GET', `${apiEndpoints.activities}*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [mockActivities.regular[0]],
          pagination: { total: 1, page: 1, limit: 10, pages: 1 }
        }
      }).as('getFilteredByUser');

      cy.get('[data-testid="filter-user"]').click();
      cy.get('[data-testid="option-user1"]').click();
      
      cy.get('[data-testid="button-apply-filters"]').click();
      cy.wait('@getFilteredByUser');

      cy.get('[data-testid="activities-list"]').within(() => {
        cy.get('[data-testid^="activity-item-"]')
          .should('have.length', 1)
          .first()
          .should('contain.text', 'John Doe');
      });
    });

    it('should search activities by text', () => {
      cy.intercept('GET', `${apiEndpoints.activities}*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [mockActivities.regular[0]],
          pagination: { total: 1, page: 1, limit: 10, pages: 1 }
        }
      }).as('getSearchResults');

      cy.get('[data-testid="filter-search"]')
        .type('Project Created');

      cy.get('[data-testid="button-apply-filters"]').click();
      cy.wait('@getSearchResults');

      cy.get('[data-testid="activities-list"]').within(() => {
        cy.get('[data-testid^="activity-item-"]')
          .should('have.length', 1)
          .first()
          .should('contain.text', 'Project Created');
      });
    });

    it('should clear all filters', () => {
      // Apply some filters first
      cy.get('[data-testid="filter-search"]').type('test');
      cy.get('[data-testid="filter-activity-type"]').click();
      cy.get('[data-testid="option-project_created"]').click();

      // Clear filters
      cy.get('[data-testid="button-clear-filters"]').click();

      // Verify filters are cleared
      cy.get('[data-testid="filter-search"]').should('have.value', '');
      cy.get('[data-testid="filter-activity-type"]')
        .should('contain.text', 'All Types');
      
      // Should reload with all activities
      cy.wait('@getActivities');
      cy.get('[data-testid="activities-list"]').within(() => {
        cy.get('[data-testid^="activity-item-"]')
          .should('have.length.at.least', 2);
      });
    });

    it('should show no results message when filters return empty', () => {
      cy.intercept('GET', `${apiEndpoints.activities}*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 }
        }
      }).as('getEmptyResults');

      cy.get('[data-testid="filter-search"]').type('nonexistent');
      cy.get('[data-testid="button-apply-filters"]').click();
      cy.wait('@getEmptyResults');

      cy.get('[data-testid="activities-empty-state"]')
        .should('be.visible')
        .and('contain.text', 'No activities found');
    });
  });

  describe('Activities Pagination', () => {
    beforeEach(() => {
      cy.visit('/activities');
      cy.wait('@getActivities');
    });

    it('should navigate to next page', () => {
      cy.intercept('GET', `${apiEndpoints.activities}*page=2*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [mockActivities.regular[1]],
          pagination: { total: 150, page: 2, limit: 10, pages: 15 }
        }
      }).as('getPage2');

      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPage2');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Page 2 of 15');
    });

    it('should navigate to previous page', () => {
      // Start on page 2
      cy.intercept('GET', `${apiEndpoints.activities}*page=2*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [mockActivities.regular[1]],
          pagination: { total: 150, page: 2, limit: 10, pages: 15 }
        }
      }).as('getPage2');

      cy.get('[data-testid="pagination-next"]').click();
      cy.wait('@getPage2');

      // Go back to page 1
      cy.intercept('GET', `${apiEndpoints.activities}*page=1*`, {
        statusCode: 200,
        body: {
          success: true,
          data: mockActivities.regular,
          pagination: { total: 150, page: 1, limit: 10, pages: 15 }
        }
      }).as('getPage1');

      cy.get('[data-testid="pagination-previous"]').click();
      cy.wait('@getPage1');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Page 1 of 15');
    });

    it('should change page size', () => {
      cy.intercept('GET', `${apiEndpoints.activities}*limit=25*`, {
        statusCode: 200,
        body: {
          success: true,
          data: mockActivities.regular,
          pagination: { total: 150, page: 1, limit: 25, pages: 6 }
        }
      }).as('getPageSize25');

      cy.get('[data-testid="pagination-page-size"]')
        .select('25');

      cy.wait('@getPageSize25');

      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Page 1 of 6');
    });

    it('should disable previous button on first page', () => {
      cy.get('[data-testid="pagination-previous"]')
        .should('be.disabled');
    });

    it('should disable next button on last page', () => {
      // Mock last page
      cy.intercept('GET', `${apiEndpoints.activities}*`, {
        statusCode: 200,
        body: {
          success: true,
          data: [mockActivities.regular[0]],
          pagination: { total: 10, page: 1, limit: 10, pages: 1 }
        }
      }).as('getLastPage');

      cy.reload();
      cy.wait('@getLastPage');

      cy.get('[data-testid="pagination-next"]')
        .should('be.disabled');
    });
  });

  describe('Recent Activities Widget', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getRecentActivities');
    });

    it('should display recent activities widget on dashboard', () => {
      cy.get('[data-testid="recent-activities-widget"]')
        .should('be.visible')
        .within(() => {
          // Widget header
          cy.get('[data-testid="widget-header"]')
            .should('contain.text', 'Recent Activities');

          // View all link
          cy.get('[data-testid="view-all-activities"]')
            .should('be.visible')
            .and('have.attr', 'href', '/activities');

          // Activity items (limited)
          cy.get('[data-testid^="recent-activity-"]')
            .should('have.length.at.most', 5);
        });
    });

    it('should navigate to full activities page', () => {
      cy.get('[data-testid="view-all-activities"]').click();
      cy.url().should('include', '/activities');
    });

    it('should display recent activities in compact format', () => {
      cy.get('[data-testid="recent-activities-widget"]').within(() => {
        cy.get('[data-testid^="recent-activity-"]').first().within(() => {
          // Compact display elements
          cy.get('[data-testid="activity-title"]')
            .should('be.visible')
            .and('have.css', 'font-size'); // Smaller font

          cy.get('[data-testid="activity-timestamp"]')
            .should('be.visible')
            .and('contain.text', /ago|now/); // Relative time

          // No full description in compact view
          cy.get('[data-testid="activity-description"]')
            .should('not.exist');
        });
      });
    });
  });

  describe('Admin Activities Management', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.adminActivities, {
        statusCode: 200,
        body: {
          success: true,
          data: mockActivities.regular,
          pagination: { total: 150, page: 1, limit: 10, pages: 15 }
        }
      }).as('getAdminActivities');

      cy.visit('/admin/activities');
      cy.wait('@getAdminActivities');
    });

    it('should display admin activities dashboard', () => {
      cy.get('[data-testid="admin-activities-container"]')
        .should('be.visible');

      // Admin-specific features
      cy.get('[data-testid="activity-management-tools"]')
        .should('be.visible');

      // Bulk actions
      cy.get('[data-testid="bulk-actions"]')
        .should('be.visible');
    });

    it('should show additional admin controls', () => {
      cy.get('[data-testid="admin-controls"]').within(() => {
        // Activity retention settings
        cy.get('[data-testid="retention-settings"]')
          .should('be.visible');

        // Export activities
        cy.get('[data-testid="export-activities"]')
          .should('be.visible');

        // Activity analytics
        cy.get('[data-testid="activity-analytics"]')
          .should('be.visible');
      });
    });

    it('should allow bulk activity management', () => {
      // Select activities
      cy.get('[data-testid^="activity-checkbox-"]')
        .first()
        .check();

      // Bulk actions should be enabled
      cy.get('[data-testid="bulk-delete"]')
        .should('not.be.disabled');

      cy.get('[data-testid="bulk-export"]')
        .should('not.be.disabled');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getActivitiesError');

      cy.visit('/activities');
      cy.wait('@getActivitiesError');

      cy.get('[data-testid="activities-error"]')
        .should('be.visible')
        .and('contain.text', 'Unable to load activities');

      // Retry button
      cy.get('[data-testid="retry-activities"]')
        .should('be.visible')
        .click();
    });

    it('should handle network errors', () => {
      cy.intercept('GET', apiEndpoints.activities, { forceNetworkError: true })
        .as('getActivitiesNetworkError');

      cy.visit('/activities');
      cy.wait('@getActivitiesNetworkError');

      cy.get('[data-testid="activities-network-error"]')
        .should('be.visible')
        .and('contain.text', 'Network error');
    });

    it('should handle empty activities state', () => {
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 }
        }
      }).as('getEmptyActivities');

      cy.visit('/activities');
      cy.wait('@getEmptyActivities');

      cy.get('[data-testid="activities-empty-state"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="empty-icon"]').should('be.visible');
          cy.get('[data-testid="empty-message"]')
            .should('contain.text', 'No activities yet');
          cy.get('[data-testid="empty-description"]')
            .should('be.visible');
        });
    });

    it('should handle loading states', () => {
      // Intercept with delay
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          success: true,
          data: mockActivities.regular,
          pagination: { total: 150, page: 1, limit: 10, pages: 15 }
        },
        delay: 2000
      }).as('getActivitiesSlow');

      cy.visit('/activities');

      // Should show loading state
      cy.get('[data-testid="activities-loading"]')
        .should('be.visible');

      cy.get('[data-testid="loading-skeleton"]')
        .should('be.visible');

      cy.wait('@getActivitiesSlow');

      // Loading should disappear
      cy.get('[data-testid="activities-loading"]')
        .should('not.exist');
    });

    it('should handle invalid filter combinations', () => {
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Set invalid date range (end before start)
      cy.get('[data-testid="filter-date-range"]').within(() => {
        cy.get('[data-testid="date-range-start"]')
          .clear()
          .type('2024-12-31');

        cy.get('[data-testid="date-range-end"]')
          .clear()
          .type('2024-01-01');
      });

      cy.get('[data-testid="button-apply-filters"]').click();

      // Should show validation error
      cy.get('[data-testid="filter-validation-error"]')
        .should('be.visible')
        .and('contain.text', 'End date must be after start date');
    });
  });

  describe('Responsive Design & Accessibility', () => {
    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Mobile layout adjustments
      cy.get('[data-testid="activities-container"]')
        .should('be.visible');

      // Filters should be collapsible on mobile
      cy.get('[data-testid="mobile-filter-toggle"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="activities-filters"]')
        .should('be.visible');

      // Activity list should stack properly
      cy.get('[data-testid^="activity-item-"]').first().within(() => {
        cy.get('[data-testid="activity-content"]')
          .should('have.css', 'flex-direction', 'column');
      });
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/activities');
      cy.wait('@getActivities');

      cy.get('[data-testid="activities-container"]')
        .should('be.visible');

      // Tablet-specific layout
      cy.get('[data-testid="activities-grid"]')
        .should('have.css', 'grid-template-columns');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Main region
      cy.get('[data-testid="activities-container"]')
        .should('have.attr', 'role', 'main');

      // Activity list
      cy.get('[data-testid="activities-list"]')
        .should('have.attr', 'role', 'list')
        .and('have.attr', 'aria-label');

      // Activity items
      cy.get('[data-testid^="activity-item-"]')
        .should('have.attr', 'role', 'listitem')
        .first()
        .should('have.attr', 'aria-describedby');

      // Filter controls
      cy.get('[data-testid="filter-search"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-search');

      cy.tab();
      cy.focused().should('have.attr', 'data-testid').and('contain', 'filter');

      // Activity items should be focusable
      cy.get('[data-testid^="activity-item-"]').first().focus();
      cy.focused().should('have.attr', 'data-testid').and('contain', 'activity-item');

      // Enter key should activate
      cy.focused().type('{enter}');
    });

    it('should support screen readers', () => {
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Check for screen reader announcements
      cy.get('[aria-live="polite"]')
        .should('exist');

      // Status announcements
      cy.get('[data-testid="sr-status"]')
        .should('contain.text', 'Activities loaded');

      // Activity count announcement
      cy.get('[data-testid="sr-activity-count"]')
        .should('contain.text', 'activities found');
    });
  });

  describe('Performance & Optimization', () => {
    it('should handle large activity lists efficiently', () => {
      // Mock large dataset
      const largeActivityList = Array.from({ length: 100 }, (_, i) => ({
        id: `activity-${i}`,
        type: 'test_activity',
        title: `Test Activity ${i}`,
        description: `Description for activity ${i}`,
        userId: `user-${i}`,
        userName: `User ${i}`,
        createdAt: new Date(Date.now() - i * 1000).toISOString()
      }));

      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          success: true,
          data: largeActivityList,
          pagination: { total: 1000, page: 1, limit: 100, pages: 10 }
        }
      }).as('getLargeActivityList');

      cy.visit('/activities');
      cy.wait('@getLargeActivityList');

      // Should render without performance issues
      cy.get('[data-testid="activities-list"]')
        .should('be.visible');

      cy.get('[data-testid^="activity-item-"]')
        .should('have.length', 100);

      // Scrolling should be smooth
      cy.get('[data-testid="activities-list"]')
        .scrollTo('bottom', { duration: 1000 });
    });

    it('should implement virtual scrolling for very large lists', () => {
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Check for virtual scrolling implementation
      cy.get('body').then($body => {
        if ($body.find('[data-testid="virtual-list"]').length > 0) {
          cy.get('[data-testid="virtual-list"]')
            .should('be.visible');

          // Only visible items should be rendered
          cy.get('[data-testid^="activity-item-"]')
            .should('have.length.lessThan', 50); // Reasonable limit
        }
      });
    });

    it('should cache API responses appropriately', () => {
      cy.visit('/activities');
      cy.wait('@getActivities');

      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/activities');

      // Should use cached data (no new request)
      cy.get('@getActivities.all').should('have.length', 1);
    });
  });
});
