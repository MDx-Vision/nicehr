/**
 * Integration Test Setup
 * Provides database connection and utilities for each test
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as schema from '../../shared/schema';

// Test database connection
const testDbUrl = process.env.TEST_DATABASE_URL ||
  'postgresql://testuser:testpass@localhost:5433/nicehr_test';

let pool: Pool;
let db: ReturnType<typeof drizzle>;

/**
 * Get database connection for tests
 */
export function getDb() {
  if (!db) {
    pool = new Pool({ connectionString: testDbUrl });
    db = drizzle(pool, { schema });
  }
  return db;
}

/**
 * Clean all tables before/after tests
 */
export async function cleanDatabase() {
  const database = getDb();

  // Disable foreign key checks temporarily
  await database.execute(sql`SET session_replication_role = 'replica'`);

  // Truncate all tables in reverse dependency order
  const tables = [
    'eod_reports',
    'timesheets',
    'project_tasks',
    'project_schedules',
    'support_tickets',
    'invoices',
    'contracts',
    'consultant_documents',
    'user_activities',
    'consultants',
    'hospital_staff',
    'projects',
    'hospitals',
    'invitations',
    'users',
    'sessions',
  ];

  for (const table of tables) {
    try {
      await database.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
    } catch (error) {
      const message = (error as Error).message;
      // Only silently skip if table doesn't exist (expected during initial setup)
      if (!message.includes('does not exist')) {
        console.warn(`Warning: Failed to truncate table "${table}": ${message}`);
      }
    }
  }

  // Re-enable foreign key checks
  await database.execute(sql`SET session_replication_role = 'origin'`);
}

/**
 * Seed test data
 */
export async function seedTestData() {
  const database = getDb();

  // Create test admin user
  const [adminUser] = await database.insert(schema.users).values({
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    accessStatus: 'active',
  }).returning();

  // Create test hospital
  const [hospital] = await database.insert(schema.hospitals).values({
    name: 'Test Hospital',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    contactEmail: 'contact@testhospital.com',
    contactPhone: '555-0100',
    ehrSystem: 'Epic',
    isActive: true,
  }).returning();

  // Create test consultant user
  const [consultantUser] = await database.insert(schema.users).values({
    email: 'consultant@test.com',
    firstName: 'Test',
    lastName: 'Consultant',
    role: 'consultant',
    isActive: true,
    accessStatus: 'active',
  }).returning();

  // Create consultant profile
  const [consultant] = await database.insert(schema.consultants).values({
    userId: consultantUser.id,
    specialty: 'Epic',
    certifications: ['Epic Certified'],
    yearsExperience: 5,
    hourlyRate: '150.00',
    isAvailable: true,
    maxWeeklyHours: 40,
    shiftPreference: 'day',
    willingToTravel: true,
    remoteCapable: true,
    startDate: new Date().toISOString().split('T')[0],
  }).returning();

  // Create test project
  const [project] = await database.insert(schema.projects).values({
    name: 'Test Implementation',
    hospitalId: hospital.id,
    description: 'Test project description',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    ehrSystem: 'Epic',
    projectType: 'Implementation',
    budget: '100000.00',
  }).returning();

  return {
    adminUser,
    consultantUser,
    consultant,
    hospital,
    project,
  };
}

/**
 * Close database connection
 */
export async function closeConnection() {
  if (pool) {
    await pool.end();
  }
}

// Jest hooks
beforeAll(async () => {
  // Initialize connection
  getDb();
});

afterAll(async () => {
  await closeConnection();
});

// Export schema for tests
export { schema };
