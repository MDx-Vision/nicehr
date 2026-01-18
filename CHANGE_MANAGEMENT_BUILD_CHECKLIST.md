# Change Management Module - Build Checklist

**Goal:** Build Change Management MVP without breaking existing functionality

**Date Started:** January 17, 2026
**Date Completed:** January 17, 2026
**Baseline Tests:** 1900/1902 passing (99.9%)
**Final Tests:** 1971/1973 passing (99.9%)
**Status:** COMPLETE

---

## Safeguard Rule

After EACH phase, run full test suite:
```bash
CYPRESS_TEST=true npx cypress run
```
**Must maintain:** 1900+ tests passing (no regressions)

---

## Phase 1: Database Schema
- [x] Create `change_requests` table
  - [x] id, projectId, title, description
  - [x] requestedBy, requestedAt
  - [x] category (scope, timeline, budget, technical, process, resource, integration, training)
  - [x] priority (low, medium, high, critical)
  - [x] status (draft, submitted, under_review, approved, rejected, implemented, cancelled)
  - [x] impactLevel (minimal, moderate, significant, major)
- [x] Create `change_request_impacts` table
  - [x] id, changeRequestId
  - [x] impactArea (schedule, budget, resources, scope, risk, quality, stakeholders)
  - [x] description, severity
- [x] Create `change_request_approvals` table
  - [x] id, changeRequestId
  - [x] approverId, approverRole
  - [x] decision (pending, approved, rejected, deferred)
  - [x] comments, decidedAt
- [x] Create `change_request_comments` table (BONUS)
  - [x] id, changeRequestId, authorId, authorName, content
- [x] Run `npm run db:push`
- [x] Verify tables created

**Checkpoint:** Tests pass 1900+ ✅

---

## Phase 2: API Endpoints
- [x] GET `/api/projects/:projectId/change-requests` - List all
- [x] POST `/api/projects/:projectId/change-requests` - Create new
- [x] GET `/api/projects/:projectId/change-requests/:id` - Get single
- [x] PATCH `/api/projects/:projectId/change-requests/:id` - Update
- [x] DELETE `/api/projects/:projectId/change-requests/:id` - Delete
- [x] POST `/api/change-requests/:id/submit` - Submit for review
- [x] POST `/api/change-requests/:id/start-review` - Start review (BONUS)
- [x] POST `/api/change-requests/:id/approve` - Approve
- [x] POST `/api/change-requests/:id/reject` - Reject
- [x] POST `/api/change-requests/:id/implement` - Mark implemented (BONUS)
- [x] POST `/api/change-requests/:id/impacts` - Add impact (BONUS)
- [x] POST `/api/change-requests/:id/comments` - Add comment (BONUS)
- [x] GET `/api/projects/:projectId/change-requests/stats` - Dashboard stats

**Checkpoint:** Tests pass 1900+ ✅

---

## Phase 3: Frontend - Page Structure
- [x] Create `client/src/pages/ChangeManagement/index.tsx`
- [x] Add route `/change-management` in App.tsx
- [x] Add sidebar navigation item
- [x] Create API helper `client/src/lib/changeManagementApi.ts`
- [x] Basic page layout with tabs:
  - [x] Dashboard (stats overview)
  - [x] All Requests (list view)
  - [x] My Requests (filtered)
  - [x] Pending Approvals (for approvers)

**Checkpoint:** Tests pass 1900+ ✅

---

## Phase 4: Frontend - CRUD Operations
- [x] List view with filters (status, priority, category)
- [x] Create change request dialog
  - [x] Title, description fields
  - [x] Category selector
  - [x] Priority selector
  - [x] Impact assessment section
- [x] View/Edit change request details
- [x] Delete functionality
- [x] Status badges and indicators

**Checkpoint:** Tests pass 1900+ ✅

---

## Phase 5: Frontend - Approval Workflow
- [x] Submit for review button
- [x] Approval/Rejection dialog
- [x] Approval history display
- [x] Status transition indicators
- [x] Notifications/toasts for actions
- [x] Comments section (BONUS)

**Checkpoint:** Tests pass 1900+ ✅

---

## Phase 6: E2E Tests
- [x] Create `cypress/e2e/43-change-management.cy.js`
- [x] Test categories:
  - [x] Page load and navigation (7 tests)
  - [x] Dashboard tab (8 tests)
  - [x] All Requests tab (14 tests)
  - [x] My Requests tab (2 tests)
  - [x] Pending Approvals tab (5 tests)
  - [x] Create change request (12 tests)
  - [x] View change request details (7 tests)
  - [x] Submit workflow (1 test)
  - [x] Approve workflow (5 tests)
  - [x] Reject workflow (5 tests)
  - [x] Implement workflow (1 test)
  - [x] Delete change request (2 tests)
  - [x] Error handling (3 tests)
  - [x] Responsive design (2 tests)
  - [x] Accessibility (3 tests)
- [x] Target: 50+ tests for the module
- [x] **Actual: 71 tests**

**Final Checkpoint:** Tests pass 1971+ ✅

---

## Phase 7: Documentation & Cleanup
- [x] Update CLAUDE.md with new module info
- [x] Add feature flag `ENABLE_CHANGE_MANAGEMENT`
- [x] Code review / cleanup
- [ ] Final commit and push

---

## Progress Tracking

| Phase | Status | Tests After | Notes |
|-------|--------|-------------|-------|
| 1. Schema | ✅ Complete | 1900/1902 | 4 tables, 6 enums |
| 2. API | ✅ Complete | 1900/1902 | 13 endpoints |
| 3. Page Structure | ✅ Complete | 1900/1902 | 4 tabs |
| 4. CRUD UI | ✅ Complete | 1900/1902 | Full CRUD + filters |
| 5. Approval Flow | ✅ Complete | 1900/1902 | Submit/Approve/Reject/Implement |
| 6. E2E Tests | ✅ Complete | 1971/1973 | 71 tests |
| 7. Docs | ✅ Complete | - | All updated |

---

## Success Criteria

- [x] All existing tests still pass (1900+)
- [x] New module has 50+ E2E tests (71 tests!)
- [x] Total test count: 1950+ (1973 total)
- [x] Zero regressions
- [x] Feature complete per MVP spec

---

## Files Created/Modified

**New Files:**
- `shared/schema.ts` - Added change management tables and enums (lines 7764-7923)
- `server/routes/changeManagement.ts` - API routes (400+ lines)
- `client/src/pages/ChangeManagement/index.tsx` - Main page (~850 lines)
- `client/src/lib/changeManagementApi.ts` - API helpers (~110 lines)
- `cypress/e2e/43-change-management.cy.js` - E2E tests (71 tests, ~1000 lines)

**Modified Files:**
- `shared/featureFlags.ts` - Added CHANGE_MANAGEMENT flag
- `server/routes.ts` - Mounted new routes with feature flag
- `client/src/App.tsx` - Added route
- `client/src/components/AppSidebar.tsx` - Added nav item
- `.env` - Added ENABLE_CHANGE_MANAGEMENT=true
- `CLAUDE.md` - Documented new module
