/**
 * Unit Tests for TDR Readiness Score Calculator
 *
 * Tests the 5-domain weighted scoring algorithm for go-live readiness.
 */

import { describe, test, expect } from '@jest/globals';
import {
  calculatePercentage,
  calculateDomainScores,
  calculateOverallScore,
  determineRecommendation,
  calculateTdrReadiness,
  DOMAIN_WEIGHTS,
  THRESHOLDS,
  TdrMetrics,
  TdrDomainScores,
} from './tdrReadiness';

describe('TDR Readiness Calculator', () => {
  describe('calculatePercentage', () => {
    test('should return 100 when all items complete', () => {
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    test('should return 0 when no items complete', () => {
      expect(calculatePercentage(0, 10)).toBe(0);
    });

    test('should return 0 when total is 0 (avoid division by zero)', () => {
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    test('should return correct percentage', () => {
      expect(calculatePercentage(7, 10)).toBe(70);
      expect(calculatePercentage(1, 4)).toBe(25);
      expect(calculatePercentage(3, 4)).toBe(75);
    });

    test('should round to nearest integer', () => {
      expect(calculatePercentage(1, 3)).toBe(33); // 33.33... rounds to 33
      expect(calculatePercentage(2, 3)).toBe(67); // 66.66... rounds to 67
    });
  });

  describe('calculateDomainScores', () => {
    test('should calculate all domain scores correctly', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 8,
        checklistTotal: 10,
        integrationsPassed: 9,
        integrationsTotal: 10,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
        trainingCompletionPercent: 85,
        supportChecklistComplete: 7,
        supportChecklistTotal: 10,
        processChecklistComplete: 9,
        processChecklistTotal: 10,
      };

      const scores = calculateDomainScores(metrics);

      expect(scores.technicalScore).toBe(90);  // 9/10
      expect(scores.dataScore).toBe(80);       // 8/10
      expect(scores.staffScore).toBe(85);      // from trainingCompletionPercent
      expect(scores.supportScore).toBe(70);    // 7/10
      expect(scores.processScore).toBe(90);    // 9/10
    });

    test('should use default staff score when not provided', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 10,
        checklistTotal: 10,
        integrationsPassed: 10,
        integrationsTotal: 10,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
      };

      const scores = calculateDomainScores(metrics);
      expect(scores.staffScore).toBe(80); // Default
    });

    test('should handle zero totals', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 0,
        checklistTotal: 0,
        integrationsPassed: 0,
        integrationsTotal: 0,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
      };

      const scores = calculateDomainScores(metrics);
      expect(scores.technicalScore).toBe(0);
      expect(scores.dataScore).toBe(0);
    });
  });

  describe('calculateOverallScore', () => {
    test('should calculate correct weighted average', () => {
      const scores: TdrDomainScores = {
        technicalScore: 100,
        dataScore: 100,
        staffScore: 100,
        supportScore: 100,
        processScore: 100,
      };

      expect(calculateOverallScore(scores)).toBe(100);
    });

    test('should apply correct weights', () => {
      // Verify weights sum to 100%
      const totalWeight =
        DOMAIN_WEIGHTS.technical +
        DOMAIN_WEIGHTS.dataMigration +
        DOMAIN_WEIGHTS.staffTraining +
        DOMAIN_WEIGHTS.support +
        DOMAIN_WEIGHTS.process;
      expect(totalWeight).toBe(1);

      // All zeros = 0
      const zeroScores: TdrDomainScores = {
        technicalScore: 0,
        dataScore: 0,
        staffScore: 0,
        supportScore: 0,
        processScore: 0,
      };
      expect(calculateOverallScore(zeroScores)).toBe(0);
    });

    test('should weight technical score at 30%', () => {
      const scores: TdrDomainScores = {
        technicalScore: 100,
        dataScore: 0,
        staffScore: 0,
        supportScore: 0,
        processScore: 0,
      };
      expect(calculateOverallScore(scores)).toBe(30);
    });

    test('should weight data migration score at 20%', () => {
      const scores: TdrDomainScores = {
        technicalScore: 0,
        dataScore: 100,
        staffScore: 0,
        supportScore: 0,
        processScore: 0,
      };
      expect(calculateOverallScore(scores)).toBe(20);
    });

    test('should weight staff training score at 25%', () => {
      const scores: TdrDomainScores = {
        technicalScore: 0,
        dataScore: 0,
        staffScore: 100,
        supportScore: 0,
        processScore: 0,
      };
      expect(calculateOverallScore(scores)).toBe(25);
    });

    test('should calculate realistic scenario', () => {
      const scores: TdrDomainScores = {
        technicalScore: 90,   // 90 * 0.30 = 27
        dataScore: 85,        // 85 * 0.20 = 17
        staffScore: 80,       // 80 * 0.25 = 20
        supportScore: 75,     // 75 * 0.15 = 11.25
        processScore: 70,     // 70 * 0.10 = 7
      };
      // Total = 82.25, rounded = 82
      expect(calculateOverallScore(scores)).toBe(82);
    });
  });

  describe('determineRecommendation', () => {
    test('should return no-go for any critical issues', () => {
      expect(determineRecommendation(100, 1, 0)).toBe('no-go');
      expect(determineRecommendation(100, 5, 0)).toBe('no-go');
    });

    test('should return no-go for more than 2 high issues', () => {
      expect(determineRecommendation(90, 0, 3)).toBe('no-go');
      expect(determineRecommendation(100, 0, 5)).toBe('no-go');
    });

    test('should return go for high score with no issues', () => {
      expect(determineRecommendation(85, 0, 0)).toBe('go');
      expect(determineRecommendation(90, 0, 0)).toBe('go');
      expect(determineRecommendation(100, 0, 0)).toBe('go');
    });

    test('should return conditional for high score with 1-2 high issues', () => {
      expect(determineRecommendation(90, 0, 1)).toBe('conditional');
      expect(determineRecommendation(90, 0, 2)).toBe('conditional');
    });

    test('should return conditional for score between 70-84', () => {
      expect(determineRecommendation(70, 0, 0)).toBe('conditional');
      expect(determineRecommendation(75, 0, 0)).toBe('conditional');
      expect(determineRecommendation(84, 0, 0)).toBe('conditional');
    });

    test('should return no-go for score below 70', () => {
      expect(determineRecommendation(69, 0, 0)).toBe('no-go');
      expect(determineRecommendation(50, 0, 0)).toBe('no-go');
      expect(determineRecommendation(0, 0, 0)).toBe('no-go');
    });
  });

  describe('calculateTdrReadiness (integration)', () => {
    test('should return go recommendation for perfect scores', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 10,
        checklistTotal: 10,
        integrationsPassed: 10,
        integrationsTotal: 10,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
        trainingCompletionPercent: 100,
        supportChecklistComplete: 10,
        supportChecklistTotal: 10,
        processChecklistComplete: 10,
        processChecklistTotal: 10,
      };

      const result = calculateTdrReadiness(metrics);

      expect(result.overallScore).toBe(100);
      expect(result.recommendation).toBe('go');
    });

    test('should return no-go for critical issues regardless of score', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 10,
        checklistTotal: 10,
        integrationsPassed: 10,
        integrationsTotal: 10,
        criticalIssuesCount: 1,  // Critical issue!
        highIssuesCount: 0,
        trainingCompletionPercent: 100,
        supportChecklistComplete: 10,
        supportChecklistTotal: 10,
        processChecklistComplete: 10,
        processChecklistTotal: 10,
      };

      const result = calculateTdrReadiness(metrics);

      expect(result.overallScore).toBe(100);
      expect(result.recommendation).toBe('no-go'); // Critical issue overrides
    });

    test('should return conditional for medium readiness', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 7,
        checklistTotal: 10,
        integrationsPassed: 8,
        integrationsTotal: 10,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
        trainingCompletionPercent: 75,
        supportChecklistComplete: 7,
        supportChecklistTotal: 10,
        processChecklistComplete: 7,
        processChecklistTotal: 10,
      };

      const result = calculateTdrReadiness(metrics);

      expect(result.overallScore).toBeGreaterThanOrEqual(70);
      expect(result.overallScore).toBeLessThan(85);
      expect(result.recommendation).toBe('conditional');
    });

    test('should return no-go for low readiness', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 3,
        checklistTotal: 10,
        integrationsPassed: 4,
        integrationsTotal: 10,
        criticalIssuesCount: 0,
        highIssuesCount: 0,
        trainingCompletionPercent: 50,
        supportChecklistComplete: 3,
        supportChecklistTotal: 10,
        processChecklistComplete: 3,
        processChecklistTotal: 10,
      };

      const result = calculateTdrReadiness(metrics);

      expect(result.overallScore).toBeLessThan(70);
      expect(result.recommendation).toBe('no-go');
    });

    test('should include all domain scores in result', () => {
      const metrics: TdrMetrics = {
        checklistComplete: 8,
        checklistTotal: 10,
        integrationsPassed: 9,
        integrationsTotal: 10,
        criticalIssuesCount: 0,
        highIssuesCount: 1,
        trainingCompletionPercent: 85,
        supportChecklistComplete: 7,
        supportChecklistTotal: 10,
        processChecklistComplete: 9,
        processChecklistTotal: 10,
      };

      const result = calculateTdrReadiness(metrics);

      expect(result).toHaveProperty('technicalScore');
      expect(result).toHaveProperty('dataScore');
      expect(result).toHaveProperty('staffScore');
      expect(result).toHaveProperty('supportScore');
      expect(result).toHaveProperty('processScore');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('recommendation');
      expect(result).toHaveProperty('criticalIssuesCount');
      expect(result).toHaveProperty('highIssuesCount');
    });
  });

  describe('Constants Validation', () => {
    test('domain weights should sum to 1 (100%)', () => {
      const sum = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBe(1);
    });

    test('thresholds should be properly ordered', () => {
      expect(THRESHOLDS.go).toBeGreaterThan(THRESHOLDS.conditional);
    });
  });
});
