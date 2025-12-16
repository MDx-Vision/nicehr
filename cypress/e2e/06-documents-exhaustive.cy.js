describe('Documents System - Exhaustive Tests', () => {
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
    documents: {
      valid: {
        name: 'Test Resume.pdf',
        type: 'resume',
        description: 'Updated resume document',
        file: 'test-resume.pdf'
      },
      license: {
        name: 'Medical License.pdf',
        type: 'license',
        description: 'Current medical license',
        file: 'medical-license.pdf',
        expiryDate: '2025-12-31'
      },
      certification: {
        name: 'BLS Certification.pdf',
        type: 'certification',
        description: 'Basic Life Support certification',
        file: 'bls-cert.pdf',
        expiryDate: '2024-12-31'
      }
    },
    documentTypes: {
      new: {
        name: 'Background Check',
        description: 'Background verification documents',
        required: true,
        expiryRequired: false
      },
      existing: {
        name: 'Resume',
        description: 'Professional resume',
        required: true,
        expiryRequired: false
      }
    }
  };

  const apiEndpoints = {
    consultantDocuments: (consultantId) => `/api/consultants/${consultantId}/documents`,
    documentTypes: '/api/document-types',
    documentStatus: (id) => `/api/documents/${id}/status`,
    uploadDocuments: (consultantId) => `/api/consultants/${consultantId}/documents`,
    objectUpload: '/api/objects/upload'
  };

  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
  });

  describe('Documents Management Page - UI Components & Layout', () => {
    beforeEach(() => {
      // Mock API responses
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Resume.pdf',
              type: 'resume',
              status: 'approved',
              uploadedAt: '2024-01-15T10:00:00Z',
              uploadedBy: 'John Doe',
              fileSize: 1024000,
              description: 'Professional resume'
            },
            {
              id: '2',
              name: 'License.pdf',
              type: 'license',
              status: 'pending',
              uploadedAt: '2024-01-20T14:30:00Z',
              uploadedBy: 'John Doe',
              fileSize: 2048000,
              expiryDate: '2025-12-31',
              description: 'Medical license'
            }
          ]
        }
      }).as('getDocuments');

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Resume',
              description: 'Professional resume',
              required: true,
              expiryRequired: false
            },
            {
              id: '2',
              name: 'License',
              description: 'Medical license',
              required: true,
              expiryRequired: true
            }
          ]
        }
      }).as('getDocumentTypes');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait(['@getDocuments', '@getDocumentTypes']);
    });

    it('should display complete documents page layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'Documents');
      
      // Navigation breadcrumb
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Consultants');
      cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Documents');

      // Upload section
      cy.get('[data-testid="upload-section"]').should('be.visible');
      cy.get('[data-testid="button-upload-document"]')
        .should('be.visible')
        .and('contain.text', /upload|add/i);

      // Documents list
      cy.get('[data-testid="documents-list"]').should('be.visible');
      cy.get('[data-testid="document-item"]').should('have.length.at.least', 1);

      // Action buttons
      cy.get('[data-testid="button-bulk-actions"]').should('exist');
    });

    it('should display document items with all required information', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        // Document name and type
        cy.get('[data-testid="document-name"]')
          .should('be.visible')
          .and('contain.text', 'Resume.pdf');
        
        cy.get('[data-testid="document-type"]')
          .should('be.visible')
          .and('contain.text', 'resume');

        // Status indicator
        cy.get('[data-testid="document-status"]')
          .should('be.visible')
          .and('contain.text', 'approved');

        // Upload information
        cy.get('[data-testid="upload-date"]').should('be.visible');
        cy.get('[data-testid="uploaded-by"]').should('contain.text', 'John Doe');
        cy.get('[data-testid="file-size"]').should('be.visible');

        // Action buttons
        cy.get('[data-testid="button-view-document"]').should('be.visible');
        cy.get('[data-testid="button-document-actions"]').should('be.visible');
      });
    });

    it('should show document status badges with appropriate styling', () => {
      // Approved status
      cy.get('[data-testid="document-status"]')
        .contains('approved')
        .should('have.class', /success|approved|green/i);

      // Pending status
      cy.get('[data-testid="document-status"]')
        .contains('pending')
        .should('have.class', /pending|warning|yellow/i);
    });

    it('should display document types filter and search', () => {
      // Document type filter
      cy.get('[data-testid="filter-document-type"]').should('be.visible');
      cy.get('[data-testid="filter-document-type"]').click();
      cy.get('[data-testid="option-resume"]').should('be.visible');
      cy.get('[data-testid="option-license"]').should('be.visible');

      // Status filter
      cy.get('[data-testid="filter-status"]').should('be.visible');
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-approved"]').should('be.visible');
      cy.get('[data-testid="option-pending"]').should('be.visible');

      // Search input
      cy.get('[data-testid="search-documents"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
    });
  });

  describe('Document Upload Functionality', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getDocuments');

      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Resume',
              description: 'Professional resume',
              required: true,
              expiryRequired: false
            }
          ]
        }
      }).as('getDocumentTypes');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait(['@getDocuments', '@getDocumentTypes']);
    });

    it('should open upload modal with all required fields', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      cy.get('[data-testid="upload-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', /upload|add/i);

      // Form fields
      cy.get('[data-testid="select-document-type"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-document-name"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="textarea-description"]').should('be.visible');

      cy.get('[data-testid="file-upload-area"]')
        .should('be.visible')
        .and('contain.text', /drag|drop|browse/i);

      // Modal actions
      cy.get('[data-testid="button-cancel-upload"]').should('be.visible');
      cy.get('[data-testid="button-submit-upload"]')
        .should('be.visible')
        .and('be.disabled');
    });

    it('should validate required fields before enabling submit', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      // Submit should be disabled initially
      cy.get('[data-testid="button-submit-upload"]').should('be.disabled');

      // Fill document type
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-resume"]').click();
      cy.get('[data-testid="button-submit-upload"]').should('be.disabled');

      // Fill document name
      cy.get('[data-testid="input-document-name"]').type(testData.documents.valid.name);
      cy.get('[data-testid="button-submit-upload"]').should('be.disabled');

      // Add file (mock file selection)
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['test content'], testData.documents.valid.file, {
          type: 'application/pdf'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      // Submit should now be enabled
      cy.get('[data-testid="button-submit-upload"]').should('not.be.disabled');
    });

    it('should validate file type and size restrictions', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      // Test invalid file type
      cy.get('[data-testid="file-input"]').then(($input) => {
        const invalidFile = new File(['test content'], 'test.txt', {
          type: 'text/plain'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(invalidFile);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      cy.get('[data-testid="file-error"]')
        .should('be.visible')
        .and('contain.text', /file type|format/i);

      // Clear and test valid file type
      cy.get('[data-testid="button-clear-file"]').click();
      
      cy.get('[data-testid="file-input"]').then(($input) => {
        const validFile = new File(['test content'], 'test.pdf', {
          type: 'application/pdf'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(validFile);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      cy.get('[data-testid="file-error"]').should('not.exist');
      cy.get('[data-testid="file-preview"]').should('be.visible');
    });

    it('should handle successful document upload', () => {
      cy.intercept('POST', apiEndpoints.objectUpload, {
        statusCode: 200,
        body: {
          success: true,
          data: {
            url: 'https://storage.example.com/documents/test-resume.pdf',
            filename: 'test-resume.pdf'
          }
        }
      }).as('uploadFile');

      cy.intercept('POST', apiEndpoints.consultantDocuments(testData.consultant.id), {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '3',
            name: testData.documents.valid.name,
            type: testData.documents.valid.type,
            status: 'pending',
            uploadedAt: new Date().toISOString(),
            description: testData.documents.valid.description
          }
        }
      }).as('createDocument');

      cy.get('[data-testid="button-upload-document"]').click();

      // Fill form
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-resume"]').click();
      
      cy.get('[data-testid="input-document-name"]')
        .type(testData.documents.valid.name);
      
      cy.get('[data-testid="textarea-description"]')
        .type(testData.documents.valid.description);

      // Upload file
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['test content'], testData.documents.valid.file, {
          type: 'application/pdf'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      // Submit upload
      cy.get('[data-testid="button-submit-upload"]').click();

      // Verify API calls
      cy.wait('@uploadFile');
      cy.wait('@createDocument');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /uploaded|success/i);

      // Verify modal closes
      cy.get('[data-testid="upload-modal"]').should('not.exist');
    });

    it('should handle upload errors gracefully', () => {
      cy.intercept('POST', apiEndpoints.objectUpload, {
        statusCode: 500,
        body: {
          success: false,
          error: 'File upload failed'
        }
      }).as('uploadFileFail');

      cy.get('[data-testid="button-upload-document"]').click();

      // Fill form
      cy.get('[data-testid="select-document-type"]').click();
      cy.get('[data-testid="option-resume"]').click();
      
      cy.get('[data-testid="input-document-name"]')
        .type(testData.documents.valid.name);

      // Upload file
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['test content'], testData.documents.valid.file, {
          type: 'application/pdf'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      // Submit upload
      cy.get('[data-testid="button-submit-upload"]').click();

      cy.wait('@uploadFileFail');

      // Verify error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /upload failed|error/i);

      // Verify modal remains open
      cy.get('[data-testid="upload-modal"]').should('be.visible');
      cy.get('[data-testid="button-submit-upload"]').should('not.be.disabled');
    });

    it('should support drag and drop file upload', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      // Test drag over effect
      cy.get('[data-testid="file-upload-area"]').trigger('dragover');
      cy.get('[data-testid="file-upload-area"]')
        .should('have.class', /drag-over|active/i);

      // Test drag leave
      cy.get('[data-testid="file-upload-area"]').trigger('dragleave');
      cy.get('[data-testid="file-upload-area"]')
        .should('not.have.class', /drag-over|active/i);

      // Test file drop
      cy.fixture('test-file.pdf', 'base64').then(fileContent => {
        const file = {
          name: 'test-document.pdf',
          type: 'application/pdf',
          content: fileContent
        };

        cy.get('[data-testid="file-upload-area"]')
          .trigger('drop', {
            dataTransfer: {
              files: [file]
            }
          });
      });

      cy.get('[data-testid="file-preview"]').should('be.visible');
      cy.get('[data-testid="file-name"]').should('contain.text', 'test-document.pdf');
    });
  });

  describe('Document Management Actions', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Resume.pdf',
              type: 'resume',
              status: 'pending',
              uploadedAt: '2024-01-15T10:00:00Z',
              uploadedBy: 'John Doe',
              fileSize: 1024000,
              description: 'Professional resume',
              url: 'https://storage.example.com/documents/resume.pdf'
            },
            {
              id: '2',
              name: 'License.pdf',
              type: 'license',
              status: 'approved',
              uploadedAt: '2024-01-20T14:30:00Z',
              uploadedBy: 'Jane Smith',
              fileSize: 2048000,
              expiryDate: '2025-12-31',
              description: 'Medical license',
              url: 'https://storage.example.com/documents/license.pdf'
            }
          ]
        }
      }).as('getDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should allow viewing document details', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="button-view-document"]').click();
      });

      cy.get('[data-testid="document-modal"]').should('be.visible');
      cy.get('[data-testid="document-name"]').should('contain.text', 'Resume.pdf');
      cy.get('[data-testid="document-type"]').should('contain.text', 'resume');
      cy.get('[data-testid="document-status"]').should('contain.text', 'pending');
      cy.get('[data-testid="document-description"]')
        .should('contain.text', 'Professional resume');
      
      // Document actions
      cy.get('[data-testid="button-download"]').should('be.visible');
      cy.get('[data-testid="button-replace"]').should('be.visible');
      
      // Close modal
      cy.get('[data-testid="button-close-modal"]').click();
      cy.get('[data-testid="document-modal"]').should('not.exist');
    });

    it('should handle document status changes', () => {
      cy.intercept('PATCH', apiEndpoints.documentStatus('1'), {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: '1',
            status: 'approved'
          }
        }
      }).as('updateStatus');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="button-document-actions"]').click();
      });

      cy.get('[data-testid="dropdown-menu"]').should('be.visible');
      cy.get('[data-testid="action-approve"]').click();

      // Confirmation dialog
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-title"]')
        .should('contain.text', /approve|confirm/i);
      
      cy.get('[data-testid="button-confirm"]').click();

      cy.wait('@updateStatus');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /approved|success/i);
    });

    it('should allow document replacement', () => {
      cy.intercept('PUT', apiEndpoints.uploadDocuments(testData.consultant.id), {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: '1',
            name: 'Updated-Resume.pdf',
            status: 'pending'
          }
        }
      }).as('replaceDocument');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="button-document-actions"]').click();
      });

      cy.get('[data-testid="action-replace"]').click();

      // Replace modal
      cy.get('[data-testid="replace-modal"]').should('be.visible');
      cy.get('[data-testid="current-document"]')
        .should('contain.text', 'Resume.pdf');

      // Upload new file
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['updated content'], 'Updated-Resume.pdf', {
          type: 'application/pdf'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      cy.get('[data-testid="button-replace-confirm"]').click();

      cy.wait('@replaceDocument');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /replaced|updated/i);
    });

    it('should allow document deletion with confirmation', () => {
      cy.intercept('DELETE', `/api/documents/1`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocument');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="button-document-actions"]').click();
      });

      cy.get('[data-testid="action-delete"]').click();

      // Confirmation dialog
      cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-title"]')
        .should('contain.text', /delete|remove/i);
      
      cy.get('[data-testid="document-name-confirm"]')
        .should('contain.text', 'Resume.pdf');

      // Type confirmation text
      cy.get('[data-testid="input-confirm-delete"]')
        .should('have.attr', 'placeholder')
        .and('contain', /type|confirm/i);
      
      cy.get('[data-testid="input-confirm-delete"]').type('DELETE');
      cy.get('[data-testid="button-confirm-delete"]').should('not.be.disabled');
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteDocument');

      // Verify document removed from list
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);
    });

    it('should handle bulk document actions', () => {
      // Select multiple documents
      cy.get('[data-testid="checkbox-select-document"]').first().check();
      cy.get('[data-testid="checkbox-select-document"]').last().check();

      // Bulk actions should appear
      cy.get('[data-testid="bulk-actions-bar"]').should('be.visible');
      cy.get('[data-testid="selected-count"]').should('contain.text', '2');

      // Test bulk approval
      cy.intercept('PATCH', '/api/documents/bulk/status', {
        statusCode: 200,
        body: {
          success: true,
          updated: ['1', '2']
        }
      }).as('bulkUpdate');

      cy.get('[data-testid="button-bulk-approve"]').click();
      
      cy.get('[data-testid="bulk-confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-bulk"]').click();

      cy.wait('@bulkUpdate');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /approved|updated/i);
    });
  });

  describe('Document Search and Filtering', () => {
    beforeEach(() => {
      const documents = [
        {
          id: '1',
          name: 'Resume-John-Doe.pdf',
          type: 'resume',
          status: 'approved',
          uploadedAt: '2024-01-15T10:00:00Z',
          uploadedBy: 'John Doe'
        },
        {
          id: '2',
          name: 'Medical-License.pdf',
          type: 'license',
          status: 'pending',
          uploadedAt: '2024-01-20T14:30:00Z',
          uploadedBy: 'Jane Smith',
          expiryDate: '2025-12-31'
        },
        {
          id: '3',
          name: 'BLS-Certification.pdf',
          type: 'certification',
          status: 'rejected',
          uploadedAt: '2024-01-25T09:15:00Z',
          uploadedBy: 'John Doe',
          expiryDate: '2024-12-31'
        }
      ];

      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), (req) => {
        let filteredDocs = [...documents];
        
        // Handle search query
        if (req.query.search) {
          const searchTerm = req.query.search.toLowerCase();
          filteredDocs = filteredDocs.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm) ||
            doc.type.toLowerCase().includes(searchTerm)
          );
        }
        
        // Handle type filter
        if (req.query.type) {
          filteredDocs = filteredDocs.filter(doc => doc.type === req.query.type);
        }
        
        // Handle status filter
        if (req.query.status) {
          filteredDocs = filteredDocs.filter(doc => doc.status === req.query.status);
        }

        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: filteredDocs,
            total: filteredDocs.length
          }
        });
      }).as('getDocumentsWithFilter');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocumentsWithFilter');
    });

    it('should filter documents by search term', () => {
      // Search by document name
      cy.get('[data-testid="search-documents"]').type('Resume');
      cy.get('[data-testid="button-search"]').click();

      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-name"]').should('contain.text', 'Resume-John-Doe.pdf');

      // Clear search
      cy.get('[data-testid="search-documents"]').clear();
      cy.get('[data-testid="button-search"]').click();
      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 3);
    });

    it('should filter documents by type', () => {
      cy.get('[data-testid="filter-document-type"]').click();
      cy.get('[data-testid="option-license"]').click();

      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-name"]').should('contain.text', 'Medical-License.pdf');

      // Clear filter
      cy.get('[data-testid="filter-document-type"]').click();
      cy.get('[data-testid="option-all"]').click();
      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 3);
    });

    it('should filter documents by status', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-pending"]').click();

      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-status"]').should('contain.text', 'pending');

      // Test rejected status
      cy.get('[data-testid="filter-status"]').click();
      cy.get('[data-testid="option-rejected"]').click();
      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-status"]').should('contain.text', 'rejected');
    });

    it('should combine multiple filters', () => {
      // Search for "BLS" and filter by certification type
      cy.get('[data-testid="search-documents"]').type('BLS');
      cy.get('[data-testid="filter-document-type"]').click();
      cy.get('[data-testid="option-certification"]').click();

      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-name"]').should('contain.text', 'BLS-Certification.pdf');
    });

    it('should show no results state when filters return empty', () => {
      cy.get('[data-testid="search-documents"]').type('NonexistentDocument');
      cy.get('[data-testid="button-search"]').click();

      cy.wait('@getDocumentsWithFilter');
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]').should('contain.text', /no documents/i);
      cy.get('[data-testid="button-clear-filters"]').should('be.visible');
    });

    it('should sort documents by different criteria', () => {
      cy.get('[data-testid="sort-dropdown"]').click();
      
      // Sort by name
      cy.get('[data-testid="sort-name-asc"]').click();
      cy.wait('@getDocumentsWithFilter');
      
      cy.get('[data-testid="document-name"]').first()
        .should('contain.text', 'BLS-Certification.pdf');

      // Sort by upload date
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-date-desc"]').click();
      cy.wait('@getDocumentsWithFilter');
      
      cy.get('[data-testid="document-name"]').first()
        .should('contain.text', 'BLS-Certification.pdf');
    });
  });

  describe('Document Types Management', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Resume',
              description: 'Professional resume',
              required: true,
              expiryRequired: false
            },
            {
              id: '2',
              name: 'License',
              description: 'Medical license',
              required: true,
              expiryRequired: true
            }
          ]
        }
      }).as('getDocumentTypes');

      // Navigate to document types management (admin only)
      cy.visit('/admin/document-types');
      cy.wait('@getDocumentTypes');
    });

    it('should display document types list with management options', () => {
      cy.get('[data-testid="page-title"]').should('contain.text', 'Document Types');
      cy.get('[data-testid="button-add-document-type"]').should('be.visible');

      // Document types list
      cy.get('[data-testid="document-type-item"]').should('have.length', 2);
      
      cy.get('[data-testid="document-type-item"]').first().within(() => {
        cy.get('[data-testid="type-name"]').should('contain.text', 'Resume');
        cy.get('[data-testid="type-description"]')
          .should('contain.text', 'Professional resume');
        cy.get('[data-testid="required-badge"]').should('be.visible');
        cy.get('[data-testid="button-edit-type"]').should('be.visible');
        cy.get('[data-testid="button-delete-type"]').should('be.visible');
      });
    });

    it('should allow creating new document type', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: {
          success: true,
          data: {
            id: '3',
            ...testData.documentTypes.new
          }
        }
      }).as('createDocumentType');

      cy.get('[data-testid="button-add-document-type"]').click();

      cy.get('[data-testid="document-type-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Add Document Type');

      // Fill form
      cy.get('[data-testid="input-type-name"]')
        .type(testData.documentTypes.new.name);
      
      cy.get('[data-testid="textarea-type-description"]')
        .type(testData.documentTypes.new.description);
      
      cy.get('[data-testid="checkbox-required"]').check();
      cy.get('[data-testid="checkbox-expiry-required"]').should('not.be.checked');

      cy.get('[data-testid="button-save-type"]').click();

      cy.wait('@createDocumentType');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created|added/i);
    });

    it('should validate document type form fields', () => {
      cy.get('[data-testid="button-add-document-type"]').click();

      // Test empty submission
      cy.get('[data-testid="button-save-type"]').click();
      cy.get('[data-testid="error-type-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      // Test duplicate name validation
      cy.get('[data-testid="input-type-name"]').type('Resume');
      cy.get('[data-testid="input-type-name"]').blur();
      cy.get('[data-testid="error-type-name"]')
        .should('be.visible')
        .and('contain.text', /already exists|duplicate/i);

      // Test valid input
      cy.get('[data-testid="input-type-name"]').clear().type('New Document Type');
      cy.get('[data-testid="error-type-name"]').should('not.exist');
    });

    it('should allow editing existing document type', () => {
      cy.intercept('PUT', `/api/document-types/1`, {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: '1',
            name: 'Professional Resume',
            description: 'Updated professional resume',
            required: true,
            expiryRequired: false
          }
        }
      }).as('updateDocumentType');

      cy.get('[data-testid="document-type-item"]').first().within(() => {
        cy.get('[data-testid="button-edit-type"]').click();
      });

      cy.get('[data-testid="document-type-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Document Type');

      // Fields should be pre-filled
      cy.get('[data-testid="input-type-name"]').should('have.value', 'Resume');
      
      // Update fields
      cy.get('[data-testid="input-type-name"]')
        .clear()
        .type('Professional Resume');
      
      cy.get('[data-testid="textarea-type-description"]')
        .clear()
        .type('Updated professional resume');

      cy.get('[data-testid="button-save-type"]').click();

      cy.wait('@updateDocumentType');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|saved/i);
    });

    it('should allow deleting document type with confirmation', () => {
      cy.intercept('DELETE', `/api/document-types/2`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocumentType');

      cy.get('[data-testid="document-type-item"]').last().within(() => {
        cy.get('[data-testid="button-delete-type"]').click();
      });

      cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-message"]')
        .should('contain.text', /delete|remove/i)
        .and('contain.text', 'License');

      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteDocumentType');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted|removed/i);
    });
  });

  describe('Document Compliance and Expiry', () => {
    beforeEach(() => {
      const documentsWithExpiry = [
        {
          id: '1',
          name: 'Medical-License.pdf',
          type: 'license',
          status: 'approved',
          expiryDate: '2024-12-31',
          uploadedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'BLS-Certification.pdf',
          type: 'certification',
          status: 'approved',
          expiryDate: '2024-02-15', // Expired
          uploadedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          name: 'ACLS-Certification.pdf',
          type: 'certification',
          status: 'approved',
          expiryDate: '2024-01-30', // Expiring soon
          uploadedAt: '2024-01-25T09:15:00Z'
        }
      ];

      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 200,
        body: {
          success: true,
          data: documentsWithExpiry
        }
      }).as('getDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should display expiry status indicators', () => {
      // Valid document
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="expiry-status"]')
          .should('be.visible')
          .and('have.class', /valid|active/i);
        cy.get('[data-testid="expiry-date"]')
          .should('contain.text', '2024-12-31');
      });

      // Expired document
      cy.get('[data-testid="document-item"]').eq(1).within(() => {
        cy.get('[data-testid="expiry-status"]')
          .should('be.visible')
          .and('have.class', /expired|danger/i);
        cy.get('[data-testid="expiry-warning"]')
          .should('be.visible')
          .and('contain.text', /expired/i);
      });

      // Expiring soon document
      cy.get('[data-testid="document-item"]').last().within(() => {
        cy.get('[data-testid="expiry-status"]')
          .should('be.visible')
          .and('have.class', /warning|expiring/i);
        cy.get('[data-testid="expiry-warning"]')
          .should('be.visible')
          .and('contain.text', /expiring/i);
      });
    });

    it('should show compliance dashboard', () => {
      cy.get('[data-testid="compliance-summary"]').should('be.visible');
      cy.get('[data-testid="expired-count"]').should('contain.text', '1');
      cy.get('[data-testid="expiring-count"]').should('contain.text', '1');
      cy.get('[data-testid="valid-count"]').should('contain.text', '1');

      // Compliance percentage
      cy.get('[data-testid="compliance-percentage"]').should('be.visible');
      cy.get('[data-testid="compliance-status"]')
        .should('contain.text', /33%|partial/i);
    });

    it('should filter documents by expiry status', () => {
      cy.get('[data-testid="filter-expiry-status"]').click();
      
      // Show only expired documents
      cy.get('[data-testid="option-expired"]').click();
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-name"]')
        .should('contain.text', 'BLS-Certification.pdf');

      // Show expiring soon
      cy.get('[data-testid="filter-expiry-status"]').click();
      cy.get('[data-testid="option-expiring-soon"]').click();
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-name"]')
        .should('contain.text', 'ACLS-Certification.pdf');
    });

    it('should send expiry notifications', () => {
      cy.intercept('POST', '/api/notifications', {
        statusCode: 201,
        body: { success: true }
      }).as('sendNotification');

      cy.get('[data-testid="button-send-reminders"]').click();

      cy.get('[data-testid="reminder-modal"]').should('be.visible');
      cy.get('[data-testid="expired-list"]')
        .should('contain.text', 'BLS-Certification.pdf');
      cy.get('[data-testid="expiring-list"]')
        .should('contain.text', 'ACLS-Certification.pdf');

      cy.get('[data-testid="button-send-reminders-confirm"]').click();

      cy.wait('@sendNotification');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /reminder|notification/i);
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: '1',
              name: 'Test-Document.pdf',
              type: 'resume',
              status: 'approved',
              uploadedAt: '2024-01-15T10:00:00Z'
            }
          ]
        }
      }).as('getDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');

      // Mobile layout adjustments
      cy.get('[data-testid="documents-list"]').should('be.visible');
      cy.get('[data-testid="document-item"]').should('have.css', 'flex-direction', 'column');

      // Mobile-specific UI elements
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      cy.get('[data-testid="button-mobile-upload"]').should('be.visible');

      // Test mobile upload flow
      cy.get('[data-testid="button-mobile-upload"]').click();
      cy.get('[data-testid="upload-modal"]').should('be.visible');
      cy.get('[data-testid="modal-content"]')
        .should('have.css', 'width')
        .and('match', /100%|calc/);
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');

      // Tablet layout
      cy.get('[data-testid="documents-grid"]')
        .should('have.css', 'grid-template-columns')
        .and('match', /repeat|minmax/);

      // Actions should be accessible
      cy.get('[data-testid="button-upload-document"]').should('be.visible');
      cy.get('[data-testid="filter-controls"]').should('be.visible');
    });

    it('should have proper accessibility attributes', () => {
      // ARIA labels and roles
      cy.get('[data-testid="documents-list"]')
        .should('have.attr', 'role', 'list');
      
      cy.get('[data-testid="document-item"]')
        .should('have.attr', 'role', 'listitem')
        .and('have.attr', 'aria-label');

      // Button accessibility
      cy.get('[data-testid="button-upload-document"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'type', 'button');

      // Form accessibility
      cy.get('[data-testid="search-documents"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');

      // Focus management
      cy.get('[data-testid="button-upload-document"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'button-upload-document');
    });

    it('should support keyboard navigation', () => {
      // Tab through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-documents');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-document-type');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'button-upload-document');

      // Enter key activation
      cy.focused().type('{enter}');
      cy.get('[data-testid="upload-modal"]').should('be.visible');

      // Escape key modal close
      cy.get('body').type('{esc}');
      cy.get('[data-testid="upload-modal"]').should('not.exist');
    });

    it('should handle high contrast mode', () => {
      // Test with forced colors
      cy.get('[data-testid="document-status"]')
        .should('have.css', 'border')
        .and('not.equal', 'none');

      cy.get('[data-testid="button-upload-document"]')
        .should('have.css', 'border-width')
        .and('not.equal', '0px');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 500,
        body: { success: false, error: 'Server error' }
      }).as('getDocumentsError');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocumentsError');

      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-message"]')
        .should('contain.text', /error|failed/i);
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should handle empty documents list', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getEmptyDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getEmptyDocuments');

      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-message"]')
        .should('contain.text', /no documents/i);
      cy.get('[data-testid="button-upload-first"]').should('be.visible');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', apiEndpoints.consultantDocuments('*'), {
        statusCode: 403,
        body: { success: false, error: 'Unauthorized' }
      }).as('getUnauthorized');

      cy.visit(`/consultants/unauthorized-consultant/documents`);
      cy.wait('@getUnauthorized');

      cy.get('[data-testid="unauthorized-state"]').should('be.visible');
      cy.get('[data-testid="unauthorized-message"]')
        .should('contain.text', /unauthorized|permission/i);
    });

    it('should handle large file upload errors', () => {
      cy.get('[data-testid="button-upload-document"]').click();

      // Simulate large file
      cy.get('[data-testid="file-input"]').then(($input) => {
        // Create a large file (mock)
        const largeFile = new File(['x'.repeat(50 * 1024 * 1024)], 'large-file.pdf', {
          type: 'application/pdf'
        });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        $input[0].files = dataTransfer.files;
        
        cy.wrap($input).trigger('change', { force: true });
      });

      cy.get('[data-testid="file-error"]')
        .should('be.visible')
        .and('contain.text', /too large|size/i);
    });

    it('should handle concurrent document operations', () => {
      // Multiple users editing same document
      cy.intercept('PATCH', apiEndpoints.documentStatus('1'), {
        statusCode: 409,
        body: {
          success: false,
          error: 'Document was modified by another user'
        }
      }).as('conflictError');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="button-document-actions"]').click();
      });

      cy.get('[data-testid="action-approve"]').click();
      cy.get('[data-testid="button-confirm"]').click();

      cy.wait('@conflictError');

      cy.get('[data-testid="conflict-dialog"]').should('be.visible');
      cy.get('[data-testid="conflict-message"]')
        .should('contain.text', /modified|conflict/i);
      cy.get('[data-testid="button-reload"]').should('be.visible');
    });
  });
});
