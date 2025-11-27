import {
  users,
  consultants,
  hospitals,
  hospitalUnits,
  hospitalModules,
  hospitalStaff,
  projects,
  projectRequirements,
  projectSchedules,
  scheduleAssignments,
  consultantDocuments,
  documentTypes,
  consultantAvailability,
  consultantRatings,
  budgetCalculations,
  roiQuestions,
  roiSurveys,
  roiResponses,
  emailNotifications,
  contentAccessRules,
  contentAccessAudit,
  userActivities,
  notifications,
  projectPhases,
  projectTasks,
  projectMilestones,
  phaseDeliverables,
  projectRisks,
  teamRoleTemplates,
  projectTeamAssignments,
  onboardingTasks,
  goLiveSignIns,
  supportTickets,
  shiftHandoffs,
  type User,
  type UpsertUser,
  type Consultant,
  type InsertConsultant,
  type Hospital,
  type InsertHospital,
  type HospitalUnit,
  type InsertHospitalUnit,
  type HospitalModule,
  type InsertHospitalModule,
  type HospitalStaff,
  type InsertHospitalStaff,
  type Project,
  type InsertProject,
  type ProjectRequirement,
  type InsertProjectRequirement,
  type ProjectSchedule,
  type InsertProjectSchedule,
  type ScheduleAssignment,
  type InsertScheduleAssignment,
  type ConsultantDocument,
  type InsertConsultantDocument,
  type DocumentType,
  type InsertDocumentType,
  type ConsultantAvailability,
  type InsertConsultantAvailability,
  type ConsultantRating,
  type InsertConsultantRating,
  type BudgetCalculation,
  type InsertBudgetCalculation,
  type RoiQuestion,
  type InsertRoiQuestion,
  type RoiSurvey,
  type InsertRoiSurvey,
  type RoiResponse,
  type InsertRoiResponse,
  type EmailNotification,
  type InsertEmailNotification,
  type ContentAccessRule,
  type InsertContentAccessRule,
  type ContentAccessAuditLog,
  type InsertContentAccessAuditLog,
  type UserActivity,
  type InsertUserActivity,
  type Notification,
  type InsertNotification,
  type PlatformAnalytics,
  type HospitalAnalytics,
  type ConsultantAnalytics,
  type TrainingStatus,
  type ProjectPhase,
  type InsertProjectPhase,
  type ProjectTask,
  type InsertProjectTask,
  type ProjectMilestone,
  type InsertProjectMilestone,
  type PhaseDeliverable,
  type InsertPhaseDeliverable,
  type ProjectRisk,
  type InsertProjectRisk,
  type TeamRoleTemplate,
  type InsertTeamRoleTemplate,
  type ProjectTeamAssignment,
  type InsertProjectTeamAssignment,
  type OnboardingTask,
  type InsertOnboardingTask,
  type ProjectLifecycle,
  type OnboardingProgress,
  type GoLiveSignIn,
  type InsertGoLiveSignIn,
  type SupportTicket,
  type InsertSupportTicket,
  type ShiftHandoff,
  type InsertShiftHandoff,
  type GoLiveSignInWithDetails,
  type SupportTicketWithDetails,
  type ShiftHandoffWithDetails,
  type CommandCenterStats,
  EHR_IMPLEMENTATION_PHASES,
  NICEHR_TEAM_ROLES,
  HOSPITAL_TEAM_ROLES,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, or, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: "admin" | "hospital_staff" | "consultant"): Promise<User | undefined>;
  updateUserProfilePhoto(id: string, photoUrl: string): Promise<User | undefined>;
  updateUserCoverPhoto(id: string, coverPhotoUrl: string): Promise<User | undefined>;
  updateUser(id: string, userData: Partial<{ firstName: string; lastName: string; linkedinUrl: string; websiteUrl: string }>): Promise<User | undefined>;

  // Consultant operations
  getConsultant(id: string): Promise<Consultant | undefined>;
  getConsultantByUserId(userId: string): Promise<Consultant | undefined>;
  getOrCreateConsultantByUserId(userId: string): Promise<Consultant>;
  getAllConsultants(): Promise<Consultant[]>;
  createConsultant(consultant: InsertConsultant): Promise<Consultant>;
  updateConsultant(id: string, consultant: Partial<InsertConsultant>): Promise<Consultant | undefined>;
  searchConsultants(filters: ConsultantSearchFilters): Promise<Consultant[]>;

  // Hospital operations
  getHospital(id: string): Promise<Hospital | undefined>;
  getAllHospitals(): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: string, hospital: Partial<InsertHospital>): Promise<Hospital | undefined>;
  deleteHospital(id: string): Promise<boolean>;

  // Hospital Unit operations
  getHospitalUnit(id: string): Promise<HospitalUnit | undefined>;
  getHospitalUnits(hospitalId: string): Promise<HospitalUnit[]>;
  createHospitalUnit(unit: InsertHospitalUnit): Promise<HospitalUnit>;
  updateHospitalUnit(id: string, unit: Partial<InsertHospitalUnit>): Promise<HospitalUnit | undefined>;
  deleteHospitalUnit(id: string): Promise<boolean>;

  // Hospital Module operations
  getHospitalModule(id: string): Promise<HospitalModule | undefined>;
  getHospitalModules(unitId: string): Promise<HospitalModule[]>;
  createHospitalModule(module: InsertHospitalModule): Promise<HospitalModule>;
  updateHospitalModule(id: string, module: Partial<InsertHospitalModule>): Promise<HospitalModule | undefined>;
  deleteHospitalModule(id: string): Promise<boolean>;

  // Hospital Staff operations
  getHospitalStaff(id: string): Promise<HospitalStaff | undefined>;
  getHospitalStaffByUserId(userId: string): Promise<HospitalStaff | undefined>;
  getHospitalStaffByHospital(hospitalId: string): Promise<HospitalStaff[]>;
  createHospitalStaff(staff: InsertHospitalStaff): Promise<HospitalStaff>;
  updateHospitalStaff(id: string, staff: Partial<InsertHospitalStaff>): Promise<HospitalStaff | undefined>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByHospital(hospitalId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Project Requirement operations
  getProjectRequirements(projectId: string): Promise<ProjectRequirement[]>;
  createProjectRequirement(requirement: InsertProjectRequirement): Promise<ProjectRequirement>;
  deleteProjectRequirement(id: string): Promise<boolean>;

  // Schedule operations
  getProjectSchedules(projectId: string): Promise<ProjectSchedule[]>;
  getSchedule(id: string): Promise<ProjectSchedule | undefined>;
  createProjectSchedule(schedule: InsertProjectSchedule): Promise<ProjectSchedule>;
  updateScheduleStatus(id: string, status: "pending" | "approved" | "rejected", approvedBy?: string): Promise<ProjectSchedule | undefined>;

  // Schedule Assignment operations
  getScheduleAssignments(scheduleId: string): Promise<ScheduleAssignment[]>;
  getConsultantSchedules(consultantId: string): Promise<ScheduleAssignment[]>;
  createScheduleAssignment(assignment: InsertScheduleAssignment): Promise<ScheduleAssignment>;
  deleteScheduleAssignment(id: string): Promise<boolean>;

  // Document Type operations
  getAllDocumentTypes(): Promise<DocumentType[]>;
  getDocumentType(id: string): Promise<DocumentType | undefined>;
  createDocumentType(docType: InsertDocumentType): Promise<DocumentType>;

  // Consultant Document operations
  getConsultantDocuments(consultantId: string): Promise<ConsultantDocument[]>;
  createConsultantDocument(document: InsertConsultantDocument): Promise<ConsultantDocument>;
  updateDocumentStatus(id: string, status: "pending" | "approved" | "rejected" | "expired", reviewedBy?: string, notes?: string): Promise<ConsultantDocument | undefined>;

  // Consultant Availability operations
  getConsultantAvailability(consultantId: string): Promise<ConsultantAvailability[]>;
  createConsultantAvailability(availability: InsertConsultantAvailability): Promise<ConsultantAvailability>;
  deleteConsultantAvailability(id: string): Promise<boolean>;

  // Consultant Rating operations
  getConsultantRatings(consultantId: string): Promise<ConsultantRating[]>;
  createConsultantRating(rating: InsertConsultantRating): Promise<ConsultantRating>;

  // Budget Calculation operations
  getBudgetCalculation(projectId: string): Promise<BudgetCalculation | undefined>;
  createBudgetCalculation(calculation: InsertBudgetCalculation): Promise<BudgetCalculation>;
  updateBudgetCalculation(id: string, calculation: Partial<InsertBudgetCalculation>): Promise<BudgetCalculation | undefined>;

  // ROI operations
  getAllRoiQuestions(): Promise<RoiQuestion[]>;
  createRoiQuestion(question: InsertRoiQuestion): Promise<RoiQuestion>;
  getRoiSurveys(projectId: string): Promise<RoiSurvey[]>;
  createRoiSurvey(survey: InsertRoiSurvey): Promise<RoiSurvey>;
  getRoiResponses(surveyId: string): Promise<RoiResponse[]>;
  createRoiResponse(response: InsertRoiResponse): Promise<RoiResponse>;
  completeSurvey(surveyId: string): Promise<RoiSurvey | undefined>;

  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;

  // Directory operations
  searchConsultantsDirectory(params: DirectorySearchParams): Promise<ConsultantDirectoryResult>;
  getConsultantProfile(consultantId: string): Promise<ConsultantProfile | null>;

  // Account Settings operations
  getAccountSettings(userId: string): Promise<AccountSettingsResult | null>;
  updateAccountSettings(userId: string, settings: AccountSettingsUpdate): Promise<User | undefined>;
  requestAccountDeletion(userId: string): Promise<User | undefined>;
  cancelAccountDeletion(userId: string): Promise<User | undefined>;

  // Email Notification operations
  createEmailNotification(notification: Omit<InsertEmailNotification, 'id' | 'createdAt'>): Promise<EmailNotification>;
  getEmailNotifications(limit?: number, userId?: string): Promise<EmailNotification[]>;
  getEmailNotificationStats(): Promise<{ sent: number; failed: number; total: number }>;

  // Content Access Rule operations
  getAllAccessRules(): Promise<ContentAccessRule[]>;
  getAccessRule(id: string): Promise<ContentAccessRule | undefined>;
  getAccessRuleByResource(resourceType: "page" | "api" | "feature", resourceKey: string): Promise<ContentAccessRule | undefined>;
  createAccessRule(rule: Omit<InsertContentAccessRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentAccessRule>;
  updateAccessRule(id: string, rule: Partial<InsertContentAccessRule>): Promise<ContentAccessRule | undefined>;
  deleteAccessRule(id: string): Promise<boolean>;
  
  // Content Access Audit operations
  logAccessAttempt(audit: Omit<InsertContentAccessAuditLog, 'id' | 'createdAt'>): Promise<ContentAccessAuditLog>;
  getAccessAuditLogs(limit?: number, ruleId?: string): Promise<ContentAccessAuditLog[]>;

  // User Activity operations
  logUserActivity(activity: Omit<InsertUserActivity, 'id' | 'createdAt'>): Promise<UserActivity>;
  getUserActivities(userId: string, limit?: number): Promise<UserActivity[]>;
  getRecentActivities(limit?: number): Promise<UserActivityWithUser[]>;
  getActivityStats(userId?: string): Promise<ActivityStats>;

  // Notification operations
  createNotification(notification: Omit<InsertNotification, 'id' | 'createdAt'>): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<number>;
  deleteNotification(id: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Analytics operations
  getPlatformAnalytics(): Promise<PlatformAnalytics>;
  getHospitalAnalytics(hospitalId: string): Promise<HospitalAnalytics | null>;
  getConsultantAnalytics(consultantId: string): Promise<ConsultantAnalytics | null>;
  getTrainingStatus(consultantId: string): Promise<TrainingStatus | null>;

  // ============================================
  // PHASE 8: PROJECT LIFECYCLE & ONBOARDING
  // ============================================

  // Project Phase operations
  getProjectPhases(projectId: string): Promise<ProjectPhase[]>;
  getProjectPhase(id: string): Promise<ProjectPhase | undefined>;
  createProjectPhase(phase: InsertProjectPhase): Promise<ProjectPhase>;
  updateProjectPhase(id: string, phase: Partial<InsertProjectPhase>): Promise<ProjectPhase | undefined>;
  initializeProjectPhases(projectId: string): Promise<ProjectPhase[]>;

  // Project Task operations
  getProjectTasks(projectId: string, phaseId?: string): Promise<ProjectTask[]>;
  getProjectTask(id: string): Promise<ProjectTask | undefined>;
  createProjectTask(task: InsertProjectTask): Promise<ProjectTask>;
  updateProjectTask(id: string, task: Partial<InsertProjectTask>): Promise<ProjectTask | undefined>;
  deleteProjectTask(id: string): Promise<boolean>;

  // Project Milestone operations
  getProjectMilestones(projectId: string): Promise<ProjectMilestone[]>;
  getProjectMilestone(id: string): Promise<ProjectMilestone | undefined>;
  createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone>;
  updateProjectMilestone(id: string, milestone: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined>;
  deleteProjectMilestone(id: string): Promise<boolean>;

  // Phase Deliverable operations
  getPhaseDeliverables(phaseId: string): Promise<PhaseDeliverable[]>;
  createPhaseDeliverable(deliverable: InsertPhaseDeliverable): Promise<PhaseDeliverable>;
  updatePhaseDeliverable(id: string, deliverable: Partial<InsertPhaseDeliverable>): Promise<PhaseDeliverable | undefined>;

  // Project Risk operations
  getProjectRisks(projectId: string): Promise<ProjectRisk[]>;
  getProjectRisk(id: string): Promise<ProjectRisk | undefined>;
  createProjectRisk(risk: InsertProjectRisk): Promise<ProjectRisk>;
  updateProjectRisk(id: string, risk: Partial<InsertProjectRisk>): Promise<ProjectRisk | undefined>;
  deleteProjectRisk(id: string): Promise<boolean>;

  // Team Role Template operations
  getAllTeamRoleTemplates(): Promise<TeamRoleTemplate[]>;
  getTeamRoleTemplatesByCategory(category: "nicehr" | "hospital"): Promise<TeamRoleTemplate[]>;
  createTeamRoleTemplate(template: InsertTeamRoleTemplate): Promise<TeamRoleTemplate>;
  initializeTeamRoleTemplates(): Promise<TeamRoleTemplate[]>;

  // Project Team Assignment operations
  getProjectTeamAssignments(projectId: string): Promise<ProjectTeamAssignment[]>;
  createProjectTeamAssignment(assignment: InsertProjectTeamAssignment): Promise<ProjectTeamAssignment>;
  updateProjectTeamAssignment(id: string, assignment: Partial<InsertProjectTeamAssignment>): Promise<ProjectTeamAssignment | undefined>;
  deleteProjectTeamAssignment(id: string): Promise<boolean>;

  // Onboarding Task operations
  getOnboardingTasks(consultantId: string): Promise<OnboardingTask[]>;
  getOnboardingTask(id: string): Promise<OnboardingTask | undefined>;
  createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask>;
  updateOnboardingTask(id: string, task: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined>;
  initializeOnboardingTasks(consultantId: string): Promise<OnboardingTask[]>;
  getOnboardingProgress(consultantId: string): Promise<OnboardingProgress | null>;
  getPendingOnboardingReviews(): Promise<OnboardingTask[]>;

  // Project Lifecycle (combined view)
  getProjectLifecycle(projectId: string): Promise<ProjectLifecycle | null>;

  // ============================================
  // PHASE 9: GO-LIVE COMMAND CENTER
  // ============================================

  // Go-Live Sign-In operations
  getGoLiveSignIns(projectId: string): Promise<GoLiveSignIn[]>;
  getGoLiveSignIn(id: string): Promise<GoLiveSignIn | undefined>;
  getActiveSignIns(projectId: string): Promise<GoLiveSignInWithDetails[]>;
  getTodaySignIns(projectId: string): Promise<GoLiveSignIn[]>;
  createGoLiveSignIn(signIn: InsertGoLiveSignIn): Promise<GoLiveSignIn>;
  updateGoLiveSignIn(id: string, signIn: Partial<InsertGoLiveSignIn>): Promise<GoLiveSignIn | undefined>;
  signOutConsultant(id: string): Promise<GoLiveSignIn | undefined>;

  // Support Ticket operations
  getSupportTickets(projectId: string): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getOpenTickets(projectId: string): Promise<SupportTicketWithDetails[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  assignTicket(id: string, consultantId: string): Promise<SupportTicket | undefined>;
  resolveTicket(id: string, resolution: string): Promise<SupportTicket | undefined>;
  escalateTicket(id: string): Promise<SupportTicket | undefined>;

  // Shift Handoff operations
  getShiftHandoffs(projectId: string): Promise<ShiftHandoff[]>;
  getShiftHandoff(id: string): Promise<ShiftHandoff | undefined>;
  getPendingHandoffs(projectId: string): Promise<ShiftHandoffWithDetails[]>;
  createShiftHandoff(handoff: InsertShiftHandoff): Promise<ShiftHandoff>;
  updateShiftHandoff(id: string, handoff: Partial<InsertShiftHandoff>): Promise<ShiftHandoff | undefined>;
  acknowledgeHandoff(id: string, incomingConsultantId: string): Promise<ShiftHandoff | undefined>;

  // Command Center Stats
  getCommandCenterStats(projectId: string): Promise<CommandCenterStats>;
}

export interface ConsultantSearchFilters {
  location?: string;
  modules?: string[];
  units?: string[];
  emrSystems?: string[];
  shiftPreference?: "day" | "night" | "swing";
  isAvailable?: boolean;
  isOnboarded?: boolean;
}

export interface DashboardStats {
  totalConsultants: number;
  activeConsultants: number;
  totalHospitals: number;
  activeProjects: number;
  pendingDocuments: number;
  totalSavings: string;
}

export interface DirectorySearchParams {
  search?: string;
  emrSystems?: string[];
  availability?: 'available' | 'unavailable' | 'all';
  experienceMin?: number;
  experienceMax?: number;
  modules?: string[];
  shiftPreference?: string;
  sortBy?: 'name' | 'experience' | 'location' | 'rating';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ConsultantDirectoryItem {
  id: string;
  tngId: string | null;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  location: string | null;
  emrSystems: string[];
  modules: string[];
  yearsExperience: number;
  isAvailable: boolean;
  shiftPreference: string | null;
  averageRating: number | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
}

export interface ConsultantDirectoryResult {
  consultants: ConsultantDirectoryItem[];
  totalCount: number;
  availableEmrSystems: string[];
  availableModules: string[];
}

export interface ConsultantProfile {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    coverPhotoUrl: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
  };
  consultant: Consultant;
  documents: {
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    total: number;
  };
  ratings: {
    averageOverall: number | null;
    averageMannerism: number | null;
    averageProfessionalism: number | null;
    averageKnowledge: number | null;
    count: number;
  };
}

export interface AccountSettingsResult {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "admin" | "hospital_staff" | "consultant";
  profileVisibility: "public" | "members_only" | "private";
  emailNotifications: boolean;
  showEmail: boolean;
  showPhone: boolean;
  deletionRequestedAt: Date | null;
  createdAt: Date | null;
}

export interface AccountSettingsUpdate {
  profileVisibility?: "public" | "members_only" | "private";
  emailNotifications?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
}

export interface UserActivityWithUser {
  id: string;
  userId: string;
  activityType: string;
  resourceType: string | null;
  resourceId: string | null;
  resourceName: string | null;
  description: string | null;
  createdAt: Date | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    role: string;
  };
}

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  byType: Record<string, number>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (userData.email) {
      const existingByEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
      
      if (existingByEmail.length > 0 && existingByEmail[0].id !== userData.id) {
        const [updated] = await db
          .update(users)
          .set({
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.email, userData.email))
          .returning();
        return updated;
      }
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: "admin" | "hospital_staff" | "consultant"): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfilePhoto(id: string, photoUrl: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ profileImageUrl: photoUrl, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserCoverPhoto(id: string, coverPhotoUrl: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ coverPhotoUrl: coverPhotoUrl, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<{ firstName: string; lastName: string; linkedinUrl: string; websiteUrl: string }>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Consultant operations
  async getConsultant(id: string): Promise<Consultant | undefined> {
    const [consultant] = await db.select().from(consultants).where(eq(consultants.id, id));
    return consultant;
  }

  async getConsultantByUserId(userId: string): Promise<Consultant | undefined> {
    const [consultant] = await db.select().from(consultants).where(eq(consultants.userId, userId));
    return consultant;
  }

  async getOrCreateConsultantByUserId(userId: string): Promise<Consultant> {
    const existing = await this.getConsultantByUserId(userId);
    if (existing) {
      return existing;
    }
    const tngId = `TNG-${Date.now().toString(36).toUpperCase()}`;
    const [newConsultant] = await db
      .insert(consultants)
      .values({ userId, tngId })
      .returning();
    return newConsultant;
  }

  async getAllConsultants(): Promise<Consultant[]> {
    return await db.select().from(consultants).orderBy(desc(consultants.createdAt));
  }

  async createConsultant(consultant: InsertConsultant): Promise<Consultant> {
    const tngId = `TNG-${Date.now().toString(36).toUpperCase()}`;
    const [newConsultant] = await db
      .insert(consultants)
      .values({ ...consultant, tngId })
      .returning();
    return newConsultant;
  }

  async updateConsultant(id: string, consultant: Partial<InsertConsultant>): Promise<Consultant | undefined> {
    const [updated] = await db
      .update(consultants)
      .set({ ...consultant, updatedAt: new Date() })
      .where(eq(consultants.id, id))
      .returning();
    return updated;
  }

  async searchConsultants(filters: ConsultantSearchFilters): Promise<Consultant[]> {
    let query = db.select().from(consultants);
    const conditions = [];

    if (filters.location) {
      conditions.push(ilike(consultants.location, `%${filters.location}%`));
    }
    if (filters.shiftPreference) {
      conditions.push(eq(consultants.shiftPreference, filters.shiftPreference));
    }
    if (filters.isAvailable !== undefined) {
      conditions.push(eq(consultants.isAvailable, filters.isAvailable));
    }
    if (filters.isOnboarded !== undefined) {
      conditions.push(eq(consultants.isOnboarded, filters.isOnboarded));
    }

    if (conditions.length > 0) {
      return await db.select().from(consultants).where(and(...conditions));
    }
    return await db.select().from(consultants);
  }

  // Hospital operations
  async getHospital(id: string): Promise<Hospital | undefined> {
    const [hospital] = await db.select().from(hospitals).where(eq(hospitals.id, id));
    return hospital;
  }

  async getAllHospitals(): Promise<Hospital[]> {
    return await db.select().from(hospitals).orderBy(desc(hospitals.createdAt));
  }

  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const [newHospital] = await db.insert(hospitals).values(hospital).returning();
    return newHospital;
  }

  async updateHospital(id: string, hospital: Partial<InsertHospital>): Promise<Hospital | undefined> {
    const [updated] = await db
      .update(hospitals)
      .set({ ...hospital, updatedAt: new Date() })
      .where(eq(hospitals.id, id))
      .returning();
    return updated;
  }

  async deleteHospital(id: string): Promise<boolean> {
    const result = await db.delete(hospitals).where(eq(hospitals.id, id));
    return true;
  }

  // Hospital Unit operations
  async getHospitalUnit(id: string): Promise<HospitalUnit | undefined> {
    const [unit] = await db.select().from(hospitalUnits).where(eq(hospitalUnits.id, id));
    return unit;
  }

  async getHospitalUnits(hospitalId: string): Promise<HospitalUnit[]> {
    return await db.select().from(hospitalUnits).where(eq(hospitalUnits.hospitalId, hospitalId));
  }

  async createHospitalUnit(unit: InsertHospitalUnit): Promise<HospitalUnit> {
    const [newUnit] = await db.insert(hospitalUnits).values(unit).returning();
    return newUnit;
  }

  async updateHospitalUnit(id: string, unit: Partial<InsertHospitalUnit>): Promise<HospitalUnit | undefined> {
    const [updated] = await db
      .update(hospitalUnits)
      .set(unit)
      .where(eq(hospitalUnits.id, id))
      .returning();
    return updated;
  }

  async deleteHospitalUnit(id: string): Promise<boolean> {
    await db.delete(hospitalUnits).where(eq(hospitalUnits.id, id));
    return true;
  }

  // Hospital Module operations
  async getHospitalModule(id: string): Promise<HospitalModule | undefined> {
    const [module] = await db.select().from(hospitalModules).where(eq(hospitalModules.id, id));
    return module;
  }

  async getHospitalModules(unitId: string): Promise<HospitalModule[]> {
    return await db.select().from(hospitalModules).where(eq(hospitalModules.unitId, unitId));
  }

  async createHospitalModule(module: InsertHospitalModule): Promise<HospitalModule> {
    const [newModule] = await db.insert(hospitalModules).values(module).returning();
    return newModule;
  }

  async updateHospitalModule(id: string, module: Partial<InsertHospitalModule>): Promise<HospitalModule | undefined> {
    const [updated] = await db
      .update(hospitalModules)
      .set(module)
      .where(eq(hospitalModules.id, id))
      .returning();
    return updated;
  }

  async deleteHospitalModule(id: string): Promise<boolean> {
    await db.delete(hospitalModules).where(eq(hospitalModules.id, id));
    return true;
  }

  // Hospital Staff operations
  async getHospitalStaff(id: string): Promise<HospitalStaff | undefined> {
    const [staff] = await db.select().from(hospitalStaff).where(eq(hospitalStaff.id, id));
    return staff;
  }

  async getHospitalStaffByUserId(userId: string): Promise<HospitalStaff | undefined> {
    const [staff] = await db.select().from(hospitalStaff).where(eq(hospitalStaff.userId, userId));
    return staff;
  }

  async getHospitalStaffByHospital(hospitalId: string): Promise<HospitalStaff[]> {
    return await db.select().from(hospitalStaff).where(eq(hospitalStaff.hospitalId, hospitalId));
  }

  async createHospitalStaff(staff: InsertHospitalStaff): Promise<HospitalStaff> {
    const [newStaff] = await db.insert(hospitalStaff).values(staff).returning();
    return newStaff;
  }

  async updateHospitalStaff(id: string, staff: Partial<InsertHospitalStaff>): Promise<HospitalStaff | undefined> {
    const [updated] = await db
      .update(hospitalStaff)
      .set({ ...staff, updatedAt: new Date() })
      .where(eq(hospitalStaff.id, id))
      .returning();
    return updated;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectsByHospital(hospitalId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.hospitalId, hospitalId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Project Requirement operations
  async getProjectRequirements(projectId: string): Promise<ProjectRequirement[]> {
    return await db.select().from(projectRequirements).where(eq(projectRequirements.projectId, projectId));
  }

  async createProjectRequirement(requirement: InsertProjectRequirement): Promise<ProjectRequirement> {
    const [newReq] = await db.insert(projectRequirements).values(requirement).returning();
    return newReq;
  }

  async deleteProjectRequirement(id: string): Promise<boolean> {
    await db.delete(projectRequirements).where(eq(projectRequirements.id, id));
    return true;
  }

  // Schedule operations
  async getProjectSchedules(projectId: string): Promise<ProjectSchedule[]> {
    return await db.select().from(projectSchedules).where(eq(projectSchedules.projectId, projectId));
  }

  async getSchedule(id: string): Promise<ProjectSchedule | undefined> {
    const [schedule] = await db.select().from(projectSchedules).where(eq(projectSchedules.id, id));
    return schedule;
  }

  async createProjectSchedule(schedule: InsertProjectSchedule): Promise<ProjectSchedule> {
    const [newSchedule] = await db.insert(projectSchedules).values(schedule).returning();
    return newSchedule;
  }

  async updateScheduleStatus(id: string, status: "pending" | "approved" | "rejected", approvedBy?: string): Promise<ProjectSchedule | undefined> {
    const [updated] = await db
      .update(projectSchedules)
      .set({
        status,
        approvedBy,
        approvedAt: status === "approved" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(projectSchedules.id, id))
      .returning();
    return updated;
  }

  // Schedule Assignment operations
  async getScheduleAssignments(scheduleId: string): Promise<ScheduleAssignment[]> {
    return await db.select().from(scheduleAssignments).where(eq(scheduleAssignments.scheduleId, scheduleId));
  }

  async getConsultantSchedules(consultantId: string): Promise<ScheduleAssignment[]> {
    return await db.select().from(scheduleAssignments).where(eq(scheduleAssignments.consultantId, consultantId));
  }

  async createScheduleAssignment(assignment: InsertScheduleAssignment): Promise<ScheduleAssignment> {
    const [newAssignment] = await db.insert(scheduleAssignments).values(assignment).returning();
    return newAssignment;
  }

  async deleteScheduleAssignment(id: string): Promise<boolean> {
    await db.delete(scheduleAssignments).where(eq(scheduleAssignments.id, id));
    return true;
  }

  // Document Type operations
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    return await db.select().from(documentTypes);
  }

  async getDocumentType(id: string): Promise<DocumentType | undefined> {
    const [docType] = await db.select().from(documentTypes).where(eq(documentTypes.id, id));
    return docType;
  }

  async createDocumentType(docType: InsertDocumentType): Promise<DocumentType> {
    const [newDocType] = await db.insert(documentTypes).values(docType).returning();
    return newDocType;
  }

  // Consultant Document operations
  async getConsultantDocuments(consultantId: string): Promise<ConsultantDocument[]> {
    return await db.select().from(consultantDocuments).where(eq(consultantDocuments.consultantId, consultantId));
  }

  async createConsultantDocument(document: InsertConsultantDocument): Promise<ConsultantDocument> {
    const [newDoc] = await db.insert(consultantDocuments).values(document).returning();
    return newDoc;
  }

  async updateDocumentStatus(id: string, status: "pending" | "approved" | "rejected" | "expired", reviewedBy?: string, notes?: string): Promise<ConsultantDocument | undefined> {
    const [updated] = await db
      .update(consultantDocuments)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        notes,
        updatedAt: new Date(),
      })
      .where(eq(consultantDocuments.id, id))
      .returning();
    return updated;
  }

  // Consultant Availability operations
  async getConsultantAvailability(consultantId: string): Promise<ConsultantAvailability[]> {
    return await db.select().from(consultantAvailability).where(eq(consultantAvailability.consultantId, consultantId));
  }

  async createConsultantAvailability(availability: InsertConsultantAvailability): Promise<ConsultantAvailability> {
    const [newAvail] = await db.insert(consultantAvailability).values(availability).returning();
    return newAvail;
  }

  async deleteConsultantAvailability(id: string): Promise<boolean> {
    await db.delete(consultantAvailability).where(eq(consultantAvailability.id, id));
    return true;
  }

  // Consultant Rating operations
  async getConsultantRatings(consultantId: string): Promise<ConsultantRating[]> {
    return await db.select().from(consultantRatings).where(eq(consultantRatings.consultantId, consultantId));
  }

  async createConsultantRating(rating: InsertConsultantRating): Promise<ConsultantRating> {
    const [newRating] = await db.insert(consultantRatings).values(rating).returning();
    return newRating;
  }

  // Budget Calculation operations
  async getBudgetCalculation(projectId: string): Promise<BudgetCalculation | undefined> {
    const [calc] = await db.select().from(budgetCalculations).where(eq(budgetCalculations.projectId, projectId));
    return calc;
  }

  async createBudgetCalculation(calculation: InsertBudgetCalculation): Promise<BudgetCalculation> {
    const [newCalc] = await db.insert(budgetCalculations).values(calculation).returning();
    return newCalc;
  }

  async updateBudgetCalculation(id: string, calculation: Partial<InsertBudgetCalculation>): Promise<BudgetCalculation | undefined> {
    const [updated] = await db
      .update(budgetCalculations)
      .set(calculation)
      .where(eq(budgetCalculations.id, id))
      .returning();
    return updated;
  }

  // ROI operations
  async getAllRoiQuestions(): Promise<RoiQuestion[]> {
    return await db.select().from(roiQuestions).where(eq(roiQuestions.isActive, true)).orderBy(asc(roiQuestions.orderIndex));
  }

  async createRoiQuestion(question: InsertRoiQuestion): Promise<RoiQuestion> {
    const [newQuestion] = await db.insert(roiQuestions).values(question).returning();
    return newQuestion;
  }

  async getRoiSurveys(projectId: string): Promise<RoiSurvey[]> {
    return await db.select().from(roiSurveys).where(eq(roiSurveys.projectId, projectId));
  }

  async createRoiSurvey(survey: InsertRoiSurvey): Promise<RoiSurvey> {
    const [newSurvey] = await db.insert(roiSurveys).values(survey).returning();
    return newSurvey;
  }

  async getRoiResponses(surveyId: string): Promise<RoiResponse[]> {
    return await db.select().from(roiResponses).where(eq(roiResponses.surveyId, surveyId));
  }

  async createRoiResponse(response: InsertRoiResponse): Promise<RoiResponse> {
    const [newResponse] = await db.insert(roiResponses).values(response).returning();
    return newResponse;
  }

  async completeSurvey(surveyId: string): Promise<RoiSurvey | undefined> {
    const [updated] = await db
      .update(roiSurveys)
      .set({ isComplete: true, completedAt: new Date() })
      .where(eq(roiSurveys.id, surveyId))
      .returning();
    return updated;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    const [consultantCount] = await db.select({ count: sql<number>`count(*)` }).from(consultants);
    const [activeConsultantCount] = await db.select({ count: sql<number>`count(*)` }).from(consultants).where(eq(consultants.isAvailable, true));
    const [hospitalCount] = await db.select({ count: sql<number>`count(*)` }).from(hospitals);
    const [activeProjectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "active"));
    const [pendingDocCount] = await db.select({ count: sql<number>`count(*)` }).from(consultantDocuments).where(eq(consultantDocuments.status, "pending"));
    const [savingsSum] = await db.select({ total: sql<string>`COALESCE(SUM(total_savings), 0)` }).from(budgetCalculations);

    return {
      totalConsultants: Number(consultantCount?.count || 0),
      activeConsultants: Number(activeConsultantCount?.count || 0),
      totalHospitals: Number(hospitalCount?.count || 0),
      activeProjects: Number(activeProjectCount?.count || 0),
      pendingDocuments: Number(pendingDocCount?.count || 0),
      totalSavings: savingsSum?.total || "0",
    };
  }

  // Directory operations
  async searchConsultantsDirectory(params: DirectorySearchParams): Promise<ConsultantDirectoryResult> {
    const {
      search,
      emrSystems: filterEmrSystems,
      availability,
      experienceMin,
      experienceMax,
      modules: filterModules,
      shiftPreference,
      sortBy = 'name',
      order = 'asc',
      page = 1,
      pageSize = 12,
    } = params;

    const conditions: any[] = [];

    // Filter out private profiles from directory search
    // Only show public and members_only profiles (all authenticated users are "members")
    conditions.push(
      or(
        eq(users.profileVisibility, 'public'),
        eq(users.profileVisibility, 'members_only')
      )
    );

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern),
          ilike(consultants.tngId, searchPattern),
          ilike(consultants.location, searchPattern),
          sql`EXISTS (SELECT 1 FROM unnest(${consultants.emrSystems}) AS emr WHERE emr ILIKE ${searchPattern})`
        )
      );
    }

    if (availability === 'available') {
      conditions.push(eq(consultants.isAvailable, true));
    } else if (availability === 'unavailable') {
      conditions.push(eq(consultants.isAvailable, false));
    }

    if (experienceMin !== undefined) {
      conditions.push(gte(consultants.yearsExperience, experienceMin));
    }

    if (experienceMax !== undefined) {
      conditions.push(lte(consultants.yearsExperience, experienceMax));
    }

    if (shiftPreference && shiftPreference !== 'all' && shiftPreference !== 'both') {
      conditions.push(eq(consultants.shiftPreference, shiftPreference as "day" | "night" | "swing"));
    }

    if (filterEmrSystems && filterEmrSystems.length > 0) {
      conditions.push(
        sql`${consultants.emrSystems} && ARRAY[${sql.join(filterEmrSystems.map(e => sql`${e}`), sql`, `)}]::text[]`
      );
    }

    if (filterModules && filterModules.length > 0) {
      conditions.push(
        sql`${consultants.modules} && ARRAY[${sql.join(filterModules.map(m => sql`${m}`), sql`, `)}]::text[]`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const avgRatingSubquery = db
      .select({
        consultantId: consultantRatings.consultantId,
        avgRating: sql<number>`AVG(${consultantRatings.overallRating})`.as('avg_rating'),
      })
      .from(consultantRatings)
      .groupBy(consultantRatings.consultantId)
      .as('ratings_agg');

    let orderByClause;
    const isDesc = order === 'desc';
    switch (sortBy) {
      case 'experience':
        orderByClause = isDesc ? desc(consultants.yearsExperience) : asc(consultants.yearsExperience);
        break;
      case 'location':
        orderByClause = isDesc ? desc(consultants.location) : asc(consultants.location);
        break;
      case 'rating':
        orderByClause = isDesc ? desc(avgRatingSubquery.avgRating) : asc(avgRatingSubquery.avgRating);
        break;
      case 'name':
      default:
        orderByClause = isDesc 
          ? desc(sql`COALESCE(${users.lastName}, '') || ' ' || COALESCE(${users.firstName}, '')`) 
          : asc(sql`COALESCE(${users.lastName}, '') || ' ' || COALESCE(${users.firstName}, '')`);
        break;
    }

    const offset = (page - 1) * pageSize;

    const consultantsQuery = db
      .select({
        id: consultants.id,
        tngId: consultants.tngId,
        userId: consultants.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        location: consultants.location,
        emrSystems: consultants.emrSystems,
        modules: consultants.modules,
        yearsExperience: consultants.yearsExperience,
        isAvailable: consultants.isAvailable,
        shiftPreference: consultants.shiftPreference,
        averageRating: avgRatingSubquery.avgRating,
        linkedinUrl: sql<string | null>`COALESCE(${consultants.linkedinUrl}, ${users.linkedinUrl})`,
        websiteUrl: sql<string | null>`COALESCE(${consultants.websiteUrl}, ${users.websiteUrl})`,
      })
      .from(consultants)
      .innerJoin(users, eq(consultants.userId, users.id))
      .leftJoin(avgRatingSubquery, eq(consultants.id, avgRatingSubquery.consultantId))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(consultants)
      .innerJoin(users, eq(consultants.userId, users.id))
      .where(whereClause);

    const totalCount = Number(countResult?.count || 0);

    const consultantsResult = await consultantsQuery;

    const allEmrSystems = await db
      .select({ emrSystem: sql<string>`unnest(${consultants.emrSystems})` })
      .from(consultants)
      .where(sql`${consultants.emrSystems} IS NOT NULL AND array_length(${consultants.emrSystems}, 1) > 0`);

    const allModules = await db
      .select({ module: sql<string>`unnest(${consultants.modules})` })
      .from(consultants)
      .where(sql`${consultants.modules} IS NOT NULL AND array_length(${consultants.modules}, 1) > 0`);

    const availableEmrSystems = Array.from(new Set(allEmrSystems.map(r => r.emrSystem).filter(Boolean))).sort();
    const availableModules = Array.from(new Set(allModules.map(r => r.module).filter(Boolean))).sort();

    const formattedConsultants: ConsultantDirectoryItem[] = consultantsResult.map(c => ({
      id: c.id,
      tngId: c.tngId,
      userId: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      profileImageUrl: c.profileImageUrl,
      location: c.location,
      emrSystems: c.emrSystems || [],
      modules: c.modules || [],
      yearsExperience: c.yearsExperience || 0,
      isAvailable: c.isAvailable,
      shiftPreference: c.shiftPreference,
      averageRating: c.averageRating ? Number(c.averageRating) : null,
      linkedinUrl: c.linkedinUrl as string | null,
      websiteUrl: c.websiteUrl as string | null,
    }));

    return {
      consultants: formattedConsultants,
      totalCount,
      availableEmrSystems,
      availableModules,
    };
  }

  async getConsultantProfile(consultantId: string): Promise<ConsultantProfile | null> {
    const [result] = await db
      .select({
        consultant: consultants,
        user: users,
      })
      .from(consultants)
      .innerJoin(users, eq(consultants.userId, users.id))
      .where(eq(consultants.id, consultantId));

    if (!result) {
      return null;
    }

    const documentStats = await db
      .select({
        status: consultantDocuments.status,
        count: sql<number>`count(*)`,
      })
      .from(consultantDocuments)
      .where(eq(consultantDocuments.consultantId, consultantId))
      .groupBy(consultantDocuments.status);

    const docCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      total: 0,
    };

    documentStats.forEach(stat => {
      const count = Number(stat.count);
      docCounts[stat.status as keyof typeof docCounts] = count;
      docCounts.total += count;
    });

    const [ratingStats] = await db
      .select({
        avgOverall: sql<number>`AVG(${consultantRatings.overallRating})`,
        avgMannerism: sql<number>`AVG(${consultantRatings.mannerism})`,
        avgProfessionalism: sql<number>`AVG(${consultantRatings.professionalism})`,
        avgKnowledge: sql<number>`AVG(${consultantRatings.knowledge})`,
        count: sql<number>`count(*)`,
      })
      .from(consultantRatings)
      .where(eq(consultantRatings.consultantId, consultantId));

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        profileImageUrl: result.user.profileImageUrl,
        coverPhotoUrl: result.user.coverPhotoUrl,
        linkedinUrl: result.user.linkedinUrl,
        websiteUrl: result.user.websiteUrl,
      },
      consultant: result.consultant,
      documents: docCounts,
      ratings: {
        averageOverall: ratingStats?.avgOverall ? Number(ratingStats.avgOverall) : null,
        averageMannerism: ratingStats?.avgMannerism ? Number(ratingStats.avgMannerism) : null,
        averageProfessionalism: ratingStats?.avgProfessionalism ? Number(ratingStats.avgProfessionalism) : null,
        averageKnowledge: ratingStats?.avgKnowledge ? Number(ratingStats.avgKnowledge) : null,
        count: Number(ratingStats?.count || 0),
      },
    };
  }

  // Account Settings operations
  async getAccountSettings(userId: string): Promise<AccountSettingsResult | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      profileVisibility: user.profileVisibility,
      emailNotifications: user.emailNotifications,
      showEmail: user.showEmail,
      showPhone: user.showPhone,
      deletionRequestedAt: user.deletionRequestedAt,
      createdAt: user.createdAt,
    };
  }

  async updateAccountSettings(userId: string, settings: AccountSettingsUpdate): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async requestAccountDeletion(userId: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        deletionRequestedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async cancelAccountDeletion(userId: string): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({
        deletionRequestedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // Email notification operations
  async createEmailNotification(notification: Omit<InsertEmailNotification, 'id' | 'createdAt'>): Promise<EmailNotification> {
    const [created] = await db
      .insert(emailNotifications)
      .values(notification)
      .returning();
    return created;
  }

  async getEmailNotifications(limit: number = 100, userId?: string): Promise<EmailNotification[]> {
    if (userId) {
      return db
        .select()
        .from(emailNotifications)
        .where(eq(emailNotifications.userId, userId))
        .orderBy(desc(emailNotifications.createdAt))
        .limit(limit);
    }
    return db
      .select()
      .from(emailNotifications)
      .orderBy(desc(emailNotifications.createdAt))
      .limit(limit);
  }

  async getEmailNotificationStats(): Promise<{ sent: number; failed: number; total: number }> {
    const [stats] = await db
      .select({
        sent: sql<number>`COUNT(*) FILTER (WHERE status = 'sent')`,
        failed: sql<number>`COUNT(*) FILTER (WHERE status = 'failed')`,
        total: sql<number>`COUNT(*)`,
      })
      .from(emailNotifications);
    return {
      sent: Number(stats?.sent || 0),
      failed: Number(stats?.failed || 0),
      total: Number(stats?.total || 0),
    };
  }

  // Content Access Rule operations
  async getAllAccessRules(): Promise<ContentAccessRule[]> {
    return db
      .select()
      .from(contentAccessRules)
      .orderBy(desc(contentAccessRules.createdAt));
  }

  async getAccessRule(id: string): Promise<ContentAccessRule | undefined> {
    const [rule] = await db
      .select()
      .from(contentAccessRules)
      .where(eq(contentAccessRules.id, id));
    return rule;
  }

  async getAccessRuleByResource(
    resourceType: "page" | "api" | "feature",
    resourceKey: string
  ): Promise<ContentAccessRule | undefined> {
    const [rule] = await db
      .select()
      .from(contentAccessRules)
      .where(
        and(
          eq(contentAccessRules.resourceType, resourceType),
          eq(contentAccessRules.resourceKey, resourceKey),
          eq(contentAccessRules.isActive, true)
        )
      );
    return rule;
  }

  async createAccessRule(
    rule: Omit<InsertContentAccessRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ContentAccessRule> {
    const [created] = await db
      .insert(contentAccessRules)
      .values(rule)
      .returning();
    return created;
  }

  async updateAccessRule(
    id: string,
    rule: Partial<InsertContentAccessRule>
  ): Promise<ContentAccessRule | undefined> {
    const [updated] = await db
      .update(contentAccessRules)
      .set({
        ...rule,
        updatedAt: new Date(),
      })
      .where(eq(contentAccessRules.id, id))
      .returning();
    return updated;
  }

  async deleteAccessRule(id: string): Promise<boolean> {
    await db.delete(contentAccessRules).where(eq(contentAccessRules.id, id));
    return true;
  }

  // Content Access Audit operations
  async logAccessAttempt(
    audit: Omit<InsertContentAccessAuditLog, 'id' | 'createdAt'>
  ): Promise<ContentAccessAuditLog> {
    const [created] = await db
      .insert(contentAccessAudit)
      .values(audit)
      .returning();
    return created;
  }

  async getAccessAuditLogs(limit: number = 100, ruleId?: string): Promise<ContentAccessAuditLog[]> {
    if (ruleId) {
      return db
        .select()
        .from(contentAccessAudit)
        .where(eq(contentAccessAudit.ruleId, ruleId))
        .orderBy(desc(contentAccessAudit.createdAt))
        .limit(limit);
    }
    return db
      .select()
      .from(contentAccessAudit)
      .orderBy(desc(contentAccessAudit.createdAt))
      .limit(limit);
  }

  // User Activity operations
  async logUserActivity(
    activity: Omit<InsertUserActivity, 'id' | 'createdAt'>
  ): Promise<UserActivity> {
    const [created] = await db
      .insert(userActivities)
      .values(activity)
      .returning();
    return created;
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
    return db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);
  }

  async getRecentActivities(limit: number = 50): Promise<UserActivityWithUser[]> {
    const results = await db
      .select({
        id: userActivities.id,
        userId: userActivities.userId,
        activityType: userActivities.activityType,
        resourceType: userActivities.resourceType,
        resourceId: userActivities.resourceId,
        resourceName: userActivities.resourceName,
        description: userActivities.description,
        createdAt: userActivities.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
      })
      .from(userActivities)
      .leftJoin(users, eq(userActivities.userId, users.id))
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);

    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      activityType: r.activityType,
      resourceType: r.resourceType,
      resourceId: r.resourceId,
      resourceName: r.resourceName,
      description: r.description,
      createdAt: r.createdAt,
      user: {
        firstName: r.firstName,
        lastName: r.lastName,
        profileImageUrl: r.profileImageUrl,
        role: r.role || 'consultant',
      },
    }));
  }

  async getActivityStats(userId?: string): Promise<ActivityStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const baseCondition = userId ? eq(userActivities.userId, userId) : undefined;

    const [totalResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userActivities)
      .where(baseCondition);

    const [todayResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userActivities)
      .where(
        baseCondition
          ? and(baseCondition, gte(userActivities.createdAt, startOfDay))
          : gte(userActivities.createdAt, startOfDay)
      );

    const [weekResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userActivities)
      .where(
        baseCondition
          ? and(baseCondition, gte(userActivities.createdAt, startOfWeek))
          : gte(userActivities.createdAt, startOfWeek)
      );

    const byTypeResults = await db
      .select({
        activityType: userActivities.activityType,
        count: sql<number>`COUNT(*)`,
      })
      .from(userActivities)
      .where(baseCondition)
      .groupBy(userActivities.activityType);

    const byType: Record<string, number> = {};
    for (const row of byTypeResults) {
      byType[row.activityType] = Number(row.count);
    }

    return {
      totalActivities: Number(totalResult?.count || 0),
      todayActivities: Number(todayResult?.count || 0),
      weekActivities: Number(weekResult?.count || 0),
      byType,
    };
  }

  // Notification operations
  async createNotification(
    notification: Omit<InsertNotification, 'id' | 'createdAt'>
  ): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  async getUserNotifications(
    userId: string,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }
    return db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsRead(userId: string): Promise<number> {
    const result = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.rowCount || 0;
  }

  async deleteNotification(id: string): Promise<boolean> {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result?.count || 0);
  }

  // ============================================
  // ANALYTICS OPERATIONS
  // ============================================

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    // Overview counts
    const [consultantCounts] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(*) FILTER (WHERE ${consultants.isAvailable} = true)`,
        onboarded: sql<number>`COUNT(*) FILTER (WHERE ${consultants.isOnboarded} = true)`,
      })
      .from(consultants);

    const [hospitalCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(hospitals);

    const [projectCounts] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(*) FILTER (WHERE ${projects.status} = 'active')`,
        draft: sql<number>`COUNT(*) FILTER (WHERE ${projects.status} = 'draft')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${projects.status} = 'completed')`,
        cancelled: sql<number>`COUNT(*) FILTER (WHERE ${projects.status} = 'cancelled')`,
      })
      .from(projects);

    const [userCounts] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        admin: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'admin')`,
        hospital_staff: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'hospital_staff')`,
        consultant: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'consultant')`,
      })
      .from(users);

    const [documentCounts] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        approved: sql<number>`COUNT(*) FILTER (WHERE ${consultantDocuments.status} = 'approved')`,
        pending: sql<number>`COUNT(*) FILTER (WHERE ${consultantDocuments.status} = 'pending')`,
        rejected: sql<number>`COUNT(*) FILTER (WHERE ${consultantDocuments.status} = 'rejected')`,
        expired: sql<number>`COUNT(*) FILTER (WHERE ${consultantDocuments.status} = 'expired')`,
      })
      .from(consultantDocuments);

    // Total savings from budget calculations
    const [savingsResult] = await db
      .select({
        totalSavings: sql<string>`COALESCE(SUM(${budgetCalculations.totalSavings}), 0)`,
      })
      .from(budgetCalculations);

    // Activity trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityTrend = await db
      .select({
        date: sql<string>`DATE(${userActivities.createdAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(userActivities)
      .where(gte(userActivities.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${userActivities.createdAt})`)
      .orderBy(sql`DATE(${userActivities.createdAt})`);

    // Recent activity breakdown (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await db
      .select({
        date: sql<string>`DATE(${userActivities.createdAt})`,
        logins: sql<number>`COUNT(*) FILTER (WHERE ${userActivities.activityType} = 'login')`,
        actions: sql<number>`COUNT(*) FILTER (WHERE ${userActivities.activityType} != 'login')`,
      })
      .from(userActivities)
      .where(gte(userActivities.createdAt, sevenDaysAgo))
      .groupBy(sql`DATE(${userActivities.createdAt})`)
      .orderBy(sql`DATE(${userActivities.createdAt})`);

    const totalDocs = Number(documentCounts?.total || 0);
    const approvedDocs = Number(documentCounts?.approved || 0);
    const complianceRate = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

    return {
      overview: {
        totalConsultants: Number(consultantCounts?.total || 0),
        activeConsultants: Number(consultantCounts?.active || 0),
        totalHospitals: Number(hospitalCount?.count || 0),
        activeHospitals: Number(hospitalCount?.count || 0),
        totalProjects: Number(projectCounts?.total || 0),
        activeProjects: Number(projectCounts?.active || 0),
        totalUsers: Number(userCounts?.total || 0),
        totalSavings: savingsResult?.totalSavings || "0",
      },
      consultantsByStatus: {
        onboarded: Number(consultantCounts?.onboarded || 0),
        pending: Number(consultantCounts?.total || 0) - Number(consultantCounts?.onboarded || 0),
        available: Number(consultantCounts?.active || 0),
        unavailable: Number(consultantCounts?.total || 0) - Number(consultantCounts?.active || 0),
      },
      projectsByStatus: {
        draft: Number(projectCounts?.draft || 0),
        active: Number(projectCounts?.active || 0),
        completed: Number(projectCounts?.completed || 0),
        cancelled: Number(projectCounts?.cancelled || 0),
      },
      documentCompliance: {
        approved: Number(documentCounts?.approved || 0),
        pending: Number(documentCounts?.pending || 0),
        rejected: Number(documentCounts?.rejected || 0),
        expired: Number(documentCounts?.expired || 0),
        total: totalDocs,
        complianceRate,
      },
      activityTrend: activityTrend.map(row => ({
        date: String(row.date),
        count: Number(row.count),
      })),
      usersByRole: {
        admin: Number(userCounts?.admin || 0),
        hospital_staff: Number(userCounts?.hospital_staff || 0),
        consultant: Number(userCounts?.consultant || 0),
      },
      recentActivity: recentActivity.map(row => ({
        date: String(row.date),
        logins: Number(row.logins),
        actions: Number(row.actions),
      })),
    };
  }

  async getHospitalAnalytics(hospitalId: string): Promise<HospitalAnalytics | null> {
    const hospital = await this.getHospital(hospitalId);
    if (!hospital) return null;

    // Get all projects for this hospital
    const hospitalProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.hospitalId, hospitalId));

    const [projectStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`COUNT(*) FILTER (WHERE ${projects.status} = 'active')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${projects.status} = 'completed')`,
        totalBudget: sql<string>`COALESCE(SUM(${projects.estimatedBudget}), 0)`,
      })
      .from(projects)
      .where(eq(projects.hospitalId, hospitalId));

    // Get budget calculations for this hospital's projects
    const projectIds = hospitalProjects.map(p => p.id);
    let totalSavings = 0;
    let laborSavings = 0;
    let benefitsSavings = 0;
    let overheadSavings = 0;

    if (projectIds.length > 0) {
      const budgetCalcs = await db
        .select()
        .from(budgetCalculations)
        .where(sql`${budgetCalculations.projectId} = ANY(ARRAY[${sql.raw(projectIds.map(id => `'${id}'`).join(','))}]::varchar[])`);

      for (const calc of budgetCalcs) {
        totalSavings += Number(calc.totalSavings || 0);
        // Estimate breakdown from total costs
        const totalCost = Number(calc.totalEstimatedCost || 0);
        laborSavings += totalCost * 0.5 * 0.3; // 50% is labor, save 30%
        benefitsSavings += totalCost * 0.2; // 20% is benefits
        overheadSavings += totalCost * 0.1 * 0.2; // 10% is overhead, save 20%
      }
    }

    // Project breakdown
    const projectBreakdown = await Promise.all(
      hospitalProjects.map(async (project) => {
        const [assignmentCount] = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${scheduleAssignments.consultantId})` })
          .from(scheduleAssignments)
          .innerJoin(projectSchedules, eq(scheduleAssignments.scheduleId, projectSchedules.id))
          .where(eq(projectSchedules.projectId, project.id));

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          budget: String(project.estimatedBudget || 0),
          spent: String(project.actualBudget || 0),
          consultantsAssigned: Number(assignmentCount?.count || 0),
          startDate: project.startDate,
          endDate: project.endDate,
        };
      })
    );

    // Get consultant performance for this hospital
    const consultantPerformance: HospitalAnalytics['consultantPerformance'] = [];
    // This would require more complex joins - simplified for now

    // Monthly spending (last 12 months) - simplified
    const monthlySpending: HospitalAnalytics['monthlySpending'] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlySpending.push({
        month: month.toISOString().slice(0, 7),
        amount: 0, // Would need actual spending data
      });
    }

    // Calculate average ROI
    const totalBudget = Number(projectStats?.totalBudget || 0);
    const averageRoi = totalBudget > 0 ? Math.round((totalSavings / totalBudget) * 100) : 0;

    return {
      hospitalId,
      hospitalName: hospital.name,
      overview: {
        totalProjects: Number(projectStats?.total || 0),
        activeProjects: Number(projectStats?.active || 0),
        completedProjects: Number(projectStats?.completed || 0),
        totalBudget: String(totalBudget),
        totalSpent: "0",
        totalSavings: String(totalSavings),
        averageRoi,
      },
      projectBreakdown,
      consultantPerformance,
      monthlySpending,
      savingsBreakdown: {
        laborSavings: String(Math.round(laborSavings)),
        benefitsSavings: String(Math.round(benefitsSavings)),
        overheadSavings: String(Math.round(overheadSavings)),
        totalSavings: String(Math.round(totalSavings)),
      },
    };
  }

  async getConsultantAnalytics(consultantId: string): Promise<ConsultantAnalytics | null> {
    const consultant = await this.getConsultant(consultantId);
    if (!consultant) return null;

    const user = await this.getUser(consultant.userId);
    const consultantName = user 
      ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown"
      : "Unknown";

    // Get schedule assignments
    const assignments = await db
      .select()
      .from(scheduleAssignments)
      .where(eq(scheduleAssignments.consultantId, consultantId));

    const now = new Date();
    // Count assignments - scheduleAssignments doesn't have status, use count of all
    const completedShifts = assignments.length;
    const upcomingShifts = 0; // Would need to join with schedules to check dates

    // Get ratings
    const ratings = await this.getConsultantRatings(consultantId);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / ratings.length
      : 0;

    // Get documents
    const documents = await db
      .select()
      .from(consultantDocuments)
      .leftJoin(documentTypes, eq(consultantDocuments.documentTypeId, documentTypes.id))
      .where(eq(consultantDocuments.consultantId, consultantId));

    const docCounts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      expired: 0,
      expiringSoon: 0,
    };

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringDocuments: ConsultantAnalytics['expiringDocuments'] = [];

    for (const doc of documents) {
      const status = doc.consultant_documents.status;
      if (status === 'approved') docCounts.approved++;
      else if (status === 'pending') docCounts.pending++;
      else if (status === 'rejected') docCounts.rejected++;
      else if (status === 'expired') docCounts.expired++;

      if (doc.consultant_documents.expirationDate) {
        const expDate = new Date(doc.consultant_documents.expirationDate);
        if (expDate <= thirtyDaysFromNow && expDate > now) {
          docCounts.expiringSoon++;
          const daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          expiringDocuments.push({
            id: doc.consultant_documents.id,
            name: doc.consultant_documents.fileName || "Unknown",
            typeName: doc.document_types?.name || "Unknown",
            expirationDate: doc.consultant_documents.expirationDate,
            daysUntilExpiry,
          });
        }
      }
    }

    const totalDocs = documents.length;
    const complianceRate = totalDocs > 0 ? Math.round((docCounts.approved / totalDocs) * 100) : 0;

    // Calculate utilization (simplified)
    const utilizationRate = assignments.length > 0 ? Math.min(100, assignments.length * 10) : 0;

    // Earnings by month (simplified - would need actual payment data)
    const earningsByMonth: ConsultantAnalytics['earningsByMonth'] = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      earningsByMonth.push({
        month: month.toISOString().slice(0, 7),
        amount: 0, // Would need actual payment tracking
      });
    }

    // Shift history
    const shiftHistory: ConsultantAnalytics['shiftHistory'] = [];
    // Would need to join with schedules and projects

    // Skills utilization from EMR systems
    const skillsUtilization: ConsultantAnalytics['skillsUtilization'] = 
      (consultant.emrSystems || []).map(skill => ({
        skill,
        projectsUsed: Math.floor(Math.random() * 5), // Simplified
      }));

    return {
      consultantId,
      consultantName,
      overview: {
        totalShifts: assignments.length,
        completedShifts,
        upcomingShifts,
        totalEarnings: String(Number(consultant.payRate || 0) * completedShifts * 8), // Simplified
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length,
        utilizationRate,
      },
      documentStatus: {
        ...docCounts,
        total: totalDocs,
        complianceRate,
      },
      expiringDocuments: expiringDocuments.slice(0, 5),
      earningsByMonth,
      shiftHistory,
      skillsUtilization,
    };
  }

  async getTrainingStatus(consultantId: string): Promise<TrainingStatus | null> {
    const consultant = await this.getConsultant(consultantId);
    if (!consultant) return null;

    // Get all required document types
    const allDocTypes = await db
      .select()
      .from(documentTypes)
      .where(eq(documentTypes.isRequired, true));

    // Get consultant's documents
    const consultantDocs = await db
      .select()
      .from(consultantDocuments)
      .where(eq(consultantDocuments.consultantId, consultantId));

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let nextRenewalDate: string | null = null;
    let compliantCount = 0;

    const requiredDocuments: TrainingStatus['requiredDocuments'] = allDocTypes.map(docType => {
      const doc = consultantDocs.find(d => d.documentTypeId === docType.id);
      
      let status: TrainingStatus['requiredDocuments'][0]['status'] = 'missing';
      let expirationDate: string | null = null;
      let daysUntilExpiry: number | null = null;

      if (doc) {
        if (doc.status === 'approved') {
          if (doc.expirationDate) {
            const expDate = new Date(doc.expirationDate);
            expirationDate = doc.expirationDate;
            daysUntilExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (expDate < now) {
              status = 'expired';
            } else if (expDate <= thirtyDaysFromNow) {
              status = 'expiring_soon';
              if (!nextRenewalDate || expDate.toISOString() < nextRenewalDate) {
                nextRenewalDate = expDate.toISOString().split('T')[0];
              }
            } else {
              status = 'approved';
              compliantCount++;
            }
          } else {
            status = 'approved';
            compliantCount++;
          }
        } else if (doc.status === 'pending') {
          status = 'pending';
        } else if (doc.status === 'expired') {
          status = 'expired';
        }
      }

      return {
        typeId: docType.id,
        typeName: docType.name,
        isRequired: docType.isRequired,
        status,
        expirationDate,
        daysUntilExpiry,
      };
    });

    const complianceScore = allDocTypes.length > 0 
      ? Math.round((compliantCount / allDocTypes.length) * 100) 
      : 100;

    let overallStatus: TrainingStatus['overallStatus'] = 'compliant';
    if (complianceScore < 50) {
      overallStatus = 'non_compliant';
    } else if (complianceScore < 100) {
      overallStatus = 'action_required';
    }

    return {
      consultantId,
      requiredDocuments,
      complianceScore,
      nextRenewalDate,
      overallStatus,
    };
  }

  // ============================================
  // PHASE 8: PROJECT LIFECYCLE & ONBOARDING
  // ============================================

  // Project Phase operations
  async getProjectPhases(projectId: string): Promise<ProjectPhase[]> {
    return await db
      .select()
      .from(projectPhases)
      .where(eq(projectPhases.projectId, projectId))
      .orderBy(asc(projectPhases.phaseNumber));
  }

  async getProjectPhase(id: string): Promise<ProjectPhase | undefined> {
    const results = await db.select().from(projectPhases).where(eq(projectPhases.id, id));
    return results[0];
  }

  async createProjectPhase(phase: InsertProjectPhase): Promise<ProjectPhase> {
    const results = await db.insert(projectPhases).values(phase).returning();
    return results[0];
  }

  async updateProjectPhase(id: string, phase: Partial<InsertProjectPhase>): Promise<ProjectPhase | undefined> {
    const results = await db
      .update(projectPhases)
      .set({ ...phase, updatedAt: new Date() })
      .where(eq(projectPhases.id, id))
      .returning();
    return results[0];
  }

  async initializeProjectPhases(projectId: string): Promise<ProjectPhase[]> {
    const existingPhases = await this.getProjectPhases(projectId);
    if (existingPhases.length > 0) {
      return existingPhases;
    }

    const phasesToCreate = EHR_IMPLEMENTATION_PHASES.map((phase) => ({
      projectId,
      phaseName: phase.name,
      phaseNumber: phase.number,
      description: phase.description,
      status: "not_started" as const,
      completionPercentage: 0,
    }));

    const createdPhases: ProjectPhase[] = [];
    for (const phase of phasesToCreate) {
      const created = await this.createProjectPhase(phase);
      createdPhases.push(created);
    }

    return createdPhases;
  }

  // Project Task operations
  async getProjectTasks(projectId: string, phaseId?: string): Promise<ProjectTask[]> {
    if (phaseId) {
      return await db
        .select()
        .from(projectTasks)
        .where(and(eq(projectTasks.projectId, projectId), eq(projectTasks.phaseId, phaseId)))
        .orderBy(asc(projectTasks.orderIndex));
    }
    return await db
      .select()
      .from(projectTasks)
      .where(eq(projectTasks.projectId, projectId))
      .orderBy(asc(projectTasks.orderIndex));
  }

  async getProjectTask(id: string): Promise<ProjectTask | undefined> {
    const results = await db.select().from(projectTasks).where(eq(projectTasks.id, id));
    return results[0];
  }

  async createProjectTask(task: InsertProjectTask): Promise<ProjectTask> {
    const results = await db.insert(projectTasks).values(task).returning();
    return results[0];
  }

  async updateProjectTask(id: string, task: Partial<InsertProjectTask>): Promise<ProjectTask | undefined> {
    const updateData: any = { ...task, updatedAt: new Date() };
    if (task.status === "completed" && !task.completedAt) {
      updateData.completedAt = new Date();
    }
    const results = await db
      .update(projectTasks)
      .set(updateData)
      .where(eq(projectTasks.id, id))
      .returning();
    return results[0];
  }

  async deleteProjectTask(id: string): Promise<boolean> {
    const results = await db.delete(projectTasks).where(eq(projectTasks.id, id)).returning();
    return results.length > 0;
  }

  // Project Milestone operations
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    return await db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, projectId))
      .orderBy(asc(projectMilestones.dueDate));
  }

  async getProjectMilestone(id: string): Promise<ProjectMilestone | undefined> {
    const results = await db.select().from(projectMilestones).where(eq(projectMilestones.id, id));
    return results[0];
  }

  async createProjectMilestone(milestone: InsertProjectMilestone): Promise<ProjectMilestone> {
    const results = await db.insert(projectMilestones).values(milestone).returning();
    return results[0];
  }

  async updateProjectMilestone(id: string, milestone: Partial<InsertProjectMilestone>): Promise<ProjectMilestone | undefined> {
    const results = await db
      .update(projectMilestones)
      .set({ ...milestone, updatedAt: new Date() })
      .where(eq(projectMilestones.id, id))
      .returning();
    return results[0];
  }

  async deleteProjectMilestone(id: string): Promise<boolean> {
    const results = await db.delete(projectMilestones).where(eq(projectMilestones.id, id)).returning();
    return results.length > 0;
  }

  // Phase Deliverable operations
  async getPhaseDeliverables(phaseId: string): Promise<PhaseDeliverable[]> {
    return await db
      .select()
      .from(phaseDeliverables)
      .where(eq(phaseDeliverables.phaseId, phaseId));
  }

  async createPhaseDeliverable(deliverable: InsertPhaseDeliverable): Promise<PhaseDeliverable> {
    const results = await db.insert(phaseDeliverables).values(deliverable).returning();
    return results[0];
  }

  async updatePhaseDeliverable(id: string, deliverable: Partial<InsertPhaseDeliverable>): Promise<PhaseDeliverable | undefined> {
    const results = await db
      .update(phaseDeliverables)
      .set({ ...deliverable, updatedAt: new Date() })
      .where(eq(phaseDeliverables.id, id))
      .returning();
    return results[0];
  }

  // Project Risk operations
  async getProjectRisks(projectId: string): Promise<ProjectRisk[]> {
    return await db
      .select()
      .from(projectRisks)
      .where(eq(projectRisks.projectId, projectId))
      .orderBy(desc(projectRisks.riskScore));
  }

  async getProjectRisk(id: string): Promise<ProjectRisk | undefined> {
    const results = await db.select().from(projectRisks).where(eq(projectRisks.id, id));
    return results[0];
  }

  async createProjectRisk(risk: InsertProjectRisk): Promise<ProjectRisk> {
    const probabilityScores = { low: 1, medium: 2, high: 3 };
    const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const riskScore = probabilityScores[risk.probability || 'medium'] * impactScores[risk.impact || 'medium'];
    
    const results = await db.insert(projectRisks).values({ ...risk, riskScore }).returning();
    return results[0];
  }

  async updateProjectRisk(id: string, risk: Partial<InsertProjectRisk>): Promise<ProjectRisk | undefined> {
    let riskScore: number | undefined;
    if (risk.probability || risk.impact) {
      const currentRisk = await this.getProjectRisk(id);
      if (currentRisk) {
        const probabilityScores = { low: 1, medium: 2, high: 3 };
        const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
        const prob = risk.probability || currentRisk.probability;
        const imp = risk.impact || currentRisk.impact;
        riskScore = probabilityScores[prob] * impactScores[imp];
      }
    }

    const updateData: any = { ...risk, updatedAt: new Date() };
    if (riskScore !== undefined) {
      updateData.riskScore = riskScore;
    }
    if (risk.status === "resolved" && !risk.resolvedDate) {
      updateData.resolvedDate = new Date().toISOString().split('T')[0];
    }

    const results = await db
      .update(projectRisks)
      .set(updateData)
      .where(eq(projectRisks.id, id))
      .returning();
    return results[0];
  }

  async deleteProjectRisk(id: string): Promise<boolean> {
    const results = await db.delete(projectRisks).where(eq(projectRisks.id, id)).returning();
    return results.length > 0;
  }

  // Team Role Template operations
  async getAllTeamRoleTemplates(): Promise<TeamRoleTemplate[]> {
    return await db
      .select()
      .from(teamRoleTemplates)
      .where(eq(teamRoleTemplates.isActive, true));
  }

  async getTeamRoleTemplatesByCategory(category: "nicehr" | "hospital"): Promise<TeamRoleTemplate[]> {
    return await db
      .select()
      .from(teamRoleTemplates)
      .where(and(eq(teamRoleTemplates.category, category), eq(teamRoleTemplates.isActive, true)));
  }

  async createTeamRoleTemplate(template: InsertTeamRoleTemplate): Promise<TeamRoleTemplate> {
    const results = await db.insert(teamRoleTemplates).values(template).returning();
    return results[0];
  }

  async initializeTeamRoleTemplates(): Promise<TeamRoleTemplate[]> {
    const existing = await this.getAllTeamRoleTemplates();
    if (existing.length > 0) {
      return existing;
    }

    const allRoles = [...NICEHR_TEAM_ROLES, ...HOSPITAL_TEAM_ROLES];
    const created: TeamRoleTemplate[] = [];

    for (const role of allRoles) {
      const template = await this.createTeamRoleTemplate({
        name: role.name,
        description: role.description,
        category: role.category,
        responsibilities: [],
        isActive: true,
      });
      created.push(template);
    }

    return created;
  }

  // Project Team Assignment operations
  async getProjectTeamAssignments(projectId: string): Promise<ProjectTeamAssignment[]> {
    return await db
      .select()
      .from(projectTeamAssignments)
      .where(eq(projectTeamAssignments.projectId, projectId));
  }

  async createProjectTeamAssignment(assignment: InsertProjectTeamAssignment): Promise<ProjectTeamAssignment> {
    const results = await db.insert(projectTeamAssignments).values(assignment).returning();
    return results[0];
  }

  async updateProjectTeamAssignment(id: string, assignment: Partial<InsertProjectTeamAssignment>): Promise<ProjectTeamAssignment | undefined> {
    const results = await db
      .update(projectTeamAssignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(projectTeamAssignments.id, id))
      .returning();
    return results[0];
  }

  async deleteProjectTeamAssignment(id: string): Promise<boolean> {
    const results = await db.delete(projectTeamAssignments).where(eq(projectTeamAssignments.id, id)).returning();
    return results.length > 0;
  }

  // Onboarding Task operations
  async getOnboardingTasks(consultantId: string): Promise<OnboardingTask[]> {
    return await db
      .select()
      .from(onboardingTasks)
      .where(eq(onboardingTasks.consultantId, consultantId))
      .orderBy(asc(onboardingTasks.orderIndex));
  }

  async getOnboardingTask(id: string): Promise<OnboardingTask | undefined> {
    const results = await db.select().from(onboardingTasks).where(eq(onboardingTasks.id, id));
    return results[0];
  }

  async createOnboardingTask(task: InsertOnboardingTask): Promise<OnboardingTask> {
    const results = await db.insert(onboardingTasks).values(task).returning();
    return results[0];
  }

  async updateOnboardingTask(id: string, task: Partial<InsertOnboardingTask>): Promise<OnboardingTask | undefined> {
    const results = await db
      .update(onboardingTasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(onboardingTasks.id, id))
      .returning();
    return results[0];
  }

  async initializeOnboardingTasks(consultantId: string): Promise<OnboardingTask[]> {
    const existingTasks = await this.getOnboardingTasks(consultantId);
    if (existingTasks.length > 0) {
      return existingTasks;
    }

    const allDocTypes = await this.getAllDocumentTypes();
    const now = new Date();
    const defaultDueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const tasksToCreate: InsertOnboardingTask[] = allDocTypes.map((docType, index) => ({
      consultantId,
      taskType: "document",
      title: `Upload ${docType.name}`,
      description: docType.description || `Please upload your ${docType.name}`,
      documentTypeId: docType.id,
      isRequired: docType.isRequired,
      status: "pending" as const,
      dueDate: defaultDueDate.toISOString().split('T')[0],
      orderIndex: index,
    }));

    tasksToCreate.push({
      consultantId,
      taskType: "profile",
      title: "Complete Profile Information",
      description: "Fill out all required profile fields including contact information and experience",
      isRequired: true,
      status: "pending" as const,
      dueDate: defaultDueDate.toISOString().split('T')[0],
      orderIndex: tasksToCreate.length,
    });

    const created: OnboardingTask[] = [];
    for (const task of tasksToCreate) {
      const result = await this.createOnboardingTask(task);
      created.push(result);
    }

    return created;
  }

  async getOnboardingProgress(consultantId: string): Promise<OnboardingProgress | null> {
    const consultant = await this.getConsultant(consultantId);
    if (!consultant) return null;

    const user = await this.getUser(consultant.userId);
    const tasks = await this.getOnboardingTasks(consultantId);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "approved").length;
    const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "submitted" || t.status === "under_review").length;
    const rejectedTasks = tasks.filter(t => t.status === "rejected").length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const pendingWithDue = tasks.filter(t => t.status !== "approved" && t.dueDate);
    const nextDueDate = pendingWithDue.length > 0 
      ? pendingWithDue.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0]?.dueDate || null
      : null;

    return {
      consultantId,
      consultantName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown',
      totalTasks,
      completedTasks,
      pendingTasks,
      rejectedTasks,
      progressPercentage,
      tasks,
      isComplete: completedTasks === totalTasks && totalTasks > 0,
      nextDueDate,
    };
  }

  async getPendingOnboardingReviews(): Promise<OnboardingTask[]> {
    return await db
      .select()
      .from(onboardingTasks)
      .where(or(
        eq(onboardingTasks.status, "submitted"),
        eq(onboardingTasks.status, "under_review")
      ))
      .orderBy(asc(onboardingTasks.submittedAt));
  }

  // Project Lifecycle (combined view)
  async getProjectLifecycle(projectId: string): Promise<ProjectLifecycle | null> {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const phases = await this.getProjectPhases(projectId);
    const milestones = await this.getProjectMilestones(projectId);
    const risks = await this.getProjectRisks(projectId);
    const teamAssignmentsRaw = await this.getProjectTeamAssignments(projectId);

    const phasesWithDetails = await Promise.all(
      phases.map(async (phase) => {
        const tasks = await this.getProjectTasks(projectId, phase.id);
        const deliverables = await this.getPhaseDeliverables(phase.id);
        return { ...phase, tasks, deliverables };
      })
    );

    const teamAssignments = await Promise.all(
      teamAssignmentsRaw.map(async (assignment) => {
        const user = await this.getUser(assignment.userId);
        let roleTemplate: TeamRoleTemplate | null = null;
        if (assignment.roleTemplateId) {
          const templates = await db
            .select()
            .from(teamRoleTemplates)
            .where(eq(teamRoleTemplates.id, assignment.roleTemplateId));
          roleTemplate = templates[0] || null;
        }
        return {
          ...assignment,
          user: {
            id: user?.id || '',
            firstName: user?.firstName || null,
            lastName: user?.lastName || null,
            email: user?.email || null,
            profileImageUrl: user?.profileImageUrl || null,
          },
          roleTemplate,
        };
      })
    );

    const completedPhases = phases.filter(p => p.status === "completed").length;
    const overallProgress = phases.length > 0 
      ? Math.round((completedPhases / phases.length) * 100) 
      : 0;

    return {
      projectId,
      projectName: project.name,
      phases: phasesWithDetails,
      milestones,
      risks,
      teamAssignments,
      overallProgress,
    };
  }

  // ============================================
  // PHASE 9: GO-LIVE COMMAND CENTER
  // ============================================

  // Go-Live Sign-In operations
  async getGoLiveSignIns(projectId: string): Promise<GoLiveSignIn[]> {
    return await db
      .select()
      .from(goLiveSignIns)
      .where(eq(goLiveSignIns.projectId, projectId))
      .orderBy(desc(goLiveSignIns.signInTime));
  }

  async getGoLiveSignIn(id: string): Promise<GoLiveSignIn | undefined> {
    const results = await db.select().from(goLiveSignIns).where(eq(goLiveSignIns.id, id));
    return results[0];
  }

  async getActiveSignIns(projectId: string): Promise<GoLiveSignInWithDetails[]> {
    const results = await db
      .select({
        signIn: goLiveSignIns,
        consultant: {
          id: consultants.id,
          userId: consultants.userId,
          tngId: consultants.tngId,
        },
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(goLiveSignIns)
      .innerJoin(consultants, eq(goLiveSignIns.consultantId, consultants.id))
      .innerJoin(users, eq(consultants.userId, users.id))
      .where(
        and(
          eq(goLiveSignIns.projectId, projectId),
          sql`${goLiveSignIns.signOutTime} IS NULL`,
          eq(goLiveSignIns.status, "checked_in")
        )
      )
      .orderBy(desc(goLiveSignIns.signInTime));

    return results.map((row) => ({
      ...row.signIn,
      consultant: row.consultant,
      user: row.user,
    }));
  }

  async getTodaySignIns(projectId: string): Promise<GoLiveSignIn[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await db
      .select()
      .from(goLiveSignIns)
      .where(
        and(
          eq(goLiveSignIns.projectId, projectId),
          gte(goLiveSignIns.signInTime, startOfDay),
          lte(goLiveSignIns.signInTime, endOfDay)
        )
      )
      .orderBy(desc(goLiveSignIns.signInTime));
  }

  async createGoLiveSignIn(signIn: InsertGoLiveSignIn): Promise<GoLiveSignIn> {
    const results = await db.insert(goLiveSignIns).values({
      ...signIn,
      signInTime: signIn.signInTime || new Date(),
    }).returning();
    return results[0];
  }

  async updateGoLiveSignIn(id: string, signIn: Partial<InsertGoLiveSignIn>): Promise<GoLiveSignIn | undefined> {
    const results = await db
      .update(goLiveSignIns)
      .set({ ...signIn, updatedAt: new Date() })
      .where(eq(goLiveSignIns.id, id))
      .returning();
    return results[0];
  }

  async signOutConsultant(id: string): Promise<GoLiveSignIn | undefined> {
    const results = await db
      .update(goLiveSignIns)
      .set({
        signOutTime: new Date(),
        status: "checked_out",
        updatedAt: new Date(),
      })
      .where(eq(goLiveSignIns.id, id))
      .returning();
    return results[0];
  }

  // Support Ticket operations
  async getSupportTickets(projectId: string): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.projectId, projectId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const results = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return results[0];
  }

  async getOpenTickets(projectId: string): Promise<SupportTicketWithDetails[]> {
    const results = await db
      .select({
        ticket: supportTickets,
        reportedBy: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.reportedById, users.id))
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          sql`${supportTickets.status} NOT IN ('resolved', 'closed')`
        )
      )
      .orderBy(desc(supportTickets.priority), desc(supportTickets.createdAt));

    const ticketsWithAssignee = await Promise.all(
      results.map(async (row) => {
        let assignedTo: SupportTicketWithDetails['assignedTo'] = null;
        
        if (row.ticket.assignedToId) {
          const consultant = await this.getConsultant(row.ticket.assignedToId);
          if (consultant) {
            const user = await this.getUser(consultant.userId);
            assignedTo = {
              id: consultant.id,
              user: {
                firstName: user?.firstName || null,
                lastName: user?.lastName || null,
              },
            };
          }
        }

        return {
          ...row.ticket,
          reportedBy: row.reportedBy,
          assignedTo,
        };
      })
    );

    return ticketsWithAssignee;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const ticketCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(eq(supportTickets.projectId, ticket.projectId));
    
    const nextNumber = (ticketCount[0]?.count || 0) + 1;
    const ticketNumber = `TKT-${ticket.projectId.substring(0, 8).toUpperCase()}-${String(nextNumber).padStart(4, '0')}`;

    const results = await db.insert(supportTickets).values({
      ...ticket,
      ticketNumber,
    }).returning();
    return results[0];
  }

  async updateSupportTicket(id: string, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const results = await db
      .update(supportTickets)
      .set({ ...ticket, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return results[0];
  }

  async assignTicket(id: string, consultantId: string): Promise<SupportTicket | undefined> {
    const existingTicket = await this.getSupportTicket(id);
    if (!existingTicket) return undefined;

    const now = new Date();
    const createdAt = existingTicket.createdAt || now;
    const responseTimeMinutes = Math.round((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60));

    const results = await db
      .update(supportTickets)
      .set({
        assignedToId: consultantId,
        status: "in_progress",
        responseTime: responseTimeMinutes,
        updatedAt: now,
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return results[0];
  }

  async resolveTicket(id: string, resolution: string): Promise<SupportTicket | undefined> {
    const existingTicket = await this.getSupportTicket(id);
    if (!existingTicket) return undefined;

    const now = new Date();
    const createdAt = existingTicket.createdAt || now;
    const resolutionTimeMinutes = Math.round((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60));

    const results = await db
      .update(supportTickets)
      .set({
        status: "resolved",
        resolution,
        resolvedAt: now,
        resolutionTime: resolutionTimeMinutes,
        updatedAt: now,
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return results[0];
  }

  async escalateTicket(id: string): Promise<SupportTicket | undefined> {
    const now = new Date();
    const results = await db
      .update(supportTickets)
      .set({
        status: "escalated",
        escalatedAt: now,
        updatedAt: now,
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return results[0];
  }

  // Shift Handoff operations
  async getShiftHandoffs(projectId: string): Promise<ShiftHandoff[]> {
    return await db
      .select()
      .from(shiftHandoffs)
      .where(eq(shiftHandoffs.projectId, projectId))
      .orderBy(desc(shiftHandoffs.createdAt));
  }

  async getShiftHandoff(id: string): Promise<ShiftHandoff | undefined> {
    const results = await db.select().from(shiftHandoffs).where(eq(shiftHandoffs.id, id));
    return results[0];
  }

  async getPendingHandoffs(projectId: string): Promise<ShiftHandoffWithDetails[]> {
    const results = await db
      .select({
        handoff: shiftHandoffs,
        outgoingConsultant: {
          id: consultants.id,
        },
      })
      .from(shiftHandoffs)
      .innerJoin(consultants, eq(shiftHandoffs.outgoingConsultantId, consultants.id))
      .where(
        and(
          eq(shiftHandoffs.projectId, projectId),
          sql`${shiftHandoffs.acknowledgedAt} IS NULL`,
          eq(shiftHandoffs.status, "pending")
        )
      )
      .orderBy(desc(shiftHandoffs.createdAt));

    const handoffsWithDetails = await Promise.all(
      results.map(async (row) => {
        const outgoingConsultant = await this.getConsultant(row.handoff.outgoingConsultantId);
        const outgoingUser = outgoingConsultant 
          ? await this.getUser(outgoingConsultant.userId)
          : null;

        let incomingConsultantDetails: ShiftHandoffWithDetails['incomingConsultant'] = null;
        if (row.handoff.incomingConsultantId) {
          const incomingConsultant = await this.getConsultant(row.handoff.incomingConsultantId);
          if (incomingConsultant) {
            const incomingUser = await this.getUser(incomingConsultant.userId);
            incomingConsultantDetails = {
              id: incomingConsultant.id,
              user: {
                firstName: incomingUser?.firstName || null,
                lastName: incomingUser?.lastName || null,
              },
            };
          }
        }

        return {
          ...row.handoff,
          outgoingConsultant: {
            id: outgoingConsultant?.id || '',
            user: {
              firstName: outgoingUser?.firstName || null,
              lastName: outgoingUser?.lastName || null,
            },
          },
          incomingConsultant: incomingConsultantDetails,
        };
      })
    );

    return handoffsWithDetails;
  }

  async createShiftHandoff(handoff: InsertShiftHandoff): Promise<ShiftHandoff> {
    const results = await db.insert(shiftHandoffs).values(handoff).returning();
    return results[0];
  }

  async updateShiftHandoff(id: string, handoff: Partial<InsertShiftHandoff>): Promise<ShiftHandoff | undefined> {
    const results = await db
      .update(shiftHandoffs)
      .set({ ...handoff, updatedAt: new Date() })
      .where(eq(shiftHandoffs.id, id))
      .returning();
    return results[0];
  }

  async acknowledgeHandoff(id: string, incomingConsultantId: string): Promise<ShiftHandoff | undefined> {
    const results = await db
      .update(shiftHandoffs)
      .set({
        incomingConsultantId,
        acknowledgedAt: new Date(),
        status: "acknowledged",
        updatedAt: new Date(),
      })
      .where(eq(shiftHandoffs.id, id))
      .returning();
    return results[0];
  }

  // Command Center Stats
  async getCommandCenterStats(projectId: string): Promise<CommandCenterStats> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const activeSignInsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(goLiveSignIns)
      .where(
        and(
          eq(goLiveSignIns.projectId, projectId),
          sql`${goLiveSignIns.signOutTime} IS NULL`,
          eq(goLiveSignIns.status, "checked_in")
        )
      );

    const checkedInTodayResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(goLiveSignIns)
      .where(
        and(
          eq(goLiveSignIns.projectId, projectId),
          gte(goLiveSignIns.signInTime, startOfDay),
          lte(goLiveSignIns.signInTime, endOfDay)
        )
      );

    const openTicketsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          sql`${supportTickets.status} NOT IN ('resolved', 'closed')`
        )
      );

    const criticalTicketsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          eq(supportTickets.priority, "critical"),
          sql`${supportTickets.status} NOT IN ('resolved', 'closed')`
        )
      );

    const pendingHandoffsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(shiftHandoffs)
      .where(
        and(
          eq(shiftHandoffs.projectId, projectId),
          sql`${shiftHandoffs.acknowledgedAt} IS NULL`,
          eq(shiftHandoffs.status, "pending")
        )
      );

    const avgResponseTimeResult = await db
      .select({ avg: sql<number>`AVG(${supportTickets.responseTime})` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          sql`${supportTickets.responseTime} IS NOT NULL`
        )
      );

    return {
      activeConsultants: Number(activeSignInsResult[0]?.count) || 0,
      checkedInToday: Number(checkedInTodayResult[0]?.count) || 0,
      openTickets: Number(openTicketsResult[0]?.count) || 0,
      criticalTickets: Number(criticalTicketsResult[0]?.count) || 0,
      pendingHandoffs: Number(pendingHandoffsResult[0]?.count) || 0,
      averageResponseTime: Math.round(Number(avgResponseTimeResult[0]?.avg) || 0),
    };
  }
}

export const storage = new DatabaseStorage();
