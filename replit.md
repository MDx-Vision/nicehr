# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed for EHR implementation projects following an 11-phase methodology. The system manages consultants, hospitals, projects, onboarding, go-live operations, ROI measurement, time/attendance, training/competency, support ticketing, financial management, travel coordination, quality assurance, gamification, compliance tracking, digital signatures, real-time chat, identity verification, and reporting & business intelligence.

## User Preferences
- Professional healthcare aesthetic with calming blue/teal colors
- Clean, minimal interface focused on usability
- Dark mode support for night shift workers
- Responsive design for desktop and tablet use

---

## Project Status Tracking

### COMPLETED FEATURES

#### Core Infrastructure
- [x] React + Vite + TypeScript frontend with Express.js backend
- [x] PostgreSQL database with Drizzle ORM
- [x] Replit Auth (OpenID Connect) integration
- [x] Replit Object Storage for documents
- [x] WebSocket-based real-time chat
- [x] Email notifications via Resend

#### Role-Based Access Control (RBAC)
- [x] Database schema for roles, permissions, role_permissions, user_role_assignments
- [x] 44 granular permissions across 15 domains
- [x] 4 base roles: admin, hospital_leadership, hospital_staff, consultant
- [x] 11 implementation-specific roles (see Implementation Roles below)
- [x] Role Management UI with permission matrix
- [x] Custom role creation capability
- [x] Permission-based navigation gating
- [x] API middleware for permission enforcement (17+ endpoints protected)
- [x] Project context filtering for consultants (scoped to assigned projects)

#### Implementation Roles (Pre-configured)
**Leadership Roles:**
- [x] Implementation Project Manager - Full project oversight
- [x] Go-Live Coordinator - Command center & escalation management
- [x] Training Lead - Training program & super user coordination
- [x] Command Center Manager - Real-time go-live operations
- [x] Application Analyst - Technical config & tier 2 support
- [x] Support Desk Lead - Tier 1 support & ticket triage
- [x] Quality Assurance Lead - Quality metrics & compliance

**Phase-Specific Roles:**
- [x] At-the-Elbow Support - On-floor go-live assistance
- [x] Super User - Elevated hospital staff access
- [x] Optimization Analyst - Post-go-live optimization
- [x] Stabilization Lead - Post-go-live stabilization
- [x] Transition Coordinator - Implementation to operations handoff

#### Project & Hospital Management
- [x] Hospital CRUD with contact information
- [x] Project lifecycle management with 11-phase methodology
- [x] Project phases with visual progress tracking
- [x] Risk registers and milestone tracking
- [x] Consultant-project assignments

#### Consultant Management
- [x] Consultant profiles with experience tracking
- [x] EMR system badges and certifications
- [x] Advanced search and filtering
- [x] Document uploads and management
- [x] Onboarding workflow with task categories

#### Time & Scheduling
- [x] Timesheet entries with approval workflow
- [x] Consultant availability calendar
- [x] Shift scheduling
- [x] Shift swap requests

#### Support & Go-Live Operations
- [x] Command Center dashboard
- [x] Support ticket system with CRUD
- [x] EOD (End of Day) reports
- [x] Escalation management with configurable rules
- [x] Digital sign-in/sign-out
- [x] Shift handoff notes

#### Training & Competency
- [x] Training portal with modules
- [x] Competency assessments
- [x] Login labs for EMR training
- [x] Knowledge base

#### Financial Management
- [x] Expense submission with approval workflow
- [x] Invoice generation
- [x] Payroll processing
- [x] Budget modeling calculator

#### Travel Management
- [x] Consultant travel preferences
- [x] Travel bookings (flights, hotels, rentals)
- [x] Transportation coordination

#### Quality & Compliance
- [x] Consultant scorecards
- [x] Pulse surveys
- [x] NPS tracking
- [x] Incident reporting
- [x] Compliance center with HIPAA dashboard

#### Communication
- [x] Real-time chat with channels and DMs
- [x] Digital signatures for contracts
- [x] Activity logging
- [x] In-app notifications

#### Analytics & Reporting
- [x] Role-specific dashboards
- [x] Executive dashboard
- [x] Hospital ROI analysis
- [x] Report builder
- [x] Consultant performance insights

---

### RECENTLY COMPLETED (November 29, 2025)

#### Phase 4: Advanced Analytics Dashboard
- [x] AdvancedAnalytics.tsx page with 4 interactive analytics cards
- [x] Go-Live Readiness scoring with circular gauge (92.5% score shown)
- [x] Consultant Utilization tracking (85% average displayed)
- [x] Timeline Forecast with risk assessment (89% on-track confidence)
- [x] Cost Variance Analysis with budget tracking (6.2% variance shown)
- [x] Project filter dropdown for viewing individual or aggregate analytics
- [x] Compute/Calculate buttons to trigger backend recalculation
- [x] 4 new schema tables with proper indexes and foreign keys
- [x] 13 API routes under /api/analytics/advanced with RBAC protection
- [x] analytics:view and analytics:manage permissions (46 total permissions, 16 roles)
- [x] Demo data: 8 snapshots per analytics type (32 total records)

---

### RECENTLY COMPLETED (November 28, 2025)

#### Demo Data Seeding System
- [x] Comprehensive demo data seeder (server/seedDemoData.ts)
- [x] 3 showcase hospitals: Mercy Regional Medical Center (Chicago), St. Luke's Healthcare System (Houston), Pacific Northwest Health Network (Seattle)
- [x] 15 hospital units across Emergency, ICU, Surgery, Oncology, Cardiology, Pediatrics, Neurology, and more
- [x] 10 hospital modules (ADT, EDIS, Clinical Documentation, etc.)
- [x] 12 demo consultants with TNG IDs, diverse EMR experience, and locations nationwide
- [x] 8 C-Suite hospital staff (CMOs, CIOs, CNOs, CEOs, CFOs, COOs)
- [x] 4 flagship projects with realistic budgets and savings metrics
- [x] 6 project phases with progress tracking
- [x] 10 document types for compliance tracking
- [x] 5 training courses for consultant development
- [x] Admin API endpoint: POST /api/admin/seed-demo-data (idempotent)
- [x] Demo admin user for showcasing platform

#### Skills Questionnaire System (Phase 18)
- [x] Database schema: consultant_questionnaires, skill_categories, skill_items, consultant_skills, consultant_ehr_experience, consultant_certifications, skill_verifications tables
- [x] Multi-step wizard page with 7 sections: EHR Systems, Clinical Modules, Revenue Cycle, Ancillary Systems, Technical Skills, Certifications, Work Preferences
- [x] Progress indicator showing completion percentage
- [x] Autosave functionality with draft status
- [x] Skills tab on consultant Profile page showing questionnaire summary
- [x] Admin Skills Verification page with queue management
- [x] Verification workflow: Pending → Verified/Rejected
- [x] Skills data seeding at server startup (default categories and items)
- [x] API endpoints for questionnaire CRUD, skills management, EHR experience

#### Personal Information System (Phase 18.5)
- [x] Database fields on consultants table: preferredName, birthday, tshirtSize, dietaryRestrictions, allergies, languages, emergencyContact fields
- [x] Personal Information page (/personal-information) with sections for basic info, languages, dietary/medical, emergency contact
- [x] Personal Information summary on Profile page with completion status
- [x] Navigation integration in Communication category
- [x] API endpoints: GET/PATCH /api/personal-info

#### RBAC Permission Management
- [x] Fixed Role Management UI to display all 15 roles correctly
- [x] All roles (base, implementation, custom) now support permission editing
- [x] Save Permissions button for all role types
- [x] Permission checkboxes with "Select All" per domain
- [x] Legacy admin bypass for bootstrapping (role='admin' grants full access)
- [x] RBAC seeding at server startup (roles & permissions auto-created)
- [x] Added 'implementation' roleType to database schema

#### Phase 3: Integration & Automation (November 29, 2025)
- [x] Integration Hub page (/integrations) - Admin only access
- [x] EHR System Monitoring page (/ehr-monitoring) - Admin only access
- [x] Integration connections for Calendar (Google, Outlook, iCal), Payroll (ADP, Workday, Paychex, Gusto), and EHR (Epic, Cerner, Meditech, Allscripts)
- [x] Sync jobs and events tracking with bidirectional sync support
- [x] EHR system health monitoring with status metrics (operational, degraded, partial_outage, major_outage, maintenance)
- [x] EHR incident management with severity levels and resolution tracking
- [x] Payroll sync profiles with field mappings and export scheduling
- [x] Payroll export jobs with CSV/XML/API formats
- [x] Escalation rules and triggers with configurable conditions and actions
- [x] Automation workflows with execution logging
- [x] Demo data for all integration features (5 connections, 5 EHR systems, 3 incidents)
- [x] Sidebar navigation under "Integrations" category with Link2 icon

**Demo Data Seeding:**
- Run `npx tsx server/seedDemoData.ts` to seed all demo data
- Or call POST /api/admin/seed-demo-data (requires admin auth)
- Seeding is idempotent - safe to run multiple times

---

### FUTURE FEATURES (Planned)

#### Phase 1: Core Enhancements
- [ ] AI-powered analytics and forecasting
- [ ] Automated workflow triggers based on project phase
- [ ] Email digest summaries (daily/weekly)
- [ ] Mobile-responsive improvements

#### Phase 2: Advanced RBAC
- [ ] Role inheritance (child roles inherit parent permissions)
- [ ] Time-bound role assignments (auto-expire after project ends)
- [ ] Role templates for quick team setup
- [ ] Bulk user role assignment

#### Phase 4: Advanced Analytics (COMPLETED - November 29, 2025)
- [x] Predictive go-live readiness scoring with circular gauge visualization
- [x] Consultant utilization optimization tracking
- [x] Project timeline forecasting with risk assessment
- [x] Cost variance analysis with budget tracking
- [x] analytics:view and analytics:manage permissions added to RBAC
- [x] 4 new database tables: go_live_readiness_snapshots, consultant_utilization_snapshots, timeline_forecast_snapshots, cost_variance_snapshots
- [x] 13 API endpoints under /api/analytics/advanced
- [x] Demo data seeded (8 snapshots per analytics type)

#### Phase 5: Gamification Expansion
- [ ] Achievement badges for milestones
- [ ] Team leaderboards
- [ ] Performance-based incentive tracking
- [ ] Recognition wall

---

## 11-Phase EHR Implementation Methodology

1. **Planning & Assessment** - Initial project scoping and resource planning
2. **Workflow Design** - Current state analysis and future state design
3. **System Build** - Configuration and customization
4. **Testing** - Unit, integration, and user acceptance testing
5. **Training Development** - Curriculum and materials creation
6. **Training Delivery** - End-user training execution
7. **Go-Live Preparation** - Final readiness activities
8. **Go-Live Support** - Command center and at-the-elbow support
9. **Stabilization** - Issue resolution and workflow optimization
10. **Optimization** - Performance tuning and efficiency gains
11. **Transition** - Handoff to ongoing operations

---

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

### Key Directories
```
├── client/src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   └── App.tsx         # Main application entry
├── server/
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database operations
│   └── index.ts        # Server entry point
├── shared/
│   └── schema.ts       # Database schema & types
└── replit.md           # This documentation
```

### Database Schema Highlights
- **RBAC Tables:** roles, permissions, role_permissions, user_role_assignments
- **Core Tables:** users, hospitals, projects, consultants
- **Operations:** timesheets, support_tickets, eod_reports, schedules
- **Training:** training_modules, assessments, competency_records
- **Financial:** expenses, invoices, payroll_batches, pay_rates
- **Quality:** consultant_scorecards, pulse_surveys, incident_reports

---

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
- **WebSocket (ws):** Real-time communication
- **react-signature-canvas:** Digital signature capture

---

## Recent Changes

### November 2024
- Added 11 implementation-specific roles with pre-configured permissions
- Enhanced RBAC with permission-based navigation gating
- Extended project context filtering to Timesheets, Support Tickets, Expenses, EOD Reports
- Applied permission middleware to 17+ API endpoints
- Created Role Management UI with permission matrix

### November 28, 2025 - RBAC Fixes
- Fixed Role Management UI to display all 15 roles with correct permissions
- All roles (base, implementation, custom) now support permission editing via checkboxes
- Added 'implementation' roleType to database enum
- Implemented legacy admin bypass in permission middleware
- RBAC seeding now runs at server startup (before routes registered)
- Each role correctly shows assigned permissions in permission dialog

---

## Development Notes

### Running the Project
The workflow `Start application` runs `npm run dev` which starts Express + Vite on port 5000.

### Key Files for RBAC
- `server/storage.ts` - Role/permission CRUD and seedInitialData()
- `client/src/hooks/use-permissions.tsx` - Permission context provider
- `client/src/lib/permissions.ts` - Navigation config with permission requirements
- `client/src/pages/RoleManagement.tsx` - Admin UI for role management
- `client/src/components/AppSidebar.tsx` - Navigation with permission gating
