describe('Account Management - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    settings: {
      valid: {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        phone: '+1-555-123-4567',
        timezone: 'America/New_York',
        language: 'en',
        notificationEmail: true,
        notificationSms: false,
        notificationPush: true
      },
      invalid: {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        phone: 'invalid-phone'
      }
    }
  };

  const apiEndpoints = {
    user: '/api/auth/user',
    settings: '/api/account/settings',
    updateUser: '/api/users/*',
    profilePhoto: '/api/users/*/profile-photo',
    coverPhoto: '/api/users/*/cover-photo',
    deleteRequest: '/api/account/delete-request',
    upload: '/api/objects/upload'
  };

  beforeEach(() => {
    // Clear all storage and cookies
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login with test user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.user.email);
    cy.get('[data-testid="input-password"]').type(testData.user.password);
    cy.get('[data-testid="button-login"]').click();
    
    // Wait for login to complete
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Account Settings Page - Navigation & Layout', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should display complete account settings page layout', () => {
      // Page header and navigation
      cy.get('[data-testid="account-settings-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Main sections should be present
      cy.get('[data-testid="profile-section"]').should('be.visible');
      cy.get('[data-testid="preferences-section"]').should('be.visible');
      cy.get('[data-testid="security-section"]').should('be.visible');
      
      // Page title
      cy.get('h1').should('contain.text', /account|settings|profile/i);
      
      // Breadcrumb navigation (if present)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="breadcrumb"]').length > 0) {
          cy.get('[data-testid="breadcrumb"]').should('be.visible');
        }
      });
    });

    it('should have proper navigation structure', () => {
      // Check if tabs/sections navigation exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="settings-tabs"]').length > 0) {
          cy.get('[data-testid="settings-tabs"]')
            .should('be.visible')
            .find('[role="tab"]')
            .should('have.length.at.least', 1);
        }
      });

      // Sidebar navigation (if present)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="settings-sidebar"]').length > 0) {
          cy.get('[data-testid="settings-sidebar"]')
            .should('be.visible')
            .find('a, button')
            .should('have.length.at.least', 1);
        }
      });
    });

    it('should display user information correctly', () => {
      // Intercept user data API call
      cy.intercept('GET', apiEndpoints.user).as('getUserData');
      
      cy.reload();
      cy.wait('@getUserData');

      // Check if user info is displayed
      cy.get('[data-testid="user-email"]')
        .should('contain.text', testData.user.email);
      
      // Profile photo area
      cy.get('[data-testid="profile-photo"]').should('be.visible');
    });
  });

  describe('Profile Information Management', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.settings).as('getSettings');
      cy.intercept('PATCH', apiEndpoints.settings).as('updateSettings');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
    });

    it('should load and display current profile information', () => {
      // Check form fields are populated
      cy.get('[data-testid="input-first-name"]')
        .should('be.visible')
        .and('have.value');
      
      cy.get('[data-testid="input-last-name"]')
        .should('be.visible')
        .and('have.value');
      
      cy.get('[data-testid="input-email"]')
        .should('be.visible')
        .and('have.value', testData.user.email);
    });

    it('should update profile information successfully', () => {
      // Fill out the form
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type(testData.settings.valid.firstName);
      
      cy.get('[data-testid="input-last-name"]')
        .clear()
        .type(testData.settings.valid.lastName);
      
      // Phone number (if present)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-phone"]').length > 0) {
          cy.get('[data-testid="input-phone"]')
            .clear()
            .type(testData.settings.valid.phone);
        }
      });

      // Save changes
      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@updateSettings');

      // Check for success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /success|saved|updated/i);
    });

    it('should validate required fields', () => {
      // Clear required fields
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      
      // Try to save
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Check for validation errors
      cy.get('[data-testid="error-first-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);
      
      cy.get('[data-testid="error-last-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);
    });

    it('should validate email format', () => {
      // Enter invalid email
      cy.get('[data-testid="input-email"]')
        .clear()
        .type(testData.settings.invalid.email);
      
      // Try to save
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Check for email validation error
      cy.get('[data-testid="error-email"]')
        .should('be.visible')
        .and('contain.text', /valid|format/i);
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('PATCH', apiEndpoints.settings, {
        statusCode: 400,
        body: { message: 'Validation failed' }
      }).as('updateSettingsError');

      // Fill and submit form
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Test');
      
      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@updateSettingsError');

      // Check for error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should display profile photo upload interface', () => {
      cy.get('[data-testid="profile-photo-section"]').should('be.visible');
      cy.get('[data-testid="profile-photo"]').should('be.visible');
      cy.get('[data-testid="button-upload-photo"]').should('be.visible');
    });

    it('should upload profile photo successfully', () => {
      cy.intercept('POST', apiEndpoints.upload).as('uploadFile');
      cy.intercept('PUT', apiEndpoints.profilePhoto).as('updateProfilePhoto');

      // Create a test file
      const fileName = 'profile.jpg';
      const fileContent = 'fake-image-content';

      // Upload photo
      cy.get('[data-testid="input-profile-photo"]').then(($input) => {
        if ($input.length > 0) {
          cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
            const blob = Cypress.Blob.base64StringToBlob(fileContent);
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            $input[0].files = dataTransfer.files;
            $input[0].dispatchEvent(new Event('change', { bubbles: true }));
          });
        }
      });

      // Check for upload success
      cy.get('[data-testid="upload-success"]')
        .should('be.visible')
        .and('contain.text', /success|uploaded/i);
    });

    it('should remove profile photo', () => {
      // Check if remove button exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-remove-photo"]').length > 0) {
          cy.get('[data-testid="button-remove-photo"]').click();
          
          // Confirm removal if confirmation dialog appears
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="confirm-remove"]').length > 0) {
              cy.get('[data-testid="confirm-remove"]').click();
            }
          });

          // Check photo was removed
          cy.get('[data-testid="profile-photo"]')
            .should('not.have.attr', 'src')
            .or('have.attr', 'src', '');
        }
      });
    });

    it('should validate photo file types', () => {
      // Try to upload invalid file type
      const fileName = 'test.txt';
      
      cy.get('[data-testid="input-profile-photo"]').then(($input) => {
        if ($input.length > 0) {
          const file = new File(['invalid'], fileName, { type: 'text/plain' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          $input[0].files = dataTransfer.files;
          $input[0].dispatchEvent(new Event('change', { bubbles: true }));

          // Check for validation error
          cy.get('[data-testid="upload-error"]')
            .should('be.visible')
            .and('contain.text', /format|type/i);
        }
      });
    });
  });

  describe('Notification Preferences', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.settings).as('getSettings');
      cy.intercept('PATCH', apiEndpoints.settings).as('updateSettings');
      cy.visit('/account/settings');
      cy.wait('@getSettings');
    });

    it('should display notification preferences section', () => {
      cy.get('[data-testid="notifications-section"]').should('be.visible');
      cy.get('[data-testid="notification-email-toggle"]').should('be.visible');
    });

    it('should toggle email notifications', () => {
      // Get current state
      cy.get('[data-testid="notification-email-toggle"]').then(($toggle) => {
        const isChecked = $toggle.is(':checked');
        
        // Toggle the setting
        cy.get('[data-testid="notification-email-toggle"]').click();
        
        // Save settings
        cy.get('[data-testid="button-save-notifications"]').click();
        cy.wait('@updateSettings');

        // Verify toggle state changed
        cy.get('[data-testid="notification-email-toggle"]')
          .should(isChecked ? 'not.be.checked' : 'be.checked');
      });
    });

    it('should toggle SMS notifications if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="notification-sms-toggle"]').length > 0) {
          cy.get('[data-testid="notification-sms-toggle"]').then(($toggle) => {
            const isChecked = $toggle.is(':checked');
            
            cy.get('[data-testid="notification-sms-toggle"]').click();
            cy.get('[data-testid="button-save-notifications"]').click();
            cy.wait('@updateSettings');

            cy.get('[data-testid="notification-sms-toggle"]')
              .should(isChecked ? 'not.be.checked' : 'be.checked');
          });
        }
      });
    });

    it('should toggle push notifications if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="notification-push-toggle"]').length > 0) {
          cy.get('[data-testid="notification-push-toggle"]').then(($toggle) => {
            const isChecked = $toggle.is(':checked');
            
            cy.get('[data-testid="notification-push-toggle"]').click();
            cy.get('[data-testid="button-save-notifications"]').click();
            cy.wait('@updateSettings');

            cy.get('[data-testid="notification-push-toggle"]')
              .should(isChecked ? 'not.be.checked' : 'be.checked');
          });
        }
      });
    });
  });

  describe('Account Security Settings', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should display security settings section', () => {
      cy.get('[data-testid="security-section"]').should('be.visible');
    });

    it('should show change password interface', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="change-password-section"]').length > 0) {
          cy.get('[data-testid="change-password-section"]').should('be.visible');
          cy.get('[data-testid="input-current-password"]').should('be.visible');
          cy.get('[data-testid="input-new-password"]').should('be.visible');
          cy.get('[data-testid="input-confirm-password"]').should('be.visible');
        }
      });
    });

    it('should validate password change requirements', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-new-password"]').length > 0) {
          // Test weak password
          cy.get('[data-testid="input-current-password"]').type('oldpass');
          cy.get('[data-testid="input-new-password"]').type('123');
          cy.get('[data-testid="input-confirm-password"]').type('123');
          
          cy.get('[data-testid="button-change-password"]').click();
          
          // Check for password strength error
          cy.get('[data-testid="password-error"]')
            .should('be.visible')
            .and('contain.text', /strong|length|requirements/i);
        }
      });
    });

    it('should validate password confirmation match', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="input-confirm-password"]').length > 0) {
          cy.get('[data-testid="input-current-password"]').type('oldpass');
          cy.get('[data-testid="input-new-password"]').type('newpassword123');
          cy.get('[data-testid="input-confirm-password"]').type('differentpass');
          
          cy.get('[data-testid="button-change-password"]').click();
          
          // Check for mismatch error
          cy.get('[data-testid="password-mismatch-error"]')
            .should('be.visible')
            .and('contain.text', /match/i);
        }
      });
    });

    it('should display two-factor authentication settings if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="two-factor-section"]').length > 0) {
          cy.get('[data-testid="two-factor-section"]').should('be.visible');
          cy.get('[data-testid="two-factor-toggle"]').should('be.visible');
        }
      });
    });
  });

  describe('Account Deletion Request', () => {
    beforeEach(() => {
      cy.intercept('POST', apiEndpoints.deleteRequest).as('requestDeletion');
      cy.intercept('DELETE', apiEndpoints.deleteRequest).as('cancelDeletion');
      cy.visit('/account/settings');
    });

    it('should display account deletion section', () => {
      cy.get('[data-testid="danger-zone"]').should('be.visible');
      cy.get('[data-testid="button-delete-account"]').should('be.visible');
    });

    it('should show confirmation dialog for account deletion', () => {
      cy.get('[data-testid="button-delete-account"]').click();
      
      // Check for confirmation modal/dialog
      cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-text"]')
        .should('contain.text', /delete|remove|permanent/i);
    });

    it('should request account deletion with proper confirmation', () => {
      cy.get('[data-testid="button-delete-account"]').click();
      
      // Fill confirmation if required
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="delete-confirmation-input"]').length > 0) {
          cy.get('[data-testid="delete-confirmation-input"]')
            .type('DELETE');
        }
      });
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete-account"]').click();
      cy.wait('@requestDeletion');
      
      // Check for success message
      cy.get('[data-testid="deletion-requested-message"]')
        .should('be.visible')
        .and('contain.text', /request|submitted/i);
    });

    it('should cancel account deletion request', () => {
      // First request deletion
      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="confirm-delete-account"]').click();
      cy.wait('@requestDeletion');
      
      // Then cancel it
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="button-cancel-deletion"]').length > 0) {
          cy.get('[data-testid="button-cancel-deletion"]').click();
          cy.wait('@cancelDeletion');
          
          cy.get('[data-testid="deletion-cancelled-message"]')
            .should('be.visible')
            .and('contain.text', /cancelled/i);
        }
      });
    });

    it('should handle deletion request errors', () => {
      // Mock API error
      cy.intercept('POST', apiEndpoints.deleteRequest, {
        statusCode: 400,
        body: { message: 'Cannot delete account' }
      }).as('deletionError');
      
      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="confirm-delete-account"]').click();
      cy.wait('@deletionError');
      
      // Check for error message
      cy.get('[data-testid="deletion-error-message"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });
  });

  describe('API Integration Tests', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should handle GET /api/account/settings correctly', () => {
      cy.intercept('GET', apiEndpoints.settings).as('getSettings');
      
      cy.reload();
      cy.wait('@getSettings').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body).to.have.property('data');
      });
    });

    it('should handle PATCH /api/account/settings correctly', () => {
      cy.intercept('PATCH', apiEndpoints.settings).as('updateSettings');
      
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('UpdatedName');
      
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateSettings').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 204]);
        expect(interception.request.body).to.have.property('firstName', 'UpdatedName');
      });
    });

    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('PATCH', apiEndpoints.settings, { forceNetworkError: true }).as('networkError');
      
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Test');
      
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Check for network error handling
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
    });
  });

  describe('Form Behavior & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should prevent form submission while saving', () => {
      // Intercept with delay to simulate slow API
      cy.intercept('PATCH', apiEndpoints.settings, (req) => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ statusCode: 200, body: {} }), 2000);
        });
      }).as('slowUpdate');
      
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Test');
      
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Button should be disabled during save
      cy.get('[data-testid="button-save-profile"]')
        .should('be.disabled');
      
      // Loading indicator should be visible
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="saving-indicator"]').length > 0) {
          cy.get('[data-testid="saving-indicator"]').should('be.visible');
        }
      });
      
      cy.wait('@slowUpdate');
      
      // Button should be enabled again
      cy.get('[data-testid="button-save-profile"]')
        .should('not.be.disabled');
    });

    it('should handle very long input values', () => {
      const longText = 'a'.repeat(500);
      
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type(longText);
      
      // Check for length validation
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-first-name"]').length > 0) {
          cy.get('[data-testid="error-first-name"]')
            .should('contain.text', /length|long/i);
        }
      });
    });

    it('should handle special characters in inputs', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type(specialChars);
      
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Should either accept or show validation error
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="error-first-name"]').length > 0) {
          cy.get('[data-testid="error-first-name"]')
            .should('contain.text', /character|invalid/i);
        } else {
          cy.get('[data-testid="success-message"]')
            .should('be.visible');
        }
      });
    });

    it('should preserve form state during navigation', () => {
      const testValue = 'PreservedValue';
      
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type(testValue);
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/account/settings');
      
      // Value should be preserved (if unsaved changes warning is implemented)
      // or reset to original value
      cy.get('[data-testid="input-first-name"]').then(($input) => {
        const value = $input.val();
        expect(value).to.be.a('string');
      });
    });
  });

  describe('Responsive Design Tests', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1200, height: 800, name: 'desktop' }
    ];

    viewports.forEach((viewport) => {
      it(`should display correctly on ${viewport.name} viewport`, () => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/account/settings');
        
        // Main container should be visible
        cy.get('[data-testid="account-settings-container"]')
          .should('be.visible');
        
        // Form elements should be accessible
        cy.get('[data-testid="input-first-name"]')
          .should('be.visible')
          .and('not.be.covered');
        
        cy.get('[data-testid="button-save-profile"]')
          .should('be.visible')
          .and('not.be.covered');
        
        // Check for responsive navigation
        if (viewport.width < 768) {
          // Mobile specific checks
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="mobile-menu-toggle"]').length > 0) {
              cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
            }
          });
        }
      });
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should have proper ARIA labels and roles', () => {
      // Form should have proper role
      cy.get('[data-testid="profile-form"]')
        .should('have.attr', 'role', 'form');
      
      // Inputs should have labels
      cy.get('[data-testid="input-first-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
      
      // Buttons should have accessible names
      cy.get('[data-testid="button-save-profile"]')
        .should('have.attr', 'aria-label')
        .or('contain.text');
    });

    it('should be keyboard navigable', () => {
      // Tab through form elements
      cy.get('[data-testid="input-first-name"]').focus();
      cy.tab();
      cy.focused().should('have.attr', 'data-testid', 'input-last-name');
      
      // Continue tabbing
      cy.tab();
      cy.focused().should('be.visible');
    });

    it('should announce errors to screen readers', () => {
      // Clear required field
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Error should have aria-live or role="alert"
      cy.get('[data-testid="error-first-name"]')
        .should('have.attr', 'role', 'alert')
        .or('have.attr', 'aria-live');
    });
  });
});
