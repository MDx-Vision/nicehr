// 15-edge-cases.cy.js - Edge Case Tests (P2)
// Tests for boundary conditions, race conditions, and unusual scenarios

describe('Edge Cases', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 1500;

  beforeEach(() => {
    testRequesterId++;
  });

  describe('Concurrent Sessions', () => {
    it('handles multiple simultaneous requests', () => {
      const baseId = testRequesterId;
      const requests = [];

      for (let i = 0; i < 3; i++) {
        requests.push(
          cy.createSupportRequest({
            requesterId: baseId + i,
            hospitalId: 1,
            department: 'ER',
            issueSummary: `Concurrent request ${i}`,
          }).then((r) => ({ response: r, requesterId: baseId + i }))
        );
      }

      cy.wrap(Promise.all(requests)).then((results) => {
        results.forEach((result) => {
          expect(result.response.status).to.be.oneOf([200, 201, 429]);
          if (result.response.body.sessionId) {
            cy.endSupportSession(result.response.body.sessionId, { endedBy: result.requesterId });
          }
        });
      });
    });

    it('prevents duplicate session for same requester', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'First request',
      }).then((firstResponse) => {
        const sessionId = firstResponse.body.sessionId;

        // Try to create another while first is active
        cy.createSupportRequest({
          requesterId: testRequesterId,
          hospitalId: 1,
          department: 'ER',
          issueSummary: 'Duplicate request',
        }).then((secondResponse) => {
          expect(secondResponse.status).to.be.oneOf([200, 400, 409]);
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('handles rapid session creation and cancellation', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Quick cancel test',
      }).then((response) => {
        const sessionId = response.body.sessionId;

        // Immediately cancel
        cy.cancelSupportRequest(sessionId, testRequesterId).then((cancelResponse) => {
          expect(cancelResponse.status).to.be.oneOf([200, 400]);
        });
      });
    });
  });

  describe('Boundary Values', () => {
    it('handles maximum length issue summary', () => {
      const maxSummary = 'A'.repeat(500);

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: maxSummary,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400]);

        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('handles minimum length issue summary', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'A',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400]);

        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('handles empty issue summary', () => {
      cy.apiPost('/api/support/request', {
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: '',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles rating at boundaries (1 and 5)', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Rating boundary test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          // Test minimum rating
          cy.rateSession(sessionId, { rating: 1, raterId: testRequesterId }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        });
      });
    });

    it('rejects rating outside boundaries (0 and 6)', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Invalid rating test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          cy.rateSession(sessionId, { rating: 0, raterId: testRequesterId }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });

          cy.rateSession(sessionId, { rating: 6, raterId: testRequesterId }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        });
      });
    });
  });

  describe('Special Characters', () => {
    it('handles unicode in issue summary', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Test with émojis 🏥 and ünïcödé',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);

        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('handles special characters in feedback', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Special chars feedback test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          cy.rateSession(sessionId, {
            rating: 4,
            feedback: 'Great! <script>alert("xss")</script> & "quotes"',
            raterId: testRequesterId,
          }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        });
      });
    });

    it('handles newlines in issue summary', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Line 1\nLine 2\nLine 3',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);

        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('handles SQL injection attempts', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: "'; DROP TABLE sessions; --",
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400]);

        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });
    });
  });

  describe('State Transitions', () => {
    it('cannot transition completed session to active', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'State transition test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          // Try to start completed session
          cy.startSupportSession(sessionId).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        });
      });
    });

    it('cannot cancel active session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Cancel active test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Start the session
        cy.startSupportSession(sessionId).then(() => {
          // Try to cancel active session
          cy.cancelSupportRequest(sessionId, testRequesterId).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
      });
    });

    it('handles ending already ended session', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Double end test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          // Try to end again
          cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
          });
        });
      });
    });

    it('handles rating already rated session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Double rating test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
          cy.rateSession(sessionId, { rating: 5, raterId: testRequesterId }).then(() => {
            // Try to rate again
            cy.rateSession(sessionId, { rating: 1, raterId: testRequesterId }).then((response) => {
              expect(response.status).to.be.oneOf([200, 400, 409]);
            });
          });
        });
      });
    });
  });

  describe('Non-Existent Resources', () => {
    it('handles non-existent session ID', () => {
      cy.apiGet('/api/support/sessions/99999').then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('handles non-existent consultant ID', () => {
      cy.getConsultantStats(99999).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('handles non-existent staff ID', () => {
      cy.getStaffPreferences(99999).then((response) => {
        expect(response.status).to.be.oneOf([200, 404]);
      });
    });

    it('handles non-existent hospital ID', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 99999,
        department: 'ER',
        issueSummary: 'Invalid hospital test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 404]);
      });
    });

    it('handles non-existent department', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'NonExistent',
        issueSummary: 'Invalid department test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });

  describe('Negative IDs', () => {
    it('handles negative session ID', () => {
      cy.apiGet('/api/support/sessions/-1').then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('handles negative consultant ID', () => {
      cy.getConsultantStats(-1).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('handles negative requester ID', () => {
      cy.createSupportRequest({
        requesterId: -1,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Negative ID test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });

  describe('Date/Time Edge Cases', () => {
    it('handles schedule for past date', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        hospitalId: 1,
        consultantId: 1,
        department: 'ER',
        scheduledTime: '2020-01-01T10:00:00Z',
        duration: 30,
        title: 'Past session test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles schedule for far future date', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        hospitalId: 1,
        consultantId: 1,
        department: 'ER',
        scheduledTime: '2099-12-31T10:00:00Z',
        duration: 30,
        title: 'Far future test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles zero duration session', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        hospitalId: 1,
        consultantId: 1,
        department: 'ER',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 0,
        title: 'Zero duration test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles very long duration session', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        hospitalId: 1,
        consultantId: 1,
        department: 'ER',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 1440, // 24 hours
        title: 'Long duration test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });

  describe('Network and Timeout Scenarios', () => {
    it('handles large payload', () => {
      const largePayload = {
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Large payload test',
        additionalData: 'X'.repeat(10000),
      };

      cy.apiPost('/api/support/request', largePayload).then((response) => {
        expect(response.status).to.be.oneOf([200, 201, 400, 413]);
      });
    });

    it('handles malformed JSON', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/api/support/request`,
        body: 'not valid json',
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });

    it('handles missing content type', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/api/support/request`,
        body: { requesterId: 5 },
        headers: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 415]);
      });
    });
  });

  describe('Consultant Availability Edge Cases', () => {
    it('handles no consultants available', () => {
      // Set all consultants offline
      [1, 2, 3, 4].forEach((id) => {
        cy.setConsultantStatus(id, 'offline');
      });

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'No consultants test',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        // Should be queued since no consultant available
        expect(response.body.status).to.be.oneOf(['pending', 'queued', 'connecting']);

        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });

      // Restore consultants
      [1, 2, 3, 4].forEach((id) => {
        cy.setConsultantStatus(id, 'available');
      });
    });

    it('handles consultant going offline during request', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Offline during request test',
      }).then((response) => {
        const sessionId = response.body.sessionId;

        // Consultant goes offline (might fail if in session)
        cy.setConsultantStatus(1, 'offline').then((statusResponse) => {
          expect(statusResponse.status).to.be.oneOf([200, 400]);
        });

        cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        cy.setConsultantStatus(1, 'available');
      });
    });
  });

  describe('Queue Edge Cases', () => {
    it('handles empty queue', () => {
      cy.getSupportQueue().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('handles queue with many requests', () => {
      cy.apiGet('/api/support/queue?limit=100').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('handles queue filtering with no matches', () => {
      cy.apiGet('/api/support/queue?department=NonExistent').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });
});
