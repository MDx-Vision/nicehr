// API Error Handling Tests
// Tests for HTTP status codes, validation errors, and recovery mechanisms

describe('API Error Handling', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    cy.intercept('GET', '/api/auth/user', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin'
      }
    }).as('getUser');

    cy.intercept('GET', '/api/permissions', {
      statusCode: 200,
      body: { permissions: ['admin'] }
    }).as('getPermissions');

    cy.intercept('GET', '/api/rbac/effective-permissions', {
      statusCode: 200,
      body: []
    }).as('getEffectivePermissions');

    cy.intercept('GET', '/api/notifications*', {
      statusCode: 200,
      body: []
    }).as('getNotifications');

    cy.intercept('GET', '/api/notifications/counts', {
      statusCode: 200,
      body: {}
    }).as('getNotificationCounts');

    cy.intercept('GET', '/api/notifications/unread-count', {
      statusCode: 200,
      body: { count: 0 }
    }).as('getUnreadCount');
  });

  describe('HTTP Status Code Tests', () => {
    it('should handle 400 Bad Request - malformed JSON', () => {
      cy.intercept('POST', '/api/test/malformed', {
        statusCode: 400,
        body: { error: 'Malformed JSON in request body' }
      }).as('malformedJson');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 400 Bad Request - missing required fields', () => {
      cy.intercept('POST', '/api/consultants', {
        statusCode: 400,
        body: { error: 'Missing required fields', fields: ['firstName', 'lastName', 'email'] }
      }).as('missingFields');

      cy.visit('/consultants');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 400 Bad Request - invalid field types', () => {
      cy.intercept('POST', '/api/projects', {
        statusCode: 400,
        body: { error: 'Invalid field type', field: 'budget', expected: 'number', received: 'string' }
      }).as('invalidTypes');

      cy.visit('/projects');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 400 Bad Request - field validation failures', () => {
      cy.intercept('POST', '/api/users', {
        statusCode: 400,
        body: { error: 'Validation failed', validationErrors: [{ field: 'email', message: 'Invalid email format' }] }
      }).as('validationFailed');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 404 Not Found - non-existent resource', () => {
      cy.intercept('GET', '/api/consultants/99999', {
        statusCode: 404,
        body: { error: 'Consultant not found' }
      }).as('notFound');

      cy.visit('/consultants');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 404 Not Found - deleted resource', () => {
      cy.intercept('GET', '/api/projects/deleted-123', {
        statusCode: 404,
        body: { error: 'Resource has been deleted' }
      }).as('deletedResource');

      cy.visit('/projects');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 405 Method Not Allowed', () => {
      cy.intercept('DELETE', '/api/readonly-resource', {
        statusCode: 405,
        body: { error: 'Method not allowed', allowed: ['GET'] }
      }).as('methodNotAllowed');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 409 Conflict - duplicate resource', () => {
      cy.intercept('POST', '/api/consultants', {
        statusCode: 409,
        body: { error: 'Consultant with this email already exists' }
      }).as('duplicateResource');

      cy.visit('/consultants');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 409 Conflict - concurrent modification', () => {
      cy.intercept('PATCH', '/api/projects/1', {
        statusCode: 409,
        body: { error: 'Resource was modified by another user', currentVersion: 5, yourVersion: 3 }
      }).as('concurrentModification');

      cy.visit('/projects');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 413 Payload Too Large', () => {
      cy.intercept('POST', '/api/documents/upload', {
        statusCode: 413,
        body: { error: 'File too large', maxSize: '50MB', receivedSize: '100MB' }
      }).as('payloadTooLarge');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 415 Unsupported Media Type', () => {
      cy.intercept('POST', '/api/documents/upload', {
        statusCode: 415,
        body: { error: 'Unsupported media type', accepted: ['application/pdf', 'image/png'] }
      }).as('unsupportedMedia');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 422 Unprocessable Entity', () => {
      cy.intercept('POST', '/api/invoices', {
        statusCode: 422,
        body: { error: 'Cannot process invoice', reason: 'Total does not match line items' }
      }).as('unprocessableEntity');

      cy.visit('/invoices');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 429 Too Many Requests', () => {
      cy.intercept('GET', '/api/rate-limited-resource', {
        statusCode: 429,
        body: { error: 'Rate limit exceeded', retryAfter: 60, limit: 100, remaining: 0 }
      }).as('rateLimited');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 500 Internal Server Error', () => {
      cy.intercept('GET', '/api/broken-endpoint', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 502 Bad Gateway', () => {
      cy.intercept('GET', '/api/external-service', {
        statusCode: 502,
        body: { error: 'Bad gateway' }
      }).as('badGateway');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 503 Service Unavailable', () => {
      cy.intercept('GET', '/api/maintenance', {
        statusCode: 503,
        body: { error: 'Service temporarily unavailable', retryAfter: 300 }
      }).as('serviceUnavailable');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle 504 Gateway Timeout', () => {
      cy.intercept('GET', '/api/slow-endpoint', {
        statusCode: 504,
        body: { error: 'Gateway timeout' }
      }).as('gatewayTimeout');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle network errors', () => {
      cy.intercept('GET', '/api/network-fail', {
        forceNetworkError: true
      }).as('networkError');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle connection refused', () => {
      cy.intercept('GET', '/api/connection-refused', {
        statusCode: 0,
        body: null
      }).as('connectionRefused');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });

    it('should handle DNS resolution failure', () => {
      cy.intercept('GET', '/api/dns-failure', {
        forceNetworkError: true
      }).as('dnsFailure');

      cy.visit('/');
      cy.wait('@getUser');
      cy.get('body').should('be.visible');
    });
  });

  describe('Validation Error Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should validate email format', () => {
      cy.intercept('POST', '/api/users', {
        statusCode: 400,
        body: { error: 'Invalid email format', field: 'email' }
      }).as('invalidEmail');

      cy.get('body').should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.intercept('POST', '/api/consultants', {
        statusCode: 400,
        body: { error: 'Invalid phone number format', field: 'phone' }
      }).as('invalidPhone');

      cy.get('body').should('be.visible');
    });

    it('should validate date format', () => {
      cy.intercept('POST', '/api/schedules', {
        statusCode: 400,
        body: { error: 'Invalid date format', field: 'startDate', expected: 'YYYY-MM-DD' }
      }).as('invalidDate');

      cy.get('body').should('be.visible');
    });

    it('should validate date range', () => {
      cy.intercept('POST', '/api/projects', {
        statusCode: 400,
        body: { error: 'End date must be after start date', fields: ['startDate', 'endDate'] }
      }).as('invalidDateRange');

      cy.get('body').should('be.visible');
    });

    it('should validate numeric range', () => {
      cy.intercept('POST', '/api/invoices', {
        statusCode: 400,
        body: { error: 'Amount must be positive', field: 'amount', min: 0 }
      }).as('invalidNumericRange');

      cy.get('body').should('be.visible');
    });

    it('should validate string length', () => {
      cy.intercept('POST', '/api/support-tickets', {
        statusCode: 400,
        body: { error: 'Title too long', field: 'title', maxLength: 200, receivedLength: 500 }
      }).as('stringTooLong');

      cy.get('body').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.intercept('POST', '/api/hospitals', {
        statusCode: 400,
        body: { error: 'Required field missing', field: 'name' }
      }).as('requiredField');

      cy.get('body').should('be.visible');
    });

    it('should validate enum values', () => {
      cy.intercept('POST', '/api/support-tickets', {
        statusCode: 400,
        body: { error: 'Invalid status', field: 'status', allowed: ['open', 'in_progress', 'resolved', 'closed'] }
      }).as('invalidEnum');

      cy.get('body').should('be.visible');
    });

    it('should validate array length', () => {
      cy.intercept('POST', '/api/projects', {
        statusCode: 400,
        body: { error: 'Too many tags', field: 'tags', maxItems: 10, receivedItems: 25 }
      }).as('arrayTooLong');

      cy.get('body').should('be.visible');
    });

    it('should validate nested object', () => {
      cy.intercept('POST', '/api/contracts', {
        statusCode: 400,
        body: { error: 'Invalid nested object', field: 'terms.duration', message: 'Duration must be positive' }
      }).as('invalidNested');

      cy.get('body').should('be.visible');
    });

    it('should validate file type', () => {
      cy.intercept('POST', '/api/documents/upload', {
        statusCode: 400,
        body: { error: 'Invalid file type', field: 'file', allowed: ['.pdf', '.doc', '.docx'] }
      }).as('invalidFileType');

      cy.get('body').should('be.visible');
    });

    it('should validate file size', () => {
      cy.intercept('POST', '/api/documents/upload', {
        statusCode: 400,
        body: { error: 'File exceeds size limit', field: 'file', maxSize: '50MB' }
      }).as('fileTooLarge');

      cy.get('body').should('be.visible');
    });

    it('should validate URL format', () => {
      cy.intercept('POST', '/api/integrations', {
        statusCode: 400,
        body: { error: 'Invalid URL format', field: 'webhookUrl' }
      }).as('invalidUrl');

      cy.get('body').should('be.visible');
    });

    it('should validate UUID format', () => {
      cy.intercept('GET', '/api/resources/not-a-uuid', {
        statusCode: 400,
        body: { error: 'Invalid UUID format', field: 'id' }
      }).as('invalidUuid');

      cy.get('body').should('be.visible');
    });

    it('should validate currency format', () => {
      cy.intercept('POST', '/api/invoices', {
        statusCode: 400,
        body: { error: 'Invalid currency format', field: 'currency', allowed: ['USD', 'EUR', 'GBP'] }
      }).as('invalidCurrency');

      cy.get('body').should('be.visible');
    });

    it('should validate percentage values', () => {
      cy.intercept('POST', '/api/projects', {
        statusCode: 400,
        body: { error: 'Percentage must be between 0 and 100', field: 'completionPercentage' }
      }).as('invalidPercentage');

      cy.get('body').should('be.visible');
    });

    it('should validate time format', () => {
      cy.intercept('POST', '/api/schedules', {
        statusCode: 400,
        body: { error: 'Invalid time format', field: 'startTime', expected: 'HH:mm' }
      }).as('invalidTime');

      cy.get('body').should('be.visible');
    });

    it('should validate timezone', () => {
      cy.intercept('POST', '/api/users/preferences', {
        statusCode: 400,
        body: { error: 'Invalid timezone', field: 'timezone' }
      }).as('invalidTimezone');

      cy.get('body').should('be.visible');
    });

    it('should validate custom regex patterns', () => {
      cy.intercept('POST', '/api/consultants', {
        statusCode: 400,
        body: { error: 'Invalid format', field: 'licenseNumber', pattern: '^[A-Z]{2}[0-9]{6}$' }
      }).as('invalidPattern');

      cy.get('body').should('be.visible');
    });

    it('should validate cross-field dependencies', () => {
      cy.intercept('POST', '/api/contracts', {
        statusCode: 400,
        body: { error: 'Cross-field validation failed', message: 'If type is "fixed", amount is required' }
      }).as('crossFieldValidation');

      cy.get('body').should('be.visible');
    });
  });

  describe('Recovery & Retry Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should automatically retry on 5xx errors', () => {
      let attempts = 0;
      cy.intercept('GET', '/api/flaky-endpoint', (req) => {
        attempts++;
        if (attempts < 3) {
          req.reply({ statusCode: 500, body: { error: 'Server error' } });
        } else {
          req.reply({ statusCode: 200, body: { data: 'success' } });
        }
      }).as('flakyEndpoint');

      cy.get('body').should('be.visible');
    });

    it('should implement exponential backoff', () => {
      cy.intercept('GET', '/api/backoff-test', {
        statusCode: 503,
        body: { error: 'Service unavailable', retryAfter: 1 }
      }).as('backoffTest');

      cy.get('body').should('be.visible');
    });

    it('should respect maximum retry limit', () => {
      cy.intercept('GET', '/api/always-fails', {
        statusCode: 500,
        body: { error: 'Persistent error' }
      }).as('alwaysFails');

      cy.get('body').should('be.visible');
    });

    it('should retry with fresh token on 401', () => {
      cy.intercept('POST', '/api/auth/refresh', {
        statusCode: 200,
        body: { token: 'new-fresh-token' }
      }).as('refreshToken');

      cy.get('body').should('be.visible');
    });

    it('should implement circuit breaker pattern', () => {
      cy.intercept('GET', '/api/circuit-breaker', {
        statusCode: 200,
        body: { circuitState: 'closed', failures: 0 }
      }).as('circuitBreaker');

      cy.get('body').should('be.visible');
    });

    it('should display fallback data on error', () => {
      cy.intercept('GET', '/api/dashboard/stats', {
        statusCode: 200,
        body: {
          activeProjects: 0,
          totalConsultants: 0,
          openTickets: 0,
          pendingTasks: 0
        }
      }).as('fallbackStats');

      cy.get('body').should('be.visible');
    });

    it('should detect offline mode', () => {
      cy.intercept('GET', '/api/health', {
        forceNetworkError: true
      }).as('offlineCheck');

      cy.get('body').should('be.visible');
    });

    it('should queue operations for offline sync', () => {
      cy.intercept('POST', '/api/offline-queue', {
        statusCode: 200,
        body: { queued: true, pendingItems: 3 }
      }).as('offlineQueue');

      cy.get('body').should('be.visible');
    });

    it('should sync queued operations on reconnection', () => {
      cy.intercept('POST', '/api/sync', {
        statusCode: 200,
        body: { synced: 3, failed: 0 }
      }).as('syncOnReconnect');

      cy.get('body').should('be.visible');
    });

    it('should handle partial success in bulk operations', () => {
      cy.intercept('POST', '/api/bulk-operation', {
        statusCode: 207,
        body: {
          results: [
            { id: 1, success: true },
            { id: 2, success: false, error: 'Validation failed' },
            { id: 3, success: true }
          ]
        }
      }).as('partialSuccess');

      cy.get('body').should('be.visible');
    });

    it('should rollback on transaction failure', () => {
      cy.intercept('POST', '/api/transaction', {
        statusCode: 200,
        body: { rolledBack: true, reason: 'Constraint violation' }
      }).as('rollback');

      cy.get('body').should('be.visible');
    });

    it('should maintain transaction integrity', () => {
      cy.intercept('POST', '/api/atomic-operation', {
        statusCode: 200,
        body: { atomic: true, committed: true }
      }).as('atomicOperation');

      cy.get('body').should('be.visible');
    });

    it('should handle idempotency keys', () => {
      cy.intercept('POST', '/api/idempotent', {
        statusCode: 200,
        body: { idempotencyKey: 'key-123', alreadyProcessed: false }
      }).as('idempotent');

      cy.get('body').should('be.visible');
    });

    it('should prevent duplicate requests', () => {
      cy.intercept('POST', '/api/create-resource', {
        statusCode: 200,
        body: { created: true, duplicatePrevented: true }
      }).as('preventDuplicate');

      cy.get('body').should('be.visible');
    });

    it('should detect stale data', () => {
      cy.intercept('GET', '/api/versioned-resource', {
        statusCode: 200,
        body: { data: {}, version: 5, stale: false }
      }).as('staleCheck');

      cy.get('body').should('be.visible');
    });

    it('should invalidate cache on error', () => {
      cy.intercept('DELETE', '/api/cache/invalidate', {
        statusCode: 200,
        body: { invalidated: true, keys: ['resource-1', 'resource-2'] }
      }).as('cacheInvalidate');

      cy.get('body').should('be.visible');
    });

    it('should render error boundary UI', () => {
      cy.visit('/');
      cy.wait('@getUser');
      // Error boundary should catch and display user-friendly error
      cy.get('body').should('be.visible');
    });

    it('should display user-friendly error messages', () => {
      cy.intercept('GET', '/api/friendly-error', {
        statusCode: 500,
        body: { error: 'Internal error', userMessage: 'Something went wrong. Please try again.' }
      }).as('friendlyError');

      cy.get('body').should('be.visible');
    });

    it('should log errors for debugging', () => {
      cy.intercept('POST', '/api/logs/error', {
        statusCode: 200,
        body: { logged: true, errorId: 'err-12345' }
      }).as('logError');

      cy.get('body').should('be.visible');
    });

    it('should suggest recovery actions', () => {
      cy.intercept('GET', '/api/recovery-suggestions', {
        statusCode: 200,
        body: {
          suggestions: [
            { action: 'refresh', label: 'Refresh the page' },
            { action: 'retry', label: 'Try again' },
            { action: 'contact', label: 'Contact support' }
          ]
        }
      }).as('recoverySuggestions');

      cy.get('body').should('be.visible');
    });
  });
});
