# CLAUDE.md - Project Context for AI Assistance

## Project Overview

**NiceHR** is an EHR (Electronic Health Record) Implementation Consulting Management Platform built with:
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Testing**: Cypress E2E tests

## Recent Changes (Dec 28, 2025)

### Completed Features

1. **Consultant Documents & Shift Preferences**
   - Added 90+ demo documents for all 12 consultants
   - Documents include: Resume, certifications, background checks, HIPAA training, W-9, NDA, etc.
   - Added shift preferences (day/night/swing) for all consultants
   - Documents tab now fetches and displays real documents with status badges

2. **Dashboard Enhancements**
   - Made all 6 stat cards clickable with navigation:
     - Total Consultants → /consultants
     - Hospitals → /hospitals
     - Active Projects → /projects
     - Pending Documents → /documents
     - Available Consultants → /consultants
     - Total Savings → /analytics
   - Added 10 demo project tasks for My Tasks widget
   - Added 10 demo user activities for Recent Activities feed
   - Renamed sidebar "Overview" to "Dashboard"

3. **Hospital & Project Expansions**
   - Added 25+ fields to hospitals (facility type, bed count, trauma level, etc.)
   - Added 30+ financial fields to projects (budget breakdown, ROI, savings categories)
   - Added "View More" modals for both hospitals and projects

4. **Performance Metrics (Completed)**
   - `ticketResolutionRate` - Calculated from support_tickets table (resolved + closed / total)
   - `projectCompletionRate` - Calculated from projects table (completed / total)
   - `consultantUtilization` - Calculated from timesheets (current month hours / expected hours)
   - `totalHoursLogged` - Sum of all timesheet hours
   - Added 8 demo timesheets with current month dates
   - Added 10 demo support tickets (8 resolved, 1 in progress, 1 open)
   - Added 1 completed project to show project completion rate

5. **Cypress Tests (All Passing)**
   - 47 spec files, 784 passing tests, 0 failures
   - Fixed contracts-signatures tests (embedded signers in mock data)
   - Fixed profile-management tests (restructured beforeEach blocks)
   - 75 pending tests for unimplemented features

## Key Files

### Frontend
- `client/src/pages/Dashboard.tsx` - Main dashboard with widgets
- `client/src/pages/Consultants.tsx` - Consultant management with documents
- `client/src/pages/Hospitals.tsx` - Hospital management with view modal
- `client/src/pages/Projects.tsx` - Project management with financial tracking
- `client/src/components/AppSidebar.tsx` - Navigation sidebar

### Backend
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database operations (including performance metrics)
- `server/seedDemoData.ts` - Demo data seeding
- `shared/schema.ts` - Drizzle ORM schema definitions

### Testing
- `cypress/e2e/` - E2E test files
- `cypress/support/commands.js` - Custom Cypress commands
- `cypress.config.js` - Cypress configuration

## Running the Project

```bash
# Start development server (port 4000 for Cypress tests)
PORT=4000 npm run dev

# Seed demo data
curl -X POST http://localhost:4000/api/admin/seed-demo-data

# Run Cypress tests
CYPRESS_TEST=true npx cypress run

# Open Cypress UI
CYPRESS_TEST=true npx cypress open
```

## Database

Uses PostgreSQL with Drizzle ORM. Key tables:
- `users` - User accounts
- `consultants` - Consultant profiles
- `hospitals` - Hospital information
- `projects` - Project tracking
- `project_tasks` - Tasks for projects
- `user_activities` - Activity feed
- `consultant_documents` - Document management
- `timesheets` - Time tracking for utilization metrics
- `support_tickets` - Ticket tracking for resolution metrics

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics (includes performance metrics)
- `GET /api/dashboard/tasks` - User's tasks
- `GET /api/dashboard/calendar-events` - Calendar events
- `GET /api/activities/recent` - Recent activity feed

### Core Resources
- `GET /api/consultants` - List consultants
- `GET /api/consultants/:id/documents` - Consultant documents
- `GET /api/hospitals` - List hospitals
- `GET /api/projects` - List projects

## Test User

In development mode, the app uses a mock user:
- Email: dev@nicehr.local
- Role: admin
- Name: Dev Admin

## Notes for Future Sessions

1. All Cypress tests pass - run `CYPRESS_TEST=true npx cypress run` to verify
2. Performance metrics are calculated in `storage.getDashboardStats()`
3. Documents page (`/documents`) exists but may need review
4. Analytics page (`/analytics`) links from dashboard
5. Account settings page (`/account-settings`) not yet implemented (tests skipped)
