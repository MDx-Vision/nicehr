describe('Document Types System - Exhaustive Tests', () => {
  const testData = {
<<<<<<< Updated upstream
    documentTypes: {
      valid: {
        name: 'Test Certification',
        description: 'A test certification document',
        category: 'certification',
        isRequired: true
      },
      update: {
        name: 'Updated Test Certification',
        description: 'An updated test certification document',
        category: 'license',
        isRequired: false
      },
      invalid: {
        emptyName: {
          name: '',
          description: 'Test description',
          category: 'certification'
=======
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    documentTypes: {
      valid: {
        name: 'Resume',
        description: 'Professional resume document',
        isRequired: true,
        expiresAfterDays: null,
        fileTypes: 'pdf,doc,docx'
      },
      withExpiration: {
        name: 'Medical License',
        description: 'State medical license certification',
        isRequired: true,
        expiresAfterDays: 365,
        fileTypes: 'pdf,jpg,png'
      },
      optional: {
        name: 'Reference Letter',
        description: 'Professional reference letter',
        isRequired: false,
        expiresAfterDays: null,
        fileTypes: 'pdf,doc,docx'
      },
      invalid: {
        empty: {
          name: '',
          description: '',
          isRequired: false
>>>>>>> Stashed changes
        },
        longName: {
          name: 'A'.repeat(256),
          description: 'Test description',
<<<<<<< Updated upstream
          category: 'certification'
        },
        invalidCategory: {
          name: 'Test Document',
          description: 'Test description',
          category: 'invalid-category'
        }
      }
    },
    documents: {
      valid: {
        title: 'Test Document Upload',
        notes: 'Test document notes',
        expiryDate: '2025-12-31'
      },
      update: {
        title: 'Updated Document Title',
        notes: 'Updated document notes',
        status: 'approved'
      }
    },
    files: {
      validPdf: 'test-document.pdf',
      validImage: 'test-image.jpg',
      invalidType: 'test-file.txt',
      largePdf: 'large-document.pdf'
    },
    ciData: {
      consultant: 'ci-test-consultant',
      admin: 'ci-test-user'
=======
          isRequired: false
        },
        invalidFileTypes: {
          name: 'Test Document',
          description: 'Test description',
          isRequired: false,
          fileTypes: 'invalid,file,types'
        }
      }
>>>>>>> Stashed changes
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
<<<<<<< Updated upstream
    consultantDocuments: '/api/consultants/*/documents',
    documentStatus: '/api/documents/*/status',
    consultants: '/api/consultants',
    upload: '/api/objects/upload'
  };

  beforeEach(() => {
    // Login as admin for most tests
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('test123');
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for auth
    cy.url().should('not.include', '/login');
  });

  describe('Document Types Management - UI & Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: []
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types management page layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]')
        .should('be.visible')
        .and('contain.text', 'Document Types');
      
      // Add new button
      cy.get('[data-testid="add-document-type-button"]')
        .should('be.visible')
        .and('contain.text', 'Add Document Type');
      
      // Document types list/table
      cy.get('[data-testid="document-types-list"], [data-testid="document-types-table"]')
        .should('be.visible');
      
      // Search functionality
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          cy.get('[data-testid="search-document-types"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
      });
    });

    it('should display empty state when no document types exist', () => {
      cy.get('[data-testid="empty-state"], [data-testid="no-document-types"]')
        .should('be.visible')
        .and('contain.text', /no document types|empty/i);
      
      // Should show call to action
      cy.get('[data-testid="add-first-document-type"], [data-testid="add-document-type-button"]')
        .should('be.visible');
    });

    it('should have proper breadcrumb navigation', () => {
      cy.get('[data-testid="breadcrumb"], nav[aria-label="breadcrumb"]')
        .should('be.visible');
      
      cy.get('[data-testid="breadcrumb"] a, nav[aria-label="breadcrumb"] a')
        .should('contain.text', /admin|dashboard/i);
    });
  });

  describe('Document Types - Create Operations', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, []).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open create document type modal/form', () => {
      cy.get('[data-testid="add-document-type-button"]').click();
      
      // Modal or form should be visible
      cy.get('[data-testid="document-type-modal"], [data-testid="document-type-form"]')
        .should('be.visible');
      
      // Form fields should be present
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="select-category"], [data-testid="input-category"]')
        .should('be.visible');
      
      // Required checkbox
      cy.get('[data-testid="checkbox-required"], [data-testid="input-required"]')
        .should('be.visible');
      
      // Action buttons
      cy.get('[data-testid="button-save"], [data-testid="button-create"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible');
    });

    it('should create document type with valid data', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { 
          id: 1, 
          ...testData.documentTypes.valid,
          createdAt: new Date().toISOString()
        }
      }).as('createDocumentType');
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [{ 
          id: 1, 
          ...testData.documentTypes.valid,
          createdAt: new Date().toISOString()
        }]
      }).as('getUpdatedDocumentTypes');

      cy.get('[data-testid="add-document-type-button"]').click();
      
      // Fill form
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      
      cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
        .type(testData.documentTypes.valid.description);
      
      cy.get('[data-testid="select-category"]').then(($select) => {
        if ($select.is('select')) {
          cy.wrap($select).select(testData.documentTypes.valid.category);
        } else {
          cy.wrap($select).click();
          cy.get(`[data-value="${testData.documentTypes.valid.category}"]`).click();
        }
      });
      
      if (testData.documentTypes.valid.isRequired) {
        cy.get('[data-testid="checkbox-required"]').check();
      }
      
      // Submit form
      cy.get('[data-testid="button-save"], [data-testid="button-create"]').click();
      
      // Verify API call
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body.name).to.equal(testData.documentTypes.valid.name);
        expect(interception.request.body.description).to.equal(testData.documentTypes.valid.description);
      });
      
      // Verify success feedback
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible')
        .and('contain.text', /created|success/i);
      
      // Modal should close
      cy.get('[data-testid="document-type-modal"]').should('not.exist');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-document-type-button"]').click();
      
      // Try to submit without required fields
      cy.get('[data-testid="button-save"], [data-testid="button-create"]').click();
      
      // Check validation errors
      cy.get('[data-testid="error-name"], .error-message')
        .should('be.visible')
        .and('contain.text', /required|name/i);
      
      // Form should still be open
      cy.get('[data-testid="document-type-modal"], [data-testid="document-type-form"]')
        .should('be.visible');
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { error: 'Document type name already exists' }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="add-document-type-button"]').click();
      
      // Fill form with valid data
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.valid.name);
      cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
        .type(testData.documentTypes.valid.description);
      
      // Submit
      cy.get('[data-testid="button-save"], [data-testid="button-create"]').click();
      
      cy.wait('@createDocumentTypeError');
      
      // Error message should be displayed
      cy.get('[data-testid="error-message"], .toast-error')
        .should('be.visible')
        .and('contain.text', /error|already exists/i);
    });

    it('should validate input length limits', () => {
      cy.get('[data-testid="add-document-type-button"]').click();
      
      // Test name length limit
      cy.get('[data-testid="input-name"]')
        .type(testData.documentTypes.invalid.longName.name);
      
      cy.get('[data-testid="button-save"], [data-testid="button-create"]').click();
      
      cy.get('[data-testid="error-name"], .error-message')
        .should('contain.text', /length|long|characters/i);
    });

    it('should allow canceling document type creation', () => {
      cy.get('[data-testid="add-document-type-button"]').click();
      
      // Fill some data
      cy.get('[data-testid="input-name"]')
        .type('Test Document Type');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Modal should close
      cy.get('[data-testid="document-type-modal"]').should('not.exist');
      
      // No API call should be made
      cy.get('@createDocumentType.all').should('have.length', 0);
    });
  });

  describe('Document Types - Read Operations', () => {
    const mockDocumentTypes = [
      {
        id: 1,
        name: 'Medical License',
        description: 'State medical license',
        category: 'license',
        isRequired: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'DEA Certificate',
        description: 'DEA registration certificate',
        category: 'certification',
        isRequired: true,
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, mockDocumentTypes).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display list of document types', () => {
      // Table/list should show document types
      mockDocumentTypes.forEach((docType) => {
        cy.get('[data-testid="document-type-item"]')
          .contains(docType.name)
          .should('be.visible');
        
        cy.get('[data-testid="document-type-item"]')
          .contains(docType.description)
          .should('be.visible');
      });
      
      // Required indicators
      cy.get('[data-testid="required-indicator"], .required-badge')
        .should('have.length.at.least', 2);
    });

    it('should display document type details correctly', () => {
      const docType = mockDocumentTypes[0];
      
      // Find the specific document type row/card
      cy.contains('[data-testid="document-type-item"]', docType.name)
        .within(() => {
          cy.should('contain.text', docType.name);
          cy.should('contain.text', docType.description);
          cy.should('contain.text', docType.category);
          
          if (docType.isRequired) {
            cy.get('[data-testid="required-indicator"]')
              .should('be.visible');
          }
        });
    });

    it('should show proper action buttons for each document type', () => {
      cy.get('[data-testid="document-type-item"]').first().within(() => {
        // Edit button
        cy.get('[data-testid="button-edit"], [aria-label*="edit"]')
          .should('be.visible');
        
        // Delete button
        cy.get('[data-testid="button-delete"], [aria-label*="delete"]')
          .should('be.visible');
        
        // View details button (if exists)
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="button-view"]').length > 0) {
            cy.get('[data-testid="button-view"]').should('be.visible');
          }
        });
      });
    });

    it('should handle search functionality', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          // Test search
          cy.get('[data-testid="search-document-types"]')
            .type('Medical');
          
          // Should show filtered results
          cy.get('[data-testid="document-type-item"]')
            .should('contain.text', 'Medical License');
          
          cy.get('[data-testid="document-type-item"]')
            .should('not.contain.text', 'DEA Certificate');
          
          // Clear search
          cy.get('[data-testid="search-document-types"]').clear();
          
          // All items should be visible again
          cy.get('[data-testid="document-type-item"]')
            .should('have.length', 2);
        }
      });
    });

    it('should handle category filtering', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-category"]').length > 0) {
          // Filter by license category
          cy.get('[data-testid="filter-category"]').select('license');
          
          // Should show only license documents
          cy.get('[data-testid="document-type-item"]')
            .should('contain.text', 'Medical License')
            .and('not.contain.text', 'DEA Certificate');
          
          // Reset filter
          cy.get('[data-testid="filter-category"]').select('all');
          
          cy.get('[data-testid="document-type-item"]')
            .should('have.length', 2);
        }
      });
    });
  });

  describe('Document Types - Update Operations', () => {
    const mockDocumentType = {
      id: 1,
      name: 'Medical License',
      description: 'State medical license',
      category: 'license',
      isRequired: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, [mockDocumentType]).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open edit modal with pre-populated data', () => {
      cy.get('[data-testid="button-edit"]').first().click();
      
      // Modal should open with existing data
      cy.get('[data-testid="document-type-modal"], [data-testid="edit-document-type-modal"]')
        .should('be.visible');
      
      // Fields should be pre-populated
      cy.get('[data-testid="input-name"]')
        .should('have.value', mockDocumentType.name);
      
      cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
        .should('have.value', mockDocumentType.description);
      
      cy.get('[data-testid="select-category"]')
        .should('have.value', mockDocumentType.category);
      
      if (mockDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-required"]')
          .should('be.checked');
      }
    });

    it('should update document type with valid changes', () => {
      cy.intercept('PATCH', `${apiEndpoints.documentTypes}/${mockDocumentType.id}`, {
        statusCode: 200,
        body: { ...mockDocumentType, ...testData.documentTypes.update }
      }).as('updateDocumentType');
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [{ ...mockDocumentType, ...testData.documentTypes.update }]
      }).as('getUpdatedDocumentTypes');

      cy.get('[data-testid="button-edit"]').first().click();
      
      // Update fields
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(testData.documentTypes.update.name);
      
      cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
        .clear()
        .type(testData.documentTypes.update.description);
      
      // Update category if it's a select
      cy.get('[data-testid="select-category"]').then(($select) => {
        if ($select.is('select')) {
          cy.wrap($select).select(testData.documentTypes.update.category);
        }
      });
      
      // Update required status
      if (!testData.documentTypes.update.isRequired) {
        cy.get('[data-testid="checkbox-required"]').uncheck();
      }
      
      // Save changes
      cy.get('[data-testid="button-save"], [data-testid="button-update"]').click();
      
      // Verify API call
      cy.wait('@updateDocumentType').then((interception) => {
        expect(interception.request.body.name).to.equal(testData.documentTypes.update.name);
      });
      
      // Success message
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible');
    });

    it('should validate fields during update', () => {
      cy.get('[data-testid="button-edit"]').first().click();
      
      // Clear required field
      cy.get('[data-testid="input-name"]').clear();
      
      // Try to save
      cy.get('[data-testid="button-save"], [data-testid="button-update"]').click();
      
      // Should show validation error
      cy.get('[data-testid="error-name"], .error-message')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should handle update API errors', () => {
      cy.intercept('PATCH', `${apiEndpoints.documentTypes}/${mockDocumentType.id}`, {
        statusCode: 409,
        body: { error: 'Document type name already exists' }
      }).as('updateDocumentTypeError');

      cy.get('[data-testid="button-edit"]').first().click();
      
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Existing Document Type');
      
      cy.get('[data-testid="button-save"], [data-testid="button-update"]').click();
      
      cy.wait('@updateDocumentTypeError');
      
      cy.get('[data-testid="error-message"], .toast-error')
        .should('be.visible')
        .and('contain.text', /error|already exists/i);
    });

    it('should allow canceling update', () => {
      cy.get('[data-testid="button-edit"]').first().click();
      
      // Make changes
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Modified Name');
      
      // Cancel
      cy.get('[data-testid="button-cancel"]').click();
      
      // Modal should close
      cy.get('[data-testid="document-type-modal"]').should('not.exist');
      
      // Original data should remain
      cy.get('[data-testid="document-type-item"]')
        .should('contain.text', mockDocumentType.name)
        .and('not.contain.text', 'Modified Name');
    });
  });

  describe('Document Types - Delete Operations', () => {
    const mockDocumentTypes = [
      {
        id: 1,
        name: 'Test Document Type',
        description: 'A test document type',
        category: 'certification',
        isRequired: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, mockDocumentTypes).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="button-delete"]').first().click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation"], [role="alertdialog"]')
        .should('be.visible');
      
      // Should show document type name
      cy.get('[data-testid="delete-confirmation"]')
        .should('contain.text', mockDocumentTypes[0].name);
      
      // Should have confirm and cancel buttons
      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', /delete|confirm/i);
      
      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible');
    });

    it('should delete document type on confirmation', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${mockDocumentTypes[0].id}`, {
        statusCode: 200
      }).as('deleteDocumentType');
      
      cy.intercept('GET', apiEndpoints.documentTypes, []).as('getEmptyDocumentTypes');

      cy.get('[data-testid="button-delete"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      // API call should be made
      cy.wait('@deleteDocumentType');
      
      // Success message
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);
      
      // Document type should be removed from list
      cy.get('[data-testid="document-type-item"]').should('not.exist');
    });

    it('should cancel delete operation', () => {
      cy.get('[data-testid="button-delete"]').first().click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation"]').should('not.exist');
      
      // Document type should still be visible
      cy.get('[data-testid="document-type-item"]')
        .should('contain.text', mockDocumentTypes[0].name);
    });

    it('should handle delete API errors', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${mockDocumentTypes[0].id}`, {
        statusCode: 400,
        body: { error: 'Cannot delete document type with associated documents' }
      }).as('deleteDocumentTypeError');

      cy.get('[data-testid="button-delete"]').first().click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentTypeError');
      
      // Error message should be shown
      cy.get('[data-testid="error-message"], .toast-error')
        .should('be.visible')
        .and('contain.text', /error|cannot delete/i);
      
      // Document type should still be visible
      cy.get('[data-testid="document-type-item"]')
        .should('contain.text', mockDocumentTypes[0].name);
    });
  });

  describe('Document Management - Consultant Documents', () => {
    const mockConsultant = {
      id: 1,
      userId: 1,
      firstName: 'Test',
      lastName: 'Consultant',
      email: 'consultant@test.com'
    };

    const mockDocumentTypes = [
      {
        id: 1,
        name: 'Medical License',
        description: 'State medical license',
        category: 'license',
        isRequired: true
      },
      {
        id: 2,
        name: 'DEA Certificate',
        description: 'DEA registration',
        category: 'certification',
        isRequired: true
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}`, mockConsultant).as('getConsultant');
      cy.intercept('GET', apiEndpoints.documentTypes, mockDocumentTypes).as('getDocumentTypes');
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}/documents`, []).as('getConsultantDocuments');
      
      cy.visit(`/consultants/${mockConsultant.id}/documents`);
      cy.wait(['@getConsultant', '@getDocumentTypes', '@getConsultantDocuments']);
    });

    it('should display consultant documents page layout', () => {
      // Page header with consultant name
      cy.get('[data-testid="page-header"]')
        .should('be.visible')
        .and('contain.text', `${mockConsultant.firstName} ${mockConsultant.lastName}`);
      
      // Upload document button
      cy.get('[data-testid="upload-document-button"]')
        .should('be.visible')
        .and('contain.text', /upload|add document/i);
      
      // Documents list
      cy.get('[data-testid="documents-list"], [data-testid="documents-table"]')
        .should('be.visible');
      
      // Document types filter
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-document-type"]').length > 0) {
          cy.get('[data-testid="filter-document-type"]').should('be.visible');
        }
      });
    });

    it('should show empty state for no documents', () => {
      cy.get('[data-testid="empty-documents"], [data-testid="no-documents"]')
        .should('be.visible')
        .and('contain.text', /no documents|upload your first/i);
      
      // Should show upload button
      cy.get('[data-testid="upload-first-document"], [data-testid="upload-document-button"]')
        .should('be.visible');
    });

    it('should open document upload modal', () => {
      cy.get('[data-testid="upload-document-button"]').click();
      
      // Upload modal should open
      cy.get('[data-testid="upload-document-modal"], [data-testid="document-upload-modal"]')
        .should('be.visible');
      
      // Document type selection
      cy.get('[data-testid="select-document-type"]')
        .should('be.visible');
      
      // File upload area
      cy.get('[data-testid="file-upload"], input[type="file"]')
        .should('be.visible');
      
      // Document title field
      cy.get('[data-testid="input-document-title"]')
        .should('be.visible');
      
      // Notes field
      cy.get('[data-testid="textarea-notes"], [data-testid="input-notes"]')
        .should('be.visible');
      
      // Expiry date field
      cy.get('[data-testid="input-expiry-date"]')
        .should('be.visible')
        .and('have.attr', 'type', 'date');
    });
  });

  describe('Document Upload Process', () => {
    const mockConsultant = { id: 1, firstName: 'Test', lastName: 'Consultant' };
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license', isRequired: true }
    ];

    beforeEach(() => {
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}`, mockConsultant).as('getConsultant');
      cy.intercept('GET', apiEndpoints.documentTypes, mockDocumentTypes).as('getDocumentTypes');
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}/documents`, []).as('getConsultantDocuments');
      
      cy.visit(`/consultants/${mockConsultant.id}/documents`);
      cy.wait(['@getConsultant', '@getDocumentTypes', '@getConsultantDocuments']);
      
      cy.get('[data-testid="upload-document-button"]').click();
    });

    it('should upload document with valid data', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 200,
        body: { 
          fileName: 'test-document.pdf',
          filePath: 'documents/test-document.pdf',
          fileSize: 1024,
          mimeType: 'application/pdf'
        }
      }).as('uploadFile');
      
      cy.intercept('POST', `/api/consultants/${mockConsultant.id}/documents`, {
        statusCode: 201,
        body: {
          id: 1,
          consultantId: mockConsultant.id,
          documentTypeId: 1,
          title: testData.documents.valid.title,
          fileName: 'test-document.pdf',
          filePath: 'documents/test-document.pdf',
          status: 'pending',
          expiryDate: testData.documents.valid.expiryDate,
          notes: testData.documents.valid.notes,
          createdAt: new Date().toISOString()
        }
      }).as('createDocument');

      // Select document type
      cy.get('[data-testid="select-document-type"]').select('1');
      
      // Upload file
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-document.pdf',
          mimeType: 'application/pdf'
        }, { force: true });
      });
      
      // Fill form fields
      cy.get('[data-testid="input-document-title"]')
        .type(testData.documents.valid.title);
      
      cy.get('[data-testid="textarea-notes"], [data-testid="input-notes"]')
        .type(testData.documents.valid.notes);
      
      cy.get('[data-testid="input-expiry-date"]')
        .type(testData.documents.valid.expiryDate);
      
      // Submit
      cy.get('[data-testid="button-upload"], [data-testid="button-save"]').click();
      
      // Verify file upload
      cy.wait('@uploadFile');
      
      // Verify document creation
      cy.wait('@createDocument').then((interception) => {
        expect(interception.request.body.title).to.equal(testData.documents.valid.title);
        expect(interception.request.body.documentTypeId).to.equal(1);
      });
      
      // Success message
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible')
        .and('contain.text', /uploaded|success/i);
      
      // Modal should close
      cy.get('[data-testid="upload-document-modal"]').should('not.exist');
    });

    it('should validate required fields during upload', () => {
      // Try to submit without selecting document type
      cy.get('[data-testid="button-upload"], [data-testid="button-save"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="error-document-type"], .error-message')
        .should('be.visible')
        .and('contain.text', /required|select/i);
      
      // Select document type but don't upload file
      cy.get('[data-testid="select-document-type"]').select('1');
      cy.get('[data-testid="button-upload"], [data-testid="button-save"]').click();
      
      cy.get('[data-testid="error-file"], .error-message')
        .should('be.visible')
        .and('contain.text', /file|required/i);
    });

    it('should validate file type restrictions', () => {
      cy.get('[data-testid="select-document-type"]').select('1');
      
      // Try to upload invalid file type
      cy.fixture('test-file.txt').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: fileContent,
          fileName: 'test-file.txt',
          mimeType: 'text/plain'
        }, { force: true });
      });
      
      cy.get('[data-testid="input-document-title"]')
        .type('Test Document');
      
      cy.get('[data-testid="button-upload"], [data-testid="button-save"]').click();
      
      // Should show file type error
      cy.get('[data-testid="error-file"], .error-message')
        .should('be.visible')
        .and('contain.text', /file type|invalid/i);
    });

    it('should handle file size limitations', () => {
      cy.get('[data-testid="select-document-type"]').select('1');
      
      // Create large file (simulate)
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      cy.get('input[type="file"]').selectFile({
        contents: largeContent,
        fileName: 'large-file.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.get('[data-testid="input-document-title"]')
        .type('Large Document');
      
      cy.get('[data-testid="button-upload"], [data-testid="button-save"]').click();
      
      // Should show file size error
      cy.get('[data-testid="error-file"], .error-message')
        .should('be.visible')
        .and('contain.text', /file size|too large/i);
    });

    it('should handle upload API errors', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 500,
        body: { error: 'Upload failed' }
      }).as('uploadFileError');

      cy.get('[data-testid="select-document-type"]').select('1');
      
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        cy.get('input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test-document.pdf',
          mimeType: 'application/pdf'
        }, { force: true });
      });
      
      cy.get('[data-testid="input-document-title"]')
        .type('Test Document');
      
      cy.get('[data-testid="button-upload"], [data-testid="button-save"]').click();
      
      cy.wait('@uploadFileError');
      
      // Error message should be shown
      cy.get('[data-testid="error-message"], .toast-error')
        .should('be.visible')
        .and('contain.text', /upload failed|error/i);
    });
  });

  describe('Document Status Management', () => {
    const mockConsultant = { id: 1, firstName: 'Test', lastName: 'Consultant' };
    const mockDocuments = [
      {
        id: 1,
        consultantId: 1,
        documentTypeId: 1,
        title: 'Medical License',
        fileName: 'license.pdf',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', category: 'license' }
    ];

    beforeEach(() => {
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}`, mockConsultant).as('getConsultant');
      cy.intercept('GET', apiEndpoints.documentTypes, mockDocumentTypes).as('getDocumentTypes');
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}/documents`, mockDocuments).as('getConsultantDocuments');
      
      cy.visit(`/consultants/${mockConsultant.id}/documents`);
      cy.wait(['@getConsultant', '@getDocumentTypes', '@getConsultantDocuments']);
    });

    it('should display document with current status', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.should('contain.text', mockDocuments[0].title);
        cy.get('[data-testid="document-status"], .status-badge')
          .should('be.visible')
          .and('contain.text', 'pending');
      });
    });

    it('should show status change options for admin users', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        // Status dropdown or actions menu
        cy.get('[data-testid="status-dropdown"], [data-testid="document-actions"]')
          .should('be.visible');
      });
    });

    it('should approve document status', () => {
      cy.intercept('PATCH', `/api/documents/${mockDocuments[0].id}/status`, {
        statusCode: 200,
        body: { ...mockDocuments[0], status: 'approved' }
      }).as('updateDocumentStatus');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="status-dropdown"], [data-testid="approve-button"]').click();
      });
      
      // Select approve option
      cy.get('[data-testid="approve-option"], [data-value="approved"]').click();
      
      cy.wait('@updateDocumentStatus');
      
      // Status should update
      cy.get('[data-testid="document-status"]')
        .should('contain.text', 'approved');
      
      // Success message
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible');
    });

    it('should reject document with reason', () => {
      cy.intercept('PATCH', `/api/documents/${mockDocuments[0].id}/status`, {
        statusCode: 200,
        body: { ...mockDocuments[0], status: 'rejected', rejectionReason: 'Document expired' }
      }).as('updateDocumentStatus');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="status-dropdown"], [data-testid="reject-button"]').click();
      });
      
      // Select reject option
      cy.get('[data-testid="reject-option"], [data-value="rejected"]').click();
      
      // Rejection reason modal should open
      cy.get('[data-testid="rejection-reason-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="textarea-rejection-reason"]')
        .type('Document expired');
      
      cy.get('[data-testid="button-confirm-rejection"]').click();
      
      cy.wait('@updateDocumentStatus');
      
      // Status should update
      cy.get('[data-testid="document-status"]')
        .should('contain.text', 'rejected');
    });

    it('should handle status update errors', () => {
      cy.intercept('PATCH', `/api/documents/${mockDocuments[0].id}/status`, {
        statusCode: 400,
        body: { error: 'Invalid status transition' }
      }).as('updateDocumentStatusError');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="status-dropdown"]').click();
      });
      
      cy.get('[data-testid="approve-option"]').click();
      
      cy.wait('@updateDocumentStatusError');
      
      // Error message should be shown
      cy.get('[data-testid="error-message"], .toast-error')
        .should('be.visible')
        .and('contain.text', /error|invalid/i);
    });
  });

  describe('Document Viewing and Actions', () => {
    const mockConsultant = { id: 1, firstName: 'Test', lastName: 'Consultant' };
    const mockDocuments = [
      {
        id: 1,
        consultantId: 1,
        documentTypeId: 1,
        title: 'Medical License',
        fileName: 'license.pdf',
        filePath: 'documents/license.pdf',
        status: 'approved',
        expiryDate: '2025-12-31',
        notes: 'State medical license',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}`, mockConsultant).as('getConsultant');
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}/documents`, mockDocuments).as('getConsultantDocuments');
      
      cy.visit(`/consultants/${mockConsultant.id}/documents`);
      cy.wait(['@getConsultant', '@getConsultantDocuments']);
    });

    it('should display document information correctly', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        // Document title
        cy.should('contain.text', mockDocuments[0].title);
        
        // File name
        cy.should('contain.text', mockDocuments[0].fileName);
        
        // Status
        cy.get('[data-testid="document-status"]')
          .should('contain.text', 'approved');
        
        // Expiry date
        cy.should('contain.text', '2025-12-31');
        
        // Notes
        cy.should('contain.text', mockDocuments[0].notes);
      });
    });

    it('should show document action buttons', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        // View/Download button
        cy.get('[data-testid="button-view"], [data-testid="button-download"]')
          .should('be.visible');
        
        // Edit button
        cy.get('[data-testid="button-edit"]')
          .should('be.visible');
        
        // Delete button
        cy.get('[data-testid="button-delete"]')
          .should('be.visible');
      });
    });

    it('should open document viewer/downloader', () => {
      cy.intercept('GET', `/objects/documents/license.pdf`, {
        statusCode: 200,
        headers: { 'content-type': 'application/pdf' }
      }).as('getDocument');

      cy.get('[data-testid="button-view"], [data-testid="button-download"]')
        .first()
        .click();
      
      // Should either open in new tab or start download
      cy.wait('@getDocument');
    });

    it('should open edit document modal', () => {
      cy.get('[data-testid="button-edit"]').first().click();
      
      // Edit modal should open
      cy.get('[data-testid="edit-document-modal"]')
        .should('be.visible');
      
      // Fields should be pre-populated
      cy.get('[data-testid="input-document-title"]')
        .should('have.value', mockDocuments[0].title);
      
      cy.get('[data-testid="textarea-notes"], [data-testid="input-notes"]')
        .should('have.value', mockDocuments[0].notes);
      
      cy.get('[data-testid="input-expiry-date"]')
        .should('have.value', mockDocuments[0].expiryDate);
    });

    it('should update document information', () => {
      cy.intercept('PATCH', `/api/documents/${mockDocuments[0].id}`, {
        statusCode: 200,
        body: { ...mockDocuments[0], ...testData.documents.update }
      }).as('updateDocument');

      cy.get('[data-testid="button-edit"]').first().click();
      
      // Update fields
      cy.get('[data-testid="input-document-title"]')
        .clear()
        .type(testData.documents.update.title);
      
      cy.get('[data-testid="textarea-notes"], [data-testid="input-notes"]')
        .clear()
        .type(testData.documents.update.notes);
      
      // Save changes
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@updateDocument');
      
      // Success message
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible');
      
      // Updated data should be visible
      cy.get('[data-testid="document-item"]')
        .should('contain.text', testData.documents.update.title);
    });

    it('should delete document with confirmation', () => {
      cy.intercept('DELETE', `/api/documents/${mockDocuments[0].id}`, {
        statusCode: 200
      }).as('deleteDocument');

      cy.get('[data-testid="button-delete"]').first().click();
      
      // Confirmation dialog
      cy.get('[data-testid="delete-confirmation"]')
        .should('be.visible')
        .and('contain.text', mockDocuments[0].title);
      
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocument');
      
      // Success message
      cy.get('[data-testid="success-message"], .toast-success')
        .should('be.visible');
      
      // Document should be removed
      cy.get('[data-testid="document-item"]').should('not.exist');
    });

    it('should show expiry warnings for documents', () => {
      const expiringDocument = {
        ...mockDocuments[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      };
      
      cy.intercept('GET', `/api/consultants/${mockConsultant.id}/documents`, [expiringDocument]).as('getExpiringDocuments');
      
      cy.reload();
      cy.wait('@getExpiringDocuments');
      
      // Should show expiry warning
      cy.get('[data-testid="expiry-warning"], .expiry-badge')
        .should('be.visible')
        .and('contain.text', /expiring|expires/i);
    });
  });

  describe('Document Types - Responsive Design', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, []).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should work correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // Page should be visible
      cy.get('[data-testid="page-header"]').should('be.visible');
      
      // Mobile menu or responsive layout
      cy.get('body').then(($body) => {
        // Check for mobile-specific elements
        if ($body.find('[data-testid="mobile-menu"]').length > 0) {
          cy.get('[data-testid="mobile-menu"]').should('be.visible');
        }
      });
      
      // Add button should be accessible
      cy.get('[data-testid="add-document-type-button"]')
        .should('be.visible')
        .and('not.be.covered');
    });

    it('should work correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="add-document-type-button"]').should('be.visible');
      
      // Open modal and check responsiveness
      cy.get('[data-testid="add-document-type-button"]').click();
      cy.get('[data-testid="document-type-modal"]').should('be.visible');
    });
  });

  describe('Document Types - Error Handling & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
    });

    it('should handle API timeout errors', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        delay: 30000 // 30 second delay to simulate timeout
      }).as('getDocumentTypesTimeout');
      
      cy.reload();
      
      // Should show loading state first
      cy.get('[data-testid="loading"], .loading-spinner')
        .should('be.visible');
      
      // Then error state after timeout
      cy.get('[data-testid="error-message"], .error-state', { timeout: 35000 })
        .should('be.visible')
        .and('contain.text', /error|failed|timeout/i);
      
      // Retry button should be available
      cy.get('[data-testid="retry-button"]')
        .should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { forceNetworkError: true }).as('getDocumentTypesNetworkError');
      
      cy.reload();
      cy.wait('@getDocumentTypesNetworkError');
      
      // Network error message
      cy.get('[data-testid="error-message"], .error-state')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 403,
        body: { error: 'Unauthorized' }
      }).as('getDocumentTypesUnauthorized');
      
      cy.reload();
      cy.wait('@getDocumentTypesUnauthorized');
      
      // Should redirect to login or show unauthorized message
      cy.url().should('match', /\/login|\/unauthorized/);
    });

    it('should gracefully handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { invalid: 'response' } // Not an array
      }).as('getDocumentTypesMalformed');
      
      cy.reload();
      cy.wait('@getDocumentTypesMalformed');
      
      // Should show error or empty state
      cy.get('[data-testid="error-message"], [data-testid="empty-state"]')
        .should('be.visible');
    });
  });

  describe('Document Types - Performance & Loading States', () => {
    beforeEach(() => {
=======
    consultantDocuments: '/api/consultants/*/documents'
  };

  beforeEach(() => {
    // Clear state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin
    cy.request('POST', '/api/auth/login', {
      email: testData.user.email,
      password: testData.user.password
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.setCookie('auth-token', response.body.token);
    });
  });

  describe('Document Types Page - Access and Navigation', () => {
    it('should navigate to document types page successfully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Verify page loads
      cy.url().should('include', '/admin/document-types');
      cy.get('[data-testid="document-types-page"]', { timeout: 10000 })
        .should('be.visible');
    });

    it('should have proper page layout and navigation elements', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types/list.json' }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1, [data-testid="page-title"]').should('contain.text', /document types/i);

      // Navigation breadcrumb
      cy.get('[data-testid="breadcrumb"], nav[aria-label="breadcrumb"]').should('be.visible');

      // Main action button
      cy.get('[data-testid="create-document-type-button"]', { timeout: 5000 }).should('be.visible');
    });

    it('should display document types list with proper columns', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Medical License',
            description: 'State medical license certification',
            isRequired: true,
            expiresAfterDays: 365,
            fileTypes: 'pdf,jpg,png',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          }
        ]
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Table should be visible
      cy.get('[data-testid="document-types-table"], table').should('be.visible');

      // Table headers
      cy.get('th').should('contain.text', 'Name');
      cy.get('th').should('contain.text', 'Description');
      cy.get('th').should('contain.text', 'Required');
      cy.get('th').should('contain.text', 'Expires');
      cy.get('th').should('contain.text', 'File Types');
      cy.get('th').should('contain.text', 'Actions');

      // Data rows
      cy.get('tbody tr').should('have.length', 2);
      cy.get('tbody tr').first().should('contain.text', 'Resume');
      cy.get('tbody tr').first().should('contain.text', 'Professional resume document');
      cy.get('tbody tr').first().should('contain.text', 'Yes');
    });
  });

  describe('Document Types List - Data Display and Interaction', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Medical License',
            description: 'State medical license certification',
            isRequired: true,
            expiresAfterDays: 365,
            fileTypes: 'pdf,jpg,png',
            createdAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '3',
            name: 'Reference Letter',
            description: 'Professional reference letter',
            isRequired: false,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ]
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document type data correctly', () => {
      // Required field display
      cy.get('tbody tr').first().within(() => {
        cy.get('td').eq(2).should('contain.text', /yes|required|true/i);
      });

      cy.get('tbody tr').last().within(() => {
        cy.get('td').eq(2).should('contain.text', /no|optional|false/i);
      });

      // Expiration display
      cy.get('tbody tr').eq(1).within(() => {
        cy.get('td').eq(3).should('contain.text', '365');
      });

      cy.get('tbody tr').first().within(() => {
        cy.get('td').eq(3).should('contain.text', /never|no|none|-/i);
      });

      // File types display
      cy.get('tbody tr').first().within(() => {
        cy.get('td').eq(4).should('contain.text', 'pdf,doc,docx');
      });
    });

    it('should show action buttons for each row', () => {
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          // Edit button
          cy.get('[data-testid="edit-document-type"], [aria-label*="edit"], button')
            .contains(/edit/i).should('be.visible');
          
          // Delete button
          cy.get('[data-testid="delete-document-type"], [aria-label*="delete"], button')
            .contains(/delete/i).should('be.visible');
        });
      });
    });

    it('should handle empty state properly', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getEmptyDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getEmptyDocumentTypes');

      // Empty state message
      cy.get('[data-testid="empty-state"], .empty-state').should('be.visible');
      cy.get('body').should('contain.text', /no document types|empty|nothing to show/i);

      // Create button should still be visible
      cy.get('[data-testid="create-document-type-button"]').should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { statusCode: 500, body: { error: 'Server error' } }).as('getDocumentTypesError');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypesError');

      // Error message should be displayed
      cy.get('[data-testid="error-message"], .error-message, .alert-error').should('be.visible');
      cy.get('body').should('contain.text', /error|failed|something went wrong/i);
    });
  });

  describe('Create Document Type - Form and Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getDocumentTypes');
>>>>>>> Stashed changes
      cy.visit('/admin/document-types');
    });

<<<<<<< Updated upstream
    it('should show loading states during API calls', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        delay: 2000,
        statusCode: 200,
        body: []
      }).as('getDocumentTypesDelayed');
      
      cy.reload();
      
      // Should show loading indicator
      cy.get('[data-testid="loading"], .loading-spinner')
        .should('be.visible');
      
      cy.wait('@getDocumentTypesDelayed');
      
      // Loading should disappear
      cy.get('[data-testid="loading"], .loading-spinner')
        .should('not.exist');
    });

    it('should handle large datasets efficiently', () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Document Type ${i + 1}`,
        description: `Description for document type ${i + 1}`,
        category: i % 2 === 0 ? 'license' : 'certification',
        isRequired: i % 3 === 0,
        createdAt: new Date().toISOString()
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, largeDataset).as('getLargeDocumentTypes');
      
      cy.reload();
      cy.wait('@getLargeDocumentTypes');
      
      // Should handle large dataset without performance issues
      cy.get('[data-testid="document-type-item"]', { timeout: 10000 })
        .should('have.length.at.least', 10); // At least first page
      
      // Pagination should be present for large datasets
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
=======
    it('should open create document type form', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      // Form should be visible (modal or page)
      cy.get('[data-testid="create-document-type-form"], [data-testid="document-type-form"]', { timeout: 5000 })
        .should('be.visible');

      // Form title
      cy.get('h1, h2, h3, [data-testid="form-title"]').should('contain.text', /create|new|add/i);
      cy.get('h1, h2, h3, [data-testid="form-title"]').should('contain.text', /document type/i);
    });

    it('should display all required form fields', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      // Name field
      cy.get('[data-testid="input-name"], input[name="name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('label').contains(/name/i).should('be.visible');

      // Description field
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .should('be.visible');
      cy.get('label').contains(/description/i).should('be.visible');

      // Required checkbox/toggle
      cy.get('[data-testid="input-required"], input[name="isRequired"], input[type="checkbox"]')
        .should('be.visible');
      cy.get('label').contains(/required/i).should('be.visible');

      // Expiration field
      cy.get('[data-testid="input-expiration"], input[name="expiresAfterDays"]')
        .should('be.visible');
      cy.get('label').contains(/expir/i).should('be.visible');

      // File types field
      cy.get('[data-testid="input-file-types"], input[name="fileTypes"]')
        .should('be.visible');
      cy.get('label').contains(/file types/i).should('be.visible');

      // Submit button
      cy.get('[data-testid="submit-button"], button[type="submit"]')
        .should('be.visible')
        .and('contain.text', /create|save|add/i);

      // Cancel button
      cy.get('[data-testid="cancel-button"], button').contains(/cancel|close/i)
        .should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      // Try to submit empty form
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Name validation error
      cy.get('[data-testid="error-name"], .field-error').should('be.visible');
      cy.get('body').should('contain.text', /name is required|required field/i);

      // Form should not be submitted
      cy.get('[data-testid="document-type-form"]').should('be.visible');
    });

    it('should validate field length limits', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      // Test name field max length
      const longName = 'A'.repeat(256);
      cy.get('[data-testid="input-name"], input[name="name"]').type(longName);
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.get('[data-testid="error-name"], .field-error')
        .should('be.visible')
        .and('contain.text', /too long|maximum|limit/i);
    });

    it('should validate expiration days as positive number', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      // Fill required fields
      cy.get('[data-testid="input-name"], input[name="name"]').type('Test Document');

      // Test negative number
      cy.get('[data-testid="input-expiration"], input[name="expiresAfterDays"]').type('-10');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.get('[data-testid="error-expiration"], .field-error')
        .should('be.visible')
        .and('contain.text', /positive|greater than zero|invalid/i);

      // Test zero
      cy.get('[data-testid="input-expiration"], input[name="expiresAfterDays"]').clear().type('0');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.get('[data-testid="error-expiration"], .field-error')
        .should('be.visible')
        .and('contain.text', /positive|greater than zero|invalid/i);
    });

    it('should successfully create document type with valid data', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: '1', ...testData.documentTypes.valid }
      }).as('createDocumentType');

      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [{ id: '1', ...testData.documentTypes.valid }]
      }).as('getUpdatedDocumentTypes');

      cy.get('[data-testid="create-document-type-button"]').click();

      // Fill form
      cy.get('[data-testid="input-name"], input[name="name"]').type(testData.documentTypes.valid.name);
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .type(testData.documentTypes.valid.description);
      
      // Set required checkbox
      if (testData.documentTypes.valid.isRequired) {
        cy.get('[data-testid="input-required"], input[name="isRequired"]').check();
      }

      // File types
      cy.get('[data-testid="input-file-types"], input[name="fileTypes"]')
        .type(testData.documentTypes.valid.fileTypes);

      // Submit
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.wait('@createDocumentType');
      cy.wait('@getUpdatedDocumentTypes');

      // Success message
      cy.get('[data-testid="success-message"], .alert-success, .toast-success')
        .should('be.visible');
      cy.get('body').should('contain.text', /created|added|success/i);

      // Should return to list
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      cy.get('tbody tr').should('contain.text', testData.documentTypes.valid.name);
    });

    it('should create document type with expiration', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: '2', ...testData.documentTypes.withExpiration }
      }).as('createDocumentType');

      cy.get('[data-testid="create-document-type-button"]').click();

      // Fill form with expiration
      cy.get('[data-testid="input-name"], input[name="name"]').type(testData.documentTypes.withExpiration.name);
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .type(testData.documentTypes.withExpiration.description);
      cy.get('[data-testid="input-required"], input[name="isRequired"]').check();
      cy.get('[data-testid="input-expiration"], input[name="expiresAfterDays"]')
        .type(testData.documentTypes.withExpiration.expiresAfterDays.toString());
      cy.get('[data-testid="input-file-types"], input[name="fileTypes"]')
        .type(testData.documentTypes.withExpiration.fileTypes);

      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body.name).to.eq(testData.documentTypes.withExpiration.name);
        expect(interception.request.body.expiresAfterDays).to.eq(testData.documentTypes.withExpiration.expiresAfterDays);
        expect(interception.request.body.isRequired).to.eq(testData.documentTypes.withExpiration.isRequired);
      });
    });

    it('should handle create API errors', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { error: 'Document type name already exists' }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="create-document-type-button"]').click();

      // Fill form
      cy.get('[data-testid="input-name"], input[name="name"]').type('Existing Document');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.wait('@createDocumentTypeError');

      // Error message should be displayed
      cy.get('[data-testid="error-message"], .alert-error, .field-error')
        .should('be.visible')
        .and('contain.text', /already exists|error/i);

      // Form should remain open
      cy.get('[data-testid="document-type-form"]').should('be.visible');
    });

    it('should cancel form and return to list', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      // Fill some data
      cy.get('[data-testid="input-name"], input[name="name"]').type('Test Data');

      // Cancel
      cy.get('[data-testid="cancel-button"], button').contains(/cancel|close/i).click();

      // Should return to list without saving
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-page"]').should('be.visible');
      cy.get('[data-testid="document-type-form"]').should('not.exist');
    });
  });

  describe('Edit Document Type - Form and Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx'
          }
        ]
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open edit form with pre-filled data', () => {
      cy.get('[data-testid="edit-document-type"], button').contains(/edit/i).first().click();

      // Form should be visible with title indicating edit mode
      cy.get('[data-testid="edit-document-type-form"], [data-testid="document-type-form"]')
        .should('be.visible');
      cy.get('h1, h2, h3').should('contain.text', /edit|update/i);

      // Fields should be pre-filled
      cy.get('[data-testid="input-name"], input[name="name"]')
        .should('have.value', 'Resume');
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .should('have.value', 'Professional resume document');
      cy.get('[data-testid="input-required"], input[name="isRequired"]')
        .should('be.checked');
      cy.get('[data-testid="input-file-types"], input[name="fileTypes"]')
        .should('have.value', 'pdf,doc,docx');
    });

    it('should successfully update document type', () => {
      cy.intercept('PATCH', '/api/document-types/1', {
        statusCode: 200,
        body: {
          id: '1',
          name: 'Updated Resume',
          description: 'Updated description',
          isRequired: false,
          expiresAfterDays: 180,
          fileTypes: 'pdf,docx'
        }
      }).as('updateDocumentType');

      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [{
          id: '1',
          name: 'Updated Resume',
          description: 'Updated description',
          isRequired: false,
          expiresAfterDays: 180,
          fileTypes: 'pdf,docx'
        }]
      }).as('getUpdatedDocumentTypes');

      cy.get('[data-testid="edit-document-type"], button').contains(/edit/i).first().click();

      // Update fields
      cy.get('[data-testid="input-name"], input[name="name"]').clear().type('Updated Resume');
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .clear().type('Updated description');
      cy.get('[data-testid="input-required"], input[name="isRequired"]').uncheck();
      cy.get('[data-testid="input-expiration"], input[name="expiresAfterDays"]').type('180');
      cy.get('[data-testid="input-file-types"], input[name="fileTypes"]').clear().type('pdf,docx');

      // Submit
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.wait('@updateDocumentType');
      cy.wait('@getUpdatedDocumentTypes');

      // Success message
      cy.get('[data-testid="success-message"], .alert-success').should('be.visible');

      // Verify updated data in list
      cy.get('tbody tr').should('contain.text', 'Updated Resume');
      cy.get('tbody tr').should('contain.text', 'Updated description');
    });

    it('should validate edit form fields', () => {
      cy.get('[data-testid="edit-document-type"], button').contains(/edit/i).first().click();

      // Clear required field
      cy.get('[data-testid="input-name"], input[name="name"]').clear();
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Should show validation error
      cy.get('[data-testid="error-name"], .field-error').should('be.visible');
      cy.get('body').should('contain.text', /name is required/i);
    });

    it('should handle update API errors', () => {
      cy.intercept('PATCH', '/api/document-types/1', {
        statusCode: 409,
        body: { error: 'Document type name already exists' }
      }).as('updateDocumentTypeError');

      cy.get('[data-testid="edit-document-type"], button').contains(/edit/i).first().click();

      cy.get('[data-testid="input-name"], input[name="name"]').clear().type('Existing Name');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.wait('@updateDocumentTypeError');

      // Error message
      cy.get('[data-testid="error-message"], .alert-error').should('be.visible');
      cy.get('body').should('contain.text', /already exists|error/i);
    });
  });

  describe('Delete Document Type - Confirmation and Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx'
          },
          {
            id: '2',
            name: 'Reference Letter',
            description: 'Optional reference letter',
            isRequired: false,
            expiresAfterDays: null,
            fileTypes: 'pdf'
          }
        ]
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show delete confirmation dialog', () => {
      cy.get('[data-testid="delete-document-type"], button').contains(/delete/i).first().click();

      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal')
        .should('be.visible');

      // Confirmation message
      cy.get('body').should('contain.text', /are you sure|confirm|delete/i);
      cy.get('body').should('contain.text', /resume/i);

      // Confirmation buttons
      cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i)
        .should('be.visible');
      cy.get('[data-testid="cancel-delete"], button').contains(/cancel/i)
        .should('be.visible');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="delete-document-type"], button').contains(/delete/i).first().click();

      // Cancel deletion
      cy.get('[data-testid="cancel-delete"], button').contains(/cancel/i).click();

      // Dialog should close
      cy.get('[data-testid="delete-confirmation"], [role="dialog"]').should('not.exist');

      // Item should still exist
      cy.get('tbody tr').should('contain.text', 'Resume');
    });

    it('should successfully delete document type', () => {
      cy.intercept('DELETE', '/api/document-types/1', {
        statusCode: 204
      }).as('deleteDocumentType');

      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [{
          id: '2',
          name: 'Reference Letter',
          description: 'Optional reference letter',
          isRequired: false,
          expiresAfterDays: null,
          fileTypes: 'pdf'
        }]
      }).as('getUpdatedDocumentTypes');

      cy.get('[data-testid="delete-document-type"], button').contains(/delete/i).first().click();

      // Confirm deletion
      cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();

      cy.wait('@deleteDocumentType');
      cy.wait('@getUpdatedDocumentTypes');

      // Success message
      cy.get('[data-testid="success-message"], .alert-success').should('be.visible');
      cy.get('body').should('contain.text', /deleted|removed|success/i);

      // Item should be removed from list
      cy.get('tbody tr').should('have.length', 1);
      cy.get('tbody tr').should('not.contain.text', 'Resume');
      cy.get('tbody tr').should('contain.text', 'Reference Letter');
    });

    it('should handle delete API errors', () => {
      cy.intercept('DELETE', '/api/document-types/1', {
        statusCode: 400,
        body: { error: 'Cannot delete document type that is in use' }
      }).as('deleteDocumentTypeError');

      cy.get('[data-testid="delete-document-type"], button').contains(/delete/i).first().click();
      cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();

      cy.wait('@deleteDocumentTypeError');

      // Error message
      cy.get('[data-testid="error-message"], .alert-error').should('be.visible');
      cy.get('body').should('contain.text', /cannot delete|in use|error/i);

      // Item should still exist
      cy.get('tbody tr').should('contain.text', 'Resume');
    });

    it('should prevent deletion of document types in use', () => {
      cy.intercept('DELETE', '/api/document-types/1', {
        statusCode: 409,
        body: { error: 'Document type is required by consultants' }
      }).as('deleteDocumentTypeConflict');

      cy.get('[data-testid="delete-document-type"], button').contains(/delete/i).first().click();
      cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();

      cy.wait('@deleteDocumentTypeConflict');

      // Specific error about being in use
      cy.get('[data-testid="error-message"], .alert-error').should('be.visible');
      cy.get('body').should('contain.text', /required by consultants|in use/i);
    });
  });

  describe('Document Types Integration - Consultant Documents', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx'
          },
          {
            id: '2',
            name: 'Medical License',
            description: 'State medical license certification',
            isRequired: true,
            expiresAfterDays: 365,
            fileTypes: 'pdf,jpg,png'
          }
        ]
      }).as('getDocumentTypes');
    });

    it('should display document types in consultant document upload', () => {
      cy.intercept('GET', '/api/consultants/ci-test-consultant/documents', { body: [] }).as('getConsultantDocuments');
      
      cy.visit('/consultants/ci-test-consultant/documents');
      cy.wait('@getConsultantDocuments');

      // Document types should be available in upload form
      cy.get('[data-testid="upload-document-button"], button').contains(/upload|add/i).click();

      // Document type selector
      cy.get('[data-testid="select-document-type"], select[name="documentTypeId"]')
        .should('be.visible');

      // Options should include our document types
      cy.get('[data-testid="select-document-type"] option, .select-option').should('contain.text', 'Resume');
      cy.get('[data-testid="select-document-type"] option, .select-option').should('contain.text', 'Medical License');
    });

    it('should enforce file type restrictions based on document type', () => {
      cy.intercept('GET', '/api/consultants/ci-test-consultant/documents', { body: [] }).as('getConsultantDocuments');
      
      cy.visit('/consultants/ci-test-consultant/documents');
      cy.wait('@getConsultantDocuments');

      cy.get('[data-testid="upload-document-button"], button').contains(/upload|add/i).click();

      // Select document type with specific file restrictions
      cy.get('[data-testid="select-document-type"], select[name="documentTypeId"]').select('Medical License');

      // File input should have accept attribute based on document type
      cy.get('input[type="file"]').should('have.attr', 'accept');
    });

    it('should show expiration warnings for expiring document types', () => {
      cy.intercept('GET', '/api/consultants/ci-test-consultant/documents', {
        body: [
          {
            id: '1',
            documentTypeId: '2',
            documentType: { name: 'Medical License', expiresAfterDays: 365 },
            filename: 'license.pdf',
            uploadedAt: '2023-01-01T00:00:00Z',
            expiresAt: '2024-01-01T00:00:00Z',
            status: 'approved'
          }
        ]
      }).as('getConsultantDocuments');

      cy.visit('/consultants/ci-test-consultant/documents');
      cy.wait('@getConsultantDocuments');

      // Should show expiration information
      cy.get('[data-testid="document-expiration"], .expiration-warning').should('be.visible');
      cy.get('body').should('contain.text', /expires|expiration/i);
    });
  });

  describe('Document Types - Search and Filtering', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx'
          },
          {
            id: '2',
            name: 'Medical License',
            description: 'State medical license certification',
            isRequired: true,
            expiresAfterDays: 365,
            fileTypes: 'pdf,jpg,png'
          },
          {
            id: '3',
            name: 'Reference Letter',
            description: 'Professional reference letter',
            isRequired: false,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx'
          }
        ]
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should search document types by name', () => {
      // Search functionality if exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"], input[placeholder*="search"]').length > 0) {
          cy.get('[data-testid="search-document-types"], input[placeholder*="search"]')
            .type('medical');

          // Should filter results
          cy.get('tbody tr').should('have.length', 1);
          cy.get('tbody tr').should('contain.text', 'Medical License');
>>>>>>> Stashed changes
        }
      });
    });

<<<<<<< Updated upstream
    it('should debounce search input properly', () => {
      const searchTerm = 'medical license';
      
      cy.intercept('GET', `${apiEndpoints.documentTypes}*`, []).as('searchDocumentTypes');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          // Type search term character by character
          searchTerm.split('').forEach((char, index) => {
            cy.get('[data-testid="search-document-types"]').type(char);
            cy.wait(100); // Small delay between characters
          });
          
          // Should only make one API call after debounce period
          cy.wait('@searchDocumentTypes');
          cy.get('@searchDocumentTypes.all').should('have.length', 1);
        }
      });
=======
    it('should filter by required status', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-required"], select, .filter-required').length > 0) {
          cy.get('[data-testid="filter-required"]').select('Required Only');

          // Should show only required documents
          cy.get('tbody tr').should('have.length', 2);
          cy.get('tbody tr').should('not.contain.text', 'Reference Letter');
        }
      });
    });

    it('should sort by name', () => {
      cy.get('body').then(($body) => {
        if ($body.find('th[data-sort="name"], th').length > 0) {
          // Click name header to sort
          cy.get('th').contains('Name').click();

          // Check order (first should be Medical License alphabetically)
          cy.get('tbody tr').first().should('contain.text', 'Medical License');
        }
      });
    });
  });

  describe('Document Types - Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [
          {
            id: '1',
            name: 'Resume',
            description: 'Professional resume document',
            isRequired: true,
            expiresAfterDays: null,
            fileTypes: 'pdf,doc,docx'
          }
        ]
      }).as('getDocumentTypes');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Page should be visible and usable
      cy.get('[data-testid="document-types-page"]').should('be.visible');
      cy.get('[data-testid="create-document-type-button"]').should('be.visible');

      // Table should be responsive (might be cards on mobile)
      cy.get('[data-testid="document-types-table"], .document-types-list').should('be.visible');
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // All elements should be visible and properly sized
      cy.get('[data-testid="document-types-page"]').should('be.visible');
      cy.get('table, .document-types-list').should('be.visible');
      cy.get('[data-testid="create-document-type-button"]').should('be.visible');
    });

    it('should have proper ARIA labels and accessibility features', () => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Page should have proper headings
      cy.get('h1, [role="heading"]').should('exist');

      // Table should have proper accessibility
      cy.get('table').should('have.attr', 'role');
      cy.get('th').should('have.attr', 'scope', 'col');

      // Buttons should have proper labels
      cy.get('[data-testid="create-document-type-button"]')
        .should('have.attr', 'aria-label')
        .or('have.text');

      // Form fields should have labels
      cy.get('[data-testid="create-document-type-button"]').click();
      cy.get('input, textarea, select').each(($input) => {
        cy.wrap($input).should('have.attr', 'aria-label')
          .or('have.attr', 'id');
      });
    });

    it('should support keyboard navigation', () => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('be.visible');

      // Should be able to activate create button with Enter/Space
      cy.get('[data-testid="create-document-type-button"]').focus().type('{enter}');
      cy.get('[data-testid="document-type-form"]').should('be.visible');

      // Should be able to navigate form with keyboard
      cy.get('[data-testid="input-name"]').should('be.focused');
      cy.tab();
      cy.focused().should('not.have.attr', 'data-testid', 'input-name');
    });
  });

  describe('Document Types - Performance and Loading States', () => {
    it('should show loading state while fetching document types', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        req.reply({ body: [], delay: 2000 });
      }).as('getDocumentTypesDelay');

      cy.visit('/admin/document-types');

      // Loading indicator should be visible
      cy.get('[data-testid="loading"], .loading, .spinner').should('be.visible');

      cy.wait('@getDocumentTypesDelay');

      // Loading should disappear
      cy.get('[data-testid="loading"], .loading, .spinner').should('not.exist');
    });

    it('should handle concurrent API calls gracefully', () => {
      let callCount = 0;
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        callCount++;
        req.reply({ body: [{ id: callCount.toString(), name: `Doc ${callCount}` }] });
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Trigger multiple refreshes
      cy.reload();
      cy.wait('@getDocumentTypes');
      cy.reload();
      cy.wait('@getDocumentTypes');

      // Should handle gracefully without errors
      cy.get('[data-testid="document-types-table"]').should('be.visible');
    });

    it('should handle form submission loading states', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getDocumentTypes');
      cy.intercept('POST', apiEndpoints.documentTypes, (req) => {
        req.reply({ statusCode: 201, body: { id: '1', ...req.body }, delay: 1000 });
      }).as('createDocumentTypeDelay');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      cy.get('[data-testid="create-document-type-button"]').click();

      // Fill form
      cy.get('[data-testid="input-name"]').type('Test Document');

      // Submit and check loading state
      cy.get('[data-testid="submit-button"]').click();

      // Button should show loading state
      cy.get('[data-testid="submit-button"]').should('be.disabled');
      cy.get('[data-testid="submit-button"], .loading').should('contain.text', /saving|loading/i);

      cy.wait('@createDocumentTypeDelay');

      // Button should return to normal
      cy.get('[data-testid="submit-button"]').should('not.be.disabled');
>>>>>>> Stashed changes
    });
  });
});
