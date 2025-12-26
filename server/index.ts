import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { auditLogMiddleware } from "./auditLog";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// =============================================================================
// SECURITY MIDDLEWARE - HIPAA Compliance
// =============================================================================

// Helmet.js with HIPAA-appropriate security headers
app.use(
  helmet({
    // Strict Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Required for inline styles from UI libraries
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        childSrc: ["'none'"],
        connectSrc: ["'self'", "wss:", "ws:"], // WebSocket support
        workerSrc: ["'self'", "blob:"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // Prevent clickjacking
        baseUri: ["'self'"],
        upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS
      },
    },
    // HTTP Strict Transport Security - enforce HTTPS
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    // Prevent MIME type sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: "deny" },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Strict referrer policy - don't leak URLs
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Cross-Origin policies for additional isolation
    crossOriginEmbedderPolicy: false, // May need adjustment based on third-party resources
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    // Prevent DNS prefetching to protect privacy
    dnsPrefetchControl: { allow: false },
    // XSS protection (legacy browsers)
    xssFilter: true,
  })
);

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        callback(null, true);
        return;
      }
      // In development, allow localhost origins
      if (process.env.NODE_ENV !== "production") {
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
          callback(null, true);
          return;
        }
      }
      // Check against allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
        // In development with no configured origins, allow all
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies for session management
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    maxAge: 600, // Cache preflight requests for 10 minutes
  })
);

// Rate Limiting - General API protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs per IP
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: { message: "Too many requests, please try again later." },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per windowMs per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
  skipSuccessfulRequests: false,
});

// Apply general rate limiting to all API routes
app.use("/api", generalLimiter);

// Apply stricter rate limiting to auth endpoints
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/forgot-password", authLimiter);
app.use("/api/reset-password", authLimiter);

// =============================================================================
// HIPAA AUDIT LOGGING MIDDLEWARE
// =============================================================================
// Logs all API requests AFTER they complete
// CRITICAL: Never logs request/response bodies or any PHI
app.use(auditLogMiddleware());

// =============================================================================
// BODY PARSING MIDDLEWARE
// =============================================================================

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
