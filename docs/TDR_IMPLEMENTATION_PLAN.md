# TDR (Technical Dress Rehearsal) Implementation Plan

## Overview
Build 7 TDR features using **Option 1 + Feature Flag** approach for zero risk to existing code.

**Approach:**
- All new files in isolated folders
- Feature flag to enable/disable
- No modifications to existing code (except 1 route import)
- Incremental rollout capability

---

## Phase 0: Feature Flag Setup

### 0.1 Create Feature Flags File
**File:** `shared/featureFlags.ts`
```typescript
export const FEATURES = {
  TDR_MODULE: process.env.ENABLE_TDR === 'true',
  EXECUTIVE_METRICS: process.env.ENABLE_EXECUTIVE_METRICS === 'true',
};
```

### 0.2 Update Environment
**File:** `.env`
```bash
ENABLE_TDR=false  # Start disabled, enable when ready
ENABLE_EXECUTIVE_METRICS=false
```

### 0.3 Checklist
- [ ] Create `shared/featureFlags.ts`
- [ ] Add feature flags to `.env`
- [ ] Add to `.env.example`
- [ ] Test flag toggling works

---

## Phase 1: Database Schema

### 1.1 New Tables Required

**File:** `shared/schema.ts` (ADD to existing file - only new tables)

```typescript
// =============================================================================
// TDR (Technical Dress Rehearsal) Tables
// =============================================================================

// TDR Events - Schedule rehearsals
export const tdrEvents = pgTable('tdr_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  scheduledDate: timestamp('scheduled_date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  status: text('status').default('scheduled'), // scheduled, in_progress, completed, cancelled
  type: text('type').default('full'), // full, partial, integration_only
  leaderId: uuid('leader_id').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TDR Checklist Items
export const tdrChecklistItems = pgTable('tdr_checklist_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  tdrEventId: uuid('tdr_event_id').references(() => tdrEvents.id),
  category: text('category').notNull(), // infrastructure, integrations, data_migration, workflows, support
  title: text('title').notNull(),
  description: text('description'),
  isCompleted: boolean('is_completed').default(false),
  completedBy: uuid('completed_by').references(() => users.id),
  completedAt: timestamp('completed_at'),
  priority: text('priority').default('medium'), // low, medium, high, critical
  sortOrder: integer('sort_order').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// TDR Test Scenarios
export const tdrTestScenarios = pgTable('tdr_test_scenarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  tdrEventId: uuid('tdr_event_id').references(() => tdrEvents.id),
  category: text('category').notNull(), // workflow, integration, performance, security, downtime
  title: text('title').notNull(),
  description: text('description'),
  expectedResult: text('expected_result'),
  actualResult: text('actual_result'),
  status: text('status').default('pending'), // pending, passed, failed, blocked, skipped
  testedBy: uuid('tested_by').references(() => users.id),
  testedAt: timestamp('tested_at'),
  priority: text('priority').default('medium'),
  department: text('department'), // ED, ICU, OR, Lab, Pharmacy, etc.
  stepsToReproduce: text('steps_to_reproduce'),
  attachments: jsonb('attachments'), // screenshots, logs
  createdAt: timestamp('created_at').defaultNow(),
});

// TDR Issues (separate from go-live tickets)
export const tdrIssues = pgTable('tdr_issues', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  tdrEventId: uuid('tdr_event_id').references(() => tdrEvents.id),
  testScenarioId: uuid('test_scenario_id').references(() => tdrTestScenarios.id),
  issueNumber: text('issue_number'),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // technical, workflow, integration, data, training
  severity: text('severity').default('medium'), // low, medium, high, critical
  status: text('status').default('open'), // open, in_progress, resolved, deferred, wont_fix
  assignedTo: uuid('assigned_to').references(() => users.id),
  reportedBy: uuid('reported_by').references(() => users.id),
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at'),
  dueDate: timestamp('due_date'),
  blocksGoLive: boolean('blocks_go_live').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TDR Integration Test Results
export const tdrIntegrationTests = pgTable('tdr_integration_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  tdrEventId: uuid('tdr_event_id').references(() => tdrEvents.id),
  interfaceName: text('interface_name').notNull(), // ADT, Lab, Pharmacy, Radiology, etc.
  interfaceType: text('interface_type'), // HL7, FHIR, API, File
  sourceSystem: text('source_system'),
  targetSystem: text('target_system'),
  direction: text('direction'), // inbound, outbound, bidirectional
  testType: text('test_type'), // connectivity, data_validation, performance, error_handling
  status: text('status').default('pending'), // pending, passed, failed, partial
  messagesSent: integer('messages_sent').default(0),
  messagesReceived: integer('messages_received').default(0),
  errorsCount: integer('errors_count').default(0),
  responseTimeMs: integer('response_time_ms'),
  testedAt: timestamp('tested_at'),
  testedBy: uuid('tested_by').references(() => users.id),
  notes: text('notes'),
  errorLog: text('error_log'),
  createdAt: timestamp('created_at').defaultNow(),
});

// TDR Downtime Procedure Tests
export const tdrDowntimeTests = pgTable('tdr_downtime_tests', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  tdrEventId: uuid('tdr_event_id').references(() => tdrEvents.id),
  procedureName: text('procedure_name').notNull(),
  procedureType: text('procedure_type'), // planned_downtime, unplanned_downtime, backup, restore, failover
  description: text('description'),
  expectedDuration: integer('expected_duration_minutes'),
  actualDuration: integer('actual_duration_minutes'),
  status: text('status').default('pending'), // pending, passed, failed, partial
  testedAt: timestamp('tested_at'),
  testedBy: uuid('tested_by').references(() => users.id),
  stepsCompleted: jsonb('steps_completed'), // array of step statuses
  issues: text('issues'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// TDR Readiness Scores (aggregated)
export const tdrReadinessScores = pgTable('tdr_readiness_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  tdrEventId: uuid('tdr_event_id').references(() => tdrEvents.id),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  technicalScore: integer('technical_score'), // 0-100
  dataScore: integer('data_score'), // 0-100
  staffScore: integer('staff_score'), // 0-100
  supportScore: integer('support_score'), // 0-100
  processScore: integer('process_score'), // 0-100
  overallScore: integer('overall_score'), // weighted average
  recommendation: text('recommendation'), // go, conditional_go, no_go
  criticalIssuesCount: integer('critical_issues_count'),
  highIssuesCount: integer('high_issues_count'),
  notes: text('notes'),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
});
```

### 1.2 Checklist
- [ ] Add `tdrEvents` table to schema
- [ ] Add `tdrChecklistItems` table to schema
- [ ] Add `tdrTestScenarios` table to schema
- [ ] Add `tdrIssues` table to schema
- [ ] Add `tdrIntegrationTests` table to schema
- [ ] Add `tdrDowntimeTests` table to schema
- [ ] Add `tdrReadinessScores` table to schema
- [ ] Run `npm run db:push` to create tables
- [ ] Verify tables created in database

---

## Phase 2: Backend API Routes

### 2.1 File Structure
```
server/
├── routes.ts                    ← ADD 1 line to import TDR routes
└── routes/
    └── tdr.ts                   ← NEW FILE (all TDR endpoints)
```

### 2.2 TDR Routes File
**File:** `server/routes/tdr.ts`

```typescript
import { Router } from 'express';
import { db } from '../db';
import {
  tdrEvents,
  tdrChecklistItems,
  tdrTestScenarios,
  tdrIssues,
  tdrIntegrationTests,
  tdrDowntimeTests,
  tdrReadinessScores
} from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// =============================================================================
// TDR Events (Cutover Rehearsal Scheduling)
// =============================================================================

// GET /api/projects/:projectId/tdr/events
router.get('/projects/:projectId/tdr/events', async (req, res) => {
  const { projectId } = req.params;
  const events = await db.select().from(tdrEvents)
    .where(eq(tdrEvents.projectId, projectId))
    .orderBy(desc(tdrEvents.scheduledDate));
  res.json(events);
});

// POST /api/projects/:projectId/tdr/events
router.post('/projects/:projectId/tdr/events', async (req, res) => {
  const { projectId } = req.params;
  const [event] = await db.insert(tdrEvents)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(event);
});

// PATCH /api/tdr/events/:id
router.patch('/tdr/events/:id', async (req, res) => {
  const { id } = req.params;
  const [event] = await db.update(tdrEvents)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(tdrEvents.id, id))
    .returning();
  res.json(event);
});

// DELETE /api/tdr/events/:id
router.delete('/tdr/events/:id', async (req, res) => {
  await db.delete(tdrEvents).where(eq(tdrEvents.id, id));
  res.status(204).send();
});

// =============================================================================
// TDR Checklist Items
// =============================================================================

// GET /api/projects/:projectId/tdr/checklist
router.get('/projects/:projectId/tdr/checklist', async (req, res) => {
  const { projectId } = req.params;
  const { eventId, category } = req.query;

  let query = db.select().from(tdrChecklistItems)
    .where(eq(tdrChecklistItems.projectId, projectId));

  // Add filters if provided
  const items = await query.orderBy(tdrChecklistItems.sortOrder);
  res.json(items);
});

// POST /api/projects/:projectId/tdr/checklist
router.post('/projects/:projectId/tdr/checklist', async (req, res) => {
  const { projectId } = req.params;
  const [item] = await db.insert(tdrChecklistItems)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(item);
});

// PATCH /api/tdr/checklist/:id
router.patch('/tdr/checklist/:id', async (req, res) => {
  const { id } = req.params;
  const [item] = await db.update(tdrChecklistItems)
    .set(req.body)
    .where(eq(tdrChecklistItems.id, id))
    .returning();
  res.json(item);
});

// POST /api/tdr/checklist/:id/complete
router.post('/tdr/checklist/:id/complete', async (req, res) => {
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
  res.json(item);
});

// POST /api/projects/:projectId/tdr/checklist/seed
router.post('/projects/:projectId/tdr/checklist/seed', async (req, res) => {
  // Seed default checklist items for a project
  const { projectId } = req.params;
  const defaultItems = getDefaultTdrChecklist(projectId);
  const items = await db.insert(tdrChecklistItems).values(defaultItems).returning();
  res.status(201).json(items);
});

// =============================================================================
// TDR Test Scenarios
// =============================================================================

// GET /api/projects/:projectId/tdr/test-scenarios
router.get('/projects/:projectId/tdr/test-scenarios', async (req, res) => {
  const { projectId } = req.params;
  const scenarios = await db.select().from(tdrTestScenarios)
    .where(eq(tdrTestScenarios.projectId, projectId));
  res.json(scenarios);
});

// POST /api/projects/:projectId/tdr/test-scenarios
router.post('/projects/:projectId/tdr/test-scenarios', async (req, res) => {
  const { projectId } = req.params;
  const [scenario] = await db.insert(tdrTestScenarios)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(scenario);
});

// PATCH /api/tdr/test-scenarios/:id
router.patch('/tdr/test-scenarios/:id', async (req, res) => {
  const { id } = req.params;
  const [scenario] = await db.update(tdrTestScenarios)
    .set(req.body)
    .where(eq(tdrTestScenarios.id, id))
    .returning();
  res.json(scenario);
});

// POST /api/tdr/test-scenarios/:id/execute
router.post('/tdr/test-scenarios/:id/execute', async (req, res) => {
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
  res.json(scenario);
});

// =============================================================================
// TDR Issues
// =============================================================================

// GET /api/projects/:projectId/tdr/issues
router.get('/projects/:projectId/tdr/issues', async (req, res) => {
  const { projectId } = req.params;
  const issues = await db.select().from(tdrIssues)
    .where(eq(tdrIssues.projectId, projectId))
    .orderBy(desc(tdrIssues.createdAt));
  res.json(issues);
});

// POST /api/projects/:projectId/tdr/issues
router.post('/projects/:projectId/tdr/issues', async (req, res) => {
  const { projectId } = req.params;
  // Generate issue number
  const count = await db.select().from(tdrIssues)
    .where(eq(tdrIssues.projectId, projectId));
  const issueNumber = `TDR-${String(count.length + 1).padStart(4, '0')}`;

  const [issue] = await db.insert(tdrIssues)
    .values({ ...req.body, projectId, issueNumber })
    .returning();
  res.status(201).json(issue);
});

// PATCH /api/tdr/issues/:id
router.patch('/tdr/issues/:id', async (req, res) => {
  const { id } = req.params;
  const [issue] = await db.update(tdrIssues)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(tdrIssues.id, id))
    .returning();
  res.json(issue);
});

// POST /api/tdr/issues/:id/resolve
router.post('/tdr/issues/:id/resolve', async (req, res) => {
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
  res.json(issue);
});

// =============================================================================
// TDR Integration Tests
// =============================================================================

// GET /api/projects/:projectId/tdr/integration-tests
router.get('/projects/:projectId/tdr/integration-tests', async (req, res) => {
  const { projectId } = req.params;
  const tests = await db.select().from(tdrIntegrationTests)
    .where(eq(tdrIntegrationTests.projectId, projectId));
  res.json(tests);
});

// POST /api/projects/:projectId/tdr/integration-tests
router.post('/projects/:projectId/tdr/integration-tests', async (req, res) => {
  const { projectId } = req.params;
  const [test] = await db.insert(tdrIntegrationTests)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(test);
});

// PATCH /api/tdr/integration-tests/:id
router.patch('/tdr/integration-tests/:id', async (req, res) => {
  const { id } = req.params;
  const [test] = await db.update(tdrIntegrationTests)
    .set(req.body)
    .where(eq(tdrIntegrationTests.id, id))
    .returning();
  res.json(test);
});

// =============================================================================
// TDR Downtime Tests
// =============================================================================

// GET /api/projects/:projectId/tdr/downtime-tests
router.get('/projects/:projectId/tdr/downtime-tests', async (req, res) => {
  const { projectId } = req.params;
  const tests = await db.select().from(tdrDowntimeTests)
    .where(eq(tdrDowntimeTests.projectId, projectId));
  res.json(tests);
});

// POST /api/projects/:projectId/tdr/downtime-tests
router.post('/projects/:projectId/tdr/downtime-tests', async (req, res) => {
  const { projectId } = req.params;
  const [test] = await db.insert(tdrDowntimeTests)
    .values({ ...req.body, projectId })
    .returning();
  res.status(201).json(test);
});

// PATCH /api/tdr/downtime-tests/:id
router.patch('/tdr/downtime-tests/:id', async (req, res) => {
  const { id } = req.params;
  const [test] = await db.update(tdrDowntimeTests)
    .set(req.body)
    .where(eq(tdrDowntimeTests.id, id))
    .returning();
  res.json(test);
});

// =============================================================================
// TDR Readiness Scorecard
// =============================================================================

// GET /api/projects/:projectId/tdr/readiness-score
router.get('/projects/:projectId/tdr/readiness-score', async (req, res) => {
  const { projectId } = req.params;
  const [score] = await db.select().from(tdrReadinessScores)
    .where(eq(tdrReadinessScores.projectId, projectId))
    .orderBy(desc(tdrReadinessScores.calculatedAt))
    .limit(1);
  res.json(score || null);
});

// POST /api/projects/:projectId/tdr/readiness-score/calculate
router.post('/projects/:projectId/tdr/readiness-score/calculate', async (req, res) => {
  const { projectId } = req.params;
  const { tdrEventId } = req.body;

  // Calculate scores based on checklist, tests, issues
  const scores = await calculateTdrReadinessScore(projectId, tdrEventId);

  const [score] = await db.insert(tdrReadinessScores)
    .values({ ...scores, projectId, tdrEventId })
    .returning();
  res.status(201).json(score);
});

// POST /api/tdr/readiness-score/:id/approve
router.post('/tdr/readiness-score/:id/approve', async (req, res) => {
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
  res.json(score);
});

// =============================================================================
// Helper Functions
// =============================================================================

function getDefaultTdrChecklist(projectId: string) {
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

  const items = [];
  let sortOrder = 0;

  for (const [category, titles] of Object.entries(categories)) {
    for (const title of titles) {
      items.push({
        projectId,
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
  const criticalIssues = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const highIssues = issues.filter(i => i.severity === 'high' && i.status !== 'resolved').length;

  // Calculate category scores
  const technicalScore = Math.round((integrationsPassed / integrationsTotal) * 100);
  const dataScore = Math.round((checklistComplete / checklistTotal) * 100); // Simplified
  const staffScore = 80; // Would come from training completion - placeholder
  const supportScore = Math.round(
    (checklist.filter(i => i.category === 'support' && i.isCompleted).length /
     checklist.filter(i => i.category === 'support').length || 1) * 100
  );
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
  let recommendation = 'no_go';
  if (overallScore >= 90 && criticalIssues === 0) {
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
    criticalIssuesCount: criticalIssues,
    highIssuesCount: highIssues,
    calculatedAt: new Date(),
  };
}

export default router;
```

### 2.3 Connect to Main Routes
**File:** `server/routes.ts` (ADD only these lines)

```typescript
// At top of file
import { FEATURES } from '@shared/featureFlags';
import tdrRoutes from './routes/tdr';

// After other routes, before error handler
if (FEATURES.TDR_MODULE) {
  app.use('/api', tdrRoutes);
}
```

### 2.4 Checklist
- [ ] Create `server/routes/tdr.ts`
- [ ] Add feature flag import to `server/routes.ts`
- [ ] Add TDR routes with feature flag check
- [ ] Test all endpoints with Postman/curl
- [ ] Add request validation
- [ ] Add error handling

---

## Phase 3: Frontend Components

### 3.1 File Structure
```
client/src/
├── pages/
│   └── TDR/                           ← NEW FOLDER
│       ├── index.tsx                  ← Main TDR page
│       ├── TDRDashboard.tsx           ← Overview dashboard
│       ├── TDRChecklist.tsx           ← Checklist management
│       ├── TDRTestScenarios.tsx       ← Test scenarios
│       ├── TDRIssues.tsx              ← Issue tracking
│       ├── TDRIntegrationTests.tsx    ← Integration test results
│       ├── TDRDowntimeTests.tsx       ← Downtime procedure tests
│       ├── TDRReadinessScorecard.tsx  ← Go/No-Go scorecard
│       └── TDREventScheduler.tsx      ← Schedule rehearsals
├── components/
│   └── tdr/                           ← NEW FOLDER
│       ├── ChecklistItem.tsx
│       ├── TestScenarioCard.tsx
│       ├── IssueCard.tsx
│       ├── IntegrationTestRow.tsx
│       ├── ReadinessGauge.tsx
│       └── GoNoGoIndicator.tsx
└── lib/
    └── tdrApi.ts                      ← NEW FILE (API helpers)
```

### 3.2 Main TDR Page
**File:** `client/src/pages/TDR/index.tsx`

Key features:
- Project selector
- Tab navigation (Dashboard, Checklist, Tests, Issues, Integrations, Downtime, Scorecard)
- Feature flag check
- Real-time data with React Query

### 3.3 TDR Dashboard
**File:** `client/src/pages/TDR/TDRDashboard.tsx`

Key features:
- Overall readiness score gauge
- Checklist completion progress
- Test pass/fail summary
- Open issues by severity
- Upcoming TDR events
- Quick actions

### 3.4 Checklist
- [ ] Create `client/src/pages/TDR/index.tsx` - Main page with tabs
- [ ] Create `client/src/pages/TDR/TDRDashboard.tsx` - Overview
- [ ] Create `client/src/pages/TDR/TDRChecklist.tsx` - Checklist by category
- [ ] Create `client/src/pages/TDR/TDRTestScenarios.tsx` - Test tracking
- [ ] Create `client/src/pages/TDR/TDRIssues.tsx` - Issue management
- [ ] Create `client/src/pages/TDR/TDRIntegrationTests.tsx` - Interface tests
- [ ] Create `client/src/pages/TDR/TDRDowntimeTests.tsx` - Downtime tests
- [ ] Create `client/src/pages/TDR/TDRReadinessScorecard.tsx` - Go/No-Go
- [ ] Create `client/src/pages/TDR/TDREventScheduler.tsx` - Schedule TDRs
- [ ] Create shared components in `client/src/components/tdr/`
- [ ] Add route to `client/src/App.tsx` (with feature flag)
- [ ] Add nav item to sidebar (with feature flag)

---

## Phase 4: Navigation & Routing

### 4.1 Add Route
**File:** `client/src/App.tsx` (ADD)

```typescript
import { FEATURES } from '@shared/featureFlags';

// In routes
{FEATURES.TDR_MODULE && (
  <Route path="/tdr" component={TDRPage} />
)}
```

### 4.2 Add Sidebar Navigation
**File:** `client/src/components/Layout.tsx` (ADD)

```typescript
{FEATURES.TDR_MODULE && (
  <NavItem href="/tdr" icon={ClipboardCheck}>
    TDR Management
  </NavItem>
)}
```

### 4.3 Checklist
- [ ] Add TDR route to App.tsx
- [ ] Add TDR nav item to sidebar
- [ ] Test navigation with flag enabled
- [ ] Test navigation with flag disabled (hidden)

---

## Phase 5: Testing

### 5.1 Cypress E2E Tests
**File:** `cypress/e2e/41-tdr-management.cy.js`

Test coverage:
- TDR event CRUD
- Checklist completion
- Test scenario execution
- Issue creation and resolution
- Integration test tracking
- Readiness score calculation
- Go/No-Go approval flow

### 5.2 Checklist
- [ ] Create `cypress/e2e/41-tdr-management.cy.js`
- [ ] Test all CRUD operations
- [ ] Test checklist completion flow
- [ ] Test scenario pass/fail flow
- [ ] Test issue tracking flow
- [ ] Test readiness score calculation
- [ ] Test Go/No-Go approval
- [ ] All tests passing

---

## Implementation Order

### Week 1: Foundation
1. ✅ Feature flags setup
2. ✅ Database schema
3. ✅ Backend routes (basic CRUD)

### Week 2: Core Features
4. TDR Events (scheduling)
5. TDR Checklist
6. TDR Test Scenarios

### Week 3: Issue Tracking & Tests
7. TDR Issues
8. Integration Tests
9. Downtime Tests

### Week 4: Scorecard & Polish
10. Readiness Scorecard
11. Go/No-Go workflow
12. Dashboard & reporting

### Week 5: Testing & Rollout
13. Cypress tests
14. Bug fixes
15. Enable feature flag

---

## Success Criteria

| Metric | Target |
|--------|--------|
| All endpoints working | 100% |
| All frontend pages complete | 100% |
| Cypress tests passing | >95% |
| Feature flag toggle works | Yes |
| No regressions in existing features | 0 failures |
| Documentation complete | Yes |

---

## Rollback Plan

If anything breaks:
1. **Instant:** Set `ENABLE_TDR=false` → feature disappears
2. **Code:** `git revert` the TDR commits
3. **Database:** Tables can remain (not connected when flag off)

---

*Created: January 2026*
*Approach: Option 1 + Feature Flag (Very Low Risk)*
