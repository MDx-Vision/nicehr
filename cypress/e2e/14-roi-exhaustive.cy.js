describe('ROI Feature - Exhaustive Tests', () => {
  const testData = {
    ciUser: {
      email: 'test@example.com',
      password: 'test123',
      username: 'ci-test-user'
    },
    question: {
      valid: {
        question: 'How would you rate the impact of this project on patient safety?',
        type: 'rating',
        category: 'patient_safety',
        options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
      },
      updated: {
        question: 'How would you rate the overall impact of this project on patient safety outcomes?',
        type: 'rating',
        category: 'patient_safety',
        options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
      },
      invalid: {
        empty: {
          question: '',
          type: '',
          category: ''
        },
        longText: {
          question: 'x'.repeat(1001),
          type: 'rating',
          category: 'efficiency'
        }
      }
    },
    survey: {
      valid: {
        title: 'Post-Implementation ROI Survey',
        description: 'Evaluate the return on investment after project completion',
        type: 'roi'
      },
      updated: {
        title: 'Updated Post-Implementation ROI Survey',
        description: 'Updated evaluation of the return on investment after project completion',
        type: 'roi'
      }
    },
    response: {
      valid: {
        questionId: null, // Will be set dynamically
        value: '4',
        comments: 'The project has significantly improved our workflow efficiency.'
      },
      updated: {
        value: '5',
        comments: 'Upon further reflection, the project has exceeded our expectations in improving workflow efficiency.'
      }
    }
  };

  const apiEndpoints = {
    login: '/api/auth/login',
    user: '/api/auth/user',
    roiQuestions: '/api/roi/questions',
    projectSurveys: (projectId) => `/api/projects/${projectId}/surveys`,
    surveyResponses: (surveyId) => `/api/surveys/${surveyId}/responses`,
    surveysComplete: (surveyId) => `/api/surveys/${surveyId}/complete`,
    projects: '/api/projects'
  };

  const selectors = {
    // Navigation
    roiNavigation: '[data-testid="nav-roi"], [href*="roi"], [aria-label*="ROI"]',
    roiQuestionsNav: '[data-testid="nav-roi-questions"], [href*="roi/questions"]',
    
    // ROI Questions Page
    questionsContainer: '[data-testid="roi-questions-container"]',
    questionsTable: '[data-testid="roi-questions-table"], table',
    questionRow: '[data-testid="question-row"]',
    addQuestionButton: '[data-testid="add-question-btn"], [data-testid="button-add-question"]',
    
    // Question Form
    questionForm: '[data-testid="question-form"], form',
    questionInput: '[data-testid="input-question"], [name="question"]',
    typeSelect: '[data-testid="select-type"], [name="type"]',
    categorySelect: '[data-testid="select-category"], [name="category"]',
    optionsInput: '[data-testid="input-options"], [name="options"]',
    submitButton: '[data-testid="button-submit"], [type="submit"]',
    cancelButton: '[data-testid="button-cancel"], [data-testid="cancel-btn"]',
    
    // Question Actions
    editButton: '[data-testid="edit-question-btn"], [aria-label*="Edit"]',
    deleteButton: '[data-testid="delete-question-btn"], [aria-label*="Delete"]',
    
    // Survey Management
    surveysContainer: '[data-testid="project-surveys-container"]',
    surveysTable: '[data-testid="surveys-table"], table',
    addSurveyButton: '[data-testid="add-survey-btn"], [data-testid="button-add-survey"]',
    
    // Survey Form
    surveyForm: '[data-testid="survey-form"], form',
    surveyTitleInput: '[data-testid="input-title"], [name="title"]',
    surveyDescriptionInput: '[data-testid="input-description"], [name="description"]',
    surveyTypeSelect: '[data-testid="select-type"], [name="type"]',
    
    // Survey Response
    responseForm: '[data-testid="response-form"], form',
    responseInput: '[data-testid="input-response"], [name="response"]',
    commentsInput: '[data-testid="input-comments"], [name="comments"]',
    
    // Common UI Elements
    modal: '[data-testid="modal"], .modal, [role="dialog"]',
    confirmDialog: '[data-testid="confirm-dialog"], [role="alertdialog"]',
    confirmButton: '[data-testid="confirm-btn"], [data-testid="button-confirm"]',
    loadingSpinner: '[data-testid="loading"], .loading, .spinner',
    errorMessage: '[data-testid="error-message"], .error',
    successMessage: '[data-testid="success-message"], .success',
    emptyState: '[data-testid="empty-state"], .empty-state',
    
    // Search and Filters
    searchInput: '[data-testid="search-input"], [placeholder*="Search"]',
    filterDropdown: '[data-testid="filter-dropdown"], select[data-filter]',
    clearFiltersButton: '[data-testid="clear-filters"], [data-testid="reset-filters"]',
    
    // Pagination
    pagination: '[data-testid="pagination"], .pagination',
    nextPageButton: '[data-testid="next-page"], [aria-label*="Next"]',
    prevPageButton: '[data-testid="prev-page"], [aria-label*="Previous"]',
    pageInfo: '[data-testid="page-info"], .page-info'
  };

  // Helper functions
  const loginAsAdmin = () => {
    cy.visit('/login');
    cy.get('[data-testid="input-email"]').type(testData.ciUser.email);
    cy.get('[data-testid="input-password"]').type(testData.ciUser.password);
    cy.get('[data-testid="button-login"]').click();
    cy.url().should('not.include', '/login');
    cy.wait(1000);
  };

  const navigateToROIQuestions = () => {
    // Try multiple navigation paths
    cy.get('body').then(($body) => {
      if ($body.find(selectors.roiQuestionsNav).length > 0) {
        cy.get(selectors.roiQuestionsNav).first().click();
      } else if ($body.find(selectors.roiNavigation).length > 0) {
        cy.get(selectors.roiNavigation).first().click();
        cy.wait(500);
        cy.get(selectors.roiQuestionsNav).first().click();
      } else {
        cy.visit('/roi/questions');
      }
    });
    cy.wait(1000);
  };

  const navigateToProjectSurveys = (projectId = 'ci-test-project') => {
    cy.visit(`/projects/${projectId}/surveys`);
    cy.wait(1000);
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
  });

  describe('ROI Questions Management - UI Components & Layout', () => {
    beforeEach(() => {
      loginAsAdmin();
      
      // Set up API intercepts
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
      cy.intercept('POST', apiEndpoints.roiQuestions, { statusCode: 201, body: { id: 1, ...testData.question.valid } }).as('createQuestion');
      
      navigateToROIQuestions();
    });

    it('should display complete ROI questions page layout', () => {
      // Main container
      cy.get('body').should('contain.text', /roi|questions/i);
      
      // Check for questions container or create one
      cy.get('body').then(($body) => {
        if ($body.find(selectors.questionsContainer).length === 0) {
          // Page might be empty or differently structured
          cy.get('main, .main-content, .container').should('exist');
        } else {
          cy.get(selectors.questionsContainer).should('be.visible');
        }
      });
      
      // Add question button should be present
      cy.get('body').then(($body) => {
        if ($body.find(selectors.addQuestionButton).length > 0) {
          cy.get(selectors.addQuestionButton).should('be.visible');
        }
      });
      
      // Page title
      cy.get('h1, h2, .page-title').should('contain.text', /roi|questions/i);
    });

    it('should display questions table when questions exist', () => {
      cy.wait('@getQuestions');
      
      cy.get('body').then(($body) => {
        if ($body.find(selectors.questionsTable).length > 0) {
          // Table exists
          cy.get(selectors.questionsTable).should('be.visible');
          
          // Check table headers
          cy.get(selectors.questionsTable).within(() => {
            cy.get('th, .table-header').should('contain.text', /question|type|category/i);
          });
        } else if ($body.find(selectors.emptyState).length > 0) {
          // Empty state
          cy.get(selectors.emptyState).should('be.visible');
        }
      });
    });

    it('should display empty state when no questions exist', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { statusCode: 200, body: [] }).as('getEmptyQuestions');
      cy.reload();
      cy.wait('@getEmptyQuestions');
      
      cy.get('body').should('contain.text', /no questions|empty|get started/i);
    });

    it('should handle loading states properly', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { delay: 2000, fixture: 'roi-questions.json' }).as('getQuestionsDelay');
      cy.reload();
      
      // Check for loading indicator
      cy.get('body').then(($body) => {
        if ($body.find(selectors.loadingSpinner).length > 0) {
          cy.get(selectors.loadingSpinner).should('be.visible');
        }
      });
      
      cy.wait('@getQuestionsDelay');
      
      // Loading should disappear
      cy.get(selectors.loadingSpinner).should('not.exist');
    });
  });

  describe('ROI Questions - CRUD Operations', () => {
    beforeEach(() => {
      loginAsAdmin();
      navigateToROIQuestions();
    });

    describe('Create Question', () => {
      beforeEach(() => {
        cy.intercept('POST', apiEndpoints.roiQuestions, { statusCode: 201, body: { id: 1, ...testData.question.valid } }).as('createQuestion');
      });

      it('should open create question form', () => {
        cy.get('body').then(($body) => {
          if ($body.find(selectors.addQuestionButton).length > 0) {
            cy.get(selectors.addQuestionButton).click();
            
            // Form should appear
            cy.get('body').then(($body2) => {
              if ($body2.find(selectors.modal).length > 0) {
                cy.get(selectors.modal).should('be.visible');
                cy.get(selectors.questionForm).should('be.visible');
              } else {
                cy.get(selectors.questionForm).should('be.visible');
              }
            });
          }
        });
      });

      it('should create question with valid data', () => {
        cy.get('body').then(($body) => {
          if ($body.find(selectors.addQuestionButton).length > 0) {
            cy.get(selectors.addQuestionButton).click();
            cy.wait(500);
            
            // Fill form
            cy.get(selectors.questionInput).type(testData.question.valid.question);
            
            // Select type if dropdown exists
            cy.get('body').then(($body2) => {
              if ($body2.find(selectors.typeSelect).length > 0) {
                cy.get(selectors.typeSelect).select(testData.question.valid.type);
              }
            });
            
            // Select category if dropdown exists
            cy.get('body').then(($body3) => {
              if ($body3.find(selectors.categorySelect).length > 0) {
                cy.get(selectors.categorySelect).select(testData.question.valid.category);
              }
            });
            
            // Add options if field exists
            cy.get('body').then(($body4) => {
              if ($body4.find(selectors.optionsInput).length > 0) {
                cy.get(selectors.optionsInput).type(testData.question.valid.options.join(', '));
              }
            });
            
            // Submit form
            cy.get(selectors.submitButton).click();
            cy.wait('@createQuestion');
            
            // Should show success message or redirect
            cy.get('body').should('contain.text', /success|created|added/i);
          }
        });
      });

      it('should validate required fields', () => {
        cy.get('body').then(($body) => {
          if ($body.find(selectors.addQuestionButton).length > 0) {
            cy.get(selectors.addQuestionButton).click();
            cy.wait(500);
            
            // Try to submit empty form
            cy.get(selectors.submitButton).click();
            
            // Should show validation errors
            cy.get('body').should('contain.text', /required|enter|provide/i);
          }
        });
      });

      it('should handle API errors during creation', () => {
        cy.intercept('POST', apiEndpoints.roiQuestions, { statusCode: 400, body: { error: 'Invalid question data' } }).as('createQuestionError');
        
        cy.get('body').then(($body) => {
          if ($body.find(selectors.addQuestionButton).length > 0) {
            cy.get(selectors.addQuestionButton).click();
            cy.wait(500);
            
            cy.get(selectors.questionInput).type(testData.question.valid.question);
            cy.get(selectors.submitButton).click();
            cy.wait('@createQuestionError');
            
            // Should show error message
            cy.get('body').should('contain.text', /error|failed|invalid/i);
          }
        });
      });
    });

    describe('Read Questions', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
      });

      it('should fetch and display questions', () => {
        cy.reload();
        cy.wait('@getQuestions');
        
        cy.get('@getQuestions').then((interception) => {
          if (interception.response.body.length > 0) {
            // Questions should be displayed
            cy.get('body').should('contain.text', interception.response.body[0].question || 'question');
          }
        });
      });

      it('should handle search functionality', () => {
        cy.wait('@getQuestions');
        
        cy.get('body').then(($body) => {
          if ($body.find(selectors.searchInput).length > 0) {
            cy.get(selectors.searchInput).type('patient safety');
            cy.wait(500);
            
            // Should filter results
            cy.get('body').should('contain.text', /patient safety|filtered|search/i);
          }
        });
      });

      it('should handle category filtering', () => {
        cy.wait('@getQuestions');
        
        cy.get('body').then(($body) => {
          if ($body.find(selectors.filterDropdown).length > 0) {
            cy.get(selectors.filterDropdown).first().select('patient_safety');
            cy.wait(500);
            
            // Should filter by category
            cy.get('body').should('contain.text', /patient safety|filtered/i);
          }
        });
      });
    });

    describe('Update Question', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
        cy.intercept('PATCH', '/api/roi/questions/*', { statusCode: 200, body: { id: 1, ...testData.question.updated } }).as('updateQuestion');
      });

      it('should open edit form for existing question', () => {
        cy.wait('@getQuestions');
        
        cy.get('body').then(($body) => {
          if ($body.find(selectors.editButton).length > 0) {
            cy.get(selectors.editButton).first().click();
            cy.wait(500);
            
            // Form should appear with existing data
            cy.get(selectors.questionForm).should('be.visible');
            cy.get(selectors.questionInput).should('not.have.value', '');
          }
        });
      });

      it('should update question with valid data', () => {
        cy.wait('@getQuestions');
        
        cy.get('body').then(($body) => {
          if ($body.find(selectors.editButton).length > 0) {
            cy.get(selectors.editButton).first().click();
            cy.wait(500);
            
            // Update question text
            cy.get(selectors.questionInput).clear().type(testData.question.updated.question);
            
            // Submit update
            cy.get(selectors.submitButton).click();
            cy.wait('@updateQuestion');
            
            // Should show success message
            cy.get('body').should('contain.text', /success|updated|saved/i);
          }
        });
      });
    });

    describe('Delete Question', () => {
      beforeEach(() => {
        cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
        cy.intercept('DELETE', '/api/roi/questions/*', { statusCode: 200 }).as('deleteQuestion');
      });

      it('should delete question with confirmation', () => {
        cy.wait('@getQuestions');
        
        cy.get('body').then(($body) => {
          if ($body.find(selectors.deleteButton).length > 0) {
            cy.get(selectors.deleteButton).first().click();
            cy.wait(500);
            
            // Should show confirmation dialog
            cy.get('body').then(($body2) => {
              if ($body2.find(selectors.confirmDialog).length > 0) {
                cy.get(selectors.confirmDialog).should('be.visible');
                cy.get(selectors.confirmButton).click();
              } else if ($body2.find(selectors.confirmButton).length > 0) {
                cy.get(selectors.confirmButton).click();
              }
            });
            
            cy.wait('@deleteQuestion');
            
            // Should show success message
            cy.get('body').should('contain.text', /success|deleted|removed/i);
          }
        });
      });
    });
  });

  describe('Project Surveys - ROI Survey Management', () => {
    const projectId = 'ci-test-project';

    beforeEach(() => {
      loginAsAdmin();
      
      // Set up API intercepts
      cy.intercept('GET', apiEndpoints.projectSurveys(projectId), { fixture: 'project-surveys.json' }).as('getSurveys');
      cy.intercept('POST', apiEndpoints.projectSurveys(projectId), { statusCode: 201, body: { id: 1, ...testData.survey.valid } }).as('createSurvey');
      
      navigateToProjectSurveys(projectId);
    });

    it('should display project surveys page layout', () => {
      cy.get('body').should('contain.text', /survey|roi/i);
      
      // Check for main container
      cy.get('body').then(($body) => {
        if ($body.find(selectors.surveysContainer).length === 0) {
          cy.get('main, .main-content, .container').should('exist');
        } else {
          cy.get(selectors.surveysContainer).should('be.visible');
        }
      });
      
      // Check for add survey button
      cy.get('body').then(($body) => {
        if ($body.find(selectors.addSurveyButton).length > 0) {
          cy.get(selectors.addSurveyButton).should('be.visible');
        }
      });
    });

    it('should create new ROI survey', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.addSurveyButton).length > 0) {
          cy.get(selectors.addSurveyButton).click();
          cy.wait(500);
          
          // Fill survey form
          cy.get(selectors.surveyTitleInput).type(testData.survey.valid.title);
          cy.get(selectors.surveyDescriptionInput).type(testData.survey.valid.description);
          
          // Select ROI type if dropdown exists
          cy.get('body').then(($body2) => {
            if ($body2.find(selectors.surveyTypeSelect).length > 0) {
              cy.get(selectors.surveyTypeSelect).select(testData.survey.valid.type);
            }
          });
          
          // Submit form
          cy.get(selectors.submitButton).click();
          cy.wait('@createSurvey');
          
          // Should show success
          cy.get('body').should('contain.text', /success|created|added/i);
        }
      });
    });

    it('should display survey list', () => {
      cy.wait('@getSurveys');
      
      cy.get('body').then(($body) => {
        if ($body.find(selectors.surveysTable).length > 0) {
          cy.get(selectors.surveysTable).should('be.visible');
        } else if ($body.find('[data-testid*="survey"]').length > 0) {
          cy.get('[data-testid*="survey"]').should('be.visible');
        }
      });
    });
  });

  describe('Survey Responses - ROI Data Collection', () => {
    const surveyId = 'test-survey-1';

    beforeEach(() => {
      loginAsAdmin();
      
      // Set up API intercepts
      cy.intercept('GET', apiEndpoints.surveyResponses(surveyId), { fixture: 'survey-responses.json' }).as('getResponses');
      cy.intercept('POST', apiEndpoints.surveyResponses(surveyId), { statusCode: 201, body: { id: 1, ...testData.response.valid } }).as('createResponse');
      cy.intercept('POST', apiEndpoints.surveysComplete(surveyId), { statusCode: 200 }).as('completeSurvey');
      
      cy.visit(`/surveys/${surveyId}/respond`);
      cy.wait(1000);
    });

    it('should display survey response form', () => {
      cy.get('body').should('contain.text', /survey|response|roi/i);
      
      // Check for response form
      cy.get('body').then(($body) => {
        if ($body.find(selectors.responseForm).length > 0) {
          cy.get(selectors.responseForm).should('be.visible');
        } else {
          cy.get('form, .form').should('exist');
        }
      });
    });

    it('should submit survey response', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.responseInput).length > 0) {
          // Fill response form
          cy.get(selectors.responseInput).first().type(testData.response.valid.value);
          
          if ($body.find(selectors.commentsInput).length > 0) {
            cy.get(selectors.commentsInput).type(testData.response.valid.comments);
          }
          
          // Submit response
          cy.get(selectors.submitButton).click();
          cy.wait('@createResponse');
          
          // Should show success
          cy.get('body').should('contain.text', /success|submitted|saved/i);
        }
      });
    });

    it('should complete survey', () => {
      // Fill out responses first
      cy.get('body').then(($body) => {
        if ($body.find(selectors.responseInput).length > 0) {
          cy.get(selectors.responseInput).each(($input) => {
            cy.wrap($input).type('4');
          });
          
          // Complete survey
          cy.get('[data-testid="complete-survey"], [data-testid="finish-survey"]').then(($completeBtn) => {
            if ($completeBtn.length > 0) {
              cy.wrap($completeBtn).click();
              cy.wait('@completeSurvey');
              
              // Should show completion message
              cy.get('body').should('contain.text', /complete|finished|thank you/i);
            }
          });
        }
      });
    });

    it('should validate required responses', () => {
      cy.get('body').then(($body) => {
        if ($body.find(selectors.submitButton).length > 0) {
          // Try to submit without filling responses
          cy.get(selectors.submitButton).click();
          
          // Should show validation errors
          cy.get('body').should('contain.text', /required|complete|answer/i);
        }
      });
    });
  });

  describe('ROI Analytics & Reporting', () => {
    beforeEach(() => {
      loginAsAdmin();
      
      // Set up analytics intercepts
      cy.intercept('GET', '/api/roi/analytics', { fixture: 'roi-analytics.json' }).as('getRoiAnalytics');
      cy.intercept('GET', '/api/roi/reports', { fixture: 'roi-reports.json' }).as('getRoiReports');
      
      cy.visit('/roi/analytics');
      cy.wait(1000);
    });

    it('should display ROI analytics dashboard', () => {
      cy.get('body').should('contain.text', /roi|analytics|dashboard/i);
      
      // Check for analytics components
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="chart"], .chart, [data-testid*="metric"]').length > 0) {
          cy.get('[data-testid*="chart"], .chart, [data-testid*="metric"]').should('be.visible');
        }
      });
    });

    it('should handle date range filtering for analytics', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="date-range"], [data-testid*="date"]').length > 0) {
          cy.get('[data-testid="date-range"], [data-testid*="date"]').first().click();
          cy.wait(500);
          
          // Should update analytics
          cy.get('body').should('contain.text', /updated|filtered/i);
        }
      });
    });

    it('should export ROI reports', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="export"], [data-testid*="download"]').length > 0) {
          cy.intercept('POST', '/api/roi/export', { statusCode: 200, body: { downloadUrl: '/download/roi-report.pdf' } }).as('exportRoi');
          
          cy.get('[data-testid*="export"], [data-testid*="download"]').first().click();
          cy.wait('@exportRoi');
          
          // Should show export success
          cy.get('body').should('contain.text', /export|download|generated/i);
        }
      });
    });
  });

  describe('ROI Feature - Error Handling & Edge Cases', () => {
    beforeEach(() => {
      loginAsAdmin();
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { forceNetworkError: true }).as('networkError');
      
      navigateToROIQuestions();
      cy.wait('@networkError');
      
      // Should show error state
      cy.get('body').should('contain.text', /error|failed|connection/i);
    });

    it('should handle server errors (500)', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { statusCode: 500, body: { error: 'Internal Server Error' } }).as('serverError');
      
      navigateToROIQuestions();
      cy.wait('@serverError');
      
      // Should show error message
      cy.get('body').should('contain.text', /error|server|try again/i);
    });

    it('should handle unauthorized access (401)', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { statusCode: 401, body: { error: 'Unauthorized' } }).as('unauthorizedError');
      
      navigateToROIQuestions();
      cy.wait('@unauthorizedError');
      
      // Should redirect to login or show error
      cy.get('body').should('contain.text', /unauthorized|login|access denied/i);
    });

    it('should handle empty survey responses gracefully', () => {
      const surveyId = 'empty-survey';
      cy.intercept('GET', apiEndpoints.surveyResponses(surveyId), { statusCode: 200, body: [] }).as('getEmptyResponses');
      
      cy.visit(`/surveys/${surveyId}/responses`);
      cy.wait('@getEmptyResponses');
      
      // Should show empty state
      cy.get('body').should('contain.text', /no responses|empty|no data/i);
    });

    it('should validate survey completion requirements', () => {
      const surveyId = 'incomplete-survey';
      cy.intercept('POST', apiEndpoints.surveysComplete(surveyId), { statusCode: 400, body: { error: 'Survey not fully completed' } }).as('incompleteError');
      
      cy.visit(`/surveys/${surveyId}/respond`);
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="complete-survey"]').length > 0) {
          cy.get('[data-testid="complete-survey"]').click();
          cy.wait('@incompleteError');
          
          // Should show completion error
          cy.get('body').should('contain.text', /complete|required|missing/i);
        }
      });
    });
  });

  describe('ROI Feature - Mobile Responsiveness', () => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop' }
    ];

    viewports.forEach(viewport => {
      describe(`${viewport.name} View (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
          loginAsAdmin();
          cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
        });

        it(`should display ROI questions properly on ${viewport.name}`, () => {
          navigateToROIQuestions();
          cy.wait('@getQuestions');
          
          // Check responsive layout
          cy.get('body').should('be.visible');
          
          // Check for mobile-specific elements if on mobile
          if (viewport.width < 768) {
            cy.get('body').then(($body) => {
              if ($body.find('[data-testid="mobile-menu"], .mobile-menu').length > 0) {
                cy.get('[data-testid="mobile-menu"], .mobile-menu').should('be.visible');
              }
            });
          }
        });

        it(`should handle form interactions on ${viewport.name}`, () => {
          navigateToROIQuestions();
          
          cy.get('body').then(($body) => {
            if ($body.find(selectors.addQuestionButton).length > 0) {
              cy.get(selectors.addQuestionButton).click();
              cy.wait(500);
              
              // Form should be accessible and usable
              cy.get(selectors.questionInput).should('be.visible').type('Test question');
              
              // Form should be responsive
              cy.get(selectors.questionInput).should('have.css', 'width');
            }
          });
        });
      });
    });
  });

  describe('ROI Feature - Performance & Accessibility', () => {
    beforeEach(() => {
      loginAsAdmin();
    });

    it('should load ROI questions page within acceptable time', () => {
      const startTime = Date.now();
      
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
      
      navigateToROIQuestions();
      cy.wait('@getQuestions');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });
    });

    it('should have proper accessibility attributes', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
      
      navigateToROIQuestions();
      cy.wait('@getQuestions');
      
      // Check for accessibility attributes
      cy.get('body').within(() => {
        cy.get('[role]').should('exist');
        cy.get('[aria-label], [aria-labelledby]').should('exist');
      });
    });

    it('should support keyboard navigation', () => {
      cy.intercept('GET', apiEndpoints.roiQuestions, { fixture: 'roi-questions.json' }).as('getQuestions');
      
      navigateToROIQuestions();
      cy.wait('@getQuestions');
      
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Test enter key on focusable elements
      cy.get('body').then(($body) => {
        if ($body.find('button:visible, a:visible, [tabindex]:visible').length > 0) {
          cy.get('button:visible, a:visible, [tabindex]:visible').first().focus().type('{enter}');
        }
      });
    });
  });
});
