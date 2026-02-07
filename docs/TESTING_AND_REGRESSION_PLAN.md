# NiceHR Testing & Regression Plan

> **Living Document** - Last Updated: February 7, 2026
>
> This document defines the comprehensive testing strategy to ensure system stability when implementing new features or upgrading existing ones.

---

## Executive Summary

**Current State:**
- Unit Tests: 286 tests (6% code coverage)
- E2E Tests: 55 files (~2,135 tests)
- Load Tests: None
- Integration Tests: 4 files

**Target State:**
- Unit Tests: 80%+ code coverage
- E2E Tests: Full feature coverage
- Load Tests: All critical paths
- Integration Tests: All external systems
- Automated regression on every PR

---

## 1. Testing Pyramid

```
                    ┌─────────────┐
                    │   Manual    │  ← Exploratory, UAT
                   ─┴─────────────┴─
                  ┌─────────────────┐
                  │   E2E Tests     │  ← 55 files, ~2,135 tests
                 ─┴─────────────────┴─
                ┌───────────────────────┐
                │  Integration Tests    │  ← 4 files (need more)
               ─┴───────────────────────┴─
              ┌─────────────────────────────┐
              │       Unit Tests            │  ← 286 tests (need 1000+)
             ─┴─────────────────────────────┴─
            ┌─────────────────────────────────────┐
            │         Static Analysis             │  ← TypeScript, ESLint
           ─┴─────────────────────────────────────┴─
```

---

## 2. Unit Test Coverage Plan

### Current Coverage (9 test files, 286 tests)

| File | Tests | Coverage |
|------|-------|----------|
| `accessControl.test.ts` | 45 | RBAC |
| `auditLog.test.ts` | 32 | Audit logging |
| `structuredLogger.test.ts` | 28 | Logging |
| `hipaaAuditLogger.test.ts` | 25 | HIPAA compliance |
| `tdrReadiness.test.ts` | 35 | TDR algorithm |
| `constraintChecker.test.ts` | 20 | Scheduling |
| `correlationId.test.ts` | 15 | Request tracing |
| `schema.validation.test.ts` | 42 | Schema validation |
| `aiAssistant.test.ts` | 44 | AI Assistant |

### Required New Unit Tests

#### Priority 1: Core Business Logic (Week 1-2)

| File | Lines | Tests Needed | Priority |
|------|-------|--------------|----------|
| `server/storage.ts` | 12,630 | ~300 | P0 |
| `server/routes.ts` | 13,234 | ~400 | P0 |

**storage.ts test categories:**
- [ ] CRUD operations for all 40+ tables
- [ ] Query builders and filters
- [ ] Relationship handling (joins)
- [ ] Transaction handling
- [ ] Error handling and edge cases
- [ ] Data validation

**routes.ts test categories:**
- [ ] All GET endpoints (list, single item)
- [ ] All POST endpoints (validation, creation)
- [ ] All PATCH endpoints (partial updates)
- [ ] All DELETE endpoints (soft/hard delete)
- [ ] Authentication middleware
- [ ] Authorization checks
- [ ] Input validation
- [ ] Error responses

#### Priority 2: Module Routes (Week 3-4)

| File | Lines | Tests Needed | Priority |
|------|-------|--------------|----------|
| `routes/tdr.ts` | 967 | ~80 | P1 |
| `routes/esign.ts` | 800 | ~70 | P1 |
| `routes/crm.ts` | 746 | ~60 | P1 |
| `routes/legacyIntegration.ts` | 762 | ~60 | P1 |
| `routes/executiveMetrics.ts` | 670 | ~50 | P1 |
| `routes/onboarding.ts` | 553 | ~45 | P1 |
| `routes/changeManagement.ts` | 457 | ~40 | P1 |
| `routes/localAuth.ts` | 113 | ~20 | P2 |

#### Priority 3: Utilities and Services (Week 5)

| File | Tests Needed | Priority |
|------|--------------|----------|
| `emailService.ts` | 25 | P2 |
| `objectStorage.ts` | 30 | P2 |
| `websocket.ts` | 20 | P2 |
| `activityLogger.ts` | 15 | P2 |

### Unit Test Template

```typescript
/**
 * Unit Tests for [Module Name]
 */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('../db', () => ({ db: mockDb }));

describe('[Module Name]', () => {
  beforeEach(() => {
    // Reset mocks
  });

  describe('[Function/Endpoint Name]', () => {
    test('should [expected behavior] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });

    test('should handle error when [error condition]', () => {
      // Test error handling
    });

    test('should validate [input type]', () => {
      // Test input validation
    });
  });
});
```

---

## 3. E2E Test Coverage Plan

### Current Coverage (55 files, ~2,135 tests)

| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| Authentication | 2 | 36 | ✅ |
| Dashboard | 4 | 150 | ✅ |
| Consultants | 2 | 95 | ✅ |
| Hospitals | 2 | 52 | ✅ |
| Projects | 3 | 85 | ✅ |
| Financial | 4 | 120 | ✅ |
| Communication | 2 | 65 | ✅ |
| Support Tickets | 2 | 64 | ✅ |
| Schedules | 2 | 70 | ✅ |
| CRM | 5 | 158 | ✅ |
| TDR | 1 | 154 | ✅ |
| Executive Metrics | 1 | 56 | ✅ |
| Change Management | 1 | 71 | ✅ |
| Integrations | 5 | 98 | ✅ |
| Drill-Down | 3 | 63 | ✅ |
| Advanced | 14 | ~800 | ✅ |

### Required New E2E Tests

| Feature | File | Tests Needed |
|---------|------|--------------|
| AI Assistant | `57-ai-assistant.cy.js` | 30 |
| Fieldglass SOW | `58-fieldglass-sow.cy.js` | 25 |
| Enterprise Overview | `59-enterprise-overview.cy.js` | 20 |

### E2E Test Structure

```javascript
// cypress/e2e/57-ai-assistant.cy.js

describe('AI Assistant Feature', () => {
  beforeEach(() => {
    cy.login('admin');
  });

  describe('Floating Widget', () => {
    it('should display chat button for admin', () => {});
    it('should display chat button for hospital_leadership', () => {});
    it('should NOT display for consultant role', () => {});
    it('should open chat panel on click', () => {});
    it('should close panel on X click', () => {});
  });

  describe('Query Interface', () => {
    it('should show example queries on empty state', () => {});
    it('should send query on submit', () => {});
    it('should display loading state', () => {});
    it('should display response with sources', () => {});
  });

  describe('Role-Based Responses', () => {
    it('admin should see SOW data for Fieldglass queries', () => {});
    it('executive should see workforce data for Fieldglass queries', () => {});
  });
});
```

---

## 4. Integration Test Plan

### Current Integration Tests

| File | Focus | Tests |
|------|-------|-------|
| `api.integration.test.ts` | API endpoints | 30 |
| `auth.test.ts` | Authentication | 25 |
| `correlationId.integration.test.ts` | Request tracing | 15 |
| `hospitals.test.ts` | Hospital CRUD | 20 |

### Required Integration Tests

| System | File | Tests Needed | Priority |
|--------|------|--------------|----------|
| Database | `database.integration.test.ts` | 50 | P0 |
| Email Service | `email.integration.test.ts` | 20 | P1 |
| File Storage | `storage.integration.test.ts` | 25 | P1 |
| WebSocket | `websocket.integration.test.ts` | 30 | P1 |
| External APIs | `externalApis.integration.test.ts` | 40 | P2 |

---

## 5. Load Test Plan

### Tools
- **Artillery** - Load testing framework
- **k6** - Alternative for complex scenarios

### Critical Paths to Load Test

| Endpoint | Target RPS | Latency p95 | Priority |
|----------|------------|-------------|----------|
| `GET /api/dashboard/stats` | 100 | <200ms | P0 |
| `GET /api/consultants` | 50 | <300ms | P0 |
| `GET /api/projects` | 50 | <300ms | P0 |
| `GET /api/support-tickets` | 75 | <250ms | P0 |
| `POST /api/ai/query` | 20 | <3000ms | P1 |
| `GET /api/integrations/records` | 30 | <500ms | P1 |
| WebSocket connections | 500 concurrent | - | P1 |

### Load Test Script Template

```yaml
# artillery/load-test.yml
config:
  target: "http://localhost:4000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up"
    - duration: 300
      arrivalRate: 100
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Dashboard Load"
    weight: 40
    flow:
      - get:
          url: "/api/dashboard/stats"
      - get:
          url: "/api/dashboard/tasks"
      - get:
          url: "/api/activities/recent"

  - name: "Consultant Browse"
    weight: 30
    flow:
      - get:
          url: "/api/consultants?limit=25"
      - get:
          url: "/api/consultants/1"

  - name: "Project Management"
    weight: 30
    flow:
      - get:
          url: "/api/projects"
      - get:
          url: "/api/projects/1/tasks"
```

### Load Test Metrics

| Metric | Threshold | Action if Failed |
|--------|-----------|------------------|
| Error rate | <1% | Block deployment |
| p95 latency | <500ms | Investigate |
| p99 latency | <2000ms | Block deployment |
| Throughput | >100 RPS | Scale infrastructure |

---

## 6. Regression Testing Strategy

### Pre-Commit Checks (Local)

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run type-check
npm run test:unit -- --changedSince=HEAD~1
```

### Pull Request Checks (CI)

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Check coverage threshold
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80% threshold"
            exit 1
          fi

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run db:push
      - run: npm run build
      - run: npm run test:e2e

  load-tests:
    runs-on: ubuntu-latest
    if: github.event.pull_request.base.ref == 'main'
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:load
```

### Merge to Main Checks

```yaml
# .github/workflows/main-deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  full-regression:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:load

  deploy:
    needs: full-regression
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

---

## 7. Regression Checklist for New Features

When implementing any new feature or upgrade:

### Before Development
- [ ] Review existing tests in affected areas
- [ ] Identify test files that may need updates
- [ ] Create test plan for new functionality

### During Development
- [ ] Write unit tests alongside code (TDD preferred)
- [ ] Run affected unit tests frequently
- [ ] Update E2E tests if UI changes

### Before PR
- [ ] All unit tests pass locally
- [ ] New code has 80%+ test coverage
- [ ] E2E smoke tests pass locally
- [ ] No TypeScript errors
- [ ] No ESLint errors

### PR Review
- [ ] Test coverage reviewed
- [ ] Edge cases tested
- [ ] Error handling tested
- [ ] Security implications reviewed

### After Merge
- [ ] Full E2E suite passes in CI
- [ ] Load tests pass (if applicable)
- [ ] Monitor error rates for 24 hours
- [ ] Rollback plan ready

---

## 8. Test Commands Reference

```bash
# Unit Tests
npm run test:unit                    # Run all unit tests
npm run test:unit -- --coverage      # With coverage report
npm run test:unit -- --watch         # Watch mode
npm run test:unit -- --testPathPattern="aiAssistant"  # Specific file

# Integration Tests
npm run test:integration             # Run integration tests
npm run db:test:up                   # Start test database
npm run db:test:down                 # Stop test database

# E2E Tests
npm run test:e2e                     # Run all E2E tests
CYPRESS_TEST=true npx cypress run    # With Cypress env
CYPRESS_TEST=true npx cypress open   # Interactive mode
npx cypress run --spec "cypress/e2e/01*.cy.js"  # Specific pattern

# Load Tests
npm run test:load                    # Run load tests
npx artillery run artillery/load-test.yml  # Direct Artillery

# All Tests
npm run test:all                     # Unit + Integration + E2E
npm run test:ci                      # CI pipeline tests
```

---

## 9. Test File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit | `*.test.ts` | `aiAssistant.test.ts` |
| Integration | `*.integration.test.ts` | `api.integration.test.ts` |
| E2E | `NN-feature-name.cy.js` | `57-ai-assistant.cy.js` |
| Load | `load-*.yml` | `load-dashboard.yml` |

---

## 10. Coverage Targets

| Type | Current | Target | Deadline |
|------|---------|--------|----------|
| Unit Test Coverage | 6% | 80% | Q2 2026 |
| E2E Feature Coverage | 85% | 95% | Q2 2026 |
| Integration Coverage | 20% | 70% | Q2 2026 |
| Critical Path Load Tests | 0% | 100% | Q2 2026 |

---

## 11. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `storage.test.ts` with CRUD tests for core tables
- [ ] Create `routes.test.ts` skeleton with endpoint categories
- [ ] Set up CI pipeline with test gates
- [ ] Add pre-commit hooks

### Phase 2: Core Routes (Week 3-4)
- [ ] Complete unit tests for TDR routes
- [ ] Complete unit tests for CRM routes
- [ ] Complete unit tests for ESIGN routes
- [ ] Complete unit tests for Integration routes

### Phase 3: E2E Expansion (Week 5-6)
- [ ] Create AI Assistant E2E tests
- [ ] Create Fieldglass SOW E2E tests
- [ ] Create Enterprise Overview E2E tests
- [ ] Fix any failing E2E tests

### Phase 4: Load Testing (Week 7-8)
- [ ] Set up Artillery infrastructure
- [ ] Create load tests for critical paths
- [ ] Establish performance baselines
- [ ] Add load tests to CI pipeline

### Phase 5: Continuous Improvement (Ongoing)
- [ ] Monitor and maintain 80% unit coverage
- [ ] Add tests for every new feature
- [ ] Quarterly review of test effectiveness
- [ ] Performance regression monitoring

---

## 12. Quick Reference: What Tests to Write

| Code Change | Tests Required |
|-------------|----------------|
| New API endpoint | Unit + Integration + E2E |
| Bug fix | Unit test that reproduces bug |
| UI component | E2E test for user flow |
| Database schema change | Unit + Integration |
| New integration | Integration + E2E |
| Performance optimization | Load test before/after |
| Security fix | Unit + Integration + E2E |

---

*This is a living document. Update it as testing practices evolve.*
*Last updated by Claude on February 7, 2026.*
