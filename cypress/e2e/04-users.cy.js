describe('Users Management System', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'password123',
      id: 'ci-test-user'
    },
    newUser: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'consultant'
    },
    updateUser: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    },
    invalidUser: {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      role: ''
    },
    profilePhoto: 'test-profile.jpg',
    coverPhoto: 'test-cover.jpg'
  };

  before(() => {
    // Ensure test data exists
    cy.task('seedTestData');
  });

  beforeEach(() => {
    // Login as admin before each test
    cy.loginAsAdmin();
    
    // Setup API interceptors
    cy.intercept('GET', '/api/auth/user').as('getCurrentUser');
    cy.intercept('PUT', '/api/users/*').as('updateUser');
    cy.intercept('PATCH', '/api/users/*/role').as('updateUserRole');
    cy.intercept('GET', '/api/dashboard/stats').as('getDashboardStats');
    cy.intercept('POST', '/api/objects/upload').as('uploadFile');
    cy.intercept('PUT', '/api/users/*/profile-photo').as('updateProfilePhoto');
    cy.intercept('PUT', '/api/users/*/cover-photo').as('updateCoverPhoto');
  });

  describe('User Profile Management', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.wait('@getCurrentUser');
    });

    it('should display user profile page with all elements', () => {
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="profile-header"]').should('be.visible');
      cy.get('[data-testid="profile-avatar"]').should('be.visible');
      cy.get('[data-testid="profile-name"]').should('be.visible');
      cy.get('[data-testid="profile-email"]').should('be.visible');
      cy.get('[data-testid="profile-role"]').should('be.visible');
      cy.get('[data-testid="edit-profile-button"]').should('be.visible');
    });

    it('should display profile information correctly', () => {
      cy.get('[data-testid="profile-name"]').should('not.be.empty');
      cy.get('[data-testid="profile-email"]').should('contain', '@');
      cy.get('[data-testid="profile-role"]').should('be.visible');
      cy.get('[data-testid="profile-created-date"]').should('be.visible');
    });

    it('should handle profile photo upload', () => {
      cy.get('[data-testid="profile-photo-upload-trigger"]').click();
      cy.get('[data-testid="file-upload-dialog"]').should('be.visible');
      
      // Mock file upload
      cy.fixture('images/profile.jpg', 'base64').then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'profile.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });

      cy.get('[data-testid="upload-button"]').click();
      cy.wait('@uploadFile').its('response.statusCode').should('eq', 200);
      cy.wait('@updateProfilePhoto').its('response.statusCode').should('eq', 200);
      
      cy.get('[data-testid="success-toast"]').should('be.visible')
        .and('contain', 'Profile photo updated successfully');
    });

    it('should handle cover photo upload', () => {
      cy.get('[data-testid="cover-photo-upload-trigger"]').click();
      cy.get('[data-testid="file-upload-dialog"]').should('be.visible');
      
      cy.fixture('images/cover.jpg', 'base64').then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'cover.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });

      cy.get('[data-testid="upload-button"]').click();
      cy.wait('@uploadFile').its('response.statusCode').should('eq', 200);
      cy.wait('@updateCoverPhoto').its('response.statusCode').should('eq', 200);
      
      cy.get('[data-testid="success-toast"]').should('be.visible')
        .and('contain', 'Cover photo updated successfully');
    });

    it('should validate file upload restrictions', () => {
      cy.get('[data-testid="profile-photo-upload-trigger"]').click();
      
      // Test invalid file type
      cy.fixture('documents/test.pdf', 'base64').then(fileContent => {
        cy.get('[data-testid="file-upload-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'test.pdf',
          mimeType: 'application/pdf'
        }, { force: true });
      });

      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain', 'Only image files are allowed');
    });

    it('should handle large file size validation', () => {
      cy.get('[data-testid="profile-photo-upload-trigger"]').click();
      
      // Create a large mock file (>5MB)
      const largeFile = new Array(5 * 1024 * 1024 + 1).join('a');
      cy.get('[data-testid="file-upload-input"]').selectFile({
        contents: largeFile,
        fileName: 'large-image.jpg',
        mimeType: 'image/jpeg'
      }, { force: true });

      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain', 'File size must be less than 5MB');
    });
  });

  describe('Edit Profile Form', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.wait('@getCurrentUser');
      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="edit-profile-dialog"]').should('be.visible');
    });

    it('should display edit profile form with current data', () => {
      cy.get('[data-testid="input-first-name"]').should('be.visible').and('not.have.value', '');
      cy.get('[data-testid="input-last-name"]').should('be.visible').and('not.have.value', '');
      cy.get('[data-testid="input-email"]').should('be.visible').and('not.have.value', '');
      cy.get('[data-testid="input-phone"]').should('be.visible');
      cy.get('[data-testid="textarea-bio"]').should('be.visible');
      cy.get('[data-testid="button-save-profile"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should successfully update profile information', () => {
      cy.get('[data-testid="input-first-name"]').clear().type(testData.updateUser.firstName);
      cy.get('[data-testid="input-last-name"]').clear().type(testData.updateUser.lastName);
      cy.get('[data-testid="input-phone"]').clear().type('+1234567890');
      cy.get('[data-testid="textarea-bio"]').clear().type('Updated bio information');

      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@updateUser').its('response.statusCode').should('eq', 200);
      
      cy.get('[data-testid="success-toast"]').should('be.visible')
        .and('contain', 'Profile updated successfully');
      cy.get('[data-testid="edit-profile-dialog"]').should('not.exist');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      cy.get('[data-testid="input-email"]').clear();

      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-first-name"]').should('be.visible')
        .and('contain', 'First name is required');
      cy.get('[data-testid="error-last-name"]').should('be.visible')
        .and('contain', 'Last name is required');
      cy.get('[data-testid="error-email"]').should('be.visible')
        .and('contain', 'Email is required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]').clear().type('invalid-email');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-email"]').should('be.visible')
        .and('contain', 'Please enter a valid email address');
    });

    it('should validate phone number format', () => {
      cy.get('[data-testid="input-phone"]').clear().type('invalid-phone');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-phone"]').should('be.visible')
        .and('contain', 'Please enter a valid phone number');
    });

    it('should handle form cancellation', () => {
      cy.get('[data-testid="input-first-name"]').clear().type('Changed Name');
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="edit-profile-dialog"]').should('not.exist');
      
      // Verify changes were not saved
      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="input-first-name"]').should('not.have.value', 'Changed Name');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('PUT', '/api/users/*', { statusCode: 500, body: { error: 'Server error' } }).as('updateUserError');

      cy.get('[data-testid="input-first-name"]').clear().type('Test Name');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateUserError');
      cy.get('[data-testid="error-toast"]').should('be.visible')
        .and('contain', 'Failed to update profile');
    });

    it('should handle keyboard navigation', () => {
      cy.get('[data-testid="input-first-name"]').should('be.focused');
      cy.get('[data-testid="input-first-name"]').tab();
      cy.get('[data-testid="input-last-name"]').should('be.focused');
      cy.get('[data-testid="input-last-name"]').tab();
      cy.get('[data-testid="input-email"]').should('be.focused');
    });

    it('should close dialog on Escape key', () => {
      cy.get('[data-testid="edit-profile-dialog"]').type('{esc}');
      cy.get('[data-testid="edit-profile-dialog"]').should('not.exist');
    });
  });

  describe('Account Settings', () => {
    beforeEach(() => {
      cy.visit('/account/settings');
      cy.intercept('GET', '/api/account/settings').as('getSettings');
      cy.intercept('PATCH', '/api/account/settings').as('updateSettings');
      cy.intercept('POST', '/api/account/delete-request').as('requestDelete');
      cy.intercept('DELETE', '/api/account/delete-request').as('cancelDelete');
      cy.wait('@getSettings');
    });

    it('should display account settings page', () => {
      cy.get('[data-testid="settings-page"]').should('be.visible');
      cy.get('[data-testid="settings-header"]').should('contain', 'Account Settings');
      cy.get('[data-testid="settings-tabs"]').should('be.visible');
      cy.get('[data-testid="tab-general"]').should('be.visible');
      cy.get('[data-testid="tab-security"]').should('be.visible');
      cy.get('[data-testid="tab-notifications"]').should('be.visible');
      cy.get('[data-testid="tab-privacy"]').should('be.visible');
    });

    it('should navigate between settings tabs', () => {
      // Test General tab
      cy.get('[data-testid="tab-general"]').click();
      cy.get('[data-testid="general-settings"]').should('be.visible');

      // Test Security tab
      cy.get('[data-testid="tab-security"]').click();
      cy.get('[data-testid="security-settings"]').should('be.visible');

      // Test Notifications tab
      cy.get('[data-testid="tab-notifications"]').click();
      cy.get('[data-testid="notification-settings"]').should('be.visible');

      // Test Privacy tab
      cy.get('[data-testid="tab-privacy"]').click();
      cy.get('[data-testid="privacy-settings"]').should('be.visible');
    });

    describe('General Settings', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-general"]').click();
      });

      it('should display general settings form', () => {
        cy.get('[data-testid="input-timezone"]').should('be.visible');
        cy.get('[data-testid="input-language"]').should('be.visible');
        cy.get('[data-testid="input-date-format"]').should('be.visible');
        cy.get('[data-testid="input-time-format"]').should('be.visible');
      });

      it('should update general settings', () => {
        cy.get('[data-testid="select-timezone"]').click();
        cy.get('[data-testid="option-est"]').click();
        
        cy.get('[data-testid="select-language"]').click();
        cy.get('[data-testid="option-en"]').click();

        cy.get('[data-testid="button-save-general"]').click();
        cy.wait('@updateSettings').its('response.statusCode').should('eq', 200);
        
        cy.get('[data-testid="success-toast"]').should('be.visible')
          .and('contain', 'Settings updated successfully');
      });
    });

    describe('Security Settings', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-security"]').click();
      });

      it('should display security settings', () => {
        cy.get('[data-testid="change-password-section"]').should('be.visible');
        cy.get('[data-testid="two-factor-section"]').should('be.visible');
        cy.get('[data-testid="session-management-section"]').should('be.visible');
      });

      it('should handle password change', () => {
        cy.get('[data-testid="button-change-password"]').click();
        cy.get('[data-testid="change-password-dialog"]').should('be.visible');

        cy.get('[data-testid="input-current-password"]').type('currentPassword123');
        cy.get('[data-testid="input-new-password"]').type('newPassword123');
        cy.get('[data-testid="input-confirm-password"]').type('newPassword123');

        cy.intercept('POST', '/api/auth/change-password').as('changePassword');
        cy.get('[data-testid="button-confirm-change"]').click();
        
        cy.wait('@changePassword').its('response.statusCode').should('eq', 200);
        cy.get('[data-testid="success-toast"]').should('be.visible')
          .and('contain', 'Password changed successfully');
      });

      it('should validate password requirements', () => {
        cy.get('[data-testid="button-change-password"]').click();
        
        cy.get('[data-testid="input-new-password"]').type('weak');
        cy.get('[data-testid="error-password-strength"]').should('be.visible')
          .and('contain', 'Password must be at least 8 characters');

        cy.get('[data-testid="input-new-password"]').clear().type('strongPassword123');
        cy.get('[data-testid="input-confirm-password"]').type('differentPassword123');
        
        cy.get('[data-testid="error-password-match"]').should('be.visible')
          .and('contain', 'Passwords do not match');
      });
    });

    describe('Notification Settings', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-notifications"]').click();
      });

      it('should display notification preferences', () => {
        cy.get('[data-testid="email-notifications-section"]').should('be.visible');
        cy.get('[data-testid="push-notifications-section"]').should('be.visible');
        cy.get('[data-testid="sms-notifications-section"]').should('be.visible');
      });

      it('should toggle notification preferences', () => {
        cy.get('[data-testid="toggle-email-notifications"]').click();
        cy.get('[data-testid="toggle-push-notifications"]').click();
        
        cy.get('[data-testid="button-save-notifications"]').click();
        cy.wait('@updateSettings').its('response.statusCode').should('eq', 200);
        
        cy.get('[data-testid="success-toast"]').should('be.visible');
      });
    });

    describe('Privacy Settings', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-privacy"]').click();
      });

      it('should display privacy controls', () => {
        cy.get('[data-testid="profile-visibility-section"]').should('be.visible');
        cy.get('[data-testid="data-sharing-section"]').should('be.visible');
        cy.get('[data-testid="account-deletion-section"]').should('be.visible');
      });

      it('should handle account deletion request', () => {
        cy.get('[data-testid="button-request-deletion"]').click();
        cy.get('[data-testid="deletion-confirmation-dialog"]').should('be.visible');

        cy.get('[data-testid="input-deletion-reason"]').type('No longer needed');
        cy.get('[data-testid="checkbox-understand-consequences"]').check();
        
        cy.get('[data-testid="button-confirm-deletion"]').click();
        cy.wait('@requestDelete').its('response.statusCode').should('eq', 200);
        
        cy.get('[data-testid="success-toast"]').should('be.visible')
          .and('contain', 'Account deletion request submitted');
      });

      it('should handle deletion request cancellation', () => {
        // First create a deletion request
        cy.get('[data-testid="button-request-deletion"]').click();
        cy.get('[data-testid="input-deletion-reason"]').type('Test reason');
        cy.get('[data-testid="checkbox-understand-consequences"]').check();
        cy.get('[data-testid="button-confirm-deletion"]').click();
        cy.wait('@requestDelete');

        // Then cancel it
        cy.get('[data-testid="button-cancel-deletion"]').click();
        cy.wait('@cancelDelete').its('response.statusCode').should('eq', 200);
        
        cy.get('[data-testid="success-toast"]').should('be.visible')
          .and('contain', 'Account deletion request cancelled');
      });
    });
  });

  describe('User Role Management (Admin Only)', () => {
    beforeEach(() => {
      cy.visit('/admin/users');
      cy.intercept('GET', '/api/admin/users').as('getUsers');
      cy.wait('@getUsers');
    });

    it('should display users management page', () => {
      cy.get('[data-testid="users-management-page"]').should('be.visible');
      cy.get('[data-testid="users-table"]').should('be.visible');
      cy.get('[data-testid="search-users"]').should('be.visible');
      cy.get('[data-testid="filter-role"]').should('be.visible');
      cy.get('[data-testid="button-invite-user"]').should('be.visible');
    });

    it('should search for users', () => {
      cy.intercept('GET', '/api/admin/users?search=*').as('searchUsers');
      
      cy.get('[data-testid="search-users"]').type('john');
      cy.wait('@searchUsers');
      
      cy.get('[data-testid="users-table-row"]').should('have.length.greaterThan', 0);
      cy.get('[data-testid="user-name"]').should('contain', 'john');
    });

    it('should filter users by role', () => {
      cy.intercept('GET', '/api/admin/users?role=*').as('filterUsers');
      
      cy.get('[data-testid="filter-role"]').click();
      cy.get('[data-testid="option-consultant"]').click();
      
      cy.wait('@filterUsers');
      cy.get('[data-testid="user-role"]').should('contain', 'Consultant');
    });

    it('should update user role', () => {
      cy.get('[data-testid="users-table-row"]').first().within(() => {
        cy.get('[data-testid="role-select"]').click();
      });
      
      cy.get('[data-testid="option-admin"]').click();
      cy.get('[data-testid="confirm-role-change"]').click();
      
      cy.wait('@updateUserRole').its('response.statusCode').should('eq', 200);
      cy.get('[data-testid="success-toast"]').should('be.visible')
        .and('contain', 'User role updated successfully');
    });

    it('should handle bulk user operations', () => {
      cy.get('[data-testid="select-all-users"]').check();
      cy.get('[data-testid="bulk-actions-menu"]').click();
      cy.get('[data-testid="bulk-action-export"]').click();
      
      cy.get('[data-testid="success-toast"]').should('be.visible')
        .and('contain', 'Users exported successfully');
    });
  });

  describe('User Dashboard Stats', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.wait('@getDashboardStats');
    });

    it('should display dashboard with user stats', () => {
      cy.get('[data-testid="dashboard-page"]').should('be.visible');
      cy.get('[data-testid="stats-card-total-users"]').should('be.visible');
      cy.get('[data-testid="stats-card-active-users"]').should('be.visible');
      cy.get('[data-testid="stats-card-new-users"]').should('be.visible');
    });

    it('should display correct user statistics', () => {
      cy.get('[data-testid="stat-total-users"]').should('contain.match', /^\d+$/);
      cy.get('[data-testid="stat-active-users"]').should('contain.match', /^\d+$/);
      cy.get('[data-testid="stat-new-users"]').should('contain.match', /^\d+$/);
    });

    it('should handle loading and error states', () => {
      cy.intercept('GET', '/api/dashboard/stats', { delay: 2000 }).as('slowStats');
      cy.reload();
      
      cy.get('[data-testid="stats-loading"]').should('be.visible');
      cy.wait('@slowStats');
      cy.get('[data-testid="stats-loading"]').should('not.exist');
    });

    it('should handle stats API error', () => {
      cy.intercept('GET', '/api/dashboard/stats', { statusCode: 500 }).as('statsError');
      cy.reload();
      
      cy.wait('@statsError');
      cy.get('[data-testid="stats-error"]').should('be.visible')
        .and('contain', 'Unable to load dashboard statistics');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { device: 'mobile', width: 375, height: 667 },
      { device: 'tablet', width: 768, height: 1024 },
      { device: 'desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ device, width, height }) => {
      describe(`${device} viewport`, () => {
        beforeEach(() => {
          cy.viewport(width, height);
          cy.visit('/profile');
        });

        it(`should display correctly on ${device}`, () => {
          cy.get('[data-testid="profile-page"]').should('be.visible');
          
          if (device === 'mobile') {
            cy.get('[data-testid="mobile-menu-trigger"]').should('be.visible');
          } else {
            cy.get('[data-testid="desktop-navigation"]').should('be.visible');
          }
        });

        it(`should handle forms correctly on ${device}`, () => {
          cy.get('[data-testid="edit-profile-button"]').click();
          cy.get('[data-testid="edit-profile-dialog"]').should('be.visible');
          
          if (device === 'mobile') {
            cy.get('[data-testid="edit-profile-dialog"]').should('have.class', 'mobile-dialog');
          }
        });
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.injectAxe();
    });

    it('should not have accessibility violations', () => {
      cy.checkA11y();
    });

    it('should support screen reader navigation', () => {
      cy.get('[data-testid="profile-page"]').should('have.attr', 'role', 'main');
      cy.get('[data-testid="profile-header"]').should('have.attr', 'aria-labelledby');
      cy.get('[data-testid="edit-profile-button"]').should('have.attr', 'aria-describedby');
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'skip-to-main');
      
      cy.tab();
      cy.focused().should('be.visible');
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { forceNetworkError: true }).as('networkError');
      cy.visit('/profile');
      
      cy.get('[data-testid="error-boundary"]').should('be.visible')
        .and('contain', 'Something went wrong');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle empty user data', () => {
      cy.intercept('GET', '/api/auth/user', { body: null }).as('emptyUser');
      cy.visit('/profile');
      
      cy.wait('@emptyUser');
      cy.get('[data-testid="empty-profile-state"]').should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', '/api/auth/user', { body: { invalid: 'data' } }).as('malformedUser');
      cy.visit('/profile');
      
      cy.wait('@malformedUser');
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should handle session expiration', () => {
      cy.intercept('GET', '/api/auth/user', { statusCode: 401 }).as('unauthorized');
      cy.visit('/profile');
      
      cy.wait('@unauthorized');
      cy.url().should('include', '/login');
      cy.get('[data-testid="session-expired-message"]').should('be.visible');
    });
  });
});
