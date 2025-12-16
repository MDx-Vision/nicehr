describe('Document Types System - Exhaustive Tests', () => {
  const testData = {
    documentType: {
      valid: {
        name: 'Test Certificate',
        description: 'A test certification document',
        required: true,
        category: 'certification'
      },
      update: {
        name: 'Updated Certificate',
        description: 'An updated test certification document',
        required: false,
        category: 'license'
      },
      invalid: {
        emptyName: {
          name: '',
          description: 'Test description'
        },
        longName: {
          name: 'A'.repeat(256),
          description: 'Test description'
        },
        longDescription: {
          name: 'Test Name',
          description: 'A'.repeat(1001)
        },
        specialChars: {
          name: '<script>alert("test")</script>',
          description: 'Test description with <script>tags</script>'
        }
      }
    },
    consultant: {
      id: 'ci-test-consultant'
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultantDocuments: `/api/consultants/${testData.consultant.id}/documents`,
    upload: '/api/objects/upload'
  };

  beforeEach(() => {
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('test123');
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('include', '/dashboard');
  });

  describe('Document Types Management Page - Navigation & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display complete document types management layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1, h2').should('contain.text', /document types/i);
      
      // Add button
      cy.get('[data-testid="button-add-document-type"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled');
      
      // Data table
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      cy.get('[data-testid="table-header"]').should('be.visible');
      
      // Table columns
      cy.get('thead th').should('contain.text', 'Name');
      cy.get('thead th').should('contain.text', 'Description');
      cy.get('thead th').should('contain.text', 'Required');
      cy.get('thead th').should('contain.text', 'Actions');
    });

    it('should have proper accessibility features', () => {
      // ARIA labels
      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table');
      
      cy.get('[data-testid="button-add-document-type"]')
        .should('have.attr', 'aria-label')
        .or('have.text');
      
      // Focus management
      cy.get('[data-testid="button-add-document-type"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'button-add-document-type');
    });

    it('should handle search functionality if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          cy.get('[data-testid="search-document-types"]')
            .should('be.visible')
            .type('certification');
          
          // Should filter results
          cy.get('[data-testid="document-types-table"] tbody tr')
            .should('have.length.lessThan', 10);
          
          // Clear search
          cy.get('[data-testid="search-document-types"]').clear();
        }
      });
    });

    it('should handle pagination if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
          
          // Test pagination controls
          cy.get('[data-testid="pagination-next"]').should('be.visible');
          cy.get('[data-testid="pagination-prev"]').should('be.visible');
          
          // Test page size selector if present
          if ($body.find('[data-testid="page-size-selector"]').length > 0) {
            cy.get('[data-testid="page-size-selector"]').click();
            cy.get('[role="option"]').first().click();
          }
        }
      });
    });
  });

  describe('Create Document Type - Form Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      cy.get('[data-testid="button-add-document-type"]').click();
    });

    it('should display create document type form with all fields', () => {
      // Modal or form should be visible
      cy.get('[data-testid="document-type-form"]', { timeout: 10000 })
        .should('be.visible');
      
      // Form fields
      cy.get('[data-testid="input-name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      
      cy.get('[data-testid="input-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="checkbox-required"]')
        .should('be.visible');
      
      // Form buttons
      cy.get('[data-testid="button-save"]')
        .should('be.visible')
        .and('be.disabled'); // Initially disabled
      
      cy.get('[data-testid="button-cancel"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should validate required name field', () => {
      // Try to submit without name
      cy.get('[data-testid="input-description"]').type('Test description');
      cy.get('[data-testid="button-save"]').should('be.disabled');
      
      // Check for validation message
      cy.get('[data-testid="input-name"]').focus().blur();
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required|name/i);
    });

    it('should validate name field length limits', () => {
      // Test maximum length
      const longName = 'A'.repeat(256);
      cy.get('[data-testid="input-name"]').type(longName);
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /length|characters|long/i);
      
      // Clear and test valid length
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="input-name"]').type(testData.documentType.valid.name);
      cy.get('[data-testid="error-name"]').should('not.exist');
    });

    it('should validate description field if length limit exists', () => {
      cy.get('[data-testid="input-name"]').type(testData.documentType.valid.name);
      
      const longDescription = 'A'.repeat(1001);
      cy.get('[data-testid="input-description"]').type(longDescription);
      
      // Check for description validation
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-description"]').length > 0) {
          cy.get('[data-testid="error-description"]')
            .should('contain.text', /length|characters/i);
        }
      });
    });

    it('should handle XSS prevention in form fields', () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      cy.get('[data-testid="input-name"]').type(xssPayload);
      cy.get('[data-testid="input-description"]').type(xssPayload);
      
      // Values should be escaped or sanitized
      cy.get('[data-testid="input-name"]').should('not.contain', '<script>');
      cy.get('[data-testid="input-description"]').should('not.contain', '<script>');
    });

    it('should handle form cancellation', () => {
      cy.get('[data-testid="input-name"]').type('Test Name');
      cy.get('[data-testid="button-cancel"]').click();
      
      // Form should close
      cy.get('[data-testid="document-type-form"]').should('not.exist');
    });

    it('should handle escape key to close form', () => {
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="document-type-form"]').should('not.exist');
    });
  });

  describe('Create Document Type - Success Flow', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: 'new-doc-type', ...testData.documentType.valid }
      }).as('createDocumentType');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      cy.get('[data-testid="button-add-document-type"]').click();
    });

    it('should successfully create a new document type', () => {
      // Fill in form
      cy.get('[data-testid="input-name"]').type(testData.documentType.valid.name);
      cy.get('[data-testid="input-description"]').type(testData.documentType.valid.description);
      
      if (testData.documentType.valid.required) {
        cy.get('[data-testid="checkbox-required"]').check();
      }
      
      // Submit form
      cy.get('[data-testid="button-save"]').should('not.be.disabled').click();
      
      // Verify API call
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body).to.include({
          name: testData.documentType.valid.name,
          description: testData.documentType.valid.description
        });
      });
      
      // Success feedback
      cy.get('[data-testid="success-message"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', /created|success/i);
      
      // Form should close
      cy.get('[data-testid="document-type-form"]').should('not.exist');
    });

    it('should handle category selection if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-category"]').length > 0) {
          cy.get('[data-testid="input-name"]').type(testData.documentType.valid.name);
          cy.get('[data-testid="select-category"]').click();
          cy.get('[role="option"]').contains('Certification').click();
          
          cy.get('[data-testid="button-save"]').click();
          
          cy.wait('@createDocumentType').then((interception) => {
            expect(interception.request.body.category).to.exist;
          });
        }
      });
    });
  });

  describe('Create Document Type - Error Handling', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      cy.get('[data-testid="button-add-document-type"]').click();
    });

    it('should handle server validation errors', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { 
          error: 'Document type name already exists',
          details: { name: 'Name must be unique' }
        }
      }).as('createDocumentTypeError');
      
      cy.get('[data-testid="input-name"]').type('Existing Name');
      cy.get('[data-testid="input-description"]').type('Test description');
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@createDocumentTypeError');
      
      // Error message should be displayed
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /already exists|unique/i);
      
      // Form should remain open
      cy.get('[data-testid="document-type-form"]').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, { forceNetworkError: true }).as('networkError');
      
      cy.get('[data-testid="input-name"]').type(testData.documentType.valid.name);
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@networkError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /network|connection|error/i);
    });

    it('should handle 500 server errors', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.get('[data-testid="input-name"]').type(testData.documentType.valid.name);
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@serverError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /server error|unexpected error/i);
    });
  });

  describe('Edit Document Type - Form Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          { id: 'edit-test', name: 'Edit Test', description: 'Test description', required: true }
        ]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open edit form with pre-filled data', () => {
      cy.get('[data-testid="button-edit-edit-test"]').click();
      
      // Form should open with existing data
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      cy.get('[data-testid="input-name"]').should('have.value', 'Edit Test');
      cy.get('[data-testid="input-description"]').should('have.value', 'Test description');
      cy.get('[data-testid="checkbox-required"]').should('be.checked');
    });

    it('should successfully update document type', () => {
      cy.intercept('PATCH', '/api/document-types/edit-test', {
        statusCode: 200,
        body: { id: 'edit-test', ...testData.documentType.update }
      }).as('updateDocumentType');
      
      cy.get('[data-testid="button-edit-edit-test"]').click();
      
      // Update form data
      cy.get('[data-testid="input-name"]').clear().type(testData.documentType.update.name);
      cy.get('[data-testid="input-description"]').clear().type(testData.documentType.update.description);
      cy.get('[data-testid="checkbox-required"]').uncheck();
      
      cy.get('[data-testid="button-save"]').click();
      
      cy.wait('@updateDocumentType');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|success/i);
    });

    it('should validate edit form fields', () => {
      cy.get('[data-testid="button-edit-edit-test"]').click();
      
      // Clear required field
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-save"]').should('be.disabled');
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });
  });

  describe('Delete Document Type - Confirmation & Safety', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          { 
            id: 'delete-test', 
            name: 'Delete Test', 
            description: 'Test description', 
            required: false,
            _count: { consultantDocuments: 0 }
          }
        ]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show confirmation dialog before deletion', () => {
      cy.get('[data-testid="button-delete-delete-test"]').click();
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation"]')
        .should('contain.text', /delete|remove/i)
        .and('contain.text', 'Delete Test');
      
      // Dialog buttons
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
    });

    it('should cancel deletion when cancel button clicked', () => {
      cy.get('[data-testid="button-delete-delete-test"]').click();
      cy.get('[data-testid="button-cancel-delete"]').click();
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation"]').should('not.exist');
      
      // Document type should still exist
      cy.get('[data-testid="button-delete-delete-test"]').should('be.visible');
    });

    it('should successfully delete document type', () => {
      cy.intercept('DELETE', '/api/document-types/delete-test', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocumentType');
      
      cy.get('[data-testid="button-delete-delete-test"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteDocumentType');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);
    });

    it('should prevent deletion if document type is in use', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          { 
            id: 'in-use-test', 
            name: 'In Use Test', 
            description: 'Test description', 
            required: false,
            _count: { consultantDocuments: 5 }
          }
        ]
      }).as('getDocumentTypesInUse');
      
      cy.reload();
      cy.wait('@getDocumentTypesInUse');
      
      cy.get('[data-testid="button-delete-in-use-test"]').should('be.disabled');
      
      // Or show warning if deletion is allowed
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-delete-in-use-test"]:not([disabled])').length > 0) {
          cy.get('[data-testid="button-delete-in-use-test"]').click();
          cy.get('[data-testid="delete-confirmation"]')
            .should('contain.text', /in use|documents|warning/i);
        }
      });
    });

    it('should handle delete errors gracefully', () => {
      cy.intercept('DELETE', '/api/document-types/delete-test', {
        statusCode: 409,
        body: { error: 'Cannot delete document type that is in use' }
      }).as('deleteError');
      
      cy.get('[data-testid="button-delete-delete-test"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteError');
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /cannot delete|in use/i);
    });
  });

  describe('Document Types List - Data Display & Sorting', () => {
    const mockDocumentTypes = [
      { id: 'cert1', name: 'Basic Certification', description: 'Basic cert', required: true, createdAt: '2024-01-01' },
      { id: 'cert2', name: 'Advanced Certification', description: 'Advanced cert', required: false, createdAt: '2024-01-02' },
      { id: 'license1', name: 'Medical License', description: 'Medical license', required: true, createdAt: '2024-01-03' }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: mockDocumentTypes }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types data correctly', () => {
      // Check table data
      cy.get('[data-testid="document-types-table"] tbody tr').should('have.length', 3);
      
      // Check first row data
      cy.get('[data-testid="row-cert1"]').within(() => {
        cy.get('[data-testid="cell-name"]').should('contain.text', 'Basic Certification');
        cy.get('[data-testid="cell-description"]').should('contain.text', 'Basic cert');
        cy.get('[data-testid="cell-required"]').should('contain.text', /yes|true|required/i);
      });
      
      // Check action buttons
      cy.get('[data-testid="button-edit-cert1"]').should('be.visible');
      cy.get('[data-testid="button-delete-cert1"]').should('be.visible');
    });

    it('should handle column sorting if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="sort-name"]').length > 0) {
          // Test name sorting
          cy.get('[data-testid="sort-name"]').click();
          
          // Check if sorted (Advanced should come before Basic)
          cy.get('[data-testid="document-types-table"] tbody tr')
            .first()
            .should('contain.text', 'Advanced Certification');
          
          // Click again for reverse sort
          cy.get('[data-testid="sort-name"]').click();
          cy.get('[data-testid="document-types-table"] tbody tr')
            .first()
            .should('contain.text', 'Medical License');
        }
      });
    });

    it('should handle required status display correctly', () => {
      cy.get('[data-testid="row-cert1"] [data-testid="cell-required"]')
        .should('contain.text', /yes|true|required/i);
      
      cy.get('[data-testid="row-cert2"] [data-testid="cell-required"]')
        .should('contain.text', /no|false|optional/i);
    });
  });

  describe('Empty States & Error States', () => {
    it('should display empty state when no document types exist', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getEmptyDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getEmptyDocumentTypes');
      
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', /no document types|empty/i);
      
      cy.get('[data-testid="button-add-first-document-type"]', { timeout: 5000 })
        .should('be.visible');
    });

    it('should handle loading state', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        delay: 2000,
        body: []
      }).as('getDocumentTypesDelay');
      
      cy.visit('/admin/document-types');
      
      // Should show loading state
      cy.get('[data-testid="loading-spinner"]', { timeout: 1000 })
        .should('be.visible');
      
      cy.wait('@getDocumentTypesDelay');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle API error state', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getDocumentTypesError');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypesError');
      
      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
      
      // Retry button if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-retry"]').length > 0) {
          cy.get('[data-testid="button-retry"]').should('be.visible');
        }
      });
    });
  });

  describe('Integration with Consultant Documents', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          { id: 'req-cert', name: 'Required Certificate', required: true },
          { id: 'opt-cert', name: 'Optional Certificate', required: false }
        ]
      }).as('getDocumentTypes');
    });

    it('should show document types in consultant document upload', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments, { body: [] }).as('getConsultantDocs');
      cy.intercept('POST', '/api/objects/upload', { body: { url: 'test-url' } }).as('uploadFile');
      
      cy.visit('/consultants/ci-test-consultant/documents');
      cy.wait('@getDocumentTypes');
      cy.wait('@getConsultantDocs');
      
      // Check if document types are available in upload form
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-upload-document"]').length > 0) {
          cy.get('[data-testid="button-upload-document"]').click();
          
          cy.get('[data-testid="select-document-type"]').should('be.visible');
          cy.get('[data-testid="select-document-type"]').click();
          
          cy.get('[role="option"]').should('contain.text', 'Required Certificate');
          cy.get('[role="option"]').should('contain.text', 'Optional Certificate');
        }
      });
    });

    it('should indicate required vs optional document types', () => {
      cy.visit('/consultants/ci-test-consultant');
      
      cy.get('body').then(($body) => {
        // Look for document type requirements display
        if ($body.find('[data-testid="document-requirements"]').length > 0) {
          cy.get('[data-testid="document-requirements"]').within(() => {
            cy.get('[data-testid="required-documents"]')
              .should('contain.text', 'Required Certificate');
          });
        }
      });
    });
  });

  describe('Responsive Design & Mobile Behavior', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          { id: 'mobile-test', name: 'Mobile Test Doc', description: 'Test', required: true }
        ]
      }).as('getDocumentTypes');
    });

    it('should be responsive on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Table should be scrollable or columns should stack
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      
      // Add button should remain accessible
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');
    });

    it('should be responsive on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Content should be accessible
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      
      // Actions might be in dropdown or modified layout
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="mobile-actions-menu"]').length > 0) {
          cy.get('[data-testid="mobile-actions-menu"]').should('be.visible');
        } else {
          cy.get('[data-testid="button-edit-mobile-test"]').should('be.visible');
        }
      });
    });

    it('should handle modal forms on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Form should be fullscreen or properly sized for mobile
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      cy.get('[data-testid="input-name"]').should('be.visible');
      
      // Form should be usable
      cy.get('[data-testid="input-name"]').type('Mobile Test');
      cy.get('[data-testid="input-name"]').should('have.value', 'Mobile Test');
    });
  });

  describe('Performance & Optimization', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-type-${i}`,
        name: `Document Type ${i}`,
        description: `Description for document type ${i}`,
        required: i % 2 === 0
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, { body: largeDataset }).as('getLargeDataset');
      
      cy.visit('/admin/document-types');
      cy.wait('@getLargeDataset');
      
      // Should load within reasonable time
      cy.get('[data-testid="document-types-table"]', { timeout: 10000 }).should('be.visible');
      
      // Pagination should be present for large datasets
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
        }
      });
    });

    it('should debounce search input if search is available', () => {
      cy.intercept('GET', `${apiEndpoints.documentTypes}*`, { body: [] }).as('searchDocumentTypes');
      
      cy.visit('/admin/document-types');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          // Type quickly
          cy.get('[data-testid="search-document-types"]').type('test');
          
          // Should not make immediate API calls
          cy.get('@searchDocumentTypes.all').should('have.length', 1);
        }
      });
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { 
        body: [
          { id: 'a11y-test', name: 'Accessibility Test', description: 'Test', required: true }
        ]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should support keyboard navigation', () => {
      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Should be able to reach add button
      cy.get('[data-testid="button-add-document-type"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'button-add-document-type');
      
      // Enter key should trigger action
      cy.focused().type('{enter}');
      cy.get('[data-testid="document-type-form"]').should('be.visible');
    });

    it('should support screen readers with proper ARIA labels', () => {
      // Check table accessibility
      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table')
        .or('have.attr', 'aria-label');
      
      // Check button accessibility
      cy.get('[data-testid="button-add-document-type"]')
        .should('have.attr', 'aria-label')
        .or('contain.text');
      
      // Check form accessibility
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
    });

    it('should announce form errors to screen readers', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Trigger validation error
      cy.get('[data-testid="input-name"]').focus().blur();
      
      cy.get('[data-testid="error-name"]')
        .should('have.attr', 'aria-live')
        .or('have.attr', 'role', 'alert');
    });

    it('should manage focus properly in modals', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Focus should be trapped in modal
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      cy.get('[data-testid="input-name"]').should('be.focused');
      
      // Escape should close modal and return focus
      cy.get('body').type('{esc}');
      cy.get('[data-testid="document-type-form"]').should('not.exist');
      cy.get('[data-testid="button-add-document-type"]').should('be.focused');
    });
  });
});
