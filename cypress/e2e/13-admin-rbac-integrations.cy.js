// ***********************************************
// NICEHR Platform - Admin, RBAC & Integration Tests
// ***********************************************

describe('Administration', () => {
  beforeEach(() => {
    cy.loginViaApi();
  });

  describe('User Management', () => {
    beforeEach(() => {
      cy.navigateTo('users');
      cy.waitForPageLoad();
    });

    describe('User List', () => {
      it('should display users list', () => {
        cy.get('[data-testid="users-table"]').should('be.visible');
      });

      it('should search users', () => {
        cy.get('[data-testid="input-search"]').type('admin');
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
      });

      it('should filter by role', () => {
        cy.selectOption('[data-testid="filter-role"]', 'Admin');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Active');
      });
    });

    describe('Create User', () => {
      it('should create new user', () => {
        const email = `newuser${Date.now()}@test.com`;
        
        cy.openModal('button-create-user');
        cy.get('[data-testid="input-first-name"]').type('New');
        cy.get('[data-testid="input-last-name"]').type('User');
        cy.get('[data-testid="input-email"]').type(email);
        cy.selectOption('[data-testid="select-role"]', 'Consultant');
        
        cy.get('[data-testid="button-submit-user"]').click();
        
        cy.get('[role="dialog"]').should('not.exist');
        cy.tableRowExists(email);
      });

      it('should validate email format', () => {
        cy.openModal('button-create-user');
        cy.get('[data-testid="input-email"]').type('invalid-email');
        cy.get('[data-testid="button-submit-user"]').click();
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });

      it('should prevent duplicate email', () => {
        cy.openModal('button-create-user');
        cy.get('[data-testid="input-email"]').type('test@example.com');
        cy.get('[data-testid="button-submit-user"]').click();
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });
    });

    describe('User Details', () => {
      beforeEach(() => {
        cy.get('table tbody tr').first().click();
        cy.waitForPageLoad();
      });

      it('should display user profile', () => {
        cy.get('[data-testid="user-profile"]').should('be.visible');
      });

      it('should show assigned roles', () => {
        cy.get('[data-testid="user-roles"]').should('be.visible');
      });

      it('should show activity history', () => {
        cy.get('[data-testid="user-activity"]').should('be.visible');
      });

      it('should edit user details', () => {
        cy.get('[data-testid="button-edit-user"]').click();
        cy.get('[data-testid="input-first-name"]').clear().type('Updated');
        cy.get('[data-testid="button-submit-user"]').click();
      });

      it('should deactivate user', () => {
        cy.get('[data-testid="button-deactivate-user"]').click();
        cy.get('[data-testid="button-confirm"]').click();
        cy.get('[data-testid="user-status"]').should('contain', 'Inactive');
      });

      it('should reset user password', () => {
        cy.get('[data-testid="button-reset-password"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });
    });
  });

  describe('Role Management (RBAC)', () => {
    beforeEach(() => {
      cy.navigateTo('roles');
      cy.waitForPageLoad();
    });

    describe('Role List', () => {
      it('should display roles list', () => {
        cy.get('[data-testid="roles-list"]').should('be.visible');
      });

      it('should show base roles', () => {
        cy.get('[data-testid="base-roles"]').should('contain', 'Admin');
        cy.get('[data-testid="base-roles"]').should('contain', 'Manager');
        cy.get('[data-testid="base-roles"]').should('contain', 'Consultant');
      });

      it('should show implementation roles', () => {
        cy.get('[data-testid="implementation-roles"]').should('be.visible');
      });

      it('should show custom roles', () => {
        cy.get('[data-testid="custom-roles"]').should('be.visible');
      });
    });

    describe('Create Custom Role', () => {
      it('should create new role', () => {
        const roleName = `Custom Role ${Date.now()}`;
        
        cy.openModal('button-create-role');
        cy.get('[data-testid="input-role-name"]').type(roleName);
        cy.get('[data-testid="input-role-description"]').type('Custom role description');
        
        // Select permissions
        cy.get('[data-testid="permission-view-projects"]').click();
        cy.get('[data-testid="permission-edit-projects"]').click();
        cy.get('[data-testid="permission-view-timesheets"]').click();
        
        cy.get('[data-testid="button-submit-role"]').click();
        
        cy.get('[data-testid="custom-roles"]').should('contain', roleName);
      });

      it('should validate role name', () => {
        cy.openModal('button-create-role');
        cy.get('[data-testid="button-submit-role"]').click();
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });

      it('should prevent duplicate role names', () => {
        cy.openModal('button-create-role');
        cy.get('[data-testid="input-role-name"]').type('Admin');
        cy.get('[data-testid="button-submit-role"]').click();
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });
    });

    describe('Role Details', () => {
      beforeEach(() => {
        cy.get('[data-testid="role-item"]').first().click();
        cy.waitForPageLoad();
      });

      it('should display role details', () => {
        cy.get('[data-testid="role-details"]').should('be.visible');
      });

      it('should show assigned permissions', () => {
        cy.get('[data-testid="role-permissions"]').should('be.visible');
      });

      it('should show users with role', () => {
        cy.get('[data-testid="role-users"]').should('be.visible');
      });

      it('should edit role permissions', () => {
        cy.get('[data-testid="button-edit-role"]').click();
        cy.get('[data-testid="permission-checkbox"]').first().click();
        cy.get('[data-testid="button-save-role"]').click();
      });
    });

    describe('Permission Matrix', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-permission-matrix"]').click();
      });

      it('should display permission matrix', () => {
        cy.get('[data-testid="permission-matrix"]').should('be.visible');
      });

      it('should show all 15 permission domains', () => {
        cy.get('[data-testid="permission-domain"]').should('have.length.gte', 15);
      });

      it('should toggle permission', () => {
        cy.get('[data-testid="permission-cell"]').first().click();
      });

      it('should save matrix changes', () => {
        cy.get('[data-testid="button-save-matrix"]').click();
      });
    });

    describe('Role Assignment', () => {
      it('should assign role to user', () => {
        cy.get('[data-testid="role-item"]').first().click();
        cy.get('[data-testid="button-assign-user"]').click();
        cy.selectOption('[data-testid="select-user"]', 'user');
        cy.get('[data-testid="button-confirm-assign"]').click();
      });

      it('should remove role from user', () => {
        cy.get('[data-testid="role-item"]').first().click();
        cy.get('[data-testid="role-user-item"]').first()
          .find('[data-testid="button-remove-user"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });

      it('should assign project-specific role', () => {
        cy.get('[data-testid="role-item"]').first().click();
        cy.get('[data-testid="button-assign-user"]').click();
        cy.selectOption('[data-testid="select-user"]', 'user');
        cy.selectOption('[data-testid="select-project-context"]', 'project');
        cy.get('[data-testid="button-confirm-assign"]').click();
      });
    });
  });

  describe('Integration Hub', () => {
    beforeEach(() => {
      cy.navigateTo('integrations');
      cy.waitForPageLoad();
    });

    describe('Integration List', () => {
      it('should display available integrations', () => {
        cy.get('[data-testid="integrations-list"]').should('be.visible');
      });

      it('should show calendar integrations', () => {
        cy.get('[data-testid="calendar-integrations"]').should('be.visible');
        cy.get('[data-testid="calendar-integrations"]').should('contain', 'Google');
        cy.get('[data-testid="calendar-integrations"]').should('contain', 'Outlook');
      });

      it('should show payroll integrations', () => {
        cy.get('[data-testid="payroll-integrations"]').should('be.visible');
        cy.get('[data-testid="payroll-integrations"]').should('contain', 'ADP');
        cy.get('[data-testid="payroll-integrations"]').should('contain', 'Workday');
      });

      it('should show EHR integrations', () => {
        cy.get('[data-testid="ehr-integrations"]').should('be.visible');
        cy.get('[data-testid="ehr-integrations"]').should('contain', 'Epic');
        cy.get('[data-testid="ehr-integrations"]').should('contain', 'Cerner');
      });

      it('should show integration status', () => {
        cy.get('[data-testid="integration-status"]').should('exist');
      });
    });

    describe('Configure Integration', () => {
      it('should configure calendar integration', () => {
        cy.get('[data-testid="integration-google-calendar"]')
          .find('[data-testid="button-configure"]').click();
        cy.get('[data-testid="integration-config-form"]').should('be.visible');
        cy.get('[data-testid="button-connect"]').click();
      });

      it('should configure payroll integration', () => {
        cy.get('[data-testid="integration-adp"]')
          .find('[data-testid="button-configure"]').click();
        cy.get('[data-testid="input-api-key"]').type('test-api-key');
        cy.get('[data-testid="input-company-id"]').type('company123');
        cy.get('[data-testid="button-save-config"]').click();
      });

      it('should test integration connection', () => {
        cy.get('[data-testid="integration-item"]').first()
          .find('[data-testid="button-test-connection"]').click();
        cy.get('[data-testid="connection-test-result"]').should('be.visible');
      });

      it('should disconnect integration', () => {
        cy.get('[data-testid="integration-item"]').first()
          .find('[data-testid="button-disconnect"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });
    });

    describe('Sync Jobs', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-sync-jobs"]').click();
      });

      it('should display sync jobs', () => {
        cy.get('[data-testid="sync-jobs-list"]').should('be.visible');
      });

      it('should show sync job status', () => {
        cy.get('[data-testid="sync-job-status"]').should('exist');
      });

      it('should trigger manual sync', () => {
        cy.get('[data-testid="sync-job-item"]').first()
          .find('[data-testid="button-sync-now"]').click();
      });

      it('should configure sync schedule', () => {
        cy.get('[data-testid="sync-job-item"]').first()
          .find('[data-testid="button-configure-schedule"]').click();
        cy.selectOption('[data-testid="select-frequency"]', 'Hourly');
        cy.get('[data-testid="button-save-schedule"]').click();
      });

      it('should view sync history', () => {
        cy.get('[data-testid="sync-job-item"]').first()
          .find('[data-testid="button-view-history"]').click();
        cy.get('[data-testid="sync-history"]').should('be.visible');
      });
    });

    describe('Event Tracking', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-events"]').click();
      });

      it('should display integration events', () => {
        cy.get('[data-testid="events-list"]').should('be.visible');
      });

      it('should filter by integration', () => {
        cy.selectOption('[data-testid="filter-integration"]', 'Google Calendar');
      });

      it('should filter by event type', () => {
        cy.selectOption('[data-testid="filter-event-type"]', 'Sync');
      });

      it('should view event details', () => {
        cy.get('[data-testid="event-item"]').first().click();
        cy.get('[data-testid="event-details"]').should('be.visible');
      });
    });

    describe('System Health', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-system-health"]').click();
      });

      it('should display system health dashboard', () => {
        cy.get('[data-testid="system-health-dashboard"]').should('be.visible');
      });

      it('should show integration health status', () => {
        cy.get('[data-testid="integration-health"]').should('be.visible');
      });

      it('should show API response times', () => {
        cy.get('[data-testid="api-response-times"]').should('be.visible');
      });

      it('should show error rates', () => {
        cy.get('[data-testid="error-rates"]').should('be.visible');
      });

      it('should show uptime metrics', () => {
        cy.get('[data-testid="uptime-metrics"]').should('be.visible');
      });
    });
  });

  describe('System Settings', () => {
    beforeEach(() => {
      cy.visit('/settings');
      cy.waitForPageLoad();
    });

    describe('General Settings', () => {
      it('should display general settings', () => {
        cy.get('[data-testid="general-settings"]').should('be.visible');
      });

      it('should update company information', () => {
        cy.get('[data-testid="input-company-name"]').clear().type('Updated Company');
        cy.get('[data-testid="button-save-settings"]').click();
      });

      it('should update timezone', () => {
        cy.selectOption('[data-testid="select-timezone"]', 'America/New_York');
        cy.get('[data-testid="button-save-settings"]').click();
      });

      it('should update date format', () => {
        cy.selectOption('[data-testid="select-date-format"]', 'MM/DD/YYYY');
        cy.get('[data-testid="button-save-settings"]').click();
      });
    });

    describe('Notification Settings', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-notifications"]').click();
      });

      it('should configure email notifications', () => {
        cy.get('[data-testid="toggle-email-notifications"]').click();
      });

      it('should configure notification templates', () => {
        cy.get('[data-testid="button-edit-template"]').first().click();
        cy.get('[data-testid="input-template-subject"]').clear().type('Updated Subject');
        cy.get('[data-testid="button-save-template"]').click();
      });
    });

    describe('Security Settings', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-security"]').click();
      });

      it('should configure password policy', () => {
        cy.get('[data-testid="input-min-password-length"]').clear().type('12');
        cy.get('[data-testid="checkbox-require-uppercase"]').click();
        cy.get('[data-testid="button-save-settings"]').click();
      });

      it('should configure session timeout', () => {
        cy.get('[data-testid="input-session-timeout"]').clear().type('30');
        cy.get('[data-testid="button-save-settings"]').click();
      });

      it('should view security logs', () => {
        cy.get('[data-testid="button-view-security-logs"]').click();
        cy.get('[data-testid="security-logs"]').should('be.visible');
      });
    });

    describe('Backup & Restore', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-backup"]').click();
      });

      it('should display backup settings', () => {
        cy.get('[data-testid="backup-settings"]').should('be.visible');
      });

      it('should trigger manual backup', () => {
        cy.get('[data-testid="button-backup-now"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });

      it('should configure backup schedule', () => {
        cy.selectOption('[data-testid="select-backup-frequency"]', 'Daily');
        cy.get('[data-testid="button-save-settings"]').click();
      });

      it('should view backup history', () => {
        cy.get('[data-testid="backup-history"]').should('be.visible');
      });
    });
  });

  describe('Gamification', () => {
    beforeEach(() => {
      cy.visit('/gamification');
      cy.waitForPageLoad();
    });

    describe('Leaderboard', () => {
      it('should display leaderboard', () => {
        cy.get('[data-testid="leaderboard"]').should('be.visible');
      });

      it('should show top performers', () => {
        cy.get('[data-testid="top-performers"]').should('be.visible');
      });

      it('should filter by time period', () => {
        cy.selectOption('[data-testid="filter-period"]', 'This Month');
      });

      it('should filter by category', () => {
        cy.selectOption('[data-testid="filter-category"]', 'Training');
      });
    });

    describe('Achievements & Badges', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-achievements"]').click();
      });

      it('should display achievements', () => {
        cy.get('[data-testid="achievements-list"]').should('be.visible');
      });

      it('should show earned badges', () => {
        cy.get('[data-testid="earned-badges"]').should('be.visible');
      });

      it('should show available badges', () => {
        cy.get('[data-testid="available-badges"]').should('be.visible');
      });

      it('should view badge requirements', () => {
        cy.get('[data-testid="badge-item"]').first().click();
        cy.get('[data-testid="badge-requirements"]').should('be.visible');
      });
    });

    describe('Points System', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-points"]').click();
      });

      it('should display points balance', () => {
        cy.get('[data-testid="points-balance"]').should('be.visible');
      });

      it('should show points history', () => {
        cy.get('[data-testid="points-history"]').should('be.visible');
      });

      it('should show points by activity', () => {
        cy.get('[data-testid="points-by-activity"]').should('be.visible');
      });
    });

    describe('Admin Configuration', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-admin"]').click();
      });

      it('should configure point values', () => {
        cy.get('[data-testid="point-config-item"]').first()
          .find('[data-testid="input-point-value"]').clear().type('10');
        cy.get('[data-testid="button-save-config"]').click();
      });

      it('should create new badge', () => {
        cy.openModal('button-create-badge');
        cy.get('[data-testid="input-badge-name"]').type('New Badge');
        cy.get('[data-testid="input-badge-description"]').type('Badge description');
        cy.get('[data-testid="input-badge-criteria"]').type('Complete 5 trainings');
        cy.get('[data-testid="button-submit-badge"]').click();
      });

      it('should award manual points', () => {
        cy.openModal('button-award-points');
        cy.selectOption('[data-testid="select-user"]', 'user');
        cy.get('[data-testid="input-points"]').type('50');
        cy.get('[data-testid="input-reason"]').type('Special recognition');
        cy.get('[data-testid="button-award"]').click();
      });
    });
  });

  describe('Identity Verification', () => {
    beforeEach(() => {
      cy.visit('/identity-verification');
      cy.waitForPageLoad();
    });

    it('should display verification dashboard', () => {
      cy.get('[data-testid="verification-dashboard"]').should('be.visible');
    });

    it('should show pending verifications', () => {
      cy.get('[data-testid="pending-verifications"]').should('be.visible');
    });

    it('should show verified users', () => {
      cy.get('[data-testid="verified-users"]').should('be.visible');
    });

    it('should initiate verification', () => {
      cy.get('[data-testid="button-start-verification"]').click();
      cy.get('[data-testid="verification-wizard"]').should('be.visible');
    });

    it('should review verification request', () => {
      cy.get('[data-testid="verification-request"]').first().click();
      cy.get('[data-testid="verification-details"]').should('be.visible');
    });

    it('should approve verification', () => {
      cy.get('[data-testid="verification-request"]').first().click();
      cy.get('[data-testid="button-approve-verification"]').click();
      cy.get('[data-testid="button-confirm"]').click();
    });

    it('should reject verification', () => {
      cy.get('[data-testid="verification-request"]').first().click();
      cy.get('[data-testid="button-reject-verification"]').click();
      cy.get('[data-testid="input-rejection-reason"]').type('Documents unclear');
      cy.get('[data-testid="button-confirm-reject"]').click();
    });
  });
});
