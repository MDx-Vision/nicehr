# NiceHR System Architecture

**Document Version:** 1.0
**Last Updated:** January 19, 2026
**Purpose:** Technical architecture documentation for NiceHR EHR Implementation Consulting Platform

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [System Architecture Diagram](#4-system-architecture-diagram)
5. [Data Flow](#5-data-flow)
6. [Database Architecture](#6-database-architecture)
7. [API Architecture](#7-api-architecture)
8. [Module Breakdown](#8-module-breakdown)
9. [Security Architecture](#9-security-architecture)
10. [Integration Points](#10-integration-points)
11. [Deployment Architecture](#11-deployment-architecture)

---

## 1. System Overview

NiceHR is an EHR (Electronic Health Record) Implementation Consulting Management Platform designed for healthcare IT consulting firms. It provides end-to-end management of consultants, projects, hospitals, and the entire EHR implementation lifecycle.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| **Consultant Management** | Profiles, documents, certifications, availability tracking |
| **Project Management** | EHR implementations, phases, tasks, milestones |
| **Hospital/Client Management** | Healthcare facility records with EHR-specific fields |
| **CRM** | Contact, company, deal, and pipeline management |
| **TDR (Technical Dress Rehearsal)** | Go-live readiness assessment and tracking |
| **Remote Support** | HIPAA-compliant video consultations |
| **Contracts & E-Signatures** | ESIGN Act compliant digital signatures |
| **Financial Management** | Invoicing, expenses, payroll, timesheets |
| **Analytics & Reporting** | Executive dashboards, custom reports |

---

## 2. Technology Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 5.x |
| TailwindCSS | Styling | 3.x |
| shadcn/ui | Component Library | Latest |
| React Query | Server State Management | 5.x |
| Wouter | Routing | 3.x |
| Recharts | Data Visualization | 2.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 20.x LTS |
| Express.js | Web Framework | 4.x |
| TypeScript | Type Safety | 5.x |
| Drizzle ORM | Database ORM | Latest |
| WebSocket (ws) | Real-time Communication | 8.x |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| Drizzle Kit | Migrations |

### Testing

| Technology | Purpose |
|------------|---------|
| Cypress | E2E Testing |
| Jest | Unit/Integration Testing |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| Google Cloud Storage | File Storage (Production) |
| SendGrid | Email Service (HIPAA) |
| Daily.co | Video Conferencing |

---

## 3. Directory Structure

```
nicehr/
├── client/                    # Frontend React Application
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── ui/           # shadcn/ui base components
│       │   └── ...           # Feature-specific components
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Utilities and API helpers
│       ├── pages/            # Page components (routes)
│       │   ├── CRM/          # CRM module pages
│       │   ├── TDR/          # TDR module pages
│       │   ├── ChangeManagement/
│       │   └── ExecutiveMetrics/
│       ├── App.tsx           # Main app with routing
│       └── main.tsx          # Entry point
│
├── server/                    # Backend Express Application
│   ├── routes/               # Modular API routes
│   │   ├── crm.ts           # CRM endpoints
│   │   ├── tdr.ts           # TDR endpoints
│   │   ├── esign.ts         # E-signature endpoints
│   │   ├── changeManagement.ts
│   │   └── executiveMetrics.ts
│   ├── scheduling/           # Scheduling algorithms
│   ├── utils/               # Server utilities
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # Main routes (legacy, large)
│   ├── storage.ts           # Database operations
│   ├── db.ts                # Database connection
│   ├── websocket.ts         # WebSocket handlers
│   ├── emailService.ts      # Email integration
│   ├── objectStorage.ts     # File storage
│   ├── accessControl.ts     # RBAC implementation
│   ├── auditLog.ts          # Audit logging
│   └── seedDemoData.ts      # Demo data seeding
│
├── shared/                    # Shared Code (Client & Server)
│   ├── schema.ts            # Drizzle ORM schema (all tables)
│   └── featureFlags.ts      # Feature flag definitions
│
├── remote-support/           # Standalone Remote Support Module
│   ├── client/              # React frontend (port 5173)
│   └── server/              # Express backend (port 3002)
│       └── src/
│           └── services/
│               ├── daily.ts      # Daily.co integration
│               ├── matching.ts   # Smart consultant matching
│               └── websocket.ts  # Real-time updates
│
├── cypress/                   # E2E Test Suite
│   ├── e2e/                 # 47 test files
│   ├── support/             # Custom commands
│   └── fixtures/            # Test data
│
├── migrations/               # Database migrations
├── docs/                     # Additional documentation
└── .github/                  # GitHub Actions CI/CD
```

---

## 4. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   Web Browser   │  │  Mobile Browser │  │   Remote Support │            │
│  │   (React SPA)   │  │   (Responsive)  │  │   Client (:5173) │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                    │                       │
└───────────┼────────────────────┼────────────────────┼───────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────┐  ┌──────────────────────┐   │
│  │         Main API Server (:4000)          │  │  Remote Support API  │   │
│  │                                          │  │      (:3002)         │   │
│  │  ┌────────────┐  ┌────────────────────┐ │  │                      │   │
│  │  │   REST     │  │     WebSocket      │ │  │  ┌────────────────┐  │   │
│  │  │   API      │  │   (Real-time)      │ │  │  │  Daily.co API  │  │   │
│  │  └────────────┘  └────────────────────┘ │  │  └────────────────┘  │   │
│  │                                          │  │                      │   │
│  │  ┌─────────────────────────────────────┐│  │  ┌────────────────┐  │   │
│  │  │         Route Modules               ││  │  │  Smart Match   │  │   │
│  │  │  /crm  /tdr  /esign  /metrics      ││  │  │  Algorithm     │  │   │
│  │  └─────────────────────────────────────┘│  │  └────────────────┘  │   │
│  └──────────────────────────────────────────┘  └──────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
            │                                            │
            ▼                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │    Storage    │  │   Email       │  │    Audit      │  │   Access    │ │
│  │   (storage.ts)│  │  (SendGrid)   │  │    Logging    │  │   Control   │ │
│  └───────────────┘  └───────────────┘  └───────────────┘  └─────────────┘ │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │  Object Store │  │  Scheduling   │  │   Feature     │                   │
│  │    (GCS)      │  │  Algorithms   │  │    Flags      │                   │
│  └───────────────┘  └───────────────┘  └───────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        PostgreSQL Database                            │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │    Users    │  │ Consultants │  │  Hospitals  │  │  Projects   │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │  Contracts  │  │   Invoices  │  │   Support   │  │  Timesheets │ │  │
│  │  └─────────────┘  └─────────────┘  │   Tickets   │  └─────────────┘ │  │
│  │                                    └─────────────┘                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │  CRM Tables │  │ TDR Tables  │  │   ESIGN     │  │   Change    │ │  │
│  │  │  (7 tables) │  │ (5 tables)  │  │   Tables    │  │  Management │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow

### Request Lifecycle

```
┌────────┐    ┌──────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐
│ Client │───▶│  Router  │───▶│ Middleware │───▶│ Handler │───▶│ Storage  │
└────────┘    └──────────┘    └────────────┘    └─────────┘    └──────────┘
     │                              │                │               │
     │                              │                │               │
     │        ┌────────────────────┐│                │               │
     │        │ • Auth Check       ││                │               │
     │        │ • RBAC Validation  ││                │               │
     │        │ • Request Logging  │◀               │               │
     │        │ • Rate Limiting    │                │               │
     │        └────────────────────┘                │               │
     │                                              │               │
     │                              ┌───────────────┴───────────────┘
     │                              │
     │                              ▼
     │                    ┌──────────────────┐
     │                    │    PostgreSQL    │
     │                    │  (via Drizzle)   │
     │                    └──────────────────┘
     │                              │
     ◀──────────────────────────────┘
           JSON Response
```

### Real-time Updates (WebSocket)

```
┌──────────────────────────────────────────────────────────────────┐
│                     WebSocket Flow                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client A                Server                    Client B      │
│     │                      │                          │          │
│     │──── Subscribe ──────▶│                          │          │
│     │                      │◀──── Subscribe ─────────│          │
│     │                      │                          │          │
│     │                      │                          │          │
│     │──── Update Data ────▶│                          │          │
│     │                      │                          │          │
│     │                      │──── Broadcast ──────────▶│          │
│     │◀─── Broadcast ───────│                          │          │
│     │                      │                          │          │
│                                                                  │
│  Events: ticket_update, schedule_change, activity_created,      │
│          consultant_status, support_queue_update                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Database Architecture

### Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Core Entities                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌───────────┐         ┌───────────────┐         ┌───────────────┐       │
│    │   Users   │────────▶│  Consultants  │◀───────▶│   Projects    │       │
│    └───────────┘         └───────────────┘         └───────────────┘       │
│         │                      │                         │                  │
│         │                      │                         │                  │
│         ▼                      ▼                         ▼                  │
│    ┌───────────┐         ┌───────────────┐         ┌───────────────┐       │
│    │ Activities│         │   Timesheets  │         │   Hospitals   │       │
│    └───────────┘         └───────────────┘         └───────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        CRM Module                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐           │
│    │  CRM_Contacts │────▶│ CRM_Companies │◀────│   CRM_Deals   │           │
│    └───────────────┘     └───────────────┘     └───────────────┘           │
│           │                     │                     │                     │
│           ▼                     ▼                     ▼                     │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐           │
│    │CRM_Activities │     │  CRM_Tasks    │     │CRM_Pipelines  │           │
│    └───────────────┘     └───────────────┘     └───────────────┘           │
│                                                       │                     │
│                                                       ▼                     │
│                                               ┌───────────────┐             │
│                                               │Pipeline_Stages│             │
│                                               └───────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        TDR Module                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐           │
│    │  TDR_Events   │────▶│  TDR_Issues   │◀────│  TDR_Checkls  │           │
│    └───────────────┘     └───────────────┘     └───────────────┘           │
│           │                                                                 │
│           ▼                                                                 │
│    ┌───────────────┐     ┌───────────────┐                                 │
│    │TDR_Readiness  │     │TDR_Participants│                                │
│    └───────────────┘     └───────────────┘                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ESIGN Module                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐           │
│    │   Contracts   │────▶│ESIGN_Consents │     │ESIGN_Hashes   │           │
│    └───────────────┘     └───────────────┘     └───────────────┘           │
│           │                                                                 │
│           ▼                                                                 │
│    ┌───────────────┐     ┌───────────────┐     ┌───────────────┐           │
│    │ ESIGN_Intent  │     │ESIGN_Review   │     │ESIGN_Certs    │           │
│    └───────────────┘     └───────────────┘     └───────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Table Summary

| Category | Tables | Description |
|----------|--------|-------------|
| Core | users, consultants, hospitals, projects | Primary entities |
| CRM | crm_contacts, crm_companies, crm_deals, crm_activities, crm_tasks, crm_pipelines, crm_pipeline_stages | Customer relationship management |
| TDR | tdr_events, tdr_issues, tdr_checklists, tdr_readiness, tdr_participants | Go-live preparation |
| ESIGN | esign_consents, esign_document_hashes, esign_intent_confirmations, esign_review_tracking, esign_certificates | E-signature compliance |
| Change Mgmt | change_requests, change_approvals, change_implementations, change_rollbacks, change_reviews | ITIL change management |
| Financial | invoices, invoice_line_items, expenses, timesheets, payroll | Financial tracking |
| Support | support_tickets, ticket_comments, ticket_attachments | Support system |
| Scheduling | schedules, eod_reports, shift_swaps | Time management |

---

## 7. API Architecture

### RESTful Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Structure                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Base URL: /api                                                             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ HTTP Method │ Endpoint              │ Action                        │   │
│  ├─────────────┼───────────────────────┼───────────────────────────────┤   │
│  │ GET         │ /resource             │ List all                      │   │
│  │ POST        │ /resource             │ Create new                    │   │
│  │ GET         │ /resource/:id         │ Get one                       │   │
│  │ PATCH       │ /resource/:id         │ Update                        │   │
│  │ DELETE      │ /resource/:id         │ Delete                        │   │
│  └─────────────┴───────────────────────┴───────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Endpoint Categories

| Category | Base Path | Description |
|----------|-----------|-------------|
| Dashboard | `/api/dashboard/*` | Stats, tasks, calendar |
| Consultants | `/api/consultants/*` | Consultant management |
| Hospitals | `/api/hospitals/*` | Hospital records |
| Projects | `/api/projects/*` | Project management |
| CRM | `/api/crm/*` | CRM operations |
| TDR | `/api/tdr/*` | Technical dress rehearsal |
| ESIGN | `/api/esign/*`, `/api/contracts/:id/esign/*` | E-signatures |
| Support | `/api/support-tickets/*` | Support tickets |
| Financial | `/api/invoices/*`, `/api/expenses/*` | Financial |
| Schedules | `/api/schedules/*`, `/api/eod-reports/*` | Scheduling |
| Admin | `/api/admin/*` | Admin functions |

### Authentication Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
│ Client  │────▶│   /login    │────▶│   Validate   │────▶│   Issue   │
│         │     │             │     │  Credentials │     │   Token   │
└─────────┘     └─────────────┘     └──────────────┘     └───────────┘
                                                               │
                                                               ▼
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
│ Client  │◀────│  Response   │◀────│   Session    │◀────│  Store in │
│         │     │  + Cookie   │     │   Created    │     │    DB     │
└─────────┘     └─────────────┘     └──────────────┘     └───────────┘

Subsequent Requests:
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
│ Client  │────▶│  API Call   │────▶│   Validate   │────▶│  Process  │
│ +Cookie │     │             │     │   Session    │     │  Request  │
└─────────┘     └─────────────┘     └──────────────┘     └───────────┘
```

---

## 8. Module Breakdown

### Core Modules

#### 8.1 Dashboard Module
- **Purpose:** Central hub for user activity
- **Features:** Stats cards, task list, calendar, activity feed
- **Files:** `Dashboard.tsx`, `/api/dashboard/*`

#### 8.2 Consultant Management
- **Purpose:** Manage consultant profiles and documents
- **Features:** Profiles, certifications, documents, availability
- **Files:** `Consultants.tsx`, `/api/consultants/*`

#### 8.3 Hospital Management
- **Purpose:** Healthcare facility records
- **Features:** EHR system tracking, bed counts, facility types
- **Files:** `Hospitals.tsx`, `/api/hospitals/*`

#### 8.4 Project Management
- **Purpose:** EHR implementation project tracking
- **Features:** Phases, tasks, milestones, financial tracking
- **Files:** `Projects.tsx`, `ProjectPhases.tsx`, `/api/projects/*`

### Feature Modules

#### 8.5 CRM Module
- **Purpose:** Customer relationship management
- **Components:**
  - Contacts (leads, customers, partners, vendors)
  - Companies (with healthcare fields)
  - Deals (kanban/list views)
  - Pipelines (customizable stages)
- **Files:** `CRM/*.tsx`, `server/routes/crm.ts`

#### 8.6 TDR Module (Technical Dress Rehearsal)
- **Purpose:** Go-live readiness assessment
- **Features:**
  - Event scheduling
  - Issue tracking (linked to support tickets)
  - Checklists
  - **Weighted Readiness Algorithm:**
    - Technical (30%)
    - Data Migration (20%)
    - Staff Training (25%)
    - Support Infrastructure (15%)
    - Process Documentation (10%)
- **Files:** `TDR/*.tsx`, `server/routes/tdr.ts`

#### 8.7 ESIGN Module
- **Purpose:** ESIGN Act compliant electronic signatures
- **4-Step Wizard:**
  1. Consent (3 checkboxes)
  2. Document Review (scroll tracking)
  3. Sign (intent confirmation + typed name)
  4. Certificate (SHA-256 hash)
- **Files:** `Contracts.tsx`, `server/routes/esign.ts`

#### 8.8 Remote Support Module
- **Purpose:** HIPAA-compliant video consultations
- **Features:**
  - Video/audio/screen sharing (Daily.co)
  - Smart consultant matching algorithm
  - Real-time queue with WebSocket
- **Standalone:** Runs on ports 3002/5173
- **Files:** `remote-support/*`

#### 8.9 Change Management Module
- **Purpose:** ITIL-aligned change control
- **Features:**
  - Change request lifecycle
  - CAB (Change Advisory Board) reviews
  - Risk/impact assessment
  - Rollback procedures
- **Files:** `ChangeManagement/*.tsx`, `server/routes/changeManagement.ts`

#### 8.10 Executive Metrics Module
- **Purpose:** C-suite dashboards
- **Features:**
  - KPI tracking
  - Revenue metrics
  - Utilization rates
  - Project status overview
- **Files:** `ExecutiveMetrics/*.tsx`, `server/routes/executiveMetrics.ts`

---

## 9. Security Architecture

### HIPAA Compliance Measures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Security Layers                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                    Application Security                            │     │
│  │  • Session timeout (15 min inactivity)                            │     │
│  │  • RBAC (Role-Based Access Control)                               │     │
│  │  • Input validation & sanitization                                │     │
│  │  • SQL injection prevention (Drizzle ORM)                         │     │
│  │  • XSS protection (React auto-escaping)                           │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                    Data Security                                   │     │
│  │  • TLS/HTTPS in production                                        │     │
│  │  • Encryption at rest (database)                                  │     │
│  │  • SHA-256 document hashing (ESIGN)                              │     │
│  │  • Secure file storage (GCS with ACLs)                           │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                    Audit & Compliance                              │     │
│  │  • Comprehensive audit logging                                    │     │
│  │  • Activity tracking                                              │     │
│  │  • Access logs                                                    │     │
│  │  • Change history                                                 │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### RBAC Model

| Role | Permissions |
|------|-------------|
| admin | Full access to all features |
| manager | Project/team management, reporting |
| consultant | Own profile, timesheets, assigned projects |
| client | Limited view of assigned projects |
| viewer | Read-only access |

### Access Control Implementation

```typescript
// server/accessControl.ts
interface AccessRule {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  roles: string[];
}
```

---

## 10. Integration Points

### External Services

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     External Integrations                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │    Daily.co     │     │    SendGrid     │     │   Google Cloud  │       │
│  │  (Video Calls)  │     │     (Email)     │     │    Storage      │       │
│  │                 │     │                 │     │                 │       │
│  │ • Video rooms   │     │ • HIPAA BAA     │     │ • File uploads  │       │
│  │ • Screen share  │     │ • Templates     │     │ • Documents     │       │
│  │ • Recording     │     │ • Tracking      │     │ • Signatures    │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│  │   PostgreSQL    │     │    Calendar     │     │    Payment      │       │
│  │   (Neon/RDS)    │     │  Integration    │     │   Processing    │       │
│  │                 │     │                 │     │                 │       │
│  │ • Primary DB    │     │ • Google Cal    │     │ • Stripe        │       │
│  │ • Connection    │     │ • Outlook       │     │ • Invoicing     │       │
│  │   pooling       │     │ • iCal          │     │                 │       │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Integration Configuration

| Service | Environment Variable | Purpose |
|---------|---------------------|---------|
| Daily.co | `DAILY_API_KEY`, `DAILY_DOMAIN` | Video conferencing |
| SendGrid | `SENDGRID_API_KEY` | Email delivery |
| GCS | `GCS_BUCKET_NAME`, `GCS_CREDENTIALS` | File storage |
| PostgreSQL | `DATABASE_URL` | Database connection |

---

## 11. Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Production Deployment                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                        Load Balancer                               │     │
│  │                      (HTTPS Termination)                           │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                │                                            │
│                                ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                      Container Orchestration                       │     │
│  │                    (Docker / Kubernetes)                           │     │
│  │                                                                    │     │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │     │
│  │   │  App Pod 1  │  │  App Pod 2  │  │  App Pod N  │              │     │
│  │   │  (NiceHR)   │  │  (NiceHR)   │  │  (NiceHR)   │              │     │
│  │   └─────────────┘  └─────────────┘  └─────────────┘              │     │
│  │                                                                    │     │
│  │   ┌─────────────────────────────────────────────────────────┐    │     │
│  │   │              Remote Support Service                      │    │     │
│  │   │              (Separate Deployment)                       │    │     │
│  │   └─────────────────────────────────────────────────────────┘    │     │
│  │                                                                    │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                │                                            │
│                                ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │                     Managed Services                               │     │
│  │                                                                    │     │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │     │
│  │   │ PostgreSQL  │  │   Google    │  │  SendGrid   │              │     │
│  │   │ (Neon/RDS)  │  │   Cloud     │  │   Email     │              │     │
│  │   │             │  │   Storage   │  │             │              │     │
│  │   └─────────────┘  └─────────────┘  └─────────────┘              │     │
│  │                                                                    │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───▶│  Build  │───▶│  Test   │───▶│  Stage  │───▶│ Deploy  │
│  Code   │    │  Image  │    │ (2135)  │    │ Review  │    │  Prod   │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │              │              │              │
                    ▼              ▼              ▼              ▼
               Dockerfile     Cypress       Preview URL    Production
                              E2E Tests                      URL
```

### Environment Variables Summary

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/nicehr

# Authentication
SESSION_SECRET=<random-256-bit>
REPLIT_DOMAINS=yourdomain.com

# Email (HIPAA)
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@yourdomain.com

# File Storage
GCS_BUCKET_NAME=nicehr-files
GCS_CREDENTIALS=<service-account-json>

# Video (Remote Support)
DAILY_API_KEY=xxx
DAILY_DOMAIN=yourdomain.daily.co

# Feature Flags
ENABLE_TDR=true
ENABLE_CHANGE_MANAGEMENT=true
ENABLE_EXECUTIVE_METRICS=true
```

---

## Appendix

### A. Test Coverage Summary

| Category | Tests | Status |
|----------|-------|--------|
| Total E2E Tests | 2,135 | 100% Pass |
| Test Files | 47 | - |
| Run Time | ~17 min | - |

### B. Related Documentation

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | AI context and feature overview |
| `DEPLOYMENT.md` | Deployment instructions |
| `DEPLOYMENT_REQUIREMENTS.md` | Infrastructure requirements |
| `TEST_PLAN.md` | Test coverage plan |
| `PATENT_RESEARCH.md` | Patent process research |
| `PATENT_FEATURES_TECHNICAL.md` | Technical patent specs |

### C. Key Code References

| File | Lines | Purpose |
|------|-------|---------|
| `shared/schema.ts` | ~330K | Complete database schema |
| `server/routes.ts` | ~470K | Main API routes |
| `server/storage.ts` | ~494K | Database operations |
| `server/seedDemoData.ts` | ~185K | Demo data |

---

*Last Updated: January 19, 2026*
