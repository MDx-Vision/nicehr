import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  insertDiscAssessmentSchema,
  insertDiscSkillSchema,
  insertDiscPersonSkillSchema,
  insertDiscTeamSchema,
  insertDiscTeamAssignmentSchema,
  insertDiscCompatibilityRuleSchema,
} from "@shared/schema";
import * as discStorage from "./discStorage";
import { analyzeTeam, DISC_STYLES, getSuggestedRoles } from "./discAnalysis";
import { seedDiscData, DISC_STYLES as DISC_STYLE_META } from "./seedDiscData";

const router = Router();

// ==========================================
// DiSC DASHBOARD
// ==========================================

// Helper function to get user's filter options based on role
async function getUserFilterOptions(req: Request): Promise<{
  isAdmin: boolean;
  orgType?: "nicehr" | "hospital";
  hospitalId?: string;
}> {
  const userId = (req as any).user?.claims?.sub;
  if (!userId) {
    return { isAdmin: false };
  }

  const { storage } = await import("./storage");
  const user = await storage.getUser(userId);

  if (!user) {
    return { isAdmin: false };
  }

  // Admin sees everything
  if (user.role === "admin") {
    return { isAdmin: true };
  }

  // Hospital staff sees only their hospital's assessments
  if (user.role === "hospital_staff") {
    // Get the user's hospital association
    const consultant = await storage.getConsultantByUserId(userId);
    // For now, hospital staff can see hospital assessments
    // TODO: Add hospitalId to user or consultant to filter by specific hospital
    return {
      isAdmin: false,
      orgType: "hospital",
      hospitalId: consultant?.hospitalId || undefined,
    };
  }

  // Consultants see only NICEHR assessments (but mainly use /assessments/my for their own)
  return {
    isAdmin: false,
    orgType: "nicehr",
  };
}

router.get("/dashboard/stats", async (req: Request, res: Response) => {
  try {
    const filterOptions = await getUserFilterOptions(req);

    // Admin sees all stats
    if (filterOptions.isAdmin) {
      const stats = await discStorage.getDiscDashboardStats();
      return res.json(stats);
    }

    // Others see filtered stats
    const stats = await discStorage.getDiscDashboardStatsFiltered({
      orgType: filterOptions.orgType,
      hospitalId: filterOptions.hospitalId,
    });
    res.json(stats);
  } catch (error) {
    console.error("Error fetching DiSC dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/styles", (req: Request, res: Response) => {
  res.json(DISC_STYLES);
});

// ==========================================
// DiSC ASSESSMENTS
// ==========================================

// Get current user's own DISC assessment
router.get("/assessments/my", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Import storage to get consultant by user ID
    const { storage } = await import("./storage");
    const consultant = await storage.getConsultantByUserId(userId);

    if (!consultant) {
      return res.status(404).json({ error: "Consultant profile not found" });
    }

    const assessment = await discStorage.getDiscAssessmentByConsultantId(consultant.id);

    // Return null if no assessment (not an error - user just hasn't taken it yet)
    res.json(assessment || null);
  } catch (error) {
    console.error("Error fetching user's DiSC assessment:", error);
    res.status(500).json({ error: "Failed to fetch your DiSC assessment" });
  }
});

router.get("/assessments", async (req: Request, res: Response) => {
  try {
    const filterOptions = await getUserFilterOptions(req);

    // Admin sees all assessments
    if (filterOptions.isAdmin) {
      const assessments = await discStorage.getDiscAssessments();
      return res.json(assessments);
    }

    // Others see filtered assessments
    const assessments = await discStorage.getDiscAssessmentsFiltered({
      orgType: filterOptions.orgType,
      hospitalId: filterOptions.hospitalId,
    });
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching DiSC assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

router.get(
  "/assessments/consultant/:consultantId",
  async (req: Request, res: Response) => {
    try {
      const assessment = await discStorage.getDiscAssessmentByConsultantId(
        req.params.consultantId
      );
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching DiSC assessment:", error);
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  }
);

router.post("/assessments", async (req: Request, res: Response) => {
  try {
    const data = insertDiscAssessmentSchema.parse(req.body);
    const assessment = await discStorage.createDiscAssessment(data);
    res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating DiSC assessment:", error);
    res.status(500).json({ error: "Failed to create assessment" });
  }
});

router.put(
  "/assessments/consultant/:consultantId",
  async (req: Request, res: Response) => {
    try {
      const data = insertDiscAssessmentSchema.partial().parse(req.body);
      const assessment = await discStorage.updateDiscAssessment(
        req.params.consultantId,
        data
      );
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating DiSC assessment:", error);
      res.status(500).json({ error: "Failed to update assessment" });
    }
  }
);

router.delete(
  "/assessments/consultant/:consultantId",
  async (req: Request, res: Response) => {
    try {
      await discStorage.deleteDiscAssessment(req.params.consultantId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting DiSC assessment:", error);
      res.status(500).json({ error: "Failed to delete assessment" });
    }
  }
);

// ==========================================
// DiSC SKILLS
// ==========================================

router.get("/skills", async (req: Request, res: Response) => {
  try {
    const skills = await discStorage.getDiscSkills();
    res.json(skills);
  } catch (error) {
    console.error("Error fetching DiSC skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.get("/skills/:id", async (req: Request, res: Response) => {
  try {
    const skill = await discStorage.getDiscSkill(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.json(skill);
  } catch (error) {
    console.error("Error fetching DiSC skill:", error);
    res.status(500).json({ error: "Failed to fetch skill" });
  }
});

router.post("/skills", async (req: Request, res: Response) => {
  try {
    const data = insertDiscSkillSchema.parse(req.body);
    const skill = await discStorage.createDiscSkill(data);
    res.status(201).json(skill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating DiSC skill:", error);
    res.status(500).json({ error: "Failed to create skill" });
  }
});

router.put("/skills/:id", async (req: Request, res: Response) => {
  try {
    const data = insertDiscSkillSchema.partial().parse(req.body);
    const skill = await discStorage.updateDiscSkill(req.params.id, data);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.json(skill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating DiSC skill:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
});

router.delete("/skills/:id", async (req: Request, res: Response) => {
  try {
    await discStorage.deleteDiscSkill(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting DiSC skill:", error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

// ==========================================
// DiSC PERSON SKILLS
// ==========================================

router.get(
  "/consultants/:consultantId/skills",
  async (req: Request, res: Response) => {
    try {
      const skills = await discStorage.getDiscPersonSkills(
        req.params.consultantId
      );
      res.json(skills);
    } catch (error) {
      console.error("Error fetching consultant skills:", error);
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  }
);

router.post(
  "/consultants/:consultantId/skills",
  async (req: Request, res: Response) => {
    try {
      const data = insertDiscPersonSkillSchema.parse({
        ...req.body,
        consultantId: req.params.consultantId,
      });
      const skill = await discStorage.addDiscPersonSkill(data);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error adding consultant skill:", error);
      res.status(500).json({ error: "Failed to add skill" });
    }
  }
);

router.put(
  "/consultants/:consultantId/skills/:skillId",
  async (req: Request, res: Response) => {
    try {
      const data = insertDiscPersonSkillSchema.partial().parse(req.body);
      const skill = await discStorage.updateDiscPersonSkill(
        req.params.skillId,
        data
      );
      if (!skill) {
        return res.status(404).json({ error: "Skill not found" });
      }
      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating consultant skill:", error);
      res.status(500).json({ error: "Failed to update skill" });
    }
  }
);

router.delete(
  "/consultants/:consultantId/skills/:skillId",
  async (req: Request, res: Response) => {
    try {
      await discStorage.removeDiscPersonSkill(req.params.skillId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing consultant skill:", error);
      res.status(500).json({ error: "Failed to remove skill" });
    }
  }
);

// ==========================================
// CONSULTANTS WITH DiSC
// ==========================================

router.get("/consultants", async (req: Request, res: Response) => {
  try {
    const consultants = await discStorage.getConsultantsWithDisc();
    res.json(consultants);
  } catch (error) {
    console.error("Error fetching consultants with DiSC:", error);
    res.status(500).json({ error: "Failed to fetch consultants" });
  }
});

router.get("/consultants/:id", async (req: Request, res: Response) => {
  try {
    const consultant = await discStorage.getConsultantWithDisc(req.params.id);
    if (!consultant) {
      return res.status(404).json({ error: "Consultant not found" });
    }
    res.json(consultant);
  } catch (error) {
    console.error("Error fetching consultant with DiSC:", error);
    res.status(500).json({ error: "Failed to fetch consultant" });
  }
});

// ==========================================
// DiSC TEAMS
// ==========================================

router.get("/teams", async (req: Request, res: Response) => {
  try {
    const teams = await discStorage.getDiscTeams();
    res.json(teams);
  } catch (error) {
    console.error("Error fetching DiSC teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

router.get("/teams/:id", async (req: Request, res: Response) => {
  try {
    const team = await discStorage.getDiscTeam(req.params.id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    console.error("Error fetching DiSC team:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

router.post("/teams", async (req: Request, res: Response) => {
  try {
    const data = insertDiscTeamSchema.parse(req.body);
    const team = await discStorage.createDiscTeam(data);
    res.status(201).json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating DiSC team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

router.put("/teams/:id", async (req: Request, res: Response) => {
  try {
    const data = insertDiscTeamSchema.partial().parse(req.body);
    const team = await discStorage.updateDiscTeam(req.params.id, data);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating DiSC team:", error);
    res.status(500).json({ error: "Failed to update team" });
  }
});

router.delete("/teams/:id", async (req: Request, res: Response) => {
  try {
    await discStorage.deleteDiscTeam(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting DiSC team:", error);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

// ==========================================
// DiSC TEAM MEMBERS
// ==========================================

router.post("/teams/:teamId/members", async (req: Request, res: Response) => {
  try {
    const data = insertDiscTeamAssignmentSchema.parse({
      ...req.body,
      teamId: req.params.teamId,
    });
    const assignment = await discStorage.addDiscTeamMember(data);
    res.status(201).json(assignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error adding team member:", error);
    res.status(500).json({ error: "Failed to add team member" });
  }
});

router.put(
  "/teams/:teamId/members/:consultantId",
  async (req: Request, res: Response) => {
    try {
      const data = insertDiscTeamAssignmentSchema.partial().parse(req.body);
      const assignment = await discStorage.updateDiscTeamMember(
        req.params.teamId,
        req.params.consultantId,
        data
      );
      if (!assignment) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating team member:", error);
      res.status(500).json({ error: "Failed to update team member" });
    }
  }
);

router.delete(
  "/teams/:teamId/members/:consultantId",
  async (req: Request, res: Response) => {
    try {
      await discStorage.removeDiscTeamMember(
        req.params.teamId,
        req.params.consultantId
      );
      res.status(204).send();
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ error: "Failed to remove team member" });
    }
  }
);

// ==========================================
// DiSC TEAM ANALYSIS
// ==========================================

router.post("/teams/:teamId/analyze", async (req: Request, res: Response) => {
  try {
    const team = await discStorage.getDiscTeam(req.params.teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Prepare members for analysis
    const members = team.assignments.map((a: any) => ({
      id: a.consultant.id,
      firstName: a.consultant.user?.firstName || "Unknown",
      lastName: a.consultant.user?.lastName || "",
      discAssessment: a.consultant.discAssessment,
    }));

    // Run analysis
    const analysisResult = await analyzeTeam(members);

    // Save analysis to database
    const savedAnalysis = await discStorage.createDiscTeamAnalysis({
      teamId: req.params.teamId,
      overallScore: analysisResult.overallScore,
      styleDistribution: analysisResult.styleDistribution,
      compatibilityMatrix: analysisResult.compatibilityMatrix,
      strengths: analysisResult.strengths,
      risks: analysisResult.risks,
      recommendations: analysisResult.recommendations,
      flagsTriggered: analysisResult.flagsTriggered,
    });

    // Also get suggested roles
    const suggestedRoles = getSuggestedRoles(members);

    res.json({
      analysis: savedAnalysis,
      result: analysisResult,
      suggestedRoles,
    });
  } catch (error) {
    console.error("Error analyzing team:", error);
    res.status(500).json({ error: "Failed to analyze team" });
  }
});

router.get(
  "/teams/:teamId/analyses",
  async (req: Request, res: Response) => {
    try {
      const analyses = await discStorage.getDiscTeamAnalyses(req.params.teamId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching team analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  }
);

// ==========================================
// DiSC COMPATIBILITY RULES
// ==========================================

router.get("/rules", async (req: Request, res: Response) => {
  try {
    const rules = await discStorage.getDiscCompatibilityRules();
    res.json(rules);
  } catch (error) {
    console.error("Error fetching compatibility rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

router.get("/rules/:id", async (req: Request, res: Response) => {
  try {
    const rule = await discStorage.getDiscCompatibilityRule(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (error) {
    console.error("Error fetching compatibility rule:", error);
    res.status(500).json({ error: "Failed to fetch rule" });
  }
});

router.post("/rules", async (req: Request, res: Response) => {
  try {
    const data = insertDiscCompatibilityRuleSchema.parse(req.body);
    const rule = await discStorage.createDiscCompatibilityRule(data);
    res.status(201).json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating compatibility rule:", error);
    res.status(500).json({ error: "Failed to create rule" });
  }
});

router.put("/rules/:id", async (req: Request, res: Response) => {
  try {
    const data = insertDiscCompatibilityRuleSchema.partial().parse(req.body);
    const rule = await discStorage.updateDiscCompatibilityRule(
      req.params.id,
      data
    );
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    res.json(rule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating compatibility rule:", error);
    res.status(500).json({ error: "Failed to update rule" });
  }
});

router.delete("/rules/:id", async (req: Request, res: Response) => {
  try {
    await discStorage.deleteDiscCompatibilityRule(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting compatibility rule:", error);
    res.status(500).json({ error: "Failed to delete rule" });
  }
});

// ==========================================
// SEED DATA (Admin only)
// ==========================================

router.post("/seed", async (req: Request, res: Response) => {
  try {
    await seedDiscData();
    res.json({ success: true, message: "DiSC data seeded successfully" });
  } catch (error) {
    console.error("Error seeding DiSC data:", error);
    res.status(500).json({ error: "Failed to seed data" });
  }
});

export default router;
