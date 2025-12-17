describe('Document Types Feature - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    consultant: 'ci-test-consultant',
    documentTypes: {
      valid: {
        name: 'Test Document Type',
        description: 'Test description for document type',
        isRequired: true
      },
      updated: {
        name: 'Updated Document Type',
        description: 'Updated description for testing',
        isRequired: false
      },
      invalid: {
        emptyName: '',
        longName: 'A'.repeat(256),
        specialChars: '<script>alert("xss")</script>',
        sqlInjection: "'; DROP TABLE document_types; --"
      }
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultants: '/api/consultants',
    consultantDocuments: (id) => `/api/consultants/${id}/documents`
  };

  let createdDocumentTypeId = null;
  let consultantId = null;

  before(() => {
    // Login once for the entire test suite
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.contain', '/login');
    
    // Get consultant ID for document operations
    cy.request('GET', apiEndpoints.consultants).then((response) => {
      const consultant = response.body.data?.find(c => c.name?.includes('ci-test')) || response.body.data?.[0];
      if (consultant) {
        consultantId = consultant.id;
      }
    });
  });

  beforeEach(() => {
    // Set up API interceptors
    cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
    cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
    cy.intercept('PATCH', '/api/document-types/*').as('updateDocumentType');
    cy.intercept('DELETE', '/api/document-types/*').as('deleteDocumentType');
    
    if (consultantId) {
      cy.intercept('GET', apiEndpoints.consultantDocuments(consultantId)).as('getConsultantDocuments');
      cy.intercept('POST', apiEndpoints.consultantDocuments(consultantId)).as('uploadDocument');
    }
  });

  describe('Document Types Management Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display complete document types management page layout', () => {
      // Page header and title
      cy.get('[data-testid="page-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('h1').should('contain.text', /document types/i);

      // Main content area
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');

      // Create button
      cy.get('[data-testid="button-create-document-type"]')
        .should('be.visible')
        .and('contain.text', /create|add/i);

      // Table or list container
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('be.visible');
    });

    it('should display proper table headers and structure', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="document-types-table"]').length > 0) {
          // Table structure
          cy.get('[data-testid="document-types-table"]').within(() => {
            cy.get('thead').should('be.visible');
            cy.get('tbody').should('be.visible');
            
            // Expected headers
            cy.get('th').should('contain.text', /name/i);
            cy.get('th').should('contain.text', /description/i);
            cy.get('th').should('contain.text', /required/i);
            cy.get('th').should('contain.text', /actions/i);
          });
        }
      });
    });

    it('should handle empty state when no document types exist', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getEmptyDocumentTypes');

      cy.reload();
      cy.wait('@getEmptyDocumentTypes');

      // Check for empty state message
      cy.get('[data-testid="empty-state"], .empty-state')
        .should('be.visible')
        .and('contain.text', /no document types/i);
    });

    it('should have accessible navigation and breadcrumbs', () => {
      // Navigation accessibility
      cy.get('[data-testid="navigation"], nav').should('be.visible');
      
      // Breadcrumbs if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="breadcrumbs"]').length > 0) {
          cy.get('[data-testid="breadcrumbs"]').within(() => {
            cy.get('a, span').should('contain.text', /admin/i);
            cy.get('a, span').should('contain.text', /document types/i);
          });
        }
      });
    });
  });

  describe('Create Document Type - UI and Validation', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      cy.get('[data-testid="button-create-document-type"]').click();
    });

    it('should display create document type modal/form with all required fields', () => {
      // Modal or form container
      cy.get('[data-testid="create-document-type-modal"], [data-testid="create-document-type-form"]', { timeout: 5000 })
        .should('be.visible');

      // Form fields
      cy.get('[data-testid="input-document-type-name"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-document-type-description"], [data-testid="textarea-document-type-description"]')
        .should('be.visible');

      cy.get('[data-testid="checkbox-is-required"], [data-testid="switch-is-required"]')
        .should('be.visible');

      // Action buttons
      cy.get('[data-testid="button-save-document-type"]')
        .should('be.visible')
        .and('contain.text', /save|create/i);

      cy.get('[data-testid="button-cancel"], [data-testid="button-close"]')
        .should('be.visible')
        .and('contain.text', /cancel|close/i);
    });

    it('should validate required fields and show proper error messages', () => {
      // Try to save without required fields
      cy.get('[data-testid="button-save-document-type"]').click();

      // Check for name field validation
      cy.get('[data-testid="error-document-type-name"], .error-message')
        .should('be.visible')
        .and('contain.text', /required|name/i);
    });

    it('should validate field length limits', () => {
      // Test name field with maximum length
      cy.get('[data-testid="input-document-type-name"]')
        .clear()
        .type(testData.documentTypes.invalid.longName);

      cy.get('[data-testid="button-save-document-type"]').click();

      // Should show length validation error
      cy.get('[data-testid="error-document-type-name"], .error-message')
        .should('be.visible')
        .and('contain.text', /length|characters|long/i);
    });

    it('should handle XSS prevention in input fields', () => {
      // Fill form with XSS attempt
      cy.get('[data-testid="input-document-type-name"]')
        .clear()
        .type(testData.documentTypes.invalid.specialChars);

      cy.get('[data-testid="input-document-type-description"], [data-testid="textarea-document-type-description"]')
        .clear()
        .type(testData.documentTypes.invalid.specialChars);

      cy.get('[data-testid="button-save-document-type"]').click();

      // Should either sanitize input or show validation error
      cy.get('body').should('not.contain', '<script>');
    });

    it('should handle SQL injection attempts', () => {
      // Fill form with SQL injection attempt
      cy.get('[data-testid="input-document-type-name"]')
        .clear()
        .type(testData.documentTypes.invalid.sqlInjection);

      cy.get('[data-testid="button-save-document-type"]').click();

      // Should handle gracefully without breaking
      cy.get('body').should('not.contain', 'DROP TABLE');
    });

    it('should allow canceling creation and close modal', () => {
      // Fill some data
      cy.get('[data-testid="input-document-type-name"]')
        .type('Test Cancel');

      // Cancel
      cy.get('[data-testid="button-cancel"], [data-testid="button-close"]').click();

      // Modal should close
      cy.get('[data-testid="create-document-type-modal"]')
        .should('not.exist');
    });
  });

  describe('Create Document Type - API Integration', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should successfully create a new document type', () => {
      cy.get('[data-testid="button-create-document-type"]').click();

      // Fill form with valid data
      cy.get('[data-testid="input-document-type-name"]')
        .type(testData.documentTypes.valid.name);

      cy.get('[data-testid="input-document-type-description"], [data-testid="textarea-document-type-description"]')
        .type(testData.documentTypes.valid.description);

      // Set required checkbox
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="checkbox-is-required"]').length > 0) {
          if (testData.documentTypes.valid.isRequired) {
            cy.get('[data-testid="checkbox-is-required"]').check();
          }
        } else if ($body.find('[data-testid="switch-is-required"]').length > 0) {
          if (testData.documentTypes.valid.isRequired) {
            cy.get('[data-testid="switch-is-required"]').click();
          }
        }
      });

      // Submit form
      cy.get('[data-testid="button-save-document-type"]').click();

      // Wait for API call
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        
        // Store ID for cleanup
        if (interception.response.body.data) {
          createdDocumentTypeId = interception.response.body.data.id;
        }
      });

      // Should show success message
      cy.get('[data-testid="toast-success"], .success-message, .toast')
        .should('be.visible')
        .and('contain.text', /created|success/i);

      // Modal should close
      cy.get('[data-testid="create-document-type-modal"]')
        .should('not.exist');

      // Should refresh list and show new item
      cy.wait('@getDocumentTypes');
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('contain.text', testData.documentTypes.valid.name);
    });

    it('should handle server errors during creation', () => {
      // Mock server error
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="button-create-document-type"]').click();

      // Fill form
      cy.get('[data-testid="input-document-type-name"]')
        .type('Error Test');

      cy.get('[data-testid="button-save-document-type"]').click();

      cy.wait('@createDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], .error-message, .toast')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });

    it('should handle validation errors from server', () => {
      // Mock validation error
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { 
          error: 'Validation failed',
          details: { name: 'Name already exists' }
        }
      }).as('createDocumentTypeValidationError');

      cy.get('[data-testid="button-create-document-type"]').click();

      // Fill form
      cy.get('[data-testid="input-document-type-name"]')
        .type('Duplicate Name');

      cy.get('[data-testid="button-save-document-type"]').click();

      cy.wait('@createDocumentTypeValidationError');

      // Should show validation error
      cy.get('[data-testid="error-document-type-name"], .error-message')
        .should('be.visible')
        .and('contain.text', /already exists|duplicate/i);
    });
  });

  describe('Document Types List - Display and Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types with all required information', () => {
      cy.get('[data-testid="document-types-table"] tbody tr, [data-testid="document-type-item"]')
        .first()
        .within(() => {
          // Should show name
          cy.get('[data-testid="document-type-name"]')
            .should('be.visible')
            .and('not.be.empty');

          // Should show description
          cy.get('[data-testid="document-type-description"]')
            .should('be.visible');

          // Should show required status
          cy.get('[data-testid="document-type-required"], [data-testid="required-indicator"]')
            .should('be.visible');

          // Should show action buttons
          cy.get('[data-testid="button-edit-document-type"]')
            .should('be.visible');
          cy.get('[data-testid="button-delete-document-type"]')
            .should('be.visible');
        });
    });

    it('should handle long descriptions with truncation or expansion', () => {
      const longDescription = 'A'.repeat(200);
      
      // Mock data with long description
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [{
            id: 1,
            name: 'Test Type',
            description: longDescription,
            isRequired: true
          }],
          total: 1
        }
      }).as('getLongDescription');

      cy.reload();
      cy.wait('@getLongDescription');

      // Check if description is truncated
      cy.get('[data-testid="document-type-description"]')
        .should('be.visible')
        .then(($el) => {
          const displayedText = $el.text();
          if (displayedText.length < longDescription.length) {
            // Truncated - check for expand functionality
            cy.get('[data-testid="expand-description"], .expand-text')
              .should('be.visible')
              .click();
            
            cy.get('[data-testid="document-type-description"]')
              .should('contain.text', longDescription);
          }
        });
    });

    it('should indicate required vs optional document types clearly', () => {
      cy.get('[data-testid="document-type-item"], [data-testid="document-types-table"] tbody tr')
        .each(($row) => {
          cy.wrap($row).within(() => {
            cy.get('[data-testid="required-indicator"], [data-testid="document-type-required"]')
              .should('be.visible')
              .then(($indicator) => {
                const text = $indicator.text().toLowerCase();
                expect(text).to.match(/required|optional|yes|no/);
              });
          });
        });
    });
  });

  describe('Edit Document Type - UI and Functionality', () => {
    let documentTypeToEdit = null;

    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes').then((interception) => {
        if (interception.response.body.data && interception.response.body.data.length > 0) {
          documentTypeToEdit = interception.response.body.data[0];
        }
      });
    });

    it('should open edit modal with pre-filled data', () => {
      cy.get('[data-testid="button-edit-document-type"]').first().click();

      // Modal should open
      cy.get('[data-testid="edit-document-type-modal"], [data-testid="edit-document-type-form"]', { timeout: 5000 })
        .should('be.visible');

      // Fields should be pre-filled
      if (documentTypeToEdit) {
        cy.get('[data-testid="input-document-type-name"]')
          .should('have.value', documentTypeToEdit.name);

        if (documentTypeToEdit.description) {
          cy.get('[data-testid="input-document-type-description"], [data-testid="textarea-document-type-description"]')
            .should('have.value', documentTypeToEdit.description);
        }
      }
    });

    it('should validate edited data before submission', () => {
      cy.get('[data-testid="button-edit-document-type"]').first().click();

      // Clear required field
      cy.get('[data-testid="input-document-type-name"]')
        .clear();

      cy.get('[data-testid="button-save-document-type"]').click();

      // Should show validation error
      cy.get('[data-testid="error-document-type-name"], .error-message')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should successfully update document type', () => {
      // Set up intercept for specific document type
      cy.intercept('PATCH', '/api/document-types/*', {
        statusCode: 200,
        body: { 
          success: true,
          data: { 
            id: 1,
            ...testData.documentTypes.updated 
          }
        }
      }).as('updateDocumentTypeSuccess');

      cy.get('[data-testid="button-edit-document-type"]').first().click();

      // Edit fields
      cy.get('[data-testid="input-document-type-name"]')
        .clear()
        .type(testData.documentTypes.updated.name);

      cy.get('[data-testid="input-document-type-description"], [data-testid="textarea-document-type-description"]')
        .clear()
        .type(testData.documentTypes.updated.description);

      // Submit
      cy.get('[data-testid="button-save-document-type"]').click();

      cy.wait('@updateDocumentTypeSuccess');

      // Should show success message
      cy.get('[data-testid="toast-success"], .success-message')
        .should('be.visible')
        .and('contain.text', /updated|success/i);

      // Modal should close
      cy.get('[data-testid="edit-document-type-modal"]')
        .should('not.exist');
    });

    it('should handle update errors gracefully', () => {
      cy.intercept('PATCH', '/api/document-types/*', {
        statusCode: 500,
        body: { error: 'Update failed' }
      }).as('updateDocumentTypeError');

      cy.get('[data-testid="button-edit-document-type"]').first().click();

      cy.get('[data-testid="input-document-type-name"]')
        .clear()
        .type('Updated Name');

      cy.get('[data-testid="button-save-document-type"]').click();

      cy.wait('@updateDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], .error-message')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Delete Document Type - Confirmation and Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show confirmation dialog before deletion', () => {
      cy.get('[data-testid="button-delete-document-type"]').first().click();

      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation-dialog"], [role="dialog"]')
        .should('be.visible');

      // Should show warning message
      cy.get('[data-testid="delete-confirmation-message"]')
        .should('be.visible')
        .and('contain.text', /delete|remove/i)
        .and('contain.text', /cannot be undone|permanent/i);

      // Should have confirm and cancel buttons
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete|confirm/i);

      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should allow canceling deletion', () => {
      cy.get('[data-testid="button-delete-document-type"]').first().click();

      cy.get('[data-testid="button-cancel-delete"]').click();

      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');

      // Item should still be in list
      cy.get('[data-testid="document-types-table"] tbody tr, [data-testid="document-type-item"]')
        .should('have.length.greaterThan', 0);
    });

    it('should successfully delete document type when confirmed', () => {
      cy.intercept('DELETE', '/api/document-types/*', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocumentTypeSuccess');

      cy.get('[data-testid="button-delete-document-type"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteDocumentTypeSuccess');

      // Should show success message
      cy.get('[data-testid="toast-success"], .success-message')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);

      // Should refresh the list
      cy.wait('@getDocumentTypes');
    });

    it('should handle deletion errors', () => {
      cy.intercept('DELETE', '/api/document-types/*', {
        statusCode: 400,
        body: { error: 'Cannot delete document type in use' }
      }).as('deleteDocumentTypeError');

      cy.get('[data-testid="button-delete-document-type"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], .error-message')
        .should('be.visible')
        .and('contain.text', /error|cannot delete|in use/i);
    });
  });

  describe('Document Types in Consultant Context', () => {
    beforeEach(() => {
      if (consultantId) {
        cy.visit(`/consultants/${consultantId}/documents`);
        cy.wait('@getConsultantDocuments');
      }
    });

    it('should display available document types for upload', function() {
      if (!consultantId) {
        this.skip();
      }

      // Should show upload section
      cy.get('[data-testid="document-upload-section"]', { timeout: 10000 })
        .should('be.visible');

      // Should have document type selector
      cy.get('[data-testid="select-document-type"]')
        .should('be.visible');

      // Should populate with available types
      cy.get('[data-testid="select-document-type"]').click();
      
      cy.get('[data-testid="document-type-option"]')
        .should('have.length.greaterThan', 0);
    });

    it('should indicate required vs optional document types in consultant view', function() {
      if (!consultantId) {
        this.skip();
      }

      cy.get('[data-testid="select-document-type"]').click();

      cy.get('[data-testid="document-type-option"]')
        .each(($option) => {
          cy.wrap($option)
            .should('contain.text', /required|optional/i);
        });
    });

    it('should show validation for required document types', function() {
      if (!consultantId) {
        this.skip();
      }

      // Mock consultant documents missing required types
      cy.intercept('GET', apiEndpoints.consultantDocuments(consultantId), {
        statusCode: 200,
        body: {
          data: [],
          requiredTypes: [
            { id: 1, name: 'License', isRequired: true },
            { id: 2, name: 'Certification', isRequired: true }
          ]
        }
      }).as('getMissingDocuments');

      cy.reload();
      cy.wait('@getMissingDocuments');

      // Should show missing required documents warning
      cy.get('[data-testid="missing-documents-warning"]')
        .should('be.visible')
        .and('contain.text', /missing required/i);
    });
  });

  describe('Document Types - Search and Filter Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should filter document types by search term', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          const searchTerm = 'license';
          
          cy.get('[data-testid="search-document-types"]')
            .type(searchTerm);

          // Results should filter
          cy.get('[data-testid="document-types-table"] tbody tr, [data-testid="document-type-item"]')
            .each(($row) => {
              cy.wrap($row)
                .should('contain.text', new RegExp(searchTerm, 'i'));
            });
        }
      });
    });

    it('should filter by required status', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-required-only"]').length > 0) {
          cy.get('[data-testid="filter-required-only"]').click();

          // Should only show required document types
          cy.get('[data-testid="required-indicator"]')
            .each(($indicator) => {
              cy.wrap($indicator)
                .should('contain.text', /required|yes/i);
            });
        }
      });
    });

    it('should handle empty search results', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          cy.get('[data-testid="search-document-types"]')
            .type('nonexistentdocumenttype123');

          // Should show no results message
          cy.get('[data-testid="no-results"], .no-results')
            .should('be.visible')
            .and('contain.text', /no results|not found/i);
        }
      });
    });
  });

  describe('Document Types - Responsive Design', () => {
    const viewports = [
      { device: 'mobile', width: 375, height: 667 },
      { device: 'tablet', width: 768, height: 1024 },
      { device: 'desktop', width: 1440, height: 900 }
    ];

    viewports.forEach(({ device, width, height }) => {
      describe(`${device.toUpperCase()} - ${width}x${height}`, () => {
        beforeEach(() => {
          cy.viewport(width, height);
          cy.visit('/admin/document-types');
          cy.wait('@getDocumentTypes');
        });

        it(`should display properly on ${device}`, () => {
          // Page should be visible and scrollable
          cy.get('[data-testid="document-types-container"]')
            .should('be.visible');

          if (device === 'mobile') {
            // Mobile-specific checks
            cy.get('[data-testid="mobile-menu-toggle"]')
              .should('be.visible');

            // Table might be replaced with cards
            cy.get('[data-testid="document-types-list"], [data-testid="document-types-table"]')
              .should('be.visible');
          }
        });

        it(`should handle modal display on ${device}`, () => {
          cy.get('[data-testid="button-create-document-type"]').click();

          cy.get('[data-testid="create-document-type-modal"]')
            .should('be.visible')
            .and('be.positioned');

          if (device === 'mobile') {
            // Modal should take full screen on mobile
            cy.get('[data-testid="create-document-type-modal"]')
              .should('have.css', 'width')
              .and('match', /100%|full/);
          }
        });
      });
    });
  });

  describe('Document Types - Performance and Loading States', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
    });

    it('should show loading states during data fetch', () => {
      // Intercept with delay to see loading state
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ statusCode: 200, body: { data: [], total: 0 } });
          }, 1000);
        });
      }).as('getDocumentTypesDelayed');

      cy.reload();

      // Should show loading indicator
      cy.get('[data-testid="loading-spinner"], .loading, .spinner')
        .should('be.visible');

      cy.wait('@getDocumentTypesDelayed');

      // Loading should disappear
      cy.get('[data-testid="loading-spinner"], .loading, .spinner')
        .should('not.exist');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        forceNetworkError: true
      }).as('getDocumentTypesNetworkError');

      cy.reload();

      // Should show error state
      cy.get('[data-testid="error-state"], .error-message')
        .should('be.visible')
        .and('contain.text', /error|failed to load/i);

      // Should have retry option
      cy.get('[data-testid="button-retry"], .retry-button')
        .should('be.visible')
        .and('contain.text', /retry|try again/i);
    });
  });

  describe('Document Types - Accessibility', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should be keyboard navigable', () => {
      // Focus should move through interactive elements
      cy.get('body').tab();
      cy.focused().should('be.visible');

      // Create button should be focusable
      cy.get('[data-testid="button-create-document-type"]')
        .focus()
        .should('have.focus');

      // Action buttons should be focusable
      cy.get('[data-testid="button-edit-document-type"]')
        .first()
        .focus()
        .should('have.focus');
    });

    it('should have proper ARIA labels and roles', () => {
      // Table should have proper ARIA
      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table');

      // Buttons should have ARIA labels
      cy.get('[data-testid="button-create-document-type"]')
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="button-edit-document-type"]')
        .first()
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="button-delete-document-type"]')
        .first()
        .should('have.attr', 'aria-label');
    });

    it('should announce dynamic content changes', () => {
      // Create new document type
      cy.get('[data-testid="button-create-document-type"]').click();

      // Modal should be announced
      cy.get('[data-testid="create-document-type-modal"]')
        .should('have.attr', 'role', 'dialog')
        .and('have.attr', 'aria-modal', 'true');

      // Success messages should be announced
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="toast-success"]').length > 0) {
          cy.get('[data-testid="toast-success"]')
            .should('have.attr', 'role', 'alert');
        }
      });
    });
  });

  // Cleanup
  after(() => {
    // Clean up created document type if it exists
    if (createdDocumentTypeId) {
      cy.request({
        method: 'DELETE',
        url: `/api/document-types/${createdDocumentTypeId}`,
        failOnStatusCode: false
      });
    }
  });
});
