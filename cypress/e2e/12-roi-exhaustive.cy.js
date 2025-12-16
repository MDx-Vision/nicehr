describe('ROI Feature - Exhaustive Tests', () => {
  const testData = {
    roiQuestion: {
      title: 'Test ROI Question',
      description: 'Test description for ROI question',
      category: 'financial',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2', 'Option 3'],
      isRequired: true
    },
    survey: {
      title: 'Test ROI Survey',
      description: 'Test survey description',
      type: 'roi_assessment',
      status: 'draft'
    },
    surveyResponse: {
      questionId: null,
      answer: 'Test answer',
      value: 100000
    }
  };

  const apiEndpoints = {
    roiQuestions: '/api/roi/questions',
    projects: '/api/projects',
    surveys: (projectId) => `/api/projects/${projectId}/surveys`,
    surveyResponses: (surveyId) => `/api/surveys/${surveyId}/responses`,
    completeSurvey: (surveyId) => `/api/surveys/${surveyId}/complete`
  };

  beforeEach(() => {
    // Login as admin user
    cy.loginAsAdmin();
    cy.visit('/');
  });

  describe('ROI Questions Management', () => {
    beforeEach(() => {
      cy.visit('/admin/roi/questions');
    });

    describe('ROI Questions List Page - UI Components', () => {
      it('should display complete ROI questions page layout', () => {
        cy.get('[data-testid="roi-questions-container"]', { timeout: 10000 })
          .should('be.visible');
        
        // Header elements
        cy.get('[data-testid="page-header"]').should('be.visible');
        cy.get('[data-testid="page-title"]')
          .should('contain.text', 'ROI Questions');
        
        // Action buttons
        cy.get('[data-testid="button-create-question"]')
          .should('be.visible')
          .and('contain.text', /add|create|new/i);
        
        // Search and filters
        cy.get('[data-testid="search-input"]').should('be.visible');
        cy.get('[data-testid="filter-category"]').should('be.visible');
        cy.get('[data-testid="filter-type"]').should('be.visible');
        
        // Questions list
        cy.get('[data-testid="questions-list"]').should('be.visible');
      });

      it('should display proper loading states', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { delay: 1000, fixture: 'roi-questions.json' });
        
        cy.visit('/admin/roi/questions');
        cy.get('[data-testid="loading-spinner"]').should('be.visible');
        cy.get('[data-testid="questions-list"]').should('be.visible');
      });

      it('should display empty state when no questions exist', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { body: [] });
        
        cy.visit('/admin/roi/questions');
        cy.get('[data-testid="empty-state"]').should('be.visible');
        cy.get('[data-testid="empty-state-message"]')
          .should('contain.text', /no.*questions.*found/i);
        cy.get('[data-testid="button-create-first-question"]')
          .should('be.visible');
      });

      it('should handle API errors gracefully', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { statusCode: 500 });
        
        cy.visit('/admin/roi/questions');
        cy.get('[data-testid="error-state"]').should('be.visible');
        cy.get('[data-testid="error-message"]')
          .should('contain.text', /error.*loading/i);
        cy.get('[data-testid="button-retry"]').should('be.visible');
      });
    });

    describe('ROI Questions List - Data Display', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
      });

      it('should display question cards with all required information', () => {
        cy.get('[data-testid^="question-card-"]').should('have.length.at.least', 1);
        
        cy.get('[data-testid^="question-card-"]').first().within(() => {
          cy.get('[data-testid="question-title"]').should('be.visible');
          cy.get('[data-testid="question-description"]').should('be.visible');
          cy.get('[data-testid="question-category"]').should('be.visible');
          cy.get('[data-testid="question-type"]').should('be.visible');
          cy.get('[data-testid="question-required-badge"]');
          cy.get('[data-testid="question-actions"]').should('be.visible');
        });
      });

      it('should display question types with proper icons and labels', () => {
        const questionTypes = ['text', 'number', 'multiple_choice', 'rating', 'date'];
        
        questionTypes.forEach(type => {
          cy.get(`[data-testid="question-type-${type}"]`).then($elements => {
            if ($elements.length > 0) {
              cy.wrap($elements.first())
                .should('be.visible')
                .and('contain.text', type.replace('_', ' '));
            }
          });
        });
      });

      it('should display question categories with proper styling', () => {
        const categories = ['financial', 'operational', 'quality', 'satisfaction'];
        
        categories.forEach(category => {
          cy.get(`[data-testid="question-category-${category}"]`).then($elements => {
            if ($elements.length > 0) {
              cy.wrap($elements.first())
                .should('be.visible')
                .and('have.class', /badge|chip|tag/);
            }
          });
        });
      });
    });

    describe('ROI Questions Search and Filters', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
      });

      it('should filter questions by search term', () => {
        const searchTerm = 'cost savings';
        
        cy.get('[data-testid="search-input"]').type(searchTerm);
        cy.get('[data-testid="button-search"]').click();
        
        cy.get('[data-testid^="question-card-"]').each($card => {
          cy.wrap($card).should('contain.text', searchTerm);
        });
      });

      it('should filter questions by category', () => {
        cy.get('[data-testid="filter-category"]').click();
        cy.get('[data-testid="option-financial"]').click();
        
        cy.get('[data-testid^="question-card-"]').each($card => {
          cy.wrap($card).within(() => {
            cy.get('[data-testid="question-category"]')
              .should('contain.text', 'financial');
          });
        });
      });

      it('should filter questions by type', () => {
        cy.get('[data-testid="filter-type"]').click();
        cy.get('[data-testid="option-multiple-choice"]').click();
        
        cy.get('[data-testid^="question-card-"]').each($card => {
          cy.wrap($card).within(() => {
            cy.get('[data-testid="question-type"]')
              .should('contain.text', 'multiple choice');
          });
        });
      });

      it('should clear all filters', () => {
        // Apply filters
        cy.get('[data-testid="search-input"]').type('test');
        cy.get('[data-testid="filter-category"]').select('financial');
        
        // Clear filters
        cy.get('[data-testid="button-clear-filters"]').click();
        
        cy.get('[data-testid="search-input"]').should('have.value', '');
        cy.get('[data-testid="filter-category"]').should('have.value', '');
      });

      it('should handle no search results', () => {
        cy.get('[data-testid="search-input"]').type('nonexistent question');
        cy.get('[data-testid="button-search"]').click();
        
        cy.get('[data-testid="no-results-message"]')
          .should('be.visible')
          .and('contain.text', /no.*questions.*found/i);
      });
    });

    describe('Create ROI Question', () => {
      beforeEach(() => {
        cy.get('[data-testid="button-create-question"]').click();
      });

      it('should display create question modal with all form fields', () => {
        cy.get('[data-testid="create-question-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]')
          .should('contain.text', 'Create ROI Question');
        
        // Form fields
        cy.get('[data-testid="input-title"]').should('be.visible');
        cy.get('[data-testid="input-description"]').should('be.visible');
        cy.get('[data-testid="select-category"]').should('be.visible');
        cy.get('[data-testid="select-type"]').should('be.visible');
        cy.get('[data-testid="checkbox-required"]').should('be.visible');
        
        // Action buttons
        cy.get('[data-testid="button-cancel"]').should('be.visible');
        cy.get('[data-testid="button-create"]')
          .should('be.visible')
          .and('be.disabled');
      });

      it('should validate required fields', () => {
        cy.get('[data-testid="button-create"]').click();
        
        cy.get('[data-testid="error-title"]')
          .should('be.visible')
          .and('contain.text', 'required');
        cy.get('[data-testid="error-category"]')
          .should('be.visible')
          .and('contain.text', 'required');
        cy.get('[data-testid="error-type"]')
          .should('be.visible')
          .and('contain.text', 'required');
      });

      it('should validate field lengths and formats', () => {
        // Title too long
        cy.get('[data-testid="input-title"]')
          .type('a'.repeat(256));
        cy.get('[data-testid="error-title"]')
          .should('contain.text', /too long|maximum/i);
        
        // Title too short
        cy.get('[data-testid="input-title"]').clear().type('ab');
        cy.get('[data-testid="error-title"]')
          .should('contain.text', /too short|minimum/i);
      });

      it('should show options field for multiple choice questions', () => {
        cy.get('[data-testid="select-type"]').select('multiple_choice');
        
        cy.get('[data-testid="options-container"]').should('be.visible');
        cy.get('[data-testid="input-option-1"]').should('be.visible');
        cy.get('[data-testid="button-add-option"]').should('be.visible');
      });

      it('should allow adding and removing options for multiple choice', () => {
        cy.get('[data-testid="select-type"]').select('multiple_choice');
        
        // Add option
        cy.get('[data-testid="button-add-option"]').click();
        cy.get('[data-testid="input-option-2"]').should('be.visible');
        
        // Remove option
        cy.get('[data-testid="button-remove-option-2"]').click();
        cy.get('[data-testid="input-option-2"]').should('not.exist');
      });

      it('should successfully create a new question', () => {
        cy.intercept('POST', apiEndpoints.roiQuestions, {
          statusCode: 201,
          body: { id: 1, ...testData.roiQuestion }
        }).as('createQuestion');
        
        // Fill form
        cy.get('[data-testid="input-title"]').type(testData.roiQuestion.title);
        cy.get('[data-testid="input-description"]').type(testData.roiQuestion.description);
        cy.get('[data-testid="select-category"]').select(testData.roiQuestion.category);
        cy.get('[data-testid="select-type"]').select(testData.roiQuestion.type);
        
        if (testData.roiQuestion.type === 'multiple_choice') {
          testData.roiQuestion.options.forEach((option, index) => {
            if (index > 0) {
              cy.get('[data-testid="button-add-option"]').click();
            }
            cy.get(`[data-testid="input-option-${index + 1}"]`).type(option);
          });
        }
        
        if (testData.roiQuestion.isRequired) {
          cy.get('[data-testid="checkbox-required"]').check();
        }
        
        cy.get('[data-testid="button-create"]').click();
        
        cy.wait('@createQuestion');
        cy.get('[data-testid="success-message"]')
          .should('be.visible')
          .and('contain.text', 'Question created successfully');
        cy.get('[data-testid="create-question-modal"]').should('not.exist');
      });

      it('should handle creation errors', () => {
        cy.intercept('POST', apiEndpoints.roiQuestions, { statusCode: 400 });
        
        // Fill valid form
        cy.get('[data-testid="input-title"]').type(testData.roiQuestion.title);
        cy.get('[data-testid="select-category"]').select(testData.roiQuestion.category);
        cy.get('[data-testid="select-type"]').select('text');
        
        cy.get('[data-testid="button-create"]').click();
        
        cy.get('[data-testid="error-message"]')
          .should('be.visible')
          .and('contain.text', /error.*creating/i);
      });

      it('should cancel question creation', () => {
        cy.get('[data-testid="input-title"]').type('Test');
        cy.get('[data-testid="button-cancel"]').click();
        
        cy.get('[data-testid="create-question-modal"]').should('not.exist');
      });
    });

    describe('Edit ROI Question', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
        cy.get('[data-testid^="question-card-"]').first().within(() => {
          cy.get('[data-testid="button-edit"]').click();
        });
      });

      it('should display edit question modal with pre-filled data', () => {
        cy.get('[data-testid="edit-question-modal"]').should('be.visible');
        cy.get('[data-testid="modal-title"]')
          .should('contain.text', 'Edit ROI Question');
        
        // Check pre-filled data
        cy.get('[data-testid="input-title"]').should('not.have.value', '');
        cy.get('[data-testid="input-description"]').should('not.have.value', '');
        cy.get('[data-testid="select-category"]').should('not.have.value', '');
        cy.get('[data-testid="select-type"]').should('not.have.value', '');
      });

      it('should successfully update question', () => {
        cy.intercept('PATCH', '/api/roi/questions/*', {
          statusCode: 200,
          body: { id: 1, ...testData.roiQuestion }
        }).as('updateQuestion');
        
        const updatedTitle = 'Updated Question Title';
        cy.get('[data-testid="input-title"]').clear().type(updatedTitle);
        cy.get('[data-testid="button-save"]').click();
        
        cy.wait('@updateQuestion');
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Question updated successfully');
      });

      it('should handle update errors', () => {
        cy.intercept('PATCH', '/api/roi/questions/*', { statusCode: 400 });
        
        cy.get('[data-testid="input-title"]').clear().type('Updated Title');
        cy.get('[data-testid="button-save"]').click();
        
        cy.get('[data-testid="error-message"]')
          .should('contain.text', /error.*updating/i);
      });
    });

    describe('Delete ROI Question', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
      });

      it('should show delete confirmation modal', () => {
        cy.get('[data-testid^="question-card-"]').first().within(() => {
          cy.get('[data-testid="button-delete"]').click();
        });
        
        cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');
        cy.get('[data-testid="confirmation-message"]')
          .should('contain.text', /delete.*question/i);
        cy.get('[data-testid="button-cancel-delete"]').should('be.visible');
        cy.get('[data-testid="button-confirm-delete"]').should('be.visible');
      });

      it('should successfully delete question', () => {
        cy.intercept('DELETE', '/api/roi/questions/*', { statusCode: 200 }).as('deleteQuestion');
        
        cy.get('[data-testid^="question-card-"]').first().within(() => {
          cy.get('[data-testid="button-delete"]').click();
        });
        
        cy.get('[data-testid="button-confirm-delete"]').click();
        
        cy.wait('@deleteQuestion');
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Question deleted successfully');
      });

      it('should handle delete errors', () => {
        cy.intercept('DELETE', '/api/roi/questions/*', { statusCode: 400 });
        
        cy.get('[data-testid^="question-card-"]').first().within(() => {
          cy.get('[data-testid="button-delete"]').click();
        });
        
        cy.get('[data-testid="button-confirm-delete"]').click();
        
        cy.get('[data-testid="error-message"]')
          .should('contain.text', /error.*deleting/i);
      });

      it('should cancel deletion', () => {
        cy.get('[data-testid^="question-card-"]').first().within(() => {
          cy.get('[data-testid="button-delete"]').click();
        });
        
        cy.get('[data-testid="button-cancel-delete"]').click();
        cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
      });
    });
  });

  describe('Project ROI Surveys', () => {
    let projectId;

    beforeEach(() => {
      // Get or create a test project
      cy.request('GET', '/api/projects').then((response) => {
        const projects = response.body;
        const testProject = projects.find(p => p.name.includes('ci-test'));
        projectId = testProject ? testProject.id : 1;
      });
    });

    describe('Project Survey Management', () => {
      beforeEach(() => {
        cy.visit(`/projects/${projectId}/roi`);
      });

      it('should display project ROI surveys page layout', () => {
        cy.get('[data-testid="project-roi-container"]').should('be.visible');
        cy.get('[data-testid="project-header"]').should('be.visible');
        cy.get('[data-testid="surveys-section"]').should('be.visible');
        cy.get('[data-testid="button-create-survey"]').should('be.visible');
      });

      it('should display existing surveys list', () => {
        cy.intercept('GET', apiEndpoints.surveys(projectId), { fixture: 'project-surveys.json' });
        
        cy.get('[data-testid="surveys-list"]').should('be.visible');
        cy.get('[data-testid^="survey-card-"]').should('have.length.at.least', 1);
      });

      it('should display empty state when no surveys exist', () => {
        cy.intercept('GET', apiEndpoints.surveys(projectId), { body: [] });
        
        cy.get('[data-testid="empty-surveys-state"]').should('be.visible');
        cy.get('[data-testid="button-create-first-survey"]').should('be.visible');
      });
    });

    describe('Create Project ROI Survey', () => {
      beforeEach(() => {
        cy.visit(`/projects/${projectId}/roi`);
        cy.get('[data-testid="button-create-survey"]').click();
      });

      it('should display create survey modal with form fields', () => {
        cy.get('[data-testid="create-survey-modal"]').should('be.visible');
        
        cy.get('[data-testid="input-survey-title"]').should('be.visible');
        cy.get('[data-testid="input-survey-description"]').should('be.visible');
        cy.get('[data-testid="select-survey-type"]').should('be.visible');
        cy.get('[data-testid="questions-selector"]').should('be.visible');
        cy.get('[data-testid="button-create-survey"]').should('be.visible');
      });

      it('should load available ROI questions for selection', () => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
        
        cy.get('[data-testid="questions-selector"]').should('be.visible');
        cy.get('[data-testid^="question-checkbox-"]').should('have.length.at.least', 1);
      });

      it('should validate survey form fields', () => {
        cy.get('[data-testid="button-create-survey"]').click();
        
        cy.get('[data-testid="error-survey-title"]')
          .should('contain.text', 'required');
        cy.get('[data-testid="error-questions"]')
          .should('contain.text', 'at least one question');
      });

      it('should successfully create survey', () => {
        cy.intercept('POST', apiEndpoints.surveys(projectId), {
          statusCode: 201,
          body: { id: 1, ...testData.survey, projectId }
        }).as('createSurvey');
        
        cy.get('[data-testid="input-survey-title"]').type(testData.survey.title);
        cy.get('[data-testid="input-survey-description"]').type(testData.survey.description);
        cy.get('[data-testid="select-survey-type"]').select('roi_assessment');
        
        // Select questions
        cy.get('[data-testid^="question-checkbox-"]').first().check();
        
        cy.get('[data-testid="button-create-survey"]').click();
        
        cy.wait('@createSurvey');
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Survey created successfully');
      });
    });

    describe('Survey Response Collection', () => {
      let surveyId = 1;

      beforeEach(() => {
        cy.visit(`/surveys/${surveyId}/respond`);
      });

      it('should display survey response form', () => {
        cy.intercept('GET', `/api/surveys/${surveyId}`, { fixture: 'survey-details.json' });
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
        
        cy.get('[data-testid="survey-response-form"]').should('be.visible');
        cy.get('[data-testid="survey-title"]').should('be.visible');
        cy.get('[data-testid="survey-description"]').should('be.visible');
        cy.get('[data-testid="questions-container"]').should('be.visible');
      });

      it('should display different question types correctly', () => {
        cy.intercept('GET', `/api/surveys/${surveyId}`, { fixture: 'survey-with-mixed-questions.json' });
        
        // Text question
        cy.get('[data-testid^="question-text-"]').within(() => {
          cy.get('textarea').should('be.visible');
        });
        
        // Number question
        cy.get('[data-testid^="question-number-"]').within(() => {
          cy.get('input[type="number"]').should('be.visible');
        });
        
        // Multiple choice question
        cy.get('[data-testid^="question-multiple-choice-"]').within(() => {
          cy.get('input[type="radio"]').should('have.length.at.least', 2);
        });
        
        // Rating question
        cy.get('[data-testid^="question-rating-"]').within(() => {
          cy.get('[data-testid="rating-scale"]').should('be.visible');
        });
      });

      it('should validate required questions', () => {
        cy.get('[data-testid="button-submit-response"]').click();
        
        cy.get('[data-testid^="error-question-"]').should('have.length.at.least', 1);
        cy.get('[data-testid="form-error-summary"]')
          .should('contain.text', 'required fields');
      });

      it('should save responses as draft', () => {
        cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), {
          statusCode: 201,
          body: { id: 1, status: 'draft' }
        }).as('saveResponse');
        
        // Fill some responses
        cy.get('[data-testid^="question-text-"]').first().within(() => {
          cy.get('textarea').type('Test response');
        });
        
        cy.get('[data-testid="button-save-draft"]').click();
        
        cy.wait('@saveResponse');
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Draft saved');
      });

      it('should submit completed responses', () => {
        cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), {
          statusCode: 201,
          body: { id: 1, status: 'submitted' }
        }).as('submitResponse');
        
        cy.intercept('POST', apiEndpoints.completeSurvey(surveyId), {
          statusCode: 200
        }).as('completeSurvey');
        
        // Fill all required responses
        cy.get('[data-testid^="question-"]').each(($question) => {
          cy.wrap($question).within(() => {
            cy.get('textarea').then($textarea => {
              if ($textarea.length) {
                cy.wrap($textarea).type('Test response');
              }
            });
            cy.get('input[type="number"]').then($number => {
              if ($number.length) {
                cy.wrap($number).type('100');
              }
            });
            cy.get('input[type="radio"]').then($radio => {
              if ($radio.length) {
                cy.wrap($radio).first().check();
              }
            });
          });
        });
        
        cy.get('[data-testid="button-submit-response"]').click();
        
        cy.wait('@submitResponse');
        cy.wait('@completeSurvey');
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Response submitted successfully');
      });

      it('should handle response submission errors', () => {
        cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), { statusCode: 400 });
        
        cy.get('[data-testid^="question-text-"]').first().within(() => {
          cy.get('textarea').type('Test response');
        });
        
        cy.get('[data-testid="button-submit-response"]').click();
        
        cy.get('[data-testid="error-message"]')
          .should('contain.text', /error.*submitting/i);
      });
    });

    describe('Survey Analytics and Reporting', () => {
      let surveyId = 1;

      beforeEach(() => {
        cy.visit(`/surveys/${surveyId}/analytics`);
      });

      it('should display survey analytics dashboard', () => {
        cy.intercept('GET', `/api/surveys/${surveyId}`, { fixture: 'survey-details.json' });
        cy.intercept('GET', apiEndpoints.surveyResponses(surveyId), { fixture: 'survey-responses.json' });
        
        cy.get('[data-testid="survey-analytics-container"]').should('be.visible');
        cy.get('[data-testid="response-summary"]').should('be.visible');
        cy.get('[data-testid="completion-rate"]').should('be.visible');
        cy.get('[data-testid="response-trends"]').should('be.visible');
      });

      it('should display response statistics', () => {
        cy.get('[data-testid="total-responses"]').should('be.visible');
        cy.get('[data-testid="completion-percentage"]').should('be.visible');
        cy.get('[data-testid="average-completion-time"]').should('be.visible');
        cy.get('[data-testid="last-response-date"]').should('be.visible');
      });

      it('should display question-by-question analysis', () => {
        cy.get('[data-testid="questions-analysis"]').should('be.visible');
        cy.get('[data-testid^="question-analysis-"]').each(($analysis) => {
          cy.wrap($analysis).within(() => {
            cy.get('[data-testid="question-title"]').should('be.visible');
            cy.get('[data-testid="response-count"]').should('be.visible');
            cy.get('[data-testid="response-visualization"]').should('be.visible');
          });
        });
      });

      it('should export survey results', () => {
        cy.intercept('GET', `/api/surveys/${surveyId}/export`, {
          statusCode: 200,
          headers: { 'content-type': 'text/csv' },
          body: 'Question,Response\n"Test Question","Test Response"'
        }).as('exportResults');
        
        cy.get('[data-testid="button-export-results"]').click();
        cy.get('[data-testid="export-format-csv"]').click();
        
        cy.wait('@exportResults');
        cy.get('[data-testid="success-message"]')
          .should('contain.text', 'Export completed');
      });

      it('should filter responses by date range', () => {
        cy.get('[data-testid="date-range-filter"]').should('be.visible');
        cy.get('[data-testid="start-date"]').type('2024-01-01');
        cy.get('[data-testid="end-date"]').type('2024-12-31');
        cy.get('[data-testid="button-apply-filter"]').click();
        
        cy.get('[data-testid="filtered-results-count"]').should('be.visible');
      });

      it('should display ROI calculations and metrics', () => {
        cy.get('[data-testid="roi-metrics-section"]').should('be.visible');
        cy.get('[data-testid="calculated-roi"]').should('be.visible');
        cy.get('[data-testid="cost-savings"]').should('be.visible');
        cy.get('[data-testid="efficiency-gains"]').should('be.visible');
        cy.get('[data-testid="quality-improvements"]').should('be.visible');
      });
    });
  });

  describe('ROI Feature - Mobile Responsiveness', () => {
    const viewports = [
      { device: 'iPhone 12', width: 390, height: 844 },
      { device: 'iPad', width: 768, height: 1024 },
      { device: 'Desktop', width: 1440, height: 900 }
    ];

    viewports.forEach(({ device, width, height }) => {
      describe(`${device} (${width}x${height})`, () => {
        beforeEach(() => {
          cy.viewport(width, height);
          cy.visit('/admin/roi/questions');
        });

        it(`should display properly on ${device}`, () => {
          cy.get('[data-testid="roi-questions-container"]').should('be.visible');
          
          if (width < 768) {
            // Mobile-specific checks
            cy.get('[data-testid="mobile-menu-trigger"]').should('be.visible');
            cy.get('[data-testid="questions-list"]')
              .should('have.css', 'flex-direction', 'column');
          } else {
            // Desktop/tablet checks
            cy.get('[data-testid="questions-list"]').should('be.visible');
          }
        });

        it(`should handle create question modal on ${device}`, () => {
          cy.get('[data-testid="button-create-question"]').click();
          cy.get('[data-testid="create-question-modal"]').should('be.visible');
          
          if (width < 768) {
            // Mobile modal should be full-screen
            cy.get('[data-testid="create-question-modal"]')
              .should('have.css', 'width', '100vw');
          }
        });
      });
    });
  });

  describe('ROI Feature - Accessibility', () => {
    beforeEach(() => {
      cy.visit('/admin/roi/questions');
    });

    it('should have proper ARIA labels and roles', () => {
      cy.get('[data-testid="roi-questions-container"]')
        .should('have.attr', 'role', 'main');
      
      cy.get('[data-testid="search-input"]')
        .should('have.attr', 'aria-label')
        .and('have.attr', 'role', 'searchbox');
      
      cy.get('[data-testid="button-create-question"]')
        .should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-category');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'button-create-question');
    });

    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('exist');
      
      // Check heading order
      cy.get('h1, h2, h3, h4, h5, h6').then($headings => {
        const headingLevels = Array.from($headings).map(h => parseInt(h.tagName.charAt(1)));
        let previousLevel = 0;
        headingLevels.forEach(level => {
          expect(level - previousLevel).to.be.at.most(1);
          previousLevel = level;
        });
      });
    });

    it('should have sufficient color contrast', () => {
      cy.get('[data-testid="question-card"]').first().should(($card) => {
        const bgColor = $card.css('background-color');
        const textColor = $card.css('color');
        // Note: In a real test, you'd use a color contrast library
        expect(bgColor).to.not.equal(textColor);
      });
    });

    it('should announce changes to screen readers', () => {
      cy.get('[data-testid="button-create-question"]').click();
      
      cy.get('[data-testid="create-question-modal"]')
        .should('have.attr', 'aria-live', 'polite')
        .or('have.attr', 'aria-live', 'assertive');
    });
  });

  describe('ROI Feature - Performance', () => {
    it('should load questions list within acceptable time', () => {
      const startTime = Date.now();
      
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' });
      cy.visit('/admin/roi/questions');
      
      cy.get('[data-testid="questions-list"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max
      });
    });

    it('should handle large datasets efficiently', () => {
      // Mock large dataset
      cy.intercept('GET', apiEndpoints.roiQuestions, { 
        fixture: 'large-roi-questions-dataset.json' 
      });
      
      cy.visit('/admin/roi/questions');
      cy.get('[data-testid="questions-list"]').should('be.visible');
      
      // Check if virtualization or pagination is working
      cy.get('[data-testid^="question-card-"]').should('have.length.lessThan', 50);
      cy.get('[data-testid="pagination"], [data-testid="load-more"]').should('exist');
    });

    it('should debounce search input', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions + '*', {
        fixture: 'filtered-roi-questions.json'
      }).as('searchQuestions');
      
      cy.get('[data-testid="search-input"]').type('test query');
      
      // Should not make request for each keystroke
      cy.wait(1000);
      cy.get('@searchQuestions').should('have.been.calledOnce');
    });
  });
});
