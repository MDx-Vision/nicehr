describe('Objects Feature - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      id: 'ci-test-user'
    },
    consultant: {
      id: 'ci-test-consultant'
    },
    testFiles: {
      image: {
        name: 'test-image.jpg',
        type: 'image/jpeg',
        size: 1024 * 50 // 50KB
      },
      document: {
        name: 'test-document.pdf',
        type: 'application/pdf',
        size: 1024 * 100 // 100KB
      },
      largeFile: {
        name: 'large-file.pdf',
        type: 'application/pdf',
        size: 1024 * 1024 * 10 // 10MB
      },
      invalidFile: {
        name: 'test-script.js',
        type: 'application/javascript',
        size: 1024
      }
    }
  };

  const apiEndpoints = {
    upload: '/api/objects/upload',
    publicObjects: '/public-objects/*',
    privateObjects: '/objects/*',
    profilePhoto: `/api/users/${testData.ciUser.id}/profile-photo`,
    coverPhoto: `/api/users/${testData.ciUser.id}/cover-photo`,
    consultantDocuments: `/api/consultants/${testData.consultant.id}/documents`
  };

  const createTestFile = (fileData) => {
    const content = 'test content '.repeat(fileData.size / 12);
    return new File([content], fileData.name, { type: fileData.type });
  };

  beforeEach(() => {
    // Clear storage
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]', { timeout: 10000 })
      .should('be.visible')
      .type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]')
      .type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();

    // Wait for successful login
    cy.url({ timeout: 10000 }).should('not.include', '/login');
  });

  describe('Object Upload API - Core Functionality', () => {
    it('should handle file upload via API', () => {
      const file = createTestFile(testData.testFiles.image);
      const formData = new FormData();
      formData.append('file', file);

      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 200,
        body: {
          success: true,
          objectPath: 'uploads/test-image-123.jpg',
          publicUrl: '/public-objects/uploads/test-image-123.jpg',
          privateUrl: '/objects/uploads/test-image-123.jpg',
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type
          }
        }
      }).as('uploadFile');

      cy.request({
        method: 'POST',
        url: apiEndpoints.upload,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('objectPath');
        expect(response.body).to.have.property('publicUrl');
        expect(response.body).to.have.property('privateUrl');
      });
    });

    it('should reject files that are too large', () => {
      const largeFile = createTestFile(testData.testFiles.largeFile);
      const formData = new FormData();
      formData.append('file', largeFile);

      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 413,
        body: {
          success: false,
          error: 'File size exceeds maximum limit',
          maxSize: '5MB'
        }
      }).as('uploadLargeFile');

      cy.request({
        method: 'POST',
        url: apiEndpoints.upload,
        body: formData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(413);
        expect(response.body).to.have.property('success', false);
        expect(response.body.error).to.include('size');
      });
    });

    it('should reject invalid file types', () => {
      const invalidFile = createTestFile(testData.testFiles.invalidFile);
      const formData = new FormData();
      formData.append('file', invalidFile);

      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 400,
        body: {
          success: false,
          error: 'File type not allowed',
          allowedTypes: ['image/*', 'application/pdf', 'text/*']
        }
      }).as('uploadInvalidFile');

      cy.request({
        method: 'POST',
        url: apiEndpoints.upload,
        body: formData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.error).to.include('type');
      });
    });

    it('should handle upload without file', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 400,
        body: {
          success: false,
          error: 'No file provided'
        }
      }).as('uploadNoFile');

      cy.request({
        method: 'POST',
        url: apiEndpoints.upload,
        body: {},
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body.error).to.include('file');
      });
    });

    it('should handle server errors during upload', () => {
      const file = createTestFile(testData.testFiles.document);
      const formData = new FormData();
      formData.append('file', file);

      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 500,
        body: {
          success: false,
          error: 'Internal server error during upload'
        }
      }).as('uploadServerError');

      cy.request({
        method: 'POST',
        url: apiEndpoints.upload,
        body: formData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(500);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  describe('Object Access - Public vs Private', () => {
    const testObjectPath = 'uploads/test-file-123.jpg';

    it('should access public objects without authentication', () => {
      cy.clearCookies(); // Remove authentication

      cy.intercept('GET', `/public-objects/${testObjectPath}`, {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': '1024',
          'Cache-Control': 'public, max-age=3600'
        },
        body: 'fake-image-content'
      }).as('getPublicObject');

      cy.request({
        method: 'GET',
        url: `/public-objects/${testObjectPath}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers).to.have.property('content-type', 'image/jpeg');
        expect(response.headers).to.have.property('cache-control');
      });

      cy.wait('@getPublicObject');
    });

    it('should require authentication for private objects', () => {
      cy.clearCookies(); // Remove authentication

      cy.intercept('GET', `/objects/${testObjectPath}`, {
        statusCode: 401,
        body: {
          error: 'Authentication required'
        }
      }).as('getPrivateObjectUnauth');

      cy.request({
        method: 'GET',
        url: `/objects/${testObjectPath}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });

      cy.wait('@getPrivateObjectUnauth');
    });

    it('should access private objects with authentication', () => {
      cy.intercept('GET', `/objects/${testObjectPath}`, {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': '1024'
        },
        body: 'fake-private-image-content'
      }).as('getPrivateObject');

      cy.request({
        method: 'GET',
        url: `/objects/${testObjectPath}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers).to.have.property('content-type', 'image/jpeg');
      });

      cy.wait('@getPrivateObject');
    });

    it('should handle non-existent objects gracefully', () => {
      const nonExistentPath = 'uploads/non-existent-file.jpg';

      cy.intercept('GET', `/objects/${nonExistentPath}`, {
        statusCode: 404,
        body: {
          error: 'Object not found'
        }
      }).as('getNotFound');

      cy.request({
        method: 'GET',
        url: `/objects/${nonExistentPath}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });

      cy.wait('@getNotFound');
    });

    it('should handle malformed object paths', () => {
      const malformedPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        'uploads/../sensitive/file.txt'
      ];

      malformedPaths.forEach((path, index) => {
        cy.intercept('GET', `/objects/${path}`, {
          statusCode: 400,
          body: {
            error: 'Invalid object path'
          }
        }).as(`getMalformed${index}`);

        cy.request({
          method: 'GET',
          url: `/objects/${path}`,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
        });

        cy.wait(`@getMalformed${index}`);
      });
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/profile/settings');
      cy.url({ timeout: 10000 }).should('include', '/profile');
    });

    it('should display profile photo upload interface', () => {
      cy.get('[data-testid="profile-photo-section"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="current-profile-photo"]')
        .should('exist');
      
      cy.get('[data-testid="upload-profile-photo-button"]')
        .should('be.visible')
        .and('not.be.disabled');
      
      cy.get('[data-testid="remove-profile-photo-button"]')
        .should('exist');
    });

    it('should upload new profile photo successfully', () => {
      const file = createTestFile(testData.testFiles.image);

      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: {
          success: true,
          profilePhotoUrl: '/objects/profile-photos/user-123-profile.jpg',
          message: 'Profile photo updated successfully'
        }
      }).as('updateProfilePhoto');

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'test-content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.wait('@updateProfilePhoto').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body.success).to.be.true;
      });

      // Verify UI updates
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', 'Profile photo updated');
      
      cy.get('[data-testid="current-profile-photo"]')
        .should('have.attr', 'src')
        .and('include', 'profile-photos');
    });

    it('should handle profile photo upload errors', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 400,
        body: {
          success: false,
          error: 'Invalid image format. Only JPEG and PNG are allowed.'
        }
      }).as('updateProfilePhotoError');

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'invalid-content',
          fileName: 'test.gif',
          mimeType: 'image/gif'
        }, { force: true });

      cy.wait('@updateProfilePhotoError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Invalid image format');
    });

    it('should remove profile photo', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: {
          success: true,
          profilePhotoUrl: null,
          message: 'Profile photo removed successfully'
        }
      }).as('removeProfilePhoto');

      cy.get('[data-testid="remove-profile-photo-button"]')
        .click();

      // Confirm removal in modal
      cy.get('[data-testid="confirm-remove-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-remove-button"]')
        .click();

      cy.wait('@removeProfilePhoto');

      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Profile photo removed');
      
      cy.get('[data-testid="current-profile-photo"]')
        .should('have.attr', 'src')
        .and('include', 'default');
    });

    it('should validate profile photo file size', () => {
      const largeFile = createTestFile(testData.testFiles.largeFile);

      cy.get('[data-testid="profile-photo-input"]')
        .then(($input) => {
          const input = $input[0];
          const dataTransfer = new DataTransfer();
          const file = new File(['x'.repeat(1024 * 1024 * 6)], largeFile.name, {
            type: largeFile.type
          });
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

      cy.get('[data-testid="validation-error"]')
        .should('be.visible')
        .and('contain.text', 'File size must be less than');
    });

    it('should crop profile photo before upload', () => {
      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'test-image-content',
          fileName: 'large-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });

      // Photo cropper should appear
      cy.get('[data-testid="photo-cropper-modal"]', { timeout: 5000 })
        .should('be.visible');
      
      cy.get('[data-testid="crop-area"]')
        .should('be.visible');
      
      cy.get('[data-testid="crop-controls"]')
        .should('be.visible');
      
      // Test crop controls
      cy.get('[data-testid="zoom-slider"]')
        .should('be.visible')
        .invoke('val', 1.5)
        .trigger('input');
      
      cy.get('[data-testid="rotate-left-button"]').click();
      cy.get('[data-testid="rotate-right-button"]').click();
      
      // Apply crop
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: {
          success: true,
          profilePhotoUrl: '/objects/profile-photos/cropped-photo.jpg'
        }
      }).as('uploadCroppedPhoto');
      
      cy.get('[data-testid="apply-crop-button"]').click();
      
      cy.wait('@uploadCroppedPhoto');
      cy.get('[data-testid="photo-cropper-modal"]').should('not.exist');
    });
  });

  describe('Cover Photo Management', () => {
    beforeEach(() => {
      cy.visit('/profile/settings');
    });

    it('should display cover photo upload interface', () => {
      cy.get('[data-testid="cover-photo-section"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="current-cover-photo"]')
        .should('exist');
      
      cy.get('[data-testid="upload-cover-photo-button"]')
        .should('be.visible');
    });

    it('should upload new cover photo', () => {
      const file = createTestFile(testData.testFiles.image);

      cy.intercept('PUT', apiEndpoints.coverPhoto, {
        statusCode: 200,
        body: {
          success: true,
          coverPhotoUrl: '/objects/cover-photos/user-123-cover.jpg'
        }
      }).as('updateCoverPhoto');

      cy.get('[data-testid="cover-photo-input"]')
        .selectFile({
          contents: 'cover-content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.wait('@updateCoverPhoto');

      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Cover photo updated');
    });

    it('should handle cover photo aspect ratio requirements', () => {
      cy.get('[data-testid="cover-photo-input"]')
        .selectFile({
          contents: 'square-image',
          fileName: 'square.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });

      cy.get('[data-testid="aspect-ratio-warning"]')
        .should('be.visible')
        .and('contain.text', 'recommended aspect ratio');
      
      cy.get('[data-testid="crop-to-fit-button"]')
        .should('be.visible');
      
      cy.get('[data-testid="use-anyway-button"]')
        .should('be.visible');
    });

    it('should remove cover photo', () => {
      cy.intercept('PUT', apiEndpoints.coverPhoto, {
        statusCode: 200,
        body: {
          success: true,
          coverPhotoUrl: null
        }
      }).as('removeCoverPhoto');

      cy.get('[data-testid="remove-cover-photo-button"]')
        .click();

      cy.get('[data-testid="confirm-remove-button"]')
        .click();

      cy.wait('@removeCoverPhoto');

      cy.get('[data-testid="current-cover-photo"]')
        .should('have.class', 'default-cover');
    });
  });

  describe('Consultant Document Management', () => {
    beforeEach(() => {
      cy.visit(`/consultants/${testData.consultant.id}/documents`);
    });

    it('should display document management interface', () => {
      cy.get('[data-testid="documents-container"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="upload-document-button"]')
        .should('be.visible');
      
      cy.get('[data-testid="document-list"]')
        .should('exist');
      
      cy.get('[data-testid="document-types-filter"]')
        .should('be.visible');
    });

    it('should upload consultant documents', () => {
      const file = createTestFile(testData.testFiles.document);

      cy.intercept('PUT', apiEndpoints.consultantDocuments, {
        statusCode: 200,
        body: {
          success: true,
          documents: [
            {
              id: 'doc-123',
              filename: file.name,
              type: 'resume',
              status: 'pending_review',
              uploadedAt: new Date().toISOString(),
              url: '/objects/consultant-docs/doc-123.pdf'
            }
          ]
        }
      }).as('uploadConsultantDoc');

      cy.get('[data-testid="upload-document-button"]').click();

      cy.get('[data-testid="document-upload-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="document-type-select"]')
        .select('resume');
      
      cy.get('[data-testid="document-file-input"]')
        .selectFile({
          contents: 'resume-content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });
      
      cy.get('[data-testid="upload-submit-button"]')
        .click();

      cy.wait('@uploadConsultantDoc');

      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Document uploaded successfully');
      
      cy.get('[data-testid="document-list"] [data-testid^="document-item-"]')
        .should('have.length.gte', 1);
    });

    it('should display document verification status', () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          filename: 'resume.pdf',
          type: 'resume',
          status: 'approved',
          verifiedAt: '2024-01-01T10:00:00Z'
        },
        {
          id: 'doc-2',
          filename: 'license.pdf',
          type: 'license',
          status: 'pending_review',
          uploadedAt: '2024-01-02T10:00:00Z'
        },
        {
          id: 'doc-3',
          filename: 'certificate.pdf',
          type: 'certification',
          status: 'rejected',
          rejectedAt: '2024-01-03T10:00:00Z',
          rejectionReason: 'Document is expired'
        }
      ];

      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/documents`, {
        statusCode: 200,
        body: { documents: mockDocuments }
      }).as('getDocuments');

      cy.reload();
      cy.wait('@getDocuments');

      // Check approved document
      cy.get('[data-testid="document-item-doc-1"]')
        .should('contain.text', 'resume.pdf')
        .within(() => {
          cy.get('[data-testid="status-approved"]')
            .should('be.visible')
            .and('have.class', 'status-approved');
          cy.get('[data-testid="verified-date"]')
            .should('contain.text', '2024-01-01');
        });

      // Check pending document
      cy.get('[data-testid="document-item-doc-2"]')
        .within(() => {
          cy.get('[data-testid="status-pending"]')
            .should('be.visible')
            .and('have.class', 'status-pending');
        });

      // Check rejected document
      cy.get('[data-testid="document-item-doc-3"]')
        .within(() => {
          cy.get('[data-testid="status-rejected"]')
            .should('be.visible')
            .and('have.class', 'status-rejected');
          cy.get('[data-testid="rejection-reason"]')
            .should('contain.text', 'Document is expired');
        });
    });

    it('should filter documents by type', () => {
      const mockDocuments = [
        { id: 'doc-1', type: 'resume', filename: 'resume.pdf' },
        { id: 'doc-2', type: 'license', filename: 'license.pdf' },
        { id: 'doc-3', type: 'certification', filename: 'cert.pdf' }
      ];

      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/documents**`, {
        statusCode: 200,
        body: { documents: mockDocuments }
      }).as('getDocuments');

      cy.reload();
      cy.wait('@getDocuments');

      // Filter by resume
      cy.get('[data-testid="document-types-filter"]')
        .select('resume');
      
      cy.get('[data-testid^="document-item-"]')
        .should('have.length', 1)
        .and('contain.text', 'resume.pdf');

      // Filter by license
      cy.get('[data-testid="document-types-filter"]')
        .select('license');
      
      cy.get('[data-testid^="document-item-"]')
        .should('have.length', 1)
        .and('contain.text', 'license.pdf');

      // Show all
      cy.get('[data-testid="document-types-filter"]')
        .select('all');
      
      cy.get('[data-testid^="document-item-"]')
        .should('have.length', 3);
    });

    it('should handle document download', () => {
      const mockDocument = {
        id: 'doc-123',
        filename: 'resume.pdf',
        type: 'resume',
        url: '/objects/consultant-docs/doc-123.pdf'
      };

      cy.intercept('GET', mockDocument.url, {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${mockDocument.filename}"`
        }
      }).as('downloadDocument');

      cy.get('[data-testid="document-item-doc-123"] [data-testid="download-button"]')
        .click();

      cy.wait('@downloadDocument');
    });

    it('should handle document deletion', () => {
      cy.intercept('DELETE', '/api/documents/doc-123', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocument');

      cy.get('[data-testid="document-item-doc-123"] [data-testid="delete-button"]')
        .click();

      cy.get('[data-testid="confirm-delete-modal"]')
        .should('be.visible');
      
      cy.get('[data-testid="confirm-delete-button"]')
        .click();

      cy.wait('@deleteDocument');

      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Document deleted');
      
      cy.get('[data-testid="document-item-doc-123"]')
        .should('not.exist');
    });

    it('should validate document upload requirements', () => {
      cy.get('[data-testid="upload-document-button"]').click();

      // Try to upload without selecting type
      cy.get('[data-testid="document-file-input"]')
        .selectFile({
          contents: 'test-content',
          fileName: 'test.pdf',
          mimeType: 'application/pdf'
        }, { force: true });
      
      cy.get('[data-testid="upload-submit-button"]')
        .click();

      cy.get('[data-testid="validation-error"]')
        .should('contain.text', 'Please select document type');

      // Try to upload without file
      cy.get('[data-testid="document-type-select"]')
        .select('resume');
      
      cy.get('[data-testid="upload-submit-button"]')
        .click();

      cy.get('[data-testid="validation-error"]')
        .should('contain.text', 'Please select a file');
    });

    it('should handle bulk document operations', () => {
      const mockDocuments = [
        { id: 'doc-1', filename: 'resume.pdf', status: 'pending_review' },
        { id: 'doc-2', filename: 'license.pdf', status: 'pending_review' },
        { id: 'doc-3', filename: 'cert.pdf', status: 'approved' }
      ];

      cy.intercept('GET', `/api/consultants/${testData.consultant.id}/documents`, {
        body: { documents: mockDocuments }
      });

      cy.reload();

      // Select multiple documents
      cy.get('[data-testid="select-all-checkbox"]')
        .check();
      
      cy.get('[data-testid="bulk-actions"]')
        .should('be.visible');
      
      cy.get('[data-testid="selected-count"]')
        .should('contain.text', '3 selected');

      // Test bulk download
      cy.intercept('POST', '/api/documents/bulk-download', {
        statusCode: 200,
        body: { downloadUrl: '/objects/downloads/bulk-123.zip' }
      }).as('bulkDownload');

      cy.get('[data-testid="bulk-download-button"]')
        .click();

      cy.wait('@bulkDownload');

      // Test bulk delete
      cy.intercept('DELETE', '/api/documents/bulk-delete', {
        statusCode: 200,
        body: { success: true, deletedCount: 2 }
      }).as('bulkDelete');

      cy.get('[data-testid="bulk-delete-button"]')
        .click();
      
      cy.get('[data-testid="confirm-bulk-delete-button"]')
        .click();

      cy.wait('@bulkDelete');
    });
  });

  describe('File Upload UI Components', () => {
    beforeEach(() => {
      cy.visit('/profile/settings');
    });

    it('should handle drag and drop file upload', () => {
      const file = createTestFile(testData.testFiles.image);

      cy.get('[data-testid="profile-photo-dropzone"]')
        .should('be.visible')
        .and('have.class', 'dropzone-inactive');

      // Simulate drag enter
      cy.get('[data-testid="profile-photo-dropzone"]')
        .trigger('dragenter', {
          dataTransfer: {
            files: [file]
          }
        });

      cy.get('[data-testid="profile-photo-dropzone"]')
        .should('have.class', 'dropzone-active');

      // Simulate drop
      cy.get('[data-testid="profile-photo-dropzone"]')
        .trigger('drop', {
          dataTransfer: {
            files: [file]
          }
        });

      cy.get('[data-testid="upload-progress"]')
        .should('be.visible');
    });

    it('should show upload progress indicator', () => {
      const file = createTestFile(testData.testFiles.image);

      let progressCallback;
      cy.intercept('PUT', apiEndpoints.profilePhoto, (req) => {
        // Simulate slow upload with progress
        return new Promise((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            if (progressCallback) {
              progressCallback({ loaded: progress, total: 100 });
            }
            if (progress >= 100) {
              clearInterval(interval);
              resolve({
                statusCode: 200,
                body: { success: true, profilePhotoUrl: '/objects/profile.jpg' }
              });
            }
          }, 100);
        });
      }).as('slowUpload');

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.get('[data-testid="upload-progress-bar"]')
        .should('be.visible');
      
      cy.get('[data-testid="upload-percentage"]')
        .should('be.visible');
      
      cy.get('[data-testid="upload-status"]')
        .should('contain.text', 'Uploading');

      cy.wait('@slowUpload');

      cy.get('[data-testid="upload-progress-bar"]')
        .should('not.exist');
      
      cy.get('[data-testid="upload-status"]')
        .should('contain.text', 'Upload complete');
    });

    it('should handle upload cancellation', () => {
      const file = createTestFile(testData.testFiles.image);

      cy.intercept('PUT', apiEndpoints.profilePhoto, (req) => {
        return new Promise(() => {}); // Never resolve to simulate slow upload
      }).as('slowUpload');

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.get('[data-testid="upload-progress-bar"]')
        .should('be.visible');

      cy.get('[data-testid="cancel-upload-button"]')
        .click();

      cy.get('[data-testid="upload-progress-bar"]')
        .should('not.exist');
      
      cy.get('[data-testid="upload-status"]')
        .should('contain.text', 'Upload cancelled');
    });

    it('should handle multiple file selection restrictions', () => {
      cy.get('[data-testid="profile-photo-input"]')
        .should('not.have.attr', 'multiple');

      cy.get('[data-testid="profile-photo-input"]')
        .then(($input) => {
          const input = $input[0];
          const dataTransfer = new DataTransfer();
          
          // Try to add multiple files
          const file1 = new File(['content1'], 'file1.jpg', { type: 'image/jpeg' });
          const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });
          
          dataTransfer.items.add(file1);
          dataTransfer.items.add(file2);
          
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });

      cy.get('[data-testid="multiple-files-warning"]')
        .should('be.visible')
        .and('contain.text', 'Only one file can be uploaded');
    });

    it('should provide file format guidance', () => {
      cy.get('[data-testid="profile-photo-section"]')
        .within(() => {
          cy.get('[data-testid="format-help"]')
            .should('be.visible')
            .and('contain.text', 'JPEG, PNG')
            .and('contain.text', 'max 5MB');
          
          cy.get('[data-testid="size-help"]')
            .should('contain.text', 'recommended: 400x400px');
        });

      cy.get('[data-testid="cover-photo-section"]')
        .within(() => {
          cy.get('[data-testid="format-help"]')
            .should('contain.text', 'recommended: 1200x400px');
        });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during upload', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        forceNetworkError: true
      }).as('networkError');

      const file = createTestFile(testData.testFiles.image);
      
      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.wait('@networkError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', 'Network error');
      
      cy.get('[data-testid="retry-upload-button"]')
        .should('be.visible');
    });

    it('should handle server timeout during upload', () => {
      cy.intercept('POST', apiEndpoints.upload, (req) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              statusCode: 408,
              body: { error: 'Request timeout' }
            });
          }, 30000);
        });
      }).as('timeout');

      const file = createTestFile(testData.testFiles.image);
      
      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.get('[data-testid="error-message"]', { timeout: 35000 })
        .should('contain.text', 'timeout');
    });

    it('should handle corrupted file uploads', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 422,
        body: {
          success: false,
          error: 'File appears to be corrupted or invalid'
        }
      }).as('corruptedFile');

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'corrupted-data-xyz123',
          fileName: 'corrupted.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });

      cy.wait('@corruptedFile');

      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'corrupted');
    });

    it('should handle storage quota exceeded', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 507,
        body: {
          success: false,
          error: 'Storage quota exceeded. Please contact support.',
          quotaUsed: '95%',
          quotaLimit: '100GB'
        }
      }).as('quotaExceeded');

      const file = createTestFile(testData.testFiles.image);
      
      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      cy.wait('@quotaExceeded');

      cy.get('[data-testid="quota-exceeded-warning"]')
        .should('be.visible')
        .and('contain.text', 'Storage quota exceeded')
        .and('contain.text', '95%');
      
      cy.get('[data-testid="contact-support-link"]')
        .should('be.visible');
    });

    it('should handle malware detection', () => {
      cy.intercept('POST', apiEndpoints.upload, {
        statusCode: 403,
        body: {
          success: false,
          error: 'File blocked due to security scan',
          reason: 'potential_malware'
        }
      }).as('malwareDetected');

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'malicious-content',
          fileName: 'virus.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });

      cy.wait('@malwareDetected');

      cy.get('[data-testid="security-warning"]')
        .should('be.visible')
        .and('contain.text', 'security scan');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should be keyboard accessible', () => {
      cy.visit('/profile/settings');

      // Tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');

      // Arrow key navigation in dropdowns
      cy.get('[data-testid="document-types-filter"]')
        .focus()
        .type('{downarrow}')
        .type('{enter}');

      // Space bar activation
      cy.get('[data-testid="upload-profile-photo-button"]')
        .focus()
        .type(' ');
    });

    it('should have proper ARIA labels and descriptions', () => {
      cy.get('[data-testid="profile-photo-input"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'aria-describedby');
      
      cy.get('[data-testid="upload-profile-photo-button"]')
        .should('have.attr', 'role')
        .and('have.attr', 'aria-label');
      
      cy.get('[data-testid="upload-progress-bar"]')
        .should('have.attr', 'role', 'progressbar')
        .and('have.attr', 'aria-valuemin')
        .and('have.attr', 'aria-valuemax');
    });

    it('should provide screen reader feedback', () => {
      cy.get('[data-testid="upload-status"]')
        .should('have.attr', 'aria-live', 'polite');
      
      cy.get('[data-testid="error-message"]')
        .should('have.attr', 'aria-live', 'assertive');
      
      cy.get('[data-testid="success-message"]')
        .should('have.attr', 'role', 'alert');
    });

    it('should handle high contrast mode', () => {
      // Simulate high contrast mode
      cy.get('html').invoke('attr', 'data-theme', 'high-contrast');

      cy.get('[data-testid="upload-progress-bar"]')
        .should('have.css', 'border-width', '2px');
      
      cy.get('[data-testid="dropzone-active"]')
        .should('have.css', 'outline-width', '3px');
    });

    it('should work with reduced motion preferences', () => {
      // Simulate reduced motion
      cy.window().then((win) => {
        Object.defineProperty(win, 'matchMedia', {
          writable: true,
          value: cy.stub().returns({
            matches: true,
            media: '(prefers-reduced-motion: reduce)',
            onchange: null,
            addListener: cy.stub(),
            removeListener: cy.stub()
          })
        });
      });

      const file = createTestFile(testData.testFiles.image);
      
      cy.get('[data-testid="profile-photo-input"]')
        .selectFile({
          contents: 'content',
          fileName: file.name,
          mimeType: file.type
        }, { force: true });

      // Animations should be disabled
      cy.get('[data-testid="upload-progress-bar"]')
        .should('have.css', 'transition', 'none');
    });
  });
});
