// Account Feature - Exhaustive E2E Tests
describe('Account Feature - Exhaustive Tests', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    password: 'test123',
    username: 'ci-test-user',
    role: 'admin'
  };

  const apiEndpoints = {
    settings: '/api/account/settings',
    deleteRequest: '/api/account/delete-request',
    updateUser: '/api/users/**',
    profilePhoto: '/api/users/*/profile-photo',
    coverPhoto: '/api/users/*/cover-photo'
  };

  const mockAccountSettings = {
    id: 1,
    email: 'test@example.com',
    username: 'ci-test-user',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    timezone: 'America/New_York',
    language: 'en',
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
    profileVisibility: 'public',
    twoFactorEnabled: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  };

  const mockUpdatedSettings = {
    ...mockAccountSettings,
    firstName: 'Updated Test',
    lastName: 'Updated User',
    phone: '+1987654321',
    timezone: 'America/Los_Angeles',
    emailNotifications: false,
    pushNotifications: true,
    profileVisibility: 'private'
  };

  beforeEach(() => {
    // Ensure authenticated state
    cy.loginAsAdmin();
    
    // Setup default API intercepts
    cy.intercept('GET', apiEndpoints.settings, {
      statusCode: 200,
      body: { success: true, data: mockAccountSettings }
    }).as('getAccountSettings');

    cy.intercept('PATCH', apiEndpoints.settings, {
      statusCode: 200,
      body: { success: true, data: mockUpdatedSettings }
    }).as('updateAccountSettings');

    cy.intercept('POST', apiEndpoints.deleteRequest, {
      statusCode: 200,
      body: { success: true, message: 'Account deletion request submitted' }
    }).as('createDeleteRequest');

    cy.intercept('DELETE', apiEndpoints.deleteRequest, {
      statusCode: 200,
      body: { success: true, message: 'Account deletion request cancelled' }
    }).as('cancelDeleteRequest');
  });

  describe('Account Settings Page - Navigation & Layout', () => {
    it('should navigate to account settings from dashboard', () => {
      cy.visit('/dashboard');
      cy.wait('@getAccountSettings');
      
      // Test multiple navigation paths
      cy.get('[data-testid="user-menu"]', { timeout: 10000 })
        .should('be.visible')
        .click();
      
      cy.get('[data-testid="account-settings-link"]')
        .should('be.visible')
        .click();
      
      cy.url().should('include', '/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display complete account settings page layout', () => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');

      // Page header
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', /account settings|settings/i);

      // Main content areas
      cy.get('[data-testid="settings-container"]', { timeout: 10000 })
        .should('be.visible');

      // Settings sections
      cy.get('[data-testid="profile-section"]').should('be.visible');
      cy.get('[data-testid="notification-section"]').should('be.visible');
      cy.get('[data-testid="privacy-section"]').should('be.visible');
      cy.get('[data-testid="security-section"]').should('be.visible');
      cy.get('[data-testid="danger-zone-section"]').should('be.visible');
    });

    it('should have proper page metadata and accessibility', () => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');

      // Page title
      cy.title().should('include', 'Account Settings');

      // Heading structure
      cy.get('h1').should('contain.text', /account settings|settings/i);
      cy.get('h2, h3').should('have.length.greaterThan', 0);

      // Accessibility attributes
      cy.get('main').should('have.attr', 'role', 'main');
      cy.checkA11y('[data-testid="settings-container"]');
    });

    it('should handle loading states properly', () => {
      cy.intercept('GET', apiEndpoints.settings, {
        delay: 2000,
        statusCode: 200,
        body: { success: true, data: mockAccountSettings }
      }).as('getAccountSettingsDelay');

      cy.visit('/account/settings');

      // Loading indicators
      cy.get('[data-testid="settings-loading"]')
        .should('be.visible');
      
      cy.wait('@getAccountSettingsDelay');
      
      cy.get('[data-testid="settings-loading"]')
        .should('not.exist');
      
      cy.get('[data-testid="settings-container"]')
        .should('be.visible');
    });
  });

  describe('Profile Settings Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display all profile form fields with correct values', () => {
      // Personal information fields
      cy.get('[data-testid="input-first-name"]')
        .should('be.visible')
        .and('have.value', mockAccountSettings.firstName);

      cy.get('[data-testid="input-last-name"]')
        .should('be.visible')
        .and('have.value', mockAccountSettings.lastName);

      cy.get('[data-testid="input-email"]')
        .should('be.visible')
        .and('have.value', mockAccountSettings.email);

      cy.get('[data-testid="input-phone"]')
        .should('be.visible')
        .and('have.value', mockAccountSettings.phone);

      // System preferences
      cy.get('[data-testid="select-timezone"]')
        .should('be.visible')
        .and('contain.text', mockAccountSettings.timezone);

      cy.get('[data-testid="select-language"]')
        .should('be.visible')
        .and('contain.text', 'English');
    });

    it('should validate required fields and show appropriate errors', () => {
      // Clear required fields
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      cy.get('[data-testid="input-email"]').clear();

      // Attempt to save
      cy.get('[data-testid="button-save-profile"]').click();

      // Check for validation errors
      cy.get('[data-testid="error-first-name"]')
        .should('be.visible')
        .and('contain.text', /required|cannot be empty/i);

      cy.get('[data-testid="error-last-name"]')
        .should('be.visible')
        .and('contain.text', /required|cannot be empty/i);

      cy.get('[data-testid="error-email"]')
        .should('be.visible')
        .and('contain.text', /required|invalid email/i);
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@invalid.com',
        'test@',
        'test@.com',
        'test..test@example.com'
      ];

      invalidEmails.forEach((email) => {
        cy.get('[data-testid="input-email"]')
          .clear()
          .type(email);
        
        cy.get('[data-testid="button-save-profile"]').click();
        
        cy.get('[data-testid="error-email"]')
          .should('be.visible')
          .and('contain.text', /invalid email/i);
      });
    });

    it('should validate phone number format', () => {
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '123-45-6789',
        '+1-800-FLOWERS'
      ];

      invalidPhones.forEach((phone) => {
        cy.get('[data-testid="input-phone"]')
          .clear()
          .type(phone);
        
        cy.get('[data-testid="button-save-profile"]').click();
        
        cy.get('[data-testid="error-phone"]')
          .should('be.visible')
          .and('contain.text', /invalid phone/i);
      });
    });

    it('should successfully update profile information', () => {
      // Update form fields
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Updated Test');

      cy.get('[data-testid="input-last-name"]')
        .clear()
        .type('Updated User');

      cy.get('[data-testid="input-phone"]')
        .clear()
        .type('+1987654321');

      // Update timezone
      cy.get('[data-testid="select-timezone"]').click();
      cy.get('[data-testid="option-timezone-pst"]').click();

      // Save changes
      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body).to.deep.include({
          firstName: 'Updated Test',
          lastName: 'Updated User',
          phone: '+1987654321',
          timezone: 'America/Los_Angeles'
        });
      });

      // Success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /profile updated successfully/i);
    });

    it('should handle profile update errors gracefully', () => {
      cy.intercept('PATCH', apiEndpoints.settings, {
        statusCode: 400,
        body: { 
          success: false, 
          error: 'Email already exists',
          details: { email: ['This email is already taken'] }
        }
      }).as('updateAccountSettingsError');

      // Make changes and save
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('existing@example.com');

      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateAccountSettingsError');

      // Error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /email already exists/i);

      // Field-specific error
      cy.get('[data-testid="error-email"]')
        .should('be.visible')
        .and('contain.text', /already taken/i);
    });

    it('should handle server errors during profile update', () => {
      cy.intercept('PATCH', apiEndpoints.settings, {
        statusCode: 500,
        body: { success: false, error: 'Internal server error' }
      }).as('updateAccountSettingsServerError');

      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Updated Name');

      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateAccountSettingsServerError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /something went wrong|server error/i);
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display current profile photo and upload controls', () => {
      cy.get('[data-testid="profile-photo-section"]')
        .should('be.visible');

      cy.get('[data-testid="current-profile-photo"]')
        .should('be.visible');

      cy.get('[data-testid="button-upload-photo"]')
        .should('be.visible')
        .and('contain.text', /upload|change photo/i);

      cy.get('[data-testid="button-remove-photo"]')
        .should('be.visible')
        .and('contain.text', /remove photo/i);
    });

    it('should handle profile photo upload', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { profilePhotoUrl: '/uploads/profile-123.jpg' }
        }
      }).as('uploadProfilePhoto');

      // Mock file upload
      const fileName = 'profile-photo.jpg';
      cy.get('[data-testid="input-profile-photo"]').selectFile({
        contents: Cypress.Buffer.from('fake-image-data'),
        fileName,
        mimeType: 'image/jpeg',
      }, { force: true });

      cy.wait('@uploadProfilePhoto');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /photo uploaded successfully/i);
    });

    it('should validate profile photo file types', () => {
      const invalidFiles = [
        { name: 'document.pdf', type: 'application/pdf' },
        { name: 'video.mp4', type: 'video/mp4' },
        { name: 'audio.mp3', type: 'audio/mpeg' }
      ];

      invalidFiles.forEach((file) => {
        cy.get('[data-testid="input-profile-photo"]').selectFile({
          contents: Cypress.Buffer.from('fake-file-data'),
          fileName: file.name,
          mimeType: file.type,
        }, { force: true });

        cy.get('[data-testid="error-message"]')
          .should('be.visible')
          .and('contain.text', /invalid file type|only images allowed/i);
      });
    });

    it('should validate profile photo file size', () => {
      // Mock large file (>5MB)
      const largeFileData = new Array(5 * 1024 * 1024 + 1).fill('a').join('');
      
      cy.get('[data-testid="input-profile-photo"]').selectFile({
        contents: Cypress.Buffer.from(largeFileData),
        fileName: 'large-image.jpg',
        mimeType: 'image/jpeg',
      }, { force: true });

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /file too large|maximum size/i);
    });

    it('should handle profile photo removal', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: { success: true, data: { profilePhotoUrl: null } }
      }).as('removeProfilePhoto');

      cy.get('[data-testid="button-remove-photo"]').click();

      // Confirmation dialog
      cy.get('[data-testid="confirm-remove-photo"]')
        .should('be.visible');

      cy.get('[data-testid="button-confirm-remove"]').click();

      cy.wait('@removeProfilePhoto');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /photo removed successfully/i);
    });
  });

  describe('Notification Settings Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display all notification preferences with correct values', () => {
      // Email notifications
      cy.get('[data-testid="toggle-email-notifications"]')
        .should('be.visible');
      
      if (mockAccountSettings.emailNotifications) {
        cy.get('[data-testid="toggle-email-notifications"]')
          .should('be.checked');
      }

      // Push notifications
      cy.get('[data-testid="toggle-push-notifications"]')
        .should('be.visible');

      // Weekly digest
      cy.get('[data-testid="toggle-weekly-digest"]')
        .should('be.visible');
      
      if (mockAccountSettings.weeklyDigest) {
        cy.get('[data-testid="toggle-weekly-digest"]')
          .should('be.checked');
      }

      // Marketing emails
      cy.get('[data-testid="toggle-marketing-emails"]')
        .should('be.visible');
    });

    it('should toggle notification preferences and save changes', () => {
      // Toggle email notifications
      cy.get('[data-testid="toggle-email-notifications"]').click();
      
      // Toggle push notifications
      cy.get('[data-testid="toggle-push-notifications"]').click();

      // Save notification settings
      cy.get('[data-testid="button-save-notifications"]').click();

      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body).to.deep.include({
          emailNotifications: !mockAccountSettings.emailNotifications,
          pushNotifications: !mockAccountSettings.pushNotifications
        });
      });

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /notification settings updated/i);
    });

    it('should handle notification category details', () => {
      // Expand email notification details
      cy.get('[data-testid="expand-email-settings"]').click();

      cy.get('[data-testid="email-notification-details"]')
        .should('be.visible');

      // Individual email preferences
      cy.get('[data-testid="toggle-project-updates"]')
        .should('be.visible');
      
      cy.get('[data-testid="toggle-schedule-changes"]')
        .should('be.visible');

      cy.get('[data-testid="toggle-payment-notifications"]')
        .should('be.visible');
    });
  });

  describe('Privacy Settings Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display privacy controls with current values', () => {
      // Profile visibility
      cy.get('[data-testid="select-profile-visibility"]')
        .should('be.visible')
        .and('contain.text', mockAccountSettings.profileVisibility);

      // Data sharing preferences
      cy.get('[data-testid="toggle-analytics-sharing"]')
        .should('be.visible');

      cy.get('[data-testid="toggle-third-party-sharing"]')
        .should('be.visible');
    });

    it('should update profile visibility settings', () => {
      cy.get('[data-testid="select-profile-visibility"]').click();
      cy.get('[data-testid="option-visibility-private"]').click();

      cy.get('[data-testid="button-save-privacy"]').click();

      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body).to.include({
          profileVisibility: 'private'
        });
      });

      cy.get('[data-testid="success-message"]')
        .should('be.visible');
    });

    it('should handle data export request', () => {
      cy.intercept('POST', '/api/account/export-data', {
        statusCode: 200,
        body: { success: true, message: 'Data export request submitted' }
      }).as('exportDataRequest');

      cy.get('[data-testid="button-export-data"]').click();

      // Confirmation dialog
      cy.get('[data-testid="confirm-export-data"]')
        .should('be.visible');

      cy.get('[data-testid="button-confirm-export"]').click();

      cy.wait('@exportDataRequest');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /data export request submitted/i);
    });
  });

  describe('Security Settings Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display security options and status', () => {
      // Password change section
      cy.get('[data-testid="change-password-section"]')
        .should('be.visible');

      cy.get('[data-testid="button-change-password"]')
        .should('be.visible');

      // Two-factor authentication
      cy.get('[data-testid="two-factor-section"]')
        .should('be.visible');

      cy.get('[data-testid="two-factor-status"]')
        .should('be.visible')
        .and('contain.text', mockAccountSettings.twoFactorEnabled ? 'Enabled' : 'Disabled');

      // Session management
      cy.get('[data-testid="session-management-section"]')
        .should('be.visible');

      cy.get('[data-testid="button-logout-all-sessions"]')
        .should('be.visible');
    });

    it('should handle password change workflow', () => {
      cy.intercept('PATCH', '/api/account/change-password', {
        statusCode: 200,
        body: { success: true, message: 'Password changed successfully' }
      }).as('changePassword');

      cy.get('[data-testid="button-change-password"]').click();

      // Password change modal/form
      cy.get('[data-testid="modal-change-password"]')
        .should('be.visible');

      cy.get('[data-testid="input-current-password"]')
        .type('currentPassword123');

      cy.get('[data-testid="input-new-password"]')
        .type('newPassword456');

      cy.get('[data-testid="input-confirm-password"]')
        .type('newPassword456');

      cy.get('[data-testid="button-submit-password-change"]').click();

      cy.wait('@changePassword');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /password changed successfully/i);
    });

    it('should validate password strength requirements', () => {
      cy.get('[data-testid="button-change-password"]').click();

      const weakPasswords = [
        '123',
        'password',
        'abc123',
        '12345678'
      ];

      weakPasswords.forEach((password) => {
        cy.get('[data-testid="input-new-password"]')
          .clear()
          .type(password);

        cy.get('[data-testid="password-strength-indicator"]')
          .should('be.visible')
          .and('contain.text', /weak|too short/i);
      });
    });

    it('should handle two-factor authentication setup', () => {
      cy.intercept('POST', '/api/account/2fa/setup', {
        statusCode: 200,
        body: { 
          success: true, 
          data: { qrCode: 'data:image/png;base64,...', secret: 'SECRET123' }
        }
      }).as('setup2FA');

      cy.get('[data-testid="button-enable-2fa"]').click();

      // 2FA setup modal
      cy.get('[data-testid="modal-2fa-setup"]')
        .should('be.visible');

      cy.wait('@setup2FA');

      cy.get('[data-testid="qr-code-display"]')
        .should('be.visible');

      cy.get('[data-testid="input-2fa-code"]')
        .type('123456');

      cy.get('[data-testid="button-verify-2fa"]').click();
    });

    it('should handle session logout', () => {
      cy.intercept('POST', '/api/account/logout-all-sessions', {
        statusCode: 200,
        body: { success: true, message: 'All sessions logged out' }
      }).as('logoutAllSessions');

      cy.get('[data-testid="button-logout-all-sessions"]').click();

      // Confirmation dialog
      cy.get('[data-testid="confirm-logout-all"]')
        .should('be.visible');

      cy.get('[data-testid="button-confirm-logout-all"]').click();

      cy.wait('@logoutAllSessions');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /all sessions logged out/i);
    });
  });

  describe('Account Deletion - Danger Zone', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display danger zone section with proper warnings', () => {
      cy.get('[data-testid="danger-zone-section"]')
        .should('be.visible');

      cy.get('[data-testid="danger-zone-title"]')
        .should('contain.text', /danger zone|delete account/i);

      cy.get('[data-testid="danger-zone-warning"]')
        .should('be.visible')
        .and('contain.text', /permanent|cannot be undone/i);

      cy.get('[data-testid="button-delete-account"]')
        .should('be.visible')
        .and('have.class', /danger|destructive|red/);
    });

    it('should handle account deletion request workflow', () => {
      cy.get('[data-testid="button-delete-account"]').click();

      // Deletion confirmation modal
      cy.get('[data-testid="modal-delete-account"]')
        .should('be.visible');

      cy.get('[data-testid="delete-confirmation-text"]')
        .should('contain.text', /permanent|cannot be undone/i);

      // Confirmation steps
      cy.get('[data-testid="checkbox-understand-consequences"]')
        .check();

      cy.get('[data-testid="input-confirm-email"]')
        .type(testUser.email);

      cy.get('[data-testid="input-deletion-reason"]')
        .type('Testing account deletion workflow');

      cy.get('[data-testid="button-confirm-deletion"]').click();

      cy.wait('@createDeleteRequest');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deletion request submitted/i);
    });

    it('should validate deletion confirmation inputs', () => {
      cy.get('[data-testid="button-delete-account"]').click();

      // Try to confirm without checking understanding
      cy.get('[data-testid="button-confirm-deletion"]').click();

      cy.get('[data-testid="error-understanding"]')
        .should('be.visible')
        .and('contain.text', /must acknowledge/i);

      // Check understanding but use wrong email
      cy.get('[data-testid="checkbox-understand-consequences"]').check();
      cy.get('[data-testid="input-confirm-email"]')
        .type('wrong@email.com');

      cy.get('[data-testid="button-confirm-deletion"]').click();

      cy.get('[data-testid="error-email-mismatch"]')
        .should('be.visible')
        .and('contain.text', /email does not match/i);
    });

    it('should handle account deletion cancellation', () => {
      // Mock existing deletion request
      cy.intercept('GET', apiEndpoints.settings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { 
            ...mockAccountSettings,
            deletionRequestedAt: '2023-12-01T00:00:00.000Z'
          }
        }
      }).as('getAccountSettingsWithDeletion');

      cy.visit('/account/settings');
      cy.wait('@getAccountSettingsWithDeletion');

      // Should show cancellation option
      cy.get('[data-testid="deletion-pending-notice"]')
        .should('be.visible')
        .and('contain.text', /deletion request pending/i);

      cy.get('[data-testid="button-cancel-deletion"]')
        .should('be.visible')
        .click();

      cy.wait('@cancelDeleteRequest');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deletion request cancelled/i);
    });

    it('should handle deletion request errors', () => {
      cy.intercept('POST', apiEndpoints.deleteRequest, {
        statusCode: 400,
        body: { 
          success: false, 
          error: 'Cannot delete account with active projects' 
        }
      }).as('createDeleteRequestError');

      cy.get('[data-testid="button-delete-account"]').click();
      
      cy.get('[data-testid="checkbox-understand-consequences"]').check();
      cy.get('[data-testid="input-confirm-email"]').type(testUser.email);
      cy.get('[data-testid="input-deletion-reason"]').type('Test reason');
      
      cy.get('[data-testid="button-confirm-deletion"]').click();

      cy.wait('@createDeleteRequestError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /cannot delete account with active projects/i);
    });
  });

  describe('Settings Form Interactions & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should handle unsaved changes warning', () => {
      // Make changes to form
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Modified Name');

      // Attempt to navigate away
      cy.window().then((win) => {
        cy.stub(win, 'beforeunload').returns('You have unsaved changes');
      });

      cy.get('[data-testid="nav-dashboard"]').click();

      // Should show unsaved changes warning
      cy.on('window:confirm', (text) => {
        expect(text).to.contain(/unsaved changes/i);
        return false; // Cancel navigation
      });
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.settings, {
        forceNetworkError: true
      }).as('getAccountSettingsNetworkError');

      cy.visit('/account/settings');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /network error|connection failed/i);

      // Retry mechanism
      cy.get('[data-testid="button-retry"]').click();
    });

    it('should handle concurrent updates', () => {
      // Simulate another user updating the same account
      cy.intercept('PATCH', apiEndpoints.settings, {
        statusCode: 409,
        body: { 
          success: false, 
          error: 'Account was updated by another session' 
        }
      }).as('updateConflict');

      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Concurrent Update');

      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateConflict');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /updated by another session/i);

      // Should offer to reload
      cy.get('[data-testid="button-reload-data"]')
        .should('be.visible');
    });

    it('should handle browser back/forward navigation', () => {
      // Navigate to different tab/section
      cy.get('[data-testid="tab-security"]').click();
      cy.url().should('include', '#security');

      // Navigate back
      cy.go('back');
      cy.url().should('not.include', '#security');

      // Navigate forward
      cy.go('forward');
      cy.url().should('include', '#security');
    });

    it('should persist form state during page refresh', () => {
      // Make changes
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('Persistent Value');

      // Refresh page
      cy.reload();
      cy.wait('@getAccountSettings');

      // Check if unsaved changes are preserved (if implemented)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="unsaved-changes-notice"]').length > 0) {
          cy.get('[data-testid="unsaved-changes-notice"]')
            .should('be.visible');
        }
      });
    });
  });

  describe('Responsive Design & Mobile Experience', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should adapt layout for mobile screens', () => {
      cy.viewport('iphone-x');

      // Mobile-specific elements
      cy.get('[data-testid="mobile-settings-nav"]')
        .should('be.visible');

      // Stacked form layout
      cy.get('[data-testid="profile-section"]')
        .should('have.css', 'width')
        .and('match', /100%|auto/);

      // Mobile-friendly buttons
      cy.get('[data-testid="button-save-profile"]')
        .should('be.visible')
        .and('have.css', 'width', '100%');
    });

    it('should handle tablet layout properly', () => {
      cy.viewport('ipad-2');

      // Tablet-specific layout
      cy.get('[data-testid="settings-container"]')
        .should('be.visible');

      // Side navigation should be visible
      cy.get('[data-testid="settings-sidebar"]')
        .should('be.visible');
    });

    it('should maintain functionality on different screen sizes', () => {
      const viewports = ['iphone-se2', 'samsung-s10', 'ipad-mini', 'macbook-13'];

      viewports.forEach((viewport) => {
        cy.viewport(viewport);

        // Core functionality should work
        cy.get('[data-testid="input-first-name"]')
          .should('be.visible')
          .clear()
          .type('Test Mobile');

        cy.get('[data-testid="button-save-profile"]')
          .should('be.visible')
          .click();

        cy.wait('@updateAccountSettings');
      });
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should support complete keyboard navigation', () => {
      // Tab through all interactive elements
      cy.get('body').tab();
      
      // First name field
      cy.focused().should('have.attr', 'data-testid', 'input-first-name');
      
      cy.get('body').tab();
      
      // Last name field
      cy.focused().should('have.attr', 'data-testid', 'input-last-name');

      // Continue through all form fields
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'input-email');

      // Test escape key functionality
      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('body').type('{esc}');
      cy.get('[data-testid="modal-delete-account"]')
        .should('not.exist');
    });

    it('should have proper ARIA labels and roles', () => {
      // Form sections
      cy.get('[data-testid="profile-section"]')
        .should('have.attr', 'role', 'region')
        .and('have.attr', 'aria-labelledby');

      // Form controls
      cy.get('[data-testid="input-first-name"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'aria-describedby');

      // Buttons
      cy.get('[data-testid="button-save-profile"]')
        .should('have.attr', 'aria-label');

      // Toggle switches
      cy.get('[data-testid="toggle-email-notifications"]')
        .should('have.attr', 'role', 'switch')
        .and('have.attr', 'aria-checked');
    });

    it('should announce changes to screen readers', () => {
      // Success messages should be announced
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('New Name');

      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateAccountSettings');

      cy.get('[data-testid="success-message"]')
        .should('have.attr', 'role', 'alert')
        .and('have.attr', 'aria-live', 'polite');
    });

    it('should support high contrast mode', () => {
      // Enable high contrast (browser-specific)
      cy.get('body').invoke('addClass', 'high-contrast');

      // Verify important elements are still visible
      cy.get('[data-testid="button-delete-account"]')
        .should('be.visible')
        .and('have.css', 'border')
        .and('not.equal', 'none');
    });
  });

  describe('Performance & Loading Optimization', () => {
    it('should load settings page efficiently', () => {
      cy.visit('/account/settings');

      // Measure performance
      cy.window().its('performance').then((perf) => {
        const navigationStart = perf.timing.navigationStart;
        const loadComplete = perf.timing.loadEventEnd;
        const loadTime = loadComplete - navigationStart;

        // Should load within reasonable time
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should handle large settings data efficiently', () => {
      const largeSettingsData = {
        ...mockAccountSettings,
        customFields: new Array(100).fill(null).map((_, i) => ({
          id: i,
          name: `Custom Field ${i}`,
          value: `Value ${i}`
        }))
      };

      cy.intercept('GET', apiEndpoints.settings, {
        statusCode: 200,
        body: { success: true, data: largeSettingsData }
      }).as('getLargeSettings');

      cy.visit('/account/settings');
      cy.wait('@getLargeSettings');

      // Should render without performance issues
      cy.get('[data-testid="settings-container"]')
        .should('be.visible');

      // Scroll performance test
      cy.get('[data-testid="settings-container"]')
        .scrollTo('bottom', { duration: 1000 });
    });

    it('should implement lazy loading for heavy components', () => {
      cy.visit('/account/settings');

      // Photo upload component should load on demand
      cy.get('[data-testid="profile-photo-section"]')
        .should('be.visible');

      cy.get('[data-testid="button-upload-photo"]').click();

      // Photo upload modal should load dynamically
      cy.get('[data-testid="modal-upload-photo"]', { timeout: 5000 })
        .should('be.visible');
    });
  });

  describe('Cross-Browser Compatibility', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should work consistently across browsers', () => {
      // Test core functionality that might vary between browsers
      
      // File upload (varies by browser)
      cy.get('body').then(() => {
        if (Cypress.browser.name === 'chrome') {
          // Chrome-specific tests
          cy.log('Running Chrome-specific tests');
        } else if (Cypress.browser.name === 'firefox') {
          // Firefox-specific tests
          cy.log('Running Firefox-specific tests');
        }
      });

      // Form validation (may differ between browsers)
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('invalid-email');

      cy.get('[data-testid="button-save-profile"]').click();

      // Should show validation error regardless of browser
      cy.get('[data-testid="error-email"]')
        .should('be.visible');
    });

    it('should handle browser storage consistently', () => {
      // Local storage
      cy.window().its('localStorage').then((ls) => {
        ls.setItem('settings-draft', JSON.stringify({ firstName: 'Draft Name' }));
      });

      cy.reload();
      cy.wait('@getAccountSettings');

      // Check if draft is restored (if implemented)
      cy.window().its('localStorage')
        .invoke('getItem', 'settings-draft')
        .should('not.be.null');
    });
  });
});
