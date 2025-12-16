describe('ROI (Return on Investment) System - Exhaustive Tests', () => {
  const testData = {
    user: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    project: {
      id: 'ci-test-project',
      name: 'CI Test Project'
    },
    hospital: {
      id: 'ci-test-hospital',
      name: 'CI Test Hospital'
    },
    questions: {
      valid: {
        question: 'How would you rate the overall system performance?',
        category: 'Performance',
        type: 'rating',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor']
      },
      invalid: {
        question: '',
        category: '',
        type: '',
        required: false,
        options: []
      },
      update: {
        question: 'What is your satisfaction level with the training provided?',
        category: 'Training',
        type: 'multiple_choice',
        required: false,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
      }
    },
    surveys: {
      valid: {
        title: 'Q1 ROI Assessment',
        description: 'Quarterly return on investment evaluation',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-03-31'
      },
      invalid: {
        title: '',
        description: '',
        status: '',
        startDate: '',
        endDate: ''
      },
      update: {
        title: 'Updated ROI Assessment',
        description: 'Updated quarterly return on investment evaluation',
        status: 'draft',
        startDate: '2024-02-01',
        endDate: '2024-04-30'
      }
    },
    responses: {
      valid: {
        response: 'Excellent',
        rating: 5,
        comments: 'The system has significantly improved our workflow efficiency.'
      },
      invalid: {
        response: '',
        rating: null,
        comments: ''
      }
    }
  };

  const apiEndpoints = {
    roiQuestions: '/api/roi/questions',
    projectSurveys: (projectId) => `/api/projects/${projectId}/surveys`,
    surveyResponses: (surveyId) => `/api/surveys/${surveyId}/responses`,
    completeSurvey: (surveyId) => `/api/surveys/${surveyId}/complete`,
    projects: '/api/projects'
  };

  beforeEach(() => {
    // Clear all state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    // Login with test user
    cy.request('POST', '/api/auth/login', {
      email: testData.user.email,
      password: testData.user.password
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  describe('ROI Questions Management', () => {
    beforeEach(() => {
      // Setup API intercepts
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getROIQuestions');
      cy.intercept('POST', apiEndpoints.roiQuestions, {
        statusCode: 201,
        body: { id: 'new-question-id', ...testData.questions.valid }
      }).as('createROIQuestion');
      cy.intercept('PUT', '/api/roi/questions/*', {
        statusCode: 200,
        body: { id: 'question-id', ...testData.questions.update }
      }).as('updateROIQuestion');
      cy.intercept('DELETE', '/api/roi/questions/*', { statusCode: 204 }).as('deleteROIQuestion');
    });

    describe('ROI Questions List Page - UI Components & Layout', () => {
      it('should display complete ROI questions page layout', () => {
        cy.visit('/admin/roi/questions');
        cy.wait('@getROIQuestions');

        // Page header and navigation
        cy.get('[data-testid="roi-questions-header"]').should('be.visible');
        cy.get('h1').should('contain.text', /roi questions/i);
        cy.get('[data-testid="breadcrumb"]').should('be.visible');

        // Action buttons
        cy.get('[data-testid="create-question-button"]')
          .should('be.visible')
          .and('contain.text', /create|add|new/i);
        
        // Questions list
        cy.get('[data-testid="questions-list"]').should('be.visible');
        cy.get('[data-testid="questions-table"]').should('be.visible');

        // Table headers
        cy.get('[data-testid="table-header"]').within(() => {
          cy.contains('Question').should('be.visible');
          cy.contains('Category').should('be.visible');
          cy.contains('Type').should('be.visible');
          cy.contains('Required').should('be.visible');
          cy.contains('Actions').should('be.visible');
        });

        // Search and filters
        cy.get('[data-testid="search-questions"]').should('be.visible');
        cy.get('[data-testid="category-filter"]').should('be.visible');
        cy.get('[data-testid="type-filter"]').should('be.visible');
      });

      it('should display empty state when no questions exist', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { body: [] }).as('getEmptyQuestions');
        cy.visit('/admin/roi/questions');
        cy.wait('@getEmptyQuestions');

        cy.get('[data-testid="empty-state"]').should('be.visible');
        cy.get('[data-testid="empty-state-title"]').should('contain.text', /no questions/i);
        cy.get('[data-testid="empty-state-description"]').should('be.visible');
        cy.get('[data-testid="create-first-question-button"]').should('be.visible');
      });

      it('should handle loading states properly', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { delay: 1000, fixture: 'roi-questions.json' }).as('getDelayedQuestions');
        cy.visit('/admin/roi/questions');

        // Check loading state
        cy.get('[data-testid="loading-spinner"]').should('be.visible');
        cy.get('[data-testid="loading-text"]').should('contain.text', /loading/i);

        cy.wait('@getDelayedQuestions');
        cy.get('[data-testid="loading-spinner"]').should('not.exist');
      });

      it('should handle error states gracefully', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('getQuestionsError');
        
        cy.visit('/admin/roi/questions');
        cy.wait('@getQuestionsError');

        cy.get('[data-testid="error-state"]').should('be.visible');
        cy.get('[data-testid="error-message"]').should('contain.text', /error/i);
        cy.get('[data-testid="retry-button"]').should('be.visible');
      });
    });

    describe('ROI Questions Search and Filtering', () => {
      beforeEach(() => {
        cy.visit('/admin/roi/questions');
        cy.wait('@getROIQuestions');
      });

      it('should search questions by text', () => {
        const searchTerm = 'performance';
        
        cy.get('[data-testid="search-questions"]')
          .type(searchTerm)
          .should('have.value', searchTerm);

        // Verify search results
        cy.get('[data-testid="question-row"]').each(($row) => {
          cy.wrap($row).should('contain.text', searchTerm);
        });

        // Clear search
        cy.get('[data-testid="clear-search"]').click();
        cy.get('[data-testid="search-questions"]').should('have.value', '');
      });

      it('should filter questions by category', () => {
        cy.get('[data-testid="category-filter"]').click();
        cy.get('[data-testid="category-option-performance"]').click();

        cy.get('[data-testid="question-row"]').each(($row) => {
          cy.wrap($row).find('[data-testid="question-category"]')
            .should('contain.text', 'Performance');
        });
      });

      it('should filter questions by type', () => {
        cy.get('[data-testid="type-filter"]').click();
        cy.get('[data-testid="type-option-rating"]').click();

        cy.get('[data-testid="question-row"]').each(($row) => {
          cy.wrap($row).find('[data-testid="question-type"]')
            .should('contain.text', 'Rating');
        });
      });

      it('should combine multiple filters', () => {
        cy.get('[data-testid="search-questions"]').type('satisfaction');
        cy.get('[data-testid="category-filter"]').click();
        cy.get('[data-testid="category-option-training"]').click();
        cy.get('[data-testid="type-filter"]').click();
        cy.get('[data-testid="type-option-multiple-choice"]').click();

        // Verify combined filtering
        cy.get('[data-testid="question-row"]').should('exist');
        cy.get('[data-testid="results-count"]').should('be.visible');
      });

      it('should show no results message when filters match nothing', () => {
        cy.get('[data-testid="search-questions"]').type('nonexistent question');
        
        cy.get('[data-testid="no-results"]').should('be.visible');
        cy.get('[data-testid="no-results-message"]')
          .should('contain.text', /no questions found/i);
      });
    });

    describe('Create ROI Question Modal', () => {
      beforeEach(() => {
        cy.visit('/admin/roi/questions');
        cy.wait('@getROIQuestions');
      });

      it('should open and display create question modal', () => {
        cy.get('[data-testid="create-question-button"]').click();

        cy.get('[data-testid="create-question-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', /create.*question/i);

        // Form fields
        cy.get('[data-testid="input-question"]')
          .should('be.visible')
          .and('have.attr', 'required');
        cy.get('[data-testid="select-category"]').should('be.visible');
        cy.get('[data-testid="select-type"]').should('be.visible');
        cy.get('[data-testid="checkbox-required"]').should('be.visible');
        cy.get('[data-testid="textarea-options"]').should('be.visible');

        // Modal buttons
        cy.get('[data-testid="cancel-button"]').should('be.visible');
        cy.get('[data-testid="create-button"]')
          .should('be.visible')
          .and('be.disabled'); // Should be disabled until form is valid
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="create-question-button"]').click();
        cy.get('[data-testid="create-button"]').click();

        // Check validation errors
        cy.get('[data-testid="error-question"]')
          .should('be.visible')
          .and('contain.text', /required/i);
        cy.get('[data-testid="error-category"]')
          .should('be.visible')
          .and('contain.text', /required/i);
        cy.get('[data-testid="error-type"]')
          .should('be.visible')
          .and('contain.text', /required/i);
      });

      it('should create question successfully with valid data', () => {
        cy.get('[data-testid="create-question-button"]').click();

        // Fill form
        cy.get('[data-testid="input-question"]').type(testData.questions.valid.question);
        cy.get('[data-testid="select-category"]').click();
        cy.get('[data-testid="category-option-performance"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-rating"]').click();
        cy.get('[data-testid="checkbox-required"]').check();
        
        // Add options for multiple choice/rating questions
        testData.questions.valid.options.forEach((option, index) => {
          cy.get(`[data-testid="option-input-${index}"]`).type(option);
          if (index < testData.questions.valid.options.length - 1) {
            cy.get('[data-testid="add-option-button"]').click();
          }
        });

        cy.get('[data-testid="create-button"]').should('not.be.disabled').click();
        cy.wait('@createROIQuestion');

        // Verify success
        cy.get('[data-testid="success-toast"]')
          .should('be.visible')
          .and('contain.text', /created successfully/i);
        cy.get('[data-testid="create-question-modal"]').should('not.exist');
      });

      it('should handle API errors during creation', () => {
        cy.intercept('POST', apiEndpoints.roiQuestions, {
          statusCode: 400,
          body: { error: 'Validation failed' }
        }).as('createQuestionError');

        cy.get('[data-testid="create-question-button"]').click();
        
        // Fill form with valid data
        cy.get('[data-testid="input-question"]').type(testData.questions.valid.question);
        cy.get('[data-testid="select-category"]').click();
        cy.get('[data-testid="category-option-performance"]').click();
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-rating"]').click();

        cy.get('[data-testid="create-button"]').click();
        cy.wait('@createQuestionError');

        cy.get('[data-testid="error-toast"]')
          .should('be.visible')
          .and('contain.text', /error/i);
      });

      it('should close modal when cancel is clicked', () => {
        cy.get('[data-testid="create-question-button"]').click();
        cy.get('[data-testid="cancel-button"]').click();
        
        cy.get('[data-testid="create-question-modal"]').should('not.exist');
      });

      it('should close modal when clicking outside', () => {
        cy.get('[data-testid="create-question-button"]').click();
        cy.get('[data-testid="modal-backdrop"]').click({ force: true });
        
        cy.get('[data-testid="create-question-modal"]').should('not.exist');
      });

      it('should handle different question types appropriately', () => {
        cy.get('[data-testid="create-question-button"]').click();

        // Test rating type
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-rating"]').click();
        cy.get('[data-testid="rating-options"]').should('be.visible');

        // Test multiple choice type
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-multiple-choice"]').click();
        cy.get('[data-testid="multiple-choice-options"]').should('be.visible');

        // Test text type
        cy.get('[data-testid="select-type"]').click();
        cy.get('[data-testid="type-option-text"]').click();
        cy.get('[data-testid="rating-options"]').should('not.exist');
        cy.get('[data-testid="multiple-choice-options"]').should('not.exist');
      });
    });

    describe('Edit ROI Question', () => {
      beforeEach(() => {
        cy.visit('/admin/roi/questions');
        cy.wait('@getROIQuestions');
      });

      it('should open edit modal with pre-filled data', () => {
        cy.get('[data-testid="question-row"]').first().within(() => {
          cy.get('[data-testid="edit-question-button"]').click();
        });

        cy.get('[data-testid="edit-question-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', /edit.*question/i);

        // Verify pre-filled data
        cy.get('[data-testid="input-question"]').should('not.have.value', '');
        cy.get('[data-testid="select-category"]').should('contain.text', /.+/);
        cy.get('[data-testid="select-type"]').should('contain.text', /.+/);
      });

      it('should update question successfully', () => {
        cy.get('[data-testid="question-row"]').first().within(() => {
          cy.get('[data-testid="edit-question-button"]').click();
        });

        // Update fields
        cy.get('[data-testid="input-question"]')
          .clear()
          .type(testData.questions.update.question);
        cy.get('[data-testid="select-category"]').click();
        cy.get('[data-testid="category-option-training"]').click();

        cy.get('[data-testid="update-button"]').click();
        cy.wait('@updateROIQuestion');

        cy.get('[data-testid="success-toast"]')
          .should('be.visible')
          .and('contain.text', /updated successfully/i);
      });

      it('should handle update errors gracefully', () => {
        cy.intercept('PUT', '/api/roi/questions/*', {
          statusCode: 400,
          body: { error: 'Update failed' }
        }).as('updateQuestionError');

        cy.get('[data-testid="question-row"]').first().within(() => {
          cy.get('[data-testid="edit-question-button"]').click();
        });

        cy.get('[data-testid="update-button"]').click();
        cy.wait('@updateQuestionError');

        cy.get('[data-testid="error-toast"]')
          .should('be.visible')
          .and('contain.text', /error/i);
      });
    });

    describe('Delete ROI Question', () => {
      beforeEach(() => {
        cy.visit('/admin/roi/questions');
        cy.wait('@getROIQuestions');
      });

      it('should show confirmation dialog before deleting', () => {
        cy.get('[data-testid="question-row"]').first().within(() => {
          cy.get('[data-testid="delete-question-button"]').click();
        });

        cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
        cy.get('[data-testid="confirmation-title"]')
          .should('contain.text', /delete.*question/i);
        cy.get('[data-testid="confirmation-message"]')
          .should('contain.text', /this action cannot be undone/i);
      });

      it('should delete question when confirmed', () => {
        cy.get('[data-testid="question-row"]').first().within(() => {
          cy.get('[data-testid="delete-question-button"]').click();
        });

        cy.get('[data-testid="confirm-delete-button"]').click();
        cy.wait('@deleteROIQuestion');

        cy.get('[data-testid="success-toast"]')
          .should('be.visible')
          .and('contain.text', /deleted successfully/i);
      });

      it('should cancel deletion when cancelled', () => {
        cy.get('[data-testid="question-row"]').first().within(() => {
          cy.get('[data-testid="delete-question-button"]').click();
        });

        cy.get('[data-testid="cancel-delete-button"]').click();
        cy.get('[data-testid="delete-confirmation-dialog"]').should('not.exist');
      });
    });
  });

  describe('Project ROI Surveys Management', () => {
    beforeEach(() => {
      // Setup API intercepts
      cy.intercept('GET', apiEndpoints.projectSurveys(testData.project.id), { fixture: 'project-surveys.json' }).as('getProjectSurveys');
      cy.intercept('POST', apiEndpoints.projectSurveys(testData.project.id), {
        statusCode: 201,
        body: { id: 'new-survey-id', ...testData.surveys.valid }
      }).as('createSurvey');
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getROIQuestions');
    });

    describe('Project Surveys List', () => {
      it('should display project surveys page', () => {
        cy.visit(`/projects/${testData.project.id}/roi`);
        cy.wait(['@getProjectSurveys', '@getROIQuestions']);

        // Page header
        cy.get('[data-testid="project-surveys-header"]').should('be.visible');
        cy.get('h1').should('contain.text', /roi surveys/i);

        // Create survey button
        cy.get('[data-testid="create-survey-button"]')
          .should('be.visible')
          .and('contain.text', /create.*survey/i);

        // Surveys list
        cy.get('[data-testid="surveys-list"]').should('be.visible');
        cy.get('[data-testid="survey-card"]').should('have.length.greaterThan', 0);
      });

      it('should display survey cards with complete information', () => {
        cy.visit(`/projects/${testData.project.id}/roi`);
        cy.wait('@getProjectSurveys');

        cy.get('[data-testid="survey-card"]').first().within(() => {
          cy.get('[data-testid="survey-title"]').should('be.visible');
          cy.get('[data-testid="survey-description"]').should('be.visible');
          cy.get('[data-testid="survey-status"]').should('be.visible');
          cy.get('[data-testid="survey-dates"]').should('be.visible');
          cy.get('[data-testid="survey-responses-count"]').should('be.visible');
          cy.get('[data-testid="survey-actions"]').should('be.visible');
        });
      });

      it('should handle empty surveys state', () => {
        cy.intercept('GET', apiEndpoints.projectSurveys(testData.project.id), { body: [] }).as('getEmptySurveys');
        cy.visit(`/projects/${testData.project.id}/roi`);
        cy.wait('@getEmptySurveys');

        cy.get('[data-testid="empty-surveys"]').should('be.visible');
        cy.get('[data-testid="empty-surveys-title"]')
          .should('contain.text', /no surveys/i);
        cy.get('[data-testid="create-first-survey-button"]').should('be.visible');
      });
    });

    describe('Create Survey Modal', () => {
      beforeEach(() => {
        cy.visit(`/projects/${testData.project.id}/roi`);
        cy.wait('@getProjectSurveys');
      });

      it('should open create survey modal', () => {
        cy.get('[data-testid="create-survey-button"]').click();

        cy.get('[data-testid="create-survey-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]').should('contain.text', /create.*survey/i);

        // Form fields
        cy.get('[data-testid="input-survey-title"]').should('be.visible');
        cy.get('[data-testid="textarea-survey-description"]').should('be.visible');
        cy.get('[data-testid="select-survey-status"]').should('be.visible');
        cy.get('[data-testid="input-start-date"]').should('be.visible');
        cy.get('[data-testid="input-end-date"]').should('be.visible');
        cy.get('[data-testid="questions-selection"]').should('be.visible');
      });

      it('should validate survey form', () => {
        cy.get('[data-testid="create-survey-button"]').click();
        cy.get('[data-testid="create-survey-submit"]').click();

        cy.get('[data-testid="error-survey-title"]')
          .should('be.visible')
          .and('contain.text', /required/i);
      });

      it('should create survey successfully', () => {
        cy.get('[data-testid="create-survey-button"]').click();

        // Fill survey form
        cy.get('[data-testid="input-survey-title"]').type(testData.surveys.valid.title);
        cy.get('[data-testid="textarea-survey-description"]').type(testData.surveys.valid.description);
        cy.get('[data-testid="select-survey-status"]').click();
        cy.get('[data-testid="status-option-active"]').click();
        cy.get('[data-testid="input-start-date"]').type(testData.surveys.valid.startDate);
        cy.get('[data-testid="input-end-date"]').type(testData.surveys.valid.endDate);

        // Select questions
        cy.get('[data-testid="question-checkbox"]').first().check();
        cy.get('[data-testid="question-checkbox"]').eq(1).check();

        cy.get('[data-testid="create-survey-submit"]').click();
        cy.wait('@createSurvey');

        cy.get('[data-testid="success-toast"]')
          .should('be.visible')
          .and('contain.text', /created successfully/i);
      });

      it('should validate date ranges', () => {
        cy.get('[data-testid="create-survey-button"]').click();

        // Set end date before start date
        cy.get('[data-testid="input-start-date"]').type('2024-03-01');
        cy.get('[data-testid="input-end-date"]').type('2024-02-01');

        cy.get('[data-testid="create-survey-submit"]').click();

        cy.get('[data-testid="error-date-range"]')
          .should('be.visible')
          .and('contain.text', /end date must be after start date/i);
      });
    });
  });

  describe('Survey Response System', () => {
    const surveyId = 'test-survey-id';

    beforeEach(() => {
      // Setup API intercepts
      cy.intercept('GET', apiEndpoints.surveyResponses(surveyId), { fixture: 'survey-responses.json' }).as('getSurveyResponses');
      cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), {
        statusCode: 201,
        body: { id: 'new-response-id', ...testData.responses.valid }
      }).as('createResponse');
      cy.intercept('POST', apiEndpoints.completeSurvey(surveyId), { statusCode: 200 }).as('completeSurvey');
    });

    describe('Survey Taking Interface', () => {
      it('should display survey taking interface', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        cy.get('[data-testid="survey-header"]').should('be.visible');
        cy.get('[data-testid="survey-title"]').should('be.visible');
        cy.get('[data-testid="survey-description"]').should('be.visible');
        cy.get('[data-testid="survey-progress"]').should('be.visible');
        cy.get('[data-testid="question-form"]').should('be.visible');
      });

      it('should display different question types correctly', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        // Rating question
        cy.get('[data-testid="rating-question"]').within(() => {
          cy.get('[data-testid="rating-stars"]').should('be.visible');
          cy.get('[data-testid="rating-star"]').should('have.length', 5);
        });

        // Multiple choice question
        cy.get('[data-testid="multiple-choice-question"]').within(() => {
          cy.get('[data-testid="choice-option"]').should('have.length.greaterThan', 1);
          cy.get('input[type="radio"]').should('exist');
        });

        // Text question
        cy.get('[data-testid="text-question"]').within(() => {
          cy.get('[data-testid="text-response"]').should('be.visible');
        });
      });

      it('should validate required questions', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        // Try to proceed without answering required questions
        cy.get('[data-testid="next-question-button"]').click();

        cy.get('[data-testid="validation-error"]')
          .should('be.visible')
          .and('contain.text', /required/i);
      });

      it('should allow rating questions interaction', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        cy.get('[data-testid="rating-question"]').within(() => {
          cy.get('[data-testid="rating-star-4"]').click();
          cy.get('[data-testid="rating-star-4"]').should('have.class', 'selected');
          
          // Verify rating value
          cy.get('[data-testid="rating-value"]').should('contain.text', '4');
        });
      });

      it('should allow multiple choice selection', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        cy.get('[data-testid="multiple-choice-question"]').within(() => {
          cy.get('[data-testid="choice-option-1"]').click();
          cy.get('input[type="radio"]').eq(0).should('be.checked');
        });
      });

      it('should allow text input', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        const responseText = 'This is my detailed response to the question.';
        
        cy.get('[data-testid="text-question"]').within(() => {
          cy.get('[data-testid="text-response"]')
            .type(responseText)
            .should('have.value', responseText);
        });
      });

      it('should track survey progress', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        // Initial progress
        cy.get('[data-testid="progress-bar"]').should('be.visible');
        cy.get('[data-testid="progress-text"]').should('contain.text', '1 of');

        // Answer question and proceed
        cy.get('[data-testid="rating-star-5"]').click();
        cy.get('[data-testid="next-question-button"]').click();

        // Progress should update
        cy.get('[data-testid="progress-text"]').should('contain.text', '2 of');
      });

      it('should allow navigation between questions', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        // Answer first question
        cy.get('[data-testid="rating-star-5"]').click();
        cy.get('[data-testid="next-question-button"]').click();

        // Go back to previous question
        cy.get('[data-testid="previous-question-button"]').click();
        cy.get('[data-testid="rating-star-5"]').should('have.class', 'selected');
      });

      it('should submit survey responses successfully', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        // Answer all questions
        cy.get('[data-testid="rating-star-5"]').click();
        cy.get('[data-testid="next-question-button"]').click();

        cy.get('[data-testid="choice-option-1"]').click();
        cy.get('[data-testid="next-question-button"]').click();

        cy.get('[data-testid="text-response"]').type('Excellent system performance');
        cy.get('[data-testid="submit-survey-button"]').click();

        cy.wait('@completeSurvey');

        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', /thank you/i);
      });

      it('should save draft responses', () => {
        cy.visit(`/surveys/${surveyId}/take`);

        cy.get('[data-testid="rating-star-4"]').click();
        cy.get('[data-testid="save-draft-button"]').click();

        cy.get('[data-testid="draft-saved-toast"]')
          .should('be.visible')
          .and('contain.text', /draft saved/i);
      });
    });

    describe('Survey Results and Analytics', () => {
      it('should display survey results page', () => {
        cy.visit(`/surveys/${surveyId}/results`);
        cy.wait('@getSurveyResponses');

        cy.get('[data-testid="survey-results-header"]').should('be.visible');
        cy.get('[data-testid="response-statistics"]').should('be.visible');
        cy.get('[data-testid="response-charts"]').should('be.visible');
        cy.get('[data-testid="detailed-responses"]').should('be.visible');
      });

      it('should display response statistics', () => {
        cy.visit(`/surveys/${surveyId}/results`);
        cy.wait('@getSurveyResponses');

        cy.get('[data-testid="response-statistics"]').within(() => {
          cy.get('[data-testid="total-responses"]').should('be.visible');
          cy.get('[data-testid="response-rate"]').should('be.visible');
          cy.get('[data-testid="completion-rate"]').should('be.visible');
          cy.get('[data-testid="average-rating"]').should('be.visible');
        });
      });

      it('should display response charts', () => {
        cy.visit(`/surveys/${surveyId}/results`);
        cy.wait('@getSurveyResponses');

        cy.get('[data-testid="response-charts"]').within(() => {
          cy.get('[data-testid="rating-distribution-chart"]').should('be.visible');
          cy.get('[data-testid="response-timeline-chart"]').should('be.visible');
          cy.get('[data-testid="category-breakdown-chart"]').should('be.visible');
        });
      });

      it('should allow filtering responses', () => {
        cy.visit(`/surveys/${surveyId}/results`);
        cy.wait('@getSurveyResponses');

        cy.get('[data-testid="response-filters"]').within(() => {
          cy.get('[data-testid="date-range-filter"]').should('be.visible');
          cy.get('[data-testid="rating-filter"]').should('be.visible');
          cy.get('[data-testid="department-filter"]').should('be.visible');
        });

        // Apply date filter
        cy.get('[data-testid="date-range-filter"]').click();
        cy.get('[data-testid="date-range-last-30-days"]').click();

        // Verify filter is applied
        cy.get('[data-testid="active-filters"]').should('contain.text', 'Last 30 days');
      });

      it('should export survey results', () => {
        cy.visit(`/surveys/${surveyId}/results`);
        cy.wait('@getSurveyResponses');

        cy.get('[data-testid="export-results-button"]').click();
        cy.get('[data-testid="export-format-dropdown"]').should('be.visible');
        
        cy.get('[data-testid="export-excel"]').click();
        
        // Verify download initiated
        cy.get('[data-testid="export-toast"]')
          .should('be.visible')
          .and('contain.text', /export started/i);
      });
    });
  });

  describe('ROI Analytics Dashboard', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/analytics/roi', { fixture: 'roi-analytics.json' }).as('getROIAnalytics');
      cy.intercept('GET', '/api/analytics/roi/trends', { fixture: 'roi-trends.json' }).as('getROITrends');
    });

    it('should display ROI analytics dashboard', () => {
      cy.visit('/analytics/roi');
      cy.wait(['@getROIAnalytics', '@getROITrends']);

      // Dashboard header
      cy.get('[data-testid="roi-analytics-header"]').should('be.visible');
      cy.get('h1').should('contain.text', /roi analytics/i);

      // Key metrics cards
      cy.get('[data-testid="roi-metrics-cards"]').should('be.visible');
      cy.get('[data-testid="metric-card"]').should('have.length.greaterThan', 3);

      // Charts and visualizations
      cy.get('[data-testid="roi-charts-section"]').should('be.visible');
      cy.get('[data-testid="roi-trend-chart"]').should('be.visible');
      cy.get('[data-testid="roi-by-project-chart"]').should('be.visible');
      cy.get('[data-testid="cost-benefit-analysis"]').should('be.visible');
    });

    it('should display ROI metric cards with correct data', () => {
      cy.visit('/analytics/roi');
      cy.wait('@getROIAnalytics');

      cy.get('[data-testid="metric-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="metric-title"]').should('be.visible');
          cy.get('[data-testid="metric-value"]').should('be.visible');
          cy.get('[data-testid="metric-change"]').should('be.visible');
        });
      });
    });

    it('should allow filtering analytics by date range', () => {
      cy.visit('/analytics/roi');
      cy.wait('@getROIAnalytics');

      cy.get('[data-testid="analytics-filters"]').within(() => {
        cy.get('[data-testid="date-range-picker"]').click();
        cy.get('[data-testid="preset-last-quarter"]').click();
      });

      // Verify filter is applied and data updates
      cy.get('[data-testid="applied-filter-badge"]')
        .should('be.visible')
        .and('contain.text', 'Last Quarter');
    });

    it('should allow filtering by project', () => {
      cy.visit('/analytics/roi');
      cy.wait('@getROIAnalytics');

      cy.get('[data-testid="project-filter"]').click();
      cy.get('[data-testid="project-option"]').first().click();

      cy.get('[data-testid="applied-filter-badge"]')
        .should('be.visible')
        .and('contain.text', 'Project:');
    });

    it('should display detailed ROI breakdown', () => {
      cy.visit('/analytics/roi');
      cy.wait('@getROIAnalytics');

      cy.get('[data-testid="roi-breakdown-table"]').should('be.visible');
      cy.get('[data-testid="breakdown-row"]').should('have.length.greaterThan', 0);

      cy.get('[data-testid="breakdown-row"]').first().within(() => {
        cy.get('[data-testid="project-name"]').should('be.visible');
        cy.get('[data-testid="investment-amount"]').should('be.visible');
        cy.get('[data-testid="return-amount"]').should('be.visible');
        cy.get('[data-testid="roi-percentage"]').should('be.visible');
      });
    });
  });

  describe('Responsive Design Tests', () => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    viewports.forEach((viewport) => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
          cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getROIQuestions');
        });

        it('should display ROI questions page responsively', () => {
          cy.visit('/admin/roi/questions');
          cy.wait('@getROIQuestions');

          cy.get('[data-testid="roi-questions-header"]').should('be.visible');

          if (viewport.width < 768) {
            // Mobile-specific checks
            cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
            cy.get('[data-testid="questions-table"]').should('have.css', 'overflow-x', 'auto');
          } else {
            // Desktop/tablet checks
            cy.get('[data-testid="questions-table"]').should('be.visible');
            cy.get('[data-testid="table-header"]').should('be.visible');
          }
        });

        it('should handle survey taking interface responsively', () => {
          const surveyId = 'test-survey-id';
          cy.visit(`/surveys/${surveyId}/take`);

          cy.get('[data-testid="survey-header"]').should('be.visible');
          cy.get('[data-testid="question-form"]').should('be.visible');

          if (viewport.width < 768) {
            // Mobile-specific survey layout
            cy.get('[data-testid="progress-bar"]').should('be.visible');
            cy.get('[data-testid="question-navigation"]')
              .should('have.css', 'flex-direction', 'column');
          }
        });

        it('should display modals responsively', () => {
          cy.visit('/admin/roi/questions');
          cy.wait('@getROIQuestions');
          
          cy.get('[data-testid="create-question-button"]').click();
          cy.get('[data-testid="create-question-modal"]').should('be.visible');

          if (viewport.width < 768) {
            // Mobile modal should be full width
            cy.get('[data-testid="create-question-modal"]')
              .should('have.css', 'width')
              .and('match', /100%|100vw/);
          } else {
            // Desktop modal should be centered
            cy.get('[data-testid="create-question-modal"]')
              .should('have.css', 'max-width');
          }
        });
      });
    });
  });

  describe('Accessibility Tests', () => {
    beforeEach(() => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getROIQuestions');
      cy.injectAxe();
    });

    it('should have no accessibility violations on ROI questions page', () => {
      cy.visit('/admin/roi/questions');
      cy.wait('@getROIQuestions');
      cy.checkA11y();
    });

    it('should have proper ARIA labels on interactive elements', () => {
      cy.visit('/admin/roi/questions');
      cy.wait('@getROIQuestions');

      // Check buttons have proper labels
      cy.get('[data-testid="create-question-button"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'title')
        .or('contain.text');

      // Check form inputs have proper labels
      cy.get('[data-testid="search-questions"]')
        .should('have.attr', 'aria-label')
        .or('have.attr', 'placeholder');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/admin/roi/questions');
      cy.wait('@getROIQuestions');

      // Tab through interactive elements
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Should be able to open modal with keyboard
      cy.get('[data-testid="create-question-button"]').focus().type('{enter}');
      cy.get('[data-testid="create-question-modal"]').should('be.visible');

      // Should be able to close modal with escape
      cy.focused().type('{esc}');
      cy.get('[data-testid="create-question-modal"]').should('not.exist');
    });

    it('should have proper focus management in modals', () => {
      cy.visit('/admin/roi/questions');
      cy.wait('@getROIQuestions');

      cy.get('[data-testid="create-question-button"]').click();
      
      // Focus should be trapped in modal
      cy.get('[data-testid="input-question"]').should('be.focused');
      
      // Tab should cycle through modal elements only
      cy.focused().tab();
      cy.focused().should('be.within', '[data-testid="create-question-modal"]');
    });

    it('should announce dynamic content changes', () => {
      cy.visit('/admin/roi/questions');
      cy.wait('@getROIQuestions');

      // Check for live regions
      cy.get('[aria-live]').should('exist');
      
      // Check status messages are announced
      cy.get('[data-testid="create-question-button"]').click();
      cy.get('[data-testid="input-question"]').type(testData.questions.valid.question);
      cy.get('[data-testid="create-button"]').click();
      
      cy.get('[role="alert"], [aria-live="polite"], [aria-live="assertive"]')
        .should('exist');
    });
  });

  describe('Performance Tests', () => {
    it('should load ROI questions page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getROIQuestions');
      cy.visit('/admin/roi/questions');
      cy.wait('@getROIQuestions');
      
      cy.get('[data-testid="questions-table"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 second max
      });
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', apiEndpoints.roiQuestions, {
        fixture: 'large-roi-questions.json'
      }).as('getLargeQuestions');
      
      cy.visit('/admin/roi/questions');
      cy.wait('@getLargeQuestions');
      
      // Should still render within reasonable time
      cy.get('[data-testid="questions-table"]', { timeout: 10000 }).should('be.visible');
      
      // Search should be responsive
      cy.get('[data-testid="search-questions"]').type('performance');
      cy.get('[data-testid="question-row"]').should('be.visible');
    });

    it('should debounce search input', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions + '*', { fixture: 'roi-questions.json' }).as('searchQuestions');
      
      cy.visit('/admin/roi/questions');
      
      // Type quickly - should not trigger multiple requests
      cy.get('[data-testid="search-questions"]').type('perf');
      cy.get('[data-testid="search-questions"]').type('ormance');
      
      // Should only make one request after debounce
      cy.wait('@searchQuestions');
      cy.get('@searchQuestions.all').should('have.length', 1);
    });
  });
});
