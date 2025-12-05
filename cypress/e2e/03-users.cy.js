describe('Users Management System', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'password123',
      id: 'ci-test-user'
    },
    newUser: {
      email: 'newuser@example.com',
      password: 'newpassword123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'consultant'
    },
    updateUser: {
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1987654321',
      email: 'updated@example.com'
    },
    invalidData: {
      email: 'invalid-email',
      shortPassword: '123',
      longName: 'a'.repeat(101),
      invalidPhone: '123'
    }
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.admin.email);
    cy.get('[data-testid="input-password"]').type(testData.admin.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });

  describe('User Authentication', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();
    });

    it('should get current user information', () => {
      cy.intercept('GET', '/api/auth/user').as('getCurrentUser');
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testData.admin.email);
      cy.get('[data-testid="input-password"]').type(testData.admin.password);
      cy.get('[data-testid="button-login"]').click();
      
      cy.wait('@getCurrentUser').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('id');
        expect(interception.response.body).to.have.property('email');
        expect(interception.response.body.email).to.equal(testData.admin.email);
      });
    });

    it('should handle authentication errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { statusCode: 401, body: { error: 'Unauthorized' } }).as('authError');
      cy.visit('/dashboard');
      
      cy.wait('@authError');
      cy.url().should('include', '/login');
    });

    it('should persist authentication across page reloads', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testData.admin.email);
      cy.get('[data-testid="input-password"]').type(testData.admin.password);
      cy.get('[data-testid="button-login"]').click();
      
      cy.url().should('not.include', '/login');
      cy.reload();
      cy.url().should('not.include', '/login');
    });

    it('should handle session expiry', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(testData.admin.email);
      cy.get('[data-testid="input-password"]').type(testData.admin.password);
      cy.get('[data-testid="button-login"]').click();
      
      // Simulate session expiry
      cy.clearCookies();
      cy.intercept('GET', '/api/auth/user', { statusCode: 401, body: { error: 'Session expired' } }).as('sessionExpiry');
      
      cy.visit('/dashboard');
      cy.wait('@sessionExpiry');
      cy.url().should('include', '/login');
    });
  });

  describe('User Profile Management', () => {
    it('should display user profile page', () => {
      cy.visit('/profile');
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="profile-header"]').should('be.visible');
      cy.get('[data-testid="profile-form"]').should('be.visible');
    });

    it('should load current user profile data', () => {
      cy.intercept('GET', '/api/auth/user').as('getUserProfile');
      cy.visit('/profile');
      
      cy.wait('@getUserProfile').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        const user = interception.response.body;
        
        if (user.firstName) {
          cy.get('[data-testid="input-first-name"]').should('have.value', user.firstName);
        }
        if (user.lastName) {
          cy.get('[data-testid="input-last-name"]').should('have.value', user.lastName);
        }
        cy.get('[data-testid="input-email"]').should('have.value', user.email);
      });
    });

    it('should update user profile successfully', () => {
      cy.intercept('PUT', `/api/users/${testData.admin.id}`, {
        statusCode: 200,
        body: { ...testData.admin, ...testData.updateUser }
      }).as('updateProfile');

      cy.visit('/profile');
      
      cy.get('[data-testid="input-first-name"]').clear().type(testData.updateUser.firstName);
      cy.get('[data-testid="input-last-name"]').clear().type(testData.updateUser.lastName);
      cy.get('[data-testid="input-phone"]').clear().type(testData.updateUser.phone);
      
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateProfile').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.request.body).to.deep.include({
          firstName: testData.updateUser.firstName,
          lastName: testData.updateUser.lastName,
          phone: testData.updateUser.phone
        });
      });
      
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile updated successfully');
    });

    it('should validate profile form fields', () => {
      cy.visit('/profile');
      
      // Test required fields
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-first-name"]').should('be.visible');
      cy.get('[data-testid="error-last-name"]').should('be.visible');
      
      // Test field length limits
      cy.get('[data-testid="input-first-name"]').clear().type(testData.invalidData.longName);
      cy.get('[data-testid="input-last-name"]').clear().type(testData.invalidData.longName);
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-first-name"]').should('contain.text', 'too long');
      cy.get('[data-testid="error-last-name"]').should('contain.text', 'too long');
      
      // Test phone validation
      cy.get('[data-testid="input-phone"]').clear().type(testData.invalidData.invalidPhone);
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-phone"]').should('be.visible');
    });

    it('should handle profile update errors', () => {
      cy.intercept('PUT', `/api/users/${testData.admin.id}`, {
        statusCode: 400,
        body: { error: 'Email already exists' }
      }).as('updateProfileError');

      cy.visit('/profile');
      
      cy.get('[data-testid="input-first-name"]').clear().type(testData.updateUser.firstName);
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateProfileError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Email already exists');
    });

    it('should show loading state during profile update', () => {
      cy.intercept('PUT', `/api/users/${testData.admin.id}`, {
        statusCode: 200,
        body: testData.admin,
        delay: 1000
      }).as('updateProfileSlow');

      cy.visit('/profile');
      
      cy.get('[data-testid="input-first-name"]').clear().type(testData.updateUser.firstName);
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="button-save-profile"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      cy.wait('@updateProfileSlow');
      
      cy.get('[data-testid="button-save-profile"]').should('not.be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });
  });

  describe('Profile Photo Management', () => {
    it('should display current profile photo', () => {
      cy.visit('/profile');
      cy.get('[data-testid="profile-photo"]').should('be.visible');
      cy.get('[data-testid="profile-photo-upload"]').should('be.visible');
    });

    it('should upload new profile photo', () => {
      cy.intercept('PUT', `/api/users/${testData.admin.id}/profile-photo`, {
        statusCode: 200,
        body: { photoUrl: '/uploads/profile-photo.jpg' }
      }).as('uploadProfilePhoto');

      cy.visit('/profile');
      
      cy.fixture('test-image.jpg').then(fileContent => {
        cy.get('[data-testid="profile-photo-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'profile-photo.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait('@uploadProfilePhoto');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile photo updated');
    });

    it('should validate photo file type and size', () => {
      cy.visit('/profile');
      
      // Test invalid file type
      cy.fixture('test-document.pdf').then(fileContent => {
        cy.get('[data-testid="profile-photo-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'document.pdf',
          mimeType: 'application/pdf'
        }, { force: true });
      });
      
      cy.get('[data-testid="error-message"]').should('contain.text', 'Invalid file type');
    });

    it('should upload cover photo', () => {
      cy.intercept('PUT', `/api/users/${testData.admin.id}/cover-photo`, {
        statusCode: 200,
        body: { coverPhotoUrl: '/uploads/cover-photo.jpg' }
      }).as('uploadCoverPhoto');

      cy.visit('/profile');
      
      cy.fixture('test-image.jpg').then(fileContent => {
        cy.get('[data-testid="cover-photo-input"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'cover-photo.jpg',
          mimeType: 'image/jpeg'
        }, { force: true });
      });
      
      cy.wait('@uploadCoverPhoto');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Cover photo updated');
    });
  });

  describe('User Role Management', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        role: 'consultant',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        role: 'hospital_admin',
        createdAt: new Date().toISOString()
      }
    ];

    it('should display users management page for admin', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockUsers, total: mockUsers.length }
      }).as('getUsers');

      cy.visit('/admin/users');
      
      cy.wait('@getUsers');
      cy.get('[data-testid="users-page"]').should('be.visible');
      cy.get('[data-testid="users-table"]').should('be.visible');
      cy.get('[data-testid="user-row"]').should('have.length', mockUsers.length);
    });

    it('should change user role successfully', () => {
      const userId = 'user-1';
      const newRole = 'hospital_admin';
      
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockUsers, total: mockUsers.length }
      }).as('getUsers');
      
      cy.intercept('PATCH', `/api/users/${userId}/role`, {
        statusCode: 200,
        body: { ...mockUsers[0], role: newRole }
      }).as('changeRole');

      cy.visit('/admin/users');
      cy.wait('@getUsers');
      
      cy.get(`[data-testid="user-${userId}-role-select"]`).click();
      cy.get(`[data-testid="role-option-${newRole}"]`).click();
      cy.get(`[data-testid="confirm-role-change"]`).click();
      
      cy.wait('@changeRole').then((interception) => {
        expect(interception.request.body).to.deep.include({ role: newRole });
      });
      
      cy.get('[data-testid="success-message"]').should('contain.text', 'Role updated successfully');
    });

    it('should validate role change permissions', () => {
      cy.intercept('PATCH', '/api/users/user-1/role', {
        statusCode: 403,
        body: { error: 'Insufficient permissions' }
      }).as('roleChangeError');

      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockUsers, total: mockUsers.length }
      }).as('getUsers');

      cy.visit('/admin/users');
      cy.wait('@getUsers');
      
      cy.get('[data-testid="user-user-1-role-select"]').click();
      cy.get('[data-testid="role-option-super_admin"]').click();
      cy.get('[data-testid="confirm-role-change"]').click();
      
      cy.wait('@roleChangeError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Insufficient permissions');
    });

    it('should display role change confirmation dialog', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockUsers, total: mockUsers.length }
      }).as('getUsers');

      cy.visit('/admin/users');
      cy.wait('@getUsers');
      
      cy.get('[data-testid="user-user-1-role-select"]').click();
      cy.get('[data-testid="role-option-hospital_admin"]').click();
      
      cy.get('[data-testid="role-change-dialog"]').should('be.visible');
      cy.get('[data-testid="role-change-dialog"]').should('contain.text', 'Change user role');
      cy.get('[data-testid="confirm-role-change"]').should('be.visible');
      cy.get('[data-testid="cancel-role-change"]').should('be.visible');
      
      // Test cancel functionality
      cy.get('[data-testid="cancel-role-change"]').click();
      cy.get('[data-testid="role-change-dialog"]').should('not.exist');
    });

    it('should show loading state during role change', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockUsers, total: mockUsers.length }
      }).as('getUsers');
      
      cy.intercept('PATCH', '/api/users/user-1/role', {
        statusCode: 200,
        body: { ...mockUsers[0], role: 'hospital_admin' },
        delay: 1000
      }).as('changeRoleSlow');

      cy.visit('/admin/users');
      cy.wait('@getUsers');
      
      cy.get('[data-testid="user-user-1-role-select"]').click();
      cy.get('[data-testid="role-option-hospital_admin"]').click();
      cy.get('[data-testid="confirm-role-change"]').click();
      
      cy.get('[data-testid="confirm-role-change"]').should('be.disabled');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      
      cy.wait('@changeRoleSlow');
      
      cy.get('[data-testid="role-change-dialog"]').should('not.exist');
    });
  });

  describe('Account Settings', () => {
    const mockSettings = {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      projectUpdates: true,
      timezone: 'America/New_York',
      language: 'en',
      theme: 'light'
    };

    it('should load account settings', () => {
      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: mockSettings
      }).as('getSettings');

      cy.visit('/account/settings');
      
      cy.wait('@getSettings');
      cy.get('[data-testid="settings-page"]').should('be.visible');
      cy.get('[data-testid="email-notifications"]').should(mockSettings.emailNotifications ? 'be.checked' : 'not.be.checked');
      cy.get('[data-testid="push-notifications"]').should(mockSettings.pushNotifications ? 'be.checked' : 'not.be.checked');
    });

    it('should update account settings', () => {
      const updatedSettings = { ...mockSettings, emailNotifications: false };
      
      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: mockSettings
      }).as('getSettings');
      
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 200,
        body: updatedSettings
      }).as('updateSettings');

      cy.visit('/account/settings');
      cy.wait('@getSettings');
      
      cy.get('[data-testid="email-notifications"]').click();
      cy.get('[data-testid="button-save-settings"]').click();
      
      cy.wait('@updateSettings').then((interception) => {
        expect(interception.request.body).to.deep.include({
          emailNotifications: false
        });
      });
      
      cy.get('[data-testid="success-message"]').should('contain.text', 'Settings updated successfully');
    });

    it('should validate settings form', () => {
      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: mockSettings
      }).as('getSettings');

      cy.visit('/account/settings');
      cy.wait('@getSettings');
      
      // Test timezone selection
      cy.get('[data-testid="timezone-select"]').should('be.visible');
      cy.get('[data-testid="timezone-select"]').click();
      cy.get('[data-testid="timezone-option-America/Los_Angeles"]').click();
      
      // Test language selection
      cy.get('[data-testid="language-select"]').should('be.visible');
      cy.get('[data-testid="language-select"]').click();
      cy.get('[data-testid="language-option-es"]').click();
      
      cy.get('[data-testid="button-save-settings"]').click();
      
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should handle settings update errors', () => {
      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: mockSettings
      }).as('getSettings');
      
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 400,
        body: { error: 'Invalid settings data' }
      }).as('updateSettingsError');

      cy.visit('/account/settings');
      cy.wait('@getSettings');
      
      cy.get('[data-testid="email-notifications"]').click();
      cy.get('[data-testid="button-save-settings"]').click();
      
      cy.wait('@updateSettingsError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Invalid settings data');
    });
  });

  describe('Account Deletion', () => {
    it('should request account deletion', () => {
      cy.intercept('POST', '/api/account/delete-request', {
        statusCode: 200,
        body: { message: 'Deletion request submitted' }
      }).as('requestDeletion');

      cy.visit('/account/settings');
      
      cy.get('[data-testid="delete-account-button"]').click();
      cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
      
      cy.get('[data-testid="delete-reason-select"]').click();
      cy.get('[data-testid="delete-reason-option-no-longer-needed"]').click();
      
      cy.get('[data-testid="delete-confirmation-input"]').type('DELETE');
      cy.get('[data-testid="confirm-delete-account"]').click();
      
      cy.wait('@requestDeletion');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Deletion request submitted');
    });

    it('should cancel account deletion request', () => {
      cy.intercept('DELETE', '/api/account/delete-request', {
        statusCode: 200,
        body: { message: 'Deletion request cancelled' }
      }).as('cancelDeletion');

      cy.visit('/account/settings');
      
      // Assume there's a pending deletion request
      cy.get('[data-testid="cancel-deletion-button"]').click();
      cy.get('[data-testid="cancel-deletion-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-cancel-deletion"]').click();
      
      cy.wait('@cancelDeletion');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Deletion request cancelled');
    });

    it('should validate deletion confirmation input', () => {
      cy.visit('/account/settings');
      
      cy.get('[data-testid="delete-account-button"]').click();
      cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
      
      cy.get('[data-testid="delete-reason-select"]').click();
      cy.get('[data-testid="delete-reason-option-no-longer-needed"]').click();
      
      // Test without typing DELETE
      cy.get('[data-testid="confirm-delete-account"]').should('be.disabled');
      
      // Test with incorrect text
      cy.get('[data-testid="delete-confirmation-input"]').type('delete');
      cy.get('[data-testid="confirm-delete-account"]').should('be.disabled');
      
      // Test with correct text
      cy.get('[data-testid="delete-confirmation-input"]').clear().type('DELETE');
      cy.get('[data-testid="confirm-delete-account"]').should('not.be.disabled');
    });
  });

  describe('User Directory', () => {
    const mockDirectory = [
      {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'consultant',
        avatar: '/avatars/john.jpg'
      },
      {
        id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'hospital_admin',
        avatar: '/avatars/jane.jpg'
      }
    ];

    it('should display user directory', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockDirectory, total: mockDirectory.length }
      }).as('getDirectory');

      cy.visit('/directory');
      
      cy.wait('@getDirectory');
      cy.get('[data-testid="directory-page"]').should('be.visible');
      cy.get('[data-testid="user-card"]').should('have.length', mockDirectory.length);
    });

    it('should search users in directory', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockDirectory, total: mockDirectory.length }
      }).as('getDirectory');
      
      cy.intercept('GET', '/api/users*search=john*', {
        statusCode: 200,
        body: { users: [mockDirectory[0]], total: 1 }
      }).as('searchUsers');

      cy.visit('/directory');
      cy.wait('@getDirectory');
      
      cy.get('[data-testid="search-input"]').type('john');
      cy.get('[data-testid="search-button"]').click();
      
      cy.wait('@searchUsers');
      cy.get('[data-testid="user-card"]').should('have.length', 1);
      cy.get('[data-testid="user-card"]').should('contain.text', 'John Doe');
    });

    it('should filter users by role', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: mockDirectory, total: mockDirectory.length }
      }).as('getDirectory');
      
      cy.intercept('GET', '/api/users*role=consultant*', {
        statusCode: 200,
        body: { users: [mockDirectory[0]], total: 1 }
      }).as('filterUsers');

      cy.visit('/directory');
      cy.wait('@getDirectory');
      
      cy.get('[data-testid="role-filter"]').click();
      cy.get('[data-testid="role-option-consultant"]').click();
      
      cy.wait('@filterUsers');
      cy.get('[data-testid="user-card"]').should('have.length', 1);
    });

    it('should handle empty directory state', () => {
      cy.intercept('GET', '/api/users*', {
        statusCode: 200,
        body: { users: [], total: 0 }
      }).as('getEmptyDirectory');

      cy.visit('/directory');
      
      cy.wait('@getEmptyDirectory');
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.get('[data-testid="empty-state"]').should('contain.text', 'No users found');
    });

    it('should paginate directory results', () => {
      const page1Users = mockDirectory.slice(0, 1);
      const page2Users = mockDirectory.slice(1, 2);
      
      cy.intercept('GET', '/api/users*page=1*', {
        statusCode: 200,
        body: { users: page1Users, total: mockDirectory.length, hasMore: true }
      }).as('getPage1');
      
      cy.intercept('GET', '/api/users*page=2*', {
        statusCode: 200,
        body: { users: page2Users, total: mockDirectory.length, hasMore: false }
      }).as('getPage2');

      cy.visit('/directory');
      cy.wait('@getPage1');
      
      cy.get('[data-testid="user-card"]').should('have.length', 1);
      cy.get('[data-testid="next-page-button"]').click();
      
      cy.wait('@getPage2');
      cy.get('[data-testid="user-card"]').should('have.length', 1);
      cy.get('[data-testid="previous-page-button"]').should('not.be.disabled');
      cy.get('[data-testid="next-page-button"]').should('be.disabled');
    });
  });

  describe('User Permissions and Access Control', () => {
    it('should load user effective permissions', () => {
      const mockPermissions = [
        'users.read',
        'users.update',
        'consultants.read',
        'projects.read'
      ];
      
      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: { permissions: mockPermissions }
      }).as('getPermissions');

      cy.visit('/account/permissions');
      
      cy.wait('@getPermissions');
      cy.get('[data-testid="permissions-page"]').should('be.visible');
      cy.get('[data-testid="permission-item"]').should('have.length', mockPermissions.length);
      
      mockPermissions.forEach(permission => {
        cy.get(`[data-testid="permission-${permission}"]`).should('be.visible');
      });
    });

    it('should check specific permissions', () => {
      cy.intercept('GET', '/api/rbac/has-permission/users.delete', {
        statusCode: 200,
        body: { hasPermission: false }
      }).as('checkPermission');

      cy.visit('/account/permissions');
      
      cy.wait('@checkPermission');
      cy.get('[data-testid="delete-permission-status"]').should('contain.text', 'Not granted');
    });

    it('should display permission categories', () => {
      const mockPermissions = [
        'users.read',
        'users.update',
        'consultants.read',
        'consultants.update',
        'projects.read'
      ];
      
      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: { permissions: mockPermissions }
      }).as('getPermissions');

      cy.visit('/account/permissions');
      cy.wait('@getPermissions');
      
      cy.get('[data-testid="users-permissions"]').should('be.visible');
      cy.get('[data-testid="consultants-permissions"]').should('be.visible');
      cy.get('[data-testid="projects-permissions"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should display correctly on mobile devices', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="mobile-profile-header"]').should('be.visible');
      cy.get('[data-testid="profile-form"]').should('be.visible');
      
      // Check that form fields stack vertically on mobile
      cy.get('[data-testid="input-first-name"]').should('be.visible');
      cy.get('[data-testid="input-last-name"]').should('be.visible');
    });

    it('should display correctly on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="tablet-layout"]').should('be.visible');
    });

    it('should handle navigation menu on mobile', () => {
      cy.viewport('iphone-x');
      
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-navigation"]').should('be.visible');
      cy.get('[data-testid="nav-item-settings"]').should('be.visible');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/profile');
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-state"]').should('contain.text', 'Network error');
    });

    it('should handle server errors', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');
      
      cy.visit('/profile');
      cy.get('[data-testid="error-state"]').should('be.visible');
      cy.get('[data-testid="error-state"]').should('contain.text', 'server error');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 403,
        body: { error: 'Access denied' }
      }).as('accessDenied');
      
      cy.visit('/admin/users');
      cy.get('[data-testid="access-denied"]').should('be.visible');
      cy.get('[data-testid="access-denied"]').should('contain.text', 'Access denied');
    });

    it('should retry failed requests', () => {
      let requestCount = 0;
      cy.intercept('GET', '/api/auth/user', (req) => {
        requestCount++;
        if (requestCount < 3) {
          req.reply({ statusCode: 500, body: { error: 'Server error' } });
        } else {
          req.reply({ statusCode: 200, body: testData.admin });
        }
      }).as('retryRequest');
      
      cy.visit('/profile');
      cy.get('[data-testid="profile-page"]').should('be.visible');
    });

    it('should handle malformed response data', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: 'invalid json'
      }).as('malformedResponse');
      
      cy.visit('/profile');
      cy.get('[data-testid="error-state"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      cy.visit('/profile');
      
      cy.get('[data-testid="profile-form"]').should('have.attr', 'role', 'form');
      cy.get('[data-testid="input-first-name"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="button-save-profile"]').should('have.attr', 'aria-describedby');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/profile');
      
      cy.get('[data-testid="input-first-name"]').focus().should('be.focused');
      cy.get('[data-testid="input-first-name"]').tab();
      cy.get('[data-testid="input-last-name"]').should('be.focused');
      cy.get('[data-testid="input-last-name"]').tab();
      cy.get('[data-testid="input-email"]').should('be.focused');
    });

    it('should announce form validation errors to screen readers', () => {
      cy.visit('/profile');
      
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-first-name"]').should('have.attr', 'role', 'alert');
      cy.get('[data-testid="error-first-name"]').should('have.attr', 'aria-live', 'polite');
    });

    it('should have sufficient color contrast', () => {
      cy.visit('/profile');
      
      // This would typically be tested with axe-core or similar tools
      cy.get('[data-testid="profile-form"]').should('be.visible');
      cy.injectAxe();
      cy.checkA11y('[data-testid="profile-form"]');
    });
  });

  describe('Performance', () => {
    it('should load profile page within performance budget', () => {
      cy.visit('/profile');
      
      // Check that the page loads within 2 seconds
      cy.get('[data-testid="profile-page"]', { timeout: 2000 }).should('be.visible');
    });

    it('should handle concurrent requests efficiently', () => {
      const requests = [];
      
      cy.intercept('GET', '/api/auth/user', (req) => {
        requests.push(req);
        req.reply({ statusCode: 200, body: testData.admin });
      }).as('concurrentRequests');
      
      cy.visit('/profile');
      cy.visit('/account/settings');
      cy.visit('/profile');
      
      cy.then(() => {
        expect(requests.length).to.be.lessThan(10); // Should not make excessive requests
      });
    });

    it('should debounce search input', () => {
      let searchCount = 0;
      
      cy.intercept('GET', '/api/users*search=*', (req) => {
        searchCount++;
        req.reply({ statusCode: 200, body: { users: [], total: 0 } });
      }).as('debouncedSearch');
      
      cy.visit('/directory');
      
      cy.get('[data-testid="search-input"]').type('john doe', { delay: 50 });
      
      cy.wait(1000).then(() => {
        expect(searchCount).to.be.lessThan(5); // Should debounce and not search on every keystroke
      });
    });
  });
});
