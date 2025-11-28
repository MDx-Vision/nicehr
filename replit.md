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

### RECENTLY COMPLETED (November 28, 2025)

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

#### RBAC Permission Management
- [x] Fixed Role Management UI to display all 15 roles correctly
- [x] All roles (base, implementation, custom) now support permission editing
- [x] Save Permissions button for all role types
- [x] Permission checkboxes with "Select All" per domain
- [x] Legacy admin bypass for bootstrapping (role='admin' grants full access)
- [x] RBAC seeding at server startup (roles & permissions auto-created)
- [x] Added 'implementation' roleType to database schema

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

#### Phase 3: Integration & Automation
- [ ] Calendar integrations (Google, Outlook)
- [ ] HR system integrations (payroll sync)
- [ ] EHR system status monitoring
- [ ] Automated escalation workflows

#### Phase 4: Advanced Analytics
- [ ] Predictive go-live readiness scoring
- [ ] Consultant utilization optimization
- [ ] Project timeline forecasting
- [ ] Cost variance analysis

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
