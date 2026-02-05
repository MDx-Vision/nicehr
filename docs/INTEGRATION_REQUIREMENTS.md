# NiceHR Integration Requirements

> **Living Document** - Last Updated: February 5, 2026
>
> This document tracks all requirements needed from you (the human) to complete the legacy system integrations and enable the automated SOW response feature.

---

## Quick Summary - What We Need From You

| Integration | Priority | Credentials Needed | Status |
|-------------|----------|-------------------|--------|
| SAP Fieldglass | 🔴 High | OAuth credentials, API key | Pending |
| ServiceNow | 🟡 Medium | Instance URL, API user | Pending |
| Asana | 🟡 Medium | Personal Access Token | Pending |
| Jira | 🟡 Medium | API Token, Instance URL | Pending |

---

## 1. SAP Fieldglass (VMS - SOW Auto-Response)

### Purpose
Enable automatic detection of Statement of Work (SOW) opportunities and auto-respond with matched consultants from your network.

### How It Will Work
1. **Detect**: Webhook/polling monitors Fieldglass for new SOW postings
2. **Match**: AI matches SOW requirements against consultant skills, availability, rates
3. **Respond**: Auto-submits proposals with top-matching consultants (above threshold)

### Credentials Required

| Credential | Description | Where to Get It |
|------------|-------------|-----------------|
| **Environment URL** | Your Fieldglass instance URL | `https://your-company.fieldglass.net` |
| **OAuth Client ID** | OAuth 2.0 client identifier | Contact SAP Fieldglass representative |
| **OAuth Client Secret** | OAuth 2.0 secret | Contact SAP Fieldglass representative |
| **API Key** | Application API key | Fieldglass Admin > Integration Tools > Create API Application Key |

### Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| **Auto-Response** | Automatically respond to SOWs | Enabled |
| **Match Threshold** | Minimum match score to auto-respond | 80% |
| **Sync Frequency** | How often to check for new SOWs | Hourly |

### API Endpoints We'll Use

```
Token:     POST https://{url}/api/oauth2/v2.0/token
SOWs:      GET  https://{url}/api/v1/sow
Workers:   GET  https://{url}/api/vc/connector/contingent_worker_download
Timesheets:GET  https://{url}/api/vc/connector/time_sheet_download
Submit:    POST https://{url}/api/v1/sow/{id}/response
```

### Questions for You

1. Do you have an existing Fieldglass account with API access enabled?
2. What's your typical response time requirement for SOWs?
3. Should we require human approval before auto-responding, or fully automated?
4. What consultant fields should we match on? (skills, certifications, EHR systems, location, rate)

---

## 2. ServiceNow (ITSM Integration)

### Purpose
Import incidents, changes, and requests from hospital ServiceNow instances to track alongside NiceHR projects.

### Credentials Required

| Credential | Description | Where to Get It |
|------------|-------------|-----------------|
| **Instance URL** | ServiceNow instance | `https://your-instance.service-now.com` |
| **Username** | API integration user | Create in ServiceNow User Admin |
| **Password** | User password | Set during user creation |
| **Client ID** (OAuth)* | OAuth app client ID | System OAuth > Application Registry |
| **Client Secret** (OAuth)* | OAuth app secret | System OAuth > Application Registry |

*OAuth is optional but recommended for production

### API Endpoints We'll Use

```
Table API:  GET  https://{instance}/api/now/table/{tableName}
Incidents:  GET  https://{instance}/api/now/table/incident
Changes:    GET  https://{instance}/api/now/table/change_request
Tasks:      GET  https://{instance}/api/now/table/sc_task
```

### Data We'll Sync

| ServiceNow Entity | NiceHR Mapping |
|-------------------|----------------|
| Incidents | Support Tickets |
| Change Requests | Change Management |
| Tasks | Project Tasks |
| Configuration Items | Hospital Assets |

### Questions for You

1. Which ServiceNow instance(s) do you need to connect?
2. Do you have admin access to create integration users?
3. What data should we import? (Incidents, Changes, Tasks, All?)

---

## 3. Asana (Project Management)

### Purpose
Sync Asana projects and tasks with NiceHR project tracking.

### Credentials Required

| Credential | Description | Where to Get It |
|------------|-------------|-----------------|
| **Personal Access Token** | API authentication | Asana > My Profile Settings > Apps > Developer Apps > Create token |

*For production, consider OAuth app registration for team-wide access*

### API Features

- **RESTful API** with JSON responses
- **Webhooks** for real-time updates
- **Rate Limits**: ~1,500 requests per minute
- **Pagination**: Automatic for large datasets

### API Endpoints We'll Use

```
Base:       https://app.asana.com/api/1.0
Workspaces: GET  /workspaces
Projects:   GET  /projects
Tasks:      GET  /projects/{project_gid}/tasks
Task:       GET  /tasks/{task_gid}
Webhooks:   POST /webhooks
```

### Data We'll Sync

| Asana Entity | NiceHR Mapping |
|--------------|----------------|
| Projects | Projects |
| Tasks | Project Tasks |
| Sections | Project Phases |
| Assignees | Consultants |

### Questions for You

1. Which Asana workspace(s) should we connect?
2. Do you want real-time sync (webhooks) or scheduled sync?
3. Should task updates in NiceHR sync back to Asana?

---

## 4. Jira (Issue Tracking)

### Purpose
Import Jira issues and sprints for technical implementation tracking.

### Credentials Required

| Credential | Description | Where to Get It |
|------------|-------------|-----------------|
| **Instance URL** | Jira Server/Cloud URL | `https://your-domain.atlassian.net` |
| **Email** | Atlassian account email | Your Atlassian login |
| **API Token** | Authentication token | Atlassian Account > Security > API tokens > Create |

### API Features

- **REST API v2/v3** (Cloud uses v3)
- **JQL** for powerful querying
- **Webhooks** for real-time updates
- **Rate Limits**: Varies by plan

### API Endpoints We'll Use

```
Base:       https://{domain}.atlassian.net/rest/api/3
Projects:   GET  /project
Issues:     GET  /search?jql={query}
Issue:      GET  /issue/{issueIdOrKey}
Create:     POST /issue
Sprints:    GET  /rest/agile/1.0/board/{boardId}/sprint
```

### Data We'll Sync

| Jira Entity | NiceHR Mapping |
|-------------|----------------|
| Issues | Support Tickets / Tasks |
| Projects | Projects |
| Sprints | Project Phases |
| Epics | Project Milestones |

### Questions for You

1. Are you using Jira Cloud or Jira Server?
2. Which projects should we sync?
3. Do you use Jira for EHR implementation tracking or general IT?

---

## 5. Consultant Matching Algorithm (For SOW Auto-Response)

### Current Matching Criteria

The system will score consultants based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills Match | 40% | Required skills vs consultant skills |
| EHR Experience | 25% | Epic, Cerner, MEDITECH expertise |
| Availability | 15% | Available during SOW dates |
| Rate Compatibility | 10% | Consultant rate vs SOW budget |
| Past Performance | 10% | Previous project success |

### Questions for You

1. Should we adjust these weights?
2. Are there mandatory skills that must match 100%?
3. Should location/travel willingness factor into matching?
4. Do you want to exclude certain consultants from auto-response?

---

## 6. Webhook Endpoints (What You'll Provide)

If using webhooks for real-time sync, NiceHR will expose:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/webhooks/fieldglass/sow` | Receive new SOW notifications |
| `POST /api/webhooks/servicenow/incident` | Receive incident updates |
| `POST /api/webhooks/asana/task` | Receive task updates |
| `POST /api/webhooks/jira/issue` | Receive issue updates |

**Your IT team may need to**:
- Whitelist NiceHR's IP addresses in firewalls
- Configure outbound webhooks in each system
- Set up SSL/TLS for secure communication

---

## 7. Implementation Phases

### Phase 1: Fieldglass SOW Auto-Response (Priority)
- [ ] You provide: Fieldglass credentials
- [ ] We build: OAuth connection, SOW polling, consultant matching
- [ ] We build: Auto-response submission
- [ ] Test: Respond to test SOW manually first

### Phase 2: ServiceNow Integration
- [ ] You provide: ServiceNow credentials
- [ ] We build: Incident/change sync
- [ ] Map: ServiceNow fields to NiceHR fields

### Phase 3: Asana & Jira
- [ ] You provide: API tokens
- [ ] We build: Project/task sync
- [ ] Optional: Bidirectional sync

---

## 8. Security Considerations

### Credential Storage
- All API keys/secrets encrypted at rest (AES-256)
- Stored in database `credentials` JSONB field (encrypted)
- Never logged or exposed in UI

### Data Handling
- PHI/PII filtered before storage
- Audit trail for all sync operations
- HIPAA-compliant data handling

### Access Control
- Integration management restricted to admin role
- Per-integration enable/disable controls
- Rate limiting on sync operations

---

## 9. Next Steps

### What You Need To Do

1. **SAP Fieldglass** (Highest Priority)
   - [ ] Confirm you have API access
   - [ ] Get OAuth credentials from SAP rep
   - [ ] Create API key in Fieldglass Integration Tools
   - [ ] Provide credentials in NiceHR Integration Hub

2. **ServiceNow**
   - [ ] Create integration user with `rest_service` role
   - [ ] Note instance URL
   - [ ] Optional: Create OAuth application

3. **Asana**
   - [ ] Generate Personal Access Token
   - [ ] Note workspace ID(s) to sync

4. **Jira**
   - [ ] Generate API token
   - [ ] Note instance URL and project keys

### What I'll Build Next

Once you provide Fieldglass credentials:
1. OAuth token management
2. SOW polling service (webhook or scheduled)
3. Consultant matching algorithm integration
4. Auto-response submission
5. Notification when response sent

---

## 10. Contact & Support

**Questions about this document?**
- Update this file with your answers
- Or discuss in our next session

**Credential handoff:**
- Use secure method (not email/chat)
- Add directly to NiceHR Integration Hub config
- Or use environment variables for initial setup

---

*This is a living document. Last updated by Claude on February 5, 2026.*
