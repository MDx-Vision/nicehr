import { db } from "./db";
import { eq, and, desc, sql, inArray, count } from "drizzle-orm";
import {
  discAssessments,
  discSkills,
  discPersonSkills,
  discTeams,
  discTeamAssignments,
  discTeamAnalyses,
  discCompatibilityRules,
  consultants,
  users,
  projects,
  type DiscAssessment,
  type InsertDiscAssessment,
  type DiscSkill,
  type InsertDiscSkill,
  type DiscPersonSkill,
  type InsertDiscPersonSkill,
  type DiscTeam,
  type InsertDiscTeam,
  type DiscTeamAssignment,
  type InsertDiscTeamAssignment,
  type DiscTeamAnalysis,
  type InsertDiscTeamAnalysis,
  type DiscCompatibilityRule,
  type InsertDiscCompatibilityRule,
  type ConsultantWithDisc,
  type DiscTeamWithDetails,
} from "@shared/schema";

// ==========================================
// DiSC ASSESSMENTS
// ==========================================

export async function getDiscAssessments() {
  return db
    .select()
    .from(discAssessments)
    .innerJoin(consultants, eq(discAssessments.consultantId, consultants.id))
    .orderBy(desc(discAssessments.createdAt));
}

export async function getDiscAssessmentByConsultantId(consultantId: string) {
  const [assessment] = await db
    .select()
    .from(discAssessments)
    .where(eq(discAssessments.consultantId, consultantId))
    .limit(1);
  return assessment;
}

export async function createDiscAssessment(data: InsertDiscAssessment) {
  const [assessment] = await db
    .insert(discAssessments)
    .values(data)
    .returning();
  return assessment;
}

export async function updateDiscAssessment(
  consultantId: string,
  data: Partial<InsertDiscAssessment>
) {
  const [assessment] = await db
    .update(discAssessments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(discAssessments.consultantId, consultantId))
    .returning();
  return assessment;
}

export async function deleteDiscAssessment(consultantId: string) {
  await db
    .delete(discAssessments)
    .where(eq(discAssessments.consultantId, consultantId));
}

// Get assessments filtered by organization type
export async function getDiscAssessmentsByOrgType(orgType: "nicehr" | "hospital") {
  return db
    .select()
    .from(discAssessments)
    .innerJoin(consultants, eq(discAssessments.consultantId, consultants.id))
    .where(eq(discAssessments.organizationType, orgType))
    .orderBy(desc(discAssessments.createdAt));
}

// Get assessments filtered by hospital
export async function getDiscAssessmentsByHospital(hospitalId: string) {
  return db
    .select()
    .from(discAssessments)
    .innerJoin(consultants, eq(discAssessments.consultantId, consultants.id))
    .where(
      and(
        eq(discAssessments.organizationType, "hospital"),
        eq(discAssessments.hospitalId, hospitalId)
      )
    )
    .orderBy(desc(discAssessments.createdAt));
}

// Get assessments with flexible filtering options
export async function getDiscAssessmentsFiltered(options: {
  orgType?: "nicehr" | "hospital";
  hospitalId?: string;
}) {
  const conditions = [];

  if (options.orgType) {
    conditions.push(eq(discAssessments.organizationType, options.orgType));
  }

  if (options.hospitalId) {
    conditions.push(eq(discAssessments.hospitalId, options.hospitalId));
  }

  const query = db
    .select()
    .from(discAssessments)
    .innerJoin(consultants, eq(discAssessments.consultantId, consultants.id));

  if (conditions.length > 0) {
    return query
      .where(and(...conditions))
      .orderBy(desc(discAssessments.createdAt));
  }

  return query.orderBy(desc(discAssessments.createdAt));
}

// Get dashboard stats filtered by organization
export async function getDiscDashboardStatsFiltered(options: {
  orgType?: "nicehr" | "hospital";
  hospitalId?: string;
}) {
  const conditions = [];

  if (options.orgType) {
    conditions.push(eq(discAssessments.organizationType, options.orgType));
  }

  if (options.hospitalId) {
    conditions.push(eq(discAssessments.hospitalId, options.hospitalId));
  }

  // Build base query with optional filters
  const assessmentsQuery = conditions.length > 0
    ? db.select().from(discAssessments).where(and(...conditions))
    : db.select().from(discAssessments);

  const assessments = await assessmentsQuery;

  // Calculate style distribution
  const styleDistribution = { D: 0, i: 0, S: 0, C: 0 };
  assessments.forEach((a) => {
    styleDistribution[a.primaryStyle as keyof typeof styleDistribution]++;
  });

  // Get teams (for now, show all teams - can be filtered later if needed)
  const teams = await db.select().from(discTeams);
  const activeTeams = teams.filter((t) => t.status === "active");

  // Get skills count
  const skills = await db.select().from(discSkills).where(eq(discSkills.isActive, true));

  // Get team analyses for average score
  const analyses = await db.select().from(discTeamAnalyses);
  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length)
    : 0;

  return {
    totalAssessments: assessments.length,
    totalTeams: teams.length,
    activeTeams: activeTeams.length,
    totalSkills: skills.length,
    averageTeamScore: avgScore,
    styleDistribution,
  };
}

// ==========================================
// DiSC SKILLS
// ==========================================

export async function getDiscSkills() {
  return db
    .select()
    .from(discSkills)
    .where(eq(discSkills.isActive, true))
    .orderBy(discSkills.category, discSkills.name);
}

export async function getDiscSkill(id: string) {
  const [skill] = await db
    .select()
    .from(discSkills)
    .where(eq(discSkills.id, id))
    .limit(1);
  return skill;
}

export async function createDiscSkill(data: InsertDiscSkill) {
  const [skill] = await db.insert(discSkills).values(data).returning();
  return skill;
}

export async function updateDiscSkill(id: string, data: Partial<InsertDiscSkill>) {
  const [skill] = await db
    .update(discSkills)
    .set(data)
    .where(eq(discSkills.id, id))
    .returning();
  return skill;
}

export async function deleteDiscSkill(id: string) {
  await db.update(discSkills).set({ isActive: false }).where(eq(discSkills.id, id));
}

// ==========================================
// DiSC PERSON SKILLS
// ==========================================

export async function getDiscPersonSkills(consultantId: string) {
  return db
    .select()
    .from(discPersonSkills)
    .innerJoin(discSkills, eq(discPersonSkills.skillId, discSkills.id))
    .where(eq(discPersonSkills.consultantId, consultantId))
    .orderBy(discSkills.category, discSkills.name);
}

export async function addDiscPersonSkill(data: InsertDiscPersonSkill) {
  const [personSkill] = await db
    .insert(discPersonSkills)
    .values(data)
    .returning();
  return personSkill;
}

export async function updateDiscPersonSkill(
  id: string,
  data: Partial<InsertDiscPersonSkill>
) {
  const [personSkill] = await db
    .update(discPersonSkills)
    .set(data)
    .where(eq(discPersonSkills.id, id))
    .returning();
  return personSkill;
}

export async function removeDiscPersonSkill(id: string) {
  await db.delete(discPersonSkills).where(eq(discPersonSkills.id, id));
}

// ==========================================
// DiSC TEAMS
// ==========================================

export interface PaginatedTeamsResult {
  teams: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getDiscTeams(page: number = 1, limit: number = 12): Promise<PaginatedTeamsResult> {
  const offset = (page - 1) * limit;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(discTeams);

  // Get paginated teams
  const teams = await db
    .select()
    .from(discTeams)
    .leftJoin(projects, eq(discTeams.projectId, projects.id))
    .orderBy(desc(discTeams.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    teams,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getDiscTeam(id: string): Promise<DiscTeamWithDetails | null> {
  const [team] = await db
    .select()
    .from(discTeams)
    .leftJoin(projects, eq(discTeams.projectId, projects.id))
    .where(eq(discTeams.id, id))
    .limit(1);

  if (!team) return null;

  // Get team assignments with consultants and their DiSC assessments
  const assignments = await db
    .select()
    .from(discTeamAssignments)
    .innerJoin(consultants, eq(discTeamAssignments.consultantId, consultants.id))
    .leftJoin(discAssessments, eq(consultants.id, discAssessments.consultantId))
    .leftJoin(users, eq(consultants.userId, users.id))
    .where(eq(discTeamAssignments.teamId, id));

  // Get latest analysis
  const [latestAnalysis] = await db
    .select()
    .from(discTeamAnalyses)
    .where(eq(discTeamAnalyses.teamId, id))
    .orderBy(desc(discTeamAnalyses.analysisDate))
    .limit(1);

  return {
    ...team.disc_teams,
    project: team.projects,
    assignments: assignments.map((a: any) => ({
      ...a.disc_team_assignments,
      consultant: {
        ...a.consultants,
        user: a.users,
        discAssessment: a.disc_assessments,
      },
    })),
    latestAnalysis: latestAnalysis || null,
  } as DiscTeamWithDetails;
}

export async function createDiscTeam(data: InsertDiscTeam) {
  const [team] = await db.insert(discTeams).values(data).returning();
  return team;
}

export async function updateDiscTeam(id: string, data: Partial<InsertDiscTeam>) {
  const [team] = await db
    .update(discTeams)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(discTeams.id, id))
    .returning();
  return team;
}

export async function deleteDiscTeam(id: string) {
  await db.delete(discTeams).where(eq(discTeams.id, id));
}

// ==========================================
// DiSC TEAM ASSIGNMENTS
// ==========================================

export async function addDiscTeamMember(data: InsertDiscTeamAssignment) {
  const [assignment] = await db
    .insert(discTeamAssignments)
    .values(data)
    .returning();
  return assignment;
}

export async function removeDiscTeamMember(teamId: string, consultantId: string) {
  await db
    .delete(discTeamAssignments)
    .where(
      and(
        eq(discTeamAssignments.teamId, teamId),
        eq(discTeamAssignments.consultantId, consultantId)
      )
    );
}

export async function updateDiscTeamMember(
  teamId: string,
  consultantId: string,
  data: Partial<InsertDiscTeamAssignment>
) {
  const [assignment] = await db
    .update(discTeamAssignments)
    .set(data)
    .where(
      and(
        eq(discTeamAssignments.teamId, teamId),
        eq(discTeamAssignments.consultantId, consultantId)
      )
    )
    .returning();
  return assignment;
}

// ==========================================
// DiSC TEAM ANALYSES
// ==========================================

export async function getDiscTeamAnalyses(teamId: string) {
  return db
    .select()
    .from(discTeamAnalyses)
    .where(eq(discTeamAnalyses.teamId, teamId))
    .orderBy(desc(discTeamAnalyses.analysisDate));
}

export async function createDiscTeamAnalysis(data: InsertDiscTeamAnalysis) {
  const [analysis] = await db
    .insert(discTeamAnalyses)
    .values(data)
    .returning();
  return analysis;
}

// ==========================================
// DiSC COMPATIBILITY RULES
// ==========================================

export async function getDiscCompatibilityRules() {
  return db
    .select()
    .from(discCompatibilityRules)
    .where(eq(discCompatibilityRules.isActive, true))
    .orderBy(discCompatibilityRules.ruleType, discCompatibilityRules.name);
}

export async function getDiscCompatibilityRule(id: string) {
  const [rule] = await db
    .select()
    .from(discCompatibilityRules)
    .where(eq(discCompatibilityRules.id, id))
    .limit(1);
  return rule;
}

export async function createDiscCompatibilityRule(data: InsertDiscCompatibilityRule) {
  const [rule] = await db
    .insert(discCompatibilityRules)
    .values(data)
    .returning();
  return rule;
}

export async function updateDiscCompatibilityRule(
  id: string,
  data: Partial<InsertDiscCompatibilityRule>
) {
  const [rule] = await db
    .update(discCompatibilityRules)
    .set(data)
    .where(eq(discCompatibilityRules.id, id))
    .returning();
  return rule;
}

export async function deleteDiscCompatibilityRule(id: string) {
  await db
    .update(discCompatibilityRules)
    .set({ isActive: false })
    .where(eq(discCompatibilityRules.id, id));
}

// ==========================================
// CONSULTANTS WITH DISC DATA
// ==========================================

export async function getConsultantsWithDisc(): Promise<ConsultantWithDisc[]> {
  const results = await db
    .select()
    .from(consultants)
    .leftJoin(discAssessments, eq(consultants.id, discAssessments.consultantId))
    .leftJoin(users, eq(consultants.userId, users.id))
    .orderBy(users.firstName, users.lastName);

  // Get skills for all consultants
  const consultantIds = results.map((r: any) => r.consultants.id);

  const allSkills = consultantIds.length > 0
    ? await db
        .select()
        .from(discPersonSkills)
        .innerJoin(discSkills, eq(discPersonSkills.skillId, discSkills.id))
        .where(inArray(discPersonSkills.consultantId, consultantIds))
    : [];

  return results.map((r: any) => ({
    ...r.consultants,
    user: r.users,
    discAssessment: r.disc_assessments,
    discSkills: allSkills
      .filter((s: any) => s.disc_person_skills.consultantId === r.consultants.id)
      .map((s: any) => ({
        ...s.disc_person_skills,
        skill: s.disc_skills,
      })),
  })) as ConsultantWithDisc[];
}

export async function getConsultantWithDisc(
  consultantId: string
): Promise<ConsultantWithDisc | null> {
  const [result] = await db
    .select()
    .from(consultants)
    .leftJoin(discAssessments, eq(consultants.id, discAssessments.consultantId))
    .leftJoin(users, eq(consultants.userId, users.id))
    .where(eq(consultants.id, consultantId))
    .limit(1);

  if (!result) return null;

  const skills = await db
    .select()
    .from(discPersonSkills)
    .innerJoin(discSkills, eq(discPersonSkills.skillId, discSkills.id))
    .where(eq(discPersonSkills.consultantId, consultantId));

  return {
    ...result.consultants,
    user: result.users,
    discAssessment: result.disc_assessments,
    discSkills: skills.map((s: any) => ({
      ...s.disc_person_skills,
      skill: s.disc_skills,
    })),
  } as ConsultantWithDisc;
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDiscDashboardStats() {
  const [assessmentCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discAssessments);

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discTeams);

  const [activeTeamCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discTeams)
    .where(eq(discTeams.status, "active"));

  const [skillCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(discSkills)
    .where(eq(discSkills.isActive, true));

  // Get average team score from recent analyses
  const recentAnalyses = await db
    .select()
    .from(discTeamAnalyses)
    .orderBy(desc(discTeamAnalyses.analysisDate))
    .limit(10);

  const avgScore =
    recentAnalyses.length > 0
      ? Math.round(
          recentAnalyses.reduce((sum: number, a: any) => sum + a.overallScore, 0) /
            recentAnalyses.length
        )
      : 0;

  // Style distribution
  const styleDistribution = await db
    .select({
      style: discAssessments.primaryStyle,
      count: sql<number>`count(*)::int`,
    })
    .from(discAssessments)
    .groupBy(discAssessments.primaryStyle);

  return {
    totalAssessments: assessmentCount?.count || 0,
    totalTeams: teamCount?.count || 0,
    activeTeams: activeTeamCount?.count || 0,
    totalSkills: skillCount?.count || 0,
    averageTeamScore: avgScore,
    styleDistribution: styleDistribution.reduce(
      (acc: Record<string, number>, s: any) => ({ ...acc, [s.style]: s.count }),
      { D: 0, i: 0, S: 0, C: 0 }
    ),
  };
}
