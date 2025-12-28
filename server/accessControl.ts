import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { logAuditEvent } from "./auditLog";

// =============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) TYPES
// =============================================================================

/**
 * User roles ordered by permission level (highest to lowest)
 * - admin: Full system access
 * - manager: Department/project management
 * - hospital_staff: Legacy role, equivalent to manager (kept for backwards compatibility)
 * - consultant: Standard user access
 * - viewer: Read-only access
 */
export type UserRole = "admin" | "manager" | "hospital_staff" | "consultant" | "viewer";

/**
 * Permission actions that can be performed on resources
 */
export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "view"
  | "export"
  | "approve"
  | "assign";

/**
 * Resources that can be protected by RBAC
 */
export type ProtectedResource =
  | "users"
  | "consultants"
  | "projects"
  | "hospitals"
  | "schedules"
  | "timesheets"
  | "documents"
  | "reports"
  | "settings"
  | "audit_logs";

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  manager: 75,
  hospital_staff: 75, // Same level as manager for backwards compatibility
  consultant: 50,
  viewer: 25,
};

/**
 * Permission matrix defining which roles can perform which actions on resources
 * Format: resource -> action -> minimum role level required
 */
const PERMISSION_MATRIX: Record<string, Record<string, number>> = {
  users: {
    create: ROLE_HIERARCHY.admin,
    read: ROLE_HIERARCHY.viewer,
    update: ROLE_HIERARCHY.manager,
    delete: ROLE_HIERARCHY.admin,
    manage: ROLE_HIERARCHY.admin,
  },
  consultants: {
    create: ROLE_HIERARCHY.manager,
    read: ROLE_HIERARCHY.viewer,
    update: ROLE_HIERARCHY.consultant, // Consultants can update their own profile
    delete: ROLE_HIERARCHY.admin,
    manage: ROLE_HIERARCHY.manager,
    assign: ROLE_HIERARCHY.manager,
  },
  projects: {
    create: ROLE_HIERARCHY.manager,
    read: ROLE_HIERARCHY.viewer,
    update: ROLE_HIERARCHY.manager,
    delete: ROLE_HIERARCHY.admin,
    manage: ROLE_HIERARCHY.manager,
  },
  hospitals: {
    create: ROLE_HIERARCHY.admin,
    read: ROLE_HIERARCHY.viewer,
    update: ROLE_HIERARCHY.admin,
    delete: ROLE_HIERARCHY.admin,
    manage: ROLE_HIERARCHY.admin,
  },
  schedules: {
    create: ROLE_HIERARCHY.manager,
    read: ROLE_HIERARCHY.consultant,
    update: ROLE_HIERARCHY.manager,
    delete: ROLE_HIERARCHY.manager,
    approve: ROLE_HIERARCHY.manager,
  },
  timesheets: {
    create: ROLE_HIERARCHY.consultant,
    read: ROLE_HIERARCHY.consultant,
    update: ROLE_HIERARCHY.consultant,
    delete: ROLE_HIERARCHY.manager,
    approve: ROLE_HIERARCHY.manager,
  },
  documents: {
    create: ROLE_HIERARCHY.consultant,
    read: ROLE_HIERARCHY.viewer,
    update: ROLE_HIERARCHY.consultant,
    delete: ROLE_HIERARCHY.manager,
    approve: ROLE_HIERARCHY.manager,
  },
  reports: {
    create: ROLE_HIERARCHY.manager,
    read: ROLE_HIERARCHY.viewer,
    export: ROLE_HIERARCHY.manager,
  },
  settings: {
    read: ROLE_HIERARCHY.manager,
    update: ROLE_HIERARCHY.admin,
    manage: ROLE_HIERARCHY.admin,
  },
  audit_logs: {
    read: ROLE_HIERARCHY.admin,
    export: ROLE_HIERARCHY.admin,
  },
};

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  rule?: {
    id: string;
    name: string;
    restrictionMessage: string | null;
  };
}

export async function checkAccess(
  resourceType: "page" | "api" | "feature",
  resourceKey: string,
  userRole: string | null
): Promise<AccessCheckResult> {
  const rule = await storage.getAccessRuleByResource(resourceType, resourceKey);
  
  if (!rule) {
    return { allowed: true };
  }

  const allowedRoles = rule.allowedRoles as string[];
  const deniedRoles = rule.deniedRoles as string[];

  if (!userRole) {
    if (allowedRoles.length > 0 && !allowedRoles.includes('guest')) {
      return {
        allowed: false,
        reason: 'authentication_required',
        rule: {
          id: rule.id,
          name: rule.name,
          restrictionMessage: rule.restrictionMessage,
        },
      };
    }
  }

  if (userRole && deniedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: 'role_denied',
      rule: {
        id: rule.id,
        name: rule.name,
        restrictionMessage: rule.restrictionMessage,
      },
    };
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: 'role_not_allowed',
      rule: {
        id: rule.id,
        name: rule.name,
        restrictionMessage: rule.restrictionMessage,
      },
    };
  }

  return { allowed: true };
}

export function enforceAccess(resourceType: "page" | "api" | "feature", resourceKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Bypass access control in test/development environments
    // This allows E2E tests to run without database-based access restrictions
    if (process.env.DISABLE_ACCESS_CONTROL === 'true' ||
        process.env.CYPRESS_TEST === 'true' ||
        process.env.NODE_ENV === 'test') {
      return next();
    }

    const user = req.user as { id: string; role: string } | undefined;
    const userRole = user?.role || null;
    const userId = user?.id || null;

    const result = await checkAccess(resourceType, resourceKey, userRole);

    if (!result.allowed) {
      await storage.logAccessAttempt({
        ruleId: result.rule?.id || null,
        userId,
        userRole,
        resourceType,
        resourceKey,
        allowed: false,
        action: result.reason || 'access_denied',
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.get('user-agent') || null,
      });

      return res.status(403).json({
        error: 'Access denied',
        reason: result.reason,
        message: result.rule?.restrictionMessage || 'You do not have permission to access this resource.',
      });
    }

    next();
  };
}

// =============================================================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE & HELPERS
// =============================================================================

/**
 * Get the permission level for a user role
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role as UserRole] || 0;
}

/**
 * Check if a user has permission to perform an action on a resource
 * Uses the permission matrix and role hierarchy for fine-grained access control
 *
 * @param user - User object with id and role
 * @param action - The action being attempted (create, read, update, delete, etc.)
 * @param resource - The resource being accessed (users, projects, etc.)
 * @returns boolean indicating if the user has permission
 */
export function hasPermission(
  user: { id?: string; role?: string } | null | undefined,
  action: string,
  resource: string
): boolean {
  // No user = no permission
  if (!user || !user.role) {
    return false;
  }

  const userLevel = getRoleLevel(user.role);

  // Admin has full access to everything
  if (userLevel >= ROLE_HIERARCHY.admin) {
    return true;
  }

  // Check permission matrix
  const resourcePermissions = PERMISSION_MATRIX[resource];
  if (!resourcePermissions) {
    // Resource not in matrix - deny by default for security
    return false;
  }

  const requiredLevel = resourcePermissions[action];
  if (requiredLevel === undefined) {
    // Action not defined for resource - deny by default
    return false;
  }

  return userLevel >= requiredLevel;
}

/**
 * Async version of hasPermission that can perform database lookups
 * for more complex permission checks (e.g., resource ownership)
 */
export async function hasPermissionAsync(
  user: { id?: string; role?: string } | null | undefined,
  action: string,
  resource: string,
  resourceId?: string
): Promise<boolean> {
  // Basic role check first
  if (!hasPermission(user, action, resource)) {
    return false;
  }

  // If no specific resource ID, basic permission is sufficient
  if (!resourceId || !user?.id) {
    return true;
  }

  // Additional ownership checks can be added here
  // For example: consultants can only update their own profile
  if (resource === "consultants" && action === "update") {
    const consultant = await storage.getConsultantByUserId(user.id);
    if (consultant && consultant.id === resourceId) {
      return true;
    }
    // If not their own profile, need manager level
    return getRoleLevel(user.role!) >= ROLE_HIERARCHY.manager;
  }

  return true;
}

/**
 * Middleware to require specific roles for route access
 * Logs access denied events to the audit log for HIPAA compliance
 *
 * @param roles - One or more roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * // Single role
 * router.get('/admin-only', requireRole('admin'), handler);
 *
 * // Multiple roles
 * router.get('/managers', requireRole('admin', 'manager'), handler);
 */
export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { id?: string; claims?: { sub?: string }; role?: string } | undefined;
    const userId = user?.id || user?.claims?.sub || null;

    // Check authentication
    if (!user) {
      // Log unauthenticated access attempt
      await logAuditEvent(null, "access_denied", `${req.method} ${req.path} - authentication required`);

      return res.status(401).json({
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      });
    }

    // Get user role from database for most up-to-date role
    let userRole = user.role;
    if (userId && !userRole) {
      const dbUser = await storage.getUser(userId);
      userRole = dbUser?.role;
    }

    if (!userRole) {
      await logAuditEvent(userId, "access_denied", `${req.method} ${req.path} - no role assigned`);

      return res.status(403).json({
        error: "Access denied",
        message: "Your account does not have a role assigned",
      });
    }

    // Check if user's role is in the allowed roles list
    // Also check role hierarchy - higher roles inherit access
    const userLevel = getRoleLevel(userRole);
    const hasAccess = roles.some((role) => {
      // Direct role match
      if (role === userRole) return true;
      // Or user has higher role level
      return userLevel >= getRoleLevel(role);
    });

    if (!hasAccess) {
      // Log access denied for HIPAA audit trail
      await logAuditEvent(
        userId,
        "access_denied",
        `${req.method} ${req.path} - required roles: ${roles.join(", ")}, user role: ${userRole}`
      );

      return res.status(403).json({
        error: "Access denied",
        message: `This action requires one of the following roles: ${roles.join(", ")}`,
        requiredRoles: roles,
        userRole: userRole,
      });
    }

    next();
  };
}

/**
 * Middleware to require specific permission on a resource
 * More granular than requireRole - checks action + resource combination
 *
 * @param action - The action being performed
 * @param resource - The resource being accessed
 *
 * @example
 * router.delete('/users/:id', requirePermissionFor('delete', 'users'), handler);
 */
export function requirePermissionFor(action: PermissionAction, resource: ProtectedResource) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { id?: string; claims?: { sub?: string }; role?: string } | undefined;
    const userId = user?.id || user?.claims?.sub || null;

    if (!user) {
      await logAuditEvent(null, "access_denied", `${req.method} ${req.path} - authentication required`);
      return res.status(401).json({
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      });
    }

    // Get fresh role from database
    let userRole = user.role;
    if (userId && !userRole) {
      const dbUser = await storage.getUser(userId);
      userRole = dbUser?.role;
    }

    const userWithRole = { id: userId || undefined, role: userRole };

    if (!hasPermission(userWithRole, action, resource)) {
      await logAuditEvent(
        userId,
        "access_denied",
        `${req.method} ${req.path} - required: ${action} on ${resource}, user role: ${userRole}`
      );

      return res.status(403).json({
        error: "Access denied",
        message: `You do not have permission to ${action} ${resource}`,
        requiredPermission: `${resource}:${action}`,
      });
    }

    next();
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export async function getAccessiblePages(userRole: string | null): Promise<string[]> {
  const allRules = await storage.getAllAccessRules();
  const pageRules = allRules.filter(r => r.resourceType === 'page' && r.isActive);
  
  const restrictedPages: string[] = [];
  
  for (const rule of pageRules) {
    const allowedRoles = rule.allowedRoles as string[];
    const deniedRoles = rule.deniedRoles as string[];

    if (!userRole) {
      if (allowedRoles.length > 0 && !allowedRoles.includes('guest')) {
        restrictedPages.push(rule.resourceKey);
      }
    } else {
      if (deniedRoles.includes(userRole)) {
        restrictedPages.push(rule.resourceKey);
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        restrictedPages.push(rule.resourceKey);
      }
    }
  }

  return restrictedPages;
}

export async function getAccessibleFeatures(userRole: string | null): Promise<string[]> {
  const allRules = await storage.getAllAccessRules();
  const featureRules = allRules.filter(r => r.resourceType === 'feature' && r.isActive);
  
  const accessibleFeatures: string[] = [];
  
  for (const rule of featureRules) {
    const allowedRoles = rule.allowedRoles as string[];
    const deniedRoles = rule.deniedRoles as string[];

    let hasAccess = true;

    if (!userRole) {
      if (allowedRoles.length > 0 && !allowedRoles.includes('guest')) {
        hasAccess = false;
      }
    } else {
      if (deniedRoles.includes(userRole)) {
        hasAccess = false;
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        hasAccess = false;
      }
    }

    if (hasAccess) {
      accessibleFeatures.push(rule.resourceKey);
    }
  }

  return accessibleFeatures;
}
