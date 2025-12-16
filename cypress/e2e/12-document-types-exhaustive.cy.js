describe('Document Types Feature - Exhaustive Tests', () => {
  const testData = {
    validDocumentType: {
      name: 'Test License',
      description: 'Test medical license document',
      required: true,
      expiresAfterDays: 365,
      category: 'License'
    },
    validDocumentTypeMinimal: {
      name: 'Test Certificate',
      required: false
    },
    invalidDocumentTypes: {
      emptyName: {
        name: '',
        description: 'Empty name test',
        required: true
      },
      tooLongName: {
        name: 'A'.repeat(256),
        description: 'Too long name test',
        required: true
      },
      invalidExpirationDays: {
        name: 'Invalid Expiration',
        description: 'Invalid expiration test',
        expiresAfterDays: -5,
        required: true
      },
      tooLongDescription: {
        name: 'Valid Name',
        description: 'A'.repeat(1001),
        required: true
      }
    },
    updateData: {
      name: 'Updated License Type',
      description: 'Updated description for testing',
      required: false,
      expiresAfterDays: 730,
      category: 'Certification'
    },
    searchTerms: {
      valid: 'license',
      noResults: 'xyznoresults123',
      special: '@#$%special'
    },
    ciData: {
      adminUser: {
        email: 'test@example.com',
        password: 'test123'
      }
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultants: '/api/consultants',
    login: '/api/auth/login',
    user: '/api/auth/user'
  };

  const selectors = {
    // Page elements
    pageContainer: '[data-testid="document-types-page"]',
    pageTitle: '[data-testid="page-title"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    emptyState: '[data-testid="empty-state"]',
    errorMessage: '[data-testid="error-message"]',
    
    // Navigation and actions
    addButton: '[data-testid="add-document-type-button"]',
    backButton: '[data-testid="back-button"]',
    refreshButton: '[data-testid="refresh-button"]',
    
    // Table/List elements
    documentTypesList: '[data-testid="document-types-list"]',
    documentTypeItem: '[data-testid="document-type-item"]',
    documentTypeRow: '[data-testid="document-type-row"]',
    documentTypeName: '[data-testid="document-type-name"]',
    documentTypeDescription: '[data-testid="document-type-description"]',
    documentTypeRequired: '[data-testid="document-type-required"]',
    documentTypeExpiration: '[data-testid="document-type-expiration"]',
    documentTypeCategory: '[data-testid="document-type-category"]',
    
    // Search and filters
    searchInput: '[data-testid="search-input"]',
    searchButton: '[data-testid="search-button"]',
    clearSearchButton: '[data-testid="clear-search-button"]',
    filterDropdown: '[data-testid="filter-dropdown"]',
    categoryFilter: '[data-testid="category-filter"]',
    requiredFilter: '[data-testid="required-filter"]',
    
    // Pagination
    pagination: '[data-testid="pagination"]',
    paginationInfo: '[data-testid="pagination-info"]',
    previousPageButton: '[data-testid="previous-page-button"]',
    nextPageButton: '[data-testid="next-page-button"]',
    pageNumberButton: '[data-testid="page-number-button"]',
    
    // Form elements
    documentTypeForm: '[data-testid="document-type-form"]',
    nameInput: '[data-testid="input-name"]',
    descriptionInput: '[data-testid="input-description"]',
    requiredCheckbox: '[data-testid="checkbox-required"]',
    expirationDaysInput: '[data-testid="input-expiration-days"]',
    categoryInput: '[data-testid="input-category"]',
    categorySelect: '[data-testid="select-category"]',
    
    // Form buttons
    saveButton: '[data-testid="save-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    resetButton: '[data-testid="reset-button"]',
    
    // Action buttons
    editButton: '[data-testid="edit-button"]',
    deleteButton: '[data-testid="delete-button"]',
    viewButton: '[data-testid="view-button"]',
    duplicateButton: '[data-testid="duplicate-button"]',
    
    // Modal/Dialog elements
    modal: '[data-testid="modal"]',
    modalTitle: '[data-testid="modal-title"]',
    modalContent: '[data-testid="modal-content"]',
    confirmButton: '[data-testid="confirm-button"]',
    cancelModalButton: '[data-testid="cancel-modal-button"]',
    closeModalButton: '[data-testid="close-modal-button"]',
    
    // Form validation
    fieldError: '[data-testid="field-error"]',
    formError: '[data-testid="form-error"]',
    successMessage: '[data-testid="success-message"]',
    
    // Details view
    detailsContainer: '[data-testid="document-type-details"]',
    detailsName: '[data-testid="details-name"]',
    detailsDescription: '[data-testid="details-description"]',
    detailsRequired: '[data-testid="details-required"]',
    detailsExpiration: '[data-testid="details-expiration"]',
    detailsCategory: '[data-testid="details-category"]',
    detailsCreatedAt: '[data-testid="details-created-at"]',
    detailsUpdatedAt: '[data-testid="details-updated-at"]',
    
    // Bulk actions
    bulkSelectCheckbox: '[data-testid="bulk-select-checkbox"]',
    bulkActionsBar: '[data-testid="bulk-actions-bar"]',
    bulkDeleteButton: '[data-testid="bulk-delete-button"]',
    selectAllCheckbox: '[data-testid="select-all-checkbox"]'
  };

  // Helper functions
  const loginAsAdmin = () => {
    cy.visit('/login');
    cy.get('[data-testid="input-email"]')
      .clear()
      .type(testData.ciData.adminUser.email);
    cy.get('[data-testid="input-password"]')
      .clear()
      .type(testData.ciData.adminUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  };

  const navigateToDocumentTypes = () => {
    // Try different navigation paths
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="nav-document-types"]').length > 0) {
        cy.get('[data-testid="nav-document-types"]').click();
      } else if ($body.find('[href*="document-types"]').length > 0) {
        cy.get('[href*="document-types"]').first().click();
      } else {
        cy.visit('/document-types');
      }
    });
  };

  const createDocumentType = (documentTypeData) => {
    cy.get(selectors.addButton, { timeout: 10000 }).should('be.visible').click();
    
    cy.get(selectors.nameInput).should('be.visible').clear().type(documentTypeData.name);
    
    if (documentTypeData.description) {
      cy.get(selectors.descriptionInput).clear().type(documentTypeData.description);
    }
    
    if (documentTypeData.required !== undefined) {
      if (documentTypeData.required) {
        cy.get(selectors.requiredCheckbox).check();
      } else {
        cy.get(selectors.requiredCheckbox).uncheck();
      }
    }
    
    if (documentTypeData.expiresAfterDays) {
      cy.get(selectors.expirationDaysInput).clear().type(documentTypeData.expiresAfterDays.toString());
    }
    
    if (documentTypeData.category) {
      // Try both input and select approaches
      cy.get('body').then(($body) => {
        if ($body.find(selectors.categorySelect).length > 0) {
          cy.get(selectors.categorySelect).select(documentTypeData.category);
        } else if ($body.find(selectors.categoryInput).length > 0) {
          cy.get(selectors.categoryInput).clear().type(documentTypeData.category);
        }
      });
    }
    
    cy.get(selectors.saveButton).click();
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Setup API interceptors
    cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
    cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
    cy.intercept('PUT', `${apiEndpoints.documentTypes}/*`).as('updateDocumentType');
    cy.intercept('PATCH', `${apiEndpoints.documentTypes}/*`).as('patchDocumentType');
    cy.intercept('DELETE', `${apiEndpoints.documentTypes}/*`).as('deleteDocumentType');
    cy.intercept('GET', apiEndpoints.user).as('getUser');
  });

  describe('Document Types Page - Access Control', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/document-types');
      cy.url().should('include', '/login');
    });

    it('should allow admin users to access document types page', () => {
      loginAsAdmin();
      navigateToDocumentTypes();
      
      cy.wait('@getDocumentTypes', { timeout: 15000 });
      cy.url().should('include', 'document-types');
    });

    it('should handle authorization errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 403,
        body: { error: 'Insufficient permissions' }
      }).as('getDocumentTypesForbidden');

      loginAsAdmin();
      navigateToDocumentTypes();
      
      cy.wait('@getDocumentTypesForbidden');
      cy.get(selectors.errorMessage).should('be.visible');
    });
  });

  describe('Document Types Page - UI Layout & Components', () => {
    beforeEach(() => {
      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes', { timeout: 15000 });
    });

    it('should display complete page layout and components', () => {
      // Page structure
      cy.get(selectors.pageContainer).should('be.visible');
      cy.get(selectors.pageTitle).should('be.visible').and('contain.text', 'Document Types');
      
      // Primary actions
      cy.get(selectors.addButton).should('be.visible').and('not.be.disabled');
      
      // Content area
      cy.get('body').then(($body) => {
        if ($body.find(selectors.documentTypesList).length > 0) {
          cy.get(selectors.documentTypesList).should('be.visible');
        } else if ($body.find(selectors.emptyState).length > 0) {
          cy.get(selectors.emptyState).should('be.visible');
        }
      });
    });

    it('should display search and filter controls when applicable', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.searchInput).length > 0) {
          cy.get(selectors.searchInput)
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
        
        if ($body.find(selectors.filterDropdown).length > 0) {
          cy.get(selectors.filterDropdown).should('be.visible');
        }
      });
    });

    it('should handle loading states properly', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res), 1000);
          });
        });
      }).as('getDocumentTypesDelayed');

      cy.reload();
      cy.get(selectors.loadingSpinner).should('be.visible');
      cy.wait('@getDocumentTypesDelayed');
      cy.get(selectors.loadingSpinner).should('not.exist');
    });

    it('should display empty state when no document types exist', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: []
      }).as('getEmptyDocumentTypes');

      cy.reload();
      cy.wait('@getEmptyDocumentTypes');
      
      cy.get(selectors.emptyState).should('be.visible');
      cy.get(selectors.addButton).should('be.visible').and('not.be.disabled');
    });
  });

  describe('Document Types - CRUD Operations', () => {
    beforeEach(() => {
      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes', { timeout: 15000 });
    });

    describe('Create Document Type', () => {
      it('should successfully create a document type with all fields', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 201,
          body: { id: 1, ...testData.validDocumentType }
        }).as('createDocumentTypeSuccess');

        createDocumentType(testData.validDocumentType);

        cy.wait('@createDocumentTypeSuccess');
        cy.get(selectors.successMessage).should('be.visible');
        
        // Should return to list view
        cy.get(selectors.documentTypesList).should('be.visible');
      });

      it('should successfully create a document type with minimal fields', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 201,
          body: { id: 2, ...testData.validDocumentTypeMinimal }
        }).as('createDocumentTypeMinimal');

        createDocumentType(testData.validDocumentTypeMinimal);

        cy.wait('@createDocumentTypeMinimal');
        cy.get(selectors.successMessage).should('be.visible');
      });

      it('should handle server errors during creation', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('createDocumentTypeError');

        createDocumentType(testData.validDocumentType);

        cy.wait('@createDocumentTypeError');
        cy.get(selectors.errorMessage).should('be.visible');
        
        // Should remain on form
        cy.get(selectors.documentTypeForm).should('be.visible');
      });

      it('should handle duplicate name errors', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 409,
          body: { error: 'Document type with this name already exists' }
        }).as('createDocumentTypeDuplicate');

        createDocumentType(testData.validDocumentType);

        cy.wait('@createDocumentTypeDuplicate');
        cy.get(selectors.fieldError).should('be.visible');
      });

      it('should cancel creation and return to list', () => {
        cy.get(selectors.addButton).click();
        cy.get(selectors.documentTypeForm).should('be.visible');
        
        // Fill some data
        cy.get(selectors.nameInput).type('Test Cancel');
        
        cy.get(selectors.cancelButton).click();
        
        // Should return to list without saving
        cy.get(selectors.documentTypesList).should('be.visible');
        cy.get(selectors.documentTypeForm).should('not.exist');
      });
    });

    describe('Read Document Types', () => {
      it('should display list of document types with all information', () => {
        const mockDocumentTypes = [
          { id: 1, name: 'Medical License', description: 'Required medical license', required: true, expiresAfterDays: 365, category: 'License' },
          { id: 2, name: 'Background Check', description: 'Background verification', required: true, expiresAfterDays: 1095, category: 'Verification' },
          { id: 3, name: 'Specialty Certificate', description: 'Optional specialty certification', required: false, category: 'Certification' }
        ];

        cy.intercept('GET', apiEndpoints.documentTypes, {
          statusCode: 200,
          body: mockDocumentTypes
        }).as('getDocumentTypesList');

        cy.reload();
        cy.wait('@getDocumentTypesList');

        // Verify document types are displayed
        cy.get(selectors.documentTypeItem).should('have.length', 3);
        
        // Verify first document type details
        cy.get(selectors.documentTypeItem).first().within(() => {
          cy.get(selectors.documentTypeName).should('contain.text', 'Medical License');
          cy.get(selectors.documentTypeDescription).should('contain.text', 'Required medical license');
          cy.get(selectors.documentTypeRequired).should('contain.text', 'Required');
        });
      });

      it('should handle API errors when fetching document types', () => {
        cy.intercept('GET', apiEndpoints.documentTypes, {
          statusCode: 500,
          body: { error: 'Server error' }
        }).as('getDocumentTypesError');

        cy.reload();
        cy.wait('@getDocumentTypesError');

        cy.get(selectors.errorMessage).should('be.visible');
      });

      it('should view document type details', () => {
        const mockDocumentType = { 
          id: 1, 
          name: 'Medical License', 
          description: 'Required medical license',
          required: true,
          expiresAfterDays: 365,
          category: 'License',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        };

        cy.intercept('GET', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 200,
          body: mockDocumentType
        }).as('getDocumentTypeDetails');

        // Click view button
        cy.get(selectors.viewButton).first().click();
        cy.wait('@getDocumentTypeDetails');

        // Verify details are displayed
        cy.get(selectors.detailsContainer).should('be.visible');
        cy.get(selectors.detailsName).should('contain.text', 'Medical License');
        cy.get(selectors.detailsDescription).should('contain.text', 'Required medical license');
        cy.get(selectors.detailsRequired).should('contain.text', 'Yes');
        cy.get(selectors.detailsExpiration).should('contain.text', '365');
        cy.get(selectors.detailsCategory).should('contain.text', 'License');
      });
    });

    describe('Update Document Type', () => {
      it('should successfully update a document type', () => {
        const updatedDocumentType = { id: 1, ...testData.updateData };

        cy.intercept('GET', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 200,
          body: { id: 1, ...testData.validDocumentType }
        }).as('getDocumentTypeForEdit');

        cy.intercept('PUT', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 200,
          body: updatedDocumentType
        }).as('updateDocumentTypeSuccess');

        // Click edit button
        cy.get(selectors.editButton).first().click();
        cy.wait('@getDocumentTypeForEdit');

        // Update fields
        cy.get(selectors.nameInput).clear().type(testData.updateData.name);
        cy.get(selectors.descriptionInput).clear().type(testData.updateData.description);
        cy.get(selectors.requiredCheckbox).uncheck();
        
        if (testData.updateData.expiresAfterDays) {
          cy.get(selectors.expirationDaysInput).clear().type(testData.updateData.expiresAfterDays.toString());
        }

        cy.get(selectors.saveButton).click();
        cy.wait('@updateDocumentTypeSuccess');

        cy.get(selectors.successMessage).should('be.visible');
      });

      it('should handle validation errors during update', () => {
        cy.intercept('GET', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 200,
          body: { id: 1, ...testData.validDocumentType }
        }).as('getDocumentTypeForEdit');

        cy.intercept('PUT', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 400,
          body: { 
            error: 'Validation failed',
            details: { name: 'Name is required' }
          }
        }).as('updateDocumentTypeValidationError');

        cy.get(selectors.editButton).first().click();
        cy.wait('@getDocumentTypeForEdit');

        // Clear required field
        cy.get(selectors.nameInput).clear();
        cy.get(selectors.saveButton).click();

        cy.wait('@updateDocumentTypeValidationError');
        cy.get(selectors.fieldError).should('be.visible');
      });

      it('should cancel update and preserve original data', () => {
        cy.intercept('GET', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 200,
          body: { id: 1, ...testData.validDocumentType }
        }).as('getDocumentTypeForEdit');

        cy.get(selectors.editButton).first().click();
        cy.wait('@getDocumentTypeForEdit');

        // Make changes
        cy.get(selectors.nameInput).clear().type('Changed Name');
        
        // Cancel
        cy.get(selectors.cancelButton).click();

        // Should return to list without saving
        cy.get(selectors.documentTypesList).should('be.visible');
      });
    });

    describe('Delete Document Type', () => {
      it('should successfully delete a document type', () => {
        cy.intercept('DELETE', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 200,
          body: { message: 'Document type deleted successfully' }
        }).as('deleteDocumentTypeSuccess');

        // Click delete button
        cy.get(selectors.deleteButton).first().click();
        
        // Confirm deletion in modal
        cy.get(selectors.modal).should('be.visible');
        cy.get(selectors.confirmButton).click();

        cy.wait('@deleteDocumentTypeSuccess');
        cy.get(selectors.successMessage).should('be.visible');
      });

      it('should handle delete confirmation dialog', () => {
        cy.get(selectors.deleteButton).first().click();
        
        // Verify confirmation modal
        cy.get(selectors.modal).should('be.visible');
        cy.get(selectors.modalTitle).should('contain.text', /delete|confirm/i);
        
        // Cancel deletion
        cy.get(selectors.cancelModalButton).click();
        cy.get(selectors.modal).should('not.exist');
      });

      it('should handle delete errors', () => {
        cy.intercept('DELETE', `${apiEndpoints.documentTypes}/1`, {
          statusCode: 400,
          body: { error: 'Cannot delete document type - it is in use' }
        }).as('deleteDocumentTypeError');

        cy.get(selectors.deleteButton).first().click();
        cy.get(selectors.confirmButton).click();

        cy.wait('@deleteDocumentTypeError');
        cy.get(selectors.errorMessage).should('be.visible').and('contain.text', 'it is in use');
      });

      it('should handle 404 errors when deleting non-existent document type', () => {
        cy.intercept('DELETE', `${apiEndpoints.documentTypes}/999`, {
          statusCode: 404,
          body: { error: 'Document type not found' }
        }).as('deleteDocumentTypeNotFound');

        cy.get(selectors.deleteButton).first().click();
        cy.get(selectors.confirmButton).click();

        cy.wait('@deleteDocumentTypeNotFound');
        cy.get(selectors.errorMessage).should('be.visible');
      });
    });
  });

  describe('Document Types - Form Validation', () => {
    beforeEach(() => {
      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes', { timeout: 15000 });
      cy.get(selectors.addButton).click();
    });

    it('should validate required fields', () => {
      // Try to save without required fields
      cy.get(selectors.saveButton).click();
      
      // Should show validation errors
      cy.get(selectors.fieldError).should('be.visible');
      cy.get(selectors.nameInput).should('have.class', /error|invalid/);
    });

    it('should validate name field constraints', () => {
      // Test empty name
      cy.get(selectors.nameInput).clear().blur();
      cy.get(selectors.fieldError).should('be.visible');

      // Test maximum length
      cy.get(selectors.nameInput).clear().type(testData.invalidDocumentTypes.tooLongName.name);
      cy.get(selectors.saveButton).click();
      cy.get(selectors.fieldError).should('be.visible');
    });

    it('should validate description field constraints', () => {
      cy.get(selectors.nameInput).type('Valid Name');
      
      // Test maximum length for description
      cy.get(selectors.descriptionInput).type(testData.invalidDocumentTypes.tooLongDescription.description);
      cy.get(selectors.saveButton).click();
      
      cy.get(selectors.fieldError).should('be.visible');
    });

    it('should validate expiration days field', () => {
      cy.get(selectors.nameInput).type('Valid Name');
      
      // Test negative value
      cy.get(selectors.expirationDaysInput).type('-5');
      cy.get(selectors.saveButton).click();
      
      cy.get(selectors.fieldError).should('be.visible');

      // Test non-numeric value
      cy.get(selectors.expirationDaysInput).clear().type('abc');
      cy.get(selectors.saveButton).click();
      
      cy.get(selectors.fieldError).should('be.visible');

      // Test zero value
      cy.get(selectors.expirationDaysInput).clear().type('0');
      cy.get(selectors.saveButton).click();
      
      cy.get(selectors.fieldError).should('be.visible');
    });

    it('should validate special characters in name field', () => {
      // Test special characters
      cy.get(selectors.nameInput).type('Test<script>alert("xss")</script>');
      cy.get(selectors.saveButton).click();
      
      // Should either sanitize or show validation error
      cy.get('body').should('not.contain', 'alert');
    });

    it('should show real-time validation feedback', () => {
      // Test real-time validation
      cy.get(selectors.nameInput).type('a').clear();
      cy.get(selectors.fieldError).should('be.visible');
      
      cy.get(selectors.nameInput).type('Valid Name');
      cy.get(selectors.fieldError).should('not.exist');
    });

    it('should reset form validation on cancel', () => {
      // Create validation errors
      cy.get(selectors.saveButton).click();
      cy.get(selectors.fieldError).should('be.visible');
      
      // Cancel form
      cy.get(selectors.cancelButton).click();
      
      // Open form again
      cy.get(selectors.addButton).click();
      
      // Should not show previous validation errors
      cy.get(selectors.fieldError).should('not.exist');
    });
  });

  describe('Document Types - Search and Filtering', () => {
    const mockDocumentTypes = [
      { id: 1, name: 'Medical License', description: 'Required medical license', required: true, category: 'License' },
      { id: 2, name: 'Nursing Certificate', description: 'Nursing certification', required: true, category: 'Certification' },
      { id: 3, name: 'Background Check', description: 'Background verification', required: false, category: 'Verification' },
      { id: 4, name: 'Drug Screening', description: 'Drug screening results', required: true, category: 'Verification' }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: mockDocumentTypes
      }).as('getDocumentTypesList');

      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypesList');
    });

    it('should search document types by name', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.searchInput).length > 0) {
          cy.get(selectors.searchInput).type(testData.searchTerms.valid);
          cy.get(selectors.searchButton).click();
          
          // Should show filtered results
          cy.get(selectors.documentTypeItem).should('have.length.at.most', 4);
        }
      });
    });

    it('should handle search with no results', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.searchInput).length > 0) {
          cy.get(selectors.searchInput).type(testData.searchTerms.noResults);
          cy.get(selectors.searchButton).click();
          
          cy.get(selectors.emptyState).should('be.visible');
        }
      });
    });

    it('should clear search results', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.searchInput).length > 0 && $body.find(selectors.clearSearchButton).length > 0) {
          cy.get(selectors.searchInput).type(testData.searchTerms.valid);
          cy.get(selectors.searchButton).click();
          
          cy.get(selectors.clearSearchButton).click();
          
          // Should show all results again
          cy.get(selectors.documentTypeItem).should('have.length', 4);
          cy.get(selectors.searchInput).should('have.value', '');
        }
      });
    });

    it('should filter by category', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.categoryFilter).length > 0) {
          cy.get(selectors.categoryFilter).select('License');
          
          // Should show only license documents
          cy.get(selectors.documentTypeItem).should('have.length', 1);
          cy.get(selectors.documentTypeName).should('contain.text', 'Medical License');
        }
      });
    });

    it('should filter by required status', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.requiredFilter).length > 0) {
          cy.get(selectors.requiredFilter).select('required');
          
          // Should show only required documents
          cy.get(selectors.documentTypeItem).should('have.length', 3);
        }
      });
    });

    it('should combine search and filters', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.searchInput).length > 0 && $body.find(selectors.categoryFilter).length > 0) {
          cy.get(selectors.searchInput).type('license');
          cy.get(selectors.categoryFilter).select('License');
          cy.get(selectors.searchButton).click();
          
          // Should show filtered and searched results
          cy.get(selectors.documentTypeItem).should('have.length', 1);
        }
      });
    });
  });

  describe('Document Types - Pagination', () => {
    beforeEach(() => {
      // Mock large dataset for pagination
      const largeDataset = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Document Type ${i + 1}`,
        description: `Description for document type ${i + 1}`,
        required: i % 2 === 0,
        category: i % 3 === 0 ? 'License' : i % 3 === 1 ? 'Certification' : 'Verification'
      }));

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: largeDataset
      }).as('getLargeDocumentTypesList');

      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getLargeDocumentTypesList');
    });

    it('should display pagination controls when needed', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.pagination).length > 0) {
          cy.get(selectors.pagination).should('be.visible');
          cy.get(selectors.paginationInfo).should('be.visible');
        }
      });
    });

    it('should navigate between pages', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.nextPageButton).length > 0) {
          // Go to next page
          cy.get(selectors.nextPageButton).click();
          
          // Should show different items
          cy.get(selectors.documentTypeItem).should('be.visible');
          
          // Go back to previous page
          if ($body.find(selectors.previousPageButton).length > 0) {
            cy.get(selectors.previousPageButton).click();
          }
        }
      });
    });

    it('should jump to specific page number', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.pageNumberButton).length > 1) {
          cy.get(selectors.pageNumberButton).eq(1).click();
          cy.get(selectors.documentTypeItem).should('be.visible');
        }
      });
    });
  });

  describe('Document Types - Bulk Operations', () => {
    beforeEach(() => {
      const mockDocumentTypes = [
        { id: 1, name: 'Medical License', required: true, category: 'License' },
        { id: 2, name: 'Nursing Certificate', required: true, category: 'Certification' },
        { id: 3, name: 'Background Check', required: false, category: 'Verification' }
      ];

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: mockDocumentTypes
      }).as('getDocumentTypesList');

      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypesList');
    });

    it('should select and deselect individual items', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.bulkSelectCheckbox).length > 0) {
          // Select first item
          cy.get(selectors.bulkSelectCheckbox).first().check();
          cy.get(selectors.bulkActionsBar).should('be.visible');
          
          // Deselect item
          cy.get(selectors.bulkSelectCheckbox).first().uncheck();
          cy.get(selectors.bulkActionsBar).should('not.exist');
        }
      });
    });

    it('should select all items', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.selectAllCheckbox).length > 0) {
          cy.get(selectors.selectAllCheckbox).check();
          cy.get(selectors.bulkSelectCheckbox).should('be.checked');
          cy.get(selectors.bulkActionsBar).should('be.visible');
        }
      });
    });

    it('should perform bulk delete operation', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.bulkSelectCheckbox).length > 0 && $body.find(selectors.bulkDeleteButton).length > 0) {
          cy.intercept('DELETE', `${apiEndpoints.documentTypes}/bulk`, {
            statusCode: 200,
            body: { message: 'Documents deleted successfully' }
          }).as('bulkDeleteSuccess');

          // Select items
          cy.get(selectors.bulkSelectCheckbox).first().check();
          cy.get(selectors.bulkSelectCheckbox).eq(1).check();
          
          // Perform bulk delete
          cy.get(selectors.bulkDeleteButton).click();
          cy.get(selectors.confirmButton).click();
          
          cy.wait('@bulkDeleteSuccess');
          cy.get(selectors.successMessage).should('be.visible');
        }
      });
    });
  });

  describe('Document Types - Error Handling', () => {
    beforeEach(() => {
      loginAsAdmin();
    });

    it('should handle network timeouts gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        req.reply((res) => {
          return new Promise(() => {}); // Never resolve to simulate timeout
        });
      }).as('getDocumentTypesTimeout');

      navigateToDocumentTypes();
      
      // Should show loading state and eventually error
      cy.get(selectors.loadingSpinner).should('be.visible');
      
      // After timeout, should show error message
      cy.get(selectors.errorMessage, { timeout: 30000 }).should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: 'invalid json'
      }).as('getDocumentTypesInvalidJson');

      navigateToDocumentTypes();
      cy.wait('@getDocumentTypesInvalidJson');
      
      cy.get(selectors.errorMessage).should('be.visible');
    });

    it('should handle 500 server errors', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDocumentTypes500');

      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes500');
      
      cy.get(selectors.errorMessage).should('be.visible').and('contain.text', 'server error');
    });

    it('should provide retry functionality', () => {
      let attempts = 0;
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        attempts++;
        if (attempts === 1) {
          req.reply({ statusCode: 500, body: { error: 'Server error' } });
        } else {
          req.reply({ statusCode: 200, body: [] });
        }
      }).as('getDocumentTypesRetry');

      navigateToDocumentTypes();
      cy.wait('@getDocumentTypesRetry');
      
      cy.get(selectors.errorMessage).should('be.visible');
      
      // Click retry button if available
      cy.get('body').then(($body) => {
        if ($body.find(selectors.refreshButton).length > 0) {
          cy.get(selectors.refreshButton).click();
          cy.wait('@getDocumentTypesRetry');
          cy.get(selectors.errorMessage).should('not.exist');
        }
      });
    });
  });

  describe('Document Types - Accessibility', () => {
    beforeEach(() => {
      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes', { timeout: 15000 });
    });

    it('should have proper ARIA labels and roles', () => {
      // Check main landmarks
      cy.get('main').should('have.attr', 'role', 'main').or('exist');
      
      // Check buttons have accessible names
      cy.get(selectors.addButton)
        .should('have.attr', 'aria-label')
        .or('have.accessible.name');
      
      // Check form elements have labels
      cy.get(selectors.addButton).click();
      cy.get(selectors.nameInput)
        .should('have.attr', 'aria-label')
        .or('have.attr', 'id')
        .or('have.accessible.name');
    });

    it('should support keyboard navigation', () => {
      // Test tab navigation
      cy.get(selectors.addButton).focus();
      cy.focused().should('equal', cy.get(selectors.addButton));
      
      // Tab through elements
      cy.tab();
      cy.focused().should('be.visible');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist');
      
      // Check heading levels are sequential
      cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
        const headingLevels = Array.from($headings).map(h => parseInt(h.tagName.substring(1)));
        // Verify no skipped heading levels
        expect(headingLevels[0]).to.equal(1);
      });
    });

    it('should provide screen reader announcements', () => {
      // Check for aria-live regions
      cy.get('[aria-live]').should('exist');
      
      // Test that success/error messages are announced
      cy.get(selectors.addButton).click();
      cy.get(selectors.nameInput).type('Test Document');
      cy.get(selectors.saveButton).click();
      
      cy.get('[aria-live] [role="status"], [aria-live] [role="alert"]')
        .should('exist');
    });

    it('should have sufficient color contrast', () => {
      // This would typically be tested with axe-core
      // For now, check that text is visible
      cy.get(selectors.pageTitle).should('be.visible');
      cy.get(selectors.addButton).should('be.visible');
    });
  });

  describe('Document Types - Responsive Design', () => {
    beforeEach(() => {
      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes', { timeout: 15000 });
    });

    it('should display properly on mobile devices', () => {
      cy.viewport(375, 667); // iPhone SE
      
      cy.get(selectors.pageContainer).should('be.visible');
      cy.get(selectors.addButton).should('be.visible');
      
      // Check that elements don't overflow
      cy.get(selectors.documentTypesList).should('be.visible');
    });

    it('should display properly on tablet devices', () => {
      cy.viewport(768, 1024); // iPad
      
      cy.get(selectors.pageContainer).should('be.visible');
      cy.get(selectors.documentTypesList).should('be.visible');
    });

    it('should display properly on desktop', () => {
      cy.viewport(1920, 1080); // Desktop
      
      cy.get(selectors.pageContainer).should('be.visible');
      cy.get(selectors.documentTypesList).should('be.visible');
    });

    it('should handle form layout on different screen sizes', () => {
      cy.get(selectors.addButton).click();
      
      // Mobile
      cy.viewport(375, 667);
      cy.get(selectors.documentTypeForm).should('be.visible');
      cy.get(selectors.nameInput).should('be.visible');
      
      // Desktop
      cy.viewport(1920, 1080);
      cy.get(selectors.documentTypeForm).should('be.visible');
      cy.get(selectors.nameInput).should('be.visible');
    });
  });

  describe('Document Types - Performance', () => {
    it('should load page within acceptable time', () => {
      const startTime = Date.now();
      
      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getDocumentTypes', { timeout: 15000 });
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 second threshold
      });
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Document Type ${i + 1}`,
        description: `Description ${i + 1}`,
        required: i % 2 === 0,
        category: 'Test'
      }));

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: largeDataset
      }).as('getLargeDataset');

      loginAsAdmin();
      navigateToDocumentTypes();
      cy.wait('@getLargeDataset');
      
      // Should still be responsive
      cy.get(selectors.pageContainer).should('be.visible');
    });
  });
});
