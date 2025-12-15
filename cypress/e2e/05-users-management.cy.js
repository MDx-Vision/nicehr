describe('Users Management System', () => {
  const testUsers = {
    admin: {
      id: 'ci-test-user',
      email: 'test@example.com',
      name: 'CI Test User',
      role: 'admin'
    },
    newUser: {
      email: 'newuser@example.com',
      name: 'New Test User',
      firstName: 'New',
      lastName: 'User',
      role: 'consultant',
      phone: '+1234567890'
    },
    updateUser: {
      name: 'Updated Test User',
      firstName: 'Updated',
      lastName: 'User',
      phone: '+0987654321'
    },
    invalidUser: {
      email: 'invalid-email',
      name: '',
      phone: 'invalid-phone'
    }
  };

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  describe('User Profile Management', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    describe('Profile Page UI Elements', () => {
      it('should display all profile elements correctly', () => {
        cy.get('[data-testid="profile-container"]').should('be.visible');
        cy.get('[data-testid="profile-header"]').should('be.visible');
        cy.get('[data-testid="profile-avatar"]').should('be.visible');
        cy.get('[data-testid="profile-name"]').should('be.visible');
        cy.get('[data-testid="profile-email"]').should('be.visible');
        cy.get('[data-testid="profile-role"]').should('be.visible');
        cy.get('[data-testid="edit-profile-button"]').should('be.visible').and('not.be.disabled');
      });

      it('should display user information correctly', () => {
        cy.intercept('GET', '/api/auth/user').as('getUser');
        cy.wait('@getUser');
        
        cy.get('[data-testid="profile-name"]').should('contain.text', testUsers.admin.name);
        cy.get('[data-testid="profile-email"]').should('contain.text', testUsers.admin.email);
        cy.get('[data-testid="profile-role"]').should('contain.text', testUsers.admin.role);
      });

      it('should show profile sections', () => {
        cy.get('[data-testid="personal-info-section"]').should('be.visible');
        cy.get('[data-testid="contact-info-section"]').should('be.visible');
        cy.get('[data-testid="account-settings-section"]').should('be.visible');
        cy.get('[data-testid="security-settings-section"]').should('be.visible');
      });

      it('should have accessible profile photo upload', () => {
        cy.get('[data-testid="profile-photo-upload"]').should('exist');
        cy.get('[data-testid="profile-photo-input"]').should('have.attr', 'accept', 'image/*');
        cy.get('[data-testid="profile-photo-button"]').should('be.visible');
      });

      it('should display cover photo section', () => {
        cy.get('[data-testid="cover-photo-section"]').should('be.visible');
        cy.get('[data-testid="cover-photo-upload"]').should('exist');
        cy.get('[data-testid="cover-photo-input"]').should('have.attr', 'accept', 'image/*');
      });
    });

    describe('Profile Information Display', () => {
      it('should load and display user data correctly', () => {
        cy.intercept('GET', '/api/auth/user', {
          statusCode: 200,
          body: {
            id: testUsers.admin.id,
            email: testUsers.admin.email,
            name: testUsers.admin.name,
            role: testUsers.admin.role,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        }).as('getUserSuccess');

        cy.visit('/profile');
        cy.wait('@getUserSuccess');

        cy.get('[data-testid="profile-name"]').should('contain.text', testUsers.admin.name);
        cy.get('[data-testid="profile-email"]').should('contain.text', testUsers.admin.email);
        cy.get('[data-testid="profile-role"]').should('contain.text', testUsers.admin.role);
      });

      it('should handle loading state', () => {
        cy.intercept('GET', '/api/auth/user', { delay: 1000 }).as('getUserSlow');
        
        cy.visit('/profile');
        cy.get('[data-testid="profile-loading"]').should('be.visible');
        cy.wait('@getUserSlow');
        cy.get('[data-testid="profile-loading"]').should('not.exist');
      });

      it('should handle error state when user data fails to load', () => {
        cy.intercept('GET', '/api/auth/user', {
          statusCode: 500,
          body: { error: 'Failed to load user data' }
        }).as('getUserError');

        cy.visit('/profile');
        cy.wait('@getUserError');
        
        cy.get('[data-testid="profile-error"]').should('be.visible');
        cy.get('[data-testid="error-message"]').should('contain.text', 'Failed to load profile');
        cy.get('[data-testid="retry-button"]').should('be.visible');
      });

      it('should retry loading user data', () => {
        cy.intercept('GET', '/api/auth/user', {
          statusCode: 500,
          body: { error: 'Server error' }
        }).as('getUserError');

        cy.intercept('GET', '/api/auth/user', {
          statusCode: 200,
          body: { id: testUsers.admin.id, name: testUsers.admin.name }
        }).as('getUserRetry');

        cy.visit('/profile');
        cy.wait('@getUserError');
        
        cy.get('[data-testid="retry-button"]').click();
        cy.wait('@getUserRetry');
        cy.get('[data-testid="profile-container"]').should('be.visible');
      });
    });

    describe('Profile Photo Management', () => {
      it('should upload profile photo successfully', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}/profile-photo`, {
          statusCode: 200,
          body: { profilePhotoUrl: '/uploads/profile-photo.jpg' }
        }).as('uploadProfilePhoto');

        cy.fixture('test-image.jpg', 'base64').then(fileContent => {
          cy.get('[data-testid="profile-photo-input"]').attachFile({
            fileContent,
            fileName: 'profile-photo.jpg',
            mimeType: 'image/jpeg',
            encoding: 'base64'
          });
        });

        cy.wait('@uploadProfilePhoto');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Profile photo updated successfully');
      });

      it('should handle profile photo upload error', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}/profile-photo`, {
          statusCode: 400,
          body: { error: 'Invalid file format' }
        }).as('uploadPhotoError');

        cy.fixture('test-document.pdf', 'base64').then(fileContent => {
          cy.get('[data-testid="profile-photo-input"]').attachFile({
            fileContent,
            fileName: 'document.pdf',
            mimeType: 'application/pdf',
            encoding: 'base64'
          });
        });

        cy.wait('@uploadPhotoError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Invalid file format');
      });

      it('should validate file size for profile photo', () => {
        // Mock large file
        cy.get('[data-testid="profile-photo-input"]').then(input => {
          const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large-image.jpg', {
            type: 'image/jpeg'
          });
          
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(largeFile);
          input[0].files = dataTransfer.files;
          
          cy.wrap(input).trigger('change');
        });

        cy.get('[data-testid="file-size-error"]').should('contain.text', 'File size must be less than 5MB');
      });

      it('should validate file type for profile photo', () => {
        cy.fixture('test-document.txt').then(fileContent => {
          cy.get('[data-testid="profile-photo-input"]').attachFile({
            fileContent,
            fileName: 'document.txt',
            mimeType: 'text/plain'
          });
        });

        cy.get('[data-testid="file-type-error"]').should('contain.text', 'Only image files are allowed');
      });

      it('should remove profile photo', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}/profile-photo`, {
          statusCode: 200,
          body: { profilePhotoUrl: null }
        }).as('removeProfilePhoto');

        cy.get('[data-testid="remove-photo-button"]').click();
        cy.get('[data-testid="confirm-remove-button"]').click();

        cy.wait('@removeProfilePhoto');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Profile photo removed successfully');
      });
    });

    describe('Cover Photo Management', () => {
      it('should upload cover photo successfully', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}/cover-photo`, {
          statusCode: 200,
          body: { coverPhotoUrl: '/uploads/cover-photo.jpg' }
        }).as('uploadCoverPhoto');

        cy.fixture('test-image.jpg', 'base64').then(fileContent => {
          cy.get('[data-testid="cover-photo-input"]').attachFile({
            fileContent,
            fileName: 'cover-photo.jpg',
            mimeType: 'image/jpeg',
            encoding: 'base64'
          });
        });

        cy.wait('@uploadCoverPhoto');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Cover photo updated successfully');
      });

      it('should handle cover photo upload error', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}/cover-photo`, {
          statusCode: 413,
          body: { error: 'File too large' }
        }).as('uploadCoverError');

        cy.fixture('test-image.jpg', 'base64').then(fileContent => {
          cy.get('[data-testid="cover-photo-input"]').attachFile({
            fileContent,
            fileName: 'large-cover.jpg',
            mimeType: 'image/jpeg',
            encoding: 'base64'
          });
        });

        cy.wait('@uploadCoverError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'File too large');
      });

      it('should remove cover photo', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}/cover-photo`, {
          statusCode: 200,
          body: { coverPhotoUrl: null }
        }).as('removeCoverPhoto');

        cy.get('[data-testid="remove-cover-photo-button"]').click();
        cy.get('[data-testid="confirm-remove-button"]').click();

        cy.wait('@removeCoverPhoto');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Cover photo removed successfully');
      });
    });
  });

  describe('User Profile Editing', () => {
    beforeEach(() => {
      cy.visit('/profile/edit');
    });

    describe('Edit Profile Form UI', () => {
      it('should display edit profile form elements', () => {
        cy.get('[data-testid="edit-profile-form"]').should('be.visible');
        cy.get('[data-testid="input-first-name"]').should('be.visible');
        cy.get('[data-testid="input-last-name"]').should('be.visible');
        cy.get('[data-testid="input-email"]').should('be.visible');
        cy.get('[data-testid="input-phone"]').should('be.visible');
        cy.get('[data-testid="button-save-profile"]').should('be.visible');
        cy.get('[data-testid="button-cancel"]').should('be.visible');
      });

      it('should pre-populate form with existing user data', () => {
        cy.intercept('GET', '/api/auth/user', {
          statusCode: 200,
          body: {
            id: testUsers.admin.id,
            firstName: 'CI',
            lastName: 'Test User',
            email: testUsers.admin.email,
            phone: '+1234567890'
          }
        }).as('getUser');

        cy.visit('/profile/edit');
        cy.wait('@getUser');

        cy.get('[data-testid="input-first-name"]').should('have.value', 'CI');
        cy.get('[data-testid="input-last-name"]').should('have.value', 'Test User');
        cy.get('[data-testid="input-email"]').should('have.value', testUsers.admin.email);
        cy.get('[data-testid="input-phone"]').should('have.value', '+1234567890');
      });

      it('should have proper form attributes', () => {
        cy.get('[data-testid="input-first-name"]')
          .should('have.attr', 'required')
          .and('have.attr', 'maxlength', '50');
        cy.get('[data-testid="input-last-name"]')
          .should('have.attr', 'required')
          .and('have.attr', 'maxlength', '50');
        cy.get('[data-testid="input-email"]')
          .should('have.attr', 'type', 'email')
          .and('have.attr', 'required');
        cy.get('[data-testid="input-phone"]')
          .should('have.attr', 'type', 'tel');
      });

      it('should handle keyboard navigation', () => {
        cy.get('[data-testid="input-first-name"]').should('be.focused');
        cy.get('[data-testid="input-first-name"]').tab();
        cy.get('[data-testid="input-last-name"]').should('be.focused');
        cy.get('[data-testid="input-last-name"]').tab();
        cy.get('[data-testid="input-email"]').should('be.focused');
        cy.get('[data-testid="input-email"]').tab();
        cy.get('[data-testid="input-phone"]').should('be.focused');
      });
    });

    describe('Profile Update Functionality', () => {
      it('should update user profile successfully', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}`, {
          statusCode: 200,
          body: { 
            id: testUsers.admin.id,
            ...testUsers.updateUser
          }
        }).as('updateUser');

        cy.get('[data-testid="input-first-name"]').clear().type(testUsers.updateUser.firstName);
        cy.get('[data-testid="input-last-name"]').clear().type(testUsers.updateUser.lastName);
        cy.get('[data-testid="input-phone"]').clear().type(testUsers.updateUser.phone);
        
        cy.get('[data-testid="button-save-profile"]').click();

        cy.wait('@updateUser').then((interception) => {
          expect(interception.request.body).to.include({
            firstName: testUsers.updateUser.firstName,
            lastName: testUsers.updateUser.lastName,
            phone: testUsers.updateUser.phone
          });
        });

        cy.get('[data-testid="success-toast"]').should('contain.text', 'Profile updated successfully');
        cy.url().should('include', '/profile');
      });

      it('should handle profile update error', () => {
        cy.intercept('PUT', `/api/users/${testUsers.admin.id}`, {
          statusCode: 400,
          body: { error: 'Invalid phone number format' }
        }).as('updateUserError');

        cy.get('[data-testid="input-phone"]').clear().type('invalid-phone');
        cy.get('[data-testid="button-save-profile"]').click();

        cy.wait('@updateUserError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Invalid phone number format');
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="input-first-name"]').clear();
        cy.get('[data-testid="input-last-name"]').clear();
        cy.get('[data-testid="button-save-profile"]').click();

        cy.get('[data-testid="error-first-name"]').should('contain.text', 'First name is required');
        cy.get('[data-testid="error-last-name"]').should('contain.text', 'Last name is required');
        cy.get('[data-testid="button-save-profile"]').should('be.disabled');
      });

      it('should validate email format', () => {
        cy.get('[data-testid="input-email"]').clear().type('invalid-email');
        cy.get('[data-testid="input-first-name"]').click(); // Trigger blur

        cy.get('[data-testid="error-email"]').should('contain.text', 'Please enter a valid email address');
      });

      it('should validate phone number format', () => {
        cy.get('[data-testid="input-phone"]').clear().type('abc123');
        cy.get('[data-testid="input-first-name"]').click(); // Trigger blur

        cy.get('[data-testid="error-phone"]').should('contain.text', 'Please enter a valid phone number');
      });

      it('should cancel profile editing', () => {
        cy.get('[data-testid="input-first-name"]').clear().type('Changed Name');
        cy.get('[data-testid="button-cancel"]').click();

        cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
        cy.get('[data-testid="confirm-cancel-button"]').click();

        cy.url().should('include', '/profile');
      });

      it('should warn about unsaved changes', () => {
        cy.get('[data-testid="input-first-name"]').clear().type('Changed Name');
        
        // Try to navigate away
        cy.window().then((win) => {
          cy.stub(win, 'beforeunload').returns('You have unsaved changes');
        });

        cy.visit('/dashboard');
        cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
        cy.get('[data-testid="stay-button"]').click();
        cy.url().should('include', '/profile/edit');
      });
    });

    describe('Form Field Validations', () => {
      it('should enforce maximum length for name fields', () => {
        const longName = 'a'.repeat(51);
        
        cy.get('[data-testid="input-first-name"]').type(longName);
        cy.get('[data-testid="input-first-name"]').should('have.value', longName.substring(0, 50));
        
        cy.get('[data-testid="input-last-name"]').type(longName);
        cy.get('[data-testid="input-last-name"]').should('have.value', longName.substring(0, 50));
      });

      it('should trim whitespace from inputs', () => {
        cy.get('[data-testid="input-first-name"]').type('  John  ');
        cy.get('[data-testid="input-last-name"]').type('  Doe  ');
        cy.get('[data-testid="button-save-profile"]').click();

        cy.intercept('PUT', `/api/users/${testUsers.admin.id}`).as('updateUser');
        cy.wait('@updateUser').then((interception) => {
          expect(interception.request.body.firstName).to.equal('John');
          expect(interception.request.body.lastName).to.equal('Doe');
        });
      });

      it('should prevent submission with only whitespace', () => {
        cy.get('[data-testid="input-first-name"]').clear().type('   ');
        cy.get('[data-testid="input-last-name"]').clear().type('   ');
        cy.get('[data-testid="button-save-profile"]').click();

        cy.get('[data-testid="error-first-name"]').should('contain.text', 'First name is required');
        cy.get('[data-testid="error-last-name"]').should('contain.text', 'Last name is required');
      });
    });
  });

  describe('User Role Management', () => {
    beforeEach(() => {
      cy.visit('/admin/users');
    });

    describe('User Role Assignment', () => {
      it('should display user role dropdown for admins', () => {
        cy.get('[data-testid="user-row"]').first().within(() => {
          cy.get('[data-testid="role-dropdown"]').should('be.visible');
          cy.get('[data-testid="role-dropdown"]').click();
          
          cy.get('[data-testid="role-option-admin"]').should('be.visible');
          cy.get('[data-testid="role-option-consultant"]').should('be.visible');
          cy.get('[data-testid="role-option-hospital_admin"]').should('be.visible');
        });
      });

      it('should update user role successfully', () => {
        cy.intercept('PATCH', `/api/users/${testUsers.admin.id}/role`, {
          statusCode: 200,
          body: { 
            id: testUsers.admin.id,
            role: 'consultant'
          }
        }).as('updateUserRole');

        cy.get('[data-testid="user-row"]').first().within(() => {
          cy.get('[data-testid="role-dropdown"]').click();
          cy.get('[data-testid="role-option-consultant"]').click();
        });

        cy.get('[data-testid="confirm-role-change-dialog"]').should('be.visible');
        cy.get('[data-testid="confirm-button"]').click();

        cy.wait('@updateUserRole').then((interception) => {
          expect(interception.request.body.role).to.equal('consultant');
        });

        cy.get('[data-testid="success-toast"]').should('contain.text', 'User role updated successfully');
      });

      it('should handle role update error', () => {
        cy.intercept('PATCH', `/api/users/${testUsers.admin.id}/role`, {
          statusCode: 403,
          body: { error: 'Insufficient permissions' }
        }).as('updateRoleError');

        cy.get('[data-testid="user-row"]').first().within(() => {
          cy.get('[data-testid="role-dropdown"]').click();
          cy.get('[data-testid="role-option-admin"]').click();
        });

        cy.get('[data-testid="confirm-button"]').click();
        cy.wait('@updateRoleError');

        cy.get('[data-testid="error-toast"]').should('contain.text', 'Insufficient permissions');
      });

      it('should cancel role change', () => {
        cy.get('[data-testid="user-row"]').first().within(() => {
          cy.get('[data-testid="role-dropdown"]').click();
          cy.get('[data-testid="role-option-consultant"]').click();
        });

        cy.get('[data-testid="confirm-role-change-dialog"]').should('be.visible');
        cy.get('[data-testid="cancel-button"]').click();

        cy.get('[data-testid="confirm-role-change-dialog"]').should('not.exist');
        // Role should remain unchanged
        cy.get('[data-testid="user-row"]').first().within(() => {
          cy.get('[data-testid="current-role"]').should('contain.text', testUsers.admin.role);
        });
      });

      it('should show role permissions in tooltip', () => {
        cy.get('[data-testid="user-row"]').first().within(() => {
          cy.get('[data-testid="role-info-icon"]').trigger('mouseenter');
        });

        cy.get('[data-testid="role-tooltip"]').should('be.visible');
        cy.get('[data-testid="role-permissions"]').should('be.visible');
      });
    });

    describe('Bulk Role Operations', () => {
      it('should allow bulk role assignment', () => {
        cy.get('[data-testid="select-all-users"]').click();
        cy.get('[data-testid="bulk-actions-menu"]').click();
        cy.get('[data-testid="bulk-change-role"]').click();

        cy.get('[data-testid="bulk-role-dialog"]').should('be.visible');
        cy.get('[data-testid="bulk-role-select"]').click();
        cy.get('[data-testid="role-option-consultant"]').click();

        cy.intercept('PATCH', '/api/users/bulk-role-update', {
          statusCode: 200,
          body: { updated: 3 }
        }).as('bulkRoleUpdate');

        cy.get('[data-testid="confirm-bulk-role"]').click();
        cy.wait('@bulkRoleUpdate');

        cy.get('[data-testid="success-toast"]').should('contain.text', '3 users updated successfully');
      });

      it('should handle bulk role update errors', () => {
        cy.get('[data-testid="select-all-users"]').click();
        cy.get('[data-testid="bulk-actions-menu"]').click();
        cy.get('[data-testid="bulk-change-role"]').click();

        cy.intercept('PATCH', '/api/users/bulk-role-update', {
          statusCode: 500,
          body: { error: 'Database error' }
        }).as('bulkRoleError');

        cy.get('[data-testid="bulk-role-select"]').click();
        cy.get('[data-testid="role-option-admin"]').click();
        cy.get('[data-testid="confirm-bulk-role"]').click();

        cy.wait('@bulkRoleError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to update user roles');
      });
    });
  });

  describe('Account Settings', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
    });

    describe('Account Settings UI', () => {
      it('should display account settings sections', () => {
        cy.get('[data-testid="account-settings-container"]').should('be.visible');
        cy.get('[data-testid="general-settings"]').should('be.visible');
        cy.get('[data-testid="notification-settings"]').should('be.visible');
        cy.get('[data-testid="privacy-settings"]').should('be.visible');
        cy.get('[data-testid="security-settings"]').should('be.visible');
        cy.get('[data-testid="danger-zone"]').should('be.visible');
      });

      it('should load current settings', () => {
        cy.intercept('GET', '/api/account/settings', {
          statusCode: 200,
          body: {
            emailNotifications: true,
            smsNotifications: false,
            marketingEmails: true,
            profileVisibility: 'public'
          }
        }).as('getSettings');

        cy.visit('/account/settings');
        cy.wait('@getSettings');

        cy.get('[data-testid="email-notifications"]').should('be.checked');
        cy.get('[data-testid="sms-notifications"]').should('not.be.checked');
        cy.get('[data-testid="marketing-emails"]').should('be.checked');
        cy.get('[data-testid="profile-visibility"]').should('have.value', 'public');
      });
    });

    describe('Notification Settings', () => {
      it('should update notification preferences', () => {
        cy.intercept('PATCH', '/api/account/settings', {
          statusCode: 200,
          body: { message: 'Settings updated' }
        }).as('updateSettings');

        cy.get('[data-testid="email-notifications"]').uncheck();
        cy.get('[data-testid="sms-notifications"]').check();
        cy.get('[data-testid="save-notifications"]').click();

        cy.wait('@updateSettings').then((interception) => {
          expect(interception.request.body).to.include({
            emailNotifications: false,
            smsNotifications: true
          });
        });

        cy.get('[data-testid="success-toast"]').should('contain.text', 'Notification settings updated');
      });

      it('should handle notification settings error', () => {
        cy.intercept('PATCH', '/api/account/settings', {
          statusCode: 400,
          body: { error: 'Invalid settings' }
        }).as('updateSettingsError');

        cy.get('[data-testid="email-notifications"]').uncheck();
        cy.get('[data-testid="save-notifications"]').click();

        cy.wait('@updateSettingsError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Failed to update settings');
      });
    });

    describe('Privacy Settings', () => {
      it('should update privacy preferences', () => {
        cy.intercept('PATCH', '/api/account/settings', {
          statusCode: 200,
          body: { message: 'Privacy settings updated' }
        }).as('updatePrivacy');

        cy.get('[data-testid="profile-visibility"]').select('private');
        cy.get('[data-testid="show-email"]').uncheck();
        cy.get('[data-testid="show-phone"]').check();
        cy.get('[data-testid="save-privacy"]').click();

        cy.wait('@updatePrivacy').then((interception) => {
          expect(interception.request.body).to.include({
            profileVisibility: 'private',
            showEmail: false,
            showPhone: true
          });
        });

        cy.get('[data-testid="success-toast"]').should('contain.text', 'Privacy settings updated');
      });
    });

    describe('Account Deletion', () => {
      it('should request account deletion', () => {
        cy.intercept('POST', '/api/account/delete-request', {
          statusCode: 200,
          body: { message: 'Deletion request submitted' }
        }).as('requestDeletion');

        cy.get('[data-testid="delete-account-button"]').click();
        cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
        
        cy.get('[data-testid="delete-reason"]').select('no_longer_needed');
        cy.get('[data-testid="delete-password"]').type('password123');
        cy.get('[data-testid="confirm-delete"]').click();

        cy.wait('@requestDeletion');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Account deletion requested');
      });

      it('should cancel account deletion request', () => {
        // First request deletion
        cy.intercept('POST', '/api/account/delete-request', {
          statusCode: 200,
          body: { deletionRequestedAt: '2024-01-01T00:00:00Z' }
        }).as('requestDeletion');

        cy.get('[data-testid="delete-account-button"]').click();
        cy.get('[data-testid="delete-reason"]').select('no_longer_needed');
        cy.get('[data-testid="delete-password"]').type('password123');
        cy.get('[data-testid="confirm-delete"]').click();
        cy.wait('@requestDeletion');

        // Then cancel the request
        cy.intercept('DELETE', '/api/account/delete-request', {
          statusCode: 200,
          body: { message: 'Deletion request cancelled' }
        }).as('cancelDeletion');

        cy.get('[data-testid="cancel-deletion-button"]').should('be.visible').click();
        cy.get('[data-testid="confirm-cancel-deletion"]').click();

        cy.wait('@cancelDeletion');
        cy.get('[data-testid="success-toast"]').should('contain.text', 'Deletion request cancelled');
      });

      it('should handle deletion request error', () => {
        cy.intercept('POST', '/api/account/delete-request', {
          statusCode: 400,
          body: { error: 'Invalid password' }
        }).as('deletionError');

        cy.get('[data-testid="delete-account-button"]').click();
        cy.get('[data-testid="delete-reason"]').select('no_longer_needed');
        cy.get('[data-testid="delete-password"]').type('wrongpassword');
        cy.get('[data-testid="confirm-delete"]').click();

        cy.wait('@deletionError');
        cy.get('[data-testid="error-toast"]').should('contain.text', 'Invalid password');
      });

      it('should validate deletion form', () => {
        cy.get('[data-testid="delete-account-button"]').click();
        cy.get('[data-testid="confirm-delete"]').click();

        cy.get('[data-testid="error-reason"]').should('contain.text', 'Please select a reason');
        cy.get('[data-testid="error-password"]').should('contain.text', 'Password is required');
      });
    });
  });

  describe('User Search and Filtering', () => {
    beforeEach(() => {
      cy.visit('/admin/users');
      
      // Mock users list
      cy.intercept('GET', '/api/admin/users*', {
        statusCode: 200,
        body: {
          users: [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'consultant', status: 'active' },
            { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'hospital_admin', status: 'inactive' }
          ],
          total: 3,
          page: 1,
          limit: 10
        }
      }).as('getUsers');
    });

    describe('User Search Functionality', () => {
      it('should search users by name', () => {
        cy.intercept('GET', '/api/admin/users*search=john*', {
          statusCode: 200,
          body: {
            users: [
              { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
              { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'hospital_admin', status: 'inactive' }
            ],
            total: 2
          }
        }).as('searchUsers');

        cy.get('[data-testid="user-search"]').type('john');
        cy.wait('@searchUsers');

        cy.get('[data-testid="user-row"]').should('have.length', 2);
        cy.get('[data-testid="user-row"]').first().should('contain.text', 'John Doe');
        cy.get('[data-testid="user-row"]').last().should('contain.text', 'Bob Johnson');
      });

      it('should search users by email', () => {
        cy.intercept('GET', '/api/admin/users*search=jane@example.com*', {
          statusCode: 200,
          body: {
            users: [
              { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'consultant', status: 'active' }
            ],
            total: 1
          }
        }).as('searchByEmail');

        cy.get('[data-testid="user-search"]').type('jane@example.com');
        cy.wait('@searchByEmail');

        cy.get('[data-testid="user-row"]').should('have.length', 1);
        cy.get('[data-testid="user-row"]').should('contain.text', 'Jane Smith');
      });

      it('should handle empty search results', () => {
        cy.intercept('GET', '/api/admin/users*search=nonexistent*', {
          statusCode: 200,
          body: { users: [], total: 0 }
        }).as('emptySearch');

        cy.get('[data-testid="user-search"]').type('nonexistent');
        cy.wait('@emptySearch');

        cy.get('[data-testid="no-users-found"]').should('be.visible');
        cy.get('[data-testid="no-users-message"]').should('contain.text', 'No users found matching your search');
      });

      it('should clear search results', () => {
        cy.get('[data-testid="user-search"]').type('john');
        cy.wait('@searchUsers');
        
        cy.get('[data-testid="clear-search"]').click();
        cy.wait('@getUsers');

        cy.get('[data-testid="user-row"]').should('have.length', 3);
        cy.get('[data-testid="user-search"]').should('have.value', '');
      });

      it('should debounce search input', () => {
        cy.clock();
        
        cy.get('[data-testid="user-search"]').type('j');
        cy.tick(200);
        cy.get('[data-testid="user-search"]').type('o');
        cy.tick(200);
        cy.get('[data-testid="user-search"]').type('h');
        cy.tick(200);
        cy.get('[data-testid="user-search"]').type('n');
        
        // Should not make API call until debounce period
        cy.get('@searchUsers').should('not.have.been.called');
        
        cy.tick(500);
        cy.wait('@searchUsers');
      });
    });

    describe('User Filtering', () => {
      it('should filter users by role', () => {
        cy.intercept('GET', '/api/admin/users*role=consultant*', {
          statusCode: 200,
          body: {
            users: [
              { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'consultant', status: 'active' }
            ],
            total: 1
          }
        }).as('filterByRole');

        cy.get('[data-testid="role-filter"]').click();
        cy.get('[data-testid="role-option-consultant"]').click();

        cy.wait('@filterByRole');
        cy.get('[data-testid="user-row"]').should('have.length', 1);
        cy.get('[data-testid="user-role"]').should('contain.text', 'consultant');
      });

      it('should filter users by status', () => {
        cy.intercept('GET', '/api/admin/users*status=inactive*', {
          statusCode: 200,
          body: {
            users: [
              { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'hospital_admin', status: 'inactive' }
            ],
            total: 1
          }
        }).as('filterByStatus');

        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="status-option-inactive"]').click();

        cy.wait('@filterByStatus');
        cy.get('[data-testid="user-row"]').should('have.length', 1);
        cy.get('[data-testid="user-status"]').should('contain.text', 'inactive');
      });

      it('should combine multiple filters', () => {
        cy.intercept('GET', '/api/admin/users*role=admin&status=active*', {
          statusCode: 200,
          body: {
            users: [
              { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' }
            ],
            total: 1
          }
        }).as('multipleFilters');

        cy.get('[data-testid="role-filter"]').click();
        cy.get('[data-testid="role-option-admin"]').click();
        
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="status-option-active"]').click();

        cy.wait('@multipleFilters');
        cy.get('[data-testid="user-row"]').should('have.length', 1);
      });

      it('should clear all filters', () => {
        // Apply filters first
        cy.get('[data-testid="role-filter"]').click();
        cy.get('[data-testid="role-option-admin"]').click();
        
        // Clear filters
        cy.get('[data-testid="clear-filters"]').click();
        cy.wait('@getUsers');

        cy.get('[data-testid="user-row"]').should('have.length', 3);
        cy.get('[data-testid="role-filter"]').should('contain.text', 'All Roles');
        cy.get('[data-testid="status-filter"]').should('contain.text', 'All Status');
      });
    });

    describe('User Sorting', () => {
      it('should sort users by name', () => {
        cy.intercept('GET', '/api/admin/users*sortBy=name&sortOrder=asc*', {
          statusCode: 200,
          body: {
            users: [
              { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'hospital_admin' },
              { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'consultant' },
              { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' }
            ],
            total: 3
          }
        }).as('sortByName');

        cy.get('[data-testid="sort-name"]').click();
        cy.wait('@sortByName');

        cy.get('[data-testid="user-row"]').first().should('contain.text', 'Bob Johnson');
        cy.get('[data-testid="user-row"]').last().should('contain.text', 'John Doe');
      });

      it('should toggle sort order', () => {
        cy.intercept('GET', '/api/admin/users*sortBy=name&sortOrder=desc*', {
          statusCode: 200,
          body: {
            users: [
              { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
              { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'consultant' },
              { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'hospital_admin' }
            ],
            total: 3
          }
        }).as('sortByNameDesc');

        cy.get('[data-testid="sort-name"]').click(); // First click - asc
        cy.get('[data-testid="sort-name"]').click(); // Second click - desc
        
        cy.wait('@sortByNameDesc');
        cy.get('[data-testid="user-row"]').first().should('contain.text', 'John Doe');
      });

      it('should sort by different columns', () => {
        cy.intercept('GET', '/api/admin/users*sortBy=email*', {
          statusCode: 200,
          body: { users: [], total: 0 }
        }).as('sortByEmail');

        cy.get('[data-testid="sort-email"]').click();
        cy.wait('@sortByEmail');

        cy.get('[data-testid="sort-email"]').should('have.class', 'active');
      });
    });
  });

  describe('User Pagination', () => {
    beforeEach(() => {
      cy.visit('/admin/users');
    });

    it('should display pagination controls', () => {
      cy.intercept('GET', '/api/admin/users*', {
        statusCode: 200,
        body: {
          users: new Array(10).fill(null).map((_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: 'consultant'
          })),
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5
        }
      }).as('getUsersPage1');

      cy.wait('@getUsersPage1');

      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 1-10 of 50');
      cy.get('[data-testid="prev-page"]').should('be.disabled');
      cy.get('[data-testid="next-page"]').should('not.be.disabled');
      cy.get('[data-testid="page-numbers"]').should('be.visible');
    });

    it('should navigate to next page', () => {
      cy.intercept('GET', '/api/admin/users*page=2*', {
        statusCode: 200,
        body: {
          users: new Array(10).fill(null).map((_, i) => ({
            id: i + 11,
            name: `User ${i + 11}`,
            email: `user${i + 11}@example.com`,
            role: 'consultant'
          })),
          total: 50,
          page: 2,
          limit: 10,
          totalPages: 5
        }
      }).as('getUsersPage2');

      cy.get('[data-testid="next-page"]').click();
      cy.wait('@getUsersPage2');

      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 11-20 of 50');
      cy.get('[data-testid="current-page"]').should('contain.text', '2');
    });

    it('should navigate to specific page', () => {
      cy.intercept('GET', '/api/admin/users*page=3*', {
        statusCode: 200,
        body: {
          users: new Array(10).fill(null).map((_, i) => ({
            id: i + 21,
            name: `User ${i + 21}`,
            email: `user${i + 21}@example.com`,
            role: 'consultant'
          })),
          total: 50,
          page: 3,
          limit: 10,
          totalPages: 5
        }
      }).as('getUsersPage3');

      cy.get('[data-testid="page-3"]').click();
      cy.wait('@getUsersPage3');

      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 21-30 of 50');
      cy.get('[data-testid="current-page"]').should('contain.text', '3');
    });

    it('should change page size', () => {
      cy.intercept('GET', '/api/admin/users*limit=25*', {
        statusCode: 200,
        body: {
          users: new Array(25).fill(null).map((_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: 'consultant'
          })),
          total: 50,
          page: 1,
          limit: 25,
          totalPages: 2
        }
      }).as('getUsersPageSize25');

      cy.get('[data-testid="page-size-select"]').click();
      cy.get('[data-testid="page-size-25"]').click();

      cy.wait('@getUsersPageSize25');
      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 1-25 of 50');
      cy.get('[data-testid="user-row"]').should('have.length', 25);
    });

    it('should handle last page correctly', () => {
      cy.intercept('GET', '/api/admin/users*page=5*', {
        statusCode: 200,
        body: {
          users: new Array(10).fill(null).map((_, i) => ({
            id: i + 41,
            name: `User ${i + 41}`,
            email: `user${i + 41}@example.com`,
            role: 'consultant'
          })),
          total: 50,
          page: 5,
          limit: 10,
          totalPages: 5
        }
      }).as('getUsersPage5');

      cy.get('[data-testid="page-5"]').click();
      cy.wait('@getUsersPage5');

      cy.get('[data-testid="page-info"]').should('contain.text', 'Showing 41-50 of 50');
      cy.get('[data-testid="next-page"]').should('be.disabled');
      cy.get('[data-testid="prev-page"]').should('not.be.disabled');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should display correctly on mobile devices', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="profile-avatar"]').should('be.visible');
      
      // Check that edit button is accessible
      cy.get('[data-testid="edit-profile-button"]').should('be.visible');
      cy.get('[data-testid="edit-profile-button"]').click();
      
      // Form should be usable on mobile
      cy.get('[data-testid="edit-profile-form"]').should('be.visible');
      cy.get('[data-testid="input-first-name"]').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="profile-sections"]').should('be.visible');
      
      // Sections should stack properly on tablet
      cy.get('[data-testid="personal-info-section"]').should('be.visible');
      cy.get('[data-testid="contact-info-section"]').should('be.visible');
    });

    it('should display correctly on desktop', () => {
      cy.viewport(1920, 1080);
      
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="profile-sidebar"]').should('be.visible');
      cy.get('[data-testid="profile-main-content"]').should('be.visible');
      
      // Desktop layout should show side navigation
      cy.get('[data-testid="profile-nav"]').should('be.visible');
    });

    it('should handle orientation changes', () => {
      cy.viewport('iphone-x');
      cy.orientation('landscape');
      
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="edit-profile-button"]').should('be.visible');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/profile');
      cy.wait('@networkError');
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      cy.get('[data-testid="offline-indicator"]').should('be.visible');
    });

    it('should handle server errors', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.visit('/profile');
      cy.wait('@serverError');
      
      cy.get('[data-testid="server-error"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Something went wrong');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('unauthorizedError');
      
      cy.visit('/profile');
      cy.wait('@unauthorizedError');
      
      cy.url().should('include', '/login');
      cy.get('[data-testid="auth-error"]').should('contain.text', 'Please log in to continue');
    });

    it('should handle malformed data', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { invalidData: true }
      }).as('malformedData');
      
      cy.visit('/profile');
      cy.wait('@malformedData');
      
      cy.get('[data-testid="data-error"]').should('be.visible');
      cy.get('[data-testid="fallback-ui"]').should('be.visible');
    });

    it('should handle slow network connections', () => {
      cy.intercept('GET', '/api/auth/user', (req) => {
        req.reply((res) => {
          res.delay(5000);
          res.send({ statusCode: 200, body: testUsers.admin });
        });
      }).as('slowRequest');
      
      cy.visit('/profile');
      
      // Should show loading state
      cy.get('[data-testid="profile-loading"]').should('be.visible');
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      
      cy.wait('@slowRequest', { timeout: 10000 });
      cy.get('[data-testid="profile-container"]').should('be.visible');
    });

    it('should handle browser storage limitations', () => {
      // Fill up localStorage to simulate storage limit
      cy.window().then((win) => {
        try {
          for (let i = 0; i < 1000; i++) {
            win.localStorage.setItem(`test-key-${i}`, 'x'.repeat(1000));
          }
        } catch (e) {
          // Storage limit reached
        }
      });

      cy.visit('/profile/edit');
      
      // Should handle storage errors gracefully
      cy.get('[data-testid="input-first-name"]').type('Test Name');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="storage-warning"]').should('be.visible');
    });
  });
});
