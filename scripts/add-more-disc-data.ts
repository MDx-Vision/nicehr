import { db } from "../server/db";
import {
  discAssessments,
  consultants,
  users,
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("\n🎯 Adding DiSC assessments to existing consultants...\n");

  // Get existing consultants with their user info
  const existingConsultants = await db
    .select()
    .from(consultants)
    .innerJoin(users, eq(consultants.userId, users.id));

  console.log(`Found ${existingConsultants.length} consultants\n`);

  // DiSC profiles to assign (rotating through styles)
  const discProfiles = [
    { primaryStyle: "D" as const, secondaryStyle: "C" as const, dScore: 82, iScore: 35, sScore: 28, cScore: 70 },
    { primaryStyle: "i" as const, secondaryStyle: "S" as const, dScore: 40, iScore: 88, sScore: 62, cScore: 32 },
    { primaryStyle: "S" as const, secondaryStyle: "C" as const, dScore: 25, iScore: 48, sScore: 85, cScore: 65 },
    { primaryStyle: "C" as const, secondaryStyle: "S" as const, dScore: 32, iScore: 28, sScore: 55, cScore: 90 },
    { primaryStyle: "D" as const, secondaryStyle: "i" as const, dScore: 78, iScore: 72, sScore: 35, cScore: 42 },
    { primaryStyle: "i" as const, secondaryStyle: null, dScore: 45, iScore: 92, sScore: 55, cScore: 30 },
    { primaryStyle: "S" as const, secondaryStyle: null, dScore: 22, iScore: 52, sScore: 88, cScore: 58 },
    { primaryStyle: "C" as const, secondaryStyle: null, dScore: 35, iScore: 30, sScore: 48, cScore: 86 },
  ];

  let added = 0;
  for (let i = 0; i < existingConsultants.length && i < 8; i++) {
    const c = existingConsultants[i];
    const profile = discProfiles[i % discProfiles.length];

    // Check if already has assessment
    const existing = await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.consultantId, c.consultants.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭️  ${c.users.firstName} ${c.users.lastName} - already has assessment`);
      continue;
    }

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setFullYear(validUntil.getFullYear() + 2);

    await db.insert(discAssessments).values({
      consultantId: c.consultants.id,
      primaryStyle: profile.primaryStyle,
      secondaryStyle: profile.secondaryStyle,
      dScore: profile.dScore,
      iScore: profile.iScore,
      sScore: profile.sScore,
      cScore: profile.cScore,
      assessmentDate: now,
      validUntil: validUntil,
      assessorName: "Wendy Perdomo, Certified DiSC Professional",
      notes: `DiSC assessment for ${c.users.firstName} ${c.users.lastName}`,
    });

    console.log(`  ✅ ${c.users.firstName} ${c.users.lastName} - ${profile.primaryStyle} style added`);
    added++;
  }

  console.log(`\n✅ Added ${added} new DiSC assessments\n`);

  // Show final stats
  const allAssessments = await db
    .select()
    .from(discAssessments)
    .innerJoin(consultants, eq(discAssessments.consultantId, consultants.id))
    .leftJoin(users, eq(consultants.userId, users.id));

  console.log("📊 Final DiSC Distribution:");
  const distribution = { D: 0, i: 0, S: 0, C: 0 };
  allAssessments.forEach(a => {
    distribution[a.disc_assessments.primaryStyle as keyof typeof distribution]++;
    console.log(`   - ${a.users?.firstName} ${a.users?.lastName}: ${a.disc_assessments.primaryStyle}`);
  });

  console.log("\n📈 Style Distribution:");
  console.log(`   D (Dominance):        ${distribution.D}`);
  console.log(`   i (Influence):        ${distribution.i}`);
  console.log(`   S (Steadiness):       ${distribution.S}`);
  console.log(`   C (Conscientiousness): ${distribution.C}`);
  console.log();

  process.exit(0);
}

main().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
