// Jest Configuration for NiceHR
// Supports unit tests and integration tests

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/shared', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.integration.test.ts'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'server/**/*.ts',
    'shared/**/*.ts',
    '!server/**/*.test.ts',
    '!server/**/*.integration.test.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  clearMocks: true,
  verbose: true,
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.ts', '<rootDir>/shared/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: 'tsconfig.jest.json',
          isolatedModules: true,
        }],
      },
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@server/(.*)$': '<rootDir>/server/$1',
      },
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.integration.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      preset: 'ts-jest',
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: 'tsconfig.jest.json',
          isolatedModules: true,
        }],
      },
      moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@server/(.*)$': '<rootDir>/server/$1',
      },
    },
  ],
};
