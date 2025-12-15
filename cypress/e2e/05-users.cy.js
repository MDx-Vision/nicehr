describe('Users Management System', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'password123'
    },
    newUser: {
      email: 'newuser@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      role: 'consultant'
    },
    updateUser: {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0456',
      email: 'updated@example.com'
    },
    invalidData: {
      email: 'invalid-email',
      phone: 'invalid-phone',
      firstName: '',
      lastName: ''
    }
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type(testData.admin.email);
    cy.get('[data-testid="input-password"]').type(testData.admin.password);
    cy.get('[data-testid="button-login"]').click();
    cy.wait(1000);
  });

  describe('User Profile Management', () => {
    describe('Current User Profile', () => {
      beforeEach(() => {
        cy.intercept('GET', '/api/auth/user').as('getCurrentUser');
        cy.visit('/profile');
        cy.wait('@getCurrentUser');
      });

      it('should display current user profile page', () => {
        cy.get('[data-testid="profile-page"]').should('be.visible');
        cy.get('[data-testid="profile-header"]').should('be.visible');
        cy.get('[data-testid="profile-avatar"]').should('be.visible');
        cy.get('[data-testid="profile-name"]').should('be.visible');
        cy.get('[data-testid="profile-email"]').should('be.visible');
        cy.get('[data-testid="profile-role"]').should('be.visible');
      });

      it('should show profile edit form', () => {
        cy.get('[data-testid="button-edit-profile"]').click();
        cy.get('[data-testid="profile-edit-form"]').should('be.visible');
        cy.get('[data-testid="input-first-name"]').should('be.visible');
        cy.get('[data-testid="input-last-name"]').should('be.visible');
        cy.get('[data-testid="input-email"]').should('be.visible');
        cy.get('[data-testid="input-phone"]').should('be.visible');
        cy.get('[data-testid="button-save-profile"]').should('be.visible');
        cy.get('[data-testid="button-cancel-edit"]').should('be.visible');
      });

      it('should update profile information successfully', () => {
        cy.intercept('PUT', '/api/users/*').as('updateProfile');
        
        cy.get('[data-testid="button-edit-profile"]').click();
        cy.get('[data-testid="input-first-name"]').clear().type(testData.updateUser.firstName);
        cy.get('[data-testid="input-last-name"]').clear().type(testData.updateUser.lastName);
        cy.get('[data-testid="input-phone"]').clear().type(testData.updateUser.phone);
        
        cy.get('[data-testid="button-save-profile"]').click();
        cy.wait('@updateProfile');
        
        cy.get('[data-testid="toast-success"]').should('be.visible');
        cy.get('[data-testid="profile-name"]').should('contain', `${testData.updateUser.firstName} ${testData.updateUser.lastName}`);
      });

      it('should validate profile form fields', () => {
        cy.get('[data-testid="button-edit-profile"]').click();
        
        // Test required fields
        cy.get('[data-testid="input-first-name"]').clear();
        cy.get('[data-testid="input-last-name"]').clear();
        cy.get('[data-testid="button-save-profile"]').click();
        
        cy.get('[data-testid="error-first-name"]').should('contain', 'First name is required');
        cy.get('[data-testid="error-last-name"]').should('contain', 'Last name is required');
        
        // Test email validation
        cy.get('[data-testid="input-email"]').clear().type(testData.invalidData.email);
        cy.get('[data-testid="button-save-profile"]').click();
        cy.get('[data-testid="error-email"]').should('contain', 'Invalid email format');
        
        // Test phone validation
        cy.get('[data-testid="input-phone"]').clear().type(testData.invalidData.phone);
        cy.get('[data-testid="button-save-profile"]').click();
        cy.get('[data-testid="error-phone"]').should('contain', 'Invalid phone number');
      });

      it('should cancel profile editing', () => {
        cy.get('[data-testid="button-edit-profile"]').click();
        cy.get('[data-testid="input-first-name"]').clear().type('Changed Name');
        cy.get('[data-testid="button-cancel-edit"]').click();
        
        cy.get('[data-testid="profile-edit-form"]').should('not.exist');
        cy.get('[data-testid="profile-name"]').should('not.contain', 'Changed Name');
      });

      it('should handle profile photo upload', () => {
        cy.intercept('PUT', '/api/users/*/profile-photo').as('uploadProfilePhoto');
        
        cy.get('[data-testid="profile-avatar"]').click();
        cy.get('[data-testid="photo-upload-modal"]').should('be.visible');
        
        // Mock file upload
        cy.fixture('test-avatar.jpg', 'base64').then(fileContent => {
          cy.get('[data-testid="file-input-photo"]').selectFile({
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: 'avatar.jpg',
            mimeType: 'image/jpeg'
          }, { force: true });
        });
        
        cy.get('[data-testid="button-upload-photo"]').click();
        cy.wait('@uploadProfilePhoto');
        
        cy.get('[data-testid="toast-success"]').should('contain', 'Profile photo updated');
        cy.get('[data-testid="photo-upload-modal"]').should('not.exist');
      });

      it('should handle cover photo upload', () => {
        cy.intercept('PUT', '/api/users/*/cover-photo').as('uploadCoverPhoto');
        
        cy.get('[data-testid="cover-photo-section"]').should('be.visible');
        cy.get('[data-testid="button-change-cover"]').click();
        
        cy.fixture('test-cover.jpg', 'base64').then(fileContent => {
          cy.get('[data-testid="file-input-cover"]').selectFile({
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: 'cover.jpg',
            mimeType: 'image/jpeg'
          }, { force: true });
        });
        
        cy.get('[data-testid="button-upload-cover"]').click();
        cy.wait('@uploadCoverPhoto');
        
        cy.get('[data-testid="toast-success"]').should('contain', 'Cover photo updated');
      });

      it('should validate file upload restrictions', () => {
        cy.get('[data-testid="profile-avatar"]').click();
        
        // Test file size limit
        cy.fixture('large-file.pdf', 'base64').then(fileContent => {
          cy.get('[data-testid="file-input-photo"]').selectFile({
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: 'large.pdf',
            mimeType: 'application/pdf'
          }, { force: true });
        });
        
        cy.get('[data-testid="error-file-type"]').should('contain', 'Only image files are allowed');
        cy.get('[data-testid="button-upload-photo"]').should('be.disabled');
      });
    });

    describe('Account Settings', () => {
      beforeEach(() => {
        cy.intercept('GET', '/api/account/settings').as('getAccountSettings');
        cy.visit('/settings');
        cy.wait('@getAccountSettings');
      });

      it('should display account settings page', () => {
        cy.get('[data-testid="settings-page"]').should('be.visible');
        cy.get('[data-testid="settings-nav"]').should('be.visible');
        cy.get('[data-testid="settings-content"]').should('be.visible');
      });

      it('should navigate between settings sections', () => {
        cy.get('[data-testid="nav-profile-settings"]').click();
        cy.get('[data-testid="profile-settings-section"]').should('be.visible');
        
        cy.get('[data-testid="nav-security-settings"]').click();
        cy.get('[data-testid="security-settings-section"]').should('be.visible');
        
        cy.get('[data-testid="nav-notification-settings"]').click();
        cy.get('[data-testid="notification-settings-section"]').should('be.visible');
        
        cy.get('[data-testid="nav-privacy-settings"]').click();
        cy.get('[data-testid="privacy-settings-section"]').should('be.visible');
      });

      it('should update account settings', () => {
        cy.intercept('PATCH', '/api/account/settings').as('updateSettings');
        
        cy.get('[data-testid="nav-notification-settings"]').click();
        cy.get('[data-testid="checkbox-email-notifications"]').uncheck();
        cy.get('[data-testid="checkbox-sms-notifications"]').check();
        
        cy.get('[data-testid="button-save-settings"]').click();
        cy.wait('@updateSettings');
        
        cy.get('[data-testid="toast-success"]').should('contain', 'Settings updated successfully');
      });

      it('should handle password change', () => {
        cy.get('[data-testid="nav-security-settings"]').click();
        cy.get('[data-testid="button-change-password"]').click();
        
        cy.get('[data-testid="password-change-modal"]').should('be.visible');
        cy.get('[data-testid="input-current-password"]').type('currentpassword');
        cy.get('[data-testid="input-new-password"]').type('newpassword123');
        cy.get('[data-testid="input-confirm-password"]').type('newpassword123');
        
        cy.get('[data-testid="button-update-password"]').click();
        cy.get('[data-testid="toast-success"]').should('contain', 'Password updated successfully');
      });

      it('should validate password change form', () => {
        cy.get('[data-testid="nav-security-settings"]').click();
        cy.get('[data-testid="button-change-password"]').click();
        
        // Test password mismatch
        cy.get('[data-testid="input-new-password"]').type('password1');
        cy.get('[data-testid="input-confirm-password"]').type('password2');
        cy.get('[data-testid="button-update-password"]').click();
        
        cy.get('[data-testid="error-password-mismatch"]').should('contain', 'Passwords do not match');
        
        // Test weak password
        cy.get('[data-testid="input-new-password"]').clear().type('123');
        cy.get('[data-testid="input-confirm-password"]').clear().type('123');
        cy.get('[data-testid="button-update-password"]').click();
        
        cy.get('[data-testid="error-weak-password"]').should('contain', 'Password must be at least 8 characters');
      });

      it('should handle account deletion request', () => {
        cy.intercept('POST', '/api/account/delete-request').as('deleteRequest');
        
        cy.get('[data-testid="nav-privacy-settings"]').click();
        cy.get('[data-testid="button-delete-account"]').click();
        
        cy.get('[data-testid="delete-account-modal"]').should('be.visible');
        cy.get('[data-testid="input-delete-confirmation"]').type('DELETE');
        cy.get('[data-testid="textarea-delete-reason"]').type('No longer needed');
        
        cy.get('[data-testid="button-confirm-delete"]').click();
        cy.wait('@deleteRequest');
        
        cy.get('[data-testid="toast-success"]').should('contain', 'Deletion request submitted');
      });

      it('should cancel account deletion request', () => {
        cy.intercept('DELETE', '/api/account/delete-request').as('cancelDeleteRequest');
        
        cy.get('[data-testid="nav-privacy-settings"]').click();
        cy.get('[data-testid="delete-request-pending"]').should('be.visible');
        cy.get('[data-testid="button-cancel-delete-request"]').click();
        
        cy.get('[data-testid="cancel-delete-modal"]').should('be.visible');
        cy.get('[data-testid="button-confirm-cancel"]').click();
        cy.wait('@cancelDeleteRequest');
        
        cy.get('[data-testid="toast-success"]').should('contain', 'Deletion request cancelled');
      });
    });
  });

  describe('User Role Management (Admin)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/admin/users*').as('getUsers');
      cy.visit('/admin/users');
      cy.wait('@getUsers');
    });

    it('should display users management page', () => {
      cy.get('[data-testid="users-admin-page"]').should('be.visible');
      cy.get('[data-testid="users-header"]').should('contain', 'User Management');
      cy.get('[data-testid="users-table"]').should('be.visible');
      cy.get('[data-testid="button-add-user"]').should('be.visible');
    });

    it('should display users table with correct columns', () => {
      cy.get('[data-testid="users-table-header"]').within(() => {
        cy.get('[data-testid="header-name"]').should('contain', 'Name');
        cy.get('[data-testid="header-email"]').should('contain', 'Email');
        cy.get('[data-testid="header-role"]').should('contain', 'Role');
        cy.get('[data-testid="header-status"]').should('contain', 'Status');
        cy.get('[data-testid="header-created"]').should('contain', 'Created');
        cy.get('[data-testid="header-actions"]').should('contain', 'Actions');
      });
    });

    it('should search users effectively', () => {
      cy.intercept('GET', '/api/admin/users*search=john*').as('searchUsers');
      
      cy.get('[data-testid="input-search-users"]').type('john');
      cy.wait('@searchUsers');
      
      cy.get('[data-testid="users-table-body"]').within(() => {
        cy.get('[data-testid^="user-row-"]').should('have.length.at.least', 1);
        cy.get('[data-testid^="user-row-"]').first().should('contain', 'john');
      });
      
      // Clear search
      cy.get('[data-testid="button-clear-search"]').click();
      cy.wait('@getUsers');
    });

    it('should filter users by role', () => {
      cy.intercept('GET', '/api/admin/users*role=admin*').as('filterByRole');
      
      cy.get('[data-testid="select-role-filter"]').click();
      cy.get('[data-testid="option-admin"]').click();
      cy.wait('@filterByRole');
      
      cy.get('[data-testid="users-table-body"]').within(() => {
        cy.get('[data-testid^="user-row-"]').each($row => {
          cy.wrap($row).find('[data-testid="user-role"]').should('contain', 'Admin');
        });
      });
    });

    it('should filter users by status', () => {
      cy.intercept('GET', '/api/admin/users*status=active*').as('filterByStatus');
      
      cy.get('[data-testid="select-status-filter"]').click();
      cy.get('[data-testid="option-active"]').click();
      cy.wait('@filterByStatus');
      
      cy.get('[data-testid="users-table-body"]').within(() => {
        cy.get('[data-testid^="user-row-"]').each($row => {
          cy.wrap($row).find('[data-testid="user-status"]').should('contain', 'Active');
        });
      });
    });

    it('should paginate through users', () => {
      // Assuming there are multiple pages
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="page-info"]').should('contain', 'Page 1');
      
      cy.get('[data-testid="button-next-page"]').click();
      cy.wait('@getUsers');
      
      cy.get('[data-testid="page-info"]').should('contain', 'Page 2');
      
      cy.get('[data-testid="button-prev-page"]').click();
      cy.wait('@getUsers');
      
      cy.get('[data-testid="page-info"]').should('contain', 'Page 1');
    });

    it('should change user role', () => {
      cy.intercept('PATCH', '/api/users/*/role').as('updateUserRole');
      
      cy.get('[data-testid^="user-row-"]').first().within(() => {
        cy.get('[data-testid="button-edit-role"]').click();
      });
      
      cy.get('[data-testid="role-edit-modal"]').should('be.visible');
      cy.get('[data-testid="select-new-role"]').click();
      cy.get('[data-testid="option-consultant"]').click();
      
      cy.get('[data-testid="button-confirm-role-change"]').click();
      cy.wait('@updateUserRole');
      
      cy.get('[data-testid="toast-success"]').should('contain', 'User role updated');
    });

    it('should view user details', () => {
      cy.intercept('GET', '/api/users/*').as('getUserDetails');
      
      cy.get('[data-testid^="user-row-"]').first().within(() => {
        cy.get('[data-testid="button-view-user"]').click();
      });
      
      cy.wait('@getUserDetails');
      cy.get('[data-testid="user-details-modal"]').should('be.visible');
      cy.get('[data-testid="user-detail-name"]').should('be.visible');
      cy.get('[data-testid="user-detail-email"]').should('be.visible');
      cy.get('[data-testid="user-detail-role"]').should('be.visible');
      cy.get('[data-testid="user-detail-created"]').should('be.visible');
      cy.get('[data-testid="user-detail-last-login"]').should('be.visible');
    });

    it('should handle bulk user operations', () => {
      cy.get('[data-testid="checkbox-select-all"]').check();
      cy.get('[data-testid="bulk-actions-toolbar"]').should('be.visible');
      
      cy.get('[data-testid="button-bulk-export"]').click();
      cy.get('[data-testid="toast-success"]').should('contain', 'Export started');
      
      cy.get('[data-testid="button-bulk-deactivate"]').click();
      cy.get('[data-testid="bulk-confirm-modal"]').should('be.visible');
      cy.get('[data-testid="button-cancel-bulk"]').click();
    });
  });

  describe('User Activity Tracking', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/activities*').as('getActivities');
      cy.visit('/admin/activities');
      cy.wait('@getActivities');
    });

    it('should display user activities', () => {
      cy.get('[data-testid="activities-page"]').should('be.visible');
      cy.get('[data-testid="activities-table"]').should('be.visible');
      cy.get('[data-testid="activities-filters"]').should('be.visible');
    });

    it('should filter activities by user', () => {
      cy.intercept('GET', '/api/activities*user=*').as('filterActivities');
      
      cy.get('[data-testid="select-user-filter"]').click();
      cy.get('[data-testid="user-option-1"]').click();
      cy.wait('@filterActivities');
      
      cy.get('[data-testid="activities-table-body"]').within(() => {
        cy.get('[data-testid^="activity-row-"]').should('have.length.at.least', 1);
      });
    });

    it('should filter activities by date range', () => {
      cy.intercept('GET', '/api/activities*from=*to=*').as('filterByDate');
      
      cy.get('[data-testid="date-from"]').type('2024-01-01');
      cy.get('[data-testid="date-to"]').type('2024-12-31');
      cy.get('[data-testid="button-apply-date-filter"]').click();
      cy.wait('@filterByDate');
    });

    it('should export activity logs', () => {
      cy.get('[data-testid="button-export-activities"]').click();
      cy.get('[data-testid="export-modal"]').should('be.visible');
      cy.get('[data-testid="select-export-format"]').select('csv');
      cy.get('[data-testid="button-start-export"]').click();
      
      cy.get('[data-testid="toast-success"]').should('contain', 'Export started');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/profile');
      cy.wait('@networkError');
      
      cy.get('[data-testid="error-message"]').should('contain', 'Network error');
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', '/api/auth/user', { statusCode: 401 }).as('unauthorized');
      
      cy.visit('/profile');
      cy.wait('@unauthorized');
      
      cy.url().should('include', '/login');
      cy.get('[data-testid="toast-error"]').should('contain', 'Session expired');
    });

    it('should handle empty states', () => {
      cy.intercept('GET', '/api/admin/users*', { body: { users: [], total: 0 } }).as('emptyUsers');
      
      cy.visit('/admin/users');
      cy.wait('@emptyUsers');
      
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state-message"]').should('contain', 'No users found');
      cy.get('[data-testid="button-add-first-user"]').should('be.visible');
    });

    it('should handle server errors', () => {
      cy.intercept('PUT', '/api/users/*', { statusCode: 500 }).as('serverError');
      
      cy.visit('/profile');
      cy.get('[data-testid="button-edit-profile"]').click();
      cy.get('[data-testid="input-first-name"]').clear().type('Updated');
      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@serverError');
      
      cy.get('[data-testid="toast-error"]').should('contain', 'Server error occurred');
    });

    it('should handle validation errors from server', () => {
      cy.intercept('PUT', '/api/users/*', {
        statusCode: 422,
        body: {
          errors: {
            email: ['Email already exists'],
            phone: ['Invalid phone format']
          }
        }
      }).as('validationError');
      
      cy.visit('/profile');
      cy.get('[data-testid="button-edit-profile"]').click();
      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@validationError');
      
      cy.get('[data-testid="error-email"]').should('contain', 'Email already exists');
      cy.get('[data-testid="error-phone"]').should('contain', 'Invalid phone format');
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.visit('/profile');
      
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
      cy.get('[data-testid="profile-avatar"]').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.visit('/admin/users');
      
      cy.get('[data-testid="users-admin-page"]').should('be.visible');
      cy.get('[data-testid="users-table"]').should('be.visible');
    });

    it('should handle mobile navigation', () => {
      cy.viewport('iphone-x');
      cy.visit('/settings');
      
      cy.get('[data-testid="mobile-settings-nav"]').should('be.visible');
      cy.get('[data-testid="nav-profile-settings"]').click();
      cy.get('[data-testid="profile-settings-section"]').should('be.visible');
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states appropriately', () => {
      cy.intercept('GET', '/api/auth/user', { delay: 2000 }).as('slowUserLoad');
      
      cy.visit('/profile');
      cy.get('[data-testid="profile-loading"]').should('be.visible');
      cy.wait('@slowUserLoad');
      cy.get('[data-testid="profile-loading"]').should('not.exist');
      cy.get('[data-testid="profile-page"]').should('be.visible');
    });

    it('should handle concurrent operations', () => {
      cy.visit('/profile');
      cy.get('[data-testid="button-edit-profile"]').click();
      
      // Start multiple operations simultaneously
      cy.get('[data-testid="input-first-name"]').clear().type('Name1');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="input-last-name"]').clear().type('Name2');
      cy.get('[data-testid="button-save-profile"]').click();
      
      // Should handle gracefully without UI breaking
      cy.get('[data-testid="profile-page"]').should('be.visible');
    });

    it('should implement proper caching', () => {
      cy.visit('/profile');
      cy.get('[data-testid="profile-name"]').should('be.visible');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/profile');
      
      // Should load quickly from cache
      cy.get('[data-testid="profile-name"]').should('be.visible');
    });
  });
});
