/**
 * Jest Global Setup for Integration Tests
 * Runs once before all test suites
 */

import { execSync } from 'child_process';
import { Pool } from 'pg';

/**
 * Wait for database to be ready with retry logic
 */
async function waitForDatabase(connectionString: string, maxRetries = 10, delayMs = 1000): Promise<void> {
  const pool = new Pool({ connectionString });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pool.query('SELECT 1');
      await pool.end();
      console.log('✅ Database connection established');
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        await pool.end();
        throw new Error(`Database not ready after ${maxRetries} attempts: ${(error as Error).message}`);
      }
      console.log(`⏳ Waiting for database... (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  // Check if test database is running
  const testDbUrl = process.env.TEST_DATABASE_URL ||
    'postgresql://testuser:testpass@localhost:5433/nicehr_test';

  process.env.DATABASE_URL = testDbUrl;

  try {
    // Wait for database to be ready before pushing schema
    console.log('🔌 Checking database connectivity...');
    await waitForDatabase(testDbUrl);

    // Push schema to test database
    console.log('📦 Pushing database schema...');
    execSync('npm run db:push', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'inherit',
    });
    console.log('✅ Database schema ready\n');
  } catch (error) {
    console.error('❌ Failed to setup database. Make sure test DB is running:');
    console.error('   docker-compose -f docker-compose.test.yml up -d\n');
    throw error;
  }
}
