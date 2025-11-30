// ***********************************************
// NICEHR Platform - Project Management Tests
// Including 11-Phase EHR Implementation Workflow
// ***********************************************

describe('Project Management', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.navigateTo('projects');
    cy.waitForPageLoad();
  });

  describe('Project List View', () => {
    it('should display projects list', () => {
      cy.get('[data-testid="projects-table"], [data-testid="projects-list"]').should('be.visible');
    });

    it('should show project status indicators', () => {
      cy.get('[data-testid="project-status"]').should('exist');
    });

    it('should filter projects by status', () => {
      cy.selectOption('[data-testid="filter-status"]', 'Active');
      cy.get('[data-testid="project-status"]').each(($el) => {
        cy.wrap($el).should('contain', 'Active');
      });
    });

    it('should filter projects by hospital', () => {
      cy.get('[data-testid="filter-hospital"]').should('be.visible');
    });
  });

  describe('Create Project', () => {
    it('should open create project modal', () => {
      cy.openModal('button-create-project');
      cy.get('[role="dialog"]').should('contain', 'Project');
    });

    it('should create a new project successfully', () => {
      const projectName = `EHR Implementation ${Date.now()}`;
      
      cy.openModal('button-create-project');
      cy.get('[data-testid="input-project-name"]').type(projectName);
      cy.get('[data-testid="input-project-description"]').type('Test EHR implementation project');
      cy.selectOption('[data-testid="select-hospital"]', 'General');
      cy.selectOption('[data-testid="select-ehr-system"]', 'Epic');
      cy.get('[data-testid="input-start-date"]').type('2024-01-15');
      cy.get('[data-testid="input-target-go-live"]').type('2024-12-01');
      cy.get('[data-testid="input-budget"]').type('5000000');
      
      cy.get('[data-testid="button-submit-project"]').click();
      
      cy.get('[role="dialog"]').should('not.exist');
      cy.tableRowExists(projectName);
    });

    it('should validate required fields', () => {
      cy.openModal('button-create-project');
      cy.get('[data-testid="button-submit-project"]').click();
      
      cy.get('.text-red-500, .text-destructive').should('be.visible');
    });
  });

  describe('Project Details', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    it('should display project overview', () => {
      cy.get('[data-testid="project-name"]').should('be.visible');
      cy.get('[data-testid="project-status"]').should('be.visible');
      cy.get('[data-testid="project-hospital"]').should('be.visible');
    });

    it('should show project progress', () => {
      cy.get('[data-testid="project-progress"], [data-testid="progress-bar"]').should('be.visible');
    });

    it('should display phase timeline', () => {
      cy.get('[data-testid="phase-timeline"], [data-testid="phases-list"]').should('be.visible');
    });

    it('should show assigned consultants', () => {
      cy.get('[data-testid="assigned-consultants"]').should('be.visible');
    });
  });

  describe('11-Phase Implementation Workflow', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.waitForPageLoad();
    });

    const phases = [
      'Planning',
      'Discovery',
      'Design',
      'Build',
      'Unit Testing',
      'Integration Testing',
      'Training',
      'Validation',
      'Cutover',
      'Go-Live',
      'Transition'
    ];

    it('should display all 11 phases', () => {
      cy.get('[data-testid="phases-list"]').should('be.visible');
      phases.forEach((phase) => {
        cy.get('[data-testid="phases-list"]').should('contain', phase);
      });
    });

    it('should navigate to phase details', () => {
      cy.get('[data-testid="phase-item"]').first().click();
      cy.url().should('match', /\/phases\/\d+/);
    });

    it('should show phase completion percentage', () => {
      cy.get('[data-testid="phase-completion"]').should('exist');
    });

    it('should show phase status indicators', () => {
      cy.get('[data-testid="phase-status"]').should('exist');
    });
  });

  describe('Phase Steps', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="phase-item"]').first().click();
      cy.waitForPageLoad();
    });

    it('should display phase steps', () => {
      cy.get('[data-testid="phase-steps-list"]').should('be.visible');
    });

    it('should create a new step', () => {
      const stepName = `Test Step ${Date.now()}`;
      
      cy.openModal('button-add-step');
      cy.get('[data-testid="input-step-name"]').type(stepName);
      cy.get('[data-testid="input-step-description"]').type('Test step description');
      cy.get('[data-testid="input-step-order"]').type('1');
      cy.get('[data-testid="button-submit-step"]').click();
      
      cy.get('[data-testid="phase-steps-list"]').should('contain', stepName);
    });

    it('should update step status', () => {
      cy.get('[data-testid="step-item"]').first().within(() => {
        cy.selectOption('[data-testid="select-step-status"]', 'In Progress');
      });
      cy.get('[data-testid="step-status"]').first().should('contain', 'In Progress');
    });

    it('should mark step as completed', () => {
      cy.get('[data-testid="step-item"]').first().within(() => {
        cy.selectOption('[data-testid="select-step-status"]', 'Completed');
      });
      cy.get('[data-testid="step-status"]').first().should('contain', 'Completed');
    });

    it('should mark step as blocked', () => {
      cy.get('[data-testid="step-item"]').first().within(() => {
        cy.selectOption('[data-testid="select-step-status"]', 'Blocked');
      });
      cy.get('[data-testid="step-status"]').first().should('contain', 'Blocked');
    });

    it('should delete a step', () => {
      cy.get('[data-testid="step-item"]').first().find('[data-testid="button-delete-step"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
    });
  });

  describe('Phase Deliverables', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="phase-item"]').first().click();
      cy.get('[data-testid="tab-deliverables"]').click();
      cy.waitForPageLoad();
    });

    it('should display deliverables list', () => {
      cy.get('[data-testid="deliverables-list"]').should('be.visible');
    });

    it('should create a new deliverable', () => {
      const deliverableName = `Test Deliverable ${Date.now()}`;
      
      cy.openModal('button-add-deliverable');
      cy.get('[data-testid="input-deliverable-name"]').type(deliverableName);
      cy.get('[data-testid="input-deliverable-description"]').type('Test deliverable description');
      cy.get('[data-testid="input-due-date"]').type('2024-06-30');
      cy.selectOption('[data-testid="select-deliverable-type"]', 'Required');
      cy.get('[data-testid="button-submit-deliverable"]').click();
      
      cy.get('[data-testid="deliverables-list"]').should('contain', deliverableName);
    });

    it('should submit deliverable for approval', () => {
      cy.get('[data-testid="deliverable-item"]').first().within(() => {
        cy.get('[data-testid="button-submit-deliverable"]').click();
      });
      cy.get('[data-testid="deliverable-status"]').first().should('contain', 'Submitted');
    });

    it('should approve deliverable', () => {
      cy.get('[data-testid="deliverable-item"]').first().within(() => {
        cy.get('[data-testid="button-approve-deliverable"]').click();
      });
      cy.get('[data-testid="deliverable-status"]').first().should('contain', 'Approved');
    });

    it('should upload attachment to deliverable', () => {
      cy.get('[data-testid="deliverable-item"]').first().within(() => {
        cy.get('[data-testid="button-attach-file"]').click();
      });
      // File upload handling would go here
    });
  });

  describe('Phase Risks', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="phase-item"]').first().click();
      cy.get('[data-testid="tab-risks"]').click();
      cy.waitForPageLoad();
    });

    it('should display risk register', () => {
      cy.get('[data-testid="risks-list"]').should('be.visible');
    });

    it('should create a new risk', () => {
      const riskTitle = `Test Risk ${Date.now()}`;
      
      cy.openModal('button-add-risk');
      cy.get('[data-testid="input-risk-title"]').type(riskTitle);
      cy.get('[data-testid="input-risk-description"]').type('Test risk description');
      cy.selectOption('[data-testid="select-risk-probability"]', 'High');
      cy.selectOption('[data-testid="select-risk-impact"]', 'Critical');
      cy.get('[data-testid="input-mitigation-plan"]').type('Test mitigation strategy');
      cy.get('[data-testid="input-contingency-plan"]').type('Test contingency plan');
      cy.get('[data-testid="button-submit-risk"]').click();
      
      cy.get('[data-testid="risks-list"]').should('contain', riskTitle);
    });

    it('should show risk matrix scoring', () => {
      cy.get('[data-testid="risk-score"], [data-testid="risk-matrix"]').should('exist');
    });

    it('should update risk status', () => {
      cy.get('[data-testid="risk-item"]').first().within(() => {
        cy.selectOption('[data-testid="select-risk-status"]', 'Mitigating');
      });
      cy.get('[data-testid="risk-status"]').first().should('contain', 'Mitigating');
    });

    it('should resolve a risk', () => {
      cy.get('[data-testid="risk-item"]').first().within(() => {
        cy.selectOption('[data-testid="select-risk-status"]', 'Resolved');
      });
      cy.get('[data-testid="risk-status"]').first().should('contain', 'Resolved');
    });
  });

  describe('Phase Milestones', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="phase-item"]').first().click();
      cy.get('[data-testid="tab-milestones"]').click();
      cy.waitForPageLoad();
    });

    it('should display milestones', () => {
      cy.get('[data-testid="milestones-list"]').should('be.visible');
    });

    it('should create a new milestone', () => {
      const milestoneName = `Test Milestone ${Date.now()}`;
      
      cy.openModal('button-add-milestone');
      cy.get('[data-testid="input-milestone-name"]').type(milestoneName);
      cy.get('[data-testid="input-milestone-description"]').type('Test milestone description');
      cy.get('[data-testid="input-milestone-due-date"]').type('2024-07-15');
      cy.get('[data-testid="button-submit-milestone"]').click();
      
      cy.get('[data-testid="milestones-list"]').should('contain', milestoneName);
    });

    it('should mark milestone as completed', () => {
      cy.get('[data-testid="milestone-item"]').first().within(() => {
        cy.get('[data-testid="button-complete-milestone"]').click();
      });
      cy.get('[data-testid="milestone-status"]').first().should('contain', 'Completed');
    });
  });

  describe('RACI Matrix', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-raci"]').click();
      cy.waitForPageLoad();
    });

    it('should display RACI matrix', () => {
      cy.get('[data-testid="raci-matrix"]').should('be.visible');
    });

    it('should show team members in matrix', () => {
      cy.get('[data-testid="raci-matrix"] thead').should('be.visible');
    });

    it('should assign RACI responsibility', () => {
      cy.get('[data-testid="raci-cell"]').first().click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').contains('Responsible').click();
    });

    it('should filter RACI by phase', () => {
      cy.selectOption('[data-testid="filter-raci-phase"]', 'Planning');
    });

    it('should export RACI matrix', () => {
      cy.get('[data-testid="button-export-raci"]').should('be.visible');
    });
  });

  describe('Project Edit & Delete', () => {
    it('should edit project details', () => {
      const updatedName = `Updated Project ${Date.now()}`;
      
      cy.get('table tbody tr').first().find('[data-testid="button-edit-project"]').click();
      cy.get('[data-testid="input-project-name"]').clear().type(updatedName);
      cy.get('[data-testid="button-submit-project"]').click();
      
      cy.tableRowExists(updatedName);
    });

    it('should show delete confirmation', () => {
      cy.get('table tbody tr').first().find('[data-testid="button-delete-project"]').click();
      cy.get('[role="alertdialog"]').should('be.visible');
    });

    it('should cancel project deletion', () => {
      cy.get('table tbody tr').first().then(($row) => {
        const projectName = $row.find('td').first().text();
        
        cy.wrap($row).find('[data-testid="button-delete-project"]').click();
        cy.get('[data-testid="button-cancel-delete"]').click();
        
        cy.tableRowExists(projectName);
      });
    });
  });

  describe('Consultant Assignment', () => {
    beforeEach(() => {
      cy.get('table tbody tr').first().click();
      cy.get('[data-testid="tab-team"]').click();
      cy.waitForPageLoad();
    });

    it('should display assigned consultants', () => {
      cy.get('[data-testid="assigned-consultants-list"]').should('be.visible');
    });

    it('should assign consultant to project', () => {
      cy.openModal('button-assign-consultant');
      cy.selectOption('[data-testid="select-consultant"]', 'consultant');
      cy.selectOption('[data-testid="select-role"]', 'Lead');
      cy.get('[data-testid="button-submit-assignment"]').click();
    });

    it('should remove consultant from project', () => {
      cy.get('[data-testid="assigned-consultant-item"]').first()
        .find('[data-testid="button-remove-consultant"]').click();
      cy.get('[data-testid="button-confirm-delete"]').click();
    });
  });
});
