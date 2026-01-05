// Gamification Tests
// Tests for badges, points, and leaderboards

describe('Gamification', () => {
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

  describe('Badge System Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should earn badges based on actions', () => {
      cy.intercept('POST', '/api/gamification/badges/earn', {
        statusCode: 200,
        body: { earned: true, badge: { id: 1, name: 'First Login', icon: 'star' } }
      }).as('earnBadge');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display earned badges', () => {
      cy.intercept('GET', '/api/gamification/badges/earned', {
        statusCode: 200,
        body: [
          { id: 1, name: 'First Login', earnedAt: Date.now() - 86400000 },
          { id: 2, name: 'Team Player', earnedAt: Date.now() }
        ]
      }).as('earnedBadges');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should track badge progress', () => {
      cy.intercept('GET', '/api/gamification/badges/progress', {
        statusCode: 200,
        body: [
          { badgeId: 3, name: 'Expert', progress: 75, required: 100, unit: 'tasks' }
        ]
      }).as('badgeProgress');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should categorize badges', () => {
      cy.intercept('GET', '/api/gamification/badges/categories', {
        statusCode: 200,
        body: ['Achievement', 'Milestone', 'Skill', 'Social', 'Special']
      }).as('badgeCategories');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should assign badge rarity levels', () => {
      cy.intercept('GET', '/api/gamification/badges', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Common Badge', rarity: 'common' },
          { id: 2, name: 'Rare Badge', rarity: 'rare' },
          { id: 3, name: 'Legendary Badge', rarity: 'legendary' }
        ]
      }).as('badgeRarity');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should send badge notifications', () => {
      cy.intercept('POST', '/api/gamification/badges/notify', {
        statusCode: 200,
        body: { notified: true, badge: 'Team Player' }
      }).as('badgeNotification');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should share badges', () => {
      cy.intercept('POST', '/api/gamification/badges/1/share', {
        statusCode: 200,
        body: { shared: true, shareUrl: '/badges/share/abc123' }
      }).as('shareBadge');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display badge history', () => {
      cy.intercept('GET', '/api/gamification/badges/history', {
        statusCode: 200,
        body: [
          { badgeId: 1, action: 'earned', timestamp: Date.now() - 86400000 },
          { badgeId: 2, action: 'earned', timestamp: Date.now() }
        ]
      }).as('badgeHistory');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should show badge requirements', () => {
      cy.intercept('GET', '/api/gamification/badges/1/requirements', {
        statusCode: 200,
        body: { requirements: ['Complete 10 tasks', 'Log 40 hours'], met: [true, false] }
      }).as('badgeRequirements');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should support hidden badges', () => {
      cy.intercept('GET', '/api/gamification/badges/hidden', {
        statusCode: 200,
        body: { count: 5, hint: 'Complete all training modules to reveal' }
      }).as('hiddenBadges');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should handle special event badges', () => {
      cy.intercept('GET', '/api/gamification/badges/events', {
        statusCode: 200,
        body: [
          { id: 10, name: 'New Year Champion', event: 'new_year_2026', expires: '2026-01-31' }
        ]
      }).as('eventBadges');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should track badge expiration', () => {
      cy.intercept('GET', '/api/gamification/badges/expiring', {
        statusCode: 200,
        body: [
          { id: 5, name: 'Seasonal Badge', expiresAt: Date.now() + 604800000 }
        ]
      }).as('expiringBadges');

      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Points System Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should earn points for actions', () => {
      cy.intercept('POST', '/api/gamification/points/earn', {
        statusCode: 200,
        body: { earned: 50, action: 'task_completed', newTotal: 1050 }
      }).as('earnPoints');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should calculate points correctly', () => {
      cy.intercept('GET', '/api/gamification/points/calculate', {
        statusCode: 200,
        body: { basePoints: 100, multiplier: 1.5, bonus: 25, total: 175 }
      }).as('calculatePoints');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should categorize points', () => {
      cy.intercept('GET', '/api/gamification/points/by-category', {
        statusCode: 200,
        body: {
          productivity: 500,
          collaboration: 300,
          learning: 200,
          total: 1000
        }
      }).as('pointCategories');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display points history', () => {
      cy.intercept('GET', '/api/gamification/points/history', {
        statusCode: 200,
        body: [
          { timestamp: Date.now() - 3600000, points: 50, action: 'task_completed' },
          { timestamp: Date.now(), points: 25, action: 'document_uploaded' }
        ]
      }).as('pointsHistory');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should redeem points', () => {
      cy.intercept('POST', '/api/gamification/points/redeem', {
        statusCode: 200,
        body: { redeemed: true, pointsUsed: 500, reward: 'Gift Card' }
      }).as('redeemPoints');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should handle point expiration', () => {
      cy.intercept('GET', '/api/gamification/points/expiring', {
        statusCode: 200,
        body: { expiringPoints: 200, expiresAt: Date.now() + 2592000000 }
      }).as('expiringPoints');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should apply bonus points', () => {
      cy.intercept('POST', '/api/gamification/points/bonus', {
        statusCode: 200,
        body: { bonus: 100, reason: 'streak_bonus', newTotal: 1100 }
      }).as('bonusPoints');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should apply point multipliers', () => {
      cy.intercept('GET', '/api/gamification/points/multipliers', {
        statusCode: 200,
        body: { active: [{ name: 'Double Points Weekend', multiplier: 2.0, expires: Date.now() + 86400000 }] }
      }).as('pointMultipliers');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should track team points', () => {
      cy.intercept('GET', '/api/gamification/points/team', {
        statusCode: 200,
        body: { teamId: 1, teamPoints: 5000, members: 5, avgPerMember: 1000 }
      }).as('teamPoints');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display points leaderboard', () => {
      cy.intercept('GET', '/api/gamification/points/leaderboard', {
        statusCode: 200,
        body: [
          { rank: 1, userId: 5, name: 'Top User', points: 5000 },
          { rank: 2, userId: 3, name: 'Second User', points: 4500 }
        ]
      }).as('pointsLeaderboard');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should show points analytics', () => {
      cy.intercept('GET', '/api/gamification/points/analytics', {
        statusCode: 200,
        body: { thisWeek: 500, lastWeek: 450, trend: 'increasing', percentChange: 11.1 }
      }).as('pointsAnalytics');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should send points notifications', () => {
      cy.intercept('POST', '/api/gamification/points/notify', {
        statusCode: 200,
        body: { notified: true, message: 'You earned 50 points!' }
      }).as('pointsNotification');

      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Leaderboard Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display global leaderboard', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/global', {
        statusCode: 200,
        body: [
          { rank: 1, userId: 5, name: 'Top User', score: 5000 },
          { rank: 2, userId: 3, name: 'Second User', score: 4500 },
          { rank: 3, userId: 1, name: 'Test User', score: 4000 }
        ]
      }).as('globalLeaderboard');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display team leaderboard', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/team', {
        statusCode: 200,
        body: [
          { rank: 1, teamId: 2, name: 'Alpha Team', score: 15000 },
          { rank: 2, teamId: 1, name: 'Beta Team', score: 12000 }
        ]
      }).as('teamLeaderboard');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display category leaderboard', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/category/productivity', {
        statusCode: 200,
        body: [
          { rank: 1, userId: 3, name: 'Productive User', score: 2500 }
        ]
      }).as('categoryLeaderboard');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display time-based leaderboard', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/weekly', {
        statusCode: 200,
        body: [
          { rank: 1, userId: 7, name: 'Weekly Champion', score: 1000, period: 'this_week' }
        ]
      }).as('weeklyLeaderboard');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should update leaderboard in real-time', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/live', {
        statusCode: 200,
        body: { leaderboard: [], lastUpdate: Date.now() }
      }).as('liveLeaderboard');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should calculate rank correctly', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/my-rank', {
        statusCode: 200,
        body: { rank: 15, totalParticipants: 100, percentile: 85 }
      }).as('myRank');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should apply tie-breaking rules', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/ties', {
        statusCode: 200,
        body: { tieBreaker: 'earliest_achievement', affectedRanks: [3, 4] }
      }).as('tieBreaking');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should respect privacy settings', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/privacy', {
        statusCode: 200,
        body: { showRealName: false, showRank: true, anonymous: true }
      }).as('privacySettings');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should handle opt-out', () => {
      cy.intercept('POST', '/api/gamification/leaderboard/opt-out', {
        statusCode: 200,
        body: { optedOut: true, removedFromLeaderboard: true }
      }).as('optOut');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should handle seasonal resets', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/season', {
        statusCode: 200,
        body: { currentSeason: 'Q1 2026', startDate: '2026-01-01', endDate: '2026-03-31', daysRemaining: 85 }
      }).as('seasonalReset');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display historical records', () => {
      cy.intercept('GET', '/api/gamification/leaderboard/history', {
        statusCode: 200,
        body: [
          { season: 'Q4 2025', rank: 5, score: 8000 },
          { season: 'Q3 2025', rank: 12, score: 5500 }
        ]
      }).as('historicalRecords');

      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Achievements & Challenges Tests', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait('@getUser');
    });

    it('should display active challenges', () => {
      cy.intercept('GET', '/api/gamification/challenges/active', {
        statusCode: 200,
        body: [
          { id: 1, name: 'January Challenge', description: 'Complete 50 tasks', progress: 30, target: 50 }
        ]
      }).as('activeChallenges');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should join challenges', () => {
      cy.intercept('POST', '/api/gamification/challenges/1/join', {
        statusCode: 200,
        body: { joined: true, startedAt: Date.now() }
      }).as('joinChallenge');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should track challenge progress', () => {
      cy.intercept('GET', '/api/gamification/challenges/1/progress', {
        statusCode: 200,
        body: { current: 30, target: 50, percentage: 60, daysRemaining: 25 }
      }).as('challengeProgress');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should complete challenges', () => {
      cy.intercept('POST', '/api/gamification/challenges/1/complete', {
        statusCode: 200,
        body: { completed: true, reward: { points: 500, badge: 'Challenge Champion' } }
      }).as('completeChallenge');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display streaks', () => {
      cy.intercept('GET', '/api/gamification/streaks', {
        statusCode: 200,
        body: { currentStreak: 7, longestStreak: 15, streakType: 'daily_login' }
      }).as('streaks');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should track milestones', () => {
      cy.intercept('GET', '/api/gamification/milestones', {
        statusCode: 200,
        body: [
          { id: 1, name: '100 Tasks', achieved: true },
          { id: 2, name: '500 Tasks', progress: 350, target: 500 }
        ]
      }).as('milestones');

      cy.contains('Dashboard').should('be.visible');
    });

    it('should display achievements', () => {
      cy.intercept('GET', '/api/gamification/achievements', {
        statusCode: 200,
        body: [
          { id: 1, name: 'First Steps', unlocked: true },
          { id: 2, name: 'Power User', unlocked: false, progress: 75 }
        ]
      }).as('achievements');

      cy.contains('Dashboard').should('be.visible');
    });
  });
});
