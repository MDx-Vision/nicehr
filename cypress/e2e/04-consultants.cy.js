describe('Consultant Management', () => {
  const mockConsultants = [
    { id: 1, tngId: 'TNG001', firstName: 'John', lastName: 'Doe', phone: '555-1234', city: 'Austin', state: 'TX', isAvailable: true, shiftPreference: 'day', yearsExperience: 5 },
    { id: 2, tngId: 'TNG002', firstName: 'Jane', lastName: 'Smith', phone: '555-5678', city: 'Houston', state: 'TX', isAvailable: false, shiftPreference: 'night', yearsExperience: 3 }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'admin' }
    }).as('getUser');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { user: { id: 1, email: 'test@example.com', role: 'admin' } }
    }).as('loginRequest');

    // Mock consultants API
    cy.intercept('GET', '/api/consultants*', {
      statusCode: 200,
      body: mockConsultants
    }).as('getConsultants');

    cy.intercept('POST', '/api/consultants', {
      statusCode: 201,
      body: { id: 3, tngId: 'TNG003', firstName: 'New', lastName: 'Consultant' }
    }).as('createConsultant');

    cy.intercept('PUT', '/api/consultants/*', {
      statusCode: 200,
      body: { id: 1, tngId: 'TNG001', firstName: 'Updated', lastName: 'Consultant' }
    }).as('updateConsultant');

    cy.intercept('DELETE', '/api/consultants/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteConsultant');

    // Login
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@loginRequest');

    // Navigate to consultants
    cy.visit('/consultants');
    cy.wait('@getUser');
    cy.wait('@getConsultants');
  });

  describe('Consultant List View', () => {
    it('should display consultants page title', () => {
      cy.get('[data-testid="text-consultants-title"]').should('be.visible').and('contain', 'Consultants');
    });

    it('should show search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should show filter controls', () => {
      cy.get('[data-testid="filter-availability"]').should('be.visible');
      cy.get('[data-testid="filter-shift"]').should('be.visible');
    });

    it('should show consultants table', () => {
      cy.get('[data-testid="consultants-table"]').should('exist');
    });

    it('should show consultant rows', () => {
      cy.get('[data-testid="consultant-row"]').should('have.length', 2);
    });

    it('should display consultant names', () => {
      cy.get('[data-testid="consultant-name"]').first().should('contain', 'TNG001');
    });

    it('should show availability badges', () => {
      cy.get('[data-testid="consultant-availability"]').should('exist');
    });
  });

  describe('Filter Controls', () => {
    it('should have availability filter dropdown', () => {
      cy.get('[data-testid="filter-availability"]').should('be.visible');
    });

    it('should have shift preference filter dropdown', () => {
      cy.get('[data-testid="filter-shift"]').should('be.visible');
    });

    it('should have onboarded status filter', () => {
      cy.get('[data-testid="filter-onboarded"]').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should allow typing in search field', () => {
      cy.get('[data-testid="input-search"]')
        .type('TNG001')
        .should('have.value', 'TNG001');
    });

    it('should clear search when text is deleted', () => {
      cy.get('[data-testid="input-search"]')
        .type('test')
        .clear()
        .should('have.value', '');
    });
  });

  describe('Advanced Search', () => {
    it('should show advanced search button', () => {
      cy.get('[data-testid="button-advanced-search"]').should('be.visible');
    });

    it('should open advanced search panel', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="advanced-search-panel"]').should('be.visible');
    });

    it('should show EMR filter in advanced search', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="filter-ehr"]').should('be.visible');
    });

    it('should show skills filter in advanced search', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="filter-skills"]').should('be.visible');
    });

    it('should have clear filters button', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="button-clear-filters"]').should('be.visible');
    });

    it('should have apply filters button', () => {
      cy.get('[data-testid="button-advanced-search"]').click();
      cy.get('[data-testid="button-apply-filters"]').should('be.visible');
    });
  });

  describe('Create Consultant', () => {
    it('should show create consultant button', () => {
      cy.get('[data-testid="button-create-consultant"]').should('be.visible');
    });

    it('should open create consultant modal', () => {
      cy.get('[data-testid="button-create-consultant"]').click();
      cy.get('[data-testid="modal-consultant"]').should('be.visible');
    });

    it('should show form fields in modal', () => {
      cy.get('[data-testid="button-create-consultant"]').click();
      cy.get('[data-testid="input-tng-id"]').should('be.visible');
      cy.get('[data-testid="input-phone"]').should('be.visible');
      cy.get('[data-testid="input-city"]').should('be.visible');
      cy.get('[data-testid="input-state"]').should('be.visible');
    });

    it('should have submit button in modal', () => {
      cy.get('[data-testid="button-create-consultant"]').click();
      cy.get('[data-testid="button-submit-consultant"]').should('be.visible');
    });
  });

  describe('View Consultant Details', () => {
    it('should show view button on consultant row', () => {
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="button-view-consultant"]').should('be.visible');
      });
    });

    it('should open consultant profile modal', () => {
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="button-view-consultant"]').click();
      });
      cy.get('[data-testid="consultant-profile"]').should('be.visible');
    });

    it('should show tabs in profile modal', () => {
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="button-view-consultant"]').click();
      });
      cy.get('[data-testid="tab-certifications"]').should('be.visible');
      cy.get('[data-testid="tab-skills"]').should('be.visible');
      cy.get('[data-testid="tab-documents"]').should('be.visible');
    });
  });

  describe('Edit Consultant', () => {
    it('should show edit button on consultant row', () => {
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="button-edit-consultant"]').should('be.visible');
      });
    });
  });

  describe('Delete Consultant', () => {
    it('should show delete button on consultant row', () => {
      cy.get('[data-testid="consultant-row"]').first().within(() => {
        cy.get('[data-testid="button-delete-consultant"]').should('be.visible');
      });
    });
  });
});
