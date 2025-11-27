import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

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

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role: string } | undefined;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of the following roles: ${roles.join(', ')}`
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
