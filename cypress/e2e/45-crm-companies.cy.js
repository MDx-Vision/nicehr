/// <reference types="cypress" />

/**
 * CRM Companies E2E Tests
 * Tests for the Companies page in the CRM module
 */

describe('CRM Companies', () => {
  const mockCompanies = [
    {
      id: 1,
      name: 'Memorial Health System',
      domain: 'memorialhealth.com',
      industry: 'Healthcare',
      size: '1001-5000',
      companyType: 'customer',
      status: 'active',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      ehrSystem: 'Epic',
      bedCount: 500,
      facilityType: 'hospital',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Valley Medical Center',
      domain: 'valleymedical.org',
      industry: 'Healthcare',
      size: '201-500',
      companyType: 'prospect',
      status: 'active',
      city: 'Phoenix',
      state: 'AZ',
      country: 'USA',
      ehrSystem: 'Cerner',
      bedCount: 200,
      facilityType: 'hospital',
      createdAt: '2024-01-16T10:00:00Z'
    },
    {
      id: 3,
      name: 'Coastal Care Hospital',
      domain: 'coastalcare.com',
      industry: 'Healthcare',
      size: '51-200',
      companyType: 'prospect',
      status: 'active',
      city: 'San Diego',
      state: 'CA',
      country: 'USA',
      ehrSystem: 'Meditech',
      bedCount: 100,
      facilityType: 'clinic',
      createdAt: '2024-01-17T10:00:00Z'
    }
  ];

  const mockActivities = [
    {
      id: 1,
      type: 'call',
      subject: 'Discovery Call',
      companyId: 1,
      createdAt: '2024-01-15T14:00:00Z'
    }
  ];

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', 'test-token');
    });

    cy.intercept('GET', '/api/crm/companies*', {
      statusCode: 200,
      body: mockCompanies
    }).as('getCompanies');

    cy.intercept('GET', '/api/crm/companies/1', {
      statusCode: 200,
      body: mockCompanies[0]
    }).as('getCompany');

    cy.intercept('GET', '/api/crm/activities*', {
      statusCode: 200,
      body: mockActivities
    }).as('getActivities');

    cy.intercept('POST', '/api/crm/companies', (req) => {
      req.reply({
        statusCode: 201,
        body: { id: 99, ...req.body, createdAt: new Date().toISOString() }
      });
    }).as('createCompany');

    cy.intercept('PATCH', '/api/crm/companies/*', (req) => {
      req.reply({
        statusCode: 200,
        body: { ...mockCompanies[0], ...req.body }
      });
    }).as('updateCompany');

    cy.intercept('DELETE', '/api/crm/companies/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteCompany');

    cy.intercept('POST', '/api/crm/activities', (req) => {
      req.reply({
        statusCode: 201,
        body: { id: 99, ...req.body, createdAt: new Date().toISOString() }
      });
    }).as('createActivity');

    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: { user: { id: 1, email: 'admin@test.com', role: 'admin' } }
    }).as('getSession');
  });

  describe('Page Load and Display', () => {
    it('should display the companies page title', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="text-companies-title"]').should('contain', 'Companies');
    });

    it('should show add company button', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').should('be.visible');
    });

    it('should display companies in the table', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('Memorial Health System').should('be.visible');
      cy.contains('Valley Medical Center').should('be.visible');
      cy.contains('Coastal Care Hospital').should('be.visible');
    });

    it('should show company domains', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('memorialhealth.com').should('be.visible');
    });

    it('should show company industry', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('Healthcare').should('be.visible');
    });

    it('should show company locations', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('Chicago').should('be.visible');
    });

    it('should display company type badges', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('customer').should('be.visible');
    });

    it('should show EHR system', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('Epic').should('be.visible');
    });

    it('should display company count', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.contains('3 companies total').should('be.visible');
    });
  });

  describe('Search and Filter', () => {
    it('should have search input', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="input-search-companies"]').should('be.visible');
    });

    it('should filter companies by search term', () => {
      cy.intercept('GET', '/api/crm/companies*search=Memorial*', {
        statusCode: 200,
        body: [mockCompanies[0]]
      }).as('searchCompanies');

      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="input-search-companies"]').type('Memorial');
      cy.wait('@searchCompanies');
    });

    it('should have type filter dropdown', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="select-type-filter"]').should('be.visible');
    });

    it('should filter companies by type', () => {
      cy.intercept('GET', '/api/crm/companies*type=customer*', {
        statusCode: 200,
        body: [mockCompanies[0]]
      }).as('filterByType');

      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="select-type-filter"]').click();
      cy.contains('Customer').click();
      cy.wait('@filterByType');
    });
  });

  describe('Create Company', () => {
    it('should open create company dialog', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.contains('Create New Company').should('be.visible');
    });

    it('should have required form fields', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="input-company-name"]').should('be.visible');
    });

    it('should have optional form fields', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="input-domain"]').should('be.visible');
      cy.get('[data-testid="select-industry"]').should('be.visible');
    });

    it('should have company type selector', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="select-company-type"]').should('be.visible');
    });

    it('should have healthcare IT fields', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="select-ehr-system"]').should('be.visible');
      cy.get('[data-testid="input-bed-count"]').should('be.visible');
    });

    it('should create a new company', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();

      cy.get('[data-testid="input-company-name"]').type('New Healthcare Partner');
      cy.get('[data-testid="input-domain"]').type('newhealthcare.com');
      cy.get('[data-testid="input-city"]').type('Boston');
      cy.get('[data-testid="input-state"]').type('MA');

      cy.get('[data-testid="button-create-company"]').click();
      cy.wait('@createCompany');

      cy.contains('Create New Company').should('not.exist');
    });

    it('should show success message after creation', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="input-company-name"]').type('New Healthcare Partner');
      cy.get('[data-testid="button-create-company"]').click();
      cy.wait('@createCompany');
      cy.contains('Company created successfully').should('be.visible');
    });

    it('should cancel company creation', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="input-company-name"]').type('Test');
      cy.contains('button', 'Cancel').click();
      cy.contains('Create New Company').should('not.exist');
    });
  });

  describe('Company Actions Menu', () => {
    it('should show actions dropdown for each company', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').should('be.visible');
    });

    it('should open actions menu on click', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').should('be.visible');
      cy.contains('Edit').should('be.visible');
      cy.contains('Delete').should('be.visible');
    });

    it('should have log activity option', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('Log Activity').should('be.visible');
    });
  });

  describe('View Company Details', () => {
    it('should open view dialog from actions menu', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.contains('Memorial Health System').should('be.visible');
    });

    it('should show activities tab', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-company-activities"]').should('be.visible');
    });

    it('should show tasks tab', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-company-tasks"]').should('be.visible');
    });

    it('should show details tab', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-company-details"]').should('be.visible');
    });

    it('should switch to details tab and show company info', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="tab-company-details"]').click();
      cy.contains('memorialhealth.com').should('be.visible');
    });

    it('should have edit button in view dialog', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.contains('button', 'Edit Company').should('be.visible');
    });

    it('should have log activity button in view dialog', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('View').click();
      cy.get('[data-testid="button-log-activity-from-company-view"]').should('be.visible');
    });
  });

  describe('Edit Company', () => {
    it('should open edit dialog from actions menu', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('Edit').click();
      cy.contains('Edit Company').should('be.visible');
    });

    it('should populate form with existing data', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('Edit').click();
      cy.get('input[name="name"]').should('have.value', 'Memorial Health System');
    });

    it('should update company successfully', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('Edit').click();
      cy.get('input[name="city"]').clear().type('New York');
      cy.contains('button', 'Save Changes').click();
      cy.wait('@updateCompany');
      cy.contains('Company updated successfully').should('be.visible');
    });
  });

  describe('Delete Company', () => {
    it('should delete company from actions menu', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-company-actions-1"]').click();
      cy.contains('Delete').click();
      cy.wait('@deleteCompany');
      cy.contains('Company deleted successfully').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no companies', () => {
      cy.intercept('GET', '/api/crm/companies*', {
        statusCode: 200,
        body: []
      }).as('getEmptyCompanies');

      cy.visit('/crm/companies');
      cy.wait('@getEmptyCompanies');
      cy.contains('No companies yet').should('be.visible');
    });

    it('should have add company button in empty state', () => {
      cy.intercept('GET', '/api/crm/companies*', {
        statusCode: 200,
        body: []
      }).as('getEmptyCompanies');

      cy.visit('/crm/companies');
      cy.wait('@getEmptyCompanies');
      cy.contains('button', 'Add Company').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('h1').should('exist');
    });

    it('should have labeled form inputs', () => {
      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('label').should('have.length.at.least', 3);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/crm/companies*', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('getCompaniesError');

      cy.visit('/crm/companies');
      cy.wait('@getCompaniesError');
    });

    it('should handle create company errors', () => {
      cy.intercept('POST', '/api/crm/companies', {
        statusCode: 400,
        body: { error: 'Validation failed' }
      }).as('createCompanyError');

      cy.visit('/crm/companies');
      cy.wait('@getCompanies');
      cy.get('[data-testid="button-add-company"]').click();
      cy.get('[data-testid="input-company-name"]').type('Test Company');
      cy.get('[data-testid="button-create-company"]').click();
      cy.wait('@createCompanyError');
      cy.contains('Failed to create company').should('be.visible');
    });
  });
});
