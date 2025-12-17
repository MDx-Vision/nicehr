describe('Objects/File Management System - Exhaustive Tests', () => {
  const testFiles = {
    image: {
      name: 'test-image.jpg',
      type: 'image/jpeg',
      size: 1024 * 500, // 500KB
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyxtInyStlY+g+9EM='
    },
    document: {
      name: 'test-document.pdf',
      type: 'application/pdf',
      size: 1024 * 1024 * 2, // 2MB
      content: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFI+PgpzdHJlYW0KICA8L0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCvkMlQwVDC0MFEwAEJDCyOlcgVyhbKE8gRyBPIE8gTzBfMF8wXzBfMF8wXzBfMF8wXzBfMF8wXzBfMF8wXzBfMF8wXzBfMF8wXzBfMF8wXzBfMF8wXzBfMFc='
    },
    large: {
      name: 'large-file.zip',
      type: 'application/zip',
      size: 1024 * 1024 * 10, // 10MB
      content: 'data:application/zip;base64,UEsDBBQAAAAIAOePKk7bksqsAAAAAEgAAAAOAAAAY2xvdWRjaG'
    },
    invalidType: {
      name: 'script.exe',
      type: 'application/x-msdownload',
      size: 1024,
      content: 'data:application/x-msdownload;base64,TVqQAAMAAAAEAAAA//8AALgAAAAA'
    }
  };

  const apiEndpoints = {
    upload: '/api/objects/upload',
    userProfilePhoto: '/api/users/*/profile-photo',
    userCoverPhoto: '/api/users/*/cover-photo',
    consultantDocuments: '/api/consultants/*/documents',
    publicObjects: '/public-objects/**',
    objects: '/objects/**'
  };

  beforeEach(() => {
    // Login as admin user
    cy.login('test@example.com', 'test123');
    
    // Visit objects/file management page
    cy.visit('/objects');
  });

  describe('Objects Page - UI Components & Layout', () => {
    it('should display complete objects management interface', () => {
      // Main container
      cy.get('[data-testid="objects-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Upload area
      cy.get('[data-testid="upload-area"]').should('be.visible');
      cy.get('[data-testid="upload-dropzone"]').should('be.visible');
      cy.get('[data-testid="upload-button"]').should('be.visible');
      
      // File list/grid
      cy.get('[data-testid="files-container"]').should('be.visible');
      
      // Controls
      cy.get('[data-testid="view-toggle"]').should('be.visible');
      cy.get('[data-testid="sort-dropdown"]').should('be.visible');
      cy.get('[data-testid="filter-dropdown"]').should('be.visible');
      
      // Search
      cy.get('[data-testid="search-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder');
    });

    it('should have proper accessibility features', () => {
      // Upload area accessibility
      cy.get('[data-testid="upload-dropzone"]')
        .should('have.attr', 'role', 'button')
        .and('have.attr', 'tabindex', '0')
        .and('have.attr', 'aria-label');
      
      // File input accessibility
      cy.get('input[type="file"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'accept');
      
      // Keyboard navigation
      cy.get('[data-testid="upload-dropzone"]')
        .focus()
        .should('have.focus');
    });

    it('should handle responsive layout', () => {
      // Desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="files-grid"]').should('be.visible');
      
      // Tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="files-container"]').should('be.visible');
      
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="files-container"]').should('be.visible');
      cy.get('[data-testid="mobile-upload-button"]').should('be.visible');
    });
  });

  describe('File Upload - Single File', () => {
    beforeEach(() => {
      // Mock successful upload response
      cy.intercept('POST', '/api/objects/upload', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'test-file-1',
            filename: testFiles.image.name,
            url: '/objects/test-file-1.jpg',
            size: testFiles.image.size,
            type: testFiles.image.type,
            uploadedAt: new Date().toISOString()
          }
        }
      }).as('uploadFile');
    });

    it('should handle single image file upload via file input', () => {
      const file = new File([testFiles.image.content], testFiles.image.name, {
        type: testFiles.image.type
      });

      cy.get('input[type="file"]')
        .selectFile(file, { force: true });

      cy.wait('@uploadFile');

      // Verify upload success message
      cy.get('[data-testid="upload-success-message"]')
        .should('be.visible')
        .and('contain.text', 'uploaded successfully');

      // Verify file appears in list
      cy.get('[data-testid="file-item"]')
        .should('contain.text', testFiles.image.name);
    });

    it('should handle drag and drop upload', () => {
      const file = new File([testFiles.image.content], testFiles.image.name, {
        type: testFiles.image.type
      });

      // Simulate drag enter
      cy.get('[data-testid="upload-dropzone"]')
        .trigger('dragenter', {
          dataTransfer: {
            files: [file]
          }
        });

      // Should show drag active state
      cy.get('[data-testid="upload-dropzone"]')
        .should('have.class', 'drag-active');

      // Simulate drop
      cy.get('[data-testid="upload-dropzone"]')
        .trigger('drop', {
          dataTransfer: {
            files: [file]
          }
        });

      cy.wait('@uploadFile');

      // Verify upload success
      cy.get('[data-testid="upload-success-message"]')
        .should('be.visible');
    });

    it('should show upload progress indicator', () => {
      // Mock slow upload with progress
      cy.intercept('POST', '/api/objects/upload', (req) => {
        req.reply((res) => {
          // Simulate delay
          setTimeout(() => {
            res.send({
              statusCode: 200,
              body: {
                success: true,
                data: {
                  id: 'test-file-1',
                  filename: testFiles.image.name,
                  url: '/objects/test-file-1.jpg'
                }
              }
            });
          }, 2000);
        });
      }).as('slowUpload');

      const file = new File([testFiles.image.content], testFiles.image.name, {
        type: testFiles.image.type
      });

      cy.get('input[type="file"]').selectFile(file, { force: true });

      // Verify progress indicator appears
      cy.get('[data-testid="upload-progress"]')
        .should('be.visible');
      
      cy.get('[data-testid="progress-bar"]')
        .should('be.visible')
        .and('have.attr', 'value');

      cy.wait('@slowUpload');

      // Verify progress indicator disappears
      cy.get('[data-testid="upload-progress"]')
        .should('not.exist');
    });
  });

  describe('File Upload - Multiple Files', () => {
    beforeEach(() => {
      cy.intercept('POST', '/api/objects/upload', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'test-file-1',
              filename: testFiles.image.name,
              url: '/objects/test-file-1.jpg'
            },
            {
              id: 'test-file-2',
              filename: testFiles.document.name,
              url: '/objects/test-file-2.pdf'
            }
          ]
        }
      }).as('uploadMultiple');
    });

    it('should handle multiple file selection', () => {
      const files = [
        new File([testFiles.image.content], testFiles.image.name, {
          type: testFiles.image.type
        }),
        new File([testFiles.document.content], testFiles.document.name, {
          type: testFiles.document.type
        })
      ];

      cy.get('input[type="file"][multiple]')
        .selectFile(files, { force: true });

      cy.wait('@uploadMultiple');

      // Verify both files appear in list
      cy.get('[data-testid="file-item"]')
        .should('have.length.at.least', 2);
      
      cy.get('[data-testid="file-item"]')
        .first()
        .should('contain.text', testFiles.image.name);
      
      cy.get('[data-testid="file-item"]')
        .last()
        .should('contain.text', testFiles.document.name);
    });

    it('should show individual progress for each file', () => {
      const files = [
        new File([testFiles.image.content], testFiles.image.name, {
          type: testFiles.image.type
        }),
        new File([testFiles.document.content], testFiles.document.name, {
          type: testFiles.document.type
        })
      ];

      cy.get('input[type="file"][multiple]')
        .selectFile(files, { force: true });

      // Verify individual progress bars
      cy.get('[data-testid^="progress-bar-"]')
        .should('have.length', 2);

      cy.wait('@uploadMultiple');
    });
  });

  describe('File Upload - Validation & Error Handling', () => {
    it('should reject files that are too large', () => {
      cy.intercept('POST', '/api/objects/upload', {
        statusCode: 413,
        body: {
          success: false,
          error: 'File too large. Maximum size is 5MB.'
        }
      }).as('uploadTooLarge');

      const file = new File([testFiles.large.content], testFiles.large.name, {
        type: testFiles.large.type
      });

      cy.get('input[type="file"]')
        .selectFile(file, { force: true });

      cy.wait('@uploadTooLarge');

      // Verify error message
      cy.get('[data-testid="upload-error-message"]')
        .should('be.visible')
        .and('contain.text', 'File too large');
    });

    it('should reject invalid file types', () => {
      const file = new File([testFiles.invalidType.content], testFiles.invalidType.name, {
        type: testFiles.invalidType.type
      });

      cy.get('input[type="file"]')
        .selectFile(file, { force: true });

      // Should show client-side validation error
      cy.get('[data-testid="file-type-error"]')
        .should('be.visible')
        .and('contain.text', 'File type not allowed');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '/api/objects/upload', {
        forceNetworkError: true
      }).as('networkError');

      const file = new File([testFiles.image.content], testFiles.image.name, {
        type: testFiles.image.type
      });

      cy.get('input[type="file"]')
        .selectFile(file, { force: true });

      cy.wait('@networkError');

      // Verify network error message
      cy.get('[data-testid="network-error-message"]')
        .should('be.visible')
        .and('contain.text', 'Network error');

      // Verify retry button
      cy.get('[data-testid="retry-upload-button"]')
        .should('be.visible');
    });

    it('should handle server errors', () => {
      cy.intercept('POST', '/api/objects/upload', {
        statusCode: 500,
        body: {
          success: false,
          error: 'Internal server error'
        }
      }).as('serverError');

      const file = new File([testFiles.image.content], testFiles.image.name, {
        type: testFiles.image.type
      });

      cy.get('input[type="file"]')
        .selectFile(file, { force: true });

      cy.wait('@serverError');

      // Verify error message
      cy.get('[data-testid="server-error-message"]')
        .should('be.visible')
        .and('contain.text', 'server error');
    });

    it('should validate required fields in file metadata form', () => {
      // If there's a metadata form for files
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="file-metadata-form"]').length > 0) {
          const file = new File([testFiles.image.content], testFiles.image.name, {
            type: testFiles.image.type
          });

          cy.get('input[type="file"]').selectFile(file, { force: true });

          // Try to submit without required fields
          cy.get('[data-testid="submit-upload-button"]').click();

          // Verify validation errors
          cy.get('[data-testid="title-error"]')
            .should('be.visible')
            .and('contain.text', 'Title is required');

          cy.get('[data-testid="description-error"]')
            .should('be.visible')
            .and('contain.text', 'Description is required');
        }
      });
    });
  });

  describe('File Management - View & Display', () => {
    beforeEach(() => {
      // Mock files list
      cy.intercept('GET', '/api/objects*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'file-1',
              filename: 'image1.jpg',
              url: '/objects/image1.jpg',
              size: 1024 * 500,
              type: 'image/jpeg',
              uploadedAt: '2024-01-15T10:30:00Z',
              uploadedBy: 'ci-test-user'
            },
            {
              id: 'file-2',
              filename: 'document.pdf',
              url: '/objects/document.pdf',
              size: 1024 * 1024 * 2,
              type: 'application/pdf',
              uploadedAt: '2024-01-14T15:45:00Z',
              uploadedBy: 'ci-test-user'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1
          }
        }
      }).as('getFiles');

      cy.visit('/objects');
      cy.wait('@getFiles');
    });

    it('should display files in grid view', () => {
      cy.get('[data-testid="view-grid"]').click();

      cy.get('[data-testid="files-grid"]').should('be.visible');
      
      cy.get('[data-testid="file-card"]').should('have.length', 2);
      
      // Verify file card content
      cy.get('[data-testid="file-card"]').first().within(() => {
        cy.get('[data-testid="file-thumbnail"]').should('be.visible');
        cy.get('[data-testid="file-name"]').should('contain.text', 'image1.jpg');
        cy.get('[data-testid="file-size"]').should('contain.text', 'KB');
        cy.get('[data-testid="file-date"]').should('be.visible');
      });
    });

    it('should display files in list view', () => {
      cy.get('[data-testid="view-list"]').click();

      cy.get('[data-testid="files-list"]').should('be.visible');
      
      // Verify table headers
      cy.get('[data-testid="files-table"] thead').within(() => {
        cy.contains('Name').should('be.visible');
        cy.contains('Size').should('be.visible');
        cy.contains('Type').should('be.visible');
        cy.contains('Date').should('be.visible');
        cy.contains('Actions').should('be.visible');
      });

      // Verify file rows
      cy.get('[data-testid="file-row"]').should('have.length', 2);
      
      cy.get('[data-testid="file-row"]').first().within(() => {
        cy.get('[data-testid="file-name-cell"]')
          .should('contain.text', 'image1.jpg');
        cy.get('[data-testid="file-actions"]').should('be.visible');
      });
    });

    it('should handle file thumbnail display', () => {
      cy.get('[data-testid="file-card"]').first().within(() => {
        cy.get('[data-testid="file-thumbnail"]')
          .should('be.visible')
          .and('have.attr', 'src')
          .and('have.attr', 'alt', 'image1.jpg');
      });

      // PDF should show document icon
      cy.get('[data-testid="file-card"]').last().within(() => {
        cy.get('[data-testid="file-icon"]')
          .should('be.visible')
          .and('have.class', 'pdf-icon');
      });
    });
  });

  describe('File Management - Search & Filter', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/objects*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'file-1',
              filename: 'image1.jpg',
              type: 'image/jpeg',
              size: 1024 * 500,
              uploadedAt: '2024-01-15T10:30:00Z'
            },
            {
              id: 'file-2',
              filename: 'document.pdf',
              type: 'application/pdf',
              size: 1024 * 1024 * 2,
              uploadedAt: '2024-01-14T15:45:00Z'
            },
            {
              id: 'file-3',
              filename: 'presentation.pptx',
              type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              size: 1024 * 1024 * 5,
              uploadedAt: '2024-01-13T09:15:00Z'
            }
          ]
        }
      }).as('getAllFiles');
    });

    it('should search files by name', () => {
      cy.intercept('GET', '/api/objects*search=image*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'file-1',
              filename: 'image1.jpg',
              type: 'image/jpeg',
              size: 1024 * 500
            }
          ]
        }
      }).as('searchFiles');

      cy.get('[data-testid="search-input"]')
        .type('image{enter}');

      cy.wait('@searchFiles');

      cy.get('[data-testid="file-card"]')
        .should('have.length', 1)
        .and('contain.text', 'image1.jpg');
    });

    it('should filter files by type', () => {
      cy.intercept('GET', '/api/objects*type=image*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'file-1',
              filename: 'image1.jpg',
              type: 'image/jpeg',
              size: 1024 * 500
            }
          ]
        }
      }).as('filterByType');

      cy.get('[data-testid="filter-dropdown"]').click();
      cy.get('[data-testid="filter-images"]').click();

      cy.wait('@filterByType');

      cy.get('[data-testid="file-card"]')
        .should('have.length', 1)
        .and('contain.text', 'image1.jpg');
    });

    it('should sort files by different criteria', () => {
      cy.intercept('GET', '/api/objects*sort=size*order=desc*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'file-3',
              filename: 'presentation.pptx',
              size: 1024 * 1024 * 5
            },
            {
              id: 'file-2',
              filename: 'document.pdf',
              size: 1024 * 1024 * 2
            },
            {
              id: 'file-1',
              filename: 'image1.jpg',
              size: 1024 * 500
            }
          ]
        }
      }).as('sortBySize');

      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-size-desc"]').click();

      cy.wait('@sortBySize');

      // Verify sort order
      cy.get('[data-testid="file-card"]')
        .first()
        .should('contain.text', 'presentation.pptx');
    });

    it('should handle empty search results', () => {
      cy.intercept('GET', '/api/objects*search=nonexistent*', {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          pagination: {
            total: 0
          }
        }
      }).as('emptySearch');

      cy.get('[data-testid="search-input"]')
        .type('nonexistent{enter}');

      cy.wait('@emptySearch');

      cy.get('[data-testid="empty-results"]')
        .should('be.visible')
        .and('contain.text', 'No files found');

      cy.get('[data-testid="clear-search-button"]')
        .should('be.visible');
    });
  });

  describe('File Management - Actions', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/objects*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'file-1',
              filename: 'image1.jpg',
              url: '/objects/image1.jpg',
              size: 1024 * 500,
              type: 'image/jpeg'
            }
          ]
        }
      }).as('getFiles');

      cy.visit('/objects');
      cy.wait('@getFiles');
    });

    it('should handle file preview', () => {
      cy.get('[data-testid="file-card"]').first().click();

      // Verify preview modal opens
      cy.get('[data-testid="file-preview-modal"]')
        .should('be.visible');

      cy.get('[data-testid="preview-image"]')
        .should('be.visible')
        .and('have.attr', 'src', '/objects/image1.jpg');

      // Close preview
      cy.get('[data-testid="close-preview"]').click();
      cy.get('[data-testid="file-preview-modal"]')
        .should('not.exist');
    });

    it('should handle file download', () => {
      cy.get('[data-testid="file-actions"]').first().click();
      cy.get('[data-testid="download-file"]').click();

      // Verify download initiated (check window.open or download attribute)
      cy.window().its('open').should('be.called');
    });

    it('should handle file rename', () => {
      cy.intercept('PATCH', '/api/objects/file-1', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'file-1',
            filename: 'renamed-image.jpg'
          }
        }
      }).as('renameFile');

      cy.get('[data-testid="file-actions"]').first().click();
      cy.get('[data-testid="rename-file"]').click();

      // Verify rename dialog
      cy.get('[data-testid="rename-dialog"]').should('be.visible');
      
      cy.get('[data-testid="rename-input"]')
        .clear()
        .type('renamed-image.jpg');

      cy.get('[data-testid="confirm-rename"]').click();

      cy.wait('@renameFile');

      // Verify success message
      cy.get('[data-testid="rename-success"]')
        .should('be.visible')
        .and('contain.text', 'File renamed successfully');
    });

    it('should handle file deletion with confirmation', () => {
      cy.intercept('DELETE', '/api/objects/file-1', {
        statusCode: 200,
        body: {
          success: true,
          message: 'File deleted successfully'
        }
      }).as('deleteFile');

      cy.get('[data-testid="file-actions"]').first().click();
      cy.get('[data-testid="delete-file"]').click();

      // Verify confirmation dialog
      cy.get('[data-testid="delete-confirmation"]')
        .should('be.visible');

      cy.get('[data-testid="confirm-delete-text"]')
        .should('contain.text', 'Are you sure');

      cy.get('[data-testid="confirm-delete"]').click();

      cy.wait('@deleteFile');

      // Verify file removed from list
      cy.get('[data-testid="file-card"]')
        .should('not.exist');

      // Verify success message
      cy.get('[data-testid="delete-success"]')
        .should('be.visible')
        .and('contain.text', 'File deleted');
    });

    it('should handle bulk actions', () => {
      cy.intercept('GET', '/api/objects*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            { id: 'file-1', filename: 'image1.jpg' },
            { id: 'file-2', filename: 'image2.jpg' },
            { id: 'file-3', filename: 'document.pdf' }
          ]
        }
      }).as('getMultipleFiles');

      cy.visit('/objects');
      cy.wait('@getMultipleFiles');

      // Select multiple files
      cy.get('[data-testid="file-checkbox"]').eq(0).check();
      cy.get('[data-testid="file-checkbox"]').eq(1).check();

      // Verify bulk actions appear
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      cy.get('[data-testid="selected-count"]')
        .should('contain.text', '2 files selected');

      // Test bulk delete
      cy.intercept('DELETE', '/api/objects/bulk', {
        statusCode: 200,
        body: { success: true, deletedCount: 2 }
      }).as('bulkDelete');

      cy.get('[data-testid="bulk-delete"]').click();
      cy.get('[data-testid="confirm-bulk-delete"]').click();

      cy.wait('@bulkDelete');

      cy.get('[data-testid="bulk-delete-success"]')
        .should('be.visible')
        .and('contain.text', '2 files deleted');
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should handle profile photo upload', () => {
      cy.intercept('PUT', '/api/users/*/profile-photo', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            profilePhotoUrl: '/objects/profile-photo-123.jpg'
          }
        }
      }).as('updateProfilePhoto');

      const file = new File([testFiles.image.content], 'profile.jpg', {
        type: 'image/jpeg'
      });

      cy.get('[data-testid="profile-photo-input"]')
        .selectFile(file, { force: true });

      cy.wait('@updateProfilePhoto');

      // Verify new profile photo appears
      cy.get('[data-testid="profile-photo"]')
        .should('have.attr', 'src')
        .and('include', 'profile-photo-123.jpg');
    });

    it('should handle cover photo upload', () => {
      cy.intercept('PUT', '/api/users/*/cover-photo', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            coverPhotoUrl: '/objects/cover-photo-123.jpg'
          }
        }
      }).as('updateCoverPhoto');

      const file = new File([testFiles.image.content], 'cover.jpg', {
        type: 'image/jpeg'
      });

      cy.get('[data-testid="cover-photo-input"]')
        .selectFile(file, { force: true });

      cy.wait('@updateCoverPhoto');

      // Verify new cover photo appears
      cy.get('[data-testid="cover-photo"]')
        .should('have.attr', 'src')
        .and('include', 'cover-photo-123.jpg');
    });
  });

  describe('Document Management for Consultants', () => {
    beforeEach(() => {
      cy.visit('/consultants/ci-test-consultant/documents');
    });

    it('should handle consultant document upload', () => {
      cy.intercept('POST', '/api/consultants/*/documents', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'doc-1',
            filename: 'certificate.pdf',
            documentType: 'certification',
            status: 'pending_review'
          }
        }
      }).as('uploadDocument');

      // Select document type
      cy.get('[data-testid="document-type-select"]')
        .click();
      cy.get('[data-testid="option-certification"]').click();

      // Upload file
      const file = new File([testFiles.document.content], 'certificate.pdf', {
        type: 'application/pdf'
      });

      cy.get('[data-testid="document-file-input"]')
        .selectFile(file, { force: true });

      cy.get('[data-testid="upload-document-button"]').click();

      cy.wait('@uploadDocument');

      // Verify document appears in list
      cy.get('[data-testid="document-item"]')
        .should('contain.text', 'certificate.pdf')
        .and('contain.text', 'pending_review');
    });

    it('should handle document status updates', () => {
      cy.intercept('PATCH', '/api/documents/*/status', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            id: 'doc-1',
            status: 'approved'
          }
        }
      }).as('updateDocumentStatus');

      // Mock existing document
      cy.intercept('GET', '/api/consultants/*/documents', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 'doc-1',
              filename: 'certificate.pdf',
              documentType: 'certification',
              status: 'pending_review'
            }
          ]
        }
      }).as('getDocuments');

      cy.visit('/consultants/ci-test-consultant/documents');
      cy.wait('@getDocuments');

      // Admin actions
      cy.get('[data-testid="document-actions"]').click();
      cy.get('[data-testid="approve-document"]').click();

      cy.wait('@updateDocumentStatus');

      // Verify status updated
      cy.get('[data-testid="document-status"]')
        .should('contain.text', 'approved');
    });
  });

  describe('File Access & Security', () => {
    it('should handle public file access', () => {
      cy.intercept('GET', '/public-objects/public-file.jpg', {
        fixture: 'test-image.jpg'
      }).as('getPublicFile');

      cy.request('/public-objects/public-file.jpg')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.headers['content-type']).to.include('image');
        });
    });

    it('should protect private file access', () => {
      // Without authentication
      cy.clearCookies();
      
      cy.request({
        url: '/objects/private-file.pdf',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should allow authenticated access to private files', () => {
      // With authentication
      cy.login('test@example.com', 'test123');

      cy.intercept('GET', '/objects/private-file.pdf', {
        statusCode: 200,
        body: 'PDF content',
        headers: {
          'content-type': 'application/pdf'
        }
      }).as('getPrivateFile');

      cy.request('/objects/private-file.pdf')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.headers['content-type']).to.include('pdf');
        });
    });
  });

  describe('Pagination & Performance', () => {
    beforeEach(() => {
      // Mock paginated results
      cy.intercept('GET', '/api/objects*page=1*', {
        statusCode: 200,
        body: {
          success: true,
          data: Array.from({ length: 20 }, (_, i) => ({
            id: `file-${i + 1}`,
            filename: `file${i + 1}.jpg`,
            size: 1024 * (i + 1),
            uploadedAt: new Date().toISOString()
          })),
          pagination: {
            page: 1,
            limit: 20,
            total: 150,
            totalPages: 8
          }
        }
      }).as('getFirstPage');

      cy.visit('/objects');
      cy.wait('@getFirstPage');
    });

    it('should handle pagination navigation', () => {
      // Verify pagination controls
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="current-page"]').should('contain.text', '1');
      cy.get('[data-testid="total-pages"]').should('contain.text', '8');

      // Mock next page
      cy.intercept('GET', '/api/objects*page=2*', {
        statusCode: 200,
        body: {
          success: true,
          data: Array.from({ length: 20 }, (_, i) => ({
            id: `file-${i + 21}`,
            filename: `file${i + 21}.jpg`,
            size: 1024 * (i + 21)
          })),
          pagination: {
            page: 2,
            limit: 20,
            total: 150,
            totalPages: 8
          }
        }
      }).as('getSecondPage');

      // Navigate to next page
      cy.get('[data-testid="next-page"]').click();
      cy.wait('@getSecondPage');

      cy.get('[data-testid="current-page"]').should('contain.text', '2');
    });

    it('should handle page size changes', () => {
      cy.intercept('GET', '/api/objects*limit=50*', {
        statusCode: 200,
        body: {
          success: true,
          data: Array.from({ length: 50 }, (_, i) => ({
            id: `file-${i + 1}`,
            filename: `file${i + 1}.jpg`
          })),
          pagination: {
            page: 1,
            limit: 50,
            total: 150,
            totalPages: 3
          }
        }
      }).as('getLargerPage');

      cy.get('[data-testid="page-size-select"]').click();
      cy.get('[data-testid="page-size-50"]').click();

      cy.wait('@getLargerPage');

      cy.get('[data-testid="file-card"]')
        .should('have.length', 50);
    });
  });

  describe('Error States & Edge Cases', () => {
    it('should handle empty state gracefully', () => {
      cy.intercept('GET', '/api/objects*', {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          pagination: { total: 0 }
        }
      }).as('getEmptyFiles');

      cy.visit('/objects');
      cy.wait('@getEmptyFiles');

      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', 'No files uploaded yet');

      cy.get('[data-testid="upload-first-file-button"]')
        .should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/objects*', {
        statusCode: 500,
        body: {
          success: false,
          error: 'Internal server error'
        }
      }).as('getFilesError');

      cy.visit('/objects');
      cy.wait('@getFilesError');

      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', 'Failed to load files');

      cy.get('[data-testid="retry-button"]')
        .should('be.visible');
    });

    it('should handle concurrent uploads', () => {
      const files = Array.from({ length: 5 }, (_, i) => 
        new File([testFiles.image.content], `image${i}.jpg`, {
          type: 'image/jpeg'
        })
      );

      // Mock staggered upload responses
      files.forEach((_, i) => {
        cy.intercept('POST', '/api/objects/upload', {
          statusCode: 200,
          delay: i * 500, // Stagger responses
          body: {
            success: true,
            data: {
              id: `file-${i}`,
              filename: `image${i}.jpg`
            }
          }
        }).as(`uploadFile${i}`);
      });

      cy.get('input[type="file"][multiple]')
        .selectFile(files, { force: true });

      // Verify all uploads complete
      files.forEach((_, i) => {
        cy.wait(`@uploadFile${i}`);
      });

      cy.get('[data-testid="file-card"]')
        .should('have.length', 5);
    });
  });
});
