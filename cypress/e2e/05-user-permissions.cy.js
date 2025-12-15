describe('User Permissions and RBAC', () => {
  const testUsers = {
    admin: { email: 'admin@example.com', role: 'admin' },
    consultant: { email: 'consultant@example.com', role: 'consultant' },
    hospital_admin: { email: 'hospital@example.com', role: 'hospital_admin' },
    readonly: { email: 'readonly@example.com', role: 'readonly' }
  };

  before(() => {
    cy.task('seedTestData');
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/rbac/effective-permissions').as('getPermissions');
    cy.intercept('GET', '/api/rbac/has-permission/*').as('checkPermission');
    cy.intercept('GET', '/api/permissions').as('getAllPermissions');
  });

  describe('Role-Based Access Control', () => {
    describe('Admin User Permissions', () => {
      beforeEach(() => {
        cy.loginAs('admin');
        cy.visit('/admin');
        cy.wait('@getPermissions');
      });

      it('should have access to all admin features', () => {
        cy.get('[data-testid="admin-dashboard"]').should('be.visible');
        cy.get('[data-testid="admin-nav-users"]').should('be.visible');
        cy.get('[data-testid="admin-nav-hospitals"]').should('be.visible');
        cy.get('[data-testid="admin-nav-projects"]').should('be.visible');
        cy.get('[data-testid="admin-nav-settings"]').should('be.visible');
      });

      it('should be able to manage user roles', () => {
        cy.visit('/admin/users');
        cy.get('[data-testid="users-table"]').should('be.visible');
        cy.get('[data-testid="role-select"]').first().should('not.be.disabled');
        cy.get('[data-testid="button-invite-user"]').should('be.visible');
      });

      it('should be able to access RBAC management', () => {
        cy.visit('/admin/rbac');
        cy.get('[data-testid="rbac-page"]').should('be.visible');
        cy.get('[data-testid="roles-section"]').should('be.visible');
        cy.get('[data-testid="permissions-section"]').should('be.visible');
        cy.get('[data-testid="assignments-section"]').should('be.visible');
      });

      it('should be able to create and manage roles', () => {
        cy.intercept('GET', '/api/admin/rbac/roles').as('getRoles');
        cy.intercept('POST', '/api/admin/rbac/roles').as('createRole');
        cy.intercept('DELETE', '/api/admin/rbac/roles/*').as('deleteRole');

        cy.visit('/admin/rbac/roles');
        cy.wait('@getRoles');

        cy.get('[data-testid="button-create-role"]').click();
        cy.get('[data-testid="create-role-dialog"]').should('be.visible');

        cy.get('[data-testid="input-role-name"]').type('Test Role');
        cy.get('[data-testid="input-role-description"]').type('Test role description');
        cy.get('[data-testid="button-save-role"]').click();

        cy.wait('@createRole').its('response.statusCode').should('eq', 200);
        cy.get('[data-testid="success-toast"]').should('contain', 'Role created successfully');
      });

      it('should be able to assign permissions to roles', () => {
        cy.intercept('GET', '/api/admin/rbac/permissions').as('getPermissions');
        cy.intercept('PUT', '/api/admin/rbac/roles/*/permissions').as('updatePermissions');

        cy.visit('/admin/rbac/roles/1/permissions');
        cy.wait('@getPermissions');

        cy.get('[data-testid="permission-checkbox"]').first().check();
        cy.get('[data-testid="button-save-permissions"]').click();

        cy.wait('@updatePermissions').its('response.statusCode').should('eq', 200);
        cy.get('[data-testid="success-toast"]').should('contain', 'Permissions updated');
      });
    });

    describe('Consultant User Permissions', () => {
      beforeEach(() => {
        cy.loginAs('consultant');
      });

      it('should not have access to admin features', () => {
        cy.visit('/admin', { failOnStatusCode: false });
        cy.get('[data-testid="access-denied"]').should('be.visible');
      });

      it('should have access to consultant-specific features', () => {
        cy.visit('/consultant/profile');
        cy.get('[data-testid="consultant-profile"]').should('be.visible');
        
        cy.visit('/consultant/schedules');
        cy.get('[data-testid="schedules-page"]').should('be.visible');
        
        cy.visit('/consultant/timesheets');
        cy.get('[data-testid="timesheets-page"]').should('be.visible');
      });

      it('should be able to update own profile', () => {
        cy.visit('/profile');
        cy.get('[data-testid="edit-profile-button"]').should('be.visible').and('not.be.disabled');
      });

      it('should not be able to update other users', () => {
        cy.request({
          method: 'PUT',
          url: '/api/users/other-user-id',
          failOnStatusCode: false,
          body: { firstName: 'Updated' }
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });

      it('should have limited project access', () => {
        cy.visit('/projects');
        cy.get('[data-testid="projects-list"]').should('be.visible');
        cy.get('[data-testid="project-card"]').should('have.length.lessThan', 10); // Limited view
        cy.get('[data-testid="button-create-project"]').should('not.exist');
      });
    });

    describe('Hospital Admin Permissions', () => {
      beforeEach(() => {
        cy.loginAs('hospital_admin');
      });

      it('should have access to hospital management', () => {
        cy.visit('/hospitals');
        cy.get('[data-testid="hospitals-page"]').should('be.visible');
        cy.get('[data-testid="button-create-hospital"]').should('be.visible');
      });

      it('should be able to manage hospital projects', () => {
        cy.visit('/hospitals/ci-test-hospital/projects');
        cy.get('[data-testid="hospital-projects"]').should('be.visible');
        cy.get('[data-testid="button-create-project"]').should('be.visible');
      });

      it('should not have access to other hospitals', () => {
        cy.request({
          method: 'GET',
          url: '/api/hospitals/other-hospital-id',
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });

      it('should have limited admin features', () => {
        cy.visit('/admin/users', { failOnStatusCode: false });
        cy.get('[data-testid="access-denied"]').should('be.visible');
      });
    });

    describe('Read-Only User Permissions', () => {
      beforeEach(() => {
        cy.loginAs('readonly');
      });

      it('should have read access to permitted resources', () => {
        cy.visit('/dashboard');
        cy.get('[data-testid="dashboard-page"]').should('be.visible');
        
        cy.visit('/projects');
        cy.get('[data-testid="projects-list"]').should('be.visible');
      });

      it('should not be able to create or modify resources', () => {
        cy.visit('/projects');
        cy.get('[data-testid="button-create-project"]').should('not.exist');
        
        cy.get('[data-testid="project-card"]').first().click();
        cy.get('[data-testid="button-edit-project"]').should('not.exist');
      });

      it('should not be able to access sensitive areas', () => {
        cy.visit('/admin', { failOnStatusCode: false });
        cy.get('[data-testid="access-denied"]').should('be.visible');
        
        cy.visit('/account/settings', { failOnStatusCode: false });
        cy.get('[data-testid="access-denied"]').should('be.visible');
      });
    });
  });

  describe('Permission Checks', () => {
    beforeEach(() => {
      cy.loginAs('admin');
    });

    it('should check individual permissions', () => {
      cy.request('GET', '/api/rbac/has-permission/manage_users')
        .its('body.hasPermission').should('be.true');
      
      cy.request('GET', '/api/rbac/has-permission/delete_hospital')
        .its('body.hasPermission').should('be.true');
    });

    it('should get effective permissions', () => {
      cy.request('GET', '/api/rbac/effective-permissions')
        .then((response) => {
          expect(response.body.permissions).to.be.an('array');
          expect(response.body.permissions).to.include('manage_users');
        });
    });

    it('should handle non-existent permissions', () => {
      cy.request({
        method: 'GET',
        url: '/api/rbac/has-permission/non_existent_permission',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Dynamic Permission Updates', () => {
    beforeEach(() => {
      cy.loginAs('admin');
    });

    it('should reflect permission changes immediately', () => {
      // Create a new role with limited permissions
      cy.request('POST', '/api/admin/rbac/roles', {
        name: 'Limited Test Role',
        description: 'Role for testing permission updates'
      }).then((response) => {
        const roleId = response.body.id;

        // Assign user to the new role
        cy.request('POST', '/api/admin/rbac/assignments', {
          userId: 'test-user-id',
          roleId: roleId
        });

        // Login as the test user
        cy.loginAs('test-user');
        
        // Verify limited access
        cy.visit('/admin', { failOnStatusCode: false });
        cy.get('[data-testid="access-denied"]').should('be.visible');

        // Admin updates permissions
        cy.loginAs('admin');
        cy.request('PUT', `/api/admin/rbac/roles/${roleId}/permissions`, {
          permissions: ['admin_access']
        });

        // User should now have access (after re-login)
        cy.loginAs('test-user');
        cy.visit('/admin');
        cy.get('[data-testid="admin-dashboard"]').should('be.visible');
      });
    });
  });

  describe('Permission Inheritance', () => {
    beforeEach(() => {
      cy.loginAs('admin');
    });

    it('should inherit permissions from multiple roles', () => {
      // Create user with multiple roles
      cy.request('POST', '/api/admin/rbac/assignments', {
        userId: 'multi-role-user',
        roleId: 'consultant-role'
      });

      cy.request('POST', '/api/admin/rbac/assignments', {
        userId: 'multi-role-user',
        roleId: 'hospital-admin-role'
      });

      cy.loginAs('multi-role-user');
      
      // Should have permissions from both roles
      cy.request('GET', '/api/rbac/effective-permissions')
        .then((response) => {
          const permissions = response.body.permissions;
          expect(permissions).to.include('manage_schedule');  // consultant permission
          expect(permissions).to.include('manage_hospital');  // hospital admin permission
        });
    });
  });

  describe('Context-Based Permissions', () => {
    beforeEach(() => {
      cy.loginAs('consultant');
    });

    it('should have different permissions in different contexts', () => {
      // Own profile - should have edit access
      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').should('be.visible');

      // Own consultant record - should have edit access
      cy.visit('/consultants/own-id');
      cy.get('[data-testid="edit-consultant-button"]').should('be.visible');

      // Other consultant record - should not have edit access
      cy.visit('/consultants/other-id');
      cy.get('[data-testid="edit-consultant-button"]').should('not.exist');
    });

    it('should respect project-specific permissions', () => {
      // Assigned project - should have access
      cy.visit('/projects/assigned-project-id');
      cy.get('[data-testid="project-details"]').should('be.visible');

      // Unassigned project - should not have access
      cy.visit('/projects/unassigned-project-id', { failOnStatusCode: false });
      cy.get('[data-testid="access-denied"]').should('be.visible');
    });
  });

  describe('Permission UI Components', () => {
    beforeEach(() => {
      cy.loginAs('admin');
    });

    it('should show/hide elements based on permissions', () => {
      cy.visit('/projects');
      
      // Admin should see create button
      cy.get('[data-testid="button-create-project"]').should('be.visible');
      
      // Switch to consultant role
      cy.loginAs('consultant');
      cy.visit('/projects');
      
      // Consultant should not see create button
      cy.get('[data-testid="button-create-project"]').should('not.exist');
    });

    it('should disable elements based on permissions', () => {
      cy.visit('/projects/test-project/settings');
      
      // Admin should have enabled settings
      cy.get('[data-testid="project-settings-form"] input').should('not.be.disabled');
      
      // Switch to readonly
      cy.loginAs('readonly');
      cy.visit('/projects/test-project/settings');
      
      // Readonly should have disabled settings
      cy.get('[data-testid="project-settings-form"] input').should('be.disabled');
    });
  });

  describe('Error Handling', () => {
    it('should handle permission check failures gracefully', () => {
      cy.intercept('GET', '/api/rbac/has-permission/*', { statusCode: 500 }).as('permissionError');
      
      cy.loginAs('admin');
      cy.visit('/admin');
      
      // Should show error state but not crash
      cy.get('[data-testid="permission-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle network errors in permission checks', () => {
      cy.intercept('GET', '/api/rbac/effective-permissions', { forceNetworkError: true }).as('networkError');
      
      cy.loginAs('admin');
      cy.visit('/admin');
      
      cy.get('[data-testid="permission-loading"]').should('be.visible');
      cy.get('[data-testid="permission-error"]').should('be.visible');
    });
  });

  describe('Audit Trail', () => {
    beforeEach(() => {
      cy.loginAs('admin');
    });

    it('should log permission changes', () => {
      cy.intercept('GET', '/api/admin/access-audit').as('getAuditLog');
      
      // Make a permission change
      cy.request('PUT', '/api/admin/rbac/roles/1/permissions', {
        permissions: ['new_permission']
      });

      // Check audit log
      cy.visit('/admin/audit');
      cy.wait('@getAuditLog');
      
      cy.get('[data-testid="audit-entry"]').first()
        .should('contain', 'permissions updated');
    });

    it('should log access attempts', () => {
      cy.loginAs('consultant');
      cy.visit('/admin', { failOnStatusCode: false });
      
      cy.loginAs('admin');
      cy.visit('/admin/audit');
      
      cy.get('[data-testid="audit-entry"]').should('contain', 'Access denied');
    });
  });
});
