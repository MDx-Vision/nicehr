# NICEHR Remote Support System - Implementation Plan

## Overview

**Goal**: Build a live remote support system where hospital staff can instantly connect with available NICEHR consultants via video call and screen sharing.

**Tech Stack**:
- Daily.co for video/audio/screen share (10K free min/month, HIPAA available at $500/mo)
- Existing NICEHR WebSocket for real-time updates
- React + TypeScript frontend
- Express backend

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Instant Connection** | No waiting - connect in seconds when consultant available |
| **Smart Matching** | Staff history + Department specialty = Best consultant |
| **Relationship Building** | System learns who works well together over time |
| **Dedicated Support** | Staff can request all-day or recurring support |
| **Unlimited Duration** | Sessions last as long as needed |
| **HIPAA Compliant** | Enterprise-grade security with BAA (production) |

---

## Matching Logic

```
Staff requests support
         ↓
    Step 1: Staff's preferred consultant (past relationship)
         ↓
    Available? → Instant connect
         ↓
    Step 2: General pool - SMART MATCH
         ├── A) Someone this staff worked with before + same department
         ├── B) Someone this staff worked with before + any department  
         ├── C) Department specialist (never worked together)
         └── D) Any available (last resort)
         ↓
    None available → Queue (same priority order when someone frees up)
```

### Smart Match Scoring

| Factor | Points |
|--------|--------|
| Worked with this staff before | +50 |
| Each past successful session together | +5 |
| High rating from this staff (4-5 stars) | +20 |
| Department expert match | +30 |
| Department standard match | +15 |
| Same hospital experience (worked with others there) | +10 |
| Currently available (not just "online") | Required |

**Highest score wins.**

---

## Phase 1: Foundation (Day 1)

### Database Schema

```sql
-- Support session status tracking
CREATE TABLE support_sessions (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER REFERENCES hospitals(id),
  requester_id INTEGER REFERENCES users(id),      -- Hospital staff requesting help
  consultant_id INTEGER REFERENCES users(id),     -- Assigned consultant
  department VARCHAR(100),                         -- ER, Pharmacy, Radiology, etc.
  urgency VARCHAR(20) DEFAULT 'normal',           -- normal, urgent, critical
  status VARCHAR(20) DEFAULT 'pending',           -- pending, connecting, active, completed, cancelled
  daily_room_name VARCHAR(255),                   -- Daily.co room identifier
  daily_room_url VARCHAR(500),                    -- Full Daily.co room URL
  issue_summary TEXT,                             -- Brief description of issue
  resolution_notes TEXT,                          -- How it was resolved
  started_at TIMESTAMP,                           -- When call connected
  ended_at TIMESTAMP,                             -- When call ended
  wait_time_seconds INTEGER,                      -- Time from request to connection
  duration_seconds INTEGER,                       -- Total call duration
  rating INTEGER,                                 -- 1-5 star rating from requester
  feedback TEXT,                                  -- Optional feedback
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultant availability and specialties
CREATE TABLE consultant_availability (
  id SERIAL PRIMARY KEY,
  consultant_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'offline',           -- online, available, busy, away, offline
  current_session_id INTEGER REFERENCES support_sessions(id),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultant department specialties
CREATE TABLE consultant_specialties (
  id SERIAL PRIMARY KEY,
  consultant_id INTEGER REFERENCES users(id),
  department VARCHAR(100),                        -- ER, Pharmacy, Radiology, etc.
  proficiency VARCHAR(20) DEFAULT 'standard',    -- standard, expert
  created_at TIMESTAMP DEFAULT NOW()
);

-- Support queue for pending requests
CREATE TABLE support_queue (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES support_sessions(id),
  position INTEGER,                               -- Queue position
  estimated_wait_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff-Consultant preferences (individual relationships)
CREATE TABLE staff_consultant_preferences (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES users(id),     -- Hospital staff member
  consultant_id INTEGER REFERENCES users(id),
  preference_level INTEGER DEFAULT 1,        -- 1 = first choice, 2 = backup, etc.
  successful_sessions INTEGER DEFAULT 0,     -- Auto-tracked relationship strength
  last_session_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(staff_id, consultant_id)
);
```

### Daily.co Account Setup

1. Sign up at [daily.co](https://www.daily.co)
2. Get API key from dashboard
3. Add to environment variables:
   ```
   DAILY_API_KEY=your_api_key_here
   DAILY_DOMAIN=your-domain.daily.co
   ```

---

## Phase 2: Backend API (Day 2)

### Daily.co Service (`server/services/daily.ts`)

```typescript
// Functions needed:
- createRoom(sessionId: string): Promise<{ name: string, url: string }>
- deleteRoom(roomName: string): Promise<void>
- createMeetingToken(roomName: string, participantId: string, isOwner: boolean): Promise<string>
- getRoomInfo(roomName: string): Promise<RoomInfo>
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support/request` | Hospital staff requests support |
| GET | `/api/support/queue` | Get current queue status |
| POST | `/api/support/accept/:sessionId` | Consultant accepts request |
| POST | `/api/support/join/:sessionId` | Get Daily.co token to join call |
| POST | `/api/support/end/:sessionId` | End support session |
| POST | `/api/support/rate/:sessionId` | Rate completed session |
| GET | `/api/support/history` | Get past support sessions |
| GET | `/api/support/active` | Get user's active session |
| GET | `/api/consultants/available` | List available consultants |
| POST | `/api/consultants/status` | Update consultant availability |
| GET | `/api/consultants/specialties` | Get consultant specialties |
| POST | `/api/consultants/specialties` | Update consultant specialties |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `support_request_new` | Server → Consultants | New support request in queue |
| `support_request_accepted` | Server → Requester | Consultant accepted, ready to connect |
| `support_session_started` | Server → Both | Call connected |
| `support_session_ended` | Server → Both | Call ended |
| `consultant_status_changed` | Server → All | Consultant availability changed |
| `queue_position_update` | Server → Requester | Queue position changed |

---

## Phase 3: Frontend Components (Day 3-4)

### New Pages

| Page | Route | Description |
|------|-------|-------------|
| Support Request | `/support/request` | Hospital staff request help |
| Support Queue | `/support/queue` | Consultant view of pending requests |
| Video Call | `/support/call/:sessionId` | Active video call interface |
| Support History | `/support/history` | Past sessions and analytics |
| Consultant Settings | `/support/settings` | Availability and specialties |

### Component Structure

```
client/src/
├── pages/
│   └── support/
│       ├── RequestSupport.tsx      # Hospital staff request form
│       ├── SupportQueue.tsx        # Consultant queue view
│       ├── VideoCall.tsx           # Active call interface
│       ├── SupportHistory.tsx      # Past sessions
│       └── ConsultantSettings.tsx  # Availability settings
├── components/
│   └── support/
│       ├── RequestForm.tsx         # Support request form
│       ├── QueueCard.tsx           # Single queue item
│       ├── ConsultantCard.tsx      # Available consultant display
│       ├── VideoRoom.tsx           # Daily.co video embed
│       ├── ScreenShareButton.tsx   # Toggle screen share
│       ├── CallControls.tsx        # Mute, end call, etc.
│       ├── WaitingRoom.tsx         # While waiting for consultant
│       ├── RatingModal.tsx         # Post-call rating
│       └── StatusBadge.tsx         # Online/busy/away indicator
├── hooks/
│   └── support/
│       ├── useDaily.ts             # Daily.co SDK wrapper
│       ├── useSupportSession.ts    # Session state management
│       ├── useConsultantStatus.ts  # Availability management
│       └── useSupportQueue.ts      # Queue real-time updates
└── lib/
    └── daily.ts                    # Daily.co initialization
```

---

## Phase 4: Daily.co Integration (Day 4-5)

### Install Daily.co SDK

```bash
npm install @daily-co/daily-js
```

### Daily.co Hook (`client/src/hooks/support/useDaily.ts`)

```typescript
// Key functions:
- joinCall(roomUrl: string, token: string): Promise<void>
- leaveCall(): void
- toggleMicrophone(): void
- toggleCamera(): void
- toggleScreenShare(): void
- getParticipants(): Participant[]

// Key state:
- isJoined: boolean
- isMicEnabled: boolean
- isCameraEnabled: boolean
- isScreenSharing: boolean
- participants: Participant[]
- error: string | null
```

---

## Phase 5: Real-time Queue System (Day 5-6)

### Queue Logic

```typescript
// When support request created:
1. Create support_session record (status: pending)
2. Create Daily.co room
3. Add to support_queue
4. Broadcast to available consultants via WebSocket
5. Start wait timer

// When consultant accepts:
1. Update session (status: connecting, consultant_id)
2. Remove from queue
3. Notify requester via WebSocket
4. Generate Daily.co tokens for both parties
5. Record wait_time_seconds

// When call connects:
1. Update session (status: active, started_at)
2. Notify both parties

// When call ends:
1. Update session (status: completed, ended_at, duration_seconds)
2. Delete Daily.co room
3. Prompt for rating
4. Update staff_consultant_preferences (increment successful_sessions)
```

---

## Phase 6: Navigation & Access (Day 6)

### Role-Based Access

| Feature | Admin | Consultant | Hospital Staff | Hospital Leadership |
|---------|-------|------------|----------------|---------------------|
| Request support | ✅ | ❌ | ✅ | ✅ |
| View queue | ✅ | ✅ | ❌ | ❌ |
| Accept requests | ✅ | ✅ | ❌ | ❌ |
| Set availability | ✅ | ✅ | ❌ | ❌ |
| View all history | ✅ | ❌ | ❌ | ✅ |
| View analytics | ✅ | ❌ | ❌ | ✅ |

---

## Phase 7: Analytics & Reporting (Day 7)

### Metrics to Track

| Metric | Description |
|--------|-------------|
| Avg wait time | Time from request to connection |
| Avg call duration | How long sessions last |
| Resolution rate | % resolved on first call |
| Consultant utilization | % time in calls vs available |
| Requests by department | Which areas need most help |
| Requests by hospital | Which hospitals need most support |
| Peak hours | When most requests come in |
| Rating average | Quality of support |

---

## Implementation Order

| Day | Tasks | Deliverable |
|-----|-------|-------------|
| **Day 1** | Database schema, Daily.co account setup | Schema migration, API keys |
| **Day 2** | Backend API endpoints, Daily.co service | Working API endpoints |
| **Day 3** | Frontend pages structure, routing | Page shells with navigation |
| **Day 4** | Request support form, consultant queue UI | Request and queue working |
| **Day 5** | Daily.co integration, video room component | Video calls working |
| **Day 6** | Real-time WebSocket events, matching logic | Live queue updates |
| **Day 7** | Analytics, history, ratings | Full feature complete |
| **Day 8** | Testing, bug fixes, polish | Production ready |

---

## Files to Create

```
server/
├── services/
│   └── daily.ts                    # Daily.co API wrapper
├── routes/
│   └── support.ts                  # Support endpoints

client/src/
├── pages/
│   └── support/
│       ├── index.tsx               # Support landing/router
│       ├── RequestSupport.tsx
│       ├── SupportQueue.tsx
│       ├── VideoCall.tsx
│       ├── SupportHistory.tsx
│       └── ConsultantSettings.tsx
├── components/
│   └── support/
│       ├── RequestForm.tsx
│       ├── QueueCard.tsx
│       ├── ConsultantCard.tsx
│       ├── VideoRoom.tsx
│       ├── CallControls.tsx
│       ├── WaitingRoom.tsx
│       ├── RatingModal.tsx
│       └── StatusBadge.tsx
├── hooks/
│   └── support/
│       ├── useDaily.ts
│       ├── useSupportSession.ts
│       ├── useConsultantStatus.ts
│       └── useSupportQueue.ts
```

---

## Pricing Model (For Reference)

### Cost

| Provider | Cost Calculation | Monthly |
|----------|------------------|---------|
| Daily.co | First 10K min FREE, then $0.004/min | ~$90 for 22,500 min |
| HIPAA Add-on | Required for production | $500/mo |

### Revenue Tiers

| Tier | What They Get | You Charge | Profit |
|------|---------------|------------|--------|
| **Basic** | Email/ticket support only | $500/mo | $500 |
| **Professional** | Basic + live chat, 4hr response | $1,500/mo | $1,480 |
| **Premium** | Professional + video/screenshare, 1hr response | $3,500/mo | $3,450 |
| **Enterprise** | Premium + dedicated consultant, 15min response | $8,000/mo | $7,800 |

---

## Future Enhancements

| Feature | Priority | Effort |
|---------|----------|--------|
| Session recording | Medium | 2 days |
| Chat during call | Medium | 1 day |
| File sharing | Medium | 2 days |
| Call transfer | Low | 2 days |
| Scheduled sessions | Low | 3 days |
| Mobile app support | Low | 5 days |
| AI call summary | Low | 3 days |
