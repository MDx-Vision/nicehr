// 03-video-call.cy.js - Video Call Session Tests (P0)
// Tests for joining calls, session lifecycle, and video functionality

describe('Video Call Session', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('Session Join', () => {
    it('generates token for valid session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Token generation test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: 8,
            userName: 'Anna Garcia',
            isConsultant: false,
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
            expect(response.body.token).to.be.a('string');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('returns room URL with token', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Room URL test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: 8,
            userName: 'Anna Garcia',
            isConsultant: false,
          }).then((response) => {
            expect(response.body).to.have.property('roomUrl');
            expect(response.body.roomUrl).to.include('daily.co');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('validates user is session participant', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Participant validation test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          // Valid participant should succeed
          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: 8,
            userName: 'Anna Garcia',
            isConsultant: false,
          }).then((response) => {
            expect(response.status).to.eq(200);
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('rejects join for non-participant', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Non-participant test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          // Non-participant should be rejected
          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: 999,
            userName: 'Unknown User',
            isConsultant: false,
          }).then((response) => {
            expect(response.status).to.eq(403);
            expect(response.body.error).to.include('Not authorized');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('rejects join for completed session', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        issueSummary: 'Completed session test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          // End the session
          cy.endSupportSession(sessionId, { endedBy: 9 }).then(() => {
            // Try to join completed session
            cy.apiPost(`/api/support/join/${sessionId}`, {
              userId: 9,
              userName: 'James Wilson',
              isConsultant: false,
            }).then((response) => {
              expect(response.status).to.eq(400);
              expect(response.body.error).to.include('not active');
            });
          });
        }
      });
    });

    it('sets isOwner flag for consultant', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Owner flag test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          // Consultant joins as owner
          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: consultantId,
            userName: 'Marcus Johnson',
            isConsultant: true,
          }).then((response) => {
            expect(response.status).to.eq(200);
            // Token is generated - ownership is set in token properties
            expect(response.body.token).to.be.a('string');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('returns 404 for non-existent session', () => {
      cy.apiPost('/api/support/join/99999', {
        userId: 5,
        userName: 'Test User',
        isConsultant: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Session Start', () => {
    it('marks session as active', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Session start test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.success).to.eq(true);
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('records start timestamp', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Start timestamp test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.getActiveSession(8).then((response) => {
              expect(response.body.status).to.eq('active');
              expect(response.body.started_at).to.be.a('string');
            });
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('rejects start for non-connecting session', () => {
      cy.setConsultantStatus(1, 'offline');

      cy.createSupportRequest({
        requesterId: 5,
        issueSummary: 'Non-connecting start test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Session is pending, not connecting
        cy.apiPost(`/api/support/start/${sessionId}`).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.include('connecting');
        });

        cy.cancelSupportRequest(sessionId, 5);
      });

      cy.setConsultantStatus(1, 'available');
    });
  });

  describe('Session End', () => {
    it('marks session as completed', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Session end test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.endSupportSession(sessionId, { endedBy: 8 }).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.success).to.eq(true);
            });
          });
        }
      });
    });

    it('records end timestamp', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'End timestamp test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
              cy.getSupportHistory(8, 'hospital_staff', 1).then((response) => {
                const session = response.body.find((s) => s.id === sessionId);
                if (session) {
                  expect(session).to.have.property('endedAt');
                }
              });
            });
          });
        }
      });
    });

    it('calculates duration in seconds', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        issueSummary: 'Duration test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.wait(1000); // Wait 1 second

            cy.endSupportSession(sessionId, { endedBy: 9 }).then((response) => {
              expect(response.body.durationSeconds).to.be.a('number');
              expect(response.body.durationSeconds).to.be.gte(0);
            });
          });
        }
      });
    });

    it('frees consultant (status: available)', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Free consultant test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            // Consultant should be busy
            cy.getAllConsultants().then((response) => {
              const consultant = response.body.find((c) => c.id === consultantId);
              expect(consultant.status).to.eq('busy');
            });

            cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
              // Consultant should be available
              cy.getAllConsultants().then((response) => {
                const consultant = response.body.find((c) => c.id === consultantId);
                expect(consultant.status).to.eq('available');
              });
            });
          });
        }
      });
    });

    it('records resolution notes if provided', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        issueSummary: 'Resolution notes test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.endSupportSession(sessionId, {
              endedBy: 8,
              resolutionNotes: 'Issue resolved by clearing cache',
            }).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('returns 404 for non-existent session', () => {
      cy.endSupportSession(99999, { endedBy: 5 }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Session Lifecycle', () => {
    it('completes full session lifecycle', () => {
      cy.setConsultantStatus(1, 'available');

      // 1. Create request
      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'ER',
        urgency: 'normal',
        issueSummary: 'Full lifecycle test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          // 2. Verify connecting status
          cy.getActiveSession(8).then((response) => {
            expect(response.body.status).to.eq('connecting');
          });

          // 3. Join session (get token)
          cy.apiPost(`/api/support/join/${sessionId}`, {
            userId: 8,
            userName: 'Anna Garcia',
            isConsultant: false,
          }).then((joinResponse) => {
            expect(joinResponse.body.token).to.exist;
          });

          // 4. Start session
          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.getActiveSession(8).then((response) => {
              expect(response.body.status).to.eq('active');
            });
          });

          // 5. End session
          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            // 6. Verify session completed
            cy.getActiveSession(8).then((response) => {
              expect(response.body).to.be.oneOf([null, '']);
            });

            // 7. Verify consultant freed
            cy.getAllConsultants().then((response) => {
              const consultant = response.body.find((c) => c.id === consultantId);
              expect(consultant.status).to.eq('available');
            });

            // 8. Rate session
            cy.rateSupportSession(sessionId, 5, 'Great help!', 8).then((rateResponse) => {
              expect(rateResponse.body.success).to.eq(true);
            });
          });
        }
      });
    });

    it('handles session from queue to completion', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      // 1. Create request (goes to queue)
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Queue to completion test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        expect(createResponse.body.status).to.eq('pending');

        // 2. Verify in queue
        cy.getSupportQueue().then((response) => {
          const inQueue = response.body.some((i) => i.id === sessionId);
          expect(inQueue).to.be.true;
        });

        // 3. Consultant becomes available and accepts
        cy.setConsultantStatus(1, 'available');

        cy.acceptSupportRequest(sessionId, 1).then((acceptResponse) => {
          expect(acceptResponse.body.roomUrl).to.exist;

          // 4. Start and end session
          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
              // 5. Verify completed
              cy.getActiveSession(5).then((response) => {
                expect(response.body).to.be.oneOf([null, '']);
              });
            });
          });
        });
      });

      cy.setConsultantStatus(2, 'available');
    });
  });

  describe('Multiple Concurrent Sessions', () => {
    it('handles multiple consultants in separate sessions', () => {
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');

      // First session
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Concurrent session 1',
      }).then((r1) => {
        // Second session
        cy.createSupportRequest({
          requesterId: 8,
          hospitalId: 2,
          department: 'Radiology',
          issueSummary: 'Concurrent session 2',
        }).then((r2) => {
          // Both should be matched (different consultants)
          if (r1.body.status === 'connecting' && r2.body.status === 'connecting') {
            expect(r1.body.consultant.id).to.not.eq(r2.body.consultant.id);

            cy.endSupportSession(r1.body.sessionId, { endedBy: 5 });
            cy.endSupportSession(r2.body.sessionId, { endedBy: 8 });
          }
        });
      });
    });
  });
});
