/// <reference types="cypress" />

/**
 * CRM Contacts E2E Tests
 * Tests for the Contacts page in the CRM module
 */

describe('CRM Contacts', () => {
  const mockContacts = [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@memorialhealth.com',
      phone: '(555) 123-4567',
      title: 'Director of IT',
      companyId: 1,
      companyName: 'Memorial Health System',
      contactType: 'customer',
      status: 'active',
      leadTemperature: 'hot',
      lifecycleStage: 'customer',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@valleymedical.org',
      phone: '(555) 234-5678',
      title: 'CTO',
      companyId: 2,
      companyName: 'Valley Medical Center',
      contactType: 'prospect',
      status: 'active',
      leadTemperature: 'warm',
      lifecycleStage: 'sql',
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.r@coastalcare.com',
      phone: '(555) 345-6789',
      title: 'VP of Operations',
      companyId: 3,
      companyName: 'Coastal Care Hospital',
      contactType: 'lead',
      status: 'active',
      leadTemperature: 'cold',
      lifecycleStage: 'lead',
      createdAt: '2024-01-17T10:00:00Z'
    }
  ];

  const mockActivities = [
    {
      id: 1,
      type: 'call',
      subject: 'Initial Discovery Call',
      description: 'Discussed requirements',
      contactId: 1,
      createdAt: '2024-01-15T14:00:00Z'
    }
  ];

  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'test-token');
    });

    // Mock API endpoints
    cy.intercept('GET', '/api/crm/contacts*', {
      statusCode: 200,
      body: mockContacts
    }).as('getContacts');

    cy.intercept('GET', '/api/crm/contacts/1', {
      statusCode: 200,
      body: mockContacts[0]
    }).as('getContact');

    cy.intercept('GET', '/api/crm/activities*', {
      statusCode: 200,
      body: mockActivities
    }).as('getActivities');

    cy.intercept('POST', '/api/crm/contacts', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 99,
          ...req.body,
          createdAt: new Date().toISOString()
        }
      });
    }).as('createContact');

    cy.intercept('PATCH', '/api/crm/contacts/*', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...mockContacts[0],
          ...req.body
        }
      });
    }).as('updateContact');

    cy.intercept('DELETE', '/api/crm/contacts/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteContact');

    cy.intercept('POST', '/api/crm/activities', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 99,
          ...req.body,
          createdAt: new Date().toISOString()
        }
      });
    }).as('createActivity');

    // Mock user session
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: { id: 1, email: 'admin@test.com', role: 'admin' }
      }
    }).as('getSession');
  });

  describe('Page Load and Display', () => {
    it('should display the contacts page title', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="text-contacts-title"]').should('contain', 'Contacts');
    });

    it('should show add contact button', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').should('be.visible');
    });

    it('should display contacts in the table', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.contains('Sarah Johnson').should('be.visible');
      cy.contains('Michael Chen').should('be.visible');
      cy.contains('Emily Rodriguez').should('be.visible');
    });

    it('should show contact email addresses', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.contains('sarah.johnson@memorialhealth.com').should('be.visible');
    });

    it('should show contact phone numbers', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.contains('(555) 123-4567').should('be.visible');
    });

    it('should show contact company names', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.contains('Memorial Health System').should('be.visible');
    });

    it('should display contact type badges', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.contains('customer').should('be.visible');
    });

    it('should display contact count', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.contains('3 contacts total').should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    it('should have search input', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="input-search-contacts"]').should('be.visible');
    });

    it('should filter contacts by search term', () => {
      cy.intercept('GET', '/api/crm/contacts*search=Sarah*', {
        statusCode: 200,
        body: [mockContacts[0]]
      }).as('searchContacts');

      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="input-search-contacts"]').type('Sarah');
      cy.wait('@searchContacts');
    });

    it('should have type filter dropdown', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="select-type-filter"]').should('be.visible');
    });

    it('should filter contacts by type', () => {
      cy.intercept('GET', '/api/crm/contacts*type=lead*', {
        statusCode: 200,
        body: [mockContacts[2]]
      }).as('filterByType');

      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="select-type-filter"]').click();
      cy.contains('Lead').click();
      cy.wait('@filterByType');
    });

    it('should clear search when input is cleared', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="input-search-contacts"]').type('Test');
      cy.get('[data-testid="input-search-contacts"]').clear();
      cy.wait('@getContacts');
    });
  });

  describe('Create Contact', () => {
    it('should open create contact dialog', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();
      cy.contains('Create New Contact').should('be.visible');
    });

    it('should have required form fields', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();

      cy.get('[data-testid="input-first-name"]').should('be.visible');
      cy.get('[data-testid="input-last-name"]').should('be.visible');
      cy.get('[data-testid="input-email"]').should('be.visible');
    });

    it('should have optional form fields', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();

      cy.get('[data-testid="input-phone"]').should('be.visible');
      cy.get('[data-testid="input-title"]').should('be.visible');
    });

    it('should have contact type selector', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();
      cy.get('[data-testid="select-contact-type"]').should('be.visible');
    });

    it('should create a new contact', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();

      cy.get('[data-testid="input-first-name"]').type('John');
      cy.get('[data-testid="input-last-name"]').type('Doe');
      cy.get('[data-testid="input-email"]').type('john.doe@example.com');
      cy.get('[data-testid="input-phone"]').type('(555) 999-0000');
      cy.get('[data-testid="input-title"]').type('Manager');

      cy.get('[data-testid="button-create-contact"]').click();
      cy.wait('@createContact');

      // Dialog should close
      cy.contains('Create New Contact').should('not.exist');
    });

    it('should show success message after creation', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();

      cy.get('[data-testid="input-first-name"]').type('John');
      cy.get('[data-testid="input-last-name"]').type('Doe');
      cy.get('[data-testid="input-email"]').type('john.doe@example.com');
      cy.get('[data-testid="button-create-contact"]').click();
      cy.wait('@createContact');

      cy.contains('Contact created successfully').should('be.visible');
    });

    it('should cancel contact creation', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();
      cy.get('[data-testid="input-first-name"]').type('Test');
      cy.contains('button', 'Cancel').click();
      cy.contains('Create New Contact').should('not.exist');
    });
  });

  describe('Contact Actions Menu', () => {
    it('should show actions dropdown for each contact', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').should('be.visible');
    });

    it('should open actions menu on click', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').should('be.visible');
      cy.contains('Edit').should('be.visible');
      cy.contains('Delete').should('be.visible');
    });

    it('should have log activity option', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('Log Activity').should('be.visible');
    });
  });

  describe('View Contact Details', () => {
    it('should open view dialog from actions menu', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.contains('Sarah Johnson').should('be.visible');
    });

    it('should show activities tab', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-contact-activities"]').should('be.visible');
    });

    it('should show tasks tab', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-contact-tasks"]').should('be.visible');
    });

    it('should show details tab', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-contact-details"]').should('be.visible');
    });

    it('should switch to details tab and show contact info', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-contact-details"]').click();
      cy.contains('sarah.johnson@memorialhealth.com').should('be.visible');
    });

    it('should have edit button in view dialog', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.contains('button', 'Edit Contact').should('be.visible');
    });

    it('should have log activity button in view dialog', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="button-log-activity-from-view"]').should('be.visible');
    });
  });

  describe('Edit Contact', () => {
    it('should open edit dialog from actions menu', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('Edit').click();
      cy.contains('Edit Contact').should('be.visible');
    });

    it('should populate form with existing data', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('Edit').click();
      cy.get('input[name="firstName"]').should('have.value', 'Sarah');
      cy.get('input[name="lastName"]').should('have.value', 'Johnson');
    });

    it('should update contact successfully', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('Edit').click();
      cy.get('input[name="phone"]').clear().type('(555) 999-9999');
      cy.contains('button', 'Save Changes').click();
      cy.wait('@updateContact');
      cy.contains('Contact updated successfully').should('be.visible');
    });
  });

  describe('Delete Contact', () => {
    it('should delete contact from actions menu', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-contact-actions-1"]').click();
      cy.contains('Delete').click();
      cy.wait('@deleteContact');
      cy.contains('Contact deleted successfully').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no contacts', () => {
      cy.intercept('GET', '/api/crm/contacts*', {
        statusCode: 200,
        body: []
      }).as('getEmptyContacts');

      cy.visit('/crm/contacts');
      cy.wait('@getEmptyContacts');
      cy.contains('No contacts yet').should('be.visible');
    });

    it('should have add contact button in empty state', () => {
      cy.intercept('GET', '/api/crm/contacts*', {
        statusCode: 200,
        body: []
      }).as('getEmptyContacts');

      cy.visit('/crm/contacts');
      cy.wait('@getEmptyContacts');
      cy.contains('button', 'Add Contact').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('h1').should('exist');
    });

    it('should have labeled form inputs', () => {
      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();
      cy.get('label').should('have.length.at.least', 3);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/crm/contacts*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getContactsError');

      cy.visit('/crm/contacts');
      cy.wait('@getContactsError');
      // Should not crash - may show error state or empty
    });

    it('should handle create contact errors', () => {
      cy.intercept('POST', '/api/crm/contacts', {
        statusCode: 400,
        body: { error: 'Validation failed' }
      }).as('createContactError');

      cy.visit('/crm/contacts');
      cy.wait('@getContacts');
      cy.get('[data-testid="button-add-contact"]').click();
      cy.get('[data-testid="input-first-name"]').type('John');
      cy.get('[data-testid="input-last-name"]').type('Doe');
      cy.get('[data-testid="input-email"]').type('john@example.com');
      cy.get('[data-testid="button-create-contact"]').click();
      cy.wait('@createContactError');
      cy.contains('Failed to create contact').should('be.visible');
    });
  });
});
