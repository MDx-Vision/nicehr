describe('TDR (Technical Dress Rehearsal) Management', () => {
  const testUser = {
    id: 'test-user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  const mockProject = {
    id: 'project-1',
    name: 'Memorial Hospital Epic Implementation',
    status: 'active'
  };

  const mockProjects = [mockProject];

  const mockTdrEvents = [
    {
      id: 'event-1',
      projectId: 'project-1',
      name: 'Full TDR #1',
      description: 'First full technical dress rehearsal',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      type: 'full',
      createdAt: new Date().toISOString()
    }
  ];

  const mockChecklist = [
    { id: 'cl-1', projectId: 'project-1', category: 'infrastructure', title: 'Production environment validated', isCompleted: true, priority: 'high' },
    { id: 'cl-2', projectId: 'project-1', category: 'infrastructure', title: 'Network connectivity tested', isCompleted: false, priority: 'high' },
    { id: 'cl-3', projectId: 'project-1', category: 'integrations', title: 'ADT interfaces tested', isCompleted: true, priority: 'high' },
    { id: 'cl-4', projectId: 'project-1', category: 'integrations', title: 'Lab interfaces tested', isCompleted: false, priority: 'high' },
    { id: 'cl-5', projectId: 'project-1', category: 'workflows', title: 'Registration workflow tested', isCompleted: false, priority: 'medium' }
  ];

  const mockTestScenarios = [
    { id: 'ts-1', projectId: 'project-1', category: 'workflow', title: 'Patient Registration', status: 'passed', priority: 'high' },
    { id: 'ts-2', projectId: 'project-1', category: 'workflow', title: 'Order Entry', status: 'pending', priority: 'high' },
    { id: 'ts-3', projectId: 'project-1', category: 'integration', title: 'Lab Results', status: 'failed', priority: 'critical' }
  ];

  const mockIssues = [
    { id: 'issue-1', projectId: 'project-1', issueNumber: 'TDR-0001', title: 'Lab interface timeout', severity: 'critical', status: 'open', blocksGoLive: true },
    { id: 'issue-2', projectId: 'project-1', issueNumber: 'TDR-0002', title: 'Printer mapping issue', severity: 'medium', status: 'in_progress', blocksGoLive: false }
  ];

  const mockIntegrationTests = [
    { id: 'int-1', projectId: 'project-1', interfaceName: 'ADT', interfaceType: 'HL7', sourceSystem: 'Epic', targetSystem: 'Lab System', direction: 'outbound', status: 'passed' },
    { id: 'int-2', projectId: 'project-1', interfaceName: 'Lab', interfaceType: 'HL7', sourceSystem: 'Lab System', targetSystem: 'Epic', direction: 'inbound', status: 'pending' }
  ];

  const mockDowntimeTests = [
    { id: 'dt-1', projectId: 'project-1', procedureName: 'Planned Downtime', procedureType: 'planned_downtime', status: 'passed', expectedDurationMinutes: 30 },
    { id: 'dt-2', projectId: 'project-1', procedureName: 'Emergency Failover', procedureType: 'failover', status: 'pending', expectedDurationMinutes: 15 }
  ];

  const mockReadinessScore = {
    id: 'score-1',
    projectId: 'project-1',
    technicalScore: 85,
    dataScore: 90,
    staffScore: 80,
    supportScore: 75,
    processScore: 70,
    overallScore: 82,
    recommendation: 'conditional_go',
    criticalIssuesCount: 1,
    highIssuesCount: 2,
    calculatedAt: new Date().toISOString()
  };

  const mockSummary = {
    checklist: { total: 5, completed: 2, percentage: 40 },
    testScenarios: { total: 3, passed: 1, failed: 1, pending: 1, percentage: 33 },
    issues: { total: 2, open: 1, critical: 1, blockers: 1 },
    integrationTests: { total: 2, passed: 1, percentage: 50 },
    downtimeTests: { total: 2, passed: 1, percentage: 50 },
    upcomingEvents: mockTdrEvents,
    latestScore: mockReadinessScore
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Auth mock
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: testUser }).as('getUser');

    // Projects mock
    cy.intercept('GET', '/api/projects', { statusCode: 200, body: mockProjects }).as('getProjects');

    // TDR API mocks
    cy.intercept('GET', '/api/projects/*/tdr/summary', { statusCode: 200, body: mockSummary }).as('getTdrSummary');
    cy.intercept('GET', '/api/projects/*/tdr/events', { statusCode: 200, body: mockTdrEvents }).as('getTdrEvents');
    cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 200, body: mockChecklist }).as('getTdrChecklist');
    cy.intercept('GET', '/api/projects/*/tdr/test-scenarios', { statusCode: 200, body: mockTestScenarios }).as('getTdrTestScenarios');
    cy.intercept('GET', '/api/projects/*/tdr/issues', { statusCode: 200, body: mockIssues }).as('getTdrIssues');
    cy.intercept('GET', '/api/projects/*/tdr/integration-tests', { statusCode: 200, body: mockIntegrationTests }).as('getTdrIntegrationTests');
    cy.intercept('GET', '/api/projects/*/tdr/downtime-tests', { statusCode: 200, body: mockDowntimeTests }).as('getTdrDowntimeTests');
    cy.intercept('GET', '/api/projects/*/tdr/readiness-score', { statusCode: 200, body: mockReadinessScore }).as('getTdrReadinessScore');

    // Mutation mocks
    cy.intercept('POST', '/api/projects/*/tdr/events', { statusCode: 201, body: mockTdrEvents[0] }).as('createTdrEvent');
    cy.intercept('POST', '/api/projects/*/tdr/checklist', { statusCode: 201, body: mockChecklist[0] }).as('createChecklistItem');
    cy.intercept('POST', '/api/projects/*/tdr/checklist/seed', { statusCode: 201, body: mockChecklist }).as('seedChecklist');
    cy.intercept('POST', '/api/tdr/checklist/*/complete', { statusCode: 200, body: { ...mockChecklist[1], isCompleted: true } }).as('completeChecklist');
    cy.intercept('POST', '/api/projects/*/tdr/test-scenarios', { statusCode: 201, body: mockTestScenarios[0] }).as('createTestScenario');
    cy.intercept('POST', '/api/tdr/test-scenarios/*/execute', { statusCode: 200, body: mockTestScenarios[0] }).as('executeTest');
    cy.intercept('POST', '/api/projects/*/tdr/issues', { statusCode: 201, body: mockIssues[0] }).as('createIssue');
    cy.intercept('POST', '/api/tdr/issues/*/resolve', { statusCode: 200, body: { ...mockIssues[0], status: 'resolved' } }).as('resolveIssue');
    cy.intercept('POST', '/api/projects/*/tdr/integration-tests', { statusCode: 201, body: mockIntegrationTests[0] }).as('createIntegrationTest');
    cy.intercept('POST', '/api/projects/*/tdr/downtime-tests', { statusCode: 201, body: mockDowntimeTests[0] }).as('createDowntimeTest');
    cy.intercept('POST', '/api/projects/*/tdr/readiness-score/calculate', { statusCode: 201, body: mockReadinessScore }).as('calculateScore');
  });

  describe('Project Selection', () => {
    it('should show project selector when no project is selected', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.contains('Select a project').should('be.visible');
    });

    it('should load TDR data after selecting a project', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('TDR Management').should('be.visible');
    });
  });

  describe('Dashboard Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
    });

    it('should display summary cards with correct data', () => {
      cy.contains('Checklist Progress').should('be.visible');
      cy.contains('40%').should('be.visible');
      cy.contains('Test Scenarios').should('be.visible');
      cy.contains('Open Issues').should('be.visible');
      cy.contains('Readiness Score').should('be.visible');
      cy.contains('82%').should('be.visible');
    });

    it('should display upcoming TDR events', () => {
      cy.contains('Upcoming TDR Events').should('be.visible');
      cy.contains('Full TDR #1').should('be.visible');
    });

    it('should show CONDITIONAL GO recommendation', () => {
      cy.contains('CONDITIONAL GO').should('be.visible');
    });
  });

  describe('Checklist Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('Checklist').click();
      cy.wait('@getTdrChecklist');
    });

    it('should display checklist items grouped by category', () => {
      cy.contains('Infrastructure').should('be.visible');
      cy.contains('Integrations').should('be.visible');
      cy.contains('Production environment validated').should('be.visible');
    });

    it('should show completion progress per category', () => {
      cy.contains('1 / 2 complete').should('be.visible');
    });

    it('should toggle checklist item completion', () => {
      cy.contains('Network connectivity tested').parent().click();
      cy.wait('@completeChecklist');
    });

    it('should add new checklist item', () => {
      cy.contains('Add Item').click();
      cy.get('input').first().type('New checklist item');
      cy.contains('button', 'Add Item').click();
      cy.wait('@createChecklistItem');
    });
  });

  describe('Tests Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('Tests').click();
      cy.wait('@getTdrTestScenarios');
    });

    it('should display test scenarios with status badges', () => {
      cy.contains('Patient Registration').should('be.visible');
      cy.contains('passed').should('be.visible');
      cy.contains('pending').should('be.visible');
      cy.contains('failed').should('be.visible');
    });

    it('should show pass/fail buttons for pending tests', () => {
      cy.contains('Order Entry').parent().parent().within(() => {
        cy.get('button').should('have.length.at.least', 2);
      });
    });

    it('should add new test scenario', () => {
      cy.contains('Add Test').click();
      cy.get('input').first().type('New test scenario');
      cy.contains('button', 'Add Test').click();
      cy.wait('@createTestScenario');
    });
  });

  describe('Issues Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('Issues').click();
      cy.wait('@getTdrIssues');
    });

    it('should display issues with severity badges', () => {
      cy.contains('Lab interface timeout').should('be.visible');
      cy.contains('TDR-0001').should('be.visible');
      cy.contains('critical').should('be.visible');
      cy.contains('Blocks Go-Live').should('be.visible');
    });

    it('should show resolve button for open issues', () => {
      cy.contains('Resolve').should('be.visible');
    });

    it('should create new issue', () => {
      cy.contains('Report Issue').click();
      cy.get('input').first().type('New issue title');
      cy.contains('button', 'Report Issue').click();
      cy.wait('@createIssue');
    });

    it('should resolve an issue', () => {
      cy.contains('Resolve').first().click();
      cy.wait('@resolveIssue');
    });
  });

  describe('Integrations Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('Integrations').click();
      cy.wait('@getTdrIntegrationTests');
    });

    it('should display integration tests', () => {
      cy.contains('ADT').should('be.visible');
      cy.contains('HL7').should('be.visible');
      cy.contains('Epic').should('be.visible');
    });

    it('should add new integration test', () => {
      cy.contains('Add Interface').click();
      cy.get('input').first().type('Pharmacy');
      cy.contains('button', 'Add Interface').click();
      cy.wait('@createIntegrationTest');
    });
  });

  describe('Downtime Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('Downtime').click();
      cy.wait('@getTdrDowntimeTests');
    });

    it('should display downtime procedure tests', () => {
      cy.contains('Planned Downtime').should('be.visible');
      cy.contains('Emergency Failover').should('be.visible');
      cy.contains('30 min expected').should('be.visible');
    });

    it('should add new downtime procedure', () => {
      cy.contains('Add Procedure').click();
      cy.get('input').first().type('Backup Test');
      cy.contains('button', 'Add Procedure').click();
      cy.wait('@createDowntimeTest');
    });
  });

  describe('Scorecard Tab', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
      cy.contains('Scorecard').click();
      cy.wait('@getTdrReadinessScore');
    });

    it('should display overall readiness score', () => {
      cy.contains('Overall Readiness').should('be.visible');
      cy.contains('82%').should('be.visible');
      cy.contains('CONDITIONAL GO').should('be.visible');
    });

    it('should display category scores', () => {
      cy.contains('Technical').should('be.visible');
      cy.contains('85%').should('be.visible');
      cy.contains('Data').should('be.visible');
      cy.contains('90%').should('be.visible');
    });

    it('should show critical and high issue counts', () => {
      cy.contains('1 critical').should('be.visible');
      cy.contains('2 high').should('be.visible');
    });

    it('should calculate new score', () => {
      cy.contains('Calculate Score').click();
      cy.wait('@calculateScore');
    });
  });

  describe('Schedule TDR Event', () => {
    beforeEach(() => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getTdrSummary');
    });

    it('should open schedule dialog', () => {
      cy.contains('Schedule TDR').click();
      cy.contains('Schedule TDR Event').should('be.visible');
    });

    it('should create TDR event', () => {
      cy.contains('Schedule TDR').click();
      cy.get('input[type="text"]').first().type('TDR #2');
      cy.get('textarea').first().type('Second full rehearsal');
      cy.get('input[type="datetime-local"]').type('2026-02-01T09:00');
      cy.contains('button', 'Create Event').click();
      cy.wait('@createTdrEvent');
    });
  });

  describe('API Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/projects/*/tdr/summary', { statusCode: 500, body: { error: 'Server error' } }).as('getSummaryError');
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getSummaryError');
      // Should not crash, may show error state or fallback
    });
  });

  describe('Empty States', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 200, body: [] }).as('getEmptyChecklist');
      cy.intercept('GET', '/api/projects/*/tdr/test-scenarios', { statusCode: 200, body: [] }).as('getEmptyTests');
      cy.intercept('GET', '/api/projects/*/tdr/issues', { statusCode: 200, body: [] }).as('getEmptyIssues');
      cy.intercept('GET', '/api/projects/*/tdr/integration-tests', { statusCode: 200, body: [] }).as('getEmptyIntegrations');
      cy.intercept('GET', '/api/projects/*/tdr/downtime-tests', { statusCode: 200, body: [] }).as('getEmptyDowntime');
      cy.intercept('GET', '/api/projects/*/tdr/readiness-score', { statusCode: 200, body: null }).as('getNoScore');
    });

    it('should show empty state for checklist', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.contains('Checklist').click();
      cy.wait('@getEmptyChecklist');
      cy.contains('Load Default Checklist').should('be.visible');
    });

    it('should show empty state for test scenarios', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.contains('Tests').click();
      cy.wait('@getEmptyTests');
      cy.contains('No test scenarios defined').should('be.visible');
    });

    it('should show empty state for issues', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.contains('Issues').click();
      cy.wait('@getEmptyIssues');
      cy.contains('No issues reported').should('be.visible');
    });

    it('should show empty state for readiness score', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.contains('Scorecard').click();
      cy.wait('@getNoScore');
      cy.contains('No readiness score calculated yet').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to TDR from sidebar', () => {
      cy.visit('/');
      cy.wait('@getUser');
      cy.contains('Support').click();
      cy.contains('TDR Management').click();
      cy.url().should('include', '/tdr');
    });

    it('should switch between tabs', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();

      cy.contains('Checklist').click();
      cy.contains('TDR Checklist').should('be.visible');

      cy.contains('Tests').click();
      cy.contains('Test Scenarios').should('be.visible');

      cy.contains('Issues').click();
      cy.contains('TDR Issues').should('be.visible');

      cy.contains('Integrations').click();
      cy.contains('Integration Tests').should('be.visible');

      cy.contains('Downtime').click();
      cy.contains('Downtime Procedure Tests').should('be.visible');

      cy.contains('Scorecard').click();
      cy.contains('Go-Live Readiness Scorecard').should('be.visible');

      cy.contains('Dashboard').click();
      cy.contains('Checklist Progress').should('be.visible');
    });
  });
});
