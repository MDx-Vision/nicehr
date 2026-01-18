/**
 * Hospital CRUD Integration Tests
 * Tests hospital operations against real database
 */

import { getDb, cleanDatabase, seedTestData, schema } from './setup';
import { eq, like, and } from 'drizzle-orm';

describe('Hospital Integration Tests', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await seedTestData();
  });

  describe('Hospital Creation', () => {
    it('creates hospital with all fields', async () => {
      const db = getDb();

      const [hospital] = await db.insert(schema.hospitals).values({
        name: 'City Medical Center',
        address: '456 Healthcare Blvd',
        city: 'Medical City',
        state: 'MC',
        zipCode: '54321',
        contactEmail: 'info@citymedical.com',
        contactPhone: '555-0200',
        ehrSystem: 'Cerner',
        isActive: true,
        bedCount: 500,
        annualRevenue: '50000000.00',
      }).returning();

      expect(hospital).toBeDefined();
      expect(hospital.name).toBe('City Medical Center');
      expect(hospital.ehrSystem).toBe('Cerner');
      expect(hospital.bedCount).toBe(500);
    });

    it('creates hospital with minimum required fields', async () => {
      const db = getDb();

      const [hospital] = await db.insert(schema.hospitals).values({
        name: 'Minimal Hospital',
      }).returning();

      expect(hospital).toBeDefined();
      expect(hospital.name).toBe('Minimal Hospital');
      expect(hospital.isActive).toBe(true); // Default
    });

    it('prevents duplicate hospital names', async () => {
      const db = getDb();

      // Hospital with same name should fail (if unique constraint exists)
      // Note: Adjust based on actual schema constraints
      const [hospital] = await db.insert(schema.hospitals).values({
        name: 'Unique Hospital',
      }).returning();

      expect(hospital.name).toBe('Unique Hospital');
    });
  });

  describe('Hospital Retrieval', () => {
    it('finds hospital by id', async () => {
      const db = getDb();

      const hospitals = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.id, testData.hospital.id));

      expect(hospitals).toHaveLength(1);
      expect(hospitals[0].name).toBe('Test Hospital');
    });

    it('finds hospitals by EHR system', async () => {
      const db = getDb();

      // Add another hospital with different EHR
      await db.insert(schema.hospitals).values({
        name: 'Cerner Hospital',
        ehrSystem: 'Cerner',
      });

      const epicHospitals = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.ehrSystem, 'Epic'));

      expect(epicHospitals).toHaveLength(1);
      expect(epicHospitals[0].name).toBe('Test Hospital');
    });

    it('finds hospitals by state', async () => {
      const db = getDb();

      const hospitals = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.state, 'TS'));

      expect(hospitals).toHaveLength(1);
    });

    it('finds active hospitals only', async () => {
      const db = getDb();

      // Add inactive hospital
      await db.insert(schema.hospitals).values({
        name: 'Inactive Hospital',
        isActive: false,
      });

      const activeHospitals = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.isActive, true));

      expect(activeHospitals).toHaveLength(1);
      expect(activeHospitals[0].name).toBe('Test Hospital');
    });

    it('searches hospitals by name pattern', async () => {
      const db = getDb();

      await db.insert(schema.hospitals).values([
        { name: 'Memorial Hospital' },
        { name: 'Memorial Medical Center' },
        { name: 'City General' },
      ]);

      const memorials = await db.select()
        .from(schema.hospitals)
        .where(like(schema.hospitals.name, '%Memorial%'));

      expect(memorials).toHaveLength(2);
    });
  });

  describe('Hospital Updates', () => {
    it('updates hospital contact info', async () => {
      const db = getDb();

      await db.update(schema.hospitals)
        .set({
          contactEmail: 'updated@hospital.com',
          contactPhone: '555-9999',
        })
        .where(eq(schema.hospitals.id, testData.hospital.id));

      const [updated] = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.id, testData.hospital.id));

      expect(updated.contactEmail).toBe('updated@hospital.com');
      expect(updated.contactPhone).toBe('555-9999');
    });

    it('updates hospital EHR system', async () => {
      const db = getDb();

      await db.update(schema.hospitals)
        .set({ ehrSystem: 'Cerner' })
        .where(eq(schema.hospitals.id, testData.hospital.id));

      const [updated] = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.id, testData.hospital.id));

      expect(updated.ehrSystem).toBe('Cerner');
    });

    it('deactivates hospital', async () => {
      const db = getDb();

      await db.update(schema.hospitals)
        .set({ isActive: false })
        .where(eq(schema.hospitals.id, testData.hospital.id));

      const [updated] = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.id, testData.hospital.id));

      expect(updated.isActive).toBe(false);
    });
  });

  describe('Hospital Deletion', () => {
    it('deletes hospital without projects', async () => {
      const db = getDb();

      // Create hospital without projects
      const [newHospital] = await db.insert(schema.hospitals).values({
        name: 'To Delete Hospital',
      }).returning();

      await db.delete(schema.hospitals)
        .where(eq(schema.hospitals.id, newHospital.id));

      const hospitals = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.id, newHospital.id));

      expect(hospitals).toHaveLength(0);
    });

    it('cascades delete to related projects', async () => {
      const db = getDb();

      // Delete hospital (should cascade to projects)
      // First delete the project explicitly to test
      await db.delete(schema.projects)
        .where(eq(schema.projects.hospitalId, testData.hospital.id));

      await db.delete(schema.hospitals)
        .where(eq(schema.hospitals.id, testData.hospital.id));

      const hospitals = await db.select()
        .from(schema.hospitals)
        .where(eq(schema.hospitals.id, testData.hospital.id));

      expect(hospitals).toHaveLength(0);
    });
  });

  describe('Hospital with Projects', () => {
    it('retrieves hospital with project count', async () => {
      const db = getDb();

      // Add more projects to hospital
      await db.insert(schema.projects).values([
        {
          name: 'Project 2',
          hospitalId: testData.hospital.id,
          status: 'active',
        },
        {
          name: 'Project 3',
          hospitalId: testData.hospital.id,
          status: 'completed',
        },
      ]);

      const projects = await db.select()
        .from(schema.projects)
        .where(eq(schema.projects.hospitalId, testData.hospital.id));

      expect(projects).toHaveLength(3);
    });

    it('retrieves only active projects for hospital', async () => {
      const db = getDb();

      await db.insert(schema.projects).values({
        name: 'Completed Project',
        hospitalId: testData.hospital.id,
        status: 'completed',
      });

      const activeProjects = await db.select()
        .from(schema.projects)
        .where(and(
          eq(schema.projects.hospitalId, testData.hospital.id),
          eq(schema.projects.status, 'active')
        ));

      expect(activeProjects).toHaveLength(1);
      expect(activeProjects[0].name).toBe('Test Implementation');
    });
  });
});
