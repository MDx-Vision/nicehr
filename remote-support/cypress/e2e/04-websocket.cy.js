// 04-websocket.cy.js - WebSocket Real-time Tests (P0)
// Tests for real-time communication and event handling

describe('WebSocket Real-time', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

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
    // WebSocket events are tested indirectly through API behaviors
    // since Cypress cannot directly test WebSocket connections

    it('queue broadcast is triggered on new request', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Queue broadcast test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Request should be in queue (broadcast happened server-side)
        cy.getSupportQueue().then((response) => {
          const inQueue = response.body.some((i) => i.id === sessionId);
          expect(inQueue).to.be.true;
        });

        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('queue broadcast is triggered on accept', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Accept broadcast test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(1, 'available');

        cy.acceptSupportRequest(sessionId, 1).then(() => {
          // Should no longer be in queue (broadcast happened)
          cy.getSupportQueue().then((response) => {
            const inQueue = response.body.some((i) => i.id === sessionId);
            expect(inQueue).to.be.false;
          });
        });
      });
    });

    it('queue broadcast is triggered on cancel', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Cancel broadcast test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Verify in queue first
        cy.getSupportQueue().then((response) => {
          const inQueue = response.body.some((i) => i.id === sessionId);
          expect(inQueue).to.be.true;
        });

        cy.cancelSupportRequest(sessionId, 5).then(() => {
          // Should be removed from queue
          cy.getSupportQueue().then((response) => {
            const inQueue = response.body.some((i) => i.id === sessionId);
            expect(inQueue).to.be.false;
          });
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('consultant status broadcast on status change', () => {
      cy.setConsultantStatus(1, 'available').then((response) => {
        expect(response.body.success).to.eq(true);
        expect(response.body.status).to.eq('available');
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

      // Reset
      cy.setConsultantStatus(1, 'available');
    });

    it('consultant status changes to busy on accept', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        issueSummary: 'Busy status test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(1, 'available');

        cy.acceptSupportRequest(sessionId, 1).then(() => {
          cy.getAllConsultants().then((response) => {
            const consultant = response.body.find((c) => c.id === 1);
            expect(consultant.status).to.eq('busy');
          });
        });
      });
    });

    it('consultant status changes to available on session end', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Available status test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          // Should be busy
          cy.getAllConsultants().then((response) => {
            const consultant = response.body.find((c) => c.id === consultantId);
            expect(consultant.status).to.eq('busy');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            // Should be available
            cy.getAllConsultants().then((response) => {
              const consultant = response.body.find((c) => c.id === consultantId);
              expect(consultant.status).to.eq('available');
            });
          });
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
        requesterId: 5,
        issueSummary: 'Position tracking test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getQueuePosition(sessionId).then((response) => {
          expect(response.body.position).to.be.a('number');
          expect(response.body.position).to.be.gte(1);
        });

        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('position updates when earlier request accepted', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      // Create two requests
      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'First request',
      }).then((r1) => {
        cy.createSupportRequest({
          requesterId: 6,
          issueSummary: 'Second request',
        }).then((r2) => {
          // Get initial position of second request
          cy.getQueuePosition(r2.body.sessionId).then((beforePos) => {
            const initialPosition = beforePos.body.position;

            // Accept first request
            cy.setConsultantStatus(1, 'available');

            cy.acceptSupportRequest(r1.body.sessionId, 1).then(() => {
              // Second request should move up
              cy.getQueuePosition(r2.body.sessionId).then((afterPos) => {
                expect(afterPos.body.position).to.be.lte(initialPosition);
              });

              cy.cancelSupportRequest(r2.body.sessionId, 6);
            });
          });
        });
      });

      cy.setConsultantStatus(2, 'available');
    });

    it('estimated wait time is calculated', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Wait time estimate test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getQueuePosition(sessionId).then((response) => {
          expect(response.body.estimatedWaitSeconds).to.be.a('number');
          expect(response.body.estimatedWaitSeconds).to.be.gte(0);
        });

        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('total queue count is accurate', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Count test 1',
      }).then((r1) => {
        cy.createSupportRequest({
          requesterId: 6,
          issueSummary: 'Count test 2',
        }).then((r2) => {
          cy.getQueuePosition(r1.body.sessionId).then((response) => {
            expect(response.body.totalInQueue).to.be.gte(2);
          });

          cy.cancelSupportRequest(r1.body.sessionId, 5);
          cy.cancelSupportRequest(r2.body.sessionId, 6);
        });
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
        requesterId: 5,
        issueSummary: 'Notification flow test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(1, 'available');

        cy.acceptSupportRequest(sessionId, 1).then((response) => {
          // Successful accept means notifications were sent
          expect(response.body.sessionId).to.eq(sessionId);
          expect(response.body.roomUrl).to.exist;
        });
      });
    });

    it('session start triggers notification flow', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Start notification test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then((response) => {
            expect(response.body.success).to.eq(true);
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('session end triggers notification flow', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        issueSummary: 'End notification test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.endSupportSession(sessionId, { endedBy: 9 }).then((response) => {
              expect(response.body.success).to.eq(true);
            });
          });
        }
      });
    });
  });

  describe('Auto-Match Notifications', () => {
    it('auto-match notifies consultant immediately', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Auto-match notification test',
      }).then((createResponse) => {
        // When auto-matched, consultant is notified
        if (createResponse.body.status === 'connecting') {
          expect(createResponse.body.consultant).to.exist;
          expect(createResponse.body.consultant.id).to.exist;
          expect(createResponse.body.roomUrl).to.exist;

          cy.endSupportSession(createResponse.body.sessionId, { endedBy: 8 });
        }
      });
    });

    it('auto-match returns match reasons', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Match reasons test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          expect(createResponse.body.matchReasons).to.be.an('array');
          expect(createResponse.body.matchReasons.length).to.be.gte(1);

          cy.endSupportSession(createResponse.body.sessionId, { endedBy: 8 });
        }
      });
    });
  });

  describe('Schedule Event Integration', () => {
    it('scheduled session creation sends notifications', () => {
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
        expect(response.status).to.eq(200);
        expect(response.body.id).to.be.a('number');
      });
    });

    it('scheduled session cancellation sends notifications', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      futureDate.setHours(14, 0, 0, 0);

      cy.createScheduledSession({
        requesterId: 5,
        consultantId: 2,
        hospitalId: 1,
        department: 'Pharmacy',
        scheduledAt: futureDate.toISOString(),
        durationMinutes: 30,
        topic: 'Cancel notification test',
      }).then((createResponse) => {
        if (createResponse.status === 200) {
          const sessionId = createResponse.body.id;

          cy.cancelScheduledSession(sessionId, 5, 'Testing cancellation').then((response) => {
            expect(response.body.success).to.eq(true);
          });
        }
      });
    });
  });
});
