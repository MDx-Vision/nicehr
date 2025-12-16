describe('Requirements Management - Exhaustive Tests', () => {
  const testData = {
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    requirement: {
      title: 'Test Requirement Title',
      description: 'This is a test requirement description for validation purposes.',
      priority: 'high',
      type: 'functional',
      status: 'pending',
      category: 'system',
      acceptanceCriteria: 'The system should perform the specified function correctly.',
      estimatedEffort: 40,
      assignedTo: 'ci-test-consultant',
      dueDate: '2024-12-31',
      tags: ['test', 'validation'],
      businessValue: 'high',
      complexity: 'medium',
      dependencies: 'None specified',
      testCases: 'Test case 1: Verify functionality\nTest case 2: Validate edge cases'
    },
    invalidData: {
      emptyTitle: '',
      longTitle: 'A'.repeat(501),
      invalidPriority: 'invalid-priority',
      invalidType: 'invalid-type',
      negativeEffort: -5,
      pastDueDate: '2020-01-01',
      maliciousScript: '<script>alert("xss")</script>',
      specialChars: '!@#$%^&*()[]{}|;:,.<>?'
    }
  };

  const apiEndpoints = {
    projects: '/api/projects',
    requirements: (projectId) => `/api/projects/${projectId}/requirements`,
    requirement: (id) => `/api/requirements/${id}`,
    consultants: '/api/consultants'
  };

  beforeEach(() => {
    // Login as admin user
    cy.loginAs('admin');
    
    // Set up common API interceptors
    cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
      fixture: 'requirements.json'
    }).as('getRequirements');
    
    cy.intercept('POST', apiEndpoints.requirements(testData.project.id), {
      statusCode: 201,
      body: { 
        id: 'req-123',
        ...testData.requirement,
        createdAt: new Date().toISOString()
      }
    }).as('createRequirement');
    
    cy.intercept('PUT', '/api/requirements/*', {
      statusCode: 200,
      body: { success: true }
    }).as('updateRequirement');
    
    cy.intercept('DELETE', '/api/requirements/*', {
      statusCode: 204
    }).as('deleteRequirement');

    cy.intercept('GET', apiEndpoints.consultants, {
      fixture: 'consultants.json'
    }).as('getConsultants');
  });

  describe('Requirements List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should display complete requirements page layout', () => {
      // Page header
      cy.get('[data-testid="requirements-header"]', { timeout: 10000 })
        .should('be.visible');
      
      // Page title
      cy.get('[data-testid="page-title"]')
        .should('contain.text', 'Requirements')
        .and('be.visible');
      
      // Create button
      cy.get('[data-testid="create-requirement-btn"]')
        .should('be.visible')
        .and('contain.text', 'New Requirement');
      
      // Search and filter section
      cy.get('[data-testid="requirements-search"]').should('be.visible');
      cy.get('[data-testid="requirements-filters"]').should('be.visible');
      
      // Requirements table/list
      cy.get('[data-testid="requirements-table"]').should('be.visible');
      
      // Table headers
      const expectedHeaders = ['Title', 'Priority', 'Status', 'Type', 'Assigned To', 'Due Date', 'Actions'];
      expectedHeaders.forEach(header => {
        cy.get('[data-testid="requirements-table"]')
          .find('th')
          .should('contain.text', header);
      });
    });

    it('should have proper table structure and accessibility', () => {
      // Table structure
      cy.get('[data-testid="requirements-table"]')
        .should('have.attr', 'role', 'table')
        .find('thead')
        .should('exist');
      
      // Column sorting
      cy.get('[data-testid="requirements-table"] th[data-sortable="true"]')
        .should('have.length.at.least', 1)
        .each(($header) => {
          cy.wrap($header)
            .should('have.attr', 'aria-sort')
            .and('have.css', 'cursor', 'pointer');
        });
      
      // Row accessibility
      cy.get('[data-testid="requirements-table"] tbody tr')
        .first()
        .should('have.attr', 'role', 'row')
        .find('td')
        .should('have.attr', 'role', 'cell');
    });

    it('should display empty state when no requirements exist', () => {
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        statusCode: 200,
        body: []
      }).as('getEmptyRequirements');
      
      cy.reload();
      cy.wait('@getEmptyRequirements');
      
      // Empty state
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', 'No requirements found');
      
      cy.get('[data-testid="empty-state-action"]')
        .should('be.visible')
        .and('contain.text', 'Create your first requirement');
    });

    it('should handle loading states properly', () => {
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        delay: 2000,
        fixture: 'requirements.json'
      }).as('getSlowRequirements');
      
      cy.reload();
      
      // Loading state
      cy.get('[data-testid="requirements-loading"]')
        .should('be.visible')
        .and('contain.text', 'Loading requirements...');
      
      cy.wait('@getSlowRequirements');
      
      // Content loaded
      cy.get('[data-testid="requirements-loading"]').should('not.exist');
      cy.get('[data-testid="requirements-table"]').should('be.visible');
    });
  });

  describe('Requirements Search and Filtering', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should perform real-time search functionality', () => {
      const searchTerm = 'user authentication';
      
      cy.get('[data-testid="requirements-search-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder')
        .type(searchTerm);
      
      // API call should be made
      cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?search=${searchTerm}`, {
        fixture: 'filtered-requirements.json'
      }).as('searchRequirements');
      
      cy.wait('@searchRequirements');
      
      // Results should update
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('have.length.at.least', 1)
        .each(($row) => {
          cy.wrap($row)
            .find('[data-testid="requirement-title"]')
            .should('contain.text', searchTerm);
        });
    });

    it('should handle search with no results', () => {
      const searchTerm = 'nonexistentterm12345';
      
      cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?search=${searchTerm}`, {
        statusCode: 200,
        body: []
      }).as('searchNoResults');
      
      cy.get('[data-testid="requirements-search-input"]')
        .type(searchTerm);
      
      cy.wait('@searchNoResults');
      
      cy.get('[data-testid="no-search-results"]')
        .should('be.visible')
        .and('contain.text', 'No requirements found matching your search');
      
      // Clear search
      cy.get('[data-testid="clear-search-btn"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-testid="requirements-search-input"]')
        .should('have.value', '');
    });

    it('should filter by priority levels', () => {
      const priorities = ['high', 'medium', 'low'];
      
      priorities.forEach(priority => {
        cy.get('[data-testid="priority-filter"]')
          .select(priority);
        
        cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?priority=${priority}`, {
          fixture: `requirements-${priority}-priority.json`
        }).as(`filter${priority.charAt(0).toUpperCase() + priority.slice(1)}Priority`);
        
        cy.wait(`@filter${priority.charAt(0).toUpperCase() + priority.slice(1)}Priority`);
        
        // Verify filtered results
        cy.get('[data-testid="requirements-table"] tbody tr')
          .each(($row) => {
            cy.wrap($row)
              .find('[data-testid="requirement-priority"]')
              .should('contain.text', priority);
          });
      });
    });

    it('should filter by status', () => {
      const statuses = ['pending', 'in_progress', 'completed', 'blocked'];
      
      statuses.forEach(status => {
        cy.get('[data-testid="status-filter"]')
          .select(status);
        
        cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?status=${status}`, {
          fixture: `requirements-${status}-status.json`
        }).as(`filter${status}Status`);
        
        cy.wait(`@filter${status}Status`);
        
        cy.get('[data-testid="requirements-table"] tbody tr')
          .each(($row) => {
            cy.wrap($row)
              .find('[data-testid="requirement-status"]')
              .should('contain.text', status.replace('_', ' '));
          });
      });
    });

    it('should filter by requirement type', () => {
      const types = ['functional', 'non_functional', 'technical', 'business'];
      
      types.forEach(type => {
        cy.get('[data-testid="type-filter"]')
          .select(type);
        
        cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?type=${type}`, {
          fixture: `requirements-${type}-type.json`
        }).as(`filter${type}Type`);
        
        cy.wait(`@filter${type}Type`);
        
        cy.get('[data-testid="requirements-table"] tbody tr')
          .each(($row) => {
            cy.wrap($row)
              .find('[data-testid="requirement-type"]')
              .should('contain.text', type.replace('_', ' '));
          });
      });
    });

    it('should filter by assigned consultant', () => {
      cy.get('[data-testid="assignee-filter"]')
        .select('ci-test-consultant');
      
      cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?assignedTo=ci-test-consultant`, {
        fixture: 'requirements-assigned.json'
      }).as('filterAssigned');
      
      cy.wait('@filterAssigned');
      
      cy.get('[data-testid="requirements-table"] tbody tr')
        .each(($row) => {
          cy.wrap($row)
            .find('[data-testid="requirement-assignee"]')
            .should('contain.text', 'ci-test-consultant');
        });
    });

    it('should combine multiple filters', () => {
      cy.get('[data-testid="priority-filter"]').select('high');
      cy.get('[data-testid="status-filter"]').select('in_progress');
      cy.get('[data-testid="type-filter"]').select('functional');
      
      cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?priority=high&status=in_progress&type=functional`, {
        fixture: 'requirements-combined-filters.json'
      }).as('combinedFilters');
      
      cy.wait('@combinedFilters');
      
      // Verify combined filtering worked
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('have.length.at.least', 1);
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get('[data-testid="priority-filter"]').select('high');
      cy.get('[data-testid="status-filter"]').select('completed');
      cy.get('[data-testid="requirements-search-input"]').type('test search');
      
      // Clear all filters
      cy.get('[data-testid="clear-filters-btn"]')
        .should('be.visible')
        .click();
      
      // Verify filters are cleared
      cy.get('[data-testid="priority-filter"]')
        .should('have.value', '');
      cy.get('[data-testid="status-filter"]')
        .should('have.value', '');
      cy.get('[data-testid="requirements-search-input"]')
        .should('have.value', '');
      
      // Should reload all requirements
      cy.wait('@getRequirements');
    });
  });

  describe('Requirements Sorting and Pagination', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should sort by each sortable column', () => {
      const sortableColumns = [
        { testId: 'sort-title', field: 'title' },
        { testId: 'sort-priority', field: 'priority' },
        { testId: 'sort-status', field: 'status' },
        { testId: 'sort-dueDate', field: 'dueDate' },
        { testId: 'sort-createdAt', field: 'createdAt' }
      ];

      sortableColumns.forEach(column => {
        // Sort ascending
        cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?sortBy=${column.field}&sortOrder=asc`, {
          fixture: `requirements-sorted-${column.field}-asc.json`
        }).as(`sort${column.field}Asc`);
        
        cy.get(`[data-testid="${column.testId}"]`).click();
        cy.wait(`@sort${column.field}Asc`);
        
        cy.get(`[data-testid="${column.testId}"]`)
          .should('have.attr', 'aria-sort', 'ascending');
        
        // Sort descending
        cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?sortBy=${column.field}&sortOrder=desc`, {
          fixture: `requirements-sorted-${column.field}-desc.json`
        }).as(`sort${column.field}Desc`);
        
        cy.get(`[data-testid="${column.testId}"]`).click();
        cy.wait(`@sort${column.field}Desc`);
        
        cy.get(`[data-testid="${column.testId}"]`)
          .should('have.attr', 'aria-sort', 'descending');
      });
    });

    it('should handle pagination navigation', () => {
      // Mock paginated response
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        statusCode: 200,
        body: {
          requirements: Array.from({ length: 25 }, (_, i) => ({
            id: `req-${i}`,
            title: `Requirement ${i}`,
            priority: 'medium',
            status: 'pending'
          })),
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            pages: 3
          }
        }
      }).as('getPaginatedRequirements');
      
      cy.reload();
      cy.wait('@getPaginatedRequirements');
      
      // Pagination controls should be visible
      cy.get('[data-testid="pagination-controls"]').should('be.visible');
      cy.get('[data-testid="page-info"]')
        .should('contain.text', 'Page 1 of 3');
      
      // Next page
      cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?page=2&limit=10`, {
        fixture: 'requirements-page-2.json'
      }).as('getPage2');
      
      cy.get('[data-testid="next-page-btn"]')
        .should('not.be.disabled')
        .click();
      
      cy.wait('@getPage2');
      cy.get('[data-testid="page-info"]')
        .should('contain.text', 'Page 2 of 3');
      
      // Previous page
      cy.get('[data-testid="prev-page-btn"]')
        .should('not.be.disabled')
        .click();
      
      cy.wait('@getPaginatedRequirements');
      cy.get('[data-testid="page-info"]')
        .should('contain.text', 'Page 1 of 3');
      
      // First page button should be disabled
      cy.get('[data-testid="prev-page-btn"]')
        .should('be.disabled');
    });

    it('should change items per page', () => {
      const itemsPerPage = [10, 25, 50];
      
      itemsPerPage.forEach(limit => {
        cy.intercept('GET', `${apiEndpoints.requirements(testData.project.id)}?page=1&limit=${limit}`, {
          fixture: `requirements-limit-${limit}.json`
        }).as(`getLimit${limit}`);
        
        cy.get('[data-testid="items-per-page"]')
          .select(limit.toString());
        
        cy.wait(`@getLimit${limit}`);
        
        cy.get('[data-testid="requirements-table"] tbody tr')
          .should('have.length.at.most', limit);
      });
    });
  });

  describe('Create Requirement - Form Functionality', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
      
      // Open create form
      cy.get('[data-testid="create-requirement-btn"]').click();
    });

    it('should display complete create requirement form', () => {
      cy.get('[data-testid="requirement-form"]', { timeout: 10000 })
        .should('be.visible');
      
      // Form title
      cy.get('[data-testid="form-title"]')
        .should('contain.text', 'Create New Requirement');
      
      // Required fields
      cy.get('[data-testid="input-title"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="textarea-description"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="select-priority"]')
        .should('be.visible');
      
      cy.get('[data-testid="select-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="select-status"]')
        .should('be.visible');
      
      // Optional fields
      cy.get('[data-testid="textarea-acceptance-criteria"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-estimated-effort"]')
        .should('be.visible')
        .and('have.attr', 'type', 'number');
      
      cy.get('[data-testid="select-assigned-to"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-due-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
      
      // Form actions
      cy.get('[data-testid="btn-submit"]')
        .should('be.visible')
        .and('contain.text', 'Create Requirement');
      
      cy.get('[data-testid="btn-cancel"]')
        .should('be.visible')
        .and('contain.text', 'Cancel');
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="btn-submit"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', 'Title is required');
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', 'Description is required');
      
      // Form should not be submitted
      cy.get('@createRequirement').should('not.have.been.called');
    });

    it('should validate field length limits', () => {
      // Test title length limit
      cy.get('[data-testid="input-title"]')
        .type(testData.invalidData.longTitle);
      
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('contain.text', 'Title must be less than 500 characters');
      
      // Test description length
      cy.get('[data-testid="textarea-description"]')
        .type('A'.repeat(5001));
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', 'Description must be less than 5000 characters');
    });

    it('should validate estimated effort field', () => {
      cy.get('[data-testid="input-estimated-effort"]')
        .type(testData.invalidData.negativeEffort.toString());
      
      cy.get('[data-testid="error-estimated-effort"]')
        .should('be.visible')
        .and('contain.text', 'Estimated effort must be a positive number');
      
      // Test maximum value
      cy.get('[data-testid="input-estimated-effort"]')
        .clear()
        .type('10000');
      
      cy.get('[data-testid="error-estimated-effort"]')
        .should('be.visible')
        .and('contain.text', 'Estimated effort cannot exceed 1000 hours');
    });

    it('should validate due date field', () => {
      cy.get('[data-testid="input-due-date"]')
        .type(testData.invalidData.pastDueDate);
      
      cy.get('[data-testid="error-due-date"]')
        .should('be.visible')
        .and('contain.text', 'Due date cannot be in the past');
    });

    it('should successfully create a requirement with valid data', () => {
      // Fill out all required fields
      cy.get('[data-testid="input-title"]')
        .type(testData.requirement.title);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.requirement.description);
      
      cy.get('[data-testid="select-priority"]')
        .select(testData.requirement.priority);
      
      cy.get('[data-testid="select-type"]')
        .select(testData.requirement.type);
      
      cy.get('[data-testid="select-status"]')
        .select(testData.requirement.status);
      
      // Fill optional fields
      cy.get('[data-testid="textarea-acceptance-criteria"]')
        .type(testData.requirement.acceptanceCriteria);
      
      cy.get('[data-testid="input-estimated-effort"]')
        .type(testData.requirement.estimatedEffort.toString());
      
      cy.get('[data-testid="select-assigned-to"]')
        .select(testData.requirement.assignedTo);
      
      cy.get('[data-testid="input-due-date"]')
        .type(testData.requirement.dueDate);
      
      // Submit form
      cy.get('[data-testid="btn-submit"]').click();
      
      // Wait for API call
      cy.wait('@createRequirement');
      
      // Should redirect to requirements list
      cy.url().should('include', `/projects/${testData.project.id}/requirements`);
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Requirement created successfully');
    });

    it('should handle form submission errors', () => {
      // Mock API error
      cy.intercept('POST', apiEndpoints.requirements(testData.project.id), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createRequirementError');
      
      // Fill required fields
      cy.get('[data-testid="input-title"]')
        .type(testData.requirement.title);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.requirement.description);
      
      cy.get('[data-testid="select-priority"]')
        .select(testData.requirement.priority);
      
      // Submit form
      cy.get('[data-testid="btn-submit"]').click();
      
      cy.wait('@createRequirementError');
      
      // Should show error notification
      cy.get('[data-testid="error-notification"]')
        .should('be.visible')
        .and('contain.text', 'Failed to create requirement');
      
      // Form should remain open
      cy.get('[data-testid="requirement-form"]')
        .should('be.visible');
    });

    it('should cancel form and return to list', () => {
      // Fill some data
      cy.get('[data-testid="input-title"]')
        .type('Some test title');
      
      // Cancel form
      cy.get('[data-testid="btn-cancel"]').click();
      
      // Should show confirmation dialog
      cy.get('[data-testid="confirm-cancel-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-cancel-btn"]').click();
      
      // Should return to requirements list
      cy.url().should('include', `/projects/${testData.project.id}/requirements`);
      
      // API call should not have been made
      cy.get('@createRequirement').should('not.have.been.called');
    });

    it('should handle XSS prevention in form fields', () => {
      cy.get('[data-testid="input-title"]')
        .type(testData.invalidData.maliciousScript);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.invalidData.maliciousScript);
      
      cy.get('[data-testid="select-priority"]')
        .select('high');
      
      cy.get('[data-testid="btn-submit"]').click();
      
      cy.wait('@createRequirement').then((interception) => {
        // Verify that script tags are escaped or removed
        expect(interception.request.body.title).to.not.include('<script>');
        expect(interception.request.body.description).to.not.include('<script>');
      });
    });
  });

  describe('View and Edit Requirement Details', () => {
    const requirementId = 'req-123';
    
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.requirement(requirementId), {
        fixture: 'requirement-details.json'
      }).as('getRequirementDetails');
      
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should display requirement details modal', () => {
      // Click on requirement row
      cy.get('[data-testid="requirement-row-req-123"]').click();
      
      cy.wait('@getRequirementDetails');
      
      // Modal should open
      cy.get('[data-testid="requirement-details-modal"]')
        .should('be.visible');
      
      // Details should be displayed
      cy.get('[data-testid="requirement-title"]')
        .should('contain.text', testData.requirement.title);
      
      cy.get('[data-testid="requirement-description"]')
        .should('contain.text', testData.requirement.description);
      
      cy.get('[data-testid="requirement-priority"]')
        .should('contain.text', testData.requirement.priority);
      
      cy.get('[data-testid="requirement-status"]')
        .should('contain.text', testData.requirement.status);
      
      cy.get('[data-testid="requirement-type"]')
        .should('contain.text', testData.requirement.type);
      
      // Action buttons
      cy.get('[data-testid="btn-edit-requirement"]')
        .should('be.visible');
      
      cy.get('[data-testid="btn-delete-requirement"]')
        .should('be.visible');
      
      cy.get('[data-testid="btn-close-modal"]')
        .should('be.visible');
    });

    it('should edit requirement inline', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetails');
      
      // Enter edit mode
      cy.get('[data-testid="btn-edit-requirement"]').click();
      
      // Form fields should become editable
      cy.get('[data-testid="edit-input-title"]')
        .should('be.visible')
        .and('have.value', testData.requirement.title)
        .clear()
        .type('Updated Requirement Title');
      
      cy.get('[data-testid="edit-textarea-description"]')
        .clear()
        .type('Updated description for the requirement');
      
      cy.get('[data-testid="edit-select-priority"]')
        .select('low');
      
      // Save changes
      cy.get('[data-testid="btn-save-requirement"]').click();
      
      cy.wait('@updateRequirement');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Requirement updated successfully');
      
      // Modal should close and list should refresh
      cy.get('[data-testid="requirement-details-modal"]')
        .should('not.exist');
      
      cy.wait('@getRequirements');
    });

    it('should validate edit form fields', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetails');
      
      cy.get('[data-testid="btn-edit-requirement"]').click();
      
      // Clear required field
      cy.get('[data-testid="edit-input-title"]')
        .clear();
      
      // Try to save
      cy.get('[data-testid="btn-save-requirement"]').click();
      
      // Should show validation error
      cy.get('[data-testid="edit-error-title"]')
        .should('be.visible')
        .and('contain.text', 'Title is required');
      
      // API should not be called
      cy.get('@updateRequirement').should('not.have.been.called');
    });

    it('should cancel editing and revert changes', () => {
      cy.get('[data-testid="requirement-row-req-123"]').click();
      cy.wait('@getRequirementDetails');
      
      cy.get('[data-testid="btn-edit-requirement"]').click();
      
      // Make changes
      cy.get('[data-testid="edit-input-title"]')
        .clear()
        .type('Changed title');
      
      // Cancel editing
      cy.get('[data-testid="btn-cancel-edit"]').click();
      
      // Changes should be reverted
      cy.get('[data-testid="requirement-title"]')
        .should('contain.text', testData.requirement.title);
      
      // Should not be in edit mode
      cy.get('[data-testid="edit-input-title"]')
        .should('not.exist');
    });
  });

  describe('Delete Requirements', () => {
    const requirementId = 'req-123';
    
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should delete single requirement with confirmation', () => {
      // Click delete button on requirement row
      cy.get(`[data-testid="delete-requirement-${requirementId}"]`).click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="delete-confirmation-text"]')
        .should('contain.text', 'Are you sure you want to delete this requirement?');
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete-btn"]').click();
      
      cy.wait('@deleteRequirement');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Requirement deleted successfully');
      
      // List should refresh
      cy.wait('@getRequirements');
    });

    it('should cancel requirement deletion', () => {
      cy.get(`[data-testid="delete-requirement-${requirementId}"]`).click();
      
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('be.visible');
      
      // Cancel deletion
      cy.get('[data-testid="cancel-delete-btn"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');
      
      // API should not be called
      cy.get('@deleteRequirement').should('not.have.been.called');
      
      // Requirement should still be in list
      cy.get(`[data-testid="requirement-row-${requirementId}"]`)
        .should('exist');
    });

    it('should handle delete errors gracefully', () => {
      // Mock API error
      cy.intercept('DELETE', apiEndpoints.requirement(requirementId), {
        statusCode: 500,
        body: { error: 'Failed to delete requirement' }
      }).as('deleteRequirementError');
      
      cy.get(`[data-testid="delete-requirement-${requirementId}"]`).click();
      cy.get('[data-testid="confirm-delete-btn"]').click();
      
      cy.wait('@deleteRequirementError');
      
      // Error notification
      cy.get('[data-testid="error-notification"]')
        .should('be.visible')
        .and('contain.text', 'Failed to delete requirement');
      
      // Requirement should still be in list
      cy.get(`[data-testid="requirement-row-${requirementId}"]`)
        .should('exist');
    });

    it('should bulk delete multiple requirements', () => {
      // Select multiple requirements
      cy.get('[data-testid="select-requirement-req-123"]').check();
      cy.get('[data-testid="select-requirement-req-456"]').check();
      
      // Bulk actions should become available
      cy.get('[data-testid="bulk-actions-bar"]')
        .should('be.visible');
      
      cy.get('[data-testid="selected-count"]')
        .should('contain.text', '2 items selected');
      
      // Delete selected
      cy.get('[data-testid="bulk-delete-btn"]').click();
      
      // Confirmation dialog
      cy.get('[data-testid="bulk-delete-confirmation-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="bulk-delete-confirmation-text"]')
        .should('contain.text', 'Are you sure you want to delete 2 requirements?');
      
      // Mock bulk delete API
      cy.intercept('POST', '/api/requirements/bulk-delete', {
        statusCode: 200,
        body: { deleted: 2 }
      }).as('bulkDeleteRequirements');
      
      cy.get('[data-testid="confirm-bulk-delete-btn"]').click();
      
      cy.wait('@bulkDeleteRequirements');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', '2 requirements deleted successfully');
      
      // Selection should be cleared
      cy.get('[data-testid="bulk-actions-bar"]')
        .should('not.exist');
    });
  });

  describe('Requirements Status Management', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should update requirement status from dropdown', () => {
      const requirementId = 'req-123';
      const newStatus = 'in_progress';
      
      cy.intercept('PATCH', apiEndpoints.requirement(requirementId), {
        statusCode: 200,
        body: { success: true }
      }).as('updateStatus');
      
      // Click status dropdown
      cy.get(`[data-testid="status-dropdown-${requirementId}"]`).click();
      
      // Select new status
      cy.get(`[data-testid="status-option-${newStatus}"]`).click();
      
      cy.wait('@updateStatus');
      
      // Status should be updated in UI
      cy.get(`[data-testid="requirement-status-${requirementId}"]`)
        .should('contain.text', 'In Progress');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Status updated successfully');
    });

    it('should track status change history', () => {
      const requirementId = 'req-123';
      
      cy.get(`[data-testid="requirement-row-${requirementId}"]`).click();
      
      cy.intercept('GET', `/api/requirements/${requirementId}/history`, {
        fixture: 'requirement-history.json'
      }).as('getRequirementHistory');
      
      // View history tab
      cy.get('[data-testid="requirement-history-tab"]').click();
      
      cy.wait('@getRequirementHistory');
      
      // History should be displayed
      cy.get('[data-testid="requirement-history"]')
        .should('be.visible');
      
      cy.get('[data-testid="history-item"]')
        .should('have.length.at.least', 1)
        .first()
        .should('contain.text', 'Status changed from');
    });

    it('should bulk update statuses', () => {
      // Select multiple requirements
      cy.get('[data-testid="select-requirement-req-123"]').check();
      cy.get('[data-testid="select-requirement-req-456"]').check();
      
      // Bulk status update
      cy.get('[data-testid="bulk-status-update"]').click();
      
      // Status selection dialog
      cy.get('[data-testid="bulk-status-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="bulk-status-select"]')
        .select('completed');
      
      // Mock bulk update API
      cy.intercept('PATCH', '/api/requirements/bulk-status', {
        statusCode: 200,
        body: { updated: 2 }
      }).as('bulkUpdateStatus');
      
      cy.get('[data-testid="apply-bulk-status-btn"]').click();
      
      cy.wait('@bulkUpdateStatus');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', '2 requirements updated successfully');
    });
  });

  describe('Requirements Import/Export', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should export requirements to CSV', () => {
      cy.get('[data-testid="export-requirements-btn"]').click();
      
      cy.get('[data-testid="export-format-select"]')
        .select('csv');
      
      cy.intercept('GET', `/api/projects/${testData.project.id}/requirements/export?format=csv`, {
        fixture: 'requirements-export.csv'
      }).as('exportCSV');
      
      cy.get('[data-testid="start-export-btn"]').click();
      
      cy.wait('@exportCSV');
      
      // Download should start
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Export completed successfully');
    });

    it('should import requirements from CSV', () => {
      cy.get('[data-testid="import-requirements-btn"]').click();
      
      // File upload dialog
      cy.get('[data-testid="import-dialog"]')
        .should('be.visible');
      
      // Upload file
      const fileName = 'requirements-import.csv';
      cy.fixture(fileName).then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').attachFile({
          fileContent: fileContent,
          fileName: fileName,
          mimeType: 'text/csv'
        });
      });
      
      cy.intercept('POST', `/api/projects/${testData.project.id}/requirements/import`, {
        statusCode: 200,
        body: { imported: 5, errors: [] }
      }).as('importRequirements');
      
      cy.get('[data-testid="start-import-btn"]').click();
      
      cy.wait('@importRequirements');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', '5 requirements imported successfully');
      
      // List should refresh
      cy.wait('@getRequirements');
    });

    it('should handle import validation errors', () => {
      cy.get('[data-testid="import-requirements-btn"]').click();
      
      const fileName = 'requirements-import-invalid.csv';
      cy.fixture(fileName).then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').attachFile({
          fileContent: fileContent,
          fileName: fileName,
          mimeType: 'text/csv'
        });
      });
      
      cy.intercept('POST', `/api/projects/${testData.project.id}/requirements/import`, {
        statusCode: 400,
        body: { 
          imported: 2,
          errors: [
            'Row 3: Title is required',
            'Row 5: Invalid priority value'
          ]
        }
      }).as('importWithErrors');
      
      cy.get('[data-testid="start-import-btn"]').click();
      
      cy.wait('@importWithErrors');
      
      // Should show import results with errors
      cy.get('[data-testid="import-results"]')
        .should('be.visible');
      
      cy.get('[data-testid="import-success-count"]')
        .should('contain.text', '2 requirements imported');
      
      cy.get('[data-testid="import-error-list"]')
        .should('be.visible')
        .and('contain.text', 'Row 3: Title is required');
    });
  });

  describe('Requirements Dependencies and Relationships', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should manage requirement dependencies', () => {
      const requirementId = 'req-123';
      
      cy.get(`[data-testid="requirement-row-${requirementId}"]`).click();
      
      // Dependencies tab
      cy.get('[data-testid="dependencies-tab"]').click();
      
      cy.intercept('GET', `/api/requirements/${requirementId}/dependencies`, {
        fixture: 'requirement-dependencies.json'
      }).as('getDependencies');
      
      cy.wait('@getDependencies');
      
      // Add new dependency
      cy.get('[data-testid="add-dependency-btn"]').click();
      
      cy.get('[data-testid="dependency-requirement-select"]')
        .select('req-456');
      
      cy.get('[data-testid="dependency-type-select"]')
        .select('blocks');
      
      cy.intercept('POST', `/api/requirements/${requirementId}/dependencies`, {
        statusCode: 201,
        body: { success: true }
      }).as('addDependency');
      
      cy.get('[data-testid="save-dependency-btn"]').click();
      
      cy.wait('@addDependency');
      
      // Success notification
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Dependency added successfully');
    });

    it('should display dependency graph visualization', () => {
      cy.get('[data-testid="dependencies-view-btn"]').click();
      
      cy.intercept('GET', `/api/projects/${testData.project.id}/requirements/dependencies/graph`, {
        fixture: 'requirements-dependency-graph.json'
      }).as('getDependencyGraph');
      
      cy.wait('@getDependencyGraph');
      
      // Graph visualization should be displayed
      cy.get('[data-testid="dependency-graph"]')
        .should('be.visible');
      
      // Graph nodes should be clickable
      cy.get('[data-testid="graph-node-req-123"]')
        .should('be.visible')
        .click();
      
      // Node details should be displayed
      cy.get('[data-testid="node-details"]')
        .should('be.visible')
        .and('contain.text', testData.requirement.title);
    });

    it('should detect circular dependencies', () => {
      const requirementId = 'req-123';
      
      cy.get(`[data-testid="requirement-row-${requirementId}"]`).click();
      cy.get('[data-testid="dependencies-tab"]').click();
      
      cy.get('[data-testid="add-dependency-btn"]').click();
      
      // Try to create circular dependency
      cy.get('[data-testid="dependency-requirement-select"]')
        .select('req-789'); // This creates a circular dependency
      
      cy.intercept('POST', `/api/requirements/${requirementId}/dependencies`, {
        statusCode: 400,
        body: { error: 'Circular dependency detected' }
      }).as('circularDependencyError');
      
      cy.get('[data-testid="save-dependency-btn"]').click();
      
      cy.wait('@circularDependencyError');
      
      // Error notification
      cy.get('[data-testid="error-notification"]')
        .should('be.visible')
        .and('contain.text', 'Circular dependency detected');
    });
  });

  describe('Requirements Traceability', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should link requirements to test cases', () => {
      const requirementId = 'req-123';
      
      cy.get(`[data-testid="requirement-row-${requirementId}"]`).click();
      
      // Traceability tab
      cy.get('[data-testid="traceability-tab"]').click();
      
      cy.intercept('GET', `/api/requirements/${requirementId}/test-cases`, {
        fixture: 'requirement-test-cases.json'
      }).as('getTestCases');
      
      cy.wait('@getTestCases');
      
      // Linked test cases should be displayed
      cy.get('[data-testid="linked-test-cases"]')
        .should('be.visible');
      
      // Add new test case link
      cy.get('[data-testid="link-test-case-btn"]').click();
      
      cy.get('[data-testid="test-case-select"]')
        .select('tc-001');
      
      cy.intercept('POST', `/api/requirements/${requirementId}/test-cases`, {
        statusCode: 201,
        body: { success: true }
      }).as('linkTestCase');
      
      cy.get('[data-testid="save-test-case-link-btn"]').click();
      
      cy.wait('@linkTestCase');
    });

    it('should show traceability matrix', () => {
      cy.get('[data-testid="traceability-matrix-btn"]').click();
      
      cy.intercept('GET', `/api/projects/${testData.project.id}/traceability-matrix`, {
        fixture: 'traceability-matrix.json'
      }).as('getTraceabilityMatrix');
      
      cy.wait('@getTraceabilityMatrix');
      
      // Matrix should be displayed
      cy.get('[data-testid="traceability-matrix"]')
        .should('be.visible');
      
      // Requirements should be listed
      cy.get('[data-testid="matrix-requirement-row"]')
        .should('have.length.at.least', 1);
      
      // Test coverage should be shown
      cy.get('[data-testid="coverage-indicator"]')
        .should('be.visible');
    });

    it('should generate traceability report', () => {
      cy.get('[data-testid="generate-traceability-report-btn"]').click();
      
      // Report options dialog
      cy.get('[data-testid="report-options-dialog"]')
        .should('be.visible');
      
      cy.get('[data-testid="include-test-coverage"]').check();
      cy.get('[data-testid="include-dependencies"]').check();
      
      cy.intercept('POST', `/api/projects/${testData.project.id}/reports/traceability`, {
        statusCode: 200,
        body: { reportUrl: '/reports/traceability-123.pdf' }
      }).as('generateReport');
      
      cy.get('[data-testid="generate-report-btn"]').click();
      
      cy.wait('@generateReport');
      
      // Success notification with download link
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain.text', 'Report generated successfully');
      
      cy.get('[data-testid="download-report-link"]')
        .should('be.visible');
    });
  });

  describe('Requirements Responsive Design', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
      cy.wait('@getRequirements');
    });

    it('should display properly on mobile devices', () => {
      cy.viewport(375, 667); // iPhone SE
      
      // Mobile navigation should be visible
      cy.get('[data-testid="mobile-nav-toggle"]')
        .should('be.visible');
      
      // Table should be responsive
      cy.get('[data-testid="requirements-table"]')
        .should('be.visible');
      
      // Create button should be accessible
      cy.get('[data-testid="create-requirement-btn"]')
        .should('be.visible')
        .and('not.be.covered');
      
      // Filters should be in collapsible section
      cy.get('[data-testid="mobile-filters-toggle"]')
        .should('be.visible')
        .click();
      
      cy.get('[data-testid="requirements-filters"]')
        .should('be.visible');
    });

    it('should display properly on tablet devices', () => {
      cy.viewport(768, 1024); // iPad
      
      // Table should show more columns
      cy.get('[data-testid="requirements-table"] th')
        .should('have.length.at.least', 5);
      
      // Filters should be visible
      cy.get('[data-testid="requirements-filters"]')
        .should('be.visible');
      
      // Form should use appropriate layout
      cy.get('[data-testid="create-requirement-btn"]').click();
      
      cy.get('[data-testid="requirement-form"]')
        .should('be.visible')
        .and('have.css', 'max-width');
    });

    it('should display properly on desktop devices', () => {
      cy.viewport(1920, 1080); // Desktop
      
      // Full table should be visible
      cy.get('[data-testid="requirements-table"] th')
        .should('have.length.at.least', 7);
      
      // Sidebar filters should be visible
      cy.get('[data-testid="sidebar-filters"]')
        .should('be.visible');
      
      // Form should use full layout
      cy.get('[data-testid="create-requirement-btn"]').click();
      
      cy.get('[data-testid="requirement-form"]')
        .should('be.visible')
        .and('have.css', 'width');
    });
  });

  describe('Requirements Performance and Error Handling', () => {
    beforeEach(() => {
      cy.visit(`/projects/${testData.project.id}/requirements`);
    });

    it('should handle slow API responses gracefully', () => {
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        delay: 5000,
        fixture: 'requirements.json'
      }).as('getSlowRequirements');
      
      // Loading state should be shown
      cy.get('[data-testid="requirements-loading"]')
        .should('be.visible');
      
      // Skeleton loaders should be displayed
      cy.get('[data-testid="skeleton-loader"]')
        .should('have.length.at.least', 3);
      
      cy.wait('@getSlowRequirements');
      
      // Content should load
      cy.get('[data-testid="requirements-table"]')
        .should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        forceNetworkError: true
      }).as('getNetworkError');
      
      cy.reload();
      
      // Error state should be displayed
      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', 'Network error occurred');
      
      // Retry button should be available
      cy.get('[data-testid="retry-btn"]')
        .should('be.visible');
    });

    it('should handle API server errors', () => {
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getServerError');
      
      cy.reload();
      
      // Server error state
      cy.get('[data-testid="server-error"]')
        .should('be.visible')
        .and('contain.text', 'Server error occurred');
      
      // Error details should be logged
      cy.window().then((win) => {
        expect(win.console.error).to.have.been.called;
      });
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `req-${i}`,
        title: `Requirement ${i}`,
        priority: 'medium',
        status: 'pending'
      }));
      
      cy.intercept('GET', apiEndpoints.requirements(testData.project.id), {
        statusCode: 200,
        body: {
          requirements: largeDataset.slice(0, 50),
          pagination: {
            page: 1,
            limit: 50,
            total: 1000,
            pages: 20
          }
        }
      }).as('getLargeDataset');
      
      cy.reload();
      cy.wait('@getLargeDataset');
      
      // Virtual scrolling or pagination should be used
      cy.get('[data-testid="requirements-table"] tbody tr')
        .should('have.length', 50);
      
      // Pagination should be available
      cy.get('[data-testid="pagination-controls"]')
        .should('be.visible');
    });
  });
});
