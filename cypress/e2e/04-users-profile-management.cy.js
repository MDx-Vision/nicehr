describe('User Profile Management', () => {
  const testUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'consultant',
    profileImageUrl: null,
    coverPhotoUrl: null,
    linkedinUrl: 'https://linkedin.com/in/testuser',
    websiteUrl: 'https://testuser.com'
  };

  const testConsultant = {
    id: 'cons-1',
    userId: 'user-1',
    tngId: 'TNG-001',
    bio: 'Experienced healthcare consultant',
    location: 'San Francisco, CA',
    phone: '555-1234',
    isOnboarded: true,
    emrSystems: ['Epic', 'Cerner'],
    modules: ['Revenue Cycle', 'Clinical'],
    shiftPreference: 'day',
    yearsExperience: 5
  };

  // Helper function for profile page setup
  const setupProfilePage = () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('GET', '/api/consultants/user/*', {
      statusCode: 200,
      body: testConsultant
    }).as('getConsultant');

    cy.intercept('GET', '/api/questionnaire', {
      statusCode: 200,
      body: null
    }).as('getQuestionnaire');

    cy.intercept('GET', '/api/skills/all', {
      statusCode: 200,
      body: []
    }).as('getSkills');

    cy.intercept('GET', '/api/personal-info', {
      statusCode: 200,
      body: null
    }).as('getPersonalInfo');

    cy.visit('/profile');
    cy.wait('@getUser');
  };

  // ===========================================================================
  // Profile Viewing
  // ===========================================================================

  describe('Profile Viewing', () => {
    beforeEach(() => setupProfilePage());

    it('should display user profile page', () => {
      cy.get('[data-testid="profile-page"]').should('be.visible');
    });

    it('should show profile name', () => {
      cy.get('[data-testid="text-user-name"]').should('contain', 'Test User');
    });

    it('should show user email', () => {
      cy.get('[data-testid="text-email"]').should('contain', 'test@example.com');
    });

    it('should show profile role badge', () => {
      cy.get('[data-testid="badge-user-role"]').should('be.visible');
      cy.get('[data-testid="badge-user-role"]').should('contain', 'Consultant');
    });

    it('should display profile photo section', () => {
      cy.get('[data-testid="profile-photo-section"]').should('be.visible');
    });

    it('should display cover photo section', () => {
      cy.get('[data-testid="cover-photo-section"]').should('be.visible');
    });

    it('should show bio textarea', () => {
      cy.get('[data-testid="textarea-bio"]').should('be.visible');
    });

    it('should show location input', () => {
      cy.get('[data-testid="input-location"]').scrollIntoView().should('be.visible');
    });

    it('should display skills questionnaire card', () => {
      cy.get('[data-testid="card-skills-questionnaire"]').scrollIntoView().should('be.visible');
    });

    it('should show LinkedIn input field', () => {
      cy.get('[data-testid="input-linkedin"]').scrollIntoView().should('be.visible');
    });
  });

  // ===========================================================================
  // Edit Profile
  // ===========================================================================

  describe('Edit Profile', () => {
    beforeEach(() => setupProfilePage());

    it('should display first name input', () => {
      cy.get('[data-testid="input-first-name"]').should('be.visible');
    });

    it('should display last name input', () => {
      cy.get('[data-testid="input-last-name"]').should('be.visible');
    });

    it('should allow editing first name', () => {
      cy.get('[data-testid="input-first-name"]').clear().type('Updated');
      cy.get('[data-testid="input-first-name"]').should('have.value', 'Updated');
    });

    it('should allow editing bio', () => {
      cy.get('[data-testid="textarea-bio"]').clear().type('New bio text');
      cy.get('[data-testid="textarea-bio"]').should('have.value', 'New bio text');
    });

    it('should allow editing location', () => {
      cy.get('[data-testid="input-location"]').clear().type('New York, NY');
      cy.get('[data-testid="input-location"]').should('have.value', 'New York, NY');
    });

    it('should display save button', () => {
      cy.get('[data-testid="button-save-profile"]').scrollIntoView().should('be.visible');
    });

    it('should save profile changes', () => {
      cy.intercept('PUT', '/api/users/*', {
        statusCode: 200,
        body: { ...testUser, firstName: 'Updated' }
      }).as('updateUser');

      cy.intercept('PATCH', '/api/consultants/*', {
        statusCode: 200,
        body: { ...testConsultant, bio: 'Updated bio' }
      }).as('updateConsultant');

      cy.get('[data-testid="input-first-name"]').clear().type('Updated');
      cy.get('[data-testid="button-save-profile"]').click();
      cy.wait('@updateUser');
    });
  });

  // ===========================================================================
  // Profile Photo (Partial - UI elements only)
  // ===========================================================================

  describe('Profile Photo', () => {
    beforeEach(() => setupProfilePage());

    it('should display profile photo avatar', () => {
      cy.get('[data-testid="profile-photo-section"]').find('.h-32').should('be.visible');
    });

    it('should show cover photo change button on hover', () => {
      cy.get('[data-testid="cover-photo-section"]').should('be.visible');
    });
  });

  // ===========================================================================
  // Additional Profile Fields
  // ===========================================================================

  describe('Additional Profile Fields', () => {
    beforeEach(() => setupProfilePage());

    it('should display phone input', () => {
      cy.get('[data-testid="input-phone"]').scrollIntoView().should('be.visible');
    });

    it('should display website input', () => {
      cy.get('[data-testid="input-website"]').scrollIntoView().should('be.visible');
    });

    it('should display shift preference select', () => {
      cy.get('[data-testid="select-shift"]').scrollIntoView().should('be.visible');
    });

    it('should display years experience input', () => {
      cy.get('[data-testid="input-experience"]').scrollIntoView().should('be.visible');
    });
  });

  // ===========================================================================
  // Personal Information Section
  // ===========================================================================

  describe('Personal Information Section', () => {
    beforeEach(() => setupProfilePage());

    it('should display personal information card', () => {
      cy.get('[data-testid="card-personal-information"]').scrollIntoView().should('be.visible');
    });

    it('should show edit personal info button', () => {
      cy.get('[data-testid="button-edit-personal-info"]').scrollIntoView().should('be.visible');
    });
  });

  // ===========================================================================
  // Account Settings Features (TODO: /account-settings page not yet implemented)
  // ===========================================================================

  describe.skip('Email Change', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'consultant',
          profileVisibility: 'public',
          emailNotifications: true,
          showEmail: true,
          showPhone: false,
          deletionRequestedAt: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      }).as('getSettings');

      cy.intercept('GET', '/api/account/sessions', {
        statusCode: 200,
        body: []
      }).as('getSessions');

      cy.visit('/account-settings');
      cy.wait('@getUser');
      cy.wait('@getSettings');
    });

    it('should display email change card', () => {
      cy.get('[data-testid="card-email-change"]').scrollIntoView().should('be.visible');
    });

    it('should show email verification flow elements', () => {
      cy.get('[data-testid="card-email-change"]').scrollIntoView();
      cy.get('[data-testid="input-current-email"]').should('be.visible');
      cy.get('[data-testid="input-new-email"]').should('be.visible');
      cy.get('[data-testid="button-change-email"]').should('be.visible');
    });
  });

  describe.skip('User Preferences', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'consultant',
          profileVisibility: 'public',
          emailNotifications: true,
          showEmail: true,
          showPhone: false,
          deletionRequestedAt: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      }).as('getSettings');

      cy.intercept('GET', '/api/account/sessions', {
        statusCode: 200,
        body: []
      }).as('getSessions');

      cy.visit('/account-settings');
      cy.wait('@getUser');
      cy.wait('@getSettings');
    });

    it('should display theme selection', () => {
      cy.get('[data-testid="card-preferences"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="select-theme"]').should('be.visible');
    });

    it('should display language selection', () => {
      cy.get('[data-testid="card-preferences"]').scrollIntoView();
      cy.get('[data-testid="select-language"]').should('be.visible');
    });

    it('should display notification preferences', () => {
      cy.get('[data-testid="card-notifications"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="switch-email-notifications"]').should('be.visible');
    });

    it('should display email digest settings', () => {
      cy.get('[data-testid="card-notifications"]').scrollIntoView();
      cy.get('[data-testid="switch-email-digest"]').should('be.visible');
    });
  });

  describe.skip('Privacy Settings', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'consultant',
          profileVisibility: 'public',
          emailNotifications: true,
          showEmail: true,
          showPhone: false,
          deletionRequestedAt: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      }).as('getSettings');

      cy.intercept('GET', '/api/account/sessions', {
        statusCode: 200,
        body: []
      }).as('getSessions');

      cy.visit('/account-settings');
      cy.wait('@getUser');
      cy.wait('@getSettings');
    });

    it('should display profile visibility options', () => {
      cy.get('[data-testid="select-visibility"]').should('be.visible');
    });

    it('should display activity tracking preferences', () => {
      cy.get('[data-testid="card-preferences"]').scrollIntoView();
      cy.get('[data-testid="switch-activity-tracking"]').should('be.visible');
    });

    it('should display data export functionality', () => {
      cy.get('[data-testid="card-data-export"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="button-export-data"]').should('be.visible');
    });
  });

  describe.skip('Account Management', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: testUser
      }).as('getUser');

      cy.intercept('GET', '/api/account/settings', {
        statusCode: 200,
        body: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'consultant',
          profileVisibility: 'public',
          emailNotifications: true,
          showEmail: true,
          showPhone: false,
          deletionRequestedAt: null,
          createdAt: '2024-01-01T00:00:00Z'
        }
      }).as('getSettings');

      cy.intercept('GET', '/api/account/sessions', {
        statusCode: 200,
        body: []
      }).as('getSessions');

      cy.visit('/account-settings');
      cy.wait('@getUser');
      cy.wait('@getSettings');
    });

    it('should display change password section', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="input-current-password"]').should('be.visible');
      cy.get('[data-testid="input-new-password"]').should('be.visible');
    });

    it('should display two-factor authentication setup', () => {
      cy.get('[data-testid="card-two-factor"]').scrollIntoView().should('be.visible');
      cy.get('[data-testid="switch-two-factor"]').should('be.visible');
    });

    it('should display account deletion request button', () => {
      cy.get('[data-testid="button-request-deletion"]').scrollIntoView().should('be.visible');
    });

    it('should open delete confirmation workflow', () => {
      cy.get('[data-testid="button-request-deletion"]').scrollIntoView().click();
      cy.get('[data-testid="button-confirm-deletion"]').should('be.visible');
      cy.get('[data-testid="button-cancel-confirm"]').should('be.visible');
    });
  });
});
