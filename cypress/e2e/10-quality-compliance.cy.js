// ***********************************************
// NICEHR Platform - Quality & Compliance Tests
// ***********************************************

describe('Quality & Compliance', () => {
  beforeEach(() => {
    cy.loginViaApi();
  });

  describe('Consultant Scorecards', () => {
    beforeEach(() => {
      cy.visit('/quality/scorecards');
      cy.waitForPageLoad();
    });

    describe('Scorecard List', () => {
      it('should display scorecards list', () => {
        cy.get('[data-testid="scorecards-list"]').should('be.visible');
      });

      it('should filter by consultant', () => {
        cy.selectOption('[data-testid="filter-consultant"]', 'consultant');
      });

      it('should filter by project', () => {
        cy.selectOption('[data-testid="filter-project"]', 'project');
      });

      it('should filter by date range', () => {
        cy.get('[data-testid="input-start-date"]').type('2024-01-01');
        cy.get('[data-testid="input-end-date"]').type('2024-03-31');
        cy.get('[data-testid="button-apply-filter"]').click();
      });
    });

    describe('Create Scorecard', () => {
      it('should create new scorecard', () => {
        cy.openModal('button-create-scorecard');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-evaluation-period"]').type('Q1 2024');
        
        // Rate categories
        cy.get('[data-testid="rating-technical"]').within(() => {
          cy.get('[data-testid="star-4"]').click();
        });
        cy.get('[data-testid="rating-communication"]').within(() => {
          cy.get('[data-testid="star-5"]').click();
        });
        cy.get('[data-testid="rating-teamwork"]').within(() => {
          cy.get('[data-testid="star-4"]').click();
        });
        cy.get('[data-testid="rating-punctuality"]').within(() => {
          cy.get('[data-testid="star-5"]').click();
        });
        
        cy.get('[data-testid="input-comments"]').type('Excellent performance overall');
        cy.get('[data-testid="button-submit-scorecard"]').click();
      });

      it('should add improvement areas', () => {
        cy.openModal('button-create-scorecard');
        cy.get('[data-testid="input-improvement-areas"]').type('Documentation skills');
        cy.get('[data-testid="button-add-improvement"]').click();
      });

      it('should add achievements', () => {
        cy.openModal('button-create-scorecard');
        cy.get('[data-testid="input-achievements"]').type('Led successful go-live');
        cy.get('[data-testid="button-add-achievement"]').click();
      });
    });

    describe('View Scorecard', () => {
      beforeEach(() => {
        cy.get('[data-testid="scorecard-item"]').first().click();
        cy.waitForPageLoad();
      });

      it('should display scorecard details', () => {
        cy.get('[data-testid="scorecard-details"]').should('be.visible');
      });

      it('should show overall score', () => {
        cy.get('[data-testid="overall-score"]').should('be.visible');
      });

      it('should show category breakdown', () => {
        cy.get('[data-testid="category-scores"]').should('be.visible');
      });

      it('should show historical trend', () => {
        cy.get('[data-testid="score-trend-chart"]').should('be.visible');
      });
    });
  });

  describe('Pulse Surveys', () => {
    beforeEach(() => {
      cy.visit('/quality/surveys');
      cy.waitForPageLoad();
    });

    describe('Survey List', () => {
      it('should display surveys list', () => {
        cy.get('[data-testid="surveys-list"]').should('be.visible');
      });

      it('should show survey status', () => {
        cy.get('[data-testid="survey-status"]').should('exist');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Active');
      });
    });

    describe('Create Survey', () => {
      it('should create new pulse survey', () => {
        cy.openModal('button-create-survey');
        cy.get('[data-testid="input-survey-title"]').type('Weekly Check-in Survey');
        cy.get('[data-testid="input-survey-description"]').type('Quick weekly feedback');
        cy.selectOption('[data-testid="select-target-audience"]', 'All Consultants');
        cy.get('[data-testid="input-due-date"]').type('2024-02-01');
        
        // Add questions
        cy.get('[data-testid="button-add-question"]').click();
        cy.get('[data-testid="input-question-text"]').type('How satisfied are you this week?');
        cy.selectOption('[data-testid="select-question-type"]', 'Rating Scale');
        
        cy.get('[data-testid="button-submit-survey"]').click();
      });

      it('should add multiple questions', () => {
        cy.openModal('button-create-survey');
        cy.get('[data-testid="button-add-question"]').click();
        cy.get('[data-testid="input-question-text"]').first().type('Question 1');
        cy.get('[data-testid="button-add-question"]').click();
        cy.get('[data-testid="input-question-text"]').eq(1).type('Question 2');
        
        cy.get('[data-testid="survey-questions"]').should('have.length', 2);
      });

      it('should reorder questions', () => {
        cy.openModal('button-create-survey');
        cy.get('[data-testid="button-add-question"]').click();
        cy.get('[data-testid="button-add-question"]').click();
        cy.get('[data-testid="button-move-up"]').eq(1).click();
      });
    });

    describe('Take Survey', () => {
      it('should complete survey', () => {
        cy.get('[data-testid="survey-item"]').first()
          .find('[data-testid="button-take-survey"]').click();
        
        // Answer questions
        cy.get('[data-testid="rating-scale"]').first().within(() => {
          cy.get('[data-testid="rating-4"]').click();
        });
        cy.get('[data-testid="input-text-response"]').type('Great week overall');
        
        cy.get('[data-testid="button-submit-survey"]').click();
      });
    });

    describe('Survey Results', () => {
      beforeEach(() => {
        cy.get('[data-testid="survey-item"]').first().click();
        cy.get('[data-testid="tab-results"]').click();
      });

      it('should display response summary', () => {
        cy.get('[data-testid="response-summary"]').should('be.visible');
      });

      it('should show response rate', () => {
        cy.get('[data-testid="response-rate"]').should('be.visible');
      });

      it('should show question-by-question breakdown', () => {
        cy.get('[data-testid="question-results"]').should('be.visible');
      });

      it('should export results', () => {
        cy.get('[data-testid="button-export-results"]').click();
      });
    });
  });

  describe('NPS Tracking', () => {
    beforeEach(() => {
      cy.visit('/quality/nps');
      cy.waitForPageLoad();
    });

    it('should display NPS dashboard', () => {
      cy.get('[data-testid="nps-dashboard"]').should('be.visible');
    });

    it('should show current NPS score', () => {
      cy.get('[data-testid="nps-score"]').should('be.visible');
    });

    it('should show promoters/passives/detractors breakdown', () => {
      cy.get('[data-testid="nps-breakdown"]').should('be.visible');
    });

    it('should show NPS trend over time', () => {
      cy.get('[data-testid="nps-trend-chart"]').should('be.visible');
    });

    it('should filter by project', () => {
      cy.selectOption('[data-testid="filter-project"]', 'project');
    });

    it('should filter by date range', () => {
      cy.get('[data-testid="input-start-date"]').type('2024-01-01');
      cy.get('[data-testid="input-end-date"]').type('2024-03-31');
      cy.get('[data-testid="button-apply-filter"]').click();
    });
  });

  describe('Incident Reporting', () => {
    beforeEach(() => {
      cy.visit('/quality/incidents');
      cy.waitForPageLoad();
    });

    describe('Incident List', () => {
      it('should display incidents list', () => {
        cy.get('[data-testid="incidents-list"]').should('be.visible');
      });

      it('should filter by severity', () => {
        cy.selectOption('[data-testid="filter-severity"]', 'High');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Open');
      });

      it('should filter by type', () => {
        cy.selectOption('[data-testid="filter-type"]', 'Safety');
      });
    });

    describe('Report Incident', () => {
      it('should report new incident', () => {
        cy.openModal('button-report-incident');
        cy.get('[data-testid="input-incident-title"]').type('System Access Issue');
        cy.get('[data-testid="input-incident-date"]').type('2024-01-15');
        cy.get('[data-testid="input-incident-time"]').type('14:30');
        cy.selectOption('[data-testid="select-incident-type"]', 'Technical');
        cy.selectOption('[data-testid="select-severity"]', 'Medium');
        cy.get('[data-testid="input-description"]').type('Detailed description of the incident');
        cy.get('[data-testid="input-immediate-actions"]').type('Actions taken immediately');
        cy.selectOption('[data-testid="select-project"]', 'project');
        
        cy.get('[data-testid="button-submit-incident"]').click();
      });

      it('should add witnesses', () => {
        cy.openModal('button-report-incident');
        cy.get('[data-testid="button-add-witness"]').click();
        cy.get('[data-testid="input-witness-name"]').type('John Doe');
        cy.get('[data-testid="input-witness-contact"]').type('john@example.com');
      });

      it('should attach evidence', () => {
        cy.openModal('button-report-incident');
        cy.get('[data-testid="file-upload-evidence"]').should('be.visible');
      });
    });

    describe('Incident Investigation', () => {
      beforeEach(() => {
        cy.get('[data-testid="incident-item"]').first().click();
        cy.waitForPageLoad();
      });

      it('should display incident details', () => {
        cy.get('[data-testid="incident-details"]').should('be.visible');
      });

      it('should add investigation notes', () => {
        cy.get('[data-testid="input-investigation-notes"]').type('Investigation findings');
        cy.get('[data-testid="button-save-notes"]').click();
      });

      it('should assign investigator', () => {
        cy.selectOption('[data-testid="select-investigator"]', 'user');
      });

      it('should update incident status', () => {
        cy.selectOption('[data-testid="select-status"]', 'Under Investigation');
      });

      it('should add corrective actions', () => {
        cy.get('[data-testid="button-add-corrective-action"]').click();
        cy.get('[data-testid="input-action-description"]').type('Implement additional training');
        cy.get('[data-testid="input-action-due-date"]').type('2024-02-15');
        cy.get('[data-testid="button-save-action"]').click();
      });

      it('should close incident', () => {
        cy.get('[data-testid="button-close-incident"]').click();
        cy.get('[data-testid="input-resolution"]').type('Resolved with corrective actions');
        cy.get('[data-testid="button-confirm-close"]').click();
      });
    });
  });

  describe('HIPAA Compliance Dashboard', () => {
    beforeEach(() => {
      cy.navigateTo('compliance');
      cy.waitForPageLoad();
    });

    describe('Compliance Overview', () => {
      it('should display compliance dashboard', () => {
        cy.get('[data-testid="compliance-dashboard"]').should('be.visible');
      });

      it('should show overall compliance score', () => {
        cy.get('[data-testid="compliance-score"]').should('be.visible');
      });

      it('should show compliance by category', () => {
        cy.get('[data-testid="compliance-categories"]').should('be.visible');
      });

      it('should show compliance trend', () => {
        cy.get('[data-testid="compliance-trend-chart"]').should('be.visible');
      });
    });

    describe('Compliance Checklist', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-checklist"]').click();
      });

      it('should display compliance checklist', () => {
        cy.get('[data-testid="compliance-checklist"]').should('be.visible');
      });

      it('should mark item as compliant', () => {
        cy.get('[data-testid="checklist-item"]').first()
          .find('[data-testid="checkbox-compliant"]').click();
      });

      it('should add compliance evidence', () => {
        cy.get('[data-testid="checklist-item"]').first()
          .find('[data-testid="button-add-evidence"]').click();
        cy.get('[data-testid="file-upload-evidence"]').should('be.visible');
      });

      it('should add compliance notes', () => {
        cy.get('[data-testid="checklist-item"]').first()
          .find('[data-testid="button-add-notes"]').click();
        cy.get('[data-testid="input-notes"]').type('Compliance notes');
        cy.get('[data-testid="button-save-notes"]').click();
      });
    });

    describe('Training Compliance', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-training-compliance"]').click();
      });

      it('should display training compliance status', () => {
        cy.get('[data-testid="training-compliance-list"]').should('be.visible');
      });

      it('should show consultants needing training', () => {
        cy.get('[data-testid="training-needed"]').should('be.visible');
      });

      it('should show training expiration warnings', () => {
        cy.get('[data-testid="training-expiring"]').should('exist');
      });

      it('should send training reminder', () => {
        cy.get('[data-testid="consultant-row"]').first()
          .find('[data-testid="button-send-reminder"]').click();
      });
    });

    describe('Audit Logs', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-audit-logs"]').click();
      });

      it('should display audit logs', () => {
        cy.get('[data-testid="audit-logs-list"]').should('be.visible');
      });

      it('should filter by user', () => {
        cy.selectOption('[data-testid="filter-user"]', 'user');
      });

      it('should filter by action type', () => {
        cy.selectOption('[data-testid="filter-action"]', 'View');
      });

      it('should filter by date range', () => {
        cy.get('[data-testid="input-start-date"]').type('2024-01-01');
        cy.get('[data-testid="input-end-date"]').type('2024-01-31');
        cy.get('[data-testid="button-apply-filter"]').click();
      });

      it('should export audit logs', () => {
        cy.get('[data-testid="button-export-logs"]').click();
      });
    });

    describe('Risk Assessment', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-risk-assessment"]').click();
      });

      it('should display risk assessment', () => {
        cy.get('[data-testid="risk-assessment"]').should('be.visible');
      });

      it('should show identified risks', () => {
        cy.get('[data-testid="identified-risks"]').should('be.visible');
      });

      it('should add new risk', () => {
        cy.openModal('button-add-risk');
        cy.get('[data-testid="input-risk-description"]').type('Data breach risk');
        cy.selectOption('[data-testid="select-likelihood"]', 'Medium');
        cy.selectOption('[data-testid="select-impact"]', 'High');
        cy.get('[data-testid="input-mitigation"]').type('Implement encryption');
        cy.get('[data-testid="button-submit-risk"]').click();
      });

      it('should update risk status', () => {
        cy.get('[data-testid="risk-item"]').first()
          .find('[data-testid="select-risk-status"]').select('Mitigated');
      });
    });
  });
});
