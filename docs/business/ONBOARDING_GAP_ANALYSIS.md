# NiceHR Onboarding Gap Analysis

**Analysis Date:** February 1, 2026
**Source Documents:** `/Users/rafaelrodriguez/Downloads/Onboarding`
**Status:** COMPREHENSIVE REVIEW COMPLETE

---

## Executive Summary

Comprehensive analysis of NICEHR business onboarding documents against platform capabilities identified **12 gaps** requiring implementation across 4 priority levels.

| Priority | Count | Impact |
|----------|-------|--------|
| P0 Critical | 2 | Directly affects pay/compliance |
| P1 High | 5 | Operational efficiency |
| P2 Medium | 3 | Process automation |
| P3 Low | 2 | Nice-to-have enhancements |

---

## Source Documents Analyzed

### Onboarding Folder Contents

| Document | Type | Key Data |
|----------|------|----------|
| NICEHR List of Onboarding Documents.docx | Checklist | 15 required items |
| NICEHR Travel Policy.docx | Policy | Expense rules, per diem rates, limits |
| NICEHR Onboarding Requirement Letter Draft.docx | Template | Requirements communication |
| NICEHR Immunization Request Letter Draft.docx | Template | Immunization communication |
| NICEHR Portal Employment Application Draft.docx | Form | Basic application fields |
| NICEHR Portal FLU Requirement Draft.docx | Form | Flu vaccine tracking |
| NICEHR Portal Hep B Requirement Draft.pdf | Form | Hep B series tracking |
| NICEHR Portal TB Request Form Draft.docx | Form | TB test requirements |
| Per Diem Tier 1 (Marshfield).pdf | Offer Letter | $240/day remote |
| Per Diem Tier 2 (NYP).pdf | Offer Letter | $175/day regional |
| Per Diem Tier 3 (Mount Sinai).pdf | Offer Letter | $75/day local |
| JBI_Updated_Employment_Offer_Letter.docx | Offer Letter | JBI format, $50/day flat |

### Offer Letter Templates Folder

| Subfolder | Contents |
|-----------|----------|
| CSI Templates | 6 offer letters (UMC, UPMC, Northwell, Stamford, RWJBarnabas, OU Health) |
| Ellit Templates | 2 offer letters (OCCA, Optum CareMount) |
| Divurgent Templates | Full contract package (Offer, NDA, Job Description, Photo Release, IT Agreement) |

---

## Required Onboarding Documents (From Business Docs)

| # | Document | Platform Status | Gap? |
|---|----------|-----------------|------|
| 1 | Employment Application | No dedicated form | Yes |
| 2 | Emergency Contact Information | ✅ In consultant schema | No |
| 3 | Employment & Education Verification | Document upload only | Partial |
| 4 | Drug Screening 10 Panel | ✅ Flag in schema | No |
| 5 | Background Check | ✅ Flag in schema | No |
| 6 | W-9/1099 Form | Document upload only | Partial |
| 7 | Employee Handbook Acknowledgment | No tracking | Yes |
| 8 | Hepatitis B (3-dose series) | No series tracking | Yes |
| 9 | MMR (2-dose series) | No series tracking | Yes |
| 10 | Tdap | Single document only | Partial |
| 11 | Varicella (2-dose series) | No series tracking | Yes |
| 12 | Flu Vaccine (Annual) | No annual tracking | Partial |
| 13 | COVID-19 Vaccine + Booster | No booster tracking | Yes |
| 14 | TB Test (2-step or QuantiFERON) | No 2-step tracking | Yes |
| 15 | References (3 required) | No structured tracking | Yes |
| 16 | Direct Deposit | No form | Yes |
| 17 | ID/Drivers License | ✅ Identity documents table | No |
| 18 | Degrees/Certifications/Licenses | ✅ Documents + certifications table | No |
| 19 | Current Headshot | No dedicated field | Yes |

---

## Gap Analysis Detail

### Gap 1: Multi-Dose Immunization Series Tracking 🔴 P0-Critical

**Business Requirement:**
| Vaccine | Doses Required | Timing |
|---------|----------------|--------|
| Hepatitis B | 2-3 doses | 0, 1-2 months, 4-6 months |
| MMR | 2 doses | 4 weeks apart |
| Varicella | 2 doses | 4-8 weeks apart |
| COVID-19 | 2 doses + booster | Per CDC guidelines |

**Platform Status:**
- ✅ `consultant_documents` table exists
- ✅ Document expiration tracking
- 🔴 MISSING: Dose number tracking per vaccine
- 🔴 MISSING: Series completion status
- 🔴 MISSING: Date of each dose
- 🔴 MISSING: Titer verification alternative
- 🔴 MISSING: Declination forms

**Implementation Required:**
```sql
CREATE TABLE immunization_records (
  id VARCHAR PRIMARY KEY,
  consultant_id VARCHAR REFERENCES consultants(id),
  vaccine_type VARCHAR NOT NULL, -- hep_b, mmr, varicella, covid, flu, tdap, tb
  dose_number INTEGER,
  total_doses_required INTEGER,
  administered_date DATE,
  expiration_date DATE,
  document_id VARCHAR REFERENCES consultant_documents(id),
  titer_verified BOOLEAN DEFAULT false,
  declination_signed BOOLEAN DEFAULT false,
  declination_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI Requirements:**
- Immunization dashboard showing series progress
- Visual indicator (1/3, 2/3, 3/3)
- Due date alerts for next dose
- Hospital-specific requirements matrix

---

### Gap 2: Per Diem Tier Assignment System 🔴 P0-Critical

**Business Requirement:**
| Tier | Distance | Rate | Conditions |
|------|----------|------|------------|
| Tier 1 (Remote) | >50 miles | $240/day | Self-book accommodations |
| Tier 2 (Regional) | 11-50 miles | $175/day | Per diem only when >3 hours worked |
| Tier 3 (Local) | <11 miles | $75/day | No minimum hours |
| JBI Model | Flat | $50/day | No tier system |

**Platform Status:**
- ✅ `per_diem_policies` table exists
- ✅ Per diem rate tracking
- 🔴 MISSING: Tier assignment to consultant
- 🔴 MISSING: Distance calculation logic
- 🔴 MISSING: 3-hour minimum work rule for Tier 2
- 🔴 MISSING: Self-book accommodation flag
- 🔴 MISSING: Project-specific tier override

**Implementation Required:**
```sql
-- Add to consultants or project_assignments table
ALTER TABLE project_assignments ADD COLUMN per_diem_tier VARCHAR; -- tier_1, tier_2, tier_3, flat
ALTER TABLE project_assignments ADD COLUMN per_diem_rate DECIMAL(10,2);
ALTER TABLE project_assignments ADD COLUMN self_book_accommodation BOOLEAN DEFAULT false;
ALTER TABLE project_assignments ADD COLUMN min_hours_for_per_diem DECIMAL(4,2); -- e.g., 3.0

-- Update per_diem_policies
ALTER TABLE per_diem_policies ADD COLUMN tier_name VARCHAR;
ALTER TABLE per_diem_policies ADD COLUMN min_distance_miles INTEGER;
ALTER TABLE per_diem_policies ADD COLUMN max_distance_miles INTEGER;
ALTER TABLE per_diem_policies ADD COLUMN min_hours_worked DECIMAL(4,2);
```

---

### Gap 3: Travel Expense Limits & Validation 🟡 P1-High

**Business Requirement (From Travel Policy):**
| Expense Type | Limit | Rule |
|--------------|-------|------|
| Airfare (roundtrip) | $600 max | Economy only, no upgrades |
| Baggage | $30 each way | 2 bags max |
| Taxi (airport) | $30 each way | Itemized receipt required |
| Per Diem (travel day) | $20/day | Different from onsite |
| Per Diem (onsite) | $40/day | Standard work day |
| Mileage (personal vehicle) | $600 max project | GSA rate |

**Non-Reimbursable Items:**
- First/Business class upgrades
- GPS, toll pass waivers
- Airport parking
- Room service, valet parking
- In-room movies, minibar
- Laundry/dry cleaning
- Personal trips, entertainment
- Flights purchased with rewards

**Platform Status:**
- ✅ `expenses` table exists
- ✅ Expense categories exist
- 🔴 MISSING: Expense limit enforcement per category
- 🔴 MISSING: Travel day vs onsite day differentiation
- 🔴 MISSING: Non-reimbursable item flagging
- 🔴 MISSING: Receipt requirement threshold ($25+)
- 🔴 MISSING: 2-week expense submission deadline tracking

**Implementation Required:**
```sql
CREATE TABLE expense_policies (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL, -- airfare, baggage, taxi, mileage, per_diem, lodging
  max_amount DECIMAL(10,2),
  max_amount_period VARCHAR, -- per_trip, per_day, per_project
  requires_receipt BOOLEAN DEFAULT true,
  receipt_threshold DECIMAL(10,2), -- e.g., 25.00
  allowed_classes TEXT[], -- economy, compact
  non_reimbursable_items TEXT[],
  submission_deadline_days INTEGER, -- 14 days
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Gap 4: Employment Application Form 🟡 P1-High

**Business Requirement (From Employment Application):**
- Legal Last Name, First Name, MI
- Street Address, City, State, Zip
- Phone, Cell
- Gender
- SSN, Date of Birth
- Email
- Signature and Date

**Platform Status:**
- ✅ Basic fields in `users` and `consultants` tables
- 🔴 MISSING: Dedicated employment application workflow
- 🔴 MISSING: SSN field (encrypted)
- 🔴 MISSING: Gender field
- 🔴 MISSING: Application signature capture
- 🔴 MISSING: Application submission date tracking

**Implementation Required:**
```sql
CREATE TABLE employment_applications (
  id VARCHAR PRIMARY KEY,
  consultant_id VARCHAR REFERENCES consultants(id),
  legal_first_name VARCHAR NOT NULL,
  legal_last_name VARCHAR NOT NULL,
  middle_initial VARCHAR(1),
  ssn_encrypted VARCHAR, -- AES-256 encrypted
  date_of_birth DATE,
  gender VARCHAR,
  signature_data TEXT,
  signature_date TIMESTAMP,
  ip_address VARCHAR,
  status VARCHAR DEFAULT 'draft', -- draft, submitted, approved
  submitted_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Gap 5: TB Test 2-Step Tracking 🟡 P1-High

**Business Requirement:**
- 2-Step PPD (Mantoux) skin test OR
- Single QuantiFERON-TB Gold blood test
- Valid for 12 months
- Positive results require chest X-ray clearance

**Platform Status:**
- ✅ Document upload exists
- 🔴 MISSING: TB test type tracking (2-step vs blood test)
- 🔴 MISSING: Step 1 and Step 2 date tracking
- 🔴 MISSING: Result tracking (positive/negative)
- 🔴 MISSING: Chest X-ray follow-up for positive results

**Implementation Required:**
```sql
-- Add TB-specific fields to immunization_records or create dedicated table
ALTER TABLE immunization_records ADD COLUMN tb_test_type VARCHAR; -- ppd_2step, quantiferon
ALTER TABLE immunization_records ADD COLUMN tb_step1_date DATE;
ALTER TABLE immunization_records ADD COLUMN tb_step1_result VARCHAR; -- positive, negative
ALTER TABLE immunization_records ADD COLUMN tb_step2_date DATE;
ALTER TABLE immunization_records ADD COLUMN tb_step2_result VARCHAR;
ALTER TABLE immunization_records ADD COLUMN chest_xray_date DATE;
ALTER TABLE immunization_records ADD COLUMN chest_xray_result VARCHAR;
```

---

### Gap 6: Reference Tracking 🟡 P1-High

**Business Requirement:**
- 3 professional references required
- Reference verification tracking
- Contact information and relationship

**Platform Status:**
- 🔴 MISSING: References table
- 🔴 MISSING: Verification status tracking
- 🔴 MISSING: Reference contact workflow

**Implementation Required:**
```sql
CREATE TABLE consultant_references (
  id VARCHAR PRIMARY KEY,
  consultant_id VARCHAR REFERENCES consultants(id),
  reference_name VARCHAR NOT NULL,
  company VARCHAR,
  title VARCHAR,
  relationship VARCHAR, -- supervisor, colleague, client
  phone VARCHAR,
  email VARCHAR,
  years_known INTEGER,
  verification_status VARCHAR DEFAULT 'pending', -- pending, verified, unable_to_reach
  verified_by VARCHAR REFERENCES users(id),
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Gap 7: Direct Deposit Form 🟡 P1-High

**Business Requirement:**
- Bank name, routing number, account number
- Account type (checking/savings)
- Voided check or bank letter upload
- Signature authorization

**Platform Status:**
- 🔴 MISSING: Direct deposit table
- 🔴 MISSING: Bank information fields (encrypted)
- 🔴 MISSING: Voided check document type

**Implementation Required:**
```sql
CREATE TABLE direct_deposit_info (
  id VARCHAR PRIMARY KEY,
  consultant_id VARCHAR REFERENCES consultants(id),
  bank_name VARCHAR,
  routing_number_encrypted VARCHAR, -- AES-256
  account_number_encrypted VARCHAR, -- AES-256
  account_type VARCHAR, -- checking, savings
  document_id VARCHAR REFERENCES consultant_documents(id),
  signature_data TEXT,
  signature_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Gap 8: Employee Handbook Acknowledgment 🟢 P2-Medium

**Business Requirement:**
- Handbook distribution tracking
- Read acknowledgment signature
- Date acknowledged

**Platform Status:**
- ✅ Contracts module with signatures
- 🔴 MISSING: Handbook as document type
- 🔴 MISSING: Acknowledgment tracking separate from contracts

**Implementation Required:**
- Add "Employee Handbook" as document type
- Add acknowledgment workflow to onboarding tasks
- Track signature via existing e-sign system

---

### Gap 9: Consultant Headshot 🟢 P2-Medium

**Business Requirement:**
- Current professional headshot
- Used for client credentialing badges

**Platform Status:**
- ✅ `profile_image_url` exists in users table
- 🔴 MISSING: "Headshot" as required document type
- 🔴 MISSING: Headshot approval workflow

**Implementation Required:**
- Add "Headshot" document type with approval workflow
- Link approved headshot to profile image

---

### Gap 10: Offer Letter Template System 🟢 P2-Medium

**Business Requirement:**
- Multiple vendor templates (JBI, CSI, Ellit, Divurgent)
- Merge fields for consultant/project data
- Per diem tier in offer
- E-signature ready

**Platform Status:**
- ✅ Contracts module exists
- ✅ E-sign compliance
- 🔴 MISSING: Offer letter template builder
- 🔴 MISSING: Merge field system
- 🔴 MISSING: Vendor-specific templates

**Implementation Required:**
```sql
CREATE TABLE offer_letter_templates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  vendor VARCHAR, -- nicehr, jbi, csi, ellit, divurgent
  html_content TEXT NOT NULL,
  merge_fields JSONB, -- available merge fields
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Gap 11: Hospital-Specific Requirements Matrix 🟢 P3-Low

**Business Requirement:**
- Different hospitals have different immunization requirements
- Some require flu declination, others mandatory
- COVID booster requirements vary

**Platform Status:**
- 🔴 MISSING: Hospital requirements configuration
- 🔴 MISSING: Requirement-to-hospital mapping

**Implementation Required:**
```sql
CREATE TABLE hospital_requirements (
  id VARCHAR PRIMARY KEY,
  hospital_id VARCHAR REFERENCES hospitals(id),
  requirement_type VARCHAR, -- immunization, background, drug_screen, training
  requirement_name VARCHAR,
  is_mandatory BOOLEAN DEFAULT true,
  allows_declination BOOLEAN DEFAULT false,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Gap 12: Expense Submission Deadline Tracking 🟢 P3-Low

**Business Requirement:**
- Weekly deadline: Monday 12 PM ET
- Final deadline: 2 weeks from incurred
- Late submissions = no reimbursement

**Platform Status:**
- ✅ Expense submission exists
- 🔴 MISSING: Deadline enforcement
- 🔴 MISSING: Late submission flagging

**Implementation Required:**
- Add `submission_deadline` field to expenses
- Add validation preventing late submissions
- Add warning notifications before deadline

---

## Platform Capabilities (Already Exists)

| Feature | Table/Field | Status |
|---------|-------------|--------|
| Emergency Contact | `consultants.emergency_contact_*` | ✅ Complete |
| Background Check | `consultants.background_check_complete` | ✅ Complete |
| Drug Screen | `consultants.drug_screen_complete` | ✅ Complete |
| Document Upload | `consultant_documents` | ✅ Complete |
| Document Types | `document_types` | ✅ Complete |
| Onboarding Tasks | `onboarding_tasks` | ✅ Complete |
| Travel Preferences | `travel_preferences` | ✅ Complete |
| Travel Bookings | `travel_bookings` | ✅ Complete |
| Expense Tracking | `expenses` | ✅ Complete |
| Per Diem Policies | `per_diem_policies` | ✅ Partial |
| Identity Documents | `identity_documents` | ✅ Complete |
| Certifications | `consultant_certifications` | ✅ Complete |
| E-Sign Compliance | `esign_*` tables | ✅ Complete |
| Contracts | `contracts` | ✅ Complete |

---

## Priority Matrix Summary

| Gap | Priority | Complexity | Business Impact |
|-----|----------|------------|-----------------|
| 1. Immunization Series Tracking | P0 | High | Critical - compliance |
| 2. Per Diem Tier Assignment | P0 | Medium | Critical - affects pay |
| 3. Travel Expense Limits | P1 | Medium | High - cost control |
| 4. Employment Application Form | P1 | Medium | High - onboarding |
| 5. TB Test 2-Step Tracking | P1 | Low | High - compliance |
| 6. Reference Tracking | P1 | Low | High - onboarding |
| 7. Direct Deposit Form | P1 | Medium | High - payroll |
| 8. Handbook Acknowledgment | P2 | Low | Medium - compliance |
| 9. Consultant Headshot | P2 | Low | Medium - credentialing |
| 10. Offer Letter Templates | P2 | High | Medium - efficiency |
| 11. Hospital Requirements Matrix | P3 | Medium | Low - flexibility |
| 12. Expense Deadline Tracking | P3 | Low | Low - process |

---

## Implementation Roadmap

### Phase 1: Critical (Sprint 1-2)
- [ ] Gap 1: Immunization Series Tracking
- [ ] Gap 2: Per Diem Tier Assignment

### Phase 2: High Priority (Sprint 3-4)
- [ ] Gap 3: Travel Expense Limits
- [ ] Gap 4: Employment Application Form
- [ ] Gap 5: TB Test 2-Step Tracking
- [ ] Gap 6: Reference Tracking
- [ ] Gap 7: Direct Deposit Form

### Phase 3: Medium Priority (Sprint 5-6)
- [ ] Gap 8: Handbook Acknowledgment
- [ ] Gap 9: Consultant Headshot
- [ ] Gap 10: Offer Letter Templates

### Phase 4: Low Priority (Backlog)
- [ ] Gap 11: Hospital Requirements Matrix
- [ ] Gap 12: Expense Deadline Tracking

---

## Test Requirements

Each gap implementation requires:

1. **Database Migrations**
   - Schema changes
   - Seed data for testing

2. **API Endpoints**
   - CRUD operations
   - Validation logic

3. **UI Components**
   - Forms and displays
   - Validation feedback

4. **E2E Tests**
   - Happy path
   - Edge cases
   - Error handling

---

*Document created: 2026-02-01*
*Source: NICEHR business documents from Onboarding folder*
*Analyzed against: NiceHR platform schema.ts*
