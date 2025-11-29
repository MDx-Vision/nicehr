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
- **Project & Hospital Management:** CRUD for hospitals, project lifecycle management, risk registers, milestone tracking, consultant-project assignments.
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
- **Operations:** `timesheets`, `support_tickets`, `eod_reports`, `schedules`
- **Training:** `training_modules`, `assessments`, `competency_records`
- **Financial:** `expenses`, `invoices`, `payroll_batches`, `pay_rates`
- **Quality:** `consultant_scorecards`, `pulse_surveys`, `incident_reports`
- **Analytics:** `go_live_readiness_snapshots`, `consultant_utilization_snapshots`, `timeline_forecast_snapshots`, `cost_variance_snapshots`
- **Skills/Personal:** `consultant_questionnaires`, `skill_categories`, `skill_items`, `consultant_skills`, `consultant_ehr_experience`, `consultant_certifications`, `skill_verifications`

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