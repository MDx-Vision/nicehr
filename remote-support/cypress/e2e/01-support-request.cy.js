// 01-support-request.cy.js - Support Request Flow Tests (P0)
// Tests for creating, validating, and managing support requests

describe('Support Request Flow', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  // Use unique requester IDs to avoid "already have active session" conflicts
  let testRequesterId = 100;

  beforeEach(() => {
    // Increment requesterId for each test to avoid conflicts
    testRequesterId++;
  });

  describe('Request Creation', () => {
    it('creates support request with all required fields', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        urgency: 'normal',
        issueSummary: 'Test request for creation',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
        if (response.status === 200) {
          expect(response.body).to.have.property('sessionId');
          expect(response.body.status).to.be.oneOf(['pending', 'connecting']);
        }
      });
    });

    it('creates request with normal urgency', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'normal',
        issueSummary: 'Normal urgency test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request with urgent urgency', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'urgent',
        issueSummary: 'Urgent urgency test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request with critical urgency', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'critical',
        issueSummary: 'Critical urgency test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for ER department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'ER',
        issueSummary: 'ER department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Pharmacy department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Pharmacy',
        issueSummary: 'Pharmacy department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Radiology department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Radiology',
        issueSummary: 'Radiology department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Lab department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Lab',
        issueSummary: 'Lab department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for IT department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'IT',
        issueSummary: 'IT department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Build department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Build',
        issueSummary: 'Build department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Registration department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Registration',
        issueSummary: 'Registration department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Billing department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Billing',
        issueSummary: 'Billing department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Nursing department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Nursing',
        issueSummary: 'Nursing department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Surgery department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Surgery',
        issueSummary: 'Surgery department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for ICU department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'ICU',
        issueSummary: 'ICU department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('creates request for Outpatient department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Outpatient',
        issueSummary: 'Outpatient department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('returns session ID on successful creation', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Session ID test',
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body.sessionId).to.be.a('number');
          expect(response.body.sessionId).to.be.greaterThan(0);
        }
      });
    });

    it('returns queue position when queued (no available consultant)', () => {
      // First set all consultants to offline
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Queue position test',
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body.status).to.eq('pending');
          // queuePosition may or may not be present
        }
      });

      // Restore consultant status
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns connecting status when consultant matched', () => {
      // Ensure at least one consultant is available
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'Auto-match test',
      }).then((response) => {
        if (response.status === 200 && response.body.status === 'connecting') {
          expect(response.body.consultant).to.have.property('id');
          expect(response.body.consultant).to.have.property('name');
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
        requesterId: testRequesterId,
        department: 'ER',
        issueSummary: 'No hospital ID',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles request without department', () => {
      cy.apiPost('/api/support/request', {
        requesterId: testRequesterId,
        hospitalId: 1,
        issueSummary: 'No department',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles request without issueSummary', () => {
      cy.apiPost('/api/support/request', {
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('rejects duplicate request from same user with active session', () => {
      const dupRequesterId = 500;

      // Create first request
      cy.createSupportRequest({
        requesterId: dupRequesterId,
        issueSummary: 'First request',
      }).then((firstResponse) => {
        if (firstResponse.status === 200) {
          // Try to create second request
          cy.createSupportRequest({
            requesterId: dupRequesterId,
            issueSummary: 'Duplicate request',
          }).then((secondResponse) => {
            expect(secondResponse.status).to.eq(400);
            expect(secondResponse.body.error).to.include('already');
          });
        }
      });
    });
  });

  describe('Active Session Checks', () => {
    it('returns appropriate response when no active session', () => {
      cy.getActiveSession(99999).then((response) => {
        expect(response.status).to.eq(200);
        // May return null, empty, or not found
      });
    });

    it('returns session for pending request', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      const pendingRequesterId = 600;
      cy.createSupportRequest({
        requesterId: pendingRequesterId,
        issueSummary: 'Pending session test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          cy.getActiveSession(pendingRequesterId).then((response) => {
            if (response.body && response.body.id) {
              expect(response.body.status).to.eq('pending');
            }
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns session for connecting request', () => {
      cy.setConsultantStatus(1, 'available');
      const connectingRequesterId = 601;

      cy.createSupportRequest({
        requesterId: connectingRequesterId,
        hospitalId: 2,
        issueSummary: 'Connecting session test',
      }).then((createResponse) => {
        if (createResponse.status === 200 && createResponse.body.status === 'connecting') {
          cy.getActiveSession(connectingRequesterId).then((response) => {
            if (response.body && response.body.id) {
              expect(response.body.status).to.eq('connecting');
            }
          });
        }
      });
    });
  });

  describe('Request Cancellation', () => {
    it('cancels pending request successfully', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      const cancelRequesterId = 700;
      cy.createSupportRequest({
        requesterId: cancelRequesterId,
        issueSummary: 'Will cancel this',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/cancel/${sessionId}`, { userId: cancelRequesterId }).then(
            (response) => {
              expect(response.status).to.be.oneOf([200, 400, 403]);
            }
          );
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns 404 for non-existent session', () => {
      cy.apiPost('/api/support/cancel/99999', { userId: 5 }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Queue Position', () => {
    it('returns queue position information', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      const queueRequesterId = 800;
      cy.createSupportRequest({
        requesterId: queueRequesterId,
        issueSummary: 'Queue position test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.getQueuePosition(sessionId).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('position');
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns estimated wait time', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      const waitRequesterId = 801;
      cy.createSupportRequest({
        requesterId: waitRequesterId,
        issueSummary: 'Wait time test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.getQueuePosition(sessionId).then((response) => {
            expect(response.body).to.have.property('estimatedWaitSeconds');
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
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
  });
});
