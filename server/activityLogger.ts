import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { logger, getCorrelationId, getRequestId } from "./structuredLogger";

type ActivityType =
  | "login"
  | "logout"
  | "page_view"
  | "create"
  | "update"
  | "delete"
  | "upload"
  | "download"
  | "approve"
  | "reject"
  | "assign"
  | "submit";

interface ActivityLogParams {
  activityType: ActivityType;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a user activity to both structured logs and database
 * This provides:
 * 1. Immediate structured log output with correlation IDs
 * 2. Persistent database storage for audit trails
 */
export async function logActivity(
  userId: string,
  params: ActivityLogParams,
  req?: Request
): Promise<void> {
  // Get correlation context for structured logging
  const correlationId = getCorrelationId();
  const requestId = getRequestId();

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      logger.warn(`Activity logging skipped: User not found`, {
        metadata: {
          user_id: userId,
          activity_type: params.activityType,
        },
      });
      return;
    }

    // Log to structured logger (immediate output with correlation)
    logger.activity(params.activityType, {
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      description: params.description,
      metadata: {
        ...params.metadata,
        user_id: userId,
        correlation_id: correlationId,
        request_id: requestId,
      },
    });

    // Log to database for persistent audit trail
    await storage.logUserActivity({
      userId,
      activityType: params.activityType,
      resourceType: params.resourceType || null,
      resourceId: params.resourceId || null,
      resourceName: params.resourceName || null,
      description: params.description || null,
      metadata: {
        ...params.metadata,
        correlation_id: correlationId,
        request_id: requestId,
      },
      ipAddress: req?.ip || req?.headers['x-forwarded-for']?.toString() || null,
      userAgent: req?.headers['user-agent'] || null,
    });
  } catch (error) {
    logger.error("Failed to log activity", error, {
      metadata: {
        user_id: userId,
        activity_type: params.activityType,
      },
    });
  }
}

export function activityLoggerMiddleware(
  activityType: ActivityType,
  getResourceInfo?: (req: Request, res: Response) => { 
    resourceType?: string; 
    resourceId?: string; 
    resourceName?: string;
    description?: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function (body) {
      res.send = originalSend;
      const result = res.send(body);
      
      const user = req.user as { claims?: { sub?: string } } | undefined;
      const userId = user?.claims?.sub;
      
      if (res.statusCode >= 200 && res.statusCode < 300 && userId) {
        const resourceInfo = getResourceInfo ? getResourceInfo(req, res) : {};
        
        logActivity(userId, {
          activityType,
          ...resourceInfo,
        }, req).catch((error) => {
          logger.error("Activity logging failed in middleware", error);
        });
      }
      
      return result;
    };
    
    next();
  };
}

export function createActivityLogger(activityType: ActivityType) {
  return {
    log: (
      userId: string,
      params: Omit<ActivityLogParams, 'activityType'>,
      req?: Request
    ) => logActivity(userId, { activityType, ...params }, req),
  };
}

export const activityLoggers = {
  login: createActivityLogger("login"),
  logout: createActivityLogger("logout"),
  create: createActivityLogger("create"),
  update: createActivityLogger("update"),
  delete: createActivityLogger("delete"),
  upload: createActivityLogger("upload"),
  download: createActivityLogger("download"),
  approve: createActivityLogger("approve"),
  reject: createActivityLogger("reject"),
  assign: createActivityLogger("assign"),
  submit: createActivityLogger("submit"),
};
