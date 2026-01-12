/**
 * Jest Global Teardown for Integration Tests
 * Runs once after all test suites
 */

import { Pool } from 'pg';

export default async function globalTeardown() {
  console.log('\n🧹 Cleaning up integration test environment...');

  const testDbUrl = process.env.TEST_DATABASE_URL ||
    'postgresql://testuser:testpass@localhost:5433/nicehr_test';

  try {
    // Clean up test database
    const pool = new Pool({ connectionString: testDbUrl });

    // Truncate all tables to leave DB in clean state
    await pool.query(`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    await pool.end();
    console.log('✅ Database cleaned');
  } catch (error) {
    console.warn('⚠️ Could not clean database (may already be stopped):', (error as Error).message);
  }

  console.log('✅ Teardown complete\n');
}
