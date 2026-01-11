/**
 * HIPAA Audit Logger
 *
 * Logs access to Protected Health Information (PHI) for HIPAA compliance.
 * All PHI access must be logged with who, what, when, and why.
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Represents an authenticated user with required id field.
 */
interface AuthenticatedUser {
  id: number;
  [key: string]: unknown;
}

/**
 * Type guard to check if a value is an authenticated user with numeric id.
 *
 * @param user - The user object to validate
 * @returns True if the user has a valid numeric id
 */
function isAuthenticatedUser(user: unknown): user is AuthenticatedUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    typeof (user as AuthenticatedUser).id === 'number'
  );
}

/**
 * Represents a single audit log entry for PHI access tracking.
 * All fields align with HIPAA audit requirements.
 */
export interface AuditLogEntry {
  userId: number;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'print';
  resourceType: 'patient' | 'medical_record' | 'prescription' | 'billing' | 'report';
  resourceId: string;
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logs PHI access events for HIPAA compliance.
 * In development, logs to console. In production, writes to secure audit database.
 *
 * @param entry - The audit log entry containing access details
 * @throws Never throws - audit failures are logged but don't crash the app
 */
export async function logPHIAccess(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = { ...entry, timestamp };

  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HIPAA AUDIT] ${timestamp}`, {
        user: entry.userId,
        action: entry.action,
        resource: `${entry.resourceType}:${entry.resourceId}`,
      });
    }

    // In production, write to secure audit log database
    // TODO: Implement database storage with append-only, tamper-evident table
    if (process.env.NODE_ENV === 'production') {
      // await db.insert(auditLogs).values(logEntry);
      console.log(`[HIPAA AUDIT] ${timestamp}`, JSON.stringify(logEntry));
    }
  } catch (error) {
    // Audit logging failures should never crash the app
    // but must be reported to monitoring
    console.error('[HIPAA AUDIT ERROR] Failed to write audit log:', error);
    // TODO: Send to error monitoring service (e.g., Sentry)
  }
}

/**
 * Express middleware factory for automatic PHI access logging.
 * Wraps response to log successful PHI access after the request completes.
 *
 * @param resourceType - The type of PHI resource being accessed
 * @param options - Configuration options for the middleware
 * @returns Express middleware function
 */
export function createAuditMiddleware(
  resourceType: AuditLogEntry['resourceType'],
  options: { requireAuth?: boolean } = { requireAuth: true }
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Require authentication for PHI routes by default
    if (options.requireAuth && !req.user) {
      res.status(401).json({ error: 'Authentication required for PHI access' });
      return;
    }

    const originalSend = res.send.bind(res);

    res.send = function(body: unknown): Response {
      // Only log successful responses with valid authenticated user
      if (res.statusCode >= 200 && res.statusCode < 300 && isAuthenticatedUser(req.user)) {
        // Fire async logging but don't block response
        void logPHIAccess({
          userId: req.user.id,
          action: methodToAction(req.method),
          resourceType,
          resourceId: req.params.id || 'list',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        }).catch((error) => {
          console.error('[HIPAA AUDIT ERROR] Middleware logging failed:', error);
        });
      }

      return originalSend(body);
    };

    next();
  };
}

/**
 * Maps HTTP methods to audit action types.
 *
 * @param method - The HTTP method (GET, POST, etc.)
 * @returns The corresponding audit action type
 */
function methodToAction(method: string): AuditLogEntry['action'] {
  switch (method.toUpperCase()) {
    case 'GET': return 'view';
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'view';
  }
}

/**
 * Generates an audit report for compliance review.
 *
 * @param startDate - Start of the reporting period
 * @param endDate - End of the reporting period
 * @param userId - Optional: filter by specific user
 * @returns Audit entries and summary statistics
 * @throws Error if date range is invalid or feature is not yet implemented
 */
export async function generateAuditReport(
  startDate: Date,
  endDate: Date,
  userId?: number
): Promise<{ entries: AuditLogEntry[]; summary: Record<string, number> }> {
  // Input validation
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new Error('Invalid startDate: must be a valid Date object');
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new Error('Invalid endDate: must be a valid Date object');
  }
  if (startDate > endDate) {
    throw new Error('Invalid date range: startDate must be before or equal to endDate');
  }

  // TODO: Implement database query
  // const entries = await db.select().from(auditLogs)
  //   .where(and(
  //     gte(auditLogs.timestamp, startDate),
  //     lte(auditLogs.timestamp, endDate),
  //     userId ? eq(auditLogs.userId, userId) : undefined
  //   ));

  throw new Error(
    'generateAuditReport is not yet implemented. ' +
    'Audit log database table must be created first. ' +
    `Requested range: ${startDate.toISOString()} to ${endDate.toISOString()}` +
    (userId ? ` for userId: ${userId}` : '')
  );
}
