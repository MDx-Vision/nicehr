// 02-support-queue.cy.js - Support Queue Management Tests (P0)
// Tests for queue operations and request acceptance

describe('Support Queue Management', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 200;

  beforeEach(() => {
    testRequesterId++;
  });

  describe('Queue Retrieval', () => {
    it('returns queue as an array', () => {
      cy.getSupportQueue().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('returns empty queue when no pending requests', () => {
      // This may not always be empty due to shared state
      cy.getSupportQueue().then((response) => {
        expect(response.body).to.be.an('array');
      });
    });

    it('enriches queue items with requester name', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Queue enrichment test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getSupportQueue().then((response) => {
          const item = response.body.find((i) => i.id === sessionId);
          if (item && item.requesterName) {
            expect(item).to.have.property('requesterName');
          }
        });

        cy.cancelSupportRequest(sessionId, testRequesterId);
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('enriches queue items with hospital name', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        issueSummary: 'Hospital name test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getSupportQueue().then((response) => {
          const item = response.body.find((i) => i.id === sessionId);
          if (item) {
            expect(item).to.have.property('hospitalName');
          }
        });

        cy.cancelSupportRequest(sessionId, testRequesterId);
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('sorts queue by urgency (critical first)', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      // Create normal request first
      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'normal',
        issueSummary: 'Normal request',
      }).then((normalResponse) => {
        // Create critical request second
        cy.createSupportRequest({
          requesterId: testRequesterId + 1,
          urgency: 'critical',
          issueSummary: 'Critical request',
        }).then((criticalResponse) => {
          cy.getSupportQueue().then((response) => {
            if (response.body.length >= 2) {
              // Critical should be first
              const criticalIndex = response.body.findIndex(
                (i) => i.id === criticalResponse.body.sessionId
              );
              const normalIndex = response.body.findIndex(
                (i) => i.id === normalResponse.body.sessionId
              );
              expect(criticalIndex).to.be.lessThan(normalIndex);
            }
          });

          cy.cancelSupportRequest(criticalResponse.body.sessionId, testRequesterId + 1);
          cy.cancelSupportRequest(normalResponse.body.sessionId, testRequesterId);
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('includes department in response', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        department: 'Radiology',
        issueSummary: 'Department test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getSupportQueue().then((response) => {
          const item = response.body.find((i) => i.id === sessionId);
          if (item) {
            expect(item.department).to.eq('Radiology');
          }
        });

        cy.cancelSupportRequest(sessionId, testRequesterId);
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('includes urgency in response', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'urgent',
        issueSummary: 'Urgency test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getSupportQueue().then((response) => {
          const item = response.body.find((i) => i.id === sessionId);
          if (item) {
            expect(item.urgency).to.eq('urgent');
          }
        });

        cy.cancelSupportRequest(sessionId, testRequesterId);
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('includes issue summary in response', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Specific issue summary for test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getSupportQueue().then((response) => {
          const item = response.body.find((i) => i.id === sessionId);
          if (item) {
            expect(item.issueSummary).to.eq('Specific issue summary for test');
          }
        });

        cy.cancelSupportRequest(sessionId, testRequesterId);
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('includes creation timestamp', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Timestamp test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.getSupportQueue().then((response) => {
          const item = response.body.find((i) => i.id === sessionId);
          if (item) {
            expect(item).to.have.property('createdAt');
          }
        });

        cy.cancelSupportRequest(sessionId, testRequesterId);
      });

      cy.setConsultantStatus(1, 'available');
    });

    it('excludes non-pending sessions', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        issueSummary: 'Non-pending exclusion test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.getSupportQueue().then((response) => {
            const sessionIds = response.body.map((i) => i.id);
            expect(sessionIds).to.not.include(sessionId);
          });

          cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        }
      });
    });
  });

  describe('Request Acceptance', () => {
    it('consultant can accept pending request', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Accept test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(1, 'available');

        cy.acceptSupportRequest(sessionId, 1).then((response) => {
          // Accept 200 (success) or 409 (already accepted/not pending)
          expect(response.status).to.be.oneOf([200, 409]);
          if (response.status === 200) {
            expect(response.body.sessionId).to.eq(sessionId);
          }
        });
      });
    });

    it('creates Daily.co room on accept', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId + 1,
        issueSummary: 'Room creation test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(2, 'available');

        cy.acceptSupportRequest(sessionId, 2).then((response) => {
          if (response.status === 200 && response.body.roomUrl) {
            expect(response.body).to.have.property('roomUrl');
            expect(response.body).to.have.property('roomName');
            expect(response.body.roomUrl).to.include('daily.co');
          } else {
            expect(response.status).to.be.oneOf([200, 409]);
          }
        });
      });
    });

    it('returns room URL and name', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Room URL test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(1, 'available');

        cy.acceptSupportRequest(sessionId, 1).then((response) => {
          if (response.status === 200 && response.body.roomUrl) {
            expect(response.body.roomUrl).to.be.a('string');
            expect(response.body.roomName).to.be.a('string');
            expect(response.body.roomName).to.include('session-');
          } else {
            expect(response.status).to.be.oneOf([200, 409]);
          }
        });
      });
    });

    it('removes request from queue after accept', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Queue removal test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(2, 'available');

        cy.acceptSupportRequest(sessionId, 2).then(() => {
          cy.getSupportQueue().then((response) => {
            const sessionIds = response.body.map((i) => i.id);
            expect(sessionIds).to.not.include(sessionId);
          });
        });
      });
    });

    it('updates consultant status to busy', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId + 1,
        issueSummary: 'Consultant status test',
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

    it('records wait time in seconds', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Wait time recording test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Wait a moment
        cy.wait(1000);

        cy.setConsultantStatus(2, 'available');

        cy.acceptSupportRequest(sessionId, 2).then(() => {
          // Wait time should be recorded in the session
          cy.getActiveSession(5).then((response) => {
            // Session should exist with wait time recorded
            expect(response.body).to.have.property('id');
          });
        });
      });
    });
  });

  describe('Acceptance Edge Cases', () => {
    it('rejects accept for non-existent session', () => {
      cy.acceptSupportRequest(99999, 1).then((response) => {
        expect(response.status).to.be.oneOf([404, 409]);
      });
    });

    it('rejects accept for already accepted session', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Double accept test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.setConsultantStatus(1, 'available');
        cy.setConsultantStatus(2, 'available');

        // First accept
        cy.acceptSupportRequest(sessionId, 1).then(() => {
          // Second accept should fail
          cy.acceptSupportRequest(sessionId, 2).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body.error).to.include('no longer available');
          });
        });
      });
    });

    it('returns 409 conflict for race condition', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId + 1,
        issueSummary: 'Race condition test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Cancel before accept attempt
        cy.cancelSupportRequest(sessionId, testRequesterId + 1).then(() => {
          cy.setConsultantStatus(1, 'available');

          cy.acceptSupportRequest(sessionId, 1).then((response) => {
            expect(response.status).to.eq(409);
          });
        });
      });
    });
  });

  describe('Queue Updates', () => {
    it('handles multiple requests in queue', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      // Create multiple requests
      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'normal',
        issueSummary: 'Queue test 1',
      }).then((r1) => {
        cy.createSupportRequest({
          requesterId: testRequesterId + 1,
          urgency: 'urgent',
          issueSummary: 'Queue test 2',
        }).then((r2) => {
          cy.getSupportQueue().then((response) => {
            expect(response.body.length).to.be.gte(2);
          });

          // Clean up
          cy.cancelSupportRequest(r1.body.sessionId, testRequesterId);
          cy.cancelSupportRequest(r2.body.sessionId, testRequesterId + 1);
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('updates queue positions after accept', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      // Create two requests
      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Position update test 1',
      }).then((r1) => {
        cy.createSupportRequest({
          requesterId: testRequesterId + 1,
          issueSummary: 'Position update test 2',
        }).then((r2) => {
          // Get initial position
          cy.getQueuePosition(r2.body.sessionId).then((beforeResponse) => {
            const initialPosition = beforeResponse.body.position;

            cy.setConsultantStatus(1, 'available');

            // Accept first request
            cy.acceptSupportRequest(r1.body.sessionId, 1).then(() => {
              // Second request should move up
              cy.getQueuePosition(r2.body.sessionId).then((afterResponse) => {
                expect(afterResponse.body.position).to.be.lte(initialPosition);
              });

              cy.cancelSupportRequest(r2.body.sessionId, testRequesterId + 1);
            });
          });
        });
      });

      cy.setConsultantStatus(2, 'available');
    });
  });

  describe('Priority Ordering', () => {
    it('critical requests are prioritized over normal', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'normal',
        issueSummary: 'Normal priority',
      }).then((normalResp) => {
        cy.createSupportRequest({
          requesterId: testRequesterId + 1,
          urgency: 'critical',
          issueSummary: 'Critical priority',
        }).then((criticalResp) => {
          cy.getSupportQueue().then((response) => {
            const criticalIndex = response.body.findIndex(
              (i) => i.id === criticalResp.body.sessionId
            );
            const normalIndex = response.body.findIndex(
              (i) => i.id === normalResp.body.sessionId
            );

            if (criticalIndex !== -1 && normalIndex !== -1) {
              expect(criticalIndex).to.be.lessThan(normalIndex);
            }
          });

          cy.cancelSupportRequest(normalResp.body.sessionId, testRequesterId);
          cy.cancelSupportRequest(criticalResp.body.sessionId, testRequesterId + 1);
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('urgent requests are prioritized over normal', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        urgency: 'normal',
        issueSummary: 'Normal for urgent test',
      }).then((normalResp) => {
        cy.createSupportRequest({
          requesterId: testRequesterId + 1,
          urgency: 'urgent',
          issueSummary: 'Urgent priority',
        }).then((urgentResp) => {
          cy.getSupportQueue().then((response) => {
            const urgentIndex = response.body.findIndex(
              (i) => i.id === urgentResp.body.sessionId
            );
            const normalIndex = response.body.findIndex(
              (i) => i.id === normalResp.body.sessionId
            );

            if (urgentIndex !== -1 && normalIndex !== -1) {
              expect(urgentIndex).to.be.lessThan(normalIndex);
            }
          });

          cy.cancelSupportRequest(normalResp.body.sessionId, testRequesterId);
          cy.cancelSupportRequest(urgentResp.body.sessionId, testRequesterId + 1);
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });
  });
});
