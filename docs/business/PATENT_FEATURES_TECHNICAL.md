# NiceHR Potentially Patentable Features - Technical Specification

## For Patent Attorney Review

**Prepared:** January 18, 2026
**Company:** TNG / MDX Vision
**Product:** NiceHR - EHR Implementation Consulting Management Platform

---

## Table of Contents

1. [TDR Go-Live Readiness System](#1-tdr-go-live-readiness-system)
2. [Smart Consultant Matching Algorithm](#2-smart-consultant-matching-algorithm)
3. [ESIGN Compliance Wizard](#3-esign-compliance-wizard)

---

## 1. TDR Go-Live Readiness System

### Overview

The Technical Dress Rehearsal (TDR) module is a comprehensive system for preparing healthcare organizations for Electronic Health Record (EHR) system go-live events. It provides automated readiness assessment through a weighted scoring algorithm.

### Problem Solved

EHR implementations frequently fail or experience significant issues during go-live due to inadequate preparation assessment. Traditional methods rely on subjective checklists without quantitative readiness metrics.

### Technical Solution

A multi-factor weighted scoring algorithm that automatically calculates go-live readiness based on:
- Checklist completion status
- Test scenario pass rates
- Integration test results
- Issue severity and blockers
- Support infrastructure readiness

### Core Algorithm: Readiness Score Calculation

```
Location: server/routes/tdr.ts (lines 898-965)
```

#### Algorithm Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    TDR READINESS CALCULATION                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Data Collection                                        │
│  ├── Query checklist items for project                          │
│  ├── Query test scenarios for project                           │
│  ├── Query integration tests for project                        │
│  ├── Query open issues (filtered by status != resolved)         │
│  └── Calculate completion counts for each category              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Category Score Calculation                             │
│                                                                 │
│  Technical Score = (integrationsPassed / integrationsTotal) × 100│
│  Data Score = (checklistComplete / checklistTotal) × 100        │
│  Staff Score = Training completion percentage (from system)     │
│  Support Score = (supportChecklistComplete / supportTotal) × 100│
│  Process Score = (testsPassed / testsTotal) × 100               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Weighted Average Calculation                           │
│                                                                 │
│  Overall Score = (Technical × 0.30) +                           │
│                  (Data × 0.20) +                                 │
│                  (Staff × 0.25) +                                │
│                  (Support × 0.15) +                              │
│                  (Process × 0.10)                                │
│                                                                 │
│  Weights: Technical=30%, Data=20%, Staff=25%,                   │
│           Support=15%, Process=10%                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: Recommendation Engine                                  │
│                                                                 │
│  IF overallScore >= 90 AND criticalIssues == 0:                │
│      recommendation = "GO"                                      │
│  ELSE IF overallScore >= 80:                                   │
│      recommendation = "CONDITIONAL_GO"                          │
│  ELSE:                                                          │
│      recommendation = "NO_GO"                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OUTPUT: Readiness Score Object                                 │
│  {                                                              │
│    technicalScore, dataScore, staffScore,                       │
│    supportScore, processScore, overallScore,                    │
│    recommendation, criticalIssuesCount, highIssuesCount         │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Technical Components

#### 1. Multi-Dimensional Assessment Categories

| Category | Data Source | Weight | Description |
|----------|-------------|--------|-------------|
| Technical | Integration Tests | 30% | Interface/system connectivity validation |
| Data | Checklist Items | 20% | Data migration and validation status |
| Staff | Training Records | 25% | End-user training completion |
| Support | Support Checklist | 15% | Command center and help desk readiness |
| Process | Test Scenarios | 10% | Workflow validation results |

#### 2. Issue Severity Impact

The algorithm tracks critical issues separately:
- **Critical Issues**: Block go-live recommendation regardless of score
- **High Issues**: Tracked for conditional go decisions
- **Blocker Flag**: Explicit "blocks go-live" boolean per issue

#### 3. TDR Event Management

```
Database Schema: tdrEvents
├── id (UUID)
├── projectId (reference)
├── name
├── eventType (mock_go_live | dress_rehearsal | final_tdr)
├── scheduledDate
├── status (scheduled | in_progress | completed | cancelled)
└── readinessScoreId (reference to calculated score)
```

#### 4. Automatic Issue-to-Ticket Conversion

```
Endpoint: POST /api/tdr/issues/:id/create-ticket

Process:
1. Retrieve TDR issue by ID
2. Map TDR severity → Support ticket priority
   - critical → high
   - high → high
   - medium → medium
   - low → low
3. Map TDR category → Support ticket category
   - technical → technical
   - workflow → workflow
   - integration → integration
   - data → data_issue
4. Create support ticket with TDR context embedded
5. Link TDR issue to created ticket (bi-directional)
```

### Novel Technical Claims (For Attorney Review)

1. **Weighted Multi-Factor Readiness Algorithm**: Automated go-live readiness calculation using weighted category scores specific to EHR implementations

2. **Healthcare-Specific Category Weighting**: Technical integrations weighted highest (30%) reflecting critical nature of healthcare system interfaces

3. **Blocker-Aware Recommendation Engine**: Binary blocker detection that overrides numerical scores for safety-critical decisions

4. **Bi-Directional Issue-Ticket Linking**: Automatic conversion of TDR issues to support tickets while maintaining traceability

---

## 2. Smart Consultant Matching Algorithm

### Overview

An intelligent matching system that pairs healthcare IT support requests with the most appropriate consultant based on multiple weighted factors including expertise, relationship history, and workload balancing.

### Problem Solved

Healthcare organizations need specialized EHR support, but manual consultant assignment leads to:
- Suboptimal expertise matching
- Consultant burnout from uneven distribution
- Loss of relationship continuity benefits

### Technical Solution

A scoring algorithm that evaluates available consultants against support requests using weighted factors.

### Core Algorithm

```
Location: remote-support/server/src/services/matching.ts
```

#### Algorithm Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│              CONSULTANT MATCHING ALGORITHM                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  INPUT: Support Request                                         │
│  {                                                              │
│    staffId: requesting user                                     │
│    hospitalId: requesting organization                          │
│    department: clinical department needing support              │
│    preferredConsultantId?: optional preference                  │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Get Available Consultants                              │
│  └── Query availability table for consultants                   │
│      with status = "available"                                  │
│                                                                 │
│  IF availableList.length == 0:                                 │
│      RETURN null (no consultants available)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Calculate Score for Each Consultant                    │
│                                                                 │
│  FOR EACH available consultant:                                 │
│      score = 0                                                  │
│      reasons = []                                               │
│                                                                 │
│      ┌─────────────────────────────────────────────────────┐   │
│      │  A. Department Specialty Check                       │   │
│      │  IF specialty.proficiency == "expert":              │   │
│      │      score += 30                                     │   │
│      │      reasons.push("Department expert (+30)")         │   │
│      │  ELSE IF specialty.proficiency == "standard":       │   │
│      │      score += 15                                     │   │
│      │      reasons.push("Department experience (+15)")     │   │
│      └─────────────────────────────────────────────────────┘   │
│                                                                 │
│      ┌─────────────────────────────────────────────────────┐   │
│      │  B. Relationship/Preference Check                    │   │
│      │  IF preference exists:                               │   │
│      │      IF successful_sessions == 0:                   │   │
│      │          score += 40  // Favorited but no sessions   │   │
│      │          reasons.push("Favorite consultant (+40)")   │   │
│      │      ELSE:                                           │   │
│      │          score += 50  // Has previous sessions       │   │
│      │          reasons.push("Previous relationship (+50)") │   │
│      │          IF avg_rating >= 4:                        │   │
│      │              score += 20                             │   │
│      │              reasons.push("High rating (+20)")       │   │
│      └─────────────────────────────────────────────────────┘   │
│                                                                 │
│      ┌─────────────────────────────────────────────────────┐   │
│      │  C. Rotation/Workload Balancing                      │   │
│      │  rotationPenalty = sessions_today × 10               │   │
│      │  IF rotationPenalty > 0:                            │   │
│      │      score -= rotationPenalty                        │   │
│      │      reasons.push("Rotation balance (-penalty)")     │   │
│      └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Sort and Select Best Match                             │
│                                                                 │
│  scores.sort((a, b) => b.score - a.score)                      │
│  bestMatch = scores[0]                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  OUTPUT: Match Result                                           │
│  {                                                              │
│    consultant: { id, name, email },                             │
│    reasons: [array of scoring explanations]                     │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Scoring Matrix

| Factor | Points | Condition |
|--------|--------|-----------|
| Department Expert | +30 | Consultant has "expert" proficiency in requested department |
| Department Experience | +15 | Consultant has "standard" proficiency in requested department |
| Favorite Consultant | +40 | User marked as favorite but no prior sessions |
| Previous Relationship | +50 | Has completed sessions with this user before |
| High Rating Bonus | +20 | Average rating ≥ 4.0 from previous sessions |
| Rotation Penalty | -10 per session | Reduces score based on sessions already handled today |

### Example Scoring Scenario

```
Request: Emergency department support at Hospital A
User has worked with Consultant X before (4.5 avg rating)

Consultant X Score Calculation:
  + Department expert:        +30
  + Previous relationship:    +50
  + High rating bonus:        +20
  - 2 sessions today:         -20
  ────────────────────────────────
  TOTAL:                       80

Consultant Y Score Calculation:
  + Department experience:    +15
  + (no relationship):         +0
  - 0 sessions today:          -0
  ────────────────────────────────
  TOTAL:                       15

RESULT: Consultant X selected (score 80 > 15)
```

### Novel Technical Claims (For Attorney Review)

1. **Multi-Factor Healthcare Consultant Matching**: Algorithm combining expertise level, relationship history, and workload balancing for healthcare IT support assignment

2. **Relationship-Aware Scoring**: Bonus points for established consultant-user relationships with rating-based adjustment

3. **Dynamic Workload Balancing**: Real-time penalty system based on current-day session count to prevent consultant burnout

4. **Transparent Scoring Explanation**: Returns human-readable reasons array explaining why each consultant was scored as they were

---

## 3. ESIGN Compliance Wizard

### Overview

A 4-step electronic signature workflow that ensures legal compliance with the ESIGN Act (15 U.S.C. § 7001) and UETA through technical implementation of consent tracking, document hashing, intent confirmation, and certificate generation.

### Problem Solved

Electronic signatures in healthcare require strict legal compliance. Generic e-signature solutions often lack:
- Verifiable consent documentation
- Tamper-evident document integrity
- Clear intent confirmation
- Complete audit trails

### Technical Solution

A structured 4-step signing process with cryptographic verification at each stage.

### Process Flow

```
Location: server/routes/esign.ts
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESIGN COMPLIANCE WIZARD                       │
│                      4-Step Process Flow                         │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║  STEP 1: CONSENT                                                  ║
║  Endpoint: POST /contracts/:id/esign/consent                      ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  User must acknowledge 3 checkboxes:                              ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ □ I meet the hardware/software requirements                 │ ║
║  │ □ I understand my right to paper copies                     │ ║
║  │ □ I understand my right to withdraw consent                 │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  System Records:                                                  ║
║  • Consent timestamp (ISO 8601)                                   ║
║  • IP address (X-Forwarded-For or socket)                         ║
║  • User agent string                                              ║
║  • Disclosure text version                                        ║
║  • SHA-256 hash of disclosure text                                ║
║                                                                   ║
║  Validation: ALL THREE checkboxes required = true                 ║
╚═══════════════════════════════════════════════════════════════════╝
                              │
                              ▼
╔═══════════════════════════════════════════════════════════════════╗
║  STEP 2: DOCUMENT REVIEW                                          ║
║  Endpoints: POST /esign/review-start, PATCH /esign/review-progress║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Tracking Metrics:                                                ║
║  • Review started timestamp                                       ║
║  • Page view count                                                ║
║  • Maximum scroll percentage reached                              ║
║  • Scrolled to bottom (boolean)                                   ║
║  • Review duration (seconds)                                      ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │  Scroll Tracking Algorithm:                                 │ ║
║  │                                                             │ ║
║  │  ON scroll event:                                           │ ║
║  │    currentScroll = window.scrollY + window.innerHeight      │ ║
║  │    scrollPercent = (currentScroll / document.height) × 100  │ ║
║  │    maxScrollPercent = MAX(stored, scrollPercent)            │ ║
║  │    IF scrollPercent >= 95:                                  │ ║
║  │        scrolledToBottom = true                              │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════╝
                              │
                              ▼
╔═══════════════════════════════════════════════════════════════════╗
║  STEP 3: SIGN WITH INTENT CONFIRMATION                            ║
║  Endpoint: POST /contracts/:id/esign/sign                         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Required Inputs:                                                 ║
║  • signatureData (base64 signature image from canvas)             ║
║  • typedName (must match signer's name)                           ║
║  • intentConfirmed (checkbox: "I intend this to be legally        ║
║    binding")                                                      ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │  Document Hash Generation:                                  │ ║
║  │                                                             │ ║
║  │  function computeDocumentHash(content: string): string {    │ ║
║  │    return crypto.createHash('sha256')                       │ ║
║  │      .update(content)                                       │ ║
║  │      .digest('hex');                                        │ ║
║  │  }                                                          │ ║
║  │                                                             │ ║
║  │  Hash stored for tamper detection                           │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │  Typed Name Verification:                                   │ ║
║  │                                                             │ ║
║  │  typedNameMatch = typedName.toLowerCase().trim()            │ ║
║  │                   === expectedName.toLowerCase().trim()     │ ║
║  │                                                             │ ║
║  │  Stored for audit even if no exact match                    │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════════════╝
                              │
                              ▼
╔═══════════════════════════════════════════════════════════════════╗
║  STEP 4: CERTIFICATE GENERATION                                   ║
║  Automatic upon successful signing                                ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Certificate Number Format:                                       ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │  NICEHR-YYYYMMDD-XXXXXX                                     │ ║
║  │                                                             │ ║
║  │  Example: NICEHR-20260118-A7BK3M                            │ ║
║  │                                                             │ ║
║  │  Generation:                                                │ ║
║  │  function generateCertificateNumber(): string {             │ ║
║  │    const date = new Date();                                 │ ║
║  │    const dateStr = date.toISOString()                       │ ║
║  │      .slice(0,10).replace(/-/g,'');                         │ ║
║  │    const random = Math.random()                             │ ║
║  │      .toString(36).substring(2,8).toUpperCase();            │ ║
║  │    return `NICEHR-${dateStr}-${random}`;                    │ ║
║  │  }                                                          │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  Certificate Contains:                                            ║
║  • Certificate number (unique identifier)                         ║
║  • Signer name and email                                          ║
║  • Document title                                                 ║
║  • Document SHA-256 hash                                          ║
║  • Signing timestamp                                              ║
║  • IP address and user agent                                      ║
║  • Consent timestamp reference                                    ║
║  • Review metrics (duration, scroll %)                            ║
║  • ESIGN Act compliance flag                                      ║
║  • UETA compliance flag                                           ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Database Schema

```sql
-- 5 ESIGN-specific tables

esign_consents
├── id (UUID)
├── signer_id (FK)
├── contract_id (FK)
├── consent_given (boolean)
├── consent_timestamp (timestamp)
├── hardware_software_acknowledged (boolean)
├── paper_copy_right_acknowledged (boolean)
├── consent_withdrawal_acknowledged (boolean)
├── disclosure_text_version (string)
├── disclosure_text_hash (SHA-256)
├── ip_address (string)
└── user_agent (string)

esign_document_hashes
├── id (UUID)
├── contract_id (FK)
├── signature_id (FK)
├── document_hash_sha256 (string)
├── hash_algorithm (string = "SHA-256")
├── document_version (integer)
├── content_type (string)
└── computed_at (timestamp)

esign_intent_confirmations
├── id (UUID)
├── signature_id (FK)
├── intent_checkbox_checked (boolean)
├── intent_statement (string)
├── typed_name_match (boolean)
├── typed_name (string)
├── expected_name (string)
└── confirmed_at (timestamp)

esign_review_tracking
├── id (UUID)
├── signer_id (FK)
├── contract_id (FK)
├── document_presented_at (timestamp)
├── review_started_at (timestamp)
├── review_completed_at (timestamp)
├── review_duration_seconds (integer)
├── scrolled_to_bottom (boolean)
├── max_scroll_percentage (integer)
└── page_view_count (integer)

esign_certificates
├── id (UUID)
├── signature_id (FK)
├── contract_id (FK)
├── certificate_number (string, unique)
├── signer_name (string)
├── signer_email (string)
├── document_title (string)
├── document_hash_sha256 (string)
├── signed_at (timestamp)
├── signer_ip_address (string)
├── signer_user_agent (string)
├── certificate_data (JSON)
├── esign_act_compliant (boolean)
└── ueta_compliant (boolean)
```

### Document Integrity Verification

```
Endpoint: GET /contracts/:id/esign/verify

Process:
1. Retrieve current contract content
2. Compute SHA-256 hash of current content
3. Compare against all stored signature hashes
4. Return verification status for each signature

Response:
{
  verified: boolean,
  message: "Document integrity verified" | "WARNING: Modified",
  verificationResults: [
    {
      signatureId: "...",
      storedHash: "abc123...",
      currentHash: "abc123...",
      verified: true
    }
  ]
}
```

### Novel Technical Claims (For Attorney Review)

1. **4-Step ESIGN Compliance Workflow**: Structured electronic signature process enforcing consent → review → intent → certificate sequence

2. **3-Checkbox Consent Validation**: Technical implementation requiring explicit acknowledgment of hardware/software requirements, paper copy rights, and withdrawal rights before proceeding

3. **Document Review Tracking with Scroll Detection**: Automated tracking of document review behavior including scroll percentage, duration, and bottom-reached detection

4. **SHA-256 Document Hashing for Tamper Evidence**: Cryptographic hash computed at signing time and stored for later integrity verification

5. **Typed Name Verification**: Comparison of typed name against expected signer name with match status recorded

6. **Unique Certificate Number Generation**: Date-stamped certificate identifiers with format NICEHR-YYYYMMDD-XXXXXX

7. **Complete Audit Trail API**: Single endpoint returning all ESIGN compliance data (consents, reviews, hashes, certificates, events)

---

## Summary: Patentability Assessment

| Feature | Technical Novelty | Prior Art Risk | Recommendation |
|---------|------------------|----------------|----------------|
| TDR Readiness Algorithm | High - Healthcare-specific weighted scoring | Medium - General project management tools exist | **File Provisional** |
| Consultant Matching | Medium - Scoring with relationship awareness | Medium-High - Similar matching systems exist | **Further Research** |
| ESIGN Wizard | Medium - Specific 4-step implementation | High - Many e-signature solutions exist | **Trade Secret** |

### Recommended Next Steps

1. **TDR Module**: Strongest candidate. File provisional patent focusing on:
   - Healthcare-specific weighted categories
   - Blocker-aware recommendation engine
   - Integration with support ticketing

2. **Matching Algorithm**: Conduct prior art search on:
   - Healthcare consultant matching systems
   - Relationship-aware workforce assignment
   - Dynamic workload balancing

3. **ESIGN Wizard**: Consider trade secret protection rather than patent due to:
   - Many existing e-signature patents
   - Implementation is compliance-driven
   - Value is in specific integration, not algorithm

---

## Appendix: Source Code References

| Component | File Path | Key Lines |
|-----------|-----------|-----------|
| TDR Routes | `server/routes/tdr.ts` | Full file (968 lines) |
| TDR Readiness Algorithm | `server/routes/tdr.ts` | Lines 898-965 |
| TDR Default Checklist | `server/routes/tdr.ts` | Lines 840-896 |
| Consultant Matching | `remote-support/server/src/services/matching.ts` | Full file (96 lines) |
| ESIGN Routes | `server/routes/esign.ts` | Full file (800 lines) |
| ESIGN Consent | `server/routes/esign.ts` | Lines 94-199 |
| ESIGN Signing | `server/routes/esign.ts` | Lines 373-632 |
| ESIGN Verification | `server/routes/esign.ts` | Lines 638-696 |

---

*This document is prepared for patent attorney review. All code excerpts and algorithms are proprietary to TNG/MDX Vision.*
