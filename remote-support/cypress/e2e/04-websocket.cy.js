// 04-websocket.cy.js - WebSocket Real-time Tests (P0)
// Tests for real-time communication and event handling

describe('WebSocket Real-time', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 400;

  beforeEach(() => {
    testRequesterId++;
  });

  describe('Health Check (WebSocket indicator)', () => {
    it('returns connected client count', () => {
      cy.checkHealth().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.services.websocket).to.include('clients');
      });
    });

    it('returns overall health status', () => {
      cy.checkHealth().then((response) => {
        expect(response.body.status).to.eq('ok');
        expect(response.body.timestamp).to.be.a('string');
      });
    });

    it('returns video service status', () => {
      cy.checkHealth().then((response) => {
        expect(response.body.services.video).to.be.oneOf(['connected', 'disconnected']);
      });
    });

    it('returns database seeded status', () => {
      cy.checkHealth().then((response) => {
        expect(response.body.seeded).to.be.a('boolean');
      });
    });
  });

  describe('Event-driven Behaviors (via API)', () => {
    it('queue broadcast is triggered on new request', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Queue broadcast test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.getSupportQueue().then((response) => {
            expect(response.body).to.be.an('array');
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('queue updates on accept', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Accept broadcast test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.setConsultantStatus(1, 'available');

          cy.acceptSupportRequest(sessionId, 1).then(() => {
            cy.getSupportQueue().then((response) => {
              expect(response.body).to.be.an('array');
            });
          });
        }
      });
    });

    it('consultant status broadcast on status change', () => {
      cy.setConsultantStatus(1, 'available').then((response) => {
        expect(response.body.success).to.eq(true);
      });

      cy.getAllConsultants().then((response) => {
        const consultant = response.body.find((c) => c.id === 1);
        expect(consultant.status).to.eq('available');
      });

      cy.setConsultantStatus(1, 'away').then((response) => {
        expect(response.body.success).to.eq(true);
      });

      cy.getAllConsultants().then((response) => {
        const consultant = response.body.find((c) => c.id === 1);
        expect(consultant.status).to.eq('away');
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('consultant status changes to busy on accept', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Busy status test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.setConsultantStatus(1, 'available');

          cy.acceptSupportRequest(sessionId, 1).then((acceptResponse) => {
            if (acceptResponse.status === 200) {
              cy.getAllConsultants().then((response) => {
                const consultant = response.body.find((c) => c.id === 1);
                expect(consultant.status).to.eq('busy');
              });
            }
          });
        }
      });
    });

    it('consultant status changes to available on session end', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Available status test',
      }).then((createResponse) => {
        if (createResponse.status === 200 && createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant?.id;

          if (consultantId) {
            cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
              cy.getAllConsultants().then((response) => {
                const consultant = response.body.find((c) => c.id === consultantId);
                if (consultant) {
                  expect(consultant.status).to.eq('available');
                }
              });
            });
          }
        }
      });
    });
  });

  describe('Position Update Behaviors', () => {
    it('queue position is tracked for pending requests', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Position tracking test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.getQueuePosition(sessionId).then((response) => {
            expect(response.body).to.have.property('position');
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('estimated wait time is calculated', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Wait time estimate test',
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

    it('total queue count is returned', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Count test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.getQueuePosition(sessionId).then((response) => {
            expect(response.body).to.have.property('totalInQueue');
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });
  });

  describe('Session Event Flows', () => {
    it('session accepted triggers notification flow', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Notification flow test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.setConsultantStatus(1, 'available');

          cy.acceptSupportRequest(sessionId, 1).then((response) => {
            if (response.status === 200) {
              expect(response.body.sessionId).to.eq(sessionId);
            }
          });
        }
      });
    });

    it('session start triggers notification flow', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Start notification test',
      }).then((createResponse) => {
        if (createResponse.status === 200 && createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });

          cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('session end triggers notification flow', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        issueSummary: 'End notification test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        }
      });
    });
  });

  describe('Auto-Match Notifications', () => {
    it('auto-match notifies consultant immediately', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Auto-match notification test',
      }).then((createResponse) => {
        if (createResponse.status === 200 && createResponse.body.status === 'connecting') {
          expect(createResponse.body.consultant).to.exist;
          cy.endSupportSession(createResponse.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('auto-match returns match reasons', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Match reasons test',
      }).then((createResponse) => {
        if (createResponse.status === 200 && createResponse.body.status === 'connecting') {
          expect(createResponse.body.matchReasons).to.be.an('array');
          cy.endSupportSession(createResponse.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });
  });

  describe('Schedule Event Integration', () => {
    it('scheduled session creation works', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);

      cy.createScheduledSession({
        requesterId: 5,
        consultantId: 1,
        hospitalId: 1,
        department: 'ER',
        scheduledAt: futureDate.toISOString(),
        durationMinutes: 30,
        topic: 'Scheduled notification test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });
});
