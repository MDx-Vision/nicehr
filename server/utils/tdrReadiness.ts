/**
 * TDR Readiness Score Calculator
 *
 * Implements the 5-domain weighted scoring algorithm for
 * Technical Dress Rehearsal go-live readiness assessment.
 *
 * Domain Weights (total 100%):
 * - Technical: 30%
 * - Data Migration: 20%
 * - Staff Training: 25%
 * - Support Infrastructure: 15%
 * - Process Documentation: 10%
 */

// =============================================================================
// TYPES
// =============================================================================

export interface TdrDomainScores {
  technicalScore: number;      // 0-100
  dataScore: number;           // 0-100
  staffScore: number;          // 0-100
  supportScore: number;        // 0-100
  processScore: number;        // 0-100
}

export interface TdrMetrics {
  checklistComplete: number;
  checklistTotal: number;
  integrationsPassed: number;
  integrationsTotal: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  trainingCompletionPercent?: number;
  supportChecklistComplete?: number;
  supportChecklistTotal?: number;
  processChecklistComplete?: number;
  processChecklistTotal?: number;
}

export interface TdrReadinessResult {
  technicalScore: number;
  dataScore: number;
  staffScore: number;
  supportScore: number;
  processScore: number;
  overallScore: number;
  recommendation: 'go' | 'no-go' | 'conditional';
  criticalIssuesCount: number;
  highIssuesCount: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Domain weights for the 5-domain weighted scoring algorithm
 * Based on EHR implementation best practices
 */
export const DOMAIN_WEIGHTS = {
  technical: 0.30,      // 30% - Integration and technical readiness
  dataMigration: 0.20,  // 20% - Data migration and validation
  staffTraining: 0.25,  // 25% - Staff training completion
  support: 0.15,        // 15% - Support infrastructure readiness
  process: 0.10,        // 10% - Process documentation
} as const;

/**
 * Thresholds for go-live recommendations
 */
export const THRESHOLDS = {
  go: 85,           // Score >= 85 = Go
  conditional: 70,  // Score >= 70 = Conditional Go
  // Score < 70 = No-Go
} as const;

// =============================================================================
// CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate a percentage score from completed/total counts
 * Returns 0 if total is 0 to avoid division by zero
 */
export function calculatePercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Calculate individual domain scores from metrics
 */
export function calculateDomainScores(metrics: TdrMetrics): TdrDomainScores {
  // Technical score based on integration tests
  const technicalScore = calculatePercentage(
    metrics.integrationsPassed,
    metrics.integrationsTotal
  );

  // Data score based on checklist completion
  const dataScore = calculatePercentage(
    metrics.checklistComplete,
    metrics.checklistTotal
  );

  // Staff score from training completion (default to 80% if not provided)
  const staffScore = metrics.trainingCompletionPercent ?? 80;

  // Support score from support checklist
  const supportScore = calculatePercentage(
    metrics.supportChecklistComplete ?? 0,
    metrics.supportChecklistTotal ?? 1
  );

  // Process score from process documentation checklist
  const processScore = calculatePercentage(
    metrics.processChecklistComplete ?? 0,
    metrics.processChecklistTotal ?? 1
  );

  return {
    technicalScore,
    dataScore,
    staffScore,
    supportScore,
    processScore,
  };
}

/**
 * Calculate the weighted overall score from domain scores
 */
export function calculateOverallScore(scores: TdrDomainScores): number {
  const weighted =
    (scores.technicalScore * DOMAIN_WEIGHTS.technical) +
    (scores.dataScore * DOMAIN_WEIGHTS.dataMigration) +
    (scores.staffScore * DOMAIN_WEIGHTS.staffTraining) +
    (scores.supportScore * DOMAIN_WEIGHTS.support) +
    (scores.processScore * DOMAIN_WEIGHTS.process);

  return Math.round(weighted);
}

/**
 * Determine go-live recommendation based on score and issues
 */
export function determineRecommendation(
  overallScore: number,
  criticalIssuesCount: number,
  highIssuesCount: number
): 'go' | 'no-go' | 'conditional' {
  // Any critical issues = No-Go
  if (criticalIssuesCount > 0) {
    return 'no-go';
  }

  // High issues reduce to conditional at best
  if (highIssuesCount > 2) {
    return 'no-go';
  }

  if (highIssuesCount > 0 && overallScore < THRESHOLDS.go) {
    return 'conditional';
  }

  // Score-based recommendation
  if (overallScore >= THRESHOLDS.go) {
    return highIssuesCount > 0 ? 'conditional' : 'go';
  }

  if (overallScore >= THRESHOLDS.conditional) {
    return 'conditional';
  }

  return 'no-go';
}

/**
 * Calculate complete TDR readiness result
 * This is the main entry point for the algorithm
 */
export function calculateTdrReadiness(metrics: TdrMetrics): TdrReadinessResult {
  const domainScores = calculateDomainScores(metrics);
  const overallScore = calculateOverallScore(domainScores);
  const recommendation = determineRecommendation(
    overallScore,
    metrics.criticalIssuesCount,
    metrics.highIssuesCount
  );

  return {
    ...domainScores,
    overallScore,
    recommendation,
    criticalIssuesCount: metrics.criticalIssuesCount,
    highIssuesCount: metrics.highIssuesCount,
  };
}
