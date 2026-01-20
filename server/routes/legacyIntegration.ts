import { Router, Request, Response } from "express";
import { db } from "../db";
import {
  integrationSources, fieldMappings, syncHistory, integrationRecords,
  insertIntegrationSourceSchema, insertFieldMappingSchema, insertSyncHistorySchema, insertIntegrationRecordSchema
} from "../../shared/schema";
import { eq, desc, and, or, ilike, sql, count, isNull } from "drizzle-orm";

const router = Router();

// ============================================================================
// INTEGRATION DASHBOARD
// ============================================================================

// GET /api/integrations/dashboard - Get integration dashboard stats
router.get("/integrations/dashboard", async (req: Request, res: Response) => {
  try {
    // Get counts by system type
    const systemCounts = await db
      .select({
        systemType: integrationSources.systemType,
        count: count(),
        activeCount: sql<number>`SUM(CASE WHEN ${integrationSources.status} = 'active' THEN 1 ELSE 0 END)`
      })
      .from(integrationSources)
      .where(isNull(integrationSources.deletedAt))
      .groupBy(integrationSources.systemType);

    // Get total record counts
    const [recordCounts] = await db
      .select({
        total: count(),
        synced: sql<number>`SUM(CASE WHEN ${integrationRecords.syncStatus} = 'completed' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${integrationRecords.syncStatus} = 'pending' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN ${integrationRecords.syncStatus} = 'failed' THEN 1 ELSE 0 END)`
      })
      .from(integrationRecords);

    // Get mapping stats
    const [mappingStats] = await db
      .select({
        total: count(),
        validated: sql<number>`SUM(CASE WHEN ${fieldMappings.status} = 'validated' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${fieldMappings.status} = 'pending' THEN 1 ELSE 0 END)`
      })
      .from(fieldMappings);

    // Get recent sync history
    const recentSyncs = await db
      .select()
      .from(syncHistory)
      .orderBy(desc(syncHistory.syncStartedAt))
      .limit(10);

    // Get data freshness (avg time since last sync)
    const [freshness] = await db
      .select({
        avgHoursSinceSync: sql<number>`AVG(EXTRACT(EPOCH FROM (NOW() - ${integrationSources.lastSyncAt})) / 3600)`
      })
      .from(integrationSources)
      .where(and(
        isNull(integrationSources.deletedAt),
        eq(integrationSources.status, "active")
      ));

    res.json({
      systemCounts,
      records: recordCounts || { total: 0, synced: 0, pending: 0, failed: 0 },
      mappings: mappingStats || { total: 0, validated: 0, pending: 0 },
      recentSyncs,
      dataFreshness: {
        avgHoursSinceSync: freshness?.avgHoursSinceSync || null
      }
    });
  } catch (error) {
    console.error("[Integrations] Dashboard error:", error);
    res.status(500).json({ error: "Failed to load integration dashboard" });
  }
});

// ============================================================================
// INTEGRATION SOURCES
// ============================================================================

// GET /api/integrations - List all integration sources
router.get("/integrations", async (req: Request, res: Response) => {
  try {
    const { search, systemType, status, projectId, hospitalId, limit = "50", offset = "0" } = req.query;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(integrationSources.name, `%${search}%`),
          ilike(integrationSources.description, `%${search}%`)
        )
      );
    }
    if (systemType) conditions.push(eq(integrationSources.systemType, systemType as any));
    if (status) conditions.push(eq(integrationSources.status, status as any));
    if (projectId) conditions.push(eq(integrationSources.projectId, projectId as string));
    if (hospitalId) conditions.push(eq(integrationSources.hospitalId, hospitalId as string));

    // Exclude soft-deleted
    conditions.push(isNull(integrationSources.deletedAt));

    const sources = await db
      .select()
      .from(integrationSources)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(integrationSources.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(sources);
  } catch (error) {
    console.error("[Integrations] List sources error:", error);
    res.status(500).json({ error: "Failed to list integration sources" });
  }
});

// GET /api/integrations/:id - Get single integration source with related data
router.get("/integrations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [source] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));

    if (!source) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    // Get field mappings
    const mappings = await db
      .select()
      .from(fieldMappings)
      .where(eq(fieldMappings.integrationSourceId, id))
      .orderBy(fieldMappings.sourceEntity, fieldMappings.sourceField);

    // Get recent sync history
    const history = await db
      .select()
      .from(syncHistory)
      .where(eq(syncHistory.integrationSourceId, id))
      .orderBy(desc(syncHistory.syncStartedAt))
      .limit(20);

    // Get record counts
    const [recordStats] = await db
      .select({
        total: count(),
        synced: sql<number>`SUM(CASE WHEN ${integrationRecords.syncStatus} = 'completed' THEN 1 ELSE 0 END)`,
        failed: sql<number>`SUM(CASE WHEN ${integrationRecords.syncStatus} = 'failed' THEN 1 ELSE 0 END)`
      })
      .from(integrationRecords)
      .where(eq(integrationRecords.integrationSourceId, id));

    res.json({
      ...source,
      mappings,
      history,
      stats: recordStats || { total: 0, synced: 0, failed: 0 }
    });
  } catch (error) {
    console.error("[Integrations] Get source error:", error);
    res.status(500).json({ error: "Failed to get integration source" });
  }
});

// POST /api/integrations - Create integration source
router.post("/integrations", async (req: Request, res: Response) => {
  try {
    const validatedData = insertIntegrationSourceSchema.parse(req.body);

    const [newSource] = await db.insert(integrationSources).values(validatedData).returning();

    res.status(201).json(newSource);
  } catch (error) {
    console.error("[Integrations] Create source error:", error);
    res.status(400).json({ error: "Failed to create integration source" });
  }
});

// PATCH /api/integrations/:id - Update integration source
router.patch("/integrations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    const [updated] = await db
      .update(integrationSources)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(integrationSources.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Integrations] Update source error:", error);
    res.status(400).json({ error: "Failed to update integration source" });
  }
});

// DELETE /api/integrations/:id - Soft delete integration source
router.delete("/integrations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!existing) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    // Soft delete
    await db
      .update(integrationSources)
      .set({ deletedAt: new Date() })
      .where(eq(integrationSources.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error("[Integrations] Delete source error:", error);
    res.status(500).json({ error: "Failed to delete integration source" });
  }
});

// ============================================================================
// FIELD MAPPINGS
// ============================================================================

// GET /api/integrations/:id/mappings - List mappings for a source
router.get("/integrations/:id/mappings", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, sourceEntity, targetEntity } = req.query;

    const conditions = [eq(fieldMappings.integrationSourceId, id)];

    if (status) conditions.push(eq(fieldMappings.status, status as any));
    if (sourceEntity) conditions.push(eq(fieldMappings.sourceEntity, sourceEntity as string));
    if (targetEntity) conditions.push(eq(fieldMappings.targetEntity, targetEntity as string));

    const mappings = await db
      .select()
      .from(fieldMappings)
      .where(and(...conditions))
      .orderBy(fieldMappings.sourceEntity, fieldMappings.sourceField);

    res.json(mappings);
  } catch (error) {
    console.error("[Integrations] List mappings error:", error);
    res.status(500).json({ error: "Failed to list field mappings" });
  }
});

// POST /api/integrations/:id/mappings - Create field mapping
router.post("/integrations/:id/mappings", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify source exists
    const [source] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!source) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    const validatedData = insertFieldMappingSchema.parse({
      ...req.body,
      integrationSourceId: id
    });

    const [newMapping] = await db.insert(fieldMappings).values(validatedData).returning();

    res.status(201).json(newMapping);
  } catch (error) {
    console.error("[Integrations] Create mapping error:", error);
    res.status(400).json({ error: "Failed to create field mapping" });
  }
});

// PATCH /api/integrations/:id/mappings/:mappingId - Update field mapping
router.patch("/integrations/:id/mappings/:mappingId", async (req: Request, res: Response) => {
  try {
    const { id, mappingId } = req.params;

    const [existing] = await db.select().from(fieldMappings)
      .where(and(
        eq(fieldMappings.id, mappingId),
        eq(fieldMappings.integrationSourceId, id)
      ));

    if (!existing) {
      return res.status(404).json({ error: "Field mapping not found" });
    }

    const [updated] = await db
      .update(fieldMappings)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(fieldMappings.id, mappingId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Integrations] Update mapping error:", error);
    res.status(400).json({ error: "Failed to update field mapping" });
  }
});

// DELETE /api/integrations/:id/mappings/:mappingId - Delete field mapping
router.delete("/integrations/:id/mappings/:mappingId", async (req: Request, res: Response) => {
  try {
    const { id, mappingId } = req.params;

    const [existing] = await db.select().from(fieldMappings)
      .where(and(
        eq(fieldMappings.id, mappingId),
        eq(fieldMappings.integrationSourceId, id)
      ));

    if (!existing) {
      return res.status(404).json({ error: "Field mapping not found" });
    }

    await db.delete(fieldMappings).where(eq(fieldMappings.id, mappingId));

    res.json({ success: true });
  } catch (error) {
    console.error("[Integrations] Delete mapping error:", error);
    res.status(500).json({ error: "Failed to delete field mapping" });
  }
});

// POST /api/integrations/:id/mappings/bulk - Bulk create/update mappings
router.post("/integrations/:id/mappings/bulk", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mappings: mappingData } = req.body;

    if (!Array.isArray(mappingData)) {
      return res.status(400).json({ error: "mappings must be an array" });
    }

    // Verify source exists
    const [source] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!source) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    const created = [];
    const updated = [];

    for (const mapping of mappingData) {
      if (mapping.id) {
        // Update existing
        const [upd] = await db
          .update(fieldMappings)
          .set({ ...mapping, updatedAt: new Date() })
          .where(eq(fieldMappings.id, mapping.id))
          .returning();
        if (upd) updated.push(upd);
      } else {
        // Create new
        const validatedData = insertFieldMappingSchema.parse({
          ...mapping,
          integrationSourceId: id
        });
        const [newMapping] = await db.insert(fieldMappings).values(validatedData).returning();
        created.push(newMapping);
      }
    }

    res.json({ created, updated });
  } catch (error) {
    console.error("[Integrations] Bulk mappings error:", error);
    res.status(400).json({ error: "Failed to process bulk mappings" });
  }
});

// ============================================================================
// DATA IMPORT
// ============================================================================

// POST /api/integrations/:id/import/manual - Manual data entry
router.post("/integrations/:id/import/manual", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { records } = req.body;

    if (!Array.isArray(records)) {
      return res.status(400).json({ error: "records must be an array" });
    }

    // Verify source exists
    const [source] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!source) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    // Create sync history entry
    const [syncEntry] = await db.insert(syncHistory).values({
      integrationSourceId: id,
      syncType: "manual",
      status: "running",
      recordsRequested: records.length,
      initiatedBy: req.body.userId || null
    }).returning();

    const results = { succeeded: 0, failed: 0, errors: [] as any[] };

    for (const record of records) {
      try {
        await db.insert(integrationRecords).values({
          integrationSourceId: id,
          syncHistoryId: syncEntry.id,
          externalId: record.externalId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          externalEntity: record.externalEntity || "manual_entry",
          externalData: record.data || record,
          mappedData: record.mappedData || null,
          syncStatus: "completed",
          lastSyncedAt: new Date()
        });
        results.succeeded++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ record, error: err.message });
      }
    }

    // Update sync history
    await db.update(syncHistory).set({
      status: results.failed === 0 ? "completed" : "partial",
      recordsProcessed: records.length,
      recordsSucceeded: results.succeeded,
      recordsFailed: results.failed,
      syncCompletedAt: new Date(),
      durationMs: Date.now() - new Date(syncEntry.syncStartedAt!).getTime(),
      errorLog: results.errors.length > 0 ? results.errors : null
    }).where(eq(syncHistory.id, syncEntry.id));

    // Update source last sync
    await db.update(integrationSources).set({
      lastSyncAt: new Date(),
      lastSyncStatus: results.failed === 0 ? "completed" : "partial"
    }).where(eq(integrationSources.id, id));

    res.json({
      syncId: syncEntry.id,
      ...results
    });
  } catch (error) {
    console.error("[Integrations] Manual import error:", error);
    res.status(400).json({ error: "Failed to import records" });
  }
});

// POST /api/integrations/:id/import/csv - CSV file upload
router.post("/integrations/:id/import/csv", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { csvData, entityType, columnMapping } = req.body;

    if (!Array.isArray(csvData)) {
      return res.status(400).json({ error: "csvData must be an array of objects" });
    }

    // Verify source exists
    const [source] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!source) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    // Create sync history entry
    const [syncEntry] = await db.insert(syncHistory).values({
      integrationSourceId: id,
      syncType: "csv_import",
      status: "running",
      recordsRequested: csvData.length,
      initiatedBy: req.body.userId || null
    }).returning();

    const results = { succeeded: 0, failed: 0, created: 0, updated: 0, errors: [] as any[] };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        // Apply column mapping if provided
        let mappedRow = row;
        if (columnMapping) {
          mappedRow = {};
          for (const [sourceCol, targetCol] of Object.entries(columnMapping)) {
            if (typeof targetCol === 'string' && row[sourceCol] !== undefined) {
              mappedRow[targetCol] = row[sourceCol];
            }
          }
        }

        const externalId = row.id || row.externalId || `csv-${i}-${Date.now()}`;

        // Check if record exists
        const [existing] = await db.select().from(integrationRecords)
          .where(and(
            eq(integrationRecords.integrationSourceId, id),
            eq(integrationRecords.externalId, externalId)
          ));

        if (existing) {
          // Update existing
          await db.update(integrationRecords).set({
            externalData: row,
            mappedData: mappedRow,
            syncHistoryId: syncEntry.id,
            syncStatus: "completed",
            lastSyncedAt: new Date(),
            updatedAt: new Date()
          }).where(eq(integrationRecords.id, existing.id));
          results.updated++;
        } else {
          // Create new
          await db.insert(integrationRecords).values({
            integrationSourceId: id,
            syncHistoryId: syncEntry.id,
            externalId,
            externalEntity: entityType || "csv_record",
            externalData: row,
            mappedData: mappedRow,
            syncStatus: "completed",
            lastSyncedAt: new Date()
          });
          results.created++;
        }
        results.succeeded++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ row: i, error: err.message });
      }
    }

    // Update sync history
    await db.update(syncHistory).set({
      status: results.failed === 0 ? "completed" : "partial",
      recordsProcessed: csvData.length,
      recordsSucceeded: results.succeeded,
      recordsFailed: results.failed,
      recordsCreated: results.created,
      recordsUpdated: results.updated,
      syncCompletedAt: new Date(),
      durationMs: Date.now() - new Date(syncEntry.syncStartedAt!).getTime(),
      errorLog: results.errors.length > 0 ? results.errors : null
    }).where(eq(syncHistory.id, syncEntry.id));

    // Update source last sync
    await db.update(integrationSources).set({
      lastSyncAt: new Date(),
      lastSyncStatus: results.failed === 0 ? "completed" : "partial"
    }).where(eq(integrationSources.id, id));

    res.json({
      syncId: syncEntry.id,
      ...results
    });
  } catch (error) {
    console.error("[Integrations] CSV import error:", error);
    res.status(400).json({ error: "Failed to import CSV data" });
  }
});

// POST /api/integrations/:id/sync - Trigger API sync (placeholder for future implementation)
router.post("/integrations/:id/sync", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify source exists and has API credentials
    const [source] = await db.select().from(integrationSources).where(eq(integrationSources.id, id));
    if (!source) {
      return res.status(404).json({ error: "Integration source not found" });
    }

    if (!source.apiUrl) {
      return res.status(400).json({ error: "Integration source does not have API URL configured" });
    }

    // Create sync history entry (marked as pending - actual sync would be async)
    const [syncEntry] = await db.insert(syncHistory).values({
      integrationSourceId: id,
      syncType: "scheduled",
      status: "pending",
      initiatedBy: req.body.userId || null
    }).returning();

    // In a real implementation, this would:
    // 1. Queue a background job
    // 2. Call the external API
    // 3. Apply field mappings
    // 4. Create/update integration records
    // 5. Update sync history

    res.json({
      message: "Sync initiated",
      syncId: syncEntry.id,
      status: "pending",
      note: "API sync is queued for processing"
    });
  } catch (error) {
    console.error("[Integrations] Sync error:", error);
    res.status(500).json({ error: "Failed to initiate sync" });
  }
});

// ============================================================================
// RECORDS
// ============================================================================

// GET /api/integrations/:id/records - List imported records
router.get("/integrations/:id/records", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { search, syncStatus, externalEntity, syncHistoryId, limit = "50", offset = "0" } = req.query;

    const conditions = [eq(integrationRecords.integrationSourceId, id)];

    if (search) {
      conditions.push(ilike(integrationRecords.externalId, `%${search}%`));
    }
    if (syncStatus) conditions.push(eq(integrationRecords.syncStatus, syncStatus as any));
    if (externalEntity) conditions.push(eq(integrationRecords.externalEntity, externalEntity as string));
    if (syncHistoryId) conditions.push(eq(integrationRecords.syncHistoryId, syncHistoryId as string));

    const records = await db
      .select()
      .from(integrationRecords)
      .where(and(...conditions))
      .orderBy(desc(integrationRecords.lastSyncedAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    // Get total count
    const [countResult] = await db
      .select({ count: count() })
      .from(integrationRecords)
      .where(and(...conditions));

    res.json({
      records,
      total: countResult.count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error("[Integrations] List records error:", error);
    res.status(500).json({ error: "Failed to list records" });
  }
});

// GET /api/integrations/:id/records/:recordId - Get single record
router.get("/integrations/:id/records/:recordId", async (req: Request, res: Response) => {
  try {
    const { id, recordId } = req.params;

    const [record] = await db.select().from(integrationRecords)
      .where(and(
        eq(integrationRecords.id, recordId),
        eq(integrationRecords.integrationSourceId, id)
      ));

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error("[Integrations] Get record error:", error);
    res.status(500).json({ error: "Failed to get record" });
  }
});

// PATCH /api/integrations/:id/records/:recordId - Update record (mapped data)
router.patch("/integrations/:id/records/:recordId", async (req: Request, res: Response) => {
  try {
    const { id, recordId } = req.params;

    const [existing] = await db.select().from(integrationRecords)
      .where(and(
        eq(integrationRecords.id, recordId),
        eq(integrationRecords.integrationSourceId, id)
      ));

    if (!existing) {
      return res.status(404).json({ error: "Record not found" });
    }

    const [updated] = await db
      .update(integrationRecords)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(integrationRecords.id, recordId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("[Integrations] Update record error:", error);
    res.status(400).json({ error: "Failed to update record" });
  }
});

// ============================================================================
// SYNC HISTORY
// ============================================================================

// GET /api/integrations/:id/history - Get sync history
router.get("/integrations/:id/history", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, syncType, limit = "20", offset = "0" } = req.query;

    const conditions = [eq(syncHistory.integrationSourceId, id)];

    if (status) conditions.push(eq(syncHistory.status, status as any));
    if (syncType) conditions.push(eq(syncHistory.syncType, syncType as string));

    const history = await db
      .select()
      .from(syncHistory)
      .where(and(...conditions))
      .orderBy(desc(syncHistory.syncStartedAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(history);
  } catch (error) {
    console.error("[Integrations] Get history error:", error);
    res.status(500).json({ error: "Failed to get sync history" });
  }
});

// GET /api/integrations/history/:historyId - Get single sync history entry
router.get("/integrations/history/:historyId", async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;

    const [entry] = await db.select().from(syncHistory).where(eq(syncHistory.id, historyId));

    if (!entry) {
      return res.status(404).json({ error: "Sync history entry not found" });
    }

    // Get records from this sync
    const records = await db
      .select()
      .from(integrationRecords)
      .where(eq(integrationRecords.syncHistoryId, historyId))
      .limit(100);

    res.json({ ...entry, records });
  } catch (error) {
    console.error("[Integrations] Get history entry error:", error);
    res.status(500).json({ error: "Failed to get sync history entry" });
  }
});

export default router;
