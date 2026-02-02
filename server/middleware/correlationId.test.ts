/**
 * Unit Tests for Correlation ID Middleware
 *
 * Tests the correlation ID extraction and propagation functionality:
 * - Header priority for correlation ID extraction
 * - User ID extraction from various auth patterns
 * - Session ID extraction
 * - Tracing headers generation
 */

import { describe, test, expect } from '@jest/globals';

// =============================================================================
// RECREATE HELPER FUNCTIONS FOR TESTING
// =============================================================================

const CORRELATION_HEADERS = [
  'x-correlation-id',
  'x-request-id',
  'x-b3-traceid',
  'traceparent',
];

const RESPONSE_HEADERS = {
  CORRELATION_ID: 'X-Correlation-ID',
  REQUEST_ID: 'X-Request-ID',
};

interface MockRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: {
    claims?: { sub?: string };
    id?: string;
    userId?: string;
  };
  sessionID?: string;
  session?: { id?: string };
  correlationId?: string;
  requestId?: string;
}

function extractCorrelationId(req: MockRequest): string | undefined {
  for (const header of CORRELATION_HEADERS) {
    const value = req.headers[header];
    if (value) {
      return Array.isArray(value) ? value[0] : value;
    }
  }
  return undefined;
}

function extractUserId(req: MockRequest): string | null {
  const user = req.user;
  return user?.claims?.sub || user?.id || user?.userId || null;
}

function extractSessionId(req: MockRequest): string | null {
  return req.sessionID || req.session?.id || null;
}

function getCorrelationIdFromRequest(req: MockRequest): string {
  return req.correlationId || 'unknown';
}

function getRequestIdFromRequest(req: MockRequest): string {
  return req.requestId || 'unknown';
}

function getTracingHeaders(req: MockRequest): Record<string, string> {
  return {
    'X-Correlation-ID': getCorrelationIdFromRequest(req),
    'X-Request-ID': getRequestIdFromRequest(req),
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('Correlation ID Middleware', () => {

  describe('RESPONSE_HEADERS constants', () => {
    test('should have correct correlation ID header name', () => {
      expect(RESPONSE_HEADERS.CORRELATION_ID).toBe('X-Correlation-ID');
    });

    test('should have correct request ID header name', () => {
      expect(RESPONSE_HEADERS.REQUEST_ID).toBe('X-Request-ID');
    });
  });

  describe('CORRELATION_HEADERS priority', () => {
    test('should have correct header priority order', () => {
      expect(CORRELATION_HEADERS).toEqual([
        'x-correlation-id',
        'x-request-id',
        'x-b3-traceid',
        'traceparent',
      ]);
    });
  });

  describe('extractCorrelationId', () => {
    describe('header priority', () => {
      test('should prefer x-correlation-id over other headers', () => {
        const req: MockRequest = {
          headers: {
            'x-correlation-id': 'corr-123',
            'x-request-id': 'req-456',
            'x-b3-traceid': 'trace-789',
          },
        };
        expect(extractCorrelationId(req)).toBe('corr-123');
      });

      test('should use x-request-id when x-correlation-id is missing', () => {
        const req: MockRequest = {
          headers: {
            'x-request-id': 'req-456',
            'x-b3-traceid': 'trace-789',
          },
        };
        expect(extractCorrelationId(req)).toBe('req-456');
      });

      test('should use x-b3-traceid when higher priority headers are missing', () => {
        const req: MockRequest = {
          headers: {
            'x-b3-traceid': 'trace-789',
            'traceparent': 'parent-abc',
          },
        };
        expect(extractCorrelationId(req)).toBe('trace-789');
      });

      test('should use traceparent when other headers are missing', () => {
        const req: MockRequest = {
          headers: {
            'traceparent': '00-trace-id-here-01',
          },
        };
        expect(extractCorrelationId(req)).toBe('00-trace-id-here-01');
      });
    });

    describe('edge cases', () => {
      test('should return undefined when no headers present', () => {
        const req: MockRequest = { headers: {} };
        expect(extractCorrelationId(req)).toBeUndefined();
      });

      test('should handle array header values (take first)', () => {
        const req: MockRequest = {
          headers: {
            'x-correlation-id': ['first-value', 'second-value'],
          },
        };
        expect(extractCorrelationId(req)).toBe('first-value');
      });

      test('should handle empty string header value', () => {
        const req: MockRequest = {
          headers: {
            'x-correlation-id': '',
            'x-request-id': 'fallback-id',
          },
        };
        // Empty string is falsy, should fallback
        expect(extractCorrelationId(req)).toBe('fallback-id');
      });

      test('should handle undefined header value', () => {
        const req: MockRequest = {
          headers: {
            'x-correlation-id': undefined,
            'x-request-id': 'fallback-id',
          },
        };
        expect(extractCorrelationId(req)).toBe('fallback-id');
      });
    });

    describe('real-world scenarios', () => {
      test('should extract Zipkin B3 trace ID', () => {
        const req: MockRequest = {
          headers: {
            'x-b3-traceid': '463ac35c9f6413ad48485a3953bb6124',
            'x-b3-spanid': '0020000000000001',
            'x-b3-sampled': '1',
          },
        };
        expect(extractCorrelationId(req)).toBe('463ac35c9f6413ad48485a3953bb6124');
      });

      test('should extract W3C traceparent', () => {
        const req: MockRequest = {
          headers: {
            'traceparent': '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
          },
        };
        expect(extractCorrelationId(req)).toBe('00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01');
      });

      test('should extract custom application correlation ID', () => {
        const req: MockRequest = {
          headers: {
            'x-correlation-id': 'app-session-12345-user-67890',
          },
        };
        expect(extractCorrelationId(req)).toBe('app-session-12345-user-67890');
      });
    });
  });

  describe('extractUserId', () => {
    test('should extract user ID from claims.sub (Replit auth)', () => {
      const req: MockRequest = {
        headers: {},
        user: {
          claims: { sub: 'user-from-claims' },
        },
      };
      expect(extractUserId(req)).toBe('user-from-claims');
    });

    test('should extract user ID from user.id', () => {
      const req: MockRequest = {
        headers: {},
        user: {
          id: 'user-from-id',
        },
      };
      expect(extractUserId(req)).toBe('user-from-id');
    });

    test('should extract user ID from user.userId', () => {
      const req: MockRequest = {
        headers: {},
        user: {
          userId: 'user-from-userId',
        },
      };
      expect(extractUserId(req)).toBe('user-from-userId');
    });

    test('should prioritize claims.sub over other fields', () => {
      const req: MockRequest = {
        headers: {},
        user: {
          claims: { sub: 'claims-user' },
          id: 'id-user',
          userId: 'userId-user',
        },
      };
      expect(extractUserId(req)).toBe('claims-user');
    });

    test('should prioritize user.id over user.userId', () => {
      const req: MockRequest = {
        headers: {},
        user: {
          id: 'id-user',
          userId: 'userId-user',
        },
      };
      expect(extractUserId(req)).toBe('id-user');
    });

    test('should return null when no user', () => {
      const req: MockRequest = {
        headers: {},
      };
      expect(extractUserId(req)).toBeNull();
    });

    test('should return null when user has no ID fields', () => {
      const req: MockRequest = {
        headers: {},
        user: {},
      };
      expect(extractUserId(req)).toBeNull();
    });

    test('should handle empty claims object', () => {
      const req: MockRequest = {
        headers: {},
        user: {
          claims: {},
        },
      };
      expect(extractUserId(req)).toBeNull();
    });
  });

  describe('extractSessionId', () => {
    test('should extract session ID from sessionID property', () => {
      const req: MockRequest = {
        headers: {},
        sessionID: 'session-from-sessionID',
      };
      expect(extractSessionId(req)).toBe('session-from-sessionID');
    });

    test('should extract session ID from session.id', () => {
      const req: MockRequest = {
        headers: {},
        session: { id: 'session-from-session-id' },
      };
      expect(extractSessionId(req)).toBe('session-from-session-id');
    });

    test('should prioritize sessionID over session.id', () => {
      const req: MockRequest = {
        headers: {},
        sessionID: 'primary-session',
        session: { id: 'secondary-session' },
      };
      expect(extractSessionId(req)).toBe('primary-session');
    });

    test('should return null when no session info', () => {
      const req: MockRequest = {
        headers: {},
      };
      expect(extractSessionId(req)).toBeNull();
    });

    test('should return null when session exists but has no id', () => {
      const req: MockRequest = {
        headers: {},
        session: {},
      };
      expect(extractSessionId(req)).toBeNull();
    });
  });

  describe('getCorrelationIdFromRequest', () => {
    test('should return correlation ID from request', () => {
      const req: MockRequest = {
        headers: {},
        correlationId: 'stored-correlation-id',
      };
      expect(getCorrelationIdFromRequest(req)).toBe('stored-correlation-id');
    });

    test('should return unknown when no correlation ID stored', () => {
      const req: MockRequest = {
        headers: {},
      };
      expect(getCorrelationIdFromRequest(req)).toBe('unknown');
    });
  });

  describe('getRequestIdFromRequest', () => {
    test('should return request ID from request', () => {
      const req: MockRequest = {
        headers: {},
        requestId: 'stored-request-id',
      };
      expect(getRequestIdFromRequest(req)).toBe('stored-request-id');
    });

    test('should return unknown when no request ID stored', () => {
      const req: MockRequest = {
        headers: {},
      };
      expect(getRequestIdFromRequest(req)).toBe('unknown');
    });
  });

  describe('getTracingHeaders', () => {
    test('should return both tracing headers', () => {
      const req: MockRequest = {
        headers: {},
        correlationId: 'corr-123',
        requestId: 'req-456',
      };

      const headers = getTracingHeaders(req);

      expect(headers).toEqual({
        'X-Correlation-ID': 'corr-123',
        'X-Request-ID': 'req-456',
      });
    });

    test('should return unknown for missing IDs', () => {
      const req: MockRequest = {
        headers: {},
      };

      const headers = getTracingHeaders(req);

      expect(headers).toEqual({
        'X-Correlation-ID': 'unknown',
        'X-Request-ID': 'unknown',
      });
    });

    test('should return correctly formatted headers for external service calls', () => {
      const req: MockRequest = {
        headers: {},
        correlationId: 'external-trace-id',
        requestId: 'external-request-id',
      };

      const headers = getTracingHeaders(req);

      // Verify headers can be spread into fetch/axios options
      expect(Object.keys(headers)).toContain('X-Correlation-ID');
      expect(Object.keys(headers)).toContain('X-Request-ID');
    });
  });

  describe('Integration scenarios', () => {
    test('should handle typical authenticated request', () => {
      const req: MockRequest = {
        headers: {
          'x-correlation-id': 'api-gateway-correlation-id',
        },
        user: {
          claims: { sub: 'user-12345' },
          id: 'user-12345',
        },
        sessionID: 'sess-abcdef',
        correlationId: 'api-gateway-correlation-id',
        requestId: 'generated-request-id',
      };

      expect(extractCorrelationId(req)).toBe('api-gateway-correlation-id');
      expect(extractUserId(req)).toBe('user-12345');
      expect(extractSessionId(req)).toBe('sess-abcdef');
      expect(getCorrelationIdFromRequest(req)).toBe('api-gateway-correlation-id');
      expect(getRequestIdFromRequest(req)).toBe('generated-request-id');
    });

    test('should handle unauthenticated request', () => {
      const req: MockRequest = {
        headers: {},
        correlationId: 'generated-correlation-id',
        requestId: 'generated-request-id',
      };

      expect(extractUserId(req)).toBeNull();
      expect(extractSessionId(req)).toBeNull();
      expect(getCorrelationIdFromRequest(req)).toBe('generated-correlation-id');
    });

    test('should handle request from microservice with B3 headers', () => {
      const req: MockRequest = {
        headers: {
          'x-b3-traceid': '80f198ee56343ba864fe8b2a57d3eff7',
          'x-b3-parentspanid': 'e457b5a2e4d86bd1',
          'x-b3-spanid': 'e457b5a2e4d86bd1',
          'x-b3-sampled': '1',
        },
      };

      expect(extractCorrelationId(req)).toBe('80f198ee56343ba864fe8b2a57d3eff7');
    });
  });
});
