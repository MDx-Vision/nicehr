import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  tdrEvents,
  tdrChecklistItems,
  tdrTestScenarios,
  tdrIssues,
  tdrIntegrationTests,
  tdrDowntimeTests,
  tdrReadinessScores,
  supportTickets,
} from '@shared/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';

const router = Router();

// =============================================================================
// TDR Events (Cutover Rehearsal Scheduling)
// =============================================================================

// GET /api/projects/:projectId/tdr/events
router.get('/projects/:projectId/tdr/events', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const events = await db.select().from(tdrEvents)
      .where(eq(tdrEvents.projectId, projectId))
      .orderBy(desc(tdrEvents.scheduledDate));
    res.json(events);
  } catch (error) {
    console.error('Error fetching TDR events:', error);
    res.status(500).json({ error: 'Failed to fetch TDR events' });
  }
});

// POST /api/projects/:projectId/tdr/events
router.post('/projects/:projectId/tdr/events', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const eventData = { ...req.body, projectId };

    // Convert scheduledDate string to Date object if present
    if (eventData.scheduledDate && typeof eventData.scheduledDate === 'string') {
      eventData.scheduledDate = new Date(eventData.scheduledDate);
    }

    const [event] = await db.insert(tdrEvents)
      .values(eventData)
      .returning();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating TDR event:', error);
    res.status(500).json({ error: 'Failed to create TDR event' });
  }
});

// GET /api/tdr/events/:id
router.get('/tdr/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [event] = await db.select().from(tdrEvents)
      .where(eq(tdrEvents.id, id));
    if (!event) {
      return res.status(404).json({ error: 'TDR event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching TDR event:', error);
    res.status(500).json({ error: 'Failed to fetch TDR event' });
  }
});

// PATCH /api/tdr/events/:id
router.patch('/tdr/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [event] = await db.update(tdrEvents)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(tdrEvents.id, id))
      .returning();
    if (!event) {
      return res.status(404).json({ error: 'TDR event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error updating TDR event:', error);
    res.status(500).json({ error: 'Failed to update TDR event' });
  }
});

// DELETE /api/tdr/events/:id
router.delete('/tdr/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(tdrEvents).where(eq(tdrEvents.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TDR event:', error);
    res.status(500).json({ error: 'Failed to delete TDR event' });
  }
});

// =============================================================================
// TDR Checklist Items
// =============================================================================

// GET /api/projects/:projectId/tdr/checklist
router.get('/projects/:projectId/tdr/checklist', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { eventId, category } = req.query;

    let conditions = [eq(tdrChecklistItems.projectId, projectId)];
    if (eventId) {
      conditions.push(eq(tdrChecklistItems.tdrEventId, eventId as string));
    }
    if (category) {
      conditions.push(eq(tdrChecklistItems.category, category as any));
    }

    const items = await db.select().from(tdrChecklistItems)
      .where(and(...conditions))
      .orderBy(tdrChecklistItems.sortOrder);
    res.json(items);
  } catch (error) {
    console.error('Error fetching TDR checklist:', error);
    res.status(500).json({ error: 'Failed to fetch TDR checklist' });
  }
});

// POST /api/projects/:projectId/tdr/checklist
router.post('/projects/:projectId/tdr/checklist', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [item] = await db.insert(tdrChecklistItems)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating TDR checklist item:', error);
    res.status(500).json({ error: 'Failed to create TDR checklist item' });
  }
});

// PATCH /api/tdr/checklist/:id
router.patch('/tdr/checklist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [item] = await db.update(tdrChecklistItems)
      .set(req.body)
      .where(eq(tdrChecklistItems.id, id))
      .returning();
    if (!item) {
      return res.status(404).json({ error: 'TDR checklist item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating TDR checklist item:', error);
    res.status(500).json({ error: 'Failed to update TDR checklist item' });
  }
});

// POST /api/tdr/checklist/:id/complete
router.post('/tdr/checklist/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const [item] = await db.update(tdrChecklistItems)
      .set({
        isCompleted: true,
        completedBy: userId,
        completedAt: new Date()
      })
      .where(eq(tdrChecklistItems.id, id))
      .returning();
    if (!item) {
      return res.status(404).json({ error: 'TDR checklist item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error completing TDR checklist item:', error);
    res.status(500).json({ error: 'Failed to complete TDR checklist item' });
  }
});

// POST /api/tdr/checklist/:id/uncomplete
router.post('/tdr/checklist/:id/uncomplete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [item] = await db.update(tdrChecklistItems)
      .set({
        isCompleted: false,
        completedBy: null,
        completedAt: null
      })
      .where(eq(tdrChecklistItems.id, id))
      .returning();
    if (!item) {
      return res.status(404).json({ error: 'TDR checklist item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error uncompleting TDR checklist item:', error);
    res.status(500).json({ error: 'Failed to uncomplete TDR checklist item' });
  }
});

// DELETE /api/tdr/checklist/:id
router.delete('/tdr/checklist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(tdrChecklistItems).where(eq(tdrChecklistItems.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TDR checklist item:', error);
    res.status(500).json({ error: 'Failed to delete TDR checklist item' });
  }
});

// POST /api/projects/:projectId/tdr/checklist/seed
router.post('/projects/:projectId/tdr/checklist/seed', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { tdrEventId } = req.body;
    const defaultItems = getDefaultTdrChecklist(projectId, tdrEventId);
    const items = await db.insert(tdrChecklistItems).values(defaultItems).returning();
    res.status(201).json(items);
  } catch (error) {
    console.error('Error seeding TDR checklist:', error);
    res.status(500).json({ error: 'Failed to seed TDR checklist' });
  }
});

// =============================================================================
// TDR Test Scenarios
// =============================================================================

// GET /api/projects/:projectId/tdr/test-scenarios
router.get('/projects/:projectId/tdr/test-scenarios', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { eventId, category, status } = req.query;

    let conditions = [eq(tdrTestScenarios.projectId, projectId)];
    if (eventId) {
      conditions.push(eq(tdrTestScenarios.tdrEventId, eventId as string));
    }
    if (category) {
      conditions.push(eq(tdrTestScenarios.category, category as string));
    }
    if (status) {
      conditions.push(eq(tdrTestScenarios.status, status as any));
    }

    const scenarios = await db.select().from(tdrTestScenarios)
      .where(and(...conditions));
    res.json(scenarios);
  } catch (error) {
    console.error('Error fetching TDR test scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch TDR test scenarios' });
  }
});

// POST /api/projects/:projectId/tdr/test-scenarios
router.post('/projects/:projectId/tdr/test-scenarios', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [scenario] = await db.insert(tdrTestScenarios)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(scenario);
  } catch (error) {
    console.error('Error creating TDR test scenario:', error);
    res.status(500).json({ error: 'Failed to create TDR test scenario' });
  }
});

// PATCH /api/tdr/test-scenarios/:id
router.patch('/tdr/test-scenarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [scenario] = await db.update(tdrTestScenarios)
      .set(req.body)
      .where(eq(tdrTestScenarios.id, id))
      .returning();
    if (!scenario) {
      return res.status(404).json({ error: 'TDR test scenario not found' });
    }
    res.json(scenario);
  } catch (error) {
    console.error('Error updating TDR test scenario:', error);
    res.status(500).json({ error: 'Failed to update TDR test scenario' });
  }
});

// POST /api/tdr/test-scenarios/:id/execute
router.post('/tdr/test-scenarios/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actualResult, userId } = req.body;
    const [scenario] = await db.update(tdrTestScenarios)
      .set({
        status,
        actualResult,
        testedBy: userId,
        testedAt: new Date()
      })
      .where(eq(tdrTestScenarios.id, id))
      .returning();
    if (!scenario) {
      return res.status(404).json({ error: 'TDR test scenario not found' });
    }
    res.json(scenario);
  } catch (error) {
    console.error('Error executing TDR test scenario:', error);
    res.status(500).json({ error: 'Failed to execute TDR test scenario' });
  }
});

// DELETE /api/tdr/test-scenarios/:id
router.delete('/tdr/test-scenarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(tdrTestScenarios).where(eq(tdrTestScenarios.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TDR test scenario:', error);
    res.status(500).json({ error: 'Failed to delete TDR test scenario' });
  }
});

// =============================================================================
// TDR Issues
// =============================================================================

// GET /api/projects/:projectId/tdr/issues
router.get('/projects/:projectId/tdr/issues', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, severity, blocksGoLive } = req.query;

    let conditions = [eq(tdrIssues.projectId, projectId)];
    if (status) {
      conditions.push(eq(tdrIssues.status, status as any));
    }
    if (severity) {
      conditions.push(eq(tdrIssues.severity, severity as any));
    }
    if (blocksGoLive === 'true') {
      conditions.push(eq(tdrIssues.blocksGoLive, true));
    }

    const issues = await db.select().from(tdrIssues)
      .where(and(...conditions))
      .orderBy(desc(tdrIssues.createdAt));
    res.json(issues);
  } catch (error) {
    console.error('Error fetching TDR issues:', error);
    res.status(500).json({ error: 'Failed to fetch TDR issues' });
  }
});

// POST /api/projects/:projectId/tdr/issues
router.post('/projects/:projectId/tdr/issues', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    // Generate issue number
    const existingIssues = await db.select().from(tdrIssues)
      .where(eq(tdrIssues.projectId, projectId));
    const issueNumber = `TDR-${String(existingIssues.length + 1).padStart(4, '0')}`;

    const [issue] = await db.insert(tdrIssues)
      .values({ ...req.body, projectId, issueNumber })
      .returning();
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating TDR issue:', error);
    res.status(500).json({ error: 'Failed to create TDR issue' });
  }
});

// GET /api/tdr/issues/:id
router.get('/tdr/issues/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [issue] = await db.select().from(tdrIssues)
      .where(eq(tdrIssues.id, id));
    if (!issue) {
      return res.status(404).json({ error: 'TDR issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error('Error fetching TDR issue:', error);
    res.status(500).json({ error: 'Failed to fetch TDR issue' });
  }
});

// PATCH /api/tdr/issues/:id
router.patch('/tdr/issues/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [issue] = await db.update(tdrIssues)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(tdrIssues.id, id))
      .returning();
    if (!issue) {
      return res.status(404).json({ error: 'TDR issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error('Error updating TDR issue:', error);
    res.status(500).json({ error: 'Failed to update TDR issue' });
  }
});

// POST /api/tdr/issues/:id/resolve
router.post('/tdr/issues/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const [issue] = await db.update(tdrIssues)
      .set({
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tdrIssues.id, id))
      .returning();
    if (!issue) {
      return res.status(404).json({ error: 'TDR issue not found' });
    }
    res.json(issue);
  } catch (error) {
    console.error('Error resolving TDR issue:', error);
    res.status(500).json({ error: 'Failed to resolve TDR issue' });
  }
});

// DELETE /api/tdr/issues/:id
router.delete('/tdr/issues/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(tdrIssues).where(eq(tdrIssues.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TDR issue:', error);
    res.status(500).json({ error: 'Failed to delete TDR issue' });
  }
});

// POST /api/tdr/issues/:id/create-ticket
// Creates a support ticket from a TDR issue
router.post('/tdr/issues/:id/create-ticket', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the TDR issue
    const [issue] = await db.select().from(tdrIssues).where(eq(tdrIssues.id, id));
    if (!issue) {
      return res.status(404).json({ error: 'TDR issue not found' });
    }

    // Check if ticket already exists
    if (issue.supportTicketId) {
      return res.status(400).json({
        error: 'Support ticket already exists for this TDR issue',
        ticketId: issue.supportTicketId
      });
    }

    // Map TDR severity to support ticket priority
    const priorityMap: Record<string, string> = {
      'critical': 'high',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    const priority = priorityMap[issue.severity || 'medium'] || 'medium';

    // Map TDR category to support ticket category
    const categoryMap: Record<string, string> = {
      'technical': 'technical',
      'workflow': 'workflow',
      'integration': 'integration',
      'data': 'data_issue',
      'training': 'training',
      'clinical': 'clinical'
    };
    const category = categoryMap[issue.category || 'technical'] || 'other';

    // Create support ticket with TDR context
    const ticketDescription = `${issue.description || ''}\n\n---\n**Created from TDR Issue**\n- Issue Number: ${issue.issueNumber || 'N/A'}\n- Severity: ${issue.severity}\n- Blocks Go-Live: ${issue.blocksGoLive ? 'Yes ⚠️' : 'No'}\n- TDR Event ID: ${issue.tdrEventId || 'N/A'}`;

    const [ticket] = await db.insert(supportTickets)
      .values({
        projectId: issue.projectId,
        title: issue.title,
        description: ticketDescription,
        priority: priority as any,
        category: category as any,
        status: 'open',
        reportedById: issue.reportedBy,
        assignedToId: issue.assignedTo,
        tdrIssueId: issue.id,
      })
      .returning();

    // Update TDR issue with support ticket reference
    const [updatedIssue] = await db.update(tdrIssues)
      .set({
        supportTicketId: ticket.id,
        updatedAt: new Date()
      })
      .where(eq(tdrIssues.id, id))
      .returning();

    res.status(201).json({
      ticket,
      issue: updatedIssue,
      message: 'Support ticket created successfully from TDR issue'
    });
  } catch (error) {
    console.error('Error creating ticket from TDR issue:', error);
    res.status(500).json({ error: 'Failed to create support ticket from TDR issue' });
  }
});

// =============================================================================
// TDR Integration Tests
// =============================================================================

// GET /api/projects/:projectId/tdr/integration-tests
router.get('/projects/:projectId/tdr/integration-tests', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { eventId, status, interfaceType } = req.query;

    let conditions = [eq(tdrIntegrationTests.projectId, projectId)];
    if (eventId) {
      conditions.push(eq(tdrIntegrationTests.tdrEventId, eventId as string));
    }
    if (status) {
      conditions.push(eq(tdrIntegrationTests.status, status as any));
    }
    if (interfaceType) {
      conditions.push(eq(tdrIntegrationTests.interfaceType, interfaceType as string));
    }

    const tests = await db.select().from(tdrIntegrationTests)
      .where(and(...conditions));
    res.json(tests);
  } catch (error) {
    console.error('Error fetching TDR integration tests:', error);
    res.status(500).json({ error: 'Failed to fetch TDR integration tests' });
  }
});

// POST /api/projects/:projectId/tdr/integration-tests
router.post('/projects/:projectId/tdr/integration-tests', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [test] = await db.insert(tdrIntegrationTests)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating TDR integration test:', error);
    res.status(500).json({ error: 'Failed to create TDR integration test' });
  }
});

// PATCH /api/tdr/integration-tests/:id
router.patch('/tdr/integration-tests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [test] = await db.update(tdrIntegrationTests)
      .set(req.body)
      .where(eq(tdrIntegrationTests.id, id))
      .returning();
    if (!test) {
      return res.status(404).json({ error: 'TDR integration test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error updating TDR integration test:', error);
    res.status(500).json({ error: 'Failed to update TDR integration test' });
  }
});

// DELETE /api/tdr/integration-tests/:id
router.delete('/tdr/integration-tests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(tdrIntegrationTests).where(eq(tdrIntegrationTests.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TDR integration test:', error);
    res.status(500).json({ error: 'Failed to delete TDR integration test' });
  }
});

// =============================================================================
// TDR Downtime Tests
// =============================================================================

// GET /api/projects/:projectId/tdr/downtime-tests
router.get('/projects/:projectId/tdr/downtime-tests', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { eventId, status } = req.query;

    let conditions = [eq(tdrDowntimeTests.projectId, projectId)];
    if (eventId) {
      conditions.push(eq(tdrDowntimeTests.tdrEventId, eventId as string));
    }
    if (status) {
      conditions.push(eq(tdrDowntimeTests.status, status as any));
    }

    const tests = await db.select().from(tdrDowntimeTests)
      .where(and(...conditions));
    res.json(tests);
  } catch (error) {
    console.error('Error fetching TDR downtime tests:', error);
    res.status(500).json({ error: 'Failed to fetch TDR downtime tests' });
  }
});

// POST /api/projects/:projectId/tdr/downtime-tests
router.post('/projects/:projectId/tdr/downtime-tests', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [test] = await db.insert(tdrDowntimeTests)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating TDR downtime test:', error);
    res.status(500).json({ error: 'Failed to create TDR downtime test' });
  }
});

// PATCH /api/tdr/downtime-tests/:id
router.patch('/tdr/downtime-tests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [test] = await db.update(tdrDowntimeTests)
      .set(req.body)
      .where(eq(tdrDowntimeTests.id, id))
      .returning();
    if (!test) {
      return res.status(404).json({ error: 'TDR downtime test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error updating TDR downtime test:', error);
    res.status(500).json({ error: 'Failed to update TDR downtime test' });
  }
});

// DELETE /api/tdr/downtime-tests/:id
router.delete('/tdr/downtime-tests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(tdrDowntimeTests).where(eq(tdrDowntimeTests.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TDR downtime test:', error);
    res.status(500).json({ error: 'Failed to delete TDR downtime test' });
  }
});

// =============================================================================
// TDR Readiness Scorecard
// =============================================================================

// GET /api/projects/:projectId/tdr/readiness-score
router.get('/projects/:projectId/tdr/readiness-score', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [score] = await db.select().from(tdrReadinessScores)
      .where(eq(tdrReadinessScores.projectId, projectId))
      .orderBy(desc(tdrReadinessScores.calculatedAt))
      .limit(1);
    res.json(score || null);
  } catch (error) {
    console.error('Error fetching TDR readiness score:', error);
    res.status(500).json({ error: 'Failed to fetch TDR readiness score' });
  }
});

// GET /api/projects/:projectId/tdr/readiness-score/history
router.get('/projects/:projectId/tdr/readiness-score/history', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const scores = await db.select().from(tdrReadinessScores)
      .where(eq(tdrReadinessScores.projectId, projectId))
      .orderBy(desc(tdrReadinessScores.calculatedAt))
      .limit(10);
    res.json(scores);
  } catch (error) {
    console.error('Error fetching TDR readiness score history:', error);
    res.status(500).json({ error: 'Failed to fetch TDR readiness score history' });
  }
});

// POST /api/projects/:projectId/tdr/readiness-score/calculate
router.post('/projects/:projectId/tdr/readiness-score/calculate', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { tdrEventId } = req.body;

    // Calculate scores based on checklist, tests, issues
    const scores = await calculateTdrReadinessScore(projectId, tdrEventId);

    const [score] = await db.insert(tdrReadinessScores)
      .values({ ...scores, projectId, tdrEventId })
      .returning();
    res.status(201).json(score);
  } catch (error) {
    console.error('Error calculating TDR readiness score:', error);
    res.status(500).json({ error: 'Failed to calculate TDR readiness score' });
  }
});

// POST /api/tdr/readiness-score/:id/approve
router.post('/tdr/readiness-score/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, recommendation } = req.body;
    const [score] = await db.update(tdrReadinessScores)
      .set({
        approvedBy: userId,
        approvedAt: new Date(),
        recommendation
      })
      .where(eq(tdrReadinessScores.id, id))
      .returning();
    if (!score) {
      return res.status(404).json({ error: 'TDR readiness score not found' });
    }
    res.json(score);
  } catch (error) {
    console.error('Error approving TDR readiness score:', error);
    res.status(500).json({ error: 'Failed to approve TDR readiness score' });
  }
});

// =============================================================================
// TDR Dashboard/Summary
// =============================================================================

// GET /api/projects/:projectId/tdr/summary
router.get('/projects/:projectId/tdr/summary', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Get checklist stats
    const checklist = await db.select().from(tdrChecklistItems)
      .where(eq(tdrChecklistItems.projectId, projectId));
    const checklistComplete = checklist.filter(i => i.isCompleted).length;

    // Get test scenario stats
    const tests = await db.select().from(tdrTestScenarios)
      .where(eq(tdrTestScenarios.projectId, projectId));
    const testsPassed = tests.filter(t => t.status === 'passed').length;
    const testsFailed = tests.filter(t => t.status === 'failed').length;

    // Get issue stats
    const issues = await db.select().from(tdrIssues)
      .where(eq(tdrIssues.projectId, projectId));
    const openIssues = issues.filter(i => i.status !== 'resolved' && i.status !== 'wont_fix');
    const criticalIssues = openIssues.filter(i => i.severity === 'critical').length;
    const blockerIssues = openIssues.filter(i => i.blocksGoLive).length;

    // Get integration test stats
    const integrations = await db.select().from(tdrIntegrationTests)
      .where(eq(tdrIntegrationTests.projectId, projectId));
    const integrationsPassed = integrations.filter(i => i.status === 'passed').length;

    // Get downtime test stats
    const downtimeTests = await db.select().from(tdrDowntimeTests)
      .where(eq(tdrDowntimeTests.projectId, projectId));
    const downtimePassed = downtimeTests.filter(t => t.status === 'passed').length;

    // Get upcoming events
    const upcomingEvents = await db.select().from(tdrEvents)
      .where(eq(tdrEvents.projectId, projectId))
      .orderBy(tdrEvents.scheduledDate)
      .limit(5);

    // Get latest readiness score
    const [latestScore] = await db.select().from(tdrReadinessScores)
      .where(eq(tdrReadinessScores.projectId, projectId))
      .orderBy(desc(tdrReadinessScores.calculatedAt))
      .limit(1);

    res.json({
      checklist: {
        total: checklist.length,
        completed: checklistComplete,
        percentage: checklist.length > 0 ? Math.round((checklistComplete / checklist.length) * 100) : 0,
      },
      testScenarios: {
        total: tests.length,
        passed: testsPassed,
        failed: testsFailed,
        pending: tests.length - testsPassed - testsFailed,
        percentage: tests.length > 0 ? Math.round((testsPassed / tests.length) * 100) : 0,
      },
      issues: {
        total: issues.length,
        open: openIssues.length,
        critical: criticalIssues,
        blockers: blockerIssues,
      },
      integrationTests: {
        total: integrations.length,
        passed: integrationsPassed,
        percentage: integrations.length > 0 ? Math.round((integrationsPassed / integrations.length) * 100) : 0,
      },
      downtimeTests: {
        total: downtimeTests.length,
        passed: downtimePassed,
        percentage: downtimeTests.length > 0 ? Math.round((downtimePassed / downtimeTests.length) * 100) : 0,
      },
      upcomingEvents,
      latestScore,
    });
  } catch (error) {
    console.error('Error fetching TDR summary:', error);
    res.status(500).json({ error: 'Failed to fetch TDR summary' });
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

function getDefaultTdrChecklist(projectId: string, tdrEventId?: string) {
  const categories = {
    infrastructure: [
      'Production environment validated',
      'Network connectivity tested',
      'Backup/restore procedures verified',
      'Disaster recovery tested',
      'Security controls validated',
    ],
    integrations: [
      'ADT interfaces tested',
      'Lab interfaces tested',
      'Pharmacy interfaces tested',
      'Radiology interfaces tested',
      'Third-party system connections verified',
    ],
    data_migration: [
      'Patient demographics migrated',
      'Historical data converted',
      'Active orders migrated',
      'Medication lists validated',
      'Problem lists validated',
    ],
    workflows: [
      'Registration workflow tested',
      'Order entry workflow tested',
      'Documentation workflow tested',
      'Discharge workflow tested',
      'Downtime procedures tested',
    ],
    support: [
      'Command center operational',
      'Help desk staffed and trained',
      'At-elbow support assigned',
      'Escalation paths documented',
      'Communication channels tested',
    ],
  };

  const items: any[] = [];
  let sortOrder = 0;

  for (const [category, titles] of Object.entries(categories)) {
    for (const title of titles) {
      items.push({
        projectId,
        tdrEventId,
        category,
        title,
        sortOrder: sortOrder++,
        priority: 'high',
      });
    }
  }

  return items;
}

async function calculateTdrReadinessScore(projectId: string, tdrEventId?: string) {
  // Get checklist completion
  const checklist = await db.select().from(tdrChecklistItems)
    .where(eq(tdrChecklistItems.projectId, projectId));
  const checklistComplete = checklist.filter(i => i.isCompleted).length;
  const checklistTotal = checklist.length || 1;

  // Get test scenario results
  const tests = await db.select().from(tdrTestScenarios)
    .where(eq(tdrTestScenarios.projectId, projectId));
  const testsPassed = tests.filter(t => t.status === 'passed').length;
  const testsTotal = tests.length || 1;

  // Get integration test results
  const integrations = await db.select().from(tdrIntegrationTests)
    .where(eq(tdrIntegrationTests.projectId, projectId));
  const integrationsPassed = integrations.filter(i => i.status === 'passed').length;
  const integrationsTotal = integrations.length || 1;

  // Get open issues
  const issues = await db.select().from(tdrIssues)
    .where(eq(tdrIssues.projectId, projectId));
  const criticalIssuesCount = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const highIssuesCount = issues.filter(i => i.severity === 'high' && i.status !== 'resolved').length;

  // Calculate category scores
  const technicalScore = Math.round((integrationsPassed / integrationsTotal) * 100);
  const dataScore = Math.round((checklistComplete / checklistTotal) * 100);
  const staffScore = 80; // Would come from training completion - placeholder

  const supportChecklist = checklist.filter(i => i.category === 'support');
  const supportComplete = supportChecklist.filter(i => i.isCompleted).length;
  const supportScore = supportChecklist.length > 0
    ? Math.round((supportComplete / supportChecklist.length) * 100)
    : 0;

  const processScore = Math.round((testsPassed / testsTotal) * 100);

  // Weighted average (Technical 30%, Data 20%, Staff 25%, Support 15%, Process 10%)
  const overallScore = Math.round(
    (technicalScore * 0.30) +
    (dataScore * 0.20) +
    (staffScore * 0.25) +
    (supportScore * 0.15) +
    (processScore * 0.10)
  );

  // Determine recommendation
  let recommendation: 'go' | 'conditional_go' | 'no_go' = 'no_go';
  if (overallScore >= 90 && criticalIssuesCount === 0) {
    recommendation = 'go';
  } else if (overallScore >= 80) {
    recommendation = 'conditional_go';
  }

  return {
    technicalScore,
    dataScore,
    staffScore,
    supportScore,
    processScore,
    overallScore,
    recommendation,
    criticalIssuesCount,
    highIssuesCount,
    calculatedAt: new Date(),
  };
}

export default router;
