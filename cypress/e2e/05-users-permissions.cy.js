describe('User Permissions and RBAC', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  };

  const consultantUser = {
    email: 'consultant@example.com',
    password: 'password123',
    role: 'consultant'
  };

  const managerUser = {
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should display admin-only sections for admin users', () => {
      // Login as admin
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(adminUser.email);
      cy.get('[data-testid="input-password"]').type(adminUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: {
          permissions: [
            'users:read',
            'users:write',
            'users:delete',
            'admin:access',
            'hospitals:manage',
            'projects:manage'
          ]
        }
      }).as('getPermissions');

      cy.visit('/dashboard');
      cy.wait('@getPermissions');

      // Should see admin navigation items
      cy.get('[data-testid="nav-admin"]').should('be.visible');
      cy.get('[data-testid="nav-user-management"]').should('be.visible');
      cy.get('[data-testid="nav-system-settings"]').should('be.visible');
    });

    it('should hide admin sections from non-admin users', () => {
      // Login as consultant
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(consultantUser.email);
      cy.get('[data-testid="input-password"]').type(consultantUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: {
          permissions: [
            'profile:read',
            'profile:write',
            'projects:read',
            'timesheets:manage'
          ]
        }
      }).as('getConsultantPermissions');

      cy.visit('/dashboard');
      cy.wait('@getConsultantPermissions');

      // Should not see admin navigation items
      cy.get('[data-testid="nav-admin"]').should('not.exist');
      cy.get('[data-testid="nav-user-management"]').should('not.exist');
      cy.get('[data-testid="nav-system-settings"]').should('not.exist');
    });

    it('should check specific permissions for actions', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(managerUser.email);
      cy.get('[data-testid="input-password"]').type(managerUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/has-permission/users:write', {
        statusCode: 200,
        body: { hasPermission: true }
      }).as('checkUserWritePermission');

      cy.visit('/admin/users');
      cy.wait('@checkUserWritePermission');

      // Should show edit buttons if user has write permission
      cy.get('[data-testid="button-edit-user"]').should('be.visible');
    });

    it('should deny access to unauthorized pages', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(consultantUser.email);
      cy.get('[data-testid="input-password"]').type(consultantUser.password);
      cy.get('[data-testid="button-login"]').click();

      // Try to access admin page
      cy.visit('/admin/users');
      cy.url().should('include', '/unauthorized');
      cy.get('[data-testid="access-denied-message"]').should('be.visible');
    });
  });

  describe('Permission Management', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(adminUser.email);
      cy.get('[data-testid="input-password"]').type(adminUser.password);
      cy.get('[data-testid="button-login"]').click();
    });

    it('should display all available permissions', () => {
      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: {
          permissions: [
            { name: 'users:read', description: 'View users' },
            { name: 'users:write', description: 'Edit users' },
            { name: 'users:delete', description: 'Delete users' },
            { name: 'projects:read', description: 'View projects' },
            { name: 'projects:write', description: 'Edit projects' }
          ]
        }
      }).as('getPermissions');

      cy.visit('/admin/permissions');
      cy.wait('@getPermissions');

      cy.get('[data-testid="permissions-list"]').should('be.visible');
      cy.get('[data-testid="permission-users-read"]').should('contain', 'View users');
      cy.get('[data-testid="permission-users-write"]').should('contain', 'Edit users');
    });

    it('should display user effective permissions', () => {
      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: {
          permissions: ['users:read', 'users:write', 'projects:read'],
          roles: ['admin'],
          inheritedPermissions: ['users:read', 'projects:read'],
          directPermissions: ['users:write']
        }
      }).as('getEffectivePermissions');

      cy.visit('/admin/users/user-1/permissions');
      cy.wait('@getEffectivePermissions');

      cy.get('[data-testid="effective-permissions"]').should('be.visible');
      cy.get('[data-testid="inherited-permissions"]').should('contain', 'users:read');
      cy.get('[data-testid="direct-permissions"]').should('contain', 'users:write');
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(adminUser.email);
      cy.get('[data-testid="input-password"]').type(adminUser.password);
      cy.get('[data-testid="button-login"]').click();
    });

    it('should display all roles', () => {
      cy.intercept('GET', '/api/admin/rbac/roles', {
        statusCode: 200,
        body: {
          roles: [
            {
              id: 'role-1',
              name: 'admin',
              description: 'Full system access',
              permissions: ['*']
            },
            {
              id: 'role-2',
              name: 'manager',
              description: 'Manage projects and users',
              permissions: ['users:read', 'users:write', 'projects:manage']
            },
            {
              id: 'role-3',
              name: 'consultant',
              description: 'Basic user access',
              permissions: ['profile:read', 'profile:write']
            }
          ]
        }
      }).as('getRoles');

      cy.visit('/admin/roles');
      cy.wait('@getRoles');

      cy.get('[data-testid="roles-table"]').should('be.visible');
      cy.get('[data-testid="role-row-role-1"]').should('contain', 'admin');
      cy.get('[data-testid="role-row-role-2"]').should('contain', 'manager');
      cy.get('[data-testid="role-row-role-3"]').should('contain', 'consultant');
    });

    it('should create a new role', () => {
      cy.intercept('POST', '/api/admin/rbac/roles', {
        statusCode: 201,
        body: {
          id: 'role-4',
          name: 'supervisor',
          description: 'Supervise consultants',
          permissions: []
        }
      }).as('createRole');

      cy.visit('/admin/roles');
      cy.get('[data-testid="button-add-role"]').click();

      cy.get('[data-testid="modal-create-role"]').should('be.visible');
      cy.get('[data-testid="input-role-name"]').type('supervisor');
      cy.get('[data-testid="input-role-description"]').type('Supervise consultants');
      cy.get('[data-testid="button-save-role"]').click();

      cy.wait('@createRole');
      cy.get('[data-testid="success-message"]').should('contain', 'Role created successfully');
    });

    it('should update role permissions', () => {
      cy.intercept('PUT', '/api/admin/rbac/roles/*/permissions', {
        statusCode: 200,
        body: { success: true }
      }).as('updateRolePermissions');

      cy.visit('/admin/roles/role-2/edit');
      
      // Add new permission
      cy.get('[data-testid="checkbox-permission-users-delete"]').check();
      cy.get('[data-testid="button-save-permissions"]').click();

      cy.wait('@updateRolePermissions').then((interception) => {
        expect(interception.request.body.permissions).to.include('users:delete');
      });

      cy.get('[data-testid="success-message"]').should('contain', 'Permissions updated');
    });

    it('should delete a role', () => {
      cy.intercept('DELETE', '/api/admin/rbac/roles/*', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteRole');

      cy.visit('/admin/roles');
      cy.get('[data-testid="button-delete-role-role-3"]').click();

      cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.wait('@deleteRole');
      cy.get('[data-testid="success-message"]').should('contain', 'Role deleted successfully');
    });

    it('should validate role creation', () => {
      cy.visit('/admin/roles');
      cy.get('[data-testid="button-add-role"]').click();
      
      // Try to save without name
      cy.get('[data-testid="button-save-role"]').click();
      cy.get('[data-testid="error-role-name"]').should('contain', 'Role name is required');

      // Try to save with duplicate name
      cy.intercept('POST', '/api/admin/rbac/roles', {
        statusCode: 400,
        body: { error: 'Role name already exists' }
      }).as('duplicateRoleError');

      cy.get('[data-testid="input-role-name"]').type('admin');
      cy.get('[data-testid="button-save-role"]').click();

      cy.wait('@duplicateRoleError');
      cy.get('[data-testid="error-message"]').should('contain', 'Role name already exists');
    });
  });

  describe('Role Assignments', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(adminUser.email);
      cy.get('[data-testid="input-password"]').type(adminUser.password);
      cy.get('[data-testid="button-login"]').click();
    });

    it('should display user role assignments', () => {
      cy.intercept('GET', '/api/admin/rbac/assignments', {
        statusCode: 200,
        body: {
          assignments: [
            {
              userId: 'user-1',
              userName: 'John Doe',
              userEmail: 'john@example.com',
              roles: ['consultant', 'project-lead']
            },
            {
              userId: 'user-2',
              userName: 'Jane Smith',
              userEmail: 'jane@example.com',
              roles: ['admin']
            }
          ]
        }
      }).as('getRoleAssignments');

      cy.visit('/admin/role-assignments');
      cy.wait('@getRoleAssignments');

      cy.get('[data-testid="assignments-table"]').should('be.visible');
      cy.get('[data-testid="user-roles-user-1"]').should('contain', 'consultant');
      cy.get('[data-testid="user-roles-user-1"]').should('contain', 'project-lead');
      cy.get('[data-testid="user-roles-user-2"]').should('contain', 'admin');
    });

    it('should assign role to user', () => {
      cy.intercept('POST', '/api/admin/rbac/assignments', {
        statusCode: 200,
        body: { success: true }
      }).as('assignRole');

      cy.visit('/admin/role-assignments');
      cy.get('[data-testid="button-assign-role-user-1"]').click();

      cy.get('[data-testid="modal-assign-role"]').should('be.visible');
      cy.get('[data-testid="select-role"]').select('manager');
      cy.get('[data-testid="button-assign"]').click();

      cy.wait('@assignRole').then((interception) => {
        expect(interception.request.body).to.deep.include({
          userId: 'user-1',
          role: 'manager'
        });
      });

      cy.get('[data-testid="success-message"]').should('contain', 'Role assigned successfully');
    });

    it('should remove role from user', () => {
      cy.intercept('DELETE', '/api/admin/rbac/assignments', {
        statusCode: 200,
        body: { success: true }
      }).as('removeRole');

      cy.visit('/admin/role-assignments');
      cy.get('[data-testid="button-remove-role-user-1-consultant"]').click();

      cy.get('[data-testid="confirm-remove-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm-remove"]').click();

      cy.wait('@removeRole').then((interception) => {
        expect(interception.request.body).to.deep.include({
          userId: 'user-1',
          role: 'consultant'
        });
      });

      cy.get('[data-testid="success-message"]').should('contain', 'Role removed successfully');
    });

    it('should prevent removing last admin role', () => {
      cy.intercept('DELETE', '/api/admin/rbac/assignments', {
        statusCode: 400,
        body: { error: 'Cannot remove last admin user' }
      }).as('removeLastAdmin');

      cy.visit('/admin/role-assignments');
      cy.get('[data-testid="button-remove-role-user-2-admin"]').click();
      cy.get('[data-testid="button-confirm-remove"]').click();

      cy.wait('@removeLastAdmin');
      cy.get('[data-testid="error-message"]').should('contain', 'Cannot remove last admin user');
    });
  });

  describe('Permission-Based UI Rendering', () => {
    it('should show/hide buttons based on permissions', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(consultantUser.email);
      cy.get('[data-testid="input-password"]').type(consultantUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/has-permission/users:write', {
        statusCode: 200,
        body: { hasPermission: false }
      }).as('checkWritePermission');

      cy.visit('/profile');
      cy.wait('@checkWritePermission');

      // Should not show edit buttons without write permission
      cy.get('[data-testid="button-edit-profile"]').should('not.exist');
    });

    it('should disable actions without permissions', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(consultantUser.email);
      cy.get('[data-testid="input-password"]').type(consultantUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/has-permission/users:delete', {
        statusCode: 200,
        body: { hasPermission: false }
      }).as('checkDeletePermission');

      cy.visit('/admin/users');
      cy.wait('@checkDeletePermission');

      // Delete button should be disabled
      cy.get('[data-testid="button-delete-user"]').should('be.disabled');
    });

    it('should show permission tooltips', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(consultantUser.email);
      cy.get('[data-testid="input-password"]').type(consultantUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.visit('/admin/users');
      cy.get('[data-testid="button-delete-user"]').trigger('mouseover');
      cy.get('[data-testid="tooltip"]').should('contain', 'Insufficient permissions');
    });
  });

  describe('Access Audit Logging', () => {
    beforeEach(() => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(adminUser.email);
      cy.get('[data-testid="input-password"]').type(adminUser.password);
      cy.get('[data-testid="button-login"]').click();
    });

    it('should display access audit logs', () => {
      cy.intercept('GET', '/api/admin/access-audit', {
        statusCode: 200,
        body: {
          logs: [
            {
              id: 'log-1',
              userId: 'user-1',
              userName: 'John Doe',
              action: 'users:read',
              resource: '/api/consultants',
              timestamp: '2024-01-15T10:00:00Z',
              success: true
            },
            {
              id: 'log-2',
              userId: 'user-2',
              userName: 'Jane Smith',
              action: 'users:delete',
              resource: '/api/users/user-3',
              timestamp: '2024-01-15T09:30:00Z',
              success: false,
              reason: 'Insufficient permissions'
            }
          ]
        }
      }).as('getAuditLogs');

      cy.visit('/admin/audit-logs');
      cy.wait('@getAuditLogs');

      cy.get('[data-testid="audit-table"]').should('be.visible');
      cy.get('[data-testid="audit-log-log-1"]').should('contain', 'John Doe');
      cy.get('[data-testid="audit-log-log-1"]').should('contain', 'users:read');
      cy.get('[data-testid="audit-success-log-1"]').should('contain', 'Success');
      
      cy.get('[data-testid="audit-log-log-2"]').should('contain', 'Jane Smith');
      cy.get('[data-testid="audit-log-log-2"]').should('contain', 'users:delete');
      cy.get('[data-testid="audit-success-log-2"]').should('contain', 'Failed');
    });

    it('should filter audit logs by user', () => {
      cy.intercept('GET', '/api/admin/access-audit?userId=user-1', {
        statusCode: 200,
        body: {
          logs: [
            {
              id: 'log-1',
              userId: 'user-1',
              userName: 'John Doe',
              action: 'users:read',
              resource: '/api/consultants',
              timestamp: '2024-01-15T10:00:00Z',
              success: true
            }
          ]
        }
      }).as('getFilteredLogs');

      cy.visit('/admin/audit-logs');
      cy.get('[data-testid="filter-user"]').select('John Doe');
      cy.wait('@getFilteredLogs');

      cy.get('[data-testid="audit-table"] tbody tr').should('have.length', 1);
    });

    it('should filter audit logs by date range', () => {
      cy.intercept('GET', '/api/admin/access-audit?startDate=2024-01-01&endDate=2024-01-31', {
        statusCode: 200,
        body: { logs: [] }
      }).as('getDateFilteredLogs');

      cy.visit('/admin/audit-logs');
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-01-31');
      cy.get('[data-testid="button-apply-filters"]').click();

      cy.wait('@getDateFilteredLogs');
    });
  });

  describe('Error Handling for Permissions', () => {
    it('should handle permission check failures gracefully', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(consultantUser.email);
      cy.get('[data-testid="input-password"]').type(consultantUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/has-permission/*', {
        statusCode: 500,
        body: { error: 'Permission check failed' }
      }).as('permissionError');

      cy.visit('/dashboard');
      cy.wait('@permissionError');

      // Should default to restrictive permissions on error
      cy.get('[data-testid="nav-admin"]').should('not.exist');
    });

    it('should retry failed permission checks', () => {
      cy.visit('/login');
      cy.get('[data-testid="input-email"]').type(adminUser.email);
      cy.get('[data-testid="input-password"]').type(adminUser.password);
      cy.get('[data-testid="button-login"]').click();

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('permissionsFailed');

      cy.visit('/dashboard');
      cy.wait('@permissionsFailed');
      
      cy.get('[data-testid="button-retry-permissions"]').click();
    });
  });
});
