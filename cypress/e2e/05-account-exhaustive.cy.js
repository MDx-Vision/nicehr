describe('Account Management - Exhaustive Tests', () => {
  const testUser = {
    id: 'ci-test-user',
    email: 'test@example.com',
    password: 'test123',
    username: 'ci-test-user'
  };

  const apiEndpoints = {
    user: '/api/auth/user',
    accountSettings: '/api/account/settings',
    updateUser: (id) => `/api/users/${id}`,
    updateUserRole: (id) => `/api/users/${id}/role`,
    deleteRequest: '/api/account/delete-request',
    uploadProfilePhoto: (id) => `/api/users/${id}/profile-photo`,
    uploadCoverPhoto: (id) => `/api/users/${id}/cover-photo`
  };

  const mockUser = {
    id: 'user-123',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    phone: '+1-555-0123',
    role: 'consultant',
    isActive: true,
    profilePhotoUrl: null,
    coverPhotoUrl: null,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockAccountSettings = {
    notifications: {
      email: true,
      sms: false,
      push: true,
      projectUpdates: true,
      scheduleChanges: true,
      systemAlerts: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    }
  };

  beforeEach(() => {
    // Login before each test
    cy.login(testUser.email, testUser.password);
    
    // Setup common API intercepts
    cy.intercept('GET', apiEndpoints.user, { fixture: 'user.json' }).as('getUser');
    cy.intercept('GET', apiEndpoints.accountSettings, mockAccountSettings).as('getAccountSettings');
  });

  describe('Account Settings Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display complete account settings page layout', () => {
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /account settings|settings/i);
      
      // Navigation tabs/sections
      cy.get('[data-testid="settings-nav"]').should('be.visible');
      cy.get('[data-testid="nav-profile"]').should('be.visible').and('contain.text', /profile/i);
      cy.get('[data-testid="nav-account"]').should('be.visible').and('contain.text', /account/i);
      cy.get('[data-testid="nav-notifications"]').should('be.visible').and('contain.text', /notifications/i);
      cy.get('[data-testid="nav-privacy"]').should('be.visible').and('contain.text', /privacy/i);
      cy.get('[data-testid="nav-preferences"]').should('be.visible').and('contain.text', /preferences/i);
      cy.get('[data-testid="nav-security"]').should('be.visible').and('contain.text', /security/i);

      // Main content area
      cy.get('[data-testid="settings-content"]').should('be.visible');
    });

    it('should have proper page metadata and accessibility', () => {
      cy.title().should('contain', 'Account Settings');
      cy.get('h1').should('have.attr', 'id');
      
      // Check ARIA landmarks
      cy.get('[role="navigation"]').should('exist');
      cy.get('[role="main"]').should('exist');
      
      // Check keyboard navigation
      cy.get('[data-testid="nav-profile"]').focus();
      cy.focused().should('have.attr', 'data-testid', 'nav-profile');
    });

    it('should handle navigation between settings sections', () => {
      // Test each navigation section
      const sections = [
        { testId: 'nav-profile', contentId: 'section-profile' },
        { testId: 'nav-account', contentId: 'section-account' },
        { testId: 'nav-notifications', contentId: 'section-notifications' },
        { testId: 'nav-privacy', contentId: 'section-privacy' },
        { testId: 'nav-preferences', contentId: 'section-preferences' },
        { testId: 'nav-security', contentId: 'section-security' }
      ];

      sections.forEach(section => {
        cy.get(`[data-testid="${section.testId}"]`).click();
        cy.get(`[data-testid="${section.contentId}"]`).should('be.visible');
        cy.get(`[data-testid="${section.testId}"]`).should('have.class', /active|selected/);
      });
    });
  });

  describe('Profile Settings Section', () => {
    beforeEach(() => {
      cy.intercept('PUT', apiEndpoints.updateUser(mockUser.id), mockUser).as('updateProfile');
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-profile"]').click();
    });

    it('should display profile form with current user data', () => {
      cy.get('[data-testid="profile-form"]').should('be.visible');
      
      // Basic info fields
      cy.get('[data-testid="input-first-name"]')
        .should('be.visible')
        .and('have.value', mockUser.firstName || '');
      cy.get('[data-testid="input-last-name"]')
        .should('be.visible')
        .and('have.value', mockUser.lastName || '');
      cy.get('[data-testid="input-email"]')
        .should('be.visible')
        .and('have.value', mockUser.email || '');
      cy.get('[data-testid="input-username"]')
        .should('be.visible')
        .and('have.value', mockUser.username || '');
      cy.get('[data-testid="input-phone"]')
        .should('be.visible')
        .and('have.value', mockUser.phone || '');

      // Profile photo section
      cy.get('[data-testid="profile-photo-section"]').should('be.visible');
      cy.get('[data-testid="upload-profile-photo"]').should('be.visible');
      
      // Cover photo section
      cy.get('[data-testid="cover-photo-section"]').should('be.visible');
      cy.get('[data-testid="upload-cover-photo"]').should('be.visible');

      // Save button
      cy.get('[data-testid="save-profile"]').should('be.visible');
    });

    it('should validate required profile fields', () => {
      // Clear required fields
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      cy.get('[data-testid="input-email"]').clear();

      cy.get('[data-testid="save-profile"]').click();

      // Check validation messages
      cy.get('[data-testid="error-first-name"]')
        .should('be.visible')
        .and('contain.text', /required|enter.*first name/i);
      cy.get('[data-testid="error-last-name"]')
        .should('be.visible')
        .and('contain.text', /required|enter.*last name/i);
      cy.get('[data-testid="error-email"]')
        .should('be.visible')
        .and('contain.text', /required|enter.*email/i);

      // Ensure form doesn't submit
      cy.get('@updateProfile.all').should('have.length', 0);
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'test@',
        'test..test@domain.com',
        'test@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        cy.get('[data-testid="input-email"]').clear().type(email);
        cy.get('[data-testid="save-profile"]').click();
        
        if (email) {
          cy.get('[data-testid="error-email"]')
            .should('be.visible')
            .and('contain.text', /invalid|valid email/i);
        }
      });
    });

    it('should validate phone number format', () => {
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '1234567890123456', // too long
        '++1-555-0123', // double plus
        '555-0123' // missing area code
      ];

      invalidPhones.forEach(phone => {
        cy.get('[data-testid="input-phone"]').clear().type(phone);
        cy.get('[data-testid="save-profile"]').click();
        
        cy.get('[data-testid="error-phone"]')
          .should('be.visible')
          .and('contain.text', /invalid|valid phone/i);
      });
    });

    it('should successfully update profile information', () => {
      const updatedData = {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        phone: '+1-555-9876'
      };

      // Update fields
      cy.get('[data-testid="input-first-name"]').clear().type(updatedData.firstName);
      cy.get('[data-testid="input-last-name"]').clear().type(updatedData.lastName);
      cy.get('[data-testid="input-username"]').clear().type(updatedData.username);
      cy.get('[data-testid="input-phone"]').clear().type(updatedData.phone);

      cy.get('[data-testid="save-profile"]').click();

      cy.wait('@updateProfile').then(interception => {
        expect(interception.request.body).to.include({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          username: updatedData.username,
          phone: updatedData.phone
        });
      });

      // Check success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated|saved/i);
    });

    it('should handle profile photo upload', () => {
      cy.intercept('PUT', apiEndpoints.uploadProfilePhoto(mockUser.id), {
        profilePhotoUrl: 'https://example.com/photo.jpg'
      }).as('uploadProfilePhoto');

      // Test file upload
      const fileName = 'profile-photo.jpg';
      cy.get('[data-testid="upload-profile-photo"] input[type="file"]')
        .selectFile({
          contents: Cypress.Buffer.from('fake-image-content'),
          fileName: fileName,
          mimeType: 'image/jpeg'
        }, { force: true });

      cy.wait('@uploadProfilePhoto');

      cy.get('[data-testid="profile-photo-preview"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'photo.jpg');
    });

    it('should handle cover photo upload', () => {
      cy.intercept('PUT', apiEndpoints.uploadCoverPhoto(mockUser.id), {
        coverPhotoUrl: 'https://example.com/cover.jpg'
      }).as('uploadCoverPhoto');

      const fileName = 'cover-photo.jpg';
      cy.get('[data-testid="upload-cover-photo"] input[type="file"]')
        .selectFile({
          contents: Cypress.Buffer.from('fake-image-content'),
          fileName: fileName,
          mimeType: 'image/jpeg'
        }, { force: true });

      cy.wait('@uploadCoverPhoto');

      cy.get('[data-testid="cover-photo-preview"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'cover.jpg');
    });

    it('should validate image file types for uploads', () => {
      const invalidFiles = [
        { name: 'document.pdf', type: 'application/pdf' },
        { name: 'script.js', type: 'application/javascript' },
        { name: 'data.txt', type: 'text/plain' }
      ];

      invalidFiles.forEach(file => {
        cy.get('[data-testid="upload-profile-photo"] input[type="file"]')
          .selectFile({
            contents: Cypress.Buffer.from('fake-content'),
            fileName: file.name,
            mimeType: file.type
          }, { force: true });

        cy.get('[data-testid="error-file-type"]')
          .should('be.visible')
          .and('contain.text', /invalid.*file.*type|only.*images/i);
      });
    });

    it('should handle image file size limits', () => {
      // Create large file (simulated)
      cy.intercept('PUT', apiEndpoints.uploadProfilePhoto(mockUser.id), {
        statusCode: 413,
        body: { error: 'File size too large' }
      }).as('uploadLargeFile');

      cy.get('[data-testid="upload-profile-photo"] input[type="file"]')
        .selectFile({
          contents: Cypress.Buffer.from('x'.repeat(10 * 1024 * 1024)), // 10MB
          fileName: 'large-image.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });

      cy.wait('@uploadLargeFile');

      cy.get('[data-testid="error-file-size"]')
        .should('be.visible')
        .and('contain.text', /file.*too.*large|size.*limit/i);
    });
  });

  describe('Notification Settings Section', () => {
    beforeEach(() => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, mockAccountSettings).as('updateNotifications');
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-notifications"]').click();
    });

    it('should display notification settings with current values', () => {
      cy.get('[data-testid="notification-settings"]').should('be.visible');

      // Email notifications
      cy.get('[data-testid="toggle-email-notifications"]')
        .should(mockAccountSettings.notifications.email ? 'be.checked' : 'not.be.checked');
      
      // SMS notifications
      cy.get('[data-testid="toggle-sms-notifications"]')
        .should(mockAccountSettings.notifications.sms ? 'be.checked' : 'not.be.checked');
      
      // Push notifications
      cy.get('[data-testid="toggle-push-notifications"]')
        .should(mockAccountSettings.notifications.push ? 'be.checked' : 'not.be.checked');
      
      // Specific notification types
      cy.get('[data-testid="toggle-project-updates"]')
        .should(mockAccountSettings.notifications.projectUpdates ? 'be.checked' : 'not.be.checked');
      
      cy.get('[data-testid="toggle-schedule-changes"]')
        .should(mockAccountSettings.notifications.scheduleChanges ? 'be.checked' : 'not.be.checked');
      
      cy.get('[data-testid="toggle-system-alerts"]')
        .should(mockAccountSettings.notifications.systemAlerts ? 'be.checked' : 'not.be.checked');
    });

    it('should update individual notification settings', () => {
      // Toggle email notifications
      cy.get('[data-testid="toggle-email-notifications"]').click();
      
      cy.wait('@updateNotifications').then(interception => {
        expect(interception.request.body.notifications.email).to.be.false;
      });

      // Toggle SMS notifications
      cy.get('[data-testid="toggle-sms-notifications"]').click();
      
      cy.wait('@updateNotifications').then(interception => {
        expect(interception.request.body.notifications.sms).to.be.true;
      });
    });

    it('should handle bulk notification settings changes', () => {
      // Disable all notifications
      cy.get('[data-testid="disable-all-notifications"]').click();
      
      cy.get('[data-testid="confirm-disable-all"]').click();
      
      cy.wait('@updateNotifications').then(interception => {
        const notifications = interception.request.body.notifications;
        Object.values(notifications).forEach(value => {
          expect(value).to.be.false;
        });
      });

      // Enable all notifications
      cy.get('[data-testid="enable-all-notifications"]').click();
      
      cy.wait('@updateNotifications').then(interception => {
        const notifications = interception.request.body.notifications;
        Object.values(notifications).forEach(value => {
          expect(value).to.be.true;
        });
      });
    });

    it('should show notification frequency options', () => {
      cy.get('[data-testid="notification-frequency"]').should('be.visible');
      
      // Test frequency options
      cy.get('[data-testid="frequency-immediate"]').should('be.visible');
      cy.get('[data-testid="frequency-daily"]').should('be.visible');
      cy.get('[data-testid="frequency-weekly"]').should('be.visible');
      
      cy.get('[data-testid="frequency-daily"]').click();
      
      cy.wait('@updateNotifications').then(interception => {
        expect(interception.request.body.notificationFrequency).to.equal('daily');
      });
    });
  });

  describe('Privacy Settings Section', () => {
    beforeEach(() => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, mockAccountSettings).as('updatePrivacy');
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-privacy"]').click();
    });

    it('should display privacy settings with current values', () => {
      cy.get('[data-testid="privacy-settings"]').should('be.visible');

      // Profile visibility
      cy.get('[data-testid="select-profile-visibility"]')
        .should('have.value', mockAccountSettings.privacy.profileVisibility);
      
      // Email visibility
      cy.get('[data-testid="toggle-show-email"]')
        .should(mockAccountSettings.privacy.showEmail ? 'be.checked' : 'not.be.checked');
      
      // Phone visibility
      cy.get('[data-testid="toggle-show-phone"]')
        .should(mockAccountSettings.privacy.showPhone ? 'be.checked' : 'not.be.checked');
    });

    it('should update profile visibility settings', () => {
      const visibilityOptions = ['public', 'private', 'team-only'];
      
      visibilityOptions.forEach(option => {
        cy.get('[data-testid="select-profile-visibility"]').select(option);
        
        cy.wait('@updatePrivacy').then(interception => {
          expect(interception.request.body.privacy.profileVisibility).to.equal(option);
        });
      });
    });

    it('should handle contact information visibility', () => {
      // Toggle email visibility
      cy.get('[data-testid="toggle-show-email"]').click();
      
      cy.wait('@updatePrivacy').then(interception => {
        expect(interception.request.body.privacy.showEmail).to.be.true;
      });

      // Toggle phone visibility
      cy.get('[data-testid="toggle-show-phone"]').click();
      
      cy.wait('@updatePrivacy').then(interception => {
        expect(interception.request.body.privacy.showPhone).to.be.false;
      });
    });

    it('should show privacy impact warnings', () => {
      // Change to private profile
      cy.get('[data-testid="select-profile-visibility"]').select('private');
      
      cy.get('[data-testid="privacy-warning"]')
        .should('be.visible')
        .and('contain.text', /private.*profile.*impact/i);
    });
  });

  describe('Preferences Section', () => {
    beforeEach(() => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, mockAccountSettings).as('updatePreferences');
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-preferences"]').click();
    });

    it('should display preference settings with current values', () => {
      cy.get('[data-testid="preference-settings"]').should('be.visible');

      // Theme
      cy.get('[data-testid="select-theme"]')
        .should('have.value', mockAccountSettings.preferences.theme);
      
      // Language
      cy.get('[data-testid="select-language"]')
        .should('have.value', mockAccountSettings.preferences.language);
      
      // Timezone
      cy.get('[data-testid="select-timezone"]')
        .should('have.value', mockAccountSettings.preferences.timezone);
      
      // Date format
      cy.get('[data-testid="select-date-format"]')
        .should('have.value', mockAccountSettings.preferences.dateFormat);
    });

    it('should update theme preferences', () => {
      const themes = ['light', 'dark', 'auto'];
      
      themes.forEach(theme => {
        cy.get('[data-testid="select-theme"]').select(theme);
        
        cy.wait('@updatePreferences').then(interception => {
          expect(interception.request.body.preferences.theme).to.equal(theme);
        });

        // Verify theme is applied
        if (theme !== 'auto') {
          cy.get('html').should('have.class', theme);
        }
      });
    });

    it('should update language preferences', () => {
      cy.get('[data-testid="select-language"]').select('es');
      
      cy.wait('@updatePreferences').then(interception => {
        expect(interception.request.body.preferences.language).to.equal('es');
      });
    });

    it('should update timezone preferences', () => {
      cy.get('[data-testid="select-timezone"]').select('America/New_York');
      
      cy.wait('@updatePreferences').then(interception => {
        expect(interception.request.body.preferences.timezone).to.equal('America/New_York');
      });
    });

    it('should update date format preferences', () => {
      const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
      
      dateFormats.forEach(format => {
        cy.get('[data-testid="select-date-format"]').select(format);
        
        cy.wait('@updatePreferences').then(interception => {
          expect(interception.request.body.preferences.dateFormat).to.equal(format);
        });

        // Verify preview updates
        cy.get('[data-testid="date-format-preview"]')
          .should('be.visible')
          .and('contain.text', format.toLowerCase());
      });
    });
  });

  describe('Security Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-security"]').click();
    });

    it('should display security settings section', () => {
      cy.get('[data-testid="security-settings"]').should('be.visible');

      // Password change section
      cy.get('[data-testid="change-password-section"]').should('be.visible');
      cy.get('[data-testid="change-password-button"]').should('be.visible');

      // Two-factor authentication
      cy.get('[data-testid="2fa-section"]').should('be.visible');
      cy.get('[data-testid="enable-2fa"]').should('be.visible');

      // Active sessions
      cy.get('[data-testid="active-sessions-section"]').should('be.visible');
      cy.get('[data-testid="view-sessions"]').should('be.visible');

      // Account deletion
      cy.get('[data-testid="danger-zone"]').should('be.visible');
      cy.get('[data-testid="request-deletion"]').should('be.visible');
    });

    it('should handle password change workflow', () => {
      cy.intercept('PUT', apiEndpoints.updateUser(mockUser.id), { success: true }).as('changePassword');

      cy.get('[data-testid="change-password-button"]').click();
      cy.get('[data-testid="password-change-modal"]').should('be.visible');

      // Fill password form
      cy.get('[data-testid="input-current-password"]').type('currentPassword123');
      cy.get('[data-testid="input-new-password"]').type('newPassword123!');
      cy.get('[data-testid="input-confirm-password"]').type('newPassword123!');

      cy.get('[data-testid="submit-password-change"]').click();

      cy.wait('@changePassword').then(interception => {
        expect(interception.request.body).to.have.property('password');
      });

      cy.get('[data-testid="password-success"]')
        .should('be.visible')
        .and('contain.text', /password.*updated|changed/i);
    });

    it('should validate password change requirements', () => {
      cy.get('[data-testid="change-password-button"]').click();

      // Test password strength requirements
      const weakPasswords = [
        '123',
        'password',
        'abc123',
        'PASSWORD',
        'Pass123'
      ];

      weakPasswords.forEach(password => {
        cy.get('[data-testid="input-new-password"]').clear().type(password);
        cy.get('[data-testid="password-strength"]')
          .should('be.visible')
          .and('contain.text', /weak|invalid/i);
      });

      // Test password mismatch
      cy.get('[data-testid="input-new-password"]').clear().type('ValidPassword123!');
      cy.get('[data-testid="input-confirm-password"]').clear().type('DifferentPassword123!');
      
      cy.get('[data-testid="submit-password-change"]').click();
      
      cy.get('[data-testid="error-password-mismatch"]')
        .should('be.visible')
        .and('contain.text', /passwords.*match/i);
    });

    it('should show active sessions management', () => {
      const mockSessions = [
        {
          id: 'session-1',
          deviceInfo: 'Chrome on Windows',
          location: 'New York, NY',
          lastActive: new Date().toISOString(),
          current: true
        },
        {
          id: 'session-2',
          deviceInfo: 'Safari on iPhone',
          location: 'Los Angeles, CA',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          current: false
        }
      ];

      cy.intercept('GET', '/api/auth/sessions', mockSessions).as('getSessions');
      cy.intercept('DELETE', '/api/auth/sessions/session-2', { success: true }).as('revokeSession');

      cy.get('[data-testid="view-sessions"]').click();
      cy.wait('@getSessions');

      cy.get('[data-testid="sessions-modal"]').should('be.visible');
      
      // Check sessions are displayed
      cy.get('[data-testid="session-session-1"]').should('be.visible');
      cy.get('[data-testid="session-current-badge"]').should('be.visible');
      
      cy.get('[data-testid="session-session-2"]').should('be.visible');
      cy.get('[data-testid="revoke-session-session-2"]').click();
      
      cy.wait('@revokeSession');
      
      cy.get('[data-testid="session-session-2"]').should('not.exist');
    });

    it('should handle account deletion request', () => {
      cy.intercept('POST', apiEndpoints.deleteRequest, { 
        deletionScheduledFor: new Date(Date.now() + 7 * 86400000).toISOString() 
      }).as('requestDeletion');

      cy.get('[data-testid="request-deletion"]').click();
      cy.get('[data-testid="deletion-modal"]').should('be.visible');

      // Confirmation steps
      cy.get('[data-testid="deletion-reason"]').select('other');
      cy.get('[data-testid="deletion-comment"]').type('Test deletion request');
      cy.get('[data-testid="confirm-deletion-checkbox"]').check();
      cy.get('[data-testid="type-delete-confirm"]').type('DELETE');

      cy.get('[data-testid="submit-deletion"]').click();

      cy.wait('@requestDeletion');

      cy.get('[data-testid="deletion-scheduled"]')
        .should('be.visible')
        .and('contain.text', /deletion.*scheduled/i);
    });

    it('should handle deletion request cancellation', () => {
      // Mock active deletion request
      cy.intercept('GET', apiEndpoints.accountSettings, {
        ...mockAccountSettings,
        deletionRequest: {
          requestedAt: new Date().toISOString(),
          scheduledFor: new Date(Date.now() + 7 * 86400000).toISOString()
        }
      }).as('getSettingsWithDeletion');

      cy.intercept('DELETE', apiEndpoints.deleteRequest, { success: true }).as('cancelDeletion');

      cy.visit('/account/settings');
      cy.wait('@getSettingsWithDeletion');
      cy.get('[data-testid="nav-security"]').click();

      cy.get('[data-testid="active-deletion-request"]').should('be.visible');
      cy.get('[data-testid="cancel-deletion"]').click();

      cy.get('[data-testid="cancel-deletion-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-cancel-deletion"]').click();

      cy.wait('@cancelDeletion');

      cy.get('[data-testid="deletion-cancelled"]')
        .should('be.visible')
        .and('contain.text', /deletion.*cancelled/i);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateError');

      cy.get('[data-testid="nav-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').click();

      cy.wait('@updateError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error.*saving|failed.*update/i);
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="nav-preferences"]').click();
      cy.get('[data-testid="select-theme"]').select('dark');

      cy.wait('@networkError');

      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /connection.*error|network.*issue/i);

      // Should show retry option
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedError');

      cy.visit('/account/settings');
      cy.wait('@unauthorizedError');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should handle loading states properly', () => {
      cy.intercept('GET', apiEndpoints.accountSettings, (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send(mockAccountSettings);
        });
      }).as('slowSettings');

      cy.visit('/account/settings');

      // Check loading state
      cy.get('[data-testid="loading-settings"]').should('be.visible');
      cy.get('[data-testid="settings-content"]').should('not.exist');

      cy.wait('@slowSettings');

      cy.get('[data-testid="loading-settings"]').should('not.exist');
      cy.get('[data-testid="settings-content"]').should('be.visible');
    });

    it('should handle empty or missing data', () => {
      cy.intercept('GET', apiEndpoints.accountSettings, {}).as('emptySettings');

      cy.visit('/account/settings');
      cy.wait('@emptySettings');

      // Should show default values
      cy.get('[data-testid="nav-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').should('not.be.checked');
      cy.get('[data-testid="toggle-sms-notifications"]').should('not.be.checked');
    });
  });

  describe('Responsive Design & Mobile', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should adapt layout for mobile devices', () => {
      cy.viewport('iphone-x');

      // Navigation should be collapsible or different layout
      cy.get('[data-testid="mobile-settings-nav"]').should('be.visible');
      cy.get('[data-testid="settings-nav"]').should('not.be.visible');

      // Tabs should work on mobile
      cy.get('[data-testid="mobile-nav-toggle"]').click();
      cy.get('[data-testid="mobile-nav-profile"]').click();
      cy.get('[data-testid="section-profile"]').should('be.visible');
    });

    it('should handle touch interactions', () => {
      cy.viewport('ipad-2');

      cy.get('[data-testid="nav-notifications"]').click();
      
      // Touch-friendly toggle switches
      cy.get('[data-testid="toggle-email-notifications"]')
        .should('have.css', 'min-height')
        .and('match', /44px|48px/); // Touch target size
    });

    it('should adapt forms for different screen sizes', () => {
      cy.viewport(768, 1024); // Tablet

      cy.get('[data-testid="nav-profile"]').click();
      cy.get('[data-testid="profile-form"]').should('be.visible');

      // Form should stack vertically on smaller screens
      cy.get('[data-testid="input-first-name"]').then($el => {
        const rect = $el[0].getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(300);
      });
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should support keyboard navigation', () => {
      // Tab through navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'nav-profile');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'nav-account');
      
      // Enter to select
      cy.focused().type('{enter}');
      cy.get('[data-testid="section-account"]').should('be.visible');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="settings-nav"]').should('have.attr', 'role', 'navigation');
      cy.get('[data-testid="settings-content"]').should('have.attr', 'role', 'main');
      
      // Form labels
      cy.get('[data-testid="nav-profile"]').click();
      cy.get('[data-testid="input-first-name"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
    });

    it('should announce changes to screen readers', () => {
      cy.get('[data-testid="nav-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').click();
      
      cy.get('[aria-live="polite"]')
        .should('contain.text', /notification.*updated|settings.*saved/i);
    });

    it('should handle focus management', () => {
      // Focus should move to section content when navigating
      cy.get('[data-testid="nav-privacy"]').click();
      cy.focused().should('be.within', '[data-testid="section-privacy"]');
      
      // Modal focus management
      cy.get('[data-testid="nav-security"]').click();
      cy.get('[data-testid="change-password-button"]').click();
      cy.focused().should('have.attr', 'data-testid', 'input-current-password');
    });
  });
});
