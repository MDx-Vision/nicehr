/**
 * Jest Global Setup for Integration Tests
 * Runs once before all test suites
 */

import { execSync } from 'child_process';

export default async function globalSetup() {
  console.log('\n🔧 Setting up integration test environment...\n');

  // Check if test database is running
  const testDbUrl = process.env.TEST_DATABASE_URL ||
    'postgresql://testuser:testpass@localhost:5433/nicehr_test';

  process.env.DATABASE_URL = testDbUrl;

  try {
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
