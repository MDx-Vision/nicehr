describe('User Role Management', () => {
  const testUsers = [
    { id: '1', email: 'admin@example.com', role: 'admin', name: 'Admin User' },
    { id: '2', email: 'consultant@example.com', role: 'consultant', name: 'Consultant User' },
    { id: '3', email: 'hospital@example.com', role: 'hospital_admin', name: 'Hospital Admin' }
  ];

  const availableRoles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'consultant', name: 'Consultant', description: 'Consultant access' },
    { id: 'hospital_admin', name: 'Hospital Admin', description: 'Hospital management' },
    { id: 'project_manager', name: 'Project Manager', description: 'Project management' }
  ];

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  describe('Role Management UI', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/admin/rbac/roles', { statusCode: 200, body: availableRoles }).as('getRoles');
      cy.visit('/admin/roles');
      cy.wait('@getRoles');
    });

    it('should display roles management interface', () => {
      cy.get('[data-testid="roles-container"]').should('be.visible');
      cy.get('[data-testid="roles-header"]').should('contain.text', 'Role Management');
      cy.get('[data-testid="create-role-button"]').should('be.visible');
      cy.get('[data-testid="roles-table"]').should('be.visible');
    });

    it('should display all roles in table', () => {
      cy.get('[data-testid="role-row"]').should('have.length', availableRoles.length);
      
      availableRoles.forEach((role, index) => {
        cy.get('[data-testid="role-row"]').eq(index).within(() => {
          cy.get('[data-testid="role-name"]').should('contain.text', role.name);
          cy.get('[data-testid="role-description"]').should('contain.text', role.description);
          cy.get('[data-testid="edit-role-button"]').should('be.visible');
          cy.get('[data-testid="delete-role-button"]').should('be.visible');
        });
      });
    });

    it('should handle responsive table layout', () => {
      // Mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="roles-mobile-cards"]').should('be.visible');
      cy.get('[data-testid="roles-table"]').should('not.be.visible');
      
      // Desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="roles-table"]').should('be.visible');
      cy.get('[data-testid="roles-mobile-cards"]').should('not.be.visible');
    });
  });

  describe('Create New Role', () => {
    beforeEach(() => {
      cy.visit('/admin/roles');
      cy.get('[data-testid="create-role-button"]').click();
    });

    it('should display create role modal', () => {
      cy.get('[data-testid="create-role-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Create New Role');
      cy.get('[data-testid="input-role-name"]').should('be.visible');
      cy.get('[data-testid="input-role-description"]').should('be.visible');
      cy.get('[data-testid="permissions-section"]').should('be.visible');
      cy.get('[data-testid="button-create-role"]').should('be.visible');
      cy.get('[data-testid="button-cancel"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="button-create-role"]').click();
      
      cy.get('[data-testid="error-role-name"]').should('be.visible')
        .and('contain.text', 'Role name is required');
    });

    it('should validate role name uniqueness', () => {
      cy.get('[data-testid="input-role-name"]').type('Administrator');
      cy.get('[data-testid="input-role-description"]').type('Test description');
      cy.get('[data-testid="button-create-role"]').click();
      
      cy.intercept('POST', '/api/admin/rbac/roles', { statusCode: 409 }).as('duplicateRole');
      cy.wait('@duplicateRole');
      
      cy.get('[data-testid="error-role-name"]').should('be.visible')
        .and('contain.text', 'Role name already exists');
    });

    it('should successfully create new role', () => {
      const newRole = {
        name: 'Quality Manager',
        description: 'Manages quality assurance processes'
      };

      cy.intercept('POST', '/api/admin/rbac/roles', {
        statusCode: 201,
        body: { id: '5', ...newRole }
      }).as('createRole');

      cy.get('[data-testid="input-role-name"]').type(newRole.name);
      cy.get('[data-testid="input-role-description"]').type(newRole.description);
      
      // Select permissions
      cy.get('[data-testid="permission-projects_read"]').check();
      cy.get('[data-testid="permission-quality_manage"]').check();
      
      cy.get('[data-testid="button-create-role"]').click();
      
      cy.wait('@createRole');
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'Role created successfully');
      cy.get('[data-testid="create-role-modal"]').should('not.exist');
    });

    it('should handle create role errors', () => {
      cy.intercept('POST', '/api/admin/rbac/roles', { statusCode: 500 }).as('createError');

      cy.get('[data-testid="input-role-name"]').type('Test Role');
      cy.get('[data-testid="input-role-description"]').type('Test description');
      cy.get('[data-testid="button-create-role"]').click();
      
      cy.wait('@createError');
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Failed to create role');
    });

    it('should cancel role creation', () => {
      cy.get('[data-testid="input-role-name"]').type('Test Role');
      cy.get('[data-testid="button-cancel"]').click();
      
      cy.get('[data-testid="create-role-modal"]').should('not.exist');
    });
  });

  describe('Edit Existing Role', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/admin/rbac/roles/admin', {
        statusCode: 200,
        body: { ...availableRoles[0], permissions: ['users_manage', 'roles_manage'] }
      }).as('getRole');
      
      cy.visit('/admin/roles');
      cy.get('[data-testid="role-row"]').first().within(() => {
        cy.get('[data-testid="edit-role-button"]').click();
      });
      cy.wait('@getRole');
    });

    it('should display edit role modal with current data', () => {
      cy.get('[data-testid="edit-role-modal"]').should('be.visible');
      cy.get('[data-testid="modal-title"]').should('contain.text', 'Edit Role');
      cy.get('[data-testid="input-role-name"]').should('have.value', 'Administrator');
      cy.get('[data-testid="input-role-description"]').should('have.value', 'Full system access');
      cy.get('[data-testid="permission-users_manage"]').should('be.checked');
      cy.get('[data-testid="permission-roles_manage"]').should('be.checked');
    });

    it('should successfully update role', () => {
      const updatedRole = {
        name: 'System Administrator',
        description: 'Complete system administration access'
      };

      cy.intercept('PATCH', '/api/admin/rbac/roles/admin', {
        statusCode: 200,
        body: { id: 'admin', ...updatedRole }
      }).as('updateRole');

      cy.get('[data-testid="input-role-name"]').clear().type(updatedRole.name);
      cy.get('[data-testid="input-role-description"]').clear().type(updatedRole.description);
      
      // Update permissions
      cy.get('[data-testid="permission-analytics_view"]').check();
      
      cy.get('[data-testid="button-update-role"]').click();
      
      cy.wait('@updateRole');
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'Role updated successfully');
      cy.get('[data-testid="edit-role-modal"]').should('not.exist');
    });

    it('should prevent editing system roles', () => {
      cy.get('[data-testid="input-role-name"]').should('be.disabled');
      cy.get('[data-testid="system-role-warning"]').should('be.visible')
        .and('contain.text', 'System roles cannot be renamed');
    });

    it('should handle update errors', () => {
      cy.intercept('PATCH', '/api/admin/rbac/roles/admin', { statusCode: 500 }).as('updateError');

      cy.get('[data-testid="input-role-description"]').clear().type('Updated description');
      cy.get('[data-testid="button-update-role"]').click();
      
      cy.wait('@updateError');
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Failed to update role');
    });
  });

  describe('Delete Role', () => {
    beforeEach(() => {
      cy.visit('/admin/roles');
    });

    it('should show delete confirmation', () => {
      cy.get('[data-testid="role-row"]').last().within(() => {
        cy.get('[data-testid="delete-role-button"]').click();
      });
      
      cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="confirmation-message"]').should('contain.text', 'Are you sure you want to delete this role?');
      cy.get('[data-testid="button-confirm-delete"]').should('be.visible');
      cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
    });

    it('should successfully delete role', () => {
      cy.intercept('DELETE', '/api/admin/rbac/roles/*', { statusCode: 200 }).as('deleteRole');

      cy.get('[data-testid="role-row"]').last().within(() => {
        cy.get('[data-testid="delete-role-button"]').click();
      });
      
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteRole');
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'Role deleted successfully');
      cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
    });

    it('should prevent deleting roles with active users', () => {
      cy.intercept('DELETE', '/api/admin/rbac/roles/*', { statusCode: 409 }).as('deleteConflict');

      cy.get('[data-testid="role-row"]').first().within(() => {
        cy.get('[data-testid="delete-role-button"]').click();
      });
      
      cy.get('[data-testid="button-confirm-delete"]').click();
      
      cy.wait('@deleteConflict');
      cy.get('[data-testid="error-message"]').should('be.visible')
        .and('contain.text', 'Cannot delete role with active users');
    });

    it('should cancel role deletion', () => {
      cy.get('[data-testid="role-row"]').last().within(() => {
        cy.get('[data-testid="delete-role-button"]').click();
      });
      
      cy.get('[data-testid="button-cancel-delete"]').click();
      cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
    });
  });

  describe('Role Permissions Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/admin/rbac/permissions', {
        statusCode: 200,
        body: [
          { id: 'users_manage', name: 'Manage Users', category: 'Users' },
          { id: 'projects_read', name: 'View Projects', category: 'Projects' },
          { id: 'projects_write', name: 'Manage Projects', category: 'Projects' },
          { id: 'analytics_view', name: 'View Analytics', category: 'Analytics' }
        ]
      }).as('getPermissions');
      
      cy.visit('/admin/roles');
      cy.get('[data-testid="create-role-button"]').click();
      cy.wait('@getPermissions');
    });

    it('should display permissions by category', () => {
      cy.get('[data-testid="permissions-section"]').should('be.visible');
      cy.get('[data-testid="permission-category-Users"]').should('be.visible');
      cy.get('[data-testid="permission-category-Projects"]').should('be.visible');
      cy.get('[data-testid="permission-category-Analytics"]').should('be.visible');
    });

    it('should allow selecting/deselecting permissions', () => {
      cy.get('[data-testid="permission-users_manage"]').should('not.be.checked');
      cy.get('[data-testid="permission-users_manage"]').check();
      cy.get('[data-testid="permission-users_manage"]').should('be.checked');
      
      cy.get('[data-testid="permission-users_manage"]').uncheck();
      cy.get('[data-testid="permission-users_manage"]').should('not.be.checked');
    });

    it('should support bulk permission selection', () => {
      cy.get('[data-testid="select-all-permissions"]').check();
      cy.get('[data-testid^="permission-"]').should('be.checked');
      
      cy.get('[data-testid="select-all-permissions"]').uncheck();
      cy.get('[data-testid^="permission-"]').should('not.be.checked');
    });

    it('should filter permissions by search', () => {
      cy.get('[data-testid="permission-search"]').type('project');
      
      cy.get('[data-testid="permission-projects_read"]').should('be.visible');
      cy.get('[data-testid="permission-projects_write"]').should('be.visible');
      cy.get('[data-testid="permission-users_manage"]').should('not.be.visible');
    });

    it('should show permission descriptions on hover', () => {
      cy.get('[data-testid="permission-users_manage"]').trigger('mouseenter');
      cy.get('[data-testid="permission-tooltip"]').should('be.visible')
        .and('contain.text', 'Allows creating, editing, and deleting users');
    });
  });

  describe('User Role Assignment', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/admin/rbac/assignments', {
        statusCode: 200,
        body: testUsers.map(user => ({ userId: user.id, roleId: user.role }))
      }).as('getRoleAssignments');
      
      cy.visit('/admin/user-roles');
      cy.wait('@getRoleAssignments');
    });

    it('should display user role assignments', () => {
      cy.get('[data-testid="user-roles-container"]').should('be.visible');
      cy.get('[data-testid="user-role-row"]').should('have.length', testUsers.length);
    });

    it('should allow changing user role', () => {
      cy.intercept('PATCH', '/api/users/2/role', {
        statusCode: 200,
        body: { success: true }
      }).as('updateUserRole');

      cy.get('[data-testid="user-role-row"]').eq(1).within(() => {
        cy.get('[data-testid="role-select"]').select('project_manager');
      });
      
      cy.wait('@updateUserRole');
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'User role updated successfully');
    });

    it('should show role change confirmation for sensitive roles', () => {
      cy.get('[data-testid="user-role-row"]').eq(1).within(() => {
        cy.get('[data-testid="role-select"]').select('admin');
      });
      
      cy.get('[data-testid="role-change-confirmation"]').should('be.visible');
      cy.get('[data-testid="confirmation-message"]').should('contain.text', 'admin role');
      cy.get('[data-testid="button-confirm-role-change"]').should('be.visible');
    });

    it('should handle bulk role assignments', () => {
      cy.get('[data-testid="select-all-users"]').check();
      cy.get('[data-testid="bulk-actions-dropdown"]').select('Change Role');
      cy.get('[data-testid="bulk-role-select"]').select('consultant');
      cy.get('[data-testid="button-apply-bulk-changes"]').click();
      
      cy.get('[data-testid="bulk-confirmation-modal"]').should('be.visible');
      cy.get('[data-testid="button-confirm-bulk"]').click();
      
      cy.intercept('POST', '/api/admin/rbac/assignments', { statusCode: 200 }).as('bulkUpdate');
      cy.wait('@bulkUpdate');
      
      cy.get('[data-testid="success-message"]').should('be.visible')
        .and('contain.text', 'Bulk role update completed');
    });

    it('should filter users by role', () => {
      cy.get('[data-testid="role-filter"]').select('admin');
      cy.get('[data-testid="user-role-row"]').should('have.length', 1);
      cy.get('[data-testid="user-role-row"]').first().should('contain.text', 'Admin User');
    });

    it('should search users by name or email', () => {
      cy.get('[data-testid="user-search"]').type('consultant');
      cy.get('[data-testid="user-role-row"]').should('have.length', 1);
      cy.get('[data-testid="user-role-row"]').first().should('contain.text', 'Consultant User');
    });
  });

  describe('Role-Based Access Control', () => {
    beforeEach(() => {
      cy.visit('/admin/rbac');
    });

    it('should display RBAC overview', () => {
      cy.get('[data-testid="rbac-dashboard"]').should('be.visible');
      cy.get('[data-testid="roles-summary"]').should('be.visible');
      cy.get('[data-testid="permissions-summary"]').should('be.visible');
      cy.get('[data-testid="users-summary"]').should('be.visible');
    });

    it('should show effective permissions for user', () => {
      cy.intercept('GET', '/api/rbac/effective-permissions*', {
        statusCode: 200,
        body: {
          userId: '1',
          permissions: ['users_manage', 'roles_manage', 'projects_read']
        }
      }).as('getEffectivePermissions');

      cy.get('[data-testid="user-permissions-lookup"]').type('admin@example.com');
      cy.get('[data-testid="lookup-button"]').click();
      
      cy.wait('@getEffectivePermissions');
      cy.get('[data-testid="effective-permissions-list"]').should('be.visible');
      cy.get('[data-testid="permission-item"]').should('have.length', 3);
    });

    it('should check specific permissions', () => {
      cy.intercept('GET', '/api/rbac/has-permission/users_manage*', {
        statusCode: 200,
        body: { hasPermission: true }
      }).as('checkPermission');

      cy.get('[data-testid="permission-check-input"]').type('users_manage');
      cy.get('[data-testid="user-email-input"]').type('admin@example.com');
      cy.get('[data-testid="check-permission-button"]').click();
      
      cy.wait('@checkPermission');
      cy.get('[data-testid="permission-result"]').should('be.visible')
        .and('contain.text', 'Permission granted');
    });

    it('should display role hierarchy', () => {
      cy.get('[data-testid="role-hierarchy"]').should('be.visible');
      cy.get('[data-testid="hierarchy-node"]').should('have.length.greaterThan', 0);
      
      // Test expanding/collapsing hierarchy
      cy.get('[data-testid="hierarchy-node"]').first().within(() => {
        cy.get('[data-testid="expand-button"]').click();
        cy.get('[data-testid="child-roles"]').should('be.visible');
      });
    });
  });

  describe('Audit and Compliance', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/admin/access-audit', { fixture: 'audit/access-logs.json' }).as('getAuditLogs');
      cy.visit('/admin/audit');
      cy.wait('@getAuditLogs');
    });

    it('should display audit logs', () => {
      cy.get('[data-testid="audit-logs-container"]').should('be.visible');
      cy.get('[data-testid="audit-log-entry"]').should('have.length.greaterThan', 0);
    });

    it('should filter audit logs by action type', () => {
      cy.get('[data-testid="action-filter"]').select('role_changed');
      cy.get('[data-testid="audit-log-entry"]').each(($entry) => {
        cy.wrap($entry).should('contain', 'role_changed');
      });
    });

    it('should filter audit logs by date range', () => {
      cy.get('[data-testid="date-from"]').type('2024-01-01');
      cy.get('[data-testid="date-to"]').type('2024-01-31');
      cy.get('[data-testid="apply-date-filter"]').click();
      
      cy.get('[data-testid="audit-log-entry"]').should('be.visible');
    });

    it('should export audit logs', () => {
      cy.get('[data-testid="export-audit-logs"]').click();
      cy.get('[data-testid="export-format-modal"]').should('be.visible');
      cy.get('[data-testid="format-csv"]').click();
      cy.get('[data-testid="button-export"]').click();
      
      // Verify download was triggered
      cy.readFile('cypress/downloads/audit-logs.csv').should('exist');
    });

    it('should show detailed audit entry', () => {
      cy.get('[data-testid="audit-log-entry"]').first().click();
      cy.get('[data-testid="audit-detail-modal"]').should('be.visible');
      cy.get('[data-testid="audit-timestamp"]').should('be.visible');
      cy.get('[data-testid="audit-user"]').should('be.visible');
      cy.get('[data-testid="audit-action"]').should('be.visible');
      cy.get('[data-testid="audit-details"]').should('be.visible');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/admin/rbac/roles', { statusCode: 500 }).as('rolesError');
      cy.visit('/admin/roles');
      cy.wait('@rolesError');
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle insufficient permissions', () => {
      cy.intercept('GET', '/api/admin/rbac/roles', { statusCode: 403 }).as('forbidden');
      cy.visit('/admin/roles');
      cy.wait('@forbidden');
      
      cy.get('[data-testid="access-denied-message"]').should('be.visible');
      cy.get('[data-testid="contact-admin-button"]').should('be.visible');
    });

    it('should handle network connectivity issues', () => {
      cy.intercept('GET', '/api/admin/rbac/roles', { forceNetworkError: true }).as('networkError');
      cy.visit('/admin/roles');
      
      cy.get('[data-testid="network-error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle concurrent role modifications', () => {
      cy.intercept('PATCH', '/api/admin/rbac/roles/*', { statusCode: 409 }).as('conflictError');
      
      cy.visit('/admin/roles');
      cy.get('[data-testid="edit-role-button"]').first().click();
      cy.get('[data-testid="input-role-description"]').clear().type('Modified description');
      cy.get('[data-testid="button-update-role"]').click();
      
      cy.wait('@conflictError');
      cy.get('[data-testid="conflict-resolution-modal"]').should('be.visible');
      cy.get('[data-testid="reload-and-retry"]').should('be.visible');
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large role lists efficiently', () => {
      const largeRolesList = Array.from({ length: 100 }, (_, i) => ({
        id: `role-${i}`,
        name: `Role ${i}`,
        description: `Description for role ${i}`
      }));

      cy.intercept('GET', '/api/admin/rbac/roles', {
        statusCode: 200,
        body: largeRolesList
      }).as('getLargeRolesList');

      cy.visit('/admin/roles');
      cy.wait('@getLargeRolesList');
      
      // Should implement pagination or virtualization
      cy.get('[data-testid="pagination-controls"]').should('be.visible');
      cy.get('[data-testid="role-row"]').should('have.length.lessThan', 51); // Page size limit
    });

    it('should debounce search inputs', () => {
      cy.visit('/admin/roles');
      
      cy.intercept('GET', '/api/admin/rbac/roles*').as('searchRoles');
      cy.get('[data-testid="role-search"]').type('admin', { delay: 50 });
      
      // Should only make one request after debounce
      cy.wait('@searchRoles');
      cy.get('@searchRoles.all').should('have.length', 1);
    });

    it('should cache role data appropriately', () => {
      cy.intercept('GET', '/api/admin/rbac/roles', { statusCode: 200, body: availableRoles }).as('getRoles');
      
      cy.visit('/admin/roles');
      cy.wait('@getRoles');
      
      // Navigate to different tab and back
      cy.get('[data-testid="tab-permissions"]').click();
      cy.get('[data-testid="tab-roles"]').click();
      
      // Should not make another request due to caching
      cy.get('@getRoles.all').should('have.length', 1);
      cy.get('[data-testid="roles-table"]').should('be.visible');
    });
  });
});
