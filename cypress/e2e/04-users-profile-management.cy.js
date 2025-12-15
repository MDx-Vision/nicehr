describe('User Profile Management', () => {
  const mockUser = {
    id: 1,
    email: 'ci-test-user@example.com',
    name: 'CI Test User',
    role: 'admin',
    profilePhoto: 'https://example.com/photo.jpg',
    coverPhoto: 'https://example.com/cover.jpg',
    phone: '+1-555-0123',
    bio: 'Test user bio',
    location: 'Test City, TC',
    timezone: 'America/New_York',
    linkedinUrl: 'https://linkedin.com/in/testuser',
    skills: ['JavaScript', 'React', 'Node.js'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    // Mock authenticated user
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: mockUser
    }).as('getCurrentUser');

    cy.visit('/dashboard');
    cy.wait('@getCurrentUser');
  });

  describe('Profile Viewing', () => {
    it('should display user profile information', () => {
      cy.intercept('GET', '/api/users/1', {
        statusCode: 200,
        body: mockUser
      }).as('getUserProfile');

      cy.visit('/profile/1');
      cy.wait('@getUserProfile');

      cy.get('[data-testid="profile-header"]').should('be.visible');
      cy.get('[data-testid="profile-name"]').should('contain', mockUser.name);
      cy.get('[data-testid="profile-email"]').should('contain', mockUser.email);
      cy.get('[data-testid="profile-role"]').should('contain', mockUser.role);
      cy.get('[data-testid="profile-photo"]').should('have.attr', 'src', mockUser.profilePhoto);
      cy.get('[data-testid="cover-photo"]').should('have.attr', 'src', mockUser.coverPhoto);
    });

    it('should display profile bio and location', () => {
      cy.intercept('GET', '/api/users/1', {
        statusCode: 200,
        body: mockUser
      }).as('getUserProfile');

      cy.visit('/profile/1');
      cy.wait('@getUserProfile');

      cy.get('[data-testid="profile-bio"]').should('contain', mockUser.bio);
      cy.get('[data-testid="profile-location"]').should('contain', mockUser.location);
      cy.get('[data-testid="profile-phone"]').should('contain', mockUser.phone);
      cy.get('[data-testid="profile-linkedin"]')
        .should('have.attr', 'href', mockUser.linkedinUrl)
        .and('have.attr', 'target', '_blank');
    });

    it('should display user skills', () => {
      cy.intercept('GET', '/api/users/1', {
        statusCode: 200,
        body: mockUser
      }).as('getUserProfile');

      cy.visit('/profile/1');
      cy.wait('@getUserProfile');

      cy.get('[data-testid="skills-section"]').should('be.visible');
      mockUser.skills.forEach(skill => {
        cy.get('[data-testid="skill-badge"]').should('contain', skill);
      });
    });

    it('should handle profile not found', () => {
      cy.intercept('GET', '/api/users/999', {
        statusCode: 404,
        body: { error: 'User not found' }
      }).as('getUserNotFound');

      cy.visit('/profile/999');
      cy.wait('@getUserNotFound');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'User not found');
      cy.get('[data-testid="back-button"]').should('be.visible');
    });

    it('should display default profile photo when none exists', () => {
      const userWithoutPhoto = { ...mockUser, profilePhoto: null };
      cy.intercept('GET', '/api/users/1', {
        statusCode: 200,
        body: userWithoutPhoto
      }).as('getUserProfile');

      cy.visit('/profile/1');
      cy.wait('@getUserProfile');

      cy.get('[data-testid="default-profile-photo"]').should('be.visible');
      cy.get('[data-testid="profile-initials"]').should('contain', 'CT');
    });

    it('should be responsive on different screen sizes', () => {
      cy.intercept('GET', '/api/users/1', {
        statusCode: 200,
        body: mockUser
      }).as('getUserProfile');

      // Desktop
      cy.viewport(1200, 800);
      cy.visit('/profile/1');
      cy.wait('@getUserProfile');
      cy.get('[data-testid="profile-sidebar"]').should('be.visible');

      // Tablet
      cy.viewport('ipad-2');
      cy.get('[data-testid="profile-sidebar"]').should('be.visible');

      // Mobile
      cy.viewport('iphone-x');
      cy.get('[data-testid="profile-mobile-header"]').should('be.visible');
    });
  });

  describe('Profile Editing', () => {
    beforeEach(() => {
      cy.visit('/profile/edit');
    });

    it('should display profile edit form', () => {
      cy.get('[data-testid="profile-edit-form"]').should('be.visible');
      cy.get('[data-testid="input-name"]').should('have.value', mockUser.name);
      cy.get('[data-testid="input-email"]').should('have.value', mockUser.email);
      cy.get('[data-testid="input-phone"]').should('have.value', mockUser.phone);
      cy.get('[data-testid="textarea-bio"]').should('have.value', mockUser.bio);
      cy.get('[data-testid="input-location"]').should('have.value', mockUser.location);
      cy.get('[data-testid="select-timezone"]').should('have.value', mockUser.timezone);
      cy.get('[data-testid="input-linkedin"]').should('have.value', mockUser.linkedinUrl);
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="input-name"]').clear();
      cy.get('[data-testid="input-email"]').clear();
      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-name"]').should('contain', 'Name is required');
      cy.get('[data-testid="error-email"]').should('contain', 'Email is required');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="input-email"]').clear().type('invalid-email');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-email"]').should('contain', 'Invalid email format');
    });

    it('should validate phone number format', () => {
      cy.get('[data-testid="input-phone"]').clear().type('invalid-phone');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-phone"]').should('contain', 'Invalid phone number format');
    });

    it('should validate LinkedIn URL format', () => {
      cy.get('[data-testid="input-linkedin"]').clear().type('invalid-url');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.get('[data-testid="error-linkedin"]').should('contain', 'Invalid LinkedIn URL');
    });

    it('should validate bio character limit', () => {
      const longBio = 'a'.repeat(501);
      cy.get('[data-testid="textarea-bio"]').clear().type(longBio);

      cy.get('[data-testid="bio-character-count"]').should('contain', '501/500');
      cy.get('[data-testid="error-bio"]').should('contain', 'Bio must be 500 characters or less');
    });

    it('should save profile successfully', () => {
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        bio: 'Updated bio',
        location: 'Updated City, UC'
      };

      cy.intercept('PUT', '/api/users/1', {
        statusCode: 200,
        body: updatedUser
      }).as('updateProfile');

      cy.get('[data-testid="input-name"]').clear().type(updatedUser.name);
      cy.get('[data-testid="textarea-bio"]').clear().type(updatedUser.bio);
      cy.get('[data-testid="input-location"]').clear().type(updatedUser.location);
      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateProfile');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Profile updated successfully');
    });

    it('should handle save errors gracefully', () => {
      cy.intercept('PUT', '/api/users/1', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateProfileError');

      cy.get('[data-testid="input-name"]').clear().type('Updated Name');
      cy.get('[data-testid="button-save-profile"]').click();

      cy.wait('@updateProfileError');
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Failed to update profile');
    });

    it('should cancel editing and return to profile', () => {
      cy.get('[data-testid="button-cancel-edit"]').click();
      cy.url().should('include', '/profile/1');
    });

    it('should show unsaved changes warning', () => {
      cy.get('[data-testid="input-name"]').clear().type('Changed Name');
      
      // Try to navigate away
      cy.get('[data-testid="nav-dashboard"]').click();
      
      cy.get('[data-testid="unsaved-changes-dialog"]').should('be.visible');
      cy.get('[data-testid="dialog-message"]')
        .should('contain', 'You have unsaved changes');
      
      // Cancel navigation
      cy.get('[data-testid="button-stay"]').click();
      cy.url().should('include', '/profile/edit');
      
      // Confirm navigation
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.get('[data-testid="button-leave"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Profile Photo Management', () => {
    beforeEach(() => {
      cy.visit('/profile/edit');
    });

    it('should display current profile photo', () => {
      cy.get('[data-testid="current-profile-photo"]')
        .should('be.visible')
        .and('have.attr', 'src', mockUser.profilePhoto);
    });

    it('should open photo upload dialog', () => {
      cy.get('[data-testid="button-change-photo"]').click();
      cy.get('[data-testid="photo-upload-dialog"]').should('be.visible');
      cy.get('[data-testid="file-input-photo"]').should('exist');
      cy.get('[data-testid="button-upload-photo"]').should('be.visible');
      cy.get('[data-testid="button-cancel-upload"]').should('be.visible');
    });

    it('should validate photo file type', () => {
      cy.get('[data-testid="button-change-photo"]').click();
      
      const invalidFile = 'invalid-file.txt';
      cy.get('[data-testid="file-input-photo"]').selectFile({
        contents: Cypress.Buffer.from('invalid file content'),
        fileName: invalidFile,
        mimeType: 'text/plain'
      });

      cy.get('[data-testid="error-file-type"]')
        .should('be.visible')
        .and('contain', 'Please select an image file');
    });

    it('should validate photo file size', () => {
      cy.get('[data-testid="button-change-photo"]').click();
      
      // Create a large file (simulate > 5MB)
      const largeFile = new Array(5 * 1024 * 1024 + 1).join('a');
      cy.get('[data-testid="file-input-photo"]').selectFile({
        contents: Cypress.Buffer.from(largeFile),
        fileName: 'large-image.jpg',
        mimeType: 'image/jpeg'
      });

      cy.get('[data-testid="error-file-size"]')
        .should('be.visible')
        .and('contain', 'File size must be less than 5MB');
    });

    it('should upload profile photo successfully', () => {
      cy.intercept('PUT', '/api/users/1/profile-photo', {
        statusCode: 200,
        body: { profilePhoto: 'https://example.com/new-photo.jpg' }
      }).as('uploadPhoto');

      cy.get('[data-testid="button-change-photo"]').click();
      
      cy.get('[data-testid="file-input-photo"]').selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'profile.jpg',
        mimeType: 'image/jpeg'
      });

      cy.get('[data-testid="button-upload-photo"]').click();
      cy.wait('@uploadPhoto');

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Profile photo updated');
      cy.get('[data-testid="photo-upload-dialog"]').should('not.exist');
    });

    it('should remove profile photo', () => {
      cy.intercept('PUT', '/api/users/1/profile-photo', {
        statusCode: 200,
        body: { profilePhoto: null }
      }).as('removePhoto');

      cy.get('[data-testid="button-remove-photo"]').click();
      
      cy.get('[data-testid="confirm-remove-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-remove"]').click();
      
      cy.wait('@removePhoto');
      cy.get('[data-testid="success-message"]')
        .should('contain', 'Profile photo removed');
    });

    it('should preview photo before uploading', () => {
      cy.get('[data-testid="button-change-photo"]').click();
      
      cy.get('[data-testid="file-input-photo"]').selectFile({
        contents: Cypress.Buffer.from('fake image content'),
        fileName: 'preview.jpg',
        mimeType: 'image/jpeg'
      });

      cy.get('[data-testid="photo-preview"]').should('be.visible');
      cy.get('[data-testid="button-upload-photo"]').should('not.be.disabled');
    });
  });

  describe('Cover Photo Management', () => {
    beforeEach(() => {
      cy.visit('/profile/edit');
    });

    it('should manage cover photo similarly to profile photo', () => {
      cy.get('[data-testid="current-cover-photo"]')
        .should('be.visible')
        .and('have.attr', 'src', mockUser.coverPhoto);

      cy.get('[data-testid="button-change-cover"]').click();
      cy.get('[data-testid="cover-upload-dialog"]').should('be.visible');

      cy.intercept('PUT', '/api/users/1/cover-photo', {
        statusCode: 200,
        body: { coverPhoto: 'https://example.com/new-cover.jpg' }
      }).as('uploadCover');

      cy.get('[data-testid="file-input-cover"]').selectFile({
        contents: Cypress.Buffer.from('fake cover content'),
        fileName: 'cover.jpg',
        mimeType: 'image/jpeg'
      });

      cy.get('[data-testid="button-upload-cover"]').click();
      cy.wait('@uploadCover');

      cy.get('[data-testid="success-message"]')
        .should('contain', 'Cover photo updated');
    });
  });

  describe('Skills Management', () => {
    beforeEach(() => {
      cy.visit('/profile/edit');
    });

    it('should display current skills', () => {
      cy.get('[data-testid="skills-section"]').should('be.visible');
      mockUser.skills.forEach(skill => {
        cy.get('[data-testid="current-skill"]').should('contain', skill);
      });
    });

    it('should add new skill', () => {
      cy.get('[data-testid="input-new-skill"]').type('Python');
      cy.get('[data-testid="button-add-skill"]').click();

      cy.get('[data-testid="skill-badge"]').should('contain', 'Python');
      cy.get('[data-testid="input-new-skill"]').should('have.value', '');
    });

    it('should remove skill', () => {
      const skillToRemove = mockUser.skills[0];
      cy.get(`[data-testid="remove-skill-${skillToRemove}"]`).click();
      cy.get('[data-testid="skill-badge"]').should('not.contain', skillToRemove);
    });

    it('should prevent duplicate skills', () => {
      const existingSkill = mockUser.skills[0];
      cy.get('[data-testid="input-new-skill"]').type(existingSkill);
      cy.get('[data-testid="button-add-skill"]').click();

      cy.get('[data-testid="error-duplicate-skill"]')
        .should('be.visible')
        .and('contain', 'Skill already exists');
    });

    it('should limit number of skills', () => {
      // Add skills up to limit (assuming limit is 20)
      for (let i = mockUser.skills.length; i < 20; i++) {
        cy.get('[data-testid="input-new-skill"]').type(`Skill${i}`);
        cy.get('[data-testid="button-add-skill"]').click();
      }

      // Try to add one more
      cy.get('[data-testid="input-new-skill"]').type('ExtraSkill');
      cy.get('[data-testid="button-add-skill"]').should('be.disabled');
      cy.get('[data-testid="skills-limit-message"]')
        .should('contain', 'Maximum 20 skills allowed');
    });
  });

  describe('Account Privacy Settings', () => {
    beforeEach(() => {
      cy.visit('/profile/privacy');
    });

    it('should display privacy settings', () => {
      cy.get('[data-testid="privacy-settings-form"]').should('be.visible');
      cy.get('[data-testid="toggle-profile-visibility"]').should('exist');
      cy.get('[data-testid="toggle-email-visibility"]').should('exist');
      cy.get('[data-testid="toggle-phone-visibility"]').should('exist');
      cy.get('[data-testid="toggle-location-visibility"]').should('exist');
    });

    it('should update privacy settings', () => {
      cy.intercept('PATCH', '/api/users/1', {
        statusCode: 200,
        body: { ...mockUser, profilePublic: false }
      }).as('updatePrivacy');

      cy.get('[data-testid="toggle-profile-visibility"]').click();
      cy.get('[data-testid="button-save-privacy"]').click();

      cy.wait('@updatePrivacy');
      cy.get('[data-testid="success-message"]')
        .should('contain', 'Privacy settings updated');
    });
  });
});
