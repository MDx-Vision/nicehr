/**
 * Structured Logger with Correlation IDs
 *
 * Based on MDx-Vision Enterprise Issue #90 implementation.
 * Provides JSON-formatted structured logging for distributed tracing
 * and HIPAA-compliant audit trails.
 *
 * Features:
 * - JSON structured output
 * - Correlation ID propagation
 * - Context-aware logging (user, session, resource)
 * - Log level configuration via environment
 * - Duration tracking
 * - Error serialization
 */

import { AsyncLocalStorage } from 'async_hooks';

// =============================================================================
// TYPES
// =============================================================================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  correlationId: string;
  requestId: string;
  sessionId: string | null;
  userId: string | null;
  startTime: number;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  correlation_id: string;
  request_id: string;
  session_id: string | null;
  user_id: string | null;
  resource_type?: string;
  resource_id?: string;
  duration_ms?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

// =============================================================================
// ASYNC CONTEXT FOR CORRELATION ID PROPAGATION
// =============================================================================

/**
 * AsyncLocalStorage for maintaining request context across async operations.
 * This is the key to correlation ID propagation - it allows any code
 * in the request chain to access the correlation ID without passing it explicitly.
 */
export const logContext = new AsyncLocalStorage<LogContext>();

// =============================================================================
// STRUCTURED LOGGER CLASS
// =============================================================================

class StructuredLogger {
  private serviceName: string;
  private logLevel: LogLevel;
  private structuredLogging: boolean;

  private levelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor() {
    this.serviceName = process.env.SERVICE_NAME || 'nicehr-api';
    this.logLevel = (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) || 'INFO';
    this.structuredLogging = process.env.STRUCTURED_LOGGING !== 'false';
  }

  /**
   * Check if a log level should be output based on configured level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.logLevel];
  }

  /**
   * Get the current request context from AsyncLocalStorage
   */
  private getContext(): Partial<LogEntry> {
    const ctx = logContext.getStore();
    return {
      correlation_id: ctx?.correlationId || 'no-context',
      request_id: ctx?.requestId || 'no-context',
      session_id: ctx?.sessionId || null,
      user_id: ctx?.userId || null,
    };
  }

  /**
   * Calculate duration from request start time
   */
  private getDuration(): number | undefined {
    const ctx = logContext.getStore();
    if (ctx?.startTime) {
      return Date.now() - ctx.startTime;
    }
    return undefined;
  }

  /**
   * Format a log entry as JSON or plain text
   */
  private formatLog(level: LogLevel, message: string, extra?: Partial<LogEntry>): string {
    const context = this.getContext();
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      correlation_id: context.correlation_id || 'no-context',
      request_id: context.request_id || 'no-context',
      session_id: context.session_id || null,
      user_id: context.user_id || null,
      ...extra,
    };

    // Add duration if available and not already set
    if (!entry.duration_ms) {
      const duration = this.getDuration();
      if (duration !== undefined) {
        entry.duration_ms = duration;
      }
    }

    if (this.structuredLogging) {
      return JSON.stringify(entry);
    } else {
      // Plain text format for development
      const ctx = this.getContext();
      const durationStr = entry.duration_ms ? ` [${entry.duration_ms}ms]` : '';
      return `${entry.timestamp} [${level}] [${ctx.correlation_id?.slice(0, 8)}] ${message}${durationStr}`;
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, extra?: Partial<LogEntry>): void {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatLog('DEBUG', message, extra));
    }
  }

  /**
   * Log an info message
   */
  info(message: string, extra?: Partial<LogEntry>): void {
    if (this.shouldLog('INFO')) {
      console.log(this.formatLog('INFO', message, extra));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, extra?: Partial<LogEntry>): void {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatLog('WARN', message, extra));
    }
  }

  /**
   * Log an error message with optional Error object
   */
  error(message: string, error?: Error | unknown, extra?: Partial<LogEntry>): void {
    if (this.shouldLog('ERROR')) {
      let errorInfo: Partial<LogEntry> = {};

      if (error instanceof Error) {
        errorInfo = {
          error: {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
          },
        };
      } else if (error) {
        errorInfo = {
          error: {
            name: 'UnknownError',
            message: String(error),
          },
        };
      }

      console.error(this.formatLog('ERROR', message, { ...errorInfo, ...extra }));
    }
  }

  /**
   * Log a request start
   */
  requestStart(method: string, path: string, extra?: Record<string, unknown>): void {
    this.info(`→ ${method} ${path}`, {
      metadata: {
        type: 'request_start',
        method,
        path,
        ...extra,
      },
    });
  }

  /**
   * Log a request completion
   */
  requestEnd(method: string, path: string, statusCode: number, durationMs: number, extra?: Record<string, unknown>): void {
    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    const symbol = statusCode >= 400 ? '✗' : '✓';

    this[level.toLowerCase() as 'info' | 'warn' | 'error'](`← ${method} ${path} ${statusCode} ${symbol}`, {
      duration_ms: durationMs,
      metadata: {
        type: 'request_end',
        method,
        path,
        status_code: statusCode,
        ...extra,
      },
    });
  }

  /**
   * Log a business activity (replaces activityLogger for structured output)
   * HIPAA Note: Never log PHI in the description or metadata
   */
  activity(
    activityType: string,
    params: {
      resourceType?: string;
      resourceId?: string;
      resourceName?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    this.info(`Activity: ${activityType}`, {
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: {
        type: 'activity',
        activity_type: activityType,
        resource_name: params.resourceName,
        description: params.description,
        ...params.metadata,
      },
    });
  }

  /**
   * Log a database operation
   */
  db(operation: string, table: string, durationMs?: number, extra?: Record<string, unknown>): void {
    this.debug(`DB: ${operation} ${table}`, {
      duration_ms: durationMs,
      metadata: {
        type: 'database',
        operation,
        table,
        ...extra,
      },
    });
  }

  /**
   * Log an external service call
   */
  external(service: string, operation: string, durationMs?: number, extra?: Record<string, unknown>): void {
    this.info(`External: ${service} ${operation}`, {
      duration_ms: durationMs,
      metadata: {
        type: 'external_call',
        service,
        operation,
        ...extra,
      },
    });
  }

  /**
   * Log a security event (for HIPAA compliance)
   */
  security(event: string, extra?: Record<string, unknown>): void {
    this.warn(`Security: ${event}`, {
      metadata: {
        type: 'security',
        event,
        ...extra,
      },
    });
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Partial<LogEntry>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger with preset context
 */
class ChildLogger {
  constructor(
    private parent: StructuredLogger,
    private context: Partial<LogEntry>
  ) {}

  debug(message: string, extra?: Partial<LogEntry>): void {
    this.parent.debug(message, { ...this.context, ...extra });
  }

  info(message: string, extra?: Partial<LogEntry>): void {
    this.parent.info(message, { ...this.context, ...extra });
  }

  warn(message: string, extra?: Partial<LogEntry>): void {
    this.parent.warn(message, { ...this.context, ...extra });
  }

  error(message: string, error?: Error | unknown, extra?: Partial<LogEntry>): void {
    this.parent.error(message, error, { ...this.context, ...extra });
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const logger = new StructuredLogger();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the current correlation ID from context
 */
export function getCorrelationId(): string {
  return logContext.getStore()?.correlationId || 'no-context';
}

/**
 * Get the current request ID from context
 */
export function getRequestId(): string {
  return logContext.getStore()?.requestId || 'no-context';
}

/**
 * Run a function with a specific log context
 */
export function withLogContext<T>(context: LogContext, fn: () => T): T {
  return logContext.run(context, fn);
}
