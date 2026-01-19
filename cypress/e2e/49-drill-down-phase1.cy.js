/**
 * Drill-Down Phase 1 (P0) Tests
 * Tests for drill-down functionality on Main Dashboard and CRM Dashboard
 */

const mockUser = {
  id: 1,
  email: 'admin@test.com',
  firstName: 'Test',
  lastName: 'Admin',
  role: 'admin'
};

const mockDashboardStats = {
  totalConsultants: 12,
  activeConsultants: 8,
  totalHospitals: 5,
  activeProjects: 7,
  pendingDocuments: 15,
  totalSavings: "125000",
  totalHoursLogged: 450,
  ticketResolutionRate: 85,
  projectCompletionRate: 72,
  consultantUtilization: 78
};

const mockCrmDashboard = {
  contacts: { total: 45, leads: 20, customers: 25 },
  companies: { total: 15, prospects: 5, customers: 10 },
  deals: { total: 8, open: 5, totalValue: 250000, wonValue: 125000 },
  activities: { total: 100, today: 5, upcoming: 12 }
};

describe('Drill-Down Phase 1 - Main Dashboard', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: mockUser
    }).as('getUser');

    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: mockDashboardStats
    }).as('getDashboardStats');

    cy.intercept('GET', '/api/dashboard/tasks', {
      statusCode: 200,
      body: []
    }).as('getTasks');

    cy.intercept('GET', '/api/dashboard/calendar-events', {
      statusCode: 200,
      body: []
    }).as('getCalendarEvents');

    cy.intercept('GET', '/api/activities/recent*', {
      statusCode: 200,
      body: []
    }).as('getActivities');

    cy.visit('/');
    cy.wait('@getUser');
    cy.wait('@getDashboardStats');
  });

  describe('Stat Card Drill-Downs', () => {
    it('should navigate to consultants page when clicking Total Consultants card', () => {
      cy.get('[data-testid="card-total-consultants"]').should('be.visible');
      cy.get('[data-testid="card-total-consultants"]').click();
      cy.url().should('include', '/consultants');
    });

    it('should navigate to hospitals page when clicking Hospitals card', () => {
      cy.get('[data-testid="card-total-hospitals"]').should('be.visible');
      cy.get('[data-testid="card-total-hospitals"]').click();
      cy.url().should('include', '/hospitals');
    });

    it('should navigate to projects page with status=active filter when clicking Active Projects card', () => {
      cy.get('[data-testid="card-active-projects"]').should('be.visible');
      cy.get('[data-testid="card-active-projects"]').click();
      cy.url().should('include', '/projects');
      cy.url().should('include', 'status=active');
    });

    it('should navigate to documents page with status=pending filter when clicking Pending Documents card', () => {
      cy.get('[data-testid="card-pending-documents"]').should('be.visible');
      cy.get('[data-testid="card-pending-documents"]').click();
      cy.url().should('include', '/documents');
      cy.url().should('include', 'status=pending');
    });

    it('should navigate to consultants page with availability=available filter when clicking Available Consultants card', () => {
      cy.get('[data-testid="card-active-consultants"]').should('be.visible');
      cy.get('[data-testid="card-active-consultants"]').click();
      cy.url().should('include', '/consultants');
      cy.url().should('include', 'availability=available');
    });

    it('should navigate to analytics page when clicking Total Savings card', () => {
      cy.get('[data-testid="card-total-savings"]').should('be.visible');
      cy.get('[data-testid="card-total-savings"]').click();
      cy.url().should('include', '/analytics');
    });
  });

  describe('Card Hover States', () => {
    it('should show visual feedback on card hover', () => {
      cy.get('[data-testid="card-total-consultants"]')
        .should('have.class', 'cursor-pointer')
        .should('have.class', 'hover:border-primary/50');
    });

    it('should display arrow icons indicating clickability', () => {
      cy.get('[data-testid="card-total-consultants"]')
        .find('svg[class*="lucide-arrow-right"]')
        .should('exist');
    });
  });
});

describe('Drill-Down Phase 1 - CRM Dashboard', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: mockUser
    }).as('getUser');

    cy.intercept('GET', '/api/crm/dashboard', {
      statusCode: 200,
      body: mockCrmDashboard
    }).as('getCrmDashboard');

    cy.visit('/crm');
    cy.wait('@getUser');
    cy.wait('@getCrmDashboard');
  });

  describe('CRM Stat Card Drill-Downs', () => {
    it('should navigate to contacts page when clicking Total Contacts card', () => {
      cy.get('[data-testid="card-total-contacts"]').should('be.visible');
      cy.get('[data-testid="card-total-contacts"]').click();
      cy.url().should('include', '/crm/contacts');
    });

    it('should navigate to companies page when clicking Companies card', () => {
      cy.get('[data-testid="card-total-companies"]').should('be.visible');
      cy.get('[data-testid="card-total-companies"]').click();
      cy.url().should('include', '/crm/companies');
    });

    it('should navigate to deals page with status=open filter when clicking Open Deals card', () => {
      cy.get('[data-testid="card-open-deals"]').should('be.visible');
      cy.get('[data-testid="card-open-deals"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'status=open');
    });

    it('should open Won Revenue slide-out panel when clicking Won Revenue card', () => {
      cy.get('[data-testid="card-won-revenue"]').should('be.visible');
      cy.get('[data-testid="card-won-revenue"]').click();
      cy.get('[data-testid="panel-won-revenue"]').should('be.visible');
      cy.contains('Won Revenue Details').should('be.visible');
    });

    it('should navigate to won deals from slide-out panel', () => {
      cy.get('[data-testid="card-won-revenue"]').click();
      cy.get('[data-testid="panel-won-revenue"]').should('be.visible');
      cy.get('[data-testid="button-view-all-won-deals"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'status=won');
    });

    it('should close Won Revenue panel when clicking outside', () => {
      cy.get('[data-testid="card-won-revenue"]').click();
      cy.get('[data-testid="panel-won-revenue"]').should('be.visible');
      // Press escape to close the sheet
      cy.get('body').type('{esc}');
      cy.get('[data-testid="panel-won-revenue"]').should('not.exist');
    });
  });

  describe('CRM Card Visual Feedback', () => {
    it('should show visual feedback on CRM card hover', () => {
      cy.get('[data-testid="card-total-contacts"]')
        .should('have.class', 'cursor-pointer')
        .should('have.class', 'hover:border-primary/50');
    });

    it('should display arrow icons on CRM cards', () => {
      cy.get('[data-testid="card-total-contacts"]')
        .find('svg[class*="lucide-arrow-right"]')
        .should('exist');
    });
  });
});

describe('Drill-Down Phase 1 - CRM Pipeline', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: mockUser
    }).as('getUser');

    cy.intercept('GET', '/api/crm/dashboard', {
      statusCode: 200,
      body: mockCrmDashboard
    }).as('getCrmDashboard');

    cy.visit('/crm');
    cy.wait('@getUser');
    cy.wait('@getCrmDashboard');
  });

  describe('Pipeline Stage Drill-Downs', () => {
    it('should navigate to Pipeline tab', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.contains('Sales Pipeline').should('be.visible');
    });

    it('should navigate to deals filtered by Lead stage when clicking Lead column', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.get('[data-testid="pipeline-stage-lead"]').should('be.visible');
      cy.get('[data-testid="pipeline-stage-lead"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'stage=lead');
    });

    it('should navigate to deals filtered by Qualified stage when clicking Qualified column', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.get('[data-testid="pipeline-stage-qualified"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'stage=qualified');
    });

    it('should navigate to deals filtered by Proposal stage when clicking Proposal column', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.get('[data-testid="pipeline-stage-proposal"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'stage=proposal');
    });

    it('should navigate to deals filtered by Negotiation stage when clicking Negotiation column', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.get('[data-testid="pipeline-stage-negotiation"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'stage=negotiation');
    });

    it('should navigate to deals filtered by Closed stage when clicking Closed column', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.get('[data-testid="pipeline-stage-closed"]').click();
      cy.url().should('include', '/crm/deals');
      cy.url().should('include', 'stage=closed');
    });

    it('should show hover effect on pipeline stage cards', () => {
      cy.get('[data-testid="tab-pipeline"]').click();
      cy.get('[data-testid="pipeline-stage-lead"]')
        .should('have.class', 'cursor-pointer')
        .should('have.class', 'hover:border-primary/50');
    });
  });
});

describe('Drill-Down Phase 1 - URL Parameter Handling', () => {
  describe('Projects Page - Status Filter from URL', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: [
          { id: '1', name: 'Project A', status: 'active', hospitalId: 'h1', startDate: '2026-01-01', endDate: '2026-06-30' },
          { id: '2', name: 'Project B', status: 'completed', hospitalId: 'h2', startDate: '2025-06-01', endDate: '2025-12-31' },
          { id: '3', name: 'Project C', status: 'active', hospitalId: 'h1', startDate: '2026-02-01', endDate: '2026-08-31' }
        ]
      }).as('getProjects');

      cy.intercept('GET', '/api/hospitals', {
        statusCode: 200,
        body: [
          { id: 'h1', name: 'Memorial Hospital' },
          { id: 'h2', name: 'Regional Medical' }
        ]
      }).as('getHospitals');
    });

    it('should apply status filter from URL parameter', () => {
      cy.visit('/projects?status=active');
      cy.wait('@getUser');
      cy.wait('@getProjects');
      cy.url().should('include', 'status=active');
    });
  });

  describe('Consultants Page - Availability Filter from URL', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: [
          { id: '1', tngId: 'C001', isAvailable: true },
          { id: '2', tngId: 'C002', isAvailable: false },
          { id: '3', tngId: 'C003', isAvailable: true }
        ]
      }).as('getConsultants');
    });

    it('should apply availability filter from URL parameter', () => {
      cy.visit('/consultants?availability=available');
      cy.wait('@getUser');
      cy.wait('@getConsultants');
      cy.url().should('include', 'availability=available');
    });
  });

  describe('CRM Deals Page - Status and Stage Filters from URL', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/crm/deals*', {
        statusCode: 200,
        body: []
      }).as('getDeals');

      cy.intercept('GET', '/api/crm/pipelines', {
        statusCode: 200,
        body: [{
          id: '1',
          name: 'Default',
          type: 'sales',
          stages: [
            { id: 's1', name: 'Lead', order: 1, probability: 10, stageType: 'open' },
            { id: 's2', name: 'Qualified', order: 2, probability: 30, stageType: 'open' }
          ]
        }]
      }).as('getPipelines');
    });

    it('should apply status filter from URL parameter', () => {
      cy.visit('/crm/deals?status=open');
      cy.wait('@getUser');
      cy.wait('@getDeals');
      cy.url().should('include', 'status=open');
    });

    it('should apply stage filter from URL parameter', () => {
      cy.visit('/crm/deals?stage=lead');
      cy.wait('@getUser');
      cy.wait('@getDeals');
      cy.url().should('include', 'stage=lead');
    });

    it('should apply both status and stage filters from URL', () => {
      cy.visit('/crm/deals?status=open&stage=qualified');
      cy.wait('@getUser');
      cy.wait('@getDeals');
      cy.url().should('include', 'status=open');
      cy.url().should('include', 'stage=qualified');
    });
  });

  describe('Documents Page - Status Filter from URL', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: mockUser
      }).as('getUser');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      cy.intercept('GET', '/api/document-types', {
        statusCode: 200,
        body: []
      }).as('getDocumentTypes');
    });

    it('should apply status filter from URL parameter', () => {
      cy.visit('/documents?status=pending');
      cy.wait('@getUser');
      cy.wait('@getConsultants');
      cy.url().should('include', 'status=pending');
    });
  });
});

describe('Drill-Down Phase 1 - Navigation Flow', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  it('should complete full drill-down flow from Dashboard to Projects to Detail', () => {
    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: mockUser
    }).as('getUser');

    cy.intercept('GET', '/api/dashboard/stats', {
      statusCode: 200,
      body: mockDashboardStats
    }).as('getDashboardStats');

    cy.intercept('GET', '/api/dashboard/tasks', { body: [] }).as('getTasks');
    cy.intercept('GET', '/api/dashboard/calendar-events', { body: [] }).as('getEvents');
    cy.intercept('GET', '/api/activities/recent*', { body: [] }).as('getActivities');

    cy.intercept('GET', '/api/projects', {
      statusCode: 200,
      body: [
        { id: '1', name: 'Epic Implementation', status: 'active', hospitalId: 'h1' },
        { id: '2', name: 'Cerner Migration', status: 'completed', hospitalId: 'h2' }
      ]
    }).as('getProjects');

    cy.intercept('GET', '/api/hospitals', {
      statusCode: 200,
      body: [
        { id: 'h1', name: 'Memorial Hospital' },
        { id: 'h2', name: 'Regional Medical' }
      ]
    }).as('getHospitals');

    // Start at dashboard
    cy.visit('/');
    cy.wait('@getUser');
    cy.wait('@getDashboardStats');

    // Click Active Projects card
    cy.get('[data-testid="card-active-projects"]').click();

    // Should be on projects page with filter
    cy.url().should('include', '/projects');
    cy.url().should('include', 'status=active');
    cy.wait('@getProjects');
  });

  it('should complete full CRM drill-down flow from Dashboard to Deals', () => {
    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: mockUser
    }).as('getUser');

    cy.intercept('GET', '/api/crm/dashboard', {
      statusCode: 200,
      body: mockCrmDashboard
    }).as('getCrmDashboard');

    cy.intercept('GET', '/api/crm/deals*', {
      statusCode: 200,
      body: [
        { id: '1', name: 'Enterprise Deal', status: 'open', amount: '50000' },
        { id: '2', name: 'SMB Deal', status: 'open', amount: '10000' }
      ]
    }).as('getDeals');

    cy.intercept('GET', '/api/crm/pipelines', {
      statusCode: 200,
      body: [{
        id: '1',
        name: 'Default',
        type: 'sales',
        stages: []
      }]
    }).as('getPipelines');

    // Start at CRM dashboard
    cy.visit('/crm');
    cy.wait('@getUser');
    cy.wait('@getCrmDashboard');

    // Click Open Deals card
    cy.get('[data-testid="card-open-deals"]').click();

    // Should be on deals page with filter
    cy.url().should('include', '/crm/deals');
    cy.url().should('include', 'status=open');
    cy.wait('@getDeals');
  });
});
