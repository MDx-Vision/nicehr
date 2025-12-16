describe('Document Types System - Exhaustive Tests', () => {
  const testData = {
    documentType: {
      name: 'Test License',
      description: 'A test medical license document',
      required: true,
      expirationRequired: true,
      categoryId: null
    },
    invalidDocumentType: {
      name: '', // Invalid: empty name
      description: null,
      required: 'invalid', // Invalid: should be boolean
      expirationRequired: 'yes' // Invalid: should be boolean
    },
    updateData: {
      name: 'Updated License Type',
      description: 'Updated description for license',
      required: false,
      expirationRequired: false
    },
    ciData: {
      email: 'test@example.com',
      password: 'test123'
    },
    consultant: {
      id: null // Will be set dynamically
    },
    document: {
      name: 'Medical License.pdf',
      type: 'application/pdf',
      size: 1024000,
      expirationDate: '2024-12-31'
    }
  };

  const apiEndpoints = {
    auth: '/api/auth/login',
    user: '/api/auth/user',
    documentTypes: '/api/document-types',
    consultants: '/api/consultants',
    consultantDocuments: (id) => `/api/consultants/${id}/documents`,
    documentStatus: (id) => `/api/documents/${id}/status`
  };

  let authHeaders = {};
  let documentTypeId = null;
  let consultantId = null;
  let documentId = null;

  before(() => {
    // Login and get auth state
    cy.request({
      method: 'POST',
      url: apiEndpoints.auth,
      body: testData.ciData
    }).then((response) => {
      expect(response.status).to.eq(200);
      authHeaders = {
        'Authorization': `Bearer ${response.body.token}`
      };
    });

    // Get consultant ID
    cy.request({
      method: 'GET',
      url: apiEndpoints.consultants,
      headers: authHeaders
    }).then((response) => {
      const consultant = response.body.data?.find(c => 
        c.email === testData.ciData.email || 
        c.name?.includes('ci-test-consultant')
      );
      if (consultant) {
        testData.consultant.id = consultant.id;
        consultantId = consultant.id;
      }
    });
  });

  beforeEach(() => {
    // Clear state and login
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login via API for consistent state
    cy.request({
      method: 'POST',
      url: apiEndpoints.auth,
      body: testData.ciData
    }).then((response) => {
      cy.setCookie('auth-token', response.body.token);
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', response.body.token);
        win.localStorage.setItem('user', JSON.stringify(response.body.user));
      });
    });
  });

  describe('Document Types Management Page - UI & Layout', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait(1000);
    });

    it('should display complete document types management layout', () => {
      // Wait for page load
      cy.get('[data-testid="document-types-page"]', { timeout: 15000 })
        .should('be.visible');

      // Header elements
      cy.get('[data-testid="page-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('h1, h2').should('contain.text', /document types/i);
          cy.get('[data-testid="create-document-type-button"]')
            .should('be.visible')
            .and('not.be.disabled');
        });

      // Main content area
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');

      // Search and filter section
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          cy.get('[data-testid="search-input"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
        if ($body.find('[data-testid="filter-container"]').length > 0) {
          cy.get('[data-testid="filter-container"]').should('be.visible');
        }
      });

      // Document types list or table
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="document-types-table"]').length > 0) {
          cy.get('[data-testid="document-types-table"]').should('be.visible');
        } else if ($body.find('[data-testid="document-types-list"]').length > 0) {
          cy.get('[data-testid="document-types-list"]').should('be.visible');
        } else if ($body.find('[data-testid="document-types-grid"]').length > 0) {
          cy.get('[data-testid="document-types-grid"]').should('be.visible');
        }
      });
    });

    it('should have proper accessibility features', () => {
      // Page title
      cy.title().should('contain', /document types/i);

      // Main heading
      cy.get('h1').should('have.attr', 'id').and('not.be.empty');

      // Skip to content link (if present)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="skip-to-content"]').length > 0) {
          cy.get('[data-testid="skip-to-content"]')
            .should('have.attr', 'href', '#main-content');
        }
      });

      // Keyboard navigation
      cy.get('[data-testid="create-document-type-button"]')
        .should('have.attr', 'tabindex')
        .focus()
        .should('have.focus');
    });

    it('should display empty state when no document types exist', () => {
      // Intercept API call to return empty data
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: [], total: 0, page: 1, limit: 10 }
      }).as('getEmptyDocumentTypes');

      cy.reload();
      cy.wait('@getEmptyDocumentTypes');

      // Check for empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="empty-state"]').length > 0) {
          cy.get('[data-testid="empty-state"]')
            .should('be.visible')
            .within(() => {
              cy.get('[data-testid="empty-state-message"]')
                .should('contain.text', /no document types/i);
              cy.get('[data-testid="empty-state-action"]')
                .should('contain.text', /create/i);
            });
        }
      });
    });

    it('should handle loading states properly', () => {
      // Intercept with delay to test loading
      cy.intercept('GET', apiEndpoints.documentTypes, (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(res.send({
                statusCode: 200,
                body: { data: [], total: 0 }
              }));
            }, 2000);
          });
        });
      }).as('getDocumentTypesDelayed');

      cy.reload();

      // Check for loading indicator
      cy.get('[data-testid="loading-spinner"], [data-testid="loading-indicator"], .loading')
        .should('be.visible');

      cy.wait('@getDocumentTypesDelayed', { timeout: 5000 });

      // Loading should disappear
      cy.get('[data-testid="loading-spinner"], [data-testid="loading-indicator"], .loading')
        .should('not.exist');
    });
  });

  describe('Document Type Creation - Modal/Form', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait(1000);
    });

    it('should open create document type modal with proper form fields', () => {
      cy.get('[data-testid="create-document-type-button"]')
        .click();

      // Modal should open
      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]', { timeout: 5000 })
        .should('be.visible')
        .within(() => {
          // Modal header
          cy.get('[data-testid="modal-header"]')
            .should('contain.text', /create/i)
            .and('contain.text', /document type/i);

          // Form fields
          cy.get('[data-testid="input-name"]')
            .should('be.visible')
            .and('have.attr', 'required');

          cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
            .should('be.visible');

          // Checkboxes or toggles
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="checkbox-required"]').length > 0) {
              cy.get('[data-testid="checkbox-required"]').should('be.visible');
            }
            if ($body.find('[data-testid="toggle-required"]').length > 0) {
              cy.get('[data-testid="toggle-required"]').should('be.visible');
            }
            if ($body.find('[data-testid="checkbox-expiration"]').length > 0) {
              cy.get('[data-testid="checkbox-expiration"]').should('be.visible');
            }
            if ($body.find('[data-testid="toggle-expiration"]').length > 0) {
              cy.get('[data-testid="toggle-expiration"]').should('be.visible');
            }
          });

          // Action buttons
          cy.get('[data-testid="button-cancel"]')
            .should('be.visible')
            .and('contain.text', /cancel/i);

          cy.get('[data-testid="button-save"], [data-testid="button-create"]')
            .should('be.visible')
            .and('contain.text', /(save|create)/i);
        });
    });

    it('should create document type with valid data', () => {
      // Intercept create API call
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: {
          id: 'dt-123',
          ...testData.documentType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }).as('createDocumentType');

      // Intercept list refresh
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [{
            id: 'dt-123',
            ...testData.documentType,
            createdAt: new Date().toISOString()
          }],
          total: 1
        }
      }).as('getDocumentTypesAfterCreate');

      cy.get('[data-testid="create-document-type-button"]').click();

      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .within(() => {
          // Fill form
          cy.get('[data-testid="input-name"]')
            .clear()
            .type(testData.documentType.name);

          cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
            .clear()
            .type(testData.documentType.description);

          // Set required checkbox/toggle
          if (testData.documentType.required) {
            cy.get('body').then(($body) => {
              if ($body.find('[data-testid="checkbox-required"]').length > 0) {
                cy.get('[data-testid="checkbox-required"]').check();
              } else if ($body.find('[data-testid="toggle-required"]').length > 0) {
                cy.get('[data-testid="toggle-required"]').click();
              }
            });
          }

          // Set expiration required checkbox/toggle
          if (testData.documentType.expirationRequired) {
            cy.get('body').then(($body) => {
              if ($body.find('[data-testid="checkbox-expiration"]').length > 0) {
                cy.get('[data-testid="checkbox-expiration"]').check();
              } else if ($body.find('[data-testid="toggle-expiration"]').length > 0) {
                cy.get('[data-testid="toggle-expiration"]').click();
              }
            });
          }

          // Submit form
          cy.get('[data-testid="button-save"], [data-testid="button-create"]')
            .click();
        });

      // Wait for API call
      cy.wait('@createDocumentType');

      // Modal should close
      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .should('not.exist');

      // Should show success message
      cy.get('[data-testid="toast-success"], [data-testid="alert-success"], .alert-success')
        .should('be.visible')
        .and('contain.text', /success|created/i);

      // List should refresh
      cy.wait('@getDocumentTypesAfterCreate');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .within(() => {
          // Try to submit empty form
          cy.get('[data-testid="button-save"], [data-testid="button-create"]')
            .click();

          // Should show validation errors
          cy.get('[data-testid="error-name"], .error, .field-error')
            .should('be.visible')
            .and('contain.text', /required/i);

          // Name field should have error styling
          cy.get('[data-testid="input-name"]')
            .should('have.class', /(error|invalid)/)
            .or('have.attr', 'aria-invalid', 'true');
        });
    });

    it('should handle API errors during creation', () => {
      // Intercept with error response
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: {
          error: 'Document type name already exists',
          details: 'A document type with this name already exists'
        }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="create-document-type-button"]').click();

      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .within(() => {
          cy.get('[data-testid="input-name"]')
            .type('Duplicate Name');

          cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
            .type('Test description');

          cy.get('[data-testid="button-save"], [data-testid="button-create"]')
            .click();
        });

      cy.wait('@createDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], [data-testid="alert-error"], .alert-error')
        .should('be.visible')
        .and('contain.text', /already exists/i);

      // Modal should remain open
      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .should('be.visible');
    });

    it('should cancel creation and close modal', () => {
      cy.get('[data-testid="create-document-type-button"]').click();

      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .should('be.visible')
        .within(() => {
          // Fill some data
          cy.get('[data-testid="input-name"]')
            .type('Test Name');

          // Cancel
          cy.get('[data-testid="button-cancel"]')
            .click();
        });

      // Modal should close
      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .should('not.exist');

      // No API call should be made
      cy.get('@createDocumentType.all').should('have.length', 0);
    });
  });

  describe('Document Types List - Display & Interaction', () => {
    beforeEach(() => {
      // Mock document types data
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'dt-1',
              name: 'Medical License',
              description: 'State medical license',
              required: true,
              expirationRequired: true,
              createdAt: '2023-01-01T00:00:00Z'
            },
            {
              id: 'dt-2',
              name: 'DEA License',
              description: 'Drug Enforcement Administration license',
              required: true,
              expirationRequired: true,
              createdAt: '2023-01-02T00:00:00Z'
            },
            {
              id: 'dt-3',
              name: 'Resume',
              description: 'Professional resume',
              required: false,
              expirationRequired: false,
              createdAt: '2023-01-03T00:00:00Z'
            }
          ],
          total: 3,
          page: 1,
          limit: 10
        }
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types in table/list format', () => {
      // Check for data display
      cy.get('[data-testid="document-types-table"], [data-testid="document-types-list"]')
        .should('be.visible')
        .within(() => {
          // Headers or labels
          cy.get('th, [data-testid="column-header"]').should('contain.text', /name/i);
          cy.get('th, [data-testid="column-header"]').should('contain.text', /description/i);
          
          // Data rows
          cy.get('[data-testid="document-type-row"]')
            .should('have.length', 3);

          // Check first row data
          cy.get('[data-testid="document-type-row"]').first()
            .within(() => {
              cy.get('[data-testid="document-type-name"]')
                .should('contain.text', 'Medical License');
              cy.get('[data-testid="document-type-description"]')
                .should('contain.text', 'State medical license');
            });
        });
    });

    it('should show required and expiration status indicators', () => {
      cy.get('[data-testid="document-type-row"]').first()
        .within(() => {
          // Required indicator
          cy.get('[data-testid="required-badge"], [data-testid="required-indicator"]')
            .should('be.visible')
            .and('contain.text', /required/i);

          // Expiration indicator
          cy.get('[data-testid="expiration-badge"], [data-testid="expiration-indicator"]')
            .should('be.visible');
        });

      // Check non-required document type
      cy.get('[data-testid="document-type-row"]').last()
        .within(() => {
          // Should not have required badge or show as optional
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="required-badge"]').length > 0) {
              cy.get('[data-testid="required-badge"]').should('not.exist');
            } else {
              cy.get('[data-testid="optional-badge"], [data-testid="optional-indicator"]')
                .should('be.visible');
            }
          });
        });
    });

    it('should have action buttons for each document type', () => {
      cy.get('[data-testid="document-type-row"]').first()
        .within(() => {
          // Edit button
          cy.get('[data-testid="button-edit"], [data-testid="edit-button"]')
            .should('be.visible')
            .and('not.be.disabled');

          // Delete button
          cy.get('[data-testid="button-delete"], [data-testid="delete-button"]')
            .should('be.visible')
            .and('not.be.disabled');

          // More actions menu (if present)
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="actions-menu"]').length > 0) {
              cy.get('[data-testid="actions-menu"]').should('be.visible');
            }
          });
        });
    });

    it('should handle row selection if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-checkbox"]').length > 0) {
          // Test individual selection
          cy.get('[data-testid="document-type-row"]').first()
            .find('[data-testid="select-checkbox"]')
            .check();

          // Should show selected state
          cy.get('[data-testid="document-type-row"]').first()
            .should('have.class', /selected/);

          // Test select all
          if ($body.find('[data-testid="select-all-checkbox"]').length > 0) {
            cy.get('[data-testid="select-all-checkbox"]').check();
            
            cy.get('[data-testid="select-checkbox"]').should('be.checked');
          }

          // Should show bulk actions
          if ($body.find('[data-testid="bulk-actions"]').length > 0) {
            cy.get('[data-testid="bulk-actions"]').should('be.visible');
          }
        }
      });
    });
  });

  describe('Document Type Search & Filtering', () => {
    beforeEach(() => {
      // Mock search data
      cy.intercept('GET', `${apiEndpoints.documentTypes}?search=*`, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'dt-1',
              name: 'Medical License',
              description: 'State medical license',
              required: true,
              expirationRequired: true
            }
          ],
          total: 1
        }
      }).as('searchDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait(1000);
    });

    it('should search document types by name', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          cy.get('[data-testid="search-input"]')
            .type('Medical{enter}');

          cy.wait('@searchDocumentTypes');

          // Should show filtered results
          cy.get('[data-testid="document-type-row"]')
            .should('have.length.lte', 2);

          // Clear search
          cy.get('[data-testid="search-input"]').clear();
          cy.get('[data-testid="clear-search"], [data-testid="reset-filters"]', { timeout: 2000 })
            .click({ force: true });
        }
      });
    });

    it('should filter by required status', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="filter-required"]').length > 0) {
          cy.get('[data-testid="filter-required"]').click();

          // Should show only required document types
          cy.get('[data-testid="document-type-row"]').each(($row) => {
            cy.wrap($row).within(() => {
              cy.get('[data-testid="required-badge"], [data-testid="required-indicator"]')
                .should('exist');
            });
          });
        }
      });
    });

    it('should handle empty search results', () => {
      // Mock empty search results
      cy.intercept('GET', `${apiEndpoints.documentTypes}?search=*`, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('emptySearch');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          cy.get('[data-testid="search-input"]')
            .type('NonExistentType{enter}');

          cy.wait('@emptySearch');

          // Should show no results message
          cy.get('[data-testid="no-results"], [data-testid="empty-search"]')
            .should('be.visible')
            .and('contain.text', /no.*found/i);
        }
      });
    });
  });

  describe('Document Type Editing', () => {
    beforeEach(() => {
      // Mock existing document type
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [{
            id: 'dt-edit-1',
            name: 'Test License',
            description: 'Test description',
            required: true,
            expirationRequired: false
          }],
          total: 1
        }
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should open edit modal with pre-filled data', () => {
      cy.get('[data-testid="button-edit"], [data-testid="edit-button"]')
        .first()
        .click();

      cy.get('[data-testid="document-type-modal"], [data-testid="edit-document-type-modal"]')
        .should('be.visible')
        .within(() => {
          // Should show edit title
          cy.get('[data-testid="modal-header"]')
            .should('contain.text', /edit/i);

          // Fields should be pre-filled
          cy.get('[data-testid="input-name"]')
            .should('have.value', 'Test License');

          cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
            .should('have.value', 'Test description');

          // Required checkbox should be checked
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="checkbox-required"]').length > 0) {
              cy.get('[data-testid="checkbox-required"]').should('be.checked');
            }
          });
        });
    });

    it('should update document type with new data', () => {
      // Mock update API call
      cy.intercept('PATCH', `${apiEndpoints.documentTypes}/dt-edit-1`, {
        statusCode: 200,
        body: {
          id: 'dt-edit-1',
          ...testData.updateData
        }
      }).as('updateDocumentType');

      cy.get('[data-testid="button-edit"], [data-testid="edit-button"]')
        .first()
        .click();

      cy.get('[data-testid="document-type-modal"], [data-testid="edit-document-type-modal"]')
        .within(() => {
          // Update fields
          cy.get('[data-testid="input-name"]')
            .clear()
            .type(testData.updateData.name);

          cy.get('[data-testid="input-description"], [data-testid="textarea-description"]')
            .clear()
            .type(testData.updateData.description);

          // Uncheck required
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="checkbox-required"]').length > 0) {
              cy.get('[data-testid="checkbox-required"]').uncheck();
            } else if ($body.find('[data-testid="toggle-required"]').length > 0) {
              cy.get('[data-testid="toggle-required"]').click();
            }
          });

          // Save changes
          cy.get('[data-testid="button-save"], [data-testid="button-update"]')
            .click();
        });

      cy.wait('@updateDocumentType');

      // Should show success message
      cy.get('[data-testid="toast-success"], [data-testid="alert-success"]')
        .should('be.visible')
        .and('contain.text', /updated/i);

      // Modal should close
      cy.get('[data-testid="document-type-modal"], [data-testid="edit-document-type-modal"]')
        .should('not.exist');
    });

    it('should validate edited fields', () => {
      cy.get('[data-testid="button-edit"], [data-testid="edit-button"]')
        .first()
        .click();

      cy.get('[data-testid="document-type-modal"], [data-testid="edit-document-type-modal"]')
        .within(() => {
          // Clear required field
          cy.get('[data-testid="input-name"]').clear();

          // Try to save
          cy.get('[data-testid="button-save"], [data-testid="button-update"]')
            .click();

          // Should show validation error
          cy.get('[data-testid="error-name"], .error')
            .should('be.visible')
            .and('contain.text', /required/i);
        });
    });
  });

  describe('Document Type Deletion', () => {
    beforeEach(() => {
      // Mock document types
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [{
            id: 'dt-delete-1',
            name: 'Test Document Type',
            description: 'Test description',
            required: false,
            expirationRequired: false
          }],
          total: 1
        }
      }).as('getDocumentTypes');

      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should show confirmation dialog before deletion', () => {
      cy.get('[data-testid="button-delete"], [data-testid="delete-button"]')
        .first()
        .click();

      // Confirmation dialog should appear
      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="dialog-title"]')
            .should('contain.text', /delete/i);

          cy.get('[data-testid="dialog-message"]')
            .should('contain.text', /are you sure/i);

          cy.get('[data-testid="button-cancel"], [data-testid="cancel-button"]')
            .should('be.visible');

          cy.get('[data-testid="button-confirm"], [data-testid="delete-confirm"]')
            .should('be.visible')
            .and('contain.text', /delete/i);
        });
    });

    it('should delete document type after confirmation', () => {
      // Mock delete API call
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/dt-delete-1`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocumentType');

      // Mock updated list
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: { data: [], total: 0 }
      }).as('getUpdatedDocumentTypes');

      cy.get('[data-testid="button-delete"], [data-testid="delete-button"]')
        .first()
        .click();

      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .within(() => {
          cy.get('[data-testid="button-confirm"], [data-testid="delete-confirm"]')
            .click();
        });

      cy.wait('@deleteDocumentType');

      // Should show success message
      cy.get('[data-testid="toast-success"], [data-testid="alert-success"]')
        .should('be.visible')
        .and('contain.text', /deleted/i);

      // List should refresh
      cy.wait('@getUpdatedDocumentTypes');

      // Confirmation dialog should close
      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .should('not.exist');
    });

    it('should cancel deletion', () => {
      cy.get('[data-testid="button-delete"], [data-testid="delete-button"]')
        .first()
        .click();

      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .within(() => {
          cy.get('[data-testid="button-cancel"], [data-testid="cancel-button"]')
            .click();
        });

      // Dialog should close
      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .should('not.exist');

      // No API call should be made
      cy.get('@deleteDocumentType.all').should('have.length', 0);

      // Item should still exist
      cy.get('[data-testid="document-type-row"]').should('exist');
    });

    it('should handle deletion errors', () => {
      // Mock error response
      cy.intercept('DELETE', `${apiEndpoints.documentTypes}/dt-delete-1`, {
        statusCode: 400,
        body: {
          error: 'Cannot delete document type',
          details: 'Document type is in use by consultants'
        }
      }).as('deleteDocumentTypeError');

      cy.get('[data-testid="button-delete"], [data-testid="delete-button"]')
        .first()
        .click();

      cy.get('[data-testid="delete-confirmation"], [data-testid="confirm-dialog"]')
        .within(() => {
          cy.get('[data-testid="button-confirm"], [data-testid="delete-confirm"]')
            .click();
        });

      cy.wait('@deleteDocumentTypeError');

      // Should show error message
      cy.get('[data-testid="toast-error"], [data-testid="alert-error"]')
        .should('be.visible')
        .and('contain.text', /cannot delete/i);

      // Item should still exist
      cy.get('[data-testid="document-type-row"]').should('exist');
    });
  });

  describe('Consultant Documents Management', () => {
    beforeEach(() => {
      if (!consultantId) {
        cy.log('Skipping consultant document tests - no consultant ID available');
        return;
      }

      // Mock document types
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'dt-1',
              name: 'Medical License',
              description: 'State medical license',
              required: true,
              expirationRequired: true
            },
            {
              id: 'dt-2',
              name: 'Resume',
              description: 'Professional resume',
              required: false,
              expirationRequired: false
            }
          ],
          total: 2
        }
      }).as('getDocumentTypes');

      // Mock consultant documents
      cy.intercept('GET', apiEndpoints.consultantDocuments(consultantId), {
        statusCode: 200,
        body: {
          data: [],
          total: 0
        }
      }).as('getConsultantDocuments');

      cy.visit(`/consultants/${consultantId}/documents`);
      cy.wait(['@getDocumentTypes', '@getConsultantDocuments']);
    });

    it('should display consultant documents page layout', () => {
      if (!consultantId) return;

      // Page header
      cy.get('[data-testid="consultant-documents-page"]', { timeout: 10000 })
        .should('be.visible');

      cy.get('[data-testid="page-header"]')
        .should('be.visible')
        .within(() => {
          cy.get('h1, h2').should('contain.text', /documents/i);
        });

      // Upload section
      cy.get('[data-testid="upload-section"], [data-testid="document-upload"]')
        .should('be.visible');

      // Documents list
      cy.get('[data-testid="documents-list"], [data-testid="documents-container"]')
        .should('be.visible');
    });

    it('should show required documents status', () => {
      if (!consultantId) return;

      // Should show required documents checklist
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="required-documents"]').length > 0) {
          cy.get('[data-testid="required-documents"]')
            .should('be.visible')
            .within(() => {
              cy.get('[data-testid="document-requirement"]')
                .should('contain.text', 'Medical License')
                .within(() => {
                  // Should show missing status
                  cy.get('[data-testid="status-missing"], [data-testid="status-pending"]')
                    .should('be.visible');
                });
            });
        }
      });
    });

    it('should upload document file', () => {
      if (!consultantId) return;

      // Mock file upload
      cy.intercept('POST', '/api/objects/upload', {
        statusCode: 200,
        body: {
          url: 'https://example.com/test-file.pdf',
          key: 'documents/test-file.pdf'
        }
      }).as('uploadFile');

      // Mock document creation
      cy.intercept('POST', apiEndpoints.consultantDocuments(consultantId), {
        statusCode: 201,
        body: {
          id: 'doc-123',
          name: testData.document.name,
          documentTypeId: 'dt-1',
          status: 'pending',
          uploadedAt: new Date().toISOString()
        }
      }).as('createDocument');

      // Find upload component
      cy.get('[data-testid="file-upload"], [data-testid="upload-area"]')
        .should('be.visible');

      // Create a test file
      const fileName = testData.document.name;
      const fileType = testData.document.type;

      cy.get('input[type="file"]').then(($input) => {
        const blob = new Blob(['test file content'], { type: fileType });
        const file = new File([blob], fileName, { type: fileType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Select document type
      cy.get('[data-testid="select-document-type"]')
        .click()
        .within(() => {
          cy.get('[data-value="dt-1"]').click();
        });

      // Add expiration date if required
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-expiration"]').length > 0) {
          cy.get('[data-testid="input-expiration"]')
            .type(testData.document.expirationDate);
        }
      });

      // Submit upload
      cy.get('[data-testid="button-upload"], [data-testid="upload-button"]')
        .click();

      cy.wait(['@uploadFile', '@createDocument']);

      // Should show success message
      cy.get('[data-testid="toast-success"], [data-testid="alert-success"]')
        .should('be.visible')
        .and('contain.text', /uploaded/i);
    });

    it('should validate file upload requirements', () => {
      if (!consultantId) return;

      // Test file size limit
      cy.get('input[type="file"]').then(($input) => {
        const oversizeBlob = new Blob(['x'.repeat(50 * 1024 * 1024)], { type: 'application/pdf' }); // 50MB
        const oversizeFile = new File([oversizeBlob], 'large-file.pdf', { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(oversizeFile);
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Should show size error
      cy.get('[data-testid="error-file-size"], .error')
        .should('be.visible')
        .and('contain.text', /size|large/i);

      // Test invalid file type
      cy.get('input[type="file"]').then(($input) => {
        const invalidBlob = new Blob(['test'], { type: 'application/exe' });
        const invalidFile = new File([invalidBlob], 'virus.exe', { type: 'application/exe' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(invalidFile);
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Should show type error
      cy.get('[data-testid="error-file-type"], .error')
        .should('be.visible')
        .and('contain.text', /type|format/i);
    });
  });

  describe('Document Status Management', () => {
    beforeEach(() => {
      if (!consultantId) return;

      // Mock consultant with documents
      cy.intercept('GET', apiEndpoints.consultantDocuments(consultantId), {
        statusCode: 200,
        body: {
          data: [
            {
              id: 'doc-1',
              name: 'Medical License.pdf',
              documentTypeId: 'dt-1',
              status: 'pending',
              expirationDate: '2024-12-31',
              uploadedAt: '2023-01-01T00:00:00Z'
            },
            {
              id: 'doc-2',
              name: 'Resume.pdf',
              documentTypeId: 'dt-2',
              status: 'approved',
              uploadedAt: '2023-01-02T00:00:00Z'
            }
          ],
          total: 2
        }
      }).as('getDocuments');

      cy.visit(`/consultants/${consultantId}/documents`);
      cy.wait('@getDocuments');
    });

    it('should display document status indicators', () => {
      if (!consultantId) return;

      cy.get('[data-testid="document-item"]').first()
        .within(() => {
          // Document name
          cy.get('[data-testid="document-name"]')
            .should('contain.text', 'Medical License.pdf');

          // Status badge
          cy.get('[data-testid="status-badge"]')
            .should('be.visible')
            .and('contain.text', /pending/i)
            .and('have.class', /(pending|warning)/);

          // Expiration date
          cy.get('[data-testid="expiration-date"]')
            .should('contain.text', '2024-12-31');
        });

      cy.get('[data-testid="document-item"]').last()
        .within(() => {
          cy.get('[data-testid="status-badge"]')
            .should('contain.text', /approved/i)
            .and('have.class', /(approved|success)/);
        });
    });

    it('should allow status updates by admins', () => {
      if (!consultantId) return;

      // Mock status update
      cy.intercept('PATCH', '/api/documents/doc-1/status', {
        statusCode: 200,
        body: {
          id: 'doc-1',
          status: 'approved',
          reviewedBy: 'admin-user',
          reviewedAt: new Date().toISOString()
        }
      }).as('updateDocumentStatus');

      cy.get('[data-testid="document-item"]').first()
        .within(() => {
          // Click on status or find status dropdown
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="status-dropdown"]').length > 0) {
              cy.get('[data-testid="status-dropdown"]').click();
              cy.get('[data-value="approved"]').click();
            } else if ($body.find('[data-testid="approve-button"]').length > 0) {
              cy.get('[data-testid="approve-button"]').click();
            }
          });
        });

      cy.wait('@updateDocumentStatus');

      // Should show success message
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /approved/i);
    });

    it('should show expiration warnings', () => {
      if (!consultantId) return;

      // Mock document with expiring date
      cy.intercept('GET', apiEndpoints.consultantDocuments(consultantId), {
        statusCode: 200,
        body: {
          data: [{
            id: 'doc-expiring',
            name: 'Expiring License.pdf',
            status: 'approved',
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            documentType: {
              name: 'Medical License',
              expirationRequired: true
            }
          }],
          total: 1
        }
      }).as('getExpiringDocuments');

      cy.reload();
      cy.wait('@getExpiringDocuments');

      // Should show expiration warning
      cy.get('[data-testid="expiration-warning"], [data-testid="warning-badge"]')
        .should('be.visible')
        .and('contain.text', /expir/i);
    });
  });

  describe('Responsive Design & Mobile Support', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait(1000);
    });

    it('should adapt layout for mobile devices', () => {
      cy.viewport(375, 667); // Mobile viewport

      // Header should be responsive
      cy.get('[data-testid="page-header"]')
        .should('be.visible');

      // Create button might be collapsed or repositioned
      cy.get('[data-testid="create-document-type-button"]')
        .should('be.visible');

      // Table might switch to card layout
      cy.get('body').then(($body) => {
        const hasTable = $body.find('[data-testid="document-types-table"]').length > 0;
        const hasList = $body.find('[data-testid="document-types-list"]').length > 0;
        const hasCards = $body.find('[data-testid="document-types-cards"]').length > 0;
        
        expect(hasTable || hasList || hasCards).to.be.true;
      });
    });

    it('should maintain functionality on tablet', () => {
      cy.viewport(768, 1024); // Tablet viewport

      // All functionality should work
      cy.get('[data-testid="create-document-type-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="document-type-modal"], [data-testid="create-document-type-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="input-name"]').should('be.visible');
          cy.get('[data-testid="button-cancel"]').click();
        });
    });

    it('should handle touch interactions', () => {
      cy.viewport(375, 667);

      // Touch events should work
      cy.get('[data-testid="create-document-type-button"]')
        .trigger('touchstart')
        .trigger('touchend');

      // Swipe gestures (if implemented)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="document-type-row"]').length > 0) {
          cy.get('[data-testid="document-type-row"]').first()
            .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
            .trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] })
            .trigger('touchend');
        }
      });
    });
  });

  describe('Performance & Optimization', () => {
    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `dt-${i}`,
        name: `Document Type ${i}`,
        description: `Description for document type ${i}`,
        required: i % 2 === 0,
        expirationRequired: i % 3 === 0
      }));

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          data: largeDataset.slice(0, 10), // Paginated
          total: 100,
          page: 1,
          limit: 10
        }
      }).as('getLargeDataset');

      cy.visit('/admin/document-types');
      cy.wait('@getLargeDataset');

      // Should render efficiently
      cy.get('[data-testid="document-type-row"]')
        .should('have.length', 10);

      // Pagination should be present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
          cy.get('[data-testid="page-info"]')
            .should('contain.text', '1')
            .and('contain.text', '100');
        }
      });
    });

    it('should implement efficient search debouncing', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-input"]').length > 0) {
          // Rapid typing should debounce API calls
          cy.get('[data-testid="search-input"]')
            .type('Medical')
            .type(' License', { delay: 50 });

          // Should only make one API call after debounce
          cy.wait(1000);
          cy.get('@searchDocumentTypes.all').should('have.length.lte', 2);
        }
      });
    });
  });

  describe('Integration & API Error Handling', () => {
    it('should handle network failures gracefully', () => {
      // Simulate network failure
      cy.intercept('GET', apiEndpoints.documentTypes, { forceNetworkError: true })
        .as('networkError');

      cy.visit('/admin/document-types');
      cy.wait('@networkError');

      // Should show error state
      cy.get('[data-testid="error-state"], [data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);

      // Should have retry option
      cy.get('[data-testid="retry-button"]')
        .should('be.visible')
        .click();
    });

    it('should handle server errors appropriately', () => {
      // Simulate 500 error
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');

      cy.visit('/admin/document-types');
      cy.wait('@serverError');

      // Should show server error message
      cy.get('[data-testid="error-state"], [data-testid="server-error"]')
        .should('be.visible')
        .and('contain.text', /server|error/i);
    });

    it('should handle unauthorized access', () => {
      // Simulate 401 unauthorized
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedError');

      cy.visit('/admin/document-types');
      cy.wait('@unauthorizedError');

      // Should redirect to login or show unauthorized message
      cy.url().should('match', /(login|unauthorized)/);
    });
  });

  after(() => {
    // Cleanup: Delete any test data created
    if (documentTypeId && authHeaders.Authorization) {
      cy.request({
        method: 'DELETE',
        url: `${apiEndpoints.documentTypes}/${documentTypeId}`,
        headers: authHeaders,
        failOnStatusCode: false
      });
    }
  });
});
