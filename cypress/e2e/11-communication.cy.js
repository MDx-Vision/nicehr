describe('Communication Module', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'admin'
  };

  const mockChannels = [
    {
      id: 'ch1',
      name: 'Epic Project Team',
      description: 'Main channel for Epic EHR implementation',
      channelType: 'project',
      projectId: 'p1',
      isPrivate: false,
      quietHoursEnabled: false,
      createdBy: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ch2',
      name: 'Direct: John & Jane',
      description: 'Direct message channel',
      channelType: 'direct',
      projectId: null,
      isPrivate: true,
      quietHoursEnabled: false,
      createdBy: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ch3',
      name: 'Announcements',
      description: 'Company-wide announcements',
      channelType: 'announcement',
      projectId: null,
      isPrivate: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      createdBy: 1,
      createdAt: new Date().toISOString()
    }
  ];

  const mockMessages = [
    {
      id: 'm1',
      channelId: 'ch1',
      senderId: 1,
      content: 'Hello team! Ready for the kickoff meeting?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sender: { id: 1, firstName: 'Test', lastName: 'User' }
    },
    {
      id: 'm2',
      channelId: 'ch1',
      senderId: 2,
      content: 'Yes, looking forward to it!',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      sender: { id: 2, firstName: 'John', lastName: 'Doe' }
    }
  ];

  const mockProjects = [
    { id: 'p1', name: 'Epic EHR Project' },
    { id: 'p2', name: 'Cerner Training' }
  ];

  const mockMembers = [
    { id: 1, channelId: 'ch1', userId: 1, user: { firstName: 'Test', lastName: 'User' } },
    { id: 2, channelId: 'ch1', userId: 2, user: { firstName: 'John', lastName: 'Doe' } }
  ];

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: testUser
    }).as('getUser');

    cy.intercept('GET', '/api/chat/channels*', {
      statusCode: 200,
      body: mockChannels
    }).as('getChannels');

    cy.intercept('GET', '/api/projects', {
      statusCode: 200,
      body: mockProjects
    }).as('getProjects');

    cy.intercept('GET', '/api/chat/channels/*/messages*', {
      statusCode: 200,
      body: mockMessages
    }).as('getMessages');

    cy.intercept('GET', '/api/chat/channels/*/members*', {
      statusCode: 200,
      body: mockMembers
    }).as('getMembers');

    cy.intercept('GET', '/api/chat/summaries*', {
      statusCode: 200,
      body: []
    }).as('getSummaries');

    cy.visit('/chat');
    cy.wait('@getUser');
  });

  describe('Chat Page Layout', () => {
    it('should display chat page title', () => {
      cy.get('[data-testid="text-page-title"]').should('contain', 'Team Chat');
    });

    it('should display connection status badge', () => {
      cy.get('[data-testid="badge-connection-status"]').should('exist');
    });

    it('should display create channel button', () => {
      cy.get('[data-testid="button-create-channel"]').should('be.visible');
    });

    it('should display search channels input', () => {
      cy.get('[data-testid="input-search-channels"]').should('be.visible');
    });

    it('should display type filter', () => {
      cy.get('[data-testid="select-type-filter"]').should('exist');
    });

    it('should display project filter', () => {
      cy.get('[data-testid="select-project-filter"]').should('exist');
    });
  });

  describe('Channel List', () => {
    it('should display channel items', () => {
      cy.wait('@getChannels');
      cy.get('[data-testid^="channel-item-"]').should('have.length.at.least', 1);
    });

    it('should filter channels by search query', () => {
      cy.wait('@getChannels');
      cy.get('[data-testid="input-search-channels"]').type('Epic');
      cy.get('[data-testid^="channel-item-"]').should('have.length.at.least', 1);
    });

    it('should open type filter dropdown', () => {
      cy.get('[data-testid="select-type-filter"]').click();
      cy.get('[role="listbox"]').should('be.visible');
    });

    it('should open project filter dropdown', () => {
      cy.get('[data-testid="select-project-filter"]').click();
      cy.get('[role="listbox"]').should('be.visible');
    });
  });

  describe('Channel Selection', () => {
    beforeEach(() => {
      cy.wait('@getChannels');
    });

    it('should select a channel on click', () => {
      cy.get('[data-testid^="channel-item-"]').first().click();
      cy.get('[data-testid="text-channel-name"]').should('be.visible');
    });

    it('should display channel name when selected', () => {
      cy.get('[data-testid^="channel-item-"]').first().click();
      cy.get('[data-testid="text-channel-name"]').should('exist');
    });

    it('should display channel description when selected', () => {
      cy.get('[data-testid^="channel-item-"]').first().click();
      cy.get('[data-testid="text-channel-description"]').should('exist');
    });

    it('should display member count badge', () => {
      cy.get('[data-testid^="channel-item-"]').first().click();
      cy.get('[data-testid="badge-member-count"]').should('exist');
    });

    it('should display online count badge', () => {
      cy.get('[data-testid^="channel-item-"]').first().click();
      cy.get('[data-testid="badge-online-count"]').should('exist');
    });

    it('should display shift summary button', () => {
      cy.get('[data-testid^="channel-item-"]').first().click();
      cy.get('[data-testid="button-shift-summary"]').should('be.visible');
    });
  });

  describe('Message Display', () => {
    beforeEach(() => {
      cy.wait('@getChannels');
      cy.get('[data-testid^="channel-item-"]').first().click();
    });

    it('should display messages in channel', () => {
      cy.get('[data-testid^="message-item-"]').should('have.length.at.least', 1);
    });

    it('should display sender name on messages', () => {
      cy.get('[data-testid^="text-sender-"]').first().should('exist');
    });

    it('should display message content', () => {
      cy.get('[data-testid^="text-content-"]').first().should('exist');
    });
  });

  describe('Send Message', () => {
    beforeEach(() => {
      cy.wait('@getChannels');
      cy.get('[data-testid^="channel-item-"]').first().click();
    });

    it('should display message input', () => {
      cy.get('[data-testid="input-message"]').should('be.visible');
    });

    it('should display send button', () => {
      cy.get('[data-testid="button-send-message"]').should('exist');
    });

    it('should allow typing a message', () => {
      cy.get('[data-testid="input-message"]').type('Hello everyone!');
      cy.get('[data-testid="input-message"]').should('have.value', 'Hello everyone!');
    });

    it('should send message on button click', () => {
      cy.intercept('POST', '/api/chat/channels/*/messages', {
        statusCode: 201,
        body: { id: 'm3', content: 'Test message', channelId: 'ch1' }
      }).as('sendMessage');

      cy.get('[data-testid="input-message"]').type('Test message');
      cy.get('[data-testid="button-send-message"]').click();
    });
  });

  describe('Create Channel', () => {
    it('should open create channel dialog', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="input-channel-name"]').should('be.visible');
    });

    it('should display channel name input', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="input-channel-name"]').should('exist');
    });

    it('should display channel description input', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="input-channel-description"]').should('exist');
    });

    it('should display channel type selector', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="select-channel-type"]').should('exist');
    });

    it('should display project selector', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="select-project"]').should('exist');
    });

    it('should display private channel switch', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="switch-private"]').should('exist');
    });

    it('should display quiet hours switch', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="switch-quiet-hours"]').should('exist');
    });

    it('should have cancel button', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="button-cancel-create"]').should('exist');
    });

    it('should have create button', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="button-create-channel"]').should('exist');
    });

    it('should close dialog on cancel', () => {
      cy.get('[data-testid="button-create-channel"]').click();
      cy.get('[data-testid="button-cancel-create"]').click();
      cy.get('[data-testid="input-channel-name"]').should('not.exist');
    });

    it('should fill out and submit new channel', () => {
      cy.intercept('POST', '/api/chat/channels', {
        statusCode: 201,
        body: { id: 'ch4', name: 'New Channel', channelType: 'project' }
      }).as('createChannel');

      cy.get('[data-testid="button-create-channel"]').first().click();
      cy.get('[data-testid="input-channel-name"]').type('New Project Channel');
      cy.get('[data-testid="input-channel-description"]').type('A new channel for project discussion');

      // Select channel type
      cy.get('[data-testid="select-channel-type"]').click();
      cy.get('[role="option"]').first().click();

      // Select project
      cy.get('[data-testid="select-project"]').click();
      cy.get('[role="option"]').first().click();

      // Click create button inside dialog (last one)
      cy.get('[data-testid="button-create-channel"]').last().click();
    });
  });

  describe('Shift Summary Dialog', () => {
    beforeEach(() => {
      cy.wait('@getChannels');
      cy.get('[data-testid^="channel-item-"]').first().click();
    });

    it('should open shift summary dialog', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-view-summaries"]').should('be.visible');
    });

    it('should display view summaries tab', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-view-summaries"]').should('exist');
    });

    it('should display create summary tab', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').should('exist');
    });

    it('should switch to create summary tab', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').click();
      cy.get('[data-testid="select-shift-type"]').should('be.visible');
    });

    it('should display shift type selector', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').click();
      cy.get('[data-testid="select-shift-type"]').should('exist');
    });

    it('should display summary content input', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').click();
      cy.get('[data-testid="input-summary-content"]').should('exist');
    });

    it('should display key points input', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').click();
      cy.get('[data-testid="input-key-points"]').should('exist');
    });

    it('should display issues input', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').click();
      cy.get('[data-testid="input-issues"]').should('exist');
    });

    it('should have submit summary button', () => {
      cy.get('[data-testid="button-shift-summary"]').click();
      cy.get('[data-testid="tab-create-summary"]').click();
      cy.get('[data-testid="button-submit-summary"]').should('exist');
    });
  });

  // ===========================================================================
  // Advanced Communication Features
  // ===========================================================================

  describe('Digital Signatures', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'admin' }
      }).as('getUser');

      cy.intercept('GET', '/api/contracts*', {
        statusCode: 200,
        body: [
          {
            id: 'con-1',
            templateId: 'temp-1',
            title: 'Test Contract',
            content: '<p>This is a test contract.</p>',
            consultantId: 'cons-1',
            projectId: 'proj-1',
            status: 'pending_signature',
            effectiveDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            signers: [
              {
                id: 'sign-1',
                contractId: 'con-1',
                userId: 1,
                role: 'consultant',
                signingOrder: 1,
                status: 'pending',
                signedAt: null,
                user: { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' }
              }
            ]
          }
        ]
      }).as('getContracts');

      cy.intercept('GET', '/api/contract-templates*', {
        statusCode: 200,
        body: [{ id: 'temp-1', name: 'Standard NDA', description: 'Non-disclosure agreement' }]
      }).as('getTemplates');

      cy.intercept('GET', '/api/consultants*', {
        statusCode: 200,
        body: [{ id: 'cons-1', firstName: 'John', lastName: 'Doe', userId: 'user-1' }]
      }).as('getConsultants');

      cy.intercept('GET', '/api/projects*', {
        statusCode: 200,
        body: [{ id: 'proj-1', name: 'Test Project' }]
      }).as('getProjects');

      // Mock ESIGN API endpoints
      cy.intercept('POST', '/api/contracts/*/esign/consent', {
        statusCode: 201,
        body: { message: 'Consent recorded', consent: { id: 'consent-1' } }
      }).as('esignConsent');

      cy.intercept('POST', '/api/contracts/*/esign/review-start', {
        statusCode: 201,
        body: { message: 'Review tracking started' }
      }).as('esignReviewStart');

      cy.intercept('PATCH', '/api/contracts/*/esign/review-progress', {
        statusCode: 200,
        body: { message: 'Review progress updated' }
      }).as('esignReviewProgress');

      cy.visit('/contracts');
      cy.wait('@getUser');
    });

    // Helper function to complete ESIGN consent step
    const completeConsentStep = () => {
      cy.get('[data-testid="checkbox-hardware"]').click({ force: true });
      cy.get('[data-testid="checkbox-paper"]').click({ force: true });
      cy.get('[data-testid="checkbox-withdraw"]').click({ force: true });
      cy.get('[data-testid="button-continue-to-review"]').click();
    };

    // Helper function to complete review step
    const completeReviewStep = () => {
      cy.get('[data-testid="review-scroll-area"]').scrollTo('bottom', { ensureScrollable: false });
      cy.wait(300);
      cy.get('[data-testid="button-continue-to-sign"]').click({ force: true });
    };

    it('should display pending signatures tab', () => {
      cy.get('[data-testid="tab-pending-signatures"]').should('exist');
      cy.get('[data-testid="tab-pending-signatures"]').click();
    });

    it('should display pending contracts for signature', () => {
      cy.get('[data-testid="tab-pending-signatures"]').click();
      cy.get('[data-testid^="card-pending-contract-"]').should('exist');
    });

    it('should open signature dialog when clicking sign button', () => {
      cy.get('[data-testid="tab-pending-signatures"]').click();
      cy.get('[data-testid^="button-sign-"]').first().click();
      // New flow starts with consent step
      cy.contains('Electronic Signature Consent').should('be.visible');
      // Complete consent and review to get to signature
      completeConsentStep();
      cy.wait('@esignConsent');
      completeReviewStep();
      cy.get('[data-testid="signature-canvas"]').should('exist');
    });

    it('should display signature canvas for drawing', () => {
      cy.get('[data-testid="tab-pending-signatures"]').click();
      cy.get('[data-testid^="button-sign-"]').first().click();
      // Complete consent and review to get to signature
      completeConsentStep();
      cy.wait('@esignConsent');
      completeReviewStep();
      cy.get('[data-testid="signature-canvas"]').should('be.visible');
      cy.get('[data-testid="button-clear-signature"]').should('be.visible');
    });
  });

  describe('Real-time Features', () => {
    beforeEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.clearSessionStorage();

      cy.intercept('GET', '/api/auth/user', {
        statusCode: 200,
        body: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'admin' }
      }).as('getUser');

      cy.intercept('GET', '/api/chat/channels*', {
        statusCode: 200,
        body: [
          {
            id: 'ch1',
            name: 'Test Channel',
            description: 'Test channel for communication',
            channelType: 'project',
            projectId: 'p1',
            isPrivate: false,
            createdBy: 1,
            createdAt: new Date().toISOString()
          }
        ]
      }).as('getChannels');

      cy.intercept('GET', '/api/projects*', {
        statusCode: 200,
        body: [{ id: 'p1', name: 'Test Project' }]
      }).as('getProjects');

      cy.intercept('GET', '/api/chat/channels/*/messages*', {
        statusCode: 200,
        body: []
      }).as('getMessages');

      cy.intercept('GET', '/api/chat/channels/*/members*', {
        statusCode: 200,
        body: [
          { id: 1, channelId: 'ch1', userId: 1, user: { firstName: 'Test', lastName: 'User' } }
        ]
      }).as('getMembers');

      cy.visit('/chat');
      cy.wait('@getUser');
    });

    it('should display connection status badge', () => {
      // Connection status badge shows Connected or Disconnected
      cy.get('[data-testid="badge-connection-status"]').should('exist');
    });

    it('should have message input for typing', () => {
      // Click on a channel to view messages
      cy.get('[data-testid^="channel-item-"]').first().click();
      // Message input should exist for typing
      cy.get('[data-testid="input-message"]').should('exist');
      // Typing indicator only appears when others are typing via WebSocket
    });

    it('should display online users count', () => {
      // Click on a channel to view details
      cy.get('[data-testid^="channel-item-"]').first().click();
      // Online count badge should be visible
      cy.get('[data-testid="badge-online-count"]').should('exist');
    });
  });
});
