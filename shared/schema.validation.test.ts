/**
 * Validation Schema Tests
 *
 * Tests for Zod validation schemas used in API input validation:
 * - Support ticket validation
 * - Hospital validation
 * - Consultant validation
 * - Project validation
 */

import { describe, test, expect } from '@jest/globals';
import {
  insertSupportTicketSchema,
  insertHospitalSchema,
  insertConsultantSchema,
  insertProjectSchema,
  insertInvoiceSchema,
  insertContractSchema,
} from './schema';

describe('Validation Schemas', () => {

  describe('Support Ticket Schema', () => {
    test('should accept valid support ticket', () => {
      const validTicket = {
        title: 'Login Issue',
        description: 'Cannot login to the system',
        projectId: 'project-123', // Required field
        priority: 'high',
        status: 'open',
        category: 'technical',
      };

      const result = insertSupportTicketSchema.safeParse(validTicket);
      expect(result.success).toBe(true);
    });

    test('should reject ticket without title', () => {
      const invalidTicket = {
        description: 'Missing title',
        projectId: 'project-123',
        priority: 'high',
        status: 'open',
      };

      const result = insertSupportTicketSchema.safeParse(invalidTicket);
      expect(result.success).toBe(false);
    });

    test('should reject ticket without projectId', () => {
      const invalidTicket = {
        title: 'Test Ticket',
        description: 'Missing projectId',
        priority: 'high',
        status: 'open',
      };

      const result = insertSupportTicketSchema.safeParse(invalidTicket);
      expect(result.success).toBe(false);
    });

    test('should accept ticket with optional fields', () => {
      const ticketWithOptionals = {
        title: 'Test Ticket',
        description: 'Test description',
        projectId: 'project-789',
        priority: 'medium',
        status: 'open',
        assignedToId: 'user-123',
      };

      const result = insertSupportTicketSchema.safeParse(ticketWithOptionals);
      expect(result.success).toBe(true);
    });

    test('should handle null optional fields', () => {
      const ticketWithNulls = {
        title: 'Test Ticket',
        projectId: 'project-123',
        description: null,
        priority: 'low',
        status: 'open',
        assignedToId: null,
      };

      const result = insertSupportTicketSchema.safeParse(ticketWithNulls);
      expect(result.success).toBe(true);
    });
  });

  describe('Hospital Schema', () => {
    test('should accept valid hospital', () => {
      const validHospital = {
        name: 'Test Hospital',
        address: '123 Medical Drive',
        city: 'Healthcare City',
        state: 'CA',
        zipCode: '90210',
      };

      const result = insertHospitalSchema.safeParse(validHospital);
      expect(result.success).toBe(true);
    });

    test('should reject hospital without name', () => {
      const invalidHospital = {
        address: '123 Medical Drive',
        city: 'Healthcare City',
        state: 'CA',
      };

      const result = insertHospitalSchema.safeParse(invalidHospital);
      expect(result.success).toBe(false);
    });

    test('should accept hospital with EHR fields', () => {
      const hospitalWithEhr = {
        name: 'Tech Hospital',
        ehrSystem: 'Epic',
        ehrVersion: '2023.1',
        bedCount: 500,
        facilityType: 'acute_care',
      };

      const result = insertHospitalSchema.safeParse(hospitalWithEhr);
      expect(result.success).toBe(true);
    });
  });

  describe('Consultant Schema', () => {
    test('should accept valid consultant', () => {
      const validConsultant = {
        userId: 'user-123', // Required field
      };

      const result = insertConsultantSchema.safeParse(validConsultant);
      expect(result.success).toBe(true);
    });

    test('should reject consultant without userId', () => {
      const invalidConsultant = {
        phone: '555-1234',
      };

      const result = insertConsultantSchema.safeParse(invalidConsultant);
      expect(result.success).toBe(false);
    });

    test('should accept consultant with optional fields', () => {
      const consultantWithOptionals = {
        userId: 'user-123',
        phone: '555-1234',
        city: 'San Francisco',
        state: 'CA',
      };

      const result = insertConsultantSchema.safeParse(consultantWithOptionals);
      expect(result.success).toBe(true);
    });

    test('should accept consultant with all fields', () => {
      const fullConsultant = {
        userId: 'user-456',
        phone: '555-1234',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        yearsExperience: 10,
        emrSystems: ['Epic', 'Cerner'],
        modules: ['Orders', 'Clinical Documentation'],
        units: ['ICU', 'Emergency'],
        shiftPreference: 'day',
        bio: 'Experienced healthcare IT consultant',
      };

      const result = insertConsultantSchema.safeParse(fullConsultant);
      expect(result.success).toBe(true);
    });
  });

  describe('Project Schema', () => {
    test('should accept valid project', () => {
      const validProject = {
        name: 'Epic Implementation',
        hospitalId: 'hospital-123',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
      };

      const result = insertProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    test('should reject project without name', () => {
      const invalidProject = {
        hospitalId: 'hospital-123',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
      };

      const result = insertProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    test('should reject project without hospitalId', () => {
      const invalidProject = {
        name: 'Test Project',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
      };

      const result = insertProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    test('should reject project without dates', () => {
      const invalidProject = {
        name: 'Test Project',
        hospitalId: 'hospital-123',
      };

      const result = insertProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    test('should accept project with all required and optional fields', () => {
      const fullProject = {
        name: 'Go-Live Project',
        hospitalId: 'hospital-123',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        status: 'draft', // Valid statuses: draft, active, completed, cancelled
        description: 'Full EHR implementation project',
        estimatedConsultants: 5,
        contractType: 'Fixed Price',
        contractValue: '500000',
      };

      const result = insertProjectSchema.safeParse(fullProject);
      expect(result.success).toBe(true);
    });
  });

  describe('Invoice Schema', () => {
    test('should accept valid invoice', () => {
      const validInvoice = {
        invoiceNumber: 'INV-2024-001',
        projectId: 'project-123',
        hospitalId: 'hospital-456',
        amount: 5000,
        status: 'draft',
      };

      const result = insertInvoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    test('should accept invoice without invoiceNumber (optional field)', () => {
      // invoiceNumber is optional in the schema (no notNull constraint)
      const invoiceWithoutNumber = {
        projectId: 'project-123',
        status: 'draft',
      };

      const result = insertInvoiceSchema.safeParse(invoiceWithoutNumber);
      expect(result.success).toBe(true);
    });

    test('should accept invoice with all fields', () => {
      const fullInvoice = {
        invoiceNumber: 'INV-2024-002',
        projectId: 'project-123',
        hospitalId: 'hospital-456',
        amount: 10000,
        status: 'sent',
        dueDate: '2024-02-15',
        paidDate: null,
        notes: 'Monthly consulting services',
        terms: 'Net 30',
      };

      const result = insertInvoiceSchema.safeParse(fullInvoice);
      expect(result.success).toBe(true);
    });
  });

  describe('Contract Schema', () => {
    test('should accept valid contract', () => {
      const validContract = {
        title: 'Consulting Agreement',
        content: 'This consulting agreement is between...', // content is required
        projectId: 'project-123',
        status: 'draft',
      };

      const result = insertContractSchema.safeParse(validContract);
      expect(result.success).toBe(true);
    });

    test('should reject contract without title', () => {
      const invalidContract = {
        content: 'Some contract content...',
        projectId: 'project-123',
        status: 'draft',
      };

      const result = insertContractSchema.safeParse(invalidContract);
      expect(result.success).toBe(false);
    });

    test('should reject contract without content', () => {
      const invalidContract = {
        title: 'Missing Content Contract',
        projectId: 'project-123',
        status: 'draft',
      };

      const result = insertContractSchema.safeParse(invalidContract);
      expect(result.success).toBe(false);
    });

    test('should accept contract with signature fields', () => {
      const contractWithSignatures = {
        title: 'Master Service Agreement',
        projectId: 'project-123',
        status: 'pending_signature',
        content: 'Contract content here...',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
      };

      const result = insertContractSchema.safeParse(contractWithSignatures);
      expect(result.success).toBe(true);
    });
  });
});
