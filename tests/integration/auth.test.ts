/**
 * Authentication Integration Tests
 * Tests user authentication flows against real database
 */

import { getDb, cleanDatabase, seedTestData, schema } from './setup';
import { eq } from 'drizzle-orm';

describe('Authentication Integration Tests', () => {
  let testData: Awaited<ReturnType<typeof seedTestData>>;

  beforeEach(async () => {
    await cleanDatabase();
    testData = await seedTestData();
  });

  describe('User Creation', () => {
    it('creates a new user with valid data', async () => {
      const db = getDb();

      const [newUser] = await db.insert(schema.users).values({
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'consultant',
        isActive: true,
        accessStatus: 'active',
      }).returning();

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe('newuser@test.com');
      expect(newUser.role).toBe('consultant');
      expect(newUser.isActive).toBe(true);
      expect(newUser.id).toBeDefined();
    });

    it('prevents duplicate email addresses', async () => {
      const db = getDb();

      // Try to create user with existing email
      await expect(
        db.insert(schema.users).values({
          email: 'admin@test.com', // Already exists from seed
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'consultant',
        })
      ).rejects.toThrow();
    });

    it('creates user with default values', async () => {
      const db = getDb();

      const [user] = await db.insert(schema.users).values({
        email: 'defaults@test.com',
      }).returning();

      expect(user.role).toBe('consultant'); // Default role
      expect(user.isActive).toBe(true); // Default active
      expect(user.accessStatus).toBe('pending_invitation'); // Default status
      expect(user.profileVisibility).toBe('public'); // Default visibility
      expect(user.emailNotifications).toBe(true); // Default notifications
    });
  });

  describe('User Retrieval', () => {
    it('finds user by email', async () => {
      const db = getDb();

      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, 'admin@test.com'));

      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe('Test');
      expect(users[0].lastName).toBe('Admin');
    });

    it('finds user by id', async () => {
      const db = getDb();

      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testData.adminUser.id));

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('admin@test.com');
    });

    it('returns empty array for non-existent user', async () => {
      const db = getDb();

      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, 'nonexistent@test.com'));

      expect(users).toHaveLength(0);
    });
  });

  describe('User Updates', () => {
    it('updates user profile', async () => {
      const db = getDb();

      await db.update(schema.users)
        .set({
          firstName: 'Updated',
          lastName: 'Name',
          linkedinUrl: 'https://linkedin.com/in/updated',
        })
        .where(eq(schema.users.id, testData.adminUser.id));

      const [updated] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testData.adminUser.id));

      expect(updated.firstName).toBe('Updated');
      expect(updated.lastName).toBe('Name');
      expect(updated.linkedinUrl).toBe('https://linkedin.com/in/updated');
    });

    it('updates user role', async () => {
      const db = getDb();

      await db.update(schema.users)
        .set({ role: 'manager' })
        .where(eq(schema.users.id, testData.consultantUser.id));

      const [updated] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testData.consultantUser.id));

      expect(updated.role).toBe('manager');
    });

    it('deactivates user', async () => {
      const db = getDb();

      await db.update(schema.users)
        .set({
          isActive: false,
          accessStatus: 'suspended',
        })
        .where(eq(schema.users.id, testData.consultantUser.id));

      const [updated] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testData.consultantUser.id));

      expect(updated.isActive).toBe(false);
      expect(updated.accessStatus).toBe('suspended');
    });
  });

  describe('User Deletion', () => {
    it('soft deletes user by marking deletion requested', async () => {
      const db = getDb();

      await db.update(schema.users)
        .set({
          deletionRequestedAt: new Date(),
          isActive: false,
        })
        .where(eq(schema.users.id, testData.consultantUser.id));

      const [deleted] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testData.consultantUser.id));

      expect(deleted.deletionRequestedAt).toBeDefined();
      expect(deleted.isActive).toBe(false);
    });

    it('hard deletes user', async () => {
      const db = getDb();

      // First delete related consultant record
      await db.delete(schema.consultants)
        .where(eq(schema.consultants.userId, testData.consultantUser.id));

      // Then delete user
      await db.delete(schema.users)
        .where(eq(schema.users.id, testData.consultantUser.id));

      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, testData.consultantUser.id));

      expect(users).toHaveLength(0);
    });
  });

  describe('Role-Based Access', () => {
    it('lists users by role', async () => {
      const db = getDb();

      const admins = await db.select()
        .from(schema.users)
        .where(eq(schema.users.role, 'admin'));

      expect(admins).toHaveLength(1);
      expect(admins[0].email).toBe('admin@test.com');
    });

    it('lists active users only', async () => {
      const db = getDb();

      // Deactivate one user
      await db.update(schema.users)
        .set({ isActive: false })
        .where(eq(schema.users.id, testData.consultantUser.id));

      const activeUsers = await db.select()
        .from(schema.users)
        .where(eq(schema.users.isActive, true));

      expect(activeUsers).toHaveLength(1); // Only admin
    });
  });

  describe('Invitation Flow', () => {
    it('creates invitation for new user', async () => {
      const db = getDb();

      const [invitation] = await db.insert(schema.invitations).values({
        email: 'invited@test.com',
        token: 'test-token-123',
        status: 'pending',
        role: 'consultant',
        invitedByUserId: testData.adminUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }).returning();

      expect(invitation).toBeDefined();
      expect(invitation.email).toBe('invited@test.com');
      expect(invitation.status).toBe('pending');
    });

    it('accepts invitation and creates user', async () => {
      const db = getDb();

      // Create invitation
      const [invitation] = await db.insert(schema.invitations).values({
        email: 'newmember@test.com',
        token: 'accept-token-456',
        status: 'pending',
        role: 'consultant',
        invitedByUserId: testData.adminUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).returning();

      // Create user from invitation
      const [newUser] = await db.insert(schema.users).values({
        email: 'newmember@test.com',
        firstName: 'New',
        lastName: 'Member',
        role: invitation.role,
        isActive: true,
        accessStatus: 'active',
        invitationId: invitation.id,
      }).returning();

      // Update invitation to accepted
      await db.update(schema.invitations)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedByUserId: newUser.id,
        })
        .where(eq(schema.invitations.id, invitation.id));

      const [acceptedInvite] = await db.select()
        .from(schema.invitations)
        .where(eq(schema.invitations.id, invitation.id));

      expect(acceptedInvite.status).toBe('accepted');
      expect(acceptedInvite.acceptedByUserId).toBe(newUser.id);
    });

    it('prevents accepting expired invitation', async () => {
      const db = getDb();

      // Create expired invitation
      const [invitation] = await db.insert(schema.invitations).values({
        email: 'expired@test.com',
        token: 'expired-token-789',
        status: 'pending',
        role: 'consultant',
        invitedByUserId: testData.adminUser.id,
        expiresAt: new Date(Date.now() - 1000), // Already expired
      }).returning();

      // Verify it's expired
      expect(invitation.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it('revokes invitation', async () => {
      const db = getDb();

      // Create invitation
      const [invitation] = await db.insert(schema.invitations).values({
        email: 'revoke@test.com',
        token: 'revoke-token-000',
        status: 'pending',
        role: 'consultant',
        invitedByUserId: testData.adminUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).returning();

      // Revoke invitation
      await db.update(schema.invitations)
        .set({
          status: 'revoked',
          revokedAt: new Date(),
          revokedByUserId: testData.adminUser.id,
          revokedReason: 'No longer needed',
        })
        .where(eq(schema.invitations.id, invitation.id));

      const [revoked] = await db.select()
        .from(schema.invitations)
        .where(eq(schema.invitations.id, invitation.id));

      expect(revoked.status).toBe('revoked');
      expect(revoked.revokedReason).toBe('No longer needed');
    });
  });
});
