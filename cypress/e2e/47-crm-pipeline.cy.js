/// <reference types="cypress" />

/**
 * CRM Dashboard Pipeline Tab Tests
 * Tests for the Pipeline tab in the CRM Dashboard
 */

describe('CRM Dashboard - Pipeline Tab', () => {
  const mockDashboardStats = {
    contacts: { total: 15, leads: 8, customers: 7 },
    companies: { total: 10, prospects: 6, customers: 4 },
    deals: { total: 5, open: 3, totalValue: 500000, wonValue: 200000 },
    activities: { total: 25, today: 5, upcoming: 10 }
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'test-token');
    });

    cy.intercept('GET', '/api/crm/dashboard', {
      statusCode: 200,
      body: mockDashboardStats
    }).as('getDashboard');

    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: { user: { id: 1, email: 'admin@test.com', role: 'admin' } }
    }).as('getSession');
  });

  describe('CRM Dashboard Display', () => {
    it('should display CRM dashboard title', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="text-crm-title"]').should('be.visible');
    });

    it('should show add contact button', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="button-add-contact"]').should('be.visible');
    });

    it('should show add deal button', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="button-add-deal"]').should('be.visible');
    });
  });

  describe('Dashboard Stats Cards', () => {
    it('should display total contacts card', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="card-total-contacts"]').should('be.visible');
    });

    it('should display total companies card', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="card-total-companies"]').should('be.visible');
    });

    it('should display open deals card', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="card-open-deals"]').should('be.visible');
    });

    it('should display won revenue card', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="card-won-revenue"]').should('be.visible');
    });

    it('should display correct contact count', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="card-total-contacts"]').should('contain', '15');
    });

    it('should display correct company count', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="card-total-companies"]').should('contain', '10');
    });
  });

  describe('Dashboard Tabs', () => {
    it('should show overview tab', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-overview"]').should('be.visible');
    });

    it('should show pipeline tab', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-pipeline"]').should('be.visible');
    });

    it('should show activities tab', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').should('be.visible');
    });
  });

  describe('Pipeline Tab Content', () => {
    it('should switch to pipeline tab', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.contains('Sales Pipeline').should('be.visible');
    });

    it('should display pipeline stages', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.contains('Lead').should('be.visible');
      cy.contains('Qualified').should('be.visible');
      cy.contains('Proposal').should('be.visible');
      cy.contains('Negotiation').should('be.visible');
      cy.contains('Closed').should('be.visible');
    });

    it('should display pipeline description', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.contains('Visual overview of your deal stages').should('be.visible');
    });
  });

  describe('Overview Tab Content', () => {
    it('should show recent contacts section', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.contains('Recent Contacts').should('be.visible');
    });

    it('should show upcoming activities section', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.contains('Upcoming Activities').should('be.visible');
    });

    it('should show deals closing this week section', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.contains('Deals Closing This Week').should('be.visible');
    });
  });

  describe('Empty States', () => {
    it('should handle empty contacts', () => {
      cy.intercept('GET', '/api/crm/dashboard', {
        statusCode: 200,
        body: {
          contacts: { total: 0, leads: 0, customers: 0 },
          companies: { total: 0, prospects: 0, customers: 0 },
          deals: { total: 0, open: 0, totalValue: 0, wonValue: 0 },
          activities: { total: 0, today: 0, upcoming: 0 }
        }
      }).as('getEmptyDashboard');

      cy.visit('/crm');
      cy.wait('@getEmptyDashboard');
      cy.get('[data-testid="card-total-contacts"]').should('contain', '0');
    });

    it('should handle empty deals', () => {
      cy.intercept('GET', '/api/crm/dashboard', {
        statusCode: 200,
        body: {
          contacts: { total: 0, leads: 0, customers: 0 },
          companies: { total: 0, prospects: 0, customers: 0 },
          deals: { total: 0, open: 0, totalValue: 0, wonValue: 0 },
          activities: { total: 0, today: 0, upcoming: 0 }
        }
      }).as('getEmptyDashboard');

      cy.visit('/crm');
      cy.wait('@getEmptyDashboard');
      cy.get('[data-testid="card-open-deals"]').should('contain', '0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('h1').should('exist');
    });

    it('should have accessible tabs', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[role="tablist"]').should('exist');
    });

    it('should have tab panel', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[role="tabpanel"]').should('exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', () => {
      cy.intercept('GET', '/api/crm/dashboard', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getDashboardError');

      cy.visit('/crm');
      cy.wait('@getDashboardError');
    });
  });
});
