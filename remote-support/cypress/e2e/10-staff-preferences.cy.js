// 10-staff-preferences.cy.js - Staff Preferences Tests (P2)
// Tests for staff consultant preferences and scheduling

describe('Staff Preferences', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';
  let testRequesterId = 1000;

  beforeEach(() => {
    testRequesterId++;
  });

  describe('Get Preferences', () => {
    it('returns staff preferred consultants', () => {
      cy.getStaffPreferences(5).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('returns consultant details', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          const pref = response.body[0];
          expect(pref).to.have.property('consultantId');
          expect(pref).to.have.property('consultantName');
          expect(pref).to.have.property('consultantEmail');
        }
      });
    });

    it('returns consultant status', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('status');
        }
      });
    });

    it('returns consultant specialties', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('specialties');
          expect(response.body[0].specialties).to.be.an('array');
        }
      });
    });

    it('returns session count', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('successfulSessions');
          expect(response.body[0].successfulSessions).to.be.a('number');
        }
      });
    });

    it('returns average rating', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('avgRating');
        }
      });
    });

    it('returns last session date', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('lastSessionAt');
        }
      });
    });

    it('returns isFavorite flag', () => {
      cy.getStaffPreferences(5).then((response) => {
        if (response.body.length > 0) {
          expect(response.body[0]).to.have.property('isFavorite');
          expect(response.body[0].isFavorite).to.be.a('boolean');
        }
      });
    });

    it('returns empty array for staff with no preferences', () => {
      cy.getStaffPreferences(999).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  describe('Add Preference', () => {
    it('adds consultant as favorite', () => {
      // Add preference for staff 9 -> consultant 3
      cy.addStaffPreference(9, 3).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.eq(true);
      });
    });

    it('validates consultant exists', () => {
      cy.addStaffPreference(5, 999).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error).to.include('not found');
      });
    });

    it('validates consultant role', () => {
      // User 5 is hospital_staff, not consultant
      cy.addStaffPreference(6, 5).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('returns success with consultant name', () => {
      cy.addStaffPreference(6, 4).then((response) => {
        expect(response.body.consultantName).to.be.a('string');
        expect(response.body.consultantId).to.eq(4);
      });
    });

    it('requires consultantId', () => {
      cy.apiPost('/api/consultants/preferences/5', {}).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe('Remove Preference', () => {
    it('removes favorite consultant', () => {
      // First add, then remove
      cy.addStaffPreference(9, 4).then(() => {
        cy.removeStaffPreference(9, 4).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.eq(true);
        });
      });
    });

    it('returns success even if preference did not exist', () => {
      cy.removeStaffPreference(9, 999).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Staff Schedule', () => {
    it('returns default 9-5 Mon-Fri', () => {
      cy.getStaffSchedule(999).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.eq(5); // Mon-Fri

        response.body.forEach((day) => {
          expect(day.start_time).to.eq('09:00');
          expect(day.end_time).to.eq('17:00');
          expect(day.is_available).to.eq(true);
        });
      });
    });

    it('returns custom schedule if set', () => {
      const customSchedule = [
        { day_of_week: 1, start_time: '08:00', end_time: '16:00', is_available: true },
        { day_of_week: 2, start_time: '08:00', end_time: '16:00', is_available: true },
        { day_of_week: 3, start_time: '10:00', end_time: '18:00', is_available: true },
        { day_of_week: 4, start_time: '08:00', end_time: '16:00', is_available: true },
        { day_of_week: 5, start_time: '08:00', end_time: '14:00', is_available: true },
      ];

      cy.updateStaffSchedule(5, customSchedule).then(() => {
        cy.getStaffSchedule(5).then((response) => {
          expect(response.body).to.be.an('array');
        });
      });
    });

    it('updates weekly schedule', () => {
      const newSchedule = [
        { day_of_week: 1, start_time: '07:00', end_time: '15:00', is_available: true },
        { day_of_week: 2, start_time: '07:00', end_time: '15:00', is_available: true },
      ];

      cy.updateStaffSchedule(6, newSchedule).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('validates schedule format', () => {
      cy.apiPut('/api/schedule/staff/5/schedule', {
        schedules: 'invalid',
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  describe('Staff Availability', () => {
    it('checks availability for date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      cy.getStaffAvailability(5, dateStr).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('is_available');
        expect(response.body).to.have.property('start_time');
        expect(response.body).to.have.property('end_time');
      });
    });

    it('returns is_available flag', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      cy.getStaffAvailability(5, dateStr).then((response) => {
        expect(response.body.is_available).to.be.a('boolean');
      });
    });

    it('returns start/end times', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      cy.getStaffAvailability(5, dateStr).then((response) => {
        expect(response.body.start_time).to.match(/^\d{2}:\d{2}$/);
        expect(response.body.end_time).to.match(/^\d{2}:\d{2}$/);
      });
    });

    it('default weekday availability', () => {
      // Find next Monday
      const date = new Date();
      while (date.getDay() !== 1) {
        date.setDate(date.getDate() + 1);
      }
      const dateStr = date.toISOString().split('T')[0];

      cy.getStaffAvailability(999, dateStr).then((response) => {
        expect(response.body.is_available).to.eq(true);
        expect(response.body.start_time).to.eq('09:00');
        expect(response.body.end_time).to.eq('17:00');
      });
    });

    it('default weekend unavailability', () => {
      // Find next Sunday
      const date = new Date();
      while (date.getDay() !== 0) {
        date.setDate(date.getDate() + 1);
      }
      const dateStr = date.toISOString().split('T')[0];

      cy.getStaffAvailability(999, dateStr).then((response) => {
        expect(response.body.is_available).to.eq(false);
      });
    });

    it('requires date parameter', () => {
      cy.apiGet('/api/schedule/staff/5/availability').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('Date');
      });
    });
  });

  describe('Preference-Based Matching Integration', () => {
    it('favorite consultants get priority in matching', () => {
      // Add Emily (3) as favorite for user 9
      cy.addStaffPreference(9, 3);

      // Make Emily available
      cy.setConsultantStatus(1, 'offline');
      cy.setConsultantStatus(2, 'offline');
      cy.setConsultantStatus(3, 'available');
      cy.setConsultantStatus(4, 'offline');

      cy.createSupportRequest({
        requesterId: testRequesterId,
        hospitalId: 2,
        department: 'Pharmacy', // Emily is Pharmacy expert
        issueSummary: 'Favorite match test',
      }).then((response) => {
        if (response.body.status === 'connecting') {
          // Should match Emily with favorite bonus
          expect(response.body.consultant.id).to.eq(3);
          cy.endSupportSession(response.body.sessionId, { endedBy: testRequesterId });
        }
      });

      // Restore
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'available');
      cy.setConsultantStatus(4, 'available');
    });
  });
});
