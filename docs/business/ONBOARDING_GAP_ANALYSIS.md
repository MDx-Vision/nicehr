# NiceHR Onboarding Gap Analysis

**Analysis Date:** February 1, 2026
**Source Documents:** `/Users/rafaelrodriguez/Downloads/Onboarding`
**Status:** Issues Created

---

## Executive Summary

Analysis of real NICEHR business onboarding documents against platform capabilities identified **6 gaps** requiring implementation. The most critical gap is the **3-tier per diem system** which directly affects consultant compensation.

---

## Document Inventory

### Source Documents Analyzed

| Document | Type | Key Data |
|----------|------|----------|
| NICEHR List of Onboarding Documents.docx | Checklist | 15+ required items |
| NICEHR Travel Policy.docx | Policy | Per diem rates, expense limits |
| NICEHR Onboarding Requirement Letter Draft.docx | Template | Consultant communication |
| Per Diem Tier 1.pdf | Offer Letter | $240/day, remote/travel |
| Per Diem Tier 2.pdf | Offer Letter | $175/day, 0-49 miles |
| Per Diem Tier 3.pdf | Offer Letter | $75/day, 11-35 miles |
| NICEHR Portal Employment Application.pdf | Form | Application fields |

---

## Gap Analysis

### Gap 1: Per Diem Tier System 🔴 P0-Critical

**Business Requirement:**
| Tier | Distance | Rate | Conditions |
|------|----------|------|------------|
| Tier 1 | Remote/Travel | $240/day | Consultant books own accommodations |
| Tier 2 | 0-49 miles | $175/day | Per diem only when >3 hours worked |
| Tier 3 | 11-35 miles | $75/day | Short commute compensation |

**Platform Status:**
- ✅ Has per diem calculation
- ✅ Has location-based rates
- 🔴 MISSING: 3-tier structure
- 🔴 MISSING: Distance-based tier assignment
- 🔴 MISSING: 3-hour minimum work rule
- 🔴 MISSING: Self-book accommodation flag

**Implementation Required:**
1. Database: `per_diem_tiers` table
2. UI: Tier assignment in consultant/project records
3. Logic: Distance calculation from consultant home → project
4. Validation: 3-hour minimum rule for Tier 2
5. Update: Timesheet per diem calculations

---

### Gap 2: Travel Policy Expense Limits 🟡 P1-High

**Business Requirement:**
| Expense Type | Limit | Rule |
|--------------|-------|------|
| Daily Per Diem (Travel) | $20 | Different from onsite |
| Daily Per Diem (Onsite) | $40 | Standard work day |
| Airfare | $600 max | Economy only |
| Baggage | $30 each way | 2 bags max |
| Rental Car | $35/day max | Compact class |
| Mileage | IRS rate | $0.655/mile (2023) |

**Platform Status:**
- ✅ Travel module exists
- ✅ Expense tracking exists
- 🔴 MISSING: Expense limit enforcement
- 🔴 MISSING: Travel day vs onsite day differentiation
- 🔴 MISSING: Baggage limits
- 🔴 MISSING: IRS mileage calculator

**Implementation Required:**
1. Database: `expense_policies` table with limits
2. Validation: Flag expenses exceeding limits
3. UI: Travel day type selector
4. Calculator: IRS mileage rate

---

### Gap 3: Immunization Series Tracking 🟡 P1-High

**Business Requirement:**
- Hepatitis B (2-3 dose series)
- MMR (Measles, Mumps, Rubella)
- Tdap (Tetanus, Diphtheria, Pertussis)
- Varicella (Chickenpox)
- Flu Shot (Annual)
- COVID-19 Vaccine
- TB Test (2-step or QuantiFERON)

**Platform Status:**
- ✅ Document upload for immunizations
- ✅ Expiration date tracking
- ✅ Expiration alerts
- 🔴 MISSING: Multi-dose series tracking (Hep B = 3 doses)
- 🔴 MISSING: 2-step TB test tracking
- 🔴 MISSING: Titer verification
- 🔴 MISSING: Hospital-specific requirements
- 🔴 MISSING: Declination forms

**Implementation Required:**
1. Schema: Add dose tracking fields
2. UI: Series progress indicator
3. Validation: Hospital requirement mapping

---

### Gap 4: Offer Letter Templates 🟡 P2-Medium

**Business Requirement:**
- Multiple vendor formats (CSI, Divurgent, Ellit)
- Per diem tier in offer
- Project details merge fields
- Start/end dates

**Platform Status:**
- ✅ Contracts module
- ✅ ESIGN compliance
- 🔴 MISSING: Offer letter template builder
- 🔴 MISSING: Per diem tier merge field
- 🔴 MISSING: Vendor-specific templates

**Implementation Required:**
1. Templates: Offer letter type
2. Merge fields: `{{per_diem_tier}}`, `{{project_name}}`, `{{client_name}}`
3. Variants: Per vendor templates

---

### Gap 5: Expense Reimbursement Rules 🟡 P1-High

**Business Requirement:**
- Non-reimbursable items (alcohol, entertainment, spouse travel)
- Receipt requirements ($25+ threshold)
- Business meal attendee tracking
- Pre-approval for entertainment

**Platform Status:**
- ✅ Expense submission
- ✅ Receipt upload
- ✅ Approval workflow
- 🔴 MISSING: Non-reimbursable validation
- 🔴 MISSING: Receipt threshold rules
- 🔴 MISSING: Attendee tracking
- 🔴 MISSING: Pre-approval flags

**Implementation Required:**
1. Rules: Category-based auto-reject
2. Validation: Receipt required by amount
3. Fields: Meal attendees
4. Workflow: Pre-approval for entertainment

---

### Gap 6: Emergency Contact 🟢 P3-Low

**Business Requirement:**
- Emergency contact name
- Phone number
- Relationship

**Platform Status:**
- 🔴 MISSING: Emergency contact fields

**Implementation Required:**
1. Schema: Add fields to consultant profile
2. UI: Emergency contact section in profile

---

## Priority Matrix

| Gap | Priority | Complexity | Business Impact | Issue # |
|-----|----------|------------|-----------------|---------|
| Per Diem Tier System | P0 | High | Critical - affects pay | TBD |
| Travel Policy Limits | P1 | Medium | High - cost control | TBD |
| Immunization Series | P1 | Medium | High - compliance | TBD |
| Expense Rules | P1 | Medium | High - cost control | TBD |
| Offer Letter Templates | P2 | Medium | Medium - efficiency | TBD |
| Emergency Contact | P3 | Low | Low - simple add | TBD |

---

## Implementation Roadmap

### Phase 1: Critical (Week 1-2)
- [ ] Per Diem Tier System (Gap 1)

### Phase 2: High Priority (Week 3-4)
- [ ] Travel Policy Limits (Gap 2)
- [ ] Immunization Series (Gap 3)
- [ ] Expense Rules (Gap 5)

### Phase 3: Medium Priority (Week 5-6)
- [ ] Offer Letter Templates (Gap 4)
- [ ] Emergency Contact (Gap 6)

---

## Test Requirements

Each gap implementation requires:

1. **Unit Tests**
   - Business logic validation
   - Calculation accuracy
   - Edge cases

2. **E2E Tests**
   - CRUD operations
   - Validation flows
   - Error handling

3. **Integration Tests**
   - API endpoint testing
   - Database operations

---

*Document created: 2026-02-01*
*Source: Real NICEHR business documents*
