describe('Schedules Feature - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    schedule: {
      title: 'Test Schedule',
      description: 'Test schedule description',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      shift: 'day',
      hoursPerWeek: 40
    },
    assignment: {
      consultantId: 'ci-test-consultant',
      role: 'Analyst',
      startTime: '08:00',
      endTime: '17:00',
      notes: 'Test assignment notes'
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    projects: '/api/projects',
    projectSchedules: `/api/projects/${testData.project.id}/schedules`,
    schedules: '/api/schedules',
    scheduleAssignments: '/api/schedules/*/assignments',
    consultantSchedules: `/api/consultants/${testData.consultant.id}/schedules`,
    consultants: '/api/consultants',
    hospitals: '/api/hospitals'
  };

  const selectors = {
    navigation: '[data-testid="nav-schedules"]',
    pageHeader: '[data-testid="schedules-header"]',
    createButton: '[data-testid="create-schedule-btn"]',
    searchInput: '[data-testid="search-schedules"]',
    filterDropdown: '[data-testid="filter-schedules"]',
    schedulesList: '[data-testid="schedules-list"]',
    scheduleCard: '[data-testid="schedule-card"]',
    scheduleForm: '[data-testid="schedule-form"]',
    assignmentForm: '[data-testid="assignment-form"]',
    calendarView: '[data-testid="calendar-view"]',
    timelineView: '[data-testid="timeline-view"]',
    weekView: '[data-testid="week-view"]',
    monthView: '[data-testid="month-view"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    emptyState: '[data-testid="empty-state"]',
    errorMessage: '[data-testid="error-message"]',
    successMessage: '[data-testid="success-message"]'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Schedule Management Page - UI and Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
    });

    it('should display complete schedules page layout', () => {
      // Page header and title
      cy.get(selectors.pageHeader)
        .should('be.visible')
        .and('contain.text', 'Schedules');
      
      cy.title().should('contain', 'Schedules');
      
      // Main navigation
      cy.get(selectors.navigation)
        .should('be.visible')
        .and('have.class', 'active');
      
      // Action buttons
      cy.get(selectors.createButton)
        .should('be.visible')
        .and('contain.text', 'Create Schedule');
      
      // Search and filters
      cy.get(selectors.searchInput)
        .should('be.visible')
        .and('have.attr', 'placeholder', /search/i);
      
      cy.get(selectors.filterDropdown)
        .should('be.visible');
    });

    it('should display view toggle buttons', () => {
      // Calendar view toggle
      cy.get('[data-testid="view-calendar"]')
        .should('be.visible')
        .and('contain.text', 'Calendar');
      
      // List view toggle
      cy.get('[data-testid="view-list"]')
        .should('be.visible')
        .and('contain.text', 'List');
      
      // Timeline view toggle
      cy.get('[data-testid="view-timeline"]')
        .should('be.visible')
        .and('contain.text', 'Timeline');
    });

    it('should have proper accessibility attributes', () => {
      // Main content area
      cy.get('main').should('have.attr', 'role', 'main');
      
      // Search input
      cy.get(selectors.searchInput)
        .should('have.attr', 'aria-label')
        .and('have.attr', 'type', 'search');
      
      // Create button
      cy.get(selectors.createButton)
        .should('have.attr', 'aria-label')
        .and('have.attr', 'type', 'button');
      
      // Filter controls
      cy.get(selectors.filterDropdown)
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'combobox');
    });

    it('should handle responsive layout on different screen sizes', () => {
      // Desktop view
      cy.viewport(1200, 800);
      cy.get(selectors.schedulesList).should('be.visible');
      
      // Tablet view
      cy.viewport(768, 1024);
      cy.get(selectors.schedulesList).should('be.visible');
      
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      cy.get(selectors.createButton).should('be.visible');
    });
  });

  describe('Schedules List View - Data Display and Interactions', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
    });

    it('should display schedules in list format', () => {
      // List container
      cy.get(selectors.schedulesList)
        .should('be.visible');
      
      // Schedule cards
      cy.get(selectors.scheduleCard)
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          cy.get('[data-testid="schedule-title"]').should('be.visible');
          cy.get('[data-testid="schedule-dates"]').should('be.visible');
          cy.get('[data-testid="schedule-status"]').should('be.visible');
          cy.get('[data-testid="schedule-assignments-count"]').should('be.visible');
        });
    });

    it('should display schedule card information correctly', () => {
      cy.get(selectors.scheduleCard).first().within(() => {
        // Title
        cy.get('[data-testid="schedule-title"]')
          .should('contain.text', testData.schedule.title);
        
        // Date range
        cy.get('[data-testid="schedule-dates"]')
          .should('contain.text', testData.schedule.startDate)
          .and('contain.text', testData.schedule.endDate);
        
        // Status badge
        cy.get('[data-testid="schedule-status"]')
          .should('be.visible')
          .and('have.class', /status-/);
        
        // Progress indicator
        cy.get('[data-testid="schedule-progress"]')
          .should('be.visible');
        
        // Action buttons
        cy.get('[data-testid="view-schedule-btn"]').should('be.visible');
        cy.get('[data-testid="edit-schedule-btn"]').should('be.visible');
        cy.get('[data-testid="delete-schedule-btn"]').should('be.visible');
      });
    });

    it('should handle empty state correctly', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        body: []
      }).as('getEmptySchedules');
      
      cy.reload();
      cy.wait('@getEmptySchedules');
      
      cy.get(selectors.emptyState)
        .should('be.visible')
        .and('contain.text', 'No schedules found');
      
      cy.get('[data-testid="empty-state-create-btn"]')
        .should('be.visible')
        .and('contain.text', 'Create your first schedule');
    });

    it('should handle loading state', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        delay: 2000,
        fixture: 'schedules/project-schedules.json'
      }).as('getSlowSchedules');
      
      cy.reload();
      
      cy.get(selectors.loadingSpinner)
        .should('be.visible');
      
      cy.wait('@getSlowSchedules');
      
      cy.get(selectors.loadingSpinner)
        .should('not.exist');
      
      cy.get(selectors.schedulesList)
        .should('be.visible');
    });

    it('should handle API error states', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getSchedulesError');
      
      cy.reload();
      cy.wait('@getSchedulesError');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', /error.*loading.*schedules/i);
      
      cy.get('[data-testid="retry-btn"]')
        .should('be.visible')
        .and('contain.text', 'Retry');
    });
  });

  describe('Schedule Search and Filtering', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.intercept('GET', `${apiEndpoints.projectSchedules}?search=*`, {
        fixture: 'schedules/filtered-schedules.json'
      }).as('searchSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
    });

    it('should search schedules by title', () => {
      const searchTerm = 'Implementation';
      
      cy.get(selectors.searchInput)
        .type(searchTerm);
      
      cy.wait('@searchSchedules');
      
      cy.get(selectors.scheduleCard)
        .should('contain.text', searchTerm);
      
      // Clear search
      cy.get(selectors.searchInput)
        .clear();
      
      cy.get(selectors.scheduleCard)
        .should('have.length.at.least', 1);
    });

    it('should handle search with no results', () => {
      cy.intercept('GET', `${apiEndpoints.projectSchedules}?search=*`, {
        body: []
      }).as('searchNoResults');
      
      cy.get(selectors.searchInput)
        .type('nonexistentschedule');
      
      cy.wait('@searchNoResults');
      
      cy.get('[data-testid="no-results"]')
        .should('be.visible')
        .and('contain.text', 'No schedules match your search');
    });

    it('should filter schedules by status', () => {
      cy.intercept('GET', `${apiEndpoints.projectSchedules}?status=active`, {
        fixture: 'schedules/active-schedules.json'
      }).as('filterByStatus');
      
      cy.get(selectors.filterDropdown)
        .click();
      
      cy.get('[data-testid="filter-status-active"]')
        .click();
      
      cy.wait('@filterByStatus');
      
      cy.get(selectors.scheduleCard)
        .each(($card) => {
          cy.wrap($card)
            .find('[data-testid="schedule-status"]')
            .should('contain.text', 'Active');
        });
    });

    it('should filter schedules by date range', () => {
      cy.intercept('GET', `${apiEndpoints.projectSchedules}?startDate=*&endDate=*`, {
        fixture: 'schedules/date-filtered-schedules.json'
      }).as('filterByDateRange');
      
      cy.get('[data-testid="date-filter-btn"]')
        .click();
      
      cy.get('[data-testid="start-date-filter"]')
        .type('2024-02-01');
      
      cy.get('[data-testid="end-date-filter"]')
        .type('2024-02-28');
      
      cy.get('[data-testid="apply-date-filter"]')
        .click();
      
      cy.wait('@filterByDateRange');
      
      cy.get(selectors.scheduleCard)
        .should('have.length.at.least', 1);
    });

    it('should combine multiple filters', () => {
      cy.intercept('GET', `${apiEndpoints.projectSchedules}?search=*&status=*&startDate=*`, {
        fixture: 'schedules/multi-filtered-schedules.json'
      }).as('multiFilter');
      
      // Apply search
      cy.get(selectors.searchInput)
        .type('Test');
      
      // Apply status filter
      cy.get(selectors.filterDropdown)
        .click();
      cy.get('[data-testid="filter-status-active"]')
        .click();
      
      // Apply date filter
      cy.get('[data-testid="date-filter-btn"]')
        .click();
      cy.get('[data-testid="start-date-filter"]')
        .type('2024-02-01');
      cy.get('[data-testid="apply-date-filter"]')
        .click();
      
      cy.wait('@multiFilter');
      
      cy.get(selectors.scheduleCard)
        .should('exist');
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get(selectors.searchInput)
        .type('Test');
      
      cy.get(selectors.filterDropdown)
        .click();
      cy.get('[data-testid="filter-status-active"]')
        .click();
      
      // Clear all filters
      cy.get('[data-testid="clear-filters-btn"]')
        .click();
      
      cy.get(selectors.searchInput)
        .should('have.value', '');
      
      cy.get(selectors.scheduleCard)
        .should('have.length.at.least', 1);
    });
  });

  describe('Calendar View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
      
      // Switch to calendar view
      cy.get('[data-testid="view-calendar"]').click();
    });

    it('should display calendar layout', () => {
      cy.get(selectors.calendarView)
        .should('be.visible');
      
      // Calendar header with navigation
      cy.get('[data-testid="calendar-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="prev-month"]').should('be.visible');
          cy.get('[data-testid="next-month"]').should('be.visible');
          cy.get('[data-testid="current-month"]').should('be.visible');
        });
      
      // Calendar grid
      cy.get('[data-testid="calendar-grid"]')
        .should('be.visible');
      
      // Day headers
      cy.get('[data-testid="day-header"]')
        .should('have.length', 7);
    });

    it('should navigate between months', () => {
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      
      cy.get('[data-testid="current-month"]')
        .should('contain.text', currentMonth);
      
      // Navigate to next month
      cy.get('[data-testid="next-month"]')
        .click();
      
      cy.get('[data-testid="current-month"]')
        .should('not.contain.text', currentMonth);
      
      // Navigate back
      cy.get('[data-testid="prev-month"]')
        .click();
      
      cy.get('[data-testid="current-month"]')
        .should('contain.text', currentMonth);
    });

    it('should display schedule events on calendar', () => {
      cy.get('[data-testid="calendar-event"]')
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          cy.get('[data-testid="event-title"]').should('be.visible');
          cy.get('[data-testid="event-time"]').should('be.visible');
        });
    });

    it('should handle event clicks and show details', () => {
      cy.get('[data-testid="calendar-event"]')
        .first()
        .click();
      
      cy.get('[data-testid="event-popup"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="event-details"]').should('be.visible');
          cy.get('[data-testid="close-popup"]').should('be.visible');
        });
      
      // Close popup
      cy.get('[data-testid="close-popup"]')
        .click();
      
      cy.get('[data-testid="event-popup"]')
        .should('not.exist');
    });

    it('should allow creating new events by clicking on calendar dates', () => {
      cy.get('[data-testid="calendar-date"]')
        .first()
        .click();
      
      cy.get('[data-testid="quick-create-schedule"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="schedule-title-input"]').should('be.visible');
          cy.get('[data-testid="create-schedule-btn"]').should('be.visible');
          cy.get('[data-testid="cancel-btn"]').should('be.visible');
        });
    });

    it('should switch between month, week, and day views', () => {
      // Month view (default)
      cy.get(selectors.monthView)
        .should('be.visible');
      
      // Switch to week view
      cy.get('[data-testid="view-week"]')
        .click();
      
      cy.get(selectors.weekView)
        .should('be.visible');
      
      cy.get(selectors.monthView)
        .should('not.exist');
      
      // Switch to day view
      cy.get('[data-testid="view-day"]')
        .click();
      
      cy.get('[data-testid="day-view"]')
        .should('be.visible');
      
      cy.get(selectors.weekView)
        .should('not.exist');
    });
  });

  describe('Timeline View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
      
      // Switch to timeline view
      cy.get('[data-testid="view-timeline"]').click();
    });

    it('should display timeline layout', () => {
      cy.get(selectors.timelineView)
        .should('be.visible');
      
      // Timeline header
      cy.get('[data-testid="timeline-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="timeline-scale"]').should('be.visible');
          cy.get('[data-testid="zoom-controls"]').should('be.visible');
        });
      
      // Timeline grid
      cy.get('[data-testid="timeline-grid"]')
        .should('be.visible');
    });

    it('should display schedule bars on timeline', () => {
      cy.get('[data-testid="timeline-bar"]')
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          cy.get('[data-testid="bar-label"]').should('be.visible');
          cy.get('[data-testid="bar-progress"]').should('be.visible');
        });
    });

    it('should allow zooming timeline', () => {
      // Zoom in
      cy.get('[data-testid="zoom-in"]')
        .click();
      
      cy.get('[data-testid="timeline-scale"]')
        .should('contain.text', 'Week');
      
      // Zoom out
      cy.get('[data-testid="zoom-out"]')
        .click();
      
      cy.get('[data-testid="timeline-scale"]')
        .should('contain.text', 'Month');
    });

    it('should handle timeline bar interactions', () => {
      cy.get('[data-testid="timeline-bar"]')
        .first()
        .trigger('mouseover');
      
      cy.get('[data-testid="timeline-tooltip"]')
        .should('be.visible')
        .and('contain.text', testData.schedule.title);
      
      // Click to view details
      cy.get('[data-testid="timeline-bar"]')
        .first()
        .click();
      
      cy.get('[data-testid="schedule-details-panel"]')
        .should('be.visible');
    });
  });

  describe('Create Schedule - Form and Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultants, {
        fixture: 'consultants/consultants-list.json'
      }).as('getConsultants');
      
      cy.intercept('GET', apiEndpoints.projects, {
        fixture: 'projects/projects-list.json'
      }).as('getProjects');
      
      cy.visit('/schedules');
      cy.get(selectors.createButton).click();
    });

    it('should display create schedule form', () => {
      cy.get(selectors.scheduleForm)
        .should('be.visible')
        .within(() => {
          // Basic fields
          cy.get('[data-testid="input-title"]')
            .should('be.visible')
            .and('have.attr', 'required');
          
          cy.get('[data-testid="input-description"]')
            .should('be.visible');
          
          cy.get('[data-testid="input-start-date"]')
            .should('be.visible')
            .and('have.attr', 'required');
          
          cy.get('[data-testid="input-end-date"]')
            .should('be.visible')
            .and('have.attr', 'required');
          
          // Project selection
          cy.get('[data-testid="select-project"]')
            .should('be.visible');
          
          // Shift type
          cy.get('[data-testid="select-shift"]')
            .should('be.visible');
          
          // Hours per week
          cy.get('[data-testid="input-hours"]')
            .should('be.visible')
            .and('have.attr', 'type', 'number');
          
          // Form buttons
          cy.get('[data-testid="btn-save"]')
            .should('be.visible')
            .and('contain.text', 'Create Schedule');
          
          cy.get('[data-testid="btn-cancel"]')
            .should('be.visible')
            .and('contain.text', 'Cancel');
        });
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="btn-save"]').click();
      
      // Check validation messages
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      // Form should not be submitted
      cy.get(selectors.scheduleForm)
        .should('be.visible');
    });

    it('should validate date range', () => {
      // Fill required fields with invalid date range
      cy.get('[data-testid="input-title"]')
        .type(testData.schedule.title);
      
      cy.get('[data-testid="input-start-date"]')
        .type('2024-02-28');
      
      cy.get('[data-testid="input-end-date"]')
        .type('2024-02-01');
      
      cy.get('[data-testid="btn-save"]').click();
      
      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', 'End date must be after start date');
    });

    it('should validate hours per week', () => {
      // Test negative hours
      cy.get('[data-testid="input-hours"]')
        .type('-5');
      
      cy.get('[data-testid="btn-save"]').click();
      
      cy.get('[data-testid="error-hours"]')
        .should('be.visible')
        .and('contain.text', 'Hours must be positive');
      
      // Test excessive hours
      cy.get('[data-testid="input-hours"]')
        .clear()
        .type('200');
      
      cy.get('[data-testid="btn-save"]').click();
      
      cy.get('[data-testid="error-hours"]')
        .should('be.visible')
        .and('contain.text', 'Hours cannot exceed 168 per week');
    });

    it('should successfully create schedule with valid data', () => {
      cy.intercept('POST', apiEndpoints.projectSchedules, {
        statusCode: 201,
        body: { 
          id: 'new-schedule-id',
          ...testData.schedule 
        }
      }).as('createSchedule');
      
      // Fill form with valid data
      cy.get('[data-testid="input-title"]')
        .type(testData.schedule.title);
      
      cy.get('[data-testid="input-description"]')
        .type(testData.schedule.description);
      
      cy.get('[data-testid="input-start-date"]')
        .type(testData.schedule.startDate);
      
      cy.get('[data-testid="input-end-date"]')
        .type(testData.schedule.endDate);
      
      cy.get('[data-testid="select-project"]')
        .click();
      cy.get(`[data-testid="project-${testData.project.id}"]`)
        .click();
      
      cy.get('[data-testid="select-shift"]')
        .click();
      cy.get('[data-testid="shift-day"]')
        .click();
      
      cy.get('[data-testid="input-hours"]')
        .type(testData.schedule.hoursPerWeek.toString());
      
      // Submit form
      cy.get('[data-testid="btn-save"]').click();
      
      cy.wait('@createSchedule');
      
      // Should redirect to schedules list
      cy.url().should('include', '/schedules');
      
      // Should show success message
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Schedule created successfully');
    });

    it('should handle form submission errors', () => {
      cy.intercept('POST', apiEndpoints.projectSchedules, {
        statusCode: 400,
        body: { error: 'Validation error' }
      }).as('createScheduleError');
      
      // Fill form with valid data
      cy.get('[data-testid="input-title"]')
        .type(testData.schedule.title);
      
      cy.get('[data-testid="input-start-date"]')
        .type(testData.schedule.startDate);
      
      cy.get('[data-testid="input-end-date"]')
        .type(testData.schedule.endDate);
      
      cy.get('[data-testid="btn-save"]').click();
      
      cy.wait('@createScheduleError');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', 'Failed to create schedule');
      
      // Form should still be visible
      cy.get(selectors.scheduleForm)
        .should('be.visible');
    });

    it('should cancel form and return to schedules list', () => {
      // Fill some data
      cy.get('[data-testid="input-title"]')
        .type('Test Schedule');
      
      // Click cancel
      cy.get('[data-testid="btn-cancel"]').click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="confirm-cancel"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-yes"]').click();
        });
      
      // Should return to schedules list
      cy.url().should('include', '/schedules');
      cy.get(selectors.schedulesList).should('be.visible');
    });
  });

  describe('Edit Schedule', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.intercept('GET', '/api/schedules/test-schedule-id', {
        fixture: 'schedules/schedule-details.json'
      }).as('getScheduleDetails');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
      
      // Click edit on first schedule
      cy.get('[data-testid="edit-schedule-btn"]')
        .first()
        .click();
      
      cy.wait('@getScheduleDetails');
    });

    it('should display edit form with pre-populated data', () => {
      cy.get(selectors.scheduleForm)
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="input-title"]')
            .should('have.value', testData.schedule.title);
          
          cy.get('[data-testid="input-description"]')
            .should('have.value', testData.schedule.description);
          
          cy.get('[data-testid="input-start-date"]')
            .should('have.value', testData.schedule.startDate);
          
          cy.get('[data-testid="input-end-date"]')
            .should('have.value', testData.schedule.endDate);
          
          cy.get('[data-testid="btn-save"]')
            .should('contain.text', 'Update Schedule');
        });
    });

    it('should successfully update schedule', () => {
      cy.intercept('PATCH', '/api/schedules/test-schedule-id', {
        statusCode: 200,
        body: { 
          id: 'test-schedule-id',
          title: 'Updated Schedule Title'
        }
      }).as('updateSchedule');
      
      // Update title
      cy.get('[data-testid="input-title"]')
        .clear()
        .type('Updated Schedule Title');
      
      // Submit form
      cy.get('[data-testid="btn-save"]').click();
      
      cy.wait('@updateSchedule');
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Schedule updated successfully');
    });

    it('should handle update errors', () => {
      cy.intercept('PATCH', '/api/schedules/test-schedule-id', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('updateScheduleError');
      
      cy.get('[data-testid="input-title"]')
        .clear()
        .type('Updated Title');
      
      cy.get('[data-testid="btn-save"]').click();
      
      cy.wait('@updateScheduleError');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', 'Failed to update schedule');
    });
  });

  describe('Schedule Status Management', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
    });

    it('should display status badges correctly', () => {
      cy.get(selectors.scheduleCard).each(($card) => {
        cy.wrap($card)
          .find('[data-testid="schedule-status"]')
          .should('be.visible')
          .and('have.class', /status-/)
          .and('contain.text', /(draft|active|completed|cancelled)/i);
      });
    });

    it('should allow status changes', () => {
      cy.intercept('PATCH', '/api/schedules/*/status', {
        statusCode: 200,
        body: { status: 'active' }
      }).as('updateStatus');
      
      cy.get('[data-testid="schedule-status-dropdown"]')
        .first()
        .click();
      
      cy.get('[data-testid="status-active"]')
        .click();
      
      cy.wait('@updateStatus');
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Status updated successfully');
    });

    it('should confirm status changes that affect assignments', () => {
      cy.get('[data-testid="schedule-status-dropdown"]')
        .first()
        .click();
      
      cy.get('[data-testid="status-cancelled"]')
        .click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="confirm-status-change"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-message"]')
            .should('contain.text', 'This will affect');
          
          cy.get('[data-testid="confirm-yes"]').click();
        });
      
      cy.get(selectors.successMessage)
        .should('be.visible');
    });
  });

  describe('Schedule Assignments', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/schedules/test-schedule-id/assignments', {
        fixture: 'schedules/schedule-assignments.json'
      }).as('getAssignments');
      
      cy.intercept('GET', apiEndpoints.consultants, {
        fixture: 'consultants/consultants-list.json'
      }).as('getConsultants');
      
      cy.visit('/schedules/test-schedule-id');
      cy.wait(['@getAssignments', '@getConsultants']);
    });

    it('should display schedule assignments list', () => {
      cy.get('[data-testid="assignments-section"]')
        .should('be.visible');
      
      cy.get('[data-testid="assignment-card"]')
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          cy.get('[data-testid="consultant-name"]').should('be.visible');
          cy.get('[data-testid="assignment-role"]').should('be.visible');
          cy.get('[data-testid="assignment-schedule"]').should('be.visible');
          cy.get('[data-testid="assignment-status"]').should('be.visible');
        });
    });

    it('should allow creating new assignments', () => {
      cy.intercept('POST', '/api/schedules/test-schedule-id/assignments', {
        statusCode: 201,
        body: { 
          id: 'new-assignment-id',
          ...testData.assignment 
        }
      }).as('createAssignment');
      
      cy.get('[data-testid="add-assignment-btn"]')
        .click();
      
      cy.get(selectors.assignmentForm)
        .should('be.visible')
        .within(() => {
          // Select consultant
          cy.get('[data-testid="select-consultant"]')
            .click();
          cy.get(`[data-testid="consultant-${testData.consultant.id}"]`)
            .click();
          
          // Fill role
          cy.get('[data-testid="input-role"]')
            .type(testData.assignment.role);
          
          // Fill schedule
          cy.get('[data-testid="input-start-time"]')
            .type(testData.assignment.startTime);
          
          cy.get('[data-testid="input-end-time"]')
            .type(testData.assignment.endTime);
          
          // Add notes
          cy.get('[data-testid="input-notes"]')
            .type(testData.assignment.notes);
          
          // Submit
          cy.get('[data-testid="btn-save-assignment"]')
            .click();
        });
      
      cy.wait('@createAssignment');
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Assignment created successfully');
    });

    it('should validate assignment form', () => {
      cy.get('[data-testid="add-assignment-btn"]')
        .click();
      
      // Try to submit without required fields
      cy.get('[data-testid="btn-save-assignment"]')
        .click();
      
      cy.get('[data-testid="error-consultant"]')
        .should('be.visible')
        .and('contain.text', 'required');
      
      cy.get('[data-testid="error-role"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });

    it('should validate time conflicts', () => {
      cy.intercept('POST', '/api/schedules/test-schedule-id/assignments', {
        statusCode: 400,
        body: { error: 'Time conflict detected' }
      }).as('createConflictAssignment');
      
      cy.get('[data-testid="add-assignment-btn"]')
        .click();
      
      cy.get(selectors.assignmentForm).within(() => {
        cy.get('[data-testid="select-consultant"]')
          .click();
        cy.get('[data-testid="consultant-option"]')
          .first()
          .click();
        
        cy.get('[data-testid="input-role"]')
          .type('Conflicting Role');
        
        cy.get('[data-testid="input-start-time"]')
          .type('08:00');
        
        cy.get('[data-testid="input-end-time"]')
          .type('17:00');
        
        cy.get('[data-testid="btn-save-assignment"]')
          .click();
      });
      
      cy.wait('@createConflictAssignment');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', 'Time conflict detected');
    });

    it('should allow editing assignments', () => {
      cy.intercept('PATCH', '/api/assignments/test-assignment-id', {
        statusCode: 200,
        body: { id: 'test-assignment-id', role: 'Updated Role' }
      }).as('updateAssignment');
      
      cy.get('[data-testid="edit-assignment-btn"]')
        .first()
        .click();
      
      cy.get('[data-testid="input-role"]')
        .clear()
        .type('Updated Role');
      
      cy.get('[data-testid="btn-save-assignment"]')
        .click();
      
      cy.wait('@updateAssignment');
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Assignment updated successfully');
    });

    it('should allow deleting assignments', () => {
      cy.intercept('DELETE', '/api/assignments/test-assignment-id', {
        statusCode: 204
      }).as('deleteAssignment');
      
      cy.get('[data-testid="delete-assignment-btn"]')
        .first()
        .click();
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-yes"]').click();
        });
      
      cy.wait('@deleteAssignment');
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Assignment deleted successfully');
    });
  });

  describe('Delete Schedule', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
    });

    it('should confirm before deleting schedule', () => {
      cy.get('[data-testid="delete-schedule-btn"]')
        .first()
        .click();
      
      cy.get('[data-testid="confirm-delete"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-message"]')
            .should('contain.text', 'Are you sure you want to delete');
          
          cy.get('[data-testid="confirm-yes"]').should('be.visible');
          cy.get('[data-testid="confirm-no"]').should('be.visible');
        });
    });

    it('should successfully delete schedule', () => {
      cy.intercept('DELETE', '/api/schedules/test-schedule-id', {
        statusCode: 204
      }).as('deleteSchedule');
      
      cy.get('[data-testid="delete-schedule-btn"]')
        .first()
        .click();
      
      cy.get('[data-testid="confirm-delete"]')
        .within(() => {
          cy.get('[data-testid="confirm-yes"]').click();
        });
      
      cy.wait('@deleteSchedule');
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Schedule deleted successfully');
    });

    it('should handle delete errors', () => {
      cy.intercept('DELETE', '/api/schedules/test-schedule-id', {
        statusCode: 400,
        body: { error: 'Cannot delete schedule with active assignments' }
      }).as('deleteScheduleError');
      
      cy.get('[data-testid="delete-schedule-btn"]')
        .first()
        .click();
      
      cy.get('[data-testid="confirm-yes"]').click();
      
      cy.wait('@deleteScheduleError');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', 'Cannot delete schedule');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="delete-schedule-btn"]')
        .first()
        .click();
      
      cy.get('[data-testid="confirm-no"]').click();
      
      cy.get('[data-testid="confirm-delete"]')
        .should('not.exist');
      
      cy.get(selectors.scheduleCard)
        .should('exist');
    });
  });

  describe('Consultant Schedules View', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantSchedules, {
        fixture: 'schedules/consultant-schedules.json'
      }).as('getConsultantSchedules');
      
      cy.visit(`/consultants/${testData.consultant.id}/schedules`);
      cy.wait('@getConsultantSchedules');
    });

    it('should display consultant schedule overview', () => {
      cy.get('[data-testid="consultant-schedule-header"]')
        .should('be.visible')
        .and('contain.text', 'Schedule Overview');
      
      cy.get('[data-testid="consultant-info"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="consultant-name"]').should('be.visible');
          cy.get('[data-testid="consultant-role"]').should('be.visible');
        });
    });

    it('should show current and upcoming assignments', () => {
      cy.get('[data-testid="current-assignments"]')
        .should('be.visible');
      
      cy.get('[data-testid="upcoming-assignments"]')
        .should('be.visible');
      
      cy.get('[data-testid="assignment-item"]')
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          cy.get('[data-testid="project-name"]').should('be.visible');
          cy.get('[data-testid="assignment-dates"]').should('be.visible');
          cy.get('[data-testid="assignment-hours"]').should('be.visible');
        });
    });

    it('should calculate and display workload metrics', () => {
      cy.get('[data-testid="workload-metrics"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="total-hours"]').should('be.visible');
          cy.get('[data-testid="utilization-rate"]').should('be.visible');
          cy.get('[data-testid="availability-status"]').should('be.visible');
        });
    });
  });

  describe('Schedule Analytics and Reporting', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/schedules/analytics', {
        fixture: 'schedules/analytics.json'
      }).as('getScheduleAnalytics');
      
      cy.visit('/schedules/analytics');
      cy.wait('@getScheduleAnalytics');
    });

    it('should display schedule analytics dashboard', () => {
      cy.get('[data-testid="analytics-dashboard"]')
        .should('be.visible');
      
      // Key metrics cards
      cy.get('[data-testid="metric-card"]')
        .should('have.length.at.least', 4)
        .each(($card) => {
          cy.wrap($card).within(() => {
            cy.get('[data-testid="metric-title"]').should('be.visible');
            cy.get('[data-testid="metric-value"]').should('be.visible');
          });
        });
      
      // Charts
      cy.get('[data-testid="utilization-chart"]').should('be.visible');
      cy.get('[data-testid="capacity-chart"]').should('be.visible');
      cy.get('[data-testid="timeline-chart"]').should('be.visible');
    });

    it('should allow filtering analytics by date range', () => {
      cy.get('[data-testid="date-range-filter"]')
        .click();
      
      cy.get('[data-testid="preset-last-30-days"]')
        .click();
      
      cy.get('[data-testid="apply-filter"]')
        .click();
      
      // Charts should update
      cy.get('[data-testid="utilization-chart"]')
        .should('be.visible');
    });

    it('should export analytics data', () => {
      cy.get('[data-testid="export-analytics"]')
        .click();
      
      cy.get('[data-testid="export-format-dropdown"]')
        .click();
      
      cy.get('[data-testid="format-excel"]')
        .click();
      
      cy.get('[data-testid="confirm-export"]')
        .click();
      
      cy.get(selectors.successMessage)
        .should('be.visible')
        .and('contain.text', 'Export started');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
    });

    it('should adapt layout for mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
      
      // Mobile navigation
      cy.get('[data-testid="mobile-nav-toggle"]')
        .should('be.visible');
      
      // Condensed schedule cards
      cy.get(selectors.scheduleCard)
        .should('have.class', 'mobile-layout');
      
      // Mobile-optimized action buttons
      cy.get('[data-testid="mobile-actions-menu"]')
        .should('be.visible');
    });

    it('should handle touch interactions', () => {
      cy.viewport(375, 667);
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
      
      // Swipe gestures
      cy.get(selectors.scheduleCard)
        .first()
        .trigger('touchstart', { clientX: 100 })
        .trigger('touchmove', { clientX: 200 })
        .trigger('touchend');
      
      cy.get('[data-testid="swipe-actions"]')
        .should('be.visible');
    });

    it('should optimize forms for mobile input', () => {
      cy.viewport(375, 667);
      cy.visit('/schedules');
      cy.get(selectors.createButton).click();
      
      // Mobile-optimized form layout
      cy.get(selectors.scheduleForm)
        .should('have.class', 'mobile-form');
      
      // Large touch targets
      cy.get('[data-testid="input-title"]')
        .should('have.css', 'min-height', '44px');
      
      // Mobile keyboard optimization
      cy.get('[data-testid="input-start-date"]')
        .should('have.attr', 'inputmode', 'none');
    });
  });

  describe('Performance and Loading States', () => {
    it('should handle slow API responses gracefully', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        delay: 3000,
        fixture: 'schedules/project-schedules.json'
      }).as('getSlowSchedules');
      
      cy.visit('/schedules');
      
      // Should show loading state
      cy.get(selectors.loadingSpinner)
        .should('be.visible');
      
      // Should show skeleton loaders
      cy.get('[data-testid="skeleton-loader"]')
        .should('be.visible');
      
      cy.wait('@getSlowSchedules');
      
      // Loading should disappear
      cy.get(selectors.loadingSpinner)
        .should('not.exist');
      
      cy.get(selectors.schedulesList)
        .should('be.visible');
    });

    it('should implement proper error boundaries', () => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getSchedulesError');
      
      cy.visit('/schedules');
      cy.wait('@getSchedulesError');
      
      cy.get('[data-testid="error-boundary"]')
        .should('be.visible')
        .and('contain.text', 'Something went wrong');
      
      cy.get('[data-testid="error-retry"]')
        .should('be.visible')
        .and('contain.text', 'Try again');
    });

    it('should cache data appropriately', () => {
      cy.visit('/schedules');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/schedules');
      
      // Should load from cache (no loading spinner)
      cy.get(selectors.loadingSpinner)
        .should('not.exist');
      
      cy.get(selectors.schedulesList)
        .should('be.visible');
    });
  });

  describe('Accessibility Compliance', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSchedules, {
        fixture: 'schedules/project-schedules.json'
      }).as('getProjectSchedules');
      
      cy.visit('/schedules');
      cy.wait('@getProjectSchedules');
    });

    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'skip-link');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-schedules');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-schedules');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'create-schedule-btn');
    });

    it('should have proper ARIA labels and roles', () => {
      // Main content area
      cy.get('[role="main"]').should('exist');
      
      // Search input
      cy.get(selectors.searchInput)
        .should('have.attr', 'aria-label');
      
      // List of schedules
      cy.get(selectors.schedulesList)
        .should('have.attr', 'role', 'list');
      
      cy.get(selectors.scheduleCard)
        .should('have.attr', 'role', 'listitem');
    });

    it('should support screen readers', () => {
      // Live regions for dynamic content
      cy.get('[aria-live="polite"]').should('exist');
      cy.get('[aria-live="assertive"]').should('exist');
      
      // Status announcements
      cy.get(selectors.scheduleCard).first().within(() => {
        cy.get('[data-testid="schedule-status"]')
          .should('have.attr', 'aria-label');
      });
    });

    it('should meet color contrast requirements', () => {
      // Check text contrast (this would typically use a specialized tool)
      cy.get('[data-testid="schedule-title"]')
        .should('be.visible')
        .and('have.css', 'color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');
      
      // Status indicators should have sufficient contrast
      cy.get('[data-testid="schedule-status"]')
        .should('be.visible')
        .and('have.css', 'background-color');
    });
  });
});
