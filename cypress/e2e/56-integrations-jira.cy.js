/// <reference types="cypress" />

describe('Jira Integration', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const mockSource = {
    id: 'jira-1',
    name: 'Jira Cloud',
    description: 'Issue tracking',
    systemType: 'jira',
    status: 'active',
    apiUrl: 'https://company.atlassian.net',
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: 'completed',
    createdAt: new Date().toISOString()
  };

  const mockRecords = [
    {
      id: 'rec-1',
      integrationSourceId: 'jira-1',
      externalId: 'PROJ-123',
      externalEntity: 'bug',
      externalData: { key: 'PROJ-123', summary: 'Login button broken', status: 'Open', priority: 'High' },
      mappedData: { title: 'Login button broken', status: 'open', priority: 'high' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-2',
      integrationSourceId: 'jira-1',
      externalId: 'PROJ-456',
      externalEntity: 'story',
      externalData: { key: 'PROJ-456', summary: 'Add dark mode', status: 'In Progress' },
      mappedData: { title: 'Add dark mode', status: 'in_progress' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: mockUser }).as('getUser');
    cy.intercept('GET', '/api/integrations?systemType=jira', { statusCode: 200, body: [mockSource] }).as('getSource');
    cy.intercept('GET', '/api/integrations/jira-1/records*', { statusCode: 200, body: mockRecords }).as('getRecords');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/notifications/unread-count', { statusCode: 200, body: { count: 0 } });
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { 'shift-swaps': 0, tickets: 0 } });
    cy.intercept('GET', '/api/dev/permissions/*', { statusCode: 200, body: { role: 'admin' } });
    cy.intercept('GET', '/api/dev/effective-permissions/*', { statusCode: 200, body: [] });

    cy.visit('/integrations/jira', { failOnStatusCode: false });
  });

  describe('Page Load', () => {
    it('should display Jira page title', () => {
      cy.contains('Jira').should('be.visible');
    });

    it('should display back button', () => {
      cy.get('[data-testid="button-back"]').should('be.visible');
    });
  });

  describe('Stats Cards', () => {
    it('should display bugs card', () => {
      cy.get('[data-testid="card-bugs"]').should('be.visible');
    });

    it('should display stories card', () => {
      cy.get('[data-testid="card-stories"]').should('be.visible');
    });

    it('should display tasks card', () => {
      cy.get('[data-testid="card-tasks"]').should('be.visible');
    });

    it('should display epics card', () => {
      cy.get('[data-testid="card-epics"]').should('be.visible');
    });
  });

  describe('Records Table', () => {
    it('should display records table', () => {
      cy.get('[data-testid="table-records"]').should('be.visible');
    });

    it('should display record rows', () => {
      cy.get('[data-testid^="row-record-"]').should('have.length.at.least', 1);
    });

    it('should display issue key in row', () => {
      cy.contains('PROJ-123').should('be.visible');
    });

    it('should display issue summary', () => {
      cy.contains('Login button broken').should('be.visible');
    });
  });

  describe('Manual Entry', () => {
    it('should display manual entry button', () => {
      cy.get('[data-testid="button-manual-entry"]').should('be.visible');
    });

    it('should open manual entry dialog', () => {
      cy.get('[data-testid="button-manual-entry"]').click();
      cy.get('[data-testid="dialog-manual-entry"]').should('be.visible');
    });
  });

  describe('Sync', () => {
    it('should display sync button when source is active', () => {
      cy.get('[data-testid="button-sync"]').should('be.visible');
    });

    it('should trigger sync when clicking sync button', () => {
      cy.intercept('POST', '/api/integrations/jira-1/sync', {
        statusCode: 200,
        body: { syncId: 'sync-123', status: 'running' }
      }).as('triggerSync');

      cy.get('[data-testid="button-sync"]').click();
      cy.wait('@triggerSync');
    });
  });

  describe('Field Mappings', () => {
    it('should display mappings button', () => {
      cy.get('[data-testid="button-manage-mappings"]').should('be.visible');
    });

    it('should navigate to mappings page when clicking button', () => {
      cy.get('[data-testid="button-manage-mappings"]').click();
      cy.url().should('include', '/mappings');
    });
  });

  describe('Search', () => {
    it('should display search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should filter records when searching', () => {
      cy.get('[data-testid="input-search"]').type('PROJ-123');
      cy.get('[data-testid^="row-record-"]').should('have.length', 1);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no records', () => {
      cy.intercept('GET', '/api/integrations/jira-1/records*', { statusCode: 200, body: [] }).as('getEmptyRecords');
      cy.visit('/integrations/jira', { failOnStatusCode: false });
      cy.wait('@getEmptyRecords');
      cy.contains('No records').should('be.visible');
    });
  });
});
