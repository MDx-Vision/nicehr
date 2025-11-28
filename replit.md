# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed to streamline the process of matching healthcare consultants with hospital projects. The system supports multi-role authentication (Admin, Hospital Staff, Consultants) and provides tools for consultant onboarding, project scheduling, document management, ROI analysis, and advanced analytics. It aims to offer a professional and efficient solution for healthcare staffing and project oversight.

## User Preferences
- Professional healthcare aesthetic with calming blue/teal colors
- Clean, minimal interface focused on usability
- Dark mode support for night shift workers
- Responsive design for desktop and tablet use

## System Architecture

### UI/UX Decisions
The platform features a clean, minimal interface with a professional healthcare aesthetic, utilizing calming blue/teal colors. It supports both light and dark modes and is designed to be responsive across desktop and tablet devices. UI components are built with shadcn/ui and styled with Tailwind CSS, ensuring a consistent and modern look. Key UI elements include role-based dashboards, advanced filtering for consultant directories, and visual progress trackers for project phases and onboarding.

### Technical Implementations
The application is built with a React, Vite, and TypeScript frontend, an Express.js backend, and a PostgreSQL database managed via Drizzle ORM. State management is handled by TanStack Query v5, and routing with Wouter. Authentication is provided by Replit Auth (OpenID Connect). Document storage leverages Replit Object Storage, with fine-grained access control using ACL policies. The system incorporates robust activity logging, real-time notifications, and a comprehensive role-based access control (RBAC) system for managing content restrictions.

### Feature Specifications
- **Multi-Role Authentication**: Admin, Hospital Staff, and Consultant roles with distinct access levels.
- **Consultant Management**: Profiles with experience tracking, EMR badges, ratings, document uploads, and advanced search/filtering capabilities.
- **Project Lifecycle Management**: An 11-phase EHR implementation methodology with visual progress tracking, tasks, milestones, and risk registers.
- **Onboarding Workflow**: Streamlined consultant onboarding with task categories, progress tracking, and admin review/approval.
- **Go-Live Command Center**: Real-time dashboard for managing go-live operations including digital sign-in/out, support ticket dispatch with SLA tracking, and shift handoff notes with acknowledgments.
- **Scheduling**: Tools for creating shifts, assigning consultants, and managing approval workflows.
- **Document Management**: Secure upload, status tracking, expiration alerts, and type-specific document handling.
- **Analytics & Reporting**: Role-specific dashboards providing platform metrics, hospital ROI analysis, and consultant performance insights.
- **Activity Tracking & Notifications**: Comprehensive logging of user actions and in-app/email notifications for key events.
- **Content Restriction System**: Role-based access control for pages, APIs, and features, with audit logging.
- **Account Management**: User settings for privacy, notification preferences, and account deletion requests.
- **Email Notifications**: Template-based email service integrated via Resend for various system events.
- **Financial Management**: Expense tracking with receipt uploads, mileage/per diem policies, invoice generation with line items and templates, payroll batch processing with pay rates and paycheck stubs, budget scenario modeling with what-if analysis.

## Recent Changes
- **November 28, 2025**: Completed Phase 13 (Financial Management) - Added Expenses page with expense submission, receipt upload, mileage/per diem tracking, and approval workflow. Invoices page with line item management, templates, and auto-generation from timesheets. Payroll page with batch processing, pay rate management, and paycheck stubs. Budget Modeling page with scenario planning, metrics tracking, and what-if analysis. Database tables: perDiemPolicies, mileageRates, expenses, invoiceTemplates, invoices, invoiceLineItems, payRates, payrollBatches, payrollEntries, paycheckStubs, budgetScenarios, scenarioMetrics. New pages: /expenses, /invoices, /payroll, /budget-modeling.
- **November 28, 2025**: Completed Phase 12 (Support Ticketing & Escalation Management) - Added Support Tickets page with full CRUD, filtering by priority/status/assignment, ticket comments, and SLA tracking. EOD Reports page with daily submission workflow, approval process, and report history. Escalation Management page with two-tab interface for escalation rules and HIPAA-compliant data retention policies. Database tables: eodReports, escalationRules, ticketComments, ticketHistory, dataRetentionPolicies. New pages: /support-tickets, /eod-reports, /escalation-management.
- **November 28, 2025**: Completed Phase 11 (Training & Competency) - Added Training Portal with course catalog and enrollment, Competency Assessments with quiz functionality and scoring, Login Labs for EMR training sessions, and Knowledge Base with searchable articles. Database tables: courses, courseModules, courseEnrollments, assessments, assessmentQuestions, assessmentAttempts, loginLabs, loginLabParticipants, knowledgeArticles. New pages: /training, /assessments, /login-labs, /knowledge-base.
- **November 27, 2025**: Completed Phase 10 (Scheduling & Time Management) - Added timesheets with clock in/out functionality and approval workflow, availability calendar for consultants, shift swap request and approval system. Database tables: timesheets, timesheetEntries, availabilityBlocks, shiftSwapRequests. New pages: /timesheets, /availability, /shift-swaps.
- **November 27, 2025**: Completed Phase 9 (Go-Live Command Center) - Added digital sign-in/out system, support ticket dispatch with priority levels and SLA tracking, shift handoff notes with acknowledgment workflow, and real-time KPI dashboard. Database tables: goLiveSignIns, supportTickets, shiftHandoffs.

### System Design Choices
The architecture emphasizes modularity and scalability, with clear separation between frontend, backend, and shared components. Database schema includes dedicated tables for project phases, tasks, risks, onboarding, activities, notifications, email logs, and content access rules to support complex workflows. API endpoints are logically structured for CRUD operations and specialized functions, ensuring efficient data exchange. The use of middleware for activity logging, authentication, and access control centralizes these critical functions.

## External Dependencies
- **Replit Auth**: For user authentication and role-based access control.
- **PostgreSQL**: Relational database management.
- **Replit Object Storage**: For storing and managing consultant documents and profile media.
- **Resend**: Email service for sending system notifications.
- **Uppy**: Frontend file uploader library.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **TanStack Query**: Data fetching and state management.
- **Wouter**: React routing library.