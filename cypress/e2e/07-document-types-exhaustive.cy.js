describe('Document Types Feature - Exhaustive Tests', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      username: 'ci-test-user'
    },
    consultant: {
      id: 'ci-test-consultant'
    },
    documentTypes: {
      valid: {
        name: 'Test Certificate',
        description: 'A test certification document',
        isRequired: true,
        category: 'certification'
      },
      minimal: {
        name: 'Minimal Doc Type'
      },
      withSpecialChars: {
        name: 'Special-Chars_Type!@#',
        description: 'Document with special characters & symbols',
        isRequired: false,
        category: 'optional'
      },
      longName: {
        name: 'A'.repeat(255),
        description: 'Document type with very long name for testing limits'
      },
      invalidData: {
        empty: { name: '' },
        whitespace: { name: '   ' },
        nullName: { name: null },
        undefinedName: { name: undefined }
      }
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultantDocuments: '/api/consultants/:consultantId/documents',
    login: '/api/auth/login',
    user: '/api/auth/user'
  };

  const routes = {
    login: '/login',
    dashboard: '/dashboard',
    documentTypes: '/admin/document-types',
    consultants: '/consultants'
  };

  // Helper function to login as admin
  const loginAsAdmin = () => {
    cy.session('admin-session', () => {
      cy.visit(routes.login);
      cy.get('[data-testid="input-email"]').type(testData.admin.email);
      cy.get('[data-testid="input-password"]').type('test123');
      cy.get('[data-testid="button-login"]').click();
      cy.url().should('not.include', '/login');
    });
  };

  // Helper function to create document type via API
  const createDocumentTypeAPI = (documentType) => {
    return cy.request({
      method: 'POST',
      url: apiEndpoints.documentTypes,
      body: documentType,
      failOnStatusCode: false
    });
  };

  // Helper function to clean up test data
  const cleanupTestData = () => {
    // Clean up any test document types created during tests
    cy.request({
      method: 'GET',
      url: apiEndpoints.documentTypes,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 && response.body.data) {
        response.body.data.forEach((docType) => {
          if (docType.name.includes('Test') || docType.name.includes('Minimal') || docType.name.includes('Special')) {
            cy.request({
              method: 'DELETE',
              url: `${apiEndpoints.documentTypes}/${docType.id}`,
              failOnStatusCode: false
            });
          }
        });
      }
    });
  };

  before(() => {
    cleanupTestData();
  });

  after(() => {
    cleanupTestData();
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Intercept API calls
    cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
    cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
    cy.intercept('PATCH', '/api/document-types/*').as('updateDocumentType');
    cy.intercept('DELETE', '/api/document-types/*').as('deleteDocumentType');
    cy.intercept('GET', '/api/consultants/*/documents').as('getConsultantDocuments');
  });

  describe('Document Types List Page - UI Components & Layout', () => {
    beforeEach(() => {
      loginAsAdmin();
      cy.visit(routes.documentTypes);
    });

    it('should display complete document types page layout', () => {
      cy.wait('@getDocumentTypes');
      
      // Page header
      cy.get('[data-testid="page-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', /document types/i);
      
      // Action buttons
      cy.get('[data-testid="button-create-document-type"]')
        .should('be.visible')
        .and('contain.text', /add|create|new/i);
      
      // Search functionality
      cy.get('[data-testid="input-search"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
      
      // Table or list container
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('be.visible');
    });

    it('should handle empty state when no document types exist', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getEmptyDocumentTypes');
      
      cy.reload();
      cy.wait('@getEmptyDocumentTypes');
      
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', /no document types/i);
      
      cy.get('[data-testid="empty-state-action"]')
        .should('be.visible')
        .and('contain.text', /create|add/i);
    });

    it('should handle loading states', () => {
      // Mock slow response
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              statusCode: 200,
              body: { data: [], total: 0 }
            });
          }, 2000);
        });
      }).as('getSlowDocumentTypes');
      
      cy.reload();
      
      // Loading indicator should be visible
      cy.get('[data-testid="loading-spinner"], [data-testid="skeleton-loader"]')
        .should('be.visible');
      
      cy.wait('@getSlowDocumentTypes');
      
      // Loading indicator should disappear
      cy.get('[data-testid="loading-spinner"], [data-testid="skeleton-loader"]')
        .should('not.exist');
    });

    it('should display document types table with proper columns', () => {
      cy.wait('@getDocumentTypes');
      
      // Table headers
      const expectedHeaders = ['Name', 'Description', 'Required', 'Category', 'Actions'];
      expectedHeaders.forEach(header => {
        cy.get('[data-testid="table-header"]')
          .should('contain.text', header);
      });
      
      // Check if table has data
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="document-type-row"]').length > 0) {
          // Verify table row structure
          cy.get('[data-testid="document-type-row"]').first().within(() => {
            cy.get('[data-testid="cell-name"]').should('be.visible');
            cy.get('[data-testid="cell-required"]').should('be.visible');
            cy.get('[data-testid="cell-actions"]').should('be.visible');
          });
        }
      });
    });

    it('should handle search functionality', () => {
      cy.wait('@getDocumentTypes');
      
      // Create test document type first
      createDocumentTypeAPI(testData.documentTypes.valid);
      cy.reload();
      cy.wait('@getDocumentTypes');
      
      // Test search
      cy.get('[data-testid="input-search"]')
        .type(testData.documentTypes.valid.name);
      
      // Should filter results
      cy.get('[data-testid="document-type-row"]')
        .should('contain.text', testData.documentTypes.valid.name);
      
      // Test clearing search
      cy.get('[data-testid="input-search"]').clear();
      cy.get('[data-testid="button-clear-search"]').click({ force: true });
    });

    it('should handle filter functionality', () => {
      cy.wait('@getDocumentTypes');
      
      // Test filter by required status
      cy.get('[data-testid="filter-required"]').within(() => {
        cy.get('select, [role="combobox"]').click();
      });
      
      cy.get('[data-testid="option-required-true"]').click();
      
      // Verify filtered results
      cy.get('[data-testid="document-type-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="cell-required"]')
            .should('contain.text', /yes|required|true/i);
        });
      });
    });

    it('should handle pagination when many document types exist', () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 25 }, (_, i) => ({
        id: `doc-type-${i}`,
        name: `Document Type ${i + 1}`,
        description: `Description for document type ${i + 1}`,
        isRequired: i % 2 === 0,
        category: i % 2 === 0 ? 'certification' : 'optional'
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: largeDataset.slice(0, 10), total: 25, page: 1, limit: 10 }
      }).as('getPaginatedDocumentTypes');
      
      cy.reload();
      cy.wait('@getPaginatedDocumentTypes');
      
      // Pagination controls should be visible
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', '1-10 of 25');
      
      // Test next page
      cy.get('[data-testid="button-next-page"]').click();
      
      // Should show page 2 info
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', '11-20 of 25');
    });
  });

  describe('Create Document Type - Form Validation & Functionality', () => {
    beforeEach(() => {
      loginAsAdmin();
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
      cy.get('[data-testid="button-create-document-type"]').click();
    });

    it('should display create document type form with all required fields', () => {
      // Form should be visible
      cy.get('[data-testid="create-document-type-form"]', { timeout: 10000 })
        .should('be.visible');
      
      // Required fields
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="textarea-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="checkbox-required"]')
        .should('be.visible');
      
      cy.get('[data-testid="select-category"]')
        .should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-save"]')
        .should('be.visible')
        .and('be.disabled');
      
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should validate required fields', () => {
      // Try to submit empty form
      cy.get('[data-testid="input-name"]').focus().blur();
      
      // Should show validation error
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required|name is required/i);
      
      // Save button should remain disabled
      cy.get('[data-testid="button-save"]').should('be.disabled');
      
      // Fill required field
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      // Error should disappear and save button should be enabled
      cy.get('[data-testid="error-name"]').should('not.exist');
      cy.get('[data-testid="button-save"]').should('not.be.disabled');
    });

    it('should validate name field constraints', () => {
      // Test minimum length
      cy.get('[data-testid="input-name"]').type('a');
      cy.get('[data-testid="button-save"]').click();
      cy.get('[data-testid="error-name"]')
        .should('contain.text', /minimum|too short/i);
      
      // Test maximum length
      cy.get('[data-testid="input-name"]').clear().type('a'.repeat(256));
      cy.get('[data-testid="error-name"]')
        .should('contain.text', /maximum|too long/i);
      
      // Test valid length
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(testData.documentTypes.valid.name);
      cy.get('[data-testid="error-name"]').should('not.exist');
    });

    it('should handle special characters in name field', () => {
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.withSpecialChars.name);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.documentTypes.withSpecialChars.description);
      
      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createDocumentType');
      
      // Should successfully create document type
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created|added/i);
    });

    it('should successfully create document type with valid data', () => {
      // Fill form with valid data
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.documentTypes.valid.description);
      
      cy.get('[data-testid="checkbox-required"]').check();
      
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-certification"]').click();
      
      // Submit form
      cy.get('[data-testid="button-save"]').click();
      cy.wait('@createDocumentType');
      
      // Should redirect back to list
      cy.url().should('include', routes.documentTypes);
      
      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created|added/i);
      
      // New document type should appear in list
      cy.get('[data-testid="document-type-row"]')
        .should('contain.text', testData.documentTypes.valid.name);
    });

    it('should handle API errors during creation', () => {
      // Mock API error
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { error: 'Document type name already exists' }
      }).as('createDocumentTypeError');
      
      // Fill and submit form
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@createDocumentTypeError');
      
      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'already exists');
      
      // Form should remain open
      cy.get('[data-testid="create-document-type-form"]')
        .should('be.visible');
    });

    it('should handle cancel functionality', () => {
      // Fill form partially
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      // Click cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should redirect back to list without saving
      cy.url().should('include', routes.documentTypes);
      
      // Document type should not exist in list
      cy.get('[data-testid="document-type-row"]')
        .should('not.contain.text', testData.documentTypes.valid.name);
    });

    it('should handle unsaved changes warning', () => {
      // Fill form
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      // Try to navigate away
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });
      
      cy.get('[data-testid="breadcrumb-dashboard"]').click();
      
      // Should stay on form page
      cy.get('[data-testid="create-document-type-form"]')
        .should('be.visible');
    });
  });

  describe('Edit Document Type - Form Validation & Updates', () => {
    let createdDocumentTypeId;

    beforeEach(() => {
      loginAsAdmin();
      
      // Create a document type to edit
      createDocumentTypeAPI(testData.documentTypes.valid).then((response) => {
        createdDocumentTypeId = response.body.data.id;
      });
      
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
    });

    it('should open edit form with pre-filled data', () => {
      // Click edit button for the document type
      cy.get(`[data-testid="button-edit-${createdDocumentTypeId}"]`).click();
      
      // Form should be visible with pre-filled data
      cy.get('[data-testid="edit-document-type-form"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="input-name"]')
        .should('have.value', testData.documentTypes.valid.name);
      
      cy.get('[data-testid="textarea-description"]')
        .should('have.value', testData.documentTypes.valid.description);
      
      cy.get('[data-testid="checkbox-required"]')
        .should('be.checked');
    });

    it('should successfully update document type', () => {
      cy.get(`[data-testid="button-edit-${createdDocumentTypeId}"]`).click();
      
      // Update fields
      const updatedName = 'Updated Certificate Name';
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(updatedName);
      
      cy.get('[data-testid="textarea-description"]')
        .clear()
        .type('Updated description for the certificate');
      
      cy.get('[data-testid="checkbox-required"]').uncheck();
      
      // Save changes
      cy.get('[data-testid="button-save"]').click();
      cy.wait('@updateDocumentType');
      
      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|saved/i);
      
      // Updated data should appear in list
      cy.get('[data-testid="document-type-row"]')
        .should('contain.text', updatedName);
    });

    it('should handle validation errors during update', () => {
      cy.get(`[data-testid="button-edit-${createdDocumentTypeId}"]`).click();
      
      // Clear required field
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-save"]').click();
      
      // Should show validation error
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should handle API errors during update', () => {
      // Mock API error
      cy.intercept('PATCH', `/api/document-types/${createdDocumentTypeId}`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateDocumentTypeError');
      
      cy.get(`[data-testid="button-edit-${createdDocumentTypeId}"]`).click();
      
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Updated Name');
      
      cy.get('[data-testid="button-save"]').click();
      cy.wait('@updateDocumentTypeError');
      
      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Delete Document Type - Confirmation & Error Handling', () => {
    let createdDocumentTypeId;

    beforeEach(() => {
      loginAsAdmin();
      
      // Create a document type to delete
      createDocumentTypeAPI(testData.documentTypes.minimal).then((response) => {
        createdDocumentTypeId = response.body.data.id;
      });
      
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
    });

    it('should show delete confirmation dialog', () => {
      cy.get(`[data-testid="button-delete-${createdDocumentTypeId}"]`).click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation-dialog"]', { timeout: 5000 })
        .should('be.visible');
      
      cy.get('[data-testid="delete-confirmation-message"]')
        .should('contain.text', /delete|remove/i)
        .and('contain.text', testData.documentTypes.minimal.name);
      
      // Dialog action buttons
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete|confirm/i);
      
      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should successfully delete document type', () => {
      cy.get(`[data-testid="button-delete-${createdDocumentTypeId}"]`).click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentType');
      
      // Should show success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);
      
      // Document type should no longer appear in list
      cy.get('[data-testid="document-type-row"]')
        .should('not.contain.text', testData.documentTypes.minimal.name);
    });

    it('should cancel delete operation', () => {
      cy.get(`[data-testid="button-delete-${createdDocumentTypeId}"]`).click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation-dialog"]')
        .should('not.exist');
      
      // Document type should still exist in list
      cy.get('[data-testid="document-type-row"]')
        .should('contain.text', testData.documentTypes.minimal.name);
    });

    it('should handle delete errors when document type is in use', () => {
      // Mock error for document type in use
      cy.intercept('DELETE', `/api/document-types/${createdDocumentTypeId}`, {
        statusCode: 400,
        body: { error: 'Cannot delete document type that is in use by consultants' }
      }).as('deleteDocumentTypeError');
      
      cy.get(`[data-testid="button-delete-${createdDocumentTypeId}"]`).click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentTypeError');
      
      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /in use|cannot delete/i);
      
      // Document type should still exist
      cy.get('[data-testid="document-type-row"]')
        .should('contain.text', testData.documentTypes.minimal.name);
    });

    it('should handle server errors during delete', () => {
      // Mock server error
      cy.intercept('DELETE', `/api/document-types/${createdDocumentTypeId}`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('deleteServerError');
      
      cy.get(`[data-testid="button-delete-${createdDocumentTypeId}"]`).click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteServerError');
      
      // Should show generic error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Document Types in Consultant Context', () => {
    beforeEach(() => {
      loginAsAdmin();
      
      // Create some document types for testing
      createDocumentTypeAPI(testData.documentTypes.valid);
      createDocumentTypeAPI({
        name: 'Optional Document',
        description: 'An optional document type',
        isRequired: false,
        category: 'optional'
      });
    });

    it('should display required document types in consultant onboarding', () => {
      cy.visit(`${routes.consultants}/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
      
      // Required document types should be visible
      cy.get('[data-testid="required-documents"]').within(() => {
        cy.get('[data-testid="document-type-item"]')
          .should('contain.text', testData.documentTypes.valid.name);
      });
      
      // Upload button should be available for each required document
      cy.get(`[data-testid="upload-${testData.documentTypes.valid.name}"]`)
        .should('be.visible');
    });

    it('should show optional document types separately', () => {
      cy.visit(`${routes.consultants}/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
      
      // Optional documents section
      cy.get('[data-testid="optional-documents"]').within(() => {
        cy.get('[data-testid="document-type-item"]')
          .should('contain.text', 'Optional Document');
      });
    });

    it('should validate document uploads against document types', () => {
      cy.visit(`${routes.consultants}/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
      
      // Mock file upload
      cy.intercept('POST', '/api/objects/upload', {
        statusCode: 200,
        body: { data: { url: 'test-file.pdf', key: 'test-key' } }
      }).as('uploadFile');
      
      // Upload document
      const fileName = 'test-certificate.pdf';
      cy.get(`[data-testid="upload-${testData.documentTypes.valid.name}"]`).within(() => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from('test file content'),
          fileName,
          mimeType: 'application/pdf'
        }, { force: true });
      });
      
      cy.wait('@uploadFile');
      
      // Should show uploaded document
      cy.get('[data-testid="uploaded-document"]')
        .should('contain.text', fileName);
    });

    it('should handle document type status updates', () => {
      // Mock existing document
      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/documents`, {
        statusCode: 200,
        body: {
          data: [{
            id: 'doc-1',
            documentTypeId: 'dt-1',
            documentType: testData.documentTypes.valid,
            fileName: 'certificate.pdf',
            status: 'pending'
          }]
        }
      }).as('getConsultantDocsWithData');
      
      cy.visit(`${routes.consultants}/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocsWithData');
      
      // Admin should see status update options
      cy.get('[data-testid="document-status-select"]').click();
      cy.get('[data-testid="status-approved"]').click();
      
      // Should update document status
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|approved/i);
    });
  });

  describe('Responsive Design & Accessibility', () => {
    beforeEach(() => {
      loginAsAdmin();
    });

    it('should work properly on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
      
      // Mobile navigation should be accessible
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-nav"]').should('be.visible');
      
      // Table should be responsive or switch to card layout
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');
      
      // Create button should be accessible
      cy.get('[data-testid="button-create-document-type"]')
        .should('be.visible')
        .and('not.be.covered');
    });

    it('should work properly on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
      
      // Layout should adapt to tablet size
      cy.get('[data-testid="document-types-table"]')
        .should('be.visible');
      
      // All actions should be accessible
      cy.get('[data-testid="button-create-document-type"]').click();
      cy.get('[data-testid="create-document-type-form"]')
        .should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
      
      // Tab through main navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');
      
      // Create document type form keyboard navigation
      cy.get('[data-testid="button-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').focus().tab();
      cy.focused().should('have.attr', 'data-testid', 'textarea-description');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'checkbox-required');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
      
      // Main content should have proper ARIA
      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table');
      
      // Buttons should have proper labels
      cy.get('[data-testid="button-create-document-type"]')
        .should('have.attr', 'aria-label');
      
      // Form elements should have proper ARIA
      cy.get('[data-testid="button-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'aria-required', 'true');
    });

    it('should handle screen reader accessibility', () => {
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
      
      // Page should have proper heading structure
      cy.get('h1').should('exist').and('be.visible');
      
      // Table should have proper headers
      cy.get('[data-testid="document-types-table"]').within(() => {
        cy.get('th').should('have.attr', 'scope', 'col');
      });
      
      // Form should have proper labels
      cy.get('[data-testid="button-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="textarea-description"]').should('have.attr', 'aria-describedby');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    beforeEach(() => {
      loginAsAdmin();
    });

    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('GET', apiEndpoints.documentTypes, { forceNetworkError: true }).as('networkError');
      
      cy.visit(routes.documentTypes);
      cy.wait('@networkError');
      
      // Should show network error message
      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
      
      // Should provide retry option
      cy.get('[data-testid="button-retry"]')
        .should('be.visible');
    });

    it('should handle unauthorized access', () => {
      // Mock unauthorized response
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedError');
      
      cy.visit(routes.documentTypes);
      cy.wait('@unauthorizedError');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should handle forbidden access', () => {
      // Mock forbidden response
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('forbiddenError');
      
      cy.visit(routes.documentTypes);
      cy.wait('@forbiddenError');
      
      // Should show access denied message
      cy.get('[data-testid="access-denied"]')
        .should('be.visible')
        .and('contain.text', /access denied|forbidden/i);
    });

    it('should handle malformed API responses', () => {
      // Mock malformed response
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { invalid: 'response' }
      }).as('malformedResponse');
      
      cy.visit(routes.documentTypes);
      cy.wait('@malformedResponse');
      
      // Should show error state
      cy.get('[data-testid="data-error"]')
        .should('be.visible')
        .and('contain.text', /error loading/i);
    });

    it('should handle concurrent modification conflicts', () => {
      // Create document type
      createDocumentTypeAPI(testData.documentTypes.valid).then((response) => {
        const docTypeId = response.body.data.id;
        
        cy.visit(routes.documentTypes);
        cy.wait('@getDocumentTypes');
        
        // Start editing
        cy.get(`[data-testid="button-edit-${docTypeId}"]`).click();
        
        // Mock conflict error
        cy.intercept('PATCH', `/api/document-types/${docTypeId}`, {
          statusCode: 409,
          body: { error: 'Document type was modified by another user' }
        }).as('conflictError');
        
        cy.get('[data-testid="input-name"]')
          .clear()
          .type('Modified Name');
        
        cy.get('[data-testid="button-save"]').click();
        cy.wait('@conflictError');
        
        // Should show conflict resolution options
        cy.get('[data-testid="conflict-resolution"]')
          .should('be.visible')
          .and('contain.text', /conflict|modified/i);
      });
    });

    it('should handle large datasets performance', () => {
      // Mock very large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-type-${i}`,
        name: `Document Type ${i + 1}`,
        description: `Description for document type ${i + 1}`,
        isRequired: i % 2 === 0,
        category: 'certification'
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: largeDataset.slice(0, 50), total: 1000, page: 1, limit: 50 }
      }).as('getLargeDataset');
      
      cy.visit(routes.documentTypes);
      cy.wait('@getLargeDataset');
      
      // Should handle large dataset without performance issues
      cy.get('[data-testid="document-types-table"]')
        .should('be.visible');
      
      // Virtual scrolling or pagination should work
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', '1-50 of 1000');
      
      // Search should still work efficiently
      cy.get('[data-testid="input-search"]')
        .type('Document Type 1{enter}');
      
      // Results should filter quickly
      cy.get('[data-testid="document-type-row"]')
        .should('have.length.lessThan', 50);
    });
  });
});
