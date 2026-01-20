# Legacy Systems Integration & Data Mapping

**Created:** January 19, 2026
**Status:** Planning
**Purpose:** Consolidate data from hospital enterprise systems into unified NiceHR executive dashboards

---

## Table of Contents

1. [Overview](#overview)
2. [Target Systems](#target-systems)
3. [Auto-Mapping Strategy](#auto-mapping-strategy)
4. [Field Mapping Specifications](#field-mapping-specifications)
5. [Implementation Plan](#implementation-plan)
6. [Data Flow Architecture](#data-flow-architecture)

---

## Overview

### The Problem

Hospitals use 10-20+ enterprise systems. Executives must log into each system separately to get a complete picture:

```
Current State:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ServiceNow  │  │   Asana     │  │    SAP      │  │    Jira     │
│  (ITSM)     │  │  (Tasks)    │  │   (ERP)     │  │  (Issues)   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
      │                │                │                │
      └────────────────┴────────────────┴────────────────┘
                              │
                    Executive logs into EACH
```

### The Solution

NiceHR becomes the **single pane of glass** - one dashboard showing consolidated data:

```
Future State:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ServiceNow  │  │   Asana     │  │    SAP      │  │    Jira     │
│  (ITSM)     │  │  (Tasks)    │  │   (ERP)     │  │  (Issues)   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    NiceHR         │
                    │ Integration Hub   │
                    │ (Field Mapping)   │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Executive Dashboard│
                    │ (Unified View)    │
                    └───────────────────┘
```

### Data Entry Methods

| Method | Description | When to Use |
|--------|-------------|-------------|
| **Manual Entry** | Admin enters data via forms | No API access, small data volumes |
| **CSV Import** | Upload exported CSV files | Periodic bulk imports |
| **Scheduled Sync** | Automated API pulls | Full API access granted |
| **Real-time API** | Live integration | Full API + security approval |

---

## Target Systems

### ITSM (IT Service Management)

| System | Market Share | Priority | API Available |
|--------|--------------|----------|---------------|
| **ServiceNow** | #1 Enterprise | HIGH | Yes (REST) |
| **BMC Helix/Remedy** | #2 Enterprise | MEDIUM | Yes (REST) |
| **Freshservice** | Mid-market | LOW | Yes (REST) |
| **Jira Service Management** | Dev teams | MEDIUM | Yes (REST) |
| **Zendesk** | Support focus | LOW | Yes (REST) |
| **Cherwell/Ivanti** | Healthcare | MEDIUM | Yes (REST) - EOL 2026 |
| **ManageEngine** | Budget option | LOW | Yes (REST) |

### Project Management

| System | Market Share | Priority | API Available |
|--------|--------------|----------|---------------|
| **Asana** | Enterprise | HIGH | Yes (REST) |
| **Jira Software** | Dev teams | HIGH | Yes (REST) |
| **Monday.com** | SMB/Mid | MEDIUM | Yes (GraphQL) |
| **Smartsheet** | Enterprise | MEDIUM | Yes (REST) |
| **Wrike** | Enterprise | LOW | Yes (REST) |
| **Microsoft Project** | Enterprise | MEDIUM | Yes (Graph API) |

### ERP (Enterprise Resource Planning)

| System | Market Share | Priority | API Available |
|--------|--------------|----------|---------------|
| **SAP S/4HANA** | #1 Enterprise | HIGH | Yes (OData) |
| **Oracle ERP Cloud** | #2 Enterprise | MEDIUM | Yes (REST) |
| **Workday** | Finance/HR | MEDIUM | Yes (REST/SOAP) |
| **Microsoft Dynamics** | Mid-market | LOW | Yes (OData) |

### PPM (Project Portfolio Management)

| System | Market Share | Priority | API Available |
|--------|--------------|----------|---------------|
| **Clarity PPM** | Enterprise | MEDIUM | Yes (REST) |
| **Planview** | Enterprise | MEDIUM | Yes (REST) |
| **ServiceNow SPM** | Integrated | HIGH | Yes (REST) |

### EHR Systems (for reference data)

| System | Market Share | Priority | API Available |
|--------|--------------|----------|---------------|
| **Epic** | #1 Hospital | HIGH | Yes (FHIR) |
| **Cerner (Oracle Health)** | #2 Hospital | MEDIUM | Yes (FHIR) |
| **Meditech** | Community | LOW | Limited |
| **athenahealth** | Ambulatory | LOW | Yes (REST) |

---

## Auto-Mapping Strategy

### AI-Powered Schema Matching

Modern AI can automatically detect field mappings:

```
Source: ServiceNow          Target: NiceHR
─────────────────────      ─────────────────
incident_number      ──►   ticket_id
short_description    ──►   title
description          ──►   description
caller_id            ──►   requester_id
assigned_to          ──►   assignee_id
state                ──►   status
priority             ──►   priority
sys_created_on       ──►   created_at
sys_updated_on       ──►   updated_at
```

### Mapping Approaches

| Approach | Accuracy | Setup Time | Best For |
|----------|----------|------------|----------|
| **AI Schema Matching** | 85-95% | Minutes | Initial mapping |
| **FHIR Standard Fields** | 100% | None | Healthcare data |
| **Template Libraries** | 90% | Hours | Common systems |
| **Manual Mapping** | 100% | Days | Custom fields |

### Recommended Auto-Mapping Tools

| Tool | Type | Healthcare Support | Pricing |
|------|------|-------------------|---------|
| **[Astera](https://www.astera.com/type/blog/ai-data-mapping/)** | AI Data Mapping | Yes | Enterprise |
| **[Relevance AI](https://relevanceai.com/agent-templates-tasks/schema-mapping-automation)** | Schema Matching | Yes | Usage-based |
| **[Fivetran](https://www.fivetran.com)** | ETL + Mapping | Limited | Per connector |
| **Custom ML Model** | Built-in | Full control | Development |

### FHIR Standard Field Names

For healthcare data, use HL7 FHIR standard fields:

```typescript
// Patient Demographics (FHIR R5 Standard)
interface FHIRPatient {
  identifier: string[];        // Patient IDs
  active: boolean;             // Record active?
  name: HumanName[];           // Patient names
  telecom: ContactPoint[];     // Phone/email
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;           // YYYY-MM-DD
  deceased: boolean | string;  // Deceased status
  address: Address[];          // Addresses
  maritalStatus: CodeableConcept;
}
```

---

## Field Mapping Specifications

### ServiceNow → NiceHR

#### Incidents

| ServiceNow Field | NiceHR Field | Type | Transform |
|------------------|--------------|------|-----------|
| `number` | `external_id` | string | Direct |
| `short_description` | `title` | string | Direct |
| `description` | `description` | text | Direct |
| `caller_id.name` | `requester_name` | string | Lookup |
| `assigned_to.name` | `assignee_name` | string | Lookup |
| `state` | `status` | enum | Map: 1→open, 2→in_progress, 6→resolved, 7→closed |
| `priority` | `priority` | enum | Map: 1→critical, 2→high, 3→medium, 4,5→low |
| `category` | `category` | string | Direct |
| `sys_created_on` | `created_at` | datetime | ISO8601 |
| `sys_updated_on` | `updated_at` | datetime | ISO8601 |
| `resolved_at` | `resolved_at` | datetime | ISO8601 |
| `close_notes` | `resolution_notes` | text | Direct |

#### Change Requests

| ServiceNow Field | NiceHR Field | Type | Transform |
|------------------|--------------|------|-----------|
| `number` | `external_id` | string | Direct |
| `short_description` | `title` | string | Direct |
| `type` | `change_type` | enum | Map: standard, normal, emergency |
| `risk` | `risk_level` | enum | Map: 1→critical, 2→high, 3→moderate, 4→low |
| `state` | `status` | enum | Map states to NiceHR workflow |
| `requested_by.name` | `requester_name` | string | Lookup |
| `assignment_group.name` | `team` | string | Lookup |
| `start_date` | `planned_start` | datetime | ISO8601 |
| `end_date` | `planned_end` | datetime | ISO8601 |
| `cab_required` | `requires_approval` | boolean | Direct |

---

### Asana → NiceHR

#### Tasks

| Asana Field | NiceHR Field | Type | Transform |
|-------------|--------------|------|-----------|
| `gid` | `external_id` | string | Direct |
| `name` | `title` | string | Direct |
| `notes` | `description` | text | HTML→Markdown |
| `assignee.name` | `assignee_name` | string | Lookup |
| `due_on` | `due_date` | date | YYYY-MM-DD |
| `completed` | `status` | enum | true→completed, false→open |
| `completed_at` | `completed_at` | datetime | ISO8601 |
| `projects[0].name` | `project_name` | string | First project |
| `tags[].name` | `tags` | array | Direct |
| `created_at` | `created_at` | datetime | ISO8601 |
| `modified_at` | `updated_at` | datetime | ISO8601 |

#### Projects

| Asana Field | NiceHR Field | Type | Transform |
|-------------|--------------|------|-----------|
| `gid` | `external_id` | string | Direct |
| `name` | `name` | string | Direct |
| `notes` | `description` | text | HTML→Markdown |
| `owner.name` | `owner_name` | string | Lookup |
| `due_on` | `due_date` | date | YYYY-MM-DD |
| `start_on` | `start_date` | date | YYYY-MM-DD |
| `current_status.color` | `status` | enum | Map: green→on_track, yellow→at_risk, red→off_track |
| `team.name` | `team` | string | Lookup |

---

### SAP → NiceHR

#### Purchase Orders

| SAP Field | NiceHR Field | Type | Transform |
|-----------|--------------|------|-----------|
| `EBELN` | `external_id` | string | Direct |
| `BUKRS` | `company_code` | string | Direct |
| `BSART` | `po_type` | string | Direct |
| `LIFNR` | `vendor_id` | string | Direct |
| `EKORG` | `purchasing_org` | string | Direct |
| `BEDAT` | `po_date` | date | SAP date format |
| `NETWR` | `net_value` | decimal | Direct |
| `WAERS` | `currency` | string | Direct |
| `STATU` | `status` | enum | Map SAP status codes |

#### Cost Centers

| SAP Field | NiceHR Field | Type | Transform |
|-----------|--------------|------|-----------|
| `KOSTL` | `cost_center_id` | string | Direct |
| `KTEXT` | `name` | string | Direct |
| `BUKRS` | `company_code` | string | Direct |
| `KOSAR` | `category` | string | Direct |
| `VERAK` | `responsible_person` | string | Direct |
| `DATBI` | `valid_to` | date | SAP date format |

---

### Jira → NiceHR

#### Issues

| Jira Field | NiceHR Field | Type | Transform |
|------------|--------------|------|-----------|
| `key` | `external_id` | string | Direct |
| `fields.summary` | `title` | string | Direct |
| `fields.description` | `description` | text | ADF→Markdown |
| `fields.issuetype.name` | `issue_type` | string | Direct |
| `fields.status.name` | `status` | enum | Map to NiceHR statuses |
| `fields.priority.name` | `priority` | enum | Map: Highest→critical, High→high, Medium→medium, Low/Lowest→low |
| `fields.assignee.displayName` | `assignee_name` | string | Direct |
| `fields.reporter.displayName` | `reporter_name` | string | Direct |
| `fields.created` | `created_at` | datetime | ISO8601 |
| `fields.updated` | `updated_at` | datetime | ISO8601 |
| `fields.resolutiondate` | `resolved_at` | datetime | ISO8601 |
| `fields.labels` | `tags` | array | Direct |

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

- [ ] Create database tables for integration data
- [ ] Build Integration Hub page (`/integrations`)
- [ ] Create field mapping configuration UI
- [ ] Implement manual data entry forms
- [ ] Add CSV import functionality

### Phase 2: ServiceNow Integration (Week 3-4)

- [ ] Create ServiceNow data page
- [ ] Implement incident field mapping
- [ ] Implement change request mapping
- [ ] Add drill-down modals
- [ ] Create sync status dashboard

### Phase 3: Asana Integration (Week 5-6)

- [ ] Create Asana data page
- [ ] Implement task field mapping
- [ ] Implement project field mapping
- [ ] Add drill-down modals
- [ ] Test with sample data

### Phase 4: SAP Integration (Week 7-8)

- [ ] Create SAP data page
- [ ] Implement PO field mapping
- [ ] Implement cost center mapping
- [ ] Implement budget variance calculations
- [ ] Add financial drill-downs

### Phase 5: Jira Integration (Week 9-10)

- [ ] Create Jira data page
- [ ] Implement issue field mapping
- [ ] Implement sprint mapping
- [ ] Add burndown charts
- [ ] Test with sample data

### Phase 6: Auto-Mapping & AI (Week 11-12)

- [ ] Implement AI schema matching
- [ ] Create mapping suggestion UI
- [ ] Build mapping template library
- [ ] Add mapping validation
- [ ] Performance optimization

### Phase 7: EOD Reports Enhancement (Week 13)

- [ ] Add change management metrics to EOD
- [ ] Create daily summary aggregation
- [ ] Build change trend charts
- [ ] Add drill-down to change details

---

## Data Flow Architecture

### Database Schema

```sql
-- Integration Sources
CREATE TABLE integration_sources (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- "ServiceNow Production"
  type VARCHAR(50) NOT NULL,            -- "servicenow", "asana", "sap", "jira"
  connection_config JSONB,              -- API credentials (encrypted)
  sync_frequency VARCHAR(20),           -- "manual", "hourly", "daily"
  last_sync_at TIMESTAMP,
  status VARCHAR(20),                   -- "active", "error", "disabled"
  created_at TIMESTAMP DEFAULT NOW()
);

-- Field Mappings
CREATE TABLE field_mappings (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES integration_sources(id),
  source_entity VARCHAR(100),           -- "incident", "task", "purchase_order"
  source_field VARCHAR(100),            -- "short_description"
  target_entity VARCHAR(100),           -- "support_tickets"
  target_field VARCHAR(100),            -- "title"
  transform_type VARCHAR(50),           -- "direct", "lookup", "enum_map", "formula"
  transform_config JSONB,               -- Transform rules
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Imported Data (Generic)
CREATE TABLE integration_records (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES integration_sources(id),
  entity_type VARCHAR(100),             -- "incident", "task", etc.
  external_id VARCHAR(255),             -- ID from source system
  data JSONB,                           -- Mapped data
  raw_data JSONB,                       -- Original data
  imported_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, entity_type, external_id)
);

-- Sync History
CREATE TABLE sync_history (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES integration_sources(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(20),                   -- "success", "partial", "failed"
  records_processed INT,
  records_created INT,
  records_updated INT,
  records_failed INT,
  error_log JSONB
);
```

### API Endpoints

```typescript
// Integration Management
GET    /api/integrations                    // List all integrations
POST   /api/integrations                    // Create integration source
GET    /api/integrations/:id                // Get integration details
PATCH  /api/integrations/:id                // Update integration
DELETE /api/integrations/:id                // Delete integration

// Field Mappings
GET    /api/integrations/:id/mappings       // Get field mappings
POST   /api/integrations/:id/mappings       // Create mapping
PATCH  /api/integrations/:id/mappings/:mid  // Update mapping
DELETE /api/integrations/:id/mappings/:mid  // Delete mapping

// Data Import
POST   /api/integrations/:id/import/manual  // Manual data entry
POST   /api/integrations/:id/import/csv     // CSV import
POST   /api/integrations/:id/sync           // Trigger API sync

// Data Retrieval
GET    /api/integrations/:id/records        // Get imported records
GET    /api/integrations/:id/records/:rid   // Get single record

// Auto-Mapping
POST   /api/integrations/:id/suggest-mappings  // AI mapping suggestions
GET    /api/mapping-templates/:type            // Get template for system type
```

---

## Implementation Checklist

### Database & Backend
- [ ] Create `integration_sources` table
- [ ] Create `field_mappings` table
- [ ] Create `integration_records` table
- [ ] Create `sync_history` table
- [ ] Build integration CRUD API
- [ ] Build field mapping API
- [ ] Build import APIs (manual, CSV, sync)
- [ ] Build auto-mapping suggestion engine

### Frontend Pages
- [ ] `/integrations` - Integration Hub
- [ ] `/integrations/new` - Add new integration
- [ ] `/integrations/:id` - Integration detail
- [ ] `/integrations/:id/mappings` - Field mapping config
- [ ] `/integrations/servicenow` - ServiceNow data view
- [ ] `/integrations/asana` - Asana data view
- [ ] `/integrations/sap` - SAP data view
- [ ] `/integrations/jira` - Jira data view

### Drill-Downs (from DRILL_DOWN_IMPLEMENTATION.md Phase 4)
- [ ] Integration Hub cards → System pages
- [ ] ServiceNow KPIs → Filtered lists
- [ ] Asana KPIs → Filtered lists
- [ ] SAP KPIs → Filtered lists
- [ ] Jira KPIs → Filtered lists
- [ ] All table rows → Detail modals
- [ ] EOD change metrics → Change details

### Testing
- [ ] Unit tests for field mapping transforms
- [ ] Integration tests for CSV import
- [ ] E2E tests for drill-downs
- [ ] Performance tests for large data sets

---

## Sources & References

### Research Sources
- [ServiceNow Healthcare Use Cases](https://intuitionlabs.ai/articles/servicenow-healthcare-use-cases)
- [AI Data Mapping Guide 2025](https://www.bizdata360.com/ai-data-mapping/)
- [Schema Mapping Automation](https://relevanceai.com/agent-templates-tasks/schema-mapping-automation)
- [Healthcare Data Integration Best Practices](https://www.bizdata360.com/healthcare-data-integration-ai-guide-best-practices-2025/)
- [FHIR Patient Resource](https://www.hl7.org/fhir/patient.html)
- [ITSM Platforms for Healthcare](https://www.cloudnuro.ai/blog/best-itsm-platforms-for-healthcare-organizations-compliance-security-considerations-2025)
- [Healthcare PPM Software](https://www.a-dato.com/tools/top-project-and-portfolio-management-software-for-healthcare/)
- [Smartsheet Healthcare PM](https://www.smartsheet.com/content/best-healthcare-project-management-software)

---

*Last Updated: January 19, 2026*
