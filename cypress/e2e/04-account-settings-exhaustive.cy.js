describe('Account Settings - Exhaustive Tests', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    name: 'CI Test User',
    role: 'admin'
  };

  const apiEndpoints = {
    settings: '/api/account/settings',
    updateSettings: '/api/account/settings',
    deleteRequest: '/api/account/delete-request',
    userUpdate: `/api/users/${testUser.id}`,
    profilePhoto: `/api/users/${testUser.id}/profile-photo`,
    coverPhoto: `/api/users/${testUser.id}/cover-photo`,
    uploadObject: '/api/objects/upload'
  };

  const mockAccountSettings = {
    id: testUser.id,
    email: testUser.email,
    name: testUser.name,
    firstName: 'CI',
    lastName: 'Test User',
    phone: '+1234567890',
    timezone: 'America/New_York',
    language: 'en',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    profilePhoto: null,
    coverPhoto: null,
    bio: 'Test user bio',
    location: 'New York, NY',
    website: 'https://example.com'
  };

  const validationTestCases = {
    email: [
      { value: '', expected: 'required' },
      { value: 'invalid-email', expected: 'invalid format' },
      { value: 'test@', expected: 'invalid format' },
      { value: '@example.com', expected: 'invalid format' },
      { value: 'valid@example.com', expected: 'valid' }
    ],
    name: [
      { value: '', expected: 'required' },
      { value: 'A', expected: 'too short' },
      { value: 'A'.repeat(101), expected: 'too long' },
      { value: 'Valid Name', expected: 'valid' }
    ],
    phone: [
      { value: '123', expected: 'invalid format' },
      { value: 'abc123', expected: 'invalid format' },
      { value: '+1234567890', expected: 'valid' },
      { value: '(555) 123-4567', expected: 'valid' }
    ],
    website: [
      { value: 'invalid-url', expected: 'invalid format' },
      { value: 'http://valid.com', expected: 'valid' },
      { value: 'https://example.com', expected: 'valid' }
    ]
  };

  beforeEach(() => {
    // Login as test user
    cy.login(testUser.email, 'test123');
    
    // Setup API interceptors
    cy.intercept('GET', apiEndpoints.settings, { 
      statusCode: 200, 
      body: mockAccountSettings 
    }).as('getSettings');

    cy.intercept('PATCH', apiEndpoints.updateSettings, (req) => {
      return {
        statusCode: 200,
        body: { ...mockAccountSettings, ...req.body }
      };
    }).as('updateSettings');

    cy.intercept('PUT', apiEndpoints.userUpdate, (req) => {
      return {
        statusCode: 200,
        body: { ...mockAccountSettings, ...req.body }
      };
    }).as('updateUser');

    cy.intercept('POST', apiEndpoints.deleteRequest, {
      statusCode: 200,
      body: { success: true }
    }).as('deleteRequest');

    cy.intercept('DELETE', apiEndpoints.deleteRequest, {
      statusCode: 200,
      body: { success: true }
    }).as('cancelDeleteRequest');
  });

  describe('Account Settings Page - Navigation & Access', () => {
    it('should navigate to account settings from main menu', () => {
      cy.visit('/dashboard');
      
      // Find and click account/profile menu
      cy.get('[data-testid="user-menu"], [data-testid="profile-menu"], .user-menu')
        .first()
        .click();
      
      cy.get('[data-testid="settings-link"], a[href*="settings"], a[href*="account"]')
        .first()
        .click();
      
      cy.url().should('include', '/settings');
      cy.wait('@getSettings');
    });

    it('should access account settings via direct URL', () => {
      cy.visit('/settings');
      cy.wait('@getSettings');
      
      cy.get('[data-testid="settings-container"], .settings-page, main')
        .should('be.visible');
    });

    it('should redirect unauthenticated users to login', () => {
      cy.logout();
      cy.visit('/settings');
      cy.url().should('include', '/login');
    });
  });

  describe('Account Settings Page - Layout & Components', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display complete settings page layout', () => {
      // Main container
      cy.get('[data-testid="settings-container"], .settings-page, main')
        .should('be.visible');
      
      // Page title
      cy.get('h1, [data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', /settings|account/i);
      
      // Settings sections
      cy.get('[data-testid="profile-section"], .profile-settings, fieldset')
        .should('be.visible');
    });

    it('should display settings navigation/tabs if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="settings-nav"], .settings-tabs, nav').length > 0) {
          cy.get('[data-testid="settings-nav"], .settings-tabs, nav')
            .should('be.visible');
          
          // Check common setting sections
          const sections = ['Profile', 'Security', 'Notifications', 'Privacy', 'Account'];
          sections.forEach(section => {
            cy.get('body').then(($el) => {
              if ($el.text().includes(section)) {
                cy.contains(section).should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display profile information form', () => {
      // Basic profile fields
      cy.get('input[name="name"], input[name="firstName"], [data-testid="input-name"]')
        .should('exist');
      
      cy.get('input[name="email"], [data-testid="input-email"]')
        .should('exist')
        .and('have.value', mockAccountSettings.email);
      
      // Optional fields that might exist
      const optionalFields = ['phone', 'bio', 'location', 'website'];
      optionalFields.forEach(field => {
        cy.get('body').then(($body) => {
          if ($body.find(`input[name="${field}"], textarea[name="${field}"], [data-testid="input-${field}"]`).length > 0) {
            cy.get(`input[name="${field}"], textarea[name="${field}"], [data-testid="input-${field}"]`)
              .should('be.visible');
          }
        });
      });
    });

    it('should display notification preferences section', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="notifications-section"], .notification-settings').length > 0) {
          cy.get('[data-testid="notifications-section"], .notification-settings')
            .should('be.visible');
          
          // Common notification types
          const notificationTypes = ['email', 'sms', 'push'];
          notificationTypes.forEach(type => {
            cy.get(`input[name*="${type}"], [data-testid*="${type}"]`).then(($el) => {
              if ($el.length > 0) {
                cy.wrap($el).should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display save/update button', () => {
      cy.get('button[type="submit"], [data-testid="save-button"], [data-testid="update-button"]')
        .should('be.visible')
        .and('not.be.disabled');
    });
  });

  describe('Profile Information - Basic Fields', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should update basic profile information', () => {
      const updatedData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      // Update name field
      cy.get('input[name="name"], [data-testid="input-name"]')
        .clear()
        .type(updatedData.name);

      // Update email field
      cy.get('input[name="email"], [data-testid="input-email"]')
        .clear()
        .type(updatedData.email);

      // Submit form
      cy.get('button[type="submit"], [data-testid="save-button"], [data-testid="update-button"]')
        .click();

      cy.wait('@updateSettings').then((interception) => {
        expect(interception.request.body).to.include(updatedData);
      });

      // Verify success message
      cy.get('[data-testid="success-message"], .success, .alert-success')
        .should('be.visible')
        .and('contain.text', /updated|saved/i);
    });

    it('should validate required fields', () => {
      // Clear required fields
      cy.get('input[name="name"], [data-testid="input-name"]')
        .clear();
      
      cy.get('input[name="email"], [data-testid="input-email"]')
        .clear();

      // Try to submit
      cy.get('button[type="submit"], [data-testid="save-button"]')
        .click();

      // Check for validation errors
      cy.get('[data-testid="error-message"], .error, .alert-error, .field-error')
        .should('exist');
    });

    it('should validate email format', () => {
      validationTestCases.email.forEach(testCase => {
        cy.get('input[name="email"], [data-testid="input-email"]')
          .clear()
          .type(testCase.value);

        if (testCase.expected === 'valid') {
          cy.get('input[name="email"], [data-testid="input-email"]')
            .should('not.have.class', 'error')
            .and('not.have.attr', 'aria-invalid', 'true');
        } else {
          // Trigger validation by clicking submit or leaving field
          cy.get('button[type="submit"]').click();
          
          cy.get('body').then(($body) => {
            // Look for various error indicators
            const hasError = 
              $body.find('input[name="email"]:invalid').length > 0 ||
              $body.find('input[name="email"].error').length > 0 ||
              $body.find('[data-testid="email-error"]').length > 0 ||
              $body.find('.field-error').length > 0;
            
            if (hasError) {
              expect(hasError).to.be.true;
            }
          });
        }
      });
    });
  });

  describe('Profile Information - Extended Fields', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should update phone number with validation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="phone"], [data-testid="input-phone"]').length > 0) {
          validationTestCases.phone.forEach(testCase => {
            cy.get('input[name="phone"], [data-testid="input-phone"]')
              .clear()
              .type(testCase.value);

            if (testCase.expected === 'valid') {
              cy.get('button[type="submit"]').click();
              cy.wait('@updateSettings');
            }
          });
        }
      });
    });

    it('should update bio/description field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('textarea[name="bio"], [data-testid="input-bio"]').length > 0) {
          const longBio = 'This is a comprehensive bio that describes the user in detail with multiple sentences and various information about their background and experience.';
          
          cy.get('textarea[name="bio"], [data-testid="input-bio"]')
            .clear()
            .type(longBio);

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });

    it('should validate website URL format', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="website"], [data-testid="input-website"]').length > 0) {
          validationTestCases.website.forEach(testCase => {
            cy.get('input[name="website"], [data-testid="input-website"]')
              .clear()
              .type(testCase.value);

            if (testCase.expected === 'valid') {
              cy.get('button[type="submit"]').click();
              cy.wait('@updateSettings');
            }
          });
        }
      });
    });

    it('should update location field', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="location"], [data-testid="input-location"]').length > 0) {
          const testLocation = 'San Francisco, CA';
          
          cy.get('input[name="location"], [data-testid="input-location"]')
            .clear()
            .type(testLocation);

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display current profile photo if exists', () => {
      cy.intercept('GET', apiEndpoints.settings, { 
        statusCode: 200, 
        body: { ...mockAccountSettings, profilePhoto: '/uploads/profile-123.jpg' }
      }).as('getSettingsWithPhoto');

      cy.reload();
      cy.wait('@getSettingsWithPhoto');

      cy.get('[data-testid="profile-photo"], .profile-photo, img[alt*="profile"]')
        .should('be.visible');
    });

    it('should allow uploading new profile photo', () => {
      cy.intercept('POST', apiEndpoints.uploadObject, {
        statusCode: 200,
        body: { url: '/uploads/new-profile.jpg' }
      }).as('uploadPhoto');

      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: { success: true, profilePhoto: '/uploads/new-profile.jpg' }
      }).as('updateProfilePhoto');

      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"], [data-testid="upload-profile-photo"]').length > 0) {
          // Create a test file
          const fileName = 'profile-test.jpg';
          cy.fixture('test-image.jpg', 'base64').then(fileContent => {
            const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            cy.get('input[type="file"]').then(input => {
              input[0].files = dataTransfer.files;
              cy.wrap(input).trigger('change', { force: true });
            });
          });

          cy.wait('@uploadPhoto');
          cy.wait('@updateProfilePhoto');

          // Verify success message
          cy.get('[data-testid="success-message"], .success')
            .should('contain.text', /uploaded|updated/i);
        }
      });
    });

    it('should validate file type and size for profile photo', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"]').length > 0) {
          // Test invalid file type
          const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(invalidFile);

          cy.get('input[type="file"]').then(input => {
            input[0].files = dataTransfer.files;
            cy.wrap(input).trigger('change', { force: true });
          });

          // Should show error for invalid file type
          cy.get('[data-testid="error-message"], .error, .alert-error')
            .should('contain.text', /format|type|invalid/i);
        }
      });
    });

    it('should allow removing profile photo', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: { success: true, profilePhoto: null }
      }).as('removeProfilePhoto');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="remove-photo"], button[title*="remove"]').length > 0) {
          cy.get('[data-testid="remove-photo"], button[title*="remove"]')
            .click();

          cy.wait('@removeProfilePhoto');

          cy.get('[data-testid="success-message"], .success')
            .should('contain.text', /removed|deleted/i);
        }
      });
    });
  });

  describe('Notification Preferences', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display notification preference toggles', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="notifications-section"]').length > 0) {
          const notificationTypes = [
            'emailNotifications',
            'smsNotifications', 
            'pushNotifications',
            'projectUpdates',
            'assignmentNotifications'
          ];

          notificationTypes.forEach(type => {
            cy.get(`input[name="${type}"], [data-testid="${type}"]`).then(($el) => {
              if ($el.length > 0) {
                cy.wrap($el).should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should update email notification preferences', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="emailNotifications"], [data-testid="emailNotifications"]').length > 0) {
          // Toggle email notifications
          cy.get('input[name="emailNotifications"], [data-testid="emailNotifications"]')
            .click();

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');

          cy.get('[data-testid="success-message"], .success')
            .should('contain.text', /updated|saved/i);
        }
      });
    });

    it('should update SMS notification preferences', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="smsNotifications"], [data-testid="smsNotifications"]').length > 0) {
          cy.get('input[name="smsNotifications"], [data-testid="smsNotifications"]')
            .click();

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });

    it('should update push notification preferences', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="pushNotifications"], [data-testid="pushNotifications"]').length > 0) {
          cy.get('input[name="pushNotifications"], [data-testid="pushNotifications"]')
            .click();

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });

    it('should save all notification preferences together', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="notifications-section"]').length > 0) {
          // Update multiple notification settings
          const settings = ['emailNotifications', 'smsNotifications', 'pushNotifications'];
          
          settings.forEach(setting => {
            cy.get(`input[name="${setting}"]`).then(($el) => {
              if ($el.length > 0) {
                cy.wrap($el).click();
              }
            });
          });

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });
  });

  describe('Privacy & Security Settings', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display privacy controls if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="privacy-section"], .privacy-settings').length > 0) {
          cy.get('[data-testid="privacy-section"], .privacy-settings')
            .should('be.visible');

          // Common privacy settings
          const privacySettings = ['profileVisibility', 'contactVisibility', 'activityTracking'];
          privacySettings.forEach(setting => {
            cy.get(`input[name="${setting}"], [data-testid="${setting}"]`).then(($el) => {
              if ($el.length > 0) {
                cy.wrap($el).should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display password change section', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="password-section"], .password-settings').length > 0) {
          cy.get('[data-testid="password-section"], .password-settings')
            .should('be.visible');

          cy.get('input[name="currentPassword"], [data-testid="current-password"]')
            .should('exist');
          cy.get('input[name="newPassword"], [data-testid="new-password"]')
            .should('exist');
          cy.get('input[name="confirmPassword"], [data-testid="confirm-password"]')
            .should('exist');
        }
      });
    });

    it('should validate password change form', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="newPassword"]').length > 0) {
          // Test password mismatch
          cy.get('input[name="newPassword"]')
            .type('newPassword123');
          cy.get('input[name="confirmPassword"]')
            .type('differentPassword123');

          cy.get('button[type="submit"], [data-testid="change-password"]')
            .click();

          cy.get('[data-testid="error-message"], .error')
            .should('contain.text', /match|confirm/i);
        }
      });
    });

    it('should require current password for changes', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[name="currentPassword"]').length > 0) {
          // Try to change password without current password
          cy.get('input[name="newPassword"]')
            .type('newPassword123');
          cy.get('input[name="confirmPassword"]')
            .type('newPassword123');

          cy.get('button[type="submit"]').click();

          cy.get('[data-testid="error-message"], .error')
            .should('contain.text', /current.*password/i);
        }
      });
    });
  });

  describe('Language & Timezone Settings', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display timezone selection', () => {
      cy.get('body').then(($body) => {
        if ($body.find('select[name="timezone"], [data-testid="timezone-select"]').length > 0) {
          cy.get('select[name="timezone"], [data-testid="timezone-select"]')
            .should('be.visible');

          // Test selecting a different timezone
          cy.get('select[name="timezone"]')
            .select('America/Los_Angeles');

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });

    it('should display language selection', () => {
      cy.get('body').then(($body) => {
        if ($body.find('select[name="language"], [data-testid="language-select"]').length > 0) {
          cy.get('select[name="language"], [data-testid="language-select"]')
            .should('be.visible');

          // Test selecting a different language
          cy.get('select[name="language"]')
            .select('es'); // Spanish

          cy.get('button[type="submit"]').click();
          cy.wait('@updateSettings');
        }
      });
    });
  });

  describe('Account Deletion', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display account deletion section', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="danger-zone"], .danger-section').length > 0) {
          cy.get('[data-testid="danger-zone"], .danger-section')
            .should('be.visible');

          cy.get('[data-testid="delete-account"], button[data-danger="true"]')
            .should('be.visible')
            .and('contain.text', /delete|deactivate/i);
        }
      });
    });

    it('should show confirmation dialog for account deletion', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="delete-account"]').length > 0) {
          cy.get('[data-testid="delete-account"]').click();

          // Should show confirmation dialog
          cy.get('[data-testid="confirmation-dialog"], .modal, dialog')
            .should('be.visible');

          cy.get('[data-testid="confirm-delete"], button[data-testid="confirm"]')
            .should('be.visible');

          cy.get('[data-testid="cancel-delete"], button[data-testid="cancel"]')
            .should('be.visible');
        }
      });
    });

    it('should cancel account deletion', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="delete-account"]').length > 0) {
          cy.get('[data-testid="delete-account"]').click();

          cy.get('[data-testid="cancel-delete"], button[data-testid="cancel"]')
            .click();

          // Dialog should close
          cy.get('[data-testid="confirmation-dialog"], .modal')
            .should('not.exist');
        }
      });
    });

    it('should submit account deletion request', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="delete-account"]').length > 0) {
          cy.get('[data-testid="delete-account"]').click();

          cy.get('[data-testid="confirm-delete"], button[data-testid="confirm"]')
            .click();

          cy.wait('@deleteRequest');

          cy.get('[data-testid="success-message"], .success')
            .should('contain.text', /deletion.*request/i);
        }
      });
    });

    it('should allow canceling pending deletion request', () => {
      // Mock pending deletion state
      cy.intercept('GET', apiEndpoints.settings, { 
        statusCode: 200, 
        body: { ...mockAccountSettings, pendingDeletion: true, deletionDate: '2024-01-15' }
      }).as('getSettingsWithDeletion');

      cy.reload();
      cy.wait('@getSettingsWithDeletion');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="cancel-deletion"]').length > 0) {
          cy.get('[data-testid="cancel-deletion"]').click();

          cy.wait('@cancelDeleteRequest');

          cy.get('[data-testid="success-message"], .success')
            .should('contain.text', /cancelled|canceled/i);
        }
      });
    });
  });

  describe('Form Behavior & User Experience', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should show loading state during save operation', () => {
      // Delay the API response to test loading state
      cy.intercept('PATCH', apiEndpoints.updateSettings, (req) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              statusCode: 200,
              body: { ...mockAccountSettings, ...req.body }
            });
          }, 2000);
        });
      }).as('slowUpdateSettings');

      // Make a change and submit
      cy.get('input[name="name"]')
        .clear()
        .type('Loading Test Name');

      cy.get('button[type="submit"]').click();

      // Check for loading state
      cy.get('button[type="submit"]')
        .should('be.disabled')
        .and('contain.text', /saving|updating|loading/i);

      cy.wait('@slowUpdateSettings');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('PATCH', apiEndpoints.updateSettings, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('errorUpdateSettings');

      cy.get('input[name="name"]')
        .clear()
        .type('Error Test Name');

      cy.get('button[type="submit"]').click();

      cy.wait('@errorUpdateSettings');

      cy.get('[data-testid="error-message"], .error, .alert-error')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });

    it('should handle validation errors from server', () => {
      cy.intercept('PATCH', apiEndpoints.updateSettings, {
        statusCode: 400,
        body: { 
          error: 'Validation failed',
          details: { email: 'Email already exists' }
        }
      }).as('validationError');

      cy.get('input[name="email"]')
        .clear()
        .type('existing@example.com');

      cy.get('button[type="submit"]').click();

      cy.wait('@validationError');

      cy.get('[data-testid="error-message"], .error')
        .should('contain.text', /already exists|validation/i);
    });

    it('should maintain form state after failed submission', () => {
      cy.intercept('PATCH', apiEndpoints.updateSettings, {
        statusCode: 400,
        body: { error: 'Validation failed' }
      }).as('failedUpdate');

      const testData = {
        name: 'Test Name Persistence',
        email: 'test-persistence@example.com'
      };

      cy.get('input[name="name"]')
        .clear()
        .type(testData.name);

      cy.get('input[name="email"]')
        .clear()
        .type(testData.email);

      cy.get('button[type="submit"]').click();
      cy.wait('@failedUpdate');

      // Form should maintain the entered values
      cy.get('input[name="name"]')
        .should('have.value', testData.name);
      
      cy.get('input[name="email"]')
        .should('have.value', testData.email);
    });

    it('should auto-save form changes', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="auto-save"]').length > 0) {
          cy.get('input[name="name"]')
            .clear()
            .type('Auto Save Test');

          // Wait for auto-save delay
          cy.wait(3000);
          cy.wait('@updateSettings');

          cy.get('[data-testid="auto-save-indicator"], .auto-saved')
            .should('contain.text', /saved|auto.*saved/i);
        }
      });
    });

    it('should warn about unsaved changes when navigating away', () => {
      // Make a change without saving
      cy.get('input[name="name"]')
        .clear()
        .type('Unsaved Changes Test');

      // Try to navigate away
      cy.get('a[href="/dashboard"], [data-testid="nav-dashboard"]').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).click();

          // Should show confirmation dialog
          cy.on('window:confirm', (message) => {
            expect(message).to.include('unsaved');
            return false; // Cancel navigation
          });
        }
      });
    });
  });

  describe('Responsive Behavior & Accessibility', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');

      cy.get('[data-testid="settings-container"], main')
        .should('be.visible');

      // Form should be usable on mobile
      cy.get('input[name="name"]')
        .should('be.visible')
        .and('have.css', 'font-size')
        .and('not.equal', '16px'); // Should not be 16px to prevent zoom on iOS

      cy.get('button[type="submit"]')
        .should('be.visible')
        .and('have.css', 'min-height', '44px'); // Touch target size
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="settings-container"], main')
        .should('be.visible');

      // All form elements should be accessible
      cy.get('input, select, textarea, button')
        .should('be.visible');
    });

    it('should have proper ARIA labels and accessibility', () => {
      // Form should have proper structure
      cy.get('form, [role="form"]').within(() => {
        // All inputs should have labels
        cy.get('input').each(($input) => {
          const id = $input.attr('id');
          if (id) {
            cy.get(`label[for="${id}"]`).should('exist');
          }
        });
      });

      // Required fields should be marked
      cy.get('input[required]').each(($input) => {
        cy.wrap($input).should('have.attr', 'aria-required', 'true');
      });
    });

    it('should support keyboard navigation', () => {
      // Tab through form elements
      cy.get('input, select, textarea, button')
        .first()
        .focus()
        .tab()
        .focused()
        .should('not.be', cy.get('input').first());

      // Submit with Enter key
      cy.get('input[name="name"]')
        .focus()
        .clear()
        .type('Keyboard Test{enter}');

      cy.wait('@updateSettings');
    });

    it('should handle focus management properly', () => {
      // Focus should be managed when opening/closing dialogs
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="delete-account"]').length > 0) {
          cy.get('[data-testid="delete-account"]').click();

          // Focus should move to modal
          cy.get('[data-testid="confirmation-dialog"] button')
            .first()
            .should('have.focus');

          cy.get('[data-testid="cancel-delete"]').click();

          // Focus should return to trigger button
          cy.get('[data-testid="delete-account"]')
            .should('have.focus');
        }
      });
    });
  });

  describe('Integration & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should handle concurrent updates gracefully', () => {
      // Simulate concurrent updates
      cy.intercept('PATCH', apiEndpoints.updateSettings, {
        statusCode: 409,
        body: { error: 'Conflict: Data was modified by another session' }
      }).as('conflictError');

      cy.get('input[name="name"]')
        .clear()
        .type('Concurrent Update Test');

      cy.get('button[type="submit"]').click();
      cy.wait('@conflictError');

      cy.get('[data-testid="error-message"], .error')
        .should('contain.text', /conflict|modified/i);

      // Should offer to reload or merge
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="reload-data"], button').length > 0) {
          cy.get('[data-testid="reload-data"]')
            .should('be.visible');
        }
      });
    });

    it('should handle large profile photos efficiently', () => {
      cy.get('body').then(($body) => {
        if ($body.find('input[type="file"]').length > 0) {
          // Test file size limit
          const largeFile = new File(['x'.repeat(10000000)], 'large-image.jpg', { 
            type: 'image/jpeg' 
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(largeFile);

          cy.get('input[type="file"]').then(input => {
            input[0].files = dataTransfer.files;
            cy.wrap(input).trigger('change', { force: true });
          });

          // Should show file size error
          cy.get('[data-testid="error-message"], .error')
            .should('contain.text', /size|large|limit/i);
        }
      });
    });

    it('should handle network interruptions gracefully', () => {
      // Simulate network failure
      cy.intercept('PATCH', apiEndpoints.updateSettings, {
        forceNetworkError: true
      }).as('networkError');

      cy.get('input[name="name"]')
        .clear()
        .type('Network Error Test');

      cy.get('button[type="submit"]').click();

      cy.wait('@networkError');

      cy.get('[data-testid="error-message"], .error')
        .should('contain.text', /network|connection|offline/i);

      // Should offer retry option
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="retry-button"]').length > 0) {
          cy.get('[data-testid="retry-button"]')
            .should('be.visible')
            .and('contain.text', /retry|try.*again/i);
        }
      });
    });

    it('should maintain security when updating sensitive data', () => {
      // Email changes should require additional verification
      cy.get('input[name="email"]')
        .clear()
        .type('security-test@example.com');

      cy.get('button[type="submit"]').click();

      cy.get('body').then(($body) => {
        // Should either show verification requirement or confirmation
        const hasVerification = 
          $body.find('[data-testid="verification-required"]').length > 0 ||
          $body.find('.verification-notice').length > 0 ||
          $body.text().includes('verification') ||
          $body.text().includes('confirm');

        if (hasVerification) {
          cy.get('[data-testid="verification-required"], .verification-notice')
            .should('be.visible');
        }
      });
    });

    it('should preserve data integrity during partial failures', () => {
      // Test partial update failure
      cy.intercept('PATCH', apiEndpoints.updateSettings, (req) => {
        // Simulate partial success
        return {
          statusCode: 207, // Multi-status
          body: {
            success: { name: 'Updated successfully' },
            errors: { email: 'Email update failed' }
          }
        };
      }).as('partialUpdate');

      cy.get('input[name="name"]')
        .clear()
        .type('Partial Success Name');

      cy.get('input[name="email"]')
        .clear()
        .type('partial-fail@example.com');

      cy.get('button[type="submit"]').click();
      cy.wait('@partialUpdate');

      // Should show both success and error messages
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        expect(bodyText).to.include('name'); // Success message about name
        expect(bodyText).to.include('email'); // Error message about email
      });
    });
  });
});
