import { db } from "./db";
import {
  discAssessments,
  discSkills,
  discPersonSkills,
  discTeams,
  discTeamAssignments,
  discCompatibilityRules,
  consultants,
  users,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// DiSC Style Metadata (for reference in UI)
export const DISC_STYLES = {
  D: {
    name: "Dominance",
    color: "#D64933",
    strengths: ["Decisive", "Problem solver", "Risk taker", "Self-starter"],
    challenges: ["Impatient", "Insensitive", "Demanding"],
    idealRoles: ["Project Lead", "Command Center Director", "Go-Live Manager"],
  },
  i: {
    name: "Influence",
    color: "#F4B942",
    strengths: ["Enthusiastic", "Collaborative", "Creative", "Motivating"],
    challenges: ["Disorganized", "Impulsive", "Lacks follow-through"],
    idealRoles: ["Trainer", "End-user Liaison", "Change Champion", "Stakeholder Manager"],
  },
  S: {
    name: "Steadiness",
    color: "#4A9B5D",
    strengths: ["Patient", "Team player", "Reliable", "Good listener"],
    challenges: ["Resistant to change", "Avoids conflict", "Indecisive"],
    idealRoles: ["At-the-Elbow Support", "Super User Coach", "Help Desk", "Patient Advocate"],
  },
  C: {
    name: "Conscientiousness",
    color: "#3B82C4",
    strengths: ["Accurate", "Detail-oriented", "Quality-focused", "Systematic"],
    challenges: ["Overly critical", "Analysis paralysis", "Perfectionist"],
    idealRoles: ["Build Analyst", "Testing Lead", "Data Validation", "Compliance Specialist"],
  },
};

// Compatibility matrix base scores (style1 -> style2)
export const COMPATIBILITY_MATRIX: Record<string, Record<string, number>> = {
  D: { D: 70, i: 80, S: 60, C: 75 },
  i: { D: 80, i: 75, S: 85, C: 65 },
  S: { D: 60, i: 85, S: 80, C: 75 },
  C: { D: 75, i: 65, S: 75, C: 85 },
};

// Healthcare IT skills for DiSC matching
const healthcareSkills = [
  { id: "skill-epic-amb", name: "Epic Ambulatory", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { id: "skill-epic-inp", name: "Epic Inpatient", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { id: "skill-epic-rev", name: "Epic Revenue Cycle", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { id: "skill-epic-cadence", name: "Epic Cadence", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { id: "skill-epic-orders", name: "Epic Orders", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { id: "skill-cerner-power", name: "Cerner PowerChart", category: "EHR Systems", subcategory: "Cerner", isCertifiable: true },
  { id: "skill-cerner-rev", name: "Cerner Revenue Cycle", category: "EHR Systems", subcategory: "Cerner", isCertifiable: true },
  { id: "skill-meditech", name: "MEDITECH Expanse", category: "EHR Systems", subcategory: "MEDITECH", isCertifiable: true },
  { id: "skill-workflow", name: "Clinical Workflow Design", category: "Clinical", subcategory: null, isCertifiable: false },
  { id: "skill-training", name: "End User Training", category: "Training", subcategory: null, isCertifiable: false },
  { id: "skill-elbow", name: "At-the-Elbow Support", category: "Support", subcategory: null, isCertifiable: false },
  { id: "skill-command", name: "Command Center Operations", category: "Go-Live", subcategory: null, isCertifiable: false },
  { id: "skill-golive", name: "Go-Live Support", category: "Go-Live", subcategory: null, isCertifiable: false },
  { id: "skill-testing", name: "System Testing", category: "Quality", subcategory: null, isCertifiable: false },
  { id: "skill-data", name: "Data Migration", category: "Technical", subcategory: null, isCertifiable: false },
];

// Default compatibility rules
const defaultRules = [
  {
    id: "rule-high-d",
    name: "HIGH_D_CONCENTRATION",
    description: "Multiple high-D personalities may create power struggles",
    ruleType: "composition",
    severity: "warning" as const,
    conditions: { type: "style_count", style: "D", threshold: 2, scoreThreshold: 70 },
    messageTemplate: "Team has {count} high-D members. May cause power struggles.",
    suggestion: "Add S-style members to balance assertiveness and provide team stability.",
  },
  {
    id: "rule-no-detail",
    name: "NO_DETAIL_ORIENTATION",
    description: "Team lacks conscientiousness for detail work",
    ruleType: "composition",
    severity: "critical" as const,
    conditions: { type: "style_minimum", style: "C", minimumCount: 1, scoreThreshold: 50 },
    messageTemplate: "No team members with strong C-style. Quality and accuracy may suffer.",
    suggestion: "Add at least one detail-oriented C-style member for quality assurance.",
  },
  {
    id: "rule-same-style",
    name: "ALL_SAME_STYLE",
    description: "Homogeneous teams lack diverse perspectives",
    ruleType: "composition",
    severity: "warning" as const,
    conditions: { type: "style_diversity", minimumStyles: 2 },
    messageTemplate: "Team dominated by one style. Diverse perspectives missing.",
    suggestion: "Add members with complementary styles for balanced decision-making.",
  },
  {
    id: "rule-friction",
    name: "HIGH_FRICTION_PAIRING",
    description: "D-S and i-C pairings may need extra communication support",
    ruleType: "pairing",
    severity: "info" as const,
    conditions: { type: "pairwise_friction", pairs: [["D", "S"], ["i", "C"]] },
    messageTemplate: "{person1} ({style1}) and {person2} ({style2}) pairing may need communication coaching.",
    suggestion: "Establish clear communication protocols and regular check-ins.",
  },
  {
    id: "rule-balance",
    name: "IDEAL_BALANCE",
    description: "Team has good style diversity",
    ruleType: "composition",
    severity: "success" as const,
    conditions: { type: "all_styles_present" },
    messageTemplate: "Great balance! Team has all DiSC styles represented.",
    suggestion: null,
  },
  {
    id: "rule-no-leader",
    name: "NO_NATURAL_LEADER",
    description: "Team may lack decisive leadership",
    ruleType: "composition",
    severity: "warning" as const,
    conditions: { type: "style_minimum", style: "D", minimumCount: 1, scoreThreshold: 60 },
    messageTemplate: "No high-D members to drive decisions. May slow progress.",
    suggestion: "Consider adding a D-style member or designating a decision-maker role.",
  },
  {
    id: "rule-no-communicator",
    name: "NO_COMMUNICATOR",
    description: "Team may struggle with stakeholder engagement",
    ruleType: "composition",
    severity: "info" as const,
    conditions: { type: "style_minimum", style: "i", minimumCount: 1, scoreThreshold: 60 },
    messageTemplate: "No high-i members for stakeholder communication.",
    suggestion: "Consider adding an i-style member for change management and training.",
  },
];

// Demo DiSC assessments linked to existing consultants
// These will be seeded only if the consultants exist
const demoAssessments = [
  {
    firstName: "Marcus",
    lastName: "Chen",
    roleTitle: "Senior Consultant",
    primaryStyle: "D" as const,
    secondaryStyle: "C" as const,
    dScore: 85,
    iScore: 35,
    sScore: 25,
    cScore: 72,
  },
  {
    firstName: "Priya",
    lastName: "Sharma",
    roleTitle: "Training Lead",
    primaryStyle: "i" as const,
    secondaryStyle: "S" as const,
    dScore: 40,
    iScore: 88,
    sScore: 65,
    cScore: 30,
  },
  {
    firstName: "David",
    lastName: "Okonkwo",
    roleTitle: "Support Specialist",
    primaryStyle: "S" as const,
    secondaryStyle: "C" as const,
    dScore: 25,
    iScore: 45,
    sScore: 82,
    cScore: 68,
  },
  {
    firstName: "Jessica",
    lastName: "Martinez",
    roleTitle: "Command Center Lead",
    primaryStyle: "D" as const,
    secondaryStyle: "i" as const,
    dScore: 78,
    iScore: 72,
    sScore: 35,
    cScore: 40,
  },
  {
    firstName: "Michael",
    lastName: "Thompson",
    roleTitle: "Build Analyst",
    primaryStyle: "C" as const,
    secondaryStyle: "S" as const,
    dScore: 30,
    iScore: 25,
    sScore: 58,
    cScore: 90,
  },
  {
    firstName: "Aisha",
    lastName: "Johnson",
    roleTitle: "Trainer",
    primaryStyle: "i" as const,
    secondaryStyle: null,
    dScore: 45,
    iScore: 92,
    sScore: 55,
    cScore: 28,
  },
  {
    firstName: "Robert",
    lastName: "Kim",
    roleTitle: "Testing Lead",
    primaryStyle: "C" as const,
    secondaryStyle: null,
    dScore: 35,
    iScore: 30,
    sScore: 45,
    cScore: 88,
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    roleTitle: "Support Specialist",
    primaryStyle: "S" as const,
    secondaryStyle: null,
    dScore: 20,
    iScore: 50,
    sScore: 90,
    cScore: 55,
  },
];

export async function seedDiscData() {
  console.log("🎯 Seeding DiSC data...");

  try {
    // 1. Seed DiSC Skills
    console.log("  → Seeding DiSC skills...");
    for (const skill of healthcareSkills) {
      await db
        .insert(discSkills)
        .values({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          subcategory: skill.subcategory,
          isCertifiable: skill.isCertifiable,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log(`    ✓ Seeded ${healthcareSkills.length} skills`);

    // 2. Seed Compatibility Rules
    console.log("  → Seeding compatibility rules...");
    for (const rule of defaultRules) {
      await db
        .insert(discCompatibilityRules)
        .values({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          ruleType: rule.ruleType,
          severity: rule.severity,
          conditions: rule.conditions,
          messageTemplate: rule.messageTemplate,
          suggestion: rule.suggestion,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log(`    ✓ Seeded ${defaultRules.length} compatibility rules`);

    // 3. Seed DiSC Assessments for existing consultants
    console.log("  → Seeding DiSC assessments for consultants...");
    const existingConsultants = await db
      .select()
      .from(consultants)
      .innerJoin(users, eq(consultants.userId, users.id));
    let assessmentCount = 0;

    for (const demo of demoAssessments) {
      // Try to find a matching consultant by first name from users table
      const consultantResult = existingConsultants.find(
        (c: any) => c.users?.firstName?.toLowerCase() === demo.firstName.toLowerCase()
      );
      const consultant = consultantResult?.consultants;

      if (consultant) {
        const now = new Date();
        const validUntil = new Date(now);
        validUntil.setFullYear(validUntil.getFullYear() + 2); // Valid for 2 years

        await db
          .insert(discAssessments)
          .values({
            consultantId: consultant.id,
            primaryStyle: demo.primaryStyle,
            secondaryStyle: demo.secondaryStyle,
            dScore: demo.dScore,
            iScore: demo.iScore,
            sScore: demo.sScore,
            cScore: demo.cScore,
            assessmentDate: now,
            validUntil: validUntil,
            assessorName: "Wendy Perdomo, Certified DiSC Professional",
            notes: `Initial DiSC assessment for ${demo.firstName} ${demo.lastName}`,
          })
          .onConflictDoNothing();

        assessmentCount++;

        // Also seed some skills for this consultant
        const skillsToAssign = healthcareSkills.slice(0, 3 + Math.floor(Math.random() * 5));
        for (const skill of skillsToAssign) {
          await db
            .insert(discPersonSkills)
            .values({
              consultantId: consultant.id,
              skillId: skill.id,
              proficiencyLevel: Math.floor(Math.random() * 3) + 3, // 3-5
              yearsExperience: String(Math.floor(Math.random() * 8) + 1),
            })
            .onConflictDoNothing();
        }
      }
    }
    console.log(`    ✓ Seeded ${assessmentCount} DiSC assessments`);

    // 4. Create a demo team
    console.log("  → Creating demo DiSC team...");
    const [demoTeam] = await db
      .insert(discTeams)
      .values({
        id: "disc-team-demo",
        name: "Epic Go-Live Alpha Team",
        purpose: "Primary go-live support team for Mercy Regional Epic implementation",
        targetSize: 6,
        status: "forming",
      })
      .onConflictDoNothing()
      .returning();

    if (demoTeam) {
      // Add some consultants to the team
      const consultantsForTeam = existingConsultants.slice(0, 4);
      for (const c of consultantsForTeam) {
        await db
          .insert(discTeamAssignments)
          .values({
            teamId: demoTeam.id,
            consultantId: c.consultants.id,
            role: "Team Member",
            status: "active",
            allocationPercent: 100,
          })
          .onConflictDoNothing();
      }
      console.log(`    ✓ Created demo team with ${consultantsForTeam.length} members`);
    }

    console.log("✅ DiSC data seeding complete!");
    return { success: true };
  } catch (error) {
    console.error("❌ Error seeding DiSC data:", error);
    throw error;
  }
}

// Export for use in routes
export { healthcareSkills, defaultRules, demoAssessments };
