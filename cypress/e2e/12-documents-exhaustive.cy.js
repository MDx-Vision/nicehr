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
    documentTypes: {
      valid: 'Resume',
      certificate: 'Certificate',
      license: 'License',
      custom: 'Custom Document Type'
    },
    documents: {
      valid: {
        name: 'Test Resume.pdf',
        type: 'Resume',
        description: 'Test resume document',
        size: 1024000, // 1MB
        mimeType: 'application/pdf'
      },
      large: {
        name: 'Large Document.pdf',
        type: 'Certificate',
        description: 'Large test document',
        size: 15728640, // 15MB
        mimeType: 'application/pdf'
      },
      invalid: {
        name: 'Invalid Document.exe',
        type: 'Resume',
        description: 'Invalid file type',
        size: 1024,
        mimeType: 'application/x-executable'
      }
    }
  };

  const apiEndpoints = {
    auth: {
      login: '/api/auth/login',
      user: '/api/auth/user'
    },
    consultants: '/api/consultants',
    documents: (consultantId) => `/api/consultants/${consultantId}/documents`,
    documentTypes: '/api/document-types',
    documentStatus: (id) => `/api/documents/${id}/status`,
    upload: '/api/objects/upload',
    objects: (path) => `/objects/${path}`,
    publicObjects: (path) => `/public-objects/${path}`
  };

  // Authentication helper
  const loginAsUser = () => {
    cy.session('user-session', () => {
      cy.request({
        method: 'POST',
        url: apiEndpoints.auth.login,
        body: {
          email: testData.user.email,
          password: testData.user.password
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        window.localStorage.setItem('auth-token', response.body.token);
      });
    });
  };

  beforeEach(() => {
    // Clear all storage
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login before each test
    loginAsUser();
  });

  describe('Document Types Management', () => {
    beforeEach(() => {
      cy.visit('/admin/document-types');
    });

    it('should display document types management page with all components', () => {
      // Page header and title
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'Document Types');

      // Add document type button
      cy.get('[data-testid="add-document-type-btn"]')
        .should('be.visible')
        .and('not.be.disabled');

      // Document types list
      cy.get('[data-testid="document-types-list"]').should('be.visible');

      // Search functionality if present
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-document-types"]').length > 0) {
          cy.get('[data-testid="search-document-types"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
        }
      });
    });

    it('should create new document type successfully', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 201,
        body: {
          id: 'new-doc-type-1',
          name: testData.documentTypes.custom,
          description: 'Custom document type for testing',
          isRequired: false,
          createdAt: new Date().toISOString()
        }
      }).as('createDocumentType');

      // Click add button
      cy.get('[data-testid="add-document-type-btn"]').click();

      // Fill form in modal/page
      cy.get('[data-testid="document-type-form"]').should('be.visible');
      cy.get('[data-testid="input-document-type-name"]')
        .should('be.visible')
        .type(testData.documentTypes.custom);
      
      cy.get('[data-testid="input-document-type-description"]')
        .should('be.visible')
        .type('Custom document type for testing');

      // Submit form
      cy.get('[data-testid="submit-document-type"]').click();

      // Verify API call
      cy.wait('@createDocumentType').then((interception) => {
        expect(interception.request.body).to.deep.include({
          name: testData.documentTypes.custom,
          description: 'Custom document type for testing'
        });
      });

      // Verify success feedback
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type created successfully');
    });

    it('should validate required fields when creating document type', () => {
      cy.get('[data-testid="add-document-type-btn"]').click();
      cy.get('[data-testid="document-type-form"]').should('be.visible');

      // Try to submit without filling required fields
      cy.get('[data-testid="submit-document-type"]').click();

      // Verify validation messages
      cy.get('[data-testid="error-document-type-name"]')
        .should('be.visible')
        .and('contain.text', 'Name is required');

      // Fill name but leave description empty
      cy.get('[data-testid="input-document-type-name"]')
        .type(testData.documentTypes.custom);
      
      cy.get('[data-testid="submit-document-type"]').click();

      // Verify name validation passes
      cy.get('[data-testid="error-document-type-name"]').should('not.exist');
    });

    it('should handle API errors when creating document type', () => {
      cy.intercept('POST', apiEndpoints.documentTypes, {
        statusCode: 400,
        body: { error: 'Document type name already exists' }
      }).as('createDocumentTypeError');

      cy.get('[data-testid="add-document-type-btn"]').click();
      cy.get('[data-testid="input-document-type-name"]')
        .type(testData.documentTypes.custom);
      cy.get('[data-testid="submit-document-type"]').click();

      cy.wait('@createDocumentTypeError');

      // Verify error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Document type name already exists');
    });

    it('should load and display existing document types', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: [
          {
            id: 'type-1',
            name: 'Resume',
            description: 'Professional resume',
            isRequired: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'type-2',
            name: 'Certificate',
            description: 'Professional certificates',
            isRequired: false,
            createdAt: new Date().toISOString()
          }
        ]
      }).as('getDocumentTypes');

      cy.reload();
      cy.wait('@getDocumentTypes');

      // Verify document types are displayed
      cy.get('[data-testid="document-type-item"]').should('have.length', 2);
      cy.get('[data-testid="document-type-item"]').first()
        .should('contain.text', 'Resume')
        .and('contain.text', 'Professional resume');
    });

    it('should handle empty state when no document types exist', () => {
      cy.intercept('GET', apiEndpoints.documentTypes, {
        statusCode: 200,
        body: []
      }).as('getEmptyDocumentTypes');

      cy.reload();
      cy.wait('@getEmptyDocumentTypes');

      // Verify empty state
      cy.get('[data-testid="empty-document-types"]')
        .should('be.visible')
        .and('contain.text', 'No document types found');
      
      cy.get('[data-testid="empty-state-icon"]').should('be.visible');
      cy.get('[data-testid="create-first-document-type-btn"]')
        .should('be.visible')
        .and('contain.text', 'Create First Document Type');
    });
  });

  describe('Consultant Documents Management', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should display consultant documents page with all components', () => {
      // Page header
      cy.get('[data-testid="consultant-documents-header"]').should('be.visible');
      cy.get('h1').should('contain.text', 'Documents');

      // Upload button
      cy.get('[data-testid="upload-document-btn"]')
        .should('be.visible')
        .and('not.be.disabled');

      // Documents list/grid
      cy.get('[data-testid="documents-container"]').should('be.visible');

      // Filter and search options
      cy.get('[data-testid="document-filters"]').should('be.visible');
      
      // View toggle (list/grid)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="view-toggle"]').length > 0) {
          cy.get('[data-testid="view-toggle"]').should('be.visible');
        }
      });
    });

    it('should upload document successfully', () => {
      const fileName = testData.documents.valid.name;
      const fileContent = 'Mock PDF content';

      // Mock file upload APIs
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 200,
        body: { 
          url: `/objects/documents/${fileName}`,
          path: `documents/${fileName}`,
          size: testData.documents.valid.size
        }
      }).as('uploadFile');

      cy.intercept('POST', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 201,
        body: {
          id: 'doc-1',
          name: fileName,
          type: testData.documents.valid.type,
          description: testData.documents.valid.description,
          url: `/objects/documents/${fileName}`,
          status: 'pending',
          uploadedAt: new Date().toISOString()
        }
      }).as('createDocument');

      // Click upload button
      cy.get('[data-testid="upload-document-btn"]').click();

      // Verify upload modal/form appears
      cy.get('[data-testid="upload-document-modal"]').should('be.visible');

      // Fill upload form
      cy.get('[data-testid="document-type-select"]').select(testData.documents.valid.type);
      cy.get('[data-testid="document-description"]').type(testData.documents.valid.description);

      // Mock file selection
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File([fileContent], fileName, { type: testData.documents.valid.mimeType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
      });

      // Trigger file change event
      cy.get('[data-testid="file-input"]').trigger('change');

      // Verify file preview
      cy.get('[data-testid="file-preview"]').should('be.visible');
      cy.get('[data-testid="file-preview-name"]').should('contain.text', fileName);
      cy.get('[data-testid="file-preview-size"]').should('contain.text', '1.0 MB');

      // Submit upload
      cy.get('[data-testid="submit-upload"]').click();

      // Verify API calls
      cy.wait('@uploadFile');
      cy.wait('@createDocument');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document uploaded successfully');

      // Verify modal closes
      cy.get('[data-testid="upload-document-modal"]').should('not.exist');
    });

    it('should validate file upload requirements', () => {
      cy.get('[data-testid="upload-document-btn"]').click();
      cy.get('[data-testid="upload-document-modal"]').should('be.visible');

      // Test without selecting file
      cy.get('[data-testid="submit-upload"]').click();
      cy.get('[data-testid="error-file-required"]')
        .should('be.visible')
        .and('contain.text', 'Please select a file');

      // Test without document type
      const fileName = testData.documents.valid.name;
      const fileContent = 'Mock PDF content';
      
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File([fileContent], fileName, { type: testData.documents.valid.mimeType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
      });
      cy.get('[data-testid="file-input"]').trigger('change');
      
      cy.get('[data-testid="submit-upload"]').click();
      cy.get('[data-testid="error-document-type-required"]')
        .should('be.visible')
        .and('contain.text', 'Please select a document type');
    });

    it('should reject invalid file types', () => {
      cy.get('[data-testid="upload-document-btn"]').click();
      
      const invalidFile = testData.documents.invalid;
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['executable content'], invalidFile.name, { 
          type: invalidFile.mimeType 
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
      });
      
      cy.get('[data-testid="file-input"]').trigger('change');

      // Verify error message for invalid file type
      cy.get('[data-testid="error-invalid-file-type"]')
        .should('be.visible')
        .and('contain.text', 'File type not allowed');
    });

    it('should reject files that exceed size limit', () => {
      cy.get('[data-testid="upload-document-btn"]').click();
      
      const largeFile = testData.documents.large;
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['x'.repeat(largeFile.size)], largeFile.name, { 
          type: largeFile.mimeType 
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
      });
      
      cy.get('[data-testid="file-input"]').trigger('change');

      // Verify error message for file size
      cy.get('[data-testid="error-file-too-large"]')
        .should('be.visible')
        .and('contain.text', 'File size exceeds maximum limit');
    });

    it('should display uploaded documents list', () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Resume.pdf',
          type: 'Resume',
          description: 'Professional resume',
          status: 'approved',
          url: '/objects/documents/resume.pdf',
          uploadedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'doc-2',
          name: 'Certificate.pdf',
          type: 'Certificate',
          description: 'Professional certificate',
          status: 'pending',
          url: '/objects/documents/certificate.pdf',
          uploadedAt: '2024-01-14T15:30:00Z'
        }
      ];

      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: mockDocuments
      }).as('getDocuments');

      cy.reload();
      cy.wait('@getDocuments');

      // Verify documents are displayed
      cy.get('[data-testid="document-item"]').should('have.length', 2);
      
      // Verify first document
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="document-name"]').should('contain.text', 'Resume.pdf');
        cy.get('[data-testid="document-type"]').should('contain.text', 'Resume');
        cy.get('[data-testid="document-status"]').should('contain.text', 'approved');
        cy.get('[data-testid="document-description"]')
          .should('contain.text', 'Professional resume');
        cy.get('[data-testid="document-date"]').should('be.visible');
      });

      // Verify status badges
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="status-badge-approved"]').should('be.visible');
      
      cy.get('[data-testid="document-item"]').last()
        .find('[data-testid="status-badge-pending"]').should('be.visible');
    });

    it('should handle document actions (view, download, delete)', () => {
      const mockDocument = {
        id: 'doc-1',
        name: 'Resume.pdf',
        type: 'Resume',
        description: 'Professional resume',
        status: 'approved',
        url: '/objects/documents/resume.pdf',
        uploadedAt: '2024-01-15T10:00:00Z'
      };

      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: [mockDocument]
      }).as('getDocuments');

      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');

      // Test view document
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="view-document-btn"]').should('be.visible').click();
      });

      // Verify document viewer opens
      cy.get('[data-testid="document-viewer"]').should('be.visible');
      cy.get('[data-testid="document-viewer-close"]').click();

      // Test download document
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="download-document-btn"]').should('be.visible');
      });

      // Test delete document
      cy.intercept('DELETE', `/api/documents/${mockDocument.id}`, {
        statusCode: 200
      }).as('deleteDocument');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="document-actions-menu"]').click();
        cy.get('[data-testid="delete-document-btn"]').click();
      });

      // Confirm deletion
      cy.get('[data-testid="confirm-delete-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-delete-btn"]').click();

      cy.wait('@deleteDocument');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document deleted successfully');
    });

    it('should filter documents by type and status', () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Resume.pdf',
          type: 'Resume',
          status: 'approved'
        },
        {
          id: 'doc-2',
          name: 'Certificate.pdf',
          type: 'Certificate',
          status: 'pending'
        },
        {
          id: 'doc-3',
          name: 'License.pdf',
          type: 'License',
          status: 'rejected'
        }
      ];

      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: mockDocuments
      }).as('getDocuments');

      cy.reload();
      cy.wait('@getDocuments');

      // Test filter by document type
      cy.get('[data-testid="filter-document-type"]').select('Resume');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-item"]')
        .should('contain.text', 'Resume.pdf');

      // Test filter by status
      cy.get('[data-testid="filter-document-type"]').select('All Types');
      cy.get('[data-testid="filter-document-status"]').select('pending');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-item"]')
        .should('contain.text', 'Certificate.pdf');

      // Test combined filters
      cy.get('[data-testid="filter-document-type"]').select('License');
      cy.get('[data-testid="filter-document-status"]').select('rejected');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-item"]')
        .should('contain.text', 'License.pdf');

      // Clear filters
      cy.get('[data-testid="clear-filters-btn"]').click();
      cy.get('[data-testid="document-item"]').should('have.length', 3);
    });

    it('should search documents by name', () => {
      const mockDocuments = [
        { id: 'doc-1', name: 'Resume_John_Doe.pdf', type: 'Resume' },
        { id: 'doc-2', name: 'Certificate_AWS.pdf', type: 'Certificate' },
        { id: 'doc-3', name: 'License_Medical.pdf', type: 'License' }
      ];

      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: mockDocuments
      }).as('getDocuments');

      cy.reload();
      cy.wait('@getDocuments');

      // Search for specific document
      cy.get('[data-testid="search-documents"]').type('AWS');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-item"]')
        .should('contain.text', 'Certificate_AWS.pdf');

      // Search for partial name
      cy.get('[data-testid="search-documents"]').clear().type('Resume');
      cy.get('[data-testid="document-item"]').should('have.length', 1);
      cy.get('[data-testid="document-item"]')
        .should('contain.text', 'Resume_John_Doe.pdf');

      // Clear search
      cy.get('[data-testid="search-documents"]').clear();
      cy.get('[data-testid="document-item"]').should('have.length', 3);
    });

    it('should handle empty state when no documents exist', () => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: []
      }).as('getEmptyDocuments');

      cy.reload();
      cy.wait('@getEmptyDocuments');

      // Verify empty state
      cy.get('[data-testid="empty-documents-state"]')
        .should('be.visible')
        .and('contain.text', 'No documents uploaded');
      
      cy.get('[data-testid="empty-state-icon"]').should('be.visible');
      cy.get('[data-testid="upload-first-document-btn"]')
        .should('be.visible')
        .and('contain.text', 'Upload First Document');
    });
  });

  describe('Document Status Management', () => {
    const mockDocument = {
      id: 'doc-1',
      name: 'Resume.pdf',
      type: 'Resume',
      description: 'Professional resume',
      status: 'pending',
      consultantId: testData.consultant.id,
      uploadedAt: '2024-01-15T10:00:00Z'
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: [mockDocument]
      }).as('getDocuments');
      
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should approve document successfully', () => {
      cy.intercept('PATCH', apiEndpoints.documentStatus(mockDocument.id), {
        statusCode: 200,
        body: { ...mockDocument, status: 'approved' }
      }).as('approveDocument');

      // Access document actions
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="document-actions-menu"]').click();
        cy.get('[data-testid="approve-document-btn"]').click();
      });

      // Confirm approval
      cy.get('[data-testid="approve-document-modal"]').should('be.visible');
      cy.get('[data-testid="approve-document-comment"]')
        .type('Document meets all requirements');
      cy.get('[data-testid="confirm-approve-btn"]').click();

      cy.wait('@approveDocument').then((interception) => {
        expect(interception.request.body).to.deep.include({
          status: 'approved',
          comment: 'Document meets all requirements'
        });
      });

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document approved successfully');

      // Verify status update in UI
      cy.get('[data-testid="status-badge-approved"]').should('be.visible');
    });

    it('should reject document with reason', () => {
      cy.intercept('PATCH', apiEndpoints.documentStatus(mockDocument.id), {
        statusCode: 200,
        body: { ...mockDocument, status: 'rejected' }
      }).as('rejectDocument');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="document-actions-menu"]').click();
        cy.get('[data-testid="reject-document-btn"]').click();
      });

      // Provide rejection reason
      cy.get('[data-testid="reject-document-modal"]').should('be.visible');
      cy.get('[data-testid="rejection-reason"]')
        .type('Document quality is poor, please resubmit');
      cy.get('[data-testid="confirm-reject-btn"]').click();

      cy.wait('@rejectDocument').then((interception) => {
        expect(interception.request.body).to.deep.include({
          status: 'rejected',
          comment: 'Document quality is poor, please resubmit'
        });
      });

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document rejected');

      // Verify status update in UI
      cy.get('[data-testid="status-badge-rejected"]').should('be.visible');
    });

    it('should require rejection reason when rejecting document', () => {
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="document-actions-menu"]').click();
        cy.get('[data-testid="reject-document-btn"]').click();
      });

      cy.get('[data-testid="reject-document-modal"]').should('be.visible');
      
      // Try to reject without reason
      cy.get('[data-testid="confirm-reject-btn"]').click();

      // Verify validation error
      cy.get('[data-testid="error-rejection-reason-required"]')
        .should('be.visible')
        .and('contain.text', 'Rejection reason is required');
    });

    it('should reset document to pending status', () => {
      // First set document as rejected
      const rejectedDocument = { ...mockDocument, status: 'rejected' };
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: [rejectedDocument]
      }).as('getRejectedDocuments');
      
      cy.intercept('PATCH', apiEndpoints.documentStatus(mockDocument.id), {
        statusCode: 200,
        body: { ...mockDocument, status: 'pending' }
      }).as('resetDocumentStatus');

      cy.reload();
      cy.wait('@getRejectedDocuments');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="document-actions-menu"]').click();
        cy.get('[data-testid="reset-document-status-btn"]').click();
      });

      cy.get('[data-testid="confirm-reset-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-reset-btn"]').click();

      cy.wait('@resetDocumentStatus');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Document status reset to pending');
    });
  });

  describe('Document Viewer and Download', () => {
    const mockDocument = {
      id: 'doc-1',
      name: 'Resume.pdf',
      type: 'Resume',
      url: '/objects/documents/resume.pdf',
      consultantId: testData.consultant.id
    };

    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: [mockDocument]
      }).as('getDocuments');
      
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
      cy.wait('@getDocuments');
    });

    it('should open document viewer for PDF files', () => {
      // Mock document content
      cy.intercept('GET', mockDocument.url, {
        statusCode: 200,
        headers: { 'content-type': 'application/pdf' },
        body: 'Mock PDF content'
      }).as('getDocumentContent');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="view-document-btn"]').click();
      });

      cy.wait('@getDocumentContent');

      // Verify document viewer opens
      cy.get('[data-testid="document-viewer"]').should('be.visible');
      cy.get('[data-testid="document-viewer-title"]')
        .should('contain.text', mockDocument.name);
      
      // Verify viewer controls
      cy.get('[data-testid="document-viewer-close"]').should('be.visible');
      cy.get('[data-testid="document-viewer-download"]').should('be.visible');
      cy.get('[data-testid="document-viewer-fullscreen"]').should('be.visible');

      // Test close viewer
      cy.get('[data-testid="document-viewer-close"]').click();
      cy.get('[data-testid="document-viewer"]').should('not.exist');
    });

    it('should download documents', () => {
      // Mock download
      cy.window().then((win) => {
        cy.stub(win, 'open').as('windowOpen');
      });

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="download-document-btn"]').click();
      });

      // Verify download initiated
      cy.get('@windowOpen').should('have.been.calledWith', mockDocument.url);

      // Verify download tracking (if implemented)
      cy.get('[data-testid="download-success-message"]')
        .should('be.visible')
        .and('contain.text', 'Download started');
    });

    it('should handle viewer errors gracefully', () => {
      // Mock document loading error
      cy.intercept('GET', mockDocument.url, {
        statusCode: 404,
        body: { error: 'Document not found' }
      }).as('getDocumentError');

      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="view-document-btn"]').click();
      });

      cy.wait('@getDocumentError');

      // Verify error message
      cy.get('[data-testid="document-viewer-error"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load document');

      // Verify viewer still has close option
      cy.get('[data-testid="document-viewer-close"]').should('be.visible').click();
      cy.get('[data-testid="document-viewer"]').should('not.exist');
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should be responsive on mobile devices', () => {
      // Test mobile viewport
      cy.viewport(375, 667);

      // Verify mobile layout
      cy.get('[data-testid="mobile-document-header"]').should('be.visible');
      cy.get('[data-testid="mobile-upload-btn"]').should('be.visible');

      // Test mobile document list
      cy.get('[data-testid="document-item"]').should('have.class', 'mobile-layout');

      // Test mobile actions menu
      cy.get('[data-testid="document-item"]').first().within(() => {
        cy.get('[data-testid="mobile-actions-btn"]').click();
      });
      cy.get('[data-testid="mobile-actions-drawer"]').should('be.visible');
    });

    it('should be responsive on tablet devices', () => {
      // Test tablet viewport
      cy.viewport(768, 1024);

      // Verify tablet layout
      cy.get('[data-testid="tablet-document-grid"]').should('be.visible');
      cy.get('[data-testid="document-item"]').should('have.class', 'tablet-layout');
    });

    it('should have proper accessibility attributes', () => {
      // Check ARIA labels
      cy.get('[data-testid="upload-document-btn"]')
        .should('have.attr', 'aria-label', 'Upload new document');

      // Check keyboard navigation
      cy.get('[data-testid="upload-document-btn"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'upload-document-btn');

      // Test tab navigation
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'search-documents');

      // Check screen reader support
      cy.get('[data-testid="document-item"]').first()
        .should('have.attr', 'role', 'article')
        .and('have.attr', 'aria-labelledby');

      // Check color contrast and focus indicators
      cy.get('[data-testid="upload-document-btn"]').focus();
      cy.focused().should('have.css', 'outline-width').and('not.eq', '0px');
    });

    it('should support keyboard-only navigation', () => {
      // Navigate through document list using keyboard
      cy.get('[data-testid="document-item"]').first().focus();
      cy.focused().type('{enter}');

      // Verify document actions accessible via keyboard
      cy.get('[data-testid="document-actions-menu"]').type(' ');
      cy.get('[data-testid="view-document-btn"]').should('be.visible');

      // Navigate menu with arrow keys
      cy.focused().type('{downarrow}');
      cy.focused().should('have.attr', 'data-testid', 'download-document-btn');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        forceNetworkError: true
      }).as('networkError');

      cy.reload();
      cy.wait('@networkError');

      // Verify error state
      cy.get('[data-testid="network-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load documents');

      // Verify retry option
      cy.get('[data-testid="retry-load-documents"]')
        .should('be.visible')
        .and('contain.text', 'Retry');
    });

    it('should handle API timeout errors', () => {
      // Simulate timeout
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 408,
        body: { error: 'Request timeout' },
        delay: 30000
      }).as('timeoutError');

      cy.reload();
      cy.wait('@timeoutError');

      // Verify timeout handling
      cy.get('[data-testid="timeout-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Request timed out');
    });

    it('should handle server errors (5xx)', () => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');

      cy.reload();
      cy.wait('@serverError');

      // Verify server error handling
      cy.get('[data-testid="server-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Server error occurred');

      // Verify error details are logged but not exposed to user
      cy.get('[data-testid="error-details"]').should('not.exist');
    });

    it('should handle unauthorized access (401)', () => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedError');

      cy.reload();
      cy.wait('@unauthorizedError');

      // Should redirect to login or show auth error
      cy.url().should('match', /\/(login|unauthorized)/);
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: 'Invalid JSON response'
      }).as('malformedResponse');

      cy.reload();
      cy.wait('@malformedResponse');

      // Verify graceful handling of malformed response
      cy.get('[data-testid="data-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load document data');
    });

    it('should handle concurrent operations gracefully', () => {
      // Simulate multiple upload attempts
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 200,
        delay: 2000,
        body: { url: '/objects/documents/test.pdf' }
      }).as('slowUpload');

      cy.get('[data-testid="upload-document-btn"]').click();
      
      // Try to upload another file while first is still uploading
      cy.get('[data-testid="upload-document-btn"]').click();

      // Verify handling of concurrent operations
      cy.get('[data-testid="upload-in-progress-message"]')
        .should('be.visible')
        .and('contain.text', 'Upload already in progress');
    });
  });

  describe('Performance and Loading States', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should show loading states during data fetch', () => {
      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        delay: 2000,
        body: []
      }).as('slowDocumentLoad');

      cy.reload();

      // Verify loading indicator
      cy.get('[data-testid="documents-loading"]')
        .should('be.visible')
        .and('contain.text', 'Loading documents...');

      // Verify skeleton loader
      cy.get('[data-testid="document-skeleton"]').should('be.visible');

      cy.wait('@slowDocumentLoad');

      // Verify loading states are removed
      cy.get('[data-testid="documents-loading"]').should('not.exist');
      cy.get('[data-testid="document-skeleton"]').should('not.exist');
    });

    it('should show upload progress during file upload', () => {
      const fileName = 'test-document.pdf';
      
      // Mock progressive upload response
      cy.intercept('POST', apiEndpoints.upload, (req) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ statusCode: 200, body: { url: `/objects/${fileName}` } });
          }, 3000);
        });
      }).as('uploadWithProgress');

      cy.get('[data-testid="upload-document-btn"]').click();
      
      // Fill form and start upload
      cy.get('[data-testid="file-input"]').then(($input) => {
        const file = new File(['content'], fileName, { type: 'application/pdf' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
      });
      
      cy.get('[data-testid="file-input"]').trigger('change');
      cy.get('[data-testid="document-type-select"]').select('Resume');
      cy.get('[data-testid="submit-upload"]').click();

      // Verify progress indicators
      cy.get('[data-testid="upload-progress-bar"]').should('be.visible');
      cy.get('[data-testid="upload-progress-text"]')
        .should('be.visible')
        .and('contain.text', 'Uploading...');

      cy.wait('@uploadWithProgress');

      // Verify progress indicators are removed after completion
      cy.get('[data-testid="upload-progress-bar"]').should('not.exist');
      cy.get('[data-testid="upload-progress-text"]').should('not.exist');
    });

    it('should handle large document lists efficiently', () => {
      // Generate large dataset
      const largeDocumentList = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document_${i}.pdf`,
        type: 'Resume',
        status: 'approved',
        uploadedAt: new Date().toISOString()
      }));

      cy.intercept('GET', apiEndpoints.documents(testData.consultant.id), {
        statusCode: 200,
        body: largeDocumentList
      }).as('getLargeDocumentList');

      cy.reload();
      cy.wait('@getLargeDocumentList');

      // Verify virtual scrolling or pagination is implemented
      cy.get('[data-testid="document-item"]').should('have.length.at.most', 20);
      
      // Test pagination if implemented
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible');
          cy.get('[data-testid="next-page"]').click();
          cy.get('[data-testid="document-item"]').should('exist');
        }
      });

      // Test virtual scrolling if implemented
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="virtual-scroll-container"]').length > 0) {
          cy.get('[data-testid="virtual-scroll-container"]').scrollTo('bottom');
          cy.get('[data-testid="document-item"]').should('have.length.greaterThan', 20);
        }
      });
    });
  });
});
