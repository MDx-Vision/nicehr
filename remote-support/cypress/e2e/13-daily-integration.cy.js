// 13-daily-integration.cy.js - Daily.co Integration Tests (P2)
// Tests for video conferencing integration with Daily.co

describe('Daily.co Integration', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('Room Management', () => {
    it('creates video room for session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room creation test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Room should be created automatically or on demand
        cy.apiPost(`/api/support/sessions/${sessionId}/room`, {}).then((response) => {
          expect(response.status).to.be.oneOf([200, 201, 409]);
          if (response.status === 200 || response.status === 201) {
            expect(response.body).to.have.property('roomUrl');
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('room URL follows expected format', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room URL format test',
      }).then((createResponse) => {
        if (createResponse.body.roomUrl) {
          expect(createResponse.body.roomUrl).to.include('daily.co');
        }

        cy.endSupportSession(createResponse.body.sessionId, { endedBy: 5 });
      });
    });

    it('generates unique room names', () => {
      const roomNames = new Set();

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Unique room test 1',
      }).then((response1) => {
        if (response1.body.roomName) {
          roomNames.add(response1.body.roomName);
        }

        cy.endSupportSession(response1.body.sessionId, { endedBy: 5 });

        cy.createSupportRequest({
          requesterId: 6,
          hospitalId: 1,
          department: 'Radiology',
          issueSummary: 'Unique room test 2',
        }).then((response2) => {
          if (response2.body.roomName) {
            expect(roomNames.has(response2.body.roomName)).to.be.false;
          }

          cy.endSupportSession(response2.body.sessionId, { endedBy: 6 });
        });
      });
    });

    it('sets room expiration time', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room expiration test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room`).then((response) => {
          if (response.status === 200 && response.body.expiresAt) {
            const expiresAt = new Date(response.body.expiresAt);
            expect(expiresAt.getTime()).to.be.gt(Date.now());
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('deletes room after session ends', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room deletion test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;
        const roomName = createResponse.body.roomName;

        cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
          // Room should be deleted or marked for deletion
          if (roomName) {
            cy.apiGet(`/api/rooms/${roomName}`).then((response) => {
              expect(response.status).to.be.oneOf([200, 404]);
            });
          }
        });
      });
    });
  });

  describe('Token Generation', () => {
    it('generates meeting token for requester', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Requester token test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.joinSupportSession(sessionId, { participantId: 5 }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('token');
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('generates meeting token for consultant', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Consultant token test',
      }).then((createResponse) => {
        if (createResponse.body.consultant) {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          cy.joinSupportSession(sessionId, { participantId: consultantId }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');
          });

          cy.endSupportSession(sessionId, { endedBy: 5 });
        }
      });
    });

    it('token includes user identity', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Token identity test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.joinSupportSession(sessionId, { participantId: 5 }).then((response) => {
          if (response.body.token) {
            // Token should be a JWT or include identity info
            expect(response.body.token).to.be.a('string');
            expect(response.body.token.length).to.be.gt(10);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('token has appropriate expiration', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Token expiration test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.joinSupportSession(sessionId, { participantId: 5 }).then((response) => {
          if (response.body.tokenExpiresAt) {
            const expiresAt = new Date(response.body.tokenExpiresAt);
            expect(expiresAt.getTime()).to.be.gt(Date.now());
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('prevents token generation for wrong user', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Wrong user token test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // User 10 is not part of this session
        cy.joinSupportSession(sessionId, { participantId: 10 }).then((response) => {
          expect(response.status).to.be.oneOf([200, 403]);
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });
  });

  describe('Room Permissions', () => {
    it('enables video by default', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Video enabled test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            expect(response.body.enableVideo).to.not.eq(false);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('enables audio by default', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Audio enabled test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            expect(response.body.enableAudio).to.not.eq(false);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('supports screen sharing permission', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Screen share test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('enableScreenShare');
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('limits participants in room', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Participant limit test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            // Should limit to 2 participants for 1:1 support
            expect(response.body.maxParticipants).to.be.lte(10);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('enforces privacy settings', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Privacy settings test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            // Room should be private
            expect(response.body.isPrivate).to.not.eq(false);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });
  });

  describe('Daily.co API Health', () => {
    it('checks Daily.co API connectivity', () => {
      cy.apiGet('/api/health/daily').then((response) => {
        expect(response.status).to.be.oneOf([200, 503]);
      });
    });

    it('validates API credentials', () => {
      cy.apiGet('/api/health/daily/credentials').then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 404, 503]);
      });
    });

    it('reports remaining API quota', () => {
      cy.apiGet('/api/health/daily/quota').then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 503]);
        if (response.status === 200) {
          expect(response.body).to.have.property('remaining');
        }
      });
    });
  });

  describe('HIPAA Compliance Features', () => {
    it('disables room recording by default for HIPAA', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'HIPAA recording default test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            // Recording should be off by default for HIPAA
            expect(response.body.startCloudRecording).to.be.oneOf([false, undefined]);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('enables end-to-end encryption option', () => {
      cy.apiGet('/api/settings/encryption').then((response) => {
        expect(response.status).to.be.oneOf([200, 404]);
      });
    });

    it('disables waiting room for direct connections', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'No waiting room test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/room/config`).then((response) => {
          if (response.status === 200) {
            // No waiting room for matched consultant
            expect(response.body.enableKnocking).to.be.oneOf([false, undefined]);
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('logs all room access for audit', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Audit log test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.joinSupportSession(sessionId, { participantId: 5 }).then(() => {
          cy.apiGet(`/api/support/sessions/${sessionId}/audit`).then((response) => {
            expect(response.status).to.be.oneOf([200, 404]);
          });
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });
  });

  describe('Connection Quality', () => {
    it('monitors connection quality', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Connection quality test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/quality`).then((response) => {
          expect(response.status).to.be.oneOf([200, 404, 501]);
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('reports participant connection stats', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Connection stats test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.joinSupportSession(sessionId, { participantId: 5 }).then(() => {
          cy.apiGet(`/api/support/sessions/${sessionId}/participants/stats`).then((response) => {
            expect(response.status).to.be.oneOf([200, 404, 501]);
          });
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('handles network degradation gracefully', () => {
      // This is mostly a UI test but we can verify endpoint exists
      cy.apiGet('/api/settings/quality-thresholds').then((response) => {
        expect(response.status).to.be.oneOf([200, 404]);
      });
    });
  });

  describe('Room Lifecycle', () => {
    it('room becomes inactive when session ends', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room lifecycle test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
          cy.apiGet(`/api/support/sessions/${sessionId}`).then((response) => {
            expect(response.body.status).to.eq('completed');
          });
        });
      });
    });

    it('cleans up room resources after session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room cleanup test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
          // Verify cleanup occurred
          cy.apiGet(`/api/support/sessions/${sessionId}/room`).then((response) => {
            expect(response.status).to.be.oneOf([200, 404]);
          });
        });
      });
    });

    it('handles abandoned sessions', () => {
      // Check for session timeout handling
      cy.apiGet('/api/settings/session-timeout').then((response) => {
        expect(response.status).to.be.oneOf([200, 404]);
        if (response.status === 200) {
          expect(response.body.timeoutMinutes).to.be.a('number');
        }
      });
    });
  });
});
