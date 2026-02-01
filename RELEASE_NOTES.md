# Release Notes

## 2026-01-31

### Summary
Structured logging implementation with correlation IDs, Jest testing framework, and documentation reorganization.

### Changes

**Structured Logging (Phase 1)**
- Added `server/structuredLogger.ts` - JSON structured logging with log levels
- Added `server/middleware/correlationId.ts` - Request correlation ID propagation
- Added `server/middleware/requestLogger.ts` - Request/response logging
- Updated `server/index.ts` - Middleware integration
- Updated `server/activityLogger.ts` - Integrated with structured logger

**Jest Testing Framework**
- Added Jest with ts-jest for TypeScript support
- Created `jest.config.cjs` - Jest configuration with unit/integration projects
- Created `tsconfig.jest.json` - TypeScript config for Jest
- Added unit tests for structuredLogger (15 tests)
- Added unit tests for TDR readiness algorithm (27 tests)
- Added integration tests for API endpoints (8 tests)
- Added integration tests for correlationId middleware (11 tests)

**GitHub Organization (Phase 2)**
- Created 8 milestones (M0-M7)
- Created 22 labels (Type, Priority, Module, Technical, Status, Tier)
- Added 3 issue templates (Feature, Bug, Enhancement)

**README Enhancement (Phase 3)**
- Added Current Status section with component table
- Added Recently Launched features
- Added Integration Status table
- Added Test Results summary

**Documentation Reorganization (Phase 4)**
- Created `docs/` directory structure
- Moved development docs to `docs/development/`
- Moved planning docs to `docs/planning/`
- Moved business docs to `docs/business/`
- Moved archived docs to `docs/archived/`
- Created `docs/README.md` index

### Test Results

**Jest Unit/Integration**
```
Test Suites: 4 passed, 4 total
Tests:       61 passed, 61 total
Time:        0.293s
```

**Cypress E2E**
```
Test Suites: 47 passed
Tests:       2,135 passed
Duration:    17m 35s
```

### Files Changed
- 15 files created
- 8 files modified
- 22 files moved

### Known Issues
- None

---

## 2026-01-19

### Summary
Drill-down functionality and CRM module complete implementation.

### Changes

**Drill-Down Functionality (Phases 1-3)**
- Phase 1: 12 dashboard stat card drill-downs
- Phase 2: 25 gauge, analytics, executive dashboard drill-downs
- Phase 3: 18 executive metrics, ROI dashboard drill-downs
- Total: 55 interactive drill-down elements

**CRM Module**
- CRM Dashboard with pipeline view and statistics
- Contacts management (leads, customers, partners, vendors)
- Companies management with healthcare fields
- Deals/opportunities with kanban and list views
- Activity logging and task management
- 158 E2E tests

**ESIGN Compliance**
- 4-step signing wizard (Consent → Review → Sign → Complete)
- SHA-256 document hashing
- Signature certificates with unique IDs
- Complete audit trail

### Test Results
```
Total: 2,135 tests
Passing: 2,135 (100%)
Duration: 17m 35s
```

---

## 2026-01-17

### Summary
Change Management module and TDR/Executive Metrics fixes.

### Changes

**Change Management Module**
- ITIL-aligned change request lifecycle
- CAB (Change Advisory Board) reviews
- Risk and impact assessment
- Implementation scheduling
- Post-implementation reviews
- 71 E2E tests

**TDR & Executive Metrics Fixes**
- Fixed 37 failing TDR tests (154/154 passing)
- Fixed 18 failing Executive Metrics tests (56/56 passing)
- Added missing data-testid attributes
- Fixed scroll-lock and timing issues

**Comprehensive Seed Data**
- Contracts (5 records)
- Travel Bookings (5 records)
- Schedules (5 records)
- EOD Reports (4 records)
- Invoices (4 records)
- Invoice Line Items (7 records)

### Test Results
```
Total: 1,973 tests
Passing: 1,973 (100%)
```

---

## 2026-01-16

### Summary
TDR and Executive Metrics module implementation.

### Changes

**Technical Dress Rehearsal (TDR) Module**
- Go-live readiness assessment
- 5-domain weighted scoring algorithm
- Issue tracking with priority levels
- Checklist management
- 154 E2E tests

**Executive Success Metrics Module**
- C-suite dashboards
- KPI tracking and visualization
- Summary cards with drill-downs
- 56 E2E tests

### Test Results
```
~235 new tests added
```

---

## Previous Releases

See [CHANGELOG.md](CHANGELOG.md) for complete version history.

---

*Release notes are updated with each deployment.*
