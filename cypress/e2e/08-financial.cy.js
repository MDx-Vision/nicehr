describe('Financial Module', () => {
  const testUser = {
    id: 1,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  };

  const mockExpenses = [
    {
      id: 'exp-1',
      category: 'meals',
      description: 'Client lunch meeting',
      status: 'submitted',
      amount: '125.50',
      expenseDate: '2024-12-20',
      createdAt: '2024-12-20T10:00:00Z',
      project: { id: 'proj-1', name: 'Hospital Alpha Project' },
      consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
    },
    {
      id: 'exp-2',
      category: 'travel',
      description: 'Flight to client site',
      status: 'approved',
      amount: '450.00',
      expenseDate: '2024-12-15',
      createdAt: '2024-12-15T10:00:00Z',
      project: { id: 'proj-1', name: 'Hospital Alpha Project' },
      consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
    },
    {
      id: 'exp-3',
      category: 'lodging',
      description: 'Hotel stay December',
      status: 'submitted',
      amount: '289.00',
      expenseDate: '2024-12-10',
      createdAt: '2024-12-10T10:00:00Z',
      project: { id: 'proj-2', name: 'Beta Hospital' },
      consultant: { id: 'cons-2', user: { firstName: 'Jane', lastName: 'Smith' } }
    },
    {
      id: 'exp-4',
      category: 'meals',
      description: 'Draft expense for editing',
      status: 'draft',
      amount: '75.00',
      expenseDate: '2024-12-22',
      createdAt: '2024-12-22T10:00:00Z',
      project: { id: 'proj-1', name: 'Hospital Alpha Project' },
      consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
    },
    {
      id: 'exp-5',
      category: 'meals',
      description: 'Expense with receipt',
      status: 'submitted',
      amount: '55.00',
      expenseDate: '2024-12-23',
      createdAt: '2024-12-23T10:00:00Z',
      receiptUrl: '/uploads/receipts/receipt-123.pdf',
      receiptFileName: 'receipt-123.pdf',
      project: { id: 'proj-1', name: 'Hospital Alpha Project' },
      consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
    }
  ];

  const mockInvoices = [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-001',
      status: 'sent',
      totalAmount: '5000.00',
      subtotal: '5000.00',
      paidAmount: '0',
      taxRate: '0',
      taxAmount: '0',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      createdAt: '2024-12-01T10:00:00Z',
      hospital: { id: 'hosp-1', name: 'General Hospital' },
      project: { id: 'proj-1', name: 'Hospital Alpha Project' },
      lineItems: [
        { id: 'li-1', description: 'Consulting Services', quantity: '40', unitPrice: '125.00', amount: '5000.00' }
      ]
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-002',
      status: 'paid',
      totalAmount: '3500.00',
      subtotal: '3500.00',
      paidAmount: '3500.00',
      paidAt: '2024-12-15T10:00:00Z',
      taxRate: '0',
      taxAmount: '0',
      issueDate: '2024-11-15',
      dueDate: '2024-12-15',
      createdAt: '2024-11-15T10:00:00Z',
      hospital: { id: 'hosp-2', name: 'City Medical Center' },
      project: { id: 'proj-2', name: 'Beta Hospital' },
      lineItems: []
    }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication
    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { user: testUser }
    }).as('loginRequest');
  });

  // ===========================================================================
  // Expenses Management
  // ===========================================================================

  describe('Expenses Management', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/expenses', {
        statusCode: 200,
        body: mockExpenses
      }).as('getExpenses');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: [{ id: 'proj-1', name: 'Hospital Alpha Project' }]
      }).as('getProjects');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      cy.intercept('GET', '/api/mileage-rates', {
        statusCode: 200,
        body: []
      }).as('getMileageRates');

      cy.intercept('GET', '/api/per-diem-policies', {
        statusCode: 200,
        body: []
      }).as('getPerDiemPolicies');

      // Login and navigate to expenses
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@loginRequest');
      cy.visit('/expenses', { failOnStatusCode: false });
      cy.wait('@getExpenses');
    });

    it('should display expenses list', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Expenses');
      cy.get('[data-testid="expense-row-exp-1"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-2"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-3"]').should('be.visible');
    });

    it('should display expense stats cards', () => {
      cy.get('[data-testid="stat-pending-expenses"]').should('be.visible');
      cy.get('[data-testid="stat-approved-expenses"]').should('be.visible');
      cy.get('[data-testid="stat-rejected-expenses"]').should('be.visible');
      cy.get('[data-testid="stat-pending-amount"]').should('be.visible');
    });

    it('should filter expenses by status', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.contains('Submitted').click();

      // Should only show submitted expenses
      cy.get('[data-testid="expense-row-exp-1"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-3"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-2"]').should('not.exist');
    });

    it('should filter expenses by category', () => {
      cy.get('[data-testid="filter-category"]').click();
      cy.contains('Travel').click();

      cy.get('[data-testid="expense-row-exp-2"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-1"]').should('not.exist');
    });

    it('should filter expenses by date range', () => {
      // Set date range
      cy.get('[data-testid="input-date-from"]').type('2024-12-15');
      cy.get('[data-testid="input-date-to"]').type('2024-12-25');

      // Should filter to expenses in date range
      cy.get('[data-testid="expense-row-exp-1"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-2"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-3"]').should('not.exist');
    });

    it('should search expenses by description', () => {
      cy.get('[data-testid="input-search-expenses"]').type('flight');

      cy.get('[data-testid="expense-row-exp-2"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-1"]').should('not.exist');
      cy.get('[data-testid="expense-row-exp-3"]').should('not.exist');
    });

    it('should search expenses by project name', () => {
      cy.get('[data-testid="input-search-expenses"]').type('Beta');

      cy.get('[data-testid="expense-row-exp-3"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-1"]').should('not.exist');
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get('[data-testid="input-search-expenses"]').type('test');
      cy.get('[data-testid="button-clear-filters"]').should('be.visible').click();

      // All expenses should be visible again
      cy.get('[data-testid="expense-row-exp-1"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-2"]').should('be.visible');
      cy.get('[data-testid="expense-row-exp-3"]').should('be.visible');
    });

    it('should have export CSV button', () => {
      cy.get('[data-testid="button-export-csv"]').should('be.visible').and('not.be.disabled');
    });

    it('should disable export when no expenses match filters', () => {
      // Apply filter that matches nothing
      cy.get('[data-testid="input-search-expenses"]').type('nonexistent expense xyz');

      cy.get('[data-testid="button-export-csv"]').should('be.disabled');
    });

    it('should show bulk actions toggle for admin', () => {
      cy.get('[data-testid="button-toggle-bulk"]').should('be.visible');
    });

    it('should enable bulk actions mode', () => {
      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="button-toggle-bulk"]').should('contain', 'Cancel Selection');
      cy.get('[data-testid="checkbox-header-select-all"]').should('be.visible');
    });

    it('should show checkboxes for submitted expenses in bulk mode', () => {
      cy.get('[data-testid="button-toggle-bulk"]').click();
      // exp-1 is submitted, should have enabled checkbox
      cy.get('[data-testid="checkbox-expense-exp-1"]').should('be.visible').and('not.be.disabled');
      // exp-2 is approved, should have disabled checkbox
      cy.get('[data-testid="checkbox-expense-exp-2"]').should('be.visible').and('be.disabled');
    });

    it('should select individual expenses', () => {
      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="checkbox-expense-exp-1"]').click();
      cy.get('[data-testid="bulk-actions-bar"]').should('be.visible');
      cy.get('[data-testid="bulk-actions-bar"]').should('contain', '1 expense(s) selected');
    });

    it('should select all submitted expenses', () => {
      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="checkbox-header-select-all"]').click();
      // Should select exp-1 and exp-3 (submitted) but not exp-2 (approved)
      cy.get('[data-testid="bulk-actions-bar"]').should('contain', '2 expense(s) selected');
    });

    it('should show bulk approve and reject buttons', () => {
      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="checkbox-expense-exp-1"]').click();
      cy.get('[data-testid="button-bulk-approve"]').should('be.visible');
      cy.get('[data-testid="button-bulk-reject"]').should('be.visible');
    });

    it('should bulk approve selected expenses', () => {
      cy.intercept('PATCH', '/api/expenses/exp-1', {
        statusCode: 200,
        body: { ...mockExpenses[0], status: 'approved' }
      }).as('approveExpense1');

      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="checkbox-expense-exp-1"]').click();
      cy.get('[data-testid="button-bulk-approve"]').click();
      cy.wait('@approveExpense1');
    });

    it('should bulk reject selected expenses', () => {
      cy.intercept('PATCH', '/api/expenses/exp-1', {
        statusCode: 200,
        body: { ...mockExpenses[0], status: 'rejected' }
      }).as('rejectExpense1');

      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="checkbox-expense-exp-1"]').click();
      cy.get('[data-testid="button-bulk-reject"]').click();
      cy.wait('@rejectExpense1');
    });

    it('should cancel bulk selection', () => {
      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="checkbox-expense-exp-1"]').click();
      cy.get('[data-testid="button-toggle-bulk"]').click();
      cy.get('[data-testid="bulk-actions-bar"]').should('not.exist');
    });

    // Phase 4: Edit Expense Tests
    it('should show edit button for draft expenses', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-edit-expense"]').should('be.visible');
    });

    it('should not show edit button for submitted expenses', () => {
      cy.intercept('GET', '/api/expenses/exp-1', {
        statusCode: 200,
        body: mockExpenses[0]
      }).as('getExpense1');

      cy.get('[data-testid="expense-row-exp-1"]').click();
      cy.wait('@getExpense1');

      cy.get('[data-testid="button-edit-expense"]').should('not.exist');
    });

    it('should open edit expense dialog', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-edit-expense"]').click();

      cy.get('[data-testid="edit-input-description"]').should('be.visible');
      cy.get('[data-testid="edit-input-amount"]').should('be.visible');
      cy.get('[data-testid="edit-select-category"]').should('be.visible');
    });

    it('should pre-populate edit form with expense data', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-edit-expense"]').click();

      cy.get('[data-testid="edit-input-description"]').should('have.value', 'Draft expense for editing');
      cy.get('[data-testid="edit-input-amount"]').should('have.value', '75.00');
    });

    it('should save edited expense', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.intercept('PATCH', '/api/expenses/exp-4', {
        statusCode: 200,
        body: { ...mockExpenses[3], description: 'Updated expense', amount: '100.00' }
      }).as('updateExpense');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-edit-expense"]').click();
      cy.get('[data-testid="edit-input-description"]').clear().type('Updated expense');
      cy.get('[data-testid="edit-input-amount"]').clear().type('100.00');
      cy.get('[data-testid="button-save-expense"]').click();

      cy.wait('@updateExpense');
    });

    it('should show submit for approval button for draft expenses', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-submit-expense"]').should('be.visible');
    });

    it('should submit expense for approval', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.intercept('POST', '/api/expenses/exp-4/submit', {
        statusCode: 200,
        body: { ...mockExpenses[3], status: 'submitted' }
      }).as('submitExpense');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-submit-expense"]').click();
      cy.wait('@submitExpense');
    });

    // Phase 5: Receipt Upload Tests
    it('should display receipt link when expense has receipt', () => {
      cy.intercept('GET', '/api/expenses/exp-5', {
        statusCode: 200,
        body: mockExpenses[4]
      }).as('getExpense5');

      cy.get('[data-testid="expense-row-exp-5"]').click();
      cy.wait('@getExpense5');

      cy.get('[data-testid="link-receipt"]').should('be.visible');
      cy.get('[data-testid="link-receipt"]').should('have.attr', 'href', '/uploads/receipts/receipt-123.pdf');
    });

    it('should show upload receipt button in create expense dialog', () => {
      cy.get('[data-testid="button-create-expense"]').click();
      cy.get('[data-testid="button-upload"]').should('be.visible');
    });

    it('should show upload receipt button in edit expense dialog', () => {
      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: mockExpenses[3]
      }).as('getExpense4');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4');

      cy.get('[data-testid="button-edit-expense"]').click();
      cy.get('[data-testid="button-upload"]').should('be.visible');
    });

    it('should show existing receipt info when editing expense with receipt', () => {
      const expenseWithReceipt = {
        ...mockExpenses[3],
        receiptUrl: '/uploads/receipts/existing-receipt.pdf'
      };

      cy.intercept('GET', '/api/expenses/exp-4', {
        statusCode: 200,
        body: expenseWithReceipt
      }).as('getExpense4WithReceipt');

      cy.get('[data-testid="expense-row-exp-4"]').click();
      cy.wait('@getExpense4WithReceipt');

      cy.get('[data-testid="button-edit-expense"]').click();
      cy.get('[data-testid="text-receipt-uploaded"]').should('be.visible');
      cy.get('[data-testid="link-view-receipt"]').should('be.visible');
    });
  });

  // ===========================================================================
  // Invoices
  // ===========================================================================

  describe('Invoices', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/invoices', {
        statusCode: 200,
        body: mockInvoices
      }).as('getInvoices');

      cy.intercept('GET', '/api/invoices/inv-1', {
        statusCode: 200,
        body: mockInvoices[0]
      }).as('getInvoice1');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: [{ id: 'proj-1', name: 'Hospital Alpha Project' }]
      }).as('getProjects');

      cy.intercept('GET', '/api/hospitals', {
        statusCode: 200,
        body: [{ id: 'hosp-1', name: 'General Hospital' }]
      }).as('getHospitals');

      cy.intercept('GET', '/api/invoice-templates', {
        statusCode: 200,
        body: []
      }).as('getTemplates');

      // Login and navigate to invoices
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@loginRequest');
      cy.visit('/invoices', { failOnStatusCode: false });
      cy.wait('@getInvoices');
    });

    it('should display invoice list', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Invoices');
      cy.get('[data-testid="invoice-row-inv-1"]').should('be.visible');
      cy.get('[data-testid="invoice-row-inv-2"]').should('be.visible');
    });

    it('should display invoice stats cards', () => {
      cy.get('[data-testid="stat-total-invoices"]').should('be.visible');
      cy.get('[data-testid="stat-pending-sent"]').should('be.visible');
      cy.get('[data-testid="stat-paid-invoices"]').should('be.visible');
      cy.get('[data-testid="stat-overdue-invoices"]').should('be.visible');
    });

    it('should filter invoices by status', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.contains('Paid').click();

      cy.get('[data-testid="invoice-row-inv-2"]').should('be.visible');
      cy.get('[data-testid="invoice-row-inv-1"]').should('not.exist');
    });

    it('should open invoice detail panel', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-close-detail"]').should('be.visible');
      cy.contains('INV-001').should('be.visible');
    });

    it('should show void button for sent invoices', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-void-invoice"]').should('be.visible');
    });

    it('should open void invoice dialog', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-void-invoice"]').click();
      cy.get('[data-testid="input-void-reason"]').should('be.visible');
      cy.contains('Void Invoice').should('be.visible');
    });

    it('should require reason to void invoice', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-void-invoice"]').click();
      cy.get('[data-testid="button-confirm-void"]').should('be.disabled');

      cy.get('[data-testid="input-void-reason"]').type('Duplicate invoice');
      cy.get('[data-testid="button-confirm-void"]').should('not.be.disabled');
    });

    it('should void invoice successfully', () => {
      cy.intercept('PATCH', '/api/invoices/inv-1', {
        statusCode: 200,
        body: { ...mockInvoices[0], status: 'cancelled' }
      }).as('voidInvoice');

      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-void-invoice"]').click();
      cy.get('[data-testid="input-void-reason"]').type('Customer requested cancellation');
      cy.get('[data-testid="button-confirm-void"]').click();

      cy.wait('@voidInvoice');
    });

    it('should show record payment button for unpaid invoices', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-record-payment"]').should('be.visible');
    });

    it('should open record payment dialog', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-record-payment"]').click();

      cy.get('[data-testid="input-payment-amount"]').should('be.visible');
      cy.get('[data-testid="select-payment-method"]').should('be.visible');
      cy.get('[data-testid="input-payment-reference"]').should('be.visible');
    });

    it('should pre-fill payment amount with balance due', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-record-payment"]').click();

      cy.get('[data-testid="input-payment-amount"]').should('have.value', '5000.00');
    });

    it('should record payment successfully', () => {
      cy.intercept('PATCH', '/api/invoices/inv-1', {
        statusCode: 200,
        body: { ...mockInvoices[0], paidAmount: '5000.00', status: 'paid' }
      }).as('recordPayment');

      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-record-payment"]').click();
      cy.get('[data-testid="select-payment-method"]').click();
      cy.contains('Wire Transfer').click();
      cy.get('[data-testid="input-payment-reference"]').type('WIRE-12345');
      cy.get('[data-testid="button-confirm-payment"]').click();

      cy.wait('@recordPayment');
    });

    it('should show payment complete status for paid invoices', () => {
      cy.intercept('GET', '/api/invoices/inv-2', {
        statusCode: 200,
        body: mockInvoices[1]
      }).as('getInvoice2');

      cy.get('[data-testid="invoice-row-inv-2"]').click();
      cy.wait('@getInvoice2');

      cy.contains('Payment Complete').should('be.visible');
      cy.get('[data-testid="button-record-payment"]').should('not.exist');
    });

    // Phase 3: PDF Download and Email Invoice
    it('should show download PDF button in invoice detail', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-download-pdf"]').should('be.visible');
      cy.get('[data-testid="button-download-pdf"]').contains('Download PDF');
    });

    it('should show email invoice button for admin', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-email-invoice"]').should('be.visible');
      cy.get('[data-testid="button-email-invoice"]').contains('Email Invoice');
    });

    it('should open email invoice dialog', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-email-invoice"]').click();

      cy.get('[data-testid="input-recipient-email"]').should('be.visible');
      cy.get('[data-testid="input-recipient-name"]').should('be.visible');
      cy.get('[data-testid="input-email-message"]').should('be.visible');
      cy.get('[data-testid="button-confirm-send-email"]').should('be.visible');
    });

    it('should require email to send invoice', () => {
      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-email-invoice"]').click();
      cy.get('[data-testid="button-confirm-send-email"]').should('be.disabled');

      cy.get('[data-testid="input-recipient-email"]').type('client@hospital.com');
      cy.get('[data-testid="button-confirm-send-email"]').should('not.be.disabled');
    });

    it('should send invoice email successfully', () => {
      cy.intercept('POST', '/api/invoices/inv-1/send-email', {
        statusCode: 200,
        body: { success: true, message: 'Invoice sent to client@hospital.com' }
      }).as('sendInvoiceEmail');

      cy.get('[data-testid="invoice-row-inv-1"]').click();
      cy.wait('@getInvoice1');

      cy.get('[data-testid="button-email-invoice"]').click();
      cy.get('[data-testid="input-recipient-email"]').type('client@hospital.com');
      cy.get('[data-testid="input-recipient-name"]').type('John Smith');
      cy.get('[data-testid="input-email-message"]').type('Please find attached your invoice for services rendered.');
      cy.get('[data-testid="button-confirm-send-email"]').click();

      cy.wait('@sendInvoiceEmail');
    });
  });

  // ===========================================================================
  // TODO: Additional Features (Not Yet Implemented)
  // ===========================================================================

  describe('Payroll', () => {
    const mockPayrollBatches = [
      {
        id: 'batch-1',
        name: 'December 2024 Payroll',
        status: 'draft',
        periodStart: '2024-12-01',
        periodEnd: '2024-12-15',
        payDate: '2024-12-20',
        totalAmount: '15000.00',
        totalEntries: 5,
        createdAt: '2024-12-10T10:00:00Z'
      },
      {
        id: 'batch-2',
        name: 'November 2024 Payroll',
        status: 'paid',
        periodStart: '2024-11-01',
        periodEnd: '2024-11-30',
        payDate: '2024-12-05',
        totalAmount: '22500.00',
        totalEntries: 8,
        createdAt: '2024-11-25T10:00:00Z'
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', '/api/payroll-batches', {
        statusCode: 200,
        body: mockPayrollBatches
      }).as('getPayrollBatches');

      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: []
      }).as('getPayRates');

      cy.intercept('GET', '/api/paycheck-stubs', {
        statusCode: 200,
        body: []
      }).as('getPaycheckStubs');

      cy.intercept('GET', '/api/consultants', {
        statusCode: 200,
        body: []
      }).as('getConsultants');

      // Login and navigate to payroll
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@loginRequest');
      cy.visit('/payroll', { failOnStatusCode: false });
      cy.wait('@getPayrollBatches');
    });

    it('should display payroll page', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Payroll');
    });

    it('should display payroll stats cards', () => {
      cy.get('[data-testid="stat-active-batches"]').should('be.visible');
      cy.get('[data-testid="stat-pending-payroll"]').should('be.visible');
    });

    it('should display payroll batches list', () => {
      cy.get('[data-testid="tab-batches"]').click();
      cy.contains('December 2024 Payroll').should('be.visible');
      cy.contains('November 2024 Payroll').should('be.visible');
    });

    it('should filter batches by status', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.contains('Processed').click();
      cy.contains('November 2024 Payroll').should('be.visible');
      cy.contains('December 2024 Payroll').should('not.exist');
    });

    it('should have export CSV button for batches', () => {
      cy.get('[data-testid="button-export-batches-csv"]').should('be.visible').and('not.be.disabled');
    });

    it('should disable export when no batches match filter', () => {
      cy.get('[data-testid="filter-status"]').click();
      cy.contains('Cancelled').click();
      cy.get('[data-testid="button-export-batches-csv"]').should('be.disabled');
    });

    // Phase 4: Payroll batch detail and entry editing tests
    it('should open batch detail view', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        totalHours: '160.00',
        totalRegularHours: '140.00',
        totalOvertimeHours: '20.00',
        consultantCount: 2
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [
          {
            id: 'entry-1',
            batchId: 'batch-1',
            consultantId: 'cons-1',
            regularHours: '80.00',
            overtimeHours: '10.00',
            hourlyRate: '75.00',
            overtimeRate: '112.50',
            grossPay: '7125.00',
            expenseReimbursement: '250.00',
            totalPay: '7375.00',
            consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
          }
        ]
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-close-detail"]').should('be.visible');
      cy.contains('December 2024 Payroll').should('be.visible');
    });

    it('should display entries in batch detail', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        totalHours: '160.00',
        totalRegularHours: '140.00',
        totalOvertimeHours: '20.00',
        consultantCount: 1
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [
          {
            id: 'entry-1',
            batchId: 'batch-1',
            consultantId: 'cons-1',
            regularHours: '80.00',
            overtimeHours: '10.00',
            hourlyRate: '75.00',
            overtimeRate: '112.50',
            grossPay: '7125.00',
            expenseReimbursement: '250.00',
            totalPay: '7375.00',
            consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
          }
        ]
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="entry-row-entry-1"]').should('be.visible');
      cy.contains('John Doe').should('be.visible');
    });

    it('should show edit and delete buttons for draft batch entries', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'draft',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [
          {
            id: 'entry-1',
            batchId: 'batch-1',
            regularHours: '80.00',
            hourlyRate: '75.00',
            grossPay: '6000.00',
            totalPay: '6000.00',
            consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
          }
        ]
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-edit-entry-entry-1"]').should('be.visible');
      cy.get('[data-testid="button-delete-entry-entry-1"]').should('be.visible');
    });

    it('should open edit entry dialog', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'draft',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [
          {
            id: 'entry-1',
            batchId: 'batch-1',
            regularHours: '80.00',
            overtimeHours: '0',
            hourlyRate: '75.00',
            overtimeRate: '112.50',
            expenseReimbursement: '0',
            grossPay: '6000.00',
            totalPay: '6000.00',
            consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
          }
        ]
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-edit-entry-entry-1"]').click();

      cy.get('[data-testid="edit-input-regular-hours"]').should('be.visible');
      cy.get('[data-testid="edit-input-overtime-hours"]').should('be.visible');
      cy.get('[data-testid="edit-input-hourly-rate"]').should('be.visible');
    });

    it('should save edited entry', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'draft',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [
          {
            id: 'entry-1',
            batchId: 'batch-1',
            regularHours: '80.00',
            overtimeHours: '0',
            hourlyRate: '75.00',
            overtimeRate: '112.50',
            expenseReimbursement: '0',
            grossPay: '6000.00',
            totalPay: '6000.00',
            consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
          }
        ]
      }).as('getEntries');

      cy.intercept('PATCH', '/api/payroll-entries/entry-1', {
        statusCode: 200,
        body: { id: 'entry-1', regularHours: '88.00', totalPay: '6600.00' }
      }).as('updateEntry');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-edit-entry-entry-1"]').click();
      cy.get('[data-testid="edit-input-regular-hours"]').clear().type('88');
      cy.get('[data-testid="button-save-entry"]').click();

      cy.wait('@updateEntry');
    });

    it('should delete entry from draft batch', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'draft',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [
          {
            id: 'entry-1',
            batchId: 'batch-1',
            regularHours: '80.00',
            totalPay: '6000.00',
            consultant: { id: 'cons-1', user: { firstName: 'John', lastName: 'Doe' } }
          }
        ]
      }).as('getEntries');

      cy.intercept('DELETE', '/api/payroll-entries/entry-1', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteEntry');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-delete-entry-entry-1"]').click();
      cy.wait('@deleteEntry');
    });

    it('should show submit for approval button for draft batch', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'draft',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: [{ id: 'entry-1', batchId: 'batch-1' }]
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-submit-batch"]').should('be.visible');
    });

    it('should show approve button for processing batch', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'processing',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-approve-batch"]').should('be.visible');
    });

    it('should show process payment button for approved batch', () => {
      const mockBatchDetails = {
        ...mockPayrollBatches[0],
        status: 'approved',
        totalHours: '80.00'
      };

      cy.intercept('GET', '/api/payroll-batches/batch-1', {
        statusCode: 200,
        body: mockBatchDetails
      }).as('getBatchDetails');

      cy.intercept('GET', '/api/payroll-entries?*', {
        statusCode: 200,
        body: []
      }).as('getEntries');

      cy.get('[data-testid="batch-row-batch-1"]').click();
      cy.wait('@getBatchDetails');
      cy.wait('@getEntries');

      cy.get('[data-testid="button-process-batch"]').should('be.visible');
    });

    it.skip('TODO: Auto-calculate consultant payments from timesheets', () => {});
    it.skip('TODO: Process batch for payment', () => {});

    // Phase 6: Pay Rates Management Tests
    it('should display pay rates tab', () => {
      cy.get('[data-testid="tab-settings"]').click();
      cy.contains('Pay Rates').should('be.visible');
    });

    it('should display pay rates list', () => {
      const mockPayRates = [
        {
          id: 'rate-1',
          consultantId: 'cons-1',
          hourlyRate: '75.00',
          overtimeRate: '112.50',
          effectiveFrom: '2024-01-01',
          effectiveTo: null,
          isActive: true
        }
      ];

      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: mockPayRates
      }).as('getPayRates');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="pay-rate-row-rate-1"]').should('be.visible');
    });

    it('should show add pay rate button', () => {
      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: []
      }).as('getPayRates');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-add-pay-rate"]').should('be.visible');
    });

    it('should open create pay rate dialog', () => {
      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: []
      }).as('getPayRates');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-add-pay-rate"]').click();
      cy.get('[data-testid="select-pay-rate-consultant"]').should('be.visible');
      cy.get('[data-testid="input-pay-rate-hourly"]').should('be.visible');
    });

    it('should create new pay rate', () => {
      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: []
      }).as('getPayRates');

      cy.intercept('POST', '/api/pay-rates', {
        statusCode: 201,
        body: { id: 'rate-new', consultantId: 'cons-1', hourlyRate: '80.00' }
      }).as('createPayRate');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-add-pay-rate"]').click();
      cy.get('[data-testid="select-pay-rate-consultant"]').click();
      cy.get('[data-testid="select-pay-rate-consultant"]').parent().find('[role="option"]').first().click();
      cy.get('[data-testid="input-pay-rate-hourly"]').type('80.00');
      cy.get('[data-testid="button-save-pay-rate"]').click();

      cy.wait('@createPayRate');
    });

    it('should show edit button for pay rate', () => {
      const mockPayRates = [
        {
          id: 'rate-1',
          consultantId: 'cons-1',
          hourlyRate: '75.00',
          overtimeRate: '112.50',
          effectiveFrom: '2024-01-01',
          effectiveTo: null,
          isActive: true
        }
      ];

      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: mockPayRates
      }).as('getPayRates');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-edit-pay-rate-rate-1"]').should('be.visible');
    });

    it('should show delete button for pay rate', () => {
      const mockPayRates = [
        {
          id: 'rate-1',
          consultantId: 'cons-1',
          hourlyRate: '75.00',
          overtimeRate: '112.50',
          effectiveFrom: '2024-01-01',
          effectiveTo: null,
          isActive: true
        }
      ];

      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: mockPayRates
      }).as('getPayRates');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-delete-pay-rate-rate-1"]').should('be.visible');
    });

    it('should update pay rate', () => {
      const mockPayRates = [
        {
          id: 'rate-1',
          consultantId: 'cons-1',
          hourlyRate: '75.00',
          overtimeRate: '112.50',
          effectiveFrom: '2024-01-01',
          effectiveTo: null,
          isActive: true
        }
      ];

      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: mockPayRates
      }).as('getPayRates');

      cy.intercept('PATCH', '/api/pay-rates/rate-1', {
        statusCode: 200,
        body: { ...mockPayRates[0], hourlyRate: '85.00' }
      }).as('updatePayRate');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-edit-pay-rate-rate-1"]').click();
      cy.get('[data-testid="input-pay-rate-hourly"]').clear().type('85.00');
      cy.get('[data-testid="button-save-pay-rate"]').click();

      cy.wait('@updatePayRate');
    });

    it('should delete pay rate', () => {
      const mockPayRates = [
        {
          id: 'rate-1',
          consultantId: 'cons-1',
          hourlyRate: '75.00',
          overtimeRate: '112.50',
          effectiveFrom: '2024-01-01',
          effectiveTo: null,
          isActive: true
        }
      ];

      cy.intercept('GET', '/api/pay-rates', {
        statusCode: 200,
        body: mockPayRates
      }).as('getPayRates');

      cy.intercept('DELETE', '/api/pay-rates/rate-1', {
        statusCode: 200,
        body: { message: 'Deleted' }
      }).as('deletePayRate');

      cy.get('[data-testid="tab-settings"]').click();
      cy.wait('@getPayRates');

      cy.get('[data-testid="button-delete-pay-rate-rate-1"]').click();
      cy.wait('@deletePayRate');
    });
  });

  describe('Budget Modeling', () => {
    const mockBudgetScenarios = [
      {
        id: 'scenario-1',
        name: 'Q1 2025 Baseline',
        description: 'Baseline budget for Q1 2025',
        scenarioType: 'baseline',
        projectId: 'proj-1',
        totalBudget: '50000.00',
        actualTotalCost: '45000.00',
        budgetVariance: '-5000.00',
        variancePercentage: '-10.00',
        isBaseline: true,
        isActive: true,
        createdAt: '2024-12-01T10:00:00Z',
        project: { id: 'proj-1', name: 'Hospital A Implementation' },
        creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' }
      },
      {
        id: 'scenario-2',
        name: 'Q1 2025 Optimistic',
        description: 'Optimistic scenario with reduced costs',
        scenarioType: 'optimistic',
        projectId: 'proj-1',
        totalBudget: '40000.00',
        actualTotalCost: '35000.00',
        budgetVariance: '-5000.00',
        variancePercentage: '-12.50',
        isBaseline: false,
        isActive: true,
        createdAt: '2024-12-05T10:00:00Z',
        project: { id: 'proj-1', name: 'Hospital A Implementation' },
        creator: { id: 'user-1', firstName: 'Admin', lastName: 'User' }
      }
    ];

    beforeEach(() => {
      cy.intercept('GET', '/api/budget-scenarios*', {
        statusCode: 200,
        body: mockBudgetScenarios
      }).as('getBudgetScenarios');

      cy.intercept('GET', '/api/projects', {
        statusCode: 200,
        body: [{ id: 'proj-1', name: 'Hospital A Implementation' }]
      }).as('getProjects');

      // Login and navigate to budget modeling
      cy.visit('/login', { failOnStatusCode: false });
      cy.get('[data-testid="input-email"]').type(testUser.email);
      cy.get('[data-testid="input-password"]').type('password123');
      cy.get('[data-testid="button-login"]').click();
      cy.wait('@loginRequest');
      cy.visit('/budget-modeling', { failOnStatusCode: false });
      cy.wait('@getBudgetScenarios');
    });

    it('should display budget modeling page', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Budget Modeling');
    });

    it('should display scenario stats cards', () => {
      cy.get('[data-testid="stat-total-scenarios"]').should('be.visible');
      cy.get('[data-testid="stat-baseline-scenarios"]').should('be.visible');
      cy.get('[data-testid="stat-whatif-scenarios"]').should('be.visible');
      cy.get('[data-testid="stat-active-scenarios"]').should('be.visible');
    });

    it('should display budget charts section', () => {
      cy.get('[data-testid="budget-charts"]').should('be.visible');
    });

    it('should display budget vs actual chart', () => {
      cy.get('[data-testid="chart-budget-vs-actual"]').should('be.visible');
      cy.get('[data-testid="chart-budget-vs-actual"]').contains('Budget vs Actual');
    });

    it('should display budget by type chart', () => {
      cy.get('[data-testid="chart-budget-by-type"]').should('be.visible');
      cy.get('[data-testid="chart-budget-by-type"]').contains('Budget by Scenario Type');
    });

    it('should display scenario list', () => {
      cy.get('[data-testid="scenario-row-scenario-1"]').should('be.visible');
      cy.get('[data-testid="scenario-row-scenario-2"]').should('be.visible');
    });

    it('should filter scenarios by type using tabs', () => {
      cy.get('[data-testid="tab-baseline"]').click();
      cy.get('[data-testid="scenario-row-scenario-1"]').should('be.visible');
    });

    it('should have create scenario button for admin', () => {
      cy.get('[data-testid="button-create-scenario"]').should('be.visible');
    });

    it('should have compare button when multiple scenarios exist', () => {
      cy.get('[data-testid="button-compare-scenarios"]').should('be.visible');
    });

    // Phase 7: Budget Creation with Line Items Tests
    it('should open create scenario dialog', () => {
      cy.get('[data-testid="button-create-scenario"]').click();
      cy.get('[data-testid="input-scenario-name"]').should('be.visible');
    });

    it('should display all line item inputs in create dialog', () => {
      cy.get('[data-testid="button-create-scenario"]').click();

      // Check all line item inputs are visible
      cy.get('[data-testid="input-labor-cost"]').should('be.visible');
      cy.get('[data-testid="input-travel-cost"]').should('be.visible');
      cy.get('[data-testid="input-expense-cost"]').should('be.visible');
      cy.get('[data-testid="input-overhead-cost"]').should('be.visible');
    });

    it('should display parameter inputs in create dialog', () => {
      cy.get('[data-testid="button-create-scenario"]').click();

      cy.get('[data-testid="input-estimated-hours"]').should('be.visible');
      cy.get('[data-testid="input-hourly-rate"]').should('be.visible');
      cy.get('[data-testid="input-consultant-count"]').should('be.visible');
      cy.get('[data-testid="input-duration-weeks"]').should('be.visible');
    });

    it('should create budget scenario with line items', () => {
      cy.intercept('POST', '/api/budget-scenarios', {
        statusCode: 201,
        body: {
          id: 'scenario-new',
          name: 'Q2 2025 Budget',
          scenarioType: 'baseline',
          laborCost: '30000.00',
          travelCost: '5000.00',
          expenseCost: '3000.00',
          overheadCost: '2000.00',
          totalBudget: '40000.00'
        }
      }).as('createScenario');

      cy.get('[data-testid="button-create-scenario"]').click();

      // Fill in scenario details
      cy.get('[data-testid="input-scenario-name"]').type('Q2 2025 Budget');
      cy.get('[data-testid="select-scenario-type"]').click();
      cy.contains('Baseline').click();

      // Fill in line items
      cy.get('[data-testid="input-labor-cost"]').type('30000');
      cy.get('[data-testid="input-travel-cost"]').type('5000');
      cy.get('[data-testid="input-expense-cost"]').type('3000');
      cy.get('[data-testid="input-overhead-cost"]').type('2000');

      cy.get('[data-testid="button-create-scenario"]').last().click();
      cy.wait('@createScenario');
    });

    it('should create budget scenario with parameters', () => {
      cy.intercept('POST', '/api/budget-scenarios', {
        statusCode: 201,
        body: {
          id: 'scenario-new',
          name: 'Parametric Budget',
          estimatedHours: '1000.00',
          hourlyRate: '75.00',
          consultantCount: 5,
          durationWeeks: 12
        }
      }).as('createScenario');

      cy.get('[data-testid="button-create-scenario"]').click();

      cy.get('[data-testid="input-scenario-name"]').type('Parametric Budget');
      cy.get('[data-testid="input-estimated-hours"]').type('1000');
      cy.get('[data-testid="input-hourly-rate"]').type('75');
      cy.get('[data-testid="input-consultant-count"]').type('5');
      cy.get('[data-testid="input-duration-weeks"]').type('12');

      cy.get('[data-testid="button-create-scenario"]').last().click();
      cy.wait('@createScenario');
    });

    it('should show project selector in create dialog', () => {
      cy.get('[data-testid="button-create-scenario"]').click();
      cy.get('[data-testid="select-project"]').should('be.visible');
    });

    it('should show baseline checkbox in create dialog', () => {
      cy.get('[data-testid="button-create-scenario"]').click();
      cy.get('[data-testid="checkbox-is-baseline"]').should('be.visible');
    });

    it('should show assumptions textarea in create dialog', () => {
      cy.get('[data-testid="button-create-scenario"]').click();
      cy.get('[data-testid="input-assumptions"]').should('be.visible');
    });

    it.skip('TODO: Variance analysis report', () => {});
    it.skip('TODO: Over-budget alerts', () => {});
    it.skip('TODO: Budget forecasting', () => {});
  });
});
