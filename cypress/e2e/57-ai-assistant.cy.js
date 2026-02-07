/**
 * E2E Tests for TNG AI Assistant
 *
 * Tests the AI-powered natural language query interface for executives.
 */

describe('AI Assistant Feature', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  // ============================================================================
  // FLOATING WIDGET
  // ============================================================================
  describe('Floating Widget', () => {
    it('should display chat button for admin users', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').should('be.visible');
    });

    it('should display chat button on all pages', () => {
      const pages = ['/', '/consultants', '/projects', '/hospitals', '/analytics'];
      pages.forEach(page => {
        cy.visit(page);
        cy.get('[data-testid="ai-assistant-button"]').should('be.visible');
      });
    });

    it('should open chat panel when button is clicked', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-panel"]').should('be.visible');
    });

    it('should close chat panel when X button is clicked', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-panel"]').should('be.visible');
      cy.get('[data-testid="ai-assistant-close"]').click();
      cy.get('[data-testid="ai-assistant-panel"]').should('not.exist');
    });

    it('should minimize panel when minimize button is clicked', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-minimize"]').click();
      cy.get('[data-testid="ai-assistant-panel"]').should('not.be.visible');
      cy.get('[data-testid="ai-assistant-button"]').should('be.visible');
    });

    it('should toggle panel visibility', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-panel"]').should('be.visible');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-panel"]').should('not.exist');
    });
  });

  // ============================================================================
  // ROLE-BASED ACCESS
  // ============================================================================
  describe('Role-Based Access', () => {
    it('should display for admin role', () => {
      cy.loginAsAdmin();
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').should('be.visible');
    });

    it('should display for hospital_leadership role', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'hospital_leadership', email: 'exec@test.com' }
      });
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').should('be.visible');
    });

    it('should NOT display for consultant role', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'consultant', email: 'consultant@test.com' }
      });
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').should('not.exist');
    });

    it('should NOT display for hospital_staff role', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'hospital_staff', email: 'staff@test.com' }
      });
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').should('not.exist');
    });
  });

  // ============================================================================
  // QUERY INTERFACE
  // ============================================================================
  describe('Query Interface', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
    });

    it('should display empty state with example queries', () => {
      cy.get('[data-testid="ai-assistant-examples"]').should('be.visible');
      cy.get('[data-testid="ai-assistant-example-query"]').should('have.length.gte', 3);
    });

    it('should have input field for queries', () => {
      cy.get('[data-testid="ai-assistant-input"]').should('be.visible');
      cy.get('[data-testid="ai-assistant-input"]').should('have.attr', 'placeholder');
    });

    it('should have send button', () => {
      cy.get('[data-testid="ai-assistant-send"]').should('be.visible');
    });

    it('should enable send button when query is entered', () => {
      cy.get('[data-testid="ai-assistant-send"]').should('be.disabled');
      cy.get('[data-testid="ai-assistant-input"]').type('How many open tickets?');
      cy.get('[data-testid="ai-assistant-send"]').should('not.be.disabled');
    });

    it('should send query on button click', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'There are 12 open tickets.', sources: [] }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('How many open tickets?');
      cy.get('[data-testid="ai-assistant-send"]').click();
      cy.wait('@aiQuery');
    });

    it('should send query on Enter key', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Response text', sources: [] }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Show me projects{enter}');
      cy.wait('@aiQuery');
    });

    it('should populate input when clicking example query', () => {
      cy.get('[data-testid="ai-assistant-example-query"]').first().click();
      cy.get('[data-testid="ai-assistant-input"]').should('not.have.value', '');
    });
  });

  // ============================================================================
  // RESPONSE DISPLAY
  // ============================================================================
  describe('Response Display', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
    });

    it('should display loading state while processing', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Response', sources: [] },
        delay: 1000
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Query text{enter}');
      cy.get('[data-testid="ai-assistant-loading"]').should('be.visible');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-loading"]').should('not.exist');
    });

    it('should display response message', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'There are 5 active projects.', sources: [] }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('How many active projects?{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', '5 active projects');
    });

    it('should display sources when available', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'There are 12 open tickets.',
          sources: [{ system: 'ServiceNow', note: 'Demo data' }]
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Open tickets?{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-sources"]').should('be.visible');
      cy.get('[data-testid="ai-assistant-sources"]').should('contain', 'ServiceNow');
    });

    it('should maintain conversation history', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'First response', sources: [] }
      }).as('aiQuery1');

      cy.get('[data-testid="ai-assistant-input"]').type('First query{enter}');
      cy.wait('@aiQuery1');

      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Second response', sources: [] }
      }).as('aiQuery2');

      cy.get('[data-testid="ai-assistant-input"]').type('Second query{enter}');
      cy.wait('@aiQuery2');

      cy.get('[data-testid="ai-assistant-message"]').should('have.length', 4); // 2 user + 2 assistant
    });

    it('should display user query in conversation', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Response', sources: [] }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('My query text{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-user-message"]').should('contain', 'My query text');
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  describe('Error Handling', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
    });

    it('should display error message on API failure', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('aiQueryError');

      cy.get('[data-testid="ai-assistant-input"]').type('Query text{enter}');
      cy.wait('@aiQueryError');
      cy.get('[data-testid="ai-assistant-error"]').should('be.visible');
    });

    it('should allow retry after error', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 500,
        body: { error: 'Error' }
      }).as('aiQueryError');

      cy.get('[data-testid="ai-assistant-input"]').type('Query{enter}');
      cy.wait('@aiQueryError');

      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Success', sources: [] }
      }).as('aiQuerySuccess');

      cy.get('[data-testid="ai-assistant-retry"]').click();
      cy.wait('@aiQuerySuccess');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'Success');
    });

    it('should handle timeout gracefully', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 504,
        body: { error: 'Gateway timeout' }
      }).as('aiQueryTimeout');

      cy.get('[data-testid="ai-assistant-input"]').type('Query{enter}');
      cy.wait('@aiQueryTimeout');
      cy.get('[data-testid="ai-assistant-error"]').should('contain', 'timeout');
    });

    it('should display not configured message when API key missing', () => {
      cy.intercept('GET', '/api/ai/health', {
        statusCode: 200,
        body: { status: 'not_configured' }
      });

      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-not-configured"]').should('be.visible');
    });
  });

  // ============================================================================
  // INTEGRATED SYSTEMS QUERIES
  // ============================================================================
  describe('Integrated Systems Queries', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
    });

    it('should query ServiceNow for incidents', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'There are 47 total incidents, 12 open.',
          sources: [{ system: 'ServiceNow', note: 'Demo data' }],
          toolsUsed: ['query_servicenow']
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Show ServiceNow incidents{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'incidents');
    });

    it('should query Jira for issues', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'There are 156 Jira issues, 34 open.',
          sources: [{ system: 'Jira', note: 'Demo data' }],
          toolsUsed: ['query_jira']
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Jira status{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'Jira');
    });

    it('should query Asana for tasks', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'There are 89 Asana tasks, 23 incomplete.',
          sources: [{ system: 'Asana', note: 'Demo data' }],
          toolsUsed: ['query_asana']
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Asana tasks{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'Asana');
    });

    it('should query Fieldglass for workforce data', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'We have 33 active consultants with 94% utilization.',
          sources: [{ system: 'Fieldglass', note: 'Demo data' }],
          toolsUsed: ['query_fieldglass']
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Fieldglass workforce{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'consultants');
    });

    it('should query support tickets', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'There are 8 open support tickets.',
          sources: [{ system: 'NiceHR', note: 'Live data' }],
          toolsUsed: ['query_support_tickets']
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Open support tickets{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'support tickets');
    });
  });

  // ============================================================================
  // ROLE-AWARE RESPONSES (Fieldglass)
  // ============================================================================
  describe('Role-Aware Fieldglass Responses', () => {
    it('should show SOW data for admin users', () => {
      cy.loginAsAdmin();
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();

      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'There are 12 SOWs, 5 open with pending responses. Top match: SOW-2024-089 (92% match).',
          sources: [{ system: 'Fieldglass', note: 'Admin view' }]
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Fieldglass SOWs{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'SOW');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'match');
    });

    it('should show workforce summary for executives', () => {
      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: '1', role: 'hospital_leadership', email: 'exec@test.com' }
      });

      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();

      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: {
          response: 'Your workforce summary: 33 active consultants, 5,280 hours this month, 94% utilization.',
          sources: [{ system: 'Fieldglass', note: 'Executive view' }]
        }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Fieldglass workforce{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'workforce');
      cy.get('[data-testid="ai-assistant-response"]').should('contain', 'utilization');
    });
  });

  // ============================================================================
  // CONVERSATION ACTIONS
  // ============================================================================
  describe('Conversation Actions', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
    });

    it('should clear conversation', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Response', sources: [] }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Query{enter}');
      cy.wait('@aiQuery');
      cy.get('[data-testid="ai-assistant-message"]').should('have.length.gte', 1);

      cy.get('[data-testid="ai-assistant-clear"]').click();
      cy.get('[data-testid="ai-assistant-message"]').should('have.length', 0);
    });

    it('should copy response to clipboard', () => {
      cy.intercept('POST', '/api/ai/query', {
        statusCode: 200,
        body: { response: 'Copyable response text', sources: [] }
      }).as('aiQuery');

      cy.get('[data-testid="ai-assistant-input"]').type('Query{enter}');
      cy.wait('@aiQuery');

      cy.get('[data-testid="ai-assistant-copy"]').click();
      // Note: Clipboard API testing has limitations in Cypress
    });
  });

  // ============================================================================
  // ACCESSIBILITY
  // ============================================================================
  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').focus().type('{enter}');
      cy.get('[data-testid="ai-assistant-panel"]').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').should('have.attr', 'aria-label');
    });

    it('should trap focus within panel when open', () => {
      cy.visit('/');
      cy.get('[data-testid="ai-assistant-button"]').click();
      cy.get('[data-testid="ai-assistant-input"]').should('be.focused');
    });
  });
});
