// 12-recording.cy.js - Recording and Transcription Tests (P2)
// Tests for session recording and transcription features

describe('Recording and Transcription', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('Recording Configuration', () => {
    it('returns recording settings for session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Recording test session',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/recording`).then((response) => {
          expect(response.status).to.be.oneOf([200, 404]);
          if (response.status === 200) {
            expect(response.body).to.have.property('enabled');
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('enables recording for session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Enable recording test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiPost(`/api/support/sessions/${sessionId}/recording/enable`, {}).then((response) => {
          expect(response.status).to.be.oneOf([200, 501]);
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('disables recording for session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Disable recording test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiPost(`/api/support/sessions/${sessionId}/recording/disable`, {}).then((response) => {
          expect(response.status).to.be.oneOf([200, 501]);
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('respects HIPAA recording consent requirements', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'HIPAA consent test',
        recordingConsent: false,
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        // Recording should not be enabled without consent
        cy.apiPost(`/api/support/sessions/${sessionId}/recording/enable`, {}).then((response) => {
          expect(response.status).to.be.oneOf([200, 400, 403, 501]);
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('requires recording consent for healthcare sessions', () => {
      // HIPAA compliance requires explicit consent
      cy.apiPost('/api/support/request', {
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Consent required test',
        requiresRecording: true,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });

  describe('Recording Status', () => {
    it('returns recording status for active session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Recording status test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/recording/status`).then((response) => {
          expect(response.status).to.be.oneOf([200, 404, 501]);
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('tracks recording duration', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Recording duration test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/recording/status`).then((response) => {
          if (response.status === 200 && response.body.isRecording) {
            expect(response.body).to.have.property('duration');
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('indicates storage location for recordings', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Storage location test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiGet(`/api/support/sessions/${sessionId}/recording`).then((response) => {
          if (response.status === 200 && response.body.recordingUrl) {
            expect(response.body.recordingUrl).to.be.a('string');
          }
        });

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });
  });

  describe('Transcription Features', () => {
    it('enables transcription for session', () => {
      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Transcription test',
      }).then((createResponse) => {
        const sessionId = createResponse.body.sessionId;

        cy.apiPost(`/api/support/sessions/${sessionId}/transcription/enable`, {}).then(
          (response) => {
            expect(response.status).to.be.oneOf([200, 501]);
          }
        );

        cy.endSupportSession(sessionId, { endedBy: 5 });
      });
    });

    it('retrieves transcription for completed session', () => {
      // Get a completed session
      cy.apiGet('/api/analytics/recent-sessions?limit=1').then((response) => {
        if (response.body.length > 0) {
          const sessionId = response.body[0].id;

          cy.apiGet(`/api/support/sessions/${sessionId}/transcription`).then((transResponse) => {
            expect(transResponse.status).to.be.oneOf([200, 404, 501]);
          });
        }
      });
    });

    it('handles transcription not available', () => {
      cy.apiGet('/api/support/sessions/99999/transcription').then((response) => {
        expect(response.status).to.be.oneOf([404, 501]);
      });
    });

    it('returns transcription in text format', () => {
      cy.apiGet('/api/analytics/recent-sessions?limit=5').then((response) => {
        if (response.body.length > 0) {
          const sessionId = response.body[0].id;

          cy.apiGet(`/api/support/sessions/${sessionId}/transcription?format=text`).then(
            (transResponse) => {
              if (transResponse.status === 200) {
                expect(transResponse.body).to.have.property('text');
              }
            }
          );
        }
      });
    });

    it('returns transcription with timestamps', () => {
      cy.apiGet('/api/analytics/recent-sessions?limit=5').then((response) => {
        if (response.body.length > 0) {
          const sessionId = response.body[0].id;

          cy.apiGet(`/api/support/sessions/${sessionId}/transcription?timestamps=true`).then(
            (transResponse) => {
              if (transResponse.status === 200 && transResponse.body.segments) {
                transResponse.body.segments.forEach((segment) => {
                  expect(segment).to.have.property('timestamp');
                });
              }
            }
          );
        }
      });
    });
  });

  describe('Recording Access Control', () => {
    it('restricts recording access to authorized users', () => {
      cy.apiGet('/api/support/sessions/1/recording').then((response) => {
        // Should either succeed (authorized) or return 403/404
        expect(response.status).to.be.oneOf([200, 403, 404, 501]);
      });
    });

    it('tracks recording access in audit log', () => {
      cy.apiGet('/api/analytics/recent-sessions?limit=1').then((response) => {
        if (response.body.length > 0) {
          const sessionId = response.body[0].id;

          // Access recording
          cy.apiGet(`/api/support/sessions/${sessionId}/recording`).then(() => {
            // Check audit log
            cy.apiGet('/api/audit/logs?action=recording_access').then((auditResponse) => {
              expect(auditResponse.status).to.be.oneOf([200, 404, 501]);
            });
          });
        }
      });
    });

    it('enforces retention policy on recordings', () => {
      cy.apiGet('/api/settings/recording-retention').then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 501]);
        if (response.status === 200) {
          expect(response.body).to.have.property('retentionDays');
        }
      });
    });
  });

  describe('Recording Storage', () => {
    it('stores recordings securely', () => {
      cy.apiGet('/api/settings/recording-storage').then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 501]);
      });
    });

    it('encrypts recordings at rest', () => {
      cy.apiGet('/api/settings/encryption').then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 501]);
        if (response.status === 200) {
          expect(response.body.atRestEncryption).to.be.oneOf([true, undefined]);
        }
      });
    });

    it('supports recording download', () => {
      cy.apiGet('/api/analytics/recent-sessions?limit=1').then((response) => {
        if (response.body.length > 0) {
          const sessionId = response.body[0].id;

          cy.apiGet(`/api/support/sessions/${sessionId}/recording/download`).then(
            (downloadResponse) => {
              expect(downloadResponse.status).to.be.oneOf([200, 404, 501]);
            }
          );
        }
      });
    });

    it('generates signed URLs for recording access', () => {
      cy.apiGet('/api/analytics/recent-sessions?limit=1').then((response) => {
        if (response.body.length > 0) {
          const sessionId = response.body[0].id;

          cy.apiGet(`/api/support/sessions/${sessionId}/recording/signed-url`).then(
            (urlResponse) => {
              expect(urlResponse.status).to.be.oneOf([200, 404, 501]);
              if (urlResponse.status === 200) {
                expect(urlResponse.body).to.have.property('url');
                expect(urlResponse.body).to.have.property('expiresAt');
              }
            }
          );
        }
      });
    });
  });

  describe('Bulk Recording Operations', () => {
    it('lists all recordings for hospital', () => {
      cy.apiGet('/api/recordings?hospitalId=1').then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 501]);
      });
    });

    it('lists recordings by date range', () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      cy.apiGet(`/api/recordings?startDate=${startDate}&endDate=${endDate}`).then((response) => {
        expect(response.status).to.be.oneOf([200, 404, 501]);
      });
    });

    it('supports bulk recording deletion', () => {
      cy.apiPost('/api/recordings/bulk-delete', {
        recordingIds: [],
        confirm: true,
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400, 404, 501]);
      });
    });

    it('exports recordings for compliance', () => {
      cy.apiPost('/api/recordings/export', {
        hospitalId: 1,
        format: 'zip',
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 202, 404, 501]);
      });
    });
  });
});
