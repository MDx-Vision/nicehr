describe('Budget System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    budget: {
      valid: {
        totalBudget: 500000,
        laborCosts: 300000,
        travelCosts: 50000,
        equipmentCosts: 100000,
        miscCosts: 50000,
        contingency: 25000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        currency: 'USD',
        status: 'draft'
      },
      invalid: {
        negativeBudget: -100000,
        zeroBudget: 0,
        invalidCurrency: 'INVALID',
        invalidStartDate: '2025-01-01',
        invalidEndDate: '2023-12-31'
      },
      update: {
        totalBudget: 600000,
        laborCosts: 350000,
        status: 'approved'
      }
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    projects: '/api/projects',
    budget: (projectId) => `/api/projects/${projectId}/budget`,
    budgetUpdate: (budgetId) => `/api/budget/${budgetId}`
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login as admin user
    cy.request({
      method: 'POST',
      url: apiEndpoints.login,
      body: {
        email: testData.ciUser.email,
        password: testData.ciUser.password
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.visit('/');
        cy.get('[data-testid="nav-projects"]', { timeout: 15000 }).should('be.visible');
      }
    });
  });

  describe('Budget List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/projects', { fixture: 'projects.json' }).as('getProjects');
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Navigate to first project's budget
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="view-budget"]').click();
      });
    });

    it('should display budget overview page layout', () => {
      cy.get('[data-testid="budget-container"]', { timeout: 10000 })
        .should('be.visible');

      // Header section
      cy.get('[data-testid="budget-header"]').should('be.visible');
      cy.get('[data-testid="budget-title"]').should('contain.text', 'Budget');
      cy.get('[data-testid="project-name"]').should('be.visible');

      // Budget summary cards
      cy.get('[data-testid="total-budget-card"]').should('be.visible');
      cy.get('[data-testid="spent-budget-card"]').should('be.visible');
      cy.get('[data-testid="remaining-budget-card"]').should('be.visible');
      cy.get('[data-testid="budget-utilization-card"]').should('be.visible');

      // Action buttons
      cy.get('[data-testid="create-budget"]').should('be.visible');
      cy.get('[data-testid="edit-budget"]').should('exist');
      cy.get('[data-testid="budget-export"]').should('be.visible');
    });

    it('should display budget breakdown chart', () => {
      cy.get('[data-testid="budget-chart-container"]').should('be.visible');
      cy.get('[data-testid="chart-legend"]').should('be.visible');
      
      // Chart should have proper dimensions
      cy.get('[data-testid="budget-chart"]')
        .should('be.visible')
        .and('have.css', 'width')
        .and('not.equal', '0px');
    });

    it('should display budget categories table', () => {
      cy.get('[data-testid="budget-table"]').should('be.visible');
      
      // Table headers
      const expectedHeaders = ['Category', 'Budgeted', 'Spent', 'Remaining', '%'];
      expectedHeaders.forEach(header => {
        cy.get('[data-testid="budget-table"] thead')
          .should('contain.text', header);
      });

      // Table rows
      cy.get('[data-testid="budget-table"] tbody tr').should('have.length.at.least', 1);
    });

    it('should handle empty budget state', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { budget: null, categories: [] }
      }).as('getEmptyBudget');

      cy.reload();
      cy.wait('@getEmptyBudget');

      cy.get('[data-testid="empty-budget-state"]').should('be.visible');
      cy.get('[data-testid="empty-budget-message"]')
        .should('contain.text', 'No budget configured');
      cy.get('[data-testid="create-budget"]').should('be.visible');
    });
  });

  describe('Create Budget - Form Validation & Functionality', () => {
    beforeEach(() => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="view-budget"]').click();
      });
      cy.get('[data-testid="create-budget"]').click();
    });

    it('should display create budget form with all required fields', () => {
      cy.get('[data-testid="budget-form"]', { timeout: 10000 }).should('be.visible');

      // Form title
      cy.get('[data-testid="form-title"]').should('contain.text', 'Create Budget');

      // Required form fields
      cy.get('[data-testid="input-total-budget"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-labor-costs"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      cy.get('[data-testid="input-travel-costs"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      cy.get('[data-testid="input-equipment-costs"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      cy.get('[data-testid="input-misc-costs"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');

      // Form buttons
      cy.get('[data-testid="button-save-budget"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-save-budget"]').click();

      // Check for validation messages
      cy.get('[data-testid="error-total-budget"]')
        .should('be.visible')
        .and('contain.text', 'required');
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', 'required');
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });

    it('should validate numeric fields with invalid inputs', () => {
      // Test negative numbers
      cy.get('[data-testid="input-total-budget"]').clear().type('-100000');
      cy.get('[data-testid="input-labor-costs"]').clear().type('-50000');
      
      cy.get('[data-testid="button-save-budget"]').click();

      cy.get('[data-testid="error-total-budget"]')
        .should('contain.text', 'must be positive');
      cy.get('[data-testid="error-labor-costs"]')
        .should('contain.text', 'must be positive');
    });

    it('should validate date range', () => {
      cy.get('[data-testid="input-start-date"]').type('2024-12-31');
      cy.get('[data-testid="input-end-date"]').type('2024-01-01');
      
      cy.get('[data-testid="button-save-budget"]').click();

      cy.get('[data-testid="error-date-range"]')
        .should('be.visible')
        .and('contain.text', 'End date must be after start date');
    });

    it('should validate budget allocation logic', () => {
      cy.get('[data-testid="input-total-budget"]').clear().type('100000');
      cy.get('[data-testid="input-labor-costs"]').clear().type('60000');
      cy.get('[data-testid="input-travel-costs"]').clear().type('30000');
      cy.get('[data-testid="input-equipment-costs"]').clear().type('20000');
      cy.get('[data-testid="input-misc-costs"]').clear().type('10000');
      
      // Total allocation (120000) exceeds total budget (100000)
      cy.get('[data-testid="button-save-budget"]').click();

      cy.get('[data-testid="error-budget-allocation"]')
        .should('be.visible')
        .and('contain.text', 'Total allocation exceeds budget');
    });

    it('should display real-time budget calculation', () => {
      cy.get('[data-testid="input-labor-costs"]').clear().type('50000');
      cy.get('[data-testid="input-travel-costs"]').clear().type('10000');
      
      cy.get('[data-testid="allocated-total"]')
        .should('contain.text', '60,000');
      cy.get('[data-testid="remaining-budget"]')
        .should('be.visible');
    });

    it('should successfully create budget with valid data', () => {
      cy.intercept('POST', apiEndpoints.budget(testData.project.id), {
        statusCode: 201,
        body: { 
          id: 'new-budget-id',
          ...testData.budget.valid,
          projectId: testData.project.id
        }
      }).as('createBudget');

      // Fill form with valid data
      cy.get('[data-testid="input-total-budget"]')
        .clear().type(testData.budget.valid.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .clear().type(testData.budget.valid.laborCosts.toString());
      cy.get('[data-testid="input-travel-costs"]')
        .clear().type(testData.budget.valid.travelCosts.toString());
      cy.get('[data-testid="input-equipment-costs"]')
        .clear().type(testData.budget.valid.equipmentCosts.toString());
      cy.get('[data-testid="input-misc-costs"]')
        .clear().type(testData.budget.valid.miscCosts.toString());
      cy.get('[data-testid="input-start-date"]')
        .clear().type(testData.budget.valid.startDate);
      cy.get('[data-testid="input-end-date"]')
        .clear().type(testData.budget.valid.endDate);

      cy.get('[data-testid="button-save-budget"]').click();
      
      cy.wait('@createBudget').then((interception) => {
        expect(interception.request.body).to.include({
          totalBudget: testData.budget.valid.totalBudget,
          laborCosts: testData.budget.valid.laborCosts
        });
      });

      // Should redirect to budget view
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget created successfully');
      cy.url().should('include', '/budget');
    });

    it('should handle create budget API errors', () => {
      cy.intercept('POST', apiEndpoints.budget(testData.project.id), {
        statusCode: 400,
        body: { error: 'Invalid budget data' }
      }).as('createBudgetError');

      // Fill form and submit
      cy.get('[data-testid="input-total-budget"]').clear().type('100000');
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-12-31');
      cy.get('[data-testid="button-save-budget"]').click();

      cy.wait('@createBudgetError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Invalid budget data');
    });

    it('should cancel budget creation and return to budget list', () => {
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="budget-container"]').should('be.visible');
      cy.url().should('not.include', '/create');
    });
  });

  describe('Edit Budget - Update Functionality', () => {
    beforeEach(() => {
      // Mock existing budget data
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          projectId: testData.project.id
        }
      }).as('getBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="view-budget"]').click();
      });
      cy.wait('@getBudget');
      
      cy.get('[data-testid="edit-budget"]').click();
    });

    it('should display edit form with pre-filled data', () => {
      cy.get('[data-testid="budget-form"]').should('be.visible');
      cy.get('[data-testid="form-title"]').should('contain.text', 'Edit Budget');

      // Check pre-filled values
      cy.get('[data-testid="input-total-budget"]')
        .should('have.value', testData.budget.valid.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .should('have.value', testData.budget.valid.laborCosts.toString());
      cy.get('[data-testid="input-start-date"]')
        .should('have.value', testData.budget.valid.startDate);
    });

    it('should update budget with modified data', () => {
      cy.intercept('PATCH', apiEndpoints.budgetUpdate('existing-budget-id'), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          ...testData.budget.update
        }
      }).as('updateBudget');

      // Modify budget values
      cy.get('[data-testid="input-total-budget"]')
        .clear().type(testData.budget.update.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .clear().type(testData.budget.update.laborCosts.toString());

      cy.get('[data-testid="button-save-budget"]').click();
      
      cy.wait('@updateBudget').then((interception) => {
        expect(interception.request.body).to.include({
          totalBudget: testData.budget.update.totalBudget,
          laborCosts: testData.budget.update.laborCosts
        });
      });

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget updated successfully');
    });

    it('should handle update validation errors', () => {
      // Set invalid data
      cy.get('[data-testid="input-total-budget"]').clear().type('-100');
      cy.get('[data-testid="button-save-budget"]').click();

      cy.get('[data-testid="error-total-budget"]')
        .should('be.visible')
        .and('contain.text', 'must be positive');
    });

    it('should handle update API errors', () => {
      cy.intercept('PATCH', apiEndpoints.budgetUpdate('existing-budget-id'), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateBudgetError');

      cy.get('[data-testid="input-total-budget"]').clear().type('200000');
      cy.get('[data-testid="button-save-budget"]').click();

      cy.wait('@updateBudgetError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Failed to update budget');
    });
  });

  describe('Budget Status Management', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          status: 'draft'
        }
      }).as('getBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getBudget');
    });

    it('should display budget status badge', () => {
      cy.get('[data-testid="budget-status"]')
        .should('be.visible')
        .and('contain.text', 'Draft');
      
      cy.get('[data-testid="status-badge"]')
        .should('have.class', 'status-draft');
    });

    it('should show status change options', () => {
      cy.get('[data-testid="status-menu"]').click();
      
      cy.get('[data-testid="status-option-draft"]').should('be.visible');
      cy.get('[data-testid="status-option-pending-approval"]').should('be.visible');
      cy.get('[data-testid="status-option-approved"]').should('be.visible');
      cy.get('[data-testid="status-option-rejected"]').should('be.visible');
    });

    it('should update budget status', () => {
      cy.intercept('PATCH', apiEndpoints.budgetUpdate('existing-budget-id'), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          status: 'approved'
        }
      }).as('updateStatus');

      cy.get('[data-testid="status-menu"]').click();
      cy.get('[data-testid="status-option-approved"]').click();
      
      cy.wait('@updateStatus');
      
      cy.get('[data-testid="budget-status"]')
        .should('contain.text', 'Approved');
      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Status updated');
    });

    it('should disable editing for approved budgets', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          status: 'approved'
        }
      }).as('getApprovedBudget');

      cy.reload();
      cy.wait('@getApprovedBudget');

      cy.get('[data-testid="edit-budget"]').should('be.disabled');
      cy.get('[data-testid="budget-locked-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget is locked');
    });
  });

  describe('Budget Export & Reporting', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid
        }
      }).as('getBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getBudget');
    });

    it('should display export options', () => {
      cy.get('[data-testid="budget-export"]').click();
      
      cy.get('[data-testid="export-menu"]').should('be.visible');
      cy.get('[data-testid="export-pdf"]').should('be.visible');
      cy.get('[data-testid="export-excel"]').should('be.visible');
      cy.get('[data-testid="export-csv"]').should('be.visible');
    });

    it('should export budget as PDF', () => {
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen');
      });

      cy.get('[data-testid="budget-export"]').click();
      cy.get('[data-testid="export-pdf"]').click();
      
      cy.get('@windowOpen').should('have.been.called');
    });

    it('should export budget as Excel', () => {
      cy.get('[data-testid="budget-export"]').click();
      cy.get('[data-testid="export-excel"]').click();
      
      // Verify download initiated
      cy.get('[data-testid="download-message"]')
        .should('be.visible')
        .and('contain.text', 'Download started');
    });
  });

  describe('Budget Analytics & Insights', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          spent: {
            laborCosts: 150000,
            travelCosts: 25000,
            equipmentCosts: 50000,
            miscCosts: 20000
          },
          variance: {
            laborCosts: 5000,
            travelCosts: -5000,
            equipmentCosts: 10000,
            miscCosts: -2000
          }
        }
      }).as('getBudgetWithAnalytics');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getBudgetWithAnalytics');
    });

    it('should display budget utilization metrics', () => {
      cy.get('[data-testid="utilization-chart"]').should('be.visible');
      cy.get('[data-testid="utilization-percentage"]')
        .should('be.visible')
        .and('contain.text', '%');
    });

    it('should show variance analysis', () => {
      cy.get('[data-testid="variance-section"]').should('be.visible');
      cy.get('[data-testid="positive-variance"]')
        .should('be.visible')
        .and('contain.text', '5,000');
      cy.get('[data-testid="negative-variance"]')
        .should('be.visible')
        .and('contain.text', '-5,000');
    });

    it('should display budget forecasting', () => {
      cy.get('[data-testid="forecast-section"]').should('be.visible');
      cy.get('[data-testid="projected-completion"]').should('be.visible');
      cy.get('[data-testid="budget-runway"]').should('be.visible');
    });

    it('should show budget alerts and warnings', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid,
          alerts: [
            {
              type: 'warning',
              category: 'labor',
              message: 'Labor costs approaching budget limit',
              threshold: 90
            }
          ]
        }
      }).as('getBudgetWithAlerts');

      cy.reload();
      cy.wait('@getBudgetWithAlerts');

      cy.get('[data-testid="budget-alerts"]').should('be.visible');
      cy.get('[data-testid="alert-warning"]')
        .should('be.visible')
        .and('contain.text', 'Labor costs approaching');
    });
  });

  describe('Responsive Design & Mobile Experience', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'existing-budget-id',
          ...testData.budget.valid
        }
      }).as('getBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getBudget');
    });

    it('should display properly on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Check mobile layout
      cy.get('[data-testid="budget-container"]').should('be.visible');
      cy.get('[data-testid="budget-cards"]')
        .should('have.css', 'flex-direction', 'column');
      
      // Mobile navigation
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });

    it('should display properly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="budget-container"]').should('be.visible');
      cy.get('[data-testid="budget-table"]').should('be.visible');
      
      // Check table responsiveness
      cy.get('[data-testid="budget-table"]')
        .scrollTo('right')
        .should('be.visible');
    });

    it('should handle touch interactions on mobile', () => {
      cy.viewport('iphone-x');
      
      // Test touch interactions
      cy.get('[data-testid="budget-card"]').first().trigger('touchstart');
      cy.get('[data-testid="mobile-actions"]').should('be.visible');
    });
  });

  describe('Budget Permissions & Access Control', () => {
    it('should restrict budget creation for non-admin users', () => {
      // Test with limited user permissions
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 'limited-user',
          email: 'limited@example.com',
          role: 'consultant',
          permissions: ['budget:read']
        }
      }).as('getLimitedUser');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      
      cy.get('[data-testid="create-budget"]').should('not.exist');
      cy.get('[data-testid="edit-budget"]').should('not.exist');
    });

    it('should show read-only view for users without edit permissions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: {
          id: 'readonly-user',
          email: 'readonly@example.com',
          role: 'viewer',
          permissions: ['budget:read']
        }
      }).as('getReadonlyUser');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      
      cy.get('[data-testid="budget-readonly-notice"]')
        .should('be.visible')
        .and('contain.text', 'Read-only access');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle budget not found error', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 404,
        body: { error: 'Budget not found' }
      }).as('getBudgetNotFound');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getBudgetNotFound');

      cy.get('[data-testid="not-found-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget not found');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        forceNetworkError: true
      }).as('getNetworkError');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getNetworkError');

      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', 'Connection error');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 500
      }).as('getServerError');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getServerError');

      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@getServerError');
    });

    it('should handle large budget numbers correctly', () => {
      const largeBudget = {
        totalBudget: 999999999.99,
        laborCosts: 500000000.50,
        displayValue: '$999,999,999.99'
      };

      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: {
          id: 'large-budget',
          ...largeBudget
        }
      }).as('getLargeBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.wait('@getLargeBudget');

      cy.get('[data-testid="total-budget-display"]')
        .should('contain.text', largeBudget.displayValue);
    });
  });

  describe('Performance & Loading States', () => {
    it('should show loading states during data fetch', () => {
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { ...testData.budget.valid },
        delay: 2000
      }).as('getSlowBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();

      // Check loading states
      cy.get('[data-testid="budget-loading"]').should('be.visible');
      cy.get('[data-testid="skeleton-loader"]').should('be.visible');
      
      cy.wait('@getSlowBudget');
      
      cy.get('[data-testid="budget-loading"]').should('not.exist');
      cy.get('[data-testid="budget-container"]').should('be.visible');
    });

    it('should handle concurrent budget operations', () => {
      cy.intercept('PATCH', apiEndpoints.budgetUpdate('existing-budget-id'), {
        statusCode: 200,
        body: { ...testData.budget.valid },
        delay: 1000
      }).as('updateBudget');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]').first().click();
      cy.get('[data-testid="edit-budget"]').click();

      // Submit multiple rapid changes
      cy.get('[data-testid="input-total-budget"]').clear().type('100000');
      cy.get('[data-testid="button-save-budget"]').click();
      cy.get('[data-testid="button-save-budget"]').click();
      cy.get('[data-testid="button-save-budget"]').click();

      // Should only make one request
      cy.get('@updateBudget.all').should('have.length', 1);
    });
  });
});
