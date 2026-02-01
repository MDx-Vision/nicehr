# Quality Assurance & Regression Prevention

**Purpose:** Ensure we never break existing functionality when adding new features.
**Last Updated:** January 19, 2026

---

## Table of Contents

1. [Golden Rules](#golden-rules)
2. [Before You Code](#before-you-code)
3. [While You Code](#while-you-code)
4. [Before You Commit](#before-you-commit)
5. [Before You Merge](#before-you-merge)
6. [Regression Prevention Checklist](#regression-prevention-checklist)
7. [Common Pitfalls](#common-pitfalls)
8. [Emergency Rollback](#emergency-rollback)

---

## Golden Rules

### The 5 Non-Negotiables

1. **NEVER commit without running tests** - All 2,135 tests must pass
2. **NEVER modify shared code without checking dependents** - schema.ts, storage.ts, routes.ts
3. **NEVER delete/rename without searching for usages** - Use grep/search first
4. **NEVER skip the PR review process** - Even for "small" changes
5. **NEVER deploy on Friday** - Murphy's Law is real

### The Test Pyramid

```
         /\
        /  \      E2E Tests (2,135)
       /----\     - Run before every commit
      /      \    - Full coverage of user journeys
     /--------\
    /          \  Integration Tests
   /------------\ - API endpoint testing
  /              \- Database operations
 /----------------\
/                  \ Unit Tests
                     - Individual functions
                     - Edge cases
```

---

## Before You Code

### 1. Understand What Exists

```bash
# Search for related code
grep -r "keyword" --include="*.ts" --include="*.tsx"

# Find all usages of a function/component
grep -r "functionName" client/ server/

# Check database schema for related tables
grep -r "tableName" shared/schema.ts
```

### 2. Check Test Coverage

```bash
# Find existing tests for the area you're modifying
ls cypress/e2e/ | grep -i "feature-name"

# Read the test file to understand expected behavior
cat cypress/e2e/XX-feature-name.cy.js
```

### 3. Document Your Plan

Before making changes, answer:
- [ ] What files will I modify?
- [ ] What tests cover this functionality?
- [ ] What could break if I change this?
- [ ] Do I need to add new tests?

---

## While You Code

### Safe Modification Patterns

#### Adding a New Feature
```
1. Create new files (don't modify existing)
2. Add feature flag if risky
3. Write tests FIRST (TDD)
4. Implement feature
5. Run full test suite
```

#### Modifying Existing Code
```
1. Read existing tests
2. Understand current behavior
3. Make minimal changes
4. Run related tests frequently
5. Run full suite before commit
```

#### Database Schema Changes
```
1. NEVER delete columns (mark deprecated)
2. Add new columns as nullable OR with defaults
3. Run migrations on test DB first
4. Update ALL related code before deploying
5. Test data integrity
```

### Feature Flags

For risky features, use feature flags:

```typescript
// shared/featureFlags.ts
export const FEATURE_FLAGS = {
  ENABLE_NEW_FEATURE: process.env.ENABLE_NEW_FEATURE === 'true'
};

// Usage
if (isFeatureEnabled('ENABLE_NEW_FEATURE')) {
  // New code path
} else {
  // Existing code path (safe fallback)
}
```

---

## Before You Commit

### Mandatory Checklist

```bash
# 1. Run the FULL test suite
CYPRESS_TEST=true npx cypress run

# 2. Check for TypeScript errors
npm run build

# 3. Check for console errors in browser
npm run dev  # Open browser, check console

# 4. Verify no hardcoded values
grep -r "localhost" client/ server/ --include="*.ts" --include="*.tsx"
grep -r "password" client/ server/ --include="*.ts" --include="*.tsx"
```

### Test Requirements by Change Type

| Change Type | Required Tests |
|-------------|----------------|
| New page | E2E tests for all user flows |
| New API endpoint | API tests + error handling |
| Bug fix | Regression test proving fix |
| Schema change | Data integrity tests |
| UI change | Visual tests + accessibility |
| Security change | Security-specific tests |

### Commit Message Format

```
type(scope): description

- What changed
- Why it changed
- What tests were added/modified

Fixes #issue-number (if applicable)
```

---

## Before You Merge

### PR Requirements

- [ ] All 2,135+ tests passing
- [ ] No TypeScript errors
- [ ] Code reviewed by at least 1 person
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated
- [ ] No console warnings/errors

### Review Focus Areas

| Area | Check |
|------|-------|
| Security | No exposed credentials, proper auth |
| Performance | No N+1 queries, efficient code |
| Accessibility | Proper ARIA labels, keyboard nav |
| Error Handling | All errors caught and handled |
| Edge Cases | Null checks, empty states |

---

## Regression Prevention Checklist

### Before Starting Any Feature

- [ ] Read related existing code
- [ ] Identify all affected files
- [ ] List all tests that cover affected areas
- [ ] Create backup branch: `git checkout -b backup/pre-feature-name`

### During Development

- [ ] Run tests after each significant change
- [ ] Check browser console for errors
- [ ] Test happy path AND error paths
- [ ] Test with empty data
- [ ] Test with large data sets

### Before Committing

- [ ] Full test suite passes (2,135+ tests)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Changes match requirements
- [ ] No debug code left behind (console.log, etc.)

### After Deploying

- [ ] Smoke test critical paths
- [ ] Check error monitoring
- [ ] Verify no performance degradation
- [ ] Monitor for 24 hours

---

## Common Pitfalls

### 1. Shared Schema Modifications

**DANGER:** `shared/schema.ts` affects EVERYTHING

```typescript
// BAD - Removing a column
// This breaks all code using this column!

// GOOD - Deprecate instead
// Add comment: // @deprecated - use newColumn instead
// Add new column
// Migrate data
// Update all usages
// Then remove (after weeks/months)
```

### 2. Route Changes

**DANGER:** Changing API routes breaks frontend

```typescript
// BAD
// Old: GET /api/users
// New: GET /api/v2/users
// Frontend still calls /api/users = BROKEN

// GOOD
// Keep old route working
// Add new route
// Update frontend
// Deprecate old route
// Remove old route later
```

### 3. Type Changes

**DANGER:** Changing TypeScript types breaks type safety

```typescript
// BAD - Changing required to optional
interface User {
  email: string;  // Was required
}
// Changed to:
interface User {
  email?: string;  // Now optional - code assuming it exists BREAKS
}

// GOOD - Add new optional field
interface User {
  email: string;
  emailVerified?: boolean;  // New optional field
}
```

### 4. Test Data Dependencies

**DANGER:** Tests depending on specific data

```javascript
// BAD
it('should show user', () => {
  cy.contains('John Doe');  // Breaks if seed data changes
});

// GOOD
it('should show user', () => {
  cy.get('[data-testid="user-name"]').should('be.visible');
});
```

---

## Emergency Rollback

### If Something Breaks in Production

#### Immediate Actions (< 5 minutes)

```bash
# 1. Revert to last known good commit
git revert HEAD
git push

# 2. Or checkout previous version
git checkout <last-good-commit>
git push -f origin main  # CAUTION: Force push

# 3. Notify team
# Post in team channel with details
```

#### Investigation (After Stable)

1. Identify root cause
2. Write regression test that would have caught it
3. Fix properly
4. Add to "Common Pitfalls" above
5. Update this document

### Rollback Contacts

| Situation | Contact |
|-----------|---------|
| Database issues | DBA on-call |
| Infrastructure | DevOps on-call |
| Security breach | Security team immediately |
| Data loss | Stop all operations, escalate |

---

## Quick Reference Card

### Commands to Run Before Every Commit

```bash
# Must pass ALL of these:
npm run build                           # TypeScript check
CYPRESS_TEST=true npx cypress run       # All E2E tests

# Quick sanity checks:
npm run dev                             # Start server
# Open browser, click around, check console
```

### Files That Require Extra Caution

| File | Impact | Extra Steps |
|------|--------|-------------|
| `shared/schema.ts` | ALL database operations | Run migrations, check all storage.ts usages |
| `server/routes.ts` | ALL API endpoints | Check frontend calls, run all API tests |
| `server/storage.ts` | ALL database queries | Run all tests, check for N+1 queries |
| `client/src/App.tsx` | ALL routing | Test all page navigation |
| `cypress.config.js` | ALL tests | Run full suite twice |

### Test Categories

| Category | Files | Min Pass |
|----------|-------|----------|
| Dashboard | 01-05 | 100% |
| Core CRUD | 06-15 | 100% |
| Advanced | 16-30 | 100% |
| Security | 27-30 | 100% |
| CRM | 44-48 | 100% |

---

## Metrics to Track

| Metric | Target | Alert If |
|--------|--------|----------|
| Test pass rate | 100% | < 100% |
| Test count | 2,135+ | Decreasing |
| Build time | < 3 min | > 5 min |
| Test time | < 20 min | > 30 min |
| Regressions/month | 0 | > 2 |

---

*Remember: It's faster to prevent bugs than to fix them.*
