# Executive Success Metrics Implementation Plan

## Overview
Build role-based dashboards for C-suite executives (CEO, CFO, CIO, CTO, CMIO, CNO) to track EHR implementation success metrics using **Option 1 + Feature Flag** approach.

**Approach:**
- All new files in isolated folders
- Feature flag to enable/disable
- No modifications to existing code (except 1 route import)
- Role-based access control

---

## Phase 0: Feature Flag Setup

### 0.1 Add to Feature Flags
**File:** `shared/featureFlags.ts`
```typescript
export const FEATURES = {
  TDR_MODULE: process.env.ENABLE_TDR === 'true',
  EXECUTIVE_METRICS: process.env.ENABLE_EXECUTIVE_METRICS === 'true',  // ADD
};
```

### 0.2 Update Environment
**File:** `.env`
```bash
ENABLE_EXECUTIVE_METRICS=false  # Start disabled
```

### 0.3 Checklist
- [ ] Add `EXECUTIVE_METRICS` to feature flags
- [ ] Add to `.env` and `.env.example`
- [ ] Test flag toggling

---

## Phase 1: Database Schema

### 1.1 New Tables Required

**File:** `shared/schema.ts` (ADD to existing file)

```typescript
// =============================================================================
// Executive Metrics Tables
// =============================================================================

// Executive Success Metrics - Define what success looks like
export const executiveMetrics = pgTable('executive_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  hospitalId: uuid('hospital_id').references(() => hospitals.id),
  executiveRole: text('executive_role').notNull(), // ceo, cfo, cio, cto, cmio, cno
  category: text('category').notNull(), // pre_golive, at_golive, post_golive, long_term
  metricName: text('metric_name').notNull(),
  description: text('description'),
  targetValue: text('target_value').notNull(),
  targetUnit: text('target_unit'), // percentage, count, days, dollars, score
  baselineValue: text('baseline_value'),
  currentValue: text('current_value'),
  status: text('status').default('not_started'), // not_started, on_track, at_risk, achieved, missed
  dataSource: text('data_source'), // manual, ehr_integration, hr_integration, etc.
  lastUpdated: timestamp('last_updated'),
  updatedBy: uuid('updated_by').references(() => users.id),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Executive Metric Values - Track changes over time
export const executiveMetricValues = pgTable('executive_metric_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  metricId: uuid('metric_id').references(() => executiveMetrics.id).notNull(),
  value: text('value').notNull(),
  recordedAt: timestamp('recorded_at').defaultNow(),
  recordedBy: uuid('recorded_by').references(() => users.id),
  source: text('source'), // manual, automated, integration
  notes: text('notes'),
});

// Executive Dashboards - Saved dashboard configurations
export const executiveDashboards = pgTable('executive_dashboards', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  executiveRole: text('executive_role').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  config: jsonb('config'), // widget layout, filters, etc.
  isDefault: boolean('is_default').default(false),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Executive Reports - Generated reports
export const executiveReports = pgTable('executive_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  executiveRole: text('executive_role'),
  reportType: text('report_type').notNull(), // weekly, monthly, milestone, custom
  title: text('title').notNull(),
  dateRangeStart: timestamp('date_range_start'),
  dateRangeEnd: timestamp('date_range_end'),
  content: jsonb('content'), // metrics snapshot, charts data
  generatedAt: timestamp('generated_at').defaultNow(),
  generatedBy: uuid('generated_by').references(() => users.id),
  format: text('format').default('pdf'), // pdf, excel, dashboard
  fileUrl: text('file_url'),
});

// Success Endorsements - Track client endorsements
export const successEndorsements = pgTable('success_endorsements', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  hospitalId: uuid('hospital_id').references(() => hospitals.id),
  executiveRole: text('executive_role').notNull(),
  executiveName: text('executive_name').notNull(),
  executiveTitle: text('executive_title'),
  endorsementType: text('endorsement_type'), // testimonial, reference, case_study, speaking
  content: text('content'),
  status: text('status').default('pending'), // pending, approved, received, published
  requestedAt: timestamp('requested_at'),
  receivedAt: timestamp('received_at'),
  metricsAchieved: jsonb('metrics_achieved'), // which success criteria were met
  permissionToUse: boolean('permission_to_use').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// SOW Success Criteria - Link metrics to contracts
export const sowSuccessCriteria = pgTable('sow_success_criteria', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  contractId: uuid('contract_id').references(() => contracts.id),
  executiveRole: text('executive_role').notNull(),
  criteriaText: text('criteria_text').notNull(),
  metricId: uuid('metric_id').references(() => executiveMetrics.id),
  targetValue: text('target_value'),
  achievedValue: text('achieved_value'),
  status: text('status').default('pending'), // pending, achieved, not_achieved
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  evidence: text('evidence'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Integration Configs - Hospital system integrations
export const metricIntegrations = pgTable('metric_integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  hospitalId: uuid('hospital_id').references(() => hospitals.id).notNull(),
  systemType: text('system_type').notNull(), // ehr, revenue_cycle, hr, quality, help_desk
  systemName: text('system_name'), // Epic, Cerner, Workday, etc.
  connectionType: text('connection_type'), // api, hl7, fhir, sftp, manual
  connectionConfig: jsonb('connection_config'), // encrypted credentials, endpoints
  status: text('status').default('pending'), // pending, connected, failed, disabled
  lastSyncAt: timestamp('last_sync_at'),
  syncFrequency: text('sync_frequency'), // realtime, hourly, daily, weekly
  dataPoints: jsonb('data_points'), // which metrics this integration provides
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 1.2 Checklist
- [ ] Add `executiveMetrics` table
- [ ] Add `executiveMetricValues` table
- [ ] Add `executiveDashboards` table
- [ ] Add `executiveReports` table
- [ ] Add `successEndorsements` table
- [ ] Add `sowSuccessCriteria` table
- [ ] Add `metricIntegrations` table
- [ ] Run `npm run db:push`
- [ ] Verify tables created

---

## Phase 2: Backend API Routes

### 2.1 File Structure
```
server/
├── routes.ts                         ← ADD import
└── routes/
    └── executiveMetrics.ts           ← NEW FILE
```

### 2.2 Executive Metrics Routes
**File:** `server/routes/executiveMetrics.ts`

```typescript
import { Router } from 'express';
import { db } from '../db';
import {
  executiveMetrics,
  executiveMetricValues,
  executiveDashboards,
  executiveReports,
  successEndorsements,
  sowSuccessCriteria,
  metricIntegrations
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// =============================================================================
// Executive Metrics CRUD
// =============================================================================

// GET /api/projects/:projectId/executive-metrics
router.get('/projects/:projectId/executive-metrics', async (req, res) => {
  const { projectId } = req.params;
  const { role, category } = req.query;

  let query = db.select().from(executiveMetrics)
    .where(eq(executiveMetrics.projectId, projectId));

  const metrics = await query.orderBy(executiveMetrics.sortOrder);

  // Filter by role/category if provided
  let filtered = metrics;
  if (role) filtered = filtered.filter(m => m.executiveRole === role);
  if (category) filtered = filtered.filter(m => m.category === category);

  res.json(filtered);
});

// POST /api/projects/:projectId/executive-metrics
router.post('/projects/:projectId/executive-metrics', async (req, res) => {
  const { projectId } = req.params;
  const [metric] = await db.insert(executiveMetrics)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(metric);
});

// PATCH /api/executive-metrics/:id
router.patch('/executive-metrics/:id', async (req, res) => {
  const { id } = req.params;
  const [metric] = await db.update(executiveMetrics)
    .set({ ...req.body, lastUpdated: new Date() })
    .where(eq(executiveMetrics.id, id))
    .returning();
  res.json(metric);
});

// POST /api/executive-metrics/:id/update-value
router.post('/executive-metrics/:id/update-value', async (req, res) => {
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

  // Update the metric's current value
  const [metric] = await db.update(executiveMetrics)
    .set({
      currentValue: value,
      lastUpdated: new Date(),
      updatedBy: userId,
    })
    .where(eq(executiveMetrics.id, id))
    .returning();

  res.json(metric);
});

// POST /api/projects/:projectId/executive-metrics/seed
router.post('/projects/:projectId/executive-metrics/seed', async (req, res) => {
  const { projectId } = req.params;
  const { executiveRole } = req.body;

  const defaultMetrics = getDefaultMetricsForRole(projectId, executiveRole);
  const metrics = await db.insert(executiveMetrics).values(defaultMetrics).returning();
  res.status(201).json(metrics);
});

// =============================================================================
// Metric Values History
// =============================================================================

// GET /api/executive-metrics/:id/history
router.get('/executive-metrics/:id/history', async (req, res) => {
  const { id } = req.params;
  const values = await db.select().from(executiveMetricValues)
    .where(eq(executiveMetricValues.metricId, id))
    .orderBy(desc(executiveMetricValues.recordedAt));
  res.json(values);
});

// =============================================================================
// Executive Dashboards
// =============================================================================

// GET /api/projects/:projectId/executive-dashboards
router.get('/projects/:projectId/executive-dashboards', async (req, res) => {
  const { projectId } = req.params;
  const { role } = req.query;

  let query = db.select().from(executiveDashboards)
    .where(eq(executiveDashboards.projectId, projectId));

  const dashboards = await query;
  res.json(role ? dashboards.filter(d => d.executiveRole === role) : dashboards);
});

// POST /api/projects/:projectId/executive-dashboards
router.post('/projects/:projectId/executive-dashboards', async (req, res) => {
  const { projectId } = req.params;
  const [dashboard] = await db.insert(executiveDashboards)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(dashboard);
});

// =============================================================================
// Executive Reports
// =============================================================================

// GET /api/projects/:projectId/executive-reports
router.get('/projects/:projectId/executive-reports', async (req, res) => {
  const { projectId } = req.params;
  const reports = await db.select().from(executiveReports)
    .where(eq(executiveReports.projectId, projectId))
    .orderBy(desc(executiveReports.generatedAt));
  res.json(reports);
});

// POST /api/projects/:projectId/executive-reports/generate
router.post('/projects/:projectId/executive-reports/generate', async (req, res) => {
  const { projectId } = req.params;
  const { executiveRole, reportType, title, dateRangeStart, dateRangeEnd, userId } = req.body;

  // Get metrics for the report
  const metrics = await db.select().from(executiveMetrics)
    .where(and(
      eq(executiveMetrics.projectId, projectId),
      executiveRole ? eq(executiveMetrics.executiveRole, executiveRole) : undefined
    ));

  // Generate report content
  const content = {
    metrics: metrics.map(m => ({
      name: m.metricName,
      target: m.targetValue,
      current: m.currentValue,
      status: m.status,
    })),
    generatedAt: new Date().toISOString(),
  };

  const [report] = await db.insert(executiveReports)
    .values({
      projectId,
      executiveRole,
      reportType,
      title,
      dateRangeStart,
      dateRangeEnd,
      content,
      generatedBy: userId,
    })
    .returning();

  res.status(201).json(report);
});

// =============================================================================
// Success Endorsements
// =============================================================================

// GET /api/projects/:projectId/endorsements
router.get('/projects/:projectId/endorsements', async (req, res) => {
  const { projectId } = req.params;
  const endorsements = await db.select().from(successEndorsements)
    .where(eq(successEndorsements.projectId, projectId));
  res.json(endorsements);
});

// POST /api/projects/:projectId/endorsements
router.post('/projects/:projectId/endorsements', async (req, res) => {
  const { projectId } = req.params;
  const [endorsement] = await db.insert(successEndorsements)
    .values({ ...req.body, projectId, requestedAt: new Date() })
    .returning();
  res.status(201).json(endorsement);
});

// PATCH /api/endorsements/:id
router.patch('/endorsements/:id', async (req, res) => {
  const { id } = req.params;
  const [endorsement] = await db.update(successEndorsements)
    .set(req.body)
    .where(eq(successEndorsements.id, id))
    .returning();
  res.json(endorsement);
});

// =============================================================================
// SOW Success Criteria
// =============================================================================

// GET /api/projects/:projectId/sow-criteria
router.get('/projects/:projectId/sow-criteria', async (req, res) => {
  const { projectId } = req.params;
  const criteria = await db.select().from(sowSuccessCriteria)
    .where(eq(sowSuccessCriteria.projectId, projectId));
  res.json(criteria);
});

// POST /api/projects/:projectId/sow-criteria
router.post('/projects/:projectId/sow-criteria', async (req, res) => {
  const { projectId } = req.params;
  const [criterion] = await db.insert(sowSuccessCriteria)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(criterion);
});

// POST /api/sow-criteria/:id/verify
router.post('/sow-criteria/:id/verify', async (req, res) => {
  const { id } = req.params;
  const { achievedValue, evidence, userId } = req.body;

  // Determine if achieved
  const [criterion] = await db.select().from(sowSuccessCriteria)
    .where(eq(sowSuccessCriteria.id, id));

  // Compare target vs achieved (simplified - would need smarter comparison)
  const achieved = achievedValue >= criterion.targetValue;

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
});

// =============================================================================
// Metric Integrations
// =============================================================================

// GET /api/hospitals/:hospitalId/metric-integrations
router.get('/hospitals/:hospitalId/metric-integrations', async (req, res) => {
  const { hospitalId } = req.params;
  const integrations = await db.select().from(metricIntegrations)
    .where(eq(metricIntegrations.hospitalId, hospitalId));
  res.json(integrations);
});

// POST /api/hospitals/:hospitalId/metric-integrations
router.post('/hospitals/:hospitalId/metric-integrations', async (req, res) => {
  const { hospitalId } = req.params;
  const [integration] = await db.insert(metricIntegrations)
    .values({ ...req.body, hospitalId })
    .returning();
  res.status(201).json(integration);
});

// POST /api/metric-integrations/:id/sync
router.post('/metric-integrations/:id/sync', async (req, res) => {
  const { id } = req.params;
  // Would implement actual sync logic here
  const [integration] = await db.update(metricIntegrations)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(metricIntegrations.id, id))
    .returning();
  res.json({ success: true, integration });
});

// =============================================================================
// Summary Endpoints
// =============================================================================

// GET /api/projects/:projectId/executive-summary/:role
router.get('/projects/:projectId/executive-summary/:role', async (req, res) => {
  const { projectId, role } = req.params;

  // Get all metrics for this role
  const metrics = await db.select().from(executiveMetrics)
    .where(and(
      eq(executiveMetrics.projectId, projectId),
      eq(executiveMetrics.executiveRole, role)
    ));

  // Calculate summary stats
  const total = metrics.length;
  const achieved = metrics.filter(m => m.status === 'achieved').length;
  const onTrack = metrics.filter(m => m.status === 'on_track').length;
  const atRisk = metrics.filter(m => m.status === 'at_risk').length;
  const missed = metrics.filter(m => m.status === 'missed').length;

  // Group by category
  const byCategory = {
    pre_golive: metrics.filter(m => m.category === 'pre_golive'),
    at_golive: metrics.filter(m => m.category === 'at_golive'),
    post_golive: metrics.filter(m => m.category === 'post_golive'),
    long_term: metrics.filter(m => m.category === 'long_term'),
  };

  res.json({
    role,
    summary: { total, achieved, onTrack, atRisk, missed },
    achievementRate: total > 0 ? Math.round((achieved / total) * 100) : 0,
    byCategory,
    metrics,
  });
});

// =============================================================================
// Helper Functions
// =============================================================================

function getDefaultMetricsForRole(projectId: string, role: string) {
  const metricsByRole: Record<string, any[]> = {
    ceo: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Project on schedule', targetValue: '95', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Stakeholder alignment', targetValue: '100', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Staff readiness', targetValue: '90', targetUnit: 'percentage' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Zero critical incidents', targetValue: '0', targetUnit: 'count' },
      { category: 'at_golive', metricName: 'Patient care continuity', targetValue: '100', targetUnit: 'percentage' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Patient satisfaction maintained', targetValue: '95', targetUnit: 'percentage' },
      { category: 'post_golive', metricName: 'Regulatory compliance', targetValue: '100', targetUnit: 'percentage' },
      // Long-term
      { category: 'long_term', metricName: 'Strategic objectives achieved', targetValue: '90', targetUnit: 'percentage' },
      { category: 'long_term', metricName: 'Quality rankings maintained', targetValue: 'baseline', targetUnit: 'score' },
    ],
    cfo: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Budget adherence', targetValue: '90', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Change orders', targetValue: '15', targetUnit: 'percentage' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Revenue cycle disruption', targetValue: '10', targetUnit: 'percentage' },
      { category: 'at_golive', metricName: 'Charge capture rate', targetValue: '95', targetUnit: 'percentage' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Days in A/R', targetValue: '50', targetUnit: 'days' },
      { category: 'post_golive', metricName: 'Clean claim rate', targetValue: '90', targetUnit: 'percentage' },
      // Long-term
      { category: 'long_term', metricName: 'ROI achievement', targetValue: '18', targetUnit: 'months' },
      { category: 'long_term', metricName: 'Operating margin', targetValue: 'baseline', targetUnit: 'percentage' },
    ],
    cio: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Infrastructure readiness', targetValue: '100', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Integration testing complete', targetValue: '100', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'End-user training', targetValue: '95', targetUnit: 'percentage' },
      // At Go-Live
      { category: 'at_golive', metricName: 'System uptime', targetValue: '99.5', targetUnit: 'percentage' },
      { category: 'at_golive', metricName: 'Critical issues resolved', targetValue: '4', targetUnit: 'hours' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'User adoption rate', targetValue: '90', targetUnit: 'percentage' },
      { category: 'post_golive', metricName: 'Ticket volume trend', targetValue: 'declining', targetUnit: 'trend' },
      // Long-term
      { category: 'long_term', metricName: 'HIMSS EMRAM score', targetValue: '6', targetUnit: 'score' },
      { category: 'long_term', metricName: 'User satisfaction', targetValue: '80', targetUnit: 'percentile' },
    ],
    cto: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Infrastructure capacity', targetValue: '150', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Security compliance', targetValue: '100', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Disaster recovery tested', targetValue: 'yes', targetUnit: 'boolean' },
      // At Go-Live
      { category: 'at_golive', metricName: 'System response time', targetValue: '2', targetUnit: 'seconds' },
      { category: 'at_golive', metricName: 'Zero security incidents', targetValue: '0', targetUnit: 'count' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'System availability', targetValue: '99.9', targetUnit: 'percentage' },
      { category: 'post_golive', metricName: 'Security audit passed', targetValue: 'yes', targetUnit: 'boolean' },
      // Long-term
      { category: 'long_term', metricName: 'TCO optimization', targetValue: '15', targetUnit: 'percentage' },
    ],
    cmio: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Physician training completion', targetValue: '95', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Order sets built', targetValue: '100', targetUnit: 'percentage' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Physician adoption', targetValue: '85', targetUnit: 'percentage' },
      { category: 'at_golive', metricName: 'CPOE usage', targetValue: '90', targetUnit: 'percentage' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Physician satisfaction', targetValue: '75', targetUnit: 'percentage' },
      { category: 'post_golive', metricName: 'Same-day documentation', targetValue: '80', targetUnit: 'percentage' },
      // Long-term
      { category: 'long_term', metricName: 'Quality metrics improved', targetValue: 'yes', targetUnit: 'boolean' },
      { category: 'long_term', metricName: 'Physician retention', targetValue: 'baseline', targetUnit: 'percentage' },
    ],
    cno: [
      // Pre-Go-Live
      { category: 'pre_golive', metricName: 'Nurse training completion', targetValue: '98', targetUnit: 'percentage' },
      { category: 'pre_golive', metricName: 'Super user readiness', targetValue: '100', targetUnit: 'percentage' },
      // At Go-Live
      { category: 'at_golive', metricName: 'Nursing documentation', targetValue: '90', targetUnit: 'percentage' },
      { category: 'at_golive', metricName: 'Barcode scanning compliance', targetValue: '95', targetUnit: 'percentage' },
      // Post Go-Live
      { category: 'post_golive', metricName: 'Documentation time reduction', targetValue: '15', targetUnit: 'percentage' },
      { category: 'post_golive', metricName: 'Nurse EHR satisfaction', targetValue: '75', targetUnit: 'percentage' },
      // Long-term
      { category: 'long_term', metricName: 'Nurse turnover', targetValue: 'baseline', targetUnit: 'percentage' },
      { category: 'long_term', metricName: 'Time at bedside increased', targetValue: 'yes', targetUnit: 'boolean' },
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
```

### 2.3 Connect to Main Routes
**File:** `server/routes.ts` (ADD)

```typescript
import executiveMetricsRoutes from './routes/executiveMetrics';

if (FEATURES.EXECUTIVE_METRICS) {
  app.use('/api', executiveMetricsRoutes);
}
```

### 2.4 Checklist
- [ ] Create `server/routes/executiveMetrics.ts`
- [ ] Add route import to `server/routes.ts`
- [ ] Test all endpoints
- [ ] Add request validation
- [ ] Add error handling

---

## Phase 3: Frontend Components

### 3.1 File Structure
```
client/src/
├── pages/
│   └── ExecutiveMetrics/              ← NEW FOLDER
│       ├── index.tsx                  ← Main page (role switcher)
│       ├── CEODashboard.tsx           ← CEO-specific view
│       ├── CFODashboard.tsx           ← CFO-specific view
│       ├── CIODashboard.tsx           ← CIO-specific view
│       ├── CTODashboard.tsx           ← CTO-specific view
│       ├── CMIODashboard.tsx          ← CMIO-specific view
│       ├── CNODashboard.tsx           ← CNO-specific view
│       ├── MetricEditor.tsx           ← Edit metrics
│       ├── SOWCriteriaManager.tsx     ← SOW success criteria
│       ├── EndorsementTracker.tsx     ← Track endorsements
│       └── IntegrationSetup.tsx       ← Configure integrations
├── components/
│   └── executive-metrics/             ← NEW FOLDER
│       ├── MetricCard.tsx             ← Individual metric display
│       ├── MetricProgress.tsx         ← Progress toward target
│       ├── StatusIndicator.tsx        ← On track/At risk/etc.
│       ├── CategorySection.tsx        ← Group metrics by phase
│       ├── TrendChart.tsx             ← Historical values chart
│       ├── ExecutiveSummary.tsx       ← Summary stats
│       ├── RoleSelector.tsx           ← Switch between roles
│       └── ReportGenerator.tsx        ← Generate reports
└── lib/
    └── executiveMetricsApi.ts         ← API helpers
```

### 3.2 Component Descriptions

**Main Page (`index.tsx`):**
- Project selector
- Executive role selector (CEO/CFO/CIO/CTO/CMIO/CNO)
- Routes to role-specific dashboards

**Role Dashboards:**
- Header with role name and overall achievement rate
- KPI cards (Achieved, On Track, At Risk, Missed)
- Metrics grouped by phase (Pre-Go-Live, At Go-Live, Post, Long-term)
- Each metric shows: name, target, current, status, last updated
- Quick actions: Update value, View history, Edit target

**MetricCard Component:**
- Metric name
- Target vs Current value
- Progress bar
- Status badge (achieved/on_track/at_risk/missed)
- Trend indicator
- Last updated timestamp

### 3.3 Checklist
- [ ] Create `client/src/pages/ExecutiveMetrics/index.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/CEODashboard.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/CFODashboard.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/CIODashboard.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/CTODashboard.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/CMIODashboard.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/CNODashboard.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/MetricEditor.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/SOWCriteriaManager.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/EndorsementTracker.tsx`
- [ ] Create `client/src/pages/ExecutiveMetrics/IntegrationSetup.tsx`
- [ ] Create shared components in `client/src/components/executive-metrics/`
- [ ] Add route to `client/src/App.tsx`
- [ ] Add nav item to sidebar

---

## Phase 4: Navigation & Routing

### 4.1 Add Route
**File:** `client/src/App.tsx`

```typescript
{FEATURES.EXECUTIVE_METRICS && (
  <Route path="/executive-metrics" component={ExecutiveMetricsPage} />
)}
```

### 4.2 Add Sidebar Navigation
**File:** `client/src/components/Layout.tsx`

```typescript
{FEATURES.EXECUTIVE_METRICS && (
  <NavItem href="/executive-metrics" icon={TrendingUp}>
    Executive Metrics
  </NavItem>
)}
```

### 4.3 Checklist
- [ ] Add route to App.tsx
- [ ] Add nav item to sidebar
- [ ] Test navigation with flag on/off

---

## Phase 5: Testing

### 5.1 Cypress E2E Tests
**File:** `cypress/e2e/42-executive-metrics.cy.js`

Test coverage:
- Metric CRUD operations
- Value updates and history
- Dashboard views for each role
- SOW criteria management
- Endorsement tracking
- Report generation
- Integration configuration

### 5.2 Checklist
- [ ] Create `cypress/e2e/42-executive-metrics.cy.js`
- [ ] Test all 6 role dashboards
- [ ] Test metric CRUD
- [ ] Test value tracking
- [ ] Test SOW criteria
- [ ] Test endorsements
- [ ] All tests passing

---

## Implementation Order

### Week 1: Foundation
1. Feature flag setup
2. Database schema
3. Backend routes (basic CRUD)

### Week 2: Core Features
4. Metric management
5. Value tracking
6. CEO & CFO dashboards

### Week 3: Additional Dashboards
7. CIO dashboard
8. CTO dashboard
9. CMIO & CNO dashboards

### Week 4: SOW & Endorsements
10. SOW criteria management
11. Endorsement tracking
12. Report generation

### Week 5: Integrations & Polish
13. Integration setup UI
14. Dashboard polish
15. Cypress tests

### Week 6: Rollout
16. Bug fixes
17. Documentation
18. Enable feature flag

---

## Success Criteria

| Metric | Target |
|--------|--------|
| All 6 role dashboards complete | 100% |
| All endpoints working | 100% |
| Cypress tests passing | >95% |
| Feature flag toggle works | Yes |
| No regressions | 0 failures |
| SOW integration complete | Yes |
| Endorsement tracking complete | Yes |

---

## Rollback Plan

If anything breaks:
1. **Instant:** Set `ENABLE_EXECUTIVE_METRICS=false`
2. **Code:** `git revert` commits
3. **Database:** Tables remain (unused when flag off)

---

*Created: January 2026*
*Approach: Option 1 + Feature Flag (Very Low Risk)*
