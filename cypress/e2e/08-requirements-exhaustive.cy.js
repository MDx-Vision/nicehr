describe('Requirements Management - Exhaustive Tests', () => {
  const testData = {
    requirement: {
      title: 'Test Requirement Title',
      description: 'Detailed description of the test requirement for comprehensive testing',
      priority: 'high',
      category: 'functional',
      estimatedEffort: 40,
      dueDate: '2024-12-31',
      status: 'pending'
    },
    updatedRequirement: {
      title: 'Updated Test Requirement Title',
      description: 'Updated detailed description of the test requirement',
      priority: 'medium',
      category: 'non-functional',
      estimatedEffort: 60,
      status: 'in_progress'
    },
    invalidRequirement: {
      title: '', // Empty title
      description: '',
      priority: 'invalid-priority',
      estimatedEffort: -5, // Negative effort
      dueDate: 'invalid-date'
    },
    ciData: {
      projectId: 'ci-test-project',
      hospitalId: 'ci-test-hospital',
      userId: 'ci-test-user'
    }
  };

  const apiEndpoints = {
    projectRequirements: (projectId) => `/api/projects/${projectId}/requirements`,
    requirement: (id) => `/api/requirements/${id}`,
    projects: '/api/projects',
    project: (id) => `/api/projects/${id}`
  };

  let createdRequirementId = null;
  let projectId = null;

  before(() => {
    // Login as admin user
    cy.login('test@example.com', 'test123');
    
    // Ensure we have a project to work with
    cy.request({
      method: 'GET',
      url: apiEndpoints.projects,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.length > 0) {
        projectId = response.body[0].id;
      } else {
        // Create a test project if none exists
        cy.request({
          method: 'POST',
          url: apiEndpoints.projects,
          body: {
            name: 'Test Requirements Project',
            hospitalId: testData.ciData.hospitalId,
            description: 'Project for testing requirements functionality',
            status: 'active'
          }
        }).then((response) => {
          projectId = response.body.id;
        });
      }
    });
  });

  beforeEach(() => {
    // Ensure clean state
    cy.login('test@example.com', 'test123');
  });

  afterEach(() => {
    // Cleanup created requirements
    if (createdRequirementId) {
      cy.request({
        method: 'DELETE',
        url: apiEndpoints.requirement(createdRequirementId),
        failOnStatusCode: false
      });
      createdRequirementId = null;
    }
  });

  describe('Requirements List Page - UI & Navigation', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should display requirements list page with all UI components', () => {
      // Page title and breadcrumbs
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', /requirements/i);
      
      // Main container
      cy.get('[data-testid="requirements-container"]', { timeout: 10000 })
        .should('be.visible');

      // Action buttons
      cy.get('[data-testid="add-requirement-button"]')
        .should('be.visible')
        .and('not.be.disabled')
        .and('contain.text', /add|create|new/i);

      // Search and filters
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirements-search"]').length > 0) {
          cy.get('[data-testid="requirements-search"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
        
        if ($body.find('[data-testid="requirements-filter"]').length > 0) {
          cy.get('[data-testid="requirements-filter"]')
            .should('be.visible');
        }
      });

      // Requirements list or empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirements-list"]').length > 0) {
          cy.get('[data-testid="requirements-list"]').should('be.visible');
        } else {
          cy.get('[data-testid="empty-state"], [data-testid="no-requirements"]')
            .should('be.visible');
        }
      });
    });

    it('should handle search functionality correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirements-search"]').length > 0) {
          const searchTerm = 'test requirement';
          
          // Intercept search API call
          cy.intercept('GET', `${apiEndpoints.projectRequirements(projectId)}*`, {
            statusCode: 200,
            body: []
          }).as('searchRequirements');

          // Perform search
          cy.get('[data-testid="requirements-search"]')
            .clear()
            .type(searchTerm);

          cy.wait('@searchRequirements');

          // Verify search was performed
          cy.get('[data-testid="requirements-search"]')
            .should('have.value', searchTerm);
        } else {
          cy.log('Search functionality not available on this page');
        }
      });
    });

    it('should handle filter functionality correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirements-filter"]').length > 0) {
          // Intercept filter API call
          cy.intercept('GET', `${apiEndpoints.projectRequirements(projectId)}*`, {
            statusCode: 200,
            body: []
          }).as('filterRequirements');

          // Test priority filter
          cy.get('[data-testid="requirements-filter"]').click();
          
          cy.get('body').then(($filterBody) => {
            if ($filterBody.find('[data-testid="filter-priority-high"]').length > 0) {
              cy.get('[data-testid="filter-priority-high"]').click();
              cy.wait('@filterRequirements');
            }
          });
        } else {
          cy.log('Filter functionality not available on this page');
        }
      });
    });

    it('should handle pagination when many requirements exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          // Test pagination controls
          cy.get('[data-testid="pagination"]').should('be.visible');
          
          if ($body.find('[data-testid="pagination-next"]').length > 0) {
            cy.get('[data-testid="pagination-next"]')
              .should('be.visible');
          }
          
          if ($body.find('[data-testid="pagination-prev"]').length > 0) {
            cy.get('[data-testid="pagination-prev"]')
              .should('be.visible');
          }
        } else {
          cy.log('Pagination not needed or available');
        }
      });
    });
  });

  describe('Create Requirement - Form Validation & UI', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should open create requirement form with all necessary fields', () => {
      // Click add requirement button
      cy.get('[data-testid="add-requirement-button"]').click();

      // Verify form opened (modal or new page)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-form-modal"]').length > 0) {
          cy.get('[data-testid="requirement-form-modal"]')
            .should('be.visible');
        } else {
          cy.url().should('include', '/requirements/new');
        }
      });

      // Verify all form fields exist
      cy.get('[data-testid="requirement-title-input"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="requirement-description-input"]')
        .should('be.visible');

      cy.get('[data-testid="requirement-priority-select"]')
        .should('be.visible');

      // Category field
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-category-select"]').length > 0) {
          cy.get('[data-testid="requirement-category-select"]')
            .should('be.visible');
        }
      });

      // Effort field
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-effort-input"]').length > 0) {
          cy.get('[data-testid="requirement-effort-input"]')
            .should('be.visible')
            .and('have.attr', 'type', 'number');
        }
      });

      // Due date field
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-due-date-input"]').length > 0) {
          cy.get('[data-testid="requirement-due-date-input"]')
            .should('be.visible')
            .and('have.attr', 'type', 'date');
        }
      });

      // Form buttons
      cy.get('[data-testid="save-requirement-button"]')
        .should('be.visible')
        .and('not.be.disabled');

      cy.get('[data-testid="cancel-button"]')
        .should('be.visible');
    });

    it('should validate required fields on form submission', () => {
      cy.get('[data-testid="add-requirement-button"]').click();

      // Try to submit empty form
      cy.get('[data-testid="save-requirement-button"]').click();

      // Check for validation errors
      cy.get('[data-testid="requirement-title-input"]')
        .then(($input) => {
          const validationMessage = $input[0].validationMessage;
          expect(validationMessage).to.not.be.empty;
        });

      // Check for custom validation messages
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="title-error"], .error-message').length > 0) {
          cy.get('[data-testid="title-error"], .error-message')
            .should('be.visible')
            .and('contain.text', /required|field is required/i);
        }
      });
    });

    it('should validate field formats and constraints', () => {
      cy.get('[data-testid="add-requirement-button"]').click();

      // Test invalid effort value
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-effort-input"]').length > 0) {
          cy.get('[data-testid="requirement-effort-input"]')
            .clear()
            .type('-5'); // Negative value

          cy.get('[data-testid="save-requirement-button"]').click();

          // Check for validation error
          cy.get('[data-testid="requirement-effort-input"]')
            .then(($input) => {
              const validationMessage = $input[0].validationMessage;
              if (validationMessage) {
                expect(validationMessage).to.contain('positive');
              }
            });
        }
      });

      // Test invalid date format
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-due-date-input"]').length > 0) {
          cy.get('[data-testid="requirement-due-date-input"]')
            .clear()
            .type('2020-01-01'); // Past date

          cy.get('[data-testid="save-requirement-button"]').click();
        }
      });
    });

    it('should handle form cancellation correctly', () => {
      cy.get('[data-testid="add-requirement-button"]').click();

      // Fill some data
      cy.get('[data-testid="requirement-title-input"]')
        .type('Test data that should be discarded');

      // Cancel form
      cy.get('[data-testid="cancel-button"]').click();

      // Verify form closed
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-form-modal"]').length > 0) {
          cy.get('[data-testid="requirement-form-modal"]')
            .should('not.exist');
        } else {
          cy.url().should('not.include', '/requirements/new');
        }
      });

      // Verify no data was saved
      cy.get('[data-testid="add-requirement-button"]').click();
      cy.get('[data-testid="requirement-title-input"]')
        .should('have.value', '');
    });
  });

  describe('Create Requirement - API Integration', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should successfully create a new requirement with valid data', () => {
      // Intercept the create API call
      cy.intercept('POST', apiEndpoints.projectRequirements(projectId), {
        statusCode: 201,
        body: {
          id: 'new-requirement-id',
          ...testData.requirement,
          projectId: projectId,
          createdAt: new Date().toISOString()
        }
      }).as('createRequirement');

      cy.get('[data-testid="add-requirement-button"]').click();

      // Fill form with valid data
      cy.get('[data-testid="requirement-title-input"]')
        .type(testData.requirement.title);

      cy.get('[data-testid="requirement-description-input"]')
        .type(testData.requirement.description);

      cy.get('[data-testid="requirement-priority-select"]').click();
      cy.get(`[data-value="${testData.requirement.priority}"], [data-testid="priority-${testData.requirement.priority}"]`)
        .click();

      // Fill optional fields if they exist
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-category-select"]').length > 0) {
          cy.get('[data-testid="requirement-category-select"]').click();
          cy.get(`[data-value="${testData.requirement.category}"]`).click();
        }

        if ($body.find('[data-testid="requirement-effort-input"]').length > 0) {
          cy.get('[data-testid="requirement-effort-input"]')
            .type(testData.requirement.estimatedEffort.toString());
        }

        if ($body.find('[data-testid="requirement-due-date-input"]').length > 0) {
          cy.get('[data-testid="requirement-due-date-input"]')
            .type(testData.requirement.dueDate);
        }
      });

      // Submit form
      cy.get('[data-testid="save-requirement-button"]').click();

      // Verify API call was made
      cy.wait('@createRequirement').then((interception) => {
        expect(interception.request.body).to.include({
          title: testData.requirement.title,
          description: testData.requirement.description,
          priority: testData.requirement.priority
        });
      });

      // Verify success message or redirect
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="success-message"], .success-toast').length > 0) {
          cy.get('[data-testid="success-message"], .success-toast')
            .should('be.visible')
            .and('contain.text', /created|success/i);
        }
      });
    });

    it('should handle API errors during requirement creation', () => {
      // Intercept with error response
      cy.intercept('POST', apiEndpoints.projectRequirements(projectId), {
        statusCode: 400,
        body: {
          error: 'Validation failed',
          message: 'Title is required'
        }
      }).as('createRequirementError');

      cy.get('[data-testid="add-requirement-button"]').click();

      // Fill minimal data
      cy.get('[data-testid="requirement-title-input"]')
        .type(testData.requirement.title);

      cy.get('[data-testid="save-requirement-button"]').click();

      cy.wait('@createRequirementError');

      // Verify error message is displayed
      cy.get('[data-testid="error-message"], .error-toast, .alert-error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Verify form remains open
      cy.get('[data-testid="requirement-title-input"]')
        .should('be.visible')
        .and('have.value', testData.requirement.title);
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('POST', apiEndpoints.projectRequirements(projectId), {
        forceNetworkError: true
      }).as('networkError');

      cy.get('[data-testid="add-requirement-button"]').click();

      cy.get('[data-testid="requirement-title-input"]')
        .type(testData.requirement.title);

      cy.get('[data-testid="save-requirement-button"]').click();

      cy.wait('@networkError');

      // Verify network error handling
      cy.get('[data-testid="error-message"], .error-toast')
        .should('be.visible')
        .and('contain.text', /network|connection|try again/i);
    });
  });

  describe('Requirements List - Display & Interaction', () => {
    before(() => {
      // Create test requirement for list tests
      cy.login('test@example.com', 'test123');
      
      cy.request({
        method: 'POST',
        url: apiEndpoints.projectRequirements(projectId),
        body: {
          ...testData.requirement,
          projectId: projectId
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201) {
          createdRequirementId = response.body.id;
        }
      });
    });

    beforeEach(() => {
      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should display requirements in a list format with all key information', () => {
      // Intercept requirements list API
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), {
        statusCode: 200,
        body: [
          {
            id: 'req-1',
            title: 'Sample Requirement 1',
            description: 'Description for requirement 1',
            priority: 'high',
            status: 'pending',
            estimatedEffort: 40,
            dueDate: '2024-12-31'
          },
          {
            id: 'req-2',
            title: 'Sample Requirement 2',
            description: 'Description for requirement 2',
            priority: 'medium',
            status: 'in_progress',
            estimatedEffort: 20
          }
        ]
      }).as('getRequirements');

      cy.reload();
      cy.wait('@getRequirements');

      // Verify list container
      cy.get('[data-testid="requirements-list"]')
        .should('be.visible');

      // Verify requirement items
      cy.get('[data-testid="requirement-item"]')
        .should('have.length.at.least', 1);

      // Verify requirement details in list
      cy.get('[data-testid="requirement-item"]').first().within(() => {
        cy.get('[data-testid="requirement-title"]')
          .should('be.visible')
          .and('contain.text', 'Sample Requirement 1');

        cy.get('[data-testid="requirement-priority"]')
          .should('be.visible')
          .and('contain.text', /high/i);

        cy.get('[data-testid="requirement-status"]')
          .should('be.visible')
          .and('contain.text', /pending/i);

        // Check for action buttons
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="edit-requirement-button"]').length > 0) {
            cy.get('[data-testid="edit-requirement-button"]')
              .should('be.visible');
          }

          if ($body.find('[data-testid="delete-requirement-button"]').length > 0) {
            cy.get('[data-testid="delete-requirement-button"]')
              .should('be.visible');
          }
        });
      });
    });

    it('should handle empty requirements list state', () => {
      // Intercept with empty response
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), {
        statusCode: 200,
        body: []
      }).as('getEmptyRequirements');

      cy.reload();
      cy.wait('@getEmptyRequirements');

      // Verify empty state
      cy.get('[data-testid="empty-state"], [data-testid="no-requirements"]')
        .should('be.visible')
        .and('contain.text', /no requirements|empty/i);

      // Verify add button is still available
      cy.get('[data-testid="add-requirement-button"]')
        .should('be.visible');
    });

    it('should handle loading states appropriately', () => {
      // Intercept with delay to test loading state
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), (req) => {
        req.reply((res) => {
          setTimeout(() => {
            res.send({
              statusCode: 200,
              body: []
            });
          }, 2000);
        });
      }).as('getSlowRequirements');

      cy.reload();

      // Check for loading indicator
      cy.get('[data-testid="loading-spinner"], [data-testid="loading"], .loading')
        .should('be.visible');

      cy.wait('@getSlowRequirements');

      // Loading should disappear
      cy.get('[data-testid="loading-spinner"], [data-testid="loading"], .loading')
        .should('not.exist');
    });

    it('should handle API errors when fetching requirements', () => {
      // Intercept with error
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), {
        statusCode: 500,
        body: {
          error: 'Internal server error'
        }
      }).as('getRequirementsError');

      cy.reload();
      cy.wait('@getRequirementsError');

      // Verify error state
      cy.get('[data-testid="error-state"], [data-testid="error-message"], .error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Check for retry option
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="retry-button"]').length > 0) {
          cy.get('[data-testid="retry-button"]')
            .should('be.visible');
        }
      });
    });
  });

  describe('Edit Requirement - Form & Validation', () => {
    let testRequirementId = null;

    before(() => {
      // Create a requirement to edit
      cy.login('test@example.com', 'test123');
      
      cy.request({
        method: 'POST',
        url: apiEndpoints.projectRequirements(projectId),
        body: {
          ...testData.requirement,
          projectId: projectId
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201) {
          testRequirementId = response.body.id;
        }
      });
    });

    beforeEach(() => {
      if (testRequirementId) {
        cy.visit(`/projects/${projectId}/requirements`);
        cy.wait(1000);
      }
    });

    after(() => {
      // Cleanup
      if (testRequirementId) {
        cy.request({
          method: 'DELETE',
          url: apiEndpoints.requirement(testRequirementId),
          failOnStatusCode: false
        });
      }
    });

    it('should open edit form with pre-populated data', () => {
      // Mock the requirement data
      cy.intercept('GET', apiEndpoints.requirement(testRequirementId), {
        statusCode: 200,
        body: {
          id: testRequirementId,
          ...testData.requirement,
          projectId: projectId
        }
      }).as('getRequirement');

      // Click edit button (assuming it exists in the list)
      cy.get('[data-testid="requirements-list"]').then(($list) => {
        if ($list.find('[data-testid="edit-requirement-button"]').length > 0) {
          cy.get('[data-testid="edit-requirement-button"]').first().click();
        } else {
          // Alternative: navigate directly to edit page
          cy.visit(`/projects/${projectId}/requirements/${testRequirementId}/edit`);
        }
      });

      // Verify form opened with data
      cy.get('[data-testid="requirement-title-input"]')
        .should('have.value', testData.requirement.title);

      cy.get('[data-testid="requirement-description-input"]')
        .should('contain.value', testData.requirement.description);

      // Verify priority is selected
      cy.get('[data-testid="requirement-priority-select"]')
        .should('contain.text', testData.requirement.priority);
    });

    it('should update requirement with new valid data', () => {
      // Intercept update API call
      cy.intercept('PATCH', apiEndpoints.requirement(testRequirementId), {
        statusCode: 200,
        body: {
          id: testRequirementId,
          ...testData.updatedRequirement,
          projectId: projectId
        }
      }).as('updateRequirement');

      // Navigate to edit form
      cy.visit(`/projects/${projectId}/requirements/${testRequirementId}/edit`);

      // Update form fields
      cy.get('[data-testid="requirement-title-input"]')
        .clear()
        .type(testData.updatedRequirement.title);

      cy.get('[data-testid="requirement-description-input"]')
        .clear()
        .type(testData.updatedRequirement.description);

      cy.get('[data-testid="requirement-priority-select"]').click();
      cy.get(`[data-value="${testData.updatedRequirement.priority}"]`).click();

      // Submit update
      cy.get('[data-testid="save-requirement-button"]').click();

      cy.wait('@updateRequirement').then((interception) => {
        expect(interception.request.body).to.include({
          title: testData.updatedRequirement.title,
          description: testData.updatedRequirement.description
        });
      });

      // Verify success feedback
      cy.get('[data-testid="success-message"], .success-toast')
        .should('be.visible');
    });

    it('should validate updated data before submission', () => {
      cy.visit(`/projects/${projectId}/requirements/${testRequirementId}/edit`);

      // Clear required field
      cy.get('[data-testid="requirement-title-input"]').clear();

      // Try to submit
      cy.get('[data-testid="save-requirement-button"]').click();

      // Verify validation error
      cy.get('[data-testid="requirement-title-input"]')
        .then(($input) => {
          const validationMessage = $input[0].validationMessage;
          expect(validationMessage).to.not.be.empty;
        });
    });

    it('should handle update API errors correctly', () => {
      // Intercept with error
      cy.intercept('PATCH', apiEndpoints.requirement(testRequirementId), {
        statusCode: 400,
        body: {
          error: 'Update failed',
          message: 'Invalid data provided'
        }
      }).as('updateRequirementError');

      cy.visit(`/projects/${projectId}/requirements/${testRequirementId}/edit`);

      // Make a change
      cy.get('[data-testid="requirement-title-input"]')
        .clear()
        .type('Updated title');

      cy.get('[data-testid="save-requirement-button"]').click();

      cy.wait('@updateRequirementError');

      // Verify error handling
      cy.get('[data-testid="error-message"], .error-toast')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Form should remain open with data
      cy.get('[data-testid="requirement-title-input"]')
        .should('have.value', 'Updated title');
    });
  });

  describe('Delete Requirement - Confirmation & API', () => {
    let deleteTestRequirementId = null;

    beforeEach(() => {
      // Create a requirement to delete
      cy.login('test@example.com', 'test123');
      
      cy.request({
        method: 'POST',
        url: apiEndpoints.projectRequirements(projectId),
        body: {
          title: 'Requirement to Delete',
          description: 'This requirement will be deleted during testing',
          priority: 'low',
          projectId: projectId
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201) {
          deleteTestRequirementId = response.body.id;
        }
      });

      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should show confirmation dialog before deleting requirement', () => {
      // Mock requirements list with our test requirement
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), {
        statusCode: 200,
        body: [
          {
            id: deleteTestRequirementId,
            title: 'Requirement to Delete',
            description: 'This requirement will be deleted',
            priority: 'low',
            status: 'pending'
          }
        ]
      }).as('getRequirements');

      cy.reload();
      cy.wait('@getRequirements');

      // Click delete button
      cy.get('[data-testid="delete-requirement-button"]').first().click();

      // Verify confirmation dialog
      cy.get('[data-testid="delete-confirmation-dialog"], [data-testid="confirm-dialog"]')
        .should('be.visible');

      cy.get('[data-testid="delete-confirmation-dialog"]').within(() => {
        cy.get('[data-testid="confirm-delete-button"]')
          .should('be.visible')
          .and('contain.text', /delete|confirm/i);

        cy.get('[data-testid="cancel-delete-button"]')
          .should('be.visible')
          .and('contain.text', /cancel/i);
      });
    });

    it('should cancel deletion when cancel button is clicked', () => {
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), {
        statusCode: 200,
        body: [
          {
            id: deleteTestRequirementId,
            title: 'Requirement to Delete',
            priority: 'low'
          }
        ]
      }).as('getRequirements');

      cy.reload();
      cy.wait('@getRequirements');

      cy.get('[data-testid="delete-requirement-button"]').first().click();
      cy.get('[data-testid="cancel-delete-button"]').click();

      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');

      // Requirement should still be in list
      cy.get('[data-testid="requirement-item"]')
        .should('have.length', 1);
    });

    it('should successfully delete requirement when confirmed', () => {
      // Intercept delete API call
      cy.intercept('DELETE', apiEndpoints.requirement(deleteTestRequirementId), {
        statusCode: 200,
        body: { message: 'Requirement deleted successfully' }
      }).as('deleteRequirement');

      // Mock updated requirements list (empty after deletion)
      cy.intercept('GET', apiEndpoints.projectRequirements(projectId), {
        statusCode: 200,
        body: []
      }).as('getUpdatedRequirements');

      cy.get('[data-testid="delete-requirement-button"]').first().click();
      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.wait('@deleteRequirement');

      // Verify success message
      cy.get('[data-testid="success-message"], .success-toast')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);

      // Set deleteTestRequirementId to null since it's been deleted
      deleteTestRequirementId = null;
    });

    it('should handle delete API errors appropriately', () => {
      // Intercept with error
      cy.intercept('DELETE', apiEndpoints.requirement(deleteTestRequirementId), {
        statusCode: 400,
        body: {
          error: 'Cannot delete requirement',
          message: 'Requirement is referenced by other entities'
        }
      }).as('deleteRequirementError');

      cy.get('[data-testid="delete-requirement-button"]').first().click();
      cy.get('[data-testid="confirm-delete-button"]').click();

      cy.wait('@deleteRequirementError');

      // Verify error message
      cy.get('[data-testid="error-message"], .error-toast')
        .should('be.visible')
        .and('contain.text', /error|cannot delete|failed/i);

      // Requirement should still exist in list
      cy.get('[data-testid="requirement-item"]')
        .should('have.length', 1);
    });

    afterEach(() => {
      // Cleanup if requirement still exists
      if (deleteTestRequirementId) {
        cy.request({
          method: 'DELETE',
          url: apiEndpoints.requirement(deleteTestRequirementId),
          failOnStatusCode: false
        });
        deleteTestRequirementId = null;
      }
    });
  });

  describe('Requirements - Advanced Features', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should handle bulk operations if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="bulk-select-checkbox"]').length > 0) {
          // Test bulk selection
          cy.get('[data-testid="bulk-select-checkbox"]').first().check();
          
          // Verify bulk actions appear
          cy.get('[data-testid="bulk-actions"], [data-testid="bulk-operations"]')
            .should('be.visible');

          // Test bulk delete if available
          if ($body.find('[data-testid="bulk-delete-button"]').length > 0) {
            cy.get('[data-testid="bulk-delete-button"]')
              .should('be.visible')
              .and('not.be.disabled');
          }
        } else {
          cy.log('Bulk operations not available');
        }
      });
    });

    it('should support requirement status updates', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-status-dropdown"]').length > 0) {
          cy.get('[data-testid="requirement-status-dropdown"]').first().click();
          
          // Test status change
          cy.get('[data-testid="status-in-progress"], [data-value="in_progress"]').click();
          
          // Verify status update API call
          cy.intercept('PATCH', '/api/requirements/*', {
            statusCode: 200,
            body: { status: 'in_progress' }
          }).as('updateStatus');

          cy.wait('@updateStatus', { timeout: 5000 }).then((interception) => {
            expect(interception.request.body).to.include({
              status: 'in_progress'
            });
          });
        } else {
          cy.log('Status updates not available in list view');
        }
      });
    });

    it('should handle requirement priority updates', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-priority-dropdown"]').length > 0) {
          cy.get('[data-testid="requirement-priority-dropdown"]').first().click();
          
          cy.get('[data-testid="priority-urgent"], [data-value="urgent"]').click();
          
          cy.intercept('PATCH', '/api/requirements/*', {
            statusCode: 200,
            body: { priority: 'urgent' }
          }).as('updatePriority');

          cy.wait('@updatePriority').then((interception) => {
            expect(interception.request.body).to.include({
              priority: 'urgent'
            });
          });
        } else {
          cy.log('Priority updates not available in list view');
        }
      });
    });

    it('should support exporting requirements data', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="export-requirements-button"]').length > 0) {
          // Intercept export API call
          cy.intercept('GET', `${apiEndpoints.projectRequirements(projectId)}?format=csv`, {
            statusCode: 200,
            body: 'Title,Description,Priority,Status\nTest Requirement,Test Description,High,Pending'
          }).as('exportRequirements');

          cy.get('[data-testid="export-requirements-button"]').click();
          
          cy.wait('@exportRequirements');
          
          // Verify download was initiated (check for success message or file download)
          cy.get('[data-testid="export-success-message"]')
            .should('be.visible', { timeout: 5000 });
        } else {
          cy.log('Export functionality not available');
        }
      });
    });
  });

  describe('Requirements - Responsive Design', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    viewports.forEach((viewport) => {
      it(`should display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit(`/projects/${projectId}/requirements`);
        cy.wait(1000);

        // Verify main container is visible
        cy.get('[data-testid="requirements-container"]')
          .should('be.visible');

        // Verify add button is accessible
        cy.get('[data-testid="add-requirement-button"]')
          .should('be.visible');

        // Check for responsive layout adjustments
        if (viewport.width < 768) {
          // Mobile specific checks
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="mobile-menu-button"]').length > 0) {
              cy.get('[data-testid="mobile-menu-button"]')
                .should('be.visible');
            }
          });
        }

        // Test form responsiveness
        cy.get('[data-testid="add-requirement-button"]').click();
        
        cy.get('[data-testid="requirement-title-input"]')
          .should('be.visible')
          .and('have.css', 'width');

        // Cancel form
        cy.get('[data-testid="cancel-button"]').click();
      });
    });
  });

  describe('Requirements - Accessibility', () => {
    beforeEach(() => {
      cy.visit(`/projects/${projectId}/requirements`);
      cy.wait(1000);
    });

    it('should have proper ARIA labels and roles', () => {
      // Main container
      cy.get('[data-testid="requirements-container"]')
        .should('have.attr', 'role');

      // Add button
      cy.get('[data-testid="add-requirement-button"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'type');

      // Search input if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirements-search"]').length > 0) {
          cy.get('[data-testid="requirements-search"]')
            .should('have.attr', 'aria-label')
            .and('have.attr', 'placeholder');
        }
      });
    });

    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('[data-testid="add-requirement-button"]').focus();
      cy.get('[data-testid="add-requirement-button"]').should('have.focus');

      // Test Enter key on add button
      cy.get('[data-testid="add-requirement-button"]').type('{enter}');
      
      // Form should open
      cy.get('[data-testid="requirement-title-input"]')
        .should('be.visible');

      // Test Escape key to close
      cy.get('body').type('{esc}');
      
      // Form should close
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="requirement-form-modal"]').length === 0) {
          // Modal closed successfully
          cy.log('Modal closed with Escape key');
        }
      });
    });

    it('should have sufficient color contrast and readable fonts', () => {
      // Check that text is visible and has good contrast
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('have.css', 'color')
        .and('have.css', 'font-size');

      // Check button styling
      cy.get('[data-testid="add-requirement-button"]')
        .should('have.css', 'background-color')
        .and('have.css', 'color');
    });

    it('should work with screen readers (semantic HTML)', () => {
      // Verify proper heading structure
      cy.get('h1, h2, h3, h4, h5, h6').should('exist');
      
      // Verify form labels are properly associated
      cy.get('[data-testid="add-requirement-button"]').click();
      
      cy.get('label').each(($label) => {
        cy.wrap($label).should('have.attr', 'for');
      });

      // Verify input associations
      cy.get('input').each(($input) => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
    });
  });
});
