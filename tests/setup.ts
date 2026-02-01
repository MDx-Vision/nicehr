/**
 * Jest Global Setup
 *
 * This file runs before all tests.
 * Used for global configuration and mocks.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'ERROR'; // Suppress logs during tests
process.env.STRUCTURED_LOGGING = 'false'; // Human-readable for debugging

// Global test utilities
interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'consultant' | 'hospital_staff';
}

interface TestConsultant {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  status: string;
}

// Test utilities
const testUtils = {
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  mockUser: (overrides: Partial<TestUser> = {}): TestUser => ({
    id: testUtils.generateId(),
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin',
    ...overrides,
  }),

  mockConsultant: (overrides: Partial<TestConsultant> = {}): TestConsultant => ({
    id: testUtils.generateId(),
    userId: testUtils.generateId(),
    firstName: 'Test',
    lastName: 'Consultant',
    email: 'consultant@example.com',
    specialty: 'Epic',
    status: 'active',
    ...overrides,
  }),
};

(global as any).testUtils = testUtils;

export {};
