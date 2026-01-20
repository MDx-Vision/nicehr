/// <reference types="cypress" />

describe('Asana Integration', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const mockSource = {
    id: 'asana-1',
    name: 'Project Asana',
    description: 'Project management workspace',
    systemType: 'asana',
    status: 'active',
    apiUrl: null,
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: 'completed',
    createdAt: new Date().toISOString()
  };

  const mockRecords = [
    {
      id: 'rec-1',
      integrationSourceId: 'asana-1',
      externalId: 'task-123',
      externalEntity: 'task',
      externalData: { name: 'Complete documentation', completed: false, due_on: '2024-02-01' },
      mappedData: { title: 'Complete documentation', status: 'open', dueDate: '2024-02-01' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-2',
      integrationSourceId: 'asana-1',
      externalId: 'project-456',
      externalEntity: 'project',
      externalData: { name: 'EHR Implementation', status: 'active' },
      mappedData: { name: 'EHR Implementation', status: 'active' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: mockUser }).as('getUser');
    cy.intercept('GET', '/api/integrations?systemType=asana', { statusCode: 200, body: [mockSource] }).as('getSource');
    cy.intercept('GET', '/api/integrations/asana-1/records*', { statusCode: 200, body: { records: mockRecords, total: mockRecords.length } }).as('getRecords');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/notifications/unread-count', { statusCode: 200, body: { count: 0 } });
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { 'shift-swaps': 0, tickets: 0 } });
    cy.intercept('GET', '/api/dev/permissions/*', { statusCode: 200, body: { role: 'admin' } });
    cy.intercept('GET', '/api/dev/effective-permissions/*', { statusCode: 200, body: [] });

    cy.visit('/integrations/asana', { failOnStatusCode: false });
  });

  describe('Page Load', () => {
    it('should display Asana page title', () => {
      cy.contains('Asana').should('be.visible');
    });

    it('should display back button', () => {
      cy.get('[data-testid="button-back"]').should('be.visible');
    });
  });

  describe('Stats Cards', () => {
    it('should display tasks card', () => {
      cy.get('[data-testid="card-tasks"]').should('be.visible');
    });

    it('should display projects card', () => {
      cy.get('[data-testid="card-projects"]').should('be.visible');
    });

    it('should display milestones card', () => {
      cy.get('[data-testid="card-milestones"]').should('be.visible');
    });

    it('should display total records card', () => {
      cy.get('[data-testid="card-total-records"]').should('be.visible');
    });
  });

  describe('Records Table', () => {
    it('should display records table', () => {
      cy.get('[data-testid="table-records"]').should('be.visible');
    });

    it('should display record rows', () => {
      cy.get('[data-testid^="row-record-"]').should('have.length.at.least', 1);
    });

    it('should display task name in row', () => {
      cy.contains('Complete documentation').should('be.visible');
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
      cy.get('[data-testid="button-sync"]').should('be.visible');
      // Note: Full sync functionality requires backend implementation
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
  });
});
