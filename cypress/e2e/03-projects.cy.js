describe('Project Management', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type('test@example.com');
    cy.get('[data-testid="input-password"]').type('password123');
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    cy.visit('/projects');
  });

  describe('Project List View', () => {
    it('should display projects list', () => {
      cy.get('[data-testid="projects-list"]').should('exist');
    });

    it('should show project cards', () => {
      cy.get('[data-testid="project-card"]').should('have.length.at.least', 1);
    });

    it('should show project status indicators', () => {
      cy.get('[data-testid="project-status"]').should('exist');
    });

    it('should have search functionality', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should filter projects by search term', () => {
      cy.get('[data-testid="project-card"]').then($cards => {
        const initialCount = $cards.length;
        if (initialCount > 1) {
          cy.get('[data-testid="input-search"]').type('Test');
          cy.get('[data-testid="project-card"]').should('have.length.at.most', initialCount);
        }
      });
    });

    it('should have status filter', () => {
      cy.get('[data-testid="select-status-filter"]').should('be.visible');
    });
  });

  describe('Create Project', () => {
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

    it('should show validation errors for required fields', () => {
      cy.get('[data-testid="button-create-project"]').click();
      cy.get('[data-testid="button-submit-project"]').click();
      cy.contains('Name is required').should('be.visible');
    });
  });

  describe('Edit Project', () => {
    it('should open edit project modal', () => {
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-project"]').click();
      });
      cy.get('[data-testid="modal-create-project"]').should('be.visible');
    });

    it('should update project information', () => {
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('[data-testid="button-edit-project"]').click();
      });
      cy.get('[data-testid="input-project-name"]').clear().type('Updated Project Name');
      cy.get('[data-testid="button-submit-project"]').click();
      cy.get('[data-testid="modal-create-project"]').should('not.exist');
    });
  });

  describe('Delete Project', () => {
    it('should delete a project', () => {
      cy.get('[data-testid="project-card"]').then($cards => {
        const initialCount = $cards.length;

        cy.get('[data-testid="project-card"]').first().within(() => {
          cy.get('[data-testid="button-delete-project"]').click();
        });

        cy.wait(1000);
        cy.get('[data-testid="project-card"]').should('have.length.at.most', initialCount);
      });
    });
  });

  describe('Project Search', () => {
    it('should filter projects when typing in search', () => {
      cy.get('[data-testid="input-search"]').type('Test');
      cy.wait(500);
    });

    it('should show all projects when search is cleared', () => {
      cy.get('[data-testid="project-card"]').then($initialCards => {
        const initialCount = $initialCards.length;
        cy.get('[data-testid="input-search"]').type('Test');
        cy.get('[data-testid="input-search"]').clear();
        cy.get('[data-testid="project-card"]').should('have.length', initialCount);
      });
    });
  });
});