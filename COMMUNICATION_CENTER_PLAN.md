# Communication Center - Implementation Plan

## Overview
Build a Communication Center for bulk emailing consultants, announcements, and email campaign management.

**Value Proposition:** Centralized hub for all consultant communications - announcements, bulk emails, templates, and tracking.

---

## Implementation Checklist

### Phase 1: Database Schema
- [ ] Add `email_campaigns` table (id, name, subject, body, status, scheduledAt, sentAt, createdBy)
- [ ] Add `email_campaign_recipients` table (campaignId, consultantId, status, sentAt, openedAt, clickedAt)
- [ ] Add `email_templates` table (id, name, subject, body, category, isActive)
- [ ] Add `announcements` table (id, title, content, priority, targetAudience, publishedAt, expiresAt)
- [ ] Add feature flag `ENABLE_COMMUNICATION_CENTER`

### Phase 2: Backend API
- [ ] `GET /api/communications/campaigns` - List all campaigns
- [ ] `POST /api/communications/campaigns` - Create campaign
- [ ] `GET /api/communications/campaigns/:id` - Get campaign details
- [ ] `PATCH /api/communications/campaigns/:id` - Update campaign
- [ ] `DELETE /api/communications/campaigns/:id` - Delete campaign
- [ ] `POST /api/communications/campaigns/:id/send` - Send campaign
- [ ] `POST /api/communications/campaigns/:id/schedule` - Schedule campaign
- [ ] `GET /api/communications/campaigns/:id/stats` - Get open/click stats
- [ ] `GET /api/communications/templates` - List email templates
- [ ] `POST /api/communications/templates` - Create template
- [ ] `PATCH /api/communications/templates/:id` - Update template
- [ ] `DELETE /api/communications/templates/:id` - Delete template
- [ ] `GET /api/communications/announcements` - List announcements
- [ ] `POST /api/communications/announcements` - Create announcement
- [ ] `PATCH /api/communications/announcements/:id` - Update announcement
- [ ] `DELETE /api/communications/announcements/:id` - Delete announcement

### Phase 3: Frontend - Communication Center Hub
- [ ] Create `/communication` route in App.tsx
- [ ] Create `client/src/pages/Communication/index.tsx` - Main hub
- [ ] Add sidebar navigation item under appropriate section
- [ ] Build dashboard with stats cards:
  - Total campaigns sent
  - Open rate average
  - Active announcements
  - Scheduled campaigns
- [ ] Add tabs: Campaigns | Templates | Announcements | Analytics

### Phase 4: Email Campaigns UI
- [ ] Campaign list with status badges (draft, scheduled, sent, failed)
- [ ] Create campaign dialog with:
  - Subject line input
  - Rich text editor for body
  - Recipient selector (all consultants, by status, by skill, custom list)
  - Template selector dropdown
  - Schedule option (send now vs schedule)
- [ ] Campaign detail view with recipient list and stats
- [ ] Preview email before sending

### Phase 5: Email Templates UI
- [ ] Template list with categories (onboarding, scheduling, general, etc.)
- [ ] Create/edit template dialog
- [ ] Template preview
- [ ] Variable placeholders support ({{firstName}}, {{projectName}}, etc.)

### Phase 6: Announcements UI
- [ ] Announcement list with priority indicators
- [ ] Create/edit announcement dialog
- [ ] Target audience selector (all, by role, by project)
- [ ] Expiration date picker
- [ ] Dashboard widget showing active announcements

### Phase 7: Analytics & Tracking
- [ ] Campaign performance charts (open rate, click rate over time)
- [ ] Top performing campaigns table
- [ ] Recipient engagement breakdown
- [ ] Export campaign results to CSV

### Phase 8: Testing
- [ ] Create `cypress/e2e/57-communication-center.cy.js`
- [ ] Test campaign CRUD operations
- [ ] Test template management
- [ ] Test announcement management
- [ ] Test email sending flow (mocked)
- [ ] Test analytics display

---

## Database Schema

```sql
-- Email Campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
  recipient_filter JSONB, -- {type: 'all' | 'status' | 'skill' | 'custom', value: ...}
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Recipients
CREATE TABLE email_campaign_recipients (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  consultant_id VARCHAR(255) REFERENCES consultants(id),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  error_message TEXT
);

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(100), -- onboarding, scheduling, general, reminder
  variables JSONB, -- [{name: 'firstName', description: 'Consultant first name'}]
  is_active BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
  target_audience JSONB, -- {type: 'all' | 'role' | 'project', value: ...}
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## File Structure

```
client/src/pages/Communication/
  index.tsx          -- Main hub with tabs
  Campaigns.tsx      -- Campaign management
  Templates.tsx      -- Template management
  Announcements.tsx  -- Announcement management
  Analytics.tsx      -- Campaign analytics

server/routes/
  communication.ts   -- All API routes

cypress/e2e/
  57-communication-center.cy.js
```

---

## Estimated Effort

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| 1. Database | 5 tables + flag | 30 min |
| 2. Backend API | 16 endpoints | 2 hrs |
| 3. Hub UI | Dashboard + nav | 1.5 hrs |
| 4. Campaigns | CRUD + send | 2 hrs |
| 5. Templates | CRUD + preview | 1.5 hrs |
| 6. Announcements | CRUD + widget | 1 hr |
| 7. Analytics | Charts + export | 1.5 hrs |
| 8. Testing | E2E tests | 1.5 hrs |

**Total: ~12 hours**

---

## Ready to Start?

Run through the checklist above, checking off items as completed.
