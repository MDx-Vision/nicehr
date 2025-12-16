<<<<<<< Updated upstream
describe('Document Types Management - Exhaustive Tests', () => {
  const testData = {
    validDocumentType: {
      name: 'Test Document Type',
      description: 'A test document type for validation',
      isRequired: true,
      allowMultiple: false,
      category: 'Certification'
    },
    updateDocumentType: {
      name: 'Updated Document Type',
      description: 'Updated description for testing',
      isRequired: false,
      allowMultiple: true,
      category: 'License'
    },
    invalidDocumentType: {
      name: '', // Empty name should fail validation
      description: 'Invalid document type with empty name'
    },
    longNameDocumentType: {
      name: 'A'.repeat(256), // Test name length limits
      description: 'Testing maximum name length validation'
    },
    duplicateDocumentType: {
      name: 'Duplicate Name Test',
      description: 'Testing duplicate name validation'
    },
    categories: ['Certification', 'License', 'Training', 'Compliance', 'Other'],
    ciData: {
      user: { email: 'test@example.com', password: 'test123' },
      consultant: 'ci-test-consultant'
=======
describe('Document Types System - Exhaustive Tests', () => {
  const testData = {
    validDocumentType: {
      name: 'Medical License',
      description: 'Professional medical license documentation',
      category: 'license',
      required: true,
      expirationRequired: true,
      fileTypes: ['pdf', 'jpg', 'png']
    },
    duplicateDocumentType: {
      name: 'Medical License',
      description: 'Duplicate name test',
      category: 'certification',
      required: false,
      expirationRequired: false,
      fileTypes: ['pdf']
    },
    updateDocumentType: {
      name: 'Updated Medical Certificate',
      description: 'Updated description for medical certificate',
      category: 'certification',
      required: false,
      expirationRequired: true,
      fileTypes: ['pdf', 'doc', 'docx']
    },
    invalidData: {
      emptyName: '',
      longName: 'A'.repeat(256),
      longDescription: 'A'.repeat(1001),
      invalidCategory: 'invalid-category',
      invalidFileType: 'exe'
    },
    ciUser: {
      email: 'test@example.com',
      password: 'test123'
>>>>>>> Stashed changes
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
<<<<<<< Updated upstream
    consultantDocuments: (consultantId) => `/api/consultants/${consultantId}/documents`
=======
    consultants: '/api/consultants',
    consultantDocuments: (id) => `/api/consultants/${id}/documents`
>>>>>>> Stashed changes
  };

  beforeEach(() => {
    // Clear auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
<<<<<<< Updated upstream
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.ciData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.ciData.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Document Types Page - UI Components & Layout', () => {
=======

    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]', { timeout: 10000 })
      .should('be.visible')
      .type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]')
      .type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for login to complete
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.get('[data-testid="nav-main"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Document Types List Page - UI and Layout', () => {
>>>>>>> Stashed changes
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display complete document types page layout', () => {
      // Page header and title
<<<<<<< Updated upstream
      cy.get('h1, h2').should('contain.text', /document types/i);
      cy.title().should('contain', 'Document Types');

      // Main container
      cy.get('[data-testid="document-types-container"]', { timeout: 10000 })
=======
      cy.get('[data-testid="page-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('h1, h2').should('contain.text', /document types/i);

      // Main content area
      cy.get('[data-testid="document-types-container"]')
>>>>>>> Stashed changes
        .should('be.visible');

      // Action buttons
      cy.get('[data-testid="button-add-document-type"]')
        .should('be.visible')
        .and('contain.text', /add|create|new/i);

<<<<<<< Updated upstream
      // Search and filter controls
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          cy.get('[data-testid="search-document-types"]').should('be.visible');
        }
        if ($body.find('[data-testid="filter-category"]').length > 0) {
          cy.get('[data-testid="filter-category"]').should('be.visible');
        }
      });

      // Document types list/table
      cy.get('[data-testid="document-types-list"], [data-testid="document-types-table"]')
        .should('be.visible');
    });

    it('should have proper accessibility features', () => {
      // ARIA labels and roles
      cy.get('[data-testid="button-add-document-type"]')
        .should('have.attr', 'aria-label');

      // Keyboard navigation
      cy.get('[data-testid="button-add-document-type"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'button-add-document-type');

      // Screen reader support
      cy.get('h1, h2').should('have.attr', 'id').or('have.attr', 'aria-label');
    });

    it('should display document types data correctly', () => {
      cy.get('[data-testid="document-types-list"] [data-testid="document-type-item"], [data-testid="document-types-table"] tbody tr')
        .should('have.length.at.least', 0);

      // Check for empty state if no document types
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="empty-state"]').length > 0) {
          cy.get('[data-testid="empty-state"]')
            .should('be.visible')
            .and('contain.text', /no document types/i);
        } else {
          // Check document type item structure
          cy.get('[data-testid="document-type-item"], tbody tr').first().within(() => {
            cy.get('[data-testid="document-type-name"]').should('be.visible');
            cy.get('[data-testid="document-type-description"]').should('be.visible');
            cy.get('[data-testid="button-edit-document-type"]').should('be.visible');
            cy.get('[data-testid="button-delete-document-type"]').should('be.visible');
          });
=======
      // Search and filter elements
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          cy.get('[data-testid="search-document-types"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
        
        if ($body.find('[data-testid="filter-category"]').length > 0) {
          cy.get('[data-testid="filter-category"]').should('be.visible');
        }

        if ($body.find('[data-testid="filter-required"]').length > 0) {
          cy.get('[data-testid="filter-required"]').should('be.visible');
        }
      });

      // Table or list view
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="document-types-table"]').length > 0) {
          cy.get('[data-testid="document-types-table"]').should('be.visible');
          
          // Table headers
          cy.get('th').should('contain.text', /name/i);
          cy.get('th').should('contain.text', /category/i);
          cy.get('th').should('contain.text', /required/i);
          cy.get('th').should('contain.text', /actions/i);
        } else {
          cy.get('[data-testid="document-types-list"]').should('be.visible');
>>>>>>> Stashed changes
        }
      });
    });

<<<<<<< Updated upstream
    it('should handle responsive layout correctly', () => {
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="document-types-container"]').should('be.visible');
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');

      // Tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="document-types-container"]').should('be.visible');

      // Desktop view
      cy.viewport(1280, 720);
      cy.get('[data-testid="document-types-container"]').should('be.visible');
    });
  });

  describe('Create Document Type - Form Validation & UI', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      cy.get('[data-testid="button-add-document-type"]').click();
    });

    it('should display create document type form correctly', () => {
      // Modal or page should be visible
      cy.get('[data-testid="create-document-type-modal"], [data-testid="create-document-type-form"]')
        .should('be.visible');

      // Form fields
=======
    it('should handle empty state correctly', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getEmptyDocumentTypes');
      cy.reload();
      cy.wait('@getEmptyDocumentTypes');

      // Check empty state
      cy.get('[data-testid="empty-state"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', /no document types/i);
      
      cy.get('[data-testid="button-add-document-type"]')
        .should('be.visible');
    });

    it('should display document types data correctly', () => {
      // Mock document types data
      const mockDocumentTypes = [
        {
          id: 1,
          name: 'Medical License',
          description: 'Professional medical license',
          category: 'license',
          required: true,
          expirationRequired: true,
          fileTypes: ['pdf', 'jpg'],
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Background Check',
          description: 'Criminal background verification',
          category: 'verification',
          required: true,
          expirationRequired: false,
          fileTypes: ['pdf'],
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];

      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getMockDocumentTypes');
      cy.reload();
      cy.wait('@getMockDocumentTypes');

      // Verify data display
      cy.get('[data-testid="document-type-row-1"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="document-type-name"]')
            .should('contain.text', 'Medical License');
          cy.get('[data-testid="document-type-category"]')
            .should('contain.text', 'license');
          cy.get('[data-testid="document-type-required"]')
            .should('contain.text', /yes|true|required/i);
        });

      cy.get('[data-testid="document-type-row-2"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="document-type-name"]')
            .should('contain.text', 'Background Check');
          cy.get('[data-testid="document-type-category"]')
            .should('contain.text', 'verification');
        });
    });
  });

  describe('Search and Filter Functionality', () => {
    beforeEach(() => {
      const mockDocumentTypes = [
        { id: 1, name: 'Medical License', category: 'license', required: true },
        { id: 2, name: 'Nursing Certificate', category: 'certification', required: true },
        { id: 3, name: 'Background Check', category: 'verification', required: false },
        { id: 4, name: 'Drug Test', category: 'verification', required: true },
        { id: 5, name: 'Professional References', category: 'reference', required: false }
      ];

      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should filter document types by search query', () => {
      cy.get('[data-testid="search-document-types"]').then(($search) => {
        if ($search.length > 0) {
          cy.wrap($search)
            .type('medical')
            .should('have.value', 'medical');

          // Should show filtered results
          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 1)
            .and('contain.text', 'Medical License');

          // Clear search
          cy.get('[data-testid="search-document-types"]').clear();
          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 5);
        }
      });
    });

    it('should filter by category', () => {
      cy.get('[data-testid="filter-category"]').then(($filter) => {
        if ($filter.length > 0) {
          cy.wrap($filter).select('verification');

          // Should show only verification documents
          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 2);
          cy.get('[data-testid*="document-type-row"]')
            .should('contain.text', 'Background Check')
            .and('contain.text', 'Drug Test');

          // Reset filter
          cy.get('[data-testid="filter-category"]').select('all');
          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 5);
        }
      });
    });

    it('should filter by required status', () => {
      cy.get('[data-testid="filter-required"]').then(($filter) => {
        if ($filter.length > 0) {
          cy.wrap($filter).select('required');

          // Should show only required documents
          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 3);

          cy.wrap($filter).select('optional');

          // Should show only optional documents
          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 2);
        }
      });
    });

    it('should combine search and filters', () => {
      cy.get('body').then(($body) => {
        const hasSearch = $body.find('[data-testid="search-document-types"]').length > 0;
        const hasFilter = $body.find('[data-testid="filter-category"]').length > 0;

        if (hasSearch && hasFilter) {
          cy.get('[data-testid="search-document-types"]').type('check');
          cy.get('[data-testid="filter-category"]').select('verification');

          cy.get('[data-testid*="document-type-row"]')
            .should('have.length', 1)
            .and('contain.text', 'Background Check');
        }
      });
    });

    it('should handle no search results', () => {
      cy.get('[data-testid="search-document-types"]').then(($search) => {
        if ($search.length > 0) {
          cy.wrap($search).type('nonexistent-document-type');

          cy.get('[data-testid="no-results"]')
            .should('be.visible')
            .and('contain.text', /no results|not found/i);
        }
      });
    });
  });

  describe('Create Document Type Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open create document type modal/form', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Check if modal opens
      cy.get('[data-testid="modal-create-document-type"], [data-testid="form-create-document-type"]', { timeout: 10000 })
        .should('be.visible');

      // Form elements should be present
>>>>>>> Stashed changes
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-description"]')
        .should('be.visible');

      cy.get('[data-testid="select-category"]')
        .should('be.visible');

<<<<<<< Updated upstream
      cy.get('[data-testid="checkbox-is-required"]')
        .should('be.visible');

      cy.get('[data-testid="checkbox-allow-multiple"]')
        .should('be.visible');

      // Action buttons
      cy.get('[data-testid="button-submit"]')
        .should('be.visible')
        .and('contain.text', /create|save/i);
=======
      cy.get('[data-testid="checkbox-required"]')
        .should('be.visible');

      cy.get('[data-testid="checkbox-expiration-required"]')
        .should('be.visible');

      cy.get('[data-testid="button-submit"]')
        .should('be.visible')
        .and('contain.text', /create|save|add/i);
>>>>>>> Stashed changes

      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

    it('should validate required fields', () => {
<<<<<<< Updated upstream
      // Try to submit without filling required fields
      cy.get('[data-testid="button-submit"]').click();

      // Check for validation errors
      cy.get('[data-testid="error-name"], .error, .invalid')
        .should('be.visible')
        .and('contain.text', /required|name/i);

      // Form should not be submitted
      cy.get('[data-testid="create-document-type-modal"], [data-testid="create-document-type-form"]')
        .should('be.visible');
    });

    it('should validate name field constraints', () => {
      // Test empty name
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="input-description"]').click(); // Trigger blur
      cy.get('[data-testid="error-name"], .error').should('contain.text', /required/i);

      // Test minimum length
      cy.get('[data-testid="input-name"]').type('ab');
      cy.get('[data-testid="input-description"]').click();
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-name"]:contains("too short")').length > 0) {
          cy.get('[data-testid="error-name"]').should('contain.text', /short/i);
=======
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Try to submit without filling required fields
      cy.get('[data-testid="button-submit"]').click();

      // Should show validation errors
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      cy.get('[data-testid="error-category"]').then(($error) => {
        if ($error.length > 0) {
          cy.wrap($error).should('contain.text', /required/i);
>>>>>>> Stashed changes
        }
      });

      // Test maximum length
      cy.get('[data-testid="input-name"]').clear().type(testData.longNameDocumentType.name);
      cy.get('[data-testid="input-description"]').click();
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-name"]:contains("too long")').length > 0) {
          cy.get('[data-testid="error-name"]').should('contain.text', /long/i);
        }
      });

      // Test valid name
      cy.get('[data-testid="input-name"]').clear().type(testData.validDocumentType.name);
      cy.get('[data-testid="input-description"]').click();
      cy.get('[data-testid="error-name"]').should('not.exist');
    });

<<<<<<< Updated upstream
    it('should validate category selection', () => {
      // Open category dropdown
      cy.get('[data-testid="select-category"]').click();

      // Check available categories
      testData.categories.forEach(category => {
        cy.get(`[data-testid="option-${category.toLowerCase()}"], [value="${category}"]`)
          .should('be.visible');
      });

      // Select a category
      cy.get(`[data-testid="option-${testData.validDocumentType.category.toLowerCase()}"], [value="${testData.validDocumentType.category}"]`).click();

      // Verify selection
      cy.get('[data-testid="select-category"]')
        .should('contain.text', testData.validDocumentType.category);
    });

    it('should handle checkbox interactions correctly', () => {
      // Test is required checkbox
      cy.get('[data-testid="checkbox-is-required"]').should('not.be.checked');
      cy.get('[data-testid="checkbox-is-required"]').check();
      cy.get('[data-testid="checkbox-is-required"]').should('be.checked');
      cy.get('[data-testid="checkbox-is-required"]').uncheck();
      cy.get('[data-testid="checkbox-is-required"]').should('not.be.checked');

      // Test allow multiple checkbox
      cy.get('[data-testid="checkbox-allow-multiple"]').should('not.be.checked');
      cy.get('[data-testid="checkbox-allow-multiple"]').check();
      cy.get('[data-testid="checkbox-allow-multiple"]').should('be.checked');
      cy.get('[data-testid="checkbox-allow-multiple"]').uncheck();
      cy.get('[data-testid="checkbox-allow-multiple"]').should('not.be.checked');
    });

    it('should cancel form correctly', () => {
      // Fill some data
      cy.get('[data-testid="input-name"]').type(testData.validDocumentType.name);
      cy.get('[data-testid="input-description"]').type(testData.validDocumentType.description);

      // Cancel
      cy.get('[data-testid="button-cancel"]').click();

      // Form should be closed
      cy.get('[data-testid="create-document-type-modal"]').should('not.exist');
      
      // Should be back to document types list
      cy.url().should('include', '/admin/document-types');
    });
  });

  describe('Create Document Type - API Integration', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should create document type successfully with valid data', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { 
          id: 'new-doc-type-id',
          ...testData.validDocumentType,
          createdAt: new Date().toISOString()
        }
      }).as('createDocumentType');

      // Open create form
      cy.get('[data-testid="button-add-document-type"]').click();

      // Fill form
      cy.get('[data-testid="input-name"]').type(testData.validDocumentType.name);
      cy.get('[data-testid="input-description"]').type(testData.validDocumentType.description);
      cy.get('[data-testid="select-category"]').click();
      cy.get(`[data-testid="option-${testData.validDocumentType.category.toLowerCase()}"], [value="${testData.validDocumentType.category}"]`).click();
      
      if (testData.validDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-is-required"]').check();
      }
      if (testData.validDocumentType.allowMultiple) {
        cy.get('[data-testid="checkbox-allow-multiple"]').check();
      }

      // Submit form
      cy.get('[data-testid="button-submit"]').click();

      // Verify API call
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.validDocumentType.name,
          description: testData.validDocumentType.description,
          category: testData.validDocumentType.category,
          isRequired: testData.validDocumentType.isRequired,
          allowMultiple: testData.validDocumentType.allowMultiple
        });
      });

      // Verify success state
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible')
        .and('contain.text', /created|success/i);

      // Form should be closed
      cy.get('[data-testid="create-document-type-modal"]').should('not.exist');
    });

    it('should handle server validation errors', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { 
          error: 'Validation failed',
          details: { name: 'Document type name already exists' }
        }
      }).as('createDocumentTypeError');

      // Open create form
      cy.get('[data-testid="button-add-document-type"]').click();

      // Fill form with duplicate data
      cy.get('[data-testid="input-name"]').type(testData.duplicateDocumentType.name);
      cy.get('[data-testid="input-description"]').type(testData.duplicateDocumentType.description);
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-certification"], [value="Certification"]').click();

      // Submit form
      cy.get('[data-testid="button-submit"]').click();

      // Wait for error response
      cy.wait('@createDocumentTypeError');

      // Verify error display
      cy.get('[data-testid="error-message"], .error, .toast-error')
        .should('be.visible')
        .and('contain.text', /already exists|duplicate/i);

      // Form should remain open
      cy.get('[data-testid="create-document-type-modal"], [data-testid="create-document-type-form"]')
        .should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createDocumentTypeNetworkError');

      // Open create form and fill valid data
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type(testData.validDocumentType.name);
      cy.get('[data-testid="input-description"]').type(testData.validDocumentType.description);
      cy.get('[data-testid="select-category"]').click();
      cy.get('[data-testid="option-certification"], [value="Certification"]').click();

      // Submit form
      cy.get('[data-testid="button-submit"]').click();

      // Wait for error response
      cy.wait('@createDocumentTypeNetworkError');

      // Verify error handling
      cy.get('[data-testid="error-message"], .error, .toast-error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Edit Document Type - Form Validation & UI', () => {
    let existingDocumentType;

    beforeEach(() => {
      existingDocumentType = {
        id: 'existing-doc-type-id',
        name: 'Existing Document Type',
        description: 'Existing description',
        category: 'License',
        isRequired: false,
        allowMultiple: true
      };

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [existingDocumentType]
      }).as('getDocumentTypes');

=======
    it('should validate field lengths and formats', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Test name field validation
      cy.get('[data-testid="input-name"]')
        .type(testData.invalidData.longName)
        .blur();

      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /too long|maximum|255/i);

      // Test description field validation
      cy.get('[data-testid="textarea-description"]')
        .type(testData.invalidData.longDescription)
        .blur();

      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', /too long|maximum|1000/i);

      // Clear fields
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="textarea-description"]').clear();
    });

    it('should successfully create a new document type', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Fill form with valid data
      cy.get('[data-testid="input-name"]')
        .type(testData.validDocumentType.name);

      cy.get('[data-testid="textarea-description"]')
        .type(testData.validDocumentType.description);

      cy.get('[data-testid="select-category"]')
        .select(testData.validDocumentType.category);

      if (testData.validDocumentType.required) {
        cy.get('[data-testid="checkbox-required"]').check();
      }

      if (testData.validDocumentType.expirationRequired) {
        cy.get('[data-testid="checkbox-expiration-required"]').check();
      }

      // Handle file types if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-file-types"]').length > 0) {
          testData.validDocumentType.fileTypes.forEach(fileType => {
            cy.get(`[data-testid="checkbox-filetype-${fileType}"]`).check();
          });
        }
      });

      // Submit form
      cy.get('[data-testid="button-submit"]').click();
      cy.wait('@createDocumentType');

      // Should show success message
      cy.get('[data-testid="toast-success"], .toast-success, [data-testid="alert-success"]')
        .should('be.visible')
        .and('contain.text', /success|created/i);

      // Modal should close
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');

      // New document type should appear in list
      cy.get('[data-testid*="document-type-row"]')
        .should('contain.text', testData.validDocumentType.name);
    });

    it('should handle duplicate name validation', () => {
      // First create a document type
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type(testData.validDocumentType.name);
      cy.get('[data-testid="select-category"]').select(testData.validDocumentType.category);
      cy.get('[data-testid="button-submit"]').click();
      cy.wait('@createDocumentType');

      // Try to create another with same name
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type(testData.duplicateDocumentType.name);
      cy.get('[data-testid="select-category"]').select(testData.duplicateDocumentType.category);

      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 409,
        body: { error: 'Document type with this name already exists' }
      }).as('createDuplicateDocumentType');

      cy.get('[data-testid="button-submit"]').click();
      cy.wait('@createDuplicateDocumentType');

      // Should show error message
      cy.get('[data-testid="toast-error"], .toast-error, [data-testid="alert-error"]')
        .should('be.visible')
        .and('contain.text', /already exists|duplicate/i);
    });

    it('should handle cancel action', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Fill some data
      cy.get('[data-testid="input-name"]').type('Test Document');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();

      // Modal should close
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');

      // No new document type should be created
      cy.get('[data-testid*="document-type-row"]')
        .should('not.contain.text', 'Test Document');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type(testData.validDocumentType.name);
      cy.get('[data-testid="select-category"]').select(testData.validDocumentType.category);
      cy.get('[data-testid="button-submit"]').click();
      cy.wait('@createDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], .toast-error, [data-testid="alert-error"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Modal should remain open
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
    });
  });

  describe('Edit Document Type Functionality', () => {
    const mockDocumentType = {
      id: 1,
      name: 'Medical License',
      description: 'Professional medical license',
      category: 'license',
      required: true,
      expirationRequired: true,
      fileTypes: ['pdf', 'jpg']
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [mockDocumentType] }).as('getDocumentTypes');
      cy.intercept('GET', `${apiEndpoints.documentTypes}/1`, { body: mockDocumentType }).as('getDocumentType');
      cy.intercept('PATCH', `${apiEndpoints.documentTypes}/1`).as('updateDocumentType');
      
>>>>>>> Stashed changes
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

<<<<<<< Updated upstream
    it('should display edit form with pre-filled data', () => {
      cy.intercept('GET', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200,
        body: existingDocumentType
      }).as('getDocumentType');

      // Click edit button
      cy.get('[data-testid="button-edit-document-type"]').first().click();
      cy.wait('@getDocumentType');

      // Verify form is pre-filled
      cy.get('[data-testid="input-name"]').should('have.value', existingDocumentType.name);
      cy.get('[data-testid="input-description"]').should('have.value', existingDocumentType.description);
      cy.get('[data-testid="select-category"]').should('contain.text', existingDocumentType.category);
      
      if (existingDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-is-required"]').should('be.checked');
      } else {
        cy.get('[data-testid="checkbox-is-required"]').should('not.be.checked');
      }
      
      if (existingDocumentType.allowMultiple) {
        cy.get('[data-testid="checkbox-allow-multiple"]').should('be.checked');
      } else {
        cy.get('[data-testid="checkbox-allow-multiple"]').should('not.be.checked');
      }

      // Verify action buttons
      cy.get('[data-testid="button-submit"]')
        .should('be.visible')
        .and('contain.text', /update|save/i);
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should update document type successfully', () => {
      cy.intercept('GET', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200,
        body: existingDocumentType
      }).as('getDocumentType');

      cy.intercept('PUT', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200,
        body: { ...existingDocumentType, ...testData.updateDocumentType }
      }).as('updateDocumentType');

      // Open edit form
      cy.get('[data-testid="button-edit-document-type"]').first().click();
      cy.wait('@getDocumentType');

      // Update fields
      cy.get('[data-testid="input-name"]').clear().type(testData.updateDocumentType.name);
      cy.get('[data-testid="input-description"]').clear().type(testData.updateDocumentType.description);
      cy.get('[data-testid="select-category"]').click();
      cy.get(`[data-testid="option-${testData.updateDocumentType.category.toLowerCase()}"], [value="${testData.updateDocumentType.category}"]`).click();
      
      // Update checkboxes
      if (testData.updateDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-is-required"]').check();
      } else {
        cy.get('[data-testid="checkbox-is-required"]').uncheck();
      }
      
      if (testData.updateDocumentType.allowMultiple) {
        cy.get('[data-testid="checkbox-allow-multiple"]').check();
      } else {
        cy.get('[data-testid="checkbox-allow-multiple"]').uncheck();
=======
    it('should open edit document type modal/form', () => {
      cy.get('[data-testid="button-edit-1"], [data-testid="document-type-row-1"] [data-testid="button-edit"]')
        .first()
        .click();

      cy.wait('@getDocumentType');

      // Modal should open with populated data
      cy.get('[data-testid="modal-edit-document-type"], [data-testid="form-edit-document-type"]')
        .should('be.visible');

      // Form should be populated with existing data
      cy.get('[data-testid="input-name"]')
        .should('have.value', mockDocumentType.name);

      cy.get('[data-testid="textarea-description"]')
        .should('have.value', mockDocumentType.description);

      cy.get('[data-testid="select-category"]')
        .should('have.value', mockDocumentType.category);

      cy.get('[data-testid="checkbox-required"]')
        .should(mockDocumentType.required ? 'be.checked' : 'not.be.checked');

      cy.get('[data-testid="checkbox-expiration-required"]')
        .should(mockDocumentType.expirationRequired ? 'be.checked' : 'not.be.checked');
    });

    it('should successfully update document type', () => {
      cy.get('[data-testid="button-edit-1"], [data-testid="document-type-row-1"] [data-testid="button-edit"]')
        .first()
        .click();

      cy.wait('@getDocumentType');

      // Update form fields
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(testData.updateDocumentType.name);

      cy.get('[data-testid="textarea-description"]')
        .clear()
        .type(testData.updateDocumentType.description);

      cy.get('[data-testid="select-category"]')
        .select(testData.updateDocumentType.category);

      // Toggle checkboxes
      if (!testData.updateDocumentType.required) {
        cy.get('[data-testid="checkbox-required"]').uncheck();
      }

      if (testData.updateDocumentType.expirationRequired) {
        cy.get('[data-testid="checkbox-expiration-required"]').check();
>>>>>>> Stashed changes
      }

      // Submit update
      cy.get('[data-testid="button-submit"]').click();
<<<<<<< Updated upstream

      // Verify API call
      cy.wait('@updateDocumentType').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.updateDocumentType.name,
          description: testData.updateDocumentType.description,
          category: testData.updateDocumentType.category,
          isRequired: testData.updateDocumentType.isRequired,
          allowMultiple: testData.updateDocumentType.allowMultiple
        });
      });

      // Verify success
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible')
        .and('contain.text', /updated|success/i);
    });

    it('should validate edit form fields', () => {
      cy.intercept('GET', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200,
        body: existingDocumentType
      }).as('getDocumentType');

      // Open edit form
      cy.get('[data-testid="button-edit-document-type"]').first().click();
      cy.wait('@getDocumentType');

      // Test empty name validation
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-submit"]').click();
      cy.get('[data-testid="error-name"], .error').should('contain.text', /required/i);

      // Test long name validation
      cy.get('[data-testid="input-name"]').clear().type(testData.longNameDocumentType.name);
      cy.get('[data-testid="input-description"]').click();
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-name"]:contains("too long")').length > 0) {
          cy.get('[data-testid="error-name"]').should('contain.text', /long/i);
        }
      });
    });
  });

  describe('Delete Document Type - Confirmation & API', () => {
    let existingDocumentType;

    beforeEach(() => {
      existingDocumentType = {
        id: 'doc-type-to-delete',
        name: 'Document Type to Delete',
        description: 'This will be deleted',
        category: 'Other',
        isRequired: false,
        allowMultiple: false
      };

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [existingDocumentType]
      }).as('getDocumentTypes');

=======
      cy.wait('@updateDocumentType');

      // Should show success message
      cy.get('[data-testid="toast-success"], .toast-success')
        .should('be.visible')
        .and('contain.text', /success|updated/i);

      // Modal should close
      cy.get('[data-testid="modal-edit-document-type"]')
        .should('not.exist');
    });

    it('should handle edit form validation', () => {
      cy.get('[data-testid="button-edit-1"], [data-testid="document-type-row-1"] [data-testid="button-edit"]')
        .first()
        .click();

      cy.wait('@getDocumentType');

      // Clear required field
      cy.get('[data-testid="input-name"]').clear().blur();

      // Try to submit
      cy.get('[data-testid="button-submit"]').click();

      // Should show validation error
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should handle edit API errors', () => {
      cy.intercept('PATCH', `${apiEndpoints.documentTypes}/1`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateDocumentTypeError');

      cy.get('[data-testid="button-edit-1"], [data-testid="document-type-row-1"] [data-testid="button-edit"]')
        .first()
        .click();

      cy.wait('@getDocumentType');

      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Updated Name');

      cy.get('[data-testid="button-submit"]').click();
      cy.wait('@updateDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], .toast-error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Delete Document Type Functionality', () => {
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license', required: true },
      { id: 2, name: 'Background Check', category: 'verification', required: false }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/*`).as('deleteDocumentType');
      
>>>>>>> Stashed changes
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

<<<<<<< Updated upstream
    it('should display delete confirmation dialog', () => {
      // Click delete button
      cy.get('[data-testid="button-delete-document-type"]').first().click();

      // Verify confirmation dialog
      cy.get('[data-testid="delete-confirmation-dialog"], [role="dialog"]')
        .should('be.visible');

      cy.get('[data-testid="confirmation-message"]')
        .should('be.visible')
        .and('contain.text', /delete|remove/i)
        .and('contain.text', existingDocumentType.name);

      // Verify dialog buttons
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete|confirm/i);
=======
    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="button-delete-1"], [data-testid="document-type-row-1"] [data-testid="button-delete"]')
        .first()
        .click();

      // Confirmation dialog should appear
      cy.get('[data-testid="confirm-delete-dialog"], [data-testid="modal-confirm-delete"]')
        .should('be.visible');

      cy.get('[data-testid="confirm-delete-message"]')
        .should('contain.text', /delete|remove/)
        .and('contain.text', mockDocumentTypes[0].name);

      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete|remove/i);
>>>>>>> Stashed changes

      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', /cancel/i);
    });

<<<<<<< Updated upstream
    it('should cancel delete operation', () => {
      // Click delete button
      cy.get('[data-testid="button-delete-document-type"]').first().click();

      // Cancel deletion
      cy.get('[data-testid="button-cancel-delete"]').click();

      // Dialog should be closed
      cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');

      // Document type should still be in list
      cy.get('[data-testid="document-type-name"]')
        .should('contain.text', existingDocumentType.name);
    });

    it('should delete document type successfully', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200
      }).as('deleteDocumentType');

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [] // Empty list after deletion
      }).as('getDocumentTypesAfterDelete');

      // Click delete button
      cy.get('[data-testid="button-delete-document-type"]').first().click();

      // Confirm deletion
      cy.get('[data-testid="button-confirm-delete"]').click();

      // Verify API call
      cy.wait('@deleteDocumentType');

      // Verify success message
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);

      // Verify document type is removed from list
      cy.wait('@getDocumentTypesAfterDelete');
      cy.get('[data-testid="empty-state"]').should('be.visible');
    });

    it('should handle delete errors gracefully', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 400,
        body: { error: 'Cannot delete document type: it is in use' }
      }).as('deleteDocumentTypeError');

      // Click delete button and confirm
      cy.get('[data-testid="button-delete-document-type"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();

      // Wait for error response
      cy.wait('@deleteDocumentTypeError');

      // Verify error message
      cy.get('[data-testid="error-message"], .error, .toast-error')
        .should('be.visible')
        .and('contain.text', /cannot delete|in use/i);

      // Document type should still be in list
      cy.get('[data-testid="document-type-name"]')
        .should('contain.text', existingDocumentType.name);
    });
  });

  describe('Search and Filter Functionality', () => {
    const multipleDocumentTypes = [
      {
        id: '1',
        name: 'Medical License',
        description: 'Required medical license',
        category: 'License',
        isRequired: true,
        allowMultiple: false
      },
      {
        id: '2',
        name: 'CPR Certification',
        description: 'CPR training certificate',
        category: 'Certification',
        isRequired: true,
        allowMultiple: false
      },
      {
        id: '3',
        name: 'Training Record',
        description: 'General training documentation',
        category: 'Training',
        isRequired: false,
        allowMultiple: true
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: multipleDocumentTypes
      }).as('getDocumentTypes');

=======
    it('should successfully delete document type', () => {
      cy.get('[data-testid="button-delete-1"], [data-testid="document-type-row-1"] [data-testid="button-delete"]')
        .first()
        .click();

      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteDocumentType');

      // Should show success message
      cy.get('[data-testid="toast-success"], .toast-success')
        .should('be.visible')
        .and('contain.text', /success|deleted/i);

      // Document type should be removed from list
      cy.get('[data-testid="document-type-row-1"]')
        .should('not.contain.text', mockDocumentTypes[0].name);
    });

    it('should cancel delete operation', () => {
      cy.get('[data-testid="button-delete-1"], [data-testid="document-type-row-1"] [data-testid="button-delete"]')
        .first()
        .click();

      cy.get('[data-testid="button-cancel-delete"]').click();

      // Dialog should close
      cy.get('[data-testid="confirm-delete-dialog"], [data-testid="modal-confirm-delete"]')
        .should('not.exist');

      // Document type should still be in list
      cy.get('[data-testid="document-type-row-1"]')
        .should('contain.text', mockDocumentTypes[0].name);
    });

    it('should handle delete API errors', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/1`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('deleteDocumentTypeError');

      cy.get('[data-testid="button-delete-1"], [data-testid="document-type-row-1"] [data-testid="button-delete"]')
        .first()
        .click();

      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], .toast-error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Document type should still be in list
      cy.get('[data-testid="document-type-row-1"]')
        .should('contain.text', mockDocumentTypes[0].name);
    });

    it('should prevent deletion if document type is in use', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/1`, {
        statusCode: 409,
        body: { error: 'Cannot delete document type that is in use' }
      }).as('deleteDocumentTypeInUse');

      cy.get('[data-testid="button-delete-1"], [data-testid="document-type-row-1"] [data-testid="button-delete"]')
        .first()
        .click();

      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteDocumentTypeInUse');

      // Should show specific error message
      cy.get('[data-testid="toast-error"], .toast-error')
        .should('be.visible')
        .and('contain.text', /in use|cannot delete/i);
    });
  });

  describe('Document Type Categories and File Types', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display all available categories', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      cy.get('[data-testid="select-category"]').click();

      // Common categories should be available
      const expectedCategories = [
        'license',
        'certification',
        'verification',
        'reference',
        'education',
        'insurance',
        'compliance'
      ];

      expectedCategories.forEach(category => {
        cy.get(`[value="${category}"], option[value="${category}"]`)
          .should('exist');
      });
    });

    it('should handle file type selection', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Check if file types section exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="file-types-section"]').length > 0) {
          const commonFileTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
          
          commonFileTypes.forEach(fileType => {
            cy.get(`[data-testid="checkbox-filetype-${fileType}"]`)
              .should('exist')
              .check()
              .should('be.checked');
          });

          // Uncheck some file types
          cy.get('[data-testid="checkbox-filetype-doc"]').uncheck();
          cy.get('[data-testid="checkbox-filetype-doc"]').should('not.be.checked');
        }
      });
    });

    it('should validate file type requirements', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Fill required fields
      cy.get('[data-testid="input-name"]').type('Test Document');
      cy.get('[data-testid="select-category"]').select('license');

      // Check if file types are required
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="file-types-section"]').length > 0) {
          // Try to submit without selecting file types
          cy.get('[data-testid="button-submit"]').click();

          cy.get('[data-testid="error-file-types"]').then(($error) => {
            if ($error.length > 0) {
              cy.wrap($error).should('contain.text', /required|select/i);
            }
          });
        }
      });
    });
  });

  describe('Bulk Operations', () => {
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license', required: true },
      { id: 2, name: 'Background Check', category: 'verification', required: false },
      { id: 3, name: 'Drug Test', category: 'verification', required: true }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should handle bulk selection', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="checkbox-select-all"]').length > 0) {
          // Select all checkbox
          cy.get('[data-testid="checkbox-select-all"]').check();

          // All individual checkboxes should be checked
          cy.get('[data-testid^="checkbox-select-"]').each(($checkbox) => {
            cy.wrap($checkbox).should('be.checked');
          });

          // Bulk actions should be available
          cy.get('[data-testid="bulk-actions"]').should('be.visible');
          cy.get('[data-testid="button-bulk-delete"]').should('be.visible');
        }
      });
    });

    it('should handle individual selection', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="checkbox-select-1"]').length > 0) {
          // Select individual items
          cy.get('[data-testid="checkbox-select-1"]').check();
          cy.get('[data-testid="checkbox-select-2"]').check();

          // Bulk actions should appear
          cy.get('[data-testid="bulk-actions"]').should('be.visible');
          cy.get('[data-testid="selected-count"]')
            .should('contain.text', '2');
        }
      });
    });

    it('should handle bulk delete operation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="checkbox-select-1"]').length > 0) {
          cy.intercept('DELETE', `${apiEndpoints.documentTypes}/bulk`).as('bulkDeleteDocumentTypes');

          // Select items
          cy.get('[data-testid="checkbox-select-1"]').check();
          cy.get('[data-testid="checkbox-select-2"]').check();

          // Bulk delete
          cy.get('[data-testid="button-bulk-delete"]').click();

          // Confirm bulk delete
          cy.get('[data-testid="button-confirm-bulk-delete"]').click();
          cy.wait('@bulkDeleteDocumentTypes');

          // Should show success message
          cy.get('[data-testid="toast-success"], .toast-success')
            .should('be.visible')
            .and('contain.text', /success|deleted/i);
        }
      });
    });
  });

  describe('Integration with Consultant Documents', () => {
    const mockConsultant = { id: 1, name: 'Test Consultant' };
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', required: true },
      { id: 2, name: 'Background Check', required: false }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultants, { body: [mockConsultant] }).as('getConsultants');
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
      cy.intercept('GET', apiEndpoints.consultantDocuments(1), { body: [] }).as('getConsultantDocuments');
    });

    it('should show document types in consultant document upload', () => {
      cy.visit('/consultants/1/documents');
      cy.wait(['@getConsultantDocuments', '@getDocumentTypes']);

      // Document types should be available for selection
      cy.get('[data-testid="select-document-type"]').then(($select) => {
        if ($select.length > 0) {
          cy.wrap($select).click();

          mockDocumentTypes.forEach(docType => {
            cy.get(`option[value="${docType.id}"]`)
              .should('exist')
              .and('contain.text', docType.name);
          });
        }
      });

      // Required documents should be highlighted
      cy.get('[data-testid="required-documents"]').then(($section) => {
        if ($section.length > 0) {
          cy.wrap($section)
            .should('contain.text', 'Medical License')
            .and('contain.text', /required/i);
        }
      });
    });

    it('should validate document type selection during upload', () => {
      cy.visit('/consultants/1/documents');
      cy.wait(['@getConsultantDocuments', '@getDocumentTypes']);

      cy.get('[data-testid="button-upload-document"]').then(($button) => {
        if ($button.length > 0) {
          cy.wrap($button).click();

          // Try to upload without selecting document type
          cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
          cy.get('[data-testid="button-submit-upload"]').click();

          // Should show validation error
          cy.get('[data-testid="error-document-type"]')
            .should('be.visible')
            .and('contain.text', /required|select/i);
        }
      });
    });
  });

  describe('Permissions and Access Control', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
    });

    it('should restrict access for non-admin users', () => {
      // Mock non-admin user response
      cy.intercept('GET', '/api/auth/user', {
        body: { id: 1, email: 'user@example.com', role: 'consultant' }
      }).as('getNonAdminUser');

      cy.visit('/admin/document-types');

      // Should redirect or show access denied
      cy.url().should('not.include', '/admin/document-types');
      
      // Alternative: check for access denied message
      cy.get('[data-testid="access-denied"], [data-testid="unauthorized"]').then(($denied) => {
        if ($denied.length > 0) {
          cy.wrap($denied)
            .should('be.visible')
            .and('contain.text', /access denied|unauthorized/i);
        }
      });
    });

    it('should allow admin access to all operations', () => {
      cy.intercept('GET', '/api/auth/user', {
        body: { id: 1, email: 'admin@example.com', role: 'admin' }
      }).as('getAdminUser');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // All admin actions should be available
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="button-edit"]').length > 0) {
          cy.get('[data-testid*="button-edit"]').should('be.visible');
        }
        if ($body.find('[data-testid*="button-delete"]').length > 0) {
          cy.get('[data-testid*="button-delete"]').should('be.visible');
        }
      });
    });
  });

  describe('Responsive Design and Mobile Support', () => {
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license', required: true },
      { id: 2, name: 'Background Check', category: 'verification', required: false }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
    });

    it('should work correctly on mobile viewport', () => {
      cy.viewport(375, 667); // iPhone SE size
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Page should be responsive
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');

      // Mobile menu or collapsed navigation
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
          cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
        }
      });

      // Table should be responsive or show cards
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('be.visible');
    });

    it('should work correctly on tablet viewport', () => {
      cy.viewport(768, 1024); // iPad size
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Should maintain functionality
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');
      cy.get('[data-testid="document-types-container"]').should('be.visible');
    });

    it('should maintain modal responsiveness', () => {
      cy.viewport(375, 667);
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      cy.get('[data-testid="button-add-document-type"]').click();

      // Modal should be responsive
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible')
        .and('have.css', 'max-width');

      // Form elements should be properly sized
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.css', 'width');
    });
  });

  describe('Performance and Loading States', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
    });

    it('should show loading states during API calls', () => {
      // Delay the response to see loading state
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res.send({ fixture: 'document-types.json' })), 1000);
          });
        });
      }).as('getDocumentTypesDelayed');

      cy.visit('/admin/document-types');

      // Should show loading indicator
      cy.get('[data-testid="loading-spinner"], [data-testid="loading-skeleton"], .loading')
        .should('be.visible');

      cy.wait('@getDocumentTypesDelayed');

      // Loading should disappear
      cy.get('[data-testid="loading-spinner"], [data-testid="loading-skeleton"], .loading')
        .should('not.exist');
    });

    it('should handle slow network conditions', () => {
      // Simulate slow network
      cy.intercept('POST', apiEndpoints.documentTypes, (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res.send({ statusCode: 201, body: { id: 1 } })), 2000);
          });
        });
      }).as('createDocumentTypeSlow');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type('Test Document');
      cy.get('[data-testid="select-category"]').select('license');
      cy.get('[data-testid="button-submit"]').click();

      // Submit button should show loading state
      cy.get('[data-testid="button-submit"]')
        .should('contain.text', /saving|creating/i)
        .and('be.disabled');

      cy.wait('@createDocumentTypeSlow');

      // Button should return to normal state
      cy.get('[data-testid="button-submit"]')
        .should('not.be.disabled');
    });
  });

  describe('Accessibility Features', () => {
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license', required: true }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
>>>>>>> Stashed changes
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

<<<<<<< Updated upstream
    it('should search document types by name', () => {
      // Skip if search not implemented
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          // Test search functionality
          cy.get('[data-testid="search-document-types"]').type('License');

          // Should show only matching results
          cy.get('[data-testid="document-type-name"]')
            .should('have.length', 1)
            .and('contain.text', 'Medical License');

          // Clear search
          cy.get('[data-testid="search-document-types"]').clear();

          // Should show all results
          cy.get('[data-testid="document-type-name"]')
            .should('have.length', multipleDocumentTypes.length);
        }
      });
    });

    it('should filter document types by category', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-category"]').length > 0) {
          // Filter by License category
          cy.get('[data-testid="filter-category"]').select('License');

          // Should show only License category items
          cy.get('[data-testid="document-type-name"]')
            .should('have.length', 1)
            .and('contain.text', 'Medical License');

          // Filter by Certification category
          cy.get('[data-testid="filter-category"]').select('Certification');

          // Should show only Certification category items
          cy.get('[data-testid="document-type-name"]')
            .should('have.length', 1)
            .and('contain.text', 'CPR Certification');

          // Reset filter
          cy.get('[data-testid="filter-category"]').select('All Categories');

          // Should show all items
          cy.get('[data-testid="document-type-name"]')
            .should('have.length', multipleDocumentTypes.length);
        }
      });
    });

    it('should handle no search results gracefully', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          // Search for non-existent document type
          cy.get('[data-testid="search-document-types"]').type('NonExistentType');

          // Should show no results state
          cy.get('[data-testid="no-results-state"], [data-testid="empty-search-results"]')
            .should('be.visible')
            .and('contain.text', /no results|not found/i);

          cy.get('[data-testid="document-type-name"]').should('not.exist');
        }
      });
    });
  });

  describe('Pagination and Data Loading', () => {
    beforeEach(() => {
      // Mock large dataset for pagination testing
      const manyDocumentTypes = Array.from({ length: 25 }, (_, i) => ({
        id: `doc-type-${i + 1}`,
        name: `Document Type ${i + 1}`,
        description: `Description for document type ${i + 1}`,
        category: testData.categories[i % testData.categories.length],
        isRequired: i % 2 === 0,
        allowMultiple: i % 3 === 0
      }));

      cy.intercept('GET', `${apiEndpoints.documentTypes}*`, {
        statusCode: 200,
        body: manyDocumentTypes,
        headers: {
          'x-total-count': '25',
          'x-page-count': '3'
        }
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should handle pagination controls correctly', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          // Verify pagination controls
          cy.get('[data-testid="pagination"]').should('be.visible');
          cy.get('[data-testid="page-info"]').should('be.visible');

          // Test next page
          cy.get('[data-testid="next-page"]').click();
          cy.get('[data-testid="page-info"]').should('contain.text', '2');

          // Test previous page
          cy.get('[data-testid="previous-page"]').click();
          cy.get('[data-testid="page-info"]').should('contain.text', '1');

          // Test specific page navigation
          cy.get('[data-testid="page-3"]').click();
          cy.get('[data-testid="page-info"]').should('contain.text', '3');
        }
      });
    });

    it('should handle loading states during data fetch', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [],
        delay: 1000 // Simulate slow network
      }).as('getDocumentTypesSlow');

      cy.visit('/admin/document-types');

      // Should show loading state
      cy.get('[data-testid="loading-spinner"], [data-testid="loading-state"], .loading')
        .should('be.visible');

      cy.wait('@getDocumentTypesSlow');

      // Loading should be gone
      cy.get('[data-testid="loading-spinner"], [data-testid="loading-state"], .loading')
        .should('not.exist');
    });
  });

  describe('Integration with Document Upload Flow', () => {
    beforeEach(() => {
      const documentTypes = [
        {
          id: 'license-type',
          name: 'Medical License',
          description: 'Required medical license',
          category: 'License',
          isRequired: true,
          allowMultiple: false
        },
        {
          id: 'cert-type',
          name: 'Certification',
          description: 'Professional certification',
          category: 'Certification',
          isRequired: false,
          allowMultiple: true
        }
      ];

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: documentTypes
      }).as('getDocumentTypes');

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.ciData.consultant), {
        statusCode: 200,
        body: []
      }).as('getConsultantDocuments');
    });

    it('should display document types in upload form', () => {
      // Visit consultant document upload page
      cy.visit(`/consultants/${testData.ciData.consultant}/documents`);
      cy.wait('@getConsultantDocuments');

      // Open upload form
      cy.get('[data-testid="button-upload-document"]').click();

      // Verify document types are available in dropdown
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-medical-license"], [value="license-type"]')
        .should('be.visible');
      cy.get('[data-testid="option-certification"], [value="cert-type"]')
        .should('be.visible');
    });

    it('should validate required document types', () => {
      cy.visit(`/consultants/${testData.ciData.consultant}/documents`);
      cy.wait('@getConsultantDocuments');

      // Should show missing required documents warning
      cy.get('[data-testid="missing-required-docs"], [data-testid="compliance-warning"]')
        .should('be.visible')
        .and('contain.text', /required|missing/i);

      // Should list required document types
      cy.get('[data-testid="required-doc-list"]')
        .should('contain.text', 'Medical License');
    });

    it('should handle document type changes correctly', () => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Create a new required document type
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: {
          id: 'new-required-type',
          name: 'New Required Document',
          description: 'Newly required document',
          category: 'Compliance',
          isRequired: true,
          allowMultiple: false
        }
      }).as('createRequiredDocType');

      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type('New Required Document');
      cy.get('[data-testid="input-description"]').type('Newly required document');
      cy.get('[data-testid="select-category"]').select('Compliance');
      cy.get('[data-testid="checkbox-is-required"]').check();
      cy.get('[data-testid="button-submit"]').click();

      cy.wait('@createRequiredDocType');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created/i);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API failures gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDocumentTypesError');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypesError');

      // Should show error state
      cy.get('[data-testid="error-state"], [data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);

      // Should provide retry option
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { forceNetworkError: true })
        .as('getDocumentTypesNetworkError');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypesNetworkError');

      // Should show network error message
      cy.get('[data-testid="network-error"], [data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
    });

    it('should handle empty state correctly', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: []
      }).as('getEmptyDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getEmptyDocumentTypes');

      // Should show empty state
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', /no document types/i);

      // Should still show add button
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');
    });

    it('should handle concurrent modifications', () => {
      const documentType = {
        id: 'concurrent-test',
        name: 'Concurrent Test Type',
        description: 'Testing concurrent modifications',
        category: 'Test',
        isRequired: false,
        allowMultiple: false
      };

      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [documentType]
      }).as('getDocumentTypes');

      cy.intercept('PUT', `${apiEndpoints.documentTypes}/${documentType.id}`, {
        statusCode: 409,
        body: { error: 'Document type was modified by another user' }
      }).as('updateConflict');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Attempt to edit
      cy.get('[data-testid="button-edit-document-type"]').first().click();
      cy.get('[data-testid="input-name"]').clear().type('Modified Name');
      cy.get('[data-testid="button-submit"]').click();

      cy.wait('@updateConflict');

      // Should show conflict error
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /modified by another user|conflict/i);
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [
          {
            id: 'a11y-test',
            name: 'Accessibility Test Type',
            description: 'Testing accessibility features',
            category: 'Test',
            isRequired: false,
            allowMultiple: false
          }
        ]
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'button-add-document-type');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'search-document-types')
        .or('have.attr', 'data-testid', 'button-edit-document-type');

      // Test Enter key activation
      cy.get('[data-testid="button-add-document-type"]').focus().type('{enter}');
      cy.get('[data-testid="create-document-type-modal"], [data-testid="create-document-type-form"]')
        .should('be.visible');

      // Test Escape key to close
      cy.get('body').type('{esc}');
      cy.get('[data-testid="create-document-type-modal"]').should('not.exist');
    });

    it('should have proper ARIA attributes', () => {
      // Check main container
      cy.get('[data-testid="document-types-container"]')
        .should('have.attr', 'role').or('have.attr', 'aria-label');

      // Check buttons
      cy.get('[data-testid="button-add-document-type"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'type', 'button');

      // Check form elements when modal opens
      cy.get('[data-testid="button-add-document-type"]').click();
      
      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby');

      cy.get('[data-testid="select-category"]')
        .should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby');
    });

    it('should announce changes to screen readers', () => {
      // Check for aria-live regions
      cy.get('[aria-live], [data-testid="announcer"]').should('exist');

      // Test form submission announcements
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: 'new-type', name: 'Test Type' }
      }).as('createSuccess');

      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]').type('Accessibility Test');
      cy.get('[data-testid="input-description"]').type('Testing screen reader announcements');
      cy.get('[data-testid="select-category"]').select('Certification');
      cy.get('[data-testid="button-submit"]').click();

      cy.wait('@createSuccess');

      // Success message should be announced
      cy.get('[data-testid="success-message"]')
        .should('have.attr', 'aria-live', 'polite')
        .or('have.attr', 'role', 'status');
=======
    it('should support keyboard navigation', () => {
      // Tab through elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');

      // Should be able to activate elements with Enter/Space
      cy.get('[data-testid="button-add-document-type"]').focus().type('{enter}');
      cy.get('[data-testid="modal-create-document-type"]').should('be.visible');

      // Escape should close modal
      cy.get('body').type('{esc}');
      cy.get('[data-testid="modal-create-document-type"]').should('not.exist');
    });

    it('should have proper ARIA labels and roles', () => {
      // Check main elements have proper ARIA attributes
      cy.get('[data-testid="document-types-table"]').then(($table) => {
        if ($table.length > 0) {
          cy.wrap($table).should('have.attr', 'role', 'table');
        }
      });

      cy.get('[data-testid="button-add-document-type"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title');

      // Modal should have proper ARIA attributes
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="modal-create-document-type"]')
        .should('have.attr', 'role', 'dialog')
        .and('have.attr', 'aria-modal', 'true');
    });

    it('should support screen readers', () => {
      // Form labels should be associated with inputs
      cy.get('[data-testid="button-add-document-type"]').click();

      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');

      cy.get('[data-testid="select-category"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');

      // Error messages should be announced
      cy.get('[data-testid="button-submit"]').click();
      cy.get('[data-testid="error-name"]')
        .should('have.attr', 'role', 'alert')
        .or('have.attr', 'aria-live');
    });
  });

  describe('Data Export and Reporting', () => {
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license', required: true },
      { id: 2, name: 'Background Check', category: 'verification', required: false }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should support data export functionality', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-export"]').length > 0) {
          cy.intercept('GET', '/api/document-types/export', { fixture: 'document-types-export.csv' }).as('exportDocumentTypes');
          
          cy.get('[data-testid="button-export"]').click();
          cy.wait('@exportDocumentTypes');

          // Should initiate download
          cy.get('[data-testid="toast-success"]')
            .should('be.visible')
            .and('contain.text', /export|download/i);
        }
      });
    });

    it('should support printing functionality', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-print"]').length > 0) {
          // Mock print functionality
          cy.window().then((win) => {
            cy.stub(win, 'print').as('windowPrint');
          });

          cy.get('[data-testid="button-print"]').click();
          cy.get('@windowPrint').should('have.been.called');
        }
      });
>>>>>>> Stashed changes
    });
  });
});
