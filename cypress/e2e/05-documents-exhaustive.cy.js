describe('Documents Feature - Exhaustive Tests', () => {
  const testData = {
    consultant: {
      id: 'ci-test-consultant',
      name: 'CI Test Consultant',
      email: 'consultant@example.com'
    },
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    documents: {
      valid: {
        name: 'Test Document.pdf',
        description: 'Test document description',
        type: 'certification',
        file: 'test-document.pdf',
        size: 1024000, // 1MB
        mimeType: 'application/pdf'
      },
      large: {
        name: 'Large Document.pdf',
        description: 'Large test document',
        type: 'license',
        file: 'large-document.pdf',
        size: 50000000, // 50MB
        mimeType: 'application/pdf'
      },
      invalid: {
        name: 'Invalid Document.txt',
        description: 'Invalid file type',
        type: 'other',
        file: 'invalid-document.txt',
        size: 1000,
        mimeType: 'text/plain'
      }
    },
    documentTypes: [
      { id: '1', name: 'License', required: true, description: 'Professional license' },
      { id: '2', name: 'Certification', required: false, description: 'Professional certification' },
      { id: '3', name: 'Resume', required: true, description: 'Current resume' },
      { id: '4', name: 'ID Copy', required: true, description: 'Government issued ID' },
      { id: '5', name: 'Other', required: false, description: 'Other documents' }
    ]
  };

  const apiEndpoints = {
    consultantDocuments: (consultantId) => `/api/consultants/${consultantId}/documents`,
    documentTypes: '/api/document-types',
    documentStatus: (docId) => `/api/documents/${docId}/status`,
    objectUpload: '/api/objects/upload',
    consultantDocumentsUpdate: (consultantId) => `/api/consultants/${consultantId}/documents`
  };

  beforeEach(() => {
    // Login as admin user
    cy.loginAsAdmin();
    
    // Setup API interceptors
    cy.intercept('GET', apiEndpoints.documentTypes, {
      statusCode: 200,
      body: { success: true, data: testData.documentTypes }
    }).as('getDocumentTypes');

    cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
      statusCode: 200,
      body: { 
        success: true, 
        data: [],
        pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 }
      }
    }).as('getConsultantDocuments');

    cy.intercept('POST', apiEndpoints.consultantDocuments('*'), {
      statusCode: 201,
      body: { 
        success: true, 
        data: {
          id: 'doc-1',
          name: testData.documents.valid.name,
          type: testData.documents.valid.type,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
          url: '/objects/test-document.pdf'
        }
      }
    }).as('uploadDocument');

    cy.intercept('PATCH', '/api/documents/*/status', {
      statusCode: 200,
      body: { success: true, data: { status: 'approved' } }
    }).as('updateDocumentStatus');

    cy.intercept('POST', apiEndpoints.objectUpload, {
      statusCode: 200,
      body: { 
        success: true, 
        data: { 
          url: '/objects/test-document.pdf',
          filename: 'test-document.pdf'
        }
      }
    }).as('uploadFile');
  });

  describe('Document Types Management', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types list page correctly', () => {
      // Page header and title
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /document types/i);
      cy.title().should('contain', 'Document Types');

      // Action buttons
      cy.get('[data-testid="button-add-document-type"]')
        .should('be.visible')
        .and('contain.text', /add|create/i);

      // Document types table
      cy.get('[data-testid="document-types-table"]').should('be.visible');
      cy.get('[data-testid="table-header"]').within(() => {
        cy.contains('Name').should('be.visible');
        cy.contains('Description').should('be.visible');
        cy.contains('Required').should('be.visible');
        cy.contains('Actions').should('be.visible');
      });

      // Verify document types are displayed
      testData.documentTypes.forEach((type, index) => {
        cy.get(`[data-testid="document-type-row-${index}"]`).within(() => {
          cy.contains(type.name).should('be.visible');
          cy.contains(type.description).should('be.visible');
          cy.get('[data-testid="required-indicator"]')
            .should(type.required ? 'contain.text' : 'not.contain.text', 'Required');
        });
      });
    });

    it('should create new document type successfully', () => {
      const newDocumentType = {
        name: 'Background Check',
        description: 'Criminal background verification',
        required: true
      };

      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: { 
          success: true, 
          data: { 
            id: 'doc-type-6',
            ...newDocumentType,
            createdAt: new Date().toISOString()
          }
        }
      }).as('createDocumentType');

      // Open create dialog
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="dialog-create-document-type"]').should('be.visible');

      // Fill form
      cy.get('[data-testid="input-document-type-name"]')
        .should('be.visible')
        .type(newDocumentType.name);
      
      cy.get('[data-testid="input-document-type-description"]')
        .should('be.visible')
        .type(newDocumentType.description);
      
      cy.get('[data-testid="checkbox-required"]').check();

      // Submit form
      cy.get('[data-testid="button-save-document-type"]').click();
      cy.wait('@createDocumentType');

      // Verify success
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /created/i);
      
      cy.get('[data-testid="dialog-create-document-type"]')
        .should('not.exist');
    });

    it('should validate document type form inputs', () => {
      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="dialog-create-document-type"]').should('be.visible');

      // Try to submit empty form
      cy.get('[data-testid="button-save-document-type"]').click();
      
      // Check validation errors
      cy.get('[data-testid="error-document-type-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      // Test name field validation
      cy.get('[data-testid="input-document-type-name"]').type('a');
      cy.get('[data-testid="error-document-type-name"]')
        .should('be.visible')
        .and('contain.text', /minimum/i);

      cy.get('[data-testid="input-document-type-name"]').clear().type('a'.repeat(101));
      cy.get('[data-testid="error-document-type-name"]')
        .should('be.visible')
        .and('contain.text', /maximum/i);

      // Test description field
      cy.get('[data-testid="input-document-type-description"]').type('a'.repeat(501));
      cy.get('[data-testid="error-document-type-description"]')
        .should('be.visible')
        .and('contain.text', /maximum/i);
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 500,
        body: { success: false, error: 'Internal server error' }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="button-add-document-type"]').click();
      cy.get('[data-testid="input-document-type-name"]').type('Test Type');
      cy.get('[data-testid="button-save-document-type"]').click();
      cy.wait('@createDocumentTypeError');

      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', /error/i);
    });

    it('should delete document type with confirmation', () => {
      cy.intercept('DELETE', `/api/document-types/*`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocumentType');

      // Click delete button
      cy.get('[data-testid="document-type-row-0"]').within(() => {
        cy.get('[data-testid="button-delete"]').click();
      });

      // Confirm deletion
      cy.get('[data-testid="dialog-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteDocumentType');

      // Verify success
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /deleted/i);
    });
  });

  describe('Consultant Documents Management', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
      cy.wait('@getDocumentTypes');
    });

    it('should display consultant documents page correctly', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /documents/i);
      cy.get('[data-testid="consultant-name"]')
        .should('contain.text', testData.consultant.name);

      // Upload section
      cy.get('[data-testid="document-upload-section"]').should('be.visible');
      cy.get('[data-testid="button-upload-document"]')
        .should('be.visible')
        .and('contain.text', /upload|add/i);

      // Documents grid/table
      cy.get('[data-testid="documents-container"]').should('be.visible');
    });

    it('should show empty state when no documents exist', () => {
      // Empty state illustration
      cy.get('[data-testid="empty-state-documents"]').should('be.visible');
      cy.get('[data-testid="empty-state-message"]')
        .should('contain.text', /no documents/i);
      
      // Call to action
      cy.get('[data-testid="empty-state-action"]')
        .should('be.visible')
        .and('contain.text', /upload/i);
    });

    it('should upload document successfully', () => {
      // Open upload dialog
      cy.get('[data-testid="button-upload-document"]').click();
      cy.get('[data-testid="dialog-upload-document"]').should('be.visible');

      // Select document type
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-certification"]').click();

      // Upload file
      cy.get('[data-testid="file-upload-input"]').attachFile(testData.documents.valid.file);
      
      // Add description
      cy.get('[data-testid="input-document-description"]')
        .type(testData.documents.valid.description);

      // Submit upload
      cy.get('[data-testid="button-submit-upload"]').click();
      cy.wait('@uploadFile');
      cy.wait('@uploadDocument');

      // Verify success
      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /uploaded/i);

      cy.get('[data-testid="dialog-upload-document"]').should('not.exist');
    });

    it('should validate file upload constraints', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      cy.get('[data-testid="dialog-upload-document"]').should('be.visible');

      // Test file type validation
      cy.get('[data-testid="file-upload-input"]').attachFile(testData.documents.invalid.file);
      cy.get('[data-testid="file-upload-error"]')
        .should('be.visible')
        .and('contain.text', /file type not allowed/i);

      // Test file size validation
      cy.get('[data-testid="file-upload-input"]').attachFile(testData.documents.large.file);
      cy.get('[data-testid="file-upload-error"]')
        .should('be.visible')
        .and('contain.text', /file size too large/i);

      // Test missing document type
      cy.get('[data-testid="file-upload-input"]').attachFile(testData.documents.valid.file);
      cy.get('[data-testid="button-submit-upload"]').click();
      cy.get('[data-testid="error-document-type"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should display uploaded documents correctly', () => {
      // Mock documents data
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'License.pdf',
          type: 'license',
          status: 'approved',
          uploadedAt: '2024-01-15T10:00:00Z',
          approvedAt: '2024-01-16T14:30:00Z',
          url: '/objects/license.pdf',
          size: 1024000
        },
        {
          id: 'doc-2',
          name: 'Certification.pdf',
          type: 'certification',
          status: 'pending',
          uploadedAt: '2024-01-14T09:00:00Z',
          url: '/objects/certification.pdf',
          size: 2048000
        },
        {
          id: 'doc-3',
          name: 'Resume.pdf',
          type: 'resume',
          status: 'rejected',
          uploadedAt: '2024-01-13T16:00:00Z',
          rejectedAt: '2024-01-14T10:00:00Z',
          rejectionReason: 'Document unclear, please resubmit',
          url: '/objects/resume.pdf',
          size: 512000
        }
      ];

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { 
          success: true, 
          data: mockDocuments,
          pagination: { total: 3, page: 1, pageSize: 10, totalPages: 1 }
        }
      }).as('getDocumentsWithData');

      cy.reload();
      cy.wait('@getDocumentsWithData');

      // Verify documents are displayed
      mockDocuments.forEach((doc, index) => {
        cy.get(`[data-testid="document-card-${doc.id}"]`).within(() => {
          // Document name and type
          cy.get('[data-testid="document-name"]').should('contain.text', doc.name);
          cy.get('[data-testid="document-type"]').should('contain.text', doc.type);
          
          // Status indicator
          cy.get('[data-testid="document-status"]')
            .should('contain.text', doc.status)
            .and('have.class', `status-${doc.status}`);
          
          // Upload date
          cy.get('[data-testid="upload-date"]').should('be.visible');
          
          // File size
          cy.get('[data-testid="file-size"]').should('be.visible');
          
          // Actions
          cy.get('[data-testid="button-view-document"]').should('be.visible');
          cy.get('[data-testid="button-download-document"]').should('be.visible');
        });
      });
    });

    it('should handle document status updates', () => {
      const mockDocument = {
        id: 'doc-1',
        name: 'Test Document.pdf',
        type: 'license',
        status: 'pending',
        uploadedAt: '2024-01-15T10:00:00Z'
      };

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { 
          success: true, 
          data: [mockDocument],
          pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 }
        }
      }).as('getDocumentsForStatus');

      cy.reload();
      cy.wait('@getDocumentsForStatus');

      // Test approve action
      cy.get(`[data-testid="document-card-${mockDocument.id}"]`).within(() => {
        cy.get('[data-testid="button-approve"]').click();
      });

      cy.get('[data-testid="dialog-confirm-approve"]').should('be.visible');
      cy.get('[data-testid="button-confirm-approve"]').click();
      cy.wait('@updateDocumentStatus');

      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /approved/i);

      // Test reject action
      cy.get(`[data-testid="document-card-${mockDocument.id}"]`).within(() => {
        cy.get('[data-testid="button-reject"]').click();
      });

      cy.get('[data-testid="dialog-reject-document"]').should('be.visible');
      cy.get('[data-testid="textarea-rejection-reason"]')
        .type('Document quality is insufficient');
      cy.get('[data-testid="button-confirm-reject"]').click();
      cy.wait('@updateDocumentStatus');

      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /rejected/i);
    });

    it('should filter documents by status', () => {
      const mockDocuments = [
        { id: 'doc-1', name: 'Doc1.pdf', status: 'approved', type: 'license' },
        { id: 'doc-2', name: 'Doc2.pdf', status: 'pending', type: 'certification' },
        { id: 'doc-3', name: 'Doc3.pdf', status: 'rejected', type: 'resume' }
      ];

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { success: true, data: mockDocuments }
      }).as('getAllDocuments');

      cy.reload();
      cy.wait('@getAllDocuments');

      // Filter by approved
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-approved"]').click();
      
      cy.get('[data-testid="document-card-doc-1"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-2"]').should('not.exist');
      cy.get('[data-testid="document-card-doc-3"]').should('not.exist');

      // Filter by pending
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-pending"]').click();
      
      cy.get('[data-testid="document-card-doc-1"]').should('not.exist');
      cy.get('[data-testid="document-card-doc-2"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-3"]').should('not.exist');

      // Clear filter
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-all"]').click();
      
      cy.get('[data-testid="document-card-doc-1"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-2"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-3"]').should('be.visible');
    });

    it('should search documents by name and type', () => {
      const mockDocuments = [
        { id: 'doc-1', name: 'Medical License.pdf', type: 'license' },
        { id: 'doc-2', name: 'BLS Certification.pdf', type: 'certification' },
        { id: 'doc-3', name: 'Current Resume.pdf', type: 'resume' }
      ];

      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { success: true, data: mockDocuments }
      }).as('getDocumentsForSearch');

      cy.reload();
      cy.wait('@getDocumentsForSearch');

      // Search by document name
      cy.get('[data-testid="input-search-documents"]').type('license');
      cy.get('[data-testid="document-card-doc-1"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-2"]').should('not.exist');
      cy.get('[data-testid="document-card-doc-3"]').should('not.exist');

      // Clear search
      cy.get('[data-testid="input-search-documents"]').clear();
      cy.get('[data-testid="document-card-doc-1"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-2"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-3"]').should('be.visible');

      // Search by type
      cy.get('[data-testid="input-search-documents"]').type('certification');
      cy.get('[data-testid="document-card-doc-1"]').should('not.exist');
      cy.get('[data-testid="document-card-doc-2"]').should('be.visible');
      cy.get('[data-testid="document-card-doc-3"]').should('not.exist');
    });
  });

  describe('Document Viewing and Download', () => {
    const mockDocument = {
      id: 'doc-1',
      name: 'Test Document.pdf',
      type: 'license',
      status: 'approved',
      url: '/objects/test-document.pdf',
      size: 1024000
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { success: true, data: [mockDocument] }
      }).as('getDocumentForViewing');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocumentForViewing');
    });

    it('should view document in modal/viewer', () => {
      cy.intercept('GET', mockDocument.url, {
        statusCode: 200,
        headers: { 'content-type': 'application/pdf' },
        body: 'mock-pdf-content'
      }).as('getDocumentFile');

      cy.get('[data-testid="button-view-document"]').click();
      
      cy.get('[data-testid="document-viewer-modal"]').should('be.visible');
      cy.get('[data-testid="document-viewer-title"]')
        .should('contain.text', mockDocument.name);
      
      // PDF viewer or iframe
      cy.get('[data-testid="document-viewer-content"]').should('be.visible');
      
      // Close button
      cy.get('[data-testid="button-close-viewer"]').click();
      cy.get('[data-testid="document-viewer-modal"]').should('not.exist');
    });

    it('should download document successfully', () => {
      cy.get('[data-testid="button-download-document"]').click();
      
      // Verify download was triggered (check for download attribute)
      cy.get('[data-testid="download-link"]')
        .should('have.attr', 'download')
        .and('have.attr', 'href', mockDocument.url);
    });

    it('should handle document access errors', () => {
      cy.intercept('GET', mockDocument.url, {
        statusCode: 403,
        body: { error: 'Access denied' }
      }).as('getDocumentAccessDenied');

      cy.get('[data-testid="button-view-document"]').click();
      cy.wait('@getDocumentAccessDenied');

      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', /access denied/i);
    });
  });

  describe('Bulk Document Operations', () => {
    const mockDocuments = [
      { id: 'doc-1', name: 'Doc1.pdf', status: 'pending', type: 'license' },
      { id: 'doc-2', name: 'Doc2.pdf', status: 'pending', type: 'certification' },
      { id: 'doc-3', name: 'Doc3.pdf', status: 'approved', type: 'resume' }
    ];

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 200,
        body: { success: true, data: mockDocuments }
      }).as('getDocumentsForBulk');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocumentsForBulk');
    });

    it('should select multiple documents for bulk actions', () => {
      // Select documents
      cy.get('[data-testid="checkbox-select-doc-1"]').check();
      cy.get('[data-testid="checkbox-select-doc-2"]').check();

      // Bulk actions toolbar should appear
      cy.get('[data-testid="bulk-actions-toolbar"]').should('be.visible');
      cy.get('[data-testid="selected-count"]')
        .should('contain.text', '2 selected');

      // Bulk action buttons
      cy.get('[data-testid="button-bulk-approve"]').should('be.visible');
      cy.get('[data-testid="button-bulk-reject"]').should('be.visible');
      cy.get('[data-testid="button-bulk-delete"]').should('be.visible');
    });

    it('should perform bulk approval', () => {
      cy.intercept('PATCH', '/api/documents/*/status', {
        statusCode: 200,
        body: { success: true }
      }).as('bulkApproveDocuments');

      cy.get('[data-testid="checkbox-select-doc-1"]').check();
      cy.get('[data-testid="checkbox-select-doc-2"]').check();
      cy.get('[data-testid="button-bulk-approve"]').click();

      cy.get('[data-testid="dialog-confirm-bulk-approve"]').should('be.visible');
      cy.get('[data-testid="button-confirm-bulk-approve"]').click();

      // Should make API calls for each selected document
      cy.wait('@bulkApproveDocuments').its('request.url').should('include', 'doc-1');
      cy.wait('@bulkApproveDocuments').its('request.url').should('include', 'doc-2');

      cy.get('[data-testid="toast-success"]')
        .should('be.visible')
        .and('contain.text', /approved/i);
    });

    it('should select all documents', () => {
      cy.get('[data-testid="checkbox-select-all"]').check();
      
      mockDocuments.forEach(doc => {
        cy.get(`[data-testid="checkbox-select-${doc.id}"]`)
          .should('be.checked');
      });

      cy.get('[data-testid="selected-count"]')
        .should('contain.text', `${mockDocuments.length} selected`);
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should display documents page correctly on mobile', () => {
      // Mobile header
      cy.get('[data-testid="mobile-header"]').should('be.visible');
      
      // Mobile navigation
      cy.get('[data-testid="mobile-nav-toggle"]').should('be.visible');
      
      // Documents should stack vertically
      cy.get('[data-testid="documents-container"]')
        .should('have.class', 'mobile-layout');
    });

    it('should handle mobile upload flow', () => {
      cy.get('[data-testid="mobile-upload-button"]').click();
      cy.get('[data-testid="mobile-upload-sheet"]').should('be.visible');
      
      // Mobile file picker
      cy.get('[data-testid="mobile-file-input"]').should('be.visible');
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during document operations', () => {
      // Mock slow API response
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send({ success: true, data: [] });
        });
      }).as('slowDocumentLoad');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      
      // Should show loading spinner
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-message"]')
        .should('contain.text', /loading documents/i);

      cy.wait('@slowDocumentLoad');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle file upload progress', () => {
      cy.get('[data-testid="button-upload-document"]').click();
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-license"]').click();
      
      // Mock upload with progress
      cy.intercept('POST', apiEndpoints.objectUpload, (req) => {
        req.reply((res) => {
          res.delay(1000);
          res.send({ success: true, data: { url: '/objects/test.pdf' } });
        });
      }).as('slowUpload');

      cy.get('[data-testid="file-upload-input"]').attachFile(testData.documents.valid.file);
      cy.get('[data-testid="button-submit-upload"]').click();

      // Should show upload progress
      cy.get('[data-testid="upload-progress"]').should('be.visible');
      cy.get('[data-testid="progress-bar"]').should('be.visible');

      cy.wait('@slowUpload');
      cy.get('[data-testid="upload-progress"]').should('not.exist');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments(testData.consultant.id), {
        forceNetworkError: true
      }).as('networkError');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@networkError');

      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', /network error/i);
      
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should handle empty consultant scenario', () => {
      cy.visit('/consultants/non-existent-id/documents');
      
      cy.get('[data-testid="not-found-message"]')
        .should('be.visible')
        .and('contain.text', /consultant not found/i);
    });

    it('should handle file upload failures', () => {
      cy.intercept('POST', apiEndpoints.objectUpload, {
        statusCode: 500,
        body: { error: 'Upload failed' }
      }).as('uploadFailure');

      cy.get('[data-testid="button-upload-document"]').click();
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-license"]').click();
      cy.get('[data-testid="file-upload-input"]').attachFile(testData.documents.valid.file);
      cy.get('[data-testid="button-submit-upload"]').click();

      cy.wait('@uploadFailure');

      cy.get('[data-testid="toast-error"]')
        .should('be.visible')
        .and('contain.text', /upload failed/i);
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getConsultantDocuments');
    });

    it('should be keyboard navigable', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'button-upload-document');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-status');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'input-search-documents');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="documents-container"]')
        .should('have.attr', 'role', 'main');
      
      cy.get('[data-testid="filter-status"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'combobox');
      
      cy.get('[data-testid="input-search-documents"]')
        .should('have.attr', 'aria-label', /search documents/i);
    });

    it('should announce status changes to screen readers', () => {
      cy.get('[data-testid="sr-status-region"]')
        .should('have.attr', 'aria-live', 'polite');
    });
  });
});
