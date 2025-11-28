# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed to streamline the process of matching healthcare consultants with hospital projects. The system supports multi-role authentication (Admin, Hospital Staff, Consultants) and provides tools for consultant onboarding, project scheduling, document management, ROI analysis, and advanced analytics. It aims to offer a professional and efficient solution for healthcare staffing and project oversight.

## Development Status

### Completed Phases
| Phase | Name | Status |
|-------|------|--------|
| Core | Platform Foundation | ✅ Complete |
| 9 | Go-Live Command Center | ✅ Complete |
| 10 | Scheduling & Time Management | ✅ Complete |
| 11 | Training & Competency | ✅ Complete |
| 12 | Support Ticketing & Escalation | ✅ Complete |
| 13 | Financial Management | ✅ Complete |
| 14 | Travel Management | ✅ Complete |
| 15 | Quality Assurance & Gamification | ✅ Complete |
| 16 | Integrations (Signatures, Chat, Identity) | ✅ Complete |
| 17 | Reporting & Business Intelligence | 🔄 In Progress |

### Upcoming Phases
| Phase | Name | Features |
|-------|------|----------|
| 18 | Mobile & Notifications | PWA, push notifications, SMS alerts |
| 19 | External Integrations | EMR APIs, calendar sync, SSO |

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

#### Core Platform Features
- **Multi-Role Authentication**: Admin, Hospital Staff, and Consultant roles with distinct access levels via Replit Auth (OpenID Connect).
- **Consultant Management**: Profiles with experience tracking, EMR badges, ratings, document uploads, and advanced search/filtering capabilities.
- **Project Lifecycle Management**: An 11-phase EHR implementation methodology with visual progress tracking, tasks, milestones, and risk registers.
- **Onboarding Workflow**: Streamlined consultant onboarding with task categories, progress tracking, and admin review/approval.
- **Document Management**: Secure upload via Replit Object Storage, status tracking, expiration alerts, and type-specific document handling.
- **Analytics & Reporting**: Role-specific dashboards providing platform metrics, hospital ROI analysis, and consultant performance insights.
- **Activity Tracking & Notifications**: Comprehensive logging of user actions and in-app/email notifications for key events.
- **Content Restriction System**: Role-based access control for pages, APIs, and features, with audit logging.
- **Account Management**: User settings for privacy, notification preferences, and account deletion requests.
- **Email Notifications**: Template-based email service integrated via Resend for various system events.

#### Go-Live Operations (Phase 9)
- **Go-Live Command Center**: Real-time dashboard for managing go-live operations.
- **Digital Sign-In/Out**: Track consultant presence during go-live shifts.
- **Support Ticket Dispatch**: Priority-based ticketing with SLA tracking.
- **Shift Handoff Notes**: Structured handoff with acknowledgment workflow.

#### Scheduling & Time Management (Phase 10)
- **Timesheets**: Clock in/out functionality with approval workflow.
- **Availability Calendar**: Consultants can set their available time blocks.
- **Shift Swap Requests**: Request and approval system for shift changes.

#### Training & Competency (Phase 11)
- **Training Portal**: Course catalog with modules and enrollment tracking.
- **Competency Assessments**: Quiz functionality with scoring and pass/fail tracking.
- **Login Labs**: EMR training sessions with participant tracking.
- **Knowledge Base**: Searchable articles organized by category.

#### Support Ticketing & Escalation (Phase 12)
- **Support Tickets**: Full CRUD with priority/status filtering, comments, and SLA tracking.
- **EOD Reports**: Daily submission workflow with approval process.
- **Escalation Rules**: Configurable escalation triggers and actions.
- **Data Retention Policies**: HIPAA-compliant retention management.

#### Financial Management (Phase 13)
- **Expenses**: Submission with receipt uploads, mileage/per diem tracking, approval workflow.
- **Invoices**: Line item management, templates, auto-generation from timesheets.
- **Payroll**: Batch processing, pay rate management, paycheck stubs.
- **Budget Modeling**: Scenario planning with metrics tracking and what-if analysis.

#### Travel Management (Phase 14)
- **Travel Preferences**: Airline/hotel/rental car preferences, rewards numbers, emergency contacts.
- **Travel Bookings**: Flights, hotels, rentals with confirmation tracking and cost estimates.
- **Travel Itineraries**: Trip planning with booking aggregation.
- **Transportation Coordination**: Carpool matching, shuttle schedules, transportation contacts.

#### Quality Assurance & Gamification (Phase 15)
- **Consultant Scorecards**: Performance metrics with ratings.
- **Pulse Surveys**: Team sentiment tracking with response analysis.
- **NPS Responses**: Satisfaction tracking and analysis.
- **Incident Reporting**: Safety/quality issues with corrective action workflows.
- **Gamification**: Point tracking, level progression, achievement badges, leaderboards, referral program.
- **Compliance Center**: HIPAA dashboard, compliance checks (licensure, certifications, training), audits with findings.
- **AI Analytics**: Platform health scoring, intelligent insights, consultant recommendations, attrition risk, demand forecasting.

#### Integrations (Phase 16)
- **Digital Signatures**: Contract templates with variable replacement, multi-signer workflows with sequence ordering, signature capture using react-signature-canvas, complete audit trail of all signing events.
- **Real-Time Chat**: WebSocket server with secure session-based authentication, channels (project/unit/module/direct/announcement types), real-time messaging with typing indicators, read receipts, quiet hours enforcement, shift chat summaries.
- **Identity Verification**: 3-step consultant wizard (personal info, document upload, review), admin review queue with approve/reject/resubmit actions, fraud flag management, verification events audit trail.

## Recent Changes
- **November 28, 2025**: Completed Phase 16 (Integrations) - Added Digital Signatures system with contract templates, multi-signer workflows, and signature capture using react-signature-canvas with audit trail. Real-Time Chat feature with WebSocket server (secure session-based authentication), channels, direct messages, typing indicators, read receipts, quiet hours enforcement, and shift summaries. Identity Verification system with consultant wizard (personal info, document upload, review), admin review queue with approve/reject/resubmit actions, fraud flagging, and verification events audit trail. Database tables: contractTemplates, contracts, contractSigners, contractSignatures, contractAuditEvents (digital signatures); chatChannels, channelMembers, chatMessages, chatMessageReads, shiftChatSummaries (chat); identityVerifications, identityDocuments, verificationEvents, fraudFlags (identity verification). New pages: /contracts, /chat, /identity-verification. WebSocket endpoint: /ws with cookie-signature authentication.
- **November 28, 2025**: Completed Phase 15 (Advanced Features) - Added Quality Assurance page with 4 tabs (Scorecards for consultant performance metrics, Pulse Surveys for team sentiment, NPS Responses for satisfaction tracking, Incidents for safety/quality issues with corrective actions). Gamification page with 4 tabs (Dashboard for points/level tracking, Badges for achievement management, Leaderboard with filtering, Referrals with bonus tracking). Compliance Center page with 3 tabs (Dashboard with compliance health score, Checks for HIPAA/licensure/training verification, Audits for compliance reviews). AI-powered analytics endpoint providing platform health scoring, intelligent insights, consultant recommendations, attrition risk analysis, demand forecasting, and performance trends. Database tables: consultantScorecards, pulseSurveys, pulseResponses, npsResponses, incidents, correctiveActions, achievementBadges, consultantBadges, pointTransactions, referrals, complianceChecks, complianceAudits. New pages: /quality-assurance, /gamification, /compliance-center. API: /api/analytics/ai.
- **November 28, 2025**: Completed Phase 14 (Travel Management) - Added Travel Preferences page for consultants to manage flight/hotel/rental car preferences, rewards numbers, meal preferences, and emergency contacts. Travel Bookings page with two tabs for booking management (flights, hotels, rentals with confirmation tracking, cost estimates) and itinerary management (trip planning, booking aggregation). Transportation Coordination page with three tabs: Carpool Groups (driver/rider matching, available seat tracking), Shuttle Schedules (route management, day-of-week schedules), and Transportation Contacts (driver info with photos). Database tables: travelPreferences, travelBookings, travelItineraries, itineraryBookings, carpoolGroups, carpoolMembers, shuttleSchedules, transportationContacts. New pages: /travel-preferences, /travel-bookings, /transportation.
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
- **WebSocket (ws)**: Real-time communication for chat feature.
- **react-signature-canvas**: Digital signature capture widget.
- **cookie-signature**: Secure session cookie validation for WebSocket authentication.

## All Available Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | / | Role-specific overview with key metrics |
| Hospitals | /hospitals | Hospital management (Admin) |
| Projects | /projects | Project lifecycle management |
| Project Phases | /project-phases | 11-phase EHR methodology tracking |
| Consultants | /consultants | Consultant directory and profiles |
| Schedule | /schedule | Shift scheduling and assignments |
| Command Center | /command-center | Go-live operations dashboard |
| Onboarding | /onboarding | Consultant onboarding workflow |
| Timesheets | /timesheets | Time tracking and clock in/out |
| Availability | /availability | Consultant availability calendar |
| Shift Swaps | /shift-swaps | Shift swap requests |
| Training | /training | Course catalog and enrollment |
| Assessments | /assessments | Competency testing |
| Login Labs | /login-labs | EMR training sessions |
| Knowledge Base | /knowledge-base | Searchable articles |
| Support Tickets | /support-tickets | Ticket management |
| EOD Reports | /eod-reports | End-of-day reporting |
| Escalation Management | /escalation-management | Escalation rules (Admin) |
| Expenses | /expenses | Expense tracking and submission |
| Invoices | /invoices | Invoice management |
| Payroll | /payroll | Payroll processing (Admin) |
| Budget Modeling | /budget-modeling | Financial scenarios (Admin) |
| Travel Preferences | /travel-preferences | Personal travel settings |
| Travel Bookings | /travel-bookings | Trip booking management |
| Transportation | /transportation | Carpool/shuttle coordination |
| Quality Assurance | /quality-assurance | Scorecards, surveys, incidents |
| Gamification | /gamification | Points, badges, leaderboards |
| Compliance Center | /compliance-center | HIPAA compliance tracking |
| Contracts | /contracts | Digital signature workflows |
| Chat | /chat | Real-time messaging |
| Identity Verification | /identity-verification | Consultant verification |
| ROI Survey | /roi-survey | Hospital satisfaction survey |
| Analytics | /analytics | Platform analytics dashboard |
| Access Control | /access-control | Page permissions (Admin) |
| Activity Log | /activity-log | User activity audit (Admin) |
| Account | /account | Personal settings |