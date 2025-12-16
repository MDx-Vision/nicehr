describe('Budget Management System - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123'
    },
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    budget: {
      valid: {
        totalBudget: 100000,
        laborCosts: 60000,
        travelCosts: 15000,
        accommodationCosts: 12000,
        miscCosts: 8000,
        contingency: 5000,
        description: 'Test budget description',
        budgetYear: 2024,
        currency: 'USD'
      },
      invalid: {
        negativeBudget: -1000,
        exceedsLimit: 999999999999,
        invalidCurrency: 'INVALID',
        emptyDescription: '',
        futureYear: 2030,
        pastYear: 2020
      },
      update: {
        totalBudget: 120000,
        laborCosts: 70000,
        travelCosts: 18000,
        accommodationCosts: 15000,
        miscCosts: 10000,
        contingency: 7000,
        description: 'Updated budget description',
        notes: 'Budget updated for additional requirements'
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

  const routes = {
    login: '/login',
    dashboard: '/',
    projects: '/projects',
    projectBudget: (projectId) => `/projects/${projectId}/budget`,
    budgetCreate: (projectId) => `/projects/${projectId}/budget/create`,
    budgetEdit: (projectId, budgetId) => `/projects/${projectId}/budget/${budgetId}/edit`
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Setup API interceptors
    cy.intercept('GET', apiEndpoints.user).as('getUser');
    cy.intercept('POST', apiEndpoints.login).as('login');
    cy.intercept('GET', apiEndpoints.projects).as('getProjects');
    cy.intercept('GET', apiEndpoints.budget('*')).as('getBudget');
    cy.intercept('POST', apiEndpoints.budget('*')).as('createBudget');
    cy.intercept('PATCH', apiEndpoints.budgetUpdate('*')).as('updateBudget');
  });

  describe('Budget Page Access & Authentication', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit(routes.projectBudget(testData.project.id));
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should allow authenticated users to access budget page', () => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
      cy.visit(routes.projectBudget(testData.project.id));
      
      cy.wait('@getBudget');
      cy.url().should('include', `/projects/${testData.project.id}/budget`);
    });

    it('should handle unauthorized access gracefully', () => {
      cy.intercept('GET', apiEndpoints.budget('*'), {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('getBudgetForbidden');

      cy.login(testData.ciUser.email, testData.ciUser.password);
      cy.visit(routes.projectBudget(testData.project.id));
      
      cy.wait('@getBudgetForbidden');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'access');
    });

    it('should handle server errors appropriately', () => {
      cy.intercept('GET', apiEndpoints.budget('*'), {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getBudgetError');

      cy.login(testData.ciUser.email, testData.ciUser.password);
      cy.visit(routes.projectBudget(testData.project.id));
      
      cy.wait('@getBudgetError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'error');
    });
  });

  describe('Budget Overview Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
    });

    it('should display complete budget overview layout', () => {
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      // Page header
      cy.get('[data-testid="budget-header"]').should('be.visible');
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', 'Budget');
      
      // Project information
      cy.get('[data-testid="project-info"]').should('be.visible');
      cy.get('[data-testid="project-name"]')
        .should('be.visible')
        .and('not.be.empty');

      // Budget summary cards
      cy.get('[data-testid="budget-summary"]').should('be.visible');
      cy.get('[data-testid="total-budget-card"]').should('be.visible');
      cy.get('[data-testid="spent-budget-card"]').should('be.visible');
      cy.get('[data-testid="remaining-budget-card"]').should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="create-budget-button"]').should('be.visible');
      cy.get('[data-testid="export-budget-button"]').should('be.visible');
    });

    it('should display budget breakdown charts and tables', () => {
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      // Charts section
      cy.get('[data-testid="budget-charts"]').should('be.visible');
      cy.get('[data-testid="budget-pie-chart"]').should('be.visible');
      cy.get('[data-testid="budget-timeline-chart"]').should('be.visible');

      // Budget categories table
      cy.get('[data-testid="budget-categories-table"]').should('be.visible');
      cy.get('[data-testid="table-header"]').should('be.visible');
      cy.get('[data-testid="table-row"]').should('have.length.at.least', 0);

      // Budget history section
      cy.get('[data-testid="budget-history"]').should('be.visible');
      cy.get('[data-testid="history-timeline"]').should('be.visible');
    });

    it('should handle empty budget state correctly', () => {
      cy.intercept('GET', apiEndpoints.budget('*'), {
        statusCode: 200,
        body: { budgets: [], total: 0 }
      }).as('getEmptyBudget');

      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getEmptyBudget');

      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]')
        .should('contain.text', 'No budget found');
      cy.get('[data-testid="empty-state-description"]')
        .should('contain.text', 'Create your first budget');
      cy.get('[data-testid="create-first-budget-button"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should display loading states appropriately', () => {
      cy.intercept('GET', apiEndpoints.budget('*'), {
        delay: 2000,
        statusCode: 200,
        body: { budgets: [], total: 0 }
      }).as('getSlowBudget');

      cy.visit(routes.projectBudget(testData.project.id));
      
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-text"]')
        .should('be.visible')
        .and('contain.text', 'Loading');

      cy.wait('@getSlowBudget');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });
  });

  describe('Budget Creation - Form Validation & Submission', () => {
    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');
    });

    it('should open budget creation form', () => {
      cy.get('[data-testid="create-budget-button"]').click();
      
      cy.get('[data-testid="budget-form-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Create Budget');
      
      // Form fields
      cy.get('[data-testid="input-total-budget"]').should('be.visible');
      cy.get('[data-testid="input-labor-costs"]').should('be.visible');
      cy.get('[data-testid="input-travel-costs"]').should('be.visible');
      cy.get('[data-testid="input-accommodation-costs"]').should('be.visible');
      cy.get('[data-testid="input-misc-costs"]').should('be.visible');
      cy.get('[data-testid="input-contingency"]').should('be.visible');
      cy.get('[data-testid="input-description"]').should('be.visible');
      cy.get('[data-testid="select-currency"]').should('be.visible');
      
      // Form actions
      cy.get('[data-testid="button-save"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="create-budget-button"]').click();
      cy.get('[data-testid="button-save"]').click();

      // Check for validation errors
      cy.get('[data-testid="error-total-budget"]')
        .should('be.visible')
        .and('contain.text', 'required');
      cy.get('[data-testid="error-labor-costs"]')
        .should('be.visible')
        .and('contain.text', 'required');
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });

    it('should validate numeric field constraints', () => {
      cy.get('[data-testid="create-budget-button"]').click();

      // Test negative values
      cy.get('[data-testid="input-total-budget"]')
        .type(testData.budget.invalid.negativeBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .type(testData.budget.invalid.negativeBudget.toString());
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.get('[data-testid="error-total-budget"]')
        .should('contain.text', 'positive');
      cy.get('[data-testid="error-labor-costs"]')
        .should('contain.text', 'positive');

      // Test exceeding limits
      cy.get('[data-testid="input-total-budget"]')
        .clear()
        .type(testData.budget.invalid.exceedsLimit.toString());
      
      cy.get('[data-testid="button-save"]').click();
      cy.get('[data-testid="error-total-budget"]')
        .should('contain.text', 'maximum');
    });

    it('should validate budget allocation consistency', () => {
      cy.get('[data-testid="create-budget-button"]').click();

      // Enter values where categories exceed total
      cy.get('[data-testid="input-total-budget"]')
        .type('10000');
      cy.get('[data-testid="input-labor-costs"]')
        .type('8000');
      cy.get('[data-testid="input-travel-costs"]')
        .type('5000'); // Total would be 13000, exceeding 10000
      cy.get('[data-testid="input-description"]')
        .type('Test budget');
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.get('[data-testid="error-budget-allocation"]')
        .should('be.visible')
        .and('contain.text', 'exceed total budget');
    });

    it('should create budget successfully with valid data', () => {
      cy.intercept('POST', apiEndpoints.budget(testData.project.id), {
        statusCode: 201,
        body: {
          id: 'new-budget-id',
          ...testData.budget.valid,
          projectId: testData.project.id,
          createdAt: new Date().toISOString()
        }
      }).as('createBudgetSuccess');

      cy.get('[data-testid="create-budget-button"]').click();
      
      // Fill form with valid data
      cy.get('[data-testid="input-total-budget"]')
        .type(testData.budget.valid.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .type(testData.budget.valid.laborCosts.toString());
      cy.get('[data-testid="input-travel-costs"]')
        .type(testData.budget.valid.travelCosts.toString());
      cy.get('[data-testid="input-accommodation-costs"]')
        .type(testData.budget.valid.accommodationCosts.toString());
      cy.get('[data-testid="input-misc-costs"]')
        .type(testData.budget.valid.miscCosts.toString());
      cy.get('[data-testid="input-contingency"]')
        .type(testData.budget.valid.contingency.toString());
      cy.get('[data-testid="input-description"]')
        .type(testData.budget.valid.description);
      cy.get('[data-testid="select-currency"]')
        .select(testData.budget.valid.currency);
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@createBudgetSuccess');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget created successfully');
      cy.get('[data-testid="budget-form-modal"]').should('not.exist');
    });

    it('should handle server errors during creation', () => {
      cy.intercept('POST', apiEndpoints.budget(testData.project.id), {
        statusCode: 400,
        body: { error: 'Validation failed' }
      }).as('createBudgetError');

      cy.get('[data-testid="create-budget-button"]').click();
      
      // Fill form with valid data
      cy.get('[data-testid="input-total-budget"]')
        .type(testData.budget.valid.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .type(testData.budget.valid.laborCosts.toString());
      cy.get('[data-testid="input-description"]')
        .type(testData.budget.valid.description);
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@createBudgetError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'failed');
      cy.get('[data-testid="budget-form-modal"]').should('be.visible');
    });

    it('should allow canceling budget creation', () => {
      cy.get('[data-testid="create-budget-button"]').click();
      
      // Fill some data
      cy.get('[data-testid="input-total-budget"]').type('50000');
      cy.get('[data-testid="input-description"]').type('Test data');
      
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="budget-form-modal"]').should('not.exist');
      
      // Verify data is not saved by reopening form
      cy.get('[data-testid="create-budget-button"]').click();
      cy.get('[data-testid="input-total-budget"]').should('have.value', '');
      cy.get('[data-testid="input-description"]').should('have.value', '');
    });
  });

  describe('Budget Editing & Updates', () => {
    const mockBudget = {
      id: 'test-budget-1',
      projectId: testData.project.id,
      ...testData.budget.valid,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
      
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { budgets: [mockBudget], total: 1 }
      }).as('getBudgetWithData');
      
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudgetWithData');
    });

    it('should open budget edit form with existing data', () => {
      cy.get('[data-testid="edit-budget-button"]').first().click();
      
      cy.get('[data-testid="budget-form-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Edit Budget');
      
      // Verify form is populated with existing data
      cy.get('[data-testid="input-total-budget"]')
        .should('have.value', testData.budget.valid.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .should('have.value', testData.budget.valid.laborCosts.toString());
      cy.get('[data-testid="input-description"]')
        .should('have.value', testData.budget.valid.description);
    });

    it('should update budget successfully', () => {
      cy.intercept('PATCH', apiEndpoints.budgetUpdate(mockBudget.id), {
        statusCode: 200,
        body: {
          ...mockBudget,
          ...testData.budget.update
        }
      }).as('updateBudgetSuccess');

      cy.get('[data-testid="edit-budget-button"]').first().click();
      
      // Update form values
      cy.get('[data-testid="input-total-budget"]')
        .clear()
        .type(testData.budget.update.totalBudget.toString());
      cy.get('[data-testid="input-labor-costs"]')
        .clear()
        .type(testData.budget.update.laborCosts.toString());
      cy.get('[data-testid="input-description"]')
        .clear()
        .type(testData.budget.update.description);
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@updateBudgetSuccess');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget updated successfully');
      cy.get('[data-testid="budget-form-modal"]').should('not.exist');
    });

    it('should validate updates with same rules as creation', () => {
      cy.get('[data-testid="edit-budget-button"]').first().click();
      
      // Clear required fields
      cy.get('[data-testid="input-total-budget"]').clear();
      cy.get('[data-testid="input-description"]').clear();
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.get('[data-testid="error-total-budget"]')
        .should('be.visible')
        .and('contain.text', 'required');
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', 'required');
    });

    it('should handle update server errors', () => {
      cy.intercept('PATCH', apiEndpoints.budgetUpdate(mockBudget.id), {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('updateBudgetError');

      cy.get('[data-testid="edit-budget-button"]').first().click();
      
      cy.get('[data-testid="input-total-budget"]')
        .clear()
        .type('150000');
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@updateBudgetError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'failed to update');
    });

    it('should show unsaved changes warning', () => {
      cy.get('[data-testid="edit-budget-button"]').first().click();
      
      // Make changes
      cy.get('[data-testid="input-total-budget"]')
        .clear()
        .type('150000');
      
      // Try to close without saving
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="unsaved-changes-dialog"]')
        .should('be.visible');
      cy.get('[data-testid="confirm-discard-button"]').click();
      
      cy.get('[data-testid="budget-form-modal"]').should('not.exist');
    });
  });

  describe('Budget Data Display & Interactions', () => {
    const mockBudgets = [
      {
        id: 'budget-1',
        projectId: testData.project.id,
        totalBudget: 100000,
        laborCosts: 60000,
        travelCosts: 15000,
        accommodationCosts: 12000,
        miscCosts: 8000,
        contingency: 5000,
        description: 'Q1 Budget',
        currency: 'USD',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'budget-2',
        projectId: testData.project.id,
        totalBudget: 120000,
        laborCosts: 70000,
        travelCosts: 18000,
        accommodationCosts: 15000,
        miscCosts: 10000,
        contingency: 7000,
        description: 'Q2 Budget',
        currency: 'USD',
        createdAt: '2024-04-01T00:00:00Z'
      }
    ];

    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
      
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { budgets: mockBudgets, total: mockBudgets.length }
      }).as('getBudgets');
      
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudgets');
    });

    it('should display budget data correctly in table format', () => {
      cy.get('[data-testid="budget-table"]').should('be.visible');
      
      // Check headers
      cy.get('[data-testid="table-header-description"]')
        .should('contain.text', 'Description');
      cy.get('[data-testid="table-header-total-budget"]')
        .should('contain.text', 'Total Budget');
      cy.get('[data-testid="table-header-labor-costs"]')
        .should('contain.text', 'Labor');
      cy.get('[data-testid="table-header-actions"]')
        .should('contain.text', 'Actions');
      
      // Check data rows
      cy.get('[data-testid="budget-row"]').should('have.length', 2);
      
      // Verify first row data
      cy.get('[data-testid="budget-row"]').first().within(() => {
        cy.get('[data-testid="budget-description"]')
          .should('contain.text', 'Q1 Budget');
        cy.get('[data-testid="budget-total"]')
          .should('contain.text', '$100,000');
        cy.get('[data-testid="budget-labor"]')
          .should('contain.text', '$60,000');
      });
    });

    it('should display budget cards with correct calculations', () => {
      cy.get('[data-testid="total-budget-card"]').within(() => {
        cy.get('[data-testid="card-value"]')
          .should('contain.text', '$220,000'); // Sum of both budgets
        cy.get('[data-testid="card-label"]')
          .should('contain.text', 'Total Budget');
      });

      cy.get('[data-testid="labor-costs-card"]').within(() => {
        cy.get('[data-testid="card-value"]')
          .should('contain.text', '$130,000'); // Sum of labor costs
        cy.get('[data-testid="card-label"]')
          .should('contain.text', 'Labor Costs');
      });
    });

    it('should show budget details in expandable rows', () => {
      // Click to expand first budget row
      cy.get('[data-testid="expand-budget-button"]').first().click();
      
      cy.get('[data-testid="budget-details-row"]').should('be.visible');
      cy.get('[data-testid="budget-details"]').within(() => {
        cy.get('[data-testid="travel-costs"]')
          .should('contain.text', '$15,000');
        cy.get('[data-testid="accommodation-costs"]')
          .should('contain.text', '$12,000');
        cy.get('[data-testid="misc-costs"]')
          .should('contain.text', '$8,000');
        cy.get('[data-testid="contingency"]')
          .should('contain.text', '$5,000');
      });
      
      // Click to collapse
      cy.get('[data-testid="expand-budget-button"]').first().click();
      cy.get('[data-testid="budget-details-row"]').should('not.exist');
    });

    it('should handle budget sorting functionality', () => {
      // Sort by total budget ascending
      cy.get('[data-testid="sort-total-budget"]').click();
      
      cy.get('[data-testid="budget-row"]').first().within(() => {
        cy.get('[data-testid="budget-total"]')
          .should('contain.text', '$100,000');
      });
      
      // Sort by total budget descending
      cy.get('[data-testid="sort-total-budget"]').click();
      
      cy.get('[data-testid="budget-row"]').first().within(() => {
        cy.get('[data-testid="budget-total"]')
          .should('contain.text', '$120,000');
      });
    });

    it('should filter budgets by search term', () => {
      cy.get('[data-testid="budget-search"]')
        .type('Q1');
      
      cy.get('[data-testid="budget-row"]').should('have.length', 1);
      cy.get('[data-testid="budget-row"]').first().within(() => {
        cy.get('[data-testid="budget-description"]')
          .should('contain.text', 'Q1 Budget');
      });
      
      // Clear search
      cy.get('[data-testid="budget-search"]').clear();
      cy.get('[data-testid="budget-row"]').should('have.length', 2);
    });

    it('should handle budget deletion with confirmation', () => {
      cy.intercept('DELETE', '/api/budget/budget-1', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteBudget');

      cy.get('[data-testid="delete-budget-button"]').first().click();
      
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      cy.wait('@deleteBudget');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget deleted successfully');
    });
  });

  describe('Budget Charts & Analytics', () => {
    const mockBudgetWithAnalytics = [
      {
        id: 'budget-1',
        projectId: testData.project.id,
        totalBudget: 100000,
        laborCosts: 60000,
        travelCosts: 15000,
        accommodationCosts: 12000,
        miscCosts: 8000,
        contingency: 5000,
        spent: 45000,
        remaining: 55000,
        description: 'Project Budget',
        currency: 'USD'
      }
    ];

    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
      
      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { 
          budgets: mockBudgetWithAnalytics, 
          total: 1,
          analytics: {
            totalSpent: 45000,
            totalRemaining: 55000,
            burnRate: 0.45,
            projectedCompletion: '2024-12-31'
          }
        }
      }).as('getBudgetAnalytics');
      
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudgetAnalytics');
    });

    it('should display budget breakdown pie chart', () => {
      cy.get('[data-testid="budget-pie-chart"]').should('be.visible');
      
      // Check chart legend
      cy.get('[data-testid="chart-legend"]').within(() => {
        cy.get('[data-testid="legend-labor"]')
          .should('contain.text', 'Labor (60%)')
          .and('be.visible');
        cy.get('[data-testid="legend-travel"]')
          .should('contain.text', 'Travel (15%)')
          .and('be.visible');
        cy.get('[data-testid="legend-accommodation"]')
          .should('contain.text', 'Accommodation (12%)')
          .and('be.visible');
      });

      // Verify chart canvas or SVG is rendered
      cy.get('[data-testid="budget-pie-chart"]')
        .find('canvas, svg')
        .should('exist');
    });

    it('should display budget timeline and burn rate', () => {
      cy.get('[data-testid="budget-timeline-chart"]').should('be.visible');
      
      // Check timeline controls
      cy.get('[data-testid="timeline-controls"]').should('be.visible');
      cy.get('[data-testid="timeline-period-selector"]')
        .should('contain.value', 'monthly');
      
      // Check burn rate indicator
      cy.get('[data-testid="burn-rate-indicator"]').should('be.visible');
      cy.get('[data-testid="burn-rate-value"]')
        .should('contain.text', '45%');
    });

    it('should allow switching chart time periods', () => {
      cy.get('[data-testid="timeline-period-selector"]')
        .select('weekly');
      
      // Chart should re-render with new data
      cy.get('[data-testid="budget-timeline-chart"]')
        .should('be.visible');
      
      // Switch to yearly view
      cy.get('[data-testid="timeline-period-selector"]')
        .select('yearly');
      
      cy.get('[data-testid="budget-timeline-chart"]')
        .should('be.visible');
    });

    it('should display budget variance analysis', () => {
      cy.get('[data-testid="budget-variance-section"]')
        .should('be.visible');
      
      cy.get('[data-testid="variance-table"]').within(() => {
        cy.get('[data-testid="variance-header"]')
          .should('contain.text', 'Budget vs Actual');
        cy.get('[data-testid="variance-row"]')
          .should('have.length.at.least', 1);
      });

      // Check variance indicators
      cy.get('[data-testid="over-budget-indicator"]')
        .should('be.visible');
      cy.get('[data-testid="under-budget-indicator"]')
        .should('be.visible');
    });

    it('should export budget charts as images', () => {
      cy.get('[data-testid="export-chart-button"]').click();
      
      cy.get('[data-testid="export-options-menu"]')
        .should('be.visible');
      
      cy.get('[data-testid="export-png-option"]').click();
      
      // Verify download was initiated (note: actual file download testing is complex)
      cy.get('[data-testid="export-success-message"]')
        .should('be.visible')
        .and('contain.text', 'Chart exported successfully');
    });
  });

  describe('Budget Import/Export & Bulk Operations', () => {
    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');
    });

    it('should export budget data to CSV', () => {
      cy.intercept('GET', `/api/projects/${testData.project.id}/budget/export`, {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="budget-export.csv"'
        },
        body: 'Description,Total Budget,Labor Costs,Travel Costs\nQ1 Budget,100000,60000,15000'
      }).as('exportBudget');

      cy.get('[data-testid="export-budget-button"]').click();
      cy.get('[data-testid="export-csv-option"]').click();
      
      cy.wait('@exportBudget');
      cy.get('[data-testid="export-success-message"]')
        .should('be.visible')
        .and('contain.text', 'Budget exported successfully');
    });

    it('should import budget data from CSV', () => {
      cy.intercept('POST', `/api/projects/${testData.project.id}/budget/import`, {
        statusCode: 200,
        body: {
          success: true,
          imported: 3,
          errors: []
        }
      }).as('importBudget');

      cy.get('[data-testid="import-budget-button"]').click();
      
      cy.get('[data-testid="import-dialog"]').should('be.visible');
      
      // Mock file upload
      const csvContent = 'Description,Total Budget,Labor Costs\nTest Budget,50000,30000';
      cy.get('[data-testid="file-upload-input"]')
        .selectFile({
          contents: csvContent,
          fileName: 'budget-import.csv',
          mimeType: 'text/csv'
        });
      
      cy.get('[data-testid="import-confirm-button"]').click();
      
      cy.wait('@importBudget');
      cy.get('[data-testid="import-success-message"]')
        .should('be.visible')
        .and('contain.text', '3 budgets imported successfully');
    });

    it('should handle import validation errors', () => {
      cy.intercept('POST', `/api/projects/${testData.project.id}/budget/import`, {
        statusCode: 400,
        body: {
          success: false,
          errors: [
            { row: 2, field: 'totalBudget', message: 'Invalid budget amount' },
            { row: 3, field: 'description', message: 'Description is required' }
          ]
        }
      }).as('importBudgetErrors');

      cy.get('[data-testid="import-budget-button"]').click();
      
      const csvContent = 'Description,Total Budget\n,invalid\nTest Budget,';
      cy.get('[data-testid="file-upload-input"]')
        .selectFile({
          contents: csvContent,
          fileName: 'invalid-budget.csv',
          mimeType: 'text/csv'
        });
      
      cy.get('[data-testid="import-confirm-button"]').click();
      
      cy.wait('@importBudgetErrors');
      
      cy.get('[data-testid="import-errors-list"]').should('be.visible');
      cy.get('[data-testid="import-error-item"]')
        .should('have.length', 2);
      cy.get('[data-testid="import-error-item"]')
        .first()
        .should('contain.text', 'Row 2')
        .and('contain.text', 'Invalid budget amount');
    });

    it('should handle bulk budget operations', () => {
      const mockBudgets = [
        { id: 'budget-1', description: 'Q1 Budget', totalBudget: 100000 },
        { id: 'budget-2', description: 'Q2 Budget', totalBudget: 120000 }
      ];

      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { budgets: mockBudgets, total: 2 }
      }).as('getBudgetsForBulk');

      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudgetsForBulk');

      // Select multiple budgets
      cy.get('[data-testid="budget-checkbox"]').first().check();
      cy.get('[data-testid="budget-checkbox"]').last().check();
      
      cy.get('[data-testid="bulk-actions-toolbar"]')
        .should('be.visible');
      
      // Test bulk delete
      cy.intercept('DELETE', '/api/budget/bulk', {
        statusCode: 200,
        body: { deleted: 2 }
      }).as('bulkDeleteBudgets');

      cy.get('[data-testid="bulk-delete-button"]').click();
      cy.get('[data-testid="bulk-delete-confirm"]').click();
      
      cy.wait('@bulkDeleteBudgets');
      cy.get('[data-testid="bulk-success-message"]')
        .should('contain.text', '2 budgets deleted successfully');
    });
  });

  describe('Budget Permissions & Role-Based Access', () => {
    const restrictedUser = {
      email: 'viewer@example.com',
      password: 'test123'
    };

    it('should restrict budget creation for read-only users', () => {
      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: {
          id: 'viewer-user',
          email: restrictedUser.email,
          role: 'viewer',
          permissions: ['projects:read', 'budget:read']
        }
      }).as('getViewerUser');

      cy.login(restrictedUser.email, restrictedUser.password);
      cy.wait('@getViewerUser');
      
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      cy.get('[data-testid="create-budget-button"]')
        .should('not.exist');
      cy.get('[data-testid="import-budget-button"]')
        .should('not.exist');
    });

    it('should restrict budget editing for read-only users', () => {
      const mockBudget = {
        id: 'budget-1',
        description: 'Test Budget',
        totalBudget: 100000
      };

      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: {
          id: 'viewer-user',
          email: restrictedUser.email,
          role: 'viewer',
          permissions: ['projects:read', 'budget:read']
        }
      }).as('getViewerUser');

      cy.intercept('GET', apiEndpoints.budget(testData.project.id), {
        statusCode: 200,
        body: { budgets: [mockBudget], total: 1 }
      }).as('getBudgetForViewer');

      cy.login(restrictedUser.email, restrictedUser.password);
      cy.wait('@getViewerUser');
      
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudgetForViewer');

      cy.get('[data-testid="edit-budget-button"]')
        .should('not.exist');
      cy.get('[data-testid="delete-budget-button"]')
        .should('not.exist');
    });

    it('should allow full access for admin users', () => {
      cy.intercept('GET', apiEndpoints.user, {
        statusCode: 200,
        body: {
          id: 'admin-user',
          email: testData.ciUser.email,
          role: 'admin',
          permissions: ['*']
        }
      }).as('getAdminUser');

      cy.login(testData.ciUser.email, testData.ciUser.password);
      cy.wait('@getAdminUser');
      
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      cy.get('[data-testid="create-budget-button"]')
        .should('be.visible');
      cy.get('[data-testid="import-budget-button"]')
        .should('be.visible');
      cy.get('[data-testid="export-budget-button"]')
        .should('be.visible');
    });
  });

  describe('Budget Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.login(testData.ciUser.email, testData.ciUser.password);
    });

    it('should display mobile-optimized layout on small screens', () => {
      cy.viewport('iphone-8');
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      // Mobile navigation should be visible
      cy.get('[data-testid="mobile-nav-toggle"]')
        .should('be.visible');
      
      // Desktop table should be hidden, mobile cards shown
      cy.get('[data-testid="budget-table"]')
        .should('not.be.visible');
      cy.get('[data-testid="budget-mobile-cards"]')
        .should('be.visible');
      
      // Action buttons should be stacked
      cy.get('[data-testid="mobile-actions"]')
        .should('be.visible')
        .and('have.css', 'flex-direction', 'column');
    });

    it('should handle mobile form interactions', () => {
      cy.viewport('iphone-8');
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      cy.get('[data-testid="create-budget-button"]').click();
      
      // Form should take full screen on mobile
      cy.get('[data-testid="budget-form-modal"]')
        .should('have.class', 'full-screen-mobile');
      
      // Form fields should be touch-friendly
      cy.get('[data-testid="input-total-budget"]')
        .should('have.css', 'min-height')
        .and('match', /44px|48px/); // Standard touch target size
    });

    it('should handle tablet layout correctly', () => {
      cy.viewport('ipad-2');
      cy.visit(routes.projectBudget(testData.project.id));
      cy.wait('@getBudget');

      // Should show hybrid layout
      cy.get('[data-testid="budget-table"]')
        .should('be.visible');
      cy.get('[data-testid="budget-charts"]')
        .should('be.visible');
      
      // Charts should stack vertically on tablet
      cy.get('[data-testid="charts-container"]')
        .should('have.css', 'flex-direction', 'column');
    });
  });

  // Test helper function for login
  Cypress.Commands.add('login', (email, password) => {
    cy.request({
      method: 'POST',
      url: apiEndpoints.login,
      body: { email, password }
    }).then((response) => {
      expect(response.status).to.eq(200);
      window.localStorage.setItem('auth-token', response.body.token);
    });
  });
});
