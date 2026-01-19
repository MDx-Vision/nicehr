# Drill-Down Implementation Plan

**Created:** January 19, 2026
**Status:** Planning
**Purpose:** Add drill-down functionality across all dashboards and analytics

---

## Table of Contents

1. [Overview](#overview)
2. [Drill-Down Opportunities by Page](#drill-down-opportunities-by-page)
3. [Implementation Phases](#implementation-phases)
4. [Technical Approach](#technical-approach)
5. [Implementation Checklist](#implementation-checklist)

---

## Overview

### What is Drill-Down?

Drill-down allows users to click on summary metrics to see underlying detailed data.

```
Level 1: KPI Card          "15 Open Deals - $500K"
            │
            ▼ click
Level 2: Filtered List     [Table of 15 deals with details]
            │
            ▼ click row
Level 3: Detail View       [Single deal with full info]
            │
            ▼ click related
Level 4: Related Data      [Activities, contacts, history]
```

### Benefits

- Faster data exploration
- Better decision-making
- Reduced navigation clicks
- Context-aware filtering

### Scope

| Page | Drill-Down Points | Priority |
|------|-------------------|----------|
| Main Dashboard | 12 | P0 |
| CRM Dashboard | 8 | P0 |
| Executive Dashboard | 15 | P1 |
| Analytics | 14 | P1 |
| Advanced Analytics | 12 | P1 |
| Executive Metrics | 10 | P2 |
| ROI Dashboard | 8 | P2 |
| **Total** | **79** | - |

---

## Drill-Down Opportunities by Page

### 1. Main Dashboard (`/dashboard`)

**File:** `client/src/pages/Dashboard.tsx`

#### Stat Cards (6 items)

| # | Card | Current | Drill-Down Target | Priority |
|---|------|---------|-------------------|----------|
| 1.1 | Total Consultants | Count only | `/consultants` with status breakdown modal | P0 |
| 1.2 | Hospitals | Count only | `/hospitals` with active/inactive filter | P0 |
| 1.3 | Active Projects | Count only | `/projects?status=active` | P0 |
| 1.4 | Pending Documents | Count only | `/documents?status=pending` with type breakdown | P0 |
| 1.5 | Available Consultants | Count only | `/consultants?availability=available` | P0 |
| 1.6 | Total Savings | Amount only | Slide-out panel with savings by project | P1 |

#### Performance Gauges (3 items)

| # | Gauge | Current | Drill-Down Target | Priority |
|---|-------|---------|-------------------|----------|
| 1.7 | Ticket Resolution Rate | % only | `/support-tickets` filtered by resolved | P1 |
| 1.8 | Project Completion Rate | % only | `/projects` filtered by completed | P1 |
| 1.9 | Consultant Utilization | % only | Utilization breakdown by consultant | P1 |

#### Widgets (3 items)

| # | Widget | Current | Drill-Down Target | Priority |
|---|--------|---------|-------------------|----------|
| 1.10 | Tasks List | List view | Click task → task detail modal | P1 |
| 1.11 | Revenue Chart | Chart only | Click data point → daily breakdown | P2 |
| 1.12 | Calendar Events | List view | Click event → event detail modal | P1 |

---

### 2. CRM Dashboard (`/crm`)

**File:** `client/src/pages/CRM/index.tsx`

#### Summary Stats (4 items)

| # | Stat | Current | Drill-Down Target | Priority |
|---|------|---------|-------------------|----------|
| 2.1 | Total Contacts | Count + breakdown | `/crm/contacts` with type filter applied | P0 |
| 2.2 | Companies | Count + breakdown | `/crm/companies` with type filter | P0 |
| 2.3 | Open Deals | Count + value | `/crm/deals?status=open` | P0 |
| 2.4 | Won Revenue | Amount | Slide-out with won deals list | P0 |

#### Pipeline Tab (2 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 2.5 | Pipeline Stage Badge | Stage count | `/crm/deals?stage={stage}` | P1 |
| 2.6 | Stage Value | Amount | Deals list filtered by stage | P1 |

#### Activities Tab (2 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 2.7 | Today's Activities | Count | Activity list for today | P1 |
| 2.8 | Upcoming Activities | Count | Scheduled activities calendar | P1 |

---

### 3. Executive Dashboard (`/executive-dashboard`)

**File:** `client/src/pages/ExecutiveDashboard.tsx`

#### KPI Cards (6 items)

| # | KPI | Current | Drill-Down Target | Priority |
|---|-----|---------|-------------------|----------|
| 3.1 | Revenue KPI | Value + progress | Revenue breakdown by source | P1 |
| 3.2 | Projects KPI | Value + progress | Project list by status | P1 |
| 3.3 | Utilization KPI | % + progress | Consultant utilization detail | P1 |
| 3.4 | Satisfaction KPI | Score + progress | Survey responses breakdown | P1 |
| 3.5 | Compliance KPI | % + progress | Compliance items detail | P1 |
| 3.6 | Custom KPIs | Dynamic | Configurable drill-down | P2 |

#### Charts (5 items)

| # | Chart | Current | Drill-Down Target | Priority |
|---|-------|---------|-------------------|----------|
| 3.7 | Project Activity | Line chart | Click point → daily activity list | P1 |
| 3.8 | Revenue by Category | Pie chart | Click slice → category deals | P1 |
| 3.9 | Consultant Utilization | Bar chart | Click bar → consultant detail | P1 |
| 3.10 | Support Ticket Volume | Bar chart | Click bar → ticket list for day | P1 |
| 3.11 | Reports Generated | Counter | Click → reports list | P2 |

#### Other (4 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 3.12 | Custom Dashboards | Card list | View button → full dashboard | P2 |
| 3.13 | Goal Progress | Progress bars | Click → goal detail with milestones | P2 |
| 3.14 | Team Performance | Summary | Click → team member breakdown | P2 |
| 3.15 | Alerts | List | Click alert → source detail | P1 |

---

### 4. Analytics Dashboard (`/analytics`)

**File:** `client/src/pages/Analytics.tsx`

#### Overview Cards (4 items)

| # | Card | Current | Drill-Down Target | Priority |
|---|------|---------|-------------------|----------|
| 4.1 | Total Consultants | Count | Consultant list with status filter | P1 |
| 4.2 | Hospitals | Count | Hospital list with activity filter | P1 |
| 4.3 | Active Projects | Count | Project list filtered active | P1 |
| 4.4 | Total Savings | Amount | Savings breakdown chart | P1 |

#### Charts (7 items)

| # | Chart | Current | Drill-Down Target | Priority |
|---|-------|---------|-------------------|----------|
| 4.5 | Activity Trend | Line chart | Click → daily activity log | P1 |
| 4.6 | Project Status | Pie chart | Click slice → projects by status | P1 |
| 4.7 | Consultant Status | Bar chart | Click bar → consultants by status | P1 |
| 4.8 | Document Compliance | Pie chart | Click → documents by compliance | P1 |
| 4.9 | Users by Role | Pie chart | Click slice → users filtered | P2 |
| 4.10 | Compliance Gauge | Gauge | Click → compliance report | P1 |
| 4.11 | Revenue Trend | Area chart | Click → revenue breakdown | P2 |

#### Tables (3 items)

| # | Table | Current | Drill-Down Target | Priority |
|---|-------|---------|-------------------|----------|
| 4.12 | Consultant Performance | Table | Click row → consultant detail | P1 |
| 4.13 | Project Summary | Table | Click row → project detail | P1 |
| 4.14 | Recent Activities | Table | Click row → activity detail | P2 |

---

### 5. Advanced Analytics (`/advanced-analytics`)

**File:** `client/src/pages/AdvancedAnalytics.tsx`

#### Go-Live Readiness (4 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 5.1 | Overall Score Gauge | % score | Readiness scorecard breakdown | P1 |
| 5.2 | On Track/At Risk Badge | Status | Projects filtered by status | P1 |
| 5.3 | Risk Factors | List | Click factor → action items | P1 |
| 5.4 | Recommendations | List | Click → implementation tasks | P2 |

#### Consultant Utilization (3 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 5.5 | Average Utilization | % | Individual consultant breakdown | P1 |
| 5.6 | Scheduled vs Actual | Chart | Timesheet detail report | P1 |
| 5.7 | Billable Hours | Amount | Billable vs non-billable split | P2 |

#### Timeline Forecast (3 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 5.8 | Variance Days | Number | Variance by project phase | P1 |
| 5.9 | On Schedule/Delayed | Counts | Project timeline reports | P1 |
| 5.10 | Scenario Analysis | Cards | Impact analysis detail | P2 |

#### Cost Variance (2 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 5.11 | Variance % | Badge | Cost breakdown analysis | P1 |
| 5.12 | Category Breakdown | Chart | Line-item detail by category | P1 |

---

### 6. Executive Metrics (`/executive-metrics`)

**File:** `client/src/pages/ExecutiveMetrics/index.tsx`

#### Summary Cards (6 items)

| # | Card | Current | Drill-Down Target | Priority |
|---|------|---------|-------------------|----------|
| 6.1 | Total Metrics | Count | Metrics table (no filter) | P2 |
| 6.2 | Achieved | Count | Metrics filtered "achieved" | P2 |
| 6.3 | On Track | Count | Metrics filtered "on_track" | P2 |
| 6.4 | At Risk | Count | Metrics filtered "at_risk" | P2 |
| 6.5 | Missed | Count | Metrics filtered "missed" | P2 |
| 6.6 | Not Started | Count | Metrics filtered "not_started" | P2 |

#### Tables (4 items)

| # | Table | Current | Drill-Down Target | Priority |
|---|-------|---------|-------------------|----------|
| 6.7 | Metrics Table | Rows | Click → metric history modal | P2 |
| 6.8 | Endorsements Table | Rows | Click → endorsement detail | P2 |
| 6.9 | SOW Criteria Table | Rows | Click → criteria evidence | P2 |
| 6.10 | Progress Bars | Visual | Click → contributing metrics | P2 |

---

### 7. ROI Dashboard (`/roi-dashboard`)

**File:** `client/src/pages/RoiDashboard.tsx`

#### KPI Cards (4 items)

| # | Card | Current | Drill-Down Target | Priority |
|---|------|---------|-------------------|----------|
| 7.1 | Total Surveys | Count | Survey list with filters | P2 |
| 7.2 | Avg Score | Number | Response distribution breakdown | P2 |
| 7.3 | Consultants | Count | Consultant list for project | P2 |
| 7.4 | Savings | Amount | Savings by category | P2 |

#### Lists (4 items)

| # | Element | Current | Drill-Down Target | Priority |
|---|---------|---------|-------------------|----------|
| 7.5 | Survey Questions | List | Click → response distribution | P2 |
| 7.6 | Recent Surveys | List | Click → full survey detail | P2 |
| 7.7 | Project Overview | Card | Click → full project page | P2 |
| 7.8 | Completion Badge | Status | Filter by completion | P2 |

---

## Implementation Phases

### Phase 1: Core Dashboards (P0) - 12 items
Focus on most-used dashboards with highest traffic.

**Scope:**
- Main Dashboard stat cards (6)
- CRM Dashboard stats (4)
- CRM Pipeline stage badges (2)

**Estimated Effort:** 2-3 days

### Phase 2: Analytics & Executive (P1) - 38 items
Add drill-downs to analytics and executive views.

**Scope:**
- Main Dashboard gauges & widgets (6)
- Executive Dashboard KPIs & charts (11)
- Analytics charts & tables (14)
- Advanced Analytics (7)

**Estimated Effort:** 5-7 days

### Phase 3: Secondary Pages (P2) - 29 items
Complete remaining drill-down opportunities.

**Scope:**
- Executive Metrics (10)
- ROI Dashboard (8)
- Remaining items from other pages (11)

**Estimated Effort:** 3-4 days

---

## Technical Approach

### Drill-Down Patterns

#### Pattern 1: Navigate to Filtered Page
```typescript
// Click handler navigates with query params
const handleDrillDown = () => {
  navigate(`/crm/deals?status=open&stage=${stageId}`);
};
```

#### Pattern 2: Slide-Out Panel
```typescript
// Show detail panel without leaving page
const [drillDownData, setDrillDownData] = useState(null);
const [showPanel, setShowPanel] = useState(false);

const handleDrillDown = (data) => {
  setDrillDownData(data);
  setShowPanel(true);
};
```

#### Pattern 3: Modal Detail View
```typescript
// Show modal with detailed breakdown
const [showModal, setShowModal] = useState(false);
const [modalContent, setModalContent] = useState(null);

const handleDrillDown = (item) => {
  setModalContent(item);
  setShowModal(true);
};
```

#### Pattern 4: Expandable Row
```typescript
// Table row expands to show detail
const [expandedRow, setExpandedRow] = useState(null);

const handleRowClick = (rowId) => {
  setExpandedRow(expandedRow === rowId ? null : rowId);
};
```

### Reusable Components to Create

| Component | Purpose |
|-----------|---------|
| `DrillDownCard` | Stat card with click handler |
| `DrillDownChart` | Chart wrapper with point click |
| `DrillDownPanel` | Slide-out detail panel |
| `DrillDownModal` | Modal for detailed view |
| `DrillDownTable` | Table with expandable rows |

### Data Requirements

Each drill-down needs:
1. **Source data** - What metric/chart triggers it
2. **Target data** - What detailed data to show
3. **Filter context** - How to filter the detail view
4. **Navigation** - URL or component to show

---

## Implementation Checklist

### Phase 1: Core Dashboards (P0)

#### Main Dashboard Stat Cards
- [ ] 1.1 Total Consultants → `/consultants` with breakdown
- [ ] 1.2 Hospitals → `/hospitals` with filter
- [ ] 1.3 Active Projects → `/projects?status=active`
- [ ] 1.4 Pending Documents → `/documents?status=pending`
- [ ] 1.5 Available Consultants → `/consultants?availability=available`
- [ ] 1.6 Total Savings → Savings breakdown panel

#### CRM Dashboard Stats
- [ ] 2.1 Total Contacts → `/crm/contacts` with type filter
- [ ] 2.2 Companies → `/crm/companies` with type filter
- [ ] 2.3 Open Deals → `/crm/deals?status=open`
- [ ] 2.4 Won Revenue → Won deals slide-out panel

#### CRM Pipeline
- [ ] 2.5 Pipeline Stage Badge → Deals by stage
- [ ] 2.6 Stage Value → Deals list for stage

---

### Phase 2: Analytics & Executive (P1)

#### Main Dashboard Gauges & Widgets
- [ ] 1.7 Ticket Resolution Rate → Resolved tickets
- [ ] 1.8 Project Completion Rate → Completed projects
- [ ] 1.9 Consultant Utilization → Utilization breakdown
- [ ] 1.10 Tasks List → Task detail modal
- [ ] 1.11 Revenue Chart → Daily breakdown (P2 moved here)
- [ ] 1.12 Calendar Events → Event detail modal

#### Executive Dashboard
- [ ] 3.1 Revenue KPI → Revenue breakdown
- [ ] 3.2 Projects KPI → Project list
- [ ] 3.3 Utilization KPI → Utilization detail
- [ ] 3.4 Satisfaction KPI → Survey responses
- [ ] 3.5 Compliance KPI → Compliance items
- [ ] 3.7 Project Activity Chart → Daily activity
- [ ] 3.8 Revenue by Category → Category deals
- [ ] 3.9 Consultant Utilization Chart → Consultant detail
- [ ] 3.10 Support Ticket Volume → Ticket list
- [ ] 3.15 Alerts → Source detail

#### Analytics Dashboard
- [ ] 4.1 Total Consultants → Consultant list
- [ ] 4.2 Hospitals → Hospital list
- [ ] 4.3 Active Projects → Project list
- [ ] 4.4 Total Savings → Savings breakdown
- [ ] 4.5 Activity Trend → Daily activity log
- [ ] 4.6 Project Status Chart → Projects by status
- [ ] 4.7 Consultant Status Chart → Consultants by status
- [ ] 4.8 Document Compliance → Documents by compliance
- [ ] 4.10 Compliance Gauge → Compliance report
- [ ] 4.12 Consultant Performance Table → Consultant detail
- [ ] 4.13 Project Summary Table → Project detail

#### Advanced Analytics
- [ ] 5.1 Go-Live Readiness Gauge → Scorecard breakdown
- [ ] 5.2 On Track/At Risk Badge → Filtered projects
- [ ] 5.3 Risk Factors → Action items
- [ ] 5.5 Average Utilization → Consultant breakdown
- [ ] 5.6 Scheduled vs Actual → Timesheet report
- [ ] 5.8 Variance Days → Phase breakdown
- [ ] 5.9 On Schedule/Delayed → Timeline reports

---

### Phase 3: Secondary Pages (P2)

#### Executive Dashboard (remaining)
- [ ] 3.6 Custom KPIs → Configurable drill-down
- [ ] 3.11 Reports Generated → Reports list
- [ ] 3.12 Custom Dashboards → Full dashboard view
- [ ] 3.13 Goal Progress → Goal milestones
- [ ] 3.14 Team Performance → Team breakdown

#### Analytics (remaining)
- [ ] 4.9 Users by Role → Filtered users
- [ ] 4.11 Revenue Trend → Revenue breakdown
- [ ] 4.14 Recent Activities → Activity detail

#### Advanced Analytics (remaining)
- [ ] 5.4 Recommendations → Implementation tasks
- [ ] 5.7 Billable Hours → Billable split
- [ ] 5.10 Scenario Analysis → Impact analysis
- [ ] 5.11 Variance % → Cost breakdown
- [ ] 5.12 Category Breakdown → Line-item detail

#### Executive Metrics
- [ ] 6.1 Total Metrics → All metrics
- [ ] 6.2 Achieved → Filtered achieved
- [ ] 6.3 On Track → Filtered on_track
- [ ] 6.4 At Risk → Filtered at_risk
- [ ] 6.5 Missed → Filtered missed
- [ ] 6.6 Not Started → Filtered not_started
- [ ] 6.7 Metrics Table → Metric history
- [ ] 6.8 Endorsements Table → Endorsement detail
- [ ] 6.9 SOW Criteria Table → Criteria evidence
- [ ] 6.10 Progress Bars → Contributing metrics

#### ROI Dashboard
- [ ] 7.1 Total Surveys → Survey list
- [ ] 7.2 Avg Score → Response distribution
- [ ] 7.3 Consultants → Consultant list
- [ ] 7.4 Savings → Savings by category
- [ ] 7.5 Survey Questions → Response distribution
- [ ] 7.6 Recent Surveys → Full survey detail
- [ ] 7.7 Project Overview → Full project page
- [ ] 7.8 Completion Badge → Filter by completion

---

### Reusable Components
- [ ] Create `DrillDownCard` component
- [ ] Create `DrillDownChart` wrapper
- [ ] Create `DrillDownPanel` slide-out
- [ ] Create `DrillDownModal` component
- [ ] Create `DrillDownTable` with expandable rows
- [ ] Create drill-down context provider
- [ ] Add URL query param handling utilities

---

### Testing
- [ ] E2E tests for Phase 1 drill-downs
- [ ] E2E tests for Phase 2 drill-downs
- [ ] E2E tests for Phase 3 drill-downs
- [ ] Verify all drill-downs return to source correctly
- [ ] Test keyboard navigation for accessibility
- [ ] Test mobile responsiveness

---

## Progress Summary

| Phase | Items | Completed | Status |
|-------|-------|-----------|--------|
| Phase 1 (P0) | 12 | 0 | Not Started |
| Phase 2 (P1) | 38 | 0 | Not Started |
| Phase 3 (P2) | 29 | 0 | Not Started |
| Components | 7 | 0 | Not Started |
| Testing | 6 | 0 | Not Started |
| **Total** | **92** | **0** | **0%** |

---

*Last Updated: January 19, 2026*
