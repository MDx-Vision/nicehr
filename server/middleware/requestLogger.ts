/**
 * Request Logger Middleware
 *
 * Based on MDx-Vision Enterprise Issue #90 implementation.
 * Logs HTTP requests and responses with structured JSON output.
 *
 * Features:
 * - Request start logging
 * - Response completion logging with duration
 * - Status code-based log levels
 * - HIPAA compliant (no body logging)
 */

import { Request, Response, NextFunction } from 'express';
import { logger, logContext } from '../structuredLogger';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Paths to skip logging (health checks, static assets, etc.)
 */
const SKIP_PATHS = [
  '/api/health',
  '/favicon.ico',
  '/_vite',
  '/node_modules',
  '/@vite',
  '/@fs',
];

/**
 * Check if a path should be skipped
 */
function shouldSkipPath(path: string): boolean {
  return SKIP_PATHS.some(skip => path.startsWith(skip));
}

/**
 * Sanitize path for logging (remove sensitive query params)
 * HIPAA: Never log query parameters that might contain PHI
 */
function sanitizePath(path: string): string {
  // Only log the path, not query string
  return path.split('?')[0];
}

/**
 * Get log level based on status code
 */
function getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Extract safe metadata from request (HIPAA compliant)
 */
function getRequestMetadata(req: Request): Record<string, unknown> {
  return {
    method: req.method,
    path: sanitizePath(req.path),
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    user_agent: req.headers['user-agent']?.substring(0, 200), // Truncate
    content_type: req.headers['content-type'],
    content_length: req.headers['content-length'],
    referer: req.headers['referer'],
  };
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Request Logger Middleware
 *
 * Logs:
 * - Request start with method and path
 * - Response completion with status code and duration
 *
 * HIPAA Compliance:
 * - Never logs request bodies
 * - Never logs response bodies
 * - Never logs query parameters (may contain PHI)
 * - Truncates user agent strings
 *
 * @example
 * ```typescript
 * import { requestLoggerMiddleware } from './middleware/requestLogger';
 *
 * // Apply after correlationIdMiddleware
 * app.use(requestLoggerMiddleware);
 * ```
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip logging for certain paths
  if (shouldSkipPath(req.path)) {
    return next();
  }

  const startTime = Date.now();
  const sanitizedPath = sanitizePath(req.path);

  // Log request start (only for API routes to reduce noise)
  if (req.path.startsWith('/api')) {
    logger.debug(`→ ${req.method} ${sanitizedPath}`, {
      metadata: {
        type: 'request_start',
        ...getRequestMetadata(req),
      },
    });
  }

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Only log API routes to reduce noise
    if (!req.path.startsWith('/api')) {
      return;
    }

    // Get the appropriate log level
    const level = getLogLevel(statusCode);
    const statusSymbol = statusCode >= 400 ? '✗' : '✓';

    // Log response
    logger[level](`← ${req.method} ${sanitizedPath} ${statusCode} ${statusSymbol}`, {
      duration_ms: duration,
      metadata: {
        type: 'request_end',
        method: req.method,
        path: sanitizedPath,
        status_code: statusCode,
        duration_ms: duration,
      },
    });
  });

  // Handle errors that occur during request processing
  res.on('error', (error) => {
    logger.error(`Request error: ${req.method} ${sanitizedPath}`, error, {
      metadata: {
        type: 'request_error',
        method: req.method,
        path: sanitizedPath,
      },
    });
  });

  next();
}

/**
 * Create a request-scoped logger with additional context
 * Useful for logging within route handlers
 */
export function createRequestLogger(req: Request) {
  const sanitizedPath = sanitizePath(req.path);
  const context = {
    resource_type: 'http_request',
    metadata: {
      method: req.method,
      path: sanitizedPath,
    },
  };

  return logger.child(context);
}

/**
 * Log slow requests (for performance monitoring)
 */
export function logSlowRequest(req: Request, duration: number, threshold = 1000): void {
  if (duration > threshold) {
    logger.warn(`Slow request detected: ${req.method} ${sanitizePath(req.path)}`, {
      duration_ms: duration,
      metadata: {
        type: 'slow_request',
        threshold_ms: threshold,
        method: req.method,
        path: sanitizePath(req.path),
      },
    });
  }
}

export default requestLoggerMiddleware;
