describe('User Management', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'consultant',
    profileImageUrl: null
  };

  const mockAccountSettings = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    profileImageUrl: null,
    role: 'consultant',
    profileVisibility: 'members_only',
    emailNotifications: true,
    showEmail: true,
    showPhone: false,
    deletionRequestedAt: null,
    createdAt: '2024-01-15T10:00:00Z'
  };

  const mockConsultant = {
    id: 1,
    userId: '1',
    firstName: 'Test',
    lastName: 'User',
    bio: 'Experienced consultant',
    linkedinUrl: 'https://linkedin.com/in/testuser',
    websiteUrl: 'https://testuser.com',
    location: 'New York, NY',
    phone: '555-0123',
    shiftPreference: 'day',
    yearsExperience: 5,
    isOnboarded: true
  };

  describe('User Profile', () => {
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
        body: mockConsultant
      }).as('getConsultant');

      cy.intercept('GET', '/api/questionnaire', {
        statusCode: 200,
        body: null
      }).as('getQuestionnaire');

      cy.intercept('GET', '/api/personal-info', {
        statusCode: 200,
        body: { personalInfoCompleted: false }
      }).as('getPersonalInfo');

      cy.visit('/profile');
      cy.wait('@getUser');
    });

    it('should display user profile information', () => {
      cy.get('[data-testid="profile-page"]').should('be.visible');
      cy.get('[data-testid="text-user-name"]').should('contain', 'Test User');
    });

    it('should display profile form fields', () => {
      cy.get('[data-testid="input-first-name"]').should('be.visible');
      cy.get('[data-testid="input-last-name"]').should('be.visible');
      cy.get('[data-testid="textarea-bio"]').should('be.visible');
    });

    it('should display user role badge', () => {
      cy.get('[data-testid="badge-user-role"]').should('be.visible');
    });

    it('should show save profile button', () => {
      cy.get('[data-testid="button-save-profile"]').scrollIntoView().should('exist');
    });

    it('should allow editing profile fields', () => {
      cy.get('[data-testid="input-first-name"]').clear().type('Updated');
      cy.get('[data-testid="input-first-name"]').should('have.value', 'Updated');
    });

    it('should display skills questionnaire card', () => {
      cy.get('[data-testid="card-skills-questionnaire"]').scrollIntoView().should('exist');
    });

    it('should display personal information card', () => {
      cy.get('[data-testid="card-personal-information"]').scrollIntoView().should('exist');
    });
  });

  describe('Account Settings', () => {
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
        body: mockAccountSettings
      }).as('getAccountSettings');

      cy.visit('/account');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should display account settings page', () => {
      cy.get('[data-testid="text-account-title"]').should('contain', 'Account Settings');
    });

    it('should display user name and email', () => {
      cy.get('[data-testid="text-account-name"]').should('contain', 'Test User');
      cy.get('[data-testid="text-account-email"]').should('contain', 'test@example.com');
    });

    it('should display role badge', () => {
      cy.get('[data-testid="badge-role"]').should('be.visible');
    });

    it('should display member since date', () => {
      cy.get('[data-testid="text-member-since"]').should('be.visible');
    });

    it('should have visibility selector', () => {
      cy.get('[data-testid="select-visibility"]').should('be.visible');
    });

    it('should have email notifications toggle', () => {
      cy.get('[data-testid="switch-email-notifications"]').should('be.visible');
    });

    it('should have show email toggle', () => {
      cy.get('[data-testid="switch-show-email"]').should('be.visible');
    });

    it('should have show phone toggle', () => {
      cy.get('[data-testid="switch-show-phone"]').should('be.visible');
    });

    it('should have account deletion request button', () => {
      cy.get('[data-testid="button-request-deletion"]').scrollIntoView().should('be.visible');
    });
  });

  describe('Notification Preferences', () => {
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
        body: mockAccountSettings
      }).as('getAccountSettings');

      cy.visit('/account');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should toggle email notifications', () => {
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 200,
        body: { ...mockAccountSettings, emailNotifications: false }
      }).as('updateSettings');

      cy.get('[data-testid="switch-email-notifications"]').click();
      cy.wait('@updateSettings');
    });

    it('should toggle show email setting', () => {
      cy.intercept('PATCH', '/api/account/settings', {
        statusCode: 200,
        body: { ...mockAccountSettings, showEmail: false }
      }).as('updateSettings');

      cy.get('[data-testid="switch-show-email"]').click();
      cy.wait('@updateSettings');
    });
  });

  describe('Profile Visibility', () => {
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
        body: mockAccountSettings
      }).as('getAccountSettings');

      cy.visit('/account');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should display visibility options', () => {
      cy.get('[data-testid="select-visibility"]').click();
      cy.contains('Public').should('be.visible');
      cy.contains('Members Only').should('be.visible');
      cy.contains('Private').should('be.visible');
    });
  });

  // ===========================================================================
  // TODO: Advanced User Management Features (Require UI Implementation)
  // ===========================================================================

  describe('Password Management', () => {
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
        body: mockAccountSettings
      }).as('getAccountSettings');

      cy.visit('/account');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should display password change card', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView().should('be.visible');
    });

    it('should display password input fields', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-current-password"]').should('be.visible');
      cy.get('[data-testid="input-new-password"]').should('be.visible');
      cy.get('[data-testid="input-confirm-password"]').should('be.visible');
    });

    it('should display password requirements', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="password-requirements"]').should('contain', 'at least 8 characters');
    });

    it('should show password strength indicator when typing', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-new-password"]').type('weak');
      cy.get('[data-testid="password-strength"]').should('be.visible');
      cy.get('[data-testid="password-strength-label"]').should('contain', 'Weak');
    });

    it('should show Strong password strength for complex password', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-new-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="password-strength-label"]').should('contain', 'Strong');
    });

    it('should show password mismatch error', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-new-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="input-confirm-password"]').type('DifferentPass123!');
      cy.get('[data-testid="password-mismatch"]').should('contain', 'Passwords do not match');
    });

    it('should enable change button when all fields valid', () => {
      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-current-password"]').type('currentPass123');
      cy.get('[data-testid="input-new-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="input-confirm-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="button-change-password"]').should('not.be.disabled');
    });

    it('should change password successfully', () => {
      cy.intercept('POST', '/api/account/change-password', {
        statusCode: 200,
        body: { success: true }
      }).as('changePassword');

      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-current-password"]').type('currentPass123');
      cy.get('[data-testid="input-new-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="input-confirm-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="button-change-password"]').click();
      cy.wait('@changePassword');
    });

    it('should show error for incorrect current password', () => {
      cy.intercept('POST', '/api/account/change-password', {
        statusCode: 400,
        body: { message: 'Current password is incorrect' }
      }).as('changePasswordError');

      cy.get('[data-testid="card-password-change"]').scrollIntoView();
      cy.get('[data-testid="input-current-password"]').type('wrongPassword');
      cy.get('[data-testid="input-new-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="input-confirm-password"]').type('StrongP@ss123!');
      cy.get('[data-testid="button-change-password"]').click();
      cy.wait('@changePasswordError');
    });
  });

  describe('Session Management', () => {
    const mockSessions = [
      {
        id: 'session-1',
        deviceType: 'desktop',
        browser: 'Chrome on macOS',
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.1',
        lastActive: new Date().toISOString(),
        isCurrent: true
      },
      {
        id: 'session-2',
        deviceType: 'mobile',
        browser: 'Safari on iOS',
        location: 'New York, NY',
        ipAddress: '10.0.0.1',
        lastActive: new Date(Date.now() - 3600000).toISOString(),
        isCurrent: false
      }
    ];

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
        body: mockAccountSettings
      }).as('getAccountSettings');

      cy.intercept('GET', '/api/account/sessions', {
        statusCode: 200,
        body: mockSessions
      }).as('getSessions');

      cy.visit('/account');
      cy.wait('@getUser');
      cy.wait('@getAccountSettings');
    });

    it('should display active sessions card', () => {
      cy.get('[data-testid="card-session-management"]').scrollIntoView().should('be.visible');
    });

    it('should display sessions list', () => {
      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="sessions-list"]').should('be.visible');
      cy.get('[data-testid="session-row-session-1"]').should('be.visible');
      cy.get('[data-testid="session-row-session-2"]').should('be.visible');
    });

    it('should show current session badge', () => {
      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="session-row-session-1"]').should('contain', 'Current');
    });

    it('should show terminate button for other sessions', () => {
      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="button-terminate-session-session-2"]').should('be.visible');
    });

    it('should not show terminate button for current session', () => {
      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="button-terminate-session-session-1"]').should('not.exist');
    });

    it('should terminate a specific session', () => {
      cy.intercept('DELETE', '/api/account/sessions/session-2', {
        statusCode: 200,
        body: { success: true }
      }).as('terminateSession');

      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="button-terminate-session-session-2"]').click();
      cy.wait('@terminateSession');
    });

    it('should show sign out all button when other sessions exist', () => {
      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="button-terminate-all-sessions"]').should('be.visible');
    });

    it('should terminate all other sessions', () => {
      cy.intercept('DELETE', '/api/account/sessions', {
        statusCode: 200,
        body: { success: true }
      }).as('terminateAllSessions');

      cy.get('[data-testid="card-session-management"]').scrollIntoView();
      cy.wait('@getSessions');
      cy.get('[data-testid="button-terminate-all-sessions"]').click();
      cy.wait('@terminateAllSessions');
    });
  });
});
