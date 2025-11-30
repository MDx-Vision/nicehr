import { db } from "./server/db";
import { users } from "./shared/schema";
import { sql } from "drizzle-orm";

async function clearAllData() {
  console.log("Clearing all existing data...");
  
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  
  console.log("All data cleared successfully.");
}

async function createTestUser() {
  console.log("Creating test user...");
  
  const testUser = {
    id: "test-user-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "admin" as const,
    isActive: true,
    accessStatus: "active" as const,
    profileVisibility: "public" as const,
    emailNotifications: true,
    showEmail: false,
    showPhone: false,
  };
  
  await db.insert(users).values(testUser);
  
  console.log("Test user created successfully:");
  console.log("  Email: test@example.com");
  console.log("  Password: password123 (Note: This app uses OIDC authentication)");
  console.log("  Role: admin");
}

async function seed() {
  try {
    await clearAllData();
    await createTestUser();
    console.log("\nSeeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
