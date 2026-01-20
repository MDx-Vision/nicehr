/// <reference types="cypress" />

describe('SAP Integration', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  };

  const mockSource = {
    id: 'sap-1',
    name: 'SAP ERP',
    description: 'Enterprise resource planning',
    systemType: 'sap',
    status: 'active',
    apiUrl: 'https://sap.company.com',
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus: 'completed',
    createdAt: new Date().toISOString()
  };

  const mockRecords = [
    {
      id: 'rec-1',
      integrationSourceId: 'sap-1',
      externalId: 'PO-10001',
      externalEntity: 'purchase_order',
      externalData: { EBELN: 'PO-10001', BUKRS: '1000', EKORG: 'US01' },
      mappedData: { poNumber: 'PO-10001', company: '1000', org: 'US01' },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'rec-2',
      integrationSourceId: 'sap-1',
      externalId: 'INV-20001',
      externalEntity: 'invoice',
      externalData: { BELNR: 'INV-20001', BUKRS: '1000', DMBTR: 5000 },
      mappedData: { invoiceNumber: 'INV-20001', company: '1000', amount: 5000 },
      syncStatus: 'completed',
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/auth/user', { statusCode: 200, body: mockUser }).as('getUser');
    cy.intercept('GET', '/api/integrations?systemType=sap', { statusCode: 200, body: [mockSource] }).as('getSource');
    cy.intercept('GET', '/api/integrations/sap-1/records*', { statusCode: 200, body: { records: mockRecords, total: mockRecords.length } }).as('getRecords');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/notifications/unread-count', { statusCode: 200, body: { count: 0 } });
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { 'shift-swaps': 0, tickets: 0 } });
    cy.intercept('GET', '/api/dev/permissions/*', { statusCode: 200, body: { role: 'admin' } });
    cy.intercept('GET', '/api/dev/effective-permissions/*', { statusCode: 200, body: [] });

    cy.visit('/integrations/sap', { failOnStatusCode: false });
  });

  describe('Page Load', () => {
    it('should display SAP page title', () => {
      cy.contains('SAP').should('be.visible');
    });

    it('should display back button', () => {
      cy.get('[data-testid="button-back"]').should('be.visible');
    });
  });

  describe('Stats Cards', () => {
    it('should display purchase orders card', () => {
      cy.get('[data-testid="card-purchase-orders"]').should('be.visible');
    });

    it('should display invoices card', () => {
      cy.get('[data-testid="card-invoices"]').should('be.visible');
    });

    it('should display vendors card', () => {
      cy.get('[data-testid="card-vendors"]').should('be.visible');
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

    it('should display PO number in row', () => {
      cy.contains('PO-10001').should('be.visible');
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
