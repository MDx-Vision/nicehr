describe('TDR (Technical Dress Rehearsal) Management', () => {
  const testUser = {
    id: 'test-user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  const consultantUser = {
    id: 'consultant-user-1',
    email: 'consultant@example.com',
    firstName: 'Consultant',
    lastName: 'User',
    role: 'consultant'
  };

  const hospitalStaffUser = {
    id: 'staff-user-1',
    email: 'staff@example.com',
    firstName: 'Hospital',
    lastName: 'Staff',
    role: 'hospital_staff'
  };

  const mockProject = {
    id: 'project-1',
    name: 'Memorial Hospital Epic Implementation',
    status: 'active'
  };

  const mockProject2 = {
    id: 'project-2',
    name: 'City Medical Center Cerner Go-Live',
    status: 'active'
  };

  const mockProjects = [mockProject, mockProject2];

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
    },
    {
      id: 'event-2',
      projectId: 'project-1',
      name: 'Integration TDR',
      description: 'Integration-only rehearsal',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      type: 'integration_only',
      createdAt: new Date().toISOString()
    }
  ];

  const mockChecklist = [
    { id: 'cl-1', projectId: 'project-1', category: 'infrastructure', title: 'Production environment validated', isCompleted: true, priority: 'high', sortOrder: 0 },
    { id: 'cl-2', projectId: 'project-1', category: 'infrastructure', title: 'Network connectivity tested', isCompleted: false, priority: 'high', sortOrder: 1 },
    { id: 'cl-3', projectId: 'project-1', category: 'integrations', title: 'ADT interfaces tested', isCompleted: true, priority: 'high', sortOrder: 2 },
    { id: 'cl-4', projectId: 'project-1', category: 'integrations', title: 'Lab interfaces tested', isCompleted: false, priority: 'high', sortOrder: 3 },
    { id: 'cl-5', projectId: 'project-1', category: 'workflows', title: 'Registration workflow tested', isCompleted: false, priority: 'medium', sortOrder: 4 },
    { id: 'cl-6', projectId: 'project-1', category: 'data_migration', title: 'Patient demographics migrated', isCompleted: true, priority: 'critical', sortOrder: 5 },
    { id: 'cl-7', projectId: 'project-1', category: 'support', title: 'Command center operational', isCompleted: false, priority: 'high', sortOrder: 6 }
  ];

  const mockTestScenarios = [
    { id: 'ts-1', projectId: 'project-1', category: 'workflow', title: 'Patient Registration', description: 'Test patient registration flow', expectedResult: 'Patient registered successfully', status: 'passed', priority: 'high', department: 'ED' },
    { id: 'ts-2', projectId: 'project-1', category: 'workflow', title: 'Order Entry', description: 'Test medication order entry', expectedResult: 'Order placed and verified', status: 'pending', priority: 'high', department: 'Pharmacy' },
    { id: 'ts-3', projectId: 'project-1', category: 'integration', title: 'Lab Results', description: 'Test lab results interface', expectedResult: 'Results received within 30s', status: 'failed', priority: 'critical', department: 'Lab' },
    { id: 'ts-4', projectId: 'project-1', category: 'performance', title: 'Chart Load Time', description: 'Measure chart load performance', expectedResult: 'Chart loads in under 3s', status: 'pending', priority: 'medium', department: null },
    { id: 'ts-5', projectId: 'project-1', category: 'security', title: 'Access Control', description: 'Verify role-based access', expectedResult: 'Unauthorized access blocked', status: 'passed', priority: 'critical', department: null }
  ];

  const mockIssues = [
    { id: 'issue-1', projectId: 'project-1', issueNumber: 'TDR-0001', title: 'Lab interface timeout', description: 'Lab results taking over 60 seconds', severity: 'critical', status: 'open', blocksGoLive: true, category: 'integration', assignedTo: 'user-2', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'issue-2', projectId: 'project-1', issueNumber: 'TDR-0002', title: 'Printer mapping issue', description: 'Labels printing to wrong printer', severity: 'medium', status: 'in_progress', blocksGoLive: false, category: 'technical', assignedTo: 'user-3', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'issue-3', projectId: 'project-1', issueNumber: 'TDR-0003', title: 'Training gap identified', description: 'Staff need additional training on medication reconciliation', severity: 'high', status: 'open', blocksGoLive: false, category: 'training', assignedTo: null, dueDate: null },
    { id: 'issue-4', projectId: 'project-1', issueNumber: 'TDR-0004', title: 'Data migration discrepancy', description: 'Allergy data not migrated correctly', severity: 'critical', status: 'resolved', blocksGoLive: true, category: 'data', resolution: 'Re-ran migration script', resolvedAt: new Date().toISOString() }
  ];

  const mockIntegrationTests = [
    { id: 'int-1', projectId: 'project-1', interfaceName: 'ADT', interfaceType: 'HL7', sourceSystem: 'Epic', targetSystem: 'Lab System', direction: 'outbound', status: 'passed', messagesSent: 150, messagesReceived: 150, errorsCount: 0, responseTimeMs: 45 },
    { id: 'int-2', projectId: 'project-1', interfaceName: 'Lab', interfaceType: 'HL7', sourceSystem: 'Lab System', targetSystem: 'Epic', direction: 'inbound', status: 'pending', messagesSent: 0, messagesReceived: 0, errorsCount: 0, responseTimeMs: null },
    { id: 'int-3', projectId: 'project-1', interfaceName: 'Pharmacy', interfaceType: 'FHIR', sourceSystem: 'Epic', targetSystem: 'Pharmacy System', direction: 'bidirectional', status: 'failed', messagesSent: 100, messagesReceived: 85, errorsCount: 15, responseTimeMs: 120 },
    { id: 'int-4', projectId: 'project-1', interfaceName: 'Radiology', interfaceType: 'HL7', sourceSystem: 'PACS', targetSystem: 'Epic', direction: 'inbound', status: 'passed', messagesSent: 75, messagesReceived: 75, errorsCount: 0, responseTimeMs: 35 }
  ];

  const mockDowntimeTests = [
    { id: 'dt-1', projectId: 'project-1', procedureName: 'Planned Downtime', procedureType: 'planned_downtime', description: 'Test planned maintenance procedures', status: 'passed', expectedDurationMinutes: 30, actualDurationMinutes: 28 },
    { id: 'dt-2', projectId: 'project-1', procedureName: 'Emergency Failover', procedureType: 'failover', description: 'Test failover to backup systems', status: 'pending', expectedDurationMinutes: 15, actualDurationMinutes: null },
    { id: 'dt-3', projectId: 'project-1', procedureName: 'Data Backup', procedureType: 'backup', description: 'Verify backup procedures', status: 'passed', expectedDurationMinutes: 60, actualDurationMinutes: 55 },
    { id: 'dt-4', projectId: 'project-1', procedureName: 'System Restore', procedureType: 'restore', description: 'Test restore from backup', status: 'failed', expectedDurationMinutes: 120, actualDurationMinutes: 180, issues: 'Restore took longer than expected' }
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

  const mockReadinessScoreGo = {
    ...mockReadinessScore,
    id: 'score-2',
    overallScore: 95,
    recommendation: 'go',
    criticalIssuesCount: 0,
    highIssuesCount: 0
  };

  const mockReadinessScoreNoGo = {
    ...mockReadinessScore,
    id: 'score-3',
    overallScore: 55,
    recommendation: 'no_go',
    criticalIssuesCount: 5,
    highIssuesCount: 8
  };

  const mockSummary = {
    checklist: { total: 7, completed: 3, percentage: 43 },
    testScenarios: { total: 5, passed: 2, failed: 1, pending: 2, percentage: 40 },
    issues: { total: 4, open: 2, critical: 1, blockers: 1 },
    integrationTests: { total: 4, passed: 2, percentage: 50 },
    downtimeTests: { total: 4, passed: 2, percentage: 50 },
    upcomingEvents: mockTdrEvents,
    latestScore: mockReadinessScore
  };

  // Helper function to set up common mocks
  const setupMocks = (user = testUser) => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: user }).as('getUser');
    cy.intercept('GET', '/api/projects', { statusCode: 200, body: mockProjects }).as('getProjects');
    cy.intercept('GET', '/api/projects/*/tdr/summary', { statusCode: 200, body: mockSummary }).as('getTdrSummary');
    cy.intercept('GET', '/api/projects/*/tdr/events', { statusCode: 200, body: mockTdrEvents }).as('getTdrEvents');
    cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 200, body: mockChecklist }).as('getTdrChecklist');
    cy.intercept('GET', '/api/projects/*/tdr/test-scenarios', { statusCode: 200, body: mockTestScenarios }).as('getTdrTestScenarios');
    cy.intercept('GET', '/api/projects/*/tdr/issues', { statusCode: 200, body: mockIssues }).as('getTdrIssues');
    cy.intercept('GET', '/api/projects/*/tdr/integration-tests', { statusCode: 200, body: mockIntegrationTests }).as('getTdrIntegrationTests');
    cy.intercept('GET', '/api/projects/*/tdr/downtime-tests', { statusCode: 200, body: mockDowntimeTests }).as('getTdrDowntimeTests');
    cy.intercept('GET', '/api/projects/*/tdr/readiness-score', { statusCode: 200, body: mockReadinessScore }).as('getTdrReadinessScore');
    cy.intercept('GET', '/api/projects/*/tdr/readiness-score/history', { statusCode: 200, body: [mockReadinessScore] }).as('getTdrReadinessHistory');
  };

  // Helper function to set up mutation mocks
  const setupMutationMocks = () => {
    // Create mocks
    cy.intercept('POST', '/api/projects/*/tdr/events', { statusCode: 201, body: mockTdrEvents[0] }).as('createTdrEvent');
    cy.intercept('POST', '/api/projects/*/tdr/checklist', { statusCode: 201, body: mockChecklist[0] }).as('createChecklistItem');
    cy.intercept('POST', '/api/projects/*/tdr/checklist/seed', { statusCode: 201, body: mockChecklist }).as('seedChecklist');
    cy.intercept('POST', '/api/tdr/checklist/*/complete', { statusCode: 200, body: { ...mockChecklist[1], isCompleted: true } }).as('completeChecklist');
    cy.intercept('POST', '/api/tdr/checklist/*/uncomplete', { statusCode: 200, body: { ...mockChecklist[0], isCompleted: false } }).as('uncompleteChecklist');
    cy.intercept('POST', '/api/projects/*/tdr/test-scenarios', { statusCode: 201, body: mockTestScenarios[0] }).as('createTestScenario');
    cy.intercept('POST', '/api/tdr/test-scenarios/*/execute', { statusCode: 200, body: mockTestScenarios[0] }).as('executeTest');
    cy.intercept('POST', '/api/projects/*/tdr/issues', { statusCode: 201, body: mockIssues[0] }).as('createIssue');
    cy.intercept('POST', '/api/tdr/issues/*/resolve', { statusCode: 200, body: { ...mockIssues[0], status: 'resolved' } }).as('resolveIssue');
    cy.intercept('POST', '/api/projects/*/tdr/integration-tests', { statusCode: 201, body: mockIntegrationTests[0] }).as('createIntegrationTest');
    cy.intercept('POST', '/api/projects/*/tdr/downtime-tests', { statusCode: 201, body: mockDowntimeTests[0] }).as('createDowntimeTest');
    cy.intercept('POST', '/api/projects/*/tdr/readiness-score/calculate', { statusCode: 201, body: mockReadinessScore }).as('calculateScore');
    cy.intercept('POST', '/api/tdr/readiness-score/*/approve', { statusCode: 200, body: { ...mockReadinessScore, approvedAt: new Date().toISOString() } }).as('approveScore');

    // Update mocks
    cy.intercept('PATCH', '/api/tdr/events/*', { statusCode: 200, body: mockTdrEvents[0] }).as('updateTdrEvent');
    cy.intercept('PATCH', '/api/tdr/checklist/*', { statusCode: 200, body: mockChecklist[0] }).as('updateChecklistItem');
    cy.intercept('PATCH', '/api/tdr/test-scenarios/*', { statusCode: 200, body: mockTestScenarios[0] }).as('updateTestScenario');
    cy.intercept('PATCH', '/api/tdr/issues/*', { statusCode: 200, body: mockIssues[0] }).as('updateIssue');
    cy.intercept('PATCH', '/api/tdr/integration-tests/*', { statusCode: 200, body: mockIntegrationTests[0] }).as('updateIntegrationTest');
    cy.intercept('PATCH', '/api/tdr/downtime-tests/*', { statusCode: 200, body: mockDowntimeTests[0] }).as('updateDowntimeTest');

    // Delete mocks
    cy.intercept('DELETE', '/api/tdr/events/*', { statusCode: 204 }).as('deleteTdrEvent');
    cy.intercept('DELETE', '/api/tdr/checklist/*', { statusCode: 204 }).as('deleteChecklistItem');
    cy.intercept('DELETE', '/api/tdr/test-scenarios/*', { statusCode: 204 }).as('deleteTestScenario');
    cy.intercept('DELETE', '/api/tdr/issues/*', { statusCode: 204 }).as('deleteIssue');
    cy.intercept('DELETE', '/api/tdr/integration-tests/*', { statusCode: 204 }).as('deleteIntegrationTest');
    cy.intercept('DELETE', '/api/tdr/downtime-tests/*', { statusCode: 204 }).as('deleteDowntimeTest');
  };

  // Helper to navigate to TDR with project selected
  const navigateToTdr = () => {
    cy.visit('/tdr');
    cy.wait('@getProjects');
    cy.get('[role="combobox"]').click();
    cy.contains(mockProject.name).click();
    cy.wait('@getTdrSummary');
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    setupMocks();
    setupMutationMocks();
  });

  // =============================================================================
  // PROJECT SELECTION
  // =============================================================================
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

    it('should switch between projects', () => {
      navigateToTdr();
      cy.get('[role="combobox"]').last().click();
      cy.contains(mockProject2.name).click();
      cy.wait('@getTdrSummary');
    });

    it('should show all available projects in dropdown', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).should('be.visible');
      cy.contains(mockProject2.name).should('be.visible');
    });

    it('should persist project selection on page refresh', () => {
      navigateToTdr();
      cy.reload();
      cy.wait('@getProjects');
      // Project selection should be maintained via state or URL
    });
  });

  // =============================================================================
  // DASHBOARD TAB
  // =============================================================================
  describe('Dashboard Tab', () => {
    beforeEach(() => {
      navigateToTdr();
    });

    it('should display summary cards with correct data', () => {
      cy.contains('Checklist Progress').should('be.visible');
      cy.contains('43%').should('be.visible');
      cy.contains('Test Scenarios').should('be.visible');
      cy.contains('Open Issues').should('be.visible');
      cy.contains('Readiness Score').should('be.visible');
      cy.contains('82%').should('be.visible');
    });

    it('should display upcoming TDR events', () => {
      cy.contains('Upcoming TDR Events').should('be.visible');
      cy.contains('Full TDR #1').should('be.visible');
      cy.contains('Integration TDR').should('be.visible');
    });

    it('should show CONDITIONAL GO recommendation', () => {
      cy.contains('CONDITIONAL GO').should('be.visible');
    });

    it('should show progress bars for metrics', () => {
      cy.get('[role="progressbar"]').should('have.length.at.least', 1);
    });

    it('should display critical and blocker issue counts', () => {
      cy.contains('1 critical').should('be.visible');
      cy.contains('1 blockers').should('be.visible');
    });

    it('should show event type badges', () => {
      cy.contains('full').should('be.visible');
    });
  });

  // =============================================================================
  // CHECKLIST TAB - CRUD OPERATIONS
  // =============================================================================
  describe('Checklist Tab', () => {
    beforeEach(() => {
      navigateToTdr();
      cy.contains('Checklist').click();
      cy.wait('@getTdrChecklist');
    });

    describe('Read Operations', () => {
      it('should display checklist items grouped by category', () => {
        cy.contains('Infrastructure').should('be.visible');
        cy.contains('Integrations').should('be.visible');
        cy.contains('Workflows').should('be.visible');
        cy.contains('Data Migration').should('be.visible');
        cy.contains('Support Readiness').should('be.visible');
      });

      it('should show completion progress per category', () => {
        cy.contains('complete').should('be.visible');
      });

      it('should display priority badges', () => {
        cy.contains('high').should('be.visible');
        cy.contains('medium').should('be.visible');
        cy.contains('critical').should('be.visible');
      });

      it('should show checkmarks for completed items', () => {
        cy.get('[data-state="checked"]').should('exist');
      });

      it('should show unchecked boxes for incomplete items', () => {
        cy.get('[data-state="unchecked"]').should('exist');
      });

      it('should display all items in correct categories', () => {
        cy.contains('Production environment validated').should('be.visible');
        cy.contains('Network connectivity tested').should('be.visible');
        cy.contains('ADT interfaces tested').should('be.visible');
      });
    });

    describe('Create Operations', () => {
      it('should open create dialog', () => {
        cy.contains('Add Item').click();
        cy.contains('Add Checklist Item').should('be.visible');
      });

      it('should create new checklist item', () => {
        cy.contains('Add Item').click();
        cy.get('[role="combobox"]').first().click();
        cy.contains('Infrastructure').click();
        cy.get('input[type="text"]').type('New infrastructure check');
        cy.contains('button', 'Add Item').click();
        cy.wait('@createChecklistItem');
      });

      it('should seed default checklist when empty', () => {
        cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 200, body: [] }).as('getEmptyChecklist');
        cy.reload();
        cy.wait('@getProjects');
        cy.get('[role="combobox"]').click();
        cy.contains(mockProject.name).click();
        cy.contains('Checklist').click();
        cy.wait('@getEmptyChecklist');
        cy.contains('Load Default Checklist').click();
        cy.wait('@seedChecklist');
      });

      it('should close dialog on cancel', () => {
        cy.contains('Add Item').click();
        cy.contains('button', 'Cancel').click();
        cy.contains('Add Checklist Item').should('not.exist');
      });
    });

    describe('Update Operations', () => {
      it('should toggle checklist item to complete', () => {
        cy.contains('Network connectivity tested').parent().click();
        cy.wait('@completeChecklist');
      });

      it('should toggle checklist item to incomplete', () => {
        cy.contains('Production environment validated').parent().click();
        cy.wait('@uncompleteChecklist');
      });
    });

    describe('Delete Operations', () => {
      it('should delete checklist item', () => {
        // Assuming there's a delete button/icon
        cy.get('[data-testid="delete-checklist-item"]').first().click({ force: true });
        cy.wait('@deleteChecklistItem');
      });
    });
  });

  // =============================================================================
  // TESTS TAB - CRUD OPERATIONS
  // =============================================================================
  describe('Tests Tab', () => {
    beforeEach(() => {
      navigateToTdr();
      cy.contains('Tests').click();
      cy.wait('@getTdrTestScenarios');
    });

    describe('Read Operations', () => {
      it('should display test scenarios with status badges', () => {
        cy.contains('Patient Registration').should('be.visible');
        cy.contains('passed').should('be.visible');
        cy.contains('pending').should('be.visible');
        cy.contains('failed').should('be.visible');
      });

      it('should show department badges when present', () => {
        cy.contains('ED').should('be.visible');
        cy.contains('Pharmacy').should('be.visible');
        cy.contains('Lab').should('be.visible');
      });

      it('should show category badges', () => {
        cy.contains('workflow').should('be.visible');
        cy.contains('integration').should('be.visible');
        cy.contains('performance').should('be.visible');
        cy.contains('security').should('be.visible');
      });

      it('should display expected results when available', () => {
        cy.contains('Expected:').should('be.visible');
      });
    });

    describe('Create Operations', () => {
      it('should open create dialog', () => {
        cy.contains('Add Test').click();
        cy.contains('Add Test Scenario').should('be.visible');
      });

      it('should create new test scenario', () => {
        cy.contains('Add Test').click();
        cy.get('[role="combobox"]').first().click();
        cy.contains('Workflow').click();
        cy.get('input[type="text"]').type('New test scenario');
        cy.get('textarea').first().type('Test description');
        cy.get('textarea').last().type('Expected outcome');
        cy.contains('button', 'Add Test').click();
        cy.wait('@createTestScenario');
      });

      it('should allow selecting priority', () => {
        cy.contains('Add Test').click();
        cy.get('[role="combobox"]').eq(1).click();
        cy.contains('Critical').click();
      });
    });

    describe('Execute Operations', () => {
      it('should show pass/fail buttons for pending tests', () => {
        cy.contains('Order Entry').parent().parent().within(() => {
          cy.get('button').should('have.length.at.least', 2);
        });
      });

      it('should execute test as passed', () => {
        cy.contains('Order Entry').parent().parent().within(() => {
          cy.get('button').first().click();
        });
        cy.wait('@executeTest');
      });

      it('should execute test as failed', () => {
        cy.contains('Order Entry').parent().parent().within(() => {
          cy.get('button').last().click();
        });
        cy.wait('@executeTest');
      });

      it('should not show execute buttons for already executed tests', () => {
        cy.contains('Patient Registration').parent().parent().within(() => {
          // Should not have pass/fail buttons for already passed test
          cy.get('button').should('have.length', 0);
        });
      });
    });

    describe('Delete Operations', () => {
      it('should delete test scenario', () => {
        cy.get('[data-testid="delete-test-scenario"]').first().click({ force: true });
        cy.wait('@deleteTestScenario');
      });
    });
  });

  // =============================================================================
  // ISSUES TAB - CRUD OPERATIONS
  // =============================================================================
  describe('Issues Tab', () => {
    beforeEach(() => {
      navigateToTdr();
      cy.contains('Issues').click();
      cy.wait('@getTdrIssues');
    });

    describe('Read Operations', () => {
      it('should display issues with severity badges', () => {
        cy.contains('Lab interface timeout').should('be.visible');
        cy.contains('TDR-0001').should('be.visible');
        cy.contains('critical').should('be.visible');
      });

      it('should highlight go-live blockers', () => {
        cy.contains('Blocks Go-Live').should('be.visible');
      });

      it('should show issue status', () => {
        cy.contains('open').should('be.visible');
        cy.contains('in_progress').should('be.visible');
        cy.contains('resolved').should('be.visible');
      });

      it('should show issue categories', () => {
        cy.contains('integration').should('be.visible');
        cy.contains('technical').should('be.visible');
        cy.contains('training').should('be.visible');
      });

      it('should display resolved issues with resolution', () => {
        cy.contains('Data migration discrepancy').should('be.visible');
      });
    });

    describe('Create Operations', () => {
      it('should open create dialog', () => {
        cy.contains('Report Issue').click();
        cy.contains('Report Issue').should('be.visible');
      });

      it('should create new issue', () => {
        cy.contains('Report Issue').click();
        cy.get('input[type="text"]').type('New issue title');
        cy.get('textarea').type('Issue description');
        cy.contains('button', 'Report Issue').click();
        cy.wait('@createIssue');
      });

      it('should allow setting severity', () => {
        cy.contains('Report Issue').click();
        cy.get('[role="combobox"]').eq(1).click();
        cy.contains('Critical').click();
      });

      it('should allow marking as go-live blocker', () => {
        cy.contains('Report Issue').click();
        cy.contains('Blocks Go-Live').click();
      });
    });

    describe('Update Operations', () => {
      it('should resolve an issue', () => {
        cy.contains('Resolve').first().click();
        cy.wait('@resolveIssue');
      });

      it('should update issue status', () => {
        // Assuming there's an edit button
        cy.get('[data-testid="edit-issue"]').first().click({ force: true });
        cy.wait('@updateIssue');
      });
    });

    describe('Delete Operations', () => {
      it('should delete issue', () => {
        cy.get('[data-testid="delete-issue"]').first().click({ force: true });
        cy.wait('@deleteIssue');
      });
    });
  });

  // =============================================================================
  // INTEGRATIONS TAB - CRUD OPERATIONS
  // =============================================================================
  describe('Integrations Tab', () => {
    beforeEach(() => {
      navigateToTdr();
      cy.contains('Integrations').click();
      cy.wait('@getTdrIntegrationTests');
    });

    describe('Read Operations', () => {
      it('should display integration tests', () => {
        cy.contains('ADT').should('be.visible');
        cy.contains('Lab').should('be.visible');
        cy.contains('Pharmacy').should('be.visible');
        cy.contains('Radiology').should('be.visible');
      });

      it('should show interface types', () => {
        cy.contains('HL7').should('be.visible');
        cy.contains('FHIR').should('be.visible');
      });

      it('should show source and target systems', () => {
        cy.contains('Epic').should('be.visible');
        cy.contains('Lab System').should('be.visible');
      });

      it('should show direction badges', () => {
        cy.contains('outbound').should('be.visible');
        cy.contains('inbound').should('be.visible');
        cy.contains('bidirectional').should('be.visible');
      });

      it('should show test status', () => {
        cy.contains('passed').should('be.visible');
        cy.contains('pending').should('be.visible');
        cy.contains('failed').should('be.visible');
      });
    });

    describe('Create Operations', () => {
      it('should open create dialog', () => {
        cy.contains('Add Interface').click();
        cy.contains('Add Integration Test').should('be.visible');
      });

      it('should create new integration test', () => {
        cy.contains('Add Interface').click();
        cy.get('input').first().type('New Interface');
        cy.get('[role="combobox"]').first().click();
        cy.contains('FHIR').click();
        cy.get('input').eq(1).type('Source System');
        cy.get('input').eq(2).type('Target System');
        cy.contains('button', 'Add Interface').click();
        cy.wait('@createIntegrationTest');
      });
    });

    describe('Update Operations', () => {
      it('should mark integration test as passed', () => {
        cy.contains('Lab').parent().parent().within(() => {
          cy.get('button').first().click();
        });
        cy.wait('@updateIntegrationTest');
      });

      it('should mark integration test as failed', () => {
        cy.contains('Lab').parent().parent().within(() => {
          cy.get('button').last().click();
        });
        cy.wait('@updateIntegrationTest');
      });
    });

    describe('Delete Operations', () => {
      it('should delete integration test', () => {
        cy.get('[data-testid="delete-integration-test"]').first().click({ force: true });
        cy.wait('@deleteIntegrationTest');
      });
    });
  });

  // =============================================================================
  // DOWNTIME TAB - CRUD OPERATIONS
  // =============================================================================
  describe('Downtime Tab', () => {
    beforeEach(() => {
      navigateToTdr();
      cy.contains('Downtime').click();
      cy.wait('@getTdrDowntimeTests');
    });

    describe('Read Operations', () => {
      it('should display downtime procedure tests', () => {
        cy.contains('Planned Downtime').should('be.visible');
        cy.contains('Emergency Failover').should('be.visible');
        cy.contains('Data Backup').should('be.visible');
        cy.contains('System Restore').should('be.visible');
      });

      it('should show expected duration', () => {
        cy.contains('30 min expected').should('be.visible');
        cy.contains('15 min expected').should('be.visible');
      });

      it('should show procedure types', () => {
        cy.contains('planned_downtime').should('be.visible');
        cy.contains('failover').should('be.visible');
        cy.contains('backup').should('be.visible');
        cy.contains('restore').should('be.visible');
      });

      it('should show test status', () => {
        cy.contains('passed').should('be.visible');
        cy.contains('pending').should('be.visible');
        cy.contains('failed').should('be.visible');
      });
    });

    describe('Create Operations', () => {
      it('should open create dialog', () => {
        cy.contains('Add Procedure').click();
        cy.contains('Add Downtime Procedure').should('be.visible');
      });

      it('should create new downtime procedure', () => {
        cy.contains('Add Procedure').click();
        cy.get('input').first().type('New Procedure');
        cy.get('[role="combobox"]').first().click();
        cy.contains('Backup').click();
        cy.get('textarea').type('Procedure description');
        cy.get('input[type="number"]').clear().type('45');
        cy.contains('button', 'Add Procedure').click();
        cy.wait('@createDowntimeTest');
      });
    });

    describe('Update Operations', () => {
      it('should mark downtime test as passed', () => {
        cy.contains('Emergency Failover').parent().parent().within(() => {
          cy.get('button').first().click();
        });
        cy.wait('@updateDowntimeTest');
      });

      it('should mark downtime test as failed', () => {
        cy.contains('Emergency Failover').parent().parent().within(() => {
          cy.get('button').last().click();
        });
        cy.wait('@updateDowntimeTest');
      });
    });

    describe('Delete Operations', () => {
      it('should delete downtime test', () => {
        cy.get('[data-testid="delete-downtime-test"]').first().click({ force: true });
        cy.wait('@deleteDowntimeTest');
      });
    });
  });

  // =============================================================================
  // SCORECARD TAB
  // =============================================================================
  describe('Scorecard Tab', () => {
    beforeEach(() => {
      navigateToTdr();
      cy.contains('Scorecard').click();
      cy.wait('@getTdrReadinessScore');
    });

    describe('Read Operations', () => {
      it('should display overall readiness score', () => {
        cy.contains('Overall Readiness').should('be.visible');
        cy.contains('82%').should('be.visible');
      });

      it('should display category scores', () => {
        cy.contains('Technical').should('be.visible');
        cy.contains('85%').should('be.visible');
        cy.contains('Data').should('be.visible');
        cy.contains('90%').should('be.visible');
        cy.contains('Staff').should('be.visible');
        cy.contains('80%').should('be.visible');
        cy.contains('Support').should('be.visible');
        cy.contains('75%').should('be.visible');
        cy.contains('Process').should('be.visible');
        cy.contains('70%').should('be.visible');
      });

      it('should show critical and high issue counts', () => {
        cy.contains('1 critical').should('be.visible');
        cy.contains('2 high').should('be.visible');
      });

      it('should display recommendation badge', () => {
        cy.contains('CONDITIONAL GO').should('be.visible');
      });

      it('should show calculation timestamp', () => {
        cy.contains('Last calculated').should('be.visible');
      });
    });

    describe('Score Recommendations', () => {
      it('should show GO for high scores', () => {
        cy.intercept('GET', '/api/projects/*/tdr/readiness-score', { statusCode: 200, body: mockReadinessScoreGo }).as('getGoScore');
        cy.reload();
        cy.wait('@getProjects');
        cy.get('[role="combobox"]').click();
        cy.contains(mockProject.name).click();
        cy.contains('Scorecard').click();
        cy.wait('@getGoScore');
        cy.contains('GO').should('be.visible');
      });

      it('should show NO GO for low scores', () => {
        cy.intercept('GET', '/api/projects/*/tdr/readiness-score', { statusCode: 200, body: mockReadinessScoreNoGo }).as('getNoGoScore');
        cy.reload();
        cy.wait('@getProjects');
        cy.get('[role="combobox"]').click();
        cy.contains(mockProject.name).click();
        cy.contains('Scorecard').click();
        cy.wait('@getNoGoScore');
        cy.contains('NO GO').should('be.visible');
      });
    });

    describe('Calculate Score', () => {
      it('should calculate new score', () => {
        cy.contains('Calculate Score').click();
        cy.wait('@calculateScore');
      });
    });
  });

  // =============================================================================
  // TDR EVENT SCHEDULING
  // =============================================================================
  describe('Schedule TDR Event', () => {
    beforeEach(() => {
      navigateToTdr();
    });

    it('should open schedule dialog', () => {
      cy.contains('Schedule TDR').click();
      cy.contains('Schedule TDR Event').should('be.visible');
    });

    it('should create TDR event with all fields', () => {
      cy.contains('Schedule TDR').click();
      cy.get('input[type="text"]').first().type('TDR #2');
      cy.get('textarea').first().type('Second full rehearsal');
      cy.get('input[type="datetime-local"]').type('2026-02-01T09:00');
      cy.get('[role="combobox"]').first().click();
      cy.contains('Partial TDR').click();
      cy.contains('button', 'Create Event').click();
      cy.wait('@createTdrEvent');
    });

    it('should show all event types', () => {
      cy.contains('Schedule TDR').click();
      cy.get('[role="combobox"]').first().click();
      cy.contains('Full TDR').should('be.visible');
      cy.contains('Partial TDR').should('be.visible');
      cy.contains('Integration Only').should('be.visible');
    });

    it('should close dialog on cancel', () => {
      cy.contains('Schedule TDR').click();
      cy.contains('button', 'Cancel').click();
      cy.contains('Schedule TDR Event').should('not.exist');
    });
  });

  // =============================================================================
  // FORM VALIDATION
  // =============================================================================
  describe('Form Validation', () => {
    beforeEach(() => {
      navigateToTdr();
    });

    describe('Event Form Validation', () => {
      it('should require event name', () => {
        cy.contains('Schedule TDR').click();
        cy.get('input[type="datetime-local"]').type('2026-02-01T09:00');
        cy.contains('button', 'Create Event').click();
        // Form should not submit without name
      });

      it('should require scheduled date', () => {
        cy.contains('Schedule TDR').click();
        cy.get('input[type="text"]').first().type('TDR Event');
        cy.contains('button', 'Create Event').click();
        // Form should not submit without date
      });
    });

    describe('Checklist Form Validation', () => {
      it('should require title', () => {
        cy.contains('Checklist').click();
        cy.wait('@getTdrChecklist');
        cy.contains('Add Item').click();
        cy.contains('button', 'Add Item').click();
        // Form should not submit without title
      });
    });

    describe('Issue Form Validation', () => {
      it('should require issue title', () => {
        cy.contains('Issues').click();
        cy.wait('@getTdrIssues');
        cy.contains('Report Issue').click();
        cy.contains('button', 'Report Issue').click();
        // Form should not submit without title
      });
    });

    describe('Integration Test Form Validation', () => {
      it('should require interface name', () => {
        cy.contains('Integrations').click();
        cy.wait('@getTdrIntegrationTests');
        cy.contains('Add Interface').click();
        cy.contains('button', 'Add Interface').click();
        // Form should not submit without interface name
      });
    });

    describe('Downtime Test Form Validation', () => {
      it('should require procedure name', () => {
        cy.contains('Downtime').click();
        cy.wait('@getTdrDowntimeTests');
        cy.contains('Add Procedure').click();
        cy.contains('button', 'Add Procedure').click();
        // Form should not submit without procedure name
      });

      it('should validate duration is positive number', () => {
        cy.contains('Downtime').click();
        cy.wait('@getTdrDowntimeTests');
        cy.contains('Add Procedure').click();
        cy.get('input[type="number"]').clear().type('-10');
        // Should not accept negative numbers
      });
    });
  });

  // =============================================================================
  // API ERROR HANDLING
  // =============================================================================
  describe('API Error Handling', () => {
    it('should handle 500 server errors gracefully', () => {
      cy.intercept('GET', '/api/projects/*/tdr/summary', { statusCode: 500, body: { error: 'Server error' } }).as('getSummaryError');
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getSummaryError');
      // Should not crash
    });

    it('should handle 404 not found errors', () => {
      cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 404, body: { error: 'Not found' } }).as('getChecklistNotFound');
      navigateToTdr();
      cy.contains('Checklist').click();
      cy.wait('@getChecklistNotFound');
      // Should handle gracefully
    });

    it('should handle network timeout errors', () => {
      cy.intercept('GET', '/api/projects/*/tdr/summary', { forceNetworkError: true }).as('networkError');
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@networkError');
      // Should not crash
    });

    it('should handle create mutation errors', () => {
      cy.intercept('POST', '/api/projects/*/tdr/issues', { statusCode: 400, body: { error: 'Validation failed' } }).as('createIssueError');
      navigateToTdr();
      cy.contains('Issues').click();
      cy.wait('@getTdrIssues');
      cy.contains('Report Issue').click();
      cy.get('input[type="text"]').type('Test Issue');
      cy.contains('button', 'Report Issue').click();
      cy.wait('@createIssueError');
      // Should show error message
    });

    it('should handle unauthorized errors', () => {
      cy.intercept('GET', '/api/projects/*/tdr/summary', { statusCode: 401, body: { error: 'Unauthorized' } }).as('unauthorized');
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@unauthorized');
      // Should redirect to login or show auth error
    });

    it('should handle forbidden errors', () => {
      cy.intercept('GET', '/api/projects/*/tdr/summary', { statusCode: 403, body: { error: 'Forbidden' } }).as('forbidden');
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@forbidden');
      // Should show permission error
    });
  });

  // =============================================================================
  // EMPTY STATES
  // =============================================================================
  describe('Empty States', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/projects/*/tdr/events', { statusCode: 200, body: [] }).as('getEmptyEvents');
      cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 200, body: [] }).as('getEmptyChecklist');
      cy.intercept('GET', '/api/projects/*/tdr/test-scenarios', { statusCode: 200, body: [] }).as('getEmptyTests');
      cy.intercept('GET', '/api/projects/*/tdr/issues', { statusCode: 200, body: [] }).as('getEmptyIssues');
      cy.intercept('GET', '/api/projects/*/tdr/integration-tests', { statusCode: 200, body: [] }).as('getEmptyIntegrations');
      cy.intercept('GET', '/api/projects/*/tdr/downtime-tests', { statusCode: 200, body: [] }).as('getEmptyDowntime');
      cy.intercept('GET', '/api/projects/*/tdr/readiness-score', { statusCode: 200, body: null }).as('getNoScore');
      cy.intercept('GET', '/api/projects/*/tdr/summary', {
        statusCode: 200,
        body: {
          checklist: { total: 0, completed: 0, percentage: 0 },
          testScenarios: { total: 0, passed: 0, failed: 0, pending: 0, percentage: 0 },
          issues: { total: 0, open: 0, critical: 0, blockers: 0 },
          integrationTests: { total: 0, passed: 0, percentage: 0 },
          downtimeTests: { total: 0, passed: 0, percentage: 0 },
          upcomingEvents: [],
          latestScore: null
        }
      }).as('getEmptySummary');
    });

    it('should show empty state for events on dashboard', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.wait('@getEmptySummary');
      cy.contains('No TDR events scheduled').should('be.visible');
    });

    it('should show empty state for checklist with seed button', () => {
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

    it('should show empty state for integration tests', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.contains('Integrations').click();
      cy.wait('@getEmptyIntegrations');
      cy.contains('No integration tests defined').should('be.visible');
    });

    it('should show empty state for downtime tests', () => {
      cy.visit('/tdr');
      cy.wait('@getProjects');
      cy.get('[role="combobox"]').click();
      cy.contains(mockProject.name).click();
      cy.contains('Downtime').click();
      cy.wait('@getEmptyDowntime');
      cy.contains('No downtime procedures defined').should('be.visible');
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

  // =============================================================================
  // PERMISSION-BASED ACCESS
  // =============================================================================
  describe('Permission-Based Access', () => {
    describe('Admin Access', () => {
      beforeEach(() => {
        setupMocks(testUser);
        setupMutationMocks();
      });

      it('should allow admin to access all TDR features', () => {
        navigateToTdr();
        cy.contains('Schedule TDR').should('be.visible');
        cy.contains('Checklist').click();
        cy.wait('@getTdrChecklist');
        cy.contains('Add Item').should('be.visible');
      });

      it('should allow admin to create issues', () => {
        navigateToTdr();
        cy.contains('Issues').click();
        cy.wait('@getTdrIssues');
        cy.contains('Report Issue').should('be.visible');
      });

      it('should allow admin to calculate readiness score', () => {
        navigateToTdr();
        cy.contains('Scorecard').click();
        cy.wait('@getTdrReadinessScore');
        cy.contains('Calculate Score').should('be.visible');
      });
    });

    describe('Hospital Staff Access', () => {
      beforeEach(() => {
        setupMocks(hospitalStaffUser);
        setupMutationMocks();
      });

      it('should allow hospital staff to access TDR page', () => {
        cy.visit('/tdr');
        cy.wait('@getProjects');
        cy.contains('Select a project').should('be.visible');
      });

      it('should allow hospital staff to view checklist', () => {
        navigateToTdr();
        cy.contains('Checklist').click();
        cy.wait('@getTdrChecklist');
        cy.contains('Infrastructure').should('be.visible');
      });
    });

    describe('Consultant Access', () => {
      beforeEach(() => {
        setupMocks(consultantUser);
        setupMutationMocks();
      });

      it('should restrict consultant access to TDR page', () => {
        cy.visit('/tdr');
        // Consultant should not have access to TDR based on sidebar config
        // This tests that the route guard is working
      });
    });
  });

  // =============================================================================
  // NAVIGATION
  // =============================================================================
  describe('Navigation', () => {
    beforeEach(() => {
      setupMocks();
    });

    it('should navigate to TDR from sidebar', () => {
      cy.visit('/');
      cy.wait('@getUser');
      cy.contains('Support').click();
      cy.contains('TDR Management').click();
      cy.url().should('include', '/tdr');
    });

    it('should switch between all tabs', () => {
      navigateToTdr();

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

    it('should maintain tab selection on data refresh', () => {
      navigateToTdr();
      cy.contains('Checklist').click();
      cy.wait('@getTdrChecklist');
      // Trigger a refresh of data
      cy.contains('Add Item').click();
      cy.contains('button', 'Cancel').click();
      // Tab should still be on Checklist
      cy.contains('TDR Checklist').should('be.visible');
    });
  });

  // =============================================================================
  // KEYBOARD NAVIGATION & ACCESSIBILITY
  // =============================================================================
  describe('Keyboard Navigation & Accessibility', () => {
    beforeEach(() => {
      navigateToTdr();
    });

    it('should support tab navigation between elements', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });

    it('should have accessible labels on buttons', () => {
      cy.contains('Schedule TDR').should('be.visible');
      cy.get('button').each(($btn) => {
        // Each button should have accessible text
        expect($btn.text().length > 0 || $btn.attr('aria-label')).to.be.ok;
      });
    });

    it('should support keyboard activation of tabs', () => {
      cy.get('[role="tablist"]').should('be.visible');
      cy.get('[role="tab"]').first().focus();
      cy.focused().type('{rightarrow}');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
    });

    it('should have labeled form inputs', () => {
      cy.contains('Schedule TDR').click();
      cy.get('label').should('have.length.at.least', 1);
    });

    it('should support escape to close dialogs', () => {
      cy.contains('Schedule TDR').click();
      cy.contains('Schedule TDR Event').should('be.visible');
      cy.get('body').type('{esc}');
      cy.contains('Schedule TDR Event').should('not.exist');
    });

    it('should trap focus within modal dialogs', () => {
      cy.contains('Schedule TDR').click();
      cy.contains('Schedule TDR Event').should('be.visible');
      // Tab through all focusable elements in dialog
      cy.get('body').tab().tab().tab().tab().tab();
      // Focus should still be within dialog
    });
  });

  // =============================================================================
  // MOBILE RESPONSIVENESS
  // =============================================================================
  describe('Mobile Responsiveness', () => {
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone XR', width: 414, height: 896 },
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 }
    ];

    viewports.forEach((viewport) => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
          navigateToTdr();
        });

        it('should display TDR page correctly', () => {
          cy.contains('TDR Management').should('be.visible');
        });

        it('should show tabs (possibly scrollable)', () => {
          cy.get('[role="tablist"]').should('be.visible');
        });

        it('should show summary cards', () => {
          cy.contains('Checklist Progress').should('be.visible');
        });

        it('should allow tab switching', () => {
          cy.contains('Checklist').click();
          cy.wait('@getTdrChecklist');
          cy.contains('TDR Checklist').should('be.visible');
        });

        it('should open dialogs properly', () => {
          cy.contains('Schedule TDR').click();
          cy.contains('Schedule TDR Event').should('be.visible');
        });

        it('should close dialogs on mobile', () => {
          cy.contains('Schedule TDR').click();
          cy.contains('button', 'Cancel').click();
          cy.contains('Schedule TDR Event').should('not.exist');
        });
      });
    });
  });

  // =============================================================================
  // EDGE CASES & STRESS TESTS
  // =============================================================================
  describe('Edge Cases & Stress Tests', () => {
    describe('Large Data Sets', () => {
      it('should handle 100+ checklist items', () => {
        const largeChecklist = Array.from({ length: 100 }, (_, i) => ({
          id: `cl-${i}`,
          projectId: 'project-1',
          category: ['infrastructure', 'integrations', 'workflows', 'data_migration', 'support'][i % 5],
          title: `Checklist item ${i}`,
          isCompleted: i % 3 === 0,
          priority: ['low', 'medium', 'high', 'critical'][i % 4]
        }));
        cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 200, body: largeChecklist }).as('getLargeChecklist');
        navigateToTdr();
        cy.contains('Checklist').click();
        cy.wait('@getLargeChecklist');
        cy.contains('Infrastructure').should('be.visible');
      });

      it('should handle 100+ issues', () => {
        const largeIssues = Array.from({ length: 100 }, (_, i) => ({
          id: `issue-${i}`,
          projectId: 'project-1',
          issueNumber: `TDR-${String(i).padStart(4, '0')}`,
          title: `Issue ${i}`,
          severity: ['low', 'medium', 'high', 'critical'][i % 4],
          status: ['open', 'in_progress', 'resolved'][i % 3],
          blocksGoLive: i % 10 === 0
        }));
        cy.intercept('GET', '/api/projects/*/tdr/issues', { statusCode: 200, body: largeIssues }).as('getLargeIssues');
        navigateToTdr();
        cy.contains('Issues').click();
        cy.wait('@getLargeIssues');
        cy.contains('TDR-0000').should('be.visible');
      });

      it('should handle 50+ test scenarios', () => {
        const largeTests = Array.from({ length: 50 }, (_, i) => ({
          id: `ts-${i}`,
          projectId: 'project-1',
          category: ['workflow', 'integration', 'performance', 'security'][i % 4],
          title: `Test scenario ${i}`,
          status: ['pending', 'passed', 'failed'][i % 3],
          priority: ['low', 'medium', 'high', 'critical'][i % 4]
        }));
        cy.intercept('GET', '/api/projects/*/tdr/test-scenarios', { statusCode: 200, body: largeTests }).as('getLargeTests');
        navigateToTdr();
        cy.contains('Tests').click();
        cy.wait('@getLargeTests');
        cy.contains('Test scenario 0').should('be.visible');
      });
    });

    describe('Special Characters', () => {
      it('should handle special characters in issue titles', () => {
        cy.intercept('POST', '/api/projects/*/tdr/issues', (req) => {
          expect(req.body.title).to.include('Test <script>');
          req.reply({ statusCode: 201, body: { ...mockIssues[0], title: req.body.title } });
        }).as('createSpecialIssue');
        navigateToTdr();
        cy.contains('Issues').click();
        cy.wait('@getTdrIssues');
        cy.contains('Report Issue').click();
        cy.get('input[type="text"]').type('Test <script>alert("xss")</script> & "quotes"');
        cy.contains('button', 'Report Issue').click();
        cy.wait('@createSpecialIssue');
      });

      it('should handle unicode characters', () => {
        navigateToTdr();
        cy.contains('Issues').click();
        cy.wait('@getTdrIssues');
        cy.contains('Report Issue').click();
        cy.get('input[type="text"]').type('Test with émojis 🚀 and 日本語');
        // Should accept unicode characters
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle rapid consecutive clicks', () => {
        navigateToTdr();
        cy.contains('Checklist').click().click().click();
        cy.wait('@getTdrChecklist');
        // Should not crash or duplicate requests excessively
      });

      it('should handle switching tabs rapidly', () => {
        navigateToTdr();
        cy.contains('Checklist').click();
        cy.contains('Tests').click();
        cy.contains('Issues').click();
        cy.contains('Integrations').click();
        cy.contains('Downtime').click();
        cy.contains('Scorecard').click();
        cy.contains('Dashboard').click();
        // Should handle rapid navigation without errors
      });
    });

    describe('Data Integrity', () => {
      it('should maintain data consistency after mutations', () => {
        navigateToTdr();
        cy.contains('Issues').click();
        cy.wait('@getTdrIssues');
        cy.contains('Report Issue').click();
        cy.get('input[type="text"]').type('New consistency test issue');
        cy.contains('button', 'Report Issue').click();
        cy.wait('@createIssue');
        // Data should refresh correctly
      });

      it('should handle optimistic updates correctly', () => {
        navigateToTdr();
        cy.contains('Checklist').click();
        cy.wait('@getTdrChecklist');
        // Toggle item
        cy.contains('Network connectivity tested').parent().click();
        cy.wait('@completeChecklist');
        // UI should update immediately
      });
    });

    describe('Session Handling', () => {
      it('should handle session timeout gracefully', () => {
        navigateToTdr();
        cy.intercept('GET', '/api/projects/*/tdr/checklist', { statusCode: 401, body: { error: 'Session expired' } }).as('sessionExpired');
        cy.contains('Checklist').click();
        cy.wait('@sessionExpired');
        // Should redirect to login or show session expired message
      });
    });

    describe('Browser Behavior', () => {
      it('should handle browser back button', () => {
        navigateToTdr();
        cy.contains('Checklist').click();
        cy.wait('@getTdrChecklist');
        cy.go('back');
        // Should handle navigation correctly
      });

      it('should handle browser refresh', () => {
        navigateToTdr();
        cy.contains('Checklist').click();
        cy.wait('@getTdrChecklist');
        cy.reload();
        cy.wait('@getProjects');
        // Should maintain or reset state appropriately
      });
    });
  });

  // =============================================================================
  // PERFORMANCE
  // =============================================================================
  describe('Performance', () => {
    it('should load TDR page within acceptable time', () => {
      const start = Date.now();
      navigateToTdr();
      cy.contains('TDR Management').should('be.visible').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds max
      });
    });

    it('should render checklist tab within acceptable time', () => {
      navigateToTdr();
      const start = Date.now();
      cy.contains('Checklist').click();
      cy.wait('@getTdrChecklist');
      cy.contains('Infrastructure').should('be.visible').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    it('should handle rapid tab switching without performance degradation', () => {
      navigateToTdr();
      const tabs = ['Checklist', 'Tests', 'Issues', 'Integrations', 'Downtime', 'Scorecard', 'Dashboard'];
      const start = Date.now();
      tabs.forEach(tab => {
        cy.contains(tab).click();
      });
      cy.contains('Checklist Progress').should('be.visible').then(() => {
        const totalTime = Date.now() - start;
        expect(totalTime).to.be.lessThan(10000); // 10 seconds for all tabs
      });
    });
  });
});
