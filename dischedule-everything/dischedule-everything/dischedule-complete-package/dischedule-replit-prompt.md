# DiSChedule - Comprehensive Development Prompt for Replit

## Project Overview

**PROJECT NAME:** DiSChedule

**PROJECT DESCRIPTION:**
Build a comprehensive workforce optimization and team composition platform that combines DiSC behavioral assessments with skills matching to create high-performing teams. The platform serves three user types: consulting firms managing external talent deployments, organizations managing internal workforce scheduling, and administrators overseeing the system. The initial use case is healthcare IT consulting (pre-go-live through post-go-live project staffing) but the architecture must be industry-agnostic and configurable for any project-based or shift-based workforce scenario.

---

## Tech Stack Recommendation

| Layer | Technology |
|-------|------------|
| Frontend | React with TypeScript, Tailwind CSS, Shadcn/ui component library |
| Backend | Node.js with Express or Python with FastAPI |
| Database | PostgreSQL with Prisma ORM (or SQLAlchemy if Python) |
| Authentication | Clerk or Auth0 for multi-tenant auth |
| File Storage | AWS S3 or Cloudflare R2 for assessment reports and documents |
| Real-time | Socket.io for live collaboration features |
| Deployment | Replit with PostgreSQL database |

---

## Core Data Models

### Organization (Multi-tenant foundation)

```
org_id              UUID PRIMARY KEY
name                STRING
industry_type       ENUM: healthcare, manufacturing, professional_services, 
                    financial_services, technology, retail, government, 
                    education, custom
organization_type   ENUM: consulting_firm, enterprise, hospital_system, 
                    staffing_agency
subscription_tier   ENUM: starter, professional, enterprise
logo_url            STRING
primary_color       STRING (for white-labeling)
secondary_color     STRING (for white-labeling)
custom_terminology  JSON (allows orgs to rename "projects" to "engagements" or "shifts")
settings            JSON (feature flags, default weights, notification preferences)
billing_email       STRING
billing_status      STRING
created_at          TIMESTAMP
updated_at          TIMESTAMP
trial_ends_at       TIMESTAMP (for new customers)
```

### Division/Department

```
division_id         UUID PRIMARY KEY
org_id              UUID FOREIGN KEY -> Organization
name                STRING
division_type       STRING (configurable per industry)
parent_division_id  UUID FOREIGN KEY -> Division (self-reference for hierarchy)
cost_center_code    STRING (for enterprise billing allocation)
manager_person_id   UUID FOREIGN KEY -> Person
custom_attributes   JSON
is_active           BOOLEAN
```

### Person

```
person_id               UUID PRIMARY KEY
org_id                  UUID FOREIGN KEY -> Organization
email                   STRING UNIQUE (per org)
first_name              STRING
last_name               STRING
profile_photo_url       STRING
role_title              STRING
employment_type         ENUM: full_time, part_time, contractor, consultant, temporary
home_division_id        UUID FOREIGN KEY -> Division
manager_id              UUID FOREIGN KEY -> Person (self-reference)
hire_date               DATE
hourly_rate             DECIMAL (encrypted)
day_rate                DECIMAL (encrypted)
availability_status     ENUM: available, partially_available, unavailable, on_leave
availability_notes      STRING
time_zone               STRING
location_city           STRING
location_state          STRING
location_country        STRING
remote_eligible         BOOLEAN
travel_eligible         BOOLEAN
max_travel_percent      INTEGER
notification_preferences JSON
last_active_at          TIMESTAMP
is_active               BOOLEAN
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### DiSC_Assessment

```
assessment_id           UUID PRIMARY KEY
person_id               UUID FOREIGN KEY -> Person
assessment_date         DATE
assessor_id             UUID FOREIGN KEY -> Person (your certified DiSC professional)
assessment_source       ENUM: official_disc, internal_assessment, self_reported, imported
primary_style           ENUM: D, i, S, C
secondary_style         ENUM: D, i, S, C, NULL
d_score                 DECIMAL (0-100)
i_score                 DECIMAL (0-100)
s_score                 DECIMAL (0-100)
c_score                 DECIMAL (0-100)
style_blend             STRING (e.g., "Di", "SC", "iS")
detailed_profile        JSON (stores nuanced insights from assessment)
strengths               TEXT[]
growth_areas            TEXT[]
communication_preferences JSON
stress_behaviors        JSON
motivators              JSON
report_file_url         STRING (link to full PDF report)
assessor_notes          TEXT
valid_until             DATE (assessments may need refresh)
is_current              BOOLEAN (only one current assessment per person)
created_at              TIMESTAMP
```

### DiSC_Style_Descriptor (Reference table)

```
style               ENUM: D, i, S, C PRIMARY KEY
style_name          STRING (Dominance, Influence, Steadiness, Conscientiousness)
description         TEXT
priorities          TEXT[]
motivated_by        TEXT[]
fears               TEXT[]
limitations         TEXT[]
communication_tips  TEXT[]
under_stress        TEXT
ideal_environment   TEXT
```

### DiSC_Pairing_Guidance (Reference table for pairwise compatibility)

```
pairing_id              UUID PRIMARY KEY
style_a                 ENUM: D, i, S, C
style_b                 ENUM: D, i, S, C
compatibility_base_score INTEGER (1-100)
strengths_together      TEXT[]
potential_friction      TEXT[]
collaboration_tips      TEXT[]
manager_report_tips     TEXT (when A manages B)
reverse_manager_tips    TEXT (when B manages A)
```

### Skill

```
skill_id                    UUID PRIMARY KEY
person_id                   UUID FOREIGN KEY -> Person
taxonomy_skill_id           UUID FOREIGN KEY -> Skill_Taxonomy
proficiency_level           ENUM: beginner, intermediate, advanced, expert
years_experience            DECIMAL
last_used_date              DATE
is_certified                BOOLEAN
certification_name          STRING
certification_issuer        STRING
certification_number        STRING
certification_earned_date   DATE
certification_expiry_date   DATE
certification_document_url  STRING
verified                    BOOLEAN
verified_by_person_id       UUID FOREIGN KEY -> Person
verified_date               DATE
self_rating                 INTEGER (1-10)
peer_rating_avg             DECIMAL (calculated from peer endorsements)
notes                       TEXT
created_at                  TIMESTAMP
updated_at                  TIMESTAMP
```

### Skill_Taxonomy

```
taxonomy_skill_id       UUID PRIMARY KEY
org_id                  UUID FOREIGN KEY -> Organization (null for global/system skills)
skill_name              STRING
skill_category          ENUM: technical, clinical, soft_skill, industry_specific, 
                        tool, methodology, language, domain
parent_skill_id         UUID FOREIGN KEY -> Skill_Taxonomy (for skill hierarchy)
description             TEXT
industry_tags           STRING[]
keywords                STRING[] (for search)
requires_certification  BOOLEAN
certification_bodies    STRING[]
is_active               BOOLEAN
created_at              TIMESTAMP
```

### Project

```
project_id                  UUID PRIMARY KEY
org_id                      UUID FOREIGN KEY -> Organization
client_org_id               UUID FOREIGN KEY -> Organization (null if internal project)
project_name                STRING
project_code                STRING (for time tracking integration)
description                 TEXT
project_type                ENUM: implementation, optimization, support, training, 
                            assessment, migration, integration, custom
industry_context            STRING (allows more specific than org industry)
phase                       ENUM: planning, discovery, design, build, testing, 
                            pre_go_live, go_live, post_go_live, stabilization, 
                            optimization, closed
phase_history               JSON[] (tracks phase transitions with dates)
status                      ENUM: draft, active, on_hold, completed, cancelled
priority                    ENUM: low, medium, high, critical
start_date                  DATE
end_date                    DATE
actual_start_date           DATE
actual_end_date             DATE
location_type               ENUM: remote, onsite, hybrid
location_address            STRING
required_team_size_min      INTEGER
required_team_size_max      INTEGER
budget_hours                DECIMAL
budget_amount               DECIMAL (encrypted)
project_manager_person_id   UUID FOREIGN KEY -> Person
client_contact_name         STRING
client_contact_email        STRING
success_criteria            TEXT
risks                       JSON[]
custom_requirements         JSON
required_skill_ids          JSON[] (array of taxonomy_skill_ids with min proficiency)
preferred_disc_composition  JSON (ideal style distribution)
tags                        STRING[]
created_by_person_id        UUID FOREIGN KEY -> Person
created_at                  TIMESTAMP
updated_at                  TIMESTAMP
```

### Project_Phase_Template

```
template_id                 UUID PRIMARY KEY
org_id                      UUID FOREIGN KEY -> Organization (null for system defaults)
industry_type               ENUM
phase_name                  STRING
phase_order                 INTEGER
description                 TEXT
typical_duration_days       INTEGER
recommended_disc_weights    JSON (e.g., {"D": 0.3, "i": 0.2, "S": 0.25, "C": 0.25})
recommended_skills          UUID[] (array of taxonomy_skill_ids)
deliverables                TEXT[]
is_active                   BOOLEAN
```

### Team

```
team_id                 UUID PRIMARY KEY
project_id              UUID FOREIGN KEY -> Project (null for permanent teams)
org_id                  UUID FOREIGN KEY -> Organization
team_name               STRING
team_type               ENUM: project, permanent, shift, pod, tiger_team, committee
description             TEXT
formation_date          DATE
dissolution_date        DATE (null if ongoing)
status                  ENUM: forming, active, paused, dissolved
target_size             INTEGER
team_lead_person_id     UUID FOREIGN KEY -> Person
compatibility_score     DECIMAL (calculated)
skill_coverage_score    DECIMAL (calculated)
overall_health_score    DECIMAL (calculated composite)
last_analyzed_at        TIMESTAMP
analysis_version        INTEGER (tracks re-analysis)
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### Team_Assignment

```
assignment_id           UUID PRIMARY KEY
team_id                 UUID FOREIGN KEY -> Team
person_id               UUID FOREIGN KEY -> Person
role_on_team            ENUM: lead, co_lead, member, specialist, advisor, observer
role_title_override     STRING (custom title for this assignment)
allocation_percent      INTEGER (100 = full time, 50 = half time)
start_date              DATE
end_date                DATE
status                  ENUM: proposed, confirmed, active, completed, withdrawn
proposed_by_person_id   UUID FOREIGN KEY -> Person
confirmed_by_person_id  UUID FOREIGN KEY -> Person
confirmed_at            TIMESTAMP
withdrawal_reason       TEXT
performance_notes       TEXT (private to admins)
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### Compatibility_Rule

```
rule_id                 UUID PRIMARY KEY
org_id                  UUID FOREIGN KEY -> Organization (null for system defaults)
rule_name               STRING
rule_code               STRING UNIQUE (e.g., "HIGH_D_CONCENTRATION")
description             TEXT
rule_category           ENUM: disc_balance, disc_pairing, skill_gap, capacity, 
                        role_fit, custom
rule_type               ENUM: flag, warning, blocker, suggestion, strength
severity                ENUM: info, low, medium, high, critical
condition_logic         JSON (structured rule definition)
explanation_template    TEXT (with variable placeholders like {count}, {style}, {threshold})
suggestion_template     TEXT
resolution_actions      JSON[] (specific steps to resolve)
applies_to_phases       ENUM[] (which project phases this rule applies to)
industry_tags           STRING[]
weight_in_scoring       DECIMAL (how much this rule affects overall score)
is_active               BOOLEAN
created_by_person_id    UUID FOREIGN KEY -> Person
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### Team_Analysis

```
analysis_id                     UUID PRIMARY KEY
team_id                         UUID FOREIGN KEY -> Team
project_id                      UUID FOREIGN KEY -> Project
analyzed_at                     TIMESTAMP
analysis_type                   ENUM: initial, reassessment, what_if, automated
triggered_by                    ENUM: manual, assignment_change, schedule, rule_update
analyzer_person_id              UUID FOREIGN KEY -> Person (null if automated)
overall_compatibility_score     DECIMAL (0-100)
disc_balance_score              DECIMAL (0-100)
skill_coverage_score            DECIMAL (0-100)
capacity_score                  DECIMAL (0-100)
disc_distribution               JSON (e.g., {"D": 25, "i": 30, "S": 25, "C": 20})
style_intensity_avg             JSON (average scores per style)
pairwise_compatibility_matrix   JSON (grid of person-to-person scores)
skill_coverage_detail           JSON (which required skills are covered at what level)
flags_triggered                 UUID[] (array of rule_ids)
warnings_count                  INTEGER
blockers_count                  INTEGER
suggestions_count               INTEGER
strengths_count                 INTEGER
analysis_summary                TEXT (AI-generated narrative summary)
recommendations                 TEXT[]
comparison_to_previous          JSON (delta from last analysis)
created_at                      TIMESTAMP
```

### Team_Analysis_Insight

```
insight_id              UUID PRIMARY KEY
analysis_id             UUID FOREIGN KEY -> Team_Analysis
rule_id                 UUID FOREIGN KEY -> Compatibility_Rule
insight_type            ENUM: flag, warning, blocker, suggestion, strength
severity                ENUM: info, low, medium, high, critical
title                   STRING
explanation             TEXT (rendered from template with actual values)
suggestion              TEXT (rendered from template)
affected_person_ids     UUID[]
affected_skill_ids      UUID[]
data_snapshot           JSON (the specific data that triggered this insight)
acknowledged            BOOLEAN
acknowledged_by_person_id UUID FOREIGN KEY -> Person
acknowledged_at         TIMESTAMP
resolution_status       ENUM: open, in_progress, resolved, accepted, dismissed
resolution_notes        TEXT
resolved_by_person_id   UUID FOREIGN KEY -> Person
resolved_at             TIMESTAMP
created_at              TIMESTAMP
```

### Candidate_Recommendation

```
recommendation_id           UUID PRIMARY KEY
project_id                  UUID FOREIGN KEY -> Project
team_id                     UUID FOREIGN KEY -> Team
person_id                   UUID FOREIGN KEY -> Person (the recommended candidate)
recommended_at              TIMESTAMP
recommendation_type         ENUM: system_generated, manual_suggestion
overall_score               DECIMAL (0-100)
skill_fit_score             DECIMAL (0-100)
disc_compatibility_score    DECIMAL (0-100)
availability_score          DECIMAL (0-100)
cost_efficiency_score       DECIMAL (0-100)
skill_match_detail          JSON (breakdown of matched skills)
disc_impact_analysis        JSON (how adding this person changes team composition)
projected_team_score_after  DECIMAL (what team score would be if added)
flags_if_added              UUID[] (rule_ids that would trigger)
strengths_if_added          UUID[] (rule_ids)
rank                        INTEGER (position in recommendation list)
status                      ENUM: pending, reviewed, accepted, rejected
reviewed_by_person_id       UUID FOREIGN KEY -> Person
reviewed_at                 TIMESTAMP
rejection_reason            TEXT
notes                       TEXT
created_at                  TIMESTAMP
```

### Schedule

```
schedule_id             UUID PRIMARY KEY
org_id                  UUID FOREIGN KEY -> Organization
schedule_name           STRING
schedule_type           ENUM: project, shift, rotation, on_call
start_date              DATE
end_date                DATE
recurrence_pattern      JSON (for recurring schedules)
time_zone               STRING
status                  ENUM: draft, published, active, archived
created_by_person_id    UUID FOREIGN KEY -> Person
published_at            TIMESTAMP
published_by_person_id  UUID FOREIGN KEY -> Person
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### Schedule_Entry

```
entry_id            UUID PRIMARY KEY
schedule_id         UUID FOREIGN KEY -> Schedule
person_id           UUID FOREIGN KEY -> Person
team_id             UUID FOREIGN KEY -> Team (optional)
project_id          UUID FOREIGN KEY -> Project (optional)
entry_date          DATE
start_time          TIME
end_time            TIME
entry_type          ENUM: regular, overtime, on_call, training, pto, sick
status              ENUM: scheduled, confirmed, completed, cancelled, no_show
location            STRING
notes               TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### Availability

```
availability_id         UUID PRIMARY KEY
person_id               UUID FOREIGN KEY -> Person
availability_type       ENUM: available, unavailable, limited, preference
start_date              DATE
end_date                DATE
start_time              TIME (for partial day availability)
end_time                TIME
recurrence_pattern      JSON (for recurring availability like "no Fridays")
reason                  ENUM: pto, sick, training, personal, project_commitment, other
notes                   TEXT
approved                BOOLEAN
approved_by_person_id   UUID FOREIGN KEY -> Person
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### Training_Record

```
training_id             UUID PRIMARY KEY
person_id               UUID FOREIGN KEY -> Person
training_name           STRING
training_type           ENUM: disc_workshop, skill_training, certification_prep, 
                        onboarding, compliance, custom
provider                STRING
skill_ids_addressed     UUID[] (array of taxonomy_skill_ids)
started_at              TIMESTAMP
completed_at            TIMESTAMP
status                  ENUM: enrolled, in_progress, completed, failed, expired
score                   DECIMAL (if applicable)
passing_score           DECIMAL
certificate_url         STRING
expiry_date             DATE
notes                   TEXT
created_at              TIMESTAMP
```

### Team_Training_Session

```
session_id                  UUID PRIMARY KEY
team_id                     UUID FOREIGN KEY -> Team
session_name                STRING
session_type                ENUM: disc_team_workshop, kickoff, retrospective, 
                            skill_building, custom
facilitator_person_id       UUID FOREIGN KEY -> Person (your DiSC professional)
scheduled_at                TIMESTAMP
duration_minutes            INTEGER
location                    STRING
virtual_meeting_url         STRING
status                      ENUM: scheduled, in_progress, completed, cancelled
pre_session_team_score      DECIMAL (compatibility score before)
post_session_team_score     DECIMAL (measured after if applicable)
attendee_person_ids         UUID[]
materials_urls              STRING[]
session_notes               TEXT
action_items                JSON[]
created_at                  TIMESTAMP
updated_at                  TIMESTAMP
```

### Performance_Metric

```
metric_id           UUID PRIMARY KEY
org_id              UUID FOREIGN KEY -> Organization
metric_name         STRING
metric_code         STRING
description         TEXT
metric_type         ENUM: project, team, individual, training
data_type           ENUM: number, percentage, currency, duration, rating
aggregation_method  ENUM: sum, average, min, max, count
target_value        DECIMAL
target_comparison   ENUM: higher_better, lower_better, target_exact
industry_tags       STRING[]
is_active           BOOLEAN
created_at          TIMESTAMP
```

### Performance_Data

```
data_id                 UUID PRIMARY KEY
metric_id               UUID FOREIGN KEY -> Performance_Metric
entity_type             ENUM: project, team, person
entity_id               UUID (polymorphic reference)
period_start            DATE
period_end              DATE
value                   DECIMAL
context                 JSON (additional context data)
source                  ENUM: manual, integration, calculated
recorded_by_person_id   UUID FOREIGN KEY -> Person
recorded_at             TIMESTAMP
notes                   TEXT
created_at              TIMESTAMP
```

### ROI_Analysis

```
roi_id                      UUID PRIMARY KEY
org_id                      UUID FOREIGN KEY -> Organization
analysis_name               STRING
analysis_period_start       DATE
analysis_period_end         DATE
analysis_type               ENUM: team_composition, training_effectiveness, overall_platform
comparison_type             ENUM: before_after, optimized_vs_random, benchmark
baseline_data               JSON (metrics before optimization or from control group)
optimized_data              JSON (metrics after optimization or from test group)
metrics_compared            UUID[] (array of metric_ids)
improvement_percentages     JSON (per metric)
cost_savings_estimated      DECIMAL
productivity_gain_estimated DECIMAL
methodology_notes           TEXT
conclusions                 TEXT
generated_at                TIMESTAMP
generated_by_person_id      UUID FOREIGN KEY -> Person
report_url                  STRING
created_at                  TIMESTAMP
```

### Notification

```
notification_id         UUID PRIMARY KEY
org_id                  UUID FOREIGN KEY -> Organization
recipient_person_id     UUID FOREIGN KEY -> Person
notification_type       ENUM: assignment_proposed, assignment_confirmed, 
                        compatibility_flag, certification_expiring, schedule_published, 
                        training_reminder, analysis_complete, system_alert
title                   STRING
message                 TEXT
action_url              STRING
related_entity_type     STRING
related_entity_id       UUID
priority                ENUM: low, normal, high, urgent
channel                 ENUM: in_app, email, sms, push
status                  ENUM: pending, sent, delivered, read, failed
sent_at                 TIMESTAMP
read_at                 TIMESTAMP
created_at              TIMESTAMP
```

### Audit_Log

```
log_id          UUID PRIMARY KEY
org_id          UUID FOREIGN KEY -> Organization
actor_person_id UUID FOREIGN KEY -> Person
action          STRING (e.g., "team.assignment.create", "analysis.run", "rule.update")
entity_type     STRING
entity_id       UUID
changes         JSON (before/after values)
ip_address      STRING
user_agent      STRING
timestamp       TIMESTAMP
```

### Integration_Connection

```
connection_id       UUID PRIMARY KEY
org_id              UUID FOREIGN KEY -> Organization
integration_type    ENUM: hris, ats, calendar, project_management, time_tracking, 
                    lms, sso, custom_api
provider_name       STRING (e.g., "Workday", "ADP", "Jira", "Asana")
connection_status   ENUM: active, inactive, error, pending_auth
credentials         JSON (encrypted)
sync_frequency      ENUM: real_time, hourly, daily, weekly, manual
last_sync_at        TIMESTAMP
last_sync_status    ENUM: success, partial, failed
sync_log            JSON (recent sync results)
field_mappings      JSON (how external fields map to our schema)
created_by_person_id UUID FOREIGN KEY -> Person
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

## Sample Compatibility Rules to Pre-populate

### 1. HIGH_D_CONCENTRATION

```json
{
  "rule_code": "HIGH_D_CONCENTRATION",
  "rule_name": "High Dominance Concentration",
  "rule_type": "warning",
  "severity": "medium",
  "condition_logic": {
    "type": "count_exceeds",
    "field": "primary_style",
    "value": "D",
    "threshold": 2,
    "additional_condition": {
      "field": "d_score",
      "operator": ">",
      "value": 70
    }
  },
  "explanation_template": "This team has {count} high-Dominance members. While this brings strong results-focus, it may lead to competing priorities and power struggles.",
  "suggestion_template": "Consider adding a high-S member for stabilizing influence, or clearly define decision-making authority and domains for each D-style member."
}
```

### 2. NO_DETAIL_ORIENTATION

```json
{
  "rule_code": "NO_DETAIL_ORIENTATION",
  "rule_name": "Lacking Detail Orientation",
  "rule_type": "flag",
  "severity": "medium",
  "condition_logic": {
    "type": "count_equals",
    "conditions": [
      {"field": "primary_style", "value": "C", "count": 0},
      {"field": "c_score", "operator": ">", "value": 50, "count": 0}
    ],
    "match": "all"
  },
  "explanation_template": "This team lacks Conscientiousness-oriented members. Detail work, documentation, and quality control may suffer.",
  "suggestion_template": "Add a C-style member or assign explicit documentation responsibilities to existing members with secondary C traits."
}
```

### 3. ALL_SAME_STYLE

```json
{
  "rule_code": "ALL_SAME_STYLE",
  "rule_name": "Homogeneous Style Distribution",
  "rule_type": "warning",
  "severity": "medium",
  "condition_logic": {
    "type": "percentage_exceeds",
    "field": "primary_style",
    "threshold_percent": 75,
    "scope": "any_single_value"
  },
  "explanation_template": "This team is heavily skewed toward {style} style ({percent}%). Homogeneous teams may have blind spots.",
  "suggestion_template": "Introduce diversity by adding members with complementary styles to balance perspectives."
}
```

### 4. HIGH_FRICTION_PAIRING

```json
{
  "rule_code": "HIGH_FRICTION_PAIRING",
  "rule_name": "Potential Communication Friction",
  "rule_type": "flag",
  "severity": "low",
  "condition_logic": {
    "type": "pairwise_score_below",
    "source": "DiSC_Pairing_Guidance.compatibility_base_score",
    "threshold": 40
  },
  "explanation_template": "{person_a} ({style_a}) and {person_b} ({style_b}) may experience communication friction based on their DiSC profiles.",
  "suggestion_template": "{collaboration_tips}"
}
```

### 5. LEADER_STYLE_MISMATCH

```json
{
  "rule_code": "LEADER_STYLE_MISMATCH",
  "rule_name": "Leader-Team Style Gap",
  "rule_type": "info",
  "severity": "info",
  "condition_logic": {
    "type": "comparison",
    "compare": "team_lead.primary_style",
    "against": "team_majority_style",
    "condition": "not_equals",
    "additional": {
      "majority_threshold_percent": 60
    }
  },
  "explanation_template": "Team lead {leader_name}'s {leader_style} style differs significantly from the team's predominant {team_style} style.",
  "suggestion_template": "Ensure lead adapts communication style. Consider pairing with a co-lead who bridges the gap."
}
```

### 6. GO_LIVE_READINESS

```json
{
  "rule_code": "GO_LIVE_READINESS",
  "rule_name": "Go-Live Phase Readiness",
  "rule_type": "warning",
  "severity": "high",
  "applies_to_phases": ["go_live", "pre_go_live"],
  "condition_logic": {
    "type": "compound",
    "conditions": [
      {
        "type": "count_below",
        "field": "primary_style",
        "value": "D",
        "threshold": 1
      },
      {
        "type": "count_below",
        "field": "primary_style",
        "value": "i",
        "threshold": 1
      }
    ],
    "match": "any"
  },
  "explanation_template": "Go-live phases benefit from Dominance (quick decisions) and Influence (stakeholder management). Current team may struggle with pace.",
  "suggestion_template": "Temporarily augment team with D/i resources for go-live period."
}
```

### 7. SKILL_GAP_CRITICAL

```json
{
  "rule_code": "SKILL_GAP_CRITICAL",
  "rule_name": "Critical Skill Gap",
  "rule_type": "blocker",
  "severity": "critical",
  "condition_logic": {
    "type": "skill_coverage",
    "check": "required_skills",
    "condition": "no_member_meets_minimum",
    "source": "project.required_skill_ids"
  },
  "explanation_template": "No team member has required skill '{skill_name}' at {required_level} or above.",
  "suggestion_template": "Add a qualified resource or arrange training before project proceeds."
}
```

### 8. CERTIFICATION_EXPIRING

```json
{
  "rule_code": "CERTIFICATION_EXPIRING",
  "rule_name": "Certification Expiring During Project",
  "rule_type": "warning",
  "severity": "medium",
  "condition_logic": {
    "type": "date_comparison",
    "field": "skills.certification_expiry_date",
    "compare_to": "project.end_date",
    "condition": "before",
    "filter": {
      "skill_is_required": true
    }
  },
  "explanation_template": "{person_name}'s {certification_name} certification expires on {expiry_date}, which is during this project.",
  "suggestion_template": "Schedule certification renewal or identify backup resource."
}
```

### 9. OVERALLOCATION

```json
{
  "rule_code": "OVERALLOCATION",
  "rule_name": "Resource Overallocation",
  "rule_type": "blocker",
  "severity": "critical",
  "condition_logic": {
    "type": "aggregate_exceeds",
    "field": "team_assignment.allocation_percent",
    "group_by": "person_id",
    "filter": {
      "status": ["proposed", "confirmed", "active"]
    },
    "threshold": 100
  },
  "explanation_template": "{person_name} is allocated at {total_percent}% across all active assignments.",
  "suggestion_template": "Reduce allocation on another project or find alternative resource."
}
```

### 10. IDEAL_BALANCE_ACHIEVED

```json
{
  "rule_code": "IDEAL_BALANCE_ACHIEVED",
  "rule_name": "Excellent DiSC Balance",
  "rule_type": "strength",
  "severity": "info",
  "condition_logic": {
    "type": "distribution_check",
    "field": "primary_style",
    "conditions": [
      {"style": "D", "min_percent": 10, "max_percent": 40},
      {"style": "i", "min_percent": 10, "max_percent": 40},
      {"style": "S", "min_percent": 10, "max_percent": 40},
      {"style": "C", "min_percent": 10, "max_percent": 40}
    ],
    "all_styles_represented": true
  },
  "explanation_template": "This team has excellent DiSC balance with diverse perspectives represented.",
  "suggestion_template": "Leverage this diversity by ensuring all voices are heard in decision-making."
}
```

---

## User Interface Requirements

### Authentication & Onboarding

- Multi-tenant authentication with organization isolation
- SSO support (SAML, OAuth with Google/Microsoft)
- Role-based access control:
  - Super Admin
  - Org Admin
  - Manager
  - Team Lead
  - Member
  - Read-Only
- Onboarding wizard for new organizations:
  - Industry selection
  - Terminology customization
  - Initial user import
  - Skill taxonomy selection
- Onboarding wizard for new users:
  - Profile completion
  - Availability setup
  - Skill self-assessment prompt

### Dashboard (Role-specific)

#### Admin Dashboard
- Organization health metrics (active projects, team count, utilization rates)
- License usage and subscription status
- Pending approvals (assignment confirmations, availability requests)
- System alerts and notifications
- Recent audit log activity
- Quick actions (add user, create project, run analysis)

#### Manager Dashboard
- My teams overview with health scores
- Active projects with phase status
- Team composition visualizations (DiSC wheel charts)
- Upcoming scheduling conflicts
- Compatibility flags requiring attention
- Resource availability heat map
- Recommendations awaiting review

#### Team Lead Dashboard
- My team composition with individual DiSC profiles
- Team compatibility insights and suggestions
- Upcoming schedule and availability
- Training and development tracking
- Communication tips based on team composition

#### Individual Dashboard
- My DiSC profile summary
- Current assignments and schedule
- Team compatibility insights (how I work with my teammates)
- Skills and certifications with expiry alerts
- Training recommendations
- Personal availability calendar

### People Management

- People directory with search, filter, sort
- Detailed person profile view:
  - Personal info
  - DiSC assessment visualization
  - Skills matrix
  - Assignment history
  - Availability calendar
  - Performance data
- Bulk import via CSV or integration
- DiSC assessment management:
  - Schedule assessment
  - Record results
  - Upload reports
- Skills management:
  - Add/edit skills
  - Certification tracking with document upload
  - Verification workflow
- Availability management:
  - Calendar interface
  - Recurring patterns
  - Approval workflow

### DiSC Module

- DiSC assessment entry form (for certified professional to record results)
- DiSC profile visualization:
  - Wheel/circle chart showing style blend
  - Bar charts for intensity scores
- Pairwise compatibility lookup:
  - Select two people
  - See compatibility analysis
- Team DiSC visualization:
  - Combined wheel showing all team members
  - Distribution charts
- DiSC reference library:
  - Style descriptions
  - Pairing guidance
  - Communication tips
- Assessment scheduling and reminders
- Assessment history and trend tracking

### Project Management

- Project list with status filters, search, phase filtering
- Project detail view:
  - Overview
  - Timeline
  - Required skills
  - DiSC preferences
  - Team assignments
  - Analysis history
- Project creation wizard:
  - Basic info
  - Requirements
  - Skill needs
  - DiSC composition preferences
  - Timeline
- Phase management with transition tracking
- Project templates by industry/type

### Team Builder (Core Feature)

- Visual team composition interface
- Required skills checklist with coverage indicators
- DiSC composition target vs actual visualization
- Candidate recommendation panel with ranked suggestions
- Drag-and-drop team assembly
- Real-time compatibility scoring as team is built
- "What-if" analysis: simulate adding/removing members
- Side-by-side candidate comparison
- One-click analysis trigger
- Conflict highlighting (overallocation, skill gaps, compatibility flags)

### Team Analysis & Insights

- Comprehensive team analysis report view
- Overall scores with drill-down capability
- DiSC distribution charts and balance indicators
- Pairwise compatibility matrix visualization (heat map)
- Skill coverage matrix
- Flags/warnings/suggestions list with severity indicators
- Actionable recommendations with resolution tracking
- Historical analysis comparison (trend over time)
- Export to PDF/presentation for stakeholder sharing
- AI-generated narrative summary

### Scheduling

- Calendar views: day, week, month, timeline
- Drag-and-drop schedule creation
- Availability overlay showing who's available when
- Shift template creation
- Recurring schedule patterns
- Conflict detection and alerts
- Schedule publishing workflow
- Individual and team schedule views
- Integration with external calendars (Google, Outlook)

### Training & Development

- Training catalog management
- Training assignment and enrollment
- Progress tracking
- Certification management with expiry alerts
- Team training session scheduling
- DiSC workshop scheduling with your certified professional
- Training effectiveness tracking (pre/post assessments)
- Learning path recommendations based on skill gaps

### Reporting & Analytics

- Pre-built report templates:
  - Team composition
  - Utilization
  - Skill inventory
  - Certification status
  - Compatibility trends
- Custom report builder with drag-and-drop metrics
- ROI analysis dashboard:
  - Compare optimized teams vs baseline
  - Training effectiveness
  - Productivity gains
- Data visualization library: charts, graphs, heat maps
- Scheduled report delivery via email
- Export to Excel, PDF, PowerPoint
- Executive summary generator

### Compatibility Rules Engine

- Rule library with categorization
- Rule editor:
  - Condition builder (visual and JSON)
  - Template editor with variable insertion
- Rule testing: input test data, see if rule triggers
- Rule activation/deactivation
- Organization-specific rule overrides
- Rule effectiveness tracking (how often triggered, resolution rates)

### Notifications & Alerts

- In-app notification center
- Email notification templates (customizable)
- Push notifications (mobile)
- Notification preferences per user
- Digest options (immediate, daily, weekly)
- Escalation rules for critical alerts

### Settings & Administration

- Organization settings: branding, terminology, feature toggles
- User management: invite, roles, permissions, deactivation
- Skill taxonomy management: add custom skills, categorize, activate/deactivate
- Industry configuration: phase definitions, default rules, templates
- Integration management: connect external systems, configure sync, view logs
- Audit log viewer with filtering
- Data export (for compliance/migration)
- Subscription and billing management

### Mobile Responsiveness

- All core features accessible on tablet and mobile
- Simplified mobile views for:
  - Schedule checking
  - Availability updates
  - Notification management
- Touch-friendly team visualization

---

## API Requirements

### RESTful API Design

- Versioned API (v1, v2, etc.)
- JWT authentication with refresh tokens
- Rate limiting per organization tier
- Comprehensive error handling with meaningful messages
- Pagination for list endpoints
- Filtering, sorting, search parameters
- Bulk operation endpoints where appropriate

### Core Endpoints

```
# Authentication
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

# Organizations
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/:id
PUT    /api/v1/organizations/:id

# People
GET    /api/v1/people
POST   /api/v1/people
GET    /api/v1/people/:id
PUT    /api/v1/people/:id
DELETE /api/v1/people/:id

# DiSC Assessments
GET    /api/v1/people/:id/disc-assessment
POST   /api/v1/people/:id/disc-assessment
PUT    /api/v1/people/:id/disc-assessment/:assessment_id

# Skills
GET    /api/v1/people/:id/skills
POST   /api/v1/people/:id/skills
PUT    /api/v1/people/:id/skills/:skill_id
DELETE /api/v1/people/:id/skills/:skill_id

# Projects
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id

# Teams
GET    /api/v1/teams
POST   /api/v1/teams
GET    /api/v1/teams/:id
PUT    /api/v1/teams/:id
DELETE /api/v1/teams/:id
POST   /api/v1/teams/:id/analyze
GET    /api/v1/teams/:id/recommendations
POST   /api/v1/teams/:id/what-if

# Schedules
GET    /api/v1/schedules
POST   /api/v1/schedules
GET    /api/v1/schedules/:id
PUT    /api/v1/schedules/:id
DELETE /api/v1/schedules/:id

# Compatibility Rules
GET    /api/v1/compatibility-rules
POST   /api/v1/compatibility-rules
GET    /api/v1/compatibility-rules/:id
PUT    /api/v1/compatibility-rules/:id
DELETE /api/v1/compatibility-rules/:id

# Analytics & Reports
GET    /api/v1/analytics/roi
GET    /api/v1/reports/:type

# Webhooks
POST   /api/v1/webhooks
```

### Matching Algorithm API

```
# Recommend candidates for a project/team
POST /api/v1/matching/recommend-candidates
Input: { project_id OR team_id, optional_filters }
Output: Ranked list of candidates with scores and analysis

# Analyze team composition
POST /api/v1/matching/analyze-team
Input: { team_id OR person_ids[] }
Output: Comprehensive analysis object

# Simulate team changes
POST /api/v1/matching/simulate
Input: { current_team, proposed_additions[], proposed_removals[] }
Output: Projected scores and flag changes
```

---

## Matching Algorithm Logic

### Layer 1: Hard Filters
Eliminate candidates who don't meet non-negotiable requirements:
- Does the person have required skills/certifications?
- Are they available during the project dates?
- Are they already at capacity?
- Any org-specific exclusions (conflicts of interest, client history)?

### Layer 2: Skill Fit Scoring
Score remaining candidates on how well their skills match project needs:
- Weight by proficiency level
- Weight by recency of experience
- Output: `skill_fit_score` per candidate

### Layer 3: DiSC Team Composition Analysis
For each candidate, simulate adding them to the current team and calculate:
- Style distribution balance (is the team skewed too heavily toward one quadrant?)
- Pairwise compatibility (how does this person's style interact with each existing team member?)
- Role-style alignment (is a high-C person being considered for a client relationship lead role that might suit a high-i better?)
- Phase appropriateness (go-live might weight D and i higher, post-go-live might favor S and C)

### Layer 4: Rule Evaluation
Run the team composition through compatibility rules:
- Each triggered rule affects the score
- Generate explanatory flags

### Layer 5: Composite Scoring
Combine the layers with configurable weights:

```
final_score = (skill_weight × skill_fit_score) 
            + (disc_weight × disc_compatibility_score) 
            - (flag_penalty × severity_weighted_flags)
```

Weights can be adjusted per organization or project type.

### Layer 6: Recommendation Output
Return ranked candidates with:
- Overall score
- Skill match breakdown
- DiSC compatibility notes
- Any flags with explanations and suggestions

---

## Automation Features

### Scheduled Automations

| Automation | Frequency | Description |
|------------|-----------|-------------|
| Team Compatibility Re-analysis | Nightly | Re-analyze all active teams |
| Certification Expiry Check | Weekly | Check for expiring certifications, send alerts |
| Availability Sync | Daily | Sync availability from integrated calendars |
| Report Generation | Configurable | Generate and distribute scheduled reports |
| Assessment Validity Reminders | Daily | Send reminders at 30, 14, 7 days before expiry |

### Event-Triggered Automations

| Trigger Event | Automation |
|---------------|------------|
| Team assignment changes | Auto-analyze team |
| Compatibility score drops below threshold | Notify manager |
| Overallocation detected | Alert resource manager |
| New person added to org | Send welcome sequence |
| Self-reported skill added | Trigger skill verification request |
| Skill gap identified | Create training recommendation |
| Project marked complete | Archive project and team |

### Smart Suggestions

- Proactive candidate suggestions when project created
- "You might also consider" recommendations based on similar past projects
- Training recommendations based on skill gaps and career goals
- Meeting scheduling suggestions based on team DiSC composition
- Communication tips surfaced when messaging teammates with different styles

### AI-Powered Features

- Natural language project requirement parsing
- Automated analysis narrative generation
- Smart skill extraction from resume/CV upload
- Chatbot for quick queries ("Who's available next week with Epic experience?")
- Predictive compatibility scoring based on historical team performance
- Anomaly detection in team dynamics

---

## Integration Capabilities

### HR Systems (HRIS)
- Workday, ADP, BambooHR, Paylocity
- Sync: employee data, org structure, employment status

### Calendar
- Google Calendar, Microsoft Outlook
- Features: bi-directional availability sync, meeting scheduling

### Project Management
- Jira, Asana, Monday.com, Smartsheet
- Sync: project data, phase updates, team assignments

### Time Tracking
- Toggl, Harvest, Clockify
- Features: allocation validation, utilization calculation

### Learning Management (LMS)
- Cornerstone, Workday Learning, custom LMS
- Sync: training records, certification import

### Communication
- Slack, Microsoft Teams
- Features: notifications, bot commands for quick queries

### Single Sign-On
- SAML 2.0, OAuth 2.0
- Providers: Google Workspace, Microsoft Entra ID, Okta

### Custom Webhooks
- Configurable outbound webhooks for key events
- Inbound webhook endpoints for external triggers

---

## Security & Compliance

- [ ] SOC 2 Type II compliance readiness
- [ ] HIPAA compliance considerations (for healthcare clients)
- [ ] Data encryption at rest and in transit
- [ ] Field-level encryption for sensitive data (rates, SSN if collected)
- [ ] Role-based access control with granular permissions
- [ ] Audit logging for all data changes
- [ ] Data retention policies (configurable per org)
- [ ] Data export for portability
- [ ] Right to deletion support
- [ ] Multi-factor authentication option
- [ ] Session management and timeout
- [ ] IP allowlisting option for enterprise

---

## White-Labeling & Customization

- Custom branding (logo, colors, favicon)
- Custom domain support (client.dischedule.com or teams.clientdomain.com)
- Terminology customization (rename any entity type)
- Custom fields on core entities
- Custom skill taxonomies
- Custom compatibility rules
- Custom report templates
- Custom notification templates
- Industry-specific feature sets

---

## Initial Seed Data

### DiSC Style Descriptors
Pre-populate the four styles with comprehensive descriptions based on official DiSC model.

### DiSC Pairing Guidance
Pre-populate all 16 pairwise combinations with compatibility insights.

### Default Compatibility Rules
Include the 10 sample rules defined above plus additional standard rules.

### Skill Taxonomies by Industry

#### Healthcare IT
- Epic (with sub-skills: Ambulatory, Inpatient, Revenue Cycle, Cogito, Caboodle, etc.)
- Cerner, MEDITECH, Allscripts, athenahealth
- HL7/FHIR
- Clinical Informatics, Nursing Informatics, Pharmacy Informatics
- Revenue Cycle Management
- ICD-10, CPT Coding
- HIPAA Compliance
- EHR Implementation
- Clinical Workflow Design
- Change Management
- Training & Adoption
- Command Center Operations
- Go-Live Support
- Optimization
- Report Writing
- Data Analytics
- Project Management
- Agile/Scrum, Waterfall
- Communication, Leadership, Problem-Solving

#### Professional Services
- Project Management
- Program Management
- Business Analysis
- Requirements Gathering
- Process Mapping
- Change Management
- Stakeholder Management
- Executive Communication
- Presentation Skills
- Workshop Facilitation

#### Manufacturing
- Lean Manufacturing
- Six Sigma
- Quality Control
- Supply Chain
- ERP Systems
- Safety Compliance

### Project Phase Templates

#### Healthcare IT Implementation
1. Discovery & Planning
2. Design & Validation
3. Build
4. Testing (Unit, Integrated, User Acceptance)
5. Training
6. Pre-Go-Live / Dress Rehearsal
7. Go-Live / Command Center
8. Stabilization
9. Optimization

### Demo/Sample Data
- Sample organization with divisions
- Sample people with complete profiles and DiSC assessments
- Sample projects in various phases
- Sample teams with analysis history
- Sample compatibility flags and resolutions

---

## Development Phases

### Phase 1: Foundation (MVP)
- [ ] Authentication and multi-tenancy
- [ ] Organization, division, person CRUD
- [ ] DiSC assessment entry and storage
- [ ] Basic skill management
- [ ] Simple team creation
- [ ] Basic compatibility analysis (3-5 core rules)
- [ ] Dashboard with key metrics
- [ ] Essential notifications

### Phase 2: Core Features
- [ ] Full compatibility rules engine
- [ ] Candidate recommendation algorithm
- [ ] What-if simulation
- [ ] Project management
- [ ] Scheduling basics
- [ ] Reporting foundation
- [ ] API v1

### Phase 3: Advanced Features
- [ ] Training module
- [ ] ROI analytics
- [ ] Advanced scheduling
- [ ] Integration framework (start with calendar sync)
- [ ] Mobile optimization
- [ ] AI-generated summaries

### Phase 4: Enterprise & Scale
- [ ] White-labeling
- [ ] Advanced integrations (HRIS, PM tools)
- [ ] Custom fields and taxonomies
- [ ] Advanced security features
- [ ] Performance optimization

### Phase 5: Intelligence & Automation
- [ ] Predictive analytics
- [ ] Smart automation rules
- [ ] NLP features
- [ ] Chatbot interface
- [ ] Advanced AI insights

---

## Success Metrics to Track

- User adoption (daily/weekly active users)
- Teams created and analyzed
- Recommendations accepted rate
- Compatibility score improvements over time
- Time saved in team assembly
- User satisfaction (NPS, CSAT)
- Client retention rate
- ROI metrics from client implementations

---

## Developer Notes

1. **Prioritize the team builder and analysis features** — this is the core value proposition

2. **DiSC data entry must be flexible** since assessments come from certified professional, not generated by system

3. **The matching algorithm should be configurable** with adjustable weights

4. **All compatibility rules should be editable by admins**, not hardcoded

5. **Build for multi-tenancy from day one** — retrofitting is painful

6. **API-first design** to support future mobile apps and integrations

7. **Consider using a workflow engine** for complex automations

8. **Plan for internationalization** even if not implementing immediately

9. **Build comprehensive seed data** to make demos compelling

10. **Include a sandbox/demo mode** for sales purposes

---

## File Structure Recommendation

```
/src
  /api
    /routes
    /controllers
    /middleware
    /validators
  /services
    /matching
    /analysis
    /notifications
    /integrations
  /models
  /utils
  /config
/client
  /src
    /components
      /common
      /dashboard
      /people
      /teams
      /projects
      /disc
      /scheduling
      /reports
      /settings
    /pages
    /hooks
    /services
    /store
    /utils
    /styles
/prisma
  schema.prisma
  /migrations
  /seed
/tests
  /unit
  /integration
  /e2e
```

---

*This document serves as the comprehensive development specification for DiSChedule. Refer to specific sections as needed during implementation.*
