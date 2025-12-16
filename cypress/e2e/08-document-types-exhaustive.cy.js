describe('Document Types Feature - Exhaustive Tests', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    documentTypes: {
      valid: {
        name: 'Medical License',
        description: 'Required medical license for practicing physicians',
        category: 'Licensing',
        isRequired: true,
        expirationRequired: true,
        allowMultiple: false
      },
      update: {
        name: 'Updated Medical License',
        description: 'Updated description for medical license',
        category: 'Updated Category',
        isRequired: false,
        expirationRequired: false,
        allowMultiple: true
      },
      invalid: {
        emptyName: '',
        longName: 'A'.repeat(256),
        longDescription: 'A'.repeat(1001),
        specialCharacters: '!@#$%^&*()',
        numbers: '123456789',
        spaces: '   ',
        sqlInjection: "'; DROP TABLE document_types; --"
      },
      bulkCreate: [
        { name: 'Certification A', description: 'First certification', category: 'Certifications' },
        { name: 'Certification B', description: 'Second certification', category: 'Certifications' },
        { name: 'Training Record', description: 'Training completion record', category: 'Training' }
      ]
    },
    consultant: {
      id: 'ci-test-consultant'
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultantDocuments: (consultantId) => `/api/consultants/${consultantId}/documents`,
    login: '/api/auth/login',
    user: '/api/auth/user'
  };

  const routes = {
    login: '/login',
    dashboard: '/dashboard',
    documentTypes: '/admin/document-types',
    consultantProfile: (id) => `/consultants/${id}/profile`,
    consultantDocuments: (id) => `/consultants/${id}/documents`
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin
    cy.visit(routes.login);
    cy.get('[data-testid="input-email"]').type(testData.admin.email);
    cy.get('[data-testid="input-password"]').type(testData.admin.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('include', '/dashboard');
    
    // Setup API interceptors
    cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
    cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
    cy.intercept('PATCH', '/api/document-types/*').as('updateDocumentType');
    cy.intercept('DELETE', '/api/document-types/*').as('deleteDocumentType');
  });

  describe('Document Types List Page - UI & Layout', () => {
    beforeEach(() => {
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
    });

    it('should display complete document types page layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'Document Types');
      
      // Action buttons
      cy.get('[data-testid="button-add-document-type"]')
        .should('be.visible')
        .and('contain.text', 'Add Document Type');
      
      // Search and filters
      cy.get('[data-testid="search-document-types"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
      
      // Data table
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      
      // Table headers
      const expectedHeaders = ['Name', 'Description', 'Category', 'Required', 'Expiration Required', 'Allow Multiple', 'Actions'];
      expectedHeaders.forEach(header => {
        cy.get('[data-testid="table-header"]').should('contain.text', header);
      });
    });

    it('should display empty state when no document types exist', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        statusCode: 200, 
        body: { data: [], total: 0 } 
      }).as('getEmptyDocumentTypes');
      
      cy.reload();
      cy.wait('@getEmptyDocumentTypes');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-title"]')
        .should('contain.text', 'No Document Types');
      cy.get('[data-testid="empty-state-description"]')
        .should('contain.text', 'Get started by creating your first document type');
      cy.get('[data-testid="empty-state-action"]')
        .should('contain.text', 'Add Document Type');
    });

    it('should handle loading states properly', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        delay: 2000,
        statusCode: 200, 
        body: { data: [], total: 0 } 
      }).as('getSlowDocumentTypes');
      
      cy.reload();
      
      // Loading spinner should be visible
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-text"]')
        .should('contain.text', 'Loading document types...');
      
      cy.wait('@getSlowDocumentTypes');
      
      // Loading should disappear
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should display pagination when data exceeds page limit', () => {
      const mockData = Array.from({ length: 25 }, (_, i) => ({
        id: `doc-type-${i}`,
        name: `Document Type ${i + 1}`,
        description: `Description for document type ${i + 1}`,
        category: 'Test Category',
        isRequired: i % 2 === 0,
        expirationRequired: i % 3 === 0,
        allowMultiple: i % 4 === 0
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: mockData.slice(0, 10), total: 25, page: 1, limit: 10 }
      }).as('getPaginatedDocumentTypes');
      
      cy.reload();
      cy.wait('@getPaginatedDocumentTypes');
      
      // Pagination controls
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Showing 1-10 of 25');
      cy.get('[data-testid="pagination-next"]').should('be.enabled');
      cy.get('[data-testid="pagination-previous"]').should('be.disabled');
    });
  });

  describe('Document Types Search & Filtering', () => {
    beforeEach(() => {
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
    });

    it('should search document types by name', () => {
      const searchTerm = 'License';
      
      cy.intercept('GET', `${apiEndpoints.documentTypes}*search*`, {
        statusCode: 200,
        body: {
          data: [{ 
            id: '1', 
            name: 'Medical License', 
            description: 'Medical license description',
            category: 'Licensing' 
          }],
          total: 1
        }
      }).as('searchDocumentTypes');
      
      cy.get('[data-testid="search-document-types"]')
        .type(searchTerm);
      
      cy.wait('@searchDocumentTypes');
      
      cy.get('[data-testid="table-row"]').should('have.length', 1);
      cy.get('[data-testid="table-row"]').first()
        .should('contain.text', 'Medical License');
    });

    it('should filter by category', () => {
      cy.get('[data-testid="filter-category"]').click();
      cy.get('[data-testid="category-option-licensing"]').click();
      
      cy.intercept('GET', `${apiEndpoints.documentTypes}*category=licensing*`, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('filterByCategory');
      
      cy.wait('@filterByCategory');
    });

    it('should filter by required status', () => {
      cy.get('[data-testid="filter-required"]').click();
      cy.get('[data-testid="required-option-true"]').click();
      
      cy.intercept('GET', `${apiEndpoints.documentTypes}*required=true*`, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('filterByRequired');
      
      cy.wait('@filterByRequired');
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get('[data-testid="search-document-types"]').type('test');
      cy.get('[data-testid="filter-category"]').click();
      cy.get('[data-testid="category-option-licensing"]').click();
      
      // Clear filters
      cy.get('[data-testid="clear-filters"]').click();
      
      cy.get('[data-testid="search-document-types"]').should('have.value', '');
      cy.get('[data-testid="filter-category"]').should('contain.text', 'All Categories');
    });

    it('should handle no search results', () => {
      cy.intercept('GET', `${apiEndpoints.documentTypes}*search*`, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('noSearchResults');
      
      cy.get('[data-testid="search-document-types"]')
        .type('nonexistentdocument');
      
      cy.wait('@noSearchResults');
      
      cy.get('[data-testid="no-results"]').should('be.visible');
      cy.get('[data-testid="no-results-message"]')
        .should('contain.text', 'No document types found');
    });
  });

  describe('Create Document Type - Form Validation & Submission', () => {
    beforeEach(() => {
      cy.visit(routes.documentTypes);
      cy.get('[data-testid="button-add-document-type"]').click();
    });

    it('should display create document type modal with all form fields', () => {
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Create Document Type');
      
      // Form fields
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="textarea-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="input-category"]')
        .should('be.visible');
      
      cy.get('[data-testid="checkbox-required"]')
        .should('be.visible');
      
      cy.get('[data-testid="checkbox-expiration-required"]')
        .should('be.visible');
      
      cy.get('[data-testid="checkbox-allow-multiple"]')
        .should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('contain.text', 'Cancel');
      
      cy.get('[data-testid="button-create"]')
        .should('be.visible')
        .and('contain.text', 'Create Document Type');
    });

    it('should validate required fields', () => {
      // Try to submit without filling required fields
      cy.get('[data-testid="button-create"]').click();
      
      // Name field validation
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', 'Name is required');
      
      // Form should not submit
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
    });

    it('should validate name field constraints', () => {
      // Test empty name
      cy.get('[data-testid="input-name"]').focus().blur();
      cy.get('[data-testid="error-name"]')
        .should('contain.text', 'Name is required');
      
      // Test name too long
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(testData.documentTypes.invalid.longName);
      cy.get('[data-testid="button-create"]').click();
      cy.get('[data-testid="error-name"]')
        .should('contain.text', 'Name must be less than 255 characters');
      
      // Test name with only spaces
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(testData.documentTypes.invalid.spaces);
      cy.get('[data-testid="button-create"]').click();
      cy.get('[data-testid="error-name"]')
        .should('contain.text', 'Name cannot be empty');
    });

    it('should validate description field constraints', () => {
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      // Test description too long
      cy.get('[data-testid="textarea-description"]')
        .type(testData.documentTypes.invalid.longDescription);
      
      cy.get('[data-testid="button-create"]').click();
      cy.get('[data-testid="error-description"]')
        .should('contain.text', 'Description must be less than 1000 characters');
    });

    it('should handle special characters and SQL injection attempts', () => {
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.invalid.sqlInjection);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.documentTypes.invalid.sqlInjection);
      
      cy.get('[data-testid="button-create"]').click();
      
      // Should either sanitize input or show validation error
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-name"]').length > 0) {
          cy.get('[data-testid="error-name"]')
            .should('contain.text', 'Invalid characters detected');
        } else {
          // Input was sanitized, form should proceed
          cy.wait('@createDocumentType');
        }
      });
    });

    it('should successfully create document type with valid data', () => {
      const newDocumentType = testData.documentTypes.valid;
      
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { 
          id: 'new-doc-type-id',
          ...newDocumentType,
          createdAt: new Date().toISOString()
        }
      }).as('createDocumentTypeSuccess');
      
      // Fill form
      cy.get('[data-testid="input-name"]')
        .type(newDocumentType.name);
      
      cy.get('[data-testid="textarea-description"]')
        .type(newDocumentType.description);
      
      cy.get('[data-testid="input-category"]')
        .type(newDocumentType.category);
      
      if (newDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-required"]').check();
      }
      
      if (newDocumentType.expirationRequired) {
        cy.get('[data-testid="checkbox-expiration-required"]').check();
      }
      
      if (newDocumentType.allowMultiple) {
        cy.get('[data-testid="checkbox-allow-multiple"]').check();
      }
      
      // Submit form
      cy.get('[data-testid="button-create"]').click();
      
      cy.wait('@createDocumentTypeSuccess');
      
      // Modal should close
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');
      
      // Success message
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', 'Document type created successfully');
      
      // Should reload the list
      cy.wait('@getDocumentTypes');
    });

    it('should handle server errors during creation', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createDocumentTypeError');
      
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      cy.get('[data-testid="button-create"]').click();
      
      cy.wait('@createDocumentTypeError');
      
      // Error message should be displayed
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', 'Failed to create document type');
      
      // Modal should remain open
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
    });

    it('should handle duplicate name validation', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 409,
        body: { error: 'Document type with this name already exists' }
      }).as('createDocumentTypeDuplicate');
      
      cy.get('[data-testid="input-name"]')
        .type('Existing Document Type');
      
      cy.get('[data-testid="button-create"]').click();
      
      cy.wait('@createDocumentTypeDuplicate');
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', 'Document type with this name already exists');
    });

    it('should cancel creation and close modal', () => {
      cy.get('[data-testid="input-name"]')
        .type('Some name');
      
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');
      
      // No API call should be made
      cy.get('@createDocumentType.all').should('have.length', 0);
    });

    it('should close modal when clicking outside', () => {
      cy.get('[data-testid="modal-overlay"]').click({ force: true });
      
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');
    });

    it('should close modal with escape key', () => {
      cy.get('[data-testid="modal-create-document-type"]')
        .type('{esc}');
      
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');
    });
  });

  describe('Edit Document Type - Form Validation & Updates', () => {
    const existingDocumentType = {
      id: 'doc-type-1',
      name: 'Original Name',
      description: 'Original description',
      category: 'Original Category',
      isRequired: true,
      expirationRequired: false,
      allowMultiple: true
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { 
          data: [existingDocumentType],
          total: 1 
        }
      }).as('getDocumentTypesWithData');
      
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypesWithData');
      
      // Click edit button on first row
      cy.get('[data-testid="button-edit-doc-type-1"]').click();
    });

    it('should display edit modal with pre-filled form', () => {
      cy.get('[data-testid="modal-edit-document-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Edit Document Type');
      
      // Check pre-filled values
      cy.get('[data-testid="input-name"]')
        .should('have.value', existingDocumentType.name);
      
      cy.get('[data-testid="textarea-description"]')
        .should('have.value', existingDocumentType.description);
      
      cy.get('[data-testid="input-category"]')
        .should('have.value', existingDocumentType.category);
      
      if (existingDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-required"]')
          .should('be.checked');
      }
      
      if (existingDocumentType.expirationRequired) {
        cy.get('[data-testid="checkbox-expiration-required"]')
          .should('be.checked');
      }
      
      if (existingDocumentType.allowMultiple) {
        cy.get('[data-testid="checkbox-allow-multiple"]')
          .should('be.checked');
      }
    });

    it('should successfully update document type', () => {
      const updatedData = testData.documentTypes.update;
      
      cy.intercept('PATCH', `/api/document-types/${existingDocumentType.id}`, {
        statusCode: 200,
        body: {
          ...existingDocumentType,
          ...updatedData,
          updatedAt: new Date().toISOString()
        }
      }).as('updateDocumentTypeSuccess');
      
      // Update form fields
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(updatedData.name);
      
      cy.get('[data-testid="textarea-description"]')
        .clear()
        .type(updatedData.description);
      
      cy.get('[data-testid="input-category"]')
        .clear()
        .type(updatedData.category);
      
      // Toggle checkboxes
      if (!updatedData.isRequired) {
        cy.get('[data-testid="checkbox-required"]').uncheck();
      }
      
      if (updatedData.expirationRequired) {
        cy.get('[data-testid="checkbox-expiration-required"]').check();
      }
      
      // Submit update
      cy.get('[data-testid="button-update"]').click();
      
      cy.wait('@updateDocumentTypeSuccess');
      
      // Modal should close
      cy.get('[data-testid="modal-edit-document-type"]')
        .should('not.exist');
      
      // Success message
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', 'Document type updated successfully');
    });

    it('should validate form fields during edit', () => {
      // Clear name field
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-update"]').click();
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', 'Name is required');
    });

    it('should handle update server errors', () => {
      cy.intercept('PATCH', `/api/document-types/${existingDocumentType.id}`, {
        statusCode: 500,
        body: { error: 'Failed to update' }
      }).as('updateDocumentTypeError');
      
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Updated Name');
      
      cy.get('[data-testid="button-update"]').click();
      
      cy.wait('@updateDocumentTypeError');
      
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', 'Failed to update document type');
    });
  });

  describe('Delete Document Type - Confirmation & Error Handling', () => {
    const documentTypeToDelete = {
      id: 'doc-type-delete',
      name: 'Document to Delete',
      description: 'This will be deleted',
      category: 'Test'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { 
          data: [documentTypeToDelete],
          total: 1 
        }
      }).as('getDocumentTypesForDelete');
      
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypesForDelete');
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="button-delete-doc-type-delete"]').click();
      
      cy.get('[data-testid="modal-confirm-delete"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-delete-title"]')
        .should('contain.text', 'Delete Document Type');
      
      cy.get('[data-testid="confirm-delete-message"]')
        .should('contain.text', 'Are you sure you want to delete')
        .and('contain.text', documentTypeToDelete.name);
      
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', 'Delete');
      
      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', 'Cancel');
    });

    it('should successfully delete document type', () => {
      cy.intercept('DELETE', `/api/document-types/${documentTypeToDelete.id}`, {
        statusCode: 200,
        body: { message: 'Document type deleted successfully' }
      }).as('deleteDocumentTypeSuccess');
      
      cy.get('[data-testid="button-delete-doc-type-delete"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentTypeSuccess');
      
      // Success message
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', 'Document type deleted successfully');
      
      // Should reload the list
      cy.wait('@getDocumentTypes');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="button-delete-doc-type-delete"]').click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      cy.get('[data-testid="modal-confirm-delete"]')
        .should('not.exist');
      
      // No API call should be made
      cy.get('@deleteDocumentType.all').should('have.length', 0);
    });

    it('should handle delete server errors', () => {
      cy.intercept('DELETE', `/api/document-types/${documentTypeToDelete.id}`, {
        statusCode: 500,
        body: { error: 'Failed to delete' }
      }).as('deleteDocumentTypeError');
      
      cy.get('[data-testid="button-delete-doc-type-delete"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentTypeError');
      
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', 'Failed to delete document type');
    });

    it('should handle constraint violations (document type in use)', () => {
      cy.intercept('DELETE', `/api/document-types/${documentTypeToDelete.id}`, {
        statusCode: 409,
        body: { error: 'Cannot delete document type as it is currently in use' }
      }).as('deleteDocumentTypeConstraint');
      
      cy.get('[data-testid="button-delete-doc-type-delete"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentTypeConstraint');
      
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', 'Cannot delete document type as it is currently in use');
    });
  });

  describe('Document Types Integration with Consultant Documents', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'doc-type-1',
              name: 'Medical License',
              description: 'Required medical license',
              category: 'Licensing',
              isRequired: true,
              expirationRequired: true,
              allowMultiple: false
            },
            {
              id: 'doc-type-2',
              name: 'Training Certificate',
              description: 'Training completion certificate',
              category: 'Training',
              isRequired: false,
              expirationRequired: false,
              allowMultiple: true
            }
          ],
          total: 2
        }
      }).as('getDocumentTypesForConsultant');
    });

    it('should display document types in consultant document upload', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getConsultantDocuments');
      
      cy.visit(routes.consultantDocuments(testData.consultant.id));
      cy.wait('@getConsultantDocuments');
      cy.wait('@getDocumentTypesForConsultant');
      
      // Document upload form should show document types
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-doc-type-1"]')
        .should('contain.text', 'Medical License');
      cy.get('[data-testid="option-doc-type-2"]')
        .should('contain.text', 'Training Certificate');
    });

    it('should show required document types prominently', () => {
      cy.visit(routes.consultantDocuments(testData.consultant.id));
      cy.wait('@getDocumentTypesForConsultant');
      
      // Required document types should be marked
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-doc-type-1"]')
        .should('contain.text', 'Medical License')
        .and('contain.text', 'Required');
    });

    it('should validate expiration date for documents requiring it', () => {
      cy.intercept('POST', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 400,
        body: { error: 'Expiration date is required for this document type' }
      }).as('uploadDocumentMissingExpiration');
      
      cy.visit(routes.consultantDocuments(testData.consultant.id));
      cy.wait('@getDocumentTypesForConsultant');
      
      // Select document type that requires expiration
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-doc-type-1"]').click();
      
      // Upload file without setting expiration date
      const fileName = 'test-document.pdf';
      cy.get('[data-testid="file-upload"]').selectFile({
        contents: Cypress.Buffer.from('test file content'),
        fileName: fileName,
        mimeType: 'application/pdf',
      });
      
      cy.get('[data-testid="button-upload"]').click();
      
      cy.wait('@uploadDocumentMissingExpiration');
      
      cy.get('[data-testid="error-expiration"]')
        .should('be.visible')
        .and('contain.text', 'Expiration date is required');
    });
  });

  describe('Document Types - Accessibility & Responsive Design', () => {
    beforeEach(() => {
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypes');
    });

    it('should have proper accessibility attributes', () => {
      // Page title
      cy.get('h1').should('have.attr', 'id');
      
      // Table accessibility
      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table')
        .and('have.attr', 'aria-label');
      
      // Action buttons accessibility
      cy.get('[data-testid="button-add-document-type"]')
        .should('have.attr', 'aria-label')
        .and('not.have.attr', 'aria-disabled', 'true');
      
      // Form inputs accessibility
      cy.get('[data-testid="search-document-types"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');
    });

    it('should be keyboard navigable', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'button-add-document-type');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-document-types');
      
      // Enter should open create modal
      cy.get('[data-testid="button-add-document-type"]').focus().type('{enter}');
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
    });

    it('should work properly on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // Mobile responsive table
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      
      // Mobile menu/hamburger if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
          cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
        }
      });
      
      // Form should be responsive
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible')
        .and('have.css', 'width');
    });

    it('should work properly on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');
    });
  });

  describe('Document Types - Performance & Error Recovery', () => {
    it('should handle API timeout gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        delay: 30000,
        forceNetworkError: true
      }).as('getDocumentTypesTimeout');
      
      cy.visit(routes.documentTypes);
      
      cy.get('[data-testid="error-message"]', { timeout: 35000 })
        .should('be.visible')
        .and('contain.text', 'Failed to load document types');
      
      cy.get('[data-testid="button-retry"]')
        .should('be.visible')
        .and('contain.text', 'Retry');
    });

    it('should handle network errors with retry functionality', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        forceNetworkError: true
      }).as('getDocumentTypesNetworkError');
      
      cy.visit(routes.documentTypes);
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible');
      
      // Mock successful retry
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getDocumentTypesRetrySuccess');
      
      cy.get('[data-testid="button-retry"]').click();
      cy.wait('@getDocumentTypesRetrySuccess');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });

    it('should handle concurrent modifications gracefully', () => {
      const documentType = {
        id: 'concurrent-test',
        name: 'Concurrent Test',
        description: 'Test concurrent modifications'
      };
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: [documentType], total: 1 }
      }).as('getDocumentTypesForConcurrency');
      
      cy.visit(routes.documentTypes);
      cy.wait('@getDocumentTypesForConcurrency');
      
      // Simulate concurrent modification error
      cy.intercept('PATCH', `/api/document-types/${documentType.id}`, {
        statusCode: 409,
        body: { error: 'Document type was modified by another user' }
      }).as('updateDocumentTypeConcurrency');
      
      cy.get('[data-testid="button-edit-concurrent-test"]').click();
      cy.get('[data-testid="input-name"]').clear().type('Modified Name');
      cy.get('[data-testid="button-update"]').click();
      
      cy.wait('@updateDocumentTypeConcurrency');
      
      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', 'Document type was modified by another user');
    });
  });

  describe('Document Types - Edge Cases & Security', () => {
    it('should handle very large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-type-${i}`,
        name: `Document Type ${i}`,
        description: `Description ${i}`,
        category: `Category ${i % 10}`
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { 
          data: largeDataset.slice(0, 50), 
          total: 1000,
          page: 1,
          limit: 50
        }
      }).as('getLargeDocumentTypeDataset');
      
      cy.visit(routes.documentTypes);
      cy.wait('@getLargeDocumentTypeDataset');
      
      // Should render efficiently
      cy.get('[data-testid="table-row"]').should('have.length', 50);
      cy.get('[data-testid="pagination-info"]')
        .should('contain.text', 'Showing 1-50 of 1000');
    });

    it('should sanitize XSS attempts in form inputs', () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      cy.get('[data-testid="button-add-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').type(xssPayload);
      cy.get('[data-testid="textarea-description"]').type(xssPayload);
      
      // XSS payload should be escaped or sanitized
      cy.get('[data-testid="input-name"]')
        .should('not.contain.html', '<script>');
      
      cy.get('[data-testid="textarea-description"]')
        .should('not.contain.html', '<script>');
    });

    it('should handle Unicode characters properly', () => {
      const unicodeText = {
        name: 'Документ типа 文档类型 🏥',
        description: 'Description with émojis 😀 and spëcial chäräctërs'
      };
      
      cy.get('[data-testid="button-add-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').type(unicodeText.name);
      cy.get('[data-testid="textarea-description"]').type(unicodeText.description);
      
      // Should handle Unicode properly
      cy.get('[data-testid="input-name"]')
        .should('have.value', unicodeText.name);
      cy.get('[data-testid="textarea-description"]')
        .should('have.value', unicodeText.description);
    });

    it('should validate CSRF protection', () => {
      // This test would need to be coordinated with backend CSRF implementation
      cy.intercept('POST', apiEndpoints.documentTypes, (req) => {
        // Check for CSRF token in headers
        expect(req.headers).to.have.property('x-csrf-token');
      }).as('createWithCSRF');
      
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type('CSRF Test');
      cy.get('[data-testid="button-create"]').click();
    });
  });
});
