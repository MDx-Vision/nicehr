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

  beforeEach(() => {
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
  });

  // ===========================================================================
  // Profile Viewing
  // ===========================================================================

  describe('Profile Viewing', () => {
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
    it('should display personal information card', () => {
      cy.get('[data-testid="card-personal-information"]').scrollIntoView().should('be.visible');
    });

    it('should show edit personal info button', () => {
      cy.get('[data-testid="button-edit-personal-info"]').scrollIntoView().should('be.visible');
    });
  });

  // ===========================================================================
  // TODO: Advanced Features (Require Additional Implementation)
  // ===========================================================================

  describe('Email Change', () => {
    it.skip('TODO: Change email address', () => {});
    it.skip('TODO: Email verification flow', () => {});
  });

  describe('User Preferences', () => {
    it.skip('TODO: Theme selection (light/dark)', () => {});
    it.skip('TODO: Language selection', () => {});
    it.skip('TODO: Notification preferences', () => {});
    it.skip('TODO: Email digest settings', () => {});
  });

  describe('Privacy Settings', () => {
    it.skip('TODO: Profile visibility options', () => {});
    it.skip('TODO: Activity tracking preferences', () => {});
    it.skip('TODO: Data export functionality', () => {});
  });

  describe('Account Management', () => {
    it.skip('TODO: Change password', () => {});
    it.skip('TODO: Two-factor authentication setup', () => {});
    it.skip('TODO: Account deletion request', () => {});
    it.skip('TODO: Delete confirmation workflow', () => {});
  });
});
