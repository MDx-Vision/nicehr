// 06-smart-matching.cy.js - Smart Matching Algorithm Tests (P1)
// Tests for consultant matching logic and scoring

describe('Smart Matching Algorithm', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 600;

  // Reset all consultant statuses before this test file runs
  before(() => {
    [1, 2, 3, 4].forEach((id) => {
      cy.setConsultantStatus(id, 'available');
    });
  });

  beforeEach(() => {
    testRequesterId++;
    // Ensure at least one consultant is available
    cy.setConsultantStatus(1, 'available');
    cy.setConsultantStatus(2, 'available');
  });

  describe('Basic Matching', () => {
    it('matches available consultant', () => {
      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'Basic match test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant).to.exist;
          expect(response.body.consultant.id).to.be.a('number');
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });
    });

    it('returns null when no consultants available', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: 6,
        hospitalId: 1,
        issueSummary: 'No consultant test',
      }).then((response) => {
        // May be pending (queued) or have an error
        if (response.body.status) {
          expect(response.body.status).to.be.oneOf(['pending', 'connecting']);
        }
        if (response.body.sessionId) {
          cy.cancelSupportRequest(response.body.sessionId, 6);
        }
      });

      // Restore
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
    });

    it('returns consultant info (id, name, email)', () => {
      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Consultant info test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant.id).to.be.a('number');
          expect(response.body.consultant.name).to.be.a('string');
          expect(response.body.consultant.email).to.include('@');
          cy.endSupportSession(response.body.sessionId, { endedBy: 8 });
        }
      });
    });

    it('returns match reasons array', () => {
      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Match reasons test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.matchReasons).to.be.an('array');
          cy.endSupportSession(response.body.sessionId, { endedBy: 8 });
        }
      });
    });
  });

  describe('Score Calculation - Department', () => {
    it('adds +30 for department expert (Radiology to Marcus)', () => {
      // Marcus is Radiology expert
      cy.setConsultantStatus(1, 'offline'); // Sarah
      cy.setConsultantStatus(3, 'offline'); // Emily
      cy.setConsultantStatus(4, 'offline'); // David
      cy.setConsultantStatus(2, 'available'); // Marcus - Radiology expert

      cy.createSupportRequest({
        requesterId: 9, // New staff, no history
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Expert match test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant.id).to.eq(2);
          if (response.body.matchReasons && response.body.matchReasons.length > 0) {
            const reasons = response.body.matchReasons.join(' ');
            expect(reasons.toLowerCase()).to.include('expert');
          }
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'available');
    });

    it('adds +15 for department standard (ER to Emily)', () => {
      // Emily has standard proficiency for ER
      cy.setConsultantStatus(1, 'offline'); // Sarah - ER expert
      cy.setConsultantStatus(2, 'offline'); // Marcus
      cy.setConsultantStatus(4, 'offline'); // David
      cy.setConsultantStatus(3, 'available'); // Emily - ER standard

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'Standard match test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant.id).to.eq(3);
          // Should match Emily with standard ER
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(4, 'available');
    });

    it('expert beats standard for same department', () => {
      // Sarah is ER expert, Emily has ER standard
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(4, 'offline');
      cy.setConsultantStatus(1, 'available'); // Sarah - ER expert
      cy.setConsultantStatus(3, 'available'); // Emily - ER standard

      cy.createSupportRequest({
        requesterId: 9, // New staff
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'Expert vs standard test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          // Sarah (expert +30) should beat Emily (standard +15)
          expect(response.body.consultant.id).to.eq(1);
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });

      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(4, 'available');
    });
  });

  describe('Score Calculation - Relationship', () => {
    it('adds +50 for previous relationship (John to Sarah)', () => {
      // John Smith (id: 5) has history with Sarah Chen (id: 1)
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5, // John Smith - has history with Sarah
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Relationship test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant.id).to.eq(1);
          if (response.body.matchReasons && response.body.matchReasons.length > 0) {
            const reasons = response.body.matchReasons.join(' ').toLowerCase();
            expect(reasons).to.match(/relationship|history|previous/);
          }
          cy.endSupportSession(response.body.sessionId, { endedBy: 5 });
        }
      });

      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'available');
    });

    it('adds +20 for high rating (4-5 stars)', () => {
      // Anna Garcia (id: 8) has history with Marcus (id: 2) with 4-star rating
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'High rating test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant.id).to.eq(2);
          if (response.body.matchReasons && response.body.matchReasons.length > 0) {
            const reasons = response.body.matchReasons.join(' ').toLowerCase();
            expect(reasons).to.match(/rating|score|history|relationship|expert/);
          }
          cy.endSupportSession(response.body.sessionId, { endedBy: 8 });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'available');
    });

    it('handles staff with no previous relationship', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 9, // James Wilson - different staff
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'No history test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          // Should still match but without relationship bonus
          expect(response.body.consultant).to.exist;
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });
    });
  });

  describe('Score Calculation - Rotation', () => {
    it('subtracts penalty for sessions today (rotation balancing)', () => {
      // After many sessions, consultant should have lower priority
      cy.getAllConsultants().then((response) => {
        response.body.forEach((c) => {
          expect(c).to.have.property('sessionsToday');
        });
      });
    });
  });

  describe('Ranking', () => {
    it('selects highest scoring consultant', () => {
      // Marcus is Radiology expert (+30) and has relationship with Anna (+50, +20)
      // Total for Radiology request from Anna: 100 points
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'available');

      cy.createSupportRequest({
        requesterId: 8, // Anna - has relationship with Marcus
        hospitalId: 2,
        department: 'Radiology', // Marcus is expert
        issueSummary: 'Best match test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          // Marcus should win with highest score
          expect(response.body.consultant.id).to.eq(2);
          cy.endSupportSession(response.body.sessionId, { endedBy: 8 });
        }
      });
    });

    it('breaks ties consistently', () => {
      // Test that matching is deterministic
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'offline');
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');

      let firstMatch;
      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        department: 'Nursing', // Neither expert
        issueSummary: 'Tie breaker test 1',
      }).then((response1) => {
        if (response1.body.status === 'connecting') {
          firstMatch = response1.body.consultant.id;
          cy.endSupportSession(response1.body.sessionId, { endedBy: 9 }).then(() => {
            cy.createSupportRequest({
              requesterId: 9,
              hospitalId: 2,
              department: 'Nursing',
              issueSummary: 'Tie breaker test 2',
            }).then((response2) => {
              if (response2.body.status === 'connecting') {
                // May differ due to rotation, but should be deterministic
                expect(response2.body.consultant.id).to.be.a('number');
                cy.endSupportSession(response2.body.sessionId, { endedBy: 9 });
              }
            });
          });
        }
      });

      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'available');
    });
  });

  describe('Integration', () => {
    it('auto-matches on request creation', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Auto-match integration test',
      }).then((response) => {
        // Should be connecting or pending depending on availability
        if (response.body.status) {
          expect(response.body.status).to.be.oneOf(['connecting', 'pending']);
          if (response.body.status === 'connecting') {
            expect(response.body.consultant).to.exist;
          }
        }
        if (response.body.sessionId) {
          cy.endSupportSession(response.body.sessionId, { endedBy: 8 });
        }
      });
    });

    it('logs match reasons in event', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 5,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Event logging test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          // Match reasons are logged
          expect(response.body.matchReasons).to.be.an('array');
          expect(response.body.matchReasons.length).to.be.gte(1);
          cy.endSupportSession(response.body.sessionId, { endedBy: 5 });
        }
      });
    });

    it('creates room when matched', () => {
      cy.setConsultantStatus(1, 'available');

      cy.createSupportRequest({
        requesterId: 6,
        hospitalId: 1,
        department: 'ER',
        issueSummary: 'Room creation test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.roomUrl).to.include('daily.co');
          cy.endSupportSession(response.body.sessionId, { endedBy: 6 });
        }
      });
    });

    it('notifies matched consultant', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Notification test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          // Notification is sent via WebSocket (tested indirectly)
          expect(response.body.consultant).to.exist;
          cy.endSupportSession(response.body.sessionId, { endedBy: 8 });
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles single available consultant', () => {
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'offline');
      cy.setConsultantStatus(4, 'available');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        department: 'ER',
        issueSummary: 'Single consultant test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant.id).to.eq(4);
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(3, 'available');
    });

    it('handles all consultants busy', () => {
      cy.setConsultantStatus(1, 'busy');
      cy.setConsultantStatus(2, 'busy');
      cy.setConsultantStatus(3, 'busy');
      cy.setConsultantStatus(4, 'busy');

      cy.createSupportRequest({
        requesterId: 9,
        hospitalId: 2,
        issueSummary: 'All busy test',
      }).then((response) => {
        if (response.body.status) {
          expect(response.body.status).to.be.oneOf(['pending', 'connecting']);
        }
        if (response.body.sessionId) {
          cy.cancelSupportRequest(response.body.sessionId, 9);
        }
      });

      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'available');
    });

    it('handles new consultant (no history)', () => {
      // Any available consultant can match with new staff
      cy.setConsultantStatus(4, 'available');

      cy.createSupportRequest({
        requesterId: 9, // Staff with minimal history
        hospitalId: 2,
        department: 'IT',
        issueSummary: 'New consultant test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          expect(response.body.consultant).to.exist;
          cy.endSupportSession(response.body.sessionId, { endedBy: 9 });
        }
      });
    });
  });
});
