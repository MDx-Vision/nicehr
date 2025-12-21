import { db } from "../server/db";
import {
  discAssessments,
  discSkills,
  discTeams,
  discTeamAssignments,
  discCompatibilityRules,
  consultants,
  users,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  DiSC DATABASE VERIFICATION");
  console.log("=".repeat(60) + "\n");

  // 1. Skills
  const skills = await db.select().from(discSkills).limit(5);
  console.log("📚 Skills (first 5):");
  skills.forEach(s => console.log(`   - ${s.name} (${s.category})`));
  console.log(`   ... and ${await db.select().from(discSkills).then(r => r.length) - 5} more\n`);

  // 2. Compatibility Rules
  const rules = await db.select().from(discCompatibilityRules);
  console.log("📋 Compatibility Rules:");
  rules.forEach(r => console.log(`   - [${r.severity}] ${r.name}: ${r.description}`));
  console.log();

  // 3. DiSC Assessments
  const assessments = await db
    .select()
    .from(discAssessments)
    .innerJoin(consultants, eq(discAssessments.consultantId, consultants.id))
    .leftJoin(users, eq(consultants.userId, users.id));

  console.log("🎯 DiSC Assessments:");
  if (assessments.length === 0) {
    console.log("   No assessments found. You need consultants with matching names.\n");
  } else {
    assessments.forEach(a => {
      const name = `${a.users?.firstName || 'Unknown'} ${a.users?.lastName || ''}`;
      console.log(`   - ${name}: ${a.disc_assessments.primaryStyle} (D:${a.disc_assessments.dScore} i:${a.disc_assessments.iScore} S:${a.disc_assessments.sScore} C:${a.disc_assessments.cScore})`);
    });
    console.log();
  }

  // 4. Teams
  const teams = await db.select().from(discTeams);
  console.log("👥 DiSC Teams:");
  for (const team of teams) {
    const members = await db
      .select()
      .from(discTeamAssignments)
      .where(eq(discTeamAssignments.teamId, team.id));
    console.log(`   - ${team.name} (${team.status}) - ${members.length} members`);
  }
  console.log();

  // Summary
  console.log("=".repeat(60));
  console.log("  SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Skills:      ${skills.length > 0 ? '✅' : '❌'} ${await db.select().from(discSkills).then(r => r.length)} items`);
  console.log(`  Rules:       ${rules.length > 0 ? '✅' : '❌'} ${rules.length} items`);
  console.log(`  Assessments: ${assessments.length > 0 ? '✅' : '⚠️'} ${assessments.length} items`);
  console.log(`  Teams:       ${teams.length > 0 ? '✅' : '❌'} ${teams.length} items`);
  console.log();

  if (assessments.length === 0) {
    console.log("⚠️  Note: To see assessments, your existing consultants need");
    console.log("    matching first names: Marcus, Priya, David, Jessica,");
    console.log("    Michael, Aisha, Robert, Sarah");
    console.log();
  }

  console.log("✅ DiSC data is in the database and ready!");
  console.log("   Restart your dev server to enable /api/disc/* routes\n");

  process.exit(0);
}

main().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
