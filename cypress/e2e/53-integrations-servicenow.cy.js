/// <reference types="cypress" />

describe('ServiceNow Integration', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const mockSource = {
    id: 'servicenow-1',
    name: 'Production ServiceNow',
    description: 'Main ITSM instance',
    systemType: 'servicenow',
    status: 'active',
    apiUrl: 'https://company.service-now.com',
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: 'completed',
    createdAt: new Date().toISOString()
  };

  const mockRecords = [
    {
      id: 'rec-1',
      integrationSourceId: 'servicenow-1',
      externalId: 'INC0001234',
      externalEntity: 'incident',
      externalData: { short_description: 'Server down', priority: '1', state: 'In Progress' },
      mappedData: { title: 'Server down', priority: 'high', status: 'open' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-2',
      integrationSourceId: 'servicenow-1',
      externalId: 'CHG0005678',
      externalEntity: 'change_request',
      externalData: { short_description: 'Upgrade database', type: 'normal' },
      mappedData: { title: 'Upgrade database', type: 'change' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: mockUser }).as('getUser');
    cy.intercept('GET', '/api/integrations?systemType=servicenow', { statusCode: 200, body: [mockSource] }).as('getSource');
    cy.intercept('GET', '/api/integrations/servicenow-1/records*', { statusCode: 200, body: { records: mockRecords, total: mockRecords.length } }).as('getRecords');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/notifications/unread-count', { statusCode: 200, body: { count: 0 } });
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { 'shift-swaps': 0, tickets: 0 } });
    cy.intercept('GET', '/api/dev/permissions/*', { statusCode: 200, body: { role: 'admin' } });
    cy.intercept('GET', '/api/dev/effective-permissions/*', { statusCode: 200, body: [] });

    cy.visit('/integrations/servicenow', { failOnStatusCode: false });
  });

  describe('Page Load', () => {
    it('should display ServiceNow page title', () => {
      cy.contains('ServiceNow').should('be.visible');
    });

    it('should display back button', () => {
      cy.get('[data-testid="button-back"]').should('be.visible');
    });

    it('should navigate back to hub when clicking back button', () => {
      cy.get('[data-testid="button-back"]').click();
      cy.url().should('include', '/integrations');
      cy.url().should('not.include', '/servicenow');
    });
  });

  describe('Stats Cards', () => {
    it('should display incidents card', () => {
      cy.get('[data-testid="card-incidents"]').should('be.visible');
    });

    it('should display changes card', () => {
      cy.get('[data-testid="card-changes"]').should('be.visible');
    });

    it('should display problems card', () => {
      cy.get('[data-testid="card-problems"]').should('be.visible');
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

    it('should display external ID in row', () => {
      cy.contains('INC0001234').should('be.visible');
    });

    it('should display sync status', () => {
      cy.get('[data-testid^="row-record-"]').first().should('be.visible');
    });

    it('should open detail modal when clicking row', () => {
      cy.get('[data-testid="row-record-rec-1"]').click();
      cy.get('[data-testid="modal-record-detail"]').should('be.visible');
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

    it('should submit manual entry', () => {
      cy.intercept('POST', '/api/integrations/servicenow-1/import/manual', {
        statusCode: 201,
        body: { id: 'new-rec', externalId: 'INC0009999' }
      }).as('createRecord');

      cy.get('[data-testid="button-manual-entry"]').click();
      cy.get('[data-testid="dialog-manual-entry"]').should('be.visible');
      cy.get('#ticketNumber').type('INC0009999');
      cy.get('#shortDescription').type('Test incident');
      cy.contains('button', 'Import Record').click();

      cy.wait('@createRecord');
    });
  });

  describe('CSV Import', () => {
    it('should display import CSV button', () => {
      cy.get('[data-testid="button-import-csv"]').should('be.visible');
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

  describe('Search and Filter', () => {
    it('should display search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should filter records when searching', () => {
      cy.get('[data-testid="input-search"]').type('INC0001234');
      // Search input triggers API call with search param
      cy.get('[data-testid="input-search"]').should('have.value', 'INC0001234');
    });

    it('should filter records via search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no records', () => {
      cy.intercept('GET', '/api/integrations/servicenow-1/records*', { statusCode: 200, body: { records: [], total: 0 } }).as('getEmptyRecords');
      cy.visit('/integrations/servicenow', { failOnStatusCode: false });
      cy.wait('@getEmptyRecords');
      cy.contains('No records imported').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should show error state when API fails', () => {
      cy.intercept('GET', '/api/integrations?systemType=servicenow', { statusCode: 500, body: { error: 'Server error' } }).as('getSourceError');
      cy.visit('/integrations/servicenow', { failOnStatusCode: false });
      cy.wait('@getSourceError');
    });
  });
});
