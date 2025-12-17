describe('Development RBAC System - Exhaustive Tests', () => {
  const testData = {
    roles: [
      'admin',
      'hospital_admin',
      'consultant',
      'project_manager',
      'super_admin'
    ],
    permissions: {
      admin: [
        'hospitals.create',
        'hospitals.read',
        'hospitals.update',
        'hospitals.delete',
        'consultants.create',
        'consultants.read',
        'consultants.update',
        'projects.create',
        'projects.read',
        'projects.update',
        'admin.access'
      ],
      consultant: [
        'consultants.read',
        'projects.read',
        'timesheets.create',
        'timesheets.read'
      ]
    },
    testUser: {
      email: 'test@example.com',
      password: 'test123'
    }
  };

  const apiEndpoints = {
    roles: '/api/dev/roles',
    permissions: '/api/dev/permissions',
    effectivePermissions: '/api/dev/effective-permissions',
    login: '/api/auth/login'
  };

  beforeEach(() => {
    // Clear all auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.request({
      method: 'POST',
      url: apiEndpoints.login,
      body: testData.testUser
    }).then(() => {
      cy.visit('/dev/rbac');
    });
  });

  describe('Dev RBAC Page - UI Components & Layout', () => {
    it('should display complete dev RBAC page layout', () => {
      // Main container
      cy.get('[data-testid="dev-rbac-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Navigation tabs
      cy.get('[data-testid="rbac-nav-tabs"]')
        .should('be.visible')
        .within(() => {
          cy.contains('Roles').should('be.visible');
          cy.contains('Permissions').should('be.visible');
          cy.contains('Effective Permissions').should('be.visible');
        });

      // Main content area
      cy.get('[data-testid="rbac-content"]').should('be.visible');
      
      // Page title and description
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', /RBAC|Role|Permission/i);
      
      cy.get('[data-testid="page-description"]')
        .should('be.visible');
    });

    it('should have proper accessibility features', () => {
      // Check ARIA labels
      cy.get('[data-testid="rbac-nav-tabs"]')
        .should('have.attr', 'role', 'tablist');
      
      cy.get('[role="tab"]').each(($tab) => {
        cy.wrap($tab)
          .should('have.attr', 'aria-selected')
          .and('have.attr', 'id');
      });

      // Check keyboard navigation
      cy.get('[role="tab"]').first().focus();
      cy.focused().should('have.attr', 'role', 'tab');
    });

    it('should handle responsive layout', () => {
      // Test mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="dev-rbac-container"]').should('be.visible');
      cy.get('[data-testid="rbac-nav-tabs"]').should('be.visible');
      
      // Test tablet view
      cy.viewport(768, 1024);
      cy.get('[data-testid="dev-rbac-container"]').should('be.visible');
      
      // Test desktop view
      cy.viewport(1200, 800);
      cy.get('[data-testid="dev-rbac-container"]').should('be.visible');
    });
  });

  describe('Roles Tab - Complete Testing', () => {
    beforeEach(() => {
      cy.get('[data-testid="roles-tab"]').click();
    });

    it('should display roles list with all available roles', () => {
      cy.intercept('GET', apiEndpoints.roles, { fixture: 'dev-roles.json' }).as('getRoles');
      
      cy.wait('@getRoles');
      
      // Roles list container
      cy.get('[data-testid="roles-list"]').should('be.visible');
      
      // Check for each expected role
      testData.roles.forEach(role => {
        cy.get('[data-testid="roles-list"]')
          .should('contain.text', role);
      });
      
      // Role cards
      cy.get('[data-testid^="role-card-"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid^="role-card-"]').first().within(() => {
        cy.get('[data-testid="role-name"]').should('be.visible');
        cy.get('[data-testid="role-description"]').should('be.visible');
        cy.get('[data-testid="permissions-count"]').should('be.visible');
      });
    });

    it('should handle role selection and display details', () => {
      cy.intercept('GET', apiEndpoints.roles).as('getRoles');
      cy.wait('@getRoles');
      
      // Select first role
      cy.get('[data-testid^="role-card-"]').first().click();
      
      // Role details should appear
      cy.get('[data-testid="role-details"]').should('be.visible');
      cy.get('[data-testid="selected-role-name"]').should('be.visible');
      cy.get('[data-testid="role-permissions-list"]').should('be.visible');
    });

    it('should display role permissions correctly', () => {
      cy.intercept('GET', apiEndpoints.roles).as('getRoles');
      cy.intercept('GET', `${apiEndpoints.permissions}/admin`, {
        body: testData.permissions.admin
      }).as('getAdminPermissions');
      
      cy.wait('@getRoles');
      
      // Select admin role
      cy.get('[data-testid="role-card-admin"]').click();
      cy.wait('@getAdminPermissions');
      
      // Check permissions display
      cy.get('[data-testid="role-permissions-list"]').within(() => {
        testData.permissions.admin.forEach(permission => {
          cy.contains(permission).should('be.visible');
        });
      });
    });

    it('should handle loading and error states', () => {
      // Test loading state
      cy.intercept('GET', apiEndpoints.roles, { delay: 2000, body: [] }).as('getSlowRoles');
      cy.reload();
      
      cy.get('[data-testid="roles-loading"]').should('be.visible');
      cy.wait('@getSlowRoles');
      cy.get('[data-testid="roles-loading"]').should('not.exist');
      
      // Test error state
      cy.intercept('GET', apiEndpoints.roles, { 
        statusCode: 500, 
        body: { error: 'Server error' } 
      }).as('getRolesError');
      cy.reload();
      
      cy.wait('@getRolesError');
      cy.get('[data-testid="roles-error"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle empty roles state', () => {
      cy.intercept('GET', apiEndpoints.roles, { body: [] }).as('getEmptyRoles');
      cy.reload();
      
      cy.wait('@getEmptyRoles');
      cy.get('[data-testid="empty-roles"]').should('be.visible');
      cy.get('[data-testid="empty-roles-message"]')
        .should('contain.text', /no roles|empty/i);
    });
  });

  describe('Permissions Tab - Complete Testing', () => {
    beforeEach(() => {
      cy.get('[data-testid="permissions-tab"]').click();
    });

    it('should display permissions by role interface', () => {
      // Role selector
      cy.get('[data-testid="role-selector"]').should('be.visible');
      cy.get('[data-testid="permissions-display"]').should('be.visible');
    });

    it('should load and display permissions for selected role', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.permissions}/${selectedRole}`, {
        body: testData.permissions.admin
      }).as('getRolePermissions');
      
      // Select role
      cy.get('[data-testid="role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getRolePermissions');
      
      // Verify permissions display
      cy.get('[data-testid="permissions-list"]').within(() => {
        testData.permissions.admin.forEach(permission => {
          cy.get(`[data-testid="permission-${permission}"]`)
            .should('be.visible')
            .and('contain.text', permission);
        });
      });
    });

    it('should group permissions by category', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.permissions}/${selectedRole}`, {
        body: testData.permissions.admin
      }).as('getRolePermissions');
      
      cy.get('[data-testid="role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getRolePermissions');
      
      // Check permission categories
      cy.get('[data-testid="permission-category-hospitals"]').should('be.visible');
      cy.get('[data-testid="permission-category-consultants"]').should('be.visible');
      cy.get('[data-testid="permission-category-projects"]').should('be.visible');
      cy.get('[data-testid="permission-category-admin"]').should('be.visible');
    });

    it('should handle role switching', () => {
      cy.intercept('GET', `${apiEndpoints.permissions}/admin`, {
        body: testData.permissions.admin
      }).as('getAdminPermissions');
      
      cy.intercept('GET', `${apiEndpoints.permissions}/consultant`, {
        body: testData.permissions.consultant
      }).as('getConsultantPermissions');
      
      // Select admin role first
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option-admin"]').click();
      cy.wait('@getAdminPermissions');
      
      cy.get('[data-testid="permissions-list"]')
        .should('contain.text', 'hospitals.create');
      
      // Switch to consultant role
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option-consultant"]').click();
      cy.wait('@getConsultantPermissions');
      
      cy.get('[data-testid="permissions-list"]')
        .should('contain.text', 'consultants.read')
        .and('not.contain.text', 'hospitals.create');
    });

    it('should show permission descriptions and details', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.permissions}/${selectedRole}`, {
        body: testData.permissions.admin
      }).as('getRolePermissions');
      
      cy.get('[data-testid="role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getRolePermissions');
      
      // Check permission details
      cy.get('[data-testid="permission-hospitals.create"]').within(() => {
        cy.get('[data-testid="permission-name"]').should('contain.text', 'hospitals.create');
        cy.get('[data-testid="permission-description"]').should('be.visible');
        cy.get('[data-testid="permission-scope"]').should('be.visible');
      });
    });

    it('should handle search and filter permissions', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.permissions}/${selectedRole}`, {
        body: testData.permissions.admin
      }).as('getRolePermissions');
      
      cy.get('[data-testid="role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getRolePermissions');
      
      // Search functionality
      cy.get('[data-testid="permissions-search"]')
        .should('be.visible')
        .type('hospitals');
      
      cy.get('[data-testid="permissions-list"]')
        .should('contain.text', 'hospitals.create')
        .and('contain.text', 'hospitals.read')
        .and('not.contain.text', 'consultants.create');
      
      // Clear search
      cy.get('[data-testid="permissions-search"]').clear();
      cy.get('[data-testid="permissions-list"]')
        .should('contain.text', 'consultants.create');
    });
  });

  describe('Effective Permissions Tab - Complete Testing', () => {
    beforeEach(() => {
      cy.get('[data-testid="effective-permissions-tab"]').click();
    });

    it('should display effective permissions interface', () => {
      // User selector
      cy.get('[data-testid="user-selector"]').should('be.visible');
      cy.get('[data-testid="effective-permissions-display"]').should('be.visible');
      
      // Info message
      cy.get('[data-testid="effective-permissions-info"]')
        .should('be.visible')
        .and('contain.text', /effective permissions|computed|inherited/i);
    });

    it('should load effective permissions for selected role', () => {
      const selectedRole = 'admin';
      const effectivePermissions = [
        ...testData.permissions.admin,
        'inherited.permission1',
        'computed.permission2'
      ];
      
      cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${selectedRole}`, {
        body: {
          role: selectedRole,
          permissions: effectivePermissions,
          inherited: ['inherited.permission1'],
          computed: ['computed.permission2'],
          direct: testData.permissions.admin
        }
      }).as('getEffectivePermissions');
      
      // Select role
      cy.get('[data-testid="user-role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getEffectivePermissions');
      
      // Verify effective permissions display
      cy.get('[data-testid="effective-permissions-list"]').should('be.visible');
      cy.get('[data-testid="permissions-summary"]').should('be.visible');
    });

    it('should categorize permissions by source', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${selectedRole}`, {
        body: {
          role: selectedRole,
          permissions: testData.permissions.admin,
          inherited: ['inherited.permission1'],
          computed: ['computed.permission2'],
          direct: testData.permissions.admin.slice(0, 5)
        }
      }).as('getEffectivePermissions');
      
      cy.get('[data-testid="user-role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getEffectivePermissions');
      
      // Check permission categories by source
      cy.get('[data-testid="direct-permissions"]').should('be.visible');
      cy.get('[data-testid="inherited-permissions"]').should('be.visible');
      cy.get('[data-testid="computed-permissions"]').should('be.visible');
    });

    it('should show permission source indicators', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${selectedRole}`, {
        body: {
          role: selectedRole,
          permissions: testData.permissions.admin,
          sources: {
            'hospitals.create': 'direct',
            'hospitals.read': 'inherited',
            'hospitals.update': 'computed'
          }
        }
      }).as('getEffectivePermissions');
      
      cy.get('[data-testid="user-role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getEffectivePermissions');
      
      // Check source indicators
      cy.get('[data-testid="permission-hospitals.create"]')
        .should('contain.text', 'Direct')
        .find('[data-testid="source-badge-direct"]')
        .should('be.visible');
      
      cy.get('[data-testid="permission-hospitals.read"]')
        .should('contain.text', 'Inherited')
        .find('[data-testid="source-badge-inherited"]')
        .should('be.visible');
    });

    it('should handle permission details and explanations', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${selectedRole}`, {
        body: {
          role: selectedRole,
          permissions: testData.permissions.admin,
          details: {
            'hospitals.create': {
              source: 'direct',
              explanation: 'Granted directly to admin role',
              conditions: []
            }
          }
        }
      }).as('getEffectivePermissions');
      
      cy.get('[data-testid="user-role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getEffectivePermissions');
      
      // Click on permission for details
      cy.get('[data-testid="permission-hospitals.create"]').click();
      
      cy.get('[data-testid="permission-details-modal"]').should('be.visible');
      cy.get('[data-testid="permission-explanation"]')
        .should('contain.text', 'Granted directly to admin role');
    });

    it('should show permissions summary and statistics', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${selectedRole}`, {
        body: {
          role: selectedRole,
          permissions: testData.permissions.admin,
          summary: {
            total: testData.permissions.admin.length,
            direct: 8,
            inherited: 2,
            computed: 1
          }
        }
      }).as('getEffectivePermissions');
      
      cy.get('[data-testid="user-role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getEffectivePermissions');
      
      // Check summary statistics
      cy.get('[data-testid="permissions-summary"]').within(() => {
        cy.get('[data-testid="total-permissions"]')
          .should('contain.text', testData.permissions.admin.length);
        cy.get('[data-testid="direct-count"]').should('contain.text', '8');
        cy.get('[data-testid="inherited-count"]').should('contain.text', '2');
        cy.get('[data-testid="computed-count"]').should('contain.text', '1');
      });
    });
  });

  describe('API Integration Tests', () => {
    it('should handle roles API correctly', () => {
      cy.intercept('GET', apiEndpoints.roles).as('getRoles');
      
      cy.visit('/dev/rbac');
      cy.get('[data-testid="roles-tab"]').click();
      
      cy.wait('@getRoles').then((interception) => {
        expect(interception.request.method).to.equal('GET');
        expect(interception.request.url).to.include('/api/dev/roles');
      });
    });

    it('should handle permissions API with role parameter', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.permissions}/${selectedRole}`).as('getPermissions');
      
      cy.visit('/dev/rbac');
      cy.get('[data-testid="permissions-tab"]').click();
      cy.get('[data-testid="role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getPermissions').then((interception) => {
        expect(interception.request.method).to.equal('GET');
        expect(interception.request.url).to.include(`/api/dev/permissions/${selectedRole}`);
      });
    });

    it('should handle effective permissions API correctly', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${selectedRole}`).as('getEffectivePermissions');
      
      cy.visit('/dev/rbac');
      cy.get('[data-testid="effective-permissions-tab"]').click();
      cy.get('[data-testid="user-role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getEffectivePermissions').then((interception) => {
        expect(interception.request.method).to.equal('GET');
        expect(interception.request.url).to.include(`/api/dev/effective-permissions/${selectedRole}`);
      });
    });

    it('should handle API errors gracefully', () => {
      // Test 401 unauthorized
      cy.intercept('GET', apiEndpoints.roles, { 
        statusCode: 401, 
        body: { error: 'Unauthorized' } 
      }).as('getUnauthorized');
      
      cy.visit('/dev/rbac');
      cy.wait('@getUnauthorized');
      
      cy.get('[data-testid="unauthorized-message"]').should('be.visible');
      
      // Test 403 forbidden
      cy.intercept('GET', apiEndpoints.roles, { 
        statusCode: 403, 
        body: { error: 'Forbidden' } 
      }).as('getForbidden');
      
      cy.reload();
      cy.wait('@getForbidden');
      
      cy.get('[data-testid="forbidden-message"]').should('be.visible');
      
      // Test 500 server error
      cy.intercept('GET', apiEndpoints.roles, { 
        statusCode: 500, 
        body: { error: 'Internal server error' } 
      }).as('getServerError');
      
      cy.reload();
      cy.wait('@getServerError');
      
      cy.get('[data-testid="server-error-message"]').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', apiEndpoints.roles, { forceNetworkError: true }).as('getNetworkError');
      
      cy.visit('/dev/rbac');
      cy.wait('@getNetworkError');
      
      cy.get('[data-testid="network-error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers of roles efficiently', () => {
      const largeRolesList = Array.from({ length: 100 }, (_, i) => ({
        id: `role-${i}`,
        name: `Role ${i}`,
        description: `Description for role ${i}`,
        permissionCount: Math.floor(Math.random() * 50)
      }));
      
      cy.intercept('GET', apiEndpoints.roles, { body: largeRolesList }).as('getLargeRoles');
      
      cy.visit('/dev/rbac');
      cy.wait('@getLargeRoles');
      
      // Check virtualization or pagination
      cy.get('[data-testid="roles-list"]').should('be.visible');
      cy.get('[data-testid^="role-card-"]').should('have.length.lessThan', 101);
    });

    it('should handle roles with no permissions', () => {
      cy.intercept('GET', '/api/dev/permissions/empty-role', { body: [] }).as('getEmptyPermissions');
      
      cy.visit('/dev/rbac');
      cy.get('[data-testid="permissions-tab"]').click();
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option-empty-role"]').click();
      
      cy.wait('@getEmptyPermissions');
      
      cy.get('[data-testid="no-permissions-message"]').should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.roles, { body: 'invalid json' }).as('getInvalidResponse');
      
      cy.visit('/dev/rbac');
      cy.wait('@getInvalidResponse');
      
      cy.get('[data-testid="invalid-data-error"]').should('be.visible');
    });

    it('should maintain state during tab switching', () => {
      const selectedRole = 'admin';
      
      cy.intercept('GET', apiEndpoints.roles, { body: testData.roles }).as('getRoles');
      cy.intercept('GET', `${apiEndpoints.permissions}/${selectedRole}`, {
        body: testData.permissions.admin
      }).as('getPermissions');
      
      cy.visit('/dev/rbac');
      
      // Set state in permissions tab
      cy.get('[data-testid="permissions-tab"]').click();
      cy.get('[data-testid="role-selector"]').click();
      cy.get(`[data-testid="role-option-${selectedRole}"]`).click();
      
      cy.wait('@getPermissions');
      
      // Switch to roles tab and back
      cy.get('[data-testid="roles-tab"]').click();
      cy.wait('@getRoles');
      
      cy.get('[data-testid="permissions-tab"]').click();
      
      // Verify state is maintained
      cy.get('[data-testid="role-selector"]')
        .should('contain.text', selectedRole);
    });

    it('should handle concurrent API requests', () => {
      cy.intercept('GET', apiEndpoints.roles, { delay: 1000, body: testData.roles }).as('getRoles');
      cy.intercept('GET', '/api/dev/permissions/admin', { 
        delay: 1500, 
        body: testData.permissions.admin 
      }).as('getAdminPermissions');
      cy.intercept('GET', '/api/dev/permissions/consultant', { 
        delay: 800, 
        body: testData.permissions.consultant 
      }).as('getConsultantPermissions');
      
      cy.visit('/dev/rbac');
      
      // Trigger multiple requests quickly
      cy.get('[data-testid="permissions-tab"]').click();
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option-admin"]').click();
      
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option-consultant"]').click();
      
      // Should handle the race condition and show consultant permissions
      cy.wait('@getConsultantPermissions');
      cy.get('[data-testid="permissions-list"]')
        .should('contain.text', 'consultants.read')
        .and('not.contain.text', 'hospitals.create');
    });
  });

  describe('User Experience and Interaction Tests', () => {
    it('should provide clear feedback during loading states', () => {
      cy.intercept('GET', apiEndpoints.roles, { delay: 2000, body: testData.roles }).as('getSlowRoles');
      
      cy.visit('/dev/rbac');
      
      // Check loading indicators
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.get('[data-testid="loading-message"]')
        .should('be.visible')
        .and('contain.text', /loading|fetching/i);
      
      cy.wait('@getSlowRoles');
      
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
      cy.get('[data-testid="roles-list"]').should('be.visible');
    });

    it('should handle keyboard navigation properly', () => {
      cy.visit('/dev/rbac');
      
      // Tab navigation through main elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'roles-tab');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'permissions-tab');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'effective-permissions-tab');
      
      // Enter key to activate tab
      cy.get('[data-testid="permissions-tab"]').focus().type('{enter}');
      cy.get('[data-testid="permissions-tab"]').should('have.attr', 'aria-selected', 'true');
    });

    it('should provide helpful tooltips and descriptions', () => {
      cy.visit('/dev/rbac');
      
      // Hover over info icons
      cy.get('[data-testid="roles-info-icon"]').trigger('mouseover');
      cy.get('[data-testid="roles-tooltip"]')
        .should('be.visible')
        .and('contain.text', /role/i);
      
      cy.get('[data-testid="permissions-info-icon"]').trigger('mouseover');
      cy.get('[data-testid="permissions-tooltip"]')
        .should('be.visible')
        .and('contain.text', /permission/i);
    });
  });
});
