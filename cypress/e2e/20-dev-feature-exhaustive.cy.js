describe('Dev Feature - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    roles: {
      admin: 'admin',
      consultant: 'consultant',
      hospital: 'hospital_admin',
      invalid: 'invalid_role'
    },
    permissions: [
      'users.read',
      'users.write',
      'hospitals.read',
      'hospitals.write',
      'consultants.read',
      'consultants.write',
      'projects.read',
      'projects.write',
      'admin.read',
      'admin.write'
    ]
  };

  const apiEndpoints = {
    devRoles: '/api/dev/roles',
    devPermissions: '/api/dev/permissions',
    devEffectivePermissions: '/api/dev/effective-permissions',
    rbacRoles: '/api/admin/rbac/roles',
    rbacPermissions: '/api/admin/rbac/permissions',
    rbacAssignments: '/api/admin/rbac/assignments',
    rbacEffective: '/api/rbac/effective-permissions',
    rbacHasPermission: '/api/rbac/has-permission',
    permissions: '/api/permissions'
  };

  beforeEach(() => {
    // Clear all storage
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin user
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]').type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  });

  describe('Dev Roles API - GET /api/dev/roles', () => {
    it('should fetch all available roles', () => {
      cy.intercept('GET', apiEndpoints.devRoles).as('getRoles');
      
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('roles');
        expect(response.body.roles).to.be.an('array');
        
        // Verify common roles exist
        const roleNames = response.body.roles.map(role => role.name || role.id);
        expect(roleNames).to.include.members(['admin', 'consultant']);
      });
    });

    it('should return roles with proper structure', () => {
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
        
        if (response.body.roles && response.body.roles.length > 0) {
          const role = response.body.roles[0];
          expect(role).to.have.property('id');
          expect(role).to.have.property('name');
          
          // Optional properties that might exist
          if (role.description !== undefined) {
            expect(role.description).to.be.a('string');
          }
          if (role.permissions !== undefined) {
            expect(role.permissions).to.be.an('array');
          }
        }
      });
    });

    it('should handle unauthorized access gracefully', () => {
      // Clear auth and try to access
      cy.clearCookies();
      cy.request({
        method: 'GET',
        url: apiEndpoints.devRoles,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('should return consistent data structure on multiple calls', () => {
      // First call
      cy.request('GET', apiEndpoints.devRoles).then((firstResponse) => {
        expect(firstResponse.status).to.eq(200);
        
        // Second call
        cy.request('GET', apiEndpoints.devRoles).then((secondResponse) => {
          expect(secondResponse.status).to.eq(200);
          expect(firstResponse.body).to.deep.equal(secondResponse.body);
        });
      });
    });
  });

  describe('Dev Permissions API - GET /api/dev/permissions/:role', () => {
    it('should fetch permissions for admin role', () => {
      cy.intercept('GET', `${apiEndpoints.devPermissions}/${testData.roles.admin}`).as('getAdminPermissions');
      
      cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('permissions');
        expect(response.body.permissions).to.be.an('array');
        
        // Admin should have extensive permissions
        expect(response.body.permissions.length).to.be.greaterThan(0);
      });
    });

    it('should fetch permissions for consultant role', () => {
      cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.consultant}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('permissions');
        expect(response.body.permissions).to.be.an('array');
      });
    });

    it('should handle invalid role gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.devPermissions}/${testData.roles.invalid}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 404, 422]).to.include(response.status);
      });
    });

    it('should return permissions with proper structure', () => {
      cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        
        if (response.body.permissions && response.body.permissions.length > 0) {
          const permission = response.body.permissions[0];
          
          // Permission can be string or object
          if (typeof permission === 'string') {
            expect(permission).to.be.a('string');
            expect(permission.length).to.be.greaterThan(0);
          } else {
            expect(permission).to.have.property('name');
            expect(permission.name).to.be.a('string');
          }
        }
      });
    });

    it('should handle role parameter encoding', () => {
      const encodedRole = encodeURIComponent(testData.roles.admin);
      
      cy.request('GET', `${apiEndpoints.devPermissions}/${encodedRole}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('permissions');
      });
    });

    it('should return different permissions for different roles', () => {
      // Get admin permissions
      cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.admin}`).then((adminResponse) => {
        expect(adminResponse.status).to.eq(200);
        
        // Get consultant permissions
        cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.consultant}`).then((consultantResponse) => {
          expect(consultantResponse.status).to.eq(200);
          
          // Admin should typically have more permissions than consultant
          const adminPermissions = adminResponse.body.permissions || [];
          const consultantPermissions = consultantResponse.body.permissions || [];
          
          if (adminPermissions.length > 0 && consultantPermissions.length > 0) {
            expect(adminPermissions.length).to.be.greaterThanOrEqual(consultantPermissions.length);
          }
        });
      });
    });
  });

  describe('Dev Effective Permissions API - GET /api/dev/effective-permissions/:role', () => {
    it('should fetch effective permissions for admin role', () => {
      cy.intercept('GET', `${apiEndpoints.devEffectivePermissions}/${testData.roles.admin}`).as('getAdminEffectivePermissions');
      
      cy.request('GET', `${apiEndpoints.devEffectivePermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('effectivePermissions');
        expect(response.body.effectivePermissions).to.be.an('array');
      });
    });

    it('should fetch effective permissions for consultant role', () => {
      cy.request('GET', `${apiEndpoints.devEffectivePermissions}/${testData.roles.consultant}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('effectivePermissions');
        expect(response.body.effectivePermissions).to.be.an('array');
      });
    });

    it('should handle invalid role for effective permissions', () => {
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.devEffectivePermissions}/${testData.roles.invalid}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 404, 422]).to.include(response.status);
      });
    });

    it('should return effective permissions with proper structure', () => {
      cy.request('GET', `${apiEndpoints.devEffectivePermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        
        if (response.body.effectivePermissions && response.body.effectivePermissions.length > 0) {
          const permission = response.body.effectivePermissions[0];
          
          if (typeof permission === 'string') {
            expect(permission).to.be.a('string');
            expect(permission.length).to.be.greaterThan(0);
          } else {
            expect(permission).to.be.an('object');
          }
        }
      });
    });

    it('should include role metadata in response', () => {
      cy.request('GET', `${apiEndpoints.devEffectivePermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('effectivePermissions');
        
        // May include additional metadata
        if (response.body.role) {
          expect(response.body.role).to.be.a('string');
        }
        if (response.body.inherited) {
          expect(response.body.inherited).to.be.an('array');
        }
        if (response.body.direct) {
          expect(response.body.direct).to.be.an('array');
        }
      });
    });
  });

  describe('RBAC System Integration', () => {
    it('should fetch current user effective permissions', () => {
      cy.request('GET', apiEndpoints.rbacEffective).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('permissions');
        expect(response.body.permissions).to.be.an('array');
        
        // Admin user should have permissions
        expect(response.body.permissions.length).to.be.greaterThan(0);
      });
    });

    it('should check specific permissions via has-permission endpoint', () => {
      const permissionsToCheck = ['users.read', 'hospitals.read', 'admin.read'];
      
      permissionsToCheck.forEach((permission) => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.rbacHasPermission}/${permission}`,
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 403]).to.include(response.status);
          
          if (response.status === 200) {
            expect(response.body).to.have.property('hasPermission');
            expect(response.body.hasPermission).to.be.a('boolean');
          }
        });
      });
    });

    it('should handle invalid permission names', () => {
      const invalidPermission = 'invalid.permission.name';
      
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.rbacHasPermission}/${invalidPermission}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status);
        
        if (response.status === 200) {
          expect(response.body.hasPermission).to.be.false;
        }
      });
    });

    it('should fetch all system permissions', () => {
      cy.request('GET', apiEndpoints.permissions).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('permissions');
        expect(response.body.permissions).to.be.an('array');
        
        if (response.body.permissions.length > 0) {
          const permission = response.body.permissions[0];
          
          if (typeof permission === 'string') {
            expect(permission).to.be.a('string');
          } else {
            expect(permission).to.have.property('name');
          }
        }
      });
    });
  });

  describe('Dev Feature UI Integration', () => {
    it('should access dev tools from admin panel', () => {
      // Navigate to admin panel
      cy.visit('/admin');
      cy.url().should('include', '/admin');
      
      // Look for dev tools section
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="dev-tools"]').length > 0) {
          cy.get('[data-testid="dev-tools"]').should('be.visible');
        } else if ($body.find('nav, sidebar').text().includes('Dev')) {
          cy.contains('Dev').should('be.visible');
        }
      });
    });

    it('should display role management interface', () => {
      // Try different possible routes for dev/role management
      const possibleRoutes = ['/admin/dev', '/admin/roles', '/dev', '/admin/rbac'];
      
      possibleRoutes.forEach((route, index) => {
        cy.visit(route, { failOnStatusCode: false });
        
        cy.url().then((url) => {
          if (!url.includes('404') && !url.includes('error')) {
            // Check for role-related UI elements
            cy.get('body').then(($body) => {
              const bodyText = $body.text().toLowerCase();
              if (bodyText.includes('role') || bodyText.includes('permission')) {
                // Found dev interface
                cy.log(`Dev interface found at: ${route}`);
                
                // Look for common dev UI elements
                const selectors = [
                  '[data-testid*="role"]',
                  '[data-testid*="permission"]',
                  '[data-testid*="dev"]',
                  'button:contains("Role")',
                  'button:contains("Permission")'
                ];
                
                selectors.forEach((selector) => {
                  cy.get('body').then(($body) => {
                    if ($body.find(selector).length > 0) {
                      cy.get(selector).should('exist');
                    }
                  });
                });
              }
            });
          }
        });
      });
    });

    it('should handle dev feature access control', () => {
      // Test that only admin users can access dev features
      cy.intercept('GET', apiEndpoints.devRoles).as('devRolesCall');
      cy.intercept('GET', '/api/dev/**').as('devApiCalls');
      
      // Make direct API call
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
      });
      
      // Logout and try again
      cy.clearCookies();
      cy.request({
        method: 'GET',
        url: apiEndpoints.devRoles,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', apiEndpoints.devRoles, { forceNetworkError: true }).as('networkError');
      
      cy.request({
        method: 'GET',
        url: apiEndpoints.devRoles,
        failOnStatusCode: false,
        timeout: 5000
      }).then((response) => {
        // Should handle network error appropriately
        expect(response.status).to.be.oneOf([0, 500, 502, 503, 504]);
      });
    });

    it('should handle malformed responses', () => {
      // Intercept with malformed JSON
      cy.intercept('GET', apiEndpoints.devRoles, { body: '{ invalid json' }).as('malformedResponse');
      
      cy.request({
        method: 'GET',
        url: apiEndpoints.devRoles,
        failOnStatusCode: false
      }).then((response) => {
        // Should handle parsing error
        expect([400, 500]).to.include(response.status);
      });
    });

    it('should handle empty role parameter', () => {
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.devPermissions}/`,
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 404, 405]).to.include(response.status);
      });
    });

    it('should handle special characters in role names', () => {
      const specialRoles = ['role%20with%20spaces', 'role-with-dashes', 'role.with.dots'];
      
      specialRoles.forEach((role) => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.devPermissions}/${role}`,
          failOnStatusCode: false
        }).then((response) => {
          // Should handle gracefully, either success or proper error
          expect([200, 400, 404]).to.include(response.status);
        });
      });
    });

    it('should handle concurrent requests properly', () => {
      const requests = Array.from({ length: 5 }, () => 
        cy.request('GET', apiEndpoints.devRoles)
      );
      
      Promise.all(requests).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('roles');
        });
        
        // All responses should be identical
        const firstResponse = responses[0].body;
        responses.forEach((response) => {
          expect(response.body).to.deep.equal(firstResponse);
        });
      });
    });
  });

  describe('Performance and Caching', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(5000); // Should respond within 5 seconds
      });
    });

    it('should handle rapid successive calls', () => {
      const callCount = 10;
      const calls = [];
      
      for (let i = 0; i < callCount; i++) {
        calls.push(cy.request('GET', apiEndpoints.devRoles));
      }
      
      Promise.all(calls).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });

    it('should maintain consistent response format across calls', () => {
      const responseStructures = [];
      
      // Make multiple calls and compare structures
      for (let i = 0; i < 3; i++) {
        cy.request('GET', apiEndpoints.devRoles).then((response) => {
          const structure = Object.keys(response.body).sort();
          responseStructures.push(structure);
          
          if (responseStructures.length === 3) {
            // All structures should be identical
            expect(responseStructures[0]).to.deep.equal(responseStructures[1]);
            expect(responseStructures[1]).to.deep.equal(responseStructures[2]);
          }
        });
      }
    });
  });

  describe('Security and Authorization', () => {
    it('should require authentication for all dev endpoints', () => {
      cy.clearCookies();
      
      const devEndpoints = [
        apiEndpoints.devRoles,
        `${apiEndpoints.devPermissions}/admin`,
        `${apiEndpoints.devEffectivePermissions}/admin`
      ];
      
      devEndpoints.forEach((endpoint) => {
        cy.request({
          method: 'GET',
          url: endpoint,
          failOnStatusCode: false
        }).then((response) => {
          expect([401, 403]).to.include(response.status);
        });
      });
    });

    it('should validate user permissions before allowing access', () => {
      // Test with current admin user (should work)
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
      });
      
      // Note: To fully test with different permission levels, 
      // we would need test users with different roles
    });

    it('should not expose sensitive information in responses', () => {
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
        
        const responseStr = JSON.stringify(response.body);
        
        // Should not contain sensitive data
        const sensitivePatterns = [
          /password/i,
          /secret/i,
          /token/i,
          /key/i,
          /hash/i
        ];
        
        sensitivePatterns.forEach((pattern) => {
          expect(responseStr).to.not.match(pattern);
        });
      });
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should return valid role data structure', () => {
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body.roles).to.be.an('array');
        
        if (response.body.roles.length > 0) {
          response.body.roles.forEach((role) => {
            expect(role).to.have.property('id');
            expect(role).to.have.property('name');
            expect(role.id).to.be.a('string');
            expect(role.name).to.be.a('string');
            expect(role.id.length).to.be.greaterThan(0);
            expect(role.name.length).to.be.greaterThan(0);
          });
        }
      });
    });

    it('should validate permission data format', () => {
      cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.permissions).to.be.an('array');
        
        response.body.permissions.forEach((permission) => {
          if (typeof permission === 'string') {
            expect(permission).to.match(/^[a-zA-Z_\-\.]+$/); // Valid permission format
          } else {
            expect(permission).to.have.property('name');
            expect(permission.name).to.be.a('string');
          }
        });
      });
    });

    it('should ensure no duplicate roles in response', () => {
      cy.request('GET', apiEndpoints.devRoles).then((response) => {
        expect(response.status).to.eq(200);
        
        const roleIds = response.body.roles.map(role => role.id);
        const roleNames = response.body.roles.map(role => role.name);
        
        // Check for duplicate IDs
        const uniqueIds = [...new Set(roleIds)];
        expect(roleIds.length).to.equal(uniqueIds.length);
        
        // Check for duplicate names
        const uniqueNames = [...new Set(roleNames)];
        expect(roleNames.length).to.equal(uniqueNames.length);
      });
    });

    it('should ensure no duplicate permissions in response', () => {
      cy.request('GET', `${apiEndpoints.devPermissions}/${testData.roles.admin}`).then((response) => {
        expect(response.status).to.eq(200);
        
        const permissions = response.body.permissions.map(p => 
          typeof p === 'string' ? p : p.name
        );
        
        const uniquePermissions = [...new Set(permissions)];
        expect(permissions.length).to.equal(uniquePermissions.length);
      });
    });
  });
});
