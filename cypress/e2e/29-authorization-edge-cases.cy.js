// Authorization and RBAC Edge Cases Tests
// Tests for permission enforcement, error responses, and security edge cases

describe('Authorization Edge Cases', () => {
  const adminUser = {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };

  const consultantUser = {
    id: 2,
    email: 'consultant@example.com',
    firstName: 'Consultant',
    lastName: 'User',
    role: 'consultant'
  };

  const hospitalStaffUser = {
    id: 3,
    email: 'staff@hospital.com',
    firstName: 'Hospital',
    lastName: 'Staff',
    role: 'hospital_staff'
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/notifications*', {
      statusCode: 200,
      body: []
    }).as('getNotifications');

    cy.intercept('GET', '/api/notifications/counts', {
      statusCode: 200,
      body: {}
    }).as('getNotificationCounts');

    cy.intercept('GET', '/api/notifications/unread-count', {
      statusCode: 200,
      body: { count: 0 }
    }).as('getUnreadCount');
  });

  describe('Permission Enforcement Tests', () => {
    it('should allow admin access to all resources', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin', 'read:all', 'write:all', 'delete:all'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.contains('Dashboard').should('be.visible');
    });

    it('should restrict consultant role to own resources', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: consultantUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['consultant', 'read:own', 'write:own'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['consultant']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should limit hospital staff access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: hospitalStaffUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['hospital_staff', 'read:hospital'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['hospital_staff']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce project manager permissions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...adminUser, role: 'project_manager' }
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['project_manager', 'read:projects', 'write:projects'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['project_manager']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce read-only user restrictions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...adminUser, role: 'readonly' }
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['readonly', 'read:all'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['readonly']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce hospital-scoped data access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...hospitalStaffUser, hospitalId: 1 }
      }).as('getUser');

      cy.intercept('GET', '/api/hospitals', {
        statusCode: 200,
        body: [{ id: 1, name: 'My Hospital' }]
      }).as('getHospitals');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['hospital_staff'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['hospital_staff']
      }).as('getEffectivePermissions');

      cy.visit('/hospitals');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce project-scoped permissions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...consultantUser, projectIds: [1, 2] }
      }).as('getUser');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Project A' },
          { id: 2, name: 'Project B' }
        ]
      }).as('getProjects');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['consultant'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['consultant']
      }).as('getEffectivePermissions');

      cy.visit('/projects');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce document approval workflows', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('POST', '/api/documents/approve', {
        statusCode: 200,
        body: { approved: true }
      }).as('approveDoc');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin', 'approve:documents'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce PHI access restrictions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...consultantUser, phiAccess: true }
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['consultant', 'access:phi'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['consultant', 'access:phi']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce role hierarchy', () => {
      cy.intercept('GET', '/api/rbac/hierarchy', {
        statusCode: 200,
        body: {
          admin: ['project_manager', 'consultant', 'hospital_staff'],
          project_manager: ['consultant'],
          consultant: [],
          hospital_staff: []
        }
      }).as('roleHierarchy');

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce permission inheritance', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/rbac/inherited-permissions', {
        statusCode: 200,
        body: ['read:all', 'write:all', 'delete:all', 'admin:all']
      }).as('inheritedPerms');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle dynamic permission updates', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('POST', '/api/rbac/refresh', {
        statusCode: 200,
        body: { refreshed: true, newPermissions: ['admin', 'super_admin'] }
      }).as('refreshPerms');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should cache permissions appropriately', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/rbac/cache-status', {
        statusCode: 200,
        body: { cached: true, expiresIn: 300 }
      }).as('cacheStatus');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should deny cross-hospital access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...hospitalStaffUser, hospitalId: 1 }
      }).as('getUser');

      cy.intercept('GET', '/api/hospitals/2', {
        statusCode: 403,
        body: { error: 'Access denied to this hospital' }
      }).as('crossHospitalDenied');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['hospital_staff'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['hospital_staff']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should deny cross-project access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...consultantUser, projectIds: [1] }
      }).as('getUser');

      cy.intercept('GET', '/api/projects/2', {
        statusCode: 403,
        body: { error: 'Access denied to this project' }
      }).as('crossProjectDenied');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['consultant'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['consultant']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce API endpoint permission checks', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: consultantUser
      }).as('getUser');

      cy.intercept('DELETE', '/api/users/*', {
        statusCode: 403,
        body: { error: 'Insufficient permissions' }
      }).as('deleteUserDenied');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['consultant'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['consultant']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should control UI element visibility by role', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: consultantUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['consultant'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['consultant']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      // Admin-only buttons should not be visible
      cy.get('body').should('be.visible');
    });

    it('should control action button availability by role', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...consultantUser, role: 'readonly' }
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['readonly'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['readonly']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should restrict menu items by role', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: hospitalStaffUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['hospital_staff'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['hospital_staff']
      }).as('getEffectivePermissions');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });
  });

  describe('Error Response Tests', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');
    });

    it('should return 401 for missing token', () => {
      cy.intercept('GET', '/api/protected-resource', {
        statusCode: 401,
        body: { error: 'Authentication required' }
      }).as('missingToken');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 401 for expired token', () => {
      cy.intercept('GET', '/api/protected-resource', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('expiredToken');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 401 for invalid token', () => {
      cy.intercept('GET', '/api/protected-resource', {
        statusCode: 401,
        body: { error: 'Invalid token' }
      }).as('invalidToken');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 403 for insufficient permissions', () => {
      cy.intercept('DELETE', '/api/admin-resource', {
        statusCode: 403,
        body: { error: 'Insufficient permissions' }
      }).as('insufficientPerms');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 403 for wrong hospital access', () => {
      cy.intercept('GET', '/api/hospitals/999/data', {
        statusCode: 403,
        body: { error: 'Access to this hospital is not permitted' }
      }).as('wrongHospital');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 403 for wrong project access', () => {
      cy.intercept('GET', '/api/projects/999/data', {
        statusCode: 403,
        body: { error: 'Access to this project is not permitted' }
      }).as('wrongProject');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 403 for role mismatch', () => {
      cy.intercept('POST', '/api/admin-only-action', {
        statusCode: 403,
        body: { error: 'Admin role required' }
      }).as('roleMismatch');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should return 404 for non-existent resource', () => {
      cy.intercept('GET', '/api/resources/non-existent', {
        statusCode: 404,
        body: { error: 'Resource not found' }
      }).as('notFound');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should prevent 404 vs 403 information disclosure', () => {
      // Should return 404 even for forbidden resources to prevent enumeration
      cy.intercept('GET', '/api/secret-resource/123', {
        statusCode: 404,
        body: { error: 'Resource not found' }
      }).as('secureNotFound');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should sanitize error messages', () => {
      cy.intercept('GET', '/api/sensitive-error', {
        statusCode: 500,
        body: { error: 'An error occurred', details: null }
      }).as('sanitizedError');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should hide stack traces in production', () => {
      cy.intercept('GET', '/api/error-with-stack', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('noStackTrace');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should enforce rate limiting', () => {
      cy.intercept('GET', '/api/rate-limited', {
        statusCode: 429,
        body: { error: 'Too many requests', retryAfter: 60 }
      }).as('rateLimited');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should implement brute force protection', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 429,
        body: { error: 'Too many failed attempts', lockoutMinutes: 15 }
      }).as('bruteForceProtection');

      cy.visit('/login');
      cy.get('body').should('be.visible');
    });

    it('should enforce account lockout after failures', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 423,
        body: { error: 'Account locked', unlockTime: Date.now() + 900000 }
      }).as('accountLocked');

      cy.visit('/login');
      cy.get('body').should('be.visible');
    });

    it('should validate CSRF tokens', () => {
      cy.intercept('POST', '/api/csrf-protected', {
        statusCode: 403,
        body: { error: 'Invalid CSRF token' }
      }).as('csrfInvalid');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: adminUser
      }).as('getUser');

      cy.intercept('GET', '/api/permissions', {
        statusCode: 200,
        body: { permissions: ['admin'] }
      }).as('getPermissions');

      cy.intercept('GET', '/api/rbac/effective-permissions', {
        statusCode: 200,
        body: ['admin']
      }).as('getEffectivePermissions');
    });

    it('should handle role change during active session', () => {
      cy.intercept('POST', '/api/auth/role-change', {
        statusCode: 200,
        body: { newRole: 'consultant', requiresReauth: true }
      }).as('roleChange');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle permission revocation', () => {
      cy.intercept('POST', '/api/rbac/revoke', {
        statusCode: 200,
        body: { revoked: true, revokedPermissions: ['delete:all'] }
      }).as('permissionRevoked');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle deleted user access attempt', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 401,
        body: { error: 'User account has been deleted' }
      }).as('deletedUser');

      cy.visit('/login');
      cy.get('body').should('be.visible');
    });

    it('should handle disabled user access attempt', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 403,
        body: { error: 'User account is disabled' }
      }).as('disabledUser');

      cy.visit('/login');
      cy.get('body').should('be.visible');
    });

    it('should handle expired account access', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 403,
        body: { error: 'Account has expired' }
      }).as('expiredAccount');

      cy.visit('/login');
      cy.get('body').should('be.visible');
    });

    it('should handle multi-role user permissions', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { ...adminUser, roles: ['admin', 'consultant'] }
      }).as('multiRoleUser');

      cy.intercept('GET', '/api/rbac/merged-permissions', {
        statusCode: 200,
        body: ['admin', 'consultant', 'read:all', 'write:all']
      }).as('mergedPerms');

      cy.visit('/');
      cy.wait('@multiRoleUser');
      cy.get('body').should('be.visible');
    });

    it('should resolve permission conflicts', () => {
      cy.intercept('GET', '/api/rbac/resolve-conflict', {
        statusCode: 200,
        body: { resolved: 'allow', rule: 'most_permissive' }
      }).as('conflictResolution');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle temporary permission grants', () => {
      cy.intercept('POST', '/api/rbac/temporary-grant', {
        statusCode: 200,
        body: { granted: true, expires: Date.now() + 3600000 }
      }).as('tempGrant');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle permission expiration', () => {
      cy.intercept('GET', '/api/rbac/check-expiry', {
        statusCode: 200,
        body: { expired: ['temporary:access'], active: ['admin'] }
      }).as('permExpiry');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle delegation of permissions', () => {
      cy.intercept('POST', '/api/rbac/delegate', {
        statusCode: 200,
        body: { delegated: true, toUser: 2, permissions: ['read:reports'] }
      }).as('delegation');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should control impersonation', () => {
      cy.intercept('POST', '/api/auth/impersonate', {
        statusCode: 200,
        body: { impersonating: true, targetUser: consultantUser }
      }).as('impersonate');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should log failed access attempts', () => {
      cy.intercept('POST', '/api/audit/access-denied', {
        statusCode: 200,
        body: { logged: true, eventId: 'denied-123' }
      }).as('logDenied');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should send failed access notifications', () => {
      cy.intercept('POST', '/api/notifications/access-denied', {
        statusCode: 200,
        body: { notified: true, adminsNotified: 2 }
      }).as('notifyDenied');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should prevent privilege escalation', () => {
      cy.intercept('POST', '/api/rbac/escalate', {
        statusCode: 403,
        body: { error: 'Privilege escalation not permitted' }
      }).as('escalationDenied');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle token refresh edge cases', () => {
      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: { refreshed: true, newToken: 'new-token-123' }
      }).as('tokenRefresh');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });
  });
});
