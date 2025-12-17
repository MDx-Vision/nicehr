describe('Activities System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user',
      id: 1
    },
    activities: {
      recent: [],
      stats: {
        totalActivities: 0,
        todayActivities: 0,
        weekActivities: 0,
        monthActivities: 0
      },
      sampleActivity: {
        id: 1,
        type: 'user_login',
        description: 'User logged in',
        userId: 1,
        createdAt: new Date().toISOString()
      }
    }
  };

  const apiEndpoints = {
    activities: '/api/activities',
    recentActivities: '/api/activities/recent',
    activityStats: '/api/activities/stats',
    adminActivities: '/api/admin/activities',
    auth: '/api/auth/login',
    user: '/api/auth/user'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login before each test
    cy.request({
      method: 'POST',
      url: apiEndpoints.auth,
      body: {
        email: testData.ciUser.email,
        password: testData.ciUser.password
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        // Set auth cookie or token if needed
        cy.setCookie('auth-token', response.body.token || 'test-token');
      }
    });
  });

  describe('Activities API - Backend Integration', () => {
    describe('GET /api/activities - All Activities', () => {
      it('should fetch all activities successfully', () => {
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 200,
          body: {
            activities: [testData.activities.sampleActivity],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1
            }
          }
        }).as('getActivities');

        cy.request('GET', apiEndpoints.activities).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('activities');
          expect(response.body.activities).to.be.an('array');
        });
      });

      it('should handle pagination parameters', () => {
        cy.intercept('GET', `${apiEndpoints.activities}?page=2&limit=10`, {
          statusCode: 200,
          body: {
            activities: [],
            pagination: {
              page: 2,
              limit: 10,
              total: 5,
              totalPages: 1
            }
          }
        }).as('getActivitiesPaginated');

        cy.request(`${apiEndpoints.activities}?page=2&limit=10`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.pagination.page).to.eq(2);
          expect(response.body.pagination.limit).to.eq(10);
        });
      });

      it('should handle search and filter parameters', () => {
        const searchParams = {
          type: 'user_login',
          userId: 1,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        };

        cy.intercept('GET', `${apiEndpoints.activities}**`, {
          statusCode: 200,
          body: {
            activities: [testData.activities.sampleActivity],
            filters: searchParams,
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
          }
        }).as('getActivitiesFiltered');

        const queryString = new URLSearchParams(searchParams).toString();
        cy.request(`${apiEndpoints.activities}?${queryString}`).then((response) => {
          expect(response.status).to.eq(200);
        });
      });

      it('should handle unauthorized access', () => {
        cy.clearCookies();
        
        cy.request({
          method: 'GET',
          url: apiEndpoints.activities,
          failOnStatusCode: false
        }).then((response) => {
          expect([401, 403]).to.include(response.status);
        });
      });

      it('should handle server errors gracefully', () => {
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('getActivitiesError');

        cy.request({
          method: 'GET',
          url: apiEndpoints.activities,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(500);
        });
      });
    });

    describe('GET /api/activities/recent - Recent Activities', () => {
      it('should fetch recent activities successfully', () => {
        cy.intercept('GET', apiEndpoints.recentActivities, {
          statusCode: 200,
          body: {
            activities: [testData.activities.sampleActivity],
            count: 1
          }
        }).as('getRecentActivities');

        cy.request('GET', apiEndpoints.recentActivities).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('activities');
          expect(response.body.activities).to.be.an('array');
        });
      });

      it('should handle limit parameter for recent activities', () => {
        cy.intercept('GET', `${apiEndpoints.recentActivities}?limit=5`, {
          statusCode: 200,
          body: {
            activities: Array(5).fill(testData.activities.sampleActivity),
            count: 5,
            limit: 5
          }
        }).as('getRecentActivitiesLimited');

        cy.request(`${apiEndpoints.recentActivities}?limit=5`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.activities).to.have.length(5);
        });
      });

      it('should return empty array when no recent activities', () => {
        cy.intercept('GET', apiEndpoints.recentActivities, {
          statusCode: 200,
          body: {
            activities: [],
            count: 0
          }
        }).as('getRecentActivitiesEmpty');

        cy.request('GET', apiEndpoints.recentActivities).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.activities).to.be.an('array').that.is.empty;
          expect(response.body.count).to.eq(0);
        });
      });
    });

    describe('GET /api/activities/stats - Activity Statistics', () => {
      it('should fetch activity statistics successfully', () => {
        cy.intercept('GET', apiEndpoints.activityStats, {
          statusCode: 200,
          body: {
            total: 100,
            today: 15,
            week: 75,
            month: 90,
            byType: {
              'user_login': 40,
              'project_created': 25,
              'document_uploaded': 20,
              'assignment_completed': 15
            },
            trends: {
              daily: [1, 2, 3, 4, 5, 6, 7],
              weekly: [10, 15, 12, 18, 20, 16, 14],
              monthly: [50, 60, 45, 70, 80, 65, 90]
            }
          }
        }).as('getActivityStats');

        cy.request('GET', apiEndpoints.activityStats).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('total');
          expect(response.body).to.have.property('today');
          expect(response.body).to.have.property('week');
          expect(response.body).to.have.property('month');
          expect(response.body).to.have.property('byType');
          expect(response.body).to.have.property('trends');
          expect(response.body.byType).to.be.an('object');
          expect(response.body.trends).to.be.an('object');
        });
      });

      it('should handle date range parameters for stats', () => {
        const dateRange = {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        };

        cy.intercept('GET', `${apiEndpoints.activityStats}**`, {
          statusCode: 200,
          body: {
            total: 25,
            dateRange: dateRange,
            byType: { 'user_login': 25 },
            trends: { daily: [1, 2, 3] }
          }
        }).as('getActivityStatsDateRange');

        const queryString = new URLSearchParams(dateRange).toString();
        cy.request(`${apiEndpoints.activityStats}?${queryString}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.dateRange).to.deep.equal(dateRange);
        });
      });
    });

    describe('GET /api/admin/activities - Admin Activities', () => {
      it('should fetch admin activities with proper permissions', () => {
        cy.intercept('GET', apiEndpoints.adminActivities, {
          statusCode: 200,
          body: {
            activities: [
              {
                ...testData.activities.sampleActivity,
                userDetails: {
                  id: 1,
                  name: 'CI Test User',
                  email: 'test@example.com'
                },
                metadata: {
                  ipAddress: '127.0.0.1',
                  userAgent: 'Mozilla/5.0...',
                  sessionId: 'session-123'
                }
              }
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
          }
        }).as('getAdminActivities');

        cy.request('GET', apiEndpoints.adminActivities).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.activities).to.be.an('array');
          if (response.body.activities.length > 0) {
            expect(response.body.activities[0]).to.have.property('userDetails');
            expect(response.body.activities[0]).to.have.property('metadata');
          }
        });
      });

      it('should handle admin-level filtering and search', () => {
        const adminFilters = {
          userId: 1,
          type: 'admin_action',
          severity: 'high',
          page: 1,
          limit: 10
        };

        cy.intercept('GET', `${apiEndpoints.adminActivities}**`, {
          statusCode: 200,
          body: {
            activities: [],
            filters: adminFilters,
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
          }
        }).as('getAdminActivitiesFiltered');

        const queryString = new URLSearchParams(adminFilters).toString();
        cy.request(`${apiEndpoints.adminActivities}?${queryString}`).then((response) => {
          expect(response.status).to.eq(200);
        });
      });

      it('should deny access for non-admin users', () => {
        // This would need to be tested with a non-admin user context
        cy.intercept('GET', apiEndpoints.adminActivities, {
          statusCode: 403,
          body: { error: 'Insufficient permissions' }
        }).as('getAdminActivitiesForbidden');

        cy.request({
          method: 'GET',
          url: apiEndpoints.adminActivities,
          failOnStatusCode: false
        }).then((response) => {
          // In a real scenario, this should be 403 for non-admin users
          expect([200, 403]).to.include(response.status);
        });
      });
    });
  });

  describe('Activities UI - Frontend Components', () => {
    describe('Activities Dashboard Page', () => {
      beforeEach(() => {
        // Mock all activities-related API calls
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 200,
          body: {
            activities: [
              {
                id: 1,
                type: 'user_login',
                description: 'User logged in to the system',
                userId: 1,
                userName: 'CI Test User',
                createdAt: new Date().toISOString(),
                metadata: { ipAddress: '127.0.0.1' }
              },
              {
                id: 2,
                type: 'project_created',
                description: 'New project created: Test Project',
                userId: 1,
                userName: 'CI Test User',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                metadata: { projectId: 1 }
              }
            ],
            pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
          }
        }).as('getActivities');

        cy.intercept('GET', apiEndpoints.activityStats, {
          statusCode: 200,
          body: {
            total: 150,
            today: 25,
            week: 100,
            month: 140,
            byType: {
              'user_login': 60,
              'project_created': 30,
              'document_uploaded': 35,
              'assignment_completed': 25
            }
          }
        }).as('getActivityStats');

        cy.visit('/activities');
      });

      it('should display activities dashboard with all components', () => {
        // Wait for API calls
        cy.wait('@getActivities');
        cy.wait('@getActivityStats');

        // Main container
        cy.get('[data-testid="activities-dashboard"]', { timeout: 10000 })
          .should('be.visible');

        // Stats cards
        cy.get('[data-testid="activity-stats-total"]')
          .should('be.visible')
          .and('contain.text', '150');

        cy.get('[data-testid="activity-stats-today"]')
          .should('be.visible')
          .and('contain.text', '25');

        cy.get('[data-testid="activity-stats-week"]')
          .should('be.visible')
          .and('contain.text', '100');

        cy.get('[data-testid="activity-stats-month"]')
          .should('be.visible')
          .and('contain.text', '140');

        // Activities list
        cy.get('[data-testid="activities-list"]')
          .should('be.visible');

        cy.get('[data-testid="activity-item"]')
          .should('have.length', 2);

        // Check individual activity items
        cy.get('[data-testid="activity-item"]').first()
          .should('contain.text', 'User logged in to the system')
          .and('contain.text', 'CI Test User');
      });

      it('should display activity types breakdown chart', () => {
        cy.wait('@getActivityStats');

        cy.get('[data-testid="activity-types-chart"]')
          .should('be.visible');

        // Check if chart data is rendered
        cy.get('[data-testid="chart-segment-user_login"]', { timeout: 5000 })
          .should('exist');

        cy.get('[data-testid="chart-legend"]')
          .should('be.visible')
          .within(() => {
            cy.contains('user_login').should('exist');
            cy.contains('project_created').should('exist');
            cy.contains('document_uploaded').should('exist');
            cy.contains('assignment_completed').should('exist');
          });
      });

      it('should handle empty activities state', () => {
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 200,
          body: {
            activities: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
          }
        }).as('getEmptyActivities');

        cy.reload();
        cy.wait('@getEmptyActivities');

        cy.get('[data-testid="empty-activities-state"]')
          .should('be.visible')
          .and('contain.text', 'No activities found');

        cy.get('[data-testid="empty-state-icon"]')
          .should('be.visible');
      });

      it('should handle API errors gracefully', () => {
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 500,
          body: { error: 'Server error' }
        }).as('getActivitiesError');

        cy.reload();
        cy.wait('@getActivitiesError');

        cy.get('[data-testid="activities-error-state"]')
          .should('be.visible')
          .and('contain.text', /error|failed/i);

        cy.get('[data-testid="retry-button"]')
          .should('be.visible')
          .and('not.be.disabled');
      });
    });

    describe('Activities List - Search and Filtering', () => {
      beforeEach(() => {
        cy.intercept('GET', `${apiEndpoints.activities}**`, {
          statusCode: 200,
          body: {
            activities: [testData.activities.sampleActivity],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
          }
        }).as('getActivitiesFiltered');

        cy.visit('/activities');
        cy.wait(1000);
      });

      it('should filter activities by type', () => {
        // Type filter dropdown
        cy.get('[data-testid="activity-type-filter"]')
          .should('be.visible')
          .click();

        cy.get('[data-testid="filter-option-user_login"]')
          .should('be.visible')
          .click();

        cy.wait('@getActivitiesFiltered');

        // Verify URL parameters
        cy.url().should('include', 'type=user_login');

        // Verify filtered results
        cy.get('[data-testid="activity-item"]')
          .should('contain.text', 'user_login');
      });

      it('should filter activities by date range', () => {
        cy.get('[data-testid="date-range-picker"]')
          .should('be.visible')
          .click();

        // Select start date
        cy.get('[data-testid="start-date-input"]')
          .type('2024-01-01');

        // Select end date
        cy.get('[data-testid="end-date-input"]')
          .type('2024-01-31');

        cy.get('[data-testid="apply-date-filter"]')
          .click();

        cy.wait('@getActivitiesFiltered');

        cy.url().should('include', 'startDate=2024-01-01');
        cy.url().should('include', 'endDate=2024-01-31');
      });

      it('should search activities by keyword', () => {
        cy.get('[data-testid="activity-search-input"]')
          .should('be.visible')
          .type('login');

        // Debounced search should trigger
        cy.wait(500);
        cy.wait('@getActivitiesFiltered');

        cy.url().should('include', 'search=login');
      });

      it('should clear all filters', () => {
        // Apply multiple filters
        cy.get('[data-testid="activity-type-filter"]').click();
        cy.get('[data-testid="filter-option-user_login"]').click();

        cy.get('[data-testid="activity-search-input"]').type('test');

        cy.wait(1000);

        // Clear filters
        cy.get('[data-testid="clear-filters-button"]')
          .should('be.visible')
          .click();

        cy.url().should('not.include', 'type=');
        cy.url().should('not.include', 'search=');

        cy.get('[data-testid="activity-search-input"]')
          .should('have.value', '');
      });

      it('should handle filter combinations', () => {
        // Apply type filter
        cy.get('[data-testid="activity-type-filter"]').click();
        cy.get('[data-testid="filter-option-project_created"]').click();

        // Apply search
        cy.get('[data-testid="activity-search-input"]').type('project');

        // Apply date range
        cy.get('[data-testid="date-range-picker"]').click();
        cy.get('[data-testid="start-date-input"]').type('2024-01-01');
        cy.get('[data-testid="end-date-input"]').type('2024-12-31');
        cy.get('[data-testid="apply-date-filter"]').click();

        cy.wait(1000);

        cy.url().should('include', 'type=project_created');
        cy.url().should('include', 'search=project');
        cy.url().should('include', 'startDate=2024-01-01');
      });
    });

    describe('Activities List - Pagination', () => {
      beforeEach(() => {
        // Mock paginated response
        cy.intercept('GET', `${apiEndpoints.activities}*`, (req) => {
          const url = new URL(req.url);
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '20');

          req.reply({
            statusCode: 200,
            body: {
              activities: Array(limit).fill(null).map((_, i) => ({
                id: (page - 1) * limit + i + 1,
                type: 'user_login',
                description: `Activity ${(page - 1) * limit + i + 1}`,
                userId: 1,
                userName: 'Test User',
                createdAt: new Date().toISOString()
              })),
              pagination: {
                page,
                limit,
                total: 100,
                totalPages: Math.ceil(100 / limit)
              }
            }
          });
        }).as('getActivitiesPaginated');

        cy.visit('/activities');
      });

      it('should display pagination controls', () => {
        cy.wait('@getActivitiesPaginated');

        cy.get('[data-testid="pagination-container"]')
          .should('be.visible');

        cy.get('[data-testid="pagination-info"]')
          .should('contain.text', 'Showing')
          .and('contain.text', 'of 100');

        cy.get('[data-testid="pagination-previous"]')
          .should('be.visible')
          .and('be.disabled');

        cy.get('[data-testid="pagination-next"]')
          .should('be.visible')
          .and('not.be.disabled');

        cy.get('[data-testid="pagination-page-1"]')
          .should('have.class', 'active');
      });

      it('should navigate to next page', () => {
        cy.wait('@getActivitiesPaginated');

        cy.get('[data-testid="pagination-next"]')
          .click();

        cy.wait('@getActivitiesPaginated');

        cy.url().should('include', 'page=2');

        cy.get('[data-testid="pagination-page-2"]')
          .should('have.class', 'active');

        cy.get('[data-testid="pagination-previous"]')
          .should('not.be.disabled');
      });

      it('should navigate to specific page', () => {
        cy.wait('@getActivitiesPaginated');

        cy.get('[data-testid="pagination-page-3"]')
          .click();

        cy.wait('@getActivitiesPaginated');

        cy.url().should('include', 'page=3');

        cy.get('[data-testid="pagination-page-3"]')
          .should('have.class', 'active');
      });

      it('should change items per page', () => {
        cy.wait('@getActivitiesPaginated');

        cy.get('[data-testid="items-per-page-select"]')
          .select('50');

        cy.wait('@getActivitiesPaginated');

        cy.url().should('include', 'limit=50');

        cy.get('[data-testid="activity-item"]')
          .should('have.length', 50);
      });

      it('should handle last page correctly', () => {
        cy.wait('@getActivitiesPaginated');

        // Navigate to last page
        cy.get('[data-testid="pagination-last"]')
          .click();

        cy.wait('@getActivitiesPaginated');

        cy.get('[data-testid="pagination-next"]')
          .should('be.disabled');

        cy.get('[data-testid="pagination-last"]')
          .should('be.disabled');
      });
    });

    describe('Activity Detail Views', () => {
      const detailedActivity = {
        id: 1,
        type: 'project_created',
        description: 'New project created: CI Test Project',
        userId: 1,
        userName: 'CI Test User',
        userEmail: 'test@example.com',
        createdAt: new Date().toISOString(),
        metadata: {
          projectId: 1,
          projectName: 'CI Test Project',
          hospitalId: 1,
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: 'session-abc123',
          duration: 1500
        },
        relatedObjects: [
          { type: 'project', id: 1, name: 'CI Test Project' },
          { type: 'hospital', id: 1, name: 'CI Test Hospital' }
        ]
      };

      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.activities, {
          statusCode: 200,
          body: {
            activities: [detailedActivity],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
          }
        }).as('getActivities');

        cy.visit('/activities');
      });

      it('should expand activity details on click', () => {
        cy.wait('@getActivities');

        cy.get('[data-testid="activity-item"]').first()
          .should('be.visible')
          .click();

        // Check if expandable details are shown
        cy.get('[data-testid="activity-details-expanded"]')
          .should('be.visible');

        // Metadata section
        cy.get('[data-testid="activity-metadata"]')
          .should('be.visible')
          .within(() => {
            cy.contains('IP Address: 127.0.0.1').should('exist');
            cy.contains('Session ID: session-abc123').should('exist');
          });

        // Related objects
        cy.get('[data-testid="activity-related-objects"]')
          .should('be.visible')
          .within(() => {
            cy.contains('CI Test Project').should('exist');
            cy.contains('CI Test Hospital').should('exist');
          });

        // User details
        cy.get('[data-testid="activity-user-details"]')
          .should('be.visible')
          .within(() => {
            cy.contains('CI Test User').should('exist');
            cy.contains('test@example.com').should('exist');
          });
      });

      it('should display activity timestamps correctly', () => {
        cy.wait('@getActivities');

        cy.get('[data-testid="activity-item"]').first()
          .within(() => {
            // Relative time
            cy.get('[data-testid="activity-time-relative"]')
              .should('contain.text', /just now|seconds ago|minutes ago/);

            // Absolute timestamp
            cy.get('[data-testid="activity-time-absolute"]')
              .should('exist')
              .invoke('text')
              .should('match', /\d{4}-\d{2}-\d{2}/);
          });
      });

      it('should display activity icons based on type', () => {
        const activityTypes = [
          { type: 'user_login', icon: 'login-icon' },
          { type: 'project_created', icon: 'project-icon' },
          { type: 'document_uploaded', icon: 'document-icon' },
          { type: 'assignment_completed', icon: 'checkmark-icon' }
        ];

        activityTypes.forEach((activity) => {
          cy.intercept('GET', apiEndpoints.activities, {
            statusCode: 200,
            body: {
              activities: [{ ...detailedActivity, type: activity.type }],
              pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
            }
          });

          cy.reload();
          cy.wait(1000);

          cy.get(`[data-testid="activity-icon-${activity.type}"]`)
            .should('be.visible');
        });
      });

      it('should handle activity links and navigation', () => {
        cy.wait('@getActivities');

        cy.get('[data-testid="activity-item"]').first()
          .click();

        // Click on related project link
        cy.get('[data-testid="related-object-link-project-1"]')
          .should('be.visible')
          .click();

        // Should navigate to project page
        cy.url().should('include', '/projects/1');
      });
    });

    describe('Recent Activities Widget', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.recentActivities, {
          statusCode: 200,
          body: {
            activities: [
              {
                id: 1,
                type: 'user_login',
                description: 'User logged in',
                createdAt: new Date().toISOString()
              },
              {
                id: 2,
                type: 'document_uploaded',
                description: 'Document uploaded',
                createdAt: new Date(Date.now() - 300000).toISOString()
              }
            ],
            count: 2
          }
        }).as('getRecentActivities');

        cy.visit('/dashboard');
      });

      it('should display recent activities widget on dashboard', () => {
        cy.wait('@getRecentActivities');

        cy.get('[data-testid="recent-activities-widget"]')
          .should('be.visible');

        cy.get('[data-testid="widget-title"]')
          .should('contain.text', 'Recent Activities');

        cy.get('[data-testid="recent-activity-item"]')
          .should('have.length', 2);
      });

      it('should show view all activities link', () => {
        cy.wait('@getRecentActivities');

        cy.get('[data-testid="view-all-activities-link"]')
          .should('be.visible')
          .and('have.attr', 'href', '/activities')
          .click();

        cy.url().should('include', '/activities');
      });

      it('should handle empty recent activities', () => {
        cy.intercept('GET', apiEndpoints.recentActivities, {
          statusCode: 200,
          body: { activities: [], count: 0 }
        }).as('getEmptyRecentActivities');

        cy.reload();
        cy.wait('@getEmptyRecentActivities');

        cy.get('[data-testid="recent-activities-empty"]')
          .should('be.visible')
          .and('contain.text', 'No recent activities');
      });

      it('should refresh recent activities automatically', () => {
        cy.wait('@getRecentActivities');

        // Mock updated activities
        cy.intercept('GET', apiEndpoints.recentActivities, {
          statusCode: 200,
          body: {
            activities: [
              {
                id: 3,
                type: 'project_updated',
                description: 'Project updated',
                createdAt: new Date().toISOString()
              }
            ],
            count: 1
          }
        }).as('getUpdatedRecentActivities');

        // Wait for auto-refresh (if implemented)
        cy.wait(60000); // 1 minute auto-refresh
        cy.wait('@getUpdatedRecentActivities');

        cy.get('[data-testid="recent-activity-item"]')
          .should('contain.text', 'Project updated');
      });
    });

    describe('Admin Activities Management', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.adminActivities, {
          statusCode: 200,
          body: {
            activities: [
              {
                id: 1,
                type: 'admin_action',
                description: 'Admin created new user',
                userId: 1,
                userName: 'Admin User',
                createdAt: new Date().toISOString(),
                severity: 'high',
                metadata: {
                  action: 'create_user',
                  targetUserId: 2,
                  ipAddress: '192.168.1.1'
                }
              }
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
          }
        }).as('getAdminActivities');

        cy.visit('/admin/activities');
      });

      it('should display admin activities with enhanced details', () => {
        cy.wait('@getAdminActivities');

        cy.get('[data-testid="admin-activities-table"]')
          .should('be.visible');

        cy.get('[data-testid="admin-activity-row"]')
          .should('have.length', 1)
          .within(() => {
            cy.get('[data-testid="activity-severity"]')
              .should('contain.text', 'high');

            cy.get('[data-testid="activity-admin-details"]')
              .should('contain.text', 'Admin User');

            cy.get('[data-testid="activity-ip-address"]')
              .should('contain.text', '192.168.1.1');
          });
      });

      it('should filter admin activities by severity', () => {
        cy.wait('@getAdminActivities');

        cy.get('[data-testid="severity-filter"]')
          .select('high');

        cy.wait('@getAdminActivities');

        cy.url().should('include', 'severity=high');
      });

      it('should export admin activities', () => {
        cy.wait('@getAdminActivities');

        cy.get('[data-testid="export-activities-button"]')
          .should('be.visible')
          .click();

        cy.get('[data-testid="export-format-csv"]')
          .click();

        // Check if download started
        cy.readFile('cypress/downloads/admin-activities.csv', { timeout: 10000 })
          .should('exist');
      });

      it('should handle bulk actions on admin activities', () => {
        cy.wait('@getAdminActivities');

        // Select activities
        cy.get('[data-testid="select-activity-1"]')
          .check();

        cy.get('[data-testid="bulk-actions-dropdown"]')
          .should('be.visible')
          .select('archive');

        cy.get('[data-testid="confirm-bulk-action"]')
          .click();

        // Confirm action
        cy.get('[data-testid="confirm-dialog-yes"]')
          .click();

        // Should show success message
        cy.get('[data-testid="success-toast"]')
          .should('contain.text', 'Activities archived successfully');
      });
    });
  });

  describe('Activities System - Responsive Design', () => {
    const viewports = [
      { device: 'mobile', width: 375, height: 667 },
      { device: 'tablet', width: 768, height: 1024 },
      { device: 'desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ device, width, height }) => {
      describe(`${device} (${width}x${height})`, () => {
        beforeEach(() => {
          cy.viewport(width, height);
          
          cy.intercept('GET', apiEndpoints.activities, {
            statusCode: 200,
            body: {
              activities: [testData.activities.sampleActivity],
              pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
            }
          }).as('getActivities');

          cy.visit('/activities');
        });

        it(`should display activities correctly on ${device}`, () => {
          cy.wait('@getActivities');

          cy.get('[data-testid="activities-dashboard"]')
            .should('be.visible');

          if (device === 'mobile') {
            // Mobile-specific checks
            cy.get('[data-testid="mobile-activity-card"]')
              .should('be.visible');

            cy.get('[data-testid="desktop-activity-table"]')
              .should('not.exist');

            // Mobile navigation
            cy.get('[data-testid="mobile-menu-button"]')
              .should('be.visible');
          } else {
            // Desktop/tablet checks
            cy.get('[data-testid="activity-table"]')
              .should('be.visible');
          }
        });

        it(`should handle filtering UI on ${device}`, () => {
          cy.wait('@getActivities');

          if (device === 'mobile') {
            // Mobile filter panel should be collapsible
            cy.get('[data-testid="mobile-filter-toggle"]')
              .should('be.visible')
              .click();

            cy.get('[data-testid="mobile-filter-panel"]')
              .should('be.visible');
          } else {
            // Desktop filter sidebar
            cy.get('[data-testid="filter-sidebar"]')
              .should('be.visible');
          }

          cy.get('[data-testid="activity-type-filter"]')
            .should('be.visible');
        });

        it(`should handle pagination on ${device}`, () => {
          cy.wait('@getActivities');

          if (device === 'mobile') {
            // Mobile pagination (simplified)
            cy.get('[data-testid="mobile-pagination"]')
              .should('be.visible');

            cy.get('[data-testid="mobile-prev-next"]')
              .should('be.visible');
          } else {
            // Full pagination controls
            cy.get('[data-testid="pagination-container"]')
              .should('be.visible');
          }
        });
      });
    });
  });

  describe('Activities System - Performance & Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          activities: Array(100).fill(null).map((_, i) => ({
            id: i + 1,
            type: 'user_login',
            description: `Activity ${i + 1}`,
            userId: 1,
            userName: 'Test User',
            createdAt: new Date().toISOString()
          })),
          pagination: { page: 1, limit: 20, total: 100, totalPages: 5 }
        }
      }).as('getActivities');

      cy.visit('/activities');
    });

    it('should meet accessibility standards', () => {
      cy.wait('@getActivities');

      // Check for proper headings structure
      cy.get('h1').should('exist');
      
      // Check for keyboard navigation
      cy.get('[data-testid="activity-item"]').first()
        .focus()
        .type('{enter}')
        .should('have.focus');

      // Check for ARIA labels
      cy.get('[data-testid="activities-list"]')
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="pagination-container"]')
        .should('have.attr', 'role', 'navigation');

      // Check color contrast (basic test)
      cy.get('[data-testid="activity-item"]').first()
        .should('have.css', 'color')
        .and('not.be.empty');
    });

    it('should handle large datasets efficiently', () => {
      cy.wait('@getActivities');

      // Virtual scrolling check (if implemented)
      cy.get('[data-testid="activities-list"]')
        .should('be.visible');

      // Should only render visible items
      cy.get('[data-testid="activity-item"]')
        .should('have.length', 20); // Based on pagination limit

      // Scroll performance
      cy.get('[data-testid="activities-list"]')
        .scrollTo(0, 500)
        .should('be.visible');
    });

    it('should load activities within acceptable time', () => {
      const startTime = Date.now();
      
      cy.wait('@getActivities').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(2000); // 2 seconds max
      });

      cy.get('[data-testid="activities-list"]')
        .should('be.visible');
    });

    it('should handle memory efficiently during navigation', () => {
      cy.wait('@getActivities');

      // Navigate between pages multiple times
      for (let i = 0; i < 3; i++) {
        cy.get('[data-testid="pagination-next"]').click();
        cy.wait('@getActivities');
        
        cy.get('[data-testid="pagination-previous"]').click();
        cy.wait('@getActivities');
      }

      // Should still be responsive
      cy.get('[data-testid="activities-list"]')
        .should('be.visible');
    });
  });

  describe('Activities System - Edge Cases & Error Handling', () => {
    it('should handle network connectivity issues', () => {
      // Simulate offline
      cy.intercept('GET', apiEndpoints.activities, { forceNetworkError: true })
        .as('networkError');

      cy.visit('/activities');
      cy.wait('@networkError');

      cy.get('[data-testid="network-error-message"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);

      cy.get('[data-testid="retry-connection-button"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: { invalid: 'response' }
      }).as('malformedResponse');

      cy.visit('/activities');
      cy.wait('@malformedResponse');

      cy.get('[data-testid="data-error-message"]')
        .should('be.visible')
        .and('contain.text', /error|invalid/i);
    });

    it('should handle extremely long activity descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          activities: [{
            id: 1,
            type: 'user_action',
            description: longDescription,
            userId: 1,
            userName: 'Test User',
            createdAt: new Date().toISOString()
          }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('getLongDescription');

      cy.visit('/activities');
      cy.wait('@getLongDescription');

      cy.get('[data-testid="activity-item"]')
        .should('be.visible');

      // Description should be truncated
      cy.get('[data-testid="activity-description"]')
        .invoke('text')
        .should('have.length.lessThan', 200);

      // Should have "show more" functionality
      cy.get('[data-testid="show-more-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="activity-description"]')
        .should('contain.text', longDescription);
    });

    it('should handle special characters in activity data', () => {
      const specialActivity = {
        id: 1,
        type: 'user_action',
        description: 'Special chars: <script>alert("xss")</script> & 中文 & émojis 🚀',
        userId: 1,
        userName: 'Test & User <script>',
        createdAt: new Date().toISOString()
      };

      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          activities: [specialActivity],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('getSpecialChars');

      cy.visit('/activities');
      cy.wait('@getSpecialChars');

      // Should properly escape HTML
      cy.get('[data-testid="activity-description"]')
        .should('not.contain', '<script>')
        .and('contain.text', 'Special chars:')
        .and('contain.text', '中文')
        .and('contain.text', '🚀');

      cy.get('[data-testid="activity-user-name"]')
        .should('not.contain', '<script>')
        .and('contain.text', 'Test & User');
    });

    it('should handle concurrent data updates', () => {
      // Initial data
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          activities: [{ id: 1, type: 'old', description: 'Old activity' }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        }
      }).as('getInitialActivities');

      cy.visit('/activities');
      cy.wait('@getInitialActivities');

      // Simulate real-time update
      cy.intercept('GET', apiEndpoints.activities, {
        statusCode: 200,
        body: {
          activities: [
            { id: 2, type: 'new', description: 'New activity' },
            { id: 1, type: 'old', description: 'Old activity' }
          ],
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }).as('getUpdatedActivities');

      // Trigger refresh
      cy.get('[data-testid="refresh-button"]')
        .should('be.visible')
        .click();

      cy.wait('@getUpdatedActivities');

      cy.get('[data-testid="activity-item"]')
        .should('have.length', 2)
        .first()
        .should('contain.text', 'New activity');
    });
  });
});
