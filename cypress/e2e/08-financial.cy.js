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
  });

  // ===========================================================================
  // TODO: Additional Features (Not Yet Implemented)
  // ===========================================================================

  describe('Payroll', () => {
    it.skip('TODO: Display payroll batches list', () => {});
    it.skip('TODO: Create payroll batch with date range', () => {});
    it.skip('TODO: Auto-calculate consultant payments', () => {});
    it.skip('TODO: View batch details', () => {});
    it.skip('TODO: Edit consultant payment amounts', () => {});
    it.skip('TODO: Approve batch workflow', () => {});
    it.skip('TODO: Process batch for payment', () => {});
    it.skip('TODO: Manage pay rates', () => {});
    it.skip('TODO: Export payroll reports', () => {});
  });

  describe('Budget Modeling', () => {
    it.skip('TODO: Display budget dashboard', () => {});
    it.skip('TODO: Budget vs actual comparison chart', () => {});
    it.skip('TODO: Budget breakdown by category', () => {});
    it.skip('TODO: Create budget with line items', () => {});
    it.skip('TODO: Variance analysis report', () => {});
    it.skip('TODO: Over-budget alerts', () => {});
    it.skip('TODO: Budget forecasting', () => {});
  });
});
