---
name: Phase Implementation
about: Multi-step feature implementation with checkboxes
title: "[Phase] "
labels: Feature
assignees: ''
---

## Phase X: [Title]

**Priority:** Critical/High/Medium/Low
**Estimated:** X hours
**Module:** [Module Name]

### Overview
<!-- Brief description of what this phase accomplishes -->

### Tasks
- [ ] **Database Changes**
  - [ ] Create/modify table `table_name`
  - [ ] Add migration if needed
  - [ ] Run `npm run db:push`

- [ ] **Backend API**
  - [ ] Create `server/routes/featureName.ts`
  - [ ] Add CRUD endpoints
  - [ ] Add validation

- [ ] **Frontend UI**
  - [ ] Create `client/src/pages/Feature/index.tsx`
  - [ ] Add to navigation
  - [ ] Implement forms/dialogs

- [ ] **Testing**
  - [ ] Unit tests for business logic
  - [ ] E2E tests `cypress/e2e/XX-feature.cy.js`
  - [ ] Integration tests

### Files to Create/Modify
```
server/routes/featureName.ts       # New
client/src/pages/Feature/index.tsx # New
shared/schema.ts                   # Modify
cypress/e2e/XX-feature.cy.js       # New
```

### Acceptance Criteria
- [ ] All CRUD operations work
- [ ] Validation prevents invalid data
- [ ] UI matches existing design patterns
- [ ] All tests pass (unit + E2E)
- [ ] No regressions in existing tests

### Related
- Part of [Epic/Feature Name]
- Depends on: #issue_number (if any)
- Blocks: #issue_number (if any)

### Test Commands
```bash
# Run specific tests
CYPRESS_TEST=true npx cypress run --spec "cypress/e2e/XX-feature.cy.js"

# Run unit tests
npm test

# Run all tests (verify no regressions)
CYPRESS_TEST=true npx cypress run
```
