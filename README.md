# NiceHR

**EHR Implementation Consulting Management Platform**

[![Tests](https://img.shields.io/badge/tests-2135%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)]()
[![License](https://img.shields.io/badge/license-Proprietary-blue)]()
[![Node](https://img.shields.io/badge/node-20.x-green)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)]()

NiceHR is a comprehensive platform designed for healthcare IT consulting firms managing Electronic Health Record (EHR) implementations. It provides end-to-end tools for consultant management, project tracking, CRM, compliance, and more.

---

## Current Status (January 2026)

### Working Components

| Component | Status | Tests | Notes |
|-----------|--------|-------|-------|
| Dashboard | ✅ Live | 125 | Stats, tasks, calendar, activity feed |
| Analytics | ✅ Live | 100 | Reports, visualizations, forecasting |
| CRM | ✅ Live | 158 | Contacts, companies, deals, pipelines |
| TDR | ✅ Live | 154 | Go-live readiness assessment |
| Executive Metrics | ✅ Live | 56 | C-suite dashboards |
| Change Management | ✅ Live | 71 | ITIL-aligned workflows |
| Support Tickets | ✅ Live | 32 | Full ticketing system |
| Consultants | ✅ Live | 89 | Profile & document management |
| Hospitals | ✅ Live | 45 | Facility records |
| Projects | ✅ Live | 67 | Implementation tracking |
| Contracts | ✅ Live | 52 | ESIGN compliant signatures |
| Invoices | ✅ Live | 38 | Billing & payments |
| Schedules | ✅ Live | 42 | Calendar & EOD reports |
| Remote Support | ✅ Live | 725 | HIPAA video consultations |
| Timesheets | ✅ Live | 35 | Time tracking |
| Training | ✅ Live | 28 | Learning management |

### Recently Launched

- **Structured Logging** - JSON logging with correlation IDs for distributed tracing
- **Jest Testing** - Unit & integration tests (61 tests) alongside Cypress E2E
- **Drill-Down Functionality** - 55 interactive elements across dashboards
- **CRM Module** - Complete sales pipeline management
- **ESIGN Compliance** - 4-step wizard with SHA-256 hashing

### Integration Status

| System | Status | Notes |
|--------|--------|-------|
| ServiceNow | 📋 Planned | Manual import first |
| Asana | 📋 Planned | CSV export/import |
| SAP | 📋 Planned | Field mapping done |
| Jira | 📋 Planned | API integration |
| Epic | 🔴 Not Started | Need sandbox access |
| Cerner | 🔴 Not Started | Need sandbox access |

### Test Results

```
Cypress E2E: 2,135 tests (100% passing)
Jest Unit/Integration: 61 tests (100% passing)
Total: 2,196 tests
Last Run: 2026-01-31
```

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Central hub with stats, tasks, calendar, activity feed |
| **Consultants** | Profile management, certifications, documents, availability |
| **Hospitals** | Healthcare facility records with EHR-specific fields |
| **Projects** | EHR implementation tracking with phases and milestones |
| **Support Tickets** | Full ticketing system with assignment and workflows |
| **Schedules** | Calendar management, shifts, EOD reports |

### Advanced Modules

| Module | Description |
|--------|-------------|
| **CRM** | Contacts, companies, deals, pipelines for sales management |
| **TDR** | Technical Dress Rehearsal for go-live readiness |
| **ESIGN** | ESIGN Act compliant electronic signatures |
| **Remote Support** | HIPAA-compliant video consultations |
| **Change Management** | ITIL-aligned change control workflows |
| **Executive Metrics** | C-suite dashboards and KPIs |

### Financial & Analytics

| Module | Description |
|--------|-------------|
| **Invoices** | Invoice creation, tracking, payments |
| **Expenses** | Expense reporting and approval |
| **Timesheets** | Time tracking and approval |
| **Analytics** | Custom reports, visualizations, forecasting |

See [FEATURES.md](docs/development/FEATURES.md) for complete feature documentation.

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **TailwindCSS 3** - Styling
- **shadcn/ui** - Component library
- **React Query 5** - Server state management
- **Wouter** - Routing
- **Recharts** - Data visualization

### Backend
- **Node.js 20 LTS** - Runtime
- **Express.js 4** - Web framework
- **TypeScript 5** - Type safety
- **Drizzle ORM** - Database ORM
- **WebSocket (ws)** - Real-time communication

### Database
- **PostgreSQL** - Primary database
- **Drizzle Kit** - Migrations

### Testing
- **Cypress** - E2E testing (2,135 tests)
- **Jest** - Unit/integration testing

### Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Google Cloud Storage** - File storage
- **SendGrid** - Email (HIPAA compliant)
- **Daily.co** - Video conferencing

---

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14+ or Neon database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mdxvision/nicehr.git
cd nicehr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
npm run db:push

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Demo Login

In development mode, the app uses a mock user:
- **Email:** dev@nicehr.local
- **Role:** admin

---

## Development Setup

### Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database
createdb nicehr

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/nicehr
```

**Option B: Neon (Cloud PostgreSQL)**
1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `.env`

### Running the App

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start

# Run on specific port
PORT=4000 npm run dev
```

### Seeding Demo Data

```bash
# Via npm script
npm run seed

# Or via API (server must be running)
curl -X POST http://localhost:5000/api/admin/seed-demo-data
```

---

## Running Tests

### Cypress E2E Tests

```bash
# Run all tests (headless)
CYPRESS_TEST=true npx cypress run

# Open Cypress UI
CYPRESS_TEST=true npx cypress open

# Run specific test file
CYPRESS_TEST=true npx cypress run --spec "cypress/e2e/01-dashboard.cy.js"
```

### Test Statistics

| Metric | Value |
|--------|-------|
| Total Tests | 2,135 |
| Test Files | 47 |
| Pass Rate | 100% |
| Run Time | ~17 minutes |

See [TEST_PLAN.md](docs/development/TEST_PLAN.md) for detailed test coverage.

---

## Project Structure

```
nicehr/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities
│       └── pages/          # Page components
│
├── server/                 # Express backend
│   ├── routes/             # API route modules
│   ├── scheduling/         # Scheduling algorithms
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # Main routes
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
│
├── shared/                 # Shared code
│   ├── schema.ts           # Drizzle ORM schema
│   └── featureFlags.ts     # Feature flags
│
├── remote-support/         # Standalone video support
│   ├── client/             # React app (port 5173)
│   └── server/             # Express API (port 3002)
│
├── cypress/                # E2E tests
│   ├── e2e/                # Test files
│   └── support/            # Custom commands
│
└── docs/                   # Additional documentation
```

See [ARCHITECTURE.md](docs/development/ARCHITECTURE.md) for detailed architecture documentation.

---

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database (required)
DATABASE_URL=postgresql://user:password@host:5432/nicehr

# Authentication
SESSION_SECRET=your-256-bit-secret
REPLIT_DOMAINS=yourdomain.com

# Email (HIPAA compliant)
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@yourdomain.com

# File Storage
GCS_BUCKET_NAME=nicehr-files
GCS_CREDENTIALS={"type":"service_account",...}

# Video Conferencing (Remote Support)
DAILY_API_KEY=xxx
DAILY_DOMAIN=yourdomain.daily.co

# Feature Flags
ENABLE_TDR=true
ENABLE_CHANGE_MANAGEMENT=true
ENABLE_EXECUTIVE_METRICS=true
```

See [DEPLOYMENT_REQUIREMENTS.md](docs/development/DEPLOYMENT_REQUIREMENTS.md) for production configuration.

---

## API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production:  https://yourdomain.com/api
```

### Authentication

All API endpoints require authentication via session cookie.

### Key Endpoints

| Category | Endpoints |
|----------|-----------|
| Dashboard | `GET /api/dashboard/stats`, `/tasks`, `/calendar-events` |
| Consultants | `GET/POST /api/consultants`, `GET/PATCH/DELETE /:id` |
| Hospitals | `GET/POST /api/hospitals`, `GET/PATCH/DELETE /:id` |
| Projects | `GET/POST /api/projects`, `GET/PATCH/DELETE /:id` |
| CRM | `/api/crm/contacts`, `/companies`, `/deals`, `/dashboard` |
| TDR | `/api/tdr/events`, `/issues`, `/checklists`, `/readiness` |
| Support | `GET/POST /api/support-tickets`, `PATCH/DELETE /:id` |

See [API.md](docs/development/API.md) for complete API reference.

---

## Deployment

### Docker

```bash
# Build image
docker build -t nicehr .

# Run container
docker run -p 5000:5000 --env-file .env nicehr
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production Checklist

1. Set up HIPAA-compliant hosting (AWS, GCP, Azure with BAA)
2. Configure PostgreSQL with encryption at rest
3. Set up SendGrid with HIPAA BAA
4. Configure SSL/TLS certificates
5. Set secure session secrets
6. Enable audit logging

See [DEPLOYMENT.md](docs/development/DEPLOYMENT.md) for detailed instructions.

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - project overview |
| [docs/](docs/README.md) | Full documentation index |
| [ARCHITECTURE.md](docs/development/ARCHITECTURE.md) | System architecture and diagrams |
| [FEATURES.md](docs/development/FEATURES.md) | Complete feature documentation |
| [API.md](docs/development/API.md) | API reference |
| [DEPLOYMENT.md](docs/development/DEPLOYMENT.md) | Deployment guide |
| [TEST_PLAN.md](docs/development/TEST_PLAN.md) | Test coverage plan |
| [SECURITY.md](SECURITY.md) | Security policy |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`CYPRESS_TEST=true npx cypress run`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

This software is proprietary and confidential. See [LICENSE](LICENSE) for details.

**Copyright (c) 2025-2026 NiceHR. All rights reserved.**

---

## Support

For support inquiries:
- **Email:** support@nicehr.com
- **Documentation:** See `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/mdxvision/nicehr/issues)

---

Built with care for healthcare IT professionals.
