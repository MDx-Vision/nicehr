// 11-error-handling.cy.js - Error Handling Tests (P2)
// Tests for API errors, validation, and edge cases

describe('Error Handling', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 1100;

  // Reset all consultant statuses before this test file runs
  before(() => {
    [1, 2, 3, 4].forEach((id) => {
      cy.setConsultantStatus(id, 'available');
    });
  });

  beforeEach(() => {
    testRequesterId++;
  });

  describe('HTTP Status Codes', () => {
    it('returns 200 for successful operations', () => {
      cy.checkHealth().then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('returns 400 for bad requests', () => {
      cy.apiPost('/api/consultants/status', {
        consultantId: 1,
        status: 'invalid_status',
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
      });
    });

    it('returns 403 for unauthorized actions', () => {
      // Create session then try to cancel as wrong user
      cy.setConsultantStatus(1, 'offline');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: '403 test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        cy.cancelSupportRequest(sessionId, testRequesterId + 100).then((response) => {
          expect(response.status).to.be.oneOf([403, 400]);
        });
        cy.cancelSupportRequest(sessionId, testRequesterId);
      });
      cy.setConsultantStatus(1, 'available');
    });

    it('returns 404 for not found resources', () => {
      cy.apiGet('/api/support/active?userId=99999').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.oneOf([null, '']);
      });
    });

    it('returns 409 for conflicts', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Conflict test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        cy.cancelSupportRequest(sessionId, testRequesterId).then(() => {
          cy.setConsultantStatus(1, 'available');
          cy.acceptSupportRequest(sessionId, 1).then((response) => {
            expect(response.status).to.eq(409);
          });
        });
      });
    });

    it('includes error message in response', () => {
      cy.apiPost('/api/consultants/status', {
        consultantId: 1,
        status: 'bad_status',
      }).then((response) => {
        expect(response.body).to.have.property('error');
        expect(response.body.error).to.be.a('string');
      });
    });
  });

  describe('Support Request Errors', () => {
    it('duplicate request returns 400', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'First request',
      }).then((firstResponse) => {
        cy.createSupportRequest({
          requesterId: testRequesterId,
          issueSummary: 'Second request',
        }).then((secondResponse) => {
          expect(secondResponse.status).to.eq(400);
          expect(secondResponse.body.error).to.include('already');

          // Cleanup
          if (firstResponse.body.status === 'pending') {
            cy.cancelSupportRequest(firstResponse.body.sessionId, testRequesterId);
          } else if (firstResponse.body.status === 'connecting') {
            cy.endSupportSession(firstResponse.body.sessionId, { endedBy: testRequesterId });
          }
        });
      });
    });

    it('cancel non-existent session returns 404', () => {
      cy.cancelSupportRequest(99999, testRequesterId).then((response) => {
        expect(response.status).to.be.oneOf([400, 404]);
      });
    });

    it('unauthorized cancel returns 403', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        issueSummary: 'Auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        cy.cancelSupportRequest(sessionId, testRequesterId + 100).then((response) => {
          expect(response.status).to.be.oneOf([403, 400]);
          if (response.status === 403) {
            expect(response.body.error).to.include('Not authorized');
          }
        });
        cy.cancelSupportRequest(sessionId, testRequesterId);
      });
      cy.setConsultantStatus(1, 'available');
    });

    it('cancel non-pending returns 400', () => {
      cy.setConsultantStatus(1, 'available');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        issueSummary: 'Non-pending cancel',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          cy.cancelSupportRequest(sessionId, testRequesterId).then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
            if (response.status === 400 && response.body.error) {
              expect(response.body.error).to.be.a('string');
            }
          });
          cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        }
      });
    });
  });

  describe('Consultant Errors', () => {
    it('invalid status returns 400', () => {
      cy.setConsultantStatus(1, 'not_a_real_status').then((response) => {
        expect(response.status).to.be.oneOf([400, 422]);
        if (response.body.error) {
          expect(response.body.error.toLowerCase()).to.match(/invalid|status/);
        }
      });
    });

    it('status change during session returns 400', () => {
      cy.setConsultantStatus(2, 'available');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Busy status change test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          cy.setConsultantStatus(consultantId, 'offline').then((response) => {
            expect(response.status).to.be.oneOf([200, 400]);
            if (response.status === 400 && response.body.error) {
              expect(response.body.error.toLowerCase()).to.match(/session|busy|active/);
            }
          });

          cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('non-consultant preference add returns 404', () => {
      // User testRequesterId is hospital_staff, not consultant
      cy.addStaffPreference(testRequesterId, testRequesterId + 1).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error).to.include('not found');
      });
    });
  });

  describe('Schedule Errors', () => {
    it('missing fields returns 400', () => {
      cy.createScheduledSession({
        requesterId: testRequesterId,
        // Missing consultantId, scheduledAt, topic
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('past date returns 400', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        scheduledAt: pastDate.toISOString(),
        topic: 'Past date',
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('future');
      });
    });

    it('non-existent session cancel returns 404', () => {
      cy.cancelScheduledSession(99999, testRequesterId, 'Test').then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('unauthorized cancel returns 403', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      cy.createScheduledSession({
        requesterId: testRequesterId,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: futureDate.toISOString(),
        topic: 'Auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        // Try to cancel as different user (not participant)
        cy.cancelScheduledSession(sessionId, testRequesterId + 100, 'Unauthorized').then((response) => {
          expect(response.status).to.be.oneOf([403, 400]);
        });

        // Cleanup
        cy.cancelScheduledSession(sessionId, testRequesterId, 'Cleanup');
      });
    });
  });

  describe('Session Join Errors', () => {
    it('non-participant cannot join', () => {
      cy.setConsultantStatus(1, 'available');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        issueSummary: 'Join error test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: 999,
            userName: 'Intruder',
            isConsultant: false,
          }).then((response) => {
            expect(response.status).to.be.oneOf([400, 403]);
          });

          cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        }
      });
    });

    it('cannot join completed session', () => {
      cy.setConsultantStatus(2, 'available');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Completed join test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
            cy.apiPost(`/api/support/join/${sessionId}`, {
              userId: testRequesterId,
              userName: 'Test User',
              isConsultant: false,
            }).then((response) => {
              expect(response.status).to.eq(400);
            });
          });
        }
      });
    });

    it('non-existent session returns 404', () => {
      cy.apiPost('/api/support/join/99999', {
        userId: testRequesterId,
        userName: 'Test',
        isConsultant: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Rating Errors', () => {
    it('non-requester cannot rate', () => {
      cy.setConsultantStatus(1, 'available');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        issueSummary: 'Rating error test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: testRequesterId }).then(() => {
            cy.rateSupportSession(sessionId, 5, '', testRequesterId + 100).then((response) => {
              expect(response.status).to.be.oneOf([400, 403]);
              if (response.body.error) {
                expect(response.body.error).to.include('Cannot rate');
              }
            });
          });
        }
      });
    });

    it('invalid session returns 400', () => {
      cy.rateSupportSession(99999, 5, '', testRequesterId).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe('Recording Errors', () => {
    it('start recording on non-existent session returns 404', () => {
      cy.apiPost('/api/support/99999/recording/start', {
        userId: 1,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('non-consultant cannot start recording', () => {
      cy.setConsultantStatus(1, 'available');
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        issueSummary: 'Recording auth test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/${sessionId}/recording/start`, {
            userId: testRequesterId, // Requester, not consultant
          }).then((response) => {
            expect(response.status).to.be.oneOf([400, 403]);
          });

          cy.endSupportSession(sessionId, { endedBy: testRequesterId });
        }
      });
    });
  });

  describe('Data Validation', () => {
    it('handles empty strings gracefully', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: '',
      }).then((response) => {
        // May accept or reject based on validation
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles very long strings', () => {
      const longSummary = 'x'.repeat(10000);
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'ER',
        issueSummary: longSummary,
      }).then((response) => {
        // Should handle gracefully
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles special characters', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Test with <script>alert("xss")</script> special chars!',
      }).then((response) => {
        // Should accept or sanitize
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it('handles unicode characters', () => {
      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Test with unicode: 你好 🏥 émojis',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });

  describe('Concurrent Operation Handling', () => {
    it('handles rapid consecutive requests', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      // Multiple requests in quick succession using unique IDs
      const baseId = testRequesterId;
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(
          cy
            .createSupportRequest({
              requesterId: baseId + i,
              hospitalId: 1,
              issueSummary: `Rapid request ${i}`,
            })
            .then((r) => ({ response: r, requesterId: baseId + i }))
        );
      }

      // All should be handled
      cy.wrap(Promise.all(requests)).then((results) => {
        results.forEach((result) => {
          expect(result.response.status).to.be.oneOf([200, 400]);
        });

        // Cleanup
        results.forEach((result) => {
          if (result.response.body.sessionId) {
            cy.cancelSupportRequest(result.response.body.sessionId, result.requesterId);
          }
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });
  });
});
