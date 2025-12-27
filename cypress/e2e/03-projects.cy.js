describe('Project Management', () => {
  const mockProjects = [
    { id: 1, name: 'EHR Implementation', status: 'active', hospitalId: 1, startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 2, name: 'Staff Training', status: 'planning', hospitalId: 2, startDate: '2024-02-01', endDate: '2024-06-30' }
  ];

  const mockHospitals = [
    { id: 1, name: 'General Hospital' },
    { id: 2, name: 'City Medical Center' }
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

    // Mock projects API
    cy.intercept('GET', '/api/projects*', {
      statusCode: 200,
      body: mockProjects
    }).as('getProjects');

    // Mock hospitals for dropdown
    cy.intercept('GET', '/api/hospitals*', {
      statusCode: 200,
      body: mockHospitals
    }).as('getHospitals');

    cy.intercept('POST', '/api/projects', {
      statusCode: 201,
      body: { id: 3, name: 'New Project', status: 'planning' }
    }).as('createProject');

    cy.intercept('PUT', '/api/projects/*', {
      statusCode: 200,
      body: { id: 1, name: 'Updated Project', status: 'active' }
    }).as('updateProject');

    cy.intercept('DELETE', '/api/projects/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteProject');

    // Login
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.wait('@loginRequest');

    // Navigate to projects
    cy.visit('/projects');
    cy.wait('@getUser');
    cy.wait('@getProjects');
  });

  describe('Project List View', () => {
    it('should display projects page title', () => {
      cy.get('[data-testid="text-projects-title"]').should('be.visible').and('contain', 'Projects');
    });

    it('should display projects list', () => {
      cy.get('[data-testid="projects-list"]').should('exist');
    });

    it('should show project cards', () => {
      cy.get('[data-testid="project-card"]').should('have.length', 2);
    });

    it('should show project status indicators', () => {
      cy.get('[data-testid="project-status"]').should('exist');
    });

    it('should have search functionality', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should have status filter', () => {
      cy.get('[data-testid="select-status-filter"]').should('be.visible');
    });

    it('should display project names', () => {
      cy.get('[data-testid="project-name"]').first().should('contain', 'EHR Implementation');
    });
  });

  describe('Create Project', () => {
    it('should show create project button', () => {
      cy.get('[data-testid="button-create-project"]').should('be.visible');
    });

    it('should open create project modal', () => {
      cy.get('[data-testid="button-create-project"]').click();
      cy.get('[data-testid="modal-create-project"]').should('be.visible');
    });

    it('should display all form fields in create modal', () => {
      cy.get('[data-testid="button-create-project"]').click();
      cy.get('[data-testid="input-project-name"]').should('be.visible');
      cy.get('[data-testid="select-hospital"]').should('be.visible');
      cy.get('[data-testid="input-start-date"]').should('be.visible');
      cy.get('[data-testid="input-end-date"]').should('be.visible');
      cy.get('[data-testid="button-submit-project"]').should('be.visible');
    });
  });

  describe('Edit Project', () => {
    it('should show edit button on project card', () => {
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-project"]').should('be.visible');
      });
    });

    it('should open edit project modal', () => {
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-project"]').click();
      });
      cy.get('[data-testid="modal-create-project"]').should('be.visible');
    });
  });

  describe('Delete Project', () => {
    it('should show delete button on project card', () => {
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="button-delete-project"]').should('be.visible');
      });
    });
  });

  describe('Search Functionality', () => {
    it('should allow typing in search field', () => {
      cy.get('[data-testid="input-search"]')
        .type('EHR')
        .should('have.value', 'EHR');
    });

    it('should clear search when text is deleted', () => {
      cy.get('[data-testid="input-search"]')
        .type('test')
        .clear()
        .should('have.value', '');
    });
  });
});
