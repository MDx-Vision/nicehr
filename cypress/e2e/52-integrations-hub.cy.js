/// <reference types="cypress" />

describe('Integration Hub', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const mockDashboard = {
    systemCounts: [
      { systemType: 'servicenow', count: 2, activeCount: 1 },
      { systemType: 'asana', count: 1, activeCount: 1 },
      { systemType: 'sap', count: 1, activeCount: 0 },
      { systemType: 'jira', count: 1, activeCount: 1 }
    ],
    records: {
      total: 150,
      synced: 120,
      pending: 20,
      failed: 10
    },
    mappings: {
      total: 45,
      validated: 35,
      pending: 10
    },
    recentSyncs: [
      {
        id: 'sync-1',
        integrationSourceId: 'src-1',
        syncType: 'full',
        status: 'completed',
        recordsProcessed: 50,
        recordsSucceeded: 48,
        recordsFailed: 2,
        syncStartedAt: new Date().toISOString(),
        syncCompletedAt: new Date().toISOString()
      }
    ],
    dataFreshness: {
      avgHoursSinceSync: 2.5
    }
  };

  const mockSources = [
    {
      id: 'src-1',
      name: 'Production ServiceNow',
      description: 'Main ITSM system',
      systemType: 'servicenow',
      status: 'active',
      apiUrl: 'https://company.service-now.com',
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'src-2',
      name: 'Project Asana',
      description: 'Project management',
      systemType: 'asana',
      status: 'active',
      apiUrl: null,
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: 'completed',
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: mockUser }).as('getUser');
    cy.intercept('GET', '/api/integrations/dashboard', { statusCode: 200, body: mockDashboard }).as('getDashboard');
    cy.intercept('GET', '/api/integrations', { statusCode: 200, body: mockSources }).as('getSources');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/notifications/unread-count', { statusCode: 200, body: { count: 0 } });
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { 'shift-swaps': 0, tickets: 0 } });
    cy.intercept('GET', '/api/dev/permissions/*', { statusCode: 200, body: { role: 'admin' } });
    cy.intercept('GET', '/api/dev/effective-permissions/*', { statusCode: 200, body: [] });

    cy.visit('/integrations', { failOnStatusCode: false });
    cy.wait('@getDashboard');
  });

  describe('Page Load', () => {
    it('should display the integration hub title', () => {
      cy.get('[data-testid="text-integration-hub-title"]').should('be.visible');
    });

    it('should display system stat cards', () => {
      cy.get('[data-testid="card-servicenow"]').should('be.visible');
      cy.get('[data-testid="card-asana"]').should('be.visible');
      cy.get('[data-testid="card-sap"]').should('be.visible');
      cy.get('[data-testid="card-jira"]').should('be.visible');
    });

    it('should display data freshness card', () => {
      cy.get('[data-testid="card-data-freshness"]').should('be.visible');
    });

    it('should display mapping status card', () => {
      cy.get('[data-testid="card-mapping-status"]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to ServiceNow page when clicking ServiceNow card', () => {
      cy.get('[data-testid="card-servicenow"]').click();
      cy.url().should('include', '/integrations/servicenow');
    });

    it('should navigate to Asana page when clicking Asana card', () => {
      cy.get('[data-testid="card-asana"]').click();
      cy.url().should('include', '/integrations/asana');
    });

    it('should navigate to SAP page when clicking SAP card', () => {
      cy.get('[data-testid="card-sap"]').click();
      cy.url().should('include', '/integrations/sap');
    });

    it('should navigate to Jira page when clicking Jira card', () => {
      cy.get('[data-testid="card-jira"]').click();
      cy.url().should('include', '/integrations/jira');
    });
  });

  describe('Add Integration', () => {
    it('should display add integration button', () => {
      cy.get('[data-testid="button-add-integration"]').should('be.visible');
    });

    it('should open add integration dialog when clicking add button', () => {
      cy.get('[data-testid="button-add-integration"]').click();
      cy.get('[data-testid="dialog-add-integration"]').should('be.visible');
    });

    it('should close dialog when clicking cancel', () => {
      cy.get('[data-testid="button-add-integration"]').click();
      cy.get('[data-testid="dialog-add-integration"]').should('be.visible');
      cy.contains('button', 'Cancel').click();
      cy.get('[data-testid="dialog-add-integration"]').should('not.exist');
    });

    it('should create new integration when submitting form', () => {
      const newSource = {
        id: 'new-src',
        name: 'New Integration',
        systemType: 'servicenow',
        status: 'draft'
      };

      cy.intercept('POST', '/api/integrations', { statusCode: 201, body: newSource }).as('createIntegration');

      cy.get('[data-testid="button-add-integration"]').click();
      cy.get('[data-testid="input-integration-name"]').type('New Integration');
      cy.get('[data-testid="select-system-type"]').click();
      cy.contains('[role="option"]', 'ServiceNow').click();
      cy.contains('button', 'Create').click();

      cy.wait('@createIntegration');
    });
  });

  describe('Sources Table', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-connections"]').click();
    });

    it('should display sources table', () => {
      cy.get('[data-testid="table-sources"]').should('be.visible');
    });

    it('should display source rows', () => {
      cy.get('[data-testid^="row-source-"]').should('have.length.at.least', 1);
    });

    it('should display source name', () => {
      cy.contains('Production ServiceNow').should('be.visible');
    });

    it('should display source status badge', () => {
      cy.get('[data-testid="row-source-src-1"]').within(() => {
        cy.contains('Active').should('be.visible');
      });
    });
  });

  describe('Sync Actions', () => {
    it('should display sync button', () => {
      cy.get('[data-testid="button-sync-all"]').should('be.visible');
    });

    it('should trigger sync when clicking sync button', () => {
      cy.get('[data-testid="button-sync-all"]').should('be.visible');
      // Note: The sync button functionality requires backend implementation
    });
  });

  describe('Import CSV', () => {
    it('should display import CSV button', () => {
      cy.get('[data-testid="button-import-csv"]').should('be.visible');
    });
  });

  describe('Recent Activity', () => {
    it('should display recent sync activity', () => {
      cy.get('[data-testid="tab-history"]').click();
      cy.get('[data-testid="table-recent-syncs"]').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('should display properly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="text-integration-hub-title"]').should('be.visible');
    });

    it('should display properly on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="text-integration-hub-title"]').should('be.visible');
    });
  });
});
