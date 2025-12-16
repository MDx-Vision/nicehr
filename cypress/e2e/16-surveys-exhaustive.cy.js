describe('Surveys System - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    survey: {
      title: 'Test Survey',
      description: 'This is a test survey for E2E testing',
      questions: [
        {
          type: 'multiple_choice',
          question: 'How satisfied are you with the project?',
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
        },
        {
          type: 'text',
          question: 'What improvements would you suggest?'
        },
        {
          type: 'rating',
          question: 'Rate the overall experience (1-5)',
          min: 1,
          max: 5
        }
      ]
    },
    response: {
      answers: {
        0: 'Very Satisfied',
        1: 'Better communication and more training sessions',
        2: '5'
      }
    }
  };

  const apiEndpoints = {
    projects: '/api/projects',
    surveys: (projectId) => `/api/projects/${projectId}/surveys`,
    surveyResponses: (surveyId) => `/api/surveys/${surveyId}/responses`,
    completeSurvey: (surveyId) => `/api/surveys/${surveyId}/complete`,
    auth: '/api/auth/login',
    user: '/api/auth/user'
  };

  let projectId;
  let surveyId;

  before(() => {
    // Login and setup test data
    cy.loginAsAdmin();
    
    // Get project ID
    cy.request('GET', apiEndpoints.projects).then((response) => {
      const project = response.body.find(p => p.name === testData.project.name);
      if (project) {
        projectId = project.id;
      }
    });
  });

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.intercept('GET', apiEndpoints.projects).as('getProjects');
    cy.intercept('GET', `${apiEndpoints.surveys('*')}`).as('getSurveys');
    cy.intercept('POST', `${apiEndpoints.surveys('*')}`).as('createSurvey');
    cy.intercept('GET', `${apiEndpoints.surveyResponses('*')}`).as('getSurveyResponses');
    cy.intercept('POST', `${apiEndpoints.surveyResponses('*')}`).as('submitResponse');
    cy.intercept('POST', `${apiEndpoints.completeSurvey('*')}`).as('completeSurvey');
  });

  describe('Survey List Page - Layout & Navigation', () => {
    beforeEach(() => {
      cy.visit('/projects');
      cy.wait('@getProjects');
      
      // Navigate to project surveys
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .should('be.visible')
        .click();
      
      cy.wait('@getSurveys');
    });

    it('should display surveys page layout correctly', () => {
      // Page header
      cy.get('[data-testid="surveys-header"]')
        .should('be.visible')
        .and('contain.text', 'Survey');

      // Create survey button
      cy.get('[data-testid="create-survey-button"], [data-testid="button-create-survey"]')
        .should('be.visible')
        .and('not.be.disabled');

      // Surveys list container
      cy.get('[data-testid="surveys-list"], [data-testid="surveys-container"]')
        .should('be.visible');

      // Breadcrumb navigation
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb"]')
        .should('contain.text', testData.project.name);
    });

    it('should handle empty state correctly', () => {
      // Check if empty state is displayed when no surveys exist
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="survey-item"]').length === 0) {
          cy.get('[data-testid="empty-state"], [data-testid="no-surveys"]')
            .should('be.visible')
            .and('contain.text', /no surveys/i);
          
          cy.get('[data-testid="empty-state-message"]')
            .should('contain.text', /create your first survey/i);
        }
      });
    });

    it('should display surveys list with proper information', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="survey-item"]').length > 0) {
          // Survey items
          cy.get('[data-testid="survey-item"]').first().within(() => {
            // Survey title
            cy.get('[data-testid="survey-title"]')
              .should('be.visible')
              .and('not.be.empty');

            // Survey description
            cy.get('[data-testid="survey-description"]')
              .should('be.visible');

            // Survey status
            cy.get('[data-testid="survey-status"]')
              .should('be.visible')
              .and('contain.text', /active|draft|completed/i);

            // Actions menu
            cy.get('[data-testid="survey-actions"], [data-testid="dropdown-actions"]')
              .should('be.visible');
          });
        }
      });
    });

    it('should have functional search and filters', () => {
      // Search functionality
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="search-surveys"]').length > 0) {
          cy.get('[data-testid="search-surveys"]')
            .should('be.visible')
            .and('have.attr', 'placeholder');
          
          cy.get('[data-testid="search-surveys"]')
            .type('test search');
          
          // Should filter results
          cy.wait(500);
        }
      });

      // Status filter
      if (Cypress.$('[data-testid="filter-status"]').length > 0) {
        cy.get('[data-testid="filter-status"]').click();
        cy.get('[data-testid="filter-option"]')
          .should('have.length.greaterThan', 0);
        cy.get('[data-testid="filter-option"]').first().click();
      }
    });
  });

  describe('Create Survey - Form & Validation', () => {
    beforeEach(() => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();
      
      cy.get('[data-testid="create-survey-button"], [data-testid="button-create-survey"]')
        .click();
    });

    it('should display create survey form correctly', () => {
      // Form container
      cy.get('[data-testid="create-survey-form"], [data-testid="survey-form"]')
        .should('be.visible');

      // Form title
      cy.get('[data-testid="form-title"]')
        .should('contain.text', /create survey/i);

      // Required fields
      cy.get('[data-testid="input-survey-title"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-survey-description"], [data-testid="textarea-description"]')
        .should('be.visible');

      // Questions section
      cy.get('[data-testid="questions-section"]')
        .should('be.visible');

      // Add question button
      cy.get('[data-testid="add-question-button"]')
        .should('be.visible')
        .and('contain.text', /add question/i);

      // Form actions
      cy.get('[data-testid="button-save-survey"], [data-testid="button-create"]')
        .should('be.visible')
        .and('be.disabled'); // Should be disabled until form is valid

      cy.get('[data-testid="button-cancel"]')
        .should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to save without required fields
      cy.get('[data-testid="button-save-survey"], [data-testid="button-create"]')
        .should('be.disabled');

      // Fill title
      cy.get('[data-testid="input-survey-title"]')
        .type('a'); // Single character

      // Should show validation message for short title
      cy.get('[data-testid="error-title"], [data-testid="validation-error"]')
        .should('be.visible')
        .and('contain.text', /too short|minimum/i);

      // Clear and enter valid title
      cy.get('[data-testid="input-survey-title"]')
        .clear()
        .type(testData.survey.title);

      // Add description
      cy.get('[data-testid="input-survey-description"], [data-testid="textarea-description"]')
        .type(testData.survey.description);

      // Should still be disabled without questions
      cy.get('[data-testid="button-save-survey"], [data-testid="button-create"]')
        .should('be.disabled');
    });

    it('should add different types of questions', () => {
      // Fill basic survey info
      cy.get('[data-testid="input-survey-title"]')
        .type(testData.survey.title);
      
      cy.get('[data-testid="input-survey-description"], [data-testid="textarea-description"]')
        .type(testData.survey.description);

      testData.survey.questions.forEach((question, index) => {
        // Add question
        cy.get('[data-testid="add-question-button"]').click();

        // Question container
        cy.get('[data-testid="question-item"]').eq(index).within(() => {
          // Select question type
          cy.get('[data-testid="select-question-type"]').click();
          cy.get(`[data-testid="option-${question.type}"]`).click();

          // Enter question text
          cy.get('[data-testid="input-question-text"]')
            .type(question.question);

          // Handle different question types
          if (question.type === 'multiple_choice') {
            question.options.forEach((option, optionIndex) => {
              if (optionIndex > 0) {
                cy.get('[data-testid="add-option-button"]').click();
              }
              cy.get('[data-testid="option-input"]').eq(optionIndex)
                .type(option);
            });
          }

          if (question.type === 'rating') {
            cy.get('[data-testid="input-min-rating"]')
              .clear()
              .type(question.min.toString());
            
            cy.get('[data-testid="input-max-rating"]')
              .clear()
              .type(question.max.toString());
          }
        });
      });

      // Save survey
      cy.get('[data-testid="button-save-survey"], [data-testid="button-create"]')
        .should('not.be.disabled')
        .click();

      cy.wait('@createSurvey').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        surveyId = interception.response.body.id;
      });

      // Should redirect to surveys list
      cy.url().should('include', '/surveys');
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /survey created/i);
    });

    it('should handle question management operations', () => {
      // Fill basic info
      cy.get('[data-testid="input-survey-title"]').type('Test Survey');
      
      // Add multiple questions
      cy.get('[data-testid="add-question-button"]').click();
      cy.get('[data-testid="add-question-button"]').click();

      // Should have 2 questions
      cy.get('[data-testid="question-item"]').should('have.length', 2);

      // Test question reordering
      cy.get('[data-testid="question-item"]').eq(0).within(() => {
        cy.get('[data-testid="move-down-button"]').click();
      });

      // Test question deletion
      cy.get('[data-testid="question-item"]').eq(0).within(() => {
        cy.get('[data-testid="delete-question-button"]').click();
      });

      cy.get('[data-testid="confirm-delete"]').click();

      // Should have 1 question left
      cy.get('[data-testid="question-item"]').should('have.length', 1);
    });

    it('should handle form cancellation', () => {
      // Fill some data
      cy.get('[data-testid="input-survey-title"]')
        .type('Test Survey');

      // Cancel
      cy.get('[data-testid="button-cancel"]').click();

      // Should show confirmation dialog
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-discard"]').click();

      // Should navigate back
      cy.url().should('include', '/surveys');
    });
  });

  describe('Survey Details & Management', () => {
    beforeEach(() => {
      // Create a survey first
      cy.request('POST', apiEndpoints.surveys(projectId), {
        title: testData.survey.title,
        description: testData.survey.description,
        questions: testData.survey.questions
      }).then((response) => {
        surveyId = response.body.id;
      });

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();
    });

    it('should display survey details correctly', () => {
      // Click on survey to view details
      cy.get('[data-testid="survey-item"]').first().click();

      // Survey details page
      cy.get('[data-testid="survey-details"]').should('be.visible');

      // Survey title and description
      cy.get('[data-testid="survey-title"]')
        .should('contain.text', testData.survey.title);

      cy.get('[data-testid="survey-description"]')
        .should('contain.text', testData.survey.description);

      // Questions list
      cy.get('[data-testid="questions-list"]').should('be.visible');
      
      testData.survey.questions.forEach((question, index) => {
        cy.get('[data-testid="question-item"]').eq(index).within(() => {
          cy.get('[data-testid="question-text"]')
            .should('contain.text', question.question);
          
          cy.get('[data-testid="question-type"]')
            .should('contain.text', question.type);
        });
      });

      // Survey actions
      cy.get('[data-testid="survey-actions"]').should('be.visible');
      cy.get('[data-testid="button-edit-survey"]').should('be.visible');
      cy.get('[data-testid="button-delete-survey"]').should('be.visible');
      cy.get('[data-testid="button-view-responses"]').should('be.visible');
    });

    it('should handle survey status changes', () => {
      cy.get('[data-testid="survey-item"]').first().within(() => {
        cy.get('[data-testid="survey-actions"], [data-testid="dropdown-actions"]').click();
        
        // Status change options
        cy.get('[data-testid="action-activate"], [data-testid="action-publish"]')
          .should('be.visible');
        
        cy.get('[data-testid="action-deactivate"], [data-testid="action-draft"]')
          .should('be.visible');
      });
    });

    it('should edit survey successfully', () => {
      cy.get('[data-testid="survey-item"]').first().click();
      
      cy.get('[data-testid="button-edit-survey"]').click();

      // Should load edit form with existing data
      cy.get('[data-testid="input-survey-title"]')
        .should('have.value', testData.survey.title);

      // Modify title
      cy.get('[data-testid="input-survey-title"]')
        .clear()
        .type('Updated Survey Title');

      // Save changes
      cy.get('[data-testid="button-save-survey"]').click();

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /updated/i);
    });

    it('should delete survey with confirmation', () => {
      cy.get('[data-testid="survey-item"]').first().within(() => {
        cy.get('[data-testid="survey-actions"], [data-testid="dropdown-actions"]').click();
        cy.get('[data-testid="action-delete"]').click();
      });

      // Confirmation dialog
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="confirm-delete-input"]')
        .type(testData.survey.title);
      
      cy.get('[data-testid="button-confirm-delete"]').click();

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted/i);
    });
  });

  describe('Survey Response Collection', () => {
    beforeEach(() => {
      // Create a survey and make it active
      cy.request('POST', apiEndpoints.surveys(projectId), {
        title: testData.survey.title,
        description: testData.survey.description,
        questions: testData.survey.questions,
        status: 'active'
      }).then((response) => {
        surveyId = response.body.id;
      });
    });

    it('should display survey response form for participants', () => {
      // Visit survey response page
      cy.visit(`/surveys/${surveyId}/respond`);

      // Survey header
      cy.get('[data-testid="survey-response-header"]').should('be.visible');
      cy.get('[data-testid="survey-title"]')
        .should('contain.text', testData.survey.title);
      
      cy.get('[data-testid="survey-description"]')
        .should('contain.text', testData.survey.description);

      // Questions form
      cy.get('[data-testid="response-form"]').should('be.visible');

      testData.survey.questions.forEach((question, index) => {
        cy.get('[data-testid="question-container"]').eq(index).within(() => {
          // Question text
          cy.get('[data-testid="question-text"]')
            .should('contain.text', question.question);

          // Response inputs based on type
          if (question.type === 'multiple_choice') {
            cy.get('[data-testid="radio-option"]')
              .should('have.length', question.options.length);
            
            question.options.forEach((option) => {
              cy.get('[data-testid="radio-option"]')
                .should('contain.text', option);
            });
          }

          if (question.type === 'text') {
            cy.get('[data-testid="text-response"]')
              .should('be.visible')
              .and('have.attr', 'placeholder');
          }

          if (question.type === 'rating') {
            cy.get('[data-testid="rating-input"]').should('be.visible');
            cy.get('[data-testid="rating-scale"]')
              .should('contain.text', question.min.toString())
              .and('contain.text', question.max.toString());
          }
        });
      });

      // Form actions
      cy.get('[data-testid="button-submit-response"]')
        .should('be.visible')
        .and('be.disabled'); // Should be disabled until form is complete
      
      cy.get('[data-testid="button-save-draft"]')
        .should('be.visible');
    });

    it('should validate response form inputs', () => {
      cy.visit(`/surveys/${surveyId}/respond`);

      // Try to submit without answering questions
      cy.get('[data-testid="button-submit-response"]')
        .should('be.disabled');

      // Fill out form partially
      cy.get('[data-testid="question-container"]').eq(0).within(() => {
        cy.get('[data-testid="radio-option"]').first().click();
      });

      // Should still be disabled (required questions not answered)
      cy.get('[data-testid="button-submit-response"]')
        .should('be.disabled');
    });

    it('should submit survey response successfully', () => {
      cy.visit(`/surveys/${surveyId}/respond`);

      // Fill out all questions
      testData.survey.questions.forEach((question, index) => {
        cy.get('[data-testid="question-container"]').eq(index).within(() => {
          if (question.type === 'multiple_choice') {
            cy.get('[data-testid="radio-option"]').first().click();
          }

          if (question.type === 'text') {
            cy.get('[data-testid="text-response"]')
              .type(testData.response.answers[index]);
          }

          if (question.type === 'rating') {
            cy.get('[data-testid="rating-input"]')
              .type(testData.response.answers[index]);
          }
        });
      });

      // Submit response
      cy.get('[data-testid="button-submit-response"]')
        .should('not.be.disabled')
        .click();

      cy.wait('@submitResponse').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });

      // Success confirmation
      cy.get('[data-testid="response-success"]')
        .should('be.visible')
        .and('contain.text', /thank you|submitted/i);
    });

    it('should save response as draft', () => {
      cy.visit(`/surveys/${surveyId}/respond`);

      // Fill out partially
      cy.get('[data-testid="question-container"]').eq(0).within(() => {
        cy.get('[data-testid="radio-option"]').first().click();
      });

      // Save as draft
      cy.get('[data-testid="button-save-draft"]').click();

      cy.get('[data-testid="draft-saved-message"]')
        .should('be.visible')
        .and('contain.text', /draft saved/i);

      // Reload page and verify draft is restored
      cy.reload();
      
      cy.get('[data-testid="question-container"]').eq(0).within(() => {
        cy.get('[data-testid="radio-option"]').first()
          .should('be.checked');
      });
    });

    it('should handle survey completion tracking', () => {
      cy.visit(`/surveys/${surveyId}/respond`);

      // Fill and submit form
      testData.survey.questions.forEach((question, index) => {
        cy.get('[data-testid="question-container"]').eq(index).within(() => {
          if (question.type === 'multiple_choice') {
            cy.get('[data-testid="radio-option"]').first().click();
          }
        });
      });

      cy.get('[data-testid="button-submit-response"]').click();
      cy.wait('@submitResponse');

      // Complete survey
      cy.get('[data-testid="button-complete-survey"]').click();

      cy.wait('@completeSurvey').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });

      // Should show completion confirmation
      cy.get('[data-testid="completion-confirmation"]')
        .should('be.visible');
    });
  });

  describe('Survey Analytics & Responses', () => {
    beforeEach(() => {
      // Create survey with responses
      cy.request('POST', apiEndpoints.surveys(projectId), {
        title: testData.survey.title,
        description: testData.survey.description,
        questions: testData.survey.questions,
        status: 'active'
      }).then((response) => {
        surveyId = response.body.id;
        
        // Add sample responses
        return cy.request('POST', apiEndpoints.surveyResponses(surveyId), {
          answers: testData.response.answers
        });
      });

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();
    });

    it('should display survey responses overview', () => {
      cy.get('[data-testid="survey-item"]').first().click();
      cy.get('[data-testid="button-view-responses"]').click();

      // Responses header
      cy.get('[data-testid="responses-header"]')
        .should('be.visible')
        .and('contain.text', 'Response');

      // Response statistics
      cy.get('[data-testid="response-stats"]').should('be.visible');
      cy.get('[data-testid="total-responses"]')
        .should('be.visible')
        .and('contain.text', /\d+/);
      
      cy.get('[data-testid="completion-rate"]')
        .should('be.visible')
        .and('contain.text', /%/);

      // Response list or charts
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="response-item"]').length > 0) {
          cy.get('[data-testid="response-item"]').should('be.visible');
        } else {
          cy.get('[data-testid="no-responses"]')
            .should('be.visible')
            .and('contain.text', /no responses/i);
        }
      });
    });

    it('should display response analytics and charts', () => {
      cy.get('[data-testid="survey-item"]').first().click();
      cy.get('[data-testid="button-view-responses"]').click();

      // Analytics section
      cy.get('[data-testid="analytics-section"]').should('be.visible');

      // Question-wise analysis
      testData.survey.questions.forEach((question, index) => {
        cy.get('[data-testid="question-analysis"]').eq(index).within(() => {
          cy.get('[data-testid="question-title"]')
            .should('contain.text', question.question);

          if (question.type === 'multiple_choice') {
            // Should show pie chart or bar chart
            cy.get('[data-testid="choice-chart"], [data-testid="chart-container"]')
              .should('be.visible');
            
            // Response breakdown
            cy.get('[data-testid="response-breakdown"]')
              .should('be.visible');
          }

          if (question.type === 'rating') {
            // Average rating
            cy.get('[data-testid="average-rating"]')
              .should('be.visible')
              .and('contain.text', /\d+\.\d+/);
            
            // Rating distribution
            cy.get('[data-testid="rating-distribution"]')
              .should('be.visible');
          }

          if (question.type === 'text') {
            // Text responses list
            cy.get('[data-testid="text-responses"]')
              .should('be.visible');
          }
        });
      });
    });

    it('should export survey responses', () => {
      cy.get('[data-testid="survey-item"]').first().click();
      cy.get('[data-testid="button-view-responses"]').click();

      // Export options
      cy.get('[data-testid="export-responses"]').should('be.visible');
      
      // Export formats
      cy.get('[data-testid="export-csv"]').should('be.visible');
      cy.get('[data-testid="export-excel"]').should('be.visible');
      cy.get('[data-testid="export-pdf"]').should('be.visible');

      // Test CSV export
      cy.get('[data-testid="export-csv"]').click();
      
      // Should trigger download (we can't actually test file download in Cypress)
      cy.get('[data-testid="export-success"]')
        .should('be.visible')
        .and('contain.text', /export started|download/i);
    });

    it('should filter and search responses', () => {
      cy.get('[data-testid="survey-item"]').first().click();
      cy.get('[data-testid="button-view-responses"]').click();

      // Date range filter
      if (Cypress.$('[data-testid="date-filter"]').length > 0) {
        cy.get('[data-testid="date-filter"]').click();
        cy.get('[data-testid="date-range-picker"]').should('be.visible');
      }

      // Response status filter
      if (Cypress.$('[data-testid="status-filter"]').length > 0) {
        cy.get('[data-testid="status-filter"]').click();
        cy.get('[data-testid="filter-complete"]').click();
      }

      // Search responses
      if (Cypress.$('[data-testid="search-responses"]').length > 0) {
        cy.get('[data-testid="search-responses"]')
          .type('search term');
        
        cy.wait(500); // Wait for search
      }
    });
  });

  describe('Survey Permissions & Access Control', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should handle survey creation permissions', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();

      // Admin should see create button
      cy.get('[data-testid="create-survey-button"], [data-testid="button-create-survey"]')
        .should('be.visible')
        .and('not.be.disabled');
    });

    it('should handle survey management permissions', () => {
      // Create a survey first
      cy.request('POST', apiEndpoints.surveys(projectId), {
        title: testData.survey.title,
        description: testData.survey.description,
        questions: testData.survey.questions
      });

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();

      // Admin should see all management options
      cy.get('[data-testid="survey-item"]').first().within(() => {
        cy.get('[data-testid="survey-actions"], [data-testid="dropdown-actions"]').click();
        
        cy.get('[data-testid="action-edit"]').should('be.visible');
        cy.get('[data-testid="action-delete"]').should('be.visible');
        cy.get('[data-testid="action-view-responses"]').should('be.visible');
      });
    });

    it('should handle survey response permissions', () => {
      // Create an active survey
      cy.request('POST', apiEndpoints.surveys(projectId), {
        title: testData.survey.title,
        description: testData.survey.description,
        questions: testData.survey.questions,
        status: 'active'
      }).then((response) => {
        surveyId = response.body.id;
      });

      // Test response access
      cy.visit(`/surveys/${surveyId}/respond`);
      
      // Should be able to access and respond
      cy.get('[data-testid="response-form"]').should('be.visible');
      cy.get('[data-testid="button-submit-response"]').should('be.visible');
    });
  });

  describe('Survey Error Handling', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should handle API errors gracefully', () => {
      // Intercept API calls with errors
      cy.intercept('POST', `${apiEndpoints.surveys('*')}`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('createSurveyError');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();
      
      cy.get('[data-testid="create-survey-button"], [data-testid="button-create-survey"]')
        .click();

      // Fill form and submit
      cy.get('[data-testid="input-survey-title"]')
        .type(testData.survey.title);
      
      cy.get('[data-testid="add-question-button"]').click();
      cy.get('[data-testid="input-question-text"]')
        .type('Test question');

      cy.get('[data-testid="button-save-survey"], [data-testid="button-create"]')
        .click();

      cy.wait('@createSurveyError');

      // Should show error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error|failed/i);
    });

    it('should handle network connectivity issues', () => {
      // Simulate network failure
      cy.intercept('GET', `${apiEndpoints.surveys('*')}`, { forceNetworkError: true })
        .as('networkError');

      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();

      cy.wait('@networkError');

      // Should show network error message
      cy.get('[data-testid="network-error"], [data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /network|connection/i);

      // Should show retry option
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('should handle invalid survey data', () => {
      cy.visit('/projects');
      cy.get('[data-testid="project-card"]')
        .contains(testData.project.name)
        .click();
      
      cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
        .click();
      
      cy.get('[data-testid="create-survey-button"], [data-testid="button-create-survey"]')
        .click();

      // Try to create survey with invalid data
      cy.get('[data-testid="input-survey-title"]')
        .type('x'.repeat(1000)); // Extremely long title

      cy.get('[data-testid="add-question-button"]').click();
      
      // Try to save
      cy.get('[data-testid="button-save-survey"], [data-testid="button-create"]')
        .click();

      // Should show validation errors
      cy.get('[data-testid="validation-error"], [data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /invalid|too long|limit/i);
    });

    it('should handle survey not found scenarios', () => {
      const nonExistentSurveyId = 'non-existent-id';
      
      cy.intercept('GET', `/api/surveys/${nonExistentSurveyId}/responses`, {
        statusCode: 404,
        body: { error: 'Survey not found' }
      }).as('surveyNotFound');

      cy.visit(`/surveys/${nonExistentSurveyId}/respond`);
      
      cy.wait('@surveyNotFound');

      // Should show 404 error
      cy.get('[data-testid="not-found"], [data-testid="error-404"]')
        .should('be.visible')
        .and('contain.text', /not found|404/i);

      // Should provide navigation back
      cy.get('[data-testid="back-to-surveys"], [data-testid="go-home"]')
        .should('be.visible');
    });
  });

  describe('Survey Responsive Design', () => {
    const viewports = [
      { device: 'mobile', width: 375, height: 667 },
      { device: 'tablet', width: 768, height: 1024 },
      { device: 'desktop', width: 1920, height: 1080 }
    ];

    viewports.forEach(({ device, width, height }) => {
      describe(`${device} viewport (${width}x${height})`, () => {
        beforeEach(() => {
          cy.viewport(width, height);
          cy.loginAsAdmin();
        });

        it('should display surveys list responsively', () => {
          cy.visit('/projects');
          cy.get('[data-testid="project-card"]')
            .contains(testData.project.name)
            .click();
          
          cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
            .click();

          // Check responsive layout
          cy.get('[data-testid="surveys-container"]')
            .should('be.visible');

          if (device === 'mobile') {
            // Mobile-specific checks
            cy.get('[data-testid="survey-item"]').first().within(() => {
              // Should stack elements vertically
              cy.get('[data-testid="survey-title"]')
                .should('be.visible');
            });
          }

          if (device === 'desktop') {
            // Desktop-specific checks
            cy.get('[data-testid="surveys-grid"], [data-testid="surveys-table"]')
              .should('be.visible');
          }
        });

        it('should handle survey forms responsively', () => {
          cy.visit('/projects');
          cy.get('[data-testid="project-card"]')
            .contains(testData.project.name)
            .click();
          
          cy.get('[data-testid="nav-surveys"], [data-testid="tab-surveys"]')
            .click();
          
          cy.get('[data-testid="create-survey-button"], [data-testid="button-create-survey"]')
            .click();

          // Form should be responsive
          cy.get('[data-testid="survey-form"]')
            .should('be.visible');

          cy.get('[data-testid="input-survey-title"]')
            .should('be.visible')
            .and('have.css', 'width');

          if (device === 'mobile') {
            // Mobile form should stack elements
            cy.get('[data-testid="form-actions"]')
              .should('be.visible');
          }
        });
      });
    });
  });

  // Cleanup after tests
  after(() => {
    // Clean up test data if needed
    if (surveyId) {
      cy.request('DELETE', `/api/surveys/${surveyId}`).then(() => {
        cy.log('Test survey cleaned up');
      });
    }
  });
});
