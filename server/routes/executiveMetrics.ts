import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  executiveMetrics,
  executiveMetricValues,
  executiveDashboards,
  executiveReports,
  successEndorsements,
  sowSuccessCriteria,
  metricIntegrations,
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// =============================================================================
// Executive Metrics CRUD
// =============================================================================

// GET /api/projects/:projectId/executive-metrics
router.get('/projects/:projectId/executive-metrics', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { role, category } = req.query;

    let metrics = await db.select().from(executiveMetrics)
      .where(eq(executiveMetrics.projectId, projectId))
      .orderBy(executiveMetrics.sortOrder);

    // Filter by role/category if provided
    if (role) {
      metrics = metrics.filter(m => m.executiveRole === role);
    }
    if (category) {
      metrics = metrics.filter(m => m.category === category);
    }

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching executive metrics:', error);
    res.status(500).json({ error: 'Failed to fetch executive metrics' });
  }
});

// POST /api/projects/:projectId/executive-metrics
router.post('/projects/:projectId/executive-metrics', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [metric] = await db.insert(executiveMetrics)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(metric);
  } catch (error) {
    console.error('Error creating executive metric:', error);
    res.status(500).json({ error: 'Failed to create executive metric' });
  }
});

// PATCH /api/executive-metrics/:id
router.patch('/executive-metrics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [metric] = await db.update(executiveMetrics)
      .set({ ...req.body, lastUpdated: new Date() })
      .where(eq(executiveMetrics.id, id))
      .returning();
    res.json(metric);
  } catch (error) {
    console.error('Error updating executive metric:', error);
    res.status(500).json({ error: 'Failed to update executive metric' });
  }
});

// DELETE /api/executive-metrics/:id
router.delete('/executive-metrics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Delete associated values first
    await db.delete(executiveMetricValues).where(eq(executiveMetricValues.metricId, id));
    await db.delete(executiveMetrics).where(eq(executiveMetrics.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting executive metric:', error);
    res.status(500).json({ error: 'Failed to delete executive metric' });
  }
});

// POST /api/executive-metrics/:id/update-value
router.post('/executive-metrics/:id/update-value', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value, userId, notes, source } = req.body;

    // Record the value
    await db.insert(executiveMetricValues).values({
      metricId: id,
      value,
      recordedBy: userId,
      notes,
      source: source || 'manual',
    });

    // Update the metric's current value and determine status
    const [existingMetric] = await db.select().from(executiveMetrics)
      .where(eq(executiveMetrics.id, id));

    let status = existingMetric?.status || 'not_started';
    if (existingMetric?.targetValue && value) {
      const target = parseFloat(existingMetric.targetValue);
      const current = parseFloat(value);
      if (!isNaN(target) && !isNaN(current)) {
        const percentage = (current / target) * 100;
        if (percentage >= 100) status = 'achieved';
        else if (percentage >= 80) status = 'on_track';
        else if (percentage >= 50) status = 'at_risk';
        else status = 'at_risk';
      }
    }

    const [metric] = await db.update(executiveMetrics)
      .set({
        currentValue: value,
        lastUpdated: new Date(),
        updatedBy: userId,
        status,
      })
      .where(eq(executiveMetrics.id, id))
      .returning();

    res.json(metric);
  } catch (error) {
    console.error('Error updating metric value:', error);
    res.status(500).json({ error: 'Failed to update metric value' });
  }
});

// POST /api/projects/:projectId/executive-metrics/seed
router.post('/projects/:projectId/executive-metrics/seed', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { executiveRole } = req.body;

    const defaultMetrics = getDefaultMetricsForRole(projectId, executiveRole);
    if (defaultMetrics.length === 0) {
      return res.status(400).json({ error: 'Invalid executive role' });
    }

    const metrics = await db.insert(executiveMetrics).values(defaultMetrics).returning();
    res.status(201).json(metrics);
  } catch (error) {
    console.error('Error seeding metrics:', error);
    res.status(500).json({ error: 'Failed to seed metrics' });
  }
});

// =============================================================================
// Metric Values History
// =============================================================================

// GET /api/executive-metrics/:id/history
router.get('/executive-metrics/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const values = await db.select().from(executiveMetricValues)
      .where(eq(executiveMetricValues.metricId, id))
      .orderBy(desc(executiveMetricValues.recordedAt));
    res.json(values);
  } catch (error) {
    console.error('Error fetching metric history:', error);
    res.status(500).json({ error: 'Failed to fetch metric history' });
  }
});

// =============================================================================
// Executive Dashboards
// =============================================================================

// GET /api/projects/:projectId/executive-dashboards
router.get('/projects/:projectId/executive-dashboards', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { role } = req.query;

    let dashboards = await db.select().from(executiveDashboards)
      .where(eq(executiveDashboards.projectId, projectId));

    if (role) {
      dashboards = dashboards.filter(d => d.executiveRole === role);
    }

    res.json(dashboards);
  } catch (error) {
    console.error('Error fetching executive dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch executive dashboards' });
  }
});

// POST /api/projects/:projectId/executive-dashboards
router.post('/projects/:projectId/executive-dashboards', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [dashboard] = await db.insert(executiveDashboards)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Error creating executive dashboard:', error);
    res.status(500).json({ error: 'Failed to create executive dashboard' });
  }
});

// =============================================================================
// Executive Reports
// =============================================================================

// GET /api/projects/:projectId/executive-reports
router.get('/projects/:projectId/executive-reports', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const reports = await db.select().from(executiveReports)
      .where(eq(executiveReports.projectId, projectId))
      .orderBy(desc(executiveReports.generatedAt));
    res.json(reports);
  } catch (error) {
    console.error('Error fetching executive reports:', error);
    res.status(500).json({ error: 'Failed to fetch executive reports' });
  }
});

// POST /api/projects/:projectId/executive-reports/generate
router.post('/projects/:projectId/executive-reports/generate', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { executiveRole, reportType, title, dateRangeStart, dateRangeEnd, userId } = req.body;

    // Get metrics for the report
    let metrics = await db.select().from(executiveMetrics)
      .where(eq(executiveMetrics.projectId, projectId));

    if (executiveRole) {
      metrics = metrics.filter(m => m.executiveRole === executiveRole);
    }

    // Generate report content
    const content = {
      metrics: metrics.map(m => ({
        name: m.metricName,
        target: m.targetValue,
        current: m.currentValue,
        status: m.status,
        category: m.category,
      })),
      summary: {
        total: metrics.length,
        achieved: metrics.filter(m => m.status === 'achieved').length,
        onTrack: metrics.filter(m => m.status === 'on_track').length,
        atRisk: metrics.filter(m => m.status === 'at_risk').length,
        missed: metrics.filter(m => m.status === 'missed').length,
      },
      generatedAt: new Date().toISOString(),
    };

    const [report] = await db.insert(executiveReports)
      .values({
        projectId,
        executiveRole,
        reportType: reportType || 'custom',
        title: title || `Executive Report - ${new Date().toLocaleDateString()}`,
        dateRangeStart,
        dateRangeEnd,
        content,
        generatedBy: userId,
      })
      .returning();

    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating executive report:', error);
    res.status(500).json({ error: 'Failed to generate executive report' });
  }
});

// =============================================================================
// Success Endorsements
// =============================================================================

// GET /api/projects/:projectId/endorsements
router.get('/projects/:projectId/endorsements', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const endorsements = await db.select().from(successEndorsements)
      .where(eq(successEndorsements.projectId, projectId));
    res.json(endorsements);
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ error: 'Failed to fetch endorsements' });
  }
});

// POST /api/projects/:projectId/endorsements
router.post('/projects/:projectId/endorsements', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [endorsement] = await db.insert(successEndorsements)
      .values({ ...req.body, projectId, requestedAt: new Date() })
      .returning();
    res.status(201).json(endorsement);
  } catch (error) {
    console.error('Error creating endorsement:', error);
    res.status(500).json({ error: 'Failed to create endorsement' });
  }
});

// PATCH /api/endorsements/:id
router.patch('/endorsements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.status === 'received' && !updates.receivedAt) {
      updates.receivedAt = new Date();
    }
    const [endorsement] = await db.update(successEndorsements)
      .set(updates)
      .where(eq(successEndorsements.id, id))
      .returning();
    res.json(endorsement);
  } catch (error) {
    console.error('Error updating endorsement:', error);
    res.status(500).json({ error: 'Failed to update endorsement' });
  }
});

// DELETE /api/endorsements/:id
router.delete('/endorsements/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(successEndorsements).where(eq(successEndorsements.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting endorsement:', error);
    res.status(500).json({ error: 'Failed to delete endorsement' });
  }
});

// =============================================================================
// SOW Success Criteria
// =============================================================================

// GET /api/projects/:projectId/sow-criteria
router.get('/projects/:projectId/sow-criteria', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const criteria = await db.select().from(sowSuccessCriteria)
      .where(eq(sowSuccessCriteria.projectId, projectId));
    res.json(criteria);
  } catch (error) {
    console.error('Error fetching SOW criteria:', error);
    res.status(500).json({ error: 'Failed to fetch SOW criteria' });
  }
});

// POST /api/projects/:projectId/sow-criteria
router.post('/projects/:projectId/sow-criteria', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const [criterion] = await db.insert(sowSuccessCriteria)
      .values({ ...req.body, projectId })
      .returning();
    res.status(201).json(criterion);
  } catch (error) {
    console.error('Error creating SOW criterion:', error);
    res.status(500).json({ error: 'Failed to create SOW criterion' });
  }
});

// POST /api/sow-criteria/:id/verify
router.post('/sow-criteria/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { achievedValue, evidence, userId } = req.body;

    // Get the criterion
    const [criterion] = await db.select().from(sowSuccessCriteria)
      .where(eq(sowSuccessCriteria.id, id));

    if (!criterion) {
      return res.status(404).json({ error: 'SOW criterion not found' });
    }

    // Compare target vs achieved (simplified - would need smarter comparison)
    let achieved = false;
    const target = parseFloat(criterion.targetValue || '0');
    const actual = parseFloat(achievedValue || '0');
    if (!isNaN(target) && !isNaN(actual)) {
      achieved = actual >= target;
    }

    const [updated] = await db.update(sowSuccessCriteria)
      .set({
        achievedValue,
        evidence,
        status: achieved ? 'achieved' : 'not_achieved',
        verifiedAt: new Date(),
        verifiedBy: userId,
      })
      .where(eq(sowSuccessCriteria.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error verifying SOW criterion:', error);
    res.status(500).json({ error: 'Failed to verify SOW criterion' });
  }
});

// DELETE /api/sow-criteria/:id
router.delete('/sow-criteria/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(sowSuccessCriteria).where(eq(sowSuccessCriteria.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting SOW criterion:', error);
    res.status(500).json({ error: 'Failed to delete SOW criterion' });
  }
});

// =============================================================================
// Metric Integrations
// =============================================================================

// GET /api/hospitals/:hospitalId/metric-integrations
router.get('/hospitals/:hospitalId/metric-integrations', async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const integrations = await db.select().from(metricIntegrations)
      .where(eq(metricIntegrations.hospitalId, hospitalId));
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching metric integrations:', error);
    res.status(500).json({ error: 'Failed to fetch metric integrations' });
  }
});

// POST /api/hospitals/:hospitalId/metric-integrations
router.post('/hospitals/:hospitalId/metric-integrations', async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const [integration] = await db.insert(metricIntegrations)
      .values({ ...req.body, hospitalId })
      .returning();
    res.status(201).json(integration);
  } catch (error) {
    console.error('Error creating metric integration:', error);
    res.status(500).json({ error: 'Failed to create metric integration' });
  }
});

// POST /api/metric-integrations/:id/sync
router.post('/metric-integrations/:id/sync', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Would implement actual sync logic here
    const [integration] = await db.update(metricIntegrations)
      .set({ lastSyncAt: new Date(), updatedAt: new Date() })
      .where(eq(metricIntegrations.id, id))
      .returning();
    res.json({ success: true, integration });
  } catch (error) {
    console.error('Error syncing metric integration:', error);
    res.status(500).json({ error: 'Failed to sync metric integration' });
  }
});

// DELETE /api/metric-integrations/:id
router.delete('/metric-integrations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(metricIntegrations).where(eq(metricIntegrations.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting metric integration:', error);
    res.status(500).json({ error: 'Failed to delete metric integration' });
  }
});

// =============================================================================
// Summary Endpoints
// =============================================================================

// GET /api/projects/:projectId/executive-summary
router.get('/projects/:projectId/executive-summary', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { role } = req.query;

    // Get all metrics for this project (optionally filtered by role)
    let metrics = await db.select().from(executiveMetrics)
      .where(eq(executiveMetrics.projectId, projectId));

    if (role) {
      metrics = metrics.filter(m => m.executiveRole === role);
    }

    // Calculate summary stats
    const total = metrics.length;
    const achieved = metrics.filter(m => m.status === 'achieved').length;
    const onTrack = metrics.filter(m => m.status === 'on_track').length;
    const atRisk = metrics.filter(m => m.status === 'at_risk').length;
    const missed = metrics.filter(m => m.status === 'missed').length;
    const notStarted = metrics.filter(m => m.status === 'not_started').length;

    // Group by category
    const byCategory = {
      pre_golive: metrics.filter(m => m.category === 'pre_golive'),
      at_golive: metrics.filter(m => m.category === 'at_golive'),
      post_golive: metrics.filter(m => m.category === 'post_golive'),
      long_term: metrics.filter(m => m.category === 'long_term'),
    };

    // Group by role
    const byRole = {
      ceo: metrics.filter(m => m.executiveRole === 'ceo'),
      cfo: metrics.filter(m => m.executiveRole === 'cfo'),
      cio: metrics.filter(m => m.executiveRole === 'cio'),
      cto: metrics.filter(m => m.executiveRole === 'cto'),
      cmio: metrics.filter(m => m.executiveRole === 'cmio'),
      cno: metrics.filter(m => m.executiveRole === 'cno'),
    };

    // Get endorsements count
    const endorsements = await db.select().from(successEndorsements)
      .where(eq(successEndorsements.projectId, projectId));

    // Get SOW criteria
    const sowCriteria = await db.select().from(sowSuccessCriteria)
      .where(eq(sowSuccessCriteria.projectId, projectId));

    res.json({
      role: role || 'all',
      summary: { total, achieved, onTrack, atRisk, missed, notStarted },
      achievementRate: total > 0 ? Math.round((achieved / total) * 100) : 0,
      progressRate: total > 0 ? Math.round(((achieved + onTrack) / total) * 100) : 0,
      byCategory,
      byRole,
      endorsements: {
        total: endorsements.length,
        pending: endorsements.filter(e => e.status === 'pending').length,
        received: endorsements.filter(e => e.status === 'received').length,
        published: endorsements.filter(e => e.status === 'published').length,
      },
      sowCriteria: {
        total: sowCriteria.length,
        achieved: sowCriteria.filter(c => c.status === 'achieved').length,
        pending: sowCriteria.filter(c => c.status === 'pending').length,
      },
      metrics,
    });
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    res.status(500).json({ error: 'Failed to fetch executive summary' });
  }
});

// =============================================================================
// Helper Functions
// =============================================================================

function getDefaultMetricsForRole(projectId: string, role: string): any[] {
  const metricsByRole: Record<string, any[]> = {
    ceo: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Project on schedule', targetValue: '95', targetUnit: 'percentage', description: 'Project milestones completed on time' },
      { category: 'pre_golive', metricName: 'Stakeholder alignment', targetValue: '100', targetUnit: 'percentage', description: 'Key stakeholders aligned on project goals' },
      { category: 'pre_golive', metricName: 'Staff readiness', targetValue: '90', targetUnit: 'percentage', description: 'Staff trained and ready for go-live' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Zero critical incidents', targetValue: '0', targetUnit: 'count', description: 'No critical patient safety incidents' },
      { category: 'at_golive', metricName: 'Patient care continuity', targetValue: '100', targetUnit: 'percentage', description: 'Uninterrupted patient care during transition' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Patient satisfaction maintained', targetValue: '95', targetUnit: 'percentage', description: 'Patient satisfaction scores maintained' },
      { category: 'post_golive', metricName: 'Regulatory compliance', targetValue: '100', targetUnit: 'percentage', description: 'All regulatory requirements met' },
      // Long-term
      { category: 'long_term', metricName: 'Strategic objectives achieved', targetValue: '90', targetUnit: 'percentage', description: 'Strategic goals from business case achieved' },
      { category: 'long_term', metricName: 'Quality rankings maintained', targetValue: '100', targetUnit: 'percentage', description: 'Hospital quality rankings maintained or improved' },
    ],
    cfo: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Budget adherence', targetValue: '90', targetUnit: 'percentage', description: 'Project within 10% of approved budget' },
      { category: 'pre_golive', metricName: 'Change orders controlled', targetValue: '15', targetUnit: 'percentage', description: 'Change orders under 15% of original scope' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Revenue cycle disruption', targetValue: '10', targetUnit: 'percentage', description: 'Revenue disruption limited to 10%' },
      { category: 'at_golive', metricName: 'Charge capture rate', targetValue: '95', targetUnit: 'percentage', description: 'Charge capture maintained at 95%' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Days in A/R', targetValue: '50', targetUnit: 'days', description: 'Days in accounts receivable under 50' },
      { category: 'post_golive', metricName: 'Clean claim rate', targetValue: '90', targetUnit: 'percentage', description: 'First-pass claim acceptance rate' },
      // Long-term
      { category: 'long_term', metricName: 'ROI achievement', targetValue: '18', targetUnit: 'months', description: 'Return on investment within 18 months' },
      { category: 'long_term', metricName: 'Operating margin', targetValue: '100', targetUnit: 'percentage', description: 'Operating margin maintained or improved' },
    ],
    cio: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Infrastructure readiness', targetValue: '100', targetUnit: 'percentage', description: 'All infrastructure components ready' },
      { category: 'pre_golive', metricName: 'Integration testing complete', targetValue: '100', targetUnit: 'percentage', description: 'All interfaces tested and validated' },
      { category: 'pre_golive', metricName: 'End-user training', targetValue: '95', targetUnit: 'percentage', description: 'All users completed required training' },
      // At Go-Live
      { category: 'at_golive', metricName: 'System uptime', targetValue: '99.5', targetUnit: 'percentage', description: 'System availability during go-live' },
      { category: 'at_golive', metricName: 'Critical issues resolved', targetValue: '4', targetUnit: 'hours', description: 'Critical issues resolved within 4 hours' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'User adoption rate', targetValue: '90', targetUnit: 'percentage', description: 'Active user adoption of new system' },
      { category: 'post_golive', metricName: 'Ticket volume declining', targetValue: '100', targetUnit: 'percentage', description: 'Support ticket volume trending down' },
      // Long-term
      { category: 'long_term', metricName: 'HIMSS EMRAM score', targetValue: '6', targetUnit: 'score', description: 'Achieve HIMSS EMRAM Stage 6 or higher' },
      { category: 'long_term', metricName: 'User satisfaction', targetValue: '80', targetUnit: 'percentile', description: 'User satisfaction in 80th percentile' },
    ],
    cto: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Infrastructure capacity', targetValue: '150', targetUnit: 'percentage', description: 'Infrastructure scaled for 150% of expected load' },
      { category: 'pre_golive', metricName: 'Security compliance', targetValue: '100', targetUnit: 'percentage', description: 'All security controls validated' },
      { category: 'pre_golive', metricName: 'Disaster recovery tested', targetValue: '100', targetUnit: 'percentage', description: 'DR procedures tested successfully' },
      // At Go-Live
      { category: 'at_golive', metricName: 'System response time', targetValue: '2', targetUnit: 'seconds', description: 'Average response time under 2 seconds' },
      { category: 'at_golive', metricName: 'Zero security incidents', targetValue: '0', targetUnit: 'count', description: 'No security breaches during go-live' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'System availability', targetValue: '99.9', targetUnit: 'percentage', description: 'System uptime of 99.9%' },
      { category: 'post_golive', metricName: 'Security audit passed', targetValue: '100', targetUnit: 'percentage', description: 'Post-go-live security audit passed' },
      // Long-term
      { category: 'long_term', metricName: 'TCO optimization', targetValue: '15', targetUnit: 'percentage', description: 'Total cost of ownership reduced by 15%' },
    ],
    cmio: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Physician training completion', targetValue: '95', targetUnit: 'percentage', description: 'All physicians completed training' },
      { category: 'pre_golive', metricName: 'Order sets built', targetValue: '100', targetUnit: 'percentage', description: 'Required order sets configured and tested' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Physician adoption', targetValue: '85', targetUnit: 'percentage', description: 'Physicians actively using the system' },
      { category: 'at_golive', metricName: 'CPOE usage', targetValue: '90', targetUnit: 'percentage', description: 'Computerized provider order entry usage' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Physician satisfaction', targetValue: '75', targetUnit: 'percentage', description: 'Physician satisfaction with new system' },
      { category: 'post_golive', metricName: 'Same-day documentation', targetValue: '80', targetUnit: 'percentage', description: 'Notes completed same day as encounter' },
      // Long-term
      { category: 'long_term', metricName: 'Quality metrics improved', targetValue: '100', targetUnit: 'percentage', description: 'Clinical quality metrics maintained or improved' },
      { category: 'long_term', metricName: 'Physician retention', targetValue: '100', targetUnit: 'percentage', description: 'No physician turnover due to EHR' },
    ],
    cno: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Nurse training completion', targetValue: '98', targetUnit: 'percentage', description: 'All nursing staff completed training' },
      { category: 'pre_golive', metricName: 'Super user readiness', targetValue: '100', targetUnit: 'percentage', description: 'All nursing super users ready' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Nursing documentation', targetValue: '90', targetUnit: 'percentage', description: 'Nurses completing documentation in system' },
      { category: 'at_golive', metricName: 'Barcode scanning compliance', targetValue: '95', targetUnit: 'percentage', description: 'Medication administration scanning rate' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Documentation time reduction', targetValue: '15', targetUnit: 'percentage', description: 'Reduction in documentation time' },
      { category: 'post_golive', metricName: 'Nurse EHR satisfaction', targetValue: '75', targetUnit: 'percentage', description: 'Nursing satisfaction with new system' },
      // Long-term
      { category: 'long_term', metricName: 'Nurse turnover stable', targetValue: '100', targetUnit: 'percentage', description: 'No increase in nurse turnover' },
      { category: 'long_term', metricName: 'Time at bedside increased', targetValue: '100', targetUnit: 'percentage', description: 'More time spent with patients' },
    ],
  };

  const roleMetrics = metricsByRole[role] || [];
  return roleMetrics.map((m, i) => ({
    ...m,
    projectId,
    executiveRole: role,
    sortOrder: i,
    status: 'not_started',
    dataSource: 'manual',
  }));
}

export default router;
