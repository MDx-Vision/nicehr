// 09-scheduled-sessions.cy.js - Scheduled Sessions Tests (P2)
// Tests for scheduling, recurring sessions, and calendar management

describe('Scheduled Sessions', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 900;

  beforeEach(() => {
    testRequesterId++;
  });

  const getFutureDate = (daysAhead = 1, hour = 10) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  describe('Create Scheduled Session', () => {
    it('creates scheduled session', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        department: 'ER',
        scheduledAt: getFutureDate(1),
        durationMinutes: 30,
        topic: 'Scheduled session test',
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.be.a('number');
      });
    });

    it('validates required fields - requesterId', () => {
      cy.createScheduledSession({
        consultantId: 1,
        scheduledAt: getFutureDate(1),
        topic: 'Missing requester',
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('validates required fields - consultantId', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        scheduledAt: getFutureDate(1),
        topic: 'Missing consultant',
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('validates required fields - scheduledAt', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        topic: 'Missing time',
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('validates required fields - topic', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        scheduledAt: getFutureDate(1),
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('validates future date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        scheduledAt: pastDate.toISOString(),
        topic: 'Past date test',
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('future');
      });
    });

    it('sets default duration (30 min)', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(2),
        topic: 'Default duration test',
      }).then((response) => {
        expect(response.body.duration_minutes).to.eq(30);
      });
    });

    it('returns enriched response with names', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(3),
        topic: 'Enriched response test',
      }).then((response) => {
        expect(response.body).to.have.property('requesterName');
        expect(response.body).to.have.property('consultantName');
        expect(response.body).to.have.property('hospitalName');
      });
    });
  });

  describe('All-Day Sessions', () => {
    it('creates all-day session', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(4),
        topic: 'All-day session',
        isAllDay: true,
        allDayStartTime: '09:00',
        allDayEndTime: '17:00',
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.is_all_day).to.eq(true);
      });
    });

    it('calculates duration from time range', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(5),
        topic: 'Duration calc test',
        isAllDay: true,
        allDayStartTime: '08:00',
        allDayEndTime: '12:00',
      }).then((response) => {
        // 4 hours = 240 minutes
        expect(response.body.duration_minutes).to.eq(240);
      });
    });

    it('stores start/end times', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(6),
        topic: 'Store times test',
        isAllDay: true,
        allDayStartTime: '10:00',
        allDayEndTime: '16:00',
      }).then((response) => {
        expect(response.body.all_day_start_time).to.eq('10:00');
        expect(response.body.all_day_end_time).to.eq('16:00');
      });
    });
  });

  describe('Recurring Sessions', () => {
    it('creates daily recurring session', () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(1, 14),
        topic: 'Daily recurring',
        isRecurring: true,
        recurrencePattern: 'daily',
        recurrenceEndDate: endDate.toISOString(),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.is_recurring).to.eq(true);
        expect(response.body.recurrence_pattern).to.eq('daily');
      });
    });

    it('creates weekly recurring session', () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(1, 15),
        topic: 'Weekly recurring',
        isRecurring: true,
        recurrencePattern: 'weekly',
        recurrenceDays: '1,3,5', // Mon, Wed, Fri
        recurrenceEndDate: endDate.toISOString(),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.recurrence_pattern).to.eq('weekly');
      });
    });

    it('stores recurrence pattern', () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(2, 9),
        topic: 'Pattern storage test',
        isRecurring: true,
        recurrencePattern: 'biweekly',
        recurrenceDays: '2,4', // Tue, Thu
        recurrenceEndDate: endDate.toISOString(),
      }).then((response) => {
        expect(response.body.recurrence_pattern).to.eq('biweekly');
        expect(response.body.recurrence_days).to.eq('2,4');
      });
    });
  });

  describe('Session Updates', () => {
    it('updates scheduled time', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(7),
        topic: 'Update time test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;
        const newTime = getFutureDate(8);

        cy.updateScheduledSession(sessionId, {
          scheduledAt: newTime,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.scheduled_at).to.eq(newTime);
        });
      });
    });

    it('updates duration', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(9),
        topic: 'Update duration test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.updateScheduledSession(sessionId, {
          durationMinutes: 60,
        }).then((response) => {
          expect(response.body.duration_minutes).to.eq(60);
        });
      });
    });

    it('updates topic', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(10),
        topic: 'Original topic',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.updateScheduledSession(sessionId, {
          topic: 'Updated topic',
        }).then((response) => {
          expect(response.body.topic).to.eq('Updated topic');
        });
      });
    });

    it('updates notes', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(11),
        topic: 'Notes test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.updateScheduledSession(sessionId, {
          notes: 'Updated notes content',
        }).then((response) => {
          expect(response.body.notes).to.eq('Updated notes content');
        });
      });
    });

    it('returns 404 for non-existent session', () => {
      cy.updateScheduledSession(99999, {
        topic: 'Non-existent',
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Session Cancellation', () => {
    it('cancels scheduled session', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(12),
        topic: 'Will cancel',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.cancelScheduledSession(sessionId, testRequesterId, 'No longer needed').then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.eq(true);
        });
      });
    });

    it('requires authorized user', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(13),
        topic: 'Auth cancel test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        // Try to cancel as user 6 (not participant)
        cy.cancelScheduledSession(sessionId, 6, 'Unauthorized').then((response) => {
          expect(response.status).to.eq(403);
        });

        // Clean up with authorized user
        cy.cancelScheduledSession(sessionId, testRequesterId, 'Cleanup');
      });
    });

    it('stores cancellation reason', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(14),
        topic: 'Reason test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.cancelScheduledSession(sessionId, testRequesterId, 'Meeting moved to next week').then((response) => {
          expect(response.body.success).to.eq(true);
        });
      });
    });
  });

  describe('Session Confirmation', () => {
    it('consultant can confirm', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(15),
        topic: 'Confirm test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.confirmScheduledSession(sessionId, 1).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq('confirmed');
        });
      });
    });

    it('updates status to confirmed', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 2,
        hospitalId: 1,
        scheduledAt: getFutureDate(16),
        topic: 'Status confirm test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        cy.confirmScheduledSession(sessionId, 2).then((response) => {
          expect(response.body.status).to.eq('confirmed');
        });
      });
    });

    it('only assigned consultant can confirm', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: getFutureDate(17),
        topic: 'Wrong consultant test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        // Try to confirm as different consultant
        cy.confirmScheduledSession(sessionId, 2).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });
  });

  describe('Consultant Availability', () => {
    it('returns busy time slots', () => {
      // Create a session first
      const scheduledDate = getFutureDate(20);
      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: scheduledDate,
        topic: 'Availability test',
      }).then(() => {
        const dateOnly = scheduledDate.split('T')[0];
        cy.getConsultantAvailability(1, dateOnly).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
        });
      });
    });

    it('includes topic in busy slots', () => {
      cy.getConsultantAvailability(1).then((response) => {
        if (response.body.length > 0) {
          response.body.forEach((slot) => {
            expect(slot).to.have.property('topic');
          });
        }
      });
    });
  });

  describe('List Sessions', () => {
    it('returns user scheduled sessions', () => {
      cy.getScheduledSessions(testRequesterId, 'hospital_staff').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('filters by role (consultant)', () => {
      cy.getScheduledSessions(1, 'consultant').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('includes enriched names', () => {
      cy.getScheduledSessions(testRequesterId, 'hospital_staff').then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('requesterName');
          expect(response.body[0]).to.have.property('consultantName');
        }
      });
    });
  });

  describe('Upcoming Sessions', () => {
    it('returns sessions within time window', () => {
      cy.getUpcomingSessions(testRequesterId, 1440).then((response) => {
        // 1440 minutes = 24 hours
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('default window is 15 minutes', () => {
      cy.getUpcomingSessions(testRequesterId).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
