/**
 * Integration Test Setup
 *
 * This file runs before integration tests.
 * Sets up the Express app and database connection for testing.
 */

import express, { Express } from 'express';
import { createServer, Server } from 'http';

// Test database URL (use a separate test database)
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

let app: Express;
let server: Server;

/**
 * Create a test Express app instance
 * This mirrors the main app setup but without starting the server
 */
export async function createTestApp(): Promise<Express> {
  const testApp = express();

  // Add JSON parsing
  testApp.use(express.json());

  // Import and register routes
  // Note: We dynamically import to avoid side effects during module load
  const { registerRoutes } = await import('../../server/routes');
  const httpServer = createServer(testApp);
  await registerRoutes(httpServer, testApp);

  return testApp;
}

/**
 * Get the test app instance
 */
export function getTestApp(): Express {
  if (!app) {
    throw new Error('Test app not initialized. Call setupTestApp() first.');
  }
  return app;
}

/**
 * Setup test app before all tests
 */
export async function setupTestApp(): Promise<Express> {
  app = await createTestApp();
  return app;
}

/**
 * Cleanup after all tests
 */
export async function teardownTestApp(): Promise<void> {
  if (server) {
    server.close();
  }
}

// Global setup for integration tests
beforeAll(async () => {
  // You can setup the app here if needed globally
  // await setupTestApp();
});

afterAll(async () => {
  await teardownTestApp();
});
