describe('Document Types System - Exhaustive Tests', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'test123'
    },
    documentTypes: {
      valid: {
        name: 'Medical License',
        description: 'Professional medical license documentation',
        required: true,
        expirationRequired: true,
        category: 'Licensing'
      },
      update: {
        name: 'Updated Medical License',
        description: 'Updated professional medical license documentation',
        required: false,
        expirationRequired: false,
        category: 'Certifications'
      },
      invalid: {
        emptyName: {
          name: '',
          description: 'Test description',
          required: true
        },
        longName: {
          name: 'A'.repeat(256),
          description: 'Test description',
          required: true
        },
        longDescription: {
          name: 'Test Name',
          description: 'A'.repeat(1001),
          required: true
        }
      },
      bulk: [
        {
          name: 'Nursing License',
          description: 'State nursing license',
          required: true,
          expirationRequired: true,
          category: 'Licensing'
        },
        {
          name: 'BLS Certification',
          description: 'Basic Life Support certification',
          required: true,
          expirationRequired: true,
          category: 'Certifications'
        },
        {
          name: 'ACLS Certification',
          description: 'Advanced Cardiac Life Support certification',
          required: false,
          expirationRequired: true,
          category: 'Certifications'
        }
      ]
    },
    consultant: {
      email: 'consultant@example.com',
      password: 'test123'
    },
    documents: {
      valid: {
        file: 'test-license.pdf',
        expirationDate: '2025-12-31',
        notes: 'Current medical license'
      },
      expired: {
        file: 'expired-license.pdf',
        expirationDate: '2023-01-01',
        notes: 'Expired license for testing'
      }
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultantDocuments: '/api/consultants/*/documents',
    documentStatus: '/api/documents/*/status'
  };

  const selectors = {
    // Navigation
    navDocumentTypes: '[data-testid="nav-document-types"]',
    navAdminPanel: '[data-testid="nav-admin-panel"]',
    
    // Document Types Management
    documentTypesContainer: '[data-testid="document-types-container"]',
    documentTypesList: '[data-testid="document-types-list"]',
    documentTypeItem: '[data-testid="document-type-item"]',
    createDocumentTypeBtn: '[data-testid="create-document-type-btn"]',
    documentTypeForm: '[data-testid="document-type-form"]',
    
    // Form fields
    inputName: '[data-testid="input-name"]',
    inputDescription: '[data-testid="input-description"]',
    inputCategory: '[data-testid="input-category"]',
    checkboxRequired: '[data-testid="checkbox-required"]',
    checkboxExpirationRequired: '[data-testid="checkbox-expiration-required"]',
    inputSortOrder: '[data-testid="input-sort-order"]',
    
    // Actions
    saveBtn: '[data-testid="save-btn"]',
    cancelBtn: '[data-testid="cancel-btn"]',
    editBtn: '[data-testid="edit-btn"]',
    deleteBtn: '[data-testid="delete-btn"]',
    confirmDeleteBtn: '[data-testid="confirm-delete-btn"]',
    
    // Consultant document management
    documentsTab: '[data-testid="documents-tab"]',
    uploadDocumentBtn: '[data-testid="upload-document-btn"]',
    documentUploadForm: '[data-testid="document-upload-form"]',
    selectDocumentType: '[data-testid="select-document-type"]',
    fileInput: '[data-testid="file-input"]',
    inputExpirationDate: '[data-testid="input-expiration-date"]',
    inputNotes: '[data-testid="input-notes"]',
    documentsList: '[data-testid="documents-list"]',
    documentItem: '[data-testid="document-item"]',
    documentStatus: '[data-testid="document-status"]',
    
    // Search and filters
    searchInput: '[data-testid="search-input"]',
    filterCategory: '[data-testid="filter-category"]',
    filterRequired: '[data-testid="filter-required"]',
    sortSelect: '[data-testid="sort-select"]',
    
    // Error states
    errorMessage: '[data-testid="error-message"]',
    validationError: '[data-testid="validation-error"]',
    emptyState: '[data-testid="empty-state"]',
    
    // Loading states
    loadingSpinner: '[data-testid="loading-spinner"]',
    skeleton: '[data-testid="skeleton"]'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.admin.email);
    cy.get('[data-testid="input-password"]').type(testData.admin.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });

  describe('Document Types Management - Admin Interface', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    describe('Page Layout and Components', () => {
      it('should display complete document types management interface', () => {
        // Main container
        cy.get(selectors.documentTypesContainer)
          .should('be.visible');
        
        // Header section
        cy.get('h1').should('contain.text', 'Document Types');
        cy.get(selectors.createDocumentTypeBtn)
          .should('be.visible')
          .and('not.be.disabled');
        
        // Search and filters
        cy.get(selectors.searchInput).should('be.visible');
        cy.get(selectors.filterCategory).should('be.visible');
        cy.get(selectors.filterRequired).should('be.visible');
        cy.get(selectors.sortSelect).should('be.visible');
        
        // Document types list
        cy.get(selectors.documentTypesList).should('be.visible');
      });

      it('should have proper accessibility attributes', () => {
        cy.get(selectors.createDocumentTypeBtn)
          .should('have.attr', 'aria-label')
          .and('have.attr', 'role');
        
        cy.get(selectors.searchInput)
          .should('have.attr', 'placeholder')
          .and('have.attr', 'aria-label');
        
        cy.get('table').then(($table) => {
          if ($table.length > 0) {
            cy.get('table')
              .should('have.attr', 'role', 'table')
              .find('th')
              .should('have.attr', 'scope', 'col');
          }
        });
      });

      it('should display empty state when no document types exist', () => {
        cy.intercept('GET', apiEndpoints.documentTypes, { 
          fixture: 'empty-document-types.json' 
        }).as('getEmptyDocumentTypes');
        
        cy.reload();
        cy.wait('@getEmptyDocumentTypes');
        
        cy.get(selectors.emptyState)
          .should('be.visible')
          .and('contain.text', 'No document types found');
        
        cy.get(selectors.createDocumentTypeBtn)
          .should('be.visible')
          .and('contain.text', 'Create First Document Type');
      });
    });

    describe('Create Document Type', () => {
      beforeEach(() => {
        cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
        cy.get(selectors.createDocumentTypeBtn).click();
      });

      it('should display create document type form with all fields', () => {
        cy.get(selectors.documentTypeForm).should('be.visible');
        
        // Form fields
        cy.get(selectors.inputName)
          .should('be.visible')
          .and('have.attr', 'required');
        
        cy.get(selectors.inputDescription)
          .should('be.visible');
        
        cy.get(selectors.inputCategory)
          .should('be.visible');
        
        cy.get(selectors.checkboxRequired)
          .should('be.visible')
          .and('not.be.checked');
        
        cy.get(selectors.checkboxExpirationRequired)
          .should('be.visible')
          .and('not.be.checked');
        
        cy.get(selectors.inputSortOrder)
          .should('be.visible')
          .and('have.value', '0');
        
        // Action buttons
        cy.get(selectors.saveBtn)
          .should('be.visible')
          .and('be.disabled');
        
        cy.get(selectors.cancelBtn)
          .should('be.visible')
          .and('not.be.disabled');
      });

      it('should successfully create a valid document type', () => {
        const docType = testData.documentTypes.valid;
        
        // Fill form
        cy.get(selectors.inputName).type(docType.name);
        cy.get(selectors.inputDescription).type(docType.description);
        cy.get(selectors.inputCategory).type(docType.category);
        
        if (docType.required) {
          cy.get(selectors.checkboxRequired).check();
        }
        
        if (docType.expirationRequired) {
          cy.get(selectors.checkboxExpirationRequired).check();
        }
        
        // Save button should be enabled after filling required fields
        cy.get(selectors.saveBtn).should('not.be.disabled');
        
        // Submit form
        cy.get(selectors.saveBtn).click();
        
        // Verify API call
        cy.wait('@createDocumentType').then((interception) => {
          expect(interception.request.body).to.include({
            name: docType.name,
            description: docType.description,
            category: docType.category,
            required: docType.required,
            expirationRequired: docType.expirationRequired
          });
        });
        
        // Verify success feedback
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', 'Document type created successfully');
        
        // Verify redirect/form reset
        cy.get(selectors.documentTypeForm).should('not.exist');
      });

      it('should validate required fields', () => {
        // Try to save without filling required fields
        cy.get(selectors.saveBtn).should('be.disabled');
        
        // Fill name only
        cy.get(selectors.inputName).type('Test');
        cy.get(selectors.saveBtn).should('not.be.disabled');
        
        // Clear name
        cy.get(selectors.inputName).clear();
        cy.get(selectors.saveBtn).should('be.disabled');
        
        // Verify validation message
        cy.get(selectors.inputName).blur();
        cy.get(selectors.validationError)
          .should('be.visible')
          .and('contain.text', 'Name is required');
      });

      it('should validate field lengths and formats', () => {
        const invalid = testData.documentTypes.invalid;
        
        // Test empty name
        cy.get(selectors.inputName).type(invalid.emptyName.name).clear().blur();
        cy.get(selectors.validationError)
          .should('contain.text', 'Name is required');
        
        // Test long name
        cy.get(selectors.inputName).clear().type(invalid.longName.name);
        cy.get(selectors.validationError)
          .should('contain.text', 'Name must be less than 255 characters');
        
        // Test long description
        cy.get(selectors.inputName).clear().type('Valid Name');
        cy.get(selectors.inputDescription).type(invalid.longDescription.description);
        cy.get(selectors.validationError)
          .should('contain.text', 'Description must be less than 1000 characters');
      });

      it('should handle API errors gracefully', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 400,
          body: { error: 'Document type name already exists' }
        }).as('createDocumentTypeError');
        
        const docType = testData.documentTypes.valid;
        
        cy.get(selectors.inputName).type(docType.name);
        cy.get(selectors.inputDescription).type(docType.description);
        cy.get(selectors.saveBtn).click();
        
        cy.wait('@createDocumentTypeError');
        
        cy.get(selectors.errorMessage)
          .should('be.visible')
          .and('contain.text', 'Document type name already exists');
        
        // Form should remain open
        cy.get(selectors.documentTypeForm).should('be.visible');
      });

      it('should cancel form creation', () => {
        cy.get(selectors.inputName).type('Test Name');
        cy.get(selectors.cancelBtn).click();
        
        // Form should close
        cy.get(selectors.documentTypeForm).should('not.exist');
        
        // Changes should not be saved
        cy.get(selectors.documentTypesList)
          .should('not.contain.text', 'Test Name');
      });
    });

    describe('View and List Document Types', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.documentTypes, {
          fixture: 'document-types-list.json'
        }).as('getDocumentTypesList');
        cy.reload();
        cy.wait('@getDocumentTypesList');
      });

      it('should display document types list with all information', () => {
        cy.get(selectors.documentTypeItem).should('have.length.at.least', 1);
        
        cy.get(selectors.documentTypeItem).first().within(() => {
          cy.get('[data-testid="type-name"]').should('be.visible');
          cy.get('[data-testid="type-description"]').should('be.visible');
          cy.get('[data-testid="type-category"]').should('be.visible');
          cy.get('[data-testid="type-required"]').should('be.visible');
          cy.get('[data-testid="type-expiration-required"]').should('be.visible');
          cy.get(selectors.editBtn).should('be.visible');
          cy.get(selectors.deleteBtn).should('be.visible');
        });
      });

      it('should handle search functionality', () => {
        const searchTerm = 'Medical';
        
        cy.get(selectors.searchInput).type(searchTerm);
        
        // Verify filtered results
        cy.get(selectors.documentTypeItem).should('have.length.at.least', 1);
        cy.get(selectors.documentTypeItem).each(($item) => {
          cy.wrap($item).should('contain.text', searchTerm);
        });
        
        // Clear search
        cy.get(selectors.searchInput).clear();
        cy.get(selectors.documentTypeItem).should('have.length.at.least', 1);
      });

      it('should handle category filtering', () => {
        cy.get(selectors.filterCategory).select('Licensing');
        
        cy.get(selectors.documentTypeItem).should('have.length.at.least', 1);
        cy.get(selectors.documentTypeItem).each(($item) => {
          cy.wrap($item)
            .find('[data-testid="type-category"]')
            .should('contain.text', 'Licensing');
        });
      });

      it('should handle required filter', () => {
        cy.get(selectors.filterRequired).select('Required Only');
        
        cy.get(selectors.documentTypeItem).should('have.length.at.least', 1);
        cy.get(selectors.documentTypeItem).each(($item) => {
          cy.wrap($item)
            .find('[data-testid="type-required"]')
            .should('contain.text', 'Yes');
        });
      });

      it('should handle sorting', () => {
        cy.get(selectors.sortSelect).select('Name A-Z');
        
        // Verify sorted order
        let previousName = '';
        cy.get('[data-testid="type-name"]').each(($name) => {
          const currentName = $name.text().toLowerCase();
          if (previousName) {
            expect(currentName >= previousName).to.be.true;
          }
          previousName = currentName;
        });
      });

      it('should display loading state', () => {
        cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
          req.reply((res) => {
            res.delay(2000).send({ fixture: 'document-types-list.json' });
          });
        }).as('getSlowDocumentTypes');
        
        cy.reload();
        
        cy.get(selectors.loadingSpinner).should('be.visible');
        cy.wait('@getSlowDocumentTypes');
        cy.get(selectors.loadingSpinner).should('not.exist');
      });
    });

    describe('Edit Document Type', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.documentTypes, {
          fixture: 'document-types-list.json'
        }).as('getDocumentTypesList');
        cy.intercept('PATCH', `${apiEndpoints.documentTypes}/*`).as('updateDocumentType');
        cy.reload();
        cy.wait('@getDocumentTypesList');
        
        // Click edit on first item
        cy.get(selectors.documentTypeItem).first()
          .find(selectors.editBtn).click();
      });

      it('should display edit form with pre-filled values', () => {
        cy.get(selectors.documentTypeForm).should('be.visible');
        
        // Verify form is pre-filled
        cy.get(selectors.inputName).should('have.value').and('not.be.empty');
        cy.get(selectors.inputDescription).should('have.value');
        cy.get(selectors.inputCategory).should('have.value');
        
        // Save button should be enabled
        cy.get(selectors.saveBtn).should('not.be.disabled');
      });

      it('should successfully update document type', () => {
        const updateData = testData.documentTypes.update;
        
        // Clear and update fields
        cy.get(selectors.inputName).clear().type(updateData.name);
        cy.get(selectors.inputDescription).clear().type(updateData.description);
        cy.get(selectors.inputCategory).clear().type(updateData.category);
        
        // Update checkboxes
        cy.get(selectors.checkboxRequired).then(($checkbox) => {
          if (updateData.required && !$checkbox.is(':checked')) {
            cy.wrap($checkbox).check();
          } else if (!updateData.required && $checkbox.is(':checked')) {
            cy.wrap($checkbox).uncheck();
          }
        });
        
        // Submit update
        cy.get(selectors.saveBtn).click();
        
        cy.wait('@updateDocumentType').then((interception) => {
          expect(interception.request.body).to.include({
            name: updateData.name,
            description: updateData.description,
            category: updateData.category,
            required: updateData.required
          });
        });
        
        // Verify success message
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', 'Document type updated successfully');
      });

      it('should handle update API errors', () => {
        cy.intercept('PATCH', `${apiEndpoints.documentTypes}/*`, {
          statusCode: 409,
          body: { error: 'Document type name already exists' }
        }).as('updateDocumentTypeError');
        
        cy.get(selectors.inputName).clear().type('Duplicate Name');
        cy.get(selectors.saveBtn).click();
        
        cy.wait('@updateDocumentTypeError');
        
        cy.get(selectors.errorMessage)
          .should('be.visible')
          .and('contain.text', 'Document type name already exists');
      });

      it('should cancel edit operation', () => {
        const originalName = 'Original Name';
        
        cy.get(selectors.inputName).then(($input) => {
          const originalValue = $input.val();
          
          cy.get(selectors.inputName).clear().type('Modified Name');
          cy.get(selectors.cancelBtn).click();
          
          // Form should close
          cy.get(selectors.documentTypeForm).should('not.exist');
          
          // Original value should be preserved
          cy.get(selectors.documentTypeItem).first()
            .find('[data-testid="type-name"]')
            .should('contain.text', originalValue);
        });
      });
    });

    describe('Delete Document Type', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.documentTypes, {
          fixture: 'document-types-list.json'
        }).as('getDocumentTypesList');
        cy.intercept('DELETE', `${apiEndpoints.documentTypes}/*`).as('deleteDocumentType');
        cy.reload();
        cy.wait('@getDocumentTypesList');
      });

      it('should show confirmation dialog before deleting', () => {
        cy.get(selectors.documentTypeItem).first()
          .find(selectors.deleteBtn).click();
        
        // Verify confirmation dialog
        cy.get('[data-testid="delete-confirmation-dialog"]')
          .should('be.visible');
        
        cy.get('[data-testid="confirmation-message"]')
          .should('contain.text', 'Are you sure you want to delete this document type?');
        
        cy.get(selectors.confirmDeleteBtn).should('be.visible');
        cy.get('[data-testid="cancel-delete-btn"]').should('be.visible');
      });

      it('should successfully delete document type', () => {
        let itemCount;
        
        // Get initial count
        cy.get(selectors.documentTypeItem).then(($items) => {
          itemCount = $items.length;
        });
        
        // Delete first item
        cy.get(selectors.documentTypeItem).first().within(() => {
          cy.get('[data-testid="type-name"]').then(($name) => {
            const nameToDelete = $name.text();
            
            cy.get(selectors.deleteBtn).click();
            cy.get(selectors.confirmDeleteBtn).click();
            
            cy.wait('@deleteDocumentType');
            
            // Verify item is removed
            cy.get(selectors.documentTypeItem)
              .should('have.length', itemCount - 1);
            
            cy.get(selectors.documentTypesList)
              .should('not.contain.text', nameToDelete);
          });
        });
        
        // Verify success message
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', 'Document type deleted successfully');
      });

      it('should handle delete API errors', () => {
        cy.intercept('DELETE', `${apiEndpoints.documentTypes}/*`, {
          statusCode: 400,
          body: { error: 'Cannot delete document type with existing documents' }
        }).as('deleteDocumentTypeError');
        
        cy.get(selectors.documentTypeItem).first()
          .find(selectors.deleteBtn).click();
        
        cy.get(selectors.confirmDeleteBtn).click();
        
        cy.wait('@deleteDocumentTypeError');
        
        cy.get(selectors.errorMessage)
          .should('be.visible')
          .and('contain.text', 'Cannot delete document type with existing documents');
      });

      it('should cancel delete operation', () => {
        let initialCount;
        
        cy.get(selectors.documentTypeItem).then(($items) => {
          initialCount = $items.length;
        });
        
        cy.get(selectors.documentTypeItem).first()
          .find(selectors.deleteBtn).click();
        
        cy.get('[data-testid="cancel-delete-btn"]').click();
        
        // Dialog should close
        cy.get('[data-testid="delete-confirmation-dialog"]')
          .should('not.exist');
        
        // Item count should remain the same
        cy.get(selectors.documentTypeItem)
          .should('have.length', initialCount);
      });
    });

    describe('Bulk Operations', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.documentTypes, {
          fixture: 'document-types-list.json'
        }).as('getDocumentTypesList');
        cy.reload();
        cy.wait('@getDocumentTypesList');
      });

      it('should handle bulk selection', () => {
        // Select multiple items
        cy.get('[data-testid="select-all-checkbox"]').check();
        
        cy.get('[data-testid="item-checkbox"]').should('be.checked');
        
        // Verify bulk actions are enabled
        cy.get('[data-testid="bulk-actions-toolbar"]')
          .should('be.visible');
        
        cy.get('[data-testid="bulk-delete-btn"]')
          .should('be.visible')
          .and('not.be.disabled');
      });

      it('should handle bulk delete operation', () => {
        cy.intercept('DELETE', `${apiEndpoints.documentTypes}/bulk`).as('bulkDeleteDocumentTypes');
        
        // Select first two items
        cy.get('[data-testid="item-checkbox"]').first().check();
        cy.get('[data-testid="item-checkbox"]').eq(1).check();
        
        cy.get('[data-testid="bulk-delete-btn"]').click();
        
        // Confirm bulk delete
        cy.get('[data-testid="bulk-delete-confirmation"]')
          .should('be.visible');
        
        cy.get('[data-testid="confirm-bulk-delete-btn"]').click();
        
        cy.wait('@bulkDeleteDocumentTypes');
        
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Document types deleted successfully');
      });
    });
  });

  describe('Consultant Document Management', () => {
    beforeEach(() => {
      // Switch to consultant user
      cy.clearCookies();
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testData.consultant.email);
      cy.get('[data-testid="input-password"]').type(testData.consultant.password);
      cy.get('[data-testid="button-login"]').click();
      
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.intercept('GET', '/api/consultants/*/documents').as('getConsultantDocuments');
      
      cy.visit('/profile/documents');
      cy.wait(['@getDocumentTypes', '@getConsultantDocuments']);
    });

    describe('Document Upload Interface', () => {
      it('should display document upload section', () => {
        cy.get(selectors.documentsTab).should('be.visible');
        cy.get(selectors.uploadDocumentBtn)
          .should('be.visible')
          .and('contain.text', 'Upload Document');
        
        cy.get(selectors.documentsList).should('be.visible');
      });

      it('should display upload form when upload button is clicked', () => {
        cy.get(selectors.uploadDocumentBtn).click();
        
        cy.get(selectors.documentUploadForm).should('be.visible');
        
        // Verify form fields
        cy.get(selectors.selectDocumentType)
          .should('be.visible')
          .and('have.attr', 'required');
        
        cy.get(selectors.fileInput)
          .should('be.visible')
          .and('have.attr', 'required');
        
        cy.get(selectors.inputExpirationDate).should('be.visible');
        cy.get(selectors.inputNotes).should('be.visible');
      });

      it('should populate document type dropdown from API', () => {
        cy.get(selectors.uploadDocumentBtn).click();
        
        cy.get(selectors.selectDocumentType).click();
        
        // Verify options are loaded
        cy.get('[data-testid="document-type-option"]')
          .should('have.length.at.least', 1);
        
        cy.get('[data-testid="document-type-option"]').first()
          .should('contain.text').and('not.be.empty');
      });
    });

    describe('Document Upload Process', () => {
      beforeEach(() => {
        cy.intercept('POST', '/api/consultants/*/documents').as('uploadDocument');
        cy.get(selectors.uploadDocumentBtn).click();
      });

      it('should successfully upload a document', () => {
        const docData = testData.documents.valid;
        
        // Select document type
        cy.get(selectors.selectDocumentType).select('Medical License');
        
        // Upload file
        cy.fixture(docData.file, 'base64').then(fileContent => {
          cy.get(selectors.fileInput).attachFile({
            fileContent,
            fileName: docData.file,
            mimeType: 'application/pdf',
            encoding: 'base64'
          });
        });
        
        // Set expiration date
        cy.get(selectors.inputExpirationDate).type(docData.expirationDate);
        
        // Add notes
        cy.get(selectors.inputNotes).type(docData.notes);
        
        // Submit
        cy.get(selectors.saveBtn).click();
        
        cy.wait('@uploadDocument').then((interception) => {
          expect(interception.request.body).to.include({
            expirationDate: docData.expirationDate,
            notes: docData.notes
          });
        });
        
        // Verify success message
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', 'Document uploaded successfully');
      });

      it('should validate required fields', () => {
        // Try to save without required fields
        cy.get(selectors.saveBtn).should('be.disabled');
        
        // Select document type only
        cy.get(selectors.selectDocumentType).select('Medical License');
        cy.get(selectors.saveBtn).should('be.disabled');
        
        // Add file
        cy.fixture('test-license.pdf', 'base64').then(fileContent => {
          cy.get(selectors.fileInput).attachFile({
            fileContent,
            fileName: 'test-license.pdf',
            mimeType: 'application/pdf',
            encoding: 'base64'
          });
        });
        
        cy.get(selectors.saveBtn).should('not.be.disabled');
      });

      it('should validate file types and sizes', () => {
        cy.get(selectors.selectDocumentType).select('Medical License');
        
        // Test invalid file type
        cy.fixture('invalid-file.txt', 'base64').then(fileContent => {
          cy.get(selectors.fileInput).attachFile({
            fileContent,
            fileName: 'invalid-file.txt',
            mimeType: 'text/plain',
            encoding: 'base64'
          });
        });
        
        cy.get(selectors.validationError)
          .should('be.visible')
          .and('contain.text', 'Only PDF, JPG, and PNG files are allowed');
      });

      it('should show expiration date requirement for applicable document types', () => {
        // Select document type that requires expiration
        cy.get(selectors.selectDocumentType).select('Medical License');
        
        cy.get(selectors.inputExpirationDate)
          .should('have.attr', 'required');
        
        cy.get('label[for="expiration-date"]')
          .should('contain.text', '*')
          .or('contain.text', 'Required');
      });

      it('should handle upload API errors', () => {
        cy.intercept('POST', '/api/consultants/*/documents', {
          statusCode: 400,
          body: { error: 'File too large' }
        }).as('uploadDocumentError');
        
        cy.get(selectors.selectDocumentType).select('Medical License');
        
        cy.fixture('test-license.pdf', 'base64').then(fileContent => {
          cy.get(selectors.fileInput).attachFile({
            fileContent,
            fileName: 'test-license.pdf',
            mimeType: 'application/pdf',
            encoding: 'base64'
          });
        });
        
        cy.get(selectors.saveBtn).click();
        
        cy.wait('@uploadDocumentError');
        
        cy.get(selectors.errorMessage)
          .should('be.visible')
          .and('contain.text', 'File too large');
      });
    });

    describe('Document List and Management', () => {
      beforeEach(() => {
        cy.intercept('GET', '/api/consultants/*/documents', {
          fixture: 'consultant-documents.json'
        }).as('getConsultantDocuments');
        cy.reload();
        cy.wait('@getConsultantDocuments');
      });

      it('should display uploaded documents list', () => {
        cy.get(selectors.documentsList).should('be.visible');
        
        cy.get(selectors.documentItem).should('have.length.at.least', 1);
        
        cy.get(selectors.documentItem).first().within(() => {
          cy.get('[data-testid="document-name"]').should('be.visible');
          cy.get('[data-testid="document-type"]').should('be.visible');
          cy.get(selectors.documentStatus).should('be.visible');
          cy.get('[data-testid="upload-date"]').should('be.visible');
          cy.get('[data-testid="expiration-date"]').should('be.visible');
        });
      });

      it('should display correct document status', () => {
        const statusTypes = ['pending', 'approved', 'rejected', 'expired'];
        
        cy.get(selectors.documentItem).each(($item) => {
          cy.wrap($item).find(selectors.documentStatus).then(($status) => {
            const statusText = $status.text().toLowerCase();
            expect(statusTypes.some(type => statusText.includes(type))).to.be.true;
          });
        });
      });

      it('should highlight expired documents', () => {
        cy.get(selectors.documentItem).each(($item) => {
          cy.wrap($item).find(selectors.documentStatus).then(($status) => {
            if ($status.text().toLowerCase().includes('expired')) {
              cy.wrap($item).should('have.class', 'expired')
                .or('have.class', 'bg-red-50')
                .or('have.attr', 'data-status', 'expired');
            }
          });
        });
      });

      it('should allow document download/view', () => {
        cy.get(selectors.documentItem).first().within(() => {
          cy.get('[data-testid="view-document-btn"]')
            .should('be.visible')
            .click();
        });
        
        // Verify document opens (could be new tab or modal)
        cy.get('[data-testid="document-viewer"]').should('be.visible')
          .or(() => {
            cy.window().then((win) => {
              expect(win.open).to.have.been.called;
            });
          });
      });

      it('should show document requirements status', () => {
        cy.get('[data-testid="requirements-summary"]').should('be.visible');
        
        cy.get('[data-testid="required-documents-count"]')
          .should('be.visible')
          .and('contain.text', /\d+/);
        
        cy.get('[data-testid="pending-documents-count"]')
          .should('be.visible')
          .and('contain.text', /\d+/);
        
        cy.get('[data-testid="compliance-percentage"]')
          .should('be.visible')
          .and('contain.text', '%');
      });
    });

    describe('Document Status Updates', () => {
      beforeEach(() => {
        cy.intercept('PATCH', '/api/documents/*/status').as('updateDocumentStatus');
      });

      it('should handle admin approval process', () => {
        // Login as admin
        cy.clearCookies();
        cy.visit('/login');
        cy.get('[data-testid="input-email"]').type(testData.admin.email);
        cy.get('[data-testid="input-password"]').type(testData.admin.password);
        cy.get('[data-testid="button-login"]').click();
        
        cy.visit('/admin/documents/pending');
        
        cy.get('[data-testid="pending-document-item"]').first().within(() => {
          cy.get('[data-testid="approve-btn"]').click();
        });
        
        cy.wait('@updateDocumentStatus').then((interception) => {
          expect(interception.request.body).to.include({
            status: 'approved'
          });
        });
        
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Document approved successfully');
      });

      it('should handle document rejection with reason', () => {
        cy.clearCookies();
        cy.visit('/login');
        cy.get('[data-testid="input-email"]').type(testData.admin.email);
        cy.get('[data-testid="input-password"]').type(testData.admin.password);
        cy.get('[data-testid="button-login"]').click();
        
        cy.visit('/admin/documents/pending');
        
        cy.get('[data-testid="pending-document-item"]').first().within(() => {
          cy.get('[data-testid="reject-btn"]').click();
        });
        
        cy.get('[data-testid="rejection-reason-dialog"]').should('be.visible');
        cy.get('[data-testid="rejection-reason-input"]')
          .type('Document is not clear, please reupload');
        
        cy.get('[data-testid="confirm-rejection-btn"]').click();
        
        cy.wait('@updateDocumentStatus').then((interception) => {
          expect(interception.request.body).to.include({
            status: 'rejected',
            rejectionReason: 'Document is not clear, please reupload'
          });
        });
      });
    });

    describe('Responsive Design', () => {
      const viewports = [
        { device: 'mobile', width: 375, height: 667 },
        { device: 'tablet', width: 768, height: 1024 },
        { device: 'desktop', width: 1920, height: 1080 }
      ];

      viewports.forEach(viewport => {
        it(`should display correctly on ${viewport.device} (${viewport.width}x${viewport.height})`, () => {
          cy.viewport(viewport.width, viewport.height);
          
          // Main container should be responsive
          cy.get(selectors.documentsList)
            .should('be.visible')
            .and('have.css', 'width')
            .then(width => {
              expect(parseInt(width)).to.be.at.most(viewport.width);
            });
          
          // Upload button should be accessible
          cy.get(selectors.uploadDocumentBtn).should('be.visible');
          
          if (viewport.device === 'mobile') {
            // On mobile, some elements might be stacked
            cy.get(selectors.documentItem).first().then($item => {
              const itemHeight = $item.height();
              // Mobile items typically have more height due to stacking
              expect(itemHeight).to.be.at.least(80);
            });
          }
        });
      });
    });

    describe('Keyboard Navigation and Accessibility', () => {
      it('should support keyboard navigation', () => {
        // Tab through upload form
        cy.get(selectors.uploadDocumentBtn).click();
        
        cy.get(selectors.selectDocumentType).focus();
        cy.get(selectors.selectDocumentType).should('have.focus');
        
        cy.get(selectors.selectDocumentType).tab();
        cy.get(selectors.fileInput).should('have.focus');
        
        cy.get(selectors.fileInput).tab();
        cy.get(selectors.inputExpirationDate).should('have.focus');
      });

      it('should have proper ARIA labels and roles', () => {
        cy.get(selectors.uploadDocumentBtn)
          .should('have.attr', 'aria-label')
          .and('have.attr', 'role');
        
        cy.get(selectors.documentsList)
          .should('have.attr', 'role', 'list')
          .or('have.attr', 'role', 'table');
        
        cy.get(selectors.documentItem).first()
          .should('have.attr', 'role', 'listitem')
          .or('have.attr', 'role', 'row');
      });

      it('should support screen reader announcements', () => {
        cy.get(selectors.uploadDocumentBtn).click();
        
        // Check for screen reader text
        cy.get('[data-testid="sr-only"]').should('exist');
        
        // Status indicators should have accessible text
        cy.get(selectors.documentStatus).first().then($status => {
          cy.wrap($status).should('have.attr', 'aria-label')
            .or('contain', '[data-testid="sr-status-text"]');
        });
      });
    });

    describe('Performance and Loading States', () => {
      it('should handle slow API responses gracefully', () => {
        cy.intercept('GET', '/api/consultants/*/documents', (req) => {
          req.reply((res) => {
            res.delay(3000).send({ fixture: 'consultant-documents.json' });
          });
        }).as('getSlowDocuments');
        
        cy.reload();
        
        // Loading state should be visible
        cy.get(selectors.loadingSpinner).should('be.visible');
        cy.get(selectors.skeleton).should('be.visible');
        
        cy.wait('@getSlowDocuments');
        
        // Loading state should disappear
        cy.get(selectors.loadingSpinner).should('not.exist');
        cy.get(selectors.documentsList).should('be.visible');
      });

      it('should handle file upload progress', () => {
        cy.get(selectors.uploadDocumentBtn).click();
        
        cy.get(selectors.selectDocumentType).select('Medical License');
        
        // Mock large file upload
        cy.fixture('large-document.pdf', 'base64').then(fileContent => {
          cy.get(selectors.fileInput).attachFile({
            fileContent,
            fileName: 'large-document.pdf',
            mimeType: 'application/pdf',
            encoding: 'base64'
          });
        });
        
        cy.get(selectors.saveBtn).click();
        
        // Progress indicator should be visible
        cy.get('[data-testid="upload-progress"]').should('be.visible');
        cy.get('[data-testid="progress-bar"]').should('be.visible');
        cy.get('[data-testid="progress-percentage"]')
          .should('be.visible')
          .and('contain.text', '%');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency between admin document types and consultant upload options', () => {
      // Create document type as admin
      cy.visit('/admin/document-types');
      cy.get(selectors.createDocumentTypeBtn).click();
      
      const newDocType = {
        name: 'Integration Test License',
        description: 'Test document type for integration',
        category: 'Testing',
        required: true,
        expirationRequired: true
      };
      
      cy.get(selectors.inputName).type(newDocType.name);
      cy.get(selectors.inputDescription).type(newDocType.description);
      cy.get(selectors.inputCategory).type(newDocType.category);
      cy.get(selectors.checkboxRequired).check();
      cy.get(selectors.checkboxExpirationRequired).check();
      cy.get(selectors.saveBtn).click();
      
      // Switch to consultant view
      cy.clearCookies();
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testData.consultant.email);
      cy.get('[data-testid="input-password"]').type(testData.consultant.password);
      cy.get('[data-testid="button-login"]').click();
      
      cy.visit('/profile/documents');
      cy.get(selectors.uploadDocumentBtn).click();
      
      // Verify new document type appears in dropdown
      cy.get(selectors.selectDocumentType).click();
      cy.get('[data-testid="document-type-option"]')
        .should('contain.text', newDocType.name);
      
      // Verify expiration field is required
      cy.get(selectors.selectDocumentType).select(newDocType.name);
      cy.get(selectors.inputExpirationDate)
        .should('have.attr', 'required');
    });

    it('should handle real-time updates when document types change', () => {
      // Open consultant document upload in one session
      cy.visit('/profile/documents');
      cy.get(selectors.uploadDocumentBtn).click();
      
      // Verify initial document types
      cy.get(selectors.selectDocumentType).click();
      cy.get('[data-testid="document-type-option"]').then(initialOptions => {
        const initialCount = initialOptions.length;
        
        // Simulate admin adding new document type (would normally be via websocket/polling)
        cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
          req.reply((res) => {
            // Add a new document type to the response
            const response = res.body;
            response.push({
              id: 'new-doc-type',
              name: 'Newly Added License',
              description: 'Added while user was viewing',
              required: true,
              expirationRequired: false
            });
            res.send(response);
          });
        }).as('getUpdatedDocumentTypes');
        
        // Refresh document types (simulate real-time update)
        cy.get('[data-testid="refresh-document-types"]').click();
        cy.wait('@getUpdatedDocumentTypes');
        
        // Verify new option appears
        cy.get('[data-testid="document-type-option"]')
          .should('have.length', initialCount + 1)
          .and('contain.text', 'Newly Added License');
      });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle network failures gracefully', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { forceNetworkError: true })
        .as('networkError');
      
      cy.visit('/profile/documents');
      
      cy.wait('@networkError');
      
      cy.get('[data-testid="network-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Unable to load document types');
      
      cy.get('[data-testid="retry-btn"]').should('be.visible');
    });

    it('should handle corrupted file uploads', () => {
      cy.visit('/profile/documents');
      cy.get(selectors.uploadDocumentBtn).click();
      
      cy.get(selectors.selectDocumentType).select('Medical License');
      
      // Upload corrupted file
      cy.get(selectors.fileInput).attachFile({
        fileContent: 'corrupted-data-not-a-real-pdf',
        fileName: 'corrupted.pdf',
        mimeType: 'application/pdf'
      });
      
      cy.get(selectors.saveBtn).click();
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', 'File appears to be corrupted');
    });

    it('should handle session expiration during upload', () => {
      cy.visit('/profile/documents');
      cy.get(selectors.uploadDocumentBtn).click();
      
      cy.get(selectors.selectDocumentType).select('Medical License');
      
      cy.fixture('test-license.pdf', 'base64').then(fileContent => {
        cy.get(selectors.fileInput).attachFile({
          fileContent,
          fileName: 'test-license.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64'
        });
      });
      
      // Simulate session expiration
      cy.intercept('POST', '/api/consultants/*/documents', {
        statusCode: 401,
        body: { error: 'Session expired' }
      }).as('sessionExpired');
      
      cy.get(selectors.saveBtn).click();
      cy.wait('@sessionExpired');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      cy.get('[data-testid="session-expired-message"]')
        .should('be.visible');
    });

    it('should handle concurrent document type modifications', () => {
      // Admin deletes document type while consultant is trying to upload
      cy.visit('/profile/documents');
      cy.get(selectors.uploadDocumentBtn).click();
      
      cy.get(selectors.selectDocumentType).select('Medical License');
      
      // Simulate document type being deleted by admin
      cy.intercept('POST', '/api/consultants/*/documents', {
        statusCode: 400,
        body: { error: 'Document type no longer exists' }
      }).as('documentTypeDeleted');
      
      cy.fixture('test-license.pdf', 'base64').then(fileContent => {
        cy.get(selectors.fileInput).attachFile({
          fileContent,
          fileName: 'test-license.pdf',
          mimeType: 'application/pdf',
          encoding: 'base64'
        });
      });
      
      cy.get(selectors.saveBtn).click();
      cy.wait('@documentTypeDeleted');
      
      cy.get(selectors.errorMessage)
        .should('be.visible')
        .and('contain.text', 'Document type no longer exists');
      
      // Form should refresh with updated document types
      cy.get('[data-testid="refresh-form-btn"]').click();
      cy.get(selectors.selectDocumentType).should('not.contain.text', 'Medical License');
    });
  });
});
