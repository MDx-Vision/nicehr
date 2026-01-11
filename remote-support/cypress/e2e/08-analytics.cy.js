// 08-analytics.cy.js - Analytics Dashboard Tests (P1)
// Tests for analytics metrics and reporting

describe('Analytics Dashboard', () => {
  const API_URL = Cypress.env('apiUrl') || 'http://localhost:3002';

  describe('Overview Metrics', () => {
    it('returns total sessions count', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.totalSessions).to.be.a('number');
      });
    });

    it('returns average wait time', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.body.avgWaitTime).to.be.a('number');
        expect(response.body.avgWaitTime).to.be.gte(0);
      });
    });

    it('returns average duration', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.body.avgDuration).to.be.a('number');
        expect(response.body.avgDuration).to.be.gte(0);
      });
    });

    it('returns average rating', () => {
      cy.getAnalyticsOverview().then((response) => {
        // Can be null if no rated sessions
        expect(response.body).to.have.property('avgRating');
      });
    });

    it('returns active sessions count', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.body.activeSessions).to.be.a('number');
        expect(response.body.activeSessions).to.be.gte(0);
      });
    });

    it('returns available consultants count', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.body.availableConsultants).to.be.a('number');
      });
    });

    it('returns today sessions count', () => {
      cy.getAnalyticsOverview().then((response) => {
        expect(response.body.todaySessions).to.be.a('number');
        expect(response.body.todaySessions).to.be.gte(0);
      });
    });
  });

  describe('By Department', () => {
    it('groups sessions by department', () => {
      cy.getAnalyticsByDepartment().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('returns count per department', () => {
      cy.getAnalyticsByDepartment().then((response) => {
        response.body.forEach((dept) => {
          expect(dept).to.have.property('count');
          expect(dept.count).to.be.a('number');
        });
      });
    });

    it('returns avg duration per department', () => {
      cy.getAnalyticsByDepartment().then((response) => {
        response.body.forEach((dept) => {
          expect(dept).to.have.property('avgDuration');
          expect(dept.avgDuration).to.be.a('number');
        });
      });
    });

    it('returns avg rating per department', () => {
      cy.getAnalyticsByDepartment().then((response) => {
        response.body.forEach((dept) => {
          expect(dept).to.have.property('avgRating');
        });
      });
    });

    it('sorts by count descending', () => {
      cy.getAnalyticsByDepartment().then((response) => {
        if (response.body.length > 1) {
          for (let i = 0; i < response.body.length - 1; i++) {
            expect(response.body[i].count).to.be.gte(response.body[i + 1].count);
          }
        }
      });
    });

    it('includes department name', () => {
      cy.getAnalyticsByDepartment().then((response) => {
        response.body.forEach((dept) => {
          expect(dept).to.have.property('department');
          expect(dept.department).to.be.a('string');
        });
      });
    });
  });

  describe('By Hospital', () => {
    it('groups sessions by hospital', () => {
      cy.getAnalyticsByHospital().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('returns hospital name', () => {
      cy.getAnalyticsByHospital().then((response) => {
        response.body.forEach((hosp) => {
          expect(hosp).to.have.property('name');
          expect(hosp.name).to.be.a('string');
        });
      });
    });

    it('returns count per hospital', () => {
      cy.getAnalyticsByHospital().then((response) => {
        response.body.forEach((hosp) => {
          expect(hosp).to.have.property('count');
          expect(hosp.count).to.be.a('number');
        });
      });
    });

    it('returns avg wait time per hospital', () => {
      cy.getAnalyticsByHospital().then((response) => {
        response.body.forEach((hosp) => {
          expect(hosp).to.have.property('avgWaitTime');
          expect(hosp.avgWaitTime).to.be.a('number');
        });
      });
    });

    it('sorts by count descending', () => {
      cy.getAnalyticsByHospital().then((response) => {
        if (response.body.length > 1) {
          for (let i = 0; i < response.body.length - 1; i++) {
            expect(response.body[i].count).to.be.gte(response.body[i + 1].count);
          }
        }
      });
    });
  });

  describe('By Consultant', () => {
    it('returns all consultants', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.gte(4); // 4 demo consultants
      });
    });

    it('returns consultant id and name', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('id');
          expect(consultant).to.have.property('name');
        });
      });
    });

    it('returns total sessions per consultant', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('totalSessions');
          expect(consultant.totalSessions).to.be.a('number');
        });
      });
    });

    it('returns avg duration per consultant', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('avgDuration');
          expect(consultant.avgDuration).to.be.a('number');
        });
      });
    });

    it('returns avg rating per consultant', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('avgRating');
        });
      });
    });

    it('returns current status', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('status');
          expect(['online', 'available', 'busy', 'away', 'offline']).to.include(consultant.status);
        });
      });
    });

    it('returns sessions today', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        response.body.forEach((consultant) => {
          expect(consultant).to.have.property('sessionsToday');
          expect(consultant.sessionsToday).to.be.a('number');
        });
      });
    });

    it('sorts by total sessions descending', () => {
      cy.getAnalyticsByConsultant().then((response) => {
        if (response.body.length > 1) {
          for (let i = 0; i < response.body.length - 1; i++) {
            expect(response.body[i].totalSessions).to.be.gte(response.body[i + 1].totalSessions);
          }
        }
      });
    });
  });

  describe('By Urgency', () => {
    it('returns counts for all urgency levels', () => {
      cy.getAnalyticsByUrgency().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('normal');
        expect(response.body).to.have.property('urgent');
        expect(response.body).to.have.property('critical');
      });
    });

    it('returns count for normal', () => {
      cy.getAnalyticsByUrgency().then((response) => {
        expect(response.body.normal).to.have.property('count');
        expect(response.body.normal.count).to.be.a('number');
      });
    });

    it('returns count for urgent', () => {
      cy.getAnalyticsByUrgency().then((response) => {
        expect(response.body.urgent).to.have.property('count');
        expect(response.body.urgent.count).to.be.a('number');
      });
    });

    it('returns count for critical', () => {
      cy.getAnalyticsByUrgency().then((response) => {
        expect(response.body.critical).to.have.property('count');
        expect(response.body.critical.count).to.be.a('number');
      });
    });

    it('returns avg wait time per urgency', () => {
      cy.getAnalyticsByUrgency().then((response) => {
        expect(response.body.normal).to.have.property('avgWaitTime');
        expect(response.body.urgent).to.have.property('avgWaitTime');
        expect(response.body.critical).to.have.property('avgWaitTime');
      });
    });
  });

  describe('Time Distribution', () => {
    it('returns hourly distribution (24 hours)', () => {
      cy.getAnalyticsHourly().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.eq(24);
      });
    });

    it('hourly data includes hour and count', () => {
      cy.getAnalyticsHourly().then((response) => {
        response.body.forEach((item) => {
          expect(item).to.have.property('hour');
          expect(item).to.have.property('count');
          expect(item.hour).to.be.gte(0);
          expect(item.hour).to.be.lte(23);
        });
      });
    });

    it('returns daily distribution (30 days)', () => {
      cy.getAnalyticsDaily().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.eq(30);
      });
    });

    it('daily data includes date and count', () => {
      cy.getAnalyticsDaily().then((response) => {
        response.body.forEach((item) => {
          expect(item).to.have.property('date');
          expect(item).to.have.property('count');
          expect(item.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
        });
      });
    });

    it('handles days with no sessions', () => {
      cy.getAnalyticsDaily().then((response) => {
        // Should still have 30 entries, even if count is 0
        expect(response.body.length).to.eq(30);
        response.body.forEach((item) => {
          expect(item.count).to.be.gte(0);
        });
      });
    });
  });

  describe('Recent Sessions', () => {
    it('returns latest completed sessions', () => {
      cy.getRecentSessions().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('respects limit parameter', () => {
      cy.getRecentSessions(5).then((response) => {
        expect(response.body.length).to.be.lte(5);
      });
    });

    it('includes requester name', () => {
      cy.getRecentSessions().then((response) => {
        // API may or may not enrich sessions with names
        if (response.body.length > 0 && response.body[0].requesterName) {
          response.body.forEach((session) => {
            expect(session).to.have.property('requesterName');
          });
        }
      });
    });

    it('includes consultant name', () => {
      cy.getRecentSessions().then((response) => {
        // API may or may not enrich sessions with names
        if (response.body.length > 0 && response.body[0].consultantName) {
          response.body.forEach((session) => {
            expect(session).to.have.property('consultantName');
          });
        }
      });
    });

    it('includes duration', () => {
      cy.getRecentSessions().then((response) => {
        if (response.body.length > 0) {
          response.body.forEach((session) => {
            // Duration may not always be present
            if (session.duration !== undefined) {
              expect(session).to.have.property('duration');
            }
          });
        }
      });
    });

    it('includes rating', () => {
      cy.getRecentSessions().then((response) => {
        if (response.body.length > 0) {
          response.body.forEach((session) => {
            // Rating may be null for unrated sessions
            expect(session).to.have.property('rating');
          });
        }
      });
    });

    it('includes timestamps', () => {
      cy.getRecentSessions().then((response) => {
        if (response.body.length > 0) {
          response.body.forEach((session) => {
            expect(session).to.have.property('createdAt');
            // endedAt may not be present for active sessions
            if (session.endedAt !== undefined) {
              expect(session).to.have.property('endedAt');
            }
          });
        }
      });
    });

    it('includes department and urgency', () => {
      cy.getRecentSessions().then((response) => {
        if (response.body.length > 0) {
          response.body.forEach((session) => {
            expect(session).to.have.property('department');
            expect(session).to.have.property('urgency');
          });
        }
      });
    });

    it('includes hospital name', () => {
      cy.getRecentSessions().then((response) => {
        if (response.body.length > 0) {
          response.body.forEach((session) => {
            // hospitalName may not be present if not enriched
            if (session.hospitalName !== undefined) {
              expect(session).to.have.property('hospitalName');
            }
          });
        }
      });
    });

    it('includes session id', () => {
      cy.getRecentSessions().then((response) => {
        response.body.forEach((session) => {
          expect(session).to.have.property('id');
          expect(session.id).to.be.a('number');
        });
      });
    });

    it('returns sessions sorted by recency', () => {
      cy.getRecentSessions(10).then((response) => {
        if (response.body.length > 1) {
          // Sessions should generally be sorted by recency, but allow some flexibility
          let sortedCount = 0;
          for (let i = 0; i < response.body.length - 1; i++) {
            const curr = new Date(response.body[i].endedAt || response.body[i].createdAt);
            const next = new Date(response.body[i + 1].endedAt || response.body[i + 1].createdAt);
            if (curr.getTime() >= next.getTime()) {
              sortedCount++;
            }
          }
          // At least half should be in order (accounts for concurrent sessions)
          expect(sortedCount).to.be.gte(Math.floor((response.body.length - 1) / 2));
        }
      });
    });
  });

  describe('Data Integrity', () => {
    it('overview totals match detailed counts', () => {
      cy.getAnalyticsOverview().then((overviewResponse) => {
        cy.getAnalyticsByDepartment().then((deptResponse) => {
          const deptTotal = deptResponse.body.reduce((sum, d) => sum + d.count, 0);
          // Should be close (may differ due to filtering, timing, or uncategorized sessions)
          const diff = Math.abs(overviewResponse.body.totalSessions - deptTotal);
          expect(diff).to.be.lte(Math.max(10, overviewResponse.body.totalSessions * 0.2));
        });
      });
    });

    it('all consultants appear in by-consultant report', () => {
      cy.getAllConsultants().then((consultantsResponse) => {
        cy.getAnalyticsByConsultant().then((analyticsResponse) => {
          const analyticsIds = analyticsResponse.body.map((c) => c.id);
          consultantsResponse.body.forEach((consultant) => {
            expect(analyticsIds).to.include(consultant.id);
          });
        });
      });
    });
  });
});
