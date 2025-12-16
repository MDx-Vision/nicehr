describe('Account Feature - Exhaustive Tests', () => {
  const testUser = {
    id: '1',
    email: 'test@example.com',
    password: 'test123',
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user',
      id: '1'
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    accountSettings: '/api/account/settings',
    userUpdate: '/api/users/1',
    deleteRequest: '/api/account/delete-request',
    profilePhoto: '/api/users/1/profile-photo',
    coverPhoto: '/api/users/1/cover-photo',
    uploadObject: '/api/objects/upload'
  };

  const mockUserData = {
    id: '1',
    email: 'test@example.com',
    username: 'ci-test-user',
    role: 'admin',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    timezone: 'America/New_York',
    profilePhoto: null,
    coverPhoto: null,
    notifications: {
      email: true,
      push: false,
      sms: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2023-01-15T10:00:00Z'
    }
  };

  const mockAccountSettings = {
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      timezone: 'America/New_York',
      bio: 'Test user bio'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: true,
      projectUpdates: true,
      scheduleChanges: true,
      systemAnnouncements: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: true,
      allowDirectMessages: true
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Setup API interceptors
    cy.intercept('GET', apiEndpoints.user, {
      statusCode: 200,
      body: mockUserData
    }).as('getUser');

    cy.intercept('GET', apiEndpoints.accountSettings, {
      statusCode: 200,
      body: mockAccountSettings
    }).as('getAccountSettings');

    cy.intercept('PATCH', apiEndpoints.accountSettings, {
      statusCode: 200,
      body: { success: true, message: 'Settings updated successfully' }
    }).as('updateAccountSettings');

    cy.intercept('PUT', apiEndpoints.userUpdate, {
      statusCode: 200,
      body: { success: true, message: 'Profile updated successfully' }
    }).as('updateProfile');

    cy.intercept('POST', apiEndpoints.deleteRequest, {
      statusCode: 200,
      body: { success: true, message: 'Account deletion requested' }
    }).as('requestAccountDeletion');

    cy.intercept('DELETE', apiEndpoints.deleteRequest, {
      statusCode: 200,
      body: { success: true, message: 'Account deletion request cancelled' }
    }).as('cancelAccountDeletion');

    cy.intercept('POST', apiEndpoints.login, {
      statusCode: 200,
      body: { success: true, user: mockUserData }
    }).as('login');

    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testUser.ciUser.email);
    cy.get('[data-testid="input-password"]').type(testUser.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@login');
  });

  describe('Account Settings Page - Navigation & Layout', () => {
    it('should navigate to account settings from user menu', () => {
      cy.get('[data-testid="user-menu-trigger"]').click();
      cy.get('[data-testid="menu-account-settings"]').click();
      
      cy.url().should('include', '/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should display account settings page layout and navigation', () => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');

      // Main container
      cy.get('[data-testid="account-settings-container"]').should('be.visible');
      
      // Page header
      cy.get('[data-testid="page-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /account|settings/i);
      
      // Settings navigation tabs
      cy.get('[data-testid="settings-nav"]').should('be.visible');
      cy.get('[data-testid="nav-personal"]').should('contain.text', 'Personal Info');
      cy.get('[data-testid="nav-notifications"]').should('contain.text', 'Notifications');
      cy.get('[data-testid="nav-privacy"]').should('contain.text', 'Privacy');
      cy.get('[data-testid="nav-security"]').should('contain.text', 'Security');
      cy.get('[data-testid="nav-danger"]').should('contain.text', 'Danger Zone');
    });

    it('should handle tab navigation correctly', () => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');

      // Test each tab
      const tabs = [
        { testId: 'nav-personal', content: 'personal-info-section' },
        { testId: 'nav-notifications', content: 'notifications-section' },
        { testId: 'nav-privacy', content: 'privacy-section' },
        { testId: 'nav-security', content: 'security-section' },
        { testId: 'nav-danger', content: 'danger-zone-section' }
      ];

      tabs.forEach((tab) => {
        cy.get(`[data-testid="${tab.testId}"]`).click();
        cy.get(`[data-testid="${tab.content}"]`).should('be.visible');
        cy.get(`[data-testid="${tab.testId}"]`).should('have.attr', 'aria-selected', 'true');
      });
    });

    it('should persist tab state on page reload', () => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');

      cy.get('[data-testid="nav-notifications"]').click();
      cy.get('[data-testid="notifications-section"]').should('be.visible');
      
      cy.reload();
      cy.wait('@getAccountSettings');
      
      cy.get('[data-testid="notifications-section"]').should('be.visible');
      cy.get('[data-testid="nav-notifications"]').should('have.attr', 'aria-selected', 'true');
    });
  });

  describe('Personal Information Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-personal"]').click();
    });

    it('should display personal information form with current data', () => {
      cy.get('[data-testid="personal-info-section"]').should('be.visible');
      
      // Check form fields are populated
      cy.get('[data-testid="input-first-name"]')
        .should('have.value', mockAccountSettings.personalInfo.firstName);
      cy.get('[data-testid="input-last-name"]')
        .should('have.value', mockAccountSettings.personalInfo.lastName);
      cy.get('[data-testid="input-email"]')
        .should('have.value', mockAccountSettings.personalInfo.email);
      cy.get('[data-testid="input-phone"]')
        .should('have.value', mockAccountSettings.personalInfo.phone);
      cy.get('[data-testid="select-timezone"]')
        .should('contain.value', mockAccountSettings.personalInfo.timezone);
      cy.get('[data-testid="textarea-bio"]')
        .should('have.value', mockAccountSettings.personalInfo.bio);
    });

    it('should validate required fields in personal info form', () => {
      // Clear required fields
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      cy.get('[data-testid="input-email"]').clear();
      
      cy.get('[data-testid="button-save-personal"]').click();
      
      // Check validation messages
      cy.get('[data-testid="error-first-name"]').should('contain.text', 'First name is required');
      cy.get('[data-testid="error-last-name"]').should('contain.text', 'Last name is required');
      cy.get('[data-testid="error-email"]').should('contain.text', 'Email is required');
      
      // Ensure form is not submitted
      cy.get('@updateAccountSettings.all').should('have.length', 0);
    });

    it('should validate email format', () => {
      const invalidEmails = ['invalid', 'test@', '@domain.com', 'test@domain'];
      
      invalidEmails.forEach((email) => {
        cy.get('[data-testid="input-email"]').clear().type(email);
        cy.get('[data-testid="button-save-personal"]').click();
        cy.get('[data-testid="error-email"]').should('contain.text', 'Please enter a valid email');
      });
    });

    it('should validate phone number format', () => {
      const invalidPhones = ['123', 'abc', '123-abc-7890'];
      
      invalidPhones.forEach((phone) => {
        cy.get('[data-testid="input-phone"]').clear().type(phone);
        cy.get('[data-testid="button-save-personal"]').click();
        cy.get('[data-testid="error-phone"]').should('contain.text', 'Please enter a valid phone number');
      });
    });

    it('should validate bio character limit', () => {
      const longBio = 'a'.repeat(501); // Assuming 500 character limit
      
      cy.get('[data-testid="textarea-bio"]').clear().type(longBio);
      cy.get('[data-testid="character-count"]').should('contain.text', '501/500');
      cy.get('[data-testid="button-save-personal"]').click();
      cy.get('[data-testid="error-bio"]').should('contain.text', 'Bio must be 500 characters or less');
    });

    it('should successfully update personal information', () => {
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1987654321',
        bio: 'Updated bio'
      };

      cy.get('[data-testid="input-first-name"]').clear().type(updatedData.firstName);
      cy.get('[data-testid="input-last-name"]').clear().type(updatedData.lastName);
      cy.get('[data-testid="input-phone"]').clear().type(updatedData.phone);
      cy.get('[data-testid="textarea-bio"]').clear().type(updatedData.bio);
      
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.personalInfo).to.deep.include(updatedData);
      });
      
      cy.get('[data-testid="success-message"]').should('contain.text', 'Settings updated successfully');
    });

    it('should handle timezone selection', () => {
      cy.get('[data-testid="select-timezone"]').click();
      cy.get('[data-testid="timezone-option-utc"]').click();
      
      cy.get('[data-testid="button-save-personal"]').click();
      cy.wait('@updateAccountSettings');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should show loading state during form submission', () => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, {
        delay: 2000,
        statusCode: 200,
        body: { success: true }
      }).as('slowUpdate');

      cy.get('[data-testid="input-first-name"]').clear().type('New Name');
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.get('[data-testid="button-save-personal"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      cy.wait('@slowUpdate');
      
      cy.get('[data-testid="button-save-personal"]').should('not.be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle form submission errors gracefully', () => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, {
        statusCode: 400,
        body: { error: 'Email already exists' }
      }).as('updateError');

      cy.get('[data-testid="input-first-name"]').clear().type('New Name');
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.wait('@updateError');
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Email already exists');
      cy.get('[data-testid="button-save-personal"]').should('not.be.disabled');
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-personal"]').click();
    });

    it('should display profile photo section', () => {
      cy.get('[data-testid="profile-photo-section"]').should('be.visible');
      cy.get('[data-testid="current-profile-photo"]').should('be.visible');
      cy.get('[data-testid="button-upload-photo"]').should('be.visible');
      cy.get('[data-testid="button-remove-photo"]').should('be.visible');
    });

    it('should open file upload dialog when clicking upload button', () => {
      cy.get('[data-testid="button-upload-photo"]').click();
      cy.get('[data-testid="file-input-photo"]').should('exist');
    });

    it('should handle profile photo upload successfully', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: { 
          success: true, 
          profilePhoto: 'https://example.com/profile.jpg',
          message: 'Profile photo updated successfully' 
        }
      }).as('uploadProfilePhoto');

      cy.get('[data-testid="file-input-photo"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      
      cy.wait('@uploadProfilePhoto');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile photo updated successfully');
      cy.get('[data-testid="current-profile-photo"]').should('have.attr', 'src').and('include', 'profile.jpg');
    });

    it('should validate file type for profile photo upload', () => {
      cy.get('[data-testid="file-input-photo"]').selectFile('cypress/fixtures/test-document.pdf', { force: true });
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Please select a valid image file (JPG, PNG, GIF)');
    });

    it('should validate file size for profile photo upload', () => {
      // Mock large file
      cy.get('[data-testid="file-input-photo"]').then(($input) => {
        const largefile = new File(['x'.repeat(10 * 1024 * 1024)], 'large-image.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largefile);
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'File size must be less than 5MB');
    });

    it('should remove profile photo successfully', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 200,
        body: { 
          success: true, 
          profilePhoto: null,
          message: 'Profile photo removed successfully' 
        }
      }).as('removeProfilePhoto');

      cy.get('[data-testid="button-remove-photo"]').click();
      cy.get('[data-testid="confirm-remove-photo"]').click();
      
      cy.wait('@removeProfilePhoto');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile photo removed successfully');
    });

    it('should handle photo upload errors gracefully', () => {
      cy.intercept('PUT', apiEndpoints.profilePhoto, {
        statusCode: 500,
        body: { error: 'Upload failed' }
      }).as('uploadError');

      cy.get('[data-testid="file-input-photo"]').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      
      cy.wait('@uploadError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Upload failed');
    });
  });

  describe('Cover Photo Management', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-personal"]').click();
    });

    it('should display cover photo section', () => {
      cy.get('[data-testid="cover-photo-section"]').should('be.visible');
      cy.get('[data-testid="current-cover-photo"]').should('be.visible');
      cy.get('[data-testid="button-upload-cover"]').should('be.visible');
      cy.get('[data-testid="button-remove-cover"]').should('be.visible');
    });

    it('should handle cover photo upload successfully', () => {
      cy.intercept('PUT', apiEndpoints.coverPhoto, {
        statusCode: 200,
        body: { 
          success: true, 
          coverPhoto: 'https://example.com/cover.jpg',
          message: 'Cover photo updated successfully' 
        }
      }).as('uploadCoverPhoto');

      cy.get('[data-testid="file-input-cover"]').selectFile('cypress/fixtures/test-cover.jpg', { force: true });
      
      cy.wait('@uploadCoverPhoto');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Cover photo updated successfully');
    });

    it('should remove cover photo successfully', () => {
      cy.intercept('PUT', apiEndpoints.coverPhoto, {
        statusCode: 200,
        body: { 
          success: true, 
          coverPhoto: null,
          message: 'Cover photo removed successfully' 
        }
      }).as('removeCoverPhoto');

      cy.get('[data-testid="button-remove-cover"]').click();
      cy.get('[data-testid="confirm-remove-cover"]').click();
      
      cy.wait('@removeCoverPhoto');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Cover photo removed successfully');
    });
  });

  describe('Notifications Settings', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-notifications"]').click();
    });

    it('should display notifications settings form', () => {
      cy.get('[data-testid="notifications-section"]').should('be.visible');
      
      // Check notification toggles
      cy.get('[data-testid="toggle-email-notifications"]').should('be.visible');
      cy.get('[data-testid="toggle-push-notifications"]').should('be.visible');
      cy.get('[data-testid="toggle-sms-notifications"]').should('be.visible');
      
      // Check specific notification types
      cy.get('[data-testid="toggle-project-updates"]').should('be.visible');
      cy.get('[data-testid="toggle-schedule-changes"]').should('be.visible');
      cy.get('[data-testid="toggle-system-announcements"]').should('be.visible');
    });

    it('should have correct initial notification states', () => {
      // Check that toggles reflect current settings
      cy.get('[data-testid="toggle-email-notifications"]').should('be.checked');
      cy.get('[data-testid="toggle-push-notifications"]').should('not.be.checked');
      cy.get('[data-testid="toggle-sms-notifications"]').should('be.checked');
      cy.get('[data-testid="toggle-project-updates"]').should('be.checked');
      cy.get('[data-testid="toggle-schedule-changes"]').should('be.checked');
      cy.get('[data-testid="toggle-system-announcements"]').should('not.be.checked');
    });

    it('should toggle individual notification settings', () => {
      // Toggle email notifications
      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').should('not.be.checked');
      
      // Toggle push notifications
      cy.get('[data-testid="toggle-push-notifications"]').click();
      cy.get('[data-testid="toggle-push-notifications"]').should('be.checked');
      
      cy.get('[data-testid="button-save-notifications"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.notifications.emailNotifications).to.be.false;
        expect(interception.request.body.notifications.pushNotifications).to.be.true;
      });
    });

    it('should disable specific notification types when main type is disabled', () => {
      // Disable email notifications
      cy.get('[data-testid="toggle-email-notifications"]').click();
      
      // Check that email-specific toggles are disabled
      cy.get('[data-testid="toggle-project-updates"]').should('be.disabled');
      cy.get('[data-testid="toggle-schedule-changes"]').should('be.disabled');
      cy.get('[data-testid="toggle-system-announcements"]').should('be.disabled');
    });

    it('should save notification preferences successfully', () => {
      cy.get('[data-testid="toggle-system-announcements"]').click();
      cy.get('[data-testid="button-save-notifications"]').click();
      
      cy.wait('@updateAccountSettings');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Settings updated successfully');
    });

    it('should handle notification settings save errors', () => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, {
        statusCode: 500,
        body: { error: 'Failed to update notification settings' }
      }).as('notificationError');

      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="button-save-notifications"]').click();
      
      cy.wait('@notificationError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to update notification settings');
    });

    it('should provide notification frequency options', () => {
      cy.get('[data-testid="select-email-frequency"]').should('be.visible');
      cy.get('[data-testid="select-email-frequency"]').click();
      
      cy.get('[data-testid="frequency-immediate"]').should('contain.text', 'Immediate');
      cy.get('[data-testid="frequency-daily"]').should('contain.text', 'Daily digest');
      cy.get('[data-testid="frequency-weekly"]').should('contain.text', 'Weekly digest');
      
      cy.get('[data-testid="frequency-daily"]').click();
      cy.get('[data-testid="button-save-notifications"]').click();
      
      cy.wait('@updateAccountSettings');
    });
  });

  describe('Privacy Settings', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-privacy"]').click();
    });

    it('should display privacy settings form', () => {
      cy.get('[data-testid="privacy-section"]').should('be.visible');
      
      // Profile visibility settings
      cy.get('[data-testid="select-profile-visibility"]').should('be.visible');
      cy.get('[data-testid="toggle-show-email"]').should('be.visible');
      cy.get('[data-testid="toggle-show-phone"]').should('be.visible');
      cy.get('[data-testid="toggle-allow-direct-messages"]').should('be.visible');
    });

    it('should have correct initial privacy states', () => {
      cy.get('[data-testid="select-profile-visibility"]').should('contain.value', 'public');
      cy.get('[data-testid="toggle-show-email"]').should('not.be.checked');
      cy.get('[data-testid="toggle-show-phone"]').should('be.checked');
      cy.get('[data-testid="toggle-allow-direct-messages"]').should('be.checked');
    });

    it('should update profile visibility settings', () => {
      cy.get('[data-testid="select-profile-visibility"]').click();
      cy.get('[data-testid="visibility-private"]').click();
      
      cy.get('[data-testid="button-save-privacy"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.privacy.profileVisibility).to.equal('private');
      });
    });

    it('should toggle contact information visibility', () => {
      cy.get('[data-testid="toggle-show-email"]').click();
      cy.get('[data-testid="toggle-show-phone"]').click();
      
      cy.get('[data-testid="button-save-privacy"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.privacy.showEmail).to.be.true;
        expect(interception.request.body.privacy.showPhone).to.be.false;
      });
    });

    it('should handle privacy settings update successfully', () => {
      cy.get('[data-testid="toggle-allow-direct-messages"]').click();
      cy.get('[data-testid="button-save-privacy"]').click();
      
      cy.wait('@updateAccountSettings');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Settings updated successfully');
    });

    it('should show privacy information tooltips', () => {
      cy.get('[data-testid="info-profile-visibility"]').trigger('mouseover');
      cy.get('[data-testid="tooltip-profile-visibility"]')
        .should('be.visible')
        .and('contain.text', 'Controls who can view your profile');
      
      cy.get('[data-testid="info-show-email"]').trigger('mouseover');
      cy.get('[data-testid="tooltip-show-email"]')
        .should('be.visible')
        .and('contain.text', 'Allow others to see your email address');
    });

    it('should warn about privacy setting implications', () => {
      cy.get('[data-testid="select-profile-visibility"]').click();
      cy.get('[data-testid="visibility-private"]').click();
      
      cy.get('[data-testid="privacy-warning"]')
        .should('be.visible')
        .and('contain.text', 'Setting your profile to private will hide it from search results');
    });
  });

  describe('Security Settings', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-security"]').click();
    });

    it('should display security settings form', () => {
      cy.get('[data-testid="security-section"]').should('be.visible');
      
      // Password change section
      cy.get('[data-testid="change-password-section"]').should('be.visible');
      cy.get('[data-testid="input-current-password"]').should('be.visible');
      cy.get('[data-testid="input-new-password"]').should('be.visible');
      cy.get('[data-testid="input-confirm-password"]').should('be.visible');
      
      // Two-factor authentication
      cy.get('[data-testid="two-factor-section"]').should('be.visible');
      cy.get('[data-testid="toggle-two-factor"]').should('be.visible');
      
      // Session settings
      cy.get('[data-testid="session-settings"]').should('be.visible');
      cy.get('[data-testid="select-session-timeout"]').should('be.visible');
      cy.get('[data-testid="toggle-login-alerts"]').should('be.visible');
    });

    it('should validate password change form', () => {
      // Test with empty fields
      cy.get('[data-testid="button-change-password"]').click();
      
      cy.get('[data-testid="error-current-password"]').should('contain.text', 'Current password is required');
      cy.get('[data-testid="error-new-password"]').should('contain.text', 'New password is required');
      
      // Test with weak password
      cy.get('[data-testid="input-current-password"]').type('oldpassword');
      cy.get('[data-testid="input-new-password"]').type('123');
      cy.get('[data-testid="button-change-password"]').click();
      
      cy.get('[data-testid="error-new-password"]').should('contain.text', 'Password must be at least 8 characters');
    });

    it('should validate password confirmation', () => {
      cy.get('[data-testid="input-current-password"]').type('oldpassword');
      cy.get('[data-testid="input-new-password"]').type('newpassword123');
      cy.get('[data-testid="input-confirm-password"]').type('differentpassword');
      
      cy.get('[data-testid="button-change-password"]').click();
      
      cy.get('[data-testid="error-confirm-password"]').should('contain.text', 'Passwords do not match');
    });

    it('should successfully change password', () => {
      cy.intercept('PUT', apiEndpoints.userUpdate, {
        statusCode: 200,
        body: { success: true, message: 'Password changed successfully' }
      }).as('changePassword');

      cy.get('[data-testid="input-current-password"]').type('oldpassword');
      cy.get('[data-testid="input-new-password"]').type('newpassword123');
      cy.get('[data-testid="input-confirm-password"]').type('newpassword123');
      
      cy.get('[data-testid="button-change-password"]').click();
      
      cy.wait('@changePassword');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Password changed successfully');
      
      // Form should be reset
      cy.get('[data-testid="input-current-password"]').should('have.value', '');
      cy.get('[data-testid="input-new-password"]').should('have.value', '');
      cy.get('[data-testid="input-confirm-password"]').should('have.value', '');
    });

    it('should handle incorrect current password', () => {
      cy.intercept('PUT', apiEndpoints.userUpdate, {
        statusCode: 400,
        body: { error: 'Current password is incorrect' }
      }).as('wrongPassword');

      cy.get('[data-testid="input-current-password"]').type('wrongpassword');
      cy.get('[data-testid="input-new-password"]').type('newpassword123');
      cy.get('[data-testid="input-confirm-password"]').type('newpassword123');
      
      cy.get('[data-testid="button-change-password"]').click();
      
      cy.wait('@wrongPassword');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Current password is incorrect');
    });

    it('should show password strength indicator', () => {
      cy.get('[data-testid="input-new-password"]').type('weak');
      cy.get('[data-testid="password-strength"]').should('contain.text', 'Weak');
      cy.get('[data-testid="password-strength-bar"]').should('have.class', 'strength-weak');
      
      cy.get('[data-testid="input-new-password"]').clear().type('StrongPassword123!');
      cy.get('[data-testid="password-strength"]').should('contain.text', 'Strong');
      cy.get('[data-testid="password-strength-bar"]').should('have.class', 'strength-strong');
    });

    it('should toggle two-factor authentication', () => {
      // Enable 2FA
      cy.get('[data-testid="toggle-two-factor"]').click();
      cy.get('[data-testid="two-factor-setup-modal"]').should('be.visible');
      cy.get('[data-testid="qr-code"]').should('be.visible');
      cy.get('[data-testid="backup-codes"]').should('be.visible');
      
      // Mock verification
      cy.get('[data-testid="input-verification-code"]').type('123456');
      cy.get('[data-testid="button-verify-2fa"]').click();
      
      cy.get('[data-testid="success-message"]').should('contain.text', 'Two-factor authentication enabled');
      cy.get('[data-testid="two-factor-status"]').should('contain.text', 'Enabled');
    });

    it('should update session timeout settings', () => {
      cy.get('[data-testid="select-session-timeout"]').click();
      cy.get('[data-testid="timeout-60"]').click();
      
      cy.get('[data-testid="button-save-security"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.security.sessionTimeout).to.equal(60);
      });
    });

    it('should toggle login alerts', () => {
      cy.get('[data-testid="toggle-login-alerts"]').click();
      cy.get('[data-testid="button-save-security"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.security.loginAlerts).to.be.false;
      });
    });

    it('should display recent login activity', () => {
      cy.get('[data-testid="recent-activity-section"]').should('be.visible');
      cy.get('[data-testid="activity-list"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="activity-item"]').first().within(() => {
        cy.get('[data-testid="activity-date"]').should('be.visible');
        cy.get('[data-testid="activity-location"]').should('be.visible');
        cy.get('[data-testid="activity-device"]').should('be.visible');
        cy.get('[data-testid="activity-ip"]').should('be.visible');
      });
    });
  });

  describe('Danger Zone Section', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-danger"]').click();
    });

    it('should display danger zone section', () => {
      cy.get('[data-testid="danger-zone-section"]').should('be.visible');
      cy.get('[data-testid="danger-warning"]')
        .should('be.visible')
        .and('contain.text', 'Danger Zone');
      
      cy.get('[data-testid="button-request-deletion"]').should('be.visible');
      cy.get('[data-testid="deletion-warning"]')
        .should('be.visible')
        .and('contain.text', 'This action cannot be undone');
    });

    it('should show account deletion confirmation dialog', () => {
      cy.get('[data-testid="button-request-deletion"]').click();
      
      cy.get('[data-testid="deletion-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="deletion-warning-text"]')
        .should('contain.text', 'Are you sure you want to delete your account?');
      
      cy.get('[data-testid="input-delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="button-confirm-deletion"]').should('be.disabled');
      cy.get('[data-testid="button-cancel-deletion"]').should('be.visible');
    });

    it('should require typing DELETE to enable deletion button', () => {
      cy.get('[data-testid="button-request-deletion"]').click();
      
      // Button should be disabled initially
      cy.get('[data-testid="button-confirm-deletion"]').should('be.disabled');
      
      // Type partial text
      cy.get('[data-testid="input-delete-confirmation"]').type('DEL');
      cy.get('[data-testid="button-confirm-deletion"]').should('be.disabled');
      
      // Type complete text
      cy.get('[data-testid="input-delete-confirmation"]').clear().type('DELETE');
      cy.get('[data-testid="button-confirm-deletion"]').should('not.be.disabled');
    });

    it('should successfully request account deletion', () => {
      cy.get('[data-testid="button-request-deletion"]').click();
      cy.get('[data-testid="input-delete-confirmation"]').type('DELETE');
      cy.get('[data-testid="button-confirm-deletion"]').click();
      
      cy.wait('@requestAccountDeletion');
      
      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Account deletion requested');
      
      // Should show pending deletion status
      cy.get('[data-testid="deletion-status"]')
        .should('be.visible')
        .and('contain.text', 'Deletion pending');
      
      cy.get('[data-testid="button-cancel-deletion-request"]').should('be.visible');
    });

    it('should cancel account deletion request', () => {
      // First request deletion
      cy.get('[data-testid="button-request-deletion"]').click();
      cy.get('[data-testid="input-delete-confirmation"]').type('DELETE');
      cy.get('[data-testid="button-confirm-deletion"]').click();
      cy.wait('@requestAccountDeletion');
      
      // Then cancel it
      cy.get('[data-testid="button-cancel-deletion-request"]').click();
      cy.get('[data-testid="confirm-cancel-deletion"]').click();
      
      cy.wait('@cancelAccountDeletion');
      
      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Account deletion request cancelled');
      
      cy.get('[data-testid="button-request-deletion"]').should('be.visible');
    });

    it('should handle deletion request errors', () => {
      cy.intercept('POST', apiEndpoints.deleteRequest, {
        statusCode: 400,
        body: { error: 'Cannot delete account with active projects' }
      }).as('deletionError');

      cy.get('[data-testid="button-request-deletion"]').click();
      cy.get('[data-testid="input-delete-confirmation"]').type('DELETE');
      cy.get('[data-testid="button-confirm-deletion"]').click();
      
      cy.wait('@deletionError');
      
      cy.get('[data-testid="error-message"]')
        .should('contain.text', 'Cannot delete account with active projects');
    });

    it('should show deletion timeline and data retention policy', () => {
      cy.get('[data-testid="data-retention-info"]').should('be.visible');
      cy.get('[data-testid="deletion-timeline"]')
        .should('be.visible')
        .and('contain.text', '30 days');
      
      cy.get('[data-testid="data-download-link"]')
        .should('be.visible')
        .and('contain.text', 'Download your data');
    });
  });

  describe('Data Export Feature', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      cy.get('[data-testid="nav-danger"]').click();
    });

    it('should provide data export functionality', () => {
      cy.get('[data-testid="data-export-section"]').should('be.visible');
      cy.get('[data-testid="button-export-data"]').should('be.visible');
      cy.get('[data-testid="export-description"]')
        .should('contain.text', 'Download all your personal data');
    });

    it('should initiate data export successfully', () => {
      cy.intercept('POST', '/api/account/export', {
        statusCode: 200,
        body: { 
          success: true, 
          exportId: 'export-123',
          message: 'Export initiated. You will receive an email when ready.' 
        }
      }).as('initiateExport');

      cy.get('[data-testid="button-export-data"]').click();
      cy.get('[data-testid="confirm-export"]').click();
      
      cy.wait('@initiateExport');
      
      cy.get('[data-testid="success-message"]')
        .should('contain.text', 'Export initiated. You will receive an email when ready.');
    });

    it('should show export status and history', () => {
      cy.get('[data-testid="export-history"]').should('be.visible');
      cy.get('[data-testid="export-item"]').should('have.length.at.least', 0);
      
      cy.get('[data-testid="export-item"]').first().within(() => {
        cy.get('[data-testid="export-date"]').should('be.visible');
        cy.get('[data-testid="export-status"]').should('be.visible');
        cy.get('[data-testid="export-download"]').should('be.visible');
      });
    });
  });

  describe('Responsive Design & Mobile Experience', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should adapt layout for mobile devices', () => {
      cy.viewport(375, 667); // iPhone SE
      
      // Settings navigation should become collapsible
      cy.get('[data-testid="settings-nav"]').should('be.visible');
      cy.get('[data-testid="mobile-nav-toggle"]').should('be.visible');
      
      // Form fields should stack vertically
      cy.get('[data-testid="personal-info-section"]').within(() => {
        cy.get('[data-testid="input-first-name"]').should('have.css', 'width');
        cy.get('[data-testid="input-last-name"]').should('have.css', 'width');
      });
    });

    it('should handle tablet layout', () => {
      cy.viewport(768, 1024); // iPad
      
      cy.get('[data-testid="settings-nav"]').should('be.visible');
      cy.get('[data-testid="personal-info-section"]').should('be.visible');
      
      // Check that form is properly spaced
      cy.get('[data-testid="form-row"]').should('have.css', 'display', 'flex');
    });

    it('should maintain functionality on touch devices', () => {
      cy.viewport(375, 667);
      
      // Test touch interactions
      cy.get('[data-testid="nav-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="button-save-notifications"]').should('be.visible').click();
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should have proper ARIA labels and roles', () => {
      // Check main sections have proper roles
      cy.get('[data-testid="settings-nav"]').should('have.attr', 'role', 'tablist');
      cy.get('[data-testid="nav-personal"]').should('have.attr', 'role', 'tab');
      cy.get('[data-testid="personal-info-section"]').should('have.attr', 'role', 'tabpanel');
      
      // Check form elements have labels
      cy.get('[data-testid="input-first-name"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="toggle-email-notifications"]').should('have.attr', 'aria-label');
    });

    it('should support keyboard navigation', () => {
      // Tab through navigation
      cy.get('[data-testid="nav-personal"]').focus();
      cy.get('[data-testid="nav-personal"]').should('have.focus');
      
      cy.get('[data-testid="nav-personal"]').type('{rightarrow}');
      cy.get('[data-testid="nav-notifications"]').should('have.focus');
      
      // Navigate form fields with tab
      cy.get('[data-testid="input-first-name"]').focus().tab();
      cy.get('[data-testid="input-last-name"]').should('have.focus');
    });

    it('should announce changes to screen readers', () => {
      cy.get('[data-testid="nav-notifications"]').click();
      cy.get('[data-testid="toggle-email-notifications"]').click();
      
      // Check for aria-live regions
      cy.get('[data-testid="status-message"]').should('have.attr', 'aria-live', 'polite');
    });

    it('should have proper focus management', () => {
      // When opening modal, focus should move to modal
      cy.get('[data-testid="nav-danger"]').click();
      cy.get('[data-testid="button-request-deletion"]').click();
      
      cy.get('[data-testid="deletion-confirmation-modal"]').should('have.focus');
      
      // When closing modal, focus should return
      cy.get('[data-testid="button-cancel-deletion"]').click();
      cy.get('[data-testid="button-request-deletion"]').should('have.focus');
    });
  });

  describe('Performance & Loading States', () => {
    it('should show loading state while fetching account settings', () => {
      cy.intercept('GET', apiEndpoints.accountSettings, {
        delay: 2000,
        statusCode: 200,
        body: mockAccountSettings
      }).as('slowAccountSettings');

      cy.visit('/account/settings');
      
      cy.get('[data-testid="settings-loading"]').should('be.visible');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      cy.wait('@slowAccountSettings');
      
      cy.get('[data-testid="settings-loading"]').should('not.exist');
      cy.get('[data-testid="personal-info-section"]').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('settingsError');

      cy.visit('/account/settings');
      cy.wait('@settingsError');
      
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Test retry functionality
      cy.intercept('GET', apiEndpoints.accountSettings, {
        statusCode: 200,
        body: mockAccountSettings
      }).as('retrySuccess');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@retrySuccess');
      
      cy.get('[data-testid="personal-info-section"]').should('be.visible');
    });

    it('should debounce form auto-save', () => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      
      // Type quickly - should only save after delay
      cy.get('[data-testid="input-first-name"]')
        .clear()
        .type('N')
        .wait(100)
        .type('e')
        .wait(100)
        .type('w')
        .wait(100)
        .type(' Name');
      
      // Should only have one save request after debounce
      cy.wait('@updateAccountSettings');
      cy.get('@updateAccountSettings.all').should('have.length', 1);
    });
  });

  describe('Data Validation & Edge Cases', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
    });

    it('should handle special characters in form inputs', () => {
      const specialChars = "O'Connor-Smith";
      
      cy.get('[data-testid="input-last-name"]').clear().type(specialChars);
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.personalInfo.lastName).to.equal(specialChars);
      });
    });

    it('should handle emoji in bio field', () => {
      const bioWithEmoji = 'Healthcare professional 👩‍⚕️ passionate about technology 💻';
      
      cy.get('[data-testid="textarea-bio"]').clear().type(bioWithEmoji);
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.wait('@updateAccountSettings').then((interception) => {
        expect(interception.request.body.personalInfo.bio).to.equal(bioWithEmoji);
      });
    });

    it('should handle very long names gracefully', () => {
      const longName = 'a'.repeat(100);
      
      cy.get('[data-testid="input-first-name"]').clear().type(longName);
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.get('[data-testid="error-first-name"]')
        .should('contain.text', 'First name must be 50 characters or less');
    });

    it('should validate international phone numbers', () => {
      const internationalPhones = [
        '+44 20 7946 0958', // UK
        '+33 1 42 86 83 26', // France
        '+81 3-3224-5111' // Japan
      ];
      
      internationalPhones.forEach((phone) => {
        cy.get('[data-testid="input-phone"]').clear().type(phone);
        cy.get('[data-testid="button-save-personal"]').click();
        cy.wait('@updateAccountSettings');
        cy.get('[data-testid="success-message"]').should('be.visible');
      });
    });

    it('should handle timezone edge cases', () => {
      cy.get('[data-testid="select-timezone"]').click();
      
      // Test edge timezones
      cy.get('[data-testid="timezone-option"]').contains('Kiritimati').click();
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.wait('@updateAccountSettings');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });

  describe('Security & Permission Checks', () => {
    it('should prevent unauthorized access to account settings', () => {
      cy.clearCookies();
      cy.visit('/account/settings');
      
      cy.url().should('include', '/login');
    });

    it('should validate user permissions for sensitive operations', () => {
      cy.intercept('PATCH', apiEndpoints.accountSettings, {
        statusCode: 403,
        body: { error: 'Insufficient permissions' }
      }).as('permissionDenied');

      cy.visit('/account/settings');
      cy.wait('@getAccountSettings');
      
      cy.get('[data-testid="input-first-name"]').clear().type('New Name');
      cy.get('[data-testid="button-save-personal"]').click();
      
      cy.wait('@permissionDenied');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Insufficient permissions');
    });

    it('should sanitize user inputs to prevent XSS', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      cy.get('[data-testid="input-first-name"]').clear().type(maliciousInput);
      cy.get('[data-testid="button-save-personal"]').click();
      
      // Should be sanitized in the UI
      cy.get('[data-testid="input-first-name"]').should('not.contain', '<script>');
      
      cy.wait('@updateAccountSettings').then((interception) => {
        // Should be sanitized in the request
        expect(interception.request.body.personalInfo.firstName).to.not.include('<script>');
      });
    });

    it('should require current password for sensitive changes', () => {
      cy.get('[data-testid="nav-security"]').click();
      
      cy.get('[data-testid="input-new-password"]').type('newpassword123');
      cy.get('[data-testid="input-confirm-password"]').type('newpassword123');
      cy.get('[data-testid="button-change-password"]').click();
      
      cy.get('[data-testid="error-current-password"]')
        .should('contain.text', 'Current password is required');
    });
  });
});
