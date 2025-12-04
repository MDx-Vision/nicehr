describe('User Management', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin'
  };

  beforeEach(() => {
    cy.login(testUser.email, 'password123');
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getCurrentUser');
  });

  describe('User Profile Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: {
          ...testUser,
          preferences: {
            notifications: true,
            theme: 'light',
            language: 'en'
          }
        }
      }).as('getSettings');
      
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should display user profile information', () => {
      cy.get('[data-testid="profile-section"]').should('be.visible');
      cy.get('[data-testid="input-name"]').should('have.value', testUser.name);
      cy.get('[data-testid="input-email"]').should('have.value', testUser.email);
      cy.get('[data-testid="user-role"]').should('contain.text', testUser.role);
    });

    it('should update user profile successfully', () => {
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 200,
        body: { success: true, message: 'Profile updated successfully' }
      }).as('updateProfile');

      const updatedName = 'Updated Test User';
      cy.get('[data-testid="input-name"]').clear().type(updatedName);
      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateProfile').its('request.body').should('include', {
        name: updatedName
      });
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile updated successfully');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-name"]').should('be.visible').and('contain.text', 'Name is required');
      cy.get('[data-testid="success-message"]').should('not.exist');
    });

    it('should handle profile update errors', () => {
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 400,
        body: { error: 'Invalid data provided' }
      }).as('updateProfileError');

      cy.get('[data-testid="input-name"]').clear().type('Updated Name');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateProfileError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Invalid data provided');
    });

    it('should update user preferences', () => {
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 200,
        body: { success: true }
      }).as('updatePreferences');

      cy.get('[data-testid="checkbox-notifications"]').uncheck();
      cy.get('[data-testid="select-theme"]').select('dark');
      cy.get('[data-testid="select-language"]').select('es');
      cy.get('[data-testid="button-save-preferences"]').click();

      cy.wait('@updatePreferences').its('request.body.preferences').should('deep.include', {
        notifications: false,
        theme: 'dark',
        language: 'es'
      });
    });

    it('should handle profile photo upload', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}/profile-photo`, {
        statusCode: 200,
        body: { photoUrl: '/images/profile-123.jpg' }
      }).as('uploadPhoto');

      cy.get('[data-testid="profile-photo-upload"]').selectFile('cypress/fixtures/test-image.jpg');
      cy.wait('@uploadPhoto');
      
      cy.get('[data-testid="profile-photo"]').should('have.attr', 'src').and('include', 'profile-123.jpg');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Profile photo updated');
    });

    it('should handle invalid file uploads', () => {
      cy.get('[data-testid="profile-photo-upload"]').selectFile('cypress/fixtures/test-document.pdf');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Please select a valid image file');
    });

    it('should handle large file uploads', () => {
      cy.get('[data-testid="profile-photo-upload"]').selectFile('cypress/fixtures/large-image.jpg');
      cy.get('[data-testid="error-message"]').should('contain.text', 'File size too large');
    });
  });

  describe('User Role Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: [
          { id: 1, userId: 1, name: 'Test Consultant', role: 'admin' },
          { id: 2, userId: 2, name: 'User Consultant', role: 'user' }
        ]
      }).as('getConsultants');
    });

    it('should display user role in admin interface', () => {
      cy.visit('/admin/users');
      cy.wait('@getConsultants');
      
      cy.get('[data-testid="user-list"]').should('be.visible');
      cy.get('[data-testid="user-role-1"]').should('contain.text', 'admin');
      cy.get('[data-testid="user-role-2"]').should('contain.text', 'user');
    });

    it('should update user role successfully', () => {
      cy.intercept('PATCH', '/api/users/2/role', {
        statusCode: 200,
        body: { success: true, message: 'Role updated successfully' }
      }).as('updateRole');

      cy.visit('/admin/users');
      cy.wait('@getConsultants');
      
      cy.get('[data-testid="user-role-select-2"]').select('admin');
      cy.get('[data-testid="button-save-role-2"]').click();

      cy.wait('@updateRole').its('request.body').should('include', {
        role: 'admin'
      });
      cy.get('[data-testid="success-message"]').should('contain.text', 'Role updated successfully');
    });

    it('should prevent role changes for current user', () => {
      cy.visit('/admin/users');
      cy.wait('@getConsultants');
      
      cy.get('[data-testid="user-role-select-1"]').should('be.disabled');
      cy.get('[data-testid="button-save-role-1"]').should('be.disabled');
    });

    it('should require confirmation for role changes', () => {
      cy.visit('/admin/users');
      cy.wait('@getConsultants');
      
      cy.get('[data-testid="user-role-select-2"]').select('admin');
      cy.get('[data-testid="button-save-role-2"]').click();
      
      cy.get('[data-testid="confirm-role-change"]').should('be.visible');
      cy.get('[data-testid="button-confirm-role-change"]').click();
      
      cy.wait('@updateRole');
    });
  });

  describe('Account Deletion', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should request account deletion', () => {
      cy.intercept('POST', '/api/account/delete-request', {
        statusCode: 200,
        body: { success: true, message: 'Deletion request submitted' }
      }).as('deleteRequest');

      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="confirm-deletion-modal"]').should('be.visible');
      cy.get('[data-testid="input-confirm-email"]').type(testUser.email);
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteRequest');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Deletion request submitted');
    });

    it('should validate email confirmation for deletion', () => {
      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="confirm-deletion-modal"]').should('be.visible');
      cy.get('[data-testid="input-confirm-email"]').type('wrong@email.com');
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.get('[data-testid="error-confirm-email"]').should('contain.text', 'Email does not match');
      cy.intercept('POST', '/api/account/delete-request').as('deleteRequest');
      cy.get('@deleteRequest.all').should('have.length', 0);
    });

    it('should cancel deletion request', () => {
      cy.intercept('DELETE', '/api/account/delete-request', {
        statusCode: 200,
        body: { success: true, message: 'Deletion request cancelled' }
      }).as('cancelDeletion');

      // First submit deletion request
      cy.intercept('POST', '/api/account/delete-request', {
        statusCode: 200,
        body: { success: true, deletionRequestId: 1 }
      }).as('deleteRequest');

      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="input-confirm-email"]').type(testUser.email);
      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteRequest');

      // Then cancel it
      cy.get('[data-testid="button-cancel-deletion"]').should('be.visible').click();
      cy.wait('@cancelDeletion');
      cy.get('[data-testid="success-message"]').should('contain.text', 'Deletion request cancelled');
    });

    it('should handle deletion request errors', () => {
      cy.intercept('POST', '/api/account/delete-request', {
        statusCode: 400,
        body: { error: 'Cannot delete account with active projects' }
      }).as('deletionError');

      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="input-confirm-email"]').type(testUser.email);
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deletionError');
      cy.get('[data-testid="error-message"]').should('contain.text', 'Cannot delete account with active projects');
    });
  });

  describe('User Authentication State', () => {
    it('should refresh user data periodically', () => {
      cy.visit('/dashboard');
      cy.wait('@getCurrentUser');

      // Mock updated user data
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...testUser, name: 'Updated Name' }
      }).as('refreshUser');

      cy.wait(30000); // Wait for periodic refresh
      cy.wait('@refreshUser');
      cy.get('[data-testid="user-name"]').should('contain.text', 'Updated Name');
    });

    it('should handle token refresh', () => {
      cy.visit('/dashboard');
      
      // Simulate token refresh
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredToken');

      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: { token: 'new-token', user: testUser }
      }).as('refreshToken');

      cy.reload();
      cy.wait('@expiredToken');
      cy.wait('@refreshToken');
      
      cy.url().should('not.include', '/login');
    });

    it('should handle multiple tab synchronization', () => {
      cy.visit('/dashboard');
      
      // Simulate logout in another tab
      cy.window().then((win) => {
        win.localStorage.setItem('auth-logout', Date.now().toString());
        win.dispatchEvent(new StorageEvent('storage', {
          key: 'auth-logout',
          newValue: Date.now().toString()
        }));
      });

      cy.url().should('include', '/login');
    });
  });

  describe('User Data Export and Privacy', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should export user data', () => {
      cy.intercept('GET', '/api/users/1/export', {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="user-data.json"'
        },
        body: {
          user: testUser,
          activities: [],
          preferences: {}
        }
      }).as('exportData');

      cy.get('[data-testid="button-export-data"]').click();
      cy.wait('@exportData');
      
      cy.get('[data-testid="success-message"]').should('contain.text', 'Data exported successfully');
    });

    it('should handle privacy settings', () => {
      cy.intercept('PATCH', '/api/account/privacy', {
        statusCode: 200,
        body: { success: true }
      }).as('updatePrivacy');

      cy.get('[data-testid="privacy-section"]').scrollIntoView();
      cy.get('[data-testid="checkbox-profile-visible"]').uncheck();
      cy.get('[data-testid="checkbox-activity-tracking"]').uncheck();
      cy.get('[data-testid="button-save-privacy"]').click();

      cy.wait('@updatePrivacy').its('request.body').should('deep.include', {
        profileVisible: false,
        activityTracking: false
      });
    });
  });

  describe('Accessibility and Responsive Design', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.wait('@getSettings');
    });

    it('should be accessible via keyboard navigation', () => {
      cy.get('[data-testid="input-name"]').focus().tab();
      cy.focused().should('have.attr', 'data-testid', 'input-email');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'button-save-profile');
    });

    it('should work on mobile devices', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="profile-section"]').should('be.visible');
      cy.get('[data-testid="input-name"]').should('be.visible');
      cy.get('[data-testid="button-save-profile"]').should('be.visible');
      
      cy.get('[data-testid="input-name"]').clear().type('Mobile Test');
      cy.get('[data-testid="button-save-profile"]').click();
    });

    it('should handle form validation on mobile', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-name"]').should('be.visible');
    });
  });
});
