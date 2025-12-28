# CLAUDE.md - Project Context for AI Assistance

## Project Overview

**NiceHR** is an EHR (Electronic Health Record) Implementation Consulting Management Platform built with:
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Testing**: Cypress E2E tests

## Recent Changes (Dec 28, 2024)

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

### Pending Work

1. **Performance Metrics** - Dashboard gauges need real calculations:
   - `ticketResolutionRate` - not calculated
   - `projectCompletionRate` - not calculated
   - `consultantUtilization` - not calculated
   - `totalHoursLogged` - not calculated

2. **Cypress Tests** - Need to run and verify all tests pass

## Key Files

### Frontend
- `client/src/pages/Dashboard.tsx` - Main dashboard with widgets
- `client/src/pages/Consultants.tsx` - Consultant management with documents
- `client/src/pages/Hospitals.tsx` - Hospital management with view modal
- `client/src/pages/Projects.tsx` - Project management with financial tracking
- `client/src/components/AppSidebar.tsx` - Navigation sidebar

### Backend
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database operations
- `server/seedDemoData.ts` - Demo data seeding
- `shared/schema.ts` - Drizzle ORM schema definitions

### Testing
- `cypress/e2e/` - E2E test files
- `cypress/support/commands.js` - Custom Cypress commands
- `cypress.config.js` - Cypress configuration

## Running the Project

```bash
# Start development server (port 3000)
PORT=3000 npm run dev

# Seed demo data
curl -X POST http://localhost:3000/api/admin/seed-demo-data

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

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
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

1. Performance metrics need backend calculations in `storage.getDashboardStats()`
2. Some Cypress tests may need updating after UI changes
3. Documents page (`/documents`) exists but may need review
4. Analytics page (`/analytics`) links from dashboard
