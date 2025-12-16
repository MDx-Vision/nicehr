describe('Documents Management - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant'
    },
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    documentTypes: [
      { name: 'Resume', required: true, category: 'Professional' },
      { name: 'Certification', required: false, category: 'Credentials' },
      { name: 'License', required: true, category: 'Legal' },
      { name: 'Background Check', required: true, category: 'Compliance' }
    ],
    documents: [
      {
        name: 'Test Resume.pdf',
        type: 'Resume',
        status: 'pending',
        size: 1024000
      },
      {
        name: 'Test Certification.pdf',
        type: 'Certification',
        status: 'approved',
        size: 512000
      }
    ],
    testFiles: {
      validPdf: 'test-document.pdf',
      validDoc: 'test-document.docx',
      validImage: 'test-image.jpg',
      invalidFile: 'test-script.exe',
      oversizedFile: 'oversized-document.pdf'
    }
  };

  const apiEndpoints = {
    consultantDocuments: (consultantId) => `/api/consultants/${consultantId}/documents`,
    documentTypes: '/api/document-types',
    documentStatus: (id) => `/api/documents/${id}/status`,
    fileUpload: '/api/objects/upload',
    consultant: (id) => `/api/consultants/${id}`
  };

  beforeEach(() => {
    // Login as admin user
    cy.session('admin-session', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testData.user.email);
      cy.get('[data-testid="input-password"]').type(testData.user.password);
      cy.get('[data-testid="button-login"]').click();
      cy.url().should('not.include', '/login');
    });

    // Intercept API calls
    cy.intercept('GET', apiEndpoints.documentTypes, {
      statusCode: 200,
      body: { data: testData.documentTypes }
    }).as('getDocumentTypes');

    cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
      statusCode: 200,
      body: { data: testData.documents }
    }).as('getConsultantDocuments');

    cy.intercept('POST', apiEndpoints.consultantDocuments(testData.consultant.id), {
      statusCode: 201,
      body: { 
        data: { 
          id: 'new-doc-1', 
          name: 'New Document.pdf',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      }
    }).as('uploadDocument');

    cy.intercept('PATCH', '/api/documents/*/status', {
      statusCode: 200,
      body: { data: { id: 'doc-1', status: 'approved' } }
    }).as('updateDocumentStatus');

    cy.intercept('POST', apiEndpoints.fileUpload, {
      statusCode: 200,
      body: { 
        data: { 
          url: 'https://example.com/uploads/test-file.pdf',
          filename: 'test-file.pdf'
        }
      }
    }).as('uploadFile');
  });

  describe('Documents List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should display complete documents page layout', () => {
      // Main container
      cy.get('[data-testid="documents-container"]', { timeout: 10000 })
        .should('be.visible');

      // Page header
      cy.get('[data-testid="documents-header"]')
        .should('be.visible')
        .and('contain.text', 'Documents');

      // Upload button
      cy.get('[data-testid="button-upload-document"]')
        .should('be.visible')
        .and('not.be.disabled');

      // Documents table/list
      cy.get('[data-testid="documents-table"]')
        .should('be.visible');

      // Wait for API calls
      cy.wait('@getDocumentTypes');
      cy.wait('@getConsultantDocuments');
    });

    it('should display documents table with proper columns', () => {
      cy.wait('@getConsultantDocuments');

      // Table headers
      const expectedColumns = ['Document Name', 'Type', 'Status', 'Upload Date', 'Actions'];
      expectedColumns.forEach(column => {
        cy.get('[data-testid="documents-table"]')
          .should('contain.text', column);
      });

      // Table rows
      cy.get('[data-testid="document-row"]')
        .should('have.length.at.least', 1);

      // First document row content
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="document-name"]')
          .should('contain.text', testData.documents[0].name);
        cy.get('[data-testid="document-type"]')
          .should('contain.text', testData.documents[0].type);
        cy.get('[data-testid="document-status"]')
          .should('contain.text', testData.documents[0].status);
        cy.get('[data-testid="document-actions"]')
          .should('be.visible');
      });
    });

    it('should display proper status badges with correct styling', () => {
      cy.wait('@getConsultantDocuments');

      // Check status badges
      cy.get('[data-testid="status-badge-pending"]')
        .should('be.visible')
        .and('have.class', /pending|warning|yellow/);

      cy.get('[data-testid="status-badge-approved"]')
        .should('be.visible')
        .and('have.class', /approved|success|green/);

      // Status badge text
      cy.get('[data-testid="status-badge-pending"]')
        .should('contain.text', /pending/i);
      cy.get('[data-testid="status-badge-approved"]')
        .should('contain.text', /approved/i);
    });

    it('should show empty state when no documents exist', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { data: [] }
      }).as('getEmptyDocuments');

      cy.reload();
      cy.wait('@getEmptyDocuments');

      cy.get('[data-testid="documents-empty-state"]')
        .should('be.visible')
        .and('contain.text', /no documents/i);

      cy.get('[data-testid="empty-state-upload-button"]')
        .should('be.visible')
        .and('contain.text', /upload/i);
    });
  });

  describe('Document Upload - UI and Functionality', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should open upload modal when upload button is clicked', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      cy.get('[data-testid="upload-modal"]')
        .should('be.visible');

      cy.get('[data-testid="upload-modal-header"]')
        .should('contain.text', /upload document/i);

      cy.get('[data-testid="upload-modal-close"]')
        .should('be.visible');
    });

    it('should display complete upload form with all required fields', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      // Document type dropdown
      cy.get('[data-testid="select-document-type"]')
        .should('be.visible');

      // File upload area
      cy.get('[data-testid="file-upload-area"]')
        .should('be.visible')
        .and('contain.text', /drag.*drop|choose file/i);

      // File input
      cy.get('[data-testid="file-input"]')
        .should('exist')
        .and('have.attr', 'type', 'file');

      // Upload button (should be disabled initially)
      cy.get('[data-testid="button-submit-upload"]')
        .should('be.visible')
        .and('be.disabled');

      // Cancel button
      cy.get('[data-testid="button-cancel-upload"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should populate document type dropdown with available types', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      cy.wait('@getDocumentTypes');

      cy.get('[data-testid="select-document-type"]').click();

      testData.documentTypes.forEach(type => {
        cy.get('[data-testid="option-document-type"]')
          .should('contain.text', type.name);
      });

      // Check for required indicators
      cy.get('[data-testid="option-document-type-required"]')
        .should('exist');
    });

    it('should validate file type restrictions', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Select document type
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();

      // Try to upload invalid file type
      cy.get('[data-testid="file-input"]')
        .selectFile({
          contents: Cypress.Buffer.from('fake exe content'),
          fileName: testData.testFiles.invalidFile,
          mimeType: 'application/octet-stream'
        }, { force: true });

      cy.get('[data-testid="file-error-message"]')
        .should('be.visible')
        .and('contain.text', /invalid file type|not supported/i);

      cy.get('[data-testid="button-submit-upload"]')
        .should('be.disabled');
    });

    it('should validate file size restrictions', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Select document type
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();

      // Create oversized file (10MB)
      const oversizedContent = 'x'.repeat(10 * 1024 * 1024);
      
      cy.get('[data-testid="file-input"]')
        .selectFile({
          contents: oversizedContent,
          fileName: testData.testFiles.oversizedFile,
          mimeType: 'application/pdf'
        }, { force: true });

      cy.get('[data-testid="file-error-message"]')
        .should('be.visible')
        .and('contain.text', /file too large|size limit/i);

      cy.get('[data-testid="button-submit-upload"]')
        .should('be.disabled');
    });

    it('should successfully upload valid document', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Select document type
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();

      // Upload valid PDF file
      cy.get('[data-testid="file-input"]')
        .selectFile({
          contents: Cypress.Buffer.from('fake pdf content'),
          fileName: testData.testFiles.validPdf,
          mimeType: 'application/pdf'
        }, { force: true });

      // Verify file is selected
      cy.get('[data-testid="selected-file-name"]')
        .should('contain.text', testData.testFiles.validPdf);

      // Submit button should be enabled
      cy.get('[data-testid="button-submit-upload"]')
        .should('not.be.disabled')
        .click();

      // Wait for upload completion
      cy.wait('@uploadFile');
      cy.wait('@uploadDocument');

      // Modal should close
      cy.get('[data-testid="upload-modal"]')
        .should('not.exist');

      // Success message
      cy.get('[data-testid="upload-success-message"]')
        .should('be.visible')
        .and('contain.text', /uploaded successfully/i);
    });

    it('should show upload progress during file upload', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      // Select document type and file
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();
      
      cy.get('[data-testid="file-input"]')
        .selectFile({
          contents: Cypress.Buffer.from('fake pdf content'),
          fileName: testData.testFiles.validPdf,
          mimeType: 'application/pdf'
        }, { force: true });

      // Intercept with delay to see progress
      cy.intercept('POST', apiEndpoints.fileUpload, (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                statusCode: 200,
                body: { 
                  data: { 
                    url: 'https://example.com/uploads/test-file.pdf',
                    filename: 'test-file.pdf'
                  }
                }
              });
            }, 1000);
          });
        });
      }).as('slowUploadFile');

      cy.get('[data-testid="button-submit-upload"]').click();

      // Check for progress indicator
      cy.get('[data-testid="upload-progress"]')
        .should('be.visible');

      cy.get('[data-testid="upload-progress-bar"]')
        .should('be.visible');

      cy.wait('@slowUploadFile');
    });

    it('should handle upload errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.fileUpload, {
        statusCode: 500,
        body: { error: 'Upload failed' }
      }).as('failedUpload');

      cy.get('[data-testid="button-upload-document"]').click();
      
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();
      
      cy.get('[data-testid="file-input"]')
        .selectFile({
          contents: Cypress.Buffer.from('fake pdf content'),
          fileName: testData.testFiles.validPdf,
          mimeType: 'application/pdf'
        }, { force: true });

      cy.get('[data-testid="button-submit-upload"]').click();

      cy.wait('@failedUpload');

      cy.get('[data-testid="upload-error-message"]')
        .should('be.visible')
        .and('contain.text', /upload failed|error/i);

      // Modal should remain open for retry
      cy.get('[data-testid="upload-modal"]')
        .should('be.visible');
    });

    it('should support drag and drop file upload', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();

      // Create a file object
      const fileName = testData.testFiles.validPdf;
      const fileContent = 'fake pdf content';

      // Simulate drag and drop
      cy.get('[data-testid="file-upload-area"]')
        .should('be.visible');

      cy.get('[data-testid="file-upload-area"]')
        .trigger('dragover', { force: true });

      cy.get('[data-testid="file-upload-area"]')
        .should('have.class', /drag-over|dragging/);

      cy.get('[data-testid="file-upload-area"]')
        .selectFile({
          contents: fileContent,
          fileName: fileName,
          mimeType: 'application/pdf'
        }, { action: 'drag-drop', force: true });

      cy.get('[data-testid="selected-file-name"]')
        .should('contain.text', fileName);
    });
  });

  describe('Document Status Management', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should display status update options for pending documents', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="status-actions-menu"]').click();
      });

      cy.get('[data-testid="status-menu"]')
        .should('be.visible');

      cy.get('[data-testid="status-option-approved"]')
        .should('be.visible')
        .and('contain.text', /approve/i);

      cy.get('[data-testid="status-option-rejected"]')
        .should('be.visible')
        .and('contain.text', /reject/i);

      cy.get('[data-testid="status-option-review"]')
        .should('be.visible')
        .and('contain.text', /review/i);
    });

    it('should approve document with confirmation', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="status-actions-menu"]').click();
      });

      cy.get('[data-testid="status-option-approved"]').click();

      // Confirmation dialog
      cy.get('[data-testid="confirmation-dialog"]')
        .should('be.visible');

      cy.get('[data-testid="confirmation-message"]')
        .should('contain.text', /approve.*document/i);

      cy.get('[data-testid="button-confirm-approve"]')
        .should('be.visible')
        .click();

      cy.wait('@updateDocumentStatus');

      cy.get('[data-testid="status-success-message"]')
        .should('be.visible')
        .and('contain.text', /approved successfully/i);
    });

    it('should reject document with reason', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="status-actions-menu"]').click();
      });

      cy.get('[data-testid="status-option-rejected"]').click();

      // Rejection modal
      cy.get('[data-testid="rejection-modal"]')
        .should('be.visible');

      cy.get('[data-testid="rejection-reason-textarea"]')
        .should('be.visible')
        .type('Document quality is insufficient. Please resubmit with higher resolution.');

      cy.get('[data-testid="button-confirm-reject"]')
        .should('be.visible')
        .click();

      cy.wait('@updateDocumentStatus');

      cy.get('[data-testid="status-success-message"]')
        .should('be.visible')
        .and('contain.text', /rejected/i);
    });

    it('should require rejection reason when rejecting document', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="status-actions-menu"]').click();
      });

      cy.get('[data-testid="status-option-rejected"]').click();

      // Try to reject without reason
      cy.get('[data-testid="button-confirm-reject"]').click();

      cy.get('[data-testid="rejection-reason-error"]')
        .should('be.visible')
        .and('contain.text', /reason is required/i);

      cy.get('[data-testid="rejection-modal"]')
        .should('be.visible');
    });

    it('should handle bulk status updates', () => {
      // Select multiple documents
      cy.get('[data-testid="select-document-checkbox"]').first().check();
      cy.get('[data-testid="select-document-checkbox"]').eq(1).check();

      cy.get('[data-testid="bulk-actions-toolbar"]')
        .should('be.visible');

      cy.get('[data-testid="bulk-approve-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="bulk-confirmation-dialog"]')
        .should('be.visible');

      cy.get('[data-testid="bulk-confirmation-message"]')
        .should('contain.text', /approve.*2.*documents/i);

      cy.get('[data-testid="button-confirm-bulk-approve"]').click();

      cy.wait('@updateDocumentStatus');

      cy.get('[data-testid="bulk-success-message"]')
        .should('be.visible')
        .and('contain.text', /documents approved/i);
    });
  });

  describe('Document Viewing and Download', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should open document viewer when document name is clicked', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="document-name"]').click();
      });

      cy.get('[data-testid="document-viewer-modal"]')
        .should('be.visible');

      cy.get('[data-testid="document-viewer-header"]')
        .should('contain.text', testData.documents[0].name);

      cy.get('[data-testid="document-viewer-iframe"]')
        .should('be.visible');
    });

    it('should provide download functionality', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="download-document-button"]').click();
      });

      // Since we can't test actual file download in Cypress,
      // we check that the download was initiated
      cy.get('[data-testid="download-initiated-message"]')
        .should('be.visible')
        .and('contain.text', /download started/i);
    });

    it('should handle document viewer errors', () => {
      cy.intercept('GET', '/objects/**', {
        statusCode: 404,
        body: { error: 'File not found' }
      }).as('fileNotFound');

      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="document-name"]').click();
      });

      cy.wait('@fileNotFound');

      cy.get('[data-testid="document-viewer-error"]')
        .should('be.visible')
        .and('contain.text', /unable to load|file not found/i);
    });

    it('should display document metadata in viewer', () => {
      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="document-name"]').click();
      });

      cy.get('[data-testid="document-viewer-modal"]').within(() => {
        cy.get('[data-testid="document-metadata"]')
          .should('be.visible');

        cy.get('[data-testid="metadata-type"]')
          .should('contain.text', testData.documents[0].type);

        cy.get('[data-testid="metadata-status"]')
          .should('contain.text', testData.documents[0].status);

        cy.get('[data-testid="metadata-size"]')
          .should('be.visible');

        cy.get('[data-testid="metadata-upload-date"]')
          .should('be.visible');
      });
    });
  });

  describe('Document Search and Filtering', () => {
    beforeEach(() => {
      // Add more documents for better testing
      const expandedDocuments = [
        ...testData.documents,
        {
          name: 'Medical License.pdf',
          type: 'License',
          status: 'approved',
          size: 256000
        },
        {
          name: 'Background Check.pdf',
          type: 'Background Check',
          status: 'pending',
          size: 128000
        }
      ];

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { data: expandedDocuments }
      }).as('getExpandedDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getExpandedDocuments');
    });

    it('should filter documents by search term', () => {
      cy.get('[data-testid="document-search-input"]')
        .should('be.visible')
        .type('Resume');

      cy.get('[data-testid="document-row"]')
        .should('have.length', 1);

      cy.get('[data-testid="document-row"]').first()
        .should('contain.text', 'Resume');
    });

    it('should filter documents by type', () => {
      cy.get('[data-testid="filter-document-type"]').click();

      cy.get('[data-testid="filter-option-license"]').click();

      cy.get('[data-testid="document-row"]')
        .should('have.length', 1);

      cy.get('[data-testid="document-row"]').first()
        .should('contain.text', 'License');
    });

    it('should filter documents by status', () => {
      cy.get('[data-testid="filter-status"]').click();

      cy.get('[data-testid="filter-option-pending"]').click();

      cy.get('[data-testid="document-row"]').each($row => {
        cy.wrap($row).within(() => {
          cy.get('[data-testid="document-status"]')
            .should('contain.text', 'pending');
        });
      });
    });

    it('should combine multiple filters', () => {
      cy.get('[data-testid="document-search-input"]')
        .type('Background');

      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-pending"]').click();

      cy.get('[data-testid="document-row"]')
        .should('have.length', 1);

      cy.get('[data-testid="document-row"]').first().within(() => {
        cy.get('[data-testid="document-name"]')
          .should('contain.text', 'Background Check');
        cy.get('[data-testid="document-status"]')
          .should('contain.text', 'pending');
      });
    });

    it('should clear filters and show all documents', () => {
      // Apply filters
      cy.get('[data-testid="document-search-input"]')
        .type('Resume');
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="filter-option-approved"]').click();

      cy.get('[data-testid="document-row"]')
        .should('have.length', 1);

      // Clear filters
      cy.get('[data-testid="clear-filters-button"]').click();

      cy.get('[data-testid="document-row"]')
        .should('have.length', 4);

      cy.get('[data-testid="document-search-input"]')
        .should('have.value', '');
    });

    it('should show no results message when no documents match filters', () => {
      cy.get('[data-testid="document-search-input"]')
        .type('nonexistent document');

      cy.get('[data-testid="no-results-message"]')
        .should('be.visible')
        .and('contain.text', /no documents found/i);

      cy.get('[data-testid="clear-filters-suggestion"]')
        .should('be.visible')
        .and('contain.text', /clear filters/i);
    });
  });

  describe('Document Types Management', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
    });

    it('should display document types management page', () => {
      cy.get('[data-testid="document-types-container"]')
        .should('be.visible');

      cy.get('[data-testid="document-types-header"]')
        .should('contain.text', 'Document Types');

      cy.get('[data-testid="button-add-document-type"]')
        .should('be.visible');

      cy.wait('@getDocumentTypes');

      cy.get('[data-testid="document-types-table"]')
        .should('be.visible');
    });

    it('should create new document type', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      cy.get('[data-testid="document-type-modal"]')
        .should('be.visible');

      cy.get('[data-testid="input-type-name"]')
        .type('Test Document Type');

      cy.get('[data-testid="input-type-category"]')
        .type('Test Category');

      cy.get('[data-testid="checkbox-required"]')
        .check();

      cy.get('[data-testid="textarea-description"]')
        .type('This is a test document type for automated testing.');

      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { 
          data: { 
            id: 'new-type-1', 
            name: 'Test Document Type',
            category: 'Test Category',
            required: true,
            description: 'This is a test document type for automated testing.'
          }
        }
      }).as('createDocumentType');

      cy.get('[data-testid="button-save-document-type"]').click();

      cy.wait('@createDocumentType');

      cy.get('[data-testid="type-success-message"]')
        .should('be.visible')
        .and('contain.text', /created successfully/i);
    });

    it('should validate document type form', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Try to save without required fields
      cy.get('[data-testid="button-save-document-type"]').click();

      cy.get('[data-testid="name-error"]')
        .should('be.visible')
        .and('contain.text', /name is required/i);

      cy.get('[data-testid="category-error"]')
        .should('be.visible')
        .and('contain.text', /category is required/i);
    });
  });

  describe('Responsive Design and Mobile Behavior', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should display properly on tablet viewport', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="documents-container"]')
        .should('be.visible');

      cy.get('[data-testid="documents-table"]')
        .should('be.visible');

      // Check if table is scrollable horizontally
      cy.get('[data-testid="documents-table"]')
        .should('have.css', 'overflow-x', 'auto');
    });

    it('should display properly on mobile viewport', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="documents-container"]')
        .should('be.visible');

      // Should switch to card layout on mobile
      cy.get('[data-testid="documents-cards"]')
        .should('be.visible');

      cy.get('[data-testid="document-card"]')
        .should('have.length.at.least', 1);
    });

    it('should maintain upload functionality on mobile', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="button-upload-document"]').click();

      cy.get('[data-testid="upload-modal"]')
        .should('be.visible');

      // Modal should be responsive
      cy.get('[data-testid="upload-modal"]')
        .should('have.css', 'width')
        .and('not.equal', 'auto');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDocumentsError');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocumentsError');

      cy.get('[data-testid="documents-error"]')
        .should('be.visible')
        .and('contain.text', /error loading documents/i);

      cy.get('[data-testid="retry-button"]')
        .should('be.visible')
        .and('contain.text', /retry/i);
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), { forceNetworkError: true })
        .as('networkError');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@networkError');

      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /connection error/i);
    });

    it('should handle concurrent upload attempts', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      
      // Start first upload
      cy.get('[data-testid="button-upload-document"]').click();
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-document-type"]').first().click();
      cy.get('[data-testid="file-input"]')
        .selectFile({
          contents: 'file1 content',
          fileName: 'file1.pdf',
          mimeType: 'application/pdf'
        }, { force: true });

      // Try to start second upload while first is in progress
      cy.get('[data-testid="button-upload-document"]').should('be.disabled');

      cy.get('[data-testid="upload-in-progress-message"]')
        .should('be.visible')
        .and('contain.text', /upload in progress/i);
    });

    it('should handle large number of documents with pagination', () => {
      const manyDocuments = Array.from({ length: 50 }, (_, i) => ({
        name: `Document ${i + 1}.pdf`,
        type: 'Resume',
        status: i % 3 === 0 ? 'approved' : i % 3 === 1 ? 'pending' : 'rejected',
        size: 1024000
      }));

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { 
          data: manyDocuments,
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            pages: 3
          }
        }
      }).as('getManyDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getManyDocuments');

      cy.get('[data-testid="pagination-controls"]')
        .should('be.visible');

      cy.get('[data-testid="documents-per-page"]')
        .should('contain.text', '20');

      cy.get('[data-testid="total-documents"]')
        .should('contain.text', '50');
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during data fetching', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                statusCode: 200,
                body: { data: testData.documents }
              });
            }, 2000);
          });
        });
      }).as('slowDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);

      cy.get('[data-testid="documents-loading"]')
        .should('be.visible');

      cy.get('[data-testid="loading-skeleton"]')
        .should('be.visible');

      cy.wait('@slowDocuments');

      cy.get('[data-testid="documents-loading"]')
        .should('not.exist');
    });

    it('should handle rapid user interactions', () => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');

      // Rapid clicking of upload button
      cy.get('[data-testid="button-upload-document"]')
        .click()
        .click()
        .click();

      // Should only open one modal
      cy.get('[data-testid="upload-modal"]')
        .should('have.length', 1);
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should be navigable via keyboard', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'button-upload-document');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'document-search-input');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-document-type');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="documents-table"]')
        .should('have.attr', 'role', 'table');

      cy.get('[data-testid="button-upload-document"]')
        .should('have.attr', 'aria-label');

      cy.get('[data-testid="document-search-input"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');

      cy.get('[data-testid="status-badge-pending"]')
        .should('have.attr', 'aria-label');
    });

    it('should support screen reader announcements', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      
      cy.get('[data-testid="upload-modal"]')
        .should('have.attr', 'aria-live', 'polite');

      cy.get('[data-testid="upload-modal-header"]')
        .should('have.attr', 'role', 'heading');
    });
  });
});
