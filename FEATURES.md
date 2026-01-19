# NiceHR Features

**Document Version:** 1.0
**Last Updated:** January 19, 2026
**Status:** Production Ready

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Core Modules](#core-modules)
3. [CRM Module](#crm-module)
4. [TDR Module](#tdr-module-technical-dress-rehearsal)
5. [ESIGN Compliance](#esign-compliance)
6. [Remote Support](#remote-support)
7. [Change Management](#change-management)
8. [Executive Metrics](#executive-metrics)
9. [Financial Management](#financial-management)
10. [Additional Features](#additional-features)
11. [Feature Flags](#feature-flags)

---

## Platform Overview

NiceHR is a comprehensive EHR (Electronic Health Record) Implementation Consulting Management Platform. It provides end-to-end tools for healthcare IT consulting firms managing EHR implementations.

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Pages | 50+ |
| API Endpoints | 100+ |
| Database Tables | 40+ |
| E2E Tests | 2,135 |
| Test Pass Rate | 100% |

---

## Core Modules

### 1. Dashboard

**Route:** `/dashboard`

| Feature | Description |
|---------|-------------|
| Stats Cards | Active projects, consultants, pending tasks, support tickets |
| My Tasks | Personal task list with status tracking |
| Calendar View | Schedule overview with events |
| Recent Activities | Real-time activity feed |
| Quick Actions | Create ticket, add task, view reports |

### 2. Consultant Management

**Route:** `/consultants`

| Feature | Description |
|---------|-------------|
| Profiles | Full consultant profiles with photos |
| Skills Matrix | EHR expertise (Epic, Cerner, Meditech, etc.) |
| Certifications | Certification tracking with expiry alerts |
| Documents | Resume, background check, HIPAA training, W-9, NDA |
| Availability | Shift preferences, time-off tracking |
| Performance | Utilization rates, project history |

**Demo Data:** 12 consultants with 90+ documents

### 3. Hospital Management

**Route:** `/hospitals`

| Feature | Description |
|---------|-------------|
| Facility Profiles | Name, address, contact info |
| Healthcare Fields | EHR system, bed count, facility type |
| EHR Systems | Epic, Cerner, Meditech, Allscripts, etc. |
| Contacts | Key stakeholder directory |
| Project History | Past implementations |

**Fields:** 25+ hospital-specific fields

### 4. Project Management

**Route:** `/projects`, `/project-phases`

| Feature | Description |
|---------|-------------|
| Project Tracking | Name, status, dates, team assignment |
| Phases | Planning, Design, Build, Test, Deploy, Support |
| Tasks | Task creation, assignment, tracking |
| Milestones | Key deliverable tracking |
| Financial Fields | Budget, actual spend, variance |
| Documents | Project documentation library |

**Fields:** 30+ project financial fields

### 5. Support Tickets

**Route:** `/support-tickets`

| Feature | Description |
|---------|-------------|
| Ticket Creation | Title, description, priority, category |
| Assignment | Assign to consultants with "Assign to Me" |
| Status Workflow | Open → In Progress → Resolved → Closed |
| Tags | Categorization with add/remove |
| Comments | Threaded discussions |
| Attachments | File uploads |
| TDR Linking | Link tickets to TDR issues |

**API:** Full CRUD with React Query integration

### 6. Schedules & Calendar

**Route:** `/schedules`

| Feature | Description |
|---------|-------------|
| Calendar View | Monthly/weekly schedule display |
| Shift Types | Day, Night, Swing shifts |
| Assignment | Consultant-to-project scheduling |
| EOD Reports | End-of-day reporting |
| Shift Swaps | Request and approve shift changes |

### 7. Analytics & Reporting

**Route:** `/analytics`, `/report-builder`

| Feature | Description |
|---------|-------------|
| Dashboard Analytics | Visual KPI displays |
| Report Builder | Custom report creation |
| Saved Reports | Store and reuse report configs |
| Export | CSV, Excel, PDF export |
| Scheduling | Automated report delivery |
| Advanced Visualizations | Timeline, forecasting, cost variance |
| Hospital Staff Analytics | Role-based filtering |
| Consultant Analytics | Performance metrics |

---

## CRM Module

**Routes:** `/crm`, `/crm/contacts`, `/crm/companies`, `/crm/deals`

### CRM Dashboard

| Feature | Description |
|---------|-------------|
| Stats Cards | Total contacts, companies, open deals, won revenue |
| Pipeline Overview | Visual sales pipeline |
| Activity Feed | Recent CRM activities |
| Upcoming Activities | Scheduled tasks and meetings |

### Contacts

| Feature | Description |
|---------|-------------|
| Contact Types | Lead, Customer, Partner, Vendor |
| Fields | Name, email, phone, company, title |
| Lifecycle | Lead → Qualified → Customer tracking |
| Activities | Call, email, meeting, note logging |
| Tasks | Contact-specific task management |
| Search | Full-text search across contacts |
| Filters | Filter by type, company, status |

### Companies

| Feature | Description |
|---------|-------------|
| Healthcare Fields | EHR system, bed count, facility type |
| Company Types | Prospect, Customer, Partner, Vendor |
| Contacts | Associated contact list |
| Deals | Company deal tracking |
| Activities | Company interaction history |

### Deals

| Feature | Description |
|---------|-------------|
| Pipeline Stages | Lead → Qualified → Proposal → Negotiation → Closed |
| Views | Kanban board and list view |
| Deal Values | Amount, probability, expected close |
| Custom Pipelines | Create custom pipeline definitions |
| Won/Lost Tracking | Deal outcome analytics |

### CRM Activities

| Feature | Description |
|---------|-------------|
| Activity Types | Call, Email, Meeting, Note |
| Logging | Manual activity logging |
| Automation | Automatic tracking from actions |
| Timeline | Chronological activity view |

**E2E Tests:** 158 tests across 5 files

---

## TDR Module (Technical Dress Rehearsal)

**Route:** `/tdr`

### Overview

The TDR module prepares healthcare organizations for EHR go-live events through systematic readiness assessment.

### Features

| Feature | Description |
|---------|-------------|
| TDR Events | Schedule and manage dress rehearsal events |
| Issue Tracking | Log and track issues discovered during TDR |
| Checklists | Pre-go-live checklist management |
| Participants | Track TDR participant involvement |
| Ticket Integration | Create support tickets from TDR issues |

### Readiness Algorithm (Potentially Patentable)

**5-Domain Weighted Scoring:**

| Domain | Weight | Description |
|--------|--------|-------------|
| Technical | 30% | System configuration, interfaces, hardware |
| Data Migration | 20% | Data conversion, validation, mapping |
| Staff Training | 25% | User training completion, competency |
| Support Infrastructure | 15% | Help desk, escalation paths, on-site support |
| Process Documentation | 10% | Workflows, policies, procedures |

**Readiness Calculation:**
```
readinessScore = Σ(domainScore × weight) / Σ(weights)
```

**API Endpoints:**
- `GET/POST /api/tdr/events`
- `GET/POST /api/tdr/issues`
- `GET/POST /api/tdr/checklists`
- `GET /api/tdr/readiness/:projectId`

**E2E Tests:** 154 tests

---

## ESIGN Compliance

**Route:** Integrated into `/contracts`

### Overview

Full ESIGN Act and UETA compliant electronic signature implementation.

### 4-Step Signing Wizard

| Step | Description |
|------|-------------|
| 1. Consent | 3-checkbox consent flow (hardware/software, paper rights, withdrawal) |
| 2. Review | Document review with scroll tracking and duration logging |
| 3. Sign | Intent confirmation checkbox + typed name verification |
| 4. Certificate | SHA-256 document hash, unique certificate number |

### Technical Implementation

| Feature | Description |
|---------|-------------|
| SHA-256 Hashing | Tamper-evident document hash |
| Certificate Numbers | Format: NICEHR-YYYYMMDD-XXXXXX |
| IP Logging | Signer IP address capture |
| Timestamp | UTC timestamp for all actions |
| Audit Trail | Complete signing history |

### Database Tables

- `esign_consents` - Consent acknowledgments
- `esign_document_hashes` - SHA-256 records
- `esign_intent_confirmations` - Intent tracking
- `esign_review_tracking` - Review metrics
- `esign_certificates` - Signature certificates

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/esign/disclosure` | Get ESIGN disclosure text |
| `POST /api/contracts/:id/esign/consent` | Submit consent |
| `POST /api/contracts/:id/esign/review-start` | Track review start |
| `PATCH /api/contracts/:id/esign/review-progress` | Update scroll progress |
| `POST /api/contracts/:signerId/esign/sign` | Enhanced signing |
| `GET /api/contracts/:id/esign/verify` | Verify document integrity |
| `GET /api/contracts/:id/esign/certificate` | Get certificate |
| `GET /api/contracts/:id/esign/audit-trail` | Get audit trail |

**E2E Tests:** 52 tests

---

## Remote Support

**Route:** `/remote-support` (integrated), standalone at `localhost:5173`

### Overview

HIPAA-compliant video consultation system for remote EHR support.

### Features

| Feature | Description |
|---------|-------------|
| Video Calls | HD video conferencing |
| Audio Calls | Voice-only option |
| Screen Sharing | Share screen for troubleshooting |
| Queue Management | Real-time support queue |
| Smart Matching | Algorithm-based consultant assignment |
| Session Recording | Optional recording (HIPAA compliant) |

### Smart Consultant Matching Algorithm (Potentially Patentable)

**Multi-Factor Scoring:**

| Factor | Points | Description |
|--------|--------|-------------|
| Expertise Match | +30 | EHR system expertise match |
| Hospital Relationship | +50 | Previous work with hospital |
| Rating Bonus | +20 | High performer (4.5+ rating) |
| Rotation Penalty | -10/session | Recent session penalty |

**Calculation:**
```
score = expertiseMatch + relationshipBonus + ratingBonus - rotationPenalty
```

### Technical Stack

| Component | Technology |
|-----------|------------|
| Video Provider | Daily.co |
| Real-time | WebSocket |
| Backend | Express (port 3002) |
| Frontend | React (port 5173) |

**E2E Tests:** 725+ tests across 15 files

---

## Change Management

**Route:** `/change-management`

### Overview

ITIL-aligned change management for healthcare IT environments.

### Change Request Lifecycle

```
Draft → Submitted → CAB Review → Approved → Implementing → Completed
                         ↓
                      Rejected
```

### Features

| Feature | Description |
|---------|-------------|
| Change Requests | Create and manage change requests |
| Risk Assessment | Low, Medium, High, Critical ratings |
| Impact Assessment | Scope of change impact |
| CAB Reviews | Change Advisory Board review workflow |
| Implementation | Scheduling with start/end dates |
| Rollback Procedures | Document rollback plans |
| Post-Implementation Reviews | Success metrics tracking |

### Database Tables

- `change_requests` - Main change records
- `change_approvals` - CAB approval tracking
- `change_implementations` - Implementation records
- `change_rollbacks` - Rollback procedures
- `change_reviews` - Post-implementation reviews

**Feature Flag:** `ENABLE_CHANGE_MANAGEMENT`

**E2E Tests:** 71 tests

---

## Executive Metrics

**Route:** `/executive-metrics`, `/executive-dashboard`

### Overview

C-suite dashboards for high-level organizational insights.

### Features

| Feature | Description |
|---------|-------------|
| KPI Dashboard | Key performance indicators |
| Revenue Metrics | Revenue tracking and forecasting |
| Utilization Rates | Consultant utilization |
| Project Status | Portfolio health overview |
| Custom Metrics | Define custom KPIs |
| Drill-down | Click through to details |

### Dashboard Widgets

| Widget | Description |
|--------|-------------|
| Active Projects | Current project count and status |
| Consultant Utilization | Billable hours percentage |
| Revenue YTD | Year-to-date revenue |
| Pipeline Value | Total deal pipeline |
| Support Metrics | Ticket resolution rates |

**Feature Flag:** `ENABLE_EXECUTIVE_METRICS`

**E2E Tests:** 56 tests

---

## Financial Management

### Invoices

**Route:** `/invoices`

| Feature | Description |
|---------|-------------|
| Invoice Creation | Create invoices for projects |
| Line Items | Multiple line items per invoice |
| Status Tracking | Draft, Sent, Paid, Overdue |
| PDF Export | Generate invoice PDFs |
| Payment Recording | Track payments received |

### Expenses

**Route:** `/expenses`

| Feature | Description |
|---------|-------------|
| Expense Reports | Submit expense reports |
| Categories | Travel, meals, equipment, etc. |
| Receipts | Upload receipt images |
| Approval Workflow | Manager approval process |
| Reimbursement | Track reimbursement status |

### Timesheets

**Route:** `/timesheets`

| Feature | Description |
|---------|-------------|
| Time Entry | Log hours by project/task |
| Approval | Manager timesheet approval |
| Reports | Timesheet reports |
| Billing Integration | Link to invoicing |

### Payroll

**Route:** `/payroll`

| Feature | Description |
|---------|-------------|
| Pay Periods | Define pay periods |
| Calculations | Automatic pay calculations |
| Reports | Payroll reports |
| Export | Export to payroll systems |

---

## Additional Features

### Contracts

**Route:** `/contracts`

- Contract creation and management
- Template library
- E-signature integration (see ESIGN)
- Expiration alerts
- Version history

### Training

**Route:** `/training`

- Course management
- Assignment tracking
- Completion certificates
- HIPAA training tracking
- Compliance reporting

### Travel

**Route:** `/travel-bookings`, `/travel-preferences`

- Travel booking management
- Preference profiles
- Expense integration
- Itinerary management

### Documents

**Route:** `/documents`, `/my-documents`

- Document library
- Version control
- Access permissions
- Search functionality

### Chat

**Route:** `/chat`

- Internal messaging
- Team channels
- Direct messages
- File sharing

### Knowledge Base

**Route:** `/knowledge-base`

- Article management
- Search
- Categories
- FAQ section

### Compliance Center

**Route:** `/compliance-center`

- HIPAA compliance tracking
- Audit preparation
- Policy management
- Training compliance

---

## Feature Flags

Feature flags allow safe rollout of new features.

### Configuration

Located in `shared/featureFlags.ts`:

| Flag | Default | Description |
|------|---------|-------------|
| `ENABLE_TDR` | true | Technical Dress Rehearsal module |
| `ENABLE_CHANGE_MANAGEMENT` | true | Change Management module |
| `ENABLE_EXECUTIVE_METRICS` | true | Executive Metrics module |

### Usage

```typescript
import { isFeatureEnabled } from '@/shared/featureFlags';

if (isFeatureEnabled('ENABLE_TDR')) {
  // Show TDR features
}
```

---

## Summary

### Feature Count by Category

| Category | Features |
|----------|----------|
| Core Modules | 7 |
| CRM | 4 major features |
| TDR | 5 features + algorithm |
| ESIGN | 4-step wizard + 8 APIs |
| Remote Support | 6 features + algorithm |
| Change Management | 7 features |
| Executive Metrics | 6 widgets |
| Financial | 4 modules |
| Additional | 10+ features |

### Potentially Patentable Features

1. **TDR Readiness Algorithm** - Weighted 5-domain scoring system
2. **Smart Consultant Matching** - Multi-factor expertise matching
3. **ESIGN 4-Step Wizard** - Technical compliance implementation

See `PATENT_FEATURES_TECHNICAL.md` for detailed specifications.

---

*Last Updated: January 19, 2026*
