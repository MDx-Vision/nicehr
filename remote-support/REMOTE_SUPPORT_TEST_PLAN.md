# Remote Support System - Comprehensive E2E Test Plan

## Overview

This document outlines the exhaustive E2E test coverage for the NiceHR Remote Support System.

**Goal**: Achieve 100% test coverage across all API endpoints, UI components, and user workflows.

**Test Framework**: Cypress 15.8.x
**Total Test Files**: 15
**Total Estimated Tests**: 725+

---

## Test Categories Summary

| Priority | Category | Test File | Tests | Status |
|----------|----------|-----------|-------|--------|
| P0 | Support Request Flow | `01-support-request.cy.js` | ~65 | ✅ Implemented |
| P0 | Support Queue Management | `02-support-queue.cy.js` | ~55 | ✅ Implemented |
| P0 | Video Call Session | `03-video-call.cy.js` | ~50 | ✅ Implemented |
| P0 | WebSocket Real-time | `04-websocket.cy.js` | ~45 | ✅ Implemented |
| P1 | Consultant Management | `05-consultant-mgmt.cy.js` | ~60 | ✅ Implemented |
| P1 | Smart Matching Algorithm | `06-smart-matching.cy.js` | ~45 | ✅ Implemented |
| P1 | Session Rating & Feedback | `07-rating-feedback.cy.js` | ~35 | ✅ Implemented |
| P1 | Analytics Dashboard | `08-analytics.cy.js` | ~55 | ✅ Implemented |
| P2 | Scheduled Sessions | `09-scheduled-sessions.cy.js` | ~65 | ✅ Implemented |
| P2 | Staff Preferences | `10-staff-preferences.cy.js` | ~40 | ✅ Implemented |
| P2 | Error Handling | `11-error-handling.cy.js` | ~50 | ✅ Implemented |
| P2 | Recording Management | `12-recording.cy.js` | ~35 | ✅ Implemented |
| P2 | Daily.co Integration | `13-daily-integration.cy.js` | ~40 | ✅ Implemented |
| P2 | Authorization & Security | `14-authorization.cy.js` | ~45 | ✅ Implemented |
| P2 | Edge Cases & Boundaries | `15-edge-cases.cy.js` | ~40 | ✅ Implemented |

**Total Estimated Tests: 725+**

---

## Running Tests

```bash
# Install dependencies
cd remote-support
npm install
npm run install:all

# Start the server (required for tests)
npm run dev:server

# In another terminal, run all tests
npm test

# Run tests by priority
npm run test:p0  # Critical path tests (01-04)
npm run test:p1  # Core feature tests (05-08)
npm run test:p2  # Advanced tests (09-15)

# Open Cypress interactive mode
npm run test:open
```

---

## P0 - Critical Path Tests

### 01-support-request.cy.js (~65 tests)

#### Request Creation
- [x] Creates support request with all required fields
- [x] Creates request with normal urgency
- [x] Creates request with urgent urgency
- [x] Creates request with critical urgency
- [x] Creates request for all 12 departments (ER, Pharmacy, Radiology, Lab, IT, etc.)
- [x] Returns session ID on successful creation
- [x] Sets status to pending when no consultant available
- [x] Sets status to connecting when consultant matched
- [x] Returns queue position when queued

#### Request Validation
- [x] Rejects request without requesterId
- [x] Rejects request without hospitalId
- [x] Rejects request without department
- [x] Rejects request without issueSummary
- [x] Rejects empty issueSummary
- [x] Rejects duplicate request from same user

#### Active Session Checks
- [x] GET /active returns null when no active session
- [x] GET /active returns session for pending request
- [x] GET /active returns session for connecting request
- [x] GET /active returns session for active request

#### Request Cancellation
- [x] Cancels pending request successfully
- [x] Removes cancelled request from queue
- [x] Returns 404 for non-existent session

#### Queue Position
- [x] Returns correct position for first in queue
- [x] Returns correct position with multiple requests
- [x] Calculates estimated wait time

---

### 02-support-queue.cy.js (~55 tests)

#### Queue Retrieval
- [x] Returns all pending requests in queue
- [x] Returns empty array when no pending requests
- [x] Enriches queue items with requester info
- [x] Enriches queue items with hospital info
- [x] Returns consistent JSON structure

#### Queue Filtering
- [x] Filters queue by department
- [x] Filters queue by urgency level
- [x] Returns empty for non-matching filter
- [x] Supports multiple filter combinations

#### Queue Priority
- [x] Sorts by urgency (critical first)
- [x] Sorts by timestamp within same urgency
- [x] Urgent comes before normal
- [x] Critical comes before urgent

#### Request Acceptance
- [x] Consultant can accept request from queue
- [x] Creates room URL on acceptance
- [x] Changes session status to connecting
- [x] Assigns consultant to session
- [x] Removes request from queue after acceptance

---

### 03-video-call.cy.js (~50 tests)

#### Session Join
- [x] Requester can join their session
- [x] Generates meeting token for requester
- [x] Returns room URL in response
- [x] Consultant can join matched session
- [x] Generates separate token for consultant

#### Session Start
- [x] Starts session when both participants join
- [x] Updates session status to active
- [x] Records session start timestamp
- [x] Updates consultant status to busy

#### Session End
- [x] Requester can end active session
- [x] Consultant can end active session
- [x] Updates session status to completed
- [x] Records session end timestamp
- [x] Calculates session duration
- [x] Updates consultant status back to available

#### Call Quality
- [x] Returns participant count during call
- [x] Tracks connection stability

---

### 04-websocket.cy.js (~45 tests)

#### WebSocket Health
- [x] WebSocket server is running
- [x] Health endpoint reports WebSocket status
- [x] Reports connected client count

#### Event Broadcasting
- [x] Broadcasts queue updates
- [x] Broadcasts status changes
- [x] Broadcasts new request notifications
- [x] Broadcasts session acceptance
- [x] Broadcasts session completion

#### Queue Position Updates
- [x] Notifies requesters of position changes
- [x] Updates all queued users when request accepted

---

## P1 - Core Feature Tests

### 05-consultant-mgmt.cy.js (~60 tests)

#### List Consultants
- [x] Returns all consultants (4 demo consultants)
- [x] Returns consultant name, email, status for each
- [x] Returns sessions today count
- [x] Returns last seen timestamp
- [x] Returns consultant specialties
- [x] Includes Sarah Chen (ER expert, ID: 1)
- [x] Includes Marcus Johnson (Radiology expert, ID: 2)
- [x] Includes Emily Rodriguez (Pharmacy expert, ID: 3)
- [x] Includes David Kim (IT expert, ID: 4)

#### Available Consultants
- [x] Returns only available consultants
- [x] Excludes offline consultants
- [x] Excludes busy consultants
- [x] Excludes away consultants

#### Status Management
- [x] Updates status to online, available, busy, away, offline
- [x] Rejects invalid status values
- [x] Prevents status change during active session
- [x] Broadcasts status change to clients

#### Specialties Management
- [x] Returns consultant specialties with department and proficiency
- [x] Updates specialties (replace all)
- [x] Supports expert and standard proficiency levels

#### Consultant Statistics
- [x] Returns total sessions, average duration, average rating
- [x] Returns sessions today count
- [x] Returns recent sessions list with details

---

### 06-smart-matching.cy.js (~45 tests)

#### Department Matching
- [x] Matches consultant by department specialty
- [x] Prefers expert over standard proficiency
- [x] Returns consultant with expertise score

#### Relationship Scoring
- [x] Adds +30 points for expert in department
- [x] Adds +15 points for standard in department
- [x] Adds +50 points for previous positive session
- [x] Adds +20 points for high average rating
- [x] Adds +40 points for favorite consultant

#### Load Balancing
- [x] Applies -10 per session today (rotation penalty)
- [x] Distributes requests among available consultants
- [x] Considers consultant current workload

#### Fallback Behavior
- [x] Falls back to any available consultant if no specialty match
- [x] Returns highest scoring consultant
- [x] Queues request if no consultants available

---

### 07-rating-feedback.cy.js (~35 tests)

#### Rating Submission
- [x] Submits rating 1-5 for completed session
- [x] Accepts rating without feedback
- [x] Accepts rating with feedback text
- [x] Stores rating timestamp
- [x] Links rating to consultant

#### Rating Validation
- [x] Rejects rating outside 1-5 range
- [x] Rejects rating for non-completed session
- [x] Rejects duplicate rating
- [x] Requires authenticated user

#### Preference Updates
- [x] Low rating (1-2) removes from preferred
- [x] High rating (5) offers to add to preferred
- [x] Updates staff preference relationship

---

### 08-analytics.cy.js (~55 tests)

#### Overview Metrics
- [x] Returns total sessions today/week/month
- [x] Returns average session duration
- [x] Returns average rating
- [x] Returns current queue length
- [x] Returns available consultant count

#### Department Analytics
- [x] Breaks down sessions by department
- [x] Shows percentage distribution
- [x] Identifies busiest departments

#### Hospital Analytics
- [x] Breaks down sessions by hospital
- [x] Shows request count per hospital
- [x] Calculates average wait time per hospital

#### Consultant Performance
- [x] Shows sessions per consultant
- [x] Shows average ratings per consultant
- [x] Shows average duration per consultant

#### Time Distribution
- [x] Shows hourly session distribution
- [x] Shows daily session counts
- [x] Identifies peak hours

---

## P2 - Advanced Tests

### 09-scheduled-sessions.cy.js (~65 tests)

#### Create Scheduled Session
- [x] Creates scheduled session with all fields
- [x] Creates all-day session
- [x] Creates recurring session (daily/weekly/biweekly/monthly)
- [x] Validates consultant availability
- [x] Prevents double-booking

#### Update Scheduled Session
- [x] Updates session time
- [x] Updates session duration
- [x] Updates session notes

#### Cancel Scheduled Session
- [x] Cancels by requester
- [x] Cancels by consultant
- [x] Notifies all participants

#### Recurring Sessions
- [x] Generates occurrences correctly
- [x] Respects recurrence end date
- [x] Handles until/count modes

#### Availability
- [x] Returns consultant schedule
- [x] Returns availability for date range
- [x] Excludes busy time slots

---

### 10-staff-preferences.cy.js (~40 tests)

#### Preferred Consultants
- [x] Returns preferred consultants list
- [x] Adds consultant to preferred list
- [x] Removes consultant from preferred list
- [x] Limits preferred list size

#### Staff Schedule
- [x] Returns staff availability
- [x] Updates staff schedule
- [x] Checks availability for time slot

---

### 11-error-handling.cy.js (~50 tests)

#### HTTP Status Codes
- [x] Returns 400 for bad request
- [x] Returns 401 for unauthorized
- [x] Returns 403 for forbidden
- [x] Returns 404 for not found
- [x] Returns 409 for conflict
- [x] Returns 500 for server error

#### Error Message Format
- [x] Returns consistent error structure
- [x] Includes error message
- [x] Includes error code

#### Input Validation
- [x] Validates required fields
- [x] Validates data types
- [x] Validates string lengths
- [x] Validates enum values

---

### 12-recording.cy.js (~35 tests)

#### Recording Configuration
- [x] Returns recording settings for session
- [x] Enables/disables recording
- [x] Respects HIPAA recording consent requirements

#### Transcription Features
- [x] Enables transcription for session
- [x] Retrieves transcription for completed session
- [x] Returns transcription in text format with timestamps

#### Recording Access Control
- [x] Restricts recording access to authorized users
- [x] Tracks recording access in audit log
- [x] Enforces retention policy

---

### 13-daily-integration.cy.js (~40 tests)

#### Room Management
- [x] Creates video room for session
- [x] Room URL follows expected format
- [x] Generates unique room names
- [x] Sets room expiration time
- [x] Deletes room after session ends

#### Token Generation
- [x] Generates meeting token for requester/consultant
- [x] Token includes user identity
- [x] Token has appropriate expiration
- [x] Prevents token generation for wrong user

#### Room Permissions
- [x] Enables video/audio by default
- [x] Supports screen sharing permission
- [x] Limits participants in room
- [x] Enforces privacy settings

#### HIPAA Compliance Features
- [x] Disables room recording by default
- [x] Enables end-to-end encryption option
- [x] Logs all room access for audit

---

### 14-authorization.cy.js (~45 tests)

#### Session Access Control
- [x] Requester can access their own session
- [x] Assigned consultant can access session
- [x] Unrelated user cannot join session
- [x] Only requester or consultant can end session

#### Rating Authorization
- [x] Only session requester can rate session
- [x] Non-requester cannot rate session
- [x] Consultant cannot rate their own session

#### Analytics Access
- [x] Consultants can view their own stats
- [x] Admins can view all analytics
- [x] Hospital-level analytics restricted to hospital

#### Role-Based Access
- [x] Admin has full access
- [x] Consultant has consultant permissions
- [x] Staff has staff permissions

---

### 15-edge-cases.cy.js (~40 tests)

#### Concurrent Sessions
- [x] Handles multiple simultaneous requests
- [x] Prevents duplicate session for same requester
- [x] Handles rapid creation and cancellation

#### Boundary Values
- [x] Handles maximum/minimum length issue summary
- [x] Handles empty issue summary
- [x] Handles rating at boundaries (1 and 5)
- [x] Rejects rating outside boundaries

#### Special Characters
- [x] Handles unicode in issue summary
- [x] Handles special characters in feedback
- [x] Handles SQL injection attempts

#### State Transitions
- [x] Cannot transition completed session to active
- [x] Cannot cancel active session
- [x] Handles ending already ended session
- [x] Handles rating already rated session

#### Non-Existent Resources
- [x] Handles non-existent session/consultant/staff/hospital ID
- [x] Handles negative IDs

#### Network Scenarios
- [x] Handles large payload
- [x] Handles malformed JSON
- [x] Handles missing content type

---

## Test Infrastructure

### Custom Cypress Commands (cypress/support/commands.js)

```javascript
// API Commands
cy.apiGet(endpoint)
cy.apiPost(endpoint, body)
cy.apiPatch(endpoint, body)
cy.apiDelete(endpoint)

// Support Request Commands
cy.createSupportRequest(options)
cy.cancelSupportRequest(sessionId, options)
cy.getSupportQueue()
cy.acceptSupportRequest(sessionId, options)

// Session Commands
cy.joinSupportSession(sessionId, options)
cy.startSupportSession(sessionId)
cy.endSupportSession(sessionId, options)
cy.rateSession(sessionId, options)

// Consultant Commands
cy.getAllConsultants()
cy.getAvailableConsultants()
cy.setConsultantStatus(consultantId, status)
cy.getConsultantSpecialties(consultantId)
cy.updateConsultantSpecialties(consultantId, specialties)
cy.getConsultantStats(consultantId)

// Analytics Commands
cy.getAnalyticsOverview()
cy.getAnalyticsByDepartment()
cy.getAnalyticsByHospital()
cy.getAnalyticsByConsultant()

// Schedule Commands
cy.createScheduledSession(options)
cy.updateScheduledSession(sessionId, options)
cy.cancelScheduledSession(sessionId, options)
cy.getConsultantSchedule(consultantId)

// Preferences Commands
cy.getStaffPreferences(staffId)
cy.addPreferredConsultant(staffId, consultantId)
cy.removePreferredConsultant(staffId, consultantId)

// Metadata Commands
cy.getDepartments()
```

---

## Configuration

### cypress.config.js

```javascript
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:3002',
    },
  },
});
```

---

## Test Data

Tests use the seeded demo data from `server/src/data/database.json`:

### Hospitals
1. Metro General Hospital
2. Riverside Medical Center
3. Valley Health System

### Consultants
1. Sarah Chen (ER expert)
2. Marcus Johnson (Radiology expert)
3. Emily Rodriguez (Pharmacy expert)
4. David Kim (IT expert)

### Staff (Requesters)
- IDs 5-14 across various hospitals and departments

### Departments (12 total)
ER, Pharmacy, Radiology, Lab, IT, Build, Registration, Billing, Nursing, Surgery, ICU, Outpatient

---

## Next Steps

1. Run tests: `npm test`
2. Fix any failing tests
3. Achieve 100% pass rate
4. Update documentation with final test results
