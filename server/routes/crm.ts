import { Router, Request, Response } from "express";
import { db } from "../db";
import {
  crmContacts, crmCompanies, crmDeals, crmPipelines, crmPipelineStages, crmActivities,
  insertCrmContactSchema, insertCrmCompanySchema, insertCrmDealSchema,
  insertCrmPipelineSchema, insertCrmPipelineStageSchema, insertCrmActivitySchema
} from "../../shared/schema";
import { eq, desc, asc, and, or, ilike, sql, count } from "drizzle-orm";

const router = Router();

// ============================================================================
// CRM DASHBOARD
// ============================================================================

// GET /api/crm/dashboard - Get CRM dashboard stats
router.get("/crm/dashboard", async (req: Request, res: Response) => {
  try {
    // Get counts
    const [contactsCount] = await db.select({ count: count() }).from(crmContacts);
    const [companiesCount] = await db.select({ count: count() }).from(crmCompanies);
    const [dealsCount] = await db.select({ count: count() }).from(crmDeals).where(eq(crmDeals.status, "open"));

    // Get pipeline value
    const [pipelineValue] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(crmDeals)
      .where(eq(crmDeals.status, "open"));

    // Get recent activities
    const recentActivities = await db
      .select()
      .from(crmActivities)
      .orderBy(desc(crmActivities.createdAt))
      .limit(10);

    // Get deals by stage
    const dealsByStage = await db
      .select({
        stageId: crmDeals.stageId,
        count: count(),
        totalValue: sql<string>`COALESCE(SUM(amount), 0)`
      })
      .from(crmDeals)
      .where(eq(crmDeals.status, "open"))
      .groupBy(crmDeals.stageId);

    res.json({
      stats: {
        totalContacts: contactsCount.count,
        totalCompanies: companiesCount.count,
        openDeals: dealsCount.count,
        pipelineValue: pipelineValue.total
      },
      recentActivities,
      dealsByStage
    });
  } catch (error) {
    console.error("[CRM] Dashboard error:", error);
    res.status(500).json({ error: "Failed to load CRM dashboard" });
  }
});

// ============================================================================
// CONTACTS
// ============================================================================

// GET /api/crm/contacts - List all contacts
router.get("/crm/contacts", async (req: Request, res: Response) => {
  try {
    const { search, type, status, ownerId, companyId, limit = "50", offset = "0" } = req.query;

    let query = db.select().from(crmContacts);
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(crmContacts.firstName, `%${search}%`),
          ilike(crmContacts.lastName, `%${search}%`),
          ilike(crmContacts.email, `%${search}%`),
          ilike(crmContacts.fullName, `%${search}%`)
        )
      );
    }
    if (type) conditions.push(eq(crmContacts.type, type as any));
    if (status) conditions.push(eq(crmContacts.status, status as any));
    if (ownerId) conditions.push(eq(crmContacts.ownerId, ownerId as string));
    if (companyId) conditions.push(eq(crmContacts.companyId, companyId as string));

    // Exclude soft-deleted
    conditions.push(sql`${crmContacts.deletedAt} IS NULL`);

    const contacts = await db
      .select()
      .from(crmContacts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(crmContacts.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(contacts);
  } catch (error) {
    console.error("[CRM] List contacts error:", error);
    res.status(500).json({ error: "Failed to list contacts" });
  }
});

// GET /api/crm/contacts/:id - Get single contact
router.get("/crm/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [contact] = await db.select().from(crmContacts).where(eq(crmContacts.id, id));

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Get company if exists
    let company = null;
    if (contact.companyId) {
      const [comp] = await db.select().from(crmCompanies).where(eq(crmCompanies.id, contact.companyId));
      company = comp;
    }

    // Get recent activities
    const activities = await db
      .select()
      .from(crmActivities)
      .where(eq(crmActivities.contactId, id))
      .orderBy(desc(crmActivities.createdAt))
      .limit(20);

    // Get deals
    const deals = await db
      .select()
      .from(crmDeals)
      .where(eq(crmDeals.primaryContactId, id))
      .orderBy(desc(crmDeals.createdAt));

    res.json({ ...contact, company, activities, deals });
  } catch (error) {
    console.error("[CRM] Get contact error:", error);
    res.status(500).json({ error: "Failed to get contact" });
  }
});

// POST /api/crm/contacts - Create contact
router.post("/crm/contacts", async (req: Request, res: Response) => {
  try {
    const data = insertCrmContactSchema.parse(req.body);

    // Generate full name
    const fullName = `${data.firstName} ${data.lastName}`;

    const [contact] = await db
      .insert(crmContacts)
      .values({ ...data, fullName })
      .returning();

    res.status(201).json(contact);
  } catch (error) {
    console.error("[CRM] Create contact error:", error);
    res.status(500).json({ error: "Failed to create contact" });
  }
});

// PATCH /api/crm/contacts/:id - Update contact
router.patch("/crm/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update full name if first/last name changed
    if (updates.firstName || updates.lastName) {
      const [existing] = await db.select().from(crmContacts).where(eq(crmContacts.id, id));
      if (existing) {
        updates.fullName = `${updates.firstName || existing.firstName} ${updates.lastName || existing.lastName}`;
      }
    }

    updates.updatedAt = new Date();

    const [contact] = await db
      .update(crmContacts)
      .set(updates)
      .where(eq(crmContacts.id, id))
      .returning();

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("[CRM] Update contact error:", error);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// DELETE /api/crm/contacts/:id - Soft delete contact
router.delete("/crm/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [contact] = await db
      .update(crmContacts)
      .set({ deletedAt: new Date() })
      .where(eq(crmContacts.id, id))
      .returning();

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json({ message: "Contact deleted", contact });
  } catch (error) {
    console.error("[CRM] Delete contact error:", error);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

// ============================================================================
// COMPANIES
// ============================================================================

// GET /api/crm/companies - List all companies
router.get("/crm/companies", async (req: Request, res: Response) => {
  try {
    const { search, type, status, industry, limit = "50", offset = "0" } = req.query;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(crmCompanies.name, `%${search}%`),
          ilike(crmCompanies.domain, `%${search}%`)
        )
      );
    }
    if (type) conditions.push(eq(crmCompanies.type, type as any));
    if (status) conditions.push(eq(crmCompanies.status, status as any));
    if (industry) conditions.push(eq(crmCompanies.industry, industry as string));

    const companies = await db
      .select()
      .from(crmCompanies)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(crmCompanies.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(companies);
  } catch (error) {
    console.error("[CRM] List companies error:", error);
    res.status(500).json({ error: "Failed to list companies" });
  }
});

// GET /api/crm/companies/:id - Get single company
router.get("/crm/companies/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [company] = await db.select().from(crmCompanies).where(eq(crmCompanies.id, id));

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get contacts at company
    const contacts = await db
      .select()
      .from(crmContacts)
      .where(and(
        eq(crmContacts.companyId, id),
        sql`${crmContacts.deletedAt} IS NULL`
      ))
      .orderBy(desc(crmContacts.createdAt));

    // Get deals
    const deals = await db
      .select()
      .from(crmDeals)
      .where(eq(crmDeals.companyId, id))
      .orderBy(desc(crmDeals.createdAt));

    // Get activities
    const activities = await db
      .select()
      .from(crmActivities)
      .where(eq(crmActivities.companyId, id))
      .orderBy(desc(crmActivities.createdAt))
      .limit(20);

    res.json({ ...company, contacts, deals, activities });
  } catch (error) {
    console.error("[CRM] Get company error:", error);
    res.status(500).json({ error: "Failed to get company" });
  }
});

// POST /api/crm/companies - Create company
router.post("/crm/companies", async (req: Request, res: Response) => {
  try {
    const data = insertCrmCompanySchema.parse(req.body);

    // Extract domain from website if not provided
    if (!data.domain && data.website) {
      try {
        const url = new URL(data.website.startsWith('http') ? data.website : `https://${data.website}`);
        data.domain = url.hostname.replace('www.', '');
      } catch (e) {
        // Ignore URL parsing errors
      }
    }

    const [company] = await db
      .insert(crmCompanies)
      .values(data)
      .returning();

    res.status(201).json(company);
  } catch (error) {
    console.error("[CRM] Create company error:", error);
    res.status(500).json({ error: "Failed to create company" });
  }
});

// PATCH /api/crm/companies/:id - Update company
router.patch("/crm/companies/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    const [company] = await db
      .update(crmCompanies)
      .set(updates)
      .where(eq(crmCompanies.id, id))
      .returning();

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    console.error("[CRM] Update company error:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

// DELETE /api/crm/companies/:id - Delete company
router.delete("/crm/companies/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [company] = await db
      .delete(crmCompanies)
      .where(eq(crmCompanies.id, id))
      .returning();

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ message: "Company deleted", company });
  } catch (error) {
    console.error("[CRM] Delete company error:", error);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

// ============================================================================
// PIPELINES
// ============================================================================

// GET /api/crm/pipelines - List all pipelines
router.get("/crm/pipelines", async (req: Request, res: Response) => {
  try {
    const pipelines = await db
      .select()
      .from(crmPipelines)
      .where(eq(crmPipelines.isActive, true))
      .orderBy(asc(crmPipelines.name));

    // Get stages for each pipeline
    const pipelinesWithStages = await Promise.all(
      pipelines.map(async (pipeline: typeof crmPipelines.$inferSelect) => {
        const stages = await db
          .select()
          .from(crmPipelineStages)
          .where(eq(crmPipelineStages.pipelineId, pipeline.id))
          .orderBy(asc(crmPipelineStages.order));
        return { ...pipeline, stages };
      })
    );

    res.json(pipelinesWithStages);
  } catch (error) {
    console.error("[CRM] List pipelines error:", error);
    res.status(500).json({ error: "Failed to list pipelines" });
  }
});

// POST /api/crm/pipelines - Create pipeline
router.post("/crm/pipelines", async (req: Request, res: Response) => {
  try {
    const data = insertCrmPipelineSchema.parse(req.body);

    const [pipeline] = await db
      .insert(crmPipelines)
      .values(data)
      .returning();

    res.status(201).json(pipeline);
  } catch (error) {
    console.error("[CRM] Create pipeline error:", error);
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

// POST /api/crm/pipelines/:id/stages - Create stage in pipeline
router.post("/crm/pipelines/:id/stages", async (req: Request, res: Response) => {
  try {
    const { id: pipelineId } = req.params;
    const data = insertCrmPipelineStageSchema.parse({ ...req.body, pipelineId });

    const [stage] = await db
      .insert(crmPipelineStages)
      .values(data)
      .returning();

    res.status(201).json(stage);
  } catch (error) {
    console.error("[CRM] Create stage error:", error);
    res.status(500).json({ error: "Failed to create stage" });
  }
});

// POST /api/crm/pipelines/seed-default - Seed default sales pipeline
router.post("/crm/pipelines/seed-default", async (req: Request, res: Response) => {
  try {
    // Check if default pipeline exists
    const [existing] = await db
      .select()
      .from(crmPipelines)
      .where(eq(crmPipelines.isDefault, true));

    if (existing) {
      return res.json({ message: "Default pipeline already exists", pipeline: existing });
    }

    // Create default sales pipeline
    const [pipeline] = await db
      .insert(crmPipelines)
      .values({
        name: "Sales Pipeline",
        description: "Default sales pipeline for tracking deals",
        type: "sales",
        isDefault: true,
        isActive: true,
        dealRottingDays: 14
      })
      .returning();

    // Create default stages
    const defaultStages = [
      { name: "Lead", order: 1, probability: 10, stageType: "open" as const, color: "#94a3b8" },
      { name: "Qualified", order: 2, probability: 25, stageType: "open" as const, color: "#60a5fa" },
      { name: "Proposal", order: 3, probability: 50, stageType: "open" as const, color: "#a78bfa" },
      { name: "Negotiation", order: 4, probability: 75, stageType: "open" as const, color: "#fbbf24" },
      { name: "Closed Won", order: 5, probability: 100, stageType: "won" as const, color: "#22c55e" },
      { name: "Closed Lost", order: 6, probability: 0, stageType: "lost" as const, color: "#ef4444" }
    ];

    const stages = await Promise.all(
      defaultStages.map(stage =>
        db.insert(crmPipelineStages)
          .values({ ...stage, pipelineId: pipeline.id })
          .returning()
      )
    );

    res.status(201).json({
      message: "Default pipeline created",
      pipeline: { ...pipeline, stages: stages.map(s => s[0]) }
    });
  } catch (error) {
    console.error("[CRM] Seed pipeline error:", error);
    res.status(500).json({ error: "Failed to seed default pipeline" });
  }
});

// ============================================================================
// DEALS
// ============================================================================

// GET /api/crm/deals - List all deals
router.get("/crm/deals", async (req: Request, res: Response) => {
  try {
    const { pipelineId, stageId, status, ownerId, companyId, limit = "100", offset = "0" } = req.query;

    const conditions = [];

    if (pipelineId) conditions.push(eq(crmDeals.pipelineId, pipelineId as string));
    if (stageId) conditions.push(eq(crmDeals.stageId, stageId as string));
    if (status) conditions.push(eq(crmDeals.status, status as any));
    if (ownerId) conditions.push(eq(crmDeals.ownerId, ownerId as string));
    if (companyId) conditions.push(eq(crmDeals.companyId, companyId as string));

    const deals = await db
      .select()
      .from(crmDeals)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(crmDeals.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(deals);
  } catch (error) {
    console.error("[CRM] List deals error:", error);
    res.status(500).json({ error: "Failed to list deals" });
  }
});

// GET /api/crm/deals/:id - Get single deal
router.get("/crm/deals/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [deal] = await db.select().from(crmDeals).where(eq(crmDeals.id, id));

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    // Get company
    let company = null;
    if (deal.companyId) {
      const [comp] = await db.select().from(crmCompanies).where(eq(crmCompanies.id, deal.companyId));
      company = comp;
    }

    // Get primary contact
    let primaryContact = null;
    if (deal.primaryContactId) {
      const [contact] = await db.select().from(crmContacts).where(eq(crmContacts.id, deal.primaryContactId));
      primaryContact = contact;
    }

    // Get stage
    const [stage] = await db.select().from(crmPipelineStages).where(eq(crmPipelineStages.id, deal.stageId));

    // Get activities
    const activities = await db
      .select()
      .from(crmActivities)
      .where(eq(crmActivities.dealId, id))
      .orderBy(desc(crmActivities.createdAt))
      .limit(20);

    res.json({ ...deal, company, primaryContact, stage, activities });
  } catch (error) {
    console.error("[CRM] Get deal error:", error);
    res.status(500).json({ error: "Failed to get deal" });
  }
});

// POST /api/crm/deals - Create deal
router.post("/crm/deals", async (req: Request, res: Response) => {
  try {
    const data = insertCrmDealSchema.parse(req.body);

    // Calculate weighted amount
    if (data.amount && data.probability) {
      data.weightedAmount = (parseFloat(data.amount as string) * (data.probability / 100)).toString();
    }

    const [deal] = await db
      .insert(crmDeals)
      .values(data)
      .returning();

    res.status(201).json(deal);
  } catch (error) {
    console.error("[CRM] Create deal error:", error);
    res.status(500).json({ error: "Failed to create deal" });
  }
});

// PATCH /api/crm/deals/:id - Update deal
router.patch("/crm/deals/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    // Track stage change
    if (updates.stageId) {
      const [existing] = await db.select().from(crmDeals).where(eq(crmDeals.id, id));
      if (existing && existing.stageId !== updates.stageId) {
        updates.previousStageId = existing.stageId;
        updates.stageEnteredAt = new Date();
      }
    }

    // Recalculate weighted amount
    if (updates.amount || updates.probability) {
      const [existing] = await db.select().from(crmDeals).where(eq(crmDeals.id, id));
      if (existing) {
        const amount = updates.amount || existing.amount;
        const probability = updates.probability ?? existing.probability;
        if (amount && probability !== undefined) {
          updates.weightedAmount = (parseFloat(amount as string) * (probability / 100)).toString();
        }
      }
    }

    // Update status timestamps
    if (updates.status === "won" || updates.status === "lost") {
      updates.closedAt = new Date();
      updates.actualCloseDate = new Date();
    }

    const [deal] = await db
      .update(crmDeals)
      .set(updates)
      .where(eq(crmDeals.id, id))
      .returning();

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    res.json(deal);
  } catch (error) {
    console.error("[CRM] Update deal error:", error);
    res.status(500).json({ error: "Failed to update deal" });
  }
});

// DELETE /api/crm/deals/:id - Delete deal
router.delete("/crm/deals/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deal] = await db
      .delete(crmDeals)
      .where(eq(crmDeals.id, id))
      .returning();

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    res.json({ message: "Deal deleted", deal });
  } catch (error) {
    console.error("[CRM] Delete deal error:", error);
    res.status(500).json({ error: "Failed to delete deal" });
  }
});

// ============================================================================
// ACTIVITIES
// ============================================================================

// GET /api/crm/activities - List activities
router.get("/crm/activities", async (req: Request, res: Response) => {
  try {
    const { contactId, companyId, dealId, type, limit = "50", offset = "0" } = req.query;

    const conditions = [];

    if (contactId) conditions.push(eq(crmActivities.contactId, contactId as string));
    if (companyId) conditions.push(eq(crmActivities.companyId, companyId as string));
    if (dealId) conditions.push(eq(crmActivities.dealId, dealId as string));
    if (type) conditions.push(eq(crmActivities.type, type as any));

    const activities = await db
      .select()
      .from(crmActivities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(crmActivities.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(activities);
  } catch (error) {
    console.error("[CRM] List activities error:", error);
    res.status(500).json({ error: "Failed to list activities" });
  }
});

// POST /api/crm/activities - Create activity
router.post("/crm/activities", async (req: Request, res: Response) => {
  try {
    const data = insertCrmActivitySchema.parse(req.body);

    const [activity] = await db
      .insert(crmActivities)
      .values(data)
      .returning();

    // Update last activity on contact/company/deal
    if (data.contactId) {
      await db.update(crmContacts)
        .set({ lastActivityAt: new Date(), totalInteractions: sql`${crmContacts.totalInteractions} + 1` })
        .where(eq(crmContacts.id, data.contactId));
    }
    if (data.companyId) {
      await db.update(crmCompanies)
        .set({ lastActivityAt: new Date() })
        .where(eq(crmCompanies.id, data.companyId));
    }

    res.status(201).json(activity);
  } catch (error) {
    console.error("[CRM] Create activity error:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// PATCH /api/crm/activities/:id - Update activity (e.g., mark complete)
router.patch("/crm/activities/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    const [activity] = await db
      .update(crmActivities)
      .set(updates)
      .where(eq(crmActivities.id, id))
      .returning();

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(activity);
  } catch (error) {
    console.error("[CRM] Update activity error:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

export default router;
