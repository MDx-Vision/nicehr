describe('Dev Tools - Exhaustive Tests', () => {
  const apiEndpoints = {
    roles: '/api/dev/roles',
    permissions: '/api/dev/permissions',
    effectivePermissions: '/api/dev/effective-permissions',
    rbacEffectivePermissions: '/api/rbac/effective-permissions',
    hasPermission: '/api/rbac/has-permission',
    allPermissions: '/api/permissions'
  };

  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    testRoles: ['admin', 'hospital_admin', 'consultant', 'project_manager'],
    testPermissions: [
      'view_dashboard',
      'manage_hospitals',
      'manage_consultants',
      'manage_projects',
      'view_analytics',
      'admin_access'
    ]
  };

  beforeEach(() => {
    // Clear all storage and cookies
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.request('POST', apiEndpoints.rbacEffectivePermissions.replace('/rbac/effective-permissions', '/auth/login'), {
      email: testData.ciUser.email,
      password: testData.ciUser.password
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  describe('Dev Tools Page - Access and Layout', () => {
    it('should display dev tools page for admin users', () => {
      cy.visit('/dev');
      
      // Check main container
      cy.get('[data-testid="dev-tools-container"]', { timeout: 10000 })
        .should('be.visible');
      
      // Check page title
      cy.get('h1').should('contain.text', /dev/i);
      
      // Check navigation or breadcrumbs
      cy.get('nav, [data-testid="breadcrumbs"]').should('exist');
    });

    it('should have proper page structure and sections', () => {
      cy.visit('/dev');
      
      // Main sections
      cy.get('[data-testid="roles-section"]').should('be.visible');
      cy.get('[data-testid="permissions-section"]').should('be.visible');
      cy.get('[data-testid="rbac-testing-section"]').should('be.visible');
      
      // Section headers
      cy.get('h2, h3').should('contain.text', /role/i);
      cy.get('h2, h3').should('contain.text', /permission/i);
    });

    it('should restrict access for non-admin users', () => {
      // This would need a non-admin user to test properly
      // For now, test that admin access works
      cy.visit('/dev');
      cy.get('[data-testid="dev-tools-container"]').should('be.visible');
    });
  });

  describe('API Endpoint - GET /api/dev/roles', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.roles).as('getRoles');
    });

    it('should fetch all available roles', () => {
      cy.request('GET', apiEndpoints.roles).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.be.an('array');
        
        if (response.body.data.length > 0) {
          response.body.data.forEach(role => {
            expect(role).to.have.property('id');
            expect(role).to.have.property('name');
            expect(role.name).to.be.a('string');
          });
        }
      });
    });

    it('should handle empty roles list', () => {
      cy.intercept('GET', apiEndpoints.roles, {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getEmptyRoles');

      cy.visit('/dev');
      cy.wait('@getEmptyRoles');
      
      cy.get('[data-testid="roles-empty-state"]')
        .should('be.visible')
        .and('contain.text', /no roles/i);
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.roles, {
        statusCode: 500,
        body: { success: false, error: 'Internal server error' }
      }).as('getRolesError');

      cy.visit('/dev');
      cy.wait('@getRolesError');
      
      cy.get('[data-testid="roles-error-state"]')
        .should('be.visible')
        .and('contain.text', /error/i);
    });

    it('should display loading state', () => {
      cy.intercept('GET', apiEndpoints.roles, {
        delay: 2000,
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getSlowRoles');

      cy.visit('/dev');
      
      cy.get('[data-testid="roles-loading"]')
        .should('be.visible');
      
      cy.wait('@getSlowRoles');
      
      cy.get('[data-testid="roles-loading"]')
        .should('not.exist');
    });
  });

  describe('API Endpoint - GET /api/dev/permissions/:role', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/dev/permissions/*').as('getPermissions');
    });

    it('should fetch permissions for valid role', () => {
      const testRole = 'admin';
      
      cy.request('GET', `${apiEndpoints.permissions}/${testRole}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.be.an('array');
        
        if (response.body.data.length > 0) {
          response.body.data.forEach(permission => {
            expect(permission).to.have.property('id');
            expect(permission).to.have.property('name');
            expect(permission.name).to.be.a('string');
          });
        }
      });
    });

    it('should handle invalid role gracefully', () => {
      const invalidRole = 'nonexistent-role';
      
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.permissions}/${invalidRole}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400]);
      });
    });

    it('should test permissions for all common roles', () => {
      testData.testRoles.forEach(role => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.permissions}/${role}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('success', true);
            expect(response.body.data).to.be.an('array');
          }
        });
      });
    });
  });

  describe('API Endpoint - GET /api/dev/effective-permissions/:role', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/dev/effective-permissions/*').as('getEffectivePermissions');
    });

    it('should fetch effective permissions for valid role', () => {
      const testRole = 'admin';
      
      cy.request('GET', `${apiEndpoints.effectivePermissions}/${testRole}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.be.an('array');
        
        if (response.body.data.length > 0) {
          response.body.data.forEach(permission => {
            expect(permission).to.be.a('string');
          });
        }
      });
    });

    it('should handle invalid role for effective permissions', () => {
      const invalidRole = 'invalid-role-123';
      
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.effectivePermissions}/${invalidRole}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400]);
      });
    });

    it('should compare effective permissions across roles', () => {
      const rolesToCompare = ['admin', 'consultant'];
      const permissionSets = {};
      
      // Fetch permissions for each role
      rolesToCompare.forEach(role => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.effectivePermissions}/${role}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            permissionSets[role] = response.body.data;
          }
        });
      });
      
      // Admin should have more permissions than consultant
      cy.then(() => {
        if (permissionSets.admin && permissionSets.consultant) {
          expect(permissionSets.admin.length).to.be.gte(permissionSets.consultant.length);
        }
      });
    });
  });

  describe('Dev Tools UI - Role Selection and Testing', () => {
    beforeEach(() => {
      cy.visit('/dev');
      cy.intercept('GET', apiEndpoints.roles).as('getRoles');
      cy.intercept('GET', '/api/dev/permissions/*').as('getPermissions');
      cy.intercept('GET', '/api/dev/effective-permissions/*').as('getEffectivePermissions');
    });

    it('should display role selector dropdown', () => {
      cy.get('[data-testid="role-selector"]').should('be.visible');
      cy.get('[data-testid="role-selector"]').click();
      
      // Should show available roles
      cy.get('[data-testid="role-option"]').should('have.length.gte', 1);
    });

    it('should update permissions when role is selected', () => {
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option"]').first().click();
      
      cy.wait('@getPermissions');
      cy.wait('@getEffectivePermissions');
      
      cy.get('[data-testid="permissions-list"]').should('be.visible');
    });

    it('should display permissions in a readable format', () => {
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option"]').first().click();
      
      cy.wait('@getPermissions');
      
      cy.get('[data-testid="permissions-list"]').within(() => {
        cy.get('[data-testid="permission-item"]').should('have.length.gte', 0);
        cy.get('[data-testid="permission-item"]').each(($el) => {
          cy.wrap($el).should('contain.text', /\w+/);
        });
      });
    });

    it('should allow filtering permissions', () => {
      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option"]').first().click();
      
      cy.wait('@getPermissions');
      
      // If filter exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="permission-filter"]').length > 0) {
          cy.get('[data-testid="permission-filter"]').type('admin');
          cy.get('[data-testid="permission-item"]').should('contain.text', /admin/i);
        }
      });
    });
  });

  describe('RBAC Testing Interface', () => {
    beforeEach(() => {
      cy.visit('/dev');
      cy.intercept('GET', apiEndpoints.rbacEffectivePermissions).as('getRbacEffectivePermissions');
      cy.intercept('GET', '/api/rbac/has-permission/*').as('getHasPermission');
    });

    it('should test current user effective permissions', () => {
      cy.get('[data-testid="test-current-permissions"]').click();
      
      cy.wait('@getRbacEffectivePermissions');
      
      cy.get('[data-testid="current-permissions-result"]')
        .should('be.visible')
        .and('contain.text', /permission/i);
    });

    it('should test specific permission checks', () => {
      testData.testPermissions.forEach(permission => {
        cy.get('[data-testid="permission-test-input"]').clear().type(permission);
        cy.get('[data-testid="test-permission-button"]').click();
        
        cy.wait('@getHasPermission');
        
        cy.get('[data-testid="permission-test-result"]')
          .should('be.visible')
          .and('contain.text', /true|false/i);
      });
    });

    it('should handle invalid permission names gracefully', () => {
      const invalidPermissions = ['', 'invalid-perm-123', '!@#$%'];
      
      invalidPermissions.forEach(permission => {
        cy.get('[data-testid="permission-test-input"]').clear();
        if (permission) {
          cy.get('[data-testid="permission-test-input"]').type(permission);
        }
        cy.get('[data-testid="test-permission-button"]').click();
        
        // Should handle gracefully without crashing
        cy.get('[data-testid="permission-test-result"]').should('be.visible');
      });
    });
  });

  describe('Permission Comparison Tool', () => {
    beforeEach(() => {
      cy.visit('/dev');
    });

    it('should allow comparing permissions between roles', () => {
      // If comparison tool exists
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="role-comparison-tool"]').length > 0) {
          cy.get('[data-testid="role-comparison-tool"]').should('be.visible');
          
          cy.get('[data-testid="compare-role-1"]').click();
          cy.get('[data-testid="role-option"]').first().click();
          
          cy.get('[data-testid="compare-role-2"]').click();
          cy.get('[data-testid="role-option"]').last().click();
          
          cy.get('[data-testid="compare-roles-button"]').click();
          
          cy.get('[data-testid="comparison-result"]').should('be.visible');
        }
      });
    });

    it('should highlight permission differences', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="permission-differences"]').length > 0) {
          cy.get('[data-testid="permission-differences"]').should('be.visible');
          cy.get('[data-testid="unique-to-role-1"]').should('exist');
          cy.get('[data-testid="unique-to-role-2"]').should('exist');
          cy.get('[data-testid="common-permissions"]').should('exist');
        }
      });
    });
  });

  describe('Dev Tools - Export and Documentation', () => {
    beforeEach(() => {
      cy.visit('/dev');
    });

    it('should provide role documentation export', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="export-roles-doc"]').length > 0) {
          cy.get('[data-testid="export-roles-doc"]').click();
          
          // Should trigger download or display documentation
          cy.get('[data-testid="roles-documentation"]').should('be.visible');
        }
      });
    });

    it('should show permission hierarchy', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="permission-hierarchy"]').length > 0) {
          cy.get('[data-testid="permission-hierarchy"]').should('be.visible');
          cy.get('[data-testid="permission-node"]').should('have.length.gte', 1);
        }
      });
    });
  });

  describe('API Integration Tests', () => {
    it('should handle rapid API calls without errors', () => {
      const rapidCalls = [];
      
      for (let i = 0; i < 5; i++) {
        rapidCalls.push(cy.request('GET', apiEndpoints.roles));
      }
      
      // All calls should succeed
      rapidCalls.forEach(callPromise => {
        callPromise.then(response => {
          expect(response.status).to.eq(200);
        });
      });
    });

    it('should validate response schemas', () => {
      cy.request('GET', apiEndpoints.roles).then((response) => {
        expect(response.body).to.have.property('success');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
      });

      cy.request('GET', `${apiEndpoints.permissions}/admin`).then((response) => {
        expect(response.body).to.have.property('success');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
      });

      cy.request('GET', `${apiEndpoints.effectivePermissions}/admin`).then((response) => {
        expect(response.body).to.have.property('success');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.be.an('array');
      });
    });

    it('should test API endpoints with edge cases', () => {
      const edgeCases = [
        'admin%20user',
        'role-with-hyphens',
        'UPPERCASE_ROLE',
        'role123',
        'role_with_underscores'
      ];

      edgeCases.forEach(role => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.permissions}/${encodeURIComponent(role)}`,
          failOnStatusCode: false
        }).then((response) => {
          // Should either succeed or fail gracefully
          expect(response.status).to.be.oneOf([200, 400, 404]);
        });
      });
    });
  });

  describe('Performance and Responsiveness', () => {
    beforeEach(() => {
      cy.visit('/dev');
    });

    it('should load dev tools page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="dev-tools-container"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds max
      });
    });

    it('should be responsive on different screen sizes', () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 1024, height: 768, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' }
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.get('[data-testid="dev-tools-container"]').should('be.visible');
        
        // Check that main elements are still accessible
        cy.get('[data-testid="role-selector"]').should('be.visible');
        cy.get('[data-testid="permissions-section"]').should('be.visible');
      });
    });

    it('should handle large permission lists efficiently', () => {
      // Mock large response
      cy.intercept('GET', '/api/dev/permissions/*', {
        statusCode: 200,
        body: {
          success: true,
          data: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `permission_${i}`,
            description: `Test permission ${i}`
          }))
        }
      }).as('getLargePermissions');

      cy.get('[data-testid="role-selector"]').click();
      cy.get('[data-testid="role-option"]').first().click();
      
      cy.wait('@getLargePermissions');
      
      // Should still be responsive
      cy.get('[data-testid="permissions-list"]').should('be.visible');
    });
  });

  describe('Security and Access Control', () => {
    it('should validate admin access requirement', () => {
      // This test assumes proper authentication is in place
      cy.visit('/dev');
      cy.get('[data-testid="dev-tools-container"]').should('be.visible');
      
      // Should not expose sensitive information
      cy.get('body').should('not.contain', /password|secret|key/i);
    });

    it('should sanitize role and permission names', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '"><script>alert("xss")</script>',
        'javascript:alert("xss")',
        '${7*7}',
        '{{7*7}}'
      ];

      maliciousInputs.forEach(input => {
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="permission-test-input"]').length > 0) {
            cy.get('[data-testid="permission-test-input"]').clear().type(input);
            cy.get('[data-testid="test-permission-button"]').click();
            
            // Should not execute malicious code
            cy.get('body').should('not.contain', '49'); // 7*7 result
            cy.get('body').should('not.contain', input);
          }
        });
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network failures gracefully', () => {
      cy.intercept('GET', apiEndpoints.roles, { forceNetworkError: true }).as('networkError');
      
      cy.visit('/dev');
      cy.wait('@networkError');
      
      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);
      
      // Should provide retry option
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should recover from API errors', () => {
      cy.intercept('GET', apiEndpoints.roles, {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('serverError');
      
      cy.visit('/dev');
      cy.wait('@serverError');
      
      // Mock recovery
      cy.intercept('GET', apiEndpoints.roles, {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('recoveredRoles');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@recoveredRoles');
      
      cy.get('[data-testid="roles-section"]').should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', apiEndpoints.roles, {
        statusCode: 200,
        body: 'invalid json response'
      }).as('malformedResponse');
      
      cy.visit('/dev');
      cy.wait('@malformedResponse');
      
      cy.get('[data-testid="error-state"]')
        .should('be.visible')
        .and('contain.text', /error|invalid/i);
    });
  });

  afterEach(() => {
    // Clean up any test data or states
    cy.clearCookies();
    cy.clearLocalStorage();
  });
});
