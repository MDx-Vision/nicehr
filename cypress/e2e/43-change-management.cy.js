// Change Management E2E Tests
// Comprehensive test suite for the Change Management module

describe('Change Management Module', () => {
  const mockProject = {
    id: 'test-project-1',
    name: 'Memorial Hospital Epic Implementation',
    status: 'active',
  };

  const mockChangeRequests = [
    {
      id: 'cr-1',
      projectId: 'test-project-1',
      requestNumber: 'CR-2026-0001',
      title: 'Add additional training module',
      description: 'Request to add clinical documentation training module for nursing staff',
      category: 'training',
      priority: 'medium',
      status: 'draft',
      impactLevel: 'moderate',
      requestedById: 'user-1',
      requestedByName: 'John Doe',
      justification: 'Nursing staff require additional training on clinical documentation',
      proposedSolution: 'Create a 4-hour module covering documentation best practices',
      estimatedEffort: '40 hours',
      estimatedCost: '$5,000',
      targetImplementationDate: '2026-02-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cr-2',
      projectId: 'test-project-1',
      requestNumber: 'CR-2026-0002',
      title: 'Extend go-live timeline by 2 weeks',
      description: 'Request to extend the project go-live date by 2 weeks due to integration issues',
      category: 'timeline',
      priority: 'high',
      status: 'submitted',
      impactLevel: 'significant',
      requestedById: 'user-2',
      requestedByName: 'Jane Smith',
      justification: 'Integration testing revealed critical issues that need more time to resolve',
      proposedSolution: 'Extend timeline from March 1 to March 15',
      estimatedEffort: '80 hours',
      estimatedCost: '$15,000',
      targetImplementationDate: '2026-03-01',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cr-3',
      projectId: 'test-project-1',
      requestNumber: 'CR-2026-0003',
      title: 'Increase budget for hardware',
      description: 'Request to increase hardware budget by $50,000 for additional workstations',
      category: 'budget',
      priority: 'critical',
      status: 'approved',
      impactLevel: 'major',
      requestedById: 'user-1',
      requestedByName: 'John Doe',
      justification: 'Additional workstations needed in emergency department',
      proposedSolution: 'Procure 20 additional clinical workstations',
      estimatedEffort: '24 hours',
      estimatedCost: '$50,000',
      targetImplementationDate: '2026-02-01',
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      decidedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cr-4',
      projectId: 'test-project-1',
      requestNumber: 'CR-2026-0004',
      title: 'Change interface protocol from HL7 to FHIR',
      description: 'Request to change the lab interface from HL7 v2 to FHIR R4',
      category: 'technical',
      priority: 'high',
      status: 'rejected',
      impactLevel: 'major',
      requestedById: 'user-3',
      requestedByName: 'Bob Wilson',
      justification: 'Lab vendor supports FHIR better than HL7 v2',
      proposedSolution: 'Rebuild interface using FHIR R4 specification',
      estimatedEffort: '200 hours',
      estimatedCost: '$75,000',
      targetImplementationDate: '2026-04-01',
      submittedAt: new Date(Date.now() - 172800000).toISOString(),
      decidedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cr-5',
      projectId: 'test-project-1',
      requestNumber: 'CR-2026-0005',
      title: 'Deploy additional support staff',
      description: 'Request for 2 additional consultants during go-live week',
      category: 'resource',
      priority: 'medium',
      status: 'implemented',
      impactLevel: 'moderate',
      requestedById: 'user-2',
      requestedByName: 'Jane Smith',
      justification: 'Additional support needed in pharmacy and radiology',
      proposedSolution: 'Assign 2 experienced consultants for go-live support',
      estimatedEffort: '80 hours',
      estimatedCost: '$12,000',
      targetImplementationDate: '2026-03-01',
      submittedAt: new Date(Date.now() - 432000000).toISOString(),
      decidedAt: new Date(Date.now() - 345600000).toISOString(),
      implementedAt: new Date(Date.now() - 172800000).toISOString(),
      actualImplementationDate: new Date(Date.now() - 172800000).toISOString(),
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockStats = {
    total: 5,
    pendingApprovals: 1,
    byStatus: {
      draft: 1,
      submitted: 1,
      approved: 1,
      rejected: 1,
      implemented: 1,
    },
    byPriority: {
      medium: 2,
      high: 2,
      critical: 1,
    },
    byCategory: {
      training: 1,
      timeline: 1,
      budget: 1,
      technical: 1,
      resource: 1,
    },
    recentRequests: mockChangeRequests.slice(0, 5),
  };

  const mockImpacts = [
    {
      id: 'impact-1',
      changeRequestId: 'cr-2',
      impactArea: 'schedule',
      description: 'Go-live date will be delayed by 2 weeks',
      severity: 'high',
    },
    {
      id: 'impact-2',
      changeRequestId: 'cr-2',
      impactArea: 'budget',
      description: 'Additional consulting fees of approximately $15,000',
      severity: 'medium',
    },
  ];

  const mockApprovals = [
    {
      id: 'approval-1',
      changeRequestId: 'cr-3',
      approverId: 'user-admin',
      approverName: 'Admin User',
      approverRole: 'admin',
      decision: 'approved',
      comments: 'Approved - critical for go-live success',
      decidedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'approval-2',
      changeRequestId: 'cr-4',
      approverId: 'user-admin',
      approverName: 'Admin User',
      approverRole: 'admin',
      decision: 'rejected',
      comments: 'Too risky to change interface protocol at this stage',
      decidedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  const mockComments = [
    {
      id: 'comment-1',
      changeRequestId: 'cr-2',
      authorId: 'user-1',
      authorName: 'John Doe',
      content: 'I support this timeline extension request',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'comment-2',
      changeRequestId: 'cr-2',
      authorId: 'user-2',
      authorName: 'Jane Smith',
      content: 'The integration issues are documented in the TDR module',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const mockRequestDetails = {
    ...mockChangeRequests[1],
    impacts: mockImpacts,
    approvals: [],
    comments: mockComments,
  };

  beforeEach(() => {
    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: { id: 'test-user', email: 'admin@test.com', firstName: 'Test', lastName: 'Admin', role: 'admin' }
    }).as('getUser');

    // Mock project list
    cy.intercept('GET', '/api/projects', { body: [mockProject] }).as('getProjects');

    // Mock change requests list
    cy.intercept('GET', '/api/projects/test-project-1/change-requests*', (req) => {
      let filtered = [...mockChangeRequests];
      const url = new URL(req.url, 'http://localhost');
      const status = url.searchParams.get('status');
      const category = url.searchParams.get('category');
      const priority = url.searchParams.get('priority');

      if (status) {
        filtered = filtered.filter(r => r.status === status);
      }
      if (category) {
        filtered = filtered.filter(r => r.category === category);
      }
      if (priority) {
        filtered = filtered.filter(r => r.priority === priority);
      }

      req.reply({ body: filtered });
    }).as('getChangeRequests');

    // Mock stats
    cy.intercept('GET', '/api/projects/test-project-1/change-requests/stats', {
      body: mockStats,
    }).as('getStats');

    // Mock single change request with details
    cy.intercept('GET', '/api/projects/test-project-1/change-requests/cr-2', {
      body: mockRequestDetails,
    }).as('getRequestDetails');

    // Mock create change request
    cy.intercept('POST', '/api/projects/test-project-1/change-requests', (req) => {
      const newRequest = {
        id: 'cr-new',
        ...req.body,
        requestNumber: 'CR-2026-0006',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      req.reply({ body: newRequest, statusCode: 201 });
    }).as('createChangeRequest');

    // Mock update change request
    cy.intercept('PATCH', '/api/projects/test-project-1/change-requests/*', (req) => {
      req.reply({ body: { ...mockChangeRequests[0], ...req.body } });
    }).as('updateChangeRequest');

    // Mock delete change request
    cy.intercept('DELETE', '/api/projects/test-project-1/change-requests/*', {
      statusCode: 204,
    }).as('deleteChangeRequest');

    // Mock workflow actions
    cy.intercept('POST', '/api/change-requests/*/submit', (req) => {
      req.reply({ body: { ...mockChangeRequests[0], status: 'submitted', submittedAt: new Date().toISOString() } });
    }).as('submitRequest');

    cy.intercept('POST', '/api/change-requests/*/approve', (req) => {
      req.reply({
        body: {
          request: { ...mockChangeRequests[1], status: 'approved', decidedAt: new Date().toISOString() },
          approval: { id: 'approval-new', ...req.body, decision: 'approved', decidedAt: new Date().toISOString() },
        },
      });
    }).as('approveRequest');

    cy.intercept('POST', '/api/change-requests/*/reject', (req) => {
      req.reply({
        body: {
          request: { ...mockChangeRequests[1], status: 'rejected', decidedAt: new Date().toISOString() },
          approval: { id: 'approval-new', ...req.body, decision: 'rejected', decidedAt: new Date().toISOString() },
        },
      });
    }).as('rejectRequest');

    cy.intercept('POST', '/api/change-requests/*/implement', (req) => {
      req.reply({
        body: { ...mockChangeRequests[2], status: 'implemented', implementedAt: new Date().toISOString() },
      });
    }).as('implementRequest');

    // Mock add comment
    cy.intercept('POST', '/api/change-requests/*/comments', (req) => {
      req.reply({
        body: { id: 'comment-new', ...req.body, createdAt: new Date().toISOString() },
        statusCode: 201,
      });
    }).as('addComment');

    // Visit the page
    cy.visit('/change-management');
    cy.wait('@getProjects');
  });

  describe('Page Load and Navigation', () => {
    it('should display the page title and description', () => {
      cy.contains('h1', 'Change Management').should('be.visible');
      cy.contains('Track and manage project change requests').should('be.visible');
    });

    it('should display the project selector', () => {
      cy.get('[data-testid="project-selector"]').should('be.visible');
    });

    it('should show message when no project selected', () => {
      cy.contains('Select a Project').should('be.visible');
      cy.contains('Choose a project from the dropdown above').should('be.visible');
    });

    it('should load change requests after selecting a project', () => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');
      cy.wait('@getStats');
    });

    it('should display tabs after selecting a project', () => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();

      cy.get('[role="tablist"]').within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('All Requests').should('be.visible');
        cy.contains('My Requests').should('be.visible');
        cy.contains('Pending Approvals').should('be.visible');
      });
    });

    it('should show New Change Request button after selecting project', () => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();

      cy.get('[data-testid="create-change-request"]').should('be.visible');
    });
  });

  describe('Dashboard Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getStats');
    });

    it('should display statistics cards', () => {
      cy.contains('Total Requests').should('be.visible');
      cy.contains('Pending Approvals').should('be.visible');
      cy.contains('Approved').should('be.visible');
      cy.contains('Implemented').should('be.visible');
    });

    it('should display correct total count', () => {
      cy.contains('Total Requests').parent().parent().contains('5').should('be.visible');
    });

    it('should display pending approvals count', () => {
      cy.contains('Pending Approvals').parent().parent().contains('1').should('be.visible');
    });

    it('should display status distribution', () => {
      cy.contains('By Status').should('be.visible');
      cy.contains('draft').should('be.visible');
      cy.contains('submitted').should('be.visible');
      cy.contains('approved').should('be.visible');
    });

    it('should display priority distribution', () => {
      cy.contains('By Priority').should('be.visible');
      cy.contains('medium').should('be.visible');
      cy.contains('high').should('be.visible');
      cy.contains('critical').should('be.visible');
    });

    it('should display recent change requests', () => {
      cy.contains('Recent Change Requests').should('be.visible');
      cy.contains('Add additional training module').should('be.visible');
      cy.contains('CR-2026-0001').should('be.visible');
    });

    it('should be able to click on recent request to view details', () => {
      cy.contains('Add additional training module').click();
    });
  });

  describe('All Requests Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should display search input', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
    });

    it('should display filter dropdowns', () => {
      cy.get('[data-testid="status-filter"]').should('be.visible');
      cy.get('[data-testid="category-filter"]').should('be.visible');
      cy.get('[data-testid="priority-filter"]').should('be.visible');
    });

    it('should display list of change requests', () => {
      cy.contains('Add additional training module').should('be.visible');
      cy.contains('Extend go-live timeline by 2 weeks').should('be.visible');
      cy.contains('Increase budget for hardware').should('be.visible');
    });

    it('should display request numbers', () => {
      cy.contains('CR-2026-0001').should('be.visible');
      cy.contains('CR-2026-0002').should('be.visible');
      cy.contains('CR-2026-0003').should('be.visible');
    });

    it('should display status badges', () => {
      cy.contains('draft').should('be.visible');
      cy.contains('submitted').should('be.visible');
      cy.contains('approved').should('be.visible');
    });

    it('should display priority badges', () => {
      cy.contains('medium').should('be.visible');
      cy.contains('high').should('be.visible');
      cy.contains('critical').should('be.visible');
    });

    it('should display requester names', () => {
      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('be.visible');
    });

    it('should filter by search query', () => {
      cy.get('[data-testid="search-input"]').type('training');
      cy.contains('Add additional training module').should('be.visible');
      cy.contains('Extend go-live timeline').should('not.exist');
    });

    it('should filter by status', () => {
      cy.get('[data-testid="status-filter"]').click({ force: true });
      cy.get('[role="listbox"]').contains('Draft').click();
      cy.wait('@getChangeRequests');
    });

    it('should filter by category', () => {
      cy.get('[data-testid="category-filter"]').click({ force: true });
      cy.get('[role="listbox"]').contains('Budget').click();
      cy.wait('@getChangeRequests');
    });

    it('should filter by priority', () => {
      cy.get('[data-testid="priority-filter"]').click({ force: true });
      cy.get('[role="listbox"]').contains('Critical').click();
      cy.wait('@getChangeRequests');
    });

    it('should show Submit button for draft requests', () => {
      cy.get('[data-testid="submit-cr-1"]').should('be.visible');
    });

    it('should show Approve/Reject buttons for submitted requests', () => {
      cy.get('[data-testid="approve-cr-2"]').should('be.visible');
      cy.get('[data-testid="reject-cr-2"]').should('be.visible');
    });

    it('should show Implement button for approved requests', () => {
      cy.get('[data-testid="implement-cr-3"]').should('be.visible');
    });
  });

  describe('My Requests Tab', () => {
    beforeEach(() => {
      // Mock requests to filter by current user
      cy.intercept('GET', '/api/projects/test-project-1/change-requests*', {
        body: mockChangeRequests.filter(r => r.requestedById === 'dev-user-local'),
      }).as('getMyRequests');

      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();

      cy.get('[role="tablist"]').within(() => {
        cy.contains('My Requests').click();
      });
    });

    it('should display My Change Requests title', () => {
      cy.contains('My Change Requests').should('be.visible');
    });

    it('should display description', () => {
      cy.contains('Change requests you have submitted').should('be.visible');
    });
  });

  describe('Pending Approvals Tab', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('Pending Approvals').click();
      });
    });

    it('should display Pending Approvals title', () => {
      cy.contains('Pending Approvals').should('be.visible');
    });

    it('should display description', () => {
      cy.contains('Change requests awaiting your review').should('be.visible');
    });

    it('should display submitted requests', () => {
      cy.contains('Extend go-live timeline by 2 weeks').should('be.visible');
    });

    it('should display request number and submitter', () => {
      cy.contains('CR-2026-0002').should('be.visible');
      cy.contains('Jane Smith').should('be.visible');
    });

    it('should have Approve and Reject buttons', () => {
      cy.contains('Approve').should('be.visible');
      cy.contains('Reject').should('be.visible');
    });
  });

  describe('Create Change Request', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[data-testid="create-change-request"]').click();
    });

    it('should open create dialog', () => {
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Create Change Request').should('be.visible');
    });

    it('should display form fields', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="title-input"]').should('be.visible');
        cy.get('[data-testid="category-select"]').should('be.visible');
        cy.get('[data-testid="priority-select"]').should('be.visible');
        cy.get('[data-testid="description-input"]').should('be.visible');
        cy.get('[data-testid="impact-select"]').should('be.visible');
        cy.get('[data-testid="target-date-input"]').should('be.visible');
        cy.get('[data-testid="justification-input"]').should('be.visible');
        cy.get('[data-testid="solution-input"]').should('be.visible');
        cy.get('[data-testid="effort-input"]').should('be.visible');
        cy.get('[data-testid="cost-input"]').should('be.visible');
      });
    });

    it('should have submit button disabled without required fields', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="submit-create"]').should('be.disabled');
      });
    });

    it('should enable submit button with required fields filled', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="title-input"]').type('New Test Request');
        cy.get('[data-testid="description-input"]').type('This is a test description');
        cy.get('[data-testid="submit-create"]').should('not.be.disabled');
      });
    });

    it('should create change request successfully', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="title-input"]').type('New Test Request');
        cy.get('[data-testid="description-input"]').type('This is a test description');
        cy.get('[data-testid="justification-input"]').type('Business justification here');
        cy.get('[data-testid="solution-input"]').type('Proposed solution here');
        cy.get('[data-testid="effort-input"]').type('20 hours');
        cy.get('[data-testid="cost-input"]').type('$3,000');
        cy.get('[data-testid="submit-create"]').click();
      });

      cy.wait('@createChangeRequest');
      cy.contains('Change request created successfully').should('be.visible');
    });

    it('should close dialog after successful creation', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="title-input"]').type('New Test Request');
        cy.get('[data-testid="description-input"]').type('This is a test description');
        cy.get('[data-testid="submit-create"]').click();
      });

      cy.wait('@createChangeRequest');
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('should allow selecting different categories', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="category-select"]').click({ force: true });
      });
      cy.get('[role="listbox"]').contains('Budget').click();
    });

    it('should allow selecting different priorities', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="priority-select"]').click({ force: true });
      });
      cy.get('[role="listbox"]').contains('Critical').click();
    });

    it('should allow selecting different impact levels', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="impact-select"]').click({ force: true });
      });
      cy.get('[role="listbox"]').contains('Major').click();
    });

    it('should close dialog on cancel', () => {
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Cancel').click();
      });
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('View Change Request Details', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should open view dialog when clicking eye icon', () => {
      cy.contains('Extend go-live timeline by 2 weeks')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .filter(':contains("")')
        .first()
        .click();

      cy.wait('@getRequestDetails');
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('should display request title and status in dialog header', () => {
      cy.contains('Extend go-live timeline by 2 weeks')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Extend go-live timeline by 2 weeks').should('be.visible');
        cy.contains('submitted').should('be.visible');
      });
    });

    it('should display request details', () => {
      cy.contains('Extend go-live timeline by 2 weeks')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Category').should('be.visible');
        cy.contains('Priority').should('be.visible');
        cy.contains('Impact Level').should('be.visible');
        cy.contains('Description').should('be.visible');
      });
    });

    it('should display comments section', () => {
      cy.contains('Extend go-live timeline by 2 weeks')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Comments').should('be.visible');
        cy.contains('I support this timeline extension request').should('be.visible');
      });
    });

    it('should allow adding a comment', () => {
      cy.contains('Extend go-live timeline by 2 weeks')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="comment-input"]').type('This is a new comment');
        cy.get('[data-testid="add-comment"]').click();
      });

      cy.wait('@addComment');
      cy.contains('Comment added').should('be.visible');
    });

    it('should close dialog on Close button', () => {
      cy.contains('Extend go-live timeline by 2 weeks')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Close').click();
      });

      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Workflow Actions - Submit', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should submit a draft request', () => {
      cy.get('[data-testid="submit-cr-1"]').click();
      cy.wait('@submitRequest');
      cy.contains('Change request submitted for review').should('be.visible');
    });
  });

  describe('Workflow Actions - Approve', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should open approval dialog when clicking Approve', () => {
      cy.get('[data-testid="approve-cr-2"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Approve Change Request').should('be.visible');
    });

    it('should display request info in approval dialog', () => {
      cy.get('[data-testid="approve-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.contains('Extend go-live timeline by 2 weeks').should('be.visible');
        cy.contains('CR-2026-0002').should('be.visible');
      });
    });

    it('should have comments input in approval dialog', () => {
      cy.get('[data-testid="approve-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="approval-comments"]').should('be.visible');
      });
    });

    it('should approve request with comments', () => {
      cy.get('[data-testid="approve-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="approval-comments"]').type('Approved with conditions');
        cy.get('[data-testid="confirm-approve"]').click();
      });

      cy.wait('@approveRequest');
      cy.contains('Change request approved').should('be.visible');
    });

    it('should close dialog after approval', () => {
      cy.get('[data-testid="approve-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="confirm-approve"]').click();
      });

      cy.wait('@approveRequest');
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  describe('Workflow Actions - Reject', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should open rejection dialog when clicking Reject', () => {
      cy.get('[data-testid="reject-cr-2"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('Reject Change Request').should('be.visible');
    });

    it('should require comments for rejection', () => {
      cy.get('[data-testid="reject-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="confirm-reject"]').should('be.disabled');
      });
    });

    it('should enable reject button when comments provided', () => {
      cy.get('[data-testid="reject-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="approval-comments"]').type('Cannot approve due to budget constraints');
        cy.get('[data-testid="confirm-reject"]').should('not.be.disabled');
      });
    });

    it('should reject request with comments', () => {
      cy.get('[data-testid="reject-cr-2"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="approval-comments"]').type('Cannot approve due to budget constraints');
        cy.get('[data-testid="confirm-reject"]').click();
      });

      cy.wait('@rejectRequest');
      cy.contains('Change request rejected').should('be.visible');
    });
  });

  describe('Workflow Actions - Implement', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should mark approved request as implemented', () => {
      cy.get('[data-testid="implement-cr-3"]').click();
      cy.wait('@implementRequest');
      cy.contains('Change request marked as implemented').should('be.visible');
    });
  });

  describe('Delete Change Request', () => {
    beforeEach(() => {
      // Mock request details for a draft request
      cy.intercept('GET', '/api/projects/test-project-1/change-requests/cr-1', {
        body: { ...mockChangeRequests[0], impacts: [], approvals: [], comments: [] },
      }).as('getDraftRequestDetails');

      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });
    });

    it('should show delete button for draft requests in view dialog', () => {
      cy.contains('Add additional training module')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getDraftRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="delete-request"]').should('be.visible');
      });
    });

    it('should delete draft request', () => {
      cy.contains('Add additional training module')
        .parents('[data-testid^="change-request-"]')
        .find('button')
        .first()
        .click();

      cy.wait('@getDraftRequestDetails');
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="delete-request"]').click();
      });

      cy.wait('@deleteChangeRequest');
      cy.contains('Change request deleted').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('POST', '/api/projects/test-project-1/change-requests', {
        statusCode: 500,
        body: { error: 'Internal server error' },
      }).as('createError');

      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[data-testid="create-change-request"]').click();
      cy.get('[role="dialog"]').within(() => {
        cy.get('[data-testid="title-input"]').type('Test Request');
        cy.get('[data-testid="description-input"]').type('Test Description');
        cy.get('[data-testid="submit-create"]').click();
      });

      cy.wait('@createError');
      cy.contains('Error creating change request').should('be.visible');
    });

    it('should show empty state when no requests exist', () => {
      cy.intercept('GET', '/api/projects/test-project-1/change-requests*', {
        body: [],
      }).as('getEmptyRequests');

      cy.intercept('GET', '/api/projects/test-project-1/change-requests/stats', {
        body: { total: 0, pendingApprovals: 0, byStatus: {}, byPriority: {}, byCategory: {}, recentRequests: [] },
      }).as('getEmptyStats');

      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getEmptyRequests');

      cy.contains('No change requests yet').should('be.visible');
    });

    it('should show no results when filter matches nothing', () => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').within(() => {
        cy.contains('All Requests').click();
      });

      // Search for something that won't match (client-side filtering)
      cy.get('[data-testid="search-input"]').type('nonexistent request xyz');
      cy.contains('No change requests found matching your filters').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/change-management');
      cy.wait('@getProjects');

      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.get('[role="listbox"]').contains('Memorial Hospital').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').should('be.visible');
      cy.get('[data-testid="create-change-request"]').should('be.visible');
    });

    it('should work on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.visit('/change-management');
      cy.wait('@getProjects');

      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.get('[role="listbox"]').contains('Memorial Hospital').click();
      cy.wait('@getChangeRequests');

      cy.get('[role="tablist"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.get('[data-testid="project-selector"]').click({ force: true });
      cy.contains('Memorial Hospital Epic Implementation').click();
      cy.wait('@getChangeRequests');
    });

    it('should have proper ARIA roles on tabs', () => {
      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('have.length.at.least', 4);
    });

    it('should have proper dialog roles', () => {
      cy.get('[data-testid="create-change-request"]').click();
      cy.get('[role="dialog"]').should('exist');
    });

    it('should support keyboard navigation in tabs', () => {
      cy.get('[role="tablist"]').within(() => {
        cy.contains('Dashboard').focus();
        cy.focused().type('{rightarrow}');
      });
    });
  });
});
