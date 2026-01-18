# CLAUDE.md - Project Context for AI Assistance

## Project Overview

**NiceHR** is an EHR (Electronic Health Record) Implementation Consulting Management Platform built with:
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Testing**: Cypress E2E tests

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
Total Tests: 1,692 (100% passing)
Test Files: 39 E2E test files
Coverage Areas: 28 test categories
Pass Rate: 100%
Duration: 12m 49s
```

### Test Results Summary (Jan 5, 2026)

| Metric | Value |
|--------|-------|
| Total Tests | 1,692 |
| Passing | 1,692 ✅ |
| Failing | 0 |
| Pass Rate | 100% |

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

*Remote Support runs as a standalone service on ports 3002/5173
