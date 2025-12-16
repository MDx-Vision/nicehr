describe('Document Types System - Exhaustive Tests', () => {
  const testData = {
    documentType: {
      valid: {
        name: 'Test Certificate',
        description: 'A test certificate for validation',
        required: true,
        expiresIn: 365
      },
      validMinimal: {
        name: 'Minimal Doc Type'
      },
      update: {
        name: 'Updated Certificate',
        description: 'Updated description for test certificate',
        required: false,
        expiresIn: 730
      },
      invalid: {
        emptyName: { name: '' },
        longName: { name: 'A'.repeat(256) },
        negativeExpiry: { name: 'Test', expiresIn: -30 },
        zeroExpiry: { name: 'Test', expiresIn: 0 }
      }
    },
    consultant: {
      id: 'ci-test-consultant'
    },
    ciUser: {
      email: 'test@example.com',
      password: 'test123'
    }
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultantDocuments: (id) => `/api/consultants/${id}/documents`,
    auth: '/api/auth/login',
    user: '/api/auth/user'
  };

  beforeEach(() => {
    // Clear all storage and authenticate
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.request({
      method: 'POST',
      url: apiEndpoints.auth,
      body: {
        email: testData.ciUser.email,
        password: testData.ciUser.password
      }
    });
  });

  describe('Document Types Management - Admin Access', () => {
    beforeEach(() => {
      // Intercept API calls
      cy.intercept('GET', apiEndpoints.documentTypes).as('getDocumentTypes');
      cy.intercept('POST', apiEndpoints.documentTypes).as('createDocumentType');
      cy.intercept('PATCH', '/api/document-types/*').as('updateDocumentType');
      cy.intercept('DELETE', '/api/document-types/*').as('deleteDocumentType');
    });

    describe('Document Types List Page - UI Components & Layout', () => {
      beforeEach(() => {
        cy.visit('/admin/document-types');
        cy.wait('@getDocumentTypes');
      });

      it('should display complete document types page layout', () => {
        // Page header
        cy.get('[data-testid="page-header"]', { timeout: 10000 })
          .should('be.visible')
          .and('contain.text', 'Document Types');
        
        // Add new button
        cy.get('[data-testid="add-document-type-button"]')
          .should('be.visible')
          .and('contain.text', /add|new|create/i);

        // Search functionality
        cy.get('[data-testid="search-input"]')
          .should('be.visible')
          .and('have.attr', 'placeholder');

        // Document types list or empty state
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="document-types-list"]').length > 0) {
            cy.get('[data-testid="document-types-list"]').should('be.visible');
          } else {
            cy.get('[data-testid="empty-state"]')
              .should('be.visible')
              .and('contain.text', /no document types|empty/i);
          }
        });
      });

      it('should display proper table headers and structure', () => {
        cy.get('[data-testid="document-types-table"]').within(() => {
          // Table headers
          cy.get('th').should('contain.text', 'Name');
          cy.get('th').should('contain.text', 'Description');
          cy.get('th').should('contain.text', 'Required');
          cy.get('th').should('contain.text', 'Expires In');
          cy.get('th').should('contain.text', 'Actions');
        });
      });

      it('should handle search functionality', () => {
        const searchTerm = 'certificate';
        
        cy.get('[data-testid="search-input"]')
          .type(searchTerm)
          .should('have.value', searchTerm);

        // Verify search is triggered
        cy.wait(500); // Debounce wait
        
        // Clear search
        cy.get('[data-testid="search-input"]').clear();
        cy.get('[data-testid="search-clear-button"]').click({ force: true });
      });

      it('should handle pagination if present', () => {
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="pagination"]').length > 0) {
            cy.get('[data-testid="pagination"]').within(() => {
              cy.get('[data-testid="pagination-info"]').should('be.visible');
              cy.get('button').should('exist');
            });
          }
        });
      });
    });

    describe('Create Document Type - Form Validation & UI', () => {
      beforeEach(() => {
        cy.visit('/admin/document-types');
        cy.wait('@getDocumentTypes');
        cy.get('[data-testid="add-document-type-button"]').click();
      });

      it('should display complete create form layout', () => {
        // Modal or form container
        cy.get('[data-testid="document-type-form-modal"]', { timeout: 5000 })
          .should('be.visible');

        // Form elements
        cy.get('[data-testid="input-name"]')
          .should('be.visible')
          .and('have.attr', 'required');

        cy.get('[data-testid="input-description"]')
          .should('be.visible');

        cy.get('[data-testid="checkbox-required"]')
          .should('be.visible');

        cy.get('[data-testid="input-expires-in"]')
          .should('be.visible')
          .and('have.attr', 'type', 'number');

        // Action buttons
        cy.get('[data-testid="button-save"]')
          .should('be.visible')
          .and('be.disabled'); // Should be disabled initially

        cy.get('[data-testid="button-cancel"]')
          .should('be.visible')
          .and('not.be.disabled');
      });

      it('should validate required fields', () => {
        // Try to submit empty form
        cy.get('[data-testid="button-save"]').should('be.disabled');

        // Fill only name (minimum required)
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.validMinimal.name);

        cy.get('[data-testid="button-save"]').should('not.be.disabled');

        // Clear name field
        cy.get('[data-testid="input-name"]').clear();
        cy.get('[data-testid="button-save"]').should('be.disabled');
      });

      it('should validate name field constraints', () => {
        // Empty name validation
        cy.get('[data-testid="input-name"]').focus().blur();
        cy.get('[data-testid="error-name"]')
          .should('be.visible')
          .and('contain.text', /required/i);

        // Name too long validation
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.invalid.longName.name);
        cy.get('[data-testid="error-name"]')
          .should('be.visible')
          .and('contain.text', /too long|maximum/i);

        // Valid name
        cy.get('[data-testid="input-name"]').clear()
          .type(testData.documentType.valid.name);
        cy.get('[data-testid="error-name"]').should('not.exist');
      });

      it('should validate expires in field constraints', () => {
        // Fill required name first
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.valid.name);

        // Test negative value
        cy.get('[data-testid="input-expires-in"]')
          .type(testData.documentType.invalid.negativeExpiry.expiresIn);
        cy.get('[data-testid="error-expires-in"]')
          .should('be.visible')
          .and('contain.text', /positive|greater than zero/i);

        // Test zero value
        cy.get('[data-testid="input-expires-in"]').clear()
          .type(testData.documentType.invalid.zeroExpiry.expiresIn);
        cy.get('[data-testid="error-expires-in"]')
          .should('be.visible')
          .and('contain.text', /greater than zero/i);

        // Test valid value
        cy.get('[data-testid="input-expires-in"]').clear()
          .type(testData.documentType.valid.expiresIn);
        cy.get('[data-testid="error-expires-in"]').should('not.exist');
      });

      it('should handle form cancellation', () => {
        // Fill some data
        cy.get('[data-testid="input-name"]')
          .type('Some document type');

        // Cancel form
        cy.get('[data-testid="button-cancel"]').click();

        // Modal should close
        cy.get('[data-testid="document-type-form-modal"]')
          .should('not.exist');
      });
    });

    describe('Create Document Type - Successful Creation', () => {
      beforeEach(() => {
        cy.visit('/admin/document-types');
        cy.wait('@getDocumentTypes');
      });

      it('should successfully create document type with all fields', () => {
        cy.get('[data-testid="add-document-type-button"]').click();

        // Fill complete form
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.valid.name);
        
        cy.get('[data-testid="input-description"]')
          .type(testData.documentType.valid.description);

        cy.get('[data-testid="checkbox-required"]')
          .check({ force: true });

        cy.get('[data-testid="input-expires-in"]')
          .type(testData.documentType.valid.expiresIn);

        // Submit form
        cy.get('[data-testid="button-save"]').click();

        // Wait for API call
        cy.wait('@createDocumentType').then((interception) => {
          expect(interception.request.body).to.deep.include({
            name: testData.documentType.valid.name,
            description: testData.documentType.valid.description,
            required: true,
            expiresIn: testData.documentType.valid.expiresIn
          });
        });

        // Verify success message
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', /created|success/i);

        // Modal should close
        cy.get('[data-testid="document-type-form-modal"]')
          .should('not.exist');

        // List should refresh
        cy.wait('@getDocumentTypes');
      });

      it('should successfully create document type with minimal data', () => {
        cy.get('[data-testid="add-document-type-button"]').click();

        // Fill only required fields
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.validMinimal.name);

        // Submit form
        cy.get('[data-testid="button-save"]').click();

        // Wait for API call
        cy.wait('@createDocumentType').then((interception) => {
          expect(interception.request.body).to.deep.include({
            name: testData.documentType.validMinimal.name
          });
        });

        // Verify success
        cy.get('[data-testid="success-message"]')
          .should('be.visible');
      });
    });

    describe('Create Document Type - Error Handling', () => {
      beforeEach(() => {
        cy.visit('/admin/document-types');
        cy.wait('@getDocumentTypes');
      });

      it('should handle API errors gracefully', () => {
        // Mock API error
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 400,
          body: { error: 'Document type name already exists' }
        }).as('createDocumentTypeError');

        cy.get('[data-testid="add-document-type-button"]').click();

        // Fill form
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.valid.name);

        // Submit form
        cy.get('[data-testid="button-save"]').click();

        // Wait for error response
        cy.wait('@createDocumentTypeError');

        // Verify error message
        cy.get('[data-testid="error-message"]')
          .should('be.visible')
          .and('contain.text', /already exists|error/i);

        // Form should remain open
        cy.get('[data-testid="document-type-form-modal"]')
          .should('be.visible');
      });

      it('should handle network errors', () => {
        // Mock network error
        cy.intercept('POST', apiEndpoints.documentTypes, {
          forceNetworkError: true
        }).as('networkError');

        cy.get('[data-testid="add-document-type-button"]').click();

        // Fill form
        cy.get('[data-testid="input-name"]')
          .type(testData.documentType.valid.name);

        // Submit form
        cy.get('[data-testid="button-save"]').click();

        // Verify error handling
        cy.get('[data-testid="error-message"]')
          .should('be.visible')
          .and('contain.text', /network|connection/i);
      });
    });

    describe('Edit Document Type Functionality', () => {
      let documentTypeId;

      beforeEach(() => {
        // Create a document type first
        cy.request({
          method: 'POST',
          url: apiEndpoints.documentTypes,
          body: testData.documentType.valid
        }).then((response) => {
          documentTypeId = response.body.id;
        });

        cy.visit('/admin/document-types');
        cy.wait('@getDocumentTypes');
      });

      afterEach(() => {
        // Cleanup created document type
        if (documentTypeId) {
          cy.request({
            method: 'DELETE',
            url: `${apiEndpoints.documentTypes}/${documentTypeId}`,
            failOnStatusCode: false
          });
        }
      });

      it('should open edit form with pre-filled data', () => {
        cy.get(`[data-testid="edit-document-type-${documentTypeId}"]`)
          .click();

        // Verify form is pre-filled
        cy.get('[data-testid="input-name"]')
          .should('have.value', testData.documentType.valid.name);

        cy.get('[data-testid="input-description"]')
          .should('have.value', testData.documentType.valid.description);

        cy.get('[data-testid="checkbox-required"]')
          .should('be.checked');

        cy.get('[data-testid="input-expires-in"]')
          .should('have.value', testData.documentType.valid.expiresIn.toString());
      });

      it('should successfully update document type', () => {
        cy.get(`[data-testid="edit-document-type-${documentTypeId}"]`)
          .click();

        // Update fields
        cy.get('[data-testid="input-name"]').clear()
          .type(testData.documentType.update.name);

        cy.get('[data-testid="input-description"]').clear()
          .type(testData.documentType.update.description);

        cy.get('[data-testid="checkbox-required"]')
          .uncheck({ force: true });

        cy.get('[data-testid="input-expires-in"]').clear()
          .type(testData.documentType.update.expiresIn);

        // Submit update
        cy.get('[data-testid="button-save"]').click();

        // Wait for API call
        cy.wait('@updateDocumentType').then((interception) => {
          expect(interception.request.body).to.deep.include({
            name: testData.documentType.update.name,
            description: testData.documentType.update.description,
            required: false,
            expiresIn: testData.documentType.update.expiresIn
          });
        });

        // Verify success
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', /updated|success/i);
      });

      it('should validate edit form properly', () => {
        cy.get(`[data-testid="edit-document-type-${documentTypeId}"]`)
          .click();

        // Clear required name field
        cy.get('[data-testid="input-name"]').clear();
        cy.get('[data-testid="button-save"]').should('be.disabled');

        // Add invalid expires in
        cy.get('[data-testid="input-name"]')
          .type('Valid Name');
        cy.get('[data-testid="input-expires-in"]').clear()
          .type('-10');

        cy.get('[data-testid="error-expires-in"]')
          .should('be.visible');
        cy.get('[data-testid="button-save"]').should('be.disabled');
      });
    });

    describe('Delete Document Type Functionality', () => {
      let documentTypeId;

      beforeEach(() => {
        // Create a document type first
        cy.request({
          method: 'POST',
          url: apiEndpoints.documentTypes,
          body: {
            name: 'Document to Delete',
            description: 'This will be deleted'
          }
        }).then((response) => {
          documentTypeId = response.body.id;
        });

        cy.visit('/admin/document-types');
        cy.wait('@getDocumentTypes');
      });

      it('should show confirmation dialog before deletion', () => {
        cy.get(`[data-testid="delete-document-type-${documentTypeId}"]`)
          .click();

        // Verify confirmation dialog
        cy.get('[data-testid="delete-confirmation-dialog"]')
          .should('be.visible');

        cy.get('[data-testid="delete-confirmation-message"]')
          .should('contain.text', /are you sure|delete|permanent/i);

        cy.get('[data-testid="button-confirm-delete"]')
          .should('be.visible')
          .and('contain.text', /delete|confirm/i);

        cy.get('[data-testid="button-cancel-delete"]')
          .should('be.visible')
          .and('contain.text', /cancel/i);
      });

      it('should cancel deletion when cancel is clicked', () => {
        cy.get(`[data-testid="delete-document-type-${documentTypeId}"]`)
          .click();

        cy.get('[data-testid="button-cancel-delete"]').click();

        // Dialog should close
        cy.get('[data-testid="delete-confirmation-dialog"]')
          .should('not.exist');

        // Document type should still exist
        cy.get(`[data-testid="document-type-row-${documentTypeId}"]`)
          .should('exist');
      });

      it('should successfully delete document type', () => {
        cy.get(`[data-testid="delete-document-type-${documentTypeId}"]`)
          .click();

        cy.get('[data-testid="button-confirm-delete"]').click();

        // Wait for API call
        cy.wait('@deleteDocumentType');

        // Verify success message
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', /deleted|success/i);

        // Document type should be removed from list
        cy.get(`[data-testid="document-type-row-${documentTypeId}"]`)
          .should('not.exist');
      });

      it('should handle delete errors gracefully', () => {
        // Mock delete error
        cy.intercept('DELETE', `/api/document-types/${documentTypeId}`, {
          statusCode: 400,
          body: { error: 'Cannot delete document type with associated documents' }
        }).as('deleteDocumentTypeError');

        cy.get(`[data-testid="delete-document-type-${documentTypeId}"]`)
          .click();

        cy.get('[data-testid="button-confirm-delete"]').click();

        cy.wait('@deleteDocumentTypeError');

        // Verify error message
        cy.get('[data-testid="error-message"]')
          .should('be.visible')
          .and('contain.text', /cannot delete|associated/i);

        // Document type should still exist
        cy.get(`[data-testid="document-type-row-${documentTypeId}"]`)
          .should('exist');
      });
    });
  });

  describe('Document Types - Consultant Document Usage', () => {
    let documentTypeId;

    beforeEach(() => {
      // Create a document type for testing
      cy.request({
        method: 'POST',
        url: apiEndpoints.documentTypes,
        body: {
          name: 'Test Certification',
          description: 'Required certification for consultants',
          required: true,
          expiresIn: 365
        }
      }).then((response) => {
        documentTypeId = response.body.id;
      });

      // Intercept consultant documents API
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id))
        .as('getConsultantDocuments');
      cy.intercept('POST', apiEndpoints.consultantDocuments(testData.consultant.id))
        .as('uploadDocument');
    });

    afterEach(() => {
      // Cleanup
      if (documentTypeId) {
        cy.request({
          method: 'DELETE',
          url: `${apiEndpoints.documentTypes}/${documentTypeId}`,
          failOnStatusCode: false
        });
      }
    });

    it('should display document types in consultant document upload', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');

      // Check if add document button/form exists
      cy.get('[data-testid="add-document-button"]').click();

      // Document type should be available in dropdown
      cy.get('[data-testid="document-type-select"]').click();
      cy.get('[data-testid="document-type-option"]')
        .should('contain.text', 'Test Certification');
    });

    it('should show required indicator for required document types', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');

      // Should show required documents section
      cy.get('[data-testid="required-documents"]')
        .should('be.visible')
        .and('contain.text', 'Test Certification');

      // Required indicator should be visible
      cy.get('[data-testid="required-indicator"]')
        .should('be.visible');
    });

    it('should validate document expiry based on document type settings', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');

      cy.get('[data-testid="add-document-button"]').click();

      // Select document type
      cy.get('[data-testid="document-type-select"]').click();
      cy.get('[data-testid="document-type-option"]')
        .contains('Test Certification').click();

      // Expiry field should be pre-calculated based on document type
      cy.get('[data-testid="expiry-date"]')
        .should('be.visible')
        .and('not.be.empty');
    });
  });

  describe('Document Types - API Integration Tests', () => {
    it('should handle GET /api/document-types endpoint', () => {
      cy.request({
        method: 'GET',
        url: apiEndpoints.documentTypes
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('id');
          expect(response.body[0]).to.have.property('name');
        }
      });
    });

    it('should handle POST /api/document-types endpoint validation', () => {
      // Test invalid data
      cy.request({
        method: 'POST',
        url: apiEndpoints.documentTypes,
        body: { name: '' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });

      // Test valid data
      cy.request({
        method: 'POST',
        url: apiEndpoints.documentTypes,
        body: {
          name: 'API Test Document Type',
          description: 'Created via API test'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq('API Test Document Type');

        // Cleanup
        cy.request({
          method: 'DELETE',
          url: `${apiEndpoints.documentTypes}/${response.body.id}`,
          failOnStatusCode: false
        });
      });
    });
  });

  describe('Document Types - Responsive Design & Accessibility', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Page should still be functional
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="add-document-type-button"]').should('be.visible');

      // Table should be responsive or have horizontal scroll
      cy.get('[data-testid="document-types-table"]').should('be.visible');
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // All elements should be visible and accessible
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="add-document-type-button"]').should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');

      // Continue tabbing through interactive elements
      cy.focused().tab();
      cy.focused().should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="search-input"]')
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="add-document-type-button"]')
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="document-types-table"]')
        .should('have.attr', 'role', 'table');
    });
  });

  describe('Document Types - Performance & Loading States', () => {
    it('should show loading state while fetching document types', () => {
      // Intercept with delay to test loading state
      cy.intercept('GET', apiEndpoints.documentTypes, {
        delay: 2000,
        body: []
      }).as('slowGetDocumentTypes');

      cy.visit('/admin/document-types');

      // Should show loading indicator
      cy.get('[data-testid="loading-spinner"]', { timeout: 1000 })
        .should('be.visible');

      cy.wait('@slowGetDocumentTypes');

      // Loading should disappear
      cy.get('[data-testid="loading-spinner"]')
        .should('not.exist');
    });

    it('should show loading state during form submission', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        delay: 2000,
        statusCode: 201,
        body: { id: 'test-id', name: 'Test Document Type' }
      }).as('slowCreateDocumentType');

      cy.visit('/admin/document-types');
      cy.get('[data-testid="add-document-type-button"]').click();

      // Fill form
      cy.get('[data-testid="input-name"]')
        .type('Test Document Type');

      // Submit form
      cy.get('[data-testid="button-save"]').click();

      // Should show loading state
      cy.get('[data-testid="button-save"]')
        .should('be.disabled')
        .and('contain.text', /saving|loading/i);

      cy.wait('@slowCreateDocumentType');
    });

    it('should handle empty states properly', () => {
      // Mock empty response
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: []
      }).as('getEmptyDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getEmptyDocumentTypes');

      // Should show empty state
      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', /no document types|empty/i);

      // Should show call-to-action
      cy.get('[data-testid="empty-state-action"]')
        .should('be.visible')
        .and('contain.text', /add|create/i);
    });
  });

  describe('Document Types - Edge Cases & Error Scenarios', () => {
    it('should handle concurrent modifications', () => {
      let documentTypeId;

      // Create document type
      cy.request({
        method: 'POST',
        url: apiEndpoints.documentTypes,
        body: { name: 'Concurrent Test Doc' }
      }).then((response) => {
        documentTypeId = response.body.id;
      });

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');

      // Start editing
      cy.get(`[data-testid="edit-document-type-${documentTypeId}"]`)
        .click();

      // Simulate concurrent modification (delete the document type)
      cy.request({
        method: 'DELETE',
        url: `${apiEndpoints.documentTypes}/${documentTypeId}`,
        failOnStatusCode: false
      });

      // Try to save changes
      cy.get('[data-testid="input-name"]').clear().type('Modified Name');
      cy.get('[data-testid="button-save"]').click();

      // Should handle the error gracefully
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /not found|no longer exists/i);
    });

    it('should handle special characters in document type names', () => {
      const specialCharName = 'Test & Spécial Çhars 123!@#';

      cy.visit('/admin/document-types');
      cy.get('[data-testid="add-document-type-button"]').click();

      cy.get('[data-testid="input-name"]').type(specialCharName);
      cy.get('[data-testid="button-save"]').click();

      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body.name).to.eq(specialCharName);
      });

      // Verify it displays correctly in the list
      cy.get('[data-testid="document-types-table"]')
        .should('contain.text', specialCharName);
    });

    it('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(1000);

      cy.visit('/admin/document-types');
      cy.get('[data-testid="add-document-type-button"]').click();

      cy.get('[data-testid="input-name"]').type('Long Description Test');
      cy.get('[data-testid="input-description"]').type(longDescription);

      cy.get('[data-testid="button-save"]').click();

      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body.description).to.have.length.greaterThan(500);
      });
    });

    it('should handle browser refresh during form editing', () => {
      cy.visit('/admin/document-types');
      cy.get('[data-testid="add-document-type-button"]').click();

      // Fill some data
      cy.get('[data-testid="input-name"]').type('Unsaved Document Type');
      cy.get('[data-testid="input-description"]').type('This will be lost');

      // Refresh page
      cy.reload();

      // Form should be closed and data should be lost
      cy.get('[data-testid="document-type-form-modal"]')
        .should('not.exist');
    });
  });
});
