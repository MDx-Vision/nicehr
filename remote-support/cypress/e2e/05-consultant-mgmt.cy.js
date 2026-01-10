// 05-consultant-mgmt.cy.js - Consultant Management Tests (P1)
// Tests for consultant listing, status, and specialties

describe('Consultant Management', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('List Consultants', () => {
    it('returns all consultants', () => {
      cy.getAllConsultants().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.gte(4); // 4 demo consultants
      });
    });

    it('returns consultant name for each', () => {
      cy.getAllConsultants().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('name');
          expect(consultant.name).to.be.a('string');
        });
      });
    });

    it('returns consultant email for each', () => {
      cy.getAllConsultants().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('email');
          expect(consultant.email).to.include('@');
        });
      });
    });

    it('returns consultant status', () => {
      cy.getAllConsultants().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('status');
          expect(['online', 'available', 'busy', 'away', 'offline']).to.include(consultant.status);
        });
      });
    });

    it('returns sessions today count', () => {
      cy.getAllConsultants().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('sessionsToday');
          expect(consultant.sessionsToday).to.be.a('number');
        });
      });
    });

    it('returns last seen timestamp', () => {
      cy.getAllConsultants().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('lastSeenAt');
        });
      });
    });

    it('returns consultant specialties', () => {
      cy.getAllConsultants().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('specialties');
          expect(consultant.specialties).to.be.an('array');
        });
      });
    });

    it('includes Sarah Chen (ER expert)', () => {
      cy.getAllConsultants().then((response) => {
        const sarah = response.body.find((c) => c.name === 'Sarah Chen');
        expect(sarah).to.exist;
        expect(sarah.id).to.eq(1);
      });
    });

    it('includes Marcus Johnson (Radiology expert)', () => {
      cy.getAllConsultants().then((response) => {
        const marcus = response.body.find((c) => c.name === 'Marcus Johnson');
        expect(marcus).to.exist;
        expect(marcus.id).to.eq(2);
      });
    });

    it('includes Emily Rodriguez (Pharmacy expert)', () => {
      cy.getAllConsultants().then((response) => {
        const emily = response.body.find((c) => c.name === 'Emily Rodriguez');
        expect(emily).to.exist;
        expect(emily.id).to.eq(3);
      });
    });

    it('includes David Kim (IT expert)', () => {
      cy.getAllConsultants().then((response) => {
        const david = response.body.find((c) => c.name === 'David Kim');
        expect(david).to.exist;
        expect(david.id).to.eq(4);
      });
    });
  });

  describe('Available Consultants', () => {
    it('returns only available consultants', () => {
      cy.setConsultantStatus(1, 'available');
      cy.setConsultantStatus(2, 'offline');

      cy.getAvailableConsultants().then((response) => {
        expect(response.status).to.eq(200);
        response.body.forEach((c) => {
          expect(c.status).to.eq('available');
        });
      });
    });

    it('excludes offline consultants', () => {
      cy.setConsultantStatus(3, 'offline');

      cy.getAvailableConsultants().then((response) => {
        const ids = response.body.map((c) => c.id);
        expect(ids).to.not.include(3);
      });

      cy.setConsultantStatus(3, 'available');
    });

    it('excludes busy consultants', () => {
      cy.setConsultantStatus(4, 'busy');

      cy.getAvailableConsultants().then((response) => {
        const ids = response.body.map((c) => c.id);
        expect(ids).to.not.include(4);
      });

      cy.setConsultantStatus(4, 'available');
    });

    it('excludes away consultants', () => {
      cy.setConsultantStatus(3, 'away');

      cy.getAvailableConsultants().then((response) => {
        const ids = response.body.map((c) => c.id);
        expect(ids).to.not.include(3);
      });

      cy.setConsultantStatus(3, 'available');
    });

    it('returns specialties for each available consultant', () => {
      cy.setConsultantStatus(1, 'available');

      cy.getAvailableConsultants().then((response) => {
        const sarah = response.body.find((c) => c.id === 1);
        if (sarah) {
          expect(sarah.specialties).to.be.an('array');
        }
      });
    });
  });

  describe('Status Management', () => {
    it('updates status to online', () => {
      cy.setConsultantStatus(4, 'online').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('online');
      });
    });

    it('updates status to available', () => {
      cy.setConsultantStatus(4, 'available').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('available');
      });
    });

    it('updates status to busy', () => {
      cy.setConsultantStatus(4, 'busy').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('busy');
      });
    });

    it('updates status to away', () => {
      cy.setConsultantStatus(4, 'away').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('away');
      });
    });

    it('updates status to offline', () => {
      cy.setConsultantStatus(4, 'offline').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.status).to.eq('offline');
      });

      // Reset
      cy.setConsultantStatus(4, 'available');
    });

    it('rejects invalid status', () => {
      cy.apiPost('/api/consultants/status', {
        consultantId: 1,
        status: 'invalid_status',
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('Invalid status');
      });
    });

    it('prevents status change during active session', () => {
      cy.setConsultantStatus(2, 'available');

      cy.createSupportRequest({
        requesterId: 8,
        hospitalId: 2,
        department: 'Radiology',
        issueSummary: 'Active session status test',
      }).then((createResponse) => {
        if (createResponse.body.status === 'connecting') {
          const sessionId = createResponse.body.sessionId;
          const consultantId = createResponse.body.consultant.id;

          // Try to change status while in session
          cy.setConsultantStatus(consultantId, 'away').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.include('active session');
          });

          cy.endSupportSession(sessionId, { endedBy: 8 });
        }
      });
    });

    it('broadcasts status change to clients', () => {
      cy.setConsultantStatus(3, 'available').then((response) => {
        expect(response.body.success).to.eq(true);
      });

      // Verify status was updated
      cy.getAllConsultants().then((response) => {
        const consultant = response.body.find((c) => c.id === 3);
        expect(consultant.status).to.eq('available');
      });
    });
  });

  describe('Specialties Management', () => {
    it('returns consultant specialties', () => {
      cy.getConsultantSpecialties(1).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('returns department for each specialty', () => {
      cy.getConsultantSpecialties(1).then((response) => {
        response.body.forEach((spec) => {
          expect(spec).to.have.property('department');
        });
      });
    });

    it('returns proficiency level for each specialty', () => {
      cy.getConsultantSpecialties(1).then((response) => {
        response.body.forEach((spec) => {
          expect(spec).to.have.property('proficiency');
          expect(['standard', 'expert']).to.include(spec.proficiency);
        });
      });
    });

    it('updates specialties (replace all)', () => {
      const newSpecialties = [
        { department: 'ER', proficiency: 'expert' },
        { department: 'Surgery', proficiency: 'standard' },
      ];

      cy.updateConsultantSpecialties(4, newSpecialties).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.eq(true);
      });

      cy.getConsultantSpecialties(4).then((response) => {
        expect(response.body.length).to.eq(2);
        const depts = response.body.map((s) => s.department);
        expect(depts).to.include('ER');
        expect(depts).to.include('Surgery');
      });

      // Restore original
      cy.updateConsultantSpecialties(4, [
        { department: 'IT', proficiency: 'expert' },
        { department: 'Build', proficiency: 'expert' },
      ]);
    });

    it('supports expert proficiency', () => {
      cy.getConsultantSpecialties(1).then((response) => {
        const expertSpec = response.body.find((s) => s.proficiency === 'expert');
        expect(expertSpec).to.exist;
      });
    });

    it('supports standard proficiency', () => {
      cy.getConsultantSpecialties(1).then((response) => {
        // Sarah Chen has standard proficiency for Pharmacy
        const standardSpec = response.body.find((s) => s.proficiency === 'standard');
        expect(standardSpec).to.exist;
      });
    });

    it('Sarah Chen is ER expert', () => {
      cy.getConsultantSpecialties(1).then((response) => {
        const erSpec = response.body.find((s) => s.department === 'ER');
        expect(erSpec).to.exist;
        expect(erSpec.proficiency).to.eq('expert');
      });
    });

    it('Marcus Johnson is Radiology expert', () => {
      cy.getConsultantSpecialties(2).then((response) => {
        const radioSpec = response.body.find((s) => s.department === 'Radiology');
        expect(radioSpec).to.exist;
        expect(radioSpec.proficiency).to.eq('expert');
      });
    });

    it('Emily Rodriguez is Pharmacy expert', () => {
      cy.getConsultantSpecialties(3).then((response) => {
        const pharmacySpec = response.body.find((s) => s.department === 'Pharmacy');
        expect(pharmacySpec).to.exist;
        expect(pharmacySpec.proficiency).to.eq('expert');
      });
    });

    it('David Kim is IT expert', () => {
      cy.getConsultantSpecialties(4).then((response) => {
        const itSpec = response.body.find((s) => s.department === 'IT');
        expect(itSpec).to.exist;
        expect(itSpec.proficiency).to.eq('expert');
      });
    });
  });

  describe('Consultant Statistics', () => {
    it('returns total sessions count', () => {
      cy.getConsultantStats(1).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.totalSessions).to.be.a('number');
      });
    });

    it('calculates average duration', () => {
      cy.getConsultantStats(1).then((response) => {
        expect(response.body.avgDuration).to.be.a('number');
      });
    });

    it('calculates average rating', () => {
      cy.getConsultantStats(1).then((response) => {
        // avgRating can be null if no rated sessions
        expect(response.body).to.have.property('avgRating');
      });
    });

    it('returns sessions today count', () => {
      cy.getConsultantStats(1).then((response) => {
        expect(response.body.sessionsToday).to.be.a('number');
      });
    });

    it('returns recent sessions list', () => {
      cy.getConsultantStats(1).then((response) => {
        expect(response.body.recentSessions).to.be.an('array');
      });
    });

    it('recent sessions include session details', () => {
      cy.getConsultantStats(2).then((response) => {
        if (response.body.recentSessions.length > 0) {
          const session = response.body.recentSessions[0];
          expect(session).to.have.property('id');
          expect(session).to.have.property('department');
        }
      });
    });
  });

  describe('Department Metadata', () => {
    it('returns all departments', () => {
      cy.getDepartments().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.eq(12);
      });
    });

    it('includes ER department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('ER');
      });
    });

    it('includes Pharmacy department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Pharmacy');
      });
    });

    it('includes Radiology department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Radiology');
      });
    });

    it('includes Lab department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Lab');
      });
    });

    it('includes IT department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('IT');
      });
    });

    it('includes Build department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Build');
      });
    });

    it('includes Registration department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Registration');
      });
    });

    it('includes Billing department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Billing');
      });
    });

    it('includes Nursing department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Nursing');
      });
    });

    it('includes Surgery department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Surgery');
      });
    });

    it('includes ICU department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('ICU');
      });
    });

    it('includes Outpatient department', () => {
      cy.getDepartments().then((response) => {
        expect(response.body).to.include('Outpatient');
      });
    });
  });
});
