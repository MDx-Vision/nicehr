# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed for EHR implementation projects following an 11-phase methodology. It manages consultants, hospitals, projects, onboarding, go-live operations, ROI measurement, time/attendance, training/competency, support ticketing, financial management, travel coordination, quality assurance, gamification, compliance tracking, digital signatures, real-time chat, identity verification, and reporting & business intelligence. The platform aims to streamline complex EHR implementations and improve operational efficiency for healthcare organizations.

## User Preferences
- Professional healthcare aesthetic with calming blue/teal colors
- Clean, minimal interface focused on usability
- Dark mode support for night shift workers
- Responsive design for desktop and tablet use

## System Architecture

### Technical Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Express.js, Node.js
- **Database:** PostgreSQL with Drizzle ORM
- **State Management:** TanStack Query v5
- **Routing:** Wouter
- **Real-time:** WebSocket (ws library)
- **Authentication:** Replit Auth (OpenID Connect)
- **Storage:** Replit Object Storage
- **Email:** Resend

### Core Features & Design Decisions
- **Role-Based Access Control (RBAC):** Granular permissions (44 across 15 domains), 4 base roles, 11 implementation-specific roles, custom role creation, permission-based navigation, API middleware for enforcement, project context filtering.
- **11-Phase EHR Implementation Methodology:** The platform is structured around a predefined 11-phase project lifecycle for EHR implementations, from planning to transition, with visual progress tracking.
- **Project & Hospital Management:** CRUD for hospitals, project lifecycle management, risk registers, milestone tracking, consultant-project assignments, RACI responsibility matrix.
- **Phase Management System:** Detailed 11-phase project tracking with:
  - **Phase Steps:** Granular task breakdown within each phase with status tracking (not_started, in_progress, completed, skipped, blocked), completion percentages, key activities, expected deliverables, and timeline estimates.
  - **Phase Deliverables:** Required and optional deliverables per phase/step with submission tracking, approval workflows, and file attachments.
  - **Phase Risks:** Risk register per phase with probability/impact assessment, mitigation plans, contingency strategies, and status tracking (identified, mitigating, resolved, accepted).
  - **Phase Milestones:** Key milestone tracking with due dates and completion status.
  - **RACI Matrix:** Team responsibility assignments (Responsible, Accountable, Consulted, Informed) per phase with role-based permission controls.
- **Consultant Management:** Detailed profiles, EMR system badges/certifications, advanced search, document uploads, structured onboarding workflows.
- **Operational Tools:** Timesheets with approval, consultant availability, shift scheduling, command center dashboard, support ticket system, EOD reports, digital sign-in/out, shift handoff notes.
- **Training & Competency:** Training portal, competency assessments, login labs for EMR, knowledge base.
- **Financial Management:** Expense submission, invoice generation, payroll processing, budget modeling.
- **Travel Management:** Consultant travel preferences, booking management, transportation coordination.
- **Quality & Compliance:** Consultant scorecards, pulse surveys, NPS tracking, incident reporting, HIPAA compliance dashboard.
- **Communication:** Real-time chat (channels, DMs), digital signatures, activity logging, in-app notifications.
- **Analytics & Reporting:** Role-specific and executive dashboards, hospital ROI analysis, report builder, consultant performance insights. Advanced analytics including Go-Live Readiness, Consultant Utilization, Timeline Forecast, and Cost Variance Analysis.
- **Integration Hub:** Facilitates connections with Calendar (Google, Outlook, iCal), Payroll (ADP, Workday, Paychex, Gusto), and EHR systems (Epic, Cerner, Meditech, Allscripts) with sync jobs, event tracking, and system health monitoring.
- **Demo Data Seeding System:** Comprehensive system for populating the database with realistic demo data across all modules for showcase and testing.

### Database Schema Highlights
- **RBAC Tables:** `roles`, `permissions`, `role_permissions`, `user_role_assignments`
- **Core Tables:** `users`, `hospitals`, `projects`, `consultants`
- **Phase Management:** `project_phases`, `phase_steps`, `phase_deliverables`, `phase_risks`, `project_milestones`, `raci_assignments`
- **Operations:** `timesheets`, `support_tickets`, `eod_reports`, `schedules`
- **Training:** `training_modules`, `assessments`, `competency_records`
- **Financial:** `expenses`, `invoices`, `payroll_batches`, `pay_rates`
- **Quality:** `consultant_scorecards`, `pulse_surveys`, `incident_reports`
- **Analytics:** `go_live_readiness_snapshots`, `consultant_utilization_snapshots`, `timeline_forecast_snapshots`, `cost_variance_snapshots`
- **Skills/Personal:** `consultant_questionnaires`, `skill_categories`, `skill_items`, `consultant_skills`, `consultant_ehr_experience`, `consultant_certifications`, `skill_verifications`

### Key API Endpoints for Phase Management
- `GET/POST /api/phases/:phaseId/steps` - List and create phase steps
- `GET/PATCH/DELETE /api/steps/:id` - Read, update, delete individual steps
- `GET/POST /api/phases/:phaseId/deliverables` - List and create phase deliverables
- `GET/PATCH/DELETE /api/deliverables/:id` - Read, update, delete individual deliverables
- `GET/POST /api/phases/:phaseId/risks` - List and create phase risks
- `GET/PATCH/DELETE /api/risks/:id` - Read, update, delete individual risks
- `GET/POST /api/phases/:phaseId/milestones` - List and create phase milestones
- `GET/PATCH/DELETE /api/milestones/:id` - Read, update, delete individual milestones
- `GET/POST /api/projects/:projectId/raci` - List and manage RACI assignments

### Demo Data Seeding
Run `npx tsx server/seedDemoData.ts` to populate the database with comprehensive demo data including:
- 2 hospitals with units and modules
- 3 projects at various stages
- 11 phases per project with steps, deliverables, risks, and milestones
- RACI matrix assignments
- C-Suite staff and consultants
- Training courses and integration connections
- Advanced analytics snapshots

## Testing

### E2E Testing with Cypress
The platform includes Cypress for end-to-end testing with a dual authentication system:

**Setup:**
1. Run `npx tsx seed.ts` to seed test data (creates test user with email `test@example.com`)
2. Run `npx cypress run` to execute all E2E tests
3. Run `npx cypress open` for interactive test development

**Test Authentication:**
- Production uses OIDC (Replit Auth) for secure login
- Development/Testing uses traditional email/password login (`POST /api/auth/login`)
- Test credentials: `test@example.com` / `password123` (admin role)
- Session cookies are set with `secure: false` in development for HTTP compatibility

**Test Files (18 total):**

| File | Module | Coverage |
|------|--------|----------|
| `01-authentication.cy.js` | Authentication | Login, logout, session, RBAC |
| `02-hospitals.cy.js` | Hospital Management | CRUD, units, associated projects |
| `03-projects.cy.js` | Projects & 11-Phase Workflow | Projects, phases, steps, deliverables, risks, milestones, RACI |
| `04-consultants.cy.js` | Consultant Management | Profiles, certifications, skills, onboarding |
| `05-time-attendance.cy.js` | Time & Attendance | Timesheets, schedules, EOD reports, handoffs |
| `06-training-competency.cy.js` | Training & Competency | Training portal, assessments, login labs, knowledge base |
| `07-support-tickets.cy.js` | Support Tickets | CRUD, status workflow, SLA tracking |
| `08-financial.cy.js` | Financial Management | Expenses, invoices, payroll, budgets |
| `09-travel.cy.js` | Travel Management | Bookings, preferences, itineraries, approvals |
| `10-quality-compliance.cy.js` | Quality & Compliance | Scorecards, surveys, NPS, incidents, HIPAA |
| `11-communication.cy.js` | Communication | Real-time chat, digital signatures, notifications |
| `12-analytics-reporting.cy.js` | Analytics & Reporting | Dashboards, reports, ROI analysis |
| `13-admin-rbac-integrations.cy.js` | Administration | Users, roles, integrations, gamification |
| `login.cy.js` | Basic Login | Simple login test |
| `create_item.cy.js` | Basic CRUD | Hospital and project creation |
| `update_delete.cy.js` | Basic CRUD | Update and delete workflows |
| `error_handling.cy.js` | Error Handling | Login error validation |
| `navigation.cy.js` | Navigation | Dashboard navigation, browser back |

**Support Files:**
- `cypress/support/commands.js` - Custom reusable commands (login, selectOption, fillField, etc.)
- `cypress/support/e2e.js` - Test configuration (WebSocket error handling, timeouts, viewport)
- `seed.ts` - Database seeding for test data

**Custom Cypress Commands:**
| Command | Description | Usage |
|---------|-------------|-------|
| `cy.login(email, password)` | Login via UI | `cy.login()` |
| `cy.loginViaApi(email, password)` | Login via API (faster) | `cy.loginViaApi()` |
| `cy.navigateTo(module)` | Navigate to module | `cy.navigateTo('projects')` |
| `cy.selectOption(selector, text)` | Select Radix UI option | `cy.selectOption('[data-testid="select"]', 'Option')` |
| `cy.fillField(testId, value)` | Fill form field | `cy.fillField('input-name', 'Value')` |
| `cy.clickButton(testId)` | Click button | `cy.clickButton('button-submit')` |
| `cy.tableRowExists(text)` | Assert table row exists | `cy.tableRowExists('Project Name')` |
| `cy.openModal(buttonTestId)` | Open modal dialog | `cy.openModal('button-create')` |
| `cy.assertToast(message)` | Assert toast message | `cy.assertToast('Success')` |

**Important Test Data Attributes:**
- Interactive elements use `data-testid` attributes for reliable selection
- Pattern: `input-*`, `button-*`, `select-*`, `checkbox-*`, `tab-*`, `filter-*`
- Examples: `input-hospital-name`, `button-submit-project`, `select-hospital`

**Radix UI Components:**
- Use `cy.selectOption()` custom command for Radix Select components
- Use `{ force: true }` for clicks when modals cause `pointer-events: none`

### CI/CD with GitHub Actions
The project includes GitHub Actions workflows for continuous integration:

**E2E Testing CI (`.github/workflows/main.yml`):**
- Workflow name: "E2E Testing CI"
- Triggers: Push to `main` branch OR pull requests targeting `main`
- Uses `cypress-io/github-action@v6` for reliable test execution
- Runs `npm run test:e2e` command
- **Build fails if any Cypress test fails** (unbreakable quality gate)
- Steps:
  1. Checkout code (`actions/checkout@v4`)
  2. Setup Node.js 20 with npm caching
  3. Install dependencies and setup PostgreSQL database
  4. Run database migrations (`npm run db:push`) and seed test data
  5. Build application (`npm run build`)
  6. Start server and run Cypress E2E tests
  7. Upload screenshots (on failure) and videos (always) as artifacts

**Required package.json script:**
```json
"test:e2e": "cypress run --browser electron --headless"
```

**CI Pipeline (`.github/workflows/ci.yml`):**
- Extended workflow with deployment job
- Deploy job only runs after tests pass and only on push to `main`

## External Dependencies
- **Replit Auth:** User authentication via OpenID Connect
- **PostgreSQL:** Relational database (Neon-backed)
- **Replit Object Storage:** Document and media storage
- **Resend:** Email notification service
- **Uppy:** Frontend file uploader
- **shadcn/ui:** UI component library
- **Tailwind CSS:** Utility-first CSS framework
- **TanStack Query:** Data fetching and caching
- **Wouter:** Lightweight React router
- **WebSocket (ws):** Real-time communication library
- **react-signature-canvas:** Digital signature capture
- **Cypress:** End-to-end testing framework