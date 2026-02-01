# NiceHR API Reference

**Version:** 1.0
**Base URL:** `/api`
**Authentication:** Session-based (cookie)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Consultants](#consultants)
4. [Hospitals](#hospitals)
5. [Projects](#projects)
6. [CRM](#crm)
7. [TDR (Technical Dress Rehearsal)](#tdr-technical-dress-rehearsal)
8. [ESIGN](#esign)
9. [Support Tickets](#support-tickets)
10. [Schedules](#schedules)
11. [Invoices](#invoices)
12. [Expenses](#expenses)
13. [Timesheets](#timesheets)
14. [Contracts](#contracts)
15. [Travel](#travel)
16. [Analytics](#analytics)
17. [Admin](#admin)
18. [Error Handling](#error-handling)

---

## Overview

### Request Format

All requests should include:
- `Content-Type: application/json` for POST/PATCH/PUT requests
- Session cookie for authentication

### Response Format

```json
{
  "data": { ... },
  "message": "Success message",
  "error": "Error message (if applicable)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Authentication

### Get Current User

```http
GET /api/auth/user
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin"
}
```

### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Session Info

```http
GET /api/auth/session
```

---

## Dashboard

### Get Dashboard Stats

```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "activeProjects": 12,
  "totalConsultants": 45,
  "pendingTasks": 8,
  "openTickets": 15
}
```

### Get User Tasks

```http
GET /api/dashboard/tasks
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Max results (default: 10) |
| status | string | Filter by status |

### Get Calendar Events

```http
GET /api/dashboard/calendar-events
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| start | date | Start date |
| end | date | End date |

### Complete Task

```http
POST /api/dashboard/tasks/:id/complete
```

---

## Consultants

### List Consultants

```http
GET /api/consultants
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name |
| status | string | Filter by status |
| skills | string[] | Filter by skills |

**Response:**
```json
[
  {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "555-1234",
    "status": "active",
    "skills": ["Epic", "Cerner"],
    "yearsExperience": 8
  }
]
```

### Get Consultant

```http
GET /api/consultants/:id
```

### Create Consultant

```http
POST /api/consultants
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "555-1234",
  "skills": ["Epic", "Cerner"]
}
```

### Update Consultant

```http
PATCH /api/consultants/:id
```

### Get Consultant Documents

```http
GET /api/consultants/:consultantId/documents
```

### Upload Consultant Document

```http
POST /api/consultants/:consultantId/documents
```

**Body (multipart/form-data):**
| Field | Type | Description |
|-------|------|-------------|
| file | file | Document file |
| type | string | Document type |
| name | string | Document name |

### Get Consultant Availability

```http
GET /api/consultants/:consultantId/availability
```

### Set Consultant Availability

```http
POST /api/consultants/:consultantId/availability
```

### Get Consultant Ratings

```http
GET /api/consultants/:consultantId/ratings
```

### Add Consultant Rating

```http
POST /api/consultants/:consultantId/ratings
```

---

## Hospitals

### List Hospitals

```http
GET /api/hospitals
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Memorial Hospital",
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "ehrSystem": "Epic",
    "bedCount": 500,
    "facilityType": "Acute Care"
  }
]
```

### Get Hospital

```http
GET /api/hospitals/:id
```

### Create Hospital

```http
POST /api/hospitals
```

**Required Permission:** `hospitals:create` or `admin:manage`

### Update Hospital

```http
PATCH /api/hospitals/:id
```

**Required Permission:** `hospitals:edit` or `admin:manage`

### Delete Hospital

```http
DELETE /api/hospitals/:id
```

**Required Permission:** `hospitals:delete`

### Get Hospital Units

```http
GET /api/hospitals/:hospitalId/units
```

### Create Hospital Unit

```http
POST /api/hospitals/:hospitalId/units
```

---

## Projects

### List Projects

```http
GET /api/projects
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| hospitalId | number | Filter by hospital |

### Get Project

```http
GET /api/projects/:id
```

### Create Project

```http
POST /api/projects
```

**Required Role:** admin

**Body:**
```json
{
  "name": "Epic Implementation",
  "hospitalId": 1,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "status": "active",
  "budget": 500000
}
```

### Update Project

```http
PATCH /api/projects/:id
```

### Delete Project

```http
DELETE /api/projects/:id
```

### Get Project Requirements

```http
GET /api/projects/:projectId/requirements
```

### Get Project Budget

```http
GET /api/projects/:projectId/budget
```

### Get Project Schedules

```http
GET /api/projects/:projectId/schedules
```

---

## CRM

### Dashboard

```http
GET /api/crm/dashboard
```

**Response:**
```json
{
  "contacts": { "total": 150, "leads": 80, "customers": 70 },
  "companies": { "total": 45, "prospects": 20, "customers": 25 },
  "deals": { "total": 30, "open": 15, "totalValue": 2500000, "wonValue": 1000000 },
  "activities": { "total": 500, "today": 12, "upcoming": 25 }
}
```

### Contacts

#### List Contacts
```http
GET /api/crm/contacts
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search by name/email |
| type | string | lead, customer, partner, vendor |
| companyId | number | Filter by company |

#### Get Contact
```http
GET /api/crm/contacts/:id
```

#### Create Contact
```http
POST /api/crm/contacts
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@hospital.com",
  "phone": "555-1234",
  "type": "lead",
  "companyId": 1,
  "title": "CIO"
}
```

#### Update Contact
```http
PATCH /api/crm/contacts/:id
```

#### Delete Contact
```http
DELETE /api/crm/contacts/:id
```

### Companies

#### List Companies
```http
GET /api/crm/companies
```

#### Get Company
```http
GET /api/crm/companies/:id
```

#### Create Company
```http
POST /api/crm/companies
```

**Body:**
```json
{
  "name": "Memorial Health System",
  "type": "prospect",
  "ehrSystem": "Epic",
  "bedCount": 500,
  "facilityType": "Health System",
  "website": "https://memorial.org"
}
```

#### Update Company
```http
PATCH /api/crm/companies/:id
```

#### Delete Company
```http
DELETE /api/crm/companies/:id
```

### Deals

#### List Deals
```http
GET /api/crm/deals
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| pipelineId | number | Filter by pipeline |
| stageId | number | Filter by stage |
| status | string | open, won, lost |

#### Get Deal
```http
GET /api/crm/deals/:id
```

#### Create Deal
```http
POST /api/crm/deals
```

**Body:**
```json
{
  "name": "Epic Implementation - Memorial",
  "amount": 500000,
  "probability": 75,
  "expectedCloseDate": "2026-06-30",
  "pipelineId": 1,
  "stageId": 3,
  "contactId": 1,
  "companyId": 1
}
```

#### Update Deal
```http
PATCH /api/crm/deals/:id
```

#### Delete Deal
```http
DELETE /api/crm/deals/:id
```

### Pipelines

#### List Pipelines
```http
GET /api/crm/pipelines
```

#### Create Pipeline
```http
POST /api/crm/pipelines
```

#### Add Pipeline Stage
```http
POST /api/crm/pipelines/:id/stages
```

### Activities

#### List Activities
```http
GET /api/crm/activities
```

#### Create Activity
```http
POST /api/crm/activities
```

**Body:**
```json
{
  "type": "call",
  "subject": "Discovery call",
  "notes": "Discussed EHR requirements",
  "contactId": 1,
  "companyId": 1,
  "dealId": 1
}
```

### Tasks

#### List CRM Tasks
```http
GET /api/crm/tasks
```

#### Create CRM Task
```http
POST /api/crm/tasks
```

---

## TDR (Technical Dress Rehearsal)

### Events

#### List TDR Events
```http
GET /api/tdr/events
```

#### Get TDR Event
```http
GET /api/tdr/events/:id
```

#### Create TDR Event
```http
POST /api/tdr/events
```

**Body:**
```json
{
  "projectId": 1,
  "name": "TDR #1 - Core Systems",
  "scheduledDate": "2026-03-15",
  "description": "First technical dress rehearsal"
}
```

#### Update TDR Event
```http
PATCH /api/tdr/events/:id
```

### Issues

#### List TDR Issues
```http
GET /api/tdr/issues
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| eventId | number | Filter by event |
| severity | string | critical, high, medium, low |
| status | string | open, in_progress, resolved |

#### Create TDR Issue
```http
POST /api/tdr/issues
```

**Body:**
```json
{
  "eventId": 1,
  "title": "Interface timeout",
  "description": "ADT interface timing out after 30 seconds",
  "severity": "high",
  "category": "technical"
}
```

#### Create Ticket from Issue
```http
POST /api/tdr/issues/:id/create-ticket
```

### Checklists

#### List Checklists
```http
GET /api/tdr/checklists
```

#### Create Checklist
```http
POST /api/tdr/checklists
```

#### Update Checklist Item
```http
PATCH /api/tdr/checklists/:id/items/:itemId
```

### Readiness

#### Get Readiness Score
```http
GET /api/tdr/readiness/:projectId
```

**Response:**
```json
{
  "overallScore": 78,
  "domains": {
    "technical": { "score": 85, "weight": 30 },
    "dataMigration": { "score": 70, "weight": 20 },
    "staffTraining": { "score": 80, "weight": 25 },
    "supportInfrastructure": { "score": 75, "weight": 15 },
    "processDocumentation": { "score": 72, "weight": 10 }
  },
  "status": "on_track"
}
```

---

## ESIGN

### Get Disclosure

```http
GET /api/esign/disclosure
```

### Submit Consent

```http
POST /api/contracts/:id/esign/consent
```

**Body:**
```json
{
  "signerId": 1,
  "hardwareSoftwareConsent": true,
  "paperCopyConsent": true,
  "withdrawalConsent": true,
  "ipAddress": "192.168.1.1"
}
```

### Start Review

```http
POST /api/contracts/:id/esign/review-start
```

### Update Review Progress

```http
PATCH /api/contracts/:id/esign/review-progress
```

**Body:**
```json
{
  "signerId": 1,
  "scrollPercentage": 100
}
```

### Sign Document

```http
POST /api/contracts/:signerId/esign/sign
```

**Body:**
```json
{
  "contractId": 1,
  "signatureData": "data:image/png;base64,...",
  "typedName": "John Doe",
  "intentConfirmed": true,
  "ipAddress": "192.168.1.1"
}
```

### Verify Document

```http
GET /api/contracts/:id/esign/verify
```

**Response:**
```json
{
  "isValid": true,
  "originalHash": "abc123...",
  "currentHash": "abc123...",
  "hashAlgorithm": "SHA-256",
  "verifiedAt": "2026-01-19T12:00:00Z"
}
```

### Get Certificate

```http
GET /api/contracts/:id/esign/certificate
```

### Get Audit Trail

```http
GET /api/contracts/:id/esign/audit-trail
```

---

## Support Tickets

### List Tickets

```http
GET /api/support-tickets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | open, in_progress, resolved, closed |
| priority | string | low, medium, high, critical |
| assigneeId | number | Filter by assignee |

### Get Ticket

```http
GET /api/support-tickets/:id
```

### Create Ticket

```http
POST /api/support-tickets
```

**Body:**
```json
{
  "title": "Login issue",
  "description": "Unable to access system",
  "priority": "high",
  "category": "technical",
  "projectId": 1
}
```

### Update Ticket

```http
PATCH /api/support-tickets/:id
```

### Delete Ticket

```http
DELETE /api/support-tickets/:id
```

### Add Comment

```http
POST /api/support-tickets/:id/comments
```

### Add Attachment

```http
POST /api/support-tickets/:id/attachments
```

---

## Schedules

### List Schedules

```http
GET /api/schedules
```

### Get Schedule

```http
GET /api/schedules/:id
```

### Create Schedule

```http
POST /api/schedules
```

**Body:**
```json
{
  "consultantId": 1,
  "projectId": 1,
  "date": "2026-01-20",
  "shiftType": "day",
  "startTime": "08:00",
  "endTime": "17:00"
}
```

### Update Schedule

```http
PATCH /api/schedules/:id
```

### Delete Schedule

```http
DELETE /api/schedules/:id
```

### Get Consultant Schedules

```http
GET /api/consultants/:consultantId/schedules
```

---

## Invoices

### List Invoices

```http
GET /api/invoices
```

### Get Invoice

```http
GET /api/invoices/:id
```

### Create Invoice

```http
POST /api/invoices
```

**Body:**
```json
{
  "projectId": 1,
  "hospitalId": 1,
  "invoiceNumber": "INV-2026-001",
  "dueDate": "2026-02-19",
  "lineItems": [
    {
      "description": "Consulting services",
      "quantity": 40,
      "rate": 150,
      "amount": 6000
    }
  ]
}
```

### Update Invoice

```http
PATCH /api/invoices/:id
```

### Delete Invoice

```http
DELETE /api/invoices/:id
```

### Send Invoice

```http
POST /api/invoices/:id/send
```

### Record Payment

```http
POST /api/invoices/:id/payment
```

---

## Expenses

### List Expenses

```http
GET /api/expenses
```

### Create Expense

```http
POST /api/expenses
```

**Body:**
```json
{
  "projectId": 1,
  "category": "travel",
  "amount": 350.00,
  "description": "Flight to client site",
  "date": "2026-01-15"
}
```

### Update Expense

```http
PATCH /api/expenses/:id
```

### Delete Expense

```http
DELETE /api/expenses/:id
```

### Approve Expense

```http
POST /api/expenses/:id/approve
```

### Reject Expense

```http
POST /api/expenses/:id/reject
```

---

## Timesheets

### List Timesheets

```http
GET /api/timesheets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| consultantId | number | Filter by consultant |
| projectId | number | Filter by project |
| startDate | date | Filter by start date |
| endDate | date | Filter by end date |

### Create Timesheet Entry

```http
POST /api/timesheets
```

**Body:**
```json
{
  "consultantId": 1,
  "projectId": 1,
  "date": "2026-01-19",
  "hours": 8,
  "description": "EHR configuration",
  "billable": true
}
```

### Update Timesheet

```http
PATCH /api/timesheets/:id
```

### Delete Timesheet

```http
DELETE /api/timesheets/:id
```

### Submit for Approval

```http
POST /api/timesheets/:id/submit
```

### Approve Timesheet

```http
POST /api/timesheets/:id/approve
```

---

## Contracts

### List Contracts

```http
GET /api/contracts
```

### Get Contract

```http
GET /api/contracts/:id
```

### Create Contract

```http
POST /api/contracts
```

### Update Contract

```http
PATCH /api/contracts/:id
```

### Delete Contract

```http
DELETE /api/contracts/:id
```

### Get Contract Signers

```http
GET /api/contracts/:id/signers
```

### Add Signer

```http
POST /api/contracts/:id/signers
```

---

## Travel

### List Travel Bookings

```http
GET /api/travel-bookings
```

### Create Travel Booking

```http
POST /api/travel-bookings
```

### Update Travel Booking

```http
PATCH /api/travel-bookings/:id
```

### Delete Travel Booking

```http
DELETE /api/travel-bookings/:id
```

### Get Travel Itineraries

```http
GET /api/travel-itineraries
```

---

## Analytics

### Get Dashboard Analytics

```http
GET /api/analytics/dashboard
```

### Get Project Analytics

```http
GET /api/analytics/projects
```

### Get Consultant Analytics

```http
GET /api/analytics/consultants
```

### Get Financial Analytics

```http
GET /api/analytics/financial
```

### Get Custom Report

```http
POST /api/analytics/custom-report
```

**Body:**
```json
{
  "metrics": ["revenue", "utilization"],
  "dimensions": ["project", "month"],
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  }
}
```

### Export Report

```http
POST /api/analytics/export
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | csv, excel, pdf |

---

## Admin

### Seed Demo Data

```http
POST /api/admin/seed-demo-data
```

### Get Email Logs

```http
GET /api/admin/email-logs
```

### Get Email Stats

```http
GET /api/admin/email-stats
```

### Access Rules

#### List Access Rules
```http
GET /api/admin/access-rules
```

#### Create Access Rule
```http
POST /api/admin/access-rules
```

#### Update Access Rule
```http
PUT /api/admin/access-rules/:id
```

#### Delete Access Rule
```http
DELETE /api/admin/access-rules/:id
```

### Get Access Audit Log

```http
GET /api/admin/access-audit
```

### User Invitations

#### List Invitations
```http
GET /api/admin/invitations
```

#### Create Invitation
```http
POST /api/admin/invitations
```

#### Resend Invitation
```http
POST /api/admin/invitations/:id/resend
```

#### Revoke Invitation
```http
DELETE /api/admin/invitations/:id
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |

### Rate Limiting

API requests are limited to:
- 100 requests per minute for standard endpoints
- 10 requests per minute for resource-intensive operations

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642531200
```

---

## WebSocket Events

### Connection

```javascript
const ws = new WebSocket('wss://yourdomain.com/ws');
```

### Events

| Event | Description |
|-------|-------------|
| `ticket_update` | Support ticket updated |
| `schedule_change` | Schedule modified |
| `activity_created` | New activity logged |
| `consultant_status` | Consultant status changed |
| `support_queue_update` | Remote support queue update |

### Message Format

```json
{
  "event": "ticket_update",
  "data": {
    "ticketId": 123,
    "status": "resolved"
  }
}
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| sort | string | createdAt | Sort field |
| order | string | desc | Sort order (asc/desc) |

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Per-Page: 20
X-Total-Pages: 8
```

---

*Last Updated: January 19, 2026*
