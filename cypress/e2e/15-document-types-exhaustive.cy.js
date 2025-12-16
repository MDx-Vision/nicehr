describe('Document Types - Exhaustive Tests', () => {
  const testData = {
    validDocumentType: {
      name: 'Test Document Type',
      description: 'This is a test document type for E2E testing',
      isRequired: true,
      category: 'Certification'
    },
    updateDocumentType: {
      name: 'Updated Document Type',
      description: 'This is an updated document type description',
      isRequired: false,
      category: 'License'
    },
    invalidDocumentType: {
      name: '', // Empty name
      description: 'A' * 1001, // Too long description
      isRequired: null,
      category: ''
    },
    specialCharacters: {
      name: 'Test-Doc_Type #1 (Special)',
      description: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      isRequired: true,
      category: 'Other'
    },
    duplicateName: 'Duplicate Document Type',
    longName: 'A'.repeat(255),
    maxDescriptionLength: 'A'.repeat(1000)
  };

  const apiEndpoints = {
    documentTypes: '/api/document-types',
    consultantDocuments: '/api/consultants/*/documents'
  };

  const ciTestData = {
    user: { email: 'test@example.com', password: 'test123' },
    consultant: 'ci-test-consultant'
  };

  beforeEach(() => {
    // Clear all storage
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]', { timeout: 10000 })
      .type(ciTestData.user.email);
    cy.get('[data-testid="input-password"]')
      .type(ciTestData.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for login to complete
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Document Types List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
    });

    it('should display complete document types page layout', () => {
      cy.wait('@getDocumentTypes');
      
      // Main container
      cy.get('[data-testid="document-types-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /document types/i);
      
      // Create button
      cy.get('[data-testid="create-document-type-button"]')
        .should('be.visible')
        .and('contain.text', /create|add|new/i);
      
      // Search functionality
      cy.get('[data-testid="search-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
      
      // Document types table/list
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('be.visible');
      
      // Table headers
      cy.get('th').should('contain.text', /name/i);
      cy.get('th').should('contain.text', /description/i);
      cy.get('th').should('contain.text', /required/i);
      cy.get('th').should('contain.text', /category/i);
      cy.get('th').should('contain.text', /actions/i);
    });

    it('should display proper table structure and accessibility', () => {
      cy.wait('@getDocumentTypes');
      
      // Table accessibility
      cy.get('table')
        .should('have.attr', 'role', 'table')
        .or('have.attr', 'aria-label');
      
      // Table headers
      cy.get('thead').should('exist');
      cy.get('tbody').should('exist');
      
      // Action buttons for each row
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="edit-button"], [aria-label*="edit"], button').contains(/edit/i)
          .should('be.visible');
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i)
          .should('be.visible');
      });
    });

    it('should handle empty state correctly', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getEmptyDocumentTypes');
      cy.reload();
      cy.wait('@getEmptyDocumentTypes');
      
      cy.get('[data-testid="empty-state"], .empty-state')
        .should('be.visible')
        .and('contain.text', /no document types/i);
      
      cy.get('[data-testid="create-document-type-button"]')
        .should('be.visible');
    });

    it('should display loading state', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { delay: 2000, fixture: 'document-types.json' }).as('getSlowDocumentTypes');
      cy.reload();
      
      // Loading indicator should be visible
      cy.get('[data-testid="loading"], .loading, .spinner')
        .should('be.visible');
      
      cy.wait('@getSlowDocumentTypes');
      
      // Loading should disappear
      cy.get('[data-testid="loading"], .loading, .spinner')
        .should('not.exist');
    });
  });

  describe('Document Types Search & Filtering', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should filter document types by search term', () => {
      const searchTerm = 'License';
      
      cy.get('[data-testid="search-input"]')
        .type(searchTerm);
      
      // Wait for search results
      cy.wait(1000);
      
      // Verify filtered results
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).should('contain.text', new RegExp(searchTerm, 'i'));
      });
    });

    it('should handle search with no results', () => {
      cy.get('[data-testid="search-input"]')
        .type('NonExistentDocumentType12345');
      
      cy.wait(1000);
      
      cy.get('[data-testid="no-results"], .no-results')
        .should('be.visible')
        .and('contain.text', /no results/i);
    });

    it('should clear search results', () => {
      // Search first
      cy.get('[data-testid="search-input"]')
        .type('License');
      
      cy.wait(1000);
      
      // Clear search
      cy.get('[data-testid="search-input"]')
        .clear();
      
      cy.wait(1000);
      
      // Should show all results again
      cy.get('tbody tr').should('have.length.greaterThan', 0);
    });

    it('should filter by category if category filter exists', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="category-filter"]').length > 0) {
          cy.get('[data-testid="category-filter"]')
            .select('Certification');
          
          cy.wait(1000);
          
          cy.get('tbody tr').each(($row) => {
            cy.wrap($row).should('contain.text', /certification/i);
          });
        }
      });
    });

    it('should filter by required status if filter exists', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="required-filter"]').length > 0) {
          cy.get('[data-testid="required-filter"]')
            .select('Required Only');
          
          cy.wait(1000);
          
          cy.get('tbody tr').each(($row) => {
            cy.wrap($row).should('contain.text', /required|yes/i);
          });
        }
      });
    });
  });

  describe('Create Document Type - Form UI & Validation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      cy.get('[data-testid="create-document-type-button"]').click();
    });

    it('should display create document type form with all fields', () => {
      // Form container
      cy.get('[data-testid="document-type-form"], [data-testid="create-form"]', { timeout: 10000 })
        .should('be.visible');
      
      // Form title
      cy.get('h1, h2, h3').should('contain.text', /create|add|new/i);
      cy.get('h1, h2, h3').should('contain.text', /document type/i);
      
      // Name field
      cy.get('[data-testid="input-name"], input[name="name"]')
        .should('be.visible')
        .and('have.attr', 'required');
      cy.get('label').contains(/name/i).should('be.visible');
      
      // Description field
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .should('be.visible');
      cy.get('label').contains(/description/i).should('be.visible');
      
      // Required checkbox
      cy.get('[data-testid="checkbox-required"], input[name="isRequired"], input[type="checkbox"]')
        .should('be.visible');
      cy.get('label').contains(/required/i).should('be.visible');
      
      // Category field
      cy.get('[data-testid="select-category"], select[name="category"]')
        .should('be.visible');
      cy.get('label').contains(/category/i).should('be.visible');
      
      // Submit button
      cy.get('[data-testid="submit-button"], button[type="submit"]')
        .should('be.visible')
        .and('contain.text', /create|save|add/i);
      
      // Cancel button
      cy.get('[data-testid="cancel-button"], button').contains(/cancel/i)
        .should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit without filling required fields
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      // Name field validation
      cy.get('[data-testid="input-name"], input[name="name"]')
        .then(($input) => {
          expect($input[0].validity.valid).to.be.false;
        });
      
      // Check for validation messages
      cy.get('.error, .invalid, [role="alert"]')
        .should('be.visible')
        .and('contain.text', /required|name/i);
    });

    it('should validate name field constraints', () => {
      const nameInput = '[data-testid="input-name"], input[name="name"]';
      
      // Test empty name
      cy.get(nameInput).focus().blur();
      cy.get('.error').should('contain.text', /required/i);
      
      // Test very long name
      cy.get(nameInput).clear().type(testData.longName);
      cy.get('.error').should('contain.text', /too long|maximum/i);
      
      // Test valid name
      cy.get(nameInput).clear().type(testData.validDocumentType.name);
      cy.get('.error').should('not.exist');
    });

    it('should validate description field constraints', () => {
      const descInput = '[data-testid="input-description"], textarea[name="description"], input[name="description"]';
      
      // Test very long description
      cy.get(descInput).type(testData.invalidDocumentType.description);
      cy.get('.error').should('contain.text', /too long|maximum|1000/i);
      
      // Test valid description
      cy.get(descInput).clear().type(testData.validDocumentType.description);
      cy.get('.error').should('not.exist');
    });

    it('should handle category selection', () => {
      const categorySelect = '[data-testid="select-category"], select[name="category"]';
      
      // Check available options
      cy.get(categorySelect).within(() => {
        cy.get('option').should('have.length.greaterThan', 1);
        cy.get('option').contains(/certification/i).should('exist');
        cy.get('option').contains(/license/i).should('exist');
        cy.get('option').contains(/other/i).should('exist');
      });
      
      // Select a category
      cy.get(categorySelect).select('Certification');
      cy.get(categorySelect).should('have.value', 'Certification');
    });

    it('should handle required checkbox toggle', () => {
      const requiredCheckbox = '[data-testid="checkbox-required"], input[name="isRequired"], input[type="checkbox"]';
      
      // Check default state
      cy.get(requiredCheckbox).should('not.be.checked');
      
      // Toggle on
      cy.get(requiredCheckbox).check();
      cy.get(requiredCheckbox).should('be.checked');
      
      // Toggle off
      cy.get(requiredCheckbox).uncheck();
      cy.get(requiredCheckbox).should('not.be.checked');
    });

    it('should handle form cancellation', () => {
      // Fill some fields
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type('Test Document Type');
      
      // Cancel
      cy.get('[data-testid="cancel-button"], button').contains(/cancel/i).click();
      
      // Should return to list page
      cy.url().should('include', '/admin/document-types');
      cy.get('[data-testid="document-types-container"]').should('be.visible');
    });
  });

  describe('Create Document Type - API Integration', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      cy.get('[data-testid="create-document-type-button"]').click();
    });

    it('should successfully create a document type', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: 'new-id', ...testData.validDocumentType }
      }).as('createDocumentType');
      
      // Fill form
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type(testData.validDocumentType.name);
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .type(testData.validDocumentType.description);
      cy.get('[data-testid="select-category"], select[name="category"]')
        .select(testData.validDocumentType.category);
      
      if (testData.validDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-required"], input[name="isRequired"], input[type="checkbox"]')
          .check();
      }
      
      // Submit form
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      // Verify API call
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body).to.include({
          name: testData.validDocumentType.name,
          description: testData.validDocumentType.description,
          category: testData.validDocumentType.category
        });
      });
      
      // Success message
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible')
        .and('contain.text', /created|success/i);
      
      // Should redirect to list
      cy.url().should('include', '/admin/document-types');
    });

    it('should handle creation with minimal required fields', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: 'minimal-id', name: 'Minimal Document Type' }
      }).as('createMinimalDocumentType');
      
      // Fill only required fields
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type('Minimal Document Type');
      
      // Submit form
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      cy.wait('@createMinimalDocumentType');
      
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible');
    });

    it('should handle special characters in document type data', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { id: 'special-id', ...testData.specialCharacters }
      }).as('createSpecialDocumentType');
      
      // Fill form with special characters
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type(testData.specialCharacters.name);
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .type(testData.specialCharacters.description);
      cy.get('[data-testid="select-category"], select[name="category"]')
        .select(testData.specialCharacters.category);
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      cy.wait('@createSpecialDocumentType');
      
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible');
    });

    it('should handle duplicate name error', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { error: 'Document type with this name already exists' }
      }).as('createDuplicateDocumentType');
      
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type(testData.duplicateName);
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      cy.wait('@createDuplicateDocumentType');
      
      cy.get('[data-testid="error-message"], .error, .toast')
        .should('be.visible')
        .and('contain.text', /already exists|duplicate/i);
    });

    it('should handle server errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createServerError');
      
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type(testData.validDocumentType.name);
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      cy.wait('@createServerError');
      
      cy.get('[data-testid="error-message"], .error, .toast')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
      
      // Form should still be visible for retry
      cy.get('[data-testid="document-type-form"], [data-testid="create-form"]')
        .should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, { forceNetworkError: true }).as('createNetworkError');
      
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type(testData.validDocumentType.name);
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      cy.wait('@createNetworkError');
      
      cy.get('[data-testid="error-message"], .error, .toast')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
    });

    it('should show loading state during creation', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        delay: 2000,
        statusCode: 201,
        body: { id: 'slow-id', ...testData.validDocumentType }
      }).as('createSlowDocumentType');
      
      cy.get('[data-testid="input-name"], input[name="name"]')
        .type(testData.validDocumentType.name);
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      // Button should show loading state
      cy.get('[data-testid="submit-button"], button[type="submit"]')
        .should('be.disabled')
        .and('contain.text', /creating|saving|loading/i);
      
      cy.wait('@createSlowDocumentType');
      
      // Button should return to normal
      cy.get('[data-testid="submit-button"], button[type="submit"]')
        .should('not.be.disabled');
    });
  });

  describe('Edit Document Type - Form UI & Validation', () => {
    const existingDocumentType = {
      id: 'existing-id',
      name: 'Existing Document Type',
      description: 'Existing description',
      isRequired: true,
      category: 'License'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [existingDocumentType]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Click edit button for first document type
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="edit-button"], [aria-label*="edit"], button').contains(/edit/i).click();
      });
    });

    it('should display edit form with pre-populated data', () => {
      // Form should be visible
      cy.get('[data-testid="document-type-form"], [data-testid="edit-form"]', { timeout: 10000 })
        .should('be.visible');
      
      // Form title should indicate editing
      cy.get('h1, h2, h3').should('contain.text', /edit|update/i);
      cy.get('h1, h2, h3').should('contain.text', /document type/i);
      
      // Fields should be pre-populated
      cy.get('[data-testid="input-name"], input[name="name"]')
        .should('have.value', existingDocumentType.name);
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .should('have.value', existingDocumentType.description);
      cy.get('[data-testid="select-category"], select[name="category"]')
        .should('have.value', existingDocumentType.category);
      
      if (existingDocumentType.isRequired) {
        cy.get('[data-testid="checkbox-required"], input[name="isRequired"], input[type="checkbox"]')
          .should('be.checked');
      }
      
      // Submit button should show update text
      cy.get('[data-testid="submit-button"], button[type="submit"]')
        .should('contain.text', /update|save/i);
    });

    it('should validate fields during editing', () => {
      // Clear name field
      cy.get('[data-testid="input-name"], input[name="name"]')
        .clear()
        .blur();
      
      cy.get('.error').should('contain.text', /required/i);
      
      // Test long name
      cy.get('[data-testid="input-name"], input[name="name"]')
        .clear()
        .type(testData.longName);
      
      cy.get('.error').should('contain.text', /too long|maximum/i);
    });

    it('should handle form cancellation during editing', () => {
      // Modify fields
      cy.get('[data-testid="input-name"], input[name="name"]')
        .clear()
        .type('Modified Name');
      
      // Cancel
      cy.get('[data-testid="cancel-button"], button').contains(/cancel/i).click();
      
      // Should return to list without saving
      cy.url().should('include', '/admin/document-types');
    });
  });

  describe('Edit Document Type - API Integration', () => {
    const existingDocumentType = {
      id: 'existing-id',
      name: 'Existing Document Type',
      description: 'Existing description',
      isRequired: true,
      category: 'License'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [existingDocumentType]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="edit-button"], [aria-label*="edit"], button').contains(/edit/i).click();
      });
    });

    it('should successfully update document type', () => {
      cy.intercept('PUT', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200,
        body: { ...existingDocumentType, ...testData.updateDocumentType }
      }).as('updateDocumentType');
      
      // Modify fields
      cy.get('[data-testid="input-name"], input[name="name"]')
        .clear()
        .type(testData.updateDocumentType.name);
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .clear()
        .type(testData.updateDocumentType.description);
      cy.get('[data-testid="select-category"], select[name="category"]')
        .select(testData.updateDocumentType.category);
      
      // Toggle required status
      cy.get('[data-testid="checkbox-required"], input[name="isRequired"], input[type="checkbox"]')
        .uncheck();
      
      // Submit
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      // Verify API call
      cy.wait('@updateDocumentType').then((interception) => {
        expect(interception.request.body).to.include({
          name: testData.updateDocumentType.name,
          description: testData.updateDocumentType.description,
          category: testData.updateDocumentType.category,
          isRequired: testData.updateDocumentType.isRequired
        });
      });
      
      // Success message
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible')
        .and('contain.text', /updated|success/i);
    });

    it('should handle update conflicts', () => {
      cy.intercept('PUT', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 409,
        body: { error: 'Document type was modified by another user' }
      }).as('updateConflict');
      
      cy.get('[data-testid="input-name"], input[name="name"]')
        .clear()
        .type('Modified Name');
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      cy.wait('@updateConflict');
      
      cy.get('[data-testid="error-message"], .error, .toast')
        .should('be.visible')
        .and('contain.text', /conflict|modified/i);
    });

    it('should handle partial updates', () => {
      cy.intercept('PATCH', `${apiEndpoints.documentTypes}/${existingDocumentType.id}`, {
        statusCode: 200,
        body: { ...existingDocumentType, name: 'Partially Updated Name' }
      }).as('patchDocumentType');
      
      // Only modify name
      cy.get('[data-testid="input-name"], input[name="name"]')
        .clear()
        .type('Partially Updated Name');
      
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();
      
      // Could be PUT or PATCH depending on implementation
      cy.wait('@updateDocumentType').or(cy.wait('@patchDocumentType'));
      
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible');
    });
  });

  describe('Delete Document Type - UI & Confirmation', () => {
    const documentTypeToDelete = {
      id: 'delete-id',
      name: 'Document Type To Delete',
      description: 'This will be deleted',
      isRequired: false,
      category: 'Other'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [documentTypeToDelete]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show delete confirmation dialog', () => {
      // Click delete button
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal')
        .should('be.visible');
      
      // Dialog content
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('h1, h2, h3').should('contain.text', /delete|confirm/i);
        cy.get('p, div').should('contain.text', documentTypeToDelete.name);
        cy.get('p, div').should('contain.text', /sure|permanent|cannot be undone/i);
        
        // Action buttons
        cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i)
          .should('be.visible');
        cy.get('[data-testid="cancel-delete"], button').contains(/cancel/i)
          .should('be.visible');
      });
    });

    it('should cancel deletion', () => {
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('[data-testid="cancel-delete"], button').contains(/cancel/i).click();
      });
      
      // Dialog should close
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal')
        .should('not.exist');
      
      // Row should still be visible
      cy.get('tbody tr').should('have.length', 1);
    });

    it('should handle deletion with associated documents warning', () => {
      cy.intercept('GET', `${apiEndpoints.documentTypes}/${documentTypeToDelete.id}/usage`, {
        body: { hasAssociatedDocuments: true, count: 5 }
      }).as('getUsage');
      
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      // Should show warning about associated documents
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('.warning, [data-testid="warning"]')
          .should('be.visible')
          .and('contain.text', /documents|associated|affect/i);
      });
    });
  });

  describe('Delete Document Type - API Integration', () => {
    const documentTypeToDelete = {
      id: 'delete-id',
      name: 'Document Type To Delete',
      description: 'This will be deleted',
      isRequired: false,
      category: 'Other'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [documentTypeToDelete]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should successfully delete document type', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${documentTypeToDelete.id}`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocumentType');
      
      // Mock the list refresh after deletion
      cy.intercept('GET', apiEndpoints.documentTypes, { body: [] }).as('getUpdatedList');
      
      // Click delete
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      // Confirm deletion
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();
      });
      
      // Verify API call
      cy.wait('@deleteDocumentType');
      
      // Success message
      cy.get('[data-testid="success-message"], .success, .toast')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);
      
      // List should refresh
      cy.wait('@getUpdatedList');
      
      // Should show empty state or updated list
      cy.get('[data-testid="empty-state"], .empty-state')
        .should('be.visible');
    });

    it('should handle deletion of document type with constraints', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${documentTypeToDelete.id}`, {
        statusCode: 400,
        body: { error: 'Cannot delete document type with associated documents' }
      }).as('deleteConstraintError');
      
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();
      });
      
      cy.wait('@deleteConstraintError');
      
      // Error message
      cy.get('[data-testid="error-message"], .error, .toast')
        .should('be.visible')
        .and('contain.text', /cannot delete|associated documents/i);
      
      // Dialog should close but row should remain
      cy.get('tbody tr').should('have.length', 1);
    });

    it('should handle server errors during deletion', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${documentTypeToDelete.id}`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('deleteServerError');
      
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();
      });
      
      cy.wait('@deleteServerError');
      
      cy.get('[data-testid="error-message"], .error, .toast')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });

    it('should show loading state during deletion', () => {
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/${documentTypeToDelete.id}`, {
        delay: 2000,
        statusCode: 200,
        body: { success: true }
      }).as('deleteSlowResponse');
      
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="delete-button"], [aria-label*="delete"], button').contains(/delete/i).click();
      });
      
      cy.get('[data-testid="delete-confirmation"], [role="dialog"], .modal').within(() => {
        cy.get('[data-testid="confirm-delete"], button').contains(/delete|confirm/i).click();
        
        // Button should show loading state
        cy.get('[data-testid="confirm-delete"], button')
          .should('be.disabled')
          .and('contain.text', /deleting|loading/i);
      });
      
      cy.wait('@deleteSlowResponse');
    });
  });

  describe('Document Types Pagination & Sorting', () => {
    const manyDocumentTypes = Array.from({ length: 25 }, (_, i) => ({
      id: `doc-type-${i}`,
      name: `Document Type ${i + 1}`,
      description: `Description for document type ${i + 1}`,
      isRequired: i % 2 === 0,
      category: ['Certification', 'License', 'Other'][i % 3]
    }));

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: manyDocumentTypes
      }).as('getManyDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getManyDocumentTypes');
    });

    it('should display pagination controls when needed', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"], .pagination').length > 0) {
          cy.get('[data-testid="pagination"], .pagination')
            .should('be.visible');
          
          // Page numbers
          cy.get('[data-testid="page-number"], .page-number').should('have.length.greaterThan', 1);
          
          // Next/Previous buttons
          cy.get('[data-testid="next-page"], [aria-label*="next"]').should('be.visible');
          cy.get('[data-testid="previous-page"], [aria-label*="previous"]').should('be.visible');
        }
      });
    });

    it('should navigate between pages', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"], .pagination').length > 0) {
          // Go to next page
          cy.get('[data-testid="next-page"], [aria-label*="next"]').click();
          
          // URL should change or page indicator should update
          cy.get('[data-testid="page-number"], .page-number').contains('2')
            .should('have.class', /active|current/);
          
          // Different content should be shown
          cy.get('tbody tr').should('have.length.greaterThan', 0);
        }
      });
    });

    it('should handle column sorting', () => {
      cy.get('body').then(($body) => {
        if ($body.find('th[data-sortable="true"], th .sort-button, th[role="columnheader"]').length > 0) {
          // Click name column header
          cy.get('th').contains(/name/i).click();
          
          // Wait for sort to apply
          cy.wait(1000);
          
          // Verify sorting (first item should be alphabetically first or last)
          cy.get('tbody tr').first().should('contain.text', /Document Type 1|Document Type 9/);
          
          // Click again to reverse sort
          cy.get('th').contains(/name/i).click();
          cy.wait(1000);
          
          // Order should be reversed
          cy.get('tbody tr').first().should('not.contain.text', /Document Type 1/);
        }
      });
    });

    it('should display page size options', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="page-size"], .page-size-selector').length > 0) {
          cy.get('[data-testid="page-size"], .page-size-selector')
            .should('be.visible');
          
          // Change page size
          cy.get('[data-testid="page-size"], .page-size-selector')
            .select('50');
          
          // More items should be visible
          cy.get('tbody tr').should('have.length.greaterThan', 10);
        }
      });
    });
  });

  describe('Document Types Usage & Integration', () => {
    const documentTypeWithUsage = {
      id: 'used-doc-type',
      name: 'Used Document Type',
      description: 'This type is used by consultants',
      isRequired: true,
      category: 'Certification'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [documentTypeWithUsage]
      }).as('getDocumentTypes');
      
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show document type usage statistics', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="usage-count"], .usage-stats').length > 0) {
          cy.get('tbody tr').first().within(() => {
            cy.get('[data-testid="usage-count"], .usage-stats')
              .should('be.visible')
              .and('contain.text', /\d+/); // Should contain a number
          });
        }
      });
    });

    it('should link to consultant documents using this type', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="view-usage"], [aria-label*="usage"]').length > 0) {
          cy.get('tbody tr').first().within(() => {
            cy.get('[data-testid="view-usage"], [aria-label*="usage"]').click();
          });
          
          // Should navigate to usage page or show usage modal
          cy.get('[data-testid="usage-details"], [data-testid="usage-modal"]')
            .should('be.visible');
        }
      });
    });

    it('should show required indicator for required document types', () => {
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-testid="required-badge"], .required-indicator')
          .should('be.visible')
          .and('contain.text', /required|yes/i);
      });
    });

    it('should group document types by category', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="category-group"], .category-section').length > 0) {
          cy.get('[data-testid="category-group"], .category-section')
            .should('have.length.greaterThan', 0);
          
          cy.get('[data-testid="category-group"], .category-section').each(($group) => {
            cy.wrap($group).find('h3, .category-header')
              .should('contain.text', /certification|license|other/i);
          });
        }
      });
    });
  });

  describe('Document Types Error Handling & Edge Cases', () => {
    it('should handle API unavailable error', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { forceNetworkError: true }).as('getNetworkError');
      
      cy.visit('/admin/document-types');
      cy.wait('@getNetworkError');
      
      cy.get('[data-testid="error-state"], .error-message')
        .should('be.visible')
        .and('contain.text', /error|failed|unable/i);
      
      // Retry button should be available
      cy.get('[data-testid="retry-button"], button').contains(/retry|reload/i)
        .should('be.visible');
    });

    it('should handle slow API responses', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        delay: 5000,
        body: []
      }).as('getSlowResponse');
      
      cy.visit('/admin/document-types');
      
      // Loading state should be visible
      cy.get('[data-testid="loading"], .loading, .spinner')
        .should('be.visible');
      
      cy.wait('@getSlowResponse');
      
      cy.get('[data-testid="loading"], .loading, .spinner')
        .should('not.exist');
    });

    it('should handle invalid API responses', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: 'invalid json response'
      }).as('getInvalidResponse');
      
      cy.visit('/admin/document-types');
      cy.wait('@getInvalidResponse');
      
      cy.get('[data-testid="error-state"], .error-message')
        .should('be.visible');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 403,
        body: { error: 'Forbidden' }
      }).as('getForbidden');
      
      cy.visit('/admin/document-types');
      cy.wait('@getForbidden');
      
      cy.get('[data-testid="error-state"], .error-message')
        .should('be.visible')
        .and('contain.text', /forbidden|access denied|permission/i);
    });

    it('should handle very long document type names in display', () => {
      const longNameDocType = {
        id: 'long-name',
        name: 'A'.repeat(200),
        description: 'Very long name test',
        isRequired: false,
        category: 'Other'
      };
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: [longNameDocType]
      }).as('getLongName');
      
      cy.visit('/admin/document-types');
      cy.wait('@getLongName');
      
      // Should handle long names gracefully (truncation or wrapping)
      cy.get('tbody tr').first().within(() => {
        cy.get('td').first().should('be.visible');
        // Text should either be truncated or wrapped properly
        cy.get('td').first().should(($td) => {
          const text = $td.text();
          expect(text.length).to.be.greaterThan(0);
        });
      });
    });

    it('should handle special characters in search', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Test special characters in search
      const specialSearchTerms = ['!@#$%', '<script>', '&amp;', '"quotes"'];
      
      specialSearchTerms.forEach((term) => {
        cy.get('[data-testid="search-input"]')
          .clear()
          .type(term);
        
        cy.wait(500);
        
        // Should not cause JavaScript errors or break the page
        cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
          .should('be.visible');
      });
    });
  });

  describe('Document Types Accessibility & Keyboard Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should be navigable with keyboard only', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'create-document-type-button');
      
      // Continue tabbing through table rows
      cy.focused().tab();
      cy.focused().should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      // Main container
      cy.get('[data-testid="document-types-container"]')
        .should('have.attr', 'role', 'main')
        .or('have.attr', 'aria-label');
      
      // Table accessibility
      cy.get('table')
        .should('have.attr', 'role', 'table')
        .or('have.attr', 'aria-label');
      
      // Buttons
      cy.get('[data-testid="create-document-type-button"]')
        .should('have.attr', 'aria-label')
        .or('have.accessible.name');
      
      // Action buttons
      cy.get('[data-testid="edit-button"], [aria-label*="edit"]').first()
        .should('have.attr', 'aria-label');
      
      cy.get('[data-testid="delete-button"], [aria-label*="delete"]').first()
        .should('have.attr', 'aria-label');
    });

    it('should announce important changes to screen readers', () => {
      // Check for live regions
      cy.get('[aria-live="polite"], [aria-live="assertive"], [role="status"], [role="alert"]')
        .should('exist');
    });

    it('should handle focus management in modals', () => {
      // Open create form
      cy.get('[data-testid="create-document-type-button"]').click();
      
      // Focus should move to first input
      cy.focused().should('have.attr', 'name', 'name')
        .or('have.attr', 'data-testid', 'input-name');
      
      // Tab through form elements
      cy.focused().tab();
      cy.focused().should('be.visible');
    });
  });

  describe('Document Types Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
    });

    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Main container should be visible
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');
      
      // Create button should be accessible
      cy.get('[data-testid="create-document-type-button"]')
        .should('be.visible');
      
      // Search should work
      cy.get('[data-testid="search-input"]')
        .should('be.visible');
      
      // Table should be responsive (could be cards on mobile)
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"], .mobile-cards')
        .should('be.visible');
    });

    it('should handle mobile form interactions', () => {
      cy.viewport('iphone-x');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Open create form
      cy.get('[data-testid="create-document-type-button"]').click();
      
      // Form should be visible and usable
      cy.get('[data-testid="document-type-form"], [data-testid="create-form"]')
        .should('be.visible');
      
      // All form fields should be accessible
      cy.get('[data-testid="input-name"], input[name="name"]')
        .should('be.visible')
        .type('Mobile Test Type');
      
      cy.get('[data-testid="input-description"], textarea[name="description"], input[name="description"]')
        .should('be.visible')
        .type('Mobile description');
      
      // Form should be submittable
      cy.get('[data-testid="submit-button"], button[type="submit"]')
        .should('be.visible');
    });

    it('should handle tablet viewport correctly', () => {
      cy.viewport('ipad-2');
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      // Layout should adapt to tablet
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');
      
      // Table should still be readable
      cy.get('table').should('be.visible');
      
      // Action buttons should be accessible
      cy.get('[data-testid="edit-button"], [aria-label*="edit"]').first()
        .should('be.visible');
    });
  });

  describe('Document Types Performance & Optimization', () => {
    it('should load document types quickly', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'document-types.json' }).as('getDocumentTypes');
      
      const startTime = Date.now();
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
      
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('be.visible')
        .then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
        });
    });

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `large-${i}`,
        name: `Large Dataset Type ${i}`,
        description: `Description ${i}`,
        isRequired: i % 2 === 0,
        category: 'Test'
      }));
      
      cy.intercept('GET', apiEndpoints.documentTypes, {
        body: largeDataset
      }).as('getLargeDataset');
      
      cy.visit('/admin/document-types');
      cy.wait('@getLargeDataset');
      
      // Page should remain responsive
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');
      
      // Search should still work quickly
      cy.get('[data-testid="search-input"]')
        .type('Large Dataset Type 5');
      
      cy.wait(1000);
      
      // Should filter results
      cy.get('tbody tr').should('have.length.lessThan', 10);
    });
  });
});
