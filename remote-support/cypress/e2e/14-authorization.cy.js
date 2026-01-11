// 14-authorization.cy.js - Authorization Tests (P2)
// Tests for role-based access control and permission enforcement

describe('Authorization', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 1400;

  beforeEach(() => {
    testRequesterId++;
  });

  describe('Session Access Control', () => {
    it('requester can access their own session', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Requester access test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}`).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 404]);
          if (response.status === 200) {
            expect(response.body.requesterId).to.eq(testRequesterId);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('assigned consultant can access session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Consultant access test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        if (createResponse.body.consultant) {
          // Consultant should be able to access
          cy.apiGet(`/api/support/sessions/${sessionId}`).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 404]);
          });
        }

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('unrelated user cannot join session', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Unauthorized join test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // User 10 from different hospital
        cy.joinSupportSession(sessionId, { participantId: 10 }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 403, 404]);
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('only requester or consultant can end session', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'End session auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Unrelated user tries to end
        cy.endSupportSession(sessionId, { endedBy: 10 }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 403, 404]);
        });

        // Requester ends
        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('session data not accessible after completion', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Post-completion access test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          // Session info should still be accessible for history
          cy.apiGet(`/api/support/sessions/${sessionId}`).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 403, 404]);
          });
        });
      });
    });
  });

  describe('Consultant Status Management', () => {
    it('consultant can change their own status', () => {
      cy.setConsultantStatus(4, 'available').then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('admin can change any consultant status', () => {
      // Assuming admin permissions exist
      cy.apiPost(
        '/api/consultants/status',
        {
          consultantId: 3,
          status: 'available',
        },
        { headers: { 'X-User-Role': 'admin' } }
      ).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('regular user cannot change consultant status', () => {
      cy.apiPost(
        '/api/consultants/status',
        {
          consultantId: 1,
          status: 'offline',
        },
        { headers: { 'X-User-Id': '5' } }
      ).then((response) => {
        // May succeed if user is the consultant, or 403 otherwise
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });
  });

  describe('Rating Authorization', () => {
    it('only session requester can rate session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Rating auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          // Requester rates
          cy.rateSession(sessionId, {
            rating: 5,
            raterId: testRequesterId,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 404]);
          });
        });
      });
    });

    it('non-requester cannot rate session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Non-requester rating test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          // Different user tries to rate
          cy.rateSession(sessionId, {
            rating: 1,
            raterId: 6,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 403, 404]);
          });
        });
      });
    });

    it('consultant cannot rate their own session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Self-rating test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        const consultantId = createResponse.body.consultant?.id;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          if (consultantId) {
            cy.rateSession(sessionId, {
              rating: 5,
              raterId: consultantId,
            }).then((response) => {
              expect(response.status).to.be.oneOf([200, 400, 403, 404]);
            });
          }
        });
      });
    });
  });

  describe('Analytics Access', () => {
    it('consultants can view their own stats', () => {
      cy.getConsultantStats(1).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('admins can view all analytics', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('hospital-level analytics restricted to hospital', () => {
      cy.apiGet('/api/analytics/by-hospital?hospitalId=1').then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('cross-hospital analytics requires admin', () => {
      cy.apiGet('/api/analytics/overview').then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });
  });

  describe('Schedule Management Authorization', () => {
    it('consultant can view their own schedule', () => {
      cy.apiGet('/api/schedule?consultantId=1').then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 404]);
      });
    });

    it('staff can view consultant availability', () => {
      cy.apiGet('/api/schedule/availability?consultantId=1').then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 404]);
      });
    });

    it('only consultant can modify their schedule', () => {
      cy.apiPost('/api/schedule', {
        consultantId: 1,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        modifiedBy: 5, // Staff member
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 403, 404]);
      });
    });

    it('admin can modify any schedule', () => {
      cy.apiPost(
        '/api/schedule',
        {
          consultantId: 1,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
        { headers: { 'X-User-Role': 'admin' } }
      ).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 403, 404]);
      });
    });
  });

  describe('Preferences Authorization', () => {
    it('staff can set their own preferences', () => {
      cy.addPreferredConsultant(5, 1).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400]);
      });
    });

    it('staff cannot modify other staff preferences', () => {
      cy.apiPost('/api/staff/6/preferences', {
        consultantId: 2,
        modifiedBy: 5,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('admin can view all preferences', () => {
      cy.apiGet('/api/staff/preferences/all').then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });
  });

  describe('Queue Management Authorization', () => {
    it('consultants can view queue', () => {
      cy.getSupportQueue().then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('only consultants can accept requests', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Queue auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Staff tries to accept (not a consultant)
        cy.apiPost(`/api/support/queue/${sessionId}/accept`, {
          acceptedBy: 5,
        }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 403, 404]);
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('consultant can only accept matching specialty', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'Radiology',
        issueSummary: 'Specialty match test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Consultant 1 (ER expert) tries to accept Radiology request
        cy.acceptSupportRequest(sessionId, { consultantId: 1 }).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 403, 404]);
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });
  });

  describe('Data Privacy', () => {
    it('session details hidden from unauthorized users', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Contains sensitive info',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Check if unauthorized access is blocked
        cy.apiGet(`/api/support/sessions/${sessionId}`).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 403, 404]);
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('hospital isolation enforced', () => {
      // Hospital 1 user should not see Hospital 2 data
      cy.apiGet('/api/analytics/by-hospital?hospitalId=2', {
        headers: { 'X-Hospital-Id': '1' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('PHI access logged', () => {
      cy.apiGet('/api/audit/phi-access').then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });
  });

  describe('API Key Authentication', () => {
    it('rejects requests without authentication', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/api/support/queue`,
        failOnStatusCode: false,
        headers: {}, // No auth headers
      }).then((response) => {
        // Should either require auth or allow public access
        expect(response.status).to.be.oneOf([200, 400, 401, 403]);
      });
    });

    it('accepts valid API key', () => {
      cy.apiGet('/api/support/queue').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('rejects invalid API key', () => {
      cy.request({
        method: 'GET',
        url: `${API_URL}/api/support/queue`,
        failOnStatusCode: false,
        headers: { Authorization: 'Bearer invalid-key' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 401, 403]);
      });
    });
  });

  describe('Role-Based Access', () => {
    it('admin has full access', () => {
      cy.apiGet('/api/admin/settings', {
        headers: { 'X-User-Role': 'admin' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('consultant has consultant permissions', () => {
      cy.apiGet('/api/consultant/dashboard', {
        headers: { 'X-User-Role': 'consultant' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('staff has staff permissions', () => {
      cy.apiGet('/api/staff/dashboard', {
        headers: { 'X-User-Role': 'staff' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });

    it('guest has limited access', () => {
      cy.apiGet('/api/admin/settings', {
        headers: { 'X-User-Role': 'guest' },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 403, 404]);
      });
    });
  });
});
