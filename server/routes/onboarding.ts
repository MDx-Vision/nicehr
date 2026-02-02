import { Router, Request, Response } from "express";
import { db } from "../db";
import {
  onboardingTasks, onboardingTemplates, consultants, documentTypes, consultantDocuments, users,
  insertOnboardingTaskSchema, insertOnboardingTemplateSchema,
  OnboardingTask, OnboardingTemplate
} from "../../shared/schema";
import { eq, desc, asc, and, sql, count } from "drizzle-orm";

// Type for tasks with joined document type info
interface TaskWithDocType {
  id: string;
  taskType: string;
  title: string;
  description: string | null;
  documentTypeId: string | null;
  isRequired: boolean;
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected";
  phase: number;
  phaseName: string | null;
  dueDate: string | null;
  dueDays: number | null;
  submittedAt: Date | null;
  submittedDocumentId: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  instructions: string | null;
  formUrl: string | null;
  orderIndex: number;
  documentType: {
    id: string;
    name: string;
    category: string;
  } | null;
}

const router = Router();

// ============================================================================
// ONBOARDING TEMPLATES
// ============================================================================

// GET /api/onboarding/templates - List all onboarding templates
router.get("/onboarding/templates", async (req: Request, res: Response) => {
  try {
    const templates = await db
      .select({
        id: onboardingTemplates.id,
        documentTypeId: onboardingTemplates.documentTypeId,
        taskType: onboardingTemplates.taskType,
        title: onboardingTemplates.title,
        description: onboardingTemplates.description,
        phase: onboardingTemplates.phase,
        phaseName: onboardingTemplates.phaseName,
        orderIndex: onboardingTemplates.orderIndex,
        isRequired: onboardingTemplates.isRequired,
        dueDays: onboardingTemplates.dueDays,
        instructions: onboardingTemplates.instructions,
        formUrl: onboardingTemplates.formUrl,
        isActive: onboardingTemplates.isActive,
        createdAt: onboardingTemplates.createdAt,
        documentType: {
          id: documentTypes.id,
          name: documentTypes.name,
          category: documentTypes.category,
        },
      })
      .from(onboardingTemplates)
      .leftJoin(documentTypes, eq(onboardingTemplates.documentTypeId, documentTypes.id))
      .where(eq(onboardingTemplates.isActive, true))
      .orderBy(asc(onboardingTemplates.phase), asc(onboardingTemplates.orderIndex));

    res.json(templates);
  } catch (error) {
    console.error("[Onboarding] Templates list error:", error);
    res.status(500).json({ error: "Failed to load onboarding templates" });
  }
});

// POST /api/onboarding/templates - Create a new template
router.post("/onboarding/templates", async (req: Request, res: Response) => {
  try {
    const data = insertOnboardingTemplateSchema.parse(req.body);
    const [template] = await db.insert(onboardingTemplates).values(data).returning();
    res.status(201).json(template);
  } catch (error) {
    console.error("[Onboarding] Template create error:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// ============================================================================
// ONBOARDING TASKS
// ============================================================================

// GET /api/onboarding/tasks - List tasks (optionally by consultant)
router.get("/onboarding/tasks", async (req: Request, res: Response) => {
  try {
    const { consultantId, status, phase } = req.query;
    const conditions = [];

    if (consultantId) {
      conditions.push(eq(onboardingTasks.consultantId, consultantId as string));
    }
    if (status) {
      conditions.push(eq(onboardingTasks.status, status as any));
    }
    if (phase) {
      conditions.push(eq(onboardingTasks.phase, parseInt(phase as string)));
    }

    const tasks = await db
      .select({
        id: onboardingTasks.id,
        consultantId: onboardingTasks.consultantId,
        taskType: onboardingTasks.taskType,
        title: onboardingTasks.title,
        description: onboardingTasks.description,
        documentTypeId: onboardingTasks.documentTypeId,
        isRequired: onboardingTasks.isRequired,
        status: onboardingTasks.status,
        phase: onboardingTasks.phase,
        phaseName: onboardingTasks.phaseName,
        dueDate: onboardingTasks.dueDate,
        dueDays: onboardingTasks.dueDays,
        submittedAt: onboardingTasks.submittedAt,
        submittedDocumentId: onboardingTasks.submittedDocumentId,
        reviewedBy: onboardingTasks.reviewedBy,
        reviewedAt: onboardingTasks.reviewedAt,
        rejectionReason: onboardingTasks.rejectionReason,
        instructions: onboardingTasks.instructions,
        orderIndex: onboardingTasks.orderIndex,
        createdAt: onboardingTasks.createdAt,
        documentType: {
          id: documentTypes.id,
          name: documentTypes.name,
          category: documentTypes.category,
        },
      })
      .from(onboardingTasks)
      .leftJoin(documentTypes, eq(onboardingTasks.documentTypeId, documentTypes.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(onboardingTasks.phase), asc(onboardingTasks.orderIndex));

    res.json(tasks);
  } catch (error) {
    console.error("[Onboarding] Tasks list error:", error);
    res.status(500).json({ error: "Failed to load onboarding tasks" });
  }
});

// GET /api/onboarding/my-portal - Get current user's onboarding portal (by userId)
router.get("/onboarding/my-portal", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Find consultant by userId
    const [consultant] = await db
      .select()
      .from(consultants)
      .where(eq(consultants.userId, userId))
      .limit(1);

    if (!consultant) {
      return res.status(404).json({ error: "No consultant profile found for this user" });
    }

    // Redirect to the main portal endpoint logic
    req.params.consultantId = consultant.id;
    return getPortalData(req, res, consultant.id);
  } catch (error) {
    console.error("[Onboarding] My portal error:", error);
    res.status(500).json({ error: "Failed to load onboarding portal" });
  }
});

// GET /api/onboarding/portal/:consultantId - Get consultant's onboarding portal view
router.get("/onboarding/portal/:consultantId", async (req: Request, res: Response) => {
  return getPortalData(req, res, req.params.consultantId);
});

// Helper function to get portal data
async function getPortalData(req: Request, res: Response, consultantId: string) {
  try {
    // Get consultant info with user details
    const [consultantData] = await db
      .select({
        id: consultants.id,
        userId: consultants.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(consultants)
      .leftJoin(users, eq(consultants.userId, users.id))
      .where(eq(consultants.id, consultantId))
      .limit(1);

    if (!consultantData) {
      return res.status(404).json({ error: "Consultant not found" });
    }

    // Get all tasks with document type info
    const tasks = await db
      .select({
        id: onboardingTasks.id,
        taskType: onboardingTasks.taskType,
        title: onboardingTasks.title,
        description: onboardingTasks.description,
        documentTypeId: onboardingTasks.documentTypeId,
        isRequired: onboardingTasks.isRequired,
        status: onboardingTasks.status,
        phase: onboardingTasks.phase,
        phaseName: onboardingTasks.phaseName,
        dueDate: onboardingTasks.dueDate,
        dueDays: onboardingTasks.dueDays,
        submittedAt: onboardingTasks.submittedAt,
        submittedDocumentId: onboardingTasks.submittedDocumentId,
        reviewedAt: onboardingTasks.reviewedAt,
        rejectionReason: onboardingTasks.rejectionReason,
        instructions: onboardingTasks.instructions,
        formUrl: onboardingTasks.formUrl,
        orderIndex: onboardingTasks.orderIndex,
        documentType: {
          id: documentTypes.id,
          name: documentTypes.name,
          category: documentTypes.category,
        },
      })
      .from(onboardingTasks)
      .leftJoin(documentTypes, eq(onboardingTasks.documentTypeId, documentTypes.id))
      .where(eq(onboardingTasks.consultantId, consultantId))
      .orderBy(asc(onboardingTasks.phase), asc(onboardingTasks.orderIndex)) as unknown as TaskWithDocType[];

    // Organize tasks by phase
    const phases = [
      { phase: 1, name: "Personal Information", description: "Basic profile and contact information", dueDays: 1 },
      { phase: 2, name: "Legal Agreements", description: "Employment agreements and policies", dueDays: 3 },
      { phase: 3, name: "Background & Compliance", description: "Background check and compliance documents", dueDays: 7 },
      { phase: 4, name: "Credentials", description: "Professional credentials and certifications", dueDays: 14 },
      { phase: 5, name: "Immunizations", description: "Required immunizations and health records", dueDays: 30 },
    ];

    const phaseData = phases.map((phase) => {
      const phaseTasks = tasks.filter((t) => t.phase === phase.phase);
      const completedCount = phaseTasks.filter((t) => t.status === "approved").length;
      const totalCount = phaseTasks.length;
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        ...phase,
        tasks: phaseTasks,
        progress,
        completedCount,
        totalCount,
        isComplete: completedCount === totalCount && totalCount > 0,
      };
    });

    // Calculate overall progress
    const allTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "approved").length;
    const overallProgress = allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0;

    res.json({
      consultant: {
        id: consultantData.id,
        firstName: consultantData.firstName,
        lastName: consultantData.lastName,
        email: consultantData.email,
      },
      phases: phaseData,
      summary: {
        totalTasks: allTasks,
        completedTasks,
        pendingTasks: allTasks - completedTasks,
        overallProgress,
      },
    });
  } catch (error) {
    console.error("[Onboarding] Portal error:", error);
    res.status(500).json({ error: "Failed to load onboarding portal" });
  }
}

// POST /api/onboarding/generate/:consultantId - Generate tasks from templates
router.post("/onboarding/generate/:consultantId", async (req: Request, res: Response) => {
  try {
    const { consultantId } = req.params;

    // Check if consultant exists
    const [consultant] = await db
      .select()
      .from(consultants)
      .where(eq(consultants.id, consultantId))
      .limit(1);

    if (!consultant) {
      return res.status(404).json({ error: "Consultant not found" });
    }

    // Check if tasks already exist
    const existingTasks = await db
      .select({ count: count() })
      .from(onboardingTasks)
      .where(eq(onboardingTasks.consultantId, consultantId));

    if (existingTasks[0].count > 0) {
      return res.status(400).json({ error: "Onboarding tasks already exist for this consultant" });
    }

    // Get all active templates
    const templates = await db
      .select()
      .from(onboardingTemplates)
      .where(eq(onboardingTemplates.isActive, true))
      .orderBy(asc(onboardingTemplates.phase), asc(onboardingTemplates.orderIndex));

    // Calculate due dates based on current date (consultants don't have a startDate field)
    const startDate = new Date();

    // Create tasks from templates
    const tasksToInsert = templates.map((template: OnboardingTemplate) => {
      const dueDate = new Date(startDate);
      if (template.dueDays) {
        dueDate.setDate(dueDate.getDate() + template.dueDays);
      }

      return {
        consultantId,
        taskType: template.taskType,
        title: template.title,
        description: template.description,
        documentTypeId: template.documentTypeId,
        isRequired: template.isRequired,
        status: "pending" as const,
        phase: template.phase,
        phaseName: template.phaseName,
        dueDate: dueDate.toISOString().split("T")[0],
        dueDays: template.dueDays,
        instructions: template.instructions,
        formUrl: template.formUrl,
        orderIndex: template.orderIndex,
      };
    });

    if (tasksToInsert.length === 0) {
      return res.status(400).json({ error: "No onboarding templates configured" });
    }

    const createdTasks = await db.insert(onboardingTasks).values(tasksToInsert).returning();

    res.status(201).json({
      message: `Generated ${createdTasks.length} onboarding tasks`,
      tasks: createdTasks,
    });
  } catch (error) {
    console.error("[Onboarding] Generate tasks error:", error);
    res.status(500).json({ error: "Failed to generate onboarding tasks" });
  }
});

// POST /api/onboarding/regenerate/:consultantId - Delete and regenerate tasks from templates
router.post("/onboarding/regenerate/:consultantId", async (req: Request, res: Response) => {
  try {
    const { consultantId } = req.params;

    // Check if consultant exists
    const [consultant] = await db
      .select()
      .from(consultants)
      .where(eq(consultants.id, consultantId))
      .limit(1);

    if (!consultant) {
      return res.status(404).json({ error: "Consultant not found" });
    }

    // Delete existing tasks
    await db.delete(onboardingTasks).where(eq(onboardingTasks.consultantId, consultantId));

    // Get all active templates
    const templates = await db
      .select()
      .from(onboardingTemplates)
      .where(eq(onboardingTemplates.isActive, true))
      .orderBy(asc(onboardingTemplates.phase), asc(onboardingTemplates.orderIndex));

    // Calculate due dates based on current date
    const startDate = new Date();

    // Create tasks from templates
    const tasksToInsert = templates.map((template: OnboardingTemplate) => {
      const dueDate = new Date(startDate);
      if (template.dueDays) {
        dueDate.setDate(dueDate.getDate() + template.dueDays);
      }

      return {
        consultantId,
        taskType: template.taskType,
        title: template.title,
        description: template.description,
        documentTypeId: template.documentTypeId,
        isRequired: template.isRequired,
        status: "pending" as const,
        phase: template.phase,
        phaseName: template.phaseName,
        dueDate: dueDate.toISOString().split("T")[0],
        dueDays: template.dueDays,
        instructions: template.instructions,
        formUrl: template.formUrl,
        orderIndex: template.orderIndex,
      };
    });

    if (tasksToInsert.length === 0) {
      return res.status(400).json({ error: "No onboarding templates configured" });
    }

    const createdTasks = await db.insert(onboardingTasks).values(tasksToInsert).returning();

    res.status(201).json({
      message: `Regenerated ${createdTasks.length} onboarding tasks`,
      tasks: createdTasks,
    });
  } catch (error) {
    console.error("[Onboarding] Regenerate tasks error:", error);
    res.status(500).json({ error: "Failed to regenerate onboarding tasks" });
  }
});

// PATCH /api/onboarding/tasks/:id - Update task status
router.patch("/onboarding/tasks/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, submittedDocumentId, reviewedBy, rejectionReason } = req.body;

    const updateData: any = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (status === "submitted" || status === "pending_review") {
        updateData.submittedAt = new Date();
      }
      if (status === "approved" || status === "rejected") {
        updateData.reviewedAt = new Date();
        if (reviewedBy) updateData.reviewedBy = reviewedBy;
      }
    }
    if (submittedDocumentId) updateData.submittedDocumentId = submittedDocumentId;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;

    const [updated] = await db
      .update(onboardingTasks)
      .set(updateData)
      .where(eq(onboardingTasks.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("[Onboarding] Update task error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// POST /api/onboarding/tasks/:id/submit - Submit a document for a task
router.post("/onboarding/tasks/:id/submit", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { documentId } = req.body;

    // Get the task
    const [task] = await db
      .select()
      .from(onboardingTasks)
      .where(eq(onboardingTasks.id, id))
      .limit(1);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update task with submitted document
    const [updated] = await db
      .update(onboardingTasks)
      .set({
        status: "submitted",
        submittedDocumentId: documentId,
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(onboardingTasks.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Onboarding] Submit task error:", error);
    res.status(500).json({ error: "Failed to submit task" });
  }
});

// GET /api/onboarding/summary - Get onboarding summary statistics
router.get("/onboarding/summary", async (req: Request, res: Response) => {
  try {
    // Get overall stats
    const [totalStats] = await db
      .select({
        total: count(),
        pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending')`,
        inProgress: sql<number>`COUNT(*) FILTER (WHERE status = 'in_progress')`,
        pendingReview: sql<number>`COUNT(*) FILTER (WHERE status = 'pending_review')`,
        approved: sql<number>`COUNT(*) FILTER (WHERE status = 'approved')`,
        rejected: sql<number>`COUNT(*) FILTER (WHERE status = 'rejected')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
      })
      .from(onboardingTasks);

    // Get consultant breakdown
    const consultantStats = await db
      .select({
        consultantId: onboardingTasks.consultantId,
        totalTasks: count(),
        completedTasks: sql<number>`COUNT(*) FILTER (WHERE status IN ('completed', 'approved'))`,
      })
      .from(onboardingTasks)
      .groupBy(onboardingTasks.consultantId);

    res.json({
      overall: totalStats,
      byConsultant: consultantStats,
    });
  } catch (error) {
    console.error("[Onboarding] Summary error:", error);
    res.status(500).json({ error: "Failed to load onboarding summary" });
  }
});

export default router;
