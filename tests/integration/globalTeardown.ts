/**
 * Jest Global Teardown for Integration Tests
 * Runs once after all test suites
 */

export default async function globalTeardown() {
  console.log('\n🧹 Cleaning up integration test environment...');
  console.log('✅ Teardown complete\n');
}
