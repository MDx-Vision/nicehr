/**
 * Unit Tests for Structured Logger
 *
 * Tests the core logging functionality including:
 * - JSON output format
 * - Log levels
 * - Correlation ID context
 * - Error serialization
 */

import { describe, test, expect, jest, beforeEach, afterEach, beforeAll } from '@jest/globals';

// We need to set LOG_LEVEL before importing the logger, and reset module cache
// to ensure the logger is created with the DEBUG level
beforeAll(() => {
  process.env.LOG_LEVEL = 'DEBUG';
  process.env.STRUCTURED_LOGGING = 'true';
});

// Dynamic imports to get fresh module after env is set
let logger: typeof import('./structuredLogger').logger;
let logContext: typeof import('./structuredLogger').logContext;
let withLogContext: typeof import('./structuredLogger').withLogContext;
let getCorrelationId: typeof import('./structuredLogger').getCorrelationId;
let getRequestId: typeof import('./structuredLogger').getRequestId;
type LogContext = import('./structuredLogger').LogContext;

describe('StructuredLogger', () => {
  let consoleSpy: {
    log: jest.SpiedFunction<typeof console.log>;
    warn: jest.SpiedFunction<typeof console.warn>;
    error: jest.SpiedFunction<typeof console.error>;
  };

  beforeAll(async () => {
    // Reset module cache and import fresh
    jest.resetModules();
    process.env.LOG_LEVEL = 'DEBUG';
    process.env.STRUCTURED_LOGGING = 'true';
    const mod = await import('./structuredLogger');
    logger = mod.logger;
    logContext = mod.logContext;
    withLogContext = mod.withLogContext;
    getCorrelationId = mod.getCorrelationId;
    getRequestId = mod.getRequestId;
  });

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Logging', () => {
    test('should log info messages', () => {
      logger.info('Test message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.service).toBe('nicehr-api');
    });

    test('should log warn messages', () => {
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.warn.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('WARN');
      expect(parsed.message).toBe('Warning message');
    });

    test('should log error messages', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.error.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('Error message');
    });

    test('should log error with Error object', () => {
      const testError = new Error('Test error');
      logger.error('Error occurred', testError);

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.error.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.error).toBeDefined();
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Test error');
    });
  });

  describe('Correlation ID Context', () => {
    test('should include correlation_id from context', () => {
      const context: LogContext = {
        correlationId: 'test-correlation-123',
        requestId: 'test-request-456',
        sessionId: 'test-session-789',
        userId: 'test-user-abc',
        startTime: Date.now(),
      };

      withLogContext(context, () => {
        logger.info('Message with context');
      });

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.correlation_id).toBe('test-correlation-123');
      expect(parsed.request_id).toBe('test-request-456');
      expect(parsed.session_id).toBe('test-session-789');
      expect(parsed.user_id).toBe('test-user-abc');
    });

    test('should use no-context when outside of context', () => {
      logger.info('Message without context');

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.correlation_id).toBe('no-context');
      expect(parsed.request_id).toBe('no-context');
    });

    test('getCorrelationId should return correlation ID from context', () => {
      const context: LogContext = {
        correlationId: 'get-test-123',
        requestId: 'get-request-456',
        sessionId: null,
        userId: null,
        startTime: Date.now(),
      };

      withLogContext(context, () => {
        expect(getCorrelationId()).toBe('get-test-123');
        expect(getRequestId()).toBe('get-request-456');
      });
    });

    test('getCorrelationId should return no-context outside of context', () => {
      expect(getCorrelationId()).toBe('no-context');
      expect(getRequestId()).toBe('no-context');
    });
  });

  describe('Metadata and Extra Fields', () => {
    test('should include metadata in log output', () => {
      logger.info('Message with metadata', {
        metadata: {
          action: 'test_action',
          resource: 'test_resource',
        },
      });

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.action).toBe('test_action');
      expect(parsed.metadata.resource).toBe('test_resource');
    });

    test('should include duration_ms in log output', () => {
      logger.info('Message with duration', {
        duration_ms: 150,
      });

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.duration_ms).toBe(150);
    });

    test('should include resource_type and resource_id', () => {
      logger.info('Message with resource', {
        resource_type: 'support_ticket',
        resource_id: 'ticket-123',
      });

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.resource_type).toBe('support_ticket');
      expect(parsed.resource_id).toBe('ticket-123');
    });
  });

  describe('Activity Logging', () => {
    test('should log activity with correct format', () => {
      logger.activity('create', {
        resourceType: 'support_ticket',
        resourceId: 'ticket-123',
        resourceName: 'Login Issue',
        description: 'Created new support ticket',
      });

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.message).toBe('Activity: create');
      expect(parsed.resource_type).toBe('support_ticket');
      expect(parsed.resource_id).toBe('ticket-123');
      expect(parsed.metadata.activity_type).toBe('create');
      expect(parsed.metadata.resource_name).toBe('Login Issue');
    });
  });

  describe('Request Logging', () => {
    test('should log request start', () => {
      logger.requestStart('GET', '/api/dashboard/stats');

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.message).toContain('GET /api/dashboard/stats');
      expect(parsed.metadata.type).toBe('request_start');
      expect(parsed.metadata.method).toBe('GET');
      expect(parsed.metadata.path).toBe('/api/dashboard/stats');
    });

    test('should log request end with status', () => {
      logger.requestEnd('GET', '/api/dashboard/stats', 200, 150);

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.message).toContain('200');
      expect(parsed.duration_ms).toBe(150);
      expect(parsed.metadata.status_code).toBe(200);
    });
  });

  describe('Child Logger', () => {
    test('should create child logger with preset context', () => {
      const childLogger = logger.child({
        resource_type: 'consultant',
        resource_id: 'consultant-123',
      });

      childLogger.info('Child message');

      const logOutput = consoleSpy.log.mock.calls[0][0] as string;
      const parsed = JSON.parse(logOutput);

      expect(parsed.resource_type).toBe('consultant');
      expect(parsed.resource_id).toBe('consultant-123');
    });
  });
});
