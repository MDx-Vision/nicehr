/**
 * Phase 3 Drill-Down Tests
 * Tests for Executive Metrics and ROI Dashboard drill-downs
 */

describe('Phase 3 Drill-Down Tests', () => {
  const mockUser = {
    id: 'test-user',
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const mockProject = {
    id: 'p1',
    name: 'Test Project',
    hospitalId: 'h1',
    status: 'active',
    actualConsultants: 5,
    estimatedConsultants: 6,
    savings: '50000',
    startDate: '2026-01-01',
    endDate: '2026-06-30'
  };

  const mockSummary = {
    summary: {
      total: 10,
      achieved: 3,
      onTrack: 4,
      atRisk: 2,
      missed: 1,
      notStarted: 0
    },
    achievementRate: 30,
    progressRate: 70,
    metrics: [
      { id: 'm1', metricName: 'Revenue Growth', status: 'achieved', executiveRole: 'cfo', category: 'financial', targetValue: '100', targetUnit: '%', currentValue: '105' },
      { id: 'm2', metricName: 'User Adoption', status: 'on_track', executiveRole: 'cio', category: 'operational', targetValue: '95', targetUnit: '%', currentValue: '90' }
    ],
    endorsements: { total: 5, pending: 2, received: 2, published: 1 },
    sowCriteria: { total: 8, achieved: 5, pending: 3 },
    byRole: {}
  };

  describe('Executive Metrics - Summary Cards', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/user', { statusCode: 200, body: mockUser }).as('getUser');
      cy.intercept('GET', '/api/projects', { statusCode: 200, body: [mockProject] }).as('getProjects');
      cy.intercept('GET', '/api/executive-metrics/summary*', { statusCode: 200, body: mockSummary }).as('getSummary');

      cy.visit('/executive-metrics');
      cy.contains('Executive Success Metrics').should('be.visible');
      cy.get('button').contains('Select a project').click();
      cy.contains('Test Project').click();
      cy.get('[data-testid="card-total-metrics"]', { timeout: 10000 }).should('be.visible');
    });

    it('should click Total card and switch to metrics tab', () => {
      cy.get('[data-testid="card-total-metrics"]').click();
      cy.get('[data-testid="metrics-table"]').should('be.visible');
    });

    it('should click Achieved card and filter metrics', () => {
      cy.get('[data-testid="card-achieved-metrics"]').click();
      cy.contains('Filtered: Achieved').should('be.visible');
    });

    it('should click On Track card and filter metrics', () => {
      cy.get('[data-testid="card-ontrack-metrics"]').click();
      cy.contains('Filtered: On Track').should('be.visible');
    });

    it('should click At Risk card and filter metrics', () => {
      cy.get('[data-testid="card-atrisk-metrics"]').click();
      cy.contains('Filtered: At Risk').should('be.visible');
    });

    it('should click Missed card and filter metrics', () => {
      cy.get('[data-testid="card-missed-metrics"]').click();
      cy.contains('Filtered: Missed').should('be.visible');
    });

    it('should click Not Started card and filter metrics', () => {
      cy.get('[data-testid="card-notstarted-metrics"]').click();
      cy.contains('Filtered: Not Started').should('be.visible');
    });
  });

  describe('Executive Metrics - Progress Bars', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/user', { statusCode: 200, body: mockUser }).as('getUser');
      cy.intercept('GET', '/api/projects', { statusCode: 200, body: [mockProject] }).as('getProjects');
      cy.intercept('GET', '/api/executive-metrics/summary*', { statusCode: 200, body: mockSummary }).as('getSummary');

      cy.visit('/executive-metrics');
      cy.contains('Executive Success Metrics').should('be.visible');
      cy.get('button').contains('Select a project').click();
      cy.contains('Test Project').click();
      cy.get('[data-testid="card-total-metrics"]', { timeout: 10000 }).should('be.visible');
    });

    it('should click Achievement Rate progress and show contributing metrics', () => {
      cy.get('[data-testid="progress-achievement-rate"]').click();
      cy.get('[data-testid="dialog-contributing-metrics"]').should('be.visible');
      cy.contains('Achieved Metrics').should('be.visible');
    });

    it('should click Progress Rate and show contributing metrics', () => {
      cy.get('[data-testid="progress-rate"]').click();
      cy.get('[data-testid="dialog-contributing-metrics"]').should('be.visible');
      cy.contains('On Track & Achieved Metrics').should('be.visible');
    });
  });

  describe('ROI Dashboard - KPI Cards', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/user', { statusCode: 200, body: mockUser }).as('getUser');
      cy.intercept('GET', '/api/projects', { statusCode: 200, body: [mockProject] }).as('getProjects');
      cy.intercept('GET', '/api/hospitals', { statusCode: 200, body: [{ id: 'h1', name: 'Test Hospital' }] }).as('getHospitals');
      cy.intercept('GET', '/api/projects/p1/surveys', {
        statusCode: 200,
        body: [
          { id: 's1', projectId: 'p1', respondentId: 'r1', completedAt: '2026-01-15', isComplete: true },
          { id: 's2', projectId: 'p1', respondentId: 'r2', completedAt: null, isComplete: false }
        ]
      }).as('getSurveys');
      cy.intercept('GET', '/api/roi/questions', {
        statusCode: 200,
        body: [{ id: 'q1', question: 'How satisfied are you?', questionType: 'rating', category: 'satisfaction' }]
      }).as('getQuestions');
      cy.intercept('GET', '/api/consultants*', { statusCode: 200, body: [] }).as('getConsultants');

      cy.visit('/roi-dashboard');
      cy.get('[data-testid="text-roi-title"]').should('be.visible');
      cy.get('[data-testid="select-project"]').click();
      cy.contains('Test Project').click();
      cy.get('[data-testid="card-total-surveys"]', { timeout: 10000 }).should('be.visible');
    });

    it('should click Total Surveys card and show survey list', () => {
      cy.get('[data-testid="card-total-surveys"]').click();
      cy.get('[data-testid="dialog-survey-list"]').should('be.visible');
      cy.contains('All Surveys').should('be.visible');
    });

    it('should click Avg Score card and show completed surveys', () => {
      cy.get('[data-testid="card-avg-score"]').click();
      cy.get('[data-testid="dialog-survey-list"]').should('be.visible');
      cy.contains('Completed Surveys').should('be.visible');
    });

    it('should click Consultants card and navigate', () => {
      cy.get('[data-testid="card-consultants"]').click();
      cy.url().should('include', '/consultants');
    });

    it('should click Savings card and show breakdown', () => {
      cy.get('[data-testid="card-savings"]').click();
      cy.get('[data-testid="dialog-savings"]').should('be.visible');
      cy.contains('Savings Breakdown').should('be.visible');
      cy.contains('Efficiency Gains').should('be.visible');
    });
  });

  describe('ROI Dashboard - Lists', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/user', { statusCode: 200, body: mockUser }).as('getUser');
      cy.intercept('GET', '/api/projects', { statusCode: 200, body: [mockProject] }).as('getProjects');
      cy.intercept('GET', '/api/hospitals', { statusCode: 200, body: [{ id: 'h1', name: 'Test Hospital' }] }).as('getHospitals');
      cy.intercept('GET', '/api/projects/p1/surveys', {
        statusCode: 200,
        body: [{ id: 's1', projectId: 'p1', respondentId: 'r1', completedAt: '2026-01-15', isComplete: true, createdAt: '2026-01-10' }]
      }).as('getSurveys');
      cy.intercept('GET', '/api/roi/questions', {
        statusCode: 200,
        body: [{ id: 'q1', question: 'How satisfied are you with the implementation?', questionType: 'rating', category: 'satisfaction' }]
      }).as('getQuestions');

      cy.visit('/roi-dashboard');
      cy.get('[data-testid="text-roi-title"]').should('be.visible');
      cy.get('[data-testid="select-project"]').click();
      cy.contains('Test Project').click();
      cy.get('[data-testid="questions-list"]', { timeout: 10000 }).should('be.visible');
    });

    it('should click on question item and show question detail', () => {
      cy.get('[data-testid^="question-item-"]').first().click();
      cy.get('[data-testid="dialog-question-detail"]').should('be.visible');
      cy.get('[data-testid="question-detail-text"]').should('contain', 'How satisfied');
    });

    it('should click on survey item and show survey detail', () => {
      cy.get('[data-testid="surveys-list"]').should('be.visible');
      cy.get('[data-testid^="survey-item-"]').first().click();
      cy.get('[data-testid="dialog-survey-detail"]').should('be.visible');
      cy.contains('Survey Details').should('be.visible');
    });

    it('should click Project Overview card and navigate to projects', () => {
      cy.get('[data-testid="card-project-overview"]').click();
      cy.url().should('include', '/projects');
    });
  });
});
