import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  changeRequests,
  changeRequestImpacts,
  changeRequestApprovals,
  changeRequestComments,
} from '@shared/schema';
import { eq, desc, and, count, sql, asc } from 'drizzle-orm';

const router = Router();

// =============================================================================
// Change Requests - CRUD Operations
// =============================================================================

// GET /api/projects/:projectId/change-requests - List all change requests for a project
router.get('/projects/:projectId/change-requests', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, category, priority } = req.query;

    let conditions = [eq(changeRequests.projectId, projectId)];

    if (status && typeof status === 'string') {
      conditions.push(eq(changeRequests.status, status as any));
    }
    if (category && typeof category === 'string') {
      conditions.push(eq(changeRequests.category, category as any));
    }
    if (priority && typeof priority === 'string') {
      conditions.push(eq(changeRequests.priority, priority as any));
    }

    const requests = await db.select().from(changeRequests)
      .where(and(...conditions))
      .orderBy(desc(changeRequests.createdAt));
    res.json(requests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({ error: 'Failed to fetch change requests' });
  }
});

// POST /api/projects/:projectId/change-requests - Create a new change request
router.post('/projects/:projectId/change-requests', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Generate request number (CR-YYYY-NNNN format)
    const year = new Date().getFullYear();
    const [countResult] = await db.select({ count: count() }).from(changeRequests);
    const requestNumber = `CR-${year}-${String((countResult?.count || 0) + 1).padStart(4, '0')}`;

    const requestData = {
      ...req.body,
      projectId,
      requestNumber,
      status: req.body.status || 'draft',
    };

    // Convert date strings to Date objects
    if (requestData.targetImplementationDate && typeof requestData.targetImplementationDate === 'string') {
      requestData.targetImplementationDate = new Date(requestData.targetImplementationDate);
    }

    const [request] = await db.insert(changeRequests)
      .values(requestData)
      .returning();
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating change request:', error);
    res.status(500).json({ error: 'Failed to create change request' });
  }
});

// GET /api/projects/:projectId/change-requests/:id - Get a single change request
router.get('/projects/:projectId/change-requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [request] = await db.select().from(changeRequests)
      .where(eq(changeRequests.id, id));

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }

    // Get associated impacts
    const impacts = await db.select().from(changeRequestImpacts)
      .where(eq(changeRequestImpacts.changeRequestId, id));

    // Get associated approvals
    const approvals = await db.select().from(changeRequestApprovals)
      .where(eq(changeRequestApprovals.changeRequestId, id))
      .orderBy(desc(changeRequestApprovals.createdAt));

    // Get associated comments
    const comments = await db.select().from(changeRequestComments)
      .where(eq(changeRequestComments.changeRequestId, id))
      .orderBy(asc(changeRequestComments.createdAt));

    res.json({
      ...request,
      impacts,
      approvals,
      comments,
    });
  } catch (error) {
    console.error('Error fetching change request:', error);
    res.status(500).json({ error: 'Failed to fetch change request' });
  }
});

// PATCH /api/projects/:projectId/change-requests/:id - Update a change request
router.patch('/projects/:projectId/change-requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    // Convert date strings to Date objects
    if (updateData.targetImplementationDate && typeof updateData.targetImplementationDate === 'string') {
      updateData.targetImplementationDate = new Date(updateData.targetImplementationDate);
    }
    if (updateData.actualImplementationDate && typeof updateData.actualImplementationDate === 'string') {
      updateData.actualImplementationDate = new Date(updateData.actualImplementationDate);
    }

    const [request] = await db.update(changeRequests)
      .set(updateData)
      .where(eq(changeRequests.id, id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error updating change request:', error);
    res.status(500).json({ error: 'Failed to update change request' });
  }
});

// DELETE /api/projects/:projectId/change-requests/:id - Delete a change request
router.delete('/projects/:projectId/change-requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete associated records first (impacts, approvals, comments)
    await db.delete(changeRequestImpacts).where(eq(changeRequestImpacts.changeRequestId, id));
    await db.delete(changeRequestApprovals).where(eq(changeRequestApprovals.changeRequestId, id));
    await db.delete(changeRequestComments).where(eq(changeRequestComments.changeRequestId, id));

    // Delete the change request
    await db.delete(changeRequests).where(eq(changeRequests.id, id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting change request:', error);
    res.status(500).json({ error: 'Failed to delete change request' });
  }
});

// =============================================================================
// Change Request Workflow Actions
// =============================================================================

// POST /api/change-requests/:id/submit - Submit for review
router.post('/change-requests/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [request] = await db.update(changeRequests)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error submitting change request:', error);
    res.status(500).json({ error: 'Failed to submit change request' });
  }
});

// POST /api/change-requests/:id/start-review - Start review process
router.post('/change-requests/:id/start-review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [request] = await db.update(changeRequests)
      .set({
        status: 'under_review',
        reviewStartedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error starting review:', error);
    res.status(500).json({ error: 'Failed to start review' });
  }
});

// POST /api/change-requests/:id/approve - Approve a change request
router.post('/change-requests/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approverId, approverName, approverRole, comments } = req.body;

    // Create approval record
    const [approval] = await db.insert(changeRequestApprovals)
      .values({
        changeRequestId: id,
        approverId,
        approverName,
        approverRole,
        decision: 'approved',
        comments,
        decidedAt: new Date(),
      })
      .returning();

    // Update the change request status to approved
    const [request] = await db.update(changeRequests)
      .set({
        status: 'approved',
        decidedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    res.json({ request, approval });
  } catch (error) {
    console.error('Error approving change request:', error);
    res.status(500).json({ error: 'Failed to approve change request' });
  }
});

// POST /api/change-requests/:id/reject - Reject a change request
router.post('/change-requests/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approverId, approverName, approverRole, comments } = req.body;

    // Create rejection record
    const [approval] = await db.insert(changeRequestApprovals)
      .values({
        changeRequestId: id,
        approverId,
        approverName,
        approverRole,
        decision: 'rejected',
        comments,
        decidedAt: new Date(),
      })
      .returning();

    // Update the change request status to rejected
    const [request] = await db.update(changeRequests)
      .set({
        status: 'rejected',
        decidedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    res.json({ request, approval });
  } catch (error) {
    console.error('Error rejecting change request:', error);
    res.status(500).json({ error: 'Failed to reject change request' });
  }
});

// POST /api/change-requests/:id/implement - Mark as implemented
router.post('/change-requests/:id/implement', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [request] = await db.update(changeRequests)
      .set({
        status: 'implemented',
        actualImplementationDate: new Date(),
        implementedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, id))
      .returning();

    if (!request) {
      return res.status(404).json({ error: 'Change request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error marking as implemented:', error);
    res.status(500).json({ error: 'Failed to mark as implemented' });
  }
});

// =============================================================================
// Change Request Impacts
// =============================================================================

// POST /api/change-requests/:id/impacts - Add an impact assessment
router.post('/change-requests/:id/impacts', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [impact] = await db.insert(changeRequestImpacts)
      .values({ ...req.body, changeRequestId: id })
      .returning();
    res.status(201).json(impact);
  } catch (error) {
    console.error('Error adding impact:', error);
    res.status(500).json({ error: 'Failed to add impact' });
  }
});

// DELETE /api/change-requests/impacts/:impactId - Remove an impact
router.delete('/change-requests/impacts/:impactId', async (req: Request, res: Response) => {
  try {
    const { impactId } = req.params;
    await db.delete(changeRequestImpacts).where(eq(changeRequestImpacts.id, impactId));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting impact:', error);
    res.status(500).json({ error: 'Failed to delete impact' });
  }
});

// =============================================================================
// Change Request Comments
// =============================================================================

// POST /api/change-requests/:id/comments - Add a comment
router.post('/change-requests/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [comment] = await db.insert(changeRequestComments)
      .values({ ...req.body, changeRequestId: id })
      .returning();
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// DELETE /api/change-requests/comments/:commentId - Remove a comment
router.delete('/change-requests/comments/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    await db.delete(changeRequestComments).where(eq(changeRequestComments.id, commentId));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// =============================================================================
// Dashboard Statistics
// =============================================================================

// GET /api/projects/:projectId/change-requests/stats - Get dashboard statistics
router.get('/projects/:projectId/change-requests/stats', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    // Get counts by status
    const statusCounts = await db.select({
      status: changeRequests.status,
      count: count(),
    })
      .from(changeRequests)
      .where(eq(changeRequests.projectId, projectId))
      .groupBy(changeRequests.status);

    // Get counts by priority
    const priorityCounts = await db.select({
      priority: changeRequests.priority,
      count: count(),
    })
      .from(changeRequests)
      .where(eq(changeRequests.projectId, projectId))
      .groupBy(changeRequests.priority);

    // Get counts by category
    const categoryCounts = await db.select({
      category: changeRequests.category,
      count: count(),
    })
      .from(changeRequests)
      .where(eq(changeRequests.projectId, projectId))
      .groupBy(changeRequests.category);

    // Get total count
    const [totalResult] = await db.select({ count: count() })
      .from(changeRequests)
      .where(eq(changeRequests.projectId, projectId));

    // Get pending approvals count
    const [pendingResult] = await db.select({ count: count() })
      .from(changeRequests)
      .where(and(
        eq(changeRequests.projectId, projectId),
        eq(changeRequests.status, 'submitted')
      ));

    // Get recent requests (last 5)
    const recentRequests = await db.select().from(changeRequests)
      .where(eq(changeRequests.projectId, projectId))
      .orderBy(desc(changeRequests.createdAt))
      .limit(5);

    res.json({
      total: totalResult?.count || 0,
      pendingApprovals: pendingResult?.count || 0,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      byPriority: priorityCounts.reduce((acc, item) => {
        acc[item.priority] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryCounts.reduce((acc, item) => {
        acc[item.category] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      recentRequests,
    });
  } catch (error) {
    console.error('Error fetching change request stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
