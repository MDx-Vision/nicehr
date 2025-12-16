describe('Document Types Feature - Exhaustive Tests', () => {
  const testData = {
    validDocumentTypes: [
      {
        name: 'Medical License',
        description: 'Professional medical license documentation',
        required: true,
        category: 'Licensing'
      },
      {
        name: 'Resume/CV',
        description: 'Current curriculum vitae or resume',
        required: true,
        category: 'Professional'
      },
      {
        name: 'References',
        description: 'Professional references from previous employers',
        required: false,
        category: 'Professional'
      },
      {
        name: 'Background Check',
        description: 'Criminal background verification',
        required: true,
        category: 'Verification'
      }
    ],
    invalidData: {
      emptyName: '',
      longName: 'a'.repeat(256),
      longDescription: 'a'.repeat(1001),
      specialCharacters: '<script>alert("xss")</script>',
      sqlInjection: "'; DROP TABLE document_types; --"
    },
    apiEndpoints: {
      documentTypes: '/api/document-types',
      consultants: '/api/consultants',
      consultantDocuments: '/api/consultants/:consultantId/documents'
    }
  };

  beforeEach(() => {
    // Reset application state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login as admin user
    cy.login('test@example.com', 'test123');
    
    // Setup API interceptors
    cy.intercept('GET', '/api/document-types*', { fixture: 'document-types.json' }).as('getDocumentTypes');
    cy.intercept('POST', '/api/document-types', { statusCode: 201, body: { id: 1, ...testData.validDocumentTypes[0] } }).as('createDocumentType');
    cy.intercept('PATCH', '/api/document-types/*', { statusCode: 200, body: { id: 1, ...testData.validDocumentTypes[0] } }).as('updateDocumentType');
    cy.intercept('DELETE', '/api/document-types/*', { statusCode: 204 }).as('deleteDocumentType');
    cy.intercept('GET', '/api/consultants*', { fixture: 'consultants.json' }).as('getConsultants');
  });

  describe('Document Types Management Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display complete page layout and navigation', () => {
      // Page title and breadcrumbs
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', 'Document Types');
      
      cy.get('[data-testid="breadcrumb"]')
        .should('be.visible')
        .and('contain.text', 'Admin')
        .and('contain.text', 'Document Types');

      // Main action buttons
      cy.get('[data-testid="btn-create-document-type"]')
        .should('be.visible')
        .and('contain.text', 'Add Document Type');

      // Data table or list container
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');

      // Navigation menu
      cy.get('[data-testid="main-navigation"]')
        .should('be.visible');
      
      // User menu
      cy.get('[data-testid="user-menu"]')
        .should('be.visible');
    });

    it('should have proper responsive layout on different screen sizes', () => {
      // Desktop view
      cy.viewport(1920, 1080);
      cy.get('[data-testid="document-types-container"]').should('be.visible');
      
      // Tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="document-types-container"]').should('be.visible');
      cy.get('[data-testid="btn-create-document-type"]').should('be.visible');
      
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="document-types-container"]').should('be.visible');
      
      // Check for mobile menu toggle if exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
          cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
        }
      });
    });

    it('should display loading state correctly', () => {
      cy.intercept('GET', '/api/document-types*', { delay: 2000, fixture: 'document-types.json' }).as('slowDocumentTypes');
      cy.reload();
      
      // Loading indicator
      cy.get('[data-testid="loading-indicator"]', { timeout: 1000 })
        .should('be.visible');
      
      cy.wait('@slowDocumentTypes');
      cy.get('[data-testid="loading-indicator"]')
        .should('not.exist');
    });
  });

  describe('Document Types List Display', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types in table format', () => {
      // Table headers
      cy.get('[data-testid="document-types-table"]').within(() => {
        cy.get('thead').within(() => {
          cy.contains('Name').should('be.visible');
          cy.contains('Description').should('be.visible');
          cy.contains('Required').should('be.visible');
          cy.contains('Category').should('be.visible');
          cy.contains('Actions').should('be.visible');
        });

        // Table rows
        cy.get('tbody tr').should('have.length.at.least', 1);
        
        // First row data
        cy.get('tbody tr').first().within(() => {
          cy.get('td').should('have.length.at.least', 5);
          cy.get('[data-testid="document-type-name"]').should('be.visible');
          cy.get('[data-testid="document-type-description"]').should('be.visible');
          cy.get('[data-testid="document-type-required"]').should('be.visible');
          cy.get('[data-testid="document-type-category"]').should('be.visible');
          cy.get('[data-testid="document-type-actions"]').should('be.visible');
        });
      });
    });

    it('should display action buttons for each document type', () => {
      cy.get('[data-testid="document-types-table"] tbody tr').first().within(() => {
        cy.get('[data-testid="btn-edit-document-type"]')
          .should('be.visible')
          .and('not.be.disabled');
        
        cy.get('[data-testid="btn-delete-document-type"]')
          .should('be.visible')
          .and('not.be.disabled');
        
        // View/details button if exists
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="btn-view-document-type"]').length > 0) {
            cy.get('[data-testid="btn-view-document-type"]')
              .should('be.visible')
              .and('not.be.disabled');
          }
        });
      });
    });

    it('should handle empty state correctly', () => {
      cy.intercept('GET', '/api/document-types*', { statusCode: 200, body: [] }).as('emptyDocumentTypes');
      cy.reload();
      cy.wait('@emptyDocumentTypes');

      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', 'No document types found');
      
      cy.get('[data-testid="btn-create-first-document-type"]')
        .should('be.visible')
        .and('contain.text', 'Create your first document type');
    });

    it('should handle error state correctly', () => {
      cy.intercept('GET', '/api/document-types*', { statusCode: 500, body: { error: 'Server error' } }).as('errorDocumentTypes');
      cy.reload();
      cy.wait('@errorDocumentTypes');

      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load document types');
      
      cy.get('[data-testid="btn-retry"]')
        .should('be.visible')
        .and('contain.text', 'Retry');
    });
  });

  describe('Search and Filtering Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should perform real-time search on document type names', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
      
      // Test search functionality
      cy.get('[data-testid="search-input"]').type('Medical');
      cy.get('[data-testid="document-types-table"] tbody tr')
        .should('have.length.at.least', 1)
        .first()
        .should('contain.text', 'Medical');

      // Clear search
      cy.get('[data-testid="search-input"]').clear();
      cy.get('[data-testid="search-clear"]').click();
      cy.get('[data-testid="document-types-table"] tbody tr')
        .should('have.length.at.least', 1);
    });

    it('should filter by required status', () => {
      cy.get('[data-testid="filter-required"]').should('be.visible');
      
      // Filter for required documents
      cy.get('[data-testid="filter-required"]').select('Required');
      cy.get('[data-testid="document-types-table"] tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="document-type-required"]')
            .should('contain.text', 'Yes');
        });
      });

      // Filter for optional documents
      cy.get('[data-testid="filter-required"]').select('Optional');
      cy.get('[data-testid="document-types-table"] tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="document-type-required"]')
            .should('contain.text', 'No');
        });
      });

      // Reset filter
      cy.get('[data-testid="filter-required"]').select('All');
    });

    it('should filter by category', () => {
      cy.get('[data-testid="filter-category"]').should('be.visible');
      
      // Filter by Licensing category
      cy.get('[data-testid="filter-category"]').select('Licensing');
      cy.get('[data-testid="document-types-table"] tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="document-type-category"]')
            .should('contain.text', 'Licensing');
        });
      });

      // Reset filter
      cy.get('[data-testid="filter-category"]').select('All Categories');
    });

    it('should combine multiple filters', () => {
      // Apply multiple filters
      cy.get('[data-testid="search-input"]').type('License');
      cy.get('[data-testid="filter-required"]').select('Required');
      cy.get('[data-testid="filter-category"]').select('Licensing');

      // Verify results match all filters
      cy.get('[data-testid="document-types-table"] tbody tr').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="document-type-name"]')
            .should('contain.text', 'License');
          cy.get('[data-testid="document-type-required"]')
            .should('contain.text', 'Yes');
          cy.get('[data-testid="document-type-category"]')
            .should('contain.text', 'Licensing');
        });
      });
    });
  });

  describe('Pagination and Sorting', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/document-types*', { fixture: 'document-types-large.json' }).as('getLargeDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getLargeDocumentTypes');
    });

    it('should display pagination controls when needed', () => {
      cy.get('[data-testid="pagination"]').should('be.visible');
      
      cy.get('[data-testid="pagination-info"]')
        .should('be.visible')
        .and('contain.text', 'Showing');
      
      cy.get('[data-testid="btn-prev-page"]').should('be.visible');
      cy.get('[data-testid="btn-next-page"]').should('be.visible');
      cy.get('[data-testid="page-numbers"]').should('be.visible');
    });

    it('should navigate between pages correctly', () => {
      // Go to next page
      cy.get('[data-testid="btn-next-page"]').click();
      cy.url().should('include', 'page=2');
      
      // Go to previous page
      cy.get('[data-testid="btn-prev-page"]').click();
      cy.url().should('include', 'page=1');
      
      // Click specific page number
      cy.get('[data-testid="page-numbers"] button').contains('3').click();
      cy.url().should('include', 'page=3');
    });

    it('should sort by different columns', () => {
      // Sort by name
      cy.get('[data-testid="sort-name"]').click();
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="document-type-name"]')
        .invoke('text')
        .then((firstName) => {
          cy.get('[data-testid="sort-name"]').click();
          cy.get('[data-testid="document-types-table"] tbody tr')
            .first()
            .find('[data-testid="document-type-name"]')
            .should('not.contain.text', firstName);
        });

      // Sort by category
      cy.get('[data-testid="sort-category"]').click();
      cy.get('[data-testid="sort-indicator-category"]')
        .should('be.visible');
    });

    it('should change items per page', () => {
      cy.get('[data-testid="items-per-page"]').select('50');
      cy.get('[data-testid="document-types-table"] tbody tr')
        .should('have.length.at.most', 50);
      
      cy.get('[data-testid="items-per-page"]').select('10');
      cy.get('[data-testid="document-types-table"] tbody tr')
        .should('have.length.at.most', 10);
    });
  });

  describe('Create Document Type Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open create document type modal/form', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="form-create-document-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Add Document Type');
    });

    it('should display all required form fields', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="select-category"]')
        .should('be.visible');
      
      cy.get('[data-testid="checkbox-required"]')
        .should('be.visible');
      
      cy.get('[data-testid="btn-save-document-type"]')
        .should('be.visible')
        .and('contain.text', 'Save');
      
      cy.get('[data-testid="btn-cancel"]')
        .should('be.visible')
        .and('contain.text', 'Cancel');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      // Try to submit empty form
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', 'Name is required');
      
      // Fill name but leave other required fields empty if any
      cy.get('[data-testid="input-name"]').type('Test Document');
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      // Should not show name error anymore
      cy.get('[data-testid="error-name"]').should('not.exist');
    });

    it('should validate field lengths and formats', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      // Test name length validation
      cy.get('[data-testid="input-name"]').type(testData.invalidData.longName);
      cy.get('[data-testid="btn-save-document-type"]').click();
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', 'Name must be less than');
      
      // Test description length validation
      cy.get('[data-testid="input-name"]').clear().type('Valid Name');
      cy.get('[data-testid="input-description"]').type(testData.invalidData.longDescription);
      cy.get('[data-testid="btn-save-document-type"]').click();
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('contain.text', 'Description must be less than');
    });

    it('should handle XSS and injection attempts', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      // Test XSS in name field
      cy.get('[data-testid="input-name"]').type(testData.invalidData.specialCharacters);
      cy.get('[data-testid="input-description"]').type(testData.invalidData.sqlInjection);
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      // Verify the form properly escapes or rejects malicious input
      cy.get('[data-testid="input-name"]')
        .should('not.contain.value', '<script>');
    });

    it('should successfully create a document type with valid data', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      const newDocType = testData.validDocumentTypes[0];
      
      cy.get('[data-testid="input-name"]').type(newDocType.name);
      cy.get('[data-testid="input-description"]').type(newDocType.description);
      cy.get('[data-testid="select-category"]').select(newDocType.category);
      
      if (newDocType.required) {
        cy.get('[data-testid="checkbox-required"]').check();
      }
      
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: newDocType.name,
          description: newDocType.description,
          category: newDocType.category,
          required: newDocType.required
        });
      });
      
      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type created successfully');
      
      // Verify modal closes
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');
    });

    it('should handle API errors during creation', () => {
      cy.intercept('POST', '/api/document-types', { statusCode: 400, body: { error: 'Document type name already exists' } }).as('createError');
      
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').type('Duplicate Name');
      cy.get('[data-testid="input-description"]').type('Test description');
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.wait('@createError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type name already exists');
    });

    it('should allow canceling document type creation', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').type('Test Name');
      cy.get('[data-testid="input-description"]').type('Test description');
      
      cy.get('[data-testid="btn-cancel"]').click();
      
      cy.get('[data-testid="modal-create-document-type"]')
        .should('not.exist');
      
      // Verify no API call was made
      cy.get('@createDocumentType').should('not.exist');
    });
  });

  describe('Edit Document Type Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open edit modal with pre-populated data', () => {
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-edit-document-type"]')
        .click();
      
      cy.get('[data-testid="modal-edit-document-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="modal-title"]')
        .should('contain.text', 'Edit Document Type');
      
      // Verify fields are pre-populated
      cy.get('[data-testid="input-name"]')
        .should('have.value')
        .and('not.be.empty');
      
      cy.get('[data-testid="input-description"]')
        .should('have.value');
    });

    it('should validate edited data', () => {
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-edit-document-type"]')
        .click();
      
      // Clear required field
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', 'Name is required');
    });

    it('should successfully update document type', () => {
      cy.intercept('PATCH', '/api/document-types/*', { statusCode: 200, body: { id: 1, name: 'Updated Name' } }).as('updateDocumentType');
      
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-edit-document-type"]')
        .click();
      
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Updated Document Type Name');
      
      cy.get('[data-testid="input-description"]')
        .clear()
        .type('Updated description');
      
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.wait('@updateDocumentType');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type updated successfully');
    });

    it('should handle edit conflicts and errors', () => {
      cy.intercept('PATCH', '/api/document-types/*', { statusCode: 409, body: { error: 'Document type has been modified by another user' } }).as('updateConflict');
      
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-edit-document-type"]')
        .click();
      
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Conflicted Name');
      
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.wait('@updateConflict');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type has been modified by another user');
    });
  });

  describe('Delete Document Type Functionality', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show confirmation dialog for deletion', () => {
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-delete-document-type"]')
        .click();
      
      cy.get('[data-testid="confirm-delete-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-delete-title"]')
        .should('contain.text', 'Delete Document Type');
      
      cy.get('[data-testid="confirm-delete-message"]')
        .should('contain.text', 'Are you sure you want to delete this document type?');
      
      cy.get('[data-testid="btn-confirm-delete"]')
        .should('be.visible')
        .and('contain.text', 'Delete');
      
      cy.get('[data-testid="btn-cancel-delete"]')
        .should('be.visible')
        .and('contain.text', 'Cancel');
    });

    it('should cancel deletion when cancel is clicked', () => {
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-delete-document-type"]')
        .click();
      
      cy.get('[data-testid="btn-cancel-delete"]').click();
      
      cy.get('[data-testid="confirm-delete-modal"]')
        .should('not.exist');
      
      // Verify no API call was made
      cy.get('@deleteDocumentType').should('not.exist');
    });

    it('should successfully delete document type', () => {
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-delete-document-type"]')
        .click();
      
      cy.get('[data-testid="btn-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentType');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type deleted successfully');
      
      cy.get('[data-testid="confirm-delete-modal"]')
        .should('not.exist');
    });

    it('should handle deletion errors', () => {
      cy.intercept('DELETE', '/api/document-types/*', { statusCode: 409, body: { error: 'Cannot delete document type that is in use' } }).as('deleteError');
      
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-delete-document-type"]')
        .click();
      
      cy.get('[data-testid="btn-confirm-delete"]').click();
      
      cy.wait('@deleteError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Cannot delete document type that is in use');
    });

    it('should prevent deletion of required system document types', () => {
      // Assume certain document types are system-required
      cy.get('[data-testid="document-types-table"] tbody tr').each(($row, index) => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="document-type-name"]').invoke('text').then((name) => {
            if (name.includes('System Required')) {
              cy.get('[data-testid="btn-delete-document-type"]')
                .should('be.disabled')
                .and('have.attr', 'title', 'System required document types cannot be deleted');
            }
          });
        });
      });
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should allow selecting multiple document types', () => {
      // Check if bulk selection is available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-all-checkbox"]').length > 0) {
          // Select all checkbox
          cy.get('[data-testid="select-all-checkbox"]').check();
          
          // Verify all rows are selected
          cy.get('[data-testid="row-checkbox"]').each(($checkbox) => {
            cy.wrap($checkbox).should('be.checked');
          });
          
          // Verify bulk actions are available
          cy.get('[data-testid="bulk-actions"]').should('be.visible');
        }
      });
    });

    it('should perform bulk deletion', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-all-checkbox"]').length > 0) {
          // Select multiple items
          cy.get('[data-testid="row-checkbox"]').first().check();
          cy.get('[data-testid="row-checkbox"]').eq(1).check();
          
          // Click bulk delete
          cy.get('[data-testid="btn-bulk-delete"]').click();
          
          cy.get('[data-testid="confirm-bulk-delete-modal"]')
            .should('be.visible');
          
          cy.get('[data-testid="bulk-delete-count"]')
            .should('contain.text', '2');
          
          cy.intercept('DELETE', '/api/document-types/bulk', { statusCode: 204 }).as('bulkDelete');
          
          cy.get('[data-testid="btn-confirm-bulk-delete"]').click();
          
          cy.wait('@bulkDelete');
          
          cy.get('[data-testid="success-message"]')
            .should('contain.text', 'Document types deleted successfully');
        }
      });
    });
  });

  describe('Document Type Usage and Dependencies', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/consultants/*/documents', { fixture: 'consultant-documents.json' }).as('getConsultantDocuments');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show document usage statistics', () => {
      // Click on a document type to view details
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="document-type-name"]')
        .click();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="document-type-details-modal"]').length > 0) {
          cy.get('[data-testid="usage-statistics"]')
            .should('be.visible');
          
          cy.get('[data-testid="total-documents-count"]')
            .should('be.visible')
            .and('contain.text', 'Total Documents:');
          
          cy.get('[data-testid="consultants-using-count"]')
            .should('be.visible')
            .and('contain.text', 'Consultants:');
        }
      });
    });

    it('should show related consultants using this document type', () => {
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-view-usage"]')
        .click();
      
      cy.get('[data-testid="usage-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="consultants-list"]')
        .should('be.visible');
      
      cy.get('[data-testid="consultant-item"]')
        .should('have.length.at.least', 1);
    });

    it('should prevent deletion of document types in use', () => {
      // Try to delete a document type that's in use
      cy.intercept('DELETE', '/api/document-types/*', { 
        statusCode: 409, 
        body: { error: 'Cannot delete document type. 5 consultants have documents of this type.' } 
      }).as('deleteInUse');
      
      cy.get('[data-testid="document-types-table"] tbody tr')
        .first()
        .find('[data-testid="btn-delete-document-type"]')
        .click();
      
      cy.get('[data-testid="btn-confirm-delete"]').click();
      
      cy.wait('@deleteInUse');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', '5 consultants have documents');
    });
  });

  describe('Integration with Consultant Documents', () => {
    beforeEach(() => {
      cy.visit('/consultants/ci-test-consultant/documents');
      cy.wait('@getConsultantDocuments');
    });

    it('should display available document types in consultant document upload', () => {
      cy.get('[data-testid="btn-upload-document"]').click();
      
      cy.get('[data-testid="select-document-type"]')
        .should('be.visible');
      
      cy.get('[data-testid="select-document-type"]').click();
      
      // Verify document types are populated from API
      testData.validDocumentTypes.forEach((docType) => {
        cy.get('[data-testid="select-document-type"]')
          .should('contain', docType.name);
      });
    });

    it('should show required document types prominently', () => {
      cy.get('[data-testid="required-documents-section"]')
        .should('be.visible');
      
      cy.get('[data-testid="required-document-item"]')
        .should('have.length.at.least', 1)
        .each(($item) => {
          cy.wrap($item).within(() => {
            cy.get('[data-testid="required-badge"]')
              .should('be.visible')
              .and('contain.text', 'Required');
          });
        });
    });

    it('should validate required document types for consultant onboarding', () => {
      // Check compliance status
      cy.get('[data-testid="compliance-status"]')
        .should('be.visible');
      
      cy.get('[data-testid="missing-required-documents"]')
        .should('be.visible');
      
      // Each missing required document should be listed
      cy.get('[data-testid="missing-document-item"]')
        .should('have.length.at.least', 1)
        .each(($item) => {
          cy.wrap($item).within(() => {
            cy.get('[data-testid="document-type-name"]')
              .should('be.visible');
            cy.get('[data-testid="btn-upload-missing"]')
              .should('be.visible');
          });
        });
    });
  });

  describe('Permission and Access Control', () => {
    it('should restrict document type management to admin users', () => {
      // Test with non-admin user
      cy.login('consultant@example.com', 'password');
      
      cy.visit('/admin/document-types');
      
      // Should redirect to unauthorized page or dashboard
      cy.url().should('not.include', '/admin/document-types');
      cy.get('[data-testid="unauthorized-message"]')
        .should('be.visible')
        .and('contain.text', 'You do not have permission to access this page');
    });

    it('should show read-only view for users with limited permissions', () => {
      // Test with user who has read-only admin access
      cy.login('readonly-admin@example.com', 'password');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Should see list but no edit buttons
      cy.get('[data-testid="document-types-table"]')
        .should('be.visible');
      
      cy.get('[data-testid="btn-create-document-type"]')
        .should('not.exist');
      
      cy.get('[data-testid="btn-edit-document-type"]')
        .should('not.exist');
      
      cy.get('[data-testid="btn-delete-document-type"]')
        .should('not.exist');
    });
  });

  describe('Performance and Loading States', () => {
    it('should handle slow API responses gracefully', () => {
      cy.intercept('GET', '/api/document-types*', { 
        delay: 3000, 
        fixture: 'document-types.json' 
      }).as('slowDocumentTypes');
      
      cy.visit('/admin/document-types');
      
      // Loading state should be visible
      cy.get('[data-testid="loading-indicator"]', { timeout: 1000 })
        .should('be.visible');
      
      // Content should load after delay
      cy.wait('@slowDocumentTypes');
      cy.get('[data-testid="document-types-table"]', { timeout: 5000 })
        .should('be.visible');
      
      cy.get('[data-testid="loading-indicator"]')
        .should('not.exist');
    });

    it('should handle network failures gracefully', () => {
      cy.intercept('GET', '/api/document-types*', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/admin/document-types');
      cy.wait('@networkError');
      
      cy.get('[data-testid="network-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Network error');
      
      cy.get('[data-testid="btn-retry"]')
        .should('be.visible');
    });

    it('should maintain form state during validation errors', () => {
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      // Fill out form partially
      cy.get('[data-testid="input-name"]').type('Partial Form Data');
      cy.get('[data-testid="input-description"]').type('Some description');
      cy.get('[data-testid="checkbox-required"]').check();
      
      // Simulate validation error
      cy.intercept('POST', '/api/document-types', { 
        statusCode: 400, 
        body: { error: 'Validation failed' } 
      }).as('validationError');
      
      cy.get('[data-testid="btn-save-document-type"]').click();
      cy.wait('@validationError');
      
      // Verify form data is preserved
      cy.get('[data-testid="input-name"]')
        .should('have.value', 'Partial Form Data');
      cy.get('[data-testid="input-description"]')
        .should('have.value', 'Some description');
      cy.get('[data-testid="checkbox-required"]')
        .should('be.checked');
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid').and('match', /filter|btn-create/);
      
      // Enter key should activate buttons
      cy.get('[data-testid="btn-create-document-type"]').focus();
      cy.focused().type('{enter}');
      
      cy.get('[data-testid="modal-create-document-type"]')
        .should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      // Table accessibility
      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table');
      
      // Button accessibility
      cy.get('[data-testid="btn-create-document-type"]')
        .should('have.attr', 'aria-label');
      
      // Form accessibility
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
      
      cy.get('[data-testid="input-description"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
    });

    it('should announce dynamic content changes to screen readers', () => {
      // Success message should have proper ARIA attributes
      cy.get('[data-testid="btn-create-document-type"]').click();
      
      const newDocType = testData.validDocumentTypes[0];
      cy.get('[data-testid="input-name"]').type(newDocType.name);
      cy.get('[data-testid="input-description"]').type(newDocType.description);
      cy.get('[data-testid="btn-save-document-type"]').click();
      
      cy.wait('@createDocumentType');
      
      cy.get('[data-testid="success-message"]')
        .should('have.attr', 'role', 'alert')
        .or('have.attr', 'aria-live');
    });
  });

  describe('Data Export and Import', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should export document types data', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="btn-export"]').length > 0) {
          cy.get('[data-testid="btn-export"]').click();
          
          cy.get('[data-testid="export-options"]')
            .should('be.visible');
          
          // Test different export formats
          cy.get('[data-testid="export-csv"]').click();
          
          // Verify download initiated
          cy.readFile('cypress/downloads/document-types.csv', { timeout: 10000 })
            .should('exist');
        }
      });
    });

    it('should import document types from file', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="btn-import"]').length > 0) {
          cy.get('[data-testid="btn-import"]').click();
          
          cy.get('[data-testid="import-modal"]')
            .should('be.visible');
          
          // Upload CSV file
          cy.get('[data-testid="file-input"]')
            .selectFile('cypress/fixtures/document-types-import.csv');
          
          cy.get('[data-testid="btn-process-import"]').click();
          
          cy.intercept('POST', '/api/document-types/import', { 
            statusCode: 200, 
            body: { imported: 5, errors: [] } 
          }).as('importData');
          
          cy.wait('@importData');
          
          cy.get('[data-testid="import-success"]')
            .should('be.visible')
            .and('contain.text', '5 document types imported');
        }
      });
    });
  });
});
