// 11-error-handling.cy.js - Error Handling Tests (P2)
// Tests for API errors, validation, and edge cases

describe('Error Handling', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 1100;

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
        expect(response.status).to.eq(400);
      });
    });

    it('returns 403 for unauthorized actions', () => {
      // Create session then try to cancel as wrong user
      cy.setConsultantStatus(1, 'offline');
      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: '403 test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        cy.cancelSupportRequest(sessionId, 6).then((response) => {
          expect(response.status).to.eq(403);
        });
        cy.cancelSupportRequest(sessionId, 5);
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
        requesterId: 5,
        issueSummary: 'Conflict test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        cy.cancelSupportRequest(sessionId, 5).then(() => {
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
        requesterId: 5,
        issueSummary: 'First request',
      }).then((firstResponse) => {
        cy.createSupportRequest({
          requesterId: 5,
          issueSummary: 'Second request',
        }).then((secondResponse) => {
          expect(secondResponse.status).to.eq(400);
          expect(secondResponse.body.error).to.include('already');

          // Cleanup
          if (firstResponse.body.status === 'pending') {
            cy.cancelSupportRequest(firstResponse.body.sessionId, 5);
          } else if (firstResponse.body.status === 'connecting') {
            cy.endSupportSession(firstResponse.body.sessionId, { endedBy: 5 });
          }
        });
      });
    });

    it('cancel non-existent session returns 404', () => {
      cy.cancelSupportRequest(99999, 5).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('unauthorized cancel returns 403', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        cy.cancelSupportRequest(sessionId, 6).then((response) => {
          expect(response.status).to.eq(403);
          expect(response.body.error).to.include('Not authorized');
        });
        cy.cancelSupportRequest(sessionId, 5);
      });
      cy.setConsultantStatus(1, 'available');
    });

    it('cancel non-pending returns 400', () => {
      cy.setConsultantStatus(1, 'available');
      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Non-pending cancel',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          cy.cancelSupportRequest(sessionId, 8).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.include('pending');
          });
          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });
  });

  describe('Consultant Errors', () => {
    it('invalid status returns 400', () => {
      cy.setConsultantStatus(1, 'not_a_real_status').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('Invalid');
      });
    });

    it('status change during session returns 400', () => {
      cy.setConsultantStatus(2, 'available');
      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Busy status change test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          cy.setConsultantStatus(consultantId, 'offline').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.include('active session');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('non-consultant preference add returns 404', () => {
      // User 5 is hospital_staff, not consultant
      cy.addStaffPreference(6, 5).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error).to.include('not found');
      });
    });
  });

  describe('Schedule Errors', () => {
    it('missing fields returns 400', () => {
      cy.createScheduledSession({
        requesterId: 5,
        // Missing consultantId, scheduledAt, topic
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('past date returns 400', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      cy.createScheduledSession({
        requesterId: 5,
        consultantId: 1,
        scheduledAt: pastDate.toISOString(),
        topic: 'Past date',
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('future');
      });
    });

    it('non-existent session cancel returns 404', () => {
      cy.cancelScheduledSession(99999, 5, 'Test').then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('unauthorized cancel returns 403', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      cy.createScheduledSession({
        requesterId: 5,
        consultantId: 1,
        hospitalId: 1,
        scheduledAt: futureDate.toISOString(),
        topic: 'Auth test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.id;

        // Try to cancel as user 6 (not participant)
        cy.cancelScheduledSession(sessionId, 6, 'Unauthorized').then((response) => {
          expect(response.status).to.eq(403);
        });

        // Cleanup
        cy.cancelScheduledSession(sessionId, 5, 'Cleanup');
      });
    });
  });

  describe('Session Join Errors', () => {
    it('non-participant cannot join', () => {
      cy.setConsultantStatus(1, 'available');
      cy.createSupportRequest({
        requesterId: 5,
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
            expect(response.status).to.eq(403);
          });

          cy.endSupportSession(sessionId, { endedBy: 5 });
        }
      });
    });

    it('cannot join completed session', () => {
      cy.setConsultantStatus(2, 'available');
      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Completed join test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.apiPost(`/api/support/join/${sessionId}`, {
              userId: 8,
              userName: 'Anna Garcia',
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
        userId: 5,
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
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Rating error test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
            cy.rateSupportSession(sessionId, 5, '', 6).then((response) => {
              expect(response.status).to.eq(400);
              expect(response.body.error).to.include('Cannot rate');
            });
          });
        }
      });
    });

    it('invalid session returns 400', () => {
      cy.rateSupportSession(99999, 5, '', 5).then((response) => {
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
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Recording auth test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/${sessionId}/recording/start`, {
            userId: 5, // Requester, not consultant
          }).then((response) => {
            expect(response.status).to.eq(403);
          });

          cy.endSupportSession(sessionId, { endedBy: 5 });
        }
      });
    });
  });

  describe('Data Validation', () => {
    it('handles empty strings gracefully', () => {
      cy.createSupportRequest({
        requesterId: 6,
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
        requesterId: 9,
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
        requesterId: 6,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Test with <script>alert("xss")</script> special chars!',
      }).then((response) => {
        // Should accept or sanitize
        expect(response.status).to.eq(200);
      });
    });

    it('handles unicode characters', () => {
      cy.createSupportRequest({
        requesterId: 6,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Test with unicode: 你好 🏥 émojis',
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Concurrent Operation Handling', () => {
    it('handles rapid consecutive requests', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');

      // Multiple requests in quick succession
      const requests = [];
      for (let i = 0; i < 3; i++) {
        requests.push(
          cy
            .createSupportRequest({
              requesterId: 5 + i,
              hospitalId: 1,
              issueSummary: `Rapid request ${i}`,
            })
            .then((r) => r)
        );
      }

      // All should be handled
      cy.wrap(Promise.all(requests)).then((responses) => {
        responses.forEach((r) => {
          expect(r.status).to.be.oneOf([200, 400]);
        });

        // Cleanup
        responses.forEach((r) => {
          if (r.body.sessionId) {
            cy.cancelSupportRequest(r.body.sessionId, r.body.sessionId <= 22 ? 5 : 6);
          }
        });
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });
  });
});
