describe('User Profile Management', () => {
  const testUser = {
    id: 'ci-test-user',
    email: 'test@example.com',
    name: 'CI Test User',
    role: 'admin'
  };

  const updatedProfile = {
    firstName: 'Updated',
    lastName: 'User',
    email: 'updated@example.com',
    phone: '+1234567890',
    bio: 'Updated bio for testing'
  };

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  describe('Profile Page UI Elements', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should display all profile elements correctly', () => {
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="profile-header"]').should('be.visible');
      cy.get('[data-testid="profile-avatar"]').should('be.visible');
      cy.get('[data-testid="profile-name"]').should('be.visible');
      cy.get('[data-testid="profile-email"]').should('be.visible');
      cy.get('[data-testid="profile-role"]').should('be.visible');
      cy.get('[data-testid="edit-profile-button"]').should('be.visible');
    });

    it('should show profile photo upload area', () => {
      cy.get('[data-testid="profile-photo-section"]').should('be.visible');
      cy.get('[data-testid="upload-profile-photo-button"]').should('be.visible');
      cy.get('[data-testid="profile-photo-preview"]').should('be.visible');
    });

    it('should show cover photo section', () => {
      cy.get('[data-testid="cover-photo-section"]').should('be.visible');
      cy.get('[data-testid="upload-cover-photo-button"]').should('be.visible');
      cy.get('[data-testid="cover-photo-preview"]').should('be.visible');
    });

    it('should display profile tabs correctly', () => {
      cy.get('[data-testid="profile-tabs"]').should('be.visible');
      cy.get('[data-testid="tab-overview"]').should('be.visible').and('contain.text', 'Overview');
      cy.get('[data-testid="tab-activity"]').should('be.visible').and('contain.text', 'Activity');
      cy.get('[data-testid="tab-settings"]').should('be.visible').and('contain.text', 'Settings');
    });

    it('should handle responsive layout', () => {
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
      
      // Tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="profile-container"]').should('be.visible');
      
      // Desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="profile-container"]').should('be.visible');
    });
  });

  describe('Profile Information Display', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', { fixture: 'users/current-user.json' }).as('getCurrentUser');
      cy.visit('/profile');
      cy.wait('@getCurrentUser');
    });

    it('should display current user information', () => {
      cy.get('[data-testid="profile-name"]').should('contain.text', testUser.name);
      cy.get('[data-testid="profile-email"]').should('contain.text', testUser.email);
      cy.get('[data-testid="profile-role"]').should('contain.text', testUser.role);
    });

    it('should handle empty profile data gracefully', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: testUser.id, email: testUser.email }
      }).as('getMinimalUser');
      
      cy.visit('/profile');
      cy.wait('@getMinimalUser');
      
      cy.get('[data-testid="profile-placeholder"]').should('be.visible');
      cy.get('[data-testid="complete-profile-prompt"]').should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { statusCode: 500 }).as('getUserError');
      cy.visit('/profile');
      cy.wait('@getUserError');
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('Profile Photo Upload', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should allow profile photo upload', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}/profile-photo`, {
        statusCode: 200,
        body: { success: true, photoUrl: 'https://example.com/photo.jpg' }
      }).as('uploadProfilePhoto');

      cy.get('[data-testid="upload-profile-photo-button"]').click();
      cy.get('[data-testid="file-input-profile-photo"]').selectFile('cypress/fixtures/images/test-avatar.jpg');
      
      cy.wait('@uploadProfilePhoto');
      cy.get('[data-testid="success-message"]').should('be.visible').and('contain.text', 'Profile photo updated');
    });

    it('should validate file types for profile photo', () => {
      cy.get('[data-testid="upload-profile-photo-button"]').click();
      cy.get('[data-testid="file-input-profile-photo"]').selectFile('cypress/fixtures/files/test-document.pdf');
      
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Please select a valid image file');
    });

    it('should validate file size for profile photo', () => {
      cy.get('[data-testid="upload-profile-photo-button"]').click();
      cy.get('[data-testid="file-input-profile-photo"]').selectFile('cypress/fixtures/images/large-image.jpg');
      
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'File size must be less than 5MB');
    });

    it('should handle profile photo upload errors', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}/profile-photo`, { statusCode: 500 }).as('uploadError');

      cy.get('[data-testid="upload-profile-photo-button"]').click();
      cy.get('[data-testid="file-input-profile-photo"]').selectFile('cypress/fixtures/images/test-avatar.jpg');
      
      cy.wait('@uploadError');
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Failed to upload profile photo');
    });

    it('should show upload progress', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}/profile-photo`, (req) => {
        req.reply({ delay: 2000, statusCode: 200, body: { success: true } });
      }).as('slowUpload');

      cy.get('[data-testid="upload-profile-photo-button"]').click();
      cy.get('[data-testid="file-input-profile-photo"]').selectFile('cypress/fixtures/images/test-avatar.jpg');
      
      cy.get('[data-testid="upload-progress"]').should('be.visible');
      cy.get('[data-testid="upload-spinner"]').should('be.visible');
      
      cy.wait('@slowUpload');
      cy.get('[data-testid="upload-progress"]').should('not.exist');
    });
  });

  describe('Cover Photo Upload', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should allow cover photo upload', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}/cover-photo`, {
        statusCode: 200,
        body: { success: true, coverUrl: 'https://example.com/cover.jpg' }
      }).as('uploadCoverPhoto');

      cy.get('[data-testid="upload-cover-photo-button"]').click();
      cy.get('[data-testid="file-input-cover-photo"]').selectFile('cypress/fixtures/images/test-cover.jpg');
      
      cy.wait('@uploadCoverPhoto');
      cy.get('[data-testid="success-message"]').should('be.visible').and('contain.text', 'Cover photo updated');
    });

    it('should validate cover photo dimensions', () => {
      cy.get('[data-testid="upload-cover-photo-button"]').click();
      cy.get('[data-testid="file-input-cover-photo"]').selectFile('cypress/fixtures/images/small-image.jpg');
      
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Cover photo must be at least 1200x400 pixels');
    });

    it('should handle cover photo upload errors', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}/cover-photo`, { statusCode: 500 }).as('uploadError');

      cy.get('[data-testid="upload-cover-photo-button"]').click();
      cy.get('[data-testid="file-input-cover-photo"]').selectFile('cypress/fixtures/images/test-cover.jpg');
      
      cy.wait('@uploadError');
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Failed to upload cover photo');
    });
  });

  describe('Profile Edit Form', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').click();
    });

    it('should display edit form with current values', () => {
      cy.get('[data-testid="edit-profile-modal"]').should('be.visible');
      cy.get('[data-testid="input-first-name"]').should('be.visible');
      cy.get('[data-testid="input-last-name"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.visible');
      cy.get('[data-testid="input-phone"]').should('be.visible');
      cy.get('[data-testid="textarea-bio"]').should('be.visible');
      cy.get('[data-testid="button-save-profile"]').should('be.visible');
      cy.get('[data-testid="button-cancel-edit"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="input-first-name"]').clear();
      cy.get('[data-testid="input-last-name"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-first-name"]').should('be.visible')
        .and('contain.text', 'First name is required');
      cy.get('[data-testid="error-last-name"]').should('be.visible')
        .and('contain.text', 'Last name is required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]').clear().type('invalid-email');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-email"]').should('be.visible')
        .and('contain.text', 'Please enter a valid email address');
    });

    it('should validate phone number format', () => {
      cy.get('[data-testid="input-phone"]').clear().type('invalid-phone');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.get('[data-testid="error-phone"]').should('be.visible')
        .and('contain.text', 'Please enter a valid phone number');
    });

    it('should validate bio length', () => {
      const longBio = 'A'.repeat(501);
      cy.get('[data-testid="textarea-bio"]').clear().type(longBio);
      
      cy.get('[data-testid="bio-character-count"]').should('be.visible')
        .and('contain.text', '501/500');
      cy.get('[data-testid="error-bio"]').should('be.visible')
        .and('contain.text', 'Bio must be 500 characters or less');
    });

    it('should successfully update profile', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}`, {
        statusCode: 200,
        body: { success: true, user: { ...testUser, ...updatedProfile } }
      }).as('updateProfile');

      cy.get('[data-testid="input-first-name"]').clear().type(updatedProfile.firstName);
      cy.get('[data-testid="input-last-name"]').clear().type(updatedProfile.lastName);
      cy.get('[data-testid="input-email"]').clear().type(updatedProfile.email);
      cy.get('[data-testid="input-phone"]').clear().type(updatedProfile.phone);
      cy.get('[data-testid="textarea-bio"]').clear().type(updatedProfile.bio);
      
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateProfile');
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'Profile updated successfully');
      cy.get('[data-testid="edit-profile-modal"]').should('not.exist');
    });

    it('should handle update errors', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}`, { statusCode: 400 }).as('updateError');

      cy.get('[data-testid="input-first-name"]').clear().type(updatedProfile.firstName);
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@updateError');
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Failed to update profile');
    });

    it('should cancel edit and reset form', () => {
      cy.get('[data-testid="input-first-name"]').clear().type('Changed Name');
      cy.get('[data-testid="button-cancel-edit"]').click();
      
      cy.get('[data-testid="edit-profile-modal"]').should('not.exist');
      
      // Reopen and verify original values
      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="input-first-name"]').should('not.contain.value', 'Changed Name');
    });

    it('should handle keyboard shortcuts', () => {
      // ESC to cancel
      cy.get('[data-testid="edit-profile-modal"]').type('{esc}');
      cy.get('[data-testid="edit-profile-modal"]').should('not.exist');
      
      // Ctrl+S to save (reopen modal first)
      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="input-first-name"]').clear().type(updatedProfile.firstName);
      cy.get('[data-testid="edit-profile-modal"]').type('{ctrl+s}');
      
      // Should trigger save
      cy.get('[data-testid="button-save-profile"]').should('have.focus');
    });
  });

  describe('Profile Tabs Navigation', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should navigate between tabs correctly', () => {
      // Overview tab (default)
      cy.get('[data-testid="tab-overview"]').should('have.class', 'active');
      cy.get('[data-testid="overview-content"]').should('be.visible');
      
      // Activity tab
      cy.get('[data-testid="tab-activity"]').click();
      cy.get('[data-testid="tab-activity"]').should('have.class', 'active');
      cy.get('[data-testid="activity-content"]').should('be.visible');
      cy.get('[data-testid="overview-content"]').should('not.be.visible');
      
      // Settings tab
      cy.get('[data-testid="tab-settings"]').click();
      cy.get('[data-testid="tab-settings"]').should('have.class', 'active');
      cy.get('[data-testid="settings-content"]').should('be.visible');
    });

    it('should handle tab navigation with keyboard', () => {
      cy.get('[data-testid="tab-overview"]').focus().type('{rightarrow}');
      cy.get('[data-testid="tab-activity"]').should('have.focus');
      
      cy.get('[data-testid="tab-activity"]').type('{rightarrow}');
      cy.get('[data-testid="tab-settings"]').should('have.focus');
      
      cy.get('[data-testid="tab-settings"]').type('{leftarrow}');
      cy.get('[data-testid="tab-activity"]').should('have.focus');
    });

    it('should maintain tab state on page refresh', () => {
      cy.get('[data-testid="tab-activity"]').click();
      cy.reload();
      cy.get('[data-testid="tab-activity"]').should('have.class', 'active');
    });
  });

  describe('User Settings', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.get('[data-testid="tab-settings"]').click();
    });

    it('should display account settings', () => {
      cy.get('[data-testid="settings-content"]').should('be.visible');
      cy.get('[data-testid="notification-preferences"]').should('be.visible');
      cy.get('[data-testid="privacy-settings"]').should('be.visible');
      cy.get('[data-testid="security-settings"]').should('be.visible');
    });

    it('should update notification preferences', () => {
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 200,
        body: { success: true }
      }).as('updateSettings');

      cy.get('[data-testid="toggle-email-notifications"]').click();
      cy.get('[data-testid="toggle-push-notifications"]').click();
      cy.get('[data-testid="button-save-settings"]').click();
      
      cy.wait('@updateSettings');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should handle account deletion request', () => {
      cy.intercept('POST', '/api/account/delete-request', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteRequest');

      cy.get('[data-testid="button-delete-account"]').click();
      cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="input-delete-confirmation"]').type('DELETE');
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteRequest');
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'Account deletion request submitted');
    });

    it('should cancel account deletion request', () => {
      cy.intercept('DELETE', '/api/account/delete-request', {
        statusCode: 200,
        body: { success: true }
      }).as('cancelDeleteRequest');

      cy.get('[data-testid="button-cancel-delete-request"]').click();
      cy.get('[data-testid="cancel-delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="button-confirm-cancel"]').click();
      
      cy.wait('@cancelDeleteRequest');
      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });

  describe('User Activity Feed', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/activities/recent', { fixture: 'activities/user-activities.json' }).as('getActivities');
      cy.visit('/profile');
      cy.get('[data-testid="tab-activity"]').click();
      cy.wait('@getActivities');
    });

    it('should display user activities', () => {
      cy.get('[data-testid="activity-feed"]').should('be.visible');
      cy.get('[data-testid="activity-item"]').should('have.length.greaterThan', 0);
    });

    it('should filter activities by type', () => {
      cy.get('[data-testid="activity-filter-dropdown"]').click();
      cy.get('[data-testid="filter-projects"]').click();
      
      cy.get('[data-testid="activity-item"]').each(($item) => {
        cy.wrap($item).should('contain', 'project');
      });
    });

    it('should handle empty activity state', () => {
      cy.intercept('GET', '/api/activities/recent', { statusCode: 200, body: [] }).as('getEmptyActivities');
      cy.reload();
      cy.wait('@getEmptyActivities');
      
      cy.get('[data-testid="empty-activity-state"]').should('be.visible');
      cy.get('[data-testid="empty-activity-message"]').should('contain.text', 'No recent activity');
    });

    it('should load more activities on scroll', () => {
      cy.intercept('GET', '/api/activities/recent?page=2', { fixture: 'activities/more-activities.json' }).as('getMoreActivities');
      
      cy.get('[data-testid="activity-feed"]').scrollTo('bottom');
      cy.wait('@getMoreActivities');
      
      cy.get('[data-testid="activity-item"]').should('have.length.greaterThan', 10);
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    beforeEach(() => {
      cy.visit('/profile');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('[data-testid="profile-container"]').should('have.attr', 'role', 'main');
      cy.get('[data-testid="profile-tabs"]').should('have.attr', 'role', 'tablist');
      cy.get('[data-testid="tab-overview"]').should('have.attr', 'role', 'tab');
      cy.get('[data-testid="overview-content"]').should('have.attr', 'role', 'tabpanel');
    });

    it('should support screen reader navigation', () => {
      cy.get('[data-testid="profile-name"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="edit-profile-button"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="upload-profile-photo-button"]').should('have.attr', 'aria-label');
    });

    it('should handle focus management in modals', () => {
      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="input-first-name"]').should('have.focus');
      
      cy.get('[data-testid="button-cancel-edit"]').click();
      cy.get('[data-testid="edit-profile-button"]').should('have.focus');
    });

    it('should support high contrast mode', () => {
      cy.get('body').invoke('addClass', 'high-contrast');
      cy.get('[data-testid="profile-container"]').should('be.visible');
      cy.get('[data-testid="edit-profile-button"]').should('have.css', 'border-width').and('not.equal', '0px');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('GET', '/api/auth/user', { forceNetworkError: true }).as('networkError');
      cy.visit('/profile');
      
      cy.get('[data-testid="network-error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle unauthorized access', () => {
      cy.intercept('GET', '/api/auth/user', { statusCode: 401 }).as('unauthorized');
      cy.visit('/profile');
      cy.wait('@unauthorized');
      
      cy.url().should('include', '/login');
    });

    it('should handle profile not found', () => {
      cy.intercept('GET', '/api/auth/user', { statusCode: 404 }).as('notFound');
      cy.visit('/profile');
      cy.wait('@notFound');
      
      cy.get('[data-testid="profile-not-found"]').should('be.visible');
      cy.get('[data-testid="create-profile-button"]').should('be.visible');
    });

    it('should handle slow loading states', () => {
      cy.intercept('GET', '/api/auth/user', (req) => {
        req.reply({ delay: 2000, statusCode: 200, fixture: 'users/current-user.json' });
      }).as('slowLoad');
      
      cy.visit('/profile');
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-skeleton"]').should('be.visible');
      
      cy.wait('@slowLoad');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      cy.get('[data-testid="profile-container"]').should('be.visible');
    });

    it('should handle concurrent edit conflicts', () => {
      cy.intercept('PUT', `/api/users/${testUser.id}`, { statusCode: 409 }).as('editConflict');
      
      cy.get('[data-testid="edit-profile-button"]').click();
      cy.get('[data-testid="input-first-name"]').clear().type('New Name');
      cy.get('[data-testid="button-save-profile"]').click();
      
      cy.wait('@editConflict');
      cy.get('[data-testid="conflict-resolution-modal"]').should('be.visible');
      cy.get('[data-testid="button-reload-profile"]').should('be.visible');
      cy.get('[data-testid="button-force-save"]').should('be.visible');
    });
  });

  describe('Performance and Optimization', () => {
    it('should lazy load profile images', () => {
      cy.visit('/profile');
      cy.get('[data-testid="profile-avatar"] img').should('have.attr', 'loading', 'lazy');
      cy.get('[data-testid="cover-photo-preview"] img').should('have.attr', 'loading', 'lazy');
    });

    it('should debounce search in activity filter', () => {
      cy.visit('/profile');
      cy.get('[data-testid="tab-activity"]').click();
      
      cy.intercept('GET', '/api/activities/recent*').as('searchActivities');
      cy.get('[data-testid="activity-search"]').type('test query', { delay: 100 });
      
      // Should only make one request after debounce
      cy.wait('@searchActivities').then((interception) => {
        expect(interception.request.url).to.include('search=test%20query');
      });
    });

    it('should cache profile data', () => {
      cy.intercept('GET', '/api/auth/user', { fixture: 'users/current-user.json' }).as('getUser');
      
      cy.visit('/profile');
      cy.wait('@getUser');
      
      // Navigate away and back
      cy.visit('/dashboard');
      cy.visit('/profile');
      
      // Should not make another request due to caching
      cy.get('@getUser.all').should('have.length', 1);
      cy.get('[data-testid="profile-container"]').should('be.visible');
    });
  });
});
