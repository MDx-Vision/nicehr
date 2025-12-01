// ***********************************************
// NICEHR Platform - Training & Competency Tests
// ***********************************************

describe('Training & Competency', () => {
  beforeEach(() => {
    cy.loginViaApi();
    cy.navigateTo('training');
    cy.waitForPageLoad();
  });

  describe('Training Portal', () => {
    describe('Training Modules List', () => {
      it('should display training modules', () => {
        cy.get('[data-testid="training-modules-list"]').should('be.visible');
      });

      it('should show module categories', () => {
        cy.get('[data-testid="module-category"]').should('exist');
      });

      it('should filter by category', () => {
        cy.get('[data-testid="filter-category"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('EHR').click({ force: true });
        cy.get('[data-testid="training-module-item"]').should('have.length.greaterThan', 0);
      });

      it('should filter by completion status', () => {
        cy.get('[data-testid="filter-status"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('Not Started').click({ force: true });
      });

      it('should search training modules', () => {
        cy.get('[data-testid="input-search"]').type('Epic');
        cy.get('[data-testid="training-module-item"]').should('have.length.greaterThan', 0);
      });
    });

    describe('Create Training Module (Admin)', () => {
      it('should open create module modal', () => {
        cy.openModal('button-create-module');
        cy.get('[role="dialog"]').should('contain', 'Module');
      });

      it('should create a new training module', () => {
        const moduleName = `Test Module ${Date.now()}`;

        cy.openModal('button-create-module');
        cy.get('[data-testid="input-module-name"]').type(moduleName);
        cy.get('[data-testid="input-module-description"]').type('Test training module description');
        cy.get('[data-testid="select-category"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('EHR').click({ force: true });
        cy.get('[data-testid="input-duration"]').type('60');
        cy.get('[data-testid="select-difficulty"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('Intermediate').click({ force: true });
        cy.get('[data-testid="checkbox-required"]').click();

        cy.get('[data-testid="button-submit-module"]').click();

        cy.get('[role="dialog"]').should('not.exist');
        cy.get('[data-testid="training-modules-list"]').should('contain', moduleName);
      });

      it('should add content to module', () => {
        cy.get('[data-testid="training-module-item"]').first().click();
        cy.openModal('button-add-content');
        cy.get('[data-testid="input-content-title"]').type('Introduction Video');
        cy.get('[data-testid="select-content-type"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('Video').click({ force: true });
        cy.get('[data-testid="input-content-url"]').type('https://example.com/video.mp4');
        cy.get('[data-testid="button-submit-content"]').click();
      });
    });

    describe('Take Training', () => {
      it('should start training module', () => {
        cy.get('[data-testid="training-module-item"]').first()
          .find('[data-testid="button-start-training"]').click();
        cy.get('[data-testid="training-content"]').should('be.visible');
      });

      it('should track progress through content', () => {
        cy.get('[data-testid="training-module-item"]').first()
          .find('[data-testid="button-start-training"]').click();
        cy.get('[data-testid="training-progress"]').should('be.visible');
      });

      it('should mark content as complete', () => {
        cy.get('[data-testid="training-module-item"]').first()
          .find('[data-testid="button-start-training"]').click();
        cy.get('[data-testid="button-mark-complete"]').click();
      });

      it('should complete training module', () => {
        cy.get('[data-testid="training-module-item"]').first()
          .find('[data-testid="button-start-training"]').click();
        // Mark content complete then navigate
        cy.get('[data-testid="button-mark-complete"]').click();
        cy.get('[data-testid="button-next-content"]').click();
        cy.get('[data-testid="button-mark-complete"]').click();
        cy.get('[data-testid="button-next-content"]').click();
        cy.get('[data-testid="button-mark-complete"]').click();
        cy.get('[data-testid="button-complete-module"]').click();
        cy.get('[data-testid="completion-certificate"]').should('be.visible');
      });
    });

    describe('Training Progress', () => {
      it('should show overall progress dashboard', () => {
        cy.get('[data-testid="tab-my-progress"]').click();
        cy.get('[data-testid="progress-dashboard"]').should('be.visible');
      });

      it('should show completed modules', () => {
        cy.get('[data-testid="tab-my-progress"]').click();
        cy.get('[data-testid="completed-modules-list"]').should('be.visible');
      });

      it('should show in-progress modules', () => {
        cy.get('[data-testid="tab-my-progress"]').click();
        cy.get('[data-testid="in-progress-modules"]').should('be.visible');
      });

      it('should show required modules not started', () => {
        cy.get('[data-testid="tab-my-progress"]').click();
        cy.get('[data-testid="required-modules"]').should('be.visible');
      });
    });
  });

  describe('Competency Assessments', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-assessments"]').click();
      cy.waitForPageLoad();
    });

    describe('Assessment List', () => {
      it('should display assessments list', () => {
        cy.get('[data-testid="assessments-list"]').should('be.visible');
      });

      it('should show assessment status', () => {
        cy.get('[data-testid="assessment-status"]').should('exist');
      });

      it('should filter by type', () => {
        cy.get('[data-testid="filter-assessment-type"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('Skill').click({ force: true });
      });
    });

    describe('Create Assessment (Admin)', () => {
      it('should create a new assessment', () => {
        const assessmentName = `Assessment ${Date.now()}`;

        cy.openModal('button-create-assessment');
        cy.get('[data-testid="input-assessment-name"]').type(assessmentName);
        cy.get('[data-testid="input-assessment-description"]').type('Test competency assessment');
        cy.get('[data-testid="select-assessment-type"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('Skill').click({ force: true });
        cy.get('[data-testid="input-passing-score"]').type('80');
        cy.get('[data-testid="input-time-limit"]').type('30');

        cy.get('[data-testid="button-submit-assessment"]').click();

        cy.get('[data-testid="assessments-list"]').should('contain', assessmentName);
      });

      it('should add questions to assessment', () => {
        cy.get('[data-testid="assessment-item"]').first().click();
        cy.openModal('button-add-question');
        cy.get('[data-testid="input-question-text"]').type('What is the primary function of the Orders module?');
        cy.get('[data-testid="select-question-type"]').click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.get('[role="option"]').contains('Multiple Choice').click({ force: true });
        cy.get('[data-testid="input-option-1"]').type('Process orders');
        cy.get('[data-testid="input-option-2"]').type('Schedule appointments');
        cy.get('[data-testid="input-option-3"]').type('Manage billing');
        cy.get('[data-testid="radio-correct-answer-1"]').click();
        cy.get('[data-testid="button-submit-question"]').click();
      });
    });

    describe('Take Assessment', () => {
      it('should start assessment', () => {
        cy.get('[data-testid="assessment-item"]').first()
          .find('[data-testid="button-start-assessment"]').click();
        cy.get('[data-testid="assessment-content"]').should('be.visible');
      });

      it('should display timer', () => {
        cy.get('[data-testid="assessment-item"]').first()
          .find('[data-testid="button-start-assessment"]').click();
        cy.get('[data-testid="assessment-timer"]').should('be.visible');
      });

      it('should answer questions', () => {
        cy.get('[data-testid="assessment-item"]').first()
          .find('[data-testid="button-start-assessment"]').click();
        cy.get('[data-testid="answer-option"]').first().click();
        cy.get('[data-testid="button-submit-assessment"]').should('be.visible');
      });

      it('should submit assessment', () => {
        cy.get('[data-testid="assessment-item"]').first()
          .find('[data-testid="button-start-assessment"]').click();
        cy.get('[data-testid="answer-option"]').first().click();
        cy.get('[data-testid="button-submit-assessment"]').click();
        cy.get('[data-testid="assessment-results"]').should('be.visible');
      });

      it('should show assessment score', () => {
        // Use the second assessment which has been completed (passed)
        cy.get('[data-testid="assessment-item"]').eq(1)
          .find('[data-testid="button-view-results"]').click();
        cy.get('[data-testid="assessment-score"]').should('be.visible');
      });
    });

    describe('Assessment Results', () => {
      it('should view past assessment results', () => {
        cy.get('[data-testid="tab-my-results"]').click();
        cy.get('[data-testid="results-list"]').should('be.visible');
      });

      it('should show pass/fail status', () => {
        cy.get('[data-testid="tab-my-results"]').click();
        cy.get('[data-testid="result-status"]').should('exist');
      });

      it('should retake failed assessment', () => {
        cy.get('[data-testid="tab-my-results"]').click();
        cy.get('[data-testid="button-retake"]').first().should('be.visible');
      });
    });
  });

  describe('Login Labs', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-login-labs"]').click();
      cy.waitForPageLoad();
    });

    it('should display available lab environments', () => {
      cy.get('[data-testid="login-labs-list"]').should('be.visible');
    });

    it('should show lab system details', () => {
      cy.get('[data-testid="lab-item"]').first().within(() => {
        cy.get('[data-testid="lab-system"]').should('be.visible');
        cy.get('[data-testid="lab-status"]').should('be.visible');
      });
    });

    it('should launch lab environment', () => {
      cy.get('[data-testid="lab-item"]').first()
        .find('[data-testid="button-launch-lab"]').click();
      cy.get('[data-testid="lab-session"]').should('be.visible');
    });

    it('should show lab instructions', () => {
      cy.get('[data-testid="lab-item"]').first().click();
      cy.get('[data-testid="lab-instructions"]').should('be.visible');
    });

    it('should track lab time', () => {
      cy.get('[data-testid="lab-item"]').first()
        .find('[data-testid="button-launch-lab"]').click();
      cy.get('[data-testid="lab-timer"]').should('be.visible');
    });

    it('should end lab session', () => {
      cy.get('[data-testid="lab-item"]').first()
        .find('[data-testid="button-launch-lab"]').click();
      cy.get('[data-testid="button-end-lab"]').click();
      cy.get('[data-testid="button-confirm"]').click();
    });
  });

  describe('Knowledge Base', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-knowledge-base"]').click();
      cy.waitForPageLoad();
    });

    it('should display knowledge base articles', () => {
      cy.get('[data-testid="kb-articles-list"]').should('be.visible');
    });

    it('should search knowledge base', () => {
      cy.get('[data-testid="input-kb-search"]').type('Epic Orders');
      cy.get('[data-testid="kb-search-results"]').should('be.visible');
    });

    it('should filter by category', () => {
      cy.get('[data-testid="filter-kb-category"]').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').contains('EHR Systems').click({ force: true });
      cy.get('[data-testid="kb-article-item"]').should('have.length.greaterThan', 0);
    });

    it('should view article', () => {
      cy.get('[data-testid="kb-article-item"]').first().click();
      cy.get('[data-testid="kb-article-content"]').should('be.visible');
    });

    it('should rate article helpfulness', () => {
      cy.get('[data-testid="kb-article-item"]').first().click();
      cy.get('[data-testid="button-helpful"]').click();
    });

    it('should bookmark article', () => {
      cy.get('[data-testid="kb-article-item"]').first().click();
      cy.get('[data-testid="button-bookmark"]').click();
    });

    it('should create article (Admin)', () => {
      cy.openModal('button-create-article');
      cy.get('[data-testid="input-article-title"]').type('New KB Article');
      cy.get('[data-testid="input-article-content"]').type('Article content here');
      cy.get('[data-testid="select-article-category"]').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').contains('General').click({ force: true });
      cy.get('[data-testid="button-submit-article"]').click();
    });
  });

  describe('Competency Records', () => {
    beforeEach(() => {
      cy.get('[data-testid="tab-competency-records"]').click();
      cy.waitForPageLoad();
    });

    it('should display competency records', () => {
      cy.get('[data-testid="competency-records-list"]').should('be.visible');
    });

    it('should show competency levels', () => {
      cy.get('[data-testid="competency-level"]').should('exist');
    });

    it('should filter by consultant', () => {
      cy.get('[data-testid="filter-consultant"]').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').eq(1).click({ force: true }); // Select first consultant after "All"
    });

    it('should view competency details', () => {
      cy.get('[data-testid="competency-record-item"]').first().click();
      cy.get('[data-testid="competency-details"]').should('be.visible');
    });

    it('should update competency level (Admin)', () => {
      cy.get('[data-testid="competency-record-item"]').first()
        .find('[data-testid="button-update-level"]').click();
      cy.get('[data-testid="select-new-level"]').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').contains('Advanced').click({ force: true });
      cy.get('[data-testid="button-save-level"]').click();
    });

    it('should export competency report', () => {
      cy.get('[data-testid="button-export-competencies"]').click();
    });
  });
});
