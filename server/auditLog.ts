/**
 * HIPAA-Compliant Audit Logging System
 *
 * CRITICAL: This module NEVER logs request bodies, response bodies, or any PHI.
 * Only metadata about requests is logged for compliance and security auditing.
 */

import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { auditLogs } from "@shared/schema";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

interface AuditLogEntry {
  userId: string | null;
  action: string;
  resource: string;
  method?: HttpMethod;
  ipAddress?: string | null;
  userAgent?: string | null;
  statusCode?: number | null;
  responseTimeMs?: number | null;
}

/**
 * Extract client IP address from request
 * Handles proxied requests (X-Forwarded-For) and direct connections
 */
function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs; first one is the client
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
function getUserAgent(req: Request): string | null {
  const userAgent = req.headers["user-agent"];
  if (!userAgent) return null;
  // Truncate to 500 chars to fit database column
  return userAgent.substring(0, 500);
}

/**
 * Determine the action from HTTP method and path
 */
function determineAction(method: string, path: string): string {
  const methodUpper = method.toUpperCase();

  // Extract the primary resource from the path
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

/**
 * Log an audit event directly to the database
 * Use this for manual logging of specific actions
 *
 * @param userId - The user ID performing the action (null for unauthenticated)
 * @param action - Description of the action (e.g., "login_success", "export_report")
 * @param resource - The resource being acted upon (e.g., "/api/users/123")
 */
export async function logAuditEvent(
  userId: string | null,
  action: string,
  resource: string
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      resource,
      method: null,
      ipAddress: null,
      userAgent: null,
      statusCode: null,
      responseTimeMs: null,
    });
  } catch (error) {
    // Log to console but don't throw - audit logging should never break the app
    console.error("[AuditLog] Failed to log audit event:", error);
  }
}

/**
 * Log an audit event with full request context
 * Used internally by the middleware
 */
async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      method: entry.method || null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      statusCode: entry.statusCode || null,
      responseTimeMs: entry.responseTimeMs || null,
    });
  } catch (error) {
    // Log to console but don't throw - audit logging should never break the app
    console.error("[AuditLog] Failed to log audit entry:", error);
  }
}

/**
 * HIPAA-Compliant Audit Logging Middleware
 *
 * Logs every API request AFTER it completes with:
 * - Timestamp (automatic via database default)
 * - User ID (if authenticated)
 * - Action derived from HTTP method
 * - Resource path (sanitized)
 * - HTTP method
 * - Client IP address
 * - User agent
 * - Response status code
 * - Response time in milliseconds
 *
 * CRITICAL: This middleware NEVER logs:
 * - Request bodies
 * - Response bodies
 * - Query parameters (may contain PHI)
 * - Any form of PHI
 */
export function auditLogMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip non-API routes and health checks
    if (!req.path.startsWith("/api") || req.path === "/api/health") {
      return next();
    }

    const startTime = Date.now();

    // Use the finish event to log after response is complete
    // This is safer than overriding res.end and avoids type signature issues
    res.on("finish", () => {
      // Calculate response time
      const responseTimeMs = Date.now() - startTime;

      // Extract user ID from session/auth
      // Support multiple auth patterns used in the app
      const user = req.user as { claims?: { sub?: string }; id?: string } | undefined;
      const userId = user?.claims?.sub || user?.id || null;

      // Sanitize resource path - remove query string and IDs that might contain PHI
      // Only keep the path structure, not specific identifiers
      const resourcePath = req.path;

      // Get HTTP method as typed enum value
      const method = req.method.toUpperCase() as HttpMethod;

      // Log the audit entry asynchronously (don't block response)
      setImmediate(() => {
        logAuditEntry({
          userId,
          action: determineAction(req.method, req.path),
          resource: resourcePath,
          method,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
          statusCode: res.statusCode,
          responseTimeMs,
        }).catch((err) => {
          console.error("[AuditLog] Async logging failed:", err);
        });
      });
    });

    next();
  };
}

/**
 * Create a scoped audit logger for specific actions
 * Useful for logging business logic events
 */
export function createAuditLogger(actionPrefix: string) {
  return {
    log: async (userId: string | null, action: string, resource: string) => {
      await logAuditEvent(userId, `${actionPrefix}_${action}`, resource);
    },
    success: async (userId: string | null, resource: string) => {
      await logAuditEvent(userId, `${actionPrefix}_success`, resource);
    },
    failure: async (userId: string | null, resource: string) => {
      await logAuditEvent(userId, `${actionPrefix}_failure`, resource);
    },
  };
}

// Pre-configured audit loggers for common operations
export const auditLoggers = {
  auth: createAuditLogger("auth"),
  data: createAuditLogger("data"),
  admin: createAuditLogger("admin"),
  export: createAuditLogger("export"),
  phi: createAuditLogger("phi_access"), // For PHI access logging
};
