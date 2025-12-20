/**
 * Auto-Scheduling Algorithm
 *
 * Skills-first matching algorithm that scores consultants against project requirements.
 * Supports both recommendation mode (manual selection) and auto-assign mode.
 */

import type { IStorage } from "../storage";
import {
  ConstraintChecker,
  HARD_CONSTRAINTS,
  type ConstraintResult,
} from "./constraintChecker";
import {
  DEFAULT_SCORING_WEIGHTS,
  type ScoringWeights,
  type ConsultantWithFullDetails,
  type RequirementWithContext,
  type ConsultantScoreResult,
  type InsertSchedulingRecommendation,
  type InsertAutoAssignmentLog,
} from "../../shared/schema";

export interface SchedulerOptions {
  weights?: Partial<ScoringWeights>;
  minimumRatingThreshold?: number;
  minimumProficiencyLevel?: string;
  preferExperiencedConsultants?: boolean;
  allowPartialAvailability?: boolean;
  requiredCertifications?: string[];
}

export interface RecommendationResult {
  requirementId: string;
  recommendations: ConsultantScoreResult[];
  totalEvaluated: number;
  totalEligible: number;
  calculatedAt: Date;
}

export interface AutoAssignResult {
  projectId: string;
  assignmentsMade: number;
  conflictsFound: number;
  assignments: Array<{
    scheduleId: string;
    consultantId: string;
    score: number;
  }>;
  skipped: Array<{
    consultantId: string;
    reason: string;
  }>;
}

/**
 * Proficiency level multipliers for scoring
 */
const PROFICIENCY_MULTIPLIERS: Record<string, number> = {
  expert: 1.2,
  advanced: 1.0,
  intermediate: 0.7,
  beginner: 0.4,
  none: 0,
};

/**
 * Proficiency level to score mapping
 */
const PROFICIENCY_SCORES: Record<string, number> = {
  expert: 100,
  advanced: 80,
  intermediate: 60,
  beginner: 40,
  none: 0,
};

export class AutoScheduler {
  private storage: IStorage;
  private constraintChecker: ConstraintChecker;
  private weights: ScoringWeights;
  private options: SchedulerOptions;

  constructor(storage: IStorage, options?: SchedulerOptions) {
    this.storage = storage;
    this.constraintChecker = new ConstraintChecker(storage);
    this.options = options || {};
    this.weights = {
      ...DEFAULT_SCORING_WEIGHTS,
      ...options?.weights,
    };
  }

  /**
   * Get ranked recommendations for a specific requirement
   */
  async getRecommendations(
    context: RequirementWithContext
  ): Promise<RecommendationResult> {
    // 1. Get all active, onboarded consultants with full details
    const consultants = await this.storage.getConsultantsWithFullDetails();

    // 2. Score each consultant
    const scores: ConsultantScoreResult[] = [];

    for (const consultant of consultants) {
      const score = await this.calculateConsultantScore(consultant, context);
      scores.push(score);
    }

    // 3. Sort by eligibility first, then by score
    scores.sort((a, b) => {
      // Eligible consultants come first
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      // Then sort by total score descending
      return b.totalScore - a.totalScore;
    });

    // 4. Assign ranks
    let rank = 1;
    for (const score of scores) {
      if (score.isEligible) {
        score.rank = rank++;
      } else {
        score.rank = -1; // Ineligible consultants get rank -1
      }
    }

    const eligibleCount = scores.filter(s => s.isEligible).length;

    return {
      requirementId: context.id,
      recommendations: scores,
      totalEvaluated: consultants.length,
      totalEligible: eligibleCount,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate the composite score for a consultant-requirement match
   */
  async calculateConsultantScore(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext
  ): Promise<ConsultantScoreResult> {
    // Check hard constraints first
    const constraintResult = await this.constraintChecker.checkHardConstraints(
      consultant,
      context,
      {
        minimumRatingThreshold: this.options.minimumRatingThreshold,
        requiredCertifications: this.options.requiredCertifications,
      }
    );

    // Calculate individual scores
    const emrScore = this.calculateEmrScore(consultant, context.hospitalEmr);
    const moduleScore = this.calculateModuleScore(consultant, context.moduleName);
    const proficiencyScore = this.calculateProficiencyScore(consultant, context);
    const availabilityScore = await this.calculateAvailabilityScore(consultant, context);
    const performanceScore = this.calculatePerformanceScore(consultant);
    const shiftScore = this.calculateShiftScore(consultant, context);
    const colleagueScore = this.calculateColleagueScore(consultant, context);
    const locationScore = this.calculateLocationScore(consultant, context);

    // Calculate weighted total
    const totalScore =
      emrScore * this.weights.emr +
      moduleScore * this.weights.module +
      proficiencyScore * this.weights.proficiency +
      availabilityScore * this.weights.availability +
      performanceScore * this.weights.performance +
      shiftScore * this.weights.shift +
      colleagueScore * this.weights.colleague +
      locationScore * this.weights.location;

    return {
      consultantId: consultant.id,
      totalScore: Math.round(totalScore * 100) / 100,
      scores: {
        emr: Math.round(emrScore * 100) / 100,
        module: Math.round(moduleScore * 100) / 100,
        proficiency: Math.round(proficiencyScore * 100) / 100,
        availability: Math.round(availabilityScore * 100) / 100,
        performance: Math.round(performanceScore * 100) / 100,
        shift: Math.round(shiftScore * 100) / 100,
        colleague: Math.round(colleagueScore * 100) / 100,
        location: Math.round(locationScore * 100) / 100,
      },
      hardConstraintsFailed: constraintResult.failedConstraints,
      isEligible: constraintResult.passed,
      rank: 0, // Will be set after sorting
    };
  }

  /**
   * Calculate EMR match score (25% weight)
   * Perfect match = 100, with bonuses for proficiency and certification
   */
  private calculateEmrScore(
    consultant: ConsultantWithFullDetails,
    hospitalEmr: string | null
  ): number {
    if (!hospitalEmr) {
      return 100; // No requirement = full score
    }

    const normalizedHospitalEmr = hospitalEmr.toLowerCase().trim();
    let baseScore = 0;
    let proficiencyBonus = 0;
    let certificationBonus = 0;
    let experienceBonus = 0;

    // Check detailed EHR experience first (more data)
    if (consultant.ehrExperience?.length) {
      for (const exp of consultant.ehrExperience) {
        const ehrName = exp.ehrSystem.toLowerCase().trim();
        if (ehrName.includes(normalizedHospitalEmr) || normalizedHospitalEmr.includes(ehrName)) {
          baseScore = 100;

          // Proficiency bonus
          if (exp.proficiency) {
            const multiplier = PROFICIENCY_MULTIPLIERS[exp.proficiency] || 0;
            proficiencyBonus = 20 * multiplier;
          }

          // Certification bonus
          if (exp.isCertified) {
            certificationBonus = 15;
          }

          // Experience bonus (2 points per year, max 10)
          if (exp.yearsExperience) {
            experienceBonus = Math.min(exp.yearsExperience * 2, 10);
          }

          break;
        }
      }
    }

    // Fallback to emrSystems array if no detailed experience
    if (baseScore === 0 && consultant.emrSystems?.length) {
      for (const emr of consultant.emrSystems) {
        const emrName = emr.toLowerCase().trim();
        if (emrName.includes(normalizedHospitalEmr) || normalizedHospitalEmr.includes(emrName)) {
          baseScore = 80; // Lower base score for less detailed data
          break;
        }
      }
    }

    return Math.min(baseScore + proficiencyBonus + certificationBonus + experienceBonus, 145);
  }

  /**
   * Calculate module/unit experience score (20% weight)
   */
  private calculateModuleScore(
    consultant: ConsultantWithFullDetails,
    moduleName: string | null
  ): number {
    if (!moduleName) {
      return 100; // No requirement = full score
    }

    const normalizedModule = moduleName.toLowerCase().trim();
    let score = 0;

    // Check modules array
    if (consultant.modules?.length) {
      for (const mod of consultant.modules) {
        const modName = mod.toLowerCase().trim();
        if (modName.includes(normalizedModule) || normalizedModule.includes(modName)) {
          score = 100;
          break;
        }
      }
    }

    // If no direct match, check for related experience in units
    if (score === 0 && consultant.units?.length) {
      // Partial score for related unit experience
      score = 50;
    }

    return score;
  }

  /**
   * Calculate proficiency level score (15% weight)
   */
  private calculateProficiencyScore(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext
  ): number {
    // Get the highest proficiency from relevant skills
    let maxProficiency = "none";

    // Check EHR experience proficiency
    if (context.hospitalEmr && consultant.ehrExperience?.length) {
      const normalizedEmr = context.hospitalEmr.toLowerCase().trim();
      for (const exp of consultant.ehrExperience) {
        if (exp.ehrSystem.toLowerCase().includes(normalizedEmr)) {
          if (exp.proficiency) {
            const currentLevel = PROFICIENCY_SCORES[exp.proficiency] || 0;
            const maxLevel = PROFICIENCY_SCORES[maxProficiency] || 0;
            if (currentLevel > maxLevel) {
              maxProficiency = exp.proficiency;
            }
          }
        }
      }
    }

    // Check skills proficiency
    if (consultant.skills?.length) {
      for (const skill of consultant.skills) {
        if (skill.proficiency) {
          const currentLevel = PROFICIENCY_SCORES[skill.proficiency] || 0;
          const maxLevel = PROFICIENCY_SCORES[maxProficiency] || 0;
          if (currentLevel > maxLevel) {
            maxProficiency = skill.proficiency;
          }
        }
      }
    }

    return PROFICIENCY_SCORES[maxProficiency] || 0;
  }

  /**
   * Calculate availability score (15% weight)
   */
  private async calculateAvailabilityScore(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext
  ): Promise<number> {
    if (!context.scheduleDates?.length) {
      return 100; // No specific dates = full score
    }

    const availabilityCheck = await this.constraintChecker.checkDateAvailability(
      consultant,
      context.scheduleDates.map(d => d.date)
    );

    if (!availabilityCheck.available) {
      return 0;
    }

    if (availabilityCheck.partialAvailability) {
      return 50;
    }

    return 100;
  }

  /**
   * Calculate performance score based on ratings (10% weight)
   */
  private calculatePerformanceScore(consultant: ConsultantWithFullDetails): number {
    if (!consultant.ratings?.length) {
      return 70; // No ratings = neutral score
    }

    const validRatings = consultant.ratings.filter(r => r.overallRating !== null);
    if (validRatings.length === 0) {
      return 70;
    }

    // Calculate average overall rating (1-5 scale)
    const avgRating = validRatings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / validRatings.length;

    // Normalize to 0-100 scale
    return Math.round((avgRating / 5) * 100);
  }

  /**
   * Calculate shift preference alignment score (8% weight)
   */
  private calculateShiftScore(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext
  ): number {
    if (!context.shiftType) {
      return 100; // No preference required
    }

    if (!consultant.shiftPreference) {
      return 70; // No preference = neutral
    }

    return consultant.shiftPreference === context.shiftType ? 100 : 30;
  }

  /**
   * Calculate colleague pairing score (5% weight)
   */
  private calculateColleagueScore(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext
  ): number {
    if (!consultant.preferredColleagues?.length || !context.alreadyAssignedConsultantIds?.length) {
      return 50; // No preference or no assignments yet = neutral
    }

    const preferenceResult = this.constraintChecker.checkColleaguePreference(
      consultant.preferredColleagues,
      context.alreadyAssignedConsultantIds
    );

    if (preferenceResult.hasPreferredColleague) {
      // Bonus based on number of matches
      const matchCount = preferenceResult.matchedColleagues.length;
      return Math.min(100 + matchCount * 25, 150);
    }

    return 50;
  }

  /**
   * Calculate location proximity score (2% weight)
   */
  private calculateLocationScore(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext
  ): number {
    const proximityResult = this.constraintChecker.checkLocationProximity(
      consultant.state,
      context.hospitalState
    );

    switch (proximityResult) {
      case "same_state":
        return 100;
      case "different_state":
        return 30;
      case "unknown":
        return 50;
      default:
        return 50;
    }
  }

  /**
   * Save recommendations to database for caching
   */
  async saveRecommendations(
    result: RecommendationResult,
    scheduleId?: string,
    expiresInHours: number = 24
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const recommendations: InsertSchedulingRecommendation[] = result.recommendations.map(rec => ({
      requirementId: result.requirementId,
      scheduleId: scheduleId || null,
      consultantId: rec.consultantId,
      totalScore: rec.totalScore.toString(),
      emrScore: rec.scores.emr.toString(),
      moduleScore: rec.scores.module.toString(),
      proficiencyScore: rec.scores.proficiency.toString(),
      availabilityScore: rec.scores.availability.toString(),
      performanceScore: rec.scores.performance.toString(),
      shiftScore: rec.scores.shift.toString(),
      colleagueScore: rec.scores.colleague.toString(),
      locationScore: rec.scores.location.toString(),
      hardConstraintsFailed: rec.hardConstraintsFailed,
      isEligible: rec.isEligible,
      rank: rec.rank,
      calculatedAt: result.calculatedAt,
      expiresAt,
    }));

    await this.storage.saveSchedulingRecommendations(recommendations);
  }

  /**
   * Run auto-assignment for a project
   * Automatically assigns top-ranked consultants to requirements
   */
  async autoAssign(
    projectId: string,
    requirementIds?: string[],
    options?: {
      dryRun?: boolean;
      maxPerConsultant?: number;
    }
  ): Promise<AutoAssignResult> {
    const { dryRun = false, maxPerConsultant = 5 } = options || {};

    const assignments: AutoAssignResult["assignments"] = [];
    const skipped: AutoAssignResult["skipped"] = [];
    let conflictsFound = 0;

    // Track how many times each consultant has been assigned in this run
    const consultantAssignmentCount = new Map<string, number>();

    // Get all requirements for the project (or specific ones)
    const allRequirements = await this.storage.getProjectRequirementsWithContext(projectId);
    const requirements = requirementIds?.length
      ? allRequirements.filter(r => requirementIds.includes(r.id))
      : allRequirements;

    for (const requirement of requirements) {
      // Calculate how many more consultants are needed
      const alreadyAssigned = requirement.alreadyAssignedConsultantIds?.length || 0;
      const stillNeeded = requirement.consultantsNeeded - alreadyAssigned;

      if (stillNeeded <= 0) {
        continue; // Requirement is fully staffed
      }

      // Get recommendations for this requirement
      const recommendations = await this.getRecommendations(requirement);

      // Get eligible consultants sorted by score
      const eligibleConsultants = recommendations.recommendations
        .filter(r => r.isEligible)
        .slice(0, stillNeeded * 2); // Get more than needed to handle conflicts

      let assignedCount = 0;

      for (const rec of eligibleConsultants) {
        if (assignedCount >= stillNeeded) {
          break;
        }

        // Check if consultant has hit max assignments
        const currentAssignments = consultantAssignmentCount.get(rec.consultantId) || 0;
        if (currentAssignments >= maxPerConsultant) {
          skipped.push({
            consultantId: rec.consultantId,
            reason: `Exceeded max assignments per consultant (${maxPerConsultant})`,
          });
          continue;
        }

        // Check if consultant is already assigned to this requirement
        if (requirement.alreadyAssignedConsultantIds?.includes(rec.consultantId)) {
          skipped.push({
            consultantId: rec.consultantId,
            reason: "Already assigned to this requirement",
          });
          conflictsFound++;
          continue;
        }

        // Check for schedule conflicts on the requirement dates
        if (requirement.scheduleDates?.length) {
          const hasConflict = await this.checkScheduleConflict(
            rec.consultantId,
            requirement.scheduleDates.map(d => d.date),
            projectId
          );

          if (hasConflict) {
            skipped.push({
              consultantId: rec.consultantId,
              reason: "Schedule conflict on required dates",
            });
            conflictsFound++;
            continue;
          }
        }

        // Find or create a schedule for this requirement
        const scheduleId = await this.findOrCreateSchedule(
          projectId,
          requirement,
          dryRun
        );

        if (!scheduleId) {
          skipped.push({
            consultantId: rec.consultantId,
            reason: "Could not find or create schedule",
          });
          continue;
        }

        // Create the assignment (unless dry run)
        if (!dryRun) {
          try {
            await this.storage.createScheduleAssignment({
              scheduleId,
              consultantId: rec.consultantId,
              unitId: requirement.unitId || undefined,
              moduleId: requirement.moduleId || undefined,
              notes: `Auto-assigned with score ${rec.totalScore.toFixed(2)}`,
            });
          } catch (error) {
            skipped.push({
              consultantId: rec.consultantId,
              reason: `Failed to create assignment: ${error}`,
            });
            continue;
          }
        }

        assignments.push({
          scheduleId,
          consultantId: rec.consultantId,
          score: rec.totalScore,
        });

        consultantAssignmentCount.set(
          rec.consultantId,
          currentAssignments + 1
        );
        assignedCount++;
      }
    }

    return {
      projectId,
      assignmentsMade: assignments.length,
      conflictsFound,
      assignments,
      skipped,
    };
  }

  /**
   * Check if consultant has a schedule conflict on given dates
   */
  private async checkScheduleConflict(
    consultantId: string,
    dates: string[],
    excludeProjectId?: string
  ): Promise<boolean> {
    // Get consultant's existing assignments
    const existingAssignments = await this.storage.getConsultantAssignments(consultantId);

    for (const assignment of existingAssignments) {
      // Skip assignments from the same project (can work multiple shifts)
      if (excludeProjectId && assignment.schedule?.projectId === excludeProjectId) {
        continue;
      }

      // Check if any of the dates conflict
      const assignmentDate = assignment.schedule?.scheduleDate;
      if (assignmentDate && dates.includes(assignmentDate)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find an existing schedule or create one for the requirement
   */
  private async findOrCreateSchedule(
    projectId: string,
    requirement: RequirementWithContext,
    dryRun: boolean
  ): Promise<string | null> {
    // If requirement has specific dates, use the first one
    const scheduleDate = requirement.scheduleDates?.[0]?.date;
    const shiftType = requirement.shiftType || requirement.scheduleDates?.[0]?.shiftType || "day";

    if (!scheduleDate) {
      // No specific date - create with today's date
      const today = new Date().toISOString().split("T")[0];

      if (dryRun) {
        return `dry-run-schedule-${Date.now()}`;
      }

      const schedule = await this.storage.createProjectSchedule({
        projectId,
        scheduleDate: today,
        shiftType: shiftType as "day" | "night" | "swing",
        status: "pending",
      });

      return schedule.id;
    }

    // Try to find existing schedule for this date/shift
    const existingSchedules = await this.storage.getProjectSchedules(projectId);
    const matchingSchedule = existingSchedules.find(
      s => s.scheduleDate === scheduleDate && s.shiftType === shiftType
    );

    if (matchingSchedule) {
      return matchingSchedule.id;
    }

    // Create new schedule
    if (dryRun) {
      return `dry-run-schedule-${Date.now()}`;
    }

    const schedule = await this.storage.createProjectSchedule({
      projectId,
      scheduleDate,
      shiftType: shiftType as "day" | "night" | "swing",
      status: "pending",
    });

    return schedule.id;
  }

  /**
   * Create an audit log entry for auto-assignment runs
   */
  async createAssignmentLog(
    projectId: string,
    scheduleId: string | undefined,
    userId: string,
    mode: "recommendation" | "auto_assign",
    result: RecommendationResult | AutoAssignResult
  ): Promise<void> {
    const log: InsertAutoAssignmentLog = {
      projectId,
      scheduleId: scheduleId || null,
      runBy: userId,
      mode,
      consultantsEvaluated: "recommendations" in result ? result.totalEvaluated : 0,
      consultantsEligible: "recommendations" in result ? result.totalEligible : 0,
      assignmentsMade: "assignmentsMade" in result ? result.assignmentsMade : 0,
      conflictsFound: "conflictsFound" in result ? result.conflictsFound : 0,
      parameters: this.weights,
      status: "completed",
      completedAt: new Date(),
    };

    await this.storage.createAutoAssignmentLog(log);
  }
}

/**
 * Factory function to create an AutoScheduler with custom configuration
 */
export function createAutoScheduler(
  storage: IStorage,
  config?: {
    emrWeight?: string;
    moduleWeight?: string;
    proficiencyWeight?: string;
    availabilityWeight?: string;
    performanceWeight?: string;
    shiftWeight?: string;
    colleagueWeight?: string;
    locationWeight?: string;
    minimumRatingThreshold?: string;
    minimumProficiencyLevel?: string;
    preferExperiencedConsultants?: boolean;
    allowPartialAvailability?: boolean;
  }
): AutoScheduler {
  const weights: Partial<ScoringWeights> = {};

  if (config?.emrWeight) weights.emr = parseFloat(config.emrWeight);
  if (config?.moduleWeight) weights.module = parseFloat(config.moduleWeight);
  if (config?.proficiencyWeight) weights.proficiency = parseFloat(config.proficiencyWeight);
  if (config?.availabilityWeight) weights.availability = parseFloat(config.availabilityWeight);
  if (config?.performanceWeight) weights.performance = parseFloat(config.performanceWeight);
  if (config?.shiftWeight) weights.shift = parseFloat(config.shiftWeight);
  if (config?.colleagueWeight) weights.colleague = parseFloat(config.colleagueWeight);
  if (config?.locationWeight) weights.location = parseFloat(config.locationWeight);

  return new AutoScheduler(storage, {
    weights,
    minimumRatingThreshold: config?.minimumRatingThreshold
      ? parseFloat(config.minimumRatingThreshold)
      : undefined,
    minimumProficiencyLevel: config?.minimumProficiencyLevel,
    preferExperiencedConsultants: config?.preferExperiencedConsultants,
    allowPartialAvailability: config?.allowPartialAvailability,
  });
}
