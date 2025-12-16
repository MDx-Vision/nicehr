describe('Account Settings - Exhaustive Tests', () => {
  const testData = {
    user: {
      id: null, // Will be populated after login
      email: 'test@example.com',
      name: 'CI Test User',
      username: 'ci-test-user',
      currentPassword: 'test123',
      newPassword: 'newpassword456',
      phone: '+1 (555) 123-4567',
      bio: 'Updated bio for testing purposes',
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        timezone: 'America/New_York',
        theme: 'dark'
      }
    },
    invalidData: {
      email: 'invalid-email',
      phone: '123',
      shortPassword: '123',
      longBio: 'x'.repeat(1001)
    },
    apiEndpoints: {
      settings: '/api/account/settings',
      updateUser: '/api/users/*',
      deleteRequest: '/api/account/delete-request',
      uploadPhoto: '/api/users/*/profile-photo',
      uploadCover: '/api/users/*/cover-photo'
    }
  };

  beforeEach(() => {
    // Clear all auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.currentPassword);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    
    // Get user ID for API calls
    cy.request({
      method: 'GET',
      url: '/api/auth/user',
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        testData.user.id = response.body.id;
      }
    });
  });

  describe('Account Settings Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
    });

    it('should display complete account settings layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1, h2').should('contain.text', /account|settings/i);

      // Navigation tabs or sections
      cy.get('[data-testid="settings-nav"], [data-testid="settings-tabs"]')
        .should('be.visible');

      // Main content area
      cy.get('[data-testid="settings-content"]')
        .should('be.visible');

      // Save/Cancel buttons
      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .should('be.visible');
    });

    it('should have proper navigation between settings sections', () => {
      // Test navigation tabs if they exist
      cy.get('body').then(($body) => {
        const sections = ['Profile', 'Security', 'Preferences', 'Privacy'];
        
        sections.forEach(section => {
          if ($body.find(`[data-testid="tab-${section.toLowerCase()}"]`).length > 0) {
            cy.get(`[data-testid="tab-${section.toLowerCase()}"]`)
              .should('be.visible')
              .click();
            
            cy.get(`[data-testid="${section.toLowerCase()}-section"]`)
              .should('be.visible');
          }
        });
      });
    });

    it('should display breadcrumb navigation', () => {
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Settings');
    });
  });

  describe('Profile Settings - Personal Information', () => {
    beforeEach(() => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.intercept('PUT', testData.apiEndpoints.updateUser).as('updateUser');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
    });

    it('should display and edit basic profile information', () => {
      // Name field
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .should('be.visible')
        .clear()
        .type('Updated Test Name');

      // Email field (should be readonly or disabled)
      cy.get('[data-testid="input-email"]')
        .should('be.visible');

      // Phone field
      cy.get('[data-testid="input-phone"]')
        .should('be.visible')
        .clear()
        .type(testData.user.phone);

      // Bio/Description field
      cy.get('[data-testid="textarea-bio"], [data-testid="input-bio"]')
        .should('be.visible')
        .clear()
        .type(testData.user.bio);

      // Save changes
      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.wait('@updateUser').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });

      // Verify success message
      cy.get('[data-testid="success-message"], .toast, .alert-success')
        .should('be.visible');
    });

    it('should validate required fields', () => {
      // Clear required field
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .clear();

      // Try to save
      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      // Should show validation error
      cy.get('[data-testid="error-name"], .error, .text-red-500')
        .should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]').then($email => {
        if (!$email.is(':disabled') && !$email.is('[readonly]')) {
          cy.wrap($email)
            .clear()
            .type(testData.invalidData.email);

          cy.get('[data-testid="button-save"], [data-testid="button-update"]')
            .click();

          cy.get('[data-testid="error-email"], .error')
            .should('be.visible');
        }
      });
    });

    it('should validate phone number format', () => {
      cy.get('[data-testid="input-phone"]')
        .clear()
        .type(testData.invalidData.phone);

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.get('[data-testid="error-phone"], .error')
        .should('be.visible');
    });

    it('should validate bio character limit', () => {
      cy.get('[data-testid="textarea-bio"], [data-testid="input-bio"]').then($bio => {
        if ($bio.length > 0) {
          cy.wrap($bio)
            .clear()
            .type(testData.invalidData.longBio, { delay: 0 });

          cy.get('[data-testid="button-save"], [data-testid="button-update"]')
            .click();

          cy.get('[data-testid="error-bio"], .error')
            .should('be.visible');
        }
      });
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.intercept('PUT', testData.apiEndpoints.uploadPhoto).as('uploadPhoto');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
    });

    it('should display current profile photo', () => {
      cy.get('[data-testid="profile-photo"], [data-testid="avatar"]')
        .should('be.visible');
    });

    it('should allow profile photo upload', () => {
      // Check if upload button exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-upload-photo"]').length > 0) {
          cy.fixture('test-image.jpg', { encoding: null }).then(fileContent => {
            cy.get('[data-testid="input-photo-upload"]')
              .selectFile({
                contents: fileContent,
                fileName: 'profile.jpg',
                mimeType: 'image/jpeg'
              }, { force: true });

            cy.wait('@uploadPhoto').then((interception) => {
              expect(interception.response.statusCode).to.be.oneOf([200, 201]);
            });
          });
        }
      });
    });

    it('should validate photo file types', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-photo-upload"]').length > 0) {
          cy.fixture('test-document.txt').then(fileContent => {
            cy.get('[data-testid="input-photo-upload"]')
              .selectFile({
                contents: fileContent,
                fileName: 'invalid.txt',
                mimeType: 'text/plain'
              }, { force: true });

            cy.get('[data-testid="error-photo"], .error')
              .should('be.visible');
          });
        }
      });
    });

    it('should allow photo removal', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-remove-photo"]').length > 0) {
          cy.get('[data-testid="button-remove-photo"]')
            .click();

          // Confirm removal if confirmation dialog exists
          cy.get('body').then(($confirmBody) => {
            if ($confirmBody.find('[data-testid="confirm-remove"]').length > 0) {
              cy.get('[data-testid="confirm-remove"]').click();
            }
          });

          cy.get('[data-testid="success-message"], .toast')
            .should('be.visible');
        }
      });
    });
  });

  describe('Security Settings - Password Management', () => {
    beforeEach(() => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.intercept('PUT', testData.apiEndpoints.updateUser).as('updatePassword');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
      
      // Navigate to security section if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="tab-security"]').length > 0) {
          cy.get('[data-testid="tab-security"]').click();
        }
      });
    });

    it('should display password change form', () => {
      cy.get('[data-testid="input-current-password"]')
        .should('be.visible')
        .and('have.attr', 'type', 'password');

      cy.get('[data-testid="input-new-password"]')
        .should('be.visible')
        .and('have.attr', 'type', 'password');

      cy.get('[data-testid="input-confirm-password"]')
        .should('be.visible')
        .and('have.attr', 'type', 'password');

      cy.get('[data-testid="button-change-password"]')
        .should('be.visible');
    });

    it('should successfully change password with valid inputs', () => {
      cy.get('[data-testid="input-current-password"]')
        .type(testData.user.currentPassword);

      cy.get('[data-testid="input-new-password"]')
        .type(testData.user.newPassword);

      cy.get('[data-testid="input-confirm-password"]')
        .type(testData.user.newPassword);

      cy.get('[data-testid="button-change-password"]')
        .click();

      cy.wait('@updatePassword').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });

      cy.get('[data-testid="success-message"], .toast')
        .should('be.visible');
    });

    it('should validate current password', () => {
      cy.get('[data-testid="input-current-password"]')
        .type('wrongpassword');

      cy.get('[data-testid="input-new-password"]')
        .type(testData.user.newPassword);

      cy.get('[data-testid="input-confirm-password"]')
        .type(testData.user.newPassword);

      cy.get('[data-testid="button-change-password"]')
        .click();

      cy.get('[data-testid="error-current-password"], .error')
        .should('be.visible');
    });

    it('should validate password strength requirements', () => {
      cy.get('[data-testid="input-current-password"]')
        .type(testData.user.currentPassword);

      cy.get('[data-testid="input-new-password"]')
        .type(testData.invalidData.shortPassword);

      cy.get('[data-testid="input-confirm-password"]')
        .type(testData.invalidData.shortPassword);

      cy.get('[data-testid="button-change-password"]')
        .click();

      cy.get('[data-testid="error-new-password"], .error')
        .should('be.visible');
    });

    it('should validate password confirmation match', () => {
      cy.get('[data-testid="input-current-password"]')
        .type(testData.user.currentPassword);

      cy.get('[data-testid="input-new-password"]')
        .type(testData.user.newPassword);

      cy.get('[data-testid="input-confirm-password"]')
        .type('differentpassword');

      cy.get('[data-testid="button-change-password"]')
        .click();

      cy.get('[data-testid="error-confirm-password"], .error')
        .should('be.visible');
    });

    it('should show password strength indicator', () => {
      cy.get('[data-testid="input-new-password"]')
        .type('weak');

      cy.get('[data-testid="password-strength"], .password-meter')
        .should('be.visible');

      cy.get('[data-testid="input-new-password"]')
        .clear()
        .type('StrongPassword123!');

      cy.get('[data-testid="password-strength"]')
        .should('contain.text', /strong|good/i);
    });
  });

  describe('Notification Preferences', () => {
    beforeEach(() => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.intercept('PATCH', testData.apiEndpoints.settings).as('updateSettings');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
      
      // Navigate to preferences section if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="tab-preferences"]').length > 0) {
          cy.get('[data-testid="tab-preferences"]').click();
        }
      });
    });

    it('should display notification preference toggles', () => {
      const preferences = [
        'email-notifications',
        'sms-notifications',
        'push-notifications',
        'marketing-emails'
      ];

      preferences.forEach(pref => {
        cy.get(`[data-testid="toggle-${pref}"], [data-testid="checkbox-${pref}"]`)
          .should('exist');
      });
    });

    it('should toggle email notifications', () => {
      cy.get('[data-testid="toggle-email-notifications"], [data-testid="checkbox-email-notifications"]')
        .click();

      cy.get('[data-testid="button-save-preferences"], [data-testid="button-save"]')
        .click();

      cy.wait('@updateSettings').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });

      cy.get('[data-testid="success-message"], .toast')
        .should('be.visible');
    });

    it('should configure notification frequency', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-notification-frequency"]').length > 0) {
          cy.get('[data-testid="select-notification-frequency"]')
            .click();

          cy.get('[data-testid="option-daily"], [value="daily"]')
            .click();

          cy.get('[data-testid="button-save-preferences"]')
            .click();

          cy.wait('@updateSettings');
        }
      });
    });

    it('should manage timezone settings', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="select-timezone"]').length > 0) {
          cy.get('[data-testid="select-timezone"]')
            .click();

          cy.get('[data-testid="option-est"], [value*="New_York"]')
            .click();

          cy.get('[data-testid="button-save-preferences"]')
            .click();

          cy.wait('@updateSettings');
        }
      });
    });
  });

  describe('Privacy Settings', () => {
    beforeEach(() => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.intercept('PATCH', testData.apiEndpoints.settings).as('updatePrivacy');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
      
      // Navigate to privacy section if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="tab-privacy"]').length > 0) {
          cy.get('[data-testid="tab-privacy"]').click();
        }
      });
    });

    it('should display privacy controls', () => {
      const privacySettings = [
        'profile-visibility',
        'data-sharing',
        'analytics-tracking'
      ];

      privacySettings.forEach(setting => {
        cy.get(`[data-testid="toggle-${setting}"], [data-testid="select-${setting}"]`)
          .should('exist');
      });
    });

    it('should update profile visibility settings', () => {
      cy.get('[data-testid="toggle-profile-visibility"], [data-testid="select-profile-visibility"]')
        .first()
        .click();

      cy.get('[data-testid="button-save-privacy"], [data-testid="button-save"]')
        .click();

      cy.wait('@updatePrivacy').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
    });

    it('should display data export options', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-export-data"]').length > 0) {
          cy.get('[data-testid="button-export-data"]')
            .should('be.visible')
            .and('not.be.disabled');
        }
      });
    });
  });

  describe('Account Deletion', () => {
    beforeEach(() => {
      cy.intercept('POST', testData.apiEndpoints.deleteRequest).as('requestDeletion');
      cy.intercept('DELETE', testData.apiEndpoints.deleteRequest).as('cancelDeletion');
      cy.visit('/account/settings');
      
      // Navigate to privacy/danger section if it exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="tab-privacy"]').length > 0) {
          cy.get('[data-testid="tab-privacy"]').click();
        }
      });
    });

    it('should display account deletion warning', () => {
      cy.get('[data-testid="danger-zone"], [data-testid="delete-account-section"]')
        .should('be.visible');

      cy.get('[data-testid="button-delete-account"]')
        .should('be.visible')
        .and('contain.text', /delete|remove/i);
    });

    it('should show confirmation dialog for account deletion', () => {
      cy.get('[data-testid="button-delete-account"]')
        .click();

      cy.get('[data-testid="modal-confirm-delete"], [data-testid="dialog-delete"]')
        .should('be.visible');

      cy.get('[data-testid="button-cancel-delete"]')
        .should('be.visible');

      cy.get('[data-testid="button-confirm-delete"]')
        .should('be.visible');
    });

    it('should cancel account deletion request', () => {
      cy.get('[data-testid="button-delete-account"]')
        .click();

      cy.get('[data-testid="button-cancel-delete"]')
        .click();

      cy.get('[data-testid="modal-confirm-delete"]')
        .should('not.exist');
    });

    it('should require confirmation text for deletion', () => {
      cy.get('[data-testid="button-delete-account"]')
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-delete-confirmation"]').length > 0) {
          cy.get('[data-testid="input-delete-confirmation"]')
            .type('wrong text');

          cy.get('[data-testid="button-confirm-delete"]')
            .should('be.disabled');

          cy.get('[data-testid="input-delete-confirmation"]')
            .clear()
            .type('DELETE');

          cy.get('[data-testid="button-confirm-delete"]')
            .should('not.be.disabled');
        }
      });
    });

    it('should submit account deletion request', () => {
      cy.get('[data-testid="button-delete-account"]')
        .click();

      // Fill confirmation if required
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-delete-confirmation"]').length > 0) {
          cy.get('[data-testid="input-delete-confirmation"]')
            .type('DELETE');
        }
      });

      cy.get('[data-testid="button-confirm-delete"]')
        .click();

      cy.wait('@requestDeletion').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });

      cy.get('[data-testid="success-message"], .toast')
        .should('be.visible');
    });
  });

  describe('API Integration Tests', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should handle GET /api/account/settings', () => {
      cy.intercept('GET', testData.apiEndpoints.settings).as('getSettings');
      cy.reload();

      cy.wait('@getSettings').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body).to.have.property('id');
      });
    });

    it('should handle PATCH /api/account/settings', () => {
      cy.intercept('PATCH', testData.apiEndpoints.settings).as('updateSettings');

      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .clear()
        .type('Updated Name');

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.wait('@updateSettings').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
        expect(interception.request.body).to.have.property('name', 'Updated Name');
      });
    });

    it('should handle PUT /api/users/:id for profile updates', () => {
      cy.intercept('PUT', testData.apiEndpoints.updateUser).as('updateUser');

      cy.get('[data-testid="input-phone"]')
        .clear()
        .type(testData.user.phone);

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.wait('@updateUser').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
    });

    it('should handle POST /api/account/delete-request', () => {
      cy.intercept('POST', testData.apiEndpoints.deleteRequest).as('deleteRequest');

      cy.get('[data-testid="button-delete-account"]')
        .click();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-delete-confirmation"]').length > 0) {
          cy.get('[data-testid="input-delete-confirmation"]')
            .type('DELETE');
        }
      });

      cy.get('[data-testid="button-confirm-delete"]')
        .click();

      cy.wait('@deleteRequest').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('PATCH', testData.apiEndpoints.settings, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateError');

      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .clear()
        .type('Test Name');

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.wait('@updateError');

      cy.get('[data-testid="error-message"], .error, .alert-error')
        .should('be.visible');
    });

    it('should handle network failures', () => {
      cy.intercept('PATCH', testData.apiEndpoints.settings, { forceNetworkError: true })
        .as('networkError');

      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .clear()
        .type('Test Name');

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.wait('@networkError');

      cy.get('[data-testid="error-message"], .error')
        .should('be.visible');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', testData.apiEndpoints.settings, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedError');

      cy.reload();

      cy.wait('@unauthorizedError');
      cy.url().should('include', '/login');
    });

    it('should maintain form state during validation errors', () => {
      const testName = 'Test Name for Validation';
      
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .clear()
        .type(testName);

      cy.get('[data-testid="input-email"]').then($email => {
        if (!$email.is(':disabled') && !$email.is('[readonly]')) {
          cy.wrap($email)
            .clear()
            .type('invalid-email');
        }
      });

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      // Name should still be present after validation error
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .should('have.value', testName);
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');

      // Page should still be usable
      cy.get('[data-testid="settings-content"]')
        .should('be.visible');

      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .should('be.visible')
        .and('have.css', 'width');

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .should('be.visible');
    });

    it('should handle tablet layout', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="settings-content"]')
        .should('be.visible');

      // Navigation should be accessible
      cy.get('[data-testid="settings-nav"], [data-testid="settings-tabs"]')
        .should('be.visible');
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should have proper form labels and ARIA attributes', () => {
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'id');

      cy.get('[data-testid="input-email"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'id');

      cy.get('[data-testid="input-phone"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'id');
    });

    it('should be keyboard navigable', () => {
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .focus()
        .tab()
        .focused()
        .should('not.have.id', 'input-name'); // Should move to next element
    });

    it('should announce errors to screen readers', () => {
      cy.get('[data-testid="input-name"], [data-testid="input-full-name"]')
        .clear();

      cy.get('[data-testid="button-save"], [data-testid="button-update"]')
        .click();

      cy.get('[data-testid="error-name"], .error')
        .should('have.attr', 'role', 'alert')
        .or('have.attr', 'aria-live');
    });
  });
});
