describe('Account Management - Exhaustive Tests', () => {
  const testUser = {
    id: 'ci-test-user',
    email: 'test@example.com',
    name: 'CI Test User',
    role: 'admin'
  };

  const apiEndpoints = {
    user: '/api/auth/user',
    updateUser: '/api/users/*',
    accountSettings: '/api/account/settings',
    updateAccountSettings: '/api/account/settings',
    deleteRequest: '/api/account/delete-request',
    uploadProfilePhoto: '/api/users/*/profile-photo',
    uploadCoverPhoto: '/api/users/*/cover-photo',
    uploadObject: '/api/objects/upload'
  };

  const mockAccountSettings = {
    id: 'settings-1',
    userId: 'ci-test-user',
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    twoFactorEnabled: false,
    timezone: 'America/New_York',
    language: 'en',
    theme: 'light',
    privacy: 'public',
    autoLogout: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockDeleteRequest = {
    id: 'delete-req-1',
    userId: 'ci-test-user',
    reason: 'No longer need account',
    status: 'pending',
    requestedAt: new Date().toISOString(),
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  beforeEach(() => {
    // Setup authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth-token', 'test-token');
      win.localStorage.setItem('user', JSON.stringify(testUser));
    });

    // Mock auth user endpoint
    cy.intercept('GET', apiEndpoints.user, {
      statusCode: 200,
      body: { success: true, data: testUser }
    }).as('getUser');

    // Mock account settings endpoint
    cy.intercept('GET', apiEndpoints.accountSettings, {
      statusCode: 200,
      body: { success: true, data: mockAccountSettings }
    }).as('getAccountSettings');
  });

  describe('Account Settings Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should display complete account settings page layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]', { timeout: 10000 })
        .should('be.visible');
      cy.get('h1').should('contain.text', /account|settings/i);

      // Navigation/tabs
      cy.get('[data-testid="settings-nav"]', { timeout: 5000 })
        .should('be.visible');
      
      // Settings sections
      cy.get('[data-testid="profile-section"]').should('be.visible');
      cy.get('[data-testid="notifications-section"]').should('be.visible');
      cy.get('[data-testid="preferences-section"]').should('be.visible');
      cy.get('[data-testid="security-section"]').should('be.visible');
      cy.get('[data-testid="privacy-section"]').should('be.visible');
    });

    it('should have functional navigation tabs', () => {
      const tabs = [
        { testId: 'tab-profile', content: 'profile' },
        { testId: 'tab-notifications', content: 'notifications' },
        { testId: 'tab-preferences', content: 'preferences' },
        { testId: 'tab-security', content: 'security' },
        { testId: 'tab-privacy', content: 'privacy' }
      ];

      tabs.forEach(tab => {
        cy.get(`[data-testid="${tab.testId}"]`)
          .should('be.visible')
          .and('contain.text', new RegExp(tab.content, 'i'));
      });

      // Test active tab functionality
      cy.get('[data-testid="tab-notifications"]').click();
      cy.get('[data-testid="notifications-section"]').should('be.visible');
      
      cy.get('[data-testid="tab-security"]').click();
      cy.get('[data-testid="security-section"]').should('be.visible');
    });

    it('should display breadcrumb navigation', () => {
      cy.get('[data-testid="breadcrumb"]')
        .should('be.visible')
        .and('contain.text', 'Account')
        .and('contain.text', 'Settings');
    });
  });

  describe('Profile Settings - Complete CRUD Operations', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should display and edit basic profile information', () => {
      // Mock update endpoint
      cy.intercept('PUT', apiEndpoints.updateUser, {
        statusCode: 200,
        body: { success: true, data: { ...testUser, name: 'Updated Name' } }
      }).as('updateUser');

      // Profile form should be visible
      cy.get('[data-testid="profile-form"]').should('be.visible');
      
      // Check existing values
      cy.get('[data-testid="input-name"]')
        .should('have.value', testUser.name);
      cy.get('[data-testid="input-email"]')
        .should('have.value', testUser.email);

      // Edit name
      cy.get('[data-testid="input-name"]')
        .clear()
        .type('Updated Name');

      // Save changes
      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@updateUser');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|saved/i);
    });

    it('should handle profile photo upload', () => {
      // Mock upload endpoint
      cy.intercept('POST', apiEndpoints.uploadObject, {
        statusCode: 200,
        body: { success: true, data: { url: 'https://example.com/photo.jpg' } }
      }).as('uploadObject');

      cy.intercept('PUT', apiEndpoints.uploadProfilePhoto, {
        statusCode: 200,
        body: { success: true, data: { profilePhotoUrl: 'https://example.com/photo.jpg' } }
      }).as('updateProfilePhoto');

      // Profile photo section
      cy.get('[data-testid="profile-photo-section"]').should('be.visible');
      cy.get('[data-testid="current-profile-photo"]').should('be.visible');

      // Upload new photo
      const fileName = 'profile.jpg';
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('[data-testid="upload-profile-photo"]')
          .selectFile({
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: fileName,
            mimeType: 'image/jpeg'
          }, { force: true });
      });

      cy.wait('@uploadObject');
      cy.wait('@updateProfilePhoto');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /photo.*updated/i);
    });

    it('should handle cover photo upload', () => {
      // Mock upload endpoints
      cy.intercept('POST', apiEndpoints.uploadObject, {
        statusCode: 200,
        body: { success: true, data: { url: 'https://example.com/cover.jpg' } }
      }).as('uploadObject');

      cy.intercept('PUT', apiEndpoints.uploadCoverPhoto, {
        statusCode: 200,
        body: { success: true, data: { coverPhotoUrl: 'https://example.com/cover.jpg' } }
      }).as('updateCoverPhoto');

      // Cover photo section
      cy.get('[data-testid="cover-photo-section"]').should('be.visible');

      // Upload cover photo
      const fileName = 'cover.jpg';
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('[data-testid="upload-cover-photo"]')
          .selectFile({
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: fileName,
            mimeType: 'image/jpeg'
          }, { force: true });
      });

      cy.wait('@uploadObject');
      cy.wait('@updateCoverPhoto');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /cover.*updated/i);
    });

    it('should validate profile form inputs', () => {
      // Test required fields
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      // Test email format
      cy.get('[data-testid="input-email"]')
        .clear()
        .type('invalid-email');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-email"]')
        .should('be.visible')
        .and('contain.text', /valid.*email/i);

      // Test character limits
      const longName = 'A'.repeat(101);
      cy.get('[data-testid="input-name"]')
        .clear()
        .type(longName);
      
      cy.get('[data-testid="error-name"]')
        .should('be.visible')
        .and('contain.text', /too long|character limit/i);
    });
  });

  describe('Notification Settings - Complete Management', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="tab-notifications"]').click();
    });

    it('should display all notification preferences', () => {
      // Email notifications
      cy.get('[data-testid="email-notifications-section"]').should('be.visible');
      cy.get('[data-testid="toggle-email-notifications"]')
        .should('be.visible')
        .and(mockAccountSettings.emailNotifications ? 'be.checked' : 'not.be.checked');

      // Push notifications
      cy.get('[data-testid="push-notifications-section"]').should('be.visible');
      cy.get('[data-testid="toggle-push-notifications"]')
        .should('be.visible')
        .and(mockAccountSettings.pushNotifications ? 'be.checked' : 'not.be.checked');

      // Marketing emails
      cy.get('[data-testid="marketing-emails-section"]').should('be.visible');
      cy.get('[data-testid="toggle-marketing-emails"]')
        .should('be.visible')
        .and(mockAccountSettings.marketingEmails ? 'be.checked' : 'not.be.checked');
    });

    it('should update notification preferences', () => {
      // Mock update endpoint
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { ...mockAccountSettings, emailNotifications: false } 
        }
      }).as('updateNotifications');

      // Toggle email notifications
      cy.get('[data-testid="toggle-email-notifications"]').click();
      
      // Save changes
      cy.get('[data-testid="button-save-notifications"]').click();
      cy.wait('@updateNotifications');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /notification.*updated/i);
    });

    it('should handle notification preferences batch update', () => {
      // Mock batch update
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { 
            ...mockAccountSettings, 
            emailNotifications: false,
            pushNotifications: true,
            marketingEmails: false
          } 
        }
      }).as('batchUpdateNotifications');

      // Toggle multiple settings
      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="toggle-push-notifications"]').click();
      cy.get('[data-testid="toggle-marketing-emails"]').click();

      // Save all changes
      cy.get('[data-testid="button-save-notifications"]').click();
      cy.wait('@batchUpdateNotifications');

      // Verify request payload
      cy.get('@batchUpdateNotifications').should(({ request }) => {
        expect(request.body).to.include({
          emailNotifications: false,
          pushNotifications: true,
          marketingEmails: false
        });
      });
    });
  });

  describe('Preferences Settings - Timezone, Language, Theme', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="tab-preferences"]').click();
    });

    it('should display preference options', () => {
      // Timezone selection
      cy.get('[data-testid="timezone-section"]').should('be.visible');
      cy.get('[data-testid="select-timezone"]')
        .should('be.visible')
        .and('contain.value', mockAccountSettings.timezone);

      // Language selection
      cy.get('[data-testid="language-section"]').should('be.visible');
      cy.get('[data-testid="select-language"]')
        .should('be.visible')
        .and('contain.value', mockAccountSettings.language);

      // Theme selection
      cy.get('[data-testid="theme-section"]').should('be.visible');
      cy.get('[data-testid="select-theme"]')
        .should('be.visible')
        .and('contain.value', mockAccountSettings.theme);

      // Auto logout setting
      cy.get('[data-testid="auto-logout-section"]').should('be.visible');
      cy.get('[data-testid="input-auto-logout"]')
        .should('be.visible')
        .and('have.value', mockAccountSettings.autoLogout.toString());
    });

    it('should update timezone preference', () => {
      // Mock update
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { ...mockAccountSettings, timezone: 'America/Los_Angeles' } 
        }
      }).as('updateTimezone');

      // Change timezone
      cy.get('[data-testid="select-timezone"]').select('America/Los_Angeles');
      cy.get('[data-testid="button-save-preferences"]').click();
      cy.wait('@updateTimezone');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /preferences.*updated/i);
    });

    it('should update theme preference with immediate UI change', () => {
      // Mock update
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { ...mockAccountSettings, theme: 'dark' } 
        }
      }).as('updateTheme');

      // Change theme
      cy.get('[data-testid="select-theme"]').select('dark');
      cy.get('[data-testid="button-save-preferences"]').click();
      cy.wait('@updateTheme');

      // Verify theme applied
      cy.get('body').should('have.class', 'dark-theme');
    });

    it('should validate auto logout setting', () => {
      // Test minimum value
      cy.get('[data-testid="input-auto-logout"]')
        .clear()
        .type('0');
      cy.get('[data-testid="button-save-preferences"]').click();
      
      cy.get('[data-testid="error-auto-logout"]')
        .should('be.visible')
        .and('contain.text', /minimum.*5/i);

      // Test maximum value
      cy.get('[data-testid="input-auto-logout"]')
        .clear()
        .type('1441');
      cy.get('[data-testid="button-save-preferences"]').click();
      
      cy.get('[data-testid="error-auto-logout"]')
        .should('be.visible')
        .and('contain.text', /maximum.*1440/i);
    });
  });

  describe('Security Settings - Password & Two-Factor', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="tab-security"]').click();
    });

    it('should display security options', () => {
      // Password change section
      cy.get('[data-testid="password-section"]').should('be.visible');
      cy.get('[data-testid="button-change-password"]').should('be.visible');

      // Two-factor authentication
      cy.get('[data-testid="two-factor-section"]').should('be.visible');
      cy.get('[data-testid="toggle-two-factor"]')
        .should('be.visible')
        .and(mockAccountSettings.twoFactorEnabled ? 'be.checked' : 'not.be.checked');

      // Active sessions
      cy.get('[data-testid="sessions-section"]').should('be.visible');
      cy.get('[data-testid="button-view-sessions"]').should('be.visible');
    });

    it('should open password change modal', () => {
      cy.get('[data-testid="button-change-password"]').click();
      
      // Modal should open
      cy.get('[data-testid="password-change-modal"]').should('be.visible');
      cy.get('[data-testid="input-current-password"]').should('be.visible');
      cy.get('[data-testid="input-new-password"]').should('be.visible');
      cy.get('[data-testid="input-confirm-password"]').should('be.visible');

      // Close modal
      cy.get('[data-testid="button-cancel-password"]').click();
      cy.get('[data-testid="password-change-modal"]').should('not.exist');
    });

    it('should validate password change form', () => {
      // Mock password update
      cy.intercept('PUT', apiEndpoints.updateUser, {
        statusCode: 200,
        body: { success: true, data: testUser }
      }).as('updatePassword');

      cy.get('[data-testid="button-change-password"]').click();
      
      // Test password requirements
      cy.get('[data-testid="input-new-password"]').type('weak');
      cy.get('[data-testid="button-save-password"]').click();
      
      cy.get('[data-testid="error-new-password"]')
        .should('be.visible')
        .and('contain.text', /at least.*8.*characters/i);

      // Test password confirmation
      cy.get('[data-testid="input-new-password"]')
        .clear()
        .type('StrongPassword123!');
      cy.get('[data-testid="input-confirm-password"]').type('DifferentPassword');
      cy.get('[data-testid="button-save-password"]').click();
      
      cy.get('[data-testid="error-confirm-password"]')
        .should('be.visible')
        .and('contain.text', /passwords.*not.*match/i);
    });

    it('should enable two-factor authentication', () => {
      // Mock two-factor setup
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { ...mockAccountSettings, twoFactorEnabled: true } 
        }
      }).as('enableTwoFactor');

      cy.get('[data-testid="toggle-two-factor"]').click();
      
      // Two-factor setup modal should open
      cy.get('[data-testid="two-factor-setup-modal"]').should('be.visible');
      cy.get('[data-testid="qr-code"]').should('be.visible');
      cy.get('[data-testid="input-verification-code"]').should('be.visible');

      // Enter verification code
      cy.get('[data-testid="input-verification-code"]').type('123456');
      cy.get('[data-testid="button-verify-two-factor"]').click();
      cy.wait('@enableTwoFactor');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /two.*factor.*enabled/i);
    });
  });

  describe('Privacy Settings - Profile Visibility', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="tab-privacy"]').click();
    });

    it('should display privacy options', () => {
      // Profile visibility
      cy.get('[data-testid="profile-visibility-section"]').should('be.visible');
      cy.get('[data-testid="select-privacy"]')
        .should('be.visible')
        .and('contain.value', mockAccountSettings.privacy);

      // Data preferences
      cy.get('[data-testid="data-preferences-section"]').should('be.visible');
      cy.get('[data-testid="button-download-data"]').should('be.visible');
      cy.get('[data-testid="button-delete-account"]').should('be.visible');
    });

    it('should update privacy settings', () => {
      // Mock update
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { ...mockAccountSettings, privacy: 'private' } 
        }
      }).as('updatePrivacy');

      // Change privacy setting
      cy.get('[data-testid="select-privacy"]').select('private');
      cy.get('[data-testid="button-save-privacy"]').click();
      cy.wait('@updatePrivacy');

      // Verify success
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /privacy.*updated/i);
    });

    it('should handle data download request', () => {
      // Mock data export
      cy.intercept('POST', '/api/account/export-data', {
        statusCode: 200,
        body: { success: true, message: 'Data export initiated' }
      }).as('exportData');

      cy.get('[data-testid="button-download-data"]').click();
      
      // Confirmation modal
      cy.get('[data-testid="data-download-modal"]').should('be.visible');
      cy.get('[data-testid="button-confirm-download"]').click();
      cy.wait('@exportData');

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /data.*export.*initiated/i);
    });
  });

  describe('Account Deletion - Complete Flow', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="tab-privacy"]').click();
    });

    it('should initiate account deletion request', () => {
      // Mock delete request endpoint
      cy.intercept('POST', apiEndpoints.deleteRequest, {
        statusCode: 200,
        body: { success: true, data: mockDeleteRequest }
      }).as('createDeleteRequest');

      cy.get('[data-testid="button-delete-account"]').click();
      
      // Deletion modal should open
      cy.get('[data-testid="account-deletion-modal"]').should('be.visible');
      cy.get('[data-testid="deletion-warning"]')
        .should('be.visible')
        .and('contain.text', /permanent.*cannot.*undone/i);

      // Reason selection
      cy.get('[data-testid="select-deletion-reason"]')
        .should('be.visible')
        .select('No longer need account');

      // Confirmation checkbox
      cy.get('[data-testid="checkbox-confirm-deletion"]')
        .should('be.visible')
        .check();

      // Password confirmation
      cy.get('[data-testid="input-confirm-password"]')
        .should('be.visible')
        .type('password123');

      // Submit deletion request
      cy.get('[data-testid="button-confirm-delete-account"]').click();
      cy.wait('@createDeleteRequest');

      // Verify success and redirect
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /deletion.*request.*submitted/i);
    });

    it('should display existing deletion request', () => {
      // Mock existing delete request
      cy.intercept('GET', apiEndpoints.deleteRequest, {
        statusCode: 200,
        body: { success: true, data: mockDeleteRequest }
      }).as('getDeleteRequest');

      cy.visit('/account/settings');
      cy.wait('@getDeleteRequest');

      // Should show deletion status
      cy.get('[data-testid="deletion-status"]')
        .should('be.visible')
        .and('contain.text', /deletion.*pending/i);

      // Should show scheduled date
      cy.get('[data-testid="deletion-date"]')
        .should('be.visible')
        .and('contain.text', /scheduled/i);

      // Cancel deletion button
      cy.get('[data-testid="button-cancel-deletion"]').should('be.visible');
    });

    it('should cancel account deletion request', () => {
      // Mock existing delete request
      cy.intercept('GET', apiEndpoints.deleteRequest, {
        statusCode: 200,
        body: { success: true, data: mockDeleteRequest }
      }).as('getDeleteRequest');

      // Mock cancellation
      cy.intercept('DELETE', apiEndpoints.deleteRequest, {
        statusCode: 200,
        body: { success: true, message: 'Deletion request cancelled' }
      }).as('cancelDeleteRequest');

      cy.visit('/account/settings');
      cy.wait('@getDeleteRequest');

      cy.get('[data-testid="button-cancel-deletion"]').click();
      
      // Confirmation modal
      cy.get('[data-testid="cancel-deletion-modal"]').should('be.visible');
      cy.get('[data-testid="button-confirm-cancel"]').click();
      cy.wait('@cancelDeleteRequest');

      // Verify cancellation
      cy.get('[data-testid="success-message"]')
        .should('contain.text', /deletion.*cancelled/i);
    });

    it('should validate deletion request form', () => {
      cy.get('[data-testid="button-delete-account"]').click();
      
      // Try to submit without required fields
      cy.get('[data-testid="button-confirm-delete-account"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="error-deletion-reason"]')
        .should('be.visible')
        .and('contain.text', /reason.*required/i);

      cy.get('[data-testid="error-confirm-deletion"]')
        .should('be.visible')
        .and('contain.text', /confirmation.*required/i);

      cy.get('[data-testid="error-password"]')
        .should('be.visible')
        .and('contain.text', /password.*required/i);
    });
  });

  describe('Error Handling & Loading States', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
    });

    it('should handle settings load failure', () => {
      // Mock failed settings load
      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 500,
        body: { success: false, error: 'Failed to load settings' }
      }).as('failedSettingsLoad');

      cy.reload();
      cy.wait('@failedSettingsLoad');

      // Should show error state
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /failed.*load.*settings/i);

      // Should show retry button
      cy.get('[data-testid="button-retry"]')
        .should('be.visible')
        .click();
    });

    it('should handle settings update failure', () => {
      // Mock successful initial load
      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 200,
        body: { success: true, data: mockAccountSettings }
      }).as('getAccountSettings');

      // Mock failed update
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 400,
        body: { success: false, error: 'Invalid data provided' }
      }).as('failedUpdate');

      cy.reload();
      cy.wait('@getAccountSettings');

      // Try to update settings
      cy.get('[data-testid="tab-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="button-save-notifications"]').click();
      cy.wait('@failedUpdate');

      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /failed.*update/i);
    });

    it('should show loading states during operations', () => {
      // Mock delayed response
      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { success: true, data: mockAccountSettings },
        delay: 2000
      }).as('delayedUpdate');

      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 200,
        body: { success: true, data: mockAccountSettings }
      }).as('getAccountSettings');

      cy.reload();
      cy.wait('@getAccountSettings');

      // Start update operation
      cy.get('[data-testid="tab-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="button-save-notifications"]').click();

      // Should show loading state
      cy.get('[data-testid="loading-indicator"]').should('be.visible');
      cy.get('[data-testid="button-save-notifications"]').should('be.disabled');

      cy.wait('@delayedUpdate');

      // Loading state should be gone
      cy.get('[data-testid="loading-indicator"]').should('not.exist');
      cy.get('[data-testid="button-save-notifications"]').should('not.be.disabled');
    });
  });

  describe('Responsive Design & Accessibility', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should be responsive on mobile devices', () => {
      // Test mobile viewport
      cy.viewport(375, 667);

      // Navigation should be mobile-friendly
      cy.get('[data-testid="settings-nav"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');

      // Forms should be readable
      cy.get('[data-testid="profile-form"]')
        .should('be.visible')
        .and('not.have.css', 'overflow', 'hidden');

      // Buttons should be touchable
      cy.get('[data-testid="button-save-profile"]')
        .should('have.css', 'min-height')
        .and('match', /44px|48px/);
    });

    it('should be responsive on tablet devices', () => {
      // Test tablet viewport
      cy.viewport(768, 1024);

      // Layout should adapt
      cy.get('[data-testid="settings-container"]')
        .should('be.visible')
        .and('have.css', 'max-width');

      // Sidebar navigation should be visible
      cy.get('[data-testid="settings-nav"]').should('be.visible');
    });

    it('should have proper keyboard navigation', () => {
      // Tab through form elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid');

      // Test form navigation
      cy.get('[data-testid="input-name"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'input-name');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'input-email');
    });

    it('should have proper ARIA labels and roles', () => {
      // Form labels
      cy.get('[data-testid="input-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');

      // Buttons
      cy.get('[data-testid="button-save-profile"]')
        .should('have.attr', 'aria-label')
        .or('contain.text');

      // Toggle switches
      cy.get('[data-testid="toggle-email-notifications"]')
        .should('have.attr', 'role', 'switch')
        .and('have.attr', 'aria-checked');

      // Sections
      cy.get('[data-testid="profile-section"]')
        .should('have.attr', 'role', 'region')
        .or('have.attr', 'aria-labelledby');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain settings across page reloads', () => {
      // Mock settings update
      const updatedSettings = { 
        ...mockAccountSettings, 
        theme: 'dark',
        emailNotifications: false
      };

      cy.intercept('PATCH', apiEndpoints.updateAccountSettings, {
        statusCode: 200,
        body: { success: true, data: updatedSettings }
      }).as('updateSettings');

      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 200,
        body: { success: true, data: updatedSettings }
      }).as('getUpdatedSettings');

      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');

      // Update settings
      cy.get('[data-testid="tab-preferences"]').click();
      cy.get('[data-testid="select-theme"]').select('dark');
      cy.get('[data-testid="button-save-preferences"]').click();
      cy.wait('@updateSettings');

      // Reload page
      cy.reload();
      cy.wait('@getUpdatedSettings');

      // Settings should persist
      cy.get('[data-testid="tab-preferences"]').click();
      cy.get('[data-testid="select-theme"]').should('contain.value', 'dark');
    });

    it('should integrate with profile photo across the application', () => {
      const photoUrl = 'https://example.com/new-photo.jpg';

      // Mock photo update
      cy.intercept('POST', apiEndpoints.uploadObject, {
        statusCode: 200,
        body: { success: true, data: { url: photoUrl } }
      }).as('uploadPhoto');

      cy.intercept('PUT', apiEndpoints.uploadProfilePhoto, {
        statusCode: 200,
        body: { 
          success: true, 
          data: { ...testUser, profilePhotoUrl: photoUrl } 
        }
      }).as('updateProfilePhoto');

      cy.visit('/account/settings');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');

      // Upload photo
      const fileName = 'profile.jpg';
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('[data-testid="upload-profile-photo"]')
          .selectFile({
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: fileName,
            mimeType: 'image/jpeg'
          }, { force: true });
      });

      cy.wait('@uploadPhoto');
      cy.wait('@updateProfilePhoto');

      // Navigate to another page and verify photo is updated
      cy.visit('/dashboard');
      cy.get('[data-testid="user-avatar"]')
        .should('have.attr', 'src', photoUrl);
    });
  });
});
