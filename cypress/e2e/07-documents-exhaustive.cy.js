describe('Documents System - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    documents: {
      valid: {
        title: 'Test Document',
        description: 'Test document description',
        type: 'resume',
        expirationDate: '2024-12-31'
      },
      invalid: {
        emptyTitle: '',
        longTitle: 'a'.repeat(256),
        pastDate: '2020-01-01',
        invalidDate: 'invalid-date'
      }
    },
    files: {
      valid: {
        pdf: 'test-document.pdf',
        doc: 'test-document.docx',
        image: 'test-image.jpg'
      },
      invalid: {
        oversized: 'oversized-file.pdf', // > 10MB
        wrongType: 'test-script.js'
      }
    }
  };

  const apiEndpoints = {
    consultants: '/api/consultants',
    documents: '/api/consultants/*/documents',
    documentTypes: '/api/document-types',
    upload: '/api/objects/upload',
    updateDocuments: '/api/consultants/*/documents'
  };

  beforeEach(() => {
    // Login as admin user
    cy.loginAsAdmin();
    
    // Set up API interceptors
    cy.intercept('GET', '/api/consultants/*/documents').as('getDocuments');
    cy.intercept('POST', '/api/consultants/*/documents').as('createDocument');
    cy.intercept('PATCH', '/api/documents/*/status').as('updateDocumentStatus');
    cy.intercept('GET', '/api/document-types').as('getDocumentTypes');
    cy.intercept('POST', '/api/objects/upload').as('uploadFile');
    cy.intercept('PUT', '/api/consultants/*/documents').as('updateDocuments');
    cy.intercept('GET', '/api/consultants/*').as('getConsultant');
  });

  describe('Document Types Management', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
    });

    it('should display document types page layout', () => {
      cy.wait('@getDocumentTypes');
      
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /document types/i);
      
      // Action buttons
      cy.get('[data-testid="button-add-document-type"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      // Document types list/table
      cy.get('[data-testid="document-types-table"]', { timeout: 10000 })
        .should('be.visible');
      
      // Table headers
      cy.get('thead').within(() => {
        cy.contains('Name').should('be.visible');
        cy.contains('Description').should('be.visible');
        cy.contains('Required').should('be.visible');
        cy.contains('Actions').should('be.visible');
      });
    });

    it('should create new document type successfully', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Modal/form should appear
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      
      // Fill form
      cy.get('[data-testid="input-name"]').type('Test Certificate');
      cy.get('[data-testid="input-description"]').type('Test certificate description');
      cy.get('[data-testid="checkbox-required"]').check();
      cy.get('[data-testid="checkbox-expires"]').check();
      
      // Submit
      cy.get('[data-testid="button-save-document-type"]').click();
      
      cy.wait('@createDocument').its('response.statusCode').should('eq', 201);
      
      // Verify in list
      cy.get('[data-testid="document-types-table"]')
        .should('contain', 'Test Certificate');
    });

    it('should validate document type form fields', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      
      // Try to submit empty form
      cy.get('[data-testid="button-save-document-type"]').click();
      
      // Check validation messages
      cy.get('[data-testid="error-name"]').should('contain', 'required');
      cy.get('[data-testid="error-description"]').should('contain', 'required');
      
      // Test field limits
      cy.get('[data-testid="input-name"]').type('a'.repeat(256));
      cy.get('[data-testid="error-name"]').should('contain', 'too long');
      
      cy.get('[data-testid="input-description"]').type('a'.repeat(1001));
      cy.get('[data-testid="error-description"]').should('contain', 'too long');
    });

    it('should handle duplicate document type names', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      
      cy.get('[data-testid="input-name"]').type('Resume'); // Assuming this exists
      cy.get('[data-testid="input-description"]').type('Duplicate test');
      
      cy.get('[data-testid="button-save-document-type"]').click();
      
      // Should show error for duplicate
      cy.get('[data-testid="error-message"]')
        .should('contain', /already exists|duplicate/i);
    });

    it('should edit existing document type', () => {
      // Find first document type and edit
      cy.get('[data-testid="document-type-row"]').first().within(() => {
        cy.get('[data-testid="button-edit"]').click();
      });
      
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      
      // Update fields
      cy.get('[data-testid="input-description"]')
        .clear()
        .type('Updated description');
      
      cy.get('[data-testid="button-save-document-type"]').click();
      
      // Verify update
      cy.get('[data-testid="success-message"]')
        .should('contain', /updated|saved/i);
    });

    it('should delete document type with confirmation', () => {
      cy.get('[data-testid="document-type-row"]').first().within(() => {
        cy.get('[data-testid="button-delete"]').click();
      });
      
      // Confirmation dialog
      cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.get('[data-testid="success-message"]')
        .should('contain', /deleted/i);
    });

    it('should handle empty state when no document types exist', () => {
      // Mock empty response
      cy.intercept('GET', '/api/document-types', { body: [] }).as('getEmptyTypes');
      cy.reload();
      cy.wait('@getEmptyTypes');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]')
        .should('contain', 'No document types found');
    });
  });

  describe('Consultant Documents Page', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should display consultant documents page layout', () => {
      cy.wait('@getDocuments');
      
      // Page header with consultant info
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('[data-testid="consultant-name"]')
        .should('contain', testData.consultant.name);
      
      // Documents section
      cy.get('[data-testid="documents-section"]').should('be.visible');
      
      // Upload button
      cy.get('[data-testid="button-upload-document"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      // Document filters/search
      cy.get('[data-testid="document-filters"]').should('be.visible');
      cy.get('[data-testid="search-documents"]').should('be.visible');
    });

    it('should display documents in grid/list view', () => {
      cy.wait('@getDocuments');
      
      // Check for documents container
      cy.get('[data-testid="documents-grid"]').should('be.visible');
      
      // View toggle buttons
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      
      // Switch to list view
      cy.get('[data-testid="button-list-view"]').click();
      cy.get('[data-testid="documents-list"]').should('be.visible');
      
      // Switch back to grid view
      cy.get('[data-testid="button-grid-view"]').click();
      cy.get('[data-testid="documents-grid"]').should('be.visible');
    });

    it('should show document cards with complete information', () => {
      cy.wait('@getDocuments');
      
      cy.get('[data-testid="document-card"]').first().within(() => {
        // Document title
        cy.get('[data-testid="document-title"]').should('be.visible');
        
        // Document type
        cy.get('[data-testid="document-type"]').should('be.visible');
        
        // Status indicator
        cy.get('[data-testid="document-status"]').should('be.visible');
        
        // Upload date
        cy.get('[data-testid="upload-date"]').should('be.visible');
        
        // Expiration date (if applicable)
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="expiration-date"]').length > 0) {
            cy.get('[data-testid="expiration-date"]').should('be.visible');
          }
        });
        
        // Action buttons
        cy.get('[data-testid="button-view"]').should('be.visible');
        cy.get('[data-testid="button-download"]').should('be.visible');
        cy.get('[data-testid="button-actions"]').should('be.visible');
      });
    });

    it('should filter documents by type', () => {
      cy.wait('@getDocuments');
      
      // Select filter
      cy.get('[data-testid="filter-document-type"]').click();
      cy.get('[data-testid="option-resume"]').click();
      
      // Verify filtered results
      cy.get('[data-testid="document-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="document-type"]').should('contain', 'Resume');
        });
      });
      
      // Clear filter
      cy.get('[data-testid="button-clear-filters"]').click();
      cy.get('[data-testid="document-card"]').should('have.length.at.least', 1);
    });

    it('should filter documents by status', () => {
      cy.wait('@getDocuments');
      
      // Filter by pending
      cy.get('[data-testid="filter-status"]').select('pending');
      
      cy.get('[data-testid="document-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="document-status"]')
            .should('contain', 'Pending');
        });
      });
      
      // Filter by approved
      cy.get('[data-testid="filter-status"]').select('approved');
      
      cy.get('[data-testid="document-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="document-status"]')
            .should('contain', 'Approved');
        });
      });
    });

    it('should search documents by title', () => {
      cy.wait('@getDocuments');
      
      const searchTerm = 'resume';
      cy.get('[data-testid="search-documents"]').type(searchTerm);
      
      // Verify search results
      cy.get('[data-testid="document-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="document-title"]')
            .should('contain.text', searchTerm, { matchCase: false });
        });
      });
      
      // Clear search
      cy.get('[data-testid="search-documents"]').clear();
    });

    it('should handle empty state when no documents exist', () => {
      // Mock empty response
      cy.intercept('GET', '/api/consultants/*/documents', { body: [] })
        .as('getEmptyDocuments');
      
      cy.reload();
      cy.wait('@getEmptyDocuments');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]')
        .should('contain', 'No documents found');
      
      cy.get('[data-testid="button-upload-first-document"]')
        .should('be.visible');
    });

    it('should show expired documents with warning indicators', () => {
      cy.wait('@getDocuments');
      
      // Check for expired document indicators
      cy.get('[data-testid="document-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="expired-indicator"]').length > 0) {
              cy.get('[data-testid="expired-indicator"]')
                .should('be.visible')
                .and('have.class', /warning|danger|expired/);
            }
          });
        });
      });
    });

    it('should show documents expiring soon with warning', () => {
      cy.wait('@getDocuments');
      
      cy.get('[data-testid="document-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="expiring-soon-indicator"]').length > 0) {
              cy.get('[data-testid="expiring-soon-indicator"]')
                .should('be.visible')
                .and('have.class', /warning|alert/);
            }
          });
        });
      });
    });
  });

  describe('Document Upload Flow', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should open upload modal with complete form', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      cy.get('[data-testid="upload-modal"]').should('be.visible');
      cy.get('[data-testid="upload-form"]').should('be.visible');
      
      // Form fields
      cy.get('[data-testid="input-title"]').should('be.visible');
      cy.get('[data-testid="select-document-type"]').should('be.visible');
      cy.get('[data-testid="input-description"]').should('be.visible');
      cy.get('[data-testid="input-expiration-date"]').should('be.visible');
      cy.get('[data-testid="file-dropzone"]').should('be.visible');
      
      // Buttons
      cy.get('[data-testid="button-cancel"]').should('be.visible');
      cy.get('[data-testid="button-upload"]')
        .should('be.visible')
        .and('be.disabled'); // Should be disabled initially
    });

    it('should validate required fields in upload form', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Try to submit without required fields
      cy.get('[data-testid="button-upload"]').click();
      
      // Validation messages
      cy.get('[data-testid="error-title"]').should('contain', 'required');
      cy.get('[data-testid="error-document-type"]').should('contain', 'required');
      cy.get('[data-testid="error-file"]').should('contain', 'required');
    });

    it('should validate file upload constraints', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Test file type validation
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      cy.get('[data-testid="file-input"]').selectFile(invalidFile, { force: true });
      
      cy.get('[data-testid="error-file"]')
        .should('contain', /file type|format/i);
      
      // Test file size validation (mock large file)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { 
        type: 'application/pdf' 
      });
      cy.get('[data-testid="file-input"]').selectFile(largeFile, { force: true });
      
      cy.get('[data-testid="error-file"]')
        .should('contain', /size|large|limit/i);
    });

    it('should upload document successfully with valid data', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Fill form
      cy.get('[data-testid="input-title"]').type(testData.documents.valid.title);
      cy.get('[data-testid="select-document-type"]').select('resume');
      cy.get('[data-testid="input-description"]')
        .type(testData.documents.valid.description);
      cy.get('[data-testid="input-expiration-date"]')
        .type(testData.documents.valid.expirationDate);
      
      // Upload file
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'test-document.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      // Submit
      cy.get('[data-testid="button-upload"]').should('not.be.disabled').click();
      
      cy.wait('@uploadFile').its('response.statusCode').should('eq', 200);
      cy.wait('@createDocument').its('response.statusCode').should('eq', 201);
      
      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('contain', /uploaded|success/i);
      
      // Modal should close
      cy.get('[data-testid="upload-modal"]').should('not.exist');
      
      // Document should appear in list
      cy.get('[data-testid="documents-grid"]')
        .should('contain', testData.documents.valid.title);
    });

    it('should show upload progress during file upload', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Fill minimum required fields
      cy.get('[data-testid="input-title"]').type('Test Upload Progress');
      cy.get('[data-testid="select-document-type"]').select('resume');
      
      // Upload file with slow network simulation
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'test-document.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      // Mock slow upload
      cy.intercept('POST', '/api/objects/upload', (req) => {
        req.reply((res) => {
          res.delay(2000); // 2 second delay
          res.send({ statusCode: 200, body: { url: 'test-url' } });
        });
      }).as('slowUpload');
      
      cy.get('[data-testid="button-upload"]').click();
      
      // Check progress indicator
      cy.get('[data-testid="upload-progress"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('be.visible');
      
      cy.wait('@slowUpload');
    });

    it('should handle upload errors gracefully', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Fill form
      cy.get('[data-testid="input-title"]').type('Failed Upload Test');
      cy.get('[data-testid="select-document-type"]').select('resume');
      
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'test-document.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      // Mock upload failure
      cy.intercept('POST', '/api/objects/upload', { 
        statusCode: 500, 
        body: { error: 'Upload failed' } 
      }).as('failedUpload');
      
      cy.get('[data-testid="button-upload"]').click();
      
      cy.wait('@failedUpload');
      
      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('contain', /upload failed|error/i);
      
      // Upload button should be re-enabled
      cy.get('[data-testid="button-upload"]').should('not.be.disabled');
    });

    it('should support drag and drop file upload', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Test drag and drop
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'test-document.pdf', { 
          type: 'application/pdf' 
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        cy.get('[data-testid="file-dropzone"]')
          .trigger('drop', { dataTransfer });
      });
      
      // Verify file was selected
      cy.get('[data-testid="selected-file"]')
        .should('contain', 'test-document.pdf');
    });

    it('should allow replacing selected file', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Select first file
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'first-document.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      cy.get('[data-testid="selected-file"]')
        .should('contain', 'first-document.pdf');
      
      // Replace with second file
      cy.fixture('test-image.jpg', 'base64').then(fileContent => {
        const file = new File([fileContent], 'second-document.jpg', { 
          type: 'image/jpeg' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      cy.get('[data-testid="selected-file"]')
        .should('contain', 'second-document.jpg')
        .and('not.contain', 'first-document.pdf');
    });

    it('should auto-populate document type based on file name', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Upload resume file
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'john-doe-resume.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      // Check if document type was auto-selected
      cy.get('[data-testid="select-document-type"]').should('have.value', 'resume');
    });
  });

  describe('Document Actions and Management', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should view document in modal/new tab', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-view"]').click();
      });
      
      // Check if document viewer opens
      cy.get('[data-testid="document-viewer"]').should('be.visible');
      
      // Or check if new tab opens
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen');
      });
    });

    it('should download document successfully', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-download"]').click();
      });
      
      // Verify download initiated (hard to test actual download in Cypress)
      cy.get('[data-testid="download-initiated"]')
        .should('be.visible');
    });

    it('should update document status (approve/reject)', () => {
      // As admin, should be able to approve/reject documents
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-approve"]').click();
      
      cy.wait('@updateDocumentStatus').its('response.statusCode').should('eq', 200);
      
      // Verify status change
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="document-status"]')
          .should('contain', 'Approved');
      });
    });

    it('should reject document with reason', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-reject"]').click();
      
      // Rejection modal
      cy.get('[data-testid="rejection-modal"]').should('be.visible');
      cy.get('[data-testid="textarea-rejection-reason"]')
        .type('Document quality is insufficient');
      
      cy.get('[data-testid="button-confirm-rejection"]').click();
      
      cy.wait('@updateDocumentStatus');
      
      // Verify status change
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="document-status"]')
          .should('contain', 'Rejected');
      });
    });

    it('should delete document with confirmation', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-delete"]').click();
      
      // Confirmation dialog
      cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      // Verify deletion
      cy.get('[data-testid="success-message"]')
        .should('contain', /deleted/i);
    });

    it('should bulk select and manage documents', () => {
      // Select multiple documents
      cy.get('[data-testid="document-card"]').each(($card, index) => {
        if (index < 3) { // Select first 3
          cy.wrap($card).within(() => {
            cy.get('[data-testid="checkbox-select"]').check();
          });
        }
      });
      
      // Bulk actions should appear
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      
      // Test bulk approve
      cy.get('[data-testid="button-bulk-approve"]').click();
      cy.get('[data-testid="button-confirm-bulk-action"]').click();
      
      // Verify all selected documents are approved
      cy.get('[data-testid="document-card"] [data-testid="checkbox-select"]:checked')
        .each(($checkbox) => {
          cy.wrap($checkbox).closest('[data-testid="document-card"]').within(() => {
            cy.get('[data-testid="document-status"]')
              .should('contain', 'Approved');
          });
        });
    });

    it('should edit document metadata', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-edit"]').click();
      
      // Edit modal
      cy.get('[data-testid="edit-document-modal"]').should('be.visible');
      
      // Update fields
      cy.get('[data-testid="input-title"]')
        .clear()
        .type('Updated Document Title');
      
      cy.get('[data-testid="input-description"]')
        .clear()
        .type('Updated description');
      
      cy.get('[data-testid="button-save-changes"]').click();
      
      // Verify changes
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="document-title"]')
          .should('contain', 'Updated Document Title');
      });
    });

    it('should replace existing document file', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-replace"]').click();
      
      // Replace file modal
      cy.get('[data-testid="replace-file-modal"]').should('be.visible');
      
      // Upload new file
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'updated-document.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      cy.get('[data-testid="button-replace-file"]').click();
      
      cy.wait('@uploadFile');
      
      // Verify replacement
      cy.get('[data-testid="success-message"]')
        .should('contain', /replaced|updated/i);
    });
  });

  describe('Document Status Workflow', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should display correct status badges', () => {
      const statusTypes = ['pending', 'approved', 'rejected', 'expired'];
      
      statusTypes.forEach(status => {
        cy.get(`[data-testid="document-status-${status}"]`).each(($badge) => {
          cy.wrap($badge).should('be.visible');
          cy.wrap($badge).should('have.class', status);
        });
      });
    });

    it('should show document history/audit trail', () => {
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-history"]').click();
      
      // History modal
      cy.get('[data-testid="document-history-modal"]').should('be.visible');
      
      // History entries
      cy.get('[data-testid="history-entry"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="history-entry"]').first().within(() => {
        cy.get('[data-testid="history-action"]').should('be.visible');
        cy.get('[data-testid="history-user"]').should('be.visible');
        cy.get('[data-testid="history-timestamp"]').should('be.visible');
      });
    });

    it('should require review before approval', () => {
      // Mock document that needs review
      cy.get('[data-testid="document-card"]')
        .contains('[data-testid="document-status"]', 'Pending Review')
        .closest('[data-testid="document-card"]')
        .within(() => {
          cy.get('[data-testid="button-actions"]').click();
        });
      
      cy.get('[data-testid="action-review"]').click();
      
      // Review modal
      cy.get('[data-testid="review-modal"]').should('be.visible');
      
      // Review form
      cy.get('[data-testid="textarea-review-comments"]')
        .type('Document has been reviewed and appears compliant.');
      
      cy.get('[data-testid="button-complete-review"]').click();
      
      // Should move to approved status
      cy.wait('@updateDocumentStatus');
    });

    it('should handle document expiration workflow', () => {
      // Find expired document
      cy.get('[data-testid="document-card"]')
        .contains('[data-testid="document-status"]', 'Expired')
        .closest('[data-testid="document-card"]')
        .within(() => {
          cy.get('[data-testid="button-actions"]').click();
        });
      
      cy.get('[data-testid="action-renew"]').click();
      
      // Renewal process
      cy.get('[data-testid="renew-document-modal"]').should('be.visible');
      
      // Upload new version
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'renewed-document.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      // Update expiration date
      cy.get('[data-testid="input-expiration-date"]')
        .clear()
        .type('2025-12-31');
      
      cy.get('[data-testid="button-renew"]').click();
      
      cy.wait('@uploadFile');
      cy.wait('@createDocument');
    });

    it('should send notifications for status changes', () => {
      cy.intercept('POST', '/api/notifications').as('sendNotification');
      
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      cy.get('[data-testid="action-approve"]').click();
      
      cy.wait('@updateDocumentStatus');
      cy.wait('@sendNotification');
      
      // Notification should be sent to consultant
      cy.wait('@sendNotification').then((interception) => {
        expect(interception.request.body).to.include.keys(['message', 'userId']);
      });
    });
  });

  describe('Document Analytics and Reporting', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should display document statistics dashboard', () => {
      cy.get('[data-testid="documents-stats"]').should('be.visible');
      
      // Status counts
      cy.get('[data-testid="stat-total-documents"]')
        .should('contain.text', /\d+/);
      cy.get('[data-testid="stat-pending-documents"]')
        .should('contain.text', /\d+/);
      cy.get('[data-testid="stat-approved-documents"]')
        .should('contain.text', /\d+/);
      cy.get('[data-testid="stat-expired-documents"]')
        .should('contain.text', /\d+/);
      
      // Charts/graphs
      cy.get('[data-testid="documents-chart"]').should('be.visible');
    });

    it('should show compliance overview', () => {
      cy.get('[data-testid="compliance-overview"]').should('be.visible');
      
      // Compliance percentage
      cy.get('[data-testid="compliance-percentage"]')
        .should('contain.text', /%/);
      
      // Missing documents
      cy.get('[data-testid="missing-documents-list"]').should('be.visible');
      
      // Expiring soon
      cy.get('[data-testid="expiring-documents-list"]').should('be.visible');
    });

    it('should export document reports', () => {
      cy.get('[data-testid="button-export-report"]').click();
      
      // Export options
      cy.get('[data-testid="export-modal"]').should('be.visible');
      
      cy.get('[data-testid="select-export-format"]').select('pdf');
      cy.get('[data-testid="checkbox-include-expired"]').check();
      
      cy.get('[data-testid="button-generate-export"]').click();
      
      // Should trigger download
      cy.get('[data-testid="export-progress"]').should('be.visible');
    });
  });

  describe('Mobile Responsiveness and Accessibility', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
      
      // Check mobile layout
      cy.get('[data-testid="documents-grid"]').should('be.visible');
      
      // Documents should stack vertically
      cy.get('[data-testid="document-card"]')
        .should('have.css', 'width')
        .and('match', /100%|full/);
      
      // Mobile navigation
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
    });

    it('should be accessible with keyboard navigation', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
      
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'button-upload-document');
      
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'search-documents');
      
      // Test upload modal keyboard navigation
      cy.get('[data-testid="button-upload-document"]').click();
      cy.get('[data-testid="input-title"]').should('be.focused');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
      
      // Check ARIA attributes
      cy.get('[data-testid="documents-grid"]')
        .should('have.attr', 'role', 'grid');
      
      cy.get('[data-testid="document-card"]')
        .should('have.attr', 'role', 'gridcell');
      
      cy.get('[data-testid="button-upload-document"]')
        .should('have.attr', 'aria-label');
      
      cy.get('[data-testid="search-documents"]')
        .should('have.attr', 'aria-label');
    });

    it('should work with screen readers', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
      
      // Check for screen reader text
      cy.get('[data-testid="sr-only-document-count"]')
        .should('exist')
        .and('have.class', 'sr-only');
      
      // Status announcements
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="sr-only-status"]')
          .should('exist')
          .and('contain.text', /status/i);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/consultants/*/documents', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDocumentsError');
      
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocumentsError');
      
      // Error state
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain', /error|failed/i);
      
      // Retry button
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should handle network failures', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      
      // Simulate network failure during upload
      cy.get('[data-testid="button-upload-document"]').click();
      
      cy.get('[data-testid="input-title"]').type('Network Test');
      cy.get('[data-testid="select-document-type"]').select('resume');
      
      cy.fixture('test-document.pdf', 'base64').then(fileContent => {
        const file = new File([fileContent], 'test.pdf', { 
          type: 'application/pdf' 
        });
        cy.get('[data-testid="file-input"]').selectFile(file, { force: true });
      });
      
      // Mock network failure
      cy.intercept('POST', '/api/objects/upload', { forceNetworkError: true })
        .as('networkError');
      
      cy.get('[data-testid="button-upload"]').click();
      
      cy.wait('@networkError');
      
      // Should show network error message
      cy.get('[data-testid="error-message"]')
        .should('contain', /network|connection/i);
    });

    it('should handle concurrent document operations', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
      
      // Simulate concurrent approval/rejection
      cy.get('[data-testid="document-card"]').first().within(() => {
        cy.get('[data-testid="button-actions"]').click();
      });
      
      // Mock conflict response
      cy.intercept('PATCH', '/api/documents/*/status', {
        statusCode: 409,
        body: { error: 'Document was already updated by another user' }
      }).as('conflictError');
      
      cy.get('[data-testid="action-approve"]').click();
      
      cy.wait('@conflictError');
      
      // Should show conflict message
      cy.get('[data-testid="error-message"]')
        .should('contain', /conflict|already updated/i);
    });

    it('should validate file integrity', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Create corrupted file
      const corruptedFile = new File([''], 'corrupted.pdf', { 
        type: 'application/pdf' 
      });
      
      cy.get('[data-testid="input-title"]').type('Corrupted File Test');
      cy.get('[data-testid="select-document-type"]').select('resume');
      cy.get('[data-testid="file-input"]').selectFile(corruptedFile, { force: true });
      
      cy.get('[data-testid="button-upload"]').click();
      
      // Should detect and reject corrupted file
      cy.get('[data-testid="error-file"]')
        .should('contain', /corrupted|invalid|damaged/i);
    });

    it('should handle document type changes with validation', () => {
      cy.visit('/admin/document-types');
      
      // Delete a document type that's in use
      cy.get('[data-testid="document-type-row"]')
        .contains('Resume')
        .within(() => {
          cy.get('[data-testid="button-delete"]').click();
        });
      
      cy.get('[data-testid="confirm-delete-dialog"]').within(() => {
        cy.get('[data-testid="button-confirm-delete"]').click();
      });
      
      // Should show warning about documents using this type
      cy.get('[data-testid="warning-message"]')
        .should('contain', /documents using this type/i);
    });
  });
});
