# CLAUDE.md - Project Context for AI Assistance

## Project Overview

**NiceHR** is an EHR (Electronic Health Record) Implementation Consulting Management Platform built with:
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Testing**: Cypress E2E tests

---

## Recent Changes (Jan 19, 2026)

### Session: "Drill-Down Implementation (Phases 1-3)"

**Status:** ✅ COMPLETE

**Overview:**
Implemented comprehensive drill-down functionality across all dashboards. Users can now click on metrics, cards, charts, and table rows to drill into detailed views with filtering, navigation, and modal dialogs.

**Implementation Summary:**
| Phase | Items | Features |
|-------|-------|----------|
| Phase 1 (P0) | 12 | Dashboard stat cards → filtered pages |
| Phase 2 (P1) | 25 | Gauges, Analytics, Executive Dashboard drill-downs |
| Phase 3 (P2) | 18 | Executive Metrics, ROI Dashboard drill-downs |

**Files Modified:**
- `client/src/pages/Dashboard.tsx` - Task/event detail modals
- `client/src/pages/Analytics.tsx` - KPI drill-downs with navigation
- `client/src/pages/ExecutiveDashboard.tsx` - KPI and chart drill-downs
- `client/src/pages/ExecutiveMetrics/index.tsx` - Summary card filters, table row modals, progress bar drill-downs
- `client/src/pages/RoiDashboard.tsx` - Survey/question detail modals, savings breakdown
- `client/src/pages/Consultants.tsx` - URL parameter filtering
- `client/src/pages/SupportTickets.tsx` - URL parameter filtering
- `client/src/components/PerformanceGauge.tsx` - Added onClick support
- `client/src/components/analytics/*.tsx` - Added drill-down props

**E2E Tests Created:**
- `cypress/e2e/49-drill-down-phase1.cy.js` (31 tests)
- `cypress/e2e/50-drill-down-phase2.cy.js` (17 tests)
- `cypress/e2e/51-drill-down-phase3.cy.js` (15 tests)

**Key Features:**
- Click stat cards → Navigate to filtered pages
- Click performance gauges → Navigate with query params
- Click KPI cards → Show detail dialogs or navigate
- Click chart elements → Show data drill-down dialogs
- Click table rows → Show detail modals
- Click progress bars → Show contributing metrics

---

### Session: "Documentation Overhaul & Gap Analysis"

**Status:** ✅ COMPLETE

**Overview:**
Comprehensive documentation audit and creation. Filled all gaps in project documentation to make NiceHR production-ready with proper documentation standards.

**Documentation Created:**
| Document | Purpose |
|----------|---------|
| `README.md` | Project entry point, quick start guide |
| `ARCHITECTURE.md` | System architecture with diagrams |
| `FEATURES.md` | Complete feature inventory |
| `API.md` | API reference (640+ endpoints) |
| `SECURITY.md` | Security policy, HIPAA compliance |
| `LICENSE` | Proprietary license terms |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CHANGELOG.md` | Version history (v0.1.0 - v1.0.0) |
| `QUALITY_ASSURANCE.md` | Regression prevention guide |
| `DEVELOPMENT_TRACKER.md` | Ongoing progress tracking |
| `CONVERSATION.md` | Session continuity notes |

**Patent Documentation Created:**
| Document | Purpose |
|----------|---------|
| `PATENT_RESEARCH.md` | Patent process, costs, law firms |
| `PATENT_FEATURES_TECHNICAL.md` | Technical specs for attorney review |

**Potentially Patentable Features Documented:**
1. TDR Go-Live Readiness Algorithm (5-domain weighted scoring)
2. Smart Consultant Matching Algorithm (multi-factor scoring)
3. ESIGN 4-Step Compliance Wizard (SHA-256 hashing)

**Files Cleaned Up (11 obsolete files removed):**
- CHANGE_MANAGEMENT_BUILD_CHECKLIST.md
- CRM_BUILD_CHECKLIST.md
- ESIGN_IMPLEMENTATION_CHECKLIST.md
- TDR_TEST_FIXES_CHECKLIST.md
- TDR_TICKETS_INTEGRATION_CHECKLIST.md
- MASTER_IMPLEMENTATION_CHECKLIST.md
- CONVERSATION_BACKUP.md
- DISCHEDULE.md
- RESUME_HERE.md
- SESSION_STATUS.md
- Old CONVERSATION.md

**Session Continuity System:**
- `CONVERSATION.md` - Session notes and decisions
- `DEVELOPMENT_TRACKER.md` - What's done/pending
- `CLAUDE.md` - AI context (this file)

---

## Recent Changes (Jan 18, 2026)

### Session: "TNG CRM Module - COMPLETE IMPLEMENTATION"

**Status:** ✅ COMPLETE - Full CRM module built and tested (158 E2E tests)

**Overview:**
Built a complete Healthcare CRM module for managing contacts, companies, deals, and sales pipeline. Designed specifically for EHR implementation consulting with healthcare-specific fields.

**CRM Pages Created:**
| Route | File | Description |
|-------|------|-------------|
| `/crm` | `client/src/pages/CRM/index.tsx` | Dashboard with stats, pipeline view, activities |
| `/crm/contacts` | `client/src/pages/CRM/Contacts.tsx` | Contact management (leads, customers, partners) |
| `/crm/companies` | `client/src/pages/CRM/Companies.tsx` | Company management with healthcare fields |
| `/crm/deals` | `client/src/pages/CRM/Deals.tsx` | Deal tracking with kanban and list views |

**Database Tables Added (in `shared/schema.ts`):**
- `crm_contacts` - Contact records with type (lead/customer/partner/vendor)
- `crm_companies` - Companies with healthcare fields (EHR system, bed count, facility type)
- `crm_deals` - Deal/opportunity tracking with pipeline stages
- `crm_activities` - Activity log (calls, emails, meetings, notes)
- `crm_tasks` - Task management linked to contacts/companies/deals
- `crm_pipelines` - Custom pipeline definitions
- `crm_pipeline_stages` - Pipeline stage configuration

**API Endpoints (in `server/routes/crm.ts`):**
- `GET/POST /api/crm/contacts` - List and create contacts
- `GET/PATCH/DELETE /api/crm/contacts/:id` - Read, update, delete contact
- `GET/POST /api/crm/companies` - List and create companies
- `GET/PATCH/DELETE /api/crm/companies/:id` - Read, update, delete company
- `GET/POST /api/crm/deals` - List and create deals
- `GET/PATCH/DELETE /api/crm/deals/:id` - Read, update, delete deal
- `GET/POST /api/crm/activities` - Activity log management
- `GET/POST /api/crm/tasks` - Task management
- `GET/POST /api/crm/pipelines` - Pipeline management
- `GET /api/crm/dashboard` - Dashboard statistics

**Key Features:**
- **Contact Types**: Lead, Customer, Partner, Vendor with lifecycle tracking
- **Healthcare Fields**: EHR system (Epic, Cerner, Meditech, etc.), bed count, facility type
- **Pipeline Management**: Customizable stages (Lead → Qualified → Proposal → Negotiation → Closed)
- **Kanban & List Views**: Visual deal board and tabular list for deals
- **Activity Logging**: Track calls, emails, meetings, and notes
- **Task Management**: Create and track tasks linked to CRM entities
- **Search & Filter**: Full-text search and type-based filtering
- **Dashboard Stats**: Contact counts, deal values, activity metrics

**E2E Test Coverage (158 tests):**
| File | Tests | Coverage |
|------|-------|----------|
| `44-crm-contacts.cy.js` | 40 | Contact CRUD, search, filter, view/edit dialogs |
| `45-crm-companies.cy.js` | 41 | Company management, healthcare fields, activities |
| `46-crm-deals.cy.js` | 37 | Deal tracking, kanban/list views, pipeline stages |
| `47-crm-pipeline.cy.js` | 24 | CRM dashboard pipeline tab, stats cards |
| `48-crm-activities.cy.js` | 16 | CRM dashboard activities tab, action buttons |

**Navigation:** CRM is accessible from sidebar under "CRM" menu with sub-items for Dashboard, Contacts, Companies, and Deals.

---

### Session: "ESIGN Act Compliance Implementation"

**Status:** ✅ COMPLETE

**Completed:**
- Implemented full ESIGN Act/UETA compliant e-signature features
- Added 5 new database tables for consent, hashing, intent, review tracking, certificates
- Created 8 new API endpoints for e-signature compliance
- Enhanced signing UI with 4-step wizard (Consent → Review → Sign → Complete)
- Zero regressions - all existing tests still passing

**Key Features Added:**
- **3-Checkbox Consent Flow**: Hardware/software acknowledgment, paper copy rights, withdrawal consent
- **Document Review Tracking**: Scroll detection, review duration tracking
- **Intent Confirmation**: "I intend this to be my legally binding signature" checkbox
- **Typed Name Verification**: Must match signer's name
- **SHA-256 Document Hashing**: Tamper-evident cryptographic hash
- **Signature Certificates**: Unique NICEHR-YYYYMMDD-XXXXXX certificate numbers
- **Complete Audit Trail**: Full compliance logging

**Database Tables Added:**
- `esign_consents` - Consent acknowledgments with IP/timestamp
- `esign_document_hashes` - SHA-256 hashing records
- `esign_intent_confirmations` - Intent checkbox tracking
- `esign_review_tracking` - Document review metrics
- `esign_certificates` - Signature certificates

**API Endpoints Added:**
- `GET /api/esign/disclosure` - Get ESIGN disclosure text
- `POST /api/contracts/:id/esign/consent` - Submit consent
- `POST /api/contracts/:id/esign/review-start` - Track review start
- `PATCH /api/contracts/:id/esign/review-progress` - Update scroll progress
- `POST /api/contracts/:signerId/esign/sign` - Enhanced signing
- `GET /api/contracts/:id/esign/verify` - Verify document integrity
- `GET /api/contracts/:id/esign/certificate` - Get certificate
- `GET /api/contracts/:id/esign/audit-trail` - Get audit trail

**Files Created/Modified:**
- `shared/schema.ts` - Added 5 ESIGN tables (~176 lines)
- `server/routes/esign.ts` - NEW - API routes (~800 lines)
- `client/src/pages/Contracts.tsx` - Enhanced SigningDialog with 4-step wizard
- `cypress/e2e/12-contracts-signatures.cy.js` - Updated tests for new flow
- `cypress/e2e/11-communication.cy.js` - Updated Digital Signatures tests

---

## Recent Changes (Jan 17, 2026)

### Session 4: "Change Management Module Build"

**Status:** ✅ COMPLETE

**Completed:**
- Built full ITIL-aligned Change Management module
- 71 E2E tests covering all functionality
- Feature-flagged with `ENABLE_CHANGE_MANAGEMENT`
- All tests passing with zero regressions

**Change Management Features:**
- Change request lifecycle management (Draft → Submitted → CAB Review → Approved → Implementing → Completed)
- Risk and impact assessment (Low/Medium/High/Critical)
- CAB (Change Advisory Board) reviews with comments
- Implementation scheduling with start/end dates
- Rollback procedures documentation
- Post-implementation reviews with success metrics

**Database Tables Added:**
- `change_requests` - Main change request records
- `change_approvals` - CAB approval tracking
- `change_implementations` - Implementation records
- `change_rollbacks` - Rollback procedures
- `change_reviews` - Post-implementation reviews

**Files Created:**
- `server/routes/changeManagement.ts` - API routes (~457 lines)
- `client/src/pages/ChangeManagement/index.tsx` - UI (~1131 lines)
- `client/src/lib/changeManagementApi.ts` - API helpers
- `cypress/e2e/43-change-management.cy.js` - E2E tests (~71 tests)

### Session 3: "Comprehensive Seed Data Addition"

**Status:** ✅ COMPLETE

**Completed:**
- Added seed data for Contracts (5 records)
- Added seed data for Travel Bookings (5 records)
- Added seed data for Schedules (5 records)
- Added seed data for EOD Reports (4 records)
- Added seed data for Invoices (4 records)
- Added seed data for Invoice Line Items (7 records)
- All seed data verified via API endpoints

### Session 2: "TDR & Executive Metrics Test Fixes"

**Status:** ✅ COMPLETE

**Completed:**
- Fixed all 37 failing TDR tests (154/154 now passing)
- Fixed all 18 failing Executive Metrics tests (56/56 now passing)
- Added missing data-testid attributes
- Fixed scroll-lock and timing issues
- Total: 1973/1973 tests passing before ESIGN

### Session 1: "TDR-Tickets Integration"

**Status:** ✅ COMPLETE

**Completed:**
- Bi-directional linking between TDR Issues and Support Tickets
- Create ticket from TDR issue functionality
- TDR filtering and context display in Support Tickets page

---

## Recent Changes (Jan 16, 2026)

### Session: "TDR & Executive Metrics Implementation"

**Completed:**
- Built Technical Dress Rehearsal (TDR) module for go-live preparation
- Built Executive Success Metrics module for C-suite dashboards
- Both modules use feature flags for safe rollout
- Added ~235 E2E tests across both modules

---

## Recent Changes (Jan 10, 2026)

### Session: "Remote Support E2E Test Coverage"

**Completed this session:**
- Created comprehensive E2E test suite for remote-support module
- 15 test files covering 725+ test scenarios
- Test categories: P0 (critical), P1 (core), P2 (advanced)
- Added mock mode for Daily.co (enables testing without API credentials)
- Custom Cypress commands for all API operations
- See `remote-support/REMOTE_SUPPORT_TEST_PLAN.md` for full details

**Test Files Created:**
| Priority | Tests | Coverage |
|----------|-------|----------|
| P0 Critical | ~215 | Support requests, queue, video calls, WebSocket |
| P1 Core | ~195 | Consultant mgmt, smart matching, ratings, analytics |
| P2 Advanced | ~315 | Scheduling, preferences, errors, auth, edge cases |

**Running Remote Support Tests:**
```bash
cd remote-support
npm install && npx cypress install
npm run dev:server  # Start backend on port 3002
npm test            # Run all tests
```

---

## Recent Changes (Jan 5, 2026)

### Session: "Test Coverage Expansion & 100% Pass Rate Achievement"

**Completed this session:**
- Analyzed test coverage gaps across 14 categories
- Implemented 846 new tests (14 test files)
- Fixed 13 failing tests to achieve **100% pass rate**
- Applied security fixes (session secret, query validation, UUID generation)
- Total tests: **1,692 passing** (doubled from 846)
- Created comprehensive TEST_PLAN.md checklist

### Deployment Readiness Assessment
Platform is **feature-complete** with all tests passing and production code ready.

**Production Infrastructure (Updated Jan 5, 2026):**
- `server/objectStorage.ts` - Updated for both Replit (dev) and production GCS
- `server/emailService.ts` - Updated with SendGrid support for HIPAA compliance
- `.env.example` - Comprehensive production configuration template
- `DEPLOYMENT_REQUIREMENTS.md` - Full deployment checklist and instructions

**Pending (User Action Required):**
- Choose HIPAA-compliant hosting provider
- Sign BAAs with all service providers
- Provide credentials (see DEPLOYMENT_REQUIREMENTS.md)

---

## Previous Changes (Dec 29, 2025)

### Completed Features

1. **Analytics Enhancements**
   - Hospital Staff Analytics view with role-based filtering
   - Consultant Analytics view with performance metrics
   - Report Builder with saved reports, custom report creation, export (CSV/Excel/PDF), and scheduling
   - Advanced Visualizations: Timeline & Forecasting, Cost Variance Analytics, Go-Live Readiness Dashboard

2. **Support Tickets (Database Connected)**
   - Full CRUD API endpoints (`/api/support-tickets`)
   - React Query integration replacing local state
   - Assignee selector with "Assign to Me" button
   - Tags section with add/remove functionality
   - All 32 support ticket tests passing

3. **Schedules (Database Connected)**
   - General schedule API endpoints (`/api/schedules` - GET, POST, PATCH, DELETE)
   - Storage methods: `getAllSchedules`, `updateSchedule`, `deleteSchedule`
   - React Query integration for schedules and EOD reports
   - Calendar view displays schedules from database
   - Connected to `/api/eod-reports` API

4. **Contracts & Digital Signatures**
   - E-Sign feature with SignatureCanvas
   - Pending signatures tab
   - Digital signature capture and storage
   - All 52 signature tests passing (previously 1 skipped)

5. **Code Cleanup**
   - Removed 23 legacy placeholder test files
   - Fixed all skipped/pending tests
   - All tests now passing with 0 pending

6. **Remote Support Integration**
   - Standalone video support system at `remote-support/`
   - White-labeled video/audio/screen sharing (HIPAA compliant)
   - Smart consultant matching based on expertise and relationships
   - Real-time queue with WebSocket updates
   - Integrated into main NiceHR via `/remote-support` route
   - Runs on port 3002 (server) and 5173 (client)
   - Video service configured and connected
   - 10 integration tests added

7. **Deployment Ready**
   - Docker multi-stage build with `Dockerfile`
   - Docker Compose configuration
   - GitHub Actions CI/CD pipeline
   - Comprehensive deployment guide in `DEPLOYMENT.md`

### Previous Features (Dec 28, 2025)

1. **Consultant Documents & Shift Preferences**
   - 90+ demo documents for all 12 consultants
   - Documents include: Resume, certifications, background checks, HIPAA training, W-9, NDA, etc.
   - Shift preferences (day/night/swing) for all consultants

2. **Dashboard Enhancements**
   - All 6 stat cards clickable with navigation
   - 10 demo project tasks for My Tasks widget
   - 10 demo user activities for Recent Activities feed

3. **Hospital & Project Expansions**
   - 25+ fields added to hospitals
   - 30+ financial fields added to projects
   - "View More" modals for both

4. **Performance Metrics**
   - Ticket resolution rate, project completion rate
   - Consultant utilization from timesheets
   - Total hours logged tracking

## Test Suite Status

```
Total Tests: 2,135 (100% passing)
Test Files: 47 E2E test files
Coverage Areas: 33 test categories
Pass Rate: 100%
Duration: 17m 35s
```

### Test Results Summary (Jan 18, 2026)

| Metric | Value |
|--------|-------|
| Total Tests | 2,135 |
| Passing | 2,135 ✅ |
| Failing | 0 |
| Pass Rate | 100% |

### New Test Files Added (Jan 18, 2026)

| Category | File | Tests | Priority |
|----------|------|-------|----------|
| CRM Contacts | `44-crm-contacts.cy.js` | 40 | P1 |
| CRM Companies | `45-crm-companies.cy.js` | 41 | P1 |
| CRM Deals | `46-crm-deals.cy.js` | 37 | P1 |
| CRM Pipeline | `47-crm-pipeline.cy.js` | 24 | P1 |
| CRM Activities | `48-crm-activities.cy.js` | 16 | P1 |

### New Test Files Added (Jan 5, 2026)

| Category | File | Tests | Priority |
|----------|------|-------|----------|
| Remote Support WebSocket | `27-remote-support-websocket.cy.js` | 69 | P0 |
| HIPAA Session Security | `28-hipaa-session-security.cy.js` | 31 | P0 |
| Authorization Edge Cases | `29-authorization-edge-cases.cy.js` | 49 | P0 |
| API Error Handling | `30-api-error-handling.cy.js` | 60 | P0 |
| Advanced Analytics | `31-advanced-analytics.cy.js` | 100 | P1 |
| Intelligent Scheduling | `32-intelligent-scheduling.cy.js` | 80 | P1 |
| Database Integrity | `33-database-integrity.cy.js` | 50 | P1 |
| Automation Workflows | `34-automation-workflows.cy.js` | 50 | P2 |
| EHR Monitoring | `35-ehr-monitoring.cy.js` | 45 | P2 |
| File Operations | `36-file-operations.cy.js` | 50 | P2 |
| Gamification | `37-gamification.cy.js` | 42 | P2 |
| Untested Pages | `38-untested-pages.cy.js` | 125 | P3 |
| Integrations | `39-integrations.cy.js` | 50 | P3 |
| Performance | `40-performance.cy.js` | 45 | P3 |

### Test Coverage Improvements (Jan 5, 2026)

- **Remote Support**: WebSocket connections, queue management, consultant matching, video sessions
- **HIPAA Compliance**: 15-minute session timeout, PHI access control, audit logging, encryption
- **Security**: Authorization edge cases, permission enforcement, RBAC, error responses
- **Advanced Features**: Analytics dashboards, forecasting, scheduling algorithms
- **Error Handling**: HTTP status codes, validation errors, recovery mechanisms
- **Database**: Concurrent operations, foreign key integrity, audit trails
- **Integrations**: Daily.co video, email service, calendar sync, payment processing
- **Performance**: Large datasets, chart rendering, table virtualization, image loading

Run tests with: `CYPRESS_TEST=true npx cypress run`

See `TEST_PLAN.md` for detailed checklist and implementation status.

## Key Files

### Frontend Pages
- `client/src/pages/Dashboard.tsx` - Main dashboard with widgets
- `client/src/pages/Analytics.tsx` - Analytics with Report Builder & Advanced Visualizations
- `client/src/pages/Consultants.tsx` - Consultant management with documents
- `client/src/pages/Hospitals.tsx` - Hospital management with view modal
- `client/src/pages/Projects.tsx` - Project management with financial tracking
- `client/src/pages/SupportTickets.tsx` - Support tickets (database connected)
- `client/src/pages/Schedules.tsx` - Scheduling (database connected)
- `client/src/pages/Contracts.tsx` - Contracts with digital signatures
- `client/src/pages/Invoices.tsx` - Invoice management (database connected)
- `client/src/pages/RemoteSupport.tsx` - Remote support integration page

### Backend
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database operations
- `server/seedDemoData.ts` - Demo data seeding
- `shared/schema.ts` - Drizzle ORM schema definitions

### Testing
- `cypress/e2e/` - 39 E2E test files (25 original + 14 new coverage files)
- `cypress/support/commands.js` - Custom Cypress commands
- `cypress.config.js` - Cypress configuration
- `TEST_PLAN.md` - Comprehensive test coverage plan and checklist

### Remote Support System
- `remote-support/server/` - Express backend (port 3002)
- `remote-support/client/` - React frontend (port 5173)
- `remote-support/server/src/services/daily.ts` - Daily.co integration
- `remote-support/server/src/services/websocket.ts` - Real-time updates
- `remote-support/server/src/services/matching.ts` - Smart consultant matching

## Running the Project

```bash
# Start development server
npm run dev

# Start on specific port (for Cypress tests)
PORT=4000 npm run dev

# Seed demo data
curl -X POST http://localhost:4000/api/admin/seed-demo-data

# Run Cypress tests
CYPRESS_TEST=true npx cypress run

# Open Cypress UI
CYPRESS_TEST=true npx cypress open

# Run Remote Support (standalone)
cd remote-support && npm run dev
# Server: http://localhost:3002
# Client: http://localhost:5173

# Remote Support requires .env file with video credentials
# remote-support/.env:
# DAILY_API_KEY=your_key
# DAILY_DOMAIN=your_domain.daily.co
```

## Database Tables

Uses PostgreSQL with Drizzle ORM. Key tables:
- `users` - User accounts
- `consultants` - Consultant profiles
- `hospitals` - Hospital information
- `projects` - Project tracking
- `project_tasks` - Tasks for projects
- `project_schedules` - Shift schedules
- `user_activities` - Activity feed
- `consultant_documents` - Document management
- `timesheets` - Time tracking
- `support_tickets` - Support ticket system
- `invoices` - Invoice management
- `contracts` - Contract management
- `eod_reports` - End of day reports
- `crm_contacts` - CRM contact records
- `crm_companies` - CRM company/organization records
- `crm_deals` - CRM deal/opportunity tracking
- `crm_activities` - CRM activity log
- `crm_tasks` - CRM task management
- `crm_pipelines` - CRM pipeline definitions
- `crm_pipeline_stages` - CRM pipeline stages

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/tasks` - User's tasks
- `GET /api/dashboard/calendar-events` - Calendar events
- `GET /api/activities/recent` - Recent activity feed

### Core Resources
- `GET /api/consultants` - List consultants
- `GET /api/hospitals` - List hospitals
- `GET /api/projects` - List projects

### Support Tickets
- `GET /api/support-tickets` - List all tickets
- `POST /api/support-tickets` - Create ticket
- `PATCH /api/support-tickets/:id` - Update ticket
- `DELETE /api/support-tickets/:id` - Delete ticket

### Schedules
- `GET /api/schedules` - List all schedules
- `POST /api/schedules` - Create schedule
- `PATCH /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### EOD Reports
- `GET /api/eod-reports` - List EOD reports
- `POST /api/eod-reports` - Create EOD report

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `PATCH /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### CRM
- `GET /api/crm/dashboard` - CRM dashboard statistics
- `GET/POST /api/crm/contacts` - List and create contacts
- `GET/PATCH/DELETE /api/crm/contacts/:id` - Manage contact
- `GET/POST /api/crm/companies` - List and create companies
- `GET/PATCH/DELETE /api/crm/companies/:id` - Manage company
- `GET/POST /api/crm/deals` - List and create deals
- `GET/PATCH/DELETE /api/crm/deals/:id` - Manage deal
- `GET/POST /api/crm/activities` - Activity log
- `GET/POST /api/crm/tasks` - Task management
- `GET/POST /api/crm/pipelines` - Pipeline management

## Test User

In development mode, the app uses a mock user:
- Email: dev@nicehr.local
- Role: admin
- Name: Dev Admin

## Architecture Notes

1. **State Management**: React Query for server state, local useState for UI state
2. **API Pattern**: RESTful endpoints with Express.js
3. **Database**: PostgreSQL with Drizzle ORM for type-safe queries
4. **Testing**: Cypress E2E tests with mock API intercepts
5. **UI Components**: shadcn/ui with Tailwind CSS

## Pages Status

| Page | Status | Database Connected |
|------|--------|-------------------|
| Dashboard | ✅ Complete | Yes |
| Analytics | ✅ Complete | Yes |
| Consultants | ✅ Complete | Yes |
| Hospitals | ✅ Complete | Yes |
| Projects | ✅ Complete | Yes |
| Support Tickets | ✅ Complete | Yes |
| Schedules | ✅ Complete | Yes |
| Invoices | ✅ Complete | Yes |
| Contracts | ✅ Complete | Yes |
| Training | ✅ Complete | Yes |
| Timesheets | ✅ Complete | Yes |
| Travel | ✅ Complete | Yes |
| Chat | ✅ Complete | Yes |
| Documents | ✅ Complete | Yes |
| Remote Support | ✅ Complete | Standalone* |
| CRM Dashboard | ✅ Complete | Yes |
| CRM Contacts | ✅ Complete | Yes |
| CRM Companies | ✅ Complete | Yes |
| CRM Deals | ✅ Complete | Yes |

*Remote Support runs as a standalone service on ports 3002/5173
