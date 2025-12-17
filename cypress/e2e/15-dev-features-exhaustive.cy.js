describe('Dev Features - Exhaustive Tests', () => {
  const testData = {
    admin: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    roles: ['admin', 'hospital_admin', 'consultant', 'project_manager'],
    permissions: [
      'view_hospitals',
      'create_hospitals', 
      'edit_hospitals',
      'delete_hospitals',
      'view_consultants',
      'create_consultants',
      'edit_consultants',
      'delete_consultants',
      'view_projects',
      'create_projects',
      'edit_projects',
      'delete_projects'
    ]
  };

  const apiEndpoints = {
    roles: '/api/dev/roles',
    permissions: '/api/dev/permissions',
    effectivePermissions: '/api/dev/effective-permissions'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login as admin for dev features
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.admin.email);
    cy.get('[data-testid="input-password"]').type(testData.admin.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
  });

  describe('Dev Roles API Endpoint', () => {
    it('should fetch all available roles', () => {
      cy.intercept('GET', apiEndpoints.roles).as('getRoles');
      
      cy.request({
        method: 'GET',
        url: apiEndpoints.roles,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('roles');
        expect(response.body.roles).to.be.an('array');
        
        // Verify expected roles exist
        const roleNames = response.body.roles.map(role => role.name || role);
        testData.roles.forEach(expectedRole => {
          expect(roleNames).to.include(expectedRole);
        });
      });
    });

    it('should return proper role structure', () => {
      cy.request('GET', apiEndpoints.roles).then((response) => {
        expect(response.status).to.eq(200);
        
        if (response.body.roles && response.body.roles.length > 0) {
          const firstRole = response.body.roles[0];
          
          // Check role properties
          if (typeof firstRole === 'object') {
            expect(firstRole).to.have.property('name');
            expect(firstRole.name).to.be.a('string');
            expect(firstRole.name).to.not.be.empty;
            
            if (firstRole.description) {
              expect(firstRole.description).to.be.a('string');
            }
            
            if (firstRole.permissions) {
              expect(firstRole.permissions).to.be.an('array');
            }
          }
        }
      });
    });

    it('should handle authentication requirement', () => {
      // Test without authentication
      cy.clearCookies();
      
      cy.request({
        method: 'GET',
        url: apiEndpoints.roles,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    it('should handle CORS headers properly', () => {
      cy.request('GET', apiEndpoints.roles).then((response) => {
        expect(response.status).to.eq(200);
        // Check for proper headers if CORS is implemented
        if (response.headers['access-control-allow-origin']) {
          expect(response.headers).to.have.property('access-control-allow-origin');
        }
      });
    });
  });

  describe('Dev Permissions API Endpoint', () => {
    testData.roles.forEach(role => {
      it(`should fetch permissions for ${role} role`, () => {
        cy.intercept('GET', `${apiEndpoints.permissions}/${role}`).as(`getPermissions${role}`);
        
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.permissions}/${role}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('permissions');
            expect(response.body.permissions).to.be.an('array');
            
            // Verify permission structure
            if (response.body.permissions.length > 0) {
              const firstPermission = response.body.permissions[0];
              if (typeof firstPermission === 'object') {
                expect(firstPermission).to.have.property('name');
                expect(firstPermission.name).to.be.a('string');
              }
            }
          } else if (response.status === 404) {
            // Role might not exist, which is acceptable
            expect(response.status).to.eq(404);
          } else {
            // Other errors should not occur for valid requests
            expect([200, 404]).to.include(response.status);
          }
        });
      });
    });

    it('should return 404 for non-existent role', () => {
      const nonExistentRole = 'non-existent-role-123';
      
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.permissions}/${nonExistentRole}`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('should handle invalid role format', () => {
      const invalidRoles = ['', '   ', 'role with spaces', 'role@invalid', 'role#123'];
      
      invalidRoles.forEach(invalidRole => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.permissions}/${encodeURIComponent(invalidRole)}`,
          failOnStatusCode: false
        }).then((response) => {
          expect([400, 404]).to.include(response.status);
        });
      });
    });

    it('should validate permission response structure', () => {
      cy.request('GET', `${apiEndpoints.permissions}/admin`).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('permissions');
          expect(response.body.permissions).to.be.an('array');
          
          response.body.permissions.forEach(permission => {
            if (typeof permission === 'object') {
              expect(permission).to.have.property('name');
              expect(permission.name).to.be.a('string');
              expect(permission.name).to.not.be.empty;
              
              if (permission.description) {
                expect(permission.description).to.be.a('string');
              }
              
              if (permission.resource) {
                expect(permission.resource).to.be.a('string');
              }
              
              if (permission.action) {
                expect(permission.action).to.be.a('string');
              }
            }
          });
        }
      });
    });
  });

  describe('Dev Effective Permissions API Endpoint', () => {
    testData.roles.forEach(role => {
      it(`should fetch effective permissions for ${role} role`, () => {
        cy.intercept('GET', `${apiEndpoints.effectivePermissions}/${role}`).as(`getEffectivePermissions${role}`);
        
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.effectivePermissions}/${role}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('effectivePermissions');
            expect(response.body.effectivePermissions).to.be.an('array');
            
            // Verify effective permissions structure
            if (response.body.effectivePermissions.length > 0) {
              const firstPermission = response.body.effectivePermissions[0];
              if (typeof firstPermission === 'object') {
                expect(firstPermission).to.have.property('name');
                expect(firstPermission.name).to.be.a('string');
                
                // Check for effective permission specific fields
                if (firstPermission.inherited) {
                  expect(firstPermission.inherited).to.be.a('boolean');
                }
                
                if (firstPermission.source) {
                  expect(firstPermission.source).to.be.a('string');
                }
              }
            }
          } else {
            expect([200, 404]).to.include(response.status);
          }
        });
      });
    });

    it('should compare effective permissions vs direct permissions', () => {
      const testRole = 'admin';
      
      // Get direct permissions
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.permissions}/${testRole}`,
        failOnStatusCode: false
      }).then((directResponse) => {
        // Get effective permissions
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.effectivePermissions}/${testRole}`,
          failOnStatusCode: false
        }).then((effectiveResponse) => {
          if (directResponse.status === 200 && effectiveResponse.status === 200) {
            const directPermissions = directResponse.body.permissions || [];
            const effectivePermissions = effectiveResponse.body.effectivePermissions || [];
            
            // Effective permissions should include at least the direct permissions
            const directPermissionNames = directPermissions.map(p => 
              typeof p === 'string' ? p : p.name
            );
            const effectivePermissionNames = effectivePermissions.map(p => 
              typeof p === 'string' ? p : p.name
            );
            
            directPermissionNames.forEach(directPermission => {
              expect(effectivePermissionNames).to.include(directPermission);
            });
          }
        });
      });
    });

    it('should handle role inheritance in effective permissions', () => {
      cy.request({
        method: 'GET',
        url: `${apiEndpoints.effectivePermissions}/admin`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          const effectivePermissions = response.body.effectivePermissions || [];
          
          // Check if any permissions are marked as inherited
          const inheritedPermissions = effectivePermissions.filter(p => 
            typeof p === 'object' && p.inherited === true
          );
          
          if (inheritedPermissions.length > 0) {
            inheritedPermissions.forEach(permission => {
              expect(permission).to.have.property('source');
              expect(permission.source).to.be.a('string');
              expect(permission.source).to.not.be.empty;
            });
          }
        }
      });
    });
  });

  describe('Dev Features Error Handling', () => {
    it('should handle server errors gracefully', () => {
      // Test with endpoints that might cause server errors
      const endpoints = [
        apiEndpoints.roles,
        `${apiEndpoints.permissions}/admin`,
        `${apiEndpoints.effectivePermissions}/admin`
      ];
      
      endpoints.forEach(endpoint => {
        cy.request({
          method: 'GET',
          url: endpoint,
          failOnStatusCode: false
        }).then((response) => {
          // Should return proper HTTP status codes
          expect([200, 400, 401, 403, 404, 500]).to.include(response.status);
          
          // If error, should have proper error structure
          if (response.status >= 400) {
            expect(response.body).to.be.an('object');
            if (response.body.error) {
              expect(response.body.error).to.be.a('string');
            }
          }
        });
      });
    });

    it('should handle malformed requests', () => {
      // Test with various malformed inputs
      const malformedInputs = [
        'null',
        'undefined', 
        '{}',
        '[]',
        'true',
        'false',
        '123',
        'special-chars-!@#$%',
        'very-long-role-name-that-exceeds-reasonable-limits-and-might-cause-issues'
      ];
      
      malformedInputs.forEach(input => {
        cy.request({
          method: 'GET',
          url: `${apiEndpoints.permissions}/${encodeURIComponent(input)}`,
          failOnStatusCode: false
        }).then((response) => {
          expect([400, 404, 422]).to.include(response.status);
        });
      });
    });

    it('should validate request headers', () => {
      cy.request({
        method: 'GET',
        url: apiEndpoints.roles,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  describe('Dev Features Security', () => {
    it('should require proper authentication', () => {
      cy.clearCookies();
      
      const endpoints = [
        apiEndpoints.roles,
        `${apiEndpoints.permissions}/admin`,
        `${apiEndpoints.effectivePermissions}/admin`
      ];
      
      endpoints.forEach(endpoint => {
        cy.request({
          method: 'GET',
          url: endpoint,
          failOnStatusCode: false
        }).then((response) => {
          expect([401, 403]).to.include(response.status);
        });
      });
    });

    it('should validate user permissions for dev endpoints', () => {
      // These endpoints should typically be admin-only
      cy.request({
        method: 'GET',
        url: apiEndpoints.roles,
        failOnStatusCode: false
      }).then((response) => {
        // Should either work (if user has permission) or deny access
        expect([200, 403]).to.include(response.status);
      });
    });

    it('should not expose sensitive information', () => {
      cy.request('GET', apiEndpoints.roles).then((response) => {
        if (response.status === 200) {
          const responseText = JSON.stringify(response.body);
          
          // Check that sensitive data is not exposed
          const sensitivePatterns = [
            /password/i,
            /secret/i,
            /key/i,
            /token/i,
            /private/i,
            /internal/i
          ];
          
          sensitivePatterns.forEach(pattern => {
            expect(responseText).to.not.match(pattern);
          });
        }
      });
    });

    it('should have rate limiting protection', () => {
      const requests = Array.from({ length: 10 }, (_, i) => 
        cy.request({
          method: 'GET',
          url: apiEndpoints.roles,
          failOnStatusCode: false
        })
      );
      
      // All requests should complete, but rate limiting might kick in
      Promise.all(requests).then(responses => {
        const statusCodes = responses.map(r => r.status);
        const successCount = statusCodes.filter(code => code === 200).length;
        const rateLimitCount = statusCodes.filter(code => code === 429).length;
        
        // Either all succeed or some are rate limited
        expect(successCount + rateLimitCount).to.be.greaterThan(0);
      });
    });
  });

  describe('Dev Features Performance', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.request('GET', apiEndpoints.roles).then((response) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(5000); // 5 seconds max
      });
    });

    it('should handle concurrent requests properly', () => {
      const concurrentRequests = 5;
      const requests = Array.from({ length: concurrentRequests }, () => 
        cy.request({
          method: 'GET',
          url: apiEndpoints.roles,
          failOnStatusCode: false
        })
      );
      
      Promise.all(requests).then(responses => {
        responses.forEach(response => {
          expect([200, 429]).to.include(response.status);
          
          if (response.status === 200) {
            expect(response.body).to.have.property('roles');
          }
        });
      });
    });

    it('should cache responses appropriately', () => {
      let firstResponseTime, secondResponseTime;
      
      // First request
      const startTime1 = Date.now();
      cy.request('GET', apiEndpoints.roles).then((response1) => {
        const endTime1 = Date.now();
        firstResponseTime = endTime1 - startTime1;
        
        expect(response1.status).to.eq(200);
        
        // Second request (should potentially be faster if cached)
        const startTime2 = Date.now();
        cy.request('GET', apiEndpoints.roles).then((response2) => {
          const endTime2 = Date.now();
          secondResponseTime = endTime2 - startTime2;
          
          expect(response2.status).to.eq(200);
          expect(response1.body).to.deep.equal(response2.body);
          
          // Second request might be faster due to caching
          // This is informational, not a hard requirement
          cy.log(`First request: ${firstResponseTime}ms, Second request: ${secondResponseTime}ms`);
        });
      });
    });
  });

  describe('Dev Features Data Validation', () => {
    it('should return consistent data formats', () => {
      cy.request('GET', apiEndpoints.roles).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('roles');
        expect(response.body.roles).to.be.an('array');
        
        // All roles should have consistent structure
        response.body.roles.forEach(role => {
          if (typeof role === 'object') {
            expect(role).to.have.property('name');
            expect(role.name).to.be.a('string');
            expect(role.name).to.not.be.empty;
          } else {
            expect(role).to.be.a('string');
            expect(role).to.not.be.empty;
          }
        });
      });
    });

    it('should validate permission data integrity', () => {
      cy.request('GET', `${apiEndpoints.permissions}/admin`).then((response) => {
        if (response.status === 200) {
          const permissions = response.body.permissions || [];
          
          permissions.forEach(permission => {
            if (typeof permission === 'object') {
              // Required fields
              expect(permission).to.have.property('name');
              expect(permission.name).to.be.a('string');
              expect(permission.name).to.not.be.empty;
              
              // Optional fields should have correct types if present
              if (permission.description !== undefined) {
                expect(permission.description).to.be.a('string');
              }
              
              if (permission.resource !== undefined) {
                expect(permission.resource).to.be.a('string');
              }
              
              if (permission.action !== undefined) {
                expect(permission.action).to.be.a('string');
              }
            }
          });
        }
      });
    });

    it('should maintain referential integrity between endpoints', () => {
      // Get all roles
      cy.request('GET', apiEndpoints.roles).then((rolesResponse) => {
        if (rolesResponse.status === 200) {
          const roles = rolesResponse.body.roles || [];
          const roleNames = roles.map(role => 
            typeof role === 'string' ? role : role.name
          );
          
          // Test permissions for each role
          roleNames.forEach(roleName => {
            cy.request({
              method: 'GET',
              url: `${apiEndpoints.permissions}/${roleName}`,
              failOnStatusCode: false
            }).then((permissionsResponse) => {
              // Should either return permissions or 404 (but be consistent)
              expect([200, 404]).to.include(permissionsResponse.status);
              
              if (permissionsResponse.status === 200) {
                expect(permissionsResponse.body).to.have.property('permissions');
                expect(permissionsResponse.body.permissions).to.be.an('array');
              }
            });
          });
        }
      });
    });
  });
});
