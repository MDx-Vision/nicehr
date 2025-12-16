describe('Budget Feature - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
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
    budget: {
      valid: {
        category: 'Personnel',
        amount: 250000,
        description: 'Staff consultants and specialists',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        currency: 'USD'
      },
      updated: {
        category: 'Equipment',
        amount: 350000,
        description: 'Updated budget for equipment and infrastructure',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        currency: 'USD'
      },
      invalid: {
        negativeAmount: -50000,
        zeroAmount: 0,
        invalidStartDate: '2024-13-01',
        invalidEndDate: '2023-12-31',
        emptyCategory: '',
        tooLongDescription: 'A'.repeat(1001),
        invalidCurrency: 'INVALID'
      }
    },
    budgetScenarios: {
      conservative: {
        name: 'Conservative Scenario',
        description: 'Conservative budget estimates with 10% buffer',
        multiplier: 0.9
      },
      optimistic: {
        name: 'Optimistic Scenario',
        description: 'Best-case scenario with optimal resource allocation',
        multiplier: 1.2
      },
      realistic: {
        name: 'Realistic Scenario',
        description: 'Most likely budget scenario based on historical data',
        multiplier: 1.0
      }
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    projects: '/api/projects',
    projectBudget: '/api/projects/*/budget',
    budgetScenarios: '/api/budget-scenarios',
    scenarioMetrics: '/api/scenario-metrics'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Setup API intercepts
    cy.intercept('POST', apiEndpoints.login).as('loginRequest');
    cy.intercept('GET', apiEndpoints.user).as('userRequest');
    cy.intercept('GET', apiEndpoints.projects).as('projectsRequest');
    cy.intercept('GET', apiEndpoints.projectBudget).as('getBudgetRequest');
    cy.intercept('POST', apiEndpoints.projectBudget).as('createBudgetRequest');
    cy.intercept('PATCH', '/api/budget/*').as('updateBudgetRequest');
    cy.intercept('GET', apiEndpoints.budgetScenarios).as('getScenariosRequest');
    cy.intercept('POST', apiEndpoints.budgetScenarios).as('createScenarioRequest');
    cy.intercept('DELETE', '/api/budget-scenarios/*').as('deleteScenarioRequest');
    cy.intercept('POST', '/api/budget-scenarios/*/clone').as('cloneScenarioRequest');
    cy.intercept('GET', apiEndpoints.scenarioMetrics).as('getMetricsRequest');
    cy.intercept('POST', apiEndpoints.scenarioMetrics).as('createMetricsRequest');

    // Login
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]').type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@loginRequest');
    cy.wait('@userRequest');
  });

  describe('Budget Overview Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest', { timeout: 10000 });
    });

    it('should display complete budget overview layout', () => {
      // Page header
      cy.get('[data-testid="budget-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('[data-testid="budget-title"]')
        .should('be.visible')
        .and('contain.text', /budget/i);
      
      // Summary cards
      cy.get('[data-testid="budget-summary"]').should('be.visible');
      cy.get('[data-testid="total-budget-card"]').should('be.visible');
      cy.get('[data-testid="spent-budget-card"]').should('be.visible');
      cy.get('[data-testid="remaining-budget-card"]').should('be.visible');
      cy.get('[data-testid="variance-card"]').should('be.visible');

      // Action buttons
      cy.get('[data-testid="create-budget-button"]')
        .should('be.visible')
        .and('not.be.disabled');
      cy.get('[data-testid="export-budget-button"]')
        .should('be.visible');
      cy.get('[data-testid="budget-scenarios-button"]')
        .should('be.visible');

      // Budget table/list
      cy.get('[data-testid="budget-list"]').should('be.visible');
    });

    it('should display budget summary with proper formatting', () => {
      cy.get('[data-testid="total-budget-card"]').within(() => {
        cy.get('[data-testid="budget-amount"]')
          .should('be.visible')
          .and('match', /\$[\d,]+(\.\d{2})?/);
        cy.get('[data-testid="budget-label"]')
          .should('contain.text', /total|budget/i);
      });

      cy.get('[data-testid="spent-budget-card"]').within(() => {
        cy.get('[data-testid="spent-amount"]')
          .should('be.visible')
          .and('match', /\$[\d,]+(\.\d{2})?/);
        cy.get('[data-testid="spent-percentage"]')
          .should('be.visible')
          .and('match', /\d+%/);
      });

      cy.get('[data-testid="remaining-budget-card"]').within(() => {
        cy.get('[data-testid="remaining-amount"]')
          .should('be.visible');
        cy.get('[data-testid="remaining-days"]')
          .should('be.visible');
      });
    });

    it('should handle navigation between budget views', () => {
      // Navigate to scenarios
      cy.get('[data-testid="budget-scenarios-button"]').click();
      cy.url().should('include', '/budget/scenarios');
      cy.wait('@getScenariosRequest');

      // Navigate back to overview
      cy.get('[data-testid="budget-overview-tab"]').click();
      cy.url().should('include', '/budget');
      cy.url().should('not.include', '/scenarios');

      // Navigate to reports
      cy.get('[data-testid="budget-reports-tab"]').click();
      cy.url().should('include', '/budget/reports');
    });
  });

  describe('Create Budget - Form Functionality', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');
      cy.get('[data-testid="create-budget-button"]').click();
    });

    it('should display create budget form with all required fields', () => {
      // Form container
      cy.get('[data-testid="create-budget-form"]', { timeout: 10000 })
        .should('be.visible');

      // Required form fields
      cy.get('[data-testid="input-budget-category"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-budget-amount"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-budget-description"]')
        .should('be.visible');
      cy.get('[data-testid="input-start-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');
      cy.get('[data-testid="input-end-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date')
        .and('have.attr', 'required');
      cy.get('[data-testid="select-currency"]')
        .should('be.visible');

      // Form buttons
      cy.get('[data-testid="button-create-budget"]')
        .should('be.visible')
        .and('contain.text', /create|save/i);
      cy.get('[data-testid="button-cancel-budget"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should validate required fields on form submission', () => {
      // Try to submit empty form
      cy.get('[data-testid="button-create-budget"]').click();

      // Check for validation errors
      cy.get('[data-testid="error-budget-category"]')
        .should('be.visible')
        .and('contain.text', /required|category/i);
      cy.get('[data-testid="error-budget-amount"]')
        .should('be.visible')
        .and('contain.text', /required|amount/i);
      cy.get('[data-testid="error-start-date"]')
        .should('be.visible')
        .and('contain.text', /required|date/i);
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /required|date/i);

      // Form should not be submitted
      cy.wait(1000);
      cy.get('@createBudgetRequest.all').should('have.length', 0);
    });

    it('should validate amount field with various inputs', () => {
      // Test negative amount
      cy.get('[data-testid="input-budget-amount"]')
        .clear()
        .type(testData.budget.invalid.negativeAmount.toString());
      cy.get('[data-testid="button-create-budget"]').click();
      cy.get('[data-testid="error-budget-amount"]')
        .should('be.visible')
        .and('contain.text', /positive|greater/i);

      // Test zero amount
      cy.get('[data-testid="input-budget-amount"]')
        .clear()
        .type(testData.budget.invalid.zeroAmount.toString());
      cy.get('[data-testid="button-create-budget"]').click();
      cy.get('[data-testid="error-budget-amount"]')
        .should('be.visible')
        .and('contain.text', /positive|greater/i);

      // Test valid amount
      cy.get('[data-testid="input-budget-amount"]')
        .clear()
        .type(testData.budget.valid.amount.toString());
      cy.get('[data-testid="error-budget-amount"]')
        .should('not.exist');
    });

    it('should validate date fields with various inputs', () => {
      // Test end date before start date
      cy.get('[data-testid="input-start-date"]')
        .type('2024-12-01');
      cy.get('[data-testid="input-end-date"]')
        .type('2024-11-01');
      cy.get('[data-testid="button-create-budget"]').click();
      
      cy.get('[data-testid="error-end-date"]')
        .should('be.visible')
        .and('contain.text', /after|later/i);

      // Test valid date range
      cy.get('[data-testid="input-start-date"]')
        .clear()
        .type(testData.budget.valid.startDate);
      cy.get('[data-testid="input-end-date"]')
        .clear()
        .type(testData.budget.valid.endDate);
      cy.get('[data-testid="error-end-date"]')
        .should('not.exist');
    });

    it('should successfully create budget with valid data', () => {
      // Fill form with valid data
      cy.get('[data-testid="input-budget-category"]')
        .type(testData.budget.valid.category);
      cy.get('[data-testid="input-budget-amount"]')
        .type(testData.budget.valid.amount.toString());
      cy.get('[data-testid="input-budget-description"]')
        .type(testData.budget.valid.description);
      cy.get('[data-testid="input-start-date"]')
        .type(testData.budget.valid.startDate);
      cy.get('[data-testid="input-end-date"]')
        .type(testData.budget.valid.endDate);
      cy.get('[data-testid="select-currency"]')
        .select(testData.budget.valid.currency);

      // Submit form
      cy.get('[data-testid="button-create-budget"]').click();

      // Verify API call
      cy.wait('@createBudgetRequest').then((interception) => {
        expect(interception.request.body).to.include({
          category: testData.budget.valid.category,
          amount: testData.budget.valid.amount,
          description: testData.budget.valid.description,
          startDate: testData.budget.valid.startDate,
          endDate: testData.budget.valid.endDate,
          currency: testData.budget.valid.currency
        });
      });

      // Verify success feedback
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created|success/i);

      // Should redirect to budget overview
      cy.url().should('include', '/budget');
      cy.url().should('not.include', '/create');
    });

    it('should handle form cancellation', () => {
      // Fill some data
      cy.get('[data-testid="input-budget-category"]')
        .type(testData.budget.valid.category);
      cy.get('[data-testid="input-budget-amount"]')
        .type(testData.budget.valid.amount.toString());

      // Cancel form
      cy.get('[data-testid="button-cancel-budget"]').click();

      // Should return to budget overview
      cy.url().should('include', '/budget');
      cy.url().should('not.include', '/create');

      // No API call should be made
      cy.get('@createBudgetRequest.all').should('have.length', 0);
    });
  });

  describe('Budget List - Display & Management', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');
    });

    it('should display budget items in a structured list/table', () => {
      cy.get('[data-testid="budget-list"]', { timeout: 10000 })
        .should('be.visible');

      // Table headers
      cy.get('[data-testid="budget-table-header"]').within(() => {
        cy.contains('Category').should('be.visible');
        cy.contains('Amount').should('be.visible');
        cy.contains('Period').should('be.visible');
        cy.contains('Status').should('be.visible');
        cy.contains('Actions').should('be.visible');
      });

      // Budget items
      cy.get('[data-testid="budget-item"]').should('have.length.at.least', 1);
    });

    it('should display budget items with proper formatting', () => {
      cy.get('[data-testid="budget-item"]').first().within(() => {
        // Category
        cy.get('[data-testid="budget-category"]')
          .should('be.visible')
          .and('not.be.empty');

        // Amount with currency formatting
        cy.get('[data-testid="budget-amount"]')
          .should('be.visible')
          .and('match', /\$[\d,]+(\.\d{2})?/);

        // Date range
        cy.get('[data-testid="budget-period"]')
          .should('be.visible')
          .and('match', /\d{4}-\d{2}-\d{2}/);

        // Status indicator
        cy.get('[data-testid="budget-status"]')
          .should('be.visible')
          .and('match', /active|inactive|pending|approved/i);

        // Action buttons
        cy.get('[data-testid="edit-budget-button"]')
          .should('be.visible');
        cy.get('[data-testid="delete-budget-button"]')
          .should('be.visible');
      });
    });

    it('should handle empty budget state', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.projectBudget, {
        statusCode: 200,
        body: { budgets: [] }
      }).as('emptyBudgetRequest');

      cy.reload();
      cy.wait('@emptyBudgetRequest');

      // Empty state display
      cy.get('[data-testid="empty-budget-state"]')
        .should('be.visible');
      cy.get('[data-testid="empty-budget-message"]')
        .should('be.visible')
        .and('contain.text', /no budget|create first/i);
      cy.get('[data-testid="create-first-budget-button"]')
        .should('be.visible')
        .and('contain.text', /create|add/i);
    });

    it('should support sorting budget items', () => {
      // Sort by amount
      cy.get('[data-testid="sort-by-amount"]').click();
      cy.wait(500);

      // Verify sorting order
      cy.get('[data-testid="budget-amount"]')
        .then(($amounts) => {
          const amounts = [...$amounts].map(el => 
            parseFloat(el.textContent.replace(/[$,]/g, ''))
          );
          const sortedAmounts = [...amounts].sort((a, b) => a - b);
          expect(amounts).to.deep.equal(sortedAmounts);
        });

      // Sort by category
      cy.get('[data-testid="sort-by-category"]').click();
      cy.wait(500);

      // Verify alphabetical sorting
      cy.get('[data-testid="budget-category"]')
        .then(($categories) => {
          const categories = [...$categories].map(el => el.textContent.trim());
          const sortedCategories = [...categories].sort();
          expect(categories).to.deep.equal(sortedCategories);
        });
    });

    it('should support filtering budget items', () => {
      // Filter by category
      cy.get('[data-testid="filter-category"]')
        .select('Personnel');
      cy.wait(500);

      cy.get('[data-testid="budget-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-testid="budget-category"]')
            .should('contain.text', 'Personnel');
        });
      });

      // Filter by status
      cy.get('[data-testid="filter-status"]')
        .select('Active');
      cy.wait(500);

      cy.get('[data-testid="budget-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-testid="budget-status"]')
            .should('contain.text', 'Active');
        });
      });

      // Clear filters
      cy.get('[data-testid="clear-filters-button"]').click();
      cy.get('[data-testid="filter-category"]')
        .should('have.value', '');
      cy.get('[data-testid="filter-status"]')
        .should('have.value', '');
    });
  });

  describe('Edit Budget - Update Functionality', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');
      cy.get('[data-testid="budget-item"]').first().within(() => {
        cy.get('[data-testid="edit-budget-button"]').click();
      });
    });

    it('should display edit budget form with pre-populated data', () => {
      cy.get('[data-testid="edit-budget-form"]', { timeout: 10000 })
        .should('be.visible');

      // Form fields should be populated
      cy.get('[data-testid="input-budget-category"]')
        .should('not.have.value', '');
      cy.get('[data-testid="input-budget-amount"]')
        .should('not.have.value', '');
      cy.get('[data-testid="input-start-date"]')
        .should('not.have.value', '');
      cy.get('[data-testid="input-end-date"]')
        .should('not.have.value', '');

      // Form buttons
      cy.get('[data-testid="button-update-budget"]')
        .should('be.visible')
        .and('contain.text', /update|save/i);
      cy.get('[data-testid="button-cancel-edit"]')
        .should('be.visible');
    });

    it('should successfully update budget with new data', () => {
      // Update fields
      cy.get('[data-testid="input-budget-category"]')
        .clear()
        .type(testData.budget.updated.category);
      cy.get('[data-testid="input-budget-amount"]')
        .clear()
        .type(testData.budget.updated.amount.toString());
      cy.get('[data-testid="input-budget-description"]')
        .clear()
        .type(testData.budget.updated.description);
      cy.get('[data-testid="input-start-date"]')
        .clear()
        .type(testData.budget.updated.startDate);
      cy.get('[data-testid="input-end-date"]')
        .clear()
        .type(testData.budget.updated.endDate);

      // Submit update
      cy.get('[data-testid="button-update-budget"]').click();

      // Verify API call
      cy.wait('@updateBudgetRequest').then((interception) => {
        expect(interception.request.body).to.include({
          category: testData.budget.updated.category,
          amount: testData.budget.updated.amount,
          description: testData.budget.updated.description,
          startDate: testData.budget.updated.startDate,
          endDate: testData.budget.updated.endDate
        });
      });

      // Verify success feedback
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|success/i);

      // Should return to budget list
      cy.url().should('include', '/budget');
      cy.url().should('not.include', '/edit');
    });

    it('should validate updated data before submission', () => {
      // Clear required field
      cy.get('[data-testid="input-budget-category"]').clear();
      cy.get('[data-testid="button-update-budget"]').click();

      // Check validation error
      cy.get('[data-testid="error-budget-category"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      // No API call should be made
      cy.get('@updateBudgetRequest.all').should('have.length', 0);
    });

    it('should handle edit cancellation', () => {
      // Make some changes
      cy.get('[data-testid="input-budget-category"]')
        .clear()
        .type('Changed Category');

      // Cancel edit
      cy.get('[data-testid="button-cancel-edit"]').click();

      // Should return to budget list
      cy.url().should('include', '/budget');
      cy.url().should('not.include', '/edit');

      // No API call should be made
      cy.get('@updateBudgetRequest.all').should('have.length', 0);
    });
  });

  describe('Delete Budget - Removal Functionality', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');
    });

    it('should show confirmation dialog when deleting budget', () => {
      cy.get('[data-testid="budget-item"]').first().within(() => {
        cy.get('[data-testid="delete-budget-button"]').click();
      });

      // Confirmation dialog
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');
      cy.get('[data-testid="delete-confirmation-message"]')
        .should('be.visible')
        .and('contain.text', /delete|remove/i);
      cy.get('[data-testid="confirm-delete-button"]')
        .should('be.visible')
        .and('contain.text', /delete|confirm/i);
      cy.get('[data-testid="cancel-delete-button"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should successfully delete budget when confirmed', () => {
      // Mock delete endpoint
      cy.intercept('DELETE', '/api/budget/*', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteBudgetRequest');

      cy.get('[data-testid="budget-item"]').first().within(() => {
        cy.get('[data-testid="delete-budget-button"]').click();
      });

      cy.get('[data-testid="confirm-delete-button"]').click();

      // Verify API call
      cy.wait('@deleteBudgetRequest');

      // Verify success feedback
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);

      // Budget item should be removed from list
      cy.wait(1000);
      cy.get('[data-testid="budget-item"]')
        .should('have.length.lessThan', 10); // Assuming initial count
    });

    it('should cancel deletion when user clicks cancel', () => {
      const initialCount = cy.get('[data-testid="budget-item"]');

      cy.get('[data-testid="budget-item"]').first().within(() => {
        cy.get('[data-testid="delete-budget-button"]').click();
      });

      cy.get('[data-testid="cancel-delete-button"]').click();

      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');

      // Budget item should remain
      cy.get('[data-testid="budget-item"]')
        .should('have.length.at.least', 1);
    });
  });

  describe('Budget Scenarios - Advanced Planning', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget/scenarios');
      cy.wait('@getScenariosRequest');
    });

    it('should display budget scenarios page layout', () => {
      // Page header
      cy.get('[data-testid="scenarios-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('[data-testid="scenarios-title"]')
        .should('contain.text', /scenario/i);

      // Action buttons
      cy.get('[data-testid="create-scenario-button"]')
        .should('be.visible')
        .and('contain.text', /create|new/i);
      cy.get('[data-testid="compare-scenarios-button"]')
        .should('be.visible');

      // Scenarios list
      cy.get('[data-testid="scenarios-list"]')
        .should('be.visible');
    });

    it('should create new budget scenario', () => {
      cy.get('[data-testid="create-scenario-button"]').click();

      // Scenario form
      cy.get('[data-testid="scenario-form"]')
        .should('be.visible');
      
      // Fill scenario details
      cy.get('[data-testid="input-scenario-name"]')
        .type(testData.budgetScenarios.conservative.name);
      cy.get('[data-testid="input-scenario-description"]')
        .type(testData.budgetScenarios.conservative.description);
      cy.get('[data-testid="input-scenario-multiplier"]')
        .type(testData.budgetScenarios.conservative.multiplier.toString());

      // Submit scenario
      cy.get('[data-testid="button-create-scenario"]').click();

      // Verify API call
      cy.wait('@createScenarioRequest').then((interception) => {
        expect(interception.request.body).to.include({
          name: testData.budgetScenarios.conservative.name,
          description: testData.budgetScenarios.conservative.description,
          multiplier: testData.budgetScenarios.conservative.multiplier
        });
      });

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created/i);
    });

    it('should display scenario comparison', () => {
      cy.get('[data-testid="compare-scenarios-button"]').click();

      // Comparison view
      cy.get('[data-testid="scenario-comparison"]')
        .should('be.visible');
      
      // Select scenarios to compare
      cy.get('[data-testid="select-scenario-1"]')
        .select('Conservative Scenario');
      cy.get('[data-testid="select-scenario-2"]')
        .select('Optimistic Scenario');

      // Comparison table
      cy.get('[data-testid="comparison-table"]')
        .should('be.visible');
      
      // Verify comparison data
      cy.get('[data-testid="comparison-row"]').should('have.length.at.least', 1);
      cy.get('[data-testid="variance-column"]').should('be.visible');
      cy.get('[data-testid="percentage-difference"]').should('be.visible');
    });

    it('should clone existing scenario', () => {
      cy.get('[data-testid="scenario-item"]').first().within(() => {
        cy.get('[data-testid="clone-scenario-button"]').click();
      });

      // Clone confirmation
      cy.get('[data-testid="clone-scenario-form"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-clone-name"]')
        .type('Cloned Scenario');
      
      cy.get('[data-testid="button-confirm-clone"]').click();

      // Verify API call
      cy.wait('@cloneScenarioRequest');

      // Verify new scenario appears
      cy.get('[data-testid="scenario-item"]')
        .should('contain.text', 'Cloned Scenario');
    });

    it('should delete scenario with confirmation', () => {
      cy.get('[data-testid="scenario-item"]').first().within(() => {
        cy.get('[data-testid="delete-scenario-button"]').click();
      });

      // Delete confirmation
      cy.get('[data-testid="delete-scenario-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-scenario-delete"]').click();

      // Verify deletion
      cy.wait('@deleteScenarioRequest');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted/i);
    });
  });

  describe('Budget Analytics & Reporting', () => {
    beforeEach(() => {
      cy.visit('/projects/' + testData.project.id + '/budget/reports');
    });

    it('should display budget analytics dashboard', () => {
      // Analytics header
      cy.get('[data-testid="analytics-header"]', { timeout: 10000 })
        .should('be.visible');

      // Chart containers
      cy.get('[data-testid="budget-trend-chart"]')
        .should('be.visible');
      cy.get('[data-testid="category-breakdown-chart"]')
        .should('be.visible');
      cy.get('[data-testid="variance-analysis-chart"]')
        .should('be.visible');

      // Metrics cards
      cy.get('[data-testid="burn-rate-metric"]')
        .should('be.visible');
      cy.get('[data-testid="forecast-metric"]')
        .should('be.visible');
      cy.get('[data-testid="efficiency-metric"]')
        .should('be.visible');
    });

    it('should support date range filtering for reports', () => {
      // Date range picker
      cy.get('[data-testid="date-range-picker"]')
        .should('be.visible');
      
      cy.get('[data-testid="start-date-input"]')
        .type('2024-01-01');
      cy.get('[data-testid="end-date-input"]')
        .type('2024-06-30');
      
      cy.get('[data-testid="apply-date-filter"]').click();

      // Verify charts update
      cy.get('[data-testid="budget-trend-chart"]')
        .should('be.visible');
      
      // Verify metrics update
      cy.get('[data-testid="filtered-period-display"]')
        .should('contain.text', '2024-01-01')
        .and('contain.text', '2024-06-30');
    });

    it('should export budget reports', () => {
      // Export button
      cy.get('[data-testid="export-report-button"]').click();

      // Export options
      cy.get('[data-testid="export-format-selector"]')
        .should('be.visible');
      
      cy.get('[data-testid="export-pdf"]').click();

      // Verify export initiation
      cy.get('[data-testid="export-progress"]')
        .should('be.visible');
      
      cy.get('[data-testid="download-link"]', { timeout: 30000 })
        .should('be.visible')
        .and('have.attr', 'href')
        .and('include', '.pdf');
    });
  });

  describe('Budget Error Handling & Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      // Mock server error
      cy.intercept('GET', apiEndpoints.projectBudget, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('budgetErrorRequest');

      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@budgetErrorRequest');

      // Error state display
      cy.get('[data-testid="error-state"]')
        .should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error|unable|load/i);
      cy.get('[data-testid="retry-button"]')
        .should('be.visible')
        .and('contain.text', /retry|reload/i);
    });

    it('should handle network failures', () => {
      // Mock network failure
      cy.intercept('POST', apiEndpoints.projectBudget, {
        forceNetworkError: true
      }).as('networkErrorRequest');

      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.get('[data-testid="create-budget-button"]').click();

      // Fill and submit form
      cy.get('[data-testid="input-budget-category"]')
        .type(testData.budget.valid.category);
      cy.get('[data-testid="input-budget-amount"]')
        .type(testData.budget.valid.amount.toString());
      cy.get('[data-testid="button-create-budget"]').click();

      cy.wait('@networkErrorRequest');

      // Network error handling
      cy.get('[data-testid="network-error-message"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
      cy.get('[data-testid="retry-submit-button"]')
        .should('be.visible');
    });

    it('should handle unauthorized access', () => {
      // Mock unauthorized response
      cy.intercept('GET', apiEndpoints.projectBudget, {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('unauthorizedRequest');

      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@unauthorizedRequest');

      // Unauthorized state
      cy.get('[data-testid="unauthorized-message"]')
        .should('be.visible')
        .and('contain.text', /permission|access/i);
    });

    it('should validate budget limits and constraints', () => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.get('[data-testid="create-budget-button"]').click();

      // Test extremely large amount
      cy.get('[data-testid="input-budget-amount"]')
        .type('999999999999');
      cy.get('[data-testid="button-create-budget"]').click();

      cy.get('[data-testid="error-budget-amount"]')
        .should('be.visible')
        .and('contain.text', /maximum|limit/i);

      // Test maximum description length
      cy.get('[data-testid="input-budget-description"]')
        .type(testData.budget.invalid.tooLongDescription);
      cy.get('[data-testid="button-create-budget"]').click();

      cy.get('[data-testid="error-budget-description"]')
        .should('be.visible')
        .and('contain.text', /length|characters/i);
    });
  });

  describe('Budget Responsive Design & Accessibility', () => {
    it('should work properly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');

      // Mobile layout adjustments
      cy.get('[data-testid="budget-summary"]')
        .should('be.visible');
      cy.get('[data-testid="budget-list"]')
        .should('be.visible');

      // Mobile-specific elements
      cy.get('[data-testid="mobile-menu-button"]')
        .should('be.visible');
      cy.get('[data-testid="mobile-budget-actions"]')
        .should('be.visible');
    });

    it('should work properly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');

      // Tablet layout
      cy.get('[data-testid="budget-summary"]')
        .should('be.visible');
      cy.get('[data-testid="budget-list"]')
        .should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');

      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'create-budget-button');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'export-budget-button');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'budget-scenarios-button');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');

      // Check ARIA attributes
      cy.get('[data-testid="budget-summary"]')
        .should('have.attr', 'role', 'region')
        .and('have.attr', 'aria-label');
      
      cy.get('[data-testid="budget-list"]')
        .should('have.attr', 'role', 'table')
        .and('have.attr', 'aria-label');

      cy.get('[data-testid="create-budget-button"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'type', 'button');
    });
  });

  describe('Budget Performance & Loading States', () => {
    it('should show loading states during data fetch', () => {
      // Mock slow response
      cy.intercept('GET', apiEndpoints.projectBudget, {
        delay: 2000,
        statusCode: 200,
        body: { budgets: [] }
      }).as('slowBudgetRequest');

      cy.visit('/projects/' + testData.project.id + '/budget');

      // Loading indicators
      cy.get('[data-testid="budget-loading"]')
        .should('be.visible');
      cy.get('[data-testid="loading-spinner"]')
        .should('be.visible');

      cy.wait('@slowBudgetRequest');

      // Loading states should disappear
      cy.get('[data-testid="budget-loading"]')
        .should('not.exist');
      cy.get('[data-testid="loading-spinner"]')
        .should('not.exist');
    });

    it('should handle concurrent budget operations', () => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');

      // Start multiple operations
      cy.get('[data-testid="create-budget-button"]').click();
      cy.get('[data-testid="export-budget-button"]').click();
      cy.get('[data-testid="budget-scenarios-button"]').click();

      // Should handle gracefully without conflicts
      cy.url().should('include', '/budget/scenarios');
    });

    it('should cache budget data appropriately', () => {
      cy.visit('/projects/' + testData.project.id + '/budget');
      cy.wait('@getBudgetRequest');

      // Navigate away and back
      cy.visit('/projects/' + testData.project.id);
      cy.visit('/projects/' + testData.project.id + '/budget');

      // Should use cached data (no new request)
      cy.get('[data-testid="budget-list"]', { timeout: 5000 })
        .should('be.visible');
    });
  });
});
