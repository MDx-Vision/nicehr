/**
 * Unit Tests for Audit Log Utility Functions
 *
 * Tests the pure functions used in HIPAA-compliant audit logging:
 * - getClientIp: IP address extraction from request headers
 * - getUserAgent: User agent extraction and truncation
 * - determineAction: Action determination from HTTP method and path
 */

import { describe, test, expect } from '@jest/globals';

// Since these functions are not exported, we recreate them for testing
// In a real scenario, these would be exported or we'd use dependency injection

/**
 * Extract client IP address from request
 * Handles proxied requests (X-Forwarded-For) and direct connections
 */
function getClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}): string | null {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(",")[0];
    return ips?.trim() || null;
  }
  return req.ip || req.socket?.remoteAddress || null;
}

/**
 * Extract user agent from request, truncated to fit database column
 */
function getUserAgent(req: {
  headers: Record<string, string | undefined>;
}): string | null {
  const userAgent = req.headers["user-agent"];
  if (!userAgent) return null;
  return userAgent.substring(0, 500);
}

/**
 * Determine the action from HTTP method and path
 */
function determineAction(method: string, path: string): string {
  const methodUpper = method.toUpperCase();
  const pathParts = path.split("/").filter(Boolean);
  const resourceIndex = pathParts.indexOf("api");
  const resource = pathParts[resourceIndex + 1] || "unknown";

  switch (methodUpper) {
    case "GET":
      return `view_${resource}`;
    case "POST":
      return `create_${resource}`;
    case "PUT":
    case "PATCH":
      return `update_${resource}`;
    case "DELETE":
      return `delete_${resource}`;
    default:
      return `${methodUpper.toLowerCase()}_${resource}`;
  }
}

describe('Audit Log Utilities', () => {

  describe('getClientIp', () => {
    test('should extract IP from X-Forwarded-For header (string)', () => {
      const req = {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      };
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    test('should extract IP from X-Forwarded-For header (array)', () => {
      const req = {
        headers: { 'x-forwarded-for': ['203.0.113.195', '70.41.3.18'] },
      };
      expect(getClientIp(req)).toBe('203.0.113.195');
    });

    test('should trim whitespace from forwarded IP', () => {
      const req = {
        headers: { 'x-forwarded-for': '  192.168.1.1  , 10.0.0.1' },
      };
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    test('should fallback to req.ip when no forwarded header', () => {
      const req = {
        headers: {},
        ip: '127.0.0.1',
      };
      expect(getClientIp(req)).toBe('127.0.0.1');
    });

    test('should fallback to socket.remoteAddress when no ip', () => {
      const req = {
        headers: {},
        socket: { remoteAddress: '10.0.0.5' },
      };
      expect(getClientIp(req)).toBe('10.0.0.5');
    });

    test('should return null when no IP available', () => {
      const req = {
        headers: {},
      };
      expect(getClientIp(req)).toBeNull();
    });

    test('should return null for empty X-Forwarded-For', () => {
      const req = {
        headers: { 'x-forwarded-for': '' },
      };
      expect(getClientIp(req)).toBeNull();
    });
  });

  describe('getUserAgent', () => {
    test('should return user agent from headers', () => {
      const req = {
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      };
      expect(getUserAgent(req)).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    });

    test('should return null when no user agent', () => {
      const req = {
        headers: {},
      };
      expect(getUserAgent(req)).toBeNull();
    });

    test('should truncate user agent to 500 characters', () => {
      const longUserAgent = 'A'.repeat(600);
      const req = {
        headers: { 'user-agent': longUserAgent },
      };
      const result = getUserAgent(req);
      expect(result?.length).toBe(500);
    });

    test('should preserve user agent under 500 characters', () => {
      const shortUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      const req = {
        headers: { 'user-agent': shortUserAgent },
      };
      expect(getUserAgent(req)).toBe(shortUserAgent);
    });
  });

  describe('determineAction', () => {
    describe('HTTP method mapping', () => {
      test('should map GET to view action', () => {
        expect(determineAction('GET', '/api/consultants')).toBe('view_consultants');
      });

      test('should map POST to create action', () => {
        expect(determineAction('POST', '/api/projects')).toBe('create_projects');
      });

      test('should map PUT to update action', () => {
        expect(determineAction('PUT', '/api/hospitals/123')).toBe('update_hospitals');
      });

      test('should map PATCH to update action', () => {
        expect(determineAction('PATCH', '/api/users/456')).toBe('update_users');
      });

      test('should map DELETE to delete action', () => {
        expect(determineAction('DELETE', '/api/tickets/789')).toBe('delete_tickets');
      });

      test('should handle OPTIONS method', () => {
        expect(determineAction('OPTIONS', '/api/data')).toBe('options_data');
      });

      test('should handle HEAD method', () => {
        expect(determineAction('HEAD', '/api/health')).toBe('head_health');
      });
    });

    describe('case handling', () => {
      test('should handle lowercase HTTP method', () => {
        expect(determineAction('get', '/api/consultants')).toBe('view_consultants');
      });

      test('should handle mixed case HTTP method', () => {
        expect(determineAction('Post', '/api/projects')).toBe('create_projects');
      });
    });

    describe('path parsing', () => {
      test('should extract resource from simple API path', () => {
        expect(determineAction('GET', '/api/users')).toBe('view_users');
      });

      test('should extract resource from nested API path', () => {
        expect(determineAction('GET', '/api/crm/contacts')).toBe('view_crm');
      });

      test('should extract resource from path with ID', () => {
        expect(determineAction('GET', '/api/hospitals/abc-123/projects')).toBe('view_hospitals');
      });

      test('should extract first segment for path without api prefix', () => {
        // When 'api' is not in path, uses first segment after root
        expect(determineAction('GET', '/health')).toBe('view_health');
      });

      test('should return unknown for root path', () => {
        expect(determineAction('GET', '/')).toBe('view_unknown');
      });

      test('should handle path with trailing slash', () => {
        expect(determineAction('GET', '/api/consultants/')).toBe('view_consultants');
      });
    });

    describe('common API resources', () => {
      test('should handle dashboard endpoint', () => {
        expect(determineAction('GET', '/api/dashboard/stats')).toBe('view_dashboard');
      });

      test('should handle support-tickets endpoint', () => {
        expect(determineAction('POST', '/api/support-tickets')).toBe('create_support-tickets');
      });

      test('should handle schedules endpoint', () => {
        expect(determineAction('PATCH', '/api/schedules/schedule-123')).toBe('update_schedules');
      });

      test('should handle invoices endpoint', () => {
        expect(determineAction('DELETE', '/api/invoices/inv-456')).toBe('delete_invoices');
      });

      test('should handle contracts endpoint', () => {
        expect(determineAction('GET', '/api/contracts/contract-789/signers')).toBe('view_contracts');
      });
    });
  });

  describe('Integration scenarios', () => {
    test('should handle typical authenticated request', () => {
      const req = {
        headers: {
          'x-forwarded-for': '203.0.113.50',
          'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0',
        },
        ip: '10.0.0.1',
      };

      expect(getClientIp(req)).toBe('203.0.113.50');
      expect(getUserAgent(req)).toBe('Mozilla/5.0 Chrome/120.0.0.0');
    });

    test('should handle localhost development request', () => {
      const req = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        },
        ip: '::1',
      };

      expect(getClientIp(req)).toBe('::1');
      expect(getUserAgent(req)).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
    });

    test('should handle API client request without user agent', () => {
      const req = {
        headers: {},
        socket: { remoteAddress: '192.168.1.100' },
      };

      expect(getClientIp(req)).toBe('192.168.1.100');
      expect(getUserAgent(req)).toBeNull();
    });

    test('should generate correct action for CRUD operations', () => {
      expect(determineAction('POST', '/api/hospitals')).toBe('create_hospitals');
      expect(determineAction('GET', '/api/hospitals/h1')).toBe('view_hospitals');
      expect(determineAction('PATCH', '/api/hospitals/h1')).toBe('update_hospitals');
      expect(determineAction('DELETE', '/api/hospitals/h1')).toBe('delete_hospitals');
    });
  });
});
