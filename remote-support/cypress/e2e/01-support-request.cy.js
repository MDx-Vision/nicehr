// 01-support-request.cy.js - Support Request Flow Tests (P0)
// Tests for creating, validating, and managing support requests

describe('Support Request Flow', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('Request Creation', () => {
    it('creates support request with all required fields', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        urgency: 'normal',
        issueSummary: 'Test request for creation',
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('sessionId');
        expect(response.body.status).to.be.oneOf(['pending', 'connecting']);
      });
    });

    it('creates request with normal urgency', () => {
      cy.createSupportRequest({
        requesterId: 5,
        urgency: 'normal',
        issueSummary: 'Normal urgency test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request with urgent urgency', () => {
      cy.createSupportRequest({
        requesterId: 5,
        urgency: 'urgent',
        issueSummary: 'Urgent urgency test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request with critical urgency', () => {
      cy.createSupportRequest({
        requesterId: 5,
        urgency: 'critical',
        issueSummary: 'Critical urgency test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for ER department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'ER',
        issueSummary: 'ER department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Pharmacy department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Pharmacy',
        issueSummary: 'Pharmacy department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Radiology department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Radiology',
        issueSummary: 'Radiology department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Lab department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Lab',
        issueSummary: 'Lab department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for IT department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'IT',
        issueSummary: 'IT department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Build department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Build',
        issueSummary: 'Build department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Registration department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Registration',
        issueSummary: 'Registration department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Billing department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Billing',
        issueSummary: 'Billing department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Nursing department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Nursing',
        issueSummary: 'Nursing department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Surgery department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Surgery',
        issueSummary: 'Surgery department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for ICU department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'ICU',
        issueSummary: 'ICU department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('creates request for Outpatient department', () => {
      cy.createSupportRequest({
        requesterId: 5,
        department: 'Outpatient',
        issueSummary: 'Outpatient department test',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('returns session ID on successful creation', () => {
      cy.createSupportRequest({
        requesterId: 6,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Session ID test',
      }).then((response) => {
        expect(response.body.sessionId).to.be.a('number');
        expect(response.body.sessionId).to.be.greaterThan(0);
      });
    });

    it('returns queue position when queued (no available consultant)', () => {
      // First set all consultants to offline
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Queue position test',
      }).then((response) => {
        expect(response.body.status).to.eq('pending');
        expect(response.body.queuePosition).to.be.a('number');
      });

      // Restore consultant status
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns connecting status when consultant matched', () => {
      // Ensure at least one consultant is available
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'Auto-match test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant).to.have.property('id');
          expect(response.body.consultant).to.have.property('name');
          expect(response.body.roomUrl).to.include('daily.co');
        }
      });
    });
  });

  describe('Request Validation', () => {
    it('handles request without requesterId gracefully', () => {
      cy.apiPost('/api/support/request', {
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'No requester ID',
      }).then((response) => {
        // The API may create with null requesterId or reject - both valid behaviors
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles request without hospitalId gracefully', () => {
      cy.apiPost('/api/support/request', {
        requesterId: 5,
        department: 'ER',
        issueSummary: 'No hospital ID',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles request without department', () => {
      cy.apiPost('/api/support/request', {
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'No department',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles request without issueSummary', () => {
      cy.apiPost('/api/support/request', {
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('rejects duplicate request from same user with active session', () => {
      // Create first request
      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'First request',
      }).then((firstResponse) => {
        const sessionId = firstResponse.body.sessionId;

        // Try to create second request
        cy.createSupportRequest({
          requesterId: 5,
          issueSummary: 'Duplicate request',
        }).then((secondResponse) => {
          expect(secondResponse.status).to.eq(400);
          expect(secondResponse.body.error).to.include('already have');
          expect(secondResponse.body.sessionId).to.eq(sessionId);
        });
      });
    });
  });

  describe('Active Session Checks', () => {
    it('returns null when no active session', () => {
      cy.getActiveSession(999).then((response) => {
        expect(response.body).to.be.oneOf([null, '']);
      });
    });

    it('returns session for pending request', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        issueSummary: 'Pending session test',
      }).then((createResponse) => {
        cy.getActiveSession(6).then((response) => {
          expect(response.body).to.have.property('id');
          expect(response.body.status).to.eq('pending');
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns session for connecting request', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Connecting session test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          cy.getActiveSession(8).then((response) => {
            expect(response.body.status).to.eq('connecting');
          });
        }
      });
    });

    it('returns session with consultant name for active session', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Active session info test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          cy.getActiveSession(8).then((response) => {
            expect(response.body).to.have.property('consultantName');
          });
        }
      });
    });

    it('does not return completed sessions', () => {
      // Create and complete a session
      cy.createSupportRequest({
        requesterId: 9,
        issueSummary: 'Will complete session',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        if (createResponse.body.status === 'connecting') {
          cy.endSupportSession(sessionId, { endedBy: 9 }).then(() => {
            cy.getActiveSession(9).then((response) => {
              expect(response.body).to.be.oneOf([null, '']);
            });
          });
        }
      });
    });
  });

  describe('Request Cancellation', () => {
    it('cancels pending request successfully', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        issueSummary: 'Will cancel this',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.cancelSupportRequest(sessionId, 6).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.eq(true);
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('removes cancelled request from queue', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        issueSummary: 'Cancel and check queue',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.cancelSupportRequest(sessionId, 6).then(() => {
          cy.getSupportQueue().then((response) => {
            const sessionIds = response.body.map((item) => item.id);
            expect(sessionIds).to.not.include(sessionId);
          });
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('rejects cancel from unauthorized user', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Unauthorized cancel test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Try to cancel as different user
        cy.cancelSupportRequest(sessionId, 6).then((response) => {
          expect(response.status).to.eq(403);
          expect(response.body.error).to.include('Not authorized');
        });

        // Clean up
        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('rejects cancel for non-pending session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        issueSummary: 'Non-pending cancel test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.cancelSupportRequest(sessionId, 9).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.include('pending');
          });

          // Clean up
          cy.endSupportSession(sessionId, { endedBy: 9 });
        }
      });
    });

    it('returns 404 for non-existent session', () => {
      cy.cancelSupportRequest(99999, 5).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Queue Position', () => {
    it('returns correct position for first in queue', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'First in queue',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getQueuePosition(sessionId).then((response) => {
          expect(response.body.position).to.be.a('number');
          expect(response.body.totalInQueue).to.be.gte(1);
        });

        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('calculates estimated wait time', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        issueSummary: 'Wait time test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getQueuePosition(sessionId).then((response) => {
          expect(response.body.estimatedWaitSeconds).to.be.a('number');
          expect(response.body.estimatedWaitSeconds).to.be.gte(0);
        });

        cy.cancelSupportRequest(sessionId, 6);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns total queue count', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Queue count test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getQueuePosition(sessionId).then((response) => {
          expect(response.body.totalInQueue).to.be.gte(1);
        });

        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns null position for accepted request', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Accepted position test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.getQueuePosition(sessionId).then((response) => {
            expect(response.body.position).to.be.null;
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });
  });

  describe('Session History', () => {
    it('returns session history for user', () => {
      cy.getSupportHistory(5, 'hospital_staff').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('returns history for consultant role', () => {
      cy.getSupportHistory(1, 'consultant').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('respects limit parameter', () => {
      cy.getSupportHistory(5, 'hospital_staff', 5).then((response) => {
        expect(response.body.length).to.be.lte(5);
      });
    });

    it('includes enriched names in response', () => {
      cy.getSupportHistory(5, 'hospital_staff').then((response) => {
        if (response.body.length > 0) {
          const session = response.body[0];
          expect(session).to.have.property('requesterName');
          expect(session).to.have.property('hospitalName');
        }
      });
    });
  });
});
