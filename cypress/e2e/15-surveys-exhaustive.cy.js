describe('Surveys Feature - Exhaustive Tests', () => {
  const testData = {
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    survey: {
      title: 'Test Survey',
      description: 'This is a test survey for cypress testing',
      questions: [
        {
          text: 'How satisfied are you with the project?',
          type: 'rating',
          required: true
        },
        {
          text: 'What improvements would you suggest?',
          type: 'text',
          required: false
        }
      ]
    },
    response: {
      answers: [
        { questionId: 1, answer: '5' },
        { questionId: 2, answer: 'Great project overall, keep up the good work!' }
      ]
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    projects: '/api/projects',
    projectSurveys: `/api/projects/${testData.project.id}/surveys`,
    surveyResponses: (surveyId) => `/api/surveys/${surveyId}/responses`,
    surveyComplete: (surveyId) => `/api/surveys/${surveyId}/complete`,
    roiQuestions: '/api/roi/questions'
  };

  beforeEach(() => {
    // Clear all auth state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Login before each test
    cy.request('POST', apiEndpoints.login, {
      email: testData.user.email,
      password: testData.user.password
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.setCookie('auth-token', response.body.token);
    });
  });

  describe('Survey List Page - UI Components & Layout', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSurveys, { fixture: 'surveys/survey-list.json' }).as('getSurveys');
      cy.intercept('GET', `/api/projects/${testData.project.id}`, { fixture: 'projects/project-detail.json' }).as('getProject');
      
      cy.visit(`/projects/${testData.project.id}/surveys`);
      cy.wait(['@getSurveys', '@getProject']);
    });

    it('should display complete surveys page layout', () => {
      // Page header
      cy.get('[data-testid="surveys-header"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Surveys');

      // Project context
      cy.get('[data-testid="project-breadcrumb"]')
        .should('be.visible')
        .and('contain.text', testData.project.name);

      // Action buttons
      cy.get('[data-testid="button-create-survey"]')
        .should('be.visible')
        .and('contain.text', /create|add|new/i);

      // Surveys list container
      cy.get('[data-testid="surveys-list"]').should('be.visible');

      // Page title
      cy.title().should('include', 'Surveys');
    });

    it('should display survey cards with proper information', () => {
      cy.get('[data-testid="survey-card"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="survey-card"]').first().within(() => {
        cy.get('[data-testid="survey-title"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="survey-description"]').should('be.visible');
        cy.get('[data-testid="survey-status"]').should('be.visible');
        cy.get('[data-testid="survey-created-date"]').should('be.visible');
        cy.get('[data-testid="survey-responses-count"]').should('be.visible');
      });
    });

    it('should handle empty state when no surveys exist', () => {
      cy.intercept('GET', apiEndpoints.projectSurveys, { body: [] }).as('getEmptySurveys');
      cy.reload();
      cy.wait('@getEmptySurveys');

      cy.get('[data-testid="empty-state"]')
        .should('be.visible')
        .and('contain.text', /no surveys/i);
      
      cy.get('[data-testid="empty-state-cta"]')
        .should('be.visible')
        .and('contain.text', /create/i);
    });

    it('should handle loading states', () => {
      cy.intercept('GET', apiEndpoints.projectSurveys, (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send({ fixture: 'surveys/survey-list.json' });
        });
      }).as('getSlowSurveys');

      cy.reload();
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
      cy.wait('@getSlowSurveys');
      cy.get('[data-testid="loading-spinner"]').should('not.exist');
    });

    it('should handle error states gracefully', () => {
      cy.intercept('GET', apiEndpoints.projectSurveys, { statusCode: 500 }).as('getSurveysError');
      cy.reload();
      cy.wait('@getSurveysError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error/i);
    });

    it('should have proper accessibility attributes', () => {
      cy.get('[data-testid="surveys-header"]')
        .should('have.attr', 'role', 'heading')
        .and('have.attr', 'aria-level', '1');

      cy.get('[data-testid="button-create-survey"]')
        .should('have.attr', 'aria-label')
        .and('not.have.attr', 'disabled');

      cy.get('[data-testid="survey-card"]').first()
        .should('have.attr', 'role', 'article')
        .and('have.attr', 'tabindex');
    });
  });

  describe('Create Survey - Form Validation & Submission', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.projectSurveys, { fixture: 'surveys/survey-list.json' }).as('getSurveys');
      cy.intercept('GET', `/api/projects/${testData.project.id}`, { fixture: 'projects/project-detail.json' }).as('getProject');
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'surveys/roi-questions.json' }).as('getRoiQuestions');
      
      cy.visit(`/projects/${testData.project.id}/surveys/new`);
      cy.wait(['@getRoiQuestions', '@getProject']);
    });

    it('should display complete create survey form', () => {
      // Form container
      cy.get('[data-testid="create-survey-form"]', { timeout: 10000 })
        .should('be.visible');

      // Basic information fields
      cy.get('[data-testid="input-survey-title"]')
        .should('be.visible')
        .and('have.attr', 'required');

      cy.get('[data-testid="input-survey-description"]')
        .should('be.visible');

      cy.get('[data-testid="select-survey-type"]')
        .should('be.visible');

      // Form actions
      cy.get('[data-testid="button-save-survey"]')
        .should('be.visible')
        .and('be.disabled');

      cy.get('[data-testid="button-cancel"]')
        .should('be.visible');
    });

    it('should validate required fields', () => {
      // Try to submit without required fields
      cy.get('[data-testid="input-survey-title"]').focus().blur();
      
      cy.get('[data-testid="error-survey-title"]')
        .should('be.visible')
        .and('contain.text', /required/i);

      cy.get('[data-testid="button-save-survey"]').should('be.disabled');
    });

    it('should validate field lengths and formats', () => {
      const longTitle = 'A'.repeat(256);
      const validTitle = testData.survey.title;

      // Test title length validation
      cy.get('[data-testid="input-survey-title"]').type(longTitle);
      cy.get('[data-testid="error-survey-title"]')
        .should('be.visible')
        .and('contain.text', /too long|maximum/i);

      // Test valid title
      cy.get('[data-testid="input-survey-title"]').clear().type(validTitle);
      cy.get('[data-testid="error-survey-title"]').should('not.exist');
      cy.get('[data-testid="button-save-survey"]').should('not.be.disabled');
    });

    it('should handle survey type selection', () => {
      cy.get('[data-testid="select-survey-type"]').click();
      
      // Should show available survey types
      cy.get('[data-testid="option-feedback"]').should('be.visible').click();
      cy.get('[data-testid="select-survey-type"]').should('contain.text', 'Feedback');

      // Change to different type
      cy.get('[data-testid="select-survey-type"]').click();
      cy.get('[data-testid="option-satisfaction"]').should('be.visible').click();
      cy.get('[data-testid="select-survey-type"]').should('contain.text', 'Satisfaction');
    });

    it('should add and configure survey questions', () => {
      // Fill basic info first
      cy.get('[data-testid="input-survey-title"]').type(testData.survey.title);
      cy.get('[data-testid="input-survey-description"]').type(testData.survey.description);

      // Add first question
      cy.get('[data-testid="button-add-question"]').click();
      
      cy.get('[data-testid="question-item"]').should('have.length', 1);
      
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="input-question-text"]')
          .type(testData.survey.questions[0].text);
        
        cy.get('[data-testid="select-question-type"]').click();
        cy.get('[data-testid="option-rating"]').click();
        
        cy.get('[data-testid="checkbox-required"]').check();
      });

      // Add second question
      cy.get('[data-testid="button-add-question"]').click();
      cy.get('[data-testid="question-item"]').should('have.length', 2);
      
      cy.get('[data-testid="question-item"]').last().within(() => {
        cy.get('[data-testid="input-question-text"]')
          .type(testData.survey.questions[1].text);
        
        cy.get('[data-testid="select-question-type"]').click();
        cy.get('[data-testid="option-text"]').click();
      });
    });

    it('should remove questions', () => {
      // Add questions first
      cy.get('[data-testid="input-survey-title"]').type(testData.survey.title);
      cy.get('[data-testid="button-add-question"]').click();
      cy.get('[data-testid="button-add-question"]').click();
      
      cy.get('[data-testid="question-item"]').should('have.length', 2);
      
      // Remove first question
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="button-remove-question"]').click();
      });
      
      cy.get('[data-testid="question-item"]').should('have.length', 1);
    });

    it('should reorder questions', () => {
      // Add multiple questions
      cy.get('[data-testid="input-survey-title"]').type(testData.survey.title);
      cy.get('[data-testid="button-add-question"]').click();
      cy.get('[data-testid="button-add-question"]').click();
      
      // Add text to questions for identification
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="input-question-text"]').type('First Question');
      });
      
      cy.get('[data-testid="question-item"]').last().within(() => {
        cy.get('[data-testid="input-question-text"]').type('Second Question');
      });

      // Test reordering (if drag-and-drop or move buttons exist)
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="button-move-down"]').click();
      });
      
      // Verify order changed
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="input-question-text"]').should('have.value', 'Second Question');
      });
    });

    it('should successfully create survey', () => {
      const newSurveyId = 'new-survey-123';
      
      cy.intercept('POST', apiEndpoints.projectSurveys, {
        statusCode: 201,
        body: {
          id: newSurveyId,
          title: testData.survey.title,
          description: testData.survey.description,
          status: 'draft'
        }
      }).as('createSurvey');

      // Fill form
      cy.get('[data-testid="input-survey-title"]').type(testData.survey.title);
      cy.get('[data-testid="input-survey-description"]').type(testData.survey.description);
      
      // Add a question
      cy.get('[data-testid="button-add-question"]').click();
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="input-question-text"]').type(testData.survey.questions[0].text);
        cy.get('[data-testid="select-question-type"]').click();
        cy.get('[data-testid="option-rating"]').click();
      });

      // Submit form
      cy.get('[data-testid="button-save-survey"]').click();
      cy.wait('@createSurvey');

      // Should redirect to survey detail or list
      cy.url().should('include', `/projects/${testData.project.id}/surveys`);
      
      // Success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /created/i);
    });

    it('should handle create survey errors', () => {
      cy.intercept('POST', apiEndpoints.projectSurveys, { statusCode: 400, body: { error: 'Invalid survey data' } }).as('createSurveyError');

      // Fill valid form
      cy.get('[data-testid="input-survey-title"]').type(testData.survey.title);
      cy.get('[data-testid="button-add-question"]').click();
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="input-question-text"]').type(testData.survey.questions[0].text);
      });

      cy.get('[data-testid="button-save-survey"]').click();
      cy.wait('@createSurveyError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error/i);
    });

    it('should cancel survey creation', () => {
      // Fill some data
      cy.get('[data-testid="input-survey-title"]').type('Test Survey');
      
      cy.get('[data-testid="button-cancel"]').click();
      
      // Should redirect back to surveys list
      cy.url().should('include', `/projects/${testData.project.id}/surveys`);
    });
  });

  describe('Survey Detail & Management', () => {
    const surveyId = 'test-survey-123';
    
    beforeEach(() => {
      cy.intercept('GET', `/api/surveys/${surveyId}`, { fixture: 'surveys/survey-detail.json' }).as('getSurvey');
      cy.intercept('GET', `/api/surveys/${surveyId}/responses`, { fixture: 'surveys/survey-responses.json' }).as('getResponses');
      cy.intercept('GET', `/api/projects/${testData.project.id}`, { fixture: 'projects/project-detail.json' }).as('getProject');
      
      cy.visit(`/projects/${testData.project.id}/surveys/${surveyId}`);
      cy.wait(['@getSurvey', '@getResponses', '@getProject']);
    });

    it('should display survey details correctly', () => {
      // Survey header
      cy.get('[data-testid="survey-header"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="survey-title"]')
        .should('be.visible')
        .and('not.be.empty');
      
      cy.get('[data-testid="survey-description"]')
        .should('be.visible');
      
      cy.get('[data-testid="survey-status"]')
        .should('be.visible');
      
      cy.get('[data-testid="survey-created-date"]')
        .should('be.visible');

      // Survey statistics
      cy.get('[data-testid="survey-stats"]').should('be.visible');
      cy.get('[data-testid="total-responses"]').should('be.visible');
      cy.get('[data-testid="response-rate"]').should('be.visible');
    });

    it('should display survey questions', () => {
      cy.get('[data-testid="survey-questions"]').should('be.visible');
      
      cy.get('[data-testid="question-item"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="question-item"]').first().within(() => {
        cy.get('[data-testid="question-text"]').should('be.visible').and('not.be.empty');
        cy.get('[data-testid="question-type"]').should('be.visible');
        cy.get('[data-testid="question-required"]').should('exist');
      });
    });

    it('should show survey management actions', () => {
      cy.get('[data-testid="survey-actions"]').should('be.visible');
      
      // Actions based on survey status
      cy.get('[data-testid="button-edit-survey"]').should('be.visible');
      cy.get('[data-testid="button-delete-survey"]').should('be.visible');
      cy.get('[data-testid="button-export-responses"]').should('be.visible');
      
      // Status change actions
      cy.get('[data-testid="button-activate-survey"]').should('exist');
    });

    it('should handle survey status changes', () => {
      cy.intercept('PATCH', `/api/surveys/${surveyId}/status`, {
        statusCode: 200,
        body: { status: 'active' }
      }).as('updateStatus');

      cy.get('[data-testid="button-activate-survey"]').click();
      
      // Confirmation dialog
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="button-confirm"]').click();
      
      cy.wait('@updateStatus');
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /activated/i);
    });

    it('should delete survey with confirmation', () => {
      cy.intercept('DELETE', `/api/surveys/${surveyId}`, { statusCode: 204 }).as('deleteSurvey');

      cy.get('[data-testid="button-delete-survey"]').click();
      
      // Confirmation dialog
      cy.get('[data-testid="confirm-dialog"]').should('be.visible');
      cy.get('[data-testid="confirm-message"]')
        .should('contain.text', /permanently delete/i);
      
      cy.get('[data-testid="button-confirm-delete"]').click();
      cy.wait('@deleteSurvey');
      
      // Should redirect to surveys list
      cy.url().should('include', `/projects/${testData.project.id}/surveys`);
      
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /deleted/i);
    });

    it('should export survey responses', () => {
      cy.intercept('GET', `/api/surveys/${surveyId}/responses/export`, {
        statusCode: 200,
        body: { downloadUrl: '/files/export.csv' }
      }).as('exportResponses');

      cy.get('[data-testid="button-export-responses"]').click();
      cy.wait('@exportResponses');
      
      // Should show download link or start download
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain.text', /export/i);
    });
  });

  describe('Survey Responses & Analytics', () => {
    const surveyId = 'test-survey-123';
    
    beforeEach(() => {
      cy.intercept('GET', `/api/surveys/${surveyId}`, { fixture: 'surveys/survey-detail.json' }).as('getSurvey');
      cy.intercept('GET', apiEndpoints.surveyResponses(surveyId), { fixture: 'surveys/survey-responses.json' }).as('getResponses');
      
      cy.visit(`/projects/${testData.project.id}/surveys/${surveyId}/responses`);
      cy.wait(['@getSurvey', '@getResponses']);
    });

    it('should display responses overview', () => {
      cy.get('[data-testid="responses-header"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Responses');

      // Response statistics
      cy.get('[data-testid="response-stats"]').should('be.visible');
      cy.get('[data-testid="total-responses"]').should('be.visible');
      cy.get('[data-testid="completion-rate"]').should('be.visible');
      cy.get('[data-testid="average-rating"]').should('be.visible');
    });

    it('should display response list with pagination', () => {
      cy.get('[data-testid="responses-list"]').should('be.visible');
      
      cy.get('[data-testid="response-item"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="response-item"]').first().within(() => {
        cy.get('[data-testid="respondent-name"]').should('be.visible');
        cy.get('[data-testid="response-date"]').should('be.visible');
        cy.get('[data-testid="response-status"]').should('be.visible');
      });

      // Pagination controls
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="pagination-info"]').should('contain.text', /showing/i);
    });

    it('should filter and search responses', () => {
      // Search functionality
      cy.get('[data-testid="input-search-responses"]')
        .should('be.visible')
        .type('test user');
      
      cy.get('[data-testid="button-search"]').click();
      
      // Should filter results
      cy.get('[data-testid="response-item"]').should('have.length.at.least', 0);

      // Clear search
      cy.get('[data-testid="button-clear-search"]').click();
      cy.get('[data-testid="input-search-responses"]').should('have.value', '');
    });

    it('should display individual response details', () => {
      cy.get('[data-testid="response-item"]').first().click();
      
      cy.get('[data-testid="response-detail-modal"]').should('be.visible');
      
      cy.get('[data-testid="response-detail-modal"]').within(() => {
        cy.get('[data-testid="respondent-info"]').should('be.visible');
        cy.get('[data-testid="response-answers"]').should('be.visible');
        cy.get('[data-testid="response-timestamp"]').should('be.visible');
        
        // Individual answers
        cy.get('[data-testid="answer-item"]').should('have.length.at.least', 1);
      });
      
      cy.get('[data-testid="button-close-modal"]').click();
      cy.get('[data-testid="response-detail-modal"]').should('not.exist');
    });

    it('should display response analytics and charts', () => {
      cy.get('[data-testid="tab-analytics"]').click();
      
      cy.get('[data-testid="analytics-container"]').should('be.visible');
      
      // Chart containers
      cy.get('[data-testid="chart-satisfaction"]').should('be.visible');
      cy.get('[data-testid="chart-response-trend"]').should('be.visible');
      cy.get('[data-testid="chart-question-breakdown"]').should('be.visible');
      
      // Summary statistics
      cy.get('[data-testid="analytics-summary"]').should('be.visible');
      cy.get('[data-testid="avg-score"]').should('be.visible');
      cy.get('[data-testid="response-distribution"]').should('be.visible');
    });

    it('should handle empty responses state', () => {
      cy.intercept('GET', apiEndpoints.surveyResponses(surveyId), { body: [] }).as('getEmptyResponses');
      cy.reload();
      cy.wait('@getEmptyResponses');

      cy.get('[data-testid="empty-responses"]')
        .should('be.visible')
        .and('contain.text', /no responses/i);
      
      cy.get('[data-testid="empty-responses-message"]')
        .should('contain.text', /share/i);
    });
  });

  describe('Taking a Survey (Respondent View)', () => {
    const surveyId = 'public-survey-123';
    
    beforeEach(() => {
      // Clear auth for public survey taking
      cy.clearCookies();
      
      cy.intercept('GET', `/api/surveys/${surveyId}/public`, { fixture: 'surveys/public-survey.json' }).as('getPublicSurvey');
      
      cy.visit(`/surveys/${surveyId}`);
      cy.wait('@getPublicSurvey');
    });

    it('should display survey introduction and questions', () => {
      // Survey introduction
      cy.get('[data-testid="survey-intro"]', { timeout: 10000 })
        .should('be.visible');
      
      cy.get('[data-testid="survey-title"]')
        .should('be.visible')
        .and('not.be.empty');
      
      cy.get('[data-testid="survey-description"]')
        .should('be.visible');

      // Questions
      cy.get('[data-testid="survey-questions"]').should('be.visible');
      cy.get('[data-testid="survey-question"]').should('have.length.at.least', 1);
      
      // Submit button (should be disabled initially)
      cy.get('[data-testid="button-submit-survey"]')
        .should('be.visible')
        .and('be.disabled');
    });

    it('should handle different question types', () => {
      // Rating question
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="question-text"]').should('be.visible');
        cy.get('[data-testid="rating-input"]').should('be.visible');
        
        // Select rating
        cy.get('[data-testid="rating-5"]').click();
      });

      // Text question
      cy.get('[data-testid="survey-question"]').eq(1).within(() => {
        cy.get('[data-testid="text-input"]')
          .should('be.visible')
          .type(testData.response.answers[1].answer);
      });

      // Multiple choice question (if exists)
      cy.get('[data-testid="survey-question"]').then($questions => {
        if ($questions.length > 2) {
          cy.get('[data-testid="survey-question"]').eq(2).within(() => {
            cy.get('[data-testid="choice-option"]').first().click();
          });
        }
      });
    });

    it('should validate required questions', () => {
      // Try to submit without answering required questions
      cy.get('[data-testid="button-submit-survey"]').should('be.disabled');
      
      // Answer required questions
      cy.get('[data-testid="survey-question"]').each(($question) => {
        cy.wrap($question).within(() => {
          // Check if question is required
          cy.get('[data-testid="required-indicator"]').then($indicator => {
            if ($indicator.length > 0) {
              // Answer based on question type
              if (cy.get('[data-testid="rating-input"]').length > 0) {
                cy.get('[data-testid="rating-3"]').click();
              } else if (cy.get('[data-testid="text-input"]').length > 0) {
                cy.get('[data-testid="text-input"]').type('Required answer');
              }
            }
          });
        });
      });

      cy.get('[data-testid="button-submit-survey"]').should('not.be.disabled');
    });

    it('should successfully submit survey response', () => {
      cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), {
        statusCode: 201,
        body: { id: 'response-123', status: 'completed' }
      }).as('submitResponse');

      // Fill out survey
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-4"]').click();
      });

      cy.get('[data-testid="survey-question"]').eq(1).within(() => {
        cy.get('[data-testid="text-input"]').type('Great survey experience');
      });

      // Submit
      cy.get('[data-testid="button-submit-survey"]').click();
      cy.wait('@submitResponse');

      // Success message
      cy.get('[data-testid="submission-success"]')
        .should('be.visible')
        .and('contain.text', /thank you/i);
    });

    it('should handle submission errors', () => {
      cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), { statusCode: 400 }).as('submitError');

      // Fill required fields
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-3"]').click();
      });

      cy.get('[data-testid="button-submit-survey"]').click();
      cy.wait('@submitError');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain.text', /error/i);
    });

    it('should save progress automatically', () => {
      cy.intercept('POST', `/api/surveys/${surveyId}/save-progress`, { statusCode: 200 }).as('saveProgress');

      // Answer first question
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-4"]').click();
      });

      // Should auto-save
      cy.wait('@saveProgress');
      
      cy.get('[data-testid="progress-saved"]')
        .should('be.visible')
        .and('contain.text', /saved/i);
    });

    it('should handle survey completion flow', () => {
      cy.intercept('POST', apiEndpoints.surveyComplete(surveyId), { statusCode: 200 }).as('completeSurvey');

      // Fill and submit survey
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-5"]').click();
      });

      cy.get('[data-testid="button-submit-survey"]').click();
      cy.wait('@completeSurvey');

      // Completion page
      cy.get('[data-testid="survey-completed"]')
        .should('be.visible')
        .and('contain.text', /completed/i);

      // Should not allow going back to survey
      cy.go('back');
      cy.get('[data-testid="survey-already-completed"]')
        .should('be.visible');
    });
  });

  describe('Survey Accessibility & Mobile Experience', () => {
    const surveyId = 'test-survey-123';

    beforeEach(() => {
      cy.intercept('GET', `/api/surveys/${surveyId}/public`, { fixture: 'surveys/public-survey.json' }).as('getPublicSurvey');
      cy.visit(`/surveys/${surveyId}`);
      cy.wait('@getPublicSurvey');
    });

    it('should have proper ARIA attributes and keyboard navigation', () => {
      // Main container
      cy.get('[data-testid="survey-container"]')
        .should('have.attr', 'role', 'main');

      // Questions
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="question-text"]')
          .should('have.attr', 'role', 'heading');
        
        cy.get('[data-testid="rating-input"]')
          .should('have.attr', 'role', 'radiogroup')
          .and('have.attr', 'aria-labelledby');
      });

      // Keyboard navigation
      cy.get('[data-testid="rating-1"]').focus();
      cy.get('[data-testid="rating-1"]').should('be.focused');
      
      cy.get('[data-testid="rating-1"]').type('{rightarrow}');
      cy.get('[data-testid="rating-2"]').should('be.focused');

      cy.get('[data-testid="rating-2"]').type(' ');
      cy.get('[data-testid="rating-2"]').should('be.checked');
    });

    it('should work properly on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // Survey should be responsive
      cy.get('[data-testid="survey-container"]').should('be.visible');
      cy.get('[data-testid="survey-questions"]').should('be.visible');
      
      // Touch interactions
      cy.get('[data-testid="rating-4"]').click();
      cy.get('[data-testid="rating-4"]').should('be.checked');
      
      // Submit button should be accessible
      cy.get('[data-testid="button-submit-survey"]')
        .should('be.visible')
        .and('not.have.css', 'position', 'fixed'); // Ensure it's not hidden behind keyboard
    });

    it('should handle screen reader compatibility', () => {
      // Progress information
      cy.get('[data-testid="survey-progress"]')
        .should('have.attr', 'aria-live', 'polite');
      
      // Error messages
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-input"]')
          .should('have.attr', 'aria-describedby');
      });

      // Form validation announcements
      cy.get('[data-testid="button-submit-survey"]').click();
      cy.get('[data-testid="validation-summary"]')
        .should('have.attr', 'role', 'alert');
    });
  });

  describe('Survey Performance & Edge Cases', () => {
    const surveyId = 'performance-survey-123';

    it('should handle large surveys with many questions', () => {
      cy.intercept('GET', `/api/surveys/${surveyId}/public`, { fixture: 'surveys/large-survey.json' }).as('getLargeSurvey');
      
      cy.visit(`/surveys/${surveyId}`);
      cy.wait('@getLargeSurvey');

      // Should render efficiently
      cy.get('[data-testid="survey-question"]').should('have.length', 50);
      
      // Lazy loading or pagination for performance
      cy.get('[data-testid="question-pagination"]').should('be.visible');
      
      // Next page of questions
      cy.get('[data-testid="button-next-page"]').click();
      cy.get('[data-testid="survey-question"]').should('be.visible');
    });

    it('should handle network interruptions gracefully', () => {
      cy.intercept('GET', `/api/surveys/${surveyId}/public`, { fixture: 'surveys/public-survey.json' }).as('getPublicSurvey');
      cy.visit(`/surveys/${surveyId}`);
      cy.wait('@getPublicSurvey');

      // Simulate network failure during submission
      cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), { forceNetworkError: true }).as('networkError');

      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-3"]').click();
      });

      cy.get('[data-testid="button-submit-survey"]').click();
      cy.wait('@networkError');

      // Should show retry option
      cy.get('[data-testid="network-error"]')
        .should('be.visible')
        .and('contain.text', /connection/i);
      
      cy.get('[data-testid="button-retry"]').should('be.visible');
    });

    it('should handle concurrent survey responses', () => {
      // Test that simultaneous responses don't interfere
      cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), (req) => {
        req.reply((res) => {
          res.delay(1000);
          res.send({ statusCode: 201, body: { id: 'response-456' } });
        });
      }).as('slowSubmission');

      cy.visit(`/surveys/${surveyId}`);
      
      // Fill and submit quickly multiple times
      cy.get('[data-testid="survey-question"]').first().within(() => {
        cy.get('[data-testid="rating-4"]').click();
      });

      // Multiple rapid submissions should be prevented
      cy.get('[data-testid="button-submit-survey"]').click();
      cy.get('[data-testid="button-submit-survey"]').should('be.disabled');
      
      cy.wait('@slowSubmission');
      cy.get('[data-testid="submission-success"]').should('be.visible');
    });
  });
});
