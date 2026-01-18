# TNG CRM Build Checklist

**Started:** January 18, 2026
**Baseline Tests:** 1977/1977 passing (100%)
**Status:** 🔄 IN PROGRESS

---

## Safeguard Rule

After EACH phase, run full test suite:
```bash
CYPRESS_TEST=true npx cypress run
```
**Must maintain:** 1977+ tests passing (no regressions)

---

## Phase 1: Architecture & Foundation ✅ COMPLETE

### 1.1 Feature Flag & Module Structure
- [x] Add `ENABLE_CRM` feature flag
- [x] Create `/client/src/pages/CRM/` directory structure
- [x] Create `/server/routes/crm.ts` API routes file
- [x] Add CRM to sidebar navigation
- [x] Add CRM route to App.tsx

### 1.2 Core Database Tables
- [x] `crm_contacts` - Contact records
- [x] `crm_companies` - Company/Account records
- [x] `crm_deals` - Deal/Opportunity records
- [x] `crm_pipelines` - Pipeline definitions
- [x] `crm_pipeline_stages` - Pipeline stages
- [x] `crm_activities` - Activity log (calls, emails, meetings, notes)

**Checkpoint:** Tests pass 1977/1977 ✅

---

## Phase 2: Core CRM Module ✅ COMPLETE

### 2.1 CRM Dashboard
- [x] Pipeline overview widget
- [x] Revenue metrics cards
- [x] Activity metrics
- [x] Tasks due today
- [x] Deals closing this week

### 2.2 Contacts Page
- [x] Contacts list with search/filter
- [x] Create contact form
- [x] Contact detail view
- [x] Edit contact
- [x] Delete contact
- [ ] Activity timeline on contact (Phase 4)

### 2.3 Companies Page
- [x] Companies list with search/filter
- [x] Create company form
- [x] Company detail view
- [x] Edit company
- [x] Delete company
- [ ] Contacts at company (Phase 4)

**Checkpoint:** Tests pass 1977/1977 ✅

---

## Phase 3: Sales Pipeline ✅ COMPLETE

### 3.1 Deals Page
- [x] Deals Kanban board view
- [x] Deals list view
- [x] Create deal form
- [x] Deal detail view
- [x] Move to stage functionality
- [x] Deal value and probability

### 3.2 Pipeline Management
- [x] Seed default pipeline endpoint
- [x] Pipeline stages with ordering
- [x] Stage probability defaults
- [ ] Pipeline settings page (future)
- [ ] Create/edit pipeline UI (future)

**Checkpoint:** Tests pass 1977/1977 ✅

---

## Phase 4: Activities & Tasks ⬜

### 4.1 Activity Logging
- [ ] Log call activity
- [ ] Log email activity
- [ ] Log meeting activity
- [ ] Log note
- [ ] Activity feed on contact/company/deal

### 4.2 Tasks
- [ ] Tasks list
- [ ] Create task
- [ ] Task assignment
- [ ] Task due dates
- [ ] Task completion

**Checkpoint:** Tests pass 1977/1977 ✅

---

## Phase 5: E2E Tests ⬜

- [ ] Create `cypress/e2e/44-crm-contacts.cy.js`
- [ ] Create `cypress/e2e/45-crm-companies.cy.js`
- [ ] Create `cypress/e2e/46-crm-deals.cy.js`
- [ ] Create `cypress/e2e/47-crm-pipeline.cy.js`
- [ ] Create `cypress/e2e/48-crm-activities.cy.js`

**Target:** 100+ new CRM tests

---

## Progress Tracking

| Phase | Status | Tests After | Notes |
|-------|--------|-------------|-------|
| 1. Foundation | ✅ Complete | - | Feature flag + schema |
| 2. Core Module | ✅ Complete | - | Dashboard, Contacts, Companies |
| 3. Pipeline | ✅ Complete | - | Deals, Kanban |
| 4. Activities | ⬜ Pending | - | Logging, Tasks |
| 5. Tests | ⬜ Pending | - | 100+ tests |

---

## Files Created

**Frontend:**
- `client/src/pages/CRM/index.tsx` - Main CRM Dashboard ✅
- `client/src/pages/CRM/Contacts.tsx` - Contacts page ✅
- `client/src/pages/CRM/Companies.tsx` - Companies page ✅
- `client/src/pages/CRM/Deals.tsx` - Deals/Pipeline page ✅

**Backend:**
- `server/routes/crm.ts` - CRM API routes (~600 lines) ✅

**Schema:**
- `shared/schema.ts` - CRM tables added (~250 lines) ✅
  - 11 enums + 6 tables with indexes

**Configuration:**
- `shared/featureFlags.ts` - Added `CRM_MODULE` flag ✅
- `server/routes.ts` - Mounted CRM routes ✅
- `client/src/App.tsx` - Added CRM routes ✅
- `client/src/components/AppSidebar.tsx` - Added CRM navigation ✅

---

*Last Updated: January 18, 2026*
