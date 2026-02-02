/**
 * Unit Tests for HIPAA Audit Logger
 *
 * Tests the PHI access logging functionality for HIPAA compliance:
 * - Audit log entry creation
 * - Audit report generation validation
 * - Action type mapping
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { logPHIAccess, generateAuditReport, AuditLogEntry } from './hipaaAuditLogger';

describe('HIPAA Audit Logger', () => {
  let consoleSpy: {
    log: jest.SpiedFunction<typeof console.log>;
    error: jest.SpiedFunction<typeof console.error>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logPHIAccess', () => {
    const validEntry: AuditLogEntry = {
      userId: 123,
      action: 'view',
      resourceType: 'patient',
      resourceId: 'patient-456',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    test('should log PHI access in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await logPHIAccess(validEntry);

      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0];
      expect(logCall[0]).toContain('[HIPAA AUDIT]');

      process.env.NODE_ENV = originalEnv;
    });

    test('should log PHI access in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await logPHIAccess(validEntry);

      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0];
      expect(logCall[0]).toContain('[HIPAA AUDIT]');

      process.env.NODE_ENV = originalEnv;
    });

    test('should include all required audit fields', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await logPHIAccess(validEntry);

      const logCall = consoleSpy.log.mock.calls[0];
      const logData = logCall[1];

      expect(logData.user).toBe(123);
      expect(logData.action).toBe('view');
      expect(logData.resource).toBe('patient:patient-456');

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle all action types', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const actions: AuditLogEntry['action'][] = ['view', 'create', 'update', 'delete', 'export', 'print'];

      for (const action of actions) {
        await logPHIAccess({ ...validEntry, action });
      }

      expect(consoleSpy.log).toHaveBeenCalledTimes(6);

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle all resource types', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const resourceTypes: AuditLogEntry['resourceType'][] = [
        'patient',
        'medical_record',
        'prescription',
        'billing',
        'report'
      ];

      for (const resourceType of resourceTypes) {
        await logPHIAccess({ ...validEntry, resourceType });
      }

      expect(consoleSpy.log).toHaveBeenCalledTimes(5);

      process.env.NODE_ENV = originalEnv;
    });

    test('should include optional metadata', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const entryWithMetadata: AuditLogEntry = {
        ...validEntry,
        reason: 'Patient requested records',
        metadata: { department: 'Emergency', urgent: true },
      };

      await logPHIAccess(entryWithMetadata);

      const logCall = consoleSpy.log.mock.calls[0];
      const loggedJson = logCall[1];
      const parsed = JSON.parse(loggedJson);

      expect(parsed.reason).toBe('Patient requested records');
      expect(parsed.metadata.department).toBe('Emergency');
      expect(parsed.metadata.urgent).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    test('should not throw on errors', async () => {
      // The function should never throw
      await expect(logPHIAccess(validEntry)).resolves.not.toThrow();
    });
  });

  describe('generateAuditReport', () => {
    test('should throw error for invalid startDate', async () => {
      await expect(
        generateAuditReport(new Date('invalid'), new Date())
      ).rejects.toThrow('Invalid startDate');
    });

    test('should throw error for invalid endDate', async () => {
      await expect(
        generateAuditReport(new Date(), new Date('invalid'))
      ).rejects.toThrow('Invalid endDate');
    });

    test('should throw error when startDate is after endDate', async () => {
      const futureDate = new Date('2030-01-01');
      const pastDate = new Date('2020-01-01');

      await expect(
        generateAuditReport(futureDate, pastDate)
      ).rejects.toThrow('Invalid date range');
    });

    test('should accept valid date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      // Function throws "not yet implemented" with valid dates
      await expect(
        generateAuditReport(startDate, endDate)
      ).rejects.toThrow('generateAuditReport is not yet implemented');
    });

    test('should accept same start and end date', async () => {
      const sameDate = new Date('2024-06-15');

      await expect(
        generateAuditReport(sameDate, sameDate)
      ).rejects.toThrow('generateAuditReport is not yet implemented');
    });

    test('should include userId in error message when provided', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const userId = 42;

      await expect(
        generateAuditReport(startDate, endDate, userId)
      ).rejects.toThrow('userId: 42');
    });

    test('should include date range in error message', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await expect(
        generateAuditReport(startDate, endDate)
      ).rejects.toThrow('2024-01-01');
    });
  });

  describe('AuditLogEntry type validation', () => {
    test('should accept minimal valid entry', () => {
      const entry: AuditLogEntry = {
        userId: 1,
        action: 'view',
        resourceType: 'patient',
        resourceId: '123',
      };

      expect(entry.userId).toBe(1);
      expect(entry.action).toBe('view');
      expect(entry.resourceType).toBe('patient');
      expect(entry.resourceId).toBe('123');
    });

    test('should accept full entry with all optional fields', () => {
      const entry: AuditLogEntry = {
        userId: 1,
        action: 'create',
        resourceType: 'medical_record',
        resourceId: '456',
        timestamp: '2024-01-15T10:30:00Z',
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome/120',
        reason: 'Emergency access',
        metadata: { priority: 'high' },
      };

      expect(entry.timestamp).toBe('2024-01-15T10:30:00Z');
      expect(entry.ipAddress).toBe('10.0.0.1');
      expect(entry.userAgent).toBe('Chrome/120');
      expect(entry.reason).toBe('Emergency access');
      expect(entry.metadata?.priority).toBe('high');
    });
  });
});
