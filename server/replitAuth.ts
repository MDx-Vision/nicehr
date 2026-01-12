import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import crypto from "crypto";
import { storage } from "./storage";
import { logActivity } from "./activityLogger";

// Generate a random session secret for development if not provided
const getDevSessionSecret = (): string => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  console.warn('[SECURITY WARNING] SESSION_SECRET not set. Using randomly generated secret for development.');
  console.warn('[SECURITY WARNING] Set SESSION_SECRET environment variable for production.');
  return crypto.randomBytes(32).toString('hex');
};

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

// =============================================================================
// HIPAA-COMPLIANT SESSION CONFIGURATION
// =============================================================================
// HIPAA requires automatic logoff after period of inactivity (15 minutes recommended)
const sessionTtl = 15 * 60 * 1000; // 15 minutes - HIPAA automatic logoff requirement

const pgStore = connectPg(session);
export const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: Math.floor(sessionTtl / 1000), // connect-pg-simple expects seconds
  tableName: "sessions",
  // Prune expired sessions every 5 minutes
  pruneSessionInterval: 5 * 60,
});

export function getSession() {
  const isProduction = process.env.NODE_ENV === 'production';
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    // Rolling sessions: reset expiration on each request
    rolling: true,
    cookie: {
      httpOnly: true, // Prevent XSS access to cookies
      secure: isProduction, // Only transmit over HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: sessionTtl, // 15 minute expiration
    },
  });
}

/**
 * Middleware to touch/extend active sessions on each request
 * This resets the session expiration timer for active users
 * Combined with rolling: true, this ensures sessions stay alive during activity
 */
export function sessionTouchMiddleware() {
  return (req: any, res: any, next: any) => {
    if (req.session) {
      // Touch the session to extend its expiration
      req.session.touch();
    }
    next();
  };
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

interface InvitationCheckResult {
  allowed: boolean;
  reason?: string;
  invitationId?: string;
}

async function checkInvitationAccess(email: string, userId: string): Promise<InvitationCheckResult> {
  const existingUser = await storage.getUser(userId);
  
  if (existingUser) {
    if (existingUser.accessStatus === 'active') {
      return { allowed: true };
    }
    if (existingUser.accessStatus === 'suspended') {
      return { allowed: false, reason: 'Your account has been suspended. Please contact an administrator.' };
    }
    if (existingUser.accessStatus === 'revoked') {
      return { allowed: false, reason: 'Your access has been revoked. Please contact an administrator.' };
    }
  }
  
  // First, try to get a valid pending invitation (already checks status='pending' and expiresAt > now)
  const pendingInvitation = await storage.getPendingInvitationByEmail(email);
  
  if (pendingInvitation) {
    // Defense-in-depth: Double-check expiration before accepting to prevent race conditions
    const now = new Date();
    const expiresAt = new Date(pendingInvitation.expiresAt);
    
    if (expiresAt <= now) {
      // Invitation expired between fetch and accept - mark it as expired
      await storage.expireOldInvitations();
      return { 
        allowed: false, 
        reason: 'Your invitation has expired. Please contact your administrator for a new invitation.' 
      };
    }
    
    // Accept the valid invitation (acceptInvitation also has guard checks for defense-in-depth)
    const accepted = await storage.acceptInvitation(pendingInvitation.id, userId);
    
    if (!accepted) {
      // Invitation became invalid between checks - likely expired or status changed
      return { 
        allowed: false, 
        reason: 'Your invitation is no longer valid. Please contact your administrator for a new invitation.' 
      };
    }
    
    return { allowed: true, invitationId: pendingInvitation.id };
  }
  
  // No valid pending invitation found - check if there's any invitation to provide specific error messages
  const anyInvitation = await storage.getInvitationByEmail(email);
  
  if (anyInvitation) {
    const now = new Date();
    
    // Check if invitation is expired (either by date or already marked as expired status)
    if (anyInvitation.status === 'expired' || (anyInvitation.status === 'pending' && anyInvitation.expiresAt < now)) {
      // Clean up expired invitations
      await storage.expireOldInvitations();
      return { 
        allowed: false, 
        reason: 'Your invitation has expired. Please contact your administrator for a new invitation.' 
      };
    }
    
    // Check if invitation was revoked
    if (anyInvitation.status === 'revoked') {
      return { 
        allowed: false, 
        reason: 'Your invitation has been revoked. Please contact your administrator.' 
      };
    }
    
    // Check if invitation was already accepted
    if (anyInvitation.status === 'accepted') {
      return { 
        allowed: false, 
        reason: 'This invitation has already been used. Please contact your administrator if you need access.' 
      };
    }
  }
  
  // Check if user exists by email with active status
  const existingByEmail = await storage.getUserByEmail(email);
  if (existingByEmail && existingByEmail.accessStatus === 'active') {
    return { allowed: true };
  }
  
  // Development mode bypass: auto-provision new users for testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV MODE] Auto-provisioning access for: ${email}`);
    return { allowed: true };
  }
  
  return { 
    allowed: false, 
    reason: 'NICEHR is invitation-only. You need an invitation from an administrator to access this platform.' 
  };
}

async function upsertUser(claims: any, invitationId?: string) {
  try {
    const userId = claims["sub"];
    const email = claims["email"];
    
    const existingUser = await storage.getUser(userId);
    
    let accessStatus: "pending_invitation" | "active" | "suspended" | "revoked" = "pending_invitation";
    if (existingUser?.accessStatus === 'active') {
      accessStatus = 'active';
    } else if (invitationId) {
      accessStatus = 'active';
    } else if (process.env.NODE_ENV === 'development') {
      // Auto-activate users in development mode for testing
      accessStatus = 'active';
    }
    
    await storage.upsertUser({
      id: userId,
      email: email,
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
      accessStatus,
      invitationId: invitationId || existingUser?.invitationId || null,
    });
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  // Skip full auth setup in CI environment
  if (process.env.CI === 'true') {
    console.log('[CI MODE] Skipping Replit auth, using mock session');
    app.set("trust proxy", 1);
    app.use(session({
      secret: 'ci-test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use((req, res, next) => {
      (req as any).user = {
        claims: { sub: 'ci-test-user', email: 'test@example.com', first_name: 'Test', last_name: 'User' },
        expires_at: Math.floor(Date.now() / 1000) + 3600
      };
      req.isAuthenticated = function(this: Express.Request): this is Express.AuthenticatedRequest { return true; };
      next();
    });
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));
    return;
  }

  // Skip Replit auth in local development when REPL_ID is not available
  if (process.env.NODE_ENV === 'development' && !process.env.REPL_ID) {
    console.log('[DEV MODE] Skipping Replit auth, using mock session for local development');
    app.set("trust proxy", 1);
    app.use(session({
      secret: getDevSessionSecret(),
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, sameSite: 'lax' }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Create mock dev user
    const devUser = {
      claims: {
        sub: 'dev-user-local',
        email: 'dev@nicehr.local',
        first_name: 'Dev',
        last_name: 'User'
      },
      expires_at: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    };

    app.use((req, res, next) => {
      (req as any).user = devUser;
      req.isAuthenticated = function(this: Express.Request): this is Express.AuthenticatedRequest { return true; };
      next();
    });

    // Mock login/logout routes for dev mode
    app.get("/api/login", (req, res) => {
      res.redirect("/");
    });

    app.get("/api/logout", (req, res) => {
      res.redirect("/");
    });

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    // Ensure dev user exists in database with admin role
    try {
      await storage.upsertUser({
        id: 'dev-user-local',
        email: 'dev@nicehr.local',
        firstName: 'Dev',
        lastName: 'Admin',
        role: 'admin',
        profileImageUrl: null,
        accessStatus: 'active',
        invitationId: null,
      });
      console.log('[DEV MODE] Dev admin user created/updated in database');
    } catch (error) {
      console.warn('[DEV MODE] Could not create dev user:', error);
    }

    return;
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const claims = tokens.claims();
      if (!claims) {
        return verified(new Error('No claims found in token'), undefined);
      }
      
      const email = claims["email"] as string | undefined;
      const userId = claims["sub"] as string | undefined;
      
      if (!email || !userId) {
        return verified(new Error('Email or user ID not found in claims'), undefined);
      }
      
      const accessCheck = await checkInvitationAccess(email, userId);
      
      if (!accessCheck.allowed) {
        return verified(new Error(accessCheck.reason || 'Access denied'), undefined);
      }
      
      const user: any = {};
      updateUserSession(user, tokens);
      user.invitationId = accessCheck.invitationId;
      
      await upsertUser(claims, accessCheck.invitationId);
      verified(null, user);
    } catch (error) {
      console.error("Auth verification error:", error);
      return verified(new Error('Authentication service temporarily unavailable. Please try again.'), undefined);
    }
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    }, async (err: any, user: any) => {
      if (err) {
        const errorMessage = encodeURIComponent(err.message || 'Access denied');
        return res.redirect(`/access-denied?reason=${errorMessage}`);
      }
      if (!user) {
        return res.redirect("/api/login");
      }

      // HIPAA Security: Regenerate session ID on login to prevent session fixation attacks
      // This creates a new session ID while preserving session data
      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          console.error("Session regeneration error:", regenerateErr);
          return next(regenerateErr);
        }

        req.login(user, async (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          if (user?.claims?.sub) {
            await logActivity(user.claims.sub, {
              activityType: "login",
              description: "User logged in successfully",
            }, req);
          }
          return res.redirect("/");
        });
      });
    })(req, res, next);
  });

  app.get("/api/logout", async (req, res) => {
    const user = req.user as any;
    const userId = user?.claims?.sub;
    
    if (userId) {
      await logActivity(userId, {
        activityType: "logout",
        description: "User logged out",
      }, req);
    }
    
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const requireRole = (...roles: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    if (!user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await storage.getUser(user.claims.sub);
    if (!dbUser || !roles.includes(dbUser.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return next();
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return next();
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
  } catch (error) {
    // Ignore refresh errors for optional auth
  }
  
  return next();
};

export const requirePermission = (...permissionNames: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    if (!user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user.claims.sub;
    const projectId = req.params.projectId || req.query.projectId as string | undefined;

    try {
      // Check for legacy admin user - grant full access
      const dbUser = await storage.getUser(userId);
      if (dbUser?.role === 'admin') {
        return next();
      }

      for (const permissionName of permissionNames) {
        const hasPermission = await storage.hasPermission(userId, permissionName, projectId);
        if (!hasPermission) {
          return res.status(403).json({ 
            message: "Forbidden: Insufficient permissions",
            required: permissionName
          });
        }
      }
      next();
    } catch (error) {
      console.error("Error checking permission:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

export const requireAnyPermission = (...permissionNames: string[]): RequestHandler => {
  return async (req, res, next) => {
    const user = req.user as any;
    if (!user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = user.claims.sub;
    const projectId = req.params.projectId || req.query.projectId as string | undefined;

    try {
      // Check for legacy admin user - grant full access
      const dbUser = await storage.getUser(userId);
      if (dbUser?.role === 'admin') {
        return next();
      }

      for (const permissionName of permissionNames) {
        const hasPermission = await storage.hasPermission(userId, permissionName, projectId);
        if (hasPermission) {
          return next();
        }
      }
      return res.status(403).json({ 
        message: "Forbidden: Insufficient permissions",
        required: permissionNames
      });
    } catch (error) {
      console.error("Error checking permission:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};
