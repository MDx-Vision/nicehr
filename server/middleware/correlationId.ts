/**
 * Correlation ID Middleware
 *
 * Based on MDx-Vision Enterprise Issue #90 implementation.
 * Extracts or generates correlation IDs for distributed tracing.
 *
 * Header Priority (in order):
 * 1. X-Correlation-ID (custom)
 * 2. X-Request-ID (common)
 * 3. X-B3-TraceId (Spring Cloud Sleuth / Zipkin)
 *
 * If no header is found, generates a new UUID v4.
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logContext, LogContext } from '../structuredLogger';

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Headers to check for incoming correlation ID (in priority order)
 */
const CORRELATION_HEADERS = [
  'x-correlation-id',
  'x-request-id',
  'x-b3-traceid', // Spring Cloud Sleuth / Zipkin
  'traceparent',  // W3C Trace Context
];

/**
 * Response headers to set for downstream tracing
 */
export const RESPONSE_HEADERS = {
  CORRELATION_ID: 'X-Correlation-ID',
  REQUEST_ID: 'X-Request-ID',
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Extract correlation ID from request headers
 */
function extractCorrelationId(req: Request): string | undefined {
  for (const header of CORRELATION_HEADERS) {
    const value = req.headers[header];
    if (value) {
      // Handle array headers (take first value)
      return Array.isArray(value) ? value[0] : value;
    }
  }
  return undefined;
}

/**
 * Extract user ID from request (supports multiple auth patterns)
 */
function extractUserId(req: Request): string | null {
  const user = req.user as {
    claims?: { sub?: string };
    id?: string;
    userId?: string;
  } | undefined;

  return user?.claims?.sub || user?.id || user?.userId || null;
}

/**
 * Extract session ID from request
 */
function extractSessionId(req: Request): string | null {
  // @ts-ignore - sessionID may exist from express-session
  return req.sessionID || req.session?.id || null;
}

/**
 * Correlation ID Middleware
 *
 * This middleware:
 * 1. Extracts or generates a correlation ID for the request
 * 2. Generates a unique request ID
 * 3. Sets up AsyncLocalStorage context for logging
 * 4. Adds correlation headers to the response
 *
 * @example
 * ```typescript
 * import { correlationIdMiddleware } from './middleware/correlationId';
 *
 * app.use(correlationIdMiddleware);
 * ```
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Extract or generate correlation ID
  const correlationId = extractCorrelationId(req) || randomUUID();

  // Always generate a unique request ID for this specific request
  const requestId = randomUUID();

  // Extract user and session info (may be populated later by auth middleware)
  const sessionId = extractSessionId(req);
  const userId = extractUserId(req);

  // Create the log context
  const context: LogContext = {
    correlationId,
    requestId,
    sessionId,
    userId,
    startTime: Date.now(),
  };

  // Set response headers for downstream tracing
  res.setHeader(RESPONSE_HEADERS.CORRELATION_ID, correlationId);
  res.setHeader(RESPONSE_HEADERS.REQUEST_ID, requestId);

  // Store correlation ID on request for other middleware to access
  (req as any).correlationId = correlationId;
  (req as any).requestId = requestId;

  // Run the rest of the request in the async context
  logContext.run(context, () => {
    next();
  });
}

/**
 * Update the log context with user information
 * Call this after authentication middleware has run
 */
export function updateLogContextWithUser(req: Request): void {
  const currentContext = logContext.getStore();
  if (currentContext) {
    currentContext.userId = extractUserId(req);
    currentContext.sessionId = extractSessionId(req);
  }
}

/**
 * Get correlation ID from request object
 * Useful for passing to external services
 */
export function getCorrelationIdFromRequest(req: Request): string {
  return (req as any).correlationId || 'unknown';
}

/**
 * Get request ID from request object
 */
export function getRequestIdFromRequest(req: Request): string {
  return (req as any).requestId || 'unknown';
}

/**
 * Create headers object for outbound requests
 * Use this when calling external services to propagate correlation
 */
export function getTracingHeaders(req: Request): Record<string, string> {
  return {
    'X-Correlation-ID': getCorrelationIdFromRequest(req),
    'X-Request-ID': getRequestIdFromRequest(req),
  };
}

export default correlationIdMiddleware;
