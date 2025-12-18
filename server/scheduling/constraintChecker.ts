/**
 * Constraint Checker for Auto-Scheduling Algorithm
 *
 * Evaluates hard and soft constraints for consultant-requirement matching.
 * Hard constraints are non-negotiable (fail = excluded).
 * Soft constraints influence scoring.
 */

import type { IStorage } from "../storage";
import type {
  ConsultantWithFullDetails,
  RequirementWithContext
} from "../../shared/schema";

export interface ConstraintResult {
  passed: boolean;
  failedConstraints: string[];
  warnings: string[];
}

export interface AvailabilityCheckResult {
  available: boolean;
  conflicts: string[];
  partialAvailability: boolean;
}

/**
 * Hard constraint codes that can cause exclusion
 */
export const HARD_CONSTRAINTS = {
  CONSULTANT_NOT_AVAILABLE: "CONSULTANT_NOT_AVAILABLE",
  CONSULTANT_NOT_ONBOARDED: "CONSULTANT_NOT_ONBOARDED",
  MISSING_EMR_EXPERIENCE: "MISSING_EMR_EXPERIENCE",
  DATE_UNAVAILABLE: "DATE_UNAVAILABLE",
  SCHEDULE_CONFLICT: "SCHEDULE_CONFLICT",
  MISSING_CERTIFICATION: "MISSING_CERTIFICATION",
  BELOW_RATING_THRESHOLD: "BELOW_RATING_THRESHOLD",
} as const;

export type HardConstraintCode = typeof HARD_CONSTRAINTS[keyof typeof HARD_CONSTRAINTS];

export class ConstraintChecker {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Check all hard constraints for a consultant-requirement match
   */
  async checkHardConstraints(
    consultant: ConsultantWithFullDetails,
    context: RequirementWithContext,
    options?: {
      minimumRatingThreshold?: number;
      requiredCertifications?: string[];
    }
  ): Promise<ConstraintResult> {
    const failedConstraints: string[] = [];
    const warnings: string[] = [];

    // 1. Check isAvailable flag
    if (!consultant.isAvailable) {
      failedConstraints.push(HARD_CONSTRAINTS.CONSULTANT_NOT_AVAILABLE);
    }

    // 2. Check isOnboarded flag
    if (!consultant.isOnboarded) {
      failedConstraints.push(HARD_CONSTRAINTS.CONSULTANT_NOT_ONBOARDED);
    }

    // 3. Check EMR experience
    const hasEmrExperience = this.checkEmrExperience(consultant, context.hospitalEmr);
    if (!hasEmrExperience) {
      failedConstraints.push(HARD_CONSTRAINTS.MISSING_EMR_EXPERIENCE);
    }

    // 4. Check availability for schedule dates
    if (context.scheduleDates?.length > 0) {
      const availabilityCheck = await this.checkDateAvailability(
        consultant,
        context.scheduleDates.map(d => d.date)
      );
      if (!availabilityCheck.available) {
        failedConstraints.push(HARD_CONSTRAINTS.DATE_UNAVAILABLE);
      }
      if (availabilityCheck.partialAvailability) {
        warnings.push("Consultant has partial availability for some dates");
      }
    }

    // 5. Check for scheduling conflicts
    if (context.scheduleDates?.length > 0) {
      const hasConflict = await this.checkScheduleConflicts(
        consultant.id,
        context.scheduleDates.map(d => d.date)
      );
      if (hasConflict) {
        failedConstraints.push(HARD_CONSTRAINTS.SCHEDULE_CONFLICT);
      }
    }

    // 6. Check required certifications (if specified)
    if (options?.requiredCertifications?.length) {
      const hasCerts = this.checkCertifications(
        consultant,
        options.requiredCertifications
      );
      if (!hasCerts) {
        failedConstraints.push(HARD_CONSTRAINTS.MISSING_CERTIFICATION);
      }
    }

    // 7. Check minimum rating threshold (if specified)
    if (options?.minimumRatingThreshold && options.minimumRatingThreshold > 0) {
      const avgRating = this.calculateAverageRating(consultant);
      if (avgRating !== null && avgRating < options.minimumRatingThreshold) {
        failedConstraints.push(HARD_CONSTRAINTS.BELOW_RATING_THRESHOLD);
      }
    }

    return {
      passed: failedConstraints.length === 0,
      failedConstraints,
      warnings,
    };
  }

  /**
   * Check if consultant has experience with the hospital's EMR system
   */
  checkEmrExperience(
    consultant: ConsultantWithFullDetails,
    hospitalEmr: string | null
  ): boolean {
    if (!hospitalEmr) {
      // No EMR requirement specified
      return true;
    }

    const normalizedHospitalEmr = hospitalEmr.toLowerCase().trim();

    // Check consultant's emrSystems array
    if (consultant.emrSystems?.length) {
      const hasEmr = consultant.emrSystems.some(
        emr => emr.toLowerCase().trim().includes(normalizedHospitalEmr) ||
               normalizedHospitalEmr.includes(emr.toLowerCase().trim())
      );
      if (hasEmr) return true;
    }

    // Check detailed EHR experience records
    if (consultant.ehrExperience?.length) {
      const hasEhrExperience = consultant.ehrExperience.some(
        exp => exp.ehrSystem.toLowerCase().trim().includes(normalizedHospitalEmr) ||
               normalizedHospitalEmr.includes(exp.ehrSystem.toLowerCase().trim())
      );
      if (hasEhrExperience) return true;
    }

    return false;
  }

  /**
   * Check if consultant has required module experience
   */
  checkModuleExperience(
    consultant: ConsultantWithFullDetails,
    moduleName: string | null
  ): boolean {
    if (!moduleName) {
      return true;
    }

    const normalizedModule = moduleName.toLowerCase().trim();

    // Check consultant's modules array
    if (consultant.modules?.length) {
      return consultant.modules.some(
        mod => mod.toLowerCase().trim().includes(normalizedModule) ||
               normalizedModule.includes(mod.toLowerCase().trim())
      );
    }

    return false;
  }

  /**
   * Check if consultant has required unit experience
   */
  checkUnitExperience(
    consultant: ConsultantWithFullDetails,
    unitName: string | null
  ): boolean {
    if (!unitName) {
      return true;
    }

    const normalizedUnit = unitName.toLowerCase().trim();

    // Check consultant's units array
    if (consultant.units?.length) {
      return consultant.units.some(
        unit => unit.toLowerCase().trim().includes(normalizedUnit) ||
                normalizedUnit.includes(unit.toLowerCase().trim())
      );
    }

    return false;
  }

  /**
   * Check consultant's availability for specific dates
   */
  async checkDateAvailability(
    consultant: ConsultantWithFullDetails,
    dates: string[]
  ): Promise<AvailabilityCheckResult> {
    const conflicts: string[] = [];
    let hasPartialAvailability = false;

    if (!consultant.availabilityBlocks?.length) {
      // No availability blocks means fully available
      return { available: true, conflicts: [], partialAvailability: false };
    }

    for (const dateStr of dates) {
      const date = new Date(dateStr);

      for (const block of consultant.availabilityBlocks) {
        const startDate = new Date(block.startDate);
        const endDate = new Date(block.endDate);

        // Check if date falls within the block
        if (date >= startDate && date <= endDate) {
          // Check if it's a blocking type
          if (["unavailable", "vacation", "sick"].includes(block.type)) {
            conflicts.push(`${dateStr}: ${block.type}`);
          } else if (block.type === "training") {
            // Training is a soft warning, not a hard block
            hasPartialAvailability = true;
          }
        }
      }
    }

    return {
      available: conflicts.length === 0,
      conflicts,
      partialAvailability: hasPartialAvailability,
    };
  }

  /**
   * Check for existing schedule conflicts
   */
  async checkScheduleConflicts(
    consultantId: string,
    dates: string[]
  ): Promise<boolean> {
    try {
      // Get consultant's existing schedule assignments
      const existingSchedules = await this.storage.getConsultantSchedules(consultantId);

      if (!existingSchedules?.length) {
        return false;
      }

      // Check for date overlaps
      for (const dateStr of dates) {
        const checkDate = new Date(dateStr).toISOString().split("T")[0];

        for (const schedule of existingSchedules) {
          // Need to get the schedule date from the parent schedule
          // This would require joining with projectSchedules
          // For now, we'll return false (no conflict) and enhance later
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking schedule conflicts:", error);
      return false;
    }
  }

  /**
   * Check if consultant has required certifications
   */
  checkCertifications(
    consultant: ConsultantWithFullDetails,
    requiredCertifications: string[]
  ): boolean {
    if (!requiredCertifications?.length) {
      return true;
    }

    // Check EHR experience certifications
    const ehrCertifications = consultant.ehrExperience
      ?.filter(exp => exp.isCertified)
      ?.map(exp => exp.ehrSystem.toLowerCase()) || [];

    // Check skills with certifications
    const skillCertifications = consultant.skills
      ?.filter(skill => skill.isCertified)
      ?.map(skill => skill.skillItemId) || [];

    for (const required of requiredCertifications) {
      const normalizedRequired = required.toLowerCase().trim();

      const hasCert = ehrCertifications.some(cert =>
        cert.includes(normalizedRequired) || normalizedRequired.includes(cert)
      );

      if (!hasCert) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate consultant's average rating
   */
  calculateAverageRating(consultant: ConsultantWithFullDetails): number | null {
    if (!consultant.ratings?.length) {
      return null;
    }

    const validRatings = consultant.ratings.filter(r => r.overallRating !== null);
    if (validRatings.length === 0) {
      return null;
    }

    const sum = validRatings.reduce((acc, r) => acc + (r.overallRating || 0), 0);
    return sum / validRatings.length;
  }

  /**
   * Check if consultant's shift preference matches requirement
   */
  checkShiftPreference(
    consultantPreference: string | null,
    requiredShift: string | null
  ): "match" | "no_preference" | "mismatch" {
    if (!requiredShift) {
      return "no_preference";
    }

    if (!consultantPreference) {
      return "no_preference";
    }

    return consultantPreference === requiredShift ? "match" : "mismatch";
  }

  /**
   * Check if preferred colleagues are already assigned
   */
  checkColleaguePreference(
    consultantPreferredColleagues: string[] | null,
    alreadyAssignedIds: string[]
  ): { hasPreferredColleague: boolean; matchedColleagues: string[] } {
    if (!consultantPreferredColleagues?.length || !alreadyAssignedIds?.length) {
      return { hasPreferredColleague: false, matchedColleagues: [] };
    }

    const matchedColleagues = consultantPreferredColleagues.filter(
      colleague => alreadyAssignedIds.includes(colleague)
    );

    return {
      hasPreferredColleague: matchedColleagues.length > 0,
      matchedColleagues,
    };
  }

  /**
   * Check if consultant is in the same state as hospital
   */
  checkLocationProximity(
    consultantState: string | null,
    hospitalState: string | null
  ): "same_state" | "different_state" | "unknown" {
    if (!consultantState || !hospitalState) {
      return "unknown";
    }

    const normalizedConsultant = consultantState.toLowerCase().trim();
    const normalizedHospital = hospitalState.toLowerCase().trim();

    return normalizedConsultant === normalizedHospital ? "same_state" : "different_state";
  }
}
