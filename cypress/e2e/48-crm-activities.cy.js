/// <reference types="cypress" />

/**
 * CRM Dashboard Activities Tab Tests
 * Tests for the Activities tab in the CRM Dashboard
 */

describe('CRM Dashboard - Activities Tab', () => {
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

  describe('Activities Tab Display', () => {
    it('should show activities tab on CRM dashboard', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').should('be.visible');
    });

    it('should switch to activities tab', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Activity Feed').should('be.visible');
    });

    it('should display activity feed title', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Activity Feed').should('be.visible');
    });

    it('should show activity count for today', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Today: 5 activities').should('be.visible');
    });

    it('should show upcoming activities count', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Upcoming: 10 scheduled').should('be.visible');
    });
  });

  describe('Activity Action Buttons', () => {
    it('should show log call button', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Log Call').should('be.visible');
    });

    it('should show log email button', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Log Email').should('be.visible');
    });

    it('should show schedule meeting button', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('Schedule Meeting').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state message', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-activities"]').click();
      cy.contains('No recent activities').should('be.visible');
    });
  });

  describe('Overview Tab', () => {
    it('should show overview tab by default', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[data-testid="tab-overview"]').should('be.visible');
    });

    it('should display recent contacts section', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.contains('Recent Contacts').should('be.visible');
    });

    it('should display upcoming activities section in overview', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.contains('Upcoming Activities').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper tab navigation', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('have.length.at.least', 3);
    });

    it('should have accessible panel content', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('[role="tabpanel"]').should('exist');
    });

    it('should have proper heading', () => {
      cy.visit('/crm');
      cy.wait('@getDashboard');
      cy.get('h1').should('exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle dashboard API error', () => {
      cy.intercept('GET', '/api/crm/dashboard', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getDashboardError');

      cy.visit('/crm');
      cy.wait('@getDashboardError');
    });
  });
});
