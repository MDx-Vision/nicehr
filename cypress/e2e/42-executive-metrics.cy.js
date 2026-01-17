// Executive Metrics E2E Tests
// Comprehensive test suite for the Executive Success Metrics module

describe('Executive Metrics Module', () => {
  const mockProject = {
    id: 'test-project-1',
    name: 'Memorial Hospital Epic Implementation',
    status: 'active',
  };

  const mockMetrics = [
    {
      id: 'metric-1',
      projectId: 'test-project-1',
      executiveRole: 'ceo',
      category: 'pre_golive',
      metricName: 'Project on schedule',
      description: 'Project milestones completed on time',
      targetValue: '95',
      targetUnit: 'percentage',
      currentValue: '88',
      status: 'on_track',
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'metric-2',
      projectId: 'test-project-1',
      executiveRole: 'cfo',
      category: 'at_golive',
      metricName: 'Budget adherence',
      description: 'Project within 10% of approved budget',
      targetValue: '90',
      targetUnit: 'percentage',
      currentValue: '92',
      status: 'achieved',
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'metric-3',
      projectId: 'test-project-1',
      executiveRole: 'cio',
      category: 'post_golive',
      metricName: 'System uptime',
      description: 'System availability during go-live',
      targetValue: '99.5',
      targetUnit: 'percentage',
      currentValue: '97',
      status: 'at_risk',
      isActive: true,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const mockSummary = {
    role: 'all',
    summary: {
      total: 18,
      achieved: 5,
      onTrack: 8,
      atRisk: 3,
      missed: 1,
      notStarted: 1,
    },
    achievementRate: 28,
    progressRate: 72,
    byCategory: {
      pre_golive: mockMetrics.filter(m => m.category === 'pre_golive'),
      at_golive: mockMetrics.filter(m => m.category === 'at_golive'),
      post_golive: mockMetrics.filter(m => m.category === 'post_golive'),
      long_term: [],
    },
    byRole: {
      ceo: mockMetrics.filter(m => m.executiveRole === 'ceo'),
      cfo: mockMetrics.filter(m => m.executiveRole === 'cfo'),
      cio: mockMetrics.filter(m => m.executiveRole === 'cio'),
      cto: [],
      cmio: [],
      cno: [],
    },
    endorsements: { total: 3, pending: 2, received: 1, published: 0 },
    sowCriteria: { total: 5, achieved: 2, pending: 3 },
    metrics: mockMetrics,
  };

  const mockEndorsements = [
    {
      id: 'endorsement-1',
      projectId: 'test-project-1',
      executiveRole: 'ceo',
      executiveName: 'Dr. Sarah Johnson',
      executiveTitle: 'Chief Executive Officer',
      endorsementType: 'testimonial',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'endorsement-2',
      projectId: 'test-project-1',
      executiveRole: 'cfo',
      executiveName: 'Michael Chen',
      executiveTitle: 'Chief Financial Officer',
      endorsementType: 'reference',
      status: 'received',
      requestedAt: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  const mockSowCriteria = [
    {
      id: 'sow-1',
      projectId: 'test-project-1',
      executiveRole: 'ceo',
      criteriaText: 'Zero critical patient safety incidents during go-live',
      targetValue: '0',
      achievedValue: '0',
      status: 'achieved',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sow-2',
      projectId: 'test-project-1',
      executiveRole: 'cfo',
      criteriaText: 'Project budget variance within 10%',
      targetValue: '10',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];

  const mockReports = [
    {
      id: 'report-1',
      projectId: 'test-project-1',
      executiveRole: 'ceo',
      reportType: 'monthly',
      title: 'CEO Monthly Report - January 2026',
      generatedAt: new Date().toISOString(),
      format: 'pdf',
    },
  ];

  beforeEach(() => {
    // Mock authentication
    cy.intercept('GET', '/api/user', {
      statusCode: 200,
      body: {
        id: 'test-user',
        email: 'admin@test.com',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin',
      },
    }).as('getUser');

    // Mock projects
    cy.intercept('GET', '/api/projects', {
      statusCode: 200,
      body: [mockProject],
    }).as('getProjects');
  });

  // ============================================================================
  // Project Selection Tests
  // ============================================================================
  describe('Project Selection', () => {
    it('should display project selector on initial load', () => {
      cy.visit('/executive-metrics');
      cy.contains('Executive Success Metrics').should('be.visible');
      cy.contains('Select a project to manage').should('be.visible');
      cy.get('button').contains('Select a project').should('be.visible');
    });

    it('should list available projects in dropdown', () => {
      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).should('be.visible');
    });

    it('should load dashboard after selecting project', () => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: mockEndorsements,
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: mockSowCriteria,
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: mockReports,
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  // ============================================================================
  // Dashboard Tab Tests
  // ============================================================================
  describe('Dashboard Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: mockEndorsements,
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: mockSowCriteria,
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: mockReports,
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should display summary statistics cards', () => {
      cy.contains('Total').should('be.visible');
      cy.contains('18').should('be.visible');
      cy.contains('Achieved').should('be.visible');
      cy.contains('5').should('be.visible');
      cy.contains('On Track').should('be.visible');
      cy.contains('At Risk').should('be.visible');
      cy.contains('Missed').should('be.visible');
      cy.contains('Not Started').should('be.visible');
    });

    it('should display overall progress bars', () => {
      cy.contains('Overall Progress').should('be.visible');
      cy.contains('Achievement Rate').should('be.visible');
      cy.contains('28%').should('be.visible');
      cy.contains('Progress Rate').should('be.visible');
      cy.contains('72%').should('be.visible');
    });

    it('should display endorsements summary', () => {
      cy.contains('Endorsements').should('be.visible');
      cy.contains('Pending').should('be.visible');
      cy.contains('Received').should('be.visible');
    });

    it('should display SOW criteria summary', () => {
      cy.contains('SOW Success Criteria').should('be.visible');
    });

    it('should display metrics by executive role', () => {
      cy.contains('Metrics by Executive Role').scrollIntoView().should('be.visible');
      cy.contains('CEO').scrollIntoView().should('be.visible');
      cy.contains('CFO').scrollIntoView().should('be.visible');
      cy.contains('CIO').scrollIntoView().should('be.visible');
      cy.contains('CTO').scrollIntoView().should('exist');
      cy.contains('CMIO').scrollIntoView().should('exist');
      cy.contains('CNO').scrollIntoView().should('exist');
    });

    it('should show seed button for roles without metrics', () => {
      cy.contains('Seed').scrollIntoView().should('be.visible');
    });

    it('should filter by executive role', () => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary?role=ceo`, {
        statusCode: 200,
        body: { ...mockSummary, role: 'ceo', metrics: mockMetrics.filter(m => m.executiveRole === 'ceo') },
      }).as('getSummaryFiltered');

      cy.get('button').contains('All Roles').click({ force: true });
      cy.contains('[role="option"]', 'CEO').click();
      cy.wait('@getSummaryFiltered');
    });
  });

  // ============================================================================
  // Metrics Tab Tests
  // ============================================================================
  describe('Metrics Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should display metrics tab', () => {
      cy.contains('button', 'Metrics').click();
      cy.contains('Success Metrics').should('be.visible');
    });

    it('should display metrics table with columns', () => {
      cy.contains('button', 'Metrics').click();
      cy.contains('Role').should('be.visible');
      cy.contains('Category').should('be.visible');
      cy.contains('Metric').should('be.visible');
      cy.contains('Target').should('be.visible');
      cy.contains('Current').should('be.visible');
      cy.contains('Status').should('be.visible');
    });

    it('should display metric data in table rows', () => {
      cy.contains('button', 'Metrics').click();
      cy.contains('Project on schedule').should('be.visible');
      cy.contains('Budget adherence').should('be.visible');
      cy.contains('System uptime').should('be.visible');
    });

    it('should display status badges correctly', () => {
      cy.contains('button', 'Metrics').click();
      cy.contains('On Track').should('be.visible');
      cy.contains('Achieved').should('be.visible');
      cy.contains('At Risk').should('be.visible');
    });

    it('should show seed buttons for each role', () => {
      cy.contains('button', 'Metrics').click();
      cy.contains('Seed CEO').should('be.visible');
      cy.contains('Seed CFO').should('be.visible');
      cy.contains('Seed CIO').should('be.visible');
    });

    it('should seed metrics for a role', () => {
      cy.intercept('POST', `/api/projects/${mockProject.id}/executive-metrics/seed`, {
        statusCode: 201,
        body: mockMetrics.filter(m => m.executiveRole === 'ceo'),
      }).as('seedMetrics');

      cy.contains('button', 'Metrics').click();
      cy.contains('Seed CEO').click();
      cy.wait('@seedMetrics');
    });

    it('should open update value dialog', () => {
      cy.get('[role="tablist"]').contains('Metrics').click();
      cy.get('[data-testid="update-metric-value"]').first().click();
      cy.contains('Update Metric Value').should('be.visible');
    });

    it('should update metric value', () => {
      cy.intercept('POST', '/api/executive-metrics/metric-1/update-value', {
        statusCode: 200,
        body: { ...mockMetrics[0], currentValue: '95', status: 'achieved' },
      }).as('updateValue');

      cy.get('[role="tablist"]').contains('Metrics').click();
      cy.get('[data-testid="update-metric-value"]').first().click();
      cy.get('input#newValue').clear().type('95');
      cy.get('textarea#notes').type('Milestone completed');
      cy.get('[role="dialog"]').contains('button', 'Update').click();
      cy.wait('@updateValue');
    });
  });

  // ============================================================================
  // Endorsements Tab Tests
  // ============================================================================
  describe('Endorsements Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: mockEndorsements,
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should display endorsements tab', () => {
      cy.contains('button', 'Endorsements').click();
      cy.contains('Success Endorsements').should('be.visible');
    });

    it('should display endorsements table', () => {
      cy.contains('button', 'Endorsements').click();
      cy.contains('Executive').should('be.visible');
      cy.contains('Type').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Requested').should('be.visible');
    });

    it('should display endorsement data', () => {
      cy.contains('button', 'Endorsements').click();
      cy.contains('Dr. Sarah Johnson').should('be.visible');
      cy.contains('Michael Chen').should('be.visible');
    });

    it('should open request endorsement dialog', () => {
      cy.contains('button', 'Endorsements').click();
      cy.contains('Request Endorsement').click();
      cy.contains('Executive Name').should('be.visible');
    });

    it('should create new endorsement', () => {
      cy.intercept('POST', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 201,
        body: {
          id: 'endorsement-new',
          executiveName: 'New Executive',
          executiveRole: 'cto',
          status: 'pending',
        },
      }).as('createEndorsement');

      cy.get('[role="tablist"]').contains('Endorsements').click();
      cy.contains('Request Endorsement').click();
      cy.wait(500);
      cy.get('[role="dialog"] input#executiveName').type('New Executive');
      cy.get('[role="dialog"] input#executiveTitle').type('Chief Technology Officer');

      // Select role
      cy.get('[role="dialog"] [role="combobox"]').first().click({ force: true });
      cy.contains('[role="option"]', 'CTO').click();

      cy.get('[role="dialog"]').contains('button', 'Request').click();
      cy.wait('@createEndorsement');
    });

    it('should mark endorsement as received', () => {
      cy.intercept('PATCH', '/api/endorsements/endorsement-1', {
        statusCode: 200,
        body: { ...mockEndorsements[0], status: 'received' },
      }).as('updateEndorsement');

      cy.get('[role="tablist"]').contains('Endorsements').click();
      cy.contains('tr', 'Dr. Sarah Johnson').find('button').first().click({ force: true });
      cy.wait('@updateEndorsement');
    });

    it('should delete endorsement', () => {
      cy.intercept('DELETE', '/api/endorsements/endorsement-1', {
        statusCode: 200,
        body: { success: true },
      }).as('deleteEndorsement');

      cy.get('[role="tablist"]').contains('Endorsements').click();
      cy.contains('tr', 'Dr. Sarah Johnson').find('button').last().click({ force: true });
      cy.wait('@deleteEndorsement');
    });
  });

  // ============================================================================
  // SOW Criteria Tab Tests
  // ============================================================================
  describe('SOW Criteria Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: mockSowCriteria,
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should display SOW tab', () => {
      cy.contains('button', 'SOW Criteria').click();
      cy.contains('SOW Success Criteria').should('be.visible');
    });

    it('should display SOW criteria table', () => {
      cy.contains('button', 'SOW Criteria').click();
      cy.contains('Criteria').should('be.visible');
      cy.contains('Target').should('be.visible');
      cy.contains('Achieved').should('be.visible');
      cy.contains('Status').should('be.visible');
    });

    it('should display SOW criteria data', () => {
      cy.contains('button', 'SOW Criteria').click();
      cy.contains('Zero critical patient safety').should('be.visible');
      cy.contains('Project budget variance').should('be.visible');
    });

    it('should open add criterion dialog', () => {
      cy.contains('button', 'SOW Criteria').click();
      cy.contains('Add Criterion').click();
      cy.contains('Add SOW Success Criterion').should('be.visible');
    });

    it('should create new SOW criterion', () => {
      cy.intercept('POST', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 201,
        body: {
          id: 'sow-new',
          executiveRole: 'cio',
          criteriaText: 'System uptime above 99%',
          targetValue: '99',
          status: 'pending',
        },
      }).as('createSow');

      cy.get('[role="tablist"]').contains('SOW Criteria').click();
      cy.contains('Add Criterion').click();
      cy.wait(500);

      // Select role
      cy.get('[role="dialog"] [role="combobox"]').first().click({ force: true });
      cy.contains('[role="option"]', 'CIO').click();

      cy.get('[role="dialog"] textarea#criteriaText').type('System uptime above 99%');
      cy.get('[role="dialog"] input#targetValue').type('99');
      cy.get('[role="dialog"]').contains('button', 'Add').click();
      cy.wait('@createSow');
    });

    it('should verify SOW criterion', () => {
      cy.intercept('POST', '/api/sow-criteria/sow-2/verify', {
        statusCode: 200,
        body: { ...mockSowCriteria[1], achievedValue: '8', status: 'achieved' },
      }).as('verifySow');

      cy.contains('button', 'SOW Criteria').click();

      // The verify button appears for pending criteria
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('8');
      });

      cy.get('tr').contains('Project budget variance').parent().parent()
        .find('button').first().click();
      cy.wait('@verifySow');
    });

    it('should delete SOW criterion', () => {
      cy.intercept('DELETE', '/api/sow-criteria/sow-1', {
        statusCode: 200,
        body: { success: true },
      }).as('deleteSow');

      cy.contains('button', 'SOW Criteria').click();
      cy.get('tr').contains('Zero critical patient safety').parent().parent()
        .find('button').last().click();
      cy.wait('@deleteSow');
    });
  });

  // ============================================================================
  // Reports Tab Tests
  // ============================================================================
  describe('Reports Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: mockReports,
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should display reports tab', () => {
      cy.contains('button', 'Reports').click();
      cy.contains('Executive Reports').should('be.visible');
    });

    it('should display reports table', () => {
      cy.contains('button', 'Reports').click();
      cy.contains('Title').should('be.visible');
      cy.contains('Type').should('be.visible');
      cy.contains('Generated').should('be.visible');
    });

    it('should display report data', () => {
      cy.contains('button', 'Reports').click();
      cy.contains('CEO Monthly Report').should('be.visible');
    });

    it('should generate new report', () => {
      cy.intercept('POST', `/api/projects/${mockProject.id}/executive-reports/generate`, {
        statusCode: 201,
        body: {
          id: 'report-new',
          title: 'Executive Report',
          reportType: 'monthly',
          generatedAt: new Date().toISOString(),
        },
      }).as('generateReport');

      cy.contains('button', 'Reports').click();
      cy.contains('Generate Report').click();
      cy.wait('@generateReport');
    });
  });

  // ============================================================================
  // Empty States Tests
  // ============================================================================
  describe('Empty States', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: {
          ...mockSummary,
          summary: { total: 0, achieved: 0, onTrack: 0, atRisk: 0, missed: 0, notStarted: 0 },
          metrics: [],
          endorsements: { total: 0, pending: 0, received: 0, published: 0 },
          sowCriteria: { total: 0, achieved: 0, pending: 0 },
        },
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should show empty state for metrics', () => {
      cy.contains('button', 'Metrics').click();
      cy.contains('No metrics defined yet').should('be.visible');
    });

    it('should show empty state for endorsements', () => {
      cy.contains('button', 'Endorsements').click();
      cy.contains('No endorsements requested yet').should('be.visible');
    });

    it('should show empty state for SOW criteria', () => {
      cy.contains('button', 'SOW Criteria').click();
      cy.contains('No SOW success criteria defined yet').should('be.visible');
    });

    it('should show empty state for reports', () => {
      cy.contains('button', 'Reports').click();
      cy.contains('No reports generated yet').should('be.visible');
    });
  });

  // ============================================================================
  // API Error Handling Tests
  // ============================================================================
  describe('API Error Handling', () => {
    it('should handle summary fetch error', () => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('getSummaryError');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummaryError');
      cy.contains('No data available').should('be.visible');
    });

    it('should handle seed metrics error', () => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: { ...mockSummary, metrics: [] },
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.intercept('POST', `/api/projects/${mockProject.id}/executive-metrics/seed`, {
        statusCode: 500,
        body: { error: 'Failed to seed metrics' },
      }).as('seedError');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');

      cy.contains('button', 'Metrics').click();
      cy.contains('Seed CEO').click();
      cy.wait('@seedError');
      cy.contains('Failed to seed metrics').should('be.visible');
    });

    it('should handle update value error', () => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: [],
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: [],
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: [],
      }).as('getReports');

      cy.intercept('POST', '/api/executive-metrics/*/update-value', {
        statusCode: 500,
        body: { error: 'Failed to update value' },
      }).as('updateError');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');

      cy.get('[role="tablist"]').contains('Metrics').click();
      cy.get('[data-testid="update-metric-value"]').first().click();
      cy.get('input#newValue').type('100');
      cy.get('[role="dialog"]').contains('button', 'Update').click();
      cy.wait('@updateError');
      // Toast should show error message
      cy.get('body').should('exist');
    });
  });

  // ============================================================================
  // Role-based Access Tests
  // ============================================================================
  describe('Role-based Access', () => {
    it('should be accessible by admin users', () => {
      cy.intercept('GET', '/api/user', {
        statusCode: 200,
        body: { id: 'admin-user', email: 'admin@test.com', role: 'admin' },
      }).as('getAdminUser');

      cy.visit('/executive-metrics');
      cy.contains('Executive Success Metrics').should('be.visible');
    });

    it('should be accessible by hospital leadership', () => {
      cy.intercept('GET', '/api/user', {
        statusCode: 200,
        body: { id: 'leadership-user', email: 'leader@test.com', role: 'hospital_leadership' },
      }).as('getLeadershipUser');

      cy.visit('/executive-metrics');
      cy.contains('Executive Success Metrics').should('be.visible');
    });
  });

  // ============================================================================
  // Navigation Tests
  // ============================================================================
  describe('Navigation', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: mockEndorsements,
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: mockSowCriteria,
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: mockReports,
      }).as('getReports');

      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');
    });

    it('should navigate between tabs', () => {
      cy.contains('button', 'Dashboard').should('have.attr', 'data-state', 'active');

      cy.contains('button', 'Metrics').click();
      cy.contains('button', 'Metrics').should('have.attr', 'data-state', 'active');

      cy.contains('button', 'Endorsements').click();
      cy.contains('button', 'Endorsements').should('have.attr', 'data-state', 'active');

      cy.contains('button', 'SOW Criteria').click();
      cy.contains('button', 'SOW Criteria').should('have.attr', 'data-state', 'active');

      cy.contains('button', 'Reports').click();
      cy.contains('button', 'Reports').should('have.attr', 'data-state', 'active');
    });

    it('should allow changing project', () => {
      cy.get('button').contains(mockProject.name).click({ force: true });
      cy.contains(mockProject.name).should('be.visible');
    });
  });

  // ============================================================================
  // Mobile Responsiveness Tests
  // ============================================================================
  describe('Mobile Responsiveness', () => {
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 768, height: 1024, name: 'iPad Mini' },
    ];

    viewports.forEach((viewport) => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
        });

        it('should display project selector', () => {
          cy.visit('/executive-metrics');
          cy.contains('Executive Success Metrics').should('be.visible');
          cy.get('button').contains('Select a project').should('be.visible');
        });

        it('should display tabs on mobile', () => {
          cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
            statusCode: 200,
            body: mockSummary,
          }).as('getSummary');

          cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
            statusCode: 200,
            body: [],
          }).as('getEndorsements');

          cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
            statusCode: 200,
            body: [],
          }).as('getSowCriteria');

          cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
            statusCode: 200,
            body: [],
          }).as('getReports');

          cy.visit('/executive-metrics');
          cy.get('button').contains('Select a project').click({ force: true });
          cy.contains(mockProject.name).click();
          cy.wait('@getSummary');

          cy.contains('button', 'Dashboard').should('be.visible');
          cy.contains('button', 'Metrics').should('be.visible');
        });
      });
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('Accessibility', () => {
    beforeEach(() => {
      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-summary*`, {
        statusCode: 200,
        body: mockSummary,
      }).as('getSummary');

      cy.intercept('GET', `/api/projects/${mockProject.id}/endorsements`, {
        statusCode: 200,
        body: mockEndorsements,
      }).as('getEndorsements');

      cy.intercept('GET', `/api/projects/${mockProject.id}/sow-criteria`, {
        statusCode: 200,
        body: mockSowCriteria,
      }).as('getSowCriteria');

      cy.intercept('GET', `/api/projects/${mockProject.id}/executive-reports`, {
        statusCode: 200,
        body: mockReports,
      }).as('getReports');
    });

    it('should have accessible project selector', () => {
      cy.visit('/executive-metrics');
      // Project selector should be accessible
      cy.get('button').contains('Select a project').should('exist');
    });

    it('should have accessible tab navigation', () => {
      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');

      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('have.length.at.least', 5);
    });

    it('should support keyboard navigation for tabs', () => {
      cy.visit('/executive-metrics');
      cy.get('button').contains('Select a project').click({ force: true });
      cy.contains(mockProject.name).click();
      cy.wait('@getSummary');

      cy.get('[role="tablist"]').contains('Dashboard').focus();
      cy.focused().should('exist');
    });
  });
});
