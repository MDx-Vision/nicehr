describe('Training & Competency', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  const mockModules = [
    { id: 1, name: 'EMR Basics', category: 'clinical', status: 'not_started', duration: 60, difficulty: 'beginner', required: true, progress: 0 },
    { id: 2, name: 'Documentation Standards', category: 'compliance', status: 'in_progress', duration: 45, difficulty: 'intermediate', required: true, progress: 50 },
    { id: 3, name: 'Patient Safety', category: 'clinical', status: 'completed', duration: 30, difficulty: 'beginner', required: false, progress: 100 }
  ];

  const mockAssessments = [
    { id: 1, name: 'EMR Certification', type: 'certification', status: 'pending', passingScore: 80, timeLimit: 60 },
    { id: 2, name: 'Compliance Quiz', type: 'quiz', status: 'completed', passingScore: 70, timeLimit: 30, score: 85 }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('GET', '/api/training/modules*', {
      statusCode: 200,
      body: mockModules
    }).as('getModules');

    cy.intercept('GET', '/api/training/assessments*', {
      statusCode: 200,
      body: mockAssessments
    }).as('getAssessments');

    cy.intercept('GET', '/api/training/progress*', {
      statusCode: 200,
      body: { completed: 5, inProgress: 2, required: 3 }
    }).as('getProgress');

    cy.visit('/training');
    cy.wait('@getUser');
  });

  describe('Training Page Layout', () => {
    it('should display training page with tabs', () => {
      cy.get('[data-testid="tab-my-progress"]').should('be.visible');
      cy.get('[data-testid="tab-assessments"]').should('be.visible');
      cy.get('[data-testid="tab-login-labs"]').should('be.visible');
      cy.get('[data-testid="tab-knowledge-base"]').should('be.visible');
    });

    it('should display search input', () => {
      cy.get('[data-testid="input-search"]').should('be.visible');
    });

    it('should display category filter', () => {
      cy.get('[data-testid="filter-category"]').should('be.visible');
    });

    it('should display status filter', () => {
      cy.get('[data-testid="filter-status"]').should('be.visible');
    });

    it('should display create module button for admin', () => {
      cy.get('[data-testid="button-create-module"]').should('be.visible');
    });
  });

  describe('Training Modules List', () => {
    it('should display training modules list', () => {
      cy.get('[data-testid="training-modules-list"]').should('exist');
    });

    it('should display module items', () => {
      cy.get('[data-testid="training-module-item"]').should('have.length.at.least', 1);
    });

    it('should show module category badge', () => {
      cy.get('[data-testid="module-category"]').first().should('exist');
    });

    it('should have start training button', () => {
      cy.get('[data-testid="button-start-training"]').first().should('exist');
    });
  });

  describe('My Progress Tab', () => {
    it('should switch to my progress tab', () => {
      cy.get('[data-testid="tab-my-progress"]').click();
      cy.get('[data-testid="progress-dashboard"]').should('exist');
    });

    it('should display completed modules section', () => {
      cy.get('[data-testid="tab-my-progress"]').click();
      cy.get('[data-testid="completed-modules-list"]').scrollIntoView().should('exist');
    });

    it('should display in progress modules section', () => {
      cy.get('[data-testid="tab-my-progress"]').click();
      cy.get('[data-testid="in-progress-modules"]').scrollIntoView().should('exist');
    });

    it('should display required modules section', () => {
      cy.get('[data-testid="tab-my-progress"]').click();
      cy.get('[data-testid="required-modules"]').scrollIntoView().should('exist');
    });
  });

  describe('Assessments Tab', () => {
    it('should switch to assessments tab', () => {
      cy.get('[data-testid="tab-assessments"]').click();
      cy.get('[data-testid="assessments-list"]').should('exist');
    });

    it('should display assessment items', () => {
      cy.get('[data-testid="tab-assessments"]').click();
      cy.get('[data-testid="assessment-item"]').should('have.length.at.least', 1);
    });

    it('should have assessment type filter', () => {
      cy.get('[data-testid="tab-assessments"]').click();
      cy.get('[data-testid="filter-assessment-type"]').should('exist');
    });

    it('should display create assessment button for admin', () => {
      cy.get('[data-testid="tab-assessments"]').click();
      cy.get('[data-testid="button-create-assessment"]').should('exist');
    });

    it('should show my results sub-tab', () => {
      cy.get('[data-testid="tab-assessments"]').click();
      cy.get('[data-testid="tab-my-results"]').should('exist');
    });
  });

  describe('Knowledge Base Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/training/articles*', {
        statusCode: 200,
        body: [
          { id: 1, title: 'Getting Started Guide', category: 'general', content: 'Welcome...' },
          { id: 2, title: 'EMR Best Practices', category: 'clinical', content: 'Tips...' }
        ]
      }).as('getArticles');
    });

    it('should switch to knowledge base tab', () => {
      cy.get('[data-testid="tab-knowledge-base"]').click();
      cy.get('[data-testid="kb-articles-list"]').should('exist');
    });

    it('should display search input for articles', () => {
      cy.get('[data-testid="tab-knowledge-base"]').click();
      cy.get('[data-testid="input-kb-search"]').should('exist');
    });

    it('should display category filter', () => {
      cy.get('[data-testid="tab-knowledge-base"]').click();
      cy.get('[data-testid="filter-kb-category"]').should('exist');
    });

    it('should display create article button for admin', () => {
      cy.get('[data-testid="tab-knowledge-base"]').click();
      cy.get('[data-testid="button-create-article"]').should('exist');
    });
  });

  describe('Competency Records Tab', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/training/competencies*', {
        statusCode: 200,
        body: [
          { id: 1, consultantId: 1, skill: 'EMR Navigation', level: 'expert' },
          { id: 2, consultantId: 1, skill: 'Documentation', level: 'proficient' }
        ]
      }).as('getCompetencies');
    });

    it('should switch to competency records tab', () => {
      cy.get('[data-testid="tab-competency-records"]').click();
      cy.get('[data-testid="competency-records-list"]').should('exist');
    });

    it('should display consultant filter', () => {
      cy.get('[data-testid="tab-competency-records"]').click();
      cy.get('[data-testid="filter-consultant"]').should('exist');
    });

    it('should display export button', () => {
      cy.get('[data-testid="tab-competency-records"]').click();
      cy.get('[data-testid="button-export-competencies"]').should('exist');
    });
  });

  describe('Create Training Module', () => {
    it('should open create module modal', () => {
      cy.get('[data-testid="button-create-module"]').click();
      cy.get('[data-testid="input-module-name"]').should('be.visible');
    });

    it('should display module form fields', () => {
      cy.get('[data-testid="button-create-module"]').click();
      cy.get('[data-testid="input-module-name"]').should('exist');
      cy.get('[data-testid="input-module-description"]').should('exist');
      cy.get('[data-testid="select-category"]').should('exist');
      cy.get('[data-testid="input-duration"]').should('exist');
      cy.get('[data-testid="select-difficulty"]').should('exist');
    });

    it('should have submit button', () => {
      cy.get('[data-testid="button-create-module"]').click();
      cy.get('[data-testid="button-submit-module"]').should('exist');
    });
  });

  // ===========================================================================
  // Advanced Training Features
  // ===========================================================================

  describe('Training Completion Flow', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'admin' }
      }).as('getUser');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      cy.visit('/training');
      cy.wait('@getUser');
    });

    it('should complete training module with content navigation', () => {
      // Click Start on first module
      cy.get('[data-testid="button-start-training"]').first().click();
      // Should show training content view
      cy.get('[data-testid="training-content"]').should('be.visible');
      // Should have progress bar
      cy.get('[data-testid="training-progress"]').should('be.visible');
      // Should have Mark Complete button
      cy.get('[data-testid="button-mark-complete"]').should('be.visible');
    });

    it('should generate completion certificate', () => {
      // Start training on first module
      cy.get('[data-testid="button-start-training"]').first().click();
      // Mark content as complete and proceed through all content
      cy.get('[data-testid="button-mark-complete"]').click();
      cy.get('[data-testid="button-next-content"]').click();
      cy.get('[data-testid="button-mark-complete"]').click();
      cy.get('[data-testid="button-next-content"]').click();
      cy.get('[data-testid="button-mark-complete"]').click();
      // Complete the module
      cy.get('[data-testid="button-complete-module"]').click();
      // Certificate should be displayed
      cy.get('[data-testid="completion-certificate"]').should('be.visible');
    });

    it('should track progress with progress bar', () => {
      cy.get('[data-testid="button-start-training"]').first().click();
      cy.get('[data-testid="training-progress"]').should('be.visible');
      // Mark first content complete
      cy.get('[data-testid="button-mark-complete"]').click();
      // Mark Complete button should now be disabled (showing "Completed")
      cy.get('[data-testid="button-mark-complete"]').should('be.disabled');
    });
  });

  describe('Assessment Flow', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'admin' }
      }).as('getUser');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      cy.visit('/training');
      cy.wait('@getUser');
      // Navigate to Assessments tab
      cy.get('[data-testid="tab-assessments"]').click();
    });

    it('should take timed assessment', () => {
      // Start assessment that hasn't been taken yet
      cy.get('[data-testid="button-start-assessment"]').first().click();
      // Should show assessment content with timer
      cy.get('[data-testid="assessment-timer"]').should('be.visible');
      cy.get('[data-testid="assessment-content"]').should('be.visible');
      // Should show answer options
      cy.get('[data-testid="answer-option"]').should('have.length.at.least', 2);
    });

    it('should submit assessment and view score', () => {
      // Start assessment
      cy.get('[data-testid="button-start-assessment"]').first().click();
      // Select an answer
      cy.get('[data-testid="answer-option"]').first().click();
      // Submit assessment
      cy.get('[data-testid="button-submit-assessment"]').click();
      // Should show results with score
      cy.get('[data-testid="assessment-results"]').should('be.visible');
      cy.get('[data-testid="assessment-score"]').should('be.visible');
    });

    it('should show retake option for failed assessment', () => {
      // Go to My Results tab
      cy.get('[data-testid="tab-my-results"]').click();
      // Should show results list
      cy.get('[data-testid="results-list"]').should('be.visible');
      // Failed assessment should have retake button
      cy.get('[data-testid="result-status"]').contains('Failed').should('exist');
      cy.get('[data-testid="button-retake"]').should('be.visible');
    });
  });
});
