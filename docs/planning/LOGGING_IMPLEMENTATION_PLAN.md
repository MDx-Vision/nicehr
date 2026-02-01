# NiceHR Logging & Organization Implementation Plan

> Based on MDx-Vision Enterprise patterns (Paul's implementation)

---

## Overview

This plan implements structured logging, observability, and GitHub organization patterns from MDx-Vision Enterprise into NiceHR.

**Reference Implementation:**
- MDx-Vision Issue #90: Structured Logging with Correlation IDs
- MDx-Vision Milestone Structure (M0-M7)
- MDx-Vision Documentation Organization

---

## Phase 1: Structured Logging with Correlation IDs

### 1.1 Current State (NiceHR)

```typescript
// server/activityLogger.ts - Current implementation
export async function logActivity(
  userId: string,
  params: ActivityLogParams,
  req?: Request
): Promise<void> {
  // Logs to database only
  // No correlation IDs
  // No structured JSON output
  // No distributed tracing
}
```

### 1.2 Target State (Like MDx-Vision)

```typescript
// New: server/structuredLogger.ts
interface StructuredLog {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  correlation_id: string;
  request_id: string;
  session_id: string | null;
  user_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
}
```

### 1.3 Files to Create

| File | Purpose |
|------|---------|
| `server/structuredLogger.ts` | Core structured logging module |
| `server/middleware/correlationId.ts` | Request correlation ID middleware |
| `server/middleware/requestLogger.ts` | Request/response logging middleware |
| `server/utils/logContext.ts` | Async context propagation |

### 1.4 Implementation Details

#### A. Correlation ID Middleware

```typescript
// server/middleware/correlationId.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

// Async context for correlation ID propagation
export const logContext = new AsyncLocalStorage<LogContext>();

interface LogContext {
  correlationId: string;
  requestId: string;
  sessionId: string | null;
  userId: string | null;
  startTime: number;
}

// Header priority (like MDx-Vision)
const CORRELATION_HEADERS = [
  'x-correlation-id',
  'x-request-id',
  'x-b3-traceid',  // Spring Cloud Sleuth compatibility
];

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract or generate correlation ID
  let correlationId: string | undefined;

  for (const header of CORRELATION_HEADERS) {
    correlationId = req.headers[header] as string;
    if (correlationId) break;
  }

  if (!correlationId) {
    correlationId = uuidv4();
  }

  const requestId = uuidv4();
  const user = req.user as { claims?: { sub?: string } } | undefined;

  const context: LogContext = {
    correlationId,
    requestId,
    sessionId: req.sessionID || null,
    userId: user?.claims?.sub || null,
    startTime: Date.now(),
  };

  // Set response headers for downstream tracing
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', requestId);

  // Run request in async context
  logContext.run(context, () => next());
}
```

#### B. Structured Logger

```typescript
// server/structuredLogger.ts
import { logContext } from './middleware/correlationId';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlation_id: string;
  request_id: string;
  session_id: string | null;
  user_id: string | null;
  resource_type?: string;
  resource_id?: string;
  duration_ms?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

class StructuredLogger {
  private serviceName = 'nicehr-api';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'INFO';

  private levelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.logLevel];
  }

  private getContext(): Partial<LogEntry> {
    const ctx = logContext.getStore();
    return {
      correlation_id: ctx?.correlationId || 'no-context',
      request_id: ctx?.requestId || 'no-context',
      session_id: ctx?.sessionId || null,
      user_id: ctx?.userId || null,
    };
  }

  private formatLog(level: LogLevel, message: string, extra?: Partial<LogEntry>): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.getContext(),
      ...extra,
    };

    return JSON.stringify(entry);
  }

  debug(message: string, extra?: Partial<LogEntry>) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatLog('DEBUG', message, extra));
    }
  }

  info(message: string, extra?: Partial<LogEntry>) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatLog('INFO', message, extra));
    }
  }

  warn(message: string, extra?: Partial<LogEntry>) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatLog('WARN', message, extra));
    }
  }

  error(message: string, error?: Error, extra?: Partial<LogEntry>) {
    if (this.shouldLog('ERROR')) {
      const errorInfo = error ? {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      } : {};
      console.error(this.formatLog('ERROR', message, { ...errorInfo, ...extra }));
    }
  }

  // Activity logging (replaces current activityLogger for structured output)
  activity(
    activityType: string,
    params: {
      resourceType?: string;
      resourceId?: string;
      resourceName?: string;
      description?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    this.info(`Activity: ${activityType}`, {
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      metadata: {
        resource_name: params.resourceName,
        description: params.description,
        ...params.metadata,
      },
    });
  }
}

export const logger = new StructuredLogger();
```

#### C. Request Logger Middleware

```typescript
// server/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../structuredLogger';
import { logContext } from './correlationId';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const ctx = logContext.getStore();
  const startTime = ctx?.startTime || Date.now();

  // Log request
  logger.info(`${req.method} ${req.path}`, {
    metadata: {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    },
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;

    logger.info(`Response ${res.statusCode}`, {
      duration_ms: duration,
      metadata: {
        status_code: res.statusCode,
        method: req.method,
        path: req.path,
      },
    });

    return originalSend.call(this, body);
  };

  next();
}
```

### 1.5 Integration into Express App

```typescript
// server/index.ts - Add to existing setup
import { correlationIdMiddleware } from './middleware/correlationId';
import { requestLoggerMiddleware } from './middleware/requestLogger';

// Add BEFORE other middleware
app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);
```

### 1.6 Example Output

```json
{
  "timestamp": "2026-01-31T10:15:30.123Z",
  "level": "INFO",
  "message": "POST /api/support-tickets",
  "correlation_id": "abc-123-def-456",
  "request_id": "req-789",
  "session_id": "sess-012",
  "user_id": "user-345",
  "metadata": {
    "method": "POST",
    "path": "/api/support-tickets",
    "ip": "192.168.1.1"
  }
}

{
  "timestamp": "2026-01-31T10:15:30.245Z",
  "level": "INFO",
  "message": "Activity: create",
  "correlation_id": "abc-123-def-456",
  "request_id": "req-789",
  "session_id": "sess-012",
  "user_id": "user-345",
  "resource_type": "support_ticket",
  "resource_id": "ticket-678",
  "metadata": {
    "resource_name": "Login Issue",
    "description": "Created new support ticket"
  }
}

{
  "timestamp": "2026-01-31T10:15:30.250Z",
  "level": "INFO",
  "message": "Response 201",
  "correlation_id": "abc-123-def-456",
  "request_id": "req-789",
  "session_id": "sess-012",
  "user_id": "user-345",
  "duration_ms": 127,
  "metadata": {
    "status_code": 201,
    "method": "POST",
    "path": "/api/support-tickets"
  }
}
```

---

## Phase 2: GitHub Organization (Like MDx-Vision)

### 2.1 Milestones to Create

| Milestone | Description | Due Date |
|-----------|-------------|----------|
| **M0: Demo Stability** | Critical fixes for reliable demo | Feb 15, 2026 |
| **M1: Developer Velocity** | Code cleanup, refactoring, maintainability | Mar 15, 2026 |
| **M2: Shared Components** | Reusable infrastructure, API improvements | Apr 15, 2026 |
| **M3: Legacy Integration v1** | ServiceNow, Asana manual import | May 15, 2026 |
| **M4: Analytics Enhancement** | Advanced reporting, executive dashboards | Jun 15, 2026 |
| **M5: EHR Market Expansion** | Epic/Cerner API connections | Aug 15, 2026 |
| **M6: Platform & Scale** | Observability, performance, testing | Ongoing |
| **M7: Future Platform (R&D)** | Research & experimental features | No due date |

### 2.2 Labels to Create

| Category | Labels |
|----------|--------|
| **Type** | `Feature`, `Bug`, `Enhancement`, `Documentation` |
| **Priority** | `P0-Critical`, `P1-High`, `P2-Medium`, `P3-Low` |
| **Module** | `Dashboard`, `CRM`, `TDR`, `Executive`, `Analytics`, `Remote-Support` |
| **Technical** | `API`, `Database`, `Frontend`, `Backend`, `Security` |
| **Status** | `Observability`, `Integration`, `Testing`, `Performance` |
| **Tier** | `Tier-1`, `Tier-2`, `Tier-3` (complexity) |

### 2.3 Issue Template

```markdown
<!-- .github/ISSUE_TEMPLATE/feature.md -->
---
name: Feature Request
about: Propose a new feature
labels: Feature
---

## Problem Statement
<!-- What problem does this solve? -->

## Proposed Solution
<!-- How should it work? -->

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
<!-- Implementation hints, affected files -->

## Files to Modify
- `path/to/file1.ts`
- `path/to/file2.tsx`

## Testing
- [ ] Unit tests
- [ ] E2E tests
- [ ] Manual verification
```

---

## Phase 3: README Status Tracking (Like MDx-Vision)

### 3.1 Add Current Status Section to README

```markdown
## Current Status (January 2026)

### Working Components (18)
| Component | Status | Tests |
|-----------|--------|-------|
| Dashboard | ✅ Live | 125 |
| Analytics | ✅ Live | 100 |
| CRM | ✅ Live | 158 |
| TDR | ✅ Live | 154 |
| Executive Metrics | ✅ Live | 56 |
| Change Management | ✅ Live | 71 |
| Support Tickets | ✅ Live | 32 |
| ... | ... | ... |

### Recently Launched (NEW)
- **Drill-Down Functionality** - 55 interactive elements across dashboards
- **CRM Module** - Contacts, companies, deals, pipeline management
- **ESIGN Compliance** - 4-step wizard with SHA-256 hashing
- **Change Management** - ITIL-aligned workflow

### Integration Status
| System | Status | Notes |
|--------|--------|-------|
| ServiceNow | 📋 Planned | Manual import first |
| Asana | 📋 Planned | CSV export/import |
| SAP | 📋 Planned | Field mapping done |
| Epic | 🔴 Not Started | Need sandbox access |

### Test Results
```
Total: 2,135 tests
Passing: 2,135 (100%)
Duration: 17m 35s
Last Run: 2026-01-31
```
```

---

## Phase 4: Documentation Reorganization

### 4.1 New Structure (Like MDx-Vision)

```
/docs
├── /business
│   ├── COMPETITIVE_ANALYSIS.md
│   ├── INVESTOR.md
│   ├── ONE_SHEET.md
│   ├── PRICING.md
│   ├── SALES_MATERIALS.md
│   └── STRATEGIC_ROADMAP.md
├── /development
│   ├── API_REFERENCE.md (rename from API.md)
│   ├── ARCHITECTURE.md (move from root)
│   ├── FEATURES.md (move from root)
│   ├── SETUP.md (new)
│   ├── TESTING.md (new)
│   └── MANUAL_TESTING_CHECKLIST.md
├── /planning
│   ├── CONVERSATIONS.md (move from CONVERSATION.md)
│   ├── ARCHITECTURE_DECISIONS.md (new)
│   └── LEGACY_SYSTEMS_MAPPING.md (already exists)
├── /ehr
│   ├── EPIC_INTEGRATION.md
│   ├── CERNER_INTEGRATION.md
│   └── MARKET_ANALYSIS.md
└── /archived
    └── (old session files)
```

### 4.2 Files to Move

| Current Location | New Location |
|------------------|--------------|
| `/ARCHITECTURE.md` | `/docs/development/ARCHITECTURE.md` |
| `/FEATURES.md` | `/docs/development/FEATURES.md` |
| `/API.md` | `/docs/development/API_REFERENCE.md` |
| `/CONVERSATION.md` | `/docs/planning/CONVERSATIONS.md` |
| `/SECURITY.md` | Keep in root (standard) |
| `/CHANGELOG.md` | Keep in root (standard) |
| `/CONTRIBUTING.md` | Keep in root (standard) |

---

## Phase 5: Release Notes (Like MDx-Vision)

### 5.1 Create RELEASE_NOTES.md

```markdown
# Release Notes

## 2026-01-31

### Summary
Structured logging implementation with correlation IDs

### Changes
- Added `server/structuredLogger.ts` - JSON structured logging
- Added `server/middleware/correlationId.ts` - Request correlation
- Added `server/middleware/requestLogger.ts` - Request/response logging
- Updated `server/index.ts` - Middleware integration

### Test Results
**API Server (Jest)**
```
npm run test:server
✓ 45 passed, 0 failed
```

**E2E Tests (Cypress)**
```
CYPRESS_TEST=true npx cypress run
✓ 2,135 passed, 0 failed
Duration: 17m 35s
```

### Known Issues
- None

---

## 2026-01-19

### Summary
Drill-down functionality and CRM module release

### Changes
- Phase 1-3 drill-downs (55 interactive elements)
- Complete CRM module (158 tests)
- ESIGN compliance implementation

### Test Results
```
✓ 2,135 passed, 0 failed
```
```

---

## Phase 6: Jest Test Coverage Expansion

### 6.1 Current State

| Category | Tests | Coverage |
|----------|-------|----------|
| structuredLogger | 15 | Logging, correlation IDs, context |
| tdrReadiness | 27 | 5-domain weighted algorithm |
| API endpoints | 8 | Basic health, dashboard, tickets |
| Correlation middleware | 11 | Header extraction, UUID generation |
| **Total** | **61** | **~5% of backend** |

### 6.2 Target State

| Category | Estimated Tests | Priority |
|----------|-----------------|----------|
| API route handlers | 200+ | P0 |
| Storage methods | 100+ | P0 |
| Middleware (auth, validation) | 50+ | P1 |
| Business logic utilities | 50+ | P1 |
| Error handling | 30+ | P2 |
| **Total** | **430+** | |

### 6.3 Files to Add Tests For

#### P0 - Critical (API Routes)
| File | Description | Est. Tests |
|------|-------------|------------|
| `server/routes.ts` | All 640+ API endpoints | 150+ |
| `server/routes/crm.ts` | CRM endpoints | 30+ |
| `server/routes/esign.ts` | ESIGN compliance | 20+ |
| `server/routes/changeManagement.ts` | Change management | 20+ |

#### P0 - Critical (Storage)
| File | Description | Est. Tests |
|------|-------------|------------|
| `server/storage.ts` | Database operations | 80+ |
| `server/seedDemoData.ts` | Seed data validation | 20+ |

#### P1 - High (Middleware & Utils)
| File | Description | Est. Tests |
|------|-------------|------------|
| `server/auth.ts` | Authentication | 25+ |
| `server/activityLogger.ts` | Activity logging | 15+ |
| `server/emailService.ts` | Email service | 10+ |
| `server/objectStorage.ts` | File storage | 10+ |

#### P2 - Medium (Business Logic)
| File | Description | Est. Tests |
|------|-------------|------------|
| Consultant matching | Smart matching algorithm | 20+ |
| Invoice calculations | Billing logic | 15+ |
| Schedule validation | Scheduling rules | 15+ |

### 6.4 Test File Structure

```
/server
├── routes.test.ts              # API route tests
├── storage.test.ts             # Storage method tests
├── auth.test.ts                # Auth middleware tests
├── /routes
│   ├── crm.test.ts
│   ├── esign.test.ts
│   └── changeManagement.test.ts
├── /utils
│   ├── tdrReadiness.test.ts    ✅ (exists)
│   ├── invoiceCalc.test.ts
│   └── scheduling.test.ts

/tests
├── setup.ts                    ✅ (exists)
├── /integration
│   ├── api.integration.test.ts ✅ (exists)
│   ├── correlationId.integration.test.ts ✅ (exists)
│   ├── auth.integration.test.ts
│   ├── crm.integration.test.ts
│   └── storage.integration.test.ts
```

### 6.5 Implementation Order

1. **Week 1**: API route handlers (most critical path)
2. **Week 2**: Storage methods (database operations)
3. **Week 3**: Middleware (auth, validation, error handling)
4. **Week 4**: Business logic utilities

---

## Implementation Checklist

### Phase 1: Structured Logging
- [ ] Create `server/structuredLogger.ts`
- [ ] Create `server/middleware/correlationId.ts`
- [ ] Create `server/middleware/requestLogger.ts`
- [ ] Create `server/utils/logContext.ts`
- [ ] Update `server/index.ts` with middleware
- [ ] Update `activityLogger.ts` to use structured logger
- [ ] Add `LOG_LEVEL` to `.env.example`
- [ ] Test correlation ID propagation
- [ ] Verify JSON output format

### Phase 2: GitHub Organization
- [ ] Create 8 milestones (M0-M7)
- [ ] Create label taxonomy
- [ ] Add issue templates
- [ ] Migrate existing issues (if any)
- [ ] Document in CONTRIBUTING.md

### Phase 3: README Enhancement
- [ ] Add Current Status section
- [ ] Add Recently Launched section
- [ ] Add Integration Status table
- [ ] Add Test Results summary
- [ ] Update on each release

### Phase 4: Documentation Reorganization
- [ ] Create `/docs/business/`
- [ ] Create `/docs/development/`
- [ ] Create `/docs/planning/`
- [ ] Create `/docs/ehr/`
- [ ] Create `/docs/archived/`
- [ ] Move files to new locations
- [ ] Update all internal links

### Phase 5: Release Notes
- [ ] Create `RELEASE_NOTES.md`
- [ ] Document current release
- [ ] Add release process to CONTRIBUTING.md
- [ ] Update on each deployment

### Phase 6: Jest Test Coverage Expansion
- [x] Set up Jest with TypeScript (ts-jest)
- [x] Create unit tests for structuredLogger (15 tests)
- [x] Create unit tests for tdrReadiness (27 tests)
- [x] Create integration tests for API endpoints (8 tests)
- [x] Create integration tests for correlationId middleware (11 tests)
- [ ] Add tests for API route handlers (`server/routes.ts`)
- [ ] Add tests for CRM routes (`server/routes/crm.ts`)
- [ ] Add tests for ESIGN routes (`server/routes/esign.ts`)
- [ ] Add tests for Change Management routes
- [ ] Add tests for storage methods (`server/storage.ts`)
- [ ] Add tests for auth middleware (`server/auth.ts`)
- [ ] Add tests for email service
- [ ] Add tests for object storage
- [ ] Add tests for business logic utilities
- [ ] Achieve 80%+ backend code coverage

---

## Environment Variables

Add to `.env.example`:

```bash
# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
# Log level: DEBUG, INFO, WARN, ERROR (default: INFO)
LOG_LEVEL="INFO"

# Enable JSON structured logging (default: true in production)
STRUCTURED_LOGGING="true"
```

---

## Estimated Effort

| Phase | Effort | Priority | Status |
|-------|--------|----------|--------|
| Phase 1: Structured Logging | 4-6 hours | P0 | ✅ Complete |
| Phase 2: GitHub Organization | 2-3 hours | P1 | ⬜ Not Started |
| Phase 3: README Enhancement | 1-2 hours | P1 | ⬜ Not Started |
| Phase 4: Documentation Reorg | 2-3 hours | P2 | ⬜ Not Started |
| Phase 5: Release Notes | 1 hour | P2 | ⬜ Not Started |
| Phase 6: Jest Test Coverage | 15-20 hours | P0 | 🔄 In Progress (61/430+ tests) |

**Total: 27-37 hours**

---

## Success Criteria

1. **Logging**
   - All requests have correlation IDs
   - Logs are JSON formatted
   - Context propagates through async calls
   - Activity logs include correlation IDs

2. **GitHub**
   - All issues assigned to milestones
   - Labels applied consistently
   - Issue templates in use

3. **Documentation**
   - README shows current status
   - Docs organized by category
   - Release notes updated per deploy

4. **Testing (Phase 6)**
   - 80%+ backend code coverage
   - All API routes have integration tests
   - All storage methods have unit tests
   - CI runs tests on every PR

---

*Created: 2026-01-31*
*Based on: MDx-Vision Enterprise (Issue #90, Milestone structure)*
