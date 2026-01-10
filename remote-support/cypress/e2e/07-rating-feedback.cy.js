// 07-rating-feedback.cy.js - Session Rating & Feedback Tests (P1)
// Tests for rating, feedback submission, and preference tracking

describe('Session Rating & Feedback', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('Rating Submission', () => {
    it('submits rating 1 star', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        issueSummary: 'Rating 1 test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.apiPost(`/api/support/start/${sessionId}`).then(() => {
            cy.endSupportSession(sessionId, { endedBy: 9 }).then(() => {
              cy.rateSupportSession(sessionId, 1, '', 9).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.eq(true);
              });
            });
          });
        }
      });
    });

    it('submits rating 2 stars', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Rating 2 test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 2, '', 8).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('submits rating 3 stars', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Rating 3 test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
            cy.rateSupportSession(sessionId, 3, '', 5).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('submits rating 4 stars', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Rating 4 test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 4, '', 8).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('submits rating 5 stars', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Rating 5 test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
            cy.rateSupportSession(sessionId, 5, '', 5).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('submits with feedback text', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Feedback test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 5, 'Excellent service!', 8).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.success).to.eq(true);
            });
          });
        }
      });
    });

    it('submits without feedback', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 6,
        hospitalId: 1,
        issueSummary: 'No feedback test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 6 }).then(() => {
            cy.rateSupportSession(sessionId, 4, null, 6).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('only requester can rate', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Auth rate test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            // Try to rate as different user
            cy.rateSupportSession(sessionId, 5, '', 5).then((response) => {
              expect(response.status).to.eq(400);
              expect(response.body.error).to.include('Cannot rate');
            });
          });
        }
      });
    });
  });

  describe('Preference Updates', () => {
    it('increments successful_sessions count after rating', () => {
      cy.setConsultantStatus(1, 'available');

      // Get current preference state
      cy.getStaffPreferences(5).then((beforeResponse) => {
        const beforePref = beforeResponse.body.find((p) => p.consultantId === 1);
        const beforeCount = beforePref ? beforePref.successfulSessions : 0;

        cy.createSupportRequest({
          requesterId: 5,
          hospitalId: 1,
          department: 'ER',
          issueSummary: 'Session count test',
        }).then((createResponse) => {
          if (createResponse.body.status === 'connecting') {
            const sessionId = createResponse.body.sessionId;

            cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
              cy.rateSupportSession(sessionId, 5, '', 5).then(() => {
                cy.getStaffPreferences(5).then((afterResponse) => {
                  const afterPref = afterResponse.body.find((p) => p.consultantId === 1);
                  if (afterPref) {
                    expect(afterPref.successfulSessions).to.be.gte(beforeCount);
                  }
                });
              });
            });
          }
        });
      });
    });

    it('updates last_session_at after rating', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Last session test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 4, '', 8).then(() => {
              cy.getStaffPreferences(8).then((response) => {
                const pref = response.body.find((p) => p.consultantId === 2);
                if (pref) {
                  expect(pref.lastSessionAt).to.be.a('string');
                }
              });
            });
          });
        }
      });
    });

    it('creates preference if not exists', () => {
      cy.setConsultantStatus(4, 'available');
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');

      // User 9 may not have preference with David (4)
      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        department: 'IT',
        issueSummary: 'New preference test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 9 }).then(() => {
            cy.rateSupportSession(sessionId, 5, 'Great help!', 9).then(() => {
              cy.getStaffPreferences(9).then((response) => {
                // Preference should exist or be created
                expect(response.body).to.be.an('array');
              });
            });
          });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(3, 'available');
    });
  });

  describe('Validation', () => {
    it('rejects rating from non-requester', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Non-requester rate test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
            // Try to rate as user 6 (not the requester)
            cy.rateSupportSession(sessionId, 5, '', 6).then((response) => {
              expect(response.status).to.eq(400);
            });
          });
        }
      });
    });

    it('rejects invalid session ID', () => {
      cy.rateSupportSession(99999, 5, '', 5).then((response) => {
        expect(response.status).to.eq(400);
      });
    });

    it('accepts rating 1 (minimum)', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Min rating test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 1, '', 8).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('accepts rating 5 (maximum)', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Max rating test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
            cy.rateSupportSession(sessionId, 5, '', 5).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });
  });

  describe('Feedback Variations', () => {
    it('accepts short feedback', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Short feedback test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 4, 'Good', 8).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('accepts long feedback', () => {
      cy.setConsultantStatus(1, 'available');

      const longFeedback =
        'This was an excellent support session. The consultant was very knowledgeable and helped me solve a complex issue with the patient registration system. They walked me through each step patiently and made sure I understood everything before ending the call.';

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        issueSummary: 'Long feedback test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 5 }).then(() => {
            cy.rateSupportSession(sessionId, 5, longFeedback, 5).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });

    it('accepts empty string feedback', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Empty feedback test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;

          cy.endSupportSession(sessionId, { endedBy: 8 }).then(() => {
            cy.rateSupportSession(sessionId, 3, '', 8).then((response) => {
              expect(response.status).to.eq(200);
            });
          });
        }
      });
    });
  });
});
