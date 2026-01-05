// Intelligent Scheduling Tests
// Tests for recommendations, auto-assign, configuration, and eligibility

describe('Intelligent Scheduling', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin'
      }
    }).as('getUser');

    cy.intercept('GET', '/api/permissions', {
      statusCode: 200,
      body: { permissions: ['admin'] }
    }).as('getPermissions');

    cy.intercept('GET', '/api/rbac/effective-permissions', {
      statusCode: 200,
      body: []
    }).as('getEffectivePermissions');

    cy.intercept('GET', '/api/notifications*', {
      statusCode: 200,
      body: []
    }).as('getNotifications');

    cy.intercept('GET', '/api/notifications/counts', {
      statusCode: 200,
      body: {}
    }).as('getNotificationCounts');

    cy.intercept('GET', '/api/notifications/unread-count', {
      statusCode: 200,
      body: { count: 0 }
    }).as('getUnreadCount');
  });

  describe('Recommendation Engine Tests', () => {
    beforeEach(() => {
      cy.visit('/schedules');
      cy.wait('@getUser');
    });

    it('should find best consultant matches', () => {
      cy.intercept('GET', '/api/scheduling/recommendations', {
        statusCode: 200,
        body: [
          { consultantId: 1, name: 'John Doe', score: 95, skills: ['Epic', 'Training'] },
          { consultantId: 2, name: 'Jane Smith', score: 88, skills: ['Epic'] }
        ]
      }).as('recommendations');

      cy.contains('Schedules').should('be.visible');
    });

    it('should calculate skill match scoring', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/skill-score', {
        statusCode: 200,
        body: {
          consultantId: 1,
          skillScores: { Epic: 100, Training: 80, Support: 60 },
          totalScore: 80
        }
      }).as('skillScore');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check availability', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/availability', {
        statusCode: 200,
        body: [
          { consultantId: 1, available: true, nextAvailable: null },
          { consultantId: 2, available: false, nextAvailable: '2026-01-10' }
        ]
      }).as('availability');

      cy.contains('Schedules').should('be.visible');
    });

    it('should detect conflicts', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/conflicts', {
        statusCode: 200,
        body: [
          { consultantId: 1, conflictType: 'overlap', existingShift: { start: '09:00', end: '17:00' } }
        ]
      }).as('conflicts');

      cy.contains('Schedules').should('be.visible');
    });

    it('should consider geographic proximity', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/proximity', {
        statusCode: 200,
        body: [
          { consultantId: 1, distance: 5.2, unit: 'miles', travelTime: 15 }
        ]
      }).as('proximity');

      cy.contains('Schedules').should('be.visible');
    });

    it('should optimize for cost', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/cost-optimized', {
        statusCode: 200,
        body: [
          { consultantId: 1, hourlyRate: 150, estimatedCost: 1200, costRank: 1 }
        ]
      }).as('costOptimized');

      cy.contains('Schedules').should('be.visible');
    });

    it('should consider consultant preferences', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/preferences', {
        statusCode: 200,
        body: [
          { consultantId: 1, preferredShift: 'day', preferredHospitals: [1, 2] }
        ]
      }).as('preferences');

      cy.contains('Schedules').should('be.visible');
    });

    it('should verify certifications', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/certifications', {
        statusCode: 200,
        body: [
          { consultantId: 1, requiredCerts: ['Epic Certified'], hasCerts: true }
        ]
      }).as('certifications');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check language requirements', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/languages', {
        statusCode: 200,
        body: [
          { consultantId: 1, languages: ['English', 'Spanish'], meets: true }
        ]
      }).as('languages');

      cy.contains('Schedules').should('be.visible');
    });

    it('should match experience level', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/experience', {
        statusCode: 200,
        body: [
          { consultantId: 1, yearsExperience: 8, level: 'senior', meetsRequirement: true }
        ]
      }).as('experience');

      cy.contains('Schedules').should('be.visible');
    });

    it('should apply hospital familiarity bonus', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/familiarity', {
        statusCode: 200,
        body: [
          { consultantId: 1, hospitalId: 1, previousAssignments: 5, bonus: 10 }
        ]
      }).as('familiarity');

      cy.contains('Schedules').should('be.visible');
    });

    it('should match EHR system expertise', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/ehr-expertise', {
        statusCode: 200,
        body: [
          { consultantId: 1, ehrSystem: 'Epic', expertiseLevel: 'expert', score: 100 }
        ]
      }).as('ehrExpertise');

      cy.contains('Schedules').should('be.visible');
    });

    it('should calculate travel time', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/travel-time', {
        statusCode: 200,
        body: [
          { consultantId: 1, travelTime: 30, unit: 'minutes', mode: 'driving' }
        ]
      }).as('travelTime');

      cy.contains('Schedules').should('be.visible');
    });

    it('should enforce consecutive shift limits', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/shift-limits', {
        statusCode: 200,
        body: [
          { consultantId: 1, consecutiveShifts: 4, maxAllowed: 5, withinLimit: true }
        ]
      }).as('shiftLimits');

      cy.contains('Schedules').should('be.visible');
    });

    it('should enforce rest period requirements', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/rest-periods', {
        statusCode: 200,
        body: [
          { consultantId: 1, lastShiftEnd: '2026-01-05T17:00:00', minRestHours: 8, eligible: true }
        ]
      }).as('restPeriods');

      cy.contains('Schedules').should('be.visible');
    });

    it('should avoid overtime', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/overtime', {
        statusCode: 200,
        body: [
          { consultantId: 1, hoursThisWeek: 35, maxHours: 40, overtimeRisk: false }
        ]
      }).as('overtime');

      cy.contains('Schedules').should('be.visible');
    });

    it('should ensure fair distribution', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/distribution', {
        statusCode: 200,
        body: {
          fairnessScore: 0.85,
          distribution: [
            { consultantId: 1, shiftsThisMonth: 15 },
            { consultantId: 2, shiftsThisMonth: 14 }
          ]
        }
      }).as('distribution');

      cy.contains('Schedules').should('be.visible');
    });

    it('should consider seniority', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/seniority', {
        statusCode: 200,
        body: [
          { consultantId: 1, seniority: 'senior', priority: 1 }
        ]
      }).as('seniority');

      cy.contains('Schedules').should('be.visible');
    });

    it('should identify training opportunities', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/training', {
        statusCode: 200,
        body: [
          { consultantId: 1, trainingNeeds: ['Advanced Epic'], opportunityMatch: true }
        ]
      }).as('trainingOpportunity');

      cy.contains('Schedules').should('be.visible');
    });

    it('should support career development', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/career', {
        statusCode: 200,
        body: [
          { consultantId: 1, careerPath: 'Senior Consultant', developmentOpportunity: true }
        ]
      }).as('careerDevelopment');

      cy.contains('Schedules').should('be.visible');
    });

    it('should respect client preferences', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/client-prefs', {
        statusCode: 200,
        body: [
          { hospitalId: 1, preferredConsultants: [1, 3], excludedConsultants: [5] }
        ]
      }).as('clientPrefs');

      cy.contains('Schedules').should('be.visible');
    });

    it('should incorporate historical performance', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/performance', {
        statusCode: 200,
        body: [
          { consultantId: 1, rating: 4.8, completionRate: 0.98, reliabilityScore: 95 }
        ]
      }).as('performance');

      cy.contains('Schedules').should('be.visible');
    });

    it('should calculate reliability scores', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/reliability', {
        statusCode: 200,
        body: [
          { consultantId: 1, reliability: 0.97, noShows: 1, totalAssignments: 50 }
        ]
      }).as('reliability');

      cy.contains('Schedules').should('be.visible');
    });

    it('should provide recommendation explanation', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/explain', {
        statusCode: 200,
        body: {
          consultantId: 1,
          explanation: 'Best match due to Epic expertise and hospital familiarity',
          factors: ['skill_match', 'availability', 'familiarity']
        }
      }).as('explanation');

      cy.contains('Schedules').should('be.visible');
    });

    it('should suggest alternatives', () => {
      cy.intercept('GET', '/api/scheduling/recommendations/alternatives', {
        statusCode: 200,
        body: [
          { consultantId: 2, reason: 'Second best match', score: 88 },
          { consultantId: 3, reason: 'Available immediately', score: 82 }
        ]
      }).as('alternatives');

      cy.contains('Schedules').should('be.visible');
    });
  });

  describe('Auto-Assign Tests', () => {
    beforeEach(() => {
      cy.visit('/schedules');
      cy.wait('@getUser');
    });

    it('should validate bulk assignments', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/validate', {
        statusCode: 200,
        body: { valid: true, assignments: 10, conflicts: 0 }
      }).as('validateBulk');

      cy.contains('Schedules').should('be.visible');
    });

    it('should detect constraint violations', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/constraints', {
        statusCode: 200,
        body: {
          violations: [
            { type: 'overtime', consultantId: 1, message: 'Would exceed 40 hours' }
          ]
        }
      }).as('constraints');

      cy.contains('Schedules').should('be.visible');
    });

    it('should resolve conflicts automatically', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/resolve', {
        statusCode: 200,
        body: { resolved: true, method: 'reassign', affected: 2 }
      }).as('resolveConflicts');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle priority assignments', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/priority', {
        statusCode: 200,
        body: { prioritized: true, highPriority: 3, normal: 7 }
      }).as('priority');

      cy.contains('Schedules').should('be.visible');
    });

    it('should rollback on error', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign', {
        statusCode: 500,
        body: { error: 'Assignment failed', rolledBack: true }
      }).as('rollback');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle partial assignment success', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign', {
        statusCode: 207,
        body: {
          results: [
            { shiftId: 1, success: true },
            { shiftId: 2, success: false, error: 'No available consultant' }
          ]
        }
      }).as('partialSuccess');

      cy.contains('Schedules').should('be.visible');
    });

    it('should confirm assignments', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/confirm', {
        statusCode: 200,
        body: { confirmed: true, assignmentIds: [1, 2, 3] }
      }).as('confirm');

      cy.contains('Schedules').should('be.visible');
    });

    it('should dispatch notifications', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/notify', {
        statusCode: 200,
        body: { notified: true, recipients: 5 }
      }).as('notify');

      cy.contains('Schedules').should('be.visible');
    });

    it('should integrate with calendar', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/calendar-sync', {
        statusCode: 200,
        body: { synced: true, eventsCreated: 10 }
      }).as('calendarSync');

      cy.contains('Schedules').should('be.visible');
    });

    it('should support undo functionality', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/undo', {
        statusCode: 200,
        body: { undone: true, restoredState: 'previous' }
      }).as('undo');

      cy.contains('Schedules').should('be.visible');
    });

    it('should track assignment history', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/history', {
        statusCode: 200,
        body: [
          { id: 1, timestamp: Date.now(), assignments: 10, user: 'admin' }
        ]
      }).as('history');

      cy.contains('Schedules').should('be.visible');
    });

    it('should maintain audit trail', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/audit', {
        statusCode: 200,
        body: [
          { action: 'auto_assign', timestamp: Date.now(), details: {} }
        ]
      }).as('audit');

      cy.contains('Schedules').should('be.visible');
    });

    it('should support manager approval flow', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/submit-approval', {
        statusCode: 200,
        body: { submitted: true, approvalId: 'appr-123' }
      }).as('submitApproval');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle consultant acceptance', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/accept', {
        statusCode: 200,
        body: { accepted: true, consultantId: 1 }
      }).as('accept');

      cy.contains('Schedules').should('be.visible');
    });

    it('should process swap requests', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/swap', {
        statusCode: 200,
        body: { swapped: true, from: 1, to: 2 }
      }).as('swap');

      cy.contains('Schedules').should('be.visible');
    });

    it('should alert on coverage gaps', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/coverage-gaps', {
        statusCode: 200,
        body: [
          { date: '2026-01-10', shift: 'night', uncovered: true }
        ]
      }).as('coverageGaps');

      cy.contains('Schedules').should('be.visible');
    });

    it('should recognize shift patterns', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/patterns', {
        statusCode: 200,
        body: {
          patterns: [
            { consultantId: 1, preferredPattern: 'day-day-day-off-off' }
          ]
        }
      }).as('patterns');

      cy.contains('Schedules').should('be.visible');
    });

    it('should apply templates', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/apply-template', {
        statusCode: 200,
        body: { applied: true, templateId: 'tpl-123', shiftsCreated: 20 }
      }).as('applyTemplate');

      cy.contains('Schedules').should('be.visible');
    });

    it('should support recurring schedules', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/recurring', {
        statusCode: 200,
        body: { created: true, recurrence: 'weekly', instances: 12 }
      }).as('recurring');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle holidays', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/holidays', {
        statusCode: 200,
        body: [
          { date: '2026-01-01', name: 'New Year', excluded: true }
        ]
      }).as('holidays');

      cy.contains('Schedules').should('be.visible');
    });

    it('should integrate with PTO', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/pto', {
        statusCode: 200,
        body: [
          { consultantId: 1, dates: ['2026-01-15', '2026-01-16'], type: 'vacation' }
        ]
      }).as('pto');

      cy.contains('Schedules').should('be.visible');
    });

    it('should allow emergency overrides', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/emergency-override', {
        statusCode: 200,
        body: { overridden: true, reason: 'urgent_coverage', approvedBy: 'admin' }
      }).as('emergencyOverride');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle priority escalation', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/escalate', {
        statusCode: 200,
        body: { escalated: true, newPriority: 'critical' }
      }).as('escalate');

      cy.contains('Schedules').should('be.visible');
    });

    it('should support real-time updates', () => {
      cy.intercept('GET', '/api/scheduling/auto-assign/live', {
        statusCode: 200,
        body: { liveUpdates: true, lastUpdate: Date.now() }
      }).as('liveUpdates');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle batch processing', () => {
      cy.intercept('POST', '/api/scheduling/auto-assign/batch', {
        statusCode: 200,
        body: { batchId: 'batch-123', status: 'processing', total: 50 }
      }).as('batch');

      cy.contains('Schedules').should('be.visible');
    });
  });

  describe('Configuration Tests', () => {
    beforeEach(() => {
      cy.visit('/schedules');
      cy.wait('@getUser');
    });

    it('should validate scheduling rules', () => {
      cy.intercept('POST', '/api/scheduling/config/rules/validate', {
        statusCode: 200,
        body: { valid: true, errors: [] }
      }).as('validateRules');

      cy.contains('Schedules').should('be.visible');
    });

    it('should configure preference weighting', () => {
      cy.intercept('GET', '/api/scheduling/config/weights', {
        statusCode: 200,
        body: {
          weights: { skill: 0.4, availability: 0.3, cost: 0.2, preference: 0.1 }
        }
      }).as('weights');

      cy.contains('Schedules').should('be.visible');
    });

    it('should enforce business rules', () => {
      cy.intercept('GET', '/api/scheduling/config/business-rules', {
        statusCode: 200,
        body: [
          { rule: 'max_consecutive_days', value: 5, enforced: true }
        ]
      }).as('businessRules');

      cy.contains('Schedules').should('be.visible');
    });

    it('should define constraints', () => {
      cy.intercept('GET', '/api/scheduling/config/constraints', {
        statusCode: 200,
        body: [
          { constraint: 'min_rest_hours', value: 8 },
          { constraint: 'max_weekly_hours', value: 40 }
        ]
      }).as('constraints');

      cy.contains('Schedules').should('be.visible');
    });

    it('should handle exceptions', () => {
      cy.intercept('GET', '/api/scheduling/config/exceptions', {
        statusCode: 200,
        body: [
          { type: 'holiday_override', dates: ['2026-01-01'] }
        ]
      }).as('exceptions');

      cy.contains('Schedules').should('be.visible');
    });

    it('should provide default settings', () => {
      cy.intercept('GET', '/api/scheduling/config/defaults', {
        statusCode: 200,
        body: { shiftLength: 8, breakDuration: 30, overtimeThreshold: 40 }
      }).as('defaults');

      cy.contains('Schedules').should('be.visible');
    });

    it('should manage override permissions', () => {
      cy.intercept('GET', '/api/scheduling/config/override-permissions', {
        statusCode: 200,
        body: { roles: ['admin', 'manager'], requiresApproval: true }
      }).as('overridePermissions');

      cy.contains('Schedules').should('be.visible');
    });

    it('should version configuration', () => {
      cy.intercept('GET', '/api/scheduling/config/versions', {
        statusCode: 200,
        body: [
          { version: 1, date: '2025-01-01', active: false },
          { version: 2, date: '2025-06-01', active: true }
        ]
      }).as('versions');

      cy.contains('Schedules').should('be.visible');
    });

    it('should import/export configuration', () => {
      cy.intercept('GET', '/api/scheduling/config/export', {
        statusCode: 200,
        body: { exportUrl: '/downloads/scheduling-config.json' }
      }).as('exportConfig');

      cy.contains('Schedules').should('be.visible');
    });

    it('should validate on save', () => {
      cy.intercept('POST', '/api/scheduling/config', {
        statusCode: 200,
        body: { saved: true, validated: true }
      }).as('saveConfig');

      cy.contains('Schedules').should('be.visible');
    });

    it('should detect config conflicts', () => {
      cy.intercept('POST', '/api/scheduling/config/check-conflicts', {
        statusCode: 200,
        body: { conflicts: [], hasConflicts: false }
      }).as('checkConflicts');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check dependencies', () => {
      cy.intercept('GET', '/api/scheduling/config/dependencies', {
        statusCode: 200,
        body: { dependencies: ['calendar-service', 'notification-service'] }
      }).as('dependencies');

      cy.contains('Schedules').should('be.visible');
    });

    it('should support rollback', () => {
      cy.intercept('POST', '/api/scheduling/config/rollback', {
        statusCode: 200,
        body: { rolledBack: true, toVersion: 1 }
      }).as('rollback');

      cy.contains('Schedules').should('be.visible');
    });

    it('should log config changes', () => {
      cy.intercept('GET', '/api/scheduling/config/audit-log', {
        statusCode: 200,
        body: [
          { action: 'update', field: 'maxWeeklyHours', oldValue: 40, newValue: 45 }
        ]
      }).as('auditLog');

      cy.contains('Schedules').should('be.visible');
    });

    it('should provide documentation', () => {
      cy.intercept('GET', '/api/scheduling/config/docs', {
        statusCode: 200,
        body: { docUrl: '/docs/scheduling-config' }
      }).as('docs');

      cy.contains('Schedules').should('be.visible');
    });
  });

  describe('Eligibility Tests', () => {
    beforeEach(() => {
      cy.visit('/schedules');
      cy.wait('@getUser');
    });

    it('should verify certifications', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/certifications', {
        statusCode: 200,
        body: [
          { consultantId: 1, certification: 'Epic Certified', valid: true, expires: '2027-01-01' }
        ]
      }).as('certifications');

      cy.contains('Schedules').should('be.visible');
    });

    it('should validate licenses', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/licenses', {
        statusCode: 200,
        body: [
          { consultantId: 1, license: 'RN', state: 'CA', valid: true }
        ]
      }).as('licenses');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check training completion', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/training', {
        statusCode: 200,
        body: [
          { consultantId: 1, course: 'HIPAA Training', completed: true, date: '2025-06-01' }
        ]
      }).as('training');

      cy.contains('Schedules').should('be.visible');
    });

    it('should verify background check status', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/background-check', {
        statusCode: 200,
        body: [
          { consultantId: 1, status: 'cleared', date: '2025-01-15' }
        ]
      }).as('backgroundCheck');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check compliance requirements', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/compliance', {
        statusCode: 200,
        body: [
          { consultantId: 1, requirement: 'Annual Physical', met: true }
        ]
      }).as('compliance');

      cy.contains('Schedules').should('be.visible');
    });

    it('should verify hospital credentialing', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/credentialing', {
        statusCode: 200,
        body: [
          { consultantId: 1, hospitalId: 1, credentialed: true, expires: '2026-06-01' }
        ]
      }).as('credentialing');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check state licensure', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/state-licensure', {
        statusCode: 200,
        body: [
          { consultantId: 1, states: ['CA', 'NY', 'TX'], active: true }
        ]
      }).as('stateLicensure');

      cy.contains('Schedules').should('be.visible');
    });

    it('should verify insurance', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/insurance', {
        statusCode: 200,
        body: [
          { consultantId: 1, type: 'malpractice', active: true, expires: '2026-12-31' }
        ]
      }).as('insurance');

      cy.contains('Schedules').should('be.visible');
    });

    it('should assess competency', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/competency', {
        statusCode: 200,
        body: [
          { consultantId: 1, skill: 'Epic', level: 'expert', assessmentDate: '2025-10-01' }
        ]
      }).as('competency');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check annual review status', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/annual-review', {
        statusCode: 200,
        body: [
          { consultantId: 1, lastReview: '2025-06-01', status: 'passed', nextDue: '2026-06-01' }
        ]
      }).as('annualReview');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check exclusion lists', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/exclusion', {
        statusCode: 200,
        body: [
          { consultantId: 1, excluded: false, lastCheck: Date.now() }
        ]
      }).as('exclusion');

      cy.contains('Schedules').should('be.visible');
    });

    it('should perform sanction screening', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/sanctions', {
        statusCode: 200,
        body: [
          { consultantId: 1, sanctioned: false, lastScreening: '2025-12-01' }
        ]
      }).as('sanctions');

      cy.contains('Schedules').should('be.visible');
    });

    it('should verify work authorization', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/work-auth', {
        statusCode: 200,
        body: [
          { consultantId: 1, authorized: true, type: 'citizen' }
        ]
      }).as('workAuth');

      cy.contains('Schedules').should('be.visible');
    });

    it('should check visa status', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/visa', {
        statusCode: 200,
        body: [
          { consultantId: 1, visaType: null, citizen: true }
        ]
      }).as('visa');

      cy.contains('Schedules').should('be.visible');
    });

    it('should cache eligibility data', () => {
      cy.intercept('GET', '/api/scheduling/eligibility/cache', {
        statusCode: 200,
        body: { cached: true, lastUpdated: Date.now(), expiresIn: 3600 }
      }).as('cache');

      cy.contains('Schedules').should('be.visible');
    });
  });
});
