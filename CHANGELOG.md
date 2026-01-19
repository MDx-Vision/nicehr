# Changelog

All notable changes to NiceHR are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Documentation gap analysis and new documentation files

---

## [1.0.0] - 2026-01-19

### Added

#### CRM Module
- Complete CRM dashboard with stats cards and pipeline overview
- Contact management (leads, customers, partners, vendors)
- Company management with healthcare-specific fields (EHR system, bed count, facility type)
- Deal tracking with kanban and list views
- Custom pipeline definitions and stages
- Activity logging (calls, emails, meetings, notes)
- CRM task management
- 158 E2E tests for CRM functionality

#### ESIGN Compliance
- ESIGN Act and UETA compliant electronic signatures
- 4-step signing wizard (Consent → Review → Sign → Certificate)
- 3-checkbox consent flow
- Document review tracking with scroll detection
- Intent confirmation with typed name verification
- SHA-256 document hashing for tamper evidence
- Unique certificate numbers (NICEHR-YYYYMMDD-XXXXXX)
- Complete audit trail
- 8 new API endpoints for e-signature workflow

#### Documentation
- ARCHITECTURE.md - System architecture documentation
- FEATURES.md - Complete feature inventory
- API.md - API reference documentation
- SECURITY.md - Security policy
- LICENSE - Proprietary license
- CONTRIBUTING.md - Contribution guidelines
- README.md - Project overview and quick start
- PATENT_RESEARCH.md - Patent process research
- PATENT_FEATURES_TECHNICAL.md - Technical specifications for patent

### Changed
- Updated test count to 2,135 tests (100% passing)
- Enhanced Contracts page with 4-step signing wizard

### Fixed
- CRM deals empty state display in list view
- CRM pipeline tests with correct dashboard mocking
- CRM activities tests with accurate UI assertions

---

## [0.9.0] - 2026-01-18

### Added

#### Change Management Module
- ITIL-aligned change management workflows
- Change request lifecycle (Draft → Submitted → CAB Review → Approved → Implementing → Completed)
- Risk and impact assessment (Low/Medium/High/Critical)
- CAB (Change Advisory Board) review process
- Implementation scheduling with start/end dates
- Rollback procedures documentation
- Post-implementation reviews with success metrics
- Feature flag: `ENABLE_CHANGE_MANAGEMENT`
- 71 E2E tests

#### Seed Data Expansion
- Contracts seed data (5 records)
- Travel Bookings seed data (5 records)
- Schedules seed data (5 records)
- EOD Reports seed data (4 records)
- Invoices seed data (4 records)
- Invoice Line Items seed data (7 records)

### Fixed
- 37 failing TDR tests (now 154/154 passing)
- 18 failing Executive Metrics tests (now 56/56 passing)
- Missing data-testid attributes
- Scroll-lock and timing issues in tests

---

## [0.8.0] - 2026-01-17

### Added

#### TDR-Tickets Integration
- Bi-directional linking between TDR Issues and Support Tickets
- Create support ticket from TDR issue
- TDR filtering and context display in Support Tickets page
- TDR issue reference in ticket details

---

## [0.7.0] - 2026-01-16

### Added

#### TDR (Technical Dress Rehearsal) Module
- TDR event scheduling and management
- Issue tracking with severity levels
- Checklist management for go-live preparation
- Participant tracking
- 5-domain weighted readiness algorithm:
  - Technical (30%)
  - Data Migration (20%)
  - Staff Training (25%)
  - Support Infrastructure (15%)
  - Process Documentation (10%)
- Feature flag: `ENABLE_TDR`

#### Executive Success Metrics Module
- KPI tracking dashboard
- Revenue metrics and forecasting
- Consultant utilization rates
- Project status overview
- Custom metric definitions
- Feature flag: `ENABLE_EXECUTIVE_METRICS`

### Changed
- Added ~235 E2E tests for TDR and Executive Metrics

---

## [0.6.0] - 2026-01-10

### Added

#### Remote Support Test Coverage
- Comprehensive E2E test suite for remote-support module
- 15 test files covering 725+ test scenarios
- P0 (critical), P1 (core), P2 (advanced) test categories
- Mock mode for Daily.co (testing without API credentials)
- Custom Cypress commands for all API operations

---

## [0.5.0] - 2026-01-05

### Added

#### Test Coverage Expansion
- 846 new tests across 14 test files
- Remote Support WebSocket tests
- HIPAA Session Security tests
- Authorization Edge Cases tests
- API Error Handling tests
- Advanced Analytics tests
- Intelligent Scheduling tests
- Database Integrity tests
- Automation Workflows tests
- EHR Monitoring tests
- File Operations tests
- Gamification tests
- Untested Pages tests
- Integrations tests
- Performance tests

### Fixed
- 13 failing tests to achieve 100% pass rate
- Session secret security
- Query validation
- UUID generation

### Changed
- Total tests doubled from 846 to 1,692

---

## [0.4.0] - 2025-12-29

### Added

#### Analytics Enhancements
- Hospital Staff Analytics view with role-based filtering
- Consultant Analytics view with performance metrics
- Report Builder with saved reports
- Custom report creation
- Export functionality (CSV, Excel, PDF)
- Report scheduling
- Timeline & Forecasting visualizations
- Cost Variance Analytics
- Go-Live Readiness Dashboard

#### Support Tickets (Database Connected)
- Full CRUD API endpoints
- React Query integration
- Assignee selector with "Assign to Me"
- Tags section with add/remove
- 32 E2E tests

#### Schedules (Database Connected)
- General schedule API endpoints
- React Query integration
- Calendar view with database schedules
- EOD Reports integration

#### Contracts & Digital Signatures
- E-Sign feature with SignatureCanvas
- Pending signatures tab
- Digital signature capture and storage
- 52 signature tests

#### Code Cleanup
- Removed 23 legacy placeholder test files
- Fixed all skipped/pending tests

---

## [0.3.0] - 2025-12-28

### Added

#### Consultant Documents & Shift Preferences
- 90+ demo documents for all 12 consultants
- Document types: Resume, certifications, background checks, HIPAA training, W-9, NDA
- Shift preferences (day/night/swing) for all consultants

#### Dashboard Enhancements
- All 6 stat cards clickable with navigation
- 10 demo project tasks for My Tasks widget
- 10 demo user activities for Recent Activities feed

#### Hospital & Project Expansions
- 25+ fields added to hospitals
- 30+ financial fields added to projects
- "View More" modals for both

#### Performance Metrics
- Ticket resolution rate
- Project completion rate
- Consultant utilization from timesheets
- Total hours logged tracking

---

## [0.2.0] - 2025-12-26

### Added

#### Remote Support Integration
- Standalone video support system
- White-labeled video/audio/screen sharing (HIPAA compliant)
- Smart consultant matching based on expertise and relationships
- Real-time queue with WebSocket updates
- Integrated into main NiceHR via `/remote-support` route
- 10 integration tests

#### Deployment Ready
- Docker multi-stage build with Dockerfile
- Docker Compose configuration
- GitHub Actions CI/CD pipeline
- Comprehensive deployment guide

---

## [0.1.0] - 2025-12-15

### Added

#### Core Platform
- Dashboard with stats, tasks, calendar, activities
- Consultant management with profiles and documents
- Hospital management with EHR-specific fields
- Project management with phases and tasks
- Support ticket system
- Schedule management
- Invoice management
- Expense tracking
- Timesheet management
- Contract management
- Training module
- Travel booking
- Chat functionality
- Document management
- Knowledge base
- Compliance center

#### Technical Foundation
- React + TypeScript + Vite frontend
- Express.js + TypeScript backend
- PostgreSQL with Drizzle ORM
- Cypress E2E testing framework
- Role-based access control
- Audit logging

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.0.0 | 2026-01-19 | CRM Module, ESIGN Compliance, Documentation |
| 0.9.0 | 2026-01-18 | Change Management, Seed Data |
| 0.8.0 | 2026-01-17 | TDR-Tickets Integration |
| 0.7.0 | 2026-01-16 | TDR Module, Executive Metrics |
| 0.6.0 | 2026-01-10 | Remote Support Tests |
| 0.5.0 | 2026-01-05 | Test Coverage Expansion |
| 0.4.0 | 2025-12-29 | Analytics, Support Tickets, Schedules |
| 0.3.0 | 2025-12-28 | Documents, Dashboard, Hospital/Project Fields |
| 0.2.0 | 2025-12-26 | Remote Support, Docker |
| 0.1.0 | 2025-12-15 | Initial Release |

---

*For detailed feature documentation, see [FEATURES.md](FEATURES.md)*
