/**
 * Auto-Scheduling Module
 *
 * Exports the core scheduling algorithm components.
 */

export {
  AutoScheduler,
  createAutoScheduler,
  type SchedulerOptions,
  type RecommendationResult,
  type AutoAssignResult,
} from "./autoScheduler";

export {
  ConstraintChecker,
  HARD_CONSTRAINTS,
  type ConstraintResult,
  type AvailabilityCheckResult,
  type HardConstraintCode,
} from "./constraintChecker";
