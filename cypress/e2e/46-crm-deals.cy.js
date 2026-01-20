/// <reference types="cypress" />

/**
 * CRM Deals E2E Tests
 * Tests for the Deals page with Kanban board
 */

describe('CRM Deals', () => {
  const mockPipeline = {
    id: 'pipeline-1',
    name: 'Healthcare Sales Pipeline',
    type: 'sales',
    isDefault: true,
    stages: [
      { id: 'stage-1', name: 'Lead', order: 1, probability: 10, stageType: 'open' },
      { id: 'stage-2', name: 'Qualified', order: 2, probability: 25, stageType: 'open' },
      { id: 'stage-3', name: 'Proposal', order: 3, probability: 50, stageType: 'open' },
      { id: 'stage-4', name: 'Negotiation', order: 4, probability: 75, stageType: 'open' },
      { id: 'stage-5', name: 'Closed Won', order: 5, probability: 100, stageType: 'won' },
      { id: 'stage-6', name: 'Closed Lost', order: 6, probability: 0, stageType: 'lost' }
    ]
  };

  const mockDeals = [
    {
      id: 1,
      name: 'EMR Implementation',
      amount: '250000',
      probability: 75,
      expectedCloseDate: '2024-06-30',
      pipelineId: 'pipeline-1',
      stageId: 'stage-4',
      companyId: 1,
      companyName: 'Memorial Health System',
      dealType: 'new_business',
      status: 'open',
      description: 'Full EMR implementation',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Staff Training Program',
      amount: '75000',
      probability: 50,
      expectedCloseDate: '2024-05-15',
      pipelineId: 'pipeline-1',
      stageId: 'stage-3',
      companyId: 1,
      companyName: 'Memorial Health System',
      dealType: 'upsell',
      status: 'open',
      description: 'Training program',
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: 3,
      name: 'Telemedicine Platform',
      amount: '180000',
      probability: 25,
      expectedCloseDate: '2024-08-01',
      pipelineId: 'pipeline-1',
      stageId: 'stage-2',
      companyId: 2,
      companyName: 'Valley Medical Center',
      dealType: 'new_business',
      status: 'open',
      description: 'Telemedicine solution',
      createdAt: '2024-02-01T10:00:00Z'
    }
  ];

  const mockCompanies = [
    { id: 1, name: 'Memorial Health System' },
    { id: 2, name: 'Valley Medical Center' }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: { id: 1, email: 'admin@test.com', firstName: 'Test', lastName: 'Admin', role: 'admin' }
    }).as('getUser');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { user: { id: 1, email: 'admin@test.com', role: 'admin' } }
    }).as('loginRequest');

    cy.intercept('GET', '/api/crm/pipelines*', {
      statusCode: 200,
      body: [mockPipeline]
    }).as('getPipelines');

    cy.intercept('GET', '/api/crm/deals*', {
      statusCode: 200,
      body: mockDeals
    }).as('getDeals');

    cy.intercept('GET', '/api/crm/companies*', {
      statusCode: 200,
      body: mockCompanies
    }).as('getCompanies');

    cy.intercept('GET', '/api/crm/activities*', {
      statusCode: 200,
      body: []
    }).as('getActivities');

    cy.intercept('POST', '/api/crm/deals', (req) => {
      req.reply({
        statusCode: 201,
        body: { id: 99, ...req.body, createdAt: new Date().toISOString() }
      });
    }).as('createDeal');

    cy.intercept('PATCH', '/api/crm/deals/*', (req) => {
      req.reply({
        statusCode: 200,
        body: { ...mockDeals[0], ...req.body }
      });
    }).as('updateDeal');

    cy.intercept('DELETE', '/api/crm/deals/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteDeal');

    // Login first
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('admin@test.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@loginRequest');
  });

  describe('Page Load and Display', () => {
    it('should display the deals page title', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="text-deals-title"]').should('contain', 'Deals');
    });

    it('should show add deal button', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').should('be.visible');
    });

    it('should show kanban view button', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-kanban"]').should('be.visible');
    });

    it('should show list view button', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').should('be.visible');
    });

    it('should display deals', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.contains('EMR Implementation').should('be.visible');
      cy.contains('Staff Training Program').should('be.visible');
    });

    it('should show pipeline stages', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.contains('Lead').should('be.visible');
      cy.contains('Qualified').should('be.visible');
      cy.contains('Proposal').should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    it('should have search input', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="input-search-deals"]').should('be.visible');
    });

    it('should have status filter', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="select-status-filter"]').should('be.visible');
    });

    it('should filter deals by search term', () => {
      cy.intercept('GET', '/api/crm/deals*search=EMR*', {
        statusCode: 200,
        body: [mockDeals[0]]
      }).as('searchDeals');

      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="input-search-deals"]').type('EMR');
      cy.wait('@searchDeals');
    });
  });

  describe('Create Deal', () => {
    it('should open create deal dialog', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.contains('Create New Deal').should('be.visible');
    });

    it('should have required form fields', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();

      cy.get('[data-testid="input-deal-name"]').should('be.visible');
      cy.get('[data-testid="input-amount"]').should('be.visible');
    });

    it('should have deal type selector', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('[data-testid="select-deal-type"]').should('be.visible');
    });

    it('should have probability input', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('[data-testid="input-probability"]').should('be.visible');
    });

    it('should have close date input', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('[data-testid="input-close-date"]').should('be.visible');
    });

    it('should create a new deal', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();

      cy.get('[data-testid="input-deal-name"]').type('New Healthcare Deal');
      cy.get('[data-testid="input-amount"]').type('100000');
      cy.get('[data-testid="input-probability"]').type('50');

      cy.get('[data-testid="button-create-deal"]').click();
      cy.wait('@createDeal');

      cy.contains('Create New Deal').should('not.exist');
    });

    it('should show success message after creation', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('[data-testid="input-deal-name"]').type('New Deal');
      cy.get('[data-testid="input-amount"]').type('50000');
      cy.get('[data-testid="button-create-deal"]').click();
      cy.wait('@createDeal');
      cy.contains('Deal created successfully').should('be.visible');
    });

    it('should cancel deal creation', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('[data-testid="input-deal-name"]').type('Test');
      cy.contains('button', 'Cancel').click();
      cy.contains('Create New Deal').should('not.exist');
    });
  });

  describe('Kanban View', () => {
    it('should display deal cards in kanban view', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="deal-card-1"]').should('be.visible');
    });

    it('should show deal amount on cards', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.contains('$250,000').should('be.visible');
    });

    it('should show company name on cards', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.contains('Memorial Health').should('be.visible');
    });
  });

  describe('List View', () => {
    it('should switch to list view', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="deal-row-1"]').should('be.visible');
    });

    it('should show deal actions in list view', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').should('be.visible');
    });
  });

  describe('Deal Actions Menu', () => {
    it('should open actions menu on click', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('View').should('be.visible');
      cy.contains('Edit').should('be.visible');
      cy.contains('Delete').should('be.visible');
    });
  });

  describe('View Deal Details', () => {
    it('should open view dialog', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('View').click();
      cy.contains('EMR Implementation').should('be.visible');
    });

    it('should show activities tab', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-deal-activities"]').should('be.visible');
    });

    it('should show tasks tab', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-deal-tasks"]').should('be.visible');
    });

    it('should show details tab', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-deal-details"]').should('be.visible');
    });

    it('should have log activity button', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="button-log-activity-from-deal-view"]').should('be.visible');
    });
  });

  describe('Edit Deal', () => {
    it('should open edit dialog', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('Edit').click();
      cy.contains('Edit Deal').should('be.visible');
    });

    it('should populate form with existing data', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('Edit').click();
      cy.get('input[name="name"]').should('have.value', 'EMR Implementation');
    });

    it('should update deal successfully', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('Edit').click();
      cy.get('input[name="amount"]').clear().type('300000');
      cy.contains('button', 'Save Changes').click();
      cy.wait('@updateDeal');
      cy.contains('Deal updated successfully').should('be.visible');
    });
  });

  describe('Delete Deal', () => {
    it('should delete deal', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-view-list"]').click();
      cy.get('[data-testid="button-deal-actions-1"]').click();
      cy.contains('Delete').click();
      cy.wait('@deleteDeal');
      cy.contains('Deal deleted successfully').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no deals', () => {
      cy.intercept('GET', '/api/crm/deals*', {
        statusCode: 200,
        body: []
      }).as('getEmptyDeals');

      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getEmptyDeals');
      // Switch to list view to see the empty state
      cy.get('[data-testid="button-view-list"]').click();
      cy.contains('No deals yet').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('h1').should('exist');
    });

    it('should have labeled form inputs', () => {
      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('label').should('have.length.at.least', 2);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/crm/deals*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getDealsError');

      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDealsError');
    });

    it('should handle create deal errors', () => {
      cy.intercept('POST', '/api/crm/deals', {
        statusCode: 400,
        body: { error: 'Validation failed' }
      }).as('createDealError');

      cy.visit('/crm/deals');
      cy.wait('@getPipelines');
      cy.wait('@getDeals');
      cy.get('[data-testid="button-add-deal"]').click();
      cy.get('[data-testid="input-deal-name"]').type('Test Deal');
      cy.get('[data-testid="input-amount"]').type('1000');
      cy.get('[data-testid="button-create-deal"]').click();
      cy.wait('@createDealError');
      cy.contains('Failed to create deal').should('be.visible');
    });
  });
});
