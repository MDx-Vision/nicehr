/**
 * Unit Tests for Constraint Checker
 *
 * Tests the pure functions used in consultant-requirement matching:
 * - EMR experience checking
 * - Module experience checking
 * - Certification checking
 * - Rating calculations
 * - Shift preference matching
 * - Location proximity
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { ConstraintChecker, HARD_CONSTRAINTS } from './constraintChecker';

// Mock storage interface
const mockStorage = {
  getConsultantSchedules: jest.fn().mockResolvedValue([]),
} as any;

// Mock consultant type for testing
interface MockConsultant {
  id: string;
  isAvailable: boolean;
  isOnboarded: boolean;
  emrSystems?: string[];
  ehrExperience?: Array<{ ehrSystem: string; isCertified: boolean }>;
  modules?: string[];
  units?: string[];
  ratings?: Array<{ overallRating: number | null }>;
  skills?: Array<{ skillItemId: string; isCertified: boolean }>;
  availabilityBlocks?: Array<{
    startDate: string;
    endDate: string;
    type: string;
  }>;
}

describe('ConstraintChecker', () => {
  let checker: ConstraintChecker;

  beforeEach(() => {
    checker = new ConstraintChecker(mockStorage);
  });

  describe('checkEmrExperience', () => {
    test('should return true when no EMR requirement specified', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        emrSystems: [],
      };

      expect(checker.checkEmrExperience(consultant as any, null)).toBe(true);
    });

    test('should return true when consultant has matching EMR in emrSystems', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        emrSystems: ['Epic', 'Cerner', 'Meditech'],
      };

      expect(checker.checkEmrExperience(consultant as any, 'Epic')).toBe(true);
    });

    test('should return true with case-insensitive matching', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        emrSystems: ['epic', 'CERNER'],
      };

      expect(checker.checkEmrExperience(consultant as any, 'EPIC')).toBe(true);
      expect(checker.checkEmrExperience(consultant as any, 'cerner')).toBe(true);
    });

    test('should return true when consultant has matching EHR experience', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        emrSystems: [],
        ehrExperience: [
          { ehrSystem: 'Epic', isCertified: true },
          { ehrSystem: 'Cerner', isCertified: false },
        ],
      };

      expect(checker.checkEmrExperience(consultant as any, 'Epic')).toBe(true);
    });

    test('should return false when consultant lacks required EMR', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        emrSystems: ['Cerner', 'Meditech'],
        ehrExperience: [],
      };

      expect(checker.checkEmrExperience(consultant as any, 'Epic')).toBe(false);
    });

    test('should handle partial matching', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        emrSystems: ['Epic Beaker'],
      };

      expect(checker.checkEmrExperience(consultant as any, 'Epic')).toBe(true);
    });
  });

  describe('checkModuleExperience', () => {
    test('should return true when no module requirement specified', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        modules: [],
      };

      expect(checker.checkModuleExperience(consultant as any, null)).toBe(true);
    });

    test('should return true when consultant has matching module', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        modules: ['Orders', 'Clinical Documentation', 'Pharmacy'],
      };

      expect(checker.checkModuleExperience(consultant as any, 'Orders')).toBe(true);
    });

    test('should return false when consultant lacks required module', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        modules: ['Orders', 'Pharmacy'],
      };

      expect(checker.checkModuleExperience(consultant as any, 'Radiology')).toBe(false);
    });

    test('should handle case-insensitive matching', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        modules: ['clinical documentation'],
      };

      expect(checker.checkModuleExperience(consultant as any, 'Clinical Documentation')).toBe(true);
    });
  });

  describe('checkUnitExperience', () => {
    test('should return true when no unit requirement specified', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        units: [],
      };

      expect(checker.checkUnitExperience(consultant as any, null)).toBe(true);
    });

    test('should return true when consultant has matching unit', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        units: ['Emergency', 'ICU', 'Pediatrics'],
      };

      expect(checker.checkUnitExperience(consultant as any, 'ICU')).toBe(true);
    });

    test('should return false when consultant lacks required unit', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        units: ['Emergency', 'ICU'],
      };

      expect(checker.checkUnitExperience(consultant as any, 'Oncology')).toBe(false);
    });
  });

  describe('checkCertifications', () => {
    test('should return true when no certifications required', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ehrExperience: [],
        skills: [],
      };

      expect(checker.checkCertifications(consultant as any, [])).toBe(true);
    });

    test('should return true when consultant has required certifications', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ehrExperience: [
          { ehrSystem: 'Epic', isCertified: true },
          { ehrSystem: 'Cerner', isCertified: true },
        ],
        skills: [],
      };

      expect(checker.checkCertifications(consultant as any, ['Epic'])).toBe(true);
    });

    test('should return false when consultant lacks required certifications', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ehrExperience: [
          { ehrSystem: 'Cerner', isCertified: true },
        ],
        skills: [],
      };

      expect(checker.checkCertifications(consultant as any, ['Epic'])).toBe(false);
    });

    test('should only count certified experience', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ehrExperience: [
          { ehrSystem: 'Epic', isCertified: false }, // Not certified
        ],
        skills: [],
      };

      expect(checker.checkCertifications(consultant as any, ['Epic'])).toBe(false);
    });
  });

  describe('calculateAverageRating', () => {
    test('should return null when no ratings exist', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ratings: [],
      };

      expect(checker.calculateAverageRating(consultant as any)).toBeNull();
    });

    test('should return null when ratings array is undefined', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
      };

      expect(checker.calculateAverageRating(consultant as any)).toBeNull();
    });

    test('should calculate correct average rating', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ratings: [
          { overallRating: 4 },
          { overallRating: 5 },
          { overallRating: 3 },
        ],
      };

      expect(checker.calculateAverageRating(consultant as any)).toBe(4);
    });

    test('should ignore null ratings', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ratings: [
          { overallRating: 4 },
          { overallRating: null },
          { overallRating: 5 },
        ],
      };

      expect(checker.calculateAverageRating(consultant as any)).toBe(4.5);
    });

    test('should return null when all ratings are null', () => {
      const consultant: MockConsultant = {
        id: 'test-1',
        isAvailable: true,
        isOnboarded: true,
        ratings: [
          { overallRating: null },
          { overallRating: null },
        ],
      };

      expect(checker.calculateAverageRating(consultant as any)).toBeNull();
    });
  });

  describe('checkShiftPreference', () => {
    test('should return no_preference when no required shift', () => {
      expect(checker.checkShiftPreference('day', null)).toBe('no_preference');
    });

    test('should return no_preference when consultant has no preference', () => {
      expect(checker.checkShiftPreference(null, 'day')).toBe('no_preference');
    });

    test('should return match when preferences align', () => {
      expect(checker.checkShiftPreference('day', 'day')).toBe('match');
      expect(checker.checkShiftPreference('night', 'night')).toBe('match');
      expect(checker.checkShiftPreference('swing', 'swing')).toBe('match');
    });

    test('should return mismatch when preferences differ', () => {
      expect(checker.checkShiftPreference('day', 'night')).toBe('mismatch');
      expect(checker.checkShiftPreference('night', 'day')).toBe('mismatch');
    });
  });

  describe('checkColleaguePreference', () => {
    test('should return no match when consultant has no preferences', () => {
      const result = checker.checkColleaguePreference(null, ['user-1', 'user-2']);

      expect(result.hasPreferredColleague).toBe(false);
      expect(result.matchedColleagues).toEqual([]);
    });

    test('should return no match when no one is assigned', () => {
      const result = checker.checkColleaguePreference(['user-1', 'user-2'], []);

      expect(result.hasPreferredColleague).toBe(false);
      expect(result.matchedColleagues).toEqual([]);
    });

    test('should find matched colleagues', () => {
      const result = checker.checkColleaguePreference(
        ['user-1', 'user-2', 'user-3'],
        ['user-2', 'user-4']
      );

      expect(result.hasPreferredColleague).toBe(true);
      expect(result.matchedColleagues).toEqual(['user-2']);
    });

    test('should find multiple matched colleagues', () => {
      const result = checker.checkColleaguePreference(
        ['user-1', 'user-2', 'user-3'],
        ['user-1', 'user-3', 'user-5']
      );

      expect(result.hasPreferredColleague).toBe(true);
      expect(result.matchedColleagues).toContain('user-1');
      expect(result.matchedColleagues).toContain('user-3');
      expect(result.matchedColleagues.length).toBe(2);
    });
  });

  describe('checkLocationProximity', () => {
    test('should return unknown when consultant state is missing', () => {
      expect(checker.checkLocationProximity(null, 'CA')).toBe('unknown');
    });

    test('should return unknown when hospital state is missing', () => {
      expect(checker.checkLocationProximity('CA', null)).toBe('unknown');
    });

    test('should return same_state when states match', () => {
      expect(checker.checkLocationProximity('CA', 'CA')).toBe('same_state');
      expect(checker.checkLocationProximity('California', 'california')).toBe('same_state');
    });

    test('should return different_state when states differ', () => {
      expect(checker.checkLocationProximity('CA', 'NY')).toBe('different_state');
      expect(checker.checkLocationProximity('Texas', 'Florida')).toBe('different_state');
    });

    test('should handle case-insensitive comparison', () => {
      expect(checker.checkLocationProximity('ca', 'CA')).toBe('same_state');
      expect(checker.checkLocationProximity('TEXAS', 'texas')).toBe('same_state');
    });

    test('should trim whitespace', () => {
      expect(checker.checkLocationProximity('  CA  ', 'CA')).toBe('same_state');
    });
  });

  describe('HARD_CONSTRAINTS constants', () => {
    test('should have all expected constraint codes', () => {
      expect(HARD_CONSTRAINTS.CONSULTANT_NOT_AVAILABLE).toBe('CONSULTANT_NOT_AVAILABLE');
      expect(HARD_CONSTRAINTS.CONSULTANT_NOT_ONBOARDED).toBe('CONSULTANT_NOT_ONBOARDED');
      expect(HARD_CONSTRAINTS.MISSING_EMR_EXPERIENCE).toBe('MISSING_EMR_EXPERIENCE');
      expect(HARD_CONSTRAINTS.DATE_UNAVAILABLE).toBe('DATE_UNAVAILABLE');
      expect(HARD_CONSTRAINTS.SCHEDULE_CONFLICT).toBe('SCHEDULE_CONFLICT');
      expect(HARD_CONSTRAINTS.MISSING_CERTIFICATION).toBe('MISSING_CERTIFICATION');
      expect(HARD_CONSTRAINTS.BELOW_RATING_THRESHOLD).toBe('BELOW_RATING_THRESHOLD');
    });
  });
});
