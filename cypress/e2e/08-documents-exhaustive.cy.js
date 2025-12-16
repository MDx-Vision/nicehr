describe('Documents Feature - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      email: 'test@example.com'
    },
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    documents: {
      valid: {
        name: 'Test Resume Document',
        description: 'A test resume for validation',
        type: 'Resume',
        status: 'Pending'
      },
      invalid: {
        name: '',
        description: 'A' + 'x'.repeat(5000), // Too long
        type: ''
      },
      update: {
        name: 'Updated Document Name',
        description: 'Updated description',
        status: 'Approved'
      }
    },
    documentTypes: {
      valid: {
        name: 'Certification',
        description: 'Professional certifications',
        required: true,
        expiresAfter: 365
      },
      invalid: {
        name: '',
        description: '',
        expiresAfter: -1
      }
    },
    files: {
      valid: {
        pdf: 'sample-resume.pdf',
        doc: 'sample-document.doc',
        image: 'sample-image.jpg'
      },
      invalid: {
        executable: 'malware.exe',
        oversized: 'huge-file.pdf'
      }
    }
  };

  const apiEndpoints = {
    consultantDocuments: `/api/consultants/${testData.consultant.id}/documents`,
    documentTypes: '/api/document-types',
    documentStatus: (id) => `/api/documents/${id}/status`,
    uploadObjects: '/api/objects/upload'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for authentication
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Document Types Management', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait(1000);
    });

    describe('Document Types List Page', () => {
      it('should display document types list with all UI components', () => {
        // Page header and title
        cy.get('h1, h2').should('contain.text', /document.*type/i);
        
        // Add new button
        cy.get('[data-testid="add-document-type-button"]')
          .or('button').contains(/add|new.*type/i)
          .should('be.visible');

        // Search and filters
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="search-document-types"]').length > 0) {
            cy.get('[data-testid="search-document-types"]').should('be.visible');
          }
        });

        // Table or grid view
        cy.get('[data-testid="document-types-list"]')
          .or('table, [role="table"], .grid')
          .should('be.visible');
      });

      it('should handle empty state when no document types exist', () => {
        cy.intercept('GET', apiEndpoints.documentTypes, { fixture: 'empty-list.json' }).as('getEmptyDocumentTypes');
        
        cy.reload();
        cy.wait('@getEmptyDocumentTypes');

        cy.get('[data-testid="empty-state"]')
          .or('div').contains(/no.*document.*type/i)
          .should('be.visible');
      });

      it('should implement search functionality', () => {
        const searchTerm = 'Resume';
        
        cy.intercept('GET', `${apiEndpoints.documentTypes}*`, { fixture: 'document-types.json' }).as('searchDocumentTypes');
        
        cy.get('[data-testid="search-document-types"]')
          .or('input[placeholder*="search"]')
          .type(searchTerm);
        
        cy.wait('@searchDocumentTypes');
        
        // Verify filtered results
        cy.get('[data-testid="document-type-item"]')
          .or('.document-type-card, tr')
          .should('contain.text', searchTerm);
      });

      it('should handle API errors gracefully', () => {
        cy.intercept('GET', apiEndpoints.documentTypes, { statusCode: 500 }).as('getDocumentTypesError');
        
        cy.reload();
        cy.wait('@getDocumentTypesError');

        cy.get('[data-testid="error-message"]')
          .or('.error, .alert-error')
          .should('be.visible')
          .and('contain.text', /error|failed/i);
      });
    });

    describe('Create Document Type', () => {
      beforeEach(() => {
        cy.get('[data-testid="add-document-type-button"]')
          .or('button').contains(/add|new.*type/i)
          .click();
      });

      it('should display create document type form with all fields', () => {
        // Form container
        cy.get('[data-testid="document-type-form"]')
          .or('form')
          .should('be.visible');

        // Required fields
        cy.get('[data-testid="input-type-name"]')
          .or('input[name="name"]')
          .should('be.visible')
          .and('have.attr', 'required');

        cy.get('[data-testid="input-type-description"]')
          .or('textarea[name="description"]')
          .should('be.visible');

        // Boolean fields
        cy.get('[data-testid="checkbox-required"]')
          .or('input[type="checkbox"][name="required"]')
          .should('exist');

        // Numeric fields
        cy.get('[data-testid="input-expires-after"]')
          .or('input[name="expiresAfter"]')
          .should('be.visible');

        // Action buttons
        cy.get('[data-testid="button-save-type"]')
          .or('button[type="submit"]')
          .should('be.visible')
          .and('contain.text', /save|create/i);

        cy.get('[data-testid="button-cancel"]')
          .or('button').contains(/cancel/i)
          .should('be.visible');
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="button-save-type"]')
          .or('button[type="submit"]')
          .click();

        // Check for validation messages
        cy.get('[data-testid="error-type-name"]')
          .or('.error, .invalid-feedback')
          .should('be.visible')
          .and('contain.text', /required|name/i);
      });

      it('should validate field lengths and formats', () => {
        // Test name length validation
        cy.get('[data-testid="input-type-name"]')
          .or('input[name="name"]')
          .type('x'.repeat(256));

        cy.get('[data-testid="input-type-description"]')
          .or('textarea[name="description"]')
          .type('x'.repeat(5000));

        cy.get('[data-testid="input-expires-after"]')
          .or('input[name="expiresAfter"]')
          .type('-1');

        cy.get('[data-testid="button-save-type"]')
          .or('button[type="submit"]')
          .click();

        // Validate error messages appear
        cy.get('.error, .invalid-feedback')
          .should('have.length.gte', 1);
      });

      it('should successfully create a new document type', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 201,
          body: { id: '1', ...testData.documentTypes.valid }
        }).as('createDocumentType');

        // Fill form with valid data
        cy.get('[data-testid="input-type-name"]')
          .or('input[name="name"]')
          .type(testData.documentTypes.valid.name);

        cy.get('[data-testid="input-type-description"]')
          .or('textarea[name="description"]')
          .type(testData.documentTypes.valid.description);

        if (testData.documentTypes.valid.required) {
          cy.get('[data-testid="checkbox-required"]')
            .or('input[type="checkbox"][name="required"]')
            .check();
        }

        cy.get('[data-testid="input-expires-after"]')
          .or('input[name="expiresAfter"]')
          .clear()
          .type(testData.documentTypes.valid.expiresAfter.toString());

        // Submit form
        cy.get('[data-testid="button-save-type"]')
          .or('button[type="submit"]')
          .click();

        cy.wait('@createDocumentType');

        // Verify success
        cy.get('[data-testid="success-message"]')
          .or('.success, .alert-success')
          .should('be.visible')
          .and('contain.text', /created|success/i);

        // Should redirect to list
        cy.url().should('include', '/document-types');
      });

      it('should handle server errors during creation', () => {
        cy.intercept('POST', apiEndpoints.documentTypes, {
          statusCode: 400,
          body: { error: 'Document type already exists' }
        }).as('createDocumentTypeError');

        // Fill and submit form
        cy.get('[data-testid="input-type-name"]')
          .or('input[name="name"]')
          .type(testData.documentTypes.valid.name);

        cy.get('[data-testid="button-save-type"]')
          .or('button[type="submit"]')
          .click();

        cy.wait('@createDocumentTypeError');

        cy.get('[data-testid="error-message"]')
          .or('.error, .alert-error')
          .should('be.visible')
          .and('contain.text', /already exists|error/i);
      });

      it('should cancel creation and return to list', () => {
        // Fill some data
        cy.get('[data-testid="input-type-name"]')
          .or('input[name="name"]')
          .type('Test Type');

        // Cancel
        cy.get('[data-testid="button-cancel"]')
          .or('button').contains(/cancel/i)
          .click();

        // Should return to list without saving
        cy.url().should('include', '/document-types');
        cy.url().should('not.include', '/new');
      });
    });
  });

  describe('Consultant Documents Management', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait(1000);
    });

    describe('Documents List Page', () => {
      it('should display documents list with all UI components', () => {
        // Page header
        cy.get('h1, h2').should('contain.text', /document/i);
        
        // Upload button
        cy.get('[data-testid="upload-document-button"]')
          .or('button').contains(/upload|add.*document/i)
          .should('be.visible');

        // Documents grid/list
        cy.get('[data-testid="documents-list"]')
          .or('.documents-grid, table')
          .should('be.visible');

        // Filter options
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="filter-documents"]').length > 0) {
            cy.get('[data-testid="filter-documents"]').should('be.visible');
          }
        });
      });

      it('should display document cards with all required information', () => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { fixture: 'consultant-documents.json' }).as('getDocuments');
        
        cy.wait('@getDocuments');

        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .first()
          .within(() => {
            // Document name
            cy.get('[data-testid="document-name"]')
              .or('.document-title, .name')
              .should('be.visible');

            // Document type
            cy.get('[data-testid="document-type"]')
              .or('.document-type, .type')
              .should('be.visible');

            // Status indicator
            cy.get('[data-testid="document-status"]')
              .or('.status, .badge')
              .should('be.visible');

            // Action buttons
            cy.get('[data-testid="button-view-document"]')
              .or('button').contains(/view|open/i)
              .should('be.visible');
          });
      });

      it('should filter documents by status', () => {
        const statuses = ['Pending', 'Approved', 'Rejected'];
        
        statuses.forEach(status => {
          cy.intercept('GET', `${apiEndpoints.consultantDocuments}*status=${status}*`, {
            fixture: `documents-${status.toLowerCase()}.json`
          }).as(`getDocuments${status}`);
          
          cy.get('[data-testid="filter-status"]')
            .or('select[name="status"]')
            .select(status);
          
          cy.wait(`@getDocuments${status}`);
          
          // Verify filtered results
          cy.get('[data-testid="document-status"]')
            .or('.status')
            .each(($el) => {
              cy.wrap($el).should('contain.text', status);
            });
        });
      });

      it('should filter documents by type', () => {
        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*type=Resume*`, {
          fixture: 'documents-resume.json'
        }).as('getResumeDocuments');
        
        cy.get('[data-testid="filter-type"]')
          .or('select[name="type"]')
          .select('Resume');
        
        cy.wait('@getResumeDocuments');
        
        cy.get('[data-testid="document-type"]')
          .or('.document-type')
          .each(($el) => {
            cy.wrap($el).should('contain.text', 'Resume');
          });
      });

      it('should handle empty state when no documents exist', () => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, []).as('getEmptyDocuments');
        
        cy.reload();
        cy.wait('@getEmptyDocuments');

        cy.get('[data-testid="empty-documents-state"]')
          .or('div').contains(/no.*document/i)
          .should('be.visible');

        // Should show upload button prominently
        cy.get('[data-testid="upload-first-document"]')
          .or('button').contains(/upload|add/i)
          .should('be.visible');
      });

      it('should implement search functionality', () => {
        const searchTerm = 'resume';
        
        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*search=${searchTerm}*`, {
          fixture: 'documents-search-results.json'
        }).as('searchDocuments');
        
        cy.get('[data-testid="search-documents"]')
          .or('input[placeholder*="search"]')
          .type(searchTerm);
        
        cy.wait('@searchDocuments');
        
        cy.get('[data-testid="document-card"]')
          .should('contain.text', searchTerm);
      });
    });

    describe('Document Upload', () => {
      beforeEach(() => {
        cy.get('[data-testid="upload-document-button"]')
          .or('button').contains(/upload|add.*document/i)
          .click();
      });

      it('should display upload form with all required fields', () => {
        // Form container
        cy.get('[data-testid="upload-document-form"]')
          .or('form')
          .should('be.visible');

        // File input
        cy.get('[data-testid="input-document-file"]')
          .or('input[type="file"]')
          .should('be.visible');

        // Document details
        cy.get('[data-testid="input-document-name"]')
          .or('input[name="name"]')
          .should('be.visible');

        cy.get('[data-testid="select-document-type"]')
          .or('select[name="type"]')
          .should('be.visible');

        cy.get('[data-testid="input-document-description"]')
          .or('textarea[name="description"]')
          .should('be.visible');

        // Action buttons
        cy.get('[data-testid="button-upload-document"]')
          .or('button[type="submit"]')
          .should('be.visible');

        cy.get('[data-testid="button-cancel-upload"]')
          .or('button').contains(/cancel/i)
          .should('be.visible');
      });

      it('should validate required fields before upload', () => {
        cy.get('[data-testid="button-upload-document"]')
          .or('button[type="submit"]')
          .click();

        // Should show validation errors
        cy.get('.error, .invalid-feedback')
          .should('have.length.gte', 1);
      });

      it('should validate file type restrictions', () => {
        // Try to upload an invalid file type
        cy.fixture('files/test-executable.exe', 'base64').then(fileContent => {
          cy.get('[data-testid="input-document-file"]')
            .or('input[type="file"]')
            .selectFile({
              contents: Cypress.Buffer.from(fileContent, 'base64'),
              fileName: 'malware.exe',
              mimeType: 'application/x-executable'
            }, { force: true });
        });

        cy.get('[data-testid="file-type-error"]')
          .or('.error').contains(/file.*type|invalid.*format/i)
          .should('be.visible');
      });

      it('should validate file size restrictions', () => {
        // Mock a large file
        const largeFileContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
        
        cy.get('[data-testid="input-document-file"]')
          .or('input[type="file"]')
          .selectFile({
            contents: largeFileContent,
            fileName: 'huge-file.pdf',
            mimeType: 'application/pdf'
          }, { force: true });

        cy.get('[data-testid="file-size-error"]')
          .or('.error').contains(/file.*size|too.*large/i)
          .should('be.visible');
      });

      it('should successfully upload a document with valid data', () => {
        cy.intercept('POST', apiEndpoints.uploadObjects, {
          statusCode: 200,
          body: { url: 'https://example.com/document.pdf' }
        }).as('uploadFile');

        cy.intercept('POST', apiEndpoints.consultantDocuments, {
          statusCode: 201,
          body: {
            id: '1',
            name: testData.documents.valid.name,
            type: testData.documents.valid.type,
            status: 'Pending',
            url: 'https://example.com/document.pdf'
          }
        }).as('createDocument');

        // Upload file
        cy.fixture('files/sample-resume.pdf', 'base64').then(fileContent => {
          cy.get('[data-testid="input-document-file"]')
            .or('input[type="file"]')
            .selectFile({
              contents: Cypress.Buffer.from(fileContent, 'base64'),
              fileName: 'sample-resume.pdf',
              mimeType: 'application/pdf'
            }, { force: true });
        });

        // Fill form fields
        cy.get('[data-testid="input-document-name"]')
          .or('input[name="name"]')
          .type(testData.documents.valid.name);

        cy.get('[data-testid="select-document-type"]')
          .or('select[name="type"]')
          .select(testData.documents.valid.type);

        cy.get('[data-testid="input-document-description"]')
          .or('textarea[name="description"]')
          .type(testData.documents.valid.description);

        // Submit upload
        cy.get('[data-testid="button-upload-document"]')
          .or('button[type="submit"]')
          .click();

        cy.wait('@uploadFile');
        cy.wait('@createDocument');

        // Verify success
        cy.get('[data-testid="upload-success-message"]')
          .or('.success, .alert-success')
          .should('be.visible')
          .and('contain.text', /uploaded|success/i);

        // Should return to documents list
        cy.url().should('include', '/documents');
        cy.url().should('not.include', '/upload');
      });

      it('should show upload progress', () => {
        cy.fixture('files/sample-resume.pdf', 'base64').then(fileContent => {
          cy.get('[data-testid="input-document-file"]')
            .or('input[type="file"]')
            .selectFile({
              contents: Cypress.Buffer.from(fileContent, 'base64'),
              fileName: 'sample-resume.pdf',
              mimeType: 'application/pdf'
            }, { force: true });
        });

        // Fill required fields
        cy.get('[data-testid="input-document-name"]')
          .or('input[name="name"]')
          .type(testData.documents.valid.name);

        cy.get('[data-testid="select-document-type"]')
          .or('select[name="type"]')
          .select(testData.documents.valid.type);

        // Intercept with delay to see progress
        cy.intercept('POST', apiEndpoints.uploadObjects, (req) => {
          req.reply((res) => {
            res.delay(1000);
            res.send({ statusCode: 200, body: { url: 'https://example.com/document.pdf' } });
          });
        }).as('slowUpload');

        cy.get('[data-testid="button-upload-document"]')
          .or('button[type="submit"]')
          .click();

        // Should show progress indicator
        cy.get('[data-testid="upload-progress"]')
          .or('.progress, .loading, .spinner')
          .should('be.visible');

        // Button should be disabled during upload
        cy.get('[data-testid="button-upload-document"]')
          .or('button[type="submit"]')
          .should('be.disabled');
      });

      it('should handle upload errors gracefully', () => {
        cy.intercept('POST', apiEndpoints.uploadObjects, {
          statusCode: 500,
          body: { error: 'Upload failed' }
        }).as('uploadError');

        cy.fixture('files/sample-resume.pdf', 'base64').then(fileContent => {
          cy.get('[data-testid="input-document-file"]')
            .or('input[type="file"]')
            .selectFile({
              contents: Cypress.Buffer.from(fileContent, 'base64'),
              fileName: 'sample-resume.pdf',
              mimeType: 'application/pdf'
            }, { force: true });
        });

        cy.get('[data-testid="input-document-name"]')
          .or('input[name="name"]')
          .type(testData.documents.valid.name);

        cy.get('[data-testid="select-document-type"]')
          .or('select[name="type"]')
          .select(testData.documents.valid.type);

        cy.get('[data-testid="button-upload-document"]')
          .or('button[type="submit"]')
          .click();

        cy.wait('@uploadError');

        cy.get('[data-testid="upload-error-message"]')
          .or('.error, .alert-error')
          .should('be.visible')
          .and('contain.text', /upload.*failed|error/i);

        // Form should remain open for retry
        cy.get('[data-testid="upload-document-form"]')
          .or('form')
          .should('be.visible');
      });

      it('should cancel upload and return to list', () => {
        // Start filling form
        cy.get('[data-testid="input-document-name"]')
          .or('input[name="name"]')
          .type('Test Document');

        // Cancel
        cy.get('[data-testid="button-cancel-upload"]')
          .or('button').contains(/cancel/i)
          .click();

        // Should return to list
        cy.url().should('include', '/documents');
        cy.url().should('not.include', '/upload');
      });
    });

    describe('Document Details and Management', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { fixture: 'consultant-documents.json' }).as('getDocuments');
        cy.wait('@getDocuments');
        
        // Click on first document
        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .first()
          .click();
      });

      it('should display document details modal/page', () => {
        // Modal or details container
        cy.get('[data-testid="document-details-modal"]')
          .or('.modal, .document-details')
          .should('be.visible');

        // Document information
        cy.get('[data-testid="document-title"]')
          .or('h1, h2, .title')
          .should('be.visible');

        cy.get('[data-testid="document-type-display"]')
          .or('.document-type')
          .should('be.visible');

        cy.get('[data-testid="document-status-display"]')
          .or('.status')
          .should('be.visible');

        // Action buttons
        cy.get('[data-testid="button-download-document"]')
          .or('button').contains(/download/i)
          .should('be.visible');

        cy.get('[data-testid="button-edit-document"]')
          .or('button').contains(/edit/i)
          .should('be.visible');

        cy.get('[data-testid="button-delete-document"]')
          .or('button').contains(/delete/i)
          .should('be.visible');
      });

      it('should allow document download', () => {
        cy.window().then((win) => {
          cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('[data-testid="button-download-document"]')
          .or('button').contains(/download/i)
          .click();

        cy.get('@windowOpen').should('have.been.calledWith', Cypress.sinon.match.string);
      });

      it('should edit document details', () => {
        cy.get('[data-testid="button-edit-document"]')
          .or('button').contains(/edit/i)
          .click();

        // Edit form should appear
        cy.get('[data-testid="edit-document-form"]')
          .or('form')
          .should('be.visible');

        // Update fields
        cy.get('[data-testid="input-edit-document-name"]')
          .or('input[name="name"]')
          .clear()
          .type(testData.documents.update.name);

        cy.get('[data-testid="input-edit-document-description"]')
          .or('textarea[name="description"]')
          .clear()
          .type(testData.documents.update.description);

        // Save changes
        cy.intercept('PATCH', '/api/documents/*/status', {
          statusCode: 200,
          body: { ...testData.documents.update }
        }).as('updateDocument');

        cy.get('[data-testid="button-save-document-changes"]')
          .or('button').contains(/save|update/i)
          .click();

        cy.wait('@updateDocument');

        // Verify success
        cy.get('[data-testid="update-success-message"]')
          .or('.success')
          .should('be.visible');
      });

      it('should delete document with confirmation', () => {
        cy.get('[data-testid="button-delete-document"]')
          .or('button').contains(/delete/i)
          .click();

        // Confirmation dialog should appear
        cy.get('[data-testid="delete-confirmation-dialog"]')
          .or('.modal, .dialog')
          .should('be.visible');

        cy.get('[data-testid="confirm-delete-text"]')
          .or('p, div').contains(/confirm|delete|sure/i)
          .should('be.visible');

        // Cancel first
        cy.get('[data-testid="button-cancel-delete"]')
          .or('button').contains(/cancel|no/i)
          .click();

        cy.get('[data-testid="delete-confirmation-dialog"]')
          .should('not.exist');

        // Try delete again and confirm
        cy.get('[data-testid="button-delete-document"]')
          .or('button').contains(/delete/i)
          .click();

        cy.intercept('DELETE', '/api/documents/*', {
          statusCode: 200
        }).as('deleteDocument');

        cy.get('[data-testid="button-confirm-delete"]')
          .or('button').contains(/delete|yes|confirm/i)
          .click();

        cy.wait('@deleteDocument');

        // Should return to list
        cy.url().should('include', '/documents');
        
        // Success message
        cy.get('[data-testid="delete-success-message"]')
          .or('.success')
          .should('be.visible');
      });

      it('should close details modal/view', () => {
        cy.get('[data-testid="button-close-details"]')
          .or('button').contains(/close/i)
          .or('.close, [aria-label="close"]')
          .click();

        cy.get('[data-testid="document-details-modal"]')
          .or('.modal')
          .should('not.exist');
      });
    });

    describe('Document Status Management (Admin)', () => {
      it('should allow admin to approve documents', () => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { fixture: 'pending-documents.json' }).as('getPendingDocs');
        cy.wait('@getPendingDocs');

        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .contains('.status', 'Pending')
          .parent()
          .within(() => {
            cy.get('[data-testid="button-approve-document"]')
              .or('button').contains(/approve/i)
              .should('be.visible')
              .click();
          });

        // Confirmation dialog
        cy.get('[data-testid="approve-confirmation"]')
          .or('.modal')
          .should('be.visible');

        cy.intercept('PATCH', apiEndpoints.documentStatus('*'), {
          statusCode: 200,
          body: { status: 'Approved' }
        }).as('approveDocument');

        cy.get('[data-testid="button-confirm-approve"]')
          .or('button').contains(/approve|yes/i)
          .click();

        cy.wait('@approveDocument');

        // Status should update
        cy.get('[data-testid="document-status"]')
          .or('.status')
          .should('contain.text', 'Approved');
      });

      it('should allow admin to reject documents with reason', () => {
        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .contains('.status', 'Pending')
          .parent()
          .within(() => {
            cy.get('[data-testid="button-reject-document"]')
              .or('button').contains(/reject/i)
              .click();
          });

        // Rejection dialog with reason
        cy.get('[data-testid="reject-confirmation"]')
          .or('.modal')
          .should('be.visible');

        cy.get('[data-testid="input-rejection-reason"]')
          .or('textarea[name="reason"]')
          .type('Document quality is insufficient');

        cy.intercept('PATCH', apiEndpoints.documentStatus('*'), {
          statusCode: 200,
          body: { status: 'Rejected', rejectionReason: 'Document quality is insufficient' }
        }).as('rejectDocument');

        cy.get('[data-testid="button-confirm-reject"]')
          .or('button').contains(/reject|submit/i)
          .click();

        cy.wait('@rejectDocument');

        // Status should update
        cy.get('[data-testid="document-status"]')
          .or('.status')
          .should('contain.text', 'Rejected');
      });

      it('should validate rejection reason is required', () => {
        cy.get('[data-testid="button-reject-document"]')
          .or('button').contains(/reject/i)
          .first()
          .click();

        cy.get('[data-testid="button-confirm-reject"]')
          .or('button').contains(/reject|submit/i)
          .click();

        cy.get('[data-testid="rejection-reason-error"]')
          .or('.error')
          .should('be.visible')
          .and('contain.text', /reason.*required/i);
      });

      it('should bulk approve multiple documents', () => {
        // Select multiple documents
        cy.get('[data-testid="document-checkbox"]')
          .or('input[type="checkbox"]')
          .check({ multiple: true });

        cy.get('[data-testid="button-bulk-approve"]')
          .or('button').contains(/bulk.*approve/i)
          .should('be.visible')
          .click();

        cy.intercept('PATCH', '/api/documents/bulk/approve', {
          statusCode: 200,
          body: { approved: 3 }
        }).as('bulkApprove');

        cy.get('[data-testid="button-confirm-bulk-approve"]')
          .or('button').contains(/approve.*all/i)
          .click();

        cy.wait('@bulkApprove');

        cy.get('[data-testid="bulk-approve-success"]')
          .or('.success')
          .should('be.visible')
          .and('contain.text', /approved.*3/i);
      });
    });

    describe('Document Filtering and Sorting', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { fixture: 'consultant-documents.json' }).as('getDocuments');
        cy.wait('@getDocuments');
      });

      it('should sort documents by name', () => {
        cy.get('[data-testid="sort-by-name"]')
          .or('button').contains(/sort.*name/i)
          .click();

        // Verify documents are sorted alphabetically
        cy.get('[data-testid="document-name"]')
          .or('.document-title')
          .then($names => {
            const names = Array.from($names).map(el => el.textContent);
            const sortedNames = [...names].sort();
            expect(names).to.deep.equal(sortedNames);
          });
      });

      it('should sort documents by date', () => {
        cy.get('[data-testid="sort-by-date"]')
          .or('button').contains(/sort.*date/i)
          .click();

        // Verify documents are sorted by date
        cy.get('[data-testid="document-date"]')
          .or('.document-date')
          .then($dates => {
            const dates = Array.from($dates).map(el => new Date(el.textContent));
            const sortedDates = [...dates].sort((a, b) => b - a);
            expect(dates.map(d => d.getTime())).to.deep.equal(sortedDates.map(d => d.getTime()));
          });
      });

      it('should filter by multiple criteria', () => {
        // Filter by status and type
        cy.get('[data-testid="filter-status"]')
          .or('select[name="status"]')
          .select('Pending');

        cy.get('[data-testid="filter-type"]')
          .or('select[name="type"]')
          .select('Resume');

        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*status=Pending*type=Resume*`, {
          fixture: 'documents-filtered.json'
        }).as('getFilteredDocuments');

        cy.wait('@getFilteredDocuments');

        // Verify both filters are applied
        cy.get('[data-testid="document-card"]')
          .each($card => {
            cy.wrap($card).within(() => {
              cy.get('[data-testid="document-status"]').should('contain.text', 'Pending');
              cy.get('[data-testid="document-type"]').should('contain.text', 'Resume');
            });
          });
      });

      it('should clear all filters', () => {
        // Apply filters first
        cy.get('[data-testid="filter-status"]')
          .or('select[name="status"]')
          .select('Approved');

        cy.get('[data-testid="search-documents"]')
          .or('input[placeholder*="search"]')
          .type('test');

        // Clear filters
        cy.get('[data-testid="button-clear-filters"]')
          .or('button').contains(/clear.*filter/i)
          .click();

        // Verify filters are reset
        cy.get('[data-testid="filter-status"]')
          .or('select[name="status"]')
          .should('have.value', '');

        cy.get('[data-testid="search-documents"]')
          .or('input[placeholder*="search"]')
          .should('have.value', '');
      });
    });

    describe('Document Pagination', () => {
      beforeEach(() => {
        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*page=1*`, { fixture: 'documents-page-1.json' }).as('getPage1');
        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*page=2*`, { fixture: 'documents-page-2.json' }).as('getPage2');
      });

      it('should display pagination controls when needed', () => {
        cy.wait('@getPage1');

        cy.get('[data-testid="pagination"]')
          .or('.pagination')
          .should('be.visible');

        cy.get('[data-testid="pagination-info"]')
          .or('.pagination-info')
          .should('contain.text', /showing.*of/i);

        cy.get('[data-testid="button-next-page"]')
          .or('button').contains(/next/i)
          .should('be.visible')
          .and('not.be.disabled');
      });

      it('should navigate to next page', () => {
        cy.wait('@getPage1');

        cy.get('[data-testid="button-next-page"]')
          .or('button').contains(/next/i)
          .click();

        cy.wait('@getPage2');

        cy.url().should('include', 'page=2');

        // Previous button should now be enabled
        cy.get('[data-testid="button-prev-page"]')
          .or('button').contains(/prev/i)
          .should('be.visible')
          .and('not.be.disabled');
      });

      it('should change page size', () => {
        cy.get('[data-testid="select-page-size"]')
          .or('select[name="pageSize"]')
          .select('50');

        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*limit=50*`, {
          fixture: 'documents-page-size-50.json'
        }).as('getPageSize50');

        cy.wait('@getPageSize50');

        cy.url().should('include', 'limit=50');
      });
    });

    describe('Document Accessibility', () => {
      it('should have proper keyboard navigation', () => {
        cy.get('[data-testid="upload-document-button"]')
          .or('button').contains(/upload/i)
          .focus()
          .should('be.focused');

        // Tab through documents
        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .first()
          .focus()
          .should('be.focused');

        // Enter should open document
        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .first()
          .type('{enter}');

        cy.get('[data-testid="document-details-modal"]')
          .or('.modal')
          .should('be.visible');
      });

      it('should have proper ARIA labels and roles', () => {
        // Check main container
        cy.get('[data-testid="documents-list"]')
          .or('.documents-grid')
          .should('have.attr', 'role', 'grid')
          .or('have.attr', 'aria-label');

        // Check document cards
        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .first()
          .should('have.attr', 'role')
          .and('have.attr', 'aria-label');

        // Check buttons
        cy.get('[data-testid="button-upload-document"]')
          .or('button').contains(/upload/i)
          .should('have.attr', 'aria-label');
      });

      it('should support screen reader announcements', () => {
        // Status changes should be announced
        cy.get('[data-testid="button-approve-document"]')
          .or('button').contains(/approve/i)
          .first()
          .click();

        cy.get('[aria-live="polite"]')
          .or('[role="status"]')
          .should('exist');
      });
    });

    describe('Mobile Responsiveness', () => {
      beforeEach(() => {
        cy.viewport(375, 667); // iPhone SE
      });

      it('should display mobile-friendly layout', () => {
        // Documents should stack vertically on mobile
        cy.get('[data-testid="documents-list"]')
          .or('.documents-grid')
          .should('be.visible');

        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .should('have.css', 'width')
          .and('match', /100%|[3-9][0-9]%/);
      });

      it('should have mobile-friendly upload button', () => {
        cy.get('[data-testid="upload-document-button"]')
          .or('button').contains(/upload/i)
          .should('be.visible')
          .and('have.css', 'width')
          .and('match', /100%|[7-9][0-9]%/);
      });

      it('should handle mobile file selection', () => {
        cy.get('[data-testid="upload-document-button"]')
          .or('button').contains(/upload/i)
          .click();

        cy.get('[data-testid="input-document-file"]')
          .or('input[type="file"]')
          .should('be.visible');
      });
    });

    describe('Error Handling', () => {
      it('should handle network errors gracefully', () => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { forceNetworkError: true }).as('networkError');
        
        cy.reload();
        cy.wait('@networkError');

        cy.get('[data-testid="network-error-message"]')
          .or('.error').contains(/network|connection/i)
          .should('be.visible');

        // Retry button should be available
        cy.get('[data-testid="button-retry"]')
          .or('button').contains(/retry|reload/i)
          .should('be.visible');
      });

      it('should handle server errors gracefully', () => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { statusCode: 500 }).as('serverError');
        
        cy.reload();
        cy.wait('@serverError');

        cy.get('[data-testid="server-error-message"]')
          .or('.error').contains(/server.*error|something.*wrong/i)
          .should('be.visible');
      });

      it('should handle unauthorized access', () => {
        cy.intercept('GET', apiEndpoints.consultantDocuments, { statusCode: 401 }).as('unauthorized');
        
        cy.reload();
        cy.wait('@unauthorized');

        // Should redirect to login or show auth error
        cy.url().should('satisfy', url => 
          url.includes('/login') || url.includes('/unauthorized')
        );
      });
    });

    describe('Performance', () => {
      it('should load documents efficiently', () => {
        const startTime = performance.now();
        
        cy.intercept('GET', apiEndpoints.consultantDocuments, { fixture: 'consultant-documents.json' }).as('getDocuments');
        cy.visit(`/consultants/${testData.consultant.id}/documents`);
        
        cy.wait('@getDocuments').then(() => {
          const loadTime = performance.now() - startTime;
          expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
        });

        cy.get('[data-testid="documents-list"]')
          .or('.documents-grid')
          .should('be.visible');
      });

      it('should implement lazy loading for large document lists', () => {
        // Mock large dataset
        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*page=1*`, { 
          fixture: 'documents-large-page-1.json' 
        }).as('getInitialDocs');

        cy.visit(`/consultants/${testData.consultant.id}/documents`);
        cy.wait('@getInitialDocs');

        // Should load more on scroll
        cy.intercept('GET', `${apiEndpoints.consultantDocuments}*page=2*`, { 
          fixture: 'documents-large-page-2.json' 
        }).as('getMoreDocs');

        cy.scrollTo('bottom');
        cy.wait('@getMoreDocs');

        // Document count should increase
        cy.get('[data-testid="document-card"]')
          .or('.document-item')
          .should('have.length.gte', 20);
      });
    });
  });
});
