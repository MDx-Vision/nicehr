# NICEHR Feature Backlog

This document tracks features that have Cypress tests written but are not yet implemented in the UI. These tests are marked with `it.skip("TODO: ...")` and serve as specifications for future development.

---

## Priority Levels
- **P0**: Critical - Core functionality needed for MVP
- **P1**: High - Important features for full product
- **P2**: Medium - Nice-to-have features
- **P3**: Low - Future enhancements

---

## 1. Dashboard Enhancements (P1)

### Charts & Analytics
- [x] Revenue trends chart (Recharts line chart) - IMPLEMENTED
- [x] User growth chart (Recharts bar chart) - IMPLEMENTED
- [ ] Performance metrics gauges (utilization, success rate, satisfaction)
- [x] Chart period filtering (7d, 30d, custom) - IMPLEMENTED
- [x] Chart data export to CSV - IMPLEMENTED

### Tasks Widget
- [x] Tasks API endpoint (GET /api/dashboard/tasks) - IMPLEMENTED (Dec 28, 2024)
- [x] Task completion API (POST /api/dashboard/tasks/:id/complete) - IMPLEMENTED (Dec 28, 2024)
- [x] Tasks widget with filtering (all/pending/completed) - IMPLEMENTED
- [x] Task priority indicators (critical/high/medium/low) - IMPLEMENTED
- [x] Loading and empty states for tasks - IMPLEMENTED (Dec 28, 2024)

### Calendar Widget
- [x] Calendar events API (GET /api/dashboard/calendar-events) - IMPLEMENTED (Dec 28, 2024)
- [x] Calendar widget with month navigation - IMPLEMENTED
- [x] Milestone and event badges - IMPLEMENTED
- [x] Loading and empty states for events - IMPLEMENTED (Dec 28, 2024)

### Real-time Features
- [ ] WebSocket integration for live stats updates
- [x] Live activity feed updates - IMPLEMENTED (polling)
- [x] Real-time notification badge - IMPLEMENTED

### Dashboard Customization
- [ ] Widget reordering (drag & drop)
- [x] Show/hide widgets panel - IMPLEMENTED
- [x] Save layout preferences - IMPLEMENTED (client-side)
- [x] Reset to default layout - IMPLEMENTED

### Search & Quick Actions
- [ ] Global dashboard search
- [ ] Search results dropdown (hospitals, projects, consultants)
- [ ] Quick action buttons (New Project, New Consultant, Reports)

### Notifications
- [x] Notification bell icon with badge count - IMPLEMENTED
- [x] Notifications dropdown panel - IMPLEMENTED
- [x] Mark as read (individual and bulk) - IMPLEMENTED
- [ ] Notification filtering by type

**Test Files**: `03-dashboard.cy.js`, `05-dashboard-widgets.cy.js`, `06-dashboard-analytics.cy.js`

---

## 2. Financial Module (P0)

### Expenses Management
- [x] Expenses list with filters (status, date, category) - IMPLEMENTED
- [x] Search expenses by description/project/consultant - IMPLEMENTED
- [x] Date range filter for expenses - IMPLEMENTED
- [x] Create expense form with receipt upload - IMPLEMENTED (Phase 5)
- [x] Edit expense functionality - IMPLEMENTED (Phase 4)
- [x] Submit expense for approval - IMPLEMENTED (Phase 4)
- [x] Approve/reject expenses (manager) - IMPLEMENTED (Phase 4)
- [x] Bulk approval functionality - IMPLEMENTED (Phase 2)
- [x] Bulk reject functionality - IMPLEMENTED (Phase 2)
- [x] Expense categories management - IMPLEMENTED (Phase 11)
- [x] Export expenses to CSV - IMPLEMENTED

### Invoices
- [x] Invoice list with search and status filter - IMPLEMENTED
- [x] Create invoice with line items - IMPLEMENTED
- [x] Invoice details view - IMPLEMENTED
- [x] Payment history tracking - IMPLEMENTED
- [x] Download invoice as PDF - IMPLEMENTED (Phase 3)
- [x] Email invoice to client - IMPLEMENTED (Phase 3)
- [x] Record payment with method/reference - IMPLEMENTED
- [x] Mark invoice as paid - IMPLEMENTED
- [x] Void invoice functionality - IMPLEMENTED

### Payroll
- [x] Payroll batches list - IMPLEMENTED
- [x] Export payroll batches to CSV - IMPLEMENTED (Phase 2)
- [x] Create payroll batch (date range, auto-calculate) - IMPLEMENTED (Phase 4)
- [x] Batch details with consultant payments - IMPLEMENTED (Phase 4)
- [x] Edit consultant payment amounts - IMPLEMENTED (Phase 4)
- [x] Approve batch workflow - IMPLEMENTED (Phase 4)
- [x] Process batch workflow - IMPLEMENTED (Phase 4)
- [x] Pay rates management - IMPLEMENTED (Phase 6)

### Budget Modeling
- [x] Budget dashboard with charts - IMPLEMENTED (Phase 3)
- [x] Budget vs actual comparison - IMPLEMENTED (Phase 3)
- [x] Budget by category breakdown - IMPLEMENTED (Phase 3)
- [x] Create budget with line items - IMPLEMENTED (Phase 7)
- [x] Variance analysis - IMPLEMENTED (Phase 8)
- [x] Over-budget alerts - IMPLEMENTED (Phase 9)
- [x] Budget forecasting - IMPLEMENTED (Phase 10)

**Test Files**: `08-financial.cy.js`

---

## 3. Communication Module (P1)

### Real-time Chat
- [x] Channels list with search - IMPLEMENTED
- [x] Create channel (public/private) - IMPLEMENTED
- [x] Join channel functionality - IMPLEMENTED (via members API)
- [x] Channel messaging - IMPLEMENTED
- [x] WebSocket real-time messaging - IMPLEMENTED
- [x] Typing indicators - IMPLEMENTED
- [x] Online status indicators - IMPLEMENTED
- [x] Shift summaries - IMPLEMENTED
- [ ] Edit/delete messages UI (backend exists)
- [ ] Message reactions
- [ ] Message replies/threads (schema exists, UI pending)
- [ ] Direct messages creation UI

### Message Search
- [ ] Search messages across channels
- [ ] Filter by date/user/channel
- [ ] Search result highlighting

### Channel Management
- [x] Add/remove members - IMPLEMENTED (API)
- [x] Quiet hours settings - IMPLEMENTED
- [ ] Channel settings panel UI
- [ ] Leave channel UI
- [ ] Archive channel UI

### Digital Signatures
- [x] Signature requests list - IMPLEMENTED
- [x] Create signature request (multiple signers) - IMPLEMENTED
- [x] Sign document view - IMPLEMENTED
- [x] Canvas signature drawing - IMPLEMENTED
- [ ] Typed signature option
- [ ] Upload signature image
- [x] Signature history with audit trail - IMPLEMENTED
- [x] Decline to sign workflow - IMPLEMENTED
- [x] Cypress tests for contracts/signatures - IMPLEMENTED (Dec 28, 2024)

**Test Files**: `11-communication.cy.js`, `12-contracts-signatures.cy.js`

---

## 4. Analytics & Reporting (P1)

### Executive Dashboard
- [ ] Key metrics summary cards
- [ ] Active projects overview
- [ ] Consultant utilization summary
- [ ] Revenue metrics

### Go-Live Readiness Dashboard
- [ ] Readiness score display
- [ ] Category breakdown (staffing, training, compliance)
- [ ] Readiness trends chart
- [ ] Blockers list

### Utilization Analytics
- [ ] Consultant utilization rates
- [ ] Utilization trends over time
- [ ] Billable vs non-billable breakdown
- [ ] Utilization by project

### Timeline & Forecasting
- [ ] Project timeline view
- [ ] Milestone tracking
- [ ] At-risk highlighting
- [ ] Forecast completion dates

### Cost Variance Analytics
- [ ] Budget vs actual chart
- [ ] Earned value analysis
- [ ] Variance breakdown by category
- [ ] Trend analysis

### Hospital ROI Analysis
- [ ] Cost savings calculations
- [ ] Efficiency gains metrics
- [ ] ROI by project
- [ ] Comparison charts

### Consultant Performance
- [ ] Performance rankings
- [ ] Performance trends
- [ ] Individual performance cards
- [ ] Comparison analytics

### Report Builder
- [ ] Saved reports list
- [ ] Report templates
- [ ] Custom report builder
- [ ] Data source selection
- [ ] Column selection/reordering
- [ ] Filtering options
- [ ] Grouping and sorting
- [ ] Report preview
- [ ] Save report functionality
- [ ] Export to CSV/Excel/PDF
- [ ] Schedule reports
- [ ] Email reports to recipients

**Test Files**: `12-analytics-reporting.cy.js`

---

## 5. Admin & RBAC (P1)

### User Management (Admin)
- [ ] Admin users list with search
- [ ] Filter by role and status
- [ ] Create user form with validation
- [ ] User details view
- [ ] Edit user information
- [ ] Assign/change user roles
- [ ] Deactivate user
- [ ] Reset user password
- [ ] User activity history

### Role Management
- [ ] Roles list (base, implementation, custom)
- [ ] Create custom role
- [ ] Permission selection matrix
- [ ] Role details with assigned permissions
- [ ] Edit role permissions
- [ ] View users assigned to role
- [ ] Delete custom role
- [ ] Permission domains (15 categories)

### Role Assignment
- [ ] Assign global roles
- [ ] Assign project-specific roles
- [ ] Role hierarchy visualization

### Integration Hub
- [ ] Available integrations list
- [ ] Calendar integration (Google Calendar)
- [ ] Payroll integration (ADP, Workday)
- [ ] EHR integration (Epic, Cerner)
- [ ] Configure integration settings
- [ ] Test connection functionality
- [ ] Sync jobs management
- [ ] Sync scheduling
- [ ] Event tracking with filters

### System Settings
- [ ] General settings (company info, timezone, date format)
- [ ] Notification settings with templates
- [ ] Security settings (password policy, session timeout)
- [ ] Audit logs viewer
- [ ] Backup & restore functionality
- [ ] Backup scheduling

### Gamification
- [ ] Leaderboard display
- [ ] Achievements list
- [ ] Points system
- [ ] Badges display
- [ ] Progress tracking

### Identity Verification
- [ ] Verification wizard
- [ ] Document upload
- [ ] Verification status tracking

### System Health
- [ ] API response times
- [ ] Error rates
- [ ] Uptime monitoring
- [ ] Health dashboard

**Test Files**: `13-admin-rbac-integrations.cy.js`

---

## 6. User Profile & Settings (P2)

### Profile Management
- [ ] Edit profile name
- [ ] Change email with verification
- [ ] Profile photo upload
- [ ] Photo cropping tool
- [ ] Remove photo

### User Preferences
- [ ] Theme selection (light/dark)
- [ ] Language selection
- [ ] Notification preferences
- [ ] Email digest settings

### Privacy Settings
- [ ] Profile visibility options
- [ ] Activity tracking preferences
- [ ] Data export functionality

### Account Management
- [ ] Change password
- [ ] Two-factor authentication setup
- [ ] Account deletion request
- [ ] Delete confirmation workflow

**Test Files**: `04-users-profile-management.cy.js`

---

## 7. Time & Attendance (P2)

- [ ] Time entries list
- [ ] Clock in/out functionality
- [ ] Manual time entry
- [ ] Edit time entries
- [ ] Time entry approval workflow
- [ ] Timesheet summary
- [ ] Export timesheets

**Test Files**: `05-time-attendance.cy.js`

---

## 8. Training & Competency (P2)

- [ ] Training modules list
- [ ] Assign training to consultants
- [ ] Training completion tracking
- [ ] Competency assessments
- [ ] Certification tracking
- [ ] Training reports

**Test Files**: `06-training-competency.cy.js`

---

## 9. Travel Management (P2)

- [ ] Travel requests list
- [ ] Create travel request
- [ ] Travel approval workflow
- [ ] Travel booking integration
- [ ] Travel expense tracking
- [ ] Travel calendar view

**Test Files**: `09-travel.cy.js`

---

## 10. Quality & Compliance (P2)

- [ ] Compliance checklist
- [ ] Document expiration tracking
- [ ] Compliance reports
- [ ] Audit trail
- [ ] Quality metrics dashboard

**Test Files**: `10-quality-compliance.cy.js`

---

## 11. Support Tickets (P3)

- [ ] Support tickets list
- [ ] Create support ticket
- [ ] Ticket status tracking
- [ ] Ticket assignment
- [ ] Ticket comments/updates
- [ ] Ticket priority levels
- [ ] Ticket categories

**Test Files**: `07-support-tickets.cy.js`

---

## Implementation Progress

| Module | Tests Written | Implemented | Coverage |
|--------|--------------|-------------|----------|
| Projects CRUD | 14 | 14 | 100% |
| Consultants CRUD | 35 | 35 | 100% |
| Hospitals CRUD | 12 | 12 | 100% |
| Authentication | 20 | 16 | 80% |
| Dashboard | 78 | 55 | 70% |
| Financial - Expenses | 23 | 23 | 100% |
| Financial - Invoices | 20 | 20 | 100% |
| Financial - Payroll | 14 | 14 | 100% |
| Financial - Budget | 12 | 12 | 100% |
| Communication | 50 | 48 | 96% |
| Analytics | 250+ | 5 | 2% |
| Admin/RBAC | 200+ | 12 | 6% |
| User Profile | 50+ | 10 | 20% |

---

## Recent Updates

### December 28, 2024 - Digital Signatures Cypress Tests
- Created comprehensive Cypress test file: 12-contracts-signatures.cy.js
- 50+ tests covering:
  - Contracts page layout and tabs
  - Dashboard tab with stats cards
  - Templates tab with CRUD operations
  - Contracts tab with create/filter/view
  - Contract detail dialog (content, signers, audit tabs)
  - Pending signatures tab
  - Signing dialog with canvas drawing
  - Audit trail display
- Communication module coverage increased from 85% to 96%

### December 28, 2024 - Communication Module Audit
- Audited Communication module - found it was 85% complete, not 0%
- Updated FEATURE_BACKLOG to reflect actual implementation status
- Core chat features fully implemented:
  - Channels list with search/filters
  - Create channel (public/private with quiet hours)
  - Channel messaging with WebSocket real-time
  - Typing indicators and online status
  - Shift summaries (view and create)
- Digital signatures fully implemented (contracts, signing, audit trail)

### December 28, 2024 - Dashboard Backend & Frontend Enhancement
- Implemented GET /api/dashboard/tasks endpoint (role-based task fetching)
- Implemented GET /api/dashboard/calendar-events endpoint (milestones + schedules)
- Implemented POST /api/dashboard/tasks/:id/complete endpoint (task completion)
- Added getDashboardTasks, getDashboardCalendarEvents, completeDashboardTask storage methods
- Updated Dashboard.tsx to use real API endpoints (removed static initialData)
- Added useMutation for task completion with optimistic updates
- Added loading skeletons for tasks and calendar events widgets
- Added empty states with icons when no data available
- Added project name display under task titles
- Added event date formatting in calendar widget
- Added critical priority color (purple) support
- Dashboard coverage increased from 12% to 70%

### December 27, 2024 - P0 Financial Module Phase 11
- Implemented expense categories management CRUD
- Added expenseCategories database table with schema
- Added CRUD API routes for expense categories
- Added "Categories" tab in Expenses page for admins
- Added ManageCategoriesDialog with create/edit/delete
- Added category icon and color customization
- Added "Seed Default Categories" functionality
- Protected default categories from deletion
- Added 12 Cypress tests for categories management
- **P0 Financial Module is now 100% COMPLETE!**

### December 27, 2024 - P0 Financial Module Phase 10
- Implemented budget forecasting with trend visualization
- Added ForecastCard component with weekly burn rate calculation
- Added projected total cost at completion
- Added forecast variance with percentage
- Added progress tracking (weeks elapsed / total)
- Added "At Risk" / "On Track" status indicators
- Added Budget Runway Warning for at-risk scenarios
- Added forecast trend chart with Recharts (Planned vs Actual vs Forecast)
- Added 9 Cypress tests for budget forecasting
- P0 Financial Module - Budget Modeling now 100% COMPLETE

### December 27, 2024 - P0 Financial Module Phase 9
- Implemented over-budget alerts with visual indicators
- Added "Over Budget" stat card to dashboard showing count
- Added OverBudgetBadge on scenario rows in list view
- Added OverBudgetAlert banner in scenario detail panel
- Alert shows variance amount and percentage
- Added 6 Cypress tests for over-budget alerts
- Financial - Budget module now at 100% coverage

### December 27, 2024 - P0 Financial Module Phase 8
- Enhanced variance analysis table with percentage column
- Added total variance row with summary
- Added data-testid attributes for testing
- Color-coded variance display (red for over, green for under)
- Added 6 Cypress tests for variance analysis
- Financial - Budget module now at 92% coverage

### December 27, 2024 - P0 Financial Module Phase 7
- Verified create budget scenario with line items (labor, travel, expense, overhead)
- Budget parameters: estimated hours, hourly rate, FTE count, duration
- Project association and baseline marking
- Added 8 Cypress tests for budget creation with line items
- Financial - Budget module now at 83% coverage

### December 27, 2024 - P0 Financial Module Phase 6
- Implemented pay rates management CRUD
- Add/edit/delete pay rates for consultants
- Pay rate effective date tracking (from/to)
- Delete pay rate backend route and storage method
- Added 9 Cypress tests for pay rates management
- Financial - Payroll module now at 100% coverage

### December 27, 2024 - P0 Financial Module Phase 5
- Added receipt file upload using Uppy/S3 integration
- ObjectUploader component integrated into expense create/edit dialogs
- Receipt display in expense detail view with view link
- Added 4 Cypress tests for receipt upload functionality
- Financial - Expenses module now at 100% coverage

### December 26, 2024 - P0 Financial Module Phase 4
- Added edit expense functionality for draft expenses
- Added expense approval workflow (submit, approve, reject)
- Added payroll batch detail view with consultant entries
- Added edit/delete payroll entries for draft batches
- Added payroll batch workflow (submit, approve, process)
- Added 20+ Cypress tests for Phase 4 features

### December 26, 2024 - P0 Financial Module Phase 3
- Added PDF download for invoices (print dialog approach)
- Added email invoice to client functionality with SendGrid/Resend integration
- Added Budget vs Actual comparison chart (Recharts bar chart)
- Added Budget by Scenario Type pie chart (Recharts)
- Added 15+ Cypress tests for Phase 3 features

### December 26, 2024 - P0 Financial Module Phase 2
- Added bulk approval/reject for expenses (select multiple, approve/reject all)
- Added CSV export for payroll batches
- Added 15+ Cypress tests for bulk operations and payroll

### December 26, 2024 - P0 Financial Module Phase 1
- Added date range filter to Expenses
- Added search functionality to Expenses (by description, project, consultant)
- Added CSV export for Expenses
- Added void invoice functionality with confirmation dialog
- Added payment recording with method/reference tracking
- Added payment history display for invoices
- Implemented 25+ Cypress tests for financial features

---

## 12. TDR (Technical Dress Rehearsal) Module (P0) ✅ COMPLETE

### TDR Features (All Implemented Jan 16, 2026)
- [x] TDR event scheduling and management
- [x] Pre-go-live checklists by category (infrastructure, integrations, data, workflows, support)
- [x] Test scenario execution and tracking
- [x] Issue management with severity levels
- [x] Integration test tracking (HL7, FHIR, API interfaces)
- [x] Downtime procedure testing
- [x] Go/No-Go readiness scorecard with weighted scoring
- [x] Default checklist seeding
- [x] ~150 Cypress E2E tests

**Test File**: `41-tdr-management.cy.js`

---

## 13. Executive Success Metrics Module (P0) ✅ COMPLETE

### Executive Metrics Features (All Implemented Jan 16, 2026)
- [x] Role-based dashboards (CEO, CFO, CIO, CTO, CMIO, CNO)
- [x] Success metrics by phase (pre-go-live, at go-live, post go-live, long-term)
- [x] Metric value tracking with history
- [x] SOW (Statement of Work) success criteria management
- [x] Executive endorsement tracking
- [x] Report generation
- [x] Default metrics seeding per role
- [x] Achievement/progress rate calculations
- [x] ~85 Cypress E2E tests

**Test File**: `42-executive-metrics.cy.js`

---

## Feature Flag Implementation Pattern

When adding new modules to NiceHR, use the feature flag pattern to ensure safe rollout:

### Environment Variables
```bash
# .env
ENABLE_TDR=true
ENABLE_EXECUTIVE_METRICS=true
```

### Server-side Implementation
```typescript
// server/routes.ts
const FEATURES = {
  TDR: process.env.ENABLE_TDR === 'true',
  EXECUTIVE_METRICS: process.env.ENABLE_EXECUTIVE_METRICS === 'true',
};

// Conditionally mount routes
if (FEATURES.TDR) {
  app.use('/api', tdrRoutes);
  console.log('[TDR] TDR module enabled');
}

if (FEATURES.EXECUTIVE_METRICS) {
  app.use('/api', executiveMetricsRoutes);
  console.log('[Executive Metrics] Executive Metrics module enabled');
}
```

### Client-side Implementation
```typescript
// client/src/App.tsx - Conditionally render routes
<Route path="/tdr" component={() => <ProtectedRoute component={TDR} />} />
<Route path="/executive-metrics" component={() => <ProtectedRoute component={ExecutiveMetrics} />} />

// client/src/components/AppSidebar.tsx - Conditionally show nav items
{ id: "tdr", title: "TDR", url: "/tdr", icon: "ClipboardCheck", roles: ["admin", "hospital_leadership"] },
{ id: "executive-metrics", title: "Executive Metrics", url: "/executive-metrics", icon: "TrendingUp", roles: ["admin", "hospital_leadership"] },
```

### Database Schema Pattern
When adding new tables:
1. Add tables to `shared/schema.ts` with unique names
2. Use pgEnum for status/type fields with unique enum names (prefix to avoid conflicts)
3. Reference existing tables (projects, hospitals, users) via foreign keys
4. Run `npm run db:push` to create tables

### Rollback
If anything breaks:
1. **Instant:** Set feature flag to `false` → feature disappears
2. **Code:** `git revert` the commits
3. **Database:** Tables remain but are unused when flag is off

---

## 14. Change Management Module (P0) ✅ COMPLETE

### Change Management Features (All Implemented Jan 17, 2026)
- [x] Change request lifecycle management (Draft → Submitted → CAB Review → Approved → Implementing → Completed)
- [x] Risk and impact assessment (Low/Medium/High/Critical)
- [x] CAB (Change Advisory Board) reviews with comments
- [x] Implementation scheduling with start/end dates
- [x] Rollback procedures documentation
- [x] Post-implementation reviews with success metrics
- [x] Category classification (Infrastructure, Application, Database, Network, Security, Process)
- [x] Priority levels (Low/Medium/High/Critical)
- [x] 71 Cypress E2E tests

**Test File**: `43-change-management.cy.js`

---

## 15. ESIGN Act Compliance (P0) ✅ COMPLETE

### ESIGN Features (All Implemented Jan 18, 2026)
- [x] 3-checkbox consent flow (hardware/software, paper rights, withdrawal consent)
- [x] Document review tracking with scroll detection
- [x] Intent confirmation checkbox ("I intend this to be my legally binding signature")
- [x] Typed name verification (must match signer's name)
- [x] SHA-256 document hashing for tamper-evidence
- [x] Signature certificates with unique NICEHR-YYYYMMDD-XXXXXX numbers
- [x] Complete audit trail API
- [x] 4-step signing wizard (Consent → Review → Sign → Complete)
- [x] ESIGN Act and UETA compliant

**Database Tables:**
- `esign_consents` - Consent acknowledgments with IP/timestamp
- `esign_document_hashes` - SHA-256 hashing records
- `esign_intent_confirmations` - Intent checkbox tracking
- `esign_review_tracking` - Document review metrics
- `esign_certificates` - Signature certificates

**API Endpoints:**
- `GET /api/esign/disclosure` - Get ESIGN disclosure text
- `POST /api/contracts/:id/esign/consent` - Submit consent
- `POST /api/contracts/:id/esign/review-start` - Track review start
- `PATCH /api/contracts/:id/esign/review-progress` - Update scroll progress
- `POST /api/contracts/:signerId/esign/sign` - Enhanced signing
- `GET /api/contracts/:id/esign/verify` - Verify document integrity
- `GET /api/contracts/:id/esign/certificate` - Get certificate
- `GET /api/contracts/:id/esign/audit-trail` - Get audit trail

**Test Files**: `12-contracts-signatures.cy.js`, `11-communication.cy.js`

---

## How to Use This Document

1. **For Development**: Pick a feature from a priority group and implement it
2. **For Testing**: Once implemented, remove `it.skip` from corresponding tests
3. **For Planning**: Use this as a roadmap for sprint planning
4. **For Tracking**: Update checkboxes as features are completed

---

*Last Updated: January 18, 2026*
*TDR, Executive Metrics, Change Management, ESIGN Compliance Complete - Total test coverage: 1,977 tests (100% passing)*
