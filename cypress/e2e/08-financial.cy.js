// ***********************************************
// NICEHR Platform - Financial Management Tests
// (Expenses, Invoices, Payroll, Budget)
// ***********************************************

describe('Financial Management', () => {
  beforeEach(() => {
    cy.loginViaApi();
  });

  describe('Expense Management', () => {
    beforeEach(() => {
      cy.navigateTo('expenses');
      cy.waitForPageLoad();
    });

    describe('Expense List', () => {
      it('should display expenses list', () => {
        cy.get('[data-testid="expenses-table"], [data-testid="expenses-list"]').should('be.visible');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
      });

      it('should filter by date range', () => {
        cy.get('[data-testid="input-start-date"]').type('2024-01-01');
        cy.get('[data-testid="input-end-date"]').type('2024-01-31');
        cy.get('[data-testid="button-apply-filter"]').click();
      });

      it('should filter by category', () => {
        cy.selectOption('[data-testid="filter-category"]', 'Travel');
      });

      it('should search expenses', () => {
        cy.get('[data-testid="input-search"]').type('hotel');
      });
    });

    describe('Create Expense', () => {
      it('should open create expense modal', () => {
        cy.openModal('button-create-expense');
        cy.get('[role="dialog"]').should('contain', 'Expense');
      });

      it('should create a new expense', () => {
        cy.openModal('button-create-expense');
        cy.get('[data-testid="input-expense-date"]').type('2024-01-15');
        cy.selectOption('[data-testid="select-category"]', 'Travel');
        cy.get('[data-testid="input-vendor"]').type('Marriott Hotels');
        cy.get('[data-testid="input-amount"]').type('245.00');
        cy.get('[data-testid="input-description"]').type('Hotel accommodation for project meeting');
        cy.selectOption('[data-testid="select-project"]', 'project');
        
        cy.get('[data-testid="button-submit-expense"]').click();
        
        cy.get('[role="dialog"]').should('not.exist');
      });

      it('should upload receipt', () => {
        cy.openModal('button-create-expense');
        cy.get('[data-testid="file-upload-receipt"]').should('be.visible');
        // File upload would go here
      });

      it('should validate required fields', () => {
        cy.openModal('button-create-expense');
        cy.get('[data-testid="button-submit-expense"]').click();
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });

      it('should validate amount format', () => {
        cy.openModal('button-create-expense');
        cy.get('[data-testid="input-amount"]').type('invalid');
        cy.get('[data-testid="button-submit-expense"]').click();
        cy.get('.text-red-500, .text-destructive').should('be.visible');
      });
    });

    describe('Expense Approval Workflow', () => {
      it('should submit expense for approval', () => {
        cy.get('[data-testid="expense-row"]').first()
          .find('[data-testid="button-submit-approval"]').click();
      });

      it('should approve expense', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
        cy.get('[data-testid="expense-row"]').first()
          .find('[data-testid="button-approve"]').click();
      });

      it('should reject expense with reason', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
        cy.get('[data-testid="expense-row"]').first()
          .find('[data-testid="button-reject"]').click();
        cy.get('[data-testid="input-rejection-reason"]').type('Missing receipt');
        cy.get('[data-testid="button-confirm-reject"]').click();
      });

      it('should bulk approve expenses', () => {
        cy.get('[data-testid="checkbox-select-all"]').click();
        cy.get('[data-testid="button-bulk-approve"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });
    });

    describe('Expense Reports', () => {
      it('should view expense summary', () => {
        cy.get('[data-testid="tab-summary"]').click();
        cy.get('[data-testid="expense-summary"]').should('be.visible');
      });

      it('should export expenses to CSV', () => {
        cy.get('[data-testid="button-export"]').click();
        cy.selectOption('[data-testid="select-format"]', 'CSV');
        cy.get('[data-testid="button-download"]').click();
      });
    });
  });

  describe('Invoice Management', () => {
    beforeEach(() => {
      cy.navigateTo('invoices');
      cy.waitForPageLoad();
    });

    describe('Invoice List', () => {
      it('should display invoices list', () => {
        cy.get('[data-testid="invoices-table"]').should('be.visible');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Unpaid');
      });

      it('should filter by hospital', () => {
        cy.selectOption('[data-testid="filter-hospital"]', 'hospital');
      });

      it('should search invoices', () => {
        cy.get('[data-testid="input-search"]').type('INV-');
      });

      it('should show total outstanding', () => {
        cy.get('[data-testid="total-outstanding"]').should('be.visible');
      });
    });

    describe('Create Invoice', () => {
      it('should open create invoice modal', () => {
        cy.openModal('button-create-invoice');
        cy.get('[role="dialog"]').should('contain', 'Invoice');
      });

      it('should create a new invoice', () => {
        cy.openModal('button-create-invoice');
        cy.selectOption('[data-testid="select-hospital"]', 'hospital');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-invoice-date"]').type('2024-01-31');
        cy.get('[data-testid="input-due-date"]').type('2024-02-28');
        
        // Add line items
        cy.get('[data-testid="button-add-line-item"]').click();
        cy.get('[data-testid="input-line-description"]').type('Consulting services');
        cy.get('[data-testid="input-line-quantity"]').type('40');
        cy.get('[data-testid="input-line-rate"]').type('150');
        
        cy.get('[data-testid="button-submit-invoice"]').click();
        
        cy.get('[role="dialog"]').should('not.exist');
      });

      it('should calculate totals automatically', () => {
        cy.openModal('button-create-invoice');
        cy.get('[data-testid="button-add-line-item"]').click();
        cy.get('[data-testid="input-line-quantity"]').type('10');
        cy.get('[data-testid="input-line-rate"]').type('100');
        
        cy.get('[data-testid="invoice-subtotal"]').should('contain', '1,000');
      });

      it('should add multiple line items', () => {
        cy.openModal('button-create-invoice');
        cy.get('[data-testid="button-add-line-item"]').click();
        cy.get('[data-testid="button-add-line-item"]').click();
        cy.get('[data-testid="invoice-line-item"]').should('have.length', 2);
      });

      it('should remove line item', () => {
        cy.openModal('button-create-invoice');
        cy.get('[data-testid="button-add-line-item"]').click();
        cy.get('[data-testid="button-add-line-item"]').click();
        cy.get('[data-testid="button-remove-line-item"]').first().click();
        cy.get('[data-testid="invoice-line-item"]').should('have.length', 1);
      });
    });

    describe('Invoice Details', () => {
      beforeEach(() => {
        cy.get('table tbody tr').first().click();
        cy.waitForPageLoad();
      });

      it('should display invoice details', () => {
        cy.get('[data-testid="invoice-details"]').should('be.visible');
        cy.get('[data-testid="invoice-number"]').should('be.visible');
      });

      it('should show line items', () => {
        cy.get('[data-testid="invoice-line-items"]').should('be.visible');
      });

      it('should show payment history', () => {
        cy.get('[data-testid="payment-history"]').should('be.visible');
      });

      it('should download PDF invoice', () => {
        cy.get('[data-testid="button-download-pdf"]').click();
      });

      it('should send invoice via email', () => {
        cy.get('[data-testid="button-send-invoice"]').click();
        cy.get('[data-testid="input-recipient-email"]').type('billing@hospital.com');
        cy.get('[data-testid="button-confirm-send"]').click();
      });
    });

    describe('Invoice Payment', () => {
      beforeEach(() => {
        cy.get('table tbody tr').first().click();
        cy.waitForPageLoad();
      });

      it('should record payment', () => {
        cy.get('[data-testid="button-record-payment"]').click();
        cy.get('[data-testid="input-payment-amount"]').type('5000');
        cy.get('[data-testid="input-payment-date"]').type('2024-02-01');
        cy.selectOption('[data-testid="select-payment-method"]', 'Wire Transfer');
        cy.get('[data-testid="input-reference"]').type('REF-12345');
        cy.get('[data-testid="button-submit-payment"]').click();
      });

      it('should mark invoice as paid', () => {
        cy.get('[data-testid="button-mark-paid"]').click();
        cy.get('[data-testid="invoice-status"]').should('contain', 'Paid');
      });

      it('should void invoice', () => {
        cy.get('[data-testid="button-void-invoice"]').click();
        cy.get('[data-testid="input-void-reason"]').type('Duplicate invoice');
        cy.get('[data-testid="button-confirm-void"]').click();
      });
    });
  });

  describe('Payroll Management', () => {
    beforeEach(() => {
      cy.visit('/payroll');
      cy.waitForPageLoad();
    });

    describe('Payroll Batches', () => {
      it('should display payroll batches', () => {
        cy.get('[data-testid="payroll-batches-list"]').should('be.visible');
      });

      it('should filter by status', () => {
        cy.selectOption('[data-testid="filter-status"]', 'Pending');
      });

      it('should filter by pay period', () => {
        cy.get('[data-testid="filter-pay-period"]').should('be.visible');
      });
    });

    describe('Create Payroll Batch', () => {
      it('should create new payroll batch', () => {
        cy.openModal('button-create-batch');
        cy.get('[data-testid="input-pay-period-start"]').type('2024-01-01');
        cy.get('[data-testid="input-pay-period-end"]').type('2024-01-15');
        cy.get('[data-testid="input-pay-date"]').type('2024-01-20');
        cy.get('[data-testid="button-submit-batch"]').click();
      });

      it('should calculate payroll automatically', () => {
        cy.openModal('button-create-batch');
        cy.get('[data-testid="input-pay-period-start"]').type('2024-01-01');
        cy.get('[data-testid="input-pay-period-end"]').type('2024-01-15');
        cy.get('[data-testid="button-calculate"]').click();
        cy.get('[data-testid="payroll-totals"]').should('be.visible');
      });
    });

    describe('Payroll Batch Details', () => {
      beforeEach(() => {
        cy.get('[data-testid="payroll-batch-item"]').first().click();
        cy.waitForPageLoad();
      });

      it('should display batch details', () => {
        cy.get('[data-testid="batch-details"]').should('be.visible');
      });

      it('should show consultant payments', () => {
        cy.get('[data-testid="consultant-payments-list"]').should('be.visible');
      });

      it('should edit consultant payment', () => {
        cy.get('[data-testid="payment-row"]').first()
          .find('[data-testid="button-edit-payment"]').click();
        cy.get('[data-testid="input-hours"]').clear().type('42');
        cy.get('[data-testid="button-save-payment"]').click();
      });

      it('should approve payroll batch', () => {
        cy.get('[data-testid="button-approve-batch"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });

      it('should process payroll batch', () => {
        cy.get('[data-testid="button-process-batch"]').click();
        cy.get('[data-testid="button-confirm"]').click();
      });

      it('should export payroll report', () => {
        cy.get('[data-testid="button-export-payroll"]').click();
      });
    });

    describe('Pay Rates', () => {
      beforeEach(() => {
        cy.get('[data-testid="tab-pay-rates"]').click();
      });

      it('should display pay rates', () => {
        cy.get('[data-testid="pay-rates-list"]').should('be.visible');
      });

      it('should create new pay rate', () => {
        cy.openModal('button-create-rate');
        cy.selectOption('[data-testid="select-consultant"]', 'consultant');
        cy.selectOption('[data-testid="select-rate-type"]', 'Hourly');
        cy.get('[data-testid="input-rate"]').type('75');
        cy.get('[data-testid="input-effective-date"]').type('2024-01-01');
        cy.get('[data-testid="button-submit-rate"]').click();
      });

      it('should edit pay rate', () => {
        cy.get('[data-testid="pay-rate-row"]').first()
          .find('[data-testid="button-edit-rate"]').click();
        cy.get('[data-testid="input-rate"]').clear().type('80');
        cy.get('[data-testid="button-submit-rate"]').click();
      });
    });
  });

  describe('Budget Modeling', () => {
    beforeEach(() => {
      cy.visit('/budget');
      cy.waitForPageLoad();
    });

    describe('Budget Overview', () => {
      it('should display budget dashboard', () => {
        cy.get('[data-testid="budget-dashboard"]').should('be.visible');
      });

      it('should show budget vs actual', () => {
        cy.get('[data-testid="budget-vs-actual-chart"]').should('be.visible');
      });

      it('should show budget by category', () => {
        cy.get('[data-testid="budget-category-breakdown"]').should('be.visible');
      });

      it('should filter by project', () => {
        cy.selectOption('[data-testid="filter-project"]', 'project');
      });
    });

    describe('Create Budget', () => {
      it('should create new budget', () => {
        cy.openModal('button-create-budget');
        cy.selectOption('[data-testid="select-project"]', 'project');
        cy.get('[data-testid="input-budget-name"]').type('Q1 2024 Budget');
        cy.get('[data-testid="input-total-amount"]').type('500000');
        cy.get('[data-testid="button-submit-budget"]').click();
      });

      it('should add budget line items', () => {
        cy.get('[data-testid="budget-row"]').first().click();
        cy.openModal('button-add-line-item');
        cy.selectOption('[data-testid="select-category"]', 'Labor');
        cy.get('[data-testid="input-amount"]').type('300000');
        cy.get('[data-testid="button-submit-line-item"]').click();
      });
    });

    describe('Budget Tracking', () => {
      it('should show variance analysis', () => {
        cy.get('[data-testid="variance-report"]').should('be.visible');
      });

      it('should alert on over-budget items', () => {
        cy.get('[data-testid="over-budget-alert"]').should('exist');
      });

      it('should forecast remaining budget', () => {
        cy.get('[data-testid="budget-forecast"]').should('be.visible');
      });
    });
  });
});
