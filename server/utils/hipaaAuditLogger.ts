/**
 * HIPAA Audit Logger
 *
 * Logs access to Protected Health Information (PHI) for HIPAA compliance.
 * All PHI access must be logged with who, what, when, and why.
 */

import { db } from '../db';

export interface AuditLogEntry {
  userId: number;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'print';
  resourceType: 'patient' | 'medical_record' | 'prescription' | 'billing' | 'report';
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export async function logPHIAccess(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[HIPAA AUDIT] ${timestamp}`, {
      user: entry.userId,
      action: entry.action,
      resource: `${entry.resourceType}:${entry.resourceId}`,
    });
  }

  // In production, this would write to a secure audit log database
  // that is append-only and tamper-evident
  try {
    // TODO: Implement database storage
    // await db.insert(auditLogs).values({
    //   ...entry,
    //   timestamp,
    // });
  } catch (error) {
    // Audit logging failures should never crash the app
    // but should be reported to monitoring
    console.error('[HIPAA AUDIT ERROR]', error);
  }
}

/**
 * Middleware to automatically log PHI access for routes
 */
export function createAuditMiddleware(resourceType: AuditLogEntry['resourceType']) {
  return (req: any, res: any, next: any) => {
    const originalSend = res.send;

    res.send = function(body: any) {
      // Only log successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action = methodToAction(req.method);

        logPHIAccess({
          userId: req.user?.id || 0,
          action,
          resourceType,
          resourceId: req.params.id || 'list',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

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
 * Generate audit report for compliance review
 */
export async function generateAuditReport(
  startDate: Date,
  endDate: Date,
  userId?: number
): Promise<{ entries: AuditLogEntry[]; summary: Record<string, number> }> {
  // TODO: Implement database query
  // const entries = await db.select().from(auditLogs)
  //   .where(and(
  //     gte(auditLogs.timestamp, startDate),
  //     lte(auditLogs.timestamp, endDate),
  //     userId ? eq(auditLogs.userId, userId) : undefined
  //   ));

  return {
    entries: [],
    summary: {
      totalAccess: 0,
      views: 0,
      modifications: 0,
      exports: 0,
    },
  };
}
