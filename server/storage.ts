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
  timesheets,
  timesheetEntries,
  availabilityBlocks,
  shiftSwapRequests,
  courses,
  courseModules,
  courseEnrollments,
  assessments,
  assessmentQuestions,
  assessmentAttempts,
  loginLabs,
  loginLabParticipants,
  knowledgeArticles,
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
  type Timesheet,
  type InsertTimesheet,
  type TimesheetEntry,
  type InsertTimesheetEntry,
  type AvailabilityBlock,
  type InsertAvailabilityBlock,
  type ShiftSwapRequest,
  type InsertShiftSwapRequest,
  type TimesheetWithDetails,
  type AvailabilityBlockWithDetails,
  type ShiftSwapRequestWithDetails,
  type Course,
  type InsertCourse,
  type CourseModule,
  type InsertCourseModule,
  type CourseEnrollment,
  type InsertCourseEnrollment,
  type Assessment,
  type InsertAssessment,
  type AssessmentQuestion,
  type InsertAssessmentQuestion,
  type AssessmentAttempt,
  type InsertAssessmentAttempt,
  type LoginLab,
  type InsertLoginLab,
  type LoginLabParticipant,
  type InsertLoginLabParticipant,
  type KnowledgeArticle,
  type InsertKnowledgeArticle,
  type CourseWithDetails,
  type CourseEnrollmentWithDetails,
  type AssessmentWithDetails,
  type AssessmentAttemptWithDetails,
  type LoginLabWithDetails,
  type LoginLabParticipantWithUser,
  type KnowledgeArticleWithDetails,
  type TrainingAnalytics,
  eodReports,
  escalationRules,
  ticketHistory,
  dataRetentionPolicies,
  ticketComments,
  type EodReport,
  type InsertEodReport,
  type EscalationRule,
  type InsertEscalationRule,
  type TicketHistory,
  type InsertTicketHistory,
  type DataRetentionPolicy,
  type InsertDataRetentionPolicy,
  type TicketComment,
  type InsertTicketComment,
  type EodReportWithDetails,
  type TicketHistoryWithDetails,
  type TicketCommentWithDetails,
  type SupportTicketWithHistory,
  type EodReportAnalytics,
  EHR_IMPLEMENTATION_PHASES,
  NICEHR_TEAM_ROLES,
  HOSPITAL_TEAM_ROLES,
  perDiemPolicies,
  mileageRates,
  expenses,
  invoiceTemplates,
  invoices,
  invoiceLineItems,
  payRates,
  payrollBatches,
  payrollEntries,
  paycheckStubs,
  budgetScenarios,
  scenarioMetrics,
  travelPreferences,
  travelBookings,
  travelItineraries,
  itineraryBookings,
  carpoolGroups,
  carpoolMembers,
  shuttleSchedules,
  transportationContacts,
  type PerDiemPolicy,
  type InsertPerDiemPolicy,
  type MileageRate,
  type InsertMileageRate,
  type Expense,
  type InsertExpense,
  type InvoiceTemplate,
  type InsertInvoiceTemplate,
  type Invoice,
  type InsertInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type PayRate,
  type InsertPayRate,
  type PayrollBatch,
  type InsertPayrollBatch,
  type PayrollEntry,
  type InsertPayrollEntry,
  type PaycheckStub,
  type InsertPaycheckStub,
  type BudgetScenario,
  type InsertBudgetScenario,
  type ScenarioMetric,
  type InsertScenarioMetric,
  type ExpenseWithDetails,
  type InvoiceWithDetails,
  type PayrollBatchWithDetails,
  type PayrollEntryWithDetails,
  type PaycheckStubWithDetails,
  type BudgetScenarioWithMetrics,
  type ExpenseAnalytics,
  type PayrollAnalytics,
  type TravelPreference,
  type InsertTravelPreference,
  type TravelBooking,
  type InsertTravelBooking,
  type TravelBookingWithDetails,
  type TravelItinerary,
  type InsertTravelItinerary,
  type TravelItineraryWithDetails,
  type ItineraryBooking,
  type InsertItineraryBooking,
  type CarpoolGroup,
  type InsertCarpoolGroup,
  type CarpoolGroupWithDetails,
  type CarpoolMember,
  type InsertCarpoolMember,
  type CarpoolMemberWithDetails,
  type ShuttleSchedule,
  type InsertShuttleSchedule,
  type TransportationContact,
  type InsertTransportationContact,
  type TravelAnalytics,
  type CarpoolAnalytics,
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

  // ============================================
  // PHASE 10: SCHEDULING & TIME MANAGEMENT
  // ============================================

  // Timesheet methods
  createTimesheet(data: InsertTimesheet): Promise<Timesheet>;
  getTimesheetById(id: string): Promise<TimesheetWithDetails | undefined>;
  getTimesheetsByConsultant(consultantId: string): Promise<TimesheetWithDetails[]>;
  getTimesheetsByProject(projectId: string): Promise<TimesheetWithDetails[]>;
  getPendingTimesheets(): Promise<TimesheetWithDetails[]>;
  updateTimesheet(id: string, data: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;
  submitTimesheet(id: string): Promise<Timesheet | undefined>;
  approveTimesheet(id: string, approverId: string): Promise<Timesheet | undefined>;
  rejectTimesheet(id: string, reason: string): Promise<Timesheet | undefined>;

  // Timesheet entry methods
  createTimesheetEntry(data: InsertTimesheetEntry): Promise<TimesheetEntry>;
  getTimesheetEntries(timesheetId: string): Promise<TimesheetEntry[]>;
  updateTimesheetEntry(id: string, data: Partial<InsertTimesheetEntry>): Promise<TimesheetEntry | undefined>;
  deleteTimesheetEntry(id: string): Promise<void>;
  clockIn(timesheetId: string, location?: string): Promise<TimesheetEntry>;
  clockOut(entryId: string): Promise<TimesheetEntry | undefined>;

  // Availability methods
  createAvailabilityBlock(data: InsertAvailabilityBlock): Promise<AvailabilityBlock>;
  getAvailabilityByConsultant(consultantId: string, startDate?: Date, endDate?: Date): Promise<AvailabilityBlock[]>;
  updateAvailabilityBlock(id: string, data: Partial<InsertAvailabilityBlock>): Promise<AvailabilityBlock | undefined>;
  deleteAvailabilityBlock(id: string): Promise<void>;

  // Shift swap methods
  createShiftSwapRequest(data: InsertShiftSwapRequest): Promise<ShiftSwapRequest>;
  getSwapRequestById(id: string): Promise<ShiftSwapRequestWithDetails | undefined>;
  getSwapRequestsByConsultant(consultantId: string): Promise<ShiftSwapRequestWithDetails[]>;
  getPendingSwapRequests(): Promise<ShiftSwapRequestWithDetails[]>;
  approveSwapRequest(id: string, responderId: string, notes?: string): Promise<ShiftSwapRequest | undefined>;
  rejectSwapRequest(id: string, responderId: string, notes?: string): Promise<ShiftSwapRequest | undefined>;
  cancelSwapRequest(id: string): Promise<ShiftSwapRequest | undefined>;

  // ============================================
  // PHASE 11: TRAINING & COMPETENCY
  // ============================================

  // Course operations
  createCourse(data: InsertCourse): Promise<Course>;
  getCourseById(id: string): Promise<CourseWithDetails | undefined>;
  getCourses(filters?: { status?: string; level?: string; courseType?: string; moduleId?: string }): Promise<CourseWithDetails[]>;
  updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;

  // Course Module operations
  createCourseModule(data: InsertCourseModule): Promise<CourseModule>;
  getCourseModules(courseId: string): Promise<CourseModule[]>;
  updateCourseModule(id: string, data: Partial<InsertCourseModule>): Promise<CourseModule | undefined>;
  deleteCourseModule(id: string): Promise<void>;

  // Enrollment operations
  enrollInCourse(data: InsertCourseEnrollment): Promise<CourseEnrollment>;
  getEnrollmentsByUser(userId: string): Promise<CourseEnrollmentWithDetails[]>;
  getEnrollmentsByCourse(courseId: string): Promise<CourseEnrollmentWithDetails[]>;
  updateEnrollmentProgress(id: string, data: { progressPercent?: number; status?: string; completedAt?: Date; ceCreditsEarned?: string; certificateUrl?: string }): Promise<CourseEnrollment | undefined>;
  dropFromCourse(id: string): Promise<CourseEnrollment | undefined>;

  // Assessment operations
  createAssessment(data: InsertAssessment): Promise<Assessment>;
  getAssessmentById(id: string): Promise<AssessmentWithDetails | undefined>;
  getAssessmentsByCourse(courseId: string): Promise<Assessment[]>;
  updateAssessment(id: string, data: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: string): Promise<void>;

  // Assessment Question operations
  createAssessmentQuestion(data: InsertAssessmentQuestion): Promise<AssessmentQuestion>;
  getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]>;
  updateAssessmentQuestion(id: string, data: Partial<InsertAssessmentQuestion>): Promise<AssessmentQuestion | undefined>;
  deleteAssessmentQuestion(id: string): Promise<void>;

  // Assessment Attempt operations
  startAssessmentAttempt(data: InsertAssessmentAttempt): Promise<AssessmentAttempt>;
  submitAssessmentAttempt(id: string, answers: any, score: number, passed: boolean): Promise<AssessmentAttempt | undefined>;
  getAttemptsByUser(userId: string): Promise<AssessmentAttemptWithDetails[]>;
  getAttemptsByAssessment(assessmentId: string): Promise<AssessmentAttemptWithDetails[]>;
  getAttemptCount(userId: string, assessmentId: string): Promise<number>;

  // Login Lab operations
  createLoginLab(data: InsertLoginLab): Promise<LoginLab>;
  getLoginLabById(id: string): Promise<LoginLabWithDetails | undefined>;
  getLoginLabs(filters?: { projectId?: string; hospitalId?: string; status?: string }): Promise<LoginLabWithDetails[]>;
  updateLoginLab(id: string, data: Partial<InsertLoginLab>): Promise<LoginLab | undefined>;
  deleteLoginLab(id: string): Promise<void>;

  // Login Lab Participant operations
  addParticipantToLab(data: InsertLoginLabParticipant): Promise<LoginLabParticipant>;
  getLabParticipants(loginLabId: string): Promise<LoginLabParticipantWithUser[]>;
  validateParticipantAccess(id: string): Promise<LoginLabParticipant | undefined>;
  completeParticipantLab(id: string, customizationNotes?: string): Promise<LoginLabParticipant | undefined>;

  // Knowledge Base operations
  createKnowledgeArticle(data: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  getArticleById(id: string): Promise<KnowledgeArticleWithDetails | undefined>;
  searchArticles(query: string, filters?: { category?: string; moduleId?: string; status?: string }): Promise<KnowledgeArticleWithDetails[]>;
  updateArticle(id: string, data: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle | undefined>;
  deleteArticle(id: string): Promise<void>;
  incrementArticleViews(id: string): Promise<void>;

  // Training Analytics
  getTrainingAnalytics(): Promise<TrainingAnalytics>;

  // ============================================
  // PHASE 13: FINANCIAL MANAGEMENT
  // ============================================

  // Per Diem Policy Operations
  listPerDiemPolicies(): Promise<PerDiemPolicy[]>;
  getPerDiemPolicy(id: string): Promise<PerDiemPolicy | undefined>;
  createPerDiemPolicy(policy: InsertPerDiemPolicy): Promise<PerDiemPolicy>;
  updatePerDiemPolicy(id: string, data: Partial<InsertPerDiemPolicy>): Promise<PerDiemPolicy | undefined>;
  deletePerDiemPolicy(id: string): Promise<void>;

  // Mileage Rate Operations
  listMileageRates(): Promise<MileageRate[]>;
  getMileageRate(id: string): Promise<MileageRate | undefined>;
  createMileageRate(rate: InsertMileageRate): Promise<MileageRate>;
  updateMileageRate(id: string, data: Partial<InsertMileageRate>): Promise<MileageRate | undefined>;
  deleteMileageRate(id: string): Promise<void>;

  // Expense Operations
  listExpenses(filters?: {
    consultantId?: string;
    projectId?: string;
    status?: string;
    category?: string;
  }): Promise<ExpenseWithDetails[]>;
  getExpense(id: string): Promise<ExpenseWithDetails | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined>;
  submitExpense(id: string): Promise<Expense | undefined>;
  approveExpense(id: string, reviewerId: string): Promise<Expense | undefined>;
  rejectExpense(id: string, reviewerId: string, reason?: string): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<void>;
  getExpenseAnalytics(): Promise<ExpenseAnalytics>;

  // Invoice Template Operations
  listInvoiceTemplates(): Promise<InvoiceTemplate[]>;
  getInvoiceTemplate(id: string): Promise<InvoiceTemplate | undefined>;
  createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate>;
  updateInvoiceTemplate(id: string, data: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined>;
  deleteInvoiceTemplate(id: string): Promise<void>;

  // Invoice Operations
  listInvoices(filters?: {
    projectId?: string;
    hospitalId?: string;
    status?: string;
  }): Promise<InvoiceWithDetails[]>;
  getInvoice(id: string): Promise<InvoiceWithDetails | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<void>;
  generateInvoiceFromTimesheet(timesheetId: string, templateId?: string): Promise<Invoice | undefined>;

  // Invoice Line Item Operations
  listInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]>;
  createInvoiceLineItem(item: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  updateInvoiceLineItem(id: string, data: Partial<InsertInvoiceLineItem>): Promise<InvoiceLineItem | undefined>;
  deleteInvoiceLineItem(id: string): Promise<void>;

  // Pay Rate Operations
  listPayRates(consultantId?: string): Promise<PayRate[]>;
  getPayRate(id: string): Promise<PayRate | undefined>;
  createPayRate(rate: InsertPayRate): Promise<PayRate>;
  updatePayRate(id: string, data: Partial<InsertPayRate>): Promise<PayRate | undefined>;
  getCurrentPayRate(consultantId: string): Promise<PayRate | undefined>;

  // Payroll Batch Operations
  listPayrollBatches(filters?: {
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<PayrollBatchWithDetails[]>;
  getPayrollBatch(id: string): Promise<PayrollBatchWithDetails | undefined>;
  createPayrollBatch(batch: InsertPayrollBatch): Promise<PayrollBatch>;
  updatePayrollBatch(id: string, data: Partial<InsertPayrollBatch>): Promise<PayrollBatch | undefined>;
  approvePayrollBatch(id: string, approverId: string): Promise<PayrollBatch | undefined>;
  processPayrollBatch(id: string): Promise<PayrollBatch | undefined>;

  // Payroll Entry Operations
  listPayrollEntries(batchId: string): Promise<PayrollEntryWithDetails[]>;
  createPayrollEntry(entry: InsertPayrollEntry): Promise<PayrollEntry>;
  updatePayrollEntry(id: string, data: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined>;

  // Paycheck Stub Operations
  listPaycheckStubs(consultantId: string): Promise<PaycheckStubWithDetails[]>;
  getPaycheckStub(id: string): Promise<PaycheckStubWithDetails | undefined>;
  createPaycheckStub(stub: InsertPaycheckStub): Promise<PaycheckStub>;

  // Payroll Analytics
  getPayrollAnalytics(): Promise<PayrollAnalytics>;

  // Budget Scenario Operations
  listBudgetScenarios(projectId?: string): Promise<BudgetScenarioWithMetrics[]>;
  getBudgetScenario(id: string): Promise<BudgetScenarioWithMetrics | undefined>;
  createBudgetScenario(scenario: InsertBudgetScenario): Promise<BudgetScenario>;
  updateBudgetScenario(id: string, data: Partial<InsertBudgetScenario>): Promise<BudgetScenario | undefined>;
  deleteBudgetScenario(id: string): Promise<void>;
  cloneScenario(id: string, newName: string): Promise<BudgetScenario | undefined>;

  // Scenario Metric Operations
  listScenarioMetrics(scenarioId: string): Promise<ScenarioMetric[]>;
  createScenarioMetric(metric: InsertScenarioMetric): Promise<ScenarioMetric>;
  updateScenarioMetric(id: string, data: Partial<InsertScenarioMetric>): Promise<ScenarioMetric | undefined>;

  // ============================================
  // PHASE 14: TRAVEL MANAGEMENT
  // ============================================

  // Travel Preferences operations
  getTravelPreferences(consultantId: string): Promise<TravelPreference | undefined>;
  upsertTravelPreferences(data: InsertTravelPreference): Promise<TravelPreference>;
  updateTravelPreferences(consultantId: string, data: Partial<InsertTravelPreference>): Promise<TravelPreference | undefined>;

  // Travel Booking operations
  listTravelBookings(filters?: { consultantId?: string; projectId?: string; bookingType?: string; status?: string }): Promise<TravelBookingWithDetails[]>;
  getTravelBooking(id: string): Promise<TravelBookingWithDetails | undefined>;
  createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking>;
  updateTravelBooking(id: string, data: Partial<InsertTravelBooking>): Promise<TravelBooking | undefined>;
  deleteTravelBooking(id: string): Promise<boolean>;

  // Travel Itinerary operations
  listTravelItineraries(filters?: { consultantId?: string; projectId?: string; status?: string }): Promise<TravelItineraryWithDetails[]>;
  getTravelItinerary(id: string): Promise<TravelItineraryWithDetails | undefined>;
  createTravelItinerary(itinerary: InsertTravelItinerary): Promise<TravelItinerary>;
  updateTravelItinerary(id: string, data: Partial<InsertTravelItinerary>): Promise<TravelItinerary | undefined>;
  deleteTravelItinerary(id: string): Promise<boolean>;
  addBookingToItinerary(data: InsertItineraryBooking): Promise<ItineraryBooking>;
  removeBookingFromItinerary(itineraryId: string, bookingId: string): Promise<boolean>;

  // Carpool Group operations
  listCarpoolGroups(filters?: { projectId?: string; status?: string; driverId?: string }): Promise<CarpoolGroupWithDetails[]>;
  getCarpoolGroup(id: string): Promise<CarpoolGroupWithDetails | undefined>;
  createCarpoolGroup(group: InsertCarpoolGroup): Promise<CarpoolGroup>;
  updateCarpoolGroup(id: string, data: Partial<InsertCarpoolGroup>): Promise<CarpoolGroup | undefined>;
  deleteCarpoolGroup(id: string): Promise<boolean>;

  // Carpool Member operations
  addCarpoolMember(data: InsertCarpoolMember): Promise<CarpoolMember>;
  updateCarpoolMember(id: string, data: Partial<InsertCarpoolMember>): Promise<CarpoolMember | undefined>;
  removeCarpoolMember(id: string): Promise<boolean>;
  listCarpoolMembers(carpoolId: string): Promise<CarpoolMemberWithDetails[]>;
  getAvailableCarpools(projectId: string, date: string): Promise<CarpoolGroupWithDetails[]>;

  // Shuttle Schedule operations
  listShuttleSchedules(filters?: { projectId?: string; isActive?: boolean }): Promise<ShuttleSchedule[]>;
  getShuttleSchedule(id: string): Promise<ShuttleSchedule | undefined>;
  createShuttleSchedule(schedule: InsertShuttleSchedule): Promise<ShuttleSchedule>;
  updateShuttleSchedule(id: string, data: Partial<InsertShuttleSchedule>): Promise<ShuttleSchedule | undefined>;
  deleteShuttleSchedule(id: string): Promise<boolean>;

  // Transportation Contact operations
  listTransportationContacts(filters?: { projectId?: string; role?: string; isActive?: boolean }): Promise<TransportationContact[]>;
  getTransportationContact(id: string): Promise<TransportationContact | undefined>;
  createTransportationContact(contact: InsertTransportationContact): Promise<TransportationContact>;
  updateTransportationContact(id: string, data: Partial<InsertTransportationContact>): Promise<TransportationContact | undefined>;
  deleteTransportationContact(id: string): Promise<boolean>;

  // Travel Analytics
  getTravelAnalytics(filters?: { projectId?: string }): Promise<TravelAnalytics>;
  getCarpoolAnalytics(filters?: { projectId?: string }): Promise<CarpoolAnalytics>;
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

  // ============================================
  // PHASE 10: SCHEDULING & TIME MANAGEMENT
  // ============================================

  // Timesheet operations
  async createTimesheet(data: InsertTimesheet): Promise<Timesheet> {
    const results = await db.insert(timesheets).values(data).returning();
    return results[0];
  }

  async getTimesheetById(id: string): Promise<TimesheetWithDetails | undefined> {
    const results = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.id, id));

    if (results.length === 0) return undefined;

    const timesheet = results[0];
    return this.buildTimesheetWithDetails(timesheet);
  }

  async getTimesheetsByConsultant(consultantId: string): Promise<TimesheetWithDetails[]> {
    const results = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.consultantId, consultantId))
      .orderBy(desc(timesheets.weekStartDate));

    return Promise.all(results.map((ts) => this.buildTimesheetWithDetails(ts)));
  }

  async getTimesheetsByProject(projectId: string): Promise<TimesheetWithDetails[]> {
    const results = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.projectId, projectId))
      .orderBy(desc(timesheets.weekStartDate));

    return Promise.all(results.map((ts) => this.buildTimesheetWithDetails(ts)));
  }

  async getPendingTimesheets(): Promise<TimesheetWithDetails[]> {
    const results = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.status, "submitted"))
      .orderBy(asc(timesheets.submittedAt));

    return Promise.all(results.map((ts) => this.buildTimesheetWithDetails(ts)));
  }

  async updateTimesheet(id: string, data: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const results = await db
      .update(timesheets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(timesheets.id, id))
      .returning();
    return results[0];
  }

  async submitTimesheet(id: string): Promise<Timesheet | undefined> {
    const results = await db
      .update(timesheets)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, id))
      .returning();
    return results[0];
  }

  async approveTimesheet(id: string, approverId: string): Promise<Timesheet | undefined> {
    const results = await db
      .update(timesheets)
      .set({
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, id))
      .returning();
    return results[0];
  }

  async rejectTimesheet(id: string, reason: string): Promise<Timesheet | undefined> {
    const results = await db
      .update(timesheets)
      .set({
        status: "rejected",
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, id))
      .returning();
    return results[0];
  }

  private async buildTimesheetWithDetails(timesheet: Timesheet): Promise<TimesheetWithDetails> {
    const consultant = await this.getConsultant(timesheet.consultantId);
    const user = consultant ? await this.getUser(consultant.userId) : null;
    const entries = await this.getTimesheetEntries(timesheet.id);

    let projectDetails: { id: string; name: string } | null = null;
    if (timesheet.projectId) {
      const project = await this.getProject(timesheet.projectId);
      if (project) {
        projectDetails = { id: project.id, name: project.name };
      }
    }

    let approverDetails: { firstName: string | null; lastName: string | null } | null = null;
    if (timesheet.approvedBy) {
      const approver = await this.getUser(timesheet.approvedBy);
      if (approver) {
        approverDetails = { firstName: approver.firstName, lastName: approver.lastName };
      }
    }

    return {
      ...timesheet,
      consultant: {
        id: consultant?.id || '',
        userId: consultant?.userId || '',
        user: {
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
        },
      },
      project: projectDetails,
      approver: approverDetails,
      entries,
    };
  }

  // Timesheet Entry operations
  async createTimesheetEntry(data: InsertTimesheetEntry): Promise<TimesheetEntry> {
    const results = await db.insert(timesheetEntries).values(data).returning();
    await this.recalculateTimesheetHours(data.timesheetId);
    return results[0];
  }

  async getTimesheetEntries(timesheetId: string): Promise<TimesheetEntry[]> {
    return await db
      .select()
      .from(timesheetEntries)
      .where(eq(timesheetEntries.timesheetId, timesheetId))
      .orderBy(asc(timesheetEntries.entryDate), asc(timesheetEntries.clockIn));
  }

  async updateTimesheetEntry(id: string, data: Partial<InsertTimesheetEntry>): Promise<TimesheetEntry | undefined> {
    const existingEntry = await db.select().from(timesheetEntries).where(eq(timesheetEntries.id, id));
    if (existingEntry.length === 0) return undefined;

    const results = await db
      .update(timesheetEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(timesheetEntries.id, id))
      .returning();

    if (results[0]) {
      await this.recalculateTimesheetHours(existingEntry[0].timesheetId);
    }
    return results[0];
  }

  async deleteTimesheetEntry(id: string): Promise<void> {
    const existingEntry = await db.select().from(timesheetEntries).where(eq(timesheetEntries.id, id));
    if (existingEntry.length === 0) return;

    await db.delete(timesheetEntries).where(eq(timesheetEntries.id, id));
    await this.recalculateTimesheetHours(existingEntry[0].timesheetId);
  }

  async clockIn(timesheetId: string, location?: string): Promise<TimesheetEntry> {
    const now = new Date();
    const entryDate = now.toISOString().split('T')[0];

    const results = await db.insert(timesheetEntries).values({
      timesheetId,
      entryDate,
      clockIn: now,
      location: location || null,
      isManualEntry: false,
    }).returning();

    return results[0];
  }

  async clockOut(entryId: string): Promise<TimesheetEntry | undefined> {
    const existingEntry = await db.select().from(timesheetEntries).where(eq(timesheetEntries.id, entryId));
    if (existingEntry.length === 0 || !existingEntry[0].clockIn) return undefined;

    const now = new Date();
    const clockInTime = new Date(existingEntry[0].clockIn);
    const breakMinutes = existingEntry[0].breakMinutes || 0;

    const diffMs = now.getTime() - clockInTime.getTime();
    const totalMinutes = Math.max(0, (diffMs / (1000 * 60)) - breakMinutes);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    const results = await db
      .update(timesheetEntries)
      .set({
        clockOut: now,
        totalHours,
        updatedAt: new Date(),
      })
      .where(eq(timesheetEntries.id, entryId))
      .returning();

    if (results[0]) {
      await this.recalculateTimesheetHours(existingEntry[0].timesheetId);
    }

    return results[0];
  }

  private async recalculateTimesheetHours(timesheetId: string): Promise<void> {
    const entries = await this.getTimesheetEntries(timesheetId);
    const totalHours = entries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(0, totalHours - 40);

    await db
      .update(timesheets)
      .set({
        totalHours,
        regularHours,
        overtimeHours,
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, timesheetId));
  }

  // Availability Block operations
  async createAvailabilityBlock(data: InsertAvailabilityBlock): Promise<AvailabilityBlock> {
    const results = await db.insert(availabilityBlocks).values(data).returning();
    return results[0];
  }

  async getAvailabilityByConsultant(consultantId: string, startDate?: Date, endDate?: Date): Promise<AvailabilityBlock[]> {
    let query = db
      .select()
      .from(availabilityBlocks)
      .where(eq(availabilityBlocks.consultantId, consultantId));

    if (startDate && endDate) {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      query = db
        .select()
        .from(availabilityBlocks)
        .where(
          and(
            eq(availabilityBlocks.consultantId, consultantId),
            or(
              and(
                gte(availabilityBlocks.startDate, startDateStr),
                lte(availabilityBlocks.startDate, endDateStr)
              ),
              and(
                gte(availabilityBlocks.endDate, startDateStr),
                lte(availabilityBlocks.endDate, endDateStr)
              ),
              and(
                lte(availabilityBlocks.startDate, startDateStr),
                gte(availabilityBlocks.endDate, endDateStr)
              )
            )
          )
        );
    }

    return await query.orderBy(asc(availabilityBlocks.startDate));
  }

  async updateAvailabilityBlock(id: string, data: Partial<InsertAvailabilityBlock>): Promise<AvailabilityBlock | undefined> {
    const results = await db
      .update(availabilityBlocks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(availabilityBlocks.id, id))
      .returning();
    return results[0];
  }

  async deleteAvailabilityBlock(id: string): Promise<void> {
    await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, id));
  }

  // Shift Swap Request operations
  async createShiftSwapRequest(data: InsertShiftSwapRequest): Promise<ShiftSwapRequest> {
    const results = await db.insert(shiftSwapRequests).values(data).returning();
    return results[0];
  }

  async getSwapRequestById(id: string): Promise<ShiftSwapRequestWithDetails | undefined> {
    const results = await db
      .select()
      .from(shiftSwapRequests)
      .where(eq(shiftSwapRequests.id, id));

    if (results.length === 0) return undefined;

    return this.buildSwapRequestWithDetails(results[0]);
  }

  async getSwapRequestsByConsultant(consultantId: string): Promise<ShiftSwapRequestWithDetails[]> {
    const results = await db
      .select()
      .from(shiftSwapRequests)
      .where(
        or(
          eq(shiftSwapRequests.requesterId, consultantId),
          eq(shiftSwapRequests.targetConsultantId, consultantId)
        )
      )
      .orderBy(desc(shiftSwapRequests.createdAt));

    return Promise.all(results.map((req) => this.buildSwapRequestWithDetails(req)));
  }

  async getPendingSwapRequests(): Promise<ShiftSwapRequestWithDetails[]> {
    const results = await db
      .select()
      .from(shiftSwapRequests)
      .where(eq(shiftSwapRequests.status, "pending"))
      .orderBy(asc(shiftSwapRequests.requestedAt));

    return Promise.all(results.map((req) => this.buildSwapRequestWithDetails(req)));
  }

  async approveSwapRequest(id: string, responderId: string, notes?: string): Promise<ShiftSwapRequest | undefined> {
    const results = await db
      .update(shiftSwapRequests)
      .set({
        status: "approved",
        respondedBy: responderId,
        respondedAt: new Date(),
        responseNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(shiftSwapRequests.id, id))
      .returning();
    return results[0];
  }

  async rejectSwapRequest(id: string, responderId: string, notes?: string): Promise<ShiftSwapRequest | undefined> {
    const results = await db
      .update(shiftSwapRequests)
      .set({
        status: "rejected",
        respondedBy: responderId,
        respondedAt: new Date(),
        responseNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(shiftSwapRequests.id, id))
      .returning();
    return results[0];
  }

  async cancelSwapRequest(id: string): Promise<ShiftSwapRequest | undefined> {
    const results = await db
      .update(shiftSwapRequests)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(shiftSwapRequests.id, id))
      .returning();
    return results[0];
  }

  private async buildSwapRequestWithDetails(request: ShiftSwapRequest): Promise<ShiftSwapRequestWithDetails> {
    const requester = await this.getConsultant(request.requesterId);
    const requesterUser = requester ? await this.getUser(requester.userId) : null;

    let targetConsultantDetails: ShiftSwapRequestWithDetails['targetConsultant'] = null;
    if (request.targetConsultantId) {
      const targetConsultant = await this.getConsultant(request.targetConsultantId);
      if (targetConsultant) {
        const targetUser = await this.getUser(targetConsultant.userId);
        targetConsultantDetails = {
          id: targetConsultant.id,
          user: {
            firstName: targetUser?.firstName || null,
            lastName: targetUser?.lastName || null,
          },
        };
      }
    }

    const originalAssignmentResults = await db
      .select({
        assignment: scheduleAssignments,
        schedule: projectSchedules,
      })
      .from(scheduleAssignments)
      .innerJoin(projectSchedules, eq(scheduleAssignments.scheduleId, projectSchedules.id))
      .where(eq(scheduleAssignments.id, request.originalAssignmentId));

    const originalAssignment = originalAssignmentResults[0];

    let responderDetails: ShiftSwapRequestWithDetails['responder'] = null;
    if (request.respondedBy) {
      const responder = await this.getUser(request.respondedBy);
      if (responder) {
        responderDetails = {
          firstName: responder.firstName,
          lastName: responder.lastName,
        };
      }
    }

    return {
      ...request,
      requester: {
        id: requester?.id || '',
        user: {
          firstName: requesterUser?.firstName || null,
          lastName: requesterUser?.lastName || null,
        },
      },
      targetConsultant: targetConsultantDetails,
      originalAssignment: {
        id: originalAssignment?.assignment?.id || '',
        schedule: {
          scheduleDate: originalAssignment?.schedule?.scheduleDate || '',
          shiftType: originalAssignment?.schedule?.shiftType || '',
        },
      },
      responder: responderDetails,
    };
  }

  // ============================================
  // PHASE 11: TRAINING & COMPETENCY
  // ============================================

  // Course operations
  async createCourse(data: InsertCourse): Promise<Course> {
    const results = await db.insert(courses).values(data).returning();
    return results[0];
  }

  async getCourseById(id: string): Promise<CourseWithDetails | undefined> {
    const results = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));

    if (results.length === 0) return undefined;

    return this.buildCourseWithDetails(results[0]);
  }

  async getCourses(filters?: { status?: string; level?: string; courseType?: string; moduleId?: string }): Promise<CourseWithDetails[]> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(courses.status, filters.status as any));
    }
    if (filters?.level) {
      conditions.push(eq(courses.level, filters.level as any));
    }
    if (filters?.courseType) {
      conditions.push(eq(courses.courseType, filters.courseType as any));
    }
    if (filters?.moduleId) {
      conditions.push(eq(courses.moduleId, filters.moduleId));
    }

    const query = conditions.length > 0
      ? db.select().from(courses).where(and(...conditions))
      : db.select().from(courses);

    const results = await query.orderBy(desc(courses.createdAt));
    return Promise.all(results.map((c) => this.buildCourseWithDetails(c)));
  }

  async updateCourse(id: string, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const results = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return results[0];
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  private async buildCourseWithDetails(course: Course): Promise<CourseWithDetails> {
    let moduleDetails: CourseWithDetails['module'] = null;
    if (course.moduleId) {
      const module = await this.getHospitalModule(course.moduleId);
      if (module) {
        moduleDetails = { id: module.id, name: module.name };
      }
    }

    let hospitalDetails: CourseWithDetails['hospital'] = null;
    if (course.hospitalId) {
      const hospital = await this.getHospital(course.hospitalId);
      if (hospital) {
        hospitalDetails = { id: hospital.id, name: hospital.name };
      }
    }

    let creatorDetails: CourseWithDetails['creator'] = null;
    if (course.createdBy) {
      const creator = await this.getUser(course.createdBy);
      if (creator) {
        creatorDetails = { id: creator.id, firstName: creator.firstName, lastName: creator.lastName };
      }
    }

    const modules = await this.getCourseModules(course.id);

    const enrollmentCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, course.id));

    return {
      ...course,
      module: moduleDetails,
      hospital: hospitalDetails,
      creator: creatorDetails,
      courseModules: modules,
      enrollmentCount: Number(enrollmentCountResult[0]?.count) || 0,
    };
  }

  // Course Module operations
  async createCourseModule(data: InsertCourseModule): Promise<CourseModule> {
    const results = await db.insert(courseModules).values(data).returning();
    return results[0];
  }

  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    return await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.orderIndex));
  }

  async updateCourseModule(id: string, data: Partial<InsertCourseModule>): Promise<CourseModule | undefined> {
    const results = await db
      .update(courseModules)
      .set(data)
      .where(eq(courseModules.id, id))
      .returning();
    return results[0];
  }

  async deleteCourseModule(id: string): Promise<void> {
    await db.delete(courseModules).where(eq(courseModules.id, id));
  }

  // Enrollment operations
  async enrollInCourse(data: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const results = await db.insert(courseEnrollments).values(data).returning();
    return results[0];
  }

  async getEnrollmentsByUser(userId: string): Promise<CourseEnrollmentWithDetails[]> {
    const results = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(desc(courseEnrollments.enrolledAt));

    return Promise.all(results.map((e) => this.buildEnrollmentWithDetails(e)));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<CourseEnrollmentWithDetails[]> {
    const results = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId))
      .orderBy(desc(courseEnrollments.enrolledAt));

    return Promise.all(results.map((e) => this.buildEnrollmentWithDetails(e)));
  }

  async updateEnrollmentProgress(id: string, data: { progressPercent?: number; status?: string; completedAt?: Date; ceCreditsEarned?: string; certificateUrl?: string }): Promise<CourseEnrollment | undefined> {
    const updateData: any = {};
    if (data.progressPercent !== undefined) updateData.progressPercent = data.progressPercent;
    if (data.status) updateData.status = data.status;
    if (data.completedAt) updateData.completedAt = data.completedAt;
    if (data.ceCreditsEarned) updateData.ceCreditsEarned = data.ceCreditsEarned;
    if (data.certificateUrl) updateData.certificateUrl = data.certificateUrl;

    const results = await db
      .update(courseEnrollments)
      .set(updateData)
      .where(eq(courseEnrollments.id, id))
      .returning();
    return results[0];
  }

  async dropFromCourse(id: string): Promise<CourseEnrollment | undefined> {
    const results = await db
      .update(courseEnrollments)
      .set({ status: "dropped" })
      .where(eq(courseEnrollments.id, id))
      .returning();
    return results[0];
  }

  private async buildEnrollmentWithDetails(enrollment: CourseEnrollment): Promise<CourseEnrollmentWithDetails> {
    const courseResults = await db
      .select()
      .from(courses)
      .where(eq(courses.id, enrollment.courseId));
    const course = courseResults[0];

    const user = await this.getUser(enrollment.userId);

    return {
      ...enrollment,
      course: {
        id: course?.id || '',
        title: course?.title || '',
        durationMinutes: course?.durationMinutes || null,
        ceCredits: course?.ceCredits || null,
        level: course?.level || 'beginner',
      },
      user: {
        id: user?.id || '',
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        email: user?.email || null,
      },
    };
  }

  // Assessment operations
  async createAssessment(data: InsertAssessment): Promise<Assessment> {
    const results = await db.insert(assessments).values(data).returning();
    return results[0];
  }

  async getAssessmentById(id: string): Promise<AssessmentWithDetails | undefined> {
    const results = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));

    if (results.length === 0) return undefined;

    return this.buildAssessmentWithDetails(results[0]);
  }

  async getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.courseId, courseId))
      .orderBy(asc(assessments.createdAt));
  }

  async updateAssessment(id: string, data: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const results = await db
      .update(assessments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assessments.id, id))
      .returning();
    return results[0];
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  private async buildAssessmentWithDetails(assessment: Assessment): Promise<AssessmentWithDetails> {
    const courseResults = await db
      .select()
      .from(courses)
      .where(eq(courses.id, assessment.courseId));
    const course = courseResults[0];

    let moduleDetails: AssessmentWithDetails['courseModule'] = null;
    if (assessment.courseModuleId) {
      const moduleResults = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.id, assessment.courseModuleId));
      if (moduleResults[0]) {
        moduleDetails = { id: moduleResults[0].id, title: moduleResults[0].title };
      }
    }

    const questions = await this.getAssessmentQuestions(assessment.id);

    const attemptCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.assessmentId, assessment.id));

    return {
      ...assessment,
      course: {
        id: course?.id || '',
        title: course?.title || '',
      },
      courseModule: moduleDetails,
      questions,
      attemptCount: Number(attemptCountResult[0]?.count) || 0,
    };
  }

  // Assessment Question operations
  async createAssessmentQuestion(data: InsertAssessmentQuestion): Promise<AssessmentQuestion> {
    const results = await db.insert(assessmentQuestions).values(data).returning();
    return results[0];
  }

  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
    return await db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.assessmentId, assessmentId))
      .orderBy(asc(assessmentQuestions.orderIndex));
  }

  async updateAssessmentQuestion(id: string, data: Partial<InsertAssessmentQuestion>): Promise<AssessmentQuestion | undefined> {
    const results = await db
      .update(assessmentQuestions)
      .set(data)
      .where(eq(assessmentQuestions.id, id))
      .returning();
    return results[0];
  }

  async deleteAssessmentQuestion(id: string): Promise<void> {
    await db.delete(assessmentQuestions).where(eq(assessmentQuestions.id, id));
  }

  // Assessment Attempt operations
  async startAssessmentAttempt(data: InsertAssessmentAttempt): Promise<AssessmentAttempt> {
    const existingAttempts = await this.getAttemptCount(data.userId, data.assessmentId);
    const attemptNumber = existingAttempts + 1;

    const results = await db.insert(assessmentAttempts).values({
      ...data,
      attemptNumber,
    }).returning();
    return results[0];
  }

  async submitAssessmentAttempt(id: string, answers: any, score: number, passed: boolean): Promise<AssessmentAttempt | undefined> {
    const results = await db
      .update(assessmentAttempts)
      .set({
        answers,
        score,
        passed,
        completedAt: new Date(),
      })
      .where(eq(assessmentAttempts.id, id))
      .returning();
    return results[0];
  }

  async getAttemptsByUser(userId: string): Promise<AssessmentAttemptWithDetails[]> {
    const results = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.userId, userId))
      .orderBy(desc(assessmentAttempts.startedAt));

    return Promise.all(results.map((a) => this.buildAttemptWithDetails(a)));
  }

  async getAttemptsByAssessment(assessmentId: string): Promise<AssessmentAttemptWithDetails[]> {
    const results = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.assessmentId, assessmentId))
      .orderBy(desc(assessmentAttempts.startedAt));

    return Promise.all(results.map((a) => this.buildAttemptWithDetails(a)));
  }

  async getAttemptCount(userId: string, assessmentId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.userId, userId),
          eq(assessmentAttempts.assessmentId, assessmentId)
        )
      );
    return Number(result[0]?.count) || 0;
  }

  private async buildAttemptWithDetails(attempt: AssessmentAttempt): Promise<AssessmentAttemptWithDetails> {
    const assessmentResults = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, attempt.assessmentId));
    const assessment = assessmentResults[0];

    const user = await this.getUser(attempt.userId);

    return {
      ...attempt,
      assessment: {
        id: assessment?.id || '',
        title: assessment?.title || '',
        passingScore: assessment?.passingScore || null,
        maxAttempts: assessment?.maxAttempts || null,
      },
      user: {
        id: user?.id || '',
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
      },
    };
  }

  // Login Lab operations
  async createLoginLab(data: InsertLoginLab): Promise<LoginLab> {
    const results = await db.insert(loginLabs).values(data).returning();
    return results[0];
  }

  async getLoginLabById(id: string): Promise<LoginLabWithDetails | undefined> {
    const results = await db
      .select()
      .from(loginLabs)
      .where(eq(loginLabs.id, id));

    if (results.length === 0) return undefined;

    return this.buildLoginLabWithDetails(results[0]);
  }

  async getLoginLabs(filters?: { projectId?: string; hospitalId?: string; status?: string }): Promise<LoginLabWithDetails[]> {
    const conditions = [];

    if (filters?.projectId) {
      conditions.push(eq(loginLabs.projectId, filters.projectId));
    }
    if (filters?.hospitalId) {
      conditions.push(eq(loginLabs.hospitalId, filters.hospitalId));
    }
    if (filters?.status) {
      conditions.push(eq(loginLabs.status, filters.status as any));
    }

    const query = conditions.length > 0
      ? db.select().from(loginLabs).where(and(...conditions))
      : db.select().from(loginLabs);

    const results = await query.orderBy(desc(loginLabs.scheduledAt));
    return Promise.all(results.map((l) => this.buildLoginLabWithDetails(l)));
  }

  async updateLoginLab(id: string, data: Partial<InsertLoginLab>): Promise<LoginLab | undefined> {
    const results = await db
      .update(loginLabs)
      .set(data)
      .where(eq(loginLabs.id, id))
      .returning();
    return results[0];
  }

  async deleteLoginLab(id: string): Promise<void> {
    await db.delete(loginLabs).where(eq(loginLabs.id, id));
  }

  private async buildLoginLabWithDetails(lab: LoginLab): Promise<LoginLabWithDetails> {
    const project = await this.getProject(lab.projectId);
    const hospital = await this.getHospital(lab.hospitalId);

    let moduleDetails: LoginLabWithDetails['module'] = null;
    if (lab.moduleId) {
      const module = await this.getHospitalModule(lab.moduleId);
      if (module) {
        moduleDetails = { id: module.id, name: module.name };
      }
    }

    let facilitatorDetails: LoginLabWithDetails['facilitator'] = null;
    if (lab.facilitatorId) {
      const facilitator = await this.getUser(lab.facilitatorId);
      if (facilitator) {
        facilitatorDetails = { id: facilitator.id, firstName: facilitator.firstName, lastName: facilitator.lastName };
      }
    }

    const participants = await this.getLabParticipants(lab.id);

    return {
      ...lab,
      project: {
        id: project?.id || '',
        name: project?.name || '',
      },
      hospital: {
        id: hospital?.id || '',
        name: hospital?.name || '',
      },
      module: moduleDetails,
      facilitator: facilitatorDetails,
      participants,
      participantCount: participants.length,
    };
  }

  // Login Lab Participant operations
  async addParticipantToLab(data: InsertLoginLabParticipant): Promise<LoginLabParticipant> {
    const results = await db.insert(loginLabParticipants).values(data).returning();
    return results[0];
  }

  async getLabParticipants(loginLabId: string): Promise<LoginLabParticipantWithUser[]> {
    const results = await db
      .select()
      .from(loginLabParticipants)
      .where(eq(loginLabParticipants.loginLabId, loginLabId));

    return Promise.all(results.map(async (p) => {
      const user = await this.getUser(p.userId);
      return {
        ...p,
        user: {
          id: user?.id || '',
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          email: user?.email || null,
        },
      };
    }));
  }

  async validateParticipantAccess(id: string): Promise<LoginLabParticipant | undefined> {
    const results = await db
      .update(loginLabParticipants)
      .set({ accessValidated: true })
      .where(eq(loginLabParticipants.id, id))
      .returning();
    return results[0];
  }

  async completeParticipantLab(id: string, customizationNotes?: string): Promise<LoginLabParticipant | undefined> {
    const results = await db
      .update(loginLabParticipants)
      .set({
        completedAt: new Date(),
        customizationNotes: customizationNotes || null,
      })
      .where(eq(loginLabParticipants.id, id))
      .returning();
    return results[0];
  }

  // Knowledge Base operations
  async createKnowledgeArticle(data: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const results = await db.insert(knowledgeArticles).values(data).returning();
    return results[0];
  }

  async getArticleById(id: string): Promise<KnowledgeArticleWithDetails | undefined> {
    const results = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.id, id));

    if (results.length === 0) return undefined;

    return this.buildArticleWithDetails(results[0]);
  }

  async searchArticles(query: string, filters?: { category?: string; moduleId?: string; status?: string }): Promise<KnowledgeArticleWithDetails[]> {
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(knowledgeArticles.title, `%${query}%`),
          ilike(knowledgeArticles.content, `%${query}%`)
        )
      );
    }
    if (filters?.category) {
      conditions.push(eq(knowledgeArticles.category, filters.category));
    }
    if (filters?.moduleId) {
      conditions.push(eq(knowledgeArticles.moduleId, filters.moduleId));
    }
    if (filters?.status) {
      conditions.push(eq(knowledgeArticles.status, filters.status as any));
    }

    const queryBuilder = conditions.length > 0
      ? db.select().from(knowledgeArticles).where(and(...conditions))
      : db.select().from(knowledgeArticles);

    const results = await queryBuilder.orderBy(desc(knowledgeArticles.updatedAt));
    return Promise.all(results.map((a) => this.buildArticleWithDetails(a)));
  }

  async updateArticle(id: string, data: Partial<InsertKnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const results = await db
      .update(knowledgeArticles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(knowledgeArticles.id, id))
      .returning();
    return results[0];
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
  }

  async incrementArticleViews(id: string): Promise<void> {
    await db
      .update(knowledgeArticles)
      .set({
        viewCount: sql`${knowledgeArticles.viewCount} + 1`,
      })
      .where(eq(knowledgeArticles.id, id));
  }

  private async buildArticleWithDetails(article: KnowledgeArticle): Promise<KnowledgeArticleWithDetails> {
    let moduleDetails: KnowledgeArticleWithDetails['module'] = null;
    if (article.moduleId) {
      const module = await this.getHospitalModule(article.moduleId);
      if (module) {
        moduleDetails = { id: module.id, name: module.name };
      }
    }

    let authorDetails: KnowledgeArticleWithDetails['author'] = null;
    if (article.authorId) {
      const author = await this.getUser(article.authorId);
      if (author) {
        authorDetails = { id: author.id, firstName: author.firstName, lastName: author.lastName };
      }
    }

    return {
      ...article,
      module: moduleDetails,
      author: authorDetails,
    };
  }

  // Training Analytics
  async getTrainingAnalytics(): Promise<TrainingAnalytics> {
    const totalCoursesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);

    const publishedCoursesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.status, "published"));

    const totalEnrollmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments);

    const completedEnrollmentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.status, "completed"));

    const avgScoreResult = await db
      .select({ avg: sql<number>`AVG(${assessmentAttempts.score})` })
      .from(assessmentAttempts)
      .where(sql`${assessmentAttempts.score} IS NOT NULL`);

    const upcomingLabsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(loginLabs)
      .where(
        and(
          eq(loginLabs.status, "scheduled"),
          gte(loginLabs.scheduledAt, new Date())
        )
      );

    const totalArticlesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(knowledgeArticles);

    const beginnerResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.level, "beginner"));

    const intermediateResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.level, "intermediate"));

    const advancedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.level, "advanced"));

    const enrolledResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.status, "enrolled"));

    const inProgressResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.status, "in_progress"));

    const droppedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.status, "dropped"));

    const recentEnrollmentsResults = await db
      .select()
      .from(courseEnrollments)
      .orderBy(desc(courseEnrollments.enrolledAt))
      .limit(10);

    const recentEnrollments = await Promise.all(
      recentEnrollmentsResults.map((e) => this.buildEnrollmentWithDetails(e))
    );

    const popularCoursesResults = await db
      .select({
        courseId: courseEnrollments.courseId,
        enrollmentCount: sql<number>`count(*)`,
        completedCount: sql<number>`sum(case when ${courseEnrollments.status} = 'completed' then 1 else 0 end)`,
      })
      .from(courseEnrollments)
      .groupBy(courseEnrollments.courseId)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    const popularCourses = await Promise.all(
      popularCoursesResults.map(async (pc) => {
        const courseResults = await db
          .select()
          .from(courses)
          .where(eq(courses.id, pc.courseId));
        const enrollCount = Number(pc.enrollmentCount) || 0;
        const completedCount = Number(pc.completedCount) || 0;
        return {
          courseId: pc.courseId,
          title: courseResults[0]?.title || '',
          enrollmentCount: enrollCount,
          completionRate: enrollCount > 0 ? Math.round((completedCount / enrollCount) * 100) : 0,
        };
      })
    );

    const totalEnrollments = Number(totalEnrollmentsResult[0]?.count) || 0;
    const completedEnrollments = Number(completedEnrollmentsResult[0]?.count) || 0;

    return {
      totalCourses: Number(totalCoursesResult[0]?.count) || 0,
      publishedCourses: Number(publishedCoursesResult[0]?.count) || 0,
      totalEnrollments,
      completedEnrollments,
      averageCompletionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      averageScore: Math.round(Number(avgScoreResult[0]?.avg) || 0),
      upcomingLoginLabs: Number(upcomingLabsResult[0]?.count) || 0,
      totalArticles: Number(totalArticlesResult[0]?.count) || 0,
      coursesByLevel: {
        beginner: Number(beginnerResult[0]?.count) || 0,
        intermediate: Number(intermediateResult[0]?.count) || 0,
        advanced: Number(advancedResult[0]?.count) || 0,
      },
      enrollmentsByStatus: {
        enrolled: Number(enrolledResult[0]?.count) || 0,
        in_progress: Number(inProgressResult[0]?.count) || 0,
        completed: completedEnrollments,
        dropped: Number(droppedResult[0]?.count) || 0,
      },
      recentEnrollments,
      popularCourses,
    };
  }

  // ============================================
  // PHASE 12: TICKETING & SUPPORT
  // ============================================

  // EOD Report Operations
  async getEodReports(projectId?: string): Promise<EodReport[]> {
    if (projectId) {
      return await db
        .select()
        .from(eodReports)
        .where(eq(eodReports.projectId, projectId))
        .orderBy(desc(eodReports.reportDate));
    }
    return await db
      .select()
      .from(eodReports)
      .orderBy(desc(eodReports.reportDate));
  }

  async getEodReport(id: string): Promise<EodReport | undefined> {
    const results = await db
      .select()
      .from(eodReports)
      .where(eq(eodReports.id, id));
    return results[0];
  }

  async getEodReportWithDetails(id: string): Promise<EodReportWithDetails | undefined> {
    const report = await this.getEodReport(id);
    if (!report) return undefined;
    return this.buildEodReportWithDetails(report);
  }

  async getEodReportsWithDetails(projectId?: string): Promise<EodReportWithDetails[]> {
    const reports = await this.getEodReports(projectId);
    return Promise.all(reports.map((r) => this.buildEodReportWithDetails(r)));
  }

  async getEodReportsByDate(date: string, projectId?: string): Promise<EodReportWithDetails[]> {
    const conditions = [eq(eodReports.reportDate, date)];
    if (projectId) {
      conditions.push(eq(eodReports.projectId, projectId));
    }
    const results = await db
      .select()
      .from(eodReports)
      .where(and(...conditions));
    return Promise.all(results.map((r) => this.buildEodReportWithDetails(r)));
  }

  async createEodReport(report: InsertEodReport): Promise<EodReport> {
    const results = await db.insert(eodReports).values(report).returning();
    return results[0];
  }

  async updateEodReport(id: string, data: Partial<InsertEodReport>): Promise<EodReport | undefined> {
    const results = await db
      .update(eodReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(eodReports.id, id))
      .returning();
    return results[0];
  }

  async submitEodReport(id: string): Promise<EodReport | undefined> {
    return this.updateEodReport(id, {
      status: "submitted",
      submittedAt: new Date(),
    } as Partial<InsertEodReport>);
  }

  async approveEodReport(id: string, approverId: string): Promise<EodReport | undefined> {
    const results = await db
      .update(eodReports)
      .set({
        status: "approved",
        approvedById: approverId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(eodReports.id, id))
      .returning();
    return results[0];
  }

  async rejectEodReport(id: string): Promise<EodReport | undefined> {
    return this.updateEodReport(id, { status: "rejected" } as Partial<InsertEodReport>);
  }

  async deleteEodReport(id: string): Promise<void> {
    await db.delete(eodReports).where(eq(eodReports.id, id));
  }

  private async buildEodReportWithDetails(report: EodReport): Promise<EodReportWithDetails> {
    const project = await this.getProject(report.projectId);
    const submittedBy = await this.getUser(report.submittedById);
    let approvedBy: EodReportWithDetails["approvedBy"] = null;
    if (report.approvedById) {
      const approver = await this.getUser(report.approvedById);
      if (approver) {
        approvedBy = {
          id: approver.id,
          firstName: approver.firstName,
          lastName: approver.lastName,
        };
      }
    }

    return {
      ...report,
      project: {
        id: project?.id || "",
        name: project?.name || "Unknown",
      },
      submittedBy: {
        id: submittedBy?.id || "",
        firstName: submittedBy?.firstName || null,
        lastName: submittedBy?.lastName || null,
      },
      approvedBy,
    };
  }

  // Escalation Rules Operations
  async getEscalationRules(projectId?: string): Promise<EscalationRule[]> {
    if (projectId) {
      return await db
        .select()
        .from(escalationRules)
        .where(eq(escalationRules.projectId, projectId))
        .orderBy(desc(escalationRules.createdAt));
    }
    return await db
      .select()
      .from(escalationRules)
      .orderBy(desc(escalationRules.createdAt));
  }

  async getEscalationRule(id: string): Promise<EscalationRule | undefined> {
    const results = await db
      .select()
      .from(escalationRules)
      .where(eq(escalationRules.id, id));
    return results[0];
  }

  async getActiveEscalationRules(projectId?: string): Promise<EscalationRule[]> {
    const conditions = [eq(escalationRules.isActive, true)];
    if (projectId) {
      conditions.push(eq(escalationRules.projectId, projectId));
    }
    return await db
      .select()
      .from(escalationRules)
      .where(and(...conditions));
  }

  async createEscalationRule(rule: InsertEscalationRule): Promise<EscalationRule> {
    const results = await db.insert(escalationRules).values(rule).returning();
    return results[0];
  }

  async updateEscalationRule(id: string, data: Partial<InsertEscalationRule>): Promise<EscalationRule | undefined> {
    const results = await db
      .update(escalationRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(escalationRules.id, id))
      .returning();
    return results[0];
  }

  async deleteEscalationRule(id: string): Promise<void> {
    await db.delete(escalationRules).where(eq(escalationRules.id, id));
  }

  // Ticket History Operations
  async getTicketHistory(ticketId: string): Promise<TicketHistoryWithDetails[]> {
    const results = await db
      .select()
      .from(ticketHistory)
      .where(eq(ticketHistory.ticketId, ticketId))
      .orderBy(desc(ticketHistory.createdAt));
    return Promise.all(results.map((h) => this.buildTicketHistoryWithDetails(h)));
  }

  async createTicketHistory(entry: InsertTicketHistory): Promise<TicketHistory> {
    const results = await db.insert(ticketHistory).values(entry).returning();
    return results[0];
  }

  private async buildTicketHistoryWithDetails(history: TicketHistory): Promise<TicketHistoryWithDetails> {
    const ticket = await this.getSupportTicket(history.ticketId);
    const performedBy = await this.getUser(history.performedById);

    return {
      ...history,
      ticket: {
        id: ticket?.id || "",
        ticketNumber: ticket?.ticketNumber || null,
        title: ticket?.title || "Unknown",
      },
      performedBy: {
        id: performedBy?.id || "",
        firstName: performedBy?.firstName || null,
        lastName: performedBy?.lastName || null,
      },
    };
  }

  // Ticket Comments Operations
  async getTicketComments(ticketId: string): Promise<TicketCommentWithDetails[]> {
    const results = await db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(asc(ticketComments.createdAt));
    return Promise.all(results.map((c) => this.buildTicketCommentWithDetails(c)));
  }

  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const results = await db.insert(ticketComments).values(comment).returning();
    return results[0];
  }

  async updateTicketComment(id: string, data: Partial<InsertTicketComment>): Promise<TicketComment | undefined> {
    const results = await db
      .update(ticketComments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ticketComments.id, id))
      .returning();
    return results[0];
  }

  async deleteTicketComment(id: string): Promise<void> {
    await db.delete(ticketComments).where(eq(ticketComments.id, id));
  }

  private async buildTicketCommentWithDetails(comment: TicketComment): Promise<TicketCommentWithDetails> {
    const author = await this.getUser(comment.authorId);
    return {
      ...comment,
      author: {
        id: author?.id || "",
        firstName: author?.firstName || null,
        lastName: author?.lastName || null,
        profileImageUrl: author?.profileImageUrl || null,
      },
    };
  }

  // Support Ticket with Full History
  async getSupportTicketWithHistory(id: string): Promise<SupportTicketWithHistory | undefined> {
    const ticket = await this.getSupportTicket(id);
    if (!ticket) return undefined;

    const project = await this.getProject(ticket.projectId);
    let reportedBy: SupportTicketWithHistory["reportedBy"] = null;
    if (ticket.reportedById) {
      const reporter = await this.getUser(ticket.reportedById);
      if (reporter) {
        reportedBy = {
          id: reporter.id,
          firstName: reporter.firstName,
          lastName: reporter.lastName,
        };
      }
    }

    let assignedTo: SupportTicketWithHistory["assignedTo"] = null;
    if (ticket.assignedToId) {
      const consultant = await this.getConsultant(ticket.assignedToId);
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

    const history = await this.getTicketHistory(id);
    const comments = await this.getTicketComments(id);

    return {
      ...ticket,
      project: {
        id: project?.id || "",
        name: project?.name || "Unknown",
      },
      reportedBy,
      assignedTo,
      history,
      comments,
    };
  }

  // Data Retention Policy Operations
  async getDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    return await db
      .select()
      .from(dataRetentionPolicies)
      .orderBy(asc(dataRetentionPolicies.entityType));
  }

  async getDataRetentionPolicy(id: string): Promise<DataRetentionPolicy | undefined> {
    const results = await db
      .select()
      .from(dataRetentionPolicies)
      .where(eq(dataRetentionPolicies.id, id));
    return results[0];
  }

  async createDataRetentionPolicy(policy: InsertDataRetentionPolicy): Promise<DataRetentionPolicy> {
    const results = await db.insert(dataRetentionPolicies).values(policy).returning();
    return results[0];
  }

  async updateDataRetentionPolicy(id: string, data: Partial<InsertDataRetentionPolicy>): Promise<DataRetentionPolicy | undefined> {
    const results = await db
      .update(dataRetentionPolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dataRetentionPolicies.id, id))
      .returning();
    return results[0];
  }

  async deleteDataRetentionPolicy(id: string): Promise<void> {
    await db.delete(dataRetentionPolicies).where(eq(dataRetentionPolicies.id, id));
  }

  // EOD Report Analytics
  async getEodReportAnalytics(): Promise<EodReportAnalytics> {
    const today = new Date().toISOString().split("T")[0];

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(eodReports);

    const submittedTodayResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(eodReports)
      .where(eq(eodReports.reportDate, today));

    const pendingApprovalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(eodReports)
      .where(eq(eodReports.status, "submitted"));

    const avgIssuesResult = await db
      .select({
        avgResolved: sql<number>`AVG(${eodReports.issuesResolved})`,
        avgPending: sql<number>`AVG(${eodReports.issuesPending})`,
      })
      .from(eodReports);

    const recentReportsResults = await db
      .select()
      .from(eodReports)
      .orderBy(desc(eodReports.createdAt))
      .limit(10);

    const recentReports = await Promise.all(
      recentReportsResults.map((r) => this.buildEodReportWithDetails(r))
    );

    const reportsByProjectResults = await db
      .select({
        projectId: eodReports.projectId,
        reportCount: sql<number>`count(*)`,
      })
      .from(eodReports)
      .groupBy(eodReports.projectId)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const reportsByProject = await Promise.all(
      reportsByProjectResults.map(async (rp) => {
        const project = await this.getProject(rp.projectId);
        return {
          projectId: rp.projectId,
          projectName: project?.name || "Unknown",
          reportCount: Number(rp.reportCount) || 0,
        };
      })
    );

    return {
      totalReports: Number(totalResult[0]?.count) || 0,
      submittedToday: Number(submittedTodayResult[0]?.count) || 0,
      pendingApproval: Number(pendingApprovalResult[0]?.count) || 0,
      averageIssuesResolved: Math.round(Number(avgIssuesResult[0]?.avgResolved) || 0),
      averageIssuesPending: Math.round(Number(avgIssuesResult[0]?.avgPending) || 0),
      recentReports,
      reportsByProject,
    };
  }

  // Auto-populate EOD report from tickets
  async autoPopulateEodReport(projectId: string, date: string): Promise<Partial<InsertEodReport>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const resolvedTickets = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          gte(supportTickets.resolvedAt, startOfDay),
          lte(supportTickets.resolvedAt, endOfDay)
        )
      );

    const pendingTickets = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          or(
            eq(supportTickets.status, "open"),
            eq(supportTickets.status, "in_progress")
          )
        )
      );

    const escalatedTickets = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.projectId, projectId),
          eq(supportTickets.status, "escalated")
        )
      );

    return {
      issuesResolved: Number(resolvedTickets[0]?.count) || 0,
      issuesPending: Number(pendingTickets[0]?.count) || 0,
      issuesEscalated: Number(escalatedTickets[0]?.count) || 0,
    };
  }

  // ============================================
  // PHASE 13: FINANCIAL MANAGEMENT IMPLEMENTATIONS
  // ============================================

  // Per Diem Policy Operations
  async listPerDiemPolicies(): Promise<PerDiemPolicy[]> {
    return await db
      .select()
      .from(perDiemPolicies)
      .orderBy(desc(perDiemPolicies.createdAt));
  }

  async getPerDiemPolicy(id: string): Promise<PerDiemPolicy | undefined> {
    const results = await db
      .select()
      .from(perDiemPolicies)
      .where(eq(perDiemPolicies.id, id));
    return results[0];
  }

  async createPerDiemPolicy(policy: InsertPerDiemPolicy): Promise<PerDiemPolicy> {
    const results = await db.insert(perDiemPolicies).values(policy).returning();
    return results[0];
  }

  async updatePerDiemPolicy(id: string, data: Partial<InsertPerDiemPolicy>): Promise<PerDiemPolicy | undefined> {
    const results = await db
      .update(perDiemPolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(perDiemPolicies.id, id))
      .returning();
    return results[0];
  }

  async deletePerDiemPolicy(id: string): Promise<void> {
    await db.delete(perDiemPolicies).where(eq(perDiemPolicies.id, id));
  }

  // Mileage Rate Operations
  async listMileageRates(): Promise<MileageRate[]> {
    return await db
      .select()
      .from(mileageRates)
      .orderBy(desc(mileageRates.effectiveDate));
  }

  async getMileageRate(id: string): Promise<MileageRate | undefined> {
    const results = await db
      .select()
      .from(mileageRates)
      .where(eq(mileageRates.id, id));
    return results[0];
  }

  async createMileageRate(rate: InsertMileageRate): Promise<MileageRate> {
    const results = await db.insert(mileageRates).values(rate).returning();
    return results[0];
  }

  async updateMileageRate(id: string, data: Partial<InsertMileageRate>): Promise<MileageRate | undefined> {
    const results = await db
      .update(mileageRates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(mileageRates.id, id))
      .returning();
    return results[0];
  }

  async deleteMileageRate(id: string): Promise<void> {
    await db.delete(mileageRates).where(eq(mileageRates.id, id));
  }

  // Expense Operations
  async listExpenses(filters?: {
    consultantId?: string;
    projectId?: string;
    status?: string;
    category?: string;
  }): Promise<ExpenseWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(expenses.consultantId, filters.consultantId));
    if (filters?.projectId) conditions.push(eq(expenses.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(expenses.status, filters.status as any));
    if (filters?.category) conditions.push(eq(expenses.category, filters.category as any));

    const results = conditions.length > 0
      ? await db.select().from(expenses).where(and(...conditions)).orderBy(desc(expenses.createdAt))
      : await db.select().from(expenses).orderBy(desc(expenses.createdAt));

    return Promise.all(results.map((e) => this.buildExpenseWithDetails(e)));
  }

  async getExpense(id: string): Promise<ExpenseWithDetails | undefined> {
    const results = await db.select().from(expenses).where(eq(expenses.id, id));
    if (!results[0]) return undefined;
    return this.buildExpenseWithDetails(results[0]);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const results = await db.insert(expenses).values(expense).returning();
    return results[0];
  }

  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    const results = await db
      .update(expenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return results[0];
  }

  async submitExpense(id: string): Promise<Expense | undefined> {
    const results = await db
      .update(expenses)
      .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return results[0];
  }

  async approveExpense(id: string, reviewerId: string): Promise<Expense | undefined> {
    const results = await db
      .update(expenses)
      .set({
        status: "approved",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();
    return results[0];
  }

  async rejectExpense(id: string, reviewerId: string, reason?: string): Promise<Expense | undefined> {
    const results = await db
      .update(expenses)
      .set({
        status: "rejected",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();
    return results[0];
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getExpenseAnalytics(): Promise<ExpenseAnalytics> {
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses);

    const pendingResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(eq(expenses.status, "submitted"));

    const totalAmountResult = await db
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.totalAmount}), 0)` })
      .from(expenses);

    const byCategoryResults = await db
      .select({
        category: expenses.category,
        count: sql<number>`count(*)`,
        amount: sql<string>`COALESCE(SUM(${expenses.totalAmount}), 0)`,
      })
      .from(expenses)
      .groupBy(expenses.category);

    const byStatusResults = await db
      .select({
        status: expenses.status,
        count: sql<number>`count(*)`,
        amount: sql<string>`COALESCE(SUM(${expenses.totalAmount}), 0)`,
      })
      .from(expenses)
      .groupBy(expenses.status);

    return {
      totalExpenses: Number(totalResult[0]?.count) || 0,
      pendingApproval: Number(pendingResult[0]?.count) || 0,
      totalAmount: totalAmountResult[0]?.sum || "0",
      byCategory: byCategoryResults.map((r) => ({
        category: r.category,
        count: Number(r.count) || 0,
        amount: r.amount || "0",
      })),
      byStatus: byStatusResults.map((r) => ({
        status: r.status,
        count: Number(r.count) || 0,
        amount: r.amount || "0",
      })),
    };
  }

  private async buildExpenseWithDetails(expense: Expense): Promise<ExpenseWithDetails> {
    const consultant = await this.getConsultant(expense.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;
    
    let projectData: ExpenseWithDetails["project"] = null;
    if (expense.projectId) {
      const project = await this.getProject(expense.projectId);
      if (project) {
        projectData = { id: project.id, name: project.name };
      }
    }

    let reviewerData: ExpenseWithDetails["reviewer"] = null;
    if (expense.reviewedById) {
      const reviewer = await this.getUser(expense.reviewedById);
      if (reviewer) {
        reviewerData = {
          id: reviewer.id,
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
        };
      }
    }

    return {
      ...expense,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      project: projectData,
      reviewer: reviewerData,
    };
  }

  // Invoice Template Operations
  async listInvoiceTemplates(): Promise<InvoiceTemplate[]> {
    return await db
      .select()
      .from(invoiceTemplates)
      .orderBy(desc(invoiceTemplates.createdAt));
  }

  async getInvoiceTemplate(id: string): Promise<InvoiceTemplate | undefined> {
    const results = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.id, id));
    return results[0];
  }

  async createInvoiceTemplate(template: InsertInvoiceTemplate): Promise<InvoiceTemplate> {
    const results = await db.insert(invoiceTemplates).values(template).returning();
    return results[0];
  }

  async updateInvoiceTemplate(id: string, data: Partial<InsertInvoiceTemplate>): Promise<InvoiceTemplate | undefined> {
    const results = await db
      .update(invoiceTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoiceTemplates.id, id))
      .returning();
    return results[0];
  }

  async deleteInvoiceTemplate(id: string): Promise<void> {
    await db.delete(invoiceTemplates).where(eq(invoiceTemplates.id, id));
  }

  // Invoice Operations
  async listInvoices(filters?: {
    projectId?: string;
    hospitalId?: string;
    status?: string;
  }): Promise<InvoiceWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(invoices.projectId, filters.projectId));
    if (filters?.hospitalId) conditions.push(eq(invoices.hospitalId, filters.hospitalId));
    if (filters?.status) conditions.push(eq(invoices.status, filters.status as any));

    const results = conditions.length > 0
      ? await db.select().from(invoices).where(and(...conditions)).orderBy(desc(invoices.createdAt))
      : await db.select().from(invoices).orderBy(desc(invoices.createdAt));

    return Promise.all(results.map((inv) => this.buildInvoiceWithDetails(inv)));
  }

  async getInvoice(id: string): Promise<InvoiceWithDetails | undefined> {
    const results = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!results[0]) return undefined;
    return this.buildInvoiceWithDetails(results[0]);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const results = await db.insert(invoices).values(invoice).returning();
    return results[0];
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const results = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return results[0];
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  async generateInvoiceFromTimesheet(timesheetId: string, templateId?: string): Promise<Invoice | undefined> {
    const timesheet = await this.getTimesheet(timesheetId);
    if (!timesheet) return undefined;

    const consultant = await this.getConsultant(timesheet.consultantId);
    if (!consultant) return undefined;

    const project = timesheet.projectId ? await this.getProject(timesheet.projectId) : null;
    const payRate = await this.getCurrentPayRate(timesheet.consultantId);
    const hourlyRate = payRate?.hourlyRate || "0";
    const totalHours = timesheet.totalHours || "0";
    const subtotal = (parseFloat(totalHours) * parseFloat(hourlyRate)).toFixed(2);

    const invoiceNumber = `INV-${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceData: InsertInvoice = {
      projectId: timesheet.projectId || null,
      hospitalId: project?.hospitalId || null,
      templateId: templateId || null,
      invoiceNumber,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "draft",
      subtotal,
      taxRate: "0",
      taxAmount: "0",
      totalAmount: subtotal,
      notes: `Generated from timesheet for week of ${timesheet.weekStartDate}`,
    };

    const invoice = await this.createInvoice(invoiceData);

    await this.createInvoiceLineItem({
      invoiceId: invoice.id,
      description: `Consulting services - Week of ${timesheet.weekStartDate}`,
      quantity: totalHours,
      unitPrice: hourlyRate,
      amount: subtotal,
      itemType: "labor",
    });

    return invoice;
  }

  private async buildInvoiceWithDetails(invoice: Invoice): Promise<InvoiceWithDetails> {
    let projectData: InvoiceWithDetails["project"] = null;
    if (invoice.projectId) {
      const project = await this.getProject(invoice.projectId);
      if (project) {
        projectData = { id: project.id, name: project.name };
      }
    }

    let hospitalData: InvoiceWithDetails["hospital"] = null;
    if (invoice.hospitalId) {
      const hospital = await this.getHospital(invoice.hospitalId);
      if (hospital) {
        hospitalData = { id: hospital.id, name: hospital.name };
      }
    }

    let templateData: InvoiceTemplate | null = null;
    if (invoice.templateId) {
      templateData = (await this.getInvoiceTemplate(invoice.templateId)) || null;
    }

    const lineItems = await this.listInvoiceLineItems(invoice.id);

    let creatorData: InvoiceWithDetails["creator"] = null;
    if (invoice.createdBy) {
      const creator = await this.getUser(invoice.createdBy);
      if (creator) {
        creatorData = {
          id: creator.id,
          firstName: creator.firstName,
          lastName: creator.lastName,
        };
      }
    }

    return {
      ...invoice,
      project: projectData,
      hospital: hospitalData,
      template: templateData,
      lineItems,
      creator: creatorData,
    };
  }

  // Invoice Line Item Operations
  async listInvoiceLineItems(invoiceId: string): Promise<InvoiceLineItem[]> {
    return await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId))
      .orderBy(asc(invoiceLineItems.createdAt));
  }

  async createInvoiceLineItem(item: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    const results = await db.insert(invoiceLineItems).values(item).returning();
    return results[0];
  }

  async updateInvoiceLineItem(id: string, data: Partial<InsertInvoiceLineItem>): Promise<InvoiceLineItem | undefined> {
    const results = await db
      .update(invoiceLineItems)
      .set(data)
      .where(eq(invoiceLineItems.id, id))
      .returning();
    return results[0];
  }

  async deleteInvoiceLineItem(id: string): Promise<void> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id));
  }

  // Pay Rate Operations
  async listPayRates(consultantId?: string): Promise<PayRate[]> {
    if (consultantId) {
      return await db
        .select()
        .from(payRates)
        .where(eq(payRates.consultantId, consultantId))
        .orderBy(desc(payRates.effectiveDate));
    }
    return await db
      .select()
      .from(payRates)
      .orderBy(desc(payRates.effectiveDate));
  }

  async getPayRate(id: string): Promise<PayRate | undefined> {
    const results = await db.select().from(payRates).where(eq(payRates.id, id));
    return results[0];
  }

  async createPayRate(rate: InsertPayRate): Promise<PayRate> {
    const results = await db.insert(payRates).values(rate).returning();
    return results[0];
  }

  async updatePayRate(id: string, data: Partial<InsertPayRate>): Promise<PayRate | undefined> {
    const results = await db
      .update(payRates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payRates.id, id))
      .returning();
    return results[0];
  }

  async getCurrentPayRate(consultantId: string): Promise<PayRate | undefined> {
    const today = new Date().toISOString().split("T")[0];
    const results = await db
      .select()
      .from(payRates)
      .where(
        and(
          eq(payRates.consultantId, consultantId),
          eq(payRates.isActive, true),
          lte(payRates.effectiveDate, today)
        )
      )
      .orderBy(desc(payRates.effectiveDate))
      .limit(1);
    return results[0];
  }

  // Payroll Batch Operations
  async listPayrollBatches(filters?: {
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  }): Promise<PayrollBatchWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.status) conditions.push(eq(payrollBatches.status, filters.status as any));
    if (filters?.periodStart) conditions.push(gte(payrollBatches.periodStart, filters.periodStart));
    if (filters?.periodEnd) conditions.push(lte(payrollBatches.periodEnd, filters.periodEnd));

    const results = conditions.length > 0
      ? await db.select().from(payrollBatches).where(and(...conditions)).orderBy(desc(payrollBatches.createdAt))
      : await db.select().from(payrollBatches).orderBy(desc(payrollBatches.createdAt));

    return Promise.all(results.map((batch) => this.buildPayrollBatchWithDetails(batch)));
  }

  async getPayrollBatch(id: string): Promise<PayrollBatchWithDetails | undefined> {
    const results = await db.select().from(payrollBatches).where(eq(payrollBatches.id, id));
    if (!results[0]) return undefined;
    return this.buildPayrollBatchWithDetails(results[0]);
  }

  async createPayrollBatch(batch: InsertPayrollBatch): Promise<PayrollBatch> {
    const batchNumber = `PB-${Date.now()}`;
    const results = await db.insert(payrollBatches).values({ ...batch, batchNumber }).returning();
    return results[0];
  }

  async updatePayrollBatch(id: string, data: Partial<InsertPayrollBatch>): Promise<PayrollBatch | undefined> {
    const results = await db
      .update(payrollBatches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payrollBatches.id, id))
      .returning();
    return results[0];
  }

  async approvePayrollBatch(id: string, approverId: string): Promise<PayrollBatch | undefined> {
    const results = await db
      .update(payrollBatches)
      .set({
        status: "approved",
        approvedBy: approverId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payrollBatches.id, id))
      .returning();
    return results[0];
  }

  async processPayrollBatch(id: string): Promise<PayrollBatch | undefined> {
    const results = await db
      .update(payrollBatches)
      .set({
        status: "processing",
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payrollBatches.id, id))
      .returning();
    return results[0];
  }

  private async buildPayrollBatchWithDetails(batch: PayrollBatch): Promise<PayrollBatchWithDetails> {
    const entries = await this.listPayrollEntries(batch.id);

    let approverData: PayrollBatchWithDetails["approver"] = null;
    if (batch.approvedBy) {
      const approver = await this.getUser(batch.approvedBy);
      if (approver) {
        approverData = {
          id: approver.id,
          firstName: approver.firstName,
          lastName: approver.lastName,
        };
      }
    }

    let creatorData: PayrollBatchWithDetails["creator"] = null;
    if (batch.createdBy) {
      const creator = await this.getUser(batch.createdBy);
      if (creator) {
        creatorData = {
          id: creator.id,
          firstName: creator.firstName,
          lastName: creator.lastName,
        };
      }
    }

    return {
      ...batch,
      entries,
      approver: approverData,
      creator: creatorData,
    };
  }

  // Payroll Entry Operations
  async listPayrollEntries(batchId: string): Promise<PayrollEntryWithDetails[]> {
    const results = await db
      .select()
      .from(payrollEntries)
      .where(eq(payrollEntries.batchId, batchId));
    return Promise.all(results.map((entry) => this.buildPayrollEntryWithDetails(entry)));
  }

  async createPayrollEntry(entry: InsertPayrollEntry): Promise<PayrollEntry> {
    const results = await db.insert(payrollEntries).values(entry).returning();
    return results[0];
  }

  async updatePayrollEntry(id: string, data: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined> {
    const results = await db
      .update(payrollEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payrollEntries.id, id))
      .returning();
    return results[0];
  }

  private async buildPayrollEntryWithDetails(entry: PayrollEntry): Promise<PayrollEntryWithDetails> {
    const consultant = await this.getConsultant(entry.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;

    let timesheetData: PayrollEntryWithDetails["timesheet"] = null;
    if (entry.timesheetId) {
      const timesheet = await this.getTimesheet(entry.timesheetId);
      if (timesheet) {
        timesheetData = {
          id: timesheet.id,
          weekStartDate: timesheet.weekStartDate,
        };
      }
    }

    return {
      ...entry,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      timesheet: timesheetData,
    };
  }

  // Paycheck Stub Operations
  async listPaycheckStubs(consultantId: string): Promise<PaycheckStubWithDetails[]> {
    const results = await db
      .select()
      .from(paycheckStubs)
      .where(eq(paycheckStubs.consultantId, consultantId))
      .orderBy(desc(paycheckStubs.payDate));
    return Promise.all(results.map((stub) => this.buildPaycheckStubWithDetails(stub)));
  }

  async getPaycheckStub(id: string): Promise<PaycheckStubWithDetails | undefined> {
    const results = await db.select().from(paycheckStubs).where(eq(paycheckStubs.id, id));
    if (!results[0]) return undefined;
    return this.buildPaycheckStubWithDetails(results[0]);
  }

  async createPaycheckStub(stub: InsertPaycheckStub): Promise<PaycheckStub> {
    const results = await db.insert(paycheckStubs).values(stub).returning();
    return results[0];
  }

  private async buildPaycheckStubWithDetails(stub: PaycheckStub): Promise<PaycheckStubWithDetails> {
    const consultant = await this.getConsultant(stub.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;

    return {
      ...stub,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
    };
  }

  // Payroll Analytics
  async getPayrollAnalytics(): Promise<PayrollAnalytics> {
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payrollBatches);

    const pendingResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(payrollBatches)
      .where(or(
        eq(payrollBatches.status, "draft"),
        eq(payrollBatches.status, "submitted"),
        eq(payrollBatches.status, "approved")
      ));

    const paidAmountResult = await db
      .select({ sum: sql<string>`COALESCE(SUM(${payrollBatches.totalAmount}), 0)` })
      .from(payrollBatches)
      .where(eq(payrollBatches.status, "paid"));

    const avgPayResult = await db
      .select({ avg: sql<string>`COALESCE(AVG(${payrollEntries.totalPay}), 0)` })
      .from(payrollEntries);

    const recentBatchesResults = await db
      .select()
      .from(payrollBatches)
      .orderBy(desc(payrollBatches.createdAt))
      .limit(5);

    const recentBatches = await Promise.all(
      recentBatchesResults.map((batch) => this.buildPayrollBatchWithDetails(batch))
    );

    return {
      totalBatches: Number(totalResult[0]?.count) || 0,
      pendingBatches: Number(pendingResult[0]?.count) || 0,
      totalPaidAmount: paidAmountResult[0]?.sum || "0",
      averagePayPerConsultant: avgPayResult[0]?.avg || "0",
      recentBatches,
    };
  }

  // Budget Scenario Operations
  async listBudgetScenarios(projectId?: string): Promise<BudgetScenarioWithMetrics[]> {
    const results = projectId
      ? await db
          .select()
          .from(budgetScenarios)
          .where(eq(budgetScenarios.projectId, projectId))
          .orderBy(desc(budgetScenarios.createdAt))
      : await db
          .select()
          .from(budgetScenarios)
          .orderBy(desc(budgetScenarios.createdAt));

    return Promise.all(results.map((scenario) => this.buildBudgetScenarioWithMetrics(scenario)));
  }

  async getBudgetScenario(id: string): Promise<BudgetScenarioWithMetrics | undefined> {
    const results = await db.select().from(budgetScenarios).where(eq(budgetScenarios.id, id));
    if (!results[0]) return undefined;
    return this.buildBudgetScenarioWithMetrics(results[0]);
  }

  async createBudgetScenario(scenario: InsertBudgetScenario): Promise<BudgetScenario> {
    const results = await db.insert(budgetScenarios).values(scenario).returning();
    return results[0];
  }

  async updateBudgetScenario(id: string, data: Partial<InsertBudgetScenario>): Promise<BudgetScenario | undefined> {
    const results = await db
      .update(budgetScenarios)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgetScenarios.id, id))
      .returning();
    return results[0];
  }

  async deleteBudgetScenario(id: string): Promise<void> {
    await db.delete(scenarioMetrics).where(eq(scenarioMetrics.scenarioId, id));
    await db.delete(budgetScenarios).where(eq(budgetScenarios.id, id));
  }

  async cloneScenario(id: string, newName: string): Promise<BudgetScenario | undefined> {
    const original = await db.select().from(budgetScenarios).where(eq(budgetScenarios.id, id));
    if (!original[0]) return undefined;

    const { id: _, createdAt, updatedAt, ...rest } = original[0];
    const clonedScenario = await this.createBudgetScenario({
      ...rest,
      name: newName,
      isBaseline: false,
    });

    const originalMetrics = await this.listScenarioMetrics(id);
    for (const metric of originalMetrics) {
      const { id: __, scenarioId, createdAt: ___, ...metricRest } = metric;
      await this.createScenarioMetric({
        ...metricRest,
        scenarioId: clonedScenario.id,
      });
    }

    return clonedScenario;
  }

  private async buildBudgetScenarioWithMetrics(scenario: BudgetScenario): Promise<BudgetScenarioWithMetrics> {
    let projectData: BudgetScenarioWithMetrics["project"] = null;
    if (scenario.projectId) {
      const project = await this.getProject(scenario.projectId);
      if (project) {
        projectData = { id: project.id, name: project.name };
      }
    }

    const metrics = await this.listScenarioMetrics(scenario.id);

    let creatorData: BudgetScenarioWithMetrics["creator"] = null;
    if (scenario.createdBy) {
      const creator = await this.getUser(scenario.createdBy);
      if (creator) {
        creatorData = {
          id: creator.id,
          firstName: creator.firstName,
          lastName: creator.lastName,
        };
      }
    }

    return {
      ...scenario,
      project: projectData,
      metrics,
      creator: creatorData,
    };
  }

  // Scenario Metric Operations
  async listScenarioMetrics(scenarioId: string): Promise<ScenarioMetric[]> {
    return await db
      .select()
      .from(scenarioMetrics)
      .where(eq(scenarioMetrics.scenarioId, scenarioId))
      .orderBy(asc(scenarioMetrics.metricDate));
  }

  async createScenarioMetric(metric: InsertScenarioMetric): Promise<ScenarioMetric> {
    const results = await db.insert(scenarioMetrics).values(metric).returning();
    return results[0];
  }

  async updateScenarioMetric(id: string, data: Partial<InsertScenarioMetric>): Promise<ScenarioMetric | undefined> {
    const results = await db
      .update(scenarioMetrics)
      .set(data)
      .where(eq(scenarioMetrics.id, id))
      .returning();
    return results[0];
  }

  // ============================================
  // PHASE 14: TRAVEL MANAGEMENT IMPLEMENTATIONS
  // ============================================

  // Travel Preferences Operations
  async getTravelPreferences(consultantId: string): Promise<TravelPreference | undefined> {
    const results = await db
      .select()
      .from(travelPreferences)
      .where(eq(travelPreferences.consultantId, consultantId));
    return results[0];
  }

  async upsertTravelPreferences(data: InsertTravelPreference): Promise<TravelPreference> {
    const existing = await this.getTravelPreferences(data.consultantId);
    if (existing) {
      const results = await db
        .update(travelPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(travelPreferences.consultantId, data.consultantId))
        .returning();
      return results[0];
    }
    const results = await db.insert(travelPreferences).values(data).returning();
    return results[0];
  }

  async updateTravelPreferences(consultantId: string, data: Partial<InsertTravelPreference>): Promise<TravelPreference | undefined> {
    const results = await db
      .update(travelPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(travelPreferences.consultantId, consultantId))
      .returning();
    return results[0];
  }

  // Travel Booking Operations
  async listTravelBookings(filters?: {
    consultantId?: string;
    projectId?: string;
    bookingType?: string;
    status?: string;
  }): Promise<TravelBookingWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(travelBookings.consultantId, filters.consultantId));
    if (filters?.projectId) conditions.push(eq(travelBookings.projectId, filters.projectId));
    if (filters?.bookingType) conditions.push(eq(travelBookings.bookingType, filters.bookingType as any));
    if (filters?.status) conditions.push(eq(travelBookings.status, filters.status as any));

    const results = conditions.length > 0
      ? await db.select().from(travelBookings).where(and(...conditions)).orderBy(desc(travelBookings.createdAt))
      : await db.select().from(travelBookings).orderBy(desc(travelBookings.createdAt));

    return Promise.all(results.map((b) => this.buildTravelBookingWithDetails(b)));
  }

  async getTravelBooking(id: string): Promise<TravelBookingWithDetails | undefined> {
    const results = await db.select().from(travelBookings).where(eq(travelBookings.id, id));
    if (!results[0]) return undefined;
    return this.buildTravelBookingWithDetails(results[0]);
  }

  async createTravelBooking(booking: InsertTravelBooking): Promise<TravelBooking> {
    const results = await db.insert(travelBookings).values(booking).returning();
    return results[0];
  }

  async updateTravelBooking(id: string, data: Partial<InsertTravelBooking>): Promise<TravelBooking | undefined> {
    const results = await db
      .update(travelBookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(travelBookings.id, id))
      .returning();
    return results[0];
  }

  async deleteTravelBooking(id: string): Promise<boolean> {
    await db.delete(itineraryBookings).where(eq(itineraryBookings.bookingId, id));
    const result = await db.delete(travelBookings).where(eq(travelBookings.id, id));
    return true;
  }

  private async buildTravelBookingWithDetails(booking: TravelBooking): Promise<TravelBookingWithDetails> {
    const consultant = await this.getConsultant(booking.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;

    let projectData: TravelBookingWithDetails["project"] = null;
    if (booking.projectId) {
      const project = await this.getProject(booking.projectId);
      if (project) {
        projectData = { id: project.id, name: project.name };
      }
    }

    let bookedByData: TravelBookingWithDetails["bookedBy"] = null;
    if (booking.bookedById) {
      const bookedBy = await this.getUser(booking.bookedById);
      if (bookedBy) {
        bookedByData = {
          id: bookedBy.id,
          firstName: bookedBy.firstName,
          lastName: bookedBy.lastName,
        };
      }
    }

    return {
      ...booking,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      project: projectData,
      bookedBy: bookedByData,
    };
  }

  // Travel Itinerary Operations
  async listTravelItineraries(filters?: {
    consultantId?: string;
    projectId?: string;
    status?: string;
  }): Promise<TravelItineraryWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(travelItineraries.consultantId, filters.consultantId));
    if (filters?.projectId) conditions.push(eq(travelItineraries.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(travelItineraries.status, filters.status as any));

    const results = conditions.length > 0
      ? await db.select().from(travelItineraries).where(and(...conditions)).orderBy(desc(travelItineraries.startDate))
      : await db.select().from(travelItineraries).orderBy(desc(travelItineraries.startDate));

    return Promise.all(results.map((i) => this.buildTravelItineraryWithDetails(i)));
  }

  async getTravelItinerary(id: string): Promise<TravelItineraryWithDetails | undefined> {
    const results = await db.select().from(travelItineraries).where(eq(travelItineraries.id, id));
    if (!results[0]) return undefined;
    return this.buildTravelItineraryWithDetails(results[0]);
  }

  async createTravelItinerary(itinerary: InsertTravelItinerary): Promise<TravelItinerary> {
    const results = await db.insert(travelItineraries).values(itinerary).returning();
    return results[0];
  }

  async updateTravelItinerary(id: string, data: Partial<InsertTravelItinerary>): Promise<TravelItinerary | undefined> {
    const results = await db
      .update(travelItineraries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(travelItineraries.id, id))
      .returning();
    return results[0];
  }

  async deleteTravelItinerary(id: string): Promise<boolean> {
    await db.delete(itineraryBookings).where(eq(itineraryBookings.itineraryId, id));
    await db.delete(travelItineraries).where(eq(travelItineraries.id, id));
    return true;
  }

  async addBookingToItinerary(data: InsertItineraryBooking): Promise<ItineraryBooking> {
    const results = await db.insert(itineraryBookings).values(data).returning();
    return results[0];
  }

  async removeBookingFromItinerary(itineraryId: string, bookingId: string): Promise<boolean> {
    await db
      .delete(itineraryBookings)
      .where(and(eq(itineraryBookings.itineraryId, itineraryId), eq(itineraryBookings.bookingId, bookingId)));
    return true;
  }

  private async buildTravelItineraryWithDetails(itinerary: TravelItinerary): Promise<TravelItineraryWithDetails> {
    const consultant = await this.getConsultant(itinerary.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;

    let projectData: TravelItineraryWithDetails["project"] = null;
    if (itinerary.projectId) {
      const project = await this.getProject(itinerary.projectId);
      if (project) {
        projectData = { id: project.id, name: project.name };
      }
    }

    let createdByData: TravelItineraryWithDetails["createdBy"] = null;
    if (itinerary.createdById) {
      const createdBy = await this.getUser(itinerary.createdById);
      if (createdBy) {
        createdByData = {
          id: createdBy.id,
          firstName: createdBy.firstName,
          lastName: createdBy.lastName,
        };
      }
    }

    const itineraryBookingsResults = await db
      .select()
      .from(itineraryBookings)
      .where(eq(itineraryBookings.itineraryId, itinerary.id))
      .orderBy(asc(itineraryBookings.sequenceOrder));

    const bookings: TravelBookingWithDetails[] = [];
    for (const ib of itineraryBookingsResults) {
      const booking = await this.getTravelBooking(ib.bookingId);
      if (booking) {
        bookings.push(booking);
      }
    }

    return {
      ...itinerary,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      project: projectData,
      createdBy: createdByData,
      bookings,
    };
  }

  // Carpool Group Operations
  async listCarpoolGroups(filters?: {
    projectId?: string;
    status?: string;
    driverId?: string;
  }): Promise<CarpoolGroupWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(carpoolGroups.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(carpoolGroups.status, filters.status as any));
    if (filters?.driverId) conditions.push(eq(carpoolGroups.driverId, filters.driverId));

    const results = conditions.length > 0
      ? await db.select().from(carpoolGroups).where(and(...conditions)).orderBy(desc(carpoolGroups.departureDate))
      : await db.select().from(carpoolGroups).orderBy(desc(carpoolGroups.departureDate));

    return Promise.all(results.map((g) => this.buildCarpoolGroupWithDetails(g)));
  }

  async getCarpoolGroup(id: string): Promise<CarpoolGroupWithDetails | undefined> {
    const results = await db.select().from(carpoolGroups).where(eq(carpoolGroups.id, id));
    if (!results[0]) return undefined;
    return this.buildCarpoolGroupWithDetails(results[0]);
  }

  async createCarpoolGroup(group: InsertCarpoolGroup): Promise<CarpoolGroup> {
    const results = await db.insert(carpoolGroups).values(group).returning();
    return results[0];
  }

  async updateCarpoolGroup(id: string, data: Partial<InsertCarpoolGroup>): Promise<CarpoolGroup | undefined> {
    const results = await db
      .update(carpoolGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carpoolGroups.id, id))
      .returning();
    return results[0];
  }

  async deleteCarpoolGroup(id: string): Promise<boolean> {
    await db.delete(carpoolMembers).where(eq(carpoolMembers.carpoolId, id));
    await db.delete(carpoolGroups).where(eq(carpoolGroups.id, id));
    return true;
  }

  // Carpool Member Operations
  async addCarpoolMember(data: InsertCarpoolMember): Promise<CarpoolMember> {
    const results = await db.insert(carpoolMembers).values(data).returning();
    return results[0];
  }

  async updateCarpoolMember(id: string, data: Partial<InsertCarpoolMember>): Promise<CarpoolMember | undefined> {
    const results = await db
      .update(carpoolMembers)
      .set(data)
      .where(eq(carpoolMembers.id, id))
      .returning();
    return results[0];
  }

  async removeCarpoolMember(id: string): Promise<boolean> {
    await db.delete(carpoolMembers).where(eq(carpoolMembers.id, id));
    return true;
  }

  async listCarpoolMembers(carpoolId: string): Promise<CarpoolMemberWithDetails[]> {
    const results = await db
      .select()
      .from(carpoolMembers)
      .where(eq(carpoolMembers.carpoolId, carpoolId));

    return Promise.all(results.map((m) => this.buildCarpoolMemberWithDetails(m)));
  }

  async getAvailableCarpools(projectId: string, date: string): Promise<CarpoolGroupWithDetails[]> {
    const results = await db
      .select()
      .from(carpoolGroups)
      .where(
        and(
          eq(carpoolGroups.projectId, projectId),
          eq(carpoolGroups.departureDate, date),
          eq(carpoolGroups.status, "open")
        )
      )
      .orderBy(asc(carpoolGroups.departureTime));

    return Promise.all(results.map((g) => this.buildCarpoolGroupWithDetails(g)));
  }

  private async buildCarpoolGroupWithDetails(group: CarpoolGroup): Promise<CarpoolGroupWithDetails> {
    const project = await this.getProject(group.projectId);

    let driverData: CarpoolGroupWithDetails["driver"] = null;
    if (group.driverId) {
      const driver = await this.getConsultant(group.driverId);
      const driverUser = driver ? await this.getUser(driver.userId) : null;
      if (driver) {
        driverData = {
          id: driver.id,
          user: {
            firstName: driverUser?.firstName || null,
            lastName: driverUser?.lastName || null,
          },
        };
      }
    }

    const members = await this.listCarpoolMembers(group.id);

    return {
      ...group,
      project: {
        id: project?.id || "",
        name: project?.name || "Unknown",
      },
      driver: driverData,
      members,
    };
  }

  private async buildCarpoolMemberWithDetails(member: CarpoolMember): Promise<CarpoolMemberWithDetails> {
    const consultant = await this.getConsultant(member.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;

    return {
      ...member,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
    };
  }

  // Shuttle Schedule Operations
  async listShuttleSchedules(filters?: {
    projectId?: string;
    isActive?: boolean;
  }): Promise<ShuttleSchedule[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(shuttleSchedules.projectId, filters.projectId));
    if (filters?.isActive !== undefined) conditions.push(eq(shuttleSchedules.isActive, filters.isActive));

    const results = conditions.length > 0
      ? await db.select().from(shuttleSchedules).where(and(...conditions)).orderBy(asc(shuttleSchedules.departureTime))
      : await db.select().from(shuttleSchedules).orderBy(asc(shuttleSchedules.departureTime));

    return results;
  }

  async getShuttleSchedule(id: string): Promise<ShuttleSchedule | undefined> {
    const results = await db.select().from(shuttleSchedules).where(eq(shuttleSchedules.id, id));
    return results[0];
  }

  async createShuttleSchedule(schedule: InsertShuttleSchedule): Promise<ShuttleSchedule> {
    const results = await db.insert(shuttleSchedules).values(schedule).returning();
    return results[0];
  }

  async updateShuttleSchedule(id: string, data: Partial<InsertShuttleSchedule>): Promise<ShuttleSchedule | undefined> {
    const results = await db
      .update(shuttleSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shuttleSchedules.id, id))
      .returning();
    return results[0];
  }

  async deleteShuttleSchedule(id: string): Promise<boolean> {
    await db.delete(shuttleSchedules).where(eq(shuttleSchedules.id, id));
    return true;
  }

  // Transportation Contact Operations
  async listTransportationContacts(filters?: {
    projectId?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<TransportationContact[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(transportationContacts.projectId, filters.projectId));
    if (filters?.role) conditions.push(eq(transportationContacts.role, filters.role as any));
    if (filters?.isActive !== undefined) conditions.push(eq(transportationContacts.isActive, filters.isActive));

    const results = conditions.length > 0
      ? await db.select().from(transportationContacts).where(and(...conditions)).orderBy(asc(transportationContacts.name))
      : await db.select().from(transportationContacts).orderBy(asc(transportationContacts.name));

    return results;
  }

  async getTransportationContact(id: string): Promise<TransportationContact | undefined> {
    const results = await db.select().from(transportationContacts).where(eq(transportationContacts.id, id));
    return results[0];
  }

  async createTransportationContact(contact: InsertTransportationContact): Promise<TransportationContact> {
    const results = await db.insert(transportationContacts).values(contact).returning();
    return results[0];
  }

  async updateTransportationContact(id: string, data: Partial<InsertTransportationContact>): Promise<TransportationContact | undefined> {
    const results = await db
      .update(transportationContacts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(transportationContacts.id, id))
      .returning();
    return results[0];
  }

  async deleteTransportationContact(id: string): Promise<boolean> {
    await db.delete(transportationContacts).where(eq(transportationContacts.id, id));
    return true;
  }

  // Travel Analytics
  async getTravelAnalytics(filters?: { projectId?: string }): Promise<TravelAnalytics> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(travelBookings.projectId, filters.projectId));

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(travelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const pendingResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(travelBookings)
      .where(conditions.length > 0 
        ? and(...conditions, eq(travelBookings.status, "pending"))
        : eq(travelBookings.status, "pending"));

    const confirmedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(travelBookings)
      .where(conditions.length > 0
        ? and(...conditions, eq(travelBookings.status, "confirmed"))
        : eq(travelBookings.status, "confirmed"));

    const estimatedCostResult = await db
      .select({ sum: sql<string>`COALESCE(SUM(${travelBookings.estimatedCost}), 0)` })
      .from(travelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const actualCostResult = await db
      .select({ sum: sql<string>`COALESCE(SUM(${travelBookings.actualCost}), 0)` })
      .from(travelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const byTypeResults = await db
      .select({
        type: travelBookings.bookingType,
        count: sql<number>`count(*)`,
        cost: sql<string>`COALESCE(SUM(${travelBookings.estimatedCost}), 0)`,
      })
      .from(travelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(travelBookings.bookingType);

    const byStatusResults = await db
      .select({
        status: travelBookings.status,
        count: sql<number>`count(*)`,
      })
      .from(travelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(travelBookings.status);

    const today = new Date().toISOString().split("T")[0];
    const itineraryConditions: any[] = [];
    if (filters?.projectId) itineraryConditions.push(eq(travelItineraries.projectId, filters.projectId));
    itineraryConditions.push(gte(travelItineraries.startDate, today));

    const upcomingItinerariesResults = await db
      .select()
      .from(travelItineraries)
      .where(and(...itineraryConditions))
      .orderBy(asc(travelItineraries.startDate))
      .limit(10);

    const upcomingTrips = await Promise.all(
      upcomingItinerariesResults.map((i) => this.buildTravelItineraryWithDetails(i))
    );

    return {
      totalBookings: Number(totalResult[0]?.count) || 0,
      pendingBookings: Number(pendingResult[0]?.count) || 0,
      confirmedBookings: Number(confirmedResult[0]?.count) || 0,
      totalEstimatedCost: estimatedCostResult[0]?.sum || "0",
      totalActualCost: actualCostResult[0]?.sum || "0",
      bookingsByType: byTypeResults.map((r) => ({
        type: r.type,
        count: Number(r.count) || 0,
        cost: r.cost || "0",
      })),
      bookingsByStatus: byStatusResults.map((r) => ({
        status: r.status,
        count: Number(r.count) || 0,
      })),
      upcomingTrips,
    };
  }

  async getCarpoolAnalytics(filters?: { projectId?: string }): Promise<CarpoolAnalytics> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(carpoolGroups.projectId, filters.projectId));

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(carpoolGroups)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const openResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(carpoolGroups)
      .where(conditions.length > 0
        ? and(...conditions, eq(carpoolGroups.status, "open"))
        : eq(carpoolGroups.status, "open"));

    const totalMembersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(carpoolMembers);

    const byStatusResults = await db
      .select({
        status: carpoolGroups.status,
        count: sql<number>`count(*)`,
      })
      .from(carpoolGroups)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(carpoolGroups.status);

    const recentGroupsResults = await db
      .select()
      .from(carpoolGroups)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(carpoolGroups.createdAt))
      .limit(10);

    const recentGroups = await Promise.all(
      recentGroupsResults.map((g) => this.buildCarpoolGroupWithDetails(g))
    );

    return {
      totalGroups: Number(totalResult[0]?.count) || 0,
      openGroups: Number(openResult[0]?.count) || 0,
      totalMembers: Number(totalMembersResult[0]?.count) || 0,
      groupsByStatus: byStatusResults.map((r) => ({
        status: r.status,
        count: Number(r.count) || 0,
      })),
      recentGroups,
    };
  }
}

export const storage = new DatabaseStorage();
