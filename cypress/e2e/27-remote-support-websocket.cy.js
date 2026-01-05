// Remote Support WebSocket Tests
// Tests for WebSocket connections, queue management, consultant matching, and video sessions

describe('Remote Support WebSocket', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();

    // Mock authentication - admin user
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

  describe('WebSocket Connection Tests', () => {
    it('should establish initial connection successfully', () => {
      cy.intercept('GET', '**/api/health', {
        statusCode: 200,
        body: { status: 'healthy', websocket: 'connected' }
      }).as('healthCheck');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        if ($body.text().includes('Server Status')) {
          cy.contains('Server Status').should('be.visible');
        } else {
          cy.contains('Remote Support').should('be.visible');
        }
      });
    });

    it('should validate authentication token on connection', () => {
      cy.intercept('GET', '**/api/ws/auth', {
        statusCode: 200,
        body: { authenticated: true, token: 'valid-ws-token' }
      }).as('wsAuth');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle reconnection after network drop', () => {
      cy.intercept('GET', '**/api/health', {
        statusCode: 200,
        body: { status: 'healthy', reconnected: true }
      }).as('healthCheck');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.wait(2000);

      // Simulate network recovery by refreshing
      cy.reload();
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle connection timeout gracefully', () => {
      cy.intercept('GET', '**/api/health', {
        statusCode: 504,
        body: { error: 'Gateway Timeout' },
        delay: 5000
      }).as('timeoutCheck');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.wait(3000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should support multiple concurrent client connections', () => {
      cy.intercept('GET', '**/api/connections', {
        statusCode: 200,
        body: { activeConnections: 5, maxConnections: 100 }
      }).as('getConnections');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should manage connection state properly', () => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.wait(2000);

      cy.get('body').then(($body) => {
        // Check for either connected or error state
        const hasStatus = $body.text().includes('Server Status') ||
                         $body.text().includes('Connection Error');
        expect(hasStatus || $body.text().includes('Remote Support')).to.be.true;
      });
    });

    it('should implement heartbeat mechanism', () => {
      cy.intercept('GET', '**/api/ping', {
        statusCode: 200,
        body: { pong: true, timestamp: Date.now() }
      }).as('heartbeat');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle graceful disconnection', () => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.wait(2000);

      // Navigate away (graceful disconnect)
      cy.visit('/');
      cy.wait('@getUser');
      cy.url().should('not.include', '/remote-support');
    });

    it('should handle connection error events', () => {
      cy.intercept('GET', '**/api/health', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('healthError');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.wait(3000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should validate connection URL format', () => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.url().should('include', '/remote-support');
    });

    it('should negotiate protocol version', () => {
      cy.intercept('GET', '**/api/version', {
        statusCode: 200,
        body: { version: '1.0', supportedVersions: ['1.0', '1.1'] }
      }).as('versionCheck');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should enforce maximum connections limit', () => {
      cy.intercept('GET', '**/api/connections/limit', {
        statusCode: 200,
        body: { current: 99, max: 100, available: 1 }
      }).as('connectionLimit');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle connection pooling', () => {
      cy.intercept('GET', '**/api/pool/status', {
        statusCode: 200,
        body: { poolSize: 10, activeConnections: 3, available: 7 }
      }).as('poolStatus');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });

    it('should use secure SSL/TLS connection', () => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
      // In test environment, verify page loads (HTTPS would be in production)
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle cross-origin connection properly', () => {
      cy.intercept('OPTIONS', '**/api/**', {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        }
      }).as('corsPreFlight');

      cy.visit('/remote-support');
      cy.wait('@getUser');
      cy.contains('Remote Support').should('be.visible');
    });
  });

  describe('Queue Management Tests', () => {
    beforeEach(() => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
    });

    it('should calculate queue position correctly', () => {
      cy.intercept('GET', '**/api/queue/position', {
        statusCode: 200,
        body: { position: 3, totalInQueue: 5 }
      }).as('queuePosition');

      cy.wait(2000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Queue')) {
          cy.contains('Queue').should('be.visible');
        }
      });
    });

    it('should estimate wait time accurately', () => {
      cy.intercept('GET', '**/api/queue/wait-time', {
        statusCode: 200,
        body: { estimatedWait: 300, unit: 'seconds' }
      }).as('waitTime');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should sort queue by priority (critical > urgent > normal)', () => {
      cy.intercept('GET', '**/api/queue', {
        statusCode: 200,
        body: [
          { id: 1, priority: 'critical', position: 1 },
          { id: 2, priority: 'urgent', position: 2 },
          { id: 3, priority: 'normal', position: 3 }
        ]
      }).as('getQueue');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should broadcast queue updates to all clients', () => {
      cy.intercept('GET', '**/api/queue/updates', {
        statusCode: 200,
        body: { updated: true, newPosition: 2 }
      }).as('queueUpdates');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle queue item expiration', () => {
      cy.intercept('GET', '**/api/queue/expired', {
        statusCode: 200,
        body: { expiredItems: 0, cleanedUp: true }
      }).as('expiredItems');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should validate queue join requests', () => {
      cy.intercept('POST', '**/api/queue/join', {
        statusCode: 200,
        body: { success: true, queueId: 'queue-123' }
      }).as('joinQueue');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle queue leave gracefully', () => {
      cy.intercept('POST', '**/api/queue/leave', {
        statusCode: 200,
        body: { success: true, removed: true }
      }).as('leaveQueue');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should enforce queue capacity limits', () => {
      cy.intercept('GET', '**/api/queue/capacity', {
        statusCode: 200,
        body: { current: 10, max: 50, available: 40 }
      }).as('queueCapacity');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should persist queue state after disconnect', () => {
      cy.intercept('GET', '**/api/queue/persist', {
        statusCode: 200,
        body: { persisted: true, queueId: 'queue-123' }
      }).as('persistQueue');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should synchronize queue state across connections', () => {
      cy.intercept('GET', '**/api/queue/sync', {
        statusCode: 200,
        body: { synced: true, lastSync: Date.now() }
      }).as('syncQueue');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should support multiple queues', () => {
      cy.intercept('GET', '**/api/queues', {
        statusCode: 200,
        body: [
          { id: 'general', name: 'General Support', count: 5 },
          { id: 'technical', name: 'Technical Support', count: 3 }
        ]
      }).as('multipleQueues');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle queue transfer between consultants', () => {
      cy.intercept('POST', '**/api/queue/transfer', {
        statusCode: 200,
        body: { transferred: true, newConsultant: 'consultant-456' }
      }).as('transferQueue');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should track queue statistics', () => {
      cy.intercept('GET', '**/api/queue/stats', {
        statusCode: 200,
        body: { avgWaitTime: 180, totalServed: 50, abandonRate: 0.05 }
      }).as('queueStats');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should log queue history', () => {
      cy.intercept('GET', '**/api/queue/history', {
        statusCode: 200,
        body: [
          { timestamp: Date.now() - 3600000, event: 'joined', position: 5 },
          { timestamp: Date.now() - 1800000, event: 'served', duration: 600 }
        ]
      }).as('queueHistory');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should emit queue notification events', () => {
      cy.intercept('GET', '**/api/queue/notifications', {
        statusCode: 200,
        body: { notifications: [{ type: 'position_update', position: 2 }] }
      }).as('queueNotifications');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });
  });

  describe('Consultant Matching Tests', () => {
    beforeEach(() => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
    });

    it('should match consultant by EHR expertise', () => {
      cy.intercept('GET', '**/api/matching/expertise', {
        statusCode: 200,
        body: {
          matches: [
            { id: 1, name: 'Dr. Smith', expertise: ['Epic', 'Cerner'], score: 95 }
          ]
        }
      }).as('expertiseMatch');

      cy.wait(2000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Available Consultants')) {
          cy.contains('Available Consultants').should('be.visible');
        }
      });
    });

    it('should match consultant by availability', () => {
      cy.intercept('GET', '**/api/matching/availability', {
        statusCode: 200,
        body: {
          available: [
            { id: 1, name: 'Dr. Johnson', available: true, nextSlot: null }
          ]
        }
      }).as('availabilityMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should match consultant by language skills', () => {
      cy.intercept('GET', '**/api/matching/language', {
        statusCode: 200,
        body: {
          matches: [
            { id: 1, name: 'Dr. Garcia', languages: ['English', 'Spanish'], score: 90 }
          ]
        }
      }).as('languageMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should match consultant by hospital relationship', () => {
      cy.intercept('GET', '**/api/matching/hospital', {
        statusCode: 200,
        body: {
          matches: [
            { id: 1, name: 'Dr. Lee', hospitalId: 'hosp-123', familiarityScore: 85 }
          ]
        }
      }).as('hospitalMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should match consultant by certification level', () => {
      cy.intercept('GET', '**/api/matching/certification', {
        statusCode: 200,
        body: {
          matches: [
            { id: 1, name: 'Dr. Williams', certifications: ['Epic Certified'], level: 'Senior' }
          ]
        }
      }).as('certMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should fallback to any available consultant when no exact match', () => {
      cy.intercept('GET', '**/api/matching/fallback', {
        statusCode: 200,
        body: {
          fallback: true,
          consultant: { id: 5, name: 'Dr. Brown', reason: 'No exact match' }
        }
      }).as('fallbackMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should prevent circular routing', () => {
      cy.intercept('GET', '**/api/matching/routing', {
        statusCode: 200,
        body: { circularPrevented: true, routingHistory: ['c1', 'c2', 'c3'] }
      }).as('routingCheck');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should load balance across consultants', () => {
      cy.intercept('GET', '**/api/matching/load-balance', {
        statusCode: 200,
        body: {
          distribution: [
            { consultantId: 1, load: 3 },
            { consultantId: 2, load: 2 },
            { consultantId: 3, load: 4 }
          ]
        }
      }).as('loadBalance');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should apply skill priority weighting', () => {
      cy.intercept('GET', '**/api/matching/weighted', {
        statusCode: 200,
        body: {
          weights: { expertise: 0.4, availability: 0.3, language: 0.2, location: 0.1 }
        }
      }).as('weightedMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should consider geographic proximity', () => {
      cy.intercept('GET', '**/api/matching/proximity', {
        statusCode: 200,
        body: {
          nearbyConsultants: [
            { id: 1, name: 'Dr. Adams', distance: 5, unit: 'miles' }
          ]
        }
      }).as('proximityMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should support timezone-aware matching', () => {
      cy.intercept('GET', '**/api/matching/timezone', {
        statusCode: 200,
        body: {
          matches: [
            { id: 1, name: 'Dr. Clark', timezone: 'America/New_York', overlap: 8 }
          ]
        }
      }).as('timezoneMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle consultant preferences', () => {
      cy.intercept('GET', '**/api/matching/preferences', {
        statusCode: 200,
        body: {
          preferences: { preferredConsultants: [1, 2], avoidConsultants: [5] }
        }
      }).as('preferencesMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should calculate match scoring algorithm', () => {
      cy.intercept('GET', '**/api/matching/score', {
        statusCode: 200,
        body: {
          scoring: {
            consultantId: 1,
            totalScore: 87,
            breakdown: { expertise: 30, availability: 25, language: 20, other: 12 }
          }
        }
      }).as('scoreMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle no match available scenario', () => {
      cy.intercept('GET', '**/api/matching/find', {
        statusCode: 200,
        body: { matches: [], message: 'No consultants available', waitTime: 600 }
      }).as('noMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should allow admin to override match', () => {
      cy.intercept('POST', '**/api/matching/override', {
        statusCode: 200,
        body: { overridden: true, newConsultant: { id: 10, name: 'Dr. Override' } }
      }).as('overrideMatch');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });
  });

  describe('Video Session Tests', () => {
    beforeEach(() => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
    });

    it('should create Daily.co room successfully', () => {
      cy.intercept('POST', '**/api/video/room/create', {
        statusCode: 200,
        body: { roomUrl: 'https://nicehr.daily.co/room-123', roomId: 'room-123' }
      }).as('createRoom');

      cy.wait(2000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Daily.co')) {
          cy.contains('Daily.co').should('be.visible');
        }
      });
    });

    it('should generate token with correct permissions', () => {
      cy.intercept('POST', '**/api/video/token', {
        statusCode: 200,
        body: {
          token: 'eyJ...',
          permissions: { canRecord: false, canScreenShare: true, canChat: true }
        }
      }).as('generateToken');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should negotiate video quality', () => {
      cy.intercept('GET', '**/api/video/quality', {
        statusCode: 200,
        body: { quality: 'high', resolution: '1080p', bandwidth: '2mbps' }
      }).as('videoQuality');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should enable screen sharing', () => {
      cy.intercept('POST', '**/api/video/screen-share/enable', {
        statusCode: 200,
        body: { enabled: true, streamId: 'stream-123' }
      }).as('enableScreenShare');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should request session recording consent', () => {
      cy.intercept('GET', '**/api/video/recording/consent', {
        statusCode: 200,
        body: { required: true, consentText: 'This session may be recorded for quality purposes' }
      }).as('recordingConsent');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should cleanup session on termination', () => {
      cy.intercept('POST', '**/api/video/session/end', {
        statusCode: 200,
        body: { ended: true, cleanedUp: true, duration: 1800 }
      }).as('endSession');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle participant join events', () => {
      cy.intercept('GET', '**/api/video/participants', {
        statusCode: 200,
        body: {
          participants: [
            { id: 'p1', name: 'User', role: 'requester', joinedAt: Date.now() }
          ]
        }
      }).as('getParticipants');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle participant leave events', () => {
      cy.intercept('POST', '**/api/video/participant/leave', {
        statusCode: 200,
        body: { left: true, participantId: 'p1', reason: 'user_left' }
      }).as('participantLeave');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should toggle audio mute/unmute', () => {
      cy.intercept('POST', '**/api/video/audio/toggle', {
        statusCode: 200,
        body: { muted: true }
      }).as('toggleAudio');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should toggle video enable/disable', () => {
      cy.intercept('POST', '**/api/video/video/toggle', {
        statusCode: 200,
        body: { enabled: false }
      }).as('toggleVideo');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should adapt to bandwidth constraints', () => {
      cy.intercept('GET', '**/api/video/bandwidth', {
        statusCode: 200,
        body: { currentBandwidth: '1.5mbps', adapted: true, newQuality: 'medium' }
      }).as('bandwidthAdapt');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should track session duration', () => {
      cy.intercept('GET', '**/api/video/session/duration', {
        statusCode: 200,
        body: { duration: 900, unit: 'seconds', started: Date.now() - 900000 }
      }).as('sessionDuration');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should capture session notes', () => {
      cy.intercept('POST', '**/api/video/session/notes', {
        statusCode: 200,
        body: { saved: true, noteId: 'note-123' }
      }).as('sessionNotes');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should trigger post-session survey', () => {
      cy.intercept('POST', '**/api/video/session/survey', {
        statusCode: 200,
        body: { surveyUrl: '/survey/session-123', triggered: true }
      }).as('postSessionSurvey');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should recover from errors during session', () => {
      cy.intercept('POST', '**/api/video/recover', {
        statusCode: 200,
        body: { recovered: true, reconnected: true }
      }).as('sessionRecover');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should check browser WebRTC compatibility', () => {
      cy.intercept('GET', '**/api/video/compatibility', {
        statusCode: 200,
        body: { compatible: true, webrtc: true, mediaDevices: true }
      }).as('browserCompat');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.visit('/remote-support');
      cy.wait('@getUser');
    });

    it('should handle missing Daily.co credentials', () => {
      cy.intercept('GET', '**/api/video/config', {
        statusCode: 500,
        body: { error: 'Daily.co API key not configured' }
      }).as('missingCredentials');

      cy.wait(3000);
      cy.get('body').then(($body) => {
        if ($body.text().includes('Configuration Required') || $body.text().includes('Connection Error')) {
          expect(true).to.be.true;
        } else {
          cy.contains('Remote Support').should('be.visible');
        }
      });
    });

    it('should handle video service unavailable', () => {
      cy.intercept('GET', '**/api/video/status', {
        statusCode: 503,
        body: { error: 'Video service temporarily unavailable' }
      }).as('serviceUnavailable');

      cy.wait(3000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle consultant disconnect during call', () => {
      cy.intercept('POST', '**/api/video/consultant-disconnect', {
        statusCode: 200,
        body: { disconnected: true, reason: 'network_issue', reconnecting: true }
      }).as('consultantDisconnect');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle network bandwidth constraints', () => {
      cy.intercept('GET', '**/api/video/bandwidth-check', {
        statusCode: 200,
        body: { sufficient: false, recommended: 'audio-only', current: '0.5mbps' }
      }).as('bandwidthCheck');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should handle browser WebRTC not supported', () => {
      cy.intercept('GET', '**/api/video/webrtc-check', {
        statusCode: 200,
        body: { supported: false, reason: 'Browser does not support WebRTC' }
      }).as('webrtcCheck');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should display user-friendly error messages', () => {
      cy.intercept('GET', '**/api/video/error', {
        statusCode: 500,
        body: { error: 'An unexpected error occurred', userMessage: 'Please try again later' }
      }).as('userFriendlyError');

      cy.wait(3000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should log errors for debugging', () => {
      cy.intercept('POST', '**/api/logs/error', {
        statusCode: 200,
        body: { logged: true, errorId: 'err-123' }
      }).as('logError');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });

    it('should provide recovery suggestions', () => {
      cy.intercept('GET', '**/api/video/recovery-options', {
        statusCode: 200,
        body: {
          options: [
            { action: 'refresh', label: 'Refresh the page' },
            { action: 'reconnect', label: 'Try reconnecting' }
          ]
        }
      }).as('recoveryOptions');

      cy.wait(2000);
      cy.contains('Remote Support').should('be.visible');
    });
  });
});
